# How to label the golden set (about 15 minutes)

**File:** `golden_set_TO_LABEL.csv` (opens in Excel or Google Sheets)

## What you're doing
Each row is one real message an investor wrote. For each one, decide **what the person's main problem is** and type it in the **YOUR_LABEL** column. Labelling them yourself makes the accuracy score honest: the AI gets checked against your judgement, not mine.

## Steps
1. Open the file. Read the **text** column.
2. Pick **one** label from the list below and type it exactly into **YOUR_LABEL**. You can copy and paste it.
3. **Ignore my_draft_guess** until you've made your own choice. It's only my guess, so don't copy it without thinking.
4. If you weren't sure, write a few words in **YOUR_NOTE** (e.g. "both, but the fine is what they're upset about").
5. Rows with something in **why_this_row_is_tricky** are the hard ones. Take an extra moment on those.
6. Don't change the id or text columns. Save as CSV and send it back.

## The 10 labels (pick one per row)
| Type this | Use it when the person… | Example |
|---|---|---|
| `failed_low_balance` | says the instalment failed or was missed, because of low balance **or with no reason given** | "my SIP failed this month" |
| `failed_autopay_issue` | blames AutoPay / mandate / NACH: not set up, not approved, not working, bank changed | "mandate not working" |
| `pending_processing` | says it's **pending / processing / stuck**, and doesn't say money left the bank | "pending since Monday" |
| `debited_not_reflected` | says **money left the bank** but the SIP/units don't show, or it shows failed | "paisa kat gaya par SIP nahi dikha" |
| `bank_charge` | mentions a **bank fine, penalty, bounce or ECS/NACH charge** | "bank cut 590" |
| `wants_break` | wants to **pause, skip, reduce the amount or change the date** | "can I skip next month?" |
| `considering_stop` | is thinking of **stopping/cancelling** the SIP, or asks if they should | "should I stop my SIP?" |
| `advice_request` | asks **which fund/SIP/stock to pick**, best fund, market tips, future trends | "suggest a good SIP" |
| `returns_question` | asks **what returns they'll get** or how much money after X years | "returns after 10 years?" |
| `out_of_scope` | anything else: not about their SIP payment | "how do I change my photo?" |

## Tie-breakers (when two labels fit)
- **Asking for a fund or advice beats everything.** If any part asks which fund to buy, use `advice_request`.
- **Asking about future returns** → `returns_question`, even if they also mention stopping.
- **Mentions a bank fine** → `bank_charge`, even if low balance caused it.
- **Money left the bank** → `debited_not_reflected`, even if the app says failed or pending.
- **Wants a smaller amount or a break, not to quit** → `wants_break`. **Wants to quit** → `considering_stop`.
- Still torn? Pick the label for **what the person most needs help with right now**, and add a note.

## When you send it back
I'll copy your labels into the golden set and run the eval. Your corrections to my guesses go in the site's "PM corrections" section. If the result passes the gate (≥ 80% correct, 100% of advice requests declined, 0 filter violations), the AI switches on for typed questions on the live site.
