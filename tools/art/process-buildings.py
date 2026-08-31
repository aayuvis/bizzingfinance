"""process-buildings.py — building sprites into app/src/buildings-gen.js.

Same discipline as the icons: find the drawing rather than trusting the
composition, key the generation field out from the corners so cream INSIDE a
wall survives, and embed as WebP data URIs because the app ships offline and
as one self-contained file.

Buildings are not squared — a stall is wide and a bank is tall, and forcing
either into a square puts dead margin into every layout calculation. Each
entry records its aspect so town.js can honour it.
"""
from PIL import Image
import base64, io, os, sys, glob, json

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'app', 'src', 'buildings-gen.js')
W = 380            # display is ~150 CSS px wide; 380 keeps 2.5x for retina
# A sprite is stored at ~2.5x the width it is DRAWN at, not one flat size:
# a lantern drawn at 34px shipped at 380 wide is 24 kB of invisible pixels.
WIDTHS = { 'lantern': 96, 'postbox': 220 }

sys.path.insert(0, HERE)
import importlib.util
spec = importlib.util.spec_from_file_location('pi', os.path.join(HERE, 'process-icons.py'))
pi = importlib.util.module_from_spec(spec); spec.loader.exec_module(pi)

files = sorted(glob.glob(os.path.join(HERE, 'bld-*.png')))
if not files:
    sys.exit('no bld-*.png here — run buildings.py first')

import json
ZONES = json.load(open(os.path.join(HERE, 'zones.json')))

entries = []
for f in files:
    name = os.path.basename(f)[4:-4]
    im = Image.open(f)
    box = pi.content_box(im)
    im = im.crop(box)
    im = pi.dealpha(im)
    if name == 'yard':
        # The scaffold ENCLOSES background: the corner flood cannot reach the
        # cream inside the frame, and an opaque cream panel standing in a
        # painted street is exactly the clash this sprite exists to fix. Seed
        # a second flood from the centre of the measured interior zone.
        z = ZONES['yard']; w0, h0 = im.size
        px = im.load()
        from collections import deque
        bg = px[int((z[0]+z[2])/2*w0), int((z[1]+z[3])/2*h0)][:3]
        def near(p): return abs(p[0]-bg[0])+abs(p[1]-bg[1])+abs(p[2]-bg[2]) <= 30
        q = deque([(int((z[0]+z[2])/2*w0), int((z[1]+z[3])/2*h0))]); seen=set()
        while q:
            x, y = q.popleft()
            if (x,y) in seen or x<0 or y<0 or x>=w0 or y>=h0: continue
            seen.add((x,y))
            if not near(px[x,y][:3]): continue
            px[x,y] = (255,255,255,0)
            q += [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]
    w_target = WIDTHS.get(name, W)
    r = w_target / im.width
    im = im.resize((w_target, max(1, round(im.height * r))), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=82, method=6)
    data = base64.b64encode(buf.getvalue()).decode()
    entries.append((name, im.width, im.height, data))
    print(f'{name:12} {im.width}x{im.height}  {len(buf.getvalue())//1024} kB')

with open(OUT, 'w') as o:
    o.write("""/* buildings-gen.js — the town's buildings, painted.

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
""")
    for name, w, h, data in entries:
        o.write(f"  '{name}': {{ w: {w}, h: {h}, src: 'data:image/webp;base64,{data}' }},\n")
    o.write('};\n\n')
    o.write("""/* Dynamic zones, as FRACTIONS of each sprite's box, measured from the
   pixels by tools/art/measure-zones.py (with the two the detectors could not
   separate proofed by eye against an overlay sheet). Fractions, so a resize
   or regeneration cannot silently strand them. */
export const ZONES = """ + json.dumps(ZONES, indent=1).replace('"', "'") + ';\n')
total = os.path.getsize(OUT)
print(f'\n{OUT.split("/")[-1]}: {len(entries)} sprites, {total//1024} kB')
