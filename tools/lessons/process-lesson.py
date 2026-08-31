"""process-lesson.py — assemble a narrated lesson into src/lessons-gen.js.

Takes a verified run directory (voice.py) plus the teaching avatars
(tools/art/nana-*.png) and writes one module: poses as alpha-keyed WebP,
clips as MP3 data URIs, and the manifest whose DURATIONS are the animation's
clock. Refuses an unverified run: a lesson with a silent beat in it is not a
lesson, it is a bug that plays.
"""
import base64, importlib.util, io, json, os, sys, glob
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(HERE, '..', 'art')
OUT = os.path.join(HERE, '..', '..', 'app', 'src', 'lessons-gen.js')
spec = importlib.util.spec_from_file_location('pi', os.path.join(ART, 'process-icons.py'))
pi = importlib.util.module_from_spec(spec); spec.loader.exec_module(pi)

lid = sys.argv[1] if len(sys.argv) > 1 else 'c1b'
run = os.path.join(HERE, f'run-{lid}')
man = json.load(open(os.path.join(run, 'manifest.json')))
from scripts import LESSONS
want = len(LESSONS[lid]['beats'])
bad = [m for m in man if m['dur'] < 0.9 or m['db'] < -40]
if len(man) != want or bad:
    sys.exit(f'run not clean: {len(man)}/{want} clips, {len(bad)} suspect — re-record before promoting')

poses = {}
for f in sorted(glob.glob(os.path.join(ART, 'nana-*.png'))):
    name = os.path.basename(f)[5:-4]
    im = Image.open(f); im = im.crop(pi.content_box(im)); im = pi.dealpha(im, tol=46)  # the pose fields carry a soft gradient
    # trim to rows/columns with REAL content: a lone surviving speckle must
    # not hold the whole margin open (it did — 560px of avatar, 250 of Nana)
    a = im.getchannel('A'); w0, h0 = im.size; px = a.load()
    cols = [sum(1 for y in range(0, h0, 2) if px[x, y] > 12) for x in range(w0)]
    rows = [sum(1 for y in range(0, w0, 2) if px[y, x] > 12) for x in range(h0)]
    xs = [i for i, v in enumerate(cols) if v >= 4]; ys = [i for i, v in enumerate(rows) if v >= 4]
    if xs and ys: im = im.crop((max(0, xs[0]-2), max(0, ys[0]-2), min(w0, xs[-1]+3), min(h0, ys[-1]+3)))
    r = 300 / im.height
    im = im.resize((max(1, round(im.width * r)), 300), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=82, method=6)
    poses[name] = (im.width, im.height, base64.b64encode(buf.getvalue()).decode())
    print(f'pose {name:6} {im.width}x{im.height} {buf.getbuffer().nbytes//1024} kB')

beats = []
for m in man:
    mp3 = open(os.path.join(run, f'{lid}-{m["i"]}.mp3'), 'rb').read()
    beats.append({'dur': m['dur'], 'line': m['line'], 'stage': m['stage'],
                  'src': 'data:audio/mpeg;base64,' + base64.b64encode(mp3).decode()})

with open(OUT, 'w') as o:
    o.write("""/* lessons-gen.js — the narrated, animated lessons.

   Voice from a generative TTS model (an Indian English narrator is the
   point — the family learnt that the hard way), teaching avatars from a
   generative IMAGE model in the house style, animation composited locally
   by lessonplayer.js. Generated MOTION stays banned, as everywhere in the
   family: the model narrates and paints, the app animates.

   Each beat's DURATION is measured from its real clip — the audio is the
   clock, and a re-recorded line moves its own cue. Regenerate with
   tools/lessons (scripts.py → voice.py → process-lesson.py).
   Never commit the API key. */

export const POSES = {
""")
    for name, (w, h, data) in poses.items():
        o.write(f"  '{name}': {{ w: {w}, h: {h}, src: 'data:image/webp;base64,{data}' }},\n")
    o.write('};\n\nexport const LESSON_MEDIA = {\n')
    o.write(f"  '{lid}': {{ title: {json.dumps(LESSONS[lid]['title'])}, beats: [\n")
    for b in beats:
        o.write(f"    {{ dur: {b['dur']}, line: {json.dumps(b['line'])}, stage: {json.dumps(b['stage'])}, src: '{b['src']}' }},\n")
    o.write('  ] },\n};\n')
print(f'{OUT.split("/")[-1]}: {len(beats)} beats, {os.path.getsize(OUT)//1024} kB, total {sum(b["dur"] for b in beats):.0f}s')
