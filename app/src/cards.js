/* cards.js — the one place a card id becomes a card. A lesson stop ("c3b"), a stop that
   lives outside the chapters, an authored retrieval item ("EARN-2#1") or a generated one
   ("EARN-2~41"). Continue opened retrieval items by id and the Atlas only knew chapter
   stops, so the day's "still know this?" question landed on the map instead (fixed here). */
import { ALL_CARDS } from './content.js';
import { NEW_CARD_LIST, objective, assessCard } from './objectives.js';
import { genCard } from './generate.js';
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
