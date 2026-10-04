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
function st() {
  return (R.lib = R.lib || { loanU: 60, loanW: 8, growU: 100, growY: 5, payU: 20, inU: 20, rentU: 6, foodU: 5, funU: 3, saveU: 4, n1: 4, p1U: 16, n2: 10, p2U: 35 });
}

/* the numbers each tool shows, worked out by sim.js */
export function figures(c, s = st()) {
  const loan = sim.loanOffer(c, s.loanU, s.loanW);
  const grow = { amount: price(s.growU), years: s.growY }; grow.after = sim.growWhatIf(c, grow.amount, s.growY);
  const split = sim.splitWhatIf(c, price(s.payU));
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

export function viewLibrary() {
  const c = K(), s = st(), f = figures(c, s), m = (n) => money(n);
  const tools = [
    tool({ id: 'loan', title: 'The loan explorer', line: "The Bank's own prices. Drag and watch what borrowing costs — nothing is borrowed here.", pic: art('bank'), needs: 'M6',
      body: `${slider('loanU', 'Borrow', 20, 200, 20, s.loanU, (v) => m(price(v)))}${slider('loanW', 'Pay it back over', 2, 16, 1, s.loanW, (v) => v + ' pay days')}
        <div class="loansplit" id="lo-split" role="img" aria-label="borrowed against its price"><i style="flex:${f.loan.amount}"><span id="lo-amt">${m(f.loan.amount)} borrowed</span></i><i class="cost" style="flex:${Math.max(f.loan.cost, f.loan.total * 0.08)}"><span id="lo-cost">${m(f.loan.cost)} price</span></i></div>
        <p class="small" style="margin-top:8px">Borrowing <b id="lo-amt2">${m(f.loan.amount)}</b> costs <b id="lo-cost2" style="color:var(--spend)">${m(f.loan.cost)}</b>. You pay back <b id="lo-week">${m(f.loan.perWeek)}</b> each pay day, <b id="lo-total">${m(f.loan.total)}</b> in all. The longer you keep it, the more it costs — that is the price of having it now.</p>` }),
    tool({ id: 'grow', title: 'The snowball', line: "The town's one bank rate, a fifty-second each pay day. Drag the years.", pic: art('yard'), needs: 'M10',
      body: `${slider('growU', 'Leave in the bank', 20, 400, 20, s.growU, (v) => m(price(v)))}${slider('growY', 'For', 1, 30, 1, s.growY, (v) => v + (v > 1 ? ' years' : ' year'))}
        <p class="lbig"><span id="gr-after">${m(f.grow.after)}</span></p><p class="small muted">The town's own rate moves, and this is not a forecast — it shows what waiting does.</p>` }),
    tool({ id: 'split', title: 'Your jar split', line: 'Your own pay-day rule, on a pay you choose. Change the rule in the Jar Shed.', pic: art('jars'), needs: 'M7',
      body: `${slider('payU', 'A pay day of', 10, 100, 10, s.payU, (v) => m(price(v)))}
        <div class="splitbar" id="sp-bar">${splitBar(f.split)}</div><p class="small splitlegend" id="sp-legend">${splitLegend(f.split)}</p>` }),
    tool({ id: 'week', title: 'The budget sandbox', line: 'A pretend week: what comes in, what goes out, what is left. Nothing here touches your town.', pic: art('stall'), needs: 'M5',
      body: `${slider('inU', 'Comes in', 5, 40, 1, s.inU, (v) => m(price(v)))}${[['rentU', 'Rent'], ['foodU', 'Food'], ['funU', 'Fun'], ['saveU', 'Save']].map(([k, l]) => slider(k, l, 0, 20, 1, s[k], (v) => m(price(v)))).join('')}
        <p class="lbig" id="wk-left" style="color:${f.week.left >= 0 ? 'var(--grow)' : 'var(--spend)'}">${f.week.left >= 0 ? m(f.week.left) + ' left' : m(-f.week.left) + ' short'}</p>` }),
    tool({ id: 'unit', title: 'The unit price checker', line: 'Two packs of the same thing. Which is cheaper for one?', pic: art('shop'), needs: 'M8',
      body: `<div class="lgrid">${slider('n1', 'Pack A holds', 1, 12, 1, s.n1, (v) => v)}${slider('p1U', 'Pack A costs', 2, 40, 1, s.p1U, (v) => m(price(v)))}${slider('n2', 'Pack B holds', 1, 12, 1, s.n2, (v) => v)}${slider('p2U', 'Pack B costs', 2, 40, 1, s.p2U, (v) => m(price(v)))}</div>
        <p class="lbig" id="un-out">${unitLine(f.unit)}</p>` }),
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
const one = (n) => (Math.abs(n - Math.round(n)) < 0.005 ? money(n) : moneyExact(n));
const unitLine = (u) => u.better === 0 ? `Both cost ${one(u.u1)} for one` : `Pack ${u.better === 1 ? 'A' : 'B'} is cheaper: ${one(Math.min(u.u1, u.u2))} for one, not ${one(Math.max(u.u1, u.u2))}`;

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
  const wl = document.getElementById('wk-left');
  if (wl) { wl.textContent = f.week.left >= 0 ? m(f.week.left) + ' left' : m(-f.week.left) + ' short'; wl.style.color = f.week.left >= 0 ? 'var(--grow)' : 'var(--spend)'; }
  set('un-out', unitLine(f.unit));
}
if (typeof document !== 'undefined') document.addEventListener('input', live);
