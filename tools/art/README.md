# tools/art — drawing Bizzington

The cast portraits and the world backdrop plates are generated with a generative
**image** model and then processed down into `app/src/art-gen.js` as WebP data URIs.

```bash
export GKEY=…                 # never committed, never written to a file in this repo
python3 batch.py              # writes cast-*.png and world-*.png here
python3 process.py            # crops, resizes, and writes app/src/art-gen.js
```

## The rules these prompts keep

Inherited from the family's production brief, which was paid for once already:

- **Generative image models are allowed; generated motion is not.** Sprites and plates are
  drawn this way. Nothing animates that a model produced.
- **No generated lettering, ever.** Every prompt forbids text, letters, numbers, logos and
  signage — generated type is unreliable, unbrandable, and in an Indic script it would break
  the app's rule about setting the script properly. All type is the app's own faces, over
  the top.
- **One style bible across every prompt**, or the cast does not look related.
- **Characters are drawn as what the story needs them to be.** Mags sells things; she is not
  a villain and is never drawn sinister. Bea is anxious, never frightening. Bo has blunt
  horns and no aggression. Nobody has visible teeth or claws.
- **No human figures**, and nothing sacred to anyone, anywhere.
- **Backdrop plates are empty in the foreground.** They are stage sets; the functional SVG
  buildings are drawn on top, because those carry live state — jar levels, goal progress,
  the bank clock — and a painted building could not.

## Disclosure

The artwork is AI-generated and the app says so in the grown-up's page. That is the
synthetic-media disclosure rule, and on a children's product it is also just honesty.
