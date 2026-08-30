"""process-icons.py — crop the icons to their content, square them, embed.

The model returns a wide frame with the icon somewhere inside it and a flat
cream field around. An icon has to be SQUARE and tight or it cannot sit in a
row at 26px, so this finds the actual drawing rather than trusting the
composition: scan in from every edge for the first pixel that differs from the
background, take that box, pad it to a square, and resize.

WebP at 128px. They render at 20-34px, and the whole set has to stay small
because this app ships offline and also as one self-contained page.
"""
from PIL import Image
import base64, io, os, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'app', 'src', 'icons-gen.js')
SIZE = 128

def content_box(im, tol=14):
    """The bounding box of everything that is not the background field."""
    px = im.convert('RGB')
    w, h = px.size
    bg = px.getpixel((2, 2))
    def differs(p):
        return abs(p[0]-bg[0]) + abs(p[1]-bg[1]) + abs(p[2]-bg[2]) > tol
    small = px.resize((w // 4, h // 4), Image.BILINEAR)
    sw, sh = small.size
    xs, ys = [], []
    for y in range(sh):
        for x in range(sw):
            if differs(small.getpixel((x, y))):
                xs.append(x); ys.append(y)
    if not xs:
        return (0, 0, w, h)
    return (min(xs)*4, min(ys)*4, max(xs)*4 + 4, max(ys)*4 + 4)

def square(im, box, pad=0.10):
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    side = int(max(bw, bh) * (1 + pad * 2))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    l = max(0, cx - side // 2); t = max(0, cy - side // 2)
    r = min(im.width, l + side); b = min(im.height, t + side)
    return im.crop((l, t, r, b))

def main():
    files = sorted(glob.glob(os.path.join(HERE, 'icon-*.png')))
    if not files:
        print('no icons yet'); return 1
    out, total = {}, 0
    for f in files:
        key = os.path.basename(f)[5:-4]          # icon-foo.png -> foo
        im = Image.open(f).convert('RGB')
        im = square(im, content_box(im)).resize((SIZE, SIZE), Image.LANCZOS)
        b = io.BytesIO(); im.save(b, 'WEBP', quality=82, method=6)
        data = b.getvalue(); total += len(data)
        out[key] = 'data:image/webp;base64,' + base64.b64encode(data).decode()
        print(f'  {key:14s} {len(data)//1024:3d} kB')

    body = ',\n'.join(f"  '{k}': '{v}'" for k, v in sorted(out.items()))
    open(OUT, 'w').write(
        "/* icons-gen.js — the drawn icon set, embedded.\n\n"
        "   Sixteen system emoji on one screen is what a placeholder looks like, and\n"
        "   emoji render differently on every device so the app cannot be art-directed\n"
        "   at all. These are drawn to Bizzing Bee's icon spec — chunky multi-colour\n"
        "   sticker illustrations with a soft ink outline and a gloss, legible down to\n"
        "   20px — in Finance's own palette.\n\n"
        "   Generated with a generative IMAGE model, cropped and squared here. No\n"
        "   generated lettering: every prompt banned text, letters, numbers and\n"
        "   signage, because type is the app's own faces and nothing else.\n\n"
        f"   {len(out)} icons, {total // 1024} kB total. Regenerate with tools/art. */\n\n"
        "export const ICONS = {\n" + body + ",\n};\n"
        "export function icon(name) { return ICONS[name] || null; }\n")
    print(f'\nwrote {os.path.relpath(OUT, HERE)} — {len(out)} icons, {total // 1024} kB')
    return 0

if __name__ == '__main__':
    sys.exit(main())
