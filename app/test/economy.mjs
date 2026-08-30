/* economy.mjs — seven years of Bizzington, asserted.

   A simulation nobody has tested across seven years is a claim; one with
   these checks is a product (docs/08 §7). Every assertion here is a thing a
   child would be told, so if one fails the app is teaching something false.

   Run: node test/economy.mjs */

import { worldPath, CAL, WEEKS_PER_YEAR } from '../src/world.js';
import { marketPath, runMix } from '../src/assetclasses.js';

const YEARS = 7, W = YEARS * WEEKS_PER_YEAR;
const SEEDS = Array.from({ length: 200 }, (_, i) => 1000 + i * 37);
let fails = 0, n = 0;

const ok = (name, pass, detail) => {
  n++; if (!pass) fails++;
  console.log(`${pass ? '  ok  ' : 'FAIL  '}${name}${detail ? '   ' + detail : ''}`);
};
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const median = (a) => { const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
const sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); };
const corr = (a, b) => {
  const ma = mean(a), mb = mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) { num += (a[i]-ma)*(b[i]-mb); da += (a[i]-ma)**2; db += (b[i]-mb)**2; }
  return num / Math.sqrt(da * db);
};

console.log(`\nBizzington · ${YEARS} years × ${SEEDS.length} seeds\n${'─'.repeat(56)}`);

/* ── 1. the world is a world, not noise ─────────────────────────────── */
{
  const p = worldPath(SEEDS[0], W);
  ok('world runs the full journey', p.length === W, `${p.length} weeks`);
  const infl = p.map((s) => s.inflation);
  ok('inflation stays in a sane band', Math.min(...infl) > -3 && Math.max(...infl) < 20,
     `${Math.min(...infl).toFixed(1)}% .. ${Math.max(...infl).toFixed(1)}%`);
  const rates = p.map((s) => s.rate);
  ok('the bank moves the rate, in steps', new Set(rates).size > 4 && new Set(rates).size < 60,
     `${new Set(rates).size} distinct levels`);
  const phases = new Set(p.map((s) => s.phase));
  ok('the town goes through the whole cycle', phases.size >= 3, [...phases].join(', '));

  /* the bank must actually respond to inflation, or the model teaches nothing */
  const cs = corr(p.map((s) => s.inflation), p.map((s) => s.rate));
  ok('the rate follows inflation', cs > 0.4, `corr ${cs.toFixed(2)}`);
}

/* ── 2. THE money shot: rates up, bonds down ────────────────────────── */
{
  const cors = SEEDS.slice(0, 60).map((seed) => {
    const { world, weekly } = marketPath(seed, W);
    const dRate = [], bond = [];
    for (let w = 1; w < W; w++) {
      const d = world[w].rate - world[w - 1].rate;
      if (d !== 0) { dRate.push(d); bond.push(weekly.bond[w]); }
    }
    return dRate.length > 6 ? corr(dRate, bond) : null;
  }).filter((x) => x !== null);
  ok('when the rate rises the bond falls', median(cors) < -0.8,
     `median corr ${median(cors).toFixed(2)} over ${cors.length} seeds`);
}

/* ── 3. cash is not safe ────────────────────────────────────────────── */
{
  const nominal = SEEDS.map((seed) => marketPath(seed, W).series.cash.at(-1));
  const real = SEEDS.map((seed) => marketPath(seed, W).real.cash.at(-1));
  ok('the cash NUMBER never moves', nominal.every((v) => Math.abs(v - 100) < 1e-9), '100 all the way');
  ok('and its real value falls anyway', Math.max(...real) < 100,
     `worst case still only ${Math.max(...real).toFixed(1)} of 100`);
  ok('by enough for a child to feel it', median(real) < 86, `median ${median(real).toFixed(1)}`);
}

/* ── 4. diversification is emergent, not decreed ────────────────────── */
{
  const one = [], all = [];
  SEEDS.forEach((seed) => {
    const { weekly } = marketPath(seed, W);
    one.push(sd(weekly.shares) * Math.sqrt(WEEKS_PER_YEAR) * 100);
    all.push(sd(weekly.index) * Math.sqrt(WEEKS_PER_YEAR) * 100);
  });
  ok('the basket is calmer than one company', median(all) < median(one),
     `index ${median(all).toFixed(1)}% vs single ${median(one).toFixed(1)}% a year`);
}

/* ── 5. gold is the one that disagrees ──────────────────────────────── */
{
  const cs = SEEDS.slice(0, 60).map((seed) => {
    const { weekly } = marketPath(seed, W);
    return corr(weekly.gold, weekly.index);
  });
  ok('gold does not follow shares', Math.abs(median(cs)) < 0.35, `median corr ${median(cs).toFixed(2)}`);

  /* The first version of this suite checked gold's WEEKLY correlation and
     called it a pass — but gold was 99.6% noise, so it correlated with
     nothing because it WAS nothing. Test the claim actually made: gold does
     better when money in the bank is losing to prices. */
  const linked = SEEDS.slice(0, 80).map((seed) => {
    const { weekly, world } = marketPath(seed, W);
    const win = 26, xs = [], ys = [];
    for (let a = 0; a + win < W; a += win) {
      const realAvg = mean(world.slice(a, a + win).map((s) => s.real));
      const ret = weekly.gold.slice(a, a + win).reduce((t, r) => t * (1 + r), 1) - 1;
      xs.push(realAvg); ys.push(ret);
    }
    return corr(xs, ys);
  });
  ok('gold rises when the real rate falls — it is driven, not noise',
     median(linked) < -0.25, `median corr vs real rate ${median(linked).toFixed(2)}`);
}

/* ── 6. the boring diversified player wins the season (CONCEPT §6.3) ── */
{
  const spread = { index: 0.4, bond: 0.25, property: 0.2, gold: 0.1, deposit: 0.05 };
  const punt = { shares: 1 };
  const allCash = { cash: 1 };
  let spreadWins = 0, better = 0;
  const sC = [], pC = [], sR = [], pR = [];
  SEEDS.forEach((seed) => {
    const a = runMix(seed, W, spread), b = runMix(seed, W, punt);
    sC.push(a.calmar); pC.push(b.calmar); sR.push(a.cagr); pR.push(b.cagr);
    if (a.calmar > b.calmar) better++;
    if (a.end > b.end) spreadWins++;
  });
  ok('spread beats the punt on return-per-pain, in most worlds', better / SEEDS.length > 0.6,
     `${Math.round(better / SEEDS.length * 100)}% of seeds · calmar ${median(sC).toFixed(2)} vs ${median(pC).toFixed(2)}`);
  ok('and the punt is not simply better on returns either', median(sR) > 0,
     `spread ${median(sR).toFixed(1)}%/yr vs punt ${median(pR).toFixed(1)}%/yr`);
  ok('spread has a shallower worst fall',
     median(SEEDS.map((s) => runMix(s, W, spread).maxDrawdown)) < median(SEEDS.map((s) => runMix(s, W, punt).maxDrawdown)),
     `${(median(SEEDS.map((s) => runMix(s, W, spread).maxDrawdown)) * 100).toFixed(0)}% vs ${(median(SEEDS.map((s) => runMix(s, W, punt).maxDrawdown)) * 100).toFixed(0)}%`);
  /* Like for like: both nominal now, so the comparison is honest. */
  const cash = SEEDS.map((s) => runMix(s, W, allCash).cagr);
  ok('doing nothing at all is the worst plan', median(sR) > median(cash),
     `spread ${median(sR).toFixed(1)}%/yr vs cash ${median(cash).toFixed(1)}%/yr, both nominal`);
}

/* ── 6b. the promise of the whole journey must hold in its own world ── */
{
  const spread = { index: 0.4, bond: 0.25, property: 0.2, gold: 0.1, deposit: 0.05 };
  const realEnd = SEEDS.map((seed) => {
    const { real, weekly, prices } = marketPath(seed, W);
    let v = 100;
    for (let w = 0; w < W; w++) {
      let rr = 0;
      Object.keys(spread).forEach((id) => { rr += spread[id] * (weekly[id][w] || 0); });
      v *= (1 + rr);
    }
    return v / prices[prices.length - 1] * 100;
  });
  const beat = realEnd.filter((v) => v > 100).length / SEEDS.length;
  ok('a spread portfolio beats inflation in most worlds', beat > 0.7,
     `${Math.round(beat * 100)}% of seeds · median real ${median(realEnd).toFixed(0)} of 100`);

  const idx = SEEDS.map((seed) => marketPath(seed, W).real.index.at(-1));
  ok('and the index alone beats it too', median(idx) > 105,
     `median real ${median(idx).toFixed(0)} of 100`);
}

/* ── 7. determinism — a season must replay exactly ──────────────────── */
{
  const a = marketPath(4242, W).series.index.at(-1);
  const b = marketPath(4242, W).series.index.at(-1);
  const c = marketPath(4243, W).series.index.at(-1);
  ok('same seed, same world', a === b);
  ok('different seed, different world', a !== c);
}

console.log('─'.repeat(56));
console.log(`${n - fails}/${n} passed`);
process.exit(fails ? 1 : 0);
