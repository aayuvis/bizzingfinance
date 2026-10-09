/* stall.mjs — Stall of My Own (docs/12 §2.1), acceptance SA1–SA7, with bots.

   What a child (or a grown-up) would complain about, each as a check:
   · SA1 a random player loses money — the season must be able to lose;
   · SA2 a price-gouger sells under half what a fair-priced stall sells;
   · SA3 an over-stocker wastes more than a quarter of what it buys;
   · SA4 restocking takes real time, and serving stops while you do it;
   · SA5 the cart on credit shows its total cost in coins and is never called good or bad;
   · SA6 seasons differ by seed, and the same seed replays exactly;
   · SA7 the wage per week sits in the arcade's norm.
   Plus the promises around them: a careful player reaches the goal with a buffer, the
   keepsake is counted from the ledger and never given for showing up, the season lives on
   the child through the store, and the ledger adds up in every currency.

   Every check was watched failing once (see the commit message for how each was broken).
   Run: node test/stall.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
globalThis.Image = class {};
const { R } = await import('../src/runtime.js');
const sim = await import('../src/sim.js');
const S = await import('../src/stallsim.js');
const B = await import('./stallbots.mjs');
const AR = await import('../src/arcade.js');
const ST = await import('../src/stall.js');
const { price, setCurrency, stallMoney, convert } = await import('../src/fmt.js');
const { migrate, SCHEMA } = await import('../src/store.js');
const { SYNC_KEYS, shred } = await import('../src/backup.js');
const { SOURCES } = await import('../src/sources.js');
const { GAMES, GAME_ACTS } = await import('../src/gamelist.js');

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nStall of My Own · a season on Market Row\n' + '─'.repeat(56));
setCurrency('INR');
R.s = sim.newState(); R.s.kids.push(sim.newChild('Asha', 'builder', 'INR'));
R.render = () => {};
const K = () => R.s.kids[0];
const TIERS = ['easy', 'standard', 'tricky'];
const N = 100;
const seedOf = (i) => i * 7919 + 13;

/* ── the bots, a hundred seasons a level ───────────────────────────────── */
const results = {};
for (const tier of TIERS) {
  const out = results[tier] = { randomLoss: 0, randomChange: [], carefulGoal: 0, carefulBroke: 0, carefulChange: [], fairSold: 0, highSold: 0, overWaste: [], carefulWage: [], randomWage: [] };
  for (let i = 1; i <= N; i++) {
    const seed = seedOf(i), r = S.prng(seed ^ 0x5bd1e995);
    const rs = B.season(seed, tier, i % 2 ? 'cart' : 'sign', (s) => B.randomPlan(s, r), () => B.randomServe(r));
    const rm = S.summary(rs);
    if (rm.change < 0) out.randomLoss++;
    out.randomChange.push(rm.change); out.randomWage.push(...rs.ledger.map((x) => x.wageUnits));
    const cs = B.season(seed, tier, i % 2 ? 'cart' : 'sign', (s) => B.carefulPlan(s), () => B.carefulServe());
    const cm = S.summary(cs);
    if (cm.goal) out.carefulGoal++;
    out.carefulBroke += cm.brokeWeeks; out.carefulChange.push(cm.change); out.carefulWage.push(...cs.ledger.map((x) => x.wageUnits));
    out.fairSold += S.summary(B.season(seed, tier, 'cart', (s) => B.carefulPlan(s, { step: S.FAIR_STEP, jar: false }), () => B.carefulServe())).sold;
    out.highSold += S.summary(B.season(seed, tier, 'cart', (s) => B.carefulPlan(s, { step: 9, jar: false }), () => B.carefulServe())).sold;
    out.overWaste.push(S.summary(B.season(seed, tier, 'cart', (s) => B.carefulPlan(s, { stockX: 2.5, jar: false }), () => B.carefulServe())).waste);
  }
}
const mean = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
const R0 = (n) => Math.round(n);

/* SA1 */
for (const t of TIERS) {
  const o = results[t];
  ok(o.randomLoss / N >= 0.8, `SA1 ${t}: a random player (random stock, prices and serves) ends the season with less than it started, in ≥ 80% of seasons`,
    `${o.randomLoss}/${N} lost · mean ${R0(mean(o.randomChange))} rupee-scale`);
}
/* the other side of SA1: the season is winnable by deciding well */
for (const t of TIERS) {
  const o = results[t];
  ok(o.carefulGoal / N >= 0.95 && o.carefulBroke === 0 && Math.min(...o.carefulChange) > 0, `${t}: a careful player reaches the goal by week 8 with a buffer, and ends up`,
    `${o.carefulGoal}/${N} goals · broke ${o.carefulBroke} mornings · worst +${Math.min(...o.carefulChange)}`);
}
/* SA2 */
for (const t of TIERS) {
  const o = results[t];
  ok(o.highSold < o.fairSold / 2, `SA2 ${t}: a "price high" stall sells under half what a fair-priced stall sells`, `${o.highSold} vs ${o.fairSold} (${(o.highSold / o.fairSold).toFixed(2)}×)`);
}
/* SA3 — Easy has no spoilage by design, so the over-stocker's cost there is cash tied up, not waste */
for (const t of ['standard', 'tricky']) {
  const w = mean(results[t].overWaste);
  ok(w > 0.25, `SA3 ${t}: an over-stocking stall wastes more than a quarter of what it buys`, `${(w * 100).toFixed(0)}% spoiled`);
}
ok(mean(results.easy.overWaste) === 0, 'Easy: nothing goes off, as the level says');

/* SA4 — restocking takes real time and serving stops while it happens */
{
  const s = S.newSeason(4242, 'standard', 'cart');
  S.level(s).products.forEach((id) => S.setBuy(s, id, 9));
  S.openDay(s);
  const day = S.makeDay(s);
  while (!day.st.q.length) day.advance(50);
  const want = day.st.q[0].want;
  day.st.counter[want] = 1;                     /* room on the counter, stock in the crate */
  ok(day.restock() === true && day.st.restock > 0, 'SA4: R starts a restock that takes time', `${day.st.restock} ms`);
  const before = day.st.served, r1 = day.serve(want);
  ok(r1 === 'busy' && day.st.served === before && day.st.blocked === 1, 'SA4: serving while restocking does nothing — your hands are full', r1);
  let t = 0; while (day.st.restock > 0) { day.advance(50); t += 50; }
  ok(t >= S.PLAIN.restock - 50 && day.st.counter[want] > 1, 'SA4: the restock lands only after its real time has passed', `${t} ms`);
  if (day.st.q.length) { const w2 = day.st.q[0].want; ok(day.serve(w2) === 'sold', 'SA4: and then serving works again'); }
  /* the screen agrees: during a restock every serve button is disabled */
  K().stall = { season: null, seasons: 0, beaSaid: false };
  await AR.startGame('so', 777, 'standard');
  const g = R.game;
  g.newSeason('cart');
  S.level(g.season).products.forEach((id) => S.setBuy(g.season, id, 6));
  g.openStall(false);
  while (!g.day.st.q.length) g.day.advance(50);
  g.day.st.counter[g.day.st.q[0].want] = 0;
  g.restock();
  const v = g.view();
  const serveBtns = (v.match(/data-act="soServe"[^>]*>/g) || []);
  ok(serveBtns.length === 3 && serveBtns.every((b) => /disabled/.test(b)) && /Restocking/.test(v), 'SA4: on screen, every serve button is disabled while restocking', `${serveBtns.length} buttons`);
  AR.quitGame();
}

/* SA5 — the credit offer: total in coins, never judged */
{
  const s = S.newSeason(9001, 'tricky', 'cart');
  const ev = s.cal.events.find((e) => e.kind === 'credit');
  ok(!!ev && s.cal.events.some((e) => e.kind === 'rival'), 'Tricky: every season has the rival stall and the cart offer on credit', JSON.stringify(s.cal.events.map((e) => e.kind + '@' + (e.week + 1))));
  while (s.week < ev.week) { B.carefulPlan(s, { jar: false }); S.openDay(s); S.closeWeek(s, S.autoDay(s)); S.nextWeek(s); }
  const o = S.offerFor(s);
  const card = ST.offerCard(s);
  const text = card.replace(/<[^>]+>/g, ' ');
  ok(o && o.total === o.weekly * o.weeks && card.includes(`${stallMoney(o.total)} in all`), 'SA5: the offer shows its total cost in coins ("… in all"), and the total is the weekly payment × the weeks',
    o ? `${stallMoney(o.weekly)} × ${o.weeks} = ${stallMoney(o.total)} · or ${stallMoney(o.now)} now` : 'no offer');
  const JUDGE = /\b(good|bad|great|smart|wise|clever|silly|foolish|mistake|risky|risk|trap|deal|bargain|best|better value|worse|worst|careful|danger|warning|should|recommend)\b/i;
  ok(!JUDGE.test(text.replace(/A better cart/gi, '')), 'SA5: and it is never labelled good or bad — no word on the card judges either choice', (text.match(JUDGE) || ['none'])[0]);
  /* taking it on credit: the payments are real costs on the ledger, and they add up to the total shown */
  S.answerOffer(s, 'credit');
  while (s.phase !== 'done') { if (s.phase === 'ledger') S.nextWeek(s); B.carefulPlan(s, { jar: false }); S.openDay(s); S.closeWeek(s, S.autoDay(s)); }
  const paid = s.ledger.reduce((t, r) => t + r.credit, 0);
  ok(s.owned && paid === o.total && s.credit.left === 0, 'SA5: on credit the cart is yours at once, and the season\'s cart payments come to exactly the total shown', `${stallMoney(paid)} paid`);
}

/* SA6 — seeds */
{
  const run = (seed) => { const r = S.prng(seed + 1); return B.season(seed, 'tricky', 'cart', (s) => B.randomPlan(s, r), () => B.randomServe(r)); };
  const a = JSON.stringify(run(31337).ledger), b = JSON.stringify(run(31337).ledger), c = JSON.stringify(run(31338).ledger);
  ok(a === b, 'SA6: the same seed and the same decisions replay the season exactly', `${a.length} chars of ledger`);
  ok(a !== c, 'SA6: a different seed is a different season');
  const cals = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((i) => JSON.stringify(S.newSeason(i * 101, 'standard').cal.weather)));
  ok(cals.size >= 6, 'SA6: eight seeds, (nearly) eight different weathers', `${cals.size} distinct`);
  const s1 = S.newSeason(5, 'standard'); S.openDay(s1); const s2 = S.newSeason(5, 'standard'); S.openDay(s2);
  ok(JSON.stringify(S.makeDay(s1).st.arrivals) === JSON.stringify(S.makeDay(s2).st.arrivals), 'SA6: the market day\'s customers come from the season, not from chance per sale');
}

/* SA7 — the wage per week, in the arcade's norm (docs/12 §1.1: about ₹60–150 at Standard in INR) */
{
  const cw = results.standard.carefulWage.map(price), top = price(S.wageUnits(10));
  ok(cw.every((w) => w >= 60 && w <= 150), 'SA7: a careful week pays inside the norm, ₹60–150', `₹${Math.min(...cw)}–₹${Math.max(...cw)}`);
  ok(top <= 150, 'SA7: a perfect week cannot pay more than the norm', `₹${top}`);
  ok(TIERS.every((t) => Math.abs(mean(results[t].carefulWage) - mean(results.standard.carefulWage)) <= 1), 'SA7: the same care earns the same on every level — Tricky is a challenge, never a bigger wage',
    TIERS.map((t) => t + ' ' + mean(results[t].carefulWage).toFixed(1)).join(' · '));
  ok(mean(results.standard.randomWage) < mean(results.standard.carefulWage) / 2, 'SA7: mashing earns well under half what deciding earns', `${mean(results.standard.randomWage).toFixed(1)} vs ${mean(results.standard.carefulWage).toFixed(1)} units`);
}

/* ── the season through the game itself: pay path, the ledger page, the keepsake ── */
{
  setCurrency('INR');
  const c = K(); c.stall = null; c.keepsakes = []; c.wages = {}; c.goals = {};
  await AR.startGame('so', 5150, 'standard');
  const g = R.game;
  ok(g && g.id === 'so' && /data-act="soGoal"/.test(g.view()), 'the game opens on the season\'s first choice: what to save for');
  g.key({ key: '1' });
  ok(g.season && g.season.goal === 'cart' && /The wholesaler/.test(g.view()), 'pressing 1 picks the cart and opens week 1\'s plan');
  const w0 = c.money.wallet;
  const paid = [];
  let bea = 0;
  for (let w = 0; w < S.WEEKS; w++) {
    B.carefulPlan(g.season);
    const before = c.money.wallet;
    g.openStall(false);
    const act = B.carefulServe();
    while (g.day && !g.day.st.done) { act(g.day, g.day.st); g.day.advance(50); }
    if (g.day) g.finishDay(g.day.result());
    paid.push(c.money.wallet - before);
    const v = g.view();
    if (/Busy day\. Now look at what it cost you\./.test(v)) bea++;
    if (w === 0) ok(/Takings/.test(v) && /What it cost/.test(v) && /Unsold and spoiled/.test(v) && /Profit/.test(v) && /Cart jar/.test(v), 'the ledger page separates takings, what it cost, unsold and spoiled, profit and the cart jar');
    if (w === 0) ok(/kept from every ₹10 taken/.test(v), 'the margin is said in coins — "₹… kept from every ₹10" — before percentages are met');
    g.act('soNext');
  }
  ok(paid.slice(0, 3).every((p) => p >= 60 && p <= 150) && paid.slice(3).every((p) => p === 0), `the week's wage goes through the arcade's one pay path: the first ${sim.GAME_PAYS} weeks of a day pay, then it is practice`, paid.join(','));
  ok(c.money.txns.filter((t) => t.label === 'Stall of My Own').length === sim.GAME_PAYS && c.money.wallet - w0 === paid.reduce((a, b) => a + b, 0), 'every coin of it is in the wallet\'s ledger, labelled');
  const k = c.keepsakes.find((x) => x.kind === 'season');
  const rows = g.season.ledger;
  ok(k && k.takings === rows.reduce((t, r) => t + r.takings, 0) && k.kept === rows.reduce((t, r) => t + r.profit, 0) && k.weeks === 8,
    'a season finished with its goal is kept for the Collection, every number counted from its ledger', k ? `${stallMoney(k.takings)} taken, ${stallMoney(k.kept)} kept` : 'none');
  ok(/data-keepsake="season"/.test(g.view()) && /You practised/.test(g.view()), 'the season\'s last page shows the keepsake and its own practised line');
  ok(AR.PRACTISED.so && /busy is not the same as profitable/.test(AR.PRACTISED.so), 'Stall of My Own has its own "You practised" line');
  ok(c.goals.so && c.goals.so.goal && c.goals.so.buffer, 'the season ticks its goals (which pay nothing)', JSON.stringify(c.goals.so));
  ok(bea <= 1, 'Bea\'s line comes at most once', String(bea));
  ok(sim.keepSeason(c, g.season) === null, 'a season is kept once, never twice');
  /* a season that missed its goal keeps nothing */
  const r = S.prng(3);
  const lost = B.season(77, 'standard', 'cart', (s) => B.randomPlan(s, r), () => B.randomServe(r));
  ok(!lost.owned ? sim.keepSeason(c, lost) === null : true, 'a season without its goal is not kept — nothing is given for showing up');
  const half = S.newSeason(8, 'standard'); half.owned = true;
  ok(sim.keepSeason(c, half) === null, 'nor is a season that has not been played to week 8');
  AR.quitGame();
}

/* Bea: the first time takings are high and profit is low */
{
  const c = K(); c.stall = null;
  await AR.startGame('so', 99, 'standard');
  const g = R.game; g.newSeason('cart');
  /* price everything low and over-buy: a busy, costly week */
  S.level(g.season).products.forEach((id) => { S.setStep(g.season, id, 0); S.setBuy(g.season, id, 12); });
  g.openStall(true);
  const v = g.view();
  ok(/Busy day\. Now look at what it cost you\./.test(v) && /Bea/.test(v), 'a busy week that kept little: Bea says "Busy day. Now look at what it cost you."');
  g.act('soNext');
  S.level(g.season).products.forEach((id) => { S.setStep(g.season, id, 0); S.setBuy(g.season, id, 12); });
  g.openStall(true);
  ok(!/Busy day\./.test(g.view()), 'and only the first time');
  ok(/costs a little goodwill/.test(g.view()) || /goodwill/.test(g.view()), 'auto-serve is offered, and says what it costs');
  ok(g.season.goodwill < 1, 'auto-serve costs a little goodwill', g.season.goodwill.toFixed(2));
  AR.quitGame();
}

/* ── the season lives on the child, through the store ─────────────────── */
{
  const c = K();
  ok(SCHEMA === 15 && sim.newChild('X', 'builder', 'INR').stall === null, 'a new child carries stall: null (schema 15)');
  const old = { v: 14, kids: [{ name: 'Old' }], parent: {} };
  ok(migrate(old).kids[0].stall === null && old.v === 15, 'a v14 household migrates: stall is null, never missing');
  ok(SYNC_KEYS.includes('stall') && shred(c).stall !== undefined && shred(c).name === undefined, 'the season is on the backup allow-list (a game record), the name still is not');
  /* a reload: the household goes through JSON, and a fresh game picks the season up where it was */
  const before = JSON.stringify(c.stall);
  c.stall = JSON.parse(before);
  await AR.startGame('so', 1, 'easy');
  const g = R.game, v = g.view();
  ok(JSON.stringify(c.stall.season.ledger) === JSON.stringify(JSON.parse(before).season.ledger) && g.season.ledger.length === 2 && g.season.tier === 'standard' && /Week 3 of 8/.test(v),
    'the season survives a save and a reload: the next session opens on week 3, on the level it began on', `${g.season.ledger.length} weeks in`);
  AR.quitGame();
  ok(SOURCES.stall && SOURCES.stall.kind === 'own' && /town|Bizzington/.test(SOURCES.stall.says), 'the wholesale prices and demand are town dials, registered in sources.js (rule 6)');
}

/* ── the arcade knows it ──────────────────────────────────────────────── */
{
  const g = GAMES.find((x) => x.id === 'so');
  ok(g && g.kind === 'flagship' && g.needs === 'c3' && !GAMES.some((x) => x.id === 'sr'), 'it is in the arcade as a flagship, behind the chapter Stall Rush needed — and Stall Rush\'s own card is gone, folded into it (docs/12 §3)');
  { const { RETIRED } = await import('../src/gamelist.js');
    ok(!GAMES.some((x) => x.id === 'sr') && RETIRED.sr === 'so', 'Stall Rush is retired into it: its card is gone, and an old #/play/sr link opens Stall of My Own'); }
  ok(['soServe', 'soStock', 'soBuy', 'soOpen'].every((a) => GAME_ACTS.includes(a)), 'its taps are wired through the arcade\'s action table');
  ok(TIERS.every((t) => AR.ARCADE_TIERS.so[t].par > 0 && AR.ARCADE_TIERS.so[t].says) && AR.ARCADE_GOALS.so.length === 3, 'three levels, each with a par, and three goals');
  const L = S.LEVELS;
  ok(L.easy.products.length === 2 && !L.easy.spoil && !L.easy.moves && L.standard.products.length === 3 && L.standard.spoil && L.standard.weather
    && L.tricky.products.length === 4 && L.tricky.events.forced.includes('rival') && L.tricky.events.forced.includes('credit'), 'the levels are the spec\'s: 2 steady / 3 with weather and spoilage / 4 with a rival and credit');
  const evs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => S.newSeason(i * 37, 'standard').cal.events.length);
  ok(evs.every((n) => n >= 1 && n <= 2), 'one or two events a season, from the seed', evs.join(','));
}

/* ── the ledger adds up in every currency ─────────────────────────────── */
{
  const s = results && B.season(4040, 'tricky', 'cart', (x) => B.carefulPlan(x), () => B.carefulServe());
  const bad = [];
  for (const cur of ['INR', 'USD', 'GBP', 'EUR', 'AED']) {
    setCurrency(cur);
    for (const r of s.ledger) {
      const v = (n) => Math.round(convert(n, 'INR', cur) * 100);
      if (v(r.takings) - v(r.costs) !== v(r.profit)) bad.push(cur + ' week ' + r.n);
      if (v(r.stockCost) + v(r.rent) + v(r.credit) !== v(r.costs)) bad.push(cur + ' costs ' + r.n);
      if (!/^[^\d]*\d/.test(stallMoney(r.takings))) bad.push(cur + ' format');
    }
  }
  setCurrency('INR');
  ok(!bad.length && s.ledger.every((r) => r.takings % 2 === 0 && r.costs % 2 === 0), 'every ledger line converts exactly, so takings − costs = profit in ₹, $, £, € and AED', bad.slice(0, 3).join(' '));
  setCurrency('USD'); const usd = stallMoney(40); setCurrency('INR');
  ok(usd === '$1' && stallMoney(40) === '₹40', 'a chai at ₹40 is $1 — the stall\'s prices are the town\'s, in the child\'s currency', usd);
}

console.log('\nBots, 100 seasons a level:');
for (const t of TIERS) {
  const o = results[t];
  console.log(`  ${t.padEnd(8)} random lost ${o.randomLoss}% (mean ${R0(mean(o.randomChange))}) · careful goal ${o.carefulGoal}% (mean +${R0(mean(o.carefulChange))}) · price-high/fair volume ${(o.highSold / o.fairSold).toFixed(2)} · over-stock waste ${(mean(o.overWaste) * 100).toFixed(0)}% · careful wage ₹${R0(mean(o.carefulWage.map(price)))}/week`);
}
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
