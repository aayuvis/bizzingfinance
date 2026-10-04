/* gamefx.js — the juice every canvas game shares (owner, 3 Oct 2026: "sub games/tasks
   are not functional or boring... make them super kool").

   One small kit so a game is its mechanic plus its drawing, and the feel comes free:
   particles and coin bursts, floating score pops, screen shake, a 3-2-1-GO countdown,
   easing, a painted backdrop from the town's own plates, and a few drawing helpers
   (rounded boxes, soft shadows, coins). Everything respects reduced motion: particles,
   shake and pops are skipped, the game itself is unchanged. Calm mode drops the
   particles too. Screens that are DOM rather than canvas (Main Street's board, the
   drills) use the same kit through plateCss, fxAt, shakeEl and verdict at the end.

   Pure canvas 2D, no images except the town's plates, no generated lettering. */
import { R } from './runtime.js';
import { plateFor } from './looks.js';
import { WORLDS } from './content.js';

export const still = () => {
  try { return document.documentElement.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
};
/* Calm mode is "no confetti" (shell.js Settings): the sparkle goes, the information stays —
   a pop that says "+12" still rises, the coins that hop out of it do not. */
export const calm = () => { try { return document.documentElement.hasAttribute('data-calm'); } catch (e) { return false; } };
export const quiet = () => still() || calm();

export const ease = {
  out: (t) => 1 - Math.pow(1 - t, 3),
  back: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

/* ── the fx layer: one per game, stepped and drawn by the game's own loop ── */
export function fx() {
  const parts = [], pops = [];
  let shakeT = 0, shakeA = 0, flashT = 0, flashC = '#fff';
  return {
    /* a burst of n particles at x,y in colour(s) */
    burst(x, y, { n = 14, colors = ['#F0B429', '#FFF3C4', '#E8962C'], speed = 0.22, life = 700, size = 4, gravity = 0.0006 } = {}) {
      if (quiet()) return;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random());
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.6, t: 0, life: life * (0.6 + Math.random() * 0.6),
          c: colors[i % colors.length], s: size * (0.6 + Math.random() * 0.8), g: gravity, coin: false });
      }
    },
    /* little gold coins that hop out and fall — for money earned */
    coins(x, y, n = 6) {
      if (quiet()) return;
      for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - 0.5) * 0.25, vy: -0.28 - Math.random() * 0.18, t: 0, life: 900, c: '#F0B429', s: 6, g: 0.0009, coin: true });
    },
    /* a word or number that rises and fades: "+12", "Perfect!", "×3" */
    pop(x, y, text, { color = '#1C2A2E', size = 18, life = 800, key = null } = {}) {
      /* a keyed pop replaces the last one with its key: one year's growth, not two stacked */
      if (key) for (let i = pops.length - 1; i >= 0; i--) if (pops[i].key === key) pops.splice(i, 1);
      pops.push({ key, x, y, text: String(text), color, size, t: 0, life: still() ? life * 0.6 : life });
    },
    shake(amount = 6, ms = 260) { if (!still()) { shakeA = amount; shakeT = ms; } },
    flash(color = '#fff', ms = 160) { if (!quiet()) { flashC = color; flashT = ms; } },
    step(dt) {
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.t += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.t > p.life) parts.splice(i, 1);
      }
      for (let i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > pops[i].life) pops.splice(i, 1); }
      if (shakeT > 0) shakeT -= dt; if (flashT > 0) flashT -= dt;
    },
    /* call before drawing the world; returns a function to call after */
    begin(ctx) {
      ctx.save();
      if (shakeT > 0) { const k = shakeA * (shakeT / 260); ctx.translate((Math.random() - 0.5) * k, (Math.random() - 0.5) * k); }
      return () => ctx.restore();
    },
    draw(ctx, W, H) {
      for (const p of parts) {
        const a = 1 - p.t / p.life;
        ctx.globalAlpha = Math.max(0, a);
        if (p.coin) { coin(ctx, p.x, p.y, p.s); }
        else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (0.5 + a * 0.5), 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      for (const p of pops) {
        const k = p.t / p.life, y = p.y - ease.out(k) * 34, sc = k < 0.15 ? ease.back(k / 0.15) : 1;
        ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
        ctx.font = `600 ${Math.round(p.size * sc)}px Sono, ui-monospace, monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,252,245,.95)'; ctx.strokeText(p.text, p.x, y);
        ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, y);
      }
      ctx.globalAlpha = 1;
      if (flashT > 0) { ctx.globalAlpha = (flashT / 160) * 0.35; ctx.fillStyle = flashC; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    },
    get busy() { return parts.length + pops.length; },
  };
}

/* ── a 3-2-1-GO before the clock starts. countdown.step(dt) → true once it has gone ── */
export function countdown(ms = 2400) {
  let t = still() ? ms : 0;
  return {
    step(dt) { t += dt; return t >= ms; },
    get done() { return t >= ms; },
    draw(ctx, W, H) {
      if (t >= ms + 400) return;
      const left = ms - t, n = left > 0 ? Math.ceil(left / (ms / 3)) : 0, word = n > 0 ? String(n) : 'GO!';
      const k = left > 0 ? 1 - ((left % (ms / 3)) / (ms / 3)) : Math.min(1, (t - ms) / 400);
      ctx.save();
      ctx.globalAlpha = left > 0 ? 1 : 1 - k;
      ctx.fillStyle = 'rgba(20,24,36,.28)'; ctx.fillRect(0, 0, W, H);
      const s = 1 + (1 - ease.out(Math.min(1, k * 2))) * 0.6;
      ctx.translate(W / 2, H / 2); ctx.scale(s, s);
      ctx.font = '800 64px Fraunces, Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(20,24,36,.55)'; ctx.strokeText(word, 0, 0);
      ctx.fillStyle = n > 0 ? '#FFF6DA' : '#F0B429'; ctx.fillText(word, 0, 0);
      ctx.restore();
    },
  };
}

/* ── the backdrop: the child's current place, painted, veiled so the game reads ── */
const IMG = {};
export function plateSrc(worldIndex) {
  const w = WORLDS[worldIndex || 0] || WORLDS[0];
  return plateFor(w.id, !!R.dark);
}
/* the same painted place as a CSS background, for a game whose board is DOM (Main Street) */
export function plateCss(worldIndex, veil = 0.3) {
  const src = plateSrc(worldIndex);
  const v = R.dark ? `rgba(12,16,28,${veil})` : `rgba(255,248,236,${veil})`;
  return `linear-gradient(${v},${v})${src ? `,url(${src}) center/cover no-repeat` : ''}`;
}
export function plate(worldIndex) {
  const src = plateSrc(worldIndex);
  if (!src) return null;
  if (!IMG[src]) { const im = new Image(); im.src = src; IMG[src] = im; }
  return IMG[src];
}
export function backdrop(ctx, W, H, img, { veil = 0.38, shift = 0, dark = !!R.dark } = {}) {
  if (img && img.complete && img.naturalWidth) {
    const r = Math.max(W / img.naturalWidth, H / img.naturalHeight) * 1.08;
    const iw = img.naturalWidth * r, ih = img.naturalHeight * r;
    ctx.drawImage(img, (W - iw) / 2 + shift, (H - ih) / 2, iw, ih);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, dark ? '#1C2440' : '#BFE3F2'); g.addColorStop(1, dark ? '#2A2238' : '#F6E3C0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (veil) { ctx.fillStyle = dark ? `rgba(12,16,28,${veil})` : `rgba(255,248,236,${veil})`; ctx.fillRect(0, 0, W, H); }
}

/* ── drawing helpers ── */
export function rr(ctx, x, y, w, h, r) {
  const k = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + k, y); ctx.arcTo(x + w, y, x + w, y + h, k); ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k); ctx.arcTo(x, y, x + w, y, k); ctx.closePath();
}
export function shadow(ctx, x, y, w, a = 0.18) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#2A1A08';
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, Math.max(2, w / 9), 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
export function coin(ctx, x, y, r = 8) {
  ctx.fillStyle = '#B57E10'; ctx.beginPath(); ctx.arc(x, y + r * 0.18, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F0B429'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8A5A00'; ctx.lineWidth = Math.max(1, r / 7); ctx.stroke();
  ctx.fillStyle = '#FFF3C4'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.28, 0, Math.PI * 2); ctx.fill();
}
/* a wooden crate with planks, a cross-brace and a lit top edge */
export function crate(ctx, x, y, w, h, tint = '#C98A46') {
  ctx.fillStyle = tint; rr(ctx, x, y, w, h, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(70,40,10,.55)'; ctx.lineWidth = 2; rr(ctx, x + 1, y + 1, w - 2, h - 2, 3); ctx.stroke();
  ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(70,40,10,.35)';
  for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + 2, y + (h * i) / 3); ctx.lineTo(x + w - 2, y + (h * i) / 3); ctx.stroke(); }
  ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(110,64,20,.6)';
  ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + w - 4, y + h - 4); ctx.stroke();
  ctx.fillStyle = 'rgba(255,240,200,.45)'; ctx.fillRect(x + 2, y + 1.5, w - 4, 2);
}

/* ── the kit off the canvas ──────────────────────────────────────────────
   A drill is DOM, not a canvas, so it borrows a page-wide layer: one fixed canvas
   over everything, pointer-events off, stepped on the wall's clock (rAF timestamps,
   as the arcade loops are) and taken away the moment it has nothing left to draw.
   Only something that has already happened makes it — a committed right answer —
   so it can never point at an answer before the child has chosen. */
let layer = null;
function ensureLayer() {
  if (layer && layer.cv.isConnected) return layer;
  const cv = document.createElement('canvas');
  cv.className = 'fxlayer'; cv.setAttribute('aria-hidden', 'true');
  const ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) return null;
  document.body.appendChild(cv);
  const L = layer = { cv, ctx, f: fx(), raf: 0, prev: 0, W: 0, H: 0 };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  L.W = innerWidth; L.H = innerHeight;
  cv.width = L.W * dpr; cv.height = L.H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const step = (ts) => {
    const dt = Math.min(100, ts - (L.prev || ts)); L.prev = ts;
    L.f.step(dt);
    ctx.clearRect(0, 0, L.W, L.H); L.f.draw(ctx, L.W, L.H);
    if (!L.f.busy) { L.raf = 0; cv.remove(); if (layer === L) layer = null; return; }
    L.raf = requestAnimationFrame(step);
  };
  L.kick = () => { if (!L.raf) { L.prev = 0; L.raf = requestAnimationFrame(step); } };
  return L;
}
const elOf = (a) => (typeof a === 'string' ? document.querySelector(a) : a);
/* coins and a gold burst out of an element (a chosen option, a Buy button). Returns
   whether anything was drawn: nothing is, under reduced motion or in Calm mode. */
export function fxAt(target, { coins: n = 7, burst = true, text = null, color = '#11663A' } = {}) {
  if (typeof document === 'undefined' || typeof requestAnimationFrame !== 'function' || quiet()) return false;
  const a = elOf(target); if (!a || !a.getBoundingClientRect) return false;
  const b = a.getBoundingClientRect();
  if (!b.width && !b.height) return false;
  const L = ensureLayer(); if (!L) return false;
  const x = b.left + Math.min(b.width / 2, 70), y = b.top + b.height / 2;
  if (burst) L.f.burst(x, y, { n: 16, speed: 0.26 });
  if (n) L.f.coins(x, y, n);
  if (text) L.f.pop(x, y - 6, text, { color, size: 17 });
  L.kick();
  return true;
}
/* a gentle shake for a wrong answer: the chosen thing says "not that" and nothing else
   moves. CSS keyframes keep the wall's time by themselves. Skipped under reduced motion. */
export function shakeEl(target) {
  if (typeof document === 'undefined' || still()) return false;
  const a = elOf(target); if (!a || !a.classList) return false;
  a.classList.remove('fxshake'); void a.offsetWidth; a.classList.add('fxshake');
  a.addEventListener('animationend', () => a.classList.remove('fxshake'), { once: true });
  return true;
}
/* a drill's verdict, called after the render that shows it: right → fxAt, wrong → shakeEl */
export function verdict(target, right) { return right ? fxAt(target) : shakeEl(target); }

