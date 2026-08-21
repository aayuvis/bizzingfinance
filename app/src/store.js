/* store.js — THE SEAM.
   Today: localStorage. Tomorrow: Supabase. Callers never change.
   Split is deliberate: `profile` syncs to the cloud, `device` never does. */

const KEY = 'bzf_v1';
const DEV = 'bzf_device';
export const SCHEMA = 1;

function read(k, fallback) {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function write(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch (e) { return false; }
}

let pending = null;
export const Store = {
  loadProfile() { return migrate(read(KEY, null)); },
  saveProfile(blob) {
    clearTimeout(pending);
    pending = setTimeout(() => write(KEY, blob), 120);
  },
  saveNow(blob) { clearTimeout(pending); write(KEY, blob); },
  loadDevice(k, fb) { return read(DEV, {})[k] ?? fb; },
  saveDevice(k, v) { const d = read(DEV, {}); d[k] = v; write(DEV, d); },
  wipe() { try { localStorage.removeItem(KEY); } catch (e) {} },
};

/* Formalised from commit one so future changes are safe. */
function migrate(blob) {
  if (!blob) return null;
  if (!blob.v) blob.v = SCHEMA;
  // future: while (blob.v < SCHEMA) { ...; blob.v++ }
  return blob;
}
