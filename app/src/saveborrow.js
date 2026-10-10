/* saveborrow.js — Save or Borrow? at the Bank (docs/12 §2.10).

   What borrowing really costs, and when it is worth it. Credit is a tool with a price
   (CONCEPT §6.6): the game never says "never borrow", and on Tricky it shows the loan
   that pays for itself — the bicycle that lets you take the delivery round.

   A round is three goals. Each goal: a thing, its price, a week's wage from a town job,
   and two to four paths. Step 1 the child TYPES a total (the borrowing path's, or on
   Easy what saving reaches by the sale) — a miss holds and shows the sum. Step 2 she
   picks a path and whether to keep a cushion; no path is labelled right (SB2). Step 3
   a calendar strip lives every path side by side. Step 4 the comparison card, in coins,
   and one question about it.

   Scored: each typed total, a plan that kept money in the purse through the surprise,
   and reading the card. Never scored: the path. Every sum is made by sim.js (SB1) — this
   module only says them, and test/saveborrow.mjs holds it to that.

   It rides in the arcade's chunk (arcade.js imports it), so the first screen never
   carries it. The arcade hands it a kit (hud, endCard, payout …) rather than this
   module importing arcade.js back. */
import { esc, sfx } from './ui.js';
import { money, sign } from './fmt.js';
import { ico } from './art.js';
import { BLD } from './buildings-gen.js';
import { plateSrc, verdict, still } from './gamefx.js';
import { R } from './runtime.js';
import * as sim from './sim.js';
import { mathsMet } from './ledger.js';

/* G8 · three levels. The paths are the level; the round is always three goals and the
   score is always out of the same set, so par is that set on every level. */
export const SB_POINTS = { predict: 6, buffer: 1, card: 1 };
export const SB_PAR = 3 * (SB_POINTS.predict + SB_POINTS.buffer + SB_POINTS.card);
export const SB_TIERS = {
  easy:     { par: SB_PAR, says: 'Save, or wait for the sale. No borrowing, no fees.' },
  standard: { par: SB_PAR, says: 'Adds borrowing now, with a flat fee spread over the weeks.' },
  tricky:   { par: SB_PAR, says: 'Two loans to compare — a fee every week or one fee at the end — and a thing that can earn its keep.' },
};
/* three goals, each a decision you can choose to make; they pay nothing */
export const SB_GOALS = [
  { id: 'predict', name: 'Every total predicted first time', check: (r) => r.predicts > 0 && r.predictRight === r.predicts },
  { id: 'buffer', name: 'A plan that kept money in the purse through every surprise', check: (r) => r.goals > 0 && r.buffers === r.goals },
  { id: 'card', name: 'Read every comparison card', check: (r) => r.goals > 0 && r.cardRight === r.goals },
];
/* what the wage is measured in: a full round pays about what a careful drill does */
const PAY_UNITS = 10;

/* how each path is said — the words only; every number comes from the goal (sim.js) */
const SAY = {
  save: { name: 'Saving', icon: 'jars' },
  sale: { name: 'Waiting for the sale', icon: 'calendar' },
  used: { name: 'Second-hand', icon: 'wrench' },
  borrow: { name: 'Borrowing', icon: 'handshake' },
  loanA: { name: 'The weekly-fee loan', icon: 'handshake' },
  loanB: { name: 'The one-fee loan', icon: 'iou' },
};
export function sbOffer(g, p) {
  if (p.id === 'save') return `Save your ${money(g.income)} a week, then buy it for ${money(p.price)}.`;
  if (p.id === 'sale') return `Wait: from week ${p.week} it is ${money(p.price)} in the sale.`;
  if (p.id === 'used') return `Buy one second-hand for ${money(p.price)}. It may need a repair: ${money(p.repair)} if it does.`;
  if (p.id === 'loanA') return `Have it now. Pay back ${money(p.weekly)} a week for ${p.n} weeks — ${money(p.fee)} of every week is the fee.`;
  if (p.id === 'loanB') return `Have it now. Pay back ${money(p.weekly)} a week for ${p.n} weeks, then a ${money(p.oneOff)} fee with the last one.`;
  return `Have it now. Pay back ${money(p.weekly)} a week for ${p.n} weeks.`;
}
/* what one path came to, said in coins — the comparison card's line for it. Every number is
   one sim.sbCompare made; `pct` adds the fee as a percent for a child who has met percents. */
const wk = (n) => `${n} week${n === 1 ? '' : 's'}`;
export function sbSaid(G, x, pct) {
  const having = G.thing.having;
  let t = `${SAY[x.id].name} cost ${money(x.cost)}${x.repaired ? ` (with a ${money(x.repaired)} repair)` : ''} and you were ${having} from week ${x.from}`;
  if (x.id !== 'save') {
    if (x.more && x.sooner) t += `: ${money(x.more)} for ${wk(x.sooner)} more of ${having}`;
    else if (x.less && x.later) t += `: ${money(x.less)} less, and ${wk(x.later)} later`;
    else if (x.less) t += `: ${money(x.less)} less, and ${x.sooner ? wk(x.sooner) + ' sooner' : 'from the same week'}`;
    else t += `: ${money(x.more)} more, ${x.later ? wk(x.later) + ' later' : 'from the same week'}`;
  }
  t += '.';
  if (x.fee > 0) t += pct ? ` The fee was ${money(x.fee)} — ${x.pct}% on top of the price.` : ` The fee was ${money(x.fee)} in coins.`;
  if (G.invest && x.dJob > 0) t += ` Having it sooner, ${G.invest.job} paid ${money(x.dJob)} more than it did on the saving path${x.fee > 0 ? (x.ahead ? `, so you finished ${money(x.ahead)} ahead of saving: this time the loan paid for itself` : `, and still finished ${money(x.behind)} behind saving: this time it did not pay for itself`) : ''}.`;
  return t;
}
export const SB_PRICE_LINE = 'Having it sooner has a price. Whether it is worth that price is yours to decide.';
/* one goal, said whole: what it is, each path's offer, and what each path came to with the tin
   kept — the game's own words, for My Feed to cut a goal the simulation has proved */
export function sbCard(G, pct = false) {
  const rows = sim.sbLive(G, true), cmp = sim.sbCompare(G, rows);
  const lines = [cmp.save, ...cmp.lines.filter((x) => x.id !== 'save')].map((x) => sbSaid(G, x, pct));
  return { title: G.thing.name.charAt(0).toUpperCase() + G.thing.name.slice(1), lines: [...G.paths.map((p) => `${SAY[p.id].name}: ${sbOffer(G, p)}`), ...lines, ...(G.invest ? [] : [SB_PRICE_LINE])] };
}
const askLine = (a) => `${money(a.a)} a week for ${a.b} weeks${a.extra ? `, then a ${money(a.extra)} fee` : ''}`;
const sumLine = (a) => `${money(a.a)} × ${a.b}${a.extra ? ` + ${money(a.extra)}` : ''} = ${money(a.want)}`;
const ICON = (name, size = 18) => ico(name, '', size);

export function saveBorrow(kit, seed = (Date.now() % 100000) | 0) {
  const level = kit.tier;
  const round = sim.sbRound(seed, level);
  const st = { seed, level, round, gi: 0, step: 'predict', ai: 0, typed: '', held: null, nudge: false,
    log: round.goals.map(() => ({ asks: [], path: null, cushion: null, rows: null, cmp: null, buffer: false, ans: null, ansOk: false })),
    week: 0, done: false, points: 0, won: 0 };
  let timer = 0;
  const g = () => round.goals[st.gi];
  const L = () => st.log[st.gi];
  const stop = () => { if (timer) clearInterval(timer); timer = 0; };
  const H = () => g().weeks;

  /* ── step 1 · predict ── */
  const typeKey = (d) => {
    if (st.step !== 'predict' || st.held) return;
    st.nudge = false;
    if (d === 'del') st.typed = st.typed.slice(0, -1);
    else if (/^\d$/.test(d) && st.typed.length < 7) st.typed = (st.typed === '0' ? '' : st.typed) + d;
    R.render();
  };
  const check = () => {
    if (st.step !== 'predict') return;
    if (st.held) {
      st.held = null; st.typed = '';
      if (st.ai + 1 < g().asks.length) st.ai++; else st.step = 'choose';
      sfx.click(); R.render(); return;
    }
    if (!st.typed) { st.nudge = true; R.render(); return; }
    const res = sim.sbCheck(g().asks[st.ai], st.typed);
    L().asks.push(res.ok);
    st.held = res;
    if (res.ok) sfx.good(); else sfx.bad();
    R.render();
    verdict('.gplay .sbtype', res.ok);
  };
  /* ── step 2 · choose (and the cushion) ── */
  const pickPath = (id) => {
    if (st.step !== 'choose' || !g().paths.some((p) => p.id === id)) return;
    L().path = id; st.step = 'cushion'; sfx.click(); R.render();
  };
  const pickCushion = (keep) => {
    if (st.step !== 'cushion') return;
    const l = L();
    l.cushion = !!keep;
    l.rows = sim.sbLive(g(), l.cushion);
    l.cmp = sim.sbCompare(g(), l.rows);
    l.buffer = l.rows.find((x) => x.id === l.path).broke == null;
    st.step = 'live'; sfx.click();
    /* the strip fast-forwards a week at a time; headless or under reduced motion it is all there at once */
    stop();
    if (typeof window !== 'undefined' && typeof setInterval === 'function' && !still()) {
      st.week = 0;
      timer = setInterval(() => { st.week++; if (st.week >= H()) stop(); R.render(); }, 360);
    } else st.week = H();
    R.render();
  };
  /* ── step 3 · live it ── */
  const skip = () => {
    if (st.step !== 'live') return;
    if (st.week < H()) { stop(); st.week = H(); sfx.click(); R.render(); return; }
    st.step = 'card'; sfx.click(); R.render();
  };
  /* ── step 4 · the comparison card and its question ── */
  const answer = (id) => {
    const l = L();
    if (st.step !== 'card' || l.ans != null || !g().paths.some((p) => p.id === id)) return;
    l.ans = id; l.ansOk = id === l.cmp.question.answer;
    if (l.ansOk) sfx.good(); else sfx.bad();
    R.render();
    verdict(`.gplay [data-act="sbAns"][data-arg="${id}"]`, l.ansOk);
  };
  const next = () => {
    if (st.step !== 'card' || L().ans == null) return;
    if (st.gi + 1 < round.goals.length) {
      st.gi++; st.step = 'predict'; st.ai = 0; st.typed = ''; st.held = null; st.week = 0;
      sfx.click(); R.render(); return;
    }
    finish();
  };
  const tally = () => {
    let predicts = 0, predictRight = 0, buffers = 0, cardRight = 0, points = 0;
    st.log.forEach((l, i) => {
      const n = round.goals[i].asks.length, okN = l.asks.filter(Boolean).length;
      predicts += n; predictRight += okN;
      points += (SB_POINTS.predict * okN) / n;
      if (l.buffer) { buffers++; points += SB_POINTS.buffer; }
      if (l.ansOk) { cardRight++; points += SB_POINTS.card; }
    });
    return { goals: round.goals.length, predicts, predictRight, buffers, cardRight, points: Math.round(points) };
  };
  function finish() {
    stop();
    const run = tally();
    st.points = run.points; st.run = run; st.done = true; st.step = 'done';
    st.won = kit.finish(Object.assign({ par: SB_PAR }, run));
    R.render();
  }

  /* ── drawing ── */
  const goalCard = () => {
    const G = g();
    return `<div class="gcard sbgoal">
      <img class="sbbank" src="${BLD.bank.src}" alt="" aria-hidden="true">
      <span class="eyebrow">At the Bank · goal ${st.gi + 1} of ${round.goals.length}</span>
      <div class="sbthing"><span class="em">${ICON(G.thing.icon, 40)}</span>
        <div><b class="sbname">${esc(cap(G.thing.name))}: ${money(G.price)}</b>
        <span class="small">You earn ${money(G.income)} a week: ${esc(G.job)}, ${G.shifts === 1 ? 'one shift' : G.shifts + ' shifts'} a week.</span></div></div>
      ${G.invest ? `<p class="small sbinvest">${ICON('work', 16)} With it you could take ${esc(G.invest.job)}: ${money(G.invest.pay)} a week more, from the week after you have it.</p>` : ''}
      <p class="small muted sbsurp">Surprises happen. Nobody knows when.</p>
    </div>`;
  };
  const pathList = (asButtons) => g().paths.map((p, i) => {
    const s = SAY[p.id];
    const inner = `<span class="k">${i + 1}</span><span class="sbpi">${ICON(s.icon)}</span><span class="sbpt"><b>${esc(p.name)}</b><span class="small">${sbOffer(g(), p)}</span></span>`;
    return asButtons
      ? `<button class="opt sbpath" data-act="sbPath" data-arg="${p.id}" data-path="${p.id}">${inner}</button>`
      : `<div class="opt sbpath sbshow" data-path="${p.id}">${inner}</div>`;
  }).join('');

  const predictView = () => {
    const G = g(), a = G.asks[st.ai], h = st.held;
    const q = a.kind === 'saved'
      ? `Saving every coin, how much is in your purse by week ${a.b}, when the sale starts?`
      : G.asks.length > 1 ? `Before you choose: ${SAY[a.path].name.toLowerCase()} — how much do you hand over in all?`
      : 'Before you choose: if you borrow, how much do you hand over in all?';
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0'];
    return `${goalCard()}
      <div class="gcard sbask">
        <span class="eyebrow">Step 1 · predict${G.asks.length > 1 ? ` · ${st.ai + 1} of ${G.asks.length}` : ''}</span>
        <p class="sbq">${esc(q)}</p>
        <p class="sbline">${a.kind === 'saved' ? `${money(a.a)} a week for ${a.b} weeks` : askLine(a)}</p>
        <div class="sbtype${h ? (h.ok ? ' ok' : ' no') : ''}" role="status" aria-live="polite" aria-label="Your total">
          <span class="sbcur">${esc(sign())}</span><b class="tabnum">${esc(st.typed || '')}</b>${h ? '' : '<i class="sbcaret" aria-hidden="true"></i>'}</div>
        ${h ? `<div class="sbhold ${h.ok ? 'ok' : 'no'}">${h.ok ? 'Spot on.' : `Not this time — you typed ${money(h.typed || 0)}.`} <b>${sumLine(a)}</b></div>
          <button class="btn wide" data-act="sbCheck">Continue →</button>`
        : `${st.nudge ? '<p class="small sbnudge">Type a number first: the keys, or the pad.</p>' : ''}
          <div class="sbpad">${keys.map((k) => `<button class="sbkey" data-act="sbKey" data-arg="${k}" aria-label="${k === 'del' ? 'delete' : k}">${k === 'del' ? '⌫' : k}</button>`).join('')}
            <button class="sbkey go" data-act="sbCheck">Check</button></div>`}
      </div>
      <span class="eyebrow sbon">The paths on offer</span>
      <div class="sbpaths">${pathList(false)}</div>
      <p class="hint">Type the total, or tap the pad. Enter checks it.</p>`;
  };
  const chooseView = () => `${goalCard()}
    <div class="gcard sbask"><span class="eyebrow">Step 2 · choose a path</span>
      <p class="sbq">Each of these can work. Which would you take?</p></div>
    <div class="sbpaths">${pathList(true)}</div>
    <p class="hint">Number keys, or tap a path.</p>`;
  const cushionView = () => {
    const G = g(), p = G.paths.find((x) => x.id === L().path);
    return `${goalCard()}
      <div class="gcard sbask"><span class="eyebrow">Step 2 · and a cushion?</span>
        <p class="sbq">You picked: <b>${esc(p.name)}</b>. Surprises happen. Keep some back?</p></div>
      <div class="sbpaths">
        <button class="opt sbcush" data-act="sbCushion" data-arg="0"><span class="k">1</span><span class="sbpt"><b>Put every coin towards it</b><span class="small">All ${money(G.income)} of each week goes to the plan.</span></span></button>
        <button class="opt sbcush" data-act="sbCushion" data-arg="1"><span class="k">2</span><span class="sbpt"><b>Keep ${money(G.cushion)} a week in a tin</b><span class="small">The tin is only for surprises. The plan never touches it.</span></span></button>
      </div>
      <p class="hint">Press 1 or 2, or tap.</p>`;
  };
  const evMark = { surprise: '!', repair: '⚒', short: '✕', fee: '+' };
  const liveView = () => {
    const G = g(), l = L(), w = Math.min(st.week, G.weeks), end = w >= G.weeks;
    const rows = l.rows.map((x) => {
      const cur = w > 0 ? x.weeks[w - 1] : { has: 0 };
      const cells = x.weeks.map((k) => {
        if (k.w > w) return '<i class="c"></i>';
        const ev = k.ev.find((e) => evMark[e]);
        return `<i class="c on${k.own ? ' own' : ''}${k.ev.includes('repay') ? ' owe' : ''}${k.ev.includes('short') ? ' short' : ''}${k.ev.includes('surprise') ? ' surp' : ''}" title="Week ${k.w}">${ev ? evMark[ev] : ''}</i>`;
      }).join('');
      const mine = x.id === l.path;
      return `<div class="sbrow${mine ? ' mine' : ''}" data-path="${x.id}">
        <div class="sbrh"><b>${esc(x.name)}</b>${mine ? '<span class="pill">your plan</span>' : ''}<span class="grow"></span><span class="tabnum small">purse ${money(cur.has)}</span></div>
        <div class="sbcells" style="--n:${G.weeks}">${cells}</div>
        ${end ? `<p class="small sbsum">Paid ${money(x.cost)} in all · had it ${x.owned} week${x.owned === 1 ? '' : 's'}${x.fee ? ` · fee ${money(x.fee)}` : ''}${x.repaired ? ` · repair ${money(x.repaired)}` : ''}${x.job ? ` · ${esc(G.invest.job)} paid ${money(x.job)}` : ''} ·
          ${x.broke == null ? `the purse covered ${esc(G.surprise.what)}` : `week ${x.broke} left it ${money(x.short)} short`}</p>` : ''}
      </div>`;
    }).join('');
    /* re-drawn every week as it fast-forwards: dealt once, never re-popped (it flickered) */
    return `<div class="gcard sbask${st.week > 0 ? ' still' : ''}"><span class="eyebrow">Step 3 · live it · ${esc(cap(G.thing.name))}</span>
        <p class="sbq">Week <b class="tabnum">${w}</b> of ${G.weeks}${w >= G.surprise.week ? ` · week ${G.surprise.week}: ${esc(G.surprise.what)}, ${money(G.surprise.cost)}` : ''}</p>
        <div class="sbstrip">${rows}</div>
        <p class="small muted sbleg"><i class="c on own"></i> have it <i class="c on owe"></i> paying back <i class="c on surp">!</i> surprise <i class="c on short">✕</i> short${l.cushion ? ` · the tin: ${money(G.cushion)} a week` : ''}</p>
      </div>
      <button class="btn wide" data-act="sbSkip">${end ? 'The comparison →' : `Skip to week ${G.weeks}`}</button>
      <p class="hint">Enter to ${end ? 'go on' : 'skip ahead'}.</p>`;
  };
  const cardView = () => {
    const G = g(), l = L(), c = l.cmp, s = c.save, pct = mathsMet(kit.K())('M10');
    const said = (x) => `<li data-path="${x.id}">${ICON(SAY[x.id].icon, 16)} <span>${esc(sbSaid(G, x, pct))}</span></li>`;
    const mine = c.lines.find((x) => x.id === l.path);
    const q = c.question, ansName = SAY[q.answer].name;
    const ans = c.lines.find((x) => x.id === q.answer);
    return `<div class="gcard sbcard"><span class="eyebrow">Step 4 · the comparison</span>
        <ul class="sblines">${said(s)}${c.lines.filter((x) => x.id !== 'save').map(said).join('')}</ul>
        <p class="small sbmine"><b>Your plan:</b> ${mine.broke == null ? `the purse still had money after ${esc(G.surprise.what)} in week ${G.surprise.week}${l.cushion ? ' — the tin took it' : ''}.` : `the purse ran ${money(mine.short)} short in week ${mine.broke}.`}</p>
        ${G.invest ? '' : `<p class="small muted">${SB_PRICE_LINE}</p>`}
      </div>
      <div class="gcard sbask"><p class="sbq"><b>${q.kind === 'most' ? 'Which path cost the most in all?' : 'Which path cost the least in all?'}</b></p></div>
      <div class="sbpaths">${G.paths.map((p, i) => {
        const k = l.ans == null ? '' : p.id === q.answer ? ' ok' : p.id === l.ans ? ' no' : '';
        const x = c.lines.find((y) => y.id === p.id);
        return `<button class="opt sbans${k}" data-act="sbAns" data-arg="${p.id}" data-path="${p.id}" ${l.ans != null ? 'disabled' : ''}><span class="k">${i + 1}</span><b>${esc(SAY[p.id].name)}</b>${l.ans != null ? ` <span class="small tabnum">${money(x.cost)}</span>` : ''}</button>`;
      }).join('')}</div>
      ${l.ans != null ? `<div class="sbhold ${l.ansOk ? 'ok' : 'no'}">${l.ansOk ? 'Yes' : 'Look again'}: ${esc(ansName)} cost ${money(ans.cost)}, the ${q.kind === 'most' ? 'most' : 'least'} in all.</div>
        <button class="btn wide" data-act="sbNext">${st.gi + 1 < round.goals.length ? 'Next goal →' : 'How it went →'}</button>` : ''}
      <p class="hint">Number keys, or tap. Enter for the next one.</p>`;
  };

  return {
    id: 'sb', st, stop,
    /* for the tests: drive the round the way the keys and taps do */
    act(n, arg) {
      if (n === 'sbKey') typeKey(String(arg));
      else if (n === 'sbCheck') check();
      else if (n === 'sbPath') pickPath(String(arg));
      else if (n === 'sbCushion') pickCushion(String(arg) === '1');
      else if (n === 'sbSkip') skip();
      else if (n === 'sbAns') answer(String(arg));
      else if (n === 'sbNext') next();
    },
    key(e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '')) return;
      const k = e.key;
      if (st.done) { if (k === 'Enter') { kit.quit(); R.render(); } return; }
      const n = parseInt(k, 10), paths = g().paths;
      if (st.step === 'predict') {
        if (/^\d$/.test(k)) typeKey(k);
        else if (k === 'Backspace') typeKey('del');
        else if (k === 'Enter') check();
      } else if (st.step === 'choose') { if (n >= 1 && n <= paths.length) pickPath(paths[n - 1].id); }
      else if (st.step === 'cushion') { if (n === 1 || n === 2) pickCushion(n === 2); }
      else if (st.step === 'live') { if (k === 'Enter' || k === ' ') skip(); }
      else if (st.step === 'card') {
        if (n >= 1 && n <= paths.length) answer(paths[n - 1].id);
        else if (k === 'Enter') next();
      }
    },
    view() {
      if (st.done) {
        const r = st.run;
        return `<div class="stack">${kit.hud(['Done', kit.tierChip()])}
          ${kit.endCard(r.points >= SB_PAR - 2 ? '🏅' : 'think', `${r.points} of ${SB_PAR}`,
            `<span class="sbendsub">Totals predicted: ${r.predictRight} of ${r.predicts} · money left through the surprise: ${r.buffers} of ${r.goals} · cards read: ${r.cardRight} of ${r.goals}</span>`,
            st.won, 'Borrowing is a tool with a price. The price is the <b>total</b>, not the weekly — and now and then, when the thing earns its keep, it pays for itself.', 'nana')}</div>`;
      }
      const label = { predict: 'Predict', choose: 'Choose', cushion: 'Choose', live: 'Live it', card: 'Compare' }[st.step];
      const body = st.step === 'predict' ? predictView() : st.step === 'choose' ? chooseView() : st.step === 'cushion' ? cushionView() : st.step === 'live' ? liveView() : cardView();
      const plate = plateSrc(2);
      return `<div class="stack">
        ${kit.hud([kit.tierChip(), `Goal ${st.gi + 1} / ${round.goals.length}`, label])}
        <div class="stage sbstage" data-step="${st.step}"${plate ? ` style="--cover:url(${plate})"` : ''}>${body}</div></div>`;
    },
  };
}
const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
