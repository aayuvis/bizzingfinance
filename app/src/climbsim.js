/* climbsim.js — Compound Climb's year and its score, with no screen in it (docs/12 §2.4).

   The year (the retune, e234395, kept): the expected return rises with the charge and PEAKS
   in the middle (about 60%), while the swing grows much faster (charge^3.2), so a high charge
   brings down years and, at full charge, a real chance of being wiped out.

   The score is the DECISION, never the tower (CONCEPT §6.3), out of ten:
     survived fifteen years            3   risk control
     over the line                     2
     …with the least swing             2   the share of years charged in the steady band
     estimates close                   3   understanding compounding (The Snowball, merged in)

   The estimate: every five years, before the climb goes on, the child drags a marker to where
   the tower will be in five more years AT A STEADY CHARGE. The answer is not luck — it is the
   steady year compounded five times from where the tower stands — so it can be scored by
   closeness, and the bands (where a steady charge usually lands) are shown after. Every dial
   here is the town's own, registered in sources.js ('climb'). */
import { rng } from './ui.js';

/* Compound Climb (docs/12 §2.4) — a year's growth is mean(charge) + draw × vol(charge): the mean
   peaks in the middle (mean[0]·c − mean[1]·c², 10.8% at 60%), the swing grows far faster
   (vol[0]·c^vol[1]). An estimate every five years (CHECKS) looks AHEAD years at a STEADY charge;
   a year charged at or under BAND is a steady one; CLOSE is how far off an estimate can be and
   still score. The town's own growth, registered in sources.js ('climb'). */
export const CLIMB = {
  YEARS: 15, START: 100, RUIN: 20,
  CHECKS: [5, 10], AHEAD: 5, STEADY: 0.55, BAND: 70, CLOSE: Math.log(1.5),
  mean: [0.36, 0.30], vol: [0.7, 3.2],
};
export const CC = CLIMB;
export const CC_POINTS = { survived: 3, target: 2, steady: 2, estimate: 3 };
export const CC_MAX = CC_POINTS.survived + CC_POINTS.target + CC_POINTS.steady + CC_POINTS.estimate;

export function ccMean(ch) { return CC.mean[0] * ch - CC.mean[1] * ch * ch; }     /* 0 → 10.8% at 60% → 6% at full */
export function ccVol(ch) { return CC.vol[0] * Math.pow(ch, CC.vol[1]); }        /* 1% at 25%, 10% at 55%, 41% at 85%, 70% at full */
/* a year, as a pure function of the charge (0–1) and one draw in [−1, 1] */
export function ccYear(ch, draw) { return ccMean(ch) + draw * ccVol(ch); }

/* where a steady charge lands five years on, as multiples of today: the expected path (the
   steady year compounded — the answer an estimate is scored against) and the band most
   paths fall in (the 10th to the 90th of 4,000 played with the game's own draw) */
export const CC_BANDS = (() => {
  const r = rng(20261009), xs = [];
  for (let k = 0; k < 4000; k++) {
    let v = 1;
    for (let y = 0; y < CC.AHEAD; y++) v *= 1 + ccYear(CC.STEADY, r() + r() - 1);
    xs.push(v);
  }
  xs.sort((a, b) => a - b);
  return { lo: xs[Math.floor(xs.length * 0.1)], mid: Math.pow(1 + ccMean(CC.STEADY), CC.AHEAD), hi: xs[Math.floor(xs.length * 0.9)] };
})();
export function ccBands(money) {
  return { lo: Math.round(money * CC_BANDS.lo), mid: Math.round(money * CC_BANDS.mid), hi: Math.round(money * CC_BANDS.hi) };
}
/* how close an estimate is, 0–1: exact is 1; half as far again, or two-thirds of it, is 0 */
export function ccClose(est, mid) {
  if (!(est > 0) || !(mid > 0)) return 0;
  return Math.max(0, 1 - Math.abs(Math.log(est / mid)) / CC.CLOSE);
}
/* the round's score, from what the child decided */
export function ccScore({ ruined, years, reached, charges = [], estimates = [] }) {
  const P = CC_POINTS;
  const survived = !ruined && years >= CC.YEARS ? P.survived : 0;
  const target = reached ? P.target : 0;
  const steadyShare = charges.length ? charges.filter((c) => c <= CC.BAND).length / CC.YEARS : 0;
  const steady = reached ? P.steady * steadyShare : 0;
  const est = CC.CHECKS.length ? (P.estimate * estimates.reduce((t, e) => t + (e.close || 0), 0)) / CC.CHECKS.length : 0;
  const points = Math.round((survived + target + steady + est) * 10) / 10;
  return { survived, target, steady: Math.round(steady * 10) / 10, estimate: Math.round(est * 10) / 10, points, max: CC_MAX };
}
