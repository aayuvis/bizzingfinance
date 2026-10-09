/* jobgames.js — the Shift engine (docs/12 §3.1).

   A job used to be a button, then a reflex game in four skins (stack, trim, sweep,
   runner) with no money in any of them: a random player in Trim scored 69% of perfect,
   the HUDs froze and two of them never ended. Now every job is one SHIFT — one frame,
   four money-skill templates — and every item in it is a money decision with a right
   answer:

     count   the delivery against the order slip: what is short?
     change  the customer paid; give the change with the fewest coins and notes
     ledger  each receipt is + or −: write the running balance, and spot the line
             on last week's page that does not add up
     route   be there in time: the cheapest way that is not late (fare against minutes),
             and then the walk itself on the map

   The frame every template shares, and why:
   · A shift ENDS: twelve items or ninety seconds of wall-clock time (performance.now
     deltas, never frames), whichever is first. A wrong answer holds with its correction
     until Continue, and the clock waits while it is read (for at most HOLD_MS, so even a
     child who walks away gets an end card).
   · A LIVE HUD: item, right so far and the clock, in the HUD and drawn on the canvas, and
     twelve dots that fill as the shift goes.
   · Its OWN END CARD: the template's "You practised" line and its own capped notice,
     never the last arcade game's (§1.4).
   · Pay is ACCURACY through sim.doJob: right answers out of twelve against par, clamped
     there as it always was, once a day per job. Nothing here is random-for-reward: the
     seed decides what arrives, never what it is worth, and the same seed replays.
   · Easy · Standard · Tricky change the content (jobtable.js), never the pay.
   · BOTH keyboard and touch on every item, drawn on the place's own painting. */

import { esc, sfx, rng } from './ui.js';
import { JOBS } from './content.js';
import { hud, tierPicker, goalList, levelOffer, PERFECT } from './arcade.js';
import * as sim from './sim.js';
import { R } from './runtime.js';
import { money, currency, dayIndex } from './fmt.js';
import { say } from './art.js';
import { pipPose, kidBadge } from './shell.js';
import { fx, plate, backdrop, rr, shadow, crate, ease, still } from './gamefx.js';
import { JOB_GAME, TIER_IDS, TIER_NAME, JOB_TIER_SAYS, SHIFT_ITEMS, SHIFT_MS, SHIFT_PRACTISED, KIND_WORD,
  tierOf, setTier, jobPar, jobKnobs, jobGoals, earnGoals } from './jobtable.js';
export { JOB_GAME };
export { hasJobGame } from './jobtable.js';

const K = () => sim.kid(R.s);
const W = 360, H = 300;
/* how long a correction may hold the clock, and how long a right answer shows */
export const HOLD_MS = 8000, FLASH_MS = 650, WALK_MS = 1100;
const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

/* ── small seeded helpers: everything a shift shows comes from its seed ── */
const int = (r, n) => Math.floor(r() * n);
const pick = (r, a) => a[int(r, a.length)];
function shuffle(r, a) { for (let i = a.length - 1; i > 0; i--) { const j = int(r, i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const LETTERS = 'ABCDE';

/* ── the till: whole coins and notes in the display currency ─────────────
   Whole units only, so every sum is the same sum in ₹, $, £, € and AED (no sub-units to
   misprint), and every set is one where the biggest-first rule gives the fewest pieces. */
const PIECES = {
  INR: [[1, 'c'], [2, 'c'], [5, 'c'], [10, 'c'], [20, 'n']],
  USD: [[1, 'n'], [5, 'n'], [10, 'n'], [20, 'n']],
  GBP: [[1, 'c'], [2, 'c'], [5, 'n'], [10, 'n'], [20, 'n']],
  EUR: [[1, 'c'], [2, 'c'], [5, 'n'], [10, 'n'], [20, 'n']],
  AED: [[1, 'c'], [5, 'n'], [10, 'n'], [20, 'n']],
};
export function tillPieces(n) { const all = PIECES[currency()] || PIECES.INR; return all.slice(0, Math.max(2, Math.min(all.length, n))); }
/* the fewest pieces that make `amount` (worked out, not assumed), biggest first */
export function fewest(amount, denoms) {
  const best = [[]];
  for (let a = 1; a <= amount; a++) {
    let b = null;
    for (const d of denoms) if (d <= a && best[a - d] && (!b || best[a - d].length + 1 < b.length)) b = best[a - d].concat(d);
    best[a] = b;
  }
  return (best[amount] || []).slice().sort((x, y) => y - x);
}
const sum = (a) => a.reduce((t, x) => t + x, 0);

/* ── drawing helpers ────────────────────────────────────────────────────
   Text on the canvas is the app's own face, outlined, because it sits on a painting. */
const dark = () => !!R.dark;
function label(ctx, text, x, y, { size = 15, color, align = 'center', weight = 800, serif = false, stroke } = {}) {
  ctx.font = `${weight} ${size}px ${serif ? 'Fraunces, Georgia, serif' : 'Sono, ui-monospace, monospace'}`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, size / 3.6);
  ctx.strokeStyle = stroke || (dark() ? 'rgba(10,14,24,.92)' : 'rgba(255,252,245,.96)');
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color || (dark() ? '#FFF6DA' : '#1C2A2E');
  ctx.fillText(text, x, y);
}
/* ink on paper: no outline, always dark (paper is paper at night too) */
function ink(ctx, text, x, y, { size = 13, color = '#2A2016', align = 'left', weight = 700, serif = false } = {}) {
  ctx.font = `${weight} ${size}px ${serif ? 'Fraunces, Georgia, serif' : 'Sono, ui-monospace, monospace'}`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(text, x, y);
}
function pill(ctx, text, x, y, { warn = false } = {}) {
  ctx.font = '800 12px Sono, ui-monospace, monospace';
  const w = ctx.measureText(text).width + 16;
  ctx.fillStyle = warn ? 'rgba(196,69,60,.92)' : (dark() ? 'rgba(10,14,24,.78)' : 'rgba(255,252,245,.9)');
  rr(ctx, x - w, y, w, 20, 10); ctx.fill();
  ctx.fillStyle = warn ? '#fff' : (dark() ? '#FFF6DA' : '#1C2A2E');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x - w / 2, y + 10.5);
  return w;
}
function night(ctx, a = 0.2) { if (!dark()) return; ctx.fillStyle = `rgba(16,22,48,${a})`; ctx.fillRect(0, 0, W, H); }
function cobbles(ctx, y0, h) {
  ctx.fillStyle = '#9C8A6C'; ctx.fillRect(0, y0, W, h);
  const rowH = 10, cw = 22, tones = ['#BCAA88', '#B4A17E', '#C2B08E', '#B09D7A'];
  for (let r = 0; r * rowH < h; r++) {
    const y = y0 + r * rowH, off = (r % 2) * 11;
    for (let x = off - cw, k = 0; x < W + cw; x += cw, k++) { ctx.fillStyle = tones[(k + r * 3) % 4]; rr(ctx, x + 1, y + 1, cw - 2, rowH - 2, 3.5); ctx.fill(); }
  }
  ctx.fillStyle = 'rgba(255,240,210,.22)'; ctx.fillRect(0, y0, W, 2);
}
function paper(ctx, x, y, w, h, rot = 0) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(40,24,8,.18)'; rr(ctx, -w / 2 + 3, -h / 2 + 4, w, h, 6); ctx.fill();
  ctx.fillStyle = '#FFF8E6'; rr(ctx, -w / 2, -h / 2, w, h, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(120,90,50,.35)'; ctx.lineWidth = 1.2; rr(ctx, -w / 2 + .5, -h / 2 + .5, w - 1, h - 1, 6); ctx.stroke();
  ctx.restore();
}
/* the twelve dots: the shift so far, at a glance (green right, red wrong, grey to come) */
function dots(ctx, results, i) {
  const x0 = 10, y = 18;
  ctx.fillStyle = dark() ? 'rgba(10,14,24,.78)' : 'rgba(255,252,245,.9)'; rr(ctx, x0 - 6, 8, SHIFT_ITEMS * 12 + 8, 20, 10); ctx.fill();
  for (let k = 0; k < SHIFT_ITEMS; k++) {
    const r = results[k];
    ctx.beginPath(); ctx.arc(x0 + 4 + k * 12, y, k === i && r == null ? 4.6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = r === true ? '#2FA866' : r === false ? '#D2453A' : (dark() ? 'rgba(255,255,255,.28)' : 'rgba(28,42,46,.22)');
    ctx.fill();
    if (k === i && r == null) { ctx.strokeStyle = dark() ? '#FFF6DA' : '#1C2A2E'; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
}
const clockText = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/* the things a delivery is made of */
function sack(ctx, x, y, w, h, tint) {
  ctx.fillStyle = tint; rr(ctx, x, y + 1, w, h - 1, Math.min(9, w / 3)); ctx.fill();
  ctx.strokeStyle = 'rgba(90,64,30,.7)'; ctx.lineWidth = 1.6; rr(ctx, x + .8, y + 1.8, w - 1.6, h - 2.6, Math.min(9, w / 3)); ctx.stroke();
  ctx.fillStyle = 'rgba(90,64,30,.55)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 3, 4, 2.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,245,220,.35)'; rr(ctx, x + 3, y + 4, w - 6, 3, 2); ctx.fill();
}
function barrel(ctx, x, y, w, h, tint) {
  ctx.fillStyle = tint; rr(ctx, x, y, w, h, Math.min(8, w / 3)); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.12)'; rr(ctx, x + w * .66, y, w * .34, h, Math.min(8, w / 3)); ctx.fill();
  ctx.strokeStyle = '#4E4A48'; ctx.lineWidth = 2.2;
  for (const k of [0.22, 0.78]) { ctx.beginPath(); ctx.moveTo(x + 1, y + h * k); ctx.lineTo(x + w - 1, y + h * k); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(70,40,10,.45)'; ctx.lineWidth = 1.2; rr(ctx, x + .6, y + .6, w - 1.2, h - 1.2, Math.min(8, w / 3)); ctx.stroke();
  ctx.fillStyle = 'rgba(255,240,200,.35)'; ctx.fillRect(x + 4, y + 2, w - 8, 2);
}
const LOOK_TINT = { crate: ['#C98A46', '#B9773A', '#D49B57', '#A86B34'], sack: ['#CDB07A', '#BFA06A', '#D8BD88', '#C4A572'], barrel: ['#9A6236', '#8A5530', '#A86D3E', '#7E4E2C'] };
function piece(ctx, look, x, y, w, h, t) {
  const tint = LOOK_TINT[look][t % 4];
  if (look === 'sack') sack(ctx, x, y, w, h, tint); else if (look === 'barrel') barrel(ctx, x, y, w, h, tint); else crate(ctx, x, y, w, h, tint);
}
/* a customer: ordinary and various — the colours come from the seed */
const SKIN = ['#F1C9A5', '#E0AC84', '#C68B5E', '#A86B43', '#8A5534', '#5E3A22'];
const SHIRT = ['#2E7FA8', '#C4453C', '#178A4C', '#8E5BB0', '#E0A23A', '#3C6E8F', '#B5546E'];
const HAIR = ['#1E1712', '#3B2A1E', '#6B4A2E', '#9A9A9A', '#2A2A2A'];
function person(ctx, x, y, p) {
  shadow(ctx, x, y + 6, 70, 0.18);
  ctx.fillStyle = p.shirt; rr(ctx, x - 28, y - 64, 56, 76, 20); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(ctx, x - 20, y - 58, 12, 40, 6); ctx.fill();
  ctx.fillStyle = p.skin; ctx.fillRect(x - 6, y - 72, 12, 10);
  ctx.beginPath(); ctx.arc(x, y - 86, 19, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = p.hair; ctx.beginPath();
  if (p.long) { ctx.arc(x, y - 88, 21, Math.PI * 0.95, Math.PI * 2.05); ctx.lineTo(x + 21, y - 70); ctx.lineTo(x + 14, y - 80); ctx.lineTo(x - 14, y - 80); ctx.lineTo(x - 21, y - 70); }
  else ctx.arc(x, y - 89, 20, Math.PI * 1.02, Math.PI * 1.98);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1C1410'; ctx.beginPath(); ctx.arc(x - 7, y - 86, 2, 0, Math.PI * 2); ctx.arc(x + 7, y - 86, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5A2E1E'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(x, y - 80, 6, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
}
const personOf = (r) => ({ skin: pick(r, SKIN), shirt: pick(r, SHIRT), hair: pick(r, HAIR), long: r() < 0.5 });
/* a coin or a note, its value in the app's own face */
function cash(ctx, x, y, v, kind, s = 1) {
  if (kind === 'n') {
    const w = 46 * s, h = 25 * s;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; rr(ctx, x - w / 2 + 2, y - h / 2 + 2, w, h, 4); ctx.fill();
    ctx.fillStyle = v >= 50 ? '#6E9FC9' : v >= 20 ? '#E3A867' : v >= 10 ? '#C9A2D8' : '#8CC49A'; rr(ctx, x - w / 2, y - h / 2, w, h, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(30,40,40,.45)'; ctx.lineWidth = 1.2; rr(ctx, x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6, 3); ctx.stroke();
    ink(ctx, money(v), x, y + 0.5, { size: Math.round(11 * s), align: 'center', weight: 800, color: '#1C2A2E' });
  } else {
    const rad = (v >= 10 ? 15 : v >= 5 ? 14 : 12.5) * s;
    ctx.fillStyle = '#8A6A1E'; ctx.beginPath(); ctx.arc(x, y + 2, rad, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = v >= 5 ? '#F0B429' : '#D9DCDE'; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,0,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, rad - 3, 0, Math.PI * 2); ctx.stroke();
    ink(ctx, money(v), x, y + 0.5, { size: Math.round(10 * s), align: 'center', weight: 800, color: '#2A2016' });
  }
}

/* ══ the four templates ════════════════════════════════════════════════
   Each one: make (content from the seed) · check · solve (what a careful player does,
   for the headless tests) · explain (the correction a wrong answer holds with) ·
   draw · prompt/controls (DOM, touch) · key (keyboard). */

/* ── count · the delivery against the slip ── */
function countLayout(r, n, layout) {
  const out = [];
  if (layout === 'rows') {
    const w = 34, h = 28, gap = 6, x0 = (W - (5 * w + 4 * gap)) / 2;
    for (let k = 0; k < n; k++) out.push({ x: x0 + (k % 5) * (w + gap), y: 226 - Math.floor(k / 5) * (h + 6), w, h, t: k });
  } else if (layout === 'loose') {
    const cols = 6, rows = 3, cw = 48, ch = 34, x0 = (W - cols * cw) / 2 + 4;
    const cells = shuffle(r, Array.from({ length: cols * rows }, (_, k) => k)).slice(0, n).sort((a, b) => a - b);
    for (const c of cells) out.push({ x: x0 + (c % cols) * cw + int(r, 7) - 3, y: 158 + Math.floor(c / cols) * ch + int(r, 5) - 2, w: 36, h: 28, t: int(r, 4) });
  } else {
    let rem = n; const cols = [];
    while (rem > 0) {
      const left = 8 - cols.length, minH = Math.max(1, Math.ceil(rem / left)), maxH = Math.min(4, rem);
      const h = minH + int(r, maxH - minH + 1); cols.push(h); rem -= h;
    }
    shuffle(r, cols);
    const cw = 40, x0 = (W - cols.length * cw) / 2 + 3;
    cols.forEach((h, c) => { for (let k = 0; k < h; k++) out.push({ x: x0 + c * cw, y: 236 - k * 26, w: 34, h: 25, t: int(r, 4) }); });
  }
  return out;
}
const COUNT = {
  make(r, kn) {
    let ordered, packs = null;
    if (kn.packs && r() < 0.6) { const m = r() < 0.5 ? 4 : 6; const k = m === 4 ? 3 + int(r, 4) : 2 + int(r, 3); ordered = k * m; packs = { k, m }; }
    else ordered = kn.min + int(r, kn.max - kn.min + 1);
    const short = int(r, kn.short + 1), n = ordered - short;
    return { ordered, packs, short, n, choices: kn.short + 1, pos: countLayout(r, n, kn.layout) };
  },
  check: (it, s) => ({ right: s === it.short, flag: s === it.short && it.short > 0 }),
  solve: (it) => it.short,
  random: (it, r) => int(r, it.choices),
  explain: (it, s, cfg) => `${it.packs ? `${it.packs.k} packs of ${it.packs.m} is ${it.ordered}. ` : ''}Ordered ${it.ordered}, came ${it.n}: ${it.short ? `short by ${it.short}` : 'all here'}${s != null ? `, not ${s ? s + ' short' : 'all here'}` : ''}.`,
  praise: (it) => (it.short ? `short by ${it.short}, flagged` : 'all here, signed for'),
  describe: (it, cfg) => `A delivery of ${cfg.noun} and the order slip: ${it.packs ? `${it.packs.k} packs of ${it.packs.m}` : it.ordered + ' ordered'}. ${it.n} ${cfg.noun} came.`,
  prompt: (it, cfg) => `Count the ${cfg.noun} that came. <b>What is short?</b>`,
  controls: (it, st, busy) => `<div class="shiftopts" role="group" aria-label="What is short">${Array.from({ length: it.choices }, (_, k) =>
    `<button class="btn ghost shiftopt" data-act="jgPick" data-arg="${k}"${busy ? ' disabled' : ''}><span class="tk">${k}</span>${k ? `${k} short` : 'All here'}</button>`).join('')}</div>`,
  hint: 'Tap an answer, or press 0 for all here and 1–6 for how many are short.',
  key(e, it, api) { const d = +e.key; if (e.key.length === 1 && d >= 0 && d < it.choices) api.answer(d); },
  act(n, arg, it, api) { if (n === 'jgPick') api.answer(+arg); },
  draw(ctx, it, st, cfg) {
    const dock = cfg.look === 'barrel';
    if (dock) {
      ctx.fillStyle = dark() ? '#1E3550' : '#4E8DB0'; ctx.fillRect(0, 272, W, 28);
      ctx.fillStyle = '#8A6640'; ctx.fillRect(0, 262, W, 12);
      ctx.fillStyle = 'rgba(60,36,14,.5)'; for (let x = 0; x < W; x += 30) ctx.fillRect(x, 262, 2, 12);
    } else cobbles(ctx, 262, 38);
    const reveal = st.hold || st.flash > 0;
    for (let k = 0; k < it.pos.length; k++) {
      const p = it.pos[k];
      shadow(ctx, p.x + p.w / 2, p.y + p.h + 1, p.w + 6, 0.1);
      piece(ctx, cfg.look, p.x, p.y, p.w, p.h, p.t);
    }
    /* a correction counts them out loud: a number on each one */
    if (reveal) it.pos.forEach((p, k) => label(ctx, String(k + 1), p.x + p.w / 2, p.y + p.h / 2, { size: 11, color: '#3A2400', stroke: '#FFF3C4' }));
    paper(ctx, 12, 38, 132, 64, -0.035);
    ctx.save(); ctx.translate(78, 70); ctx.rotate(-0.035);
    ink(ctx, 'ORDER SLIP', -56, -20, { size: 10, color: '#8A5A3C', weight: 800 });
    ink(ctx, it.packs ? `${it.packs.k} packs of ${it.packs.m}` : `${it.ordered} ${cfg.noun}`, -56, 0, { size: it.packs ? 15 : 17, serif: true, weight: 800 });
    ink(ctx, 'signed for on arrival', -56, 19, { size: 9, color: '#6B5A48', weight: 600 });
    ctx.restore();
  },
};

/* ── change · the fewest coins and notes ── */
const GOODS = {
  counter: ['a tin of beans', 'a loaf', 'a jar of honey', 'a bag of rice', 'a bar of soap', 'a pot of jam'],
  runner: ['two teas', 'a lunch box', 'a plate of samosas', 'a sandwich', 'a bowl of soup', 'three buns'],
  board: ['a melon', 'six eggs', 'a bunch of bananas', 'a bag of onions', 'a punnet of plums', 'a cabbage'],
};
const CHANGE = {
  make(r, kn, cfg, jobId) {
    const P = tillPieces(kn.coins), D = P.map((p) => p[0]);
    let change = 1 + int(r, kn.max);
    for (let k = 0; k < 6 && kn.coins > 3 && fewest(change, D).length < 2; k++) change = 1 + int(r, kn.max);
    const notes = [10, 20, 50, 100].filter((n) => n > change);
    const note = notes[int(r, Math.min(2, notes.length))];
    const price = note - change;
    let paid = note, extra = 0;
    /* Tricky: "can you give me 15 back?" — they add the odd coin so the change comes out round */
    if (kn.odd && r() < 0.45) { const e = price % 5; if (e && D.includes(e)) { extra = e; paid = note + extra; change += extra; } }
    return { price, paid, note, extra, change, D, P, best: fewest(change, D), goods: pick(r, GOODS[jobId] || GOODS.counter), who: personOf(r) };
  },
  check(it, tray) { const s = sum(tray); return { right: s === it.change && tray.length === it.best.length, over: s > it.change }; },
  solve: (it) => it.best.slice(),
  random(it, r) { const n = 1 + int(r, 5); return Array.from({ length: n }, () => pick(r, it.D)); },
  explain(it, tray) {
    const s = sum(tray), base = `${money(it.paid)} − ${money(it.price)} = ${money(it.change)} back: ${it.best.map((v) => money(v)).join(' + ')}`;
    if (s === it.change) return `${base}. The right amount, but ${it.best.length} piece${it.best.length > 1 ? 's do' : ' does'} it, not ${tray.length}.`;
    return `${base}. You gave ${money(s)}${s > it.change ? ': too much' : ': not enough'}.`;
  },
  praise: (it) => `${money(it.change)} back in ${it.best.length}`,
  describe: (it) => `A customer buys ${it.goods} for ${money(it.price)} and pays ${money(it.paid)}.`,
  prompt: (it) => `${esc(it.goods.replace(/^./, (c) => c.toUpperCase()))}: <b>${money(it.price)}</b>. They pay <b>${money(it.paid)}</b>. Give the change, <b>fewest pieces</b>.`,
  controls: (it, st, busy) => `<div class="shiftopts coins" role="group" aria-label="The till">${it.P.map(([v, k], i) =>
      `<button class="btn ghost shiftopt coin ${k === 'n' ? 'note' : ''}" data-act="jgCoin" data-arg="${v}"${busy ? ' disabled' : ''}><span class="tk">${i + 1}</span>${money(v)}</button>`).join('')}</div>
    <div class="row shiftgive"><span class="grow small" aria-live="polite">In the tray: <b class="tabnum">${money(sum(st.tray))}</b> in ${st.tray.length} piece${st.tray.length === 1 ? '' : 's'}</span>
      <button class="btn ghost sm" data-act="jgUndo"${busy || !st.tray.length ? ' disabled' : ''}>Undo</button>
      <button class="btn sm" data-act="jgGive"${busy || !st.tray.length ? ' disabled' : ''}>Give change</button></div>`,
  hint: 'Tap coins and notes, then Give. Or press 1–5 to add, Backspace to take one back, Enter to give.',
  key(e, it, api) {
    const d = +e.key;
    if (e.key.length === 1 && d >= 1 && d <= it.D.length) api.coin(it.D[d - 1]);
    else if (e.key === 'Backspace' || e.key === 'Delete') api.undo();
    else if (e.key === 'Enter') api.give();
  },
  act(n, arg, it, api) { if (n === 'jgCoin') api.coin(+arg); else if (n === 'jgUndo') api.undo(); else if (n === 'jgGive') api.give(); },
  draw(ctx, it, st) {
    /* a shop wall: shelves behind, the customer, the counter in front */
    ctx.fillStyle = dark() ? 'rgba(60,40,24,.55)' : 'rgba(150,104,60,.5)';
    for (const y of [70, 120]) ctx.fillRect(176, y, 176, 5);
    for (let k = 0; k < 7; k++) { ctx.fillStyle = SHIRT[k % SHIRT.length]; rr(ctx, 184 + k * 24, 52, 15, 18, 3); ctx.fill(); rr(ctx, 188 + k * 24, 100, 13, 20, 3); ctx.fill(); }
    person(ctx, 92, 196, it.who);
    ctx.fillStyle = '#8F6236'; rr(ctx, 0, 190, W, 12, 3); ctx.fill();
    ctx.fillStyle = '#A8763F'; ctx.fillRect(0, 202, W, 98);
    ctx.fillStyle = 'rgba(255,230,190,.25)'; ctx.fillRect(0, 191, W, 2);
    ctx.strokeStyle = 'rgba(70,40,10,.3)'; ctx.lineWidth = 2; ctx.strokeRect(14, 214, 150, 74); ctx.strokeRect(196, 214, 150, 74);
    /* what they pay with, held out over the counter */
    cash(ctx, 150, 168, it.note, 'n', 1.15);
    if (it.extra) { const k = (PIECES[currency()] || PIECES.INR).find((p) => p[0] === it.extra); cash(ctx, 150, 196, it.extra, k ? k[1] : 'c'); }
    /* the price tag on the thing they are buying */
    paper(ctx, 196, 146, 92, 38, 0.05);
    ctx.save(); ctx.translate(242, 165); ctx.rotate(0.05);
    ink(ctx, it.goods.length > 14 ? it.goods.slice(0, 13) + '…' : it.goods, 0, -8, { size: 9.5, align: 'center', color: '#6B5A48', weight: 650 });
    ink(ctx, money(it.price), 0, 8, { size: 16, align: 'center', serif: true, weight: 800 });
    ctx.restore();
    /* the tray: what you have counted out so far */
    ctx.fillStyle = 'rgba(40,24,8,.28)'; rr(ctx, 186, 216, 162, 72, 12); ctx.fill();
    ctx.fillStyle = dark() ? '#3B3226' : '#E8D9BC'; rr(ctx, 190, 220, 154, 64, 10); ctx.fill();
    const tray = st.hold ? it.best : st.tray;
    if (!tray.length) ink(ctx, 'the tray', 267, 252, { size: 11, align: 'center', color: dark() ? '#BFAE90' : '#8A7A60', weight: 650 });
    const kind = (v) => ((PIECES[currency()] || PIECES.INR).find((p) => p[0] === v) || [0, 'c'])[1];
    tray.slice(0, 10).forEach((v, k) => cash(ctx, 210 + (k % 5) * 29, 238 + Math.floor(k / 5) * 28, v, kind(v), 0.8));
    if (tray.length > 10) ink(ctx, `+${tray.length - 10}`, 336, 276, { size: 11, align: 'right' });
    if (st.hold) label(ctx, 'the fewest', 267, 210, { size: 11, color: '#11663A' });
  },
};

/* ── ledger · the running balance, and the line that does not add up ── */
const LINES = {
  books: { plus: ['Sold teas', 'Sold samosas', 'A tab paid', 'Sold a cake', 'Sold biscuits'], minus: ['Milk', 'Sugar', 'Gas for the stove', 'Paper cups', 'Tea leaves'] },
  nets: { plus: ['Sold a net', 'Mended a net', 'Sold floats', 'A skipper paid'], minus: ['Twine', 'Rope', 'Tar', 'A new needle', 'Cork'] },
  mend: { plus: ['Mended an umbrella', 'New spokes fitted', 'A handle glued', 'Sold a brolly'], minus: ['Spokes', 'Cloth', 'Thread', 'Glue', 'Handles'] },
};
const LEDGER = {
  makeAll(r, kn, cfg, jobId) {
    const L = LINES[jobId] || LINES.books, out = [];
    const checkAt = new Set(kn.checks >= 3 ? [3, 7, 11] : kn.checks === 2 ? [5, 11] : [11]);
    let bal = kn.open; const book = [];
    for (let i = 0; i < SHIFT_ITEMS; i++) {
      if (checkAt.has(i)) {
        /* last week's page: one line where the written balance does not follow */
        let prev = kn.open + int(r, kn.amt * 2);
        const start = prev, wrong = int(r, 4), lines = [];
        for (let j = 0; j < 4; j++) {
          let sign = r() < 0.55 ? 1 : -1; const amt = 1 + int(r, kn.amt);
          if (sign < 0 && amt > prev) sign = 1;
          let shown = prev + sign * amt;
          const right = shown;
          if (j === wrong) {
            if (sign < 0 && r() < 0.35) shown = prev + amt;     /* taken away, but added */
            else { let d = 1 + int(r, 9); if (r() < 0.5 && shown - d >= 0) d = -d; shown += d; }
          }
          lines.push({ desc: pick(r, sign > 0 ? L.plus : L.minus), sign, amt, prev, shown, right });
          prev = shown;
        }
        out.push({ mode: 'check', start, lines, wrong, choices: 4 });
      } else {
        let sign = r() < 0.55 ? 1 : -1; const amt = 1 + int(r, kn.amt);
        if (sign < 0 && amt > bal) sign = 1;
        const line = { mode: 'type', desc: pick(r, sign > 0 ? L.plus : L.minus), sign, amt, prev: bal, answer: bal + sign * amt, open: kn.open, before: book.slice(-3) };
        out.push(line); book.push(line); bal = line.answer;
      }
    }
    return out;
  },
  check(it, v) { return it.mode === 'check' ? { right: v === it.wrong, spot: v === it.wrong } : { right: v === it.answer }; },
  solve: (it) => (it.mode === 'check' ? it.wrong : it.answer),
  random(it, r) { return it.mode === 'check' ? int(r, 4) : int(r, it.prev + it.amt * 2 + 1); },
  explain(it, v) {
    if (it.mode === 'check') { const l = it.lines[it.wrong];
      return `Line ${LETTERS[it.wrong]}: ${money(l.prev)} ${l.sign > 0 ? '+' : '−'} ${money(l.amt)} is ${money(l.right)}, not ${money(l.shown)}.`; }
    return `${money(it.prev)} ${it.sign > 0 ? '+' : '−'} ${money(it.amt)} = ${money(it.answer)}${v != null && !Number.isNaN(v) ? `, not ${money(v)}` : ''}.`;
  },
  praise: (it) => (it.mode === 'check' ? `line ${LETTERS[it.wrong]} was out` : `${money(it.answer)} carried`),
  describe: (it) => (it.mode === 'check' ? `Last week's page: four lines, A to D. ${it.lines.map((l, j) => `${LETTERS[j]}: ${l.desc}, ${l.sign > 0 ? 'plus' : 'minus'} ${l.amt}, balance ${l.shown}.`).join(' ')}`
    : `Balance ${it.prev}. New line: ${it.desc}, ${it.sign > 0 ? 'plus' : 'minus'} ${it.amt}.`),
  prompt: (it) => (it.mode === 'check' ? 'Last week\'s page. <b>Which line does not add up?</b>'
    : `${esc(it.desc)}: <b>${it.sign > 0 ? '+' : '−'}${money(it.amt)}</b>. <b>What is the balance now?</b>`),
  controls(it, st, busy) {
    if (it.mode === 'check') return `<div class="shiftopts" role="group" aria-label="Which line">${it.lines.map((l, j) =>
      `<button class="btn ghost shiftopt" data-act="jgPick" data-arg="${j}"${busy ? ' disabled' : ''}><span class="tk">${LETTERS[j]}</span>Line ${LETTERS[j]}</button>`).join('')}</div>`;
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
    return `<div class="row shiftentry"><span class="grow small">Balance:</span><b class="tabnum shiftval" aria-live="polite">${st.entry ? money(+st.entry) : '…'}</b></div>
      <div class="shiftpad" role="group" aria-label="Number pad">${keys.map((k) => k === 'del'
        ? `<button class="btn ghost" data-act="jgDel"${busy ? ' disabled' : ''} aria-label="Delete">⌫</button>`
        : k === 'ok' ? `<button class="btn" data-act="jgEnter"${busy || !st.entry ? ' disabled' : ''}>Write it</button>`
        : `<button class="btn ghost" data-act="jgDigit" data-arg="${k}"${busy ? ' disabled' : ''}>${k}</button>`).join('')}</div>`;
  },
  hint: 'Type the balance and press Enter, or use the pad. On last week\'s page, press A–D or tap the line.',
  key(e, it, api) {
    if (it.mode === 'check') { const k = e.key.toLowerCase(), j = 'abcd'.indexOf(k) >= 0 ? 'abcd'.indexOf(k) : '1234'.indexOf(k); if (k.length === 1 && j >= 0) api.answer(j); return; }
    if (e.key.length === 1 && e.key >= '0' && e.key <= '9') api.digit(e.key);
    else if (e.key === 'Backspace' || e.key === 'Delete') api.del();
    else if (e.key === 'Enter') api.enter();
  },
  act(n, arg, it, api) {
    if (n === 'jgPick' && it.mode === 'check') api.answer(+arg);
    else if (n === 'jgDigit') api.digit(String(arg));
    else if (n === 'jgDel') api.del();
    else if (n === 'jgEnter') api.enter();
  },
  /* a tap on a line of last week's page */
  point(x, y, it, api) { if (it.mode !== 'check') return; const j = Math.floor((y - 116) / 34); if (j >= 0 && j < 4 && x > 16 && x < 344) api.answer(j); },
  draw(ctx, it, st) {
    paper(ctx, 14, 36, 332, 240, 0);
    ctx.strokeStyle = 'rgba(196,69,60,.45)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(44, 40); ctx.lineTo(44, 272); ctx.stroke();
    ctx.strokeStyle = 'rgba(46,127,168,.22)'; ctx.lineWidth = 1;
    for (let y = 82; y < 272; y += 34) { ctx.beginPath(); ctx.moveTo(18, y); ctx.lineTo(342, y); ctx.stroke(); }
    const col = (x) => { ctx.strokeStyle = 'rgba(120,90,50,.25)'; ctx.beginPath(); ctx.moveTo(x, 50); ctx.lineTo(x, 272); ctx.stroke(); };
    col(232); col(272);
    ink(ctx, it.mode === 'check' ? "LAST WEEK'S PAGE" : 'THE BOOK', 52, 62, { size: 10, color: '#8A5A3C', weight: 800 });
    ink(ctx, 'in/out', 252, 62, { size: 9, align: 'center', color: '#8A5A3C' });
    ink(ctx, 'balance', 336, 62, { size: 9, align: 'right', color: '#8A5A3C' });
    const row = (j, desc, signed, bal, { hi = null, tag = '' } = {}) => {
      const y = 99 + j * 34;
      if (hi) { ctx.fillStyle = hi; ctx.fillRect(18, y - 16, 324, 32); }
      if (tag) ink(ctx, tag, 30, y, { size: 13, align: 'center', weight: 800, color: '#2E5F7A' });
      ink(ctx, desc.length > 21 ? desc.slice(0, 20) + '…' : desc, 52, y, { size: 12, weight: 650 });
      if (signed) ink(ctx, signed, 266, y, { size: 12, align: 'right', color: signed[0] === '+' ? '#11663A' : '#A3342C', weight: 800 });
      ink(ctx, bal, 336, y, { size: 13, align: 'right', weight: 800 });
    };
    if (it.mode === 'check') {
      row(0, 'Brought forward', '', money(it.start));
      it.lines.forEach((l, j) => {
        const show = st.hold || st.flash > 0;
        row(j + 1, l.desc, `${l.sign > 0 ? '+' : '−'}${l.amt}`, money(l.shown), { tag: LETTERS[j], hi: show && j === it.wrong ? 'rgba(210,69,58,.18)' : null });
        if (show && j === it.wrong) ink(ctx, `should be ${money(l.right)}`, 226, 99 + (j + 1) * 34 + 11, { size: 9, align: 'right', color: '#A3342C' });
      });
      return;
    }
    const lines = it.before;
    row(0, lines.length ? 'Carried' : 'Opening balance', '', money(lines.length ? lines[0].prev : it.open));
    lines.forEach((l, j) => row(j + 1, l.desc, `${l.sign > 0 ? '+' : '−'}${l.amt}`, money(l.answer)));
    const j = lines.length + 1, y = 99 + j * 34;
    const blink = still() || Math.floor(st.T / 500) % 2 === 0;
    const val = st.hold ? money(it.answer) : st.entry ? money(+st.entry) + (blink ? '▏' : ' ') : (blink ? '?' : ' ');
    ctx.fillStyle = st.hold ? 'rgba(210,69,58,.14)' : 'rgba(240,180,41,.22)'; ctx.fillRect(18, y - 16, 324, 32);
    row(j, it.desc, `${it.sign > 0 ? '+' : '−'}${it.amt}`, val);
  },
};

/* ── route · fare against the clock, then walk it ── */
const MODES = {
  walk: { name: 'Walk', min: [14, 40], fare: [0, 0], col: '#8A5A3C', dash: [2, 6], w: 3.5 },
  bus:  { name: 'Bus', min: [6, 15], fare: [2, 5], col: '#C4453C', dash: [], w: 5 },
  bike: { name: 'Hire a bike', min: [8, 17], fare: [3, 7], col: '#178A4C', dash: [8, 5], w: 4 },
  cab:  { name: 'Cab', min: [4, 9], fare: [9, 15], col: '#D9962A', dash: [], w: 5 },
  tram: { name: 'Tram', min: [5, 12], fare: [3, 6], col: '#2E7FA8', dash: [12, 4], w: 5 },
};
const STOPS = {
  flyers: ['No. 3, Kiln Lane', 'No. 14, Well Street', 'No. 27, the Crescent', 'No. 8, Mill Row', 'No. 40, Hill Road', 'No. 19, Ferry Lane'],
  errands: ['the bank', 'the post office', 'the clocktower', 'the tailor', 'the library', 'the station'],
  sweep: ['the fountain', 'the fish stalls', 'the far end of the Row', 'the spice stalls', 'the well', 'the bandstand'],
  lamplight: ['the pier lamp', 'the boathouse', 'the harbour steps', 'the lighthouse path', 'the net sheds', 'the slipway'],
};
const legText = (l) => `${MODES[l.m].name} ${l.min} min${l.fare ? ` (${money(l.fare)})` : ''}`;
const ROUTE = {
  walks: true,
  make(r, kn, cfg, jobId) {
    const modes = ['bus', 'bike', 'cab'].concat(kn.tram ? ['tram'] : []);
    const leg = (m, nl) => { const M = MODES[m], k = nl > 1 ? 0.6 : 1;
      return { m, min: Math.max(2, Math.round((M.min[0] + int(r, M.min[1] - M.min[0] + 1)) * k)), fare: M.fare[0] + int(r, M.fare[1] - M.fare[0] + 1) }; };
    for (let attempt = 0; attempt < 400; attempt++) {
      const opts = [{ legs: [leg('walk', 1)] }];
      while (opts.length < kn.opts) {
        const nl = 1 + int(r, kn.legs), legs = [];
        for (let k = 0; k < nl; k++) legs.push(leg(nl > 1 && k === 0 && r() < 0.6 ? 'walk' : pick(r, modes), nl));
        opts.push({ legs });
      }
      opts.forEach((o) => { o.min = sum(o.legs.map((l) => l.min)); o.fare = sum(o.legs.map((l) => l.fare)); });
      if (new Set(opts.map((o) => o.min)).size < opts.length || new Set(opts.map((o) => o.fare)).size < opts.length) continue;
      const mins = opts.map((o) => o.min).sort((a, b) => a - b);
      const k = 1 + int(r, opts.length - 2);
      if (mins[k + 1] - mins[k] < 2) continue;
      const due = mins[k] + 1 + int(r, mins[k + 1] - mins[k] - 1);
      const on = opts.filter((o) => o.min <= due);
      const best = on.reduce((b, o) => (o.fare < b.fare ? o : b), on[0]);
      const cheapest = opts.reduce((b, o) => (o.fare < b.fare ? o : b), opts[0]);
      const fastest = opts.reduce((b, o) => (o.min < b.min ? o : b), opts[0]);
      /* the free walk is usually too slow, and the quickest is usually not the cheapest on time:
         so neither "always walk" nor "always the fastest" is a way to play this */
      if (cheapest.min <= due && r() > 0.2) continue;
      if (fastest === best && r() > 0.2) continue;
      shuffle(r, opts);
      return { opts, due, answer: opts.indexOf(best), dest: pick(r, STOPS[jobId] || STOPS.errands), choices: opts.length };
    }
    /* never reached in practice (the tests replay thousands); a plain, valid item if it were */
    const opts = [{ legs: [{ m: 'walk', min: 30, fare: 0 }] }, { legs: [{ m: 'bus', min: 10, fare: 3 }] }, { legs: [{ m: 'cab', min: 6, fare: 12 }] }, { legs: [{ m: 'bike', min: 25, fare: 4 }] }].slice(0, kn.opts);
    opts.forEach((o) => { o.min = o.legs[0].min; o.fare = o.legs[0].fare; });
    return { opts, due: 20, answer: 1, dest: 'the bank', choices: opts.length };
  },
  check(it, v) { const o = it.opts[v]; return { right: v === it.answer, late: !!o && o.min > it.due }; },
  solve: (it) => it.answer,
  random: (it, r) => int(r, it.choices),
  explain(it, v) {
    const o = it.opts[v], a = it.opts[it.answer];
    const tail = `${LETTERS[it.answer]} is the cheapest that is on time: ${a.min} min, ${a.fare ? money(a.fare) : 'free'}.`;
    if (!o) return tail;
    return o.min > it.due ? `${LETTERS[v]} takes ${o.min} min: late. ${tail}` : `${LETTERS[v]} is on time, but costs ${money(o.fare)}. ${tail}`;
  },
  praise: (it) => { const a = it.opts[it.answer]; return `on time for ${a.fare ? money(a.fare) : 'nothing'}`; },
  describe: (it) => `Be at ${it.dest} within ${it.due} minutes. ${it.opts.map((o, j) => `${LETTERS[j]}: ${o.legs.map(legText).join(', then ')}; ${o.min} minutes, ${o.fare ? money(o.fare) : 'free'}.`).join(' ')}`,
  prompt: (it) => `Be at <b>${esc(it.dest)}</b> within <b>${it.due} min</b>. <b>The cheapest way that is on time?</b>`,
  controls: (it, st, busy) => `<div class="shiftroutes" role="group" aria-label="Ways to go">${it.opts.map((o, j) =>
    `<button class="btn ghost shiftroute" data-act="jgPick" data-arg="${j}"${busy ? ' disabled' : ''}><span class="tk">${LETTERS[j]}</span>
      <span class="grow">${o.legs.map((l) => esc(legText(l))).join(', then ')}</span><b class="tabnum">${o.min} min · ${o.fare ? money(o.fare) : 'free'}</b></button>`).join('')}</div>`,
  hint: 'Tap a way, or press A–E (or 1–5). Cross out the late ones first; then the cheapest left.',
  key(e, it, api) { const k = e.key.toLowerCase(), j = 'abcde'.indexOf(k) >= 0 ? 'abcde'.indexOf(k) : '12345'.indexOf(k); if (k.length === 1 && j >= 0 && j < it.choices) api.answer(j); },
  act(n, arg, it, api) { if (n === 'jgPick') api.answer(+arg); },
  point(x, y, it, api) { const g = routeGeo(it); let bj = -1, bd = 26; g.forEach((c, j) => { const d = Math.hypot(x - c.bx, y - c.by); if (d < bd) { bd = d; bj = j; } }); if (bj >= 0) api.answer(bj); },
  draw(ctx, it, st) {
    const g = routeGeo(it), S = ROUTE_S, E = ROUTE_E;
    /* the map: a park-green sheet with two roads, laid on the place */
    ctx.fillStyle = dark() ? 'rgba(30,48,40,.72)' : 'rgba(214,232,196,.82)'; rr(ctx, 8, 34, W - 16, 258, 14); ctx.fill();
    ctx.strokeStyle = dark() ? 'rgba(255,255,255,.08)' : 'rgba(120,140,100,.25)'; ctx.lineWidth = 9;
    for (const y of [92, 244]) { ctx.beginPath(); ctx.moveTo(12, y); ctx.lineTo(W - 12, y); ctx.stroke(); }
    const at = (c, t) => ({ x: (1 - t) * (1 - t) * S.x + 2 * (1 - t) * t * 180 + t * t * E.x, y: (1 - t) * (1 - t) * S.y + 2 * (1 - t) * t * c.cy + t * t * E.y });
    const show = st.hold || st.flash > 0 || st.anim;
    g.forEach((c, j) => {
      const o = it.opts[j]; let t0 = 0;
      const dim = show && st.anim && st.anim.input !== j ? 0.35 : 1;
      ctx.save(); ctx.globalAlpha = dim;
      for (const l of o.legs) {
        const t1 = t0 + l.min / o.min, M = MODES[l.m];
        ctx.strokeStyle = M.col; ctx.lineWidth = M.w; ctx.setLineDash(M.dash); ctx.lineCap = 'round';
        ctx.beginPath();
        for (let s = 0; s <= 16; s++) { const p = at(c, t0 + (t1 - t0) * (s / 16)); if (s) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
        ctx.stroke(); t0 = t1;
      }
      ctx.setLineDash([]); ctx.restore();
    });
    /* start and destination pins */
    const pin = (p, text, col) => { shadow(ctx, p.x, p.y + 10, 22, 0.25); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y - 6, 9, Math.PI, 0); ctx.lineTo(p.x, p.y + 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y - 6, 3.5, 0, Math.PI * 2); ctx.fill(); label(ctx, text, p.x + (p.x > W / 2 ? 14 : -14), p.y + 20, { size: 10, align: p.x > W / 2 ? 'right' : 'left' }); };
    pin(S, 'you', '#2E5F7A'); pin(E, it.dest.replace(/^the /, '').split(',')[0].slice(0, 14), '#C4453C');
    /* each way's tag: its letter, its minutes and its fare — late ones marked once you have chosen */
    g.forEach((c, j) => {
      const o = it.opts[j], late = o.min > it.due, txt = `${LETTERS[j]} ${o.min}m ${o.fare ? money(o.fare) : 'free'}`;
      ctx.font = '800 11px Sono, ui-monospace, monospace'; const w = ctx.measureText(txt).width + 14;
      ctx.fillStyle = show && j === it.answer ? '#2FA866' : show && late ? 'rgba(160,160,170,.92)' : (dark() ? 'rgba(10,14,24,.88)' : 'rgba(255,252,245,.96)');
      rr(ctx, c.bx - w / 2, c.by - 10, w, 20, 10); ctx.fill();
      ctx.fillStyle = show && (j === it.answer || late) ? '#fff' : (dark() ? '#FFF6DA' : '#1C2A2E');
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, c.bx, c.by + .5);
      if (show && late) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(c.bx - w / 2 + 6, c.by); ctx.lineTo(c.bx + w / 2 - 6, c.by); ctx.stroke(); }
    });
    /* the clock you have to beat */
    const due = `be there in ${it.due} min`;
    ctx.font = '800 12px Sono, ui-monospace, monospace'; const dw = ctx.measureText(due).width + 18;
    ctx.fillStyle = '#2E5F7A'; rr(ctx, W / 2 - dw / 2, 40, dw, 22, 11); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(due, W / 2, 51.5);
    /* then walk it: you, along the way you chose */
    if (st.anim) {
      const k = st.anim.dur ? Math.min(1, st.anim.t / st.anim.dur) : 1, p = at(g[st.anim.input], ease.inOut(k));
      ctx.fillStyle = '#F0B429'; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3A2400'; ctx.lineWidth = 2; ctx.stroke();
    }
  },
};
const ROUTE_S = { x: 36, y: 168 }, ROUTE_E = { x: 324, y: 168 };
function routeGeo(it) {
  const n = it.opts.length, gap = n >= 5 ? 44 : 52;
  return it.opts.map((o, j) => { const apex = (j - (n - 1) / 2) * gap, cy = ROUTE_S.y + apex * 2; return { cy, bx: 180, by: ROUTE_S.y + apex }; });
}

export const TEMPLATES = { count: COUNT, change: CHANGE, ledger: LEDGER, route: ROUTE };

/* the job's own end-card words, and the grade's mood (Pip's pose, never a face) */
const FINISH = {
  count: ['Nothing got past you. A shop that is shorted and never notices pays for goods it never had.', 'Count by rows, then read the slip again. Short is money, even when it is only one.'],
  change: ['The fewest coins, every time: that is a till that balances at closing.', 'Count up from the price to what they paid, then use the biggest coin that fits first.'],
  ledger: ['A book that balances is a book you can trust, and Nana will.', 'One line at a time: add it or take it away, and the balance moves with it.'],
  route: ['You spent only what each trip needed. Time costs, and so does a fare: you weighed both.', 'Cross out the ways that arrive late first. Then the cheapest one left.'],
};
function grade(right) {
  return right >= SHIFT_ITEMS ? ['🏅', 'A perfect shift'] : right >= 10 ? ['cheer', 'A cracking shift'] : right >= 8 ? ['cheer', 'A good shift']
    : right >= 5 ? ['point', 'Got it done'] : ['think', 'Hard going'];
}
const POSES = ['wave', 'think', 'point', 'cheer', 'oops', 'sleep'];

/* ══ the frame: one engine for every template ═════════════════════════ */
function newSeed() { return ((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 1; }

function shift(jobId, quit, opts = {}) {
  const cfg = JOB_GAME[jobId], kind = cfg.kind, T = TEMPLATES[kind];
  const job = JOBS.find((j) => j.id === jobId) || { name: 'Work', who: 'the town' };
  const FX = fx(), img = plate((K() && K().world) || 0);
  const seed = opts.seed != null ? (opts.seed >>> 0) || 1 : newSeed();
  const st = { seed, items: [], i: 0, right: 0, answered: 0, results: [], run: 0, bestRun: 0, left: SHIFT_MS,
    hold: null, flash: 0, anim: null, tray: [], entry: '', flagged: 0, overs: 0, late: 0, spotted: 0,
    over: false, overT: 0, done: false, T: 0 };
  st.tier = TIER_IDS.includes(opts.tier) ? opts.tier : tierOf(K(), jobId);
  st.picking = !TIER_IDS.includes(opts.tier);
  /* the content is the seed and the level, nothing else: the same pair replays exactly */
  const build = () => {
    const r = rng(seed ^ (TIER_IDS.indexOf(st.tier) + 1) * 0x9E3779B1);
    const kn = jobKnobs(jobId, st.tier);
    st.items = T.makeAll ? T.makeAll(r, kn, cfg, jobId) : Array.from({ length: SHIFT_ITEMS }, (_, i) => T.make(r, kn, cfg, jobId, i));
    st.checks = st.items.filter((x) => x.mode === 'check').length;
  };
  build();
  const par = () => jobPar(jobId);
  const cur = () => st.items[Math.min(st.i, SHIFT_ITEMS - 1)];
  const live = () => !st.picking && !st.over && !st.done;
  const ready = () => live() && !st.hold && !st.anim && !(st.flash > 0);
  let raf = 0, last = 0, ctx = null, cv = null, dpr = 1, shownSec = -1;
  const stop = () => { if (raf && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf); raf = 0; };
  const render = () => { if (R.render) R.render(); };

  const summary = () => ({ finished: st.answered === SHIFT_ITEMS, right: st.right, of: SHIFT_ITEMS, answered: st.answered, bestRun: st.bestRun,
    flagged: st.flagged, over: st.overs, late: st.late, spotted: st.spotted, checks: st.checks || 0 });
  const end = () => {
    if (st.done) return;
    st.done = true; stop();
    const c = K();
    /* accuracy in, wage out: right answers of twelve, against par, and doJob clamps it.
       Nothing right is nothing done (K2) — the floor is for a shift done badly. */
    st.accuracy = st.right / SHIFT_ITEMS;
    st.quality = st.right / par();
    st.capped = !!(c && c.jobs && c.jobs[jobId] === dayIndex(Date.now()));
    st.best = sim.setJobBest(c, jobId, st.right);
    st.won = sim.doJob(c, jobId, st.quality);
    st.goals = earnGoals(c, jobId, jobGoals(jobId), Object.assign({ tier: st.tier }, summary()));
    /* §1.7 · the level rule, offered on the card and never applied by itself: under half of par
       offers one level down; a shift with all twelve right (1.5× par, the most a shift can show)
       offers the level above */
    st.offer = levelOffer(st.tier, st.right === SHIFT_ITEMS ? PERFECT : st.right / par());
    if (R.s) sim.save(R.s);
    if (st.won > 0) sfx.coin();
    render();
  };
  const finish = () => {
    if (st.over || st.done) return;
    st.over = true; st.overT = 0; st.hold = null; st.anim = null; st.flash = 0;
    FX.coins(W / 2, H / 2 - 10, 10);
    FX.burst(W / 2, H / 2 - 10, { n: 22, colors: ['#F0B429', '#FFF3C4', '#5CCB7E', '#3FBCC8'], speed: 0.3 });
    sfx.level(); render();
  };
  st.end = finish;
  const next = () => {
    if (st.done || st.over) return;
    st.hold = null; st.flash = 0; st.tray = []; st.entry = '';
    st.i++;
    if (st.i >= SHIFT_ITEMS) { finish(); return; }
    render();
  };
  const resolve = (input, res) => {
    const it = cur();
    st.answered++; st.results[st.i] = !!res.right; it.given = input;
    if (res.over) st.overs++;
    if (res.late) st.late++;
    if (res.right) {
      st.right++; st.run++; st.bestRun = Math.max(st.bestRun, st.run);
      if (res.flag) st.flagged++;
      if (res.spot) st.spotted++;
      st.flash = FLASH_MS;
      FX.pop(W / 2, 150, 'Right!', { color: '#11663A', size: 20 }); FX.coins(W / 2, 150, 4);
      sfx.good();
    } else {
      st.run = 0;
      st.hold = { t: 0, why: T.explain(it, input, cfg) };
      FX.shake(6, 240); sfx.bad();
    }
    render();
  };
  const answer = (input) => {
    if (!ready()) return;
    const res = T.check(cur(), input);
    /* a route is walked before it is judged: you see the way you chose, then the verdict */
    if (T.walks) { st.anim = { t: 0, input, res, dur: still() ? 0 : WALK_MS }; if (!st.anim.dur) { st.anim = null; resolve(input, res); } else render(); return; }
    resolve(input, res);
  };
  const api = {
    answer,
    coin(v) { if (!ready() || st.tray.length >= 12) return; st.tray.push(v); sfx.click(); render(); },
    undo() { if (!ready() || !st.tray.length) return; st.tray.pop(); render(); },
    give() { if (!ready() || !st.tray.length) return; answer(st.tray.slice()); },
    digit(d) { if (!ready() || st.entry.length >= 5) return; st.entry = (st.entry === '0' ? '' : st.entry) + d; render(); },
    del() { if (!ready()) return; st.entry = st.entry.slice(0, -1); render(); },
    enter() { if (!ready() || !st.entry) return; answer(+st.entry); },
  };

  /* one slice of wall-clock time: the frame loop and a headless driver share it */
  const advance = (dt) => {
    if (st.done || st.picking) return;
    st.T += dt;
    if (st.over) { st.overT += dt; if (st.overT >= (still() ? 500 : 1300)) end(); return; }
    if (st.anim) { st.anim.t += dt; if (st.anim.t >= st.anim.dur) { const a = st.anim; st.anim = null; resolve(a.input, a.res); } }
    /* the clock waits while a correction is read — for at most HOLD_MS, so every shift ends */
    if (st.hold) { st.hold.t += dt; if (st.hold.t >= HOLD_MS) next(); return; }
    if (st.flash > 0) { st.flash -= dt; if (st.flash <= 0) next(); }
    if (st.over || st.done) return;
    st.left -= dt;
    if (st.left <= 0) { st.left = 0; finish(); }
  };

  const paint = () => {
    ctx.clearRect(0, 0, W, H);
    const after = FX.begin(ctx);
    backdrop(ctx, W, H, img, { veil: kind === 'route' ? 0.2 : 0.32 });
    T.draw(ctx, cur(), st, cfg);
    night(ctx, 0.12);
    after();
    FX.draw(ctx, W, H);
    dots(ctx, st.results, st.i);
    const w = pill(ctx, clockText(st.left), W - 8, 8, { warn: st.left < 15000 && !st.picking });
    pill(ctx, `${Math.min(st.i + 1, SHIFT_ITEMS)}/${SHIFT_ITEMS}`, W - 14 - w, 8);
    if (st.picking) {
      ctx.fillStyle = 'rgba(20,24,36,.32)'; ctx.fillRect(0, 0, W, H);
      label(ctx, TIER_NAME[st.tier], W / 2, H / 2 - 12, { size: 30, serif: true });
      label(ctx, `${SHIFT_ITEMS} to do · pick a level below`, W / 2, H / 2 + 18, { size: 12 });
      return;
    }
    if (st.over) {
      const k = Math.min(1, st.overT / 380), s = ease.back(k);
      ctx.save(); ctx.fillStyle = `rgba(20,24,36,${0.38 * k})`; ctx.fillRect(0, 0, W, H);
      ctx.translate(W / 2, H / 2 - 8); ctx.scale(s, s); ctx.rotate(-0.04);
      ctx.fillStyle = '#F0B429'; rr(ctx, -128, -34, 256, 68, 16); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#8A5B00'; rr(ctx, -128, -34, 256, 68, 16); ctx.stroke();
      label(ctx, 'SHIFT DONE!', 0, -6, { size: 30, serif: true, color: '#3A2400', stroke: '#FFF3C4' });
      label(ctx, `${st.right} of ${SHIFT_ITEMS} right`, 0, 20, { size: 12, color: '#3A2400', stroke: '#FFE7A0' });
      ctx.restore();
    }
  };
  const syncClock = () => {
    const s = Math.ceil(st.left / 1000);
    if (s === shownSec || typeof document === 'undefined') return;
    shownSec = s;
    const el = document.getElementById('shiftClock');
    if (el) { el.textContent = clockText(st.left); el.classList.toggle('warn', st.left < 15000); }
  };
  const loop = () => {
    if (st.done) return;
    /* the wall's clock (performance.now), never the frame count */
    const t = now(), dt = Math.min(1000, t - (last || t)); last = t;
    advance(dt);
    if (st.done) return;
    FX.step(dt);
    syncClock();
    if (ctx) { try { paint(); } catch (e) { if (ctx.reset) { ctx.reset(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); } } }
    raf = requestAnimationFrame(loop);
  };
  /* a hidden tab is not time worked: the gap is not counted when it comes back */
  const onVis = () => { last = 0; };
  if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('visibilitychange', onVis);

  const takeLevel = (t) => {
    const o = st.offer; if (!st.done || !o || o.taken || o.to !== t || !setTier(K(), jobId, t)) return;
    o.taken = true; if (R.s) sim.save(R.s); sfx.click(); render();
  };
  const pickTier = (t) => { if (!st.picking || !TIER_IDS.includes(t)) return; st.tier = t; build(); setTier(K(), jobId, t); sfx.click(); render(); };
  const begin = () => { if (!st.picking) return; st.picking = false; setTier(K(), jobId, st.tier); if (R.s) sim.save(R.s); sfx.click(); last = 0; render(); };

  const hudBits = () => [`<span class="tierchip" data-tier="${st.tier}">${TIER_NAME[st.tier]}</span>`,
    `<span data-hud="item" data-v="${Math.min(st.i + 1, SHIFT_ITEMS)}">${Math.min(st.i + 1, SHIFT_ITEMS)} of ${SHIFT_ITEMS}</span>`,
    `<span data-hud="right" data-v="${st.right}">${st.right} right</span>`,
    `<span data-hud="clock" id="shiftClock" class="${st.left < 15000 && !st.picking ? 'warn' : ''}">${clockText(st.left)}</span>`];

  return {
    id: 'job:' + jobId,
    kind,
    /* a read-only snapshot, so a headless player can PLAY the shift (the solver reads
       the item, as a careful child reads the slip) — and the tests can see the HUD */
    __st: () => ({ kind, go: live(), ready: ready(), over: !!st.over, done: !!st.done, tier: st.tier, picking: !!st.picking, par: par(),
      i: st.i, right: st.right, answered: st.answered, left: st.left, hold: !!st.hold, anim: !!st.anim, seed: st.seed,
      item: cur(), solution: T.solve(cur()) }),
    __tick: (dt) => advance(dt),
    __key: (k) => this_key({ key: k }),
    __point: (x, y) => { if (ready() && T.point) T.point(x, y, cur(), api); },
    __answer: (input) => answer(input),
    __random: (r) => T.random(cur(), r),
    __paint: (c2) => { const keep = ctx; ctx = c2; try { paint(); } finally { ctx = keep; } },
    st,
    mount() {
      cv = document.getElementById('jobCanvas');
      if (!cv) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx = cv.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      shownSec = -1;
      if (!st.done) { stop(); raf = requestAnimationFrame(loop); }
      const at = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };
      cv.onpointerdown = (e) => { if (st.hold) { next(); return; } if (ready() && T.point) T.point(...at(e), cur(), api); };
    },
    stop() { stop(); if (typeof document !== 'undefined' && document.removeEventListener) document.removeEventListener('visibilitychange', onVis); },
    key: (e) => this_key(e),
    act(n, arg) {
      if (n === 'jgTier') { pickTier(arg); return; }
      if (n === 'jgLevel') { takeLevel(arg); return; }
      if (n === 'jgStart') { begin(); return; }
      if (n === 'jgNext') { if (st.hold) next(); return; }
      if (live()) T.act(n, arg, cur(), api);
    },
    view() {
      const chip = `<span class="tierchip" data-tier="${st.tier}">${TIER_NAME[st.tier]}</span>`;
      if (st.done) return endView(chip);
      const it = cur(), busy = !ready();
      const body = st.picking ? `<div class="jgpick">
          ${tierPicker(st.tier, 'jgTier', '', JOB_TIER_SAYS[kind])}
          <p class="small muted tierpar">${SHIFT_ITEMS} to do, or ${SHIFT_MS / 1000} seconds. Pay is how many you get right: ${par()} right is a good shift on every level.</p>
          ${goalList(jobGoals(jobId), K(), jobId)}
          <button class="btn wide" data-act="jgStart" style="min-height:48px">Start the shift →</button>
          <p class="hint">1 2 3 or ← → to pick a level, Enter to start. Or tap.</p></div>`
        : st.over ? `<p class="shiftq" aria-live="polite"><b>Shift done.</b> ${st.right} of ${SHIFT_ITEMS} right.</p>`
        : st.hold ? `<div class="fb hold bad shiftfb" role="status"><b>Not this time.</b> ${esc(st.hold.why)}</div>
            <button class="btn wide" data-act="jgNext" style="min-height:48px">Continue →</button>
            <p class="hint">Enter or space to go on. The clock waits while you read.</p>`
        : `<p class="shiftq" aria-live="polite">${st.flash > 0 ? `<b class="good">Right</b>: ${esc(T.praise(it, cfg))}.` : T.prompt(it, cfg)}</p>
          ${T.controls(it, st, busy)}
          <p class="hint">${esc(T.hint)}</p>`;
      return `<div class="stack">
        ${hud(st.picking ? [chip] : hudBits())}
        <div class="stage jobstage shift" data-kind="${kind}" style="min-height:0;padding:12px">
          <div class="row" style="gap:8px">
            <span class="grow"><b style="font-size:15px">${esc(cfg.verb)}</b>
              <div class="small muted">${esc(job.name)} · for ${esc(job.who)}</div></span>
            <span class="pill">best ${sim.jobBest(K(), jobId)}/${SHIFT_ITEMS}</span>
          </div>
          <canvas id="jobCanvas" role="img" aria-label="${esc(cfg.verb)}. ${esc(st.picking ? KIND_WORD[kind] : T.describe(it, cfg))}" style="width:100%;max-width:400px;margin:0 auto;height:auto;
            aspect-ratio:${W}/${H};border-radius:var(--r-md);display:block;touch-action:manipulation;box-shadow:0 6px 18px rgba(20,24,36,.18)"></canvas>
          ${body}
        </div></div>`;
    },
  };

  function this_key(e) {
    if (st.done) { if ((e.key === 'l' || e.key === 'L') && st.offer && st.offer.dir) takeLevel(st.offer.to); else if (e.key === 'Enter') { quit(); render(); } return; }
    if (st.picking) {
      const i = TIER_IDS.indexOf(st.tier);
      if (e.key >= '1' && e.key <= '3' && e.key.length === 1) pickTier(TIER_IDS[+e.key - 1]);
      else if (e.key === 'ArrowLeft') pickTier(TIER_IDS[Math.max(0, i - 1)]);
      else if (e.key === 'ArrowRight') pickTier(TIER_IDS[Math.min(2, i + 1)]);
      else if (e.key === 'Enter' || e.key === ' ') { if (e.preventDefault) e.preventDefault(); begin(); }
      return;
    }
    if (st.hold) { if (e.key === 'Enter' || e.key === ' ') { if (e.preventDefault) e.preventDefault(); next(); } return; }
    if (!live()) return;
    if (e.key === 'Backspace' && e.preventDefault) e.preventDefault();
    T.key(e, cur(), api);
  }

  /* §1.4 · the shift's own end card: its own practised line and its own capped notice */
  function endView(chip) {
    const c = K(), [mood, title] = grade(st.right), pose = POSES.includes(mood) ? mood : 'cheer';
    const best = sim.jobBest(c, jobId);
    const paid = st.won > 0 ? `Earned ${money(st.won)} from ${esc(job.who)}, straight into your wallet. Paid by how many you got right.`
      : st.capped ? `Paid shift used for today: this one is practice, and it still counts toward your goals. ${esc(job.name)} pays once a day, so tomorrow it pays again.`
      : 'Nothing right this shift, so nothing paid. A wage is for work done right; the next shift is a fresh start.';
    return `<div class="stack">${hud([esc(job.name), chip])}
      <div class="stage endcard shiftend" data-kind="${kind}" style="justify-content:center;text-align:center">
        <div class="endfig">${pipPose(pose, 104)}<span class="endav">${kidBadge(c, 56)}</span></div>
        <h2>${esc(title)}</h2>
        <p class="shiftscore"><b class="tabnum">${st.right} of ${SHIFT_ITEMS}</b> right (${Math.round(st.accuracy * 100)}%) on ${TIER_NAME[st.tier]}${st.answered < SHIFT_ITEMS ? ` · ${SHIFT_ITEMS - st.answered} not reached before the clock` : ''}</p>
        <p class="endbest">${st.best ? 'A new best for you' : 'Your best'}: <b class="tabnum">${best} of ${SHIFT_ITEMS}</b></p>
        ${say(job.whoArt || 'pip', FINISH[kind][st.right >= 10 ? 0 : 1])}
        <p class="practised"><b>You practised:</b> ${esc(SHIFT_PRACTISED[kind])}</p>
        ${goalList(jobGoals(jobId), c, jobId, st.goals)}
        <p class="small muted shiftpaid">${paid}</p>
        ${st.offer && st.offer.dir ? (st.offer.taken ? `<p class="small lvloffer" data-dir="${st.offer.dir}">Next shift is on <b>${TIER_NAME[st.offer.to]}</b>.</p>`
          : `<p class="small lvloffer" data-dir="${st.offer.dir}">${st.offer.dir === 'up' ? `Every one right on ${TIER_NAME[st.tier]}. Ready for ${TIER_NAME[st.offer.to]}?` : `A hard one. ${TIER_NAME[st.offer.to]} is there if you want it.`}
            <button class="btn ghost sm" data-act="jgLevel" data-arg="${st.offer.to}">Try ${TIER_NAME[st.offer.to]} next time (L)</button></p>`) : ''}
        <button class="btn wide" data-act="gquit">Back</button></div></div>`;
  }
}

/* startJobGame(id, quit) opens on the level picker, lit at the child's last level for
   this job; pass { tier } to start straight away on that level, and { seed } to replay. */
export function startJobGame(id, quit, opts = {}) {
  const cfg = JOB_GAME[id];
  if (!cfg || !TEMPLATES[cfg.kind]) return null;
  return shift(id, quit, opts || {});
}
