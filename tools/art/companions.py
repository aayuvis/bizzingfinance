"""companions.py — the five companions a child can adopt, raise and dress.

The Tamagotchi in the app, and it is wired to REAL money: food is a weekly
bill from her wallet, accessories are wants she budgets for, and a companion
gets poorly when the bill goes unpaid — never because she skipped a day.
It never dies. It always recovers.

Five animals × three growth stages × three states = 45 sprites, plus six
accessories keyed for compositing. Same rules as every sprite here: cream
field, single object, no text, the family's gouache picture-book style.
"""
import os, sys, time
from gen import call, BIBLE

SPRITE = ("One single small animal character, whole and centred, facing the viewer, on a plain "
          "flat solid cream background #FFFCF5 with nothing else — no ground, no scenery, only a "
          "soft small contact shadow. Fills most of the frame with a small margin. No clothing, "
          "no accessories, no collar. ")
ANIMALS = {
  'pup':     "a puppy, warm caramel-and-cream fur, floppy ears, big dark eyes",
  'kitten':  "a kitten, soft grey tabby fur with a white chest, pointed ears, big round eyes",
  'parrot':  "a small parrot, sage-green feathers with a warm gold breast and a teal tail, a small curved beak",
  'bunny':   "a rabbit, soft dusty-brown fur with a cream tummy, long upright ears, a pink nose",
  'duck':    "a duckling, fluffy warm-yellow down, a small orange bill and orange feet",
}
STAGES = {
  'baby':  "very young and tiny, round and fluffy, oversized head, sitting",
  'young': "half-grown, lankier, standing, a little gangly",
  'grown': "fully grown, well-proportioned, standing proudly",
}
MOODS = {
  'happy':  "beaming with joy, eyes bright, a little bounce in the pose, one ear or wing lifted",
  'okay':   "calm and content, a gentle neutral expression, relaxed",
  'poorly': "drooping and sorry for itself: slumped, ears or wings down, sad eyes, fur or feathers a little scruffy, a small grey cloud of worry above its head — sad, not sick, and never frightening",
}
ACCESSORIES = [
  ('acc-scarf',   "a small knitted scarf in soft terracotta-red with cream stripes and little tassels, shown flat on its own"),
  ('acc-hat',     "a tiny knitted bobble hat in deep teal with a cream pom-pom, shown on its own"),
  ('acc-bow',     "a small soft gold ribbon bow, shown on its own"),
  ('acc-bell',    "a small collar: a thin warm-brown leather band with a little round gold bell, shown on its own"),
  ('acc-specs',   "a tiny pair of round wire spectacles, shown on its own"),
  ('acc-crown',   "a tiny paper party crown in warm gold with small red and teal dots, shown on its own"),
]

def jobs():
    for a, adesc in ANIMALS.items():
        for s, sdesc in STAGES.items():
            for m, mdesc in MOODS.items():
                yield (f'{a}-{s}-{m}', f"{SPRITE}The animal is {adesc}. It is {sdesc}. It is {mdesc}.")
    for name, d in ACCESSORIES:
        yield (name, "One single small object, centred, on a plain flat solid cream background #FFFCF5 with nothing else, soft contact shadow, small margin: " + d + ". No text, no animal, no scenery.")

if __name__ == '__main__':
    only = set(sys.argv[1:])
    todo = [(n, p) for n, p in jobs() if not only or n in only]
    print(len(todo), 'to draw')
    for name, prompt in todo:
        out = f'{name}.png'
        if os.path.exists(out) and not only: print('skip', out); continue
        img = call(BIBLE + "\n\n" + prompt)
        if img: open(out, 'wb').write(img); print('wrote', out, len(img)//1024, 'kB')
        else: print('FAILED', name)
        time.sleep(1.2)
