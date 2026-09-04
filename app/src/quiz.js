/* quiz.js — six mixed questions from one chapter, two doors.

   TEST OUT (India's "already know this? six questions at full difficulty,
   five right opens the stage"): a level-locked chapter opens without its
   cards being marked done — assessment separated from teaching (docs/05).
   CHECKPOINT (Bee's every-fourth-stop mixed quiz): once a chapter's cards
   are all read, a mixed quiz with nothing new in it; the score sits on the
   rail. Questions are drawn across the chapter's cards, spread by the day
   so the same six do not come up twice running, and every option order is
   permuted from the card id like every other drill in the app. */
import { CHAPTERS, shuffledDrill, drillCount } from './content.js';
import { dayIndex } from './fmt.js';
import * as sim from './sim.js';

export const N = 6, PASS = 5;
/* a chapter with fewer questions than six passes on all but one */
export const passMark = (n) => Math.max(1, Math.min(PASS, n - 1));
export function chapter(id) { return CHAPTERS.find((x) => x.id === id); }
export function build(ch, d = dayIndex(Date.now())) {
  const pairs = [];
  ch.cards.forEach((card) => { for (let qi = 0; qi < drillCount(card); qi++) pairs.push([card.id, qi]); });
  if (!pairs.length) return [];
  const step = Math.max(1, Math.floor(pairs.length / N)), start = d % pairs.length, out = [];
  for (let i = 0; i < pairs.length && out.length < N; i++) out.push(pairs[(start + i * step) % pairs.length]);
  return out;
}
export function start(chId, mode) {
  const ch = chapter(chId); if (!ch) return null;
  return { kind: 'quiz', mode, ch: chId, items: build(ch), i: 0, right: 0, pick: null, done: false };
}
export function current(o) {
  const [cid, qi] = o.items[o.i]; const card = chapter(o.ch).cards.find((k) => k.id === cid);
  return { card, dq: shuffledDrill(card, qi) };
}
export function answer(o, i) {
  if (o.pick != null || o.done) return;
  const { dq } = current(o);
  o.pick = { i: +i, ok: +i === dq.answer, why: dq.why };
  if (o.pick.ok) o.right += 1;
}
export function next(o) {
  if (o.pick == null) return;
  o.i += 1; o.pick = null;
  if (o.i >= o.items.length) o.done = true;
}
/* the outcome is written once, by the sim's rules */
export function finish(c, o) {
  if (!o.done || o.settled) return null;
  o.settled = true;
  const pass = o.right >= passMark(o.items.length), pct = Math.round(o.right / o.items.length * 100);
  if (o.mode === 'testout') {
    if (pass) { c.learn.testedOut = c.learn.testedOut || {}; c.learn.testedOut[o.ch] = true; sim.badge(c, 'tested-out'); sim.addXP(c, 20); }
  } else {
    c.learn.checkpoints = c.learn.checkpoints || {};
    c.learn.checkpoints[o.ch] = Math.max(c.learn.checkpoints[o.ch] || 0, pct);
    if (pass) { sim.badge(c, 'checkpoint'); sim.addXP(c, 15); }
  }
  sim.stamp(c);
  return { pass, pct };
}
