"""avatars.py — Nana Bizz's teaching poses for the animated lessons.

Half-body, on the flat cream field for alpha keying, in the same style bible
as everything else. Three poses are the whole grammar the lesson player
needs: talk (neutral, hands settled), point (one hand raised toward the
stage), smile (delighted). Matches her cast portrait: kind elderly Indian
grandmother, round spectacles, silver bun, warm shawl.
"""
import os, sys, time
from gen import call, BIBLE

BASE = ("Half-body illustration of one kind elderly Indian grandmother, warm brown skin, "
        "round wire spectacles, silver hair in a neat bun, a soft teal shawl over a warm "
        "cream kurta, small gold earrings. Centred on a plain flat solid cream background "
        "#FFFCF5 with nothing else. She faces the viewer, shown from the waist up, "
        "storybook-warm and gentle. ")
POSES = [
  ('nana-talk',  "Her hands are settled together in front of her, expression kind and attentive, mid-sentence."),
  ('nana-point', "One hand raised to her side at shoulder height, palm open, presenting something beside her; delighted, eyebrows raised."),
  ('nana-smile', "Both hands pressed together with joy, eyes nearly closed with a broad warm smile."),
]
if __name__ == '__main__':
    for name, pose in POSES:
        out = f'{name}.png'
        if os.path.exists(out): print('skip', out); continue
        img = call(BIBLE.replace('No human figures.', '') + "\n\n" + BASE + pose)
        if img: open(out, 'wb').write(img); print('wrote', out, len(img)//1024, 'kB')
        else: print('FAILED', name)
        time.sleep(1.5)
