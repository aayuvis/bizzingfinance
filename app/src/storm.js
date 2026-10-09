/* storm.js — Market Storm's rules, with no screen in them (docs/12 §2.5).

   The plan is the game. Before the storm the child writes one: WHEN they would sell
   (three honest rules) and WHY they bought (read off the company's card). During it the
   price falls, the cast shouts and headlines arrive; nothing ever sells by itself. What is
   scored is keeping to your own plan and reading the news — the money is shown and never
   scored (CONCEPT §6.3).

   Everything here is a pure function of the play's seed and what the child did, so the
   arcade's screen, the headless bots in test/_bots.mjs and the tests share one truth.
   The dials are the town's own (world.js STORM, registered in sources.js 'storm'). */
import { rng } from './ui.js';
import { STORM } from './world.js';

export const START = 1000, HALF = START / 2;

/* the three honest rules; `never` is said with its reason, because it is only honest for
   money you will not need */
export const RULES = [
  { id: 'stops', t: 'Only if the company stops making money', short: 'only if the company stops making money' },
  { id: 'half', t: 'If its price falls by half', short: 'if its price falls by half' },
  { id: 'never', t: 'Never: this is money I will not need for years', short: 'never: this is money I will not need for years' },
];

/* Five of Bizzington's own companies, none of them real. `card` is what the child reads;
   `why` is the reason to own it that the card supports; `fine` are headlines about the
   business doing its ordinary work; `stop` is the one that says it has stopped making money. */
export const STORM_COS = [
  { id: 'bakery', name: 'Harbour Bakery', icon: 'roti',
    card: ['Bakes bread and buns on the Old Harbour, every morning.', 'People buy bread in good weeks and bad ones.', 'It has made money every year since it opened.'],
    why: 'People buy bread every morning, whatever the market is doing.',
    fine: ['Harbour Bakery sold as much bread this month as last month.', 'The queue at Harbour Bakery is out of the door again. Its ovens are as busy as ever.'],
    stop: 'Harbour Bakery has stopped making money: its flour now costs more than it can charge for bread, and it lost money three months running.',
    after: 'Harbour Bakery has closed two of its three shops.' },
  { id: 'bikes', name: 'Clocktower Bikes', icon: 'bicycle',
    card: ['Mends and rents bicycles by the Clocktower.', 'Half the town rides to work, and every bike needs fixing sometimes.', 'It owns its workshop, so it pays no rent.'],
    why: 'Half the town rides, and every bike needs mending sooner or later.',
    fine: ['Clocktower Bikes mended more bikes this month than ever.', 'Clocktower Bikes says its workshop is fully booked until the festival.'],
    stop: 'Clocktower Bikes has stopped making money: the town opened free bike repair stands, and its workshop has had no customers for weeks.',
    after: 'Clocktower Bikes is selling its tools.' },
  { id: 'lamps', name: 'Lantern Lane Lamps', icon: 'lantern',
    card: ['Lights the pier and the streets of the Old Harbour.', 'The council pays it every month to keep the lamps lit.', 'Its contract runs for six more years.'],
    why: 'The council pays it every month, and the contract runs for years.',
    fine: ['The council says Lantern Lane Lamps will keep the pier lit, as agreed.', 'Lantern Lane Lamps was paid by the council this month, as it is every month.'],
    stop: 'Lantern Lane Lamps has stopped making money: the council ended its contract, and nobody else pays it to light anything.',
    after: 'Lantern Lane Lamps has handed its ladders back.' },
  { id: 'tea', name: 'Market Row Tea', icon: 'teapot',
    card: ['Runs three chai stalls on Market Row.', 'Most of its customers come back every single day.', 'It owes nobody any money.'],
    why: 'Its customers come back every day, and it owes nobody anything.',
    fine: ['Market Row Tea served as many cups this week as any week this year.', 'Market Row Tea opened its stalls on time, every day, all month.'],
    stop: 'Market Row Tea has stopped making money: a new rule closed street stalls on Market Row, and its stalls cannot open.',
    after: 'Market Row Tea has sold its carts.' },
  { id: 'foundry', name: 'The Works Foundry', icon: 'factory',
    card: ['Casts pots, pans and railings at the Works.', 'Its orders are booked a whole year ahead.', 'It has more money in the bank than it owes.'],
    why: 'Its orders are booked a year ahead, and it has more money than it owes.',
    fine: ['The Works Foundry delivered every order it promised this month.', 'The Works Foundry has another year of orders booked.'],
    stop: 'The Works Foundry has stopped making money: its biggest customer cancelled every order, and it sold nothing this month.',
    after: 'The Works Foundry has let half its workers go.' },
];
/* two reasons to buy that are not on any card: the price, and the crowd */
export const WRONG_WHY = [
  { id: 'price', t: 'Its price had gone up three weeks running.' },
  { id: 'crowd', t: 'Everyone at school was buying it.' },
];
/* headlines that are only about the price or the mood — the noise a plan is for */
export const NOISE = [
  (co) => `${co.name}'s price is down a third since spring. "Is this the end?" asks the Gazette.`,
  () => 'Every company on the Exchange fell again this week. Nobody can say why.',
  (co) => `A man on the radio says ${co.name} is "finished". He said that last year too.`,
  () => 'Red again! The whole Exchange has fallen every day this week.',
  (co) => `"Sell ${co.name} now, before it is too late," says a poster on the pier.`,
  () => 'Prices fell across the whole market today. Bea says she saw it coming.',
];

const span = (r, [a, b]) => a + r() * (b - a);

/* the storm a play draws: which company, whether it stops, its fall and its headlines.
   One storm in five stops (STORM.stops) — drawn from the seed, never from the child. */
export function stormFor(seed) {
  const r = rng((seed >>> 0) ^ 0x5a17);
  const stops = r() < STORM.stops;
  const co = STORM_COS[Math.floor(r() * STORM_COS.length)];
  const depth = span(r, STORM.fall);
  const factP = stops ? span(r, STORM.factAt) : null;
  const def = {
    seed, stops, co, depth, factP,
    factMs: stops ? Math.round(factP * STORM.len) : null,
    endV: stops ? span(r, STORM.stopEnd) * START : null,
    after: Math.round((stops ? span(r, STORM.stopAfter) : span(r, STORM.back)) * START),
    len: STORM.len,
  };
  /* the reasons on offer, in this play's order */
  const whys = [{ id: 'card', t: co.why }, ...WRONG_WHY];
  for (let i = whys.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [whys[i], whys[j]] = [whys[j], whys[i]]; }
  def.whys = whys;
  /* the headlines, on a timetable: the noise in a shuffled order, the company's own
     ordinary news among it, and — in a storm that stops — the fact, then what followed */
  const noise = NOISE.map((f) => f(co));
  for (let i = noise.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [noise[i], noise[j]] = [noise[j], noise[i]]; }
  const news = [];
  let fine = 0, n = 0, followed = false;
  if (stops) news.push({ at: def.factMs, kind: 'fact', text: co.stop });
  for (let at = 3000; at < STORM.len - 2000; at += STORM.newsEvery) {
    /* no headline crowds the fact: a slot within two seconds of it is left empty */
    if (stops && Math.abs(at - def.factMs) < 2000) continue;
    if (stops && at > def.factMs && !followed) { news.push({ at, kind: 'after', text: co.after }); followed = true; continue; }
    if (!stops && n % 2 === 1 && fine < co.fine.length) news.push({ at, kind: 'fine', text: co.fine[fine++] });
    else news.push({ at, kind: 'noise', text: noise[n % noise.length] });
    n++;
  }
  news.sort((a, b) => a.at - b.at);
  def.news = news;
  return def;
}

/* the price at a point `p` (0…1) of the storm, before the wobble the screen adds. A fine
   company dips and starts back, never as far as half; one that stops falls on after the fact */
export function stormValue(def, p) {
  const q = Math.max(0, Math.min(1, p));
  const dip = (x) => START * (1 - def.depth * Math.sin(x * Math.PI * 0.92));
  if (!def.stops || q <= def.factP) return dip(q);
  const from = dip(def.factP), k = (q - def.factP) / (1 - def.factP);
  return from + (def.endV - from) * (1 - Math.pow(1 - k, 1.6));
}
/* the wobble on top is ±11, so the floor a fine storm can show is the deepest fall less that */
export const WOBBLE = 22;

/* when the plan's own rule says sell, in ms (null: it never does in this storm). `halfAt` is
   when the price first stood at half or below, measured by the game as it played. */
export function sellDue(def, rule, halfAt) {
  if (rule === 'stops') return def.stops ? def.factMs : null;
  if (rule === 'half') return halfAt != null ? halfAt : null;
  return null;
}

/* The decision score, out of ten, and nothing in it is money:
   · 2 — why you bought is the reason the card gives (not the price, not the crowd);
   · 5 — you kept to your plan: sold after its rule said sell, or held when it never did;
   · 3 — you read the news: held through noise about a company that was fine, or sold once
         the headline said it had stopped making money.
   `d`: { rule, why, sold, soldT, halfAt } */
export const STORM_PAR = 10;
export function stormScore(def, d) {
  const due = sellDue(def, d.rule, d.halfAt);
  const kept = due == null ? !d.sold : !!d.sold && d.soldT >= due;
  const read = def.stops ? !!d.sold && d.soldT >= def.factMs : !d.sold;
  const whyOk = d.why === 'card';
  const points = (whyOk ? 2 : 0) + (kept ? 5 : 0) + (read ? 3 : 0);
  return { points, kept, read, whyOk, due, early: !!d.sold && (due == null || d.soldT < due) };
}

/* the plan in the child's own words, as Space re-reads it */
export function planWords(def, rule, why) {
  const w = def.whys.find((x) => x.id === why), ru = RULES.find((x) => x.id === rule);
  return `I bought ${def.co.name} because ${w ? w.t.charAt(0).toLowerCase() + w.t.slice(1).replace(/\.$/, '') : '…'}. I will sell ${ru ? ru.short : '…'}.`;
}
