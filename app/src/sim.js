/* sim.js — the one persistent object everything else is a view onto.
   ONE currency: games, jobs and lessons pay wages into the same wallet the
   store spends from (CONCEPT §3.1). There is no second, magic money.

   Nothing outside this module computes money. Views render what is here. */

import { Store } from './store.js';
import { CLASSES, byId as classById, marketPath, classesFor } from './assetclasses.js';
import * as biz from './business.js';
import { worldAt, explain as explainWorld, WEEKS_PER_YEAR } from './world.js';
import { price, setCurrency, dayIndex, DAY, convert } from './fmt.js';
import { tester, levelAtLeast, levelFor, rankFor, LEVELS, makeSeries, ASSETS, STOCK, WEATHER, JOBS, HOMES,
  WORLDS, QUESTS, FIXES, SHOP, CHAPTERS, UNLOCKS, fixesIn, chapterDone, worldOpen, isOpen } from './content.js';

export const MARKET_STEPS = 60;
/* Seven years of weeks — the whole journey (docs/08), so a child's market
   never runs out and the same seed always replays the same world. */
export const MARKET_WEEKS = 7 * WEEKS_PER_YEAR;
function newMarket(seed) {
  const { series } = marketPath(seed, MARKET_WEEKS);
  return { seed, series, step: 8, lastMove: 1, holdings: {}, best: null };
}
export function marketWorld(c) { return worldAt(c.market.seed, c.market.step, MARKET_WEEKS); }
export function marketWhy(c) { return explainWorld(marketWorld(c)); }
export function marketClasses(c, mathsMet) { return classesFor(mathsMet); }

/* Year 3 of the journey (docs/08): prices rise. Until now inflation existed
   only in the Exchange, which meant a child could be told cash loses value
   and never once feel it. This is the multiplier that puts it in their own
   rent, their own food and their own shopping — the week the safe thing
   stops being safe. Compounded from the world since they arrived. */
export function priceLevel(c) {
  if (!c.market) return 1;
  const w = worldAt(c.market.seed, c.market.step, MARKET_WEEKS);
  const weeks = Math.max(0, c.market.step - 8);
  return Math.pow(1 + w.inflation / 100, weeks / WEEKS_PER_YEAR);
}
export function inflatedSince(c) { return Math.round((priceLevel(c) - 1) * 100); }

/* ── construction ────────────────────────────────────────────────────── */
export function newChild(name, band, cur) {
  setCurrency(cur);
  const now = Date.now();
  return {
    id: 'k' + now.toString(36),
    name: name || 'Friend', band: band || 'builder', currency: cur || 'INR', created: now,
    money: {
      wallet: price(12),
      extraBills: [],
      jars: { spend: 0, save: 0, grow: 0, give: 0 },
      rules: { spend: 40, save: 30, grow: 20, give: 10 },
      goals: [],
      txns: [{ id: 't0', t: now, kind: 'in', amt: price(12), label: 'Starting float from Nana', cat: 'gift' }],
      wage: price(20),
      bills: [],
      nextPay: nextPayDay(now, 5),
      bank: { balance: 0, rate: 0.02, opened: false, loan: null, trust: 50, repaid: 0 },
    },
    learn: { xp: 0, level: 1, done: {}, openCard: null, drill: null, testedOut: {}, checkpoints: {} },
    market: newMarket((now ^ 0x9e3779b9) >>> 0),
    biz: null,
    streak: { days: [dayIndex(now)], last: dayIndex(now) },
    postbox: { day: dayIndex(now), idx: 0, answered: false, log: [], fuses: [] },
    companion: null,
    keepsakes: [], overnight: null, deeds: [],
    shop: { owned: [], cooling: {} },
    jobs: {},
    home: { tier: 0, since: now, mortgage: null },
    world: 0,
    fix: { prog: {}, done: [] },
    quests: { day: dayIndex(now), list: [], prog: {}, claimed: {}, bonus: false },
    mastery: { rec: {}, seen: [] },   /* the curriculum's record — mastery.js */
    decisions: [],                    /* consequential choices — decisions.js */
    badges: [], history: [{ t: now, v: price(12) }],
    family: { allowance: null, payWeekday: 5, chores: [], coolOff: false },
  };
}
/* Bills are DERIVED from where you live. Nothing invents a cost out of the
   air, and moving house changes the whole week at once — which is the lesson. */
export function homeOf(c) { return HOMES[(c.home && c.home.tier) || 0]; }
export function refreshBills(c) {
  const h = homeOf(c);
  const bills = [];
  const lvl = priceLevel(c);          /* year 3: the bills rise with prices */
  const at = (units) => Math.round(price(units) * lvl);
  if (h.rent > 0) bills.push({ name: 'Rent', units: h.rent, amt: at(h.rent) });
  h.bills.forEach((b) => bills.push({ name: b.name, units: b.units, amt: at(b.units) }));
  bills.push({ name: h.perk === 'kitchen' ? 'Food (you cook)' : 'Food', units: h.food, amt: at(h.food) });
  if (c.home.mortgage) bills.push({ name: 'Mortgage', units: 0, amt: c.home.mortgage.perWeek });
  /* Letters can change what living costs (docs/09): a rent rise, a club
     subscription, an umbrella fund. Each carries the weeks it has left; a
     null is for keeps. They price like everything else, so year 3's
     inflation reaches them too. */
  (c.money.extraBills || []).forEach((b) => bills.push({
    name: b.name + (b.weeks != null ? ` (${b.weeks} wk${b.weeks === 1 ? '' : 's'} left)` : ''),
    units: b.units, amt: at(b.units), extra: b.id }));
  c.money.bills = bills;
  return bills;
}

/* ── household shocks (docs/09 §3) ──────────────────────────────────────
   A household is not a static cost, it is a stream of small shocks and
   offers, and they arrive as letters. Two primitives carry every one of
   them: a BILL that recurs (a rent rise, a subscription, an umbrella fund)
   and a FUSE that is lit now and lands later (the tap you did not fix, the
   monsoon everyone knew was coming). Fuses are deterministic on purpose —
   a random flood behind a paid choice would be a slot machine (CONCEPT
   §6.3); a certain one is just a consequence on a delay. */
export function addBill(c, b) {
  if (!c.money.extraBills) c.money.extraBills = [];
  if (c.money.extraBills.find((x) => x.id === b.id)) return;
  c.money.extraBills.push({ id: b.id, name: b.name, units: b.units, weeks: b.weeks == null ? null : b.weeks });
}
export function removeBill(c, id) {
  c.money.extraBills = (c.money.extraBills || []).filter((x) => x.id !== id);
}
export function addFuse(c, f) {
  if (!c.postbox.fuses) c.postbox.fuses = [];
  if (c.postbox.fuses.find((x) => x.id === f.id)) return;
  c.postbox.fuses.push({ id: f.id, day: dayIndex(Date.now()) + f.days });
}
export function defuse(c, id) {
  c.postbox.fuses = (c.postbox.fuses || []).filter((x) => x.id !== id);
}
export function dueFuse(c) {
  const d = dayIndex(Date.now());
  return (c.postbox.fuses || []).find((x) => x.day <= d) || null;
}
export function weeklyCost(c) { return refreshBills(c).reduce((t, b) => t + b.amt, 0); }
/* What you know is what you're worth. A wage frozen at level 1 makes the top
   of the housing ladder unreachable, which would teach that climbing is for
   other people. Grows ~5.5% a rung: ₹200 at the start, ~₹520 by level 30. */
export function wageFor(c) {
  return Math.round(c.money.wage * (1 + (c.learn.level - 1) * 0.055));
}
export function weeklyIncome(c) { return c.family.allowance != null ? c.family.allowance : wageFor(c); }

/* "Rich" is a ratio, not a number: what your money earns each week over what
   your life costs each week. At 100% you work because you choose to. */
export function passiveWeekly(c) {
  const bank = c.money.bank.balance * c.money.bank.rate;
  const invested = holdingsValue(c) * 0.0075;          // Bizzington's own simulated drift
  const shop = c.biz && c.biz.log.length
    ? c.biz.log.slice(0, 4).reduce((t, l) => t + l.profit, 0) / Math.min(4, c.biz.log.length) * 3
    : 0;
  return Math.max(0, Math.round(bank + invested + shop));
}
export function independence(c) {
  const cost = weeklyCost(c);
  if (cost <= 0) return 0;
  return Math.min(2, passiveWeekly(c) / cost);
}
export function checkIndependence(c) {
  const pct = independence(c) * 100;
  const won = [];
  [[10, 'indep-10'], [25, 'indep-25'], [50, 'indep-50'], [100, 'indep-100']].forEach(([at, id]) => {
    if (pct >= at && badge(c, id)) won.push(id);
  });
  return won;
}

/* Moving never gets blocked — the app shows what would be left and lets the
   child decide with the number in front of them. */
export function canMove(c, tier) {
  const h = HOMES[tier];
  if (!h || tier !== (c.home.tier + 1)) return { ok: false, why: 'Not the next one along' };
  const dep = price(h.deposit);
  if (c.money.wallet + c.money.jars.save < dep) return { ok: false, why: 'Deposit is ' + dep, deposit: dep };
  return { ok: true, deposit: dep };
}
export function moveHome(c, tier) {
  const h = HOMES[tier];
  const dep = price(h.deposit);
  let short = dep - c.money.wallet;
  if (short > 0) {
    const take = Math.min(short, c.money.jars.save);
    c.money.jars.save -= take; c.money.wallet += take; short -= take;
  }
  if (short > 0) return false;
  c.money.wallet -= dep;
  if (dep > 0) txn(c, 'out', dep, 'Deposit on ' + h.name, 'home');
  if (h.mortgage) {
    const total = price(h.mortgage.units);
    c.home.mortgage = { owed: total, perWeek: Math.ceil(total / h.mortgage.weeks), weeks: h.mortgage.weeks, paid: 0 };
    badge(c, 'homeowner');
  }
  c.home.tier = tier;
  c.home.since = Date.now();
  refreshBills(c);
  badge(c, 'moved-in');
  stamp(c);
  return true;
}

export function newState() {
  return { v: 3, parent: { created: Date.now(), gate: false, pin: null }, kids: [], active: 0,
    ui: { nav: 'home', sub: 'wallet' },
    settings: { sound: true }, clock: { lastSeen: Date.now() } };
}
export function kid(state) { return state.kids[state.active]; }

function nextPayDay(from, weekday) {
  const d = new Date(from);
  d.setHours(9, 0, 0, 0);
  const add = ((weekday - d.getDay() + 7) % 7) || 7;
  d.setDate(d.getDate() + add);
  return d.getTime();
}

/* ── the clock ───────────────────────────────────────────────────────────
   Client-side here, and it must not ship that way — the shipping build takes
   `now` from the server. Until then, at least refuse to run backwards: a
   child who winds the device clock back must not replay pay day. */
export function now(state) {
  const t = Date.now();
  const last = (state.clock && state.clock.lastSeen) || 0;
  if (t < last) return last;                 // clock went backwards: hold
  state.clock.lastSeen = t;
  return t;
}
export function clockSuspect(state) {
  return Date.now() < ((state.clock && state.clock.lastSeen) || 0) - 60000;
}

/* ── money movements ─────────────────────────────────────────────────── */
export function txn(c, kind, amt, label, cat) {
  c.money.txns.unshift({ id: 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    t: Date.now(), kind, amt: Math.round(amt), label, cat: cat || 'other' });
  if (c.money.txns.length > 200) c.money.txns.length = 200;
}
export function earn(c, amt, label, cat) {
  const a = Math.round(amt);
  if (a <= 0) return 0;
  c.money.wallet += a;
  txn(c, 'in', a, label, cat || 'wage');
  if (cat !== 'quest') questTick(c, 'earn', a);
  badge(c, 'first-coin');
  return a;
}
/* Nothing goes negative in Sprout mode: there is no debt before it is taught. */
export function spend(c, amt, label, cat) {
  const a = Math.round(amt);
  if (c.band === 'sprout' && a > c.money.wallet) return false;
  c.money.wallet -= a;
  txn(c, 'out', a, label, cat || 'spend');
  return true;
}

export function jarTotal(c) { const j = c.money.jars; return j.spend + j.save + j.grow + j.give; }
export function holdingsValue(c) {
  return Math.round(CLASSES.reduce((t, a) =>
    t + (c.market.holdings[a.id] || 0) * (c.market.series[a.id] || [])[c.market.step], 0) || 0);
}
export function bizValue(c) { return c.biz ? Math.round(c.biz.cash) : 0; }
export function debt(c) { return c.money.bank.loan ? Math.round(c.money.bank.loan.owed) : 0; }
export function homeEquity(c) {
  const h = homeOf(c);
  if (!h.owned) return 0;
  return Math.round(price(h.mortgage ? h.mortgage.units : 0) * 1.15 - (c.home.mortgage ? c.home.mortgage.owed : 0));
}
export function netWorth(c) {
  return Math.round(c.money.wallet + jarTotal(c) + c.money.bank.balance
    + holdingsValue(c) + bizValue(c) + homeEquity(c) - debt(c));
}
export function stamp(c) {
  const h = c.history, v = netWorth(c);
  if (!h.length || h[h.length - 1].v !== v) h.push({ t: Date.now(), v });
  if (h.length > 120) h.splice(0, h.length - 120);
}

/* ── jobs on Market Row ──────────────────────────────────────────────── */
export function jobsToday(c) {
  const d = dayIndex(Date.now());
  const w = WORLDS[c.world || 0];
  let ids = w.jobs.slice();
  /* Anything you mended or bought that creates work names the job it creates,
     so a perk can never quietly grant a job the world already had. */
  FIXES.forEach((f) => { if (f.adds && c.fix.done.includes(f.id)) ids.push(f.adds); });
  SHOP.forEach((x) => { if (x.adds && c.shop.owned.includes(x.id)) ids.push(x.adds); });
  /* and a bicycle reaches the next world's work a world early */
  if (hasPerk(c, 'bicycle') && WORLDS[(c.world || 0) + 1]) ids = ids.concat(WORLDS[(c.world || 0) + 1].jobs);
  ids = [...new Set(ids)];
  return JOBS.filter((j) => ids.includes(j.id)).map((j) => {
    let amt = price(j.units);
    if (hasPerk(c, 'cargo') && j.id === 'cargo') amt = Math.round(amt * 1.5);
    if (hasPerk(c, 'netpay') && j.id === 'nets') amt = Math.round(amt * 1.5);
    if (hasPerk(c, 'rain') || hasPerk(c, 'coat')) amt = Math.round(amt * 1.15);
    return { ...j, done: c.jobs[j.id] === d, amt };
  });
}
/* A day's work. `quality` comes from how the job actually went — a job is a
   game now, not a button, and doing it well is worth more than doing it. It
   is clamped rather than unbounded: a bad shift still pays, because the child
   did the work, and a brilliant one cannot become a jackpot, because a wage
   that swings like a slot machine teaches the wrong thing (CONCEPT §6.3). */
export const JOB_FLOOR = 0.45, JOB_CEIL = 1.9;
export function doJob(c, id, quality) {
  const d = dayIndex(Date.now());
  const j = JOBS.find((x) => x.id === id);
  if (!j || c.jobs[id] === d) return 0;
  c.jobs[id] = d;
  const row = jobsToday(c).find((x) => x.id === id);
  const base = row ? row.amt : price(j.units);
  const q = quality === undefined ? 1 : Math.max(JOB_FLOOR, Math.min(JOB_CEIL, quality));
  const a = earn(c, Math.max(1, Math.round(base * q)), j.name + ' for ' + j.who, 'job');
  questTick(c, 'job', 1);
  stamp(c);
  return a;
}
/* Your own best at a job, so the thing you are competing with is yourself
   last week and not another child. */
export function jobBest(c, id) { return (c.jobs && c.jobs.best && c.jobs.best[id]) || 0; }
export function setJobBest(c, id, score) {
  if (!c.jobs.best) c.jobs.best = {};
  const prev = c.jobs.best[id] || 0;
  if (score > prev) { c.jobs.best[id] = score; return true; }
  return false;
}

/* ── worlds ──────────────────────────────────────────────────────────────
   You may travel on once you have finished learning where you are. That is
   the whole gate — no XP number, no paywall, just: read the chapters. */
export function currentWorld(c) { return WORLDS[c.world || 0]; }
export function canTravel(c, i) {
  if (i === (c.world || 0)) return { ok: false, why: 'You are already here' };
  if (worldOpen(c, i)) return { ok: true };
  const prev = WORLDS[i - 1];
  const left = prev.chapters.filter((ch) => !chapterDone(c, ch));
  return { ok: false, why: left.length ? 'Finish what you are learning in ' + prev.name : 'Not yet', need: left };
}
export function travel(c, i) {
  if (!canTravel(c, i).ok) return false;
  c.world = i;
  if (i > 0) badge(c, 'traveller');
  return true;
}
export function worldsOpen(c) { return WORLDS.filter((w, i) => worldOpen(c, i)).length; }

/* ── putting the town right ──────────────────────────────────────────────
   You pay towards a broken thing a bit at a time, exactly like a goal — and
   when it is finished the world changes and it pays you back every day
   afterwards. That contrast is the point: money spent on something that
   produces is not the same as money spent on something that doesn't, and a
   child learns it by watching one choice keep paying and the other not. */
export function fixState(c, f) {
  const cost = price(f.units);
  const put = (c.fix.prog[f.id] || 0);
  return { cost, put, done: c.fix.done.includes(f.id), left: Math.max(0, cost - put),
    pct: Math.min(1, put / cost), locked: !tester() && !!(f.needs && !chapterDone(c, f.needs)) };
}
export function townFixes(c, worldId) {
  return fixesIn(worldId || WORLDS[c.world || 0].id).map((f) => ({ ...f, ...fixState(c, f) }));
}
export function putRight(c, id, amount) {
  const f = FIXES.find((x) => x.id === id);
  if (!f || c.fix.done.includes(id)) return 0;
  const st = fixState(c, f);
  if (st.locked) return 0;
  const a = Math.min(Math.round(amount), c.money.wallet, st.left);
  if (a <= 0) return 0;
  c.money.wallet -= a;
  c.fix.prog[id] = (c.fix.prog[id] || 0) + a;
  txn(c, 'out', a, 'Towards ' + f.name, 'town');
  questTick(c, 'town', a);
  if (c.fix.prog[id] >= st.cost) {
    c.fix.done.push(id);
    badge(c, 'put-right');
    if (c.fix.done.length >= 4) badge(c, 'rebuilder');
  }
  stamp(c);
  return a;
}
/* One question the whole app asks of a perk: have you got it? Fixes and shop
   things answer it the same way, so nothing has to know where a perk came from. */
export function hasPerk(c, perk) {
  if (FIXES.some((f) => f.perk === perk && c.fix.done.includes(f.id))) return true;
  return SHOP.some((s) => s.perk === perk && c.shop.owned.includes(s.id));
}
export function townProgress(c) {
  const w = WORLDS[c.world || 0];
  const all = fixesIn(w.id);
  return { done: all.filter((f) => c.fix.done.includes(f.id)).length, all: all.length };
}

/* ── daily quests ────────────────────────────────────────────────────────
   Three a day, the same three for every child in the house, paying WAGES —
   not a second currency. Rolled from the date so they can be talked about at
   breakfast and cannot be rerolled by closing the app. */
export function rollQuests(c) {
  const d = dayIndex(Date.now());
  if (c.quests && c.quests.day === d && c.quests.list.length) return c.quests;
  const pool = QUESTS.filter((q) => !q.needs || tester() || chapterDone(c, q.needs));
  /* the town can only ask for help with something once it has something broken
     you are allowed to touch */
  if (!townFixes(c).some((f) => !f.done && !f.locked)) {
    const i = pool.findIndex((q) => q.kind === 'town');
    if (i >= 0) pool.splice(i, 1);
  }
  const picked = [];
  let h = (d * 2654435761) >>> 0;
  const avail = pool.slice();
  while (picked.length < Math.min(3, avail.length)) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    picked.push(avail.splice(h % avail.length, 1)[0]);
  }
  const slots = hasPerk(c, 'quest') ? 4 : 3;
  while (picked.length < Math.min(slots, avail.length + picked.length) && avail.length) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    picked.push(avail.splice(h % avail.length, 1)[0]);
  }
  c.quests = { day: d, list: picked.map((q) => q.id), prog: {}, claimed: {}, bonus: false };
  return c.quests;
}
export function questList(c) {
  const q = rollQuests(c);
  return q.list.map((id) => {
    const def = QUESTS.find((x) => x.id === id);
    const at = q.prog[id] || 0;
    return { ...def, at: Math.min(at, def.n), done: at >= def.n, claimed: !!q.claimed[id] };
  });
}
/* One call site per kind, so a quest can never be advanced twice by accident. */
export function questTick(c, kind, amount) {
  if (!c.quests || !c.quests.list) return;
  c.quests.list.forEach((id) => {
    const def = QUESTS.find((x) => x.id === id);
    if (!def || def.kind !== kind) return;
    c.quests.prog[id] = (c.quests.prog[id] || 0) + (amount || 1);
  });
}
export function claimQuest(c, id) {
  const def = QUESTS.find((x) => x.id === id);
  if (!def || !c.quests.list.includes(id)) return 0;
  if (c.quests.claimed[id]) return 0;
  if ((c.quests.prog[id] || 0) < def.n) return 0;
  c.quests.claimed[id] = true;
  const a = earn(c, price(def.pay), 'Quest — ' + def.t, 'quest');
  stamp(c);
  return a;
}
export function questBonus(c) {
  const all = questList(c);
  if (c.quests.bonus || !all.every((q) => q.claimed)) return 0;
  c.quests.bonus = true;
  const a = earn(c, price(12), 'All three quests', 'quest');
  badge(c, 'three-of-three');
  stamp(c);
  return a;
}

/* ── the week ────────────────────────────────────────────────────────── */
export function payDue(c, state) { return now(state) >= c.money.nextPay; }
export function daysToPay(c) { return Math.max(0, Math.ceil((c.money.nextPay - Date.now()) / DAY)); }

export function runPayDay(c, state) {
  const out = { wage: 0, bills: [], interest: 0, split: null, loan: 0, chores: [] };
  /* timed extra bills burn a week each pay day and fall off when spent */
  if (c.money.extraBills) {
    c.money.extraBills.forEach((b) => { if (b.weeks != null) b.weeks -= 1; });
    c.money.extraBills = c.money.extraBills.filter((b) => b.weeks == null || b.weeks > 0);
  }

  /* Family Mode: a parent mirrors a real allowance in, entirely by hand.
     No bank connection, ever (CONCEPT §8). */
  const wage = weeklyIncome(c);
  c.money.wallet += wage;
  txn(c, 'in', wage, 'Pay day — wages', 'wage');
  out.wage = wage;

  (c.family.chores || []).forEach((ch) => {
    if (!ch.done) return;
    c.money.wallet += ch.amt;
    txn(c, 'in', ch.amt, ch.name, 'chore');
    out.chores.push(ch);
    ch.done = false;
  });

  c.money.bills.forEach((b) => {
    c.money.wallet -= b.amt;
    txn(c, 'out', b.amt, b.name, 'bill');
    out.bills.push(b);
  });
  /* the companion's clock: a negative wallet here means the last things on
     the list did not really get bought, and the food was one of them */
  out.walletAfterBills = c.money.wallet;

  if (hasPerk(c, 'lockbox') && c.money.jars.save > 0) {
    const i = Math.round(c.money.jars.save * 0.01);
    if (i > 0) { c.money.jars.save += i; txn(c, 'in', i, 'The lockbox', 'interest'); out.lockbox = i; }
  }
  if (hasPerk(c, 'cat')) {
    const found = price(2);
    c.money.wallet += found; txn(c, 'in', found, 'The cat turned something up', 'gift'); out.cat = found;
  }
  if (c.money.bank.opened && c.money.bank.balance > 0) {
    const i = Math.round(c.money.bank.balance * c.money.bank.rate);
    if (i > 0) { c.money.bank.balance += i; txn(c, 'in', i, 'Bank interest', 'interest'); out.interest = i; }
  }

  const L = c.money.bank.loan;
  if (L) {
    const pay = Math.min(L.perWeek, Math.max(0, c.money.wallet));
    if (pay > 0) {
      c.money.wallet -= pay;
      L.owed = Math.max(0, L.owed - pay);
      L.paid += pay;
      txn(c, 'out', pay, 'Loan repayment', 'loan');
      out.loan = pay;
      c.money.bank.trust = Math.min(100, c.money.bank.trust + 3);
    } else {
      c.money.bank.trust = Math.max(0, c.money.bank.trust - 8);
      L.missed = (L.missed || 0) + 1;
    }
    if (L.owed <= 0) {
      c.money.bank.loan = null;
      c.money.bank.repaid++;
      c.money.bank.trust = Math.min(100, c.money.bank.trust + 8);
      badge(c, 'borrowed-well');
      out.loanCleared = true;
    }
  }

  /* Jar rules fire by themselves once the shed is open — "pay yourself first"
     as a mechanic rather than a slogan. */
  if (levelAtLeast(c, 6) && c.money.wallet > 0) {
    const pot = c.money.wallet, r = c.money.rules;
    const split = {
      spend: Math.round(pot * r.spend / 100), save: Math.round(pot * r.save / 100),
      grow: Math.round(pot * r.grow / 100), give: Math.round(pot * r.give / 100),
    };
    Object.keys(split).forEach((k) => { c.money.jars[k] += split[k]; });
    c.money.wallet = pot - (split.spend + split.save + split.grow + split.give);
    out.split = split;
    badge(c, 'jars-set');
  }

  c.money.goals.forEach((g) => {
    if (g.done || !g.auto) return;
    const take = Math.min(g.auto, c.money.jars.save);
    if (take > 0) { c.money.jars.save -= take; g.saved += take; checkGoal(c, g); }
  });

  if (c.home.mortgage) {
    const M = c.home.mortgage;
    const bill = out.bills.find((b) => b.name === 'Mortgage');
    if (bill) { M.owed = Math.max(0, M.owed - bill.amt); M.paid += bill.amt; }
    if (M.owed <= 0) { c.home.mortgage = null; out.mortgageCleared = true; refreshBills(c); }
  }
  out.independence = checkIndependence(c);
  c.money.nextPay = nextPayDay(Date.now(), c.family.payWeekday == null ? 5 : c.family.payWeekday);
  c.market.step = Math.min(MARKET_WEEKS - 1, c.market.step + 1);
  c.market.lastMove = marketMove(c);
  badge(c, 'payday');
  stamp(c);
  return out;
}
export function marketMove(c) {
  const a = c.market.series.index || c.market.series.basket, i = c.market.step;
  return i > 0 ? a[i] - a[i - 1] : 0;
}
export function setPayWeekday(c, wd) {
  c.family.payWeekday = wd;
  c.money.nextPay = nextPayDay(Date.now(), wd);
}
/* Prototype only. The shipping build takes pay day from the server so it
   cannot be advanced by moving the device clock (CLAUDE.md). */
export function protoSkipWeek(c, state) {
  c.money.nextPay = Date.now() - 1;
  state.clock.lastSeen = Date.now();
}
/* Tester tools (the grown-up's page, tester mode on). They move the ladder
   and the wallet by the sim's own rules and are labelled in the ledger, so a
   tester's town never pretends to be a child's. */
export function jumpLevel(c, lv) {
  const l = Math.max(1, Math.min(LEVELS.length, Math.round(lv)));
  c.learn.level = l; c.learn.xp = Math.max(c.learn.xp, LEVELS[l - 1]);
  stamp(c); return l;
}
export function testerTopUp(c, units) {
  return earn(c, price(units), 'Tester top-up', 'gift');
}

/* ── jars & goals ────────────────────────────────────────────────────── */
export function toJar(c, jar, amt) {
  const a = Math.min(Math.round(amt), c.money.wallet);
  if (a <= 0) return 0;
  c.money.wallet -= a; c.money.jars[jar] += a;
  if (jar !== 'spend') questTick(c, 'jar', a);
  txn(c, 'out', a, 'Into the ' + jar + ' jar', 'jar'); stamp(c); return a;
}
export function fromJar(c, jar, amt) {
  const a = Math.min(Math.round(amt), c.money.jars[jar]);
  if (a <= 0) return 0;
  c.money.jars[jar] -= a; c.money.wallet += a;
  txn(c, 'in', a, 'Out of the ' + jar + ' jar', 'jar'); stamp(c); return a;
}
export function addGoal(c, name, target) {
  c.money.goals.push({ id: 'g' + Date.now().toString(36), name, target: Math.round(target),
    saved: 0, auto: 0, done: false, t: Date.now() });
}
export function fundGoal(c, id, amt) {
  const g = c.money.goals.find((x) => x.id === id); if (!g) return 0;
  const a = Math.min(Math.round(amt), c.money.jars.save);
  if (a <= 0) return 0;
  c.money.jars.save -= a; g.saved += a; checkGoal(c, g); questTick(c, 'goal', 1); stamp(c); return a;
}
export function raidGoal(c, id) {
  const g = c.money.goals.find((x) => x.id === id); if (!g || g.saved <= 0) return 0;
  const a = g.saved; g.saved = 0; g.done = false; c.money.wallet += a;
  txn(c, 'in', a, 'Took back from "' + g.name + '"', 'jar'); stamp(c); return a;
}
export function dropGoal(c, id) {
  raidGoal(c, id);
  c.money.goals = c.money.goals.filter((x) => x.id !== id);
}
function checkGoal(c, g) { if (!g.done && g.saved >= g.target) { g.done = true; badge(c, 'goal-built'); } }
export function weeksToGoal(c, g) {
  const perWeek = Math.max(1, Math.round(weeklyIncome(c) * c.money.rules.save / 100));
  return Math.ceil(Math.max(0, g.target - g.saved) / perWeek);
}

/* ── bank & borrowing ────────────────────────────────────────────────── */
export function bankIn(c, amt) {
  const a = Math.min(Math.round(amt), c.money.jars.save);
  if (a <= 0) return 0;
  c.money.jars.save -= a; c.money.bank.balance += a; c.money.bank.opened = true;
  txn(c, 'out', a, 'Into the bank', 'bank'); stamp(c); return a;
}
export function bankOut(c, amt) {
  const a = Math.min(Math.round(amt), c.money.bank.balance);
  if (a <= 0) return 0;
  c.money.bank.balance -= a; c.money.jars.save += a;
  txn(c, 'in', a, 'Out of the bank', 'bank'); stamp(c); return a;
}
/* The total cost is computed and shown BEFORE the child agrees. That is the
   whole lesson of chapter six, so it is a property of the offer, not a tip. */
export function loanOffer(c, units, weeks) {
  const amount = price(units);
  /* Weekly. Deliberately visible but not punitive: ~12% total at the starting
     trust score, ~8% once it is earned. Credit is a tool with a price, and a
     price a child cannot believe teaches nothing. */
  const rate = 0.010 + (60 - Math.min(60, c.money.bank.trust)) * 0.0005;
  const total = Math.round(amount * (1 + rate * weeks));
  const perWeek = Math.ceil(total / weeks);
  return { amount, weeks, rate, total, perWeek, cost: total - amount };
}
export function takeLoan(c, offer) {
  if (c.money.bank.loan) return false;
  c.money.bank.loan = { amount: offer.amount, owed: offer.total, perWeek: offer.perWeek,
    weeks: offer.weeks, paid: 0, missed: 0, t: Date.now(), cost: offer.cost };
  c.money.wallet += offer.amount;
  txn(c, 'in', offer.amount, 'Loan from the bank', 'loan');
  stamp(c);
  return true;
}
export function repayLoan(c, amt) {
  const L = c.money.bank.loan; if (!L) return 0;
  const a = Math.min(Math.round(amt), c.money.wallet, L.owed);
  if (a <= 0) return 0;
  c.money.wallet -= a; L.owed -= a; L.paid += a;
  txn(c, 'out', a, 'Loan repayment', 'loan');
  if (L.owed <= 0) {
    c.money.bank.loan = null; c.money.bank.repaid++;
    c.money.bank.trust = Math.min(100, c.money.bank.trust + 10);
    badge(c, 'borrowed-well');
  }
  stamp(c); return a;
}

/* ── the Exchange ────────────────────────────────────────────────────── */
export function buyAsset(c, id, amt) {
  const a = Math.min(Math.round(amt), c.money.jars.grow);
  if (a <= 0) return 0;
  const p = c.market.series[id][c.market.step];
  c.money.jars.grow -= a;
  c.market.holdings[id] = (c.market.holdings[id] || 0) + a / p;
  questTick(c, 'invest', 1);
  txn(c, 'out', a, 'Bought ' + (classById[id] || { name: id }).name, 'invest');
  stamp(c); return a;
}
export function sellAsset(c, id) {
  const u = c.market.holdings[id] || 0;
  if (u <= 0) return 0;
  const v = Math.round(u * c.market.series[id][c.market.step]);
  c.market.holdings[id] = 0; c.money.jars.grow += v;
  txn(c, 'in', v, 'Sold ' + (classById[id] || { name: id }).name, 'invest');
  stamp(c); return v;
}
/* How spread a child's money is. This counts POSITIONS, which is a crude
   proxy for risk and is labelled as such wherever it is shown — four things
   that all fall together are not four things. A real risk number needs the
   volatility and the worst fall, which the engine computes and the app does
   not yet show anybody. */
export function spread(c) {
  const held = CLASSES.filter((a) => (c.market.holdings[a.id] || 0) > 0.0001);
  if (!held.length) return 0;
  /* The index IS a spread — it holds twelve companies. It used to be checked
     for under its old id 'basket', which stopped existing when the classes
     were rebuilt on the world engine, so a child holding the one genuinely
     diversified thing in the app was silently given no credit for it. */
  return held.some((a) => a.id === 'index') ? Math.max(4, held.length) : held.length;
}

/* ── Bizz & Co (Founder) ─────────────────────────────────────────────── */
export function openBiz(c) {
  if (c.biz) return c.biz;
  c.biz = {
    cash: price(40), day: 1, rent: price(6),
    stock: {}, prices: {}, weather: 'fair', open: false,
    log: [], best: 0,
  };
  STOCK.forEach((s) => { c.biz.prices[s.id] = price(s.sells); c.biz.stock[s.id] = 0; });
  return c.biz;
}
export function bizBuy(c, id, qty) {
  const b = c.biz, s = STOCK.find((x) => x.id === id);
  const cost = price(s.cost) * qty;
  if (cost > b.cash) return false;
  b.cash -= cost; b.stock[id] = (b.stock[id] || 0) + qty;
  return true;
}
export function bizPrice(c, id, d) {
  const b = c.biz, s = STOCK.find((x) => x.id === id);
  const floor = Math.max(1, Math.round(price(s.cost) * 0.5));
  b.prices[id] = Math.max(floor, b.prices[id] + d);
}
/* Demand falls as price rises — the elasticity is crude but it is real, and
   it is the only way "raise the price and take more money" can be discovered
   rather than asserted. */
export function bizTrade(c) {
  const b = c.biz;
  const w = WEATHER[Math.floor(seededRandom(b.day * 7919 + 13) * WEATHER.length)];
  b.weather = w.id;
  let revenue = 0, sold = {}, spoiled = {};
  STOCK.forEach((s) => {
    const have = b.stock[s.id] || 0;
    if (!have) return;
    const base = 9 * (w.mult[s.id] || 1);
    const fair = price(s.sells);
    const elasticity = Math.pow(fair / Math.max(1, b.prices[s.id]), 1.6);
    const want = Math.max(0, Math.round(base * elasticity * (0.75 + seededRandom(b.day * 31 + s.id.length) * 0.5)));
    const n = Math.min(have, want);
    sold[s.id] = n;
    revenue += n * b.prices[s.id];
    b.stock[s.id] = have - n;
    if (s.id === 'ice' && b.stock[s.id] > 0) { spoiled[s.id] = b.stock[s.id]; b.stock[s.id] = 0; }
  });
  const rent = b.rent;
  b.cash += revenue - rent;
  const profit = revenue - rent;
  b.log.unshift({ day: b.day, weather: w.id, revenue, rent, profit, sold, spoiled });
  if (b.log.length > 20) b.log.length = 20;
  b.day++;
  b.best = Math.max(b.best, profit);
  badge(c, 'shopkeeper');
  questTick(c, 'trade', 1);
  if (profit > 0) badge(c, 'profit-day');
  stamp(c);
  return { weather: w, revenue, rent, profit, sold, spoiled };
}
function seededRandom(n) {
  let s = (n >>> 0) || 1;
  s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
  return s / 4294967296;
}
export function bizCashOut(c) {
  const b = c.biz; if (!b) return 0;
  const keep = price(20);
  const take = Math.max(0, Math.round(b.cash - keep));
  if (take <= 0) return 0;
  b.cash -= take; c.money.wallet += take;
  txn(c, 'in', take, 'Drawn from Bizz & Co', 'business');
  stamp(c); return take;
}

/* ── learning ────────────────────────────────────────────────────────── */
export function addXP(c, n) {
  const before = c.learn.level;
  c.learn.xp += n;
  c.learn.level = levelFor(c.learn.xp);
  return { gained: n, leveled: c.learn.level > before, from: before, level: c.learn.level, rank: rankFor(c.learn.level) };
}
export function xpBar(c) {
  const l = c.learn.level;
  const lo = LEVELS[l - 1], hi = LEVELS[l] == null ? lo + 200 : LEVELS[l];
  return { lo, hi, pct: Math.min(1, (c.learn.xp - lo) / Math.max(1, hi - lo)), need: Math.max(0, hi - c.learn.xp) };
}
export function badge(c, id) {
  if (!id || c.badges.includes(id)) return false;
  c.badges.push(id); return true;
}

/* ── streak & postbox ────────────────────────────────────────────────── */
export function touchDay(c) {
  const d = dayIndex(Date.now());
  if (c.streak.last === d) return false;
  const nights = Math.max(1, d - c.streak.last);
  if (c.streak.last === d - 1) c.streak.days.push(d);
  else c.streak.days = [d];
  c.streak.last = d;
  if (c.postbox.day !== d) { c.postbox.day = d; c.postbox.idx += 1; c.postbox.answered = false; }
  rollQuests(c);   /* so a job taken before Home is opened can't tick yesterday's three */
  /* the morning after: what is waiting, measured on the day it flips. The
     overnight card (keepsakes.js) reads this and never invents an event. */
  c.overnight = { day: d, nights, seen: false, fuse: !!dueFuse(c) };
  return true;
}

/* ── the shop she buys from (content.js SHOP), and the first receipt ──────
   The Spend jar tops the wallet up if it is short, because that is what the
   jar is for; nothing else does. The FIRST thing she ever buys is kept as a
   receipt: the item, the shifts that paid for it and the weeks they took —
   counted back through her own ledger, never guessed. */
export function buyFromShop(c, it) {
  const p = price(it.units);
  let short = p - c.money.wallet;
  if (short > 0) {
    const take = Math.min(short, c.money.jars.spend);
    c.money.jars.spend -= take; c.money.wallet += take; short -= take;
  }
  if (short > 0) return { ok: false, why: 'Not enough — even after the Spend jar' };
  c.money.wallet -= p;
  txn(c, 'out', p, it.name, 'shop');
  c.shop.owned.push(it.id);
  const receipt = keepReceipt(c, it, p);
  stamp(c);
  return { ok: true, receipt };
}
function keepReceipt(c, it, p) {
  if (!c.keepsakes) c.keepsakes = [];
  if (c.keepsakes.some((k) => k.kind === 'receipt')) return null;
  const shifts = []; let sum = 0;
  for (const t of c.money.txns) {           /* newest first */
    if (t.kind !== 'in' || t.cat !== 'job') continue;
    shifts.push(t); sum += t.amt;
    if (sum >= p) break;
  }
  const from = shifts.length ? shifts[shifts.length - 1].t : Date.now();
  const k = { id: 'k' + Date.now().toString(36), kind: 'receipt', t: Date.now(),
    item: it.name, itemId: it.id, em: it.em, price: p, shifts: shifts.length, covered: sum >= p,
    weeks: Math.max(1, Math.ceil((Date.now() - from) / (7 * DAY))), who: c.name, level: c.learn.level };
  c.keepsakes.push(k);
  badge(c, 'first-receipt');
  return k;
}

/* ── currency ────────────────────────────────────────────────────────────
   Changing it converts the town rather than resetting it: the same child may
   count rupees at their grandmother's and dollars at school. */
export function changeCurrency(c, to) {
  const from = c.currency;
  if (from === to) return;
  const f = (n) => Math.round(convert(n, from, to));
  const m = c.money;
  m.wallet = f(m.wallet); m.wage = f(m.wage);
  ['spend', 'save', 'grow', 'give'].forEach((k) => { m.jars[k] = f(m.jars[k]); });
  m.bills.forEach((b) => { b.amt = f(b.amt); });
  m.goals.forEach((g) => { g.target = f(g.target); g.saved = f(g.saved); g.auto = f(g.auto || 0); });
  m.txns.forEach((t) => { t.amt = f(t.amt); });
  m.bank.balance = f(m.bank.balance);
  if (m.bank.loan) { const L = m.bank.loan; L.amount = f(L.amount); L.owed = f(L.owed); L.perWeek = f(L.perWeek); L.paid = f(L.paid); L.cost = f(L.cost); }
  /* Holdings are units of an asset whose price series is currency-agnostic, so
     the units themselves have to scale or the portfolio silently keeps its old
     value while everything around it converts. */
  const k = convert(1, from, to);
  Object.keys(c.market.holdings).forEach((id) => { c.market.holdings[id] *= k; });
  if (c.family.allowance != null) c.family.allowance = f(c.family.allowance);
  (c.family.chores || []).forEach((ch) => { ch.amt = f(ch.amt); });
  if (c.biz) {
    c.biz.cash = f(c.biz.cash); c.biz.rent = f(c.biz.rent);
    Object.keys(c.biz.prices).forEach((k) => { c.biz.prices[k] = f(c.biz.prices[k]); });
    c.biz.log.forEach((l) => { l.revenue = f(l.revenue); l.rent = f(l.rent); l.profit = f(l.profit); });
  }
  c.history.forEach((h) => { h.v = f(h.v); });
  c.currency = to;
  setCurrency(to);
}

/* ── persistence ─────────────────────────────────────────────────────── */
export function save(state) { Store.saveProfile(state); }
export function load() {
  const s = Store.loadProfile();
  if (!s) return null;
  if (!s.clock) s.clock = { lastSeen: Date.now() };
  s.kids.forEach((c) => {
    if (!c.market || !c.market.series || !c.market.series.index) c.market = newMarket((c.created ^ 0x9e3779b9) >>> 0);
    if (!c.market.holdings) c.market.holdings = {};
    if (!c.jobs) c.jobs = {};
    if (!c.shop.cooling) c.shop.cooling = {};
    if (!c.family) c.family = { allowance: null, payWeekday: 5, chores: [], coolOff: false };
    if (c.money.bank.trust == null) { c.money.bank.trust = 50; c.money.bank.repaid = 0; c.money.bank.loan = null; }
    if (!c.home) { c.home = { tier: 0, since: Date.now(), mortgage: null }; refreshBills(c); }
    if (c.world == null) c.world = 0;
    if (!c.fix) c.fix = { prog: {}, done: [] };
    if (!c.quests) c.quests = { day: -1, list: [], prog: {}, claimed: {}, bonus: false };
  });
  if (!s.ui) s.ui = { nav: 'home', sub: 'wallet' };
  if (s.active >= s.kids.length) s.active = 0;
  if (s.kids[s.active]) setCurrency(s.kids[s.active].currency);
  return s;
}

/* ── closing time ─────────────────────────────────────────────────────────
   A session needs an end, and the end is where a child decides whether there
   is a tomorrow. "Come back soon" is not a reason to come back. "You are two
   days off the shutters" is. Nothing here is encouragement — every line is
   arithmetic off what actually happened today, and if we cannot measure a
   thing we return 0 days and the view says the amount instead. Sim returns
   numbers; the sentence is the view's job. */
export function dayLedger(c, when) {
  const d = dayIndex(when || Date.now());
  const t = c.money.txns.filter((x) => dayIndex(x.t) === d);
  const inn = t.filter((x) => x.kind === 'in').reduce((s, x) => s + x.amt, 0);
  const out = t.filter((x) => x.kind === 'out').reduce((s, x) => s + x.amt, 0);
  const put = t.filter((x) => x.cat === 'town').reduce((s, x) => s + x.amt, 0);
  return { in: inn, out, put, net: inn - out, n: t.length };
}
/* What a day of yours is worth, measured — today if today has happened,
   otherwise the mean of the last three days that earned anything. Returns 0
   when there is no evidence, and callers must then not print days. */
export function earnRate(c) {
  const today = dayLedger(c).in;
  if (today > 0) return today;
  const days = {};
  c.money.txns.filter((x) => x.kind === 'in').forEach((x) => {
    const d = dayIndex(x.t); days[d] = (days[d] || 0) + x.amt;
  });
  const vals = Object.values(days).slice(-3);
  return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0;
}
/* The restoration you are closest to finishing, anywhere you can reach.
   Prefer one already started — a thing half done pulls harder than a thing
   not begun, and it is also the honest answer to "what is nearly mine". */
export function nearestFix(c) {
  const all = [];
  WORLDS.forEach((w, i) => {
    if (!worldOpen(c, i)) return;
    townFixes(c, w.id).forEach((f) => { if (!f.done && !f.locked) all.push({ ...f, where: w.name }); });
  });
  if (!all.length) return null;
  const started = all.filter((f) => f.put > 0);
  const pool = started.length ? started : all;
  const f = pool.reduce((a, b) => (b.left < a.left ? b : a));
  const rate = earnRate(c);
  return { ...f, rate, days: rate > 0 ? Math.max(1, Math.ceil(f.left / rate)) : 0 };
}
/* The next thing the ladder opens, and what must be finished to open it.
   Named — a building and a chapter — never "keep going". */
export function nextOpening(c) {
  const PLACES = [
    { key: 'jars', em: '🫙', t: 'The Jar Shed' }, { key: 'goals', em: '🏗️', t: 'The Build Yard' },
    { key: 'bank', em: '🏛️', t: 'The Bank' }, { key: 'loans', em: '📜', t: 'Borrowing, and what it costs' },
    { key: 'portfolio', em: '📈', t: 'The Exchange' }, { key: 'business', em: '🏪', t: "Nana Bizz's shop" },
  ];
  const p = PLACES.find((x) => !isOpen(c, x.key));
  if (p) {
    const ch = CHAPTERS.find((x) => x.id === UNLOCKS[p.key]);
    return { em: p.em, t: p.t, chapter: ch ? ch.title : null,
      left: ch ? ch.cards.filter((cd) => !c.learn.done[cd.id]).length : 0 };
  }
  const i = WORLDS.findIndex((w, n) => !worldOpen(c, n));
  if (i > 0) {
    const w = WORLDS[i]; const ch = CHAPTERS.find((x) => x.id === w.chapters[0]);
    return { em: w.em, t: w.name, chapter: ch ? ch.title : null,
      left: ch ? ch.cards.filter((cd) => !c.learn.done[cd.id]).length : 0 };
  }
  return null;
}

/* ── years 6 and 7: the venture (business.js) ──────────────────────────── */
export function openVenture(c, name) {
  if (c.venture) return c.venture;
  c.venture = biz.newVenture(name, c.market.step, c.market.seed);
  badge(c, 'shopkeeper');
  stamp(c);
  return c.venture;
}
export function ventureWorld(c) { return worldAt(c.market.seed, c.market.step, MARKET_WEEKS); }
export function ventureBuy(c, units) {
  const spent = biz.buyStock(c.venture, units, ventureWorld(c));
  if (spent) stamp(c);
  return spent;
}
export function ventureWeek(c) {
  const row = biz.tradeWeek(c.venture, c.market.seed, c.market.step);
  questTick(c, 'trade', 1);
  if (row.net > 0) badge(c, 'profit-day');
  /* The shop's week IS a market week — one clock, or the child's bond and
     their till would drift apart and the whole point of one world is lost. */
  c.market.step = Math.min(MARKET_WEEKS - 1, c.market.step + 1);
  c.market.lastMove = marketMove(c);
  /* Running out is not a silent negative number. A business with no money is
     a real event with a real name, and it is the moment the profit-is-not-cash
     lesson stops being a paragraph — so it is surfaced, and an overdraft is
     offered at a price rather than granted for free. */
  row.brokeAt = c.venture.cash < 0 ? Math.round(-c.venture.cash) : 0;
  if (row.brokeAt) badge(c, 'ran-dry');
  stamp(c);
  return row;
}
export function venturePrice(c, p) { c.venture.price = Math.max(1, Math.round(p)); stamp(c); }
/* Drawing money out is a real transaction: it leaves the business and lands
   in the child's own wallet, so the two ledgers stay separate and honest. */
export function ventureDraw(c, amt) {
  const v = c.venture;
  const a = Math.min(Math.round(amt), Math.max(0, Math.floor(v.cash)));
  if (a <= 0) return 0;
  v.cash -= a; v.paidIn -= a;
  earn(c, a, 'Drawn from ' + v.name, 'business');
  stamp(c);
  return a;
}
export const ventureLib = biz;
