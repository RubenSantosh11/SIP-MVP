// SIP Back on Track – front end. All answer text comes from /api/help (templates + facts); this file only lays it out.
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const CHIPS = ["My instalment failed", "It's been pending for days", "Money left my bank but doesn't show",
  "Bank charged me a fine", "I want to pause or skip a month", "Should I stop my SIP?"];

// Scenarios use the chip path (no AI). Each has a fixed demo date so every tester sees the same cut-off.
const FAILED_ON = new Date(2026, 10, 5); // 5 Nov 2026
const SCENARIOS = {
  failed: { chip: "My instalment failed", status: ["failed", "Failed"], today: new Date(2026, 10, 6),
    msg: "Your ₹1,000 SIP instalment for 5 Nov didn't go through. See why and what you can do." },
  pending: { chip: "It's been pending for days", status: ["pending", "Pending"], today: new Date(2026, 10, 9),
    msg: "Your ₹1,000 SIP instalment for 5 Nov is still pending. See what's happening and what you can do." },
  fine: { chip: "Bank charged me a fine", status: ["failed", "Failed"], today: new Date(2026, 10, 6),
    msg: "Your ₹1,000 SIP instalment for 5 Nov didn't go through, and your bank may have charged a fee. See why and what you can do." },
};
let scen = "failed", GATE = null;
const SOURCE_TITLES = {
  "https://groww.in/help/mutual-funds/order/why-did-my-installment-fail--25": "Why did my instalment fail? (Groww help)",
  "https://groww.in/help/mutual-funds/mf-sip/how-do-i-pay-for-a-missed-installment-3": "How do I pay a missed instalment? (Groww help)",
  "https://groww.in/help/mutual-funds/mf-dashboard/what-happens-if-i-pay-after-date-shown-on-pending-sip--42": "Paying after the date on a pending SIP (Groww help)",
  "https://groww.in/help/mutual-funds/mf-autopay/what-are-ecs-charges--96": "What are ECS charges? (Groww help)",
  "https://www.kotakmf.com/Information/blogs/why-did-sip-installment-failed": "Why did my SIP instalment fail? (Kotak MF blog)",
  "https://groww.in/help/mutual-funds/order/can-i-pause-sip-for-next-month": "Can I pause my SIP for next month? (Groww help)",
  "https://groww.in/help/mutual-funds/mf-sip/what-is-the-maximum-period-for-which-i-can-skip-my-sip-installments--63": "How long can I skip SIP instalments? (Groww help)",
  "https://groww.in/help/mutual-funds/mf-sip/how-to-cancel-my-sip": "How can I cancel an ongoing SIP? (Groww help)",
  "https://groww.in/help/mutual-funds/mf-sip/how-to-change-sip-date-or-amount": "How can I change my SIP date or amount? (Groww help)",
  "https://groww.in/blog/how-to-edit-sip-on-groww": "How to edit a SIP on Groww (Groww blog)",
  "https://groww.in/help/mutual-funds/discoverable/when-can-i-edit-my-sip--29": "When can I edit my SIP? (Groww help)",
};

const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
function addWorkingDays(d, n) { // Pay Now usually shows for 2 working days; weekends skipped
  const x = new Date(d);
  while (n > 0) { x.setDate(x.getDate() + 1); const w = x.getDay(); if (w !== 0 && w !== 6) n--; }
  return x;
}
const sameDay = (a, b) => a.toDateString() === b.toDateString();

// Split template text into its first sentence and the rest (layout only; wording untouched).
function split(s) {
  const m = String(s || "").match(/^(.+?(?<!\be\.g|\bi\.e)[.!?])\s+(?=[A-Z'"(])/);
  return m ? [m[1], s.slice(m[0].length)] : [String(s || ""), ""];
}

// ---------- scenario + notification ----------
function setScenario(s) {
  scen = s;
  document.querySelectorAll("#seg button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.s === s)));
  const sc = SCENARIOS[s];
  $("notifMsg").textContent = sc.msg;
  $("demoDate").textContent = `Demo date: ${fmt(sc.today)}`;
  $("sipStatus").className = "status " + sc.status[0];
  $("sipStatus").textContent = "Status: " + sc.status[1];
  $("stageNotif").hidden = false; $("stageSip").hidden = true; $("result").hidden = true;
}
document.querySelectorAll("#seg button").forEach((b) => b.addEventListener("click", () => setScenario(b.dataset.s)));
$("notif").addEventListener("click", () => {
  $("stageNotif").hidden = true; $("stageSip").hidden = false; $("whatBtn").focus();
});
$("whatBtn").addEventListener("click", () => ask({ chip: SCENARIOS[scen].chip }, $("whatBtn")));

// ---------- primary action (layout choice per category; text from templates) ----------
function payWindow() {
  const sc = SCENARIOS[scen], cutoff = addWorkingDays(FAILED_ON, 2);
  return { open: sc.today <= cutoff, cutoff, today: sc.today };
}
const BREAK = {
  skip: { i: 0, label: "Skip next instalment", sheet: "This would open Edit SIP → Skip instalment for this SIP.", read: "skip an instalment" },
  reduce: { i: 1, label: "Reduce the amount", sheet: "This would open Edit SIP / Change Amount/Date to lower the amount.", read: "reduce the amount" },
  change_date: { i: 2, label: "Change the SIP date", sheet: "This would open Edit SIP / Change Amount/Date to pick a new date.", read: "change the SIP date" },
};
function plan(cat, actions, u = {}) {
  const w = payWindow();
  const until = sameDay(w.cutoff, w.today) ? `today, ${fmt(w.cutoff)}` : fmt(w.cutoff);
  const pay = (i) => ({ i, payNow: w.open, label: w.open ? `Pay now (open until ${until})` : "Pay for this month (one-time)",
    sheet: w.open ? "This would open Groww's Pay Now screen for the 5 Nov instalment." : "This would open the Pay one-time screen for this SIP." });
  switch (cat) {
    case "failed_low_balance": case "pending_processing": return pay(w.open ? 0 : 1);
    case "bank_charge": return pay(1);
    case "failed_autopay_issue": return { i: 0, label: "Check AutoPay", sheet: "This would open the AutoPay details for this SIP." };
    case "debited_not_reflected": return { i: 0, label: "Check order status", sheet: "This would open the order history for this SIP." };
    case "wants_break": return BREAK[u.break_option] || null; // unclear which change → show all options equally
    default: return null; // considering_stop, declines and fallback: no single recommended action
  }
}

function confWord(c) { return c >= 0.85 ? "high" : c >= 0.7 ? "medium" : "low"; }
function quality(r) {
  const u = r.understood;
  if (u.decided_by === "chip") return `I read this as: <strong>${esc(u.label)}</strong>, from the SIP's status (no AI needed).`;
  if (!u.category) return "I wasn't sure what you meant, so here's where to get a reliable answer.";
  const basis = u.evidence_span ? `based on ‘${esc(u.evidence_span)}’` : "based on your message";
  return `I read this as: <strong>${esc(u.label)}</strong>, ${basis} (${confWord(u.confidence ?? 0)} confidence).`;
}
function badge() {
  const s = GATE && GATE.summary;
  if (!s) return `<a class="badge" href="eval.html">Answers are being checked – see how</a>`;
  const declines = s.decline_rate >= 1 ? "fund-advice requests always declined" : "fund-advice declines under review";
  const draft = s.labels_status === "hand_labelled" ? "" : " (labels still being reviewed)";
  return `<a class="badge" href="eval.html">Answers checked on ${s.n} test messages: ${s.correct} right · ${declines}${draft}</a>`;
}

// The path line is the sentence with the in-app path (→); every other sentence goes under "How it works".
function pathAndMore(where) {
  const parts = String(where || "").split(/(?<=[.!?])(?<!\be\.g\.|\bi\.e\.)\s+(?=[A-Z'"(])/);
  let i = parts.findIndex((x) => x.includes("→"));
  if (i < 0) i = 0;
  return [parts[i], parts.filter((_, j) => j !== i).join(" ")];
}
function howHTML(more) {
  return more ? `<details class="how"><summary>How it works</summary><div class="in">${esc(more)}</div></details>` : "";
}
function stepHTML(a) {
  const [path, more] = pathAndMore(a.where);
  return `<div class="opt"><b>${esc(a.do)}</b><span class="path">${esc(path)}</span>${howHTML(more)}</div>`;
}

function highlight(text, span) {
  const i = span ? text.toLowerCase().indexOf(span.toLowerCase()) : -1;
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + span.length)) + "</mark>" + esc(text.slice(i + span.length));
}
// For typed questions: show how the AI read the message, up front.
function aiReadHTML(r, text) {
  const u = r.understood;
  let h = `<div class="read"><span class="lbl"><span class="ai-tag">AI</span>How the AI read your message</span><q>${highlight(text, u.evidence_span)}</q>`;
  if (u.decided_by === "safe_mode") h += `<span>The AI is switched off until its quality check passes, so here are reliable places to look.</span>`;
  else if (!u.category) h += `<span>It wasn't sure enough to answer (${esc({ low_confidence: "low confidence", span_not_found: "it couldn't point to the words it relied on", out_of_scope: "this doesn't look like a SIP payment question", model_unavailable: "it didn't respond", rate_limited: "too many questions this hour" }[r.fallback_reason] || "unclear")}), so here are reliable places to look instead of a guess.</span>`;
  else h += `<span class="arrow">→ <strong>${esc(u.label)}</strong>${BREAK[u.break_option] && u.category === "wants_break" ? ` · you asked to <strong>${BREAK[u.break_option].read}</strong>` : ""} · ${confWord(u.confidence ?? 0)} confidence${u.evidence_span ? " · the highlighted words are what it relied on" : ""}</span>`;
  return h + `</div>`;
}

function render(r, text) {
  const a = r.answer, u = r.understood, el = $("result");
  const [head, rest] = split(a.happened);
  const p = a.kind === "answer" ? plan(u.category, a.actions, u) : null;
  let h = text ? aiReadHTML(r, text) : "";
  if (a.quick_answer) h += `<div class="quick"><span class="lbl">Quick answer</span><p>${esc(a.quick_answer)}</p></div>`;
  h += `<p class="headline">${esc(head)}</p>`;
  if (rest) h += `<p class="sub">${esc(rest)}</p>`;
  if (p) {
    const pa = a.actions[p.i];
    h += `<button class="btn" data-sheet="${esc(p.sheet)}">${esc(p.label)}</button>`;
    // "Pay now" must show the Pay Now sentence, not the one-time route that may follow it.
    const [pp, pm] = p.payNow ? split(pa.where) : pathAndMore(pa.where);
    h += `<div class="opt"><span class="path">${esc(pp)}</span>${howHTML(pm)}</div>`;
    if (a.next) h += `<p class="next">${esc(a.next)}</p>`;
    const others = a.actions.filter((_, i) => i !== p.i);
    if (others.length) h += `<details><summary>Other options</summary><div class="in">${others.map(stepHTML).join("")}</div></details>`;
  } else {
    h += `<div class="in" style="display:flex;flex-direction:column;gap:12px">${a.actions.map(stepHTML).join("")}</div>`;
    if (a.next) h += `<p class="next">${esc(a.next)}</p>`;
  }
  const li = (l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`;
  if (a.kind !== "answer") {
    // Fallback / decline: reliable places to go, shown openly (not collapsed).
    let g = `<div class="help"><h3>Get a reliable answer</h3><ul class="plain">`;
    const isDecline = a.kind === "decline";
    if (text && !isDecline) g += `<li><a href="https://www.google.com/search?q=${encodeURIComponent("site:groww.in/help " + text)}" target="_blank" rel="noopener">Search Groww's help pages for “${esc(text.length > 60 ? text.slice(0, 57) + "…" : text)}”</a> <span class="muted small">(opens Google)</span></li>`;
    g += (a.general_help_links || []).map(li).join("") + `</ul>`;
    if (!isDecline && (a.help_links || []).length) g += `<p class="small muted" style="margin-top:8px">If it's about a SIP payment:</p><ul class="plain">${a.help_links.map(li).join("")}</ul>`;
    h += g + `</div><div class="chips" data-chips></div>`;
  } else {
    const links = a.sources.map((x) => ({ label: SOURCE_TITLES[x] || x.replace(/^https:\/\/(www\.)?/, ""), url: x }));
    const gtk = a.good_to_know || [];
    // Good to know is shown openly: it often answers the user's real worry (e.g. "will one skip cancel my SIP?").
    if (gtk.length) h += `<div class="gtk"><h3>Good to know</h3><ul class="plain">${gtk.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>`;
    h += `<details><summary>Sources</summary><div class="in">`;
    h += `<div><h3 class="sr">Sources</h3><ul class="plain">${links.map(li).join("")}</ul></div>`;
    h += `<p class="small muted">Facts come from public help pages. Check in your app for your own SIP.</p></div></details>`;
  }
  // Typed questions already show "How the AI read your message" at the top, so only the badge here.
  h += `<div class="qc">${text ? "" : `<span>${quality(r)}</span>`}<span>${badge()}</span></div>`;
  el.innerHTML = h; el.hidden = false;
  el.querySelectorAll("[data-sheet]").forEach((b) => b.addEventListener("click", () => openSheet(b.dataset.sheet)));
  el.querySelectorAll("[data-chips]").forEach(renderChips);

  el.focus({ preventScroll: true });
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function ask(body, btn) {
  const st = $("askStatus");
  if (btn) btn.disabled = true;
  st.textContent = body.text ? "Reading…" : "";
  try {
    const res = await fetch("/api/help", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const r = await res.json();
    if (!res.ok || r.error) { st.innerHTML = `<span class="err">${esc(r.error || "Something went wrong. Try an option below.")}</span>`; return; }
    if (r.gate) setGate(r.gate);
    st.textContent = "";
    render(r, body.text || "");
  } catch (e) {
    st.innerHTML = `<span class="err">Couldn't reach the helper. Try again, or use an option below.</span>`;
  } finally { if (btn) btn.disabled = false; }
}

function renderChips(el) {
  el.innerHTML = CHIPS.map((c) => `<button class="chip" data-chip="${esc(c)}">${esc(c)}</button>`).join("");
  el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => ask({ chip: b.dataset.chip })));
}
function setGate(g) { GATE = g; $("safeNote").hidden = !!g.passed; $("aiBadge").innerHTML = badge(); }

const EXAMPLES = ["pending since Monday", "bank cut 590", "paisa kat gaya par SIP nahi dikha", "which fund should I buy?"];
$("examples").innerHTML = EXAMPLES.map((x) => `<button class="chip ex" data-ex="${esc(x)}">${esc(x)}</button>`).join("");
$("examples").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
  $("q").value = b.dataset.ex; ask({ text: b.dataset.ex }, $("ask"));
}));

function openSheet(text) {
  $("sheetText").textContent = text;
  const d = $("sheet");
  if (d.showModal) d.showModal(); else d.setAttribute("open", "");
}
$("sheetClose").addEventListener("click", () => $("sheet").close());
$("sheet").addEventListener("click", (e) => { if (e.target === $("sheet")) $("sheet").close(); });

$("ask").addEventListener("click", () => { const t = $("q").value.trim(); if (t) ask({ text: t }, $("ask")); });
$("q").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) $("ask").click(); });
renderChips($("chips"));
setScenario("failed");
fetch("/api/help").then((r) => r.json()).then((j) => setGate(j.gate)).catch(() => {});
