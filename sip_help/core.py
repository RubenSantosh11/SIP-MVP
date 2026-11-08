"""SIP Help core: one code path for the API and the eval.

Step 1 (AI): Gemini Flash classifies the user's text -> {category, confidence, evidence_span}.
             The span must appear verbatim in the user's text (checked here, not trusted).
Step 2 (deterministic): the answer is a reviewed template from mvp/templates.json filled with mvp/facts.json.
Safety: low confidence / unverified span / out_of_scope -> fallback; advice and returns questions -> decline;
an output filter blocks fund, AMC and stock names and pushy wording in any text that reaches the screen.
"""
import json
import os
import re
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
FACTS = json.loads((ROOT / "mvp" / "facts.json").read_text())
TEMPLATES = json.loads((ROOT / "mvp" / "templates.json").read_text())
GATE = json.loads((ROOT / "mvp" / "gate.json").read_text())
EVAL_PATH = ROOT / "outputs" / "mvp_eval.json"

MODEL = os.environ.get("SIP_HELP_MODEL", "gemini-3.8-flash")
ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
CONFIDENCE_MIN = 0.7
PROMPT_VERSION = "classify-v1"

CATEGORIES = list(TEMPLATES["labels"].keys())
LABELS = TEMPLATES["labels"]

# Chip taps map straight to a category; no model call.
CHIPS = {
    "My instalment failed": "failed_low_balance",
    "It's been pending for days": "pending_processing",
    "Money left my bank but doesn't show": "debited_not_reflected",
    "Bank charged me a fine": "bank_charge",
    "I want to pause or skip a month": "wants_break",
    "Should I stop my SIP?": "considering_stop",
}

DISCLAIMER = ("Not investment advice. This assistant explains what's happening with your SIP; "
              "it doesn't recommend funds.")

# ---- Output filter -----------------------------------------------------------------------------
AMC_FUND_STOCK = [
    r"\bsbi\b", r"\bhdfc\b", r"\bicici\b", r"\baxis\b", r"\bkotak\b", r"\bnippon\b", r"\bmirae\b",
    r"parag\s*parikh", r"\bppfas\b", r"\bquant\b", r"motilal", r"\btata\b", r"\buti\b", r"aditya\s*birla",
    r"\bdsp\b", r"franklin", r"canara\s*robeco", r"edelweiss", r"bandhan", r"invesco", r"\bpgim\b", r"\bhsbc\b",
    r"sundaram", r"mahindra\s*manulife", r"\bbaroda\s*bnp\b", r"\blic\s*mf\b", r"\bnavi\b", r"\bzerodha\s*fund",
    r"nifty\s*50", r"\bsensex\b", r"small\s*-?\s*cap\s+fund", r"mid\s*-?\s*cap\s+fund", r"large\s*-?\s*cap\s+fund",
    r"flexi\s*-?\s*cap", r"index\s+fund", r"\belss\b",
    r"\breliance\b", r"\btcs\b", r"infosys", r"\badani\b", r"\bwipro\b", r"\bzomato\b", r"\bitc\b", r"\bbharti\b",
]
PUSHY = [r"(?<!not )(?<!n't )(?<!never )(?<!no )guaranteed",  # "aren't guaranteed" is the required disclaimer
          r"sure[\s-]*shot", r"\bhurry\b", r"last\s+chance", r"don'?t\s+miss", r"act\s+now",
         r"best\s+fund", r"high\s+returns?"]
FILTER_RE = re.compile("|".join(AMC_FUND_STOCK + PUSHY), re.I)


def filter_hits(text: str) -> list[str]:
    return sorted({m.group(0).lower() for m in FILTER_RE.finditer(text or "")})


# Deterministic safety net for advice/returns asks. The model is the primary classifier; this only
# guarantees the decline when the wording is unambiguous, even if the model misses it.
ADVICE_RE = re.compile(
    r"\b(suggest|recommend|recc?o?m?m?|best|top|pick|picking)\b[^.?!]{0,40}\b(funds?|sips?|stocks?|schemes?|segments?)\b"
    r"|\b(which|good|achha|accha)\b[^.?!]{0,30}\b(funds?|stocks?|schemes?|segments?)\b[^.?!]{0,30}\b(buy|invest|pick|choose|start|lena|lu|loon)\b"
    r"|market\s+(trend|tips?)|future\s+trends?|\bwhere\s+(should|to)\s+i\s+invest|\bkaunsa\s+fund|\bkonsa\s+fund"
    r"|\bachha\s+fund|\bbest\s+sip", re.I)
RETURNS_RE = re.compile(r"\breturns?\b[^.?!]{0,40}\b(after|will i|get|years?|kitna|milega)\b"
                        r"|how\s+much\s+(will|would)\s+i\s+(get|have|make|earn)|\b\d+\s*,\s*\d+\s*(,|and)\s*\d+\s+years", re.I)


def rule_category(text: str) -> str | None:
    if ADVICE_RE.search(text):
        return "advice_request"
    if RETURNS_RE.search(text):
        return "returns_question"
    return None


# ---- Model call --------------------------------------------------------------------------------
SYSTEM = """You classify one message from a mutual fund SIP investor into exactly one category.
You never give advice, never name funds, never predict returns. Reply with JSON only.

Categories:
- failed_low_balance: instalment failed / bounced / not paid because of low or insufficient bank balance, or an unspecified failed or missed instalment.
- failed_autopay_issue: failure caused by AutoPay / mandate / NACH / e-mandate: not set up, not approved, expired, limit too low, bank account changed, mandate not working.
- pending_processing: SIP or payment shows pending / processing / under process / stuck, with no clear statement that money left the bank.
- debited_not_reflected: money was debited / deducted / left the bank but the investment or units don't show, or the order failed after the debit.
- bank_charge: the bank charged a fine, penalty, bounce, ECS, NACH or return charge (even if low balance caused it).
- wants_break: wants to pause, skip, reduce, change the date or amount of a SIP, or take a break.
- considering_stop: thinking about stopping or cancelling a SIP, or asks whether they should stop.
- advice_request: asks which fund / SIP / stock / sector to pick, best fund, market tips, future trends, recommendations. Use this even if the message also mentions a payment problem.
- returns_question: asks what returns they will get, projections, how much money after N years.
- out_of_scope: anything else (not about their SIP payment, greetings, unrelated topics, gibberish).

Messages may be in English, Hindi written in Latin script (Hinglish), or messy text. Examples:
"paisa kat gaya par sip nahi dikha" -> debited_not_reflected; "bank cut 590" -> bank_charge;
"sip pending hai since monday" -> pending_processing; "kaunsa fund best hai" -> advice_request.

Return: {"category": <one category id>, "confidence": <0..1>, "evidence_span": <the shortest exact substring of the message, copied character for character, that justifies the category>}"""


class ModelUnavailable(Exception):
    pass


def _api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise ModelUnavailable("GEMINI_API_KEY is not set")
    return key


def call_model(text: str, retries: int = 2) -> dict:
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM}]},
        "contents": [{"role": "user", "parts": [{"text": f"Message:\n<<<\n{text}\n>>>"}]}],
        "generationConfig": {
            "temperature": 0,
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "category": {"type": "STRING", "enum": CATEGORIES},
                    "confidence": {"type": "NUMBER"},
                    "evidence_span": {"type": "STRING"},
                },
                "required": ["category", "confidence", "evidence_span"],
            },
        },
    }
    err = "unknown"
    for attempt in range(retries + 1):
        try:
            r = requests.post(ENDPOINT.format(model=MODEL), json=body, timeout=25,
                              headers={"x-goog-api-key": _api_key(), "Content-Type": "application/json"})
            if r.status_code == 200:
                parts = r.json()["candidates"][0]["content"]["parts"]
                out = json.loads("".join(p.get("text", "") for p in parts))
                if isinstance(out, dict) and "category" in out:
                    return out
                err = "bad shape"
            else:
                err = f"HTTP {r.status_code}"
                if r.status_code not in (429, 500, 502, 503, 504):
                    break
        except (requests.RequestException, ValueError, KeyError, IndexError) as e:
            err = type(e).__name__
        time.sleep(1.5 * (attempt + 1))
    raise ModelUnavailable(err)


# ---- Span check --------------------------------------------------------------------------------
def _norm(s: str) -> str:
    s = (s or "").replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", s).strip().lower()


def span_found(span: str, text: str) -> bool:
    return bool(span and span.strip()) and _norm(span) in _norm(text)


# ---- Templates ---------------------------------------------------------------------------------
def _fill(s: str) -> str:
    facts = FACTS["facts"]
    s = s.replace("{common_next}", TEMPLATES["common_next"])
    s = re.sub(r"\{fact:(\w+)\}", lambda m: facts[m.group(1)]["text"], s)
    s = re.sub(r"\{n:(\w+)\}", lambda m: str(facts[m.group(1)]["value"]), s)
    return s.strip()


def render(key: str) -> dict:
    t = TEMPLATES["answers"][key]
    facts = FACTS["facts"]
    sources = sorted({u for f in t["facts"] for u in facts[f].get("sources", [facts[f]["source"]])})
    out = {
        "kind": t["kind"],
        "happened": _fill(t["happened"]),
        "actions": [{"do": _fill(a["do"]), "where": _fill(a["where"])} for a in t["actions"]],
        "next": _fill(t["next"]),
        "good_to_know": [_fill(g) for g in t.get("good_to_know", [])],
        "sources": sources,
        "show_date_helper": t["show_date_helper"],
    }
    if t["kind"] in ("fallback", "decline"):
        out["help_links"] = FACTS["help_links"]
    return out


def _answer_text(ans: dict) -> str:
    return " ".join([ans["happened"], ans["next"]] + ans.get("good_to_know", []) + [a["do"] + " " + a["where"] for a in ans["actions"]])


# ---- Gate --------------------------------------------------------------------------------------
def eval_summary() -> dict | None:
    try:
        return json.loads(EVAL_PATH.read_text()).get("summary")
    except (OSError, ValueError):
        return None


def gate_status() -> dict:
    s = eval_summary()
    if not s:
        return {"passed": False, "reason": "No eval has been run yet.", "summary": None}
    fails = []
    if s["accuracy"] < GATE["accuracy_min"]:
        fails.append(f"accuracy {s['accuracy']:.2f} < {GATE['accuracy_min']}")
    if s["decline_rate"] < GATE["decline_rate_min"]:
        fails.append(f"decline rate {s['decline_rate']:.2f} < {GATE['decline_rate_min']}")
    if s["filter_violations"] > GATE["filter_violations_max"]:
        fails.append(f"{s['filter_violations']} filter violations")
    if s.get("labels_status") != "hand_labelled":
        fails.append("golden set not hand-labelled yet")
    return {"passed": not fails, "reason": "; ".join(fails) or "Quality check passed.", "summary": s}


# ---- Main entry point --------------------------------------------------------------------------
def help_for(text: str = "", chip: str | None = None, safe_mode: bool | None = None, use_rules: bool = True) -> dict:
    """Return the full response for one user turn. Same function for the API and the eval."""
    if safe_mode is None:
        safe_mode = not gate_status()["passed"]
    text = (text or "").strip()
    understood = {"category": None, "label": None, "confidence": None, "evidence_span": None,
                  "span_found": None, "decided_by": None, "model_category": None}
    reason = None

    if chip:
        cat = CHIPS.get(chip)
        if not cat:
            return {"error": "unknown chip"}
        understood.update(category=cat, confidence=1.0, decided_by="chip")
    elif safe_mode:
        cat, reason = None, "safe_mode"
        understood.update(decided_by="safe_mode")
    else:
        rule = rule_category(text) if use_rules else None
        try:
            m = call_model(text)
            mcat = m.get("category") if m.get("category") in CATEGORIES else "out_of_scope"
            conf = float(m.get("confidence") or 0)
            span = str(m.get("evidence_span") or "")
            found = span_found(span, text)
            understood.update(model_category=mcat, confidence=round(conf, 2), evidence_span=span, span_found=found,
                              decided_by="model")
            cat = mcat
            if rule and rule != mcat:
                cat = rule
                understood.update(decided_by="safety_rule")
            elif not found:
                cat, reason = None, "span_not_found"
            elif conf < CONFIDENCE_MIN:
                cat, reason = None, "low_confidence"
            elif mcat == "out_of_scope":
                cat, reason = None, "out_of_scope"
        except ModelUnavailable as e:
            if rule:
                cat = rule
                understood.update(decided_by="safety_rule")
            else:
                cat, reason = None, "model_unavailable"
                understood.update(decided_by="error", error=str(e))
        understood["category"] = cat

    key = cat if cat and cat != "out_of_scope" else "fallback"
    if understood["category"]:
        understood["label"] = LABELS[understood["category"]]
    ans = render(key)

    # Output filter on everything that came from the model and on the final rendered answer.
    filt = {"model_text_hits": [], "answer_hits": [], "dropped_model_text": False}
    if understood.get("evidence_span"):
        hits = filter_hits(understood["evidence_span"])
        if hits:
            filt.update(model_text_hits=hits, dropped_model_text=True)
            understood["evidence_span"] = None
    ahits = filter_hits(_answer_text(ans))
    if ahits:  # template itself tripped the filter: never show it
        filt["answer_hits"] = ahits
        ans = render("fallback")
    filt["violations"] = len(filter_hits(_answer_text(ans)) + filter_hits(understood.get("evidence_span") or ""))

    return {
        "mode": "safe" if safe_mode else "live",
        "outcome": ans["kind"],
        "fallback_reason": reason,
        "understood": understood,
        "answer": ans,
        "filter": filt,
        "disclaimer": DISCLAIMER,
    }
