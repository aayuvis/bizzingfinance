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
import { CAL } from './world.js';

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
};

export function source(k) { return SOURCES[k] || null; }
export function ownNumbers() { return Object.entries(SOURCES).filter(([, v]) => v.kind === 'own'); }
export function cited() { return Object.entries(SOURCES).filter(([, v]) => v.kind === 'cite'); }
