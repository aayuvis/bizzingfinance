/* catalogue.js — Finance's 96 avatars, through the family engine (FAMILY-STANDARD §8).

   OWNER'S DECISION, 2 Oct 2026, overriding docs/11's refusal of rarity: Finance adopts
   the family avatar engine — four tiers, fixed prices, two packs per world — priced in
   family Bizzing coins. The town's own money is the curriculum and never buys a face
   (CLAUDE.md rule 4 stands): nothing here reads or writes c.money.

   12 packs × 8, every pack 2 Common · 3 Rare · 2 Epic · 1 Legendary, and every
   Legendary names a learning milestone measured from the child's own record — never
   time, never chance. `validate(CATALOGUE)` from the engine returns [] (test/avatars.mjs).

   Where the faces came from, so no face is in two apps' 96:
   · packs 1 and 4 are Bizzing Bee's Critter Crew and Vibe, handed over (re-tiered here);
   · Melody, Pixel and Gold Legend are the three faces of the first set that no sibling
     keeps in its 96 (the koi stays with Maths; the rest are Bee's own packs);
   · the other 77 were drawn for Finance, two packs per world of the town
     (tools/art/family.py), in the family sticker style, and looked at before shipping. */
import { validate, stateOf, worldOf, TIERS, WORLD_PRICE } from './family/bizzing-avatars.js';
import { CHAPTERS, ALL_CARDS } from './content.js';
import * as mastery from './mastery.js';

const A = (id) => `./avatars/fin/${id}.webp`;
const T = (id) => `./avatars/fin/t/${id}.webp`;   /* 192px, for every place a face is small */

/* milestones: learning the child did, read from their record */
export const MILESTONES = {
  'ch-c1': { label: 'Finish “What money even is”', test: (c) => chDone(c, 'c1') },
  'ch-c2': { label: 'Finish “Earning it”', test: (c) => chDone(c, 'c2') },
  'ch-c3': { label: 'Finish “Making a plan”', test: (c) => chDone(c, 'c3') },
  'ch-c4': { label: 'Finish “Sellers and their tricks”', test: (c) => chDone(c, 'c4') },
  'ch-c5': { label: 'Finish “Keeping it safe”', test: (c) => chDone(c, 'c5') },
  'ch-c6': { label: 'Finish “Borrowing”', test: (c) => chDone(c, 'c6') },
  'ch-c7': { label: 'Finish “Money that grows”', test: (c) => chDone(c, 'c7') },
  'ch-c8': { label: 'Finish “Running something”', test: (c) => chDone(c, 'c8') },
  'held-10': { label: 'Still know 10 things a week after learning them', test: (c) => held(c) >= 10 },
  'held-20': { label: 'Still know 20 things a week after learning them', test: (c) => held(c) >= 20 },
  'atlas': { label: 'Walk every stop on the Money Atlas', test: (c) => ALL_CARDS.every((k) => c.learn && c.learn.done[k.id]) },
  'transfer-5': { label: 'Use 5 things somewhere new, without being asked', test: (c) => (mastery.counts(c).transferred || 0) >= 5 },
};
function chDone(c, id) { const ch = CHAPTERS.find((x) => x.id === id); return !!ch && ch.cards.every((k) => c.learn && c.learn.done[k.id]); }
function held(c) { const n = mastery.counts(c); return (n.retained || 0) + (n.transferred || 0); }
export function milestonesOf(c) { return Object.keys(MILESTONES).filter((k) => { try { return MILESTONES[k].test(c); } catch (e) { return false; } }); }
const ms = (id) => ({ id, label: MILESTONES[id].label });

export const PACKS = [
  { n: 1, id: 'critter', name: 'Critter Crew', from: 'Handed over from Bizzing Bee' },
  { n: 2, id: 'stalls', name: 'Market Stalls' },
  { n: 3, id: 'harbour', name: 'Harbour Hands' },
  { n: 4, id: 'vibe', name: 'Vibe', from: 'Handed over from Bizzing Bee' },
  { n: 5, id: 'clockwork', name: 'Clockwork' },
  { n: 6, id: 'post', name: 'Post & Pages' },
  { n: 7, id: 'savers', name: 'Savers & Keepers' },
  { n: 8, id: 'watchers', name: 'Market Watchers' },
  { n: 9, id: 'builders', name: 'Builders' },
  { n: 10, id: 'makers', name: 'Makers' },
  { n: 11, id: 'showtime', name: 'Showtime' },
  { n: 12, id: 'lanterns', name: 'Lantern Lights' },
];

/* [id, name, tier] per pack, in tier order; legendary carries its milestone id */
const RAW = {
  1: [['froggy', 'Pond Star', 'common'], ['hoppy', 'Hoppy', 'common'], ['corg', 'Zoomies', 'rare'], ['capy', 'Capy', 'rare'], ['fawn', 'Fawn', 'rare'], ['redpanda', 'Rusty', 'epic'], ['axo', 'Axo', 'epic'], ['uni', 'Uni', 'legendary', 'ch-c1']],
  2: [['mango', 'Mango', 'common'], ['teapot', 'Teapot Tilly', 'common'], ['baskethog', 'Basket Hog', 'rare'], ['turnip', 'Turnip', 'rare'], ['scales', 'Fair Scales', 'rare'], ['stallsnail', 'Awning Snail', 'epic'], ['barrowmole', 'Barrow Mole', 'epic'], ['pumpkin', 'Prize Pumpkin', 'legendary', 'ch-c2']],
  3: [['gully', 'Gully', 'common'], ['pinchy', 'Pinchy', 'common'], ['sealpup', 'Seal Pup', 'rare'], ['puffin', 'Captain Puffin', 'rare'], ['lighthouse', 'Little Light', 'rare'], ['buoy', 'Bobbing Buoy', 'epic'], ['sailboat', 'Sal the Sailboat', 'epic'], ['narwhal', 'Admiral Narwhal', 'legendary', 'ch-c3']],
  4: [['gg', 'GG', 'common'], ['duckie', 'Duckie', 'common'], ['boba', 'Boba', 'rare'], ['pengu', 'Pengu', 'rare'], ['plushy', 'Plushy', 'rare'], ['catlord', 'Catlord', 'epic'], ['popcorn', 'Popcorn', 'epic'], ['yeti', 'Frost', 'legendary', 'ch-c4']],
  5: [['tick', 'Tick', 'common'], ['cogmouse', 'Cog Mouse', 'common'], ['tinrobin', 'Tin Robin', 'rare'], ['hourglass', 'Hourglass', 'rare'], ['cuckoo', 'Cuckoo', 'rare'], ['winduprabbit', 'Wind-up Rabbit', 'epic'], ['brassowl', 'Brass Owl', 'epic'], ['clockdragon', 'Clockwork Dragon', 'legendary', 'ch-c5']],
  6: [['envelope', 'Envie', 'common'], ['postpup', 'Postie Pup', 'common'], ['pigeon', 'Carrier Pigeon', 'rare'], ['parcelkoala', 'Parcel Koala', 'rare'], ['bookworm', 'Bookworm', 'rare'], ['inkwell', 'Inkwell', 'epic'], ['stamp', 'First Stamp', 'epic'], ['postbadger', 'Postmaster Badger', 'legendary', 'ch-c6']],
  7: [['piggy', 'Piggy Bank', 'common'], ['jamjar', 'Button Jar', 'common'], ['armadillo', 'Lockbox Armadillo', 'rare'], ['hamster', 'Cheeky Hamster', 'rare'], ['dormouse', 'Dormouse', 'rare'], ['chest', 'Treasure Chest', 'epic'], ['magpie', 'Magpie', 'epic'], ['goldenhen', 'Golden Hen', 'legendary', 'ch-c7']],
  8: [['bullcalf', 'Bull Calf', 'common'], ['bearcub', 'Bear Cub', 'common'], ['meerkat', 'Lookout Meerkat', 'rare'], ['specowl', 'Chart Owl', 'rare'], ['rooster', 'Weathervane Rooster', 'rare'], ['balloonhare', 'Balloon Hare', 'epic'], ['sloth', 'Patient Sloth', 'epic'], ['giraffe', 'Long-View Giraffe', 'legendary', 'held-10']],
  9: [['brick', 'Brick', 'common'], ['cranekid', 'Little Crane', 'common'], ['digger', 'Digger', 'rare'], ['paintpot', 'Paint Pot', 'rare'], ['antbuilder', 'Ant Builder', 'rare'], ['mixer', 'Mixer', 'epic'], ['toolterrier', 'Toolbox Terrier', 'epic'], ['steamengine', 'Old Steam Engine', 'legendary', 'ch-c8']],
  10: [['spool', 'Spool', 'common'], ['jug', 'Jug', 'common'], ['weaver', 'Weaver', 'rare'], ['candle', 'Candle', 'rare'], ['brushpony', 'Brush Pony', 'rare'], ['claybuddy', 'Clay Buddy', 'epic'], ['kettle', 'Copper Kettle', 'epic'], ['patchbear', 'Patchwork Bear', 'legendary', 'held-20']],
  11: [['pixel', 'Pixel', 'common'], ['drum', 'Drum', 'common'], ['kite', 'Kite', 'rare'], ['balloondog', 'Balloon Dog', 'rare'], ['toucan', 'Trumpet Toucan', 'rare'], ['melody', 'Melody', 'epic'], ['discoball', 'Disco Ball', 'epic'], ['goldlegend', 'Gold Legend', 'legendary', 'atlas']],
  12: [['lantern', 'Paper Lantern', 'common'], ['sparkler', 'Sparkler', 'common'], ['firefly', 'Firefly', 'rare'], ['fireflower', 'Firework Flower', 'rare'], ['candyfloss', 'Candy Floss', 'rare'], ['glowmoth', 'Glow Moth', 'epic'], ['lanternfish', 'Lantern Fish', 'epic'], ['lanterndragon', 'Lantern Dragon', 'legendary', 'transfer-5']],
};

export const CATALOGUE = Object.entries(RAW).flatMap(([pack, rows]) => rows.map(([id, name, tier, m]) => ({
  id, name, pack: +pack, tier, art: A(id), thumb: T(id), ...(m ? { milestone: ms(m) } : {}),
})));
export const BY_ID = Object.fromEntries(CATALOGUE.map((a) => [a.id, a]));
export const COMMONS = CATALOGUE.filter((a) => a.tier === 'common');
export const PACK_OF = (n) => PACKS.find((p) => p.n === n);
export { validate, stateOf, worldOf, TIERS, WORLD_PRICE };

/* A child's catalogue context for stateOf(): what they own, which worlds they have
   opened, the plan (a flag the grown-ups' tester mode can set until the family
   server exists — FIX §5), and the milestones their record shows. */
export function ctxFor(s, c) {
  const f = (c && c.fam) || {};
  return { owned: f.owned || [], worlds: f.worlds || [], plan: s && s.settings && s.settings.plan === 'family' ? 'family' : 'free',
    milestones: c ? milestonesOf(c) : [], who: c && c.name };
}
