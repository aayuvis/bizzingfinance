"""buildings.py — the town's buildings as painted sprites.

The street's buildings were hand-drawn SVG geometry composited over painted
plates, and the clash was visible from across the room: flat vector boxes
standing in a gouache world. The family's production brief already says how
this should work — generative image models draw sprites and plates, the app
composites them locally, and every structural fact lives in the rig.

So each building becomes a painted sprite in the plates' own style, with its
DYNAMIC ZONE painted blank for the app to fill: the Jar Shed's window is
empty (the child's real jar ratios are drawn in), the Bank's clock face has
no hands (the app tells the time), the Exchange's board is dark (the app
draws the market's actual last move), the Build Yard's scaffold is bare (the
goal goes up floor by floor). A sprite that painted those states would be a
lie the first time the state changed.

Locked buildings are the SAME sprite behind a CSS filter — grey is a state,
not a drawing.

    export GKEY=…            # never committed
    python3 buildings.py     # writes bld-*.png here (gitignored)
"""
import os, sys, time
from gen import call, BIBLE

SPRITE = (
    "One single building, whole and centred, seen straight on at street level, "
    "on a plain flat solid cream background #FFFCF5 with nothing else — no ground, "
    "no sky, no scenery, no shadows cast on the ground beyond a soft small contact shadow. "
    "The building fills most of the frame with a small margin all round. "
)

JOBS = [
  ('bld-home-0', "A tiny one-room cottage for a child's first home: warm sand-coloured plaster walls, one small square window with a wooden frame, an arched wooden front door, a simple pitched roof in warm brown with a gentle overhang. Modest, kind, a little plain — a starter home."),
  ('bld-home-1', "A small cottage: warm sand plaster walls, two framed windows with warm light inside, an arched wooden door, pitched warm-brown roof with a gentle overhang, a small step at the door. Cosy and cared for."),
  ('bld-home-2', "A two-storey family cottage: warm cream plaster, three windows upstairs and two beside the arched door, pitched warm-brown roof, gentle overhang. Warm light in the windows."),
  ('bld-home-3', "A handsome two-storey cottage with a brick chimney puffing one soft curl of smoke, warm cream plaster, rows of framed windows with warm light, arched wooden door, pitched roof in warm brown."),
  ('bld-home-4', "A beautiful two-storey home with a chimney and soft curl of smoke, a terracotta-tiled roof, warm cream walls, many glowing framed windows, an arched wooden door, and a low flower garden with round green bushes and small red and gold flowers along the front."),
  ('bld-stall',  "A wooden market stall: sturdy warm-brown timber counter and posts, a scalloped awning striped in soft terracotta-red and cream, baskets of round fruit and vegetables on the counter in gold, red and green, a small wooden side door. A friendly market trader's stall."),
  ('bld-jars',   "A wooden storage shed with a sage-green pitched roof and warm sand walls, and across its whole front ONE large rectangular open display window with a dark warm-brown interior, completely EMPTY inside — an empty dark showcase window taking up most of the front wall, with a small arched wooden door below it to one side."),
  ('bld-yard',   "A TALL rectangular timber scaffolding tower on a construction site, four storeys high and clearly taller than wide: warm brown wooden poles with cross-braces on the outer sides only, the interior of the frame completely OPEN and EMPTY with the cream background showing through it, standing on a low platform of sand-coloured bricks. A small toy crane with a soft red arm and a little gold hook reaches over the top. No wall or panel behind the frame — open air inside the scaffold."),
  ('bld-bank',   "A small classical bank: pale warm stone, four round columns with capitals across the front, a wide triangular pediment on top, and set in the middle of the pediment ONE round blank white clock face with a warm gold rim — the clock face is completely BLANK, no hands, no numbers, no marks. An arched wooden door between the middle columns."),
  ('bld-exchange', "A small elegant exchange building in deep teal and pale stone, and across its upper facade ONE large rectangular display board that is completely dark and BLANK — a smooth dark slate-teal empty screen with a thin teal frame. Two framed windows and an arched teal door below."),
  ('bld-shop',   "A cheerful little corner shop: warm cream walls, terracotta-red pitched roof, a wide shop window showing shelves with a few round jars and parcels in gold, red and sage, an arched wooden door, and above the window ONE completely BLANK rectangular signboard painted plain terracotta-red with nothing written on it."),
  ('bld-postbox', "A cheerful little rounded letterbox on a short wooden post: soft terracotta-red with a warm gold slot flap and a tiny pitched cap roof. Small, friendly, storybook."),
  ('bld-lantern', "ONLY a single hanging street lantern and absolutely nothing else in the image: a small four-sided glass lamp glowing warm gold, in a dark teal metal frame with a little cap and a hanging ring on top. No building, no wall, no bracket, no post, no ground, no scenery of any kind — just the one lantern floating centred on the plain cream background."),
]

if __name__ == '__main__':
    only = sys.argv[1:] or None
    todo = [(n, p) for n, p in JOBS if not only or n in only]
    print(f'{len(todo)} sprites to draw')
    for name, prompt in todo:
        out = f'{name}.png'
        if os.path.exists(out) and not only:
            print('skip', out); continue
        img = call(BIBLE + "\n\n" + SPRITE + prompt)
        if img: open(out, 'wb').write(img); print('wrote', out, len(img)//1024, 'kB')
        else: print('FAILED', name)
        time.sleep(1.5)
