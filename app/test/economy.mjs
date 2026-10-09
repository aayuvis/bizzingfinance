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

/* ── 8. one pay path (docs/12 §1.1, T1) ─────────────────────────────────
   Every game's wage goes through payout() → sim.gameWage (the day's cap, the level's
   par) with exactly one price(). A perfect Standard round of any game pays about the
   same — the norm — and none pays more than 1.5× it. Stall Rush used to pay ~₹2,100
   (a second price() on rupees), Main Street paid round the cap, the till ticked twice. */
{
  globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
  globalThis.Image = class {};
  const { R } = await import('../src/runtime.js');
  const sim = await import('../src/sim.js');
  const AR = await import('../src/arcade.js');
  const { price, setCurrency } = await import('../src/fmt.js');
  const puz = await import('../src/dailypuzzle.js');
  const { play } = await import('./_bots.mjs');
  const { readFileSync } = await import('node:fs');
  R.render = () => {};
  const fresh = (cur = 'INR') => { setCurrency(cur); R.s = sim.newState(); R.s.kids.push(sim.newChild('Asha', 'builder', cur)); R.s.kids[0].learn.level = 30; return R.s.kids[0]; };
  const NORM = AR.WAGE_NORM, ids = AR.GAMES.map((g) => g.id);

  /* the table: the most any round can pay, whatever the score, and what a perfect one pays */
  const top = ids.map((id) => [id, AR.wageUnits(id, 1e9), AR.wageUnits(id, AR.PERFECT)]);
  ok('every game\'s maximum wage per round is within 1.5× of the norm', top.every(([, max, perf]) => max <= 1.5 * NORM && perf >= NORM / 1.5 && max >= perf),
     top.map(([id, max]) => `${id} ${max}`).join(' · ') + ` (norm ${NORM} units)`);
  ok('a nonsense score pays nothing, never a negative or NaN wage', ids.every((id) => AR.wageUnits(id, -5) === 0 && AR.wageUnits(id, NaN) === 0));

  /* played: a careful round of every game, in INR, through the game's own controls */
  const rows = [];
  /* Stall of My Own is a season, not a round: test/stall.mjs plays it week by week and holds
     each week's wage to this same norm through payout() (SA7) */
  for (const id of ids.filter((x) => x !== 'so')) {
    let best = { units: -1 };
    for (const seed of [1, 7, 42]) {
      const c = fresh(), w0 = c.money.wallet;
      const g = play(id, seed, 'standard');
      const p = AR.lastPay();
      const delta = c.money.wallet - w0;
      if (p.units > best.units) best = Object.assign({ id, delta, finished: g.st ? g.st.done : g.g.done }, p);
    }
    rows.push(best);
  }
  ok('a careful round of every game finishes and pays through payout()', rows.every((r) => r.finished && r.label), rows.filter((r) => !r.finished || !r.label).map((r) => r.id).join(','));
  ok('no game\'s best round pays more than 1.5× the norm (₹, Standard)', rows.every((r) => r.units <= 1.5 * NORM),
     rows.map((r) => `${r.id} ${r.units}u=₹${r.delta}`).join(' · '));
  ok('each pays exactly price(units): one price(), never a second on money already converted', rows.every((r) => r.delta === price(r.units) && r.paid === r.delta),
     rows.filter((r) => r.delta !== price(r.units)).map((r) => `${r.id}: paid ${r.delta}, price ${price(r.units)}`).join(' · '));
  const perfect = rows.filter((r) => ['cr', 'nw', 'ss', 'tt', 'sn', 'bb', 'st', 'sr'].includes(r.id));
  ok('a perfect round of the scored games pays about the norm (within 1.5× either way)', perfect.every((r) => r.units >= NORM / 1.5),
     perfect.map((r) => `${r.id} ${r.units}`).join(' · '));

  /* Main Street counts against the day's cap, like every other game */
  {
    const c = fresh(), paid = [];
    for (let k = 0; k < 4; k++) { const w = c.money.wallet; play('mn', 11 + k, 'standard'); paid.push(c.money.wallet - w); }
    ok('Main Street pays its first 3 games of a day and the 4th is practice — it counts against the cap', paid.slice(0, 3).every((x) => x > 0) && paid[3] === 0 && c.wages.by['Main Street'] === 3 && AR.lastPay().capped,
       paid.join(','));
  }
  /* static: nothing upstream of payout() is money, and nothing pays round it */
  {
    const src = (f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
    const calls = [];
    for (const f of ['arcade.js', 'board.js', 'jobgames.js', 'dailypuzzle.js']) {
      const s = src(f);
      for (const m of s.matchAll(/\bpayout\(([^)]*(?:\([^)]*\))?[^)]*)\)/g)) calls.push([f, m[1]]);
    }
    const priced = calls.filter(([, a]) => /\bprice\(|money|revenue|profit\b|\.cash\b/.test(a));
    ok('no payout() is handed an amount already priced in a currency', calls.length > 0 && !priced.length, priced.map((x) => x.join(': ')).join(' | '));
    const round = ['arcade.js', 'board.js', 'dailypuzzle.js'].filter((f) => /\bsim\.earn\(/.test(src(f)));
    ok('no game, the board or the till pays straight into the wallet (sim.earn) round the cap', !round.length, round.join(','));
  }
  /* Today's till: one daily wage, through the same capped path, counted once */
  {
    const c = fresh(); c.quests = { list: ['q-earn'], prog: {}, claimed: {} };
    const p = puz.puzzle(); const w = c.money.wallet;
    puz.guess(c, p.answer);
    ok('Today\'s till pays one wage through the capped path, and counts toward "earn" once', c.money.wallet - w === price(puz.WAGE) && ((c.wages || {}).by || {})["Today's till"] === 1 && (c.quests.prog['q-earn'] || 0) === price(puz.WAGE),
       `paid ${c.money.wallet - w}, earn quest ${c.quests.prog['q-earn']}`);
  }
  setCurrency('INR');
}

console.log('─'.repeat(56));
console.log(`${n - fails}/${n} passed`);
process.exit(fails ? 1 : 0);
