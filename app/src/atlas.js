/* atlas.js — the Money Atlas: Learn as one map you walk.

   Bee's Word Atlas is the model. One painted board with the five worlds as
   regions on a route, a child taps a region to walk it, and each region is a
   rail of stops — the cards — with the stop you are standing on expanded and
   the ones behind you lit gold. The board never fades; only what is still
   ahead recedes. Every fact here is read from the child's learn record
   (c.learn.done) and the content's own order (WORLDS → chapters → cards); the
   frontier is the first card not yet done in that order. */
import { WORLDS, CHAPTERS, worldOpen, chapterDone, rankObj, GLOSSARY } from './content.js';
import { ART } from './art-gen.js';
import { ATLAS, PINS } from './atlas-gen.js';
import { face, ico } from './art.js';
import { esc } from './ui.js';
import * as sim from './sim.js';
import * as co from './companion.js';
import { companionFigure } from './companionview.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const PLATE = { market: 'world-market', harbour: 'world-harbour', clock: 'world-clock', exchange: 'world-exchange', works: 'world-works' };
const GUIDE = { market: 'nana', harbour: 'pip', clock: 'nana', exchange: 'bo', works: 'mags' };

/* ── the route: every stop in walking order ───────────────────────────── */
export function stops(c) {
  const out = [];
  WORLDS.forEach((w, wi) => w.chapters.forEach((chId) => {
    const ch = CHAPTERS.find((x) => x.id === chId); if (!ch) return;
    const lockedCh = c.learn.level < ch.lv;
    ch.cards.forEach((card) => out.push({ card, ch, wi, w, done: !!c.learn.done[card.id], lockedCh }));
  }));
  const fr = out.findIndex((s) => !s.done);
  const perWorld = {};
  out.forEach((s, i) => { s.i = i; s.n = (perWorld[s.wi] = (perWorld[s.wi] || 0) + 1); s.cur = i === fr; s.locked = s.lockedCh || !worldOpen(c, s.wi); });
  return { list: out, frontier: fr < 0 ? out.length : fr };
}
const worldStat = (r, wi) => { const ns = r.list.filter((s) => s.wi === wi); return { total: ns.length, done: ns.filter((s) => s.done).length, here: ns.some((s) => s.cur) }; };

/* ── the level bar, Bee's tier bar ────────────────────────────────────── */
function levelBar(c) {
  const bar = sim.xpBar(c), rank = rankObj(c.learn.level);
  const word = c.learn.level >= 30 ? 'the top of the ladder' : c.learn.level >= 23 ? 'nearly there' : c.learn.level >= 11 ? 'well on the way' : c.learn.level >= 6 ? 'on your way' : 'just setting off';
  return `<div class="tierbar">
    <span class="tierpill">${ico(rank.em, rank.em, 13)} ${esc(rank.name)} · L${c.learn.level}</span>
    <div class="bar grow" style="height:9px"><i style="width:${bar.pct * 100}%"></i></div>
    <span class="small muted" style="white-space:nowrap;font-weight:700">${word}</span>
  </div>`;
}

/* ── a pin on the board ───────────────────────────────────────────────── */
function pin(c, w, wi, x, y, st) {
  const state = st.total && st.done >= st.total ? 'done' : st.here ? 'cur' : st.done ? 'cur' : 'locked';
  const open = worldOpen(c, wi);
  const av = state === 'cur' ? (co.has(c) ? companionFigure(c, 30) : face('pip', 30)) : '';
  return `<button class="apin ${state}${open ? '' : ' shut'}" data-act="shelf" data-arg="act:${wi}" style="left:${x}%;top:${y}%;--ja:${w.tint}" title="${esc(w.name)}">
    <span class="adot">${av || `<b>${state === 'done' ? '★' : ROMAN[wi]}</b>`}</span>
    <span class="achip"><b>${esc(w.name)}</b><i>${st.total ? `${st.done}/${st.total} stops` : 'ahead'}</i></span>
  </button>`;
}
function route(pins, upto) {
  if (pins.length < 2) return '';
  const d = pins.map((p, i) => (i ? 'L' : 'M') + p[1] + ' ' + p[2]).join(' ');
  const walked = pins.slice(0, Math.max(1, upto + 1)).map((p, i) => (i ? 'L' : 'M') + p[1] + ' ' + p[2]).join(' ');
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="aroute" aria-hidden="true">
    <path d="${d}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width=".9" stroke-dasharray="1.4 2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" style="filter:drop-shadow(0 1px 2px rgba(24,14,4,.5))"/>
    ${upto >= 1 ? `<path d="${walked}" fill="none" stroke="#FFD24D" stroke-width="1.4" stroke-linecap="round" vector-effect="non-scaling-stroke" style="filter:drop-shadow(0 1px 3px rgba(24,14,4,.55))"/>` : ''}
  </svg>`;
}
export function board(c) {
  const r = stops(c);
  let cur = -1;
  const pins = (PINS.length ? PINS : WORLDS.map((w, i) => [w.id, 14 + i * 18, 78 - i * 14]));
  const cells = pins.map(([id, x, y], i) => {
    const wi = WORLDS.findIndex((w) => w.id === id); if (wi < 0) return '';
    const st = worldStat(r, wi); if (st.here) cur = i;
    return pin(c, WORLDS[wi], wi, x, y, st);
  }).join('');
  return `<div class="aboard-scroll"><div class="aboard" style="aspect-ratio:${ATLAS.w}/${ATLAS.h}">
    <img src="${ATLAS.src}" alt="" width="${ATLAS.w}" height="${ATLAS.h}">
    ${route(pins, cur)}${cells}
  </div></div>`;
}

/* ── one world's rail of stops ────────────────────────────────────────── */
function medallion(c, s, kind) {
  if (kind === 'passed') return `<span class="med passed">✓</span>`;
  if (kind === 'cur') return `<span class="med cur" style="--ja:${s.w.tint}">${co.has(c) ? companionFigure(c, 30, { bob: true }) : face('pip', 30)}</span>`;
  return `<span class="med ${kind}">${s.locked ? ico('lock', '🔒', 13) : s.n}</span>`;
}
function stopRow(c, s) {
  const kind = s.done ? 'passed' : s.cur ? 'cur' : s.locked ? 'locked' : 'open';
  const blurb = s.cur ? String(s.card.teach || '').replace(/<[^>]+>/g, '').split(/(?<=[.!?])\s/)[0] : '';
  const who = s.card.who && s.card.who !== 'pip' ? s.card.who : null;
  return `<button class="stop ${kind}" data-act="${s.locked ? 'locked' : 'card'}" data-arg="${s.locked ? s.ch.lv : s.card.id}" style="--ja:${s.w.tint}">
    ${medallion(c, s, kind)}
    <span class="stbody">
      <span class="sttitle">${esc(s.card.title)}</span>
      <span class="sttag">${esc(s.ch.title)}${who ? ' · ' + esc((face(who) && '') || '') + esc(who === 'nana' ? 'Nana Bizz' : who === 'mags' ? 'Mags' : who === 'bo' ? 'Bo' : who === 'bea' ? 'Bea' : who) : ''}</span>
      ${blurb ? `<span class="stblurb">${esc(blurb)}</span>` : ''}
      ${s.cur ? `<span class="stgo">Continue →</span>` : ''}
    </span>
    ${s.done ? `<span class="small" style="color:var(--grow);font-weight:800">${'★'.repeat(Math.max(1, Math.min(3, (c.learn.done[s.card.id] && c.learn.done[s.card.id].right) || 1)))}</span>` : ''}
  </button>`;
}
function ring(done, total, size, col) {
  const R = (size - 6) / 2, C = 2 * Math.PI * R, pct = total ? done / total : 0;
  return `<span class="aring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${R}" fill="rgba(10,20,24,.34)" stroke="rgba(255,255,255,.3)" stroke-width="3"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${R}" fill="none" stroke="${col}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>
    <b>${done}/${total}</b></span>`;
}
export function actSection(c, wi, r, opts = {}) {
  const w = WORLDS[wi]; const ns = r.list.filter((s) => s.wi === wi);
  const st = worldStat(r, wi); const open = worldOpen(c, wi);
  const plate = ART[PLATE[w.id]];
  const status = st.here ? 'you are here' : st.done === st.total && st.total ? 'cleared' : st.done ? 'in progress' : open ? 'open' : 'ahead';
  const pct = ns.length ? Math.round(ns.filter((s) => s.done).length / ns.length * 100) : 0;
  return `<section class="act${st.here ? ' here' : ''}${open ? '' : ' shut'}" id="act-${wi}" style="--ja:${w.tint}">
    <div class="actban" style="${plate ? `--plate:url(${plate})` : ''}">
      <span class="actscrim"></span>
      <div class="actrow">
        <span class="actguide">${face(GUIDE[w.id] || 'pip', 50)}</span>
        <span class="acttext"><b>${ROMAN[wi]} · ${esc(w.name)}</b><i>${esc(w.rank)} · ${status}</i></span>
        ${ring(st.done, st.total, 44, st.done === st.total && st.total ? 'var(--grow)' : '#FFD24D')}
      </div>
    </div>
    <div class="rail">
      <span class="railline" aria-hidden="true"><span style="height:${pct}%"></span></span>
      ${ns.map((s) => stopRow(c, s)).join('')}
      ${!open && wi > 0 ? `<p class="small muted" style="padding:6px 4px 2px 44px">Finish ${esc(WORLDS[wi - 1].name)} to walk on.</p>` : ''}
    </div>
  </section>`;
}

/* ── the two screens ──────────────────────────────────────────────────── */
export function viewAtlas(c) {
  const r = stops(c);
  const cur = r.list[r.frontier];
  return `<div class="stack atlas">
    <div>
      <h1 style="font-size:26px">The Money Atlas</h1>
      <div class="row" style="gap:7px;flex-wrap:wrap;margin-top:8px">
        <button class="wchip" data-act="shelf" data-arg="words">${ico('lesson', '📖', 15)} Money Words · ${GLOSSARY.length}</button>
        <button class="wchip" data-act="nav" data-arg="arcade">${ico('arcade', '🎮', 15)} Practise it</button>
      </div>
    </div>
    ${levelBar(c)}
    ${board(c)}
    <p class="small muted" style="margin:-6px 4px 0">Tap a region to walk it. ${cur ? `You are standing at <b>${esc(cur.card.title)}</b> in ${esc(cur.w.name)}.` : 'Every stop is cleared.'}</p>
    ${WORLDS.map((w, wi) => actSection(c, wi, r)).join('')}
  </div>`;
}
export function viewAct(c, wi) {
  const r = stops(c); const w = WORLDS[wi] || WORLDS[0]; wi = WORLDS.indexOf(w);
  const st = worldStat(r, wi);
  return `<div class="stack atlas">
    <button class="backlink" data-act="shelf" data-arg="">${ico('back', '←', 16)} The map</button>
    <div class="row" style="gap:12px;align-items:center">
      <span style="width:56px;height:56px;flex:0 0 auto">${face(GUIDE[w.id] || 'pip', 56)}</span>
      <div class="grow"><h1 style="font-size:24px">${ROMAN[wi]} · ${esc(w.name)}</h1>
        <p class="small muted">${esc(w.blurb)} · ${st.done} of ${st.total} stops</p></div>
    </div>
    ${actSection(c, wi, r, { solo: true })}
  </div>`;
}
