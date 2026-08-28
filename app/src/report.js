/* report.js — the weekly digest (docs/05 Part C).

   The principle, and every line below follows from it: REPORT LEARNING, NOT
   USAGE. "Ahana played 40 minutes, 5-day streak" tells a parent what they
   could see from the sofa. This is what is worth money:

     "Ahana can now work out which of two sizes is better value. She chose
      correctly seven times out of eight this week — including twice when the
      bigger box was the worse deal, which is the one that catches most
      adults."

   Seven items, in this order, and the order matters. What is NEVER in here:
   a streak, a leaderboard, a comparison with another child, a percentile, a
   nudge to spend longer, or any offer.

   Everything is generated from the child's own simulation state. It contains
   what happened in Bizzington and nothing else — it never contains, infers or
   asks about the family's real money.                                       */

import { OBJECTIVES, objective, STRANDS } from './objectives.js';
import * as mastery from './mastery.js';
import * as decisions from './decisions.js';
import { DAY } from './fmt.js';

const WEEK = 7 * DAY;
const nameOf = (id) => (objective(id) || {}).short || id;

/* Places, as a parent would say them — "out in the loans" is a database
   column, not a sentence anyone would read aloud. */
const PLACE = {
  store: 'the shop', loans: 'the bank', goals: 'the Build Yard', wallet: 'her wallet',
  jars: 'the Jar Shed', exchange: 'the Exchange', place: 'home', business: 'the shop she runs',
};
const placeOf = (s) => PLACE[s] || s;

/* Item 1. What changed, in one sentence. If nothing changed it says so —
   a report that manufactures a highlight every week stops being read. */
function headline(c, moved, dec, weeks) {
  const gained = moved.filter((m) => m.to === 'retained' || m.to === 'transferred');
  const tr = moved.filter((m) => m.to === 'transferred');
  if (tr.length) return `${c.name} used something she was taught somewhere else entirely — ${nameOf(tr[0].id).toLowerCase()}, over at ${placeOf(tr[0].surface)}, without being asked.`;
  if (gained.length > 1) return `${c.name} held on to ${gained.length} things this week that she met a while ago — the gap is the point, not the answer.`;
  if (gained.length === 1) return `${c.name} still had ${nameOf(gained[0].id).toLowerCase()} ${gained[0].gap || 7} days after meeting it.`;
  if (dec.length) return `${c.name} made ${dec.length} ${dec.length === 1 ? 'decision worth' : 'decisions worth'} looking at this week, though nothing new stuck yet.`;
  if (!weeks) return `${c.name} has not been in this week. Nothing is lost — the town waits, and so does everything she had learned.`;
  return `A quiet week. Nothing new stuck, and nothing slipped either.`;
}

/* Item 3. One decision, told as a story, with the road not taken. */
function story(c, d, money) {
  if (!d) return null;
  const alt = d.alternatives[0];
  const day = new Date(d.t).toLocaleDateString(undefined, { weekday: 'long' });
  const gap = alt && alt.cost ? money(Math.abs(alt.cost)) : null;
  let text;
  if (d.surface === 'loans') {
    text = d.chose === 'wait'
      ? `On ${day} she was offered a loan. She worked out that borrowing would cost ${gap} on top, and decided to save up for it instead.`
      : `On ${day} she took a loan, having first been shown that it would cost ${gap} more than waiting. She knew the price before she agreed to it.`;
  } else if (d.chose === 'wait') {
    text = `On ${day} she had ${alt.label.toLowerCase()} in front of her at ${gap}, and put it back to think about for a day.`;
  } else if (alt) {
    text = `On ${day} she spent ${gap} on ${d.label.toLowerCase()} — which was also the money going towards ${alt.label.toLowerCase()}.`;
  } else {
    text = `On ${day} she bought ${d.label.toLowerCase()}.`;
  }
  return { when: day, text, reversed: d.reversed };
}

/* Item 5. The conversation card — the highest-value item in the product. It
   makes the parent a teacher rather than an audience, which is the whole
   difference between an app that complements what a parent is teaching and
   one that competes with it. Drawn from the objective most recently moved,
   so the question is about something that actually happened. */
function conversation(c, moved) {
  const pick = moved.find((m) => m.to === 'retained' || m.to === 'transferred')
    || moved[moved.length - 1];
  const o = pick ? objective(pick.id) : null;
  if (!o) return null;
  return { objective: o.id, about: o.short, ask: o.parent_line,
    answer: o.objective, why: (o.assess[0] || {}).why || '' };
}

/* Item 6. One thing to do in real life, tied to the surface it was learned
   on. Never a purchase, never a reward, never anything that costs money. */
/* Item 6 is a THING TO DO, and it must not restate item 5's question — a
   report whose two halves say the same sentence twice gets skimmed once and
   then not opened again. Every line here is free, takes minutes, and needs no
   purchase and no screen. */
const REAL = {
  store: 'Hand her the shopping list and a budget for one aisle. Whatever is left over is hers to decide about.',
  wallet: 'Let her pay at the till this week and count the change back into your hand before you leave.',
  place: 'Show her one bill that arrives every month. Not to worry her — just so she has seen that the house has a weekly shape.',
  jars: 'Give her the money for something in three parts across a week rather than all at once, and let her manage the gap.',
  goals: 'Put a jar on a shelf with a picture of the thing on it. Physical beats an app for this one, every time.',
  exchange: 'Next time two shops sell the same thing, let her be the one who says which is cheaper — and let her check the size.',
  business: 'Let her sell something real to someone real. A stall, a batch of something, one Saturday. Count the cost first.',
};

export function weekly(c, opts) {
  const o = opts || {};
  const now = o.now || Date.now();
  const from = o.from || (now - WEEK);
  const money = o.money || ((n) => String(n));

  const moved = mastery.movedSince(c, from);
  const dec = decisions.since(c, from);
  const weeks = dec.length + moved.length;

  const up = moved.filter((m) => m.to === 'retained' || m.to === 'transferred');
  const down = moved.filter((m) => m.to === 'lapsed');

  /* Item 4 is honest or it is nothing: lapses first, then anything answered
     wrong more than once, then — only if there is genuinely nothing — say so. */
  const hard = [];
  down.forEach((m) => hard.push({ id: m.id, why: 'slipped after having it' }));
  OBJECTIVES.forEach((ob) => {
    const r = c.mastery && c.mastery.rec[ob.id]; if (!r) return;
    const misses = r.hist.filter((h) => !h.ok && h.t >= from).length;
    if (misses && !down.some((d) => d.id === ob.id)) hard.push({ id: ob.id, why: `missed ${misses === 1 ? 'once' : misses + ' times'}` });
  });

  /* Item 7. What is next — so a parent is never surprised by what their child
     was taught. Named, not "more lessons". */
  const nextUp = OBJECTIVES.find((ob) => mastery.stateOf(c, ob.id) === 'unmet');

  return {
    child: c.name,
    from, to: now,
    quiet: !weeks,
    headline: headline(c, moved, dec, weeks),
    moved: up.map((m) => ({ id: m.id, name: nameOf(m.id), to: m.to,
      detail: m.to === 'transferred' ? `used it at ${placeOf(m.surface)}, unprompted` : `still had it after ${m.gap} days` })),
    story: story(c, decisions.headline(c, from), money),
    hard: hard.slice(0, 3).map((h) => ({ id: h.id, name: nameOf(h.id), why: h.why })),
    conversation: conversation(c, moved),
    real: REAL[(conversation(c, moved) && objective(conversation(c, moved).objective).surface)] || REAL.wallet,
    next: nextUp ? { id: nextUp.id, name: nextUp.short, objective: nextUp.objective } : null,
    strands: STRANDS.map((s) => {
      const all = OBJECTIVES.filter((x) => x.strand === s);
      if (!all.length) return { strand: s, all: 0 };
      const st = (id) => mastery.stateOf(c, id);
      return { strand: s, all: all.length,
        met: all.filter((x) => st(x.id) !== 'unmet').length,
        retained: all.filter((x) => ['retained', 'transferred'].includes(st(x.id))).length,
        transferred: all.filter((x) => st(x.id) === 'transferred').length };
    }).filter((s) => s.all),
  };
}
