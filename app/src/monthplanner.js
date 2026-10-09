/* monthplanner.js — the Month Planner (docs/12 §2.3): Budget Blitz rebuilt, Times Twelve in it.

   Three months on Market Row, the bills one at a time: pay it now, or not this month. A need
   not paid moves to next month, named, and next month starts that much shorter. The score is
   the needs paid and a little kept back — never the leftover — so skipping everything loses.
   Once a round, before a monthly or weekly bill, the child TYPES what it costs a year; a miss
   holds with the sum and the common slips (×10, ×4).

   Every sum comes from monthsim.js; this module draws and listens. The round ends through the
   arcade's one door (kit.finish → roundEnd). It rides in the arcade's chunk. */
import { esc, sfx, clamp } from './ui.js';
import { money } from './fmt.js';
import { ico } from './art.js';
import { R } from './runtime.js';
import { verdict } from './gamefx.js';
import { mathsMet } from './ledger.js';
import * as M from './monthsim.js';
import { padHtml, padKey, keyOf } from './typepad.js';
import { trainStyle } from './trainstyle.js';

export const MP_TIERS = {
  easy:     { par: 1, says: 'Three roomy months: there is enough for every bill if you plan it.' },
  standard: { par: 1, says: 'One month in three is smaller than all its bills.' },
  tricky:   { par: 1, says: 'Two months in three are short, and one is short even of its needs: something has to move.' },
};
export const MP_GOALS = [
  { id: 'ontime', name: 'Every need paid in its own month', check: (r) => r.needs > 0 && r.onTime === r.needs },
  { id: 'buffer', name: 'Every need paid, and money kept back at the end of every month', check: (r) => r.needs > 0 && r.missed === 0 && r.onTime + r.late === r.needs && r.buffers === r.months },
  { id: 'yearly', name: 'The yearly cost worked out first time', check: (r) => r.yearlyRight === true },
];
const SLIP = {
  month: { 10: 'ten months — a year has twelve', 4: 'four is the weeks in a month, not the months in a year' },
  week: { 10: 'a round guess — a year has fifty-two weeks', 4: 'that is one month of weeks, not a year' },
};

export function monthPlanner(kit, seed = (Date.now() % 100000) | 0) {
  trainStyle();
  const level = kit.tier, year = mathsMet(kit.K())('M7');
  const round = M.mpRound(seed, level, { year });
  const L = M.mpStart(round);
  const st = { seed, level, round, L, step: 'bill', typed: '', nudge: false, notice: null, summary: null, done: false, won: 0, run: null };
  const bill = () => M.mpBill(L);
  const month = () => round.months[L.m];
  const atYearly = () => { const b = bill(); return b && b.key === round.yearly.key && !L.yearly; };
  if (atYearly()) st.step = 'yearly';

  /* ── the yearly step ── */
  const yKey = (k) => { if (st.step !== 'yearly' || L.yearly) return; st.nudge = false; st.typed = padKey(st.typed, String(k), false); R.render(); };
  const yCheck = () => {
    if (st.step !== 'yearly') return;
    if (L.yearly) { st.step = 'bill'; sfx.click(); R.render(); return; }
    if (!st.typed) { st.nudge = true; R.render(); return; }
    const res = M.mpYearly(L, st.typed);
    if (res.ok) sfx.good(); else sfx.bad();
    R.render(); verdict('.gplay .mpyear .sbtype', res.ok);
  };
  /* ── a bill ── */
  const decide = (pay) => {
    if (st.step !== 'bill' || st.done) return;
    const b = bill(); if (!b) return;
    const res = M.mpDecide(L, pay);
    if (!res.ok) { st.notice = { kind: 'short', short: res.short, text: `Not enough left for ${b.n}: ${money(res.short)} short. Something else has to give.` }; sfx.bad(); R.render(); return; }
    if (res.paid) { st.notice = { kind: 'paid', text: `Paid: ${b.n}${b.rolled ? ', a month late' : ''}.` }; sfx.click(); }
    else if (res.moved) {
      st.notice = res.last ? { kind: 'moved', text: `${b.n} not paid, and this is the last month of the plan: it goes on the end card.` }
        : { kind: 'moved', amt: b.amt, text: `${b.n} moved to next month: next month starts ${money(b.amt)} shorter.` };
      sfx.bad();
    } else { st.notice = { kind: 'want', text: `You went without ${b.n.charAt(0).toLowerCase() + b.n.slice(1)}. That is allowed.` }; sfx.click(); }
    if (M.mpMonthOver(L)) { st.summary = M.mpEndMonth(L); st.step = 'month'; }
    else if (atYearly()) { st.step = 'yearly'; st.typed = ''; }
    R.render();
    if (res.paid) verdict('.gplay [data-act="mpPay"]', true);
  };
  const next = () => {
    if (st.step !== 'month') return;
    if (L.done) { finish(); R.render(); return; }
    st.summary = null; st.notice = null; st.step = atYearly() ? 'yearly' : 'bill'; sfx.click(); R.render();
  };
  function finish() {
    st.done = true; st.step = 'done';
    st.run = M.mpRun(L);
    st.won = kit.finish(st.run);
  }

  /* ── drawing ── */
  const head = () => {
    const Mo = month(), carried = L.carry;
    return `<div class="gcard mphead"><span class="eyebrow">Month ${L.m + 1} of ${round.months.length} · Market Row</span>
      <p class="sbq">This month's money from your stall and your jobs: <b>${money(Mo.pot)}</b>${carried ? ` · and ${money(carried)} kept from last month` : ''}.</p>
      <div class="bar mpbar" aria-hidden="true"><i style="width:${clamp((L.cash / Math.max(1, L.start)) * 100, 0, 100)}%;background:${L.cash >= Mo.keep ? 'var(--grow)' : 'var(--spend)'}"></i><b style="left:${clamp((Mo.keep / Math.max(1, L.start)) * 100, 0, 100)}%"></b></div>
      <p class="small">Left: <b class="tabnum">${money(L.cash)}</b> · keep back at least <b class="tabnum">${money(Mo.keep)}</b></p></div>`;
  };
  const billCard = (b) => `<div class="gcard mpbill${b.rolled ? ' rolled' : ''}"><span class="em">${ico('receipt', '', 40)}</span>
      ${b.rolled ? `<span class="pill mpmoved">moved from month ${b.month + 1}</span>` : ''}
      <span class="nm">${esc(b.n)}</span>
      <div class="big tabnum">${money(b.amt)}</div>
      ${b.per === 'week' ? `<p class="small">${money(b.each)} a week · four weeks this month</p>` : b.per === 'month' ? `<p class="small">${money(b.each)} a month</p>` : ''}</div>`;
  const billView = () => {
    const b = bill(), can = M.mpCanPay(L);
    return `${head()}${billCard(b)}
      ${st.notice ? `<div class="sbhold ${st.notice.kind === 'paid' || st.notice.kind === 'want' ? 'ok' : 'no'} mpnote" role="status">${esc(st.notice.text)}</div>` : ''}
      <div class="grow"></div>
      <div class="choices"><button class="btn" data-act="mpPay"${can ? '' : ' disabled'}>1 · Pay it${can ? '' : ' (not enough)'}</button>
        <button class="btn ghost" data-act="mpSkip">2 · Not this month</button></div>
      <p class="hint">Keys 1 and 2, or tap. Needs first, then keep some back — the leftover is not the score.</p>`;
  };
  const yearView = () => {
    const y = round.yearly, b = bill(), h = L.yearly, span = y.year ? 'a year' : y.per === 'week' ? 'eight weeks' : 'three months';
    const unit = y.per === 'week' ? 'week' : 'month';
    return `${head()}${billCard(b)}
      <div class="gcard sbask mpyear"><span class="eyebrow">Before you decide</span>
        <p class="sbq">${esc(y.n)} is ${money(y.each)} a ${unit}. What does it cost in ${span}?${level === 'easy' && y.year ? ` <span class="small">(${y.per === 'week' ? 'a year has 52 weeks' : 'a year has 12 months'})</span>` : ''}</p>
        ${padHtml({ typed: st.typed, held: h ? { ok: h.ok } : null, act: 'mpKey', check: 'mpCheck', nudge: st.nudge, dot: false })}
        ${h ? `<div class="sbhold ${h.ok ? 'ok' : 'no'}" role="status">${h.ok ? 'Spot on.' : `Not this time — you typed ${money(h.typed || 0)}.`} <b>${money(y.each)} × ${y.times} = ${money(y.want)}</b>
          ${!h.ok && y.slips.length ? `<ul class="mpslips"><li class="small"><b>Common slips</b></li>${y.slips.map((s) => `<li class="small${h.slip && h.slip.times === s.times ? ' hit' : ''}">× ${s.times} = ${money(s.v)}: ${esc(SLIP[y.per][s.times])}${h.slip && h.slip.times === s.times ? ' — that one' : ''}</li>`).join('')}</ul>` : ''}
          ${h.ok ? `<p class="small">Small every ${unit}; not small in a year. Now: pay it, or not?</p>` : ''}</div>
          <button class="btn wide" data-act="mpCheck">Continue · Enter</button>` : ''}</div>
      <p class="hint">${h ? 'Enter to go on.' : 'Type it — the keys or the pad — then Enter.'}</p>`;
  };
  const monthView = () => {
    const s = st.summary;
    return `<div class="gcard mpend"><span class="eyebrow">Month ${s.m + 1} done</span>
        ${st.notice ? `<p class="small">${esc(st.notice.text)}</p>` : ''}
        <p class="sbq">${s.kept ? `Kept back <b>${money(s.left)}</b> — you aimed for ${money(s.keep)}. ✓` : `<b>${money(s.left)}</b> left — short of the ${money(s.keep)} you meant to keep back.`}</p>
        ${s.moved.length ? `<p class="small mpmovedl"><b>${L.done ? 'Never paid' : 'Moved to next month'}:</b> ${s.moved.map((b) => esc(b.n)).join(', ')}${L.done ? '' : ` — next month starts ${money(s.shorter)} shorter`}.</p>` : '<p class="small">Every need this month: paid.</p>'}</div>
      <button class="btn wide" data-act="mpNext">${L.done ? 'How the plan went' : 'Next month'} · Enter</button>
      <p class="hint">Enter, or tap.</p>`;
  };

  return {
    id: 'mp', st,
    act(n, arg) {
      if (n === 'mpPay') decide(true);
      else if (n === 'mpSkip') decide(false);
      else if (n === 'mpKey') yKey(arg);
      else if (n === 'mpCheck') yCheck();
      else if (n === 'mpNext') next();
    },
    /* for the bots and tests: the same steps the keys and taps take */
    decide, ledger: L,
    key(e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '')) return;
      if (st.done) { kit.endKey(e); return; }
      const k = e.key;
      if (st.step === 'yearly') { if (L.yearly) { if (k === 'Enter' || k === ' ') yCheck(); return; } const p = keyOf(e); if (p && p !== '.') yKey(p); else if (k === 'Enter') yCheck(); return; }
      if (st.step === 'bill') { if (k === '1') decide(true); else if (k === '2') decide(false); return; }
      if (st.step === 'month' && (k === 'Enter' || k === ' ')) { if (e.preventDefault) e.preventDefault(); next(); }
    },
    view() {
      if (st.done) {
        const r = st.run;
        const named = `${r.lateNames.length ? `<br>Paid late: ${r.lateNames.map((x) => `${esc(x.n)} (from month ${x.from})`).join(', ')}.` : ''}${r.missedNames.length ? `<br>Never paid: ${r.missedNames.map((x) => `${esc(x.n)} (month ${x.from})`).join(', ')}.` : ''}`;
        return `<div class="stack">${kit.hud(['Plan done', kit.tierChip()])}
          ${kit.endCard(r.missed === 0 && r.late === 0 ? '🎯' : 'think', `${r.points} of ${r.best}`,
            `<span class="sbendsub mpendsub">Needs paid on time: ${r.onTime} of ${r.needs} · late: ${r.late} · never: ${r.missed} · months kept back: ${r.buffers} of ${r.months} · yearly sum: ${r.yearlyRight ? 'right' : 'not this time'}${named}</span>`,
            st.won, 'Leftover money is not a prize. Needs first, then a little kept back — and a need you move does not vanish, it waits for next month.', 'nana')}</div>`;
      }
      const label = { bill: 'Bills', yearly: 'A year of it', month: 'Month done' }[st.step];
      const body = st.step === 'yearly' ? yearView() : st.step === 'month' ? monthView() : billView();
      /* a closed month's card speaks for that month, not the one about to open */
      const mi = st.step === 'month' ? st.summary.m : L.m, left = st.step === 'month' ? st.summary.left : L.cash;
      return `<div class="stack">${kit.hud([kit.tierChip(), `Month ${mi + 1} / ${round.months.length}`, `Left ${money(left)}`, label])}
        <div class="stage mpstage" data-step="${st.step}">${body}</div></div>`;
    },
  };
}
