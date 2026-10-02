/* items.mjs — the "Your turn" items (E4): every one has exactly one right result,
   no hint gives it away, and the mistakes deck brings a miss back after a gap.

   Run: node test/items.mjs */
import { ITEMS, shown, answerOf, check } from '../src/items.js';
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
