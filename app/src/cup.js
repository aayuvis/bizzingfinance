/* cup.js — the Market Cup's seasons, with no screen in them (docs/12 §2.6).

   Bea's own line is the design: "run another six weeks and see whether that keeps
   happening — that question is the game." So a season is not one generator's dice: it is
   drawn per play from an authored SERIES of the kinds of six weeks a market has — the red
   week early, the red week late, two of them, a quiet one, a boom in one company and a bust
   in another. The child is told which one they were dealt only at the end, so the question
   "would my way of doing it have won in a different season?" is a real one, and the record
   (cupRecord in arcade.js) keeps the answer across seasons.

   Everything is the town's own (sources.js 'cup'): fictional companies on the Exchange,
   six weeks of returns the series shapes. Nothing here is a real market's record. */
import { rng } from './ui.js';
import { ASSETS } from './content.js';

export const CUP_WEEKS = 6;
/* red: the weeks the whole market falls (× each company's own swing) · tilt: a nudge a week
   on one company's return · calm: × on every week's swing */
export const CUP_SERIES = [
  { id: 'steady',  name: 'A steady season',              red: [3],    tilt: {},                          calm: 1 },
  { id: 'early',   name: 'The red week came early',      red: [1],    tilt: {},                          calm: 1 },
  { id: 'late',    name: 'A red week right at the end',  red: [5],    tilt: {},                          calm: 1 },
  { id: 'double',  name: 'Two red weeks',                red: [2, 4], tilt: {}, redScale: 0.75,          calm: 1 },
  { id: 'quiet',   name: 'A quiet season',               red: [3],    tilt: {}, redScale: 0.5,           calm: 0.5 },
  { id: 'rocket',  name: 'Rocket Rickshaws took off',    red: [3],    tilt: { rocket: 0.035 },           calm: 1 },
  { id: 'bust',    name: 'Rocket Rickshaws crashed',     red: [3],    tilt: { rocket: -0.08 },           calm: 1 },
  { id: 'chai',    name: 'The chai boom',                red: [4],    tilt: { chai: 0.02, grain: -0.004 }, calm: 1 },
];

/* which season a play was dealt: from its own seed, never from the child */
export function seasonFor(seed) {
  const r = rng(((seed >>> 0) ^ 0xC0FFEE) >>> 0);
  return CUP_SERIES[Math.floor(r() * CUP_SERIES.length)];
}

/* the season's weeks: a level (kn) scales the swing and the red weeks, and nothing else */
export function cupRows(kn, seed = 120) {
  const s = seasonFor(seed), r = rng(seed), ret = [];
  for (let k = 0; k < CUP_WEEKS; k++) {
    const row = {};
    ASSETS.forEach((a) => {
      const shock = (r() + r() + r() - 1.5) * 2 * a.vol * kn.shock * s.calm;
      const red = s.red.includes(k) ? -a.vol * 1.5 * kn.crash * (s.redScale || 1) : 0;
      row[a.id] = a.drift * 3.6 + shock + red + (s.tilt[a.id] || 0);
    });
    ret.push(row);
  }
  return ret;
}
/* the cup score: what you ended with, how spread out you were, how still you kept */
export function cupScore(final, divAvg, churn, start = 1000) {
  const ret = Math.round((final / start - 1) * 100);
  const div = Math.round(divAvg * 7);
  const steady = Math.max(0, 30 - Math.round(churn / 8));
  return { ret, div, steady, total: ret + div + steady };
}
/* the Cup's par on each level and season is Boring Bella's own cup score there — the basket in
   week one and then home — worked out from the same weeks, so it cannot drift */
export function bellaCup(kn, seed = 120) {
  let v = 1000;
  cupRows(kn, seed).forEach((row) => { v = Math.round(v * (1 + row.basket)); });
  return cupScore(v, 4, 100).total;
}
