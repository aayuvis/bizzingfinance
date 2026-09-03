/* keepsake.mjs — the first receipt and the morning after, against the real sim.

   A receipt is counted from the ledger: the shifts that paid for it, whether
   they covered it, the weeks they span. Only the first purchase is kept. The
   overnight card exists only on a day that flipped, once, and is never a
   penalty. */
import * as sim from '../src/sim.js';
import { SHOP } from '../src/content.js';
import { price, setCurrency, dayIndex } from '../src/fmt.js';

let pass = 0, fail = 0;
const ok = (cond, label, detail = '') => { if (cond) { pass++; console.log('  ok  ' + label + (detail ? '   ' + detail : '')); } else { fail++; console.log('  FAIL ' + label + (detail ? '   ' + detail : '')); } };
setCurrency('INR');
const mk = () => { const s = sim.newState(); s.kids.push(sim.newChild('Ahana', 'builder', 'INR')); return s; };
const cart = SHOP.find((x) => x.id === 'handcart'), box = SHOP.find((x) => x.id === 'lockbox');

/* nothing bought with nothing */
const S = mk(); const c = sim.kid(S);
ok(c.keepsakes.length === 0 && c.overnight === null, 'a new child has an empty shelf and no morning yet');
let r = sim.buyFromShop(c, cart);
ok(!r.ok, 'cannot buy the handcart on the starting float', r.why);

/* three shifts, then the handcart */
for (let i = 0; i < 3; i++) sim.earn(c, price(10), 'Stack crates for the grain seller', 'job');
const w0 = c.money.wallet;
r = sim.buyFromShop(c, cart);
ok(r.ok && w0 - c.money.wallet === price(cart.units), 'bought, at its price', `${w0} → ${c.money.wallet}`);
ok(r.receipt && c.keepsakes.length === 1, 'the first purchase is kept as a receipt');
ok(r.receipt.shifts === 3 && r.receipt.covered === true, 'the receipt counts the shifts that covered it', JSON.stringify({ shifts: r.receipt.shifts, covered: r.receipt.covered, weeks: r.receipt.weeks }));
ok(r.receipt.who === 'Ahana' && r.receipt.item === cart.name && r.receipt.price === price(cart.units), 'her name, the item, the price');
ok(c.badges.includes('first-receipt'), 'badge: the first receipt');
ok(c.shop.owned.includes('handcart'), 'and she owns it');

/* the second purchase is not a keepsake */
sim.earn(c, price(40), 'Deliver flyers for Mrs Rao', 'job');
r = sim.buyFromShop(c, box);
ok(r.ok && r.receipt === null && c.keepsakes.length === 1, 'the second purchase leaves the shelf alone');

/* the Spend jar tops up a short wallet — and only the Spend jar */
const S2 = mk(); const k = sim.kid(S2);
k.money.wallet = price(5); k.money.jars.spend = price(30); k.money.jars.save = price(100);
r = sim.buyFromShop(k, cart);
ok(r.ok && k.money.jars.spend === price(30) - (price(cart.units) - price(5)) && k.money.jars.save === price(100), 'the Spend jar covered the gap, the Save jar untouched', `spend ${k.money.jars.spend}`);
ok(r.receipt.shifts === 0 && r.receipt.covered === false, 'a receipt with no shifts says so honestly');

/* the morning after */
const today = dayIndex(Date.now());
ok(sim.touchDay(c) === false && c.overnight === null, 'same day: nothing flips, no card');
c.streak.last = today - 3;
ok(sim.touchDay(c) === true && c.overnight && c.overnight.nights === 3 && c.overnight.seen === false, 'three nights away: the card is set, unseen', JSON.stringify(c.overnight));
const snap = JSON.stringify(c.overnight);
ok(sim.touchDay(c) === false && JSON.stringify(c.overnight) === snap, 'the same day again does not re-arm it');
c.overnight.seen = true;
ok(sim.touchDay(c) === false && c.overnight.seen === true, 'dismissed stays dismissed');
ok(c.streak.days.length === 1, 'a gap resets the streak quietly — and nothing charges for it', 'days ' + c.streak.days.length);

console.log('────────────────────────────────────────────────────────────');
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
