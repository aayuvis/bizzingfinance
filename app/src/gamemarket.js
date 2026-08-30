/* gamemarket.js — forty years of forty companies.

   Every number here derives from three things, in this order:

     1. the world (world.js) — growth, inflation, the bank rate
     2. the company's own DNA (content/companies.js)
     3. the events that landed on it (content/events.js)

   Which means a child can always take a price move apart. The bank raised
   rates; Surya Grid has 2.6x revenue in debt and a rate sensitivity of 2.4,
   so it fell hardest; Sabun & Sons has almost no debt and full pricing
   power, so it barely moved. That is the whole game, and it is only possible
   because nothing rolls its own dice for direction.

   Deterministic from one seed: the same campaign replays exactly, so a
   parent can be shown what happened and a bug can be reproduced. */

import { rng } from './ui.js';
import { worldPath, WEEKS_PER_YEAR, CAL } from './world.js';
import { COMPANIES, SECTORS, byId as companyById } from '../content/companies.js';
import { byLevel as eventsByLevel } from '../content/events.js';

export const GAME_YEARS = 40;

const M = {
  baseMultiple: 16,        /* what a steady company trades at            */
  multOnGrowth: 0.55,      /* faster growers are paid more per rupee     */
  multOnRate: 0.075,       /* and everything is paid less when money is dear */
  multOnDisrupt: -6,       /* a business people think is going away      */
  multFloor: 4, multCeil: 45,
  /* GROWTH FADES. Nothing compounds at 34% for forty years — a company that
     did would be larger than the economy it sells into. Without this the
     simulation returned 35,000x on the fastest grower and taught the single
     worst lesson available: buy whatever is growing quickest and hold it for
     ever. Growth decays toward the economy's own rate on a ten-year
     half-life, which is the law of large numbers made arithmetic. */
  growthFloor: 4.5,        /* what any surviving business ends up growing at */
  growthHalfLife: 10,      /* years for the excess over that to halve        */
  interestSpread: 1.8,     /* a company borrows above the bank rate      */
  shockHeal: 0.55,         /* how much of a one-off panic unwinds a year later */
  eventsPerYear: { macro: 1.1, country: 0.9, sector: 0.7, company: 0.55 },
};

function pick(list, r) {
  const total = list.reduce((t, e) => t + e.w, 0);
  let x = r() * total;
  for (const e of list) { x -= e.w; if (x <= 0) return e; }
  return list[list.length - 1];
}

/* ── the event calendar ───────────────────────────────────────────────
   Built once per campaign. Macro and country events hit everybody, sector
   events hit one industry, company events hit one firm. */
export function buildCalendar(seed, years) {
  const r = rng((seed || 1) ^ 0x1f2e3d4c);
  const cal = Array.from({ length: years }, () => []);
  const add = (y, ev, scope) => { if (y < years) cal[y].push({ ...ev, year: y, scope }); };

  for (let y = 0; y < years; y++) {
    ['macro', 'country'].forEach((lvl) => {
      let n = M.eventsPerYear[lvl];
      while (n > 0) { if (r() < Math.min(1, n)) add(y, pick(eventsByLevel[lvl], r), { kind: lvl }); n -= 1; }
    });
    SECTORS.forEach((s) => {
      if (r() < M.eventsPerYear.sector) add(y, pick(eventsByLevel.sector, r), { kind: 'sector', sector: s.id });
    });
    COMPANIES.forEach((c) => {
      if (r() < M.eventsPerYear.company) add(y, pick(eventsByLevel.company, r), { kind: 'company', company: c.id });
    });
  }
  return cal;
}

/* Does this event touch this company? */
function hits(ev, c) {
  if (ev.scope.kind === 'macro' || ev.scope.kind === 'country') return true;
  if (ev.scope.kind === 'sector') return ev.scope.sector === c.sector;
  return ev.scope.company === c.id;
}

/* ── the simulation ───────────────────────────────────────────────────
   One pass, year by year, for all forty companies at once. */
export function simulate(seed, years = GAME_YEARS) {
  const world = worldPath(seed, years * WEEKS_PER_YEAR + 4);
  const cal = buildCalendar(seed, years);
  const r = rng((seed || 1) ^ 0x77aa33cc);
  const n = () => (r() + r() + r() - 1.5) * 2;

  const out = {};
  COMPANIES.forEach((c) => {
    const d = c.dna;
    let revenue = d.rev0, margin = d.margin, shock = 0;
    /* effects that last more than a year decay on a queue */
    const live = [];
    const rows = [];

    for (let y = 0; y < years; y++) {
      const w = world[Math.min(world.length - 1, y * WEEKS_PER_YEAR)];
      const mine = cal[y].filter((e) => hits(e, c));
      mine.forEach((e) => live.push({ e, left: e.years }));

      /* everything currently in force, at full strength this year */
      let evRev = 0, evMargin = 0, evMult = 0, evShock = 0;
      for (let i = live.length - 1; i >= 0; i--) {
        const L = live[i], eff = L.e.eff;
        const fade = L.left / L.e.years;         /* newest hits hardest */
        evRev += (eff.rev || 0) * fade;
        evMargin += (eff.margin || 0) * fade;
        evMult += (eff.mult || 0) * fade;
        if (L.left === L.e.years) evShock += (eff.shock || 0);
        L.left--;
        if (L.left <= 0) live.splice(i, 1);
      }

      /* REVENUE — trend, the cycle through this company's own beta, the part
         of inflation it can pass on, plus events. */
      const cycle = (w.growth - CAL.growthMean) * d.cyc;
      const passed = w.inflation * d.pricing;
      const fade = Math.pow(0.5, y / M.growthHalfLife);
      const secular = M.growthFloor + (d.growth - M.growthFloor) * fade;
      const growth = (secular + cycle + passed) / 100 + evRev + n() * 0.012;
      revenue = Math.max(20, revenue * (1 + growth));

      /* MARGIN — inflation it CANNOT pass on eats into it, and disruption
         grinds it down over decades. This is where pricing power shows up. */
      const squeeze = (w.inflation * (1 - d.pricing)) / 100 * 0.35;
      const erosion = d.disrupt * 0.0012;
      margin = Math.max(0.005, Math.min(0.55, d.margin - squeeze - erosion * y + evMargin + n() * 0.004));

      const ebit = revenue * margin;
      const debt = revenue * d.debt;
      const interest = debt * (w.rate + M.interestSpread) / 100;
      const net = ebit - interest;
      const dividend = Math.max(0, net) * d.payout;

      /* THE MULTIPLE — what people will pay per rupee of profit. Growth up,
         rates down, disruption down. Two companies with identical profit can
         be worth very different amounts, and this is why. */
      let mult = M.baseMultiple
        + M.multOnGrowth * d.growth
        + M.multOnDisrupt * d.disrupt
        - M.multOnRate * M.baseMultiple * (w.rate - CAL.rateNeutral) * d.rateSens;
      mult *= (1 + evMult);
      mult = Math.max(M.multFloor, Math.min(M.multCeil, mult));

      shock = shock * M.shockHeal + evShock;
      const value = Math.max(revenue * 0.05, net * mult) * (1 + shock);

      rows.push({
        year: y, revenue, margin, ebit, interest, net, dividend, debt,
        mult, value, shock,
        rate: w.rate, inflation: w.inflation, growth: w.growth,
        events: mine,
      });
    }
    out[c.id] = rows;
  });
  return { world, calendar: cal, years: out };
}

/* Price, indexed to 100 — the line on the chart. */
export function priceSeries(sim, id) {
  const rows = sim.years[id];
  const base = rows[0].value;
  return rows.map((r) => (r.value / base) * 100);
}

/* TOTAL return: the price AND the dividends, reinvested. These come apart
   hard over forty years, and the gap is a lesson in itself — a dull company
   paying most of its profit out can beat an exciting one that never does,
   and the price chart alone will never show you that. */
export function totalReturnSeries(sim, id) {
  const rows = sim.years[id];
  let units = 1;
  const base = rows[0].value;
  return rows.map((r, i) => {
    if (i > 0) {
      /* A yield this high is a warning, not a gift: it means the market has
         marked the business down and is betting the payout gets cut. Real
         boards cut long before 12%, so the model does too rather than
         compounding a dividend nobody would still be paying. */
      const yieldPct = Math.min(0.12, r.dividend / Math.max(1, r.value));
      units *= (1 + yieldPct);
    }
    return (r.value * units / base) * 100;
  });
}
export function dividendYield(sim, id, y) {
  const r = sim.years[id][y];
  return r.dividend / Math.max(1, r.value);
}

/* Why did it move? The answer, ranked, in plain words. */
export function explainYear(sim, id, y) {
  const rows = sim.years[id], c = companyById[id];
  if (y <= 0) return [];
  const a = rows[y - 1], b = rows[y];
  const move = (b.value / a.value - 1);
  const reasons = [];
  const dRev = b.revenue / a.revenue - 1;
  const dMargin = b.margin - a.margin;
  const dMult = b.mult / a.mult - 1;
  if (Math.abs(dRev) > 0.02) reasons.push({ w: Math.abs(dRev), t: `it sold ${dRev > 0 ? 'more' : 'less'} — revenue ${dRev > 0 ? 'up' : 'down'} ${Math.abs(dRev * 100).toFixed(0)}%` });
  if (Math.abs(dMargin) > 0.004) reasons.push({ w: Math.abs(dMargin) * 12, t: `it kept ${dMargin > 0 ? 'more' : 'less'} of each rupee — margin ${dMargin > 0 ? 'up' : 'down'} ${Math.abs(dMargin * 100).toFixed(1)} points` });
  if (Math.abs(dMult) > 0.03) reasons.push({ w: Math.abs(dMult), t: `people would pay ${dMult > 0 ? 'more' : 'less'} per rupee of profit — the multiple went ${a.mult.toFixed(0)} to ${b.mult.toFixed(0)}` });
  if (Math.abs(b.rate - a.rate) > 0.4) reasons.push({ w: Math.abs(b.rate - a.rate) / 8 * (c.dna.rateSens || 1), t: `the bank rate moved ${a.rate.toFixed(2)}% to ${b.rate.toFixed(2)}%, and this one carries ${c.dna.debt.toFixed(1)}x revenue in debt` });
  return { move, reasons: reasons.sort((x, z) => z.w - x.w).map((x) => x.t), events: b.events };
}
