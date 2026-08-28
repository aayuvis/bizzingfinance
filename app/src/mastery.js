/* mastery.js — the single source of truth for anything reported (docs/05 §A5).

   One record per objective per child. Nothing else may claim a child has
   learned something; if it is not in here, it does not go in the report.

   The states, and why they are separated:

     unmet → introduced → practised → retained → transferred
                              ↑            ↓
                              └─── lapsed ─┘

   - introduced   met the teaching card
   - practised    cleared the immediate check. This is ATTENTION, ninety
                  seconds old. It is deliberately a state and deliberately
                  never reported as learning.
   - retained     cleared a retrieval item at a gap of 7 days or more
   - transferred  did the thing correctly, unprompted, on a surface it was
                  not taught on. The most expensive evidence and the only
                  kind a quiz cannot produce.
   - lapsed       failed a retrieval after reaching retained. Reported
                  honestly — a report that only ever goes up is a marketing
                  document, and parents can smell one.                       */

import { OBJECTIVES, objective } from './objectives.js';
import { dayIndex, DAY } from './fmt.js';

/* An expanding schedule. These intervals are a DESIGN ASSUMPTION to be tuned
   against this app's own retention data, not a cited finding — so they live
   here as data and not as magic numbers scattered through the scheduler. */
export const BOXES = [1, 3, 7, 21, 60];
const RETAIN_GAP = 7;          /* days; below this a correct answer is practice */

export function blank() { return { rec: {}, seen: [] }; }

export function record(c, id) {
  if (!c.mastery) c.mastery = blank();
  if (!c.mastery.rec[id]) {
    c.mastery.rec[id] = { state: 'unmet', box: 0, due: 0, at: 0, checks: 0, hist: [], transfers: [] };
  }
  return c.mastery.rec[id];
}
export function stateOf(c, id) { return (c.mastery && c.mastery.rec[id] || { state: 'unmet' }).state; }
export function isMet(c, id) { return stateOf(c, id) !== 'unmet'; }

/* The teaching card was read. */
export function introduce(c, id, now) {
  const r = record(c, id); const t = now || Date.now();
  if (r.state === 'unmet') { r.state = 'introduced'; r.at = t; }
  r.due = t + BOXES[0] * DAY;
  return r;
}

/* The immediate check, straight after the card. Attention, not learning —
   it moves the state to practised and is never counted as evidence. */
export function check(c, id, ok, now) {
  const r = record(c, id); const t = now || Date.now();
  r.checks++;
  if (ok && (r.state === 'introduced' || r.state === 'unmet')) r.state = 'practised';
  r.due = t + BOXES[Math.min(r.box, BOXES.length - 1)] * DAY;
  return r;
}

/* A retrieval item, days later, in a different context. THIS is evidence.
   A correct answer at a gap of a week or more is retention; a wrong one
   after retention is a lapse, and the box drops back rather than to zero —
   a thing once known is not a thing never known. */
export function retrieve(c, id, ok, now) {
  const r = record(c, id); const t = now || Date.now();
  const gap = r.hist.length ? Math.round((t - r.hist[r.hist.length - 1].t) / DAY) : Math.round((t - r.at) / DAY);
  r.hist.push({ t, ok: !!ok, gap });
  if (ok) {
    r.box = Math.min(r.box + 1, BOXES.length - 1);
    if (gap >= RETAIN_GAP && r.state !== 'transferred') r.state = 'retained';
    else if (r.state === 'lapsed') r.state = 'practised';
    else if (r.state === 'introduced' || r.state === 'unmet') r.state = 'practised';
  } else {
    if (r.state === 'retained' || r.state === 'transferred') r.state = 'lapsed';
    r.box = Math.max(0, r.box - 1);
  }
  r.due = t + BOXES[r.box] * DAY;
  return r;
}

/* Did the thing, unprompted, on a surface it was not taught on.
   Callers pass the surface they are actually on; a transfer recorded on the
   objective's own teaching surface is not transfer and is refused here rather
   than being quietly counted. */
export function transfer(c, id, surface, detail, now) {
  const o = objective(id); if (!o) return null;
  if (surface === o.surface) return null;
  if (!o.transfer.includes(surface)) return null;
  const r = record(c, id); const t = now || Date.now();
  if (r.state === 'unmet') return null;          /* cannot transfer what was never met */
  r.transfers.push({ t, surface, detail: detail || '' });
  r.state = 'transferred';
  r.box = Math.min(r.box + 1, BOXES.length - 1);
  r.due = t + BOXES[r.box] * DAY;
  return r;
}

/* ── reading it back ─────────────────────────────────────────────────────── */
export function due(c, now) {
  const t = now || Date.now();
  return OBJECTIVES.filter((o) => {
    const r = c.mastery && c.mastery.rec[o.id];
    return r && r.state !== 'unmet' && r.due <= t;
  }).sort((a, b) => c.mastery.rec[a.id].due - c.mastery.rec[b.id].due);
}
export function counts(c) {
  const out = { unmet: 0, introduced: 0, practised: 0, retained: 0, transferred: 0, lapsed: 0 };
  OBJECTIVES.forEach((o) => { out[stateOf(c, o.id)]++; });
  return out;
}
/* Everything that moved into a state during a window — the raw material of
   the weekly report. Movement is read from history rather than stored as a
   diff, so a report can be regenerated for any past week. */
export function movedSince(c, since) {
  const moved = [];
  OBJECTIVES.forEach((o) => {
    const r = c.mastery && c.mastery.rec[o.id]; if (!r) return;
    const tr = r.transfers.filter((x) => x.t >= since);
    if (tr.length) { moved.push({ id: o.id, to: 'transferred', t: tr[0].t, surface: tr[0].surface }); return; }
    const h = r.hist.filter((x) => x.t >= since);
    const win = h.find((x) => x.ok && x.gap >= RETAIN_GAP);
    if (win && r.state === 'retained') moved.push({ id: o.id, to: 'retained', t: win.t, gap: win.gap });
    const miss = h.filter((x) => !x.ok).pop();
    if (miss && r.state === 'lapsed') moved.push({ id: o.id, to: 'lapsed', t: miss.t });
    if (!win && !miss && r.at >= since && r.state === 'practised') moved.push({ id: o.id, to: 'practised', t: r.at });
  });
  return moved.sort((a, b) => a.t - b.t);
}
export function lastSeen(c, id) {
  const r = c.mastery && c.mastery.rec[id]; if (!r) return 0;
  const h = r.hist.length ? r.hist[r.hist.length - 1].t : 0;
  const x = r.transfers.length ? r.transfers[r.transfers.length - 1].t : 0;
  return Math.max(r.at, h, x);
}
export { dayIndex };
