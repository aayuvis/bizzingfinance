/* session.js — "today's three" as one short sitting (E1).

   The three are the day's work; a session plays them in order and ends on a
   card that says what was practised. Nothing is lost for stopping halfway,
   there is no timer on screen, and tomorrow's three are not a debt. Pure:
   the shell asks where to go next and whether the sitting is finished. */
export const ROUTE = {
  lesson: () => ['continue'], letter: () => ['postbox'], scam: () => ['postbox'],
  job: (c, sim) => { const j = sim.jobsToday(c).find((x) => !x.done); return j ? ['job', j.id] : ['nav', 'money']; },
  earn: (c, sim) => { const j = sim.jobsToday(c).find((x) => !x.done); return j ? ['job', j.id] : ['nav', 'arcade']; },
  game: () => ['nav', 'arcade'], board: () => ['nav', 'arcade'], jar: () => ['sub', 'jars'], goal: () => ['sub', 'goals'],
  invest: () => ['sub', 'portfolio'], town: () => ['nav', 'home'], trade: () => ['sub', 'business'],
};

export function next(c, sim) {
  const q = sim.questList(c).find((x) => !x.done && !x.claimed);
  if (!q) return null;
  const r = (ROUTE[q.kind] || (() => ['nav', 'home']))(c, sim);
  return { quest: q, act: r[0], arg: r[1] };
}

export function status(c, sim) {
  const q = sim.questList(c);
  return { done: q.filter((x) => x.done || x.claimed).length, of: q.length, finished: q.length > 0 && q.every((x) => x.done || x.claimed) };
}

/* Finish: take the pay for every finished quest and the bonus, and say what
   the sitting was. Returns the summary the closing card draws. */
export function finish(c, sim, startedAt, now = Date.now()) {
  const q = sim.questList(c);
  let paid = 0;
  q.filter((x) => x.done && !x.claimed).forEach((x) => { paid += sim.claimQuest(c, x.id) || 0; });
  paid += sim.questBonus(c) || 0;
  return { practised: q.map((x) => x.t), paid, minutes: Math.max(1, Math.round((now - startedAt) / 60000)) };
}
