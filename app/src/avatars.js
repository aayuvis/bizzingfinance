/* avatars.js — a child's face (FAMILY-STANDARD §8, A4).

   The face is one of Finance's 96 (catalogue.js), through the family engine. A child
   who chose a face from the first set of 21 keeps seeing it until they choose again:
   those files stay in public/avatars as LEGACY, outside the catalogue, so nobody's
   face changes under them on an upgrade. Setup offers the 24 Commons, free to all.
   An avatar is the one picture of a child the app ever holds, and it is not a
   picture of the child. */
import { BY_ID, COMMONS } from './catalogue.js';

export const LEGACY_IDS = ['bizzy', 'melody', 'rocket', 'koi', 'panda', 'redpanda', 'snowfox', 'pengu', 'ottie',
  'capy', 'neko', 'froggy', 'robo', 'astro', 'comet', 'pixel', 'samurai', 'scopey', 'beaker', 'goldlegend', 'aryabhatta'];
export const AVATAR_IDS = COMMONS.map((a) => a.id);
export const DEFAULT_AVATAR = 'froggy';
export function avatarSrc(id) {
  if (BY_ID[id]) return BY_ID[id].thumb;
  if (LEGACY_IDS.includes(id)) return `./avatars/${id}.png`;
  return BY_ID[DEFAULT_AVATAR].art;
}
export const AVATARS = new Proxy({}, { get: (_, id) => (BY_ID[id] || LEGACY_IDS.includes(id) ? { id, src: avatarSrc(id), name: BY_ID[id] ? BY_ID[id].name : id } : undefined), has: (_, id) => !!(BY_ID[id] || LEGACY_IDS.includes(id)) });
export const avatarName = (id) => (BY_ID[id] ? BY_ID[id].name : String(id || ''));

/* Currency is a setting, never a question in setup: the device already knows
   where it is. Changeable any time in settings, and the town converts. */
export function guessCurrency(lang, tz) {
  const l = String(lang || (typeof navigator !== 'undefined' && navigator.language) || '');
  const z = String(tz || (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || '');
  const region = (l.split(/[-_]/)[1] || '').toUpperCase();
  if (region === 'IN' || /Kolkata|Calcutta/.test(z)) return 'INR';
  if (region === 'AE' || /Dubai/.test(z)) return 'AED';
  if (region === 'GB' || /London/.test(z)) return 'GBP';
  if (['DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'PT', 'AT', 'BE', 'FI', 'GR', 'LU'].includes(region) || /^Europe\//.test(z)) return 'EUR';
  if (region === 'US' || /^America\//.test(z)) return 'USD';
  return 'INR';
}
