/* daily.js — the small things India puts on its Home, in Bizzington's terms.

   DO ONE: a deed to do in the real world today, kept when done — India's
   mala bead. A deed is about prices, adverts, coins, receipts and the
   child's own wants; it never asks about the household's money (CONCEPT
   §6.5), and it never reports anything to the app but "I did it".
   CARRY ONE: one money word to carry, from the glossary.
   ASK AT HOME: one question a week for a grown-up, about their own past —
   never the family's finances — shared with the grown-up's page.
   TIP OF THE DAY: a "for instance" from a card she has already read, so the
   day starts by remembering rather than by being told something new.

   Everything rotates from the day index, never from randomness, so the whole
   household sees the same deed and the same word. */
import { GLOSSARY, ALL_CARDS } from './content.js';
import { dayIndex } from './fmt.js';
import * as sim from './sim.js';

export const DEEDS = [
  { id: 'price-one', text: 'Find the price of one thing today — in a shop, on a menu or online — and say it out loud.' },
  { id: 'receipt', text: 'Look at any receipt. Find the total, and one line that added to it.' },
  { id: 'coins', text: 'Count the coins in a jar, a purse or a pocket, and say the amount in words.' },
  { id: 'give-up', text: 'Pick one thing you want this week, and name the thing you would give up to have it.' },
  { id: 'per-unit', text: 'Find something sold in two sizes. Work out which is cheaper for what you get.' },
  { id: 'advert', text: 'Spot one advert today and say, in one sentence, what it wants you to do.' },
  { id: 'need-want', text: 'Name one need and one want in your own room.' },
  { id: 'ten-of', text: 'Say the price of your favourite snack. Then say what ten of them would cost.' },
  { id: 'today-only', text: 'Find a "today only" or "hurry" sign, and say what feeling it is trying to make.' },
  { id: 'percent', text: 'Find any percentage on a poster, a box or a screen, and say it as "for every hundred".' },
  { id: 'change', text: 'Next time someone pays in cash, work out the change before the till does.' },
  { id: 'weeks', text: 'Choose something you would like to save for. Guess how many weeks it would take at your Save rate.' },
  { id: 'free', text: 'Find something "free" today and say what it costs somebody, somewhere.' },
  { id: 'label', text: 'Read a price label properly: the price, the size, and the price per unit if it shows one.' },
  { id: 'later', text: 'Want something today? Say "I will decide tomorrow", and see if you still want it.' },
  { id: 'made', text: 'Pick one thing in the room and guess three costs that went into making it.' },
];
export const ASKS = [
  'What was the first thing you ever saved up for?',
  'What did a sweet or an ice cream cost when you were my age?',
  'What is the best thing you ever bought — and the worst?',
  'Did you ever borrow something and have to give back more than you took?',
  'What do you do before you buy something big?',
  'What is a scam you saw through?',
  'Which shop did you love as a child, and what did it sell?',
  'Was there something you wanted badly and were glad you did not buy?',
  'What is one money word you wish someone had explained to you earlier?',
  'How did you keep money as a child — a tin, a purse, a pocket?',
  'What did a bus ride or a comic cost when you were small?',
  'What is one thing you would tell yourself at my age about money?',
];

const today = () => dayIndex(Date.now());
export function deedOfDay(d = today()) { return DEEDS[d % DEEDS.length]; }
export function askOfWeek(d = today()) { return ASKS[Math.floor(d / 7) % ASKS.length]; }
export function wordOfDay(d = today()) { const g = GLOSSARY[d % GLOSSARY.length]; return { term: g[0], meaning: g[1], eg: g[2] }; }
/* a tip is a "for instance" from a card she has read — nothing new, on purpose */
export function tipOfDay(c, d = today()) {
  const read = ALL_CARDS.filter((k) => c.learn.done[k.id] && k.eg);
  if (!read.length) return null;
  const k = read[d % read.length];
  return { card: k, text: k.eg, title: k.title };
}

/* ── deeds are kept ───────────────────────────────────────────────────── */
export function deedDoneToday(c, d = today()) { return (c.deeds || []).some((x) => x.day === d); }
export function didDeed(c, d = today()) {
  if (!c.deeds) c.deeds = [];
  if (deedDoneToday(c, d)) return false;
  const deed = deedOfDay(d);
  c.deeds.push({ id: deed.id, day: d, t: Date.now(), text: deed.text });
  if (c.deeds.length === 1) sim.badge(c, 'did-one');
  if (c.deeds.length === 10) sim.badge(c, 'ten-deeds');
  sim.stamp(c);
  return true;
}
export function deedCount(c) { return (c.deeds || []).length; }
