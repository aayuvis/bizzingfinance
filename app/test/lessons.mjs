/* lessons.mjs — the narrated lesson on every stop (lessonplayer.js; the doubling found 29 stops
   with none). Every stop on the Atlas has one; every beat speaks only the stage's tiny vocabulary
   (the player throws on anything else, so a typo would strand a child mid-lesson); a beat with a
   clip has its clip on disk, and a beat with none is read in the device's own voice (ui.say) in
   both builds; and a narration states no number its stop does not (rule 6, as sprout.mjs holds
   the Sprout readings to it). Run: node test/lessons.mjs */
import { readFileSync, existsSync } from 'node:fs';
import { ALL_CARDS, drillCount, drillAt } from '../src/content.js';
import { NEW_CARD_LIST } from '../src/objectives.js';
/* numbers as sprout.mjs counts them: every digit run and every number word ("one" left out —
   it is a pronoun far more often than a figure) */
const NUMWORD = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000 };
const numbersOf = (t) => { const s = String(t ?? '').replace(/<[^>]+>/g, '').toLowerCase();
  return new Set([...(s.match(/\d[\d,]*(\.\d+)?/g) || []).map((x) => Number(x.replace(/,/g, ''))), ...(s.match(/[a-z]+/g) || []).filter((w) => NUMWORD[w] != null).map((w) => NUMWORD[w])]); };

const read = (f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
const ids = (src) => [...src.matchAll(/'([a-z0-9-]+)': \(\) => import\('\.\/lessons\/([a-z0-9.-]+)\.js'\)/g)].map((m) => [m[1], m[2]]);
const WEB = Object.fromEntries(ids(read('lessonindex-list.js'))), LITE = Object.fromEntries(ids(read('lessonindex-lite.js')));
const POSES = [...read('lessons-poses.js').matchAll(/'([a-z-]+)': \{/g)].map((m) => m[1]);
const ITEMS = Object.keys(Function('return ' + /export const ITEM_ICON = (\{[\s\S]*?\});/.exec(read('lessonplayer.js'))[1])());

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nLessons · every stop narrated, the stage\'s own words, no new number\n' + '─'.repeat(56));

const STOPS = [...ALL_CARDS, ...NEW_CARD_LIST];
const L = {};
for (const k of STOPS) if (WEB[k.id]) L[k.id] = (await import(`../src/lessons/${WEB[k.id]}.js`)).default;
const without = STOPS.filter((k) => !L[k.id]).map((k) => k.id);
ok(STOPS.length >= 61 && !without.length, 'every stop on the Atlas has a narrated lesson', `${STOPS.length - without.length}/${STOPS.length}` + (without.length ? ' · none for ' + without.slice(0, 6).join(' ') : ''));
ok(Object.keys(WEB).every((id) => LITE[id]), 'the one-file build lists every lesson the web build does', Object.keys(WEB).filter((id) => !LITE[id]).join(' '));

/* the stage: only the player's vocabulary, with real items and poses (lessonplayer.js apply()) */
const bad = [];
for (const [id, les] of Object.entries(L)) les.beats.forEach((b, i) => {
  for (const cmd of b.stage.split(';').map((s) => s.trim()).filter(Boolean)) {
    const m = /^(\w+)\(([^)]*)\)$/.exec(cmd); if (!m) { bad.push(`${id}#${i} “${cmd}”`); continue; }
    const [, op, args] = m, a = args.split(',').map((s) => s.trim());
    const fine = { avatar: () => POSES.includes(a[0]) || POSES.includes('nana-' + a[0]), show: () => ITEMS.includes(a[0]), swap: () => ITEMS.includes(a[0]),
      sort: () => ITEMS.includes(a[0]) && ['a', 'b'].includes(a[1]), cols: () => a.length === 2 && a.every(Boolean), sweep: () => ['a', 'b'].includes(a[0]),
      banner: () => !!args.trim(), weather: () => ['sun', 'rain'].includes(a[0]) }[op];
    if (!fine || !fine()) bad.push(`${id}#${i} ${cmd}`);
  }
  if (!(b.dur > 0) || !String(b.line || '').trim()) bad.push(`${id}#${i} no line or length`);
});
ok(!bad.length, 'every beat speaks only the stage\'s vocabulary — real poses, real items, two sides — and has a line and a length', bad.slice(0, 4).join(' | '));

/* a clip, or the device's voice: a keyed beat's clip is on disk; a lesson with no clip is one
   module for both builds, and the player hands its line to ui.say and waits for the voice */
const missingClip = [];
for (const les of Object.values(L)) for (const b of les.beats) if (b.key && !existsSync(new URL(`../public/voice/lessons/${b.key}.mp3`, import.meta.url))) missingClip.push(b.key);
const voiced = Object.entries(L).filter(([, les]) => les.beats.every((b) => !b.key)).map(([id]) => id);
const player = read('lessonplayer.js').replace(/\/\*[\s\S]*?\*\//g, '');
ok(!missingClip.length && voiced.length >= 29 && voiced.every((id) => WEB[id] === LITE[id] && WEB[id] === id) && /if \(!b\.key\)[\s\S]{0,400}say\(b\.line, next\)/.test(player),
  'a recorded beat has its clip; a beat with none is read aloud in the device\'s own voice, from one module in both builds', `${voiced.length} lessons in the device's voice` + (missingClip.length ? ' · no clip for ' + missingClip[0] : ''));

/* rule 6: a narration may say a number only if its stop already does (teaching, example, questions) */
const added = [];
for (const k of STOPS) {
  if (!L[k.id]) continue;
  const have = new Set([...numbersOf(k.teach), ...numbersOf(k.eg)]);
  for (let i = 0; i < drillCount(k); i++) { const d = drillAt(k, i); [d.q, ...(d.opts || []), d.why, d.value].forEach((t) => numbersOf(String(t ?? '')).forEach((n) => have.add(n))); }
  if (!voiced.includes(k.id)) continue;                 /* the recorded narration is the clip's own words */
  L[k.id].beats.forEach((b, i) => { const extra = [...numbersOf(b.line)].filter((n) => !have.has(n)); if (extra.length) added.push(`${k.id}#${i}: ${extra.join(', ')}`); });
}
ok(!added.length, 'a narration written for the device\'s voice states no number its stop does not', added.slice(0, 4).join(' | '));

console.log('─'.repeat(56) + `\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
