/* learning.mjs — feedback that holds, and a rank that moves only on learning
   (FAMILY-STANDARD §6; D3, C6).

   Run: node test/learning.mjs */
import * as drill from '../src/drill.js';
import * as sim from '../src/sim.js';
import { LETTERS } from '../src/content.js';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
console.log('\nLearning · feedback that holds, rank that moves on learning\n' + '─'.repeat(56));

/* D3: a wrong first answer holds, gets one more go, and does not count */
{
  const st = { picks: [] };
  drill.pick(st, 0, 2, 1);
  ok(drill.holding(st.picks[0]) && !drill.settled(st.picks[0]), 'a wrong first answer holds — it is not settled');
  drill.pick(st, 0, 2, 1);
  ok(drill.holding(st.picks[0]), 'picking the same wrong option again changes nothing');
  drill.pick(st, 0, 1, 1);
  ok(drill.settled(st.picks[0]) && st.picks[0].right && st.picks[0].first === false, 'the second go settles it, and remembers it was not first time');
  drill.pick(st, 0, 3, 1);
  ok(st.picks[0].pick === 1, 'a settled question takes no more picks');
  drill.pick(st, 1, 0, 0);
  ok(drill.settled(st.picks[1]) && st.picks[1].first === true, 'a right first answer settles at once');
  const t = drill.tally(st, 2);
  ok(t.done && !t.right, 'a card with a second-go answer is done but not counted right');
  const st2 = { picks: [] }; drill.pick(st2, 0, 0, 0); drill.pick(st2, 1, 3, 3);
  ok(drill.tally(st2, 2).right, 'all right first time counts as right');
  const st3 = { picks: [] }; drill.pick(st3, 0, 2, 1); drill.pick(st3, 0, 3, 1);
  ok(drill.settled(st3.picks[0]) && !st3.picks[0].right, 'two wrong goes settle it, wrong — and the answer is then shown');
  ok(drill.settled({ pick: 0, right: false }), 'an old save with no tries field reads as settled');
  const m = strip(readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'));
  ok(/on\('nextQ'[\s\S]{0,120}drill\.settled\(st\.picks\[st\.qi\]\)\) return;/.test(m), 'Next refuses while a question is held — nothing auto-advances past a wrong answer');
}

/* C6: rank moves only on right answers and mastery */
{
  const paying = LETTERS.flatMap((l) => l.choices.map((ch) => ({ l, ch }))).filter(({ ch }) => sim.letterXP(ch) > 0);
  ok(paying.every(({ ch }) => ch.safe || ch.badge), 'a letter pays XP only for a sound choice (seeing through a scam, or a decision badge)', paying.length + ' paying choices');
  const fee = LETTERS.filter((l) => l.scam).flatMap((l) => l.choices.filter((ch) => !ch.safe));
  ok(fee.every((ch) => sim.letterXP(ch) === 0), 'falling for a scam pays no XP', fee.length + ' scam-fee choices');
  const arcade = strip(readFileSync(new URL('../src/arcade.js', import.meta.url), 'utf8'));
  const games = ['arcade.js', 'jobgames.js', 'board.js', 'marketgame.js', 'business.js'].map((f) => strip(readFileSync(new URL('../src/' + f, import.meta.url), 'utf8'))).join('\n');
  ok(!/addXP\(/.test(games) && /function payout[\s\S]{0,200}sim\.earn\(/.test(arcade), 'games pay wages into the wallet and never move the rank');
  const main = strip(readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'));
  const sites = [...main.matchAll(/sim\.addXP\(([^;]*)\)/g)].map((m) => m[1]);
  ok(sites.every((a) => /cardXP|letterXP|ch\.xp|200/.test(a)) && !sites.some((a) => /ch\.xp \|\| 0/.test(a)), 'every XP award in main.js goes through a learning rule (or the tester-only grant)', sites.join(' · '));
}

console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
