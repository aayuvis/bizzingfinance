/* worked.js — the sum, written out (audit E3, "teaching the why").

   Every lesson stop whose idea needs arithmetic shows one worked example in the teach view:
   the sum, step by step, in the style of the Your-turn "Show me how" (items.js `how`).

   Two rules hold it, and test/worked.mjs checks both on every stop:
   1. No invented figure. Every number written here is one the card itself already says
      (its lesson, example, questions or Your-turn), a dial of this town registered in
      sources.js (what a shift pays, what a room costs, what Bizz & Co's stock costs and
      sells for), a fact of the calendar or of halving (2, 10, 12), or the result of a sum
      written out in the steps — and every written sum is checked to be right.
   2. It never gives away the stop's own answers. The example ends on a number that is not
      the answer to any of the stop's three questions, nor to its Your-turn.

   Which stops are arithmetic is not a list kept by hand: `isArithmetic()` says so of any
   stop with an amount to work out in Your-turn, or a question whose right answer is a
   number its own question does not print. */
import { ALL_CARDS, drillCount, drillAt, JOBS, HOMES, STOCK } from './content.js';
import { ITEMS, answerOf } from './items.js';
import { price, money } from './fmt.js';

const job = (id) => JOBS.find((j) => j.id === id).units;
const home = (id) => HOMES.find((h) => h.id === id);
const stock = (id) => STOCK.find((s) => s.id === id);

/* a dial, said in the child's own currency; the arithmetic is done on what is shown, so the
   written sum is always right whatever the rounding */
const d = (units) => price(units);
const M = (n) => money(n);

/* Each entry returns { steps, result, dials }. `dials` names the sources.js keys the
   numbers come from when they are not the card's own. */
export const WORKED = {
  c1f: () => ({ steps: ['A pencil costs 35. You hand over 50.', 'Count up from the price: 35 + 5 = 40.', 'Then on to what you gave: 40 + 10 = 50.', 'The change is everything you counted: 5 + 10 = 15.'], result: 15 }),
  c2a: () => { const p = d(job('crates')); return { dials: ['wages'],
    steps: [`Stacking crates on Market Row pays ${M(p)} a shift — the town’s own rate.`, `Two shifts: ${M(p)} + ${M(p)} = ${M(2 * p)}.`, `Three shifts: ${M(2 * p)} + ${M(p)} = ${M(3 * p)}. The time is what is being paid for, so the pay multiplies with it.`], result: 3 * p }; },
  c2e: () => ({ steps: ['Before practice: 2 umbrellas an hour at 5 each, so 2 × 5 = 10 an hour.', 'After a month: 3 umbrellas an hour, so 3 × 5 = 15 an hour.', 'The hour grew by 15 − 10 = 5, and the pay for each umbrella never changed.'], result: 5 }),
  c2f: () => ({ steps: ['Pip earned 30, 45, 25 and 40. The slowest week is 25, so he plans each week on 25.', 'Four weeks planned: 25 + 25 + 25 + 25 = 100.', 'Four weeks earned: 30 + 45 + 25 + 40 = 140.', 'Beyond the plan: 140 − 100 = 40, and none of it was needed to get by.'], result: 40 }),
  c3a: () => { const r = home('room'), rent = d(r.rent), food = d(r.food), a = d(job('books')), b = d(job('cargo')); return { dials: ['homes', 'wages'],
    steps: [`Out, for a week in the room above the stall: rent ${M(rent)} and food ${M(food)}. ${M(rent)} + ${M(food)} = ${M(rent + food)}.`,
      `In: a shift doing Nana’s books and a shift unloading cargo. ${M(a)} + ${M(b)} = ${M(a + b)}.`,
      `What is left to choose about: ${M(a + b)} − ${M(rent + food)} = ${M(a + b - rent - food)}.`], result: a + b - rent - food }; },
  c3b: () => ({ steps: ['Nana’s split, on every 100: Spend 40, Save 30, Grow 20, Give 10.', 'Check it adds up: 40 + 30 + 20 + 10 = 100 — every coin has a jar.', 'On 200 each jar gets twice as much. Spend: 40 × 2 = 80.'], result: 80 }),
  c3d: () => ({ steps: ['A 900 skateboard, saving 60 a week.', 'Ten weeks of saving: 10 × 60 = 600. Still to go: 900 − 600 = 300.', 'How many more weeks of 60 fit in 300? 300 ÷ 60 = 5.', 'Weeks in all: 10 + 5 = 15.'], result: 15 }),
  c3f: () => ({ steps: ['Pip’s notebook says 6, 9, 7 and 12.', 'Add them one at a time: 6 + 9 = 15.', '15 + 7 = 22.', '22 + 12 = 34 — not the “about 20” he remembered.'], result: 34 }),
  c4c: () => ({ steps: ['The subscription is 30 a month.', 'A year is 12 months. Half a year is 12 ÷ 2 = 6 months.', 'Half a year of it: 6 × 30 = 180 — and it does not stop at half a year.'], result: 180 }),
  c4e: () => ({ steps: ['Was 90, now 65: the sign says 90 − 65 = 25 off.', 'But next door sells the same kite for 55 every day.', 'Against next door, “now” is still 65 − 55 = 10 dearer.'], result: 10 }),
  c4f: () => ({ steps: ['Pens are 5 each, or 3 for 12.', 'Need three? Three single pens: 3 × 5 = 15. The deal saves 15 − 12 = 3.', 'Need one? The deal costs 12 − 5 = 7 more than you needed.'], result: 7 }),
  c5f: () => ({ steps: ['Pip’s list: bus 12, club 25, and 7 to a name he had never seen.', 'The lines he knows: 12 + 25 = 37.', 'Everything that went out: 37 + 7 = 44. One line in that total is not his.'], result: 44 }),
  c6b: () => ({ steps: ['Borrow 1,000. Repay 110 a month for a year — 12 months.', '110 × 12 in two parts: 110 × 10 = 1,100 and 110 × 2 = 220.', 'Handed back in total: 1,100 + 220 = 1,320. The cost is that total, take away what was borrowed.'], result: 1320 }),
  c6e: () => ({ steps: ['Bea has 50 in and 30 of costs each week.', 'Left each week: 50 − 30 = 20.', 'A payment of 12: 20 − 12 = 8 to spare, so it fits.'], result: 8 }),
  c7a: () => ({ steps: ['Start with 100, growing 10 in every 100 each year.', 'Year one: 100 + 10 = 110.', 'Year two lands on 110. Ten in every hundred is a tenth: 110 ÷ 10 = 11, so 110 + 11 = 121.', 'The second step was 11, not 10 — the interest earned interest.'], result: 121 }),
  c7f: () => ({ steps: ['Growing 6 a year in every 100.', 'The trick: 72 ÷ 6 = 12.', 'So about 12 years to double — a rough guide, not a promise.'], result: 12 }),
  c7i: () => ({ steps: ['A bakery split into 100 shares makes 300 profit and pays it all out.', 'Share it equally: 300 ÷ 100 = 3 for each share.'], result: 3 }),
  c7j: () => ({ steps: ['Asha puts away 20 a month from January — all 12 months: 20 × 12 = 240.', 'Ravi starts in July, halfway through the year: 12 ÷ 2 = 6 months, so 20 × 6 = 120.', 'Before any growth, Asha is ahead by 240 − 120 = 120 — just for starting sooner.'], result: 120 }),
  c8a: () => ({ steps: ['One umbrella sells for 20. Each one cost 8.', 'Revenue on 40 of them: 40 × 20 = 800.', 'Profit on just one: 20 − 8 = 12 — what each sale leaves after its own cost.'], result: 12 }),
  c8b: () => ({ steps: ['Mags raised buttons from 8 to 12.', 'Each button she still sells now brings 12 − 8 = 4 more.', 'She sold two fewer — so the question is whether the extra on the rest beats the ones she lost.'], result: 4 }),
  c8e: () => ({ steps: ['Rent 240 a month. Each umbrella sells for 20 and costs 8.', 'Each sale leaves 20 − 8 = 12 towards the rent.', 'Ten sales: 10 × 12 = 120 of the 240 covered. Still to cover: 240 − 120 = 120 — keep counting in 12s until nothing is left.'], result: 120 }),
  c8h: () => { const u = stock('umbrella'), s = d(u.sells), c = d(u.cost), each = s - c; return { dials: ['stock'],
    steps: [`At Bizz & Co an umbrella sells for ${M(s)} and costs the shop ${M(c)}: ${M(s)} − ${M(c)} = ${M(each)} profit on each.`,
      `Ten umbrellas: 10 × ${M(each)} = ${M(10 * each)} profit.`,
      `Half stays in the shop tin: ${M(10 * each)} ÷ 2 = ${M(10 * each / 2)} goes home.`], result: 10 * each / 2 }; },
  c8i: () => ({ steps: ['Pip sold 10 bracelets at 9, and the beads cost 3 each.', 'In: 10 × 9 = 90. Beads: 10 × 3 = 30.', 'Profit: 90 − 30 = 60.', 'Over 5 hours: 60 ÷ 5 = 12 an hour.'], result: 12 }),
};

/* the numbers a piece of text prints, signs and grouping stripped */
export const numbersIn = (t) => (String(t).replace(/<[^>]+>/g, '').match(/\d[\d,]*(\.\d+)?/g) || []).map((x) => Number(x.replace(/,/g, '')));

/* every number the stop's own checks ask for: the three questions and the Your-turn */
export function checkAnswers(card) {
  const out = [];
  for (let i = 0; i < drillCount(card); i++) {
    const q = drillAt(card, i);
    if (q.kind === 'num') out.push(q.value); else out.push(...numbersIn(q.opts[q.a]));
  }
  const it = ITEMS[card.id];
  if (it && it.kind === 'amount') out.push(answerOf(card.id));
  return out;
}

/* a stop is arithmetic when there is an amount to work out: a Your-turn amount, or a
   question whose right answer is a number the question itself does not print */
export function isArithmetic(card) {
  const it = ITEMS[card.id];
  if (it && it.kind === 'amount') return true;
  for (let i = 0; i < drillCount(card); i++) {
    const q = drillAt(card, i), inQ = numbersIn(q.q);
    const ans = q.kind === 'num' ? [q.value] : numbersIn(q.opts[q.a]);
    if (inQ.length && ans.some((n) => !inQ.includes(n))) return true;
  }
  return false;
}

export function worked(id) { const f = WORKED[id]; return f ? f() : null; }
export const arithmeticStops = () => ALL_CARDS.filter(isArithmetic);
