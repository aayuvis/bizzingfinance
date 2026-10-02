/* reportcard.js — the grown-ups' one-glance card (FAMILY-STANDARD §7, M1/M2).

   Three measures, the same three in every Bizzing app so the Hive can merge
   them: TIME (active minutes, read back from the family activity feed — never
   counted here), PROGRESS (steps along the path) and MASTERY (what the child
   can now do, from evidence in mastery.js). Plus the week's decisions, read
   from the decision log — never inferred from the current state, which is how
   a default once got reported as a choice.

   Pure: give it a child and, optionally, the feed. The view only draws it. */
import { OBJECTIVES } from './objectives.js';
import { STRANDS } from './objectives.js';
import * as mastery from './mastery.js';
import { progress } from './next.js';
import { rankObj } from './content.js';

const WEEK = 7 * 864e5;
const HELD = ['retained', 'transferred'];

/* Active minutes this week from bizzing.activity, for this app and child. */
export function minutesThisWeek(feed, name, now = Date.now()) {
  const from = new Date(now - WEEK); const pad = (n) => String(n).padStart(2, '0');
  const since = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
  const who = String(name || '').trim().toLowerCase();
  return ((feed && feed.s) || []).filter((x) => x.a === 'finance' && x.d >= since && String(x.who || '').trim().toLowerCase() === who)
    .reduce((t, x) => t + (x.m || 0), 0);
}

export function card(c, feed, now = Date.now()) {
  const pr = progress(c);
  const states = OBJECTIVES.map((o) => ({ o, st: mastery.stateOf(c, o.id) }));
  const held = states.filter((x) => HELD.includes(x.st));
  const lapsed = states.filter((x) => x.st === 'lapsed');
  const practising = states.filter((x) => x.st === 'practised' || x.st === 'introduced');
  const moved = mastery.movedSince ? mastery.movedSince(c, now - WEEK) : [];
  const decided = (c.decisions || []).filter((d) => d.t >= now - WEEK);
  return {
    time: { minutes: minutesThisWeek(feed, c.name, now) },
    progress: { stops: pr.done, of: pr.total, world: pr.world.name, worldDone: pr.worldDone, worldOf: pr.worldTotal,
      level: c.learn.level, rank: rankObj(c.learn.level).name },
    mastery: {
      held: held.map((x) => x.o.short), lapsed: lapsed.map((x) => x.o.short), practising: practising.length,
      of: OBJECTIVES.length, movedThisWeek: Array.isArray(moved) ? moved.length : 0,
      byStrand: (STRANDS || []).map((s) => ({ name: s.name || s.id, held: held.filter((x) => x.o.strand === (s.id || s)).length,
        of: OBJECTIVES.filter((o) => o.strand === (s.id || s)).length })),
    },
    decisions: decided.map((d) => ({ label: d.label, chose: d.chose, t: d.t })),
  };
}
