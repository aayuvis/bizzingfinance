/* backup.js — the household, out and back, and what a sync would be allowed
   to carry if there were ever a server.

   There is no server. Saying so is the honest half of this file: what exists
   today is a file a grown-up saves and a file they restore, which is a real
   backup and needs nobody's permission. The other half is the SHAPE the
   server swap has to take when it comes, written now while it is cheap —
   Bee's pattern, which is worth copying exactly:

   · Consent is its own screen, behind the PIN, and nothing leaves the device
     before it is given.
   · An ALLOW-LIST decides what may leave, not a block-list. `shred()` returns
     a copy carrying only the keys named here, so a field added tomorrow is
     excluded by default rather than included by accident.
   · A child's NAME and AGE BAND never leave, even with consent. They are not
     on the allow-list and there is nowhere to put them, which is what makes
     the promise structural instead of a policy.
   · Withdrawing consent deletes, it does not merely stop.

   `test/backup.mjs` holds all four of those to their word. */

import { SCHEMA } from './store.js';

/* Everything a restore needs to rebuild a town, and nothing that identifies
   a child. Add a key here only when you have decided it may leave the
   device — the default is that it may not. */
export const SYNC_KEYS = [
  'id', 'band', 'currency', 'created',
  'money', 'learn', 'market', 'biz', 'venture', 'streak', 'postbox',
  'companion', 'keepsakes', 'deeds', 'shop', 'jobs', 'home', 'world',
  'fix', 'quests', 'mastery', 'decisions', 'badges', 'history', 'family',
  'puzzle', 'maths', 'overnight',
];
/* Named so the omission is deliberate and greppable rather than an oversight. */
export const NEVER_SYNCED = ['name', 'answers'];

export function shred(kid) {
  const out = {};
  SYNC_KEYS.forEach((k) => { if (kid[k] !== undefined) out[k] = kid[k]; });
  return out;
}
export function shredAll(state) {
  return { v: state.v || SCHEMA, at: Date.now(), kids: (state.kids || []).map(shred) };
}

/* ── the file a grown-up saves ────────────────────────────────────────────
   The full household, names and all: it is going to their own device, and a
   backup that loses the child's name is not a backup. This is the one place
   the whole record is written out, and it never leaves by itself. */
export function toFile(state) {
  return JSON.stringify({ app: 'bizzington', v: state.v || SCHEMA, at: Date.now(), state }, null, 2);
}
export function fileName(state) {
  const names = (state.kids || []).map((k) => String(k.name || '').replace(/[^A-Za-z0-9]/g, '')).filter(Boolean).join('-');
  const d = new Date().toISOString().slice(0, 10);
  return `bizzington-${names || 'household'}-${d}.json`;
}
/* Reading one back is the risky direction, so it is the strict one: the file
   says what it is, or it is refused with a reason a person can act on. */
export function fromFile(text) {
  let blob;
  try { blob = JSON.parse(text); } catch (e) { return { ok: false, why: 'That file is not a Bizzington backup — it is not readable as one.' }; }
  if (!blob || blob.app !== 'bizzington' || !blob.state) return { ok: false, why: 'That is a JSON file, but not a Bizzington backup.' };
  const st = blob.state;
  if (!st.kids || !Array.isArray(st.kids)) return { ok: false, why: 'The backup has no household in it.' };
  if ((blob.v || 0) > SCHEMA) return { ok: false, why: `That backup was made by a newer Bizzington (v${blob.v}). Update the app first — restoring it here would lose what it knows.` };
  return { ok: true, state: st, kids: st.kids.length, at: blob.at || 0 };
}

/* ── consent, for the day there is a server ───────────────────────────── */
export function consented(state) { return !!(state.parent && state.parent.sync && state.parent.sync.consent); }
export function consent(state, on) {
  state.parent.sync = state.parent.sync || {};
  state.parent.sync.consent = !!on;
  state.parent.sync.at = Date.now();
  /* withdrawing DELETES rather than stops: there is nothing uploaded today,
     so this is the local half of a promise the server half must keep. */
  if (!on) state.parent.sync.deletedAt = Date.now();
  return state.parent.sync;
}
