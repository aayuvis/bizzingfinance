/* feed-corpus.mjs — the corpus My Feed is cut from, loaded the way the app loads it, and the
   one resolver that turns a card's `src` back into the object it came from.

   tools/build-feed.mjs cuts the cards with it; test/feed.mjs resolves every card's `src`
   with it and finds the card's words in what comes back. Nothing here is content: every
   string a card carries is read from one of these modules. */
import { readdirSync } from 'node:fs';

const SRC = new URL('../src/', import.meta.url);
const imp = (p) => import(new URL(p, SRC).href);

export async function loadCorpus() {
  const content = await imp('content.js');
  const { NEW_CARD_LIST, OBJECTIVES } = await imp('objectives.js');
  const { SOURCES } = await imp('sources.js');
  const { DEEDS, ASKS } = await imp('daily.js');
  const { CLASSES } = await imp('assetclasses.js');
  const { KINDS, WARDROBE } = await imp('companion.js');
  const arcade = await imp('arcade.js');
  const board = await imp('board.js');
  const { ACTS } = await imp('marketgame.js');
  const { COMPANIES } = await import(new URL('../content/companies.js', import.meta.url).href);
  const EVENTS = (await import(new URL('../content/events.js', import.meta.url).href)).ALL;
  const { ITEMS } = await imp('items.js');
  const { WIDGETS } = await imp('tryit.js');
  const LESSONS = {};
  for (const f of readdirSync(new URL('lessons/', SRC)).filter((f) => /^[a-z0-9-]+\.js$/.test(f) && !f.includes('.lite'))) {
    LESSONS[f.replace('.js', '')] = (await imp('lessons/' + f)).default;
  }
  const C = { ...content, NEW_CARD_LIST, OBJECTIVES, SOURCES, DEEDS, ASKS, CLASSES, KINDS, WARDROBE,
    GAMES: arcade.GAMES, HOW: arcade.HOW, PRACTISED: arcade.PRACTISED, NW: arcade.NW, SS: arcade.SS, SHOUTS: arcade.SHOUTS,
    CHANCE: board.CARDS, BOTS: board.BOTS, ERAS: ACTS, COMPANIES, EVENTS, ITEMS, WIDGETS, LESSONS };
  const card = (id) => content.ALL_CARDS.find((k) => k.id === id) || NEW_CARD_LIST.find((k) => k.id === id) || null;
  C.card = card;

  /* A money word in use: the first sentence of the lessons, in walking order, that says it —
     teaching, example, then the narration. Read, never written. */
  const sentences = [];
  content.CHAPTERS.forEach((ch, ci) => ch.cards.forEach((k) => {
    const L = LESSONS[k.id];
    [['teach', k.teach], ['eg', k.eg], ...(L ? L.beats.map((b, i) => ['beat' + i, b.line]) : [])].forEach(([part, t]) =>
      plain(t).split(/(?<=[.!?])\s+/).forEach((x) => sentences.push({ text: x, level: ci + 1, card: k.id, src: `card:${k.id}#${part}` })));
  }));
  C.sentences = sentences;
  C.wordUse = (term) => {
    const t = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), re = new RegExp(`\\b${t}(s|es)?\\b`, 'i');
    return sentences.find((x) => re.test(x.text) && x.text.split(/\s+/).length >= 6) || null;
  };

  /* src → the object, or null. The address says which list and which part. */
  C.resolve = (src) => {
    const m = /^([a-z]+):([^#]+)(?:#(.+))?$/.exec(src || ''); if (!m) return null;
    const [, kind, id, part] = m;
    const find = (arr, key = 'id') => arr.find((x) => String(x[key]) === id) || null;
    switch (kind) {
      case 'card': {
        const k = card(id); if (!k) return null;
        if (!part) return k;
        if (part === 'teach') return { title: k.title, text: k.teach };
        if (part === 'eg') return { title: k.title, text: k.eg };
        const w = /^why(\d+)$/.exec(part); if (w) { const d = +w[1] === 0 ? k.drill : (k.qs || [])[+w[1] - 1]; return d ? { title: k.title, why: d.why } : null; }
        const q = /^q(\d+)$/.exec(part); if (q) { const d = +q[1] === 0 ? k.drill : (k.qs || [])[+q[1] - 1]; return d ? { title: k.title, ...d } : null; }
        return null;
      }
      case 'lesson': { const L = LESSONS[id]; const b = /^beat(\d+)$/.exec(part || ''); return L && b ? (L.beats[+b[1]] ? { title: L.title, ...L.beats[+b[1]] } : null) : L || null; }
      case 'word': {
        const g = content.GLOSSARY.find((x) => x[0] === id); if (!g) return null;
        if (part === 'use') { const u = C.wordUse(id); return u ? { term: g[0], sentence: u.text, from: u.src } : null; }
        return g;
      }
      case 'goal': return OBJECTIVES.find((o) => o.id === id) || null;
      case 'chapter': return content.CHAPTERS.find((c) => c.id === id) || null;
      case 'figure': return SOURCES[id] ? { ...SOURCES[id], value: SOURCES[id].value() } : null;
      case 'letter': { const L = find(content.LETTERS); if (!L || !part) return L; const ch = /^choice(\d+)$/.exec(part); return ch ? { letter: L.title, from: L.from, ...L.choices[+ch[1]] } : null; }
      case 'cast': return content.LORE[id] ? { name: content.CAST_NAMES[id], ...content.LORE[id] } : null;
      case 'badge': return content.BADGES[id] || null;
      case 'game': return C.GAMES.find((g) => g.id === id) ? { ...C.GAMES.find((g) => g.id === id), how: C.HOW[id], practised: C.PRACTISED[id] } : null;
      case 'quest': return find(content.QUESTS);
      case 'deed': return find(DEEDS);
      case 'ask': return ASKS[+id] != null ? { text: ASKS[+id] } : null;
      case 'job': return find(content.JOBS);
      case 'home': return find(content.HOMES);
      case 'fix': return find(content.FIXES);
      case 'shop': return find(content.SHOP);
      case 'wardrobe': return find(WARDROBE);
      case 'companion': return KINDS[id] || null;
      case 'rank': return content.RANKS.find((r) => r.name === id) || null;
      case 'world': return find(content.WORLDS);
      case 'asset': return find(content.ASSETS);
      case 'stock': return find(content.STOCK);
      case 'class': return find(CLASSES);
      case 'needwant': return C.NW[+id] || null;
      case 'scamspot': return C.SS[+id] || null;
      case 'shout': return C.SHOUTS[+id] ? { who: C.SHOUTS[+id][0], name: content.CAST_NAMES[C.SHOUTS[+id][0]], text: C.SHOUTS[+id][1] } : null;
      case 'chance': return find(C.CHANCE);
      case 'bot': return C.BOTS[+id] || null;
      case 'era': return find(ACTS);
      case 'company': return find(COMPANIES);
      case 'event': return find(EVENTS);
      case 'item': return ITEMS[id] || null;
      case 'tryit': return WIDGETS[id] || null;
      default: return null;
    }
  };
  return C;
}

/* every string inside an object, tags stripped — what a card's words must be found in */
export function textOf(o) {
  const out = [];
  const walk = (v) => { if (v == null) return; if (typeof v === 'string') out.push(v); else if (typeof v === 'number') out.push(String(v)); else if (Array.isArray(v)) v.forEach(walk); else if (typeof v === 'object') Object.values(v).forEach(walk); };
  walk(o);
  return plain(out.join(' \n '));
}
export const plain = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
