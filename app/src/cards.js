/* cards.js — the one place a card id becomes a card. A lesson stop ("c3b"), a stop that
   lives outside the chapters, an authored retrieval item ("EARN-2#1") or a generated one
   ("EARN-2~41"). Continue opened retrieval items by id and the Atlas only knew chapter
   stops, so the day's "still know this?" question landed on the map instead (fixed here). */
import { ALL_CARDS } from './content.js';
import { NEW_CARD_LIST, OBJECTIVES, objective, assessCard } from './objectives.js';
import { hasGen, genStub } from './gen-ids.js';

/* generate.js loads when a card first needs it, never on the first screen */
let G = null, loading = null, onReady = null;
export function genReady() { return G ? Promise.resolve(G) : (loading = loading || import('./generate.js').then((m) => { G = m; if (onReady) onReady(); return m; })); }
export function whenGenReady(fn) { onReady = fn; }
const genCard = (o, seed, cx) => (G ? G.genCard(o, seed, cx) : (genReady(), genStub(o, seed)));
import { mathsCeiling } from './ledger.js';

export function cardById(id, c) {
  if (!id) return null;
  const chapter = ALL_CARDS.find((x) => x.id === id);
  if (chapter) return chapter;
  const extra = NEW_CARD_LIST.find((x) => x.id === id);
  if (extra) return extra;
  let m = /^(.+)#(\d+)$/.exec(id);
  if (m) { const o = objective(m[1]); return o && o.assess[+m[2]] ? assessCard(o, +m[2]) : null; }
  m = /^(.+)~(\d+)$/.exec(id);
  if (m) { const o = objective(m[1]); return o ? genCard(o, +m[2], { ceil: c ? mathsCeiling(c) : 6 }) : null; }
  return null;
}
/* a stop on the road, as opposed to a question asked again later */
export const isLesson = (card) => !!card && !card.assess;

/* A lesson stop's practice: the objective it teaches, if the town can write that idea in
   fresh numbers (generate.js). n picks a different question each time; ceil sizes it. */
export function practiceFor(card) {
  const own = card && OBJECTIVES.find((x) => x.teach === card.id && hasGen(x.id));
  if (own) return own;
  /* a stop that teaches no objective of its own practises its chapter's ideas, and says so */
  return card && card.ch ? OBJECTIVES.find((x) => hasGen(x.id) && (ALL_CARDS.find((k) => k.id === x.teach) || {}).ch === card.ch) || null : null;
}
export const practiceExact = (card) => !!(card && OBJECTIVES.find((x) => x.teach === card.id && hasGen(x.id)));
export function practiceCard(card, n, c) {
  const o = practiceFor(card); if (!o) return null;
  return genCard(o, 5000 + n * 37 + card.id.length, { ceil: c ? mathsCeiling(c) : 6 });
}

/* A missed question asked again later: the stop that teaches its idea, if that stop can be
   practised (audit v4, E7 — a weak idea gets an extra fresh item at once). */
export function practiceTeach(card) {
  const o = card && card.objective && OBJECTIVES.find((x) => x.id === card.objective);
  const k = o && ALL_CARDS.find((x) => x.id === o.teach);
  return k && practiceFor(k) ? k : null;
}
