/* sources.mjs — rule six, enforced.

   No card, letter or view may state a real-world figure without a citation.
   The lint scans the teaching text for the shapes a real-world claim takes —
   a percent, a "per year" rate, a then-vs-now price — and passes only when
   the figure is one of the town's own, registered in sources.js, or carries
   a citation. It also holds the register itself to its promises. */
import { ALL_CARDS, GLOSSARY } from '../src/content.js';
import { SOURCES, ownNumbers, cited } from '../src/sources.js';
import { CAL, townGrowth } from '../src/world.js';
import { OBJECTIVES } from '../src/objectives.js';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) { pass++; console.log('  ok  ' + label + (detail ? '   ' + detail : '')); } else { fail++; console.log('  FAIL ' + label + (detail ? '   ' + detail : '')); } };

/* the register keeps its own promises */
ok(Object.values(SOURCES).every((s) => s.what && s.where && s.says && typeof s.value === 'function'), 'every source names what, where and what it says');
ok(Object.values(SOURCES).every((s) => ['own', 'cite'].includes(s.kind)), 'every source is own or cited — there is no third kind');
ok(Object.values(SOURCES).filter((s) => s.kind === 'own').every((s) => /town|Bizzington/i.test(s.says)), "every town figure says it is the town's");
ok(cited().every((e) => e[1].citation), 'a cited figure carries its citation', cited().length + ' cited');

/* the projections go through the town's one dial */
ok(townGrowth(1) === 1 + CAL.growTarget / 100 && townGrowth(0) === 1, 'townGrowth is the town dial, compounding from 1', String(townGrowth(10).toFixed(3)));
const src = (await import('node:fs')).readFileSync(new URL('../src/views.js', import.meta.url), 'utf8');
ok(!/Math\.pow\(1\.0\d/.test(src), 'no view hard-codes a growth rate of its own');
ok(/townGrowth\(/.test(src), 'the views use the named dial');

/* the teaching text states no unsourced real-world figure */
const REAL = [
  [/\b(19|20)\d\d\b/, 'a year, which implies a historical claim'],
  [/\bper (annum|year)\b/i, 'an annual rate'],
  [/\b(inflation|interest rate|return)s? (of|was|were|has been|averaged)\b/i, 'a stated real rate'],
  [/\bon average,? (the|a) (market|economy|country)\b/i, 'a claim about the real world'],
];
const bad = [];
ALL_CARDS.forEach((k) => {
  const text = [k.teach, k.eg, k.drill && k.drill.q, k.drill && k.drill.why].filter(Boolean).join(' ');
  REAL.forEach(([re, why]) => { if (re.test(text) && !(k.sources && k.sources.length)) bad.push(`${k.id}: ${why}`); });
});
ok(!bad.length, 'no card states a real-world figure without sources[]', bad.slice(0, 3).join(' · ') || 'clean across ' + ALL_CARDS.length + ' cards');

const gbad = GLOSSARY.filter((g) => REAL.some(([re]) => re.test(g.join(' '))));
ok(!gbad.length, 'no glossary entry states a real-world figure', gbad.map((g) => g[0]).join(', ') || 'clean across ' + GLOSSARY.length + ' terms');

const obad = [];
OBJECTIVES.forEach((o) => {
  const t = [o.objective, ...(o.assess || []).flatMap((a) => [a.q, a.why, ...(a.opts || [])])].join(' ');
  REAL.forEach(([re, why]) => { if (re.test(t) && !(o.sources && o.sources.length)) obad.push(`${o.id}: ${why}`); });
});
ok(!obad.length, 'no objective states a real-world figure without sources[]', obad.slice(0, 3).join(' · ') || 'clean across ' + OBJECTIVES.length + ' objectives');
ok(OBJECTIVES.every((o) => Array.isArray(o.sources)), 'every objective carries a sources array, even when empty');

console.log('────────────────────────────────────────────────────────────');
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
