/* lessonplayer.js — the animated explainer stage.

   The Bizzing Bee treatment: a concept is TAUGHT first — narrated, animated,
   watchable — and the reading card with its question sits underneath, so the
   order is watch, read, answer.

   The rules this player keeps, inherited from the family's production brief:

   · THE AUDIO IS THE CLOCK. A beat ends when its clip ends — never on a
     timer that hopes to match. Each beat's dur (measured from the real clip)
     is only the fallback for a browser that refuses to play audio at all.
   · Generated MOTION is banned. The model narrated the lines and painted the
     poses; every movement on this stage is composited here, from state, by
     CSS transition. Structural truths live in the state object, so a beat
     replayed after an interruption rebuilds the same stage.
   · Both keyboard and touch, like every game (space pauses, R restarts,
     → skips a beat), and prefers-reduced-motion turns transitions off while
     the teaching still advances — motion here is delivery, not content.

   The stage vocabulary is deliberately tiny — avatar(pose), show(item),
   banner(text), sort(item, side), swap(item), weather(kind) — and scripts
   may only speak it. A vocabulary the renderer ignores is worse than none
   (the family's rule about fields with no effect), so mount() THROWS on an
   unknown action rather than shrugging. */

import { POSES, LESSON_MEDIA } from './lessons-gen.js';
import { ico } from './art.js';
import { esc } from './ui.js';

const ITEM_ICON = { roti: 'roti', roof: 'home', medicine: 'medicine',
  cake: 'cake', game: 'arcade', chain: 'chain', umbrella: 'parasol' };

let P = null;   /* the one live player: { lid, i, audio, playing, done } */

export function hasLesson(id) { return !!LESSON_MEDIA[id]; }

export function lessonBlock(id) {
  const L = LESSON_MEDIA[id];
  if (!L) return '';
  return `<div class="card lesson" id="lessonstage" data-lesson="${id}">
    <div class="row"><div class="grow"><div class="eyebrow">Nana Bizz explains</div>
      <h3 style="font-size:17px">${esc(L.title)}</h3></div>
      <span class="pill">${Math.round(L.beats.reduce((t, b) => t + b.dur, 0))}s</span></div>
    <div class="lstage-holder"></div>
    <p class="lcap small"></p>
    <div class="row" style="gap:8px;margin-top:4px">
      <button class="btn sm" data-l="toggle">▶ Watch</button>
      <button class="btn ghost sm" data-l="restart" hidden>↻ Again</button>
      <span class="ldots grow" style="text-align:right"></span>
    </div>
  </div>`;
}

/* ── stage state, rebuilt cumulatively so any beat can be re-entered ──── */
function freshState() {
  return { pose: 'talk', weather: null, banner: null, cols: false,
           items: {}, order: [], swapping: null };
}
function apply(st, stage) {
  for (const cmd of stage.split(';').map((s) => s.trim()).filter(Boolean)) {
    const m = cmd.match(/^(\w+)\(([^)]*)\)$/);
    if (!m) throw new Error('lesson stage: unreadable action "' + cmd + '"');
    const [, op, args] = m;
    const a = args.split(',').map((s) => s.trim());
    if (op === 'avatar') st.pose = a[0];
    else if (op === 'show') { if (!st.items[a[0]]) { st.items[a[0]] = 'tray'; st.order.push(a[0]); } st.swapping = null; }
    else if (op === 'banner') {
      st.banner = args.trim();
      /* NEEDS/WANTS name a column: the tray becomes that column */
      const side = args.trim() === 'NEEDS' ? 'needs' : args.trim() === 'WANTS' ? 'wants' : null;
      if (side) { st.cols = true; for (const k of st.order) if (st.items[k] === 'tray') st.items[k] = side; }
    }
    else if (op === 'sort') { st.cols = true; st.items[a[0]] = a[1]; st.swapping = null; }
    else if (op === 'swap') st.swapping = a[0];
    else if (op === 'weather') st.weather = a[0] === 'rain' ? 'rain' : 'sun';
    else throw new Error('lesson stage: unknown action "' + op + '"');
  }
  return st;
}
function stateAt(L, upto) {
  const st = freshState();
  for (let i = 0; i <= upto; i++) {
    /* a banner is the beat's own emphasis, not a plaque: it clears unless
       this beat restates it (the column conversions it triggered persist) */
    st.banner = null;
    apply(st, L.beats[i].stage);
  }
  return st;
}

/* ── drawing ──────────────────────────────────────────────────────────── */
function itemHTML(k, place, swapping) {
  const x = { tray: 150, needs: 118, wants: 258 }[place] || 150;
  return `<div class="litem${swapping === k ? ' lswap' : ''}" data-k="${k}" style="--x:${x}px">
    ${ico(ITEM_ICON[k] || k, '❔', 30)}</div>`;
}
function drawStage(holder, st) {
  const pose = POSES['nana-' + st.pose] ? 'nana-' + st.pose : st.pose;
  const pv = POSES[pose] || POSES['talk'] || Object.values(POSES)[0];
  const needs = st.order.filter((k) => st.items[k] === 'needs');
  const wants = st.order.filter((k) => st.items[k] === 'wants');
  const tray = st.order.filter((k) => st.items[k] === 'tray');
  holder.innerHTML = `
    <div class="lstage${st.weather ? ' w-' + st.weather : ''}">
      ${st.weather === 'rain' ? '<div class="lrain" aria-hidden="true">' + Array.from({ length: 14 }, (_, i) => `<i style="left:${(i * 7.3) % 100}%;animation-delay:${(i * 0.17) % 1.1}s"></i>`).join('') + '</div>' : ''}
      ${st.weather === 'sun' ? '<div class="lsun" aria-hidden="true"></div>' : ''}
      <img class="lnana lnana-${st.pose}" src="${pv.src}" alt="" style="height:78%">
      <div class="lright">
        ${st.cols ? `<div class="lcols">
          <div class="lcol"><b>Needs</b><div class="lslot">${needs.map((k) => itemHTML(k, 'needs', st.swapping)).join('')}</div></div>
          <div class="lcol"><b>Wants</b><div class="lslot">${wants.map((k) => itemHTML(k, 'wants', st.swapping)).join('')}</div></div>
        </div>` : ''}
        <div class="ltray">${tray.map((k) => itemHTML(k, 'tray', st.swapping)).join('')}</div>
      </div>
      ${st.banner ? `<div class="lbanner">${esc(st.banner)}</div>` : ''}
    </div>`;
}

/* ── the machine ──────────────────────────────────────────────────────── */
function el() { return document.getElementById('lessonstage'); }
function refresh() {
  const root = el(); if (!root || !P) return;
  const L = LESSON_MEDIA[P.lid];
  drawStage(root.querySelector('.lstage-holder'), stateAt(L, P.i));
  root.querySelector('.lcap').textContent = L.beats[P.i].line;
  root.querySelector('.ldots').innerHTML = L.beats.map((_, i) =>
    `<i class="ldot${i < P.i ? ' past' : i === P.i ? ' now' : ''}"></i>`).join('');
  const t = root.querySelector('[data-l="toggle"]');
  t.textContent = P.done ? '▶ Watch again' : P.playing ? '❚❚ Pause' : '▶ Watch';
  root.querySelector('[data-l="restart"]').hidden = !(P.playing || P.done || P.i > 0);
}
function playBeat() {
  const L = LESSON_MEDIA[P.lid], b = L.beats[P.i];
  clearTimeout(P.timer);
  if (P.audio) { P.audio.onended = null; P.audio.pause(); }
  P.audio = new Audio(b.src);
  P.audio.onended = () => advance();
  refresh();
  P.audio.play().catch(() => {
    /* a browser that refuses audio still gets the lesson: the measured
       duration stands in as the clock it can no longer be */
    P.timer = setTimeout(() => advance(), b.dur * 1000);
  });
}
function advance() {
  const L = LESSON_MEDIA[P.lid];
  if (P.i + 1 >= L.beats.length) { P.playing = false; P.done = true; refresh(); return; }
  P.i += 1; playBeat();
}
function toggle() {
  const L = LESSON_MEDIA[P.lid];
  if (P.done) { P.done = false; P.i = 0; P.playing = true; playBeat(); return; }
  if (P.playing) { P.playing = false; P.audio && P.audio.pause(); clearTimeout(P.timer); refresh(); return; }
  P.playing = true;
  if (P.audio && P.audio.currentTime > 0 && !P.audio.ended) { P.audio.play().catch(() => {}); refresh(); }
  else playBeat();
}
function stop() {
  if (!P) return;
  clearTimeout(P.timer);
  if (P.audio) { P.audio.onended = null; P.audio.pause(); }
  document.removeEventListener('keydown', P.keys);
  P = null;
}

/* Called after every render. A stage in the DOM gets a live player; a
   navigation that removed the stage silences it — no narration haunting the
   arcade from two screens ago. */
export function mountLesson() {
  const root = el();
  if (!root) { stop(); return; }
  const lid = root.dataset.lesson;
  if (P && P.lid === lid) { refresh(); wire(root); return; }
  stop();
  P = { lid, i: 0, audio: null, playing: false, done: false, timer: 0,
    keys: (e) => {
      if (!el()) return;
      if (e.key === ' ') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight' && P.playing) advance();
      else if (e.key === 'r' || e.key === 'R') { P.i = 0; P.done = false; P.playing = true; playBeat(); }
    } };
  document.addEventListener('keydown', P.keys);
  refresh(); wire(root);
}
function wire(root) {
  root.querySelector('[data-l="toggle"]').onclick = toggle;
  root.querySelector('[data-l="restart"]').onclick = () => { P.i = 0; P.done = false; P.playing = true; playBeat(); };
}
