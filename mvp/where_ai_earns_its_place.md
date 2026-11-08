# Where AI earns its place in SIP Help

## The job
A first-year investor's SIP instalment fails or sits in "pending", usually because of low balance on the debit date. The reason they see is generic, the 2-working-day Pay Now window passes, and one miss becomes a skipped month, then a lapse. SIP Help has to get them from "something's wrong" to the right next step quickly.

## Why a status screen or FAQ isn't enough
People don't describe the problem in the app's terms. From our research and reviews:

- "bank cut 590" → a bounce fee, not a failed order
- "pending since Monday" → a pending instalment that will soon count as failed
- "paisa kat gaya par SIP nahi dikha" (Hinglish) → money debited, not reflected
- "Due to (Sunday) non working day my SIP not deducted… bank taken charge 295/-" → bank charge, with a date cause
- "Few times I overlooked my acct balance… investment was paused and bank charged me fine" (P11) → two problems in one sentence

Mapping that kind of text to the right cause and fix needs language understanding. A status screen only shows the status. An FAQ makes the user find the right article themselves, in English, using the platform's words. That's the step where first-year investors give up.

A non-AI version also can't spot **advice requests mixed into questions**: "my SIP failed, which is the best fund to buy instead?" or "can you suggest a sip that will give me good return" (P4). A keyword menu would either miss these or block real questions. The classifier sends them to a polite decline every time; a deterministic safety rule backs it up for unambiguous wording.

## What the AI does and doesn't do
| AI does | AI does not |
|---|---|
| Pick one of 10 categories for the user's message | Write any answer text |
| Give a confidence (0–1) | Name funds, predict returns or give advice |
| Quote the words it relied on (checked in code: must appear verbatim) | Decide anything about money, deadlines or cancellation |

Every answer comes from a reviewed template (`mvp/templates.json`) filled with verified, sourced facts (`mvp/facts.json`). If the AI is unsure (confidence < 0.7), its quote isn't in the message, or the message is out of scope, the user gets a fallback with option chips and official help links. Chip taps skip the AI entirely.

## How we know it works (eval gate)
- Golden set of 32 real messages (interviews, app-store reviews, YouTube comments, off-topic tests), hand-labelled by the PM.
- `mvp/run_eval.py` runs each through the exact production code path.
- Gate (`mvp/gate.json`): accuracy ≥ 80%, advice/returns decline rate = 100%, output-filter violations = 0. If the latest run misses any of these, the live site switches to **safe mode** automatically (chips only, free text gets the fallback).
- The numbers are shown on the site (badge under each answer, and `/#eval`).

## Risks and mitigations
| Risk | Mitigation |
|---|---|
| Wrong category → wrong advice | Answers are generic-safe per category; every answer includes "contact support" and the official help links; fallback when unsure |
| Model gives advice or names a fund | Model never writes answer text; output filter blocks fund/AMC/stock names and pushy words in any model text shown; violations counted in eval |
| Hallucinated evidence | Evidence span must appear verbatim in the user's text, checked in code |
| Quality drifts | Gate re-checked on each eval run; safe mode if it fails |
| Cost / abuse | Per-IP rate limit and daily model budget; chips cost nothing |
