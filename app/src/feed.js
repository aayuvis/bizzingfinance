/* feed.js — My Feed in Bizzington (FAMILY-STANDARD §6a; the family drop-in does the work).

   The cards are tools/build-feed.mjs's, cut from the corpus and loaded only when #/feed opens:
   src/feed/index.js (what the engine ranks) first, then only the groups — one per chapter, and
   one for the level-agnostic cards — that today's session actually shows. The first screen
   never pays for any of it. The ranking is
   the family's feedFor(), on this device. This file only says what Bizzington knows about
   the child:
     level    the chapter she is on — the first of the eight not yet finished
     signals  what she just did: the stop she finished, the letter she answered, where she lives
     due      what slipped: a question from the mistakes deck whose gap is over, and an
              objective due for its second look (its lesson's cards come back)
     unlocked the town's own gates — a chapter finished, a world reached, the Market Game's
              level, a letter already answered — and THE ARITHMETIC GATE: a card is shown only
              when ledger.mathsMet() says she has met the maths its words demand (docs/03 §1)
     skip     a lesson she has read, a medal she holds, a question already paid
   What it keeps, on her own record through the Store seam (c.feed): which cards were shown
   on which day, today's session, and which questions have paid. Nothing is sent anywhere.

   Scrolling earns nothing. Only a right answer to a card's question pays — FAMILY coins,
   once, through earn('answer') (family.coins). Never town money, never XP, never mastery:
   the feed is not a surface the ledger listens to. */
import { feedFor, feedCard, feedEnd, feedHead } from './family/bizzing-feed.js';
import { CHAPTERS, WORLDS, chapterDone, worldOpen, levelAtLeast, tester, ALL_CARDS } from './content.js';
import { NEW_CARD_LIST, objective } from './objectives.js';
import * as ledger from './ledger.js';
import * as mastery from './mastery.js';
import * as mistakes from './mistakes.js';
import * as co from './companion.js';
import * as family from './family.js';
import { nextStep } from './next.js';
import { R } from './runtime.js';
import { ART } from './art-gen.js';
import { COVERS } from './covers-gen.js';
import { BLD } from './buildings-gen.js';
import { HOMES, gameOpen } from './content.js';
import { GAMES as GAME_DEFS } from './arcade.js';

/* ── more on each card (owner, 3 Oct 2026) ─────────────────────────────────
   The builder gives every card its provenance line (source) and an exact route.
   Here, at render, Bizzington adds what only the child's own record knows — a
   short status (read it, earned it, mended it, your next stop) — and a picture
   for the kinds that have one: the chapter's painted world for a chapter or a
   lesson's opening card, a game's cover, a place's plate, a home or a shop.
   Questions, reasons and words stay plain so a session is never a wall of
   pictures. Nothing here changes a card's words or what it pays. */
const worldOfChapter = (n) => { const ch = CHAPTERS[n - 1]; return ch && WORLDS.find((w) => w.chapters.includes(ch.id)); };
const plate = (w) => w && (ART['world-' + w.id] || null);
const topicVal = (it, k) => ((it.topics || []).find((t) => t.startsWith(k + ':')) || '').slice(k.length + 1);
function artFor(it) {
  const m = /^#\/play\/(\w+)/.exec(it.route || '');
  if (it.kind === 'game' && m && COVERS[m[1]]) return COVERS[m[1]].src;
  if (['chapter', 'lesson', 'tryit', 'yourturn'].includes(it.kind) && it.level) return plate(worldOfChapter(it.level));
  if (['place', 'fix', 'fixed', 'job'].includes(it.kind)) return plate(WORLDS.find((w) => w.id === topicVal(it, 'world')));
  if (it.kind === 'home') { const i = HOMES.findIndex((h) => it.route.endsWith('/' + h.id)); return BLD['home-' + Math.min(4, Math.max(0, i))] && BLD['home-' + Math.min(4, Math.max(0, i))].src; }
  if (it.kind === 'shopstock') return BLD.shop && BLD.shop.src;
  if (it.kind === 'exchange') return BLD.exchange && BLD.exchange.src;
  return null;
}
function statusFor(it, c, nextId) {
  const tail = decodeURIComponent((it.route || '').split('/').pop());
  const card = topicVal(it, 'card');
  if (card && ['lesson', 'example', 'line', 'yourturn', 'tryit', 'goal'].includes(it.kind)) return card === nextId ? 'your next stop' : c.learn.done[card] ? 'you have read this one' : null;
  if (it.kind === 'medal') return 'not earned yet';
  if (it.kind === 'chapter') { const ch = CHAPTERS[it.level - 1]; const d = ch ? ch.cards.filter((k) => c.learn.done[k.id]).length : 0; return ch ? `${d} of ${ch.cards.length} read` : null; }
  if (['letter', 'scamletter'].includes(it.kind)) return ((c.postbox || {}).log || []).some((x) => x.id === tail) ? 'you answered it' : null;
  if (it.kind === 'game') { const g = GAME_DEFS.find((x) => x.id === tail); return g && !gameOpen(c, g) ? 'opens later' : null; }
  if (['fix', 'fixed'].includes(it.kind)) return (c.fix && c.fix.done || []).includes(tail) ? 'mended' : null;
  if (it.kind === 'store') return ((c.shop || {}).owned || []).includes(tail) ? 'you own this' : null;
  if (it.kind === 'home') return c.home && HOMES[c.home.tier] && HOMES[c.home.tier].id === tail ? 'you live here' : null;
  return null;
}
function enrich(it, c, nextId) {
  const st = statusFor(it, c, nextId);
  return { ...it, art: it.art || artFor(it) || undefined, source: [it.source, st].filter(Boolean).join(' · ') || undefined };
}

const DAY = 864e5;
let ITEMS = null, BY_ID = null, LOAD = null, loading = null;
const BODY = {}, groupsLoaded = new Set();
export function load() {
  if (ITEMS) return Promise.resolve(ITEMS);
  if (!loading) loading = import('./feed/index.js').then((m) => { ITEMS = m.INDEX; LOAD = m.LOAD; BY_ID = Object.fromEntries(ITEMS.map((x) => [x.id, x])); return ITEMS; });
  return loading;
}
/* the groups a list of ids needs, loaded once each */
export function loadGroups(ids) {
  const need = [...new Set(ids.map((id) => BY_ID[id] && BY_ID[id].g).filter((g) => g != null && !groupsLoaded.has(g)))];
  return Promise.all(need.map((g) => LOAD[g]().then((m) => { Object.assign(BODY, m.default); groupsLoaded.add(g); })));
}
export const groups = () => [...groupsLoaded].sort((a, b) => a - b);
export const loaded = () => !!ITEMS;
export const items = () => ITEMS || [];
export const byId = (id) => BY_ID && BY_ID[id];
export const card = (id) => BODY[id];

export const on = (s) => !(s && s.settings && s.settings.feedOff);

/* The child's level is the chapter she is on: Finance's eight chapters are its main progress unit. */
export function levelOf(c) {
  const i = CHAPTERS.findIndex((ch) => !chapterDone(c, ch.id));
  return i < 0 ? CHAPTERS.length : i + 1;
}
export const levelName = (n) => `Chapter ${n} · ${(CHAPTERS[n - 1] || CHAPTERS[0]).title}`;

const cardTitle = (id) => ((ALL_CARDS.find((k) => k.id === id) || NEW_CARD_LIST.find((k) => k.id === id)) || {}).title || 'a lesson';
export function signals(c) {
  const out = [];
  if (c.lastDone && c.lastDone.id) {
    out.push({ topic: 'card:' + c.lastDone.id, w: 6, why: `Because you finished “${c.lastDone.title || cardTitle(c.lastDone.id)}”` });
    const k = ALL_CARDS.find((x) => x.id === c.lastDone.id);
    if (k) out.push({ topic: 'ch:' + k.ch, w: 3, why: `Because you are reading ${levelName(CHAPTERS.findIndex((x) => x.id === k.ch) + 1)}` });
  }
  const log = (c.postbox && c.postbox.log) || [], last = log[log.length - 1];
  if (last && !last.scam) out.push({ topic: 'letter:' + last.id, w: 6, why: 'Because you answered a letter in the postbox' });
  const w = WORLDS[c.world || 0];
  if (w) out.push({ topic: 'world:' + w.id, w: 2, why: `You live in ${w.name}` });
  /* what slipped is context too: its lesson's cards come back with it, and its own question first */
  mistakes.due(c).forEach((m) => out.push({ topic: 'card:' + m.card, w: 8, why: 'A question that tripped you — its gap is over' }));
  if (co.has(c)) out.push({ topic: 'companion', w: 2, why: `Because ${co.get(c).name || 'your companion'} lives with you` });
  return out;
}
export function due(c, now = Date.now()) {
  const d = {};
  mistakes.due(c, now).forEach((m) => { d[m.k] = 'A question that tripped you — its gap is over'; });
  mastery.due(c, now).forEach((o) => { if (o.teach && !d['card:' + o.teach]) d['card:' + o.teach] = `Due for a second look: ${o.short}`; });
  return d;
}
export function gateFor(c) {
  const met = ledger.mathsMet(c), T = tester();
  const log = (c.postbox && c.postbox.log) || [];
  return (it) => {
    if (it.maths && !met(it.maths)) return false;                   /* never maths she has not met */
    const g = it.gate; if (!g) return true;
    if (g.chapter && !T && !chapterDone(c, g.chapter)) return false;
    if (g.world != null && !worldOpen(c, g.world)) return false;
    if (g.market && !levelAtLeast(c, 16)) return false;
    if (g.letter && !log.some((x) => x.id === g.letter)) return false;
    if (g.companion && !co.has(c)) return false;
    return true;
  };
}
export function state(c) {
  const F = c.feed || (c.feed = {});
  F.seen = F.seen || {}; F.paid = F.paid || {};
  return F;
}

/* Today's session: kept for the day, drawn again when she has done something new. */
export function session(c, now = Date.now()) {
  const F = state(c), day = Math.floor(now / DAY), level = levelOf(c);
  const dueNow = due(c, now);
  const sig = JSON.stringify([c.band, level, c.lastDone && c.lastDone.t, ((c.postbox || {}).log || []).length, Object.keys(dueNow).length, (c.badges || []).length, c.world, tester()]);
  if (F.day === day && F.sig === sig && F.ids && F.ids.length) return F.ids;
  const nx = nextStep(c, now), nextId = nx && nx.card && nx.card.id;
  const list = feedFor({
    items: ITEMS, band: c.band, now, level, levelName, signals: signals(c), due: dueNow, seen: F.seen,
    unlocked: gateFor(c),
    /* a question's reason is a reminder after its lesson, never the answer before the question */
    skip: (it) => (it.kind === 'lesson' && c.learn.done[it.card]) || (it.kind === 'why' && !c.learn.done[it.card]) || (it.kind === 'medal' && (c.badges || []).includes(it.badgeId)) || (!!it.play && !!F.paid[it.id]),
    /* the level-fit rule: her next stop's cards fit best; a card with no level fits every
       chapter, so it may season any session (the engine holds it to a quarter) */
    extra: (it) => (nextId && it.topics && it.topics.includes('card:' + nextId) ? { s: 2, why: 'Your next stop on the Money Atlas' }
      : it.level == null ? { s: 5 } : null),
  });
  F.day = day; F.sig = sig; F.ids = list.map((x) => ({ id: x.id, why: x.why, tier: x.tier }));
  list.forEach((x) => { F.seen[x.id] = day; });
  Object.keys(F.seen).forEach((k) => { if (day - F.seen[k] > 30) delete F.seen[k]; });
  return F.ids;
}

/* this visit's answers: id → { st: 'right'|'wrong'|'held', o } */
const play = {};
export function view(c, s) {
  const head = feedHead({ name: 'My Feed', sub: 'Picked for you from across the town — about twenty, and then it ends.' });
  if (!on(s)) return head + `<div class="card empty" role="status"><p>My Feed is switched off on this device. A grown-up can switch it back on behind the PIN.</p>
    <div class="row" style="justify-content:center"><a class="btn ghost" href="#/home">Home</a></div></div>`;
  if (!ITEMS) { load().then(() => R.render()); return head + '<div class="card" role="status"><b>Opening your feed…</b></div>'; }
  const ids = session(c);
  const want = ids.map((x) => x.id);
  if (want.some((id) => !BODY[id])) { loadGroups(want).then(() => R.render()); return head + '<div class="card" role="status"><b>Opening your feed…</b></div>'; }
  const nx = nextStep(c);
  return head + '<div class="bzf-list" data-feed="1">' + ids.map((x) => {
    const it = BODY[x.id]; if (!it) return '';
    const P = play[x.id] || (state(c).paid[x.id] ? { st: 'right', o: 0 } : null);   /* paid once: it stays answered */
    /* after Continue, a missed question rests as its answer and its reason — it does not ask again */
    const nextId = nx && nx.card && nx.card.id;
    if (P && P.st === 'held') return feedCard(enrich({ ...it, play: null, body: `It is “${it.play.opts[0]}”. ${it.play.after || ''}` }, c, nextId), x, {});
    return feedCard(enrich(it, c, nextId), x, P || {});
  }).join('') + feedEnd({ href: '#/continue', label: nx && nx.title ? 'Continue: ' + nx.title : 'Continue your journey', alt: { href: '#/play', label: 'Go and play' } }) + '</div>';
}

/* A right answer pays once, ever, per card — the family's 'answer' (1 coin), never town money. */
export function answer(c, id, o, now = Date.now()) {
  const it = BY_ID && BY_ID[id]; if (!it || !it.play) return null;
  const P = play[id];
  if (P && P.st) return P.st;                                        /* answered: it holds */
  if (+o === 0) {
    play[id] = { st: 'right', o: 0 };
    const F = state(c);
    if (!F.paid[id]) { F.paid[id] = Math.floor(now / DAY); family.coins(c.name, 'answer'); }
    return 'right';
  }
  play[id] = { st: 'wrong', o: +o };
  return 'wrong';
}
export function cont(id) { if (play[id] && play[id].st === 'wrong') play[id] = { st: 'held' }; }
export function resetVisit() { Object.keys(play).forEach((k) => delete play[k]); }
