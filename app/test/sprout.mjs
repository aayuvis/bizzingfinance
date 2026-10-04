/* sprout.mjs — the Sprout reading level (audit E2): every stop on the Atlas has a reading
   for an 8–10 year old, it is plainer than the builder text by measure, it states no number
   the builder text does not, and a Sprout's card shows it while a Builder's card does not.

   Run: node test/sprout.mjs */
import { ALL_CARDS, hintFor } from '../src/content.js';
import { NEW_CARD_LIST } from '../src/objectives.js';
import { SPROUT, teachFor, egFor } from '../src/sprout.js';
import * as sim from '../src/sim.js';
import { R } from '../src/runtime.js';
import * as V from '../src/views.js';
import * as daily from '../src/daily.js';
import { esc } from '../src/ui.js';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nSprout reading · every stop, plainer, no new number, on the card\n' + '─'.repeat(56));

const plain = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const STOPS = [...ALL_CARDS, ...NEW_CARD_LIST];

/* sentence length: words (tokens with a letter or digit — never a "/" or "—") per sentence */
const sentences = (t) => plain(t).split(/(?<=[.!?])\s+/).filter((s) => /[a-z0-9]/i.test(s));
const wordsIn = (s) => s.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
export const avgLen = (t) => { const ss = sentences(t); return ss.reduce((n, s) => n + wordsIn(s), 0) / Math.max(1, ss.length); };

/* numbers: every digit run (commas dropped, "600g" is 600, "10%" is 10) and every number
   word, as values. "one" is left out: it is a pronoun far more often than a figure. */
const NUMWORD = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30,
  forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000, million: 1e6 };
export const numbersOf = (t) => {
  const s = plain(t).toLowerCase();
  const digits = (s.match(/\d[\d,]*(\.\d+)?/g) || []).map((x) => Number(x.replace(/,/g, '')));
  const words = (s.match(/[a-z]+/g) || []).filter((w) => NUMWORD[w] != null).map((w) => NUMWORD[w]);
  return new Set([...digits, ...words]);
};
const tags = (t) => (String(t).match(/<\/?([a-z]+)[^>]*>/gi) || []).map((x) => x.replace(/[^a-z/]/gi, '').toLowerCase());

/* 1 · coverage: every stop has a Sprout teach and eg; nothing here names a stop that is not one */
const missing = STOPS.filter((k) => !SPROUT[k.id] || !plain(SPROUT[k.id].teach) || !plain(SPROUT[k.id].eg));
ok(STOPS.length >= 61 && !missing.length, 'every lesson stop has a Sprout reading of its teaching and its example', `${STOPS.length - missing.length}/${STOPS.length} stops` + (missing.length ? ' · missing ' + missing.slice(0, 4).map((k) => k.id).join(' ') : ''));
const stray = Object.keys(SPROUT).filter((id) => !STOPS.some((k) => k.id === id));
ok(!stray.length, 'every Sprout reading belongs to a real stop', stray.join(' '));

/* 2 · plainer by measure: average sentence no longer than the builder's, field by field */
const longer = [];
for (const k of STOPS) for (const f of ['teach', 'eg']) {
  const s = SPROUT[k.id] && SPROUT[k.id][f]; if (!s) continue;
  const a = avgLen(s), b = avgLen(k[f]);
  if (a > b + 1e-9) longer.push(`${k.id}.${f} ${a.toFixed(1)} > ${b.toFixed(1)}`);
}
ok(!longer.length, 'a Sprout sentence is never longer, on average, than the builder sentence it stands for', longer.slice(0, 40).join(' | '));
{
  const tot = (f, src) => STOPS.reduce((n, k) => n + avgLen(src(k)[f]), 0) / STOPS.length;
  const sb = tot('teach', (k) => k), ss = tot('teach', (k) => SPROUT[k.id] || k);
  ok(ss < sb, '…and across the Atlas the Sprout teaching is plainer, not merely no worse', `${sb.toFixed(1)} → ${ss.toFixed(1)} words a sentence`);
}

/* 3 · no new number (rule 6): a reading may drop a figure, never add one */
const added = [];
for (const k of STOPS) for (const f of ['teach', 'eg']) {
  const s = SPROUT[k.id] && SPROUT[k.id][f]; if (!s) continue;
  const have = numbersOf(k[f]), extra = [...numbersOf(s)].filter((n) => !have.has(n));
  if (extra.length) added.push(`${k.id}.${f}: ${extra.join(', ')}`);
}
ok(!added.length, 'no Sprout reading states a number its builder text does not', added.slice(0, 4).join(' | '));

/* 4 · same markup: teach uses only <b>/<i>, balanced; eg is plain text like the card's own */
const markBad = STOPS.filter((k) => {
  const s = SPROUT[k.id]; if (!s) return false;
  const t = tags(s.teach);
  return t.some((x) => !['b', '/b', 'i', '/i'].includes(x)) || t.filter((x) => x === 'b').length !== t.filter((x) => x === '/b').length
    || t.filter((x) => x === 'i').length !== t.filter((x) => x === '/i').length || /<[^>]+>/.test(s.eg);
});
ok(!markBad.length, 'the same markup: <b>/<i> in the teaching, balanced; the example plain text', markBad.map((k) => k.id).join(' '));
ok(STOPS.every((k) => SPROUT[k.id].teach !== k.teach), 'every Sprout teaching is a reading of its own, not the builder text copied');

/* 5 · the picker: a Sprout gets the reading, a Builder the card's own words */
const c1a = STOPS.find((k) => k.id === 'c1a');
ok(teachFor(c1a, 'sprout') === SPROUT.c1a.teach && teachFor(c1a, 'builder') === c1a.teach && egFor(c1a, { band: 'sprout' }) === SPROUT.c1a.eg && egFor(c1a, { band: 'builder' }) === c1a.eg,
  'teachFor / egFor pick by band, from a child or a band name');

/* 6 · the rendered card: what each child actually reads */
const kid = (band, id) => { const c = sim.newChild('Asha', band, 'INR'); c.learn.openCard = id; R.s = { parent: {}, kids: [c], active: 0 }; return c; };
const reading = (html) => { const a = html.indexOf('class="card reading"'), b = a < 0 ? -1 : html.indexOf('</div>', html.indexOf('For instance</span>', a)); return a < 0 || b < 0 ? '' : html.slice(a, b); };
const badRender = [];
for (const k of STOPS) {
  kid('sprout', k.id); const sp = reading(V.viewLearn());
  kid('builder', k.id); const bu = reading(V.viewLearn());
  const S = SPROUT[k.id];
  if (!sp.includes(S.teach) || !sp.includes(esc(S.eg)) || sp.includes(k.teach)) badRender.push(k.id + ' (sprout)');
  if (!bu.includes(k.teach) || !bu.includes(esc(k.eg)) || bu.includes(S.teach)) badRender.push(k.id + ' (builder)');
}
ok(!badRender.length, "a Sprout's rendered card shows the Sprout reading; a Builder's shows the original — every stop", badRender.slice(0, 4).join(' '));

/* 7 · the hint quotes what she read, and the tip of the day is her own example */
{
  const k = STOPS.find((x) => x.id === 'c3a');
  const quote = (h) => (/“(.+)”/.exec(h) || [])[1] || '';
  const hs = quote(hintFor(k, 0, 'sprout')), hb = quote(hintFor(k, 0, 'builder'));
  const inS = (t) => plain(SPROUT.c3a.teach + ' ' + SPROUT.c3a.eg).includes(t), inB = (t) => plain(k.teach + ' ' + k.eg).includes(t);
  ok((!hs || inS(hs)) && (!hb || inB(hb)) && (hs || hb), "a hint quotes the lesson the child read, in her band's words", `“${hs}” · “${hb}”`);
  const c = sim.newChild('Asha', 'sprout', 'INR'); c.learn.done.c1a = true;
  const t = daily.tipOfDay(c, 0), cb = sim.newChild('Bo', 'builder', 'INR'); cb.learn.done.c1a = true;
  ok(t && t.text === SPROUT.c1a.eg && daily.tipOfDay(cb, 0).text === c1a.eg, 'the tip of the day is the example in her own band\'s words');
}

/* 8 · My Feed: a lesson's teaching and example cards read to a Sprout in her band's words */
{
  const FEED = await import('../src/feed.js');
  const G = {}; for (const g of [1, 3, 4, 6]) Object.assign(G, (await import(`../src/feed/g${g}.js`)).default);
  const cards = Object.values(G).filter((x) => /^card:[^#]+#(teach|eg)$/.test(x.src));
  const sp = { band: 'sprout' }, bu = { band: 'builder' };
  const bad = cards.filter((x) => {
    const [, id, f] = /^card:([^#]+)#(teach|eg)$/.exec(x.src);
    return FEED.sproutBody(x, sp).body !== plain(SPROUT[id][f]) || FEED.sproutBody(x, bu).body !== x.body;
  });
  const other = Object.values(G).find((x) => x.kind === 'why');
  ok(cards.length >= 40 && !bad.length && FEED.sproutBody(other, sp) === other, "My Feed: a lesson's teaching and example cards show a Sprout her reading, a Builder the card as cut; other cards are untouched", `${cards.length} cards` + (bad.length ? ' · ' + bad[0].id : ''));
}

console.log('─'.repeat(56) + `\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
