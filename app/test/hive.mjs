/* hive.mjs — Finance in the family (FAMILY-STANDARD §1, §13; O3).

   Run: node test/hive.mjs */
const mem = {};
globalThis.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
globalThis.window = globalThis; globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {};
const family = await import('../src/family.js');
const { readFileSync, readdirSync } = await import('node:fs');
const { createHash } = await import('node:crypto');

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
const feed = () => JSON.parse(mem['bizzing.activity'] || '{"s":[]}').s;
const wallet = () => JSON.parse(mem['bizzing.wallet'] || '{"kids":{}}');
console.log('\nHive · activity, milestones and coins\n' + '─'.repeat(56));

/* the drop-ins are the family's, unedited (copied from Bizzing_Schedule d42455e) */
const sha = (f) => createHash('sha256').update(readFileSync(new URL('../src/family/' + f, import.meta.url))).digest('hex').slice(0, 16);
ok(sha('bizzing-activity.js') === 'ca4bbece761514f1' && sha('bizzing-wallet.js') === 'a081f20e9ccbc13c', 'the two drop-ins are byte-for-byte the family copies — update by copying, never editing');

/* milestones */
family.milestone('Asha', 'stop', 'Needs and wants');
ok(feed().some((x) => x.a === 'finance' && x.ev === 'stop' && x.who === 'Asha' && x.m === 0), 'a lesson finished is written to bizzing.activity as a stop milestone, worth no minutes');
family.milestone('Asha', 'world', 'The Old Harbour');
ok(feed().some((x) => x.ev === 'world'), 'reaching a new world is a world milestone');

/* coins: only the standard events, at the standard amounts */
ok(family.coins('Asha', 'answer') === 1 && family.coins('Asha', 'stop') === 5 && family.coins('Asha', 'contest') === 10 && family.coins('Asha', 'mastery') === 20, 'right answer 1 · lesson 5 · test 10 · chapter 20');
ok(family.coins('Asha', 'login') === 0 && family.coins('Asha', 'streak') === 0, 'nothing pays for logging in or for days in a row — there is no event for them');
const led = wallet().kids.asha.ledger;
ok(led.every((x) => x.a === 'finance' && ['answer', 'stop', 'contest', 'mastery'].includes(x.why)), 'every coin in the ledger came from a standard event', led.map((x) => x.why).join(','));
const fc = family.familyCoins('Asha');
ok(fc.balance === 36 && fc.week[0][0] === 'finance' && fc.week[0][1] === 36, 'the Wallet card reads the balance and the week by app', JSON.stringify(fc));

/* every call site pays a standard event */
const src = readdirSync(new URL('../src/', import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8')).join('\n');
const events = [...src.matchAll(/family\.coins\([^,]+,\s*'([a-z]+)'\)/g)].map((m) => m[1]);
ok(events.length >= 4 && events.every((e) => ['answer', 'stop', 'contest', 'mastery'].includes(e)), 'every coin call in the app names a standard event', events.join(','));
ok(!/import[^;]*sim\.js/.test(readFileSync(new URL('../src/family.js', import.meta.url), 'utf8')), "the family wrapper never touches the town's money");

/* the sample writes nothing */
const before = JSON.stringify(mem);
family.setDemo(true);
family.milestone('Riya', 'stop', 'x'); family.coins('Riya', 'stop'); family.startActivity(() => 'Riya')();
ok(JSON.stringify(mem) === before, 'the sample household writes nothing to any family feed');
family.setDemo(false);

console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
