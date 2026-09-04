"""process-atlas.py — atlas.png → app/src/atlas-gen.js (the Money Atlas board).

The board is one painting, so it ships as one WebP at a width that reads on a
phone at 2× and is not a megabyte. Pins are NOT in here: they live in
atlas-pins.json beside this file, measured off the drawing by eye with
tools/art/atlas-pins.html, and are emitted alongside the image so the app
reads both from one module.
"""
from PIL import Image
import base64, io, os, json
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'app', 'src', 'atlas-gen.js')
im = Image.open(os.path.join(HERE, 'atlas.png')).convert('RGB')
W = 900; im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
buf = io.BytesIO(); im.save(buf, 'WEBP', quality=72, method=6)
data = base64.b64encode(buf.getvalue()).decode()
pins = json.load(open(os.path.join(HERE, 'atlas-pins.json'))) if os.path.exists(os.path.join(HERE, 'atlas-pins.json')) else []
with open(OUT, 'w') as o:
    o.write("/* atlas-gen.js — the Money Atlas board (tools/art/atlas.py) and its pins,\n   measured off the drawing (tools/art/atlas-pins.json). Regenerated. */\n")
    o.write(f"export const ATLAS = {{ w: {im.width}, h: {im.height}, src: 'data:image/webp;base64,{data}' }};\n")
    o.write(f"export const PINS = {json.dumps(pins)};\n")
print(f'atlas {im.width}x{im.height}, {len(buf.getvalue()) // 1024} kB, {len(pins)} pins → atlas-gen.js')
