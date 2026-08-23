"""gen.py — draw Bizzington's art with a generative image model.

The key lives in the environment and never in a file that gets committed.
Rules this script keeps, from the family's production brief:
  · no generated lettering — type is composited later, in the app's own faces
  · characters are drawn as what the story needs them to be; Mags sells, she is
    not a villain, and nobody is drawn frightening
  · style is one bible shared by every prompt, or the cast won't look related
"""
import base64, json, os, sys, time, urllib.request

KEY = os.environ.get('GKEY') or open('.gkey').read().strip()
MODEL = os.environ.get('GMODEL', 'gemini-3-pro-image')
URL = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent'

BIBLE = (
    "Children's picture-book illustration. Soft gouache and coloured-pencil texture, "
    "rounded friendly shapes, gentle warm shading, no harsh black outlines. "
    "Palette: warm cream, deep teal, warm gold, soft terracotta, muted sage green. "
    "Kind, warm, hand-made feeling — like a well-loved storybook, not a cartoon or a 3D render. "
    "IMPORTANT: absolutely no text, no letters, no numbers, no logos, no watermarks, no signage "
    "anywhere in the image. No human figures."
)

def call(prompt, tries=3):
    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }).encode()
    for n in range(tries):
        try:
            req = urllib.request.Request(URL, data=body, method='POST', headers={
                'Content-Type': 'application/json', 'X-goog-api-key': KEY})
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.loads(r.read())
            for c in d.get('candidates', []):
                for p in c.get('content', {}).get('parts', []):
                    inline = p.get('inlineData') or p.get('inline_data')
                    if inline and inline.get('data'):
                        return base64.b64decode(inline['data'])
            print('  no image part; response keys:', list(d.keys()), file=sys.stderr)
            fr = (d.get('candidates') or [{}])[0].get('finishReason')
            if fr: print('  finishReason:', fr, file=sys.stderr)
        except Exception as e:
            print(f'  attempt {n+1} failed: {e}', file=sys.stderr)
        time.sleep(2 + n * 3)
    return None

if __name__ == '__main__':
    out, prompt = sys.argv[1], sys.argv[2]
    img = call(BIBLE + "\n\n" + prompt)
    if not img:
        print('FAILED', out); sys.exit(1)
    open(out, 'wb').write(img)
    print('wrote', out, len(img) // 1024, 'kB')
