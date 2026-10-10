/* smartsim.js — Smart Choices' content and its arithmetic, with no screen in it (docs/12 §2.2).

   Three modes, each drawn from the play's own seed (§1.2: content variety is simulation,
   never a reward), and each built so that guessing does not pay (T9):

   · Needs and Wants — a pool of 60+ cards. "Both" is a third answer, and it only counts with
     the right reason chip, so it is never a free point. A coin flip lands near a third.
   · Scam Spotter — messages ASSEMBLED from parts: a story's hook (a reward or a fright), a
     hurry, a secret, on a channel. The shape decides, not capital letters: whether a message
     shouts is drawn the same for traps and real ones, so "ALL CAPS = scam" is chance exactly.
     After "It's a trap" comes the skill: tap the phrase that gives it away.
   · Better Buy — two shelf tags; which is cheaper per item, then type the price of one. Every
     pair is generated from its each-prices, so the right answer is proved by construction and
     re-proved from the tags (test/smartchoices.mjs). The judgement layer — waste, the bigger
     pack that costs more each, buy-one-get-one-half-price — arrives on the higher levels, and
     a child who has not met division (M5) compares the same amount instead.

   Every amount is in the currency's smallest unit (fmt.js minorPrice), so a price of one is a
   whole number of coins in ₹, $, £, € and AED alike, and the sum on screen is the sum checked.
   The shelf prices are town dials, registered in sources.js ('shelf'). */
import { rng } from './ui.js';
import { CURRENCIES, currency, minorPrice, minorMoney } from './fmt.js';

export const SC_MODES = ['nw', 'ss', 'bb'];
export const SC_MODE_NAME = { nw: 'Needs and Wants', ss: 'Scam Spotter', bb: 'Better Buy' };
const LV = ['easy', 'standard', 'tricky'];

/* the knobs of each mode at each level (a level turns the mechanic's own knobs, nothing else) */
export const SC_KNOBS = {
  easy: {
    nw: { n: 8, both: 1, chips: 2, clock: 0 },
    ss: { n: 6, hurry: 0.8, clock: 0 },
    bb: { n: 5, mix: { unit: 3, bigdear: 2 }, round: true },
  },
  standard: {
    nw: { n: 12, both: 3, chips: 3, clock: 0 },
    ss: { n: 10, hurry: 0.7, clock: 0 },
    bb: { n: 6, mix: { unit: 3, bigdear: 3 }, round: false },
  },
  tricky: {
    nw: { n: 12, both: 4, chips: 3, clock: 7000 },
    ss: { n: 10, hurry: 0.55, clock: 9000 },
    bb: { n: 6, mix: { unit: 1, bigdear: 1, waste: 2, bogof: 2 }, round: false },
  },
};
/* a message's call is worth one; finding the tell in a trap is the skill, and worth two */
export const SS_POINTS = { call: 1, tell: 2 };
/* a shelf: the right pick, and the price of one typed */
export const BB_POINTS = { pick: 1, typed: 1 };

const seedOf = (seed, mode, level) => (((seed >>> 0) * 31 + SC_MODES.indexOf(mode) * 7919 + LV.indexOf(level) * 104729 + 17) >>> 0);
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
const pick = (a, r) => a[Math.floor(r() * a.length) % a.length];
const knobs = (level) => SC_KNOBS[level] || SC_KNOBS.standard;

/* ══ 1 · NEEDS AND WANTS ══════════════════════════════════════════════════
   `why` on a "both" card: the right reason first, then two that sound fine and are not. */
export const NEEDS = [
  /* needs: you would be in trouble this week without them */
  { em: 'rice', t: 'Rice for the week', a: 'need' },
  { em: 'bus', t: 'The bus fare to school', a: 'need' },
  { em: 'coat', t: 'A winter coat, when yours no longer fits', a: 'need' },
  { em: 'medicine', t: 'Medicine you were prescribed', a: 'need' },
  { em: 'drop', t: 'Clean water', a: 'need' },
  { em: 'shoe', t: 'Shoes, when your only pair has split', a: 'need' },
  { em: 'home', t: 'Rent on your room in Bizzington', a: 'need' },
  { em: 'sparkle', t: 'Soap and a toothbrush', a: 'need' },
  { em: 'coat', t: 'A school uniform that fits', a: 'need' },
  { em: 'eye', t: 'Glasses the eye doctor said you need', a: 'need' },
  { em: 'basket', t: 'Vegetables for the week\'s dinners', a: 'need' },
  { em: 'roti', t: 'Rotis for breakfast', a: 'need' },
  { em: 'crayon', t: 'An exercise book for school', a: 'need' },
  { em: 'lantern', t: 'The bill that keeps the lights on', a: 'need' },
  { em: 'snowflake', t: 'A warm blanket in winter', a: 'need' },
  { em: 'medicine', t: 'A plaster for a cut that needs covering', a: 'need' },
  { em: 'wrench', t: 'Mending the leak in the roof', a: 'need' },
  { em: 'parasol', t: 'A raincoat for walking to school in the monsoon', a: 'need' },
  { em: 'bus', t: 'The fare to the job that pays your rent', a: 'need' },
  { em: 'lock', t: 'A lock for the bicycle you ride to work', a: 'need' },
  { em: 'handshake', t: 'Paying back what you borrowed, on the day you promised', a: 'need', note: 'A promise kept is part of what lets people trust you with the next one.' },
  { em: 'pan', t: 'Lentils and spices for dinner', a: 'need' },
  { em: 'pan', t: 'Gas for the cooking stove', a: 'need' },
  { em: 'drop', t: 'Your share of the water bill', a: 'need' },
  { em: 'medicine', t: 'A check-up the nurse booked for you', a: 'need' },
  { em: 'wheat', t: 'Flour for the week\'s bread', a: 'need' },
  /* wants: lovely, and you would get through the week */
  { em: 'play', t: 'A new game', a: 'want' },
  { em: 'chocolate', t: 'Chocolate at the till', a: 'want' },
  { em: 'headphones', t: 'A second pair of headphones', a: 'want' },
  { em: 'coat', t: 'A second hoodie', a: 'want' },
  { em: 'star', t: 'Stickers', a: 'want' },
  { em: 'page', t: 'A comic', a: 'want' },
  { em: 'gola', t: 'An ice gola on a hot afternoon', a: 'want' },
  { em: 'kite', t: 'A kite', a: 'want' },
  { em: 'shoe', t: 'Trainers in this year\'s colour, when yours still fit', a: 'want', note: 'They still fit. That makes them a want today.' },
  { em: 'phone', t: 'A glittery phone case', a: 'want' },
  { em: 'bicycle', t: 'A new bike, when yours works fine', a: 'want' },
  { em: 'clapper', t: 'Cinema tickets', a: 'want' },
  { em: 'pan', t: 'A takeaway because nobody fancies cooking', a: 'want' },
  { em: 'box', t: 'The toy from the cereal-box advert', a: 'want', note: 'An advert\'s whole job is to turn a want into something that feels like a need.' },
  { em: 'crayon', t: 'Forty colours of paint, when you have twelve', a: 'want' },
  { em: 'crayon', t: 'A fancy pencil case', a: 'want' },
  { em: 'window', t: 'A bigger screen for the front room', a: 'want' },
  { em: 'chocolate', t: 'Sweets from the market', a: 'want' },
  { em: 'star', t: 'A football shirt with a player\'s name on it', a: 'want' },
  { em: 'heart', t: 'A teddy that matches your friend\'s', a: 'want' },
  { em: 'play', t: 'A new outfit for your character in a game', a: 'want' },
  { em: 'lantern', t: 'Fairy lights for your room', a: 'want' },
  { em: 'drop', t: 'Fizzy drinks for the week', a: 'want' },
  { em: 'music', t: 'A music app with no adverts', a: 'want' },
  /* both — and the reason is the whole card */
  { em: 'parasol', t: 'An umbrella, and it is raining', a: 'both', note: 'Today it is a need. In May it is a want. That is the whole card.',
    why: ['Today it keeps you dry; on a sunny day it would be a want', 'Umbrellas are cheap, so it does not matter which', 'Everyone in town has an umbrella'] },
  { em: 'phone', t: 'A phone, and your family shares one', a: 'both', note: 'Depends entirely on the household. There is no universal answer, and pretending there is would be the mistake.',
    why: ['Reaching people can be a need; a phone of your very own is the want', 'Phones are always needs, for everyone', 'It is both because phones cost a lot'] },
  { em: 'cake', t: 'A cake for your sister\'s birthday', a: 'both', note: 'Nobody starves without it. It might still be the best thing you buy all month.',
    why: ['Nobody needs cake to live, and a birthday can still matter a lot', 'Cake is food, so it is always a need', 'It is both because she asked for it'] },
  { em: 'shoe', t: 'Trainers with a famous logo, and your old pair has a hole', a: 'both', note: 'The need is shoes. The logo is the want riding along with it.',
    why: ['You need shoes; the famous logo is the want', 'A famous logo makes shoes last for ever', 'Trainers are always a want'] },
  { em: 'coat', t: 'A winter coat with a fur-trimmed hood', a: 'both',
    why: ['You need a warm coat; the fancy trim is the want', 'Fur trim is what keeps a coat warm', 'Coats are only a need when they are new'] },
  { em: 'pan', t: 'Lunch at a café, when you forgot your lunchbox', a: 'both',
    why: ['You need lunch; the café price is the want part', 'Cafés are always a treat, so it is a want', 'Lunch is a need, so any lunch at any price is too'] },
  { em: 'bicycle', t: 'A shiny new bicycle to get to your job', a: 'both',
    why: ['Getting to work is the need; shiny and new is the want', 'Bicycles are toys, so it is a want', 'A new one is a need because old ones are slower'] },
  { em: 'box', t: 'A school bag with a cartoon on it', a: 'both',
    why: ['You need a bag for school; the cartoon is the want', 'A cartoon bag is a need because others have one', 'School things are always needs'] },
  { em: 'drop', t: 'A bottle of juice on a hot day', a: 'both',
    why: ['You need a drink; water would do, the juice is the want', 'Juice is a need because it is a drink', 'It is a want because it costs money'] },
  { em: 'sparkle', t: 'A haircut at the fancy salon', a: 'both',
    why: ['A haircut can be a need; the fancy salon is the want', 'Hair always grows back, so it is a want', 'A salon is a need because it is a shop'] },
  { em: 'eye', t: 'Glasses with designer frames', a: 'both',
    why: ['You need the glasses; designer frames are the want', 'Designer frames help you see better', 'Glasses are only a need for grown-ups'] },
  { em: 'lesson', t: 'Extra lessons in the subject you are stuck on', a: 'both',
    why: ['Help where you are stuck can be a need; lessons in everything would be a want', 'Lessons are always a want, because school is free', 'More lessons are always a need'] },
  { em: 'heart', t: 'A present for the party you are going to', a: 'both',
    why: ['Bringing something can matter; how much you spend is the want', 'Presents are always needs at parties', 'It is a want because the party is fun'] },
  { em: 'rice', t: 'Rice — the dearest brand on the shelf', a: 'both',
    why: ['You need rice; the dearest brand is the want', 'The dearest brand is always the healthiest', 'Rice is a want when it costs more'] },
  { em: 'bus', t: 'A taxi to school, when the bus has already gone', a: 'both',
    why: ['Getting to school is the need; a taxi is the dear way to do it', 'Taxis are always a want, whatever happens', 'It is a need because taxis are faster'] },
];
export function needsDeck(seed, level = 'standard') {
  const k = knobs(level).nw, r = rng(seedOf(seed, 'nw', level));
  const both = shuffle(NEEDS.filter((x) => x.a === 'both'), r).slice(0, k.both);
  let plain = shuffle(NEEDS.filter((x) => x.a !== 'both'), r).slice(0, k.n - k.both);
  /* both sides always appear, so neither button is a safe default */
  for (const side of ['need', 'want']) if (!plain.some((x) => x.a === side)) plain[0] = NEEDS.find((x) => x.a === side && !plain.includes(x));
  return shuffle(both.concat(plain), r).map((x) => {
    if (x.a !== 'both') return Object.assign({}, x);
    const chips = shuffle(x.why.slice(0, k.chips), r);
    return Object.assign({}, x, { chips, reason: chips.indexOf(x.why[0]) });
  });
}
/* the answer to one card: a side, and for "both" the reason chip */
export function nwRight(card, side, chip) {
  if (card.a !== 'both') return side === card.a;
  return side === 'both' && chip === card.reason;
}

/* ══ 2 · SCAM SPOTTER ═════════════════════════════════════════════════════
   A story is a coherent message family; its parts are swapped per play. A trap is a hook,
   a secret (asked to keep one, or to hand one over) and often a hurry; a real message has
   news, details and calm timing. Roles of the phrases: from · hook/news · detail · secret ·
   hurry · time · close. The TELLS are the secret and the hurry. */
export const SS_CHANNELS = {
  text: { name: 'Text message', icon: 'phone' },
  email: { name: 'Email', icon: 'envelope' },
  chat: { name: 'Game chat', icon: 'dice' },
};
const TRAPS = [
  { id: 'bank', ch: ['text', 'email'], from: { text: 'Bizzbank Security:', email: 'Dear customer,' },
    hook: [{ k: 'fright', t: 'We noticed a strange login on your account.' }, { k: 'reward', t: 'A refund of 40 coins is waiting for you.' }],
    secret: [{ t: 'Reply with your PIN to keep it safe.', note: 'No real bank ever asks for your PIN.' },
      { t: 'Log in with your password on this page.', note: 'A page asking for your password from a message is a page collecting passwords.' }],
    detail: ['This is the official security team.', 'It only takes a minute.'] },
  { id: 'parcel', ch: ['text', 'email'], from: { text: 'Bizzington Parcels:', email: 'Hello from Bizzington Parcels,' },
    hook: [{ k: 'fright', t: 'Your parcel could not be delivered.' }, { k: 'fright', t: 'A parcel for you is stuck at our depot.' }],
    secret: [{ t: 'Pay the small redelivery fee at this link.', note: 'A tiny fee is the hook: it is not about the fee, it is about your card details.' },
      { t: 'Type your card number on this page to book a new day.', note: 'A card number typed into a stranger\'s page is how the money goes.' }],
    detail: ['We tried to deliver it this morning.', 'Your parcel number is 4471.'] },
  { id: 'prize', ch: ['text', 'email', 'chat'], from: { text: 'The Prize Desk:', email: 'Dear lucky winner,', chat: '[PrizeDesk]:' },
    hook: [{ k: 'reward', t: 'You are today\'s selected winner.' }, { k: 'reward', t: 'You have won a 500-coin voucher.' }],
    secret: [{ t: 'Send your card number so we can pay you.', note: 'A prize you never entered, that needs your card to arrive: there is no prize.' },
      { t: 'Keep this between us, so nobody else claims it.', note: 'A real prize has nothing to hide. The secrecy is the tell.' }],
    detail: ['Your name came out of the hat.', 'Thousands entered and you were picked.'] },
  { id: 'newnum', ch: ['text'], from: { text: 'Hey, it\'s me, new number!' },
    hook: [{ k: 'fright', t: 'I lost my phone and I am stuck in town.' }, { k: 'fright', t: 'My bag was stolen with my purse in it.' }],
    secret: [{ t: 'Can you send me 200 coins? Don\'t tell Mum.', note: 'A new number, money, and "don\'t tell". The secrecy is the tell.' },
      { t: 'Send me the code that just came to your phone.', note: 'That code is the key to an account. It is never for anyone else, whoever they say they are.' }],
    detail: ['This is my number for now.', 'My old phone is gone.'] },
  { id: 'gems', ch: ['chat'], from: { chat: '[GemGiveaway]:' },
    hook: [{ k: 'reward', t: 'Free gems for the first fifty players.' }, { k: 'reward', t: 'A free gem generator is open now.' }],
    secret: [{ t: 'Just log in with your username and password here.', note: 'There is no generator. There is a page collecting passwords.' },
      { t: 'Send me your password and I will add them for you.', note: 'Nobody needs your password to give you something. The password is the prize they want.' }],
    detail: ['Loads of players have got theirs.', 'It works on every server.'] },
  { id: 'mod', ch: ['chat'], from: { chat: '[Official_Mod]:' },
    hook: [{ k: 'fright', t: 'Your account has been reported and will be banned.' }, { k: 'fright', t: 'Someone is trying to steal your account.' }],
    secret: [{ t: 'Send me the code that was just texted to you to stop it.', note: 'A real moderator never needs your code. The code is your account\'s key.' },
      { t: 'Tell me your password so I can check it.', note: 'Nobody who really works on the game asks for your password.' }],
    detail: ['I am from the game\'s safety team.', 'This happens to lots of players.'] },
  { id: 'invest', ch: ['email', 'chat'], from: { email: 'Hello friend,', chat: '[RichQuick]:' },
    hook: [{ k: 'reward', t: 'Put in 100 coins and get 1,000 back, guaranteed.' }, { k: 'reward', t: 'Your money doubles in thirty days.' }],
    secret: [{ t: 'Tell no one, it is only for a few people.', note: 'Guaranteed and doubling do not belong in one sentence, and a real chance does not need to be a secret.' },
      { t: 'Send the coins to my account and keep it quiet.', note: 'Money to a stranger, kept quiet. The secrecy is the tell.' }],
    detail: ['I did it last month myself.', 'It is a very special chance.'] },
  { id: 'club', ch: ['email'], from: { email: 'Dear member,' },
    hook: [{ k: 'fright', t: 'Your club membership has run out.' }, { k: 'fright', t: 'There is a problem with your last payment.' }],
    secret: [{ t: 'Reply with your card number to keep your place.', note: 'Nobody real asks for a card number by reply. The club you know has its own way to pay.' },
      { t: 'Log in on this new page with your password.', note: 'A new page asking for your password is how passwords get stolen.' }],
    detail: ['We are sorry for the trouble.', 'Your member number is 2209.'] },
];
const HURRY = {
  pushy: ['Only 2 hours left!', 'Do it in the next ten minutes!', 'Today only, or it is gone!', 'Hurry, before midnight!'],
  polite: ['Kindly reply within the hour.', 'Please do this before this evening.', 'A reply in the next hour would be very kind.', 'Please be quick, it is urgent.'],
};
const TRAP_CLOSE = ['Thank you.', 'Kind regards, the Support Team.', 'Thanks so much.', 'Best wishes.'];
const REALS = [
  { id: 'nani', ch: ['text'], from: { text: 'Hi, it\'s Nani.' }, news: ['Are you free on Sunday for lunch?', 'Happy birthday, my darling!'],
    detail: ['Ask your mother and let me know.', 'I will make the dal you like.', 'Bring your cousin if she is free.'], close: 'Love, Nani.',
    note: 'No money, no hurry, no secret. Just Sunday.' },
  { id: 'library', ch: ['text', 'email'], from: { text: 'Bizzington Library:', email: 'Hello from the Town Library,' }, news: ['Your book is due back on Friday.', 'The book you asked for has come in.'],
    detail: ['No action needed if you have already returned it.', 'You can renew it at the desk.', 'It is on the shelf by the door.'],
    note: '"No action needed" is almost never how a scam opens.' },
  { id: 'school', ch: ['email'], from: { email: 'Dear parents and pupils,' }, news: ['The school trip form is due on Monday.', 'Sports day is next Wednesday.'],
    detail: ['Paper copies are at the office.', 'Bring a water bottle and a hat.', 'Ask your teacher if you have any questions.'],
    note: 'Boring, specific, and it asks for nothing but a form.' },
  { id: 'order', ch: ['text', 'email'], from: { text: 'Mags\' General Store:', email: 'Hello from Mags\' General Store,' }, news: ['Your pencil case has been sent.', 'Your order is ready to collect.'],
    detail: ['Track it in the app you ordered from.', 'Your order number is on your receipt.', 'The shop is open until six.'],
    note: 'It points you back to the shop and the app you already use, never to a new link.' },
  { id: 'team', ch: ['chat'], from: { chat: '[Kiran, your teammate]:' }, news: ['We won the match 3–1!', 'Great game today!'],
    detail: ['See you at practice on Thursday.', 'Your pass in the second half was brilliant.', 'Coach says well done.'],
    note: 'Good news from someone you know, asking for nothing at all.' },
  { id: 'raffle', ch: ['text', 'email'], from: { text: 'School fair team:', email: 'Hello from the school fair team,' }, news: ['You won the raffle: a box of crayons.', 'Your raffle ticket won a prize.'],
    detail: ['Collect it from the school office any day next week.', 'Thank you for coming to the fair.', 'Your ticket number was 52.'],
    note: 'A prize you did enter, collected in person, with nothing asked of you. Good news is not the tell; the shape is.' },
  { id: 'swim', ch: ['text'], from: { text: 'Swimming club:' }, news: ['No swimming this week, the pool is being cleaned.', 'No lesson on Thursday, the pool is being cleaned.'],
    detail: ['Lessons start again next Tuesday.', 'Your coach will see you then.', 'There is nothing you need to do.'],
    note: 'Bad news can be ordinary too. Nothing to hand over, no clock, no secret.' },
  { id: 'server', ch: ['chat'], from: { chat: '[Server]:' }, news: ['The game is down for repairs tonight.', 'A new map opens this weekend.'],
    detail: ['Your progress is saved.', 'Read more on the game\'s own news page.', 'Thank you for playing.'],
    note: 'It tells you something and asks for nothing.' },
  { id: 'realbank', ch: ['email'], from: { email: 'From Bizzbank,' }, news: ['Your new statement is ready.', 'Your savings earned interest this month.'],
    detail: ['Read it in the Bizzbank app you already use.', 'We will never ask for your PIN or password.', 'Nothing needs doing.'],
    note: 'A real bank sends you back to its own app, and says it will never ask for your PIN.' },
];
const CALM = ['No rush.', 'Any day this week is fine.', 'Whenever suits you.'];
const REAL_CLOSE = ['Thanks!', 'See you soon.', 'Best wishes.'];
/* what a phrase looks like shouted: capitals and an exclamation, nothing else changed */
export const shout = (t) => t.toUpperCase().replace(/[.!?]*$/, '!');

function trapMsg(r, hurryP, loud) {
  const s = pick(TRAPS, r), ch = pick(s.ch, r);
  const hook = pick(s.hook, r), secret = pick(s.secret, r), hasHurry = r() < hurryP;
  const len = 5 + (r() < 0.5 ? 1 : 0);
  const ph = [{ t: s.from[ch], role: 'from' }, { t: loud ? shout(hook.t) : hook.t, role: 'hook' }];
  const details = shuffle(s.detail.slice(), r);
  const mid = [{ t: secret.t, role: 'secret' }];
  if (hasHurry) mid.push({ t: pick(HURRY[loud ? 'pushy' : 'polite'], r), role: 'hurry' });
  while (ph.length + mid.length + 1 < len && details.length) mid.unshift({ t: details.shift(), role: 'detail' });
  ph.push(...mid, { t: pick(TRAP_CLOSE, r), role: 'close' });
  const what = hook.k === 'reward' ? 'A reward' : 'A fright';
  return { a: 'scam', story: s.id, ch, loud, ph, hook: hook.k,
    note: `${what}${hasHurry ? ', a hurry' : ''} and a secret. ${secret.note}` };
}
function realMsg(r, loud) {
  const s = pick(REALS, r), ch = pick(s.ch, r);
  const len = 5 + (r() < 0.5 ? 1 : 0);
  const news = pick(s.news, r);
  const ph = [{ t: s.from[ch], role: 'from' }, { t: loud ? shout(news) : news, role: 'news' }];
  const extra = shuffle(s.detail.map((t) => ({ t, role: 'detail' })).concat([{ t: pick(CALM, r), role: 'time' }]), r);
  while (ph.length + 1 < len && extra.length) ph.push(extra.shift());
  ph.push({ t: s.close || pick(REAL_CLOSE, r), role: 'close' });
  return { a: 'safe', story: s.id, ch, loud, ph, note: s.note };
}
/* a round: half traps, half real, and exactly as many of each shouting — so capitals carry
   no information at all and a "capitals mean scam" player scores chance, every round */
export function scamDeck(seed, level = 'standard') {
  const k = knobs(level).ss, r = rng(seedOf(seed, 'ss', level));
  const half = k.n / 2, loudN = Math.max(1, Math.round(half * 0.4));
  const loudT = new Set(shuffle([...Array(half).keys()], r).slice(0, loudN));
  const loudR = new Set(shuffle([...Array(half).keys()], r).slice(0, loudN));
  const out = [], used = new Set();
  const fresh = (make) => { for (let g = 0; g < 30; g++) { const m = make(); const key = m.story + m.ph[1].t.toLowerCase(); if (!used.has(key)) { used.add(key); return m; } } return make(); };
  for (let i = 0; i < half; i++) out.push(fresh(() => trapMsg(r, k.hurry, loudT.has(i))));
  for (let i = 0; i < half; i++) out.push(fresh(() => realMsg(r, loudR.has(i))));
  return shuffle(out, r).map((m) => Object.assign(m, { t: m.ph.map((p) => p.t).join(' '), tells: m.ph.map((p, i) => (p.role === 'secret' || p.role === 'hurry' ? i : -1)).filter((i) => i >= 0) }));
}
/* does a message shout? (what a "capitals mean scam" player looks at) */
export const shouts = (m) => m.ph.some((p) => /[A-Z]{3,}(?:\s+[A-Z0-9,'’–-]{2,}){1,}/.test(p.t));
/* ten written examples for My Feed, drawn from the same generator */
export const SS_EXAMPLES = scamDeck(3391, 'standard').map((m) => ({ t: m.t, a: m.a, note: m.note }));

/* ══ 3 · BETTER BUY ═══════════════════════════════════════════════════════ */
/* Smart Choices' Better Buy (docs/12 §2.2) — Mags' shelves. What a good is called, the packs
   it comes in, the town's price of ONE in units (a range: the seed picks within it) and, for a
   thing that goes off, how fast. `step` is the coin a shelf's prices move in, per currency:
   round numbers on Easy, everyday ones above, so the price of one is always whole coins.
   Bizzington's own prices, registered in sources.js ('shelf'). */
export const SHELF = {
  goods: [
    { id: 'pencil', one: 'pencil', many: 'pencils', icon: 'crayon', u: [1, 2], packs: [2, 3, 4, 5, 6, 8, 10, 12] },
    { id: 'book', one: 'exercise book', many: 'exercise books', icon: 'page', u: [3, 5], packs: [2, 3, 4, 5, 6] },
    { id: 'roti', one: 'roti', many: 'rotis', icon: 'roti', u: [1, 1.5], packs: [2, 4, 5, 6, 8, 10, 12], fresh: 'they go stale in two days' },
    { id: 'gola', one: 'ice gola', many: 'ice golas', icon: 'gola', u: [1, 2], packs: [2, 3, 4, 6, 8], fresh: 'they melt before teatime' },
    { id: 'juice', one: 'litre', many: 'litres', of: 'juice', icon: 'drop', u: [3, 5], packs: [1, 2, 3], vol: true, fresh: 'it goes off two days after it is opened' },
    { id: 'rice', one: 'kilo', many: 'kilos', of: 'rice', icon: 'rice', u: [4, 6], packs: [1, 2, 5], vol: true },
    { id: 'sticker', one: 'sticker sheet', many: 'sticker sheets', icon: 'star', u: [1, 2], packs: [2, 3, 4, 5, 10] },
    { id: 'thread', one: 'spool of thread', many: 'spools of thread', icon: 'spool', u: [2, 3], packs: [2, 3, 4, 6] },
    { id: 'chai', one: 'cup of chai', many: 'cups of chai', icon: 'teapot', u: [1, 2], packs: [2, 4, 6, 8], fresh: 'it goes cold in minutes' },
  ],
  step: { INR: [5, 1], USD: [25, 5], GBP: [10, 5], EUR: [10, 5], AED: [25, 25] },
};
export const GOODS = SHELF.goods;
const STEP = SHELF.step;
export function shelfStep(level) { const s = STEP[currency()] || [5, 1]; return knobs(level).bb.round ? s[0] : s[1]; }
/* the price of one, in the smallest coin, as a whole number of steps (never zero) */
const eachOf = (units, step) => Math.max(1, Math.round(minorPrice(units) / step)) * step;
const PAIRS_DIV = [[2, 4], [2, 6], [3, 6], [2, 8], [4, 8], [5, 10], [2, 10], [3, 12], [4, 12], [6, 12]];

/* a whole shelf, from its kind; `div` false: a child who has not met division compares the
   same amount (the big pack against enough small packs to match it) */
function makeShelf(r, kind, level, div) {
  const step = shelfStep(level);
  for (let guard = 0; guard < 400; guard++) {
    const g = pick(kind === 'waste' ? GOODS.filter((x) => x.fresh) : kind === 'bogof' ? GOODS.filter((x) => !x.vol) : GOODS, r);
    const base = eachOf(g.u[0] + r() * (g.u[1] - g.u[0]), step);
    const gap = step * (1 + Math.floor(r() * (knobs(level).bb.round ? 2 : 3)));
    if (kind === 'bogof') {
      /* A: one at p, the second at half — so two cost 3p/2 and one is 3p/4; p a multiple of four steps */
      const p = Math.max(4, Math.round(base / step / 4) * 4 || 4) * step * 1;
      const eachA = (3 * p) / 4, k = pick([3, 4, 5, 6], r);
      const better = r() < 0.5 ? 0 : 1;
      const eachB = better === 0 ? eachA + step : eachA - step;
      if (eachB <= 0 || !Number.isInteger(eachA)) continue;
      const tags = [{ kind: 'bogof', count: 2, price: p + p / 2, single: p, half: p / 2 }, { kind: 'pack', count: k, price: k * eachB }];
      return finishShelf({ kind, good: g, tags, step }, r);
    }
    if (kind === 'waste') {
      /* you need N; a small pack that divides N, a big pack cheaper each. Whole packs only. */
      const small = pick(g.packs.filter((c) => c >= 2 && c <= 4), r), big = pick(g.packs.filter((c) => c >= 6), r);
      if (!small || !big || big <= small * 1.5) continue;
      const eachS = base + gap, eachB = base;
      const need = small * (1 + Math.floor(r() * Math.max(1, Math.floor(big / small) - 0) ));
      if (need > big) continue;
      const tags = [{ kind: 'pack', count: small, price: small * eachS }, { kind: 'pack', count: big, price: big * eachB }];
      const sh = finishShelf({ kind, good: g, tags, step, need }, r);
      /* half the time the big pack is still the better buy for you: judgement, not a rule */
      if (sh.costs[0] === sh.costs[1]) continue;
      return sh;
    }
    let a, b;
    if (div) { const ps = g.packs.filter((c) => c >= 1); a = pick(ps, r); b = pick(ps.filter((c) => c !== a), r); if (b == null) continue; if (a > b) [a, b] = [b, a]; }
    else { const ok = PAIRS_DIV.filter(([x, y]) => g.packs.includes(x) && g.packs.includes(y)); if (!ok.length) continue; [a, b] = pick(ok, r); }
    /* 'unit': the bigger pack is cheaper each; 'bigdear': the bigger pack costs MORE each */
    const eachSmall = kind === 'unit' ? base + gap : base, eachBig = kind === 'unit' ? base : base + gap;
    const tags = [{ kind: 'pack', count: a, price: a * eachSmall }, { kind: 'pack', count: b, price: b * eachBig }];
    return finishShelf({ kind, good: g, tags, step, div }, r);
  }
  throw new Error('smartsim: no shelf for ' + kind);
}
/* the tags in a drawn order, and every number the screen will say — computed here, once */
function finishShelf(sh, r) {
  if (r() < 0.5) sh.tags.reverse();
  const T = sh.tags;
  sh.each = T.map((t) => t.price / t.count);
  sh.by = Math.abs(sh.each[0] - sh.each[1]);     /* how much cheaper one is, said on the working */
  if (sh.kind === 'waste') {
    sh.packsFor = T.map((t) => Math.ceil(sh.need / t.count));
    sh.costs = T.map((t, i) => sh.packsFor[i] * t.price);
    sh.spare = T.map((t, i) => sh.packsFor[i] * t.count - sh.need);
    sh.answer = sh.costs[0] < sh.costs[1] ? 0 : 1;
    sh.cheaperEach = sh.each[0] < sh.each[1] ? 0 : 1;
    sh.asks = sh.costs;                       /* typed: what the pack you picked costs you, for what you need */
  } else if (sh.div === false) {
    /* the same amount: the big count bought in small packs */
    const s = T[0].count < T[1].count ? 0 : 1, big = 1 - s, times = T[big].count / T[s].count;
    sh.small = s; sh.times = times; sh.sameCost = times * T[s].price;
    sh.answer = sh.sameCost < T[big].price ? s : big;
    sh.asks = [sh.sameCost, sh.sameCost];     /* typed: what the big pack's amount costs in small packs */
  } else {
    sh.answer = sh.each[0] < sh.each[1] ? 0 : 1;
    sh.asks = sh.each;                        /* typed: the price of one in the pack you picked */
  }
  return sh;
}
/* prove a shelf from its own tags: whole prices of one, different, the answer the cheaper */
export function shelfProof(sh) {
  const T = sh.tags, e = T.map((t) => t.price / t.count);
  const whole = e.every((x) => Number.isInteger(x) && x > 0) && T.every((t) => Number.isInteger(t.price) && t.price > 0);
  if (!whole || e[0] === e[1]) return { ok: false, why: 'prices of one not whole and different' };
  if (sh.kind === 'waste') {
    const c = T.map((t) => Math.ceil(sh.need / t.count) * t.price);
    return { ok: c[0] !== c[1] && sh.answer === (c[0] < c[1] ? 0 : 1) && sh.asks[0] === c[0] && sh.asks[1] === c[1], why: 'waste costs' };
  }
  if (sh.div === false) {
    const s = T[0].count < T[1].count ? 0 : 1, big = 1 - s;
    if (T[big].count % T[s].count) return { ok: false, why: 'not the same amount' };
    const same = (T[big].count / T[s].count) * T[s].price;
    return { ok: same !== T[big].price && sh.answer === (same < T[big].price ? s : big) && sh.asks[0] === same, why: 'same amount' };
  }
  if (sh.kind === 'bogof') {
    const b = T.findIndex((t) => t.kind === 'bogof');
    if (T[b].price !== T[b].single + T[b].half || T[b].half * 2 !== T[b].single || T[b].count !== 2) return { ok: false, why: 'bogof tag' };
  }
  return { ok: sh.answer === (e[0] < e[1] ? 0 : 1) && sh.asks[0] === e[0] && sh.asks[1] === e[1], why: 'unit' };
}
export function buyDeck(seed, level = 'standard', opts = {}) {
  const div = opts.div !== false, k = knobs(level).bb, r = rng(seedOf(seed, 'bb', level));
  let kinds = [];
  Object.entries(k.mix).forEach(([kind, n]) => { for (let i = 0; i < n; i++) kinds.push(kind); });
  /* without division there is no judgement layer yet: every shelf is the same-amount compare */
  if (!div) kinds = kinds.map((x, i) => (i % 2 ? 'bigdear' : 'unit'));
  return shuffle(kinds, r).map((kind) => makeShelf(r, kind, level, div));
}
/* a typed amount, read as coins: "1.25" or "125"→ in the main unit; a whole number under one
   main unit's worth may also be typed as the small coins it is ("35" for 35¢) */
export function readTyped(str, want) {
  const s = String(str == null ? '' : str).trim(), m = (CURRENCIES[currency()] || {}).minor || 1;
  if (!/^\d*(\.\d{0,2})?$/.test(s) || !/\d/.test(s)) return null;
  const v = Math.round(parseFloat(s) * m);
  if (m > 1 && !s.includes('.') && want != null && want < m && +s === want) return want;
  return v;
}
export function checkTyped(str, want) { const v = readTyped(str, want); return { ok: v === want, typed: v, want }; }

/* Better Buy's words — every sentence the shelf says on screen, made here from the shelf's own
   numbers, so the view only places them and My Feed can cut a proven shelf (shelfCard) in the
   very words the game uses. Money through minorMoney: the price of one, to the coin. */
export const shelfLabel = (g, t) => (t.kind === 'bogof' ? `${g.many}: ${minorMoney(t.single)} each, buy one, get one half price`
  : g.vol ? `${t.count} ${t.count === 1 ? g.one : g.many} of ${g.of}` : `${t.count} ${t.count === 1 ? g.one : g.many}`);
export const shelfShort = (g, t) => (t.kind === 'bogof' ? 'half-price offer' : g.vol ? `${t.count}-${g.one} pack` : `pack of ${t.count}`);
export const shelfPrice = (t) => (t.kind === 'bogof' ? `${minorMoney(t.price)} for 2` : minorMoney(t.price));
export function shelfQuestion(sh) {
  const g = sh.good;
  if (sh.kind === 'waste') return `You need ${sh.need} ${sh.need === 1 ? g.one : g.many} — and ${g.fresh}. Which costs you less for what you need?`;
  if (sh.div === false) return `Which is the better buy for the same amount of ${g.of || g.many}?`;
  return `Which is cheaper per ${g.one}?`;
}
export function shelfTypeQ(sh, choice) {
  const g = sh.good, t = sh.tags[choice];
  if (sh.kind === 'waste') return `What do you pay for ${sh.need} with the ${shelfShort(g, t)}?`;
  if (sh.div === false) { const s = sh.tags[sh.small], b = sh.tags[1 - sh.small]; return `What would ${b.count} ${g.vol ? g.many + ' of ' + g.of : g.many} cost, bought in ${shelfShort(g, s)}s?`; }
  return `How much is one ${g.one} in the ${shelfShort(g, t)}?`;
}
export function shelfWorking(sh) {
  const g = sh.good, T = sh.tags, M = minorMoney, short = shelfShort;
  if (sh.kind === 'waste') {
    const lines = T.map((t, i) => `${short(g, t)}: ${sh.packsFor[i]} × ${M(t.price)} = <b>${M(sh.costs[i])}</b> for ${sh.need}${sh.spare[i] ? `, and ${sh.spare[i]} ${sh.spare[i] === 1 ? g.one : g.many} left over to waste` : ''}`);
    const c = sh.cheaperEach, a = sh.answer;
    return { lines, end: c === a ? `The ${short(g, T[a])} is cheaper each <b>and</b> cheaper for what you need.` : `The ${short(g, T[c])} is cheaper each — but for what you need, the ${short(g, T[a])} costs less. Cheaper each is not always cheaper for you.` };
  }
  if (sh.div === false) {
    const s = T[sh.small], b = T[1 - sh.small];
    return { lines: [`${sh.times} × ${short(g, s)} = ${b.count}: ${sh.times} × ${M(s.price)} = <b>${M(sh.sameCost)}</b>`, `The ${short(g, b)}: <b>${M(b.price)}</b>`],
      end: `For the same ${b.count}, the ${short(g, T[sh.answer])} costs less.` };
  }
  const lines = T.map((t, i) => (t.kind === 'bogof'
    ? `Half-price offer: ${M(t.single)} + ${M(t.half)} = ${M(t.price)} for 2, so <b>${M(sh.each[i])}</b> each`
    : `${M(t.price)} ÷ ${t.count} = <b>${M(sh.each[i])}</b> each`));
  const a = sh.answer, big = T[0].count > T[1].count ? 0 : 1, by = sh.by;
  let end = `The ${short(g, T[a])} is cheaper per ${g.one}, by ${M(by)}.`;
  if (sh.kind === 'bogof') end += T[a].kind === 'bogof' ? ' This time the offer really is the better price.' : ' The offer sounds bigger than it is.';
  else if (big !== a) end += ' Bigger is not always cheaper.';
  return { lines, end };
}
/* a whole shelf, said: the question, both tags, and the working the game shows after a pick */
export function shelfCard(sh) {
  const w = shelfWorking(sh), g = sh.good;
  return [shelfQuestion(sh), ...sh.tags.map((t) => `${shelfLabel(g, t)}: ${shelfPrice(t)}.`), ...w.lines.map((l) => l + '.'), w.end];
}

/* ══ a round, and its score ══════════════════════════════════════════════ */
export function scDeck(mode, seed, level = 'standard', opts = {}) {
  if (mode === 'nw') return needsDeck(seed, level);
  if (mode === 'ss') return scamDeck(seed, level);
  return buyDeck(seed, level, opts);
}
export function scMax(mode, deck) {
  if (mode === 'nw') return deck.length;
  if (mode === 'ss') return deck.length * SS_POINTS.call + deck.filter((m) => m.a === 'scam').length * SS_POINTS.tell;
  return deck.length * (BB_POINTS.pick + BB_POINTS.typed);
}
