"""process.py — crop, shrink and embed the generated art.

Portraits are cropped to the middle (the model leaves headroom) and dropped to
256px because they render at about 50. Plates go to 1100 wide. WebP throughout:
the whole set is under 100 kB, which matters because this app ships offline and
also as one self-contained page.
"""
from PIL import Image
import base64, io, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'app', 'src', 'art-gen.js')
CAST = ['pip', 'mags', 'bo', 'bea', 'nana']
WORLDS = ['market', 'harbour', 'clock', 'exchange', 'works']

def webp(im, q):
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return b.getvalue()

out = {}
for n in CAST:
    im = Image.open(os.path.join(HERE, f'cast-{n}.png')).convert('RGB')
    w, h = im.size
    box = int(w * 0.80); x = (w - box) // 2; y = int(h * 0.10)
    im = im.crop((x, y, x + box, min(h, y + box))).resize((256, 256), Image.LANCZOS)
    out['cast-' + n] = webp(im, 80)
for n in WORLDS:
    im = Image.open(os.path.join(HERE, f'world-{n}.png')).convert('RGB')
    im = im.resize((1100, int(1100 * im.height / im.width)), Image.LANCZOS)
    out['world-' + n] = webp(im, 68)

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('/* art-gen.js — generated; see tools/art/README.md. Do not hand-edit. */\n')
    f.write('export const ART = {\n')
    for k, v in out.items():
        f.write(f"  '{k}': 'data:image/webp;base64,{base64.b64encode(v).decode()}',\n")
    f.write('};\nexport function art(k) { return ART[k] || null; }\n')
print('wrote', OUT, sum(len(v) for v in out.values()) // 1024, 'kB of image')
