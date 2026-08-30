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

   Rules that are not negotiable here. BOTH keyboard and touch, inherited
   from Bizzing Bee. Wages go through arcade.js's payout() so there is still
   exactly one place that decides what play is worth. And pay is scaled by
   SKILL and clamped at both ends (sim.JOB_FLOOR / JOB_CEIL) — a bad shift
   still pays because the work was done, and a great one cannot become a
   jackpot, because a wage that swings like a slot machine teaches the exact
   thing CONCEPT §6.3 forbids. Nothing here is random-for-reward: the dice
   decide what arrives, never what it is worth. */

import { esc, sfx, clamp } from './ui.js';
import { money } from './fmt.js';
import { say } from './art.js';
import { JOBS } from './content.js';
import { payout, hud, endCard } from './arcade.js';
import * as sim from './sim.js';
import { R } from './runtime.js';

const K = () => sim.kid(R.s);
const W = 360, H = 300;

/* Which mechanic each job uses, and the dressing that makes it that job.
   `par` is a competent run — pay is the score against it — and it is tuned so
   an average shift pays about what the old button paid. */
export const JOB_GAME = {
  crates:    { kind: 'stack',  par: 8,  item: '📦', verb: 'Stack them square', tint: '--treasure' },
  haul:      { kind: 'stack',  par: 8,  item: '🛒', verb: 'Load the handcart',  tint: '--treasure' },
  counter:   { kind: 'stack',  par: 9,  item: '🥫', verb: 'Stock the shelves',  tint: '--treasure' },
  cargo:     { kind: 'trim',   par: 14, item: '⚓', verb: 'Keep her level',     tint: '--save' },
  nets:      { kind: 'trim',   par: 12, item: '🕸️', verb: 'Balance the load',   tint: '--save' },
  books:     { kind: 'trim',   par: 13, item: '📒', verb: 'Balance the books',  tint: '--save' },
  sweep:     { kind: 'sweep',  par: 16, item: '🧹', verb: 'Clear the Row',      tint: '--grow' },
  lamplight: { kind: 'sweep',  par: 15, item: '🏮', verb: 'Light every lamp',   tint: '--grow' },
  mend:      { kind: 'sweep',  par: 15, item: '🧵', verb: 'Mend the lot',       tint: '--grow' },
  flyers:    { kind: 'runner', par: 12, item: '📄', verb: 'Every door on the Row', tint: '--action' },
  errands:   { kind: 'runner', par: 13, item: '🏃', verb: 'Every stop, in order',  tint: '--action' },
  runner:    { kind: 'runner', par: 14, item: '📨', verb: 'Get the orders out',    tint: '--action' },
  board:     { kind: 'runner', par: 13, item: '🖍️', verb: 'Chalk up every price',  tint: '--action' },
};
export function hasJobGame(id) { return !!JOB_GAME[id]; }

/* Difficulty rises with the ladder rather than with the clock, so a child who
   is better at this is playing a harder game, not a longer one. */
function tier(c) { return Math.min(6, Math.floor(((c.learn && c.learn.level) || 1) / 4)); }

function tok(n, f) {
  const cs = getComputedStyle(document.documentElement);
  return ((cs.getPropertyValue(n) || f).trim()) || f;
}

/* ── the shared shell ─────────────────────────────────────────────────────
   Every job game is the same object shape as the arcade's: mount/stop/key/
   act/view. This builds all of that from a spec so a new mechanic is a step
   function and a draw function, not another 120 lines of plumbing. */
function shell(spec) {
  const { jobId, st, step, draw, onKey, onPoint, controls, hint, finishLine } = spec;
  const job = JOBS.find((j) => j.id === jobId) || { name: 'Work', who: 'the town' };
  const cfg = JOB_GAME[jobId];
  let raf = 0, last = 0, ctx = null, cv = null;

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
  st.end = end;

  const loop = (ts) => {
    if (st.done) return;
    const dt = Math.min(50, ts - (last || ts)); last = ts;
    step(dt, end);
    if (ctx) draw(ctx);
    raf = requestAnimationFrame(loop);
  };

  return {
    id: 'job:' + jobId,
    /* A read-only snapshot, so a headless driver can PLAY the game rather
       than mash keys at it — the only way to find out how long a competent
       run actually takes, which is the number that decides whether any of
       this is worth a child's evening. */
    __st: () => spec.probe(),
    mount() {
      cv = document.getElementById('jobCanvas');
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx = cv.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!st.done) { last = 0; stop(); raf = requestAnimationFrame(loop); }
      /* Touch is not an afterthought: the canvas itself is a control. */
      if (onPoint) cv.onpointerdown = (e) => {
        const r = cv.getBoundingClientRect();
        onPoint(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H);
      };
    },
    stop,
    key(e) {
      if (st.done) { if (e.key === 'Enter') { spec.quit(); R.render(); } return; }
      onKey(e);
    },
    act(n, arg) { if (spec.onAct) spec.onAct(n, arg); },
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
        <div class="stage" style="min-height:0;padding:12px">
          <div class="row" style="gap:8px">
            <span class="grow"><b style="font-size:15px">${esc(cfg.verb)}</b>
              <div class="small muted">for ${esc(job.who)}</div></span>
            <span class="pill">best ${sim.jobBest(K(), jobId)}</span>
          </div>
          <canvas id="jobCanvas" style="width:100%;max-width:400px;margin:0 auto;height:auto;
            aspect-ratio:${W}/${H};border-radius:var(--r-md);display:block;touch-action:none"></canvas>
          ${controls()}
          <p class="hint">${esc(hint)}</p>
        </div></div>`;
    },
  };
}

/* ── stack ────────────────────────────────────────────────────────────────
   A crate swings; you drop it. Whatever hangs over the edge is lost and the
   pile gets narrower, so a sloppy run ends itself. */
function stackGame(jobId, quit) {
  const c = K(), t = tier(c);
  const st = { score: 0, done: false, w: 120, x: 40, dir: 1, y: H - 26, pile: [], falling: null, msg: '' };
  const speed = () => 0.13 + t * 0.02 + st.score * 0.012;

  const drop = () => {
    if (st.done || st.falling) return;
    st.falling = { x: st.x, w: st.w, y: 40 };
  };
  const land = () => {
    const f = st.falling; st.falling = null;
    const top = st.pile.length ? st.pile[st.pile.length - 1] : { x: 40, w: 120 };
    const l = Math.max(f.x, top.x), r = Math.min(f.x + f.w, top.x + top.w);
    const overlap = r - l;
    if (overlap <= 6) { st.msg = 'Off the pile'; sfx.bad(); st.end(); return; }
    st.pile.push({ x: l, w: overlap });
    st.w = overlap; st.x = l;
    st.score++;
    st.msg = overlap > f.w - 4 ? 'Dead square!' : '';
    sfx.click();
    if (st.pile.length > 9) st.pile.shift();
  };

  return shell({
    jobId, st, quit, unit: 'crates',
    step(dt) {
      if (st.falling) {
        st.falling.y += 0.62 * dt;
        const topY = H - 26 - st.pile.length * 22;
        if (st.falling.y >= topY - 20) land();
        return;
      }
      st.x += st.dir * speed() * dt;
      if (st.x <= 0) { st.x = 0; st.dir = 1; }
      if (st.x + st.w >= W) { st.x = W - st.w; st.dir = -1; }
    },
    draw(ctx) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = tok('--tint', '#EDF2F2'); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = tok('--road', '#C9BE9C'); ctx.fillRect(0, H - 8, W, 8);
      st.pile.forEach((p, i) => {
        ctx.fillStyle = i % 2 ? tok('--treasure', '#F0B429') : tok('--treasure-deep', '#8A5B00');
        ctx.fillRect(p.x, H - 26 - i * 22, p.w, 20);
      });
      const f = st.falling;
      ctx.fillStyle = tok('--action', '#0E6B78');
      if (f) ctx.fillRect(f.x, f.y, f.w, 20);
      else {
        ctx.fillRect(st.x, 40, st.w, 20);
        ctx.strokeStyle = tok('--line', '#DCE5E4'); ctx.beginPath();
        ctx.moveTo(st.x + st.w / 2, 0); ctx.lineTo(st.x + st.w / 2, 40); ctx.stroke();
      }
    },
    probe: () => { const top = st.pile.length ? st.pile[st.pile.length - 1] : { x: 40, w: 120 };
      return { kind: 'stack', x: st.x, w: st.w, topX: top.x, topW: top.w, falling: !!st.falling, score: st.score }; },
    onKey(e) { if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); drop(); } },
    onPoint() { drop(); },
    onAct(n) { if (n === 'jgDrop') drop(); },
    controls: () => `<button class="btn wide" data-act="jgDrop" style="margin-top:8px">Drop it</button>`,
    hint: 'Space, or tap anywhere. Whatever hangs over the edge falls off — and the pile gets narrower.',
    boxes: () => [`${st.score} stacked`, `${Math.round(st.w)}cm wide`, st.msg || ' '],
    finishLine: (s) => s.score >= 12
      ? 'Nobody stacks twelve by accident. That is a skill, and it is worth more per hour than the sweeping.'
      : 'Every one you land square makes the next one easier. That is most jobs, really.',
  });
}

/* ── trim ─────────────────────────────────────────────────────────────────
   Weight arrives; you send it port or starboard. The boat leans. Two buttons,
   no right answer written anywhere, and it gets faster. */
function trimGame(jobId, quit) {
  const c = K(), t = tier(c);
  /* A shift has a length. Without one a competent player keeps the boat level
     for ever and the job never ends — which a headless run doing exactly that
     for 141 seconds is how we found out. Work finishes; that is what makes it
     work rather than a screensaver. */
  const SHIFT = 20;
  const st = { score: 0, done: false, tilt: 0, queue: [], spawn: 0, t: 0, msg: '', limit: 42 };
  const gap = () => Math.max(560, 1500 - t * 90 - st.score * 45);

  const send = (side) => {
    if (st.done || !st.queue.length) return;
    const box = st.queue.shift();
    st.tilt += side * box.w * 4;
    st.score++;
    if (Math.abs(st.tilt) > st.limit) { st.msg = 'Over she goes'; sfx.bad(); st.end(); return; }
    if (Math.abs(st.tilt) < 8) { st.msg = 'Level'; sfx.coin(); } else { st.msg = ''; sfx.click(); }
    if (st.score >= SHIFT) { st.msg = 'Shift done'; st.end(); }
  };

  return shell({
    jobId, st, quit, unit: 'loads',
    step(dt) {
      st.t += dt; st.spawn -= dt;
      if (st.spawn <= 0 && st.queue.length < 4) {
        st.spawn = gap();
        st.queue.push({ w: 1 + Math.floor(Math.random() * (3 + t)) });
      }
      /* The sea does not wait: an unattended boat drifts back towards even,
         slowly, so standing still is neither a win nor instant death. */
      st.tilt *= 0.9992 ** dt;
      if (st.queue.length >= 4) { st.msg = 'The deck is full'; sfx.bad(); st.end(); }
    },
    draw(ctx) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = tok('--sky1', '#CFE9EE'); ctx.fillRect(0, 0, W, H * 0.55);
      ctx.fillStyle = tok('--save', '#2E7FA8'); ctx.globalAlpha = 0.35;
      ctx.fillRect(0, H * 0.55, W, H * 0.45); ctx.globalAlpha = 1;
      const a = (st.tilt / st.limit) * 0.42;
      ctx.save();
      ctx.translate(W / 2, H * 0.6); ctx.rotate(a);
      ctx.fillStyle = tok('--ink', '#16262A');
      ctx.beginPath();
      ctx.moveTo(-110, -18); ctx.lineTo(110, -18); ctx.lineTo(80, 26); ctx.lineTo(-80, 26);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = tok('--paper', '#FFFCF5'); ctx.fillRect(-104, -24, 208, 8);
      ctx.restore();
      /* the queue, waiting on the quay */
      st.queue.forEach((b, i) => {
        const s = 16 + b.w * 5;
        ctx.fillStyle = tok('--treasure', '#F0B429');
        ctx.fillRect(W / 2 - s / 2 + i * 2, 24 + i * 26, s, 20);
        ctx.fillStyle = '#4A3200'; ctx.font = '700 12px system-ui';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(b.w), W / 2 + i * 2, 34 + i * 26);
      });
      /* the spirit level */
      ctx.fillStyle = tok('--line', '#DCE5E4'); ctx.fillRect(40, H - 22, W - 80, 10);
      ctx.fillStyle = Math.abs(st.tilt) > st.limit * 0.75 ? tok('--spend', '#C4453C') : tok('--grow', '#178A4C');
      ctx.fillRect(W / 2 - 6 + clamp(st.tilt / st.limit, -1, 1) * ((W - 80) / 2 - 6), H - 24, 12, 14);
    },
    probe: () => ({ kind: 'trim', tilt: st.tilt, queue: st.queue.length, score: st.score }),
    onKey(e) {
      if (e.key === 'ArrowLeft') send(-1);
      else if (e.key === 'ArrowRight') send(1);
    },
    onAct(n) { if (n === 'jgPort') send(-1); else if (n === 'jgStar') send(1); },
    controls: () => `<div class="choices" style="margin-top:8px">
      <button class="btn" data-act="jgPort">← Port</button>
      <button class="btn" data-act="jgStar">Starboard →</button></div>`,
    hint: 'Arrows, or the two buttons. Heavy one side, heavy the other — let her lean too far and she goes over.',
    boxes: () => [`${st.score}/${SHIFT} aboard`, `lean ${Math.abs(Math.round(st.tilt))}`, st.msg || ' '],
    finishLine: (s) => s.score >= 16
      ? 'That is the whole job, and it is the same shape as a budget: it is not what you take on, it is whether it balances.'
      : 'Weight is easy. Weight on one side is the problem — and you can feel it coming before it goes.',
  });
}

/* ── sweep ────────────────────────────────────────────────────────────────
   Move, collect, chain. The one with a clock on it. */
function sweepGame(jobId, quit) {
  const c = K(), t = tier(c);
  const cfg = JOB_GAME[jobId];
  const st = { score: 0, done: false, x: W / 2, target: W / 2, bits: [], spawn: 0, left: 45000, chain: 0, msg: '' };

  return shell({
    jobId, st, quit, unit: 'cleared',
    step(dt) {
      st.left -= dt;
      if (st.left <= 0) { st.left = 0; st.end(); return; }
      st.spawn -= dt;
      if (st.spawn <= 0 && st.bits.length < 7) {
        st.spawn = Math.max(320, 900 - t * 70);
        st.bits.push({ x: 18 + Math.random() * (W - 36), y: 60 + Math.random() * (H - 120), age: 0 });
      }
      st.x += (st.target - st.x) * Math.min(1, 0.011 * dt);
      for (let i = st.bits.length - 1; i >= 0; i--) {
        const b = st.bits[i];
        b.age += dt;
        if (Math.abs(b.x - st.x) < 30 && b.y > H - 130) {
          st.bits.splice(i, 1); st.chain++; st.score += 1 + Math.floor(st.chain / 5);
          st.msg = st.chain >= 5 ? st.chain + ' in a row' : ''; sfx.click();
        } else if (b.age > 7000) { st.bits.splice(i, 1); st.chain = 0; st.msg = 'Missed one'; }
        else { b.y += 0.018 * dt; }
      }
    },
    draw(ctx) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = tok('--ground', '#DCCFA8'); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = tok('--road', '#C9BE9C'); ctx.fillRect(0, H - 100, W, 4);
      st.bits.forEach((b) => {
        ctx.globalAlpha = b.age > 5600 ? 0.45 : 1;
        ctx.font = '20px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(cfg.item, b.x, b.y);
        ctx.globalAlpha = 1;
      });
      ctx.fillStyle = tok('--action', '#0E6B78');
      ctx.fillRect(st.x - 30, H - 48, 60, 12);
      ctx.fillRect(st.x - 3, H - 78, 6, 32);
    },
    probe: () => {
      let n = null, d = 1e9;
      st.bits.forEach((b) => { const q = Math.abs(b.x - st.x); if (q < d) { d = q; n = b.x; } });
      return { kind: 'sweep', x: st.x, nearest: n, score: st.score, left: st.left };
    },
    onKey(e) {
      if (e.key === 'ArrowLeft') st.target = Math.max(20, st.target - 46);
      else if (e.key === 'ArrowRight') st.target = Math.min(W - 20, st.target + 46);
    },
    onPoint(x) { st.target = clamp(x, 20, W - 20); },
    onAct(n) {
      if (n === 'jgLeft') st.target = Math.max(20, st.target - 46);
      else if (n === 'jgRight') st.target = Math.min(W - 20, st.target + 46);
    },
    controls: () => `<div class="choices" style="margin-top:8px">
      <button class="btn ghost" data-act="jgLeft">←</button>
      <button class="btn ghost" data-act="jgRight">→</button></div>`,
    hint: 'Arrows, the buttons, or drag on the row. Catch them before they fade — a clean run counts double.',
    boxes: () => [`${st.score}`, `${Math.ceil(st.left / 1000)}s`, st.msg || ' '],
    finishLine: (s) => s.score >= 20
      ? 'Fast and tidy. The chain is where the money is, and that is true of the real one too.'
      : 'Every one you let fade broke the chain. Steady beats frantic here.',
  });
}

/* ── runner ───────────────────────────────────────────────────────────────
   Three lanes of street. Post every door, dodge what is in the way. */
function runnerGame(jobId, quit) {
  const c = K(), t = tier(c);
  const cfg = JOB_GAME[jobId];
  const LANES = 3, LY = [H * 0.3, H * 0.52, H * 0.74];
  const st = { score: 0, done: false, lane: 1, things: [], spawn: 0, dist: 0, lives: 3, msg: '' };
  const speed = () => 0.16 + t * 0.025 + st.dist / 26000;

  return shell({
    jobId, st, quit, unit: 'delivered',
    step(dt) {
      st.dist += speed() * dt;
      st.spawn -= dt;
      if (st.spawn <= 0) {
        st.spawn = Math.max(380, 900 - t * 60);
        const lane = Math.floor(Math.random() * LANES);
        st.things.push({ lane, x: W + 20, bad: Math.random() < 0.3 + t * 0.03 });
      }
      for (let i = st.things.length - 1; i >= 0; i--) {
        const o = st.things[i];
        o.x -= speed() * dt;
        if (o.x < 54 && o.x > 18 && o.lane === st.lane) {
          st.things.splice(i, 1);
          if (o.bad) {
            st.lives--; st.msg = 'Wrong door'; sfx.bad();
            if (st.lives <= 0) { st.end(); return; }
          } else { st.score++; st.msg = ''; sfx.click(); }
        } else if (o.x < -24) {
          st.things.splice(i, 1);
          if (!o.bad) { st.msg = 'Missed a door'; }
        }
      }
    },
    draw(ctx) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = tok('--ground', '#DCCFA8'); ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = tok('--road', '#C9BE9C'); ctx.lineWidth = 2;
      LY.forEach((y) => {
        ctx.beginPath();
        for (let x = -(st.dist % 30); x < W; x += 30) { ctx.moveTo(x, y + 22); ctx.lineTo(x + 14, y + 22); }
        ctx.stroke();
      });
      st.things.forEach((o) => {
        ctx.font = '22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(o.bad ? '🐕' : '🚪', o.x, LY[o.lane]);
      });
      ctx.font = '24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(cfg.item, 36, LY[st.lane]);
    },
    probe: () => {
      const soon = st.things.filter((o) => o.x > 40 && o.x < 200).sort((a, b) => a.x - b.x);
      const good = soon.find((o) => !o.bad);
      const danger = soon.find((o) => o.bad && o.lane === st.lane && o.x < 120);
      let want = good ? good.lane : null;
      if (danger) want = [0, 1, 2].find((l) => l !== st.lane && !soon.some((o) => o.bad && o.lane === l));
      return { kind: 'runner', lane: st.lane, want: want === undefined ? null : want, score: st.score, lives: st.lives };
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
    hint: 'Up and down, or tap a lane. Every door is a delivery. The dog is not.',
    boxes: () => [`${st.score} done`, '❤️'.repeat(Math.max(0, st.lives)), st.msg || ' '],
    finishLine: (s) => s.score >= 16
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
