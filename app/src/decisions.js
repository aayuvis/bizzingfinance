/* decisions.js — the consequential-choice log (docs/05 §C5).

   The parent report's best line is one decision told as a story, and the
   story is only worth reading because it carries THE ROAD NOT TAKEN:

     "On Tuesday she was offered a loan for a bicycle. She worked out it would
      cost ₹340 more and waited three weeks instead."

   That sentence cannot be written from a balance. It needs the alternative
   that was declined and what it would have cost, recorded at the moment of
   the choice — which is why this is a log and not a derived view.           */

const CAP = 400;   /* a household's worth; the report only ever reads a week */

export function log(c, entry) {
  if (!c.decisions) c.decisions = [];
  c.decisions.unshift({
    t: entry.t || Date.now(),
    objective: entry.objective || null,
    surface: entry.surface,
    chose: entry.chose,
    label: entry.label || '',
    alternatives: entry.alternatives || [],
    reversed: false,
  });
  if (c.decisions.length > CAP) c.decisions.length = CAP;
  return c.decisions[0];
}

/* A child who changes their mind quickly has told you something, and it is
   not failure — it is the pause working. Recorded, never punished. */
export function reverse(c, withinMs) {
  if (!c.decisions || !c.decisions.length) return null;
  const d = c.decisions[0];
  if (Date.now() - d.t > (withinMs || 120000)) return null;
  d.reversed = true;
  return d;
}

export function since(c, t) { return (c.decisions || []).filter((d) => d.t >= t); }

/* The one worth telling: prefer a decision where a real alternative was
   declined and the gap between them was largest, because that is the one with
   a number in it. */
export function headline(c, from) {
  const pool = since(c, from).filter((d) => d.alternatives && d.alternatives.length);
  if (!pool.length) return null;
  return pool.reduce((a, b) => (best(b) > best(a) ? b : a));
}
function best(d) { return Math.max(...d.alternatives.map((a) => Math.abs(a.cost || 0)), 0); }
