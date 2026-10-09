/* _bots.mjs — one careful player per arcade game, shared by economy.mjs and games.mjs.
   Each plays a whole round headlessly through the game's own controls (act / key /
   advance), so what is measured is what a child's round would do. Import AFTER the
   localStorage shim is in place. */
const { R } = await import('../src/runtime.js');
const AR = await import('../src/arcade.js');
const S = await import('../src/smartsim.js');
const MS = await import('../src/monthsim.js');
const CS = await import('../src/climbsim.js');
const F = await import('../src/fmt.js');
/* an amount in the smallest coin, as a child would type it in this currency: 35 → "0.35" in $ */
export const typed = (minor) => { const m = (F.CURRENCIES[F.currency()] || {}).minor || 1; return m > 1 ? (minor / m).toFixed(2) : String(minor); };

/* Change Rush: go for the coin that still fits, never stand under one that overpays */
export const crLane = (st) => {
  const need = st.target - st.got, near = (d) => d.y > 300 - 70;
  const bad = new Set(st.drops.filter((d) => near(d) && d.v > need).map((d) => d.lane));
  const fits = st.drops.filter((d) => d.v <= need && !bad.has(d.lane) && d.y < 290).sort((a, b) => b.y - a.y)[0];
  if (fits) return fits.lane;
  if (!bad.has(st.lane)) return st.lane;
  return [0, 1, 2, 3].find((l) => !bad.has(l)) ?? st.lane;
};

/* Main Street runs its bots on timers: run them in order, at once */
export function withQueue(f) {
  const realST = globalThis.setTimeout, realCT = globalThis.clearTimeout, q = [];
  globalThis.setTimeout = (fn) => { q.push(fn); return q.length; }; globalThis.clearTimeout = () => {};
  try { return f(q); } finally { globalThis.setTimeout = realST; globalThis.clearTimeout = realCT; }
}

/* play(id, seed, tier, how, opt) → the finished game object. `how`: 'best' plays carefully,
   'wrong' answers wrongly where a game has answers (for the level rule and the holds),
   'random' is a coin flip at every choice (T9), 'caps' calls a message a trap when it shouts
   (Smart Choices), 'skip' skips every bill and 'needs' pays each need it can (the Month Planner).
   opt.mode: which Smart Choices table (default Needs and Wants); opt.rnd: the coin. */
export function play(id, seed = 1, tier = 'standard', how = 'best', opt = {}) {
  AR.startGame(id, seed, tier);
  const g = R.game;
  const bad = how === 'wrong';
  if (id === 'cr') {
    for (let i = 0; i < 6000 && !g.st.done; i++) { g.st.lane = bad ? (i >> 4) % 4 : crLane(g.st); g.advance(16); }
  } else if (id === 'sc') {
    /* Smart Choices: one table a round, played through its own acts */
    const st = g.st, rnd = opt.rnd || Math.random, coin = (n) => Math.floor(rnd() * n) % n;
    g.act('scMode', opt.mode || 'nw');
    for (let guard = 0; guard < 600 && !st.done; guard++) {
      if (st.held) { g.act('scNext'); continue; }
      const c = st.deck[st.i], rand = how === 'random' || (how === 'caps' && st.step !== 'call');
      if (st.step === 'side') g.act('scSide', rand ? ['need', 'both', 'want'][coin(3)] : bad ? (c.a === 'need' ? 'want' : 'need') : c.a);
      else if (st.step === 'reason') g.act('scChip', rand ? coin(c.chips.length) : bad ? (c.reason + 1) % c.chips.length : c.reason);
      else if (st.step === 'call') g.act('scCall', how === 'caps' ? (S.shouts(c) ? 'scam' : 'safe') : rand ? (coin(2) ? 'scam' : 'safe') : bad ? (c.a === 'scam' ? 'safe' : 'scam') : c.a);
      else if (st.step === 'tell') g.act('scTell', rand ? coin(c.ph.length) : bad ? c.ph.findIndex((p, k) => !c.tells.includes(k)) : c.tells[0]);
      else if (st.step === 'shelf') g.act('scShelf', rand ? coin(2) : bad ? 1 - c.answer : c.answer);
      else if (st.step === 'type') {
        const t = rand ? String(1 + coin(99)) : bad ? '1' : typed(c.asks[st.choice]);
        for (const ch of t) g.act('scKey', ch);
        g.act('scCheck');
      }
    }
  } else if (id === 'mp') {
    /* the Month Planner: the yearly step typed, then each bill paid or not */
    const st = g.st, L = g.ledger, plan = how === 'best' ? MS.mpBest(st.round).plan : null, rnd = opt.rnd || Math.random;
    for (let guard = 0; guard < 400 && !st.done; guard++) {
      if (st.step === 'yearly') {
        if (!L.yearly) { for (const ch of String(bad || opt.yearWrong ? st.round.yearly.want + 1 : st.round.yearly.want)) g.act('mpKey', ch); }
        g.act('mpCheck');
      } else if (st.step === 'bill') {
        const b = MS.mpBill(L);
        const pay = how === 'skip' || bad ? false : how === 'needs' ? b.need && b.amt <= L.cash : how === 'random' ? (rnd() < 0.5 && b.amt <= L.cash) : plan[L.m].includes(b.key);
        g.act(pay ? 'mpPay' : 'mpSkip');
      } else if (st.step === 'month') g.act('mpNext');
    }
  } else if (id === 'cc') {
    /* Compound Climb: a steady charge, and every estimate at the steady middle (or the wrong ones) */
    while (!g.st.done) {
      if (g.st.asking) { g.estimate(bad ? g.st.asking.from : CS.ccBands(g.st.asking.from).mid); continue; }
      g.st.holding = true; g.st.charge = bad ? 100 : 55; g.release();
    }
  } else if (id === 'sr') {
    for (let i = 0; i < 5000 && !g.st.done; i++) {
      g.advance(16);
      if (bad) continue;
      if (g.st.restock <= 0) { const c = g.st.q[0]; if (c) { if (g.st.stock[c.want]) g.serve(c.want); else g.restock(); } }
    }
  } else if (id === 'st') {
    /* §2.5 · write the plan (sell only if the company stops making money; the card's reason),
       then keep to it: re-read it when the panic climbs, sell only once the news says so.
       'wrong' gives the crowd's reason and sells at the first wobble. */
    g.act('stRule', 'stops'); g.act('stWhy', bad ? 'crowd' : 'card'); g.act('stGo');
    if (bad) { g.advance(16); g.act('stSell'); }
    else for (let i = 0; i < 5000 && !g.st.done; i++) { g.advance(16); if (g.st.factSeen) g.act('stSell'); else if (g.st.panic > 60) g.calm(); }
  } else if (id === 'mc') {
    /* spread out and keep the nerve: the basket plus a slice of each */
    if (!bad) { for (let i = 0; i < 4; i++) g.act('mcAdj', 'basket:10'); ['grain', 'chai', 'rocket'].forEach((k) => { g.act('mcAdj', k + ':10'); g.act('mcAdj', k + ':10'); }); }
    else g.act('mcAdj', 'rocket:10');
    for (let w = 0; w < 6; w++) g.act('mcNext');
  } else if (id === 'sb') {
    /* Save or Borrow?: type the totals (or a wrong one), first path, keep a cushion, read the card */
    const st = g.st;
    for (let guard = 0; !st.done && guard < 400; guard++) {
      const G = st.round.goals[st.gi], l = st.log[st.gi];
      if (st.step === 'predict') {
        if (st.held) g.act('sbCheck');
        else { for (const d of String(bad ? 1 : G.asks[st.ai].want)) g.act('sbKey', d); g.act('sbCheck'); }
      } else if (st.step === 'choose') g.act('sbPath', G.paths[0].id);
      else if (st.step === 'cushion') g.act('sbCushion', bad ? '0' : '1');
      else if (st.step === 'live') g.act('sbSkip');
      else if (st.step === 'card') { if (l.ans == null) g.act('sbAns', bad ? G.paths[0].id : l.cmp.question.answer); else g.act('sbNext'); }
    }
  } else if (id === 'mn') {
    withQueue((q) => {
      for (let i = 0; i < 20000 && !g.g.done; i++) {
        if (q.length) { q.shift()(); continue; }
        const ph = g.g.phase, me = g.g.players[g.g.turn];
        if (!me.human) break;
        if (ph === 'roll') g.act('mnRoll');
        /* §2.9 · buy only what leaves a cushion for a bad week (the buy card's own warning) */
        else if (ph === 'decide') g.act(!bad && me.cash - g.squares[g.g.sq].cost >= g.cushion(me) ? 'mnBuy' : 'mnPass');
        else if (ph === 'card') g.act('mnCard', 0);
        else break;
      }
    });
  }
  return g;
}
/* §2.5 (T11) · Market Storm's other players, for test/games.mjs:
   'idle'  writes a plan and then does nothing at all, ever;
   'mash'  picks at random and presses random buttons, a few times a second;
   'plan'  keeps to whichever rule it is given, to the letter. */
export function storm(seed, how, rule = 'stops', tier = 'standard') {
  AR.startGame('st', seed, tier);
  const g = R.game, rnd = mulberry(seed * 7 + 3);
  if (how === 'mash') {
    g.act('stRule', ['stops', 'half', 'never'][Math.floor(rnd() * 3)]);
    g.act('stWhy', g.def.whys[Math.floor(rnd() * 3)].id); g.act('stGo');
    for (let i = 0; i < 5000 && !g.st.done; i++) { g.advance(16); if (rnd() < 0.012) g.act(rnd() < 0.5 ? 'stSell' : 'stPlan'); }
  } else {
    g.act('stRule', rule); g.act('stWhy', 'card'); g.act('stGo');
    for (let i = 0; i < 5000 && !g.st.done; i++) {
      g.advance(16);
      if (how !== 'plan') continue;
      const due = rule === 'stops' ? g.st.factSeen : rule === 'half' ? g.st.halfAt != null : false;
      if (due) g.act('stSell');
    }
  }
  return g;
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const done = (g) => (g.st ? g.st.done : g.g.done);
