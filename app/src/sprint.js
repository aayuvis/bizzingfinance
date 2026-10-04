/* sprint.js — sixty seconds of typed amounts (audit v4, F2 "a 60-second typed-amount sprint
   from generate.js").

   Practice, not evidence: the questions are the town's own generated amounts on ideas the
   child has already met (mastery.isMet), sized to the maths they have shown (mathsCeiling).
   Nothing is paid and nothing is recorded but a personal best — the mastery record hears
   only from spaced retrieval, and coins only come from the family's standard events. The
   clock is the wall's (performance.now), keyboard and touch both answer, and a wrong amount
   simply moves on with the right one shown: speed rounds should not hold. Loaded on demand. */
import { R } from './runtime.js';
import * as sim from './sim.js';
import * as mastery from './mastery.js';
import { mathsCeiling } from './ledger.js';
import { OBJECTIVES } from './objectives.js';
import { GEN, genCard } from './generate.js';
import { esc, on, sfx } from './ui.js';

const LEN = 60000;
const K = () => sim.kid(R.s);

/* the typed-amount objectives the child has met (or, before any, the first ones taught) */
export function pool(c) {
  const num = OBJECTIVES.filter((o) => GEN[o.id] && genCard(o, 1, { ceil: 8 }).drill.kind === 'num');
  const met = num.filter((o) => mastery.isMet(c, o.id));
  return met.length >= 2 ? met : num.slice(0, 3);
}
function next(st) {
  const c = K(), p = pool(c), o = p[st.n % p.length];
  st.card = genCard(o, 9000 + st.seed + st.n * 13, { ceil: mathsCeiling(c) });
  st.n++;
}
function start() {
  const st = R.sprint = { t0: performance.now(), seed: Date.now() % 997, n: 0, right: 0, done: false, last: null };
  next(st); R.render(); tick();
}
function left() { const st = R.sprint; return st ? Math.max(0, LEN - (performance.now() - st.t0)) : 0; }
function tick() {
  const st = R.sprint; if (!st || st.done) return;
  const ms = left(), el = document.getElementById('spTime');
  if (el) el.textContent = Math.ceil(ms / 1000);
  if (ms <= 0) { finish(); return; }
  setTimeout(tick, 200);
}
function finish() {
  const st = R.sprint; st.done = true;
  const c = K(); c.sprint = c.sprint || { best: 0 };
  st.best = st.right > c.sprint.best; if (st.best) c.sprint.best = st.right;
  sim.save(R.s); sfx.level(); R.render();
}
function answer() {
  const st = R.sprint; if (!st || st.done) return;
  const el = document.getElementById('spAns'), raw = el ? el.value : '';
  if (!String(raw).trim()) return;
  const n = Number(String(raw).replace(/[^\d.-]/g, '')), ok = n === st.card.drill.value;
  if (ok) { st.right++; sfx.good(); } else sfx.bad();
  st.last = { ok, q: st.card.drill.q, value: st.card.drill.value };
  next(st); R.render();
  const nx = document.getElementById('spAns'); if (nx) nx.focus();
}

export function viewSprint() {
  const c = K(), st = R.sprint, best = (c.sprint && c.sprint.best) || 0;
  if (!st) return `<div class="stack"><button class="backlink" data-act="shelf" data-arg="">← The Atlas</button>
    <header class="shero"><div><span class="eyebrow">Practice · a sprint</span><h1>Sixty seconds</h1>
      <p class="small">Amounts from ideas you have met, one after another. Type the answer, press Enter. Nothing is paid — it is how fast the sums come to you.</p></div></header>
    <div class="card"><p>${best ? `Your best: <b>${best}</b> right in a minute.` : 'No sprint yet.'}</p>
      <button class="btn wide" data-act="spStart">Start the clock</button></div></div>`;
  if (st.done) return `<div class="stack"><header class="shero"><div><span class="eyebrow">Practice · a sprint</span><h1>${st.right} right</h1>
      <p class="small">${st.best ? 'A new best.' : `Your best is ${best}.`} ${st.n - 1} asked in sixty seconds.</p></div></header>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" data-act="spStart">Again</button><button class="btn ghost" data-act="spLeave">Back to the Atlas</button></div></div>`;
  const d = st.card.drill;
  return `<div class="stack sprint"><div class="hud"><span class="box"><span id="spTime">${Math.ceil(left() / 1000)}</span>s</span><span class="box">${st.right} right</span><span class="grow"></span><button class="btn ghost sm" data-act="spLeave">Leave</button></div>
    <div class="card stack"><h3 style="font-size:19px">${esc(d.q)}</h3>
      <div class="numrow"><label class="yamt"><span class="sr">Your answer</span><input id="spAns" inputmode="numeric" pattern="[0-9]*" autocomplete="off" enterkeyhint="next" data-enter="spAnswer" aria-label="Your answer — type the amount" autofocus></label>
        <button class="btn" data-act="spAnswer">Next</button></div>
      ${st.last ? `<p class="small" style="color:${st.last.ok ? 'var(--grow)' : 'var(--spend)'};font-weight:700">${st.last.ok ? 'Right.' : 'That one was ' + esc(String(st.last.value)) + '.'}</p>` : ''}</div></div>`;
}

on('spStart', start);
on('spAnswer', answer);
on('spLeave', () => { R.sprint = null; R.s.ui.nav = 'learn'; R.render(); });
