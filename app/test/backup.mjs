/* backup.mjs — the four promises in backup.js, held to their word.
   A name that can leave the device is a bug, and it is the kind of bug that
   is invisible until it is a headline, so it is a test. */
import * as sim from '../src/sim.js';
import { shred, shredAll, SYNC_KEYS, NEVER_SYNCED, toFile, fromFile, fileName, consent, consented } from '../src/backup.js';
import { SCHEMA } from '../src/store.js';
import { setCurrency } from '../src/fmt.js';

let pass = 0, fail = 0;
const ok = (c, l, d = '') => { if (c) { pass++; console.log('  ok  ' + l + (d ? '   ' + d : '')); } else { fail++; console.log('  FAIL ' + l + (d ? '   ' + d : '')); } };
setCurrency('INR');
const S = sim.newState(); S.kids.push(sim.newChild('Ahana', 'builder', 'INR'));
const c = sim.kid(S); c.answers = [{ id: 'a1', blob: 'x' }];

const sh = shred(c);
ok(sh.name === undefined, 'a name never leaves the device, even shredded');
ok(sh.answers === undefined, "a recorded voice never leaves either");
ok(NEVER_SYNCED.every((k) => !(k in sh)), 'nothing on the never-synced list survives shredding', NEVER_SYNCED.join(', '));
ok(Object.keys(sh).every((k) => SYNC_KEYS.includes(k)), 'shred is an allow-list: nothing outside SYNC_KEYS gets through');
c.somethingAddedTomorrow = { secret: true };
ok(shred(c).somethingAddedTomorrow === undefined, 'a field added later is excluded by default, not included by accident');
ok(sh.money && sh.learn && sh.mastery, 'what a restore actually needs does survive');
ok(shredAll(S).kids.length === 1 && shredAll(S).kids[0].name === undefined, 'the whole household shreds the same way');

/* the file a grown-up saves is the full record, and it round-trips */
const f = toFile(S);
ok(f.includes('Ahana'), 'the saved FILE keeps the name — it is going to their own device');
const back = fromFile(f);
ok(back.ok && back.kids === 1 && sim.kid(back.state).name === 'Ahana', 'a backup restores the household it saved', JSON.stringify({ ok: back.ok, kids: back.kids }));
ok(/^bizzington-Ahana-\d{4}-\d{2}-\d{2}\.json$/.test(fileName(S)), 'the file is named so a parent can find it', fileName(S));
ok(!fromFile('nonsense').ok && fromFile('nonsense').why.length > 20, 'junk is refused with a reason a person can act on');
ok(!fromFile('{"a":1}').ok, 'a JSON file that is not a backup is refused');
ok(!fromFile(JSON.stringify({ app: 'bizzington', v: SCHEMA + 5, state: { kids: [] } })).ok, 'a NEWER backup is refused rather than silently losing what it knows');

/* consent */
ok(!consented(S), 'nothing is consented to by default');
consent(S, true); ok(consented(S), 'consent can be given');
consent(S, false);
ok(!consented(S) && S.parent.sync.deletedAt, 'withdrawing deletes rather than merely stopping');

console.log('────────────────────────────────────────────────────────────');
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
