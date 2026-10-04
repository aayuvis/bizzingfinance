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
  ok(!/addXP\(/.test(games) && /function payout[\s\S]{0,200}sim\.gameWage\(/.test(arcade) && /export function gameWage[\s\S]{0,500}earn\(c, amt/.test(readFileSync(new URL("../src/sim.js", import.meta.url), "utf8")), 'games pay wages into the wallet and never move the rank');
  const main = strip(readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'));
  const sites = [...main.matchAll(/sim\.addXP\(([^;]*)\)/g)].map((m) => m[1]);
  ok(sites.every((a) => /cardXP|letterXP|ch\.xp|200/.test(a)) && !sites.some((a) => /ch\.xp \|\| 0/.test(a)), 'every XP award in main.js goes through a learning rule (or the tester-only grant)', sites.join(' · '));
}

/* D1: try it — every widget belongs to a real lesson, stays in range, and
   every sum it states is true at every setting it can reach */
{
  const TRY = await import('../src/tryit.js');
  const { ALL_CARDS } = await import('../src/content.js');
  const ids = Object.keys(TRY.WIDGETS);
  ok(ids.length >= 8 && ids.every((id) => ALL_CARDS.some((c) => c.id === id)), 'every try-it belongs to a lesson', ids.join(','));
  let checked = 0; const wrong = [];
  const num = (x) => +String(x).replace(/,/g, '');
  for (const id of ids) {
    let st = {};
    const keys = Object.keys(TRY.WIDGETS[id].vars);
    for (let i = 0; i < 60; i++) {
      st = TRY.step(st, id, keys[i % keys.length], i % 7 < 4 ? 1 : -1);
      const v = TRY.values(id, st);
      for (const k of keys) { const [, min, max] = TRY.WIDGETS[id].vars[k]; if (v[k] < min || v[k] > max) wrong.push(`${id}.${k} out of range`); }
      const says = TRY.run(id, st).says;
      for (const m of says.matchAll(/(\d[\d,.]*) ([×÷]) (\d[\d,.]*)(?: ÷ (\d+))? = (\d[\d,.]*)/g)) {
        let val = m[2] === '×' ? num(m[1]) * num(m[3]) : num(m[1]) / num(m[3]); if (m[4]) val /= num(m[4]);
        checked++; if (Math.abs(val - num(m[5])) > 0.051 && Math.abs(Math.round(val) - num(m[5])) > 0) wrong.push(`${id}: ${m[0]}`);
      }
    }
  }
  ok(checked > 100 && !wrong.length, 'every sum a try-it shows is true, at every setting', `${checked} sums · ${wrong.slice(0, 2).join(' | ')}`);
}

/* F3: every game has a title card's three lines of how, and says what it practised */
{
  globalThis.window = globalThis.window || globalThis;
  const src = readFileSync(new URL('../src/arcade.js', import.meta.url), 'utf8');
  const list = readFileSync(new URL('../src/gamelist.js', import.meta.url), 'utf8');   /* the catalogue lives apart from the games */
  const ids = [...list.matchAll(/\{ id: '([a-z]{2})', em:/g)].map((m) => m[1]);
  const how = Object.fromEntries([...src.matchAll(/^  ([a-z]{2}): \[('[^\n]+)\],$/gm)].map((m) => [m[1], m[2].split(/', '/).length]));
  const pr = new Set([...src.matchAll(/([a-z]{2}): '[^']+'/g)].map((m) => m[1]));
  const missing = ids.filter((id) => how[id] !== 3 || !pr.has(id));
  ok(ids.length >= 11 && !missing.length, 'every game has three lines of how-to and a "you practised" line', missing.join(',') || ids.join(','));
}

/* E9 · a jar or bank tap is transfer evidence only with a real alternative on offer */
{
  const m = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const jar = m.slice(m.indexOf("on('jarIn'"), m.indexOf("on('jarIn'") + 700), bank = m.slice(m.indexOf("on('bankIn'"), m.indexOf("on('bankIn'") + 700);
  ok(/if \(alt && k !== 'spend'\)[\s\S]*mastery\.transfer\(c, 'KEEP-2'/.test(jar) && /if \(alt\)[\s\S]*mastery\.transfer\(c, 'GROW-1'/.test(bank), 'a jar or bank tap counts as transfer only when something tempting was affordable instead');
}

/* A6: "mastered" pays only on evidence — kept after a gap, or used unasked — once each per idea */
{
  const mastery = await import('../src/mastery.js');
  const { OBJECTIVES } = await import('../src/objectives.js');
  const s = sim.newState(); const c = sim.newChild('Asha', 'builder', 'INR'); s.kids.push(c);
  const heard = []; mastery.listen((k, id, how) => heard.push(id + ':' + how));
  const o = OBJECTIVES.find((x) => x.transfer && x.transfer.length), D = 864e5, t0 = Date.UTC(2026, 0, 1);
  mastery.introduce(c, o.id, t0); mastery.check(c, o.id, true, t0);
  ok(heard.length === 0, 'reading the card and the check straight after pay nothing for mastery');
  mastery.retrieve(c, o.id, true, t0 + 10 * D);
  ok(heard.join() === o.id + ':retained', 'kept after a gap: one mastery event', heard.join());
  mastery.retrieve(c, o.id, false, t0 + 30 * D); mastery.retrieve(c, o.id, true, t0 + 45 * D);
  ok(heard.length === 1, 'lapsing and recovering does not pay the same idea twice', heard.join());
  mastery.transfer(c, o.id, o.transfer[0], 'test', t0 + 50 * D); mastery.transfer(c, o.id, o.transfer[0], 'again', t0 + 60 * D);
  ok(heard.length === 2 && heard[1] === o.id + ':transferred', 'used unasked: one more, once', heard.join());
  const main = strip(readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'));
  ok(!/finished\)\s*\{?\s*family\.coins\([^)]*'mastery'/.test(main), 'finishing a chapter is not paid as mastery');
  mastery.listen(null);
}
console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
