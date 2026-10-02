/* serve.mjs — serve build/ at the path GitHub Pages serves it from, so a
   relative-path mistake shows up here and not on the live site. (Copied from
   Bizzing Schedule, the family model for the browser check.) */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
export const BASE = '/bizzingfinance/';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };
export function serve(root, port = +(process.env.PORT || 0)) {
  return new Promise((res) => {
    const s = createServer(async (req, out) => {
      const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (!u.startsWith(BASE)) { out.writeHead(404); return out.end('outside base'); }
      let p = normalize(join(root, u.slice(BASE.length) || 'index.html'));
      if (p.endsWith('/')) p += 'index.html';
      try { const b = await readFile(p); out.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); out.end(b); }
      catch { out.writeHead(404); out.end('nf'); }
    }).listen(port, () => res(s));
  });
}
