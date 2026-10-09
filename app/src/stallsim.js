/* stallsim.js — Stall of My Own, as arithmetic (docs/12 §2.1).

   The promise: busy is not the same as profitable, and a business is a run of
   small decisions about stock, price and waste, adding up over weeks.

   This module is the whole season and nothing else: no DOM, no wallet, no
   storage. stall.js draws it and drives the market day's clock; sim.js keeps
   the keepsake; arcade.js pays the wage. Every sum a child is shown is made
   here, so a view never does arithmetic on money (the app's own rule).

   Determinism is the point of the shape. Everything the town does to a season
   (the weather, the wholesaler's prices, who walks past, the events, the order
   customers arrive in) is drawn ONCE from the season's seed into `cal`. What
   changes after that is only what the child decided. The same seed and the
   same decisions replay exactly (SA6); a different seed is a different season.
   Nothing here is a reward and nothing is random per sale (rule 3).

   Money is held in "rupee-scale" whole numbers (one town unit is ten of
   them), always even, and shown through stallMoney() in the child's own
   currency — so every ledger line converts exactly and still adds up in
   $, £, € and AED. The figures are town dials, registered in sources.js. */

/* ── the dials (sources.js · stall) ─────────────────────────────────────
   cost: the wholesaler's usual price · fair: what most of Market Row thinks it
   is worth · foot: how many people walk past wanting one, in an ordinary week ·
   perish: whether what is left goes off at the end of the week · wx: how the
   weather moves the footfall. */
export const PRODUCTS = {
  chai: { id: 'chai', icon: 'teapot', em: '🫖', name: 'Chai', one: 'cup of chai', cost: 16, fair: 40, foot: 14, perish: true,
    off: 'the milk turns', wx: { mild: 1, hot: 0.6, rain: 1.4, cold: 1.8 },
    up: ['Milk is dear this week: the dairy\'s herd is off its feed.', 'Tea leaves cost more: the hill crop came in small.'],
    down: ['Milk is cheap this week: the dairy has more than it can sell.', 'A big sack of tea arrived, so the wholesaler is selling it off.'] },
  ice: { id: 'ice', icon: 'gola', em: '🍧', name: 'Ice golas', one: 'ice gola', cost: 12, fair: 30, foot: 10, perish: true,
    off: 'it melts', wx: { mild: 1.1, hot: 2.2, rain: 0.3, cold: 0.3 },
    up: ['Ice is dear: the ice works\' big machine is being mended.', 'Syrup costs more: the fruit came in late this year.'],
    down: ['Ice is cheap: the ice works made too much last week.', 'Syrup is cheap: a good fruit crop up the coast.'] },
  rope: { id: 'rope', icon: 'rope', em: '🪢', name: 'Rope & twine', one: 'coil of rope', cost: 30, fair: 60, foot: 5, perish: false,
    off: null, wx: { mild: 1, hot: 1, rain: 1, cold: 1 },
    up: ['Rope is dear: the harbour is buying every coil for the boats.'],
    down: ['Rope is cheap: the twine-maker made more than she could sell.'] },
  umbrella: { id: 'umbrella', icon: 'parasol', em: '☂️', name: 'Umbrellas', one: 'umbrella', cost: 70, fair: 160, foot: 3, perish: false,
    off: null, wx: { mild: 0.5, hot: 0.2, rain: 3, cold: 0.8 },
    up: ['Umbrellas are dear: everyone up the coast wants one at once.'],
    down: ['Umbrellas are cheap: a shop in the next town closed and sold its stock.'] },
};
export const WEATHER = {
  mild: { id: 'mild', icon: 'suncloud', em: '⛅', name: 'Fair and mild', says: 'An ordinary week on Market Row.' },
  hot:  { id: 'hot', icon: 'sun', em: '☀️', name: 'Blazing hot', says: 'Ice golas fly off the counter. Hot chai, much less.' },
  rain: { id: 'rain', icon: 'rain', em: '🌧️', name: 'Rain all week', says: 'Umbrellas and hot chai. Nobody wants an ice gola in the rain.' },
  cold: { id: 'cold', icon: 'wind', em: '🌬️', name: 'A cold wind', says: 'Hands round a hot cup of chai. Ice golas, hardly at all.' },
};
const WX_ORDER = ['mild', 'mild', 'mild', 'mild', 'hot', 'hot', 'hot', 'rain', 'rain', 'cold', 'cold'];

/* What you are saving for. The cart sells faster; the sign brings more people. */
export const GOALS = {
  cart: { id: 'cart', icon: 'cart', em: '🛒', name: 'A better cart', says: 'More fits on the counter, restocking is quicker, and people wait a little longer.' },
  sign: { id: 'sign', icon: 'sign', em: '🪧', name: 'A painted sign', says: 'More people stop at your stall every week.' },
};
export const CART = { cap: 6, restock: 1500, patience: 1.25 };
export const PLAIN = { cap: 4, restock: 2600, patience: 1 };
export const SIGN_FOOT = 1.25;

/* The three levels (docs/12 §2.1): Easy 2 products, steady prices, no spoilage;
   Standard 3 products, weather and spoilage; Tricky 4, a rival and the credit offer. */
export const LEVELS = {
  easy: { products: ['chai', 'rope'], spoil: false, weather: false, moves: false, float: 400, rent: 120, patience: 11000,
    events: { pool: ['fair'], n: [1, 1], forced: [] }, goals: { cart: 1000, sign: 900 },
    says: 'Two things to sell, steady prices, and nothing goes off.' },
  standard: { products: ['chai', 'ice', 'rope'], spoil: true, weather: true, moves: true, float: 500, rent: 130, patience: 9000,
    events: { pool: ['rain', 'fair', 'price', 'rival'], n: [1, 2], forced: [] }, goals: { cart: 1400, sign: 1200 },
    says: 'Three things, the weather, prices that move, and chai and golas go off.' },
  tricky: { products: ['chai', 'ice', 'rope', 'umbrella'], spoil: true, weather: true, moves: true, float: 600, rent: 160, patience: 8000,
    events: { pool: [], n: [0, 0], forced: ['rival', 'credit'] }, goals: { cart: 1600, sign: 1400 },
    says: 'Four things, a rival stall opposite, and a cart offered on credit.' },
};
export const WEEKS = 8;
export const DAY_MS = 60000;
/* the price ladder, as a share of the fair price: one step at a time, never a typed number */
export const LADDER = [0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.6, 1.8, 2];
export const FAIR_STEP = 4;
/* the demand curve: everyone walking past pays up to 70% of fair; nobody pays 180% */
const PAY_ALL = 0.7, PAY_NONE = 1.8;
/* the decision score's yardstick (arcade par) and the wage it scales */
export const PAR = 6.5, WAGE_UNITS = 8, WAGE_CAP = 1.6;

export const even = (x) => Math.max(0, Math.round(x / 2) * 2);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/* a small seeded generator, so this module needs nothing from the DOM side */
export function prng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

export function level(s) { return LEVELS[s.tier] || LEVELS.standard; }
export function products(s) { return level(s).products.map((id) => PRODUCTS[id]); }
export function goalPrice(s) { return level(s).goals[s.goal] || level(s).goals.cart; }

/* ── a new season: the town's half, drawn once from the seed ──────────── */
export function newSeason(seed, tier = 'standard', goal = 'cart') {
  const L = LEVELS[tier] || LEVELS.standard, r = prng(seed * 2654435761 + 97);
  const ids = L.products;
  const weather = [], cost = [], noise = [], why = [];
  for (let w = 0; w < WEEKS; w++) {
    weather.push(L.weather ? pick(r, WX_ORDER) : 'mild');
    const cw = {}, nw = {}, yw = {};
    ids.forEach((id) => {
      const m = L.moves ? pick(r, [0.85, 0.9, 1, 1, 1, 1.1, 1.2]) : 1;
      cw[id] = m;
      nw[id] = 0.88 + r() * 0.24;
      yw[id] = m > 1 ? pick(r, PRODUCTS[id].up) : m < 1 ? pick(r, PRODUCTS[id].down) : null;
    });
    cost.push(cw); noise.push(nw); why.push(yw);
  }
  /* one or two events, never in the first week (a season starts on an ordinary Monday) */
  const events = [];
  const nEv = L.events.n[0] + Math.floor(r() * (L.events.n[1] - L.events.n[0] + 1));
  const pool = L.events.pool.slice();
  const kinds = L.events.forced.slice();
  for (let i = 0; i < nEv && pool.length; i++) kinds.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  const used = new Set();
  kinds.forEach((kind) => {
    let wk = 0;
    for (let tries = 0; tries < 20; tries++) { wk = 1 + Math.floor(r() * 6); if (!used.has(wk)) break; }
    used.add(wk);
    const ev = { kind, week: wk, len: kind === 'rival' ? 3 : kind === 'price' ? 2 : 1 };
    if (kind === 'rain') weather[wk] = 'rain';
    events.push(ev);
  });
  events.sort((a, b) => a.week - b.week);
  const day = []; for (let w = 0; w < WEEKS; w++) day.push(Math.floor(r() * 4294967296));
  const back = {}, price = {}, buy = {};
  ids.forEach((id) => { back[id] = 0; price[id] = FAIR_STEP; buy[id] = 0; });
  return {
    v: 1, seed, tier: LEVELS[tier] ? tier : 'standard', goal: GOALS[goal] ? goal : 'cart',
    week: 0, phase: 'plan', cash: L.float, float: L.float, jar: 0, owned: false, boughtWeek: null,
    goodwill: 1, credit: null, offer: null, back,
    cal: { weather, cost, noise, why, events, day },
    draft: { buy, price, jar: 0 }, day: null, ledger: [],
  };
}

/* ── what the town does this week ─────────────────────────────────────── */
const evOn = (s, kind, w) => s.cal.events.find((e) => e.kind === kind && w >= e.week && w < e.week + e.len);
export function costOf(s, id, w = s.week) {
  const rise = evOn(s, 'price', w) ? 1.25 : 1;
  return even(PRODUCTS[id].cost * s.cal.cost[w][id] * rise);
}
export function priceAt(id, step) { return even(PRODUCTS[id].fair * LADDER[Math.max(0, Math.min(LADDER.length - 1, step))]); }
/* who walks past wanting one: weather × the calendar × the sign × goodwill × the week's own noise */
export function footOf(s, id, w = s.week) {
  const p = PRODUCTS[id], wx = s.cal.weather[w];
  let f = p.foot * (level(s).weather ? p.wx[wx] : 1) * s.cal.noise[w][id];
  if (evOn(s, 'fair', w)) f *= 1.6;
  if (evOn(s, 'rival', w)) f *= 0.72;
  if (s.owned && s.goal === 'sign') f *= SIGN_FOOT;
  f *= s.goodwill;
  return Math.max(0, Math.round(f));
}
/* the share of them who will pay this much — the demand curve, the same curve every week */
export function payShare(id, price) {
  const F = PRODUCTS[id].fair;
  return clamp01((PAY_NONE * F - price) / ((PAY_NONE - PAY_ALL) * F));
}
export function buyersAt(s, id, price, w = s.week) { return Math.round(footOf(s, id, w) * payShare(id, price)); }
/* the demand strip: about how many will pay at the prices either side of yours */
export function strip(s, id, step = s.draft.price[id]) {
  const lo = Math.max(0, Math.min(LADDER.length - 5, step - 2));
  return [0, 1, 2, 3, 4].map((k) => { const st = lo + k, p = priceAt(id, st); return { step: st, price: p, buyers: buyersAt(s, id, p), on: st === step }; });
}

/* The week ahead: the forecast, the town calendar, the wholesaler's list. */
const EVENT_SAYS = {
  fair: (e) => ({ icon: 'calendar', em: '🎪', title: 'The Market Row fair', says: 'The whole town comes out: about half as many people again walk past.' }),
  rival: (e) => ({ icon: 'shop', em: '🏪', title: 'A rival stall opposite', says: `For ${e.len} weeks someone sells the same things across the way, so fewer people come to you.` }),
  price: (e) => ({ icon: 'priceUp', em: '📈', title: 'The wholesaler puts prices up', says: `For ${e.len} weeks everything costs a quarter more: the carts that bring it are dearer to run.` }),
  rain: (e) => ({ icon: 'rain', em: '🌧️', title: 'A rainy week', says: 'The almanac says rain all week. Plan for it.' }),
  credit: (e) => ({ icon: 'cart', em: '🛒', title: 'A cart-maker comes by', says: 'She will offer you a cart, now or a bit each week.' }),
};
export function calendar(s) {
  return s.cal.events.map((e) => Object.assign({ kind: e.kind, week: e.week, len: e.len,
    now: s.week >= e.week && s.week < e.week + e.len, past: s.week >= e.week + e.len }, EVENT_SAYS[e.kind](e)));
}
export function weekInfo(s) {
  const w = s.week, L = level(s);
  return {
    week: w, n: w + 1, of: WEEKS,
    weather: WEATHER[s.cal.weather[w]], weatherOn: L.weather,
    events: calendar(s).filter((e) => e.now),
    rows: L.products.map((id) => ({
      p: PRODUCTS[id], cost: costOf(s, id), usual: even(PRODUCTS[id].cost), why: evOn(s, 'price', w) ? EVENT_SAYS.price({ len: 2 }).says : s.cal.why[w][id],
      carried: s.back[id] || 0, buy: s.draft.buy[id] || 0, step: s.draft.price[id], price: priceAt(id, s.draft.price[id]),
      foot: footOf(s, id), buyers: buyersAt(s, id, priceAt(id, s.draft.price[id])), strip: strip(s, id),
    })),
    offer: offerFor(s),
  };
}

/* ── the plan: buy, price, the jar — and what is left on market morning ── */
export function planCost(s) {
  return level(s).products.reduce((t, id) => t + (s.draft.buy[id] || 0) * costOf(s, id), 0);
}
export function creditDue(s) { return s.credit && s.credit.left > 0 ? s.credit.weekly : 0; }
export function planSummary(s) {
  const stock = planCost(s), jar = s.draft.jar || 0, rent = level(s).rent, credit = creditDue(s);
  const left = s.cash - stock - jar;
  return { cash: s.cash, stock, jar, left, rent, credit, after: left - rent - credit, goal: goalPrice(s), jarNow: s.jar, jarAfter: s.jar + jar };
}
/* The order can never spend money the box does not have. The rent can: that is the buffer decision. */
export function setBuy(s, id, qty) {
  if (s.phase !== 'plan' || !(id in s.draft.buy)) return false;
  const q = Math.max(0, Math.min(99, Math.round(qty))), was = s.draft.buy[id];
  s.draft.buy[id] = q;
  if (q > was && planCost(s) + s.draft.jar > Math.max(0, s.cash)) { s.draft.buy[id] = was; return false; }
  return true;
}
export function setStep(s, id, step) {
  if (s.phase !== 'plan' || !(id in s.draft.price)) return false;
  s.draft.price[id] = Math.max(0, Math.min(LADDER.length - 1, Math.round(step)));
  return true;
}
export const JAR_STEP = 20;
export function setJar(s, amt) {
  if (s.phase !== 'plan') return false;
  const a = Math.max(0, even(amt)), was = s.draft.jar;
  s.draft.jar = a;
  if (a > was && planCost(s) + a > Math.max(0, s.cash)) { s.draft.jar = was; return false; }
  return true;
}

/* ── the credit offer (Tricky): the total in coins, and the choice left alone (rule 7) ── */
export const CREDIT_MARKUP = 1.25;
export function offerFor(s) {
  const e = s.cal.events.find((x) => x.kind === 'credit');
  if (!e || s.week !== e.week || s.owned || s.offer) return null;
  const now = goalPrice(s), weeks = WEEKS - s.week;
  const weekly = Math.ceil((now * CREDIT_MARKUP) / weeks / 2) * 2;
  return { goal: GOALS[s.goal], now, weeks, weekly, total: weekly * weeks, canNow: s.cash - planCost(s) - s.draft.jar >= now };
}
export function answerOffer(s, how) {
  const o = offerFor(s);
  if (!o) return false;
  if (how === 'now') {
    if (!o.canNow) return false;
    s.cash -= o.now; s.owned = true; s.boughtWeek = s.week; s.offer = 'now';
    s.paidNow = o.now;
  } else if (how === 'credit') {
    s.owned = true; s.boughtWeek = s.week; s.offer = 'credit';
    s.credit = { weekly: o.weekly, left: o.weeks, weeks: o.weeks, total: o.total, paid: 0 };
  } else s.offer = 'no';
  return true;
}

/* ── open the stall: the plan is committed, the morning's bills are paid ── */
export function openDay(s) {
  if (s.phase !== 'plan') return null;
  const L = level(s), w = s.week;
  if (offerFor(s)) s.offer = 'no';     /* an offer not taken up is simply not taken */
  const cost = {}, bought = {};
  let stockCost = 0;
  L.products.forEach((id) => { cost[id] = costOf(s, id); bought[id] = s.draft.buy[id] || 0; stockCost += bought[id] * cost[id]; });
  const jarIn = Math.max(0, Math.min(s.draft.jar || 0, s.cash - stockCost));
  s.cash -= stockCost + jarIn;
  s.jar += jarIn;
  L.products.forEach((id) => { s.back[id] = (s.back[id] || 0) + bought[id]; });
  /* the jar reaching its goal buys it, from this week on */
  let boughtGoal = false;
  if (!s.owned && s.jar >= goalPrice(s)) { s.jar -= goalPrice(s); s.owned = true; s.boughtWeek = w; boughtGoal = true; }
  const rent = L.rent, due = creditDue(s);
  s.cash -= rent + due;
  if (due) { s.credit.left--; s.credit.paid += due; }
  /* a cart paid for outright this week is a cart payment on this week's page, already out of the box */
  const credit = due + (s.paidNow || 0);
  s.paidNow = 0;
  const prices = {}, foot = {}, buyers = {};
  L.products.forEach((id) => { prices[id] = priceAt(id, s.draft.price[id]); foot[id] = footOf(s, id); buyers[id] = Math.round(foot[id] * payShare(id, prices[id])); });
  const kit = s.owned && s.goal === 'cart' ? CART : PLAIN;
  s.day = { week: w, cost, bought, stockCost, jarIn, rent, credit, broke: s.cash < 0, prices, foot, buyers, boughtGoal,
    cap: kit.cap, restockMs: kit.restock, patience: L.patience * kit.patience, seed: s.cal.day[w] };
  s.phase = 'market';
  return s.day;
}

/* ── the market day: Stall Rush's real-time stall, on the season's customers ──
   Pure: a clock you advance and three verbs. stall.js runs it on the wall's
   clock and draws it; the bots in test/stall.mjs run the very same code. */
export function makeDay(s) {
  const d = s.day, ids = level(s).products;
  const r = prng(d.seed);
  const list = [];
  ids.forEach((id) => { for (let i = 0; i < d.buyers[id]; i++) list.push(id); });
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = list[i]; list[i] = list[j]; list[j] = t; }
  const span = DAY_MS * 0.85 - 800, gap = list.length ? span / list.length : 0;
  const arrivals = list.map((want, i) => ({ id: i + 1, want, at: Math.round(800 + i * gap + (r() - 0.5) * gap * 0.6) }));
  const back = {}, counter = {}, sold = {};
  ids.forEach((id) => { const n = Math.min(d.cap, s.back[id] || 0); counter[id] = n; back[id] = (s.back[id] || 0) - n; sold[id] = 0; });
  const st = { t: 0, len: DAY_MS, arrivals, next: 0, q: [], counter, back, sold, takings: 0, served: 0, lost: 0, wrong: 0,
    blocked: 0, restock: 0, done: false, closedEarly: false, msg: '', last: null };
  const finish = (why) => {
    if (st.done) return;
    st.lost += st.q.length + (st.arrivals.length - st.next);
    st.q = []; st.next = st.arrivals.length; st.done = true; st.closedEarly = why === 'early';
  };
  const day = {
    st,
    /* serve the customer at the front with this; a wrong one loses them */
    serve(id) {
      if (st.done) return 'done';
      const front = st.q[0];
      if (!front) { st.msg = 'Nobody is waiting yet.'; st.last = 'none'; return 'none'; }
      if (st.restock > 0) { st.blocked++; st.msg = 'Your hands are full: restocking.'; st.last = 'busy'; return 'busy'; }
      if (id !== front.want) {
        st.q.shift(); st.lost++; st.wrong++;
        st.msg = `They wanted ${PRODUCTS[front.want].one}, so they walked off.`; st.last = 'wrong'; return 'wrong';
      }
      if (!(st.counter[id] > 0)) { st.msg = `No ${PRODUCTS[id].name.toLowerCase()} on the counter: restock (R).`; st.last = 'empty'; return 'empty'; }
      st.q.shift(); st.counter[id]--; st.sold[id]++; st.served++;
      st.takings += d.prices[id];
      st.msg = ''; st.last = 'sold'; return 'sold';
    },
    /* restocking takes real time, and serving stops while you do it */
    restock() {
      if (st.done || st.restock > 0) return false;
      const room = ids.some((id) => st.counter[id] < d.cap && st.back[id] > 0);
      if (!room) { st.msg = ids.every((id) => !st.back[id]) ? 'The crates are empty.' : 'The counter is already full.'; return false; }
      st.restock = d.restockMs; st.msg = 'Restocking the counter…';
      return true;
    },
    advance(dt) {
      if (st.done) return false;
      let dirty = false;
      st.t += dt;
      if (st.restock > 0) {
        st.restock -= dt;
        if (st.restock <= 0) {
          st.restock = 0;
          ids.forEach((id) => { const n = Math.min(d.cap - st.counter[id], st.back[id]); if (n > 0) { st.counter[id] += n; st.back[id] -= n; } });
          st.msg = ''; dirty = true;
        }
      }
      while (st.next < st.arrivals.length && st.arrivals[st.next].at <= st.t) {
        st.q.push({ id: st.arrivals[st.next].id, want: st.arrivals[st.next].want, patience: 1 }); st.next++; dirty = true;
      }
      for (let i = st.q.length - 1; i >= 0; i--) {
        st.q[i].patience -= dt / d.patience;
        if (st.q[i].patience <= 0) { st.q.splice(i, 1); st.lost++; dirty = true; }
      }
      if (st.t >= st.len) { finish('time'); return true; }
      if (st.next >= st.arrivals.length && !st.q.length && st.t > 1000) { finish('sold'); return true; }
      return dirty;
    },
    closeEarly() { finish('early'); },
    result() { return { sold: { ...st.sold }, takings: st.takings, served: st.served, lost: st.lost, wrong: st.wrong, blocked: st.blocked, auto: false, closedEarly: st.closedEarly }; },
  };
  return day;
}
/* Auto-serve: everyone who wanted something you had is served, and it costs a little goodwill. */
export const AUTO_GOODWILL = 0.05;
export function autoDay(s) {
  const d = s.day, sold = {};
  let takings = 0, served = 0, lost = 0;
  level(s).products.forEach((id) => { sold[id] = Math.min(d.buyers[id], s.back[id] || 0); takings += sold[id] * d.prices[id]; served += sold[id]; lost += d.buyers[id] - sold[id]; });
  return { sold, takings, served, lost, wrong: 0, blocked: 0, auto: true, closedEarly: false };
}

/* ── the end of the week: the ledger page ─────────────────────────────── */
export function closeWeek(s, res) {
  if (s.phase !== 'market' || !s.day) return null;
  const d = s.day, L = level(s);
  let spoiledN = 0, spoiledVal = 0, carriedN = 0, carriedVal = 0, soldN = 0;
  const lines = {};
  L.products.forEach((id) => {
    const sold = Math.min(res.sold[id] || 0, s.back[id] || 0);
    s.back[id] -= sold; soldN += sold;
    const left = s.back[id];
    const perish = L.spoil && PRODUCTS[id].perish;
    if (perish) { spoiledN += left; spoiledVal += left * d.cost[id]; s.back[id] = 0; }
    else { carriedN += left; carriedVal += left * d.cost[id]; }
    lines[id] = { bought: d.bought[id], sold, price: d.prices[id], cost: d.cost[id], left, spoiled: perish ? left : 0, foot: d.foot[id], buyers: d.buyers[id] };
  });
  const takings = L.products.reduce((t, id) => t + lines[id].sold * d.prices[id], 0);
  const costs = d.stockCost + d.rent + d.credit;
  const profit = takings - costs;
  s.cash += takings;
  s.goodwill = res.auto ? Math.max(0.8, s.goodwill - AUTO_GOODWILL) : Math.min(1, s.goodwill + 0.02);
  const foot = L.products.reduce((t, id) => t + d.foot[id], 0), buyers = L.products.reduce((t, id) => t + d.buyers[id], 0);
  const row = {
    week: d.week, n: d.week + 1, weather: s.cal.weather[d.week], lines,
    takings, stockCost: d.stockCost, rent: d.rent, credit: d.credit, costs, profit,
    spoiledN, spoiledVal, carriedN, carriedVal, soldN, foot, buyers,
    lost: res.lost, wrong: res.wrong, auto: !!res.auto, closedEarly: !!res.closedEarly,
    jarIn: d.jarIn, jar: s.jar, cash: s.cash, broke: d.broke, boughtGoal: d.boughtGoal, owned: s.owned,
  };
  row.score = weekScore(row);
  row.wageUnits = wageUnits(row.score.total);
  s.ledger.push(row);
  s.day = null;
  s.week++;
  const L2 = level(s);
  L2.products.forEach((id) => { s.draft.buy[id] = 0; });
  s.draft.jar = 0;
  s.phase = s.week >= WEEKS ? 'done' : 'ledger';
  return row;
}
/* after the ledger page, the next week's plan */
export function nextWeek(s) { if (s.phase === 'ledger') s.phase = 'plan'; return s.phase; }

/* "₹ kept from every ₹10" until percentages are met (docs/03 §1) */
export function keptOfTen(profit, takings) { return takings > 0 ? Math.round((profit / takings) * 10) : 0; }

/* ── the decision score: what is scored is the decision, never the profit alone ──
   margin kept (3) · waste kept low (2) · a buffer on market morning (2) ·
   prices people will pay (2) · something into the jar, or the goal already got (1).
   A week where nothing was sold scores nothing: doing nothing is not a decision. */
export function weekScore(row) {
  const margin = row.takings > 0 ? row.profit / row.takings : 0;
  const waste = row.stockCost > 0 ? row.spoiledVal / row.stockCost : 0;
  const fair = row.foot > 0 ? row.buyers / row.foot : 0;
  const parts = {
    margin: 3 * clamp01(margin / 0.4),
    waste: 2 * (1 - clamp01(waste / 0.3)),
    buffer: row.broke ? 0 : 2,
    fair: 2 * clamp01((fair - 0.3) / 0.4),
    jar: row.jarIn > 0 || row.owned ? 1 : 0,
  };
  const total = row.soldN > 0 ? Object.values(parts).reduce((a, b) => a + b, 0) : 0;
  return { total: Math.round(total * 10) / 10, parts, margin, waste, fair };
}
/* the wage for a week played, in town units, measured against par (arcade.js pays it through payout()) */
export function wageUnits(score) { return score > 0 ? Math.max(1, Math.round(WAGE_UNITS * Math.min(WAGE_CAP, score / PAR))) : 0; }

/* ── the season, summed from its own ledger ───────────────────────────── */
export function summary(s) {
  const rows = s.ledger, sum = (k) => rows.reduce((t, r) => t + r[k], 0);
  const takings = sum('takings'), costs = sum('costs'), stock = sum('stockCost'), spoiled = sum('spoiledVal');
  const owed = s.credit ? s.credit.left * s.credit.weekly : 0;
  const goalValue = s.owned ? goalPrice(s) : 0;
  const worth = s.cash + s.jar + goalValue - owed;
  return {
    weeks: rows.length, complete: rows.length >= WEEKS, takings, costs, profit: takings - costs, stock, spoiled,
    sold: sum('soldN'), waste: stock > 0 ? spoiled / stock : 0, margin: takings > 0 ? (takings - costs) / takings : 0,
    brokeWeeks: rows.filter((r) => r.broke).length, goal: s.owned, goalWeek: s.boughtWeek, goalValue, credit: s.credit ? s.credit.total : 0,
    cash: s.cash, jar: s.jar, owed, worth, start: s.float, change: worth - s.float,
    fair: sum('foot') > 0 ? sum('buyers') / sum('foot') : 0, score: rows.reduce((t, r) => t + r.score.total, 0),
    wage: rows.reduce((t, r) => t + r.wageUnits, 0),
  };
}
/* the run the arcade's three goals read (they pay nothing) */
export function goalRun(s) {
  const m = summary(s);
  return { soComplete: m.complete, soGoal: m.complete && m.goal, soBroke: m.brokeWeeks, soWaste: m.waste, soSold: m.sold };
}
