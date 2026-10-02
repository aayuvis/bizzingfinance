/* browser.mjs — drive the BUILT app in Chromium, desktop and phone, at the
   sub-path GitHub Pages serves it from (FAMILY-STANDARD §15). Every check is
   something a family would notice, and every one was watched failing first.

   Run: npm run build && npm run check   (deploy.sh runs both) */
import { chromium } from 'playwright';
import { serve, BASE } from './serve.mjs';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';

const ROOT = fileURLToPath(new URL('../build', import.meta.url));
const SHOTS = process.env.SHOTS || '';
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const srv = await serve(ROOT);
const URL0 = `http://localhost:${srv.address().port}${BASE}`;
let fail = 0, pass = 0;
const ok = (name, cond, extra = '') => { if (cond) pass++; else fail++; console.log(`${cond ? '  ok  ' : '  FAIL'} ${name}${extra ? '   ' + extra : ''}`); };

/* N2 · the weight budget, measured on the build itself (FAMILY-STANDARD §11) */
{
  const { readFileSync, readdirSync } = await import('node:fs');
  const { gzipSync } = await import('node:zlib');
  const html = readFileSync(ROOT + '/index.html', 'utf8');
  const entry = [...html.matchAll(/<script[^>]+src="\.?\/?([^"]+\.js)"/g)].map((m) => m[1]);
  const gz = entry.reduce((t, f) => t + gzipSync(readFileSync(ROOT + '/' + f)).length, 0);
  ok(`build: initial JavaScript is ≤ 400 KB gzipped`, entry.length > 0 && gz <= 400 * 1024, `${Math.round(gz / 1024)} KB gz in ${entry.join(', ')}`);
  const inlined = readdirSync(ROOT + '/assets').filter((f) => f.endsWith('.js') && /data:image\//.test(readFileSync(ROOT + '/assets/' + f, 'utf8')));
  ok(`build: no picture is inlined into JavaScript`, inlined.length === 0, inlined.join(', '));
}

const exe = process.env.CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath: exe });

/* the one filled button: a .btn that is not ghost, visible, and not inside a
   closed fold */
const PRIMARY = () => [...document.querySelectorAll('.btn:not(.ghost)')].filter((b) => {
  if (!b.offsetParent || b.disabled) return false;
  for (let p = b.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS' && !p.open) return false;
  return true;
}).map((b) => b.closest('.continue') ? 'continue' : (b.textContent || '').trim().slice(0, 30));

/* WCAG relative luminance contrast of every visible text node's colour against
   the nearest opaque background behind it. Text on a painting (the Continue
   card, covers) carries its own veil and is skipped by class. */
const CONTRAST = () => {
  const lum = (c) => { const v = c.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  /* color-mix() computes to color(srgb r g b / a) with 0–1 channels */
  const rgb = (s) => { const n = (s.match(/[\d.]+/g) || []).map(Number); return /^color\(srgb/.test(s) ? n.map((x, i) => i < 3 ? x * 255 : x) : n; };
  const bgOf = (el) => { for (let p = el; p; p = p.parentElement) { const c = rgb(getComputedStyle(p).backgroundColor); if (c.length >= 3 && (c.length < 4 || c[3] > 0.9)) return c.slice(0, 3); if (getComputedStyle(p).backgroundImage !== 'none') return null; } return rgb(getComputedStyle(document.body).backgroundColor).slice(0, 3); };
  const bad = [];
  const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) {
    const el = n.parentElement; if (!n.textContent.trim() || !el.offsetParent) continue;
    if (el.closest('.continue,.cover,.poster,.actban,.town,svg,details:not([open]) > :not(summary)')) continue;
    const st = getComputedStyle(el); if (+st.opacity < 1) continue;
    const bg = bgOf(el); if (!bg) continue;
    const fg = rgb(st.color); const a = fg[3] == null ? 1 : fg[3];
    const mix = fg.slice(0, 3).map((x, i) => x * a + bg[i] * (1 - a));
    const L1 = lum(mix), L2 = lum(bg), cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const big = parseFloat(st.fontSize) >= 18.66 || (parseFloat(st.fontSize) >= 14 && +st.fontWeight >= 700);
    if (cr < (big ? 3 : 4.5)) bad.push(`${n.textContent.trim().slice(0, 24)} ${cr.toFixed(2)}`);
  }
  return bad;
};

async function run(label, vp, isMobile, scheme) {
  const ctx = await browser.newContext({ viewport: vp, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(URL0) && !u.startsWith('data:') && !u.startsWith('blob:')) errors.push('third-party request ' + u); });
  page.on('response', (r) => { if (r.url().startsWith(URL0) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  const shot = (n) => SHOTS && page.screenshot({ path: `${SHOTS}/${label}-${n}.png` });

  /* Measured against the DEVICE width: under mobile emulation Chromium widens
     innerWidth to fit whatever overflows, so innerWidth can never catch it. */
  const noOverflow = async (where) => {
    const bad = await page.evaluate((W) => {
      const scrolls = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') return true; } return false; };
      const out = [...document.querySelectorAll('#app *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.right > W + 1 && !scrolls(el) && getComputedStyle(el).position !== 'fixed'; })
        .slice(0, 3).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
      if (document.scrollingElement.scrollWidth > W + 1) out.push(`page is ${document.scrollingElement.scrollWidth}px wide`);
      return out;
    }, vp.width);
    ok(`${label}: nothing runs off the screen on ${where}`, !bad.length, bad.join(' | '));
  };
  const a11y = async (where) => {
    const r = await page.evaluate(() => ({
      h1: document.querySelectorAll('main h1').length,
      unnamed: [...document.querySelectorAll('button, a[href]')].filter((b) => b.offsetParent && !(b.getAttribute('aria-label') || b.textContent.trim() || b.title)).length,
    }));
    ok(`${label}: ${where} has exactly one h1`, r.h1 === 1, 'h1=' + r.h1);
    ok(`${label}: every button on ${where} has a name`, r.unnamed === 0, r.unnamed + ' unnamed');
  };
  const goto = async (h) => { await page.evaluate((x) => { location.hash = x; }, h); await page.waitForTimeout(450); };

  await page.goto(URL0);
  await page.waitForSelector('[data-act="obStart"]');
  await shot('0-landing');
  /* A4 · setup is a first name, a face and an age band: three answers */
  await page.click('[data-act="obStart"]');
  await page.fill('#nm', 'Asha');
  await page.click('[data-act="obAvatar"][data-arg="koi"]');
  await page.click('[data-act="obNext"]');
  const bands = page.locator('[data-act="obBand"]'); await bands.last().click();
  await page.waitForSelector('.continue');
  ok(`${label}: setup is a name, a face and a band — and the face is in the top bar`, await page.locator('.kidbtn img[src*="koi"]').count() === 1);
  await page.waitForTimeout(3600);                 /* let the welcome confetti finish */
  await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); });
  await shot('1-home');

  /* B2 · one Continue: the only filled button on Home is the Continue card's */
  const prim = await page.evaluate(PRIMARY);
  ok(`${label}: Continue is the only filled button on Home`, prim.length === 1 && prim[0] === 'continue', JSON.stringify(prim));
  /* L4 · above the fold on a phone, clear of the tab bar */
  const fold = await page.evaluate(() => { const b = document.querySelector('.continue .cgo').getBoundingClientRect(); const t = document.querySelector('.tabbar'); const top = t && getComputedStyle(t).display !== 'none' ? t.getBoundingClientRect().top : innerHeight; return { bottom: b.bottom, limit: top }; });
  ok(`${label}: Continue sits above the fold`, fold.bottom <= fold.limit, `button ends ${Math.round(fold.bottom)} / ${Math.round(fold.limit)}`);
  /* B3 · progress beside it */
  ok(`${label}: Home shows where the child is beside Continue`, /Stop \d+ of \d+/.test(await page.textContent('.continue .cprog')));
  await a11y('Home'); await noOverflow('Home');
  /* N2 · what the first screen cost, uncompressed (the test server does not
     gzip, so this overstates what a phone downloads) */
  const firstBytes = await page.evaluate(() => performance.getEntriesByType('resource').concat(performance.getEntriesByType('navigation')).reduce((t, e) => t + (e.encodedBodySize || 0), 0));
  ok(`${label}: the first screen is ≤ 1.5 MB`, firstBytes <= 1.5 * 1024 * 1024, `${(firstBytes / 1024 / 1024).toFixed(2)} MB uncompressed`);
  const broken = async () => page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(-40)));
  ok(`${label}: every picture on Home loads`, !(await broken()).length, (await broken()).join(' '));
  /* J2 · no streaks anywhere a child reads */
  const streaky = await page.evaluate(() => /day streak|days in a row|\bstreak\b/i.test(document.body.innerText.replace(/no streak/ig, '')));
  ok(`${label}: no streak copy on Home`, !streaky);
  const contrastHome = await page.evaluate(CONTRAST);
  ok(`${label}: text on Home meets WCAG AA contrast (${scheme})`, contrastHome.length === 0, contrastHome.slice(0, 4).join(' | '));

  /* B2 · Home and Learn agree on the next step */
  const homeNext = (await page.textContent('.continue h2')).trim();
  await goto('#/learn');
  const learnNext = (await page.textContent('.upnext .untitle')).trim();
  ok(`${label}: Home and Learn name the same next step`, homeNext === learnNext, `${homeNext} / ${learnNext}`);
  await a11y('Learn'); await noOverflow('Learn');
  await page.waitForTimeout(300);
  ok(`${label}: every picture on Learn loads`, !(await broken()).length, (await broken()).join(' '));
  await goto('#/arcade');
  const coversOk = await page.evaluate(async () => {
    const urls = [...document.querySelectorAll('.cover')].map((el) => (getComputedStyle(el).getPropertyValue('--cover').match(/url\(["']?([^"')]+)/) || [])[1]).filter(Boolean);
    const res = await Promise.all(urls.map((u) => fetch(u).then((r) => r.ok).catch(() => false)));
    return { n: urls.length, bad: res.filter((x) => !x).length };
  });
  ok(`${label}: every Arcade cover is a file that loads`, coversOk.n > 5 && coversOk.bad === 0, JSON.stringify(coversOk));
  await goto('#/learn');
  await shot('2-learn');

  /* F3 · a game opens on its title card; Start plays it over its painting; an answer moves */
  await goto('#/arcade');
  await page.click('.cover[data-arg="nw"]'); await page.waitForTimeout(250);
  const intro = await page.evaluate(() => ({ h: (document.querySelector('.gintro h1') || {}).textContent, n: document.querySelectorAll('.gintro li').length, art: !!getComputedStyle(document.querySelector('.gintro') || document.body).getPropertyValue('--cover') }));
  ok(`${label}: a game opens on a title card with its painting and three lines of how`, intro.h === 'Needs vs Wants' && intro.n === 3 && intro.art, JSON.stringify(intro));
  await page.click('[data-act="gbegin"]'); await page.waitForTimeout(250);
  await page.click('[data-act="nwNeed"]'); await page.waitForTimeout(60);
  const moved = await page.evaluate(() => ({ flash: document.documentElement.dataset.flash || '', stage: !!document.querySelector('.gplay .stage') }));
  ok(`${label}: playing over the painting, and an answer moves the stage`, moved.stage && /^(ok|no)$/.test(moved.flash), JSON.stringify(moved));
  await page.click('[data-act="gquit"]').catch(() => {}); await page.waitForTimeout(150);
  await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); });

  /* D1 · try it: + changes the working */
  await page.evaluate(() => window.BZF.fire('card', 'c3d')); await page.waitForTimeout(250);
  const t0 = await page.textContent('.tryit .tout').catch(() => '');
  await page.click('.tryit [data-arg="c3d:price:1"]').catch(() => {}); await page.waitForTimeout(150);
  const t1 = await page.textContent('.tryit .tout').catch(() => '');
  ok(`${label}: a try-it step changes its working when a number changes`, !!t0 && t0 !== t1, `${t0.replace(/\s+/g, ' ').trim()} → ${t1.replace(/\s+/g, ' ').trim()}`);
  await page.evaluate(() => window.BZF.fire('closeCard'));

  /* B6 · back stays in the app */
  /* navigate the way a child does — through the app — so the history under
     test is the app's own, not entries this test wrote */
  await page.goto(URL0 + '#/home'); await page.waitForSelector('.continue');
  await page.evaluate(() => window.BZF.fire('nav', 'learn')); await page.waitForTimeout(250);
  await page.evaluate(() => window.BZF.fire('nav', 'money')); await page.waitForTimeout(250);
  for (let i = 0; i < 2; i++) { await page.goBack({ timeout: 4000 }).catch(() => {}); await page.waitForTimeout(300); }
  ok(`${label}: the back button stays inside the app`, page.url().startsWith(URL0) && /#\/home/.test(page.url()), page.url());

  /* M3 · the grown-ups area needs the PIN */
  await page.goto(URL0 + '#/home'); await page.waitForSelector('.continue');
  await page.click('.topbar [data-act="nav"][data-arg="parents"]');
  await page.waitForTimeout(300);
  ok(`${label}: the grown-ups area asks for the PIN`, await page.locator('[data-field="pin"]').count() === 1);

  /* M1 · the grown-ups' card, behind the PIN: Time · Progress · Mastery */
  await page.fill('[data-field="pin"]', '2468');
  await page.click('[data-act="gateGo"]'); await page.waitForTimeout(300);
  const rc = await page.evaluate(() => [...document.querySelectorAll('.rc-t .eyebrow')].map((e) => e.textContent.trim()));
  ok(`${label}: the grown-ups' card shows Time, Progress and Mastery`, rc.join(',') === 'Time,Progress,Mastery', rc.join(','));
  await page.click('[data-act="lock"]'); await page.waitForTimeout(200);

  /* E1 · today's session walks the three */
  await page.goto(URL0 + '#/home'); await page.waitForSelector('.continue');
  await page.click('[data-act="sessionStart"]'); await page.waitForTimeout(400);
  ok(`${label}: starting today's session shows where you are in it`, /Today's session · \d of \d/.test(await page.textContent('.sessbar').catch(() => '')));
  await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); });
  await page.click('[data-act="sessionStop"]').catch(() => {}); await page.waitForTimeout(200);

  /* O3 · #/continue opens the next step directly */
  await page.goto(URL0 + '#/continue'); await page.waitForTimeout(700);
  const opened = await page.evaluate(() => !!document.querySelector('.card.reading, .lstage, .lesson'));
  ok(`${label}: #/continue opens the next step`, opened);

  /* D3 · a wrong answer holds and says why; the second go settles it. The
     first card is "Needs and wants", whose first answer is the umbrella. */
  if (await page.locator('.opt').count()) {
    /* K1 · the question and its answers read aloud in the device's own voice */
    await page.evaluate(() => { window.__said = []; Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak: (u) => window.__said.push(u.text), cancel: () => {}, getVoices: () => [] } }); Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, writable: true, value: function (t) { this.text = t; } }); });
    await page.click('.sayq'); await page.waitForTimeout(100);
    const said = await page.evaluate(() => window.__said[0] || '');
    const q = (await page.textContent('.card h3')).trim();
    ok(`${label}: the question and its answers can be read aloud`, said.startsWith(q) && /A: .+ B: .+/.test(said), said.slice(0, 60));
    const opts = page.locator('.opt');
    const texts = await opts.allTextContents();
    const right = texts.findIndex((t) => /umbrella/i.test(t)), wrong = right === 0 ? 1 : 0;
    await opts.nth(wrong).click(); await page.waitForTimeout(150);
    const held = await page.evaluate(() => ({ hold: !!document.querySelector('.fb.hold'), next: !!document.querySelector('[data-act="nextQ"],[data-act="cardDone"]'), revealed: !!document.querySelector('.opt.ok') }));
    ok(`${label}: a wrong answer holds, says why, and does not reveal or advance`, held.hold && !held.next && !held.revealed, JSON.stringify(held));
    await opts.nth(right).click(); await page.waitForTimeout(150);
    const settled = await page.evaluate(() => !!document.querySelector('.fb.yes') && !!document.querySelector('[data-act="nextQ"],[data-act="cardDone"]'));
    ok(`${label}: the second go settles it and offers Next`, settled);

    /* O3 · finish the card (the app's own answer key, window.BZF.key), then
       the family feeds must hold a Finance milestone and only standard coins */
    for (let guard = 0; guard < 6; guard++) {
      if (await page.locator('[data-act="cardDone"]').count()) { await page.click('[data-act="cardDone"]'); break; }
      if (await page.locator('[data-act="nextQ"]').count()) { await page.click('[data-act="nextQ"]'); await page.waitForTimeout(120); }
      const k = await page.evaluate(() => { const c = window.BZF.R.s.kids[window.BZF.R.s.active]; return window.BZF.key(c.learn.openCard, (c.learn.drill && c.learn.drill.qi) || 0); });
      await page.locator('.opt').nth(k).click(); await page.waitForTimeout(120);
    }
    await page.waitForTimeout(300);
    const fam = await page.evaluate(() => ({ a: JSON.parse(localStorage.getItem('bizzing.activity') || '{"s":[]}').s, w: JSON.parse(localStorage.getItem('bizzing.wallet') || '{"kids":{}}') }));
    ok(`${label}: finishing a lesson writes a Finance milestone to the activity feed`, fam.a.some((x) => x.a === 'finance' && x.ev === 'stop' && x.who === 'Asha'), JSON.stringify(fam.a.slice(-1)));
    const led = Object.values(fam.w.kids).flatMap((k) => k.ledger);
    ok(`${label}: coins arrive only from the standard learning events`, led.length > 0 && led.every((x) => ['answer', 'stop', 'contest', 'mastery'].includes(x.why)), led.map((x) => x.why).join(','));
    await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); });
  } else ok(`${label}: the first card asks a question`, false);

  ok(`${label}: no errors and no third-party requests`, errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* A5 · ?demo: a labelled sample with weeks of progress that saves nothing */
async function demo() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0 + '?demo'); await page.waitForSelector('.continue'); await page.waitForTimeout(600);
  ok('demo: the sample is labelled as a sample', /Sample/.test(await page.textContent('.demobar').catch(() => '')));
  ok('demo: it opens on weeks of progress', /Stop (\d+) of/.test(await page.textContent('.continue .cprog')) && +(await page.textContent('.continue .cprog')).match(/Stop (\d+)/)[1] > 5);
  await page.evaluate(() => { location.hash = '#/money/jars'; }); await page.waitForTimeout(400);
  const stored = await page.evaluate(() => localStorage.getItem('bzf_profile'));
  ok('demo: nothing is saved — the real household is untouched', stored === null, stored ? stored.length + ' bytes written' : '');
  ok('demo: no errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

/* a run that throws is a failed check with a name, never a bare crash */
const safely = async (label, f) => { try { await f(); } catch (e) { ok(`${label}: the run completed`, false, String(e.message || e).split('\n')[0]); } };
await safely('desktop', () => run('desktop', { width: 1280, height: 860 }, false, 'light'));
await safely('phone', () => run('phone', { width: 390, height: 844 }, true, 'light'));
await safely('phone-dark', () => run('phone-dark', { width: 390, height: 844 }, true, 'dark'));
await safely('demo', demo);
await browser.close(); srv.close();
console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
