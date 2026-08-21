/* sim.js — the one persistent object everything else is a view onto.
   ONE currency: games and lessons pay wages into the same wallet the store
   spends from (CONCEPT §3.1). There is no second, magic money. */

import { Store } from './store.js';
import { price, setCurrency, dayIndex, DAY } from './fmt.js';
import { levelFor, rankFor, LEVELS, makeSeries, ASSETS } from './content.js';

export const MARKET_STEPS = 40;

export function newState(name, band, cur) {
  setCurrency(cur);
  const now = Date.now();
  return {
    v: 1,
    child: { name: name || 'Friend', band: band || 'builder', currency: cur || 'INR', created: now },
    nav: 'home', sub: 'wallet', mode: null,
    money: {
      wallet: price(12),
      jars: { spend: 0, save: 0, grow: 0, give: 0 },
      rules: { spend: 40, save: 30, grow: 20, give: 10 },
      goals: [],
      txns: [{ id: 't0', t: now, kind: 'in', amt: price(12), label: 'Starting float from Nana', cat: 'gift' }],
      wage: price(20),
      bills: [{ name: 'Phone plan', units: 6, amt: price(6) }, { name: 'Stall rent', units: 4, amt: price(4) }],
      nextPay: nextFriday(now),
      bank: { balance: 0, rate: 0.02, opened: false },
    },
    learn: { xp: 0, level: 1, done: {}, openCard: null },
    market: { series: makeSeries(MARKET_STEPS), step: 6, lastMove: 1, cup: null, best: null },
    streak: { days: [dayIndex(now)], last: dayIndex(now) },
    postbox: { day: dayIndex(now), idx: 0, answered: false, log: [] },
    shop: { owned: [] },
    badges: [], history: [{ t: now, v: price(12) }],
    settings: { sound: true },
    proto: { weeksSkipped: 0 },
  };
}

function nextFriday(from) {
  const d = new Date(from);
  d.setHours(9, 0, 0, 0);
  const add = (5 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + add);
  return d.getTime();
}

/* ── money movements ─────────────────────────────────────────────────── */
export function txn(s, kind, amt, label, cat) {
  s.money.txns.unshift({ id: '␟' + Date.now() + Math.random().toString(36).slice(2, 6), t: Date.now(), kind, amt: Math.round(amt), label, cat: cat || 'other' });
  if (s.money.txns.length > 120) s.money.txns.length = 120;
}
export function earn(s, amt, label, cat) {
  if (amt <= 0) return 0;
  s.money.wallet += Math.round(amt);
  txn(s, 'in', amt, label, cat || 'wage');
  if (!s.badges.includes('first-coin')) badge(s, 'first-coin');
  return Math.round(amt);
}
/* Nothing goes negative in Sprout mode: there is no debt before it is taught. */
export function spend(s, amt, label, cat) {
  const a = Math.round(amt);
  if (s.child.band === 'sprout' && a > s.money.wallet) return false;
  s.money.wallet -= a;
  txn(s, 'out', a, label, cat || 'spend');
  return true;
}

export function netWorth(s) {
  const j = s.money.jars;
  return Math.round(s.money.wallet + j.spend + j.save + j.grow + j.give + s.money.bank.balance + portfolioValue(s));
}
export function portfolioValue(s) {
  if (!s.market.cup) return 0;
  return Math.round(s.market.cup.cash + ASSETS.reduce((t, a) =>
    t + (s.market.cup.units[a.id] || 0) * s.market.series[a.id][s.market.step], 0));
}
function stamp(s) {
  const h = s.history;
  const v = netWorth(s);
  if (!h.length || h[h.length - 1].v !== v) h.push({ t: Date.now(), v });
  if (h.length > 60) h.splice(0, h.length - 60);
}

/* ── the week ────────────────────────────────────────────────────────── */
export function payDue(s) { return Date.now() >= s.money.nextPay; }
export function daysToPay(s) { return Math.max(0, Math.ceil((s.money.nextPay - Date.now()) / DAY)); }

export function runPayDay(s) {
  const out = { wage: s.money.wage, bills: [], interest: 0, split: null };
  s.money.wallet += s.money.wage;
  txn(s, 'in', s.money.wage, 'Pay day — wages', 'wage');

  s.money.bills.forEach((b) => {
    s.money.wallet -= b.amt;
    txn(s, 'out', b.amt, b.name, 'bill');
    out.bills.push(b);
  });

  if (s.money.bank.opened && s.money.bank.balance > 0) {
    const i = Math.round(s.money.bank.balance * s.money.bank.rate);
    if (i > 0) { s.money.bank.balance += i; txn(s, 'in', i, 'Bank interest', 'interest'); out.interest = i; }
  }

  /* Jar rules fire automatically once the shed is open — "pay yourself first"
     as a mechanic rather than a slogan. */
  if (s.learn.level >= 2 && s.money.wallet > 0) {
    const pot = s.money.wallet;
    const r = s.money.rules;
    const split = {
      spend: Math.round(pot * r.spend / 100), save: Math.round(pot * r.save / 100),
      grow: Math.round(pot * r.grow / 100), give: Math.round(pot * r.give / 100),
    };
    Object.keys(split).forEach((k) => { s.money.jars[k] += split[k]; });
    s.money.wallet = pot - (split.spend + split.save + split.grow + split.give);
    out.split = split;
    badge(s, 'jars-set');
  }

  /* Goals with auto-transfer take their cut off the Save jar. */
  s.money.goals.forEach((g) => {
    if (g.done || !g.auto) return;
    const take = Math.min(g.auto, s.money.jars.save);
    if (take > 0) { s.money.jars.save -= take; g.saved += take; checkGoal(s, g); }
  });

  s.money.nextPay = nextFriday(Date.now());
  s.market.step = Math.min(MARKET_STEPS, s.market.step + 1);
  s.market.lastMove = marketMove(s);
  badge(s, 'payday');
  stamp(s);
  return out;
}
export function marketMove(s) {
  const a = s.market.series.basket, i = s.market.step;
  return i > 0 ? a[i] - a[i - 1] : 0;
}

/* Prototype only: the shipping build takes pay day from the server so it
   cannot be advanced by moving the device clock (CLAUDE.md). */
export function protoSkipWeek(s) {
  s.money.nextPay = Date.now() - 1;
  s.proto.weeksSkipped++;
}

/* ── jars & goals ────────────────────────────────────────────────────── */
export function toJar(s, jar, amt) {
  const a = Math.min(Math.round(amt), s.money.wallet);
  if (a <= 0) return 0;
  s.money.wallet -= a; s.money.jars[jar] += a;
  txn(s, 'out', a, 'Into the ' + jar + ' jar', 'jar');
  stamp(s);
  return a;
}
export function fromJar(s, jar, amt) {
  const a = Math.min(Math.round(amt), s.money.jars[jar]);
  if (a <= 0) return 0;
  s.money.jars[jar] -= a; s.money.wallet += a;
  txn(s, 'in', a, 'Out of the ' + jar + ' jar', 'jar');
  stamp(s);
  return a;
}
export function addGoal(s, name, target) {
  s.money.goals.push({ id: 'g' + Date.now(), name, target: Math.round(target), saved: 0, auto: 0, done: false, t: Date.now() });
}
export function fundGoal(s, id, amt) {
  const g = s.money.goals.find((x) => x.id === id); if (!g) return 0;
  const a = Math.min(Math.round(amt), s.money.jars.save);
  if (a <= 0) return 0;
  s.money.jars.save -= a; g.saved += a; checkGoal(s, g); stamp(s);
  return a;
}
export function raidGoal(s, id) {
  const g = s.money.goals.find((x) => x.id === id); if (!g || g.saved <= 0) return 0;
  const a = g.saved; g.saved = 0; g.done = false; s.money.wallet += a;
  txn(s, 'in', a, 'Took back from "' + g.name + '"', 'jar');
  stamp(s);
  return a;
}
function checkGoal(s, g) { if (!g.done && g.saved >= g.target) { g.done = true; badge(s, 'goal-built'); } }
export function weeksToGoal(s, g) {
  const perWeek = Math.max(1, Math.round(s.money.wage * s.money.rules.save / 100));
  return Math.ceil(Math.max(0, g.target - g.saved) / perWeek);
}

/* ── learning ────────────────────────────────────────────────────────── */
export function addXP(s, n) {
  const before = s.learn.level;
  s.learn.xp += n;
  s.learn.level = levelFor(s.learn.xp);
  return { gained: n, leveled: s.learn.level > before, level: s.learn.level, rank: rankFor(s.learn.level) };
}
export function xpBar(s) {
  const l = s.learn.level;
  const lo = LEVELS[l - 1], hi = LEVELS[l] == null ? lo + 200 : LEVELS[l];
  return { lo, hi, pct: Math.min(1, (s.learn.xp - lo) / Math.max(1, hi - lo)), need: Math.max(0, hi - s.learn.xp) };
}
export function badge(s, id) {
  if (!id || s.badges.includes(id)) return false;
  s.badges.push(id);
  return true;
}

/* ── streak & postbox ────────────────────────────────────────────────── */
export function touchDay(s) {
  const d = dayIndex(Date.now());
  if (s.streak.last === d) return false;
  if (s.streak.last === d - 1) s.streak.days.push(d);
  else s.streak.days = [d];
  s.streak.last = d;
  if (s.postbox.day !== d) { s.postbox.day = d; s.postbox.idx = (s.postbox.idx + 1); s.postbox.answered = false; }
  return true;
}

/* ── persistence ─────────────────────────────────────────────────────── */
export function save(s) { Store.saveProfile(s); }
export function load() {
  const s = Store.loadProfile();
  if (!s) return null;
  setCurrency(s.child.currency);
  if (!s.market || !s.market.series) s.market = { series: makeSeries(MARKET_STEPS), step: 6, lastMove: 1, cup: null, best: null };
  return s;
}
