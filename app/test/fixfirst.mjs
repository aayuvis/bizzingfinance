/* fixfirst.mjs — the trust fixes from the family audit (FIX-FINANCE §1), each
   held by a check that was watched failing first.

   Run: node test/fixfirst.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
const sim = await import('../src/sim.js');
const report = await import('../src/report.js');
const { nextStep } = await import('../src/next.js');
const { migrate } = await import('../src/store.js');
const { hashPin, checkPin, pinSet } = await import('../src/pin.js');
const { annualReport, shareholderLetter } = await import('../src/reports.js');
const decisions = await import('../src/decisions.js');
const mastery = await import('../src/mastery.js');
const { readFileSync } = await import('node:fs');

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
const mk = (name = 'Ahana') => { const s = sim.newState(); s.kids.push(sim.newChild(name, 'builder', 'INR')); return s; };
console.log('\nFix first · trust\n' + '─'.repeat(56));

/* 1 · the report names the child, or says "they" — never she/her/he/him */
{
  const s = mk('Kabir'), c = sim.kid(s), now = Date.now();
  /* a week with a decision, a lapse and a miss, so every sentence is written */
  decisions.record && decisions.record(c, { surface: 'store', label: 'A kite', chose: 'buy', alternatives: [{ label: 'The bike goal', cost: 120 }] }, now - 864e5);
  const r = report.weekly(c, { now, money: (n) => '₹' + n });
  const all = JSON.stringify(r);
  ok(!/\b(she|her|hers|herself|he|him|his)\b/i.test(all.replace(/"(id|objective)":"[^"]*"/g, '')), 'the weekly report never assumes a pronoun', (all.match(/\b(she|her|he|him|his)\b/i) || [''])[0]);
  const src = readFileSync(new URL('../src/report.js', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/\b(she|her|hers)\b/.test(src), 'report.js writes no she/her into any sentence');
  const v = readFileSync(new URL('../src/views.js', import.meta.url), 'utf8');
  const rep = v.slice(v.indexOf('export function viewReport'), v.indexOf('function reportCard'));
  ok(!/\b(she|her)\b/i.test(rep.replace(/\/\*[\s\S]*?\*\//g, '')), 'the report screen never says she or her');
  const objs = readFileSync(new URL('../src/objectives-more.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/objectives.js', import.meta.url), 'utf8');
  const lines = [...objs.matchAll(/parent_line: '([^']*)'/g)].map((m) => m[1]).filter((t) => /\b(she|her|hers)\b/i.test(t));
  ok(!lines.length, 'no "ask at the table" line assumes a pronoun', lines[0] || '');
}
/* 1b · "has not been in" is about being in, not about learning */
{
  const s = mk('Mira'), c = sim.kid(s);
  const now = Date.now();
  const r = report.weekly(c, { now });
  ok(!/has not been in/.test(r.headline), 'a child who opened the town this week is not told they were away', r.headline);
  c.lastDay = -999; c.goodDays = [];
  const r2 = report.weekly(c, { now, activity: [] });
  ok(/has not been in/.test(r2.headline), 'a child with no day, no good day and no activity this week was not in', r2.headline);
  const r3 = report.weekly(c, { now, activity: [{ a: 'finance', who: 'Mira', d: new Date(now).toISOString().slice(0, 10), m: 4 }] });
  ok(!/has not been in/.test(r3.headline), 'the family activity feed counts as being in');
}

/* 2 · the PIN is a salted hash, and unlocked never survives a reload */
{
  const rec = hashPin('4821');
  ok(typeof rec === 'object' && rec.hash && !JSON.stringify(rec).includes('4821'), 'the stored PIN does not contain the digits');
  ok(checkPin('4821', rec) && !checkPin('4822', rec), 'the right PIN opens, a wrong one does not');
  ok(hashPin('4821').hash !== rec.hash, 'two households with the same PIN store different strings (salted)');
  const old = { v: 10, parent: { created: 1, gate: true, pin: '1234' }, kids: [], active: 0, settings: {}, clock: {} };
  const m = migrate(JSON.parse(JSON.stringify(old)));
  ok(pinSet(m.parent) && checkPin('1234', m.parent.pin) && !JSON.stringify(m).includes('"1234"'), 'an old plain PIN is hashed in place on upgrade, so nobody is locked out');
  ok(!('gate' in m.parent), 'the unlocked flag is no longer kept in the household');
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(!/parent\.gate\s*=/.test(main) && /R\.gate = true/.test(main), 'unlocking sets memory only (R.gate), never the saved household');
  const demo = readFileSync(new URL('../src/demo.js', import.meta.url), 'utf8');
  ok(!/pin\s*=\s*'\d{4}'/.test(demo), 'no pass code is written into client code (the sample household has none)');
}

/* 3 · a lesson closed half-way is still the next step */
{
  const s = mk(), c = sim.kid(s);
  const first = nextStep(c);
  ok(first.card && first.card.id === 'c1a', 'a new child starts at stop 1, "Money is an agreement"', first.card && first.card.id);
  /* open it, answer nothing, close it — and reload */
  c.learn.openCard = first.card.id; c.learn.drill = null;
  c.learn.openCard = null;
  const reloaded = migrate(JSON.parse(JSON.stringify(s)));
  const again = nextStep(sim.kid(reloaded));
  ok(again.card && again.card.id === first.card.id, 'after closing unanswered and reloading, Continue points at the same stop', again.card && again.card.id);
  /* the same through the day's beat: opening it marks nothing */
  c.learn.done.c1a = true;
  const b = nextStep(c);
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const beatOpen = main.slice(main.indexOf("on('beat'"), main.indexOf("on('beat'") + 700);
  ok(!/ledger\.seen\(/.test(beatOpen), 'opening the beat marks nothing as seen');
  c.learn.beat = { shape: 'teach', obj: b.objective ? b.objective.id : null, cardId: b.card.id, answered: false };
  const b2 = nextStep(c);
  ok(b2.card.id === b.card.id, 'a beat opened and left unanswered is still Continue', `${b.card.id} → ${b2.card.id}`);
}

/* 4 · no projection on zero */
{
  const { simFor } = await import('../src/marketgame.js');
  const ms = simFor(7), id = Object.keys(ms.years)[0];
  const y0 = JSON.stringify(shareholderLetter(ms, id, 0));
  ok(!/grew 0\.0%|grew 0%/.test(y0) && /first year/.test(y0), 'a company\'s first letter states its revenue, not "grew 0.0%"', y0.slice(0, 90));
  const v = readFileSync(new URL('../src/views.js', import.meta.url), 'utf8');
  ok(/Not priced yet/.test(v) && /needs a profit first/.test(v), 'a shop with no profit is "not priced yet", never "Sell 10% for ₹0"');
  const mg = readFileSync(new URL('../src/marketgame.js', import.meta.url), 'utf8');
  ok(!/over the last \$\{hist\.length - 1\} years\.<\/p>/.test(mg.replace(/hist\.length > 2 \?[^:]+:/, '')), 'the price line never says "the last 0 years"');
  const rs = readFileSync(new URL('../src/reports.js', import.meta.url), 'utf8');
  ok(/In our first year, revenue was/.test(rs), 'year one reports its revenue rather than "grew 0.0%"');
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
