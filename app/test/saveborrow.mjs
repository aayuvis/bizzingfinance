/* saveborrow.mjs — Save or Borrow? at the Bank (docs/12 §2.10), SB1–SB5.

   What a family would complain about, as checks:
   · SB1 a sum on the screen that the screen worked out for itself — every total is sim.js's;
   · SB2 a path labelled right or wrong, or styled as the one to pick;
   · SB3 a fee or a price that is not a registered town dial;
   · SB4 the investment loan missing at Tricky, or "paying for itself" when it does not;
   · SB5 a random player earning a real score (the predict step is typed).
   Plus: the same seed replays, a miss holds and shows the sum, the path is never scored,
   % waits for the maths, keyboard drives a whole round, and the wage goes through payout().

   Every check here was watched failing once (see the commit message for how each was broken).
   Run: node test/saveborrow.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
globalThis.Image = class {};
import { readFileSync } from 'node:fs';
const { R } = await import('../src/runtime.js');
const sim = await import('../src/sim.js');
const fmt = await import('../src/fmt.js');
const AR = await import('../src/arcade.js');
const SBV = await import('../src/saveborrow.js');
const { SB } = await import('../src/world.js');
const { SOURCES } = await import('../src/sources.js');
const { GAMES, GAME_ACTS } = await import('../src/gamelist.js');
const { gameOpen, CHAPTERS, UNLOCKS } = await import('../src/content.js');

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nSave or Borrow? · SB1–SB5\n' + '─'.repeat(56));

R.s = sim.newState(); R.s.kids.push(sim.newChild('Asha', 'builder', 'INR'));
R.render = () => {};
const K = () => R.s.kids[0];
const LEVELS = sim.SB_LEVELS;
const plain = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');

/* drive one round the way keys and taps do; `pick` decides each move */
function play(seed, level, pick) {
  AR.startGame('sb', seed, level);
  const G = R.game, st = G.st, views = [];
  for (let guard = 0; !st.done && guard < 400; guard++) {
    views.push([st.step, G.view()]);
    const g = st.round.goals[st.gi], l = st.log[st.gi];
    if (st.step === 'predict') {
      if (st.held) G.act('sbCheck');
      else { for (const d of String(pick.type(g.asks[st.ai], g))) G.act('sbKey', d); G.act('sbCheck'); }
    } else if (st.step === 'choose') G.act('sbPath', pick.path(g));
    else if (st.step === 'cushion') G.act('sbCushion', pick.cushion(g) ? '1' : '0');
    else if (st.step === 'live') G.act('sbSkip');
    else if (st.step === 'card') { if (l.ans == null) G.act('sbAns', pick.ans(g, l)); else G.act('sbNext'); }
  }
  views.push(['done', G.view()]);
  return { G, st, views };
}
const careful = (path) => ({ type: (a) => a.want, path: (g) => (path && g.paths.some((p) => p.id === path) ? path : g.paths[0].id),
  cushion: () => true, ans: (g, l) => l.cmp.question.answer });
let rs = 99;
const rnd = () => { rs = (rs * 1664525 + 1013904223) % 4294967296; return rs / 4294967296; };
const randomBot = { type: () => String(1 + Math.floor(rnd() * 99999)).slice(0, 1 + Math.floor(rnd() * 5)),
  path: (g) => g.paths[Math.floor(rnd() * g.paths.length)].id, cushion: () => rnd() < 0.5,
  ans: (g) => g.paths[Math.floor(rnd() * g.paths.length)].id };

/* ── registered ─────────────────────────────────────────────────────────── */
{
  const g = GAMES.find((x) => x.id === 'sb');
  ok(!!g && g.kind === 'decision' && g.needs === UNLOCKS.bank, 'Save or Borrow? is in the catalogue, a decision game, opened by the Bank\'s own chapter', g && `${g.kind} · needs ${g.needs}`);
  const ch = CHAPTERS.find((x) => x.id === g.needs);
  ok(ch && ch.lv === 11 && !gameOpen(K(), g), 'it sits where the town says: the Bank\'s chapter is level 11, and a new child finds it shut', ch && `lv ${ch.lv}`);
  ok(['sbKey', 'sbCheck', 'sbPath', 'sbCushion', 'sbSkip', 'sbAns', 'sbNext'].every((a) => GAME_ACTS.includes(a)), 'every action it answers is a named arcade action');
  ok(AR.ARCADE_TIERS.sb && LEVELS.every((t) => AR.ARCADE_TIERS.sb[t].par === SBV.SB_PAR && AR.ARCADE_TIERS.sb[t].says) && AR.ARCADE_GOALS.sb.length === 3,
    'three levels with one par (the whole set) and three goals that pay nothing', `par ${SBV.SB_PAR}`);
  const { search } = await import('../src/search.js');
  ok(search('borrow').some((r) => r.kind === 'Game' && r.title === 'Save or Borrow?'), 'search for "borrow" finds the game');
}

/* ── SB1 · every total is computed by sim.js, never by the view ─────────── */
{
  /* (a) every amount of money on any screen of the round is a number sim.js handed over */
  const numbers = (o, out = new Set()) => { if (typeof o === 'number') out.add(o); else if (o && typeof o === 'object') Object.values(o).forEach((v) => numbers(v, out)); return out; };
  const stray = [];
  for (const cur of ['INR', 'USD']) {
    fmt.setCurrency(cur);
    const sign = fmt.sign(), re = new RegExp('\\' + sign + '[0-9]+(?:,[0-9]+)*', 'g');
    for (let s = 1; s <= 30; s++) for (const lv of LEVELS) {
      for (const pick of [careful(), randomBot]) {
        const { st, views } = play(s * 13, lv, pick);
        const allowed = numbers({ round: st.round, log: st.log.map((l) => ({ rows: l.rows, cmp: l.cmp })) });
        allowed.add(st.won); allowed.add(0);
        const typed = new Set(views.flatMap(([, v]) => [...plain(v).matchAll(/you typed \D?([0-9,]+)/g)].map((m) => +m[1].replace(/,/g, ''))));
        const shown = new Set([...allowed].map((n) => fmt.money(n)));
        typed.forEach((n) => shown.add(fmt.money(n)));
        for (const [step, v] of views) for (const m of plain(v).matchAll(re)) if (!shown.has(m[0])) stray.push(`${cur}/${lv}/${step}: ${m[0]}`);
      }
    }
  }
  fmt.setCurrency('INR');
  ok(!stray.length, 'SB1 · every amount on every screen (predict, choose, strip, card, end) is one sim.js computed — INR and USD, 360 rounds', stray.slice(0, 4).join(' | '));
  /* (b) and the module does no sum on a money field itself */
  const src = readFileSync(new URL('../src/saveborrow.js', import.meta.url), 'utf8');
  const F = '(price|income|weekly|total|cost|fee|oneOff|repair|pay|purse|tin|has|want|cushion|job|end|short|more|less|dCost|dJob|dEnd|repaired|extra)';
  const sums = [...src.matchAll(new RegExp(`\\.${F}\\b\\s*[-+*/](?![=>])|[-+*/]\\s*[A-Za-z_]\\w*(?:\\.\\w+)*\\.${F}\\b`, 'g'))].map((m) => m[0]);
  ok(!sums.length, 'SB1 · saveborrow.js does no arithmetic on a money field — it only says sim.js\'s numbers', sums.slice(0, 4).join(' | '));
  ok(!/\bprice\(/.test(src), 'SB1 · saveborrow.js never prices anything itself (no price() call)');
  /* (c) the predicted total is sim's own sum of the offer the child read */
  let mism = 0, n = 0;
  for (let s = 1; s <= 200; s++) for (const lv of LEVELS) for (const g of sim.sbRound(s, lv).goals) for (const a of g.asks) {
    n++;
    const p = g.paths.find((x) => x.id === a.path);
    const live = sim.sbPath(g, p, true);
    if (a.kind === 'loan' && (a.want !== a.a * a.b + a.extra || a.want !== live.cost || a.want !== p.total)) mism++;
    if (a.kind === 'saved' && a.want !== g.income * a.b) mism++;
    if (!sim.sbCheck(a, String(a.want)).ok || sim.sbCheck(a, String(a.want + 1)).ok || sim.sbCheck(a, '').ok) mism++;
  }
  ok(!mism, `SB1 · every predicted total is the weekly × the weeks (+ the fee) of the offer on screen, and what the strip then charges (${n} asks)`);
}

/* ── SB2 · no path is ever labelled right or wrong ──────────────────────── */
{
  const LABEL = /\b(right|wrong|best|worst|better|worse|correct|incorrect|smart|smartest|wise|wisest|foolish|mistake|should|recommended|sensible|ideal)\b/i;
  const bad = [], styled = [];
  for (let s = 1; s <= 40; s++) for (const lv of LEVELS) for (const pick of [careful(), randomBot]) {
    const { views } = play(s * 7 + 1, lv, pick);
    for (const [step, v] of views) {
      if (step === 'done') continue;
      const m = plain(v).match(LABEL); if (m) bad.push(`${lv}/${step}: "${m[0]}"`);
      if (step === 'choose') {
        const cls = [...v.matchAll(/<button class="([^"]+)" data-act="sbPath"/g)].map((x) => x[1]);
        if (new Set(cls).size !== 1) styled.push(`${lv}: ${cls.join(' / ')}`);
      }
    }
  }
  ok(!bad.length, 'SB2 · no word on any step calls a path right, wrong, best, smart or a mistake', bad.slice(0, 3).join(' | '));
  ok(!styled.length, 'SB2 · on the choose step every path is the same button: none is lit, badged or ordered as the one to take', styled.slice(0, 2).join(' | '));
  /* never scored: whichever path she takes, a careful plan scores the whole set */
  const scores = {};
  for (let s = 1; s <= 60; s++) for (const lv of LEVELS) for (const path of ['save', 'sale', 'used', 'borrow', 'loanA', 'loanB']) {
    const { st } = play(s * 31, lv, careful(path));
    const used = st.log.map((l) => l.path).join();
    (scores[lv + ':' + path] = scores[lv + ':' + path] || new Set()).add(st.points);
    if (!used) scores.bad = true;
  }
  const all = Object.entries(scores).filter(([k]) => k !== 'bad').every(([, v]) => v.size === 1 && v.has(SBV.SB_PAR));
  ok(all, `SB2 · the path is never scored: a careful plan on ANY path scores ${SBV.SB_PAR} of ${SBV.SB_PAR} on every level`, JSON.stringify(Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, [...(v || [])]]))).slice(0, 160));
  let safe = 0, total = 0;
  for (let s = 1; s <= 300; s++) for (const lv of LEVELS) for (const g of sim.sbRound(s, lv).goals) for (const p of g.paths) { total++; if (sim.sbPath(g, p, true).broke == null) safe++; }
  ok(safe === total, 'SB2 · with the cushion, every path keeps money in the purse through the surprise — so a buffer never depends on the path', `${safe}/${total}`);
}

/* ── SB3 · every rate and price is a town dial in sources.js ────────────── */
{
  const reg = Object.entries(SOURCES).filter(([k]) => /^sb/.test(k));
  const named = new Set(reg.flatMap(([, v]) => v.dials || []));
  const missing = Object.keys(SB).filter((k) => !named.has(k));
  ok(reg.length >= 3 && !missing.length, 'SB3 · every dial in world.js SB is registered in sources.js', missing.join(', ') || `${Object.keys(SB).length} dials in ${reg.length} entries`);
  ok(reg.every(([, v]) => v.kind === 'own' && /town|Bizzington/i.test(v.says) && v.value().length > 10), 'SB3 · each is said to be the town\'s own, with its value');
  const loans = SOURCES.sbloans.value();
  ok([SB.flatFee, SB.oneOffFee].every((f) => loans.includes(String(Math.round(f * 100)))) && loans.includes((SB.weeklyFee * 100).toFixed(1)), 'SB3 · the register reads the live dials, so it cannot drift from what the game charges', loans);
  const simSrc = readFileSync(new URL('../src/sim.js', import.meta.url), 'utf8');
  /* the code, not its comments (which cite docs/12 §2.10) */
  const sect = simSrc.slice(simSrc.indexOf('/* ══ Save or Borrow?')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const lit = [...sect.matchAll(/(?<![\w.])\d*\.\d+(?![\w])/g)].map((m) => m[0]);
  ok(sect.length > 1000 && !lit.length && !/price\(\s*\d/.test(sect), 'SB3 · sim.js\'s Save or Borrow? section has no fraction or price of its own — every rate comes from SB', lit.join(', '));
  const things = new Set(SB.things.map((t) => t.id));
  let foreign = 0;
  for (let s = 1; s <= 100; s++) for (const lv of LEVELS) for (const g of sim.sbRound(s, lv).goals) if (!things.has(g.thing.id) || g.price !== fmt.price(SB.things.find((t) => t.id === g.thing.id).units)) foreign++;
  ok(!foreign, 'SB3 · every price asked is a dial, said once in coins');
}

/* ── SB4 · the investment loan appears at Tricky and pays off when taken ── */
{
  let seen = 0, bad = [], elsewhere = 0, worded = 0;
  for (let s = 1; s <= 300; s++) {
    for (const lv of ['easy', 'standard']) if (sim.sbRound(s, lv).goals.some((g) => g.invest)) elsewhere++;
    const goals = sim.sbRound(s, 'tricky').goals.filter((g) => g.invest);
    if (goals.length === 1) seen++;
    for (const g of goals) for (const cu of [true, false]) {
      const rows = sim.sbLive(g, cu), save = rows.find((x) => x.id === 'save');
      for (const x of rows.filter((r) => r.fee > 0)) {
        if (!(x.end > save.end && x.job - save.job > x.cost - save.cost)) bad.push(`${s}/${g.thing.id}/${x.id}: job +${x.job - save.job} vs cost +${x.cost - save.cost}`);
      }
    }
  }
  ok(seen === 300 && !elsewhere, 'SB4 · every Tricky round has exactly one investment goal; Easy and Standard have none', `${seen}/300 · ${elsewhere} elsewhere`);
  ok(!bad.length, 'SB4 · taking either loan for it pays off: the job earns more than the loan costs over saving, with or without a cushion', bad.slice(0, 2).join(' | '));
  for (let s = 1; s <= 20; s++) {
    const { views, st } = play(s, 'tricky', careful('loanB'));
    const i = st.round.goals.findIndex((g) => g.invest);
    const card = views.filter(([step]) => step === 'card').map(([, v]) => plain(v))[i * 2] || '';
    if (/paid for itself/.test(card) && /delivery round|hauling/.test(card)) worded++;
  }
  ok(worded === 20, 'SB4 · the card says so honestly, in coins: the job paid more than the loan cost, so this time it paid for itself', `${worded}/20`);
}

/* ── SB5 · a random bot scores ≤ 20% ────────────────────────────────────── */
{
  const share = {};
  for (const lv of LEVELS) {
    let sum = 0; const N = 150;
    for (let s = 1; s <= N; s++) sum += play(1000 + s, lv, randomBot).st.points / SBV.SB_PAR;
    share[lv] = sum / N;
  }
  const worst = Math.max(...Object.values(share));
  ok(worst <= 0.2, 'SB5 · a random player scores ≤ 20% on every level (the predict step is typed)', LEVELS.map((l) => `${l} ${(share[l] * 100).toFixed(1)}%`).join(' · '));
  const top = play(77, 'standard', careful()).st.points;
  ok(top === SBV.SB_PAR, 'SB5 · and a careful player scores the whole set', `${top}/${SBV.SB_PAR}`);
}

/* ── seeds, holds, percent, keys, pay ───────────────────────────────────── */
{
  const a = JSON.stringify(sim.sbRound(4242, 'tricky')), b = JSON.stringify(sim.sbRound(4242, 'tricky')), c = JSON.stringify(sim.sbRound(4243, 'tricky'));
  ok(a === b && a !== c, 'a seed replays the same round exactly; the next seed is a different one');
  AR.startGame('sb', null, 'standard'); const s1 = R.game.st.seed; AR.quitGame();
  ok(Number.isInteger(s1), 'each play draws its own seed, kept on the round', String(s1));
  let ok8 = true;
  for (const cur of Object.keys(fmt.CURRENCIES)) {
    fmt.setCurrency(cur);
    for (let s = 1; s <= 150; s++) for (const lv of LEVELS) for (const g of sim.sbRound(s, lv).goals) if (!sim.sbGoalOk(g) || g.paths.length < 2 || g.paths.length > 4) ok8 = false;
  }
  fmt.setCurrency('INR');
  ok(ok8, 'in ₹ $ £ € AED every goal offers 2–4 paths, all bought inside the strip, with distinct totals');
  const counts = Object.fromEntries(LEVELS.map((lv) => [lv, sim.sbRound(5, lv).goals.map((g) => g.paths.length).join('')]));
  ok(counts.easy === '222' && counts.standard === '333' && counts.tricky === '444', 'Easy: save or the sale · Standard: adds one flat-fee loan · Tricky: two loans and second-hand', JSON.stringify(counts));
  ok(sim.sbRound(5, 'easy').goals.every((g) => g.paths.every((p) => !p.n)), 'Easy has no borrowing and no fee');

  /* a miss holds, shows the sum, and waits for Continue */
  AR.startGame('sb', 321, 'standard'); const G = R.game, st = G.st;
  const ask = st.round.goals[0].asks[0];
  for (const d of String(ask.want + 10)) G.act('sbKey', d);
  G.act('sbCheck');
  const v = plain(G.view());
  ok(st.step === 'predict' && st.held && !st.held.ok && v.includes(fmt.money(ask.want)) && v.includes('×') && /Continue/.test(v), 'a missed total holds on screen with the sum written out, until Continue', v.match(/Not this time[^.]*\.[^C]*/)?.[0]);
  const held = st.typed; G.act('sbKey', '5'); G.act('sbKey', 'del'); ok(st.typed === held && held === String(ask.want + 10), 'while it holds, the pad types nothing and the answer typed stays on screen');
  G.act('sbCheck'); ok(st.step === 'choose', 'Continue moves on to choosing');
  AR.quitGame();

  /* % only once the maths is met (M10, "for every hundred") */
  const cardText = () => { const { views } = play(9, 'standard', careful('borrow')); return views.filter(([s]) => s === 'card').map(([, x]) => plain(x)).join(' '); };
  K().maths = { ceiling: 2 }; K().learn.level = 1;
  const before = cardText();
  K().maths = { ceiling: 17 };
  const after = cardText();
  ok(!/%/.test(before) && /coins/.test(before) && /\d+% on top of the price/.test(after), 'rates are in coins; a % appears only once ledger.mathsMet says percent is met');

  /* the keyboard plays a whole round */
  AR.startGame('sb', 55, 'tricky'); const KG = R.game, ks = KG.st;
  const press = (key) => KG.key({ key, target: {} });
  for (let i = 0; i < 300 && !ks.done; i++) {
    const g = ks.round.goals[ks.gi];
    if (ks.step === 'predict') { if (ks.held) press('Enter'); else { for (const d of String(g.asks[ks.ai].want)) press(d); press('Backspace'); press(String(g.asks[ks.ai].want).slice(-1)); press('Enter'); } }
    else if (ks.step === 'choose') press(String(g.paths.length));
    else if (ks.step === 'cushion') press('2');
    else if (ks.step === 'live') press('Enter');
    else if (ks.step === 'card') { if (ks.log[ks.gi].ans == null) press(String(g.paths.findIndex((p) => p.id === ks.log[ks.gi].cmp.question.answer) + 1)); else press('Enter'); }
  }
  ok(ks.done && ks.points === SBV.SB_PAR, 'the keyboard alone plays a whole Tricky round: digits, Backspace, Enter, 1–4', `${ks.points}/${SBV.SB_PAR}`);
  AR.quitGame();

  /* pay: through payout() (the daily cap), on the decision score, and the goals pay nothing */
  K().wages = null; K().goals = {};
  const w0 = K().money.wallet;
  const r1 = play(8, 'standard', careful());
  const paid = K().money.wallet - w0;
  ok(paid === fmt.price(AR.WAGE_NORM) && r1.st.won === paid, 'a whole-set round pays a drill\'s wage (the arcade norm), into the one wallet', fmt.money(paid));
  const w1 = K().money.wallet; const r2 = play(8, 'standard', randomBot);
  ok(K().money.wallet - w1 === r2.st.won && r2.st.won < paid, 'a random round pays less, on its score', fmt.money(r2.st.won));
  play(8, 'easy', careful()); const w3 = K().money.wallet; const r4 = play(8, 'tricky', careful());
  ok(r4.st.won === 0 && K().money.wallet === w3 && plain(r4.G.view()).includes(AR.CAPPED_LINE), 'the fourth paid play of the day is practice, and the end card says so');
  const met = Object.keys((K().goals || {}).sb || {}).sort().join();
  ok(met === 'buffer,card,predict' && /data-goal="predict"/.test(r4.G.view()), 'careful rounds tick the three goals, shown on the end card', met);
  ok(/You practised:<\/b> what borrowing really costs/.test(r4.G.view()), 'its own "You practised" line');
  AR.quitGame();
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
