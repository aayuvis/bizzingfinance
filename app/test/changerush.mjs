/* changerush.mjs — Change Rush plays a full minute with coins overlapping and
   never stops dead (FIX-FINANCE §1: a catch with other coins on screen spliced
   an array that had just been replaced, and the frame loop threw for good).

   Run: node test/changerush.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
const { R } = await import('../src/runtime.js');
const sim = await import('../src/sim.js');
const { startGame } = await import('../src/arcade.js');

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nChange Rush · a minute of overlapping coins\n' + '─'.repeat(56));

R.s = sim.newState(); R.s.kids.push(sim.newChild('Asha', 'builder', 'INR'));
let renders = 0; R.render = () => { renders++; };

/* a careful player: go for the lowest coin that still fits, and never stand
   under one that would overpay */
const bot = (st) => {
  const need = st.target - st.got, near = (d) => d.y > 300 - 70;
  const bad = new Set(st.drops.filter((d) => near(d) && d.v > need).map((d) => d.lane));
  const fits = st.drops.filter((d) => d.v <= need && !bad.has(d.lane) && d.y < 290).sort((a, b) => b.y - a.y)[0];
  if (fits) return fits.lane;
  if (!bad.has(st.lane)) return st.lane;
  return [0, 1, 2, 3].find((l) => !bad.has(l)) ?? st.lane;
};
for (const seed of [1, 7, 42, 999, 31337]) {
  startGame('cr', seed);
  const g = R.game;
  let threw = null, frames = 0, overlapCatches = 0;
  /* chase the lowest coin, so catches happen while others are still falling */
  try {
    while (!g.st.done && frames < 60000 / 16 + 50) {
      g.st.lane = bot(g.st);
      const before = g.st.drops.length, got = g.st.got, ex = g.st.exact;
      g.advance(16); frames++;
      if (before > 1 && (g.st.got !== got || g.st.exact !== ex)) overlapCatches++;
    }
  } catch (e) { threw = e; }
  ok(!threw, `seed ${seed}: a minute of play never throws`, threw ? threw.message : `${frames} frames`);
  ok(g.st.done, `seed ${seed}: the round ends — by the clock or by three overpays`, `t=${Math.round(g.st.t)}ms lives=${g.st.lives}`);
  ok(overlapCatches > 3, `seed ${seed}: catches happened with other coins still on screen`, String(overlapCatches));
  ok(g.st.exact > 0, `seed ${seed}: exact amounts were made`, String(g.st.exact));
}
/* the same seed replays the same game — nothing in the score is luck the test cannot see */
{
  const run = () => { startGame('cr', 5); const g = R.game; for (let i = 0; i < 1500; i++) { g.st.lane = bot(g.st); g.advance(16); } return JSON.stringify([g.st.score, g.st.exact, g.st.lives]); };
  const a = run(), b = run();
  ok(a === b, 'a seed replays exactly', a);
}
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
