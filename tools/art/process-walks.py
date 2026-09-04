"""process-walks.py — the five panoramas into app/src/walks-gen.js.

One wide WebP per world at a width that reads at 2x on a phone without being a
megabyte. The road's height is measured from the drawing rather than typed:
the stops stand ON the road, and a y typed by hand puts them in the sky.

The road is found as the horizontal band whose colour is closest to the sandy
road tone across the whole width — the band a walker would actually be on.
"""
from PIL import Image
import base64, io, os, json

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'app', 'src', 'walks-gen.js')
W = 1400
WORLDS = ['market', 'harbour', 'clock', 'exchange', 'works']

def road_y(im):
    """The fraction down the image where the road runs: scan the lower half for
    the row whose pixels vary least across the width (a road is a flat band)
    and are warm and light (sand), and take the middle of the best run."""
    g = im.convert('RGB').resize((160, 160))
    px = g.load()
    best, scores = None, []
    for y in range(80, 152):
        row = [px[x, y] for x in range(0, 160, 2)]
        warm = sum(1 for r, gg, b in row if r > 150 and gg > 130 and b < gg + 30) / len(row)
        var = sum(abs(row[i][0] - row[i - 1][0]) for i in range(1, len(row))) / len(row)
        scores.append((y, warm - var / 40))
    scores.sort(key=lambda t: -t[1])
    best = sorted(s[0] for s in scores[:12])
    mid = best[len(best) // 2] if best else 120
    return round(mid / 160, 3)

out = {}
total = 0
for w in WORLDS:
    p = os.path.join(HERE, f'walk-{w}.png')
    if not os.path.exists(p):
        print('missing', p); continue
    im = Image.open(p).convert('RGB')
    y = road_y(im)
    im2 = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im2.save(buf, 'WEBP', quality=70, method=6)
    total += len(buf.getvalue())
    out[w] = (im2.width, im2.height, y, base64.b64encode(buf.getvalue()).decode())
    print(f'{w:9s} {im2.width}x{im2.height}  road at {y:.3f}  {len(buf.getvalue())//1024} kB')

with open(OUT, 'w') as o:
    o.write("""/* walks-gen.js — one painted panorama per world for the Atlas walk
   (tools/art/walks.py). `road` is the fraction down the image where the road
   runs, MEASURED from the drawing — the stops stand on it, and a hand-typed
   number puts them in the sky. Regenerate with tools/art/process-walks.py. */

export const WALKS = {
""")
    for k, (ww, hh, y, data) in out.items():
        o.write(f"  '{k}': {{ w: {ww}, h: {hh}, road: {y}, src: 'data:image/webp;base64,{data}' }},\n")
    o.write('};\n')
print(f'{len(out)} panoramas, {total // 1024} kB → walks-gen.js')
