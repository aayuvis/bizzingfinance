/* avatars.mjs — Finance's 96 through the family engine (FAMILY-STANDARD §8, J1/J4/J5/K5).

   Run: node test/avatars.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
const { CATALOGUE, PACKS, validate, stateOf, ctxFor, milestonesOf, MILESTONES, COMMONS } = await import('../src/catalogue.js');
const { sacredSafe, buy, buyWorld } = await import('../src/family/bizzing-avatars.js');
const { earn, balance } = await import('../src/family/bizzing-wallet.js');
const sim = await import('../src/sim.js');
const { existsSync, readdirSync, readFileSync } = await import('node:fs');

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nAvatars · 96 through the family engine\n' + '─'.repeat(56));

const errs = validate(CATALOGUE);
ok(errs.length === 0, 'validate(CATALOGUE) returns []', errs.slice(0, 3).join(' | '));
ok(CATALOGUE.length === 96 && PACKS.length === 12, '96 avatars in 12 packs of 8');
ok(sacredSafe(CATALOGUE, []).length === 0 && !CATALOGUE.some((a) => a.real || a.sacred), 'no sacred figures or real people in Finance’s set');
const pub = new URL('../public/', import.meta.url);
const missing = CATALOGUE.filter((a) => !existsSync(new URL(a.art.replace('./', ''), pub)));
ok(!missing.length, 'every face is a file that ships', missing.slice(0, 4).map((a) => a.id).join(' '));
ok(!CATALOGUE.some((a) => a.id === 'koi'), 'the koi stays with Maths');
/* no face shared with a sibling's 96: Maths' packs and Bee's kept packs */
const SIBLING = ['koi', 'bizzy', 'panda', 'samurai', 'neko', 'rocket', 'astro', 'comet', 'robo', 'beaker', 'scopey', 'snowfox', 'aryabhatta', 'ottie'];
ok(!CATALOGUE.some((a) => SIBLING.includes(a.id)), 'no face from a sibling’s collection is in Finance’s 96');
ok(Object.keys(MILESTONES).length >= 12 && CATALOGUE.filter((a) => a.tier === 'legendary').every((a) => MILESTONES[a.milestone.id]), 'every Legendary names a milestone the record can measure');
ok(COMMONS.length === 24, '24 Commons, free to every child');

/* the paths a card states, in plain words */
const s = sim.newState(); const c = sim.newChild('Tara', 'builder', 'INR'); s.kids.push(c);
const ctx = ctxFor(s, c);
const say = (id) => stateOf(CATALOGUE.find((a) => a.id === id), ctx).say;
ok(say('mango') === 'Free for everyone', 'a Common says “Free for everyone”', say('mango'));
ok(/^120 coins/.test(say('corg')), 'a Rare in an open world states its price', say('corg'));
ok(say('tinrobin') === 'Opens with its world', 'a face in a closed world says it opens with its world', say('tinrobin'));
ok(/^First: Finish “What money even is”/.test(say('uni')), 'a Legendary names its milestone first', say('uni'));
ok(CATALOGUE.every((a) => stateOf(a, ctx).say && !/[₹$£€]|AED|price in/i.test(stateOf(a, ctx).say)), 'every card states its path, and never a real-money price');

/* buying: coins only, through the wallet — never the town's money */
for (let i = 0; i < 30; i++) earn('finance', 'Tara', 'stop', Date.now() - i * 864e5);
const before = c.money.wallet;
ok(balance('Tara') >= 120, 'the child has earned family coins for learning', String(balance('Tara')));
ok(buy('finance', 'Tara', CATALOGUE.find((a) => a.id === 'corg'), ctx), 'a Rare is bought with Bizzing coins');
ok(c.money.wallet === before, 'the town’s money is untouched by buying a face');
ok(!buyWorld('finance', 'Tara', 2, ctx), 'worlds 1–2 are open to everyone and cannot be bought');
const src = readFileSync(new URL('../src/catalogue.js', import.meta.url), 'utf8');
ok(!/money\.wallet|sim\.earn|sim\.spend|Math\.random/.test(src.replace(/\/\*[\s\S]*?\*\//g, '')), 'the catalogue never touches town money and holds nothing random');

/* milestones move only on learning */
ok(milestonesOf(c).length === 0, 'a new child has no milestones');
const { CHAPTERS } = await import('../src/content.js');
CHAPTERS[0].cards.slice(0, -1).forEach((k) => { c.learn.done[k.id] = true; });
ok(!milestonesOf(c).includes('ch-c1'), 'a chapter with one stop unread has not met its milestone');
c.learn.done[CHAPTERS[0].cards.at(-1).id] = true;
ok(milestonesOf(c).includes('ch-c1'), 'finishing a chapter meets its milestone');

/* C3 · a second child never inherits the first's faces, worlds or coins */
{
  const k2 = sim.newChild('Dev', 'builder', 'INR'); s.kids.push(k2);
  c.fam.owned.push('corg');
  ok(!k2.fam.owned.includes('corg') && k2.fam.owned !== c.fam.owned, 'a face bought by one child is not in the other child’s collection');
  ok(balance('Dev') === 0 && balance('Tara') > 0, 'coins are kept per child');
  ok(stateOf(CATALOGUE.find((a) => a.id === 'corg'), ctxFor(s, k2)).state !== 'owned', 'the switcher’s second child sees their own path, not the first child’s');
}


/* A4 · the family plan: a cited price, contents computed, and a device flag that opens nothing */
{
  const { PLAN, priceFor, contents } = await import('../src/plan.js');
  const sim = await import('../src/sim.js');
  const s = sim.newState(); const k = sim.newChild('Asha', 'builder', 'INR'); s.kids.push(k);
  s.settings.plan = 'family'; s.settings.tester = false;
  ok(ctxFor(s, k).plan === 'free', 'a family-plan flag on the device opens nothing without the server (or tester preview)');
  s.settings.tester = true;
  ok(ctxFor(s, k).plan === 'family', 'tester mode can preview it');
  const c = contents();
  ok(c.worlds.length === 4 && c.packs.length === 8 && c.faces === 64, 'the plan opens worlds 3–6, eight packs, 64 faces — counted from the catalogue', `${c.worlds.length} · ${c.packs.length} · ${c.faces}`);
  ok(/\$99/.test(priceFor('USD')) && /2,999/.test(priceFor('INR')) && /not set/.test(priceFor('GBP')), 'the price is the family pass, and no currency is invented');
  ok(PLAN.onSale === false && /docs\/06/.test(PLAN.source), 'it says where the price comes from, and that it is not on sale');
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
