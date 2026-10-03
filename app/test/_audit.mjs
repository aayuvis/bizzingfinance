import { chromium } from 'playwright';
import { serve, BASE } from './serve.mjs';
const srv = await serve(new URL('../build', import.meta.url).pathname);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto(`http://localhost:${srv.address().port}${BASE}?demo`); await p.waitForSelector('[data-bz=next]'); await p.waitForTimeout(1500);
await p.evaluate(() => { window.BZF.R.s.settings.tester = true; window.BZF.setTester(true); window.BZF.fire('closeOv'); });
const KEYS = { cr: ['ArrowLeft','ArrowRight'], nw: ['ArrowLeft','ArrowRight'], ss: ['ArrowLeft','ArrowRight'], bb: ['1','2'], cc: [' '], sr: ['1','2','3','4','r'], st: [' '], mc: ['ArrowDown','ArrowUp','Enter'], mn: ['Enter',' '], tt: ['1','2','3','4'], sn: ['1','2','3','4'],
  'job:stack': [' '], 'job:trim': ['ArrowLeft','ArrowRight'], 'job:sweep': ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'], 'job:runner': ['ArrowUp','ArrowDown',' '] };
const list = (process.env.G || 'cr,nw,ss,bb,cc,sr,st,mc,mn,tt,sn,job:crates,job:cargo,job:sweep,job:flyers').split(',');
const out = [];
for (const g of list) {
  const e0 = errs.length;
  await p.evaluate((g) => { const B = window.BZF; B.fire('closeOv'); if (g.startsWith('job:')) { const id = g.slice(4); const gm = B.startJobGame(id, () => { B.quitGame(); }); B.R.game = gm; B.R.s.ui.nav = 'arcade'; B.fire('closeOv'); } else { B.fire('game', g); B.fire('gbegin', g); } }, g);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `/tmp/claude-0/shots/a-${g.replace(':','_')}-1.png` });
  const kind = g.startsWith('job:') ? 'job:' + (await p.evaluate((id) => { return null; }, g)) : g;
  const keys = KEYS[g] || KEYS['job:' + ({crates:'stack',cargo:'trim',sweep:'sweep',flyers:'runner'})[g.slice(4)]] || ['Enter'];
  const t0 = Date.now(); let done = false, changes = 0, prev = '';
  while (Date.now() - t0 < (+process.env.T || 25000)) {
    const k = keys[Math.floor(Math.random() * keys.length)];
    await p.keyboard.press(k).catch(() => {});
    if (Math.random() < .3) { const btn = p.locator('.gplay button[data-act]:not([data-act="gquit"]):not([disabled])'); const n = await btn.count(); if (n) await btn.nth(Math.floor(Math.random() * n)).click({ timeout: 500 }).catch(() => {}); }
    await p.waitForTimeout(250);
    const h = await p.evaluate(() => (document.querySelector('.gplay') || {}).innerText || '');
    if (h !== prev) changes++; prev = h;
    done = await p.evaluate(() => !!document.querySelector('.gplay .endcard') || !window.BZF.R.game);
    if (done) break;
  }
  await p.screenshot({ path: `/tmp/claude-0/shots/a-${g.replace(':','_')}-2.png` });
  out.push({ g, done, secs: Math.round((Date.now() - t0) / 1000), changes, errors: errs.slice(e0).slice(0, 2) });
  await p.evaluate(() => { const B = window.BZF; if (B.R.game) B.quitGame(); B.R.gameIntro = null; B.fire('nav', 'play'); });
}
console.log(JSON.stringify(out, null, 1));
await b.close(); srv.close();
