/* sources.js — where every number in Bizzington comes from.

   Rule six: never teach a number from memory. Rates, returns, inflation and
   prices then-vs-now either carry a source or get cut, exactly as Bizzing
   India treats history — and India's own answer to the same problem is a
   "How we know" block under everything, which is what this is.

   There are two honest provenances and no third:

   · `own`  — a dial of this town. Bizzington's bank rate, its Grow-jar rate,
              its inflation, its market. Nothing real is being claimed, and
              the app says so wherever the number appears.
   · `cite` — a real-world figure with a real citation. Nothing carries this
              yet, and that is the honest state: a card wanting one must add
              the citation here first, and the lint in test/sources.mjs fails
              a card that states a real-world figure without one.

   A number with neither is a bug, and the lint says so by name. */
import { CAL, SB, STORM } from './world.js';

export const SOURCES = {
  grow: {
    kind: 'own',
    what: "The Grow jar's long-run rate",
    value: () => CAL.growTarget + '% a year',
    where: 'world.js · CAL.growTarget',
    says: "A dial of this town, chosen so that compounding is visible inside a childhood rather than to match anything real. It is not a forecast, it is not any market's record, and no real investment is being described.",
  },
  bank: {
    kind: 'own',
    what: 'What the Bank pays',
    value: () => 'the town\'s bank rate, a year — paid a fifty-second each pay day',
    where: 'world.js · the rate the town sets from its own inflation and growth',
    says: "Bizzington's bank moves its rate in response to Bizzington's own inflation, in Bizzington's own model. It is a working economy, not a copy of one.",
  },
  loan: {
    kind: 'own',
    what: 'What a Bank loan costs',
    value: () => 'about 1% of the loan for each week you borrow, a little less as trust grows',
    where: 'sim.js · loanOffer',
    says: 'Short loans cost more than savings earn, in Bizzington as in most places — the bank keeps the difference. The total is always shown before you agree.',
  },
  inflation: {
    kind: 'own',
    what: 'Why prices drift up',
    value: () => 'the town aims at ' + CAL.inflTarget + '%',
    where: 'world.js · CAL.inflTarget and the growth model',
    says: 'The town has a target and misses it, the way a real one does. The shape is honest; the numbers are the town\'s.',
  },
  market: {
    kind: 'own',
    what: 'The companies on the Exchange',
    value: () => 'four, none of them real',
    where: 'content.js · ASSETS and STOCK',
    says: 'Fictional names, moving on the town\'s own generated series. No real company is named anywhere with a buy button, and nothing here is investment advice.',
  },
  wages: {
    kind: 'own',
    what: 'What the jobs pay',
    value: () => "the town's own rates",
    where: 'content.js · JOBS',
    says: 'Chosen so that a week of the town works arithmetically, in the child\'s own currency. They are not a claim about what any real work pays anywhere.',
  },
  homes: {
    kind: 'own',
    what: 'What a place to live costs',
    value: () => "the town's own rents, bills and food",
    where: 'content.js · HOMES',
    says: 'The rooms, flats and the little house are Bizzington\'s, priced so a week of the town adds up in the child\'s own currency. They are not a claim about what anywhere real costs to live.',
  },
  stock: {
    kind: 'own',
    what: "What Bizz & Co's stock costs and sells for",
    value: () => "the town's own prices",
    where: 'content.js · STOCK',
    says: 'Chai, umbrellas, ice golas and rope at prices chosen so a stall in the town can make a profit or a loss you can see. They are Bizzington\'s, not any real market\'s.',
  },
  stall: {
    kind: 'own',
    what: "Market Row's wholesale prices, and how many people want what",
    value: () => "the town's own prices, weather and footfall",
    where: 'stallsim.js · PRODUCTS, WEATHER, LEVELS',
    says: 'What the wholesaler charges for chai, ice golas, rope and umbrellas, how many people walk past wanting one, how the weather moves them and what a pitch costs a week are dials of this town, chosen so a careful season makes a profit and a careless one loses money. They are Bizzington\'s, not any real market\'s.',
  },
  /* Market Storm (docs/12 §2.5): how far a storm falls, how often the company really stops */
  storm: {
    kind: 'own',
    what: 'How Market Storm\'s storms fall',
    value: () => `a company that is fine falls ${Math.round(STORM.fall[0] * 100)}–${Math.round(STORM.fall[1] * 100)} in every 100 at worst, never half · ${Math.round(STORM.stops * 100)} storms in every 100, the company stops making money and ends at ${Math.round(STORM.stopEnd[0] * 100)}–${Math.round(STORM.stopEnd[1] * 100)} of what you paid · a fine one stands at ${Math.round(STORM.back[0] * 100)}–${Math.round(STORM.back[1] * 100)} a few months later`,
    where: 'world.js · STORM',
    says: 'Dials of this town, chosen so that a plan has something to keep to: most storms are the market\'s mood, and some are a business that really stopped. They are Bizzington\'s, not a record of any real market\'s falls, and nothing here is advice.',
  },
  /* The Market Cup (docs/12 §2.6): the series of seasons a play is dealt from (cup.js) */
  cup: {
    kind: 'own',
    what: 'The Market Cup\'s seasons',
    value: () => 'six weeks of the Exchange\'s four fictional companies, dealt from eight kinds of season: a steady one, the red week early, late or twice, a quiet one, Rocket Rickshaws taking off or crashing, and a chai boom',
    where: 'cup.js · CUP_SERIES, cupRows',
    says: 'The seasons are Bizzington\'s own, shaped so that the same way of investing can be tried against different kinds of six weeks. No real market\'s record is being replayed, and nothing here is advice.',
  },
  /* Main Street (docs/12 §2.9): the board's own money, cash flow included (board.js MN) */
  mainstreet: {
    kind: 'own',
    what: 'What Main Street\'s shops cost, pay and need',
    value: () => 'shops at 50–260 that pay a tenth or so of their price every lap · every shop you own adds 6 to each bill · a repair costs 30 in every 100 of your dearest shop · the buy card warns below a cushion of 50 and the bills',
    where: 'board.js · SQUARES, CARDS and MN',
    says: 'The board\'s prices are Bizzington\'s, chosen so buying everything you can afford can force a sale at half price and a cushion keeps you out of it. Not a claim about what any real shop costs or earns.',
  },
  /* Save or Borrow? (docs/12 §2.10): every dial its table uses, named by `dials`, so
     test/saveborrow.mjs can hold the register to covering all of world.js SB (SB3) */
  sbprices: {
    kind: 'own',
    what: 'What the things at the Bank\'s table cost, new, in the sale and second-hand',
    value: () => SB.things.map((t) => t.name).join(', ') + `, at the town's own prices · the sale takes ${Math.round(SB.saleOff * 100)} in every 100 off from week ${SB.saleWeek[0]}–${SB.saleWeek[1]} · second-hand is ${Math.round(SB.usedPrice * 100)} in every 100 of the price, and ${Math.round(SB.repairChance * 100)} in every 100 need a repair of ${Math.round(SB.repair * 100)} in every 100, ${SB.repairAfter} weeks in`,
    where: 'world.js · SB.things, SB.saleOff, SB.saleWeek, SB.usedPrice, SB.repair, SB.repairChance, SB.repairAfter',
    dials: ['things', 'saleOff', 'saleWeek', 'usedPrice', 'repair', 'repairChance', 'repairAfter', 'weeks'],
    says: 'Bizzington\'s own prices for a game, in units that re-price in the child\'s currency. They are not a claim about what a bicycle or a pair of boots costs anywhere real.',
  },
  sbloans: {
    kind: 'own',
    what: 'What the loans at the Bank\'s table charge',
    value: () => `a flat fee of ${Math.round(SB.flatFee * 100)} coins in every 100 of the price · or ${(SB.weeklyFee * 100).toFixed(1)} in every 100 every week · or one fee of ${Math.round(SB.oneOffFee * 100)} in every 100 with the last repayment · over ${SB.loanWeeks[0]}–${SB.loanWeeks[1]} weeks`,
    where: 'world.js · SB.flatFee, SB.weeklyFee, SB.oneOffFee, SB.loanWeeks',
    dials: ['flatFee', 'weeklyFee', 'oneOffFee', 'loanWeeks'],
    says: 'Dials of this town, shown in the game as coins a week. They are not any real lender\'s rate, and no real loan is being described. The total is always worked out before you choose.',
  },
  sbwages: {
    kind: 'own',
    what: 'What a week of work pays at the Bank\'s table',
    value: () => 'shifts of the town\'s own jobs · and, once you have the thing, ' + SB.things.filter((t) => t.invest).map((t) => t.invest.job).join(' or ') + ', at the town\'s own pay',
    where: 'world.js · SB.things (job, shifts, invest) and content.js · JOBS',
    dials: [],
    says: 'The wages are Bizzington\'s jobs, so many shifts a week; the delivery round and the hauling are the town\'s too. Not a claim about what real work pays.',
  },
  sbsurprise: {
    kind: 'own',
    what: 'The surprises at the Bank\'s table',
    value: () => `about a week's wage (${SB.surprise[0]}–${SB.surprise[1]} of one), in week ${SB.surpriseWeek[0]}–${SB.surpriseWeek[1]}: ` + SB.surprises.map((x) => x.what).join(', ') + ` · the tin fills in steps of ${SB.tinStep} unit`,
    where: 'world.js · SB.surprise, SB.surpriseWeek, SB.surprises',
    dials: ['surprise', 'surpriseWeek', 'surprises', 'tinStep'],
    says: 'Chosen so a plan with nothing kept back can come up short, the way a real month can. The sizes are the town\'s.',
  },
};

export function source(k) { return SOURCES[k] || null; }
export function ownNumbers() { return Object.entries(SOURCES).filter(([, v]) => v.kind === 'own'); }
export function cited() { return Object.entries(SOURCES).filter(([, v]) => v.kind === 'cite'); }
