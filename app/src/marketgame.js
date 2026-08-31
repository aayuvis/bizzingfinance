/* marketgame.js — the playable surface for the Market Game.

   Five phases, and the order is the lesson: you cannot buy anything until
   you have READ something and said what you think will hurt it. Study, then
   commit, then live with it. Long only — a short is unlimited loss scored on
   outcome, and that is a hair from the gambling mechanics CONCEPT §6.3 bans.

     PICK    choose a decade. Four acts, four different worlds.
     STUDY   the description, the annual report, the shareholder letter
     ASSESS  say what would hurt this company. Scored on the REASON.
     INVEST  allocate. You may only buy what you studied.
     PLAY    a year a turn. Events land. Prices move. You may act.
     REVIEW  what happened, why, and what your assessment got right.

   Nothing here scores a child on return alone (CONCEPT §6.3): the end card
   ranks the quality of the thinking beside the money, and they come apart
   often enough to be the point.                                            */

import { esc, sfx, toast, clamp, sparkline } from './ui.js';
import { money, price } from './fmt.js';
import { say, ico } from './art.js';
import { COMPANIES, SECTORS, byId as coById } from '../content/companies.js';
import { simulate, priceSeries, explainYear, GAME_YEARS } from './gamemarket.js';
import { annualReport, shareholderLetter } from './reports.js';
import * as sim from './sim.js';
import { R } from './runtime.js';

const K = () => sim.kid(R.s);
export const ACTS = [
  { id: 0, name: 'The long boom',   from: 0,  years: 10, blurb: 'Money is cheap and everything is going up. The hard part is telling luck from judgement.' },
  { id: 1, name: 'When it turned',  from: 10, years: 10, blurb: 'Rates rise, and the businesses that borrowed to grow find out what it cost.' },
  { id: 2, name: 'The squeeze',     from: 20, years: 10, blurb: 'Prices climb faster than wages. Who can pass it on, and who eats it?' },
  { id: 3, name: 'The new thing',   from: 30, years: 10, blurb: 'Something arrives that makes half this list look old. Which half?' },
];

/* Eight companies an act, drawn across sectors so there is always something
   to compare against something. Deterministic from the seed. */
export function castFor(seed, act) {
  const out = [];
  SECTORS.forEach((s, i) => {
    const pool = COMPANIES.filter((c) => c.sector === s.id);
    out.push(pool[(seed + act * 7 + i * 3) % pool.length]);
  });
  return out;
}

/* ── the assessment. One question per company, and it is always the same
   question, because it is the one that matters: what would hurt this? ── */
export function assessOptions(c) {
  const d = c.dna;
  const cand = [
    { id: 'rate',    t: 'The bank raising interest rates',      w: d.rateSens * (1 + d.debt) },
    { id: 'infl',    t: 'Prices rising faster than it can charge', w: (1 - d.pricing) * 3 },
    { id: 'slump',   t: 'A recession cutting what people buy',   w: d.cyc * 1.6 },
    { id: 'newtech', t: 'Something new making it unnecessary',   w: d.disrupt * 3.2 },
  ];
  const best = cand.reduce((a, b) => (b.w > a.w ? b : a));
  return { options: cand, answer: best.id,
    why: {
      rate: `It carries ${d.debt.toFixed(1)}× its revenue in borrowings and a rate sensitivity of ${d.rateSens.toFixed(1)}. When money gets dearer, this one feels it first.`,
      infl: `It can only pass on about ${Math.round(d.pricing * 100)}% of a cost rise. The rest comes straight out of the margin.`,
      slump: `Its earnings swing ${d.cyc.toFixed(1)}× as hard as the economy. A mild slowdown is not mild here.`,
      newtech: `Roughly ${Math.round(d.disrupt * 100)}% of what it does could be replaced by something better. That is the risk that does not announce itself.`,
    }[best.id] };
}

export function newGame(seed) {
  return { seed, act: null, year: 0, phase: 'pick', studied: [], assessed: {},
    cash: 10000, holdings: {}, opened: {}, log: [], score: { right: 0, asked: 0 } };
}

/* The simulation is heavy-ish; hold one per seed for the session. */
const sims = new Map();
export function simFor(seed) {
  if (!sims.has(seed)) sims.set(seed, simulate(seed, GAME_YEARS));
  return sims.get(seed);
}

export function portfolioValue(g) {
  const s = simFor(g.seed);
  return Object.entries(g.holdings).reduce((t, [id, units]) =>
    t + units * s.years[id][g.year].value, 0);
}
export function netWorth(g) { return g.cash + portfolioValue(g); }

/* ── actions ─────────────────────────────────────────────────────────── */
export function startAct(g, act) {
  g.act = act; g.year = ACTS[act].from; g.phase = 'study';
  g.studied = []; g.assessed = {}; g.holdings = {}; g.cash = 10000;
  g.startWorth = 10000; g.log = [];
  return g;
}
export function study(g, id) { if (!g.studied.includes(id)) g.studied.push(id); }
export function assess(g, id, pick) {
  const c = coById[id], a = assessOptions(c);
  const right = pick === a.answer;
  g.assessed[id] = { pick, right, answer: a.answer };
  g.score.asked++; if (right) g.score.right++;
  return { right, answer: a.answer, why: a.why, label: a.options.find((o) => o.id === a.answer).t };
}
export function buy(g, id, amount) {
  const s = simFor(g.seed);
  const amt = Math.min(Math.round(amount), g.cash);
  if (amt <= 0 || !g.studied.includes(id)) return 0;
  const px = s.years[id][g.year].value;
  g.cash -= amt;
  g.holdings[id] = (g.holdings[id] || 0) + amt / px;
  return amt;
}
export function sell(g, id) {
  const s = simFor(g.seed);
  const u = g.holdings[id] || 0;
  if (u <= 0) return 0;
  const v = Math.round(u * s.years[id][g.year].value);
  g.holdings[id] = 0; g.cash += v;
  return v;
}
export function advance(g) {
  const act = ACTS[g.act];
  if (g.year >= act.from + act.years - 1) { g.phase = 'review'; return null; }
  const before = netWorth(g);
  g.year++;
  const s = simFor(g.seed);
  const after = netWorth(g);
  const seen = s.calendar[g.year].filter((e) =>
    e.scope.kind !== 'company' || g.studied.includes(e.scope.company));
  g.log.unshift({ year: g.year, before, after, events: seen });
  if (g.log.length > 12) g.log.length = 12;
  return { year: g.year, before, after, events: seen };
}

/* ══ the view ═══════════════════════════════════════════════════════════ */
const pctTone = (x) => (x >= 0 ? 'var(--grow)' : 'var(--spend)');
const arrow = (x) => (x >= 0 ? '▲' : '▼');

export function viewMarketGame() {
  const c = K();
  if (!c.game) c.game = newGame((c.market && c.market.seed) || 1);
  const g = c.game;
  if (g.phase === 'pick') return viewPick(g);
  if (g.phase === 'study') return viewStudy(g);
  if (g.phase === 'invest') return viewInvest(g);
  if (g.phase === 'review') return viewReview(g);
  return viewPlay(g);
}

function shell(g, body, sub) {
  const act = g.act === null ? null : ACTS[g.act];
  return `<div class="stack">
    <button class="btn ghost" style="align-self:flex-start" data-act="nav" data-arg="arcade">← Leave</button>
    ${act ? `<div class="card" style="border-color:var(--action)">
      <div class="row"><div class="grow"><div class="eyebrow">Act ${g.act + 1} of 4 · ${esc(act.name)}</div>
        <h3 style="font-size:17px;margin:1px 0">Year ${g.year - act.from + 1} of ${act.years}</h3>
        <p class="small muted">${esc(sub || act.blurb)}</p></div>
        <div style="text-align:right"><div class="eyebrow">Worth</div>
          <div class="big" style="font-size:20px">${money(netWorth(g))}</div></div></div>
    </div>` : ''}
    ${body}</div>`;
}

function viewPick(g) {
  return `<div class="stack">
    <button class="btn ghost" style="align-self:flex-start" data-act="nav" data-arg="arcade">← Leave</button>
    ${say('bo', 'Forty companies, forty years, and none of them exist. Everything that happens to them happens for a reason you can find. Pick a decade.')}
    ${ACTS.map((a) => `<button class="card" data-act="mgAct" data-arg="${a.id}" style="text-align:left;width:100%">
      <div class="eyebrow">Act ${a.id + 1} · years ${a.from + 1}–${a.from + a.years}</div>
      <h3 style="font-size:19px;margin:3px 0 4px">${esc(a.name)}</h3>
      <p class="small muted">${esc(a.blurb)}</p></button>`).join('')}
    <p class="small muted" style="text-align:center">You can only buy what you have studied, and you
      can only go long. Nothing here is real money or a real company.</p>
  </div>`;
}

function viewStudy(g) {
  const cast = castFor(g.seed, g.act);
  const s = simFor(g.seed);
  const open = g.opened.co ? coById[g.opened.co] : null;
  if (open) return shell(g, companySheet(g, open, s), 'Read it, then say what would hurt it.');

  const ready = g.studied.length >= 3;
  return shell(g, `
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Study the market</div>
        <p class="small muted">Read at least three before you may invest. The report is the truth;
          the letter is what they would like you to think.</p></div>
        <span class="pill ${ready ? 'grow' : ''}">${g.studied.length}/8 read</span></div>
    </div>
    ${cast.map((co) => {
      const done = g.studied.includes(co.id);
      const a = g.assessed[co.id];
      const sec = SECTORS.find((x) => x.id === co.sector);
      return `<button class="card" data-act="mgOpen" data-arg="${co.id}" style="text-align:left;width:100%">
        <div class="row">${ico('sec-' + co.sector, sec.em, 28)}
          <div class="grow"><b style="font-size:15px">${esc(co.name)}</b>
            <span class="pill" style="margin-left:6px">${co.ticker}</span>
            <p class="small muted">${esc(co.what)}</p></div>
          ${a ? `<span class="pill ${a.right ? 'grow' : ''}">${a.right ? '✓ assessed' : 'assessed'}</span>`
             : done ? '<span class="pill">read</span>' : ''}
        </div></button>`;
    }).join('')}
    <button class="btn wide" data-act="mgToInvest" ${ready ? '' : 'disabled'}>
      ${ready ? 'Ready to invest →' : `Read ${3 - g.studied.length} more first`}</button>`);
}

function companySheet(g, co, s) {
  const y = g.year;
  const rep = annualReport(s, co.id, y);
  const let_ = shareholderLetter(s, co.id, y);
  const sec = SECTORS.find((x) => x.id === co.sector);
  const a = assessOptions(co);
  const done = g.assessed[co.id];
  const hist = priceSeries(s, co.id).slice(Math.max(0, y - 8), y + 1);

  return `
    <div class="card">
      <div class="row">${ico('sec-' + co.sector, sec.em, 34)}
        <div class="grow"><h3 style="font-size:19px;margin:0">${esc(co.name)}</h3>
          <span class="pill">${co.ticker}</span> <span class="small muted">${esc(sec.name)}</span></div></div>
      <p style="margin-top:10px">${esc(co.what)}</p>
      <div class="sep" style="margin:11px 0"></div>
      <div class="small"><b>How it earns</b> — ${esc(co.how)}</div>
      <div class="small" style="margin-top:5px"><b>Who pays</b> — ${esc(co.who)}</div>
      <div class="small" style="margin-top:5px"><b>What could hurt it</b> — ${esc(co.risk)}</div>
      <div class="small muted" style="margin-top:8px">Model: ${esc(co.model)}</div>
      ${sparkline(hist, 300, 44, 'var(--action)')}
      <p class="small muted">Its price over the last ${hist.length - 1} years.</p>
    </div>

    <div class="card">
      <div class="eyebrow">Annual report · year ${y + 1}</div>
      <div style="margin-top:9px">
        ${rep.lines.map((l) => `<div class="row" style="padding:5px 0;border-bottom:1px solid var(--line-soft)">
          <span class="grow small">${l.k}</span>
          <b style="font-variant-numeric:tabular-nums">${l.v}</b>
          <span class="small" style="min-width:62px;text-align:right;color:${l.up ? 'var(--grow)' : 'var(--spend)'}">${l.d}</span></div>`).join('')}
      </div>
      <div class="eyebrow" style="margin-top:13px">What those mean</div>
      ${rep.ratios.map((r) => `<div style="margin-top:8px">
        <div class="row"><span class="grow small"><b>${esc(r.k)}</b></span>
          <b style="font-variant-numeric:tabular-nums">${r.v}</b></div>
        <div class="small muted">${esc(r.note)}</div></div>`).join('')}
    </div>

    <div class="card" style="background:var(--surface2)">
      <div class="eyebrow">Letter to shareholders</div>
      <p style="margin-top:8px;font-style:italic">${esc(let_.open)}</p>
      ${let_.body.map((b) => `<p class="small" style="margin-top:7px">${esc(b)}</p>`).join('')}
      <p class="small" style="margin-top:7px;font-style:italic">${esc(let_.close)}</p>
      ${done && let_.omissions.length ? `<div style="margin-top:11px;background:var(--gold-tint);
        color:var(--treasure-deep);border-radius:var(--r-md);padding:10px 12px">
        <div class="eyebrow" style="color:var(--treasure-deep)">What it did not say</div>
        ${let_.omissions.map((o) => `<div class="small" style="margin-top:4px">· ${esc(o)}</div>`).join('')}
      </div>` : ''}
    </div>

    <div class="card" style="border-color:var(--action)">
      <div class="eyebrow">Your assessment</div>
      <h3 style="font-size:17px;margin:3px 0 9px">What would hurt this company most?</h3>
      ${done
        ? `<div style="background:${done.right ? 'var(--grow-tint)' : 'var(--spend-tint)'};
            color:${done.right ? 'var(--grow)' : 'var(--spend)'};padding:11px 13px;border-radius:var(--r-md);font-weight:700">
            ${done.right ? 'Yes — ' : 'Not quite. The biggest is '}${esc(a.options.find((o) => o.id === a.answer).t.toLowerCase())}</div>
          <p class="small muted" style="margin-top:9px">${esc(a.why)}</p>`
        : `<div class="stack" style="gap:8px">${a.options.map((o) =>
            `<button class="opt" data-act="mgAssess" data-arg="${co.id}:${o.id}">${esc(o.t)}</button>`).join('')}</div>`}
      <button class="btn wide ghost" style="margin-top:12px" data-act="mgClose">← Back to the list</button>
    </div>`;
}

function viewInvest(g) {
  const s = simFor(g.seed);
  return shell(g, `
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Put your money somewhere</div>
        <p class="small muted">Only what you studied. Long only — you are buying a share of a
          business, not betting against one.</p></div>
        <div style="text-align:right"><div class="eyebrow">Cash</div>
          <div class="big" style="font-size:19px">${money(g.cash)}</div></div></div>
    </div>
    ${g.studied.map((id) => {
      const co = coById[id], px = s.years[id][g.year].value;
      const u = g.holdings[id] || 0;
      const a = g.assessed[id];
      return `<div class="card">
        <div class="row"><div class="grow"><b style="font-size:15px">${esc(co.name)}</b>
          <span class="pill" style="margin-left:5px">${co.ticker}</span>
          <p class="small muted">${esc(co.model)}</p></div>
          <div style="text-align:right"><div class="small muted">held</div>
            <b>${u > 0 ? money(u * px) : '—'}</b></div></div>
        ${a && !a.right ? '<p class="small" style="margin-top:6px;color:var(--spend)">You misread what its main risk was.</p>' : ''}
        <div class="row" style="gap:7px;margin-top:9px;flex-wrap:wrap">
          <button class="btn sm" data-act="mgBuy" data-arg="${id}:1000" ${g.cash < 1000 ? 'disabled' : ''}>Buy ${money(1000)}</button>
          <button class="btn sm ghost" data-act="mgBuy" data-arg="${id}:2500" ${g.cash < 2500 ? 'disabled' : ''}>${money(2500)}</button>
          <span class="grow"></span>
          <button class="btn ghost sm" data-act="mgSell" data-arg="${id}" ${u <= 0 ? 'disabled' : ''}>Sell</button>
        </div></div>`;
    }).join('')}
    <button class="btn wide" data-act="mgPlay" ${Object.values(g.holdings).every((u) => !u) ? 'disabled' : ''}>
      Start the decade →</button>`);
}

function viewPlay(g) {
  const s = simFor(g.seed);
  const act = ACTS[g.act];
  const last = g.log[0];
  const w = s.years[g.studied[0]][g.year];
  return shell(g, `
    ${last ? `<div class="card" style="border-color:${last.after >= last.before ? 'var(--grow)' : 'var(--spend)'}">
      <div class="row"><div class="grow"><div class="eyebrow">Year ${last.year - act.from + 1}</div>
        <h3 style="font-size:18px;margin:2px 0;color:${pctTone(last.after - last.before)}">
          ${arrow(last.after - last.before)} ${money(Math.abs(last.after - last.before))}</h3></div></div>
      ${last.events.length ? `<div class="stack" style="gap:8px;margin-top:10px">
        ${last.events.slice(0, 4).map((e) => `<div style="background:var(--surface2);border:1px solid var(--line);
          border-radius:var(--r-md);padding:10px 12px">
          <div class="row"><span class="pill">${e.scope.kind}</span>
            <span class="pill" style="margin-left:5px">${e.tag}</span></div>
          <b style="font-size:14px;display:block;margin-top:5px">${esc(e.head)}</b>
          <div class="small muted">${esc(e.body)}</div></div>`).join('')}
      </div>` : '<p class="small muted" style="margin-top:8px">A quiet year. They happen.</p>'}
    </div>` : ''}

    <div class="card">
      <div class="eyebrow">The world</div>
      <div class="row" style="gap:16px;margin-top:8px;flex-wrap:wrap">
        <span><div class="eyebrow">Bank rate</div><b style="font-size:16px">${w.rate.toFixed(2)}%</b></span>
        <span><div class="eyebrow">Prices</div><b style="font-size:16px">${w.inflation.toFixed(1)}%</b></span>
        <span><div class="eyebrow">The economy</div><b style="font-size:16px">${w.growth >= 0 ? '+' : ''}${w.growth.toFixed(1)}%</b></span>
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">What you hold</div>
      <div class="stack" style="gap:8px;margin-top:10px">
        ${g.studied.filter((id) => (g.holdings[id] || 0) > 0).map((id) => {
          const co = coById[id], px = s.years[id][g.year].value;
          const x = explainYear(s, id, g.year);
          return `<div style="background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:10px 12px">
            <div class="row"><b class="grow" style="font-size:14px">${esc(co.name)}</b>
              <b style="color:${pctTone(x.move)}">${arrow(x.move)} ${Math.abs(x.move * 100).toFixed(1)}%</b>
              <b style="margin-left:9px;font-variant-numeric:tabular-nums">${money(g.holdings[id] * px)}</b></div>
            ${x.reasons.length ? `<div class="small muted" style="margin-top:5px">Because ${esc(x.reasons[0])}.</div>` : ''}
            <button class="btn ghost sm" style="margin-top:8px" data-act="mgSell" data-arg="${id}">Sell it</button>
          </div>`;
        }).join('')}
        ${g.cash > 0 ? `<div class="row"><span class="grow small muted">Cash, doing nothing</span><b>${money(g.cash)}</b></div>` : ''}
      </div>
    </div>
    <button class="btn wide" data-act="mgNext">Next year →</button>`);
}

function viewReview(g) {
  const act = ACTS[g.act];
  const end = netWorth(g), start = g.startWorth || 10000;
  const ret = end / start - 1;
  const s = simFor(g.seed);
  const cast = castFor(g.seed, g.act);
  const best = cast.map((co) => ({ co, m: s.years[co.id][g.year].value / s.years[co.id][act.from].value - 1 }))
    .sort((a, b) => b.m - a.m);
  return `<div class="stack">
    <div class="card" style="border-color:var(--gold);background:var(--gold-tint)">
      <div style="text-align:center"><div style="font-size:40px">${ret >= 0 ? '📈' : '📉'}</div>
        <div class="eyebrow">${esc(act.name)} · ten years</div>
        <h2 style="margin:4px 0 2px;font-size:26px">${money(end)}</h2>
        <p style="color:${pctTone(ret)};font-weight:800">${arrow(ret)} ${Math.abs(ret * 100).toFixed(0)}% from ${money(start)}</p></div>
    </div>
    <div class="card">
      <div class="eyebrow">How well you read them</div>
      <h3 style="font-size:20px;margin:4px 0">${g.score.right} of ${g.score.asked} right</h3>
      <p class="small muted">This is the number that matters. Money over ten years is partly the
        decade you were handed; whether you could see what would hurt a business is yours.</p>
    </div>
    <div class="card">
      <div class="eyebrow">What the decade did</div>
      <div class="stack" style="gap:7px;margin-top:9px">
        ${best.map((b) => `<div class="row"><span class="grow small">${esc(b.co.name)}</span>
          <b style="color:${pctTone(b.m)};font-variant-numeric:tabular-nums">${arrow(b.m)} ${Math.abs(b.m * 100).toFixed(0)}%</b>
          <span class="pill" style="margin-left:7px">${(g.holdings[b.co.id] || 0) > 0 ? 'held' : '—'}</span></div>`).join('')}
      </div>
    </div>
    ${say('bea', ret >= 0
      ? 'A good decade. Now do the next one, where the rate goes the other way, and find out how much of that was you.'
      : 'A hard decade. Everyone gets one. The question is whether the things you got wrong were the things you said would go wrong.')}
    <button class="btn wide" data-act="mgPick">Choose another decade →</button>
  </div>`;
}
