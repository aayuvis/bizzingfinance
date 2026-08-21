/* arcade.js — six games, every one of them scoring the decision rather than
   the outcome (CONCEPT §6.3), and every one taking BOTH keyboard and touch,
   which is inherited from Bizzing Bee and non-negotiable.

   Wages land in the same wallet as everything else. There is no second,
   magic money, and no randomised reward for money spent — anywhere. */

import { esc, sfx, toast, rng, clamp, sparkline } from './ui.js';
import { money, price } from './fmt.js';
import { say } from './art.js';
import { ASSETS } from './content.js';
import * as sim from './sim.js';
import { R } from './runtime.js';

const K = () => sim.kid(R.s);

export const GAMES = [
  { id: 'nw', em: '⚖️', name: 'Needs vs Wants', keys: '← →', lv: 1,
    blurb: 'Sort it before the bell. Some are both, and those are the good ones.' },
  { id: 'ss', em: '🛡️', name: 'Scam Spotter', keys: '← →', lv: 1,
    blurb: 'Real message or trap? They are designed to look identical.' },
  { id: 'bb', em: '💸', name: 'Budget Blitz', keys: '1 2', lv: 6,
    blurb: 'A month of money, and the bills arrive one at a time.' },
  { id: 'tt', em: '🗓️', name: 'Times Twelve', keys: '1–4', lv: 6,
    blurb: 'Small monthly numbers, turned into the number that is actually true.' },
  { id: 'sn', em: '❄️', name: 'The Snowball', keys: '1–4', lv: 11,
    blurb: 'Guess where compounding lands. Nobody guesses high enough.' },
  { id: 'mc', em: '🏆', name: 'The Market Cup', keys: '↑↓←→ ⏎', lv: 16,
    blurb: 'Six weeks against Chaser, Panicker and Boring Bella. Bella is annoying.' },
];

export function viewArcade() {
  if (R.game) return R.game.view();
  const c = K();
  return `<div class="stack">
    ${say('pip', 'Wages from in here land in the same wallet as everything else. There is no second, magic money — that is on purpose.')}
    ${GAMES.map((g) => {
      const open = c.learn.level >= g.lv;
      return `<button class="card" data-act="${open ? 'game' : 'locked'}" data-arg="${open ? g.id : g.lv}" style="text-align:left;width:100%;${open ? '' : 'opacity:.6'}">
        <div class="row"><span style="font-size:30px">${open ? g.em : '🔒'}</span>
          <div class="grow"><b style="font-size:16px">${esc(g.name)}</b>
            <p class="small muted">${open ? esc(g.blurb) : 'Opens at level ' + g.lv}</p></div>
          <span class="pill">${open ? g.keys : 'L' + g.lv}</span></div></button>`;
    }).join('')}
    ${c.market.best ? `<div class="card"><div class="eyebrow">Best Market Cup finish</div>
      <p style="font-weight:800">${esc(c.market.best)}</p></div>` : ''}
  </div>`;
}

export function startGame(id) {
  const f = { nw: needsWants, ss: scamSpotter, bb: budgetBlitz, tt: timesTwelve, sn: snowball, mc: marketCup }[id];
  if (f) { R.game = f(); sfx.click(); }
}
export function quitGame() { R.game = null; }

function hud(bits) {
  return `<div class="hud">${bits.map((b) => `<span class="box">${b}</span>`).join('')}
    <span class="grow"></span><button class="btn ghost sm" data-act="gquit">Leave</button></div>`;
}
function payout(n, label) {
  const amt = price(n);
  if (amt > 0) { sim.earn(K(), amt, label, 'wage'); sim.stamp(K()); sfx.coin(); }
  return amt;
}
function endCard(em, title, sub, wage, line, who) {
  return `<div class="stage" style="justify-content:center;text-align:center">
    <div style="font-size:44px">${em}</div>
    <h2>${esc(title)}</h2>
    <p class="muted">${sub}</p>
    ${line ? say(who || 'pip', line) : ''}
    <p class="small muted">Earned ${money(wage)}, straight into your wallet.</p>
    <button class="btn wide" data-act="gquit">Back to the arcade</button></div>`;
}
function shuffle(arr, seed) {
  const r = rng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
/* Two-choice games share a shape: a card, a verdict, a note, a tally. */
function twoChoice(cfg) {
  const items = shuffle(cfg.items.slice(), cfg.seed);
  const st = { i: 0, right: 0, note: null, done: false };
  const pick = (side) => {
    if (st.done) return;
    const it = items[st.i];
    const ok = it.a === side || it.a === 'both';
    if (ok) { st.right++; sfx.good(); } else sfx.bad();
    st.note = { ok, text: it.note || (ok ? 'Yes.' : cfg.wrongNote(it)) };
    st.i++;
    if (st.i >= items.length) { st.done = true; st.won = payout(Math.round(st.right * cfg.pay), cfg.name); }
    R.render();
  };
  return {
    id: cfg.id,
    key(e) {
      if (st.done) { if (e.key === 'Enter') { quitGame(); R.render(); } return; }
      if (e.key === 'ArrowLeft') pick(cfg.left.side);
      else if (e.key === 'ArrowRight') pick(cfg.right.side);
    },
    act(n) { if (n === cfg.left.act) pick(cfg.left.side); else if (n === cfg.right.act) pick(cfg.right.side); },
    view() {
      if (st.done) return `<div class="stack">${hud(['Done'])}
        ${endCard(st.right >= items.length - 1 ? '🏅' : '👍', st.right + ' of ' + items.length, '', st.won, cfg.outro(st.right, items.length), cfg.who)}</div>`;
      const it = items[st.i];
      return `<div class="stack">
        ${hud([`${st.i + 1} / ${items.length}`, `✓ ${st.right}`])}
        <div class="stage">
          ${cfg.card(it)}
          ${st.note ? `<div style="background:${st.note.ok ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">${esc(st.note.text)}</div>` : ''}
          <div class="grow"></div>
          <div class="choices">
            <button class="btn" style="background:${cfg.left.color}" data-act="${cfg.left.act}">← ${cfg.left.label}</button>
            <button class="btn" style="background:${cfg.right.color}" data-act="${cfg.right.act}">${cfg.right.label} →</button>
          </div>
          <p class="hint">${esc(cfg.hint)}</p>
        </div></div>`;
    },
  };
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
  return twoChoice({
    id: 'nw', name: 'Needs vs Wants', items: NW, seed: 7717, pay: 0.7, who: 'pip',
    hint: 'Arrow keys, or tap. Some are both — either answer counts.',
    left: { side: 'need', act: 'nwNeed', label: 'Need', color: 'var(--save)' },
    right: { side: 'want', act: 'nwWant', label: 'Want', color: 'var(--give)' },
    card: (it) => `<div class="gcard"><span class="em">${it.em}</span><span class="nm">${esc(it.t)}</span></div>`,
    wrongNote: (it) => it.a === 'need' ? 'That one you would be in trouble without.' : 'Lovely, but you would survive the week.',
    outro: () => 'The ones that were <b>both</b> are the point. A list of needs that never changes is a list somebody else wrote for you.',
  });
}

/* ══ 2 · SCAM SPOTTER ═════════════════════════════════════════════════
   Half of these are real and ordinary. A game where everything is a scam
   teaches suspicion; the skill is telling them apart. */
const SS = [
  { t: 'Your parcel could not be delivered. Pay the £1.99 redelivery fee here to reschedule.', a: 'scam',
    note: 'A tiny fee is the hook — it is not about the £1.99, it is about your card details.' },
  { t: 'Hi, it\'s Nani. Are you free on Sunday? Ask your mother and let me know.', a: 'safe',
    note: 'No money, no hurry, no secret. Just Sunday.' },
  { t: 'CONGRATULATIONS! You are today\'s selected winner. Claim within 2 hours!', a: 'scam',
    note: 'A prize you never entered, and a countdown. Reward plus hurry.' },
  { t: 'Your library book is due back on Friday. No action needed if you have returned it.', a: 'safe',
    note: '"No action needed" is almost never how a scam opens.' },
  { t: 'BANK ALERT: suspicious login. Reply with your PIN to secure your account NOW.', a: 'scam',
    note: 'No real bank ever asks for your PIN. Fright plus hurry plus a secret.' },
  { t: 'hey it\'s me, new number! lost my phone. can you send 200 quick, don\'t tell mum', a: 'scam',
    note: 'New number, urgent money, and "don\'t tell". The secrecy is the tell.' },
  { t: 'Your school trip form is due Monday. Paper copies are at the office.', a: 'safe',
    note: 'Boring, specific, and asks for nothing but a form.' },
  { t: 'FREE V-BUCKS GENERATOR — just log in with your username and password!', a: 'scam',
    note: 'There is no generator. There is a page collecting passwords.' },
  { t: 'Your order of one pencil case has shipped. Track it in the app you ordered from.', a: 'safe',
    note: 'It points you back to the app you already use rather than a new link.' },
  { t: 'INVESTMENT OPPORTUNITY: guaranteed to double in 30 days. Only 5 places left!', a: 'scam',
    note: 'Guaranteed and doubling do not belong in the same sentence — and there are always exactly five places left.' },
];
function scamSpotter() {
  return twoChoice({
    id: 'ss', name: 'Scam Spotter', items: SS, seed: 3391, pay: 1.1, who: 'nana',
    hint: 'Arrow keys, or tap. Half of these are perfectly ordinary.',
    left: { side: 'safe', act: 'ssSafe', label: 'Looks fine', color: 'var(--grow)' },
    right: { side: 'scam', act: 'ssScam', label: 'It\'s a trap', color: 'var(--spend)' },
    card: (it) => `<div class="gcard" style="text-align:left"><span class="em" style="display:block;text-align:center">📱</span>
      <p style="font-size:15px;line-height:1.5;font-weight:650">${esc(it.t)}</p></div>`,
    wrongNote: (it) => it.a === 'scam' ? 'That one was a trap.' : 'That one was real. Suspecting everything is its own kind of expensive.',
    outro: (r, n) => r === n
      ? 'All of them. The shape is always the same: a reward or a fright, a hurry, and a secret.'
      : 'Look for the <b>shape</b>, not the story: a reward or a fright, plus a hurry, plus a secret.',
  });
}

/* ══ 3 · BUDGET BLITZ ═════════════════════════════════════════════════ */
function budgetBlitz() {
  const c = K();
  const pot = (c.family.allowance != null ? c.family.allowance : c.money.wage) * 4;
  const bills = [
    { n: 'Rent on the stall', u: 14, must: true }, { n: 'Food for the month', u: 22, must: true },
    { n: 'Bus pass', u: 8, must: true }, { n: 'A film with friends', u: 6, must: false },
    { n: 'Phone plan', u: 6, must: true }, { n: "Mags's brass button", u: 12, must: false },
    { n: 'Sister’s birthday cake', u: 5, must: false }, { n: 'New shoes — the old ones leak', u: 10, must: true },
  ];
  const order = shuffle(bills.slice(), 4423);
  const st = { i: 0, left: pot, missed: [], paid: [], done: false };
  const decide = (payIt) => {
    if (st.done) return;
    const b = order[st.i], amt = price(b.u);
    if (payIt) {
      if (amt > st.left) { sfx.bad(); toast('Not enough left — and that is the lesson'); st.missed.push(b); }
      else { st.left -= amt; st.paid.push(b); sfx.click(); }
    } else { if (b.must) sfx.bad(); else sfx.good(); st.missed.push(b); }
    st.i++;
    if (st.i >= order.length) {
      st.done = true;
      st.mustMissed = st.missed.filter((x) => x.must).length;
      st.won = payout(Math.max(0, 10 - st.mustMissed * 4) + (st.left > 0 ? 4 : 0), 'Budget Blitz');
    }
    R.render();
  };
  return {
    id: 'bb',
    key(e) { if (e.key === '1') decide(true); else if (e.key === '2') decide(false); else if (e.key === 'Enter' && st.done) { quitGame(); R.render(); } },
    act(n) { if (n === 'bbPay') decide(true); else if (n === 'bbSkip') decide(false); },
    view() {
      if (st.done) return `<div class="stack">${hud(['Month over'])}
        ${endCard(st.mustMissed === 0 ? '🎯' : '😬', money(st.left) + ' left over',
          st.mustMissed === 0 ? 'Everything you actually needed got paid.'
            : st.mustMissed + ' thing' + (st.mustMissed > 1 ? 's' : '') + ' you needed went unpaid. Those do not disappear — they move to next month.',
          st.won, 'Leftover money is not a prize. It is the part of the month you get to choose about.', 'nana')}</div>`;
      const b = order[st.i], amt = price(b.u);
      return `<div class="stack">
        ${hud([`Left ${money(st.left)}`, `${st.i + 1} / ${order.length}`])}
        <div class="stage">
          <div class="gcard"><span class="em">🧾</span><span class="nm">${esc(b.n)}</span>
            <div class="big" style="margin-top:6px">${money(amt)}</div></div>
          <div class="bar"><i style="width:${clamp(st.left / pot * 100, 0, 100)}%;background:${st.left > pot * 0.25 ? 'var(--grow)' : 'var(--spend)'}"></i></div>
          <div class="grow"></div>
          <div class="choices">
            <button class="btn" data-act="bbPay">1 · Pay it</button>
            <button class="btn ghost" data-act="bbSkip">2 · Skip it</button></div>
          <p class="hint">Keys 1 and 2, or tap. Nothing tells you which ones you truly need.</p>
        </div></div>`;
    },
  };
}

/* ── quiz-shaped games share a shape too ─────────────────────────────── */
function quizGame(cfg) {
  const qs = cfg.build();
  const st = { i: 0, right: 0, pick: null, done: false };
  const choose = (n) => {
    if (st.done || st.pick != null) return;
    st.pick = n;
    if (n === qs[st.i].a) { st.right++; sfx.good(); } else sfx.bad();
    R.render();
  };
  const next = () => {
    if (st.pick == null) return;
    st.pick = null; st.i++;
    if (st.i >= qs.length) { st.done = true; st.won = payout(Math.round(st.right * cfg.pay), cfg.name); }
    R.render();
  };
  return {
    id: cfg.id,
    key(e) {
      if (st.done) { if (e.key === 'Enter') { quitGame(); R.render(); } return; }
      if (e.key === 'Enter') { next(); return; }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= qs[st.i].opts.length) choose(n - 1);
    },
    act(n, arg) { if (n === cfg.pickAct) choose(+arg); else if (n === cfg.nextAct) next(); },
    view() {
      if (st.done) return `<div class="stack">${hud(['Done'])}
        ${endCard(st.right >= qs.length - 1 ? '🏅' : '👍', st.right + ' of ' + qs.length, '', st.won, cfg.outro, cfg.who)}</div>`;
      const q = qs[st.i];
      return `<div class="stack">
        ${hud([`${st.i + 1} / ${qs.length}`, `✓ ${st.right}`])}
        <div class="stage">
          <div class="gcard"><span class="em">${cfg.em}</span>
            <p style="font-size:15.5px;line-height:1.45;font-weight:700">${q.q}</p></div>
          <div class="stack" style="gap:8px">
            ${q.opts.map((o, i) => {
              let k = '';
              if (st.pick != null) k = i === q.a ? ' ok' : (i === st.pick ? ' no' : '');
              return `<button class="opt${k}" data-act="${cfg.pickAct}" data-arg="${i}" ${st.pick != null ? 'disabled' : ''}>
                <span class="k">${i + 1}</span>${o}</button>`;
            }).join('')}
          </div>
          ${st.pick != null ? `<div style="background:${st.pick === q.a ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">${q.why}</div>
            <button class="btn wide" data-act="${cfg.nextAct}">Next →</button>` : ''}
          <p class="hint">Number keys, or tap. Enter for the next one.</p>
        </div></div>`;
    },
  };
}

/* ══ 4 · TIMES TWELVE ═════════════════════════════════════════════════ */
function timesTwelve() {
  return quizGame({
    id: 'tt', name: 'Times Twelve', em: '🗓️', pay: 1.2, who: 'pip',
    pickAct: 'ttPick', nextAct: 'ttNext',
    outro: 'Multiply every monthly thing by twelve <b>before</b> you agree to it. Then cancel the ones you would not buy at that price.',
    build() {
      const r = rng(5150);
      const out = [];
      const monthly = [15, 25, 30, 40, 60, 12, 20];
      shuffle(monthly.slice(), 991).slice(0, 4).forEach((m) => {
        const right = m * 12;
        const opts = shuffle([right, m * 10, m * 6, right + m], Math.round(r() * 1e6) + m);
        out.push({
          q: `A club costs <b>${money(price(m))} a month</b>. What is that in a year?`,
          opts: opts.map((v) => money(price(v))), a: opts.indexOf(right),
          why: `${money(price(m))} × 12 = <b>${money(price(right))}</b>. Small monthly numbers are the entire technique.`,
        });
      });
      const weekly = [8, 15, 25];
      weekly.forEach((w) => {
        const right = w * 52;
        const opts = shuffle([right, w * 12, w * 30, w * 100], w * 77);
        out.push({
          q: `You spend <b>${money(price(w))} a week</b> on snacks. In a year?`,
          opts: opts.map((v) => money(price(v))), a: opts.indexOf(right),
          why: `${money(price(w))} × 52 = <b>${money(price(right))}</b>. A week is a small unit and a year is not.`,
        });
      });
      const a = 45, b = 480;
      out.push({
        q: `One shop wants <b>${money(price(a))} a month</b>. Another wants <b>${money(price(b))} once a year</b>. Which costs less?`,
        opts: [money(price(a)) + ' a month', money(price(b)) + ' a year', 'They are the same', 'Not enough information'],
        a: 1,
        why: `${money(price(a))} × 12 = ${money(price(a * 12))}, which is more than ${money(price(b))}. The yearly one wins — and it is quoted that way precisely because it looks bigger.`,
      });
      return out;
    },
  });
}

/* ══ 5 · THE SNOWBALL ═════════════════════════════════════════════════ */
function snowball() {
  return quizGame({
    id: 'sn', name: 'The Snowball', em: '❄️', pay: 1.6, who: 'nana',
    pickAct: 'snPick', nextAct: 'snNext',
    outro: 'Almost nobody guesses high enough, because we all quietly add instead of multiplying. Time is the ingredient, not the amount.',
    build() {
      const rows = [
        { p: 100, r: 0.10, y: 10 }, { p: 100, r: 0.07, y: 20 }, { p: 500, r: 0.05, y: 10 },
        { p: 1000, r: 0.10, y: 20 }, { p: 200, r: 0.08, y: 30 }, { p: 100, r: 0.10, y: 30 },
      ];
      return rows.map((row, i) => {
        const right = Math.round(row.p * Math.pow(1 + row.r, row.y));
        const simple = Math.round(row.p * (1 + row.r * row.y));   // the answer everyone reaches for
        const opts = shuffle([right, simple, Math.round(row.p * (1 + row.r * row.y * 0.5)), Math.round(right * 2.1)], 700 + i * 13);
        return {
          q: `<b>${money(price(row.p))}</b> growing <b>${(row.r * 100).toFixed(0)}% a year</b> for <b>${row.y} years</b>. Where does it land?`,
          opts: opts.map((v) => money(price(v))), a: opts.indexOf(right),
          why: `<b>${money(price(right))}</b>. Adding ${(row.r * 100).toFixed(0)}% ${row.y} times would only reach ${money(price(simple))} — the extra is growth landing on earlier growth.`,
        };
      });
    },
  });
}

/* ══ 6 · THE MARKET CUP ═══════════════════════════════════════════════
   Ranked on cup score, not returns. A leaderboard sorted by return alone
   would tell a child the luckiest single bet was the best decision, which
   is the one thing this app must never say. */
function marketCup() {
  const ROUNDS = 6, START = 1000, RED = 3;
  const r = rng(120);
  const ret = [];
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
    me: START, log: [START],
    bots: { Chaser: START, Panicker: START, 'Boring Bella': START },
    botHold: { Chaser: 'basket', Panicker: 'chai', 'Boring Bella': 'basket' },
    botStat: { Chaser: { div: 0, churn: 100 }, Panicker: { div: 0, churn: 100 }, 'Boring Bella': { div: 0, churn: 100 } },
  };
  const cash = () => 100 - (st.alloc.basket + st.alloc.grain + st.alloc.chai + st.alloc.rocket);
  const adjust = (id, d) => {
    if (st.done) return;
    const nd = clamp(st.alloc[id] + d, 0, st.alloc[id] + cash());
    if (nd === st.alloc[id]) { sfx.bad(); return; }
    st.churn += Math.abs(nd - st.alloc[id]);
    st.alloc[id] = nd; sfx.click(); R.render();
  };
  /* The basket IS diversification — it is a slice of every shop in town. */
  const effective = () => {
    let n = 0;
    if (st.alloc.basket >= 15) n += 4;
    ['grain', 'chai', 'rocket'].forEach((k) => { if (st.alloc[k] >= 15) n += 1; });
    return Math.min(4, n);
  };
  const scoreOf = (final, divAvg, churn) => {
    const rt = Math.round((final / START - 1) * 100);
    const div = Math.round(divAvg * 7);
    const steady = Math.max(0, 30 - Math.round(churn / 8));
    return { ret: rt, div, steady, total: rt + div + steady };
  };
  const next = () => {
    if (st.done) return;
    st.divSum += effective();
    const row = ret[st.round];
    let g = 0;
    ASSETS.forEach((a) => { g += (st.alloc[a.id] / 100) * row[a.id]; });
    st.me = Math.round(st.me * (1 + g));
    st.log.push(st.me);

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
  const finish = () => {
    st.done = true;
    const c = K();
    st.score = scoreOf(st.me, st.divSum / ROUNDS, st.churn);
    st.table = [{ who: 'You', v: st.me, sc: st.score }]
      .concat(Object.keys(st.bots).map((k) => ({ who: k, v: st.bots[k],
        sc: scoreOf(st.bots[k], st.botStat[k].div / ROUNDS, st.botStat[k].churn) })))
      .sort((a, b) => b.sc.total - a.sc.total);
    st.place = st.table.findIndex((x) => x.who === 'You') + 1;
    st.byReturn = st.table.slice().sort((a, b) => b.v - a.v)[0].who;
    st.won = payout(Math.max(4, Math.round(st.score.total / 6)), 'The Market Cup');
    if (st.score.div >= 24) sim.badge(c, 'diversified');
    const line = `${st.place}${['st', 'nd', 'rd', 'th'][Math.min(st.place - 1, 3)]} of 4 · cup score ${st.score.total}`;
    if (!c.market.best) c.market.best = line;
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
            <p class="muted">Cup score ${sc.total} · ended on ${st.me} from ${START}.</p></div>
            <div class="lead">
              ${st.table.map((row, i) => `<div class="leadrow ${row.who === 'You' ? 'me' : ''}">
                <span>${i + 1}</span>
                <span>${esc(row.who)}<br><span style="font-weight:600;font-size:11.5px;opacity:.75">
                  ${row.sc.ret >= 0 ? '+' : ''}${row.sc.ret} return · ${row.sc.div} spread · ${row.sc.steady} nerve</span></span>
                <span class="p" style="font-size:17px">${row.sc.total}</span></div>`).join('')}
            </div>
            <p class="small muted">Ranked on cup score. On money alone <b>${esc(st.byReturn)}</b> finished top —
              which is exactly why money alone is not the scoreboard.</p>
            <div class="card" style="box-shadow:none">
              <div class="eyebrow">Your cup score — and this is the part that matters</div>
              <div class="grid3" style="margin-top:8px">
                <div><div class="small muted">Return</div><div style="font-weight:800">${sc.ret >= 0 ? '+' : ''}${sc.ret}</div></div>
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
      return `<div class="stack">
        ${hud([`Week ${st.round + 1} / ${ROUNDS}`, `${st.me}`, `cash ${cash()}%`])}
        <div class="stage">
          <p class="small muted">Split 100% across what you fancy. What you leave in cash is safe and grows by nothing.</p>
          <div class="alloc">
            ${ASSETS.map((a, i) => `<div class="alrow ${i === st.sel ? 'sel' : ''}" data-act="mcSel" data-arg="${a.id}" role="button" tabindex="0">
              <div><b style="font-size:14px">${a.em} ${esc(a.name)}</b>
                <div class="small muted">${a.kind === 'fund' ? 'a slice of every shop' : a.kind === 'steady' ? 'slow and dull' : a.kind === 'growth' ? 'growing, bumpy' : 'anybody’s guess'}</div></div>
              <div class="stepper">
                <button data-act="mcAdj" data-arg="${a.id}:-10" aria-label="less ${esc(a.name)}">−</button>
                <span class="n">${st.alloc[a.id]}%</span>
                <button data-act="mcAdj" data-arg="${a.id}:10" aria-label="more ${esc(a.name)}">+</button></div></div>`).join('')}
          </div>
          ${sparkline(st.log, 300, 40, 'var(--action)')}
          <button class="btn wide" data-act="mcNext">Play the week →</button>
          <p class="hint">Arrows to move and change, Enter to play the week. Or just tap.</p>
        </div></div>`;
    },
  };
}

export const GAME_ACTS = ['nwNeed', 'nwWant', 'ssSafe', 'ssScam', 'bbPay', 'bbSkip',
  'ttPick', 'ttNext', 'snPick', 'snNext', 'mcAdj', 'mcNext', 'mcSel'];
