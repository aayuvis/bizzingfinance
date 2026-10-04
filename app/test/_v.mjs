import { chromium } from 'playwright';
import { serve, BASE } from './serve.mjs';
const srv = await serve(new URL('../build', import.meta.url).pathname);
const U = `http://localhost:${srv.address().port}${BASE}`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const D = '/tmp/claude-0/shots/v4-';
const tag = process.env.TAG || 'before';
async function page(o = {}) { const ctx = await b.newContext({ viewport: { width: o.w || 390, height: 844 }, isMobile: (o.w || 390) < 500, colorScheme: o.dark ? 'dark' : 'light' }); const p = await ctx.newPage(); await p.goto(U + (o.q ?? '?demo')); if (o.q !== '') { await p.waitForSelector('[data-bz=next]'); await p.waitForTimeout(1200); await p.evaluate(() => window.BZF.fire('closeOv')); } else await p.waitForTimeout(1200); return p; }
let p = await page(); await p.evaluate(() => { location.hash = '#/atlas'; }); await p.waitForTimeout(600);
const cur = await p.$('.stop.cur'); if (cur) { await cur.scrollIntoViewIfNeeded(); await cur.screenshot({ path: D + tag + '-atlas-cur.png' }); }
await p.evaluate(() => { location.hash = '#/town'; }); await p.waitForTimeout(600);
await p.screenshot({ path: D + tag + '-town-top.png' });
const tr = await p.$('.travel'); if (tr) { await tr.scrollIntoViewIfNeeded(); await tr.screenshot({ path: D + tag + '-posters.png' }); }
await p.evaluate(() => { location.hash = '#/collection'; }); await p.waitForTimeout(600); await p.screenshot({ path: D + tag + '-collection.png' });
await p.evaluate(() => { location.hash = '#/money/wallet'; }); await p.waitForTimeout(600); await p.screenshot({ path: D + tag + '-statement.png', fullPage: true });
p = await page({ dark: true }); await p.screenshot({ path: D + tag + '-home-dark.png' });
p = await page({ q: '' }); await p.screenshot({ path: D + tag + '-landing.png', fullPage: true });
await b.close(); srv.close();
