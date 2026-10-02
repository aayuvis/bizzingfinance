/* avatars.js — the family avatar set (FAMILY-STANDARD §5, §12, A4).

   The same 21 the Bee drew and Schedule and Maths use, as files in
   public/avatars so a child's face is the same in every Bizzing app. An
   avatar is the one picture of a child the app ever holds, and it is not a
   picture of the child. */
export const AVATAR_IDS = ['bizzy', 'melody', 'rocket', 'koi', 'panda', 'redpanda', 'snowfox', 'pengu', 'ottie',
  'capy', 'neko', 'froggy', 'robo', 'astro', 'comet', 'pixel', 'samurai', 'scopey', 'beaker', 'goldlegend', 'aryabhatta'];
export const AVATARS = Object.fromEntries(AVATAR_IDS.map((id) => [id, { id, src: `./avatars/${id}.png` }]));
export const DEFAULT_AVATAR = 'bizzy';

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
