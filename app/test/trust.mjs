/* trust.mjs — the numbers a child or a parent could catch contradicting
   each other. Every check here was watched failing first (see the commit
   that added it): a hard-coded weekly rate, a snowball on a made-up balance,
   a report that credits the child with Nana's default, XP for a wrong
   answer, and a level-rewriting button outside tester mode.

   Run: node test/trust.mjs */
import * as sim from '../src/sim.js';
import { WEEKS_PER_YEAR } from '../src/world.js';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
const mk = () => { const s = sim.newState(); s.kids.push(sim.newChild('Ahana', 'builder', 'INR')); return s; };

console.log('\nTrust · one rate, honest projections, honest reports\n' + '─'.repeat(56));

/* one rate */
{
  const s = mk(), c = sim.kid(s);
  const annual = sim.bankRateAnnual(c), town = sim.marketWorld(c).rate;
  ok(annual === town, 'the Bank pays the same rate the Exchange shows', `${annual.toFixed(2)}% vs ${town.toFixed(2)}%`);
  ok(annual > 0 && annual < 20, 'the rate is an annual figure, not a weekly one', annual.toFixed(2) + '% a year');
  c.money.bank.balance = 10000; c.money.bank.opened = true;
  ok(Math.abs(sim.bankInterestWeekly(c) - 10000 * annual / 100 / WEEKS_PER_YEAR) < 1e-9, 'a pay day pays a fifty-second of the annual rate');
  const yearOn = sim.bankProjection(c, 1) / 10000 - 1;
  ok(Math.abs(yearOn - annual / 100) < 0.002, 'a year of pay days adds about the annual rate', (yearOn * 100).toFixed(2) + '%');
  const vsrc = readFileSync(new URL('../src/views.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/sim.js', import.meta.url), 'utf8');
  ok(!/bank\.rate\b/.test(vsrc.replace(/\/\*[\s\S]*?\*\//g, '')), 'nothing reads the old per-week bank.rate field');
}

/* small savers still earn: interest accrues in fractions and pays in whole coins */
{
  const s = mk(), c = sim.kid(s);
  c.money.bank.balance = 300; c.money.bank.opened = true;
  let paid = 0;
  for (let w = 0; w < WEEKS_PER_YEAR; w++) { c.money.bank.accrued = (c.money.bank.accrued || 0) + sim.bankInterestWeekly(c); const i = Math.floor(c.money.bank.accrued); c.money.bank.accrued -= i; c.money.bank.balance += i; paid += i; }
  ok(paid >= 1, 'a small balance is paid its interest over a year rather than rounded to nothing', 'paid ' + paid);
}

/* the snowball projects the actual balance */
{
  const s = mk(), c = sim.kid(s);
  c.money.bank.balance = 0;
  ok(sim.bankProjection(c, 10) === 0, 'nothing grows on nothing — an empty vault projects to zero');
  c.money.bank.balance = 500;
  const ten = sim.bankProjection(c, 10);
  ok(ten > 500 && ten < 500 * 2.5, 'ten years at the town rate is believable, not crores', Math.round(ten) + ' from 500');
}

/* the report credits only a split the child chose */
{
  const s = mk(), c = sim.kid(s);
  ok(!sim.rulesChosen(c), 'a new child has not chosen the pay-day split — it is the default');
  c.money.rules.spend = 30; c.money.rules.save = 40;
  ok(sim.rulesChosen(c), 'moving a slider makes it their choice');
}

/* XP moves on learning only */
ok(sim.cardXP(true, false) === 0 && sim.cardXP(false, false) === 0, 'a wrong answer pays no XP');
ok(sim.cardXP(true, true) > sim.cardXP(false, true) && sim.cardXP(false, true) > 0, 'right first time pays most; revisiting pays a little');

/* nothing outside tester mode rewrites the child's level */
{
  const v = readFileSync(new URL('../src/views.js', import.meta.url), 'utf8');
  const body = (v.match(/function testerTools\(\) \{[\s\S]*?\n\}/) || [''])[0];
  const all = (v.match(/data-act="grantXP"/g) || []).length, inside = (body.match(/data-act="grantXP"/g) || []).length;
  ok(/if \(!R\.s\.settings\.tester\) return '';/.test(body) && all === inside && all > 0, 'every Add XP button lives in testerTools(), which is empty unless tester mode is on', `${inside}/${all}`);
  const m = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/on\('grantXP', \(\) => \{[\s\S]{0,160}if \(!R\.s\.settings\.tester\) return;/.test(m), 'the grantXP handler refuses outside tester mode');
}


/* a money quest is the same effort in every currency, and says which money it means */
{
  const { QUESTS } = await import('../src/content.js');
  const { setCurrency, price, dayIndex } = await import('../src/fmt.js');
  const town = QUESTS.find((q) => q.id === 'q-town');
  /* within one whole coin of that currency: £0.80 rounds to £1, which is not the bug */
  const effort = ['INR', 'USD', 'GBP'].map((cur) => { setCurrency(cur); const u = price(100) / 100; return { e: sim.questTarget(town) / u, coin: 1 / u }; });
  ok(effort.every((x) => Math.abs(x.e - town.n) <= Math.max(0.5, x.coin)), 'a money quest asks the same number of units in rupees, dollars and pounds', effort.map((x) => x.e.toFixed(1)).join(' · '));
  for (const cur of ['INR', 'USD']) {
    const s = sim.newState(); const c = sim.newChild('Ahana', 'builder', cur); s.kids.push(c);
    c.quests = { day: dayIndex(Date.now()), list: ['q-town', 'q-earn'], prog: {}, claimed: {}, bonus: false };
    const q = sim.questList(c).find((x) => x.id === 'q-town');
    ok(!!q && /[₹$£€]/.test(q.t) && !/\{m\}/.test(q.t), `the quest names its money (${cur})`, q && q.t);
  }
  setCurrency('INR');
}

console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
