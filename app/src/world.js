/* world.js — Bizzington's economy. One world, and everything derives from it.

   THE PROBLEM THIS EXISTS TO FIX. The market used to be four independent
   random walks with a crash hard-coded at 55% of the series. Four coin flips
   cannot teach the lesson at the top of the ladder (docs/08):

     Rates went up. My bond fell, my mortgage got dearer, and my shop's loan
     cost more — all at once, for ONE reason.

   So no asset class gets its own private randomness. Every price in this app
   is a function of the three numbers below plus that class's own character,
   which is why a child can always be told *why* something moved — and why
   correlation is EMERGENT here rather than asserted. Two things that share a
   driver move together without anyone writing a correlation matrix.

   THREE STATE VARIABLES, and they are the whole model:

     growth     the cycle: boom, slowdown, contraction, recovery
     inflation  responds to growth with a lag, pulls back to target
     rate       the bank's answer to inflation and growth, in steps

   HONESTY. Every constant below is BIZZINGTON'S OWN, chosen so the town
   behaves in a way a child can learn from. They are not measurements of any
   real economy and nothing in the app may present them as one — CONCEPT §6.6.
   Where a real figure is ever needed, it gets a source or it gets cut.

   Time runs in WEEKS. 52 to a year, 364 to the seven-year journey. */

import { rng } from './ui.js';

export const WEEKS_PER_YEAR = 52;

/* Bizzington's calibration. Annual figures; the model converts to weekly. */
export const CAL = {
  growthMean: 2.5,        /* % a year, the town's long-run trend            */
  growthAmp: 4.0,         /* how far the cycle swings either side of it     */
  cycleYears: 6,          /* boom to boom                                   */
  growthNoise: 1.1,

  inflTarget: 3.0,        /* what the bank is aiming at                     */
  inflPull: 0.045,        /* how fast it returns to target, per week        */
  inflFromGrowth: 0.055,  /* a hot town raises prices, with a lag           */
  inflNoise: 0.55,

  rateNeutral: 4.0,       /* the rate when everything is on target          */
  rateOnInfl: 1.5,        /* raise this much for each point over target     */
  rateOnGrowth: 0.5,
  rateStep: 0.25,         /* the bank moves in quarter points               */
  rateEveryWeeks: 6,      /* and not more often than this                   */
  rateMin: 0.25, rateMax: 14,

  shockChance: 0.0016,    /* per week — rare, and never on a schedule       */
  shockGrowth: -7.0,
  shockWeeks: 30,
};

/* The path is computed once from the seed and cached. A pure (seed, week) ->
   state lookup would be nicer, but inflation and the rate have memory: today
   depends on last week. So we walk it forwards once and index into it, which
   keeps every call deterministic and lets a parent be shown exactly what
   happened on the day it happened. */
const cache = new Map();

export function worldPath(seed, weeks) {
  const key = seed + ':' + weeks;
  if (cache.has(key)) return cache.get(key);
  const r = rng(seed || 1);
  const n = (r() + r() + r() - 1.5) * 2;      /* rough normal, in [-3,3] */
  const noise = () => (r() + r() + r() - 1.5) * 2;

  const path = [];
  let infl = CAL.inflTarget;
  let rate = CAL.rateNeutral;
  let lastMove = -99;
  let shockLeft = 0;
  const cycleW = CAL.cycleYears * WEEKS_PER_YEAR;
  void n;

  for (let w = 0; w < weeks; w++) {
    /* growth — a slow cycle, plus noise, plus a rare shock that decays */
    let growth = CAL.growthMean + CAL.growthAmp * Math.sin((2 * Math.PI * w) / cycleW)
      + noise() * CAL.growthNoise;
    if (shockLeft <= 0 && r() < CAL.shockChance) shockLeft = CAL.shockWeeks;
    if (shockLeft > 0) {
      growth += CAL.shockGrowth * (shockLeft / CAL.shockWeeks);
      shockLeft--;
    }

    /* inflation — pulled to target, pushed by a hot or cold town */
    const gap = growth - CAL.growthMean;
    infl += (CAL.inflTarget - infl) * CAL.inflPull
      + gap * CAL.inflFromGrowth
      + noise() * CAL.inflNoise * 0.12;
    infl = Math.max(-2, Math.min(18, infl));

    /* the rate — the bank's answer, in quarter points, and not every week.
       This is the single most teachable line in the file: the bank raises
       when prices run and cuts when the town stalls, and everything a child
       owns feels it at once. */
    if (w - lastMove >= CAL.rateEveryWeeks) {
      const want = CAL.rateNeutral
        + CAL.rateOnInfl * (infl - CAL.inflTarget)
        + CAL.rateOnGrowth * gap;
      const diff = want - rate;
      if (Math.abs(diff) >= CAL.rateStep) {
        const steps = Math.max(-2, Math.min(2, Math.round(diff / CAL.rateStep)));
        rate = Math.max(CAL.rateMin, Math.min(CAL.rateMax, rate + steps * CAL.rateStep));
        lastMove = w;
      }
    }

    path.push({
      w, growth, inflation: infl, rate,
      real: rate - infl,                 /* what the rate is worth after prices */
      shock: shockLeft > 0,
      phase: growth > CAL.growthMean + 1 ? 'boom'
        : growth < 0 ? 'contraction'
        : growth < CAL.growthMean ? 'slowdown' : 'recovery',
    });
  }
  cache.set(key, path);
  return path;
}

export function worldAt(seed, week, weeks) {
  const p = worldPath(seed, Math.max(weeks || 0, week + 1));
  return p[Math.max(0, Math.min(p.length - 1, week))];
}

/* Plain-English, for a child. Never a number without a reason attached. */
export function explain(s) {
  const bits = [];
  if (s.rate >= CAL.rateNeutral + 1.5) bits.push('borrowing is dear');
  else if (s.rate <= CAL.rateNeutral - 1) bits.push('borrowing is cheap');
  if (s.inflation >= CAL.inflTarget + 2) bits.push('prices are climbing fast');
  else if (s.inflation <= 1) bits.push('prices are barely moving');
  if (s.phase === 'contraction') bits.push('the town is shrinking');
  else if (s.phase === 'boom') bits.push('the town is busy');
  return bits.length ? bits.join(', ') : 'the town is steady';
}
