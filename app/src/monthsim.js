/* monthsim.js — the Month Planner's months and every sum in them (docs/12 §2.3). No screen.

   Budget Blitz scored the money LEFT OVER, so skipping every bill set the best. Here the score
   is the needs paid plus a buffer kept, and never the leftover:

   · a need paid in its own month scores 2, paid late 1, never paid 0;
   · a month that ends with at least its "keep back" amount still in hand scores 1;
   · the yearly step — the child TYPES what one bill costs a year (×12 or ×52) — scores 2.

   Wants score nothing either way: going without is allowed, and so is a treat once the needs
   and the buffer are safe. An unpaid need ROLLS into next month, named — "next month starts
   ₹120 shorter" — and the end card lists each. A month's money is sometimes smaller than all
   its bills (Standard one month in three, Tricky two in three), and on Tricky one month is
   short even of its needs, so something must move. Money left at the end of a month carries
   into the next: saving in a good month is what gets you through a short one.

   It is your month in Bizzington — your stall's takings, your jobs' pay — never the
   household's (CONCEPT §6.5: never assume a family's money). Every amount is a town dial in
   units, said once in the child's currency through price() as whole coins, so every sum on the
   screen is exact. Registered in sources.js ('month'). The seed decides the content only. */
import { rng } from './ui.js';
import { price } from './fmt.js';

export const MP_POINTS = { onTime: 2, late: 1, buffer: 1, yearly: 2 };
/* The Month Planner (docs/12 §2.3) — a month on Market Row: the child's own stall and jobs, never
   a household's (CONCEPT §6.5). `knobs`: months a round, how many are smaller than all their bills,
   how many short even of their needs, and the keep-back (a share of the month's needs). `bills`:
   the needs (recurring, with a weekly amount for a weekly one, or once) and the wants, in units.
   Bizzington's own amounts, registered in sources.js ('month'). */
export const MONTH = {
  knobs: {
    easy:     { months: 3, tight: 0, short: 0, keep: 0.1 },
    standard: { months: 3, tight: 1, short: 0, keep: 0.15 },
    tricky:   { months: 3, tight: 2, short: 1, keep: 0.15 },
  },
  bills: {
    recurring: [
      { id: 'bus', n: 'Bus pass', u: [5, 8], per: 'week', w: [2, 3] },
      { id: 'club', n: 'Club fees for the term you signed up to', u: [5, 8], per: 'month' },
      { id: 'lunch', n: 'Lunch money', u: [7, 11], per: 'month' },
      { id: 'pitch', n: 'Rent on your stall pitch', u: [8, 12], per: 'month' },
      { id: 'phone', n: 'Phone top-up, for calls about your jobs', u: [3, 5], per: 'week', w: [1, 2] },
    ],
    once: [
      { id: 'repair', n: 'Bike repair — it gets you to your job', u: [6, 11] },
      { id: 'trip', n: 'The school trip you said yes to', u: [5, 9] },
      { id: 'payback', n: 'Paying Bea back, on the day you promised', u: [4, 7] },
      { id: 'stock', n: 'Stock for your stall', u: [7, 12] },
      { id: 'shoes', n: 'School shoes — your only pair split', u: [7, 10] },
    ],
    wants: [
      { id: 'gift', n: 'A gift for a friend\'s birthday', u: [3, 6] },
      { id: 'film', n: 'A film with friends', u: [3, 6] },
      { id: 'stickers', n: 'New stickers', u: [2, 4] },
      { id: 'gola', n: 'Ice golas at the weekend', u: [2, 4] },
      { id: 'comic', n: 'The new comic', u: [2, 5] },
      { id: 'game', n: 'A new game', u: [6, 10] },
      { id: 'kite', n: 'A kite for the festival', u: [3, 6] },
      { id: 'games', n: 'Games and videos top-up', u: [3, 5] },
    ],
  },
};
export const MP_KNOBS = MONTH.knobs;
export const MP_BILLS = MONTH.bills;
const LV = ['easy', 'standard', 'tricky'];
const coins = (u) => Math.max(1, price(u));
const inR = (r, [a, b]) => a + r() * (b - a);
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

/* a round: months, each with its money, its keep-back, and its bills. `opts.year` false: the
   yearly step asks a shorter span (three months / eight weeks) for a child before ×12 (M7). */
export function mpRound(seed, level = 'standard', opts = {}) {
  if (!LV.includes(level)) level = 'standard';
  const k = MP_KNOBS[level], r = rng((((seed >>> 0) * 13) + LV.indexOf(level) * 6151 + 29) >>> 0);
  const rec = shuffle(MP_BILLS.recurring.slice(), r).slice(0, 2);
  const yr = rec[Math.floor(r() * 2) % 2];
  const recBills = rec.map((b) => {
    if (b.per === 'week') { const wk = coins(inR(r, b.w)); return { id: b.id, n: b.n, need: true, per: 'week', each: wk, amt: wk * 4, yearly: b === yr }; }
    return { id: b.id, n: b.n, need: true, per: 'month', each: coins(inR(r, b.u)), amt: 0, yearly: b === yr };
  });
  recBills.forEach((b) => { if (b.per === 'month') b.amt = b.each; });
  const once = shuffle(MP_BILLS.once.slice(), r), wants = shuffle(MP_BILLS.wants.slice(), r);
  const tightAt = new Set(shuffle([...Array(k.months).keys()], r).slice(0, k.tight));
  /* the month short even of its needs is a tight one, and never the last (its need must have a month to roll into) */
  const shortAt = k.short ? [...tightAt].filter((m) => m < k.months - 1)[0] : -1;
  const months = [];
  let extra = 0;
  for (let m = 0; m < k.months; m++) {
    const bills = recBills.map((b) => Object.assign({}, b, { key: `${b.id}:${m}`, month: m }));
    if (m === 0 || r() < 0.6) { const o = once.shift(); bills.push({ id: o.id, n: o.n, need: true, amt: coins(inR(r, o.u)), key: `${o.id}:${m}`, month: m }); }
    for (let i = 0; i < 2; i++) { const w = wants.shift(); bills.push({ id: w.id, n: w.n, need: false, amt: coins(inR(r, w.u)), key: `${w.id}:${m}`, month: m }); }
    const needs = bills.filter((b) => b.need).reduce((t, b) => t + b.amt, 0), wantsSum = bills.filter((b) => !b.need).reduce((t, b) => t + b.amt, 0);
    const keep = Math.max(1, Math.round(needs * k.keep));
    let pot;
    if (m === shortAt) {
      /* short of the needs AND the keep-back by about one bill: something has to move */
      const least = Math.min(...bills.filter((b) => b.need).map((b) => b.amt));
      pot = needs + keep - least;
      extra = least;                    /* …and the next month has room for it */
    } else if (tightAt.has(m)) pot = needs + keep + Math.floor(wantsSum * (0.2 + r() * 0.3)) + extra;
    else pot = needs + wantsSum + keep + coins(inR(r, [0, 3])) + extra;
    if (m !== shortAt) extra = 0;
    /* a tight month is smaller than all its bills, always */
    if (tightAt.has(m) && pot >= needs + wantsSum) pot = needs + wantsSum - 1;
    months.push({ m, pot, keep, bills: shuffle(bills, r), needs, wants: wantsSum, tight: tightAt.has(m), short: m === shortAt });
  }
  /* the yearly step: the first month's yearly bill, before it is paid */
  const yb = months[0].bills.find((b) => b.yearly);
  const span = opts.year === false ? (yb.per === 'week' ? 8 : 3) : (yb.per === 'week' ? 52 : 12);
  const yearly = { key: yb.key, n: yb.n, per: yb.per, each: yb.each, times: span, want: yb.each * span, year: opts.year !== false,
    slips: opts.year === false ? [] : [10, 4].map((x) => ({ times: x, v: yb.each * x })) };
  return { seed, level, months, yearly };
}

/* the ledger a round is played on: pure steps, so the screen and the bots run the same sums */
export function mpStart(round) {
  return { round, m: 0, i: 0, carry: 0, cash: round.months[0].pot, start: round.months[0].pot, rolled: [], queue: queueFor(round, 0, []), paid: [], late: [], skipped: [],
    moved: [], buffers: 0, monthLog: [], yearly: null, done: false };
}
function queueFor(round, m, rolled) {
  return rolled.map((b) => Object.assign({}, b, { rolled: true })).concat(round.months[m].bills);
}
export const mpBill = (L) => L.queue[L.i] || null;
/* pay (true) or not (false) the bill in front of you; a need not paid moves to next month */
export function mpDecide(L, pay) {
  const b = mpBill(L); if (!b || L.done) return null;
  let res;
  if (pay) {
    if (b.amt > L.cash) return { ok: false, short: b.amt - L.cash, bill: b };
    L.cash -= b.amt;
    (b.rolled ? L.late : L.paid).push(b);
    res = { ok: true, paid: true, bill: b };
  } else if (b.need) {
    L.moved.push(b);
    res = { ok: true, paid: false, moved: true, bill: b, last: L.m === L.round.months.length - 1 };
  } else { L.skipped.push(b); res = { ok: true, paid: false, bill: b }; }
  L.i++;
  return res;
}
export const mpMonthOver = (L) => L.i >= L.queue.length;
/* can the bill in front of you be paid from what is left? */
export const mpCanPay = (L) => { const b = mpBill(L); return !!b && b.amt <= L.cash; };
/* close the month: did the keep-back hold, what moved, and open the next one */
export function mpEndMonth(L) {
  const M = L.round.months[L.m];
  const kept = L.cash >= M.keep;
  if (kept) L.buffers++;
  const moved = L.moved.slice();
  L.monthLog.push({ m: L.m, left: L.cash, keep: M.keep, kept, moved, shorter: moved.reduce((t, b) => t + b.amt, 0) });
  L.moved = [];
  if (L.m + 1 >= L.round.months.length) { L.done = true; L.missed = moved; return L.monthLog[L.monthLog.length - 1]; }
  L.m++; L.carry = L.cash; L.cash += L.round.months[L.m].pot; L.start = L.cash; L.queue = queueFor(L.round, L.m, moved); L.i = 0;
  return L.monthLog[L.monthLog.length - 1];
}
/* the yearly step, typed and checked here */
export function mpYearly(L, typed) {
  const y = L.round.yearly, n = parseInt(String(typed == null ? '' : typed).replace(/[^0-9]/g, ''), 10);
  const slip = Number.isFinite(n) ? y.slips.find((s) => s.v === n) : null;
  L.yearly = { ok: n === y.want, typed: Number.isFinite(n) ? n : null, slip: slip || null };
  return L.yearly;
}
export function mpPoints(L) {
  const P = MP_POINTS;
  return L.paid.filter((b) => b.need).length * P.onTime + L.late.length * P.late + L.buffers * P.buffer + (L.yearly && L.yearly.ok ? P.yearly : 0);
}
export function mpRun(L) {
  const needsAll = L.round.months.reduce((t, M) => t + M.bills.filter((b) => b.need).length, 0);
  return { points: mpPoints(L), best: mpBest(L.round).points, months: L.round.months.length, needs: needsAll,
    onTime: L.paid.filter((b) => b.need).length, late: L.late.length, missed: (L.missed || []).length, missedNames: (L.missed || []).map((b) => ({ n: b.n, from: b.month + 1 })),
    lateNames: L.late.map((b) => ({ n: b.n, from: b.month + 1 })), buffers: L.buffers, yearlyRight: !!(L.yearly && L.yearly.ok), wants: L.paid.filter((b) => !b.need).length };
}
/* the best a round allows: which needs to pay when (a want never adds a point), searched */
export function mpBest(round) {
  if (round._best) return round._best;
  const P = MP_POINTS, Ms = round.months;
  let best = { points: -1, plan: null };
  const go = (m, cash, rolled, pts, plan) => {
    if (m >= Ms.length) { if (pts > best.points) best = { points: pts, plan: plan.slice() }; return; }
    const list = rolled.concat(Ms[m].bills.filter((b) => b.need));
    const avail = cash + Ms[m].pot;
    const n = list.length;
    for (let mask = 0; mask < (1 << n); mask++) {
      let spend = 0, p = 0; const left = [], pay = [];
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) { spend += list[j].amt; p += j < rolled.length ? P.late : P.onTime; pay.push(list[j].key); } else left.push(list[j]);
      }
      if (spend > avail) continue;
      const end = avail - spend;
      go(m + 1, end, left, pts + p + (end >= Ms[m].keep ? P.buffer : 0), plan.concat([pay]));
    }
  };
  go(0, 0, [], 0, []);
  best.points += P.yearly;
  Object.defineProperty(round, '_best', { value: best, enumerable: false });
  return best;
}
