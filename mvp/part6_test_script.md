# Part 6 – User test script: SIP Back on Track

**Live prototype:** https://mvp-sip.vercel.app
**Who:** 5 people who started a SIP in the last 12–18 months (ideally someone who has had a failed or pending instalment).
**Format:** 15–20 min, remote or in person, on their own phone. Think-aloud. Record screen with consent.

## Intro (read out)
"This is an early prototype of a help tool inside a Groww-style investing app. It's not connected to any real account, and the SIP on screen is made up. I'm testing the tool, not you; there are no wrong answers. Please say out loud what you're thinking as you go."

## Tasks

**Task 1 – Failed / pending instalment**
"Your SIP shows 'pending' for 3 days and your bank texted about a failed debit. Find out what happened and what you'd do."
- Start: choose the "Pending for days" scenario and hand over the phone with the notification showing.
- Success: they reach an answer about a pending / failed instalment and name a next step (Pay Now or pay one-time; keep the balance in 4 days before the next date). Bonus: they notice the Pay Now date on the button.

**Task 2 – Wanting a break**
"You want to skip next month's SIP. Find your options."
- Success: they reach the skip / reduce / change-date answer and can say where in the app they'd do it.

**Task 3 – Asking for advice (checks the decline)**
"Ask it which fund to buy."
- Success: the tool politely declines, without recommending anything, and offers a next step. Note how they react to the decline.

## What to observe (per task)
- **Time to answer**: from the start of the task to the moment they can state the cause and next step.
- **Path**: typed or tapped a chip? What did they type, in which language?
- **Wrong turns**: fallback shown, wrong category, retries, back-tracking.
- **Comprehension**: can they say the next step in their own words without looking?
- **Trust**: do they notice or read the "How the AI read your message" strip, the Quick answer, the badge, the sources? Any sign of doubt ("is this real?", "would Groww say this?")
- **Tone**: any sign the answer felt pushy, scary or preachy?

## Follow-up questions (after all tasks)
1. In your own words, what would you do if this happened to your real SIP tomorrow?
2. What, if anything, made you trust or not trust the answer?
3. Was anything confusing or missing from the answer? What would you have wanted to see?
4. How did you feel when it wouldn't recommend a fund? Would you look for that elsewhere?
5. Where would you expect to find this in the app, and when would you want it to show up (e.g. a notification when an instalment fails)?

---

## Results – SIMULATED DRY RUN (not real participants)

> **Important:** U1–U5 below are **simulated participants**. Claude played five people from the target segment and ran them through the real prototype on 9 Nov 2026. **What they typed is invented. Everything the prototype showed back is real**, captured from the same code the live site runs. Times are **estimates**: phone typing at about 2.5 characters a second, plus the measured response time, plus reading up to the main button at about 200 words a minute. **Trust scores and quotes are Claude's judgement.** Use this dry run to rehearse and to set expectations, then fill in the blank table at the end with real people.

**Simulated participants**
- **U1 Priya**, 24, IT job in Pune. Salary on the 7th, SIP on the 5th. Short English messages.
- **U2 Rahul**, 27, field sales in Lucknow. Hinglish. Has paid bank bounce fees before; low trust in apps.
- **U3 Sneha**, 22, student and intern in Bengaluru. Anxious; follows friends' tips.
- **U4 Arjun**, 29, clerk in Jaipur. Hindi-first; prefers tapping to typing.
- **U5 Meera**, 26, nurse in Kochi. Rarely opens the app; acts on notifications.

| Participant | Task | Typed / chip (what they typed) | Time to answer (s, est.) | Success (Y / Partial / N) | Wrong turns | Category shown correct? | Trust (1–5, sim.) | Notable quote (sim.) |
|---|---|---|---|---|---|---|---|---|
| U1 | 1 | Typed: "bank sent sms that the 1000 debit failed and app says pending. my salary comes on the 7th, will it go through by itself?" | 84 | Y | None. Quick answer: Groww's help doesn't say it's retried; pay it yourself. Button: **Pay now (open until today, Mon 9 Nov)** | Y (Failed – low balance) | 4 | "Good that it says I have to pay myself. I'd have waited for my salary." |
| U1 | 2 | Typed: "can I skip the december sip? I have a trip that month" | 44 | Y | None. Button: **Skip next instalment** + path | Y (Wants a break → skip) | 5 | "That's exactly what I wanted." |
| U1 | 3 | Typed: "which fund should I put my 1000 in for the best returns" | 43 | Y | None. Declined | Y (Fund advice) | 4 | "Fair, it's for payments, not tips." |
| U2 | 1 | Typed: "bank ka msg aaya debit fail hua, app me pending dikha raha hai, aur 590 bhi kat gaya" | 70 | Y | None. Fee explained (the bank's, not Groww's). Button: **Pay now** | Y (Bank charge) | 4 | "Ok, so the 590 is the bank's. Bas Pay now karna hai." |
| U2 | 2 | Typed: "agle mahine ka sip skip karna hai, kaise karu?" | 42 | Y | None. Button: **Skip next instalment** | Y (Wants a break → skip) | 4 | "Samajh gaya, but English mein hai." |
| U2 | 3 | Typed: "bhai konsa fund lu jo jaldi double kar de" | 37 | Y | None. Declined | Y (Fund advice) | 3 | "Theek hai, nahi batayega. Shorter than I thought." |
| U3 | 1 | Typed: "my sip is showing pending for 3 days and my bank texted that the auto debit failed. did I lose my money?" | 78 | Y | None. Quick answer: the amount wasn't taken and existing investment isn't affected; the bank may charge a fee | Y (Failed – low balance) | 5 | "Phew, okay. The first line answered me." |
| U3 | 2 | Typed: "I want to pause my SIP next month because I'm short on money. will that cancel my SIP?" | 66 | Y | Minor: the 3-skips rule appears twice (Quick answer + Good to know) | Y (Wants a break → skip) | 4 | "Good, one skip is fine." |
| U3 | 3 | Typed: "my friend says I should buy a small cap fund, should I?" | 43 | Y | None. Declined | Y (Fund advice) | 4 | "I like that it doesn't push me either way." |
| U4 | 1 | Chip: "My instalment failed" | 14 | Y | None. Button: **Pay now** | Y (no AI needed) | 4 | "Button se ho gaya, typing nahi karna pada." |
| U4 | 2 | Chip: "I want to pause or skip a month" | 11 | Y | None. Button: **Skip next instalment** | Y (no AI needed) | 4 | "Easy." |
| U4 | 3 | Typed: "kaunsa mutual fund best hai 2027 ke liye" | 36 | Y | None. Declined | Y (Fund advice) | 3 | "Phir kahan puchu?" (where do I ask, then?) |
| U5 | 1 | Notification → "What happened?" only | 15 | Y | None. Button: **Pay now (open until today, Mon 9 Nov)** | Y (no AI needed) | 5 | "I'd have missed this without the notification." |
| U5 | 2 | Typed: "can I reduce my sip to 500 for a few months instead of stopping" | 49 | Y | None. Button: **Reduce the amount** | Y (Wants a break → reduce) | 5 | "Good, I didn't know I could just reduce it." |
| U5 | 3 | Typed: "is SBI small cap a good fund for me" | 34 | Y | None. Declined; the fund name was never shown back | Y (Fund advice) | 4 | "Okay, it won't judge funds." |

### Summary (simulated)

| Metric | Result |
|---|---|
| **Task success rate** | Task 1: **5/5** · Task 2: **5/5** · Task 3: **5/5** (15/15 overall) |
| **Median time to answer** | **43 s** (range 11–84 s). Chips and notification: **11–15 s**. Typed: **34–84 s**, mostly typing time |
| **Typed inputs understood without fallback** | **12/12 (100%)**, including 3 in Hinglish |
| **Decline rate on Task 3** | **5/5 (100%)** |
| **Average trust** | **4.1 / 5** (Task 1: 4.4 · Task 2: 4.4 · Task 3: 3.6) |
| **Direct questions answered first (new Quick answer)** | **3/3** ("will it go through by itself?", "did I lose my money?", "will that cancel my SIP?") |

**Top 3 issues (with frequency):**
1. **Answers are in English even when the question is in Hinglish**: 4 of 15 tasks (U2 × 3, U4 × 1). Understood fine, but it feels distant to Hinglish-first users.
2. **After the decline, "so where do I ask?"**: 2 of 5 Task 3s (U2, U4). The SEBI-adviser pointer feels far away. The decline is now shorter (about 150–160 words, down from about 215) with 3 links instead of 8, but it still doesn't offer anything users see as useful next.
3. **Typed answers take longer to reach the action**: about 100 words before the main button (AI strip, Quick answer, headline), compared with about 25–40 words on the chip and notification paths. Small repetition too: the 3-skips rule appears twice for U3 (1 of 15).

**What the dry run suggests for the real test:** the notification and chip paths are fastest (11–15 s), so check whether real users act from the notification. Watch how real users react to the decline, and whether they would prefer Hinglish replies.

---

## Results – real participants (fill in)
| Participant | Task | Typed / chip (what they typed) | Time to answer (s) | Success (Y / Partial / N) | Wrong turns | Category shown correct? | Trust (1–5) | Notable quote |
|---|---|---|---|---|---|---|---|---|
| P1 | 1 | | | | | | | |
| P1 | 2 | | | | | | | |
| P1 | 3 | | | | | | | |
| P2 | 1 | | | | | | | |
| P2 | 2 | | | | | | | |
| P2 | 3 | | | | | | | |
| P3 | 1 | | | | | | | |
| P3 | 2 | | | | | | | |
| P3 | 3 | | | | | | | |
| P4 | 1 | | | | | | | |
| P4 | 2 | | | | | | | |
| P4 | 3 | | | | | | | |
| P5 | 1 | | | | | | | |
| P5 | 2 | | | | | | | |
| P5 | 3 | | | | | | | |

**Summary to compute:** task success rate per task; median time to answer; % of typed inputs understood without fallback; decline rate on Task 3 (target 100%); average trust; top 3 issues with frequency.
