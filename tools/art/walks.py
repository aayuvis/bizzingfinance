"""walks.py — one painted panorama per world, for the Atlas walk.

Bee opens each Atlas region as a wide painting the camera unrolls, with the
stops standing on the road. Bizzington has five worlds, so five paintings,
each a WIDE strip (the road runs left to right across it) with generous empty
road between the landmarks so a stop pin never lands on a chimney.

The pins are measured off each drawing afterwards (walk-pins.json), never
typed blind.

    export GKEY=…            # never committed
    python3 walks.py         # writes walk-*.png here (gitignored)
"""
import os, sys, time
from gen import call, BIBLE

STRIP = (
    "A WIDE PANORAMIC strip, much wider than it is tall, seen from the side at eye level like a "
    "storybook scene that scrolls sideways. A single sandy road runs left to right across the whole "
    "width, close to the bottom of the frame, with plenty of EMPTY open road between things. "
    "Soft distant hills and sky fill the upper half. Nothing at all in the lower strip below the road. "
    "No people, no animals, no text, no letters, no signs with writing. "
)
JOBS = [
  ('walk-market',  "A market street in warm afternoon light: a few striped market stalls with fruit and vegetable baskets on the left, a small thatched cottage in the middle distance, a wooden barrow, crates and sacks beside the road, a lamp post, and low green hills behind. Sunny, dusty gold, busy but small."),
  ('walk-harbour', "A working harbour in cool morning light: a wooden pier reaching into calm teal water on the left, a small storage shed with a big front window, a bare timber scaffold, coils of rope, stacked crates, fishing floats, a low sea wall along the road, gulls in the sky, misty headland behind. Blue-green, breezy."),
  ('walk-clock',   "A stone town square in clear light: a clock tower with a plain pale clock face, a small columned stone bank, a cobbled edge to the road, a stone fountain, iron lamp posts, neat clipped trees, low stone wall, pale blue sky. Orderly, quiet, civic."),
  ('walk-exchange',"A grand exchange quarter at golden hour: tall columned buildings with wide steps on the right, a covered market hall with an empty dark noticeboard, awnings, tall arched windows, stone balustrades along the road, cypress trees, warm amber sky. Busy, prosperous, a little theatrical."),
  ('walk-works',   "A workshop district in the late afternoon: brick workshops with two tall chimneys and one soft curl of smoke, timber stacks, a water butt, a hand cart, a long low shed with open doors, a rail of hanging tools, scrub grass, dusty orange sky. Warm brick red, working, hand-made."),
]

if __name__ == '__main__':
    only = sys.argv[1:] or None
    todo = [(n, p) for n, p in JOBS if not only or n in only]
    print(f'{len(todo)} panoramas to paint')
    for name, prompt in todo:
        out = f'{name}.png'
        if os.path.exists(out) and not only:
            print('skip', out); continue
        img = call(BIBLE + "\n\n" + STRIP + prompt)
        if img: open(out, 'wb').write(img); print('wrote', out, len(img) // 1024, 'kB')
        else: print('FAILED', name)
        time.sleep(1.5)
