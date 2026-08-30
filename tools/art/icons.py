"""icons.py — Bizzington's icon set and the Market Game's sector emblems.

Sixteen emoji on one screen is what a placeholder looks like, and emoji render
differently on every device so the app cannot be art-directed at all. This
draws the real set.

Bizzing Bee's icon spec sets the quality bar — chunky multi-colour mini
illustrations with a soft ink outline and a gloss, legible down to 20px, never
flat single-hue glyphs. The PALETTE is Finance's own: intaglio teal, warm
cream, treasure gold, terracotta, sage.

Rules kept from the family's production brief:
  · no generated lettering, anywhere, ever — type is the app's own faces
  · no human figures
  · one style bible across every prompt or the set will not look related

    export GKEY=…      # never committed
    python3 icons.py   # writes icon-*.png here (gitignored)
"""
import os, sys, time
from gen import call

BIBLE = (
    "A single icon for a children's finance app, centred on a plain flat cream background (#FFFCF5). "
    "Style: chunky rounded sticker illustration, soft dark-teal ink outline about 3px, "
    "a white gloss highlight across the upper third, a soft contact shadow beneath, gentle top-down light. "
    "Multi-colour — two to four colours from this palette only: deep intaglio teal #0E6B78, "
    "warm treasure gold #F0B429, soft terracotta #C4453C, muted sage #178A4C, warm cream #FFFCF5. "
    "Generous negative space, chunky forms, no thin lines, must still read clearly at 20 pixels. "
    "Not flat, not monotone, not a line icon, not a 3D render, not photographic. "
    "ABSOLUTELY NO text, letters, numbers, logos, watermarks or signage anywhere. No human figures, "
    "no faces, no hands."
)

ICONS = {
    # the day
    "lesson":   "an open storybook, teal cover, cream pages, a gold ribbon bookmark, one small sparkle lifting off it",
    "work":     "a wooden handcart stacked with two gold crates, teal wheels",
    "quest":    "a rolled paper scroll tied with a teal ribbon, a gold wax seal",
    "closing":  "a crescent moon in deep teal with a small gold star beside it",
    # money
    "wallet":   "a chunky teal purse with a gold clasp, one gold coin peeking out of the top",
    "jars":     "three squat glass jars in a row, filled to different heights with gold, sage and terracotta",
    "goal":     "a small flag on a pole planted on a rounded gold mound, teal flag",
    "bank":     "a small round-columned building with a teal pediment and gold steps",
    "coin":     "a single fat glossy gold coin seen face on, bright rim, big white shine, a small teal star embossed in the middle",
    "bill":     "a folded paper note, cream with a teal border pattern, one corner curled",
    # markets
    "market":   "a rising stepped bar chart of three chunky bars in gold, teal and sage, with a small teal arrow curving up over them",
    "company":  "a small rounded factory with two chimneys, teal walls, gold roof, one soft cream puff of smoke",
    "report":   "a stack of three papers with a gold paperclip, the top one showing an abstract bar pattern with no numbers",
    "risk":     "a pair of old balance scales in teal, one gold pan hanging lower than the other",
    # the town
    "town":     "three simple rounded rooftops of different heights in teal, terracotta and gold, side by side",
    "shop":     "a small shopfront with a striped gold and cream awning and a teal door",
    "postbox":  "a rounded terracotta postbox on a teal post with a gold letter slot",
    "deed":     "a small brass plaque on a teal post, blank gold face, no writing on it at all",
}

SECTORS = {
    "sec-staples":  "a woven basket holding a loaf, a jar and a bundle of greens",
    "sec-energy":   "a chunky lightning bolt in gold crossing a small teal turbine",
    "sec-finance":  "a small round-columned bank building with a gold coin resting against it",
    "sec-tech":     "a rounded laptop seen at a slight angle, teal shell, a gold circuit pattern on the lid",
    "sec-health":   "a rounded pill capsule, half teal half cream, beside a small sage cross",
    "sec-industry": "a small gold crane lifting a teal girder",
    "sec-consumer": "a shopping bag in terracotta with rounded gold handles and a teal star on the side",
    "sec-infra":    "a stretch of teal pipe and a gold pylon side by side",
}

def main():
    todo = {**{f"icon-{k}": v for k, v in ICONS.items()},
            **{f"icon-{k}": v for k, v in SECTORS.items()}}
    only = sys.argv[1:] 
    if only:
        todo = {k: v for k, v in todo.items() if any(o in k for o in only)}
    print(f"{len(todo)} to draw", flush=True)
    ok = 0
    for name, subject in todo.items():
        path = f"{name}.png"
        if os.path.exists(path):
            print(f"  skip {name}", flush=True); ok += 1; continue
        try:
            data = call(f"{BIBLE} The icon shows: {subject}.")
            if not data:
                print(f"  FAIL {name}: no image returned", flush=True); continue
            open(path, 'wb').write(data); ok += 1
            print(f"  ok   {name} ({len(data)//1024} kB)", flush=True)
        except Exception as e:
            print(f"  FAIL {name}: {type(e).__name__} {str(e)[:120]}", flush=True)
        time.sleep(1)
    print(f"done — {ok}/{len(todo)}", flush=True)

if __name__ == "__main__":
    main()
