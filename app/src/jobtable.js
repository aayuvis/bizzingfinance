/* jobtable.js — which mechanic each job uses. Kept apart from jobgames.js so the first
   screen can name a job without loading the games (they load when a shift starts). */
/* Which mechanic each job uses, and the dressing that makes it that job.
   `par` is a competent run — pay is the score against it. The score is the
   skill (square drops, the right side, clean chains, every door) and mistakes
   subtract, so it is tuned against three headless players: a careful one
   lands near 1.6x par (A cracking shift), a careless one near 0.6-1.0x
   (Got it done), and no input at all scores about nothing and still
   reaches the end card. */
export const JOB_GAME = {
  crates:    { kind: 'stack',  par: 40, item: '📦', verb: 'Stack them square', tint: '--treasure' },
  haul:      { kind: 'stack',  par: 40, item: '🛒', verb: 'Load the handcart',  tint: '--treasure' },
  counter:   { kind: 'stack',  par: 41, item: '🥫', verb: 'Stock the shelves',  tint: '--treasure' },
  cargo:     { kind: 'trim',   par: 26, item: '⚓', verb: 'Keep her level',     tint: '--save' },
  nets:      { kind: 'trim',   par: 24, item: '🕸️', verb: 'Balance the load',   tint: '--save' },
  books:     { kind: 'trim',   par: 25, item: '📒', verb: 'Balance the books',  tint: '--save' },
  sweep:     { kind: 'sweep',  par: 36, item: '🧹', verb: 'Clear the Row',      tint: '--grow' },
  lamplight: { kind: 'sweep',  par: 35, item: '🏮', verb: 'Light every lamp',   tint: '--grow' },
  mend:      { kind: 'sweep',  par: 35, item: '🧵', verb: 'Mend the lot',       tint: '--grow' },
  flyers:    { kind: 'runner', par: 23, item: '📄', verb: 'Every door on the Row', tint: '--action' },
  errands:   { kind: 'runner', par: 24, item: '🏃', verb: 'Every stop, in order',  tint: '--action' },
  runner:    { kind: 'runner', par: 25, item: '📨', verb: 'Get the orders out',    tint: '--action' },
  board:     { kind: 'runner', par: 24, item: '🖍️', verb: 'Chalk up every price',  tint: '--action' },
};
export function hasJobGame(id) { return !!JOB_GAME[id]; }

/* ── three levels (G8) and three goals (G9) ──────────────────────────────
   Every game in the app, arcade and job alike, comes in Easy · Standard ·
   Tricky. A level changes the mechanic's knobs — speed, density, time,
   number size — and NEVER the economy: each level has its own par, measured
   with the same headless players, so a careful player lands near 1.6× par
   on every level. A harder level is a challenge, not a bigger payday
   (owner's decision). Standard is the game as it was, exactly, knobs and par.

   Goals are a record, not a reward: three named things per game, each one a
   decision you can make (not a lucky draw), ticked when a run shows it. They
   pay nothing — no coins, no XP — and nothing expires. */
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

/* What a level does to each mechanic. Standard is all ones: today's game. */
export const JOB_TIERS = {
  /* speed: how fast the crate swings · snap: how close counts as square (px) */
  stack:  { easy: { speed: 0.85, snap: 4 }, standard: { speed: 1, snap: 5 }, tricky: { speed: 1.25, snap: 4 } },
  /* gap: time between loads · heavy: the biggest weight, ± · limit: how far she can lean */
  trim:   { easy: { gap: 1.3, heavy: -1, limit: 48 }, standard: { gap: 1, heavy: 0, limit: 42 }, tricky: { gap: 0.8, heavy: 1, limit: 38 } },
  /* fall: how fast things drop · spawn: time between them · cap: catcher's top speed · reach: catch half-width */
  sweep:  { easy: { fall: 0.85, spawn: 1, cap: 0.37, reach: 26 }, standard: { fall: 1, spawn: 1, cap: 0.34, reach: 24 }, tricky: { fall: 1.1, spawn: 0.95, cap: 0.34, reach: 24 } },
  /* speed: the street's pace · spawn: time per stretch of street · dog: how often the dog is out */
  runner: { easy: { speed: 0.88, spawn: 1, dog: 0.7 }, standard: { speed: 1, spawn: 1, dog: 1 }, tricky: { speed: 1.12, spawn: 1, dog: 1.1 } },
};
export const JOB_TIER_SAYS = {
  stack:  { easy: 'A slower swing — square still takes the same good eye.', standard: 'The shift as it comes.', tricky: 'A faster swing, and square means square.' },
  trim:   { easy: 'Lighter loads, more time, a steadier boat.', standard: 'The shift as it comes.', tricky: 'Heavier loads, faster, and she leans sooner.' },
  sweep:  { easy: 'It drifts down slower, and you reach a little wider.', standard: 'The shift as it comes.', tricky: 'It falls faster and thicker.' },
  runner: { easy: 'A gentler pace, and the dog mostly naps.', standard: 'The shift as it comes.', tricky: 'A quicker street and a busier dog.' },
};
/* Each level's own par, per job, measured with the headless players
   (test/tiers.mjs replays them). Standard is the par in JOB_GAME above. */
export const JOB_PARS = {
  crates:    { easy: 39, tricky: 36 }, haul:      { easy: 39, tricky: 36 }, counter:   { easy: 40, tricky: 37 },
  cargo:     { easy: 27, tricky: 26 }, nets:      { easy: 24, tricky: 24 }, books:     { easy: 26, tricky: 25 },
  sweep:     { easy: 39, tricky: 38 }, lamplight: { easy: 36, tricky: 37 }, mend:      { easy: 36, tricky: 35 },
  flyers:    { easy: 22, tricky: 23 }, errands:   { easy: 23, tricky: 23 }, runner:    { easy: 24, tricky: 24 }, board: { easy: 23, tricky: 23 },
};
export function jobPar(id, tier = 'standard') {
  const cfg = JOB_GAME[id];
  if (!cfg) return 0;
  if (tier === 'standard') return cfg.par;
  return (JOB_PARS[id] && JOB_PARS[id][tier]) || cfg.par;
}
export function jobKnobs(id, tier = 'standard') {
  const cfg = JOB_GAME[id];
  return cfg ? JOB_TIERS[cfg.kind][TIER_IDS.includes(tier) ? tier : 'standard'] : null;
}
/* Each mechanic reports a run summary at the end of a shift; goals read it. */
export const JOB_GOALS = {
  stack: [
    { id: 'five', name: 'Five perfect drops in a row', check: (r) => r.bestCombo >= 5 },
    { id: 'square8', name: 'Eight square drops in one shift', check: (r) => r.squares >= 8 },
    { id: 'nowobble', name: 'A full shift without a wobble', check: (r) => r.finished && r.misses === 0 },
  ],
  trim: [
    { id: 'nolurch', name: 'Every load aboard and she never lurched', check: (r) => r.finished && r.lurches === 0 },
    { id: 'allright', name: 'Every load to the side that levels her', check: (r) => r.finished && r.wrong === 0 && r.lurches === 0 },
    { id: 'ten', name: 'Ten good trims in a row', check: (r) => r.bestCombo >= 10 },
  ],
  sweep: [
    { id: 'chain10', name: 'A chain of ten', check: (r) => r.bestChain >= 10 },
    { id: 'chain20', name: 'A chain of twenty', check: (r) => r.bestChain >= 20 },
    { id: 'few', name: 'Three misses or fewer all shift', check: (r) => r.finished && r.misses <= 3 && r.caught >= 10 },
  ],
  runner: [
    { id: 'nodog', name: 'The whole street without meeting the dog', check: (r) => r.finished && r.dogs === 0 },
    { id: 'ten', name: 'Ten doors in a row', check: (r) => r.bestCombo >= 10 },
    { id: 'few', name: 'Three doors missed or fewer', check: (r) => r.finished && r.missed <= 3 && r.posted >= 10 },
  ],
};
export function jobGoals(id) { const cfg = JOB_GAME[id]; return cfg ? JOB_GOALS[cfg.kind] : []; }
