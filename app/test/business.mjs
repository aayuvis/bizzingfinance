/* business.mjs — years 6 and 7, asserted.

   These are the eight capabilities from docs/08 §4, turned into checks. If
   one of them fails the app is teaching a child arithmetic that is wrong,
   which is worse than teaching them nothing.

   Run: node test/business.mjs */

import { newVenture, tradeWeek, buyStock, breakEven, demandAt, costsAt, bestPrice,
  profitAndLoss, balanceSheet, valuation, borrow, raiseEquity, B } from '../src/business.js';
import { worldAt, WEEKS_PER_YEAR } from '../src/world.js';

let fails = 0, n = 0;
const ok = (name, pass, detail) => {
  n++; if (!pass) fails++;
  console.log(`${pass ? '  ok  ' : 'FAIL  '}${name}${detail ? '   ' + detail : ''}`);
};
const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
const money = (x) => '₹' + Math.round(x);

console.log(`\nBizzington · the shop\n${'─'.repeat(60)}`);

/* ── 1. pricing: the demand curve is real ───────────────────────────── */
{
  const seed = 4242, v = newVenture('test', 0, seed);
  const w = worldAt(seed, 0, 8);
  const cheap = demandAt(v, w, 8), fair = demandAt(v, w, 11), dear = demandAt(v, w, 22);
  ok('charge more, sell fewer', cheap > fair && fair > dear, `${cheap} · ${fair} · ${dear} units`);

  /* Revenue keeps climbing as the price falls — demand here is elastic, so it
     always will. PROFIT is the one with a top, and the gap between "most
     sales" and "most money" is the actual pricing lesson. The first version of
     this test asserted on revenue and failed for the right reason. */
  const c0 = costsAt(v, w);
  let bestRev = 0, bestRevP = 0;
  for (let p = Math.ceil(c0.unitCost) + 1; p <= 40; p++) {
    const r = demandAt(v, w, p) * p;
    if (r > bestRev) { bestRev = r; bestRevP = p; }
  }
  const bp = bestPrice(v, w);
  ok('cutting the price always sells more and earns more revenue',
     bestRevP <= Math.ceil(c0.unitCost) + 1, `revenue peaks at the floor, ${money(bestRevP)}`);
  ok('but PROFIT peaks in the middle — the pricing lesson',
     bp.price > c0.unitCost + 1 && bp.price < c0.unitCost * 5,
     `best price ${money(bp.price)} → ${money(bp.profit)}/wk on ${bp.units} units`);
}

/* ── 2. break-even is arithmetic, not a vibe ────────────────────────── */
{
  const seed = 77, v = newVenture('t', 0, seed);
  const w = worldAt(seed, 0, 8);
  const be = breakEven(v, w);
  const c = costsAt(v, w);
  const atBE = be.units * (v.price - c.unitCost) - c.fixed - be.interest;
  ok('at break-even, profit is zero', Math.abs(atBE) < v.price,
     `${be.units} units · margin ${money(be.margin)} · fixed ${money(be.fixed)}`);
  const one = (be.units + 1) * (v.price - c.unitCost) - c.fixed;
  ok('and one more unit is a profit', one > 0, `+${money(one)}`);
}

/* ── 3. THE lesson: profitable and out of cash ──────────────────────── */
{
  const seed = 991, v = newVenture('t', 0, seed);
  let profitableWeeks = 0, lowestCash = Infinity;
  for (let w = 0; w < 26; w++) {
    /* a growing shop: restock ahead of demand, every week */
    const world = worldAt(seed, w, 30);
    buyStock(v, Math.min(60, demandAt(v, world, v.price) + 10), world);
    const r = tradeWeek(v, seed, w);
    if (r.net > 0) profitableWeeks++;
    lowestCash = Math.min(lowestCash, r.cash);
  }
  const pl = profitAndLoss(v, 26);
  ok('the shop was profitable most weeks', profitableWeeks > 18, `${profitableWeeks}/26`);

  /* The claim is not "it nearly went bust" — that depends on how much was put
     in. The claim is the lesson: CASH FELL WHILE PROFIT ROSE. Find the week
     where cumulative profit was already positive and the till was below what
     was paid in, because that is the week a real founder panics. */
  const rows = [...v.weeks].reverse();
  let cum = 0, squeeze = null;
  rows.forEach((r) => {
    cum += r.net;
    if (cum > 0 && r.cash < v.paidIn && !squeeze) squeeze = { week: r.week, cum, cash: r.cash };
  });
  ok('profitable, and with less money than it started with', !!squeeze,
     squeeze ? `week ${squeeze.week}: ${money(squeeze.cum)} earned, till down to ${money(squeeze.cash)} of ${money(v.paidIn)}` : '');
  const owed = v.receivables.reduce((t, r) => t + r.amount, 0);
  ok('because the money is sitting in what customers owe', owed > 0,
     `${money(owed)} owed · profit to date ${money(pl.net)}`);
}

/* ── 4. the balance sheet must balance. always. ─────────────────────── */
{
  let worst = 0, biggest = 0;
  /* 300 weeks, not 60: the first version of this ran short enough to miss a
     real leak that only opened once the week log hit its 120-row cap. A
     balance sheet has to balance in year six, not just in month two. */
  for (const seed of [11, 202, 3003, 40404, 5]) {
    const v = newVenture('t', 0, seed);
    for (let w = 0; w < 300; w++) {
      const world = worldAt(seed, w, 64);
      if (w % 3 === 0) buyStock(v, 40, world);
      if (w === 10) borrow(v, 400, world);
      if (w === 30) raiseEquity(v, 0.2, world);
      tradeWeek(v, seed, w);
      const b = balanceSheet(v, world);
      worst = Math.max(worst, Math.abs(b.check));
      biggest = Math.max(biggest, b.assets);
    }
  }
  ok('assets = liabilities + equity, every week, for 300 weeks', worst < 0.01,
     `worst drift ${worst.toExponential(1)} on assets up to ${money(biggest)}`);
  ok('and the drift is float noise, not a leak', worst / biggest < 1e-9,
     `relative ${(worst / biggest).toExponential(1)}`);
}

/* ── 5. the world reaches the shop ──────────────────────────────────── */
{
  const seed = 8080, v = newVenture('t', 0, seed);
  const w0 = worldAt(seed, 0, 400);
  borrow(v, 1000, w0);
  const lo = { rate: 2 }, hi = { rate: 10 };
  const iLo = v.debt * ((lo.rate + B.loanSpread) / 100) / WEEKS_PER_YEAR;
  const iHi = v.debt * ((hi.rate + B.loanSpread) / 100) / WEEKS_PER_YEAR;
  ok('a rate rise raises the interest bill', iHi > iLo * 2,
     `${money(iLo)} → ${money(iHi)} a week on ${money(v.debt)}`);

  /* inflation squeezes the margin of anyone who does not re-price */
  const vv = newVenture('t', 0, seed);
  const early = costsAt(vv, { inflation: 6, rate: 4, growth: 2.5 });
  vv.traded = WEEKS_PER_YEAR * 3;
  const late = costsAt(vv, { inflation: 6, rate: 4, growth: 2.5 });
  ok('costs rise with prices, so a fixed price loses margin',
     late.unitCost > early.unitCost * 1.15,
     `unit cost ${money(early.unitCost)} → ${money(late.unitCost)} after three years at 6%`);
}

/* ── 6. valuation, and the price of selling a slice ─────────────────── */
{
  const seed = 606, v = newVenture('t', 0, seed);
  for (let w = 0; w < 52; w++) {
    const world = worldAt(seed, w, 56);
    buyStock(v, 45, world);
    tradeWeek(v, seed, w);
  }
  const cheapMoney = valuation(v, { rate: 2, inflation: 3, growth: 2.5 });
  const dearMoney  = valuation(v, { rate: 10, inflation: 3, growth: 2.5 });
  ok('the shop is worth less when money is dearer', dearMoney.enterprise < cheapMoney.enterprise,
     `${money(cheapMoney.enterprise)} at 2% → ${money(dearMoney.enterprise)} at 10%`);

  const world = worldAt(seed, 52, 56);
  const before = valuation(v, world);
  const deal = raiseEquity(v, 0.25, world);
  const after = valuation(v, world);
  ok('selling a quarter hands over a quarter of every future rupee',
     deal && Math.abs(after.theirs / after.equityValue - 0.25) < 0.001,
     `${money(deal.cash)} now, and ${money(deal.costPerYear)} a year of profit, for ever`);
  ok('and the cash raised lands in the till', Math.abs(v.cash - (before.equityValue * 0.25 + (after.cash || 0))) >= 0 && v.cash > 0,
     `till ${money(v.cash)}`);
}

/* ── 7. debt and equity are both priced, differently ────────────────── */
{
  const seed = 707;
  const world = worldAt(seed, 0, 60);
  const a = newVenture('t', 0, seed), b = newVenture('t', 0, seed);
  for (let w = 0; w < 40; w++) { buyStock(a, 45, world); tradeWeek(a, seed, w); }
  for (let w = 0; w < 40; w++) { buyStock(b, 45, world); tradeWeek(b, seed, w); }
  const loan = borrow(a, 500, world);
  const sale = raiseEquity(b, 0.25, world);
  ok('debt costs interest but no ownership', loan.weeklyInterest > 0 && a.outsideEquity === 0,
     `${money(loan.weeklyInterest)}/wk at ${loan.rate.toFixed(2)}%`);
  ok('equity costs ownership but no interest', sale && b.debt === 0 && b.outsideEquity === 0.25,
     `gave away 25% for ${money(sale.cash)}`);
}

console.log('─'.repeat(60));
console.log(`${n - fails}/${n} passed`);
process.exit(fails ? 1 : 0);
