/* art-gen.js — the drawn artwork, embedded.

   Generated with a generative IMAGE model and then hand-processed here.
   The family's production brief allows generative image models for sprites
   and plates and forbids generated motion; it also forbids generated
   lettering, so every prompt banned text and every plate was checked for it.
   Data URIs rather than files because the app is offline-first and also ships
   as one self-contained page.

   Regenerate with tools/art/ (prompts live there). Never commit the API key.
*/
export const ART = {
  'cast-pip': new URL('./art/art-gen-22b62fa0c5.webp', import.meta.url).href,
  'cast-mags': new URL('./art/art-gen-463a24134e.webp', import.meta.url).href,
  'cast-bo': new URL('./art/art-gen-e150dd676f.webp', import.meta.url).href,
  'cast-bea': new URL('./art/art-gen-25198f88d7.webp', import.meta.url).href,
  'cast-nana': new URL('./art/art-gen-ccb014e81c.webp', import.meta.url).href,
  'world-market': new URL('./art/art-gen-ef9448774b.webp', import.meta.url).href,
  'world-harbour': new URL('./art/art-gen-9983b08dad.webp', import.meta.url).href,
  'world-clock': new URL('./art/art-gen-e0492b6db4.webp', import.meta.url).href,
  'world-exchange': new URL('./art/art-gen-db5ea924db.webp', import.meta.url).href,
  'world-works': new URL('./art/art-gen-36528731ba.webp', import.meta.url).href,
};
export function art(k) { return ART[k] || null; }
