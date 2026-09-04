"""atlas.py — the Money Atlas board: Bizzington's five worlds as one painted map.

Bee's Word Atlas draws its nine acts as regions on a single continent with a
route between them, and a child taps a region to walk it. Bizzington has five
worlds in a fixed order (Market Row → the Old Harbour → Clocktower Square →
the Exchange Quarter → the Works), so the map is one road that visits them in
that order, bottom-left to top-right. Pins are placed in the app from
positions measured off THIS drawing (atlas-pins.json) — never typed blind.

    export GKEY=…        # never committed
    python3 atlas.py     # writes atlas.png here (gitignored)
"""
import os, sys, time
from gen import call, BIBLE

PROMPT = (
    "A children's storybook MAP seen from high above at a gentle angle, landscape format, filling the whole frame. "
    "One winding sandy road travels from the BOTTOM-LEFT corner to the TOP-RIGHT corner, visiting five small places in order: "
    "(1) bottom-left: a little market square with striped stall awnings and a small cottage; "
    "(2) left-centre, on a calm teal sea coast: an old harbour with a wooden pier, a small wooden storage shed with a big front window, and a bare timber scaffold; "
    "(3) centre: a town square with a clock tower and a small stone bank; "
    "(4) upper-right: a grand exchange quarter with columned buildings and a boarded market hall; "
    "(5) top-right: the works — brick workshops with two chimneys and a soft curl of smoke. "
    "Between the places: rolling sage-green hills, small woods, a river with a bridge, tiny paths. "
    "The sea in the lower-left is calm teal; land is warm sand and soft green. "
    "Everything small and toy-like, generous open space between the five places. "
    "No people, no animals. ABSOLUTELY NO TEXT OR LETTERING ANYWHERE: no signs, no words on buildings, no labels, no compass, no border — every sign is a blank painted board."
)

if __name__ == '__main__':
    out = 'atlas.png'
    if os.path.exists(out) and '--force' not in sys.argv:
        print('exists', out); sys.exit(0)
    img = call(BIBLE + "\n\n" + PROMPT)
    if img: open(out, 'wb').write(img); print('wrote', out, len(img) // 1024, 'kB')
    else: print('FAILED')
