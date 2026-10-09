/* climb.mjs — Compound Climb (docs/12 §2.4): the retune kept, the score the decision, The Snowball
   merged in as the estimate step. What a child would complain about:
   · a score that is the tower, so a lucky greedy climb beats a careful one;
   · a wage that moves with the tower rather than the decisions;
   · an estimate that is a multiple choice again (the Snowball's "second-largest option" leak);
   · the same years every play, so the best holds can be memorised.
   Every check here was watched failing once (the commit message says how each was broken).
   Run: node test/climb.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
globalThis.Image = class {};
import { readFileSync } from 'node:fs';
const { R } = await import('../src/runtime.js');
const sim = await import('../src/sim.js');
const AR = await import('../src/arcade.js');
const C = await import('../src/climbsim.js');
const { SOURCES } = await import('../src/sources.js');

let pass = 0, fail = 0;
const ok = (label, cond, detail = '') => { const c = !!cond; if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
R.render = () => {};
const fresh = () => { R.s = sim.newState(); R.s.kids.push(sim.newChild('Asha', 'builder', 'INR')); R.s.kids[0].learn.level = 30; return R.s.kids[0]; };
const plain = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');
/* one climb: `charge(year)` 0–100, `est(asking)` the marker */
function climb(seed, charge, est, tier = 'standard') {
  AR.startGame('cc', seed, tier); const g = R.game, asked = [];
  for (let guard = 0; guard < 100 && !g.st.done; guard++) {
    if (g.st.asking) { asked.push(g.st.year); g.estimate(est(g.st.asking)); continue; }
    g.st.holding = true; g.st.charge = charge(g.st.year); g.release();
  }
  return { g, asked, run: g.st, score: g.st.score, share: R.s.kids[0].rounds.cc.share };
}
const mid = (a) => C.ccBands(a.from).mid;

console.log('\nCompound Climb · §2.4\n' + '─'.repeat(56));
{
  const ids = AR.GAMES.map((g) => g.id);
  ok('The Snowball is no longer a card: it is Compound Climb\'s estimate step', ids.includes('cc') && !ids.includes('sn'));
}

/* ── the retune is kept ── */
ok('the year is the retune: the expected return peaks in the middle (about 60%) and the swing grows far faster',
  Math.abs(C.ccMean(0.6) - 0.108) < 1e-9 && C.ccMean(0.6) > C.ccMean(0.3) && C.ccMean(0.6) > C.ccMean(1) && C.ccVol(1) > 6 * C.ccVol(0.55) && AR.ccYear === C.ccYear);

/* ── the score is the decision, out of ten, and the wage is flat on it ── */
{
  const S = (o) => C.ccScore(Object.assign({ ruined: false, years: 15, reached: true, charges: Array(15).fill(55), estimates: [{ close: 1 }, { close: 1 }] }, o));
  ok('a careful climb — fifteen years, over the line, steady, estimates close — scores ten of ten', S({}).points === C.CC_MAX && C.CC_MAX === 10);
  ok('the parts: surviving 3, the line 2, steadiness 2 (only with the line), estimates 3',
    S({ ruined: true, years: 7, reached: false }).survived === 0 && S({ reached: false }).target === 0 && S({ reached: false }).steady === 0
    && S({ charges: Array(15).fill(95) }).steady === 0 && S({ estimates: [] }).estimate === 0 && S({ estimates: [{ close: 0.5 }, { close: 0.5 }] }).estimate === 1.5);
  ok('the tower is not in the score: ccScore is never handed the money', !/money|tower/.test(C.ccScore.toString().split('{')[1].split('}')[0]));
  const share = (points, money) => AR.shareOf('cc', { points, money, ruined: false }, 'standard');
  ok('the wage is flat on the score: the same score pays the same however tall the tower', share(7, 430) === share(7, 2400) && share(10, 421) === AR.PERFECT && share(5, 9999) < share(7, 430));
  /* played: the greedy climber and the timid one both score below the steady one, over many seeds */
  const avg = (charge, est) => { let t = 0; for (let s = 1; s <= 200; s++) { fresh(); t += climb(s * 7919, charge, est).score.points; AR.quitGame(); } return t / 200; };
  const steady = avg(() => 55, mid), greedy = avg(() => 100, mid), timid = avg(() => 15, mid), lucky = avg(() => 85, mid);
  ok('over 200 seeds the steady climber scores best: above the greedy, the high-but-not-full and the timid', steady > greedy && steady > lucky && steady > timid, `steady ${steady.toFixed(2)} · 85% ${lucky.toFixed(2)} · full ${greedy.toFixed(2)} · timid ${timid.toFixed(2)}`);
  /* a greedy round that ends with a taller tower than a steady one still scores lower */
  let found = null;
  for (let s = 1; s <= 400 && !found; s++) {
    fresh(); const a = climb(s, () => 55, mid); AR.quitGame();
    fresh(); const b = climb(s, () => 90, mid); AR.quitGame();
    if (!b.run.ruined && b.run.money > a.run.money * 1.3 && b.score.points < a.score.points) found = `seed ${s}: steady ${Math.round(a.run.money)} → ${a.score.points}, greedy ${Math.round(b.run.money)} → ${b.score.points}`;
  }
  ok('a lucky greedy climb with the taller tower still scores below the steady one', found, found || 'none in 400 seeds');
}

/* ── The Snowball, merged in: every five years, estimate where a steady charge lands ── */
{
  fresh(); const { g, asked, run } = climb(31, () => 55, mid);
  ok('the climb stops for an estimate after year 5 and year 10 — and only then', asked.join() === C.CC.CHECKS.join() && run.estimates.length === 2, asked.join());
  AR.quitGame();
  fresh(); AR.startGame('cc', 31, 'standard'); const h = R.game;
  for (let y = 0; y < 5; y++) { h.st.holding = true; h.st.charge = 55; h.release(); }
  const a = h.st.asking, v = h.view();
  h.act('ccHold'); h.st.holding = true; h.st.charge = 55; h.release(); h.key({ key: ' ' });
  ok('while estimating, the climb waits: no hold, no release, no year played', a && h.st.year === 5 && !!h.st.asking);
  ok('the estimate is a marker, not a multiple choice: no options, a − and +, Lock it in, and the marker on the tower', !/class="opt/.test(v) && /data-act="ccEstStep" data-arg="-1"/.test(v) && /data-act="ccEstStep" data-arg="1"/.test(v) && /data-act="ccEst"/.test(v) && /id="ccEstN"/.test(v));
  const e0 = h.st.asking.est; h.key({ key: 'ArrowUp' }); h.key({ key: 'ArrowUp', shiftKey: true }); const e1 = h.st.asking.est; h.act('ccEstStep', -1); const e2 = h.st.asking.est;
  ok('↑ ↓ (and Shift for big steps) and the − + buttons move the marker', e1 > e0 && e1 - e0 >= 5 && e2 < e1, `${e0} → ${e1} → ${e2}`);
  const b = C.ccBands(h.st.asking.from);
  h.key({ key: 'Enter' });
  const sh = h.st.shown, v2 = plain(h.view());
  ok('Enter locks it in; then the bands are shown: where a steady charge lands, and the range it usually lands in', !h.st.asking && sh && sh.lo < sh.mid && sh.mid < sh.hi && sh.mid === b.mid && v2.includes(`lands about ${b.mid}`) && v2.includes(`between ${b.lo} and ${b.hi}`));
  AR.quitGame();
  ok('scored by closeness: exactly right is 1, half as far again (or two-thirds) is nothing, in between in between',
    C.ccClose(166, 166) === 1 && C.ccClose(249, 166) === 0 && C.ccClose(111, 166) < 0.01 && C.ccClose(180, 166) > 0.7 && C.ccClose(180, 166) < 1 && C.ccClose(0, 166) === 0);
  /* "nobody guesses high enough": the adding-up guess scores less than the compounding one */
  const add = (a2) => Math.round(a2.from * (1 + 5 * C.ccMean(C.CC.STEADY)));
  fresh(); const s1 = climb(5, () => 55, mid).score.estimate; AR.quitGame();
  fresh(); const s2 = climb(5, () => 55, add).score.estimate; AR.quitGame();
  fresh(); const s3 = climb(5, () => 55, (x) => Math.round(x.from)).score.estimate; AR.quitGame();
  ok('the compounding guess scores more than the adding-up guess, which scores more than "it will stay the same"', s1 > s2 && s2 > s3, `${s1} / ${s2} / ${s3}`);
  ok('the steady answer is the steady year compounded five times — not luck, so closeness is fair', Math.abs(C.CC_BANDS.mid - Math.pow(1 + C.ccMean(C.CC.STEADY), 5)) < 1e-12 && C.CC_BANDS.lo < C.CC_BANDS.mid && C.CC_BANDS.mid < C.CC_BANDS.hi);
}

/* ── years drawn per play ── */
{
  const path = (s) => { fresh(); const r = climb(s, () => 55, mid).run.hist.join(); AR.quitGame(); return r; };
  ok('the years are drawn per play: one seed replays, others differ', path(77) === path(77) && path(77) !== path(78) && path(78) !== path(79));
}

/* ── the goals, the sources, the end card ── */
{
  fresh(); const { g } = climb(12, () => 55, mid); const v = plain(g.view());
  ok('the end card leads with the score out of ten and says each part', /\d+(\.\d)? of 10/.test(v) && /Survived: 3/.test(v) && /estimates:/.test(v) && v.includes(AR.PRACTISED.cc));
  AR.quitGame();
  ok('three goals, the estimate one among them, and none ticked by a timid climb', AR.ARCADE_GOALS.cc.length === 3 && AR.ARCADE_GOALS.cc.some((x) => x.id === 'estimate')
    && !AR.ARCADE_GOALS.cc.some((x) => x.check({ reached: false, years: 15, maxCharge: 15, estimates: 2, estIn: 0 }) && x.id !== 'steady'));
  ok('the climb\'s dials are registered (sources.js "climb"), and its line says the steady year the dials give', SOURCES.climb.kind === 'own' && /climbsim/.test(SOURCES.climb.where) && SOURCES.climb.value().includes(`about ${Math.round(C.ccMean(C.CC.STEADY) * 100)} in every 100 a year`));
  const src = readFileSync(new URL('../src/arcade.js', import.meta.url), 'utf8');
  ok('the climb\'s estimate reads its answer from climbsim.js, never a sum of its own', /ccBands\(a\.from\)/.test(src) && /ccClose\(a\.est, b\.mid\)/.test(src) && !/Math\.pow\(1 \+/.test(src));
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
