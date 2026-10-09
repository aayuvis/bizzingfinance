/* games.mjs — docs/12 §1 and the fixes in §2.6–2.9, asserted on the games themselves.

   What a child (or a parent) would complain about, each one watched failing first:
   · T3 a price that does not add up — a quarter shown as "$25", a till nobody can solve in £;
   · T4 the same cards and storms every play, so a replay is memory, not practice;
   · T5 a wrong answer that vanishes, its correction landing under the NEXT card;
   · T6 an end card speaking for a different game, or "Earned ₹0." with no reason;
   · T17 a level that changes by itself, or never offers to;
   · the Market Cup's "best" stuck on the first finish, a tie with Bella called a win;
   · Change Rush saying "Overpaid" and nothing about which coin would have done it;
   · Main Street's dice the same every game, its tokens a coloured dot.

   Run: node test/games.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
globalThis.Image = class {};
const { R } = await import('../src/runtime.js');
const sim = await import('../src/sim.js');
const AR = await import('../src/arcade.js');
const JT = await import('../src/jobtable.js');
const { startJobGame, JOB_PRACTISED } = await import('../src/jobgames.js');
const F = await import('../src/fmt.js');
const puz = await import('../src/dailypuzzle.js');
const { play, withQueue } = await import('./_bots.mjs');
const { tillCard } = await import('../src/views.js');

let pass = 0, fail = 0;
const ok = (label, cond, detail = '') => { const c = !!cond; if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
R.render = () => {};
const fresh = (cur = 'INR') => { F.setCurrency(cur); R.s = sim.newState(); R.s.kids.push(sim.newChild('Asha', 'builder', cur)); R.s.kids[0].learn.level = 30; return R.s.kids[0]; };
const K = () => R.s.kids[0];
/* the round games; Stall of My Own is a season, held by test/stall.mjs (seeds SA6, wage SA7) and
   by the two season checks below for its own practised line and the shared capped line */
const IDS = AR.GAMES.map((g) => g.id).filter((id) => id !== 'so');
const CURS = ['INR', 'USD', 'GBP', 'EUR', 'AED'];

console.log('\nThe games · docs/12 §1, §2.6–2.9\n' + '─'.repeat(56));
{ const { rng } = await import('../src/ui.js'); const n = [0, 0, 0, 0, 0, 0];
  for (let sd = 1; sd <= 600; sd++) n[Math.floor(rng(sd)() * 6)]++;
  ok('a seeded first roll is fair even for small seeds (seed 1, 2, 3… once all opened on a 1)', n.every((k) => k > 60 && k < 140), n.join(' ')); }
{ const { readFileSync } = await import('node:fs'); const src = readFileSync(new URL('../src/stall.js', import.meta.url), 'utf8');
  ok('Stall of My Own: its own practised line, and a capped week says the shared line (§1.4)', /You practised:<\/b> running a stall/.test(src) && /wage\.capped \? esc\(ctx\.cappedLine\)/.test(src) && AR.stallCtx && AR.stallCtx().cappedLine === AR.CAPPED_LINE); }

/* ── T3 · one sub-unit formatter, and every price adds up in every currency ── */
{
  const M = (cur, n) => { F.setCurrency(cur); return F.minorMoney(n); };
  ok('small amounts are written as the coin says them: 25¢, 20p, 50 fils, 50 ct',
    M('USD', 25) === '25¢' && M('GBP', 20) === '20p' && M('AED', 50) === '50 fils' && M('EUR', 50) === '50 ct', [M('USD', 25), M('GBP', 20), M('AED', 50), M('EUR', 50)].join(' '));
  ok('and bigger ones in the main unit, with pence only when there are pence',
    M('USD', 125) === '$1.25' && M('GBP', 300) === '£3' && M('INR', 7) === '₹7' && M('USD', -40) === '−40¢', [M('USD', 125), M('GBP', 300), M('INR', 7), M('USD', -40)].join(' '));
  /* a parser for what the formatter wrote, so a test can add up what is ON SCREEN */
  const back = (cur, s) => {
    const c = F.CURRENCIES[cur], neg = s.startsWith('−'), t = s.replace('−', '');
    if (c.sub && !t.startsWith(c.sign)) return (neg ? -1 : 1) * parseInt(t, 10);
    const num = t.slice(c.sign.length).replace(cur === 'EUR' ? /\./g : /,/g, '').replace(',', '.');
    return (neg ? -1 : 1) * Math.round(parseFloat(num) * (c.minor || 1));
  };
  const bad = [];
  for (const cur of CURS) {
    fresh(cur);
    /* Change Rush: every target and coin on screen is the formatter's, and a quarter is never "$25" */
    for (const seed of [3, 9, 27]) {
      AR.startGame('cr', seed, 'standard'); const g = R.game;
      const v = g.view();
      const need = (v.match(/id="crNeed">([^<]+)</) || [])[1];
      if (need !== F.minorMoney(g.st.target) || back(cur, need) !== g.st.target) bad.push(`${cur} cr target ${g.st.target} shown ${need}`);
      AR.quitGame();
    }
    /* Times Twelve: a year is twelve of the month AS SHOWN — in £ as in ₹ */
    for (const seed of [1, 2, 3]) {
      AR.startGame('tt', seed, 'standard'); const g = R.game;
      g.qs.forEach((q) => {
        if (q.tag === 'compare') return;
        const shown = (q.q.match(/<b>([^<]+) a (month|week)<\/b>/) || []);
        if (!shown[1]) return;
        const k = shown[2] === 'month' ? 12 : 52;
        if (back(cur, q.opts[q.a]) !== back(cur, shown[1]) * k) bad.push(`${cur} tt ${shown[1]} ×${k} ≠ ${q.opts[q.a]}`);
      });
      AR.quitGame();
    }
    /* Budget Blitz: the month left is the pot less what was paid, as shown */
    AR.startGame('bb', 5, 'standard'); { const g = R.game; let paid = 0;
      while (!g.st.done) { const b = g.st.order[g.st.i], amt = back(cur, (g.view().match(/<div class="big"[^>]*>([^<]+)</) || [])[1] || ''); const before = g.st.left; g.decide(true); if (g.st.left !== before) paid += amt; }
      if (g.st.left !== g.st.pot - paid) bad.push(`${cur} bb ${g.st.pot} − ${paid} ≠ ${g.st.left}`); }
    AR.quitGame();
    /* Stall Rush: takings are the sum of the prices on the queue's tags */
    AR.startGame('sr', 4, 'standard'); { const g = R.game; let sum = 0;
      for (let i = 0; i < 3000 && !g.st.done; i++) { g.advance(16); const c0 = g.st.q[0]; if (c0 && g.st.stock[c0.want]) { const tag = g.view().match(/<span class="pill">([^<]+)<\/span><\/div>/); const before = g.st.revenue; g.serve(c0.want); if (g.st.revenue !== before && tag) sum += back(cur, tag[1]); } }
      if (sum !== g.st.revenue) bad.push(`${cur} sr takings ${g.st.revenue} vs tags ${sum}`); }
    AR.quitGame();
    /* Today's till: built in this currency, it adds up and has one whole answer, every day of a year */
    let solvable = 0;
    for (let d = 0; d < 365; d++) {
      const p = puz.puzzle(d);
      const others = p.lines.reduce((t, l, i) => t + (i === p.hidden ? 0 : l.qty * l.each), 0), q = p.lines[p.hidden].qty;
      if (p.lines.reduce((t, l) => t + l.qty * l.each, 0) === p.total && (p.total - others) % q === 0 && (p.total - others) / q === p.answer && p.answer >= 1 && Number.isInteger(p.answer)) solvable++;
    }
    if (solvable !== 365) bad.push(`${cur} till solvable ${solvable}/365`);
    /* …and AS DRAWN: read the receipt off the card itself — every shown line, the shown total —
       and the missing price must come out a whole, positive amount, every day of a year */
    let drawn = 0;
    const whole = (s) => parseInt(String(s).replace(/<[^>]*>/g, '').replace(/[^\d]/g, ''), 10);
    for (let d = 0; d < 365; d++) {
      const html = tillCard(K(), d);
      const lines = [...html.matchAll(/<div class="tline">([\s\S]*?)<\/div>/g)].map((m) => ({ qty: +((m[1].match(/× (\d+)/) || [])[1] || 1), b: (m[1].match(/<b class="tabnum">([\s\S]*?)<\/b>/) || [])[1] || '' }));
      const total = whole((html.match(/slip-line total[\s\S]*?<b class="tabnum">([^<]+)<\/b>/) || [])[1]);
      const hid = lines.find((l) => /class="tq"/.test(l.b)), rest = lines.filter((l) => l !== hid).reduce((t, l) => t + l.qty * whole(l.b), 0);
      if (hid && (total - rest) > 0 && (total - rest) % hid.qty === 0) drawn++;
    }
    if (drawn !== 365) bad.push(`${cur} till as drawn solvable ${drawn}/365`);
    const c = K(), p = puz.puzzle(); const r = puz.guess(c, p.answer);
    if (!r.won || r.paid !== F.price(puz.WAGE)) bad.push(`${cur} till: typing the answer in ${cur} did not win`);
  }
  ok('in ₹ $ £ € and AED, every game\'s prices add up as shown, and the till is solvable 365/365', !bad.length, bad.slice(0, 4).join(' | '));
  F.setCurrency('INR');
}

/* ── T4 · a seed per play: two plays differ, one seed replays exactly ── */
{
  const print = (id, seed) => {
    fresh();
    AR.startGame(id, seed, 'standard'); const g = R.game;
    let out;
    if (id === 'cr') { for (let i = 0; i < 300; i++) g.advance(16); out = [g.st.target, g.st.drops.map((d) => d.lane + ':' + d.v)]; }
    else if (id === 'nw' || id === 'ss') out = g.items.map((x) => x.t);
    else if (id === 'tt' || id === 'sn') out = g.qs.map((q) => q.q + q.opts.join());
    else if (id === 'bb') out = g.st.order.map((b) => b.n);
    else if (id === 'cc') { for (let k = 0; k < 4; k++) { g.st.holding = true; g.st.charge = 60; g.release(); } out = g.st.hist; }
    else if (id === 'sr') { for (let i = 0; i < 600; i++) g.advance(16); out = g.st.q.map((c) => c.want).concat(g.st.lost); }
    else if (id === 'st') { for (let i = 0; i < 900; i++) g.advance(16); out = [g.st.shoutN, g.st.shout && g.st.shout[1], Math.round(g.st.val)]; }
    else if (id === 'mc') { for (let i = 0; i < 4; i++) g.act('mcAdj', 'rocket:10'); for (let w = 0; w < 6; w++) g.act('mcNext'); out = g.st.log; }
    else if (id === 'mn') { const rolls = []; withQueue((q) => { for (let i = 0; i < 400 && !g.g.done; i++) { if (q.length) { q.shift()(); continue; } if (g.g.phase === 'roll') { g.act('mnRoll'); rolls.push(g.g.die); } else if (g.g.phase === 'decide') g.act('mnBuy'); else if (g.g.phase === 'card') g.act('mnCard', 0); else break; } }); out = rolls.slice(0, 12); }
    AR.quitGame();
    return JSON.stringify(out);
  };
  const same = [], differ = [];
  for (const id of IDS) {
    if (print(id, 101) !== print(id, 101)) same.push(id);
    const a = print(id, 101), b = print(id, 202), c = print(id, 303);
    if (a === b && b === c) differ.push(id);
  }
  ok(`one seed replays exactly, in every game (${IDS.length})`, !same.length, same.join(','));
  ok('two plays with different seeds differ, in every game — no fixed 7717, 3391 or 60607 any more', !differ.length, differ.join(','));
  /* a play with no seed given draws its own, and keeps it with the round */
  fresh();
  AR.startGame('nw', null, 'standard'); const s1 = R.game.seed; AR.quitGame();
  AR.startGame('nw', null, 'standard'); const s2 = R.game.seed; AR.quitGame();
  const g = play('ss', 4242, 'standard');
  ok('an ordinary play draws its own seed, and the finished round is kept with its seed and level', s1 && s2 && s1 !== s2 && K().rounds && K().rounds.ss && K().rounds.ss.seed === 4242 && K().rounds.ss.tier === 'standard' && g.st.done,
    JSON.stringify(K().rounds && K().rounds.ss));
  /* content variety is never a reward: the wage reads the score, not the seed */
  const pay = [11, 22, 33].map((sd) => { fresh(); play('nw', sd, 'standard'); return AR.lastPay().units; });
  ok('the seed changes what you see, never what a perfect round pays', pay.every((x) => x === pay[0]), pay.join(','));
}

/* ── T5 · a wrong answer holds, with its note, until Continue ── */
{
  const rows = [];
  for (const id of ['nw', 'ss']) {
    fresh(); AR.startGame(id, 7, 'standard'); const g = R.game;
    const it = g.items[0], L = id === 'nw' ? { need: 'nwNeed', want: 'nwWant', other: { need: 'want', want: 'need' } } : { safe: 'ssSafe', scam: 'ssScam', other: { safe: 'scam', scam: 'safe' } };
    let k = 0; while (g.items[k].a === 'both') k++;
    /* answer the first card that has one right side, wrongly */
    for (let i = 0; i < k; i++) g.act(L[g.items[i].a === 'both' ? (id === 'nw' ? 'need' : 'safe') : g.items[i].a]);
    const card = g.items[k], wrongSide = L.other[card.a];
    g.act(L[wrongSide]);
    const v1 = g.view(), held = g.st.i === k && !!g.st.hold;
    const name = id === 'ss' ? card.t.split(/\s+/).slice(0, 6).join(' ') : card.t;
    const noteNames = held && g.st.note && g.st.note.text.includes(name.replace(/'/g, '\'')) && /is (a need|a want|a trap|real)/.test(g.st.note.text);
    const sameCard = v1.includes(esc(card.t)) && /data-act="tcNext"/.test(v1) && /disabled/.test(v1);
    g.key({ key: 'ArrowLeft' }); g.key({ key: 'ArrowRight' }); g.act(L[card.a]);
    const stillHeld = g.st.i === k && !!g.st.hold;
    g.key({ key: 'Enter' });
    const moved = g.st.i === k + 1 && !g.st.hold && !(g.st.note && g.st.note.text.includes(name));
    rows.push({ id, held, noteNames, sameCard, stillHeld, moved, note: g.st.note });
    AR.quitGame();
  }
  const esc0 = rows.every((r) => r.held && r.noteNames && r.sameCard && r.stillHeld && r.moved);
  ok('Needs vs Wants and Scam Spotter: a wrong card stays, naming the item and its right side; arrows and taps do nothing; Enter moves on', esc0,
    JSON.stringify(rows.map((r) => [r.id, r.held, r.noteNames, r.sameCard, r.stillHeld, r.moved])));
  /* the clock running out on Tricky holds too, and says so */
  fresh(); AR.startGame('nw', 7, 'tricky'); { const g = R.game; const realNow = Date.now;
    g.stop(); g.st.left = 0; g.resume(); await new Promise((r) => setTimeout(r, 20));
    ok('Tricky\'s card clock running out holds the card with its answer, the same as a wrong tap', g.st.hold && g.st.i === 0 && /clock ran out/.test(g.st.note.text), g.st.note && g.st.note.text);
    AR.quitGame(); Date.now = realNow; }
  /* the quiz drills hold a wrong pick, with the working, until Next */
  fresh(); AR.startGame('tt', 3, 'standard'); { const g = R.game, q = g.qs[0];
    g.choose((q.a + 1) % 4); const v = g.view(); g.choose(q.a);
    ok('the drills hold a wrong pick with the working shown, until Next', g.st.i === 0 && g.st.pick === (q.a + 1) % 4 && /data-act="ttNext"/.test(v) && v.includes(q.why), `pick ${g.st.pick}`);
    AR.quitGame(); }
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

/* ── T6 · every game and job writes its own end card ── */
{
  const own = [], capped = [];
  for (const id of IDS) {
    fresh();
    let v = '';
    for (let k = 0; k < 4; k++) { const g = play(id, 50 + k, 'standard'); v = g.view(); if (k === 0) { const others = IDS.filter((x) => x !== id && AR.PRACTISED[x] && v.includes(esc(AR.PRACTISED[x]))); if (!v.includes(esc(AR.PRACTISED[id])) || others.length) own.push(id); } }
    /* the fourth play of a day is practice, and says why */
    if (!v.includes(esc(AR.CAPPED_LINE)) || /Earned ₹0/.test(v)) capped.push(id);
    AR.quitGame();
  }
  ok(`every game's end card says what THAT game practised (${IDS.length} games)`, !own.length, own.join(','));
  ok('a capped play says so: "Paid plays used for today: this one is practice, and it still counts toward your goals"', !capped.length, capped.join(','));
  /* a job's card is the job's own, never the last arcade game's */
  fresh(); play('cr', 1, 'standard'); AR.quitGame();
  const jobs = [];
  for (const id of ['crates', 'cargo', 'sweep', 'flyers']) {
    const g = startJobGame(id, () => {}, { tier: 'standard' });
    for (let i = 0; i < 200; i++) g.__tick(16);
    g.st.score = JT.jobPar(id, 'standard'); g.st.end();
    for (let i = 0; i < 200 && !g.st.done; i++) g.__tick(16);
    const v = g.view(), kind = JT.JOB_GAME[id].kind;
    jobs.push([id, v.includes(esc(JOB_PRACTISED[kind])) && !v.includes(esc(AR.PRACTISED.cr)) && !v.includes('Change Rush')]);
  }
  ok('every job\'s end card carries its own "You practised" line, not the last arcade game\'s', jobs.every((j) => j[1]), JSON.stringify(jobs));
  {
    const id = 'crates', g = startJobGame(id, () => {}, { tier: 'standard' });
    K().jobs[id] = F.dayIndex(Date.now());    /* already paid today */
    for (let i = 0; i < 200; i++) g.__tick(16);
    g.st.score = 30; g.st.end(); for (let i = 0; i < 200 && !g.st.done; i++) g.__tick(16);
    const v = g.view();
    ok('a job already paid today says its shift is practice, in its own words — not "Earned ₹0."', /Paid shift used for today/.test(v) && !/Earned ₹0/.test(v), (v.match(/class="small muted endpay">([^<]+)/) || [])[1]);
  }
}

/* ── T17 · the level rule: offered, never forced ── */
{
  const L = (t, s) => AR.levelOffer(t, s) || { to: null };
  ok('under 50% of par offers one down, 50% keeps, 1.6× par offers one up — and there is nothing past Easy or Tricky',
    L('standard', 0.49).to === 'easy' && L('standard', 0.5).to === null && L('standard', 1.59).to === null && L('standard', 1.6).to === 'tricky'
    && L('easy', 0.1).to === null && L('tricky', 3).to === null && L('easy', 2).to === 'standard' && L('tricky', 0.2).to === 'standard');
  /* played: a bad round on Standard offers Easy, and nothing changes until the child says so */
  fresh();
  let g = play('nw', 3, 'standard', 'wrong'); let v = g.view();
  const offeredDown = /data-act="gLevel" data-arg="nw:easy"/.test(v) && JT.tierOf(K(), 'nw') === 'standard';
  g.key({ key: 'l' }); const took = JT.tierOf(K(), 'nw') === 'easy';
  ok('a round under half of par offers Easy on the end card; the level stays Standard until L (or the button) takes it', offeredDown && took, `offered ${offeredDown}, took ${took}`);
  AR.quitGame();
  fresh();
  g = play('ss', 3, 'standard'); v = g.view();
  ok('a perfect round offers Tricky — and only offers', /data-arg="ss:tricky"/.test(v) && JT.tierOf(K(), 'ss') === 'standard');
  AR.quitGame();
  fresh(); g = play('cr', 5, 'standard'); const sh = K().rounds.cr.share; v = g.view();
  ok('a middling round (between half and 1.6× par) offers nothing', sh < 0.5 || sh >= 1.6 || !/data-act="gLevel"/.test(v), `share ${sh}`);
  AR.quitGame();
  /* and a job's shift: the same rule, offered on its own card */
  {
    fresh(); const id = 'cargo', g = startJobGame(id, () => {}, { tier: 'standard' });
    for (let i = 0; i < 200; i++) g.__tick(16);
    g.st.score = Math.ceil(JT.jobPar(id, 'standard') * 1.7); g.st.end(); for (let i = 0; i < 200 && !g.st.done; i++) g.__tick(16);
    const v = g.view(), offered = /data-act="jgLevel" data-arg="tricky"/.test(v) && JT.tierOf(K(), id) === 'standard';
    g.act('jgLevel', 'tricky');
    ok('a shift at 1.6× par or more offers the next level on its card, and only the child\'s tap takes it', offered && JT.tierOf(K(), id) === 'tricky', `offered ${offered}, now ${JT.tierOf(K(), id)}`);
  }
  /* every game reports a decision share, so the rule reaches all of them */
  const shares = IDS.map((id) => { fresh(); play(id, 9, 'standard'); const r = K().rounds[id]; AR.quitGame(); return [id, r && r.share]; });
  ok('every game finishes with a decision score against its par, so the level rule applies to all of them', shares.every(([, s]) => Number.isFinite(s)), shares.map(([i, s]) => `${i} ${s}`).join(' · '));
}

/* ── §2.6 · the Market Cup: the best moves, the trend shows, copying Bella is a tie ── */
{
  fresh();
  const c = K(); c.market.best = '2nd of 4 · cup score 40';    /* a best from before: the first finish, kept for ever */
  const cupWith = (alloc, seed) => { AR.startGame('mc', seed, 'standard'); const g = R.game; alloc.forEach((a) => g.act('mcAdj', a)); for (let w = 0; w < 6; w++) g.act('mcNext'); return g; };
  const spread = ['basket:10', 'basket:10', 'basket:10', 'basket:10', 'grain:10', 'grain:10', 'chai:10', 'chai:10', 'rocket:10', 'rocket:10'];
  const totals = [];
  for (const sd of [1, 2, 3, 4, 5]) { const g = cupWith(spread, sd); totals.push(g.st.score.total); AR.quitGame(); }
  const best = Math.max(40, ...totals);
  ok('the best cup score updates whenever a cup beats it (it used to be the first finish, for ever)', c.market.bestScore === best && c.market.best.includes('cup score ' + best), `${c.market.best} · totals ${totals.join(',')}`);
  ok('the last cups are kept, so the trend across seasons can be shown', Array.isArray(c.market.cups) && c.market.cups.join() === totals.join() && /last cups/.test(AR.viewArcade()), c.market.cups && c.market.cups.join(' → '));
  const g = cupWith(Array(10).fill('basket:10'), 6); const v = g.view();
  ok('copying Boring Bella ties with her, shown as a tie — never "You won the Cup"', g.st.tiedWith.includes('Boring Bella') && /a tie with/.test(v) && !/You won the Cup/.test(v) && g.st.table.find((x) => x.who === 'You').place === g.st.table.find((x) => x.who === 'Boring Bella').place,
    (v.match(/<h2>([^<]+)<\/h2>/) || [])[1]);
  ok('the Cup\'s end card has the trend and its own practised line', /cuptrend/.test(v) && v.includes(esc(AR.PRACTISED.mc)));
  AR.quitGame();
}

/* ── §2.8 · Change Rush: an overpay says by how much, and which coin would have been exact ── */
{
  for (const cur of ['INR', 'USD']) {
    fresh(cur);
    AR.startGame('cr', 77, 'standard'); const g = R.game;
    /* catch until one coin too many: stand under every coin */
    for (let i = 0; i < 6000 && !g.st.over && !g.st.done; i++) { const d = g.st.drops.slice().sort((a, b) => b.y - a.y)[0]; if (d) g.st.lane = d.lane; g.advance(16); }
    const o = g.st.over;
    const coins = F.CURRENCIES[cur].coins;
    const sums = o && o.fix.reduce((t, x) => t + x, 0) === o.need && o.fix.every((x) => coins.includes(x));
    ok(`${cur}: after an overpay the label reads "Over by ${F.minorMoney(1).replace(/\d+/, 'N')}" and names the coin(s) that would have made it exact`,
      o && o.text === 'Over by ' + F.minorMoney(o.by) && sums && o.hint.includes(F.minorMoney(o.need)) && g.st.msg.includes(o.hint), o && `${o.text} · ${o.hint}`);
    AR.quitGame();
  }
}

/* ── §2.9 · Main Street: through the cap, quests on finish, a face on every token ── */
{
  const c = fresh();
  c.quests = { list: ['q-play', 'q-board'], prog: {}, claimed: {} };
  AR.introView('mn');
  const before = JSON.stringify(c.quests.prog);
  const g = play('mn', 8, 'standard');
  ok('Main Street\'s quests tick when the game is FINISHED, not when its title card opens', before === '{}' && g.g.done && c.quests.prog['q-board'] === 1 && c.quests.prog['q-play'] === 1, `${before} → ${JSON.stringify(c.quests.prog)}`);
  const { readFileSync } = await import('node:fs');
  const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const opener = (mainSrc.match(/on\('game', \(id\) => \{[\s\S]*?\n\}\);/) || [''])[0];
  ok('opening a game\'s title card ticks no quest (main.js on("game"))', opener && !/questTick/.test(opener.replace(/\/\*[\s\S]*?\*\//g, '')), opener.split('\n').length + ' lines');
  AR.startGame('mn', 9, 'standard'); const v = R.game.view();
  ok('a token on the board is a face (an avatar or the cast\'s portrait), not a coloured dot', /class="mstok"[^>]*><img [^>]*alt="You"/.test(v) && /alt="Mags"/.test(v), (v.match(/class="mstok"[^>]*>[^]{0,80}/) || [])[0]);
  AR.quitGame();
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
