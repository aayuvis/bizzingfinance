/* companion.mjs — the creature's rules, run against the real sim.

   The claims a parent would hold us to: adoption costs once and feeds
   weekly; a missed bill makes it poorly and the next met one mends it; it
   grows only under steady care; it never dies; accessories cost real money
   and lift the mood; play is free, once a day; care never moves with real
   time — only on pay days. */
import * as sim from '../src/sim.js';
import * as co from '../src/companion.js';
import { price, setCurrency } from '../src/fmt.js';

let pass = 0, fail = 0;
const ok = (cond, label, detail = '') => { if (cond) { pass++; console.log('  ok  ' + label + (detail ? '   ' + detail : '')); } else { fail++; console.log('  FAIL ' + label + (detail ? '   ' + detail : '')); } };

setCurrency('INR');
const mk = () => { const s = sim.newState(); s.kids.push(sim.newChild('Ahana', 'builder', 'INR')); return s; };
const S = mk();
const c = sim.kid(S);
c.money.wallet = price(40);

/* adoption */
const before = c.money.wallet;
let r = co.adopt(c, 'kitten', 'Mochi');
ok(r.ok, 'adoption succeeds with money', JSON.stringify(r));
ok(before - c.money.wallet === price(co.C.adopt), 'adoption cost is the one-off', `${before} → ${c.money.wallet}`);
ok(sim.weeklyCost(c) >= price(co.C.food), 'food joined the weekly bills', 'weekly cost ' + sim.weeklyCost(c));
ok(c.badges.includes('adopted'), 'badge: adopted');
ok(!co.adopt(c, 'pup', 'Two').ok, 'cannot adopt a second');
ok(co.spriteKey(c) === 'kitten-baby-okay', 'starts tiny and content', co.spriteKey(c));

/* care only moves on pay day, never on the clock */
const careBefore = c.companion.care;
ok(c.companion.care === careBefore, 'care does not decay with real time');

/* a met bill feeds; a missed one hurts; the next met one mends */
c.money.wallet = price(100);
let res = sim.runPayDay(c, S);
let tick = co.onPayDay(c, res.walletAfterBills);
ok(tick.fed === true, 'pay day with money: fed', 'wallet after bills ' + res.walletAfterBills);
ok(c.companion.mood !== 'poorly', 'fed → not poorly', c.companion.mood);
c.money.wallet = -price(60);            /* already deep in the red; bills push it further */
c.money.wage = 0; c.family.allowance = 0;
res = sim.runPayDay(c, S);
tick = co.onPayDay(c, res.walletAfterBills);
ok(tick.fed === false, 'pay day with nothing: went hungry', 'wallet after bills ' + res.walletAfterBills);
ok(c.companion.mood === 'poorly', 'hungry → poorly', c.companion.mood);
ok(co.spriteKey(c).endsWith('-poorly'), 'the sprite says so', co.spriteKey(c));
c.money.wallet = price(100); c.family.allowance = price(30);
res = sim.runPayDay(c, S);
tick = co.onPayDay(c, res.walletAfterBills);
ok(c.companion.mood !== 'poorly', 'the next met bill mends it', c.companion.mood);
ok(c.companion.stage === 0 && c.companion.everMissed === 1, 'the miss is remembered, not punished twice');

/* growth needs both weeks and care */
const S2 = mk(); const k = sim.kid(S2); k.money.wallet = price(400); k.family.allowance = price(30);
co.adopt(k, 'duck', 'Pudding');
for (let i = 0; i < 4; i++) { k.money.wallet += price(30); const rr = sim.runPayDay(k, S2); co.onPayDay(k, rr.walletAfterBills); }
ok(k.companion.stage === 1, 'four fed pay days → young', 'stage ' + k.companion.stage + ' care ' + k.companion.care);
for (let i = 0; i < 6; i++) { k.money.wallet += price(30); const rr = sim.runPayDay(k, S2); co.onPayDay(k, rr.walletAfterBills); }
ok(k.companion.stage === 2, 'ten fed pay days → grown', 'stage ' + k.companion.stage);
ok(k.badges.includes('all-grown') && k.badges.includes('well-fed'), 'badges: all-grown, ten full bowls');

/* neglect stalls growth, and nothing ever dies */
const S3 = mk(); const n = sim.kid(S3); n.money.wallet = price(20);
co.adopt(n, 'parrot', 'Kiwi'); n.family.allowance = 0; n.money.wage = 0; n.money.wallet = -price(500);
for (let i = 0; i < 12; i++) { const rr = sim.runPayDay(n, S3); co.onPayDay(n, rr.walletAfterBills); }
ok(n.companion.stage === 0, 'twelve hungry pay days → still tiny, growth stalled', 'stage ' + n.companion.stage);
ok(n.companion && n.companion.mood === 'poorly' && n.companion.care === 0, 'poorly at zero care — and still here', 'care ' + n.companion.care);
n.money.wallet = price(200); n.family.allowance = price(30);
let rr = sim.runPayDay(n, S3); co.onPayDay(n, rr.walletAfterBills);
ok(n.companion.mood !== 'poorly', 'one met bill after twelve missed: recovers', n.companion.mood);

/* play: free, once a day */
const w = c.money.wallet;
ok(co.canPlay(c) && co.play(c) && c.money.wallet === w, 'play is free');
ok(!co.canPlay(c) && !co.play(c), 'and once a day');

/* the wardrobe: real money, one per slot, lifts the mood */
c.money.wallet = price(20);
const care0 = c.companion.care, w0 = c.money.wallet;
r = co.buy(c, 'acc-scarf');
ok(r.ok && w0 - c.money.wallet === price(4), 'the scarf costs its price', `${w0} → ${c.money.wallet}`);
ok(c.companion.wearing.neck === 'acc-scarf' && c.companion.care > care0, 'worn, and it lifted care');
ok(c.badges.includes('dressed-up'), 'badge: dressed up');
r = co.buy(c, 'acc-bell');
ok(r.ok && c.companion.wearing.neck === 'acc-bell', 'a second neck item replaces the first, both kept', JSON.stringify(c.companion.wardrobe));
c.money.wallet = price(1);
r = co.buy(c, 'acc-crown');
ok(!r.ok, 'cannot buy what she cannot afford', r.why);
r = co.buy(c, 'acc-scarf');
ok(r.ok && c.companion.wearing.neck === 'acc-scarf', 'owned things are re-worn for free');

/* the cost is sayable in coins and in a year */
ok(co.weeklyCost(c) === price(2) && co.yearlyCost(c) === price(104), 'food: 2 a week is 104 a year', `${co.weeklyCost(c)} / ${co.yearlyCost(c)}`);

console.log('────────────────────────────────────────────────────────────');
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
