"""voice.py — narrate a lesson, one clip per beat.

Per-beat clips rather than one long take, for the same reason the app keeps
per-story hook and moral clips: each beat can be re-recorded alone, and the
animation times itself from each clip's real duration — the audio is the
clock, and a re-recorded line moves its own cue.

The two synthesiser failure modes in the family's CLAUDE.md, both handled:
a 200 with an empty clip (every clip is MEASURED — duration and loudness —
before it is kept), and a failed clip leaving stale audio on disk (clips are
written to a fresh run directory and only promoted when the whole lesson
verifies).

    export GKEY=…
    python3 voice.py c1b
"""
import base64, json, os, shutil, struct, subprocess, sys, time, urllib.request
from scripts import LESSONS

KEY = os.environ['GKEY']
MODEL = 'gemini-2.5-flash-preview-tts'
URL = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent'
# Neutral by request of the product owner: Bizzing Finance is the family's
# global app (five currencies, "never assume a family's money"), and its
# narrator carries no region — a deliberate divergence from Bizzing India's
# channel voice, which is Indian because THERE that is the point.
STYLE = ('Speak as a warm, unhurried storybook narrator with a neutral, accent-free '
         'delivery — a kind grandmother explaining something to a nine-year-old at a '
         'kitchen table. Natural, clear, gently amused, never rushed. '
         'Say exactly this and nothing else: ')
VOICE = 'Aoede'
RATE = 24000

def tts(line, tries=3):
    body = json.dumps({
        'contents': [{'parts': [{'text': STYLE + line}]}],
        'generationConfig': {'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': VOICE}}}},
    }).encode()
    for n in range(tries):
        try:
            req = urllib.request.Request(URL, data=body, method='POST',
                headers={'Content-Type': 'application/json', 'X-goog-api-key': KEY})
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.loads(r.read())
            part = d['candidates'][0]['content']['parts'][0]['inlineData']
            assert part['mimeType'].startswith('audio/L16')
            return base64.b64decode(part['data'])
        except Exception as e:
            print(f'  attempt {n+1}: {e}', file=sys.stderr); time.sleep(2 + 2 * n)
    return None

def wav(pcm):
    return (b'RIFF' + struct.pack('<I', 36 + len(pcm)) + b'WAVEfmt ' +
            struct.pack('<IHHIIHH', 16, 1, 1, RATE, RATE * 2, 2, 16) +
            b'data' + struct.pack('<I', len(pcm)) + pcm)

def measure(pcm):
    """duration in seconds, and rough loudness — a silent 200 is a failure"""
    import array
    a = array.array('h'); a.frombytes(pcm[:len(pcm) // 2 * 2])
    dur = len(a) / RATE
    if not len(a): return 0, -120
    rms = (sum(x * x for x in a) / len(a)) ** 0.5
    import math
    return dur, 20 * math.log10(max(rms, 1) / 32768)

if __name__ == '__main__':
    if sys.argv[1:] == ['--all']:
        import subprocess as sp
        for k in LESSONS:
            if os.path.exists(f'run-{k}/manifest.json'):
                print(f'skip {k} (recorded)'); continue
            r = sp.run([sys.executable, 'voice.py', k])
            if r.returncode: print(f'{k}: FAILED RUN')
        sys.exit(0)
    lid = sys.argv[1]
    L = LESSONS[lid]
    run = f'run-{lid}'
    shutil.rmtree(run, ignore_errors=True); os.makedirs(run)
    manifest = []
    ok = True
    for i, (line, stage) in enumerate(L['beats']):
        pcm = tts(line)
        if not pcm: print(f'beat {i}: FAILED'); ok = False; continue
        dur, db = measure(pcm)
        flag = '' if dur >= 0.9 and db > -40 else '  ← SUSPECT (silent/short)'
        if flag: ok = False
        mp3f = f'{run}/{lid}-{i}.mp3'
        import lameenc
        enc = lameenc.Encoder(); enc.set_bit_rate(40); enc.set_in_sample_rate(RATE)
        enc.set_channels(1); enc.set_quality(2)
        open(mp3f, 'wb').write(bytes(enc.encode(pcm)) + bytes(enc.flush()))
        manifest.append({'i': i, 'dur': round(dur, 2), 'db': round(db, 1),
                         'kb': os.path.getsize(mp3f) // 1024, 'line': line, 'stage': stage})
        print(f'beat {i}: {dur:5.2f}s  {db:6.1f} dB  {os.path.getsize(mp3f)//1024:3} kB{flag}')
        time.sleep(1)
    json.dump(manifest, open(f'{run}/manifest.json', 'w'), indent=1)
    total = sum(m['dur'] for m in manifest)
    print(f'\n{len(manifest)}/{len(L["beats"])} clips · {total:.0f}s · '
          f'{sum(m["kb"] for m in manifest)} kB · {"VERIFIED" if ok and len(manifest) == len(L["beats"]) else "NOT CLEAN — do not promote"}')
