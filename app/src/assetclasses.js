/* assetclasses.js — the ladder from docs/08, priced off ONE world.

   Each class is a function of world.js's three numbers plus its own
   character. Nothing here rolls its own dice for direction, which is why:

     - bonds fall when the rate rises, every time, provably;
     - equities fall for TWO reasons (earnings and the discount rate), which
       is why a rate rise hurts even a company that is trading fine;
     - the index is calmer than any single name without anyone saying so —
       diversification is emergent, not decreed;
     - gold and shares disagree, because gold answers to the real rate and
       shares answer to earnings.

   A child can therefore always be told WHY, and the answer is one sentence.

   Every constant is Bizzington's own (CONCEPT §6.6). None of it is a claim
   about any real market, and the app says so where it shows it. */

import { rng } from './ui.js';
import { worldPath, WEEKS_PER_YEAR, CAL } from './world.js';

const wk = (annualPct) => annualPct / 100 / WEEKS_PER_YEAR;

/* The order is the order a child meets them (docs/08 §2). `needs` is the
   maths rung that gates it, and `age` is a design assumption, not a fact. */
export const CLASSES = [
  { id: 'cash',    name: 'Cash',            em: '💵', age: 8,  needs: 'M1',
    one: 'Safe, and it does nothing.',
    why: 'It never falls in number — and prices climb underneath it.' },
  { id: 'deposit', name: 'The deposit',     em: '🏛️', age: 9,  needs: 'M4',
    one: 'The bank pays you to leave it there.',
    why: 'Follows the bank rate, a little below it. The bank keeps the difference.' },
  { id: 'bond',    name: 'A loan you made', em: '📜', age: 11, needs: 'M10',
    one: 'You are the lender. Somebody pays you a coupon.',
    why: 'When new loans pay more, yours is worth less — so the price falls when the rate rises.' },
  { id: 'shares',  name: 'One company',     em: '🏭', age: 12, needs: 'M12',
    one: 'A piece of a business that earns.',
    why: 'Falls when the town slows AND when the rate rises. Two reasons, and they can arrive together.' },
  { id: 'index',   name: 'All of them',     em: '🧺', age: 12, needs: 'M14',
    one: 'A slice of every company, for a small fee.',
    why: 'Calmer than any one of them, because the bad weeks are rarely the same weeks.' },
  { id: 'gold',    name: 'Gold',            em: '🪙', age: 12, needs: 'M13',
    one: 'It pays you nothing at all.',
    why: 'People want it when money is losing value — so it often rises when shares do not.' },
  { id: 'property',name: 'A house to let',  em: '🏠', age: 12, needs: 'M13',
    one: 'Rent comes in. You cannot sell half of it.',
    why: 'Tracks prices and the town, pays rent, and costs a fortune to buy and sell.' },
];
export const byId = Object.fromEntries(CLASSES.map((c) => [c.id, c]));
export function classesFor(mathsMet) {
  return CLASSES.filter((c) => !mathsMet || mathsMet(c.needs));
}

/* Bizzington's own character constants for each class. */
const P = {
  depositBelowRate: 1.0,     /* the bank's cut, in points                     */
  bondDuration: 6,           /* years — how hard a rate move hits the price   */
  equityEarnBeta: 2.2,       /* earnings swing this much harder than the town */
  equityMultiple: 15,        /* base price-to-earnings                        */
  equityRateSens: 0.075,     /* how much the multiple shrinks per rate point  */
  equityOwnVol: 0.028,       /* weekly, the part that is just this company    */
  indexNames: 12,            /* how many companies are in the basket          */
  indexFee: 0.4,             /* % a year, taken out                           */
  /* Gold's DRIFT answers to the real rate: when money in the bank loses to
     prices, the metal that pays nothing stops looking silly. The first cut of
     this had the driver at 0.4% of gold's variance — a random walk wearing a
     hat, which is the exact thing this module exists to kill. */
  goldBase: 3.0,             /* % a year when the real rate is neutral        */
  goldOnRealRate: 3.2,       /* subtract this much drift per point of real    */
  goldVol: 0.008,            /* quiet enough that the link is VISIBLE, not just
                                statistically detectable — a child has to be able
                                to see it over a season, or it teaches nothing  */
  propYield: 4.0,            /* % a year of rent                              */
  propOnGrowth: 0.35,
  propVol: 0.006,            /* houses are quoted rarely and move slowly      */
};

/* Total-return index for every class, base 100, weekly.
   Returns { world, series: {id: number[]}, weekly: {id: number[]} }. */
export function marketPath(seed, weeks) {
  const world = worldPath(seed, weeks);
  const r = rng((seed || 1) ^ 0x5bf03635);
  const n = () => (r() + r() + r() - 1.5) * 2;

  const ids = CLASSES.map((c) => c.id);
  const series = {}, weekly = {};
  ids.forEach((id) => { series[id] = [100]; weekly[id] = []; });

  /* the basket the index holds, and one of them is the child's single name */
  const names = Array.from({ length: P.indexNames }, () => ({ earn: 100, px: 100 }));

  let prevRate = world[0].rate;
  let bondCoupon = world[0].rate;
  let price = 100;                 /* the price level — what a basket costs */
  const prices = [100];

  for (let w = 0; w < weeks; w++) {
    const s = world[w];
    const dRate = s.rate - prevRate;
    prevRate = s.rate;

    /* CASH — nominal zero, because that is what cash does: the number never
       changes. Its loss is only visible against the price level, which is
       tracked separately and deflates everything. Quoting cash in real terms
       while every other class was nominal was a bug: it made the mix in
       runMix() add apples to oranges. */
    const cashR = 0;
    price *= (1 + wk(s.inflation));

    /* DEPOSIT — follows the bank, a little below, never negative. */
    const depR = wk(Math.max(0.05, s.rate - P.depositBelowRate));

    /* BOND — the money shot. Price moves against the rate by its duration;
       the coupon accrues regardless. This single line is the clearest proof
       the engine works, and four random walks can never produce it. */
    const bondPriceR = -P.bondDuration * (dRate / 100);
    const bondR = bondPriceR + wk(bondCoupon);
    /* A rolling fund, not one bond held to maturity: as old loans mature the
       money goes back out at today's rate, so the yield converges on the
       market over roughly its duration. The first cut reset a `bondPx` that
       nothing ever read and jumped the coupon every five years — dead code
       and a crude model, which together under-paid the reinvestment that is
       the entire consolation for a rate rise. */
    bondCoupon += (s.rate - bondCoupon) / (P.bondDuration * WEEKS_PER_YEAR);

    /* SHARES and the INDEX — earnings follow the town; the multiple shrinks
       when money is dearer. Both channels are the world's, and only the
       wobble is the company's own. */
    /* Earnings grow with NOMINAL output — real growth plus inflation — because
       a company that sells the same goods at higher prices books higher
       earnings. The first cut used real growth alone, which quietly made
       shares return less than inflation: the median child would have watched
       the index LOSE to prices over seven years, and the whole promise of the
       journey ("your money works") would have been false inside its own
       world. That is the kind of error a simulation has to be tested for. */
    const earnGrowth = wk(CAL.growthMean + s.inflation + (s.growth - CAL.growthMean) * P.equityEarnBeta);
    const mult = P.equityMultiple / (1 + Math.max(-0.5, (s.rate - CAL.rateNeutral) * P.equityRateSens));
    let basket = 0;
    names.forEach((c, i) => {
      c.earn *= (1 + earnGrowth + n() * 0.004);
      const px = c.earn * mult / P.equityMultiple;
      c.ret = c.px ? px / c.px - 1 : 0;
      c.ret += n() * P.equityOwnVol;
      c.px = px * (1 + n() * 0.0001) || px;
      basket += c.ret;
      if (i === 0) weekly.shares.push(c.ret);
    });
    const indexR = basket / names.length - wk(P.indexFee);

    /* GOLD — answers to the real rate, not to earnings. Which is exactly why
       it is in the box: it is the one that disagrees. */
    const goldR = wk(P.goldBase - P.goldOnRealRate * s.real) + n() * P.goldVol;

    /* PROPERTY — rent plus a slow price that tracks prices and the town. */
    const propR = wk(P.propYield)
      + wk(s.inflation + (s.growth - CAL.growthMean) * P.propOnGrowth)
      + n() * P.propVol;

    const step = { cash: cashR, deposit: depR, bond: bondR, index: indexR,
      gold: goldR, property: propR };
    step.shares = weekly.shares[weekly.shares.length - 1];

    ids.forEach((id) => {
      const rr = step[id];
      if (id !== 'shares') weekly[id].push(rr);
      series[id].push(Math.max(0.5, series[id][series[id].length - 1] * (1 + rr)));
    });
    prices.push(price);
  }
  /* Real terms are DERIVED, never mixed in: every nominal series deflated by
     the same price level. This is where a child sees that the cash number
     never moved and the line still went down. */
  const real = {};
  ids.forEach((id) => { real[id] = series[id].map((v, i) => v / prices[i] * 100); });
  return { world, series, weekly, prices, real };
}

/* A mix, run through the same world. `mix` is {id: weight}, weights summing
   to 1. Rebalanced weekly, which is the boring answer and the right one. */
export function runMix(seed, weeks, mix) {
  const { series, weekly, world } = marketPath(seed, weeks);
  const ids = Object.keys(mix).filter((k) => mix[k] > 0);
  const total = ids.reduce((t, k) => t + mix[k], 0) || 1;
  let v = 100, peak = 100, maxDD = 0;
  const path = [100];
  for (let w = 0; w < weeks; w++) {
    let rr = 0;
    ids.forEach((id) => { rr += (mix[id] / total) * (weekly[id][w] || 0); });
    v *= (1 + rr);
    path.push(v);
    peak = Math.max(peak, v);
    maxDD = Math.max(maxDD, (peak - v) / peak);
  }
  const years = weeks / WEEKS_PER_YEAR;
  return {
    end: v, path, maxDrawdown: maxDD,
    cagr: (Math.pow(v / 100, 1 / years) - 1) * 100,
    /* return per unit of pain. The number the app should score a child on —
       never the return alone, which is CONCEPT §6.3. */
    calmar: maxDD > 0.001 ? ((Math.pow(v / 100, 1 / years) - 1) * 100) / (maxDD * 100) : Infinity,
    series, world,
  };
}
