/* buildings-gen.js — the town's buildings, painted.

   Generated with a generative IMAGE model in the same style bible as the
   world plates, then cropped, alpha-keyed and embedded here — the family's
   production brief allows generated sprites and plates and forbids generated
   motion and generated lettering. Every dynamic zone (the Jar Shed's window,
   the Bank's clock, the Exchange's board, the Build Yard's scaffold) is
   painted BLANK on purpose: the app draws the child's real state into it,
   because a sprite that painted a state would be a lie the first time the
   state changed.

   Regenerate with tools/art/buildings.py + process-buildings.py.
   Never commit the API key. */

export const BLD = {
  'bank': { w: 380, h: 262, src: new URL('./art/buildings-gen-a036f7f833.webp', import.meta.url).href },
  'exchange': { w: 380, h: 358, src: new URL('./art/buildings-gen-33f1d4c846.webp', import.meta.url).href },
  'home-0': { w: 380, h: 367, src: new URL('./art/buildings-gen-f6f5c60e14.webp', import.meta.url).href },
  'home-1': { w: 380, h: 278, src: new URL('./art/buildings-gen-63ba0b19b7.webp', import.meta.url).href },
  'home-2': { w: 380, h: 390, src: new URL('./art/buildings-gen-769e952738.webp', import.meta.url).href },
  'home-3': { w: 380, h: 297, src: new URL('./art/buildings-gen-14b911370a.webp', import.meta.url).href },
  'home-4': { w: 380, h: 298, src: new URL('./art/buildings-gen-8a75f243f2.webp', import.meta.url).href },
  'jars': { w: 380, h: 316, src: new URL('./art/buildings-gen-c5d0bd713f.webp', import.meta.url).href },
  'lantern': { w: 96, h: 153, src: new URL('./art/buildings-gen-0d8634199b.webp', import.meta.url).href },
  'postbox': { w: 220, h: 402, src: new URL('./art/buildings-gen-3f280a175c.webp', import.meta.url).href },
  'shop': { w: 380, h: 292, src: new URL('./art/buildings-gen-633e8b3d53.webp', import.meta.url).href },
  'stall': { w: 380, h: 288, src: new URL('./art/buildings-gen-3a7135eab5.webp', import.meta.url).href },
  'yard': { w: 380, h: 432, src: new URL('./art/buildings-gen-793e7f6e3f.webp', import.meta.url).href },
};

/* Dynamic zones, as FRACTIONS of each sprite's box, measured from the
   pixels by tools/art/measure-zones.py (with the two the detectors could not
   separate proofed by eye against an overlay sheet). Fractions, so a resize
   or regeneration cannot silently strand them. */
export const ZONES = {
 'bank': [
  0.4955544200306592,
  0.22782183354331875,
  0.05263157894736842
 ],
 'exchange': [
  0.315,
  0.115,
  0.705,
  0.4
 ],
 'jars': [
  0.14210526315789473,
  0.3227848101265823,
  0.6473684210526316,
  0.6075949367088608
 ],
 'yard': [
  0.16,
  0.12,
  0.84,
  0.86
 ],
 'shop': [
  0.28,
  0.135,
  0.78,
  0.26
 ]
};
