/* placement.js — what arithmetic this child has actually met.

   ledger.js says it plainly: the band floor and the level bump are DESIGN
   ASSUMPTIONS standing in for a measurement, "honest guesses rather than
   facts about any real curriculum". This is the measurement.

   Twelve questions, one per rung of the number spine (docs/03 §3), asked in
   order and stopped the moment two in a row are missed — a child does not sit
   through six questions they cannot do. The result is a CEILING, not a score:
   it decides what the town may show, and it is never reported as a mark, put
   on a chart, or shown to the child as a number.

   It can be re-sat, it can be skipped, and skipping it just means the app
   goes on guessing. */

export const RUNGS = [
  { m: 'M1',  can: 'Counts and compares whole amounts',
    q: 'Which is more?', opts: ['₹40', '₹104', '₹14', 'They are the same'], a: 1,
    why: '₹104 is the largest. Reading a number is the first thing every other one is built on.' },
  { m: 'M2',  can: 'Adds two small amounts',
    q: '₹35 and ₹40 together?', opts: ['₹65', '₹75', '₹85', '₹70'], a: 1, why: '35 + 40 = 75.' },
  { m: 'M3',  can: 'Takes one amount from another',
    q: 'You have ₹90 and spend ₹35. What is left?', opts: ['₹55', '₹65', '₹45', '₹125'], a: 0, why: '90 − 35 = 55.' },
  { m: 'M4',  can: 'Halves and doubles',
    q: 'Half of ₹90?', opts: ['₹35', '₹45', '₹50', '₹40'], a: 1, why: 'Half of 90 is 45 — the everyday split, before any rule needs it.' },
  { m: 'M5',  can: 'Adds a column of several amounts',
    q: '₹25, ₹30 and ₹15 together?', opts: ['₹60', '₹70', '₹65', '₹75'], a: 1, why: '25 + 30 + 15 = 70. A receipt is exactly this.' },
  { m: 'M6',  can: 'Multiplies by a small number',
    q: 'Four things at ₹25 each?', opts: ['₹75', '₹100', '₹125', '₹90'], a: 1, why: '4 × 25 = 100.' },
  { m: 'M7',  can: 'Finds a tenth, and several tenths',
    q: 'Three tenths of ₹200?', opts: ['₹20', '₹60', '₹30', '₹70'], a: 1, why: 'A tenth is 20, so three of them is 60. This is what makes a jar rule sayable without percentages.' },
  { m: 'M8',  can: 'Divides to share out evenly',
    q: '₹120 shared between 4?', opts: ['₹30', '₹40', '₹24', '₹35'], a: 0, why: '120 ÷ 4 = 30.' },
  { m: 'M9',  can: 'Divides to find how many times it goes',
    q: 'How many weeks at ₹75 to reach ₹900?', opts: ['10', '12', '15', '9'], a: 1, why: '900 ÷ 75 = 12. This is the one that turns a wish into a date.' },
  { m: 'M10', can: 'Reads a percent as "for every hundred"',
    q: '2% of ₹500 is…', opts: ['₹2', '₹10', '₹20', '₹25'], a: 1, why: 'Two in every hundred, and there are five hundreds — ₹10.' },
  { m: 'M11', can: 'Applies a rate twice, on the new amount',
    q: '₹1,000 grows 10%, then 10% again. What now?', opts: ['₹1,200', '₹1,210', '₹1,100', '₹1,220'], a: 1,
    why: '₹1,100 then 10% of 1,100 is 110 — ₹1,210. The extra ₹10 is compounding, and it is the whole of chapter seven.' },
  { m: 'M12', can: 'Holds a rate over many periods',
    q: 'Something doubles every 3 years. After 9 years it is…', opts: ['3× as much', '6× as much', '8× as much', '9× as much'], a: 2,
    why: 'Three doublings: 2, then 4, then 8. Almost nobody guesses this high, which is the point of asking it.' },
];

export const CEILING = { min: 4, max: 17 };

export function start() { return { kind: 'placement', i: 0, right: 0, miss: 0, pick: null, done: false, reached: 0 }; }
export function current(o) { return RUNGS[o.i]; }
export function answer(o, i) {
  if (o.pick != null || o.done) return;
  const q = RUNGS[o.i];
  const ok = +i === q.a;
  o.pick = { i: +i, ok, why: q.why };
  if (ok) { o.right += 1; o.miss = 0; o.reached = o.i + 1; } else o.miss += 1;
}
export function next(o) {
  if (o.pick == null) return;
  o.i += 1; o.pick = null;
  /* stopped by two in a row, or by running out — nobody sits through six
     questions they cannot do */
  if (o.miss >= 2 || o.i >= RUNGS.length) o.done = true;
}
/* The ceiling is the last rung reached, floored so the town is never emptier
   than the band already assumed, and capped at the spine's length. */
export function ceilingOf(o) { return Math.max(CEILING.min, Math.min(CEILING.max, o.reached || 0)); }
export function finish(c, o) {
  if (!o.done || o.settled) return null;
  o.settled = true;
  const ceil = ceilingOf(o);
  c.maths = { ceiling: ceil, at: Date.now(), reached: o.reached };
  return { ceiling: ceil, can: RUNGS[Math.max(0, Math.min(RUNGS.length, o.reached) - 1)] };
}
export function measured(c) { return !!(c.maths && c.maths.ceiling); }
export function ceiling(c) { return measured(c) ? c.maths.ceiling : null; }
