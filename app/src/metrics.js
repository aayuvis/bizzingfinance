/* metrics.js — the daily goal: three numbers a child sets for themselves (Bizzing Bee's
   "Daily targets", in Finance's terms).

     App time        minutes with Bizzing Money on screen, anywhere in it
     Practise time   minutes on a LEARNING surface only: a lesson stop, a question asked
                     again later, practice, Ones to try again, the Atlas, the Library's
                     tools, Money Words, the Coach. The clock stops in the games, the
                     Town, the stores and My Feed, so it cannot be filled by playing.
     Questions right first-try right answers to the app's own learning questions.

   Why "Questions right" and not Bee's word count: the honest measure of a money lesson is
   the question answered right FIRST time — the same event the family wallet pays its
   'answer' coin for, at the same call sites in main.js (a lesson's or a revisit's question,
   a typed amount, a Your-turn task, Ones to try again). A second-go answer is learning, not
   evidence (drill.js), so it is not counted; a game scores decisions, not answers, so it is
   not counted either. Every first answer, right or wrong, is also counted (`asked`), so the
   Coach can say first-try accuracy as a measurement rather than a guess.

   Never a run of days. The log is per day and the chart counts days on target in the last
   thirty; a missed day is a short bar, never a loss message.

   Time is stored in SECONDS, targets in MINUTES. The log keeps about 120 days. DOM-free:
   test/coach.mjs drives it. */

export const TGT_DEF = { app: 30, prac: 15, right: 10 };
export const TGT_RANGE = { app: [5, 120, 5], prac: [5, 60, 5], right: [3, 40, 1] };   /* min, max, step */
export const TICK = 15;                       /* seconds per tick of the clock in main.js */
const KEEP = 120, TRIM_AT = 140;

/* The surfaces where the practice clock runs. `nav` is the route; `ov` the open overlay. */
export const LEARN_NAVS = ['learn', 'mistakes', 'library', 'sprint', 'words', 'coach'];
/* overlays that are themselves learning, wherever they open: a checkpoint, the word of the
   hour's ten-second check, a stop just finished, a place answered cold, Pip's counting */
export const LEARN_OVERLAYS = ['quiz', 'wordCheck', 'stopDone', 'coldPlaceDone', 'placement'];
export function learningNow(s) {
  if (!s || s.game) return false;
  if (s.ov) return LEARN_OVERLAYS.includes(s.ov);
  return LEARN_NAVS.includes(s.nav);
}

const pad = (n) => String(n).padStart(2, '0');
export function dayKey(t = Date.now()) { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export function targets(c) {
  const t = (c && c.tgt) || {};
  const one = (k) => { const [lo, hi] = TGT_RANGE[k], v = Math.round(+t[k]); return Number.isFinite(v) && v > 0 ? Math.min(hi, Math.max(lo, v)) : TGT_DEF[k]; };
  return { app: one('app'), prac: one('prac'), right: one('right') };
}
/* Settings: one step up or down, kept inside its range */
export function stepTarget(c, k, dir) {
  if (!TGT_RANGE[k]) return null;
  const [lo, hi, st] = TGT_RANGE[k], cur = targets(c)[k];
  c.tgt = { ...targets(c), [k]: Math.min(hi, Math.max(lo, cur + (dir < 0 ? -st : st))) };
  return c.tgt[k];
}

export function dayLog(c, key) {
  if (!c.dayLog) c.dayLog = {};
  const k = key || dayKey();
  const d = c.dayLog[k] || (c.dayLog[k] = {});
  ['app', 'prac', 'right', 'asked'].forEach((f) => { if (!(d[f] >= 0)) d[f] = 0; });
  return d;
}
function trim(c) {
  const ks = Object.keys(c.dayLog || {});
  if (ks.length > TRIM_AT) ks.sort().slice(0, ks.length - KEEP).forEach((k) => { delete c.dayLog[k]; });
}

/* One tick of the clock. Nothing moves while the tab is not being looked at, so a tab left
   open overnight does not invent hours; practice moves only on a learning surface. */
export function tick(c, o = {}, now = Date.now()) {
  if (!c || !o.visible) return false;
  const d = dayLog(c, dayKey(now)), s = o.secs || TICK;
  d.app += s;
  if (o.learning) d.prac += s;
  trim(c);
  return true;
}
/* A first answer to a learning question: counted asked, and counted right if it was. */
export function answered(c, right, now = Date.now()) {
  if (!c) return;
  const d = dayLog(c, dayKey(now));
  d.asked += 1;
  if (right) d.right += 1;
}

export function today(c, now = Date.now()) {
  const d = (c.dayLog || {})[dayKey(now)] || {}, t = targets(c);
  const app = d.app || 0, prac = d.prac || 0, right = d.right || 0;
  return { app, prac, right, t, pApp: app / (t.app * 60), pPrac: prac / (t.prac * 60), pRight: right / t.right };
}
export const allClosed = (m) => m.pApp >= 1 && m.pPrac >= 1 && m.pRight >= 1;

/* the last n days, oldest first, each with its own numbers */
export function days(c, n = 30, now = Date.now()) {
  const out = [], base = new Date(now);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i, 12);
    const k = dayKey(+x), r = (c.dayLog || {})[k] || {};
    out.push({ k, day: x.getDate(), dow: x.getDay(), app: r.app || 0, prac: r.prac || 0, right: r.right || 0, asked: r.asked || 0 });
  }
  return out;
}
/* first-try accuracy over the window, or null below five answers — too few to say anything */
export function firstTry(c, n = 30, now = Date.now()) {
  const d = days(c, n, now), asked = d.reduce((t, x) => t + x.asked, 0), right = d.reduce((t, x) => t + x.right, 0);
  return asked >= 5 ? { pct: Math.round(right / asked * 100), right, asked } : null;
}

export function fmtMins(sec) {
  const m = Math.floor(Math.max(0, Math.round(sec || 0)) / 60);
  return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
}

/* Three nested rings, Apple-Watch style, as in Bee: no number inside, and going past the
   target draws a second lap in a lighter shade rather than stopping at full. */
export const RING_COL = [['#D63F7E', '#FF9CC6'], ['#1E8E57', '#7FDCA3'], ['#3568D8', '#9DBEFF']];
export const METRICS = [
  { k: 'app', label: 'App time', col: RING_COL[0][0] },
  { k: 'prac', label: 'Practise time', col: RING_COL[1][0] },
  { k: 'right', label: 'Questions right', col: RING_COL[2][0] },
];
export function ringsSVG(size, vals, label) {
  const R = [52, 39, 26], W = 12;
  let out = `<svg class="rings" viewBox="0 0 120 120" width="${size}" height="${size}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} style="display:block;transform:rotate(-90deg)">`;
  vals.forEach((v, i) => {
    const r = R[i], C = 2 * Math.PI * r, p = Math.max(0, +v || 0), base = Math.min(1, p), over = Math.max(0, Math.min(1, p - 1));
    const [col, lite] = RING_COL[i];
    out += `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${col}" stroke-opacity=".18" stroke-width="${W}"/>`;
    if (base > 0) out += `<circle class="ring-v" data-ring="${METRICS[i].k}" data-p="${p.toFixed(3)}" cx="60" cy="60" r="${r}" fill="none" stroke="${col}" stroke-width="${W}" stroke-linecap="round" stroke-dasharray="${(C * base).toFixed(2)} ${C.toFixed(2)}"/>`;
    if (over > 0) out += `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${lite}" stroke-width="${W - 4}" stroke-linecap="round" stroke-dasharray="${(C * over).toFixed(2)} ${C.toFixed(2)}"/>`;
  });
  return out + '</svg>';
}
/* the three lines beside the rings: "App time 5m/30m" */
export function lines(m) {
  return [
    ['app', 'App time', fmtMins(m.app), m.t.app + 'm'],
    ['prac', 'Practise time', fmtMins(m.prac), m.t.prac + 'm'],
    ['right', 'Questions right', String(m.right), String(m.t.right)],
  ].map(([k, lab, v, t], i) => ({ k, lab, v, t, col: RING_COL[i][0] }));
}
export const ringLabel = (m) => `Today: app time ${fmtMins(m.app)} of ${m.t.app} minutes, practise time ${fmtMins(m.prac)} of ${m.t.prac} minutes, ${m.right} of ${m.t.right} questions right`;

/* ── the 30-day chart (My page) — one metric at a time, a bar a day against a dashed
   target line. "Days on target" is a count in the window, never a run. ── */
export function chart(c, sel, now = Date.now()) {
  const meta = METRICS.find((x) => x.k === sel) || METRICS[0], k = meta.k, col = meta.col;
  const t = targets(c), tgt = k === 'right' ? t.right : t[k] * 60;
  const ds = days(c, 30, now), vals = ds.map((d) => d[k]);
  const fmt = (v) => k === 'right' ? String(v) : fmtMins(v);
  const top = Math.max(tgt * 1.25, ...vals, 1), H = 132, tgtY = (1 - tgt / top) * H;
  const hit = vals.filter((v) => v >= tgt).length, avg = Math.round(vals.reduce((a, b) => a + b, 0) / ds.length);
  return { k, col, tgt, ds, vals, fmt, top, H, tgtY, hit, avg, label: meta.label };
}
