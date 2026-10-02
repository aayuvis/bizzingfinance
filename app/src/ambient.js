/* ambient.js — a world's ambient life, behind the top bar (FAMILY-STANDARD §7, D10).

   Three layers, every world:
     1. depth   — the painted plate (far) and a near plane that drifts and moves at a
                  different rate as the page scrolls (parallax);
     2. weather — place-specific particles on a canvas: petals on Market Row, spray on
                  the harbour, plane-tree leaves in the square, gold motes in the
                  Exchange, smoke and sparks at the Works, fireflies at the festival;
     3. life    — one idle character on a loop: the barrow mole trundling, the sailboat
                  crossing, the tin robin hopping, the magpie flying, the steam engine
                  puffing, the kite bobbing.

   It lives OUTSIDE #app on purpose: the app re-renders by replacing its HTML, and a
   canvas recreated every tap would stutter. Paused whenever the page is hidden;
   under reduced motion it is one still frame and nothing moves.

   Exposed for the browser check: window.BZF.ambient.state() → { running, layers }. */
import { rng } from './ui.js';

let el = null, cv = null, ctx = null, raf = 0, parts = [], cur = null, dark = false, last = 0;
const rr = rng(20261002);   /* even the weather is seeded: nothing in this app is random */
const reduced = () => (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
  || document.documentElement.getAttribute('data-motion') === 'reduced';

const NEAR = {
  petals: 'bunting', spray: 'ropes', leaves: 'boughs', motes: 'balustrade', smoke: 'rooftops', fireflies: 'lanterns',
};

function nearSVG(kind, night) {
  const ink = night ? '#0B1022' : '#3A2A5C';
  const flags = ['#E8684A', '#F0B429', '#3FA6B5', '#7FB069', '#B07FD0'];
  if (kind === 'bunting' || kind === 'lanterns') {
    const n = 18, pts = Array.from({ length: n }, (_, i) => i);
    return `<svg viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 8 Q300 40 600 10 T1200 12" fill="none" stroke="${ink}" stroke-opacity=".5" stroke-width="2"/>
      ${pts.map((i) => { const x = 30 + i * 66, y = 8 + 22 * Math.sin((i / (n - 1)) * Math.PI * 2) * 0.6 + 10;
        return kind === 'lanterns'
          ? `<g><line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y}" stroke="${ink}" stroke-opacity=".5"/><ellipse cx="${x}" cy="${y + 9}" rx="8" ry="10" fill="${flags[i % 5]}" opacity="${night ? 0.95 : 0.85}"/>${night ? `<circle cx="${x}" cy="${y + 9}" r="16" fill="${flags[i % 5]}" opacity=".22"/>` : ''}</g>`
          : `<path d="M${x - 10} ${y} L${x + 10} ${y} L${x} ${y + 20} Z" fill="${flags[i % 5]}" opacity=".9"/>`; }).join('')}</svg>`;
  }
  if (kind === 'ropes') return `<svg viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 4 Q200 44 400 6 Q600 44 800 6 Q1000 44 1200 6" fill="none" stroke="${ink}" stroke-opacity=".45" stroke-width="3" stroke-dasharray="7 4"/>${[200, 600, 1000].map((x) => `<circle cx="${x}" cy="38" r="9" fill="#E8684A" stroke="${ink}" stroke-opacity=".5"/>`).join('')}</svg>`;
  if (kind === 'boughs') return `<svg viewBox="0 0 1200 60" preserveAspectRatio="none">${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${i * 92}" cy="${i % 2 ? 2 : 8}" rx="70" ry="${i % 2 ? 26 : 20}" fill="${night ? '#1D3324' : '#5E8F4E'}" opacity=".8"/>`).join('')}</svg>`;
  if (kind === 'balustrade') return `<svg viewBox="0 0 1200 60" preserveAspectRatio="none"><rect x="0" y="0" width="1200" height="8" fill="${night ? '#2B2A3A' : '#E9D3A8'}" opacity=".85"/>${Array.from({ length: 40 }, (_, i) => `<rect x="${i * 30 + 8}" y="8" width="12" height="18" rx="5" fill="${night ? '#2B2A3A' : '#E9D3A8'}" opacity=".7"/>`).join('')}</svg>`;
  return `<svg viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 0 H1200 V14 ${Array.from({ length: 24 }, (_, i) => `L${1200 - i * 50} ${i % 3 ? 14 : 30} L${1200 - i * 50 - 25} 14`).join(' ')} L0 14Z" fill="${night ? '#1A1418' : '#8C4A2E'}" opacity=".55"/></svg>`;
}

function seedParts(kind, w, h) {
  const r = rng(kind.length * 97 + (dark ? 7 : 3));
  const n = kind === 'fireflies' ? 26 : kind === 'motes' ? 30 : kind === 'smoke' ? 12 : 22;
  parts = Array.from({ length: n }, () => ({ x: r() * w, y: r() * h, v: 0.2 + r() * 0.6, p: r() * 6.28, s: 0.6 + r() * 1.2 }));
}

function frame(dt) {
  if (!ctx || !cur) return;
  const w = cv.width, h = cv.height, k = cur.ambient.particles, t = performance.now() / 1000;
  ctx.clearRect(0, 0, w, h);
  for (const q of parts) {
    if (k === 'petals' || k === 'leaves') {
      q.y += q.v * dt * 0.03; q.x += Math.sin(t + q.p) * 0.3 + 0.15;
      if (q.y > h) { q.y = -6; q.x = rr() * w; }
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(t * q.v + q.p);
      ctx.fillStyle = k === 'petals' ? (dark ? 'rgba(255,190,200,.55)' : 'rgba(232,104,74,.55)') : (dark ? 'rgba(150,190,120,.5)' : 'rgba(110,150,70,.6)');
      ctx.beginPath(); ctx.ellipse(0, 0, 4 * q.s, 2 * q.s, 0, 0, 6.28); ctx.fill(); ctx.restore();
    } else if (k === 'spray') {
      const a = (Math.sin(t * 2 * q.v + q.p) + 1) / 2;
      ctx.fillStyle = `rgba(255,255,255,${(dark ? 0.35 : 0.55) * a})`;
      ctx.beginPath(); ctx.arc(q.x, h * 0.55 + (q.y % (h * 0.4)), 1.6 * q.s, 0, 6.28); ctx.fill();
      q.x += 0.12 * q.v; if (q.x > w) q.x = 0;
    } else if (k === 'motes') {
      q.y -= q.v * dt * 0.012; q.x += Math.sin(t * 0.7 + q.p) * 0.2;
      if (q.y < 0) q.y = h;
      ctx.fillStyle = `rgba(255,214,120,${dark ? 0.6 : 0.7})`;
      ctx.beginPath(); ctx.arc(q.x, q.y, 1.4 * q.s, 0, 6.28); ctx.fill();
    } else if (k === 'smoke') {
      q.y -= q.v * dt * 0.02; q.x += 0.12; q.s += 0.002 * dt;
      if (q.y < -20) { q.y = h * 0.7; q.s = 0.6; q.x = (w * 0.08) + (q.p / 6.28) * w * 0.3; }
      ctx.fillStyle = dark ? 'rgba(200,200,220,.10)' : 'rgba(255,255,255,.28)';
      ctx.beginPath(); ctx.arc(q.x, q.y, 8 * q.s, 0, 6.28); ctx.fill();
    } else {
      const a = (Math.sin(t * 1.6 * q.v + q.p) + 1) / 2;
      q.x += Math.sin(t * 0.5 + q.p) * 0.25; q.y += Math.cos(t * 0.4 + q.p) * 0.15;
      ctx.fillStyle = `rgba(255,230,120,${0.25 + 0.6 * a})`;
      ctx.shadowColor = 'rgba(255,220,100,.9)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(q.x, q.y, 1.6 * q.s, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
    }
  }
}
function loop(ts) {
  const dt = Math.min(48, ts - (last || ts)); last = ts;
  frame(dt);
  raf = requestAnimationFrame(loop);
}
function startLoop() {
  stopLoop();
  if (!cv || document.hidden) return;
  if (reduced()) { frame(16); return; }
  last = 0; raf = requestAnimationFrame(loop);
}
function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

function size() {
  if (!cv || !el) return;
  const r = el.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
  if (cur) seedParts(cur.ambient.particles, cv.width, cv.height);
}

/* mount or repaint the frieze for world w */
export function setWorld(w, isDark) {
  if (typeof document === 'undefined') return;
  const same = cur && cur.id === w.id && dark === isDark && el;
  cur = w; dark = isDark;
  if (same) return;
  if (!el) {
    el = document.createElement('div');
    el.className = 'frieze'; el.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(el, document.body.firstChild);
    addEventListener('resize', size);
    addEventListener('scroll', () => { if (el) el.style.setProperty('--sy', String(Math.min(400, scrollY))); }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      document.documentElement.toggleAttribute('data-hidden', document.hidden);
      if (document.hidden) stopLoop(); else startLoop();
    });
  }
  el.setAttribute('data-world', w.id);
  el.innerHTML = `<div class="fz-plate" style="background-image:url(${isDark ? w.night : w.day})"></div>
    <div class="fz-near">${nearSVG(NEAR[w.ambient.particles], isDark)}</div>
    <canvas class="fz-fx"></canvas>
    <img class="fz-idle ${w.ambient.idleKind}" src="./avatars/fin/${w.ambient.idle}.webp" alt="" width="54" height="54">
    <div class="fz-scrim"></div>`;
  cv = el.querySelector('canvas'); ctx = cv.getContext('2d');
  size(); startLoop();
}
export function refreshMotion() { startLoop(); }
export function state() {
  return { running: !!raf, world: cur && cur.id, dark,
    layers: el ? ['.fz-plate', '.fz-near', '.fz-fx', '.fz-idle'].filter((s) => el.querySelector(s)).length : 0 };
}
