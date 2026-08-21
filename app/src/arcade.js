/* arcade.js — three games, all of them scoring the decision rather than the
   outcome (CONCEPT §6.3). Every one takes BOTH keyboard and touch, which is
   inherited from Bizzing Bee and non-negotiable. */

import { esc, sfx, toast, rng, clamp, sparkline } from './ui.js';
import { money, price } from './fmt.js';
import { say } from './art.js';
import { ASSETS } from './content.js';
import * as sim from './sim.js';
import { R } from './runtime.js';

const S = () => R.s;

export const GAMES = [
  { id: 'nw', em: '⚖️', name: 'Needs vs Wants', blurb: 'Sort it before the bell. Some of them are both, and those are the good ones.', keys: '← →' },
  { id: 'bb', em: '💸', name: 'Budget Blitz', blurb: 'A month of money, and the bills arrive one at a time.', keys: '1 2' },
  { id: 'mc', em: '🏆', name: 'The Market Cup', blurb: 'Six weeks against Chaser, Panicker and Boring Bella. Bella is annoying.', keys: '↑ ↓ ← → ⏎' },
];

export function viewArcade() {
  if (R.game) return R.game.view();
  const s = S();
  return `<div class="stack">
    ${say('pip', 'Wages from in here land in the same wallet as everything else. There is no second, magic money — that is on purpose.')}
    ${GAMES.map((g) => `<button class="card" data-act="game" data-arg="${g.id}" style="text-align:left;width:100%">
      <div class="row"><span style="font-size:30px">${g.em}</span>
        <div class="grow"><b style="font-size:16px">${esc(g.name)}</b>
          <p class="small muted">${esc(g.blurb)}</p></div>
        <span class="pill">${g.keys}</span></div>
    </button>`).join('')}
    ${s.market.best ? `<div class="card"><div class="eyebrow">Best Market Cup finish</div>
      <p style="font-weight:800">${esc(s.market.best)}</p></div>` : ''}
  </div>`;
}

export function startGame(id) {
  if (id === 'nw') R.game = needsWants();
  else if (id === 'bb') R.game = budgetBlitz();
  else if (id === 'mc') R.game = marketCup();
  sfx.click();
}
export function quitGame() { R.game = null; }

function hud(bits) {
  return `<div class="hud">${bits.map((b) => `<span class="box">${b}</span>`).join('')}
    <span class="grow"></span><button class="btn ghost sm" data-act="gquit">Leave</button></div>`;
}
function payout(n, label) {
  const s = S();
  const amt = price(n);
  if (amt > 0) { sim.earn(s, amt, label, 'wage'); sfx.coin(); }
  return amt;
}

/* ══ 1 · NEEDS vs WANTS ═══════════════════════════════════════════════ */
const NW = [
  { em: '🍚', t: 'Rice for the week', a: 'need' },
  { em: '🎮', t: 'A new game', a: 'want' },
  { em: '🧥', t: 'A winter coat', a: 'need' },
  { em: '☂️', t: 'An umbrella, and it is raining', a: 'both', note: 'Today it is a need. In May it is a want. That is the whole card.' },
  { em: '🚌', t: 'The bus fare to school', a: 'need' },
  { em: '🍫', t: 'Chocolate at the till', a: 'want' },
  { em: '📱', t: 'A phone, and your family shares one', a: 'both', note: 'Depends entirely on the household. There is no universal answer, and pretending there is would be the mistake.' },
  { em: '👟', t: 'Shoes that still fit', a: 'want', note: 'They still fit. That makes them a want today.' },
  { em: '💊', t: 'Medicine you were prescribed', a: 'need' },
  { em: '🎧', t: 'Headphones', a: 'want' },
  { em: '💧', t: 'Clean water', a: 'need' },
  { em: '🎂', t: 'A cake for your sister', a: 'both', note: 'Nobody starves without it. It might still be the best thing you buy all month.' },
];

function needsWants() {
  const order = shuffle(NW.slice(), 7717);
  const st = { i: 0, right: 0, note: null, done: false };
  const pick = (kind) => {
    if (st.done) return;
    const c = order[st.i];
    const ok = c.a === kind || c.a === 'both';
    if (ok) { st.right++; sfx.good(); } else sfx.bad();
    st.note = { ok, text: c.note || (ok ? 'Yes.' : c.a === 'need' ? 'That one you would be in trouble without.' : 'Lovely, but you would survive the week.') };
    st.i++;
    if (st.i >= order.length) {
      st.done = true;
      st.won = payout(Math.round(st.right * 0.7), 'Needs vs Wants');
    }
    R.render();
  };
  return {
    id: 'nw',
    key(e) {
      if (e.key === 'ArrowLeft') pick('need');
      else if (e.key === 'ArrowRight') pick('want');
      else if (e.key === 'Enter' && st.done) { quitGame(); R.render(); }
    },
    act(name) { if (name === 'nwNeed') pick('need'); else if (name === 'nwWant') pick('want'); },
    view() {
      if (st.done) {
        return `<div class="stack">${hud(['Done'])}
          <div class="stage" style="justify-content:center;text-align:center">
            <div style="font-size:44px">${st.right >= 10 ? '🏅' : '👍'}</div>
            <h2>${st.right} of ${order.length}</h2>
            <p class="muted">Earned ${money(st.won)}, straight into your wallet.</p>
            ${say('pip', 'The ones that were <b>both</b> are the point. A list of needs that never changes is a list somebody else wrote for you.')}
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`;
      }
      const c = order[st.i];
      return `<div class="stack">
        ${hud([`${st.i + 1} / ${order.length}`, `✓ ${st.right}`])}
        <div class="stage">
          <div class="gcard"><span class="em">${c.em}</span><span class="nm">${esc(c.t)}</span></div>
          ${st.note ? `<div style="background:${st.note.ok ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">${esc(st.note.text)}</div>` : ''}
          <div class="grow"></div>
          <div class="choices">
            <button class="btn" style="background:var(--save)" data-act="nwNeed">← Need</button>
            <button class="btn" style="background:var(--give)" data-act="nwWant">Want →</button>
          </div>
          <p class="hint">Arrow keys, or tap. Some are both — either answer counts.</p>
        </div></div>`;
    },
  };
}

/* ══ 2 · BUDGET BLITZ ═════════════════════════════════════════════════ */
function budgetBlitz() {
  const s = S();
  const pot = s.money.wage * 4;
  const bills = [
    { n: 'Rent on the stall', u: 14, must: true },
    { n: 'Food for the month', u: 22, must: true },
    { n: 'Bus pass', u: 8, must: true },
    { n: 'A film with friends', u: 6, must: false },
    { n: 'Phone plan', u: 6, must: true },
    { n: "Mags's brass button", u: 12, must: false },
    { n: 'Sister’s birthday cake', u: 5, must: false },
    { n: 'New shoes — the old ones leak', u: 10, must: true },
  ];
  const order = shuffle(bills.slice(), 4423);
  const st = { i: 0, left: pot, missed: [], paid: [], done: false };
  const decide = (payIt) => {
    if (st.done) return;
    const b = order[st.i];
    const amt = price(b.u);
    if (payIt) {
      if (amt > st.left) { sfx.bad(); toast('Not enough left — and that is the lesson'); st.missed.push(b); }
      else { st.left -= amt; st.paid.push(b); sfx.click(); }
    } else {
      if (b.must) sfx.bad(); else sfx.good();
      st.missed.push(b);
    }
    st.i++;
    if (st.i >= order.length) {
      st.done = true;
      const mustMissed = st.missed.filter((x) => x.must).length;
      const score = Math.max(0, 10 - mustMissed * 4) + (st.left > 0 ? 4 : 0);
      st.won = payout(score, 'Budget Blitz');
      st.mustMissed = mustMissed;
    }
    R.render();
  };
  return {
    id: 'bb',
    key(e) {
      if (e.key === '1') decide(true);
      else if (e.key === '2') decide(false);
      else if (e.key === 'Enter' && st.done) { quitGame(); R.render(); }
    },
    act(n) { if (n === 'bbPay') decide(true); else if (n === 'bbSkip') decide(false); },
    view() {
      if (st.done) {
        return `<div class="stack">${hud(['Month over'])}
          <div class="stage" style="text-align:center;justify-content:center">
            <div style="font-size:42px">${st.mustMissed === 0 ? '🎯' : '😬'}</div>
            <h2>${money(st.left)} left over</h2>
            <p class="muted">${st.mustMissed === 0 ? 'Everything you actually needed got paid.' : st.mustMissed + ' thing' + (st.mustMissed > 1 ? 's' : '') + ' you needed went unpaid. Those do not disappear — they move to next month.'}</p>
            <p class="small muted">Earned ${money(st.won)}.</p>
            ${say('nana', 'Leftover money is not a prize. It is the part of the month you get to choose about.')}
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`;
      }
      const b = order[st.i];
      const amt = price(b.u);
      return `<div class="stack">
        ${hud([`Left ${money(st.left)}`, `${st.i + 1} / ${order.length}`])}
        <div class="stage">
          <div class="gcard"><span class="em">🧾</span><span class="nm">${esc(b.n)}</span>
            <div class="big" style="margin-top:6px">${money(amt)}</div></div>
          <div class="bar"><i style="width:${clamp(st.left / pot * 100, 0, 100)}%;background:${st.left > pot * 0.25 ? 'var(--grow)' : 'var(--spend)'}"></i></div>
          <div class="grow"></div>
          <div class="choices">
            <button class="btn" data-act="bbPay">1 · Pay it</button>
            <button class="btn ghost" data-act="bbSkip">2 · Skip it</button>
          </div>
          <p class="hint">Keys 1 and 2, or tap. Nothing tells you which ones you truly need.</p>
        </div></div>`;
    },
  };
}

/* ══ 3 · THE MARKET CUP ═══════════════════════════════════════════════
   Scored on return AND diversification AND steadiness, because a game
   ranked on returns alone has taught a child to gamble. Bella buys the
   whole basket and goes home; Bella usually wins. */
function marketCup() {
  const ROUNDS = 6, START = 1000;
  /* A season has to be winnable by the boring player, or the game teaches
     that cash beats owning things — which is false and is the opposite of
     the lesson. Drift dominates; one week is deliberately red so that
     Panicker's flight (and holding your nerve) both mean something. */
  const r = rng(120);
  const ret = [];
  const RED = 3;
  for (let k = 0; k < ROUNDS; k++) {
    const row = {};
    ASSETS.forEach((a) => {
      const shock = (r() + r() + r() - 1.5) * 2 * a.vol * 1.0;
      row[a.id] = a.drift * 3.6 + shock + (k === RED ? -a.vol * 1.5 : 0);
    });
    ret.push(row);
  }
  const st = {
    round: 0, sel: 0, done: false, churn: 0, divSum: 0,
    alloc: { basket: 0, grain: 0, chai: 0, rocket: 0 },
    me: START,
    bots: { Chaser: START, Panicker: START, 'Boring Bella': START },
    botHold: { Chaser: 'basket', Panicker: 'chai', 'Boring Bella': 'basket' },
    botStat: {
      Chaser: { div: 0, churn: 100 }, Panicker: { div: 0, churn: 100 }, 'Boring Bella': { div: 0, churn: 100 },
    },
    log: [START],
  };
  const cash = () => 100 - (st.alloc.basket + st.alloc.grain + st.alloc.chai + st.alloc.rocket);
  const adjust = (id, d) => {
    if (st.done) return;
    const c = cash();
    const nd = clamp(st.alloc[id] + d, 0, st.alloc[id] + c);
    if (nd === st.alloc[id]) { sfx.bad(); return; }
    st.churn += Math.abs(nd - st.alloc[id]);
    st.alloc[id] = nd; sfx.click(); R.render();
  };
  /* the basket IS diversification — it is a slice of every shop in town */
  const effective = () => {
    let n = 0;
    if (st.alloc.basket >= 15) n += 4;
    ['grain', 'chai', 'rocket'].forEach((k) => { if (st.alloc[k] >= 15) n += 1; });
    return Math.min(4, n);
  };
  const next = () => {
    if (st.done) return;
    st.divSum += effective();
    const row = ret[st.round];
    let g = 0;
    ASSETS.forEach((a) => { g += (st.alloc[a.id] / 100) * row[a.id]; });
    st.me = Math.round(st.me * (1 + g));
    st.log.push(st.me);

    // Chaser buys whatever rose most last round; Panicker flees to cash after red;
    // Bella bought the basket in week one and has not touched it since.
    const holdDiv = (h) => (h === 'cash' ? 0 : h === 'basket' ? 4 : 1);
    Object.keys(st.bots).forEach((k) => { st.botStat[k].div += holdDiv(st.botHold[k]); });

    const best = ASSETS.slice().sort((a, b) => row[b.id] - row[a.id])[0].id;
    st.bots.Chaser = Math.round(st.bots.Chaser * (1 + row[st.botHold.Chaser]));
    if (best !== st.botHold.Chaser) st.botStat.Chaser.churn += 100;
    st.botHold.Chaser = best;

    const pan = st.botHold.Panicker;
    st.bots.Panicker = Math.round(st.bots.Panicker * (1 + (pan === 'cash' ? 0 : row[pan])));
    const nextPan = (pan !== 'cash' && row[pan] < 0) ? 'cash' : 'chai';
    if (nextPan !== pan) st.botStat.Panicker.churn += 100;
    st.botHold.Panicker = nextPan;

    st.bots['Boring Bella'] = Math.round(st.bots['Boring Bella'] * (1 + row.basket));

    st.round++;
    if (st.round >= ROUNDS) finish(); else sfx.click();
    R.render();
  };
  /* Ranked on the cup score, not on returns. A leaderboard sorted by return
     alone would tell a child that the luckiest single bet is the best
     decision, which is the one thing this app must never say. */
  const scoreOf = (final, divAvg, churn) => {
    const ret = Math.round((final / START - 1) * 100);
    const div = Math.round(divAvg * 7);
    const steady = Math.max(0, 30 - Math.round(churn / 8));
    return { ret, div, steady, total: ret + div + steady };
  };
  const finish = () => {
    st.done = true;
    const s = S();
    st.score = scoreOf(st.me, st.divSum / ROUNDS, st.churn);
    const table = [{ who: 'You', v: st.me, sc: st.score }]
      .concat(Object.keys(st.bots).map((k) => ({
        who: k, v: st.bots[k], sc: scoreOf(st.bots[k], st.botStat[k].div / ROUNDS, st.botStat[k].churn),
      })))
      .sort((a, b) => b.sc.total - a.sc.total);
    st.table = table;
    st.place = table.findIndex((x) => x.who === 'You') + 1;
    st.byReturn = table.slice().sort((a, b) => b.v - a.v)[0].who;
    st.won = payout(Math.max(4, Math.round(st.score.total / 6)), 'The Market Cup');
    if (st.score.div >= 24) sim.badge(s, 'diversified');
    const line = `${st.place}${['st', 'nd', 'rd', 'th'][Math.min(st.place - 1, 3)]} of 4 · cup score ${st.score.total}`;
    if (!s.market.best) s.market.best = line;
    sfx.level();
  };
  return {
    id: 'mc',
    key(e) {
      if (st.done) { if (e.key === 'Enter') { quitGame(); R.render(); } return; }
      const ids = ASSETS.map((a) => a.id);
      if (e.key === 'ArrowDown') { st.sel = (st.sel + 1) % ids.length; R.render(); }
      else if (e.key === 'ArrowUp') { st.sel = (st.sel + ids.length - 1) % ids.length; R.render(); }
      else if (e.key === 'ArrowRight') adjust(ids[st.sel], 10);
      else if (e.key === 'ArrowLeft') adjust(ids[st.sel], -10);
      else if (e.key === 'Enter') next();
    },
    act(n, arg) {
      if (n === 'mcAdj') { const [id, d] = arg.split(':'); adjust(id, +d); }
      else if (n === 'mcNext') next();
      else if (n === 'mcSel') { st.sel = ASSETS.findIndex((a) => a.id === arg); R.render(); }
    },
    view() {
      if (st.done) {
        const sc = st.score;
        return `<div class="stack">${hud(['Cup over'])}
          <div class="stage">
            <div style="text-align:center"><div style="font-size:42px">${st.place === 1 ? '🏆' : '🎗️'}</div>
            <h2>${st.place === 1 ? 'You won the Cup' : st.place + ' of 4'}</h2>
            <p class="muted">Cup score ${st.score.total} · ended on ${st.me} from ${START}.</p></div>
            <div class="lead">
              ${st.table.map((row, i) => `<div class="leadrow ${row.who === 'You' ? 'me' : ''}">
                <span>${i + 1}</span>
                <span>${esc(row.who)}<br><span style="font-weight:600;font-size:11.5px;opacity:.75">
                  ${row.sc.ret >= 0 ? '+' : ''}${row.sc.ret} return · ${row.sc.div} spread · ${row.sc.steady} nerve</span></span>
                <span class="p" style="font-size:17px">${row.sc.total}</span></div>`).join('')}
            </div>
            <p class="small muted" style="margin-top:-2px">Ranked on cup score. On money alone
              <b>${esc(st.byReturn)}</b> finished top — which is exactly why money alone is not the scoreboard.</p>
            <div class="card" style="box-shadow:none">
              <div class="eyebrow">Your cup score — and this is the part that matters</div>
              <div class="grid3" style="margin-top:8px">
                <div><div class="small muted">Return</div><div style="font-weight:800">${sc.ret >= 0 ? "+" : ""}${sc.ret}</div></div>
                <div><div class="small muted">Spread out</div><div style="font-weight:800">${sc.div}</div></div>
                <div><div class="small muted">Kept your nerve</div><div style="font-weight:800">${sc.steady}</div></div>
              </div>
              <div class="sep" style="margin:10px 0"></div>
              <div class="row"><span class="grow" style="font-weight:800">Total</span><span class="big" style="font-size:22px">${sc.total}</span></div>
            </div>
            ${say(st.table[0].who === 'Boring Bella' ? 'bea' : 'bo',
              st.table[0].who === 'Boring Bella'
                ? 'Bella bought the whole basket in week one and then went home. She does that every season, and she is very hard to beat.'
                : 'You beat Bella this time. Run another six weeks and see whether that keeps happening — that question <b>is</b> the game.')}
            <p class="small muted">Earned ${money(st.won)}. Fictional companies, real market behaviour, nothing here is advice.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`;
      }
      const c = cash();
      return `<div class="stack">
        ${hud([`Week ${st.round + 1} / ${ROUNDS}`, `${st.me}`, `cash ${c}%`])}
        <div class="stage">
          <p class="small muted">Split 100% across what you fancy. What you leave in cash is safe and grows by nothing.</p>
          <div class="alloc">
            ${ASSETS.map((a, i) => `<div class="alrow ${i === st.sel ? 'sel' : ''}" data-act="mcSel" data-arg="${a.id}" role="button" tabindex="0">
              <div><b style="font-size:14px">${a.em} ${esc(a.name)}</b>
                <div class="small muted">${a.kind === 'fund' ? 'a slice of every shop' : a.kind === 'steady' ? 'slow and dull' : a.kind === 'growth' ? 'growing, bumpy' : 'anybody’s guess'}</div></div>
              <div class="stepper">
                <button data-act="mcAdj" data-arg="${a.id}:-10" aria-label="less ${esc(a.name)}">−</button>
                <span class="n">${st.alloc[a.id]}%</span>
                <button data-act="mcAdj" data-arg="${a.id}:10" aria-label="more ${esc(a.name)}">+</button>
              </div></div>`).join('')}
          </div>
          ${sparkline(st.log, 300, 40, 'var(--action)')}
          <button class="btn wide" data-act="mcNext">Play the week →</button>
          <p class="hint">Arrows to move and change, Enter to play the week. Or just tap.</p>
        </div></div>`;
    },
  };
}

function shuffle(arr, seed) {
  const r = rng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
