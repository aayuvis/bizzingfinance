/* coach.mjs — the Coach's rulebook and the daily goal, held to their word (headless).

   · every lesson stop and every objective maps to a trap, and every trap that can occur has
     a rule — a trap with no rule is a silent hole in the Coach page
   · no rule, check or habit states a figure: no digit anywhere in them (CLAUDE.md rule 6) —
     the numbers the Coach shows are the lessons' own, said through worked.js
   · Pip's read names the right trap for decks built with the app's own record functions
   · the daily goal: targets in range, a clock that moves only while visible, practice only
     on a learning surface, questions counted on the first answer, a log that is trimmed */
import * as sim from '../src/sim.js';
import { setCurrency } from '../src/fmt.js';
import { ALL_CARDS } from '../src/content.js';
import { OBJECTIVES, NEW_CARD_LIST } from '../src/objectives.js';
import { CAST } from '../src/art.js';
import * as mistakes from '../src/mistakes.js';
import * as mastery from '../src/mastery.js';
import { RULES, ORDER, CARD_TRAP, OBJ_TRAP, HABITS, DOORS, trapOfCard, tally, read } from '../src/coachrules.js';
import * as M from '../src/metrics.js';
import { UNLOCKS } from '../src/content.js';

let pass = 0, fail = 0;
const ok = (c, l, d = '') => { if (c) { pass++; console.log('  ok  ' + l + (d ? '   ' + d : '')); } else { fail++; console.log('  FAIL ' + l + (d ? '   ' + d : '')); } };
setCurrency('INR');
const DAY = 864e5;
console.log('\nThe Coach · its rulebook and the daily goal\n' + '─'.repeat(56));

/* ── the map: every card and every objective lands on a trap with a rule ── */
const cards = [...ALL_CARDS, ...NEW_CARD_LIST];
const noTrap = cards.filter((k) => !CARD_TRAP[k.id]).map((k) => k.id);
ok(!noTrap.length, `every lesson stop (${cards.length}) maps to a trap`, noTrap.join(', '));
const stale = Object.keys(CARD_TRAP).filter((id) => !cards.some((k) => k.id === id));
ok(!stale.length, 'and every stop in the map is a real stop', stale.join(', '));
const noObj = OBJECTIVES.filter((o) => !OBJ_TRAP[o.id]).map((o) => o.id);
ok(!noObj.length, `every objective (${OBJECTIVES.length}) maps to a trap`, noObj.join(', '));
ok(Object.keys(OBJ_TRAP).every((id) => OBJECTIVES.some((o) => o.id === id)), 'and every objective in the map is a real one');
const occurs = [...new Set([...Object.values(CARD_TRAP), ...Object.values(OBJ_TRAP)])];
const noRule = occurs.filter((k) => !RULES[k]);
ok(!noRule.length, `every trap that can occur (${occurs.length}) has a rule`, noRule.join(', '));
ok(Object.keys(RULES).every((k) => occurs.includes(k)), 'and no rule is for a trap nothing can reach', Object.keys(RULES).filter((k) => !occurs.includes(k)).join(', '));
ok(ORDER.length === Object.keys(RULES).length && ORDER.every((k) => RULES[k]), 'the tie-break order names every trap once');
ok(['CHOOSE-4~41', 'EARN-2#1'].every((id) => RULES[trapOfCard(id)]), 'a question asked again later (generated or authored) finds its trap through its objective', trapOfCard('CHOOSE-4~41') + ' / ' + trapOfCard('EARN-2#1'));

/* ── each rule is whole: a face from the cast, a colour, and every part of the path ── */
const bad = Object.entries(RULES).filter(([, r]) => !(CAST[r.face] && /^#[0-9A-F]{6}$/i.test(r.col) && r.label && r.mistake && r.rule && r.check && r.egs && r.egs.length)).map(([k]) => k);
ok(!bad.length, 'every rule has a cast face, a colour, a label, the mistake, the trick, a check and examples', bad.join(', '));
const missingEg = Object.entries(RULES).flatMap(([k, r]) => r.egs.filter(([id, why]) => !cards.some((c) => c.id === id && c.eg) || !why).map(([id]) => k + ':' + id));
ok(!missingEg.length, 'every “Watch it work” example is a real lesson stop with an example of its own', missingEg.join(', '));
const lum = (h) => { const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const pale = Object.entries(RULES).filter(([, r]) => 1.05 / (lum(r.col) + 0.05) < 4.5).map(([k, r]) => k + ' ' + (1.05 / (lum(r.col) + 0.05)).toFixed(2));
ok(!pale.length, 'every trap colour carries white text at AA (the band, the Beat it button)', pale.join(', '));

/* ── rule 6: no figure in anything the Coach says on its own ── */
const said = [...Object.entries(RULES).flatMap(([k, r]) => [r.label, r.mistake, r.rule, r.check, ...r.egs.map((e) => e[1])].map((t) => [k, t])),
  ...HABITS.flatMap((h, i) => [h.t, h.b].map((t) => ['habit ' + (i + 1), t])), ...Object.entries(DOORS).map(([k, t]) => [k, t])];
const figures = said.filter(([, t]) => /\d/.test(t)).map(([k, t]) => k + ': ' + t.match(/.{0,18}\d.{0,12}/)[0]);
ok(!figures.length, `no rule, check, example note or habit states a figure (${said.length} sentences, no digit in any)`, figures.slice(0, 3).join(' | '));
const advice = said.filter(([, t]) => /\b(you should (buy|invest)|invest in|your (parents|family)['’]s? (money|income|salary)|allowance|pocket money)\b/i.test(t)).map(([k]) => k);
ok(!advice.length, 'nothing tells a child what to do with real money or assumes what a family has', advice.join(', '));
ok(HABITS.length >= 12 && HABITS.every((h) => h.t && h.b), `there are enough habits to turn over (${HABITS.length})`);
ok(Object.keys(DOORS).every((k) => k in UNLOCKS) && Object.keys(UNLOCKS).filter((k) => UNLOCKS[k]).every((k) => DOORS[k]), 'the ladder names a door for every chapter that opens one (content.js UNLOCKS)');

/* ── the read: built with the app's own record functions ── */
const child = () => { const S = sim.newState(); S.kids.push(sim.newChild('Mira', 'builder', 'INR')); return sim.kid(S); };
{
  const c = child(), r = read(c);
  ok(r.mode === 'empty' && !r.top && /nothing for me to read/i.test(r.sentence), 'a new child: nothing to read yet, and Pip says so', r.sentence.slice(0, 60));
}
{
  const c = child(), t0 = Date.now() - 2 * DAY;
  mistakes.record(c, 'c4f', 0, t0); mistakes.record(c, 'c4f', 0, t0); mistakes.record(c, 'x-ch4', 1, t0); mistakes.record(c, 'c1b', 0, t0);
  const r = read(c);
  ok(r.top && r.top.k === 'unitprice' && r.top.n === 3 && r.total === 4 && r.mode === 'one' && /the price of one/.test(r.sentence) && /3 of your 4 misses go that way/.test(r.sentence),
    'misses on Buy more and Which box is cheaper: Pip names “the price of one”, three of four', r.sentence);
  ok(r.top.worst[0].id === 'c4f' && r.top.worst[0].n === 2, 'and the worst miss in it is the stop missed twice', JSON.stringify(r.top.worst));
}
{
  const c = child(), t = Date.now() - 30 * DAY;
  mastery.introduce(c, 'OWE-2', t); mastery.check(c, 'OWE-2', true, t);
  mastery.retrieve(c, 'OWE-2', false, t + 8 * DAY); mastery.retrieve(c, 'OWE-2', false, t + 10 * DAY);
  mistakes.record(c, 'c1f', 0, t);
  const r = read(c);
  ok(r.top && r.top.k === 'credit' && r.top.n === 2 && /the total, not the payment/.test(r.sentence), 'two retrieval misses on reading a loan’s total outweigh one change slip: “the total, not the payment”', r.sentence);
  ok(r.top.objs['OWE-2'] === 2 && r.top.worst[0].id === 'c6b', 'a retrieval miss is counted on its objective and opens the stop that teaches it', JSON.stringify(r.top.worst));
}
{
  const c = child(), t = Date.now() - 40 * DAY;
  mastery.introduce(c, 'OWE-2', t); mastery.check(c, 'OWE-2', true, t);
  mastery.retrieve(c, 'OWE-2', false, t + 2 * DAY); mastery.retrieve(c, 'OWE-2', true, t + 12 * DAY); mastery.retrieve(c, 'OWE-2', true, t + 25 * DAY);
  ok(mastery.stateOf(c, 'OWE-2') === 'retained' && read(c).mode === 'empty', 'a miss on an idea since held (retained) is no longer a pattern', mastery.stateOf(c, 'OWE-2'));
}
{
  const c = child(), t = Date.now() - 20 * DAY;
  mistakes.record(c, 'c7a', 0, t);
  mistakes.answer(c, 'c7a#0', true, t + 2 * DAY); mistakes.answer(c, 'c7a#0', true, t + 6 * DAY);
  mistakes.record(c, 'c5c', 0, t);
  const r = read(c);
  ok(r.traps.length === 1 && r.top.k === 'scam', 'a question cleared from the deck no longer counts; the open one does', JSON.stringify(r.traps.map((x) => x.k)));
}
{
  const c = child(), t = Date.now() - DAY;
  ['c3a', 'c1d', 'c6b', 'c7b'].forEach((id) => mistakes.record(c, id, 0, t));
  const r = read(c);
  ok(r.mode === 'spread' && r.top.k === 'pricevalue' && /spread out/.test(r.sentence) && /price is not value/.test(r.sentence),
    'four different traps once each: Pip says the misses are spread, and names the first in the curriculum’s order', r.sentence);
}
{
  const c = child(); mistakes.record(c, 'CHOOSE-10~41', 0, Date.now() - DAY);
  ok(read(c).top.k === 'unitprice', 'a generated question in the deck is read through its objective');
}
{
  const c = child(); ok(tally(c).length === 0, 'tally of an empty record is empty');
}

/* ── the daily goal ── */
{
  const c = child();
  ok(JSON.stringify(M.targets(c)) === JSON.stringify(M.TGT_DEF) && JSON.stringify(M.targets({})) === JSON.stringify(M.TGT_DEF), 'a new child, and one made before the goal existed, both read the defaults (30m · 15m · 10)', JSON.stringify(M.targets({})));
  M.stepTarget(c, 'app', 1); M.stepTarget(c, 'right', -1);
  ok(M.targets(c).app === 35 && M.targets(c).right === 9, 'Settings steps a target by its step', JSON.stringify(M.targets(c)));
  for (let i = 0; i < 99; i++) M.stepTarget(c, 'prac', -1);
  ok(M.targets(c).prac === M.TGT_RANGE.prac[0], 'and never below its floor', String(M.targets(c).prac));
  c.tgt.app = 'lots'; ok(M.targets(c).app === 30, 'a target that is not a number falls back to the default');
}
{
  const c = child(), now = Date.now();
  M.tick(c, { visible: false, learning: true }, now);
  ok(M.today(c, now).app === 0 && M.today(c, now).prac === 0, 'the clock does not move while the tab is hidden');
  M.tick(c, { visible: true, learning: false }, now);
  ok(M.today(c, now).app === M.TICK && M.today(c, now).prac === 0, 'visible, off a learning surface: app time moves, practise time does not');
  M.tick(c, { visible: true, learning: true }, now);
  ok(M.today(c, now).app === 2 * M.TICK && M.today(c, now).prac === M.TICK, 'visible on a learning surface: both move');
  const L = (nav, ov, game) => M.learningNow({ nav, ov, game });
  ok(L('learn') && L('mistakes') && L('library') && L('coach') && L('words') && L('sprint'), 'the Atlas, Ones to try again, the Library, the Coach, Money Words and the sprint are learning surfaces');
  ok(!L('play') && !L('town') && !L('store') && !L('shop') && !L('home') && !L('feed') && !L('money') && !L('learn', null, true), 'the games, the Town, the stores, Home, My Feed and Money are not — nor anything with a game running');
  ok(L('home', 'quiz') && L('town', 'wordCheck') && !L('learn', 'drawer') && !L('learn', 'settings'), 'a checkpoint or a word check counts wherever it opens; a menu over the Atlas does not');
  M.answered(c, true, now); M.answered(c, false, now); M.answered(c, true, now);
  ok(M.today(c, now).right === 2 && c.dayLog[M.dayKey(now)].asked === 3, 'first answers: two right of three asked');
  const m = M.today(c, now);
  ok(Math.abs(m.pRight - 0.2) < 1e-9 && Math.abs(m.pApp - 30 / 1800) < 1e-9, 'the rings are each number over its target', JSON.stringify({ pRight: m.pRight, pApp: m.pApp }));
  ok(M.firstTry(c, 30, now) === null, 'first-try accuracy waits for five answers before it says anything');
  M.answered(c, true, now); M.answered(c, true, now);
  ok(M.firstTry(c, 30, now).pct === 80, 'then it is right over asked: four of five is 80%', JSON.stringify(M.firstTry(c, 30, now)));
}
{
  const c = child(), now = Date.now();
  for (let i = 0; i < 200; i++) M.tick(c, { visible: true }, now - i * DAY);
  ok(Object.keys(c.dayLog).length <= 140 && c.dayLog[M.dayKey(now)], 'the log keeps about four months and always today', String(Object.keys(c.dayLog).length));
  const d = M.days(c, 30, now);
  ok(d.length === 30 && d[29].k === M.dayKey(now) && d.every((x) => x.app === M.TICK), 'the chart reads the last thirty days, oldest first, ending today');
  c.tgt = { app: 5, prac: 5, right: 3 };
  for (let i = 0; i < 20; i++) M.tick(c, { visible: true, secs: 400 }, now - i * DAY);
  const g = M.chart(c, 'app', now);
  ok(g.hit === 20 && g.tgt === 300 && /^\d+m$/.test(g.fmt(g.tgt)), 'days on target is a count of the thirty, not a run', `${g.hit} of ${g.ds.length}`);
  ok(M.ringsSVG(104, [1.4, 0.5, 0]).match(/<circle/g).length === 6, 'past the target a ring draws a second, lighter lap (three tracks, two values, one lap)');
}

console.log('─'.repeat(56));
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
