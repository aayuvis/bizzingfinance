/* externalise-art.mjs — art lives in files, never inside JavaScript
   (FAMILY-STANDARD §11, N2).

   The tools/art and tools/lessons generators embed each painting as a
   data: URI in a *-gen.js module. Shipped that way the first screen carried
   1.9 MB of pictures it was not showing. This pass lifts every embedded
   image into src/art/<content-hash>.<ext> and leaves behind
       new URL('./art/<hash>.webp', import.meta.url).href
   which native ES modules resolve as-is, which Vite turns into a hashed,
   cache-first file loaded only when a screen draws it, and which build.mjs
   folds back into a data: URI for the one-file build.

   Idempotent: run it after any generator (npm run build does, via prebuild);
   a module with nothing embedded is left byte-for-byte alone. */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const ART = join(SRC, 'art');
const FILES = readdirSync(SRC).filter((f) => /-gen\.js$|^lessons-poses\.js$/.test(f));
const RE = /(['"])data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)\1/g;

let moved = 0, bytes = 0;
for (const f of FILES) {
  const p = join(SRC, f), s = readFileSync(p, 'utf8');
  if (!RE.test(s)) continue;
  RE.lastIndex = 0;
  const out = s.replace(RE, (_, q, ext, b64) => {
    const buf = Buffer.from(b64, 'base64');
    const name = `${f.replace(/\.js$/, '')}-${createHash('sha1').update(buf).digest('hex').slice(0, 10)}.${ext === 'jpeg' ? 'jpg' : ext}`;
    mkdirSync(ART, { recursive: true });
    if (!existsSync(join(ART, name))) writeFileSync(join(ART, name), buf);
    moved++; bytes += buf.length;
    return `new URL('./art/${name}', import.meta.url).href`;
  });
  writeFileSync(p, out);
}
console.log(moved ? `externalise-art: moved ${moved} images (${(bytes / 1024 / 1024).toFixed(2)} MB) out of ${FILES.length} modules` : 'externalise-art: nothing embedded');
