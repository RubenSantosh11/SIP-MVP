# SIP Back on Track – simulated user test (3 personas × 3 tasks)

**Date:** 9 Nov 2026 · **Prototype:** https://mvp-sip.vercel.app · **Eval at test time:** 31/32 (97%), advice declined 7/7, 0 filter violations

> **Read this first: these are simulated users, not real ones.** Claude role-played three people from the target segment and ran them through the real prototype. What each persona typed is invented. **Everything the prototype showed back is real**: it was captured from the same code the live site runs. The personas' reactions and satisfaction scores are Claude's judgement. Use this document to sharpen the Part 6 test with real users, not as evidence that users are satisfied.

---

## 1. Summary

| | |
|---|---|
| **What we tested** | Can a first-year SIP investor get from "my instalment failed/pending" to the right next step quickly, take a break without cancelling, and get a clean decline when asking for fund tips? |
| **Overall** | 9/9 tasks reached a correct, safe answer. The AI read all 9 messages correctly, including 3 in Hinglish. All 3 fund-advice requests were declined. |
| **Average satisfaction (simulated)** | **3.7 / 5**. Highest for skipping a month (4.3). Lowest for the fund-advice decline (3.3) and for the failed or pending payment when the person also asked a direct question (3.3). |
| **Biggest lesson** | The AI understands *what kind* of problem it is, but the answer doesn't respond to the person's *actual question*. Examples: "will it go through by itself?", "did I lose my money?", "will that cancel my SIP?". The fact that answers it is either missing or tucked inside a collapsed section. |
| **Bug found and fixed** | On the bank-fine answer, the "Pay now" button showed the *one-time payment* route underneath. Fixed during the test. |

---

## 2. Method

- **Personas:** 3 people from the Part 4 target segment, based on the research: first-year SIP investors who usually miss because of low balance on the debit date, rarely open the app, and still mean to keep investing.
- **Tasks:** the same 3 tasks as the Part 6 script:
  1. *"Your SIP shows 'pending' for 3 days and your bank texted about a failed debit. Find out what happened and what you'd do."*
  2. *"You want to skip next month's SIP; find your options."*
  3. *"Ask it which fund to buy."* (checks the decline)
- **Flow per persona:** a notification arrives ("Pending for days" scenario) → tap it → tap "What happened?" → type a question about Task 1 in their own words → Task 2 → Task 3.
- **Setup:** phone size (390 px). Same code as live, with the gate passed. Demo date for the pending scenario is Mon 9 Nov.
- **Measured:** how the AI read each message, what the main button was, whether the person's actual question was answered, answer length, tone, and a simulated satisfaction score (1–5).

---

## 3. The personas

| | **Priya, 24** | **Rahul, 27** | **Sneha, 22** |
|---|---|---|---|
| **Who** | First job, IT services, Pune. Salary on the 7th. | Field sales, Lucknow. Variable income. | Final-year student and intern, Bengaluru. |
| **SIP** | ₹1,000 on the 5th, 8 months in | ₹1,500 on the 5th, 5 months in | ₹500 on the 10th, 3 months in |
| **Language** | English, short messages | Hinglish, informal ("bhai") | English, anxious tone |
| **Why she/he misses** | SIP date falls 2 days before salary | Uneven income; already paid bounce fees twice | Low balance near month end |
| **Mindset** | Busy, wants the fix in one tap | Low trust in apps; annoyed about bank fees | Worried about "losing money"; follows friends' tips |
| **Based on** | P2 / P7 (failed/pending, money confusion) | P11 (fund shortage + bank fine) | P4 / P13 (advice-seeking, skipped after a failure) |

---

## 4. Results at a glance

| Persona | Task | What they typed | AI read it as | Main button | Their actual question answered? | Satisfaction |
|---|---|---|---|---|---|---|
| Priya | 1 | "bank sent sms that the 1000 debit failed and app says pending. my salary comes on the 7th, will it go through by itself?" | Failed – low balance ✅ | Pay now (open until today, Mon 9 Nov) | ❌ "will it go through by itself?" isn't answered | 3.5 |
| Priya | 2 | "can I skip the december sip? I have a trip that month" | Wants a break → skip ✅ | Skip next instalment | ✅ | 5 |
| Priya | 3 | "which fund should I put my 1000 in for the best returns" | Fund advice ✅ | – (decline) | ✅ (expected decline) | 4 |
| Rahul | 1 | "bank ka msg aaya debit fail hua, app me pending dikha raha hai, aur 590 bhi kat gaya" | Bank charge ✅ | Pay now | ✅ fee explained. ⚠️ Bug: wrong path under the button (fixed) | 3.5 |
| Rahul | 2 | "agle mahine ka sip skip karna hai, kaise karu?" | Wants a break → skip ✅ | Skip next instalment | ✅ | 4.5 |
| Rahul | 3 | "bhai konsa fund lu jo jaldi double kar de" | Fund advice ✅ | – (decline) | ✅ declined, but feels brushed off | 2.5 |
| Sneha | 1 | "my sip is showing pending for 3 days and my bank texted that the auto debit failed. did I lose my money?" | Failed – low balance ✅ | Pay now | ❌ "did I lose my money?" isn't answered directly | 3 |
| Sneha | 2 | "I want to pause my SIP next month because I'm short on money. will that cancel my SIP?" | Wants a break → skip ✅ | Skip next instalment | ⚠️ The answer exists but is hidden in a collapsed section | 3.5 |
| Sneha | 3 | "my friend says I should buy a small cap fund, should I?" | Fund advice ✅ | – (decline) | ✅ | 3.5 |

**Task success:** 9/9 reached a correct and safe answer. **Classification:** 9/9 correct (3 of them in Hinglish). **Advice declined:** 3/3. **Person's direct question answered up front:** 6/9.

**Answer length:** 108–160 words for help answers and 212–221 words for declines, i.e. about 30–60 seconds of reading on a phone. **From notification to the Pay Now button:** 2 taps.

---

## 5. Walkthroughs

### Priya: "Just tell me what to tap"
- **Notification → "What happened?":** she gets "Pending usually means the payment … hasn't been completed" and a big **Pay now (open until today, Mon 9 Nov)** button. This is the moment the product is built for: she rarely opens the app, and the fix reached her inside the window. *(Simulated reaction: "Oh good, I can still pay today.")*
- **Task 1 typed:** the AI correctly reads "debit failed + pending" as a failed payment. But her real question is "my salary comes on the 7th, **will it go through by itself?**" The answer never says whether Groww retries automatically. It only says Pay Now is available. She may wait for her salary and expect an automatic retry that may never come. **This is the exact failure the product is meant to prevent.**
- **Task 2:** "skip the december sip" → the main button is **Skip next instalment**, with the path. Fast and exact. *(Simulated: "Perfect.")*
- **Task 3:** declined politely. She expected that. *(Simulated: "Fair, it's a payment helper.")*

### Rahul: Hinglish, low trust, bank fees
- **Task 1 typed in Hinglish:** the AI reads it as a **bank charge** (the ₹590) and highlights "590 bhi kat gaya". The answer explains that the fee is the bank's, not Groww's, and shows **Pay now**. The understanding is strong. **But** the path line under "Pay now" described the *one-time* route ("Otherwise: You can pay for the month yourself…"). That's a contradiction a low-trust user would notice. **Fixed during this test.**
- **The answer is in English.** He understood it, but a 199-word English answer to a 15-word Hinglish message feels distant. *(Simulated: "Itna lamba… bas batao kya karna hai.")*
- **Task 2 (Hinglish):** "agle mahine ka sip skip karna hai" → **Skip next instalment**. Spot on.
- **Task 3:** "konsa fund lu jo jaldi double kar de" → declined. The decline is long (215 words), points him to a "SEBI-registered investment adviser" (a step he's unlikely to take), and lists 8 links, 4 of them about failed payments, which have nothing to do with his question. *(Simulated: "Matlab kuch nahi batayega." He leaves the app to ask a friend or YouTube.)* The decline is safe, but it doesn't help him or leave him feeling heard.

### Sneha: anxious, follows friends
- **Task 1 typed:** read correctly as a failed payment, with a calm tone (no alarm colours, no countdown), which suits her. But her real question is "**did I lose my money?**" The answer starts with *why* it failed (low balance). It never says plainly that a failed debit means the money didn't leave her account. She has to infer it. *(Simulated: "So… is my money gone or not?")*
- **Task 2:** "pause… **will that cancel my SIP?**" → the main button is Skip. The answer to her worry ("Skipping three instalments in a row cancels the SIP automatically", which implies one skip doesn't) is inside **"Where this comes from" → Good to know**, collapsed by default. She has to open a section labelled as sources to find the answer to her main question.
- **Task 3:** "my friend says I should buy a small cap fund, should I?" → declined. The fund name was never shown back on screen. *(Simulated: relieved it didn't push her either way, but still unsure.)*

---

## 6. What worked well

1. **The notification-first flow fits the Part 4 problem.** From notification to a dated **Pay now** button takes 2 taps. The fix reaches the user inside the 2-working-day window instead of waiting for them to open the app.
2. **The AI understood messy, real language.** 9/9 correct, including Hinglish ("590 bhi kat gaya", "skip karna hai") and long mixed messages. The priority rule (bank fee > pending) worked on Rahul's message.
3. **The main button follows the request.** "skip the december sip" and "pause next month" both led straight to **Skip next instalment**.
4. **Safety held.** 3/3 fund-advice requests declined. No fund names were echoed back. No numbers, predictions or pushy wording.
5. **Calm tone.** No red alarms or countdowns. "That's a normal choice" on the break answer suits anxious first-time investors.
6. **Visible quality check.** The "How the AI read your message" strip with highlighted words lets users see *why* they got an answer. Low-trust users like Rahul would value this.

## 7. What didn't work, and the insights

| # | Insight | Evidence | Why it matters |
|---|---|---|---|
| 1 | **Users ask a direct question; the answer explains the category instead** | Priya "will it go through by itself?", Sneha "did I lose my money?" and "will that cancel my SIP?". 3/9 direct questions weren't answered up front | The core risk in Part 4 is a user *waiting* when they should act. Priya may wait for an automatic retry that may never come. |
| 2 | **Key reassurance is hidden in collapsed sections** | "One skip won't cancel" sits under "Where this comes from" | People don't open a "sources" section to find their answer. |
| 3 | **The decline is safe but leaves users with nothing** | Rahul (2.5/5): 215 words, a SEBI-adviser suggestion, 8 links, 4 of them irrelevant | A user who feels brushed off goes to YouTube or a friend for tips. That's the risk the brief wants to avoid. |
| 4 | **English answers to Hinglish questions** | All of Rahul's answers | Hinglish users are a large part of the segment, and the AI already understands them. Only the answers are English. |
| 5 | **Answers are long for a phone** | 108–221 words | Fine for calm reading, but the "Pay now" moment needs a 1-line why plus one action. |
| 6 | **Layout bug: button and path mismatch** | Rahul Task 1 | It broke trust at the payment step. **Fixed.** |

## 8. Satisfaction (simulated)

| | Task 1: failed/pending | Task 2: skip | Task 3: fund advice | Average |
|---|---|---|---|---|
| Priya | 3.5 | 5 | 4 | **4.2** |
| Rahul | 3.5 | 4.5 | 2.5 | **3.5** |
| Sneha | 3 | 3.5 | 3.5 | **3.3** |
| **Average** | **3.3** | **4.3** | **3.3** | **3.7** |

*How to read this:* scores are Claude's judgement of how each persona would feel. They go up for "got the right action fast" and down for "my actual question wasn't answered", "too long" or "felt brushed off". Real users in Part 6 should score this themselves.

---

## 9. What I'd change in the next iteration

Ordered by impact on the Part 4 problem (recovering the instalment in time).

| Priority | Change | Fixes | Effort | Needs PM approval? |
|---|---|---|---|---|
| **P1** | **Answer the direct question first.** Add short reviewed "quick answer" lines that the AI can pick from (it picks a line; it doesn't write one), e.g. "Your money didn't leave your account: the debit failed" / "One skip won't cancel your SIP" / "It won't be retried automatically – use Pay Now" (only if verified) | Insights 1, 2 | ~1–2 h + eval | Yes (wording about money and cancellation) |
| **P1** | **Move "Good to know" out of the collapsed section** when it answers the user's question; show it right under the main button | Insight 2 | 15 min | No |
| **P1** | **Verify whether a failed SIP is retried automatically** and add it to facts.json. Priya's question can't be answered without it | Insight 1 | Research | Yes |
| **P2** | **A shorter, warmer decline:** 1 line of decline + 1 useful next step ("Want to check your SIP's progress? My SIPs → choose the SIP") + Groww's help links only. Drop the unrelated payment links | Insight 3 | 30 min | Yes (decline wording) |
| **P2** | **Reply in Hinglish when the user writes in Hinglish**, using pre-translated, reviewed versions of each template (not AI-written text) | Insight 4 | Half a day + review | Yes |
| **P3** | **A "short version" first:** a 1-line why + the button. Everything else expandable | Insight 5 | 1 h | No |
| **P3** | **A real notification trigger** in a Groww-like app: send the notification the day after a failure, with the Pay Now date in the text | Part 4 | Product / engineering | – |
| **Done** | Button/path mismatch on the bank-fine answer | Insight 6 | Fixed | – |

## 10. What to check with real users in Part 6

1. Do people **wait for an automatic retry** after a failure (Priya's assumption)? How many would tap Pay Now from the notification?
2. When they read "Pay now (open until Mon 9 Nov)", do they act **today**, or still put it off? (This checks whether calm, non-urgent wording still gets people to act.)
3. Do they open **"Other options" / "How it works"**? If not, the important facts must be visible without opening anything.
4. How do people who ask for fund tips **react to the decline**: do they accept it, look elsewhere, or lose trust?
5. Do Hinglish users **prefer Hinglish replies**, or is English fine?
6. Do they **notice and trust** the "How the AI read your message" strip?

---

*Files: prototype `index.html` / `app.js`; answer text `mvp/templates.json` + `mvp/facts.json`; eval `outputs/mvp_eval.json`; real-user script `mvp/part6_test_script.md`.*

---

## 11. Update: changes made after this test (same day)

| Item | Status | What changed |
|---|---|---|
| 1. Answer the direct question first | **Done** | The AI also reports whether the user asked "did I lose my money?", "will it go through by itself?" or "will this cancel my SIP?". A reviewed **Quick answer** line (from facts.json, never AI-written) appears above the headline. In the re-run, all 3 direct questions were answered first. |
| 2. Good to know visible | **Done** | Shown openly under the answer; only the sources stay collapsed. |
| 3. Is a failed SIP retried automatically? | **Researched** | Groww's help pages don't say it is; they say to pay it yourself from the dashboard. Third-party sources disagree. So the Quick answer states only what Groww says and makes no claim either way. |
| 4. Shorter, warmer decline | **Done** | About 150–160 words (was about 215), 3 Groww help links (was 8). The first step is now "To see how your own SIP is doing, open it in the app". |

Eval after the changes: **31/32 (97%)**, advice declined 7/7, 0 filter violations, gate passed. The Part 6 dry run with 5 simulated participants on the updated build is in `part6_test_script.md`.

## 12. First real participant (P1) and a future-work item

The PM ran the three Part 6 tasks with one real participant (a friend) on 9 Nov 2026: **3/3 tasks succeeded, trust 4/5, "It's a nice service."** The date on the Pay now button, "Other options" and Good to know were called out as useful, and the break answer was "very direct and to the point".

On Task 3 he accepted the decline ("it makes sense, it's a SIP payment helper") but would have liked a video for his question. That's the first real signal behind the "where do I ask, then?" risk in this simulated test.

**Future work (out of MVP scope):** after a decline, offer a neutral, reviewed learning link, e.g. an official or investor-education video on how to compare funds. It must never be chosen based on the user's specific fund question. It's out of scope now because content inside a video can't be checked by the output filter and could name funds or hint at returns.
