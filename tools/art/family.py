"""family.py — the family layer's art for Bizzing Money (FAMILY-STANDARD v2 §2, §7, §8).

Draws, with a generative IMAGE model (never motion):
  · avatars   — the 77 faces Finance generates to reach 96 (12 packs × 8), in the family
                sticker style, with Bee's hand-off sheet as the style reference;
  · pip       — Pip the squirrel, the one mascot, in six poses, with the concept sheet as
                the character reference;
  · icon      — the app icon: Pip on emerald with acorns, no currency symbol, full bleed;
  · worlds    — six painted worlds from the town, each by day and then the SAME place by
                night (the day plate is the reference, so the night is that place, lit).

The key is read from GKEY_FILE (default /root/.gkey), never written anywhere. Raw output
goes to tools/art/raw/ (gitignored). LOOK at every image before process-family.py.

  python3 family.py avatars [--only=id,id] [--force]
  python3 family.py pip | icon | worlds | worlds-night
"""
import base64, concurrent.futures as cf, json, os, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw')
KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()
MODELS = ['gemini-3-pro-image', 'gemini-3.1-flash-image', 'gemini-2.5-flash-image']
SCRATCH = os.environ.get('FAMILY_REF', '')

NO_TEXT = ("Absolutely NO text, NO letters, NO digits, NO numbers, NO currency symbols, NO logo, "
           "NO watermark anywhere in the image.")
STICKER = ("A single cute character sticker in the Bizzing family avatar style, matching the reference "
           "sheet exactly in style: flat vector illustration, chubby rounded shapes, a thick clean "
           "dark-plum outline (#3A2A5C), simple two-tone cel shading with one soft highlight, big "
           "friendly dark eyes with a white catch-light, small pink cheeks, a gentle smile, bright "
           "warm colours. The character is centred, facing the viewer, filling about 75% of the frame, "
           "on a plain flat pure white background (#FFFFFF) with nothing else: no scenery, no confetti, "
           "no sparkles, no shadow on the ground, no frame. No visible teeth or claws. ") + NO_TEXT
BIBLE = ("Children's picture-book illustration. Soft gouache and coloured-pencil texture, rounded "
         "friendly shapes, gentle warm shading, no harsh black outlines. Kind, warm, hand-made "
         "feeling, like a well-loved storybook, not a cartoon or a 3D render. No human figures, no "
         "people, no animals in the foreground. ") + NO_TEXT

# id: (description)  — the 77 generated faces. Names and tiers live in app/src/avatar-catalogue.js.
AVATARS = {
  # pack 2 · Market Stalls (Market Row Morning)
  'mango':     "a round ripe mango character with a little green leaf on top",
  'teapot':    "a chubby round teapot character in teal with a little steam curl",
  'baskethog': "a small hedgehog sitting inside a woven market basket of apples",
  'turnip':    "a plump purple-and-white turnip character with leafy hair",
  'scales':    "a friendly brass balance scale character with two little pans held level like arms",
  'stallsnail':"a snail whose shell is a tiny striped market-stall awning in red and cream",
  'barrowmole':"a little mole pushing a wooden wheelbarrow full of carrots",
  'pumpkin':   "a prize pumpkin character wearing a small rosette ribbon, glowing warm orange",
  # pack 3 · Harbour Hands (Old Harbour)
  'gully':     "a round white-and-grey seagull with a yellow beak and a tiny sailor neckerchief",
  'pinchy':    "a round red crab with soft rounded mitten claws, waving",
  'sealpup':   "a soft grey seal pup with big eyes balancing a little ball",
  'puffin':    "a puffin wearing a small navy captain's cap",
  'lighthouse':"a little red-and-white striped lighthouse character with a glowing lamp",
  'buoy':      "a round red-and-white harbour buoy character bobbing on a curl of water",
  'sailboat':  "a small wooden sailboat character with a cream sail and a happy face on the hull",
  'narwhal':   "a narwhal admiral with a soft rounded horn and a tiny admiral's hat, glowing blue",
  # pack 5 · Clockwork (Clocktower Square)
  'tick':      "a round brass pocket-watch character with a smiling face and little winding crown on top, its dial blank with no numbers",
  'cogmouse':  "a small grey mouse holding a big brass cog wheel",
  'tinrobin':  "a wind-up tin robin with a red breast and a brass winding key on its back",
  'hourglass': "a cheerful hourglass character with golden sand inside",
  'cuckoo':    "a cuckoo bird popping out of a little carved wooden clock house",
  'winduprabbit':"a wind-up toy rabbit in pastel tin with a brass key on its back",
  'brassowl':  "a mechanical brass owl with copper feathers and glowing amber eyes",
  'clockdragon':"a friendly small dragon made of polished brass gears and clockwork, gold glow",
  # pack 6 · Post & Pages (Clocktower Square)
  'envelope':  "a cream paper envelope character with a red wax seal",
  'postpup':   "a beagle puppy wearing a postman's satchel",
  'pigeon':    "a plump carrier pigeon with a tiny rolled letter tied to its leg",
  'parcelkoala':"a koala hugging a brown paper parcel tied with string",
  'bookworm':  "a green bookworm wearing round spectacles, peeking out of a closed book",
  'inkwell':   "a round glass inkwell character with a feather quill",
  'stamp':     "a postage stamp character with scalloped edges and a tiny picture of a flower",
  'postbadger':"a badger postmaster holding a glowing brass lantern and a bag of letters, golden glow",
  # pack 7 · Savers & Keepers (Exchange Quarter)
  'piggy':     "a pink ceramic piggy bank character with a coin slot on its back",
  'jamjar':    "a glass jam jar character with a gingham lid, half full of golden buttons",
  'armadillo': "a small grey armadillo with banded armour shell, standing on two feet and hugging a tiny brass padlock",
  'hamster':   "a hamster with very full round cheeks, saving seeds",
  'dormouse':  "a sleepy dormouse curled on a tidy pile of saved hazelnuts",
  'chest':     "a small wooden treasure chest character with brass corners, lid slightly open showing a warm glow",
  'magpie':    "a black-and-white magpie proudly holding a shiny button",
  'goldenhen': "a golden hen sitting on a nest with one golden egg, warm shimmering glow",
  # pack 8 · Market Watchers (Exchange Quarter)
  'bullcalf':  "a friendly little bull calf with soft rounded nubs for horns",
  'bearcub':   "a fluffy brown bear cub",
  'meerkat':   "a meerkat standing tall on lookout with a tiny spyglass",
  'specowl':   "a round owl wearing big round spectacles, holding a little chart scroll",
  'rooster':   "a weather-vane rooster on a little arrow, in copper and red",
  'balloonhare':"a hare floating up holding a bunch of balloons",
  'sloth':     "a calm smiling sloth hanging from a branch, very patient",
  'giraffe':   "a long-view giraffe with a tiny telescope, looking far ahead, golden glow",
  # pack 9 · Builders (The Works)
  'brick':     "a red brick character with a little smile",
  'cranekid':  "a small yellow construction crane vehicle with a happy face",
  'digger':    "a little orange digger vehicle with a happy face",
  'paintpot':  "a paint pot character with a drip of teal paint and a brush",
  'antbuilder':"an ant wearing a tiny yellow hard hat carrying a plank",
  'mixer':     "a cement mixer truck character with a striped drum",
  'toolterrier':"a scruffy terrier puppy carrying a wooden toolbox",
  'steamengine':"a friendly little green steam locomotive with a puff of steam, golden glow",
  # pack 10 · Makers (The Works)
  'spool':     "a wooden spool of bright thread character",
  'jug':       "a round clay pottery jug character with a painted band",
  'weaver':    "a friendly round spider weaving a colourful little web, soft and fuzzy, not scary",
  'candle':    "a tall wax candle character with a gentle flame",
  'brushpony': "a small pony whose tail is a paintbrush tip dipped in paint",
  'claybuddy': "a chubby clay figure with thumbprints, freshly sculpted",
  'kettle':    "a copper kettle character with a curly steam whistle",
  'patchbear': "a patchwork teddy bear sewn from many colourful fabric squares, golden glow",
  # pack 11 · Showtime (Festival Night) — 3 kept from the first set + these 5
  'drum':      "a round festival drum character with crossed drumsticks",
  'kite':      "a diamond-shaped kite character with a ribbon tail",
  'balloondog':"a balloon-animal dog made of shiny blue balloons",
  'toucan':    "a toucan playing a small golden trumpet",
  'discoball': "a glittering mirror disco ball character with sparkles of light",
  # pack 12 · Lantern Lights (Festival Night)
  'lantern':   "a round paper lantern character glowing warm orange",
  'sparkler':  "a star-shaped sparkler character fizzing gently",
  'firefly':   "a chubby dark-green firefly beetle (NOT a bee, no stripes) with a big round softly glowing lime-yellow lantern tail and small clear wings",
  'fireflower':"a firework shaped like a blooming flower, bursting in pink and gold",
  'candyfloss':"a cloud of pink candy floss on a stick, smiling",
  'glowmoth':  "a soft fuzzy moth with glowing pale-blue wings",
  'lanternfish':"a lantern fish with a little glowing light on its head",
  'lanterndragon':"a friendly festival lantern dragon made of red and gold paper lanterns, glowing",
}

POSES = {
  'pip-wave':  "waving hello with one paw raised high, the other hugging the golden acorn, big smile",
  'pip-cheer': "cheering with both arms up in the air, jumping, eyes happily closed, the golden acorn tossed just above",
  'pip-think': "thinking with one paw on its chin, looking up, the golden acorn held in the other arm",
  'pip-point': "pointing to the viewer's right with one paw, friendly encouraging face, acorn tucked under the other arm",
  'pip-sleep': "curled up asleep inside its big fluffy tail, eyes closed, peaceful, the acorn as a pillow",
  'pip-oops':  "an 'oops' face: one paw behind its head, sheepish lopsided smile, the golden acorn slipping from its other paw",
}

WORLDS = {
  'market':   "Market Row on a fresh early morning: a cobbled market lane with striped stall awnings, baskets of fruit and vegetables, a thatched cottage, a lamp post, hills beyond, soft pink-gold sunrise sky",
  'harbour':  "the Old Harbour: a stone quay and a wooden pier, small fishing boats with sails, coiled ropes, crates, a red-and-white lighthouse on a headland, gulls over teal water",
  'clock':    "Clocktower Square: a stone clocktower with a blank round face (no numerals) above a cobbled square with a fountain, plane trees, cafe awnings and tall townhouses",
  'exchange': "the Exchange Quarter: a grand domed exchange hall with columns and wide steps, a bank with arched windows, cypress trees, a balustraded terrace, warm golden afternoon",
  'works':    "the Works: brick workshops with tall chimneys, a timber yard with stacked logs, a water wheel by a stream, a little rail track with a handcart, warm orange late afternoon",
  'festival': "Festival Night in the town park: strings of paper lanterns and bunting between trees, a small bandstand, food stalls with awnings, a lake reflecting the sky, a warm peach-and-gold sunset sky at golden hour, the lanterns hung but not yet lit, festive and warm",
}

def b64(path):
    return base64.b64encode(open(path, 'rb').read()).decode()

def call(model, prompt, ratio, refs=()):
    parts = [{"inlineData": {"mimeType": 'image/webp' if r.endswith('.webp') else 'image/png', "data": b64(r)}} for r in refs]
    parts.append({"text": prompt})
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": ratio}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": KEY})
    with urllib.request.urlopen(req, timeout=240) as r: d = json.load(r)
    for c in d.get('candidates', []):
        for p in c.get('content', {}).get('parts', []):
            if 'inlineData' in p: return base64.b64decode(p['inlineData']['data'])
    raise RuntimeError('no image: ' + json.dumps(d)[:200])

def run(job):
    name, prompt, ratio, refs = job
    out = os.path.join(RAW, name + '.png')
    if os.path.exists(out) and '--force' not in sys.argv: return name + ': exists'
    msg = ''
    for a in range(6):
        try:
            img = call(MODELS[a % 3], prompt, ratio, refs)
            open(out, 'wb').write(img); return f'{name}: ok'
        except Exception as e:
            msg = str(e)[:160]; time.sleep(4 + a * 6)
    return f'{name}: FAILED {msg}'

def jobs(kind):
    sheet = os.path.join(SCRATCH, 'handoff', 'sheet.png') if SCRATCH else ''
    pipsheet = '/home/user/Bizzing_Schedule/docs/family/mascots/fin-pip-sheet.webp'
    if kind == 'avatars':
        refs = (sheet,) if sheet and os.path.exists(sheet) else ()
        return [(f'av-{k}', "Use the reference sheet ONLY for the drawing style. Draw a NEW character: " + v + ". " + STICKER, '1:1', refs)
                for k, v in AVATARS.items()]
    if kind == 'pip':
        return [(k, "The reference shows Pip, a round russet-red squirrel with a big fluffy curled tail, cream belly, "
                 "small green waistcoat, holding a shiny golden acorn. Draw the SAME character, same proportions and colours, ONE "
                 "figure only, full body, " + v + ". Flat sticker style with a thick dark-plum outline and soft cel shading, "
                 "on a plain flat pure white background (#FFFFFF), nothing else. " + NO_TEXT, '1:1', (pipsheet,)) for k, v in POSES.items()]
    if kind == 'icon':
        return [('pip-icon', "Square mobile app icon artwork, FULL BLEED square (no rounded corners, no border, no frame): Pip "
                 "the squirrel from the reference, same character, large and centred, head and upper body filling the middle 70%, "
                 "hugging the golden acorn, on a solid warm emerald green (#1F8A5B) background with a subtle tone-on-tone pattern of "
                 "small acorns and oak leaves only (no coins, no money symbols), soft glow behind Pip. Readable at 48 pixels. "
                 "Flat sticker style, thick dark-plum outline. " + NO_TEXT, '1:1', (pipsheet,))]
    if kind == 'worlds':
        return [(f'world-{k}-day', "A wide panoramic painted backdrop of " + v + ". Seen from the side like a stage set, the "
                 "lower third is an open, quiet, softly textured ground with nothing on it (room for things to be drawn on top later). "
                 + BIBLE, '21:9', ()) for k, v in WORLDS.items()]
    if kind == 'worlds-night':
        return [(f'world-{k}-night', "This is a painted storybook backdrop. Repaint EXACTLY the same place, same composition, "
                 "same buildings in the same positions, but at NIGHT: a deep indigo sky with stars and a soft moon, every window "
                 "glowing warm amber, lamps and lanterns lit with soft halos, gentle moonlight on the ground, cosy and safe, not "
                 "scary. Keep the lower third open and quiet. " + BIBLE, '21:9', (os.path.join(RAW, f'world-{k}-day.png'),))
                for k in WORLDS]
    raise SystemExit('unknown kind ' + kind)

if __name__ == '__main__':
    os.makedirs(RAW, exist_ok=True)
    kind = sys.argv[1]
    js = jobs(kind)
    only = [a.split('=', 1)[1].split(',') for a in sys.argv if a.startswith('--only=')]
    if only: js = [j for j in js if j[0] in only[0] or j[0].split('-', 1)[-1] in only[0]]
    with cf.ThreadPoolExecutor(4) as ex:
        for l in ex.map(run, js): print(l, flush=True)
