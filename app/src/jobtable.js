/* jobtable.js — which Shift template each job uses. Kept apart from jobgames.js so the
   first screen can name a job without loading the games (they load when a shift starts).

   docs/12 §3.1: one Shift engine, four money-skill templates. The job ids and names are
   the ones the town has always had, so saved days, bests and Town links still work; what
   changed is the work inside them — no reflex, a money decision in every item.

     count   check a delivery against the order slip and flag what is short
     change  give the change with the fewest coins and notes
     ledger  keep the running balance, and spot the line that does not add up
     route   the cheapest way that still gets there in time (fare against the clock)

   A shift is SHIFT_ITEMS items or SHIFT_MS of wall-clock time, whichever comes first.
   Pay is ACCURACY: right answers out of the twelve the shift holds, against `par` (a
   good shift), and sim.doJob clamps it at both ends as it always has. */
export const SHIFT_ITEMS = 12, SHIFT_MS = 90000;
export const JOB_GAME = {
  crates:    { kind: 'count',  look: 'crate',  noun: 'crates',  item: '📦', verb: 'Check the grain delivery',        tint: '--treasure' },
  haul:      { kind: 'count',  look: 'sack',   noun: 'sacks',   item: '🛒', verb: 'Check the load against the slip', tint: '--treasure' },
  cargo:     { kind: 'count',  look: 'barrel', noun: 'barrels', item: '⚓', verb: 'Check the cargo off the boat',    tint: '--treasure' },
  counter:   { kind: 'change', item: '🥫', verb: 'Give the right change',         tint: '--action' },
  runner:    { kind: 'change', item: '📨', verb: 'Change for every order',        tint: '--action' },
  board:     { kind: 'change', item: '🖍️', verb: 'Change at the price board',     tint: '--action' },
  books:     { kind: 'ledger', item: '📒', verb: 'Keep the running balance',      tint: '--save' },
  nets:      { kind: 'ledger', item: '🕸️', verb: "The harbour master's book",     tint: '--save' },
  mend:      { kind: 'ledger', item: '🧵', verb: "Mags's repair book",            tint: '--save' },
  flyers:    { kind: 'route',  item: '📄', verb: 'Every door, the cheapest way',   tint: '--grow' },
  errands:   { kind: 'route',  item: '🏃', verb: 'Every stop, on time and cheap',  tint: '--grow' },
  sweep:     { kind: 'route',  item: '🧹', verb: 'Get to each stretch in time',    tint: '--grow' },
  lamplight: { kind: 'route',  item: '🏮', verb: 'Every lamp before dark',         tint: '--grow' },
};
export const SHIFT_KINDS = ['count', 'change', 'ledger', 'route'];
export function hasJobGame(id) { return !!JOB_GAME[id]; }
/* how the Town and the Wallet name the work (one place, so the two never disagree) */
export const KIND_WORD = { count: 'counting the delivery', change: 'giving change', ledger: 'keeping the books', route: 'planning the route' };
/* each template's own end-card line (docs/12 §1.4): never the last arcade game's */
export const SHIFT_PRACTISED = {
  count: 'counting a delivery against the order slip, and saying exactly what is short',
  change: 'giving change with the fewest coins and notes',
  ledger: 'keeping a running balance, and catching the line that does not add up',
  route: 'weighing a fare against the clock: the cheapest way that still gets there in time',
};

/* ── three levels (G8) and three goals (G9) ──────────────────────────────
   Every game in the app, arcade and job alike, comes in Easy · Standard ·
   Tricky. Goals are a record, not a reward: three named things per game, each
   one a decision you can make (not a lucky draw), ticked when a run shows it.
   They pay nothing — no coins, no XP — and nothing expires. */
export const TIER_IDS = ['easy', 'standard', 'tricky'];
export const TIER_NAME = { easy: 'Easy', standard: 'Standard', tricky: 'Tricky' };
export function tierOf(c, id) {
  const t = c && c.tiers && c.tiers[id];
  return TIER_IDS.includes(t) ? t : 'standard';
}
export function setTier(c, id, t) {
  if (!c || !TIER_IDS.includes(t)) return false;
  c.tiers = c.tiers || {};
  c.tiers[id] = t;
  return true;
}
export function goalsMet(c, id) { return (c && c.goals && c.goals[id]) || {}; }
/* Tick every goal this run shows. Returns the goals this run met, each marked
   `fresh` the first time — the record only ever gains ticks, and pays nothing. */
export function earnGoals(c, id, table, run) {
  const out = [];
  if (!c || !table || !run) return out;
  c.goals = c.goals || {};
  const have = c.goals[id] || (c.goals[id] = {});
  for (const g of table) {
    let met = false;
    try { met = !!g.check(run); } catch (e) { met = false; }
    if (!met) continue;
    out.push({ id: g.id, name: g.name, fresh: !have[g.id] });
    have[g.id] = true;
  }
  return out;
}

/* What a level does to each template. A level changes the CONTENT — bigger orders, more
   coin kinds, larger sums, more ways to go — never the economy: pay is accuracy against
   the same par on every level, so a harder level is a challenge and never a bigger payday. */
export const JOB_TIERS = {
  /* min/max: how many were ordered · short: the most that can be missing · layout: how the delivery lies · packs: the slip may say "3 packs of 6" */
  count:  { easy: { min: 5, max: 10, short: 3, layout: 'rows', packs: false }, standard: { min: 8, max: 16, short: 5, layout: 'loose', packs: false }, tricky: { min: 12, max: 24, short: 6, layout: 'stacks', packs: true } },
  /* coins: how many kinds of coin and note in the till · max: the most change due · odd: a customer may add a coin to get a round number back */
  change: { easy: { coins: 3, max: 9, odd: false }, standard: { coins: 4, max: 30, odd: false }, tricky: { coins: 5, max: 45, odd: true } },
  /* open: the opening balance · amt: the biggest line · checks: spot-the-wrong-line items in a shift */
  ledger: { easy: { open: 20, amt: 10, checks: 3 }, standard: { open: 50, amt: 30, checks: 3 }, tricky: { open: 120, amt: 90, checks: 3 } },
  /* opts: ways to go · legs: the most legs in one way · tram: the tram line is running */
  route:  { easy: { opts: 4, legs: 1, tram: false }, standard: { opts: 4, legs: 2, tram: false }, tricky: { opts: 5, legs: 3, tram: true } },
};
export const JOB_TIER_SAYS = {
  count:  { easy: 'Up to ten, laid out in fives.', standard: 'Up to sixteen, in a loose pile.', tricky: 'Stacked high, and the slip may say it in packs.' },
  change: { easy: 'Small change, three kinds of coin.', standard: 'Change up to thirty, four kinds.', tricky: 'Bigger change, every kind, and some customers add a coin.' },
  ledger: { easy: 'Small sums from twenty.', standard: 'Lines up to thirty, from fifty.', tricky: 'Two-figure lines, from a hundred and twenty.' },
  route:  { easy: 'Four ways to go, one leg each.', standard: 'Four ways, some with a change.', tricky: 'Five ways, up to three legs, and the tram.' },
};
/* A good shift is eight right of twelve on every level: quality = right / par, so twelve
   right is 1.5 and sim.doJob's floor and ceiling still hold. */
export const JOB_PAR = 8;
export function jobPar(id) { return JOB_GAME[id] ? JOB_PAR : 0; }
export function jobKnobs(id, tier = 'standard') {
  const cfg = JOB_GAME[id];
  return cfg ? JOB_TIERS[cfg.kind][TIER_IDS.includes(tier) ? tier : 'standard'] : null;
}
/* Each shift reports a run summary at its end; goals read it. Every goal is a thing done
   right, never a thing done fast. */
export const JOB_GOALS = {
  count: [
    { id: 'all', name: 'Every delivery checked right in one shift', check: (r) => r.finished && r.right === r.of },
    { id: 'flag5', name: 'Five short deliveries flagged in one shift', check: (r) => r.flagged >= 5 },
    { id: 'run6', name: 'Six right in a row', check: (r) => r.bestRun >= 6 },
  ],
  change: [
    { id: 'all', name: 'Fewest coins for every customer in a shift', check: (r) => r.finished && r.right === r.of },
    { id: 'noover', name: 'A whole shift without giving too much', check: (r) => r.finished && r.answered === r.of && r.over === 0 },
    { id: 'run6', name: 'Six right in a row', check: (r) => r.bestRun >= 6 },
  ],
  ledger: [
    { id: 'all', name: 'The page balances: every line right', check: (r) => r.finished && r.right === r.of },
    { id: 'spot', name: 'Every wrong line spotted in a shift', check: (r) => r.checks > 0 && r.spotted === r.checks },
    { id: 'run6', name: 'Six right in a row', check: (r) => r.bestRun >= 6 },
  ],
  route: [
    { id: 'all', name: 'The cheapest way on time, every trip', check: (r) => r.finished && r.right === r.of },
    { id: 'ontime', name: 'A whole shift and never late', check: (r) => r.finished && r.answered === r.of && r.late === 0 },
    { id: 'run6', name: 'Six right in a row', check: (r) => r.bestRun >= 6 },
  ],
};
export function jobGoals(id) { const cfg = JOB_GAME[id]; return cfg ? JOB_GOALS[cfg.kind] : []; }
