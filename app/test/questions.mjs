/* questions.mjs — every question a child can be asked, tested (FAMILY-
   STANDARD §6, D8), and every stated sum checked (D7).

   Questions: the 32 chapter cards (each with its follow-ups), the objective
   file's own teaching cards, and the 144 retrieval items. Each must have
   exactly one right answer, distinct options, an answer that is not printed
   in its own stem, and — across the whole bank — the right answer must land
   in each slot about as often as any other once shuffled, because position
   leaks an answer as surely as text does.

   Sums: any "a × b = c", "a ÷ b = c", "a + b = c" or "N a month is M a year"
   in the teaching text, letters or glossary must be true. A number that
   contradicts its own arithmetic is the cheapest trust to lose.

   Run: node test/questions.mjs */
import { ALL_CARDS, LETTERS, GLOSSARY, drillCount, drillAt, shuffledDrill, hintFor, leaks } from '../src/content.js';
import { OBJECTIVES, NEW_CARD_LIST, assessCard, validate } from '../src/objectives.js';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
const strip = (s) => String(s || '').replace(/<[^>]+>/g, '');

console.log('\nQuestions & sums\n' + '─'.repeat(56));

/* the objectives file's own schema rules */
const errs = validate(ALL_CARDS);
ok(Array.isArray(errs) && errs.length === 0, 'objectives validate() is clean', (errs || []).slice(0, 3).join(' | '));

/* the bank */
const bank = [];
for (const card of [...ALL_CARDS, ...NEW_CARD_LIST]) for (let qi = 0; qi < drillCount(card); qi++) bank.push({ card, qi, d: drillAt(card, qi) });
for (const o of OBJECTIVES) (o.assess || []).forEach((_, i) => { const card = assessCard(o, i); bank.push({ card, qi: 0, d: card.drill }); });
ok(bank.length >= 200, 'the bank holds every question a child can meet', bank.length + ' questions');

const bad = { answer: [], dupes: [], leak: [], why: [] };
const slots = [0, 0, 0, 0];
for (const { card, qi, d } of bank) {
  const tag = `${card.id}#${qi}`;
  if (!Array.isArray(d.opts) || d.opts.length < 2 || !Number.isInteger(d.a) || d.a < 0 || d.a >= d.opts.length) { bad.answer.push(tag); continue; }
  const norm = d.opts.map((o) => strip(o).trim().toLowerCase());
  if (new Set(norm).size !== norm.length) bad.dupes.push(tag);
  const ans = norm[d.a];
  /* the answer's text must not sit in the question — a long answer word for
     word, or a short one as a whole word */
  const stem = strip(d.q).toLowerCase();
  const inStem = (x) => (x.length >= 12 && stem.includes(x)) || (x.length >= 3 && x.length < 12 && !/^\d+$/.test(x) && new RegExp(`(^|\\W)${x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|\\W)`).test(stem));
  /* a comparison stem ("offer A or offer B?") names every option; it leaks
     only when it singles the answer out */
  if (inStem(ans) && !norm.some((x, i) => i !== d.a && inStem(x))) bad.leak.push(`${tag}: "${ans}"`);
  if (!strip(d.why).trim()) bad.why.push(tag);
  const sh = shuffledDrill(card, qi);
  if (sh.opts[sh.answer] !== d.opts[d.a]) bad.answer.push(tag + ' (shuffle lost the answer)');
  if (d.opts.length === 4) slots[sh.answer]++;
}
ok(!bad.answer.length, 'every question has exactly one right answer, and shuffling keeps it', bad.answer.slice(0, 3).join(' '));
ok(!bad.dupes.length, 'no question repeats an option', bad.dupes.slice(0, 3).join(' '));
ok(!bad.leak.length, "no question prints its own answer in the stem", bad.leak.slice(0, 3).join(' | '));
ok(!bad.why.length, 'every question says why', bad.why.slice(0, 3).join(' '));
const n4 = slots.reduce((a, b) => a + b, 0);
const share = slots.map((s) => s / n4);
ok(share.every((x) => x > 0.17 && x < 0.33), 'shuffled, the answer lands in each slot about a quarter of the time', slots.join('/') + ' of ' + n4);
const authored = bank.filter((b) => b.d.opts.length === 4).map((b) => b.d.a);
const most = Math.max(...[0, 1, 2, 3].map((k) => authored.filter((a) => a === k).length)) / authored.length;
ok(most > 0.4, 'the authored slots ARE lopsided — which is exactly why the shuffle exists', Math.round(most * 100) + '% in one slot before shuffling');

/* the sums */
const texts = [];
for (const c of [...ALL_CARDS, ...NEW_CARD_LIST]) { texts.push([c.id, c.teach], [c.id, c.eg]); for (let qi = 0; qi < drillCount(c); qi++) texts.push([c.id + '#' + qi, drillAt(c, qi).why]); }
for (const l of LETTERS) { texts.push([l.id, l.body]); l.choices.forEach((ch, i) => texts.push([l.id + '.' + i, ch.note])); }
for (const g of GLOSSARY) texts.push(['gloss:' + g[0], g.slice(1).join(' ')]);
const num = (s) => +String(s).replace(/,/g, '');
const wrong = []; let checked = 0;
for (const [id, raw] of texts) {
  const t = strip(raw);
  for (const m of t.matchAll(/(\d[\d,]*)\s*([×x÷+])\s*(\d[\d,]*)\s*=\s*(\d[\d,]*)/g)) {
    const [a, op, b, c] = [num(m[1]), m[2], num(m[3]), num(m[4])];
    const v = op === '÷' ? a / b : op === '+' ? a + b : a * b;
    checked++; if (Math.abs(v - c) > 1e-9) wrong.push(`${id}: ${m[0]}`);
  }
  for (const m of t.matchAll(/(\d[\d,]*) [a-z]+ at (\d[\d,]*) = (\d[\d,]*)/g)) { checked++; if (num(m[1]) * num(m[2]) !== num(m[3])) wrong.push(`${id}: ${m[0]}`); }
  for (const m of t.matchAll(/(\d[\d,]*) a month is (\d[\d,]*) a year/g)) { checked++; if (num(m[1]) * 12 !== num(m[2])) wrong.push(`${id}: ${m[0]}`); }
}
ok(checked >= 5, 'the lint finds the sums it should check', checked + ' sums');
ok(!wrong.length, 'every stated sum is true', wrong.slice(0, 3).join(' | '));

/* E5/E6/E11 · the hint shown after a wrong first pick never names the answer
   — the explanation (why) waits for the second go. Every question in the bank. */
{
  const leaky = [];
  for (const { card, qi, d } of bank) { const h = hintFor(card, qi); if (!h || leaks(h, d)) leaky.push(`${card.id}#${qi}: ${h}`); }
  ok(!leaky.length, 'every hint is non-revealing (no telling word of the right answer)', leaky.slice(0, 2).join(' | '));
  /* the checker itself catches a hint that names the answer */
  const probe = bank.find((b) => b.card.id === 'c1b').d;
  ok(leaks('Think about the umbrella.', probe) && !leaks('A need is something you would be in trouble without.', probe), 'leaks() catches a hint naming the answer, and passes one that does not');
}

console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
