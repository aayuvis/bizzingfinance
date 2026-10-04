/* family.mjs — the family standard's rules that live in the engine
   (FAMILY-STANDARD §2, §8): one next step, no streaks. The browser check
   (browser.mjs) holds the screen to the same rules.

   Run: node test/family.mjs */
import * as sim from '../src/sim.js';
import { nextStep, path } from '../src/next.js';
import { ALL_CARDS } from '../src/content.js';
import { migrate } from '../src/store.js';
import { dayIndex } from '../src/fmt.js';
import { readFileSync, readdirSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
const mk = () => { const s = sim.newState(); s.kids.push(sim.newChild('Ahana', 'builder', 'INR')); return s; };
const src = (f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

console.log('\nFamily · one next step, no streaks\n' + '─'.repeat(56));

/* B2: one next step, asked of one function by every screen that offers one */
{
  const c = sim.kid(mk());
  const a = nextStep(c), b = nextStep(c);
  ok(a.title === b.title && a.act === b.act, 'nextStep is deterministic for the same child', a.title);
  ok(path(c).length === ALL_CARDS.length, 'the path is every stop in walking order', String(path(c).length));
  const home = (strip(src('views.js')).match(/function continueCard\(c\) \{[\s\S]*?\n\}/) || [''])[0];
  const learn = (strip(src('atlas.js')).match(/function upNext\(c\) \{[\s\S]*?\n\}/) || [''])[0];
  ok(/nextStep\(c\)/.test(home) && /nextStep\(c\)/.test(learn), "Home's Continue and Learn's Up next both ask nextStep()");
  ok(!/nextThing\(c\)/.test(strip(src('views.js')).replace(/function nextThing[\s\S]*?\n\}/, '')), 'nothing else on Home computes its own next thing');
  for (const id of ['c1a', 'c1b', 'c1c']) c.learn.done[id] = true;
  c.learn.beat = null;
  const n = nextStep(c);
  ok(n.card && !c.learn.done[n.card.id], 'the next step is never a stop already done', n.card && n.card.id);
}

/* J2: no streaks — good days in a window, and a day off costs at most one */
{
  const c = sim.kid(mk());
  ok(c.streak === undefined, 'a new child carries no streak');
  const t0 = Date.parse('2026-10-05T10:00:00');
  for (const d of [0, 1, 2, 4]) sim.markGoodDay(c, t0 + d * 864e5);   /* a gap on day 3 */
  ok(sim.goodDaysThisWeek(c, t0 + 4 * 864e5) === 4, 'four good days with a gap in the middle are still four', String(sim.goodDaysThisWeek(c, t0 + 4 * 864e5)));
  ok(sim.goodDaysThisWeek(c, t0 + 30 * 864e5) === 0 && (c.goodDays || []).length <= 14, 'the window moves on quietly; nothing is kept past a fortnight');
  const xp0 = c.learn.xp; sim.addXP(c, 0);
  ok(c.learn.xp === xp0, 'a wrong answer is not a good day by itself');
}

/* v9 -> v10: an existing run carries over as good days, and the streak goes */
{
  const d = dayIndex(Date.now());
  const old = { v: 9, kids: [{ name: 'A', streak: { days: [d - 2, d - 1, d], last: d } }], active: 0 };
  const m = migrate(old);
  ok(m.v >= 10 && m.kids[0].streak === undefined && m.kids[0].goodDays.length === 3 && m.kids[0].lastDay === d,
    'migration turns the run into good days and drops the streak', JSON.stringify({ g: m.kids[0].goodDays.length, last: m.kids[0].lastDay === d }));
}

/* v12 -> v13: a chapter that grew two stops keeps open what a child had already earned,
   and claims nothing read that was not */
{
  const { isOpen, worldOpen, chapterDone, CHAPTERS } = await import('../src/content.js');
  const k = sim.newChild('A', 'builder', 'INR');
  ['c1', 'c2', 'c3'].forEach((id) => CHAPTERS.find((x) => x.id === id).cards.filter((x) => !/[ef]$/.test(x.id)).forEach((x) => { k.learn.done[x.id] = true; }));
  delete k.learn.kept;
  const before = { jars: isOpen(k, 'jars'), world: worldOpen(k, 1) };
  const m = migrate({ v: 12, kids: [k], active: 0 }).kids[0];
  ok(!before.jars && !before.world && isOpen(m, 'jars') && worldOpen(m, 1) && !isOpen(m, 'bank'),
    'a child who finished a chapter before its new stops keeps the Jar Shed and the road', JSON.stringify(m.learn.kept));
  const { nextStop } = await import('../src/next.js');
  ok(!chapterDone(m, 'c3') && !m.learn.done.c3e && nextStop(m).id === 'c1e',
    'the new stops are still unread and next on the road: kept opens the gate, it marks nothing done', nextStop(m).id);
}

/* no streak copy in any string a child could read */
{
  const hits = [];
  for (const f of readdirSync(new URL('../src/', import.meta.url)).filter((x) => x.endsWith('.js') && x !== 'store.js' && x !== 'icons.js')) {
    const s = strip(src(f));
    for (const lit of s.match(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g) || []) {
      if (/days? in a row|day streak|\bstreak\b/i.test(lit) && !/no streak/i.test(lit) && !/^['"]streak['"]$/.test(lit)) hits.push(f + ': ' + lit.slice(0, 50));
    }
  }
  ok(hits.length === 0, 'no child-facing string mentions a streak or days in a row', hits.slice(0, 3).join(' | '));
}


/* every medal is drawn, never an emoji glyph (audit v4, L2) */
{
  const { BADGES } = await import('../src/content.js');
  const { ico } = await import('../src/art.js');
  const em = Object.entries(BADGES).filter(([, b]) => /__F__/.test(ico(b.em, '__F__', 16))).map(([k]) => k);
  ok(!em.length, `every medal has a drawn icon (${Object.keys(BADGES).length})`, em.join(' '));
}

/* the games draw their things: every emoji the arcade, the board, the content and
   the job table carry resolves to a drawn icon, never the raw glyph (audit v4, N4/G5) */
{
  const { ico } = await import('../src/art.js');
  const seen = new Set(), raw = [];
  for (const f of ['arcade.js', 'board.js', 'content.js', 'jobtable.js']) {
    for (const [e] of src(f).matchAll(/\p{Extended_Pictographic}️?/gu)) {
      if (seen.has(e)) continue;
      seen.add(e);
      if (/__F__/.test(ico(e, '__F__', 16))) raw.push(f + ' ' + e);
    }
  }
  ok(seen.size > 100 && !raw.length, `every game and content emoji has a drawn icon (${seen.size})`, raw.join(' '));
}
console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
