/* generate.js — retrieval items the town writes itself (docs/05 §B1: "authored content
   is the seed; the simulation generates the volume").

   Each objective has three authored retrieval items, and a child revising an idea for a
   year used to meet those same three forever. An objective listed here can also be asked
   in fresh numbers: drawn from a seed, priced in the child's own currency, and SIZED TO
   THE MATHS THEY HAVE MET (ledger.mathsCeiling — measured by placement.js, guessed until
   then). Same idea, different numbers, so a remembered answer is not a known idea.

   Two shapes: `num`, where the child types the amount (no options to eliminate), and the
   ordinary four-option kind. Every number is hypothetical and says so by being a story
   about Pip or Mags, never a claim about the real world (rule 6). Pure: same seed, same
   currency, same ceiling — same question. */
import { price, money } from './fmt.js';

/* a seeded generator, so an id like "EARN-2~41" always means the same question */
function rng(seed) {
  let h = (seed >>> 0) || 1;
  return () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

/* One "coin" of the currency in round numbers: ₹10, $1, £1, €1, AED 1. Derived from the
   same table every price uses, so nothing here assumes a currency. */
const step = () => Math.max(1, Math.round(price(10) / 10));
const m = (n) => money(n);

/* small numbers until the child has met bigger ones */
const size = (cx) => (cx.ceil >= 9 ? 'big' : 'small');

const WHO = ['Pip', 'Mags', 'Bea', 'Bo', 'Nana Bizz'];
const JOBS = ['stacking crates', 'delivering flyers', 'sweeping Market Row', 'minding the stall', 'washing the bandstand'];
const THINGS = ['a kite', 'a cricket bat', 'a paint set', 'a bicycle bell', 'a board game', 'a lantern'];

export const GEN = {
  'EARN-2': (r, cx) => {
    const h = size(cx) === 'big' ? int(r, 3, 12) : int(r, 2, 5), p = step() * (size(cx) === 'big' ? int(r, 4, 15) : int(r, 2, 6));
    const w = pick(r, WHO), j = pick(r, JOBS);
    return { kind: 'num', hint: 'The hours, times what one hour pays.', q: `${w} spends ${h} hours ${j} at ${m(p)} an hour. How much is that?`, value: h * p,
      why: `${h} hours × ${m(p)} — an hour is worth what it pays, so the hours multiply it.` };
  },
  'EARN-4': (r, cx) => {
    const s = step(), h1 = int(r, 2, 4), h2 = h1 + int(r, 1, 3);
    let r1 = int(r, 3, 9), r2 = int(r, 3, 9); if (r1 === r2) r2 += 1;
    const ja = pick(r, JOBS), jb = pick(r, JOBS.filter((x) => x !== ja));
    const pa = h1 * r1 * s, pb = h2 * r2 * s;
    return { q: `Two shifts on the board: ${ja} pays ${m(pa)} for ${h1} hours; ${jb} pays ${m(pb)} for ${h2} hours. Which pays more for each hour?`,
      opts: [cap(ja), cap(jb), 'They pay the same for each hour'], a: r1 > r2 ? 0 : 1,
      why: `Divide by the hours: ${m(pa)} ÷ ${h1} is ${m(r1 * s)} an hour; ${m(pb)} ÷ ${h2} is ${m(r2 * s)}. The bigger total is not always the better rate.` };
  },
  'KEEP-1': (r, cx) => {
    const s = step(), big = size(cx) === 'big';
    const a = s * (big ? int(r, 3, 15) * 10 : int(r, 2, 6)), b = s * (big ? int(r, 2, 12) * 10 : int(r, 1, 5));
    const inn = a + b + s * (big ? int(r, 5, 60) * 10 : int(r, 2, 15));   /* never more out than in */
    return { kind: 'num', hint: 'Start with what came in, then take away each thing that went out.', q: `Pay day brings ${m(inn)}. Out go ${m(a)} for the bus and ${m(b)} for lunch. What is left over?`, value: inn - a - b,
      why: `In, minus everything out: ${m(inn)} − ${m(a)} − ${m(b)}. What is left is the only part you get to choose about.` };
  },
  'KEEP-2': (r, cx) => {
    const s = step(), part = pick(r, [2, 3, 4, 5]), pay = s * 10 * (size(cx) === 'big' ? int(r, 4, 20) : int(r, 1, 5));
    return { kind: 'num', hint: 'Find what one tenth of the pay is first.', q: `${pick(r, WHO)} saves ${part} in every 10 the moment pay lands. Pay day brings ${m(pay)}. How much goes into Save?`, value: pay / 10 * part,
      why: `${m(pay)} is ten lots of ${m(pay / 10)}, and ${part} of those lots go to Save. Split first, spend second.` };
  },
  'KEEP-4': (r, cx) => {
    const s = step(), per = s * int(r, 2, size(cx) === 'big' ? 12 : 6), weeks = int(r, 3, size(cx) === 'big' ? 15 : 8), thing = pick(r, THINGS);
    return { kind: 'num', hint: 'How many weekly amounts fit into the price?', q: `${cap(thing)} costs ${m(per * weeks)}. You put ${m(per)} towards it every week. How many weeks until it is yours?`, value: weeks,
      why: `${m(per * weeks)} ÷ ${m(per)} a week = ${weeks} weeks. A price and a weekly amount turn a wish into a date.` };
  },
  'CHOOSE-4': (r, cx) => {
    const s = step(), n1 = pick(r, [2, 3, 4]), n2 = n1 * pick(r, [2, 3]);
    const u1 = int(r, 3, 9), u2 = u1 + pick(r, [-2, -1, 1, 2]);
    const thing = pick(r, ['pencils', 'mangoes', 'notebooks', 'balloons']);
    return { q: `Mags sells ${thing}: ${n1} for ${m(n1 * u1 * s)}, or ${n2} for ${m(n2 * u2 * s)}. Which is better value for each one?`,
      opts: [`${n1} for ${m(n1 * u1 * s)}`, `${n2} for ${m(n2 * u2 * s)}`, 'They cost the same for each one'], a: u1 < u2 ? 0 : 1,
      why: `Price for one: ${m(u1 * s)} in the small pack, ${m(u2 * s)} in the big one. Bigger is not always cheaper — work it out per one.` };
  },
  'CHOOSE-7': (r, cx) => {
    const s = step(), a = s * int(r, 1, size(cx) === 'big' ? 9 : 4), what = pick(r, ['a juice', 'a comic', 'a snack', 'a game top-up']);
    return { kind: 'num', hint: 'One week’s cost, times the weeks in a year.', q: `${cap(what)} costs ${m(a)}, once a week, every week. How much is that in a year of 52 weeks?`, value: a * 52,
      why: `${m(a)} × 52 weeks. A small amount that repeats is a big amount wearing a disguise.` };
  },
  'GUARD-5': (r, cx) => {
    const s = step(), a = s * int(r, 2, size(cx) === 'big' ? 25 : 8);
    return { kind: 'num', hint: 'One month’s cost, times the months in a year.', q: `An app asks for just ${m(a)} a month. How much is that over 12 months?`, value: a * 12,
      why: `${m(a)} × 12. "Just" a month is the word doing the work — the year is the real price.` };
  },
  'GROW-2': (r, cx) => {
    const s = step(), bal = s * 100 * int(r, 1, size(cx) === 'big' ? 9 : 3), part = pick(r, [5, 10]);
    return { kind: 'num', hint: 'Count the hundreds in the balance; each hundred earns the same.', q: `A bank in a story pays ${part} in every 100 a year. ${pick(r, WHO)} leaves ${m(bal)} in it for a year. How much interest is that?`, value: bal / 100 * part,
      why: `${m(bal)} is ${bal / 100 / s} lots of ${m(100 * s)}, and each lot earns ${m(part * s)}. Interest is rent the bank pays for your money.` };
  },
  'GROW-3': (r, cx) => {
    const s = step(), bal = s * 100 * int(r, 1, 5);
    return { kind: 'num', hint: 'The second year’s tenth is a tenth of the NEW amount.', q: `${m(bal)} grows by a tenth of itself each year. After one year it is ${m(bal * 1.1)}. What is it after the second year?`, value: Math.round(bal * 1.21),
      why: `The second year adds a tenth of ${m(bal * 1.1)}, not of ${m(bal)} — the interest earns interest. That is why the second time is bigger.` };
  },
  'OWE-1': (r, cx) => {
    const s = step(), loan = s * 10 * int(r, 2, 10), fee = s * int(r, 1, 4), w = int(r, 2, 6);
    return { kind: 'num', hint: 'The cost of one week, times the weeks.', q: `Borrowing ${m(loan)} costs ${m(fee)} for every week you keep it. You keep it ${w} weeks. What did borrowing cost?`, value: fee * w,
      why: `${m(fee)} × ${w} weeks. A loan is not free money — the price is the extra you pay back, and it grows with time.` };
  },
  'OWE-2': (r, cx) => {
    const s = step(), w = int(r, 3, 8), pay = s * int(r, 3, 12), loan = pay * w - s * int(r, 2, 3 * w);
    return { kind: 'num', hint: 'Add up every payment, then take away what you borrowed.', q: `You borrow ${m(loan)} and pay it back as ${w} weekly payments of ${m(pay)}. How much more than you borrowed did you pay?`, value: pay * w - loan,
      why: `Everything paid back is ${w} × ${m(pay)} = ${m(pay * w)}; take away the ${m(loan)} borrowed. That difference is the number that matters.` };
  },
};
/* the numbers a question prints, commas and currency signs stripped */
export const numbersIn = (t) => (String(t).match(/\d[\d,]*(\.\d+)?/g) || []).map((x) => Number(x.replace(/,/g, '')));
export function leaks(d) { return d.kind === 'num' ? numbersIn(d.q).includes(d.value) : new Set(d.opts.map(String)).size !== d.opts.length; }
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/* The card a generated id names. "EARN-2~41" → seed 41 for EARN-2. `cx.ceil` is the
   child's maths ceiling. Returns the same card shape as objectives.assessCard. */
export function genCard(o, seed, cx) {
  const g = GEN[o.id]; if (!g) return null;
  /* a typed answer whose number is printed in its own question is a leak: draw again */
  let d;
  for (let k = 0; k < 12; k++) { d = g(rng(seed * 2654435761 + o.id.length + k * 7919), cx || { ceil: 6 }); if (!leaks(d)) break; }
  return { id: `${o.id}~${seed}`, title: o.short, who: 'pip', objective: o.id, assess: true, generated: true, drill: d };
}
export const hasGen = (id) => !!GEN[id];
