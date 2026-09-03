"""tree.py — the Money Tree, in six stages of growth.

The Tamagotchi the subject already contains: compounding is a creature that
grows while you leave it alone. The tree IS the child's Grow money — fed by
real deposits, sheltered by real diversification, shrunk by real withdrawals
— and it is drawn as a sprite beside her house, in the plates' own style, so
it can be composited at any stage the sim reports.

Six stages, one sprite each. Same rules as buildings.py: cream field for
keying, no text, no scenery, a single object.
"""
import os, sys, time
from gen import call, BIBLE

SPRITE = ("One single object, whole and centred, seen straight on at ground level, on a plain "
          "flat solid cream background #FFFCF5 with nothing else — no ground plane, no sky, no "
          "scenery beyond a soft small contact shadow. Fills most of the frame with a small margin. ")
STAGES = [
  ('tree-0', "A small mound of dark warm soil with one gold-brown seed half-visible on top, and a tiny wooden garden marker stick beside it. Nothing has sprouted yet."),
  ('tree-1', "A tiny green sprout with two round seed-leaves pushing up from a small mound of dark soil. Fresh, hopeful, very small."),
  ('tree-2', "A young sapling about knee-high: a slim trunk, a few soft green leaves, tied gently to a small wooden stake with twine. Soil mound at the base."),
  ('tree-3', "A young tree, slender trunk, a round leafy crown of soft sage and olive greens, small enough that it is clearly still growing. A little soil at the base."),
  ('tree-4', "A full healthy tree with a sturdy trunk and a broad, generous round crown of layered green leaves, dappled with warm light. Grounded, established."),
  ('tree-5', "A magnificent full tree in fruit: a broad layered green crown hung with many round golden fruits that glow softly warm gold, a sturdy trunk, a few gold fruits resting at its base."),
]
if __name__ == '__main__':
    only = sys.argv[1:] or None
    for name, prompt in STAGES:
        if only and name not in only: continue
        out = f'{name}.png'
        if os.path.exists(out) and not only: print('skip', out); continue
        img = call(BIBLE + "\n\n" + SPRITE + prompt)
        if img: open(out, 'wb').write(img); print('wrote', out, len(img)//1024, 'kB')
        else: print('FAILED', name)
        time.sleep(1.5)
