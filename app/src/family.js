/* family.js — the one place this app speaks to the rest of the family
   (FAMILY-STANDARD §1, §13; O3).

   The two drop-ins in src/family/ are copied unchanged from the
   Bizzing_Schedule repo's integration/ folder: they own the shared keys
   bizzing.activity and bizzing.wallet, and they are the only code in this app
   that writes outside the Store seam — by design, because the keys belong to
   the family, not to Finance. Update them by copying again, never by editing.

   Two promises this wrapper keeps:
   · The sample household (?demo) never writes to a family feed.
   · Family coins are paid only for the standard learning events, at the
     standard amounts, through earn(). They are shown in Finance as income
     from the family's apps and never mixed into the town's own money — the
     town's money is the curriculum (CLAUDE.md rule 4); coins are the family's
     reward for learning. */
import { trackActivity, trackMilestone } from './family/bizzing-activity.js';
import { earn as walletEarn, balance, ledger } from './family/bizzing-wallet.js';

export const APP = 'finance';
let demo = false, demoLed = [];
/* the sample's coins live in memory only: a ledger built from the standard events it played */
export function setDemo(v, sample) { demo = !!v; demoLed = (demo && sample) || []; }
export function coinBalance(who) { return demo ? demoLed.reduce((t, x) => t + x.n, 0) : balance(who); }
export function coinLedger(who) { return demo ? demoLed.slice() : ledger(who); }

export function startActivity(getName) { return demo ? () => {} : trackActivity(APP, getName); }
export function milestone(who, ev, label) { if (!demo && who) trackMilestone(APP, who, ev, label); }
/* events: 'answer' (1) · 'stop' (5) · 'contest' (10) · 'mastery' (20) */
export function coins(who, event) { return demo || !who ? 0 : walletEarn(APP, who, event); }

/* What the family wallet says, for the Wallet screen: the balance and this
   week's earnings by app. Read-only. */
export function familyCoins(who, now = Date.now()) {
  if (!who) return { balance: 0, week: [] };
  const since = now - 7 * 864e5, by = {};
  coinLedger(who).filter((x) => x.t >= since && x.n > 0).forEach((x) => { by[x.a] = (by[x.a] || 0) + x.n; });
  return { balance: coinBalance(who), week: Object.entries(by).sort((a, b) => b[1] - a[1]) };
}
