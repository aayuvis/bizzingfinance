"""scripts.py — the voice scripts for the animated lessons.

The Bizzing Bee treatment, kept whole: a concept gets a narrated animated
explainer FIRST, then the reading card, then the drill. The rules these
scripts keep, inherited from the family's production brief:

  · the script teaches EXACTLY what the card teaches — same claim, same
    example, same words where it matters. A video that teaches a better
    lesson than the card is a bug in the card; go fix the card.
  · the audio is the clock. Every beat below carries the LINE it follows,
    never a hard-coded second count — the renderer times beats from the
    generated narration, so a re-recorded voice moves its own cues.
  · no invented numbers, no invented facts. The rain, the umbrella and the
    birthday cake are the card's own.

Each beat: (line of narration, scene direction for the SVG stage).
Scene directions name STAGE ACTIONS the player knows how to draw — they are
a vocabulary, not free text: avatar(pose), show(thing), sort(thing, side),
swap(a, b), banner(text).
"""

LESSONS = {
  'c1b': {
    'title': 'Needs and wants',
    'voice_note': 'warm, unhurried, a grandmother explaining at a kitchen table',
    'beats': [
      ("Here is a question that looks easy and isn't.",
       "avatar(talk)"),
      ("Some things, you would be in real trouble without. Food. A roof. Medicine when you are ill. Those are needs.",
       "show(roti); show(roof); show(medicine); banner(NEEDS)"),
      ("Some things just make life nicer. A birthday cake. A video game. A gold chain, if you like that sort of thing.",
       "show(cake); show(game); show(chain); banner(WANTS)"),
      ("Both are allowed. Nobody is in trouble for wanting things — wanting things is most of the fun.",
       "avatar(smile)"),
      ("The trick is knowing which one you are looking at, before you pay.",
       "avatar(point); banner(BEFORE YOU PAY)"),
      ("But watch this. Rain is coming.",
       "avatar(talk); weather(rain)"),
      ("Today, an umbrella is a need. In dry May, the very same umbrella is a want.",
       "show(umbrella); sort(umbrella, needs); weather(sun); sort(umbrella, wants)"),
      ("Same umbrella. Different day. Lots of things move between the two columns like that.",
       "swap(umbrella)"),
      ("So needs versus wants is not a list you memorise. It is a question you ask — every time, just before the money leaves your hand.",
       "avatar(point); banner(IT'S A QUESTION, NOT A LIST)"),
    ],
  },
}

if __name__ == '__main__':
    import json, sys
    lid = sys.argv[1] if len(sys.argv) > 1 else 'c1b'
    L = LESSONS[lid]
    print(f"{lid} — {L['title']}: {len(L['beats'])} beats, "
          f"{sum(len(b[0].split()) for b in L['beats'])} words "
          f"(~{sum(len(b[0].split()) for b in L['beats']) / 2.3:.0f}s at a teaching pace)")
    for line, stage in L['beats']:
        print(f"  · {line}\n      → {stage}")
