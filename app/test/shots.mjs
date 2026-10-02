/* shots.mjs — screenshots of the family surfaces, desktop 1280 and phone 390, light
   and dark, for a person to look at (not a check). SHOTS=dir PORT=n node test/shots.mjs [routes] */
import { chromium } from 'playwright';
import { serve, BASE } from './serve.mjs';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
const ROOT = fileURLToPath(new URL('../build', import.meta.url));
const OUT = process.env.SHOTS || '/tmp/shots'; mkdirSync(OUT, { recursive: true });
const srv = await serve(ROOT);
const URL0 = `http://localhost:${srv.address().port}${BASE}`;
const exe = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const browser = await chromium.launch({ executablePath: exe });
const routes = (process.argv[2] || 'home,town,learn,money,play,shop,collection,me,medals,mistakes').split(',');
const extra = (process.argv[3] || '').split(',').filter(Boolean);
for (const [label, vp, mob, scheme] of [['desk', { width: 1280, height: 860 }, false, 'light'], ['desk-dark', { width: 1280, height: 860 }, false, 'dark'], ['phone', { width: 390, height: 844 }, true, 'light'], ['phone-dark', { width: 390, height: 844 }, true, 'dark']]) {
  if (process.env.ONLY && !process.env.ONLY.split(',').includes(label)) continue;
  const ctx = await browser.newContext({ viewport: vp, isMobile: mob, hasTouch: mob, deviceScaleFactor: 1, colorScheme: scheme, reducedMotion: 'reduce' });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(URL0 + (process.env.DEMO ? '?demo' : ''));
  if (process.env.PLAN) await page.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('bzf_profile') || 'null'); } catch (e) {} });
  if (!process.env.DEMO) {
    await page.waitForSelector('[data-act="obStart"]'); await page.click('[data-act="obStart"]');
    await page.fill('#nm', 'Asha'); await page.click('[data-act="obAvatar"]'); await page.click('[data-act="obNext"]');
    await page.locator('[data-act="obBand"]').last().click();
  }
  await page.waitForSelector('main'); await page.waitForTimeout(800);
  if (process.env.LOOK) await page.evaluate((l) => { window.BZF.R.s.settings.plan = 'family'; window.BZF.fire('look', l); }, process.env.LOOK);
  await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); });
  for (const r of routes) {
    await page.evaluate((x) => { location.hash = '#/' + x; }, r); await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${label}-${r}.png`, fullPage: !!process.env.FULL });
  }
  for (const a of extra) {
    const [act, arg] = a.split(':');
    await page.evaluate(([x, y]) => window.BZF.fire(x, y), [act, arg]); await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${label}-x-${act}${arg ? '-' + arg : ''}.png` });
    await page.evaluate(() => window.BZF.fire('closeOv'));
  }
  if (errs.length) console.log(label, 'ERRORS', errs.slice(0, 5).join(' | '));
  await ctx.close();
}
await browser.close(); srv.close(); console.log('shots in', OUT);
