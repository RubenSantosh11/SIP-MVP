const CHIPS = ["My instalment failed", "It's been pending for days", "Money left my bank but doesn't show",
  "Bank charged me a fine", "I want to pause or skip a month", "Should I stop my SIP?"];
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let GATE = null, EVAL = null;

function renderChips(el) {
  el.innerHTML = CHIPS.map((c) => `<button class="chip" data-chip="${esc(c)}">${esc(c)}</button>`).join("");
  el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => ask({ chip: b.dataset.chip })));
}

function badgeHTML() {
  const s = GATE && GATE.summary;
  if (!s) return `<a class="badge safe" href="/#eval">Quality check: not run yet</a>`;
  const pct = Math.round(s.accuracy * 100);
  const cls = GATE.passed ? "badge" : "badge safe";
  const draft = s.labels_status === "hand_labelled" ? "" : " · DRAFT labels";
  return `<a class="${cls}" href="/#eval">Checked against golden set: ${s.correct}/${s.n} correct (${pct}%) · advice requests declined: ${Math.round(s.decline_rate * 100)}%${draft}</a>`;
}

// Deterministic helper: Pay Now usually shows for 2 working days after a low-balance failure (weekends skipped).
function addWorkingDays(d, n) {
  const x = new Date(d);
  while (n > 0) { x.setDate(x.getDate() + 1); const w = x.getDay(); if (w !== 0 && w !== 6) n--; }
  return x;
}
const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
function helperHTML() {
  return `<div class="helper"><label for="failDate"><strong>When did it fail?</strong></label>
    <div class="row"><input type="date" id="failDate"><span class="muted small">Check the date on the SIP or your bank SMS.</span></div>
    <p id="helperOut" class="small"></p></div>`;
}
function wireHelper() {
  const inp = $("failDate"); if (!inp) return;
  inp.addEventListener("change", () => {
    const out = $("helperOut");
    if (!inp.value) { out.textContent = ""; return; }
    const [y, m, d] = inp.value.split("-").map(Number);
    const failed = new Date(y, m - 1, d), cutoff = addWorkingDays(failed, 2);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (failed > today) { out.textContent = "That date is in the future. Pick the day the instalment failed."; return; }
    out.innerHTML = today <= cutoff
      ? `Pay Now usually shows on the dashboard until about <strong>${fmt(cutoff)}</strong> (2 working days, weekends skipped; bank holidays can shift it). If it's showing, you can pay from there.`
      : `The usual Pay Now window (until about ${fmt(cutoff)}) has passed. You can still pay for the month: My SIPs → choose the SIP → "Pay one-time" → enter the amount. The NAV is the one for when the payment completes. Some funds don't accept one-time payments.`;
    out.innerHTML += ` <span class="muted">Check in your app for your SIP.</span>`;
  });
}

function highlight(text, span) {
  if (!span) return esc(text);
  const i = text.toLowerCase().indexOf(span.toLowerCase());
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + span.length)) + "</mark>" + esc(text.slice(i + span.length));
}

const REASONS = { low_confidence: "confidence below 0.7", span_not_found: "the quoted words weren't found in your message",
  out_of_scope: "not about a SIP payment", safe_mode: "safe mode is on", model_unavailable: "the model didn't respond",
  rate_limited: "too many questions this hour" };

function renderResult(r, text) {
  const a = r.answer, u = r.understood, el = $("result");
  const title = a.kind === "decline" ? "What I can help with" : a.kind === "fallback" ? "Let's find the right help" : "What most likely happened";
  let h = `<div class="answer">`;
  if (text) h += `<p class="muted small">You said: “${highlight(text, u.evidence_span)}”</p>`;
  h += `<div><p class="label">${title}</p><p>${esc(a.happened)}</p></div>`;
  h += `<div><p class="label">${a.kind === "answer" ? "What you can do now" : "Next step"}</p><ol>${a.actions.map((x) =>
    `<li>${esc(x.do)}<span class="where">${esc(x.where)}</span></li>`).join("")}</ol></div>`;
  if (a.show_date_helper) h += helperHTML();
  if (a.next) h += `<div><p class="label">What happens next</p><p>${esc(a.next)}</p></div>`;
  if (a.kind !== "answer") h += `<div class="row" id="resChips"></div>`;
  const links = a.help_links || a.sources.map((u) => ({ label: u.replace(/^https:\/\/(www\.)?/, ""), url: u }));
  if (links.length) h += `<div><p class="label">${a.help_links ? "Official help" : "Sources"}</p><ul class="links">${links.map((l) =>
    `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join("")}</ul></div>`;
  // Visible quality check
  let qc = "Understood as: ";
  if (u.decided_by === "chip") qc += `${esc(u.label)} · from the option you tapped (no AI used)`;
  else if (u.category) {
    qc += `${esc(u.label)} · confidence ${u.confidence != null ? Number(u.confidence).toFixed(2) : "–"}`;
    if (u.evidence_span) qc += ` · matched: <code>'${esc(u.evidence_span)}'</code>`;
    if (u.decided_by === "safety_rule") qc += " · advice/returns safety rule applied";
  } else {
    qc += `not sure (${esc(REASONS[r.fallback_reason] || r.fallback_reason || "unclear")})`;
    if (u.model_category) qc += ` · model guess: ${esc(u.model_category)} at ${Number(u.confidence).toFixed(2)}`;
  }
  if (r.filter && r.filter.dropped_model_text) qc += " · output filter removed model text";
  h += `<div class="qc"><span>${qc}</span><span>${badgeHTML()}</span></div>`;
  h += `<p class="muted small">${esc(r.disclaimer)}</p></div>`;
  el.innerHTML = h; el.hidden = false;
  if ($("resChips")) renderChips($("resChips"));
  wireHelper();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function ask(body) {
  const btn = $("ask"), st = $("status");
  btn.disabled = true; st.textContent = "Looking…";
  try {
    const res = await fetch("/api/help", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const r = await res.json();
    if (!res.ok || r.error) { st.innerHTML = `<span class="err">${esc(r.error || "Something went wrong. Try an option below.")}</span>`; return; }
    if (r.gate) { GATE = r.gate; $("safeBanner").hidden = GATE.passed; }
    st.textContent = "";
    renderResult(r, body.text || "");
  } catch (e) {
    st.innerHTML = `<span class="err">Couldn't reach the helper. Try again, or use the official help links below.</span>`;
  } finally { btn.disabled = false; }
}

$("ask").addEventListener("click", () => { const t = $("q").value.trim(); if (t) ask({ text: t }); });
$("q").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) $("ask").click(); });
renderChips($("chips"));

// ---- Eval section ----
function pct(x) { return x == null ? "–" : Math.round(x * 100) + "%"; }
function renderEval() {
  const el = $("evalBody"), s = EVAL && EVAL.summary;
  if (!s) { el.innerHTML = `<p>No eval has run yet, so the assistant is in safe mode.</p>`; return; }
  const g = EVAL.gate || {};
  let h = `<p>${s.labels_status === "hand_labelled"
    ? `Golden set of <strong>${s.n}</strong> real messages (research interviews, app-store reviews, forum posts, plus off-topic inputs), each labelled by hand by the PM before the model was scored.`
    : `<strong>DRAFT:</strong> ${s.n} messages with draft labels. The PM still has to hand-label them; these numbers are not final.`}
    Every item goes through the same code path as the live site. Run on ${esc(EVAL.run_at)} with <span class="mono">${esc(EVAL.model)}</span>.</p>`;
  h += `<div class="stats">
    <div class="stat"><b>${s.correct}/${s.n}</b>correct (${pct(s.accuracy)}) · gate ≥ ${pct(g.accuracy_min)}</div>
    <div class="stat"><b>${pct(s.decline_rate)}</b>advice &amp; returns asks declined (${s.decline_ok}/${s.decline_n}) · gate 100%</div>
    <div class="stat"><b>${s.filter_violations}</b>filter violations reached the screen · gate 0</div>
    <div class="stat"><b>${pct(s.fallback_rate)}</b>sent to fallback (${s.fallback_n}/${s.n})</div>
  </div>`;
  h += `<p><span class="${GATE && GATE.passed ? "badge" : "badge safe"}">${GATE && GATE.passed ? "Gate passed: AI classification is live" : "Gate not passed: safe mode"}</span>
    <span class="muted small">${esc(GATE ? GATE.reason : "")}</span></p>`;
  const pc = EVAL.per_category || {};
  h += `<div class="scroll"><table><thead><tr><th>Category</th><th class="n">Items</th><th class="n">Precision</th><th class="n">Recall</th></tr></thead><tbody>${
    Object.entries(pc).map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${v.support}</td><td class="n">${pct(v.precision)}</td><td class="n">${pct(v.recall)}</td></tr>`).join("")}</tbody></table></div>`;
  const f = (EVAL.failures || []).slice(0, 3);
  if (f.length) h += `<h3>Failure examples</h3>${f.map((x) => `<div class="helper small"><p>“${esc(x.text)}”</p>
    <p class="muted">Expected <span class="mono">${esc(x.expected)}</span> · got <span class="mono">${esc(x.got)}</span>${x.confidence != null ? ` (${Number(x.confidence).toFixed(2)})` : ""} · ${esc(x.why)}</p></div>`).join("")}`;
  h += `<h3>PM corrections</h3><p class="muted small">${esc(EVAL.corrections_note || "Placeholder: corrections to labels, prompt or templates after reviewing failures will be listed here.")}</p>`;
  h += `<p class="muted small">How it works: the AI only picks a category and quotes the words it relied on; the quote must appear in your message. Answers come from reviewed templates and public help-page facts. If the latest eval misses the gate, the site switches to safe mode automatically. Files: <span class="mono">mvp/golden_set.csv</span>, <span class="mono">mvp/run_eval.py</span>, <span class="mono">outputs/mvp_eval.json</span>.</p>`;
  el.innerHTML = h;
}

Promise.all([
  fetch("/api/help").then((r) => r.json()).then((j) => { GATE = j.gate; $("safeBanner").hidden = GATE.passed; }).catch(() => {}),
  fetch("/outputs/mvp_eval.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { EVAL = j; }).catch(() => {}),
]).then(renderEval);
