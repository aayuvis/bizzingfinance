/* library.js — every money tool in one place, with a picture (audit v4, H1 "Library breadth",
   H2 "let the child drag the loan length and watch the price", H4 "a sandbox budget planner").

   Each tool is a what-if on the town's own rules — the bank's loan pricing, its one rate, the
   child's own pay-day split — computed in sim.js (which owns the money) and touching nothing
   in the child's town. A tool waits until the child has met the maths it uses (ledger.mathsMet),
   exactly as every other surface does. Sliders update in place, so a drag never re-draws the
   page under the thumb; they move by keyboard (arrows) and by touch. */
import { R } from './runtime.js';
import * as sim from './sim.js';
import * as ledger from './ledger.js';
import { esc } from './ui.js';
import { ico } from './art.js';
import { money, moneyExact, price } from './fmt.js';
import { BLD } from './buildings-gen.js';
import { pipPose } from './shell.js';

const K = () => sim.kid(R.s);
const JAR = { spend: ['Spend', 'var(--spend)'], save: ['Save', 'var(--save)'], grow: ['Grow', 'var(--grow)'], give: ['Give', 'var(--give)'] };

/* the explorers' starting points, in units (re-priced per currency at render) */
export const LIB_START = { loanU: 60, loanW: 8, growU: 100, growY: 5, payU: 20, inU: 20, rentU: 6, foodU: 5, funU: 3, saveU: 4, n1: 4, p1U: 16, n2: 10, p2U: 35 };
function st() {
  return (R.lib = R.lib || { ...LIB_START });
}

/* WHAT EACH TOOL IS, AND WHAT IT SAYS — as data over the figures sim.js works out. `v` holds
   them already said in money; `b(key, text)` lets the view wrap a value so a drag updates it in
   place (the screen) or leaves it plain (My Feed, which cuts the same words at a tool's own
   starting points). */
const plainB = (k, t) => t;
export const LIB_TOOLS = {
  loan: { title: 'The loan explorer', line: "The Bank's own prices. Drag and watch what borrowing costs — nothing is borrowed here.", needs: 'M6' },
  grow: { title: 'The snowball', line: "The town's one bank rate, a fifty-second each pay day. Drag the years.", needs: 'M10' },
  split: { title: 'Your jar split', line: 'Your own pay-day rule, on a pay you choose. Change the rule in the Jar Shed.', needs: 'M7' },
  week: { title: 'The budget sandbox', line: 'A pretend week: what comes in, what goes out, what is left. Nothing here touches your town.', needs: 'M5' },
  unit: { title: 'The unit price checker', line: 'Two packs of the same thing. Which is cheaper for one?', needs: 'M8' },
};
export const LIB_SAYS = {
  loan: (v, b = plainB) => `Borrowing ${b('amt2', v.amount)} costs ${b('cost2', v.cost)}. You pay back ${b('week', v.week)} each pay day, ${b('total', v.total)} in all. The longer you keep it, the more it costs — that is the price of having it now.`,
  grow: () => "The town's own rate moves, and this is not a forecast — it shows what waiting does.",
  week: (v, b = plainB) => `${b('in', v.inn)} comes in. ${b('out', v.out)} goes out on rent, food, fun and the Save jar, so ${v.pos ? `${b('left', v.left)} is left` : `it is ${b('left', v.short)} short`}.`,
  weekBig: (v) => (v.pos ? v.left + ' left' : v.short + ' short'),
  packs: (v) => `Pack A holds ${v.n1} for ${v.p1}. Pack B holds ${v.n2} for ${v.p2}.`,
  unit: (v) => (v.better === 0 ? `Both cost ${v.u1} for one` : `Pack ${v.better === 1 ? 'A' : 'B'} is cheaper: ${v.lo} for one, not ${v.hi}`),
};
/* a figure said in money, for the templates above */
export function libSaid(f) {
  const m = (n) => money(n), one = (n) => (Math.abs(n - Math.round(n)) < 0.005 ? money(n) : moneyExact(n));
  return {
    loan: f.loan && { amount: m(f.loan.amount), cost: m(f.loan.cost), week: m(f.loan.perWeek), total: m(f.loan.total) },
    week: { pos: f.week.left >= 0, inn: m(f.week.inn), out: m(f.week.out), left: m(Math.max(0, f.week.left)), short: m(Math.max(0, -f.week.left)) },
    unit: { n1: f.unit.n1, n2: f.unit.n2, p1: m(f.unit.p1), p2: m(f.unit.p2), better: f.unit.better, u1: one(f.unit.u1), lo: one(Math.min(f.unit.u1, f.unit.u2)), hi: one(Math.max(f.unit.u1, f.unit.u2)) },
  };
}

/* the numbers each tool shows, worked out by sim.js (with no child, only the tools that read
   nothing of hers: the week and the unit price) */
export function figures(c, s = st()) {
  const loan = c && sim.loanOffer(c, s.loanU, s.loanW);
  const grow = c && { amount: price(s.growU), years: s.growY }; if (grow) grow.after = sim.growWhatIf(c, grow.amount, s.growY);
  const split = c && sim.splitWhatIf(c, price(s.payU));
  const week = sim.weekWhatIf(price(s.inU), [{ k: 'Rent', a: price(s.rentU) }, { k: 'Food', a: price(s.foodU) }, { k: 'Fun', a: price(s.funU) }, { k: 'Save', a: price(s.saveU) }]);
  const unit = { ...sim.unitWhatIf(s.n1, price(s.p1U), s.n2, price(s.p2U)), n1: s.n1, n2: s.n2, p1: price(s.p1U), p2: price(s.p2U) };
  return { loan, grow, split, week, unit };
}

const slider = (key, lab, min, max, step, val, fmt) => `<label class="lslide"><span>${esc(lab)} <b id="lv-${key}">${fmt(val)}</b></span>
  <input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-lib="${key}" aria-label="${esc(lab)}"></label>`;
const art = (name) => (BLD[name] ? `<img class="ltool-art" src="${BLD[name].src}" alt="" loading="lazy">` : '');
const wait = (m) => `<p class="small muted ltool-wait">${ico('lock', '🔒', 14)} This one waits for maths you have not met yet (rung ${esc(m)}). It opens on its own.</p>`;

function tool({ id, title, line, pic, needs, body }) {
  const c = K(), met = ledger.mathsMet(c), ok = !needs || met(needs);
  return `<section class="card ltool" id="tool-${id}" data-focus="tool:${id}">
    <div class="ltool-h">${pic}<div><h2>${esc(title)}</h2><p class="small muted">${esc(line)}</p></div></div>
    ${ok ? body : wait(needs)}</section>`;
}

const LIVE = { amt2: 'lo-amt2', cost2: 'lo-cost2', week: 'lo-week', total: 'lo-total', in: 'wk-in', out: 'wk-out', left: 'wk-left2' };
const liveB = (k, t) => `<b id="${LIVE[k]}"${k === 'cost2' ? ' style="color:var(--spend)"' : ''}>${t}</b>`;
export function viewLibrary() {
  const c = K(), s = st(), f = figures(c, s), m = (n) => money(n), said = libSaid(f);
  const tools = [
    tool({ id: 'loan', ...LIB_TOOLS.loan, pic: art('bank'),
      body: `${slider('loanU', 'Borrow', 20, 200, 20, s.loanU, (v) => m(price(v)))}${slider('loanW', 'Pay it back over', 2, 16, 1, s.loanW, (v) => v + ' pay days')}
        <div class="loansplit" id="lo-split" role="img" aria-label="borrowed against its price"><i style="flex:${f.loan.amount}"><span id="lo-amt">${m(f.loan.amount)} borrowed</span></i><i class="cost" style="flex:${Math.max(f.loan.cost, f.loan.total * 0.08)}"><span id="lo-cost">${m(f.loan.cost)} price</span></i></div>
        <p class="small" style="margin-top:8px">${LIB_SAYS.loan(said.loan, liveB)}</p>` }),
    tool({ id: 'grow', ...LIB_TOOLS.grow, pic: art('yard'),
      body: `${slider('growU', 'Leave in the bank', 20, 400, 20, s.growU, (v) => m(price(v)))}${slider('growY', 'For', 1, 30, 1, s.growY, (v) => v + (v > 1 ? ' years' : ' year'))}
        <p class="lbig"><span id="gr-after">${m(f.grow.after)}</span></p><p class="small muted">${LIB_SAYS.grow()}</p>` }),
    tool({ id: 'split', ...LIB_TOOLS.split, pic: art('jars'),
      body: `${slider('payU', 'A pay day of', 10, 100, 10, s.payU, (v) => m(price(v)))}
        <div class="splitbar" id="sp-bar">${splitBar(f.split)}</div><p class="small splitlegend" id="sp-legend">${splitLegend(f.split)}</p>` }),
    tool({ id: 'week', ...LIB_TOOLS.week, pic: art('stall'),
      body: `${slider('inU', 'Comes in', 5, 40, 1, s.inU, (v) => m(price(v)))}${[['rentU', 'Rent'], ['foodU', 'Food'], ['funU', 'Fun'], ['saveU', 'Save']].map(([k, l]) => slider(k, l, 0, 20, 1, s[k], (v) => m(price(v)))).join('')}
        <p class="lbig" id="wk-left" style="color:${f.week.left >= 0 ? 'var(--grow)' : 'var(--spend)'}">${LIB_SAYS.weekBig(said.week)}</p><p class="small" id="wk-say">${LIB_SAYS.week(said.week, liveB)}</p>` }),
    tool({ id: 'unit', ...LIB_TOOLS.unit, pic: art('shop'),
      body: `<div class="lgrid">${slider('n1', 'Pack A holds', 1, 12, 1, s.n1, (v) => v)}${slider('p1U', 'Pack A costs', 2, 40, 1, s.p1U, (v) => m(price(v)))}${slider('n2', 'Pack B holds', 1, 12, 1, s.n2, (v) => v)}${slider('p2U', 'Pack B costs', 2, 40, 1, s.p2U, (v) => m(price(v)))}</div>
        <p class="lbig" id="un-out">${LIB_SAYS.unit(said.unit)}</p>` }),
    `<a class="card ltool ltool-link" href="#/words" data-focus="tool:words"><div class="ltool-h">${pipPose('think', 64)}<div><h2>Money Words</h2><p class="small muted">Every word, in plain English, with a "for instance".</p></div></div></a>`,
    `<a class="card ltool ltool-link" href="#/sources" data-focus="tool:sources"><div class="ltool-h">${pipPose('point', 64)}<div><h2>How we know</h2><p class="small muted">Where every number in Bizzington comes from — and which are the town's own.</p></div></div></a>`,
  ];
  return `<div class="stack library"><header class="shero"><div><span class="eyebrow">The Library</span><h1>Tools to try things on</h1>
      <p class="small">Drag a number and watch what happens. Nothing here spends, saves or borrows your money.</p></div></header>
    <div class="ltools">${tools.join('')}</div></div>`;
}
const splitBar = (sp) => sp.filter((x) => x.a > 0).map((x) => `<i style="flex:${x.a};background:${JAR[x.k][1]}"><span>${JAR[x.k][0]}</span></i>`).join('');
/* the whole split in words, so a thin segment never hides its amount */
const splitLegend = (sp) => sp.map((x) => `<b style="color:${JAR[x.k][1]}">${JAR[x.k][0]}</b> ${money(x.a)}`).join(' · ');

/* a slider moved: update the figures in place (no re-render under the thumb) */
function live(e) {
  const el = e.target; if (!el || !el.dataset || !el.dataset.lib) return;
  const s = st(), key = el.dataset.lib; s[key] = +el.value;
  const c = K(), f = figures(c, s), m = (n) => money(n), set = (id, t) => { const x = document.getElementById(id); if (x) x.textContent = t; };
  const lab = { loanU: m(price(s.loanU)), loanW: s.loanW + ' pay days', growU: m(price(s.growU)), growY: s.growY + (s.growY > 1 ? ' years' : ' year'), payU: m(price(s.payU)), n1: s.n1, n2: s.n2 };
  set('lv-' + key, lab[key] != null ? lab[key] : m(price(s[key])));
  set('lo-amt', m(f.loan.amount) + ' borrowed'); set('lo-cost', m(f.loan.cost) + ' price'); set('lo-week', m(f.loan.perWeek)); set('lo-total', m(f.loan.total));
  const ls = document.getElementById('lo-split'); if (ls) { ls.children[0].style.flex = f.loan.amount; ls.children[1].style.flex = Math.max(f.loan.cost, f.loan.total * 0.08); }
  set('gr-after', m(f.grow.after));
  const sb = document.getElementById('sp-bar');
  if (sb) sb.innerHTML = splitBar(f.split);
  const sl = document.getElementById('sp-legend'); if (sl) sl.innerHTML = splitLegend(f.split);
  set('lo-amt2', m(f.loan.amount)); set('lo-cost2', m(f.loan.cost));
  const said = libSaid(f), wl = document.getElementById('wk-left');
  if (wl) { wl.textContent = LIB_SAYS.weekBig(said.week); wl.style.color = f.week.left >= 0 ? 'var(--grow)' : 'var(--spend)'; }
  const ws = document.getElementById('wk-say'); if (ws) ws.innerHTML = LIB_SAYS.week(said.week, liveB);
  set('un-out', LIB_SAYS.unit(said.unit));
}
if (typeof document !== 'undefined') document.addEventListener('input', live);
