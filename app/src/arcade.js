/* arcade.js — six games, every one of them scoring the decision rather than
   the outcome (CONCEPT §6.3), and every one taking BOTH keyboard and touch,
   which is inherited from Bizzing Bee and non-negotiable.

   Wages land in the same wallet as everything else. There is no second,
   magic money, and no randomised reward for money spent — anywhere. */

import { esc, sfx, toast, rng, clamp, sparkline, on } from './ui.js';
import { TIER_IDS, TIER_NAME, tierOf, setTier, goalsMet, earnGoals } from './jobtable.js';
import { money, price, currency, CURRENCIES, minorPrice, minorMoney } from './fmt.js';
import { say, ico } from './art.js';
import { hero } from './hero.js';
import { COVERS } from './covers-gen.js';
import { BLD } from './buildings-gen.js';
import { ASSETS, STOCK, CHAPTERS, chapterDone, gameOpen, levelAtLeast } from './content.js';
import { mainStreet } from './board.js';
import * as sim from './sim.js';
import { R } from './runtime.js';
import { pipPose, kidBadge, M40_LEVEL } from './shell.js';
import { fx as makeFx, countdown, plate, plateSrc, backdrop, rr, shadow, coin, crate, still, verdict } from './gamefx.js';
import { saveBorrow, SB_TIERS, SB_GOALS } from './saveborrow.js';
import { stormFor, stormValue, stormScore, planWords, RULES, START as STORM_START, HALF as STORM_HALF, STORM_PAR, WOBBLE } from './storm.js';

import { GAMES, GAME_ACTS } from './gamelist.js';

const K = () => sim.kid(R.s);

export { GAMES };
/* Stall of My Own absorbs Stall Rush, so until it has a painting of its own it wears the stall's;
   Save or Borrow?, which has no cover yet, wears the square the Bank stands on */
const COVER_OF = { so: 'sr' };
const coverOf = (id) => COVERS[id] || COVERS[COVER_OF[id]] || (id === 'sb' ? { src: plateSrc(2) } : null);

export function viewArcade() {
  if (R.gameIntro) return introView(R.gameIntro);
  /* the game's own painting sits behind its play screen */
  if (R.game) { const art = current && coverOf(current); return `<div class="gplay"${art ? ` style="--cover:url(${art.src})"` : ''}>${R.game.view()}</div>`; }
  const c = K();
  /* a cover per game — a painting when tools/art has drawn it, the game's
     own tint until then — with the words on a veil across the bottom */
  const cover = (g, o = {}) => {
    const open = o.open != null ? o.open : gameOpen(c, g);
    const ch = g.needs && CHAPTERS.find((x) => x.id === g.needs);
    const art = coverOf(g.id);
    return `<button class="cover${o.big ? ' big' : ''}${open ? '' : ' locked'}" data-act="${open ? (o.act || 'game') : 'lockedGame'}" data-arg="${o.arg || g.id}"
      style="${art ? `--cover:url(${art.src});` : ''}--ja:${o.tint || 'var(--action)'}">
      <span class="cv-art"></span><span class="cv-veil"></span>
      <span class="cv-body">
        <span class="row" style="gap:6px">${open ? '' : `<span class="pill">${ico('lock', '🔒', 11)} learn first</span>`}${open && g.keys ? `<span class="cv-keys">${esc(g.keys)}</span>` : ''}</span>
        <b>${esc(g.name)}</b>
        <span class="small">${open ? esc(g.blurb) : ch ? 'Finish “' + esc(ch.title) + '” to open this' : esc(o.lock || 'Opens later on')}</span>
      </span>
    </button>`;
  };
  const M40 = { id: 'm40', name: 'The Market Game', keys: '', needs: null,
    blurb: 'Forty companies that do not exist, forty years of things happening to them. Study one, say what would hurt it, then put money behind your answer.' };
  const m40open = levelAtLeast(c, M40_LEVEL);
  /* A locked headline game at the top of the Arcade told a new child the
     best thing here was not for them. Open, it leads; locked, it waits at
     the bottom with the level that opens it. */
  const m40 = cover(M40, { big: true, open: m40open, act: 'nav', arg: 'market40', tint: 'var(--grow)', lock: 'Opens at level ' + M40_LEVEL });
  return `<div class="stack">
    ${hero({ eyebrow: 'The Arcade · practise it', title: 'Play', who: 'pip',
      line: 'Game wages go into your one wallet. There\'s no second, magic money.' })}
    ${m40open ? m40 : ''}
    <div class="sect"><b>A season of your own</b><i></i></div>
    ${GAMES.filter((g) => g.kind === 'flagship').map((g) => cover(g, { big: true, tint: 'var(--grow)' })).join('')}
    <div class="sect"><b>The board game · nobody goes bankrupt</b><i></i></div>
    ${GAMES.filter((g) => g.kind === 'board').map((g) => cover(g, { big: true, tint: 'var(--treasure)' })).join('')}
    <div class="sect"><b>A few minutes each</b><i></i></div>
    <div class="covers">${GAMES.filter((g) => g.kind === 'action').map((g) => cover(g)).join('')}</div>
    <div class="sect"><b>Quick drills · no reflexes required</b><i></i></div>
    <div class="covers">${GAMES.filter((g) => g.kind === 'drill').map((g) => cover(g, { tint: 'var(--save)' })).join('')}</div>
    <div class="sect"><b>Think it through · at the Bank</b><i></i></div>
    <div class="covers">${GAMES.filter((g) => g.kind === 'decision').map((g) => cover(g, { tint: 'var(--save)' })).join('')}</div>
    ${m40open ? '' : `<div class="sect"><b>Later on</b><i></i></div>${m40}`}
    ${c.market.best ? `<p class="small muted cupbest" style="padding:0 6px">Best Market Cup: <b>${esc(c.market.best)}</b>${Array.isArray(c.market.cups) && c.market.cups.length > 1
      ? ` · last cups <span class="tabnum">${c.market.cups.slice(-5).join(' → ')}</span>, ${cupTrendWord(c.market.cups)}` : ''}</p>` : ''}
  </div>`;
}

/* F3 · every game opens on a title card: the painting, three lines of how,
   the keys, and Start — and closes on what it practised. */
export const HOW = {
  so: ['Eight weeks on Market Row. Each week: plan, then sixty seconds of market day.', 'Buy the stock, set the prices, save for a better cart or a sign.', 'Plan with ↑↓ ←→ and ⏎. Serve 1–4, R to restock. Or tap.'],
  cr: ['Coins fall. Catch exactly the amount asked for.', 'One too many is overpaying.', 'Move with ← → or drag.'],
  nw: ['A thing appears. Is it a need or a want?', 'Some can be both — those are the interesting ones.', 'Tap a side, or press ← →.'],
  ss: ['A message arrives. Real, or a trap?', 'Traps rush you, flatter you, or want a secret kept.', 'Tap a side, or press ← →.'],
  bb: ['A month of money. Bills arrive one at a time.', 'Pay what you must, keep what you can.', 'Tap a choice, or press 1 or 2.'],
  cc: ['Hold to let your money grow, let go to bank it.', 'Grow too greedily and a crash can wipe it out.', 'Hold space, or press and hold.'],
  sr: ['Sixty seconds of customers at your stall.', 'Serve the right thing at the right price.', 'Tap, or press 1–4 and R.'],
  st: ['Before the storm, write your plan: when you would sell, and why you bought.', 'Then the price falls, everyone shouts, the news arrives. Nothing sells unless you do.', '1 2 3 to plan, Space re-reads it, SELL is the only way out.'],
  mc: ['A season of the Exchange, a week at a time.', 'Spread your money and keep your nerve.', 'Arrows to choose, Enter to confirm.'],
  mn: ['The board game: buy shops, collect rent.', 'Win when your street pays for your life.', 'Enter to roll, Y or N to buy.'],
  tt: ['Monthly numbers, turned into yearly ones.', 'Times twelve, in your head.', 'Tap an answer, or press 1–4.'],
  sn: ['Guess where compounding lands.', 'Nobody guesses high enough — try anyway.', 'Tap an answer, or press 1–4.'],
  sb: ['Three things you want, a wage, and a few ways to get each one.', 'Type what borrowing costs in all, pick a path, then watch the weeks.', 'Number keys and Enter, or tap.'],
};
export const PRACTISED = {
  so: 'running a stall over weeks: stock, prices and waste — and that busy is not the same as profitable',
  cr: 'paying exact amounts and counting change', nw: 'telling needs from wants', ss: 'spotting the shape of a scam',
  bb: 'paying bills first and living inside a month', cc: 'how compounding grows — and why greed crashes it', sr: 'pricing and serving under time pressure',
  st: 'making a plan before the storm and keeping to it — holding through noise, selling when the news says the business has stopped', mc: 'spreading money out and keeping your nerve', mn: 'buying things that pay you back',
  tt: 'turning monthly costs into yearly ones', sn: 'how big compounding really gets',
  sb: 'what borrowing really costs in all, and keeping a cushion for surprises',
};
/* ── G8 · three levels, G9 · three goals ──────────────────────────────────
   A level turns the mechanic's own knobs and nothing else. Each level has its
   own `par` — the number its pay is measured against — so the same care earns
   the same wage on every level: Tricky is a challenge, never a bigger payday.
   Standard is every game exactly as it was. For a game scored as a share of a
   fixed set (the two-choice cards, the drills, Budget Blitz, Market Storm) the
   par is that set, and the pay is the share of it you got right.
 */
export const ARCADE_TIERS = {
  /* Stall of My Own: the level is the season's (stallsim.js LEVELS). par: a week's decision
     score (out of ten) that earns the plain wage — the same on every level, because the
     score already measures each decision against that level's own week */
  so: {
    easy:     { par: 6.5, says: 'Two things to sell, steady prices, and nothing goes off.' },
    standard: { par: 6.5, says: 'Three things, the weather, prices that move, and chai and golas go off.' },
    tricky:   { par: 6.5, says: 'Four things, a rival stall opposite, and a cart offered on credit.' },
  },
  /* fall: coin speed · spawn: time between coins · coins: how many coin sizes · min/max: coins in an amount ·
     help: how often a coin that fits is sent · par: a careful round's score */
  cr: {
    easy:     { fall: 0.75, spawn: 1.15, coins: 4, min: 2, max: 3, help: 0.7, par: 67, says: 'Slower coins, smaller amounts, fewer kinds of coin.' },
    standard: { fall: 1, spawn: 1, coins: 5, min: 2, max: 4, help: 0.55, par: 74, says: 'The round as it comes.' },
    tricky:   { fall: 1.25, spawn: 0.85, coins: 5, min: 3, max: 5, help: 0.45, par: 80, says: 'Faster coins and bigger amounts.' },
  },
  /* n: cards in a round (0 = all) · clock: ms to decide each card (0 = no clock) · par: cards to get right */
  nw: {
    easy:     { n: 8, clock: 0, says: 'A shorter round: eight cards.' },
    standard: { n: 0, clock: 0, says: 'Every card, no clock.' },
    tricky:   { n: 0, clock: 6000, says: 'Every card, and six seconds to decide each one.' },
  },
  ss: {
    easy:     { n: 6, clock: 0, says: 'A shorter round: six messages.' },
    standard: { n: 0, clock: 0, says: 'Every message, no clock.' },
    tricky:   { n: 0, clock: 9000, says: 'Every message, and nine seconds to decide — the way a real one rushes you.' },
  },
  /* pot: the month's money, × · first: which bills arrive first · par: the most a month can earn (decision points) */
  bb: {
    easy:     { pot: 1.25, first: null, par: 14, says: 'A roomier month.' },
    standard: { pot: 1, first: null, par: 14, says: 'The month as it comes.' },
    tricky:   { pot: 0.8, first: 'wants', par: 14, says: 'A tight month, and the treats arrive before the bills.' },
  },
  /* charge: how fast holding charges · target: the line (the badge and a goal) · par: the pay's
     yardstick — the same on every level, because what a year grows by never depends on the line */
  cc: {
    easy:     { charge: 0.75, target: 360, says: 'The charge fills slower, so the middle is easier to hit. The line is lower.' },
    standard: { charge: 1, target: 420, says: 'Fifteen years, the line at 420.' },
    tricky:   { charge: 1.35, target: 480, says: 'The charge races, and the line is higher.' },
  },
  /* spawn: time between customers, × · patience: ms a customer waits · par: a careful day's profit,
     in price units (only the ratio between levels is used, so the currency does not matter) */
  sr: {
    easy:     { spawn: 1.15, patience: 10500, par: 161, says: 'Fewer customers, and they wait longer.' },
    standard: { spawn: 1, patience: 9000, par: 186, says: 'Sixty seconds as they come.' },
    tricky:   { spawn: 0.75, patience: 7000, par: 224, says: 'A rush: more customers, less patience.' },
  },
  /* every: ms between shouts · shout: panic per shout · drift: panic per ms · par: the plan
     kept and the news read (storm.js stormScore, out of STORM_PAR) */
  st: {
    easy:     { every: 4200, shout: 9, drift: 0.0018, par: 10, says: 'Fewer shouts, and they rattle you less.' },
    standard: { every: 3400, shout: 11, drift: 0.0022, par: 10, says: 'The storm as it comes.' },
    tricky:   { every: 2700, shout: 13, drift: 0.0026, par: 10, says: 'More shouting, louder, and the panic climbs faster.' },
  },
  /* shock: week-to-week swing, × · crash: the red week, × · par: Boring Bella's cup score on this level (worked out) */
  mc: {
    easy:     { shock: 0.6, crash: 0.6, says: 'A calmer market.' },
    standard: { shock: 1, crash: 1, says: 'The season as it comes.' },
    tricky:   { shock: 1.5, crash: 1.4, says: 'A wild market with a deeper red week.' },
  },
  /* set: which numbers · par: questions to get right */
  tt: {
    easy:     { set: 'easy', says: 'Round numbers.' },
    standard: { set: 'standard', says: 'Everyday numbers.' },
    tricky:   { set: 'tricky', says: 'Awkward numbers, the kind real prices are.' },
  },
  sn: {
    easy:     { set: 'easy', says: 'Shorter times and friendly rates.' },
    standard: { set: 'standard', says: 'Ten to thirty years.' },
    tricky:   { set: 'tricky', says: 'Odd rates and long horizons.' },
  },
};
/* the pars that are a fixed set: worked out from the game itself, so they cannot drift */
ARCADE_TIERS.nw.easy.par = 8; ARCADE_TIERS.nw.standard.par = 12; ARCADE_TIERS.nw.tricky.par = 12;
ARCADE_TIERS.ss.easy.par = 6; ARCADE_TIERS.ss.standard.par = 10; ARCADE_TIERS.ss.tricky.par = 10;
ARCADE_TIERS.cc.easy.par = 420; ARCADE_TIERS.cc.standard.par = 420; ARCADE_TIERS.cc.tricky.par = 420;
ARCADE_TIERS.tt.easy.par = 8; ARCADE_TIERS.tt.standard.par = 8; ARCADE_TIERS.tt.tricky.par = 8;
ARCADE_TIERS.sn.easy.par = 6; ARCADE_TIERS.sn.standard.par = 6; ARCADE_TIERS.sn.tricky.par = 6;
/* Main Street: baseExp is everyone's starting expenses a lap (board.js); its pay is scaled by
   Standard's over the level's, so its par is the life it has to pay for */
ARCADE_TIERS.mn = {
  easy:     { baseExp: 18, par: 18, says: 'A cheaper life to pay for: your street covers it sooner.' },
  standard: { baseExp: 24, par: 24, says: 'The board as it comes.' },
  tricky:   { baseExp: 30, par: 30, says: 'A dearer life: it takes a bigger street to pay for it.' },
};
ARCADE_TIERS.sb = SB_TIERS;
export const TIERLESS = {};

/* Three goals per game, each a decision you can choose to make. They read the run's
   summary when it ends, tick a record on the child, and pay nothing at all. */
export const ARCADE_GOALS = {
  so: [
    { id: 'goal', name: 'A season with its goal reached by week 8', check: (r) => r.soComplete === true && r.soGoal === true },
    { id: 'buffer', name: 'A whole season, never broke on a market morning', check: (r) => r.soComplete === true && r.soBroke === 0 && r.soSold > 0 },
    { id: 'waste', name: 'A whole season with less than a tenth of the stock wasted', check: (r) => r.soComplete === true && r.soWaste < 0.1 && r.soSold > 0 },
  ],
  sb: SB_GOALS,
  cr: [
    { id: 'exact3', name: 'Exact three times in a round', check: (r) => r.exact >= 3 },
    { id: 'clean', name: 'A whole round without overpaying', check: (r) => r.finished && r.overpays === 0 && r.exact >= 2 },
    { id: 'five', name: 'Five exact amounts before a single overpay', check: (r) => r.firstRun >= 5 },
  ],
  nw: [
    { id: 'perfect', name: 'All right first time', check: (r) => r.right === r.n },
    { id: 'needs', name: 'Every need called a need', check: (r) => r.needWrong === 0 },
    { id: 'wants', name: 'Every want called a want', check: (r) => r.wantWrong === 0 },
  ],
  ss: [
    { id: 'perfect', name: 'All right first time', check: (r) => r.right === r.n },
    { id: 'notrap', name: 'Never fell for a trap', check: (r) => r.scamWrong === 0 },
    { id: 'trust', name: 'Trusted every real message', check: (r) => r.safeWrong === 0 },
  ],
  bb: [
    { id: 'musts', name: 'Every bill you needed, paid', check: (r) => r.mustMissed === 0 },
    { id: 'spare', name: 'Needs paid, and money left at the end', check: (r) => r.mustMissed === 0 && r.left > 0 },
    { id: 'quarter', name: 'Needs paid, and a quarter of the month kept', check: (r) => r.mustMissed === 0 && r.left >= r.pot / 4 },
  ],
  cc: [
    { id: 'target', name: 'Over the target line', check: (r) => r.reached },
    { id: 'nofall', name: 'Fifteen years without one going backwards', check: (r) => r.years >= 15 && r.falls === 0 },
    { id: 'steady', name: 'Never charged past three-quarters', check: (r) => r.years >= 15 && r.maxCharge <= 75 },
  ],
  sr: [
    { id: 'profit', name: 'Made a profit', check: (r) => r.profit > 0 },
    { id: 'nolost', name: 'Nobody gave up waiting', check: (r) => r.lost === 0 && r.served >= 8 },
    { id: 'nowrong', name: 'Never served what nobody wanted', check: (r) => r.wrong === 0 && r.served >= 8 },
  ],
  st: [
    { id: 'kept', name: 'Kept to the plan you wrote', check: (r) => r.kept },
    { id: 'news', name: 'Sold when the news said the company had stopped making money', check: (r) => r.stops && r.read && r.kept },
    { id: 'calm', name: 'Kept to your plan, and panic never passed half', check: (r) => r.kept && r.maxPanic <= 50 },
  ],
  mc: [
    { id: 'spread', name: 'Spread out every single week', check: (r) => r.spreadWeeks === r.weeks },
    { id: 'nerve', name: 'Kept your nerve: moved 40% or less all cup', check: (r) => r.churn <= 40 },
    { id: 'bella', name: 'Beat Boring Bella on cup score', check: (r) => r.beatBella },
  ],
  tt: [
    { id: 'perfect', name: 'All right first time', check: (r) => r.right === r.n },
    { id: 'weekly', name: 'Every weekly one right', check: (r) => r.weeklyWrong === 0 },
    { id: 'yearly', name: 'Saw through the yearly price', check: (r) => r.compareRight },
  ],
  mn: [
    { id: 'win', name: 'Your street paid for your life', check: (r) => r.won },
    { id: 'four', name: 'Owned four businesses at the end', check: (r) => r.owned >= 4 },
    { id: 'nosell', name: 'Kept a buffer: never had to sell at half price', check: (r) => r.sold === 0 && r.owned >= 1 },
  ],
  sn: [
    { id: 'perfect', name: 'All right first time', check: (r) => r.right === r.n },
    { id: 'nosimple', name: 'Never picked the adding-up answer', check: (r) => r.simple === 0 },
    { id: 'long', name: 'Every one over the longest time right', check: (r) => r.longWrong === 0 },
  ],
};

let current = null, curTier = 'standard', lastGoals = null, curSeed = null, lastOffer = null;
/* the knobs of the game being played, at the level it was started on */
const knobs = (id) => ARCADE_TIERS[id][curTier] || ARCADE_TIERS[id].standard;

/* ── §1.1 · ONE pay path, and one table that decides what play is worth ──────
   Every game ends with a decision score against its level's par (SHARE), and the
   wage is that score on one scale (wageUnits) — in PRICE UNITS, handed to payout(),
   which converts to the child's currency exactly once. A careful-to-perfect round
   is PERFECT × par (the jobs' own yardstick) and pays WAGE_NORM; nothing pays more,
   so no game is a better farm than another and Tricky is never a bigger payday.
   Main Street is a ten-minute board game against a one-minute arcade round, so its
   top wage is a little higher — and still inside 1.5× the norm (test/economy.mjs). */
export const WAGE_NORM = 12, PERFECT = 1.6;
export const WAGE_SCALE = { mn: 1.4 };
export function wageUnits(id, share) {
  const s = Math.max(0, Math.min(PERFECT, Number.isFinite(share) ? share : 0));
  return Math.round(WAGE_NORM * (WAGE_SCALE[id] || 1) * s / PERFECT);
}
/* the decision score of a finished round against `par` (this level's). A game scored
   as a share of a fixed set calls par five in eight right, so a perfect set is 1.6× par. */
export const SHARE = {
  cr: (r, par) => r.score / par,
  nw: (r) => PERFECT * r.right / Math.max(1, r.n),
  ss: (r) => PERFECT * r.right / Math.max(1, r.n),
  tt: (r) => PERFECT * r.right / Math.max(1, r.n),
  sn: (r) => PERFECT * r.right / Math.max(1, r.n),
  bb: (r) => PERFECT * r.points / 14,
  cc: (r, par) => (r.ruined ? 0 : PERFECT * r.money / par),
  sr: (r, par) => Math.max(0, r.profitU) / par,
  st: (r) => PERFECT * r.points / STORM_PAR,   /* the plan kept and the news read; never the money */
  mc: (r, par) => r.total / Math.max(1, r.par || par),   /* r.par: Bella on this round's own season */
  mn: (r) => PERFECT * Math.min(1, Math.max(0, r.indep)),
  sb: (r) => PERFECT * r.points / Math.max(1, r.par),   /* r.par: the round's points out of (saveborrow.js SB_PAR) */
};
export function shareOf(id, run, tier = 'standard') {
  const t = ARCADE_TIERS[id], par = (t[tier] || t.standard).par || t.standard.par;
  return SHARE[id](run, par);
}
/* §1.7 · the owner's level rule, on top of Easy · Standard · Tricky: at least half of
   par keeps the level; under half OFFERS the one below; 1.6× par OFFERS the one above.
   An offer is a button on the end card and nothing else — a level never changes by itself. */
export function levelOffer(tier, share) {
  const i = TIER_IDS.indexOf(tier);
  if (i < 0 || !Number.isFinite(share)) return null;
  if (share < 0.5 && i > 0) return { dir: 'down', to: TIER_IDS[i - 1] };
  if (share >= PERFECT && i < TIER_IDS.length - 1) return { dir: 'up', to: TIER_IDS[i + 1] };
  return null;
}
/* §1.2 · every play draws its own seed (content variety is simulation, never a reward:
   no reward anywhere is random); the seed is kept with the round, so it can be replayed */
export function playSeed() { return 1 + Math.floor(Math.random() * 2147483646); }

function goalsFor(id, run) {
  const c = K();
  lastGoals = { id, list: earnGoals(c, id, ARCADE_GOALS[id], Object.assign({ tier: curTier }, run)) };
  if (R.s) sim.save(R.s);
  return lastGoals.list;
}
/* Every game's finish comes through here, once: the decision score, the level offer, the
   round kept with its seed, the day's quests (on FINISH, never on opening the title card),
   the goals, and the wage through payout(). Returns what was paid. */
function roundEnd(id, run, label) {
  const c = K(), share = shareOf(id, run, curTier);
  lastOffer = Object.assign({ id, from: curTier, share }, levelOffer(curTier, share) || { dir: null });
  if (!c.rounds) c.rounds = {};
  c.rounds[id] = { seed: curSeed, tier: curTier, share: Math.round(share * 100) / 100, t: Date.now() };
  sim.questTick(c, 'game', 1);
  if (id === 'mn') sim.questTick(c, 'board', 1);
  const paid = payout(wageUnits(id, share), label);
  goalsFor(id, run);
  return paid;
}
function levelTake(arg) {
  const o = lastOffer, [id, t] = String(arg || '').split(':');
  if (!o || !o.dir || o.taken || o.id !== id || o.to !== t || !setTier(K(), id, t)) return;
  lastOffer = Object.assign({}, o, { taken: true });
  if (R.s) sim.save(R.s);
  sfx.click(); if (typeof document !== 'undefined') toast(`Next time: ${TIER_NAME[t]}`); R.render();
}
on('gLevel', levelTake);
/* the offer, drawn on the end card: one button, and L for the keyboard */
function offerHtml() {
  const o = lastOffer;
  if (!o || o.id !== current || !o.dir) return '';
  if (o.taken) return `<p class="small lvloffer" data-dir="${o.dir}">Next round is on <b>${TIER_NAME[o.to]}</b>.</p>`;
  const line = o.dir === 'up'
    ? `Well over par on ${TIER_NAME[o.from]}. Ready for ${TIER_NAME[o.to]}?`
    : `That one was hard on ${TIER_NAME[o.from]}. ${TIER_NAME[o.to]} is there if you want it: your choice.`;
  return `<div class="lvloffer" data-dir="${o.dir}"><p class="small">${esc(line)}</p>
    <button class="btn ghost sm" data-act="gLevel" data-arg="${o.id}:${o.to}">L · Play ${TIER_NAME[o.to]} next time</button></div>`;
}
/* a finished game's keys: Enter leaves, L takes the level offered (if one is) */
export function endKey(e) {
  if (e.key === 'Enter') { quitGame(); R.render(); return; }
  if ((e.key === 'l' || e.key === 'L') && lastOffer && lastOffer.id === current) levelTake(lastOffer.id + ':' + lastOffer.to);
}

/* The level picker, shared with the job shifts: three buttons, the lit one says what it changes. */
export function tierPicker(tier, act, prefix = '', says = null) {
  return `<div class="tierpick" role="group" aria-label="Level">
    ${TIER_IDS.map((t, i) => `<button class="tierbtn${t === tier ? ' on' : ''}" data-act="${act}" data-arg="${prefix}${t}" data-tier="${t}"
      aria-pressed="${t === tier}"><span class="tk" aria-hidden="true">${i + 1}</span>${TIER_NAME[t]}</button>`).join('')}
  </div>${says && says[tier] ? `<p class="small tiersays">${esc(says[tier])}</p>` : ''}`;
}
/* The three goals, ticked from the child's record. `earned` (this run's) marks the new ones. */
export function goalList(table, c, id, earned = null) {
  if (!table || !table.length) return '';
  const have = goalsMet(c, id), fresh = new Set((earned || []).filter((g) => g.fresh).map((g) => g.id));
  return `<div class="goals"><div class="eyebrow">Goals · a record, not a prize</div>
    <ul>${table.map((g) => `<li class="${have[g.id] ? 'met' : ''}${fresh.has(g.id) ? ' fresh' : ''}" data-goal="${g.id}">
      <span class="gtick" aria-hidden="true">${have[g.id] ? '✓' : ''}</span>
      <span>${esc(g.name)}${fresh.has(g.id) ? ' <b class="gnew">new</b>' : ''}</span>
      <span class="sr-only">${have[g.id] ? 'done' : 'not yet'}</span></li>`).join('')}</ul></div>`;
}
const endGoals = () => (lastGoals && lastGoals.id === current && R.game && R.game.id === current
  ? goalList(ARCADE_GOALS[current], K(), current, lastGoals.list) : '');

export function introView(id) {
  const g = GAMES.find((x) => x.id === id) || { name: id, keys: '' }, art = coverOf(id), how = HOW[id] || [];
  const c = K(), tiers = ARCADE_TIERS[id], tier = tierOf(c, id);
  const says = tiers ? Object.fromEntries(TIER_IDS.map((t) => [t, tiers[t].says])) : null;
  return `<div class="stack">
    <section class="gintro" style="${art ? `--cover:url(${art.src})` : ''}" aria-labelledby="gi-h">
      <span class="cv-veil"></span>
      <div class="gi-body"><span class="eyebrow">How to play</span><h1 id="gi-h">${esc(g.name)}</h1>
        <ol>${how.map((h) => `<li>${esc(h)}</li>`).join('')}</ol>
        ${g.keys ? `<span class="pill">${esc(g.keys)}</span>` : ''}</div>
    </section>
    ${tiers ? `<div class="card gilevel" style="box-shadow:none">
      <div class="row"><span class="eyebrow grow">Level</span><span class="small muted">1 2 3 to pick</span></div>
      ${tierPicker(tier, 'gTier', id + ':', says)}
      <p class="small muted tierpar">Every level pays the same for the same care — a harder one is a challenge, not a bigger wage.</p>
      ${goalList(ARCADE_GOALS[id], c, id)}
    </div>` : ''}
    <button class="btn wide" data-act="gbegin" data-arg="${id}" style="min-height:52px;font-size:17px">Start${tiers ? ' on ' + TIER_NAME[tier] : ''} →</button>
    <button class="btn ghost wide" data-act="gback">Back to Play</button></div>`;
}
/* the picker's own action: arcade.js registers it, so the level is remembered on the child */
on('gTier', (arg) => {
  const [id, t] = String(arg || '').split(':');
  if (!ARCADE_TIERS[id] || !setTier(K(), id, t)) return;
  if (R.s) sim.save(R.s);
  sfx.click(); R.render();
});
/* and by keyboard on the title card: 1 2 3 pick a level (Enter on Start begins) */
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('keydown', (e) => {
    if (!R.gameIntro || R.game || R.overlay || e.defaultPrevented) return;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '')) return;
    const n = ['1', '2', '3'].indexOf(e.key);
    if (n >= 0 && ARCADE_TIERS[R.gameIntro]) { e.preventDefault(); setTier(K(), R.gameIntro, TIER_IDS[n]); if (R.s) sim.save(R.s); sfx.click(); R.render(); }
  });
}
export function startGame(id, seed, tier) {
  current = id; lastGoals = null; lastOffer = null; lastCapped = false;
  curTier = TIER_IDS.includes(tier) ? tier : (ARCADE_TIERS[id] ? tierOf(K(), id) : 'standard');
  /* §1.2 · a seed per play, kept with the round — or the one given, to replay it */
  curSeed = seed != null ? seed : playSeed();
  const f = { cr: changeRush, nw: needsWants, ss: scamSpotter, bb: budgetBlitz,
    cc: compoundClimb, sr: stallRush, st: marketStorm, tt: timesTwelve, sn: snowball,
    mc: marketCup, sb: (sd) => saveBorrow(sbKit(), sd), mn: (sd) => mainStreet({ seed: sd, baseExp: knobs('mn').baseExp, chip: tierChip, goals: endGoals, foot: (won) => endFoot(won), endKey,
      /* Main Street pays through the same door as every other game (§1.1, §2.9): the cap counts it */
      onFinish: (run) => roundEnd('mn', run, 'Main Street') }) }[id];
  if (id === 'so') return startStall(curSeed);
  if (f) { if (R.game && R.game.stop) R.game.stop(); R.game = f(curSeed); if (R.game) R.game.seed = curSeed; sfx.click(); }
}
/* Stall of My Own is a season, not a round, and it loads on its own (stall.js): the arcade
   hands it the four things every game shares — the level, the one pay path, the HUD and
   the goals — so the stall never pays or ticks anything any other way. */
export function stallCtx() {
  return {
    tier: curTier,
    payout: (units) => { const paid = payout(units, 'Stall of My Own'); return { paid, capped: lastCapped }; },
    hud, goals: (run) => goalsFor('so', run), endGoals, quit: quitGame, cappedLine: CAPPED_LINE,
  };
}
function startStall(seed) {
  if (R.game && R.game.stop) R.game.stop();
  const wait = { id: 'so', loading: true, view: () => `<div class="stack">${hud(['Market Row'])}<div class="stage" style="justify-content:center;text-align:center"><p class="small muted">Opening the stall…</p></div></div>`, act() {}, key() {} };
  R.game = wait;
  return import('./stall.js').then((m) => {
    if (R.game !== wait) return R.game;
    R.game = m.stallGame(stallCtx(), seed);
    sfx.click(); R.render();
    return R.game;
  });
}
/* what Save or Borrow? borrows from the arcade, handed over rather than imported back */
const sbKit = () => ({ tier: curTier, K, hud, endCard, tierChip, payout, quit: quitGame,
  /* the one door every finish goes through (§1.1, §1.7): pay, the decision score, the level offer */
  finish: (run) => roundEnd('sb', run, 'Save or Borrow?'),
  parScale: () => parScale('sb'), goals: (run) => goalsFor('sb', run) });
export function quitGame() { if (R.game && R.game.stop) R.game.stop(); R.game = null; lastGoals = null; lastOffer = null; }
/* the level chip every game's HUD carries */
const tierChip = () => `<span class="tierchip" data-tier="${curTier}">${TIER_NAME[curTier]}</span>`;

export function hud(bits) {
  /* an empty bit is no chip at all (audit v4: an empty chip after '120cm wide') */
  return `<div class="hud">${bits.filter((b) => b != null && String(b).replace(/<[^>]*>/g, '').trim()).map((b) => `<span class="box">${b}</span>`).join('')}
    <span class="grow"></span><button class="btn ghost sm" data-act="gquit">Leave</button></div>`;
}
/* §1.1 · `n` is in PRICE UNITS. This is the one place a wage meets the currency:
   price() runs here, once, and nowhere upstream of it (test/economy.mjs). */
let lastPayRec = { units: 0, paid: 0, capped: false, label: '' };
export function payout(n, label) {
  const units = Math.max(0, Math.round(n));
  const amt = price(units);
  const r = sim.gameWage(K(), label, amt);
  lastCapped = r.capped;
  lastPayRec = { units, paid: r.paid, capped: r.capped, label };
  if (r.paid > 0) { sim.stamp(K()); sfx.coin(); }
  return r.paid;
}
export const lastPay = () => Object.assign({}, lastPayRec);
let lastCapped = false;
const PIP_POSES = ['wave', 'think', 'point', 'cheer', 'oops', 'sleep'];
/* §1.4 · the bottom of every finish screen, written by the game it is about: what THAT
   game practised, and what it paid — or, when the day's paid plays are used, why not. */
export const CAPPED_LINE = 'Paid plays used for today: this one is practice, and it still counts toward your goals.';
export function payLine(won, capped, capLine = CAPPED_LINE) {
  return capped ? capLine
    : won > 0 ? `Earned ${money(won)}, straight into your wallet.`
      : 'Nothing earned this round: the wage follows how the round went against par.';
}
export function practisedLine(text) { return text ? `<p class="practised"><b>You practised:</b> ${esc(text)}</p>` : ''; }
function endFoot(won, extra = '') {
  return `${practisedLine(current && PRACTISED[current])}${offerHtml()}${endGoals()}
    <p class="small muted endpay">${payLine(won, lastCapped)}${extra ? ' ' + extra : ''}</p>`;
}
/* `o` lets a caller that is not an arcade game (a job shift) speak for itself:
   { id: null, practised, capped, capLine } — never the last arcade game's words */
export function endCard(em, title, sub, wage, line, who, o = null) {
  /* §14 · a finish screen names what was practised and the child's own best — never
     anyone else's. Pip cheers a good round and thinks about a hard one; the child's
     own face is on it (J6). The best is the first number of the result, kept per game. */
  const c = K(), own = o ? o.id : current, n = (String(title).replace(/<[^>]+>/g, '').match(/-?\d+/) || [])[0];
  let best = null, isNew = false;
  if (own && n != null) {
    if (!c.bests) c.bests = {};
    const prev = c.bests[own];
    if (prev == null || +n > prev) { isNew = prev != null; c.bests[own] = +n; }
    best = c.bests[own];
  }
  /* the first argument is the mood: one of Pip's poses, or a drawn thing for a
     good round (🏅 🎯 🪙 …). Never a face and never a skull (audit v4, N4) —
     a hard round is Pip thinking, a ruinous one is Pip's 'oops'. */
  const pose = PIP_POSES.includes(em) ? em : em === '📉' ? 'think' : 'cheer';
  return `<div class="stage endcard" style="justify-content:center;text-align:center">
    <div class="endfig">${pipPose(pose, 104)}<span class="endav">${kidBadge(c, 56)}</span></div>
    <h2>${esc(title)}</h2>
    ${sub ? `<p class="endkey">${sub}</p>` : ''}
    ${best != null ? `<p class="endbest">${isNew ? 'A new best for you' : 'Your best'}: <b class="tabnum">${best}</b></p>` : ''}
    ${line ? say(who || 'pip', line) : ''}
    ${o ? `${practisedLine(o.practised)}${o.offer || ''}<p class="small muted endpay">${payLine(wage, o.capped, o.capLine)}</p>` : endFoot(wage)}
    <button class="btn wide" data-act="gquit">Back to Play</button></div>`;
}
function shuffle(arr, seed) {
  const r = rng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
/* Two-choice games share a shape: a card, a verdict, a note, a tally. */
function twoChoice(cfg) {
  /* G8 · a level is how many cards and whether each one has a clock; the pay is the
     share right, so a short round is not a cheaper one */
  const kn = knobs(cfg.id);
  /* §1.2 · the order is this play's own (cfg.seed is the play's seed) */
  const all = shuffle(cfg.items.slice(), cfg.seed);
  const items = kn.n ? all.slice(0, kn.n) : all;
  const st = { i: 0, right: 0, note: null, done: false, wrong: {}, shown: Date.now(), hold: null, left: kn.clock || 0 };
  let timer = 0;
  const stop = () => { if (timer) { clearTimeout(timer); st.left = Math.max(0, st.left - (Date.now() - st.shown)); } timer = 0; };
  const arm = (ms) => {
    if (timer) clearTimeout(timer); timer = 0;
    st.shown = Date.now(); st.left = ms != null ? ms : kn.clock;
    if (kn.clock && !st.done && !st.hold) timer = setTimeout(() => { timer = 0; pick(null); }, st.left);
  };
  const nameOf = (it) => (cfg.nameOf ? cfg.nameOf(it) : it.t);
  const finishIf = () => {
    if (st.i < items.length) return false;
    st.done = true;
    const run = { right: st.right, n: items.length, needWrong: st.wrong.need || 0, wantWrong: st.wrong.want || 0,
      scamWrong: st.wrong.scam || 0, safeWrong: st.wrong.safe || 0 };
    st.won = roundEnd(cfg.id, run, cfg.name);
    return true;
  };
  const pick = (side) => {
    if (st.done || st.hold) return;
    if (timer) clearTimeout(timer); timer = 0;
    const it = items[st.i];
    const ok = side != null && (it.a === side || it.a === 'both');
    if (ok) { st.right++; st.combo = (st.combo || 0) + 1; sfx.good(); } else { st.combo = 0; st.wrong[it.a] = (st.wrong[it.a] || 0) + 1; sfx.bad(); }
    st.pop = ok ? (st.combo > 1 ? `Combo ×${st.combo}` : '+1') : null;
    /* Specific, never a bare "Yes." (D3): name the thing and the side it belongs on,
       and, when the item carries one, why. */
    const named = it.a === 'both' ? `“${nameOf(it)}” can be both: that is the interesting kind.` : `“${nameOf(it)}” is ${cfg.sideWord[it.a]}.`;
    if (ok) {
      st.note = { ok, text: it.note ? `${named} ${it.note}` : named };
      st.i++;
      if (!finishIf()) arm();
    } else {
      /* §1.3 · a wrong answer HOLDS: the same card stays, with its note naming the item
         and the right side, until Continue. The correction never lands on the next card. */
      const lead = side == null ? `The clock ran out. ${named}` : ['Not this time.', named, cfg.wrongNote(it)].filter(Boolean).join(' ');
      st.note = { ok, text: it.note ? `${lead} ${it.note}` : lead };
      st.hold = { side, right: it.a };
    }
    R.render();
    /* G2 · the kit's verdict from the button pressed (none when the clock ran out) */
    if (side != null && !st.done) verdict(`.gplay [data-act="${side === cfg.left.side ? cfg.left.act : cfg.right.act}"]`, ok);
  };
  const cont = () => {
    if (!st.hold || st.done) return;
    st.hold = null; st.note = null; st.i++;
    if (!finishIf()) arm();
    R.render();
  };
  arm();
  return {
    id: cfg.id, st, stop, items, cont,
    /* back from a hidden tab: the card's clock carries on from where it stopped */
    resume() { if (!st.done && !st.hold && kn.clock && !timer) arm(st.left); },
    key(e) {
      if (st.done) { endKey(e); return; }
      if (st.hold) { if (e.key === 'Enter' || e.key === ' ') { if (e.preventDefault) e.preventDefault(); cont(); } return; }
      if (e.key === 'ArrowLeft') pick(cfg.left.side);
      else if (e.key === 'ArrowRight') pick(cfg.right.side);
    },
    act(n) {
      if (n === 'tcNext') cont();
      else if (n === cfg.left.act) pick(cfg.left.side);
      else if (n === cfg.right.act) pick(cfg.right.side);
    },
    view() {
      if (st.done) return `<div class="stack">${hud(['Done', tierChip()])}
        ${endCard(st.right >= items.length - 1 ? '🏅' : 'think', st.right + ' of ' + items.length, '', st.won, cfg.outro(st.right, items.length), cfg.who)}</div>`;
      const it = items[st.i], h = st.hold;
      /* the clock is a bar that drains; a re-render picks it up where it was */
      const clock = kn.clock && !h ? `<div class="tclock" aria-hidden="true"><i style="animation-duration:${kn.clock}ms;animation-delay:-${Math.min(kn.clock, kn.clock - st.left + (Date.now() - st.shown))}ms"></i></div>` : '';
      const btn = (s) => {
        const mark = h ? (s.side === h.right || h.right === 'both' ? ' tcright' : s.side === h.side ? ' tcwrong' : '') : '';
        return `<button class="btn${mark}" style="background:${s.color}" data-act="${s.act}"${h ? ' disabled' : ''}>${s === cfg.left ? '← ' + s.label : s.label + ' →'}</button>`;
      };
      return `<div class="stack">
        ${hud([tierChip(), `${st.i + 1} / ${items.length}`, `right ${st.right}`, st.combo > 1 ? `<span class="combo">Combo ×${st.combo}</span>` : ''].filter(Boolean))}
        <div class="stage">${st.pop ? `<span class="numpop" aria-hidden="true">${esc(st.pop)}</span>` : ''}
          ${clock}${cfg.card(it)}
          ${st.note ? `<div class="tcnote ${st.note.ok ? 'ok' : 'no'}" role="status" style="background:${st.note.ok ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">${esc(st.note.text)}</div>` : ''}
          <div class="grow"></div>
          <div class="choices">${btn(cfg.left)}${btn(cfg.right)}</div>
          ${h ? `<button class="btn wide" data-act="tcNext">Continue · Enter</button>` : ''}
          <p class="hint">${esc(h ? 'Read why, then Continue: Enter, or tap.' : cfg.hint(items))}</p>
        </div></div>`;
    },
  };
}
/* ══ 1 · NEEDS vs WANTS ═══════════════════════════════════════════════ */
export const NW = [
  { em: '🍚', t: 'Rice for the week', a: 'need' },
  { em: '🎮', t: 'A new game', a: 'want' },
  { em: '🧥', t: 'A winter coat', a: 'need' },
  { em: '☂️', t: 'An umbrella, and it is raining', a: 'both', note: 'Today it is a need. In May it is a want. That is the whole card.' },
  { em: '🚌', t: 'The bus fare to school', a: 'need' },
  { em: '🍫', t: 'Chocolate at the till', a: 'want' },
  { em: '📱', t: 'A phone, and your family shares one', a: 'both', note: 'Depends entirely on the household. There is no universal answer, and pretending there is would be the mistake.' },
  { em: '👟', t: 'Shoes that still fit', a: 'want', note: 'They still fit. That makes them a want today.' },
  { em: '💊', t: 'Medicine you were prescribed', a: 'need' },
  { em: '🎧', t: 'Headphones', a: 'want' },
  { em: '💧', t: 'Clean water', a: 'need' },
  { em: '🎂', t: 'A cake for your sister', a: 'both', note: 'Nobody starves without it. It might still be the best thing you buy all month.' },
];
function needsWants(seed) {
  return twoChoice({
    id: 'nw', name: 'Needs vs Wants', items: NW, seed, who: 'pip',
    hint: () => 'Arrow keys, or tap. Some are both — either answer counts.',
    sideWord: { need: 'a need', want: 'a want' },
    left: { side: 'need', act: 'nwNeed', label: 'Need', color: 'var(--save)' },
    right: { side: 'want', act: 'nwWant', label: 'Want', color: 'var(--give)' },
    card: (it) => `<div class="gcard"><span class="em">${ico(it.em, it.em, 44)}</span><span class="nm">${esc(it.t)}</span></div>`,
    wrongNote: (it) => it.a === 'need' ? 'You would be in trouble without it.' : 'Lovely, but you would survive the week.',
    outro: () => 'The ones that were <b>both</b> are the point. A list of needs that never changes is a list somebody else wrote for you.',
  });
}

/* ══ 2 · SCAM SPOTTER ═════════════════════════════════════════════════
   Four in ten of these are real and ordinary. A game where everything is a scam
   teaches suspicion; the skill is telling them apart. */
export const SS = [
  { t: 'Your parcel could not be delivered. Pay the £1.99 redelivery fee here to reschedule.', a: 'scam',
    note: 'A tiny fee is the hook — it is not about the £1.99, it is about your card details.' },
  { t: 'Hi, it\'s Nani. Are you free on Sunday? Ask your mother and let me know.', a: 'safe',
    note: 'No money, no hurry, no secret. Just Sunday.' },
  { t: 'CONGRATULATIONS! You are today\'s selected winner. Claim within 2 hours!', a: 'scam',
    note: 'A prize you never entered, and a countdown. Reward plus hurry.' },
  { t: 'Your library book is due back on Friday. No action needed if you have returned it.', a: 'safe',
    note: '"No action needed" is almost never how a scam opens.' },
  { t: 'BANK ALERT: suspicious login. Reply with your PIN to secure your account NOW.', a: 'scam',
    note: 'No real bank ever asks for your PIN. Fright plus hurry plus a secret.' },
  { t: 'hey it\'s me, new number! lost my phone. can you send 200 quick, don\'t tell mum', a: 'scam',
    note: 'New number, urgent money, and "don\'t tell". The secrecy is the tell.' },
  { t: 'Your school trip form is due Monday. Paper copies are at the office.', a: 'safe',
    note: 'Boring, specific, and asks for nothing but a form.' },
  { t: 'FREE V-BUCKS GENERATOR — just log in with your username and password!', a: 'scam',
    note: 'There is no generator. There is a page collecting passwords.' },
  { t: 'Your order of one pencil case has shipped. Track it in the app you ordered from.', a: 'safe',
    note: 'It points you back to the app you already use rather than a new link.' },
  { t: 'INVESTMENT OPPORTUNITY: guaranteed to double in 30 days. Only 5 places left!', a: 'scam',
    note: 'Guaranteed and doubling do not belong in the same sentence — and there are always exactly five places left.' },
];
function scamSpotter(seed) {
  return twoChoice({
    id: 'ss', name: 'Scam Spotter', items: SS, seed, who: 'nana',
    /* §1.8 · a blurb must be true: it counts the round actually dealt */
    hint: (its) => { const n = its.filter((x) => x.a === 'safe').length;
      return `Arrow keys, or tap. ${n} of these ${its.length} ${n === 1 ? 'is' : 'are'} perfectly ordinary.`; },
    sideWord: { scam: 'a trap', safe: 'real' },
    /* a long message is named by its opening words */
    nameOf: (it) => { const w = it.t.split(/\s+/); return w.length > 6 ? w.slice(0, 6).join(' ') + '…' : it.t; },
    left: { side: 'safe', act: 'ssSafe', label: 'Looks fine', color: 'var(--grow)' },
    right: { side: 'scam', act: 'ssScam', label: 'It\'s a trap', color: 'var(--spend)' },
    card: (it) => `<div class="gcard" style="text-align:left"><span class="em" style="display:block;text-align:center">${ico('phone', '📱', 44)}</span>
      <p style="font-size:15px;line-height:1.5;font-weight:650">${esc(it.t)}</p></div>`,
    wrongNote: (it) => it.a === 'scam' ? '' : 'Suspecting everything is its own kind of expensive.',
    outro: (r, n) => r === n
      ? 'All of them. The shape is always the same: a reward or a fright, a hurry, and a secret.'
      : 'Look for the <b>shape</b>, not the story: a reward or a fright, plus a hurry, plus a secret.',
  });
}

/* ══ 3 · BUDGET BLITZ ═════════════════════════════════════════════════ */
function budgetBlitz(seed) {
  const c = K(), kn = knobs('bb');
  const bills = [
    { n: 'Rent on the stall', u: 14, must: true }, { n: 'Food for the month', u: 22, must: true },
    { n: 'Bus pass', u: 8, must: true }, { n: 'A film with friends', u: 6, must: false },
    { n: 'Phone plan', u: 6, must: true }, { n: "Mags's brass button", u: 12, must: false },
    { n: 'Sister’s birthday cake', u: 5, must: false }, { n: 'New shoes — the old ones leak', u: 10, must: true },
  ];
  /* §1.6 · every amount is in the currency's smallest unit and shown by one formatter,
     so the month on screen adds up to the money on screen in ₹, $, £, € and AED alike */
  const minor = CURRENCIES[currency()].minor || 1;
  /* G8 · a tight month is tight, never impossible: every bill you need always fits */
  const mustSum = bills.filter((b) => b.must).reduce((t, b) => t + minorPrice(b.u), 0);
  const base = Math.round(sim.weeklyIncome(c) * 4 * minor);
  const pot = kn.pot >= 1 ? Math.round(base * kn.pot) : Math.max(Math.ceil(mustSum * 1.05), Math.round(base * kn.pot));
  const shuffled = shuffle(bills.slice(), seed);
  const order = kn.first === 'wants' ? shuffled.filter((b) => !b.must).concat(shuffled.filter((b) => b.must)) : shuffled;
  const st = { i: 0, left: pot, missed: [], paid: [], done: false, pot, order };
  const decide = (payIt) => {
    if (st.done) return;
    const b = order[st.i], amt = minorPrice(b.u);
    if (payIt) {
      if (amt > st.left) { sfx.bad(); toast('Not enough left — and that is the lesson'); st.missed.push(b); }
      else { st.left -= amt; st.paid.push(b); sfx.click(); }
    } else { if (b.must) sfx.bad(); else sfx.good(); st.missed.push(b); }
    st.i++;
    if (st.i >= order.length) {
      st.done = true;
      st.mustMissed = st.missed.filter((x) => x.must).length;
      const points = Math.max(0, 10 - st.mustMissed * 4) + (st.left > 0 ? 4 : 0);
      st.won = roundEnd('bb', { points, mustMissed: st.mustMissed, left: st.left, pot }, 'Budget Blitz');
    }
    R.render();
  };
  return {
    id: 'bb', st, decide,
    key(e) { if (st.done) { endKey(e); return; } if (e.key === '1') decide(true); else if (e.key === '2') decide(false); },
    act(n) { if (n === 'bbPay') decide(true); else if (n === 'bbSkip') decide(false); },
    view() {
      if (st.done) return `<div class="stack">${hud(['Month over', tierChip()])}
        ${endCard(st.mustMissed === 0 ? '🎯' : 'think', minorMoney(st.left) + ' left over',
          st.mustMissed === 0 ? 'Everything you actually needed got paid.'
            : st.mustMissed + ' thing' + (st.mustMissed > 1 ? 's' : '') + ' you needed went unpaid. Those do not disappear — they move to next month.',
          st.won, 'Leftover money is not a prize. It is the part of the month you get to choose about.', 'nana')}</div>`;
      const b = order[st.i], amt = minorPrice(b.u);
      return `<div class="stack">
        ${hud([tierChip(), `Left ${minorMoney(st.left)}`, `${st.i + 1} / ${order.length}`])}
        <div class="stage">
          <div class="gcard"><span class="em">${ico('receipt', '🧾', 44)}</span><span class="nm">${esc(b.n)}</span>
            <div class="big" style="margin-top:6px">${minorMoney(amt)}</div></div>
          <div class="bar"><i style="width:${clamp(st.left / pot * 100, 0, 100)}%;background:${st.left > pot * 0.25 ? 'var(--grow)' : 'var(--spend)'}"></i></div>
          <div class="grow"></div>
          <div class="choices">
            <button class="btn" data-act="bbPay">1 · Pay it</button>
            <button class="btn ghost" data-act="bbSkip">2 · Skip it</button></div>
          <p class="hint">Keys 1 and 2, or tap. Nothing tells you which ones you truly need.</p>
        </div></div>`;
    },
  };
}

/* ── quiz-shaped games share a shape too ─────────────────────────────── */
function quizGame(cfg) {
  /* G8 · a level is the numbers (cfg.build reads the level's set); the count stays the same */
  const qs = cfg.build(knobs(cfg.id).set, cfg.seed);
  const st = { i: 0, right: 0, pick: null, done: false, log: [] };
  const choose = (n) => {
    if (st.done || st.pick != null) return;
    st.pick = n;
    st.log.push({ q: qs[st.i], pick: n, ok: n === qs[st.i].a });
    if (n === qs[st.i].a) { st.right++; st.combo = (st.combo || 0) + 1; sfx.good(); } else { st.combo = 0; sfx.bad(); }
    st.pop = n === qs[st.i].a ? (st.combo > 1 ? `Combo ×${st.combo}` : '+1') : null;
    R.render();
    /* G2 · coins out of the option chosen, or a small shake of it — after the verdict is drawn */
    verdict(`.gplay [data-act="${cfg.pickAct}"][data-arg="${n}"]`, n === qs[st.i].a);
  };
  const next = () => {
    if (st.pick == null) return;
    st.pick = null; st.i++;
    if (st.i >= qs.length) {
      st.done = true;
      const L = st.log;
      st.won = roundEnd(cfg.id, { right: st.right, n: qs.length,
        weeklyWrong: L.filter((x) => x.q.tag === 'weekly' && !x.ok).length,
        compareRight: L.some((x) => x.q.tag === 'compare' && x.ok),
        simple: L.filter((x) => x.q.trap != null && x.pick === x.q.trap).length,
        longWrong: L.filter((x) => x.q.tag === 'long' && !x.ok).length }, cfg.name);
    }
    R.render();
  };
  return {
    id: cfg.id, st, qs, choose, next,
    key(e) {
      if (st.done) { endKey(e); return; }
      if (e.key === 'Enter') { next(); return; }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= qs[st.i].opts.length) choose(n - 1);
    },
    act(n, arg) { if (n === cfg.pickAct) choose(+arg); else if (n === cfg.nextAct) next(); },
    view() {
      if (st.done) return `<div class="stack">${hud(['Done', tierChip()])}
        ${endCard(st.right >= qs.length - 1 ? '🏅' : 'think', st.right + ' of ' + qs.length, '', st.won, cfg.outro, cfg.who)}</div>`;
      const q = qs[st.i];
      return `<div class="stack">
        ${hud([tierChip(), `${st.i + 1} / ${qs.length}`, `right ${st.right}`, st.combo > 1 ? `<span class="combo">Combo ×${st.combo}</span>` : ''].filter(Boolean))}${st.pop && st.pick != null ? `<span class="numpop" aria-hidden="true">${esc(st.pop)}</span>` : ''}
        <div class="stage">
          <div class="gcard"><span class="em">${ico(cfg.em, cfg.em, 44)}</span>
            <p style="font-size:15.5px;line-height:1.45;font-weight:700">${q.q}</p></div>
          <div class="stack" style="gap:8px">
            ${q.opts.map((o, i) => {
              let k = '';
              if (st.pick != null) k = i === q.a ? ' ok' : (i === st.pick ? ' no' : '');
              return `<button class="opt${k}" data-act="${cfg.pickAct}" data-arg="${i}" ${st.pick != null ? 'disabled' : ''}>
                <span class="k">${i + 1}</span>${o}</button>`;
            }).join('')}
          </div>
          ${st.pick != null ? `<div style="background:${st.pick === q.a ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">${q.why}</div>
            <button class="btn wide" data-act="${cfg.nextAct}">Next →</button>` : ''}
          <p class="hint">Number keys, or tap. Enter for the next one.</p>
        </div></div>`;
    },
  };
}

/* ══ 4 · TIMES TWELVE ═════════════════════════════════════════════════ */
/* G8 · number size per level. The yearly price is always the cheaper one, as in Standard. */
export const TT_SETS = {
  easy:     { monthly: [10, 20, 30, 40, 50, 5, 25], weekly: [5, 10, 20], compare: [20, 200] },
  standard: { monthly: [15, 25, 30, 40, 60, 12, 20], weekly: [8, 15, 25], compare: [45, 480] },
  tricky:   { monthly: [35, 45, 65, 75, 85, 95, 55], weekly: [17, 23, 35], compare: [65, 740] },
};
function timesTwelve(seed) {
  return quizGame({
    id: 'tt', name: 'Times Twelve', em: '🗓️', who: 'pip', seed,
    pickAct: 'ttPick', nextAct: 'ttNext',
    outro: 'Multiply every monthly thing by twelve <b>before</b> you agree to it. Then cancel the ones you would not buy at that price.',
    /* §1.6 · every amount is the shown price times a whole number, in the currency's
       smallest unit, so £1.20 a month is £14.40 a year — never a re-rounded guess */
    build(set = 'standard', sd = 5150) {
      const r = rng(sd);
      const out = [];
      const N = TT_SETS[set] || TT_SETS.standard;
      const P = minorPrice, M = minorMoney;
      const draw = () => Math.floor(r() * 1e6);
      shuffle(N.monthly.slice(), draw()).slice(0, 4).forEach((m) => {
        const p = P(m), right = p * 12;
        const opts = shuffle([right, p * 10, p * 6, right + p], draw());
        out.push({
          q: `A club costs <b>${M(p)} a month</b>. What is that in a year?`,
          opts: opts.map((v) => M(v)), a: opts.indexOf(right),
          why: `${M(p)} × 12 = <b>${M(right)}</b>. Small monthly numbers are the entire technique.`,
        });
      });
      shuffle(N.weekly.slice(), draw()).forEach((w) => {
        const p = P(w), right = p * 52;
        const opts = shuffle([right, p * 12, p * 30, p * 100], draw());
        out.push({
          tag: 'weekly',
          q: `You spend <b>${M(p)} a week</b> on snacks. In a year?`,
          opts: opts.map((v) => M(v)), a: opts.indexOf(right),
          why: `${M(p)} × 52 = <b>${M(right)}</b>. A week is a small unit and a year is not.`,
        });
      });
      const pa = P(N.compare[0]), pb = P(N.compare[1]);
      const cmp = shuffle([0, 1, 2, 3], draw());
      const words = [M(pa) + ' a month', M(pb) + ' a year', 'They are the same', 'Not enough information'];
      out.push({
        tag: 'compare',
        q: `One shop wants <b>${M(pa)} a month</b>. Another wants <b>${M(pb)} once a year</b>. Which costs less?`,
        opts: cmp.map((k) => words[k]), a: cmp.indexOf(1),
        why: `${M(pa)} × 12 = ${M(pa * 12)}, which is more than ${M(pb)}. The yearly one wins — and it is quoted that way precisely because it looks bigger.`,
      });
      return out;
    },
  });
}

/* ══ 5 · THE SNOWBALL ═════════════════════════════════════════════════ */
/* G8 · horizon and rate per level; six rows each, as in Standard */
export const SN_SETS = {
  easy: [
    { p: 100, r: 0.10, y: 5 }, { p: 100, r: 0.10, y: 10 }, { p: 200, r: 0.10, y: 7 },
    { p: 500, r: 0.05, y: 10 }, { p: 100, r: 0.20, y: 5 }, { p: 1000, r: 0.10, y: 10 },
  ],
  standard: [
    { p: 100, r: 0.10, y: 10 }, { p: 100, r: 0.07, y: 20 }, { p: 500, r: 0.05, y: 10 },
    { p: 1000, r: 0.10, y: 20 }, { p: 200, r: 0.08, y: 30 }, { p: 100, r: 0.10, y: 30 },
  ],
  tricky: [
    { p: 150, r: 0.06, y: 25 }, { p: 250, r: 0.09, y: 20 }, { p: 400, r: 0.04, y: 35 },
    { p: 120, r: 0.12, y: 30 }, { p: 800, r: 0.07, y: 40 }, { p: 300, r: 0.11, y: 15 },
  ],
};
function snowball(seed) {
  return quizGame({
    id: 'sn', name: 'The Snowball', em: '❄️', who: 'nana', seed,
    pickAct: 'snPick', nextAct: 'snNext',
    outro: 'Almost nobody guesses high enough, because we all quietly add instead of multiplying. Time is the ingredient, not the amount.',
    build(set = 'standard', sd = 700) {
      const r = rng(sd), draw = () => Math.floor(r() * 1e6);
      const rows = shuffle((SN_SETS[set] || SN_SETS.standard).slice(), draw());
      const longest = Math.max(...rows.map((x) => x.y));
      const M = minorMoney;
      return rows.map((row) => {
        /* grown from the price as SHOWN, so the sum on screen is the sum of what is on screen */
        const p = minorPrice(row.p);
        const right = Math.round(p * Math.pow(1 + row.r, row.y));
        const simple = Math.round(p * (1 + row.r * row.y));   // the answer everyone reaches for
        const opts = shuffle([right, simple, Math.round(p * (1 + row.r * row.y * 0.5)), Math.round(right * 2.1)], draw());
        return {
          tag: row.y === longest ? 'long' : '', trap: opts.indexOf(simple),
          q: `<b>${M(p)}</b> growing <b>${(row.r * 100).toFixed(0)}% a year</b> for <b>${row.y} years</b>. Where does it land?`,
          opts: opts.map((v) => M(v)), a: opts.indexOf(right),
          why: `<b>${M(right)}</b>. Adding ${(row.r * 100).toFixed(0)}% ${row.y} times would only reach ${M(simple)} — the extra is growth landing on earlier growth.`,
        };
      });
    },
  });
}

/* ══ 6 · THE MARKET CUP ═══════════════════════════════════════════════
   Ranked on cup score, not returns. A leaderboard sorted by return alone
   would tell a child the luckiest single bet was the best decision, which
   is the one thing this app must never say. */
/* the season's weeks, seeded: a level scales the swing and the red week, nothing else */
function cupRows(kn, seed = 120) {
  const ROUNDS = 6, RED = 3, r = rng(seed), ret = [];
  for (let k = 0; k < ROUNDS; k++) {
    const row = {};
    ASSETS.forEach((a) => {
      const shock = (r() + r() + r() - 1.5) * 2 * a.vol * 1.0 * kn.shock;
      row[a.id] = a.drift * 3.6 + shock + (k === RED ? -a.vol * 1.5 * kn.crash : 0);
    });
    ret.push(row);
  }
  return ret;
}
/* G8 · the Cup's par on each level is Boring Bella's own cup score there — the basket in
   week one and then home — worked out from the same weeks, so it cannot drift */
function bellaCup(kn, seed = 120) {
  let v = 1000;
  cupRows(kn, seed).forEach((row) => { v = Math.round(v * (1 + row.basket)); });
  return Math.round((v / 1000 - 1) * 100) + 4 * 7 + Math.max(0, 30 - Math.round(100 / 8));
}
TIER_IDS.forEach((t) => { ARCADE_TIERS.mc[t].par = bellaCup(ARCADE_TIERS.mc[t]); });
/* §2.6 · the Cup's record on the child: the best cup score (the line it was set with) and
   the last eight cups, so a finish can say whether the seasons are going up or down.
   A best written before this kept only the first finish's line; its number is read back. */
export function cupRecord(c, total, line) {
  const m = c.market;
  if (!Array.isArray(m.cups)) m.cups = [];
  const legacy = typeof m.best === 'string' && (m.best.match(/cup score (-?\d+)/) || [])[1];
  const prev = typeof m.bestScore === 'number' ? m.bestScore : legacy != null ? +legacy : null;
  m.cups.push(total);
  if (m.cups.length > 8) m.cups.splice(0, m.cups.length - 8);
  const isBest = prev == null || total > prev;
  if (isBest) { m.bestScore = total; m.best = line; } else m.bestScore = prev;
  return { cups: m.cups.slice(), best: m.bestScore, isBest, first: prev == null };
}
export function cupTrendWord(cups) {
  if (!cups || cups.length < 2) return '';
  const last = cups[cups.length - 1], before = cups.slice(Math.max(0, cups.length - 4), -1);
  const avg = before.reduce((t, x) => t + x, 0) / before.length;
  return last > avg + 2 ? 'going up' : last < avg - 2 ? 'going down' : 'holding steady';
}
function cupTrend(rec) {
  if (!rec) return '';
  const w = cupTrendWord(rec.cups);
  return `<p class="small cuptrend"><b>${rec.isBest && !rec.first ? 'A new best cup score' : 'Your best cup score'}: <span class="tabnum">${rec.best}</span></b>${rec.cups.length > 1
    ? ` · your last ${rec.cups.length} cups: <span class="tabnum">${rec.cups.join(' → ')}</span>${w ? `, ${w}` : ''}` : ''}</p>`;
}
function marketCup(seed) {
  const ROUNDS = 6, START = 1000;
  /* §1.2 · a season drawn for this play; Bella's cup score on it is this round's par */
  const ret = cupRows(knobs('mc'), seed), bellaPar = bellaCup(knobs('mc'), seed);
  const st = {
    round: 0, sel: 0, done: false, churn: 0, divSum: 0,
    alloc: { basket: 0, grain: 0, chai: 0, rocket: 0 },
    me: START, log: [START],
    bots: { Chaser: START, Panicker: START, 'Boring Bella': START },
    botHold: { Chaser: 'basket', Panicker: 'chai', 'Boring Bella': 'basket' },
    botStat: { Chaser: { div: 0, churn: 100 }, Panicker: { div: 0, churn: 100 }, 'Boring Bella': { div: 0, churn: 100 } },
  };
  const cash = () => 100 - (st.alloc.basket + st.alloc.grain + st.alloc.chai + st.alloc.rocket);
  const adjust = (id, d) => {
    if (st.done) return;
    const nd = clamp(st.alloc[id] + d, 0, st.alloc[id] + cash());
    if (nd === st.alloc[id]) { sfx.bad(); return; }
    st.churn += Math.abs(nd - st.alloc[id]);
    st.alloc[id] = nd; sfx.click(); R.render();
  };
  /* The basket IS diversification — it is a slice of every shop in town. */
  const effective = () => {
    let n = 0;
    if (st.alloc.basket >= 15) n += 4;
    ['grain', 'chai', 'rocket'].forEach((k) => { if (st.alloc[k] >= 15) n += 1; });
    return Math.min(4, n);
  };
  const scoreOf = (final, divAvg, churn) => {
    const rt = Math.round((final / START - 1) * 100);
    const div = Math.round(divAvg * 7);
    const steady = Math.max(0, 30 - Math.round(churn / 8));
    return { ret: rt, div, steady, total: rt + div + steady };
  };
  const next = () => {
    if (st.done) return;
    st.divSum += effective();
    if (effective() >= 4) st.spread = (st.spread || 0) + 1;
    const row = ret[st.round];
    let g = 0;
    ASSETS.forEach((a) => { g += (st.alloc[a.id] / 100) * row[a.id]; });
    st.me = Math.round(st.me * (1 + g));
    st.log.push(st.me);

    const holdDiv = (h) => (h === 'cash' ? 0 : h === 'basket' ? 4 : 1);
    Object.keys(st.bots).forEach((k) => { st.botStat[k].div += holdDiv(st.botHold[k]); });

    const best = ASSETS.slice().sort((a, b) => row[b.id] - row[a.id])[0].id;
    st.bots.Chaser = Math.round(st.bots.Chaser * (1 + row[st.botHold.Chaser]));
    if (best !== st.botHold.Chaser) st.botStat.Chaser.churn += 100;
    st.botHold.Chaser = best;

    const pan = st.botHold.Panicker;
    st.bots.Panicker = Math.round(st.bots.Panicker * (1 + (pan === 'cash' ? 0 : row[pan])));
    const nextPan = (pan !== 'cash' && row[pan] < 0) ? 'cash' : 'chai';
    if (nextPan !== pan) st.botStat.Panicker.churn += 100;
    st.botHold.Panicker = nextPan;

    st.bots['Boring Bella'] = Math.round(st.bots['Boring Bella'] * (1 + row.basket));

    st.round++;
    if (st.round >= ROUNDS) finish(); else sfx.click();
    R.render();
  };
  const finish = () => {
    st.done = true;
    const c = K();
    st.score = scoreOf(st.me, st.divSum / ROUNDS, st.churn);
    st.table = [{ who: 'You', v: st.me, sc: st.score }]
      .concat(Object.keys(st.bots).map((k) => ({ who: k, v: st.bots[k],
        sc: scoreOf(st.bots[k], st.botStat[k].div / ROUNDS, st.botStat[k].churn) })))
      .sort((a, b) => b.sc.total - a.sc.total);
    /* §2.6 · an equal cup score is a tie, shown as one: copying Bella ties with Bella,
       it never beats her. A place is one more than the number strictly ahead. */
    st.table.forEach((row) => { row.place = 1 + st.table.filter((x) => x.sc.total > row.sc.total).length; });
    st.place = st.table.find((x) => x.who === 'You').place;
    st.tiedWith = st.table.filter((x) => x.who !== 'You' && x.sc.total === st.score.total).map((x) => x.who);
    st.byReturn = st.table.slice().sort((a, b) => b.v - a.v)[0].who;
    const bella = st.table.find((x) => x.who === 'Boring Bella');
    /* measured against Bella's cup score on this very season, so a wild market is not a richer one */
    st.won = roundEnd('mc', { total: st.score.total, par: bellaPar, spreadWeeks: st.spread || 0, weeks: ROUNDS, churn: st.churn,
      beatBella: st.score.total > bella.sc.total }, 'The Market Cup');
    if (st.score.div >= 24) sim.badge(c, 'diversified');
    /* §2.6 · the record moves: the best is the best cup score so far (it used to be the
       first finish, for ever), and the last few cups are kept so the trend can be shown */
    st.record = cupRecord(c, st.score.total, `${st.place}${['st', 'nd', 'rd', 'th'][Math.min(st.place - 1, 3)]}${st.tiedWith.length ? ' (tied)' : ''} of 4 · cup score ${st.score.total}`);
    sfx.level();
  };
  return {
    id: 'mc', st,
    key(e) {
      if (st.done) { endKey(e); return; }
      const ids = ASSETS.map((a) => a.id);
      if (e.key === 'ArrowDown') { st.sel = (st.sel + 1) % ids.length; R.render(); }
      else if (e.key === 'ArrowUp') { st.sel = (st.sel + ids.length - 1) % ids.length; R.render(); }
      else if (e.key === 'ArrowRight') adjust(ids[st.sel], 10);
      else if (e.key === 'ArrowLeft') adjust(ids[st.sel], -10);
      else if (e.key === 'Enter') next();
    },
    act(n, arg) {
      if (n === 'mcAdj') { const [id, d] = arg.split(':'); adjust(id, +d); }
      else if (n === 'mcNext') next();
      else if (n === 'mcSel') { st.sel = ASSETS.findIndex((a) => a.id === arg); R.render(); }
    },
    view() {
      if (st.done) {
        const sc = st.score, tie = st.tiedWith.length > 0, top = st.place === 1;
        const head = top && !tie ? 'You won the Cup'
          : tie ? `${st.place === 1 ? 'Joint first' : 'Joint ' + st.place + ['st', 'nd', 'rd', 'th'][Math.min(st.place - 1, 3)]}: a tie with ${st.tiedWith.join(' and ')}`
            : st.place + ' of 4';
        return `<div class="stack">${hud(['Cup over', tierChip()])}
          <div class="stage">
            <div style="text-align:center"><div class="endico">${top && !tie ? ico('trophy', '🏆', 48) : ico('rosette', '🎗️', 48)}</div>
            <h2>${esc(head)}</h2>
            <p class="muted">Cup score ${sc.total} · ended on ${st.me} from ${START}.</p></div>
            <div class="lead">
              ${st.table.map((row) => `<div class="leadrow ${row.who === 'You' ? 'me' : ''}">
                <span>${row.place}${st.table.filter((x) => x.place === row.place).length > 1 ? '=' : ''}</span>
                <span>${esc(row.who)}<br><span style="font-weight:600;font-size:11.5px;opacity:.75">
                  ${row.sc.ret >= 0 ? '+' : ''}${row.sc.ret} return · ${row.sc.div} spread · ${row.sc.steady} nerve</span></span>
                <span class="p" style="font-size:17px">${row.sc.total}</span></div>`).join('')}
            </div>
            <p class="small muted">${st.byReturn === st.table[0].who
              ? `Ranked on cup score. <b>${esc(st.byReturn)}</b> also finished top on money alone this time — but it is the spread and the nerve that the cup counts.`
              : `Ranked on cup score. On money alone <b>${esc(st.byReturn)}</b> finished top — which is exactly why money alone is not the scoreboard.`}</p>
            <div class="card" style="box-shadow:none">
              <div class="eyebrow">Your cup score — and this is the part that matters</div>
              <div class="grid3" style="margin-top:8px">
                <div><div class="small muted">Return</div><div style="font-weight:800">${sc.ret >= 0 ? '+' : ''}${sc.ret}</div></div>
                <div><div class="small muted">Spread out</div><div style="font-weight:800">${sc.div}</div></div>
                <div><div class="small muted">Kept your nerve</div><div style="font-weight:800">${sc.steady}</div></div>
              </div>
              <div class="sep" style="margin:10px 0"></div>
              <div class="row"><span class="grow" style="font-weight:800">Total</span><span class="big" style="font-size:22px">${sc.total}</span></div>
            </div>
            ${cupTrend(st.record)}
            ${tie && st.tiedWith.includes('Boring Bella')
              ? say('bea', 'You did exactly what Bella did, and you finished exactly where she did. That is a tie, not a win: the cup is about whether your own choices beat hers.')
              : say(st.table[0].who === 'Boring Bella' ? 'bea' : 'bo',
                st.table[0].who === 'Boring Bella'
                  ? 'Bella bought the whole basket in week one and then went home. She does that every season, and she is very hard to beat.'
                  : 'You beat Bella this time. Run another six weeks and see whether that keeps happening — that question <b>is</b> the game.')}
            ${endFoot(st.won, 'Fictional companies, real market behaviour, nothing here is advice.')}
            <button class="btn wide" data-act="gquit">Back to Play</button>
          </div></div>`;
      }
      return `<div class="stack">
        ${hud([tierChip(), `Week ${st.round + 1} / ${ROUNDS}`, `${st.me}`, `cash ${cash()}%`])}
        <div class="stage">
          <p class="small muted">Split 100% across what you fancy. What you leave in cash is safe and grows by nothing.</p>
          <div class="alloc">
            ${ASSETS.map((a, i) => `<div class="alrow ${i === st.sel ? 'sel' : ''}" data-act="mcSel" data-arg="${a.id}" role="button" tabindex="0">
              <div><b class="row" style="font-size:14px;gap:6px">${ico(a.em, a.em, 18)} ${esc(a.name)}</b>
                <div class="small muted">${a.kind === 'fund' ? 'a slice of every shop' : a.kind === 'steady' ? 'slow and dull' : a.kind === 'growth' ? 'growing, bumpy' : 'anybody’s guess'}</div></div>
              <div class="stepper">
                <button data-act="mcAdj" data-arg="${a.id}:-10" aria-label="less ${esc(a.name)}">−</button>
                <span class="n">${st.alloc[a.id]}%</span>
                <button data-act="mcAdj" data-arg="${a.id}:10" aria-label="more ${esc(a.name)}">+</button></div></div>`).join('')}
          </div>
          ${sparkline(st.log, 300, 40, 'var(--action)')}
          <button class="btn wide" data-act="mcNext">Play the week →</button>
          <p class="hint">Arrows to move and change, Enter to play the week. Or just tap.</p>
        </div></div>`;
    },
  };
}

export { GAME_ACTS };

/* ══ COMPOUND CLIMB ═══════════════════════════════════════════════════
   Risk and return as a physical feeling. Hold to charge the year's growth:
   charge more for a higher average AND a wider swing, past a point wide
   enough to go backwards. Fifteen years, and you can be wiped out — which
   is the half of "high return" nobody puts on the poster. */
/* A canvas only draws a face the page has already loaded: ask for the ones the games letter in. */
let fontsWarm = false;
function warmFonts() {
  if (fontsWarm || typeof document === 'undefined' || !document.fonts) return;
  fontsWarm = true;
  try { ['600 18px Sono', '800 18px "Hanken Grotesk"', '800 24px Fraunces'].forEach((f) => document.fonts.load(f)); } catch (e) { /* the fallbacks still read */ }
}
/* Compound Climb's year, as a pure function of the charge (0–1) and one draw in [−1, 1].
   Rule 3: the game rewards the decision, not the gamble. The expected return rises with
   the charge and PEAKS in the middle (≈60%), then falls; the swing grows much faster
   (charge^3.2), so a high charge brings down years and, at full charge, a real chance of
   being wiped out. A steady middle charge has the best expected tower and the best chance
   of clearing the line — test/tiers.mjs replays it over hundreds of seeds. */
export function ccYear(ch, draw) {
  const mean = 0.36 * ch - 0.30 * ch * ch;      // 0 → 10.8% at 60% → 6% at full
  const vol = 0.7 * Math.pow(ch, 3.2);          // 1% at 25%, 10% at 55%, 41% at 85%, 70% at full
  return mean + draw * vol;
}
function compoundClimb(seed = 8821) {
  const kn = knobs('cc');
  const YEARS = 15, START = 100, TARGET = kn.target, W = 360, H = 350;
  const st = { year: 0, money: START, charge: 0, holding: false, done: false,
    hist: [START], last: null, ruined: false, peak: START, falls: 0, maxCharge: 0 };
  let raf = 0, prev = 0, ctx = null, cv = null;
  const r = rng(seed);
  /* everything below is drawing — the money is decided in release() and nowhere else */
  const fxl = makeFx();
  let cd = countdown();
  const look = { disp: START, land: 1, tumble: [], pour: [], pourT: 0, clock: 0, ending: false, endT: 0, fwT: 0, newest: -1 };
  const TX = 196, CW = 66, SL = 6, PLINTH = H - 44, TOPPAD = 58;
  const scaleTop = () => Math.max(TARGET * 1.15, st.peak * 1.1);
  const yOf = (v) => PLINTH - (v / scaleTop()) * (PLINTH - TOPPAD);

  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  const finish = () => {
    if (st.done) return;
    st.done = true; stop();
    /* the same par on every level: the line moves the badge and a goal, never the wage */
    if (st.money >= TARGET) sim.badge(K(), 'climbed');
    st.won = roundEnd('cc', { money: st.money, ruined: st.ruined, reached: st.money >= TARGET && !st.ruined, years: st.year, falls: st.falls, maxCharge: st.maxCharge }, 'Compound Climb');
    sfx.level(); R.render();
  };
  /* the last year lands, the tower is seen, then the card — a beat, never a delay to input */
  const endWith = (ms) => {
    if (still() || !ctx) { finish(); return; }
    look.ending = true; look.endT = ms; look.fwT = 0;
  };
  const release = () => {
    if (st.done || look.ending || !st.holding) return;
    /* §1.5 · the charge is the time held, by the wall's clock, to the moment of letting go —
       not to the last frame drawn, which at 4 fps can be a quarter of a second earlier */
    if (st.pressAt != null) st.charge = chargeAt(nowMs());
    st.holding = false; st.pressAt = null;
    st.maxCharge = Math.max(st.maxCharge, st.charge);
    const ch = st.charge / 100;
    const actual = ccYear(ch, r() + r() - 1);
    const before = st.money;
    st.money = Math.max(0, st.money * (1 + actual));
    st.hist.push(Math.round(st.money));
    st.peak = Math.max(st.peak, st.money);
    st.last = { pct: actual, before, after: st.money };
    st.year++;
    if (actual < 0) st.falls++;
    st.charge = 0;
    look.land = 0; look.newest = st.year;
    const pct = (actual >= 0 ? '+' : '−') + Math.abs(actual * 100).toFixed(1) + '%';
    if (actual < 0) {
      /* the coins that were lost come off the top and tumble away */
      const y0 = yOf(look.disp), y1 = yOf(st.money);
      const m = Math.min(34, Math.round((y1 - y0) / SL));
      if (!still()) for (let i = 0; i < m; i++) {
        const side = Math.random() < 0.5 ? -1 : 1;
        look.tumble.push({ x: TX + (Math.random() - 0.5) * 8, y: y0 + i * SL, vx: side * (0.06 + Math.random() * 0.18), vy: -0.12 - Math.random() * 0.2,
          a: 0, va: side * (0.004 + Math.random() * 0.01) });
      }
      look.disp = st.money;
      fxl.shake(10, 380); fxl.flash('#E0483A', 220);
      fxl.pop(TX, Math.max(76, y1 - 58), pct, { color: '#B23A2E', size: 24, life: 1100, key: 'year' });
    } else {
      fxl.pop(TX, Math.max(76, yOf(st.money) - 58), pct, { color: '#127A43', size: 24, life: 1100, key: 'year' });
      fxl.burst(TX, yOf(st.money), { n: 10 + Math.round(actual * 90), speed: 0.2, colors: ['#FFF3C4', '#F0B429', '#FFFFFF'] });
    }
    if (st.money < 20) { st.ruined = true; sfx.bad(); endWith(1300); R.render(); return; }
    if (actual < 0) sfx.bad(); else sfx.coin();
    if (st.year >= YEARS) { endWith(st.money >= TARGET ? 2000 : 1100); }
    R.render();
  };
  const press = () => {
    if (st.done || look.ending || st.holding) return;
    if (!cd.done) cd = countdown(1);            // a press is a GO: nobody waits on a count they have already beaten
    st.holding = true; st.charge = 0; st.pressAt = nowMs();
  };
  /* charge from the moment of the press: a slow frame neither adds the time before it
     nor loses the time after the last one drawn */
  const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const chargeAt = (t) => Math.min(100, Math.max(0, t - st.pressAt) * 0.075 * kn.charge);
  /* a hidden tab stops the clock (§1.5): a hold in progress is dropped — no year is played
     for the child, and nothing is charged for the time away */
  const away = () => { if (st.holding) { st.holding = false; st.pressAt = null; st.charge = 0; } };

  const step = (ts) => {
    if (st.done) return;
    /* the wall's clock, not the frame rate's (audit v4): a slow frame carries its real time */
    const dt = Math.min(1000, ts - (prev || ts)); prev = ts;
    look.clock += dt;
    cd.step(dt);
    if (st.holding) st.charge = st.pressAt != null ? chargeAt(ts) : Math.min(100, st.charge + dt * 0.075 * kn.charge);
    /* the tower rises to its new height rather than jumping to it */
    look.disp = still() ? st.money : look.disp + (st.money - look.disp) * Math.min(1, dt * 0.007);
    look.land = Math.min(1, look.land + dt / 520);
    animate(dt);
    fxl.step(dt);
    draw();
    const bar = document.getElementById('ccCharge');
    if (bar) bar.style.width = st.charge.toFixed(1) + '%';
    if (look.ending) { look.endT -= dt; if (look.endT <= 0) { finish(); return; } }
    raf = requestAnimationFrame(step);
  };
  const animate = (dt) => {
    const topY = yOf(look.disp);
    /* while held, coins pour onto the tower — faster the harder you push */
    if (st.holding && !still()) {
      look.pourT -= dt;
      if (look.pourT <= 0) {
        look.pourT = Math.max(38, 150 - st.charge * 1.1);
        look.pour.push({ x: TX + (Math.random() - 0.5) * 34, y: -12, vy: 0.12 + Math.random() * 0.08, r: 6 + Math.random() * 3 });
      }
    }
    for (let i = look.pour.length - 1; i >= 0; i--) {
      const p = look.pour[i]; p.vy += 0.0011 * dt; p.y += p.vy * dt;
      if (p.y >= topY - 4) { look.pour.splice(i, 1); fxl.burst(p.x, topY - 2, { n: 3, size: 2.4, speed: 0.12, life: 380, colors: ['#FFFFFF', '#FFF3C4'] }); }
    }
    for (let i = look.tumble.length - 1; i >= 0; i--) {
      const t = look.tumble[i]; t.vy += 0.0012 * dt; t.x += t.vx * dt; t.y += t.vy * dt; t.a += t.va * dt;
      if (t.y > H + 30) look.tumble.splice(i, 1);
    }
    /* the line was met: the sky fills with coins */
    if (look.ending && !st.ruined && st.money >= TARGET) {
      look.fwT -= dt;
      if (look.fwT <= 0) {
        look.fwT = 230;
        const x = 60 + Math.random() * (W - 120), y = 50 + Math.random() * 120;
        const pal = [['#F0B429', '#FFF3C4', '#FFFFFF'], ['#2FBF71', '#C9F7DC', '#FFF3C4'], ['#F07A5A', '#FFD3C4', '#F0B429']][Math.floor(Math.random() * 3)];
        fxl.burst(x, y, { n: 36, speed: 0.36, life: 1000, size: 4.4, colors: pal, gravity: 0.0004 });
        fxl.coins(x, y, 6);
      }
    }
  };

  /* one coin edge-on: a slice of a cylinder, shaded across its width */
  const goldGrad = (deep) => {
    const g = ctx.createLinearGradient(-CW / 2, 0, CW / 2, 0);
    if (deep) { g.addColorStop(0, '#7A4400'); g.addColorStop(0.28, '#F0B03A'); g.addColorStop(0.55, '#C98010'); g.addColorStop(1, '#663800'); }
    else { g.addColorStop(0, '#9A6A08'); g.addColorStop(0.28, '#FFE08A'); g.addColorStop(0.55, '#F0B429'); g.addColorStop(1, '#8A5A00'); }
    return g;
  };
  const band = (L) => { let j = -1; for (let i = 0; i < st.hist.length; i++) if (st.hist[i] < L) j = i; return j + 1; };
  const lerpC = (a, b, k) => {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
  };
  const heat = (c) => (c < 50 ? lerpC('#2FBF71', '#F0B429', c / 50) : lerpC('#F0B429', '#E0483A', (c - 50) / 50));
  const label = (text, x, y, { size = 13, color = '#1C2A2E', align = 'center', weight = 800, font = '"Hanken Grotesk", system-ui, sans-serif', halo = R.dark ? 'rgba(12,16,28,.92)' : 'rgba(255,252,245,.95)' } = {}) => {
    ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 3.5);
    ctx.strokeStyle = halo; ctx.strokeText(text, x, y);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
  };

  const draw = () => {
    if (!ctx) return;
    const dark = !!R.dark, ink = dark ? '#F4EEE4' : '#1C2A2E', t = look.clock;
    ctx.clearRect(0, 0, W, H);
    const done = fxl.begin(ctx);
    backdrop(ctx, W, H, plate(K().world), { veil: dark ? 0.3 : 0.22, shift: still() ? 0 : Math.sin(t / 4200) * 6 });
    /* a pool of light behind the tower, and the floor it stands on */
    const glow = ctx.createRadialGradient(TX, PLINTH - 60, 10, TX, PLINTH - 60, 200);
    glow.addColorStop(0, dark ? 'rgba(255,214,120,.22)' : 'rgba(255,246,214,.55)'); glow.addColorStop(1, 'rgba(255,246,214,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    const floor = ctx.createLinearGradient(0, PLINTH + 8, 0, H);
    floor.addColorStop(0, 'rgba(60,36,12,0)'); floor.addColorStop(1, dark ? 'rgba(8,10,20,.6)' : 'rgba(60,36,12,.32)');
    ctx.fillStyle = floor; ctx.fillRect(0, PLINTH, W, H - PLINTH);

    /* the target: a glowing line and a flag on a pole */
    const yT = yOf(TARGET), met = st.money >= TARGET;
    ctx.save();
    ctx.shadowColor = met ? 'rgba(255,214,90,.95)' : 'rgba(47,191,113,.9)'; ctx.shadowBlur = 10 + (still() ? 0 : Math.sin(t / 260) * 4);
    ctx.strokeStyle = met ? '#F0B429' : '#2FBF71'; ctx.lineWidth = 3; ctx.setLineDash([12, 8]); ctx.lineDashOffset = still() ? 0 : -t * 0.02;
    ctx.beginPath(); ctx.moveTo(48, yT); ctx.lineTo(W - 30, yT); ctx.stroke();
    ctx.restore();
    const fx0 = W - 30;
    ctx.strokeStyle = dark ? '#E8DCC8' : '#5A4630'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(fx0, yT + 6); ctx.lineTo(fx0, yT - 40); ctx.stroke(); ctx.lineCap = 'butt';
    const wv = still() ? 0 : Math.sin(t / 180) * 3;
    ctx.fillStyle = met ? '#F0B429' : '#2FBF71'; ctx.strokeStyle = 'rgba(20,30,20,.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(fx0, yT - 40);
    ctx.quadraticCurveTo(fx0 - 12, yT - 40 + wv, fx0 - 24, yT - 34 - wv);
    ctx.quadraticCurveTo(fx0 - 12, yT - 30 + wv, fx0, yT - 26); ctx.closePath(); ctx.fill(); ctx.stroke();

    /* the years, a timeline up the side: green for a year that grew, coral for one that shrank */
    const TLX = 24, tlTop = 62, tlBot = PLINTH + 4, gap = (tlBot - tlTop) / (YEARS - 1);
    ctx.strokeStyle = dark ? 'rgba(244,238,228,.35)' : 'rgba(40,30,20,.25)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(TLX, tlBot); ctx.lineTo(TLX, tlTop); ctx.stroke();
    const doneTo = tlBot - Math.max(0, st.year - 1) * gap;
    if (st.year > 0) { ctx.strokeStyle = '#F0B429'; ctx.beginPath(); ctx.moveTo(TLX, tlBot); ctx.lineTo(TLX, doneTo); ctx.stroke(); }
    ctx.lineCap = 'butt';
    for (let i = 0; i < YEARS; i++) {
      const py = tlBot - i * gap;
      if (i < st.year) {
        const up = st.hist[i + 1] >= st.hist[i];
        ctx.fillStyle = up ? '#2FBF71' : '#E8846F'; ctx.beginPath(); ctx.arc(TLX, py, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5; ctx.stroke();
      } else if (i === st.year && !look.ending) {
        const pr = still() ? 0 : (t / 900) % 1;
        ctx.strokeStyle = `rgba(240,180,41,${1 - pr})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(TLX, py, 6 + pr * 7, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#F0B429'; ctx.beginPath(); ctx.arc(TLX, py, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      } else {
        ctx.fillStyle = dark ? 'rgba(20,24,36,.8)' : 'rgba(255,252,245,.9)'; ctx.beginPath(); ctx.arc(TLX, py, 3.6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = dark ? 'rgba(244,238,228,.5)' : 'rgba(40,30,20,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
      }
      if (i === 0 || i === 4 || i === 9 || i === 14) label(String(i + 1), TLX + 16, py, { size: 10.5, color: ink, weight: 700 });
    }
    label('YEAR', TLX, tlTop - 16, { size: 9.5, color: ink, weight: 800 });

    /* the plinth: a crate, with its shadow on the floor */
    shadow(ctx, TX, PLINTH + 36, 150, dark ? 0.4 : 0.26);
    crate(ctx, TX - 52, PLINTH, 104, 34, dark ? '#A8743E' : '#C98A46');

    /* how far this year could swing: grows with the charge, and grows faster on the bottom */
    if (st.holding && st.charge > 2) {
      const c = st.charge / 100, mean = c * 0.22, vol = c * c * 0.34;
      const hiY = Math.max(TOPPAD - 30, yOf(st.money * (1 + mean + vol))), loY = Math.min(PLINTH - 2, yOf(Math.max(0, st.money * (1 + mean - vol))));
      const rx = TX + CW / 2 + 26;
      const g = ctx.createLinearGradient(0, hiY, 0, loY); g.addColorStop(0, 'rgba(47,191,113,.85)'); g.addColorStop(1, 'rgba(224,72,58,.85)');
      ctx.fillStyle = g; rr(ctx, rx - 4, hiY, 8, Math.max(8, loY - hiY), 4); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.5; ctx.stroke();
      label('could land', rx + 10, hiY + 6, { size: 9.5, color: ink, align: 'left', weight: 700 });
      label('anywhere here', rx + 10, hiY + 18, { size: 9.5, color: ink, align: 'left', weight: 700 });
    }

    /* the tower: one slice per coin, each year's coins their own shade, so compounding is a shape */
    const v = look.disp, topY = yOf(v);
    const n = Math.max(1, Math.round((PLINTH - topY) / SL));
    const k = look.land, s = still() ? 0 : Math.sin(k * Math.PI * 2.5) * (1 - k) * 0.12;
    ctx.save(); ctx.translate(TX, PLINTH); ctx.scale(1 + s * 0.9, 1 - s);
    const gA = goldGrad(false), gB = goldGrad(true);
    for (let i = 0; i < n; i++) {
      const y = -i * SL, L = ((i + 0.5) / n) * v, b = band(L), jx = Math.sin(i * 12.9898) * 1.6;
      ctx.fillStyle = b % 2 ? gB : gA;
      rr(ctx, -CW / 2 + jx, y - SL, CW, SL, 2.4); ctx.fill();
      ctx.fillStyle = 'rgba(90,56,0,.55)'; ctx.fillRect(-CW / 2 + jx + 2, y - 1, CW - 4, 1);
      if (i > 0 && b !== band(((i - 0.5) / n) * v)) { ctx.fillStyle = 'rgba(255,244,200,.85)'; ctx.fillRect(-CW / 2 + jx + 1, y - 1.5, CW - 2, 1.5); }
      if (b === look.newest && k < 1) { ctx.fillStyle = `rgba(255,250,220,${0.6 * (1 - k)})`; rr(ctx, -CW / 2 + jx, y - SL, CW, SL, 2.4); ctx.fill(); }
    }
    /* the top coin, face up, with its shine */
    const ty = -n * SL, jt = Math.sin((n - 1) * 12.9898) * 1.6;
    ctx.fillStyle = '#B57E10'; ctx.beginPath(); ctx.ellipse(jt, ty + 1.5, CW / 2, 9, 0, 0, Math.PI * 2); ctx.fill();
    const face = ctx.createRadialGradient(jt - 10, ty - 4, 2, jt, ty, CW / 2);
    face.addColorStop(0, '#FFF3C4'); face.addColorStop(0.5, '#F7C948'); face.addColorStop(1, '#D99A1B');
    ctx.fillStyle = face; ctx.beginPath(); ctx.ellipse(jt, ty, CW / 2, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8A5A00'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.strokeStyle = 'rgba(138,90,0,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(jt, ty, CW / 2 - 7, 5.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    const realTop = PLINTH - n * SL * (1 - s);

    /* while held: rings hum outward from the top, gold → red as the swing grows */
    if (st.holding) {
      const col = heat(st.charge);
      for (let j = 0; j < 3; j++) {
        const ph = still() ? j / 3 : ((t * 0.0016 * (1 + st.charge / 60)) + j / 3) % 1;
        ctx.globalAlpha = (1 - ph) * 0.8; ctx.strokeStyle = col; ctx.lineWidth = 3 - ph * 2;
        ctx.beginPath(); ctx.ellipse(TX, realTop, CW / 2 + 6 + ph * (30 + st.charge * 0.45), 10 + ph * (10 + st.charge * 0.15), 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const hum = 1 + (still() ? 0 : Math.sin(t / 60) * 0.03 * (st.charge / 100));
      ctx.save(); ctx.translate(TX, realTop - 26); ctx.scale(hum, hum);
      label(Math.round(st.charge) + '%', 0, 0, { size: 13, color: col });
      ctx.restore();
    }
    look.pour.forEach((p) => coin(ctx, p.x, p.y, p.r));
    look.tumble.forEach((tb) => {
      ctx.save(); ctx.translate(tb.x, tb.y); ctx.rotate(tb.a);
      ctx.fillStyle = '#E3A21E'; rr(ctx, -CW / 2, -SL / 2, CW, SL, 2.4); ctx.fill();
      ctx.strokeStyle = '#8A5A00'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    });

    label(met ? 'over the line!' : 'target ' + TARGET, W - 38, yT - 14, { size: 12.5, color: met ? '#9A6A00' : (dark ? '#7BE0A6' : '#127A43'), align: 'right' });
    /* the number, riding the top of the tower */
    label(String(Math.round(look.disp)), TX - CW / 2 - 12, Math.max(22, realTop + 6), { size: 24, color: ink, align: 'right', font: 'Fraunces, Georgia, serif' });
    label('started at ' + START, TX, PLINTH + 17, { size: 10.5, color: '#3A2208', weight: 700, halo: 'rgba(255,240,210,.9)' });

    fxl.draw(ctx, W, H);
    done();
    if (!look.ending) cd.draw(ctx, W, H);
  };

  return {
    id: 'cc', st, release, kn,
    mount() {
      warmFonts();
      cv = document.getElementById('ccCanvas');
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx = cv.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!st.done && !raf) { prev = 0; raf = requestAnimationFrame(step); }
      const hold = (e) => { e.preventDefault(); press(); };
      const let_go = (e) => { if (e) e.preventDefault(); release(); };
      const btn = document.getElementById('ccBtn');
      if (btn) {
        btn.onpointerdown = hold;
        btn.onpointerup = let_go;
        btn.onpointerleave = () => { if (st.holding) release(); };
        btn.onpointercancel = () => { if (st.holding) release(); };
      }
      /* the tower itself is a button too: press and hold anywhere on the picture */
      cv.onpointerdown = hold; cv.onpointerup = let_go;
      cv.onpointerleave = () => { if (st.holding) release(); };
      cv.onpointercancel = () => { if (st.holding) release(); };
    },
    stop() { away(); stop(); },
    key(e) {
      if (st.done) { endKey(e); return; }
      if ((e.key === ' ' || e.key === 'Spacebar') && e.type === 'keydown') { if (e.preventDefault) e.preventDefault(); press(); }
    },
    keyup(e) { if (e.key === ' ' || e.key === 'Spacebar') release(); },
    act(n) { if (n === 'ccHold') press(); else if (n === 'ccRelease') release(); },
    view() {
      if (st.done) {
        const reached = st.money >= TARGET;
        return `<div class="stack">${hud(['Fifteen years', tierChip()])}
          ${endCard(st.ruined ? 'oops' : reached ? '🗼' : '📈',
            st.ruined ? 'Wiped out in year ' + st.year : Math.round(st.money) + ' from ' + START,
            st.ruined ? 'Nothing left to compound. That is the half of "high return" nobody puts on the poster.'
              : reached ? 'Over the line.'
                : 'Short of the line, and still ' + (st.money / START).toFixed(1) + '× what you started with.',
            st.won,
            st.ruined ? 'Growth needs something left to grow. A swing big enough to double you is big enough to end you.'
              : 'The middle charge usually wins. Not the safe one, not the wild one — the one you can survive fifteen times in a row.',
            'nana')}</div>`;
      }
      const l = st.last;
      return `<div class="stack">
        ${hud([tierChip(), `Year ${Math.min(YEARS, st.year + 1)} / ${YEARS}`, `${Math.round(st.money)}`, `target ${TARGET}`])}
        <div class="stage arcstage" style="min-height:0;padding:12px">
          <canvas id="ccCanvas" class="arccv" role="img" aria-label="Your coin tower, the target line and the years so far" style="width:100%;max-width:420px;margin:0 auto;height:auto;aspect-ratio:${W}/${H};display:block;touch-action:none"></canvas>
          ${l ? `<div class="ccyear ${l.pct >= 0 ? 'up' : 'down'}">
            Year ${st.year}: <b>${l.pct >= 0 ? '+' : ''}${(l.pct * 100).toFixed(1)}%</b> · ${Math.round(l.before)} → ${Math.round(l.after)}</div>` : ''}
          <div>
            <div class="row"><span class="eyebrow grow">This year's growth</span>
              <span class="small muted">longer = more, and wilder</span></div>
            <div class="bar ccbar" style="height:16px;margin-top:5px">
              <i id="ccCharge" style="width:${st.charge}%;background:linear-gradient(90deg,var(--grow),var(--treasure) 55%,var(--spend))"></i></div>
          </div>
          <button class="btn wide ccbtn" id="ccBtn" style="padding:18px" data-act="noop">HOLD TO GROW</button>
          <p class="hint">Hold space, the button or the tower; let go to lock the year in. Steady beats spectacular — usually.</p>
        </div></div>`;
    },
  };
}

/* DOM juice for the two card-table games: a word that floats up off whatever it is
   about, and a jolt of the stage. Pops live in a fixed layer outside the game, so a
   re-render cannot cut one short; under reduced motion CSS leaves them standing still. */
function domPop(anchor, text, kind = 'good') {
  if (typeof document === 'undefined') return;
  const a = typeof anchor === 'string' ? document.querySelector(anchor) : anchor;
  const b = a && a.getBoundingClientRect ? a.getBoundingClientRect() : null;
  const s = document.createElement('span');
  s.className = 'arcpop ' + kind; s.textContent = text; s.setAttribute('aria-hidden', 'true');
  s.style.top = (b ? b.top + Math.min(24, b.height / 2) : innerHeight / 2) + 'px';
  document.body.appendChild(s);
  const half = s.offsetWidth / 2 + 8;   // keep the whole word on screen
  s.style.left = clamp(b ? b.left + b.width / 2 : innerWidth / 2, half, Math.max(half, innerWidth - half)) + 'px';
  setTimeout(() => s.remove(), 1100);
}
let joltT = 0;
function jolt(kind = 'bad') {
  if (typeof document === 'undefined') return;
  const h = document.documentElement;
  delete h.dataset.arc; void h.offsetWidth; h.dataset.arc = kind;
  clearTimeout(joltT); joltT = setTimeout(() => { delete h.dataset.arc; }, 460);
}

/* ══ STALL RUSH ═══════════════════════════════════════════════════════
   Sixty seconds of customers, so that "busy" and "profitable" can come
   apart in front of the child rather than in a sentence. */
function stallRush(seed = 3312) {
  const LEN = 60000, MAXQ = 4, kn = knobs('sr');
  /* revenue and spent are in the currency's smallest unit, for the screen (§1.6);
     revU/spentU are the same day in PRICE UNITS, for the wage — so the wage is
     converted to money exactly once, in payout(), and never twice (§1.1) */
  const st = { t: 0, cash: 0, revenue: 0, spent: 0, revU: 0, spentU: 0, served: 0, lost: 0,
    stock: { chai: 3, ice: 3, umbrella: 2, rope: 2 }, q: [], done: false,
    spawn: 900, restock: 0, msg: '', wrong: 0 };
  let raf = 0, prev = 0, nid = 0;
  const r = rng(seed);
  const items = STOCK.map((x) => x.id);
  const shown = new Set();   // customers already dealt in, so only a newcomer slides in
  const btnFor = (id) => (typeof document !== 'undefined' ? document.querySelector(`.gplay [data-act="srServe"][data-arg="${id}"]`) : null);

  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  const finish = () => {
    if (st.done) return;
    st.done = true; stop();
    st.profit = st.revenue - st.spent;
    st.profitU = st.revU - st.spentU;
    if (st.profit > 0) sim.badge(K(), 'profit-day');
    /* the day's profit against this level's par, in price units: a rush is busier, never richer */
    st.won = roundEnd('sr', { profitU: st.profitU, profit: st.profit, lost: st.lost, wrong: st.wrong, served: st.served }, 'Stall Rush');
    sfx.level(); R.render();
  };
  const serve = (id) => {
    if (st.done) return;
    const i = st.q.findIndex((c) => c.want === id);
    if (i < 0) { st.wrong++; sfx.bad(); st.msg = 'Nobody is waiting for that'; R.render(); jolt('bad'); domPop(btnFor(id), 'nobody wants it', 'bad'); return; }
    if (!st.stock[id]) { sfx.bad(); st.msg = 'Out of ' + id + ' — restock costs time'; R.render(); jolt('bad'); domPop(btnFor(id), 'sold out', 'bad'); return; }
    const item = STOCK.find((x) => x.id === id);
    st.stock[id]--; st.q.splice(i, 1);
    st.revenue += minorPrice(item.sells); st.revU += item.sells; st.served++;
    st.msg = ''; sfx.coin(); R.render();
    const b = btnFor(id);
    if (b) b.classList.add('srhit');
    domPop(b, '+' + minorMoney(minorPrice(item.sells)), 'good');
    jolt('good');
  };
  const restock = () => {
    if (st.done || st.restock > 0) return;
    let cost = 0, costU = 0;
    STOCK.forEach((x) => { const add = 3 - (st.stock[x.id] || 0); if (add > 0) { st.stock[x.id] += add; cost += minorPrice(x.cost) * add; costU += x.cost * add; } });
    if (!cost) { st.msg = 'Everything is already stocked'; R.render(); return; }
    st.spent += cost; st.spentU += costU; st.restock = 2600;
    st.msg = 'Restocked for ' + minorMoney(cost) + ' — and the queue did not wait';
    sfx.click(); R.render();
    domPop('.gplay [data-act="srStock"]', '−' + minorMoney(cost), 'cost');
  };
  /* one slice of the day — the frame loop and a headless player share it */
  const advance = (dt) => {
    if (st.done) return false;
    st.t += dt;
    st.restock = Math.max(0, st.restock - dt);
    st.spawn -= dt;
    let dirty = false;
    if (st.spawn <= 0 && st.q.length < MAXQ) {
      st.spawn = (900 + r() * 700) * kn.spawn;
      st.q.push({ id: ++nid, want: items[Math.floor(r() * items.length)], patience: 1 });
      dirty = true;
    }
    for (let i = st.q.length - 1; i >= 0; i--) {
      st.q[i].patience -= dt / kn.patience;
      if (st.q[i].patience <= 0) { st.q.splice(i, 1); st.lost++; dirty = true; sfx.bad(); domPop('.gplay .srq', 'gave up waiting', 'bad'); }
    }
    if (st.t >= LEN) { finish(); return false; }
    return dirty;
  };
  const step = (ts) => {
    if (st.done) return;
    /* the wall's clock, not the frame rate's (audit v4): a slow frame carries its real time */
    const dt = Math.min(1000, ts - (prev || ts)); prev = ts;
    const dirty = advance(dt);
    if (st.done) return;
    const tl = document.getElementById('srTime');
    if (tl) tl.textContent = Math.ceil((LEN - st.t) / 1000);
    st.q.forEach((c) => {
      const b = document.getElementById('srP' + c.id); if (!b) return;
      b.style.width = Math.max(0, c.patience * 100) + '%';
      const card = b.closest('.srcust'); if (card) card.classList.toggle('hurry', c.patience < 0.34);
    });
    if (tl && tl.parentElement) tl.parentElement.classList.toggle('arctick', LEN - st.t <= 10000);
    if (dirty) R.render();
    raf = requestAnimationFrame(step);
  };
  return {
    id: 'sr', st, advance, serve, restock,
    mount() { if (!st.done && !raf) { prev = 0; raf = requestAnimationFrame(step); } },
    stop,
    key(e) {
      if (st.done) { endKey(e); return; }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= items.length) serve(items[n - 1]);
      else if (e.key === 'r' || e.key === 'R') restock();
    },
    act(n, arg) { if (n === 'srServe') serve(arg); else if (n === 'srStock') restock(); },
    view() {
      if (st.done) {
        return `<div class="stack">${hud(['Closed', tierChip()])}
          <div class="stage" style="justify-content:center;text-align:center">
            <div class="endico">${st.profit > 0 ? ico('chartUp', '📈', 48) : ico('chartDown', '📉', 48)}</div>
            <h2>${st.profit >= 0 ? '+' : '−'}${minorMoney(Math.abs(st.profit))} profit</h2>
            <div class="card" style="box-shadow:none">
              <div class="grid3">
                <div><div class="small muted">Took</div><div style="font-weight:800;color:var(--grow)">${minorMoney(st.revenue)}</div></div>
                <div><div class="small muted">Spent on stock</div><div style="font-weight:800">${minorMoney(st.spent)}</div></div>
                <div><div class="small muted">Served</div><div style="font-weight:800">${st.served}</div></div>
              </div>
            </div>
            <p class="small muted">${st.lost} customer${st.lost === 1 ? '' : 's'} gave up waiting.</p>
            ${say('nana', st.revenue > 0 && st.profit <= 0
              ? 'You were rushed off your feet and you are down on the day. Busy and profitable are two different words, and only one of them pays the rent.'
              : 'Revenue is the number people brag about. That one at the top is the one that decides whether you are open next year.')}
            ${endFoot(st.won)}
            <button class="btn wide" data-act="gquit">Back to Play</button>
          </div></div>`;
      }
      return `<div class="stack">
        ${hud([tierChip(), `<span id="srTime">${Math.ceil((LEN - st.t) / 1000)}</span>s`,
          `took ${minorMoney(st.revenue)}`, `stock ${minorMoney(st.spent)}`, `lost ${st.lost}`])}
        <div class="stage">
          ${BLD.stall ? `<img class="srstall" src="${BLD.stall.src}" alt="Your stall" width="${BLD.stall.w}" height="${BLD.stall.h}">` : ''}
          <div class="eyebrow">The queue</div>
          <div class="stack srq" style="gap:7px;min-height:132px">
            ${st.q.length ? st.q.map((c) => {
              const item = STOCK.find((x) => x.id === c.want);
              const fresh = !shown.has(c.id); shown.add(c.id);
              return `<div class="row srcust${fresh ? ' in' : ''}${c.patience < 0.34 ? ' hurry' : ''}" style="gap:10px;background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
                ${ico(item.em, item.em, 22)}
                <span class="grow"><b style="font-size:14px">${esc(item.name)}</b>
                  <div class="bar" style="height:5px;margin-top:5px"><i id="srP${c.id}" style="width:${c.patience * 100}%;background:var(--treasure);transition:none"></i></div></span>
                <span class="pill">${minorMoney(minorPrice(item.sells))}</span></div>`;
            }).join('') : '<p class="small muted">Nobody yet. They come in waves.</p>'}
          </div>
          ${st.msg ? `<p class="small srmsg" style="color:var(--spend);font-weight:650;text-align:center">${esc(st.msg)}</p>` : ''}
          <div class="choices srstock" style="grid-template-columns:repeat(4,1fr)">
            ${STOCK.map((x, i) => `<button class="btn ${st.stock[x.id] ? '' : 'ghost'}" data-act="srServe" data-arg="${x.id}"
              style="position:relative;flex-direction:column;gap:1px;padding:10px 4px 8px;font-size:11px;line-height:1.15;border-radius:16px;min-width:0">
              <span class="srkey" aria-hidden="true">${i + 1}</span>
              ${ico(x.em, x.em, 18)}
              <span style="font-weight:800;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.name)}</span>
              <span style="opacity:.8;font-family:var(--mono);font-size:10.5px">${st.stock[x.id] || 0} left</span></button>`).join('')}
          </div>
          <button class="btn ghost wide${st.restock > 0 ? ' srbusy' : ''}" data-act="srStock" ${st.restock > 0 ? 'disabled' : ''}>
            ${st.restock > 0 ? 'Restocking…' : 'R · Restock everything'}</button>
          <p class="hint">Number keys to serve, R to restock. Restocking costs money and takes time you do not have.</p>
        </div></div>`;
    },
  };
}

/* ══ CHANGE RUSH ══════════════════════════════════════════════════════
   A real game loop, not a quiz with a hat on. Coins fall, you catch the
   ones that make the amount exactly — and catching one too many is the
   whole point: overpaying is a mistake you can feel. */
function changeRush(seed = playSeed()) {
  const cur = CURRENCIES[currency()], kn = knobs('cr');
  /* G8 · Easy drops the biggest coin size (never below two kinds, so change still means choosing) */
  const COINS = cur.coins.slice(0, Math.max(Math.min(2, cur.coins.length), kn.coins));
  const LANES = 4, W = 360, H = 300, LEN = 60000;
  const st = { target: 0, got: 0, lives: 3, round: 1, score: 0, lane: 1, exact: 0,
    drops: [], t: 0, spawn: 0, done: false, flash: 0, msg: '', pops: [], overpays: 0, firstRun: 0 };
  let raf = 0, last = 0, ctx = null, cv = null;
  /* seeded, so a round can be replayed and tested; the score is the arithmetic,
     never the luck of the draw (a coin that can finish the job is always coming) */
  const r = rng(seed);
  /* drawing only: none of this is read by the rules, so a replay stays a replay */
  const fxl = makeFx();
  let cd = countdown();
  const LX = (lane) => lane * (W / LANES) + W / LANES / 2;
  const look = { px: LX(1), sq: 0, meter: 0, hold: null, clock: 0 };

  const newTarget = () => {
    const n = kn.min + Math.floor(r() * (kn.max - kn.min + 1));
    let t = 0;
    for (let i = 0; i < n; i++) t += COINS[Math.floor(r() * COINS.length)];
    st.target = t; st.got = 0; st.drops = []; st.spawn = 0;
  };
  newTarget();

  const stop = () => { if (raf && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf); raf = 0; };
  /* the purse moves on the canvas; the lane buttons say where it is, for a keyboard
     or a screen reader (no full re-render mid-flight) */
  const lanes = () => { if (typeof document === 'undefined') return; document.querySelectorAll('.crlane').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.arg === st.lane))); };
  const end = () => {
    if (st.done) return;
    st.done = true;
    stop();
    if (st.round > 4) sim.badge(K(), 'exact-change');
    /* measured against this level's par: faster coins are a challenge, not a bigger wage */
    st.won = roundEnd('cr', { score: st.score, exact: st.exact, overpays: st.overpays, firstRun: st.firstRun, finished: st.t >= LEN }, 'Change Rush');
    R.render();
  };
  const el = (id) => (typeof document !== 'undefined' ? document.getElementById(id) : null);
  /* §1.6 · every coin and every amount through the one sub-unit formatter: a quarter is 25¢ */
  const M = minorMoney;
  const hudSync = () => {
    const n = el('crNeed'); if (n) n.textContent = M(st.target);
    const g = el('crGot'); if (g) g.textContent = M(st.got);
    const l = el('crLives'); if (l) l.textContent = String(Math.max(0, st.lives));
    const m = el('crMsg'); if (m) m.textContent = st.msg ? st.msg + ' · ' : '';
  };
  const catchCoin = (v, x, y) => {
    if (st.done) return;
    const need = st.target - st.got;
    st.got += v;
    st.pops.push({ x, y, v, t: 0 });
    look.sq = 1;
    if (st.got === st.target) {
      look.hold = { t: 900, kind: 'ok', text: 'Exact! ' + M(st.target) };
      fxl.pop(x, H - 64, '+' + M(v), { color: '#127A43', size: 18 });
      fxl.pop(W / 2, H / 2 - 18, 'Exact!', { color: '#127A43', size: 42, life: 1150 });
      fxl.coins(x, H - 44, 16); fxl.burst(x, H - 44, { n: 26, speed: 0.28, colors: ['#F0B429', '#FFF3C4', '#2FBF71', '#FFFFFF'] });
      fxl.flash('#FFF3C4', 200);
      st.score += 4 + st.round; st.round++; st.exact++; st.flash = 1; st.msg = 'Exact!'; st.over = null;
      if (!st.overpays) st.firstRun = st.exact;
      sfx.coin(); newTarget();
    } else if (st.got > st.target) {
      /* §2.8 · say it plainly, and say what would have done it: the coin (or coins)
         that make exactly what was still needed when the extra one landed */
      const by = st.got - st.target, fix = exactCoins(need);
      st.over = { by, need, fix, text: `Over by ${M(by)}`, hint: fixLine(need, fix) };
      look.hold = { t: 1700, kind: 'over', text: st.over.text, sub: st.over.hint };
      fxl.pop(x, H - 64, '+' + M(v), { color: '#B23A2E', size: 18 });
      fxl.pop(W / 2, H / 2 - 18, 'Overpaid!', { color: '#B23A2E', size: 34, life: 1100 });
      fxl.shake(11, 400); fxl.flash('#E0483A', 240);
      /* the purse bursts: what you handed over spills on the ground */
      fxl.coins(x, H - 40, 10); fxl.burst(x, H - 36, { n: 18, speed: 0.26, gravity: 0.0012, colors: ['#E0483A', '#F0B429', '#C87533'] });
      st.lives--; st.overpays++; st.flash = -1; st.msg = `${st.over.text}. ${st.over.hint}`;
      sfx.bad(); newTarget();
      if (st.lives <= 0) end();
    } else {
      fxl.pop(x, H - 64, '+' + M(v), { color: '#1C2A2E', size: 18 });
      fxl.burst(x, H - 44, { n: 8, speed: 0.16, size: 3, colors: ['#FFF3C4', '#F0B429'] });
      sfx.click();
    }
    hudSync();
  };
  /* the fewest coins of this round's kinds that make `n` exactly (n is always > 0 here,
     and every target is built from these coins, so a way always exists) */
  function exactCoins(n) {
    const best = [[]];
    for (let a = 1; a <= n; a++) {
      let pick = null;
      for (const c of COINS) if (c <= a && best[a - c] && (!pick || best[a - c].length + 1 < pick.length)) pick = best[a - c].concat(c);
      best[a] = pick;
    }
    return (best[n] || []).sort((p, q) => q - p);
  }
  function fixLine(n, coins) {
    if (!coins.length) return `You needed ${M(n)} more.`;
    if (coins.length === 1) return `You needed ${M(n)} more: one ${M(coins[0])} coin would have made it exact.`;
    /* grouped, so four pennies read as "4 × 1p", not a row of them */
    const groups = [...new Set(coins)].map((c) => { const k = coins.filter((x) => x === c).length; return k > 1 ? `${k} × ${M(c)}` : M(c); });
    return `You needed ${M(n)} more: ${groups.join(' + ')} would have made it exact.`;
  }

  /* One frame of the game. The catch test runs over a SNAPSHOT of the falling
     coins: a catch can finish the round, and finishing the round empties the
     field. Splicing the old array while a fresh one was being read is what
     froze the game for good after a catch with other coins on screen. */
  const advance = (dt) => {
    if (st.done) return;
    st.t += dt;
    st.spawn -= dt;
    if (st.spawn <= 0) {
      st.spawn = (620 - Math.min(320, st.round * 40)) * kn.spawn;
      const need = st.target - st.got;
      const usable = COINS.filter((v) => v <= need);
      const v = (usable.length && r() < kn.help)
        ? usable[Math.floor(r() * usable.length)]
        : COINS[Math.floor(r() * COINS.length)];
      st.drops.push({ lane: Math.floor(r() * LANES), y: -20, v });
    }
    const speed = (0.075 + st.round * 0.012) * kn.fall;
    const caught = [], keep = [];
    for (const d of st.drops) {
      d.y += speed * dt;
      if (d.y > H - 44 && d.y < H - 18 && d.lane === st.lane) caught.push(d);
      else if (d.y <= H + 24) keep.push(d);
    }
    st.drops = keep;
    for (const d of caught) { if (st.done) break; catchCoin(d.v, d.lane * (W / LANES) + W / LANES / 2, d.y); }
    st.pops = st.pops.filter((p) => (p.t += dt) < 700);
    if (st.flash) st.flash *= 0.93;
    if (st.t >= LEN) { end(); return; }
    const tm = el('crTime'); if (tm) tm.textContent = Math.max(0, Math.ceil((LEN - st.t) / 1000));
  };
  const step = (ts) => {
    if (st.done) return;
    /* the wall's clock, not the frame rate's (audit v4: a 60 s round took 90 s on slow
       frames). Coins move, so the round runs in slices of at most 50 ms — none skips the purse */
    const dt = Math.min(1000, ts - (last || ts)); last = ts;
    look.clock += dt;
    /* the clock and the coins wait for GO; the purse can already be moved */
    if (cd.step(dt)) for (let left = dt; left > 0.0001 && !st.done; left -= 50) advance(Math.min(50, left));
    if (st.done) return;
    look.px += (LX(st.lane) - look.px) * (still() ? 1 : Math.min(1, dt * 0.022));
    look.sq = Math.max(0, look.sq - dt / 320);
    const frac = Math.min(1.15, st.got / st.target);
    look.meter += (frac - look.meter) * Math.min(1, dt * 0.012);
    if (look.hold && (look.hold.t -= dt) <= 0) { look.hold = null; look.meter = 0; }
    fxl.step(dt);
    draw();
    if (!st.done) raf = requestAnimationFrame(step);
  };

  /* coins by size and metal, smallest copper to biggest two-tone, each with its value on it */
  const sorted = COINS.slice().sort((a, b) => a - b);
  const METAL = [
    ['#F6C9A0', '#C87533', '#7A3E12'],
    ['#FFFFFF', '#C3CAD4', '#6B7480'],
    ['#FFF0B8', '#F0B429', '#8A5A00'],
    ['#FFF0B8', '#E8A92A', '#7A4E00'],
    ['#FFF6D0', '#F5C443', '#7A4E00'],
  ];
  const coinStyle = (v) => {
    const i = Math.max(0, sorted.indexOf(v)), k = sorted.length > 1 ? i / (sorted.length - 1) : 0.5;
    const m = sorted.length <= 2 ? [METAL[1], METAL[2]][i] : METAL[Math.min(METAL.length - 1, Math.round(k * (METAL.length - 1)))];
    return { r: 13 + k * 8, m, ring: k > 0.6 };
  };
  const denomCoin = (x, y, v, wob = 0) => {
    const { r: rad, m, ring } = coinStyle(v);
    ctx.save(); ctx.translate(x, y); ctx.rotate(wob);
    ctx.fillStyle = m[2]; ctx.beginPath(); ctx.arc(0, rad * 0.16, rad, 0, Math.PI * 2); ctx.fill();
    const g = ctx.createRadialGradient(-rad * 0.35, -rad * 0.4, rad * 0.1, 0, 0, rad);
    g.addColorStop(0, m[0]); g.addColorStop(0.6, m[1]); g.addColorStop(1, m[2]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1.6; ctx.strokeStyle = m[2]; ctx.stroke();
    if (ring) { ctx.lineWidth = rad * 0.22; ctx.strokeStyle = 'rgba(214,220,228,.95)'; ctx.beginPath(); ctx.arc(0, 0, rad * 0.86, 0, Math.PI * 2); ctx.stroke(); }
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.arc(0, 0, rad * 0.7, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-rad * 0.35, -rad * 0.45, rad * 0.32, rad * 0.16, -0.6, 0, Math.PI * 2); ctx.fill();
    const s = String(v), fs = Math.round(rad * (s.length > 2 ? 0.72 : s.length > 1 ? 0.9 : 1.05));
    ctx.rotate(-wob);
    ctx.font = `800 ${fs}px "Hanken Grotesk", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(255,252,240,.95)'; ctx.strokeText(s, 0, 1);
    ctx.fillStyle = '#2A1C00'; ctx.fillText(s, 0, 1);
    ctx.restore();
  };
  const label = (text, x, y, size, color, align = 'center') => {
    ctx.font = `800 ${size}px "Hanken Grotesk", system-ui, sans-serif`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 3.2);
    ctx.strokeStyle = R.dark ? 'rgba(12,16,28,.9)' : 'rgba(255,252,245,.95)'; ctx.strokeText(text, x, y);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
  };
  /* the purse: a leather pouch on a drawstring, squashing as a coin lands in it */
  const purse = (x, y) => {
    const q = still() ? 0 : Math.sin(look.sq * Math.PI) * 0.22 * look.sq + look.sq * 0.08;
    shadow(ctx, x, y + 21, 78, R.dark ? 0.45 : 0.3);
    ctx.save(); ctx.translate(x, y + 20); ctx.scale(1 + q, 1 - q); ctx.translate(0, -20);
    /* coins peeking out of the top, more of them the closer you are */
    const peek = Math.min(5, Math.ceil(Math.min(1, st.got / st.target) * 5));
    for (let i = 0; i < peek; i++) coin(ctx, -14 + i * 7, -22 - (i % 2) * 3, 6);
    const g = ctx.createRadialGradient(-10, -4, 4, 0, 4, 40);
    const tint = st.flash < -0.1 ? ['#E8846F', '#B23A2E', '#6A1A12'] : st.flash > 0.1 ? ['#9BE3B8', '#2FA866', '#15532F'] : ['#D9965A', '#A8642C', '#5A3010'];
    g.addColorStop(0, tint[0]); g.addColorStop(0.6, tint[1]); g.addColorStop(1, tint[2]);
    ctx.fillStyle = g; ctx.strokeStyle = '#3A220C'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-15, -18);
    ctx.bezierCurveTo(-30, -12, -38, 4, -32, 14);
    ctx.quadraticCurveTo(-26, 22, 0, 22); ctx.quadraticCurveTo(26, 22, 32, 14);
    ctx.bezierCurveTo(38, 4, 30, -12, 15, -18); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(58,34,12,.35)'; ctx.lineWidth = 1.4;
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 9, -16); ctx.quadraticCurveTo(k * 20, 2, k * 16, 18); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,240,210,.28)'; ctx.beginPath(); ctx.ellipse(-14, -2, 6, 10, 0.4, 0, Math.PI * 2); ctx.fill();
    /* the gathered neck and its drawstring */
    ctx.fillStyle = '#6A3C14'; rr(ctx, -18, -24, 36, 8, 4); ctx.fill(); ctx.strokeStyle = '#3A220C'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.strokeStyle = '#E8C47A'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(-8, -29, 5, 4, -0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(8, -29, 5, 4, 0.5, 0, Math.PI * 2); ctx.stroke();
    coin(ctx, 0, 5, 8);
    ctx.restore();
  };

  const draw = () => {
    if (!ctx) return;
    const dark = !!R.dark, t = look.clock;
    ctx.clearRect(0, 0, W, H);
    const done = fxl.begin(ctx);
    backdrop(ctx, W, H, plate(0), { veil: dark ? 0.28 : 0.16, shift: still() ? 0 : Math.sin(t / 5000) * 5 });
    /* four lanes, four soft beams of light; yours is the bright one */
    const lw = W / LANES;
    ctx.save(); ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
    for (let i = 0; i < LANES; i++) {
      const on = i === st.lane, x = i * lw, cx = x + lw / 2;
      /* a shaft of light, widening as it falls, brightest where it meets the ground */
      const g = ctx.createLinearGradient(0, 0, 0, H);
      const a = on ? (dark ? 0.26 : 0.62) : (dark ? 0.07 : 0.22);
      g.addColorStop(0, `rgba(255,246,220,${a * 0.25})`); g.addColorStop(0.6, `rgba(255,238,190,${a * 0.6})`); g.addColorStop(1, `rgba(255,214,120,${a})`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(cx - lw * 0.3, 0); ctx.lineTo(cx + lw * 0.3, 0); ctx.lineTo(cx + lw * 0.46, H); ctx.lineTo(cx - lw * 0.46, H); ctx.closePath(); ctx.fill();
      if (on) {
        const pool = ctx.createRadialGradient(cx, H - 12, 4, cx, H - 12, lw * 0.6);
        pool.addColorStop(0, dark ? 'rgba(255,214,120,.45)' : 'rgba(255,236,170,.9)'); pool.addColorStop(1, 'rgba(255,236,170,0)');
        ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(cx, H - 12, lw * 0.6, 18, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
    ctx.strokeStyle = dark ? 'rgba(244,238,228,.12)' : 'rgba(90,60,20,.16)'; ctx.lineWidth = 1; ctx.setLineDash([3, 7]);
    for (let i = 1; i < LANES; i++) { ctx.beginPath(); ctx.moveTo(i * lw, 46); ctx.lineTo(i * lw, H - 50); ctx.stroke(); }
    ctx.setLineDash([]);
    /* the ground the purse sits on */
    const gr = ctx.createLinearGradient(0, H - 46, 0, H);
    gr.addColorStop(0, 'rgba(60,36,12,0)'); gr.addColorStop(1, dark ? 'rgba(8,10,20,.55)' : 'rgba(60,36,12,.3)');
    ctx.fillStyle = gr; ctx.fillRect(0, H - 46, W, 46);
    /* the falling coins, each with a faint streak behind it */
    st.drops.forEach((d, i) => {
      const x = LX(d.lane) + (still() ? 0 : Math.sin(d.y * 0.035 + i) * 2), rad = coinStyle(d.v).r;
      if (!still()) {
        const tr = ctx.createLinearGradient(0, d.y - rad - 34, 0, d.y);
        tr.addColorStop(0, 'rgba(255,240,190,0)'); tr.addColorStop(1, 'rgba(255,240,190,.55)');
        ctx.fillStyle = tr; rr(ctx, x - rad * 0.6, d.y - rad - 34, rad * 1.2, 34 + rad * 0.4, rad * 0.6); ctx.fill();
      }
      denomCoin(x, d.y, d.v, still() ? 0 : Math.sin(d.y * 0.05 + i) * 0.18);
    });
    purse(look.px, H - 26);
    /* the meter: how much you need, how much you have, filling as you catch */
    const mx = 12, my = 10, mw = W - 24, mh = 28;
    ctx.fillStyle = dark ? 'rgba(14,18,30,.78)' : 'rgba(255,252,245,.86)'; rr(ctx, mx, my, mw, mh, 14); ctx.fill();
    ctx.strokeStyle = dark ? 'rgba(244,238,228,.25)' : 'rgba(58,42,20,.18)'; ctx.lineWidth = 1; ctx.stroke();
    const h = look.hold, frac = h ? 1 : Math.min(1, look.meter), over = h ? h.kind === 'over' : st.got > st.target;
    if (frac > 0.01) {
      const fg = ctx.createLinearGradient(mx, 0, mx + mw, 0);
      if (h && h.kind === 'ok') { fg.addColorStop(0, '#2FBF71'); fg.addColorStop(1, '#8BE3AE'); }
      else if (over) { fg.addColorStop(0, '#E0483A'); fg.addColorStop(1, '#F08A6A'); }
      else { fg.addColorStop(0, '#F0B429'); fg.addColorStop(1, '#FFD978'); }
      ctx.save(); rr(ctx, mx + 3, my + 3, mw - 6, mh - 6, 11); ctx.clip();
      ctx.fillStyle = fg; ctx.fillRect(mx + 3, my + 3, (mw - 6) * frac, mh - 6);
      if (!still()) { ctx.fillStyle = 'rgba(255,255,255,.35)'; const sx = ((t * 0.15) % (mw + 60)) - 30; ctx.fillRect(mx + sx, my, 18, mh); }
      ctx.restore();
    }
    /* a tick for every coin's worth of the target, so the gap is countable */
    const step1 = sorted[0] || 1, ticks = Math.round(st.target / step1);
    if (!h && ticks > 1 && ticks <= 40) {
      ctx.fillStyle = dark ? 'rgba(244,238,228,.3)' : 'rgba(58,42,20,.22)';
      for (let i = 1; i < ticks; i++) ctx.fillRect(mx + 3 + ((mw - 6) * i) / ticks, my + mh - 8, 1, 5);
    }
    const ink = dark ? '#F4EEE4' : '#1C2A2E';
    if (h) {
      /* §2.8 · the verdict sits on its own solid chip — white on deep green or deep red —
         so "Over by ₹7" reads at a glance instead of dark red ink on a red bar */
      ctx.font = '800 15px "Hanken Grotesk", system-ui, sans-serif';
      const tw = ctx.measureText(h.text).width + 26, ty = my + mh / 2 + 1;
      ctx.fillStyle = h.kind === 'ok' ? '#0E5A33' : '#8E1F18'; rr(ctx, W / 2 - tw / 2, ty - 13, tw, 26, 13); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(h.text, W / 2, ty + 0.5);
      if (h.sub) {
        /* and which coin would have made it exact, under the meter */
        ctx.font = '700 11.5px "Hanken Grotesk", system-ui, sans-serif';
        const words = h.sub.split(' '), lines = [''];
        words.forEach((w) => { const t = (lines[lines.length - 1] + ' ' + w).trim(); if (ctx.measureText(t).width > W - 60 && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t; });
        const bh = lines.length * 15 + 10, by = my + mh + 6, bw = Math.min(W - 24, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 22);
        ctx.fillStyle = dark ? 'rgba(14,18,30,.92)' : 'rgba(255,252,245,.95)'; rr(ctx, W / 2 - bw / 2, by, bw, bh, 10); ctx.fill();
        ctx.fillStyle = dark ? '#FFE3DD' : '#5A0E08';
        lines.forEach((l, i) => ctx.fillText(l, W / 2, by + 12 + i * 15));
      }
    } else {
      label('Need ' + M(st.target), mx + 12, my + mh / 2 + 1, 13, ink, 'left');
      label('Got ' + M(st.got), mx + mw - 12, my + mh / 2 + 1, 13, over ? '#B23A2E' : ink, 'right');
      label('still ' + M(Math.max(0, st.target - st.got)), W / 2, my + mh / 2 + 1, 11.5, dark ? '#FFD978' : '#8A5A00');
    }
    /* tries left, as hearts */
    for (let i = 0; i < 3; i++) {
      const on = i < st.lives, x = W - 20 - i * 18, y = my + mh + 16;
      ctx.fillStyle = on ? '#E0483A' : (dark ? 'rgba(244,238,228,.25)' : 'rgba(58,42,20,.2)');
      ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.bezierCurveTo(x - 9, y - 2, x - 5, y - 9, x, y - 4); ctx.bezierCurveTo(x + 5, y - 9, x + 9, y - 2, x, y + 5); ctx.fill();
      if (on) { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.2; ctx.stroke(); }
    }
    fxl.draw(ctx, W, H);
    done();
    cd.draw(ctx, W, H);
  };

  return {
    id: 'cr',
    st, advance,
    mount() {
      warmFonts();
      cv = document.getElementById('crCanvas');
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx = cv.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!st.done) { last = 0; stop(); raf = requestAnimationFrame(step); }
      /* tap a lane, or drag the purse along */
      const to = (e) => {
        const b = cv.getBoundingClientRect();
        const l = clamp(Math.floor(((e.clientX - b.left) / b.width) * LANES), 0, LANES - 1);
        if (l !== st.lane) { st.lane = l; lanes(); }
      };
      cv.onpointerdown = (e) => { to(e); if (cv.setPointerCapture) try { cv.setPointerCapture(e.pointerId); } catch (x) { /* fine */ } };
      cv.onpointermove = (e) => { if (e.buttons || e.pointerType === 'touch') to(e); };
    },
    stop,
    key(e) {
      if (st.done) { endKey(e); return; }
      if (e.key === 'ArrowLeft') st.lane = Math.max(0, st.lane - 1);
      else if (e.key === 'ArrowRight') st.lane = Math.min(LANES - 1, st.lane + 1);
      lanes();
    },
    act(n, arg) { if (n === 'crLane') { st.lane = clamp(+arg, 0, LANES - 1); lanes(); } },
    view() {
      if (st.done) return `<div class="stack">${hud(['Done', tierChip()])}
        ${endCard(st.round > 4 ? '🏅' : '🪙', st.exact + ' exact', 'Score ' + st.score + ' · par ' + knobs('cr').par + ' on ' + TIER_NAME[curTier] + '.', st.won,
          'Overpaying is the one that costs you. A shop will take too much money all day long and never mention it.', 'mags')}</div>`;
      return `<div class="stack">
        ${hud([tierChip(), `Need <b id="crNeed">${M(st.target)}</b>`, `Got <b id="crGot">${M(st.got)}</b>`, `Tries <b id="crLives">${Math.max(0, st.lives)}</b>`, `<span id="crTime">${Math.max(0, Math.ceil((LEN - st.t) / 1000))}</span>s`])}
        <div class="stage arcstage" style="min-height:0;padding:12px">
          <canvas id="crCanvas" class="arccv" role="img" aria-label="Coins falling in four lanes, and your purse" style="width:100%;max-width:400px;margin:0 auto;height:auto;aspect-ratio:${W}/${H};display:block;touch-action:none"></canvas>
          <div class="choices crlanes" style="grid-template-columns:repeat(4,1fr);max-width:400px;margin:0 auto;width:100%">
            ${[0, 1, 2, 3].map((i) => `<button class="btn ghost crlane" data-act="crLane" data-arg="${i}" aria-label="lane ${i + 1}" aria-pressed="${st.lane === i}">${i + 1}</button>`).join('')}
          </div>
          <p class="hint"><span id="crMsg" aria-live="polite">${st.msg ? esc(st.msg) + ' · ' : ''}</span>Arrow keys, tap a lane, or drag. Stop at exactly the amount.</p>
        </div></div>`;
    },
  };
}

/* ══ MARKET STORM ═════════════════════════════════════════════════════
   The plan is the game (docs/12 §2.5). The only big button sells; the small one
   re-reads the plan you wrote before the storm. Panic rises on its own and jumps every
   time somebody shouts, and it never sells for you. In most storms the company is fine
   and the plan says hold; in one in five it really stops making money, the headline
   says so, and the plan says sell. */
export const SHOUTS = [
  ['bea', 'It is down again. I told you. GET OUT.'],
  ['bea', 'Everyone is selling. Everyone.'],
  ['mags', 'Sell me yours cheap and I will look after it for you.'],
  ['bea', 'This one is not coming back. This one is different.'],
  ['bo', 'I am buying more, but I would say that.'],
  ['bea', 'Down eleven percent. ELEVEN.'],
  ['mags', 'My cousin sold at the top. You could have been my cousin.'],
  ['bea', 'It has never been this bad. Well — it has, but still.'],
];
/* The storm's chart: what you paid as a dashed line, half of it when that is your rule, the
   fall as a red area, and a pulsing head that crawls toward the live price every frame. */
function stormChart(line, live, t, half = false) {
  const w = 300, h = 84, lo = 150, hi = 1060;
  const vals = line.concat([Math.round(live)]), n = Math.max(2, vals.length);
  const X = (i) => 4 + (i / (n - 1)) * (w - 22), Y = (v) => 6 + (1 - (v - lo) / (hi - lo)) * (h - 12);
  const pts = vals.map((v, i) => X(i).toFixed(1) + ',' + Y(v).toFixed(1));
  const hx = X(vals.length - 1), hy = Y(vals[vals.length - 1]);
  const pulse = still() ? 0 : Math.abs(Math.sin(t / 260));
  const label = (v, txt) => `<line x1="0" x2="${w}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="currentColor" stroke-opacity=".45" stroke-dasharray="5 5" stroke-width="1.4"/>
    <text x="6" y="${(Y(v) < 14 ? Y(v) + 13 : Y(v) - 5).toFixed(1)}" font-size="10" font-weight="700" fill="currentColor" fill-opacity=".75" font-family="Hanken Grotesk, system-ui, sans-serif">${txt}</text>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" style="display:block;width:100%;height:${h}px">
    <defs><linearGradient id="stFall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0483A" stop-opacity=".45"/><stop offset="1" stop-color="#E0483A" stop-opacity="0"/></linearGradient></defs>
    ${label(STORM_START, 'you paid ' + STORM_START)}${half ? label(STORM_HALF, 'half: ' + STORM_HALF) : ''}
    <path d="M${X(0).toFixed(1)},${h} L${pts.join(' L')} L${hx.toFixed(1)},${h} Z" fill="url(#stFall)"/>
    <polyline points="${pts.join(' ')}" fill="none" stroke="#E0483A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${(6 + pulse * 7).toFixed(1)}" fill="#E0483A" fill-opacity="${(0.35 - pulse * 0.3).toFixed(2)}"/>
    <circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="4.5" fill="#fff" stroke="#E0483A" stroke-width="2.5"/>
  </svg>`;
}
/* §2.5 · the plan is the game. Three steps: write the plan (when you would sell, why you
   bought — off the company's card), live through the storm (panic, shouts, headlines;
   NOTHING sells by itself, SELL is the only exit, Space re-reads the plan), and the end
   card, which scores keeping to the plan and reading the news, and shows the money
   without scoring it. Rules and score: storm.js. */
function marketStorm(seed = playSeed()) {
  const kn = knobs('st'), def = stormFor(seed), LEN = def.len;
  const st = { phase: 'plan', rule: null, why: null, t: 0, panic: 0, val: STORM_START, low: STORM_START,
    line: [STORM_START, STORM_START, STORM_START], done: false, sold: false, soldT: null, halfAt: null,
    shout: null, shoutT: kn.every * 0.6, calmT: 0, shoutN: 0, maxPanic: 0, calms: 0, news: [], newsN: 0, factSeen: false, def };
  let iv = 0, last = 0, seenShout = 0, seenNews = 0;
  /* this play's own shouts and wobble */
  const r = rng(seed);
  const words = () => planWords(def, st.rule, st.why);

  const stop = () => { if (iv) cancelAnimationFrame(iv); iv = 0; };
  const finish = (sold) => {
    if (st.done || st.phase !== 'storm') return;
    st.done = true; st.sold = sold; stop();
    if (sold) { st.soldT = st.t; st.soldAt = Math.round(st.val); }
    st.endAt = Math.round(stormValue(def, 1));
    st.score = stormScore(def, { rule: st.rule, why: st.why, sold, soldT: st.soldT, halfAt: st.halfAt });
    if (!sold && st.score.kept) sim.badge(K(), 'held-the-storm');
    st.won = roundEnd('st', { points: st.score.points, kept: st.score.kept, read: st.score.read, whyOk: st.score.whyOk,
      sold, stops: def.stops, maxPanic: st.maxPanic, calms: st.calms }, 'Market Storm');
    if (st.score.kept) sfx.level(); else sfx.bad();
    R.render();
  };
  /* one slice of the storm — the frame loop and a headless player share it */
  const advance = (dt) => {
    if (st.done || st.phase !== 'storm') return;
    st.t += dt;
    const p = st.t / LEN;
    st.val = Math.max(120, stormValue(def, p) + (r() - 0.5) * WOBBLE);
    st.low = Math.min(st.low, st.val);
    if (st.halfAt == null && st.val <= STORM_HALF) st.halfAt = st.t;
    if (st.line.length < 120 && st.t - (st.lastPt || 0) > 350) { st.lastPt = st.t; st.line.push(Math.round(st.val)); }
    st.panic = clamp(st.panic + dt * kn.drift, 0, 100);
    st.shoutT -= dt; st.calmT = Math.max(0, st.calmT - dt);
    /* the headlines arrive on the storm's own timetable */
    let fresh = false;
    while (st.newsN < def.news.length && def.news[st.newsN].at <= st.t) {
      const h = def.news[st.newsN++];
      st.news.unshift(h); if (h.kind === 'fact') st.factSeen = true;
      fresh = true;
    }
    if (st.shoutT <= 0) {
      st.shoutT = kn.every;
      st.shout = SHOUTS[Math.floor(r() * SHOUTS.length)];
      st.panic = clamp(st.panic + kn.shout, 0, 100);
      st.shoutN++; fresh = true;
      jolt('bad'); domPop('.gplay .stpanic', '+' + kn.shout + ' panic', 'bad');
    }
    st.maxPanic = Math.max(st.maxPanic, st.panic);
    /* panic at the top does NOTHING by itself (§2.5): it used to sell for you at 100 */
    if (fresh) R.render();
    if (st.t >= LEN) { finish(false); return; }
  };
  const tick = (ts) => {
    if (st.done) return;
    /* the wall's clock, not the frame rate's (audit v4): a slow frame carries its real time */
    const dt = Math.min(1000, ts - (last || ts)); last = ts;
    advance(dt);
    if (st.done) return;
    const el = document.getElementById('stPanic');
    if (el) {
      el.style.width = st.panic.toFixed(1) + '%';
      const wrap = el.parentElement; if (wrap) { wrap.classList.toggle('hot', st.panic >= 55); wrap.classList.toggle('crit', st.panic >= 80); }
    }
    const sg = document.querySelector('.gplay .ststage');
    if (sg) sg.style.setProperty('--panic', (st.panic / 100).toFixed(3));
    const sb = document.querySelector('.gplay [data-act="stSell"]');
    if (sb) sb.classList.toggle('tempt', st.panic >= 65);
    const vv = document.getElementById('stVal');
    if (vv) vv.textContent = Math.round(st.val);
    const tt = document.getElementById('stTime');
    if (tt) tt.textContent = Math.ceil((LEN - st.t) / 1000);
    const ch = document.getElementById('stChart');
    if (ch) ch.innerHTML = stormChart(st.line, st.val, st.t, st.rule === 'half');
    iv = requestAnimationFrame(tick);
  };
  const calm = () => {
    if (st.done || st.phase !== 'storm' || st.calmT > 0) return;
    st.panic = clamp(st.panic - 26, 0, 100);
    st.calmT = 2600; st.calms++;
    sfx.good();
    R.render();
    domPop('.gplay .stpanic', '−26 panic', 'good');
  };
  const pickRule = (id) => { if (st.phase === 'plan' && RULES.some((x) => x.id === id)) { st.rule = id; sfx.click(); R.render(); } };
  const pickWhy = (id) => { if (st.phase === 'plan' && def.whys.some((x) => x.id === id)) { st.why = id; sfx.click(); R.render(); } };
  const go = () => {
    if (st.phase !== 'plan' || !st.rule || !st.why) return;
    st.phase = 'storm'; last = 0; sfx.click(); R.render();
  };
  const sell = () => finish(true);
  const opt = (act, id, text, on, n) => `<button class="opt stopt${on ? ' on' : ''}" data-act="${act}" data-arg="${id}" aria-pressed="${on}"><span class="tk" aria-hidden="true">${n}</span>${esc(text)}</button>`;
  const head = (h, i) => `<div class="sthead${i === 0 && st.newsN !== seenNews ? ' in' : ''}"><span class="eyebrow">The Gazette</span><b>${esc(h.text)}</b></div>`;
  return {
    id: 'st', st, def, advance, calm, sell, go, pickRule, pickWhy,
    mount() { if (st.phase === 'storm' && !st.done && !iv) { last = 0; iv = requestAnimationFrame(tick); } },
    stop,
    key(e) {
      if (st.done) { endKey(e); return; }
      if (st.phase === 'plan') {
        const n = ['1', '2', '3'].indexOf(e.key);
        if (n >= 0) { if (!st.rule) pickRule(RULES[n].id); else pickWhy(def.whys[n].id); return; }
        if (e.key === 'Backspace') { if (st.why) st.why = null; else st.rule = null; R.render(); return; }
        if (e.key === 'Enter' || e.key === ' ') { if (e.preventDefault) e.preventDefault(); go(); }
        return;
      }
      if (e.key === ' ' || e.key === 'Spacebar') { if (e.preventDefault) e.preventDefault(); calm(); }
    },
    act(n, arg) {
      if (n === 'stRule') pickRule(arg);
      else if (n === 'stWhy') pickWhy(arg);
      else if (n === 'stGo') go();
      else if (n === 'stSell') sell();
      else if (n === 'stPlan') calm();
    },
    view() {
      const co = def.co;
      if (st.phase === 'plan') {
        return `<div class="stack">${hud([tierChip(), 'Before the storm'])}
          <div class="stage ststage stplanstage">
            <div class="gcard stcard"><div class="row" style="gap:10px">${ico(co.icon, '🏪', 34)}<div class="grow" style="text-align:left">
              <span class="eyebrow">You own a share of</span><h2 style="margin:2px 0 0;font-size:21px">${esc(co.name)}</h2></div></div>
              <ul class="stfacts">${co.card.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
              <p class="small muted" style="margin:0">A Bizzington company. It is not real.</p></div>
            <div class="stq${st.rule ? ' done' : ' now'}"><span class="eyebrow">1 · When would you sell?</span>
              ${RULES.map((x, i) => opt('stRule', x.id, x.t, st.rule === x.id, i + 1)).join('')}</div>
            <div class="stq${st.why ? ' done' : st.rule ? ' now' : ''}"><span class="eyebrow">2 · Why did you buy it? Read the card</span>
              ${def.whys.map((x, i) => opt('stWhy', x.id, x.t, st.why === x.id, i + 1)).join('')}</div>
            ${st.rule && st.why ? `<div class="card stplan" style="box-shadow:none"><div class="eyebrow">Your plan, in your words</div><p class="stwords">“${esc(words())}”</p></div>` : ''}
            <button class="btn wide" data-act="stGo" ${st.rule && st.why ? '' : 'disabled'}>Into the storm · Enter</button>
            <p class="hint">${!st.rule ? 'Press 1, 2 or 3 for when you would sell — or tap.' : !st.why ? 'Now 1, 2 or 3 for why you bought it. Backspace goes back.' : 'Nothing will sell unless you press SELL. Your plan says when.'}</p>
          </div></div>`;
      }
      if (st.done) {
        const s = st.score, ruleW = RULES.find((x) => x.id === st.rule);
        const mark = (yes, good, bad) => `<li class="${yes ? 'met' : ''}"><span class="gtick" aria-hidden="true">${yes ? '✓' : '·'}</span><span>${esc(yes ? good : bad)}</span></li>`;
        const keptLine = s.due == null
          ? (s.kept ? 'Your rule never said sell, and you held.' : 'Your rule never said sell in this storm, and you sold.')
          : (s.kept ? 'Your rule said sell, and you sold after it did.' : st.sold ? 'You sold before your rule said to.' : 'Your rule said sell, and you held on.');
        const readLine = def.stops
          ? (s.read ? 'The headline said it had stopped making money, and you acted on it.' : st.sold ? 'You sold before the news said anything about the business.' : 'The headline said it had stopped making money, and you held anyway.')
          : (s.read ? 'Every headline about the business itself was ordinary; the rest was noise, and you let it be.' : 'The business was fine all the way through; the fall was the noise.');
        return `<div class="stack">${hud(['Storm over', tierChip()])}
          <div class="stage ststage" style="text-align:center;justify-content:center">
            <div class="endico">${s.kept ? ico('mountain', '⛰️', 48) : ico('chartDown', '📉', 48)}</div>
            <h2>${s.points} of ${STORM_PAR} · ${s.kept ? 'you kept to your plan' : 'you broke your plan'}</h2>
            <p class="endkey">${def.stops ? `${esc(co.name)} really did stop making money in this one.` : `${esc(co.name)} was fine all along: the storm was the market's mood.`} Your rule: <b>${esc(ruleW ? ruleW.short : '')}</b>.</p>
            <div class="goals stscore"><div class="eyebrow">What was scored · your decisions</div><ul>
              ${mark(s.kept, keptLine, keptLine)}${mark(s.read, readLine, readLine)}
              ${mark(s.whyOk, 'Why you bought came off the card.', 'Why you bought was not on the card: the price and the crowd are not reasons the business gives.')}</ul></div>
            <div class="card stmoney" style="box-shadow:none">
              <div class="eyebrow">The money · shown, never scored</div>
              <div class="grid3" style="margin-top:6px">
                <div><div class="small muted">You paid</div><div style="font-weight:800">${STORM_START}</div></div>
                <div><div class="small muted">Worst moment</div><div style="font-weight:800;color:var(--spend)">${Math.round(st.low)}</div></div>
                <div><div class="small muted">${st.sold ? 'You sold at' : 'You still own it at'}</div><div style="font-weight:800">${st.sold ? st.soldAt : st.endAt}</div></div>
              </div>
              <p class="small" style="margin-top:8px">A few months later it stood at <b>${def.after}</b>${st.sold ? ` — and you had ${st.soldAt}` : ''}. ${def.stops ? 'A business that stops making money rarely comes back.' : 'A fall is not a loss until you sell.'}</p>
            </div>
            ${say(s.kept ? 'nana' : 'bea', s.kept
              ? (st.sold ? 'You wrote down when you would sell, and when the news said so, you did. That is not panic; that is a plan.'
                : def.stops ? 'You kept to your plan, and that counts. But the reason you bought stopped being true. A plan is for the noise; the news is about the business.'
                  : 'Sitting still while everyone shouts is the hardest thing in this whole subject, and your plan is what let you do it.')
              : (st.sold ? 'I talked you into it, and I am always this certain, and I am wrong about half the time. Next storm, let your plan decide.' : 'The plan said sell and the plan was right. Holding is only brave when the business is still fine.'))}
            ${endFoot(st.won, 'A fictional company, the town\'s own storm, nothing here is advice.')}
            <button class="btn wide" data-act="gquit">Back to Play</button>
          </div></div>`;
      }
      const sh = st.shout, freshShout = st.shoutN !== seenShout; seenShout = st.shoutN;
      const heads = st.news.slice(0, 2).map(head).join(''); seenNews = st.newsN;
      return `<div class="stack">
        ${hud([tierChip(), `<span id="stTime">${Math.ceil((LEN - st.t) / 1000)}</span>s left`, `${esc(co.name)} <span id="stVal">${Math.round(st.val)}</span> / ${STORM_START}`])}
        <div class="stage ststage" style="--panic:${(st.panic / 100).toFixed(3)}">
          <div>
            <div class="row"><span class="eyebrow grow">Panic</span>
              <span class="small muted">${st.panic >= 100 ? 'full — and still nothing sells unless you do' : st.calmT > 0 ? 'reading your plan…' : 'space re-reads your plan'}</span></div>
            <div class="bar stpanic${st.panic >= 55 ? ' hot' : ''}${st.panic >= 80 ? ' crit' : ''}" style="height:14px;margin-top:5px">
              <i id="stPanic" style="width:${st.panic}%;background:linear-gradient(90deg,var(--treasure),var(--spend));transition:width .2s linear"></i></div>
          </div>
          <div id="stChart" class="stchart">${stormChart(st.line, st.val, st.t, st.rule === 'half')}</div>
          <div class="stnews" aria-live="polite">${heads || '<div class="sthead"><span class="eyebrow">The Gazette</span><b>No news yet. Only prices.</b></div>'}</div>
          <div class="stshout${freshShout ? ' in' : ''}">${sh ? say(sh[0], esc(sh[1])) : say('bo', 'It is going to be fine. Probably. I say that every week too.')}</div>
          <div class="card stplan${st.calmT > 0 ? ' calm' : ''}" style="box-shadow:none;border-style:dashed">
            <div class="eyebrow">Your plan, in your words</div>
            <p class="stwords">“${esc(words())}”</p>
          </div>
          <div class="grow"></div>
          <button class="btn wide${st.panic >= 65 ? ' tempt' : ''}" style="background:var(--spend)" data-act="stSell">SELL</button>
          <button class="btn ghost wide" data-act="stPlan" ${st.calmT > 0 ? 'disabled' : ''}>Re-read my plan · space</button>
          <p class="hint">Nothing sells by itself. Read the news, read your plan, then decide.</p>
        </div></div>`;
    },
  };
}
