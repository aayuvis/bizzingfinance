import { defineConfig } from 'vite';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/* The service worker is not an app module — it must land at the build root
   unhashed, or its scope is wrong. One inline plugin beats a dependency. */
function copySW() {
  return {
    name: 'copy-sw',
    closeBundle() {
      const src = resolve(__dirname, 'sw.js');
      if (existsSync(src)) copyFileSync(src, resolve(__dirname, 'build/sw.js'));
    },
  };
}

export default defineConfig({
  /* Relative base so a build drops onto any static host — GitHub Pages, a CDN
     path, or a folder someone opens through a local server. */
  base: './',
  plugins: [copySW()],
  build: { outDir: 'build', emptyOutDir: true, target: 'es2020' },
  server: { port: 8080, open: false },
});
