"""process-family.py — raw family art (tools/art/raw/) into the app's public files.

  avatars  raw/av-<id>.png + the Bee hand-off packs + the three kept faces
           -> app/public/avatars/fin/<id>.webp   512 px, transparent
  pip      raw/pip-<pose>.png -> app/public/mascot/pip-<pose>.webp  512 px, transparent
           + app/public/mascot/pip-head.webp (the 28 px logo head, cropped from wave)
  icon     raw/pip-icon.png -> app/public/icons/icon-{192,512,maskable-512,180}.png + icon-1024.png
  worlds   raw/world-<id>-{day,night}.png -> app/public/worlds/<id>-{day,night}.webp (1600 wide)
           + <id>-{day,night}-thumb.webp (360 wide) for the world picker

The background is keyed by flood-filling the near-white margin from the edges, so a
white highlight INSIDE the thick plum outline is never punched through.
Run after LOOKING at every raw image:  python3 process-family.py [avatars|pip|icon|worlds]
"""
import os, sys, glob
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw')
PUB = os.path.join(HERE, '..', '..', 'app', 'public')
HANDOFF = os.environ.get('HANDOFF', '')
KEPT = ['melody', 'pixel', 'goldlegend']   # the first set's faces no sibling holds in its 96


def key_white(im, thresh=38):
    im = im.convert('RGBA')
    w, h = im.size
    work = im.convert('RGB').copy()
    MAG = (255, 0, 255)
    seeds = [(x, y) for x in range(0, w, max(1, w // 16)) for y in (0, h - 1)] + \
            [(x, y) for y in range(0, h, max(1, h // 16)) for x in (0, w - 1)]
    for sx, sy in seeds:
        r, g, b = work.getpixel((sx, sy))
        if r > 225 and g > 225 and b > 225:
            ImageDraw.floodfill(work, (sx, sy), MAG, thresh=thresh)
    px, apx = work.load(), im.load()
    alpha = Image.new('L', (w, h), 255)
    al = alpha.load()
    for y in range(h):
        for x in range(w):
            if px[x, y] == MAG: al[x, y] = 0
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))
    im.putalpha(alpha)
    return im


def square(im, size=512, pad=0.06):
    bb = im.getbbox() or (0, 0, im.size[0], im.size[1])
    im = im.crop(bb)
    w, h = im.size
    side = int(max(w, h) * (1 + pad * 2))
    out = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    out.paste(im, ((side - w) // 2, (side - h) // 2), im)
    return out.resize((size, size), Image.LANCZOS)


def save_webp(im, path, q=86):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=q, method=6)


def avatars():
    out = os.path.join(PUB, 'avatars', 'fin')
    n = 0
    for f in sorted(glob.glob(os.path.join(RAW, 'av-*.png'))):
        id_ = os.path.basename(f)[3:-4]
        im = Image.open(f)
        im = im.resize((640, 640), Image.LANCZOS)
        save_webp(square(key_white(im)), os.path.join(out, id_ + '.webp')); n += 1
    if HANDOFF:
        for f in sorted(glob.glob(os.path.join(HANDOFF, '*', '*.png'))):
            id_ = os.path.basename(f)[:-4]
            save_webp(square(Image.open(f).convert('RGBA')), os.path.join(out, id_ + '.webp')); n += 1
    for id_ in KEPT:
        f = os.path.join(PUB, 'avatars', id_ + '.png')
        if os.path.exists(f):
            save_webp(square(Image.open(f).convert('RGBA'), pad=0.02), os.path.join(out, id_ + '.webp')); n += 1
    os.makedirs(os.path.join(out, 't'), exist_ok=True)
    for f in glob.glob(os.path.join(out, '*.webp')):   # 192px thumbs: every place a face is small
        Image.open(f).convert('RGBA').resize((192, 192), Image.LANCZOS).save(os.path.join(out, 't', os.path.basename(f)), 'WEBP', quality=80, method=6)
    print('avatars', n)


def pip():
    out = os.path.join(PUB, 'mascot')
    for f in sorted(glob.glob(os.path.join(RAW, 'pip-*.png'))):
        name = os.path.basename(f)[:-4]
        if name == 'pip-icon': continue
        im = key_white(Image.open(f).resize((720, 720), Image.LANCZOS))
        save_webp(square(im, 512, 0.04), os.path.join(out, name + '.webp'))
        if name == 'pip-wave':
            # the head for the logo: the top of the figure, squared on its face
            bb = im.getbbox(); x0, y0, x1, y1 = bb
            hh = int((y1 - y0) * 0.5)
            head = im.crop((x0, y0, x1, y0 + hh))
            save_webp(square(head, 128, 0.02), os.path.join(out, 'pip-head.webp'))
    print('pip done')


def icon():
    out = os.path.join(PUB, 'icons')
    os.makedirs(out, exist_ok=True)
    im = Image.open(os.path.join(RAW, 'pip-icon.png')).convert('RGB')
    w, h = im.size; s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((1024, 1024), Image.LANCZOS)
    im.save(os.path.join(out, 'icon-1024.png'))
    for n in (192, 512):
        im.resize((n, n), Image.LANCZOS).save(os.path.join(out, f'icon-{n}.png'), optimize=True)
    # maskable: the art already bleeds to the edge; Pip sits inside the 80% safe zone
    im.resize((512, 512), Image.LANCZOS).save(os.path.join(out, 'icon-maskable-512.png'), optimize=True)
    im.resize((180, 180), Image.LANCZOS).save(os.path.join(out, 'apple-touch-180.png'), optimize=True)
    print('icon done')


def worlds():
    out = os.path.join(PUB, 'worlds')
    for f in sorted(glob.glob(os.path.join(RAW, 'world-*-*.png'))):
        _, wid, t = os.path.basename(f)[:-4].split('-')
        im = Image.open(f).convert('RGB')
        w, h = im.size
        big = im.resize((1600, int(1600 * h / w)), Image.LANCZOS)
        save_webp(big, os.path.join(out, f'{wid}-{t}.webp'), 74)
        save_webp(im.resize((360, int(360 * h / w)), Image.LANCZOS), os.path.join(out, f'{wid}-{t}-thumb.webp'), 72)
    print('worlds done')


if __name__ == '__main__':
    for k in (sys.argv[1:] or ['avatars', 'pip', 'icon', 'worlds']):
        globals()[k]()
