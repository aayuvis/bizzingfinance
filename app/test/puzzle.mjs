/* puzzle.mjs — the daily till and the maths check.

   The claims: the same day is the same puzzle everywhere and for ever; it is
   arithmetically true; three tries and no more; the wage is paid once and
   into the same wallet; the share gives nothing away; and there is no streak
   anywhere in it. Plus: the placement measures a ceiling, stops early, and
   never becomes a score. */
import * as sim from '../src/sim.js';
import * as puz from '../src/dailypuzzle.js';
import * as placement from '../src/placement.js';
import * as ledger from '../src/ledger.js';
import { price, setCurrency } from '../src/fmt.js';

let pass = 0, fail = 0;
const ok = (c, l, d = '') => { if (c) { pass++; console.log('  ok  ' + l + (d ? '   ' + d : '')); } else { fail++; console.log('  FAIL ' + l + (d ? '   ' + d : '')); } };
setCurrency('INR');
const mk = () => { const s = sim.newState(); s.kids.push(sim.newChild('Ahana', 'builder', 'INR')); return s; };

/* deterministic and true */
ok(JSON.stringify(puz.puzzle(7)) === JSON.stringify(puz.puzzle(7)), 'the same day is the same puzzle, every time');
ok(JSON.stringify(puz.puzzle(7)) !== JSON.stringify(puz.puzzle(8)), 'a different day is a different puzzle');
let arith = true, hidden = true, div = 0;
for (let d = 0; d < 400; d++) {
  const p = puz.puzzle(d);
  if (p.lines.reduce((t, l) => t + l.qty * l.each, 0) !== p.total) arith = false;
  if (p.answer !== p.lines[p.hidden].each) hidden = false;
  if (p.kind === 'divide') div++;
}
ok(arith, 'the receipt adds up, every day for four hundred days');
ok(hidden, 'the hidden line is the answer');
ok(div > 100 && div < 300, 'division turns up about half the time', div + ' of 400');

/* three tries, paid once, into the same wallet */
const S = mk(); const c = sim.kid(S); const p = puz.puzzle();
const w0 = c.money.wallet;
ok(puz.guess(c, p.answer + 7).won === false, 'a wrong guess is wrong');
ok(puz.stateOf(c).tries.length === 1 && !puz.stateOf(c).done, 'and it costs one try');
let r = puz.guess(c, p.answer);
ok(r.won && r.done, 'the right answer ends it');
ok(c.money.wallet - w0 === price(puz.WAGE), 'the wage lands in the same wallet, once', String(c.money.wallet - w0));
ok(puz.guess(c, p.answer).already, 'a finished puzzle cannot be replayed for more');
ok(c.money.wallet - w0 === price(puz.WAGE), 'and the wage is still paid exactly once');
ok(c.badges.includes('till-solved'), 'badge for working it out');

const S2 = mk(); const c2 = sim.kid(S2); const p2 = puz.puzzle();
for (let i = 0; i < puz.TRIES; i++) puz.guess(c2, p2.answer + 11 + i);
ok(puz.stateOf(c2).done && !puz.stateOf(c2).won, 'three wrong tries and it is over');
ok(c2.money.wallet === sim.kid(mk()).money.wallet, 'losing pays nothing, and costs nothing');
ok(puz.guess(c2, p2.answer).already, 'and it cannot be retried after the third');

/* the share gives nothing away, and nothing counts a streak */
const sh = puz.share(c, null);
ok(sh && !sh.includes(String(p.answer)) && !sh.includes(String(p.total)), 'the share carries no answer and no total', JSON.stringify(sh));
/* no streak in the STATE, which is what a streak would have to live in —
   the comments are allowed to say the word, the record is not */
const st = puz.stateOf(c, null);
ok(!Object.keys(st).some((k) => /streak|days|run|consecutive|last/i.test(k)), 'the record has nowhere to keep a streak', Object.keys(st).join(', '));
const other = puz.stateOf(c, puz.dayNo() + 3);
ok(other.tries.length === 0 && !other.done, "yesterday's or tomorrow's is simply a fresh puzzle, carrying nothing forward");

/* the maths check */
const S3 = mk(); const c3 = sim.kid(S3);
ok(!placement.measured(c3) && ledger.mathsCeiling(c3) > 0, 'before it is sat, the app guesses and still works');
let o = placement.start();
for (let i = 0; i < 5; i++) { placement.answer(o, placement.RUNGS[o.i].a); placement.next(o); }
ok(!o.done && o.reached === 5, 'five right and it keeps going', 'reached ' + o.reached);
placement.answer(o, (placement.RUNGS[o.i].a + 1) % 4); placement.next(o);
placement.answer(o, (placement.RUNGS[o.i].a + 1) % 4); placement.next(o);
ok(o.done, 'two wrong in a row stops it — nobody sits through six they cannot do');
const res = placement.finish(c3, o);
ok(res && placement.measured(c3) && c3.maths.ceiling === res.ceiling, 'it writes a ceiling');
ok(res.ceiling >= placement.CEILING.min, 'the ceiling never falls below the floor', String(res.ceiling));
ok(ledger.mathsMeasured(c3) && ledger.mathsCeiling(c3) >= res.ceiling, 'the ledger uses the measurement over the guess');
ok(c3.maths.reached === 5 && typeof c3.maths.at === 'number', 'it records what was reached and when, and nothing else', JSON.stringify(c3.maths));
ok(!('score' in c3.maths) && !('right' in c3.maths), 'it is a ceiling, not a score');

console.log('────────────────────────────────────────────────────────────');
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
