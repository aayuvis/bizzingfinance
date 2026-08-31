"""measure-zones.py — find each sprite's dynamic zone from its pixels.

The Videos brief's rule, kept: anchors are measured from the drawing, never
typed by hand. The Jar Shed's window, the Exchange's board and the Bank's
clock face are found by looking for them — a dark region, a dark region, a
pale disc — so a regenerated sprite moves its own anchors instead of putting
the jars across the roof.

Prints fractions of the sprite box, ready for town.js, and writes a proof
sheet with the zones outlined so a human can see the measurement is right.
"""
from PIL import Image, ImageDraw
import glob, os, sys

def darkest_rect(im, max_l=110, min_frac=0.02, interior=False, band=(0.0, 1.0)):
    """Bounding box of the largest connected dark region (the window/board).
    interior=True discards any blob touching the sprite edge — a dark FACADE
    floods to the border, a dark board never does."""
    g = im.convert('L'); w, h = g.size
    s = g.resize((w // 6, h // 6)); sw, sh = s.size
    px = s.load()
    seen = [[0] * sw for _ in range(sh)]
    best = None
    y_lo, y_hi = int(sh * band[0]), int(sh * band[1])
    for y0 in range(y_lo, y_hi):
        for x0 in range(sw):
            if seen[y0][x0] or px[x0, y0] > max_l: continue
            stack = [(x0, y0)]; xs = []; ys = []
            while stack:
                x, y = stack.pop()
                if x < 0 or y < 0 or x >= sw or y >= sh or seen[y][x] or px[x, y] > max_l: continue
                seen[y][x] = 1; xs.append(x); ys.append(y)
                stack += [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
            if interior and (min(xs) == 0 or min(ys) == 0 or max(xs) == sw - 1 or max(ys) == sh - 1):
                continue
            if len(xs) > sw * sh * min_frac and (best is None or len(xs) > best[0]):
                best = (len(xs), min(xs), min(ys), max(xs), max(ys))
    if not best: return None
    _, a, b, c, d = best
    return (a * 6 / w, b * 6 / h, (c + 1) * 6 / w, (d + 1) * 6 / h)

def pale_disc(im, top=0.4, min_l=228):
    """Centre and radius of the palest CONNECTED blob in the top part.

    First cut averaged every pale pixel in the top half and produced a circle
    the size of the pediment: the walls are pale too. The clock face is the
    single near-WHITE connected region, so flood it as one blob.
    """
    g = im.convert('L'); w, h = g.size
    s = g.resize((w // 4, h // 4)); sw, sh = s.size
    lim = int(sh * top)
    px = s.load()
    seen = [[0] * sw for _ in range(sh)]
    best = None
    for y0 in range(lim):
        for x0 in range(sw):
            if seen[y0][x0] or px[x0, y0] < min_l: continue
            stack = [(x0, y0)]; xs, ys = [], []
            while stack:
                x, y = stack.pop()
                if x < 0 or y < 0 or x >= sw or y >= lim or seen[y][x] or px[x, y] < min_l: continue
                seen[y][x] = 1; xs.append(x); ys.append(y)
                stack += [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
            if len(xs) > 40 and (best is None or len(xs) > best[0]):
                best = (len(xs), xs, ys)
    if not best: return None
    _, xs, ys = best
    cx, cy = sum(xs) / len(xs) * 4, sum(ys) / len(ys) * 4
    r = ((max(xs) - min(xs)) + (max(ys) - min(ys))) / 2 * 4 / 2
    return (cx / w, cy / h, r / w)

if __name__ == '__main__':
    import pickle; SPRITES = pickle.load(open('sprites.pkl', 'rb'))
    proofs = []
    out = {}
    for name, im in SPRITES.items():
        if name == 'jars':
            out[name] = ('rect', darkest_rect(im))
        elif name == 'exchange':
            out[name] = ('rect', darkest_rect(im, max_l=80, interior=True, band=(0, 0.55)))
        elif name == 'bank':
            z = pale_disc(im)
            out[name] = ('disc', z)
        elif name == 'yard':
            z = darkest_rect(im, max_l=150)   # timber frame is mid-brown
            out[name] = ('rect', z)
        elif name == 'shop':
            continue
        else:
            continue
        d = ImageDraw.Draw(im)
        w, h = im.size
        kind, zone = out[name]
        if zone and kind == 'rect':
            d.rectangle([zone[0]*w, zone[1]*h, zone[2]*w, zone[3]*h], outline=(255, 0, 0, 255), width=4)
        elif zone:
            d.ellipse([(zone[0]-zone[2])*w, zone[1]*h-zone[2]*w, (zone[0]+zone[2])*w, zone[1]*h+zone[2]*w], outline=(255,0,0,255), width=4)
        proofs.append((name, im))
        print(name, out[name])
    W = sum(i.width for _, i in proofs) + 12 * len(proofs)
    H = max(i.height for _, i in proofs)
    sheet = Image.new('RGB', (W, H), (255, 252, 245))
    x = 0
    for n, im in proofs:
        sheet.paste(im.convert('RGB'), (x, H - im.height)); x += im.width + 12
    sheet.save('/tmp/claude-0/-home-user/e94f102d-832d-5818-a01d-2a76ae4e2d71/scratchpad/zones.png')
    import json; json.dump({k: v[1] for k, v in out.items()}, open('zones.json', 'w'), indent=1)
    print('proof sheet + zones.json written')
