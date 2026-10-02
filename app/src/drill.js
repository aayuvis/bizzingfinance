/* drill.js — one question's life, as pure functions (FAMILY-STANDARD §6, D3).

   A right answer settles the question. A wrong first answer HOLDS: it marks
   the pick, shows the why, and leaves the other options open for one more
   go — the correct option is not revealed yet, or the retry would be a
   formality. The second go settles it either way and reveals the answer.
   Nothing ever advances by itself; the child taps Next.

   The card counts as right only when every question was right FIRST time:
   a second-go answer is learning, and it is not evidence of having known. */

/* settled: no more picks for this question. Old saves stored {pick, right}
   without `tries`; those are settled. */
export function settled(p) { return !!p && (p.right || p.tries !== 1); }
export function holding(p) { return !!p && !p.right && p.tries === 1; }

export function pick(st, qi, i, answer) {
  const cur = st.picks[qi];
  if (settled(cur)) return cur;
  if (cur && cur.wrong === i) return cur;              /* the same wrong option again: no-op */
  const right = i === answer;
  st.picks[qi] = cur
    ? { ...cur, pick: i, right, tries: 2 }
    : { pick: i, right, first: right, tries: 1, wrong: right ? null : i };
  return st.picks[qi];
}

export function tally(st, total) {
  const ps = st.picks.slice(0, total);
  const done = ps.length === total && ps.every(settled);
  return { done, right: done && ps.every((p) => p.first !== false && p.right) };
}
