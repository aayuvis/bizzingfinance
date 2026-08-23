import os, sys, time
sys.path.insert(0, '.')
from gen import call, BIBLE

PORTRAIT = (" He fills most of the square frame in a centred head-and-shoulders portrait, "
            "on a plain soft pale background with no scenery, props or horizon at all.")
CAST = {
 'pip': "PIP: a young red squirrel with warm orange-brown fur, cream muzzle and chest, big soft dark friendly eyes, "
        "tufted ears, a bushy tail curling up behind one shoulder, wearing a simple teal apron. Cheerful, practical, "
        "a market trader's young apprentice." + PORTRAIT,
 'mags': "MAGS: a magpie with glossy blue-black head and wings, a crisp white breast, one bright curious eye, "
         "holding a small shiny brass button in her beak. Charming, persuasive and warm-hearted — a market "
         "salesperson everyone likes, never sinister, never menacing." + PORTRAIT,
 'bo': "BO: a young bull calf with tan-brown fur, small blunt rounded horns, a soft wide muzzle, an open cheerful "
       "over-confident grin. Completely friendly and gentle, absolutely not aggressive or threatening." + PORTRAIT,
 'bea': "BEA: a brown bear cub with soft round ears, a gentle muzzle, and a worried thoughtful expression with "
        "raised brows. Sweet and anxious, never frightening, no visible teeth or claws." + PORTRAIT,
 'nana': "NANA BIZZ: an elderly tortoise wearing round wire spectacles, a patterned green-brown shell rising behind "
         "her shoulders, a deeply kind wise face with a slight knowing smile, soft wrinkles." + PORTRAIT,
}

PLATE = (" A wide empty landscape backdrop for a side-on picture-book street scene. "
         "Sky across the top two thirds, distant soft hills or horizon in the middle, and an empty flat ground "
         "strip along the bottom. COMPLETELY EMPTY in the foreground — no buildings, no people, no animals, "
         "no objects, no path markings. It is a stage set that other art will be placed on top of.")
WORLDS = {
 'market': "A warm sunny market-town morning. Golden light, soft sandy ground, gentle green hills far away." + PLATE,
 'harbour': "A cool coastal harbour morning. Pale blue-grey sky with drifting gulls, a flat calm sea on the horizon, "
            "damp grey-green stone ground." + PLATE,
 'clock': "A crisp civic square at midday. Cool violet-grey sky, distant pale stone rooftops on the horizon, "
          "smooth flagstone ground." + PLATE,
 'exchange': "A bright brisk city quarter. Clear teal-tinted sky, distant hazy rooftops, cool grey-green paving." + PLATE,
 'works': "A warm industrial edge of town at late afternoon. Amber sky, distant low chimneys and soft haze on the "
          "horizon, packed earth ground." + PLATE,
}

def run(name, prompt, wide=False):
    out = f'{name}.png'
    if os.path.exists(out) and os.path.getsize(out) > 40000:
        print('skip', name); return
    p = BIBLE + "\n\n" + prompt
    if wide: p += "\n\nThe image must be a wide landscape banner, much wider than it is tall."
    img = call(p)
    if img: open(out, 'wb').write(img); print('ok', name, len(img)//1024, 'kB')
    else: print('FAILED', name)

for k, v in CAST.items(): run('cast-' + k, v); time.sleep(1)
for k, v in WORLDS.items(): run('world-' + k, v, wide=True); time.sleep(1)
print('batch done')
