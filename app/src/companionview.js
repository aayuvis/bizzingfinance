/* companionview.js — how the companion is drawn: the figure with what it
   wears, the shelter, the wardrobe, the Home card.

   The figure composites an accessory onto the sprite at an anchor MEASURED
   from that sprite's own alpha (companions-gen.js) — so the hat sits on this
   head at this stage in this mood, not on a typed-in average. A sprite that
   has not been drawn yet falls back to an icon rather than a hole. */

import { CO, ACC } from './companions-gen.js';
import * as co from './companion.js';
import { ico } from './art.js';
import { esc } from './ui.js';
import { money, price } from './fmt.js';

const KIND_ICON = { pup: 'family', kitten: 'family', parrot: 'quest', bunny: 'family', duck: 'family' };

/* ── the figure ───────────────────────────────────────────────────────── */
export function companionFigure(c, size, opts = {}) {
  const p = co.get(c); if (!p) return '';
  const key = co.spriteKey(c);
  const sp = CO[key] || CO[`${p.kind}-${co.STAGES[p.stage]}-okay`] || CO[`${p.kind}-baby-okay`];
  const s = size || 120;
  if (!sp) return `<div class="cofig" style="width:${s}px;height:${s}px">${ico(KIND_ICON[p.kind] || 'quest', '🐾', Math.round(s * 0.6))}</div>`;
  const h = Math.round(s * sp.h / sp.w);
  const worn = Object.values(p.wearing || {}).filter((id) => ACC[id]);
  const layer = (id) => {
    const a = ACC[id], item = co.WARDROBE.find((w) => w.id === id);
    if (!a || !item) return '';
    const anchor = sp.a[item.slot] || sp.a.head;
    /* sized to the measured head, so the same hat fits a duckling and a grown dog */
    const hw = (sp.a.hw || 0.42) * s;
    const aw = Math.round(hw * (item.slot === 'face' ? 0.7 : item.slot === 'neck' ? 0.9 : 0.95));
    const ah = Math.round(aw * a.h / a.w);
    const cx = anchor[0] * s, cy = anchor[1] * h;
    /* a hat sits ON the head-top; a collar hangs FROM the neck; specs sit on the face */
    const top = item.slot === 'head' ? cy - ah * 0.72 : item.slot === 'neck' ? cy - ah * 0.35 : cy - ah * 0.5;
    return `<img src="${a.src}" alt="" style="position:absolute;left:${(cx - aw / 2).toFixed(1)}px;top:${top.toFixed(1)}px;width:${aw}px;height:${ah}px;pointer-events:none">`;
  };
  return `<div class="cofig ${p.mood}${opts.bob ? ' bob' : ''}" style="width:${s}px;height:${h}px;position:relative">
    <img src="${sp.src}" alt="${esc(p.name)}, ${co.STAGES[p.stage]}, ${p.mood}" style="width:${s}px;height:${h}px;display:block">
    ${worn.map(layer).join('')}
  </div>`;
}

/* ── the shelter: five to meet, one to name ───────────────────────────── */
export function shelterView(o) {
  const kinds = Object.keys(co.KINDS);
  const pick = o.pick;
  return `
    <div class="eyebrow">The shelter behind the Jar Shed</div>
    <h2 style="margin:4px 0 6px">Five who need homes</h2>
    <p class="small muted">Taking one home is <b>${money(price(co.C.adopt))}</b>, once. Feeding one is <b>${money(price(co.C.food))} a week</b> — and that is ${money(price(co.C.food) * 52)} a year. Say it to yourself before you say yes.</p>
    <div class="shelter">
      ${kinds.map((k) => {
        const sp = CO[`${k}-baby-happy`] || CO[`${k}-baby-okay`];
        return `<button class="shelf${pick === k ? ' on' : ''}" data-act="shelterPick" data-arg="${k}">
          ${sp ? `<img src="${sp.src}" alt="" style="width:76px;height:${Math.round(76 * sp.h / sp.w)}px">` : `<div style="height:76px;display:grid;place-items:center">${ico(KIND_ICON[k] || 'quest', '🐾', 34)}</div>`}
          <b>${esc(co.KINDS[k].name)}</b></button>`;
      }).join('')}
    </div>
    ${pick ? `<p class="small" style="margin-top:12px">${esc(co.KINDS[pick].line)}</p>
      <label class="small muted" style="display:block;margin-top:12px">What will you call them?</label>
      <input class="field" data-field="petname" maxlength="16" placeholder="${esc(co.KINDS[pick].name)}" value="${esc(o.name || '')}">
      <button class="btn wide" style="margin-top:12px" data-act="adopt">Take ${esc(o.name || 'them')} home · ${money(price(co.C.adopt))}</button>` : ''}
    <button class="btn ghost wide" style="margin-top:10px" data-act="closeOv">Not today</button>`;
}

/* ── the wardrobe: wants, priced ──────────────────────────────────────── */
export function wardrobeView(c) {
  const p = co.get(c); if (!p) return '<p>Nobody at home yet.</p>';
  return `
    <div class="row"><div class="grow"><div class="eyebrow">The wardrobe</div>
      <h2 style="margin:4px 0 0">${esc(p.name)}'s things</h2></div>${companionFigure(c, 96)}</div>
    <p class="small muted" style="margin-top:8px">Every one of these is a want. Buying one is allowed — and it comes out of the same wallet the food does.</p>
    <div class="stack" style="gap:8px;margin-top:12px">
      ${co.WARDROBE.map((w) => {
        const owned = p.wardrobe.includes(w.id), on = p.wearing[w.slot] === w.id, a = ACC[w.id];
        return `<div class="row acc${on ? ' on' : ''}">
          ${a ? `<img src="${a.src}" alt="" style="width:40px;height:${Math.round(40 * a.h / a.w)}px">` : ico('quest', '🎀', 28)}
          <span class="grow" style="min-width:0"><b style="font-size:14px">${esc(w.name)}</b>
            <div class="small muted">${esc(w.line)}</div></span>
          <button class="btn sm ${owned ? 'ghost' : ''}" data-act="buyAcc" data-arg="${w.id}">${owned ? (on ? 'Take off' : 'Wear') : money(price(w.units))}</button>
        </div>`;
      }).join('')}
    </div>
    <p class="small muted" style="margin-top:10px">Wallet: <b>${money(c.money.wallet)}</b></p>
    <button class="btn ghost wide" style="margin-top:10px" data-act="closeOv">Back</button>`;
}

/* ── the Home card ────────────────────────────────────────────────────── */
export function companionCard(c) {
  if (!co.has(c)) return `<div class="card cocard empty">
    <div class="row">${ico('family', '🐾', 30)}<div class="grow">
      <div class="eyebrow">Someone to look after</div>
      <p style="font-weight:800">Five who need homes</p>
      <p class="small muted">The shelter behind the Jar Shed. ${money(price(co.C.adopt))} once, ${money(price(co.C.food))} a week for keeps.</p></div>
      <button class="btn ghost sm" data-act="shelter">Meet them</button></div></div>`;
  const p = co.get(c);
  const can = co.canPlay(c);
  return `<div class="card cocard ${p.mood}">
    <div class="row" style="gap:14px;align-items:flex-start">
      ${companionFigure(c, 118, { bob: p.mood === 'happy' })}
      <div class="grow" style="min-width:0">
        <div class="eyebrow">${esc(co.KINDS[p.kind].name)} · ${co.STAGES[p.stage]} · ${p.paydays} pay ${p.paydays === 1 ? 'day' : 'days'} with you</div>
        <h3 style="margin:2px 0 4px">${esc(p.name)}</h3>
        <p class="small">${esc(co.line(c))}</p>
        <div class="care"><i style="width:${p.care}%"></i></div>
        <div class="small muted" style="margin-top:4px">Food ${money(co.weeklyCost(c))} a week · fed ${p.fedRun} ${p.fedRun === 1 ? 'week' : 'weeks'} running${p.everMissed ? ` · went hungry ${p.everMissed}×` : ''}</div>
      </div>
    </div>
    <div class="row" style="gap:8px;margin-top:12px">
      <button class="btn sm ${can ? '' : 'ghost'}" data-act="play">${can ? 'Play' : 'Played today'}</button>
      <button class="btn ghost sm" data-act="wardrobe">Wardrobe${p.wardrobe.length ? ' · ' + p.wardrobe.length : ''}</button>
    </div>
  </div>`;
}
