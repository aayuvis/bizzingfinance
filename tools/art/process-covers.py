"""process-covers.py — the Arcade covers into app/src/covers-gen.js.

Crop each painting to 16:10 around its centre, size it for a two-up tile on a
phone at 2× (560px wide), and embed as WebP. Keyed by game id so the hub can
ask COVERS[g.id] and fall back to the tint when a cover is missing."""
from PIL import Image
import base64, io, os, glob
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'app', 'src', 'covers-gen.js')
W = 560; RATIO = 16 / 10
covers, total = {}, 0
for f in sorted(glob.glob(os.path.join(HERE, 'cover-*.png'))):
    gid = os.path.basename(f)[6:-4]
    im = Image.open(f).convert('RGB'); w, h = im.size
    if w / h > RATIO: nw = int(h * RATIO); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = int(w / RATIO); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize((W, int(W / RATIO)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=68, method=6); n = len(buf.getvalue()); total += n
    covers[gid] = (im.width, im.height, base64.b64encode(buf.getvalue()).decode())
with open(OUT, 'w') as o:
    o.write("/* covers-gen.js — painted covers for the Arcade, one per game (tools/art/covers.py).\n   Generated; regenerate with tools/art/process-covers.py, never hand-edit. */\n\nexport const COVERS = {\n")
    for k, (w, h, data) in covers.items():
        o.write(f"  '{k}': {{ w: {w}, h: {h}, src: 'data:image/webp;base64,{data}' }},\n")
    o.write('};\n')
print(f'{len(covers)} covers, {total // 1024} kB → covers-gen.js')
