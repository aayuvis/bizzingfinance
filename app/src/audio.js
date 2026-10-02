/* audio.js — music and effects, composed in code for Bizzing (FAMILY-STANDARD §11, M3–M5, G7).

   No audio files, so nothing to license: every loop below is a short score — a
   progression, a bass line, a pad and a melody built from a seeded motif — played by
   WebAudio. music/CREDITS.md says so.

   · One loop per world (looks.js), one for Home and one for the games. Each is 24 or
     32 bars, 60–90 seconds, and loops seamlessly: the scheduler reads the score modulo
     its length, so bar 1 follows the last bar on the beat.
   · Default volume 40%. One master slider. Effects and music switch separately.
   · Music ducks under every effect and under read-aloud, pauses when the page is
     hidden, is off by default in lessons, and is off entirely in Calm mode.
   · Nothing here is random: every melody is drawn from a fixed seed (ui.js rng). */
import { rng } from './ui.js';

let AC = null, master = null, musicBus = null, sfxBus = null, duckG = null;
const cfg = { volume: 0.4, music: true, sfx: true, calm: false, lesson: false };
let track = null, want = null, timer = 0, nextT = 0, step = 0;

export function ctx() {
  if (AC === false) return null;
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      master = AC.createGain(); master.gain.value = cfg.volume; master.connect(AC.destination);
      musicBus = AC.createGain(); duckG = AC.createGain(); musicBus.connect(duckG); duckG.connect(master);
      sfxBus = AC.createGain(); sfxBus.connect(master);
      musicBus.gain.value = 0.55; sfxBus.gain.value = 1;
    } catch (e) { AC = false; return null; }
  }
  if (AC.state === 'suspended' && !document.hidden) AC.resume().catch(() => {});
  return AC;
}

/* ── effects ─────────────────────────────────────────────────────────────── */
function note(f, t, dur, { type = 'sine', vol = 0.12, attack = 0.008, bus, lp = 4200, detune = 0 } = {}) {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter();
  o.type = type; o.frequency.setValueAtTime(f, t); if (detune) o.detune.setValueAtTime(detune, t);
  fl.type = 'lowpass'; fl.frequency.value = lp;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(fl); fl.connect(g); g.connect(bus || sfxBus);
  o.start(t); o.stop(t + dur + 0.05);
}
function duck(sec = 0.6, to = 0.3) {
  if (!duckG) return;
  const t = AC.currentTime;
  duckG.gain.cancelScheduledValues(t); duckG.gain.setValueAtTime(duckG.gain.value, t);
  duckG.gain.linearRampToValueAtTime(to, t + 0.05); duckG.gain.linearRampToValueAtTime(1, t + sec);
}
const soft = () => (cfg.calm ? 0.55 : 1);
/* warm, short, soft: a marimba-ish pluck is a sine with its octave decaying faster */
function pluck(f, t, v = 0.11, d = 0.35) { note(f, t, d, { vol: v * soft(), lp: 3000 }); note(f * 2, t, d * 0.5, { vol: v * 0.35 * soft(), lp: 3000 }); }
const NOW = () => (ctx() ? AC.currentTime + 0.01 : 0);
export const fx = {
  click() { if (!cfg.sfx || !ctx()) return; note(700, NOW(), 0.05, { type: 'triangle', vol: 0.04 * soft(), lp: 2200 }); },
  right() { if (!cfg.sfx || !ctx()) return; const t = NOW(); duck(); pluck(659.3, t); pluck(987.8, t + 0.09, 0.1); },
  wrong() { if (!cfg.sfx || !ctx()) return; const t = NOW(); duck(); note(330, t, 0.22, { type: 'triangle', vol: 0.07 * soft(), lp: 1200 }); note(262, t + 0.12, 0.28, { type: 'triangle', vol: 0.06 * soft(), lp: 1000 }); },
  coin() { if (!cfg.sfx || !ctx()) return; const t = NOW(); duck(0.4); pluck(1318.5, t, 0.08, 0.18); pluck(1975.5, t + 0.07, 0.07, 0.22); },
  finish() { if (!cfg.sfx || !ctx()) return; const t = NOW(); duck(1.4); [523.3, 659.3, 784, 1046.5].forEach((f, i) => pluck(f, t + i * 0.1, 0.1, 0.5)); },
  medal() { if (!cfg.sfx || !ctx()) return; const t = NOW(); duck(1.8); [784, 987.8, 1174.7].forEach((f) => note(f, t, 1.4, { vol: 0.05 * soft(), attack: 0.01, lp: 5000 })); [1568, 1975.5].forEach((f, i) => note(f, t + 0.25 + i * 0.12, 0.8, { vol: 0.03 * soft() })); },
  unlock() { if (!cfg.sfx || !ctx()) return; const t = NOW(); duck(1); [392, 523.3, 659.3, 784, 1046.5].forEach((f, i) => pluck(f, t + i * 0.055, 0.07, 0.3)); },
  bell() { if (!cfg.sfx || !ctx()) return; const t = NOW(); duck(1.6); [784, 1174.7].forEach((f, i) => note(f, t + i * 0.16, 1.2, { vol: 0.08 * soft() })); },
};
export function speaking(on) { if (AC && duckG) { const t = AC.currentTime; duckG.gain.cancelScheduledValues(t); duckG.gain.linearRampToValueAtTime(on ? 0.25 : 1, t + 0.2); } }

/* ── the scores ──────────────────────────────────────────────────────────── */
const MAJOR = [0, 2, 4, 5, 7, 9, 11], MINOR = [0, 2, 3, 5, 7, 8, 10], MIXO = [0, 2, 4, 5, 7, 9, 10], DORIAN = [0, 2, 3, 5, 7, 9, 10];
/* bpm, root (MIDI), scale, chord degrees one per bar (looped to `bars`), seed, lead voice, percussion */
export const TRACKS = {
  home:     { bpm: 84, root: 60, scale: MAJOR, prog: [0, 5, 3, 4, 0, 5, 1, 4], bars: 24, seed: 11, lead: 'box', perc: 'none', name: 'Home: the morning tune' },
  games:    { bpm: 108, root: 62, scale: MAJOR, prog: [0, 3, 4, 0, 5, 3, 4, 4], bars: 32, seed: 23, lead: 'pluck', perc: 'tick', name: 'Play: the arcade bounce' },
  market:   { bpm: 92, root: 67, scale: MAJOR, prog: [0, 3, 0, 4, 0, 3, 4, 0], bars: 24, seed: 31, lead: 'pluck', perc: 'shaker', name: 'Market Row Morning' },
  harbour:  { bpm: 74, root: 62, scale: MIXO, prog: [0, 6, 3, 0, 0, 6, 4, 0], bars: 24, seed: 43, lead: 'sine', perc: 'none', name: 'Old Harbour' },
  clock:    { bpm: 88, root: 57, scale: DORIAN, prog: [0, 3, 6, 2, 0, 3, 4, 0], bars: 24, seed: 57, lead: 'box', perc: 'tick', name: 'Clocktower Square' },
  exchange: { bpm: 72, root: 65, scale: MAJOR, prog: [0, 2, 3, 4, 5, 3, 1, 4], bars: 24, seed: 61, lead: 'sine', perc: 'none', name: 'Exchange Quarter' },
  works:    { bpm: 96, root: 64, scale: MINOR, prog: [0, 5, 6, 4, 0, 5, 3, 4], bars: 32, seed: 73, lead: 'pluck', perc: 'clank', name: 'The Works' },
  festival: { bpm: 100, root: 70, scale: MAJOR, prog: [0, 4, 5, 3, 0, 4, 3, 4], bars: 32, seed: 89, lead: 'box', perc: 'shaker', name: 'Festival Night' },
};
export const secondsOf = (k) => { const T = TRACKS[k]; return T.bars * 4 * 60 / T.bpm; };
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const deg = (T, d, oct = 0) => T.root + T.scale[((d % 7) + 7) % 7] + 12 * (oct + Math.floor(d / 7));

/* The melody: a two-bar motif from the seed, answered and varied (A A' B A''), so the
   tune is a tune and not a random walk. Eighth notes; null is a rest. */
const scoreCache = {};
export function score(k) {
  if (scoreCache[k]) return scoreCache[k];
  const T = TRACKS[k], r = rng(T.seed);
  const motif = () => { const m = []; let d = 2 + Math.floor(r() * 3); for (let i = 0; i < 16; i++) { if (r() < 0.28 && i % 4) { m.push(null); continue; } d += [-2, -1, -1, 0, 1, 1, 2][Math.floor(r() * 7)]; d = Math.max(0, Math.min(9, d)); m.push(d); } return m; };
  const A = motif(), B = motif();
  const vary = (m, s) => m.map((d, i) => (d == null ? null : i % 8 === 7 ? d + s : d));
  const phrase = [A, vary(A, 1), B, vary(A, -1)];
  const mel = [];
  for (let bar = 0; bar < T.bars; bar += 2) mel.push(...phrase[(bar / 2) % 4]);
  return (scoreCache[k] = { mel, eighths: T.bars * 8 });
}

function play8(T, i, t) {
  const sec8 = 30 / T.bpm, bar = Math.floor(i / 8), inBar = i % 8, chord = T.prog[bar % T.prog.length];
  const S = score(T.key), m = S.mel[i];
  if (inBar === 0) {
    /* pad: the chord, soft attack, held the bar */
    [0, 2, 4].forEach((x) => note(hz(deg(T, chord + x, -1)), t, sec8 * 8.2, { type: 'sine', vol: 0.028, attack: 0.25, bus: musicBus, lp: 1400 }));
    note(hz(deg(T, chord, -2)), t, sec8 * 3.5, { type: 'triangle', vol: 0.07, attack: 0.02, bus: musicBus, lp: 600 });
  }
  if (inBar === 4) note(hz(deg(T, chord + 4, -2)), t, sec8 * 3, { type: 'triangle', vol: 0.05, bus: musicBus, lp: 600 });
  if (m != null) {
    const f = hz(deg(T, m, T.lead === 'box' ? 1 : 0));
    if (T.lead === 'box') { note(f, t, sec8 * 1.6, { type: 'triangle', vol: 0.035, bus: musicBus, lp: 3800 }); note(f * 2, t, sec8 * 0.8, { type: 'sine', vol: 0.012, bus: musicBus }); }
    else if (T.lead === 'pluck') note(f, t, sec8 * 1.3, { type: 'triangle', vol: 0.045, bus: musicBus, lp: 2400 });
    else note(f, t, sec8 * 2.2, { type: 'sine', vol: 0.05, attack: 0.04, bus: musicBus, lp: 2000 });
  }
  if (T.perc !== 'none' && (inBar % 2 === 0 || T.perc === 'shaker')) noise(t, T.perc, inBar);
}
let NB = null;
function noise(t, kind, inBar) {
  const c = ctx(); if (!c) return;
  if (!NB) { NB = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate); const d = NB.getChannelData(0); const r = rng(5); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; }
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = NB; f.type = kind === 'clank' ? 'bandpass' : 'highpass'; f.frequency.value = kind === 'clank' ? 1800 : kind === 'tick' ? 6000 : 7000;
  const v = kind === 'shaker' ? (inBar % 2 ? 0.012 : 0.02) : kind === 'clank' ? (inBar === 0 ? 0.03 : 0.012) : 0.016;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'clank' ? 0.12 : 0.05));
  s.connect(f); f.connect(g); g.connect(musicBus); s.start(t); s.stop(t + 0.15);
}

function tick() {
  if (!track || !AC) return;
  const T = TRACKS[track], sec8 = 30 / T.bpm, S = score(track);
  while (nextT < AC.currentTime + 0.35) { play8({ ...T, key: track }, step % S.eighths, nextT); nextT += sec8; step++; }
}
function audible() { return cfg.music && !cfg.calm && !cfg.lesson && cfg.volume > 0; }
function startTrack(k) {
  stopTrack();
  if (!k || !TRACKS[k] || !audible() || !ctx()) return;
  track = k; step = 0; nextT = AC.currentTime + 0.12;
  musicBus.gain.cancelScheduledValues(AC.currentTime); musicBus.gain.setValueAtTime(0.0001, AC.currentTime);
  musicBus.gain.linearRampToValueAtTime(0.55, AC.currentTime + 1.2);
  timer = setInterval(tick, 100); tick();
}
function stopTrack() { clearInterval(timer); timer = 0; track = null; }

/* the app asks for a loop; it starts on the first real gesture (browsers require one) */
export function music(k) {
  want = k;
  if (!audible()) { stopTrack(); return; }
  if (track === k) return;
  if (AC && AC.state !== 'closed') startTrack(k);
}
export function gesture() { if (want && audible() && track !== want) startTrack(want); }
export function set(o) {
  Object.assign(cfg, o);
  if (master) master.gain.setTargetAtTime(cfg.volume, AC.currentTime, 0.05);
  if (!audible()) stopTrack(); else if (want && track !== want && AC) startTrack(want);
}
export function state() { return { track, want, playing: !!track && !!AC && AC.state === 'running', ...cfg }; }
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!AC) return;
    if (document.hidden) AC.suspend().catch(() => {}); else AC.resume().catch(() => {});
  });
  ['pointerdown', 'keydown'].forEach((e) => addEventListener(e, () => { ctx(); gesture(); }, { capture: true, passive: true }));
}
