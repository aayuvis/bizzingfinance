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
  s.parent.pin = '1234';
  const start = now - 21 * DAY;
  const c = sim.newChild('Riya', 'builder', 'INR');
  c.avatar = 'melody';
  c.created = start;
  s.kids.push(c);

  /* three weeks of lessons: the first ten stops, most right first time */
  const read = ALL_CARDS.slice(0, 10);
  read.forEach((card, i) => {
    const t = start + (i * 2 + 1) * DAY;
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
  for (let w = 0; w < 6; w++) sim.earn(c, price(6), 'Stack crates', 'job');
  c.money.rules = { spend: 30, save: 40, grow: 20, give: 10 };
  decisions.log(c, { t: start + 6 * DAY, surface: 'jars', chose: 'Save 40, Spend 30', label: 'Changed the pay-day split',
    alternatives: ['Leave it at Nana\'s 40/30/20/10'] });
  sim.toJar(c, 'save', price(14)); sim.toJar(c, 'grow', price(6)); sim.toJar(c, 'give', price(3));
  sim.addGoal(c, 'A cricket bat', price(90));
  sim.fundGoal(c, c.money.goals[c.money.goals.length - 1].id, price(8));
  sim.badge(c, 'cool-head'); sim.badge(c, 'scam-spotter');
  c.postbox.log.push({ id: 'l3', scam: true, safe: true, t: start + 9 * DAY });
  decisions.log(c, { t: start + 9 * DAY, surface: 'letter', chose: 'Bin it and tell a grown-up', label: 'YOU HAVE WON 5,000!', alternatives: ['Pay the fee'] });
  [0, 1, 3, 4].forEach((d) => sim.markGoodDay(c, now - d * DAY));
  c.lastDay = Math.floor((now - new Date(now).getTimezoneOffset() * 60000) / DAY);
  return s;
}
