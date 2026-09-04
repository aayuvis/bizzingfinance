/* ui.js — the small vocabulary every view speaks.
   Rendering is `state -> render()` returning a string; clicks dispatch by
   [data-act]. Inherited from Bizzing Bee because the team is fluent in it. */

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function cls(...a) { return a.filter(Boolean).join(' '); }

/* ---- action dispatch ---------------------------------------------------- */
const acts = Object.create(null);
export function on(name, fn) { acts[name] = fn; }
export function fire(name, arg, ev) {
  const fn = acts[name];
  if (fn) fn(arg, ev);
  else console.warn('no action:', name);
}
export function bindRoot(root) {
  const go = (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el || !root.contains(el)) return;
    const act = el.getAttribute('data-act');
    if (act === 'noop') { ev.stopPropagation(); return; }
    ev.preventDefault();
    fire(act, el.getAttribute('data-arg'), ev);
  };
  root.addEventListener('click', go);
  root.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const el = ev.target.closest('[data-act]');
    if (el && el.tagName !== 'BUTTON' && el.tagName !== 'INPUT') { go(ev); }
  });
}

/* ---- sound: tiny WebAudio blips, no assets ------------------------------ */
let AC = null, soundOn = true;
export function setSound(v) { soundOn = !!v; }
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = false; } }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(freq, dur, type, vol, delay) {
  const c = ac(); if (!c || !soundOn) return;
  const t = c.currentTime + (delay || 0);
  const o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol == null ? 0.14 : vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
export const sfx = {
  click() { tone(520, 0.07, 'triangle', 0.06); },
  coin() { tone(880, 0.09, 'triangle', 0.11); tone(1320, 0.13, 'triangle', 0.09, 0.06); },
  good() { tone(660, 0.1, 'sine', 0.12); tone(990, 0.16, 'sine', 0.1, 0.08); },
  bad() { tone(220, 0.16, 'sawtooth', 0.07); tone(170, 0.2, 'sawtooth', 0.06, 0.08); },
  level() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, 'triangle', 0.11, i * 0.09)); },
  bell() { [784, 1175].forEach((f, i) => tone(f, 0.8, 'sine', 0.1, i * 0.14)); },
};

/* ---- transient chrome --------------------------------------------------- */
let toastT = null;
export function toast(msg) {
  document.querySelectorAll('.toast').forEach((n) => n.remove());
  const d = document.createElement('div');
  d.className = 'toast'; d.textContent = msg; d.setAttribute('role', 'status');
  document.body.appendChild(d);
  clearTimeout(toastT);
  toastT = setTimeout(() => d.remove(), 2400);
}
const CONF = ['#F0B429', '#0E6B78', '#178A4C', '#C4453C', '#8A5BD6', '#2E7FA8'];
export function confetti(n) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-motion') === 'reduced') return;
  const wrap = document.createElement('div');
  wrap.className = 'conf'; wrap.setAttribute('aria-hidden', 'true');
  let html = '';
  for (let i = 0; i < (n || 40); i++) {
    const dur = (2.4 + (i % 6) * 0.35).toFixed(2);
    html += `<i style="left:${(i * 37) % 100}%;background:${CONF[i % 6]};animation-duration:${dur}s;animation-delay:${((i * 0.13) % 1.2).toFixed(2)}s"></i>`;
  }
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 4200);
}

/* ---- number helpers used all over the UI -------------------------------- */
export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
export function sum(a) { return a.reduce((x, y) => x + y, 0); }

/* Deterministic PRNG — the market must replay identically for everyone,
   and a demo that reshuffles on reload cannot be reasoned about. */
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return function () {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function sparkline(vals, w, h, color) {
  if (!vals || vals.length < 2) return '';
  const lo = Math.min(...vals), hi = Math.max(...vals), sp = (hi - lo) || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * (w - 2) + 1;
    const y = h - 3 - ((v - lo) / sp) * (h - 6);
    return x.toFixed(1) + ',' + y.toFixed(1);
  });
  const area = `M1,${h} L${pts.join(' L')} L${w - 1},${h} Z`;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${area}" fill="${color}" opacity=".14"></path>
    <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"></polyline>
    <circle cx="${pts[pts.length - 1].split(',')[0]}" cy="${pts[pts.length - 1].split(',')[1]}" r="2.6" fill="${color}"></circle>
  </svg>`;
}

/* Small counts read better as words in a sentence a child reads aloud —
   "all three done", not "all 3 done". Above twelve the digit is clearer. */
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve'];
export function nWord(n) { return WORDS[n] !== undefined ? WORDS[n] : String(n); }


/* ── read to me ───────────────────────────────────────────────────────────
   India reads everything aloud and falls back to the device's own voice
   when there is no clip; here the cards, the letters and the glossary have
   no recorded clip, so the device voice IS the reader. An Indian English
   voice first, then any English. Rate follows the narration-speed setting. */
let sayRate = 1;
export function setSayRate(r) { sayRate = r || 1; }
export function canSay() { return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined'; }
function pickVoice() {
  const vs = speechSynthesis.getVoices() || [];
  return vs.find((v) => /en[-_]IN/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang) && /natural|neural|premium|enhanced/i.test(v.name)) || vs.find((v) => /^en/i.test(v.lang)) || null;
}
export function say(text) {
  if (!canSay() || !text) return false;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/\s+/g, ' ').trim());
    const v = pickVoice(); if (v) u.voice = v;
    u.lang = (v && v.lang) || 'en-IN'; u.rate = sayRate; u.pitch = 1;
    speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}
export function hush() { try { if (canSay()) speechSynthesis.cancel(); } catch (e) {} }
