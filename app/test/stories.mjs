/* stories.mjs — a story for every place, held to the app's rules.

   Five stories, one per place; five to seven short pages each; nobody on a page
   who is not in the town's cast; and no figure in the words — every amount is a
   {units} placeholder priced at render, so the currency stays a setting and no
   number can pass for a real-world one (rule 6). Each rule was watched failing
   first (a sixth sentence, a stray "10", a stranger, an amount that rounds). */
import { STORIES, POSES, plain } from '../src/stories.js';
import { WORLDS, CAST_NAMES } from '../src/content.js';
import { BLD } from '../src/buildings-gen.js';
import { CURRENCIES, setCurrency, price } from '../src/fmt.js';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log(`${c ? '  ok  ' : '  FAIL'} ${label}${detail ? '   ' + detail : ''}`); };

const ids = Object.keys(STORIES);
ok(ids.length === 5 && WORLDS.every((w) => STORIES[w.id]), 'five stories, one for every place', ids.join(', '));
ok(ids.every((id) => WORLDS.some((w) => w.id === id)), 'every story names a world that exists');

/* a sentence ends at . ! or ? (and any closing quote) before a capital or the end —
   so “Up!” said Bo is one sentence, as a child reads it */
const sentences = (t) => (t.match(/[.!?…]+[”’"]?(?=\s+[“"A-Z]|\s*$)/g) || []).length;
const all = ids.flatMap((id) => STORIES[id].pages.map((p, i) => ({ id, i, ...p })));

ok(ids.every((id) => { const n = STORIES[id].pages.length; return n >= 5 && n <= 7; }), 'each story is five to seven pages',
  ids.map((id) => id + ':' + STORIES[id].pages.length).join(' '));
const long = all.filter((p) => { const n = sentences(p.text); return n < 1 || n > 3; });
ok(!long.length, 'every page is one to three sentences', long.map((p) => `${p.id}#${p.i + 1}=${sentences(p.text)}`).join(' '));
ok(ids.every((id) => STORIES[id].title && STORIES[id].learned && sentences(STORIES[id].learned) === 1), 'every story has a title and ends on one line of what Pip learned');

/* rule 6: no digit anywhere in the words except inside a {units} placeholder */
const words = (t) => t.replace(/\{\d+\}/g, '');
const digits = [...all.map((p) => [p.id + '#' + (p.i + 1), p.text]), ...ids.flatMap((id) => [[id + ' title', STORIES[id].title], [id + ' learned', STORIES[id].learned]])]
  .filter(([, t]) => /\d/.test(words(t)));
ok(!digits.length, 'no figure in the words — every amount is a money placeholder', digits.map((d) => d[0]).join(' '));
ok(!all.some((p) => /%|per cent|percent|per (annum|year)/i.test(p.text)), 'no rate and no percentage in any story');

/* amounts price whole in every currency, so a page's sum adds up whatever the setting */
const amts = [...new Set(all.flatMap((p) => [...p.text.matchAll(/\{(\d+)\}/g)].map((m) => +m[1])))];
const ragged = [];
for (const cur of Object.keys(CURRENCIES)) { setCurrency(cur); amts.forEach((u) => { if (price(u) !== u * price(20) / 20) ragged.push(cur + ':' + u); }); }
setCurrency('INR');
ok(amts.length > 5 && !ragged.length, 'every amount prices exactly in every currency, so the sums hold', ragged.join(' ') || amts.join(', ') + ' units');
ok(!/\{/.test(plain(all.map((p) => p.text).join(' '))), 'every placeholder is replaced at render');

/* the cast is the town's own five; nobody new walks on, in a picture or in the words */
const cast = Object.keys(CAST_NAMES);
const strangers = all.flatMap((p) => p.who.map((w) => w.split(':')).filter(([who, pose]) => !cast.includes(who) || (pose && (who !== 'pip' || !POSES.includes(pose)))).map((x) => `${p.id}#${p.i + 1}:${x.join(':')}`));
ok(!strangers.length && all.every((p) => p.who.length >= 1 && p.who.length <= 2), 'every page shows one or two of the existing cast, Pip in a pose that exists', strangers.join(' '));
const named = (t) => Object.values(CAST_NAMES).filter((n) => t.includes(n.split(' ')[0]));
ok(all.every((p) => named(p.text).length), 'every page names someone from the cast', all.filter((p) => !named(p.text).length).map((p) => p.id + '#' + (p.i + 1)).join(' '));
/* the picture agrees with the words: anyone drawn besides Pip (who listens) is in that page's text */
const unsaid = all.flatMap((p) => p.who.map((w) => w.split(':')[0]).filter((w) => w !== 'pip' && !p.text.includes(CAST_NAMES[w].split(' ')[0])).map((w) => `${p.id}#${p.i + 1}:${w}`));
ok(!unsaid.length, 'everyone drawn on a page (besides Pip) is in its words', unsaid.join(' '));
ok(ids.every((id) => STORIES[id].pages.some((p) => p.who.some((w) => w.startsWith('pip')))), 'Pip is in every story');
ok(all.every((p) => !p.bld || BLD[p.bld]), 'every building on a page is one of the town’s painted buildings');
ok(all.every((p) => p.pan == null || (p.pan >= 0 && p.pan <= 100)), 'every pan is a place on the plate (0–100)');

/* credit is a tool with a price: the borrowing story states the price, and nobody is shamed */
const clock = STORIES.clock.pages.map((p) => p.text).join(' ');
ok(/price of borrowing/.test(clock) && /never a verdict/.test(clock), 'the borrowing story prices credit and says a record is never a verdict');
ok(!all.some((p) => /\b(stupid|silly|lazy|bad person|ashamed|shame|greedy|fool)\b/i.test(p.text)), 'nobody in any story is shamed');

console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
