/* daily.mjs — the day's deed, word and question rotate from the day, never
   from chance; a deed is kept once a day; the badges land; a test-out opens
   a chapter without touching its cards. */
import * as sim from '../src/sim.js';
import * as daily from '../src/daily.js';
import { chapterLocked, CHAPTERS, GLOSSARY } from '../src/content.js';
import { setCurrency } from '../src/fmt.js';

let pass = 0, fail = 0;
const ok = (cond, label, detail = '') => { if (cond) { pass++; console.log('  ok  ' + label + (detail ? '   ' + detail : '')); } else { fail++; console.log('  FAIL ' + label + (detail ? '   ' + detail : '')); } };
setCurrency('INR');
const S = sim.newState(); S.kids.push(sim.newChild('Ahana', 'builder', 'INR')); const c = sim.kid(S);

ok(daily.deedOfDay(10).id === daily.deedOfDay(10).id && daily.deedOfDay(10).id !== daily.deedOfDay(11).id, 'the deed follows the day');
ok(daily.askOfWeek(0) === daily.askOfWeek(6) && daily.askOfWeek(0) !== daily.askOfWeek(7), 'the question follows the week');
ok(daily.wordOfDay(3).term === GLOSSARY[3][0], 'the word is the glossary, in order');
ok(daily.DEEDS.every((d) => !/family|parents?|household|salary|rent|bill|income|earn/i.test(d.text)), 'no deed asks about the household\'s money');
ok(daily.ASKS.every((a) => !/your (salary|rent|income|savings|debt|mortgage)|how much do you (earn|have)/i.test(a)), 'no question asks about the family\'s finances');
ok(daily.tipOfDay(c) === null, 'no tip before a card is read');
c.learn.done['c1a'] = { t: Date.now(), right: 3 };
ok(daily.tipOfDay(c) && daily.tipOfDay(c).card.id === 'c1a', 'the tip comes from a card she has read');

ok(!daily.deedDoneToday(c) && daily.didDeed(c) === true, 'I did it: kept');
ok(daily.deedDoneToday(c) && daily.didDeed(c) === false, 'once a day only');
ok(c.badges.includes('did-one') && daily.deedCount(c) === 1, 'badge: did one');
for (let d = 1; d < 10; d++) daily.didDeed(c, 1000 + d);
ok(c.badges.includes('ten-deeds') && daily.deedCount(c) === 10, 'badge: ten deeds');

/* test-out opens the chapter, not its cards */
const ch = CHAPTERS[6];
ok(chapterLocked(c, ch), 'chapter 7 is level-locked for a level-1 child');
c.learn.testedOut[ch.id] = true;
ok(!chapterLocked(c, ch) && !c.learn.done[ch.cards[0].id], 'tested out: open, cards still undone');

console.log('────────────────────────────────────────────────────────────');
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
