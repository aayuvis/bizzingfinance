/* answers.js — the week's question, answered out loud and kept.

   India records a grandparent telling a story and keeps it on the device,
   counting plays as love rather than as repetition. The same, for money: the
   week's "Ask at home" question already exists on Home; this lets the answer
   be kept in the voice that gave it.

   The rules are India's, and they are not negotiable here either:
   · The microphone opens ONLY from an explicit tap, and the track is stopped
     the instant recording ends — no hot mic, ever.
   · The audio goes straight to IndexedDB on this device (store.js) and is on
     backup.js's NEVER_SYNCED list, so it cannot leave even when a server
     exists.
   · The play count goes up and never down. It is counted as love, not as
     repetition, and nothing anywhere nags about it.
   · Deleting confirms, and deleting means gone. */

import { Store } from './store.js';
import { askOfWeek } from './daily.js';
import { dayIndex } from './fmt.js';

export const MAX_SECONDS = 180;
export function supported() {
  return typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    && typeof MediaRecorder !== 'undefined' && typeof indexedDB !== 'undefined';
}
export function list(c) { return (c.answers || []).slice().sort((a, b) => b.t - a.t); }
export function weekAnswered(c, d) {
  const wk = Math.floor((d == null ? dayIndex(Date.now()) : d) / 7);
  return (c.answers || []).some((a) => a.week === wk);
}

/* One live recorder at a time, and it owns its track. */
let live = null;
export async function begin() {
  if (!supported()) throw new Error('This device cannot record.');
  if (live) stop();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((m) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  live = { rec, stream, chunks, started: Date.now(), mime: mime || 'audio/webm' };
  rec.start();
  return live;
}
export function elapsed() { return live ? (Date.now() - live.started) / 1000 : 0; }
export function recording() { return !!live && live.rec.state === 'recording'; }
/* Stopping ALWAYS stops the track, even on the error paths — a stream left
   open is a microphone left on, and there is no acceptable reason for one. */
function release(l) { try { l.stream.getTracks().forEach((t) => t.stop()); } catch (e) {} }
export function stop() {
  const l = live; live = null;
  if (!l) return Promise.resolve(null);
  return new Promise((res) => {
    l.rec.onstop = () => { release(l); res(new Blob(l.chunks, { type: l.mime })); };
    try { if (l.rec.state !== 'inactive') l.rec.stop(); else { release(l); res(new Blob(l.chunks, { type: l.mime })); } }
    catch (e) { release(l); res(null); }
  });
}
export function cancel() { const l = live; live = null; if (l) { try { l.rec.stop(); } catch (e) {} release(l); } }

export async function keep(c, blob, who) {
  if (!blob || !blob.size) return null;
  const id = 'a' + Date.now().toString(36);
  await Store.putClip(id, blob);
  const rec = { id, t: Date.now(), week: Math.floor(dayIndex(Date.now()) / 7), q: askOfWeek(), who: String(who || '').trim().slice(0, 24), plays: 0, type: blob.type, size: blob.size };
  if (!c.answers) c.answers = [];
  c.answers.push(rec);
  return rec;
}
export async function url(id) {
  const blob = await Store.getClip(id);
  return blob ? URL.createObjectURL(blob) : null;
}
export function played(c, id) {
  const r = (c.answers || []).find((a) => a.id === id);
  if (r) r.plays = (r.plays || 0) + 1;      /* up, never down */
  return r;
}
export async function remove(c, id) {
  await Store.delClip(id).catch(() => {});
  c.answers = (c.answers || []).filter((a) => a.id !== id);
}
