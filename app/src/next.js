/* next.js — the ONE next step.

   Home said "Needs and wants" while the Atlas said "Money is an agreement":
   two screens, two functions, two different answers to the only question a
   child opening the app is asking. Every Continue button in the app now asks
   this module, so they agree by construction (test/next.mjs).

   The order is the ledger's, because the ledger is what knows what is due:
     1. the day's beat — a retrieval that is due, or the next objective to
        meet — unless it was already answered today;
     2. otherwise the Atlas frontier: the first stop, in walking order, that is
        not done and is open;
     3. otherwise a locked frontier says how it opens;
     4. otherwise everything is walked, and revising is the step.
   DOM-free on purpose, so a test can hold it to that. */
import { ALL_CARDS, CHAPTERS, WORLDS, chapterLocked, worldOpen } from './content.js';
import * as ledger from './ledger.js';

/* Every stop in walking order — the same order the Atlas draws. */
export function path(c) {
  const out = [];
  WORLDS.forEach((w, wi) => w.chapters.forEach((chId) => {
    const ch = CHAPTERS.find((x) => x.id === chId); if (!ch) return;
    ch.cards.forEach((card) => out.push({ card, ch, wi, w, done: !!c.learn.done[card.id],
      locked: chapterLocked(c, ch) || !worldOpen(c, wi) }));
  }));
  return out;
}

export function progress(c) {
  const p = path(c), done = p.filter((s) => s.done).length;
  const here = p.find((s) => !s.done) || p[p.length - 1];
  const inWorld = p.filter((s) => s.wi === here.wi);
  return { done, total: p.length, world: here.w, worldIndex: here.wi,
    worldDone: inWorld.filter((s) => s.done).length, worldTotal: inWorld.length };
}

export function nextStep(c, now) {
  const bt = ledger.beat(c, ALL_CARDS, { mathsMet: ledger.mathsMet(c), now });
  const answered = c.learn.beat && bt && c.learn.beat.cardId === bt.card.id && c.learn.beat.answered;
  /* a teaching beat whose card was already read (from the map, say) is not a
     next step — offering a finished lesson again reads as the app forgetting */
  const stale = bt && bt.shape === 'teach' && c.learn.done[bt.card.id];
  const p = path(c);
  const where = (card) => p.find((s) => s.card.id === card.id);
  const open = p.find((s) => !s.done && !s.locked);
  /* New material walks the road in order: a teaching beat further along the
     path waits while an earlier stop is still unwalked, so a new child starts
     at stop 1 ("Money is an agreement"), not at the first stop that happens to
     carry an objective (FIX A8). A due retrieval is never held back. */
  const ahead = bt && bt.shape === 'teach' && open && (() => {
    const bi = p.findIndex((s) => s.card.id === bt.card.id);
    return bi > p.indexOf(open);
  })();
  if (bt && !answered && !stale && !ahead) {
    const s = where(bt.card);
    return { kind: bt.shape === 'retrieve' ? 'revise' : 'learn', act: 'beat', arg: '',
      card: bt.card, objective: bt.objective, world: s ? s.w : WORLDS[0],
      title: bt.shape === 'retrieve' ? bt.objective.short : bt.card.title,
      sub: bt.shape === 'retrieve' ? 'Still know this? One question, a different one.' : bt.objective.short,
      button: bt.shape === 'retrieve' ? 'One question' : 'Continue' };
  }
  if (open) return { kind: 'learn', act: 'card', arg: open.card.id, card: open.card, world: open.w,
    title: open.card.title, sub: open.ch.title, button: 'Continue' };
  const shut = p.find((s) => !s.done);
  if (shut) return { kind: 'locked', act: 'testout', arg: shut.ch.id, card: shut.card, world: shut.w,
    title: shut.ch.title, sub: `Opens at level ${shut.ch.lv} — or pass a short test to open it now.`, button: 'Test out' };
  return { kind: 'revise', act: 'shelf', arg: 'revise', card: null, world: WORLDS[WORLDS.length - 1],
    title: 'Every stop walked', sub: 'Revising keeps it yours.', button: 'Revise' };
}
