"""process-companions.py — the five companions into app/src/companions-gen.js.

Key the cream field, trim to real content, resize for a card and a street,
embed as WebP. And MEASURE the accessory anchors from each sprite's own
alpha — head-top, neck, face — because a hat typed by hand for the puppy is
across the parrot's beak. Fractions of the box, so a resize cannot strand them.

Runs on whatever sprites exist; a missing key is a missing key, and the app
falls back to an icon rather than a hole. Re-run when the batch completes.
"""
from PIL import Image
import base64, io, os, glob, json, importlib.util, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'app', 'src', 'companions-gen.js')
spec = importlib.util.spec_from_file_location('pi', os.path.join(HERE, 'process-icons.py'))
pi = importlib.util.module_from_spec(spec); spec.loader.exec_module(pi)

W_ANIMAL, W_ACC = 220, 120

def keyed(path, tol):
    im = Image.open(path); im = im.crop(pi.content_box(im)); im = pi.dealpha(im, tol=tol)
    a = im.getchannel('A'); w0, h0 = im.size; px = a.load()
    cols = [sum(1 for y in range(0, h0, 2) if px[x, y] > 12) for x in range(w0)]
    rows = [sum(1 for y in range(0, w0, 2) if px[y, x] > 12) for x in range(h0)]
    xs = [i for i, v in enumerate(cols) if v >= 3]; ys = [i for i, v in enumerate(rows) if v >= 3]
    if xs and ys: im = im.crop((max(0, xs[0]-2), max(0, ys[0]-2), min(w0, xs[-1]+3), min(h0, ys[-1]+3)))
    return im

def anchors(im):
    """head-top: centroid of the topmost opaque rows; neck: the narrowest
    opaque row in the 30–55% band (where a head meets a body); face: a little
    below the head-top, centred."""
    a = im.getchannel('A'); w, h = im.size; px = a.load()
    def row_span(y):
        xs = [x for x in range(w) if px[x, y] > 40]
        return (xs[0], xs[-1]) if xs else None
    top = next((y for y in range(h) if row_span(y)), 0)
    span = row_span(min(h - 1, top + max(4, h // 40))) or (w // 2, w // 2)
    head = ((span[0] + span[1]) / 2 / w, top / h)
    best, by = None, None
    for y in range(int(h * 0.30), int(h * 0.55)):
        s = row_span(y)
        if not s: continue
        width = s[1] - s[0]
        if best is None or width < best: best, by = width, y
    if by is None: by = int(h * 0.42)
    ns = row_span(by) or (w // 2, w // 2)
    neck = ((ns[0] + ns[1]) / 2 / w, by / h)
    face = (head[0], min(0.95, head[1] + 0.22))
    return { 'head': [round(head[0], 3), round(head[1], 3)],
             'neck': [round(neck[0], 3), round(neck[1], 3)],
             'face': [round(face[0], 3), round(face[1], 3)] }

def emit(im, w_target):
    r = w_target / im.width
    im = im.resize((w_target, max(1, round(im.height * r))), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=80, method=6)
    return im.width, im.height, base64.b64encode(buf.getvalue()).decode(), len(buf.getvalue())

animals, accs, total = {}, {}, 0
for f in sorted(glob.glob(os.path.join(HERE, '*.png'))):
    name = os.path.basename(f)[:-4]
    if name.startswith('acc-'):
        im = keyed(f, 30); w, h, data, n = emit(im, W_ACC); total += n
        accs[name] = (w, h, data)
    elif name.split('-')[0] in ('pup', 'kitten', 'parrot', 'bunny', 'duck') and name.count('-') == 2:
        im = keyed(f, 30); an = anchors(im); w, h, data, n = emit(im, W_ANIMAL); total += n
        animals[name] = (w, h, data, an)

with open(OUT, 'w') as o:
    o.write("""/* companions-gen.js — the five companions, their stages and moods, and the
   things they wear. Generated sprites in the house style, alpha-keyed and
   embedded; accessory anchors MEASURED from each sprite's own alpha so a hat
   sits on this head, not a typed-in one. Regenerate with tools/art. */

export const CO = {
""")
    for k, (w, h, data, an) in animals.items():
        o.write(f"  '{k}': {{ w: {w}, h: {h}, a: {json.dumps(an)}, src: 'data:image/webp;base64,{data}' }},\n")
    o.write('};\n\nexport const ACC = {\n')
    for k, (w, h, data) in accs.items():
        o.write(f"  '{k}': {{ w: {w}, h: {h}, src: 'data:image/webp;base64,{data}' }},\n")
    o.write('};\n')
print(f'{len(animals)} companion sprites, {len(accs)} accessories, {total // 1024} kB → companions-gen.js')
missing = 45 - len(animals)
if missing: print(f'  ({missing} companion sprites not drawn yet — re-run when the batch finishes)')
