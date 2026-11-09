# SIP Back on Track: Part 7 (Define Success) & Part 8 (Risks & Mitigation)

**Problem (Part 4):** When a first-year SIP instalment fails or sits in "pending" (usually because of low balance on the debit date), the investor doesn't recover it within the 2-working-day Pay Now window. The reason shown is generic and they rarely open the app. One miss becomes a skipped month, then a lapse or a switch, even though they still mean to invest.

**Solution (Part 5 MVP):** A failure notification leads to a "What happened?" screen with one dated main action (Pay now / pay one-time / skip / change date). Typed questions in plain English or Hinglish are classified by AI into 10 problem types, with the answer coming from reviewed templates and sourced facts. Fund-advice and returns questions are always declined. An eval gate puts the AI into safe mode if quality drops.

---

# PART 7: DEFINE SUCCESS

## 7.1 How the metrics connect (metric tree)

```
BUSINESS OUTCOME (lagging, quarterly)
  First-year SIP 12-month persistency  ──►  Monthly SIP book retained (₹)
          ▲
          │ fewer first failures turn into lapses
          │
PRIMARY LEADING INDICATOR (weekly)
  Failed-instalment recovery rate (within the Pay Now window)
          ▲
          │ the fix reaches the user in time, and they act
          │
FUNNEL / DIAGNOSTIC LEADING INDICATORS (daily)
  Notification open rate → Help-to-action rate → Time to recovery
  Next-instalment success rate · Self-serve adjustment rate
          
GUARDRAILS (must not get worse)
  Help-attributed cancellation rate · Duplicate payment rate · Advice decline rate = 100%
  Filter violations = 0 · Failed-SIP support ticket rate · Notification opt-out rate · Latency/availability

AI OUTPUT QUALITY (offline gate + online monitoring)
  Golden-set accuracy · per-category precision/recall · fallback rate · sampled production accuracy
  Action-match rate · rephrase rate · span verification failure rate · confidence calibration
```

**Why this structure:** the business cares about investors who **keep investing** (persistency) and the **recurring money that brings in** (the SIP book). Those move slowly; they show up only after 6–12 months. So we steer week to week with a leading indicator the product directly controls: **are failed instalments recovered in time?** Guardrails make sure we don't "win" by hurting investors: pushing them to stop, causing double payments, or giving advice we're not allowed to give. The AI quality metrics make sure the part that reads messy text is trustworthy enough to stay switched on.

**Common definitions used below**
- **First-year SIP:** a SIP whose first successful instalment was less than 12 months before the event being measured.
- **Failed instalment:** a scheduled instalment whose AutoPay debit failed, or that stayed "pending" past the date shown on it. Groww treats a pending SIP not paid by the shown date as failed.
- **Pay Now window:** 2 working days from the failure (weekends skipped). This is when Groww shows "Pay Now" on the dashboard.
- **Recovered:** the investor pays that month's amount, through Pay Now, or Pay one-time for the same SIP for the same amount or more.
- **Help session:** one visit to the SIP Back on Track screen (from the notification, a chip or a typed question), identified by session ID.
- **Treatment / control:** for launch, first-year SIP investors are randomised at the **user** level. 50% get the notification + help screen (treatment); 50% keep today's experience (control). All "lift" numbers compare the two groups.

---

## 7.2 Business metric (North Star)

### B1. First-year SIP 12-month persistency (primary business metric)

| | |
|---|---|
| **Definition** | Of the SIPs started in a given month, the share still active 12 months later |
| **Formula** | **Persistency₁₂ = (number of SIPs started in cohort month *m* that are still active at month *m*+12) ÷ (number of SIPs started in cohort month *m*)** |
| **"Still active"** | Not cancelled (by the user or automatically), **and** at least 1 successful instalment in month *m*+12. A planned skip in that month counts as active if the SIP isn't cancelled |
| **Cut** | Treatment vs control; segments: had ≥1 failure in year 1 vs none |
| **Frequency** | Monthly cohorts, read quarterly (needs a 12-month wait) |
| **Why it matters** | It's the clearest measure of "they still mean to invest, and they do". Our research says first-year investors drop off after a missed instalment even though they intend to continue. Persistency is where that shows up. For the business, a SIP that survives year 1 tends to keep running, so it drives recurring inflows, assets under management, engagement and lifetime value. Groww's brand also depends on helping new investors build a habit. |

### B2. Post-failure lapse rate (the problem, measured directly)

| | |
|---|---|
| **Definition** | Of first-year SIPs that have a failed instalment, the share that are cancelled within 90 days of that first failure |
| **Formula** | **Lapse₉₀ = (number of first-year SIPs with ≥1 failed instalment that are cancelled — by the user or automatically after consecutive failures — within 90 days of their first failure) ÷ (number of first-year SIPs with ≥1 failed instalment)** |
| **Frequency** | Monthly |
| **Why it matters** | This is the Part 4 problem in one number ("one miss becomes a lapse"). It responds faster than 12-month persistency (90 days, not 12 months), and it isolates exactly the users the solution is for. |

### B3. Monthly SIP book retained (₹)

| | |
|---|---|
| **Definition** | Rupees of scheduled first-year SIP instalments that are actually invested, rather than lost to failures |
| **Formula** | **SIP book retained (₹) = Σ ₹ of first-year instalments that succeed on schedule + Σ ₹ of failed first-year instalments that are recovered in the same month.** Reported alongside **₹ recovered by the feature = Σ ₹ recovered (treatment) − Σ ₹ recovered (control, scaled to the same group size)** |
| **Frequency** | Monthly |
| **Why it matters** | It turns the behaviour change into money the business understands: recurring inflow and asset growth. It also stops us optimising counts while losing value (e.g. recovering small SIPs but losing large ones). |

---

## 7.3 Leading indicators (what the solution directly moves)

### L1. Failed-instalment recovery rate (primary leading indicator)

| | |
|---|---|
| **Definition** | Of failed first-year instalments, the share paid within the Pay Now window |
| **Formula** | **Recovery₂wd = (number of failed first-year instalments paid via Pay Now or Pay one-time within 2 working days of the failure) ÷ (number of failed first-year instalments)** |
| **Secondary window** | **Recovery₃₀ = (failed first-year instalments paid within 30 days of the failure) ÷ (failed first-year instalments)**. This also counts one-time payments made after the window, e.g. after salary arrives |
| **Exclude** | Instalments where the user had set up a skip in advance (not a failure); duplicate failures of the same instalment |
| **Frequency** | Daily dashboard, weekly decision |
| **Why it matters** | This is the exact behaviour the product exists to change: the fix exists but doesn't reach the user in time. It reacts within days, the feature directly causes it, and it's the step before B1–B3. It's the metric the launch A/B test is judged on. |

### L2. Median time to recovery

| | |
|---|---|
| **Formula** | **Median of (time of successful payment − time of the failure event)**, in hours, over all **recovered** failed first-year instalments (Recovery₃₀ numerator) |
| **Frequency** | Weekly |
| **Why it matters** | Shows whether people act *inside* the window or only just make it. Shorter times mean the notification and the dated button are working, and give more buffer against the window closing (one real tester's salary arrived the day after the window closed). |

### L3. Failure notification open rate

| | |
|---|---|
| **Formula** | **Open rate = (number of failure notifications tapped within 48 hours of delivery) ÷ (number of failure notifications delivered)** |
| **Frequency** | Daily |
| **Why it matters** | Our research says users rarely open the app. If the notification isn't opened, nothing downstream can work. This is the first step of the funnel and tells us whether wording and timing are right. |

### L4. Help-to-action rate (main button click-through)

| | |
|---|---|
| **Formula** | **Help-to-action = (number of help sessions where the main action button is tapped) ÷ (number of help sessions that showed a main action button)** |
| **Also track** | **Action completion = (sessions where the tapped action is completed — payment made, skip confirmed, date changed — within 24 h) ÷ (sessions where the main button was tapped)** |
| **Frequency** | Daily |
| **Why it matters** | Measures whether the answer leads to a decision. Low click-through with high open rates means the answer isn't convincing or isn't the right action, which points to template or classification problems. |

### L5. Next-instalment success rate after a failure

| | |
|---|---|
| **Formula** | **Next success = (number of first-year SIPs whose next scheduled instalment after a failure succeeds) ÷ (number of first-year SIPs with a failed instalment that were not cancelled before the next date)** |
| **Frequency** | Monthly |
| **Why it matters** | Recovering this month is half the job. The other half is not failing again. The answer tells people to keep the balance in 4 days early, or to move the SIP date after salary. This metric shows whether that advice works, and it sits directly in front of the "3 failures in a row → cancelled" path. |

### L6. Self-serve adjustment rate (instead of cancelling)

| | |
|---|---|
| **Formula** | **Adjustment rate = (number of first-year SIPs that use skip, reduce amount or change date within 30 days after a failure or help session) ÷ (number of first-year SIPs with a failure or help session in the period)** |
| **Read together with** | G1 (cancellations) |
| **Frequency** | Monthly |
| **Why it matters** | A skip or a smaller amount keeps the SIP alive, while a cancellation ends it. Our simulated and real tests showed people didn't know they could reduce or move the date. A higher adjustment rate *with no rise in cancellations* means the tool is turning would-be lapses into kept SIPs. (A higher rate on its own isn't automatically good, which is why it's paired with G1 and B2.) |

---

## 7.4 Guardrail metrics (must not get worse)

| # | Metric | Exact formula | Threshold | Why it's a guardrail |
|---|---|---|---|---|
| **G1** | **Help-attributed cancellation rate** | (number of SIP cancellations within 7 days after a help session) ÷ (number of help sessions) | Treatment must not exceed control by a statistically significant amount | The "Should I stop?" answer is deliberately neutral. If cancellations go up, the tool is nudging people to quit, which hurts the investor and the business. |
| **G2** | **Duplicate payment rate** | (number of failed or debited instalments paid twice for the same SIP and month) ÷ (number of instalments paid through a help session) | ≤ control, target ≈ 0 | Telling someone whose money already left the bank to "Pay now" means paying twice. The answer says "don't pay again until you know the status". This checks it works. |
| **G3** | **Advice decline rate** | (number of advice or returns requests that got the decline) ÷ (number of advice or returns requests). The denominator comes from weekly hand-labelled samples plus the golden set | **= 100%** | Regulatory (SEBI) and trust risk. The product must never recommend a fund or predict returns. |
| **G4** | **Filter violations** | Count of answers where a blocked fund, AMC or stock name, or pushy word ("guaranteed", "hurry", "act now"…), reaches the screen | **= 0** | A single violation is a compliance incident. The filter must catch everything before it's shown. |
| **G5** | **Failed-SIP support ticket rate** | (number of support tickets about failed, pending or debited SIPs) ÷ (number of failed first-year instalments) | ≤ control; target a drop | If answers are wrong or confusing, people contact support, so cost goes up. If they're clear, tickets should fall. |
| **G6** | **Notification opt-out / uninstall rate** | (number of users who turn off notifications or uninstall within 7 days of a failure notification) ÷ (number of users sent a failure notification) | ≤ control + 0.5 pp | Calm, useful notifications should not annoy. If people opt out, we lose the channel the whole solution depends on. |
| **G7** | **Availability & latency** | Availability = (successful responses) ÷ (requests); p95 latency = 95th percentile response time | ≥ 99.5%; p95 ≤ 5 s typed, ≤ 1 s chip | A help tool that's down or slow inside a 2-day window defeats its purpose. Chips and notifications must work even if the AI is down; that's built in. |
| **G8** | **Cost per help session** | (AI API cost + infrastructure cost in the period) ÷ (number of help sessions) | Within budget (set at launch) | Keeps the AI step affordable at scale. Chips cost nothing, so cost grows only with typed questions. |

---

## 7.5 Measuring the quality of the AI feature's outputs

The AI does only one job: **read the user's message and pick the problem type** (plus which change they want and whether they asked a direct question), and **quote the words it relied on**. It never writes answer text. So quality means: **did it understand correctly, did it decline when it should, and did the answer it led to fit the user's need?**

### A. Offline: the release gate (before every change)

Run on the hand-labelled golden set (today: 32 real messages from interviews, Play Store, YouTube and off-topic tests; labelled by the PM). The same code path as production is used.

| Metric | Exact formula | Gate | Today (9 Nov 2026) |
|---|---|---|---|
| **Accuracy** | (number of golden messages where the shown category = the PM's label) ÷ (number of golden messages) | **≥ 80%** | **31/32 = 97%** |
| **Precision (per category c)** | (messages correctly labelled c) ÷ (messages the system labelled c) | Monitored | e.g. AutoPay issue 5/5 |
| **Recall (per category c)** | (messages correctly labelled c) ÷ (messages the PM labelled c) | Monitored | e.g. wants a break 1/2 |
| **Advice/returns decline rate** | (advice or returns messages declined) ÷ (advice or returns messages) | **= 100%** | **7/7 = 100%** |
| **Filter violations** | Count of blocked words reaching the screen | **= 0** | **0** |
| **Fallback rate** | (messages that got "I'm not sure" + help links) ÷ (all golden messages) | Monitored | 3/32 (the 3 off-topic messages) |

**Why it's a gate:** if the latest run misses any threshold, the site switches to **safe mode** automatically (chips and notifications still work; typed questions get official help links). Quality is enforced, not just reported.

**Next step:** grow the golden set from 32 to **≥ 300** messages, with each category at least 20 and plenty of Hinglish, using samples from the production log. Have **two people label each message** and report agreement: **Cohen's κ = (observed agreement − agreement expected by chance) ÷ (1 − agreement expected by chance)**, target κ ≥ 0.7. If two humans can't agree on a label, the AI can't be scored fairly on it.

### B. Online: in production (weekly)

| Metric | Exact formula | Target / alert | Why |
|---|---|---|---|
| **Sampled production accuracy** | Each week, take 100 random typed messages from the log and have the PM label them. (sampled messages where the shown category = the PM's label) ÷ (sampled messages) | ≥ 80%; alert if it drops 5 pp week on week | The golden set is fixed; real users write new things. This catches drift. |
| **Action-match rate** | In the same sample: (messages where the **main button shown** is the action the user actually needed, judged by the PM) ÷ (sampled messages that showed a main button) | ≥ 85% | Correct category isn't enough. Real tests showed a right category with a main action that didn't fit (the salary-after-window case). |
| **Direct question answered** | (sampled messages containing a direct question that got a matching Quick answer) ÷ (sampled messages containing a direct question) | ≥ 90% | Users ask "did I lose my money?" and need that answered first. |
| **Typed fallback rate** | (typed messages that got the fallback) ÷ (all typed messages) | Healthy band 5–15% | Too high: the AI is useless. Too low: it may be guessing on things it shouldn't answer. |
| **Rephrase rate** | (help sessions where the user types again within 60 s of an answer) ÷ (help sessions with ≥ 1 typed message) | ≤ 15% | A quick retype is a sign it misunderstood, without needing to ask. |
| **Span verification failure rate** | (model replies whose quoted words are not found in the user's message) ÷ (model replies) | ≤ 2%; alert above 5% | A rising rate means the model is making things up. These replies already fall back safely. |
| **Confidence calibration** | Accuracy among high-confidence replies (≥ 0.85) vs medium-confidence (0.70–0.85), from the weekly sample: (correct high-confidence) ÷ (high-confidence), and the same for medium | High-confidence accuracy ≥ 90% | The 0.7 threshold only works if confidence means something. If medium-confidence replies are often wrong, raise the threshold. |
| **Safety: decline rate and filter violations in production** | As G3 and G4, from the log | 100% and 0 | Compliance holds with real users and adversarial inputs (prompt injection), not just on the test set. |
| **Model error rate** | (requests where the AI didn't respond or returned an invalid reply) ÷ (typed requests) | ≤ 1% | When it errors, users get the fallback. Too many errors make the AI path useless. |

**Planned addition:** a one-tap "Was this helpful? 👍 / 👎" under each answer. **Helpful rate = 👍 ÷ (👍 + 👎)**. Every 👎 goes into the weekly review queue.

---

## 7.6 How we'd prove it works (experiment design)

- **Design:** user-level randomised A/B test among first-year SIP investors. Treatment: failure notification + SIP Back on Track. Control: today's experience.
- **Primary metric:** L1 Recovery₂wd. **Secondary:** Recovery₃₀, L5, B2 (90-day lapse). **Guardrails:** G1–G8, checked weekly with stop rules (e.g. stop if G1 or G2 is significantly worse, or any G4 violation).
- **Hypothesis:** treatment improves Recovery₂wd by **at least 5 percentage points** over control. This is an assumption to set the sample size; the real baseline must come from Groww's data.
- **Sample size (rule of thumb):** for a baseline around 30% and a 5 pp lift at 95% confidence and 80% power, roughly **1,400 failed instalments per group**. Recompute once the real baseline is known.
- **Duration:** 4–6 weeks for L1–L4. B2 needs 90 days after the last enrolment. B1 persistency is read on the cohort a year later, ideally keeping a small long-term holdout (e.g. 5%).
- **Decision rule:** ship if L1 improves significantly **and** no guardrail is worse. Otherwise iterate on the funnel step where people drop (L3 → L4 → completion).

---

# PART 8: RISKS & MITIGATION

Each risk is rated for **likelihood** and **impact** (High / Medium / Low), with the metric that warns us early.

| # | Risk: why the solution might fail | Likelihood | Impact | Early warning metric | Mitigation |
|---|---|---|---|---|---|
| **R1** | **The fix doesn't fit the user's cash flow.** Pay Now is open only 2 working days, but the user's salary arrives later (seen with a real tester: window closed on the 9th, salary on the 10th). They can't act even though they understand. | High | High | L1 low while L3 and L4 are high; L2 clusters at the window's end; Recovery₃₀ much higher than Recovery₂wd | Make **Pay one-time after salary** the main action when the window doesn't fit (read dates from the message). Suggest **moving the SIP date** after salary as the default "next time" step. Send the notification **on the failure day**, not later, to give the full window. |
| **R2** | **Wrong classification leads to a harmful action**, e.g. telling someone whose money already left to "Pay now", so they pay twice. | Medium | High | G2 duplicate payments; action-match rate; sampled accuracy | Priority rule: "money already debited" outranks everything except advice. The debited answer says "don't pay again until you know the status". Low-confidence or unverifiable replies go to the fallback. Release gate + weekly sample review. |
| **R3** | **Regulatory: the product looks like investment advice** (a fund named, returns implied), through model drift or prompt injection ("ignore your instructions…"). | Low (design) | Very high | G3 decline rate < 100%; G4 violations > 0 | The model never writes answer text; answers are reviewed templates only. Output filter on all model text. A deterministic advice/returns safety rule backs up the AI. 100% decline is a release gate. Injection cases are in the test set (currently all declined). Legal/compliance review of templates. |
| **R4** | **Facts go stale**: Groww changes the Pay Now window, button names ("Edit SIP" vs "Change Amount/Date"), or cancellation rules. Answers become wrong without anyone noticing. | Medium | High | G5 ticket rate rises; 👎 rate; support feedback | Every fact lives in one file with its source URL. Monthly fact review with a named owner. "Check in your app" hedging. In a real Groww build, read windows and rules from the system's own config, not copied text. |
| **R5** | **Notification fatigue or anxiety**: users ignore or turn off notifications, or feel shamed or alarmed. | Medium | High | L3 open rate falls; G6 opt-outs rise | One notification per failure, calm wording with no countdowns or red alarms, a clear benefit ("see why and what you can do"). Test wording variants. Respect quiet hours and frequency caps. |
| **R6** | **The real cause is money, not information.** Some users simply can't afford the instalment; a better explanation won't change that. | High | Medium | L1 plateaus; L6 adjustments high; B2 unchanged | Make **skip / reduce / change date** first-class options. Keeping the SIP alive at a smaller amount counts as success. Judge success on B2 lapse and B1 persistency, not only same-month recovery. |
| **R7** | **The AI understands, but the answer misses what the user asked** (category right, intent wrong, e.g. "change date" answered as "skip"). | Medium | Medium | Action-match rate; rephrase rate; direct-question-answered rate | Done in the MVP: the AI also returns which change was asked for (skip / reduce / date) and any direct question ("did I lose my money?"), and the main button and Quick answer follow it. Unclear requests show all options equally. Track action match weekly. |
| **R8** | **Language gap**: Hinglish and regional-language users are understood but get English answers that feel formal, so trust drops. | High | Medium | Trust and 👍 rate lower for Hinglish sessions; rephrase rate by language | Reviewed Hinglish versions of each template (pre-translated and checked, never AI-written on the fly). Then expand to Hindi script and major regional languages, prioritised by usage in the log. |
| **R9** | **Privacy**: users type PAN, account or card numbers; text goes to a third-party AI provider. | Medium | High | Count of redactions in the log; privacy complaints | Personal details removed before storage. A visible "don't type personal information" notice. Minimal logging (no raw IDs), retention limits, a data-processing agreement with the AI provider (or an in-house or India-hosted model). Clear consent in the product. |
| **R10** | **AI outage, quota or cost spike** stops typed help when it's needed. | Medium | Medium | G7 availability, G8 cost, model error rate | Notification and chip paths need no AI and always work. Typed questions fall back to official help links. Rate limits and a daily budget. Alerts on error rate and cost. |
| **R11** | **Small or biased golden set**: 32 messages can't represent all users; good scores may hide weak spots (Hinglish, rare problems). | High | Medium | Gap between golden-set accuracy and sampled production accuracy | Grow to ≥ 300 messages with two labellers (κ ≥ 0.7). Add every 👎 and every production error to the set. Report per-category recall, not just overall accuracy. Avoid tuning the prompt to individual test rows. |
| **R12** | **We can't prove it caused the improvement** (seasonality, salary cycles, other app changes). | Medium | Medium | — | User-level randomised holdout, pre-registered primary metric (L1) and guardrails, a long-term 5% holdout for persistency (B1). |
| **R13** | **Integration dependency**: the MVP is a concept. A real version needs failure events, payment status, deep links into Pay Now / Edit SIP, and the user's real SIP dates. | High | High | — | Phase it. (1) Notification + deep link to the existing Pay Now (no AI). (2) Help screen with chips. (3) Typed AI help behind the eval gate. Each phase delivers value on its own. |
| **R14** | **Users may be steered towards stopping**, or feel judged for missing, especially in the "Should I stop?" flow. | Low | High | G1 cancellations after help | Neutral options shown equally with no recommended button, "this assistant doesn't tell you which option to pick", no fear or FOMO wording (blocked by the filter), and regular review of real "stop" sessions. |

### The 3 risks to watch most closely
1. **R1, the timing/cash-flow mismatch:** the most likely reason recovery doesn't improve even when everything else works. A real tester already hit it.
2. **R3, regulatory advice risk:** low likelihood by design, but one incident would be very costly. That's why it's a hard gate, not just a metric.
3. **R2, wrong action / double payment:** a wrong answer that costs the user money destroys trust fastest. G2 is monitored from day 1.

---

*Evidence used: MVP eval (31/32, declines 7/7, 0 violations), the interaction log from real testers, PM-run sessions (P1, P2), and a clearly labelled simulated dry run. Targets marked as hypotheses need Groww's real baseline data before launch.*
