/* items.js — "Your turn": lesson items that are not multiple choice (E4).

   Three shapes, each something a child DOES with the idea rather than picks from four:
     sort    put each thing in one of two bins (tap a thing, tap a bin — or keys 1 and 2)
     order   put the steps in the order they happen (tap them in order)
     amount  work out a number and type it (the keypad or the keyboard)

   Every item has exactly one right result, and test/items.mjs proves it: a sort lists
   every thing once with a bin that exists, an order is a permutation of its steps, and
   an amount's answer is computed here from the numbers in its own question (`calc`), so
   the stated sum and the expected answer cannot disagree. Every number is Bizzington's
   own; nothing is a real price, rate or company.

   A wrong first try holds with a hint about the idea — never the answer — and the
   second go settles it, exactly like the questions underneath (drill.js). */
export const ITEMS = {
  c1b: { kind: 'sort', title: 'Need or want, today?', bins: ['Need', 'Want'],
    things: [['Rice for the week', 0], ['A comic', 1], ['Bus fare to school', 0], ['A second hoodie', 1], ['Medicine you were prescribed', 0], ['Stickers', 1]],
    hint: 'Ask of each one: would I be in trouble this week without it?' },
  c1c: { kind: 'order', title: 'How Pip got paid', steps: ['The grain seller has crates and no time', 'Pip offers an hour of carrying', 'Pip carries the crates', 'The seller pays Pip for the hour'],
    hint: 'A trade starts with someone who needs something, and pay comes after the work.' },
  c2a: { kind: 'amount', title: 'An hour, four times', q: 'Pip carries crates for 4 hours at 6 an hour. How much is that?', calc: () => 4 * 6,
    hint: 'Pay for one hour, then the same again for each hour after it.' },
  c2c: { kind: 'sort', title: 'Comes again, or comes once?', bins: ['Comes again', 'Comes once'],
    things: [['Weekly wage from the stall', 0], ['A birthday gift', 1], ['Pay for a Saturday job', 0], ['Money found in a coat', 1], ['Pocket money every Friday', 0]],
    hint: 'Could you plan next month around it? That is the question.' },
  c3a: { kind: 'amount', title: 'What is left?', q: 'In: 200 on pay day. Out: 60 for a phone and 40 for the bus. What is left?', calc: () => 200 - 60 - 40,
    hint: 'Add up everything going out first, then take that from what came in.' },
  c3c: { kind: 'sort', title: 'The price, and the other price', bins: ['What you pay', 'What you give up'],
    things: [['The money at the till', 0], ['The kite you could have had instead', 1], ['The coins in your hand', 0], ['A week closer to your goal', 1]],
    hint: 'Every yes is also a no. One bin is the money; the other is the thing you did not get.' },
  c4a: { kind: 'sort', title: 'A fact, or a hurry?', bins: ['A fact about it', 'A hurry'],
    things: [['It is waterproof', 0], ['Today only!', 1], ['It weighs 200 grams', 0], ['Last one left!', 1], ['Ends in 10 minutes!', 1]],
    hint: 'A fact would still be true tomorrow. A hurry is there to stop you thinking.' },
  c4c: { kind: 'amount', title: 'The small monthly one', q: 'A game costs 30 a month. How much is that in a year of 12 months?', calc: () => 30 * 12,
    hint: 'A year is twelve months. The small number happens twelve times.' },
  c5a: { kind: 'order', title: 'Where your money goes in a bank', steps: ['You put money in the bank', 'The bank lends it to someone else', 'They pay the bank for borrowing it', 'The bank pays you a little for leaving it there'],
    hint: 'The bank can only pay you because someone else is paying it.' },
  c5b: { kind: 'sort', title: 'Keep it, or fine to share?', bins: ['Never share', 'Fine to share'],
    things: [['Your PIN', 0], ['Your first name', 1], ['A one-time code', 0], ['Your password', 0], ['Your favourite colour', 1]],
    hint: 'Nobody real ever needs the secrets that open your money.' },
  c6a: { kind: 'sort', title: 'Who pays the rent on money?', bins: ['The bank pays you', 'You pay the bank'],
    things: [['You save 100 in the bank', 0], ['You borrow 100 for a bike', 1], ['Your savings sit there a year', 0], ['You pay back a loan late', 1]],
    hint: 'Interest is rent on money. Whoever is using someone else’s money pays it.' },
  c6c: { kind: 'sort', title: 'Earns or lasts — or gone by Friday?', bins: ['Earns or lasts', 'Gone by Friday'],
    things: [['A tool for a job that pays', 0], ['Sweets for the weekend', 1], ['A roof that keeps out the rain', 0], ['A ticket to a show', 1]],
    hint: 'Ask: will this still be paying me back, or still standing, after the loan is paid?' },
  c7a: { kind: 'amount', title: 'The snowball, one more step', q: '100 grows by a tenth of itself each year: 110, then 121. One more year — 121 grows by a tenth of itself. What does it become, to the nearest whole coin?', calc: () => Math.round(121 * 1.1),
    hint: 'A tenth of a number is that number split into ten equal parts. Add one part on.' },
  c7c: { kind: 'sort', title: 'One basket, or many?', bins: ['Many things', 'One thing'],
    things: [['A slice of every shop on Market Row', 0], ['All of it in Mags’ stall', 1], ['A little in each world’s businesses', 0], ['Everything in one boat', 1]],
    hint: 'If one thing has a bad week, which basket still has the rest?' },
  c8a: { kind: 'amount', title: 'Revenue, cost, profit', q: 'You sell 40 umbrellas at 20 each. Each one cost you 8. What is the profit?', calc: () => 40 * 20 - 40 * 8,
    hint: 'Profit is what came in, take away what it cost to make it happen.' },
  c8c: { kind: 'order', title: 'A shop’s month', steps: ['Buy the stock', 'Pay the stock bill', 'Sell to customers', 'Count what is left as profit'],
    hint: 'The bills often come before the sales do. That is why cash is not profit.' },
};
export const hasItem = (id) => !!ITEMS[id];

/* The order is shown shuffled from the card id (never by chance), the same way
   questions are permuted, so the steps are never already in order on screen. */
export function shown(id) {
  const it = ITEMS[id]; if (!it) return null;
  if (it.kind === 'sort') return it.things.map((t, i) => ({ i, t: t[0] }));
  if (it.kind !== 'order') return null;
  let h = 2166136261; for (const ch of id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const idx = it.steps.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  if (idx.every((v, i) => v === i)) idx.push(idx.shift());       /* never pre-solved */
  return idx.map((i) => ({ i, t: it.steps[i] }));
}
export const answerOf = (id) => { const it = ITEMS[id]; return it.kind === 'amount' ? it.calc() : it.kind === 'order' ? it.steps.map((_, i) => i) : it.things.map((t) => t[1]); };

/* a child's attempt: sort → bins[] by thing; order → step indices in the order tapped;
   amount → a number */
export function check(id, attempt) {
  const it = ITEMS[id], a = answerOf(id);
  if (it.kind === 'amount') return Number(String(attempt).replace(/[^\d.-]/g, '')) === a;
  return Array.isArray(attempt) && attempt.length === a.length && attempt.every((v, i) => v === a[i]);
}
