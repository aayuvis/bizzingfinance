/* demo.js — a sample household (FAMILY-STANDARD §14, A5).

   `?demo` opens it: a grown-up can walk the whole town before typing a
   child's name. Three weeks of believable progress, built through sim.js's
   own functions so every number on screen is one the engine produced, from
   a fixed plan so it is the same every time it is opened.

   It is flagged `demo: true`, the Store seam refuses to write it, and the
   family feeds (bizzing.activity, bizzing.wallet) are never touched while it
   is open. Closing the tab forgets it; the real household is untouched. */
import * as sim from './sim.js';
import * as mastery from './mastery.js';
import * as decisions from './decisions.js';
import { ALL_CARDS } from './content.js';
import { OBJECTIVES } from './objectives.js';
import { price } from './fmt.js';

const DAY = 864e5;

export function demoState(now = Date.now()) {
  const s = sim.newState();
  s.demo = true;
  const start = now - 21 * DAY;
  const c = sim.newChild('Riya', 'builder', 'INR');
  c.avatar = 'melody';
  c.created = start;
  s.kids.push(c);

  /* three weeks of lessons: the first three chapters, whole (eighteen stops, one a day),
     most right first time, so the Jar Shed is open before any money goes into a jar (audit
     v4: the sample's jars were locked yet held money). Whole chapters by id, never a count,
     so a stop added to a chapter cannot leave the sample half-way through one. */
  const read = ALL_CARDS.filter((k) => ['c1', 'c2', 'c3'].includes(k.ch));
  const coins = [];
  read.forEach((card, i) => {
    const t = start + (i + 1) * DAY;
    /* the family's standard amounts, as the wallet would have paid them (answer 1, stop 5) */
    if (i % 4 !== 3) coins.push({ a: 'finance', t, n: 1, why: 'answer' });
    coins.push({ a: 'finance', t: t + 6e4, n: 5, why: 'stop' });
    c.learn.done[card.id] = true;
    sim.addXP(c, sim.cardXP(true, i % 4 !== 3));
    sim.markGoodDay(c, t);
    const ob = OBJECTIVES.find((o) => o.teach === card.id);
    if (ob) { mastery.introduce(c, ob.id, t); mastery.check(c, ob.id, i % 4 !== 3, t); }
  });
  /* two objectives retrieved again after a gap — evidence, not attention */
  OBJECTIVES.filter((o) => read.some((k) => k.id === o.teach)).slice(0, 2)
    .forEach((o) => mastery.retrieve(c, o.id, true, now - 3 * DAY));

  /* money: jobs, a pay-day split she changed herself, a goal under way */
  /* a shift on six different days — "one of each a day" holds in the sample's own statement */
  for (let w = 0; w < 6; w++) { sim.earn(c, price(6), 'Stack crates', 'job'); c.money.txns[0].t = start + (w * 3 + 2) * DAY; }
  c.money.rules = { spend: 30, save: 40, grow: 20, give: 10 };
  decisions.log(c, { t: now - 2 * DAY, surface: 'rules', chose: 'Spend 30 · Save 40 · Grow 20 · Give 10', label: 'Changed the pay-day split',
    alternatives: ['Leave it at Nana\'s 40/30/20/10'] });
  sim.toJar(c, 'save', price(14)); sim.toJar(c, 'grow', price(6)); sim.toJar(c, 'give', price(3));
  c.money.txns.slice(0, 3).forEach((x) => { x.t = now - 2 * DAY; });
  c.money.txns.sort((a, b) => b.t - a.t);
  sim.addGoal(c, 'A cricket bat', price(90));
  sim.fundGoal(c, c.money.goals[c.money.goals.length - 1].id, price(8));
  sim.badge(c, 'cool-head'); sim.badge(c, 'scam-spotter');
  c.postbox.log.push({ id: 'l3', scam: true, safe: true, t: start + 9 * DAY });
  decisions.log(c, { t: now - 1 * DAY, surface: 'letter', chose: 'Bin it and tell a grown-up', label: 'YOU HAVE WON 5,000!', alternatives: ['Pay the fee'] });
  [0, 1, 3, 4].forEach((d) => sim.markGoodDay(c, now - d * DAY));
  c.lastDay = Math.floor((now - new Date(now).getTimezoneOffset() * 60000) / DAY);
  s.demoCoins = coins;
  return s;
}
