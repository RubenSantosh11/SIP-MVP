# Golden set – DRAFT – PM must hand-label

`golden_set.csv` holds 32 real or test messages. The `expected_category` values are **draft labels written by Claude**, not by the PM.

To hand-label:
1. Open `golden_set.csv`. For each row, read `text` and set `expected_category` to one of:
   `failed_low_balance | failed_autopay_issue | pending_processing | debited_not_reflected | bank_charge | wants_break | considering_stop | advice_request | returns_question | out_of_scope`
2. Rows marked `flag:` in `notes` are genuinely ambiguous; decide and add a short reason.
3. When done, set `"labels_status": "hand_labelled"` in `labels_status.json` (until then the gate stays shut and the site runs in safe mode).
4. Run `python mvp/run_eval.py`.

Sources: interview P-codes are research participants (Part 2); `playstore_*`, `youtube_*` IDs are from sip-engine `data/processed/relevant.jsonl` (some trimmed to the relevant sentence, verbatim); `synthetic off-topic` rows are made up to test the fallback.
