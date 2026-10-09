#!/usr/bin/env node
/* build-feed.mjs — My Feed's cards, cut from Bizzington's own corpus (FAMILY-STANDARD §6a).

     node tools/build-feed.mjs      → src/feed/index.js (what the engine ranks; lazy, loaded only by #/feed)
                                      src/feed/g0.js … g8.js (the cards' words, one group per chapter, g0 no level)
                                      tools/feed-manifest.json (counts by kind and level, near-duplicates let go)

   Nothing here is written for the feed. Every card names the object it was cut from (`src`,
   resolved by tools/feed-corpus.mjs) and carries that object's own words; the only words
   added are the short frame titles in FRAMES ("Do one", "Ask at home"…), which the check
   knows by name. Change a lesson, a letter or a word and test/feed.mjs fails until this
   runs again.

   LEVELS are Finance's eight chapters (the owner's update 2: the main progress unit). A card
   belongs to a chapter only when the corpus says so: it was cut from that chapter's lesson,
   its narration, its questions or its objective's retrieval items; a money word is first
   used there; a game, quest or place opens with it (`needs`, WORLDS[].chapters); a
   figure is the dial that chapter's tool runs on. Everything else — the cast,
   the postbox, the town's jobs, the Market Game's register — has no `level` and is
   level-agnostic. Nothing is moved into a chapter to make up its number.

   THE MONEY RULES this holds (CONCEPT §6):
     · figures come ONLY from src/sources.js (kind 'figure'); nothing else is a figure card;
     · no projection is computed — no card does arithmetic on anybody's balance;
     · nothing assumes a family's money: the cards are the town's, and the "Ask at home"
       questions are the app's own, about a grown-up's past, never the family's means;
     · no real security is named as a thing to buy: the Market Game's companies are the
       app's fictional register, their cards send the child to READ, never to buy;
     · the arithmetic gate: every card carries `maths`, the rung of the number spine its
       words demand, and the app shows it only when ledger.mathsMet() says so. */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCorpus, plain } from './feed-corpus.mjs';
import { genCard, hasGen } from '../src/generate.js';
import { CURRENCIES, setCurrency, currency } from '../src/fmt.js';

const C = await loadCorpus();
const { CHAPTERS, ALL_CARDS, GLOSSARY, LETTERS, BADGES, QUESTS, JOBS, HOMES, FIXES, SHOP, RANKS, WORLDS, ASSETS, STOCK,
  LORE, CAST_NAMES, SOURCES, DEEDS, ASKS, CLASSES, KINDS, WARDROBE, GAMES, PRACTISED, NW, SS, SHOUTS, CHANCE, BOTS, ERAS,
  COMPANIES, EVENTS, ITEMS, WIDGETS, LESSONS, NEW_CARD_LIST, OBJECTIVES, shuffledDrill, drillCount, drillAt, leaks } = C;

export const FRAMES = ['Do one', 'Ask at home', 'Need or want?', 'Real, or a trap?', 'On the Exchange steps', 'A Chance card on Main Street',
  'Across the Main Street board', 'Your turn', 'Try it', 'A decade in the Market Game'];
const BOTH = ['sprout', 'builder'], BUILDER = ['builder'];
const CAST = CAST_NAMES;
const chLevel = (chId) => CHAPTERS.findIndex((c) => c.id === chId) + 1;

/* The objectives-file teaching cards are walked from the Atlas but belong to no chapter in
   content.js. Each is placed with the chapter that teaches the same skill. */
const NEW_CHAPTER = { 'x-ch4': 'c4', 'x-ch8': 'c6', 'x-ch10': 'c4', 'x-ch11': 'c3', 'x-ch12': 'c3' };
const chapterOf = (k) => k.ch || NEW_CHAPTER[k.id] || (CHAPTERS.find((c) => c.cards.some((x) => x.id === k.id)) || {}).id;

/* ── the arithmetic gate ───────────────────────────────────────────────────
   A card from a lesson demands what that lesson's objectives demand (needs_maths, the
   number spine). A lesson no objective teaches takes the highest rung its chapter's
   objectives ask for — the cautious reading. Other cards are read for what their words do:
   a percent is M10, compounding M11, a yearly sum of a monthly one M6, any other number M3. */
const rungN = (m) => parseInt(String(m || 'M1').slice(1), 10) || 1;
const maxM = (...ms) => 'M' + Math.max(1, ...ms.filter(Boolean).map(rungN));
const cardMaths = {};
OBJECTIVES.forEach((o) => { if (o.teach) cardMaths[o.teach] = maxM(cardMaths[o.teach], ...o.needs_maths); });
const chapterMaths = {};
CHAPTERS.forEach((ch) => { chapterMaths[ch.id] = maxM(...ch.cards.map((k) => cardMaths[k.id]).filter(Boolean)); });
const mathsOfCard = (k) => cardMaths[k.id] || chapterMaths[chapterOf(k)] || 'M1';
function mathsOfText(t) {
  const s = plain(t);
  if (/%|\bper ?cent/i.test(s)) return 'M10';
  if (/compound/i.test(s)) return 'M11';
  if (/\d/.test(s) && /(a|per|every) year|times twelve|×/i.test(s)) return 'M6';
  if (/\d/.test(s)) return 'M3';
  return 'M1';
}

/* ── cutting ───────────────────────────────────────────────────────────── */
const items = [], ids = new Set();
const idOf = (src) => 'f-' + src.replace(/[^a-z0-9]+/gi, '-').replace(/-+$/, '').toLowerCase();
/* NO NEAR-DUPLICATES (owner, update 3): two cards' bodies may not share 80% or more of their
   words, measured against the SHORTER of the two, so a sentence that merely restates another
   card's (a narrated line repeating its lesson's example) is let go rather than shown twice.
   Cards are cut in a declared order — the teaching, its example, its narration… — so the
   first and fullest telling is the one kept. What was let go is listed in the manifest. */
const wordsOf = (t) => new Set((plain(t).toLowerCase().match(/[a-z0-9']+/g) || []));
export const overlap = (a, b) => { let n = 0; for (const w of a) if (b.has(w)) n++; return n / Math.min(a.size, b.size); };
const bodies = [], dropped = [];
function add(c) {
  const bw = c.body ? wordsOf(c.body.join(' ')) : null;
  if (bw && bw.size >= 4) {
    const twin = bodies.find((b) => overlap(bw, b.w) >= 0.8);
    if (twin) { dropped.push(`${c.src} ≈ ${twin.src}`); return; }
    bodies.push({ w: bw, src: c.src });
  }
  c.route = routeOf(c) || c.route;
  c.source = sourceOf(c);
  c.id = idOf(c.src);
  if (ids.has(c.id)) throw new Error('duplicate id ' + c.id);
  ids.add(c.id);
  c.body = c.body ? c.body.map(plain).filter(Boolean).join('\n') : undefined;
  c.title = plain(c.title);
  c.bands = c.bands || BOTH;
  c.maths = maxM(c.maths, mathsOfText([c.title, c.body, c.play && c.play.q, ...(c.play ? c.play.opts : [])].join(' ')));
  if (c.level == null) delete c.level;
  if (!c.body) delete c.body;
  items.push(c);
}
const learnRoute = (id) => '#/atlas/' + id;

/* ── narration, in passages (audit V3) ─────────────────────────────────────
   One narrated line on its own is often half a thought — "The price is what the seller
   asks" is the first half of a sentence about value. So the narration is cut into
   PASSAGES: consecutive lines of one lesson, at least two of them and at least
   PASSAGE_WORDS words, so every line card says a whole idea in the narrator's own words.
   A line that restates a card already cut (its teaching, its example) is let go as before
   and breaks the run; a run's short tail joins the passage before it; a run too short to
   make a passage at all is a shard, and is let go (listed in the manifest). */
export const PASSAGE_WORDS = 22;
/* …or one line, when it is a long whole sentence that neither leans on the line before it
   ("But…", "So…", "That…") nor is answered by the line after it ("The price is…" / "The
   value is…": two lines that open the same way are one thought in two halves). */
export const LINE_WORDS = 16;
const LEANS = /^(but|and|so|or|then|now|not|same|here|hear|that|this|those|these|it|its|they|which|because|if|both|one|two|three|usually)\b/i;
const opener = (t) => plain(t).split(/\s+/).slice(0, 2).join(' ').toLowerCase();
const leansOnNext = (L, i) => !!L.beats[i + 1] && (LEANS.test(plain(L.beats[i + 1].line)) || opener(L.beats[i + 1].line) === opener(L.beats[i].line));
const nWords = (t) => plain(t).split(/\s+/).filter(Boolean).length;
const shards = [];
function passagesOf(cardId, L) {
  const runs = [[]];
  L.beats.forEach((b, i) => {
    const bw = wordsOf(b.line);
    const twin = bw.size >= 4 && bodies.find((x) => overlap(bw, x.w) >= 0.8);
    if (twin) { dropped.push(`lesson:${cardId}#beat${i} ≈ ${twin.src}`); runs.push([]); return; }
    runs[runs.length - 1].push(i);
  });
  const out = [];
  for (const run of runs) {
    const ps = []; let cur = [];
    for (const i of run) {
      cur.push(i);
      const w = nWords(cur.map((j) => L.beats[j].line).join(' '));
      const whole = cur.length >= 2 ? w >= PASSAGE_WORDS : w >= LINE_WORDS && !LEANS.test(plain(L.beats[i].line)) && !leansOnNext(L, i);
      if (whole) { ps.push(cur); cur = []; }
    }
    if (cur.length) { if (ps.length) ps[ps.length - 1].push(...cur); else if (nWords(cur.map((j) => L.beats[j].line).join(' ')) >= PASSAGE_WORDS) ps.push(cur); else cur.forEach((j) => shards.push(`lesson:${cardId}#beat${j}`)); }
    ps.forEach((p) => out.push([p[0], p[p.length - 1], p.map((j) => L.beats[j].line)]));
  }
  return out;
}

/* ── money with no currency (audit V1) ─────────────────────────────────────
   The feed is built once for every child, and currency is a setting, never an assumption.
   So a retrieval item cut here shows its amounts as bare numbers — the way the lessons
   themselves write them ("Rent 240 a month") — and nothing new carries a currency sign.
   Generated items are drawn with one unit to the coin (no rounding to tens) and the sign
   is then taken off; an authored item's sign is taken off the same way. test/feed.mjs
   draws them again the same way and finds every word. */
export const SIGNS = Object.values(CURRENCIES).map((c) => c.sign);
export const neutral = (t) => SIGNS.reduce((s, g) => s.split(g).join(''), String(t ?? ''));
export const UNIT_CURRENCY = 'AED';                          /* RATE 1: one unit is one coin */
export const GEN_CX = { ceil: 6 };                           /* small numbers: every child can read them */
export function genNeutral(o, seed) {
  const was = currency(); setCurrency(UNIT_CURRENCY);
  try { const g = genCard(o, seed, GEN_CX); return g && JSON.parse(neutral(JSON.stringify(g))); } finally { setCurrency(was); }
}

/* ── where a card leads, and where it comes from ───────────────────────────
   Owner, 3 Oct 2026: a card's button goes to THAT thing, never the generic
   tool — the medal, not the medals page; the letter, not the town; the game's
   own title card, not the arcade. routeOf() reads the object a card was cut
   from (its src) and names the exact place; the app's focusFor() / sheets open
   it. sourceOf() is the card's provenance line — which chapter and lesson,
   which letter-writer, which game — made only of names the corpus already has,
   never new words. */
const [kindOf, idOfSrc] = [(src) => src.split(':')[0], (src) => src.split(':').slice(1).join(':').split('#')[0]];
const GAME_OF = { needwant: 'nw', scamspot: 'ss', shout: 'st', chance: 'mn', bot: 'mn' };
function routeOf(c) {
  const k = kindOf(c.src), id = idOfSrc(c.src), e = encodeURIComponent;
  switch (k) {
    case 'card': case 'lesson': case 'item': case 'tryit': return learnRoute(id);
    case 'chapter': return '#/atlas/chapter/' + id;
    case 'game': return '#/play/' + id;
    case 'needwant': case 'scamspot': case 'shout': case 'chance': case 'bot': return '#/play/' + GAME_OF[k];
    case 'quest': return '#/town/today';
    case 'badge': return '#/medals/' + e(id);
    case 'asset': case 'class': return '#/money/portfolio/' + e(id);
    case 'stock': return '#/money/business/' + e(id);
    case 'letter': return '#/letter/' + e(id);
    case 'deed': return '#/town/deed';
    case 'ask': return '#/town/ask';
    case 'world': return '#/town/' + e(id);
    case 'fix': return '#/town/fix/' + e(id);
    case 'job': return '#/town/job/' + e(id);
    case 'home': return '#/money/place/' + e(id);
    case 'shop': return '#/store/' + e(id);
    case 'wardrobe': return '#/wardrobe/' + e(id);
    case 'companion': return '#/shelter/' + e(id);
    case 'rank': return '#/me/rank';
    case 'era': return '#/market40/era/' + e(id);
    case 'company': return '#/market40/company/' + e(id);
    case 'event': return '#/market40/event/' + e(id);
    default: return null;                                   /* words, figures, cast: already exact */
  }
}
const chapterLine = (n) => (n ? `Chapter ${n} · ${CHAPTERS[n - 1].title}` : null);
const gameName = (id) => (GAMES.find((g) => g.id === id) || {}).name;
function sourceOf(c) {
  const k = kindOf(c.src), id = idOfSrc(c.src);
  const who = ((c.topics || []).find((t) => t.startsWith('who:')) || '').slice(4);
  /* a question card never names its lesson: a lesson title can hint at the answer, which
     is why the builder swaps such a question's title for the chapter's */
  const lessonBits = () => { const card = C.card(id); return [chapterLine(c.level), card && !c.play && card.title !== c.title ? card.title : null, who && CAST[who] ? 'with ' + CAST[who] : null]; };
  const L = k === 'letter' ? LETTERS.find((x) => x.id === id) : null;
  const parts = {
    card: lessonBits, lesson: lessonBits, item: lessonBits, tryit: lessonBits,
    goal: () => [chapterLine(c.level), 'what the lesson is for'],
    /* retrieval: never the lesson's title (it can hint), only the chapter */
    assess: () => [chapterLine(c.level), c.play ? 'a question to come back to' : 'why, said again'],
    gen: () => [chapterLine(c.level), c.play ? 'the same idea in a new story' : 'why, said again'],
    chapter: () => [`Chapter ${c.level} of ${CHAPTERS.length}`, `${(CHAPTERS[c.level - 1] || { cards: [] }).cards.length} lessons on the Money Atlas`],
    word: () => ['Money Words', c.level ? 'first used in ' + chapterLine(c.level) : null],
    figure: () => ['How we know'],
    game: () => { const g = GAMES.find((x) => x.id === id) || {}; return ['Play', g.keys ? 'keys ' + g.keys : null, g.needs ? 'opens with ' + chapterLine(chLevel(g.needs)) : null]; },
    quest: () => ["Today's three", 'on the town page'],
    badge: () => ['Medal', c.level ? 'for finishing ' + chapterLine(c.level) : 'for a decision'],
    asset: () => ['The Exchange', chapterLine(chLevel('c7'))], class: () => ['The Exchange', chapterLine(chLevel('c7'))],
    stock: () => ['Bizz & Co', chapterLine(chLevel('c8'))],
    cast: () => [CAST[who] ? CAST[who] + ' of Bizzington' : 'Bizzington'],
    /* the letter itself never names its sender: a scam's card must read exactly like Pip's */
    letter: () => (/#choice/.test(c.src) ? [L && L.from !== 'scam' && CAST[L.from] ? 'A letter from ' + CAST[L.from] : 'The postbox', 'what one answer meant'] : ['The postbox', 'a letter']),
    deed: () => ['Do one', 'one a day, out in the real world'], ask: () => ['Ask at home', "this week's question"],
    world: () => { const i = WORLDS.findIndex((w) => w.id === id); return [`Place ${i + 1} of ${WORLDS.length} in Bizzington`]; },
    fix: () => { const f = FIXES.find((x) => x.id === id); const w = f && WORLDS.find((x) => x.id === f.world); return ['Put it right', w ? w.name : null]; },
    job: () => { const w = WORLDS.find((x) => x.jobs.includes(id)); return ['A job', w ? w.name : null]; },
    home: () => { const i = HOMES.findIndex((h) => h.id === id); return ['Your place', `rung ${i + 1} of ${HOMES.length}`]; },
    shop: () => ["Mags' General Store"], wardrobe: () => ["The companion's wardrobe"], companion: () => ['The shelter behind the Jar Shed'],
    rank: () => { const r = RANKS.find((x) => x.name === id); return ['Rank', r ? 'from level ' + r.at : null]; },
    needwant: () => ['From ' + gameName('nw')], scamspot: () => ['From ' + gameName('ss')], shout: () => ['From ' + gameName('st')],
    chance: () => ['From ' + gameName('mn')], bot: () => ['From ' + gameName('mn')],
    era: () => ['The Market Game', 'a decade to play'], company: () => ['The Market Game', 'the register'], event: () => ['The Market Game', 'what happened'],
  }[k];
  return parts ? parts().filter(Boolean).join(' · ') : undefined;
}

/* 1 · the lessons: one idea each — the teaching, the example, every narrated line */
const allCards = [...ALL_CARDS, ...NEW_CARD_LIST];
for (const k of allCards) {
  const ch = chapterOf(k), level = chLevel(ch), m = mathsOfCard(k);
  const topics = ['card:' + k.id, 'ch:' + ch, 'who:' + k.who];
  add({ kind: 'lesson', src: `card:${k.id}#teach`, level, topics, title: k.title, body: [k.teach], route: learnRoute(k.id), cta: 'Open the lesson', maths: m, card: k.id });
  add({ kind: 'example', src: `card:${k.id}#eg`, level, topics, title: k.title, body: [k.eg], route: learnRoute(k.id), cta: 'Open the lesson', maths: m });
  const L = LESSONS[k.id];
  if (L) passagesOf(k.id, L).forEach(([a, b, lines]) => add({ kind: 'line', src: a === b ? `lesson:${k.id}#beat${a}` : `lesson:${k.id}#beats${a}-${b}`, level, topics, title: L.title, body: lines, route: learnRoute(k.id), cta: 'Watch the lesson', maths: m }));
  /* 2 · its questions. The right answer is written first (the drop-in's order() spreads it);
     the wrong ones follow in shuffledDrill's order, so no written order is the authored one. */
  for (let qi = 0; qi < drillCount(k); qi++) {
    const d = drillAt(k, qi), sh = shuffledDrill(k, qi);
    const wrong = sh.order.filter((i) => i !== d.a).map((i) => d.opts[i]);
    /* a lesson title that would hint at the answer gives way to the chapter's own title */
    const title = !leaks(k.title, d) ? k.title : CHAPTERS[level - 1].title;
    if (leaks(title, d)) throw new Error(`${k.id}#${qi}: the card's title leaks its answer`);
    add({ kind: 'question', src: `card:${k.id}#q${qi}`, level, topics, key: `${k.id}#${qi}`, title,
      play: { q: plain(d.q), opts: [plain(d.opts[d.a]), ...wrong.map(plain)], after: plain(d.why) }, route: learnRoute(k.id), cta: 'Open the lesson', maths: m });
  }
  /* the why: each question's reason, as an idea of its own */
  for (let qi = 0; qi < drillCount(k); qi++) {
    add({ kind: 'why', src: `card:${k.id}#why${qi}`, level, topics, card: k.id, title: k.title, body: [drillAt(k, qi).why], route: learnRoute(k.id), cta: 'Open the lesson', maths: m });
  }
  /* 3 · its "Your turn" and "Try it" */
  if (ITEMS[k.id]) add({ kind: 'yourturn', src: `item:${k.id}`, level, topics, title: 'Your turn', body: [ITEMS[k.id].title, ITEMS[k.id].hint || ''], route: learnRoute(k.id), cta: 'Have a go', maths: m });
  if (WIDGETS[k.id]) add({ kind: 'tryit', src: `tryit:${k.id}`, level, topics, title: 'Try it', body: [WIDGETS[k.id].title], route: learnRoute(k.id), cta: 'Change the numbers', maths: m });
}

/* the chapters themselves, and what each lesson is for (the objective it teaches, as the
   curriculum writes it — a behaviour you could watch) */
CHAPTERS.forEach((ch, i) => add({ kind: 'chapter', src: `chapter:${ch.id}`, level: i + 1, topics: ['ch:' + ch.id], title: ch.title, body: [ch.blurb], route: '#/learn', cta: 'The Money Atlas', maths: chapterMaths[ch.id] }));
for (const o of OBJECTIVES) {
  const k = o.teach && C.card(o.teach); if (!k) continue;
  const ch = chapterOf(k);
  add({ kind: 'goal', src: `goal:${o.id}`, level: chLevel(ch), topics: ['card:' + k.id, 'ch:' + ch], title: o.short, body: [o.objective], route: learnRoute(k.id), cta: 'Open the lesson', maths: maxM(...o.needs_maths) });
}

/* 4 · money words: a word belongs to the first chapter that uses it */
const chapterText = CHAPTERS.map((ch) => plain(ch.cards.flatMap((k) => [k.teach, k.eg, ...[k.drill, ...(k.qs || [])].flatMap((d) => [d.q, ...d.opts, d.why]),
  ...((LESSONS[k.id] || { beats: [] }).beats.map((b) => b.line))]).join(' ')).toLowerCase());
const wordChapter = (term) => {
  const t = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), re = new RegExp(`\\b${t}(s|es)?\\b`);
  const i = chapterText.findIndex((x) => re.test(x));
  return i < 0 ? null : i + 1;
};
for (const [term, mean, more] of GLOSSARY) {
  const level = wordChapter(term);
  const topics = ['word', 'word:' + term, ...(level ? ['ch:' + CHAPTERS[level - 1].id] : [])], route = '#/words/' + encodeURIComponent(term);
  add({ kind: 'word', src: `word:${term}`, level, topics, title: term, body: [mean], route, cta: 'Money Words' });
  add({ kind: 'wordmore', src: `word:${term}#more`, level, topics, title: term, body: [more], route, cta: 'Money Words' });
}

/* 5 · figures — only the register in sources.js. Each sits with the chapter whose tool runs on it. */
const FIGURE_CHAPTER = { grow: 'c7', bank: 'c5', loan: 'c6', inflation: 'c7', market: 'c7', wages: 'c2', homes: 'c3', stock: 'c8', stall: 'c3',
  /* Save or Borrow?'s dials sit with the Bank's chapter, which opens the game */
  sbprices: 'c5', sbloans: 'c5', sbwages: 'c5', sbsurprise: 'c5', storm: 'c7', cup: 'c7', mainstreet: 'c1' };
for (const [key, s] of Object.entries(SOURCES)) {
  add({ kind: 'figure', src: `figure:${key}`, level: chLevel(FIGURE_CHAPTER[key]), topics: ['figure', 'ch:' + FIGURE_CHAPTER[key]],
    badge: { id: s.kind, label: s.kind === 'own' ? 'A dial of this town' : 'Cited' }, title: s.what, body: [s.value(), s.says],
    route: '#/sources/' + key, cta: 'How we know' });
}

/* 6 · games and quests: those that open with a chapter belong to it */
for (const g of GAMES) {
  add({ kind: 'game', src: `game:${g.id}`, level: g.needs ? chLevel(g.needs) : null, topics: ['game', 'game:' + g.id, ...(g.needs ? ['ch:' + g.needs] : [])],
    gate: g.needs ? { chapter: g.needs } : undefined, title: g.name, body: [g.blurb, PRACTISED[g.id] || ''], route: '#/play', cta: 'Go and play' });
}
for (const q of QUESTS) {
  add({ kind: 'quest', src: `quest:${q.id}`, level: q.needs ? chLevel(q.needs) : null, topics: ['quest', ...(q.needs ? ['ch:' + q.needs] : [])],
    gate: q.needs ? { chapter: q.needs } : undefined, title: q.short || q.t, body: [q.sub], route: '#/town', cta: "Today's three" });
}

/* 7 · medals, as "how to earn this": a chapter's medal is that chapter's */
for (const [id, b] of Object.entries(BADGES)) {
  const ch = /^chapter-(c\d)$/.exec(id);
  add({ kind: 'medal', src: `badge:${id}`, level: ch ? chLevel(ch[1]) : null, topics: ['medal', ...(ch ? ['ch:' + ch[1]] : [])], badgeId: id,
    title: b.name, body: [b.desc], route: '#/medals', cta: 'How to earn it' });
}

/* 8 · the Exchange's own things open with chapter seven, the shop's stock with eight */
for (const a of ASSETS) add({ kind: 'exchange', src: `asset:${a.id}`, level: chLevel('c7'), topics: ['ch:c7', 'exchange'], gate: { chapter: 'c7' }, title: a.name, body: [a.desc], route: '#/money/portfolio', cta: 'The Exchange' });
for (const c of CLASSES) add({ kind: 'exchange', src: `class:${c.id}`, level: chLevel('c7'), topics: ['ch:c7', 'exchange'], gate: { chapter: 'c7' }, bands: c.age >= 11 ? BUILDER : BOTH,
  maths: c.needs, title: c.name, body: [c.one, c.why], route: '#/money/portfolio', cta: 'The Exchange' });
for (const s of STOCK) add({ kind: 'shopstock', src: `stock:${s.id}`, level: chLevel('c8'), topics: ['ch:c8', 'business'], gate: { chapter: 'c8' }, title: s.name, body: [s.desc], route: '#/money/business', cta: 'Bizz & Co' });

/* ── level-agnostic: the town, the cast, the postbox, the register ─────── */
for (const [who, l] of Object.entries(LORE)) {
  add({ kind: 'cast', src: `cast:${who}#line`, topics: ['who:' + who, 'cast'], title: CAST[who], body: [l.line, l.why], route: '#/cast/' + who, cta: 'Meet ' + CAST[who] });
  add({ kind: 'castline', src: `cast:${who}#quote`, topics: ['who:' + who, 'cast'], title: CAST[who], body: [l.quote], route: '#/cast/' + who, cta: 'Meet ' + CAST[who] });
}
/* the postbox: letters from the cast (never the scams, which must look like the rest, and never
   a consequence that only arrives because of an earlier choice). What each choice meant comes
   back only for a letter the child has already answered. */
/* A scam letter, or a consequence that only arrives because of an earlier choice, comes back
   only once it has reached her postbox — the scam then shown for what it was, with its note. */
/* EVERY LETTER LOOKS THE SAME (audit): one kind, one frame, one source line ("The postbox"),
   its title and the opening of its body, and a button to that letter. A scam letter is
   cut exactly like a letter from Pip — no kind, gate, topic, picture or line on the card
   says which it is. What each choice meant (where a scam is named for what it was) comes
   back only once the letter has reached her postbox and been answered. A consequence that
   only arrives because of an earlier choice waits until it has arrived. */
export const LETTER_CHARS = 160;
const opening = (t) => {                              /* whole sentences, about LETTER_CHARS of them */
  const s = plain(t).split(/(?<=[.!?…])\s+/); let out = '';
  for (const x of s) { if (out && (out + ' ' + x).length > LETTER_CHARS) break; out = out ? out + ' ' + x : x; }
  return out;
};
for (const L of LETTERS) {
  const gate = L.fuseOnly ? { letter: L.id } : L.needsCompanion ? { companion: true } : undefined;
  add({ kind: 'letter', src: `letter:${L.id}`, topics: ['letter', 'letter:' + L.id], gate, title: L.title, body: [opening(L.body)], route: '#/town', cta: 'Read the letter' });
}
for (const L of LETTERS) {
  L.choices.forEach((ch, i) => add({ kind: L.from === 'scam' ? 'scamnote' : 'castline', src: `letter:${L.id}#choice${i}`, topics: [...(L.from !== 'scam' ? ['who:' + L.from] : []), 'letter:' + L.id], gate: { letter: L.id },
    title: L.title, body: [ch.label, ch.note], route: '#/town', cta: 'The postbox' }));
}
DEEDS.forEach((d) => add({ kind: 'deed', src: `deed:${d.id}`, topics: ['deed'], title: 'Do one', body: [d.text], route: '#/home', cta: 'Home' }));
ASKS.forEach((a, i) => add({ kind: 'ask', src: `ask:${i}`, topics: ['ask'], title: 'Ask at home', body: [a], route: '#/home', cta: 'Home' }));
const worldIx = (id) => WORLDS.findIndex((w) => w.id === id);
/* A place, and what is broken in it, open with the world's first chapter — the same rule a
   game or a quest follows ("it belongs to the chapter it opens with"): the corpus says so in
   WORLDS[].chapters. Jobs stay level-agnostic, because one job is worked in several worlds. */
const worldLevel = (i) => chLevel(WORLDS[i].chapters[0]);
WORLDS.forEach((w, i) => add({ kind: 'place', src: `world:${w.id}`, level: worldLevel(i), topics: ['world:' + w.id, 'ch:' + w.chapters[0]], gate: { world: i }, title: w.name, body: [w.blurb, w.opens], route: '#/town', cta: 'The town' }));
FIXES.forEach((f) => {
  const wi = worldIx(f.world), topics = ['world:' + f.world, 'fix', 'ch:' + WORLDS[wi].chapters[0]];
  add({ kind: 'fix', src: `fix:${f.id}`, level: worldLevel(wi), topics, gate: { world: wi }, title: f.name, body: [f.broken], route: '#/town', cta: 'Put it right' });
  add({ kind: 'fixed', src: `fix:${f.id}#fixed`, level: worldLevel(wi), topics, gate: { world: wi }, title: f.name, body: [f.fixed, f.gives], route: '#/town', cta: 'Put it right' });
});
JOBS.forEach((j) => { const wi = WORLDS.findIndex((w) => w.jobs.includes(j.id)); add({ kind: 'job', src: `job:${j.id}`, topics: ['job', ...(wi >= 0 ? ['world:' + WORLDS[wi].id] : [])], gate: wi > 0 ? { world: wi } : undefined, title: j.name, body: [j.who], route: '#/town', cta: 'Jobs going' }); });
HOMES.forEach((h) => add({ kind: 'home', src: `home:${h.id}`, topics: ['home'], title: h.name, body: [h.blurb], route: '#/money/place', cta: 'Your place' }));
SHOP.forEach((s) => add({ kind: 'store', src: `shop:${s.id}`, topics: ['store'], title: s.name, body: [s.desc, s.gives], route: '#/store', cta: "Mags' General Store" }));
WARDROBE.forEach((w) => add({ kind: 'companion', src: `wardrobe:${w.id}`, topics: ['companion'], title: w.name, body: [w.line], route: '#/town', cta: 'The companion' }));
Object.entries(KINDS).forEach(([id, k]) => add({ kind: 'companion', src: `companion:${id}`, topics: ['companion'], title: k.name, body: [k.line], route: '#/town', cta: 'The shelter' }));
RANKS.forEach((r) => add({ kind: 'rank', src: `rank:${r.name}`, topics: ['rank'], title: r.name, body: [r.of], route: '#/me', cta: 'My page' }));
NW.forEach((x, i) => { if (x.note) add({ kind: 'needwant', src: `needwant:${i}`, topics: ['game:nw'], title: 'Need or want?', body: [x.t, x.note], route: '#/play', cta: 'Needs vs Wants' }); });
SS.forEach((x, i) => add({ kind: 'scamspot', src: `scamspot:${i}`, topics: ['game:ss'], title: 'Real, or a trap?', body: [x.t, x.note], route: '#/play', cta: 'Scam Spotter' }));
SHOUTS.forEach(([who, t], i) => add({ kind: 'castline', src: `shout:${i}`, topics: ['who:' + who, 'game:st'], title: 'On the Exchange steps', body: [t], route: '#/play', cta: 'Market Storm' }));
CHANCE.forEach((x) => add({ kind: 'chance', src: `chance:${x.id}`, topics: ['game:mn'], title: x.t, body: [x.body], route: '#/play', cta: 'Main Street' }));
BOTS.forEach((b, i) => add({ kind: 'castline', src: `bot:${i}`, topics: ['who:' + b.who, 'game:mn'], title: 'Across the Main Street board', body: [b.line], route: '#/play', cta: 'Main Street' }));
/* the Market Game: forty companies that do not exist, read about — never a buy button */
ERAS.forEach((e) => add({ kind: 'market', src: `era:${e.id}`, topics: ['market40'], gate: { market: true }, bands: BUILDER, title: e.name, body: [e.blurb], route: '#/market40', cta: 'The Market Game', badge: { id: 'fiction', label: 'Fictional' } }));
COMPANIES.forEach((co) => {
  const base = { topics: ['market40', 'sector:' + co.sector], gate: { market: true }, bands: BUILDER, title: co.name, route: '#/market40', cta: 'Read the register', badge: { id: 'fiction', label: 'Fictional' } };
  add({ ...base, kind: 'company', src: `company:${co.id}`, body: [co.what, co.how, co.who] });
  add({ ...base, kind: 'risk', src: `company:${co.id}#risk`, body: [co.model, co.risk] });
});
EVENTS.forEach((ev) => add({ kind: 'event', src: `event:${ev.id}`, topics: ['market40'], gate: { market: true }, bands: BUILDER, title: ev.head, body: [ev.body], route: '#/market40', cta: 'The Market Game', badge: { id: 'fiction', label: 'Fictional' } }));

/* 9 · retrieval (audit V1), cut last so it never displaces a card the app already had: each objective's own authored retrieval items, then its
   generated ones (src/generate.js), each placed with the chapter that teaches it
   (OBJECTIVES[].teach). Same rules as a lesson's questions: the right answer written first
   and the wrong ones in a permuted order, no title that leaks it, the reason shown only
   after the lesson is read. Only four-option items: a typed amount has nothing to tap.
   NO NEAR-DUPLICATE QUESTIONS: a question 80% the same words as one already cut (a
   generated story with only the name swapped) is let go, so every one is a new situation.
   A question too short to stand on its own ("Why keep the two apart?" leans on the one
   before it) is let go too. */
export const GEN_SEEDS = 120, GEN_MAX = 16, STANDALONE_WORDS = 6;
const qWords = [];
for (const k of allCards) for (let qi = 0; qi < drillCount(k); qi++) qWords.push(wordsOf(drillAt(k, qi).q));
const permuted = (seed, d) => {                     /* the wrong options, in an order taken from the seed */
  let h = 2166136261; for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const w = d.opts.map((_, i) => i).filter((i) => i !== d.a);
  for (let j = w.length - 1; j > 0; j--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const r = h % (j + 1); [w[j], w[r]] = [w[r], w[j]]; }
  return w.map((i) => d.opts[i]);
};
const retrievalLog = [];
function addRetrieval(o, k, src, cardId, d) {
  if (d.kind === 'num' || !Array.isArray(d.opts)) return false;
  const qw = wordsOf(d.q);
  if (nWords(d.q) < STANDALONE_WORDS) { retrievalLog.push(`${src}: too short to stand alone`); return false; }
  if (qWords.some((w) => overlap(qw, w) >= 0.8)) { retrievalLog.push(`${src}: the same question as one already cut`); return false; }
  const ch = chapterOf(k), level = chLevel(ch);
  const title = !leaks(o.short, d) ? o.short : CHAPTERS[level - 1].title;
  if (leaks(title, d)) return false;
  qWords.push(qw);
  const topics = ['card:' + k.id, 'ch:' + ch, 'goal:' + o.id, 'who:' + k.who];
  const m = maxM(mathsOfCard(k), ...o.needs_maths);
  add({ kind: 'question', src, level, topics, key: cardId + '#0', title, route: learnRoute(k.id), cta: 'Open the lesson', maths: m,
    play: { q: plain(d.q), opts: [plain(d.opts[d.a]), ...permuted(src, d).map(plain)], after: plain(d.why) } });
  add({ kind: 'why', src: src + (src.includes('#') ? 'why' : '#why'), level, topics, card: k.id, title: o.short, body: [d.why], route: learnRoute(k.id), cta: 'Open the lesson', maths: m });
  return true;
}
for (const o of OBJECTIVES) {
  const k = o.teach && C.card(o.teach); if (!k) continue;
  (o.assess || []).forEach((d0, i) => addRetrieval(o, k, `assess:${o.id}#${i}`, `${o.id}#${i}`, JSON.parse(neutral(JSON.stringify(d0)))));
  if (!hasGen(o.id)) continue;
  let n = 0;
  for (let seed = 1; seed <= GEN_SEEDS && n < GEN_MAX; seed++) {
    const g = genNeutral(o, seed);
    if (g && addRetrieval(o, k, `gen:${g.id}`, g.id, g.drill)) n++;
  }
}

/* ── the honest shortfall ─────────────────────────────────────────────────
   The owner asks for 100 cards a chapter. The corpus does not hold that many yet, and the
   feed does not invent them or borrow them from another chapter. Each short chapter is
   declared here with the count it holds today (test/feed.mjs fails if it falls below it, and
   fails if it reaches 100 while still declared) and with what would honestly close the gap.
   Chapters one to seven pass it on what the app already held: each objective's authored
   retrieval items and its generated four-option ones, placed with the chapter that teaches
   it, and the places (and what is broken in them) that open with a chapter. Chapter eight cannot yet: the
   one objective it teaches (EARN-7) generates only typed amounts, which have nothing to
   tap, and its last four lessons have no narration. */
export const SHORT = {
};

/* ── write ───────────────────────────────────────────────────────────── */
const byKind = {}, byLevel = {};
items.forEach((x) => { byKind[x.kind] = (byKind[x.kind] || 0) + 1; const k = x.level == null ? 'any' : 'chapter ' + x.level; byLevel[k] = (byLevel[k] || 0) + 1; });
export const manifest = { total: items.length, byKind, byLevel, levels: CHAPTERS.map((c, i) => ({ level: i + 1, chapter: c.id, title: c.title, n: byLevel['chapter ' + (i + 1)] || 0, short: SHORT[i + 1] ? SHORT[i + 1].close : undefined })), nearDuplicatesLetGo: dropped, shardsLetGo: shards, questionsLetGo: { tooShortToStandAlone: retrievalLog.filter((x) => /too short/.test(x)).map((x) => x.split(':').slice(0, -1).join(':')), sameAsOneAlreadyCut: retrievalLog.filter((x) => /same question/.test(x)).length } };
export { items };
/* lazy groups, by level: group n is chapter n's cards, group 0 the level-agnostic ones */
export const groupOf = (x) => x.level ?? 0;
export const GROUPS = [...new Set(items.map(groupOf))].sort((a, b) => a - b);
/* grp: the one source object a card was cut from — its lesson for anything cut from a lesson
   or its objective's questions, else the object its src names. feed.js holds a session to
   two cards of any one grp (audit V4). */
/* because: a card's reason when nothing about the child names one — true of every child the
   card can reach (its gate already holds what it claims: a Market Game card is only shown
   from level 16). feed.js says the reasons that depend on the child (audit V5). */
const BECAUSE = {
  company: 'The Market Game opened for you at level 16', risk: 'The Market Game opened for you at level 16',
  event: 'The Market Game opened for you at level 16', market: 'The Market Game opened for you at level 16',
  medal: 'A medal you have not earned yet', deed: 'Something to do out in the real world', ask: 'A question to take home this week',
  rank: 'A rank on your way up', quest: 'One of today’s three, on the town page',
};
function becauseOf(x) {
  const who = ((x.topics || []).find((t) => t.startsWith('who:')) || '').slice(4);
  if (['cast', 'castline'].includes(x.kind) && CAST[who] && !(x.topics || []).some((t) => t.startsWith('letter:'))) return `${CAST[who]}, who you meet on the Money Atlas`;
  if (['word', 'wordmore'].includes(x.kind) && x.level) return `A money word first used in ${chapterLine(x.level)}`;
  if (x.kind === 'figure' && x.level) return `A number ${chapterLine(x.level)} runs on, and how we know it`;
  if (['exchange', 'shopstock'].includes(x.kind) && x.level) return `Opened by ${chapterLine(x.level)}`;
  return BECAUSE[x.kind];
}
items.forEach((x) => { const b = becauseOf(x); if (b) x.because = b; });
items.forEach((x) => { x.grp = (x.topics || []).find((t) => t.startsWith('card:')) || x.src.split('#')[0]; if (['store', 'home', 'companion'].includes(x.kind)) x.ref = idOfSrc(x.src); });
/* the kinds whose picture is read off the route (feed.js artFor), so a session can cap a
   picture from the index alone */
const ART_ROUTE = ['game', 'needwant', 'scamspot', 'chance', 'home', 'companion'];
const INDEX_KEYS = ['id', 'kind', 'level', 'bands', 'topics', 'maths', 'gate', 'key', 'card', 'badgeId', 'grp', 'ref', 'because'];
export const index = items.map((x) => { const o = {}; INDEX_KEYS.forEach((k) => { if (x[k] != null) o[k] = x[k]; }); if (x.play) o.play = 1; if (ART_ROUTE.includes(x.kind) && x.route) o.route = x.route; o.g = groupOf(x); return o; });
const MAIN = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (MAIN) {
rmSync(new URL('../src/feed/', import.meta.url), { recursive: true, force: true });
mkdirSync(new URL('../src/feed/', import.meta.url), { recursive: true });
const HEAD = '/* generated by tools/build-feed.mjs from the corpus — never hand-edit; rerun it when a lesson, letter or word changes. */\n';
writeFileSync(new URL('../src/feed/index.js', import.meta.url), HEAD + '/* the index the engine ranks; a card\'s words live in its group, loaded only when a session shows one */\n' +
  'export const INDEX = ' + JSON.stringify(index) + ';\n' +
  'export const LOAD = {\n' + GROUPS.map((g) => `  ${g}: () => import('./g${g}.js'),`).join('\n') + '\n};\n');
for (const g of GROUPS) writeFileSync(new URL(`../src/feed/g${g}.js`, import.meta.url), HEAD + 'export default ' + JSON.stringify(Object.fromEntries(items.filter((x) => groupOf(x) === g).map((x) => [x.id, x]))) + ';\n');
writeFileSync(new URL('./feed-manifest.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
console.log(`My Feed: ${items.length} cards`);
console.log('  by kind  ', Object.entries(byKind).map(([k, n]) => `${k} ${n}`).join(' · '));
console.log('  by level ', manifest.levels.map((l) => `${l.level} ${l.n}`).join(' · '), `· any ${byLevel.any || 0}`);
}
