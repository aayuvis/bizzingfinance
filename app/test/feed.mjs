/* feed.mjs — My Feed (FAMILY-STANDARD §6a): built only from what Bizzington holds, ranked by
   what the child is doing and the chapter she is on, and it ends. Each check was watched
   failing by breaking what it holds (see the commit that added it).

   THE CONTENT   count · resolves · distinct · held · figures · money · bands · maths · routes ·
                 levels (≥ 100 a chapter or a declared, honest shortfall; ≥ 110 where not
                 declared; ≥ 300 with no level) · retrieval (its chapter, four options, no
                 currency) · lines (passages, never a shard) · letters (a scam looks like Pip's) · fresh
   THE RANKING   bands · ceiling (nothing above the next chapter) · arithmetic gate · context ·
                 due · mix · ends · climbing changes the "now" cards · two of a lesson at most ·
                 review past a chapter · why names the thing · pictures are the card's own
   THE PAY       a right answer pays one family coin, once; never town money, XP or mastery;
                 a wrong one holds and pays nothing

   Run: node test/feed.mjs */
const mem = {};
globalThis.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
globalThis.window = globalThis; globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {};

const { loadCorpus, textOf, plain } = await import('../tools/feed-corpus.mjs');
const BUILD = await import('../tools/build-feed.mjs');
const IDX = await import('../src/feed/index.js');
const GROUP = {};
for (const g of Object.keys(IDX.LOAD)) GROUP[g] = (await IDX.LOAD[g]()).default;
const DATA = IDX.INDEX.map((x) => GROUP[x.g][x.id]);
const FEED = await import('../src/feed.js');
const sim = await import('../src/sim.js');
const mistakes = await import('../src/mistakes.js');
const { PLACES } = await import('../src/town.js');
const C = await loadCorpus();
const { CHAPTERS, ALL_CARDS, SOURCES, GLOSSARY, LORE, leaks, drillAt, card } = C;
const GEN = await import('../src/generate.js');
const FMT = await import('../src/fmt.js');
const { ART } = await import('../src/art-gen.js');
const { COVERS } = await import('../src/covers-gen.js');
const { COVER_ALIAS } = await import('../src/gamelist.js');
const { BLD } = await import('../src/buildings-gen.js');

/* The sources the feed added for audit V1, resolved HERE, independently of the builder: an
   objective's authored retrieval item; its generated item, drawn again from the same seed
   at one unit to the coin. The one change a card may make to its
   source's words is to show money with no currency sign — made the same way to the source
   before its words are looked for, so nothing else can slip through. */
const SIGN_RE = new RegExp(Object.values(FMT.CURRENCIES).map((c) => c.sign.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
const unsigned = (o) => JSON.parse(JSON.stringify(o).replace(SIGN_RE, ''));
const objectiveOf = (id) => C.OBJECTIVES.find((o) => o.id === id);
const genAgain = (o, seed) => { const was = FMT.currency(); FMT.setCurrency('AED'); try { return GEN.genCard(o, seed, { ceil: 6 }); } finally { FMT.setCurrency(was); } };
function resolve(src) {
  let m = /^assess:([A-Z]+-\d+)#(\d+)(why)?$/.exec(src || '');
  if (m) { const o = objectiveOf(m[1]), d = o && o.assess[+m[2]]; return d ? unsigned({ title: o.short, ...d }) : null; }
  m = /^gen:([A-Z]+-\d+)~(\d+)(#why)?$/.exec(src || '');
  if (m) { const o = objectiveOf(m[1]), g = o && genAgain(o, +m[2]); return g ? unsigned(g) : null; }
  return C.resolve(src);
}

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nMy Feed · content, ranking, pay\n' + '─'.repeat(56));

/* ── the content ─────────────────────────────────────────────────────── */
ok(DATA.length >= 800 && new Set(DATA.map((x) => x.id)).size === DATA.length, 'count: every card has its own id', `${DATA.length} cards`);
ok(JSON.stringify(DATA) === JSON.stringify(BUILD.items) && JSON.stringify(IDX.INDEX) === JSON.stringify(BUILD.index) && Object.values(GROUP).reduce((t, g) => t + Object.keys(g).length, 0) === DATA.length,
  'fresh: src/feed/ is what the corpus cuts today (rerun tools/build-feed.mjs)');
ok(IDX.INDEX.every((x) => x.g === (x.level ?? 0)) && Object.keys(IDX.LOAD).length === 9, 'the cards live in nine lazy groups: one per chapter, one with no level');
/* no near-duplicates: no two bodies share 80% of their words (of the shorter) */
{
  const W = (t) => new Set((plain(t).toLowerCase().match(/[a-z0-9']+/g) || []));
  const B = DATA.filter((x) => x.body).map((x) => ({ id: x.id, w: W(x.body) })).filter((x) => x.w.size >= 4);
  const twins = [];
  for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) if (BUILD.overlap(B[i].w, B[j].w) >= 0.8) twins.push(B[i].id + ' ≈ ' + B[j].id);
  ok(!twins.length, 'near-duplicates: no two cards\' bodies are 80% the same words', twins.length ? twins.slice(0, 2).join(' | ') : `${B.length} bodies compared`);
}

const unresolved = [], unfound = [];
for (const it of DATA) {
  const o = resolve(it.src);
  if (!o) { unresolved.push(it.src); continue; }
  const T = textOf(o);
  const parts = [...(it.body ? it.body.split('\n') : []), ...(it.play ? [it.play.q, ...it.play.opts, it.play.after].filter(Boolean) : [])];
  const missing = parts.filter((p) => !T.includes(plain(p)));
  const titleOk = T.includes(it.title) || BUILD.FRAMES.includes(it.title) || (it.kind === 'question' && CHAPTERS.some((c) => c.title === it.title));
  if (missing.length || !titleOk) unfound.push(`${it.id}: ${titleOk ? '' : 'title “' + it.title + '” '}${missing.map((m) => '“' + m.slice(0, 30) + '”').join(' ')}`);
}
ok(!unresolved.length, 'resolves: every src names an object in the corpus', unresolved.slice(0, 3).join(' '));
ok(!unfound.length, 'resolves: every word on a card is found in the object it names', unfound.slice(0, 3).join(' | '));

const sig = DATA.map((x) => x.src + '|' + x.kind + '|' + x.title + '|' + (x.body || '') + '|' + (x.play ? x.play.q : ''));
ok(new Set(sig).size === sig.length, 'distinct: no two cards share src + kind + text');
const keys = (o) => JSON.stringify(o).match(/"(needsReview|needs_review|unsure|needs_original)":true/g);
ok(!DATA.some((x) => keys(resolve(x.src))), 'held: nothing held for review is cut');

/* questions: from the lesson drills, the right answer written first, no title that leaks it */
const qs = DATA.filter((x) => x.play);
const qbad = qs.filter((x) => {
  let d = null;
  const m = /^card:([^#]+)#q(\d+)$/.exec(x.src);
  if (m) d = drillAt(card(m[1]), +m[2]);
  else if (/^(assess:[^#]+#\d+|gen:[^#]+)$/.test(x.src)) { const o = resolve(x.src); d = o && (o.drill || o); }
  if (!d || !Array.isArray(d.opts)) return true;
  return plain(d.opts[d.a]) !== x.play.opts[0] || x.play.opts.length !== d.opts.length || new Set(x.play.opts).size !== x.play.opts.length || leaks(x.title, d);
});
ok(qs.length && !qbad.length, 'questions come only from the lesson drills and the objectives\' retrieval items, right answer first, and no title leaks it', `${qs.length} questions` + (qbad.length ? ' · ' + qbad[0].id : ''));

/* audit V1 · the retrieval cards: each sits with the chapter that teaches its objective, is a
   four-option question (a typed amount has nothing to tap) or that question's reason, and
   carries no currency — the feed is cut once for every child, and currency is a setting */
{
  const R = DATA.filter((x) => /^(assess|gen):/.test(x.src));
  const chOf = (k) => k.ch || (CHAPTERS.find((c) => c.cards.some((y) => y.id === k.id)) || {}).id;
  const NEWCH = { 'x-ch4': 'c4', 'x-ch8': 'c6', 'x-ch10': 'c4', 'x-ch11': 'c3', 'x-ch12': 'c3' };
  const misplaced = R.filter((x) => { const o = objectiveOf(/^[a-z]+:([A-Z]+-\d+)/.exec(x.src)[1]), k = card(o.teach); return x.level !== CHAPTERS.findIndex((c) => c.id === (chOf(k) || NEWCH[k.id])) + 1 || !x.topics.includes('card:' + k.id); });
  ok(R.length >= 300 && !misplaced.length, 'retrieval: every objective\'s question sits with the chapter (and lesson) that teaches it', `${R.filter((x) => x.play).length} questions, ${R.filter((x) => !x.play).length} reasons` + (misplaced.length ? ' · ' + misplaced[0].id : ''));
  const shapeBad = R.filter((x) => (x.play ? x.kind !== 'question' || x.play.opts.length < 3 : x.kind !== 'why' || !x.card));
  ok(!shapeBad.length, 'retrieval: a question with options to tap, or its reason (shown only after the lesson)', shapeBad.slice(0, 2).map((x) => x.id).join(' '));
  const HAS_SIGN = new RegExp(SIGN_RE.source);
  const signed = R.filter((x) => HAS_SIGN.test(JSON.stringify([x.title, x.body, x.play])));
  ok(!signed.length, 'retrieval: no currency sign on any card the feed added — money is a bare number, as the lessons write it', signed.slice(0, 2).map((x) => x.id).join(' '));
}

/* figures: ONLY the register in sources.js; and no card states a real-world figure */
ok(DATA.filter((x) => x.kind === 'figure').every((x) => /^figure:/.test(x.src) && SOURCES[x.src.slice(7)]) && DATA.filter((x) => /^figure:/.test(x.src)).every((x) => x.kind === 'figure'),
  'figures come only from src/sources.js', DATA.filter((x) => x.kind === 'figure').length + ' figures');
const REAL = [/\b(19|20)\d\d\b/, /\d[^.]*\bper (annum|year)\b/i, /\b(inflation|interest rate|return)s? (of|was|were|has been|averaged)\b/i, /\bon average,? (the|a) (market|economy|country)\b/i];
/* a scam letter is the scam's own words ("GENERATOR WORKING 2026!!"), shown as the scam it was, not a claim */
const isScamLetter = (x) => /^letter:[^#]+$/.test(x.src) && (C.LETTERS.find((L) => 'letter:' + L.id === x.src) || {}).from === 'scam';
const realBad = DATA.filter((x) => x.kind !== 'figure' && !isScamLetter(x) && REAL.some((re) => re.test([x.title, x.body, x.play && x.play.q].join(' '))));
ok(!realBad.length, 'no card states a real-world figure', realBad.slice(0, 3).map((x) => x.id).join(' '));
/* money: nothing to buy, no projection */
ok(!DATA.some((x) => /\b(buy|invest|trade)\b/i.test(x.cta || '')), 'no card asks the child to buy or invest — its button reads, plays or opens');
ok(DATA.filter((x) => ['company', 'event', 'market'].includes(x.kind)).every((x) => /^#\/market40\/(company|event|era)\//.test(x.route) && x.badge && x.badge.id === 'fiction' && !/buy|invest/i.test(x.cta || '')), 'the Market Game\'s companies are labelled fictional and only ever read — each opens its own read-only page');
const feedSrc = (await import('node:fs')).readFileSync(new URL('../src/feed.js', import.meta.url), 'utf8');
ok(!/money\.|bankProjection|townGrowth|addXP|ledger\.answer|mastery\.(check|retrieve|transfer|introduce)/.test(feedSrc.replace(/\/\*[\s\S]*?\*\//g, '')), 'feed.js touches no town money, no projection, no XP and no mastery record');
/* bands and maths */
ok(DATA.every((x) => Array.isArray(x.bands) && x.bands.length && x.bands.every((b) => ['sprout', 'builder'].includes(b))), 'every card names its bands');
ok(DATA.filter((x) => ['company', 'event', 'market'].includes(x.kind)).every((x) => x.bands.join() === 'builder'), 'the Market Game (no market for a Sprout) is Builder-only');
ok(DATA.every((x) => /^M\d+$/.test(x.maths || '')), 'every card declares the arithmetic it demands');
ok(DATA.filter((x) => /%/.test([x.title, x.body].join(' '))).every((x) => +x.maths.slice(1) >= 10), 'a card that says a percent demands the percent rung (M10)');

/* routes: every one opens ONE real thing (owner, 3 Oct 2026: "to that specific topic, not the
   generic tool or collection"). A specific route must name an object that exists. */
const SCREENS = ['home', 'town', 'learn', 'atlas', 'money', 'play', 'store', 'me', 'collection', 'medals', 'shop', 'words', 'mistakes', 'market40', 'feed'];
const has = (list, id, key = 'id') => (list || []).some((o) => String(o[key]) === String(id));
const badRoute = DATA.filter((x) => {
  const m = /^#\/([a-z0-9]+)(?:\/([^/]+))?(?:\/([^/]+))?$/.exec(x.route || ''); if (!m) return true;
  const [, a, b0, c0] = m, b = b0 && decodeURIComponent(b0), d = c0 && decodeURIComponent(c0);
  if ((a === 'learn' || a === 'atlas') && b === 'chapter') return !has(CHAPTERS, d);
  if ((a === 'learn' || a === 'atlas') && b) return !card(b);
  if (a === 'words' && b) return !GLOSSARY.some((g) => g[0] === b);
  if (a === 'sources') return !SOURCES[b];
  if (a === 'cast') return !LORE[b];
  if (a === 'play') return !has(C.GAMES, b);
  if (a === 'medals') return !C.BADGES[b];
  if (a === 'letter') return !has(C.LETTERS, b);
  if (a === 'store') return !has(C.SHOP, b);
  if (a === 'wardrobe') return !has(C.WARDROBE, b);
  if (a === 'shelter') return !C.KINDS[b];
  if (a === 'me') return b !== 'rank';
  if (a === 'town' && b === 'fix') return !has(C.FIXES, d);
  if (a === 'town' && b === 'job') return !has(C.JOBS, d);
  if (a === 'town' && b) return !['today', 'deed', 'ask'].includes(b) && !has(C.WORLDS, b);
  if (a === 'money' && b && d) return !({ place: C.HOMES, portfolio: [...C.ASSETS, ...C.CLASSES], business: C.STOCK }[b] || []).some((o) => o.id === d);
  if (a === 'money' && b) return !PLACES.some((p) => p.sub === b);
  if (a === 'market40' && b === 'company') return !has(C.COMPANIES, d);
  if (a === 'market40' && b === 'event') return !has(C.EVENTS, d);
  if (a === 'market40' && b === 'era') return !has(C.ERAS, d);
  return !SCREENS.includes(a) || !!b;
});
ok(!badRoute.length, 'routes: every card opens a real screen', `${new Set(DATA.map((x) => x.route)).size} routes` + (badRoute.length ? ' · ' + badRoute[0].route : ''));
/* and none is the generic tool where a specific thing exists */
const GENERIC = ['#/play', '#/medals', '#/town', '#/store', '#/market40', '#/learn', '#/atlas', '#/money/portfolio', '#/money/business', '#/money/place', '#/me'];
const generic = DATA.filter((x) => GENERIC.includes(x.route));
ok(!generic.length, 'no card sends the child to a generic page — the medal, the letter, the game, the company itself', generic.slice(0, 3).map((x) => x.id + ' → ' + x.route).join(' | '));
ok(DATA.every((x) => typeof x.source === 'string' && x.source.length > 2 || ['word', 'wordmore', 'figure'].includes(x.kind) && x.source), 'every card says where it comes from', DATA.filter((x) => !x.source).slice(0, 2).map((x) => x.id).join(' '));
ok(DATA.filter((x) => x.play).every((x) => { const k = C.card(((x.topics || []).find((t) => t.startsWith('card:')) || '').slice(5)); return !k || !x.source.includes(k.title) || !leaks(x.source, { q: x.play.q, opts: [x.play.opts[0]], a: 0 }); }), "a question card's source line never names a lesson that would hint at its answer");

/* levels: Finance's eight chapters */
const per = CHAPTERS.map((_, i) => DATA.filter((x) => x.level === i + 1).length);
const any = DATA.filter((x) => x.level == null).length;
ok(DATA.every((x) => x.level == null || (Number.isInteger(x.level) && x.level >= 1 && x.level <= CHAPTERS.length)), 'every level is one of the eight chapters');
const shortBad = per.map((n, i) => {
  const S = BUILD.SHORT[i + 1];
  if (n >= 100) return S ? `chapter ${i + 1} has ${n} and is still declared short` : null;
  return S && n >= S.floor ? null : `chapter ${i + 1} has ${n}${S ? ' (declared ' + S.floor + ')' : ', undeclared'}`;
}).filter(Boolean);
ok(!shortBad.length, 'levels: each chapter holds 100 cards, or its shortfall is declared with what would close it', per.map((n, i) => `${i + 1}:${n}${BUILD.SHORT[i + 1] ? '*' : ''}`).join(' ') + (shortBad.length ? ' · ' + shortBad.join('; ') : ''));
ok(any >= 300, 'at least 300 cards belong to no level', `${any} level-agnostic`);
ok(per.every((n, i) => BUILD.SHORT[i + 1] || n >= 110), 'levels (audit V1): every chapter not declared short holds at least 110', per.join(' '));

/* audit V3 · narration reads as a whole idea: a line card is a passage of the narrator's
   consecutive lines, or one long sentence that leans on nothing — never a shard */
{
  const LEAN = /^(but|and|so|or|then|now|not|same|here|hear|that|this|those|these|it|its|they|which|because|if|both|one|two|three|usually)\b/i;
  const nw = (t) => t.split(/\s+/).filter(Boolean).length;
  const shard = DATA.filter((x) => x.kind === 'line').filter((x) => {
    const lines = x.body.split('\n');
    return lines.length === 1 ? nw(lines[0]) < 16 || LEAN.test(lines[0]) : nw(x.body) < 22 || !/#beats\d+-\d+$/.test(x.src);
  });
  ok(!shard.length && !DATA.some((x) => x.body === 'The price is what the seller asks. It is printed, public, and real.'),
    'lines: no narrated shard on its own — a passage of two or more lines, or one long sentence that stands alone', shard.slice(0, 2).map((x) => x.id + ' “' + x.body.slice(0, 40) + '”').join(' | '));
}

/* audit · every letter looks the same: a scam's card reads exactly like Pip's */
{
  const L = DATA.filter((x) => /^letter:[^#]+$/.test(x.src));
  const frame = (x) => JSON.stringify({ kind: x.kind, source: x.source, cta: x.cta, bands: x.bands, keys: Object.keys(x).sort(), topics: x.topics.filter((t) => !t.startsWith('letter:')), art: FEED.artFor(x) });
  const scam = L.filter(isScamLetter), cast = L.filter((x) => !isScamLetter(x) && !x.gate);
  ok(L.length === C.LETTERS.length && scam.length >= 3 && scam.every((x) => frame(x) === frame(cast[0]) && !x.gate) && cast.every((x) => frame(x) === frame(cast[0])),
    'letters: one frame for every letter — a scam has the same kind, source, button, gate and picture as a letter from Pip', `${L.length} letters, ${scam.length} of them scams`);
  const lbad = L.filter((x) => { const o = C.LETTERS.find((y) => 'letter:' + y.id === x.src); return x.route !== '#/letter/' + encodeURIComponent(o.id) || !plain(o.body).startsWith(x.body) || (x.body.length > 160 && /[.!?…]\s/.test(x.body)); });
  ok(!lbad.length, 'letters: each shows its title and the opening of its body, and opens that letter', lbad.slice(0, 2).map((x) => x.id).join(' '));
}

/* ── the ranking ─────────────────────────────────────────────────────── */
await FEED.load();
const NOW = Date.UTC(2026, 9, 2, 12), DAY = 864e5;
const at = (chapter, band = 'builder', extra = {}) => {
  const c = sim.newChild('Asha', band, 'INR');
  CHAPTERS.slice(0, chapter - 1).forEach((ch) => ch.cards.forEach((k) => { c.learn.done[k.id] = true; }));
  c.learn.level = [1, 3, 6, 8, 11, 13, 16, 23][chapter - 1] + 2;
  Object.assign(c, extra);
  return c;
};
const S = (c, now = NOW) => { delete c.feed; return FEED.session(c, now).map((x) => ({ ...x, it: FEED.byId(x.id) })); };

/* bands: a Sprout never sees a Builder card — across every chapter and a fortnight of days */
const anyN = [];
let leak = 0, beyond = 0, mathsOver = 0, three = 0, tooMany = 0, sizes = [];
for (let ch = 1; ch <= 8; ch++) for (let d = 0; d < 14; d++) {
  const c = at(ch, 'sprout', { maths: { ceiling: 6 } }), L = S(c, NOW + d * DAY);
  sizes.push(L.length); anyN.push(L.filter((x) => x.tier === 'any').length);
  leak += L.filter((x) => !x.it.bands.includes('sprout')).length;
  beyond += L.filter((x) => x.it.level != null && x.it.level > ch + 1).length;
  mathsOver += L.filter((x) => +x.it.maths.slice(1) > (6 + Math.floor(c.learn.level / 6))).length;
  three += L.filter((x, i) => i >= 2 && L[i - 1].it.kind === x.it.kind && L[i - 2].it.kind === x.it.kind).length;
  tooMany += L.filter((x) => x.it.play).length > 5 ? 1 : 0;
}
ok(!leak, 'bands: a Sprout never sees a Builder card (8 chapters × 14 days)');
ok(!beyond, 'ceiling: a child on chapter n never sees a card above n + 1');
ok(!mathsOver, 'the arithmetic gate: no card demands maths above the child\'s measured ceiling');
ok(!three && !tooMany, 'mix: never three of one kind in a row, never more than five questions');
ok(sizes.every((n) => n > 0 && n <= 20), 'ends: a session is at most twenty cards', `${Math.min(...sizes)}–${Math.max(...sizes)}`);
ok(anyN.every((n) => n >= 1 && n <= 5), 'cards with no level season every session, never more than a quarter', `${Math.min(...anyN)}–${Math.max(...anyN)} a session`);

/* the arithmetic gate, by breaking it: the same child with a ceiling of 4 loses the percent cards */
{
  const hi = S(at(7, 'builder')), lo = S(at(7, 'builder', { maths: { ceiling: 4 } }));
  ok(hi.some((x) => +x.it.maths.slice(1) >= 10) && !lo.some((x) => +x.it.maths.slice(1) > 4 + Math.floor(at(7).learn.level / 6)), 'a lower ceiling takes the cards whose maths it has not met away', `${hi.filter((x) => +x.it.maths.slice(1) >= 10).length} → ${lo.filter((x) => +x.it.maths.slice(1) >= 10).length} percent cards`);
}

/* context: finishing a stop moves its cards up, and says so */
{
  const c = at(3); c.lastDone = { id: 'c3c', title: 'What it really cost', t: NOW - 1000 };
  const L = S(c);
  const top = L.slice(0, 6).filter((x) => x.it.topics.includes('card:c3c'));
  ok(top.length >= 1 && top.every((x) => /Because you finished “What it really cost”/.test(x.why)), 'context: a stop just finished moves its cards up, with its why', top.map((x) => x.why).slice(0, 1).join(''));
}
/* due: a question that tripped her comes back first once its gap is over, and not before */
{
  const c = at(3); mistakes.record(c, 'c2a', 1, NOW - 2 * DAY);
  const L = S(c);
  ok(L[0].it.key === 'c2a#1' && /tripped you/.test(L[0].why), 'due: a slipped question comes back first, with its reason', `${L[0].it.key} · ${L[0].why}`);
  const c3 = at(3); mistakes.record(c3, 'c2a', 1, NOW - 2 * DAY); c3.lastDone = { id: 'c3c', title: 'What it really cost', t: NOW - 1000 };
  ok(S(c3)[0].it.key === 'c2a#1', 'due: …first even over the stop she has just finished');
  const c2 = at(3); mistakes.record(c2, 'c2a', 1, NOW - 0.2 * DAY);
  ok(S(c2)[0].it.key !== 'c2a#1', 'due: …and not before its gap is over');
}
/* climbing: the "now" cards change chapter with her */
{
  const a = S(at(3)).filter((x) => x.tier === 'now'), b = S(at(4)).filter((x) => x.tier === 'now');
  ok(a.length >= 12 && b.length >= 12 && a.every((x) => x.it.level === 3 || x.it.level == null) && b.every((x) => x.it.level === 4) && !a.some((x) => b.some((y) => y.id === x.id)),
    'climbing a chapter changes every "now" card', `${a.length} now on chapter 3, ${b.length} on chapter 4`);
  ok(S(at(4)).filter((x) => x.tier === 'next').every((x) => x.it.level === 5 && /^Coming up on Chapter 5/.test(x.why)), 'a peek at the next chapter says so');
}
/* seen this week sinks */
{
  const c = at(2); const first = FEED.session(c, NOW).map((x) => x.id);
  c.feed.day = -1; const again = FEED.session(c, NOW + 1000).map((x) => x.id);
  ok(again.filter((id) => first.includes(id)).length <= 2, 'what was seen today sinks out of the next draw', `${again.filter((id) => first.includes(id)).length} repeats`);
}
/* audit V4, V2, V5, V8 · over many sessions: several children, both bands, every chapter, a
   month of days, with and without a lesson just finished and a question that slipped */
{
  const runs = [];
  for (let ch = 1; ch <= 8; ch++) for (const band of ['sprout', 'builder']) for (let d = 0; d < 30; d += 2) {
    const c = at(ch, band);
    const k = CHAPTERS[ch - 1].cards[d % CHAPTERS[ch - 1].cards.length];
    if (d % 4 === 0) c.lastDone = { id: k.id, title: k.title, t: NOW + d * DAY - 1000 };
    if (d % 6 === 0 && ch > 1) mistakes.record(c, CHAPTERS[ch - 2].cards[0].id, 1, NOW + (d - 3) * DAY);
    runs.push({ ch, band, d, c, L: S(c, NOW + d * DAY) });
  }
  /* V4: two of one lesson (or one letter, one company — one source object) at most */
  let worst = 0, worstAt = '';
  for (const r of runs) { const n = {}; for (const x of r.L) { const g = x.it.grp; n[g] = (n[g] || 0) + 1; if (n[g] > worst) { worst = n[g]; worstAt = `${g} ×${n[g]} on chapter ${r.ch}`; } } }
  ok(worst <= 2 && FEED.PER_GRP === 2 && runs.every((r) => r.L.length >= 15), 'repeats: no session holds more than two cards of one lesson or source object — and still about twenty cards', `${runs.length} sessions, worst ${worstAt}, ${Math.min(...runs.map((r) => r.L.length))}–${Math.max(...runs.map((r) => r.L.length))} cards`);
  ok(DATA.every((x) => typeof x.grp === 'string' && x.grp && (x.topics.some((t) => t.startsWith('card:')) ? x.grp === x.topics.find((t) => t.startsWith('card:')) : x.grp === x.src.split('#')[0])), 'every card names the one source object it was cut from (its lesson, else its src)');
  /* V2: past a chapter, its cards come back for a second look, labelled; never above a quarter */
  const past = runs.filter((r) => r.ch > 1);
  const rv = past.map((r) => r.L.filter((x) => x.tier === 'review'));
  const rvBad = rv.flat().filter((x) => !(x.it.level < past[0].ch + 7) || !/^(A second look|A question that tripped you|Due for a second look|To keep|You live in|Because you)/.test(x.why));
  ok(rv.every((l) => l.length >= 1 && l.length <= 5) && !rvBad.length && past.every((r) => r.L.filter((x) => x.tier === 'review').every((x) => x.it.level < r.ch)),
    'review: past chapter one, every session brings back one to five cards from a finished chapter, each labelled for a second look', `${Math.min(...rv.map((l) => l.length))}–${Math.max(...rv.map((l) => l.length))} a session` + (rv.some((l) => !l.length) ? ` · none on chapter ${past[rv.findIndex((l) => !l.length)].ch}, ${past[rv.findIndex((l) => !l.length)].band}, day ${past[rv.findIndex((l) => !l.length)].d}` : "") + (rvBad.length ? ' · ' + rvBad[0].why : ''));
  /* V5: the reason names the specific thing — and only what is true of this card */
  const all = runs.flatMap((r) => r.L.map((x) => ({ ...x, c: r.c })));
  const generic = all.filter((x) => /^For Chapter|^New for you$/.test(x.why));
  const lie = all.filter((x) => {
    const m = /^(?:From|A second look at|Your next stop on the Money Atlas:) “([^”]+)”/.exec(x.why); if (!m) return false;
    const k = card(((x.it.topics || []).find((t) => t.startsWith('card:')) || '').slice(5));
    return !k || k.title !== m[1] || !!x.it.play || (/which you have read$/.test(x.why) && !x.c.learn.done[k.id]) || (/in the chapter you are on$/.test(x.why) && x.c.learn.done[k.id]);
  });
  ok(generic.length <= all.length * 0.1 && !lie.length, 'why: at most one card in ten has a generic reason, and a reason that names a lesson names the card\'s own (and never on a question)', `${generic.length} of ${all.length} generic` + (lie.length ? ' · ' + lie[0].id + ': ' + lie[0].why : ''));
  /* V8: a card's picture is its own — never a painted backdrop, never one picture for everything */
  const plates = new Set(Object.entries(ART).filter(([k]) => k.startsWith('world-')).map(([, v]) => v));
  const FULL = Object.fromEntries(DATA.map((x) => [x.id, x]));
  const arts = all.map((x) => ({ x, a: FEED.artFor(FULL[x.id]) })).filter((y) => y.a);
  let crowd = 0;
  for (const r of runs) { const n = {}; r.L.forEach((x) => { const a = FEED.artFor(FULL[x.id]); if (a) n[a] = (n[a] || 0) + 1; }); crowd = Math.max(crowd, ...Object.values(n), 0); }
  const own = DATA.filter((x) => FEED.artFor(x)).filter((x) => {
    const a = FEED.artFor(x), who = ((x.topics || []).find((t) => t.startsWith('who:')) || '').slice(4), g = /^#\/play\/(\w+)/.exec(x.route || '');
    if (['lesson', 'tryit', 'yourturn', 'cast', 'castline'].includes(x.kind)) return a !== ART['cast-' + who];
    if (['game', 'needwant', 'scamspot', 'chance'].includes(x.kind)) return !g || a !== (COVERS[g[1]] || COVERS[COVER_ALIAS[g[1]]]).src;
    if (['home', 'shopstock', 'exchange'].includes(x.kind)) return !Object.values(BLD).some((b) => b.src === a);
    return !['chapter', 'place', 'companion'].includes(x.kind);
  });
  ok(!arts.some((y) => plates.has(y.a)) && new Set(arts.map((y) => y.a)).size >= 12 && crowd <= 3 && !own.length && !DATA.some((x) => ['question', 'why', 'letter', 'word', 'wordmore'].includes(x.kind) && FEED.artFor(x)),
    'pictures: each is the card\'s own (a face, a cover, a building, its street) — never the painted sky, never more than three of one in a session, none on a question, reason, word or letter',
    `${new Set(arts.map((y) => y.a)).size} different pictures across ${arts.length} art cards, at most ${crowd} of one a session` + (own.length ? ' · ' + own[0].id : ''));
}

/* the screen string: page head, about twenty cards, then the finished card — and nothing after it */
{
  const s = sim.newState(); s.kids.push(at(2)); const c = s.kids[0];
  FEED.view(c, s);                                           /* the first call asks for its groups */
  const want = FEED.session(c).map((x) => x.id), wantG = [...new Set(want.map((id) => FEED.byId(id).g))].sort();
  await FEED.loadGroups(want);
  ok(FEED.groups().join() === wantG.join() && wantG.length < 9, 'lazy: a session loads only the groups its cards are in', `groups ${FEED.groups().join(',')} of 0–8`);
  const html = FEED.view(c, s);
  ok(/data-bz="phead"/.test(html) && /data-bz="feed-end"/.test(html) && html.trim().endsWith('</article></div>') && (html.match(/class="bzf-card bz-card"/g) || []).length >= 10,
    'the screen: the page head, the cards, and the finished card last');
  ok(!/\b(likes|streaks?|days in a row)\b|♥|❤/i.test(html.replace(/<[^>]+>/g, '')) && !/data-(like|count)/.test(html), 'no likes, counts or streaks on the screen');
  s.settings.feedOff = true;
  ok(!/bzf-card/.test(FEED.view(c, s)) && /switched off/.test(FEED.view(c, s)), 'switched off, #/feed shows no cards and says how it comes back');
}

/* ── the pay ─────────────────────────────────────────────────────────── */
{
  const c = at(2), q = DATA.find((x) => x.play && x.level === 1);
  const before = JSON.stringify([c.money, c.learn.xp, c.mastery]);
  const coins = () => ((JSON.parse(mem['bizzing.wallet'] || '{"kids":{}}').kids.asha) || { coins: 0 }).coins;
  const c0 = coins();
  ok(FEED.answer(c, q.id, 2) === 'wrong' && coins() === c0, 'a wrong answer holds and pays nothing');
  ok(FEED.answer(c, q.id, 0) === 'wrong', '…and holds: a second tap does not change it');
  FEED.resetVisit();
  ok(FEED.answer(c, q.id, 0) === 'right' && coins() === c0 + 1, 'a right answer pays one family coin');
  FEED.resetVisit(); FEED.answer(c, q.id, 0);
  ok(coins() === c0 + 1, '…once, ever, per card');
  const led = JSON.parse(mem['bizzing.wallet']).kids.asha.ledger;
  ok(led.every((x) => x.why === 'answer'), 'through the standard answer event only', led.map((x) => x.why).join(','));
  ok(JSON.stringify([c.money, c.learn.xp, c.mastery]) === before, 'never town money, never XP, never the mastery record');
}

console.log('────────────────────────────────────────────────────────────');
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
