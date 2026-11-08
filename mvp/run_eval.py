"""Run the golden set through the production code path (sip_help.core.help_for) and write
outputs/mvp_eval.json + outputs/mvp_eval_failures.csv. The API reads mvp_eval.json to decide safe mode.

Usage: GEMINI_API_KEY=... python mvp/run_eval.py
"""
import csv
import datetime as dt
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from sip_help import core  # noqa: E402

DECLINE = {"advice_request", "returns_question"}


def main() -> None:
    rows = list(csv.DictReader(open(ROOT / "mvp" / "golden_set.csv", encoding="utf-8")))
    status = json.loads((ROOT / "mvp" / "labels_status.json").read_text())
    cats = core.CATEGORIES
    items, conf = [], defaultdict(Counter)
    for r in rows:
        out = core.help_for(text=r["text"], safe_mode=False)  # same path as the live API, gate bypassed
        u = out["understood"]
        got = u["category"] or "out_of_scope"
        exp = r["expected_category"].strip()
        conf[exp][got] += 1
        items.append({
            "id": r["id"], "text": r["text"], "source": r["source"], "expected": exp, "got": got,
            "correct": got == exp, "outcome": out["outcome"], "fallback_reason": out["fallback_reason"],
            "model_category": u.get("model_category"), "confidence": u.get("confidence"),
            "evidence_span": u.get("evidence_span"), "span_found": u.get("span_found"),
            "decided_by": u.get("decided_by"), "filter": out["filter"], "notes": r.get("notes", ""),
        })
        print(f"{r['id']:4} {'OK ' if got == exp else 'XX '} exp={exp:22} got={got:22} "
              f"model={u.get('model_category')} conf={u.get('confidence')} by={u.get('decided_by')}")

    n = len(items)
    correct = sum(i["correct"] for i in items)
    dec_items = [i for i in items if i["expected"] in DECLINE]
    dec_ok = sum(i["outcome"] == "decline" for i in dec_items)
    fb = sum(i["outcome"] == "fallback" for i in items)
    violations = sum(i["filter"]["violations"] for i in items)
    caught = sum(bool(i["filter"]["model_text_hits"] or i["filter"]["answer_hits"]) for i in items)
    model_only = sum(i["model_category"] == i["expected"] for i in items)

    per_cat = {}
    for c in cats:
        tp = conf[c][c]
        pred = sum(conf[e][c] for e in conf)
        sup = sum(conf[c].values())
        per_cat[c] = {"support": sup, "predicted": pred,
                      "precision": round(tp / pred, 3) if pred else None,
                      "recall": round(tp / sup, 3) if sup else None}

    def why(i):
        if i["fallback_reason"]:
            return {"low_confidence": "confidence below 0.7", "span_not_found": "quote not found in message",
                    "out_of_scope": "model said out of scope", "model_unavailable": "model error"}.get(i["fallback_reason"], i["fallback_reason"])
        if i["decided_by"] == "safety_rule":
            return "safety rule overrode model"
        return "model picked another category"

    failures = [{**{k: i[k] for k in ("id", "text", "expected", "got", "model_category", "confidence",
                                      "evidence_span", "span_found", "decided_by", "fallback_reason", "notes")},
                 "why": why(i)} for i in items if not i["correct"]]
    gate = json.loads((ROOT / "mvp" / "gate.json").read_text())
    summary = {
        "n": n, "correct": correct, "accuracy": round(correct / n, 3),
        "decline_n": len(dec_items), "decline_ok": dec_ok, "decline_rate": round(dec_ok / len(dec_items), 3) if dec_items else 1.0,
        "fallback_n": fb, "fallback_rate": round(fb / n, 3),
        "filter_violations": violations, "filter_catches": caught,
        "model_only_correct": model_only, "model_only_accuracy": round(model_only / n, 3),
        "decided_by": dict(Counter(i["decided_by"] for i in items)),
        "labels_status": status.get("labels_status", "draft"),
    }
    summary["gate_passed"] = (summary["accuracy"] >= gate["accuracy_min"] and summary["decline_rate"] >= gate["decline_rate_min"]
                              and violations <= gate["filter_violations_max"] and summary["labels_status"] == "hand_labelled")
    out = {
        "run_at": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"), "model": core.MODEL,
        "prompt_version": core.PROMPT_VERSION, "confidence_min": core.CONFIDENCE_MIN,
        "labelled_by": status.get("labelled_by"), "summary": summary, "gate": gate, "per_category": per_cat,
        "confusion": {e: dict(conf[e]) for e in cats if conf[e]}, "failures": failures, "items": items,
        "corrections_note": status.get("corrections_note"),
    }
    (ROOT / "outputs").mkdir(exist_ok=True)
    (ROOT / "outputs" / "mvp_eval.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
    with open(ROOT / "outputs" / "mvp_eval_failures.csv", "w", newline="", encoding="utf-8") as f:
        cols = ["id", "text", "expected", "got", "why", "model_category", "confidence", "evidence_span",
                "span_found", "decided_by", "fallback_reason", "notes"]
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(failures)

    print(f"\naccuracy {correct}/{n} = {summary['accuracy']:.0%} (model alone {summary['model_only_accuracy']:.0%})")
    print(f"decline rate {dec_ok}/{len(dec_items)} | fallback {fb}/{n} | filter violations {violations} (caught {caught})")
    print("per category:", json.dumps(per_cat))
    print(f"labels: {summary['labels_status']} | GATE {'PASSED' if summary['gate_passed'] else 'NOT PASSED'}")


if __name__ == "__main__":
    main()
