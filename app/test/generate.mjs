/* generate.mjs — the town's own retrieval items (generate.js, audit A3).

   Every template, many seeds, every currency, a small and a big maths ceiling: the typed
   answer is a whole positive number that is not printed in its own question, the hint is a
   method and never a number, a four-option one has exactly one right answer, the numbers
   grow with the ceiling, and the ledger really does alternate into them after the three
   authored items. Run: node test/generate.mjs */
import { GEN, genCard, numbersIn } from '../src/generate.js';
import { OBJECTIVES } from '../src/objectives.js';
import { setCurrency, CURRENCIES } from '../src/fmt.js';
import { cardById, genReady } from '../src/cards.js';
import { GEN_IDS } from '../src/gen-ids.js';
await genReady();
import { shuffledDrill, hintFor } from '../src/content.js';
import * as sim from '../src/sim.js';
import * as mastery from '../src/mastery.js';
import * as ledger from '../src/ledger.js';
import { ALL_CARDS } from '../src/content.js';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nGenerated items · fresh numbers, same idea\n' + '─'.repeat(56));

const ids = Object.keys(GEN);
ok(ids.length === GEN_IDS.size && ids.every((id) => GEN_IDS.has(id)), 'the first screen\'s list of generated objectives (gen-ids.js) is exactly generate.js\'s', [...GEN_IDS].filter((x) => !ids.includes(x)).concat(ids.filter((x) => !GEN_IDS.has(x))).join(' '));
ok(ids.every((id) => OBJECTIVES.some((o) => o.id === id)), `every template names a real objective (${ids.length})`);
const missing = OBJECTIVES.filter((o) => !GEN[o.id]).map((o) => o.id);
ok(ids.length === OBJECTIVES.length && !missing.length, `every objective has a template (${ids.length}/${OBJECTIVES.length})`, missing.join(' '));
const bad = [], leak = [], hint = [], mcq = [], noWhy = [], stems = {}, mixed = [];
for (const cur of Object.keys(CURRENCIES)) {
  setCurrency(cur);
  for (const id of ids) {
    const o = OBJECTIVES.find((x) => x.id === id);
    for (let seed = 1; seed <= 60; seed++) for (const ceil of [4, 12]) {
      const k = genCard(o, seed, { ceil }), d = k.drill;
      const shape = d.kind === 'num' ? 'num' : 'mcq';
      (stems[id] = stems[id] || { shape, q: new Set() }).q.add(d.q);
      if (stems[id].shape !== shape) mixed.push(id);
      if (d.kind === 'num') {
        if (!(Number.isInteger(d.value) && d.value > 0)) bad.push(`${cur} ${k.id} ${d.value}`);
        if (numbersIn(d.q).includes(d.value)) leak.push(`${cur} ${k.id}: ${d.q}`);
        if (numbersIn(hintFor(k)).length) hint.push(`${cur} ${k.id}: ${hintFor(k)}`);
        if (!d.why) bad.push(k.id + ' no why');
      } else {
        const sd = shuffledDrill(k);
        if (d.opts.length < 3 || d.opts.length > 4 || new Set(d.opts).size !== d.opts.length || sd.opts[sd.answer] !== d.opts[d.a]) mcq.push(`${cur} ${k.id}`);
        if (!d.why || !String(d.why).trim()) noWhy.push(`${cur} ${k.id}`);
      }
    }
  }
}
ok(!bad.length, 'every typed answer is a whole, positive amount with a why', bad.slice(0, 3).join(' | '));
ok(!leak.length, 'no typed answer is printed in its own question', leak.slice(0, 2).join(' | '));
ok(!hint.length, 'a hint is a method, never a number', hint.slice(0, 2).join(' | '));
ok(!mcq.length, 'a four-option one has distinct options and one answer that survives the shuffle', mcq.slice(0, 3).join(' | '));
ok(!noWhy.length, 'every four-option one has a why that teaches', noWhy.slice(0, 3).join(' | '));
ok(!mixed.length, 'each template keeps one shape', [...new Set(mixed)].join(' '));
/* a judgement question is built from pools, so it is not one sentence with a name swapped:
   at least six different stems across the seeds, in the default currency */
{
  setCurrency('INR'); const thin = [];
  for (const id of ids) {
    if (stems[id].shape !== 'mcq') continue;
    const o = OBJECTIVES.find((x) => x.id === id), qs = new Set();
    for (let seed = 1; seed <= 60; seed++) qs.add(genCard(o, seed, { ceil: 6 }).drill.q);
    if (qs.size < 6) thin.push(`${id} (${qs.size})`);
  }
  const nm = ids.filter((id) => stems[id].shape === 'mcq').length;
  ok(!thin.length, `every four-option template asks at least six different questions over 60 seeds (${nm} templates)`, thin.join(' '));
}

/* the number spine: a child who has met small numbers gets small numbers */
setCurrency('INR');
const avg = (ceil) => { let t = 0, n = 0; for (const id of ['EARN-2', 'KEEP-1', 'CHOOSE-7']) for (let s = 1; s <= 40; s++) { t += genCard(OBJECTIVES.find((o) => o.id === id), s, { ceil }).drill.value; n++; } return t / n; };
ok(avg(12) > avg(4) * 2, 'numbers grow with the maths ceiling', `${Math.round(avg(4))} → ${Math.round(avg(12))}`);
ok(JSON.stringify(genCard(OBJECTIVES.find((o) => o.id === 'KEEP-1'), 9, { ceil: 5 })) === JSON.stringify(genCard(OBJECTIVES.find((o) => o.id === 'KEEP-1'), 9, { ceil: 5 })), 'the same id is always the same question');

/* the ledger alternates into them, and the id resolves back to the same card */
{
  const s = sim.newState(); const c = sim.newChild('Asha', 'builder', 'INR'); s.kids.push(c);
  const o = OBJECTIVES.find((x) => x.id === 'EARN-2'), D = 864e5; let t = Date.UTC(2026, 0, 1);
  mastery.introduce(c, o.id, t); mastery.check(c, o.id, true, t);
  const seen = [];
  for (let i = 0; i < 8; i++) {
    t += 70 * D;
    const card = ledger.itemFor(c, o);
    seen.push(card.generated ? 'gen' : 'auth');
    if (card.generated) { const seed = +card.id.split('~')[1]; ok(JSON.stringify(cardById(card.id, c).drill) === JSON.stringify(genCard(o, seed, { ceil: ledger.mathsCeiling(c) }).drill) && card.pending, `the ledger names a generated question without writing it, and its id opens it (${card.id})`); }
    ledger.answer(c, { shape: 'retrieve', objective: o, card }, true, t);
  }
  ok(seen.slice(0, 3).every((x) => x === 'auth') && seen.slice(3).includes('gen') && seen.slice(3).includes('auth'), 'the three authored items first, then generated ones alternate in', seen.join(','));
}

/* the lesson stops: every one of the forty can be practised, asked fresh */
{
  const { practiceFor, practiceCard } = await import('../src/cards.js');
  const without = ALL_CARDS.filter((k) => !practiceFor(k)).map((k) => k.id);
  ok(!without.length, `every lesson stop can be practised (${ALL_CARDS.length - without.length}/${ALL_CARDS.length})`, without.join(' '));
  const k = ALL_CARDS.find((x) => x.id === 'c2a');
  ok(practiceCard(k, 0).id !== practiceCard(k, 1).id, '"Another one" is another question');
}
console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
