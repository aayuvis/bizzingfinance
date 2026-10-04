/* worked.mjs — E3, the sum written out on every arithmetic stop.

   Every stop whose idea needs arithmetic carries a worked example; every written sum is
   right; every number in it is the card's own, a registered town dial, a calendar/halving
   fact, or the result of a sum written out beside it; and it never ends on the answer to
   one of the stop's own checks. Generated practice (generate.js) carries a worked example
   too, from the generator's own parameters, and it never equals the question's answer.

   Run: node test/worked.mjs */
import { ALL_CARDS, drillCount, drillAt, JOBS, HOMES, STOCK } from '../src/content.js';
import { ITEMS } from '../src/items.js';
import { SOURCES } from '../src/sources.js';
import { setCurrency, price, CURRENCIES } from '../src/fmt.js';
import { readFileSync } from 'node:fs';
import * as W from '../src/worked.js';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nWorked examples on the arithmetic stops (E3)\n' + '─'.repeat(56));

const ar = W.arithmeticStops();
ok(ar.length >= 20, 'the arithmetic stops are found from the content, not a list', ar.map((k) => k.id).join(' '));
ok(!W.isArithmetic(ALL_CARDS.find((k) => k.id === 'c1b')) && !W.isArithmetic(ALL_CARDS.find((k) => k.id === 'c5b')), 'a stop with no sum to do is not called arithmetic (needs and wants, the three secrets)');

/* the town's dials, in whatever currency is set */
const DIAL_UNITS = {
  wages: () => JOBS.map((j) => j.units),
  homes: () => HOMES.flatMap((h) => [h.rent, h.food, ...h.bills.map((b) => b.units)]),
  stock: () => STOCK.flatMap((s) => [s.cost, s.sells]),
};
const GLUE = [2, 10, 12];   /* halving and doubling, a tenth, the months in a year */
const strip = (t) => String(t).replace(/<[^>]+>/g, '').replace(/₹|\$|£|€|د\.إ/g, '').replace(/(\d)[,.](\d{3})(?!\d)/g, '$1$2');
const EQ = /(\d+(?:\.\d+)?(?:\s*[+−×÷-]\s*\d+(?:\.\d+)?)+)\s*=\s*(\d+(?:\.\d+)?)/g;
const evalExpr = (e) => Function('return (' + e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-') + ')')();
const ownText = (k) => {
  const qs = []; for (let i = 0; i < drillCount(k); i++) { const d = drillAt(k, i); qs.push(d.q, d.why, ...(d.opts || [])); }
  const it = ITEMS[k.id];
  return [k.teach, k.eg, ...qs, it && it.q, it && it.title].filter(Boolean).join(' ');
};

function audit(cur) {
  setCurrency(cur);
  const missing = [], wrongSum = [], foreign = [], answer = [], dial = [];
  for (const k of ar) {
    const w = W.worked(k.id);
    if (!w || !w.steps || !w.steps.length || typeof w.result !== 'number') { missing.push(k.id); continue; }
    (w.dials || []).forEach((dk) => { if (!SOURCES[dk] || SOURCES[dk].kind !== 'own' || !DIAL_UNITS[dk]) dial.push(k.id + ':' + dk); });
    const text = strip(w.steps.join(' '));
    const rhs = [];
    for (const m of text.matchAll(EQ)) { const v = evalExpr(m[1]); rhs.push(Number(m[2])); if (Math.abs(v - Number(m[2])) > 1e-9) wrongSum.push(`${k.id}: ${m[0]}`); }
    const allowed = new Set([...W.numbersIn(strip(ownText(k))), ...GLUE, ...rhs, ...(w.dials || []).flatMap((dk) => (DIAL_UNITS[dk] ? DIAL_UNITS[dk]().map(price) : []))]);
    W.numbersIn(text).forEach((n) => { if (!allowed.has(n)) foreign.push(`${k.id}: ${n}`); });
    if (!rhs.includes(w.result) && !W.numbersIn(text).includes(w.result)) foreign.push(`${k.id}: result ${w.result} is never written`);
    if (w.result <= 0) answer.push(`${k.id}: ends on ${w.result}`);
    if (W.checkAnswers(k).includes(w.result)) answer.push(`${k.id}: ends on ${w.result}, an answer of its own check`);
  }
  return { missing, wrongSum, foreign, answer, dial };
}
const r = audit('INR');
ok(!r.missing.length, 'every arithmetic stop has a worked example', r.missing.join(' ') || `${ar.length} stops`);
ok(!r.wrongSum.length, 'every sum written in a worked example is right', r.wrongSum.slice(0, 4).join(' · '));
ok(!r.foreign.length, 'every number is the card’s own, a town dial, the calendar, or a sum written beside it', r.foreign.slice(0, 4).join(' · '));
ok(!r.dial.length, 'every dial a worked example uses is a town figure registered in sources.js', r.dial.join(' '));
ok(!r.answer.length, 'no worked example ends on the answer to its own stop’s questions or Your-turn', r.answer.slice(0, 4).join(' · '));
const other = Object.keys(CURRENCIES).filter((c) => c !== 'INR').map((c) => [c, audit(c)]).filter(([, x]) => x.wrongSum.length || x.foreign.length || x.answer.length || x.missing.length);
ok(!other.length, 'the town-dial examples still add up, in every currency', other.map(([c, x]) => c + ': ' + [...x.wrongSum, ...x.foreign, ...x.answer].slice(0, 2).join(' · ')).join(' | '));
setCurrency('INR');
ok(Object.keys(W.WORKED).every((id) => ar.some((k) => k.id === id)), 'no worked example sits on a stop with no sum to do');

/* the teach view shows it, in the Show-me-how style, and never in a stop answered cold */
const views = readFileSync(new URL('../src/views.js', import.meta.url), 'utf8');
const vc = (views.match(/function viewCard\(card\) \{[\s\S]*?\n\}/) || [''])[0];
ok(/workedBlock\(card\)/.test(vc) && /function workedBlock\(card\)[\s\S]*?class="[^"]*yhow/.test(views), 'the teach view renders the worked example as a Show-me-how block');
ok(vc.indexOf('workedBlock(card)') > vc.indexOf("R.cold === card.id ?"), 'a stop answered cold hides the worked example with the lesson');

/* generated practice: the worked example is a sibling question drawn from the same generator */
const G = await import('../src/generate.js');
const { OBJECTIVES } = await import('../src/objectives.js');
const gbad = []; let gn = 0;
for (const o of OBJECTIVES.filter((x) => G.hasGen(x.id))) {
  for (const ceil of [4, 9, 14]) for (let seed = 1; seed <= 40; seed++) {
    const k = G.genCard(o, seed, { ceil }); if (k.drill.kind !== 'num') continue;
    gn++;
    const w = k.drill.worked;
    if (!w || !w.q || !w.why || typeof w.value !== 'number') { gbad.push(`${k.id}: none`); continue; }
    if (w.value === k.drill.value) gbad.push(`${k.id}: same answer`);
    if (w.q === k.drill.q) gbad.push(`${k.id}: same question`);
    if (G.numbersIn(w.q).includes(w.value)) gbad.push(`${k.id}: its own question prints its answer`);
    if (G.numbersIn(w.q + ' ' + w.why).includes(k.drill.value)) gbad.push(`${k.id}: the worked example prints this question’s answer`);
  }
}
ok(gn > 100 && !gbad.length, 'every generated amount carries a worked example from its own generator, never with the same answer', gbad.slice(0, 3).join(' · ') || `${gn} items`);

console.log('─'.repeat(56));
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
