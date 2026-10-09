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
const { play, withQueue, typed } = await import('./_bots.mjs');
const MS = await import('../src/monthsim.js');
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
    /* Better Buy: a tag's price of one is its price AS SHOWN over its count, in whole coins, and
       the price typed as a child would type it in this currency is checked right */
    for (const lv of ['easy', 'standard', 'tricky']) for (const seed of [1, 2, 3]) {
      AR.startGame('sc', seed, lv); const g = R.game; g.act('scMode', 'bb');
      while (!g.st.done) {
        const sh = g.st.deck[g.st.i], v = g.view();
        const shown = [...v.matchAll(/<b class="scprice tabnum">([^<]+)<\/b>/g)].map((m) => back(cur, m[1].replace(/ for 2$/, '')));
        sh.tags.forEach((t, i) => { if (shown[i] !== t.price || !Number.isInteger(shown[i] / t.count)) bad.push(`${cur} bb tag ${i} shown ${shown[i]} ≠ ${t.price} or not whole over ${t.count}`); });
        g.act('scShelf', sh.answer); for (const ch of typed(sh.asks[sh.answer])) g.act('scKey', ch); g.act('scCheck');
        if (!g.st.held || !g.st.held.typedOk) bad.push(`${cur} bb typed ${typed(sh.asks[sh.answer])} not taken as ${sh.asks[sh.answer]}`);
        g.act('scNext');
      }
      AR.quitGame();
    }
    /* the Month Planner: a year is twelve (or fifty-two) of the bill AS SHOWN, and the money
       left is the month's money less what was paid, as shown */
    for (const seed of [1, 2, 3, 4, 5]) {
      AR.startGame('mp', seed, 'standard'); const g = R.game; let paid = 0;
      while (!g.st.done) {
        const L = g.ledger, v = g.view();
        if (g.st.step === 'yearly') {
          const each = back(cur, (v.match(/is ([^ ]+) a (month|week)\. What does it cost/) || [])[1] || '') / (F.CURRENCIES[cur].minor || 1);
          const y = g.st.round.yearly;
          if (each !== y.each || y.want !== each * (y.per === 'week' ? 52 : 12)) bad.push(`${cur} mp yearly ${each} × ${y.times} ≠ ${y.want}`);
          for (const ch of String(y.want)) g.act('mpKey', ch); g.act('mpCheck'); g.act('mpCheck');
        } else if (g.st.step === 'bill') {
          /* the Month Planner counts in whole coins of the main unit (price()), the parser in the smallest */
          const amt = back(cur, (v.match(/<div class="big tabnum">([^<]+)</) || [])[1] || '') / (F.CURRENCIES[cur].minor || 1), b = MS.mpBill(L), n0 = L.paid.length + L.late.length;
          if (amt !== b.amt) bad.push(`${cur} mp bill shown ${amt} ≠ ${b.amt}`);
          g.act(b.amt <= L.cash ? 'mpPay' : 'mpSkip'); if (L.paid.length + L.late.length > n0) paid += amt;
        } else if (g.st.step === 'month') {
          const left = g.st.summary.left, pot = g.st.round.months.slice(0, g.st.summary.m + 1).reduce((t, M) => t + M.pot, 0);
          if (left !== pot - paid) bad.push(`${cur} mp month ${g.st.summary.m}: ${pot} − ${paid} ≠ ${left}`);
          g.act('mpNext');
        }
      }
      AR.quitGame();
    }
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
    else if (id === 'sc') out = [g.deck('nw').map((x) => x.t), g.deck('ss').map((x) => x.t), g.deck('bb').map((x) => x.good.id + x.tags.map((t) => t.count + '/' + t.price).join())];
    else if (id === 'mp') out = [g.st.round.months.map((M) => M.pot + ':' + M.bills.map((b) => b.n + b.amt).join()), g.st.round.yearly.want];
    else if (id === 'cc') { for (let k = 0; k < 4; k++) { g.st.holding = true; g.st.charge = 60; g.release(); } out = g.st.hist; }
    else if (id === 'sr') { for (let i = 0; i < 600; i++) g.advance(16); out = g.st.q.map((c) => c.want).concat(g.st.lost); }
    else if (id === 'st') { g.act('stRule', 'never'); g.act('stWhy', 'card'); g.act('stGo'); for (let i = 0; i < 900; i++) g.advance(16); out = [g.def.co.id, g.def.stops, g.def.whys.map((w) => w.id).join(''), g.st.news.map((h) => h.text.slice(0, 12)), g.st.shoutN, g.st.shout && g.st.shout[1], Math.round(g.st.val)]; }
    else if (id === 'mc') { for (let i = 0; i < 4; i++) g.act('mcAdj', 'rocket:10'); for (let w = 0; w < 6; w++) g.act('mcNext'); out = g.st.log; }
    else if (id === 'sb') out = g.st.round.goals.map((x) => [x.thing.id, x.price, x.paths.map((q) => q.id).join('/')]);
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
  AR.startGame('sc', null, 'standard'); const s1 = R.game.seed; AR.quitGame();
  AR.startGame('sc', null, 'standard'); const s2 = R.game.seed; AR.quitGame();
  const g = play('sc', 4242, 'standard', 'best', { mode: 'ss' });
  ok('an ordinary play draws its own seed, and the finished round is kept with its seed and level', s1 && s2 && s1 !== s2 && K().rounds && K().rounds.sc && K().rounds.sc.seed === 4242 && K().rounds.sc.tier === 'standard' && g.st.done,
    JSON.stringify(K().rounds && K().rounds.sc));
  /* content variety is never a reward: the wage reads the score, not the seed */
  const pay = [11, 22, 33].flatMap((sd) => ['nw', 'ss', 'bb'].map((mode) => { fresh(); play('sc', sd, 'standard', 'best', { mode }); return AR.lastPay().units; }))
    .concat([11, 22, 33].map((sd) => { fresh(); play('mp', sd, 'standard'); return AR.lastPay().units; }));
  ok('the seed changes what you see, never what a perfect round pays', pay.every((x) => x === pay[0]), pay.join(','));
}

/* ── T5 · a wrong answer holds, with its note, until Continue ── */
{
  /* Smart Choices' two sorting tables: the wrong card stays, its note naming the thing and the
     right side; every other key and tap does nothing; Enter (or Continue) moves on */
  const rows = [];
  for (const mode of ['nw', 'ss']) {
    fresh(); AR.startGame('sc', 7, 'standard'); const g = R.game; g.act('scMode', mode);
    let k = 0; while (g.st.deck[k].a === 'both') k++;
    for (let i = 0; i < k; i++) { const c = g.st.deck[i]; if (mode === 'nw') { g.act('scSide', c.a); if (c.a === 'both') g.act('scChip', c.reason); } }
    const card = g.st.deck[k];
    if (mode === 'nw') g.act('scSide', card.a === 'need' ? 'want' : 'need'); else g.act('scCall', card.a === 'scam' ? 'safe' : 'scam');
    const v1 = g.view(), held = g.st.i === k && !!g.st.held;
    const name = mode === 'ss' ? card.t.split(/\s+/).slice(0, 6).join(' ') : card.t;
    const noteNames = held && g.st.held.text.includes(name) && /is (a need|a want|a trap|real)/.test(g.st.held.text);
    const sameCard = v1.includes(esc(card.t.split(/\s+/).slice(0, 3).join(' '))) && /data-act="scNext"/.test(v1) && /disabled/.test(v1);
    g.key({ key: 'ArrowLeft' }); g.key({ key: 'ArrowRight' }); g.key({ key: '2' });
    if (mode === 'nw') g.act('scSide', card.a); else g.act('scCall', card.a);
    const stillHeld = g.st.i === k && !!g.st.held;
    g.key({ key: 'Enter' });
    const moved = g.st.i === k + 1 && !g.st.held;
    rows.push({ mode, held, noteNames, sameCard, stillHeld, moved });
    AR.quitGame();
  }
  ok('Smart Choices (Needs and Wants, Scam Spotter): a wrong card stays, naming the thing and its right side; keys and taps do nothing; Enter moves on', rows.every((r) => r.held && r.noteNames && r.sameCard && r.stillHeld && r.moved),
    JSON.stringify(rows.map((r) => [r.mode, r.held, r.noteNames, r.sameCard, r.stillHeld, r.moved])));
  /* "both" without its reason is not a point: the wrong chip holds and names the right reason */
  fresh(); AR.startGame('sc', 7, 'standard'); { const g = R.game; g.act('scMode', 'nw');
    const k = g.st.deck.findIndex((c) => c.a === 'both');
    for (let i = 0; i < k; i++) { const c = g.st.deck[i]; g.act('scSide', c.a); }
    const c = g.st.deck[k]; g.act('scSide', 'both'); const asked = g.st.step === 'reason' && !g.st.held && g.st.points === k;
    g.act('scChip', (c.reason + 1) % c.chips.length);
    ok('Needs and Wants: “both” asks for its reason; the wrong reason holds, naming the right one, and scores nothing', asked && g.st.held && g.st.points === k && g.st.held.text.includes(c.why[0].slice(1, 20)), g.st.held && g.st.held.text);
    AR.quitGame(); }
  /* the giveaway: after "It's a trap", a wrong phrase holds and lights the real tells */
  fresh(); AR.startGame('sc', 7, 'standard'); { const g = R.game; g.act('scMode', 'ss');
    const k = g.st.deck.findIndex((m) => m.a === 'scam');
    for (let i = 0; i < k; i++) g.act('scCall', 'safe');
    const m = g.st.deck[k]; g.act('scCall', 'scam');
    const tellStep = g.st.step === 'tell';
    const wrong = m.ph.findIndex((p, i) => !m.tells.includes(i)); g.act('scTell', wrong);
    const v = g.view();
    ok('Scam Spotter: after "It\'s a trap" comes the giveaway; a wrong phrase holds, with the real tells lit and named', tellStep && g.st.held && g.st.i === k && m.tells.every((i) => g.st.held.text.includes(m.ph[i].t)) && (v.match(/class="opt sctell ok"/g) || []).length === m.tells.length,
      g.st.held && g.st.held.text);
    AR.quitGame(); }
  /* Better Buy: every shelf holds with its working until Continue, right or wrong */
  fresh(); AR.startGame('sc', 7, 'standard'); { const g = R.game; g.act('scMode', 'bb');
    const sh = g.st.deck[0]; g.act('scShelf', 1 - sh.answer); for (const ch of '1') g.act('scKey', ch); g.act('scCheck');
    const v = g.view(); g.act('scShelf', sh.answer); g.key({ key: '1' });
    ok('Better Buy: a wrong pick and a wrong price hold, with both prices of one worked out, until Continue', g.st.i === 0 && g.st.held && !g.st.held.pickOk && /class="scwork"/.test(v) && /data-act="scNext"/.test(v) && g.st.typed === '1', g.st.typed);
    AR.quitGame(); }
  /* the clock running out on Tricky holds too, and says so */
  fresh(); AR.startGame('sc', 7, 'tricky'); { const g = R.game; g.act('scMode', 'nw');
    const before = !!g.st.held;
    g.stop(); g.st.left = 0; g.resume(); await new Promise((r) => setTimeout(r, 20));
    ok('Tricky\'s card clock running out holds the card with its answer, the same as a wrong tap', !before && g.st.held && g.st.i === 0 && /clock ran out/.test(g.st.held.text), g.st.held && g.st.held.text);
    AR.quitGame(); }
  /* the Month Planner's typed year holds a wrong sum with the working and the common slips, until Continue */
  fresh(); AR.startGame('mp', 3, 'standard'); { const g = R.game, y = g.st.round.yearly;
    while (g.st.step !== 'yearly') g.act('mpSkip');
    for (const ch of String(y.each * 10)) g.act('mpKey', ch); g.act('mpCheck');
    const v = g.view(); g.act('mpPay'); g.act('mpKey', '5');
    const held = g.st.step === 'yearly' && g.ledger.yearly && !g.ledger.yearly.ok;
    g.key({ key: 'Enter' });
    ok('Month Planner: a wrong yearly sum holds with the working and the ×10 / ×4 slips (the one typed marked), until Enter', held && v.includes(`× ${y.times} = `) && /class="mpslips"/.test(v) && /class="small hit"/.test(v) && g.st.step === 'bill', `${y.each} × ${y.times}`);
    AR.quitGame(); }
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

/* ── T6 · every game and job writes its own end card ── */
{
  const own = [], capped = [];
  for (const id of IDS) {
    fresh();
    let v = '';
    for (let k = 0; k < 4; k++) {
      const mode = ['nw', 'ss', 'bb', 'nw'][k], g = play(id, 50 + k, 'standard', 'best', { mode }); v = g.view();
      /* Smart Choices writes the line of the table it played (§1.4) */
      const want = id === 'sc' ? AR.SC_PRACTISED[mode] : AR.PRACTISED[id];
      const others = IDS.filter((x) => x !== id && AR.PRACTISED[x] && v.includes(esc(AR.PRACTISED[x]))).concat(id === 'sc' ? Object.keys(AR.SC_PRACTISED).filter((m) => m !== mode && v.includes(esc(AR.SC_PRACTISED[m]))) : []);
      if (!v.includes(esc(want)) || others.length) own.push(id + (id === 'sc' ? ':' + mode : ''));
    }
    /* the fourth play of a day is practice, and says why */
    if (!v.includes(esc(AR.CAPPED_LINE)) || /Earned ₹0/.test(v)) capped.push(id);
    AR.quitGame();
  }
  ok(`every game's end card says what THAT game practised (${IDS.length} games)`, !own.length, own.join(','));
  ok('a capped play says so: "Paid plays used for today: this one is practice, and it still counts toward your goals"', !capped.length, capped.join(','));
  /* a job's card is the job's own (its practised line, its paid-today notice in the shared
     words): the Shift engine replaced the reflex jobs, and test/shifts.mjs holds those now */
}

/* ── T17 · the level rule: offered, never forced ── */
{
  const L = (t, s) => AR.levelOffer(t, s) || { to: null };
  ok('under 50% of par offers one down, 50% keeps, 1.6× par offers one up — and there is nothing past Easy or Tricky',
    L('standard', 0.49).to === 'easy' && L('standard', 0.5).to === null && L('standard', 1.59).to === null && L('standard', 1.6).to === 'tricky'
    && L('easy', 0.1).to === null && L('tricky', 3).to === null && L('easy', 2).to === 'standard' && L('tricky', 0.2).to === 'standard');
  /* played: a bad round on Standard offers Easy, and nothing changes until the child says so */
  fresh();
  let g = play('sc', 3, 'standard', 'wrong'); let v = g.view();
  const offeredDown = /data-act="gLevel" data-arg="sc:easy"/.test(v) && JT.tierOf(K(), 'sc') === 'standard';
  g.key({ key: 'l' }); const took = JT.tierOf(K(), 'sc') === 'easy';
  ok('a round under half of par offers Easy on the end card; the level stays Standard until L (or the button) takes it', offeredDown && took, `offered ${offeredDown}, took ${took}`);
  AR.quitGame();
  fresh();
  g = play('sc', 3, 'standard', 'best', { mode: 'ss' }); v = g.view();
  ok('a perfect round offers Tricky — and only offers', /data-arg="sc:tricky"/.test(v) && JT.tierOf(K(), 'sc') === 'standard');
  AR.quitGame();
  fresh(); g = play('cr', 5, 'standard'); const sh = K().rounds.cr.share; v = g.view();
  ok('a middling round (between half and 1.6× par) offers nothing', sh < 0.5 || sh >= 1.6 || !/data-act="gLevel"/.test(v), `share ${sh}`);
  AR.quitGame();
  /* a job's shift: the same rule on its own card — held in test/shifts.mjs (§1.7) */
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
  /* §2.6 · seasons drawn per play from an authored series (watched failing with seasonFor
     pinned to the first season: one kind of season, for ever) */
  const CUP = await import('../src/cup.js');
  const dealt = new Set(Array.from({ length: 300 }, (_, i) => CUP.seasonFor(i + 1).id));
  ok('the Cup deals its seasons per play from an authored series of at least six, and 300 plays meet every one', CUP.CUP_SERIES.length >= 6 && dealt.size === CUP.CUP_SERIES.length, `${dealt.size} of ${CUP.CUP_SERIES.length}`);
  const kn = AR.ARCADE_TIERS.mc.standard, seedOf = (id) => Array.from({ length: 300 }, (_, i) => i + 1).find((sd) => CUP.seasonFor(sd).id === id);
  const worst = (sd) => { const rows = CUP.cupRows(kn, sd); return rows.map((r) => r.basket).indexOf(Math.min(...rows.map((r) => r.basket))); };
  /* Rocket Rickshaws over six weeks, averaged over twenty plays of the season */
  const rk = (id) => { const sds = Array.from({ length: 2000 }, (_, i) => i + 1).filter((sd) => CUP.seasonFor(sd).id === id).slice(0, 20);
    return sds.reduce((t, sd) => t + CUP.cupRows(kn, sd).reduce((m, r) => m * (1 + r.rocket), 1), 0) / sds.length; };
  ok('a season is the shape it says: the red week early, late, and Rocket Rickshaws up in its season and down in its bust',
    worst(seedOf('early')) === 1 && worst(seedOf('late')) === 5 && rk('rocket') > 1.15 && rk('bust') < 0.9, `rocket ×${rk('rocket').toFixed(2)} · bust ×${rk('bust').toFixed(2)}`);
  /* copying Bella is a tie in every kind of season, and the record says which seasons and how you did against her */
  fresh();
  const ties = CUP.CUP_SERIES.map((s) => { const g = cupWith(Array(10).fill('basket:10'), seedOf(s.id)); const t = g.st.tiedWith.includes('Boring Bella') && g.st.vsBella === 'tie'; AR.quitGame(); return t; });
  ok('copying Bella is a tie in every kind of season in the series', ties.every(Boolean), ties.join(','));
  const g2 = cupWith(spread, seedOf('rocket')); const v2 = g2.view();
  ok('the end card names the season you were dealt, how many of the series you have met, and your last cups against Bella', v2.includes(esc(g2.season.name)) && /of the 8 kinds of season/.test(v2) && /Against Bella, your last/.test(v2)
    && Object.keys(K().market.seasons).length === CUP.CUP_SERIES.length && K().market.vsBella.length === 8, (v2.match(/<p class="small cupseason">([\s\S]*?)<\/p>/) || [])[1]);
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
  /* cash-flow pressure: over-buying can force a sale at half price; a cushion keeps you out of it.
     Watched failing with the pressure dials at zero (rates 0, repair 0): the always-buyer then
     sold in 27 games of 200 (it needs one in five, 40). */
  const BD = await import('../src/board.js');
  const mnRun = (sd, buy) => { fresh(); AR.startGame('mn', sd, 'standard'); const gm = R.game;
    withQueue((q) => { for (let i = 0; i < 20000 && !gm.g.done; i++) { if (q.length) { q.shift()(); continue; }
      const ph = gm.g.phase, me = gm.g.players[gm.g.turn]; if (!me.human) break;
      if (ph === 'roll') gm.act('mnRoll'); else if (ph === 'decide') gm.act(buy(me, BD.SQUARES[gm.g.sq]) ? 'mnBuy' : 'mnPass'); else if (ph === 'card') gm.act('mnCard', 0); else break; } });
    const me = gm.g.players[0]; AR.quitGame(); return { sold: me.sold, owned: me.own.length }; };
  const N = 200, all = [], cush = [];
  for (let sd = 1; sd <= N; sd++) { all.push(mnRun(sd, (me, sq) => me.cash >= sq.cost)); cush.push(mnRun(sd, (me, sq) => me.cash - sq.cost >= BD.cushionFor(me))); }
  const forced = (rs) => rs.filter((x) => x.sold > 0).length;
  ok('Main Street: buying everything you can afford forces a sale at half price in at least one game in five, and three times as often as keeping a cushion',
    forced(all) >= N / 5 && forced(all) >= 3 * Math.max(1, forced(cush)), `always-buy ${forced(all)}/${N} · cushion ${forced(cush)}/${N}`);
  ok('and the "never sold at half price" goal is something a careful player meets and a greedy one often misses',
    cush.filter((x) => x.owned >= 1 && x.sold === 0).length > all.filter((x) => x.owned >= 1 && x.sold === 0).length * 0.8 && cush.filter((x) => x.owned >= 1).length > N / 2);
  { const p = { own: [1, 3, 5], cash: 0 };
    ok('every shop you own adds the town\'s rates to a bill, and the repair card costs a share of your dearest shop',
      BD.billFor(p, BD.SQUARES[19]) === 20 + 3 * BD.MN.rates && BD.CARDS.find((x) => x.id === 'leak').run({}, p).cash === -Math.round(100 * BD.MN.repair)); }
  /* the buy card says what buying leaves beside what a bad week costs */
  fresh(); AR.startGame('mn', 9, 'standard'); { const gm = R.game; gm.g.phase = 'decide'; gm.g.sq = 18; gm.g.players[0].cash = 280;
    const thin = gm.view(); gm.g.players[0].cash = 600; const fat = gm.view();
    ok('the buy card says what buying leaves, and warns when one bill would force a half-price sale', /Leaves 20; a bad week is \d+\. A bill could force a half-price sale/.test(thin) && /Leaves 340; a bad week is \d+\.</.test(fat), (thin.match(/Leaves [^<]*/) || [])[0]);
    AR.quitGame(); }
  AR.startGame('mn', 9, 'standard'); const v = R.game.view();
  ok('a token on the board is a face (an avatar or the cast\'s portrait), not a coloured dot', /class="mstok"[^>]*><img [^>]*alt="You"/.test(v) && /alt="Mags"/.test(v), (v.match(/class="mstok"[^>]*>[^]{0,80}/) || [])[0]);
  AR.quitGame();
}

/* ── §2.5 (T11) · Market Storm: the plan is the game ──
   Watched failing first: panic at 100 selling for you again (the do-nothing bot "sold"),
   the one-in-five dial at 0 (no storm ever stopped), and a score that read the price. */
{
  const { storm } = await import('./_bots.mjs');
  const SM = await import('../src/storm.js');
  const { STORM } = SM;
  /* the storms themselves: one in five stops, a fine one never falls by half, the headline says so */
  const defs = Array.from({ length: 1000 }, (_, i) => SM.stormFor(i + 1));
  const stops = defs.filter((d) => d.stops), fine = defs.filter((d) => !d.stops);
  /* the figures on the sources page are the dials the games use (rule six) */
  { const { SOURCES } = await import('../src/sources.js'); const BD0 = await import('../src/board.js'); const CUP0 = await import('../src/cup.js');
    const sv = SOURCES.storm.value(), mv = SOURCES.mainstreet.value(), cv = SOURCES.cup.value();
    ok('sources.js states the storm, the Cup and Main Street dials as the games use them',
      sv.includes(`${Math.round(STORM.fall[0] * 100)}–${Math.round(STORM.fall[1] * 100)} in every 100`) && sv.includes(`${Math.round(STORM.stops * 100)} storms in 100`)
      && mv.includes(`adds ${BD0.MN.rates} to a bill`) && mv.includes(`${Math.round(BD0.MN.repair * 100)} in every 100`)
      && cv.startsWith('eight kinds of six weeks') && CUP0.CUP_SERIES.length === 8 && CUP0.CUP_WEEKS === 6, `${sv} | ${mv} | ${cv}`); }
  ok('about one storm in five is a company that really stops making money (drawn from the seed)', stops.length > 150 && stops.length < 250, `${stops.length} of 1000`);
  const floor = Math.min(...fine.map((d) => Math.min(...Array.from({ length: 201 }, (_, k) => SM.stormValue(d, k / 200))))) - SM.WOBBLE / 2;
  ok('a storm where the company is fine never falls as far as half, so "if it falls by half" only fires on real trouble', floor > SM.HALF, `lowest ${Math.round(floor)} vs half ${SM.HALF}`);
  ok('in every storm that stops, a headline says "stopped making money" at the moment it does; in a fine storm no headline ever says it',
    stops.every((d) => d.news.some((h) => h.kind === 'fact' && h.at === d.factMs && /stopped making money/.test(h.text)))
    && fine.every((d) => !d.news.some((h) => /stopped making money/.test(h.text))));
  ok('every play offers the card\'s own reason to have bought, beside the price and the crowd, in its own order',
    defs.every((d) => d.whys.length === 3 && d.whys.find((w) => w.id === 'card').t === d.co.why) && new Set(defs.slice(0, 30).map((d) => d.whys.map((w) => w.id).join())).size > 1);
  const seeds = Array.from({ length: 80 }, (_, i) => 900 + i * 13);
  /* a do-nothing bot is never auto-sold: on Tricky, with no re-reading, the panic fills and nothing happens */
  fresh();
  const idle = seeds.map((sd) => { const g = storm(sd, 'idle', 'never', 'tricky'); const o = { sold: g.st.sold, done: g.st.done, t: g.st.t, full: g.st.maxPanic >= 100 }; AR.quitGame(); return o; });
  ok('T11 · a do-nothing bot is never sold for: the storm runs to its end even with the panic full', idle.every((o) => o.done && !o.sold && o.t >= STORM.len) && idle.some((o) => o.full),
    `${idle.filter((o) => o.sold).length} sold · ${idle.filter((o) => o.full).length} storms with the panic full`);
  /* a random presser scores 30% or less */
  fresh();
  const mash = seeds.map((sd) => { storm(sd, 'mash'); const s = K().rounds.st.share / AR.PERFECT; AR.quitGame(); return s; });
  const mavg = mash.reduce((t, x) => t + x, 0) / mash.length;
  ok('T11 · a random-press bot scores 30% or less', mavg <= 0.3, `${Math.round(mavg * 100)}% over ${seeds.length} storms`);
  /* in a storm that stops, keeping to a plan that says sell scores highest; in a fine one, holding does */
  const stopSeeds = Array.from({ length: 400 }, (_, i) => i + 1).filter((sd) => SM.stormFor(sd).stops).slice(0, 24);
  const fineSeeds = Array.from({ length: 400 }, (_, i) => i + 1).filter((sd) => !SM.stormFor(sd).stops).slice(0, 24);
  const pts = (sd, how, rule) => { fresh(); const g = storm(sd, how, rule); const p = g.st.score.points; AR.quitGame(); return p; };
  const panicSell = (sd) => { fresh(); AR.startGame('st', sd, 'standard'); const g = R.game; g.act('stRule', 'stops'); g.act('stWhy', 'card'); g.act('stGo');
    for (let i = 0; i < 400; i++) g.advance(16); g.act('stSell'); const p = g.st.score.points; AR.quitGame(); return p; };
  const rowsS = stopSeeds.map((sd) => ({ planStops: pts(sd, 'plan', 'stops'), planHalf: pts(sd, 'plan', 'half'), idle: pts(sd, 'idle', 'stops'), never: pts(sd, 'idle', 'never'), early: panicSell(sd) }));
  ok('T11 · in "company stops" storms, a keep-to-plan bot that sells scores highest (full marks), above holding, panic-selling, or a plan that never sells',
    rowsS.length >= 20 && rowsS.every((r) => r.planStops === SM.STORM_PAR && r.planHalf === SM.STORM_PAR && r.idle < r.planStops && r.never < r.planStops && r.early < r.planStops),
    JSON.stringify(rowsS.slice(0, 3)));
  const rowsF = fineSeeds.map((sd) => ({ hold: pts(sd, 'idle', 'stops'), half: pts(sd, 'plan', 'half'), never: pts(sd, 'idle', 'never'), early: panicSell(sd) }));
  ok('and in a storm where the company is fine, holding to any of the three plans scores full marks, and selling in the fall scores low',
    rowsF.length >= 20 && rowsF.every((r) => r.hold === SM.STORM_PAR && r.half === SM.STORM_PAR && r.never === SM.STORM_PAR && r.early <= 2), JSON.stringify(rowsF.slice(0, 3)));
  /* the money is shown and never scored: the same decisions score the same whatever the price did */
  const d0 = SM.stormFor(stopSeeds[0]), dec = { rule: 'stops', why: 'card', sold: true, soldT: d0.factMs + 10, halfAt: null };
  const richer = Object.assign({}, d0, { endV: 900, after: 2000 }), poorer = Object.assign({}, d0, { endV: 150, after: 10 });
  ok('the money is never scored: one set of decisions scores the same however far the price fell or came back (rule 3)',
    SM.stormScore(richer, dec).points === SM.stormScore(poorer, dec).points && SM.stormScore.length === 2 && !/val|after|endV|soldAt/.test(SM.stormScore.toString()));
  /* the screens: the plan by keyboard, the plan re-read by Space, and the money shown on the end card */
  fresh(); AR.startGame('st', stopSeeds[1], 'standard'); { const g = R.game;
    const v0 = g.view();
    g.key({ key: '1' }); g.key({ key: '2' });
    const planned = g.st.rule === 'stops' && g.st.why === g.def.whys[1].id;
    g.key({ key: 'Enter', preventDefault() {} });
    const v1 = g.view();
    for (let i = 0; i < 60; i++) g.advance(16);
    g.key({ key: ' ', preventDefault() {} });
    ok('the plan is written before the storm (three rules, three reasons off the card), by keys 1 2 3 and Enter',
      (v0.match(/data-act="stRule"/g) || []).length === 3 && (v0.match(/data-act="stWhy"/g) || []).length === 3 && v0.includes(esc(g.def.co.why)) && planned && g.st.phase === 'storm', g.st.phase);
    ok('during the storm, SELL is there, nothing has sold, and Space re-reads your plan in your own words',
      /data-act="stSell"/.test(v1) && !g.st.sold && g.st.calms === 1 && v1.includes(esc(SM.planWords(g.def, g.st.rule, g.st.why))));
    for (let i = 0; i < 5000 && !g.st.factSeen && !g.st.done; i++) g.advance(16);
    g.act('stSell'); const v2 = g.view();
    ok('the end card scores the plan and the news, and shows the money under "shown, never scored"', /What was scored/.test(v2) && /shown, never scored/.test(v2) && v2.includes(String(g.st.soldAt)) && v2.includes(esc(AR.PRACTISED.st)), (v2.match(/<h2>([^<]+)<\/h2>/) || [])[1]);
    AR.quitGame(); }
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
