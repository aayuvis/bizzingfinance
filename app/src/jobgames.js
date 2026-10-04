/* jobgames.js — a day's work, with the work put back in.

   A job used to be a button: tap it, money appears. That is the single most
   repeated action in the app and it had no play in it at all, which is most
   of why nobody could stay for five minutes. Every job is now a short game,
   and how well you do it decides what it pays.

   Four mechanics, skinned per job, so the Row and the Harbour do not feel
   like the same afternoon:

     stack   drop a swinging crate onto the pile — miss and the pile narrows
     trim    sort arriving weight port or starboard and keep the boat level
     sweep   clear the row before the bell, and a clean run chains
     runner  three lanes, post every door, and the street is not empty

   Each is drawn, not boxed (owner, 3 Oct 2026: "not functional or boring —
   make them super kool"): the child's own place painted behind, the job's
   own scene in front, a 3-2-1-GO, the juice from gamefx.js, a meter toward
   par, three hearts where a run can go wrong, and a clock or a count so
   every shift ends. Reduced motion keeps the game and drops the shaking.

   Rules that are not negotiable here. BOTH keyboard and touch, inherited
   from Bizzing Bee. Wages go through arcade.js's payout() so there is still
   exactly one place that decides what play is worth. And pay is scaled by
   SKILL and clamped at both ends (sim.JOB_FLOOR / JOB_CEIL) — a bad shift
   still pays because the work was done, and a great one cannot become a
   jackpot, because a wage that swings like a slot machine teaches the exact
   thing CONCEPT §6.3 forbids. Nothing here is random-for-reward: the dice
   decide what arrives, never what it is worth. */

import { esc, sfx, clamp } from './ui.js';
import { JOBS } from './content.js';
import { hud, endCard } from './arcade.js';
import * as sim from './sim.js';
import { R } from './runtime.js';
import { fx, countdown, plate, backdrop, rr, shadow, crate, ease, still } from './gamefx.js';

const K = () => sim.kid(R.s);
const W = 360, H = 300;

/* the table lives in jobtable.js, so the Town can list jobs without loading the games */
import { JOB_GAME } from './jobtable.js';
export { JOB_GAME };
export { hasJobGame } from './jobtable.js';

/* Difficulty rises with the ladder rather than with the clock, so a child who
   is better at this is playing a harder game, not a longer one. */
function tier(c) { return Math.min(6, Math.floor(((c.learn && c.learn.level) || 1) / 4)); }

function tok(n, f) {
  const cs = getComputedStyle(document.documentElement);
  return ((cs.getPropertyValue(n) || f).trim()) || f;
}

/* ── drawing helpers this file shares ─────────────────────────────────────
   Text on the canvas is always outlined, because it sits on a painting. */
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
function heart(ctx, x, y, s, full) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 16, s / 16);
  ctx.beginPath(); ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-9, -1, -7, -9, 0, -4); ctx.bezierCurveTo(7, -9, 9, -1, 0, 5); ctx.closePath();
  ctx.fillStyle = full ? '#E0483E' : 'rgba(120,120,130,.35)'; ctx.fill();
  ctx.lineWidth = 1.6; ctx.strokeStyle = full ? '#8E1F18' : 'rgba(60,60,70,.5)'; ctx.stroke();
  if (full) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(-3.5, -3, 1.6, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
/* a progress meter toward par, top-left: the bar fills green to par, gold past it */
function meter(ctx, score, par, unit) {
  const x = 8, y = 8, w = 132, h = 16, cap = Math.max(par * 1.5, score + 1);
  ctx.save();
  ctx.fillStyle = dark() ? 'rgba(10,14,24,.72)' : 'rgba(255,252,245,.85)';
  rr(ctx, x - 3, y - 3, w + 6, h + 6, 11); ctx.fill();
  ctx.fillStyle = dark() ? 'rgba(255,255,255,.12)' : 'rgba(28,42,46,.12)';
  rr(ctx, x, y, w, h, 8); ctx.fill();
  const k = Math.min(1, score / cap), px = x + w * (par / cap);
  if (k > 0) {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#2FA866'); g.addColorStop(Math.min(0.99, par / cap), '#5CCB7E'); g.addColorStop(1, '#F0B429');
    ctx.fillStyle = score >= par ? '#F0B429' : g;
    rr(ctx, x, y, Math.max(h, w * k), h, 8); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; rr(ctx, x + 3, y + 2, Math.max(4, w * k - 6), 4, 2); ctx.fill();
  }
  ctx.strokeStyle = dark() ? '#FFF6DA' : '#1C2A2E'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(px, y - 2); ctx.lineTo(px, y + h + 2); ctx.stroke();
  ctx.restore();
  label(ctx, `${score} ${unit}`, x + 8, y + h / 2 + 0.5, { size: 11, align: 'left' });
  label(ctx, score >= par ? 'par ✓' : 'par', px, y + h + 11, { size: 9, weight: 700 });
}
function pill(ctx, text, x, y, { warn = false } = {}) {
  ctx.font = '800 12px Sono, ui-monospace, monospace';
  const w = ctx.measureText(text).width + 16;
  ctx.fillStyle = warn ? 'rgba(196,69,60,.92)' : (dark() ? 'rgba(10,14,24,.72)' : 'rgba(255,252,245,.85)');
  rr(ctx, x - w, y, w, 20, 10); ctx.fill();
  ctx.fillStyle = warn ? '#fff' : (dark() ? '#FFF6DA' : '#1C2A2E');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x - w / 2, y + 10.5);
  return w;
}
function lives(ctx, n, of, xRight, y) {
  for (let i = 0; i < of; i++) heart(ctx, xRight - 10 - (of - 1 - i) * 19, y + 10, 16, i < n);
}
/* at night the drawn foreground is pulled toward the plate's dusk, so it sits in it */
function night(ctx, a = 0.22) {
  if (!dark()) return;
  ctx.fillStyle = `rgba(16,22,48,${a})`; ctx.fillRect(0, 0, W, H);
}
function cobbles(ctx, y0, h, scroll = 0) {
  ctx.fillStyle = '#9C8A6C'; ctx.fillRect(0, y0, W, h);
  const rowH = 10, cw = 22, tones = ['#BCAA88', '#B4A17E', '#C2B08E', '#B09D7A'];
  for (let r = 0; r * rowH < h; r++) {
    const y = y0 + r * rowH, off = (((r % 2) * 11 - scroll) % cw + cw) % cw;
    for (let x = off - cw, k = 0; x < W + cw; x += cw, k++) {
      const n = Math.floor((x + scroll) / cw) + r * 7;
      ctx.fillStyle = tones[((n % 4) + 4) % 4];
      rr(ctx, x + 1, y + 1, cw - 2, rowH - 2, 3.5); ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(255,240,210,.22)'; ctx.fillRect(0, y0, W, 2);
}
/* a tiny deterministic hash, so a street is the same street all shift */
const hash = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/* ── the shared shell ─────────────────────────────────────────────────────
   Every job game is the same object shape as the arcade's: mount/stop/key/
   act/view. This builds all of that from a spec so a new mechanic is a step
   function and a draw function, not another 120 lines of plumbing.

   The shell also owns the feel every job shares: a 3-2-1-GO before anything
   moves (the game's step does not run during it), the juice layer, the meter
   toward par, and a "Shift done" flourish before the end card. */
function shell(spec) {
  const { jobId, st, step, draw, onKey, onPoint, onDrag, controls, hint, finishLine } = spec;
  const job = JOBS.find((j) => j.id === jobId) || { name: 'Work', who: 'the town' };
  const cfg = JOB_GAME[jobId];
  const FX = fx(), CD = countdown(), img = plate((K() && K().world) || 0);
  let raf = 0, last = 0, ctx = null, cv = null, T = 0, said = 3, dpr = 1;
  st.over = false; st.overT = 0;
  const live = () => CD.done && !st.over && !st.done;

  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };

  const end = () => {
    if (st.done) return;
    st.done = true;
    stop();
    /* Skill in, wage out — and sim.doJob clamps it at both ends. */
    st.quality = st.score / cfg.par;
    st.best = sim.setJobBest(K(), jobId, st.score);
    st.won = sim.doJob(K(), jobId, st.quality);
    if (st.won > 0) sfx.coin();
    R.render();
  };
  /* The game says it is over; the shell plays the flourish, then pays. */
  const finish = () => {
    if (st.over || st.done) return;
    st.over = true; st.overT = 0;
    FX.coins(W / 2, H / 2 - 10, 12);
    FX.burst(W / 2, H / 2 - 10, { n: 26, colors: ['#F0B429', '#FFF3C4', '#5CCB7E', '#3FBCC8'], speed: 0.3 });
    sfx.level();
  };
  st.end = finish;

  const paint = () => {
    const amb = still() ? 0 : T;
    const after = FX.begin(ctx);
    ctx.clearRect(0, 0, W, H);
    draw(ctx, { img, T: amb, FX });
    after();
    FX.draw(ctx, W, H);
    meter(ctx, st.score, cfg.par, spec.unit);
    if (spec.hud) spec.hud(ctx);
    CD.draw(ctx, W, H);
    if (st.over) {
      const k = Math.min(1, st.overT / 380), s = ease.back(k);
      ctx.save();
      ctx.fillStyle = `rgba(20,24,36,${0.38 * k})`; ctx.fillRect(0, 0, W, H);
      ctx.translate(W / 2, H / 2 - 8); ctx.scale(s, s); ctx.rotate(-0.04);
      ctx.fillStyle = '#F0B429'; rr(ctx, -128, -34, 256, 68, 16); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#8A5B00'; rr(ctx, -128, -34, 256, 68, 16); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.3)'; rr(ctx, -118, -28, 236, 10, 5); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.translate(W / 2, H / 2 - 8); ctx.scale(s, s); ctx.rotate(-0.04);
      label(ctx, 'SHIFT DONE!', 0, -6, { size: 32, serif: true, color: '#3A2400', stroke: '#FFF3C4' });
      label(ctx, `${st.score} ${spec.unit} · par ${cfg.par}`, 0, 20, { size: 12, color: '#3A2400', stroke: '#FFE7A0' });
      ctx.restore();
    }
  };

  const loop = (ts) => {
    if (st.done) return;
    /* the wall's clock, not the frame rate's (audit v4); the shift's logic runs in slices of
       at most 50 ms so nothing falls through a catcher on a slow frame */
    const dt = Math.min(1000, ts - (last || ts)); last = ts;
    T += dt;
    const was = CD.done;
    CD.step(dt);          /* stepped every frame so the GO! can fade out */
    if (!was) {
      const n = CD.done ? 0 : Math.ceil((2400 - T) / 800);
      if (n < said) { said = n; sfx.click(); }
    } else if (!st.over) { for (let left = dt; left > 0.0001 && !st.over; left -= 50) step(Math.min(50, left), finish); }
    else { st.overT += dt; if (st.overT >= (still() ? 500 : 1500)) { end(); return; } }
    FX.step(dt);
    /* a drawing fault must never stop the shift: the clock keeps running */
    if (ctx) { try { paint(); } catch (e) { if (ctx.reset) { ctx.reset(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); } } }
    raf = requestAnimationFrame(loop);
  };

  return {
    id: 'job:' + jobId,
    /* A read-only snapshot, so a headless driver can PLAY the game rather
       than mash keys at it — the only way to find out how long a competent
       run actually takes, which is the number that decides whether any of
       this is worth a child's evening. `go` is false during the countdown. */
    __st: () => Object.assign(spec.probe(), { go: live(), over: !!st.over, done: !!st.done }),
    mount() {
      cv = document.getElementById('jobCanvas');
      if (!cv) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx = cv.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!st.done) { last = 0; stop(); raf = requestAnimationFrame(loop); }
      /* Touch is not an afterthought: the canvas itself is a control. */
      const at = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };
      if (onPoint) cv.onpointerdown = (e) => { if (live()) onPoint(...at(e)); };
      if (onDrag) cv.onpointermove = (e) => { if (live() && (e.buttons || e.pointerType === 'touch')) onDrag(...at(e)); };
    },
    stop,
    key(e) {
      if (st.done) { if (e.key === 'Enter') { spec.quit(); R.render(); } return; }
      if (live()) onKey(e);
      else if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && e.preventDefault) e.preventDefault();
    },
    act(n, arg) { if (spec.onAct && live()) spec.onAct(n, arg); },
    view() {
      if (st.done) {
        const grade = st.quality >= 1.45 ? ['🏅', 'A cracking shift']
          : st.quality >= 1 ? ['👍', 'A good shift']
          : st.quality >= 0.7 ? ['🙂', 'Got it done']
          : ['😅', 'Hard going'];
        return `<div class="stack">${hud([esc(job.name)])}
          ${endCard(grade[0], grade[1], `${st.score} ${spec.unit} · par ${cfg.par}${st.best ? ' · <b>new personal best</b>' : ''}`,
            st.won, finishLine(st), job.whoArt || 'pip')}</div>`;
      }
      return `<div class="stack">
        ${hud(spec.boxes())}
        <div class="stage jobstage" style="min-height:0;padding:12px">
          <div class="row" style="gap:8px">
            <span class="grow"><b style="font-size:15px">${esc(cfg.verb)}</b>
              <div class="small muted">for ${esc(job.who)}</div></span>
            <span class="pill">best ${sim.jobBest(K(), jobId)}</span>
          </div>
          <canvas id="jobCanvas" role="img" aria-label="${esc(cfg.verb)} — ${esc(hint)}" style="width:100%;max-width:400px;margin:0 auto;height:auto;
            aspect-ratio:${W}/${H};border-radius:var(--r-md);display:block;touch-action:none;box-shadow:0 6px 18px rgba(20,24,36,.18)"></canvas>
          ${controls()}
          <p class="hint">${esc(hint)}</p>
        </div></div>`;
    },
  };
}

/* ── stack ────────────────────────────────────────────────────────────────
   A crate swings from the crane; you drop it. Whatever hangs over the edge
   falls off and the pile gets narrower. Land it within a hand's width and it
   snaps square ("Perfect!") and keeps its width. Miss the pile altogether and
   the scaffold wobbles — three wobbles and the shift is over, so one bad drop
   is a lesson, not the end. The shift is sixteen crates or a minute. */
const STACK_LOOK = { crates: 'crate', haul: 'sack', counter: 'carton' };
const STACK_TINT = {
  crate: ['#C98A46', '#B9773A', '#D49B57', '#A86B34', '#C2813F'],
  sack: ['#CDB07A', '#BFA06A', '#D8BD88', '#C4A572'],
  carton: ['#D9A866', '#C9955A', '#E0B575', '#CF9F60'],
};
function cargoBox(ctx, look, x, y, w, h, tint) {
  /* a wide layer is a row of separate pieces, not one long plank */
  const n = Math.max(1, Math.round(w / 46));
  if (n > 1) { const pw = w / n; for (let i = 0; i < n; i++) cargoOne(ctx, look, x + i * pw, y, pw, h, i % 2 ? shade(tint) : tint); return; }
  cargoOne(ctx, look, x, y, w, h, tint);
}
function shade(hex) {
  const v = parseInt(hex.slice(1), 16), f = (c) => Math.max(0, Math.min(255, Math.round(c * 0.92)));
  return '#' + [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
}
function cargoOne(ctx, look, x, y, w, h, tint) {
  if (w < 6) { ctx.fillStyle = tint; ctx.fillRect(x, y, Math.max(0, w), h); return; }
  if (look === 'sack') {
    ctx.fillStyle = tint; rr(ctx, x, y + 1, w, h - 1, Math.min(9, w / 3)); ctx.fill();
    ctx.strokeStyle = 'rgba(90,64,30,.7)'; ctx.lineWidth = 1.6; rr(ctx, x + 0.8, y + 1.8, w - 1.6, h - 2.6, Math.min(9, w / 3)); ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(90,64,30,.45)';
    ctx.beginPath(); ctx.moveTo(x + 4, y + h / 2 + 1); ctx.lineTo(x + w - 4, y + h / 2 + 1); ctx.stroke(); ctx.setLineDash([]);
    if (w > 22) { ctx.fillStyle = 'rgba(90,64,30,.55)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 3, 4, 2.4, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,245,220,.35)'; rr(ctx, x + 3, y + 3, w - 6, 3, 2); ctx.fill();
  } else if (look === 'carton') {
    ctx.fillStyle = tint; rr(ctx, x, y, w, h, 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x + w * 0.72, y, w * 0.28, h);
    ctx.strokeStyle = 'rgba(100,66,26,.6)'; ctx.lineWidth = 1.4; rr(ctx, x + 0.7, y + 0.7, w - 1.4, h - 1.4, 2); ctx.stroke();
    if (w > 10) { ctx.fillStyle = 'rgba(240,226,190,.8)'; ctx.fillRect(x + w / 2 - 3, y, 6, h); }
    if (w > 34) {
      ctx.fillStyle = '#FFF8E8'; rr(ctx, x + 6, y + 5, 18, h - 10, 2); ctx.fill();
      ctx.fillStyle = '#C4453C'; ctx.beginPath(); ctx.arc(x + 11, y + h / 2, 2.4, 0, Math.PI * 2); ctx.arc(x + 19, y + h / 2, 2.4, 0, Math.PI * 2); ctx.fill();
    }
  } else crate(ctx, x, y, w, h, tint);
}

function stackGame(jobId, quit) {
  const c = K(), t = tier(c);
  const look = STACK_LOOK[jobId] || 'crate', tints = STACK_TINT[look];
  const SHIFT = 16, CLOCK = 60000, CH = 26, BASEW = 120, BASEX = (W - BASEW) / 2, BASEY = H - 42, HOOK = 66, SNAP = 5;
  const st = { score: 0, landed: 0, done: false, w: BASEW, x: 0, dir: 1, pile: [], falling: null, msg: '', lives: 3, combo: 0,
    left: CLOCK, cam: 0, debris: [], land: 0, misses: 0 };
  const top = () => (st.pile.length ? st.pile[st.pile.length - 1] : { x: BASEX, w: BASEW });
  const speed = () => 0.11 + t * 0.015 + st.landed * 0.007;
  const topScreen = () => BASEY - st.pile.length * CH + st.cam;

  const drop = () => {
    if (st.done || st.over || st.falling) return;
    st.falling = { x: st.x, w: st.w, y: HOOK, vy: 0.12, tint: tints[(st.pile.length + st.misses) % tints.length] };
  };
  const land = (FX) => {
    const f = st.falling; st.falling = null;
    const tp = top(), ty = topScreen();
    if (Math.abs(f.x - tp.x) <= SNAP) {
      /* a square drop wins back a little width, so care keeps a run alive */
      const nw = Math.min(BASEW, tp.w + 8), nx = clamp(tp.x - (nw - tp.w) / 2, 0, W - nw);
      st.pile.push({ x: nx, w: nw, tint: f.tint });
      st.w = nw;
      /* square pays four: the skill is the score */
      st.combo++; st.score += 4; st.landed++; st.land = 1;
      st.msg = st.combo >= 3 ? `${st.combo} square in a row` : 'Dead square!';
      FX.pop(tp.x + tp.w / 2, ty - CH - 10, st.combo >= 3 ? `Perfect x${st.combo} +4` : 'Perfect! +4', { color: '#8A5B00', size: 18 });
      FX.coins(tp.x + tp.w / 2, ty - CH, 4 + Math.min(4, st.combo));
      sfx.good();
    } else {
      const l = Math.max(f.x, tp.x), r = Math.min(f.x + f.w, tp.x + tp.w), overlap = r - l;
      if (overlap <= 8) {
        st.lives--; st.combo = 0; st.misses++; st.score = Math.max(0, st.score - 3);
        st.msg = st.lives > 0 ? 'Wobble! −3' : 'Off the pile';
        st.debris.push({ x: f.x, w: f.w, y: ty - CH, vx: (f.x + f.w / 2 < tp.x + tp.w / 2 ? -1 : 1) * 0.12, vy: -0.1, rot: 0, vr: (Math.random() - 0.5) * 0.012, tint: f.tint });
        FX.shake(9, 320); FX.flash('#E0483E', 200);
        FX.pop(f.x + f.w / 2, ty - CH - 12, st.lives > 0 ? 'Wobble! −3' : 'Off the pile!', { color: '#C4453C', size: 18 });
        sfx.bad();
        if (st.lives <= 0) { st.end(); return; }
      } else {
        st.pile.push({ x: l, w: overlap, tint: f.tint });
        const cut = f.w - overlap;
        if (cut > 0.5) st.debris.push({ x: f.x < tp.x ? f.x : r, w: cut, y: ty - CH, vx: (f.x < tp.x ? -1 : 1) * 0.08, vy: -0.05, rot: 0, vr: (f.x < tp.x ? -1 : 1) * 0.006, tint: f.tint });
        /* close pays two, rough pays one — and the pile is narrower either way */
        const pts = cut / f.w < 0.1 ? 2 : 1;
        st.w = overlap; st.combo = 0; st.score += pts; st.landed++; st.land = 1;
        st.msg = pts > 1 ? 'Close' : '';
        FX.pop(l + overlap / 2, ty - CH - 10, pts > 1 ? 'Close +2' : 'Rough +1', { color: pts > 1 ? '#1C2A2E' : '#8A5A3C', size: 17 });
        FX.burst(l + overlap / 2, ty, { n: 8, colors: ['#D8C29A', '#B9A684'], speed: 0.12, size: 3 });
        sfx.click();
      }
    }
    /* the next crate starts from a side, never where the last one landed */
    st.dir = st.pile.length % 2 ? -1 : 1;
    st.x = st.dir > 0 ? 0 : W - st.w;
    if (st.landed >= SHIFT) { st.msg = 'Shift done'; st.end(); }
  };

  let FXref = null;
  return shell({
    jobId, st, quit, unit: 'points',
    step(dt) {
      st.left -= dt;
      if (st.left <= 0) { st.left = 0; st.end(); return; }
      if (st.land > 0) st.land = Math.max(0, st.land - dt / 220);
      st.cam += (Math.max(0, (st.pile.length - 4) * CH) - st.cam) * Math.min(1, dt * 0.006);
      for (let i = st.debris.length - 1; i >= 0; i--) {
        const d = st.debris[i]; d.vy += 0.0012 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.rot += d.vr * dt;
        if (d.y > H + 60) st.debris.splice(i, 1);
      }
      if (st.falling) {
        const f = st.falling; f.vy += 0.0022 * dt; f.y += f.vy * dt;
        if (f.y + CH >= topScreen()) { f.y = topScreen() - CH; if (FXref) land(FXref); }
        return;
      }
      st.x += st.dir * speed() * dt;
      if (st.x <= 0) { st.x = 0; st.dir = 1; }
      if (st.x + st.w >= W) { st.x = W - st.w; st.dir = -1; }
    },
    draw(ctx, { img, T, FX }) {
      FXref = FX;
      backdrop(ctx, W, H, img, { veil: 0.3, shift: Math.sin(T / 4000) * 4 });
      const cam = st.cam, by = BASEY + cam;
      /* ground and the base the pile stands on */
      if (by < H) cobbles(ctx, by + 22, H - by);
      if (look === 'crate') {
        /* scaffold poles either side, reaching up out of frame */
        ctx.fillStyle = '#7A5230';
        for (const px of [BASEX - 22, BASEX + BASEW + 14]) {
          ctx.fillRect(px, 0, 8, by + 22);
          ctx.fillStyle = 'rgba(255,230,190,.25)'; ctx.fillRect(px + 1, 0, 2, by + 22); ctx.fillStyle = '#7A5230';
        }
        ctx.strokeStyle = 'rgba(122,82,48,.75)'; ctx.lineWidth = 4;
        for (let yy = (by + 22) % 88 - 88; yy < by + 22; yy += 88) {
          ctx.beginPath(); ctx.moveTo(BASEX - 18, yy); ctx.lineTo(BASEX + BASEW + 18, yy + 70); ctx.stroke();
        }
        if (by < H + 30) {
          ctx.fillStyle = '#8F6236'; ctx.fillRect(BASEX - 6, by, BASEW + 12, 8);
          ctx.fillStyle = '#6E4826'; for (let i = 0; i < 4; i++) ctx.fillRect(BASEX + i * 38, by + 8, 10, 14);
          ctx.fillStyle = '#8F6236'; ctx.fillRect(BASEX - 6, by + 18, BASEW + 12, 5);
        }
      } else if (look === 'sack') {
        if (by < H + 40) {
          shadow(ctx, W / 2, by + 34, BASEW + 50, 0.22);
          ctx.strokeStyle = '#6E4826'; ctx.lineWidth = 5; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(BASEX + BASEW, by + 6); ctx.lineTo(BASEX + BASEW + 46, by - 10); ctx.stroke();
          ctx.lineCap = 'butt';
          ctx.fillStyle = '#9A6A3A'; rr(ctx, BASEX - 8, by, BASEW + 16, 10, 3); ctx.fill();
          ctx.fillStyle = '#7C532C'; ctx.fillRect(BASEX - 8, by + 7, BASEW + 16, 3);
          for (const wx of [BASEX + 20, BASEX + BASEW - 20]) {
            const rot = (st.x / 30);
            ctx.fillStyle = '#4A3420'; ctx.beginPath(); ctx.arc(wx, by + 22, 13, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#C9A06A'; ctx.beginPath(); ctx.arc(wx, by + 22, 9, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#4A3420'; ctx.lineWidth = 2;
            for (let k = 0; k < 4; k++) { const a = rot + (k * Math.PI) / 4; ctx.beginPath(); ctx.moveTo(wx - Math.cos(a) * 9, by + 22 - Math.sin(a) * 9); ctx.lineTo(wx + Math.cos(a) * 9, by + 22 + Math.sin(a) * 9); ctx.stroke(); }
            ctx.fillStyle = '#4A3420'; ctx.beginPath(); ctx.arc(wx, by + 22, 3, 0, Math.PI * 2); ctx.fill();
          }
        }
      } else {
        /* the shop: a shelf unit behind, a counter under the pile */
        ctx.save(); ctx.globalAlpha = 0.75;
        ctx.fillStyle = 'rgba(122,82,48,.55)';
        for (let yy = (by % 54) - 54; yy < by; yy += 54) ctx.fillRect(8, yy, 40, 5), ctx.fillRect(W - 48, yy, 40, 5);
        for (let yy = (by % 54) - 54; yy < by; yy += 54) {
          for (let k = 0; k < 3; k++) {
            ctx.fillStyle = ['#C4453C', '#2E7FA8', '#178A4C'][(k + Math.round(yy)) % 3 < 0 ? 0 : (k + Math.abs(Math.round(yy / 54))) % 3];
            rr(ctx, 12 + k * 12, yy - 14, 9, 14, 2); ctx.fill(); rr(ctx, W - 44 + k * 12, yy - 14, 9, 14, 2); ctx.fill();
          }
        }
        ctx.restore();
        if (by < H + 30) {
          ctx.fillStyle = '#8F6236'; rr(ctx, BASEX - 30, by, BASEW + 60, 10, 3); ctx.fill();
          ctx.fillStyle = '#A8763F'; ctx.fillRect(BASEX - 24, by + 10, BASEW + 48, 40);
          ctx.strokeStyle = 'rgba(70,40,10,.35)'; ctx.lineWidth = 2; ctx.strokeRect(BASEX - 14, by + 16, (BASEW + 28) / 2 - 4, 26); ctx.strokeRect(W / 2 + 4, by + 16, (BASEW + 28) / 2 - 4, 26);
        }
      }
      /* the pile — the top one squashes as it lands */
      st.pile.forEach((p, i) => {
        const y = by - (i + 1) * CH;
        if (y > H || y < -CH) return;
        if (i === st.pile.length - 1 && st.land > 0) {
          const k = st.land, sx = 1 + 0.14 * k, sy = 1 - 0.2 * k;
          ctx.save(); ctx.translate(p.x + p.w / 2, y + CH); ctx.scale(sx, sy);
          cargoBox(ctx, look, -p.w / 2, -CH, p.w, CH, p.tint); ctx.restore();
        } else cargoBox(ctx, look, p.x, y, p.w, CH, p.tint);
      });
      /* the crane: a beam, a trolley over the crate, a rope and a hook */
      ctx.fillStyle = '#5B3C22'; ctx.fillRect(0, 34, W, 9);
      ctx.fillStyle = 'rgba(255,230,190,.3)'; ctx.fillRect(0, 35, W, 2);
      ctx.fillStyle = '#3E2914'; for (let x = 12; x < W; x += 40) { ctx.beginPath(); ctx.arc(x, 38.5, 1.8, 0, Math.PI * 2); ctx.fill(); }
      const f = st.falling, cx = (f ? f.x + f.w / 2 : st.x + st.w / 2);
      const sway = f ? 0 : (still() ? 0 : -st.dir * Math.min(0.09, speed() * 0.35) + Math.sin(T / 260) * 0.015);
      ctx.fillStyle = '#2E3A40'; rr(ctx, cx - 10, 30, 20, 12, 3); ctx.fill();
      ctx.fillStyle = '#6B7A80'; ctx.beginPath(); ctx.arc(cx - 5, 43, 3, 0, Math.PI * 2); ctx.arc(cx + 5, 43, 3, 0, Math.PI * 2); ctx.fill();
      /* the aiming shadow on the top of the pile */
      const tp = top(), ty = topScreen();
      if (!f && !st.over) {
        const good = Math.abs(st.x - tp.x) <= SNAP;
        ctx.save(); ctx.globalAlpha = good ? 0.5 : 0.22; ctx.fillStyle = good ? '#2FA866' : '#1C2A2E';
        ctx.beginPath(); ctx.ellipse(st.x + st.w / 2, ty - 1, st.w / 2, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.save(); ctx.setLineDash([3, 5]); ctx.strokeStyle = dark() ? 'rgba(255,246,218,.35)' : 'rgba(28,42,46,.25)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(st.x + st.w / 2, HOOK + CH + 4); ctx.lineTo(st.x + st.w / 2, ty - 5); ctx.stroke(); ctx.restore();
      }
      if (f) {
        ctx.strokeStyle = '#3B2A1A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, 42); ctx.lineTo(cx, HOOK - 6); ctx.stroke();
        const sy = 1 + Math.min(0.14, f.vy * 0.12), sx = 1 / sy;
        ctx.save(); ctx.translate(f.x + f.w / 2, f.y + CH / 2); ctx.scale(sx, sy);
        cargoBox(ctx, look, -f.w / 2, -CH / 2, f.w, CH, f.tint); ctx.restore();
      } else if (!st.over) {
        ctx.save(); ctx.translate(cx, 42); ctx.rotate(sway);
        ctx.strokeStyle = '#3B2A1A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, HOOK - 48); ctx.stroke();
        ctx.strokeStyle = '#59656B'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, HOOK - 45, 4, -Math.PI * 0.1, Math.PI * 1.1); ctx.stroke();
        ctx.strokeStyle = 'rgba(59,42,26,.8)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, HOOK - 44); ctx.lineTo(-st.w / 2 + 3, HOOK - 42); ctx.moveTo(0, HOOK - 44); ctx.lineTo(st.w / 2 - 3, HOOK - 42); ctx.stroke();
        cargoBox(ctx, look, -st.w / 2, HOOK - 42, st.w, CH, tints[(st.pile.length + st.misses) % tints.length]);
        ctx.restore();
      }
      st.debris.forEach((d) => {
        ctx.save(); ctx.translate(d.x + d.w / 2, d.y + CH / 2); ctx.rotate(d.rot);
        cargoBox(ctx, look, -d.w / 2, -CH / 2, d.w, CH, d.tint); ctx.restore();
      });
      night(ctx);
    },
    hud(ctx) {
      const w = pill(ctx, `${Math.ceil(st.left / 1000)}s`, W - 8, 8, { warn: st.left < 10000 });
      lives(ctx, st.lives, 3, W - 14 - w, 8);
      pill(ctx, `${st.landed}/${SHIFT}`, W - 8, 32);
      if (st.combo >= 2) label(ctx, `Square x${st.combo}`, 10, 52, { align: 'left', size: 13, color: '#B57E10' });
    },
    probe: () => { const tp = top();
      return { kind: 'stack', x: st.x, w: st.w, topX: tp.x, topW: tp.w, falling: !!st.falling, score: st.score, landed: st.landed, lives: st.lives, left: st.left }; },
    onKey(e) { if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') { if (e.preventDefault) e.preventDefault(); drop(); } },
    onPoint() { drop(); },
    onAct(n) { if (n === 'jgDrop') drop(); },
    controls: () => `<button class="btn wide" data-act="jgDrop" style="margin-top:8px">Drop it</button>`,
    hint: 'Space, or tap anywhere. Square pays 4, close pays 2, rough pays 1 — and what hangs over falls off. A wobble costs 3; three and the shift is over.',
    boxes: () => [`${st.landed}/${SHIFT} ${look === 'sack' ? 'sacks' : look === 'carton' ? 'boxes' : 'crates'}`, '❤️'.repeat(Math.max(0, st.lives)), st.msg || ' '],
    finishLine: (s) => s.quality >= 1.4
      ? 'Nobody stacks that square by accident. That is a skill, and it is worth more per hour than the sweeping.'
      : 'Every one you land square makes the next one easier. That is most jobs, really.',
  });
}

/* ── trim ─────────────────────────────────────────────────────────────────
   Weight arrives on the crane; you send it port or starboard. The boat leans.
   Two buttons, no right answer written anywhere, and it gets faster.

   A shift has a length. Without one a competent player keeps the boat level
   for ever and the job never ends — which a headless run doing exactly that
   for 141 seconds is how we found out. Work finishes; that is what makes it
   work rather than a screensaver. Lean too far, or let the deck pile up, and
   the boat lurches — three lurches and the shift is over. */
const TRIM_LOOKS = { cargo: ['crate', 'barrel'], nets: ['net', 'basket'], books: ['ledger', 'ledger'] };
function load(ctx, kind, cx, by, w) {
  /* a load of weight w, its bottom-centre at cx,by */
  const s = 16 + Math.min(5, w) * 4;
  if (kind === 'barrel') {
    ctx.fillStyle = '#9A5F2C'; rr(ctx, cx - s * 0.4, by - s, s * 0.8, s, s * 0.22); ctx.fill();
    ctx.fillStyle = '#5E3A1A'; ctx.fillRect(cx - s * 0.42, by - s * 0.78, s * 0.84, 2.4); ctx.fillRect(cx - s * 0.42, by - s * 0.3, s * 0.84, 2.4);
    ctx.fillStyle = 'rgba(255,230,190,.3)'; ctx.fillRect(cx - s * 0.22, by - s + 3, 2.5, s - 6);
  } else if (kind === 'net') {
    ctx.fillStyle = '#5F8F7A'; ctx.beginPath(); ctx.ellipse(cx, by - s * 0.42, s * 0.55, s * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(20,50,40,.55)'; ctx.lineWidth = 1;
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(cx + k * s * 0.18 - s * 0.2, by - s * 0.8); ctx.lineTo(cx + k * s * 0.18 + s * 0.2, by - 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + k * s * 0.18 + s * 0.2, by - s * 0.8); ctx.lineTo(cx + k * s * 0.18 - s * 0.2, by - 2); ctx.stroke(); }
    ctx.fillStyle = '#E8A33C'; ctx.beginPath(); ctx.arc(cx + s * 0.35, by - s * 0.65, 3, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'basket') {
    ctx.fillStyle = '#B8894C'; ctx.beginPath(); ctx.moveTo(cx - s * 0.5, by - s * 0.7); ctx.lineTo(cx + s * 0.5, by - s * 0.7); ctx.lineTo(cx + s * 0.38, by); ctx.lineTo(cx - s * 0.38, by); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(90,60,20,.55)'; ctx.lineWidth = 1.2;
    for (let k = 1; k < 3; k++) { ctx.beginPath(); ctx.moveTo(cx - s * 0.46, by - s * 0.7 + k * s * 0.23); ctx.lineTo(cx + s * 0.46, by - s * 0.7 + k * s * 0.23); ctx.stroke(); }
    ctx.fillStyle = '#9FB8C4'; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.ellipse(cx + k * s * 0.22, by - s * 0.76, s * 0.14, s * 0.07, 0.3, 0, Math.PI * 2); ctx.fill(); }
  } else if (kind === 'ledger') {
    const cols = ['#2E7FA8', '#C4453C', '#178A4C', '#8A5B00'];
    const n = 1 + Math.min(4, w), bh = s / n;
    for (let k = 0; k < n; k++) {
      ctx.fillStyle = cols[(k + w) % cols.length]; rr(ctx, cx - s * 0.48 + (k % 2) * 2, by - (k + 1) * bh, s * 0.94, bh - 1, 1.5); ctx.fill();
      ctx.fillStyle = '#FFF6DA'; ctx.fillRect(cx - s * 0.48 + (k % 2) * 2 + s * 0.8, by - (k + 1) * bh + 1, s * 0.12, bh - 3);
    }
  } else crate(ctx, cx - s * 0.5, by - s * 0.8, s, s * 0.8, ['#C98A46', '#B9773A', '#D49B57'][w % 3]);
}
function weightTag(ctx, x, y, w) {
  ctx.fillStyle = '#FFF6DA'; ctx.strokeStyle = '#5B3C22'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3A2400'; ctx.font = '800 10px Sono, ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(w), x, y + 0.5);
}

function trimGame(jobId, quit) {
  const c = K(), t = tier(c);
  const SHIFT = 20, PX = W / 2, PY = 202, HANG = 74;
  const kinds = TRIM_LOOKS[jobId] || TRIM_LOOKS.cargo;
  const st = { score: 0, loads: 0, done: false, tilt: 0, shown: 0, queue: [], spawn: 600, t: 0, msg: '', limit: 42, lives: 3, combo: 0,
    deck: [], flying: [], swing: 0 };
  const gap = () => Math.max(560, 1350 - t * 90 - st.loads * 40);
  const ang = () => (st.shown / st.limit) * 0.34;
  /* where on deck a load of this side sits, in the boat's own frame */
  const slot = (side, i) => ({ x: side * (30 + (i % 3) * 34 + Math.floor(i / 3) * 14), y: -20 - Math.floor(i / 3) * 20 });
  const toScreen = (lx, ly, a) => ({ x: PX + lx * Math.cos(a) - ly * Math.sin(a), y: PY + lx * Math.sin(a) + ly * Math.cos(a) });
  let FX = null;

  const lurch = (why) => {
    st.lives--; st.combo = 0; st.msg = why; st.score = Math.max(0, st.score - 3);
    if (FX) { FX.shake(10, 340); FX.flash('#E0483E', 200); FX.pop(PX, 120, why, { color: '#C4453C', size: 18 }); }
    sfx.bad();
    if (st.lives <= 0) { st.end(); return true; }
    return false;
  };
  const send = (side) => {
    if (st.done || st.over || !st.queue.length) return;
    const box = st.queue.shift();
    /* the score is the decision: the side that leaves her nearer level pays two,
       the other side costs two, and a lurch costs three */
    const right = Math.abs(st.tilt + side * box.w * 4) <= Math.abs(st.tilt - side * box.w * 4);
    st.tilt += side * box.w * 4;
    st.loads++;
    const n = st.deck.filter((d) => d.side === side).length + st.flying.filter((d) => d.side === side).length;
    st.flying.push({ side, w: box.w, kind: box.kind, t: 0, i: Math.min(5, n) });
    if (Math.abs(st.tilt) > st.limit) {
      /* she lurches; the crew heave the last load over the side and she rights a little */
      const sign = Math.sign(st.tilt); st.tilt = sign * st.limit * 0.5;
      if (lurch('Whoa — she lurched!')) return;
    } else if (right) {
      st.score += 2; st.combo++; st.msg = st.combo >= 3 ? `Good trim x${st.combo}` : 'Good trim';
      if (FX) { FX.pop(PX + side * 60, 110, st.combo >= 3 ? `Trim x${st.combo} +2` : 'Good trim +2', { color: '#178A4C', size: 17 }); FX.coins(PX + side * 60, 120, 3 + Math.min(4, st.combo)); }
      sfx.coin();
    } else {
      st.combo = 0; st.msg = 'Wrong side'; st.score = Math.max(0, st.score - 2);
      if (FX) FX.pop(PX + side * 60, 110, 'Wrong side −2', { color: '#C4453C', size: 15 });
      sfx.click();
    }
    if (st.loads >= SHIFT) { st.msg = 'Shift done'; st.end(); }
  };

  return shell({
    jobId, st, quit, unit: 'points',
    step(dt) {
      st.t += dt; st.spawn -= dt;
      if (st.spawn <= 0 && st.queue.length < 4) {
        st.spawn = gap();
        st.queue.push({ w: 1 + Math.floor(Math.random() * (3 + t)), kind: kinds[Math.floor(Math.random() * kinds.length)] });
        st.swing = 1;
      }
      /* The sea does not wait: an unattended boat drifts back towards even,
         slowly, so standing still is neither a win nor instant death. */
      st.tilt *= 0.9997 ** dt;
      st.shown += (st.tilt - st.shown) * Math.min(1, dt * 0.007);
      st.swing = Math.max(0, st.swing - dt / 900);
      for (let i = st.flying.length - 1; i >= 0; i--) {
        const f = st.flying[i]; f.t += dt / 380;
        if (f.t >= 1) {
          st.flying.splice(i, 1);
          const mine = st.deck.filter((d) => d.side === f.side);
          if (mine.length >= 6) st.deck.splice(st.deck.indexOf(mine[0]), 1);
          st.deck.push({ side: f.side, w: f.w, kind: f.kind, land: 1 });
          const p = toScreen(slot(f.side, Math.min(5, mine.length)).x, -14, ang());
          if (FX) FX.burst(p.x, PY + 8, { n: 10, colors: ['#FFFFFF', '#BFE3F2', '#6EB6D8'], speed: 0.16, size: 3 });
        }
      }
      st.deck.forEach((d) => { if (d.land > 0) d.land = Math.max(0, d.land - dt / 220); });
      if (st.queue.length >= 4) {
        /* a full deck: the oldest load goes in the drink */
        st.queue.shift();
        if (FX) FX.burst(PX, PY, { n: 16, colors: ['#FFFFFF', '#BFE3F2'], speed: 0.2 });
        lurch('Splash — too slow!');
      }
    },
    draw(ctx, { img, T, FX: fxl }) {
      FX = fxl;
      backdrop(ctx, W, H, img, { veil: 0.22 });
      /* the sea */
      const sea = ctx.createLinearGradient(0, PY - 40, 0, H);
      sea.addColorStop(0, dark() ? '#1E3A5A' : '#5FA8C8'); sea.addColorStop(1, dark() ? '#0E2238' : '#2E7FA8');
      ctx.fillStyle = sea; ctx.fillRect(0, PY - 40, W, H - PY + 40);
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      for (let k = 0; k < 7; k++) { const x = (k * 61 + T * 0.012) % (W + 40) - 20; ctx.fillRect(x, PY - 32 + (k % 3) * 8, 18, 1.5); }
      const wave = (y0, amp, ph, col) => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 8) ctx.lineTo(x, y0 + Math.sin(x * 0.045 + T * 0.0022 + ph) * amp + Math.sin(x * 0.11 + T * 0.003) * amp * 0.3);
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      };
      wave(PY - 16, 4, 0, dark() ? 'rgba(30,70,110,.9)' : 'rgba(70,140,185,.9)');
      /* the boat, rocking a little on its own and leaning with the load */
      const a = ang() + Math.sin(T / 700) * 0.018, bob = Math.sin(T / 520) * 2;
      ctx.save(); ctx.translate(PX, PY + bob); ctx.rotate(a);
      /* mast and sails */
      ctx.fillStyle = '#6E4826'; ctx.fillRect(-3, -112, 6, 100);
      const bil = Math.sin(T / 600) * 5;
      ctx.fillStyle = '#F4EAD5'; ctx.beginPath(); ctx.moveTo(4, -108); ctx.quadraticCurveTo(52 + bil, -70, 62 + bil * 0.5, -24); ctx.lineTo(4, -22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(120,90,50,.45)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(4, -80); ctx.lineTo(42 + bil * 0.6, -80); ctx.moveTo(4, -52); ctx.lineTo(56 + bil * 0.6, -52); ctx.stroke();
      ctx.fillStyle = '#E9DCC0'; ctx.beginPath(); ctx.moveTo(-4, -100); ctx.quadraticCurveTo(-34 - bil * 0.6, -62, -48, -26); ctx.lineTo(-4, -26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#C4453C'; ctx.beginPath(); ctx.moveTo(3, -112); ctx.lineTo(20, -108 + Math.sin(T / 160) * 2); ctx.lineTo(3, -103); ctx.closePath(); ctx.fill();
      /* cargo on deck */
      st.deck.forEach((d) => {
        const mine = st.deck.filter((x) => x.side === d.side), i = mine.indexOf(d), p = slot(d.side, i);
        if (d.land > 0) { ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1 + 0.15 * d.land, 1 - 0.2 * d.land); load(ctx, d.kind, 0, 0, d.w); ctx.restore(); }
        else load(ctx, d.kind, p.x, p.y, d.w);
      });
      /* the hull: planks, a rail, a stripe */
      ctx.beginPath(); ctx.moveTo(-124, -16); ctx.lineTo(124, -16);
      ctx.quadraticCurveTo(116, 22, 82, 30); ctx.lineTo(-82, 30); ctx.quadraticCurveTo(-116, 22, -124, -16); ctx.closePath();
      ctx.fillStyle = '#8A4B2A'; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(50,25,10,.4)'; ctx.lineWidth = 1.4;
      for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-124, -16 + k * 11); ctx.quadraticCurveTo(0, -10 + k * 11, 124, -16 + k * 11); ctx.stroke(); }
      ctx.fillStyle = '#0E6B78'; ctx.fillRect(-130, -4, 260, 5);
      ctx.restore();
      ctx.fillStyle = '#C98A46'; rr(ctx, -128, -20, 256, 7, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,200,.45)'; ctx.fillRect(-124, -19, 248, 1.5);
      ctx.fillStyle = '#FFF6DA'; for (const px of [-70, 70]) { ctx.beginPath(); ctx.arc(px, 6, 4, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#5B3C22'; ctx.lineWidth = 1.4; ctx.stroke(); }
      ctx.restore();
      wave(PY + 12, 5, 1.7, dark() ? 'rgba(20,52,86,.82)' : 'rgba(46,127,168,.78)');
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      for (let x = -10; x < W; x += 26) { const y = PY + 12 + Math.sin(x * 0.045 + T * 0.0022 + 1.7) * 5; ctx.beginPath(); ctx.ellipse(x + 8, y + 1, 7, 1.6, 0, 0, Math.PI * 2); ctx.fill(); }
      /* the crane, the next load hanging, the others waiting on the quay */
      ctx.fillStyle = '#4A5960'; ctx.fillRect(PX - 2, 28, 4, 10); ctx.fillRect(PX - 70, 26, 220, 6);
      ctx.fillRect(W - 24, 26, 6, 70);
      ctx.fillStyle = '#7A6A50'; rr(ctx, W - 92, 92, 92, 10, 2); ctx.fill();
      if (st.queue.length) {
        const nx = st.queue[0], sw = still() ? 0 : Math.sin(T / 180) * 0.1 * st.swing + Math.sin(T / 700) * 0.03;
        ctx.save(); ctx.translate(PX, 32); ctx.rotate(sw);
        ctx.strokeStyle = '#3B2A1A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, HANG - 26); ctx.stroke();
        load(ctx, nx.kind, 0, HANG - 2, nx.w);
        weightTag(ctx, 0, HANG + 8, nx.w);
        ctx.restore();
        st.queue.slice(1).forEach((q, i) => { load(ctx, q.kind, W - 76 + i * 26, 92, Math.min(2, q.w)); weightTag(ctx, W - 76 + i * 26, 82 - 10 - Math.min(2, q.w) * 3, q.w); });
      }
      /* loads in flight, arcing to their side of the deck */
      st.flying.forEach((f) => {
        const p = slot(f.side, f.i), dst = toScreen(p.x, p.y, ang()), k = ease.inOut(Math.min(1, f.t));
        const x = PX + (dst.x - PX) * k, y = 32 + HANG + (dst.y - 32 - HANG) * k - Math.sin(k * Math.PI) * 30;
        ctx.save(); ctx.translate(x, y); ctx.rotate(f.side * k * 0.3); load(ctx, f.kind, 0, 0, f.w); ctx.restore();
      });
      night(ctx, 0.16);
      /* the spirit level */
      const lx = 40, lw = W - 80, ly = H - 22;
      ctx.fillStyle = dark() ? 'rgba(10,14,24,.75)' : 'rgba(255,252,245,.9)'; rr(ctx, lx - 6, ly - 6, lw + 12, 20, 10); ctx.fill();
      ctx.fillStyle = 'rgba(196,69,60,.35)'; rr(ctx, lx, ly - 1, lw * 0.12, 10, 5); ctx.fill(); rr(ctx, lx + lw * 0.88, ly - 1, lw * 0.12, 10, 5); ctx.fill();
      ctx.fillStyle = 'rgba(47,168,102,.3)'; ctx.fillRect(PX - lw * (8 / st.limit) / 2, ly - 1, lw * (8 / st.limit), 10);
      const k = clamp(st.shown / st.limit, -1, 1), danger = Math.abs(st.shown) > st.limit * 0.75;
      ctx.fillStyle = danger ? '#C4453C' : '#2FA866'; ctx.beginPath(); ctx.ellipse(PX + k * (lw / 2 - 8), ly + 4, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(PX + k * (lw / 2 - 8) - 3, ly + 2, 3, 1.6, 0, 0, Math.PI * 2); ctx.fill();
      label(ctx, 'PORT', lx - 2, ly - 12, { size: 9, align: 'left', weight: 700 });
      label(ctx, 'STARBOARD', lx + lw + 2, ly - 12, { size: 9, align: 'right', weight: 700 });
    },
    hud(ctx) {
      const w = pill(ctx, `${st.loads}/${SHIFT}`, W - 8, 8);
      lives(ctx, st.lives, 3, W - 14 - w, 8);
      if (st.combo >= 2) label(ctx, `Trim x${st.combo}`, 10, 52, { align: 'left', size: 13, color: '#178A4C' });
      if (st.queue.length >= 3) label(ctx, 'Deck filling up!', PX, 150, { size: 13, color: '#C4453C' });
    },
    probe: () => ({ kind: 'trim', tilt: st.tilt, queue: st.queue.length, next: st.queue.length ? st.queue[0].w : 0, score: st.score, loads: st.loads, lives: st.lives }),
    onKey(e) {
      if (e.key === 'ArrowLeft') send(-1);
      else if (e.key === 'ArrowRight') send(1);
    },
    onPoint(x) { send(x < W / 2 ? -1 : 1); },
    onAct(n) { if (n === 'jgPort') send(-1); else if (n === 'jgStar') send(1); },
    controls: () => `<div class="choices" style="margin-top:8px">
      <button class="btn" data-act="jgPort">← Port</button>
      <button class="btn" data-act="jgStar">Starboard →</button></div>`,
    hint: 'Arrows, the two buttons, or tap a side of the boat. The side that brings her back towards level pays 2, the other costs 2 — and a lurch costs 3.',
    boxes: () => [`${st.loads}/${SHIFT} aboard`, '❤️'.repeat(Math.max(0, st.lives)), st.msg || ' '],
    finishLine: (s) => s.quality >= 1.4
      ? 'That is the whole job, and it is the same shape as a budget: it is not what you take on, it is whether it balances.'
      : 'Weight is easy. Weight on one side is the problem — and you can feel it coming before it goes.',
  });
}

/* ── sweep ────────────────────────────────────────────────────────────────
   Move, collect, chain. The one with a clock on it. Things drift down over
   Market Row — leaves and litter for the sweeper, sparks for the lamplighter,
   spools and patches for the mender — and you catch them before they land.
   The lamps light, or the bunting is stitched, as you go: the job you are
   doing is drawn as done. */
const SWEEP_LOOK = { sweep: 'sweep', lamplight: 'lamp', mend: 'mend' };
function fallingThing(ctx, look, v, x, y, rot, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (look === 'lamp') {
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
    g.addColorStop(0, 'rgba(255,214,110,.9)'); g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(-rot);
    ctx.fillStyle = '#F07A28'; ctx.beginPath(); ctx.moveTo(0, -11); ctx.quadraticCurveTo(8, 0, 0, 8); ctx.quadraticCurveTo(-8, 0, 0, -11); ctx.fill();
    ctx.fillStyle = '#FFE08A'; ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(4, 2, 0, 6); ctx.quadraticCurveTo(-4, 2, 0, -5); ctx.fill();
  } else if (look === 'mend') {
    if (v % 2) {
      /* a spool of thread */
      ctx.fillStyle = '#C9A06A'; ctx.fillRect(-8, -10, 16, 3); ctx.fillRect(-8, 7, 16, 3);
      ctx.fillStyle = ['#C4453C', '#2E7FA8', '#178A4C'][v % 3]; ctx.fillRect(-6, -7, 12, 14);
      ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1; for (let k = -5; k < 7; k += 3) { ctx.beginPath(); ctx.moveTo(-6, k); ctx.lineTo(6, k + 1); ctx.stroke(); }
    } else {
      /* a patch of cloth, ready to sew */
      ctx.fillStyle = ['#E8A33C', '#7A5CC4', '#2FA866'][v % 3]; rr(ctx, -9, -9, 18, 18, 2); ctx.fill();
      ctx.setLineDash([2.5, 2.5]); ctx.strokeStyle = '#FFF6DA'; ctx.lineWidth = 1.3; rr(ctx, -6, -6, 12, 12, 1); ctx.stroke(); ctx.setLineDash([]);
    }
  } else {
    if (v % 3 === 0) {
      /* a leaf */
      ctx.fillStyle = ['#D9822B', '#C4453C', '#8FA83A', '#E8A33C'][v % 4];
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(0, -9, 10, 0); ctx.quadraticCurveTo(0, 9, -10, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(70,40,10,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(9, 0); ctx.stroke();
    } else if (v % 3 === 1) {
      /* a scrap of paper */
      ctx.fillStyle = '#F6F1E4'; ctx.beginPath(); ctx.moveTo(-8, -7); ctx.lineTo(7, -9); ctx.lineTo(9, 6); ctx.lineTo(-6, 8); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(80,80,90,.4)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-5, -3); ctx.lineTo(5, -4); ctx.moveTo(-4, 1); ctx.lineTo(6, 0); ctx.stroke();
    } else {
      /* a banana peel */
      ctx.strokeStyle = '#E8C23C'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -6); ctx.quadraticCurveTo(-9, 0, -7, 8); ctx.moveTo(0, -6); ctx.quadraticCurveTo(9, 0, 7, 8); ctx.moveTo(0, -6); ctx.lineTo(0, 7); ctx.stroke();
      ctx.lineCap = 'butt'; ctx.fillStyle = '#6E4826'; ctx.fillRect(-1.5, -9, 3, 4);
    }
  }
  ctx.restore();
}

function sweepGame(jobId, quit) {
  const c = K(), t = tier(c);
  const cfg = JOB_GAME[jobId];
  const look = SWEEP_LOOK[jobId] || 'sweep';
  const CY = H - 62, GROUND = 204, LAMPS = 5, FLAGS = 9;
  const st = { score: 0, done: false, x: W / 2, target: W / 2, vx: 0, bits: [], spawn: 400, left: 36000, chain: 0, msg: '', ground: [], swish: 0, caught: 0, n: 0, glow: [] };
  const posX = (b) => clamp(b.x + Math.sin(b.age * 0.0021 + b.ph) * b.amp, 12, W - 12);
  const done = () => Math.min(look === 'lamp' ? LAMPS : FLAGS, Math.floor((st.score * (look === 'lamp' ? LAMPS : FLAGS)) / cfg.par));
  let FX = null;
  const move = (d) => { st.target = clamp(st.target + d, 20, W - 20); };

  return shell({
    jobId, st, quit, unit: 'points',
    step(dt) {
      st.left -= dt;
      if (st.left <= 0) { st.left = 0; st.end(); return; }
      st.spawn -= dt;
      if (st.spawn <= 0 && st.bits.length < 8) {
        st.spawn = Math.max(480, 620 - t * 30);
        st.bits.push({ x: 30 + Math.random() * (W - 60), y: 30, vy: 0.08 + Math.random() * 0.03 + t * 0.004, age: 0,
          ph: Math.random() * 6, amp: 8 + Math.random() * 12, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.006, v: st.n++ });
      }
      const ox = st.x;
      /* the catcher has a top speed, so reading what lands next is the skill */
      const dx = st.target - st.x, cap = 0.34 * dt;
      st.x += Math.max(-cap, Math.min(cap, dx * Math.min(1, 0.02 * dt)));
      st.vx = (st.x - ox) / Math.max(1, dt);
      st.swish += Math.abs(st.vx) * dt * 0.05;
      for (let i = st.bits.length - 1; i >= 0; i--) {
        const b = st.bits[i];
        b.age += dt; b.y += b.vy * dt; b.rot += b.vr * dt;
        const bx = posX(b);
        if (b.y >= CY - 16 && b.y <= CY + 12 && Math.abs(bx - st.x) < 24) {
          st.bits.splice(i, 1); st.chain++; const pts = st.chain % 5 === 0 ? 2 : 1; st.score += pts; st.caught++;
          st.msg = st.chain >= 5 ? st.chain + ' in a row' : '';
          const before = st.glow.length; while (st.glow.length < done()) st.glow.push(1);
          if (FX) {
            FX.pop(bx, CY - 30, pts > 1 ? `Chain of ${st.chain}! +2` : `+${pts}`, { color: pts > 1 ? '#B57E10' : '#1C2A2E', size: pts > 1 ? 18 : 16 });
            if (look === 'sweep') FX.burst(bx, CY, { n: 8, colors: ['#C9B48A', '#A89268'], speed: 0.12, size: 3 });
            else FX.burst(bx, CY, { n: 8, colors: look === 'lamp' ? ['#FFE08A', '#F07A28'] : ['#FFF6DA', '#E8A33C'], speed: 0.14, size: 3 });
            if (st.chain % 5 === 0) FX.coins(bx, CY - 10, 5);
            if (st.glow.length > before) FX.coins(W / 2, 60, 3);
          }
          sfx.click();
        } else if (b.y > H - 14) {
          st.bits.splice(i, 1);
          /* a miss costs two, and breaks the chain */
          st.score = Math.max(0, st.score - 2);
          if (FX) FX.pop(bx, H - 40, st.chain >= 3 ? 'Chain broken −2' : '−2', { color: '#C4453C', size: 14 });
          st.chain = 0; st.msg = 'Missed one';
          if (look === 'sweep') st.ground.push({ x: bx, y: H - 10 - Math.random() * 8, v: b.v, rot: b.rot, a: 1 });
          if (FX) { FX.shake(4, 180); FX.flash('#E0483E', 120); }
          sfx.bad();
        }
      }
      st.ground.forEach((g) => { g.a -= dt / 4000; });
      st.ground = st.ground.filter((g) => g.a > 0).slice(-8);
      st.glow = st.glow.map((g) => Math.max(0, g - dt / 600));
    },
    draw(ctx, { img, T, FX: fxl }) {
      FX = fxl;
      backdrop(ctx, W, H, img, { veil: look === 'lamp' ? 0.2 : 0.3 });
      if (look === 'lamp') { ctx.fillStyle = dark() ? 'rgba(8,10,30,.45)' : 'rgba(40,40,90,.38)'; ctx.fillRect(0, 0, W, H); }
      /* Market Row: stalls along the back */
      const stalls = [{ x: 4, c: '#C4453C' }, { x: 124, c: '#2E7FA8' }, { x: 244, c: '#178A4C' }];
      stalls.forEach((s, k) => {
        const w = 112, top = 104;
        ctx.fillStyle = '#6E4826'; ctx.fillRect(s.x + 6, top, 5, GROUND - top); ctx.fillRect(s.x + w - 11, top, 5, GROUND - top);
        ctx.fillStyle = '#A8763F'; ctx.fillRect(s.x + 2, GROUND - 34, w - 4, 30);
        ctx.fillStyle = 'rgba(70,40,10,.25)'; ctx.fillRect(s.x + 2, GROUND - 34, w - 4, 4);
        const goods = [['#E8A33C', '#C4453C', '#8FA83A'], ['#F6F1E4', '#D9B97A', '#B57E10'], ['#7A5CC4', '#E8A33C', '#2FA866']][k];
        for (let g = 0; g < 7; g++) { ctx.fillStyle = goods[g % 3]; ctx.beginPath(); ctx.arc(s.x + 14 + g * 13, GROUND - 38, 5.5, 0, Math.PI * 2); ctx.fill(); }
        /* the striped, scalloped awning */
        for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#FFF6DA' : s.c; ctx.fillRect(s.x + i * (w / 8), top - 18, w / 8 + 0.5, 18); }
        for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#FFF6DA' : s.c; ctx.beginPath(); ctx.arc(s.x + i * (w / 8) + w / 16, top, w / 16, 0, Math.PI); ctx.fill(); }
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(s.x, top - 18, w, 3);
      });
      cobbles(ctx, GROUND, H - GROUND);
      if (look === 'lamp') {
        /* lamp posts between the stalls, lit as the work gets done */
        const lit = done();
        for (let i = 0; i < LAMPS; i++) {
          const lx = 30 + i * 75, ly = 70;
          ctx.fillStyle = '#2E3A40'; ctx.fillRect(lx - 2, ly, 4, GROUND - ly); ctx.fillRect(lx - 7, GROUND - 6, 14, 6);
          const on = i < lit, part = i === lit ? Math.min(1, (st.score * LAMPS) / cfg.par - lit) : 0;
          if (part > 0) {
            /* the next lamp warms as you get closer to it */
            const g = ctx.createRadialGradient(lx, ly - 8, 1, lx, ly - 8, 24);
            g.addColorStop(0, `rgba(255,200,100,${0.6 * part})`); g.addColorStop(1, 'rgba(255,180,60,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly - 8, 24, 0, Math.PI * 2); ctx.fill();
          }
          if (on) {
            const pulse = 1 + (st.glow[i] || 0) * 0.6 + Math.sin(T / 300 + i) * 0.04;
            const g = ctx.createRadialGradient(lx, ly - 8, 2, lx, ly - 8, 46 * pulse);
            g.addColorStop(0, 'rgba(255,220,120,.85)'); g.addColorStop(1, 'rgba(255,180,60,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly - 8, 46 * pulse, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = on ? '#FFE08A' : '#5A6670'; rr(ctx, lx - 7, ly - 18, 14, 16, 3); ctx.fill();
          ctx.strokeStyle = '#2E3A40'; ctx.lineWidth = 2; rr(ctx, lx - 7, ly - 18, 14, 16, 3); ctx.stroke();
          ctx.fillStyle = '#2E3A40'; ctx.beginPath(); ctx.moveTo(lx - 9, ly - 18); ctx.lineTo(lx, ly - 25); ctx.lineTo(lx + 9, ly - 18); ctx.fill();
        }
      } else if (look === 'mend') {
        /* bunting across the Row: torn flags stitched whole as you go */
        const fixed = done(), cols = ['#C4453C', '#E8A33C', '#2E7FA8', '#178A4C', '#7A5CC4'];
        ctx.strokeStyle = '#5B3C22'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 48);
        ctx.quadraticCurveTo(W / 2, 74, W, 48); ctx.stroke();
        for (let i = 0; i < FLAGS; i++) {
          const fx0 = 14 + i * ((W - 28) / FLAGS), u = (fx0 + 14) / W, fy = 48 + 4 * 26 * u * (1 - u) * 0.98;
          const sway = Math.sin(T / 500 + i) * 1.5, ok = i < fixed;
          ctx.save(); ctx.translate(fx0 + 14, fy); ctx.rotate(sway * 0.03);
          ctx.fillStyle = cols[i % cols.length];
          if (ok) { ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(13, 0); ctx.lineTo(0, 26); ctx.closePath(); ctx.fill(); }
          else {
            /* torn: the point ripped off, a ragged edge, one half hanging loose */
            ctx.globalAlpha = 0.8;
            ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(0, 0); ctx.lineTo(-2, 5); ctx.lineTo(1, 9); ctx.lineTo(-3, 13); ctx.lineTo(-6, 13); ctx.closePath(); ctx.fill();
            ctx.save(); ctx.translate(1, 0); ctx.rotate(0.35 + sway * 0.05);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12, 0); ctx.lineTo(5, 12); ctx.lineTo(3, 8); ctx.lineTo(4, 4); ctx.closePath(); ctx.fill();
            ctx.restore(); ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(60,30,20,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-2, 5); ctx.lineTo(1, 9); ctx.lineTo(-3, 13); ctx.stroke();
          }
          if (ok) {
            ctx.strokeStyle = '#FFF6DA'; ctx.lineWidth = 1.2; ctx.beginPath();
            for (let k = 0; k < 6; k++) ctx.lineTo(-6 + k * 2.4, 8 + (k % 2) * 3);
            ctx.stroke();
            if (st.glow[i] > 0) { ctx.globalAlpha = st.glow[i]; ctx.fillStyle = '#FFF3C4'; ctx.beginPath(); ctx.arc(0, 10, 14, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
          }
          ctx.restore();
        }
      }
      /* litter that landed, fading */
      st.ground.forEach((g) => { ctx.globalAlpha = g.a * 0.7; fallingThing(ctx, look, g.v, g.x, g.y, g.rot, 0.85); ctx.globalAlpha = 1; });
      /* what is falling */
      st.bits.forEach((b) => fallingThing(ctx, look, b.v, posX(b), b.y, look === 'lamp' ? 0 : b.rot));
      /* the catcher */
      const x = st.x, lean = clamp(st.vx * 1.4, -0.5, 0.5);
      shadow(ctx, x, H - 22, 72, 0.22);
      if (look === 'sweep') {
        const sw = still() ? 0 : Math.sin(st.swish) * 0.25;
        ctx.save(); ctx.translate(x, CY + 16); ctx.rotate(-lean + sw);
        ctx.strokeStyle = '#8F6236'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(18, -62); ctx.stroke(); ctx.lineCap = 'butt';
        ctx.fillStyle = '#C4453C'; rr(ctx, -16, -8, 32, 7, 2); ctx.fill();
        ctx.fillStyle = '#D9B04A'; ctx.beginPath(); ctx.moveTo(-17, -2); ctx.lineTo(17, -2); ctx.lineTo(26, 18); ctx.lineTo(-26, 18); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(120,80,20,.55)'; ctx.lineWidth = 1.2;
        for (let k = -4; k <= 4; k++) { ctx.beginPath(); ctx.moveTo(k * 4, 0); ctx.lineTo(k * 6, 18); ctx.stroke(); }
        ctx.restore();
      } else if (look === 'lamp') {
        ctx.save(); ctx.translate(x, H - 18); ctx.rotate(-lean * 0.5);
        ctx.strokeStyle = '#5B3C22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, CY - (H - 18) + 10); ctx.stroke();
        const g = ctx.createRadialGradient(0, CY - (H - 18), 2, 0, CY - (H - 18), 30);
        g.addColorStop(0, 'rgba(255,220,120,.7)'); g.addColorStop(1, 'rgba(255,180,60,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, CY - (H - 18), 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2E3A40'; ctx.beginPath(); ctx.moveTo(-18, CY - (H - 18) - 8); ctx.lineTo(18, CY - (H - 18) - 8); ctx.lineTo(10, CY - (H - 18) + 8); ctx.lineTo(-10, CY - (H - 18) + 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FFE08A'; ctx.beginPath(); ctx.ellipse(0, CY - (H - 18) - 8, 15, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else {
        ctx.save(); ctx.translate(x, CY + 6); ctx.rotate(-lean * 0.4);
        ctx.fillStyle = '#B8894C'; ctx.beginPath(); ctx.moveTo(-30, -8); ctx.lineTo(30, -8); ctx.lineTo(22, 24); ctx.lineTo(-22, 24); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(90,60,20,.55)'; ctx.lineWidth = 1.4;
        for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-28 + k * 1.5, -2 + k * 7); ctx.lineTo(28 - k * 1.5, -2 + k * 7); ctx.stroke(); }
        ctx.fillStyle = '#8F6236'; rr(ctx, -32, -11, 64, 6, 3); ctx.fill();
        ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, -10); ctx.lineTo(26, -34); ctx.stroke();
        ctx.strokeStyle = '#C4453C'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(25, -32); ctx.quadraticCurveTo(36, -20, 22, -14); ctx.stroke();
        ctx.restore();
      }
      night(ctx, look === 'lamp' ? 0.1 : 0.2);
    },
    hud(ctx) {
      pill(ctx, `${Math.ceil(st.left / 1000)}s`, W - 8, 8, { warn: st.left < 10000 });
      if (st.chain >= 3) label(ctx, `Chain x${st.chain}`, 10, 52, { align: 'left', size: 12, color: '#B57E10' });
    },
    probe: () => {
      /* the nearest thing that will reach the catch line soonest */
      let n = null, best = 1e9;
      st.bits.forEach((b) => { const eta = (CY - b.y) / b.vy; if (eta > -50 && eta < best) { best = eta; n = posX(b); } });
      return { kind: 'sweep', x: st.x, nearest: n, score: st.score, left: st.left, chain: st.chain };
    },
    onKey(e) {
      if (e.key === 'ArrowLeft') move(-46);
      else if (e.key === 'ArrowRight') move(46);
    },
    onPoint(x) { st.target = clamp(x, 20, W - 20); },
    onDrag(x) { st.target = clamp(x, 20, W - 20); },
    onAct(n) {
      if (n === 'jgLeft') move(-46);
      else if (n === 'jgRight') move(46);
    },
    controls: () => `<div class="choices" style="margin-top:8px">
      <button class="btn ghost" data-act="jgLeft">←</button>
      <button class="btn ghost" data-act="jgRight">→</button></div>`,
    hint: look === 'lamp' ? 'Arrows, the buttons, or drag along the Row. Catch the sparks to light the lamps — a miss costs 2, every fifth in a row counts double.'
      : look === 'mend' ? 'Arrows, the buttons, or drag along the Row. Catch the thread and patches to mend the bunting — a miss costs 2, every fifth in a row counts double.'
      : 'Arrows, the buttons, or drag along the Row. Catch it all before it lands — a miss costs 2, every fifth in a row counts double.',
    boxes: () => [`${st.score}`, `${Math.ceil(st.left / 1000)}s`, st.msg || ' '],
    finishLine: (s) => s.quality >= 1.4
      ? 'Fast and tidy. The chain is where the money is, and that is true of the real one too.'
      : 'Every one you let land broke the chain. Steady beats frantic here.',
  });
}

/* ── runner ───────────────────────────────────────────────────────────────
   Three lanes of pavement under a row of house fronts. Run past a drop-off
   in your lane and the post flies in; run into the dog and you lose a heart.
   A round is thirty-five seconds of street, so it always ends. */
const RUN_DROP = { flyers: 'letterbox', errands: 'basket', runner: 'bell', board: 'chalk' };
const HOUSES = ['#E0A85C', '#C9785A', '#7FA8B8', '#D9C27A', '#9DBF8A', '#C99AB8', '#E6D3B0'];
function house(ctx, x, i, lit) {
  const w = 76 + Math.floor(hash(i) * 22), h = 64 + Math.floor(hash(i + 9) * 22), y = 112 - h;
  ctx.fillStyle = HOUSES[i % HOUSES.length]; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x + w - 6, y, 6, h);
  ctx.fillStyle = ['#8A4B2A', '#5B3C22', '#6E2E28'][i % 3];
  ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + w / 2, y - 18 - hash(i + 3) * 8); ctx.lineTo(x + w + 4, y); ctx.closePath(); ctx.fill();
  /* windows */
  for (let k = 0; k < 2; k++) {
    const wx = x + 10 + k * (w - 34);
    ctx.fillStyle = dark() ? '#FFD98A' : '#BFE3F2'; ctx.fillRect(wx, y + 12, 14, 14);
    ctx.strokeStyle = '#FFF6DA'; ctx.lineWidth = 2; ctx.strokeRect(wx, y + 12, 14, 14);
  }
  /* the door, its step, its letter slot; lit when its post has come */
  const dx = x + w / 2 - 9;
  ctx.fillStyle = ['#0E6B78', '#C4453C', '#178A4C', '#2E3A40'][i % 4]; rr(ctx, dx, 112 - 30, 18, 30, 8); ctx.fill();
  ctx.fillStyle = '#D9B04A'; ctx.fillRect(dx + 5, 112 - 18, 8, 2); ctx.beginPath(); ctx.arc(dx + 14, 112 - 13, 1.6, 0, Math.PI * 2); ctx.fill();
  if (lit > 0) { ctx.globalAlpha = lit; ctx.fillStyle = '#FFF3C4'; rr(ctx, dx - 3, 112 - 33, 24, 36, 10); ctx.fill(); ctx.globalAlpha = 1; }
  return w + 6;
}
function dropPoint(ctx, kind, x, y) {
  shadow(ctx, x, y + 14, 26, 0.25);
  if (kind === 'chalk') {
    ctx.strokeStyle = '#8F6236'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - 12, y + 14); ctx.lineTo(x - 6, y - 16); ctx.moveTo(x + 12, y + 14); ctx.lineTo(x + 6, y - 16); ctx.stroke();
    ctx.fillStyle = '#2E3A40'; rr(ctx, x - 11, y - 18, 22, 24, 2); ctx.fill();
    ctx.strokeStyle = '#8F6236'; ctx.lineWidth = 2; rr(ctx, x - 11, y - 18, 22, 24, 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 6, y - 11); ctx.lineTo(x + 5, y - 11); ctx.moveTo(x - 6, y - 5); ctx.lineTo(x + 2, y - 5); ctx.stroke();
    return;
  }
  ctx.fillStyle = '#5B3C22'; ctx.fillRect(x - 2, y - 4, 4, 18);
  if (kind === 'basket') {
    ctx.fillStyle = '#B8894C'; ctx.beginPath(); ctx.moveTo(x - 12, y - 14); ctx.lineTo(x + 12, y - 14); ctx.lineTo(x + 9, y - 2); ctx.lineTo(x - 9, y - 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8F6236'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - 14, 9, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#E8A33C'; ctx.beginPath(); ctx.arc(x - 4, y - 15, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#8FA83A'; ctx.beginPath(); ctx.arc(x + 3, y - 16, 3, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'bell') {
    ctx.fillStyle = '#2E7FA8'; rr(ctx, x - 11, y - 20, 22, 18, 3); ctx.fill();
    ctx.fillStyle = '#D9B04A'; ctx.beginPath(); ctx.arc(x, y - 20, 5, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#FFF6DA'; ctx.fillRect(x - 6, y - 13, 12, 5);
  } else {
    ctx.fillStyle = '#C4453C'; rr(ctx, x - 11, y - 22, 22, 20, 8); ctx.fill();
    ctx.fillStyle = '#2E3A40'; ctx.fillRect(x - 6, y - 15, 12, 2.5);
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x - 8, y - 20, 3, 14);
  }
}
function dog(ctx, x, y, T) {
  const step = Math.sin(T / 70), wag = Math.sin(T / 60) * 0.5;
  shadow(ctx, x, y + 15, 36, 0.25);
  ctx.save(); ctx.translate(x, y + Math.abs(step) * -1.5);
  ctx.strokeStyle = '#7A4E2A'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(-8 + step * 4, 14); ctx.moveTo(-4, 4); ctx.lineTo(-4 - step * 4, 14);
  ctx.moveTo(8, 4); ctx.lineTo(8 - step * 4, 14); ctx.moveTo(12, 4); ctx.lineTo(12 + step * 4, 14); ctx.stroke();
  ctx.save(); ctx.translate(16, -2); ctx.rotate(-0.6 + wag); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -6, 4, -12); ctx.stroke(); ctx.restore();
  ctx.lineCap = 'butt';
  ctx.fillStyle = '#A8693A'; ctx.beginPath(); ctx.ellipse(2, 0, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F2D3A8'; ctx.beginPath(); ctx.ellipse(0, 3, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#A8693A'; ctx.beginPath(); ctx.arc(-14, -7, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-21, -4, 5, 3.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2B1A10'; ctx.beginPath(); ctx.arc(-25, -5, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-15, -9, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6E3E1E'; ctx.beginPath(); ctx.ellipse(-9, -9, 3.5, 6, 0.5 + step * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C4453C'; ctx.fillRect(-11, -2, 6, 2.5);
  ctx.restore();
}
function runnerFigure(ctx, x, y, T, shirt, hurt) {
  const ph = T / 85, leg = Math.sin(ph), bob = Math.abs(Math.cos(ph)) * 2.5;
  shadow(ctx, x, y + 18, 26, 0.28);
  ctx.save(); ctx.translate(x, y - bob);
  if (hurt > 0 && Math.floor(T / 80) % 2) ctx.globalAlpha = 0.45;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#2E3A40'; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(leg * 7, 18); ctx.moveTo(0, 4); ctx.lineTo(-leg * 7, 18); ctx.stroke();
  ctx.strokeStyle = '#8B5A3C'; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(-leg * 7, 0); ctx.stroke();
  ctx.fillStyle = shirt; rr(ctx, -6, -12, 12, 18, 5); ctx.fill();
  ctx.strokeStyle = '#7A5230'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-5, -11); ctx.lineTo(7, 2); ctx.stroke();
  ctx.fillStyle = '#B8894C'; rr(ctx, 3, -2, 10, 9, 2); ctx.fill();
  ctx.fillStyle = '#FFF6DA'; ctx.fillRect(5, -4, 6, 3);
  ctx.strokeStyle = '#8B5A3C'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(leg * 7, -1); ctx.stroke();
  ctx.fillStyle = '#8B5A3C'; ctx.beginPath(); ctx.arc(1, -19, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2E3A40'; ctx.beginPath(); ctx.arc(1, -21, 7.2, Math.PI * 1.05, Math.PI * 2.05); ctx.fill();
  ctx.fillRect(1, -23, 10, 3);
  ctx.fillStyle = '#1C2A2E'; ctx.beginPath(); ctx.arc(5, -18, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = 'butt'; ctx.restore();
}

function runnerGame(jobId, quit) {
  const c = K(), t = tier(c);
  const drop = RUN_DROP[jobId] || 'letterbox';
  const LANES = 3, LY = [146, 196, 246], RX = 36, CLOCK = 35000;
  const st = { score: 0, done: false, lane: 1, ly: LY[1], things: [], spawn: 500, dist: 0, lives: 3, msg: '', left: CLOCK, combo: 0, hurt: 0, posts: [], doorGlow: {} };
  const speed = () => 0.16 + t * 0.025 + st.dist / 26000;
  let FX = null, houseAt = [];

  return shell({
    jobId, st, quit, unit: 'points',
    step(dt) {
      st.left -= dt;
      if (st.left <= 0) { st.left = 0; st.end(); return; }
      st.dist += speed() * dt;
      st.ly += (LY[st.lane] - st.ly) * Math.min(1, dt * 0.02);
      st.hurt = Math.max(0, st.hurt - dt);
      st.spawn -= dt;
      if (st.spawn <= 0) {
        /* one drop-off per stretch of street, so every one can be reached —
           and sometimes a dog in another lane, so getting there takes care */
        st.spawn = Math.max(560, 900 - t * 50);
        const lane = Math.floor(Math.random() * LANES);
        if (Math.random() < 0.82) st.things.push({ lane, x: W + 20, bad: false });
        if (Math.random() < 0.38 + t * 0.03) st.things.push({ lane: (lane + 1 + Math.floor(Math.random() * 2)) % LANES, x: W + 20, bad: true });
      }
      for (let i = st.things.length - 1; i >= 0; i--) {
        const o = st.things[i];
        o.x -= speed() * dt;
        if (o.x < 54 && o.x > 18 && o.lane === st.lane) {
          st.things.splice(i, 1);
          if (o.bad) {
            st.lives--; st.combo = 0; st.hurt = 700; st.msg = 'Woof! −3'; st.score = Math.max(0, st.score - 3); sfx.bad();
            if (FX) { FX.shake(9, 300); FX.flash('#E0483E', 200); FX.pop(RX + 20, LY[o.lane] - 30, 'Woof! −3', { color: '#C4453C', size: 18 }); }
            if (st.lives <= 0) { st.end(); return; }
          } else {
            st.combo++; const pts = st.combo % 5 === 0 ? 2 : 1; st.score += pts; st.msg = st.combo >= 3 ? `Combo x${st.combo}` : ''; sfx.click();
            /* the post flies up to the nearest door ahead */
            const door = houseAt.find((h) => h.dx > RX + 10) || { dx: RX + 60, i: -1 };
            st.posts.push({ x0: RX, y0: st.ly - 10, x1: door.dx, y1: 96, t: 0, i: door.i });
            if (FX) { FX.pop(RX + 24, LY[o.lane] - 34, pts > 1 ? `Combo x${st.combo} +2` : '+1', { color: pts > 1 ? '#B57E10' : '#1C2A2E', size: 17 }); if (pts > 1) FX.coins(RX + 20, LY[o.lane] - 20, 5); }
          }
        } else if (o.x < -24) {
          st.things.splice(i, 1);
          if (!o.bad) { st.msg = 'Missed a door'; st.score = Math.max(0, st.score - 1); if (FX) FX.pop(40, LY[o.lane] - 20, 'Missed −1', { color: '#C4453C', size: 13 }); st.combo = 0; }
        }
      }
      for (let i = st.posts.length - 1; i >= 0; i--) {
        const p = st.posts[i]; p.t += dt / 420; p.x1 -= speed() * 0.55 * dt;
        if (p.t >= 1) { st.posts.splice(i, 1); if (p.i >= 0) st.doorGlow[p.i] = 1; if (FX) FX.burst(p.x1, p.y1, { n: 8, colors: ['#FFF3C4', '#F0B429'], speed: 0.12, size: 3 }); }
      }
      for (const k in st.doorGlow) { st.doorGlow[k] -= dt / 900; if (st.doorGlow[k] <= 0) delete st.doorGlow[k]; }
    },
    draw(ctx, { img, T, FX: fxl }) {
      FX = fxl;
      const d = st.dist;
      backdrop(ctx, W, H, img, { veil: 0.25, shift: -(d * 0.05) % 30 });
      /* far hills, slow */
      ctx.fillStyle = dark() ? 'rgba(40,60,70,.7)' : 'rgba(120,160,120,.6)';
      ctx.beginPath(); ctx.moveTo(0, 112);
      for (let x = 0; x <= W; x += 10) ctx.lineTo(x, 70 + Math.sin((x + d * 0.15) * 0.02) * 10 + Math.sin((x + d * 0.15) * 0.047) * 6);
      ctx.lineTo(W, 112); ctx.closePath(); ctx.fill();
      /* house fronts at half speed */
      const hs = d * 0.55;
      houseAt = [];
      /* walk houses from a fixed origin so each house keeps its look */
      let x, i = 0, acc = 0;
      while (acc < hs - 200) { acc += 76 + Math.floor(hash(i) * 22) + 6; i++; }
      x = acc - hs - 100;
      while (x < W + 10) {
        const w = 76 + Math.floor(hash(i) * 22) + 6;
        houseAt.push({ dx: x + (w - 6) / 2, i });
        house(ctx, x, i, st.doorGlow[i] || 0);
        x += w; i++;
      }
      /* kerb and pavement */
      ctx.fillStyle = '#8C8478'; ctx.fillRect(0, 112, W, 8);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(0, 112, W, 2);
      /* paving slabs, one band per lane */
      ctx.fillStyle = '#A99A80'; ctx.fillRect(0, 120, W, H - 120);
      LY.forEach((ly, k) => {
        const y0 = k === 0 ? 120 : ly - 25, y1 = ly + 25, sw = 46, off = ((-(d % sw)) + (k % 2) * 23) - sw;
        for (let x = off; x < W + sw; x += sw) {
          ctx.fillStyle = (Math.floor((x + d) / sw) + k) % 3 ? '#D3C7AC' : '#CBBEA2';
          rr(ctx, x + 1.5, y0 + 1.5, sw - 3, y1 - y0 - 3, 3); ctx.fill();
        }
      });
      ctx.strokeStyle = 'rgba(255,252,240,.55)'; ctx.lineWidth = 2; ctx.setLineDash([14, 16]); ctx.lineDashOffset = d % 30;
      for (const y of [LY[0] + 25, LY[1] + 25]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
      /* lane highlight */
      ctx.fillStyle = 'rgba(255,240,180,.16)'; ctx.fillRect(0, LY[st.lane] - 24, W, 49);
      /* what's coming, drawn back to front */
      [...st.things].sort((a, b) => a.lane - b.lane).forEach((o) => { if (o.bad) dog(ctx, o.x, LY[o.lane], T || 1); else dropPoint(ctx, drop, o.x, LY[o.lane]); });
      runnerFigure(ctx, RX, st.ly, still() ? 0 : T, '#0E6B78', st.hurt);
      /* post in flight */
      st.posts.forEach((p) => {
        const k = ease.out(Math.min(1, p.t)), px = p.x0 + (p.x1 - p.x0) * k, py = p.y0 + (p.y1 - p.y0) * k - Math.sin(k * Math.PI) * 30;
        ctx.save(); ctx.translate(px, py); ctx.rotate(k * 6);
        ctx.fillStyle = '#FFF6DA'; rr(ctx, -7, -5, 14, 10, 1.5); ctx.fill();
        ctx.strokeStyle = '#8A5B00'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-7, -5); ctx.lineTo(0, 1); ctx.lineTo(7, -5); ctx.stroke();
        ctx.restore();
      });
      night(ctx, 0.18);
    },
    hud(ctx) {
      const w = pill(ctx, `${Math.ceil(st.left / 1000)}s`, W - 8, 8, { warn: st.left < 10000 });
      lives(ctx, st.lives, 3, W - 14 - w, 8);
      if (st.combo >= 2) label(ctx, `Combo x${st.combo}`, 10, 52, { align: 'left', size: 13, color: '#B57E10' });
    },
    probe: () => {
      const soon = st.things.filter((o) => o.x > 40 && o.x < 200).sort((a, b) => a.x - b.x);
      const good = soon.find((o) => !o.bad);
      const danger = soon.find((o) => o.bad && o.lane === st.lane && o.x < 120);
      let want = good ? good.lane : null;
      if (danger) want = [0, 1, 2].find((l) => l !== st.lane && !soon.some((o) => o.bad && o.lane === l));
      return { kind: 'runner', lane: st.lane, want: want === undefined ? null : want, score: st.score, lives: st.lives, left: st.left };
    },
    onKey(e) {
      if (e.key === 'ArrowUp') st.lane = Math.max(0, st.lane - 1);
      else if (e.key === 'ArrowDown') st.lane = Math.min(LANES - 1, st.lane + 1);
    },
    onPoint(x, y) { st.lane = clamp(Math.round((y - LY[0]) / (LY[1] - LY[0])), 0, LANES - 1); },
    onAct(n, arg) { if (n === 'jgLane') st.lane = clamp(+arg, 0, LANES - 1); },
    controls: () => `<div class="choices" style="grid-template-columns:repeat(3,1fr);margin-top:8px">
      ${[0, 1, 2].map((i) => `<button class="btn ${st.lane === i ? '' : 'ghost'}" data-act="jgLane" data-arg="${i}"
        aria-label="lane ${i + 1}">${i + 1}</button>`).join('')}</div>`,
    hint: 'Up and down, or tap a lane. Every drop-off pays 1 and every fifth in a row pays 2; a missed one costs 1 and the dog costs 3.',
    boxes: () => [`${st.score} done`, '❤️'.repeat(Math.max(0, st.lives)), st.msg || ' '],
    finishLine: (s) => s.quality >= 1.4
      ? 'You can move. That is worth actual money on the Row — the fast runner gets asked back.'
      : 'The doors come in a rhythm once you stop chasing every one of them.',
  });
}

export function startJobGame(id, quit) {
  const cfg = JOB_GAME[id];
  if (!cfg) return null;
  const f = { stack: stackGame, trim: trimGame, sweep: sweepGame, runner: runnerGame }[cfg.kind];
  return f ? f(id, quit) : null;
}
