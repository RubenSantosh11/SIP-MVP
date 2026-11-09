const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pct = (x) => (x == null ? "–" : Math.round(x * 100) + "%");

function renderEval(EVAL, GATE) {
  const el = $("evalBody"), s = EVAL && EVAL.summary;
  if (!s) { el.innerHTML = `<p>No eval has run yet, so the assistant is in safe mode.</p>`; return; }
  const g = EVAL.gate || {};
  let h = `<p>${s.labels_status === "hand_labelled"
    ? `Golden set of <strong>${s.n}</strong> real messages (research interviews, app-store reviews, YouTube comments, plus off-topic inputs), each labelled by hand by the PM before the model was scored.`
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
  if (f.length) h += `<h3>Failure examples</h3>${f.map((x) => `<div class="box"><p>“${esc(x.text)}”</p>
    <p class="muted">Expected <span class="mono">${esc(x.expected)}</span> · got <span class="mono">${esc(x.got)}</span>${x.confidence != null ? ` (${Number(x.confidence).toFixed(2)})` : ""} · ${esc(x.why)}</p></div>`).join("")}`;
  h += `<h3>PM corrections</h3><p class="muted small">${esc(EVAL.corrections_note || "Placeholder: corrections to labels, prompt or templates after reviewing failures will be listed here.")}</p>`;
  h += `<p class="muted small">How it works: the AI only picks a category and quotes the words it relied on; the quote must appear in the user's message. Answers come from reviewed templates and public help-page facts. If the latest eval misses the gate, the site switches to safe mode automatically. Files: <span class="mono">mvp/golden_set.csv</span>, <span class="mono">mvp/run_eval.py</span>, <span class="mono">outputs/mvp_eval.json</span>.</p>`;
  el.innerHTML = h;
}

function renderReview(R) {
  const el = $("reviewBody");
  if (!R) { el.innerHTML = `<p class="muted">Not available.</p>`; return; }
  el.innerHTML = `<p class="muted small">Every template line about skipping, reducing, changing the date or cancelling was checked by the PM against Groww help pages (${esc(R.reviewed_on)}). Only pages we could read are cited.</p>` +
    R.rows.map((r) => `<div class="box"><p><strong>${esc(r.line)}</strong> · ${esc(r.answer)}</p><p class="muted">Before: ${esc(r.before)}</p><p>Now: ${esc(r.after)}</p><p class="muted">${
      r.sources.map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https:\/\/(www\.)?groww\.in\/(help\/mutual-funds\/)?/, ""))}</a>`).join(" · ")}</p></div>`).join("");
}

let EVAL = null, GATE = null, REVIEW = null;
Promise.all([
  fetch("/api/help").then((r) => r.json()).then((j) => { GATE = j.gate; }).catch(() => {}),
  fetch("/outputs/mvp_eval.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { EVAL = j; }).catch(() => {}),
  fetch("/mvp/pm_template_review.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { REVIEW = j; }).catch(() => {}),
]).then(() => { renderEval(EVAL, GATE); renderReview(REVIEW); });
