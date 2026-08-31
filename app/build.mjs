/* build.mjs — one self-contained HTML file.
   Dev runs the ES modules natively over http; this exists so the whole town
   can be handed to somebody as a single file. "Self-contained" is meant
   literally: the file fetches nothing, from anywhere, ever — so it works from
   a USB stick, an email attachment, or an Artifact under a strict CSP. */
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
  /* the one-file build swaps in the lite lesson list: chapter 1 speaks, the
     rest teach in captions on the measured clock. Without this the "single"
     file would carry five megabytes of narration. */
  plugins: [{
    name: 'lite-lessons',
    setup(b) {
      b.onResolve({ filter: /lessonindex-list\.js$/ }, (args) => ({
        path: join(args.resolveDir, 'lessonindex-lite.js'),
      }));
    },
  }],
});
const js = res.outputFiles[0].text;
const css = ['styles/fonts.css', 'styles/tokens.css', 'styles/app.css']
  .map((f) => readFileSync(join(here, f), 'utf8')).join('\n');

/* The fingerprinted build serves the faces as files and lets unicode-range
   decide which ones a browser bothers to fetch. A single file cannot do that:
   it has no second request to make, so every face is inlined. That is the
   whole cost of the format and it is paid knowingly. */
const inlined = css.replace(/url\((fonts\/[\w.-]+\.woff2)\)/g, (_, f) =>
  `url(data:font/woff2;base64,${readFileSync(join(here, 'styles', f)).toString('base64')})`);
if (/https?:\/\//.test(inlined.replace(/\/\*[\s\S]*?\*\//g, '')))
  throw new Error('a stylesheet still reaches off-origin — the single file must fetch nothing');

const html = readFileSync(join(here, 'index.html'), 'utf8')
  .replace(/<link rel="stylesheet" href="styles[^>]*>\s*/g, '')
  .replace(/<link rel="manifest"[^>]*>\s*/g, '')
  .replace('</head>', `<style>\n${inlined}\n</style>\n</head>`)
  /* the single file has nothing to fetch, so it must not look for a worker */
  .replace(/<script type="module"[^>]*><\/script>/,
    `<script>window.BZF_SINGLE=true;</script>\n<script>\n${js}\n</script>`);

writeFileSync(join(out, 'bizzington.html'), html);
console.log('dist/bizzington.html', (html.length / 1024).toFixed(0) + 'kb');
