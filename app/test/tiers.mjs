/* tiers.mjs — G8 three levels and G9 three goals, for every game.

   What a child would complain about, and what the owner decided:
   · every game offers Easy · Standard · Tricky, and Standard is the game as it was;
   · a level turns the mechanic's knobs — and each knob actually changes the game;
   · pay is measured against THAT level's par, so a harder level is a challenge and
     never a bigger payday (a careful player lands near 1.6× par on every level);
   · every game has three named goals, ticked from a real run, that pay nothing.

   Run: node test/tiers.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
globalThis.Image = class {};
const { R } = await import('../src/runtime.js');
const sim = await import('../src/sim.js');
const JT = await import('../src/jobtable.js');
const AR = await import('../src/arcade.js');
const { startJobGame } = await import('../src/jobgames.js');

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nThree levels and three goals · every game\n' + '─'.repeat(56));

R.s = sim.newState(); R.s.kids.push(sim.newChild('Asha', 'builder', 'INR'));
R.render = () => {};
const K = () => R.s.kids[0];
/* every run in here is replayable: the dice are seeded */
let seed = 1;
const reseed = (n) => { seed = n; };
Math.random = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

const T = JT.TIER_IDS;
ok(T.join() === 'easy,standard,tricky' && T.every((t) => JT.TIER_NAME[t]), 'the three levels are Easy · Standard · Tricky, each with a name');

/* ── the tables ─────────────────────────────────────────────────────────── */
const arcadeIds = AR.GAMES.map((g) => g.id).filter((id) => !AR.TIERLESS[id]);
ok(Object.keys(AR.TIERLESS).join() === 'mn', 'only Main Street is without levels, and it says why', JSON.stringify(AR.TIERLESS));
{
  const bad = arcadeIds.filter((id) => {
    const t = AR.ARCADE_TIERS[id];
    return !t || T.some((k) => !t[k] || !(t[k].par > 0) || !t[k].says);
  });
  ok(!bad.length, `every arcade game (${arcadeIds.length}) has all three levels, each with a par and a line saying what changes`, bad.join(','));
}
{
  const kinds = Object.keys(JT.JOB_TIERS);
  ok(kinds.sort().join() === 'runner,stack,sweep,trim', 'every job mechanic has a level table');
  const bad = Object.keys(JT.JOB_GAME).filter((id) => T.some((t) => !(JT.jobPar(id, t) > 0) || !JT.jobKnobs(id, t) || !JT.JOB_TIER_SAYS[JT.JOB_GAME[id].kind][t]));
  ok(!bad.length, `every job (${Object.keys(JT.JOB_GAME).length}) has three levels, each with its own par`, bad.join(','));
  ok(Object.keys(JT.JOB_GAME).every((id) => JT.jobPar(id, 'standard') === JT.JOB_GAME[id].par), 'a job\'s Standard par is the par it always had');
}

/* ── Standard is the game as it was ─────────────────────────────────────── */
const same = (a, b) => Object.keys(b).every((k) => a[k] === b[k]);
ok(same(JT.JOB_TIERS.stack.standard, { speed: 1, snap: 5 }) && same(JT.JOB_TIERS.trim.standard, { gap: 1, heavy: 0, limit: 42 })
  && same(JT.JOB_TIERS.sweep.standard, { fall: 1, spawn: 1, cap: 0.34, reach: 24 }) && same(JT.JOB_TIERS.runner.standard, { speed: 1, spawn: 1, dog: 1 }),
  'the job mechanics\' Standard knobs are today\'s numbers');
const S = (id) => AR.ARCADE_TIERS[id].standard;
ok(same(S('cr'), { fall: 1, spawn: 1, coins: 5, min: 2, max: 4, help: 0.55 }) && same(S('nw'), { n: 0, clock: 0 }) && same(S('ss'), { n: 0, clock: 0 })
  && same(S('bb'), { pot: 1, first: null }) && same(S('cc'), { charge: 1, target: 420 }) && same(S('sr'), { spawn: 1, patience: 9000 })
  && same(S('st'), { every: 3400, shout: 11, drift: 0.0022 }) && same(S('mc'), { shock: 1, crash: 1 }) && S('tt').set === 'standard' && S('sn').set === 'standard',
  'the arcade\'s Standard knobs are today\'s numbers');
ok(JSON.stringify(AR.TT_SETS.standard) === JSON.stringify({ monthly: [15, 25, 30, 40, 60, 12, 20], weekly: [8, 15, 25], compare: [45, 480] })
  && AR.SN_SETS.standard.map((r) => `${r.p}/${r.r}/${r.y}`).join() === '100/0.1/10,100/0.07/20,500/0.05/10,1000/0.1/20,200/0.08/30,100/0.1/30',
  'the drills\' Standard numbers are the ones they always asked');
ok(arcadeIds.every((id) => !('par' in S(id)) || S(id).par > 0) && AR.ARCADE_TIERS.mc.standard.par > 0 && T.every((t) => AR.ARCADE_TIERS.mc[t].par > 0),
  'the Market Cup\'s par on every level is Boring Bella\'s own (positive) cup score there', T.map((t) => AR.ARCADE_TIERS.mc[t].par).join('/'));

/* ── a level is remembered, per game, on the child ──────────────────────── */
{
  const c = K();
  ok(JT.tierOf(c, 'cr') === 'standard', 'a game never played opens on Standard');
  ok(JT.setTier(c, 'cr', 'tricky') && JT.tierOf(c, 'cr') === 'tricky' && JT.tierOf(c, 'nw') === 'standard', 'picking Tricky is remembered for that game only');
  ok(!JT.setTier(c, 'cr', 'impossible') && JT.tierOf(c, 'cr') === 'tricky', 'a level that does not exist is refused');
  ok(JSON.parse(JSON.stringify(R.s)).kids[0].tiers.cr === 'tricky', 'the level is on the child, so it is saved with the household');
  JT.setTier(c, 'cr', 'standard');
}

/* ── every knob has an effect (a number the game ignores is worse than a wrong one) ── */
{
  const v = {};
  for (const t of T) { const g = startJobGame('crates', () => {}, { tier: t }); v[t] = g.__st().v; }
  ok(v.easy < v.standard && v.standard < v.tricky && Math.abs(v.standard - 0.11) < 1e-9, 'stack: the swing is slower on Easy, faster on Tricky, and Standard\'s is today\'s', JSON.stringify(v));
  const shift = startJobGame('crates', () => {});
  ok(shift.__st().picking && !shift.__st().go, 'a shift opened the ordinary way waits on the level picker before its 3-2-1');
  shift.act('jgTier', 'tricky'); ok(shift.__st().tier === 'tricky' && K().tiers.crates === 'tricky', 'picking a level on the shift sets it, and remembers it on the child');
  shift.key({ key: '1' }); ok(shift.__st().tier === 'easy', 'the picker answers the keyboard: 1 is Easy');
  shift.key({ key: 'ArrowRight' }); ok(shift.__st().tier === 'standard', '→ steps a level up');
  shift.key({ key: 'Enter' }); for (let i = 0; i < 200; i++) shift.__tick(16);
  ok(!shift.__st().picking && shift.__st().go, 'Enter starts the shift: the 3-2-1 runs and then it is live');
  /* trim: a lean that lurched on Standard does not on Easy (the limit is the level's) */
  const lim = {};
  for (const t of T) { const g = startJobGame('cargo', () => {}, { tier: t }); lim[t] = g.st.limit; }
  ok(lim.easy > lim.standard && lim.standard > lim.tricky && lim.standard === 42, 'trim: how far she leans before she lurches follows the level', JSON.stringify(lim));
  /* sweep and runner: count what arrives in the same ten seconds */
  const arrive = (id, t, field) => { reseed(9); const g = startJobGame(id, () => {}, { tier: t }); for (let i = 0; i < 3000 / 16 + 160; i++) g.__tick(16); return field(g.st); };
  const fall = T.map((t) => arrive('sweep', t, (s) => s.bits.reduce((m, b) => Math.max(m, b.vy), 0)));
  ok(fall[0] < fall[1] && fall[1] < fall[2], 'sweep: things fall slower on Easy and faster on Tricky', fall.map((x) => x.toFixed(3)).join(' / '));
  const pace = T.map((t) => arrive('flyers', t, (s) => s.dist));
  ok(pace[0] < pace[1] && pace[1] < pace[2], 'runner: the street runs slower on Easy and faster on Tricky', pace.map((x) => Math.round(x)).join(' / '));
}
{
  /* Change Rush: the same seed, three levels — amounts, coins and speed all differ */
  const look = (t) => { AR.startGame('cr', 77, t); const g = R.game; const y0 = []; for (let i = 0; i < 40; i++) g.advance(16); return { target: g.st.target, y: g.st.drops[0] ? g.st.drops[0].y : 0 }; };
  const e = look('easy'), s = look('standard'), k = look('tricky');
  ok(e.y < s.y && s.y < k.y, 'Change Rush: coins fall slower on Easy and faster on Tricky', `${e.y.toFixed(1)} / ${s.y.toFixed(1)} / ${k.y.toFixed(1)}`);
  let maxE = 0, minK = 1e9;
  for (let sd = 1; sd < 40; sd++) { AR.startGame('cr', sd, 'easy'); maxE = Math.max(maxE, R.game.st.target); AR.startGame('cr', sd, 'tricky'); minK = Math.min(minK, R.game.st.target); }
  ok(maxE <= 3 * 10 && minK >= 3, 'Change Rush: Easy asks for small amounts from fewer coin kinds, Tricky for at least three coins', `easy max ${maxE}, tricky min ${minK}`);
  /* the two-choice cards: Easy is a shorter round, Tricky has a clock */
  AR.startGame('nw', null, 'easy'); const ne = R.game; AR.quitGame();
  AR.startGame('nw', null, 'standard'); const ns = R.game; AR.quitGame();
  ok(ne.view().includes('1 / 8') && ns.view().includes('1 / 12'), 'Needs vs Wants: eight cards on Easy, all twelve on Standard');
  AR.startGame('ss', null, 'tricky'); const nt = R.game;
  ok(/class="tclock"/.test(nt.view()) && !/class="tclock"/.test(ns.view()), 'Scam Spotter on Tricky shows a draining clock; Standard has none');
  AR.quitGame();
  /* drills: the numbers change with the level, and every question still has four different answers */
  const qs = (id, t) => { AR.startGame(id, null, t); const g = R.game; AR.quitGame(); return g.qs; };
  for (const id of ['tt', 'sn']) {
    const sets = T.map((t) => qs(id, t));
    const distinct = sets.every((q) => q.every((x) => new Set(x.opts).size === x.opts.length && x.a >= 0 && x.a < x.opts.length));
    ok(distinct && sets[0][0].q !== sets[1][0].q && sets[1][0].q !== sets[2][0].q && sets.every((q) => q.length === sets[1].length),
      `${id}: each level asks different numbers, the same number of questions, and every question has four distinct answers`);
  }
  /* Budget Blitz: a tight month is tighter, and still never impossible */
  const pot = (t) => { AR.startGame('bb', null, t); const g = R.game; AR.quitGame(); return g.st.left; };
  ok(pot('easy') > pot('standard') && pot('standard') > pot('tricky'), 'Budget Blitz: a roomier month on Easy, a tighter one on Tricky', `${pot('easy')} / ${pot('standard')} / ${pot('tricky')}`);
  /* Stall Rush and Market Storm: customers wait less, the panic climbs faster */
  const stall = (t) => { AR.startGame('sr', null, t); const g = R.game; for (let i = 0; i < 160; i++) g.advance(16); const p = g.st.q[0] ? g.st.q[0].patience : 1; AR.quitGame(); return p; };
  ok(stall('easy') > stall('standard') && stall('standard') > stall('tricky'), 'Stall Rush: patience runs out slower on Easy, faster on Tricky');
  const panic = (t) => { AR.startGame('st', null, t); const g = R.game; for (let i = 0; i < 100; i++) g.advance(16); const p = g.st.panic; AR.quitGame(); return p; };
  ok(panic('easy') < panic('standard') && panic('standard') < panic('tricky'), 'Market Storm: the panic climbs slower on Easy, faster on Tricky');
  AR.startGame('cc', null, 'tricky'); ok(R.game.kn.charge > 1 && R.game.kn.target === 480, 'Compound Climb on Tricky: a faster charge and a higher line'); AR.quitGame();
}

/* ── every job paints, at every level, on the picker and mid-shift ─────────
   The frame loop swallows a drawing fault so the clock keeps running — which also
   means a fault would leave a blank canvas and nobody would hear about it. */
{
  const grad = { addColorStop() {} };
  const ctx = new Proxy({}, { get: (o, k) => (k in o ? o[k] : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? () => grad
    : k === 'measureText' ? () => ({ width: 40 }) : k === 'getImageData' ? () => ({ data: [] }) : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const faults = [];
  for (const id of Object.keys(JT.JOB_GAME)) for (const t of T) {
    const g = startJobGame(id, () => {});
    try {
      g.act('jgTier', t); g.__paint(ctx);
      g.act('jgStart'); for (let i = 0; i < 400; i++) { g.__tick(16); if (i % 50 === 0) g.__paint(ctx); }
      g.st.score = 7; g.st.end(); g.__tick(16); g.__paint(ctx);
    } catch (e) { faults.push(`${id}/${t}: ${e.message}`); }
  }
  ok(!faults.length, 'every job paints without a fault at every level — on the picker, mid-shift and on SHIFT DONE', faults.slice(0, 3).join(' | '));
}

/* ── pay is measured against the level's own par ────────────────────────── */
{
  for (const t of T) {
    const g = startJobGame('crates', () => {}, { tier: t });
    for (let i = 0; i < 200; i++) g.__tick(16);
    g.st.score = JT.jobPar('crates', t); g.st.end();
    for (let i = 0; i < 200 && !g.st.done; i++) g.__tick(16);
    ok(g.st.done && Math.abs(g.st.quality - 1) < 1e-9, `a shift at exactly par on ${t} is quality 1 — the same pay as par on any level`, `par ${JT.jobPar('crates', t)}`);
  }
}

/* ── the careful player lands near 1.6× par on every level (replayed, seeded) ── */
{
  const gauss = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
  const play = (id, tier) => {
    const g = startJobGame(id, () => {}, { tier });
    let armed = false, e = 0, wait = 0, head = -1, t = 0, next = 0;
    for (let i = 0; i < 6000; i++) {
      const p = g.__st(); if (p.done) break; t += 16;
      if (p.go) {
        if (p.kind === 'stack') {
          if (p.falling) armed = false;
          else { if (!armed) { armed = true; e = gauss() * 14; } const d = (p.x - (p.topX + p.dir * p.v * e)) * p.dir; if (d >= 0 && d < p.v * 24 + 0.01) g.__key(' '); }
        } else if (p.kind === 'trim') {
          if (p.queue > 0) {
            if (head !== p.loads) { head = p.loads; wait = Math.max(120, 300 + gauss() * 80); }
            wait -= 16;
            if (wait <= 0) { g.__key(p.tilt > 0 ? 'ArrowLeft' : p.tilt < 0 ? 'ArrowRight' : 'ArrowLeft'); head = -1; }
          }
        } else if (p.kind === 'sweep') { if (t >= next) { next = t + 90; if (p.nearest != null) g.__point(p.nearest + gauss() * 3, 200); } }
        else if (p.kind === 'runner') {
          if (t >= next) { next = t + 150; if (p.want != null) while (p.want !== g.__st().lane) { const l = g.__st().lane; g.__key(p.want < l ? 'ArrowUp' : 'ArrowDown'); if (g.__st().lane === l) break; } }
        }
      }
      g.__tick(16);
    }
    return g.st.score / JT.jobPar(id, tier);
  };
  for (const id of ['crates', 'cargo', 'sweep', 'flyers']) {
    const r = T.map((t) => { reseed(7); let s = 0; for (let k = 0; k < 6; k++) s += play(id, t); return s / 6; });
    ok(r.every((x) => x >= 1.3 && x <= 1.95), `${JT.JOB_GAME[id].kind}: a careful shift is ~1.6× par on Easy, Standard and Tricky alike`, r.map((x) => x.toFixed(2) + '×').join(' / '));
  }
}

/* ── goals: three per game, decision-based, a record that pays nothing ──── */
{
  const tables = arcadeIds.map((id) => [id, AR.ARCADE_GOALS[id]]).concat(Object.keys(JT.JOB_GOALS).map((k) => ['job:' + k, JT.JOB_GOALS[k]]));
  const bad = tables.filter(([, t]) => !t || t.length !== 3 || new Set(t.map((g) => g.id)).size !== 3 || t.some((g) => !g.name || typeof g.check !== 'function'));
  ok(!bad.length, `every game (${tables.length} tables) has exactly three named goals, each with a check`, bad.map((b) => b[0]).join(','));
  ok(Object.keys(JT.JOB_GAME).every((id) => JT.jobGoals(id).length === 3), 'every job reaches its mechanic\'s three goals');
  /* no goal is met by doing nothing */
  const nothing = { right: 0, n: 8, exact: 0, overpays: 0, firstRun: 0, finished: false, needWrong: 8, wantWrong: 8, scamWrong: 5, safeWrong: 5,
    mustMissed: 5, left: 0, pot: 100, reached: false, years: 3, falls: 2, maxCharge: 100, profit: 0, lost: 4, wrong: 0, served: 0, held: false, maxPanic: 100,
    spreadWeeks: 0, weeks: 6, churn: 400, beatBella: false, weeklyWrong: 3, compareRight: false, simple: 2, longWrong: 2,
    bestCombo: 0, squares: 0, misses: 3, lurches: 3, bestChain: 0, caught: 0, dogs: 3, missed: 20, posted: 0 };
  const free = tables.flatMap(([id, t]) => t.filter((g) => g.check(nothing)).map((g) => id + '.' + g.id));
  ok(!free.length, 'no goal is ticked by a run where nothing went right', free.join(','));
  const c = K(), wallet = c.money.wallet, xp = c.learn.xp;
  const first = JT.earnGoals(c, 'cr', AR.ARCADE_GOALS.cr, { exact: 6, overpays: 0, firstRun: 6, finished: true });
  const again = JT.earnGoals(c, 'cr', AR.ARCADE_GOALS.cr, { exact: 6, overpays: 0, firstRun: 6, finished: true });
  ok(first.length === 3 && first.every((g) => g.fresh) && again.every((g) => !g.fresh), 'a goal is fresh the first time, then simply kept');
  ok(c.money.wallet === wallet && c.learn.xp === xp, 'goals award nothing: no money, no XP');
  JT.earnGoals(c, 'cr', AR.ARCADE_GOALS.cr, { exact: 0, overpays: 3, firstRun: 0, finished: true });
  ok(Object.keys(JT.goalsMet(c, 'cr')).length === 3, 'a later bad round never takes a tick away');
  c.goals = {};
}
{
  /* goals from real runs: Change Rush played carefully, and a careful shift */
  const careful = (st) => {
    const need = st.target - st.got, near = (d) => d.y > 300 - 70;
    const bad = new Set(st.drops.filter((d) => near(d) && d.v > need).map((d) => d.lane));
    const fits = st.drops.filter((d) => d.v <= need && !bad.has(d.lane) && d.y < 290).sort((a, b) => b.y - a.y)[0];
    if (fits) return fits.lane;
    if (!bad.has(st.lane)) return st.lane;
    return [0, 1, 2, 3].find((l) => !bad.has(l)) ?? st.lane;
  };
  AR.startGame('cr', 5, 'standard'); const g = R.game;
  for (let i = 0; i < 4000 && !g.st.done; i++) { g.st.lane = careful(g.st); g.advance(16); }
  const met = JT.goalsMet(K(), 'cr');
  ok(g.st.done && met.exact3 && g.st.exact >= 3, 'a careful Change Rush round ticks "Exact three times" from the run itself', `${g.st.exact} exact, ${g.st.overpays} overpaid`);
  ok(/data-goal="exact3"/.test(g.view()) && /class="met/.test(g.view()), 'and the end card shows the goals with their ticks');
  const intro = AR.introView('cr');
  ok(/data-act="gTier"/.test(intro) && (intro.match(/class="tierbtn/g) || []).length === 3 && /data-goal="exact3"/.test(intro) && /class="met/.test(intro),
    'the title card carries the three-level picker and the goals, ticked');
  AR.quitGame();
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
