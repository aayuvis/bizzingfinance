"""covers.py — a painted cover for every Arcade game, and one for the Market Game.

India's Mela leads with a painting per game and the words sit on it; a list of
titles with a star icon is a menu, not an arcade. Each cover is a SCENE in the
house style — the thing the game is about, no characters' faces needed, no
text ever — cropped wide so the title can sit on a veil across the bottom.

    export GKEY=…            # never committed
    python3 covers.py        # writes cover-*.png here (gitignored)
"""
import os, sys, time
from gen import call, BIBLE

COVER = (
    "A wide landscape scene, 16:10, painted edge to edge with no border and no frame, "
    "the lower third calmer and darker so a title could sit across it. "
    "No text, no letters, no numbers, no signage anywhere. "
)
JOBS = [
  ('cover-cr', "Gold and copper coins tumbling down through a warm sky over an EMPTY cobbled market street of closed stalls with striped awnings, nobody about, a small open wooden tray waiting on the cobbles below to catch them; playful, bright, motion in the coins. No people, no animals, no figures of any kind."),
  ('cover-nw', "A brass balance scale on a wooden counter: one pan holds a loaf of bread, a pair of shoes and a jug of milk; the other holds a kite, a toy boat and a stick of candy. Soft window light, a small brass bell beside it."),
  ('cover-ss', "Two identical-looking sealed envelopes on a doormat inside a cottage door, one with a faint sinister shadow behind it and a tiny fishing hook peeking from its flap, the other plain and honest; dramatic side light, deep teal shadows."),
  ('cover-bb', "A wooden kitchen table with a neat stack of paper bills, a small tin of coins, a calendar with the days ticked off, and a window showing a month of weather changing from sun to rain; cosy, orderly, a little tense."),
  ('cover-cc', "A tall slender tower of stacked gold coins rising out of a green meadow up into the clouds, taller than the trees, leaning slightly, a tiny ladder against it, some coins at the very top starting to wobble; grand and vertiginous."),
  ('cover-sr', "A busy little tea stall at rush hour: a steaming brass kettle, a row of clay cups, a queue of small shadowy silhouettes seen only as shapes in the warm morning haze, a crate of supplies half empty; energetic, warm, hurried."),
  ('cover-st', "A stormy exchange square at dusk: dark thunderclouds and rain over a big chalkboard of falling red arrows, umbrellas blown inside out, one calm lit bench under a lamp where someone could sit still; dramatic teal and red, and the small calm island of warm light."),
  ('cover-mc', "A gleaming gold trophy cup on a wooden podium in a town square decorated with bunting, six little flags in a row, a chalk scoreboard with blank lines, confetti in the air; festive and competitive."),
  ('cover-mn', "A whimsical board game laid out on a table: a winding path of painted squares around a miniature town of tiny shops and cottages, a red and a teal wooden pawn, a pair of dice mid-roll, all in warm evening lamplight; inviting, tactile."),
  ('cover-tt', "A wall calendar of twelve months as twelve little painted panels, each with a small coin on it, and below them one large heavy sack of coins tied with string; clear, orderly, quietly surprising."),
  ('cover-sn', "A small snowball at the top of a long snowy hill and the same snowball, enormous, at the bottom, having rolled down through pine trees under a pale winter sun; the path it took drawn in the snow; magical scale."),
  ('cover-m40', "A grand old exchange hall with tall windows, a long chalkboard of gentle rising and falling lines across decades, brass lamps, worn wooden benches, dust in the light; timeless, studious, patient."),
]

if __name__ == '__main__':
    only = sys.argv[1:] or None
    todo = [(n, p) for n, p in JOBS if not only or n in only]
    print(f'{len(todo)} covers to paint')
    for name, prompt in todo:
        out = f'{name}.png'
        if os.path.exists(out) and not only:
            print('skip', out); continue
        img = call(BIBLE + "\n\n" + COVER + prompt)
        if img: open(out, 'wb').write(img); print('wrote', out, len(img)//1024, 'kB')
        else: print('FAILED', name)
        time.sleep(1.5)
