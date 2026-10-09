/* world.js — Bizzington's economy. One world, and everything derives from it.

   THE PROBLEM THIS EXISTS TO FIX. The market used to be four independent
   random walks with a crash hard-coded at 55% of the series. Four coin flips
   cannot teach the lesson at the top of the ladder (docs/08):

     Rates went up. My bond fell, my mortgage got dearer, and my shop's loan
     cost more — all at once, for ONE reason.

   So no asset class gets its own private randomness. Every price in this app
   is a function of the three numbers below plus that class's own character,
   which is why a child can always be told *why* something moved — and why
   correlation is EMERGENT here rather than asserted. Two things that share a
   driver move together without anyone writing a correlation matrix.

   THREE STATE VARIABLES, and they are the whole model:

     growth     the cycle: boom, slowdown, contraction, recovery
     inflation  responds to growth with a lag, pulls back to target
     rate       the bank's answer to inflation and growth, in steps

   HONESTY. Every constant below is BIZZINGTON'S OWN, chosen so the town
   behaves in a way a child can learn from. They are not measurements of any
   real economy and nothing in the app may present them as one — CONCEPT §6.6.
   Where a real figure is ever needed, it gets a source or it gets cut.

   Time runs in WEEKS. 52 to a year, 364 to the seven-year journey. */

import { rng } from './ui.js';

export const WEEKS_PER_YEAR = 52;

/* Bizzington's calibration. Annual figures; the model converts to weekly. */
export const CAL = {
  growthMean: 2.5,        /* % a year, the town's long-run trend            */
  growthAmp: 4.0,         /* how far the cycle swings either side of it     */
  cycleYears: 6,          /* boom to boom                                   */
  growthNoise: 1.1,

  inflTarget: 3.0,        /* what the bank is aiming at                     */
  /* The Grow jar's long-run rate. This is a DIAL OF THIS TOWN, not a real
     return, and nothing in the app may present it as one: rule six says never
     teach a number from memory, so where this figure is shown to a child it
     is labelled as Bizzington's own. It sits here so there is exactly one of
     it — a projection that hard-codes its own rate is a number claiming a
     provenance it does not have. */
  growTarget: 7.0,
  inflPull: 0.045,        /* how fast it returns to target, per week        */
  inflFromGrowth: 0.055,  /* a hot town raises prices, with a lag           */
  inflNoise: 0.55,

  rateNeutral: 4.0,       /* the rate when everything is on target          */
  rateOnInfl: 1.5,        /* raise this much for each point over target     */
  rateOnGrowth: 0.5,
  rateStep: 0.25,         /* the bank moves in quarter points               */
  rateEveryWeeks: 6,      /* and not more often than this                   */
  rateMin: 0.25, rateMax: 14,

  shockChance: 0.0016,    /* per week — rare, and never on a schedule       */
  shockGrowth: -7.0,
  shockWeeks: 30,
};

/* Save or Borrow? (docs/12 §2.10) — the dials of the table at the Bank. Every price,
   fee, discount and wage the game shows is one of these, said in coins by sim.js
   (sbRound) and registered in sources.js. They are BIZZINGTON'S OWN, like everything
   above: no real lender's rate is being described, and the app says so. Prices and
   pay are in units (fmt.js price()), so the table re-prices in every currency. */
export const SB = {
  weeks: 12,                 /* the calendar strip: twelve weeks, every path side by side */
  /* the things a child might want, what a week of a town job pays towards them (a job in
     content.js JOBS, so many shifts a week), and the verb for "having it" on the card */
  things: [
    { id: 'bike',   name: 'a bicycle',          icon: 'bicycle',    units: 120, job: 'errands', shifts: 2, having: 'riding',
      invest: { job: 'the delivery round', units: 25 } },
    { id: 'cart',   name: 'a handcart',         icon: 'cart',       units: 90,  job: 'flyers',  shifts: 3, having: 'hauling',
      invest: { job: 'hauling for the Row', units: 20 } },
    { id: 'kite',   name: 'a fighter kite and a spool', icon: 'kite', units: 40, job: 'sweep', shifts: 2, having: 'flying' },
    { id: 'paints', name: 'a big box of paints', icon: 'crayon',    units: 50,  job: 'crates',  shifts: 1, having: 'painting' },
    { id: 'phones', name: 'a pair of headphones', icon: 'headphones', units: 70, job: 'nets',   shifts: 2, having: 'listening' },
    { id: 'boots',  name: 'football boots',     icon: 'shoe',       units: 60,  job: 'mend',    shifts: 1, having: 'playing' },
    { id: 'lamp',   name: 'a reading lamp',     icon: 'lantern',    units: 45,  job: 'crates',  shifts: 1, having: 'reading' },
  ],
  flatFee: 0.2,              /* Standard's loan: one flat fee, a fifth of the price, spread over the weeks */
  weeklyFee: 0.025,          /* Tricky's loan A: a fee in every repayment, a fortieth of the price a week */
  oneOffFee: 0.15,           /* Tricky's loan B: one fee, paid with the last repayment */
  loanWeeks: [4, 12],        /* how long a loan may run: the shortest the wage can carry, within the strip */
  usedPrice: 0.6,            /* second-hand: three-fifths of the new price */
  repair: 0.25,              /* a repair, when one is needed: a quarter of the new price */
  repairChance: 0.5,         /* how often a second-hand one needs it (decided by the round's seed) */
  repairAfter: 2,            /* weeks after buying that it shows up */
  saleOff: 0.2,              /* the sale takes a fifth off */
  saleWeek: [5, 8],          /* the week the sale arrives */
  surprise: [0.7, 1.3],      /* a surprise costs about a week's wage, give or take */
  surpriseWeek: [3, 7],
  tinStep: 1,                /* the cushion's weekly amount is rounded up to whole units, so it is a coin you can hold */
  surprises: [
    { what: 'a birthday present for a friend', icon: 'cake' },
    { what: 'the school trip', icon: 'bus' },
    { what: 'a new umbrella in the monsoon', icon: 'parasol' },
  ],
};

/* Market Storm (docs/12 §2.5) — the storm's dials. A storm is a fall in one fictional
   company's price; in most the company is fine and the fall is the market's mood, and in
   `stops` of them the company really does stop making money and a headline says so.
   BIZZINGTON'S OWN, registered in sources.js ('storm'): no real market's falls are being
   described, and the storm says so on its end card. Shares are of what you paid. */
export const STORM = {
  len: 42000,                /* the storm, in ms of wall time */
  stops: 0.2,                /* one storm in five: the company has stopped making money */
  fall: [0.22, 0.42],        /* a fine company's worst fall: never as far as half */
  factAt: [0.36, 0.58],      /* when the "stopped making money" headline lands, through the storm */
  stopEnd: [0.24, 0.36],     /* where a company that stopped ends the storm */
  stopAfter: [0.18, 0.3],    /* and where it is a few months later */
  back: [1.04, 1.18],        /* where a fine company is a few months later */
  newsEvery: 6000,           /* ms between headlines */
};

/* The path is computed once from the seed and cached. A pure (seed, week) ->
   state lookup would be nicer, but inflation and the rate have memory: today
   depends on last week. So we walk it forwards once and index into it, which
   keeps every call deterministic and lets a parent be shown exactly what
   happened on the day it happened. */
const cache = new Map();

export function worldPath(seed, weeks) {
  const key = seed + ':' + weeks;
  if (cache.has(key)) return cache.get(key);
  const r = rng(seed || 1);
  const n = (r() + r() + r() - 1.5) * 2;      /* rough normal, in [-3,3] */
  const noise = () => (r() + r() + r() - 1.5) * 2;

  const path = [];
  let infl = CAL.inflTarget;
  let rate = CAL.rateNeutral;
  let lastMove = -99;
  let shockLeft = 0;
  const cycleW = CAL.cycleYears * WEEKS_PER_YEAR;
  void n;

  for (let w = 0; w < weeks; w++) {
    /* growth — a slow cycle, plus noise, plus a rare shock that decays */
    let growth = CAL.growthMean + CAL.growthAmp * Math.sin((2 * Math.PI * w) / cycleW)
      + noise() * CAL.growthNoise;
    if (shockLeft <= 0 && r() < CAL.shockChance) shockLeft = CAL.shockWeeks;
    if (shockLeft > 0) {
      growth += CAL.shockGrowth * (shockLeft / CAL.shockWeeks);
      shockLeft--;
    }

    /* inflation — pulled to target, pushed by a hot or cold town */
    const gap = growth - CAL.growthMean;
    infl += (CAL.inflTarget - infl) * CAL.inflPull
      + gap * CAL.inflFromGrowth
      + noise() * CAL.inflNoise * 0.12;
    infl = Math.max(-2, Math.min(18, infl));

    /* the rate — the bank's answer, in quarter points, and not every week.
       This is the single most teachable line in the file: the bank raises
       when prices run and cuts when the town stalls, and everything a child
       owns feels it at once. */
    if (w - lastMove >= CAL.rateEveryWeeks) {
      const want = CAL.rateNeutral
        + CAL.rateOnInfl * (infl - CAL.inflTarget)
        + CAL.rateOnGrowth * gap;
      const diff = want - rate;
      if (Math.abs(diff) >= CAL.rateStep) {
        const steps = Math.max(-2, Math.min(2, Math.round(diff / CAL.rateStep)));
        rate = Math.max(CAL.rateMin, Math.min(CAL.rateMax, rate + steps * CAL.rateStep));
        lastMove = w;
      }
    }

    path.push({
      w, growth, inflation: infl, rate,
      real: rate - infl,                 /* what the rate is worth after prices */
      shock: shockLeft > 0,
      phase: growth > CAL.growthMean + 1 ? 'boom'
        : growth < 0 ? 'contraction'
        : growth < CAL.growthMean ? 'slowdown' : 'recovery',
    });
  }
  cache.set(key, path);
  return path;
}

export function worldAt(seed, week, weeks) {
  const p = worldPath(seed, Math.max(weeks || 0, week + 1));
  return p[Math.max(0, Math.min(p.length - 1, week))];
}

/* Plain-English, for a child. Never a number without a reason attached. */
export function explain(s) {
  const bits = [];
  if (s.rate >= CAL.rateNeutral + 1.5) bits.push('borrowing is dear');
  else if (s.rate <= CAL.rateNeutral - 1) bits.push('borrowing is cheap');
  if (s.inflation >= CAL.inflTarget + 2) bits.push('prices are climbing fast');
  else if (s.inflation <= 1) bits.push('prices are barely moving');
  if (s.phase === 'contraction') bits.push('the town is shrinking');
  else if (s.phase === 'boom') bits.push('the town is busy');
  return bits.length ? bits.join(', ') : 'the town is steady';
}


/* The town's own long-run growth, as a multiplier over `years`. Every
   projection in the app goes through this, so the rate is named in one place
   and the sentence beside it is true. */
export function townGrowth(years) { return Math.pow(1 + CAL.growTarget / 100, years); }
export const GROW_LABEL = "Bizzington's own Grow-jar rate — the town's number, not a real market's";
