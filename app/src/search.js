/* search.js — one search over the whole town (FAMILY-STANDARD §3, C4).

   Every lesson (the Atlas stops and the extra teaching cards), every Money Word, every
   game, every place on the street, every world of the journey and every story letter in
   the postbox. DOM-free, so test/search.mjs can hold it to finding what is there.

   Matching is plain: whole words and word-starts in the title count most, then the
   words of the body. No fuzzy guessing that turns "loan" into "lion". */
import { ALL_CARDS, CHAPTERS, GLOSSARY, WORLDS, LETTERS } from './content.js';
import { NEW_CARD_LIST } from './objectives.js';
import { PLACES } from './town.js';
import { GAMES } from './arcade.js';

const plain = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
let INDEX = null;
export function index() {
  if (INDEX) return INDEX;
  const out = [];
  ALL_CARDS.forEach((c, i) => {
    const ch = CHAPTERS.find((x) => x.id === c.ch);
    out.push({ kind: 'Lesson', title: c.title, sub: `Stop ${i + 1} · ${ch ? ch.title : ''}`, body: plain(c.teach) + ' ' + plain(c.eg), act: 'card', arg: c.id, icon: 'lesson' });
  });
  NEW_CARD_LIST.forEach((c) => out.push({ kind: 'Lesson', title: c.title, sub: 'A lesson from the Atlas', body: plain(c.teach) + ' ' + plain(c.eg), act: 'card', arg: c.id, icon: 'lesson' }));
  GLOSSARY.forEach(([t, m, e]) => out.push({ kind: 'Money Word', title: t, sub: m, body: e, act: 'word', arg: t, icon: 'page' }));
  GAMES.forEach((g) => out.push({ kind: 'Game', title: g.name, sub: g.blurb, body: g.blurb, act: 'game', arg: g.id, icon: 'arcade' }));
  out.push({ kind: 'Game', title: 'The Market Game', sub: 'Forty companies, forty years', body: 'companies annual reports invest shares market', act: 'nav', arg: 'market40', icon: 'chartUp' });
  PLACES.forEach((p) => out.push({ kind: 'Place', title: p.name, sub: p.blurb, body: p.blurb, act: 'town', arg: p.key, icon: 'town' }));
  WORLDS.forEach((w, i) => out.push({ kind: 'Place', title: w.name, sub: `World ${i + 1} of the journey`, body: plain(w.blurb || w.line || ''), act: 'nav', arg: 'town', icon: 'town' }));
  LETTERS.forEach((l) => out.push({ kind: 'Story', title: l.title, sub: 'A letter in the postbox', body: plain(l.body), act: 'nav', arg: 'town', icon: 'envelope' }));
  return (INDEX = out);
}

export function search(q, limit = 12) {
  const terms = String(q || '').toLowerCase().split(/\s+/).filter((t) => t.length >= 2);
  if (!terms.length) return [];
  const score = (r) => {
    const t = r.title.toLowerCase(), b = (r.sub + ' ' + r.body).toLowerCase();
    let s = 0;
    for (const w of terms) {
      const re = new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
      if (t === w) s += 12; else if (re.test(t)) s += 6; else if (re.test(b)) s += 2; else return 0;
    }
    return s + (r.kind === 'Lesson' ? 1 : 0);
  };
  return index().map((r) => ({ r, s: score(r) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.r);
}
