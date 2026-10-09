/* shifts.mjs — T13, the Shift engine (docs/12 §3.1): one frame, four money templates.

   What a child (or a parent) would complain about, turned into checks:
   · a shift that never ends, or a HUD that freezes;
   · a job a random masher can do as well as a careful child (Trim scored 69% of perfect);
   · pay that follows reflexes, or that pays twice a day;
   · the same shift every time — or a shift that cannot be replayed to be checked;
   · an end card that says what the last arcade game practised;
   · a template that answers only to a keyboard, or only to a finger;
   · a sum the game marks wrong that is right (every answer is proved here, in every currency).

   Run: node test/shifts.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
globalThis.Image = class {};
const { R } = await import('../src/runtime.js');
const sim = await import('../src/sim.js');
const JT = await import('../src/jobtable.js');
const JG = await import('../src/jobgames.js');
const fmt = await import('../src/fmt.js');
const { JOBS } = await import('../src/content.js');
const { rng } = await import('../src/ui.js');
const { startJobGame, TEMPLATES, fewest, tillPieces, HOLD_MS } = JG;

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nThe Shift engine · count, change, ledger, route\n' + '─'.repeat(56));

R.s = sim.newState(); R.s.kids.push(sim.newChild('Asha', 'builder', 'INR'));
R.render = () => {};
const K = () => R.s.kids[0];
let seed = 3;
Math.random = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const T = JT.TIER_IDS, KINDS = JT.SHIFT_KINDS, N = JT.SHIFT_ITEMS;
const ONE = { count: 'crates', change: 'counter', ledger: 'books', route: 'flyers' };
const fresh = (id) => { delete K().jobs[id]; };

/* ── the map: every job the town has is a shift, on one of four templates ── */
{
  const ids = Object.keys(JT.JOB_GAME);
  ok(JOBS.every((j) => JT.JOB_GAME[j.id]) && ids.length === JOBS.length, `every one of the ${JOBS.length} jobs is a shift, under its own id (saved days and Town links still work)`, ids.join(','));
  const by = Object.fromEntries(KINDS.map((k) => [k, ids.filter((id) => JT.JOB_GAME[id].kind === k)]));
  ok(KINDS.every((k) => by[k].length >= 3) && ids.every((id) => KINDS.includes(JT.JOB_GAME[id].kind)), 'four templates, each with three jobs or more', JSON.stringify(by));
  ok(['crates', 'haul'].every((id) => by.count.includes(id)) && ['counter', 'runner'].every((id) => by.change.includes(id))
    && ['books', 'nets'].every((id) => by.ledger.includes(id)) && ['flyers', 'errands', 'sweep'].every((id) => by.route.includes(id)), 'the spec\'s own pairings hold (§3.1)');
  ok(KINDS.every((k) => JT.SHIFT_PRACTISED[k] && JT.KIND_WORD[k] && JT.JOB_GOALS[k].length === 3 && T.every((t) => JT.JOB_TIERS[k][t] && JT.JOB_TIER_SAYS[k][t])),
    'every template has its practised line, its name, three goals and all three levels');
}

/* ── drivers: one loop, three ways to put an answer in ─────────────────── */
function apply(g, p, inp, how) {
  if (how === 'direct') return g.__answer(inp);
  const it = p.item;
  if (how === 'keys') {
    if (p.kind === 'count') g.key({ key: String(inp) });
    else if (p.kind === 'change') { inp.forEach((v) => g.key({ key: String(it.D.indexOf(v) + 1) })); g.key({ key: 'Enter' }); }
    else if (p.kind === 'ledger') { if (it.mode === 'check') g.key({ key: 'abcd'[inp] }); else { String(inp).split('').forEach((d) => g.key({ key: d })); g.key({ key: 'Enter' }); } }
    else g.key({ key: 'abcde'[inp] });
    return;
  }
  /* touch: the same buttons a finger taps (their data-act and data-arg) */
  if (p.kind === 'count' || p.kind === 'route' || (p.kind === 'ledger' && it.mode === 'check')) g.act('jgPick', String(inp));
  else if (p.kind === 'change') { inp.forEach((v) => g.act('jgCoin', String(v))); g.act('jgGive'); }
  else { String(inp).split('').forEach((d) => g.act('jgDigit', d)); g.act('jgEnter'); }
}
function drive(g, choose, { dt = 16, how = 'direct', cont = true, maxMs = 400000, onAnswer } = {}) {
  let t = 0;
  while (!g.st.done && t < maxMs) {
    const p = g.__st();
    if (p.hold && cont) { if (how === 'touch') g.act('jgNext'); else g.key({ key: 'Enter' }); }
    else if (p.ready) { const inp = choose(p, g); if (inp !== undefined) { const before = p.answered; apply(g, p, inp, how); if (onAnswer) onAnswer(before, g); } }
    g.__tick(dt); t += dt;
  }
  return t;
}
const perfect = (p) => p.solution;

/* ── every template's shift ends: on twelve items, and on the clock ────── */
for (const k of KINDS) {
  const id = ONE[k];
  for (const t of T) {
    fresh(id);
    const g = startJobGame(id, () => {}, { tier: t, seed: 41 });
    const ms = drive(g, perfect);
    ok(g.st.done && g.st.right === N && g.st.answered === N && ms < JT.SHIFT_MS, `${k}/${t}: a careful shift ends on its twelfth item, twelve right`, `${g.st.right}/${N} in ${(ms / 1000).toFixed(1)} s`);
  }
  /* nobody touches it: the clock ends it, at ninety seconds of wall time, at 60 fps and at 4 fps */
  for (const dt of [16, 250]) {
    fresh(id);
    const g = startJobGame(id, () => {}, { tier: 'standard', seed: 42 });
    let t = 0; while (!g.st.over && t < 200000) { g.__tick(dt); t += dt; }
    const end = t; while (!g.st.done && t < 210000) { g.__tick(dt); t += dt; }
    ok(g.st.done && Math.abs(end - JT.SHIFT_MS) <= JT.SHIFT_MS * 0.05 && g.st.answered === 0 && g.st.won === 0,
      `${k}: an untouched shift ends on the clock at 90 s of wall time (${Math.round(1000 / dt)} fps), and pays nothing`, `${(end / 1000).toFixed(2)} s`);
  }
  /* a wrong answer, then the child walks away: the hold waits, then lets go, and the shift still ends */
  {
    fresh(id);
    const g = startJobGame(id, () => {}, { tier: 'standard', seed: 43 });
    const wrong = (p) => (p.kind === 'change' ? [p.item.D[0]].concat(p.solution) : p.kind === 'ledger' ? (p.item.mode === 'check' ? (p.solution + 1) % 4 : p.solution + 1) : (p.solution + 1) % p.item.choices);
    g.__tick(16); g.__answer(wrong(g.__st()));
    while (g.__st().anim) g.__tick(16);    /* a route is walked before it is judged */
    let t = 0; const held = g.__st().hold; while (g.__st().hold && t < 60000) { g.__tick(100); t += 100; }
    const left = g.__st().left;
    let t2 = 0; while (!g.st.done && t2 < 200000) { g.__tick(100); t2 += 100; }
    ok(held && Math.abs(t - HOLD_MS) <= 100 && left > JT.SHIFT_MS - JG.WALK_MS - 500 && g.st.done, `${k}: a wrong answer holds with its correction, the clock waits ${HOLD_MS / 1000} s at most, and the shift still ends`, `held ${t} ms, clock ${Math.round(left / 1000)} s`);
  }
}

/* ── the HUD updates on every item (the DOM HUD, and the canvas dots) ──── */
for (const k of KINDS) {
  const id = ONE[k], seen = [], bad = [];
  /* replay the same shift step by step, reading the HUD after each item settles */
  fresh(id);
  const h = startJobGame(id, () => {}, { tier: 'standard', seed: 7 });
  const r2 = rng(99); let rights = 0, items = 0;
  const readH = () => { const v = h.view(); const n = (x) => +((v.match(new RegExp(`data-hud="${x}" data-v="(\\d+)"`)) || [])[1]); return { item: n('item'), right: n('right'), clock: (v.match(/id="shiftClock"[^>]*>([\d:]+)</) || [])[1], v }; };
  let prev = readH();
  if (prev.item !== 1 || prev.right !== 0) bad.push('start ' + JSON.stringify(prev));
  for (let guard = 0; guard < 40000 && !h.st.done && !h.st.over; guard++) {
    const p = h.__st();
    if (p.hold) h.key({ key: 'Enter' });
    else if (p.ready) {
      const inp = r2() < 0.5 ? p.solution : h.__random(r2);
      h.__answer(inp);
      while (h.__st().anim) h.__tick(16);
      const now = readH(); items++; if (h.st.results[items - 1]) rights++;
      if (now.right !== rights) bad.push(`item ${items}: right shows ${now.right}, is ${rights}`);
      if (h.st.results.length !== items) bad.push(`item ${items}: the dots show ${h.st.results.length}`);
      /* settle to the next item */
      while ((h.__st().hold || h.__st().anim || !h.__st().ready) && !h.st.over && !h.st.done) { if (h.__st().hold) h.key({ key: 'Enter' }); h.__tick(16); }
      const after = readH();
      if (!h.st.over && after.item !== items + 1) bad.push(`after item ${items}: item shows ${after.item}`);
      const want = `${Math.floor(Math.ceil(h.st.left / 1000) / 60)}:${String(Math.ceil(h.st.left / 1000) % 60).padStart(2, '0')}`;
      if (!h.st.over && after.clock !== want) bad.push(`after item ${items}: clock shows ${after.clock}, is ${want}`);
      prev = after; seen.push(after.item);
      continue;
    }
    h.__tick(16);
  }
  if (!(h.st.left < JT.SHIFT_MS - 1000)) bad.push('the clock never moved');
  ok(!bad.length && items === N && h.st.results.length === N, `${k}: the HUD moves on every item — item n of 12, right so far, and the clock`, bad.slice(0, 3).join(' | ') || `items ${seen.join(',')}`);
}

/* ── a random player scores ≤ 30% on every template, at every level ────── */
{
  const res = {};
  for (const k of KINDS) for (const t of T) {
    const id = ONE[k]; let tot = 0; const n = 120;
    for (let s = 0; s < n; s++) {
      fresh(id);
      const g = startJobGame(id, () => {}, { tier: t, seed: 1000 + s });
      const r = rng(5000 + s);
      drive(g, () => g.__random(r), { dt: 50 });
      tot += g.st.right / N;
    }
    res[`${k}/${t}`] = tot / n;
  }
  for (const k of KINDS) ok(T.every((t) => res[`${k}/${t}`] <= 0.30), `${k}: a random player scores ≤ 30% (120 shifts a level)`, T.map((t) => `${t} ${(res[`${k}/${t}`] * 100).toFixed(1)}%`).join(' · '));
  /* the obvious shortcuts are no better than guessing */
  const habit = (k, t, choose) => { let tot = 0; for (let s = 0; s < 120; s++) { fresh(ONE[k]); const g = startJobGame(ONE[k], () => {}, { tier: t, seed: 3000 + s }); drive(g, choose, { dt: 50 }); tot += g.st.right / N; } return tot / 120; };
  const allHere = T.map((t) => habit('count', t, () => 0));
  ok(allHere.every((x) => x <= 0.30), 'count: "it is all here" every time scores ≤ 30%', allHere.map((x) => (x * 100).toFixed(1) + '%').join(' / '));
  const fastest = T.map((t) => habit('route', t, (p) => p.item.opts.reduce((b, o, j, a) => (o.min < a[b].min ? j : b), 0)));
  const free = T.map((t) => habit('route', t, (p) => p.item.opts.reduce((b, o, j, a) => (o.fare < a[b].fare ? j : b), 0)));
  ok(fastest.every((x) => x <= 0.30) && free.every((x) => x <= 0.30), 'route: "always the fastest" and "always the cheapest" each score ≤ 30%', `fastest ${fastest.map((x) => (x * 100).toFixed(0) + '%').join('/')} · cheapest ${free.map((x) => (x * 100).toFixed(0) + '%').join('/')}`);
  const greedyAny = T.map((t) => habit('change', t, (p) => { const it = p.item; const out = []; let left = it.change; const ones = it.D[0]; while (left > 0) { out.push(ones); left -= ones; } return out.slice(0, 12); }));
  ok(greedyAny.every((x) => x <= 0.30), 'change: the right amount in the smallest coins (not the fewest) scores ≤ 30%', greedyAny.map((x) => (x * 100).toFixed(0) + '%').join(' / '));
  console.log('     random-player accuracy: ' + Object.entries(res).map(([k, v]) => `${k} ${(v * 100).toFixed(1)}%`).join(' · '));
}

/* ── pay is accuracy, through sim.doJob, once a day ─────────────────────── */
{
  const id = 'books', c = K();
  const base = sim.jobsToday(c).find((x) => x.id === id) ? sim.jobsToday(c).find((x) => x.id === id).amt : fmt.price(JOBS.find((j) => j.id === id).units);
  const paid = {};
  for (const want of [0, 3, 6, 8, 10, 12]) {
    fresh(id);
    const g = startJobGame(id, () => {}, { tier: 'standard', seed: 77 });
    let n = 0;
    const w0 = c.money.wallet;
    drive(g, (p) => { const right = n++ < want; return right ? p.solution : (p.item.mode === 'check' ? (p.solution + 1) % 4 : p.solution + 1); });
    paid[want] = { won: g.st.won, delta: c.money.wallet - w0, q: g.st.quality, acc: g.st.accuracy, right: g.st.right, txn: (c.money.txns || [])[0] };   /* newest first */
  }
  const expect = (k) => (k === 0 ? 0 : Math.max(1, Math.round(base * Math.max(sim.JOB_FLOOR, Math.min(sim.JOB_CEIL, k / JT.JOB_PAR)))));
  ok(Object.entries(paid).every(([k, p]) => p.right === +k && p.won === expect(+k) && p.delta === p.won), 'a shift pays sim.doJob\'s wage for its accuracy: right/12 against par 8, clamped (and nothing right is nothing paid)',
    Object.entries(paid).map(([k, p]) => `${k}→${p.won}`).join(' '));
  ok(paid[12].won > paid[10].won && paid[10].won > paid[8].won && paid[8].won > paid[6].won && paid[6].won >= paid[3].won && paid[3].won > 0, 'more right pays more, and a poor shift still pays the floor');
  ok(Math.abs(paid[12].q - 1.5) < 1e-9 && Math.abs(paid[8].q - 1) < 1e-9 && Math.abs(paid[6].acc - 0.5) < 1e-9, 'quality is accuracy against par: 12 right is 1.5, 8 right is 1.0');
  ok(paid[8].txn && paid[8].txn.cat === 'job' && /Do Nana's books/.test(paid[8].txn.label), 'the wage lands in the wallet as that job\'s own line', JSON.stringify(paid[8].txn));
  /* speed is not pay: the same answers, slowly, pay the same */
  fresh(id); const fast = startJobGame(id, () => {}, { tier: 'standard', seed: 78 }); drive(fast, perfect, { dt: 16 });
  fresh(id); const slow = startJobGame(id, () => {}, { tier: 'standard', seed: 78 });
  let wait = 0; drive(slow, (p) => (++wait % 200 === 0 ? p.solution : undefined), { dt: 30 });
  ok(fast.st.won === slow.st.won && slow.st.right === N, 'a slow careful shift pays exactly what a fast one does (no reflex in the wage)', `${fast.st.won} vs ${slow.st.won}, slow took ${(JT.SHIFT_MS - slow.st.left) / 1000 | 0} s`);
  /* once a day: the second shift is practice and says so */
  const again = startJobGame(id, () => {}, { tier: 'standard', seed: 79 });
  const w1 = c.money.wallet; drive(again, perfect);
  const card = again.view();
  ok(again.st.won === 0 && c.money.wallet === w1 && /Paid shift used for today: this one is practice, and it still counts toward your goals/.test(card) && !/Earned/.test(card), 'a job pays once a day; the second shift is practice, and its end card says so in the shared words (docs/12 §1.4)');
  /* §1.7 · the level rule on a shift's card: offered, never applied by itself (ported from the
     hotfix's job checks, which were written against the reflex jobs) */
  {
    const t0 = JT.tierOf(K(), id);
    fresh(id); const up = startJobGame(id, () => {}, { tier: 'standard', seed: 81 }); drive(up, perfect);
    const v = up.view(), offered = /data-act="jgLevel" data-arg="tricky"/.test(v) && JT.tierOf(K(), id) === 'standard';
    up.__key('l');
    ok(offered && JT.tierOf(K(), id) === 'tricky', 'a shift with every one right offers the next level on its card, and only the child\'s L (or tap) takes it', `offered ${offered}, now ${JT.tierOf(K(), id)}`);
    fresh(id); const down = startJobGame(id, () => {}, { tier: 'standard', seed: 82 });
    drive(down, (p) => (p.item.mode === 'check' ? (p.solution + 1) % 4 : p.solution + 1));
    const dv = down.view();
    ok(/data-act="jgLevel" data-arg="easy"/.test(dv) && JT.tierOf(K(), id) === 'tricky', 'a shift under half of par offers one level down, and nothing changes until the child takes it', (dv.match(/lvloffer[^<]*/) || [''])[0]);
    JT.setTier(K(), id, t0);
  }
  ok(paid[0].won === 0 && /Nothing right this shift/.test((() => { fresh(id); const z = startJobGame(id, () => {}, { tier: 'standard', seed: 80 }); drive(z, (p) => (p.item.mode === 'check' ? (p.solution + 1) % 4 : p.solution + 1)); return z.view(); })()), 'a shift with nothing right pays nothing, and the card says why');
  /* the level never changes the wage for the same accuracy */
  const lv = T.map((t) => { fresh(id); const g = startJobGame(id, () => {}, { tier: t, seed: 81 }); drive(g, perfect); return g.st.won; });
  ok(lv.every((x) => x === lv[0]), 'twelve right pays the same on Easy, Standard and Tricky', lv.join(' / '));
}

/* ── seeds: every shift differs, and a seed replays exactly ─────────────── */
{
  const bad = [];
  for (const id of Object.keys(JT.JOB_GAME)) for (const t of T) {
    const a = startJobGame(id, () => {}, { tier: t }), b = startJobGame(id, () => {}, { tier: t });
    const c2 = startJobGame(id, () => {}, { tier: t, seed: a.st.seed });
    const js = (g) => JSON.stringify(g.st.items);
    if (a.st.seed === b.st.seed || js(a) === js(b)) bad.push(`${id}/${t}: two plays are the same`);
    if (js(a) !== js(c2)) bad.push(`${id}/${t}: the seed did not replay`);
  }
  ok(!bad.length, 'every job on every level: two plays draw different content, and the same seed replays it exactly', bad.slice(0, 3).join(' | '));
  /* a replay is the same shift to the end: the same answers make the same record */
  const run = (s) => { fresh('errands'); const g = startJobGame('errands', () => {}, { tier: 'tricky', seed: s }); const r = rng(11); drive(g, (p) => (r() < 0.6 ? p.solution : g.__random(r))); return JSON.stringify([g.st.results, g.st.right, g.st.won]); };
  ok(run(555) === run(555) && run(555) !== run(556), 'a replayed seed, played the same way, ends the same way');
}

/* ── every answer the game marks is proved, in every currency ──────────── */
{
  const bad = []; let n = 0;
  for (const cur of Object.keys(fmt.CURRENCIES)) {
    fmt.setCurrency(cur);
    for (let s = 1; s <= 60; s++) for (const t of T) for (const id of ['crates', 'counter', 'board', 'books', 'nets', 'flyers', 'lamplight']) {
      const g = startJobGame(id, () => {}, { tier: t, seed: s * 31 + 7 });
      for (const it of g.st.items) {
        n++;
        const k = JT.JOB_GAME[id].kind;
        if (k === 'count') { if (it.n !== it.ordered - it.short || it.pos.length !== it.n || it.short >= it.choices || it.n < 1 || (it.packs && it.packs.k * it.packs.m !== it.ordered)) bad.push(`count ${JSON.stringify(it).slice(0, 80)}`); }
        if (k === 'change') {
          const D = tillPieces(JT.JOB_TIERS.change[t].coins).map((p) => p[0]);
          /* brute force: no way to make the change in fewer pieces than the game's answer */
          const min = (a) => { const m = [0]; for (let x = 1; x <= a; x++) m[x] = Math.min(...D.filter((d) => d <= x).map((d) => m[x - d] + 1)); return m[a]; };
          if (it.paid - it.price !== it.change || it.price < 1 || it.best.reduce((a, b) => a + b, 0) !== it.change || it.best.length !== min(it.change) || it.best.some((v) => !D.includes(v))) bad.push(`change ${cur} ${it.price}/${it.paid}/${it.best}`);
        }
        if (k === 'ledger') {
          if (it.mode === 'type') { if (it.answer !== it.prev + it.sign * it.amt || it.answer < 0) bad.push(`ledger ${it.prev}${it.sign}${it.amt}=${it.answer}`); }
          else {
            let prev = it.start; const off = it.lines.map((l) => { const o = prev + l.sign * l.amt !== l.shown; prev = l.shown; return o; });
            if (off.filter(Boolean).length !== 1 || !off[it.wrong] || it.lines.some((l) => l.shown < 0)) bad.push(`check ${JSON.stringify(it.lines)}`);
          }
        }
        if (k === 'route') {
          const on = it.opts.filter((o) => o.min <= it.due), best = Math.min(...on.map((o) => o.fare));
          const tot = it.opts.every((o) => o.min === o.legs.reduce((a, l) => a + l.min, 0) && o.fare === o.legs.reduce((a, l) => a + l.fare, 0));
          if (!tot || on.filter((o) => o.fare === best).length !== 1 || it.opts[it.answer].fare !== best || it.opts[it.answer].min > it.due || on.length === it.opts.length || it.opts.some((o) => o.min === it.due)) bad.push(`route due ${it.due} ${JSON.stringify(it.opts.map((o) => [o.min, o.fare]))}`);
        }
      }
    }
  }
  fmt.setCurrency('INR');
  ok(!bad.length, `every item's answer is proved by the generator (${n} items, every currency): counts, the fewest pieces, balances, the one line out, the one cheapest way on time`, bad.slice(0, 3).join(' | '));
  ok(fewest(38, [1, 2, 5, 10, 20]).join() === '20,10,5,2,1' && fewest(6, [1, 5, 10, 20]).join() === '5,1', 'the fewest-pieces solver gives the change a till would');
  const usd = (() => { fmt.setCurrency('USD'); const p = tillPieces(5); fmt.setCurrency('INR'); return p; })();
  ok(usd.every(([v]) => Number.isInteger(v) && v >= 1), 'the till is whole units in every currency (no "$25" for a quarter)', JSON.stringify(usd));
}

/* ── keyboard AND touch reach every template, and the canvas answers a tap ── */
for (const k of KINDS) {
  const res = {};
  for (const how of ['keys', 'touch']) {
    fresh(ONE[k]);
    const g = startJobGame(ONE[k], () => {}, { tier: 'tricky', seed: 90 });
    drive(g, perfect, { how });
    res[how] = g.st.right;
  }
  ok(res.keys === N && res.touch === N, `${k}: a whole shift played by keyboard alone, and by touch alone, twelve right each`, JSON.stringify(res));
}
{
  /* a wrong answer continues by Enter, by the Continue button, and by a tap on the canvas */
  fresh('flyers');
  const g = startJobGame('flyers', () => {}, { tier: 'standard', seed: 91 });
  const it = g.__st().item, j = (it.answer + 1) % it.choices;
  g.key({ key: 'abcde'[j] }); for (let i = 0; i < 100 && g.__st().anim; i++) g.__tick(16);
  const held = g.__st().hold; g.act('jgNext');
  ok(held && !g.__st().hold && g.__st().i === 1, 'route: the way is walked first, a wrong one holds, and Continue moves on');
  /* the canvas: a tap on a way's tag picks it */
  const g2 = startJobGame('flyers', () => {}, { tier: 'standard', seed: 92 });
  const it2 = g2.__st().item, n2 = it2.opts.length, gap = n2 >= 5 ? 44 : 52, by = 168 + (it2.answer - (n2 - 1) / 2) * gap;
  g2.__point(180, by); for (let i = 0; i < 100 && g2.__st().anim; i++) g2.__tick(16);
  ok(g2.st.right === 1, 'route: a tap on the map, on the way\'s tag, chooses that way');
  const g3 = startJobGame('books', () => {}, { tier: 'standard', seed: 93 });
  while (g3.__st().item.mode !== 'check') { g3.__answer(g3.__st().solution); while (!g3.__st().ready && !g3.st.over) g3.__tick(16); }
  const w = g3.__st().item.wrong; g3.__point(180, 99 + (w + 1) * 34);
  ok(g3.st.results[g3.st.i] === true, 'ledger: a tap on the line that does not add up picks it');
}

/* ── the end card is the shift's own ──────────────────────────────────── */
{
  const AR = await import('../src/arcade.js');
  const bad = [];
  for (const k of KINDS) {
    /* the last arcade game played must not leak its line onto a job's card */
    AR.startGame('cr', 5, 'standard'); AR.quitGame();
    fresh(ONE[k]);
    const g = startJobGame(ONE[k], () => {}, { tier: 'standard', seed: 60 });
    drive(g, perfect);
    const v = g.view();
    if (!v.includes(`<b>You practised:</b> ${JT.SHIFT_PRACTISED[k]}`)) bad.push(k + ': no own practised line');
    if (Object.values(AR.PRACTISED).some((line) => v.includes(line))) bad.push(k + ': an arcade line');
    if (!/12 of 12/.test(v) || !/Earned/.test(v) || !/data-goal=/.test(v)) bad.push(k + ': no result, wage or goals');
  }
  ok(!bad.length, 'every template ends on its own card: its own "You practised" line, the result, the wage, its goals — never an arcade game\'s line', bad.join(' | '));
  const lines = KINDS.map((k) => JT.SHIFT_PRACTISED[k]);
  ok(new Set(lines).size === 4, 'four templates, four different practised lines');
}

/* ── goals: a record of things done right, never ticked by doing nothing ── */
{
  const nothing = { finished: false, right: 0, of: 12, answered: 0, bestRun: 0, flagged: 0, over: 0, late: 0, spotted: 0, checks: 3 };
  const free = KINDS.flatMap((k) => JT.JOB_GOALS[k].filter((g) => g.check(nothing)).map((g) => k + '.' + g.id));
  ok(!free.length, 'no shift goal is ticked by a shift where nothing was done', free.join(','));
  const all = KINDS.every((k) => { fresh(ONE[k]); K().goals = {}; const g = startJobGame(ONE[k], () => {}, { tier: 'standard', seed: 61 }); drive(g, perfect); return (g.st.goals || []).some((x) => x.id === 'all'); });
  ok(all, 'a perfect shift ticks "every one right" on every template');
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
