# SIP Back on Track (Part 5 MVP)

Concept prototype for a Groww-style app. Not affiliated with Groww. **Not investment advice.**

Live: https://mvp-sip.vercel.app · Eval: https://mvp-sip.vercel.app/#eval · Part 1: https://sip-engine-git-claude-zealous-mccarthy-db9vgg-ruben-af8e.vercel.app/

- `api/help.py` – Vercel Python function. POST `{"text": ...}` or `{"chip": ...}`; GET returns gate status.
- `sip_help/core.py` – classifier (Gemini Flash → category, confidence, verbatim evidence span), templates, fallback, output filter, gate.
- `mvp/facts.json`, `mvp/templates.json` – the only source of answer text.
- `mvp/golden_set.csv`, `mvp/run_eval.py`, `mvp/gate.json`, `outputs/mvp_eval.json` – eval gate. Safe mode if it fails.
- `index.html`, `app.js`, `style.css` – the page.

Env var: `GEMINI_API_KEY` (server only). Optional `SIP_HELP_MODEL` (default `gemini-3.8-flash`).

Local: `python dev_server.py` → http://localhost:8000 · Tests: `python -m pytest -q tests` · Eval: `python mvp/run_eval.py`
