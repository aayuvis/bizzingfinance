/* mistakes.js — "Ones to try again", the mistakes deck (FAMILY-STANDARD §12, F3).

   Built from WRONG FIRST ANSWERS in the lessons, never from anything else. A question a
   child missed comes back after a gap — a day, then three, then a week — and leaves the
   deck only after being right twice, each after its gap. Right too soon is not evidence
   of remembering, so an item answered before it is due does not climb.

   A miss drops it ONE box and says so; it never resets the deck and never shames.
   DOM-free; test/mistakes.mjs holds it to that. */
const DAY = 864e5;
export const GAPS = [1, 3, 7];          /* days before it comes back, by box */
export const CLEAR_AT = 2;              /* right after a gap this many times, and it is yours */

const key = (card, qi) => `${card}#${qi || 0}`;
const list = (c) => (c.mistakes || (c.mistakes = []));

export function record(c, card, qi, now = Date.now()) {
  const k = key(card, qi), L = list(c);
  const m = L.find((x) => x.k === k);
  if (m) { m.box = Math.max(0, m.box - 1); m.due = now + GAPS[m.box] * DAY; m.misses++; m.cleared = false; return m; }
  const n = { k, card, qi: qi || 0, t: now, due: now + GAPS[0] * DAY, box: 0, misses: 1, rights: 0, cleared: false };
  L.push(n);
  if (L.length > 120) L.splice(0, L.length - 120);
  return n;
}
export function open(c) { return list(c).filter((m) => !m.cleared); }
export function due(c, now = Date.now()) { return open(c).filter((m) => m.due <= now).sort((a, b) => a.due - b.due); }
export function waiting(c, now = Date.now()) { return open(c).filter((m) => m.due > now).sort((a, b) => a.due - b.due); }
export function cleared(c) { return list(c).filter((m) => m.cleared); }

/* returns { moved: 'up'|'down'|'cleared'|'early', m } */
export function answer(c, k, right, now = Date.now()) {
  const m = list(c).find((x) => x.k === k && !x.cleared);
  if (!m) return null;
  if (!right) { m.box = Math.max(0, m.box - 1); m.due = now + GAPS[m.box] * DAY; m.misses++; m.rights = 0; return { moved: 'down', m }; }
  if (m.due > now) return { moved: 'early', m };
  m.rights++;
  if (m.rights >= CLEAR_AT) { m.cleared = true; m.clearedAt = now; return { moved: 'cleared', m }; }
  m.box = Math.min(GAPS.length - 1, m.box + 1); m.due = now + GAPS[m.box] * DAY;
  return { moved: 'up', m };
}
