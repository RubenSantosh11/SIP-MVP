"""Anonymous interaction log for user testing.

Every request is printed to the Vercel function log (short retention) and, if an Upstash Redis / Vercel KV
database is connected to the project, appended to the list "sip_help:log" (durable).
Personal details (PAN, phone, card/account numbers, emails) are removed before anything is stored.
Storing must never break the answer, so every error is swallowed.
"""
import json
import os
import re
import time

import requests

KEY = "sip_help:log"
_REDACT = [
    (re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b", re.I), "[PAN]"),
    (re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "[EMAIL]"),
    (re.compile(r"\b\d[\d -]{9,}\d\b"), "[NUMBER]"),       # phone, card, account numbers (10+ digits)
    (re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b", re.I), "[IFSC]"),
]


def redact(text: str) -> str:
    for rx, sub in _REDACT:
        text = rx.sub(sub, text or "")
    return text


def _redis():
    url = os.environ.get("KV_REST_API_URL") or os.environ.get("UPSTASH_REDIS_REST_URL")
    token = os.environ.get("KV_REST_API_TOKEN") or os.environ.get("UPSTASH_REDIS_REST_TOKEN")
    return (url.rstrip("/"), token) if url and token else (None, None)


def enabled() -> bool:
    return _redis()[0] is not None


def record(sid: str | None, text: str | None, chip: str | None, out: dict) -> None:
    try:
        u, a = out.get("understood", {}), out.get("answer", {})
        row = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "sid": (sid or "")[:40],
            "input_type": "chip" if chip else "text",
            "input": chip or redact(text or "")[:600],
            "mode": out.get("mode"),
            "outcome": out.get("outcome"),
            "category": u.get("category"),
            "label": u.get("label"),
            "confidence": u.get("confidence"),
            "evidence_span": redact(u.get("evidence_span") or ""),
            "break_option": u.get("break_option"),
            "question": u.get("question"),
            "decided_by": u.get("decided_by"),
            "fallback_reason": out.get("fallback_reason"),
            "quick_answer": a.get("quick_answer"),
            "headline": (a.get("happened") or "")[:200],
            "filter_dropped_model_text": out.get("filter", {}).get("dropped_model_text"),
            "filter_violations": out.get("filter", {}).get("violations"),
        }
        line = json.dumps(row, ensure_ascii=False)
        print("SIP_HELP_LOG " + line, flush=True)
        url, token = _redis()
        if url:
            requests.post(url, json=["RPUSH", KEY, line], headers={"Authorization": f"Bearer {token}"}, timeout=3)
    except Exception:  # never let logging break the answer
        pass


def export() -> list[dict]:
    url, token = _redis()
    if not url:
        raise RuntimeError("No Upstash Redis / Vercel KV connected (KV_REST_API_URL / KV_REST_API_TOKEN not set).")
    r = requests.post(url, json=["LRANGE", KEY, "0", "-1"], headers={"Authorization": f"Bearer {token}"}, timeout=15)
    r.raise_for_status()
    return [json.loads(x) for x in r.json().get("result", [])]
