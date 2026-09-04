/* ledger.js — what today's lesson beat is (docs/05 §B2, §B3).

   One rule, and it is the whole scheduler: a session gets ONE new objective
   OR one retrieval beat, never both. Retrieval wins when anything is due,
   because the thing already met and about to be forgotten is worth more than
   the next new thing — and because a curriculum that only ever moves forward
   is the one that produces a child who "did" thirty topics and holds none.

   Two constraints from docs/05 §B5 live here rather than in a document:

   - The curriculum advances on SESSIONS; the world advances on the calendar.
     A child who plays three days a week gets the whole curriculum, over more
     weeks. Nothing is missed by not playing daily.
   - No two consecutive sessions present the same shape of decision. The
     shapes here are 'teach' and 'retrieve'; when both are available and the
     last session was a retrieval, a new objective is offered instead.        */

import { OBJECTIVES, objective, teachCard, assessCard } from './objectives.js';
import * as mastery from './mastery.js';

/* The maths gate (docs/03 §1) — the real one. A surface may not open to a
   child who has not met the arithmetic it demands, so an objective needing
   M8 is not offered to a child who has not got there.

   The band sets a starting ceiling and it rises with the ladder. Both numbers
   are DESIGN ASSUMPTIONS, exactly as docs/03 footnotes its age column — they
   are replaced by placement.js measuring the child directly, and until then
   they are honest guesses rather than facts about any real curriculum. */
const BAND_FLOOR = { sprout: 6, builder: 10 };
export function mathsCeiling(c) {
  /* Measured beats guessed. placement.js asks the child directly; until she
     has sat it, the band guess above stands in and says so. */
  if (c.maths && c.maths.ceiling) return Math.min(17, c.maths.ceiling + Math.floor(((c.learn && c.learn.level) || 1) / 6));
  const base = BAND_FLOOR[c.band] || 6;
  return Math.min(17, base + Math.floor(((c.learn && c.learn.level) || 1) / 3));
}
/* Whether the ceiling is a measurement or a guess — surfaces that hold
   something back should be able to say which, honestly. */
export function mathsMeasured(c) { return !!(c.maths && c.maths.ceiling); }
export function mathsMet(c) {
  const ceil = mathsCeiling(c);
  return (m) => (parseInt(String(m).slice(1), 10) || 0) <= ceil;
}

/* Which retrieval item to ask. Rotate through the three contexts by how many
   times this objective has been asked, so the second sighting is never the
   same question in the same words. */
function pickItem(o, r) { return assessCard(o, (r.hist.length) % o.assess.length); }

/* An objective is available when its prerequisites are met and the maths it
   demands has been met. Maths is the real gate (docs/03 §1): a surface may not
   open to a child who has not met the arithmetic it demands. */
export function available(c, mathsMet) {
  return OBJECTIVES.filter((o) => {
    if (mastery.isMet(c, o.id)) return false;
    if (!o.needs.every((n) => ['practised', 'retained', 'transferred'].includes(mastery.stateOf(c, n)))) return false;
    if (mathsMet && !o.needs_maths.every((m) => mathsMet(m))) return false;
    return true;
  });
}

/* Today's beat. Returns null only when the strand is finished and nothing is
   due — which is a real state and the caller must say so rather than
   inventing filler. */
export function beat(c, allCards, opts) {
  const o = opts || {};
  const now = o.now || Date.now();
  const dueList = mastery.due(c, now);
  const next = available(c, o.mathsMet)[0] || null;
  const lastShape = c.mastery && c.mastery.lastShape;

  /* Same-shape rule: only ever breaks a tie, never starves a due item. */
  const preferTeach = lastShape === 'retrieve' && next && dueList.length <= 1;

  if (dueList.length && !preferTeach) {
    const ob = dueList[0];
    const r = mastery.record(c, ob.id);
    return { shape: 'retrieve', objective: ob, card: pickItem(ob, r),
      overdue: Math.max(0, Math.round((now - r.due) / 86400000)) };
  }
  if (next) {
    const card = teachCard(next, allCards);
    if (card) return { shape: 'teach', objective: next, card };
  }
  if (dueList.length) {
    const ob = dueList[0];
    return { shape: 'retrieve', objective: ob, card: pickItem(ob, mastery.record(c, ob.id)) };
  }
  return null;
}

/* Answering the beat. The two shapes route to two different places in the
   mastery record on purpose: a check is attention and a retrieval is
   evidence, and collapsing them is exactly the mistake this whole module
   exists to stop. */
export function answer(c, bt, ok, now) {
  if (!c.mastery) c.mastery = mastery.blank();
  c.mastery.lastShape = bt.shape;
  if (bt.shape === 'teach') {
    mastery.introduce(c, bt.objective.id, now);
    return mastery.check(c, bt.objective.id, ok, now);
  }
  return mastery.retrieve(c, bt.objective.id, ok, now);
}

/* Reading a teaching card without answering still counts as met, so a child
   who reads and closes does not get the same card again tomorrow. */
export function seen(c, id, now) { return mastery.introduce(c, id, now); }

export function strandProgress(c, strand) {
  const all = OBJECTIVES.filter((o) => o.strand === strand);
  const st = (id) => mastery.stateOf(c, id);
  return {
    all: all.length,
    met: all.filter((o) => st(o.id) !== 'unmet').length,
    retained: all.filter((o) => ['retained', 'transferred'].includes(st(o.id))).length,
    transferred: all.filter((o) => st(o.id) === 'transferred').length,
    lapsed: all.filter((o) => st(o.id) === 'lapsed').length,
  };
}
export { objective };
