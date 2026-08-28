/* store.js — THE SEAM.
   Today: localStorage. Tomorrow: Supabase + RLS. Callers never change.
   Two buckets, deliberately: `profile` is the household and syncs to the
   cloud; `device` is this browser's business (sound, theme) and never does. */

const KEY = 'bzf_profile';
const OLD = 'bzf_v1';
const DEV = 'bzf_device';
export const SCHEMA = 3;

function read(k, fallback) {
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fallback; }
  catch (e) { return fallback; }
}
function write(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch (e) { console.warn('storage unavailable', e); return false; }
}

let pending = null;
export const Store = {
  loadProfile() {
    let blob = read(KEY, null);
    if (!blob) { const legacy = read(OLD, null); if (legacy) blob = legacy; }
    return blob ? migrate(blob) : null;
  },
  saveProfile(blob) { clearTimeout(pending); pending = setTimeout(() => write(KEY, blob), 150); },
  saveNow(blob) { clearTimeout(pending); write(KEY, blob); },
  loadDevice(k, fb) { const d = read(DEV, {}); return d[k] === undefined ? fb : d[k]; },
  saveDevice(k, v) { const d = read(DEV, {}); d[k] = v; write(DEV, d); },
  wipe() { try { localStorage.removeItem(KEY); localStorage.removeItem(OLD); } catch (e) {} },
};

/* Versioned from the first commit so future changes are safe rather than
   brave. Each step is one small function and never reaches backwards. */
function migrate(blob) {
  if (!blob.v) blob.v = 1;
  while (blob.v < SCHEMA) {
    if (blob.v === 1) blob = v1_to_v2(blob);
    else if (blob.v === 2) blob = v2_to_v3(blob);
    else break;
  }
  return blob;
}

/* v1 was single-child and kept the child at the top level. v2 is a household:
   one parent, many children, one active. */
function v1_to_v2(old) {
  const kid = {
    id: 'k1', name: (old.child && old.child.name) || 'Friend',
    band: (old.child && old.child.band) || 'builder',
    currency: (old.child && old.child.currency) || 'INR',
    created: (old.child && old.child.created) || Date.now(),
    money: old.money, learn: old.learn, market: old.market, streak: old.streak,
    postbox: old.postbox, shop: old.shop || { owned: [] }, badges: old.badges || [],
    history: old.history || [],
  };
  return {
    v: 2, parent: { created: Date.now(), gate: false },
    kids: [kid], active: 0,
    settings: old.settings || { sound: true },
    clock: { lastSeen: Date.now() },
  };
}

/* v3 adds the curriculum's own record to each child: a per-objective mastery
   state (mastery.js) and the consequential-choice log the parent report is
   written from (decisions.js). Nothing is back-filled — a child who learned
   things in v2 has no evidence that they did, and inventing some would be
   exactly the kind of thing docs/05 exists to stop. They start unmet and
   earn it. */
function v2_to_v3(old) {
  old.kids.forEach((k) => {
    if (!k.mastery) k.mastery = { rec: {}, seen: [] };
    if (!k.decisions) k.decisions = [];
  });
  if (old.parent && old.parent.pin === undefined) old.parent.pin = null;
  old.v = 3;
  return old;
}
