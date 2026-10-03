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
