/* stall.js — Stall of My Own, the flagship that absorbs Stall Rush (docs/12 §2.1).

   An eight-week season on Market Row. Each week is a Plan with no clock (buy
   stock from the wholesaler, set prices against a demand strip drawn from the
   season, read the forecast and the town calendar, put something in the cart
   jar), then about sixty seconds of Market day — Stall Rush's real-time stall,
   kept because it is fun — then the ledger page, which separates takings,
   what it cost, what went off, profit and the jar.

   This file draws and drives; it does no arithmetic on money. Every sum comes
   from stallsim.js (pure), the keepsake from sim.js, the wage from the
   arcade's one pay path (payout(), through the ctx arcade.js hands in), and
   the season lives on the child as `c.stall` so it carries over between
   sessions. Keyboard AND touch on every step. Loaded only when played. */
import { esc, sfx } from './ui.js';
import { money, stallMoney, sign } from './fmt.js';
import { ico, say } from './art.js';
import { BLD } from './buildings-gen.js';
import { plateSrc, verdict } from './gamefx.js';
import { R } from './runtime.js';
import * as sim from './sim.js';
import { mathsMet } from './ledger.js';
import { TIER_NAME } from './jobtable.js';
import { seasonSlip } from './keepsakes.js';
import * as S from './stallsim.js';

const K = () => sim.kid(R.s);
const M = (n) => stallMoney(n);
/* percentages are a display format the child must have met (docs/03 §1) */
const pctOk = (c) => { try { return mathsMet(c)('M10'); } catch (e) { return false; } };
const pct = (x) => Math.round(x * 100) + '%';
/* "₹4 kept from every ₹10": a ratio in coins, in the child's own currency sign */
const ten = (n) => sign() + n;
const tick = (on) => `<span class="so-tick${on ? ' on' : ''}" aria-hidden="true">${on ? '✓' : '·'}</span>`;

/* The credit offer (SA5): the total in coins, the choice left to the child, and no word
   that judges it either way — credit is a tool with a price, never a moral failing (rule 7). */
export function offerCard(s) {
  const o = S.offerFor(s);
  if (!o) return '';
  return `<div class="so-card so-offer" data-offer>
    <div class="so-h">${ico(o.goal.icon, o.goal.em, 20)} <b>The cart-maker has ${esc(o.goal.name.toLowerCase())} for you</b></div>
    <p class="small">${esc(o.goal.says)}</p>
    <div class="so-ways">
      <div><b>${M(o.now)}</b> now, out of the box.</div>
      <div><b>${M(o.weekly)}</b> a week for ${o.weeks} weeks: <b>${M(o.total)} in all</b>.</div>
    </div>
    <p class="small muted">Whichever you choose, it is yours from this week. The weekly payments come out on each market morning, with the rent.</p>
    <div class="so-btns">
      <button class="btn" data-act="soOffer" data-arg="now" ${o.canNow ? '' : 'disabled'}><span class="so-k">P</span> Pay ${M(o.now)} now</button>
      <button class="btn" data-act="soOffer" data-arg="credit"><span class="so-k">W</span> ${M(o.weekly)} a week · ${M(o.total)} in all</button>
      <button class="btn ghost" data-act="soOffer" data-arg="no"><span class="so-k">X</span> Not this time</button>
    </div>
    ${o.canNow ? '' : `<p class="small muted">The box holds ${M(s.cash - S.planCost(s) - s.draft.jar)} after this week's order, so paying all of it now is not possible this week.</p>`}
  </div>`;
}

export function stallGame(ctx, seed) {
  const c = K();
  if (!c.stall) c.stall = { season: null, seasons: 0, beaSaid: false };
  const meta = c.stall;
  const save = () => { if (R.s) sim.save(R.s); };
  let day = null, raf = 0, prev = 0, sel = -1;
  let week = null;          /* the ledger page just closed: { row, wage, bea } */
  let ended = null;         /* the season's end: { m, keep } */
  const sea = () => meta.season;

  const newSeason = (goal) => {
    const n = meta.seasons || 0;
    const sd = seed != null ? seed + n : ((Date.now() ^ (n * 7919)) >>> 0) % 2147483647;
    meta.season = S.newSeason(sd, ctx.tier, goal);
    week = null; ended = null; sel = -1; day = null;
    save(); sfx.click(); R.render();
  };

  /* ── the plan's rows, for the keyboard: each product's order, each price, the jar ── */
  const rows = () => {
    const s = sea(); if (!s) return [];
    const ids = S.level(s).products;
    return ids.map((id) => ['buy', id]).concat(ids.map((id) => ['price', id]), [['jar']]);
  };
  const nudge = (row, d) => {
    const s = sea();
    if (!row) return false;
    if (row[0] === 'buy') return S.setBuy(s, row[1], (s.draft.buy[row[1]] || 0) + d);
    if (row[0] === 'price') return S.setStep(s, row[1], s.draft.price[row[1]] + Math.sign(d));
    return S.setJar(s, s.draft.jar + Math.sign(d) * S.JAR_STEP * (Math.abs(d) > 1 ? 5 : 1));
  };
  const planAct = (n, arg) => {
    const s = sea();
    if (n === 'soSel') { sel = +arg; R.render(); return; }
    if (n === 'soBuy' || n === 'soStep') {
      const [id, d] = String(arg).split(':');
      const okd = n === 'soBuy' ? S.setBuy(s, id, (s.draft.buy[id] || 0) + +d) : S.setStep(s, id, s.draft.price[id] + +d);
      sel = rows().findIndex((r) => r[0] === (n === 'soBuy' ? 'buy' : 'price') && r[1] === id);
      if (!okd) { sfx.bad(); flash = 'The box does not hold enough for that.'; } else { sfx.click(); flash = ''; }
      save(); R.render(); return;
    }
    if (n === 'soJar') {
      const okd = S.setJar(s, s.draft.jar + (+arg) * S.JAR_STEP);
      sel = rows().length - 1;
      if (!okd) { sfx.bad(); flash = 'The box does not hold enough for that.'; } else { sfx.click(); flash = ''; }
      save(); R.render(); return;
    }
    if (n === 'soOffer') { if (S.answerOffer(s, arg)) { sfx.click(); save(); R.render(); } else sfx.bad(); return; }
    if (n === 'soOpen') { openStall(false); return; }
    if (n === 'soAuto') { openStall(true); }
  };
  let flash = '';

  /* ── market day ─────────────────────────────────────────────────────── */
  const openStall = (auto) => {
    const s = sea();
    if (!s || s.phase !== 'plan') return;
    S.openDay(s);
    save();
    if (auto) { finishDay(S.autoDay(s)); return; }
    day = S.makeDay(s); prev = 0;
    sfx.click(); R.render();
  };
  const finishDay = (res) => {
    const s = sea();
    stop();
    const row = S.closeWeek(s, res);
    day = null;
    if (!row) return;
    const wage = row.wageUnits > 0 ? ctx.payout(row.wageUnits) : { paid: 0, capped: false };
    /* the first time takings are high and profit is low, Bea from the stall next door says so */
    const bea = !meta.beaSaid && row.takings >= 2 * row.rent && row.profit < row.takings * 0.2;
    if (bea) meta.beaSaid = true;
    week = { row, wage, bea };
    if (s.phase === 'done') {
      const keep = sim.keepSeason(K(), s);
      ctx.goals(S.goalRun(s));
      meta.seasons = (meta.seasons || 0) + 1;
      ended = { m: S.summary(s), keep };
    }
    if (row.profit > 0) sim.badge(K(), 'profit-day');
    save(); sfx.level(); R.render();
  };
  const btnFor = (id) => (typeof document !== 'undefined' ? document.querySelector(`.gplay [data-act="soServe"][data-arg="${id}"]`) : null);
  const serve = (id) => {
    if (!day || day.st.done) return;
    const r = day.serve(id);
    if (r === 'sold') { sfx.coin(); R.render(); verdict(btnFor(id), true); }
    else if (r === 'wrong' || r === 'busy' || r === 'empty') { sfx.bad(); R.render(); if (typeof document !== 'undefined') verdict(btnFor(id), false); }
    else R.render();
    if (day && day.st.done) finishDay(day.result());
  };
  const restock = () => { if (day && day.restock()) { sfx.click(); R.render(); } else if (day) R.render(); };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  const step = (ts) => {
    raf = 0;
    if (!day) return;
    if (day.st.done) { finishDay(day.result()); return; }
    /* the wall's clock, not the frame rate's: a slow frame carries its real time */
    const dt = Math.min(1000, ts - (prev || ts)); prev = ts;
    const dirty = day.advance(dt);
    if (day.st.done) { finishDay(day.result()); return; }
    const tl = document.getElementById('soTime');
    if (tl) tl.textContent = Math.max(0, Math.ceil((day.st.len - day.st.t) / 1000));
    day.st.q.forEach((q) => { const b = document.getElementById('soP' + q.id); if (b) b.style.width = Math.max(0, q.patience * 100) + '%'; });
    const rb = document.getElementById('soRs');
    if (rb && day.st.restock > 0) rb.style.width = Math.round((1 - day.st.restock / sea().day.restockMs) * 100) + '%';
    if (dirty) R.render();
    raf = requestAnimationFrame(step);
  };

  /* ── views ──────────────────────────────────────────────────────────── */
  const chip = () => { const s = sea(); const t = s ? s.tier : ctx.tier; return `<span class="tierchip" data-tier="${t}">${TIER_NAME[t] || t}</span>`; };
  const stage = (inner, cls = '') => `<div class="stage so-stage ${cls}" style="--cover:url(${plateSrc(0)})">${inner}</div>`;

  const startView = () => {
    const L = S.LEVELS[ctx.tier] || S.LEVELS.standard;
    return `<div class="stack">${ctx.hud([chip(), 'A new season'])}
    ${stage(`
      <div class="so-card">
        <div class="eyebrow">Market Row · eight weeks</div>
        <h2 class="so-title">A stall of your own</h2>
        <p>Nana lends the stall a float of <b>${M(L.float)}</b> to start. It is the stall's money: every week you buy stock out of it, the pitch costs <b>${M(L.rent)}</b> on market morning, and what you take goes back in.</p>
        <p class="small muted">The season is on ${esc(TIER_NAME[ctx.tier] || ctx.tier)}: ${esc(L.says || '')}</p>
      </div>
      <div class="so-card"><div class="eyebrow">What are you saving for?</div>
        <div class="so-goals">${['cart', 'sign'].map((g, i) => `<button class="so-goal" data-act="soGoal" data-arg="${g}">
          <span class="so-k">${i + 1}</span>${ico(S.GOALS[g].icon, S.GOALS[g].em, 30)}
          <b>${esc(S.GOALS[g].name)} · ${M(L.goals[g])}</b><span class="small">${esc(S.GOALS[g].says)}</span></button>`).join('')}</div>
      </div>
      <p class="hint">Press 1 or 2, or tap one. You save for it in the cart jar, week by week.</p>`)}
    </div>`;
  };

  const planView = () => {
    const s = sea(), info = S.weekInfo(s), sum = S.planSummary(s), L = S.level(s), rs = rows();
    const isSel = (k, id) => { const r = rs[sel]; return r && r[0] === k && r[1] === id; };
    const cal = S.calendar(s).filter((e) => !e.past);
    const jarPct = Math.min(100, Math.round(((s.owned ? sum.goal : s.jar + sum.jar) / sum.goal) * 100));
    return `<div class="stack">${ctx.hud([chip(), `Week ${info.n} of ${info.of}`, `Box ${M(s.cash)}`, s.owned ? `${esc(S.GOALS[s.goal].id === 'cart' ? 'Cart' : 'Sign')} ✓` : `Jar ${M(s.jar)}`])}
    ${stage(`
      <div class="so-card so-ahead">
        <div class="eyebrow">The week ahead</div>
        ${info.weatherOn ? `<div class="so-row"><span class="so-ic">${ico(info.weather.icon, info.weather.em, 26)}</span><span class="grow"><b>${esc(info.weather.name)}</b><span class="small"> · ${esc(info.weather.says)}</span></span></div>`
          : `<div class="so-row"><span class="so-ic">${ico('suncloud', '⛅', 26)}</span><span class="grow"><b>Steady weather</b><span class="small"> · nothing in the sky changes what sells this season.</span></span></div>`}
        ${cal.length ? `<div class="so-cal">${cal.map((e) => `<div class="so-row${e.now ? ' now' : ''}"><span class="so-ic">${ico(e.icon, e.em, 20)}</span><span class="grow"><b>${e.now ? 'This week' : 'Week ' + (e.week + 1)}${e.len > 1 ? ' for ' + e.len + ' weeks' : ''}:</b> ${esc(e.title)}<span class="small"> · ${esc(e.says)}</span></span></div>`).join('')}</div>`
          : '<p class="small muted">Nothing on the town calendar for the rest of the season.</p>'}
      </div>
      ${offerCard(s)}
      <div class="so-card"><div class="eyebrow">The wholesaler · buy your stock</div>
        ${info.rows.map((r, i) => `<div class="so-row so-buy${isSel('buy', r.p.id) ? ' sel' : ''}" data-row="buy:${r.p.id}">
          <span class="so-ic">${ico(r.p.icon, r.p.em, 24)}<span class="so-k">${i + 1}</span></span>
          <span class="grow"><b>${esc(r.p.name)}</b> <span class="small">${M(r.cost)} each${r.cost !== r.usual ? ` (usually ${M(r.usual)})` : ''}</span>
            ${r.why ? `<span class="so-why small">${esc(r.why)}</span>` : ''}
            <span class="small muted">${r.p.perish && L.spoil ? `Goes off at the end of the week: ${esc(r.p.off)}.` : 'Keeps: what is left goes back in the crate.'}${r.carried ? ` <b>${r.carried} in the crate</b> from last week.` : ''}</span></span>
          <span class="so-step"><button class="btn ghost so-pm" data-act="soBuy" data-arg="${r.p.id}:-1" aria-label="One fewer ${esc(r.p.name)}" ${r.buy ? '' : 'disabled'}>−</button>
            <b class="tabnum so-n">${r.buy}</b>
            <button class="btn ghost so-pm" data-act="soBuy" data-arg="${r.p.id}:1" aria-label="One more ${esc(r.p.name)}">+</button></span>
        </div>`).join('')}
      </div>
      <div class="so-card"><div class="eyebrow">Your prices · about how many will pay</div>
        ${info.rows.map((r) => `<div class="so-row so-price${isSel('price', r.p.id) ? ' sel' : ''}" data-row="price:${r.p.id}">
          <span class="so-ic">${ico(r.p.icon, r.p.em, 22)}</span>
          <span class="grow"><b>${esc(r.p.name)}</b>
            <span class="so-strip" role="img" aria-label="About ${r.buyers} of ${r.foot} will pay ${M(r.price)}">${r.strip.map((x) => `<span class="so-cell${x.on ? ' on' : ''}" style="--h:${r.foot ? Math.round((x.buyers / r.foot) * 100) : 0}%"><i></i><b class="tabnum">${M(x.price)}</b><span class="tabnum">${x.buyers}</span></span>`).join('')}</span>
            <span class="small">About <b>${r.buyers}</b> of the ${r.foot} who want ${esc(r.p.name.toLowerCase())} this week will pay <b>${M(r.price)}</b>.</span></span>
          <span class="so-step"><button class="btn ghost so-pm" data-act="soStep" data-arg="${r.p.id}:-1" aria-label="Cheaper" ${r.step > 0 ? '' : 'disabled'}>◀</button>
            <b class="tabnum so-n">${M(r.price)}</b>
            <button class="btn ghost so-pm" data-act="soStep" data-arg="${r.p.id}:1" aria-label="Dearer" ${r.step < S.LADDER.length - 1 ? '' : 'disabled'}>▶</button></span>
        </div>`).join('')}
      </div>
      <div class="so-card so-row so-jar${rs[sel] && rs[sel][0] === 'jar' ? ' sel' : ''}" data-row="jar">
        <span class="so-ic">${ico(S.GOALS[s.goal].icon, S.GOALS[s.goal].em, 26)}</span>
        <span class="grow"><b>The cart jar</b> <span class="small">${s.owned ? `${esc(S.GOALS[s.goal].name)} is yours.` : `${M(s.jar)} saved of ${M(sum.goal)} for ${esc(S.GOALS[s.goal].name.toLowerCase())}. It buys it the morning it is full.`}</span>
          <span class="bar" style="height:7px;margin-top:5px"><i style="width:${jarPct}%;background:var(--grow)"></i></span></span>
        <span class="so-step"><button class="btn ghost so-pm" data-act="soJar" data-arg="-1" aria-label="Less into the jar" ${sum.jar ? '' : 'disabled'}>−</button>
          <b class="tabnum so-n">${M(sum.jar)}</b>
          <button class="btn ghost so-pm" data-act="soJar" data-arg="1" aria-label="More into the jar" ${s.owned ? 'disabled' : ''}>+</button></span>
      </div>
      <div class="so-card so-sum">
        <div class="so-line"><span>In the box</span><i></i><b class="tabnum">${M(sum.cash)}</b></div>
        <div class="so-line"><span>Stock you are buying</span><i></i><b class="tabnum">−${M(sum.stock)}</b></div>
        ${sum.jar ? `<div class="so-line"><span>Into the cart jar</span><i></i><b class="tabnum">−${M(sum.jar)}</b></div>` : ''}
        <div class="so-line"><span>Pitch rent, market morning</span><i></i><b class="tabnum">−${M(sum.rent)}</b></div>
        ${sum.credit ? `<div class="so-line"><span>Cart payment, market morning</span><i></i><b class="tabnum">−${M(sum.credit)}</b></div>` : ''}
        <div class="so-line total"><span>Left in the box on market morning</span><i></i><b class="tabnum${sum.after < 0 ? ' so-neg' : ''}">${M(sum.after)}</b></div>
        ${sum.after < 0 ? `<p class="small so-warn">That is broke on market morning: Nana would have to cover the rent, and it shows on the ledger.</p>` : ''}
        ${flash ? `<p class="small so-warn">${esc(flash)}</p>` : ''}
      </div>
      <div class="so-btns">
        <button class="btn wide" data-act="soOpen">Open the stall · market day →</button>
        <button class="btn ghost wide" data-act="soAuto">Auto-serve today · it costs a little goodwill</button>
      </div>
      <p class="hint">↑↓ pick a row · ←→ change it · 1–${L.products.length} jump to a product · ⏎ open the stall · A auto-serve</p>`)}
    </div>`;
  };

  const marketView = () => {
    const s = sea(), st = day.st, d = s.day, ids = S.level(s).products;
    const front = st.q[0], more = st.q.slice(1, 4), waiting = st.q.length - 1 - more.length;
    const busy = st.restock > 0;
    return `<div class="stack">${ctx.hud([chip(), `<span id="soTime">${Math.max(0, Math.ceil((st.len - st.t) / 1000))}</span>s`, `took ${M(st.takings)}`, `served ${st.served}`, `lost ${st.lost}`])}
    ${stage(`
      <div class="so-mkt">
        ${BLD.stall ? `<img class="so-stall" src="${BLD.stall.src}" alt="Your stall on Market Row" width="${BLD.stall.w}" height="${BLD.stall.h}">` : ''}
        <span class="eyebrow">Week ${d.week + 1} · market day</span>
      </div>
      <div class="so-queue" aria-live="polite">
        ${front ? `<div class="so-front so-cust" data-want="${front.want}">
            <span class="small">Next in line wants</span>
            <span class="so-want">${ico(S.PRODUCTS[front.want].icon, S.PRODUCTS[front.want].em, 34)}<b>${esc(S.PRODUCTS[front.want].name)}</b><span class="pill tabnum">${M(d.prices[front.want])}</span></span>
            <span class="bar so-pat"><i id="soP${front.id}" style="width:${Math.max(0, front.patience * 100)}%"></i></span>
          </div>` : `<div class="so-front so-empty"><span class="small">${st.next < st.arrivals.length ? 'Nobody yet. They come in ones and twos.' : 'That was everyone today.'}</span></div>`}
        <div class="so-line-up">${more.map((q) => `<span class="so-cust sm">${ico(S.PRODUCTS[q.want].icon, S.PRODUCTS[q.want].em, 18)}<span class="bar so-pat"><i id="soP${q.id}" style="width:${Math.max(0, q.patience * 100)}%"></i></span></span>`).join('')}
          ${waiting > 0 ? `<span class="small so-more">+${waiting} more</span>` : ''}</div>
      </div>
      ${st.msg ? `<p class="small so-msg${st.last === 'sold' ? '' : ' bad'}">${esc(st.msg)}</p>` : ''}
      <div class="so-counter" style="grid-template-columns:repeat(${ids.length},1fr)">
        ${ids.map((id, i) => `<button class="btn so-serve${st.counter[id] ? '' : ' ghost'}" data-act="soServe" data-arg="${id}" ${busy ? 'disabled' : ''}>
          <span class="so-k">${i + 1}</span>${ico(S.PRODUCTS[id].icon, S.PRODUCTS[id].em, 22)}
          <b>${esc(S.PRODUCTS[id].name)}</b><span class="tabnum">${st.counter[id]} out · ${st.back[id]} in crate</span></button>`).join('')}
      </div>
      <button class="btn ghost wide so-restock${busy ? ' busy' : ''}" data-act="soStock" ${busy ? 'disabled' : ''}>
        ${busy ? `Restocking… hands full <span class="bar"><i id="soRs" style="width:${Math.round((1 - st.restock / d.restockMs) * 100)}%"></i></span>` : `<span class="so-k">R</span> Restock the counter from the crates`}</button>
      <p class="hint">Serve the one at the front: 1–${ids.length}. A wrong one walks off. R restocks, and you cannot serve while you do.</p>`, 'so-market')}
    </div>`;
  };

  const ledgerView = () => {
    const s = sea(), { row, wage, bea } = week, c2 = K(), pc = pctOk(c2), L = S.level(s);
    const kept = S.keptOfTen(row.profit, row.takings);
    const wasteTen = row.stockCost > 0 ? Math.round((row.spoiledVal / row.stockCost) * 10) : 0;
    const sc = row.score.parts;
    const last = s.phase === 'done';
    const lines = Object.entries(row.lines);
    return `<div class="stack">${ctx.hud([chip(), `Week ${row.n} of ${S.WEEKS}`, 'The ledger'])}
    ${stage(`
      <div class="so-card so-ledger">
        <div class="eyebrow">Week ${row.n} · the ledger page</div>
        <div class="slip big so-slip">
          <div class="slip-head"><span>Your stall · Market Row</span><span>${esc(S.WEATHER[row.weather].name)}</span></div>
          <div class="slip-line"><span><b>Takings</b></span><i></i><b class="tabnum">${M(row.takings)}</b></div>
          ${lines.map(([id, l]) => `<div class="slip-line sub"><span>${l.sold} × ${esc(S.PRODUCTS[id].name.toLowerCase())} at ${M(l.price)}</span><i></i><span class="tabnum">${M(l.sold * l.price)}</span></div>`).join('')}
          <div class="slip-line"><span><b>What it cost</b></span><i></i><b class="tabnum">−${M(row.costs)}</b></div>
          <div class="slip-line sub"><span>Stock from the wholesaler</span><i></i><span class="tabnum">${M(row.stockCost)}</span></div>
          <div class="slip-line sub"><span>Pitch rent</span><i></i><span class="tabnum">${M(row.rent)}</span></div>
          ${row.credit ? `<div class="slip-line sub"><span>Cart payment</span><i></i><span class="tabnum">${M(row.credit)}</span></div>` : ''}
          <div class="slip-line"><span><b>Unsold and spoiled</b></span><i></i><span class="tabnum">${row.spoiledN ? M(row.spoiledVal) + ' went off' : 'nothing went off'}</span></div>
          ${lines.filter(([, l]) => l.spoiled).map(([id, l]) => `<div class="slip-line sub"><span>${l.spoiled} ${esc(S.PRODUCTS[id].name.toLowerCase())}: ${esc(S.PRODUCTS[id].off)}</span><i></i><span class="tabnum">${M(l.spoiled * l.cost)}</span></div>`).join('')}
          ${row.carriedN ? `<div class="slip-line sub"><span>${row.carriedN} left that keep, back in the crate for next week</span><i></i><span class="tabnum">${M(row.carriedVal)}</span></div>` : ''}
          <div class="slip-line total"><span>Profit</span><i></i><b class="tabnum${row.profit < 0 ? ' so-neg' : ''}">${row.profit >= 0 ? '+' : ''}${M(row.profit)}</b></div>
          <div class="slip-line"><span>Cart jar</span><i></i><span class="tabnum">${row.boughtGoal ? 'bought ' + esc(S.GOALS[s.goal].name.toLowerCase()) + '!' : row.owned ? esc(S.GOALS[s.goal].name) + ' is yours' : M(row.jar) + ' of ' + M(S.goalPrice(s))}</span></div>
          <div class="slip-line"><span>In the box now</span><i></i><span class="tabnum${row.cash < 0 ? ' so-neg' : ''}">${M(row.cash)}</span></div>
        </div>
        ${bea ? say('bea', 'Busy day. Now look at what it cost you.') : ''}
      </div>
      <div class="so-card">
        <div class="eyebrow">What the week is scored on · the decisions, not the profit</div>
        <div class="so-row">${tick(sc.margin >= 2)}<span class="grow"><b>Margin kept:</b> ${row.takings > 0 ? (kept > 0 ? `${ten(kept)} kept from every ${ten(10)} taken` : 'nothing kept: the costs ate every coin taken, and more') + (pc && kept > 0 ? ` (${pct(row.score.margin)})` : '') : 'nothing was taken'}.</span></div>
        ${L.spoil ? `<div class="so-row">${tick(sc.waste >= 1.5)}<span class="grow"><b>Waste:</b> ${ten(wasteTen)} of every ${ten(10)} spent on stock went off${pc ? ` (${pct(row.score.waste)})` : ''}.</span></div>` : ''}
        <div class="so-row">${tick(!row.broke)}<span class="grow"><b>A buffer:</b> ${row.broke ? 'broke on market morning: Nana covered the rent.' : 'money left in the box on market morning.'}</span></div>
        <div class="so-row">${tick(sc.fair >= 1.5)}<span class="grow"><b>Prices people pay:</b> ${row.buyers} of the ${row.foot} who wanted something would pay your prices${pc ? ` (${pct(row.score.fair)})` : ''}.</span></div>
        <div class="so-row">${tick(sc.jar > 0)}<span class="grow"><b>Saving:</b> ${row.owned ? 'the goal is yours.' : row.jarIn ? M(row.jarIn) + ' into the cart jar.' : 'nothing into the cart jar this week.'}</span></div>
        ${row.lost ? `<p class="small muted">${row.lost} customer${row.lost === 1 ? '' : 's'} walked off without buying${row.wrong ? `, ${row.wrong} of them served the wrong thing` : ''}.</p>` : ''}
        ${row.auto ? '<p class="small muted">Auto-served: everyone was served, and a few people noticed nobody was really there. A little less goodwill next week.</p>' : ''}
      </div>
      <p class="small so-pay">${wage.capped ? esc(ctx.cappedLine) : wage.paid ? `Earned ${money(wage.paid)} for the week, straight into your wallet.` : 'Nothing was sold, so nothing was earned this week.'}</p>
      <button class="btn wide" data-act="soNext">${last ? 'See the season →' : `On to week ${row.n + 1} →`}</button>`)}
    </div>`;
  };

  const doneView = () => {
    const s = sea(), m = (ended && ended.m) || S.summary(s), keep = (ended && ended.keep) || (K().keepsakes || []).find((k) => k.kind === 'season' && k.key === 'season:' + s.seed + ':' + s.tier), pc = pctOk(K());
    const g = S.GOALS[s.goal];
    return `<div class="stack">${ctx.hud([chip(), 'The season'])}
    ${stage(`
      <div class="so-card">
        <div class="eyebrow">Eight weeks on Market Row</div>
        <h2 class="so-title">${m.goal ? `${esc(g.name)}, in week ${m.goalWeek + 1}` : `The jar reached ${M(s.jar)} of ${M(S.goalPrice(s))}`}</h2>
        <div class="slip big so-slip">
          <div class="slip-line"><span>Nana's float at the start</span><i></i><span class="tabnum">${M(m.start)}</span></div>
          <div class="slip-line"><span>Takings, eight weeks</span><i></i><span class="tabnum">${M(m.takings)}</span></div>
          <div class="slip-line"><span>What it cost</span><i></i><span class="tabnum">−${M(m.costs)}</span></div>
          <div class="slip-line sub"><span>of which went off</span><i></i><span class="tabnum">${M(m.spoiled)}</span></div>
          <div class="slip-line"><span>In the box, and in the jar</span><i></i><span class="tabnum">${M(m.cash + m.jar)}</span></div>
          ${m.goal ? `<div class="slip-line"><span>${esc(g.name)}, worth what it cost</span><i></i><span class="tabnum">${M(m.goalValue)}</span></div>` : ''}
          ${m.owed ? `<div class="slip-line"><span>Still owed on it</span><i></i><span class="tabnum">−${M(m.owed)}</span></div>` : ''}
          <div class="slip-line total"><span>${m.change >= 0 ? 'More than you started with' : 'Less than you started with'}</span><i></i><b class="tabnum${m.change < 0 ? ' so-neg' : ''}">${m.change >= 0 ? '+' : ''}${M(m.change)}</b></div>
        </div>
        <p class="small">${S.keptOfTen(m.profit, m.takings) > 0 ? `${ten(S.keptOfTen(m.profit, m.takings))} kept from every ${ten(10)} taken` : 'Nothing kept from what was taken, once the costs were paid'}${pc && m.margin > 0 ? ` (${pct(m.margin)})` : ''}. ${m.brokeWeeks ? `Broke on ${m.brokeWeeks} market morning${m.brokeWeeks === 1 ? '' : 's'}.` : 'Never broke on a market morning.'}</p>
        ${keep ? `<div class="eyebrow" style="margin-top:8px">Kept for your Collection</div>${seasonSlip(keep, true)}` : m.goal ? '' : '<p class="small muted">A season with its goal is kept on your Collection shelf. This one goes in the ledger instead.</p>'}
      </div>
      ${say(m.change >= 0 && m.goal ? 'nana' : 'bea', m.change >= 0 && m.goal
        ? 'Eight weeks of small decisions, and the stall paid for its own cart. That is a business.'
        : m.change >= 0 ? 'The stall made money. Next season, decide what it is saving for in week one.'
        : 'Busy weeks and a lighter box. Look back at the ledger pages: the costs are where it went.')}
      <p class="practised"><b>You practised:</b> running a stall over weeks: stock, prices and waste — and that busy is not the same as profitable</p>
      ${ctx.endGoals()}
      <div class="so-btns">
        <button class="btn wide" data-act="soNew">Start a new season</button>
        <button class="btn ghost wide" data-act="gquit">Back to Play</button>
      </div>`)}
    </div>`;
  };

  /* which page: the season's own phase, plus the ledger page the child has not yet turned */
  const phase = () => {
    const s = sea();
    if (!s) return 'start';
    if (day) return 'market';
    if (week && !week.seen && (s.phase === 'ledger' || s.phase === 'done')) return 'ledger';
    if (s.phase === 'done') return 'done';
    if (s.phase === 'ledger') { S.nextWeek(s); week = null; }   /* back after a reload: the page was read */
    return s.phase === 'market' ? 'market' : 'plan';
  };

  const g = {
    id: 'so', ctxTier: ctx.tier,
    get season() { return sea(); }, get day() { return day; },
    serve, restock, openStall, finishDay, newSeason,
    mount() {
      const s = sea();
      /* a market day left half-way (a reload, a Leave) starts again with the same customers */
      if (s && s.phase === 'market' && !day) { day = S.makeDay(s); prev = 0; }
      if (s && s.phase === 'ledger' && !week) S.nextWeek(s);
      if (day && !raf && typeof requestAnimationFrame === 'function') { prev = 0; raf = requestAnimationFrame(step); }
    },
    stop,
    key(e) {
      const p = phase(), k = e.key;
      if (p === 'start') { if (k === '1') newSeason('cart'); else if (k === '2') newSeason('sign'); return; }
      if (p === 'market') { const n = parseInt(k, 10), ids = S.level(sea()).products; if (n >= 1 && n <= ids.length) serve(ids[n - 1]); else if (k === 'r' || k === 'R') restock(); return; }
      if (p === 'ledger') { if (k === 'Enter') g.act('soNext'); return; }
      if (p === 'done') { if (k === 'Enter') { ctx.quit(); R.render(); } else if (k === 'n' || k === 'N') g.act('soNew'); return; }
      /* plan */
      const rs = rows(), s = sea();
      if (k === 'ArrowDown') { sel = Math.min(rs.length - 1, sel + 1); R.render(); }
      else if (k === 'ArrowUp') { sel = Math.max(0, sel - 1); R.render(); }
      else if (k === 'ArrowRight' || k === 'ArrowLeft' || k === '+' || k === '-') {
        if (sel < 0) sel = 0;
        const d = (k === 'ArrowRight' || k === '+' ? 1 : -1) * (e.shiftKey ? 5 : 1);
        if (!nudge(rs[sel], d)) { sfx.bad(); flash = rs[sel][0] === 'price' ? '' : 'The box does not hold enough for that.'; } else { sfx.click(); flash = ''; }
        save(); R.render();
      } else if (/^[1-4]$/.test(k) && +k <= S.level(s).products.length) { sel = +k - 1; R.render(); }
      else if (k === 'Enter') {
        /* the shell holds Enter for games, so a focused button is pressed here rather than lost */
        const a = typeof document !== 'undefined' && document.activeElement;
        if (a && a.matches && a.matches('.gplay button[data-act]')) a.click(); else openStall(false);
      }
      else if (k === 'a' || k === 'A') openStall(true);
      else if (S.offerFor(s) && (k === 'p' || k === 'P')) planAct('soOffer', 'now');
      else if (S.offerFor(s) && (k === 'w' || k === 'W')) planAct('soOffer', 'credit');
      else if (S.offerFor(s) && (k === 'x' || k === 'X')) planAct('soOffer', 'no');
    },
    act(n, arg) {
      const p = phase();
      if (n === 'soGoal' && p === 'start') return newSeason(arg);
      if (n === 'soServe') return serve(arg);
      if (n === 'soStock') return restock();
      if (n === 'soNext') {
        const s = sea();
        if (s.phase === 'done') { week.seen = true; R.render(); return; }
        S.nextWeek(s); week = null; sel = -1; flash = ''; save(); sfx.click(); R.render(); return;
      }
      if (n === 'soNew') { meta.season = null; week = null; ended = null; save(); sfx.click(); R.render(); return; }
      if (p === 'plan') planAct(n, arg);
    },
    view() {
      const p = phase();
      if (p === 'start') return startView();
      if (p === 'market') { if (!day) g.mount(); return day ? marketView() : planView(); }
      if (p === 'ledger') return ledgerView();
      if (p === 'done') return doneView();
      return planView();
    },
  };
  return g;
}
