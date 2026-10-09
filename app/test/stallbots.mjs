/* stallbots.mjs — the players test/stall.mjs sets loose on a season of Stall of My Own.
   Each bot is a way a child might play, written as decisions on the pure season
   (stallsim.js) and keys on the market day's own clock — the same code the
   screen runs. */
import * as S from '../src/stallsim.js';

const STEP_MS = 50;

/* a market day played by a serving policy `act(day, st, t)` called every frame */
export function playDay(season, act) {
  const day = S.makeDay(season);
  let guard = 0;
  while (!day.st.done && guard++ < 4000) { act(day, day.st); day.advance(STEP_MS); }
  return day.result();
}
/* a careful server: a beat to react, the front customer served, restock when the counter runs dry */
export function carefulServe() {
  let wait = 0;
  return (day, st) => {
    if (wait > 0) { wait -= STEP_MS; return; }
    if (st.restock > 0) return;
    const f = st.q[0];
    if (f) {
      if (st.counter[f.want] > 0) { day.serve(f.want); wait = 450; }
      else if (st.back[f.want] > 0) day.restock();
      return;
    }
    if (Object.keys(st.counter).some((id) => st.counter[id] < 2 && st.back[id] > 0)) day.restock();
  };
}
/* a masher: a random key every so often, R now and then */
export function randomServe(r) {
  let wait = 0;
  return (day, st) => {
    if (wait > 0) { wait -= STEP_MS; return; }
    wait = 250 + r() * 1100;
    const ids = Object.keys(st.counter);
    if (r() < 0.15) day.restock(); else day.serve(ids[Math.floor(r() * ids.length)]);
  };
}

/* ── plans ─────────────────────────────────────────────────────────────── */
const ids = (s) => S.level(s).products;
/* buy what the strip says will sell, price where it pays, keep a buffer, save the rest */
export function carefulPlan(s, { step = null, stockX = 1, jar = true, offer = 'no' } = {}) {
  const o = S.offerFor(s); if (o) S.answerOffer(s, offer === 'now' && !o.canNow ? 'no' : offer);
  ids(s).forEach((id) => {
    let best = S.FAIR_STEP, bestP = -1e9;
    if (step != null) best = step;
    else for (const k of [3, 4, 5]) { const p = S.priceAt(id, k), b = S.buyersAt(s, id, p); const v = (p - S.costOf(s, id)) * b; if (v > bestP) { bestP = v; best = k; } }
    S.setStep(s, id, best);
  });
  const rent = S.level(s).rent + S.creditDue(s);
  const budget = Math.max(0, s.cash - rent);
  /* the most profitable per coin first, so a short week buys the best of it */
  const want = ids(s).map((id) => {
    const b = S.buyersAt(s, id, S.priceAt(id, s.draft.price[id]));
    return { id, n: Math.max(0, Math.round(b * stockX) - (S.PRODUCTS[id].perish ? 0 : s.back[id] || 0)), m: (S.priceAt(id, s.draft.price[id]) - S.costOf(s, id)) / S.costOf(s, id) };
  }).sort((a, b) => b.m - a.m);
  let spent = 0;
  for (const w of want) {
    const c = S.costOf(s, w.id), n = Math.max(0, Math.min(w.n, Math.floor((budget - spent) / c)));
    S.setBuy(s, w.id, n); spent += n * c;
  }
  if (jar) {
    const left = s.cash - S.planCost(s) - rent;
    const keep = Math.max(S.planCost(s), 200);
    const j = Math.floor(Math.max(0, left - keep) / S.JAR_STEP) * S.JAR_STEP;
    if (j > 0 && !s.owned) S.setJar(s, j);
  }
}
/* random stock, random prices, a random handful in the jar, a random answer to any offer */
export function randomPlan(s, r) {
  const o = S.offerFor(s); if (o) S.answerOffer(s, ['now', 'credit', 'no'][Math.floor(r() * 3)]);
  ids(s).forEach((id) => {
    S.setStep(s, id, Math.floor(r() * S.LADDER.length));
    const top = Math.max(2, Math.round(S.footOf(s, id) * 2));
    S.setBuy(s, id, Math.floor(r() * (top + 1)));
  });
  if (r() < 0.5) S.setJar(s, Math.floor(r() * 6) * S.JAR_STEP);
}

/* a whole season: plan(s) each week, then serve, then the ledger */
export function season(seed, tier, goal, plan, serve, { auto = false } = {}) {
  const s = S.newSeason(seed, tier, goal);
  while (s.phase !== 'done') {
    if (s.phase === 'ledger') S.nextWeek(s);
    plan(s);
    S.openDay(s);
    const res = auto ? S.autoDay(s) : playDay(s, serve());
    S.closeWeek(s, res);
  }
  return s;
}
