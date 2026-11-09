"""Vercel serverless function: /api/help

POST {"text": "..."} or {"chip": "My instalment failed"}  -> classified, templated, filtered answer
GET                                                       -> health + gate status (+ eval summary for the badge)

The Gemini key is read from the GEMINI_API_KEY environment variable on the server and never sent to the browser.
"""
import json
import sys
import time
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sip_help import core, store  # noqa: E402

MAX_CHARS = 600
MIN_CHARS = 3
PER_IP_PER_HOUR = 20         # best effort: counted per serverless instance
DAILY_MODEL_BUDGET = 400     # model calls per instance per day; billing alert is the real backstop
_hits = defaultdict(deque)
_budget = {"day": None, "n": 0}


def rate_limited(ip: str) -> bool:
    now, q = time.time(), _hits[ip]
    while q and now - q[0] > 3600:
        q.popleft()
    if len(q) >= PER_IP_PER_HOUR:
        return True
    q.append(now)
    return False


def budget_ok() -> bool:
    day = time.strftime("%Y-%m-%d")
    if _budget["day"] != day:
        _budget.update(day=day, n=0)
    if _budget["n"] >= DAILY_MODEL_BUDGET:
        return False
    _budget["n"] += 1
    return True


def public_gate() -> dict:
    g = core.gate_status()
    return {"passed": g["passed"], "reason": g["reason"], "summary": g["summary"]}


class handler(BaseHTTPRequestHandler):
    def _send(self, code: int, body: dict) -> None:
        data = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):  # noqa: N802
        self._send(200, {"ok": True, "model": core.MODEL, "key_configured": bool(__import__("os").environ.get("GEMINI_API_KEY")), "log_store": store.enabled(), "log_count": store.count(), "gate": public_gate(), "chips": list(core.CHIPS),
                         "disclaimer": core.DISCLAIMER})

    def do_POST(self):  # noqa: N802
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("content-length") or 0)) or b"{}")
        except (ValueError, json.JSONDecodeError):
            return self._send(400, {"error": "Send JSON with a 'text' or 'chip' field."})
        chip = body.get("chip")
        text = str(body.get("text") or "").strip()
        gate = public_gate()
        safe = not gate["passed"]
        if chip:
            out = core.help_for(chip=chip, safe_mode=safe)
            if "error" in out:
                return self._send(400, out)
        else:
            if len(text) < MIN_CHARS:
                return self._send(400, {"error": "Type a few words about what you see on your SIP."})
            if len(text) > MAX_CHARS:
                return self._send(400, {"error": f"Please keep it under {MAX_CHARS} characters."})
            ip = (self.headers.get("x-forwarded-for") or self.client_address[0]).split(",")[0].strip()
            if not safe and (rate_limited(ip) or not budget_ok()):
                out = core.help_for(text=text, safe_mode=True)
                out["fallback_reason"] = "rate_limited"
            else:
                out = core.help_for(text=text, safe_mode=safe)
        out["gate"] = gate
        self._send(200, out)
        store.record(str(body.get("sid") or ""), text, chip, out)  # after the reply, so it never slows the answer
