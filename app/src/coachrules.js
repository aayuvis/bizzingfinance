/* coachrules.js — the Coach's rulebook. Hand-written, offline, no model anywhere.

   Bizzing Bee's coach has eight spelling traps and something to SAY about each. This is
   Finance's: the patterns a money learner's misses fall into, each with the mistake in the
   child's own terms, the rule that fixes it, a check to run in your head before answering,
   and worked examples — and the worked examples are the lessons' own (a card's example, and
   its written-out sum from worked.js where it has one, which says town dials in the child's
   currency). Nothing here states a number: test/coach.mjs fails any rule, check or habit
   with a digit in it, so no rule can carry an invented figure (CLAUDE.md rule 6).

   Where the misses come from — only what the app records:
     · the mistakes deck (mistakes.js): wrong FIRST answers to a lesson's questions, still open
     · the mastery record (mastery.js): retrieval misses, days later, on ideas not yet held
   Each lesson stop maps to one trap (CARD_TRAP) and each objective to one (OBJ_TRAP); the
   test holds every card and every objective to a trap, and every trap that can occur to a
   rule. `read()` is DOM-free, so the test can hand it a constructed deck and check that Pip
   names the right pattern. Loaded lazily with the Coach page (coach.js), never on the first
   screen. */
import { OBJECTIVES } from './objectives.js';
import * as mistakes from './mistakes.js';

export const RULES = {
  needwant: {
    face: 'pip', col: '#A8432A', label: 'Need or want',
    mistake: 'You sort a thing by what it is, when the question is what it is for you, today.',
    rule: 'A need is something you would be in trouble without; a want makes life nicer. The same thing can move between the two lists with the weather, the day or the person. Both are fine — the skill is knowing which one it is before you pay.',
    check: 'What goes wrong this week if I do not have it? If the honest answer is “nothing much”, it is a want — and wants are allowed.',
    egs: [['c1b', 'The same umbrella sits on both lists, depending on the day.'], ['c3e', 'When less comes in, the wants are the part that can move.']],
  },
  tradeoff: {
    face: 'mags', col: '#7448B8', label: 'What it really cost',
    mistake: 'You count the price and forget the other half of it: the thing you can no longer have.',
    rule: 'Every yes is also a no. The true cost of a choice is its price plus the best thing you gave up to make it — grown-ups call that opportunity cost. Buying now and waiting are both real answers once you have written down both columns.',
    check: 'Finish the sentence before you pay: “If I buy this, I am not getting …”',
    egs: [['c3c', 'Mags never mentions the second half of the price.'], ['x-ch12', 'A week later is the honest test of what a thing cost you.']],
  },
  pricevalue: {
    face: 'mags', col: '#2D67AD', label: 'Price is not value',
    mistake: 'You take the seller’s number as what the thing is worth — or a crossed-out “was” price as a real saving.',
    rule: 'The price is what somebody is asking. The value is what it is worth to you, and the two are rarely the same number. A “was” price is the seller’s own number: compare the “now” price with other stalls, and with what it is worth to you.',
    check: 'Would I still want it at this price if nobody had told me it was a bargain?',
    egs: [['c1d', 'The price is real. The value is up to you.'], ['c4e', 'Against the stall next door, the “saving” turns into paying more.']],
  },
  unitprice: {
    face: 'mags', col: '#1C7466', label: 'The price of one',
    mistake: 'You compare two sticker prices for different sizes or different shapes of offer, and pick the one that looks smaller.',
    rule: 'Two offers can only be compared once they say the same thing: the price of one, the price per scoop, the cost over the same stretch of time. Divide first, then compare. A multi-buy saves money only on things you would have used anyway.',
    check: 'What does ONE cost in each — and do I actually need more than one?',
    egs: [['c4f', 'Per pen the deal is cheaper; for one pen it costs more.']],
  },
  push: {
    face: 'mags', col: '#A8365A', label: 'The seller’s push',
    mistake: 'A hurry, a “free”, or a shop laid out on purpose makes the decision for you.',
    rule: '“Today only” and “last one” are tools to stop you thinking, not facts about the thing. If you are not paying money, you are paying with something else — your attention, your details, or a bigger bill later. A shop is arranged to make buying easy, and that is not an accident.',
    check: 'Who gains if I decide right now? Then give yourself the time anyway.',
    egs: [['c4a', 'The same tray has been “the last one” for years.'], ['c4b', 'A free trial that needs a card is selling you forgetting to cancel.'], ['c4d', 'You walked past everything else to reach the bread.']],
  },
  scam: {
    face: 'nana', col: '#8A2E3A', label: 'The shape of a scam',
    mistake: 'A good story makes you forget to look at the shape of the message.',
    rule: 'Every scam has the same shape: a reward or a fright, a hurry, and a secret. A PIN, a password and a one-time code are never needed by anyone real. Telling a grown-up is the strong move, not the embarrassing one.',
    check: 'Is there a hurry, a secret and money in this? If all three, stop and tell someone.',
    egs: [['c5c', 'A prize, a panic or a friend in trouble — always rushed, always “just between us”.'], ['c5b', 'Your real bank already knows your account.'], ['c5f', 'One line in the total is not his — and he said so that evening.']],
  },
  yearly: {
    face: 'pip', col: '#5155BE', label: 'The small one that repeats',
    mistake: 'You judge a repeating price by the size of one payment.',
    rule: 'A small price that comes every week or every month is a choice made once and paid for again and again. Turn it into a yearly number before you agree, then compare that with the one-off way of having the same thing.',
    check: 'How many times a year does this come round? Multiply before you say yes.',
    egs: [['c4c', 'Half a year of a small monthly price — and it does not stop at half a year.']],
  },
  left: {
    face: 'pip', col: '#2A7239', label: 'What is left',
    mistake: 'You spend from what came in, before taking away what has to go out.',
    rule: 'A budget is two columns: money in and money out. Only what is left is yours to choose about. Some costs arrive whatever you do and some follow your choices — when less comes in, cut the ones that follow your choices first. And write it down: memory forgets small spends.',
    check: 'In, take away out — what is left? Say that number before you spend any of it.',
    egs: [['c3a', 'Out first, then in, then the number that is yours to choose about.'], ['c3f', 'The notebook beats the memory.']],
  },
  split: {
    face: 'nana', col: '#9A570F', label: 'Every jar has a job',
    mistake: 'You decide what money is for at the moment something is tempting you — or dip into money that already has a job.',
    rule: 'Split money the moment it lands, by a rule you set when nothing was tempting you. Each jar has one job: Spend for now, Save for soon, Grow for far away, Give for others. A surprise tin is for the costs nobody saw coming, not for a thing you want.',
    check: 'Which jar is this coming out of — and was that its job?',
    egs: [['c3b', 'Every coin has a jar before anyone looks at the shop.'], ['c5e', 'The chain snapped and the money was already there.'], ['x-ch11', 'The rule runs before you have looked at anything.']],
  },
  rate: {
    face: 'pip', col: '#33648A', label: 'A rate, not a lump',
    mistake: 'You compare totals when the question is about each hour, or each week.',
    rule: 'Pay is a rate: what an hour is worth. A bigger payment that takes far longer can be worth less for each hour, and getting better at the work makes every hour worth more. Goals run the same sum the other way round: the price divided by what you save each week is the number of weeks.',
    check: 'Per what? Per hour, per week — divide first, then compare.',
    egs: [['c2a', 'The time is what is being paid for, so the pay grows with it.'], ['c2e', 'The pay for each one never changed; the hour did.'], ['c3d', 'Not “someday” — a number of weeks.']],
  },
  oneoff: {
    face: 'mags', col: '#76590E', label: 'Once, or every week?',
    mistake: 'You plan around money that came once, or around your best week.',
    rule: 'A gift, a lucky sale or a good week is lovely, and it may not come again. Plan on the money that repeats, and on your slowest week — then a good week is a bonus, not a hole you fall into later. More than one source of money means one stopping is not the end.',
    check: 'Will this come again next week? If not, it is not part of the plan.',
    egs: [['c2c', 'Lovely, and it arrives once.'], ['c2f', 'Planned on the slowest week, and the extra went to Save.'], ['c2d', 'Two taps go badly most months, and she is never broke.']],
  },
  percent: {
    face: 'nana', col: '#006A78', label: 'Interest is rent on money',
    mistake: 'You lose track of which way the interest is flowing, or of what it is a slice of.',
    rule: 'Interest is rent paid for using money. Leave money with a bank and the bank pays you rent, because it lends your money out meanwhile. Borrow, and you pay the rent. A rate is always a slice of some amount — say which amount, then say the slice in coins.',
    check: 'Who is paying whom — and a slice of what?',
    egs: [['c5a', 'Your money is out working, and the bank owes it back.'], ['c6a', 'Which side of the rent you are on makes the difference.']],
  },
  compound: {
    face: 'nana', col: '#47711B', label: 'Growth on growth',
    mistake: 'You picture growth as the same step every time, so you expect a straight line.',
    rule: 'Growth lands on what is already there — last time’s growth included — so the steps get bigger on their own. That is why starting early beats adding more later, why a small yearly fee costs more than it looks, and why prices that creep up slowly still add up.',
    check: 'Is this growth landing on the starting amount only, or on everything so far?',
    egs: [['c7a', 'The second step is bigger, and nothing new was added.'], ['c7j', 'Starting sooner is ahead before any growth at all.'], ['c7e', 'Fees grow the same way growth does.']],
  },
  credit: {
    face: 'pip', col: '#9C3966', label: 'The total, not the payment',
    mistake: 'You judge a loan by the size of each payment.',
    rule: 'The number that matters is everything you hand back, take away what you borrowed. Before agreeing, check the payment fits in what is left each week — even a slow week. Borrowing is a tool with a price, not a wrong thing: find the price first.',
    check: 'One payment times how many payments — and does one payment fit in my slowest week?',
    egs: [['c6b', 'The small payment is what sellers show; the total is the truth.'], ['c6e', 'What is left decides whether a payment fits.'], ['c6f', 'Agreed out loud, written down, and it came back.']],
  },
  risk: {
    face: 'bea', col: '#5248A0', label: 'Risk and spreading out',
    mistake: 'You chase the biggest possible return, or put everything on the one thing you like best.',
    rule: 'Things that can grow a lot can fall a lot — it is the same sentence. Spread money across many things so one piece of bad news cannot sink everything, keep money you need soon somewhere safe, and on a bad day for money you will not need for years, doing nothing is often the decision.',
    check: 'If this one thing went wrong tomorrow, what would I still have?',
    egs: [['c7b', 'Bo says up, Bea says down. Neither knows, and both are sure.'], ['c7c', 'One thing, and your week depends on someone else’s Tuesday.'], ['c7g', 'Selling on a red day missed the bounce.']],
  },
  profit: {
    face: 'nana', col: '#286893', label: 'Takings are not profit',
    mistake: 'You count what came in as what you made.',
    rule: 'Revenue is what came in. Cost is what you paid to make it happen. Profit is what is left — and your own hours are a cost too. Cash is different again: a shop making a profit can still run out of money when the bills arrive before the sales.',
    check: 'What came in, take away what it cost — and when does the money actually arrive?',
    egs: [['c8a', 'Each sale leaves only what is over its own cost.'], ['c8e', 'The rent has to be covered before anything is profit.'], ['c8c', 'The restock bill came before the sales did.']],
  },
  change: {
    face: 'pip', col: '#665528', label: 'Counting the change',
    mistake: 'You take away in your head and slip — or walk off without counting.',
    rule: 'Change is what you gave, take away the price. The safe way is to count UP from the price to what you handed over, in easy steps, and add the steps together.',
    check: 'From the price, what takes me to the next round number — and from there to what I paid?',
    egs: [['c1f', 'Count up from the price, then add the steps.']],
  },
};
/* the order traps are listed in when two have caught a child equally often: the
   curriculum's own order, so a tie never looks random */
export const ORDER = ['change', 'needwant', 'pricevalue', 'rate', 'oneoff', 'left', 'split', 'tradeoff', 'push', 'unitprice', 'yearly', 'scam', 'percent', 'credit', 'compound', 'risk', 'profit'];

/* every lesson stop, and the one trap its questions test */
export const CARD_TRAP = {
  c1a: 'pricevalue', c1b: 'needwant', c1c: 'rate', c1d: 'pricevalue', c1e: 'pricevalue', c1f: 'change',
  c2a: 'rate', c2b: 'rate', c2c: 'oneoff', c2d: 'oneoff', c2e: 'rate', c2f: 'oneoff',
  c3a: 'left', c3b: 'split', c3c: 'tradeoff', c3d: 'rate', c3e: 'left', c3f: 'left',
  c4a: 'push', c4b: 'push', c4c: 'yearly', c4d: 'push', c4e: 'pricevalue', c4f: 'unitprice',
  c5a: 'percent', c5b: 'scam', c5c: 'scam', c5d: 'scam', c5e: 'split', c5f: 'scam',
  c6a: 'percent', c6b: 'credit', c6c: 'credit', c6d: 'credit', c6e: 'credit', c6f: 'credit',
  c7a: 'compound', c7b: 'risk', c7i: 'risk', c7c: 'risk', c7d: 'risk', c7j: 'compound', c7e: 'compound', c7f: 'compound', c7g: 'risk', c7h: 'compound',
  c8a: 'profit', c8b: 'profit', c8j: 'profit', c8c: 'profit', c8d: 'profit', c8i: 'profit', c8e: 'profit', c8f: 'profit', c8g: 'profit', c8h: 'profit',
  'x-ch4': 'unitprice', 'x-ch8': 'tradeoff', 'x-ch10': 'unitprice', 'x-ch11': 'split', 'x-ch12': 'tradeoff',
};
/* every objective, and the one trap a retrieval miss on it counts towards */
export const OBJ_TRAP = {
  'CHOOSE-1': 'needwant', 'CHOOSE-2': 'tradeoff', 'CHOOSE-3': 'pricevalue', 'CHOOSE-4': 'unitprice', 'CHOOSE-5': 'push', 'CHOOSE-6': 'push',
  'CHOOSE-7': 'yearly', 'CHOOSE-8': 'tradeoff', 'CHOOSE-9': 'push', 'CHOOSE-10': 'unitprice', 'CHOOSE-11': 'split', 'CHOOSE-12': 'tradeoff',
  'EARN-1': 'rate', 'EARN-2': 'rate', 'EARN-3': 'oneoff', 'EARN-4': 'rate', 'EARN-5': 'oneoff', 'EARN-6': 'rate', 'EARN-7': 'profit', 'EARN-8': 'oneoff',
  'KEEP-1': 'left', 'KEEP-2': 'split', 'KEEP-3': 'left', 'KEEP-4': 'rate', 'KEEP-5': 'split', 'KEEP-6': 'left', 'KEEP-7': 'left', 'KEEP-8': 'split',
  'GROW-1': 'percent', 'GROW-2': 'percent', 'GROW-3': 'compound', 'GROW-4': 'risk', 'GROW-5': 'risk', 'GROW-6': 'risk', 'GROW-7': 'compound', 'GROW-8': 'risk',
  'OWE-1': 'credit', 'OWE-2': 'credit', 'OWE-3': 'credit', 'OWE-4': 'credit', 'OWE-5': 'credit', 'OWE-6': 'tradeoff',
  'GUARD-1': 'scam', 'GUARD-2': 'scam', 'GUARD-3': 'push', 'GUARD-4': 'push', 'GUARD-5': 'yearly', 'GUARD-6': 'scam',
};
/* a card id as the deck stores it may be a question asked again later ("EARN-2#1",
   "EARN-2~41"): its objective decides */
export function trapOfCard(id) {
  if (CARD_TRAP[id]) return CARD_TRAP[id];
  const m = /^([A-Z]+-\d+)[#~]/.exec(String(id || ''));
  return m ? OBJ_TRAP[m[1]] || null : null;
}

/* One habit a day, turned over by "Another one →". About the town and about learning:
   no figure, no advice on anyone's real money, and nothing that assumes what a family has. */
export const HABITS = [
  { t: 'Say the other half of the price', b: 'Before you buy anything in Bizzington, say out loud what else that money could have been. It takes a moment, and it is the whole of opportunity cost.' },
  { t: 'Come back tomorrow', b: 'When something in the store looks wonderful, wait a day. If it still looks wonderful tomorrow, it probably is. Mags dislikes this habit more than any other.' },
  { t: 'Read your wallet’s list', b: 'Once a week, read every line in your town wallet. Each one should be something you remember doing. The ones you do not remember are the lesson.' },
  { t: 'Find the price of one', b: 'When two packs are different sizes, work out what one costs in each before you choose. The bigger pack is hoping you will not check.' },
  { t: 'Count the change up', b: 'Whenever change comes back, count up from the price to what you paid before you move on. Slips happen both ways.' },
  { t: 'Name the hurry', b: 'When anything tells you to be quick, say “that is a hurry” out loud. Naming it takes most of its power away.' },
  { t: 'Make the rule on a calm day', b: 'Set your jar rule when nothing is tempting you, not on pay day. Then pay day only keeps a promise you already made.' },
  { t: 'Ask “how often?”', b: 'Every time a price repeats, ask how often it comes round and turn it into a year before you agree.' },
  { t: 'Total before you borrow', b: 'Before any loan in the town, multiply the payment by how many payments there are. That total, not the payment, is the price.' },
  { t: 'Treat a miss as a clue', b: 'A wrong answer tells the coach how you are thinking. Read the “why” after every miss — it is the cheapest lesson in Bizzington.' },
  { t: 'Teach it to someone', b: 'Pick one idea you met this week and explain it to someone in your own words. If you can teach it, it is yours.' },
  { t: 'The week-later check', b: 'A week after you buy something in the store, ask whether you are still glad. Notice what kind of thing the not-glad ones are.' },
  { t: 'Say what is left first', b: 'Before you spend anything on pay day, say what is left after the week’s costs. That is the only number you get to choose about.' },
  { t: 'Leave it alone on a red day', b: 'When the Exchange has a bad week, write down how it feels and do nothing. Look again next week, and notice what changed.' },
  { t: 'One jar, one job', b: 'Before you take anything out of a jar, say what the jar is for. If this is not that, it comes from somewhere else.' },
  { t: 'Spot the shape, not the story', b: 'When a letter in the postbox asks for something, look for a hurry, a secret and money. The story changes every time; the shape never does.' },
];

/* the doors the next chapters open, in the town's own words (content.js UNLOCKS) */
export const DOORS = { jars: 'the Jar Shed', goals: 'the Build Yard', bank: 'the Bank', loans: 'borrowing at the Bank', portfolio: 'the Exchange', business: 'Nana Bizz’s shop' };

/* ── the read ────────────────────────────────────────────────────────────
   Each trap's count of misses, from the two records, and which cards and objectives they
   came from. Open deck items count every miss they carry; a retrieval miss counts only
   while its idea is not held (retained or transferred) — a miss since put right is not a
   pattern any more. */
export function tally(c) {
  const by = {};
  const add = (k, n, card, obj) => {
    if (!k || !n) return;
    const t = by[k] || (by[k] = { k, n: 0, cards: {}, objs: {} });
    t.n += n;
    if (card) t.cards[card] = (t.cards[card] || 0) + n;
    if (obj) t.objs[obj] = (t.objs[obj] || 0) + n;
  };
  mistakes.open(c).forEach((m) => add(trapOfCard(m.card), m.misses || 1, m.card, null));
  const rec = (c.mastery && c.mastery.rec) || {};
  OBJECTIVES.forEach((o) => {
    const r = rec[o.id]; if (!r || ['retained', 'transferred'].includes(r.state)) return;
    const miss = (r.hist || []).filter((h) => !h.ok).length;
    add(OBJ_TRAP[o.id], miss, o.teach, o.id);
  });
  const list = Object.values(by).sort((a, b) => b.n - a.n || ORDER.indexOf(a.k) - ORDER.indexOf(b.k));
  return list.map((t) => ({ ...t, label: (RULES[t.k] || {}).label || t.k,
    worst: Object.entries(t.cards).sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ id, n })) }));
}
/* Pip's one sentence. It names the one pattern most of the misses share — or, when no
   pattern has most of them, says so honestly and names the commonest. HTML-safe: labels are
   this file's own words. */
export function read(c) {
  const traps = tally(c), total = traps.reduce((t, x) => t + x.n, 0), top = traps[0] || null;
  if (!top) return { traps, total, top: null, mode: 'empty',
    sentence: `There is nothing for me to read yet. Go and get some wrong — a miss tells me how you think about money, which a right answer never does.` };
  const share = top.n / total;
  if (traps.length === 1 || share > 0.5) return { traps, total, top, mode: 'one',
    sentence: `Most of what trips you up goes the same way: <b>${top.label.toLowerCase()}</b>. ${top.n === total ? (total === 1 ? 'Your one miss went that way' : `All ${total} of your misses go that way`) : `${top.n} of your ${total} misses go that way`} — fix that one thing and ${top.n === 1 ? 'it stops' : 'they stop'} happening.` };
  return { traps, total, top, mode: 'spread',
    sentence: `Your misses are spread out, which is a good place to be. The one that comes up most is <b>${top.label.toLowerCase()}</b> — ${top.n} of your ${total}.` };
}
