/* keepsakes.js — the things she keeps, and the morning after.

   Two of the three motivators live here. ACCUMULATE: a keepsake is an object
   she owns because of something she did. The first receipt is the item, the
   shifts that paid for it and the weeks they took — counted from her own
   ledger (sim.buyFromShop), never guessed. RETURN: the overnight card is what
   is WAITING when she comes back — a letter, the bell, the companion, the
   board — measured from the state on the day it flips (sim.touchDay). Never
   a lost streak, never a thing that "happened" while the sim was not running:
   the editorial policy bans streak pressure, and this is its opposite, a list
   of what is there for her. */
import * as sim from './sim.js';
import * as co from './companion.js';
import { companionFigure } from './companionview.js';
import { ico } from './art.js';
import { esc, nWord } from './ui.js';
import { money, shortDate } from './fmt.js';

/* ── the receipt: paper, because it is paper ──────────────────────────── */
export function receiptSlip(k, big) {
  const n = (x, w) => `${x} ${x === 1 ? w : w + 's'}`;
  const paid = k.shifts
    ? (k.covered ? `Paid for by ${n(k.shifts, 'shift')} over ${n(k.weeks, 'week')}.`
                 : `${n(k.shifts, 'shift')} went into it, and the rest came from what you already had.`)
    : 'Bought before your first shift — from what you already had.';
  return `<div class="slip${big ? ' big' : ''}">
    <div class="slip-head"><span>Bizzington General Store</span><span>${shortDate(k.t)}</span></div>
    <div class="slip-line"><span>${ico(k.em, k.em, 18)} ${esc(k.item)}</span><i></i><b class="tabnum">${money(k.price)}</b></div>
    <div class="slip-line total"><span>Paid</span><i></i><b class="tabnum">${money(k.price)}</b></div>
    <p class="small">${paid}</p>
    <div class="slip-foot">${esc(k.who)} · level ${k.level} · the first receipt</div>
  </div>`;
}

const cap = (w) => String(w).charAt(0).toUpperCase() + String(w).slice(1);

/* ── the morning after ────────────────────────────────────────────────── */
export function overnightCard(c, state) {
  const o = c.overnight;
  if (!o || o.seen) return '';
  const rows = [];
  if (o.fuse) rows.push(['postbox', 'A letter you were expecting', 'Something you decided has come due.', true]);
  else if (!c.postbox.answered) rows.push(['postbox', 'A letter came', 'One a day. Thirty seconds.']);
  if (sim.payDue(c, state)) rows.push(['payday', 'The bell is ready to ring', 'Wages in, bills out' + (co.has(c) ? `, ${esc(co.get(c).name)}'s food among them.` : '.'), true]);
  if (co.has(c) && co.canPlay(c)) rows.push(['play', `${esc(co.get(c).name)} waited by the door`, 'A play is free, once a day.']);
  const jobs = sim.jobsToday(c).length;
  if (jobs) rows.push([null, `${cap(nWord(jobs))} ${jobs === 1 ? 'shift' : 'shifts'} on the board`, 'Fresh today, on Market Row.']);
  const q = sim.questList(c).length;
  if (q) rows.push([null, `${cap(nWord(q))} new ${q === 1 ? 'quest' : 'quests'}`, 'Small, and they pay.']);
  if (!rows.length) return '';
  const row = ([act, t, s, hot]) => act
    ? `<button class="ovrow${hot ? ' hot' : ''}" data-act="${act}"><b>${t}</b><span class="small muted">${s}</span></button>`
    : `<div class="ovrow"><b>${t}</b><span class="small muted">${s}</span></div>`;
  return `<div class="card overnight">
    <div class="row" style="gap:12px;align-items:flex-start">
      ${co.has(c) ? companionFigure(c, 72) : `<div style="width:56px;display:grid;place-items:center">${ico('moon', '🌙', 40)}</div>`}
      <div class="grow" style="min-width:0">
        <div class="eyebrow">${o.nights === 1 ? 'Overnight' : `${cap(nWord(o.nights))} nights away`}</div>
        <h3 style="margin:2px 0 8px">Welcome back, ${esc(c.name)}</h3>
        <div class="stack" style="gap:5px">${rows.map(row).join('')}</div>
      </div>
    </div>
    <div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn ghost sm" data-act="ovSeen">Got it</button></div>
  </div>`;
}
