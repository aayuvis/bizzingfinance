/* monthplanner.mjs — the Month Planner (docs/12 §2.3), T10, and what a child would complain about:
   · skipping every bill setting the best (Budget Blitz scored the leftover);
   · a month that never tightens, so there is nothing to decide;
   · a need that vanishes when it is not paid, and an end card that names nothing;
   · "what does it cost a year?" as a multiple choice whose answer is the second-largest option;
   · the household's money assumed (CONCEPT §6.5);
   · a sum on the screen the screen worked out for itself.
   Every check here was watched failing once (the commit message says how each was broken).
   Run: node test/monthplanner.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
globalThis.Image = class {};
import { readFileSync } from 'node:fs';
const { R } = await import('../src/runtime.js');
const sim = await import('../src/sim.js');
const AR = await import('../src/arcade.js');
const F = await import('../src/fmt.js');
const M = await import('../src/monthsim.js');
const { SOURCES } = await import('../src/sources.js');
const { play } = await import('./_bots.mjs');

let pass = 0, fail = 0;
const ok = (label, cond, detail = '') => { const c = !!cond; if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
R.render = () => {};
const fresh = (cur = 'INR', ceiling = null) => { F.setCurrency(cur); R.s = sim.newState(); R.s.kids.push(sim.newChild('Asha', 'builder', cur)); const c = R.s.kids[0]; c.learn.level = ceiling ? 1 : 30; if (ceiling) c.maths = { ceiling }; return c; };
const LV = ['easy', 'standard', 'tricky'];
const plain = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');

console.log('\nThe Month Planner · T10\n' + '─'.repeat(56));
{
  const ids = AR.GAMES.map((g) => g.id);
  ok('the Month Planner is a card; Budget Blitz and Times Twelve are not', ids.includes('mp') && !ids.includes('bb') && !ids.includes('tt'), ids.join(','));
}

/* ── T10 · a skip-all player scores below a pay-the-needs player, at every level ── */
for (const lv of LV) {
  let worse = 0, sk = 0, nd = 0, n = 0;
  for (let s = 1; s <= 120; s++) {
    fresh(); const a = play('mp', s, lv, 'skip'); const sa = a.st.run.points; AR.quitGame();
    fresh(); const b = play('mp', s, lv, 'needs'); const sb = b.st.run.points; AR.quitGame();
    n++; sk += sa; nd += sb; if (!(sa < sb)) worse++;
  }
  ok(`T10 · ${lv}: skipping every bill scores below paying the needs — on every one of ${n} rounds`, worse === 0, `skip ${(sk / n).toFixed(1)} vs needs ${(nd / n).toFixed(1)}`);
}
{
  /* and the pay goes the same way: through roundEnd, against the round's best */
  fresh(); play('mp', 4, 'standard', 'skip'); const skipShare = R.s.kids[0].rounds.mp.share; AR.quitGame();
  fresh(); play('mp', 4, 'standard', 'best'); const bestShare = R.s.kids[0].rounds.mp.share; AR.quitGame();
  ok('a skip-all round pays under half of par (and is offered an easier level); a careful one pays the full wage', skipShare < 0.5 && bestShare === AR.PERFECT, `${skipShare} vs ${bestShare}`);
}

/* ── the score is the needs and the buffer, never the leftover ── */
{
  let diff = 0, n = 0;
  for (const lv of LV) for (let s = 1; s <= 80; s++) {
    const r = M.mpRound(s, lv), plan = M.mpBest(r).plan;
    /* the best plan, and the same plan plus every want it can afford beyond the keep-back: less left over, same points */
    /* a planned need still to come this month */
    const rest = (L) => L.queue.slice(L.i + 1).filter((x) => x.need && plan[L.m].includes(x.key)).reduce((t, x) => t + x.amt, 0);
    const run = (wants) => {
      const L = M.mpStart(r); M.mpYearly(L, r.yearly.want);
      while (!L.done) {
        while (!M.mpMonthOver(L)) {
          const b = M.mpBill(L), last = L.m === r.months.length - 1;
          const pay = b.need ? plan[L.m].includes(b.key) : wants && last && L.cash - b.amt >= r.months[L.m].keep + rest(L);
          M.mpDecide(L, pay);
        }
        M.mpEndMonth(L);
      }
      return { pts: M.mpPoints(L), left: L.cash };
    };
    const a = run(false), b = run(true);
    if (b.left < a.left) { n++; if (a.pts !== b.pts) diff++; }
  }
  ok('two plans that pay the same needs and keep the same buffer score the same, whatever is left over', n > 20 && diff === 0, `${n} pairs with less left over, ${diff} scored differently`);
  ok('the end card\'s headline is the score, not the money left', (() => { fresh(); const g = play('mp', 2, 'standard'); const v = g.view(); AR.quitGame(); return /<h2>\d+ of \d+<\/h2>/.test(v) && !/left over<\/h2>/.test(v); })());
}

/* ── the pot is sometimes smaller than all the bills ── */
{
  const bad = [];
  for (const lv of LV) for (let s = 1; s <= 200; s++) {
    const r = M.mpRound(s, lv), tight = r.months.filter((x) => x.pot < x.needs + x.wants).length, short = r.months.filter((x) => x.short);
    const want = { easy: 0, standard: 1, tricky: 2 }[lv];
    if (tight !== want) bad.push(`${lv}/${s}: ${tight} tight`);
    if (lv === 'tricky' ? short.length !== 1 || short[0].m === r.months.length - 1 || !(short[0].pot < short[0].needs + short[0].keep) : short.length) bad.push(`${lv}/${s}: short month`);
    if (r.months.some((x) => x.keep < 1)) bad.push(`${lv}/${s}: nothing to keep back`);
  }
  ok('a month is smaller than all its bills: never on Easy, exactly one in three on Standard, two in three on Tricky — and on Tricky one is short even of its needs, never the last', !bad.length, bad.slice(0, 3).join(' | '));
  ok('the best plan of every round pays every need somewhen — the short month is a choice about WHEN, never an impossible round', LV.every((lv) => Array.from({ length: 100 }, (_, s) => M.mpRound(s + 1, lv)).every((r) => {
    const need = r.months.reduce((t, x) => t + x.bills.filter((b) => b.need).length, 0);
    return M.mpBest(r).plan.flat().length === need;
  })));
}

/* ── an unpaid need rolls into next month, named; the end card lists each ── */
{
  fresh(); AR.startGame('mp', 6, 'standard'); const g = R.game, L = g.ledger;
  if (g.st.step === 'yearly') { for (const ch of String(g.st.round.yearly.want)) g.act('mpKey', ch); g.act('mpCheck'); g.act('mpCheck'); }
  let need = M.mpBill(L); while (!need.need) { g.act('mpPay'); need = M.mpBill(L); if (g.st.step === 'yearly') { for (const ch of String(g.st.round.yearly.want)) g.act('mpKey', ch); g.act('mpCheck'); g.act('mpCheck'); } }
  g.act('mpSkip');
  const said = g.st.notice && g.st.notice.text;
  ok('a need not paid moves to next month, named, and says how much shorter next month starts', said === `${need.n} moved to next month: next month starts ${F.money(need.amt)} shorter.`, said);
  while (g.st.step !== 'month') { if (g.st.step === 'yearly') { for (const ch of String(g.st.round.yearly.want)) g.act('mpKey', ch); g.act('mpCheck'); g.act('mpCheck'); } else g.act(M.mpBill(L).need && M.mpCanPay(L) ? 'mpPay' : 'mpSkip'); }
  const mv = plain(g.view());
  g.act('mpNext');
  const first = M.mpBill(L), v = g.view();
  ok('the month\'s card lists what moved; next month opens on it, marked "moved from month 1"', mv.includes('Moved to next month:') && mv.includes(need.n) && first.key === need.key && first.rolled && /moved from month 1/.test(v));
  AR.quitGame();
  /* the end card names every need paid late and every need never paid */
  fresh(); const s = play('mp', 6, 'tricky', 'skip'); const end = plain(s.view()), names = s.st.round.months.flatMap((x) => x.bills.filter((b) => b.need).map((b) => b.n));
  ok('a skip-all round\'s end card names every need it never paid', /Never paid:/.test(end) && [...new Set(names)].every((n) => end.includes(n)), `${new Set(names).size} needs`);
  AR.quitGame();
  let lateSeen = false;
  for (let sd = 1; sd <= 40 && !lateSeen; sd++) { fresh(); const t = play('mp', sd, 'tricky', 'best'); if (t.st.run.late > 0) { const e = plain(t.view()); lateSeen = /Paid late:/.test(e) && t.st.run.lateNames.every((x) => e.includes(`${x.n} (from month ${x.from})`)); } AR.quitGame(); }
  ok('and every need paid late, with the month it came from', lateSeen);
}

/* ── the yearly step: typed, checked, and the slips shown after a miss ── */
{
  const bad = [];
  for (const cur of ['INR', 'USD', 'GBP', 'EUR', 'AED']) for (const lv of LV) for (let s = 1; s <= 30; s++) {
    fresh(cur); AR.startGame('mp', s, lv); const g = R.game, y = g.st.round.yearly;
    /* the yearly bill can come anywhere in the first month: until it does, the bills are ordinary */
    for (let k = 0; k < 10 && g.st.step === 'bill' && M.mpBill(g.ledger).key !== y.key; k++) g.act('mpSkip');
    if (g.st.step !== 'yearly' || M.mpBill(g.ledger).key !== y.key) { bad.push(`${cur}/${lv}/${s}: no yearly step before its bill`); AR.quitGame(); continue; }
    const v = g.view();
    if (/data-act="(ttPick|scChip|mpPick)"/.test(v) || (v.match(/class="opt/g) || []).length) bad.push(`${cur}/${lv}/${s}: options on the yearly screen`);
    if (!/data-act="mpKey"/.test(v) || /data-arg="\."/.test(v)) bad.push(`${cur}/${lv}/${s}: no keypad (or a point for whole coins)`);
    if (/Common slips/.test(v)) bad.push(`${cur}/${lv}/${s}: slips before any answer`);
    if (y.want !== y.each * (y.per === 'week' ? 52 : 12)) bad.push(`${cur}/${lv}/${s}: ${y.each} × ${y.times} ≠ ${y.want}`);
    g.act('mpPay'); g.act('mpSkip');
    if (g.st.step !== 'yearly' || g.ledger.paid.length) bad.push(`${cur}/${lv}/${s}: the bill could be decided before the year was typed`);
    AR.quitGame();
  }
  ok('once a round, before its monthly or weekly bill, the yearly cost is TYPED on a keypad — no options to pick from, no deciding the bill first; ×12 or ×52 of the bill as shown', !bad.length, bad.slice(0, 3).join(' | '));
  const r = M.mpRound(3, 'standard'), y = r.yearly;
  const check = (n) => { const L = M.mpStart(r); return M.mpYearly(L, n); };
  ok('the yearly sum is checked: right is right, one off is not, and a ×10 or ×4 slip is recognised as that slip',
    check(y.want).ok && !check(y.want + 1).ok && check(y.each * 10).slip && check(y.each * 10).slip.times === 10 && check(y.each * 4).slip.times === 4 && !check(y.want).slip);
  const yearly = new Set(); for (let s = 1; s <= 60; s++) yearly.add(M.mpRound(s, 'standard').yearly.per);
  ok('the yearly bill is sometimes monthly (×12) and sometimes weekly (×52)', yearly.has('month') && yearly.has('week'));
  fresh('INR', 4); AR.startGame('mp', 3, 'standard');
  while (R.game.st.step === 'bill') R.game.act('mpSkip');
  ok('before ×12 and ×52 (M7), the same step asks a shorter span — and still typed', !R.game.st.round.yearly.year && [3, 8].includes(R.game.st.round.yearly.times) && /What does it cost in (three months|eight weeks)\?/.test(plain(R.game.view())));
  AR.quitGame();
}

/* ── your month, never the household's ── */
{
  const all = [...M.MP_BILLS.recurring, ...M.MP_BILLS.once, ...M.MP_BILLS.wants].map((b) => b.n);
  const house = all.filter((n) => /household|family|parents?\b|mum|dad|mortgage|electricity|council tax|your home\b|groceries for/i.test(n));
  ok('the bills are a child\'s own — club fees, a bus pass, a top-up, a gift, a repair — and none is the household\'s', !house.length && ['club', 'bus', 'phone', 'gift', 'repair'].every((id) => [...M.MP_BILLS.recurring, ...M.MP_BILLS.once, ...M.MP_BILLS.wants].some((b) => b.id === id)), house.join(', '));
  fresh(); AR.startGame('mp', 2, 'standard'); const v = plain(R.game.view()); AR.quitGame();
  ok('the month\'s money is said to be your stall\'s and your jobs\', on Market Row', /your stall and your jobs/.test(v) && /Market Row/.test(v));
  const bills = new Set(); for (let s = 1; s <= 30; s++) M.mpRound(s, 'standard').months.forEach((x) => x.bills.forEach((b) => bills.add(b.n + b.amt)));
  ok('bills vary by seed', bills.size > 60, `${bills.size} different bills in 30 rounds`);
  const said = SOURCES.month.value(), B = M.MP_BILLS;
  ok('every bill and keep-back is a registered town dial (sources.js "month"), said as the dials are', SOURCES.month.kind === 'own' && /monthsim/.test(SOURCES.month.where)
    && said.includes(`${B.recurring.length + B.once.length} needs and ${B.wants.length} wants`) && said.includes(`keep back ${Math.round(M.MP_KNOBS.standard.keep * 100)} in every 100`), said);
}

/* ── the money rule: every amount on screen is one monthsim computed ── */
{
  const numbers = (o, out = new Set()) => { if (typeof o === 'number') out.add(o); else if (Array.isArray(o)) o.forEach((v) => numbers(v, out)); else if (o && typeof o === 'object') Object.values(o).forEach((v) => numbers(v, out)); return out; };
  const stray = []; let screens = 0;
  for (const cur of ['INR', 'USD']) {
    F.setCurrency(cur);
    const re = new RegExp('\\' + F.sign() + '[0-9]+(?:,[0-9]+)*', 'g');
    for (const lv of LV) for (let s = 1; s <= 20; s++) for (const how of ['best', 'skip', 'random']) {
      fresh(cur); AR.startGame('mp', s, lv); const h = R.game, HL = h.ledger, views = [], allowed = new Set([0]);
      /* everything monthsim.js handed over during the round: the round, every level the purse passed through, every notice's sum */
      const take = () => { numbers({ r: h.st.round, log: HL.monthLog, cash: HL.cash, carry: HL.carry, start: HL.start, y: HL.yearly, notice: h.st.notice, run: h.st.run, won: h.st.won }, allowed); };
      for (let guard = 0; guard < 300 && !h.st.done; guard++) {
        take(); views.push(h.view());
        if (h.st.step === 'yearly') { if (!HL.yearly) for (const ch of String(how === 'random' ? 7 + guard : h.st.round.yearly.want)) h.act('mpKey', ch); h.act('mpCheck'); }
        else if (h.st.step === 'bill') h.act(how === 'skip' ? 'mpSkip' : how === 'random' ? (guard % 3 ? 'mpPay' : 'mpSkip') : M.mpCanPay(HL) && M.mpBill(HL).need ? 'mpPay' : 'mpSkip');
        else h.act('mpNext');
      }
      take(); views.push(h.view());
      const typedN = new Set(views.flatMap((v) => [...plain(v).matchAll(/you typed \D*?([0-9][0-9,]*)/g)].map((m) => +m[1].replace(/,/g, ''))));
      const shown = new Set([...allowed, ...typedN].map((n) => F.money(n)));
      for (const v of views) { screens++; for (const m of plain(v).matchAll(re)) if (!shown.has(m[0])) stray.push(`${cur}/${lv}/${s}/${how}: ${m[0]}`); }
      AR.quitGame();
    }
  }
  F.setCurrency('INR');
  ok(`every amount on every screen is one monthsim.js handed over — INR and USD, 360 rounds, ${screens} screens`, !stray.length, stray.slice(0, 4).join(' | '));
  const src = readFileSync(new URL('../src/monthplanner.js', import.meta.url), 'utf8');
  const Fd = '(amt|cash|pot|keep|each|want|carry|left|shorter|needs|wants|start|short|v|points|best)';
  const sums = [...src.matchAll(new RegExp(`\\.${Fd}\\b\\s*[-+*%](?![=>])|[-+*%]\\s*[A-Za-z_]\\w*(?:\\.\\w+)*\\.${Fd}\\b`, 'g'))].map((m) => m[0]);
  ok('monthplanner.js does no arithmetic on money — it says monthsim.js\'s numbers', !sums.length, sums.slice(0, 4).join(' | '));
  ok('monthplanner.js never prices anything itself (no price() call)', !/\bprice\(/.test(src));
}

/* ── keys alone play a whole round; taps alone too ── */
{
  fresh(); AR.startGame('mp', 12, 'tricky'); const g = R.game, L = g.ledger, plan = M.mpBest(g.st.round).plan;
  for (let guard = 0; guard < 300 && !g.st.done; guard++) {
    if (g.st.step === 'yearly') { if (!L.yearly) for (const ch of String(g.st.round.yearly.want)) g.key({ key: ch }); g.key({ key: 'Enter' }); }
    else if (g.st.step === 'bill') g.key({ key: plan[L.m].includes(M.mpBill(L).key) ? '1' : '2' });
    else g.key({ key: 'Enter' });
  }
  ok('the keyboard alone plays a whole round to the best score', g.st.done && g.st.run.points === g.st.run.best, g.st.run && `${g.st.run.points} of ${g.st.run.best}`);
  const v = g.view(); g.key({ key: 'Enter' });
  ok('…and Enter leaves the end card', R.game == null && /data-act="gquit"/.test(v));
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
