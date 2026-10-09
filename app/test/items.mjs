/* items.mjs — the "Your turn" items (E4): every one has exactly one right result,
   no hint gives it away, and the mistakes deck brings a miss back after a gap.

   Run: node test/items.mjs */
import { ITEMS, shown, answerOf, check, sortPlace, sortContinue } from '../src/items.js';
import * as M from '../src/mistakes.js';
import { ALL_CARDS } from '../src/content.js';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nYour turn · items that are not multiple choice, and the mistakes deck\n' + '─'.repeat(56));

const ids = Object.keys(ITEMS);
const kinds = new Set(ids.map((k) => ITEMS[k].kind));
ok(ids.length >= 16 && kinds.size === 3, 'at least 16 items, in all three shapes', `${ids.length} items · ${[...kinds].join(', ')}`);
ok(ids.every((id) => ALL_CARDS.some((c) => c.id === id)), 'every item belongs to a real stop on the Atlas');
const chapters = new Set(ids.map((id) => ALL_CARDS.find((c) => c.id === id).ch));
ok(chapters.size === 8, 'every chapter has something to do, not only something to pick', [...chapters].join(','));
const bad = [];
for (const id of ids) {
  const it = ITEMS[id], a = answerOf(id);
  if (!check(id, it.kind === 'amount' ? a : a.slice())) bad.push(id + ': its own answer fails');
  if (it.kind === 'sort') {
    if (it.bins.length !== 2 || it.things.some((t) => t[1] !== 0 && t[1] !== 1)) bad.push(id + ': bins');
    if (!it.things.some((t) => t[1] === 0) || !it.things.some((t) => t[1] === 1)) bad.push(id + ': both bins used');
    const flip = a.map((v) => 1 - v); if (check(id, flip)) bad.push(id + ': flipped also passes');
  }
  if (it.kind === 'order') {
    const s = shown(id).map((x) => x.i);
    if (s.every((v, i) => v === i)) bad.push(id + ': shown already in order');
    if (new Set(s).size !== it.steps.length) bad.push(id + ': steps lost');
  }
  if (it.kind === 'amount') {
    if (!Number.isInteger(a) || a <= 0) bad.push(id + ': not a whole positive amount');
    if (check(id, a + 1)) bad.push(id + ': an off-by-one passes');
    if (String(it.q).includes(String(a))) bad.push(id + ': the question prints its own answer');
    if (/%/.test(it.q)) bad.push(id + ': a percent the child must also be able to say in coins');
  }
  if (!it.hint) bad.push(id + ': no hint');
  else {
    const ans = it.kind === 'amount' ? String(a) : it.kind === 'order' ? '' : '';
    if (ans && it.hint.includes(ans)) bad.push(id + ': hint names the answer');
  }
}
ok(!bad.length, 'every item has exactly one right result, no pre-solved order, no answer in its question or hint', bad.slice(0, 3).join(' | '));

/* E4 · coverage: every stop on the Atlas has something to DO, not only to pick */
const missing = ALL_CARDS.filter((c) => !ITEMS[c.id]).map((c) => c.id);
ok(ALL_CARDS.length === 56 && !missing.length, 'all 56 lesson stops have a Your-turn item', missing.length ? 'missing: ' + missing.join(',') : `${ALL_CARDS.length} stops`);

/* every item has the fields its shape needs, in the house voice */
const shape = [];
for (const id of ids) {
  const it = ITEMS[id];
  if (!it.title || !it.hint) shape.push(id + ': title/hint');
  if (it.kind === 'sort' && it.things.length < 4) shape.push(id + ': fewer than 4 things');
  if (it.kind === 'order' && it.steps.length < 4) shape.push(id + ': fewer than 4 steps');
  if (it.kind === 'amount' && (!it.q || typeof it.calc !== 'function')) shape.push(id + ': q/calc');
  const words = [it.title, it.hint, it.q || '', ...(it.things || []).map((t) => t[0]), ...(it.steps || []), ...(it.how || [])];
  if (words.some((w) => /%|\$|₹|£|€/.test(w))) shape.push(id + ': a percent or a real currency');
  if (it.kind === 'sort' && new Set(it.things.map((t) => t[0])).size !== it.things.length) shape.push(id + ': a thing twice');
}
ok(!shape.length, 'every sort and order has at least 4 things or steps; every item has a title and a hint; no real currency or percent', shape.slice(0, 3).join(' | '));

/* E6 · show me how: every amount explains the method with other numbers and never prints
   this item's answer. Whole-number match, so 8 is caught but 18 is not mistaken for it. */
const shows = (txt, n) => new RegExp(`(^|[^\\d,.])${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',?')}(?![\\d,]?\\d)`).test(txt);
const leak = [];
for (const id of ids.filter((k) => ITEMS[k].kind === 'amount')) {
  const it = ITEMS[id], a = answerOf(id);
  if (!Array.isArray(it.how) || it.how.length < 2) { leak.push(id + ': no show-me-how'); continue; }
  for (const [where, txt] of [['how', it.how.join(' ')], ['hint', it.hint], ['question', it.q], ['title', it.title]]) if (shows(txt, a)) leak.push(`${id}: its ${where} prints ${a}`);
}
ok(!leak.length, 'every amount has a show-me-how, and no question, hint, title or method prints its answer', leak.slice(0, 3).join(' | '));
ok(shows('Divide 72 by 9 to get 8.', 8) && !shows('About 18 years', 8) && shows('pay 1,320 in total', 1320), 'the leak check itself catches a printed answer and ignores a longer number');
/* the sort/order answers never sit in the hint either: no hint quotes a thing or a step whole */
const quoted = ids.filter((id) => { const it = ITEMS[id]; return (it.things ? it.things.map((t) => t[0]) : it.steps || []).some((x) => it.hint.toLowerCase().includes(x.toLowerCase())); });
ok(!quoted.length, 'no sort or order hint quotes one of its own things or steps', quoted.join(','));

/* §1.3 (docs/12) · a sort step holds a wrong thing, with its note, until Continue */
{
  const sorts = ids.filter((id) => ITEMS[id].kind === 'sort'), bad = [];
  for (const id of sorts) {
    const it = ITEMS[id], t = { id };
    /* the first thing, into the wrong bin */
    const i = 0, right = it.things[i][1];
    t.sel = i; const r = sortPlace(t, id, 1 - right);
    if (!r || r.ok || !t.hold || t.bins[i] !== 1 - right) { bad.push(id + ': a wrong bin did not hold where it was put'); continue; }
    if (!r.note.includes(it.things[i][0]) || !r.note.includes('goes in ' + it.bins[right])) bad.push(id + ': the note does not name the thing and its bin');
    t.sel = 1; if (sortPlace(t, id, it.things[1][1])) bad.push(id + ': another thing moved while one was held');
    if (t.bins[1] != null) bad.push(id + ': placed under a hold');
    sortContinue(t, id);
    if (t.hold || t.bins[i] !== right) bad.push(id + ': Continue did not carry it across');
    for (let k = 1; k < it.things.length; k++) { t.sel = k; sortPlace(t, id, it.things[k][1]); }
    if (!t.settled || t.right !== false || t.misses !== 1) bad.push(id + ': a sort with a hold settled as right first time');
    const u = { id }; it.things.forEach((_, k) => { u.sel = k; sortPlace(u, id, it.things[k][1]); });
    if (!u.settled || !u.right) bad.push(id + ': a clean sort did not settle as right');
  }
  ok(sorts.length >= 4 && !bad.length, 'every Your-turn sort holds a wrong thing in the bin it was put in, naming it and its right bin, until Continue — and nothing else moves meanwhile', bad.slice(0, 3).join(' | ') || sorts.length + ' sorts');
  const views = (await import('node:fs')).readFileSync(new URL('../src/views.js', import.meta.url), 'utf8');
  ok('the sort step on screen: the held note and its Continue, and no "Check it" or "one more go" for a sort', /ITEMS\.sortNote\(card\.id, h\.i\)/.test(views) && /data-act="itCont"/.test(views) && /done \|\| it\.kind === 'sort' \? ''/.test(views));
}

/* the deck */
const c = { mistakes: [] }, t0 = Date.UTC(2026, 9, 1), D = 864e5;
M.record(c, 'c1b', 0, t0);
ok(M.due(c, t0).length === 0 && M.due(c, t0 + D).length === 1, 'a miss comes back after a day, not straight away');
ok(M.answer(c, 'c1b#0', true, t0 + 0.5 * D).moved === 'early', 'right before it is due does not count as remembering');
let r = M.answer(c, 'c1b#0', true, t0 + D);
ok(r.moved === 'up' && M.waiting(c, t0 + D).length === 1, 'right after the gap moves it up a box and sends it further off', r.moved);
r = M.answer(c, 'c1b#0', false, t0 + 5 * D);
ok(r.moved === 'down' && r.m.box === 0 && M.open(c).length === 1, 'a miss drops it one box — never a reset of the deck', `box ${r.m.box}`);
M.answer(c, 'c1b#0', true, t0 + 6 * D); r = M.answer(c, 'c1b#0', true, t0 + 30 * D);
ok(r && r.moved === 'cleared' && M.open(c).length === 0 && M.cleared(c).length === 1, 'right twice after its gaps, and it leaves the deck', r && r.moved);

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
