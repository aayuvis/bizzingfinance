/* wages.mjs — K2/K10: games pay for practice, not for farming; no work, no wage.
   Run: node test/wages.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) {} };
const sim = await import('../src/sim.js');
let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nWages · capped by the day, and nothing for nothing\n' + '─'.repeat(56));
const s = sim.newState(); const c = sim.newChild('Ira', 'builder', 'INR'); s.kids.push(c);
const t = Date.UTC(2026, 9, 2, 10);
const paid = [1, 2, 3, 4, 5].map(() => sim.gameWage(c, 'Change Rush', 10, t).paid);
ok(paid.slice(0, 3).every((x) => x > 0) && paid.slice(3).every((x) => x === 0), `a game pays its first ${sim.GAME_PAYS} plays of a day, then practice is free`, paid.join(','));
ok(sim.gameWage(c, 'Stall Rush', 10, t).paid > 0, 'the cap is per game, not across the arcade');
ok(sim.gameWage(c, 'Change Rush', 10, t + 864e5).paid > 0, 'a new day pays again — nothing is lost for a day off');
const w0 = c.money.wallet;
ok(sim.doJob(c, 'crates', 0) === 0 && c.money.wallet === w0, 'a shift with nothing done pays nothing');
/* a best from the old scale is not one a child can beat: it reads as none, the first new shift sets it */
{
  const k = sim.newChild('Old', 'builder', 'INR'); k.jobs.best = { crates: 900 };
  ok(sim.jobBest(k, 'crates') === 0, 'a best from the old scoring scale reads as none');
  ok(sim.setJobBest(k, 'crates', 30) === true && sim.jobBest(k, 'crates') === 30, 'the first shift on the new scale sets the best');
  ok(sim.setJobBest(k, 'crates', 20) === false && sim.jobBest(k, 'crates') === 30, 'and only a higher score beats it');
}
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
