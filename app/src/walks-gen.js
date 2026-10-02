/* walks-gen.js — one painted panorama per world for the Atlas walk
   (tools/art/walks.py). `road` is the fraction down the image where the road
   runs, MEASURED from the drawing — the stops stand on it, and a hand-typed
   number puts them in the sky. Regenerate with tools/art/process-walks.py. */

export const WALKS = {
  'market': { w: 1400, h: 594, road: 0.912, src: new URL('./art/walks-gen-16812f1af8.webp', import.meta.url).href },
  'harbour': { w: 1400, h: 594, road: 0.912, src: new URL('./art/walks-gen-7ddb308e5b.webp', import.meta.url).href },
  'clock': { w: 1400, h: 594, road: 0.912, src: new URL('./art/walks-gen-ee18ed261e.webp', import.meta.url).href },
  'exchange': { w: 1400, h: 594, road: 0.844, src: new URL('./art/walks-gen-ef28e87496.webp', import.meta.url).href },
  'works': { w: 1400, h: 594, road: 0.912, src: new URL('./art/walks-gen-a4e0ee3b4d.webp', import.meta.url).href },
};
