/* companion.js — the one she raises.

   The third motivator: something to nurture, protect, help grow and help
   achieve. It is wired to REAL money, because that is the only way a pet in a
   finance app teaches rather than nags:

   · Adoption costs money, once. Food is a weekly BILL from her wallet — the
     same extraBills primitive the rent rise uses — so a companion is the
     first recurring cost she ever chooses, and the shelter says out loud what
     "2 a week" is a year (c4c: the small monthly one).
   · A companion gets POORLY when the food bill went unpaid — the wallet ran
     dry on pay day — never because she skipped a day. The editorial policy
     bans streak pressure, and a pet that sulks at a missed login is streak
     pressure in a costume. Care never decays with real time; it moves on
     pay days, the sim's own clock.
   · It never dies. Worst case is poorly, and poorly recovers the next pay
     day the bill is met. Harm stays as elliptical as the family's own text.
   · Accessories are WANTS with prices. Buying one moves real money and lifts
     the mood — which is exactly what c1b says a want is for. No loot, no
     random drops, no second currency (CONCEPT §6.3, §6.4).
   · Play is free and daily-capped, and skipping it only fails to help. The
     honest Tamagotchi rule: attention is a gift, not a debt.

   sim.js still owns the money: every rupee here moves through sim.spend and
   sim.addBill. This file owns the creature. */

import * as sim from './sim.js';
import { price, dayIndex } from './fmt.js';

export const KINDS = {
  pup:    { name: 'Puppy',    a: 'a', plural: 'puppies',   line: 'Wags first, thinks later. Needs a walk more than a treat.' },
  kitten: { name: 'Kitten',   a: 'a', plural: 'kittens',   line: 'Owns the house within a week. Purrs when the bills are paid.' },
  parrot: { name: 'Parrot',   a: 'a', plural: 'parrots',   line: 'Repeats everything. Do not say "buy" near the Exchange.' },
  bunny:  { name: 'Bunny',    a: 'a', plural: 'bunnies',   line: 'Quiet, tidy, and eats exactly as much as you budget for.' },
  duck:   { name: 'Duckling', a: 'a', plural: 'ducklings', line: 'Follows you to the stall. Grows into a very opinionated duck.' },
};
export const STAGES = ['baby', 'young', 'grown'];
export const MOODS = ['happy', 'okay', 'poorly'];

/* All costs in price units, so the catalogue re-prices with the currency
   and never assumes a family's money (CONCEPT §6.5). */
export const C = {
  adopt: 12,          /* one-off */
  food: 2,            /* a week, for keeps */
  careFed: 15,        /* care gained when the bill was met */
  careMissed: 30,     /* care lost when the wallet could not cover it */
  carePlay: 8,        /* a play session, once a day, free */
  careDecay: 5,       /* per pay day, so steady feeding holds level */
  careWorn: 10,       /* a new accessory — a want doing what wants do */
  growAt: [0, 4, 10], /* pay days since adoption to reach each stage… */
  growCare: 50,       /* …if care was at least this on the day */
  happyAt: 70,
};

/* Accessories are wants. Each names its slot so one can be worn per slot,
   and its price is the point: the scarf costs a week and a half of food. */
export const WARDROBE = [
  { id: 'acc-bell',  name: 'A collar with a bell',  slot: 'neck', units: 3,  line: 'You will always know where they are.' },
  { id: 'acc-bow',   name: 'A gold ribbon bow',      slot: 'head', units: 2,  line: 'Purely for looks. That is allowed.' },
  { id: 'acc-scarf', name: 'A striped scarf',        slot: 'neck', units: 4,  line: 'Warm in the Harbour wind.' },
  { id: 'acc-hat',   name: 'A bobble hat',           slot: 'head', units: 5,  line: 'Teal, with a pom-pom. Very serious.' },
  { id: 'acc-specs', name: 'Round spectacles',       slot: 'face', units: 6,  line: 'Makes them look like Nana. They cannot read.' },
  { id: 'acc-crown', name: 'A paper party crown',    slot: 'head', units: 8,  line: 'For the day the shop opens.' },
];

export function has(c) { return !!(c.companion && c.companion.kind); }
export function get(c) { return c.companion || null; }

/* ── adoption ─────────────────────────────────────────────────────────── */
export function adopt(c, kind, name) {
  if (has(c) || !KINDS[kind]) return { ok: false, why: has(c) ? 'You already have someone at home.' : 'No such animal.' };
  const clean = String(name || '').trim().slice(0, 16) || KINDS[kind].name;
  const cost = price(C.adopt);
  if (c.money.wallet < cost) return { ok: false, why: `Adoption is ${cost} and you have ${c.money.wallet}.` };
  sim.spend(c, cost, 'Adopted ' + clean, 'companion');
  sim.addBill(c, { id: 'companion-food', name: 'Food for ' + clean, units: C.food, weeks: null });
  c.companion = {
    kind, name: clean, born: dayIndex(Date.now()), paydays: 0,
    stage: 0, care: 60, mood: 'okay', fedRun: 0, missed: 0, everMissed: 0,
    lastPlay: null, plays: 0, wearing: {}, wardrobe: [], ill: false, log: [],
  };
  sim.badge(c, 'adopted');
  note(c, 'came home');
  return { ok: true };
}

/* ── the pay-day tick: the only clock that moves care ─────────────────── */
/* Called by sim.runPayDay with the wallet AFTER bills. A negative wallet
   means the last things on the list did not really get bought — and the
   food was one of them. */
export function onPayDay(c, walletAfterBills) {
  const p = get(c); if (!p) return null;
  p.paydays += 1;
  p.care = Math.max(0, p.care - C.careDecay);
  const fed = walletAfterBills >= 0;
  if (fed) { p.fedRun += 1; p.missed = 0; p.care = Math.min(100, p.care + C.careFed); }
  else { p.fedRun = 0; p.missed += 1; p.everMissed += 1; p.care = Math.max(0, p.care - C.careMissed); note(c, 'went hungry'); }
  /* growth: a stage is reached on the pay day its week arrives, if she has
     been looking after them — growth stalls while poorly, and resumes */
  for (let s = STAGES.length - 1; s > p.stage; s--) {
    if (p.paydays >= C.growAt[s] && p.care >= C.growCare) { p.stage = s; note(c, 'grew up a little'); if (s === 2) sim.badge(c, 'all-grown'); break; }
  }
  if (p.fedRun >= 10) sim.badge(c, 'well-fed');
  refreshMood(p);
  return { fed, mood: p.mood, stage: p.stage };
}

/* ── daily care: free, capped, and skipping it only fails to help ─────── */
export function canPlay(c) {
  const p = get(c); if (!p) return false;
  return p.lastPlay !== dayIndex(Date.now());
}
export function play(c) {
  const p = get(c); if (!p || !canPlay(c)) return false;
  p.lastPlay = dayIndex(Date.now()); p.plays += 1;
  p.care = Math.min(100, p.care + C.carePlay);
  refreshMood(p);
  return true;
}

/* ── the wardrobe: wants, priced, worn one per slot ───────────────────── */
export function buy(c, accId) {
  const p = get(c), item = WARDROBE.find((w) => w.id === accId);
  if (!p || !item) return { ok: false, why: 'No such thing.' };
  if (p.wardrobe.includes(accId)) return wear(c, accId);
  const cost = price(item.units);
  /* a want never goes on credit here, whatever the band: sim.spend lets a
     Builder's wallet go red for bills, but a bow bought with money she does
     not have is the exact habit c3a exists to prevent */
  if (c.money.wallet < cost || !sim.spend(c, cost, item.name, 'companion')) return { ok: false, why: `That is ${cost} and you have ${c.money.wallet}.` };
  p.wardrobe.push(accId);
  if (p.wardrobe.length === 1) sim.badge(c, 'dressed-up');
  p.care = Math.min(100, p.care + C.careWorn);
  refreshMood(p);
  wear(c, accId);
  return { ok: true, cost };
}
export function wear(c, accId) {
  const p = get(c), item = WARDROBE.find((w) => w.id === accId);
  if (!p || !item || !p.wardrobe.includes(accId)) return { ok: false, why: 'Not in the wardrobe.' };
  if (p.wearing[item.slot] === accId) delete p.wearing[item.slot]; else p.wearing[item.slot] = accId;
  return { ok: true };
}

/* ── illness arrives by letter, and money settles it ──────────────────── */
export function setIll(c, ill) { const p = get(c); if (p) { p.ill = !!ill; refreshMood(p); } }

/* ── what the child sees ──────────────────────────────────────────────── */
export function refreshMood(p) {
  p.mood = (p.missed > 0 || p.ill) ? 'poorly' : p.care >= C.happyAt ? 'happy' : 'okay';
  return p.mood;
}
export function spriteKey(c) { const p = get(c); return p ? `${p.kind}-${STAGES[p.stage]}-${p.mood}` : null; }
export function line(c) {
  const p = get(c); if (!p) return '';
  const k = KINDS[p.kind].name.toLowerCase();
  if (p.ill) return `${p.name} is off colour. The vet's letter is in the postbox.`;
  if (p.missed > 0) return `${p.name} went hungry on pay day — the wallet ran out before the food. Next pay day puts it right.`;
  if (p.mood === 'happy') return p.stage === 2 ? `${p.name} is grown, glossy and pleased with you.` : `${p.name} is thriving. ${p.stage === 0 ? 'Still tiny.' : 'Growing fast.'}`;
  if (p.care < 40) return `${p.name} is all right, but a little play would go a long way.`;
  return `${p.name} is content. A ${k} with a full bowl is an easy ${k}.`;
}
export function weeklyCost(c) { return has(c) ? price(C.food) : 0; }
export function yearlyCost(c) { return has(c) ? price(C.food) * 52 : 0; }
function note(c, what) { const p = get(c); p.log.unshift({ t: Date.now(), what }); if (p.log.length > 40) p.log.length = 40; }
