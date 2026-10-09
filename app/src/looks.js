/* looks.js — the six worlds of Bizzing Money (FAMILY-STANDARD §7).

   A world is a complete dress for the app, drawn from the town itself: a painted
   place by day and the SAME place painted again by night (lamps lit, windows warm),
   its own accent, its own ambient life (ambient.js), its own music (music.js) and two
   avatar packs (catalogue.js, packs 2n−1 and 2n).

   Worlds 1 and 2 are open to everyone. Worlds 3–6 open with the family plan, or one at
   a time for 240 Bizzing coins through the family engine (buyWorld) — never with the
   town's money, never by chance.

   The journey's five places (content.js WORLDS) are the same places, so the street
   and the Continue card paint each place with these plates too, and at night they
   swap to the night plate: never a daylight painting on a dark page. */
import { worldOpen, WORLD_PRICE } from './family/bizzing-avatars.js';

/* absolute, because a url() inside a CSS custom property resolves against the
   stylesheet that USES it (assets/…), not the page — a relative path 404s there */
const P = (f) => (typeof document !== 'undefined' ? new URL(`./worlds/${f}.webp`, document.baseURI).href : `./worlds/${f}.webp`);

export const LOOKS = [
  { n: 1, id: 'market', name: 'Market Row Morning', place: 'market', line: 'Striped awnings and the first baskets of the day.',
    accent: ['#A8461F', '#F2A77E'], tint: '#FBE7DA', ambient: { particles: 'petals', idle: 'barrowmole', idleKind: 'walk' }, music: 'market' },
  { n: 2, id: 'harbour', name: 'Old Harbour', place: 'harbour', line: 'Gulls, ropes and the lighthouse on the point.',
    accent: ['#00798A', '#3FBCC8'], tint: '#DDF3F4', ambient: { particles: 'spray', idle: 'sailboat', idleKind: 'sail' }, music: 'harbour' },
  { n: 3, id: 'clock', name: 'Clocktower Square', place: 'clock', line: 'The fountain, the plane trees and the clock that keeps pay day.',
    accent: ['#5B4FA8', '#A99FEB'], tint: '#E9E6FA', ambient: { particles: 'leaves', idle: 'tinrobin', idleKind: 'hop' }, music: 'clock' },
  { n: 4, id: 'exchange', name: 'Exchange Quarter', place: 'exchange', line: 'Columns, wide steps and a dome that catches the sun.',
    accent: ['#2D6A8F', '#7FC0E6'], tint: '#DFEEF8', ambient: { particles: 'motes', idle: 'magpie', idleKind: 'fly' }, music: 'exchange' },
  { n: 5, id: 'works', name: 'The Works', place: 'works', line: 'Brick kilns, a timber yard and the water wheel turning.',
    accent: ['#9A4A1C', '#EE9F6E'], tint: '#F8E4D6', ambient: { particles: 'smoke', idle: 'steamengine', idleKind: 'walk' }, music: 'works' },
  { n: 6, id: 'festival', name: 'Festival Night', place: null, line: 'Lanterns in the park, the bandstand and the lake.',
    accent: ['#7B3FA0', '#C9A2EC'], tint: '#F1E6FA', ambient: { particles: 'fireflies', idle: 'kite', idleKind: 'float' }, music: 'festival' },
].map((w) => ({ ...w, day: P(`${w.id}-day`), night: P(`${w.id}-night`), thumbDay: P(`${w.id}-day-thumb`), thumbNight: P(`${w.id}-night-thumb`) }));

export const LOOK_BY_PLACE = Object.fromEntries(LOOKS.filter((w) => w.place).map((w) => [w.place, w]));
export const lookById = (id) => LOOKS.find((w) => w.id === id) || LOOKS[0];
export { WORLD_PRICE };

/* ctx as catalogue.ctxFor gives it: { worlds, plan } */
export const isOpen = (w, ctx) => worldOpen(w.n, ctx || {});
export function openSay(w, ctx) {
  if (isOpen(w, ctx)) return w.n <= 2 ? 'Open to everyone' : 'Yours';
  return `Opens with the family plan, or ${WORLD_PRICE} coins`;
}

/* The plate for a place right now: the night painting on a dark page. */
export function plateFor(placeId, dark) {
  const w = LOOK_BY_PLACE[placeId] || LOOKS.find((x) => x.id === placeId) || LOOKS[0];
  return dark ? w.night : w.day;
}

/* Paint the page in a world: the accent tokens on <html>, light and dark. The text
   on every accent is measured AA in test/browser.mjs. */
export function applyLook(w, dark) {
  if (typeof document === 'undefined') return;
  const h = document.documentElement, st = h.style;
  h.setAttribute('data-world', w.id);
  const a = dark ? w.accent[1] : w.accent[0];
  st.setProperty('--action', a);
  st.setProperty('--action-hi', dark ? w.accent[1] : w.accent[0]);
  st.setProperty('--action-ink', dark ? '#141019' : '#FFFFFF');
  st.setProperty('--action-tint', dark ? `color-mix(in srgb, ${w.accent[1]} 18%, #101820)` : w.tint);
  st.setProperty('--world-plate', `url(${dark ? w.night : w.day})`);
}
