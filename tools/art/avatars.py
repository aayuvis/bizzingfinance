"""avatars.py — Nana Bizz's teaching poses for the animated lessons.

Half-body, on the flat cream field for alpha keying, in the same style bible
as everything else. Three poses are the whole grammar the lesson player
needs: talk (neutral, hands settled), point (one hand raised toward the
stage), smile (delighted). Matches her cast portrait: kind elderly Indian
grandmother, round spectacles, silver bun, warm shawl.
"""
import os, sys, time
from gen import call, BIBLE

# The cast are ANIMALS — Nana Bizz's portrait is a kindly old TORTOISE in
# round spectacles. The first cut of these poses drew a human grandmother,
# which diverged from the app's own art AND made the teacher carry an
# ethnicity the cast deliberately doesn't. The tortoise carries none.
BASE = ("Half-body illustration of one kindly elderly tortoise character, standing upright "
        "like a storybook grandmother: a warm wrinkled friendly face, round wire spectacles, "
        "a patterned tortoise shell in warm browns and olive greens on her back, wearing a "
        "soft teal knitted shawl around her shoulders. Centred on a plain flat solid cream "
        "background #FFFCF5 with nothing else. She faces the viewer, shown from the waist up, "
        "storybook-warm and gentle, matching a soft gouache picture-book style. ")
POSES = [
  ('nana-talk',  "Her small hands settled together in front of her shawl, expression kind and attentive, mid-sentence."),
  ('nana-point', "One arm raised to her side at shoulder height, palm open, presenting something beside her; delighted, eyebrows raised over her spectacles."),
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
