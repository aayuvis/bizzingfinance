/* dailypuzzle.js — one puzzle a day, the same one for everybody.

   Bee's Daily Buzz is the strongest thing either sibling has for bringing a
   child back that is not streak pressure: one puzzle, the same for the whole
   house, no timer, and a share that gives nothing away. This is that in
   money — a till receipt with one number missing.

   Rules it keeps:
   · Deterministic from the date, so the whole household is on the same one
     and it can be talked about at the table. No randomness anywhere.
   · Three tries, and the third shows the working. Failing costs nothing.
   · The wage goes into the same wallet as everything else (CONCEPT §6.4),
     and it is paid for finishing, not for being fast or for a run of days.
   · There is no streak. Missing yesterday's costs nothing and is not
     mentioned — the editorial policy bans that, and a puzzle you must not
     miss is a chore.
   · The share is the shape of the attempt, never the answer. */

import { price } from './fmt.js';
import * as sim from './sim.js';

export const TRIES = 3;
export const WAGE = 4;                        /* price units, paid once */
const EPOCH = Date.UTC(2026, 0, 1) / 86400000;   /* day 0 of the puzzle series */

export function dayNo(t) { return Math.floor((t || Date.now()) / 86400000) - EPOCH; }

/* A tiny deterministic generator: the day number is the only input, so the
   same day is the same puzzle on every device, for ever. */
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

const GOODS = [
  ['a bag of rice', 'grain'], ['two lemons', 'flower'], ['a bundle of rope', 'work'],
  ['a jar of honey', 'jars'], ['a paper kite', 'quest'], ['a tin of tea', 'chai'],
  ['a ball of string', 'work'], ['a wedge of cheese', 'grain'], ['a clay pot', 'jars'],
  ['a bunch of coriander', 'flower'], ['six eggs', 'grain'], ['a woven basket', 'basket'],
];

/* The puzzle: a receipt where one line's price is missing, and the total is
   there. Some days the missing line is a multiple ("three at ?? each"), which
   turns the same puzzle from a subtraction into a division. */
export function puzzle(day) {
  const d = day == null ? dayNo() : day;
  const r = rng(d + 1);
  const n = 3 + Math.floor(r() * 2);                 /* three or four lines */
  const pick = [];
  const pool = GOODS.slice();
  for (let i = 0; i < n; i++) pick.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  const lines = pick.map(([name, em]) => ({ name, em, qty: 1, each: 5 + Math.floor(r() * 24) }));
  /* one line gets a quantity, so division shows up about half the time */
  const multi = r() < 0.5;
  const hidden = Math.floor(r() * lines.length);
  if (multi) lines[hidden].qty = 2 + Math.floor(r() * 3);
  const total = lines.reduce((t, l) => t + l.qty * l.each, 0);
  return {
    day: d, lines, hidden, total,
    answer: lines[hidden].each,
    kind: lines[hidden].qty > 1 ? 'divide' : 'subtract',
  };
}

/* ── a child's attempt at today's ─────────────────────────────────────── */
export function stateOf(c, day) {
  const d = day == null ? dayNo() : day;
  const rec = (c.puzzle && c.puzzle.day === d) ? c.puzzle : null;
  return rec || { day: d, tries: [], done: false, won: false, paid: false };
}
export function guess(c, n, day) {
  const p = puzzle(day), st = stateOf(c, p.day);
  if (st.done) return { already: true };
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v <= 0) return { bad: true };
  st.tries.push(v);
  const won = v === p.answer;
  if (won || st.tries.length >= TRIES) { st.done = true; st.won = won; }
  c.puzzle = st;
  let paid = 0;
  if (st.done && st.won && !st.paid) { st.paid = true; paid = sim.earn(c, price(WAGE), "Today's till", 'wage'); sim.questTick(c, 'earn', paid); }
  if (st.done && st.won) sim.badge(c, st.tries.length === 1 ? 'first-look' : 'till-solved');
  sim.stamp(c);
  return { won, done: st.done, left: TRIES - st.tries.length, paid, near: !won && Math.abs(v - p.answer) <= 2 };
}

/* The share is the shape of the attempt: how many tries, and whether each
   was high, low or right. It never contains the answer or the prices. */
export function share(c, day) {
  const p = puzzle(day), st = stateOf(c, p.day);
  if (!st.done) return '';
  const marks = st.tries.map((t) => (t === p.answer ? '🟩' : t > p.answer ? '🔽' : '🔼')).join('');
  return `Bizzington Till #${p.day}  ${st.won ? st.tries.length : 'X'}/${TRIES}\n${marks}`;
}
