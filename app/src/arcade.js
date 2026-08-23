/* arcade.js — six games, every one of them scoring the decision rather than
   the outcome (CONCEPT §6.3), and every one taking BOTH keyboard and touch,
   which is inherited from Bizzing Bee and non-negotiable.

   Wages land in the same wallet as everything else. There is no second,
   magic money, and no randomised reward for money spent — anywhere. */

import { esc, sfx, toast, rng, clamp, sparkline } from './ui.js';
import { money, price, currency, CURRENCIES } from './fmt.js';
import { say } from './art.js';
import { ASSETS, STOCK } from './content.js';
import { mainStreet } from './board.js';
import * as sim from './sim.js';
import { R } from './runtime.js';

const K = () => sim.kid(R.s);

export const GAMES = [
  { id: 'cr', em: '🪙', name: 'Change Rush', keys: '← →', lv: 1, kind: 'action',
    blurb: 'Coins are falling and you need exactly the right amount. Catch one too many and you have overpaid.' },
  { id: 'nw', em: '⚖️', name: 'Needs vs Wants', keys: '← →', lv: 1, kind: 'action',
    blurb: 'Sort it before the bell. Some are both, and those are the good ones.' },
  { id: 'ss', em: '🛡️', name: 'Scam Spotter', keys: '← →', lv: 1, kind: 'action',
    blurb: 'Real message or trap? They are designed to look identical.' },
  { id: 'bb', em: '💸', name: 'Budget Blitz', keys: '1 2', lv: 6, kind: 'action',
    blurb: 'A month of money, and the bills arrive one at a time.' },
  { id: 'cc', em: '🗼', name: 'Compound Climb', keys: 'hold space', lv: 11, kind: 'action',
    blurb: 'Hold to grow the tower. Hold longer for more — and past a point it can go backwards, and you can be wiped out.' },
  { id: 'sr', em: '🫖', name: 'Stall Rush', keys: '1–4 · R', lv: 6, kind: 'action',
    blurb: 'Sixty seconds of customers. Serve them, restock, and find out whether busy and profitable are the same thing.' },
  { id: 'st', em: '⛈️', name: 'Market Storm', keys: 'space', lv: 16, kind: 'action',
    blurb: 'Everything is red and everyone is shouting sell. The winning move is to do nothing, and it is much harder than it sounds.' },
  { id: 'mc', em: '🏆', name: 'The Market Cup', keys: '↑↓←→ ⏎', lv: 16, kind: 'action',
    blurb: 'Six weeks against Chaser, Panicker and Boring Bella. Bella is annoying.' },
  { id: 'mn', em: '🎲', name: 'Main Street', keys: '⏎ · Y/N', lv: 8, kind: 'board',
    blurb: 'The board game. Buy the shops, collect the rent, and win when your street pays for your life — nobody goes bankrupt.' },
  { id: 'tt', em: '🗓️', name: 'Times Twelve', keys: '1–4', lv: 6, kind: 'drill',
    blurb: 'Small monthly numbers, turned into the number that is actually true.' },
  { id: 'sn', em: '❄️', name: 'The Snowball', keys: '1–4', lv: 11, kind: 'drill',
    blurb: 'Guess where compounding lands. Nobody guesses high enough.' },
];

export function viewArcade() {
  if (R.game) return R.game.view();
  const c = K();
  const tile = (g) => {
    const open = c.learn.level >= g.lv;
    return `<button class="card" data-act="${open ? 'game' : 'locked'}" data-arg="${open ? g.id : g.lv}" style="text-align:left;width:100%;${open ? '' : 'opacity:.6'}">
      <div class="row"><span style="font-size:30px">${open ? g.em : '🔒'}</span>
        <div class="grow"><b style="font-size:16px">${esc(g.name)}</b>
          <p class="small muted">${open ? esc(g.blurb) : 'Opens at level ' + g.lv}</p></div>
        <span class="pill">${open ? g.keys : 'L' + g.lv}</span></div></button>`;
  };
  return `<div class="stack">
    ${say('pip', 'Wages from in here land in the same wallet as everything else. There is no second, magic money — that is on purpose.')}
    <div class="eyebrow">The board game · about ten minutes, and nobody goes bankrupt</div>
    ${GAMES.filter((g) => g.kind === 'board').map(tile).join('')}
    <div class="eyebrow" style="margin-top:6px">A few minutes each</div>
    ${GAMES.filter((g) => g.kind === 'action').map(tile).join('')}
    <div class="eyebrow" style="margin-top:6px">Quick drills — a minute each, no reflexes required</div>
    ${GAMES.filter((g) => g.kind === 'drill').map(tile).join('')}
    ${c.market.best ? `<div class="card"><div class="eyebrow">Best Market Cup finish</div>
      <p style="font-weight:800">${esc(c.market.best)}</p></div>` : ''}
  </div>`;
}

export function startGame(id) {
  const f = { cr: changeRush, nw: needsWants, ss: scamSpotter, bb: budgetBlitz,
    cc: compoundClimb, sr: stallRush, st: marketStorm, tt: timesTwelve, sn: snowball,
    mc: marketCup, mn: mainStreet }[id];
  if (f) { if (R.game && R.game.stop) R.game.stop(); R.game = f(); sfx.click(); }
}
export function quitGame() { if (R.game && R.game.stop) R.game.stop(); R.game = null; }

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
  const pot = sim.weeklyIncome(c) * 4;
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
  'ttPick', 'ttNext', 'snPick', 'snNext', 'mcAdj', 'mcNext', 'mcSel',
  'crLane', 'crGo', 'stSell', 'stPlan', 'stGo',
  'ccHold', 'ccRelease', 'srServe', 'srStock',
  'mnRoll', 'mnBuy', 'mnPass', 'mnCard', 'mnEnd'];

/* ══ COMPOUND CLIMB ═══════════════════════════════════════════════════
   Risk and return as a physical feeling. Hold to charge the year's growth:
   charge more for a higher average AND a wider swing, past a point wide
   enough to go backwards. Fifteen years, and you can be wiped out — which
   is the half of "high return" nobody puts on the poster. */
function compoundClimb() {
  const YEARS = 15, START = 100, TARGET = 420, W = 360, H = 320;
  const st = { year: 0, money: START, charge: 0, holding: false, done: false,
    hist: [START], last: null, ruined: false, peak: START };
  let raf = 0, prev = 0, ctx = null, cv = null;
  const r = rng(8821);

  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  const finish = () => {
    if (st.done) return;
    st.done = true; stop();
    st.won = payout(Math.max(3, Math.round(st.money / 22)), 'Compound Climb');
    if (st.money >= TARGET) sim.badge(K(), 'climbed');
    sfx.level(); R.render();
  };
  const release = () => {
    if (st.done || !st.holding) return;
    st.holding = false;
    const ch = st.charge / 100;
    const mean = ch * 0.22;                     // 0 % → 22 % expected
    const vol = ch * ch * 0.34;                 // and the swing grows faster than the return
    const actual = mean + (r() + r() - 1) * vol;
    const before = st.money;
    st.money = Math.max(0, st.money * (1 + actual));
    st.hist.push(Math.round(st.money));
    st.peak = Math.max(st.peak, st.money);
    st.last = { pct: actual, before, after: st.money };
    st.year++;
    st.charge = 0;
    if (st.money < 20) { st.ruined = true; finish(); return; }
    if (actual < 0) sfx.bad(); else sfx.coin();
    if (st.year >= YEARS) { finish(); return; }
    R.render();
  };
  const press = () => { if (!st.done && !st.holding) { st.holding = true; st.charge = 0; } };

  const step = (ts) => {
    if (st.done) return;
    const dt = Math.min(60, ts - (prev || ts)); prev = ts;
    if (st.holding) st.charge = Math.min(100, st.charge + dt * 0.075);
    draw();
    const bar = document.getElementById('ccCharge');
    if (bar) bar.style.width = st.charge.toFixed(1) + '%';
    raf = requestAnimationFrame(step);
  };
  const draw = () => {
    if (!ctx) return;
    const cs = getComputedStyle(document.documentElement);
    const tok = (n, f) => (cs.getPropertyValue(n) || f).trim() || f;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = tok('--tint', '#EDF2F2'); ctx.fillRect(0, 0, W, H);
    const top = Math.max(TARGET * 1.15, st.peak * 1.1);
    const y = (v) => H - 14 - (v / top) * (H - 40);
    // the line you are climbing towards
    ctx.setLineDash([5, 5]); ctx.strokeStyle = tok('--grow', '#178A4C'); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, y(TARGET)); ctx.lineTo(W, y(TARGET)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = tok('--grow', '#178A4C'); ctx.font = '600 11px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('target', 6, y(TARGET) - 6);
    // the tower: one block a year, so compounding is a shape rather than a claim
    const bw = Math.max(6, (W - 40) / YEARS);
    st.hist.forEach((v, i) => {
      const bx = 20 + i * bw;
      const grew = i === 0 || v >= st.hist[i - 1];
      ctx.fillStyle = grew ? tok('--action', '#0E6B78') : tok('--spend', '#C4453C');
      ctx.globalAlpha = i === st.hist.length - 1 ? 1 : 0.75;
      ctx.fillRect(bx, y(v), bw - 3, H - 14 - y(v));
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = tok('--ink', '#16262A'); ctx.font = '800 15px system-ui'; ctx.textAlign = 'right';
    ctx.fillText(String(Math.round(st.money)), W - 8, Math.max(16, y(st.money) - 8));
  };

  return {
    id: 'cc',
    mount() {
      cv = document.getElementById('ccCanvas');
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx = cv.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!st.done && !raf) { prev = 0; raf = requestAnimationFrame(step); }
      const btn = document.getElementById('ccBtn');
      if (btn) {
        btn.onpointerdown = (e) => { e.preventDefault(); press(); };
        btn.onpointerup = (e) => { e.preventDefault(); release(); };
        btn.onpointerleave = () => { if (st.holding) release(); };
      }
    },
    stop,
    key(e) {
      if (st.done) { if (e.key === 'Enter') { quitGame(); R.render(); } return; }
      if ((e.key === ' ' || e.key === 'Spacebar') && e.type === 'keydown') press();
    },
    keyup(e) { if (e.key === ' ' || e.key === 'Spacebar') release(); },
    act(n) { if (n === 'ccHold') press(); else if (n === 'ccRelease') release(); },
    view() {
      if (st.done) {
        const reached = st.money >= TARGET;
        return `<div class="stack">${hud(['Fifteen years'])}
          ${endCard(st.ruined ? '💀' : reached ? '🗼' : '📈',
            st.ruined ? 'Wiped out in year ' + st.year : Math.round(st.money) + ' from ' + START,
            st.ruined ? 'Nothing left to compound. That is the half of "high return" nobody puts on the poster.'
              : reached ? 'Over the line.'
                : 'Short of the line, and still ' + (st.money / START).toFixed(1) + '× what you started with.',
            st.won,
            st.ruined ? 'Growth needs something left to grow. A swing big enough to double you is big enough to end you.'
              : 'The middle charge usually wins. Not the safe one, not the wild one — the one you can survive fifteen times in a row.',
            'nana')}</div>`;
      }
      const l = st.last;
      return `<div class="stack">
        ${hud([`Year ${st.year + 1} / ${YEARS}`, `${Math.round(st.money)}`, `target ${TARGET}`])}
        <div class="stage" style="min-height:0;padding:12px">
          <canvas id="ccCanvas" style="width:100%;max-width:420px;margin:0 auto;height:auto;aspect-ratio:${W}/${H};border-radius:var(--r-md);display:block;touch-action:none"></canvas>
          ${l ? `<div style="background:${l.pct >= 0 ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:10px 12px;font-size:13.5px;text-align:center">
            Year ${st.year}: <b>${l.pct >= 0 ? '+' : ''}${(l.pct * 100).toFixed(1)}%</b> · ${Math.round(l.before)} → ${Math.round(l.after)}</div>` : ''}
          <div>
            <div class="row"><span class="eyebrow grow">This year's growth</span>
              <span class="small muted">longer = more, and wilder</span></div>
            <div class="bar" style="height:16px;margin-top:5px">
              <i id="ccCharge" style="width:${st.charge}%;background:linear-gradient(90deg,var(--grow),var(--treasure) 55%,var(--spend))"></i></div>
          </div>
          <button class="btn wide" id="ccBtn" style="padding:18px" data-act="noop">HOLD TO GROW</button>
          <p class="hint">Hold space or the button, let go to lock the year in. Steady beats spectacular — usually.</p>
        </div></div>`;
    },
  };
}

/* ══ STALL RUSH ═══════════════════════════════════════════════════════
   Sixty seconds of customers, so that "busy" and "profitable" can come
   apart in front of the child rather than in a sentence. */
function stallRush() {
  const LEN = 60000, MAXQ = 4;
  const st = { t: 0, cash: 0, revenue: 0, spent: 0, served: 0, lost: 0,
    stock: { chai: 3, ice: 3, umbrella: 2, rope: 2 }, q: [], done: false,
    spawn: 900, restock: 0, msg: '' };
  let raf = 0, prev = 0, nid = 0;
  const r = rng(3312);
  const items = STOCK.map((x) => x.id);

  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  const finish = () => {
    if (st.done) return;
    st.done = true; stop();
    st.profit = st.revenue - st.spent;
    st.won = payout(Math.max(2, Math.round(st.profit / 14)), 'Stall Rush');
    if (st.profit > 0) sim.badge(K(), 'profit-day');
    sfx.level(); R.render();
  };
  const serve = (id) => {
    if (st.done) return;
    const i = st.q.findIndex((c) => c.want === id);
    if (i < 0) { sfx.bad(); st.msg = 'Nobody is waiting for that'; R.render(); return; }
    if (!st.stock[id]) { sfx.bad(); st.msg = 'Out of ' + id + ' — restock costs time'; R.render(); return; }
    const item = STOCK.find((x) => x.id === id);
    st.stock[id]--; st.q.splice(i, 1);
    st.revenue += price(item.sells); st.served++;
    st.msg = ''; sfx.coin(); R.render();
  };
  const restock = () => {
    if (st.done || st.restock > 0) return;
    let cost = 0;
    STOCK.forEach((x) => { const add = 3 - (st.stock[x.id] || 0); if (add > 0) { st.stock[x.id] += add; cost += price(x.cost) * add; } });
    if (!cost) { st.msg = 'Everything is already stocked'; R.render(); return; }
    st.spent += cost; st.restock = 2600;
    st.msg = 'Restocked for ' + money(cost) + ' — and the queue did not wait';
    sfx.click(); R.render();
  };
  const step = (ts) => {
    if (st.done) return;
    const dt = Math.min(60, ts - (prev || ts)); prev = ts;
    st.t += dt;
    st.restock = Math.max(0, st.restock - dt);
    st.spawn -= dt;
    let dirty = false;
    if (st.spawn <= 0 && st.q.length < MAXQ) {
      st.spawn = 900 + r() * 700;
      st.q.push({ id: ++nid, want: items[Math.floor(r() * items.length)], patience: 1 });
      dirty = true;
    }
    for (let i = st.q.length - 1; i >= 0; i--) {
      st.q[i].patience -= dt / 9000;
      if (st.q[i].patience <= 0) { st.q.splice(i, 1); st.lost++; dirty = true; sfx.bad(); }
    }
    if (st.t >= LEN) { finish(); return; }
    const tl = document.getElementById('srTime');
    if (tl) tl.textContent = Math.ceil((LEN - st.t) / 1000);
    st.q.forEach((c) => { const b = document.getElementById('srP' + c.id); if (b) b.style.width = Math.max(0, c.patience * 100) + '%'; });
    if (dirty) R.render();
    raf = requestAnimationFrame(step);
  };
  return {
    id: 'sr',
    mount() { if (!st.done && !raf) { prev = 0; raf = requestAnimationFrame(step); } },
    stop,
    key(e) {
      if (st.done) { if (e.key === 'Enter') { quitGame(); R.render(); } return; }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= items.length) serve(items[n - 1]);
      else if (e.key === 'r' || e.key === 'R') restock();
    },
    act(n, arg) { if (n === 'srServe') serve(arg); else if (n === 'srStock') restock(); },
    view() {
      if (st.done) {
        return `<div class="stack">${hud(['Closed'])}
          <div class="stage" style="justify-content:center;text-align:center">
            <div style="font-size:44px">${st.profit > 0 ? '💹' : '📉'}</div>
            <h2>${st.profit >= 0 ? '+' : '−'}${money(Math.abs(st.profit))} profit</h2>
            <div class="card" style="box-shadow:none">
              <div class="grid3">
                <div><div class="small muted">Took</div><div style="font-weight:800;color:var(--grow)">${money(st.revenue)}</div></div>
                <div><div class="small muted">Spent on stock</div><div style="font-weight:800">${money(st.spent)}</div></div>
                <div><div class="small muted">Served</div><div style="font-weight:800">${st.served}</div></div>
              </div>
            </div>
            <p class="small muted">${st.lost} customer${st.lost === 1 ? '' : 's'} gave up waiting.</p>
            ${say('nana', st.revenue > 0 && st.profit <= 0
              ? 'You were rushed off your feet and you are down on the day. Busy and profitable are two different words, and only one of them pays the rent.'
              : 'Revenue is the number people brag about. That one at the top is the one that decides whether you are open next year.')}
            <p class="small muted">Earned ${money(st.won)}.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`;
      }
      return `<div class="stack">
        ${hud([`<span id="srTime">${Math.ceil((LEN - st.t) / 1000)}</span>s`,
          `took ${money(st.revenue)}`, `stock ${money(st.spent)}`, `lost ${st.lost}`])}
        <div class="stage">
          <div class="eyebrow">The queue</div>
          <div class="stack" style="gap:7px;min-height:132px">
            ${st.q.length ? st.q.map((c) => {
              const item = STOCK.find((x) => x.id === c.want);
              return `<div class="row" style="gap:10px;background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
                <span style="font-size:22px">${item.em}</span>
                <span class="grow"><b style="font-size:14px">${esc(item.name)}</b>
                  <div class="bar" style="height:5px;margin-top:5px"><i id="srP${c.id}" style="width:${c.patience * 100}%;background:var(--treasure);transition:none"></i></div></span>
                <span class="pill">${money(price(item.sells))}</span></div>`;
            }).join('') : '<p class="small muted">Nobody yet. They come in waves.</p>'}
          </div>
          ${st.msg ? `<p class="small" style="color:var(--spend);font-weight:650;text-align:center">${esc(st.msg)}</p>` : ''}
          <div class="choices" style="grid-template-columns:repeat(4,1fr)">
            ${STOCK.map((x, i) => `<button class="btn ${st.stock[x.id] ? '' : 'ghost'}" data-act="srServe" data-arg="${x.id}"
              style="flex-direction:column;gap:1px;padding:8px 3px;font-size:11px;line-height:1.15">
              <span style="font-size:18px">${x.em}</span>
              <span style="font-weight:800">${esc(x.name)}</span>
              <span style="opacity:.75;font-family:var(--mono);font-size:10.5px">${i + 1} · ${st.stock[x.id] || 0} left</span></button>`).join('')}
          </div>
          <button class="btn ghost wide" data-act="srStock" ${st.restock > 0 ? 'disabled' : ''}>
            ${st.restock > 0 ? 'Restocking…' : 'R · Restock everything'}</button>
          <p class="hint">Number keys to serve, R to restock. Restocking costs money and takes time you do not have.</p>
        </div></div>`;
    },
  };
}

/* ══ CHANGE RUSH ══════════════════════════════════════════════════════
   A real game loop, not a quiz with a hat on. Coins fall, you catch the
   ones that make the amount exactly — and catching one too many is the
   whole point: overpaying is a mistake you can feel. */
function changeRush() {
  const cur = CURRENCIES[currency()];
  const COINS = cur.coins.slice(0, 5);
  const LANES = 4, W = 360, H = 300;
  const st = { target: 0, got: 0, lives: 3, round: 1, score: 0, lane: 1,
    drops: [], t: 0, spawn: 0, done: false, flash: 0, msg: '' };
  let raf = 0, last = 0, ctx = null, cv = null;

  const newTarget = () => {
    const n = 2 + Math.floor(Math.random() * 3);
    let t = 0;
    for (let i = 0; i < n; i++) t += COINS[Math.floor(Math.random() * COINS.length)];
    st.target = t; st.got = 0; st.drops = []; st.spawn = 0;
  };
  newTarget();

  const end = () => {
    if (st.done) return;
    st.done = true;
    stop();
    st.won = payout(Math.round(st.score * 0.5), 'Change Rush');
    if (st.round > 4) sim.badge(K(), 'exact-change');
    R.render();
  };
  const catchCoin = (v) => {
    st.got += v;
    if (st.got === st.target) {
      st.score += 4 + st.round; st.round++; st.flash = 1; st.msg = 'Exact!';
      sfx.coin(); newTarget();
    } else if (st.got > st.target) {
      st.lives--; st.flash = -1; st.msg = 'Overpaid by ' + money(st.got - st.target);
      sfx.bad(); newTarget();
      if (st.lives <= 0) end();
    } else { sfx.click(); }
  };

  const step = (ts) => {
    if (st.done) return;
    const dt = Math.min(50, ts - (last || ts)); last = ts;
    st.t += dt;
    st.spawn -= dt;
    if (st.spawn <= 0) {
      st.spawn = 620 - Math.min(320, st.round * 40);
      const need = st.target - st.got;
      /* always keep a coin on screen that can finish the job, or the game is
         luck rather than arithmetic */
      const usable = COINS.filter((v) => v <= need);
      const v = (usable.length && Math.random() < 0.55)
        ? usable[Math.floor(Math.random() * usable.length)]
        : COINS[Math.floor(Math.random() * COINS.length)];
      st.drops.push({ lane: Math.floor(Math.random() * LANES), y: -20, v });
    }
    const speed = 0.075 + st.round * 0.012;
    st.drops.forEach((d) => { d.y += speed * dt; });
    for (let i = st.drops.length - 1; i >= 0; i--) {
      const d = st.drops[i];
      if (d.y > H - 44 && d.y < H - 18 && d.lane === st.lane) { catchCoin(d.v); st.drops.splice(i, 1); }
      else if (d.y > H + 24) st.drops.splice(i, 1);
    }
    if (st.flash) st.flash *= 0.93;
    draw();
    raf = requestAnimationFrame(step);
  };

  const draw = () => {
    if (!ctx) return;
    const cs = getComputedStyle(document.documentElement);
    const tok = (n, f) => (cs.getPropertyValue(n) || f).trim() || f;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = tok('--tint', '#EDF2F2'); ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = tok('--line', '#DCE5E4'); ctx.lineWidth = 1;
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath(); ctx.moveTo(i * (W / LANES), 0); ctx.lineTo(i * (W / LANES), H); ctx.stroke();
    }
    st.drops.forEach((d) => {
      const x = d.lane * (W / LANES) + W / LANES / 2;
      ctx.beginPath(); ctx.arc(x, d.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = tok('--treasure', '#F0B429'); ctx.fill();
      ctx.fillStyle = '#5A3D00'; ctx.font = '700 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(d.v), x, d.y + 1);
    });
    const bx = st.lane * (W / LANES) + W / LANES / 2;
    ctx.fillStyle = st.flash > 0.1 ? tok('--grow', '#178A4C') : st.flash < -0.1 ? tok('--spend', '#C4453C') : tok('--action', '#0E6B78');
    ctx.beginPath();
    ctx.moveTo(bx - 34, H - 34); ctx.lineTo(bx + 34, H - 34);
    ctx.lineTo(bx + 26, H - 6); ctx.lineTo(bx - 26, H - 6); ctx.closePath(); ctx.fill();
  };

  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };

  return {
    id: 'cr',
    mount() {
      cv = document.getElementById('crCanvas');
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx = cv.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!st.done) { last = 0; stop(); raf = requestAnimationFrame(step); }
      cv.onpointerdown = (e) => {
        const r = cv.getBoundingClientRect();
        st.lane = clamp(Math.floor(((e.clientX - r.left) / r.width) * LANES), 0, LANES - 1);
      };
    },
    stop,
    key(e) {
      if (st.done) { if (e.key === 'Enter') { quitGame(); R.render(); } return; }
      if (e.key === 'ArrowLeft') st.lane = Math.max(0, st.lane - 1);
      else if (e.key === 'ArrowRight') st.lane = Math.min(LANES - 1, st.lane + 1);
    },
    act(n, arg) { if (n === 'crLane') st.lane = clamp(+arg, 0, LANES - 1); },
    view() {
      if (st.done) return `<div class="stack">${hud(['Done'])}
        ${endCard(st.round > 4 ? '🏅' : '🪙', st.round - 1 + ' exact', 'Score ' + st.score + '.', st.won,
          'Overpaying is the one that costs you. A shop will take too much money all day long and never mention it.', 'mags')}</div>`;
      return `<div class="stack">
        ${hud([`Need ${money(st.target)}`, `Got ${money(st.got)}`, '❤️'.repeat(Math.max(0, st.lives))])}
        <div class="stage" style="min-height:0;padding:12px">
          <div class="bar"><i style="width:${Math.min(100, st.got / st.target * 100)}%;background:${st.got > st.target ? 'var(--spend)' : 'var(--action)'}"></i></div>
          <canvas id="crCanvas" style="width:100%;max-width:400px;margin:0 auto;height:auto;aspect-ratio:${W}/${H};border-radius:var(--r-md);display:block;touch-action:none"></canvas>
          <div class="choices" style="grid-template-columns:repeat(4,1fr);max-width:400px;margin:0 auto;width:100%">
            ${[0, 1, 2, 3].map((i) => `<button class="btn ${st.lane === i ? '' : 'ghost'}" data-act="crLane" data-arg="${i}" aria-label="lane ${i + 1}">${i + 1}</button>`).join('')}
          </div>
          <p class="hint">${st.msg ? esc(st.msg) + ' · ' : ''}Arrow keys, or tap a lane. Stop at exactly the amount.</p>
        </div></div>`;
    },
  };
}

/* ══ MARKET STORM ═════════════════════════════════════════════════════
   A game whose winning move is inaction. The only big button sells; the
   small one re-reads your own plan. Panic rises on its own and jumps every
   time somebody shouts. Nothing else in the app can teach this. */
const SHOUTS = [
  ['bea', 'It is down again. I told you. GET OUT.'],
  ['bea', 'Everyone is selling. Everyone.'],
  ['mags', 'Sell me yours cheap and I will look after it for you.'],
  ['bea', 'This one is not coming back. This one is different.'],
  ['bo', 'I am buying more, but I would say that.'],
  ['bea', 'Down eleven percent. ELEVEN.'],
  ['mags', 'My cousin sold at the top. You could have been my cousin.'],
  ['bea', 'It has never been this bad. Well — it has, but still.'],
];
function marketStorm() {
  const START = 1000, LEN = 42000;
  const st = { t: 0, panic: 0, val: START, low: START, line: [START, START, START], done: false,
    sold: false, shout: null, shoutT: 0, calmT: 0, recover: 0 };
  let iv = 0, last = 0;
  const r = rng(4477);

  const stop = () => { if (iv) cancelAnimationFrame(iv); iv = 0; };
  const finish = (sold) => {
    if (st.done) return;
    st.done = true; st.sold = sold; stop();
    /* the recovery is authored, not random: the lesson only lands if holding
       is actually rewarded, and pretending otherwise would be a lie */
    st.after = Math.round(START * 1.12);
    st.soldAt = Math.round(st.val);
    st.won = payout(sold ? 3 : 14, 'Market Storm');
    if (!sold) sim.badge(K(), 'held-the-storm');
    if (sold) sfx.bad(); else { sfx.level(); }
    R.render();
  };
  const tick = (ts) => {
    if (st.done) return;
    const dt = Math.min(60, ts - (last || ts)); last = ts;
    st.t += dt;
    const p = st.t / LEN;
    const wobble = (r() - 0.5) * 22;
    st.val = Math.max(520, START * (1 - 0.34 * Math.sin(Math.min(1, p) * Math.PI * 0.92)) + wobble);
    st.low = Math.min(st.low, st.val);
    if (st.line.length < 120 && st.t - (st.lastPt || 0) > 350) { st.lastPt = st.t; st.line.push(Math.round(st.val)); }
    st.panic = clamp(st.panic + dt * 0.0022, 0, 100);
    st.shoutT -= dt; st.calmT = Math.max(0, st.calmT - dt);
    if (st.shoutT <= 0) {
      st.shoutT = 3400;
      st.shout = SHOUTS[Math.floor(r() * SHOUTS.length)];
      st.panic = clamp(st.panic + 11, 0, 100);
      R.render();
    }
    if (st.panic >= 100) { finish(true); return; }
    if (st.t >= LEN) { finish(false); return; }
    const el = document.getElementById('stPanic');
    if (el) el.style.width = st.panic.toFixed(1) + '%';
    const vv = document.getElementById('stVal');
    if (vv) vv.textContent = Math.round(st.val);
    const tt = document.getElementById('stTime');
    if (tt) tt.textContent = Math.ceil((LEN - st.t) / 1000);
    /* the falling line is the emotional core, so it updates in the loop —
       a full re-render every frame would thrash the whole document */
    const ch = document.getElementById('stChart');
    if (ch) ch.innerHTML = sparkline(st.line, 300, 62, 'var(--spend)');
    iv = requestAnimationFrame(tick);
  };
  const calm = () => {
    if (st.done || st.calmT > 0) return;
    st.panic = clamp(st.panic - 26, 0, 100);
    st.calmT = 2600;
    sfx.good();
    R.render();
  };
  return {
    id: 'st',
    mount() { if (!st.done && !iv) { last = 0; iv = requestAnimationFrame(tick); } },
    stop,
    key(e) {
      if (st.done) { if (e.key === 'Enter') { quitGame(); R.render(); } return; }
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); calm(); }
    },
    act(n) { if (n === 'stSell') finish(true); else if (n === 'stPlan') calm(); },
    view() {
      if (st.done) {
        return `<div class="stack">${hud(['Storm over'])}
          <div class="stage" style="text-align:center;justify-content:center">
            <div style="font-size:44px">${st.sold ? '📉' : '⛰️'}</div>
            <h2>${st.sold ? 'You sold' : 'You held'}</h2>
            <p class="muted">${st.sold
              ? 'Locked in ' + st.soldAt + ' from ' + START + '. The fall became a loss the moment you sold.'
              : 'It bottomed at ' + Math.round(st.low) + ' and came back to ' + st.after + '.'}</p>
            <div class="card" style="box-shadow:none">
              <div class="grid3">
                <div><div class="small muted">Started</div><div style="font-weight:800">${START}</div></div>
                <div><div class="small muted">Worst moment</div><div style="font-weight:800;color:var(--spend)">${Math.round(st.low)}</div></div>
                <div><div class="small muted">${st.sold ? 'You got' : 'Ended'}</div>
                  <div style="font-weight:800;color:${st.sold ? 'var(--spend)' : 'var(--grow)'}">${st.sold ? st.soldAt : st.after}</div></div>
              </div>
            </div>
            ${say(st.sold ? 'bea' : 'nana', st.sold
              ? 'I talked you into it, and I am always this certain, and I am wrong about half the time. Have another go.'
              : 'A fall is not a loss until you sell. Sitting still is the hardest thing in this whole subject and you just did it.')}
            <p class="small muted">Earned ${money(st.won)}. Fictional market, real behaviour, nothing here is advice.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`;
      }
      const sh = st.shout;
      return `<div class="stack">
        ${hud([`<span id="stTime">${Math.ceil((LEN - st.t) / 1000)}</span>s left`, `<span id="stVal">${Math.round(st.val)}</span> / ${START}`])}
        <div class="stage">
          <div>
            <div class="row"><span class="eyebrow grow">Panic</span>
              <span class="small muted">${st.calmT > 0 ? 'reading your plan…' : 'space, or the small button'}</span></div>
            <div class="bar" style="height:14px;margin-top:5px">
              <i id="stPanic" style="width:${st.panic}%;background:linear-gradient(90deg,var(--treasure),var(--spend));transition:width .2s linear"></i></div>
          </div>
          <div id="stChart">${sparkline(st.line, 300, 62, 'var(--spend)')}</div>
          ${sh ? say(sh[0], esc(sh[1])) : say('bo', 'It is going to be fine. Probably. I say that every week too.')}
          <div class="card" style="box-shadow:none;border-style:dashed">
            <div class="eyebrow">Your plan, in your words</div>
            <p style="font-weight:650;font-size:14.5px">"I'm in for five years. I won't sell before then unless the company stops making anything."</p>
          </div>
          <div class="grow"></div>
          <button class="btn wide" style="background:var(--spend)" data-act="stSell">SELL EVERYTHING</button>
          <button class="btn ghost wide" data-act="stPlan" ${st.calmT > 0 ? 'disabled' : ''}>Re-read my plan · space</button>
          <p class="hint">Doing nothing is the move. It will not feel like one.</p>
        </div></div>`;
    },
  };
}
