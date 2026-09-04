/* tester.mjs — tester mode opens every gate and rewrites nothing.

   The claim: with the flag on, a brand-new child can reach the Bank, the
   Exchange, the shop, the last world and every game — and their learn
   record, level and money are exactly what they were. With it off, the
   gates close again. The tools that DO move things (jumpLevel, the top-up)
   go through the sim and leave a labelled trace. */
import * as sim from '../src/sim.js';
import { setTester, tester, isOpen, worldOpen, chapterDone, chapterLocked, levelAtLeast, gameOpen, CHAPTERS, WORLDS } from '../src/content.js';
import { GAMES } from '../src/arcade.js';
import { isOpen as placeOpen, PLACES } from '../src/town.js';
import { price, setCurrency } from '../src/fmt.js';

let pass = 0, fail = 0;
const ok = (cond, label, detail = '') => { if (cond) { pass++; console.log('  ok  ' + label + (detail ? '   ' + detail : '')); } else { fail++; console.log('  FAIL ' + label + (detail ? '   ' + detail : '')); } };
setCurrency('INR');
const S = sim.newState(); S.kids.push(sim.newChild('Ahana', 'builder', 'INR')); const c = sim.kid(S);
const snapshot = () => JSON.stringify({ done: c.learn.done, level: c.learn.level, xp: c.learn.xp, wallet: c.money.wallet });
const before = snapshot();

ok(!tester() && !isOpen(c, 'bank') && !worldOpen(c, 4) && chapterLocked(c, CHAPTERS[7]), 'off: a new child is gated', 'bank closed, world 5 closed, chapter 8 locked');
ok(!GAMES.every((g) => gameOpen(c, g)), 'off: not every game is open');
ok(!PLACES.every((p) => placeOpen(p, c.learn.level)), 'off: the street has locked buildings');

setTester(true);
ok(tester(), 'on: the flag reads back');
ok(['jars', 'goals', 'bank', 'portfolio', 'business'].every((k) => isOpen(c, k)), 'on: every place opens');
ok(WORLDS.every((w, i) => worldOpen(c, i)), 'on: every world opens');
ok(CHAPTERS.every((ch) => !chapterLocked(c, ch)), 'on: no chapter is level-locked');
ok(GAMES.every((g) => gameOpen(c, g)) && levelAtLeast(c, 13), 'on: every game and the Market Game open');
ok(PLACES.every((p) => placeOpen(p, c.learn.level)), 'on: the whole street is open');
ok(sim.canTravel(c, 4).ok, 'on: the sim lets her travel to the Works');
ok(sim.townFixes(c, 'works').every((f) => !f.locked), 'on: the fixes in the Works are not locked');
ok(!chapterDone(c, 'c1') && snapshot() === before, 'on: nothing about the child changed', 'done still empty, level 1, wallet unchanged');

/* the tools move things by the sim's rules, labelled */
const l = sim.jumpLevel(c, 30);
ok(l === 30 && c.learn.level === 30 && c.learn.xp >= 0, 'jumpLevel: level 30, xp follows');
sim.jumpLevel(c, 1);
ok(c.learn.level === 1, 'jumpLevel: and back to 1');
const w = c.money.wallet; sim.testerTopUp(c, 100);
ok(c.money.wallet - w === price(100) && c.money.txns[0].label === 'Tester top-up', 'top-up: labelled in the ledger', c.money.txns[0].label);

setTester(false);
ok(!isOpen(c, 'bank') && !worldOpen(c, 4) && chapterLocked(c, CHAPTERS[7]), 'off again: the gates close');

console.log('────────────────────────────────────────────────────────────');
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
