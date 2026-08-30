/* business.js — years 6 and 7 of the journey (docs/08).

   The shop that was here traded by the day: buy stock, weather moves demand,
   cash += revenue - rent. No cost of goods, no accrual, no balance sheet, no
   receivables, no capital — and no connection to the world, so a rate rise
   never reached it. It could not teach any of the eight capabilities that
   define "an entrepreneur at 14".

   This can. Everything below is priced off world.js like every asset class,
   so the same rate rise that knocks the child's bond also raises their
   interest bill and lowers what their shop is worth. One world.

   THE FOUR LESSONS, and each one is a mechanic rather than a card:

   1. PRICING      demand answers to price. Charge more, sell fewer. The
                   revenue curve has a top and it is rarely where you guessed.
   2. BREAK-EVEN   fixed costs ÷ margin per unit. The number that says whether
                   opening tomorrow is worth it.
   3. CASH ≠ PROFIT  stock is paid for when you buy it; customers pay weeks
                   after they take it. A business can be profitable every week
                   and still run out of money, and this is the single most
                   expensive thing a first-time founder learns late.
   4. CAPITAL      debt costs interest for ever; equity costs a share of every
                   future rupee. Both are priced, and the child chooses.

   Accounting is real double-entry-ish: assets = liabilities + equity, checked
   every week by the test suite. If that identity ever breaks, the app is
   teaching arithmetic that is wrong. */

import { worldAt, WEEKS_PER_YEAR, CAL } from './world.js';

/* Bizzington's own trade constants. */
export const B = {
  baseDemand: 42,          /* units a week at the fair price in a normal town */
  elasticity: 1.7,         /* how hard demand falls when you charge more      */
  fairMarkup: 2.2,         /* the price at which base demand holds            */
  baseUnitCost: 5,         /* what one costs you, before inflation            */
  baseFixed: 90,           /* rent and wages a week, before inflation         */
  creditShare: 0.55,       /* of sales taken on credit rather than cash       */
  collectWeeks: 4,         /* how long those customers take to pay            */
  loanSpread: 2.5,         /* over the bank rate                              */
  valueMultiple: 9,        /* base multiple on annual profit                  */
  valueRateSens: 0.08,     /* the multiple shrinks as money gets dearer       */
  townSwing: 0.05,         /* how much footfall follows the cycle             */
};

export function newVenture(name, week, seed) {
  return {
    name: name || 'the stall', openedWeek: week || 0, seed: seed || 1,
    price: Math.round(B.baseUnitCost * B.fairMarkup),
    stock: 0, stockCost: 0,     /* units, and what was actually paid for them */
    cash: 1500,
    receivables: [],            /* [{ due, amount }] — sold, not yet paid     */
    traded: 0,                  /* weeks actually traded, uncapped            */
    debt: 0, paidIn: 1500,
    retained: 0,                /* running total — see balanceSheet()         */
    outsideEquity: 0,           /* fraction owned by investors                */
    weeks: [],                  /* newest first                               */
  };
}

/* Costs rise with prices. This is where inflation stops being a lesson and
   becomes something the child feels in their own margin. */
export function costsAt(v, world) {
  /* Elapsed time is counted separately: `weeks` is capped at 120 rows for
     memory, so measuring age from its length made inflation quietly stop
     compounding after two and a bit years — a shop's costs would have frozen
     exactly when the child got old enough to notice. */
  const drift = Math.pow(1 + world.inflation / 100, (v.traded || 0) / WEEKS_PER_YEAR);
  return {
    unitCost: B.baseUnitCost * drift,
    fixed: B.baseFixed * drift,
    loanRate: world.rate + B.loanSpread,
  };
}

/* Demand at a price. The curve a child can actually see: charge the fair
   price and the town turns up; double it and most of them do not. */
export function demandAt(v, world, price) {
  const c = costsAt(v, world);
  const fair = c.unitCost * B.fairMarkup;
  const town = 1 + (world.growth - CAL.growthMean) * B.townSwing;
  const d = B.baseDemand * Math.pow(fair / Math.max(0.5, price), B.elasticity) * town;
  return Math.max(0, Math.round(d));
}

/* The best price, found by walking the curve. Revenue keeps rising as you cut
   the price (demand here is elastic, so it always would) — but PROFIT has a
   top, and it is neither the cheapest nor the dearest. That gap between "most
   sales" and "most money" is the whole pricing lesson, and this is what the
   child gets to discover rather than be told. */
export function bestPrice(v, world) {
  const c = costsAt(v, world);
  let best = { price: v.price, profit: -Infinity, units: 0 };
  for (let p = Math.ceil(c.unitCost) + 1; p <= c.unitCost * 6; p++) {
    const units = demandAt(v, world, p);
    const profit = units * (p - c.unitCost) - c.fixed;
    if (profit > best.profit) best = { price: p, profit, units };
  }
  return best;
}

/* Break-even: how many you must sell to cover what you owe anyway.
   fixed + interest, divided by the margin on one unit. */
export function breakEven(v, world) {
  const c = costsAt(v, world);
  const interest = v.debt * (c.loanRate / 100) / WEEKS_PER_YEAR;
  const margin = v.price - c.unitCost;
  if (margin <= 0) return { units: Infinity, margin, fixed: c.fixed, interest };
  return { units: Math.ceil((c.fixed + interest) / margin), margin, fixed: c.fixed, interest };
}

export function buyStock(v, units, world) {
  const c = costsAt(v, world);
  const cost = units * c.unitCost;
  if (cost > v.cash) return 0;
  v.cash -= cost; v.stock += units; v.stockCost += cost;
  return Math.round(cost);
}
/* Weighted average cost of what is on the shelf. Stock is carried at what was
   PAID, never at what it would cost to replace: valuing it at today's price
   made inflation quietly manufacture equity that no one had earned, and the
   balance sheet drifted by a rupee a year in a way that looked like rounding. */
export function avgCost(v) { return v.stock > 0 ? v.stockCost / v.stock : 0; }

/* One week of trading. Returns the P&L and the cash movement separately,
   because the entire point is that they are not the same thing. */
export function tradeWeek(v, seed, weekIndex) {
  const world = worldAt(seed, weekIndex, weekIndex + 2);
  const c = costsAt(v, world);

  const want = demandAt(v, world, v.price);
  const units = Math.min(v.stock, want);
  const revenue = units * v.price;
  const cogs = units * avgCost(v);
  const interest = v.debt * (c.loanRate / 100) / WEEKS_PER_YEAR;

  /* ── the P&L: earned and incurred, regardless of who has paid ── */
  const gross = revenue - cogs;
  const net = gross - c.fixed - interest;

  /* ── the cash: only what actually moved ──
     Stock left when it was bought. Credit customers pay weeks later. This
     gap is the lesson, and it is why a growing shop can starve. */
  const cashSales = revenue * (1 - B.creditShare);
  v.receivables.push({ due: weekIndex + B.collectWeeks, amount: revenue * B.creditShare });
  let collected = 0;
  v.receivables = v.receivables.filter((r) => {
    if (r.due <= weekIndex) { collected += r.amount; return false; }
    return true;
  });
  const cashIn = cashSales + collected;
  const cashOut = c.fixed + interest;
  v.cash += cashIn - cashOut;
  v.stock -= units;
  v.stockCost = Math.max(0, v.stockCost - cogs);

  const owed = v.receivables.reduce((t, r) => t + r.amount, 0);
  const row = {
    week: weekIndex, units, want, price: v.price,
    revenue, cogs, gross, fixed: c.fixed, interest, net,
    cashIn, cashOut, cashDelta: cashIn - cashOut, cash: v.cash,
    stock: v.stock, receivables: owed, unitCost: c.unitCost,
    rate: world.rate, inflation: world.inflation, growth: world.growth,
    stockedOut: want > units,
  };
  v.traded++;
  v.retained += net;
  v.weeks.unshift(row);
  if (v.weeks.length > 120) v.weeks.length = 120;
  return row;
}

/* ── year 7: the two statements ─────────────────────────────────────────── */

export function profitAndLoss(v, weeks) {
  const rows = v.weeks.slice(0, weeks || 12);
  const sum = (k) => rows.reduce((t, r) => t + r[k], 0);
  const revenue = sum('revenue'), cogs = sum('cogs');
  return {
    weeks: rows.length,
    revenue, cogs, gross: revenue - cogs,
    fixed: sum('fixed'), interest: sum('interest'), net: sum('net'),
    grossMargin: revenue > 0 ? (revenue - cogs) / revenue : 0,
    units: sum('units'),
  };
}

/* The identity that must hold, always:  assets = liabilities + equity.
   `check` is the proof, and the test suite fails the build if it drifts. */
export function balanceSheet(v, world) {
  const stockValue = v.stockCost;
  const owed = v.receivables.reduce((t, r) => t + r.amount, 0);
  const assets = v.cash + stockValue + owed;
  const liabilities = v.debt;
  const equity = assets - liabilities;
  /* Retained earnings are a RUNNING TOTAL, never re-derived from the log.
     The log is capped at 120 rows for memory, and deriving retained from it
     meant that on the first week of year three every profit older than two
     years fell out of the equity line — assets stopped equalling liabilities
     plus equity, by more than the whole balance sheet, at exactly the point a
     child who had been playing for two years reached the statements. A test
     that only ran sixty weeks called it float noise. */
  const retained = v.retained;
  return {
    cash: v.cash, stock: stockValue, receivables: owed, assets,
    debt: v.debt, liabilities,
    equity, paidIn: v.paidIn, retained,
    /* paid-in plus everything earned should be exactly the equity line */
    check: equity - (v.paidIn + retained),
  };
}

/* What the whole thing is worth — priced like any other asset (docs/08 §2),
   which is what makes the child's business a position in their own portfolio
   rather than a separate game. */
export function valuation(v, world) {
  const p = profitAndLoss(v, WEEKS_PER_YEAR);
  const annual = p.weeks ? p.net * (WEEKS_PER_YEAR / p.weeks) : 0;
  const mult = B.valueMultiple / (1 + Math.max(-0.5, (world.rate - CAL.rateNeutral) * B.valueRateSens));
  const enterprise = Math.max(0, annual) * mult;
  const equityValue = Math.max(0, enterprise - v.debt);
  return {
    annualProfit: annual, multiple: mult, enterprise, equityValue,
    yours: equityValue * (1 - v.outsideEquity),
    theirs: equityValue * v.outsideEquity,
  };
}

/* ── raising ────────────────────────────────────────────────────────────── */

export function borrow(v, amount, world) {
  const c = costsAt(v, world);
  v.debt += amount; v.cash += amount;
  return { amount, rate: c.loanRate,
    weeklyInterest: amount * (c.loanRate / 100) / WEEKS_PER_YEAR };
}
export function repay(v, amount) {
  const a = Math.min(amount, v.cash, v.debt);
  v.cash -= a; v.debt -= a;
  return a;
}
/* Sell a slice. The cash is free; the price is every future rupee from that
   share, for ever, which is the half a child has to be shown explicitly. */
export function raiseEquity(v, share, world) {
  const val = valuation(v, world);
  if (share <= 0 || share >= 1) return null;
  const remaining = 1 - v.outsideEquity;
  if (share > remaining) return null;
  const cash = val.equityValue * share;
  v.cash += cash; v.paidIn += cash;
  v.outsideEquity += share;
  return { share, cash, keptBefore: remaining, keptAfter: remaining - share,
    costPerYear: val.annualProfit * share };
}
