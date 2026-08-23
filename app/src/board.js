/* board.js — MAIN STREET, the board game.
   Monopoly's shape with its point removed: you do not win by bankrupting
   anybody. You win when the things you own pay for the life you lead —
   the same finish line as the Independence meter, on a board, in 20 minutes. */

import { esc, sfx, rng, clamp } from './ui.js';
import { money, price } from './fmt.js';
import { say, CAST } from './art.js';
import * as sim from './sim.js';
import { R } from './runtime.js';

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
const CARDS = [
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
const BOTS = [
  { name: 'Mags', who: 'mags', buy: (p, sq) => p.cash >= sq.cost, insure: false,
    line: 'If I can afford it I am having it.' },
  { name: 'Bo', who: 'bo', buy: (p, sq) => sq.cost >= BIG && p.cash - sq.cost >= 60, insure: true,
    line: 'I am holding out for a big one.' },
];

const START_CASH = 220, WAGE = 60, BASE_EXP = 24, MAX_LAPS = 8;

export function mainStreet() {
  const r = rng(60607);
  const mk = (name, who, human) => ({ name, who, human, pos: 0, cash: START_CASH,
    own: [], expenses: BASE_EXP, insured: false, laps: 0, owed: 0 });
  const g = {
    players: [mk('You', 'pip', true), mk('Mags', 'mags', false), mk('Bo', 'bo', false)],
    turn: 0, phase: 'roll', die: 0, log: [], card: null, sq: null, done: false, winner: null, moves: 0,
  };
  let anim = 0;

  const cur = () => g.players[g.turn];
  const income = (p) => p.own.reduce((t, i) => t + SQUARES[i].inc, 0);
  const indep = (p) => (p.expenses > 0 ? income(p) / p.expenses : 0);
  const ownerOf = (i) => g.players.find((p) => p.own.includes(i));
  const note = (s) => { g.log.unshift(s); if (g.log.length > 5) g.log.length = 5; };

  const stop = () => { if (anim) { clearTimeout(anim); anim = 0; } };

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
    const wage = Math.max(4, Math.round(income(me) / 2) + (g.winner === me ? 14 : 0));
    g.won = price(wage);
    sim.earn(c, g.won, 'Main Street', 'wage');
    sim.stamp(c);
    if (g.winner === me) sim.badge(c, 'main-street');
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
      p.cash += got;
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
    if (cur().skip) { cur().skip = 0; note(`${cur().name} sits this one out.`); R.render(); anim = setTimeout(endTurn, 700); return; }
    R.render();
    if (!cur().human) anim = setTimeout(roll, 520);
  };

  const roll = () => {
    if (g.done) return;
    const p = cur();
    g.die = 1 + Math.floor(r() * 6);
    g.phase = 'moving';
    g.moves = g.die;
    sfx.click();
    R.render();
    const stepOne = () => {
      p.pos = (p.pos + 1) % SQUARES.length;
      if (p.pos === 0) payDay(p);
      g.moves--;
      R.render();
      if (g.moves > 0) anim = setTimeout(stepOne, 125);
      else anim = setTimeout(() => land(p), 190);
    };
    anim = setTimeout(stepOne, 190);
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
    id: 'mn',
    mount() {},
    stop,
    key(e) {
      if (g.done) { if (e.key === 'Enter') { R.game = null; R.render(); } return; }
      if (g.phase === 'roll' && cur().human && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); roll(); }
      else if (g.phase === 'decide') { if (e.key === 'y' || e.key === 'Y') buy(true); if (e.key === 'n' || e.key === 'N') buy(false); }
      else if (g.phase === 'card' && g.card && g.card.choices) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= g.card.choices.length) pickCard(n - 1);
      }
    },
    act(n, arg) {
      if (n === 'mnRoll') roll();
      else if (n === 'mnBuy') buy(true);
      else if (n === 'mnPass') buy(false);
      else if (n === 'mnCard') pickCard(arg);
      else if (n === 'mnEnd') { R.game = null; R.render(); }
    },
    view() {
      if (g.done) {
        const me = g.players[0];
        return `<div class="stack">
          <div class="hud"><span class="box">Main Street</span><span class="grow"></span>
            <button class="btn ghost sm" data-act="gquit">Leave</button></div>
          <div class="stage" style="justify-content:center;text-align:center">
            <div style="font-size:44px">${g.winner === me ? '🏆' : '🎗️'}</div>
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
            <p class="small muted">Earned ${money(g.won)}.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`;
      }

      const p = cur();
      const board = SQUARES.map((sq, i) => {
        const { r: rw, c } = cell(i);
        const own = ownerOf(i);
        const here = g.players.filter((x) => x.pos === i);
        const active = g.sq === i && g.phase !== 'roll';
        return `<div style="grid-row:${rw};grid-column:${c};position:relative;border:1px solid var(--line);
          border-radius:7px;padding:4px 3px;font-size:9.5px;line-height:1.15;text-align:center;overflow:hidden;
          background:${active ? 'var(--action-tint)' : own ? (own.human ? 'var(--grow-tint)' : 'var(--tint)') : 'var(--surface)'};
          ${own ? `box-shadow:inset 0 -3px 0 ${own.human ? 'var(--grow)' : own.who === 'mags' ? 'var(--give)' : 'var(--treasure)'}` : ''}">
          <div style="font-size:14px">${sq.em}</div>
          <div style="font-weight:700">${esc(sq.n)}</div>
          ${sq.cost ? `<div class="mono" style="opacity:.65">${sq.cost}</div>` : ''}
          ${here.length ? `<div style="position:absolute;top:2px;right:2px;display:flex;gap:1px">
            ${here.map((x) => `<span style="width:8px;height:8px;border-radius:50%;display:block;background:${x.human ? 'var(--action)' : x.who === 'mags' ? 'var(--give)' : 'var(--treasure)'}"></span>`).join('')}</div>` : ''}
        </div>`;
      }).join('');

      const middle = `<div style="grid-row:2/6;grid-column:2/6;display:flex;flex-direction:column;gap:8px;
        padding:10px;background:var(--tint);border-radius:10px;overflow:auto">
        <div class="row" style="gap:8px;flex-wrap:wrap">
          ${g.players.map((x) => `<span class="pill ${x === p ? 'gold' : ''}" style="font-size:10px">
            ${esc(x.name)} ${x.cash}</span>`).join('')}
        </div>
        <div>
          <div class="row"><span class="eyebrow grow">Your street pays</span>
            <span class="small" style="font-weight:800">${income(g.players[0])} / ${g.players[0].expenses}</span></div>
          <div class="bar" style="margin-top:4px"><i style="width:${Math.min(100, indep(g.players[0]) * 100)}%;background:var(--grow)"></i></div>
        </div>
        ${g.phase === 'decide' ? (() => {
          const sq = SQUARES[g.sq];
          return `<div style="background:var(--surface);border-radius:9px;padding:10px;text-align:center">
            <div style="font-size:22px">${sq.em}</div>
            <b style="font-size:13px">${esc(sq.n)}</b>
            <p class="small muted" style="margin:3px 0 7px">${sq.cost} now · ${sq.inc} every lap, forever</p>
            <div class="row" style="gap:6px">
              <button class="btn sm grow" data-act="mnBuy" ${p.cash < sq.cost ? 'disabled' : ''}>Buy · Y</button>
              <button class="btn ghost sm grow" data-act="mnPass">Pass · N</button></div></div>`;
        })() : ''}
        ${g.phase === 'card' && g.card ? `<div style="background:var(--surface);border-radius:9px;padding:10px">
          <div style="font-size:20px;text-align:center">${g.card.em}</div>
          <b style="font-size:12.5px">${esc(g.card.t)}</b>
          <p class="small muted" style="margin:3px 0 7px">${esc(g.card.body)}</p>
          <div class="stack" style="gap:5px">
            ${g.card.choices.map((ch, i) => `<button class="opt" style="padding:7px 9px;font-size:12px" data-act="mnCard" data-arg="${i}">${i + 1} · ${esc(ch.label)}</button>`).join('')}
          </div></div>` : ''}
        ${g.phase === 'roll' ? `<button class="btn wide" data-act="mnRoll" ${p.human ? '' : 'disabled'}>
          ${p.human ? 'Roll · ⏎' : p.name + ' is thinking…'}</button>` : ''}
        ${g.phase === 'moving' ? `<div style="text-align:center;font-family:var(--display);font-weight:800;font-size:28px">🎲 ${g.die}</div>` : ''}
        <div class="stack" style="gap:3px;margin-top:auto">
          ${g.log.slice(0, 3).map((l) => `<p class="small muted" style="font-size:11px;line-height:1.35">${esc(l)}</p>`).join('')}
        </div>
      </div>`;

      return `<div class="stack">
        <div class="hud"><span class="box">Lap ${g.players[0].laps + 1} / ${MAX_LAPS}</span>
          <span class="box">You ${p === g.players[0] ? '· your turn' : ''} ${g.players[0].cash}</span>
          <span class="grow"></span><button class="btn ghost sm" data-act="gquit">Leave</button></div>
        <div class="stage" style="padding:10px">
          <div style="display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(6,1fr);
            gap:4px;aspect-ratio:1;max-width:520px;width:100%;margin:0 auto">
            ${board}${middle}
          </div>
          <p class="hint">Enter to roll, Y/N to buy. You win when what you own pays for what you spend — nobody has to go bankrupt.</p>
        </div></div>`;
    },
  };
}
