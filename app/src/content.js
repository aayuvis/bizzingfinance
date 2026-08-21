/* content.js — everything the app teaches, in one place.
   Rules that bind this file:
   · No real company is ever named as a thing to buy (CONCEPT §6.2).
   · No factual number without a source (CONCEPT §6.5) — so this prototype
     teaches ideas and arithmetic only, and every "real world" figure is
     marked SAMPLE until an author fills sources[].
   · No drill leaks its answer in on-screen text. */

import { rng } from './ui.js';

/* ── the ladder ───────────────────────────────────────────────────────────
   Prototype ladder is compressed (6 levels, not 30) so a reviewer can walk
   the whole street in one sitting. Shipping ladder: docs/01 §10. */
export const LEVELS = [0, 45, 110, 195, 300, 430, 590, 780];
export const RANKS = [
  { at: 1, name: 'Saver' }, { at: 2, name: 'Budgeter' }, { at: 3, name: 'Budgeter' },
  { at: 4, name: 'Banker' }, { at: 5, name: 'Investor' }, { at: 6, name: 'Founder' },
  { at: 7, name: 'Founder' },
];
export function levelFor(xp) {
  let l = 1;
  for (let i = 1; i < LEVELS.length; i++) if (xp >= LEVELS[i]) l = i + 1;
  return Math.min(l, 7);
}
export function rankFor(level) {
  let r = RANKS[0].name;
  RANKS.forEach((x) => { if (level >= x.at) r = x.name; });
  return r;
}

/* ── chapters ────────────────────────────────────────────────────────────── */
export const CHAPTERS = [
  {
    id: 'c1', title: 'What money even is', rank: 'Saver', em: '🪙',
    blurb: 'Four cards. Where money comes from, and why anyone accepts it.',
    cards: [
      {
        id: 'c1a', title: 'Money is an agreement', who: 'nana',
        teach: 'A note is a piece of paper. It buys bread because <b>everyone agrees it does</b> — not because the paper is worth anything. Different places agree on different money, which is why the notes change when you cross a border.',
        eg: 'The same slice of cake costs a different number in every country. The cake did not change.',
        drill: {
          q: 'Why will the shopkeeper hand over a mango for a note?',
          opts: ['The paper is worth a mango', 'Everyone has agreed the note can be swapped for things', 'The government sends her a mango later', 'The note is made of gold'],
          a: 1,
          why: 'Money works because of shared agreement. That is also why a note from another country is no use at your corner shop.',
        },
      },
      {
        id: 'c1b', title: 'Needs and wants', who: 'pip',
        teach: 'A <b>need</b> is something you would be in trouble without. A <b>want</b> is something that makes life nicer. Both are allowed! The trick is knowing which one you are looking at <i>before</i> you pay.',
        eg: 'Rain is coming. An umbrella is a need today and a want in May.',
        drill: {
          q: 'Which of these changes from a want to a need depending on the day?',
          opts: ['A birthday cake', 'An umbrella', 'A gold chain', 'A video game'],
          a: 1,
          why: 'Lots of things move between the two columns. That is why "needs vs wants" is a question, not a list.',
        },
      },
      {
        id: 'c1c', title: 'Where money comes from', who: 'pip',
        teach: 'Money arrives because somebody <b>traded something they had for something they wanted</b>. Usually that is time and skill: you do work, someone pays. Nobody is given money for nothing — and if a message says they will, read the next card twice.',
        eg: 'Pip carries crates for the grain seller. The grain seller has money and no time. Both end up better off.',
        drill: {
          q: 'Mrs Rao pays you to deliver flyers. What did you actually sell her?',
          opts: ['Paper', 'Your time and effort', 'Nothing — it was a gift', 'Her own flyers'],
          a: 1,
          why: 'Wages are a trade. Knowing that is what stops "free money" offers from ever sounding normal.',
        },
      },
      {
        id: 'c1d', title: 'Price is not value', who: 'mags',
        teach: 'The <b>price</b> is what the seller asks. The <b>value</b> is what it is worth <i>to you</i>. They are almost never the same number, and the gap between them is where every good and bad decision lives.',
        eg: 'Mags will sell you a shiny button for a whole week of wages. The price is real. The value is up to you.',
        drill: {
          q: 'Two shops sell the same water bottle at very different prices. What must be true?',
          opts: ['The dearer one is always better made', 'Price does not only depend on the thing itself', 'The cheaper one is broken', 'One of them is breaking the law'],
          a: 1,
          why: 'Location, timing, and who is buying all move a price. The bottle is the same bottle.',
        },
      },
    ],
  },
  {
    id: 'c2', title: 'Making a plan', rank: 'Budgeter', em: '🫙',
    blurb: 'Income, outgo, and the four jars that stop the month being a surprise.',
    cards: [
      {
        id: 'c2a', title: 'In, out, and what is left', who: 'pip',
        teach: 'A budget is only two columns: money <b>in</b> and money <b>out</b>. What is left over is the only part you get to choose about. If out is bigger than in, the difference has to come from somewhere — savings, or someone else.',
        eg: 'In: 200 on pay day. Out: 60 phone, 40 bus. Left: 100. That 100 is the interesting number.',
        drill: {
          q: 'Money in is 200. Money out is 240. What has to be true?',
          opts: ['Nothing, it balances', 'The gap comes out of savings or a loan', 'The bank fixes it', 'You earned 240'],
          a: 1,
          why: 'A shortfall never vanishes. It moves — usually onto next month.',
        },
      },
      {
        id: 'c2b', title: 'The four jars', who: 'nana',
        teach: 'Split what comes in, the moment it arrives: <b>Spend</b> for now, <b>Save</b> for something soon, <b>Grow</b> for far away, <b>Give</b> for someone else. Splitting first is the whole trick — anything left in one pile gets spent as one pile.',
        eg: 'Nana has done 40 / 30 / 20 / 10 for sixty years and has never once made a budget spreadsheet.',
        drill: {
          q: 'Why split the money the moment it arrives, instead of at the end of the week?',
          opts: ['It earns more that way', 'Because what sits in one pile gets spent as one pile', 'The bank requires it', 'It makes the total bigger'],
          a: 1,
          why: 'This is "pay yourself first". It works because it removes the decision, not because it changes the maths.',
        },
      },
      {
        id: 'c2c', title: 'What it really cost', who: 'mags',
        teach: 'Every yes is also a no. Buying the shiny thing is not just "minus 600" — it is <b>also</b> the trip you now cannot take, or the goal that just moved three weeks further away. Grown-ups call that <i>opportunity cost</i>.',
        eg: 'Mags never mentions the second half of the price. That is not lying — it is just selling.',
        drill: {
          q: 'You spend your whole Save jar on a game. What did it cost?',
          opts: ['The price of the game', 'The price, plus whatever the Save jar was for', 'Nothing, it was your money', 'Only the tax'],
          a: 1,
          why: 'Opportunity cost is the part of the price that is not on the label.',
        },
      },
      {
        id: 'c2d', title: 'How many weeks?', who: 'pip',
        teach: 'A goal turns into a plan the moment you divide. <b>Price ÷ what you save each week = weeks.</b> If the answer is horrifying, you have three honest choices: save more each week, want something cheaper, or wait longer.',
        eg: 'A 900 skateboard, saving 60 a week, is 15 weeks. Not "someday". Fifteen.',
        drill: {
          q: 'It costs 800. You put away 50 a week. Roughly how long?',
          opts: ['4 weeks', '8 weeks', '16 weeks', '40 weeks'],
          a: 2,
          why: '800 ÷ 50 = 16. Dividing turns a wish into a date, which is why the Build Yard shows weeks, not encouragement.',
        },
      },
    ],
  },
  {
    id: 'c3', title: 'Money that grows', rank: 'Banker → Investor', em: '📈',
    blurb: 'Interest, patience, risk, and why nobody sensible owns one thing.',
    cards: [
      {
        id: 'c3a', title: 'Interest, both ways', who: 'nana',
        teach: 'Interest is <b>rent on money</b>. Leave money with a bank and they pay you rent for using it. Borrow money and you pay rent for using theirs. Same idea, and which side you are on makes all the difference.',
        eg: 'Borrowing is not shameful — it is a tool with a price on it. Always find the price before you agree.',
        drill: {
          q: 'What is the honest way to describe interest on a loan?',
          opts: ['A punishment for being bad with money', 'The rent you pay for using somebody else’s money', 'A tax', 'A fee the shop keeps'],
          a: 1,
          why: 'Credit is a tool with a price, never a moral failing. Knowing the price is the skill.',
        },
      },
      {
        id: 'c3b', title: 'The snowball', who: 'pip',
        teach: 'Interest lands on your money — and then next time, it lands on <b>your money plus the interest</b>. That is compounding. It is boring for a year and then it is not boring at all.',
        eg: '100 growing 10% a year: 110, then 121, then 133. The steps get bigger while you do nothing.',
        drill: {
          q: 'Why does the second year add more than the first?',
          opts: ['The rate went up', 'There is more money for the rate to land on', 'The bank felt generous', 'Prices rose'],
          a: 1,
          why: 'Growth stacking on growth is the whole idea. Time does the heavy lifting, which is why starting early beats starting big.',
        },
      },
      {
        id: 'c3c', title: 'Risk and return', who: 'bo',
        teach: 'Things that <i>might</i> grow a lot can also fall a lot — those are the same sentence, not two different ones. Safe things grow slowly. Anybody promising big returns with no risk is either confused or lying.',
        eg: 'Bo says it will go up. Bea says it will go down. Neither of them knows, and both of them are certain.',
        drill: {
          q: 'Somebody offers a "guaranteed" way to double your money in a month. What is the safe read?',
          opts: ['Take it quickly before it goes', 'Guaranteed and doubling do not belong in the same sentence', 'Ask them to do it twice', 'Only put in half'],
          a: 1,
          why: 'High return with no risk is the oldest shape a scam takes.',
        },
      },
      {
        id: 'c3d', title: 'Never just one', who: 'bea',
        teach: 'Owning a slice of <b>many</b> things means no single piece of bad news can wreck you. Owning one thing means your whole week depends on somebody else’s Tuesday. Spreading out is the only free thing in this entire subject.',
        eg: 'A basket of the whole market is dull, and dull wins more often than exciting does.',
        drill: {
          q: 'Why spread money across many things instead of the one you like best?',
          opts: ['It grows faster', 'One piece of bad news can no longer sink everything', 'It costs less', 'The best one is hard to find'],
          a: 1,
          why: 'Diversification does not raise your top score. It raises your worst one — and the worst one is what ends games.',
        },
      },
    ],
  },
];
export const ALL_CARDS = CHAPTERS.flatMap((c) => c.cards.map((k) => ({ ...k, ch: c.id })));

/* ── the postbox ─────────────────────────────────────────────────────────
   One letter a day. ~1 in 7 is a scam, and it looks exactly like the rest —
   that IS the lesson (docs/02 §3). Amounts are in units; the sim converts. */
export const LETTERS = [
  {
    id: 'l1', from: 'pip', title: 'Crates need carrying', scam: false,
    body: 'The grain seller has forty crates and no time. It is an hour of work. Want it?',
    choices: [
      { label: 'Take the job', wallet: 6, xp: 8, note: 'An hour of your time, traded.' },
      { label: 'Not today', xp: 3, note: 'Turning down work is a real choice, and sometimes the right one.' },
    ],
  },
  {
    id: 'l2', from: 'mags', title: 'Shiny! Today only!', scam: false,
    body: 'A genuine brass button, previously owned by somebody important, probably. Half a week of your wages. The LAST one.',
    choices: [
      { label: 'Buy the button', wallet: -10, xp: 4, note: 'You bought it. That is allowed — but "last one, today only" is a pressure trick, and now you have met one.' },
      { label: 'Walk away', xp: 10, badge: 'cool-head', note: 'Urgency is a sales tool. You noticed.' },
    ],
  },
  {
    id: 'l3', from: 'scam', title: 'YOU HAVE WON 5,000!', scam: true,
    body: 'Congratulations!! You are our lucky winner!! To release your prize just send a small handling fee of 200 to the address below. Reply within 2 hours.',
    choices: [
      { label: 'Pay the fee', wallet: -20, xp: 6, safety: true, note: 'The prize never arrives. Nobody who is giving you money needs money from you first. That cost you 20 — cheap, here.' },
      { label: 'Bin it and tell a grown-up', xp: 14, badge: 'scam-spotter', safety: true, note: 'Right on both counts: a prize you did not enter is not a prize, and telling someone is part of the answer.' },
    ],
  },
  {
    id: 'l4', from: 'nana', title: 'A question, not a task', scam: false,
    body: 'Ask someone at home tonight: what is the first thing they ever saved up for, and how long did it take? Then come back and tell me.',
    choices: [
      { label: 'I asked them', xp: 16, badge: 'asked-home', note: 'Good. Every family does money differently, and yours is the one you live in.' },
      { label: 'Later', xp: 2, note: 'It will keep.' },
    ],
  },
  {
    id: 'l5', from: 'pip', title: 'The pizza problem', scam: false,
    body: 'Chhoti wants to split a big pizza — that is 15 each. The bus home is 4 each way. You have 22.',
    choices: [
      { label: 'Split the pizza, walk home', wallet: -15, xp: 12, note: 'You made the trade knowingly. That is the whole skill.' },
      { label: 'Skip the pizza', xp: 10, note: 'Also right. There is no wrong answer here — only an unplanned one.' },
      { label: 'Split it and worry later', wallet: -15, xp: 5, note: 'You got home, but the walk was not a decision — it was a surprise. Surprises are what a budget removes.' },
    ],
  },
  {
    id: 'l6', from: 'scam', title: 'is this you?? 😭', scam: true,
    body: 'hey its me i lost my phone im on my cousins account. im stuck and i need 300 rly quick, ill pay you back tomorrow promise. dont tell anyone its embarrassing',
    choices: [
      { label: 'Send it — they sound desperate', wallet: -30, xp: 6, safety: true, note: 'This is the most common scam that reaches children. "Do not tell anyone" is the tell. A real friend can wait sixty seconds while you check.' },
      { label: 'Check with them another way first', xp: 15, badge: 'scam-spotter', safety: true, note: 'Exactly. Call the number you already have. Secrecy plus urgency plus money is always the same shape.' },
    ],
  },
  {
    id: 'l7', from: 'pip', title: 'Bulk deal at the grain stall', scam: false,
    body: 'Six weeks of chalk for the price of four — but you have to buy all six now. You have the money, just.',
    choices: [
      { label: 'Buy the six', wallet: -12, xp: 12, note: 'Buying ahead is cheaper per unit. It also empties your pocket today, which is the part the deal does not mention.' },
      { label: 'Buy one week', wallet: -3, xp: 8, note: 'Dearer per week, but you kept your options. Both answers are defensible.' },
    ],
  },
  {
    id: 'l8', from: 'bea', title: 'Everything is red today', scam: false,
    body: 'The board is down. Every single line. Bo says buy, I say run. What are you going to do?',
    choices: [
      { label: 'Sell everything', xp: 6, note: 'You turned a paper fall into a real one. Everyone does this once — the point is to have done it here, with play money.' },
      { label: 'Do nothing', xp: 15, badge: 'steady-hand', note: 'Sitting still is a decision, and on a red day it is usually the hard one.' },
    ],
  },
  {
    id: 'l9', from: 'scam', title: 'FREE 10,000 COINS — 1 STEP', scam: true,
    body: 'GENERATOR WORKING 2026!! Just enter your account name and password on the site below and get UNLIMITED coins instantly. 100% safe no ban.',
    choices: [
      { label: 'Try it', wallet: -25, xp: 6, safety: true, note: 'There is no generator. What there is, is a page collecting passwords — and the account it takes is yours.' },
      { label: 'Close it', xp: 14, badge: 'scam-spotter', safety: true, note: 'Free things that need your password are not free and are not things.' },
    ],
  },
  {
    id: 'l10', from: 'nana', title: 'The shop needs a decision', scam: false,
    body: 'Rain is forecast on market day. Umbrellas cost me 8 each and sell for 20 — but only if it rains. If it stays dry I am stuck with them.',
    choices: [
      { label: 'Buy ten umbrellas', xp: 12, note: 'That is a bet on the weather with real cost attached. Businesses make it every week.' },
      { label: 'Buy three', xp: 14, note: 'Smaller bet, smaller loss, smaller win. You just discovered position sizing without anyone using the words.' },
    ],
  },
  {
    id: 'l11', from: 'mags', title: 'I could take that off your hands', scam: false,
    body: 'That old thing you never use? I will give you 5 for it. Right now. Cash.',
    choices: [
      { label: 'Sell it', wallet: 5, xp: 10, note: 'Selling what you do not use is income. Most people never think of it as income.' },
      { label: 'Keep it', xp: 5, note: 'Fine — but notice you just valued it above 5.' },
    ],
  },
  {
    id: 'l12', from: 'pip', title: 'Pay day is Friday', scam: false,
    body: 'Reminder: wages land Friday, and the phone plan goes out the same morning. Do you know what will be left?',
    choices: [
      { label: 'Yes — I checked', xp: 12, note: 'Knowing the number before it happens is the entire difference between a budget and a hope.' },
      { label: 'No idea', xp: 4, note: 'Open the Jar Shed before Friday, then.' },
    ],
  },
];

/* ── the store — the temptation engine ───────────────────────────────────
   Priced in the child's own money, and every item shows what else that
   money could have been (CONCEPT §3.1). */
export const SHOP = [
  { id: 'lantern', em: '🏮', name: 'Festival lantern', units: 8,  desc: 'Hangs over your stall. Purely lovely.' },
  { id: 'awning',  em: '⛱️', name: 'Striped awning',   units: 16, desc: 'Your stall, but smarter.' },
  { id: 'cap',     em: '🧢', name: 'Market cap',        units: 12, desc: 'Pip has one. Pip thinks it suits him.' },
  { id: 'cat',     em: '🐈', name: 'A shop cat',        units: 30, desc: 'Does nothing. Sits. Worth it, arguably.' },
  { id: 'sign',    em: '🪧', name: 'Painted sign',      units: 24, desc: 'Your name, in gold leaf, above your own stall.' },
  { id: 'brass',   em: '🔆', name: "Mags's brass button", units: 60, desc: 'Previously owned by somebody important, probably.' },
];

/* ── the market — fictional companies, honest volatility ─────────────────
   Real historical BEHAVIOUR (drift + volatility), invented names. No real
   security is ever named as a thing to buy (CONCEPT §6.2). */
export const ASSETS = [
  { id: 'basket', name: 'Whole Market Basket', kind: 'fund',    em: '🧺', vol: 0.030, drift: 0.0075, desc: 'A slice of every shop in town. Dull by design.' },
  { id: 'grain',  name: 'Sunrise Grains',      kind: 'steady',  em: '🌾', vol: 0.016, drift: 0.0040, desc: 'People eat in good years and bad. Rarely exciting.' },
  { id: 'chai',   name: 'Chai Chain Co',       kind: 'growth',  em: '🫖', vol: 0.052, drift: 0.0090, desc: 'Opening shops fast. Fast can go both ways.' },
  { id: 'rocket', name: 'Rocket Rickshaws',    kind: 'wild',    em: '🛺', vol: 0.105, drift: 0.0125, desc: 'Might be the future. Might be a rickshaw.' },
];

/* Deterministic: the same market for every player, every reload. */
export function makeSeries(steps) {
  const out = {};
  ASSETS.forEach((a, ai) => {
    const r = rng(9301 + ai * 7919);
    let p = 100;
    const arr = [p];
    for (let i = 0; i < steps; i++) {
      const shock = (r() + r() + r() - 1.5) * 2 * a.vol;
      const crash = (i === Math.floor(steps * 0.55)) ? -a.vol * 3.1 : 0;
      p = Math.max(6, p * (1 + a.drift + shock + crash));
      arr.push(p);
    }
    out[a.id] = arr;
  });
  return out;
}

export const BADGES = {
  'first-coin':   { em: '🪙', name: 'First earnings',   desc: 'Money you traded your time for.' },
  'scam-spotter': { em: '🛡️', name: 'Scam spotter',     desc: 'You saw it coming.' },
  'cool-head':    { em: '🧊', name: 'Cool head',        desc: 'Said no to a "today only".' },
  'asked-home':   { em: '🏡', name: 'Asked at home',    desc: 'Every family does money differently.' },
  'steady-hand':  { em: '🪨', name: 'Steady hand',      desc: 'Did nothing on a red day. Hardest move there is.' },
  'jars-set':     { em: '🫙', name: 'Split it first',   desc: 'Paid yourself before you paid anyone else.' },
  'goal-built':   { em: '🏗️', name: 'Built it',         desc: 'Finished a goal in the Build Yard.' },
  'chapter-1':    { em: '📗', name: 'Chapter one',      desc: 'You know what money actually is.' },
  'chapter-2':    { em: '📘', name: 'Chapter two',      desc: 'You can make a plan and keep it.' },
  'chapter-3':    { em: '📙', name: 'Chapter three',    desc: 'Interest, risk, and not owning one thing.' },
  'diversified':  { em: '🧺', name: 'Never just one',   desc: 'Won a Market Cup round without betting the lot.' },
  'payday':       { em: '🔔', name: 'First pay day',    desc: 'Heard the bell, split the money.' },
};

/* Position must never leak the answer. Options are permuted deterministically
   from the card id, so the order is stable for a given child but is not the
   order they were authored in — otherwise "always pick B" beats the drill. */
export function shuffledDrill(card) {
  let h = 2166136261;
  for (let i = 0; i < card.id.length; i++) { h ^= card.id.charCodeAt(i); h = Math.imul(h, 16777619); }
  const idx = card.drill.opts.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507); h >>>= 0;
    const j = h % (i + 1);
    const t = idx[i]; idx[i] = idx[j]; idx[j] = t;
  }
  return { order: idx, opts: idx.map((i) => card.drill.opts[i]), answer: idx.indexOf(card.drill.a) };
}
