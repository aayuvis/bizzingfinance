/* build.mjs — one self-contained HTML file.
   Dev runs the ES modules natively over http; this exists so the whole town
   can be handed to somebody as a single file (and published as an Artifact,
   where a strict CSP allows no external host but Google Fonts). */
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'dist');
mkdirSync(out, { recursive: true });

const res = await build({
  entryPoints: [join(here, 'src/main.js')],
  bundle: true, format: 'iife', minify: false, write: false, target: 'es2020',
});
const js = res.outputFiles[0].text;
const css = ['styles/tokens.css', 'styles/app.css']
  .map((f) => readFileSync(join(here, f), 'utf8')).join('\n');

const html = readFileSync(join(here, 'index.html'), 'utf8')
  .replace(/<link rel="stylesheet" href="styles[^>]*>\s*/g, '')
  .replace(/<link rel="manifest"[^>]*>\s*/g, '')
  .replace('</head>', `<style>\n${css}\n</style>\n</head>`)
  /* the single file has nothing to fetch, so it must not look for a worker */
  .replace(/<script type="module"[^>]*><\/script>/,
    `<script>window.BZF_SINGLE=true;</script>\n<script>\n${js}\n</script>`);

writeFileSync(join(out, 'bizzington.html'), html);
console.log('dist/bizzington.html', (html.length / 1024).toFixed(0) + 'kb');
