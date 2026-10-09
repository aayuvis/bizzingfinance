/* board.js — MAIN STREET, the board game.
   Monopoly's shape with its point removed: you do not win by bankrupting
   anybody. You win when the things you own pay for the life you lead —
   the same finish line as the Independence meter, on a board, in 20 minutes. */

import { esc, sfx, rng, clamp } from './ui.js';
import { money } from './fmt.js';
import { say, CAST, ico, portraitSrc } from './art.js';
import { avatarSrc } from './avatars.js';
import * as sim from './sim.js';
import { R } from './runtime.js';
import { plateFor } from './looks.js';
import { fx as makeFx, still, rr, shadow, ease, plateCss } from './gamefx.js';
const BOARD_SKIN = { 'board-harbour': 'harbour', 'board-clock': 'clock', 'board-festival': 'festival' };

const K = () => sim.kid(R.s);

/* 20 squares, clockwise from the bottom-left corner. */
export const SQUARES = [
  { t: 'start', n: 'Pay day', em: '🔔' },
  { t: 'biz', n: 'Chai cart',    em: '🫖', cost: 60,  inc: 6 },
  { t: 'chance', n: 'Chance',    em: '✉️' },
  { t: 'biz', n: 'Flower stall', em: '💐', cost: 80,  inc: 8 },
  { t: 'bill', n: 'Bus fares',   em: '🚌', amt: 10 },
  { t: 'biz', n: 'Bread oven',   em: '🍞', cost: 100, inc: 10 },
  { t: 'biz', n: 'Fix-it shed',  em: '🔧', cost: 120, inc: 12 },
  { t: 'chance', n: 'Chance',    em: '✉️' },
  { t: 'biz', n: 'Book barrow',  em: '📚', cost: 140, inc: 14 },
  { t: 'rest', n: 'Sit down',    em: '🪑' },
  { t: 'biz', n: 'Tea rooms',    em: '🍰', cost: 160, inc: 17 },
  { t: 'market', n: 'The Basket', em: '🧺', cost: 50, inc: 4 },
  { t: 'biz', n: 'Print shop',   em: '🖨️', cost: 180, inc: 19 },
  { t: 'chance', n: 'Chance',    em: '✉️' },
  { t: 'bill', n: 'Phone bill',  em: '📱', amt: 14 },
  { t: 'biz', n: 'Bike repair',  em: '🚲', cost: 200, inc: 22 },
  { t: 'biz', n: 'Corner shop',  em: '🏪', cost: 220, inc: 24 },
  { t: 'chance', n: 'Chance',    em: '✉️' },
  { t: 'biz', n: 'The cinema',   em: '🎬', cost: 260, inc: 30 },
  { t: 'bill', n: 'Rent day',    em: '🏠', amt: 20 },
];

/* Chance is where the real money events live: insurance that only pays off
   if you bought it before you needed it, a subscription nobody remembers
   signing up for, a rent rise that never goes away again. */
export const CARDS = [
  { id: 'crack', em: '📱', t: 'Your screen is cracked',
    body: 'Thirty to fix it — unless you took the cover when it was offered.',
    run: (g, p) => p.insured
      ? { note: 'Your cover paid for it. That is what it was for.', cash: 0 }
      : { note: 'No cover, so you pay the lot.', cash: -30 } },
  { id: 'insure', em: '🛡️', t: 'Cover, fifteen',
    body: 'Fifteen now, and anything that breaks for the rest of the game is covered.',
    choices: [
      { label: 'Take the cover · 15', run: (g, p) => { p.insured = true; return { note: 'Covered. It may never pay off, and that is not the same as wasted.', cash: -15 }; } },
      { label: 'Chance it', run: () => ({ note: 'Nothing happens today. Sometimes that is the right call.', cash: 0 }) },
    ] },
  { id: 'sub', em: '🔁', t: 'A club you forgot joining',
    body: 'Twelve now, and two every lap until you notice.',
    choices: [
      { label: 'Cancel it · costs 12 today', run: (g, p) => ({ note: 'Twelve now instead of two a lap forever. Cancelling is almost always the cheap option.', cash: -12 }) },
      { label: 'Leave it running', run: (g, p) => { p.expenses += 2; return { note: 'Your expenses just went up by two a lap. Small numbers are the whole technique.', cash: 0 }; } },
    ] },
  { id: 'bonus', em: '🎉', t: 'A job done properly',
    body: 'Word got round. Somebody paid you forty for the trouble.',
    run: () => ({ note: 'Being worth asking twice pays better than being fastest.', cash: 40 }) },
  { id: 'rise', em: '📈', t: 'Prices went up',
    body: 'Same everything, bigger numbers. Your expenses rise by three a lap.',
    run: (g, p) => { p.expenses += 3; return { note: 'That is inflation, and it does not undo itself.', cash: 0 }; } },
  { id: 'lend', em: '🤝', t: 'A friend is short',
    body: 'Twenty-five would get them through the week.',
    choices: [
      { label: 'Lend it', run: (g, p) => { p.owed = (p.owed || 0) + 25; return { note: 'Lent. You get it back on your next pay day — probably.', cash: -25 }; } },
      { label: 'Explain why not', run: () => ({ note: 'Saying no honestly protects a friendship better than a grudge does.', cash: 0 }) },
    ] },
  { id: 'found', em: '🪙', t: 'Money in an old coat',
    body: 'Fifteen, and no idea when it went in there.',
    run: () => ({ note: 'Free money is rare and this is not a strategy.', cash: 15 }) },
  { id: 'repair', em: '🔨', t: 'The roof again',
    body: 'Twenty-five, or fifty if you have nothing set aside.',
    run: (g, p) => p.cash >= 60
      ? { note: 'You had enough to fix it straight away, so it cost less.', cash: -25 }
      : { note: 'Fixing it late costs more. That is what an emergency fund is for.', cash: -50 } },
];

/* The bots play like who they are, not like difficulty settings. Mags buys
   every shop she can afford and cannot walk past a shiny thing either; Bo
   holds out for the big one and watches the ordinary ones go. Simulated over
   200 games: steady 92, Mags 87, Bo 21 — so the boring middle wins, narrowly,
   and both failure modes are on the table. */
const SHINY = 18, BIG = 140;
export const BOTS = [
  { name: 'Mags', who: 'mags', buy: (p, sq) => p.cash >= sq.cost, insure: false,
    line: 'If I can afford it I am having it.' },
  { name: 'Bo', who: 'bo', buy: (p, sq) => sq.cost >= BIG && p.cash - sq.cost >= 60, insure: true,
    line: 'I am holding out for a big one.' },
];

const START_CASH = 220, WAGE = 60, BASE_EXP = 24, MAX_LAPS = 8;

/* G8 · a level is the life everyone at the table has to pay for: `baseExp` is the
   starting expenses a lap (Standard 24, today's). The wage scales by Standard's over
   the level's, so the same independence earns the same pay on every level.
   opts.onFinish(run) hands the run's summary back for the goals (G9); opts.chip and
   opts.goals are the arcade's level chip and goal list, drawn into this screen. */
export function mainStreet(opts = {}) {
  /* §2.9 · dice seeded per GAME (the arcade hands each play its own seed): one fixed
     sequence of rolls made "always buy" a guaranteed win, every time */
  const r = rng(opts.seed != null ? opts.seed : 60607);
  const EXP0 = opts.baseExp > 0 ? opts.baseExp : BASE_EXP;
  const chip = () => (opts.chip ? `<span class="box">${opts.chip()}</span>` : '');
  const mk = (name, who, human) => ({ name, who, human, pos: 0, cash: START_CASH,
    own: [], expenses: EXP0, insured: false, laps: 0, owed: 0, sold: 0 });
  const g = {
    players: [mk('You', 'pip', true), mk('Mags', 'mags', false), mk('Bo', 'bo', false)],
    turn: 0, phase: 'roll', die: 0, log: [], card: null, sq: null, done: false, winner: null, moves: 0,
    trail: [], walk: null, rolled: '',
  };
  let anim = 0, raf = 0, pend = null;
  /* the bots' next move, kept so a hidden tab can pause it and pick it up again (§1.5) */
  const later = (f, ms) => { pend = f; anim = setTimeout(() => { anim = 0; pend = null; f(); }, ms); };

  /* G2 · the kit's life on a DOM board. The die tumbles, then the token walks the
     squares one at a time — on the wall's clock, so a slow phone walks the same
     speed in fewer frames. Headless, or under reduced motion, it is instant: the
     same squares, the same pay day, the same landing, no pictures in between. */
  const ROLLMS = 460, STEPMS = 180, SETTLEMS = 200, HOPMS = 150;
  const instant = () => still() || typeof requestAnimationFrame !== 'function' || typeof document === 'undefined';
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const FX = makeFx();
  const look = { cv: null, ctx: null, W: 0, H: 0, cells: [], die: null, col: {}, tok: [], stamps: [], prev: 0, at: [], faces: [] };
  g.look = look;

  const cur = () => g.players[g.turn];
  const income = (p) => p.own.reduce((t, i) => t + SQUARES[i].inc, 0);
  const indep = (p) => (p.expenses > 0 ? income(p) / p.expenses : 0);
  const ownerOf = (i) => g.players.find((p) => p.own.includes(i));
  const note = (s) => { g.log.unshift(s); if (g.log.length > 5) g.log.length = 5; };

  const stop = () => {
    if (anim) { clearTimeout(anim); anim = 0; }
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  };

  const checkWin = () => {
    const won = g.players.filter((p) => indep(p) >= 1);
    if (won.length) {
      g.done = true;
      g.winner = won.sort((a, b) => indep(b) - indep(a))[0];
      finish(); return true;
    }
    if (g.players[0].laps >= MAX_LAPS) {
      g.done = true;
      g.winner = g.players.slice().sort((a, b) => indep(b) - indep(a))[0];
      finish(); return true;
    }
    return false;
  };
  const finish = () => {
    stop();
    const me = g.players[0];
    g.mine = indep(me);
    const c = K();
    if (g.winner === me) sim.badge(c, 'main-street');
    /* §1.1 · the wage goes through the arcade's one door — payout(), the day's cap, the
       level's par, one price() — never straight into the wallet. The arcade hands that
       door in as onFinish; on its own, the board pays nothing. Independence is the score:
       what you own ÷ what you spend, which already measures a dearer life on Tricky. */
    g.won = (opts.onFinish && opts.onFinish({ won: g.winner === me, owned: me.own.length, sold: me.sold, cash: me.cash, indep: g.mine })) || 0;
    sim.stamp(c);
    sfx.level();
    R.render();
  };

  /* Spending every penny on assets should not be free. Run out of cash and
     you sell something at half what you paid for it — which is the cash-is-
     not-profit lesson with teeth, and the reason a buffer is worth keeping. */
  const settle = (p) => {
    while (p.cash < 0 && p.own.length) {
      const i = p.own.slice().sort((a, b) => SQUARES[a].cost - SQUARES[b].cost)[0];
      p.own.splice(p.own.indexOf(i), 1);
      const got = Math.round(SQUARES[i].cost / 2);
      p.cash += got; p.sold++;
      note(`${p.name} had to sell ${SQUARES[i].n} for ${got} — half what it cost.`);
      if (p.human) sfx.bad();
    }
    if (p.cash < 0) {
      p.cash = 0; p.skip = 1;
      note(`${p.name} had a week they would rather forget, and misses a turn.`);
    }
  };

  const payDay = (p) => {
    p.laps++;
    p.cash += WAGE + income(p);
    p.cash -= p.expenses;
    if (p.owed) { p.cash += Math.round(p.owed * 1.2); note(`${p.name} was paid back, with a bit on top.`); p.owed = 0; }
    note(`${p.name} passed pay day: +${WAGE + income(p)}, −${p.expenses}.`);
    if (p.name === 'Mags') { p.cash -= SHINY; note(`Mags bought something shiny on the way past — ${SHINY}.`); }
    settle(p);
  };

  const land = (p) => {
    const i = p.pos, sq = SQUARES[i];
    g.sq = i;
    if (sq.t === 'bill') { p.cash -= sq.amt; note(`${p.name} paid ${sq.n} — ${sq.amt}.`); settle(p); return endTurn(); }
    if (sq.t === 'rest') { note(`${p.name} sat down for five minutes.`); return endTurn(); }
    if (sq.t === 'start') { note(`${p.name} landed on pay day.`); return endTurn(); }
    if (sq.t === 'chance') {
      const card = CARDS[Math.floor(r() * CARDS.length)];
      g.card = card;
      if (p.human && card.choices) { g.phase = 'card'; R.render(); return; }
      const pick = card.choices
        ? card.choices[BOTS.find((b) => b.name === p.name) && BOTS.find((b) => b.name === p.name).insure ? 0 : 1]
        : card;
      const res = pick.run(g, p);
      p.cash += res.cash || 0;
      note(`${p.name} — ${card.t}. ${res.note}`);
      settle(p);
      g.card = null;
      return endTurn();
    }
    // a business or the Basket
    const owner = ownerOf(i);
    if (!owner) {
      if (p.human) { g.phase = 'decide'; R.render(); return; }
      const bot = BOTS.find((b) => b.name === p.name);
      if (bot && bot.buy(p, sq) && p.cash >= sq.cost) {
        p.cash -= sq.cost; p.own.push(i);
        note(`${p.name} bought ${sq.n} for ${sq.cost}.`);
      } else note(`${p.name} passed on ${sq.n}.`);
      return endTurn();
    }
    if (owner === p) { note(`${p.name} looked in on ${sq.n}.`); return endTurn(); }
    if (sq.t === 'market') { note(`${p.name} browsed the Basket. Funds don't charge rent.`); return endTurn(); }
    const rent = sq.inc * 2;
    p.cash -= rent; owner.cash += rent;
    note(`${p.name} spent ${rent} at ${owner.human ? 'your' : owner.name + "'s"} ${sq.n}.`);
    settle(p);
    return endTurn();
  };

  const endTurn = () => {
    if (checkWin()) return;
    g.phase = 'roll';
    g.turn = (g.turn + 1) % g.players.length;
    g.card = null;
    if (cur().skip) { cur().skip = 0; note(`${cur().name} sits this one out.`); R.render(); later(endTurn, 700); return; }
    R.render();
    if (!cur().human) later(roll, 520);
  };

  /* one square forward; passing Start is pay day, exactly as before */
  const stepOne = (p) => {
    p.pos = (p.pos + 1) % SQUARES.length;
    g.trail.push(p.pos);
    if (p.pos === 0) payDay(p);
    g.moves--;
  };
  const roll = () => {
    if (g.done || g.phase !== 'roll') return;
    const p = cur();
    g.die = 1 + Math.floor(r() * 6);
    g.phase = 'moving';
    g.moves = g.die; g.trail = [p.pos]; g.rolled = p.name;
    sfx.click();
    if (instant()) { while (g.moves > 0) stepOne(p); land(p); return; }
    g.walk = { p, t0: now() };
    R.render();
  };
  /* step k of the walk falls due at ROLLMS + (k−1)·STEPMS after the roll, by the clock —
     a frame that arrives late takes every step that fell due while it was away */
  const walkTo = (ts) => {
    const w = g.walk; if (!w) return false;
    const t = Math.max(0, ts - w.t0);   /* a frame stamped just before the roll is not a step back in time */
    const due = t < ROLLMS ? 0 : Math.min(g.die, 1 + Math.floor((t - ROLLMS) / STEPMS));
    let moved = false;
    while (g.die - g.moves < due) { stepOne(w.p); moved = true; }
    if (!g.moves && t >= ROLLMS + (g.die - 1) * STEPMS + SETTLEMS) { g.walk = null; land(w.p); return false; }
    return moved;
  };

  /* ── the picture: one canvas over the squares, re-found after every render ── */
  const colOf = (p) => look.col[p.who] || '#0E6B78';
  /* corners of the square, so the name and the price stay readable under a token */
  const OFF = [[0.3, 0.3], [-0.31, -0.3], [0.31, -0.3]];
  const tokOf = (i, ts) => {
    const p = g.players[i];
    return look.tok[i] || (look.tok[i] = { at: p.pos, from: p.pos, t0: ts - 1e6, cash: p.cash, own: p.own.slice() });
  };
  const tokXY = (i, ts) => {
    const v = tokOf(i, ts), a = look.cells[v.from], b = look.cells[v.at], o = OFF[i] || OFF[0];
    if (!b) return { x: -99, y: -99, gy: -99, k: 1, sq: v.at };
    const k = still() || !a ? 1 : Math.max(0, Math.min(1, (ts - v.t0) / HOPMS)), e = ease.inOut(k);
    const ax = (a || b).x + o[0] * (a || b).w, ay = (a || b).y + o[1] * (a || b).h;
    const bx = b.x + o[0] * b.w, by = b.y + o[1] * b.h;
    const gy = ay + (by - ay) * e;
    return { x: ax + (bx - ax) * e, y: gy - Math.sin(Math.PI * k) * b.h * 0.42, gy, k, sq: v.at };
  };
  /* what changed since the last frame becomes something you can see: money in or out
     rises off the token, a square bought gets stamped, a square sold says so */
  const watch = (ts) => {
    g.players.forEach((p, i) => {
      const v = tokOf(i, ts);
      if (v.at !== p.pos) { v.from = v.at; v.at = p.pos; v.t0 = ts; }
      const at = tokXY(i, ts);
      if (p.cash !== v.cash) {
        const d = p.cash - v.cash; v.cash = p.cash;
        FX.pop(Math.max(30, Math.min(look.W - 30, at.x)), Math.max(40, at.y - 16), (d > 0 ? '+' : '−') + Math.abs(d), { color: d > 0 ? '#11663A' : '#A3291F', size: p.human ? 16 : 13, key: 'c' + i, life: 1000 });
        if (d > 0) FX.coins(at.x, at.y - 8, Math.min(8, 3 + Math.round(d / 15)));
      }
      p.own.filter((x) => !v.own.includes(x)).forEach((sq) => {
        look.stamps.push({ sq, t0: ts, p });
        const c = look.cells[sq]; if (c) FX.burst(c.x, c.y, { n: 18, colors: [colOf(p), '#F0B429', '#FFF3C4'] });
      });
      v.own.filter((x) => !p.own.includes(x)).forEach((sq) => { const c = look.cells[sq]; if (c) FX.pop(c.x, c.y, 'sold', { color: '#A3291F', size: 12 }); });
      v.own = p.own.slice();
    });
  };
  const drawStamp = (ctx, s, ts) => {
    const c = look.cells[s.sq]; if (!c) return;
    const t = Math.max(0, ts - s.t0), k = still() ? 1 : Math.min(1, t / 220);
    const sc = still() ? 1 : 1.9 - 0.9 * ease.out(k);
    ctx.save();
    ctx.globalAlpha = t > 900 ? Math.max(0, 1 - (t - 900) / 300) : Math.min(1, 0.2 + k);
    ctx.translate(c.x, c.y); ctx.rotate(-0.21); ctx.scale(sc, sc);
    const w = c.w * 0.94, h = Math.max(15, c.h * 0.3), col = s.p.human ? '#178A4C' : colOf(s.p);
    ctx.fillStyle = 'rgba(255,252,245,.94)'; rr(ctx, -w / 2, -h / 2, w, h, 4); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2.4; rr(ctx, -w / 2, -h / 2, w, h, 4); ctx.stroke();
    ctx.lineWidth = 0.9; rr(ctx, -w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 2.5); ctx.stroke();
    const word = s.p.human ? 'YOURS' : 'BOUGHT';
    let fs = h * 0.56; ctx.font = `800 ${fs}px "Hanken Grotesk", system-ui, sans-serif`;
    const mw = ctx.measureText(word).width; if (mw > w - 10) { fs *= (w - 10) / mw; ctx.font = `800 ${fs}px "Hanken Grotesk", system-ui, sans-serif`; }
    ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(word, 0, 1);
    ctx.restore();
  };
  const drawTok = (ctx, i, ts) => {
    const p = g.players[i], at = tokXY(i, ts);
    look.at[i] = at;
    /* §1.8 · a token is a FACE — the child's own avatar, Mags, Bo — on a coloured stand,
       never a colour alone (it was an 8 px dot) */
    const cw = (look.cells[0] || { w: 60 }).w, s = Math.max(9, Math.min(16, cw * 0.19)) * (p.human ? 1.12 : 1);
    shadow(ctx, at.x, at.gy + s * 0.75, s * 1.9 * Math.max(0.5, 1 - (at.gy - at.y) / (cw * 1.2)), 0.28);
    if (p === cur() && !g.done) {
      ctx.save(); ctx.globalAlpha = 0.85; ctx.strokeStyle = '#F0B429'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(at.x, at.gy + s * 0.75, s * 1.25, s * 0.45, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = colOf(p); ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.6;
    rr(ctx, at.x - s * 0.8, at.y + s * 0.1, s * 1.6, s * 0.65, s * 0.3); ctx.fill(); ctx.stroke();
    const hx = at.x, hy = at.y - s * 0.55, hr = s * 0.82, im = look.faces[i];
    ctx.beginPath(); ctx.arc(hx, hy, hr + 2, 0, Math.PI * 2); ctx.fillStyle = colOf(p); ctx.fill();
    if (im && im.complete && im.naturalWidth) {
      ctx.save(); ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#FFF8EC'; ctx.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);
      ctx.drawImage(im, hx - hr, hy - hr, hr * 2, hr * 2); ctx.restore();
    } else { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(hx - s * 0.2, hy - s * 0.2, s * 0.17, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.arc(hx, hy, hr + 1, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.8; ctx.stroke();
  };
  /* who each token is, as a picture source: the child's avatar, and the cast for the bots */
  const faceSrc = (p) => (p.human ? avatarSrc((K() || {}).avatar) : portraitSrc(p.who));
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  const drawDie = (ctx, ts) => {
    if (!g.walk || !look.die) return;
    const t = Math.max(0, ts - g.walk.t0), s = 38, rolling = t < ROLLMS && !still();
    const face = rolling ? 1 + ((Math.floor(t / 70) * 5 + 2) % 6) : g.die;
    const rot = rolling ? (1 - t / ROLLMS) * Math.PI * 2.2 : 0;
    const sc = rolling ? 1 + Math.sin((t / ROLLMS) * Math.PI) * 0.22 : still() ? 1 : 0.88 + 0.12 * ease.back(Math.min(1, (t - ROLLMS) / 220));
    const hop = rolling ? Math.sin((t / ROLLMS) * Math.PI) * 10 : 0;
    shadow(ctx, look.die.x, look.die.y + s * 0.6, s * (1.1 - hop / 40), 0.22);
    ctx.save(); ctx.translate(look.die.x, look.die.y - hop); ctx.rotate(rot); ctx.scale(sc, sc);
    ctx.fillStyle = '#FFFDF6'; rr(ctx, -s / 2, -s / 2, s, s, s * 0.22); ctx.fill();
    ctx.strokeStyle = 'rgba(42,26,8,.55)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#1C2A2E';
    PIPS[face].forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px * s * 0.27, py * s * 0.27, s * 0.085, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  };
  const draw = (ts) => {
    const { ctx, W, H } = look; if (!ctx || !look.cv || !look.cv.isConnected) return;
    ctx.clearRect(0, 0, W, H);
    const done = FX.begin(ctx);
    look.stamps = look.stamps.filter((s) => ts - s.t0 < 1200);
    look.stamps.forEach((s) => drawStamp(ctx, s, ts));
    /* the one whose turn it is walks on top */
    g.players.map((_, i) => i).sort((a, b) => (a === g.turn) - (b === g.turn)).forEach((i) => drawTok(ctx, i, ts));
    drawDie(ctx, ts);
    FX.draw(ctx, W, H);
    done();
  };
  const tick = (ts) => {
    raf = 0;
    const dt = Math.min(100, ts - (look.prev || ts)); look.prev = ts;
    if (walkTo(ts)) R.render();
    if (g.done) return;
    watch(ts);
    FX.step(dt);
    draw(ts);
    if (!g.done && !raf) raf = requestAnimationFrame(tick);
  };

  const buy = (yes) => {
    if (g.phase !== 'decide') return;
    const p = cur(), sq = SQUARES[g.sq];
    if (yes) {
      if (p.cash < sq.cost) { note('Not enough — and nothing lends to you here.'); }
      else { p.cash -= sq.cost; p.own.push(g.sq); note(`You bought ${sq.n}. It pays ${sq.inc} every lap, forever.`); sfx.coin(); }
    } else note(`You passed on ${sq.n}.`);
    g.phase = 'roll';
    endTurn();
  };
  const pickCard = (i) => {
    if (g.phase !== 'card') return;
    const p = cur(), card = g.card;
    const res = card.choices[+i].run(g, p);
    p.cash += res.cash || 0;
    note(`${card.t} — ${res.note}`);
    settle(p);
    g.card = null; g.phase = 'roll';
    if ((res.cash || 0) < 0) sfx.bad(); else sfx.good();
    endTurn();
  };

  /* 6×6 ring: bottom row left→right, up the right, top row right→left, down
     the left. Twenty cells exactly, and the middle is the play area. */
  const cell = (i) => {
    if (i <= 5) return { r: 6, c: 1 + i };
    if (i <= 10) return { r: 6 - (i - 5), c: 6 };
    if (i <= 15) return { r: 1, c: 6 - (i - 10) };
    return { r: 1 + (i - 15), c: 1 };
  };

  return {
    id: 'mn', g, EXP0,
    mount() {
      if (typeof document === 'undefined' || g.done) return;
      const box = document.getElementById('msBoard'), cv = document.getElementById('msCanvas');
      if (!box || !cv) return;
      const ctx = cv.getContext && cv.getContext('2d'); if (!ctx) return;
      const br = box.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      look.W = br.width; look.H = br.height;
      cv.width = Math.round(br.width * dpr); cv.height = Math.round(br.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      look.cv = cv; look.ctx = ctx;
      /* every square's centre, measured from the board as drawn — never typed in */
      look.cells = [];
      box.querySelectorAll('[data-sq]').forEach((el) => {
        const q = el.getBoundingClientRect();
        look.cells[+el.dataset.sq] = { x: q.left - br.left + q.width / 2, y: q.top - br.top + q.height / 2, w: q.width, h: q.height };
      });
      const d = box.querySelector('.msdie');
      look.die = d ? (() => { const q = d.getBoundingClientRect(); return { x: q.left - br.left + q.width / 2, y: q.top - br.top + q.height / 2 }; })() : null;
      const cs = getComputedStyle(document.documentElement), v = (n, f) => cs.getPropertyValue(n).trim() || f;
      look.col = { pip: v('--action', '#0E6B78'), mags: v('--give', '#8A5BD6'), bo: v('--treasure', '#C98A10') };
      /* the faces the tokens wear, loaded once; a token draws a plain stand until its face arrives */
      if (!look.faces.length && typeof Image !== 'undefined') look.faces = g.players.map((p) => { const im = new Image(); im.src = faceSrc(p) || ''; return im; });
      box.classList.add('live');
      const t = now(); watch(t); draw(t);
      if (!raf) { look.prev = 0; raf = requestAnimationFrame(tick); }
    },
    stop,
    /* back from a hidden tab: the board is redrawn and a bot's pending move goes ahead */
    resume() {
      if (g.done) return;
      this.mount();
      if (pend && !anim) { const f = pend; pend = null; later(f, 400); }
    },
    key(e) {
      if (g.done) { if (opts.endKey) opts.endKey(e); else if (e.key === 'Enter') { R.game = null; R.render(); } return; }
      if (g.phase === 'roll' && cur().human && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); roll(); }
      else if (g.phase === 'decide') { if (e.key === 'y' || e.key === 'Y') buy(true); if (e.key === 'n' || e.key === 'N') buy(false); }
      else if (g.phase === 'card' && g.card && g.card.choices) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= g.card.choices.length) pickCard(n - 1);
      }
    },
    act(n, arg) {
      if (n === 'mnRoll') { if (cur().human) roll(); }
      else if (n === 'mnBuy') buy(true);
      else if (n === 'mnPass') buy(false);
      else if (n === 'mnCard') pickCard(arg);
      else if (n === 'mnEnd') { R.game = null; R.render(); }
    },
    view() {
      if (g.done) {
        const me = g.players[0];
        return `<div class="stack">
          <div class="hud"><span class="box">Main Street</span>${chip()}<span class="grow"></span>
            <button class="btn ghost sm" data-act="gquit">Leave</button></div>
          <div class="stage" style="justify-content:center;text-align:center">
            <div class="endico">${g.winner === me ? ico('trophy', '🏆', 48) : ico('rosette', '🎗️', 48)}</div>
            <h2>${g.winner === me ? 'Your street pays for your life' : g.winner.name + ' got there first'}</h2>
            <p class="muted">${Math.round(g.mine * 100)}% of your expenses covered by what you own.</p>
            <div class="lead">
              ${g.players.slice().sort((a, b) => indep(b) - indep(a)).map((p, i) => `
                <div class="leadrow ${p.human ? 'me' : ''}">
                  <span>${i + 1}</span>
                  <span>${esc(p.name)}<br><span style="font-weight:600;font-size:11.5px;opacity:.75">
                    owns ${p.own.length} · earns ${p.own.reduce((t, x) => t + SQUARES[x].inc, 0)} a lap · spends ${p.expenses}</span></span>
                  <span class="p" style="font-size:17px">${Math.round(indep(p) * 100)}%</span></div>`).join('')}
            </div>
            ${say('nana', 'Nobody went bankrupt and nobody had to. You win this one when the things you own pay for the life you lead — that is the only definition of rich worth chasing.')}
            ${opts.foot ? opts.foot(g.won) : `${opts.goals ? opts.goals() : ''}<p class="small muted">Earned ${money(g.won)}.</p>`}
            <button class="btn wide" data-act="gquit">Back to Play</button>
          </div></div>`;
      }

      const p = cur();
      const board = SQUARES.map((sq, i) => {
        const { r: rw, c } = cell(i);
        const own = ownerOf(i);
        const here = g.players.filter((x) => x.pos === i);
        const active = g.sq === i && g.phase !== 'roll';
        /* the dots are the board's truth in the DOM; the canvas draws the walking tokens over them */
        return `<div class="mssq" data-sq="${i}" style="grid-row:${rw};grid-column:${c};
          background:${active ? 'var(--action-tint)' : own ? (own.human ? 'var(--grow-tint)' : 'var(--tint)') : 'var(--surface)'};
          ${own ? `box-shadow:inset 0 -3px 0 ${own.human ? 'var(--grow)' : own.who === 'mags' ? 'var(--give)' : 'var(--treasure)'}` : ''}">
          <div class="sqico">${ico(sq.em, sq.em, 20)}</div>
          <div style="font-weight:700">${esc(sq.n)}</div>
          ${sq.cost ? `<div class="mono" style="opacity:.65">${sq.cost}</div>` : ''}
          ${here.length ? `<div class="mstoks">
            ${here.map((x) => `<span class="mstok" data-who="${x.who}" title="${esc(x.name)}" style="border-color:${x.human ? 'var(--action)' : x.who === 'mags' ? 'var(--give)' : 'var(--treasure)'}"><img src="${faceSrc(x)}" alt="${esc(x.name)}" width="20" height="20"></span>`).join('')}</div>` : ''}
        </div>`;
      }).join('');

      /* a board bought in the Shop (familyviews.js EXTRAS) paints the middle as its world */
      const skin = BOARD_SKIN[((sim.kid(R.s) || {}).fam || {}).board];
      const middle = `<div class="msmid${skin ? ' skinned' : ''}" style="grid-row:2/6;grid-column:2/6;display:flex;flex-direction:column;gap:8px;
        padding:10px;background:${skin ? `linear-gradient(color-mix(in srgb,var(--surface) 78%,transparent),color-mix(in srgb,var(--surface) 78%,transparent)),url(${plateFor(skin, !!R.dark)}) center/cover` : 'color-mix(in srgb,var(--surface) 86%,transparent)'};border-radius:10px;overflow:auto">
        <div class="row" style="gap:8px;flex-wrap:wrap">
          ${g.players.map((x) => `<span class="pill ${x === p ? 'gold' : ''}" style="font-size:10px">
            ${esc(x.name)} ${x.cash}</span>`).join('')}
          ${g.die && g.phase !== 'moving' ? `<span class="pill" style="font-size:10px">${esc(g.rolled)} rolled ${g.die}</span>` : ''}
        </div>
        <div>
          <div class="row"><span class="eyebrow grow">Your street pays</span>
            <span class="small" style="font-weight:800">${income(g.players[0])} / ${g.players[0].expenses}</span></div>
          <div class="bar" style="margin-top:4px"><i style="width:${Math.min(100, indep(g.players[0]) * 100)}%;background:var(--grow)"></i></div>
        </div>
        ${g.phase === 'decide' ? (() => {
          const sq = SQUARES[g.sq];
          return `<div style="background:var(--surface);border-radius:9px;padding:10px;text-align:center">
            <div class="sqico">${ico(sq.em, sq.em, 26)}</div>
            <b style="font-size:13px">${esc(sq.n)}</b>
            <p class="small muted" style="margin:3px 0 7px">${sq.cost} now · ${sq.inc} every lap, forever</p>
            <div class="row" style="gap:6px">
              <button class="btn sm grow" data-act="mnBuy" ${p.cash < sq.cost ? 'disabled' : ''}>Buy · Y</button>
              <button class="btn ghost sm grow" data-act="mnPass">Pass · N</button></div></div>`;
        })() : ''}
        ${g.phase === 'card' && g.card ? `<div style="background:var(--surface);border-radius:9px;padding:10px">
          <div class="sqico" style="text-align:center">${ico(g.card.em, g.card.em, 26)}</div>
          <b style="font-size:12.5px">${esc(g.card.t)}</b>
          <p class="small muted" style="margin:3px 0 7px">${esc(g.card.body)}</p>
          <div class="stack" style="gap:5px">
            ${g.card.choices.map((ch, i) => `<button class="opt" style="padding:7px 9px;font-size:12px" data-act="mnCard" data-arg="${i}">${i + 1} · ${esc(ch.label)}</button>`).join('')}
          </div><p class="small muted" style="margin-top:5px">Press ${g.card.choices.map((_, i) => i + 1).join(' or ')}, or tap.</p></div>` : ''}
        ${g.phase === 'roll' ? `<button class="btn wide" data-act="mnRoll" ${p.human ? '' : 'disabled'}>
          ${p.human ? 'Roll · ⏎' : p.name + ' is thinking…'}</button>` : ''}
        ${g.phase === 'moving' ? `<div class="msdie" role="status"><span>${ico('dice', '🎲', 26)} ${esc(g.rolled)} rolled ${g.die}</span></div>` : ''}
        <div class="stack" style="gap:3px;margin-top:auto">
          ${g.log.slice(0, 3).map((l) => `<p class="small muted" style="font-size:11px;line-height:1.35">${esc(l)}</p>`).join('')}
        </div>
      </div>`;

      return `<div class="stack">
        <div class="hud">${chip()}<span class="box">Lap ${g.players[0].laps + 1} / ${MAX_LAPS}</span>
          <span class="box">You ${p === g.players[0] ? '· your turn' : ''} ${g.players[0].cash}</span>
          <span class="grow"></span><button class="btn ghost sm" data-act="gquit">Leave</button></div>
        <div class="stage" style="padding:10px">
          <div id="msBoard" class="msboard" style="background:${plateCss((K() || {}).world || 0, R.dark ? 0.34 : 0.26)}">
            ${board}${middle}<canvas id="msCanvas" class="mscv" aria-hidden="true"></canvas>
          </div>
          <p class="hint">Enter to roll, Y/N to buy. You win when what you own pays for what you spend — nobody has to go bankrupt.</p>
        </div></div>`;
    },
  };
}
