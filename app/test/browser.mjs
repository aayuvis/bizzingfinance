/* browser.mjs — drive the BUILT app in Chromium, desktop and phone, at the
   sub-path GitHub Pages serves it from (FAMILY-STANDARD §15). Every check is
   something a family would notice, and every one was watched failing first.

   Run: npm run build && npm run check   (deploy.sh runs both) */
import { chromium } from 'playwright';
import { serve, BASE } from './serve.mjs';
import { checkShell } from './shell-check.mjs';
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
const PRIMARY = () => [...document.querySelectorAll('.btn:not(.ghost), .bz-btn:not(.out)')].filter((b) => {
  if (!b.offsetParent || b.disabled) return false;
  for (let p = b.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS' && !p.open) return false;
  return true;
}).map((b) => b.closest('.continue, [data-bz=next]') ? 'continue' : (b.textContent || '').trim().slice(0, 30));

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
    if (el.closest('.continue,.cover,.poster,.actban,.town,svg,.bz-plate,.bz-chiprow,details:not([open]) > :not(summary)')) continue;
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
  await page.click('[data-act="obAvatar"][data-arg="mango"]');
  await page.click('[data-act="obNext"]');
  const bands = page.locator('[data-act="obBand"]'); await bands.last().click();
  /* A3 · the band tap opens the first stop itself — the one Continue would — not a menu */
  await page.waitForFunction(() => /^#\/atlas\/c1a$/.test(location.hash));
  ok(`${label}: the band tap opens the first stop straight away`, /Money is an agreement/.test(await page.textContent('main h1')), await page.textContent('main h1'));
  await page.evaluate(() => { location.hash = '#/home'; });
  await page.waitForSelector('[data-bz=next]');
  ok(`${label}: setup is a name, a face and a band — and the face is in the top bar`, await page.locator('[data-bz=kid] img[src*="mango"]').count() === 1);
  await page.waitForTimeout(3600);                 /* let the welcome confetti finish */
  await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); });
  await shot('1-home');

  /* B2 · one Continue: the only filled button on Home is the Continue card's */
  const prim = await page.evaluate(PRIMARY);
  ok(`${label}: Continue is the only filled button on Home`, prim.length === 1 && prim[0] === 'continue', JSON.stringify(prim));
  /* L4 · above the fold on a phone, clear of the tab bar */
  const fold = await page.evaluate(() => { const b = document.querySelector('[data-bz=continue]').getBoundingClientRect(); const t = document.querySelector('[data-bz=tabbar]'); const top = t && getComputedStyle(t).display !== 'none' ? t.getBoundingClientRect().top : innerHeight; return { bottom: b.bottom, limit: top }; });
  ok(`${label}: Continue sits above the fold`, fold.bottom <= fold.limit, `button ends ${Math.round(fold.bottom)} / ${Math.round(fold.limit)}`);
  /* B3 · progress beside it */
  ok(`${label}: Home shows where the child is beside Continue`, /Stop \d+ of \d+/.test(await page.textContent('[data-bz=next]')));
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
  const homeNext = (await page.textContent('[data-bz=next] h3')).trim();
  await goto('#/learn');
  const learnNext = (await page.textContent('.upnext .untitle')).trim();
  ok(`${label}: Home and Learn name the same next step`, homeNext === learnNext, `${homeNext} / ${learnNext}`);
  await a11y('Atlas'); await noOverflow('Atlas');
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
  await page.click('.cover[data-arg="sc"]'); await page.waitForTimeout(250);
  const intro = await page.evaluate(() => ({ h: (document.querySelector('.gintro h1') || {}).textContent, n: document.querySelectorAll('.gintro li').length, art: !!getComputedStyle(document.querySelector('.gintro') || document.body).getPropertyValue('--cover') }));
  ok(`${label}: a game opens on a title card with its painting and three lines of how`, intro.h === 'Smart Choices' && intro.n === 3 && intro.art, JSON.stringify(intro));
  await page.click('[data-act="gbegin"]'); await page.waitForTimeout(250);
  await page.click('[data-act="scMode"][data-arg="nw"]'); await page.waitForTimeout(150);
  await page.click('[data-act="scSide"][data-arg="need"]'); await page.waitForTimeout(60);
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
  await page.goto(URL0 + '#/home'); await page.waitForSelector('[data-bz=next]');
  await page.evaluate(() => window.BZF.fire('nav', 'learn')); await page.waitForTimeout(250);
  await page.evaluate(() => window.BZF.fire('nav', 'money')); await page.waitForTimeout(250);
  for (let i = 0; i < 2; i++) { await page.goBack({ timeout: 4000 }).catch(() => {}); await page.waitForTimeout(300); }
  ok(`${label}: the back button stays inside the app`, page.url().startsWith(URL0) && /#\/home/.test(page.url()), page.url());

  /* M3 · the grown-ups area needs the PIN */
  await page.goto(URL0 + '#/home'); await page.waitForSelector('[data-bz=next]');
  await page.evaluate(() => window.BZF.fire('nav', 'parents'));
  await page.waitForTimeout(300);
  ok(`${label}: the grown-ups area asks for the PIN`, await page.locator('[data-field="pin"]').count() === 1);

  /* M1 · the grown-ups' card, behind the PIN: Time · Progress · Mastery */
  await page.fill('[data-field="pin"]', '2468');
  await page.click('[data-act="gateGo"]'); await page.waitForTimeout(300);
  const rc = await page.evaluate(() => [...document.querySelectorAll('.rc-t .eyebrow')].map((e) => e.textContent.trim()));
  ok(`${label}: the grown-ups' card shows Time, Progress and Mastery`, rc.join(',') === 'Time,Progress,Mastery', rc.join(','));
  await page.click('[data-act="lock"]'); await page.waitForTimeout(200);

  /* E1 · today's session walks the three */
  await page.goto(URL0 + '#/town'); await page.waitForSelector('[data-act="sessionStart"]');
  await page.click('[data-act="sessionStart"]'); await page.waitForTimeout(400);
  ok(`${label}: starting today's session shows where you are in it`, /Today's session · \d of \d/.test(await page.textContent('.sessbar').catch(() => '')));
  await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); });
  await page.click('[data-act="sessionStop"]').catch(() => {}); await page.waitForTimeout(200);

  /* A8 · a new child reaches a right answer and a celebration inside two minutes */
  {
    const t0 = Date.now();
    await page.goto(URL0 + '#/home'); await page.waitForSelector('[data-bz=next]');
    await page.click('[data-bz=continue]'); await page.waitForTimeout(300);
    let celebrated = false, gotRight = false;
    for (let guard = 0; guard < 8 && !celebrated; guard++) {
      if (await page.locator('[data-act="cardDone"]').count()) { await page.click('[data-act="cardDone"]'); await page.waitForTimeout(300); celebrated = await page.evaluate(() => !!document.querySelector('.stopdone')); break; }
      if (await page.locator('[data-act="nextQ"]').count()) { await page.click('[data-act="nextQ"]'); await page.waitForTimeout(120); continue; }
      const k = await page.evaluate(() => { const c = window.BZF.R.s.kids[window.BZF.R.s.active]; return window.BZF.key(c.learn.openCard, (c.learn.drill && c.learn.drill.qi) || 0); });
      await page.locator('.opt').nth(k).click(); await page.waitForTimeout(120);
      gotRight = gotRight || await page.evaluate(() => !!document.querySelector('.fb.yes'));
    }
    const secs = (Date.now() - t0) / 1000;
    ok(`${label}: a new child gets a right answer and a celebration inside two minutes`, gotRight && celebrated && secs < 120, `${secs.toFixed(1)}s · right ${gotRight} · celebration ${celebrated}`);
    await shot('3-first-stop');
    await page.evaluate(() => window.BZF.fire('closeOv'));
  }

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
    const q = (await page.textContent('.card:has(.sayq) h3')).trim();
    ok(`${label}: the question and its answers can be read aloud`, said.startsWith(q) && /A: .+ B: .+/.test(said), said.slice(0, 60));
    const opts = page.locator('.opt');
    const texts = await opts.allTextContents();
    const right = await page.evaluate(() => { const c = window.BZF.R.s.kids[window.BZF.R.s.active]; return window.BZF.key(c.learn.openCard, (c.learn.drill && c.learn.drill.qi) || 0); });
    const wrong = right === 0 ? 1 : 0;
    await opts.nth(wrong).click(); await page.waitForTimeout(150);
    const rightText = texts[right].replace(/^[A-D]/, '').trim().toLowerCase();
    const held = await page.evaluate((rt) => { const fb = document.querySelector('.fb.hold'); return { hold: !!fb, next: !!document.querySelector('[data-act="nextQ"],[data-act="cardDone"]'), revealed: !!document.querySelector('.opt.ok'), named: !!fb && fb.textContent.toLowerCase().includes(rt) }; }, rightText);
    ok(`${label}: a wrong answer holds with a hint, and does not name, reveal or advance`, held.hold && !held.next && !held.revealed && !held.named, JSON.stringify(held));
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

  /* the doubling · a stop narrated in the device's own voice: no clip, so the player says each
     line with the browser's speech and the voice is the clock — the line is said, its caption
     shows, and when the voice ends the next beat begins */
  {
    await page.goto(URL0 + '#/atlas/c1e'); await page.waitForSelector('#lessonstage [data-l="toggle"]'); await page.waitForTimeout(400);
    await page.evaluate(() => { window.__said = []; Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak: (u) => { window.__said.push(u.text); setTimeout(() => u.onend && u.onend({ type: 'end' }), 60); }, cancel: () => {}, getVoices: () => [] } }); Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, writable: true, value: function (t) { this.text = t; } }); });
    await page.click('#lessonstage [data-l="toggle"]'); await page.waitForTimeout(400);
    const tts = await page.evaluate(() => ({ said: window.__said.slice(), cap: document.querySelector('#lessonstage .lcap').textContent }));
    ok(`${label}: a stop with no clip is read aloud, line by line, in the device's voice`, tts.said.length >= 2 && /^Long ago on Market Row/.test(tts.said[0]) && tts.said.includes(tts.cap), `${tts.said.length} lines said · “${(tts.said[0] || '').slice(0, 30)}”`);
    await page.click('#lessonstage [data-l="toggle"]');
  }

  /* FIX §1 · Change Rush plays on after catches with other coins falling: the
     loop that froze for good (arcade.js splice) runs eight seconds by keys */
  await page.goto(URL0 + '#/arcade'); await page.waitForSelector('.cover[data-arg="cr"]');
  await page.click('.cover[data-arg="cr"]'); await page.waitForTimeout(200);
  await page.click('[data-act="gbegin"]'); await page.waitForTimeout(300);
  const t0cr = await page.evaluate(() => window.BZF.R.game && window.BZF.R.game.st.t);
  for (let i = 0; i < 40; i++) { await page.keyboard.press(i % 3 ? 'ArrowRight' : 'ArrowLeft'); await page.waitForTimeout(200); }
  const crRun = await page.evaluate(() => { const g = window.BZF.R.game; return g ? { t: Math.round(g.st.t), done: g.st.done, caught: g.st.exact + (3 - g.st.lives) } : null; });
  ok(`${label}: Change Rush keeps running through catches (8 s by keys)`, crRun && (crRun.done || crRun.t > t0cr + 6000) && !errors.some((e) => /reading 'y'/.test(e)), JSON.stringify(crRun));
  if (!isMobile) {
    /* touch: a tap on a lane button moves the purse */
    await page.click('[data-act="crLane"][data-arg="3"]').catch(() => {});
    ok(`${label}: Change Rush lanes answer a tap`, await page.evaluate(() => !window.BZF.R.game || window.BZF.R.game.st.done || window.BZF.R.game.st.lane === 3));
  }
  await page.evaluate(() => window.BZF.fire('gquit'));

  /* N12 · the street's signs stand on chips above the road — no line through them */
  await page.goto(URL0 + '#/town'); await page.waitForSelector('.town svg');
  const signs = await page.evaluate(() => {
    const road = [...document.querySelectorAll('.town svg rect')].find((r) => r.getAttribute('fill') === 'var(--road)');
    const ry = road ? +road.getAttribute('y') : 1e9;
    const labs = [...document.querySelectorAll('.town .tlabel')];
    return { n: labs.length, chipless: labs.filter((g) => !g.querySelector('rect')).length,
      crossed: labs.filter((g) => { const b = g.getBBox(); return b.y < ry + 6 && b.y + b.height > ry; }).length };
  });
  ok(`${label}: every street sign sits on a chip, clear of the road`, signs.n > 0 && !signs.chipless && !signs.crossed, JSON.stringify(signs));
  /* N12 · confetti never lands on Continue */
  const conf = await page.evaluate(async () => {
    window.BZF.confetti(70);
    const b = (document.querySelector('[data-bz=continue]') || document.querySelector('.town')).getBoundingClientRect();
    let hits = 0;
    for (let k = 0; k < 14; k++) {
      await new Promise((r) => setTimeout(r, 250));
      document.querySelectorAll('.conf i').forEach((i) => { const r = i.getBoundingClientRect(); const o = +getComputedStyle(i).opacity; if (o > 0.05 && r.bottom > b.top && r.top < b.bottom && r.right > b.left && r.left < b.right) hits++; });
    }
    return hits;
  });
  await page.goto(URL0 + '#/home'); await page.waitForSelector('[data-bz=continue]');
  const conf2 = await page.evaluate(async () => {
    window.BZF.confetti(70);
    const b = document.querySelector('[data-bz=continue]').getBoundingClientRect();
    let hits = 0;
    for (let k = 0; k < 14; k++) {
      await new Promise((r) => setTimeout(r, 250));
      document.querySelectorAll('.conf i').forEach((i) => { const r = i.getBoundingClientRect(); const o = +getComputedStyle(i).opacity; if (o > 0.05 && r.bottom > b.top && r.top < b.bottom && r.right > b.left && r.left < b.right) hits++; });
    }
    return hits;
  });
  ok(`${label}: confetti never lands on the Continue button`, conf2 === 0, conf2 + ' overlaps');

  await familyChecks(page, label, vp, isMobile, scheme, errors, shot);
  await feedChecks(page, label, vp, isMobile, errors, shot, noOverflow);

  ok(`${label}: no errors and no third-party requests`, errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ══ FAMILY-STANDARD §22 — the checks every Bizzing app keeps ══════════════
   Each was watched failing first (see the commit that added it). */
const EMOJI = /\p{Extended_Pictographic}/u;
async function familyChecks(page, label, vp, isMobile, scheme, errors, shot) {
  const go = async (h) => { await page.evaluate((x) => { location.hash = x; }, h); await page.waitForTimeout(500); };
  await page.goto(URL0 + '#/home'); await page.waitForSelector('[data-bz=next]');

  /* C5 · every main screen has one heading and a way back (the tabs, or ☰) */
  const dead = [];
  for (const r of ['#/town', '#/learn', '#/money', '#/play', '#/shop', '#/collection', '#/medals', '#/me', '#/mistakes', '#/words', '#/store', '#/market40']) {
    await go(r);
    const v = await page.evaluate(() => ({ h1: document.querySelectorAll('main h1').length, back: !!document.querySelector('[data-bz=menu]') && [...document.querySelectorAll('[data-bz=tabs] a[href="#/home"], [data-bz=tabbar] a[href="#/home"]')].some((t) => t.offsetParent) }));
    if (v.h1 !== 1 || !v.back) dead.push(r + ' ' + JSON.stringify(v));
  }
  ok(`${label}: every screen has one heading and a way back`, !dead.length, dead.slice(0, 3).join(' | '));
  await go('#/home');
  /* C3 · the avatar ▾ lists every child, with a grown-ups-only + */
  await page.evaluate(() => window.BZF.fire('kids')); await page.waitForTimeout(150);
  /* the avatar menu (owner, 3 Oct 2026): every child (the one playing ticked), My page, Settings, + Add a child (grown-ups) */
  const kids = await page.evaluate(() => ({ n: document.querySelectorAll('.kidmenu .km-kid').length, on: document.querySelectorAll('.kidmenu .km-kid[aria-checked="true"]').length,
    rows: [...document.querySelectorAll('.kidmenu .km-row')].map((r) => r.getAttribute('data-act') + (r.getAttribute('data-arg') ? ':' + r.getAttribute('data-arg') : '')),
    add: /grown-ups/i.test((document.querySelector('.kidmenu [data-act="addKidGate"]') || {}).textContent || '') }));
  ok(`${label}: the avatar menu lists every child (ticked), My page, Settings and a PIN-guarded “Add a child”`, kids.n === 1 && kids.on === 1 && kids.rows.join() === 'nav:me,settings,addKidGate' && kids.add, JSON.stringify(kids));
  await page.evaluate(() => window.BZF.fire('closeOv'));

  /* §3 §4 §6 · Bee's chrome and home, measured (integration/shell-check.mjs): the top bar,
     the tab row or bottom bar, the three home rows, and the ☰ by keyboard (Esc, focus).
     Measured with a two-digit coin balance, as Bee's reference was: the search pill is
     pushed against the coin chip, so its x moves with the balance's digit count. */
  await page.evaluate(() => { const w = JSON.parse(localStorage.getItem('bizzing.wallet') || '{"v":1,"kids":{}}'); const k = w.kids.asha || (w.kids.asha = { coins: 0, ledger: [] }); k.coins = Math.max(10, Math.min(99, k.coins)); localStorage.setItem('bizzing.wallet', JSON.stringify(w)); window.BZF.R.render(); });
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }); await page.waitForTimeout(300);
  const shellFails = await checkShell(page, { phone: isMobile });
  ok(`${label}: checkShell — the chrome and Home match Bee's`, shellFails.length === 0, JSON.stringify(shellFails));
  await page.setViewportSize(vp); await page.waitForTimeout(200);
  const tabs = await page.evaluate((m) => [...document.querySelectorAll(m ? '[data-bz=tabbar] a' : '[data-bz=tabs] [data-bz=tab]')].filter((t) => t.offsetParent).map((t) => t.textContent.trim()), isMobile);
  /* five tabs: Money lives inside the Town (owner, 3 Oct 2026) */
  ok(`${label}: five tabs — Home · Town · Atlas · Play · My Feed (last) — and no More`, tabs.join(',') === 'Home,Town,Atlas,Play,My Feed', tabs.join(','));
  /* §5 Settings: Me · Sound & music · Look · Comfort · Grown-ups */
  await page.evaluate(() => window.BZF.fire('settings')); await page.waitForTimeout(250);
  const secs = await page.evaluate(() => [...document.querySelectorAll('.ovbox .scard h3')].map((h) => h.textContent.trim()));
  ok(`${label}: Settings sections in the family order`, secs.join('|') === 'Me|Sound & music|Look|Comfort|Grown-ups', secs.join('|'));
  ok(`${label}: Settings has effects, music and one volume slider`, await page.evaluate(() => !!document.querySelector('[data-act="sound"][role=switch]') && !!document.querySelector('[data-act="musicOn"][role=switch]') && document.querySelectorAll('input[type=range][data-field="vol"]').length === 1));
  await shot('5-settings');
  await page.evaluate(() => window.BZF.fire('closeOv'));
  /* §11 mute in one tap from ☰ */
  await page.click('[data-bz=menu]'); await page.waitForTimeout(200);
  await page.click('[data-bz=drawer] [data-bz-act="sound"]'); await page.waitForTimeout(150);
  const muted = await page.evaluate(() => ({ sfx: window.BZF.R.s.settings.sound, music: window.BZF.audio.state().music }));
  ok(`${label}: one tap in ☰ mutes effects and music`, muted.sfx === false && muted.music === false, JSON.stringify(muted));
  await page.evaluate(() => window.BZF.fire('muteAll')); await page.keyboard.press('Escape');

  /* §9 zero emoji in controls; §16 no [object Object] or {placeholder} — on every main screen */
  const ROUTES = ['#/home', '#/town', '#/learn', '#/money', '#/play', '#/shop', '#/collection', '#/medals', '#/me', '#/mistakes', '#/words'];
  const emo = [], junk = [], over = [];
  for (const r of ROUTES) {
    await go(r);
    const e = await page.evaluate((src) => { const re = new RegExp(src, 'u'); return [...document.querySelectorAll('button, [role=tab], nav, h1, h2, h3, .chip')].filter((x) => x.offsetParent && re.test(x.textContent.replace(/[0-9#*]/g, ''))).map((x) => x.textContent.trim().slice(0, 18)); }, EMOJI.source);
    if (e.length) emo.push(r + ': ' + e.slice(0, 3).join(' / '));
    const j = await page.evaluate(() => (document.body.innerText.match(/\[object Object\]|\{[a-z_]+\}|\bundefined\b|\bNaN\b/g) || []));
    if (j.length) junk.push(r + ': ' + j.join(','));
    const w = await page.evaluate((W) => document.scrollingElement.scrollWidth > W + 1 ? document.scrollingElement.scrollWidth : 0, vp.width);
    if (w) over.push(r + ' ' + w);
  }
  /* the same inside a lesson, and inside the sheets */
  for (const [what, act, arg] of [['a lesson', 'card', 'c1b'], ['Settings', 'settings', ''], ['the coin sheet', 'walletSheet', ''], ['the child switcher', 'kids', '']]) {
    await page.evaluate(([a, g]) => window.BZF.fire(a, g || undefined), [act, arg]); await page.waitForTimeout(300);
    const e = await page.evaluate((src) => { const re = new RegExp(src, 'u'); return [...document.querySelectorAll('button, [role=tab], nav, h1, h2, h3, .chip')].filter((x) => x.offsetParent && re.test(x.textContent.replace(/[0-9#*]/g, ''))).map((x) => x.textContent.trim().slice(0, 18)); }, EMOJI.source);
    if (e.length) emo.push(what + ': ' + e.slice(0, 3).join(' / '));
    await page.evaluate(() => { window.BZF.fire('closeOv'); window.BZF.fire('closeCard'); });
  }
  ok(`${label}: zero emoji in buttons, tabs, nav, headings and chips`, !emo.length, emo.slice(0, 3).join(' | '));
  ok(`${label}: no [object Object], {placeholder}, undefined or NaN on any screen`, !junk.length, junk.slice(0, 3).join(' | '));
  ok(`${label}: no screen runs wider than the device`, !over.length, over.join(' | '));

  /* P3 · 44px targets on the chrome and Home */
  await go('#/home');
  const small = await page.evaluate(() => [...document.querySelectorAll('[data-bz=tabbar] a, [data-bz=home] .bz-btn, .t3card button, .wchip')].filter((b) => b.offsetParent).filter((b) => { const r = b.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).map((b) => (b.getAttribute('aria-label') || b.textContent).trim().slice(0, 16) + ' ' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height)));
  ok(`${label}: every Home and tab-bar target is at least 44px (the top bar is Bee's, measured)`, !small.length, small.slice(0, 4).join(' | '));

  /* §8 the 96, through the engine */
  ok(`${label}: validate(avatars) returns []`, (await page.evaluate(() => window.BZF.validateAvatars())).length === 0);
  await go('#/collection');
  const coll = await page.evaluate(() => ({ cards: document.querySelectorAll('.cpack .ctile').length, packs: document.querySelectorAll('.cpack').length, says: [...document.querySelectorAll('.cpack .ctile-say')].every((x) => x.textContent.trim().length > 3) }));
  ok(`${label}: the Collection shows all 96 by pack, each with its path`, coll.cards === 96 && coll.packs === 12 && coll.says, JSON.stringify(coll));
  /* Bee's Collection: three tabs with their counts, Home a tap back, the purse; each face
     offers exactly what its state allows — Wear, its printed price, Wearing, or nothing yet */
  const cpage = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.col-tabs [role=tab]')].map((b) => b.textContent.trim());
    const bad = [...document.querySelectorAll('.ctile')].filter((t) => { const st = t.dataset.state, worn = t.classList.contains('wearing'), btn = t.querySelector('.ctile-btn'), act = btn && btn.dataset.act;
      if (worn) return !t.querySelector('.ctile-worn') || btn;
      if (st === 'owned') return act !== 'wear';
      if (st === 'buy') return act !== 'buyAv' || !/\d{3}/.test(btn.textContent);
      return !!btn; }).map((t) => t.querySelector('.ctile-nm').textContent + ':' + t.dataset.state);
    return { tabs, bad, home: !!document.querySelector('.col-head [data-act=nav][data-arg=home]'), coins: !!document.querySelector('.col-head .col-coins'), print: !!document.querySelector('[data-act=printCards]') };
  });
  ok(`${label}: the Collection is Bee's page — Medals · Avatars · Worlds with counts, Home back, the purse, Print my cards`, cpage.tabs.length === 3 && /^Medals · \d+\/\d+$/.test(cpage.tabs[0]) && /^Avatars · \d+\/96$/.test(cpage.tabs[1]) && /^Worlds · \d+\/6$/.test(cpage.tabs[2]) && cpage.home && cpage.coins && cpage.print, JSON.stringify(cpage.tabs));
  ok(`${label}: every face offers exactly what its state allows (Wear · its price · Wearing · nothing yet)`, !cpage.bad.length, cpage.bad.slice(0, 4).join(' '));
  await page.click('.ctile[data-tier="epic"] .ctile-art'); await page.waitForSelector('.ov .avc');
  const ccard = await page.evaluate(() => ({ rank: (document.querySelector('.ov .avc-rank') || {}).textContent || '', ovr: (document.querySelector('.ov .avc-ovr b') || {}).textContent || '' }));
  await page.evaluate(() => window.BZF.fire('closeOv'));
  await page.click('.col-tabs [data-arg="medals"]'); await page.waitForTimeout(150);
  const mt = await page.evaluate(() => ({ hash: location.hash, medals: document.querySelectorAll('.colpage [data-focus^="badge:"]').length }));
  await page.click('.col-tabs [data-arg="worlds"]'); await page.waitForTimeout(150);
  const wt = await page.evaluate(() => ({ hash: location.hash, worlds: document.querySelectorAll('.colpage .wcard').length }));
  await page.click('.col-tabs [data-arg="avatars"]'); await page.waitForTimeout(150);
  await page.click('[data-act=printCards]'); await page.waitForSelector('.printsheet');
  const pr = await page.evaluate(() => document.querySelectorAll('.printsheet .avc').length);
  await page.evaluate(() => window.BZF.fire('closeOv'));
  ok(`${label}: a face opens its card (rank of 96); the tabs are in the address; Print my cards lays out every card held`, /#\d+\s*of 96/.test(ccard.rank) && +ccard.ovr > 0 && mt.hash === '#/collection/medals' && mt.medals > 0 && wt.hash === '#/collection/worlds' && wt.worlds === 6 && pr >= 24, JSON.stringify({ ccard, mt, wt, pr }));

  /* C4 · search finds a lesson, a word and a game */
  await page.evaluate(() => window.BZF.fire('search')); await page.waitForTimeout(150);
  const found = [];
  for (const [q, want2] of [['needs', 'Needs and wants'], ['interest', 'Interest'], ['change rush', 'Change Rush'], ['harbour', 'The Old Harbour']]) {
    await page.fill('#srch', q); await page.waitForTimeout(200);
    const t = await page.evaluate(() => [...document.querySelectorAll('.sres b')].map((b) => b.textContent));
    found.push(t.includes(want2) ? 1 : `${q}→${t.slice(0, 2).join('/')}`);
  }
  ok(`${label}: search finds a lesson, a word, a game and a place`, found.every((x) => x === 1), found.join(' '));
  await page.evaluate(() => window.BZF.fire('closeOv'));

  /* §7 six worlds: painted, alive, a designed night, AA on every plate */
  await page.evaluate(() => { window.BZF.R.s.settings.plan = 'family'; window.BZF.R.s.settings.tester = true; });
  const worldRes = [];
  for (const w of await page.evaluate(() => window.BZF.looks.map((x) => x.id))) {
    await page.evaluate((id) => window.BZF.fire('look', id), w); await page.waitForTimeout(250);
    await go('#/home'); await page.waitForTimeout(250);
    const st = await page.evaluate(() => ({ ...window.BZF.ambient.state(), plate: (document.querySelector('.fz-plate') || {}).style && document.querySelector('.fz-plate').style.backgroundImage }));
    const night = /-night\.webp/.test(st.plate || ''), dark = scheme === 'dark';
    const cr = await page.evaluate(CONTRAST);
    /* §6a · My Feed passes AA in every world, by day and by night */
    await go('#/feed'); await page.waitForSelector('.bzf-card'); await page.waitForTimeout(150);
    const fcr = await page.evaluate(CONTRAST);
    /* D5 · the Town street wears the chosen world */
    await go('#/town'); await page.waitForSelector('.street-dress');
    const dress = await page.evaluate(() => { const d = document.querySelector('.street-dress'); return { look: d.dataset.look, kind: d.dataset.dress, drawn: d.querySelectorAll('path,rect,ellipse,circle').length, kerb: document.querySelector('.street-kerb').getAttribute('fill') }; });
    await go('#/home');
    worldRes.push({ w, layers: st.layers, world: st.world, plateOk: dark ? night : !night, aa: cr.length + fcr.length, feed: fcr.slice(0, 2), dress });
    if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/${label}-world-${w}.png` });
  }
  ok(`${label}: the Town street wears each chosen world — its own dressing and kerb colour, six different`, worldRes.every((x) => x.dress.look === x.w && x.dress.drawn > 0) && new Set(worldRes.map((x) => x.dress.kind)).size === 6 && new Set(worldRes.map((x) => x.dress.kerb)).size >= 5, JSON.stringify(worldRes.map((x) => x.dress)));
  ok(`${label}: six worlds, each with three layers of life`, worldRes.length === 6 && worldRes.every((x) => x.layers >= 3), JSON.stringify(worldRes.map((x) => x.w + ':' + x.layers)));
  ok(`${label}: every world wears its ${scheme === 'dark' ? 'night' : 'day'} painting`, worldRes.every((x) => x.plateOk), JSON.stringify(worldRes.filter((x) => !x.plateOk)));
  ok(`${label}: text on Home and My Feed meets AA in every world (${scheme})`, worldRes.every((x) => x.aa === 0), JSON.stringify(worldRes.filter((x) => x.aa)));
  await page.evaluate(() => { window.BZF.fire('look', 'market'); window.BZF.R.s.settings.tester = false; window.BZF.R.s.settings.plan = 'free'; });
  /* §7 the ambient life pauses when the page is hidden */
  if (!process.env.REDUCED) {
    const paused = await page.evaluate(async () => {
      const before = window.BZF.ambient.state().running;
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
      await new Promise((r) => setTimeout(r, 80));
      const during = window.BZF.ambient.state().running, flag = document.documentElement.hasAttribute('data-hidden');
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
      await new Promise((r) => setTimeout(r, 80));
      return { before, during, flag, after: window.BZF.ambient.state().running };
    });
    ok(`${label}: the world's life runs, pauses when the page is hidden, and resumes`, paused.before && !paused.during && paused.flag && paused.after, JSON.stringify(paused));
  }
  /* §11 music: a loop for Home, another for the games, after a gesture */
  await go('#/home'); await page.mouse.click(5, vp.height - 5).catch(() => {}); await page.waitForTimeout(250);
  const mHome = await page.evaluate(() => window.BZF.audio.state().want);
  await go('#/play'); await page.waitForTimeout(200);
  const mPlay = await page.evaluate(() => window.BZF.audio.state().want);
  ok(`${label}: music asks for the Home loop on Home and the games loop in Play`, mHome === 'home' && mPlay === 'games', `${mHome} / ${mPlay}`);

  /* F3 · a wrong first answer went into "Ones to try again" */
  ok(`${label}: a missed question waits in the mistakes deck`, await page.evaluate(() => (window.BZF.R.s.kids[window.BZF.R.s.active].mistakes || []).length >= 1));
  /* G10 · every game answers the keyboard AND a tap (tester mode opens them all) */
  {
    const KEY = { so: '1', cr: 'ArrowLeft', sc: '1', mp: '1', cc: ' ', sr: '1', st: '1', mc: 'ArrowDown', mn: 'Enter', sb: '1' };
    await page.evaluate(() => { window.BZF.R.s.settings.tester = true; window.BZF.setTester(true); });
    const bad = [], painted = [];
    for (const id of await page.evaluate(() => window.BZF.games.map((g) => g.id))) {
      for (const how of ['key', 'tap']) {
        await page.goto(URL0 + '#/play'); await page.waitForSelector('main');
        await page.evaluate((g) => { window.BZF.fire('game', g); window.BZF.fire('gbegin', g); }, id); await page.waitForTimeout(250);
        const before = await page.evaluate(() => (document.querySelector('.gplay') || {}).innerHTML || '');
        /* A5 · the stage is the game's painting, at full strength and moving (still under reduced motion) */
        if (how === 'key') {
          const st = await page.evaluate(() => { const el = document.querySelector('.gplay .stage'); if (!el) return null; const b = getComputedStyle(el, '::before');
            return { url: /url\(/.test(b.backgroundImage), op: +b.opacity, anim: b.animationName }; });
          const still = !!process.env.REDUCED || await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
          if (!st || !st.url || st.op < 0.99 || (still ? st.anim !== 'none' : st.anim === 'none')) painted.push(`${id}:${JSON.stringify(st)}`);
        }
        const e0 = errors.length;
        if (how === 'key') { await page.keyboard.down(KEY[id]); await page.waitForTimeout(id === 'cc' ? 600 : 80); await page.keyboard.up(KEY[id]); }
        else {
          const TAP = { mc: '[data-act="mcAdj"][data-arg$=":10"]', cr: '[data-act="crLane"][data-arg="3"]' };
          const b = page.locator(TAP[id] ? `.gplay ${TAP[id]}` : '.gplay button[data-act]:not([data-act="gquit"]):not([disabled])').first();
          if (await b.count()) { if (isMobile) await b.tap(); else await b.click(); } else bad.push(id + ':no-button');
        }
        await page.waitForTimeout(400);
        const after = await page.evaluate(() => (document.querySelector('.gplay') || {}).innerHTML || '');
        if (before === after) bad.push(`${id}:${how}`);
        if (errors.length > e0) bad.push(`${id}:${how}:error`);
        await page.evaluate(() => window.BZF.fire('gquit')); await page.evaluate(() => window.BZF.fire('closeOv'));
      }
    }
    ok(`${label}: every game moves on a key and on a ${isMobile ? 'tap' : 'click'}`, !bad.length, bad.join(' '));
    ok(`${label}: every game plays on its own painting, full strength${process.env.REDUCED ? ', standing still' : ', alive'}`, !painted.length, painted.join(' '));
    await page.evaluate(() => { window.BZF.R.s.settings.tester = false; window.BZF.setTester(false); });
  }

  /* B10 · reload mid-journey: Continue points at the exact stop */
  await go('#/home');
  const before = (await page.textContent('[data-bz=next] h3')).trim();
  await page.click('[data-bz=continue]'); await page.waitForTimeout(250);
  await page.goto(URL0 + '#/home'); await page.waitForSelector('[data-bz=next]');
  const after = (await page.textContent('[data-bz=next] h3')).trim();
  ok(`${label}: a lesson opened and left, then a reload — Continue points at the same stop`, before === after, `${before} / ${after}`);
  /* Q1 · the PIN is asked again after a reload */
  await go('#/parents');
  ok(`${label}: the grown-ups area asks for the PIN again after a reload`, await page.locator('[data-field="pin"]').count() === 1);
  await go('#/home');
}

/* ══ FAMILY-STANDARD §6a — My Feed ═══════════════════════════════════════
   Each was watched failing first (see the commit that added it). */
async function feedChecks(page, label, vp, isMobile, errors, shot, noOverflow) {
  const go = async (h) => { await page.evaluate((x) => { location.hash = x; }, h); await page.waitForTimeout(450); };
  const fetchedGroups = [];
  const seeGroup = (r) => { const m = /\/assets\/g(\d)-[^/]*\.js$/.exec(r.url()); if (m) fetchedGroups.push(+m[1]); };
  await page.goto(URL0 + '#/home'); await page.waitForSelector('[data-bz=next]');
  await go('#/feed'); await page.waitForSelector('.bzf-card');
  await shot('6-feed');
  const v = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.bzf-list > .bzf-card')];
    return { h1: document.querySelectorAll('main h1').length, head: !!document.querySelector('main [data-bz=phead]'), n: cards.length - 1,
      endLast: cards.length && cards.at(-1).matches('[data-bz=feed-end]'), whys: [...document.querySelectorAll('.bzf-why')].every((w) => w.textContent.trim().length > 3),
      audio: document.querySelectorAll('audio[autoplay], video[autoplay]').length, more: /load more|see more|\blikes\b|streak/i.test(document.querySelector('main').innerText),
      tab: (document.querySelector('[data-bz=tabs] [aria-current=page], [data-bz=tabbar] [aria-current=page]') || {}).textContent };
  });
  ok(`${label}: #/feed opens on the page head, about twenty cards that each say why, then the finished card`, v.h1 === 1 && v.head && v.n >= 10 && v.n <= 20 && v.endLast && v.whys, JSON.stringify(v));
  ok(`${label}: #/feed has no likes, counts, streaks, autoplay or "load more"`, !v.audio && !v.more);
  /* lazy: a fresh page on #/feed fetches the index and only the groups today's cards are in */
  const p2 = await page.context().newPage();
  p2.on('request', seeGroup);
  await p2.goto(URL0 + '#/feed'); await p2.waitForSelector('.bzf-card'); await p2.waitForTimeout(300);
  const lz = await p2.evaluate(() => {
    const F = window.BZF.feed, c = window.BZF.R.s.kids[window.BZF.R.s.active];
    const want = [...new Set(c.feed.ids.map((x) => F.byId(x.id).g))].sort();
    return { want: want.join(), have: F.groups().join() };
  });
  lz.fetched = [...new Set(fetchedGroups)].sort().join();
  await p2.close();
  ok(`${label}: #/feed loads only the card groups its session shows`, lz.want === lz.have && lz.fetched === lz.want && lz.want.split(',').length < 9, JSON.stringify(lz));
  ok(`${label}: My Feed's tab is lit on #/feed`, /My Feed/.test(v.tab || ''), v.tab);
  await noOverflow('My Feed');
  /* questions: wrong holds with "Not this time" and Continue; right pays one family coin, once */
  const coins = () => page.evaluate(() => { const w = JSON.parse(localStorage.getItem('bizzing.wallet') || '{"kids":{}}'); return (w.kids.asha || { coins: 0 }).coins; });
  const qs = await page.evaluate(() => [...document.querySelectorAll('.bzf-card')].filter((c) => c.querySelector('[data-bzf=ans]')).map((c) => c.dataset.id));
  ok(`${label}: the feed asks at most five questions`, qs.length >= 2 && qs.length <= 5, qs.length + ' questions');
  if (qs.length >= 2) {
    const press = async (sel) => { if (isMobile) await page.tap(sel); else { await page.focus(sel); await page.keyboard.press('Enter'); } await page.waitForTimeout(200); };
    const c0 = await coins();
    await press(`.bzf-card[data-id="${qs[0]}"] [data-bzf=ans]:not([data-o="0"])`);
    const held = await page.evaluate((id) => { const c = document.querySelector(`.bzf-card[data-id="${id}"]`); return { not: /Not this time — it is/.test(c.textContent), cont: !!c.querySelector('[data-bzf=cont]'), off: [...c.querySelectorAll('[data-bzf=ans]')].every((b) => b.disabled) }; }, qs[0]);
    ok(`${label}: a wrong answer ${isMobile ? '(touch)' : '(keyboard)'} holds — "Not this time — it is …" and Continue`, held.not && held.cont && held.off && (await coins()) === c0, JSON.stringify(held));
    await press(`.bzf-card[data-id="${qs[0]}"] [data-bzf=cont]`);
    ok(`${label}: Continue lets it rest with its answer`, await page.evaluate((id) => !document.querySelector(`.bzf-card[data-id="${id}"] [data-bzf]`), qs[0]));
    await press(`.bzf-card[data-id="${qs[1]}"] [data-bzf=ans][data-o="0"]`);
    const c1 = await coins();
    await go('#/home'); await go('#/feed'); await page.waitForSelector('.bzf-card');
    const again = await page.evaluate((id) => !!document.querySelector(`.bzf-card[data-id="${id}"] [data-bzf=ans]:not([disabled])`), qs[1]);
    ok(`${label}: a right answer ${isMobile ? '(touch)' : '(keyboard)'} pays one coin, through 'answer', once`, c1 === c0 + 1 && !again,
      `${c0} → ${c1}` + (again ? ' · asked again' : ''));
    const town = await page.evaluate(() => { const c = window.BZF.R.s.kids[window.BZF.R.s.active]; return c.money.txns.filter((t) => /feed/i.test(t.label || '')).length; });
    ok(`${label}: a feed answer never pays town money`, town === 0);
  }
  /* keys: j / k and the arrows step card to card */
  if (!isMobile) {
    await page.focus('.bzf-card'); await page.keyboard.press('j'); await page.waitForTimeout(80); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(80);
    const i2 = await page.evaluate(() => [...document.querySelectorAll('.bzf-card')].indexOf(document.activeElement));
    await page.keyboard.press('k'); await page.waitForTimeout(80);
    const i1 = await page.evaluate(() => [...document.querySelectorAll('.bzf-card')].indexOf(document.activeElement));
    ok(`${label}: j / k and the arrows move card to card`, i2 === 2 && i1 === 1, `${i2} ${i1}`);
    /* routes: every card's route opens a real screen (the whole set, not just today's twenty) */
    const routes = await page.evaluate(async () => { const F = window.BZF.feed, ids = F.items().map((x) => x.id); await F.loadGroups(ids); return [...new Set(ids.map((id) => F.card(id).route))]; });
    const dead = [];
    for (const r of routes) {
      await page.evaluate(() => window.BZF.fire('closeOv'));
      await page.evaluate((x) => { location.hash = x; }, r); await page.waitForTimeout(220);
      const ok2 = await page.evaluate((x) => {
        const sheet = /^#\/(sources|cast)\//.test(x);
        if (sheet) return !!document.querySelector('.ovbox');
        return document.querySelectorAll('main h1').length === 1;
      }, r);
      if (!ok2) dead.push(r);
    }
    await page.evaluate(() => window.BZF.fire('closeOv'));
    ok(`${label}: every card's route opens a real screen`, routes.length > 50 && !dead.length, `${routes.length} routes` + (dead.length ? ' · ' + dead.slice(0, 3).join(' ') : ''));
  }
  /* the grown-ups' switch, behind the PIN, takes the tab and the ☰ row away */
  await go('#/parents');
  if (await page.locator('[data-field="pin"]').count()) { await page.fill('[data-field="pin"]', '2468'); await page.click('[data-act="gateGo"]'); await page.waitForTimeout(300); }
  await page.click('[data-act="feedToggle"]'); await page.waitForTimeout(250);
  const off = await page.evaluate(() => ({ tab: [...document.querySelectorAll('[data-bz=tabs] a, [data-bz=tabbar] a')].some((a) => /feed/.test(a.getAttribute('href') || '')),
    row: [...document.querySelectorAll('[data-bz=drawer] a')].some((a) => /#\/feed/.test(a.getAttribute('href') || '')) }));
  await go('#/feed');
  const offScreen = await page.evaluate(() => ({ cards: document.querySelectorAll('.bzf-card').length, says: /switched off/.test(document.querySelector('main').innerText) }));
  ok(`${label}: the grown-ups' switch removes the tab, the ☰ row and the cards`, !off.tab && !off.row && !offScreen.cards && offScreen.says, JSON.stringify({ ...off, ...offScreen }));
  await go('#/parents'); await page.click('[data-act="feedToggle"]'); await page.waitForTimeout(200);
  ok(`${label}: …and puts them back`, await page.evaluate(() => [...document.querySelectorAll('[data-bz=tabs] a, [data-bz=tabbar] a')].some((a) => /#\/feed/.test(a.getAttribute('href') || ''))));
  await page.click('[data-act="lock"]').catch(() => {}); await page.waitForTimeout(150);
}

/* A5 · ?demo: a labelled sample with weeks of progress that saves nothing */
async function demo() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0 + '?demo'); await page.waitForSelector('[data-bz=next]'); await page.waitForTimeout(600);
  ok('demo: the sample is labelled as a sample', /Sample/.test(await page.textContent('.demobar').catch(() => '')));
  ok('demo: it opens on weeks of progress', /Stop (\d+) of/.test(await page.textContent('[data-bz=next]')) && +(await page.textContent('[data-bz=next]')).match(/Stop (\d+)/)[1] > 5);
  await page.evaluate(() => { location.hash = '#/money/jars'; }); await page.waitForTimeout(400);
  /* §6a · the sample's feed: cards, a question answered, and still nothing written */
  await page.evaluate(() => { location.hash = '#/feed'; }); await page.waitForSelector('.bzf-card');
  const dq = await page.evaluate(() => (document.querySelector('[data-bzf=ans][data-o="0"]') || {}).outerHTML ? document.querySelector('[data-bzf=ans][data-o="0"]').closest('.bzf-card').dataset.id : null);
  if (dq) { await page.tap(`.bzf-card[data-id="${dq}"] [data-bzf=ans][data-o="0"]`); await page.waitForTimeout(250); }
  ok('demo: the sample has a feed', await page.locator('.bzf-card').count() > 10 && !!dq);
  const stored = await page.evaluate(() => [localStorage.getItem('bzf_profile'), localStorage.getItem('bizzing.wallet')].filter(Boolean).join(''));
  ok('demo: nothing is saved — the real household and the family wallet are untouched', !stored, stored ? stored.length + ' bytes written' : '');
  /* deep links open ONE thing (owner, 3 Oct 2026): each route lands on, or opens, its own object */
  const DEEP = [['#/medals/cool-head', 'focus', /Cool head/], ['#/town/fix/fountain', 'focus', /dry fountain/i], ['#/store/handcart', 'focus', /handcart/i],
    ['#/atlas/chapter/c3', 'focus', /In, out/], ['#/letter/l3', 'sheet', /YOU HAVE WON/], ['#/market40/company/bigbox', 'sheet', /Fictional/],
    ['#/play/nw', 'intro', /Smart Choices/], ['#/play/tt', 'intro', /Month Planner/], ['#/words/Interest', 'h1', /Money Words/]];
  const missed = [];
  for (const [r, how, re] of DEEP) {
    await page.evaluate(() => { location.hash = '#/home'; }); await page.waitForTimeout(200);
    await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(600);
    const t = await page.evaluate((how) => {
      const el = how === 'focus' ? document.querySelector('.focus-pulse') : how === 'sheet' ? document.querySelector('.ov .ovbox, .ov .sheet') : how === 'intro' ? document.querySelector('.gintro h1') : document.querySelector('main h1');
      if (!el) return '';
      if (how === 'focus') { const b = el.getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight) return 'offscreen'; }
      return el.textContent.replace(/\s+/g, ' ');
    }, how);
    if (!re.test(t)) missed.push(`${r} → ${t.slice(0, 40) || 'nothing'}`);
    await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"], .ov .ovx'); if (o) o.click(); });
  }
  ok('demo: every kind of deep link lands on its own thing, on screen', !missed.length, missed.join(' | '));
  /* a story for every place (stories.js): opened from the Town's road, turned by button,
     key, tap and swipe, priced in the household's money, and closed back to the Town */
  await page.evaluate(() => { location.hash = '#/town'; }); await page.waitForTimeout(400);
  const links = await page.evaluate(() => [...document.querySelectorAll('.travel .poster-story')].map((a) => a.getAttribute('href')));
  await page.evaluate(() => document.querySelector('.poster-story[href="#/story/market"]').click()); await page.waitForSelector('.story'); await page.waitForTimeout(250);
  const pg = () => page.evaluate(() => { const d = document.querySelector('.st-dots'); return d ? +((d.getAttribute('aria-label') || '').match(/Page (\d+)/) || [0, 0])[1] : 0; });
  const story = { links: links.length, all: links.every((h, i) => /^#\/story\//.test(h)), title: await page.textContent('.story h1'), p1: await pg() };
  await page.tap('.st-next'); await page.waitForTimeout(150); story.button = await pg();
  story.money = /* page two pays a wage: priced in the household's money, no placeholder left */ await page.evaluate(() => !/\{\d+\}/.test(document.querySelector('.story').textContent) && /₹|\$|£|€|د\.إ/.test(document.querySelector('.story').textContent));
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(150); story.right = await pg();
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(150); story.left = await pg();
  const box = await page.locator('.st-stage').boundingBox();
  await page.touchscreen.tap(box.x + box.width * 0.85, box.y + box.height / 2); await page.waitForTimeout(450); story.tapR = await pg();
  await page.touchscreen.tap(box.x + box.width * 0.15, box.y + box.height / 2); await page.waitForTimeout(450); story.tapL = await pg();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2); await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(500); story.swipe = await pg();
  story.plate = await page.evaluate(() => getComputedStyle(document.querySelector('.st-stage'), '::before').backgroundImage);
  await page.tap('[data-act="storyClose"]'); await page.waitForTimeout(500);
  story.back = await page.evaluate(() => ({ hash: location.hash, nav: window.BZF.R.s.ui.nav }));
  await page.evaluate(() => { location.hash = '#/story/works'; }); await page.waitForSelector('.story'); await page.waitForTimeout(200);
  story.works = await page.textContent('.story h1');
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  story.esc = await page.evaluate(() => location.hash);
  ok('a story for every place: the road links all five; buttons, ←/→, a tap on either half and a swipe turn the page; Close goes back to the Town',
    story.links === 5 && story.all && /First Wage/.test(story.title) && story.p1 === 1 && story.button === 2 && story.right === 3 && story.left === 2
      && story.tapR === 3 && story.tapL === 2 && story.swipe === 3 && story.money && /market-day/.test(story.plate)
      && /#\/town/.test(story.back.hash) && story.back.nav === 'town' && /Three Different Words/.test(story.works) && /#\/town/.test(story.esc), JSON.stringify(story));
  /* A3 · every lesson stop offers practice asked fresh; practice is never evidence */
  const prac = await page.evaluate(async () => {
    const B = window.BZF, { R } = B, c = R.s.kids[0], id = 'c2a';
    await B.genReady();
    B.fire('nav', 'learn'); B.fire('card', id); await new Promise((r) => setTimeout(r, 50));
    for (let q = 0; q < 3; q++) { B.fire('answer', B.key(id, q)); const nx = document.querySelector('[data-act="nextQ"]'); if (nx) nx.click(); }
    const btn = document.querySelector('[data-act="practise"]'); if (!btn) return { btn: false };
    btn.click(); await new Promise((r) => setTimeout(r, 50));
    const rec = JSON.stringify(c.mastery.rec);   /* after the stop itself was recorded */
    const first = c.learn.openCard, eyebrow = (document.querySelector('main .eyebrow') || {}).textContent || '';
    const k = B.cardById(first);
    /* E3 · a typed amount offers its worked example (a sibling from the same generator) before the first try */
    let how = k.drill.kind !== 'num';
    if (!how) { const hb = document.querySelector('[data-act="genHow"]'); if (hb) { hb.click(); await new Promise((r) => setTimeout(r, 30)); const box = document.querySelector('.yhow'); how = !!box && !(box.textContent.match(/\d[\d,]*/g) || []).map((x) => +x.replace(/,/g, '')).includes(k.drill.value) && box.textContent.includes(k.drill.worked.q); } }
    if (k.drill.kind === 'num') { document.getElementById('numAns').value = String(k.drill.value); B.fire('answerNum'); } else B.fire('answer', B.key(first, 0));
    const right = !!document.querySelector('.fb.yes');
    document.querySelector('[data-act="practise"]').click(); await new Promise((r) => setTimeout(r, 50));
    const second = c.learn.openCard;
    B.fire('practiceDone');
    return { btn: true, how, practice: /Practice/.test(eyebrow), right, fresh: first !== second && /~/.test(first) && /~/.test(second), untouched: JSON.stringify(c.mastery.rec) === rec, done: !!c.learn.done[id] };
  });
  ok('a lesson stop offers practice asked fresh: a new question each time, recorded nowhere but XP', prac.btn && prac.how && prac.practice && prac.right && prac.fresh && prac.untouched && prac.done, JSON.stringify(prac));
  /* per-stop skipping (owner, 3 Oct 2026): answer cold — three right and it is walked, a miss opens the lesson */
  const coldRun = await page.evaluate(async () => {
    const B = window.BZF, { R } = B, c = R.s.kids[0], all = B.allCards, at = all.findIndex((k) => !c.learn.done[k.id]), id = all[at].id, next = all[at + 1].id;
    R.s.settings.tester = true; B.setTester(true);   /* every chapter open, so the road has a next stop */
    B.fire('closeOv'); B.fire('nav', 'learn'); B.fire('card', id); await new Promise((r) => setTimeout(r, 50));
    const offer = !!document.querySelector('[data-act="coldStart"]');
    B.fire('coldStart', id);
    const hidden = !document.querySelector('main .reading') && !!document.querySelector('.coldnote');
    for (let q = 0; q < 3; q++) { B.fire('answer', B.key(id, q)); const nx = document.querySelector('[data-act="nextQ"]'); if (nx) nx.click(); }
    const skip = document.querySelector('[data-act="cardDone"]'); const label = skip ? skip.textContent : '';
    if (skip) skip.click(); await new Promise((r) => setTimeout(r, 50));
    const walked = !!c.learn.done[id] && !!(c.learn.cold || {})[id], onNext = c.learn.openCard === next, atSkip = c.learn.openCard, ovSkip = R.overlay && R.overlay.kind;
    /* the miss path, on the next stop */
    B.fire('closeOv'); B.fire('coldStart', next);
    const k = B.key(next, 0); B.fire('answer', (k + 1) % 4);
    const opened = !R.cold && !!document.querySelector('main .reading') && !!document.querySelector('.fb.hold');
    const report = window.BZF.reportcard.card(c).progress.cold;
    B.fire('closeCard'); R.s.settings.tester = false; B.setTester(false);
    return { offer, hidden, label: /Skip ahead/.test(label), walked, onNext, opened, report, atSkip, ovSkip };
  });
  ok('a stop answered cold: lesson hidden, three right walks it and opens the next stop; a miss opens the lesson', coldRun.offer && coldRun.hidden && coldRun.label && coldRun.walked && coldRun.onNext && coldRun.opened && coldRun.report === 1, JSON.stringify(coldRun));
  /* a shift from the Town opens its game (loaded on demand), on the place's painting */
  const shift = await page.evaluate(async () => {
    const B = window.BZF, { R, sim } = B, c = R.s.kids[0]; B.fire('closeOv');
    const j = sim.jobsToday(c).find((x) => !x.done); if (!j) return { none: true };
    B.fire('job', j.id); for (let i = 0; i < 40 && !R.game; i++) await new Promise((r) => setTimeout(r, 50));
    await new Promise((r) => setTimeout(r, 300));
    const cv = document.getElementById('jobCanvas'); let painted = false;
    if (cv) { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; const seen = new Set(); for (let i = 0; i < d.length; i += 4 * 101) seen.add((d[i] >> 4) + '-' + (d[i + 1] >> 4) + '-' + (d[i + 2] >> 4)); painted = seen.size > 60; window.__seen = seen.size; }
    const ok = !!R.game && /^job:/.test(R.game.id) && painted;
    if (R.game) B.quitGame();
    return { ok, id: j.id, colours: window.__seen };
  });
  ok('a shift from the Town opens its game, drawn (not a flat box)', shift.ok, JSON.stringify(shift));
  /* the phone Atlas (audit v4, D2): the whole map with five pins on screen, places as banners, a pin opens its walk */
  await page.evaluate(() => { window.BZF.fire('closeOv'); location.hash = '#/atlas'; }); await page.waitForTimeout(400);
  const amap = await page.evaluate(() => { const b = document.querySelector('.aboard').getBoundingClientRect();
    const pins = [...document.querySelectorAll('.apin')].filter((p) => { const r = p.getBoundingClientRect(); return r.left >= b.left - 2 && r.right <= b.right + 2 && r.width > 0; }).length;
    const rows = [...document.querySelectorAll('.atlas .stop')].filter((x) => x.offsetParent).length;
    return { pins, rows, fits: b.width <= innerWidth }; });
  await page.tap('.apin >> nth=1'); await page.waitForTimeout(300);
  const toWalk = await page.evaluate(() => /^act:/.test(window.BZF.R.shelf || ''));
  ok('phone Atlas: the whole map, five pins on screen, no long list, and a pin opens its walk', amap.pins === 5 && amap.rows === 0 && amap.fits && toWalk, JSON.stringify({ ...amap, toWalk }));
  await page.evaluate(() => { window.BZF.R.shelf = ''; });
  /* the sprint (audit v4, F2): typed amounts against the wall clock, a best kept, nothing paid, nothing recorded */
  await page.evaluate(() => { window.BZF.fire('closeOv'); location.hash = '#/sprint'; });
  await page.waitForSelector('[data-act="spStart"]');
  const spBefore = await page.evaluate(() => { const c = window.BZF.R.s.kids[0]; return { rec: JSON.stringify(c.mastery.rec), wallet: c.money.wallet, xp: c.learn.xp }; });
  await page.evaluate(() => window.BZF.fire('spStart'));
  for (let i = 0; i < 2; i++) { const v = await page.evaluate(() => window.BZF.R.sprint.card.drill.value); await page.fill('#spAns', String(v)); await page.press('#spAns', 'Enter'); }
  await page.evaluate(() => { window.BZF.R.sprint.t0 -= 61000; }); await page.waitForTimeout(500);
  const spr = await page.evaluate((b) => { const { R } = window.BZF, c = R.s.kids[0]; return { done: R.sprint && R.sprint.done, right: R.sprint && R.sprint.right, best: c.sprint && c.sprint.best,
    untouched: JSON.stringify(c.mastery.rec) === b.rec && c.money.wallet === b.wallet && c.learn.xp === b.xp }; }, spBefore);
  ok('the sprint: typed by Enter, ends on the clock, keeps a best, pays and records nothing', spr.done && spr.right === 2 && spr.best >= 2 && spr.untouched, JSON.stringify(spr));
  await page.evaluate(() => window.BZF.fire('spLeave'));
  /* the walk (audit v4, D6): after a stop is walked, the next visit walks the child along the road to the new one */
  const walkArr = await page.evaluate(async () => {
    const B = window.BZF, { R } = B, c = R.s.kids[0], all = B.allCards, at = all.findIndex((k) => !c.learn.done[k.id]);
    const wi = window.BZF.R.s.kids[0].world || 0; B.fire('closeOv'); B.fire('nav', 'learn');
    R.shelf = 'act:1'; B.fire('closeOv'); const before = !!document.querySelector('.wstop.cur.arrive');
    c.learn.done[all[at].id] = { right: true }; R.shelf = 'act:1'; B.fire('closeOv');
    const after = !!document.querySelector('.wstop.cur.arrive');
    delete c.learn.done[all[at].id]; R.shelf = '';
    return { before, after };
  });
  ok('the walk: a stop walked, and the next visit walks the child along the road to the new one', !walkArr.before && walkArr.after, JSON.stringify(walkArr));
  /* the Library (audit v4, H1/H2): tools with pictures; a dragged loan length shows the Bank's own price */
  await page.evaluate(() => { window.BZF.fire('closeOv'); location.hash = '#/library'; }); await page.waitForTimeout(400);
  const lib0 = await page.evaluate(() => ({ tools: document.querySelectorAll('.ltool').length, pics: document.querySelectorAll('.ltool .ltool-art, .ltool img').length }));
  await page.focus('[data-lib="loanW"]'); for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  const lib = await page.evaluate(() => { const { R, sim } = window.BZF, c = R.s.kids[0], o = sim.loanOffer(c, R.lib.loanU, R.lib.loanW);
    return { weeks: R.lib.loanW, shown: document.getElementById('lo-total').textContent, want: o.total, wantText: document.getElementById('lo-total').textContent.replace(/[^0-9]/g, '') === String(o.total) }; });
  ok('the Library: tools with pictures, and a dragged loan length shows the Bank\'s own price', lib0.tools >= 6 && lib0.pics >= 5 && lib.weeks === 12 && lib.wantText, JSON.stringify({ ...lib0, ...lib }));
  /* G8/G9 · three levels and three goals: Tricky picked on the title card by tap (and 1 2 3 by
     key) reaches the game — its chip in the HUD, its knobs in the run — and the purse still
     moves by keyboard and by tap. A shift picks its level before the 3-2-1, the same way. */
  {
    await page.evaluate(() => { const B = window.BZF; B.fire('closeOv'); B.R.s.kids[0].tiers = {}; B.fire('game', 'cr'); });
    await page.waitForSelector('.gilevel .tierpick');
    const lit0 = await page.getAttribute('.tierbtn[aria-pressed="true"]', 'data-tier');
    await page.tap('.tierbtn[data-tier="tricky"]'); await page.waitForTimeout(150);
    const intro = await page.evaluate(() => ({ lit: (document.querySelector('.tierbtn[aria-pressed="true"]') || {}).dataset?.tier, kept: window.BZF.R.s.kids[0].tiers.cr,
      goals: document.querySelectorAll('.gilevel .goals li').length, start: (document.querySelector('[data-act="gbegin"]') || {}).textContent || '' }));
    await page.keyboard.press('1'); await page.waitForTimeout(120);
    const byKey = await page.evaluate(() => window.BZF.R.s.kids[0].tiers.cr);
    await page.keyboard.press('3'); await page.waitForTimeout(120);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/tiers-intro.png`, fullPage: true });
    await page.tap('[data-act="gbegin"]'); await page.waitForTimeout(400);
    const inGame = await page.evaluate(() => { const g = window.BZF.R.game, chip = document.querySelector('.hud .tierchip');
      return { id: g && g.id, chip: chip ? chip.dataset.tier + ':' + chip.textContent : '', visible: !!(chip && chip.offsetParent), help: g && g.st ? g.st.target : 0, lane: g.st.lane }; });
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80);
    const afterKey = await page.evaluate(() => window.BZF.R.game.st.lane);
    await page.tap('.crlane[data-arg="0"]'); await page.waitForTimeout(80);
    const afterTap = await page.evaluate(() => window.BZF.R.game.st.lane);
    const cb = await page.locator('#crCanvas').boundingBox();
    await page.touchscreen.tap(cb.x + cb.width * 0.9, cb.y + cb.height * 0.6); await page.waitForTimeout(80);
    const afterCanvas = await page.evaluate(() => window.BZF.R.game.st.lane);
    await page.waitForTimeout(2600);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/tiers-tricky-cr.png` });
    await page.evaluate(() => window.BZF.quitGame());
    ok('levels: the title card lights the remembered level, Tricky is picked by tap (and 1/3 by key), and three goals are listed',
      lit0 === 'standard' && intro.lit === 'tricky' && intro.kept === 'tricky' && byKey === 'easy' && intro.goals === 3 && /Tricky/.test(intro.start), JSON.stringify({ lit0, intro, byKey }));
    ok('levels: Tricky reaches the game (its chip in the HUD) and the purse still moves by ← →, a lane tap and a canvas tap',
      inGame.id === 'cr' && /^tricky:Tricky$/.test(inGame.chip) && inGame.visible && afterKey === inGame.lane + 1 && afterTap === 0 && afterCanvas === 3,
      JSON.stringify({ inGame, afterKey, afterTap, afterCanvas }));
    /* a shift on Tricky: the picker first, on the shift's own painting, then the 3-2-1 */
    const job = await page.evaluate(async () => {
      const B = window.BZF, { R, sim } = B, c = R.s.kids[0];
      const j = sim.jobsToday(c).find((x) => !x.done); if (!j) return { none: true };
      B.fire('job', j.id); for (let i = 0; i < 40 && !R.game; i++) await new Promise((r) => setTimeout(r, 50));
      await new Promise((r) => setTimeout(r, 200));
      return { id: j.id, picking: R.game.__st().picking, picker: !!document.querySelector('.jgpick .tierpick'), goals: document.querySelectorAll('.jgpick .goals li').length };
    });
    await page.tap('.jgpick [data-act="jgTier"][data-arg="tricky"]'); await page.waitForTimeout(200);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/tiers-shift-pick.png`, fullPage: true });
    await page.tap('[data-act="jgStart"]'); await page.waitForTimeout(3600);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/tiers-shift-tricky.png` });
    const live = await page.evaluate(() => { const g = window.BZF.R.game, p = g.__st(), chip = document.querySelector('.hud .tierchip');
      return { tier: p.tier, go: p.go, par: p.par, chip: chip ? chip.dataset.tier : '', kept: window.BZF.R.s.kids[0].tiers }; });
    await page.evaluate(() => window.BZF.quitGame());
    ok('levels: a shift opens on its level picker with three goals; Tricky picked by tap starts the shift on Tricky, at Tricky\'s own par',
      !job.none && job.picking && job.picker && job.goals === 3 && live.tier === 'tricky' && live.go && live.chip === 'tricky' && live.kept[job.id] === 'tricky',
      JSON.stringify({ job, live }));
  }
  /* Town is Money (owner, 3 Oct 2026): the money drawn, the seven places, doors that open */
  await page.evaluate(() => { location.hash = '#/town'; }); await page.waitForTimeout(400);
  const town = await page.evaluate(() => {
    const { R, sim } = window.BZF, c = R.s.kids[0], g = sim.glance(c);
    const ys = [...document.querySelectorAll('.mjars .jarfill')].map((r) => +r.getAttribute('y'));
    const order = (a) => a.map((v, i) => i).sort((x, y) => a[x] - a[y]).join();
    return { places: document.querySelectorAll('.places .ptile').length, jars: ys.length,
      /* a fuller jar has its liquid higher up (smaller y): the drawing follows the money */
      follows: order(ys) === order(g.jars.map((j) => -j.share)) || g.jars.every((j) => j.share === g.jars[0].share),
      wallet: (document.querySelector('.mwallet .mt-big') || {}).textContent };
  });
  ok('Town: seven places and four jars drawn to their real share', town.places === 7 && town.jars === 4 && town.follows, JSON.stringify(town));
  await page.evaluate(() => document.querySelector('.ptile[data-arg="wallet"]').click()); await page.waitForTimeout(300);
  const inside = await page.evaluate(() => ({ hash: location.hash, lit: (document.querySelector('.bz-tabbar [aria-current="page"], .bz-tabs [aria-current="page"]') || {}).textContent, back: !!document.querySelector('.mnav .mback[href="#/town"]') }));
  ok('Town: a place opens its building, the Town tab stays lit, and there is a way back', /#\/money\/wallet/.test(inside.hash) && /Town/.test(inside.lit || '') && inside.back, JSON.stringify(inside));
  /* A3 · Continue's "still know this?" opens the question (it used to land on the map) */
  await page.evaluate(() => { location.hash = '#/home'; }); await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-bz=continue]').click()); await page.waitForTimeout(500);
  const opened = await page.evaluate(() => ({ open: window.BZF.R.s.kids[0].learn.openCard, q: !!document.querySelector('main [data-act="answer"], main #numAns'), atlas: /Money Atlas/.test((document.querySelector('main h1') || {}).textContent || '') }));
  ok('Continue: a due revision opens its question, not the map', opened.q && !opened.atlas, JSON.stringify(opened));
  const fin = await page.evaluate(async () => {
    const { R } = window.BZF, c = R.s.kids[0], id = c.learn.openCard, ob = id.split('#')[0];
    const h0 = c.mastery.rec[ob].hist.length, stops0 = Object.keys(c.learn.done).length;
    window.BZF.fire('answer', window.BZF.key(id, 0));
    const b = document.querySelector('[data-act="cardDone"]'); if (b) b.click();
    return { evidence: c.mastery.rec[ob].hist.length === h0 + 1, stops: Object.keys(c.learn.done).length === stops0, home: R.s.ui.nav === 'home', done: !!b };
  });
  ok('a revision answered is evidence in the record, not a stop on the road, and goes home', fin.evidence && fin.stops && fin.home && fin.done, JSON.stringify(fin));
  /* cold: a generated question opened before its words have loaded fills in when they arrive */
  await page.goto(URL0 + '?demo'); await page.waitForSelector('[data-bz=next]');
  const cold = await page.evaluate(async () => { const { R } = window.BZF, c = R.s.kids[0]; window.BZF.fire('nav', 'learn'); c.learn.openCard = 'EARN-2~5'; window.BZF.fire('closeOv');
    const first = !!document.querySelector('#numAns'); await new Promise((r) => setTimeout(r, 900)); return { first, later: !!document.querySelector('#numAns') }; });
  ok('a fresh question opened cold is written in a moment, not left blank', cold.later, JSON.stringify(cold));
  /* a generated item in the child's own numbers: typed, by keyboard and by tap */
  const typed = [];
  for (const how of ['key', 'tap']) {
    const v = await page.evaluate(async (id) => { await window.BZF.genReady(); const { R } = window.BZF, c = R.s.kids[0]; window.BZF.fire('nav', 'learn');
      c.learn.openCard = id; c.learn.drill = null; window.BZF.fire('closeOv'); return window.BZF.genValue(id); }, how === 'key' ? 'EARN-2~5' : 'KEEP-1~8');
    await page.waitForSelector('#numAns');
    await page.fill('#numAns', String(v));
    if (how === 'key') await page.press('#numAns', 'Enter'); else await page.tap('[data-act="answerNum"]');
    await page.waitForTimeout(250);
    typed.push(await page.evaluate(() => !!document.querySelector('.fb.yes')));
  }
  ok('a typed answer in the child\'s own numbers settles on Enter and on a tap', typed.every(Boolean), JSON.stringify(typed));
  /* List B/C (owner, 3 Oct 2026): the sample has coins; Home counts a met quest and takes it */
  ok('demo: the sample shows the coins it earned', +(await page.textContent('.bz-coins span')) > 0, await page.textContent('.bz-coins span'));
  await page.evaluate(() => { location.hash = '#/home'; }); await page.waitForTimeout(300);
  const ring = await page.evaluate(() => {
    const { R, sim } = window.BZF, c = R.s.kids[R.s.active || 0], q = sim.questList(c)[0];
    c.quests.prog[q.id] = 999; window.BZF.fire('nav', 'home');
    const take = document.querySelector('.fring [data-act="claim"]');
    const label = document.querySelector('.fring svg').getAttribute('aria-label');
    if (take) take.click();
    return { take: !!take, label, claimed: !!c.quests.claimed[q.id], after: document.querySelector('.fring svg').getAttribute('aria-label') };
  });
  ok('Home: a met quest counts on the ring and can be taken right there', ring.take && /: 1 of/.test(ring.label) && ring.claimed && /: 1 of/.test(ring.after), JSON.stringify(ring));
  await page.evaluate(() => { window.scrollTo(0, 400); location.hash = '#/town'; }); await page.waitForTimeout(250);
  await page.evaluate(() => { window.scrollTo(0, 400); location.hash = '#/home'; }); await page.waitForTimeout(350);
  ok('Home: a tab opens its screen at the top', await page.evaluate(() => window.scrollY) === 0, String(await page.evaluate(() => window.scrollY)));
  const plates = await page.evaluate(() => [...document.querySelectorAll('.bz-journey .bz-plate')].map((x) => x.style.backgroundImage));
  ok('Home: the two journey cards carry two different pictures', plates.length === 2 && plates[0] !== plates[1], plates.join(' | ').slice(0, 120));
  await page.evaluate(() => { window.BZF.R.s.settings.tester = true; window.BZF.fire('nav', 'home'); }); await page.waitForTimeout(200);
  ok('tester mode says so in the bar', await page.locator('.bz-bar .bz-tester').count() === 1);
  await page.evaluate(() => { window.BZF.R.s.settings.tester = false; window.BZF.fire('nav', 'home'); });
  await page.goto(URL0 + '?demo&from=hive'); await page.waitForSelector('[data-bz=next]');
  const back = await page.evaluate(() => { const a = document.querySelector('.bz-bar [data-bz=hiveback]'); return a ? a.getAttribute('href') : ''; });
  ok('from the Hive: the bar offers the way back to my day', /Bizzing_Schedule/.test(back), back);
  /* A4 · the plan is a preview only tester mode honours; a stray device flag opens nothing */
  const planGate = await page.evaluate(() => { const { R } = window.BZF; R.shopTab = 'worlds'; window.BZF.fire('nav', 'shop');
    const t = document.body.innerText; return { says: t.includes('Ask a grown-up'), price: /\$99|2,999/.test(t) }; });
  ok('Shop: a child sees what the family plan opens, and never its price', planGate.says && !planGate.price, JSON.stringify(planGate));
  ok('demo: no errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
  /* §3 §6 · the chrome and Home match Bee's on a dark desk too (the other three are in run()) */
  const dctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark' });
  await dctx.addInitScript(() => { try { if (!localStorage.getItem('bizzing.wallet')) localStorage.setItem('bizzing.wallet', JSON.stringify({ v: 1, kids: { mira: { coins: 40, ledger: [] } } })); } catch (e) {} });
  const dp = await dctx.newPage();
  await dp.goto(URL0); await dp.waitForSelector('[data-act="obStart"]'); await dp.waitForTimeout(400);
  await dp.click('[data-act="obStart"]'); await dp.waitForSelector('#nm');
  await dp.fill('#nm', 'Mira'); await dp.click('[data-act="obNext"]'); await dp.locator('[data-act="obBand"]').last().click();
  await dp.waitForFunction(() => /^#\/atlas\//.test(location.hash)); await dp.evaluate(() => { location.hash = '#/home'; });
  await dp.waitForSelector('[data-bz=next]'); await dp.waitForTimeout(3800);
  await dp.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); }); await dp.waitForTimeout(300);
  const darkFails = await checkShell(dp, { phone: false });
  ok('desktop-dark: checkShell — the chrome and Home match Bee\'s', darkFails.length === 0, JSON.stringify(darkFails));
  await dctx.close();
  /* a first visit never reloads itself when the service worker takes over (it used to, a
     moment after opening — under a child mid-tap) */
  {
    const fctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const fp = await fctx.newPage(); let navs = 0;
    fp.on('load', () => { navs++; });   /* full page loads, not hash changes */
    await fp.goto(URL0 + '?demo'); await fp.waitForSelector('[data-bz=next]');
    await fp.waitForTimeout(4000);
    ok('a first visit does not reload itself when the offline worker takes over', navs === 1, navs + ' page loads');
    await fctx.close();
  }
  /* G6 · the clock is the wall's, not the frame rate's (audit v4: at 4 fps a 60 s round took >90 s).
     Animation frames are throttled to 4 a second; 8 real seconds after GO, Change Rush must
     have spent about 8 seconds of its round. */
  const sctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await sctx.addInitScript(() => { window.requestAnimationFrame = (f) => setTimeout(() => f(performance.now()), 250); });
  const sp = await sctx.newPage();
  await sp.goto(URL0 + '?demo'); await sp.waitForSelector('[data-bz=next]');
  await sp.evaluate(() => { const B = window.BZF; B.R.s.settings.tester = true; B.setTester(true); B.fire('closeOv'); B.fire('game', 'cr'); B.fire('gbegin', 'cr'); });
  await sp.waitForTimeout(2400 + 600);   /* the 3-2-1-GO, plus a frame or two */
  const t0 = await sp.evaluate(() => +(document.getElementById('crTime') || {}).textContent);
  await sp.waitForTimeout(8000);
  const t1 = await sp.evaluate(() => +(document.getElementById('crTime') || {}).textContent);
  ok('slow frames: Change Rush keeps the wall\'s time (8 s at 4 fps spends ~8 s of the round)', t0 - t1 >= 7 && t0 - t1 <= 9, `${t0} → ${t1}`);
  await sctx.close();
  /* D10 · under reduced motion the world is one still frame: nothing runs */
  const rctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const rp = await rctx.newPage();
  await rp.goto(URL0 + '?demo'); await rp.waitForSelector('[data-bz=next]'); await rp.waitForTimeout(500);
  const still = await rp.evaluate(() => ({ running: window.BZF.ambient.state().running, layers: window.BZF.ambient.state().layers, anim: getComputedStyle(document.querySelector('.fz-idle')).animationName }));
  ok('reduced motion: the world stands still (three layers drawn, nothing running)', !still.running && still.layers >= 3 && still.anim === 'none', JSON.stringify(still));
  await rctx.close();
}

/* ══ G2 · the canvas kit on Main Street and the drills ═══════════════════
   Measured from the DOM and the game's own state, never from a fixed wait for an
   animation: every wait below is on a condition. Each was watched failing first. */
const FXWATCH = () => {
  window.__fx = 0;
  new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('fxlayer')) window.__fx++; })
    .observe(document.body, { childList: true });
};
/* every frame: which square holds your dot in the DOM, and whether the drawn token is mid-hop */
const MSWATCH = () => {
  const S = window.__ms = { sq: [], mid: 0 };
  const f = () => {
    const g = window.BZF.R.game && window.BZF.R.game.g;
    if (g) {
      const d = document.querySelector('#msBoard .mstok[data-who="pip"]');
      const sq = d ? +d.closest('[data-sq]').dataset.sq : -1;
      if (S.sq[S.sq.length - 1] !== sq) S.sq.push(sq);
      const a = g.look && g.look.at && g.look.at[0];
      if (a && a.k > 0.05 && a.k < 0.95) S.mid++;
    }
    if (!S.stop) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
};
const openBoard = async (p) => {
  await p.goto(URL0 + '?demo'); await p.waitForSelector('[data-bz=next]');
  await p.evaluate(FXWATCH);
  await p.evaluate(() => { const B = window.BZF; B.R.s.settings.tester = true; B.setTester(true); B.fire('closeOv'); B.fire('game', 'mn'); B.fire('gbegin', 'mn'); });
  await p.waitForSelector('#msBoard [data-sq]');
  /* dice are seeded per game (docs/12 §2.9): replay the first game whose opening roll is
     3 or more, so a walk has squares in between to be seen walking through */
  await p.evaluate(async () => { const B = window.BZF, m = await B.arcadeReady();
    let s = 1; for (; s < 200; s++) { m.startGame('mn', s); B.R.game.act('mnRoll'); const d = B.R.game.g.die; m.quitGame(); if (d >= 3) break; }
    m.startGame('mn', s); B.R.render(); });
  await p.waitForSelector('#msBoard [data-sq]');
};
async function kitChecks() {
  const kctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const kp = await kctx.newPage();
  const errors = []; kp.on('pageerror', (e) => errors.push(e.message));
  await openBoard(kp);
  await kp.evaluate(MSWATCH);
  await kp.keyboard.press('Enter');
  await kp.waitForFunction(() => { const g = window.BZF.R.game.g; return g.phase !== 'moving' || g.turn !== 0; }, null, { timeout: 10000 });
  const walk = await kp.evaluate(() => { const g = window.BZF.R.game.g; window.__ms.stop = true; return { die: g.die, trail: g.trail, seen: window.__ms.sq, mid: window.__ms.mid }; });
  const want = Array.from({ length: walk.die + 1 }, (_, k) => (walk.trail[0] + k) % 20);
  ok('Main Street: a roll walks your token through every square in between, one at a time', walk.die > 1 && JSON.stringify(walk.seen) === JSON.stringify(want), JSON.stringify(walk));
  ok('Main Street: the drawn token is seen between squares (it hops, it does not teleport)', walk.mid > 0, 'mid-hop frames ' + walk.mid);
  /* play on until you land somewhere you can buy, then buy it: the square is stamped */
  let bought = null;
  for (let k = 0; k < 30 && !bought; k++) {
    await kp.waitForFunction(() => { const g = window.BZF.R.game && window.BZF.R.game.g; return !g || g.done || g.turn === 0 && (g.phase === 'roll' || g.phase === 'decide' || g.phase === 'card'); }, null, { timeout: 15000 });
    const ph = await kp.evaluate(() => { const g = window.BZF.R.game && window.BZF.R.game.g; return !g || g.done ? 'done' : g.phase; });
    if (ph === 'done') break;
    if (ph === 'decide' && await kp.evaluate(() => !document.querySelector('[data-act="mnBuy"]').disabled)) {
      await kp.keyboard.press('y');
      bought = await kp.evaluate(() => { const g = window.BZF.R.game.g; return { stamped: g.look.stamps.some((s) => s.p.human), owns: g.players[0].own.length }; });
    } else if (ph === 'decide') await kp.keyboard.press('n');
    else if (ph === 'card') await kp.keyboard.press('1');
    else await kp.keyboard.press('Enter');
  }
  ok('Main Street: buying a square stamps it on the board', !!bought && bought.stamped && bought.owns > 0, JSON.stringify(bought));
  await kp.evaluate(() => { window.BZF.fire('gquit'); window.BZF.fire('closeOv'); });

  /* the drills: nothing before an answer, a shake for a wrong one, coins for a right one */
  await kp.evaluate(() => { window.__fx = 0; window.BZF.fire('card', 'c1b'); });
  await kp.waitForSelector('.opt[data-act="answer"]');
  const before = await kp.evaluate(() => window.__fx);
  const right = await kp.evaluate(() => window.BZF.key('c1b', 0));
  await kp.locator('.opt[data-act="answer"]').nth(right === 0 ? 1 : 0).tap();
  const wrong = await kp.evaluate(() => ({ fx: window.__fx, shook: !!document.querySelector('.opt.fxshake'), revealed: !!document.querySelector('.opt.ok') }));
  ok('drill: no fx layer before an answer, and none for a wrong one — the wrong pick shakes and nothing is revealed', before === 0 && wrong.fx === 0 && wrong.shook && !wrong.revealed, JSON.stringify({ before, ...wrong }));
  await kp.locator('.opt[data-act="answer"]').nth(right).tap();
  await kp.waitForFunction(() => window.__fx > 0, null, { timeout: 3000 }).catch(() => {});
  ok('drill: a right answer bursts coins from the option chosen (the fx layer appears)', await kp.evaluate(() => window.__fx) > 0);
  await kp.waitForFunction(() => !document.querySelector('.fxlayer'), null, { timeout: 5000 }).catch(() => {});
  ok('drill: the fx layer clears itself when it has nothing left to draw', await kp.evaluate(() => !document.querySelector('.fxlayer')));
  /* the drill games share it: Smart Choices, right by its own key */
  /* settle on Play first: a hash change that lands after a game starts quits it */
  await kp.evaluate(() => { window.BZF.fire('closeCard'); location.hash = '#/play'; });
  await kp.waitForSelector('.cover[data-arg="sc"]');
  await kp.evaluate(() => { window.__fx = 0; const B = window.BZF; B.fire('game', 'sc'); B.fire('gbegin', 'sc'); });
  await kp.waitForSelector('.gplay [data-act="scMode"]');
  await kp.keyboard.press('1'); await kp.waitForSelector('.gplay [data-act="scSide"]');
  const tt0 = await kp.evaluate(() => window.__fx);
  await kp.keyboard.press(await kp.evaluate(() => ({ need: 'ArrowLeft', both: 'ArrowDown', want: 'ArrowRight' })[window.BZF.R.game.st.deck[0].a]));
  if (await kp.evaluate(() => window.BZF.R.game.st.step === 'reason')) await kp.keyboard.press(String(await kp.evaluate(() => window.BZF.R.game.st.deck[0].reason + 1)));
  await kp.waitForFunction(() => window.__fx > 0, null, { timeout: 3000 }).catch(() => {});
  ok('drill game: Smart Choices bursts on a right answer and not before', tt0 === 0 && await kp.evaluate(() => window.__fx) > 0, `${tt0} → ${await kp.evaluate(() => window.__fx)}`);
  await kp.evaluate(() => { window.BZF.fire('gquit'); window.BZF.fire('closeOv'); });
  ok('kit: no errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await kctx.close();

  /* reduced motion: the token goes straight to its square, and no fx layer is ever made */
  const rctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const rp = await rctx.newPage();
  await openBoard(rp);
  await rp.evaluate(MSWATCH);
  await rp.keyboard.press('Enter');
  const now = await rp.evaluate(() => { const g = window.BZF.R.game.g; return { phase: g.phase, die: g.die, trail: g.trail.length }; });
  await rp.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const seen = await rp.evaluate(() => { window.__ms.stop = true; return window.__ms.sq; });
  ok('reduced motion: Main Street skips the walk — the token lands at once, no square in between', now.phase !== 'moving' && now.trail === now.die + 1 && seen.length <= 2, JSON.stringify({ ...now, seen }));
  await rp.evaluate(() => { window.BZF.fire('gquit'); window.BZF.fire('closeOv'); window.BZF.fire('card', 'c1b'); });
  await rp.waitForSelector('.opt[data-act="answer"]');
  await rp.locator('.opt[data-act="answer"]').nth(await rp.evaluate(() => window.BZF.key('c1b', 0))).click();
  await rp.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  ok('reduced motion: a right answer makes no fx layer', await rp.evaluate(() => window.__fx) === 0);
  await rctx.close();
}

/* A6 · day one: a whole place answered cold, and the maths check as a game. A fresh child,
   keyboard on the desktop and touch on the phone (screenshots from the phone). */
async function a6Checks(label, vp, isMobile) {
  const ctx = await browser.newContext({ viewport: vp, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1 });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  const shot = (n) => SHOTS && isMobile && page.screenshot({ path: `${SHOTS}/a6-${n}.png` });
  const press = async (sel) => {
    try { if (isMobile) await page.tap(sel, { timeout: 5000 }); else { await page.focus(sel, { timeout: 5000 }); await page.keyboard.press('Enter'); } }
    catch (e) { throw new Error('could not press ' + sel + ': ' + String(e.message).split('\n')[0]); }
    await page.waitForTimeout(180);
  };
  await page.goto(URL0); await page.waitForSelector('[data-act="obStart"]');
  await page.click('[data-act="obStart"]'); await page.fill('#nm', 'Asha');
  await page.click('[data-act="obNext"]'); await page.locator('[data-act="obBand"]').last().click();
  await page.waitForFunction(() => /^#\/atlas\//.test(location.hash)); await page.evaluate(() => { location.hash = '#/home'; });   /* A3: setup opens the first stop */
  await page.waitForSelector('[data-bz=next]'); await page.waitForTimeout(3600);
  await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); }); await page.waitForTimeout(200);

  /* Home on day one offers both, as links — Continue stays the only filled button */
  const home = await page.evaluate(() => ({ cold: !!document.querySelector('.firstday a[href="#/coldplace/0"]'), game: !!document.querySelector('.firstday a[href="#/pipcount"]') }));
  const prim = await page.evaluate(PRIMARY);
  ok(`${label}: day one on Home offers “answer Market Row cold” and Pip’s counting game, with Continue still the one filled button`, home.cold && home.game && prim.length === 1 && prim[0] === 'continue', JSON.stringify({ home, prim }));
  await page.evaluate(() => document.querySelector('.firstday').scrollIntoView({ block: 'center' })); await shot('home-firstday');

  /* the counting game: Pip, a drawn icon, stepping stones — and no score at the end */
  await press('.firstday a[href="#/pipcount"]'); await page.waitForSelector('.plgame');
  const look = await page.evaluate(() => { const g = document.querySelector('.plgame'); return { pip: !!g.querySelector('img.pip'), stones: g.querySelectorAll('.pltrail li').length,
    icon: !!g.querySelector('.plscene svg'), framed: /Help Pip count/.test(g.textContent), testy: /question \d+ of|maths check|test\b/i.test(g.textContent) }; });
  await shot('game-question');
  const pickRight = async (right) => {
    const a = await page.evaluate(() => { const o = window.BZF.R.overlay; return window.BZF.placement.RUNGS[o.i].a; });
    const i = right ? a : (a + 1) % 4;
    if (isMobile) await page.tap(`[data-act="plPick"][data-arg="${i}"]`); else await page.keyboard.press('abcd'[i]);
    await page.waitForTimeout(120);
  };
  const goOn = async () => { if (isMobile) await page.tap('[data-act="plNext"]'); else { await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.keyboard.press('Enter'); } await page.waitForTimeout(120); };
  await pickRight(true); const fb1 = await page.evaluate(() => (document.querySelector('.plgame .fb') || {}).className || '');
  await shot('game-answered');
  await goOn(); const after1 = await page.evaluate(() => ({ stone: document.querySelectorAll('.pltrail li.walked').length, marked: document.querySelectorAll('.pltrail li.ok, .pltrail li.no, .pltrail li.right, .pltrail li.wrong').length }));
  after1.fb = fb1;
  await pickRight(true); await goOn(); await pickRight(true); await goOn();
  await pickRight(false); await goOn(); await pickRight(false); await goOn();
  await page.waitForSelector('.plend');
  const end = await page.evaluate(() => { const t = document.querySelector('.plend').textContent; const c = window.BZF.R.s.kids[0];
    return { digits: /\d/.test(t), says: /got as far|ceiling|reached|level|out of|right first|correct/i.test(t), pip: !!document.querySelector('.plend img.pip'), maths: c.maths && c.maths.reached, ceil: !!(c.maths && c.maths.ceiling) }; });
  await shot('game-end');
  ok(`${label}: the maths check plays as “help Pip count the stall’s takings” — Pip, a drawn icon, twelve stepping stones, no test words`, look.pip && look.stones === 12 && look.icon && look.framed && !look.testy, JSON.stringify(look));
  ok(`${label}: the game is played by ${isMobile ? 'touch' : 'keyboard'}, and a stone is lit for walking it, not for being right`, after1.stone === 1 && !after1.marked && /\bfb\b/.test(after1.fb), JSON.stringify(after1));
  ok(`${label}: it ends with Pip and no score — no number, no "how far" — while placement.js still writes the ceiling it measured`, !end.digits && !end.says && end.pip && end.maths === 3 && end.ceil, JSON.stringify(end));
  await page.evaluate(() => window.BZF.fire('closeOv')); await page.waitForTimeout(150);
  const gone = await page.evaluate(() => !document.querySelector('.firstday a[href="#/pipcount"]'));
  ok(`${label}: once played, Home stops offering the game`, gone);

  /* the Atlas offers the whole place on a first visit; the run reuses the per-stop cold path */
  await page.evaluate(() => { location.hash = '#/atlas'; }); await page.waitForTimeout(450);
  const offer = await page.evaluate(() => ({ card: !!document.querySelector('.coldcard [data-act="coldPlace"][data-arg="0"]') }));
  await page.evaluate(() => document.querySelector('.coldcard').scrollIntoView({ block: 'center' })); await shot('atlas-offer');
  await press('.coldcard [data-act="coldPlace"]'); await page.waitForTimeout(250);
  const ids = await page.evaluate(() => window.BZF.R.coldPlace && window.BZF.R.coldPlace.ids.slice());
  const s1 = await page.evaluate(() => ({ open: window.BZF.R.s.kids[0].learn.openCard, cold: window.BZF.R.cold, lesson: !!document.querySelector('main .reading'),
    note: (document.querySelector('.coldnote') || {}).textContent || '', stones: document.querySelectorAll('.coldtrail li').length }));
  await shot('cold-stop');
  const levels = [];
  const answerAll = async (id, wrongFirst) => {
    for (let q = 0; q < 3; q++) {
      const k = await page.evaluate(([x, qi]) => window.BZF.key(x, qi), [id, q]);
      const i = wrongFirst && q === 0 ? (k + 1) % 4 : k;
      await press(`[data-act="answer"][data-arg="${i}"]`);
      if (wrongFirst && q === 0) return;
      if (await page.locator('[data-act="nextQ"]').count()) await press('[data-act="nextQ"]');
    }
    await press('[data-act="cardDone"]'); await page.waitForTimeout(200);
    /* a level gained on the way gets its moment over the next stop; the child closes it */
    const lv = await page.evaluate(() => window.BZF.R.overlay && window.BZF.R.overlay.kind); if (lv) { levels.push(lv); await page.evaluate(() => window.BZF.fire('closeOv')); await page.waitForTimeout(150); }
  };
  await answerAll(ids[0], false);
  const s2 = await page.evaluate(() => ({ open: window.BZF.R.s.kids[0].learn.openCard, cold: window.BZF.R.cold, ov: window.BZF.R.overlay && window.BZF.R.overlay.kind }));
  await answerAll(ids[1], true);
  const miss = await page.evaluate(() => ({ cold: window.BZF.R.cold, lesson: !!document.querySelector('main .reading'), held: !!document.querySelector('[data-act="coldPlaceNext"]') }));
  await page.evaluate(() => { document.querySelector('.coldnote').scrollIntoView({ block: 'start' }); window.scrollBy(0, -230); }); await page.waitForTimeout(2600); await shot('cold-miss');
  await press('[data-act="coldPlaceNext"]');
  const s3 = await page.evaluate(() => ({ open: window.BZF.R.s.kids[0].learn.openCard, cold: window.BZF.R.cold }));
  await answerAll(ids[2], false);
  await press('[data-act="coldPlaceEnd"]'); await page.waitForTimeout(250);
  const done = await page.evaluate((x) => { const c = window.BZF.R.s.kids[0], o = window.BZF.R.overlay || {};
    return { kind: o.kind, yours: o.yours, waiting: o.waiting, cold: Object.keys(c.learn.cold || {}), done: x.map((id) => !!c.learn.done[id]), text: (document.querySelector('.ovbox') || {}).textContent || '',
      report: window.BZF.reportcard.card(c).progress.cold, run: !!window.BZF.R.coldPlace }; }, ids);
  await shot('cold-done');
  ok(`${label}: the Atlas offers “already know this place? answer it cold” on a first visit`, offer.card, JSON.stringify(offer));
  ok(`${label}: the run opens the place’s first stop cold — lesson hidden, “stop 1 of N” and stepping stones`, ids && ids.length >= 3 && s1.open === ids[0] && s1.cold === ids[0] && !s1.lesson && /Answering Market Row cold · stop 1 of/.test(s1.note) && s1.stones === ids.length, JSON.stringify(s1));
  ok(`${label}: three right first time walks the stop and goes straight on to the next, cold`, s2.open === ids[1] && s2.cold === ids[1], JSON.stringify(s2));
  ok(`${label}: a miss opens that stop’s lesson where the child is, with “carry on cold” — and carrying on skips it`, !miss.cold && miss.lesson && miss.held && s3.open === ids[2] && s3.cold === ids[2], JSON.stringify({ miss, s3 }));
  ok(`${label}: the end says what was yours and what waits — marked through the per-stop path (c.learn.cold), and the missed stop is not walked`,
    !levels.some((k) => k !== 'level') && done.kind === 'coldPlaceDone' && done.yours === 2 && done.waiting.length === 1 && done.waiting[0] === ids[1] && done.cold.includes(ids[0]) && done.cold.includes(ids[2]) && !done.cold.includes(ids[1])
      && done.done[0] && !done.done[1] && done.done[2] && !done.done[3] && done.report === 2 && !done.run && /yours already/.test(done.text), JSON.stringify({ ...done, levels }));
  /* E3 · an arithmetic stop shows its worked example in the lesson, and not while answering cold */
  await page.evaluate(() => { window.BZF.fire('closeOv'); window.BZF.fire('card', 'c1f'); }); await page.waitForTimeout(250);
  const wk = await page.evaluate(() => { const w = document.querySelector('main .reading .yhow.worked'); return { shown: !!w, steps: w ? w.querySelectorAll('li').length : 0, text: w ? w.textContent : '' }; });
  if (wk.shown) { await page.evaluate(() => { document.querySelector('main .yhow.worked').scrollIntoView({ block: 'center' }); }); await page.waitForTimeout(200); await shot('e3-worked'); }
  await page.evaluate(() => window.BZF.fire('coldStart', 'c1f')); await page.waitForTimeout(150);
  const wkCold = await page.evaluate(() => !!document.querySelector('main .yhow.worked'));
  await page.evaluate(() => window.BZF.fire('closeCard'));
  ok(`${label}: an arithmetic stop shows the sum step by step in its lesson, and hides it while answered cold`, wk.shown && wk.steps >= 3 && /35 \+ 5 = 40/.test(wk.text) && !wkCold, JSON.stringify({ ...wk, wkCold }));
  ok(`${label}: the A6 run threw nothing`, !errors.length, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

/* The hello card's face is the child's own, and a tap (or Enter) opens their avatar cards:
   every face they own, each with its overall, its rank among the 96 and a line of money
   history; flipped by button, arrow key and swipe; worn from the card (Bizzing Bee's deck). */
async function deckChecks() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(URL0 + '?demo'); await p.waitForSelector('[data-bz=greet] .bz-avbtn');
  await p.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); });
  const face = await p.evaluate(() => ({ greet: document.querySelector('[data-bz=greet] .bz-avbtn img').getAttribute('src'), worn: window.BZF.R.s.kids[window.BZF.R.s.active].avatar }));
  ok('deck: the hello card shows the child’s own face, as a button', face.greet.includes('/' + face.worn + '.webp'), JSON.stringify(face));
  await p.tap('[data-bz=greet] .bz-avbtn'); await p.waitForSelector('.avdeck .avc');
  const read = () => p.evaluate(() => { const c = document.querySelector('.avdeck .avc'); return { name: c.querySelector('.avc-name').textContent, ovr: +c.querySelector('.avc-ovr b').textContent, rank: c.querySelector('.avc-rank').textContent.trim(), fact: (c.querySelector('.avc-fact') || {}).textContent || '', count: document.querySelector('.avd-count').textContent, worn: !!document.querySelector('.avd-worn') }; });
  const first = await read();
  ok('deck: it opens on the face being worn, with its overall, its rank of 96 and a line of history', first.worn && first.ovr >= 28 && /^#\d+ of 96$/.test(first.rank.replace(/\s+/g, ' ')) && /history of money/i.test(first.fact) && /of \d+ yours/.test(first.count), JSON.stringify(first));
  await p.tap('.avd-nav.next'); const b1 = await read();
  await p.keyboard.press('ArrowLeft'); const b2 = await read();
  const box = await p.locator('.avdeck .avc').boundingBox();
  await p.touchscreen.tap(box.x + 5, box.y + 5);   /* settle focus inside */
  await p.evaluate(({ x, y }) => { const el = document.querySelector('.avdeck .avc'); const t = (cx) => new Touch({ identifier: 1, target: el, clientX: cx, clientY: y });
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [t(x + 200)] })); el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [t(x + 40)] })); }, { x: box.x, y: box.y + 200 });
  const b3 = await read();
  ok('deck: the arrow button, ← and a swipe each flip a card', b1.name !== first.name && b2.name === first.name && b3.name === b1.name, [first.name, b1.name, b2.name, b3.name].join(' → '));
  await p.tap('.avdeck [data-act="avdWear"]'); await p.waitForTimeout(150);
  const wore = await p.evaluate(() => ({ worn: window.BZF.R.s.kids[window.BZF.R.s.active].avatar, badge: !!document.querySelector('.avd-worn') }));
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  const after = await p.evaluate(() => ({ open: !!document.querySelector('.avdeck'), greet: document.querySelector('[data-bz=greet] .bz-avbtn img').getAttribute('src') }));
  ok('deck: "Wear this one" wears it, Escape closes, and the hello card shows the new face', wore.badge && wore.worn !== face.worn && !after.open && after.greet.includes('/' + wore.worn + '.webp'), JSON.stringify({ wore, after }));
  ok('deck: nothing threw', !errors.length, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

/* ══ Stall of My Own (docs/12 §2.1) · plan, market day, ledger — keyboard AND touch ══
   A season played in the built app on a phone and a desktop, light and dark: the plan
   answers keys and taps, Enter opens the stall, a key serves the customer at the front,
   R restocks and every serve button is disabled while it does (SA4 on screen), and the
   ledger page carries the five lines. STALL_SHOTS=dir keeps a picture of each page. */
async function stallChecks(label, vp, isMobile, scheme) {
  const ctx = await browser.newContext({ viewport: vp, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1, colorScheme: scheme });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const SH = process.env.STALL_SHOTS || '';
  if (SH) mkdirSync(SH, { recursive: true });
  const shot = (n) => SH && p.screenshot({ path: `${SH}/stall-${n}-${vp.width}-${scheme}.png`, fullPage: n === 'plan' });
  const wide = () => p.evaluate((W) => document.scrollingElement.scrollWidth <= W + 1, vp.width);
  await p.goto(URL0 + '?demo'); await p.waitForSelector('[data-bz=next]');
  await p.evaluate(() => { const B = window.BZF; B.R.s.settings.tester = true; B.setTester(true); B.fire('closeOv'); B.fire('game', 'so'); B.fire('gbegin', 'so'); });
  await p.waitForSelector('.gplay [data-act="soGoal"]');
  await p.keyboard.press('1');
  await p.waitForSelector('.gplay .so-buy');
  const plan = await p.evaluate(() => ({ rows: document.querySelectorAll('.so-buy').length, strip: document.querySelectorAll('.so-strip .so-cell').length,
    why: /The week ahead/.test(document.querySelector('.gplay').textContent), cover: /url\(/.test(getComputedStyle(document.querySelector('.gplay .stage'), '::before').backgroundImage) }));
  ok(`stall ${label}: the plan opens on Market Row's painting — the week ahead, a wholesaler row and a demand strip per product`, plan.rows >= 2 && plan.strip === plan.rows * 5 && plan.why && plan.cover, JSON.stringify(plan));
  /* keyboard: ↓ to the first product, → buys one */
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  const byKey = await p.evaluate(() => +document.querySelector('.so-buy .so-n').textContent);
  /* touch: + on the second product */
  const plus = p.locator('.gplay [data-act="soBuy"][data-arg$=":1"]').nth(1);
  if (isMobile) await plus.tap(); else await plus.click();
  const byTap = await p.evaluate(() => +document.querySelectorAll('.so-buy .so-n')[1].textContent);
  ok(`stall ${label}: the plan answers the keyboard (↓ →) and a ${isMobile ? 'tap' : 'click'}`, byKey === 2 && byTap === 1, `${byKey} by key, ${byTap} by ${isMobile ? 'tap' : 'click'}`);
  /* stock the stall properly for the day (the same taps, fired) */
  await p.evaluate(() => { const B = window.BZF, s = B.R.game.season; Object.keys(s.draft.buy).forEach((id) => { for (let i = 0; i < 8; i++) B.fire('soBuy', id + ':1'); }); });
  ok(`stall ${label}: nothing runs off the screen on the plan`, await wide());
  await shot('plan');
  await p.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); });
  await p.keyboard.press('Enter');
  await p.waitForSelector('.gplay .so-counter');
  await p.waitForSelector('.gplay .so-front[data-want]', { timeout: 6000 });
  const want = await p.evaluate(() => { const w = document.querySelector('.so-front').dataset.want; return Object.keys(window.BZF.R.game.season.day.prices).indexOf(w) + 1; });
  await p.keyboard.press(String(want)); await p.waitForTimeout(120);
  const served = await p.evaluate(() => window.BZF.R.game.day.st.served);
  ok(`stall ${label}: Enter opens the stall, and a number key serves the customer at the front`, served === 1, `served ${served}`);
  await shot('market');
  ok(`stall ${label}: nothing runs off the screen on market day`, await wide());
  await p.keyboard.press('r'); await p.waitForTimeout(80);
  const rs = await p.evaluate(() => ({ busy: window.BZF.R.game.day.st.restock > 0, dis: [...document.querySelectorAll('.gplay [data-act="soServe"]')].every((b) => b.disabled), msg: (document.querySelector('.so-restock') || {}).textContent || '' }));
  ok(`stall ${label}: R restocks, and every serve button is disabled until it is done`, (rs.busy && rs.dis && /Restocking/.test(rs.msg)) || !rs.busy, JSON.stringify(rs).slice(0, 120));
  /* the rest of the day, on the wall's clock — then the ledger page */
  await p.evaluate(() => window.BZF.R.game.day.advance(61000));
  await p.waitForSelector('.gplay .so-ledger', { timeout: 4000 });
  const led = await p.evaluate(() => document.querySelector('.gplay').textContent);
  ok(`stall ${label}: the ledger page separates takings, what it cost, unsold and spoiled, profit and the jar — margin said in coins`,
    ['Takings', 'What it cost', 'Unsold and spoiled', 'Profit', 'Cart jar'].every((w) => led.includes(w)) && /kept from every|nothing kept/.test(led), '');
  ok(`stall ${label}: nothing runs off the screen on the ledger page`, await wide());
  await shot('ledger');
  ok(`stall ${label}: nothing threw`, !errors.length, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

/* docs/12 §1.5, §1.8, §2.7 (T7) — the clocks at 4 fps, a hidden tab, the 44 px steppers,
   dark end cards, faces on the board and the Market Game's lock, in the built app.
   4 fps is made by replacing requestAnimationFrame with a 250 ms timer, and each frame
   logs the game's own clock beside the frame's timestamp, so the comparison is exact. */
async function gameChecks() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'dark' });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(e.message + (process.env.STACK ? ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' ') : '')));
  await p.goto(URL0 + '?demo'); await p.waitForSelector('[data-bz=next]');
  await p.evaluate(() => { const B = window.BZF; B.R.s.settings.tester = true; B.setTester(true); B.fire('closeOv'); });
  const SLOW = () => {
    window.__frames = [];
    window.requestAnimationFrame = (cb) => setTimeout(() => {
      const ts = performance.now(); cb(ts);
      const g = window.BZF.R.game, st = (g && g.st) || {};
      window.__frames.push({ ts, t: st.t, left: st.left, wall: Date.now() });
    }, 250);
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  };
  await p.evaluate(SLOW);
  const start = async (id) => { await p.evaluate((g) => { const B = window.BZF; B.fire('game', g); B.fire('gbegin', g); }, id); await p.waitForFunction((g) => window.BZF.R.game && window.BZF.R.game.id === g, id); };
  /* game time ÷ wall time between the first and last frames that moved the clock */
  const rate = (key, sign = 1) => p.evaluate(({ key, sign }) => {
    const f = window.__frames.filter((x) => Number.isFinite(x[key]));
    const live = f.filter((x, i) => i > 0 && x[key] !== f[i - 1][key]);
    if (live.length < 4) return { n: live.length };
    const a = live[0], b = live[live.length - 1];
    const gaps = live.slice(1).map((x, i) => x.ts - live[i].ts).sort((m, n) => m - n);
    return { n: live.length, r: sign * (b[key] - a[key]) / (b.ts - a.ts), wall: (b.wall - a.wall) / (b.ts - a.ts), fps: 1000 / gaps[gaps.length >> 1] };
  }, { key, sign });
  const res = {};
  /* Change Rush (60 s) — past its 3-2-1 */
  await start('cr'); await p.evaluate(() => { window.__frames = []; }); await p.waitForTimeout(6500); res.cr = await rate('t');
  /* a hidden tab: the clock stops, and carries on when it is back */
  const hide = (h) => p.evaluate((h) => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => h }); document.dispatchEvent(new Event('visibilitychange')); if (!h) delete document.hidden; }, h);
  const t0 = await p.evaluate(() => window.BZF.R.game.st.t);
  await hide(true); await p.waitForTimeout(1500);
  const t1 = await p.evaluate(() => window.BZF.R.game.st.t);
  await hide(false); await p.waitForTimeout(1200);
  const t2 = await p.evaluate(() => window.BZF.R.game.st.t);
  res.hidden = { held: t1 - t0, after: t2 - t1 };
  await p.evaluate(() => window.BZF.fire('gquit')); await p.evaluate(() => window.BZF.fire('closeOv'));
  /* Market Storm (42 s) */
  /* §2.5 · the plan is written first (when you would sell, why you bought), then the storm runs */
  await start('st'); await p.evaluate(() => { const g = window.BZF.R.game; g.act('stRule', 'stops'); g.act('stWhy', 'card'); g.act('stGo'); window.__frames = []; }); await p.waitForTimeout(4000); res.st = await rate('t');
  await p.evaluate(() => window.BZF.R.game.act('stSell')); await p.waitForTimeout(300);
  /* §1.8 · the storm's end card, in dark mode: the sentence it is for can be read */
  const endContrast = () => p.evaluate(() => {
    const el = document.querySelector('.gplay .endkey'); if (!el) return null;
    const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
    const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const cs = getComputedStyle(el), fg = rgb(cs.color), bg = rgb(cs.backgroundColor);
    /* the painting behind can be anything from black to white: the sentence must read over both,
       which only its own paper can promise */
    const a = bg[3] == null ? (bg.length >= 3 ? 1 : 0) : bg[3];
    const cr = (under) => { const b = (bg.length >= 3 ? bg : [0, 0, 0]).slice(0, 3).map((x, i) => x * a + under[i] * (1 - a)); const L1 = lum(fg), L2 = lum(b); return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); };
    return +Math.min(cr([0, 0, 0]), cr([255, 255, 255])).toFixed(2);
  });
  res.stEnd = await endContrast();
  await p.evaluate(() => window.BZF.fire('gquit')); await p.evaluate(() => window.BZF.fire('closeOv'));
  /* the Month Planner's end card (Budget Blitz rebuilt), dark */
  await start('mp'); await p.evaluate(() => { const g = window.BZF.R.game; for (let i = 0; i < 60 && !g.st.done; i++) { if (g.st.step === 'yearly') { g.act('mpKey', '1'); g.act('mpCheck'); g.act('mpCheck'); } else if (g.st.step === 'month') g.act('mpNext'); else g.act('mpSkip'); } });
  await p.waitForTimeout(200); res.bbEnd = await endContrast();
  await p.evaluate(() => window.BZF.fire('gquit')); await p.evaluate(() => window.BZF.fire('closeOv'));
  /* Compound Climb's charge: hold 800 ms of wall time, let go between frames */
  await start('cc');
  res.cc = await p.evaluate(async () => {
    const g = window.BZF.R.game; const a = performance.now(); g.act('ccHold');
    await new Promise((r) => setTimeout(r, 830)); const b = performance.now(); g.act('ccRelease');
    return { got: g.st.maxCharge, want: (b - a) * 0.075 * g.kn.charge };
  });
  await p.evaluate(() => window.BZF.fire('gquit')); await p.evaluate(() => window.BZF.fire('closeOv'));
  /* the Sweep job (45 s) */
  await p.evaluate(async () => { const B = window.BZF, g = await B.startJobGame('sweep', () => B.quitGame()); B.R.game = g; B.R.s.ui.nav = 'arcade'; B.R.render(); g.act('jgStart'); window.__frames = []; });
  await p.waitForTimeout(6000); res.sweep = await rate('left', -1);
  await p.evaluate(() => window.BZF.quitGame());
  const near = (x) => x && x.r > 0.95 && x.r < 1.05 && x.fps > 3.5 && x.fps < 4.5 && Math.abs(x.wall - 1) < 0.05;
  ok('clocks at 4 fps run at 1.0× wall time (±5%): Change Rush, Market Storm, the Sweep job', near(res.cr) && near(res.st) && near(res.sweep), JSON.stringify({ cr: res.cr, st: res.st, sweep: res.sweep }));
  ok('Compound Climb\'s charge at 4 fps is the time actually held, to the moment of letting go (±5%)', res.cc.got > res.cc.want * 0.95 && res.cc.got < res.cc.want * 1.05, JSON.stringify(res.cc));
  ok('a hidden tab pauses the game, and it carries on when the tab is back', res.hidden.held === 0 && res.hidden.after > 500, JSON.stringify(res.hidden));
  ok('dark mode: the Month Planner\'s and Market Storm\'s end-card sentence reads (contrast ≥ 4.5)', res.stEnd >= 4.5 && res.bbEnd >= 4.5, `storm ${res.stEnd} · planner ${res.bbEnd}`);
  /* §1.8 · the Market Cup's steppers are thumb-sized */
  await start('mc');
  const step = await p.evaluate(() => [...document.querySelectorAll('.gplay .stepper button')].map((b) => { const r = b.getBoundingClientRect(); return Math.min(r.width, r.height); }));
  const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok('the Market Cup\'s steppers are at least 44 px, and the screen still fits a phone', step.length === 8 && step.every((x) => x >= 44) && over <= 1, `${step.join(',')} · overflow ${over}`);
  await p.evaluate(() => window.BZF.fire('gquit')); await p.evaluate(() => window.BZF.fire('closeOv'));
  /* §2.9 · the board's tokens wear faces */
  await p.evaluate(() => { window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16); });
  await start('mn'); await p.waitForTimeout(800);
  const faces = await p.evaluate(() => { const f = window.BZF.R.game.g.look.faces || []; return f.map((im) => im.complete && im.naturalWidth > 0); });
  ok('Main Street\'s tokens are faces — the child\'s avatar, Mags and Bo — loaded and drawn', faces.length === 3 && faces.every(Boolean), JSON.stringify(faces));
  await p.evaluate(() => window.BZF.fire('gquit')); await p.evaluate(() => window.BZF.fire('closeOv'));
  /* the Market Game is open from day one, on the ☰ drawer link and its route (it once opened at level 13) */
  await p.evaluate(() => { const B = window.BZF; B.R.s.settings.tester = false; B.setTester(false); B.R.s.kids[B.R.s.active].learn.level = 4; B.fire('drawer'); });
  await p.waitForSelector('.drawer');
  const dr = await p.evaluate(() => { const b = document.querySelector('.drawer [data-arg="market40"]'); return b ? { locked: b.classList.contains('locked') || /Opens at level/.test(b.textContent) || !!b.querySelector('svg.lock, [data-ico="lock"]') } : null; });
  await p.evaluate(() => { const B = window.BZF; B.fire('closeOv'); location.hash = '#/market40'; }); await p.waitForTimeout(400);
  const route = await p.evaluate(() => ({ game: !!document.querySelector('[data-act="mgAct"], [data-act="mgPlay"], .m40hall') }));
  ok('at level 4 the ☰ drawer offers the Market Game unlocked, and #/market40 opens the game — every game is open from day one (owner, 9 Oct 2026)', dr && !dr.locked && route.game, JSON.stringify({ dr, route }));
  ok('games: nothing threw', !errors.length, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

/* ══ Save or Borrow? (docs/12 §2.10) · every step on a phone, by touch, light and dark ══
   From the Play tab and from the Bank's own counter; the typed step held on a miss; the
   strip fast-forwarding on the wall's clock; the card answered; the round finished. */
async function sbChecks(label, scheme) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, colorScheme: scheme });
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', (e) => errors.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  /* a phone's screen (390×844), scrolled to what the step is about */
  const shot = async (n, sel) => { if (!SHOTS) return; if (sel) await p.evaluate((q) => { const e = document.querySelector(q); if (e) e.scrollIntoView({ block: 'center' }); }, sel); await p.waitForTimeout(120); await p.screenshot({ path: `${SHOTS}/sb-${n}-${scheme}.png` }); };
  const wide = () => p.evaluate(() => document.documentElement.scrollWidth > 390);
  const st = () => p.evaluate(() => { const s = window.BZF.R.game && window.BZF.R.game.st; return s && { step: s.step, gi: s.gi, ai: s.ai, week: s.week, done: s.done, held: !!s.held, typed: s.typed,
    want: s.round.goals[s.gi].asks[s.ai] && s.round.goals[s.gi].asks[s.ai].want, n: s.round.goals[s.gi].paths.length, H: s.round.goals[s.gi].weeks,
    answer: s.log[s.gi].cmp && s.log[s.gi].cmp.question.answer, ans: s.log[s.gi].ans, points: s.points }; });
  await p.goto(URL0 + '?demo'); await p.waitForSelector('[data-bz=next]');
  await p.evaluate(() => { const B = window.BZF; B.R.s.settings.tester = true; B.setTester(true); B.fire('closeOv'); location.hash = '#/play'; });
  await p.waitForSelector('.cover[data-arg="sb"]');
  const cover = await p.evaluate(() => { const el = document.querySelector('.cover[data-arg="sb"]'); return { act: el.dataset.act, art: /url\(/.test(getComputedStyle(el).getPropertyValue('--cover')) }; });
  ok(`${label}: Save or Borrow? is on the Play tab, open, with its painting`, cover.act === 'game' && cover.art, JSON.stringify(cover));
  await p.tap('.cover[data-arg="sb"]'); await p.waitForSelector('.gintro');
  ok(`${label}: it opens on its title card with three levels and three goals`, await p.evaluate(() => document.querySelectorAll('.gintro li').length === 3 && document.querySelectorAll('.tierbtn').length === 3 && document.querySelectorAll('.gilevel .goals li').length === 3));
  await shot('0-intro');
  await p.tap('[data-act="gbegin"]'); await p.waitForSelector('.sbstage .sbpad');
  await p.waitForTimeout(300);
  const paint = await p.evaluate(() => { const b = getComputedStyle(document.querySelector('.sbstage'), '::before'); return /url\(/.test(b.backgroundImage) && !!document.querySelector('.sbbank').naturalWidth; });
  ok(`${label}: the stage is Clocktower Square, with the Bank drawn on the goal`, paint);
  await shot('1-predict', '.sbask');
  /* a miss holds, with the sum */
  let s = await st();
  for (const d of String(s.want + 1)) await p.tap(`.sbpad [data-act="sbKey"][data-arg="${d}"]`);
  await p.tap('.sbpad [data-act="sbCheck"]'); await p.waitForSelector('.sbhold');
  const hold = await p.evaluate(() => ({ text: document.querySelector('.sbhold').textContent, pad: !!document.querySelector('.sbpad') }));
  ok(`${label}: a typed miss holds and writes out the sum, the pad put away`, /×/.test(hold.text) && /=/.test(hold.text) && !hold.pad, hold.text.trim().slice(0, 80));
  await shot('1b-hold', '.sbhold');
  await p.tap('.sbstage [data-act="sbCheck"]');
  s = await st();
  /* Tricky asks twice; Standard (the level a game opens on) once */
  while (s.step === 'predict') { for (const d of String(s.want)) await p.tap(`.sbpad [data-act="sbKey"][data-arg="${d}"]`); await p.tap('.sbpad [data-act="sbCheck"]'); await p.tap('.sbstage [data-act="sbCheck"]'); s = await st(); }
  await p.waitForSelector('[data-act="sbPath"]');
  const same = await p.evaluate(() => new Set([...document.querySelectorAll('[data-act="sbPath"]')].map((b) => b.className)).size === 1);
  ok(`${label}: step 2 offers every path as the same button, none labelled`, same && !(await wide()));
  await shot('2-choose', '.sbpaths');
  await p.locator('[data-act="sbPath"]').last().tap();
  await p.waitForSelector('[data-act="sbCushion"]'); await shot('2b-cushion', '.sbpaths');
  await p.tap('[data-act="sbCushion"][data-arg="1"]');
  await p.waitForSelector('.sbstrip');
  const w0 = (await st()).week; await p.waitForTimeout(1300); const w1 = (await st()).week;
  ok(`${label}: the calendar strip fast-forwards the weeks, every path side by side`, w1 > w0 && await p.evaluate(() => document.querySelectorAll('.sbrow').length) === s.n, `week ${w0} → ${w1}`);
  /* re-drawn each week, the card is dealt once: a pop on every week was a blank, flickering stage */
  const anim = await p.evaluate(() => getComputedStyle(document.querySelector('.sbstrip').closest('.gcard')).animationName);
  ok(`${label}: the strip's card does not re-deal itself each week`, anim === 'none', anim);
  await shot('3-live', '.sbstrip');
  await p.waitForFunction(() => window.BZF.R.game.st.week >= window.BZF.R.game.st.round.goals[window.BZF.R.game.st.gi].weeks, null, { timeout: 8000 });
  await p.waitForSelector('.sbsum');
  ok(`${label}: at week 12 each path says what it cost, how long you had it and the surprise`, await p.evaluate(() => [...document.querySelectorAll('.sbsum')].every((e) => /Paid/.test(e.textContent) && /had it/.test(e.textContent))) && !(await wide()));
  await shot('3b-strip', '.sbstrip');
  await p.tap('[data-act="sbSkip"]'); await p.waitForSelector('.sbcard');
  ok(`${label}: the comparison card says it in coins`, await p.evaluate(() => /cost .*and you were .* from week \d+/.test(document.querySelector('.sbcard').textContent)));
  await shot('4-card', '.sbcard');
  s = await st();
  await p.tap(`[data-act="sbAns"][data-arg="${s.answer}"]`); await p.waitForSelector('.sbhold.ok');
  await shot('4b-answer', '.sbhold');
  /* the rest by keyboard: the same round answers keys too */
  for (let i = 0; i < 200; i++) {
    s = await st(); if (!s || s.done) break;
    if (s.step === 'predict') { if (s.held) await p.keyboard.press('Enter'); else { for (const d of String(s.want)) await p.keyboard.press(d); await p.keyboard.press('Enter'); } }
    else if (s.step === 'choose') await p.keyboard.press('1');
    else if (s.step === 'cushion') await p.keyboard.press('2');
    else if (s.step === 'live') await p.keyboard.press('Enter');
    else if (s.step === 'card') { if (s.ans == null) { const n = await p.evaluate(() => { const g = window.BZF.R.game.st; return g.round.goals[g.gi].paths.findIndex((x) => x.id === g.log[g.gi].cmp.question.answer) + 1; }); await p.keyboard.press(String(n)); } else await p.keyboard.press('Enter'); }
    await p.waitForTimeout(40);
  }
  s = await st();
  ok(`${label}: the round finishes, scored on the decisions (one miss typed: 18 of 24)`, s && s.done && s.points === 18 && await p.evaluate(() => /You practised:/.test(document.querySelector('.endcard').textContent)), JSON.stringify(s && { done: s.done, points: s.points }));
  await shot('5-end');
  /* and from the Bank's own counter */
  await p.evaluate(() => { window.BZF.fire('gquit'); window.BZF.fire('closeOv'); window.BZF.fire('sub', 'bank'); });
  await p.waitForSelector('[data-focus="game:sb"] [data-act="game"]');
  await shot('6-bank', '[data-focus="game:sb"]');
  await p.tap('[data-focus="game:sb"] [data-act="game"]'); await p.waitForSelector('.gintro');
  ok(`${label}: the Bank offers it at its counter, and it opens on the title card`, await p.evaluate(() => /Save or Borrow/.test(document.querySelector('.gintro h1').textContent)));
  ok(`${label}: nothing threw`, !errors.length, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

/* T13 · the Shift engine in the built app: one shift per template, played to its end card by
   keyboard alone on the desktop and by touch alone on the phone. The HUD must move on every
   item, a wrong answer must hold with its correction, and the card must be the shift's own.
   Phone runs (light and dark) leave a screenshot of each template mid-shift. */
async function shiftChecks(label, vp, isMobile, scheme) {
  const ctx = await browser.newContext({ viewport: vp, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0); await page.waitForSelector('[data-act="obStart"]');
  await page.click('[data-act="obStart"]'); await page.fill('#nm', 'Asha');
  await page.click('[data-act="obNext"]'); await page.locator('[data-act="obBand"]').last().click();
  await page.waitForFunction(() => /^#\/atlas\//.test(location.hash)); await page.evaluate(() => { location.hash = '#/home'; });
  await page.waitForSelector('[data-bz=next]'); await page.waitForTimeout(400);
  await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); });
  const tap = async (sel) => { try { await page.tap(sel, { timeout: 5000 }); } catch (e) { throw new Error(`could not tap ${sel}: ${String(e.message).split("\n")[0]}`); } };
  const key = async (k) => { await page.keyboard.press(k); };
  const probe = () => page.evaluate(() => { const g = window.BZF.R.game; if (!g || !g.__st) return null; const p = g.__st();
    const hud = (h) => { const el = document.querySelector(`.hud [data-hud="${h}"]`); return el ? el.textContent.trim() : ''; };
    return { kind: p.kind, ready: p.ready, hold: p.hold, done: p.done, over: p.over, picking: p.picking, i: p.i, right: p.right, solution: p.solution, item: p.item,
      hudItem: hud('item'), hudRight: hud('right'), clock: hud('clock'), fb: !!document.querySelector('.shiftfb') }; });
  const settle = () => page.waitForFunction(() => { const g = window.BZF.R.game; if (!g || !g.__st) return true; const p = g.__st(); return p.ready || p.hold || p.done; }, null, { timeout: 15000 });
  const input = async (p, ans) => {
    const it = p.item, digits = (s) => String(s).split('');
    if (!isMobile) {
      if (p.kind === 'count') await key(String(ans));
      else if (p.kind === 'change') { for (const v of ans) await key(String(it.D.indexOf(v) + 1)); await key('Enter'); }
      else if (p.kind === 'ledger') { if (it.mode === 'check') await key('abcd'[ans]); else { for (const d of digits(ans)) await key(d); await key('Enter'); } }
      else await key('abcde'[ans]);
      return;
    }
    if (p.kind === 'change') { for (const v of ans) await tap(`[data-act="jgCoin"][data-arg="${v}"]`); await tap('[data-act="jgGive"]'); }
    else if (p.kind === 'ledger' && it.mode !== 'check') { for (const d of digits(ans)) await tap(`[data-act="jgDigit"][data-arg="${d}"]`); await tap('[data-act="jgEnter"]'); }
    else await tap(`[data-act="jgPick"][data-arg="${ans}"]`);
  };
  const wrongOf = (p) => (p.kind === 'change' ? [p.item.D[0]].concat(p.solution) : p.kind === 'ledger' ? (p.item.mode === 'check' ? (p.solution + 1) % 4 : p.solution + 1) : (p.solution + 1) % p.item.choices);
  const ONE = { count: 'crates', change: 'counter', ledger: 'books', route: 'flyers' };
  const out = {};
  for (const [kind, id] of Object.entries(ONE)) {
    const r = out[kind] = { hud: [], held: false, painted: 0 };
    await page.evaluate(async (id) => { const B = window.BZF, { R } = B; delete R.s.kids[0].jobs[id];
      const g = await B.startJobGame(id, () => B.quitGame()); if (R.game && R.game.stop) R.game.stop(); R.game = g; R.s.ui.nav = 'arcade'; R.render(); window.scrollTo(0, 0); }, id);
    await page.waitForSelector('.jgpick [data-act="jgStart"]');
    /* the level picker by the same hand: Standard, then start */
    if (isMobile) { await tap('.jgpick [data-act="jgTier"][data-arg="standard"]'); await tap('[data-act="jgStart"]'); }
    else { await key('2'); await key('Enter'); }
    await settle();
    let p = await probe(); r.start = { item: p.hudItem, right: p.hudRight, picking: p.picking };
    /* item one, wrong on purpose: it holds, says why, and goes on by the same hand */
    await input(p, wrongOf(p)); await settle();
    p = await probe(); r.held = p.hold && p.fb;
    if (SHOTS && isMobile && kind === 'change' && scheme === 'light') await page.screenshot({ path: `${SHOTS}/shift-hold-light.png`, fullPage: true });
    if (isMobile) await tap('[data-act="jgNext"]'); else await key('Enter');
    await settle();
    for (let n = 0; n < 14; n++) {
      p = await probe(); if (!p || p.done || p.over) break;
      r.hud.push(`${p.hudItem}|${p.hudRight}`);
      if (n === (kind === 'ledger' ? 3 : 2)) {   /* item four on the ledger is a line to write; three is last week's page */
        r.painted = await page.evaluate(() => { const cv = document.getElementById('jobCanvas'); if (!cv) return 0; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; const s = new Set(); for (let i = 0; i < d.length; i += 4 * 97) s.add((d[i] >> 4) + '-' + (d[i + 1] >> 4) + '-' + (d[i + 2] >> 4)); return s.size; });
        if (SHOTS && isMobile) await page.screenshot({ path: `${SHOTS}/shift-${kind}-${scheme}.png`, fullPage: true });
      }
      await input(p, p.solution); await settle();
      if ((await probe()).hold) { if (isMobile) await tap('[data-act="jgNext"]'); else await key('Enter'); await settle(); }
    }
    await page.waitForSelector('.shiftend', { timeout: 8000 });
    r.card = await page.evaluate(() => { const e = document.querySelector('.shiftend'); return { practised: (e.querySelector('.practised') || {}).textContent || '', paid: (e.querySelector('.shiftpaid') || {}).textContent || '', h2: e.querySelector('h2').textContent }; });
    r.right = await page.evaluate(() => window.BZF.R.game.st.right);
    if (SHOTS && isMobile) await page.screenshot({ path: `${SHOTS}/shift-${kind}-end-${scheme}.png`, fullPage: true });
    if (isMobile) await tap('.shiftend [data-act="gquit"]'); else { await page.focus('.shiftend [data-act="gquit"]'); await key('Enter'); }
    await page.waitForTimeout(150);
    r.left = await page.evaluate(() => !window.BZF.R.game);
    await page.evaluate(() => window.BZF.fire('closeOv')); await page.waitForTimeout(100);   /* the between-card a quit may offer */
    const how = isMobile ? 'touch' : 'keyboard';
    const moved = r.hud.every((h, k) => h.startsWith(`${k + 2} of 12|`)) && r.hud.length === 11;
    ok(`${label}: ${kind} shift by ${how} alone — picker, a wrong answer that holds, eleven right, the HUD moving every item, drawn on the place, its own end card`,
      r.start.item === '1 of 12' && r.start.right === '0 right' && !r.start.picking && r.held && moved && r.painted > 40 && r.right === 11
        && /You practised:/.test(r.card.practised) && !/paying exact amounts/.test(r.card.practised) && /Earned/.test(r.card.paid) && r.left,
      JSON.stringify({ start: r.start, held: r.held, hud: r.hud.slice(0, 3).concat(r.hud.slice(-1)), painted: r.painted, right: r.right, card: r.card.practised.slice(0, 50), left: r.left }));
  }
  ok(`${label}: no page errors during the shifts`, !errors.length, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* T16 · the Play tab is ten cards in three groups (docs/12 §3): Flagships (Stall of My Own and
   the Market Game) · Train (Smart Choices, Month Planner, Compound Climb, Save or Borrow?) ·
   Play (Change Rush, Market Storm, the Market Cup, Main Street) — and no retired card */
async function playTabChecks() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(URL0 + '?demo#/play'); await p.waitForSelector('.cover');
  const t = await p.evaluate(() => {
    const groups = [...document.querySelectorAll('.sect[data-group]')].map((x) => x.dataset.group);
    const names = [...document.querySelectorAll('main .cover b')].map((b) => b.textContent.trim());
    return { groups, names, wide: document.scrollingElement.scrollWidth <= innerWidth + 1 };
  });
  /* every game is open from the first day, before any chapter is finished (owner, 9 Oct 2026) */
  const fresh = await p.evaluate(() => { const B = window.BZF, k = B.R.s.kids[B.R.s.active]; B.setTester(false); B.R.s.settings.tester = false; k.learn.done = {}; k.learn.level = 1; B.R.render();
    return { locked: document.querySelectorAll('main .cover.locked').length, open: [...document.querySelectorAll('main .cover')].filter((b) => ['game', 'nav'].includes(b.dataset.act)).length }; });
  ok('a child on day one, with no chapter finished, can open all ten games — nothing says learn first', fresh.locked === 0 && fresh.open === 10, JSON.stringify(fresh));
  const want = ['Stall of My Own', 'The Market Game', 'Smart Choices', 'Month Planner', 'Compound Climb', 'Save or Borrow?', 'Change Rush', 'Market Storm', 'The Market Cup', 'Main Street'];
  ok('T16: Play shows ten cards in three groups — Flagships · Train · Play — and no retired card',
    t.names.length === 10 && JSON.stringify(t.groups) === '["flagship","train","play"]' && want.every((n) => t.names.includes(n))
    && !t.names.some((n) => /Stall Rush|Needs vs Wants|Scam Spotter|Budget Blitz|Times Twelve|The Snowball/.test(n)) && t.wide, JSON.stringify(t));
  await p.goto(URL0 + '?demo#/play/sr'); await p.waitForTimeout(500);
  ok('an old link to a retired card opens the one that absorbed it (#/play/sr → Stall of My Own)', await p.evaluate(() => /Stall of My Own/.test((document.querySelector('.gintro') || document.body).textContent)));
  /* Market Storm on a phone: the way out is in reach when the storm starts, not below the fold */
  await p.evaluate(() => { const B = window.BZF; B.R.s.settings.tester = true; B.setTester(true); B.fire('closeOv'); B.fire('game', 'st'); B.fire('gbegin', 'st'); });
  await p.waitForSelector('.gplay [data-act="stRule"]');
  await p.keyboard.press('1'); await p.keyboard.press('1'); await p.keyboard.press('Enter');
  await p.waitForSelector('.gplay [data-act="stSell"]', { timeout: 8000 });
  const reach = await p.evaluate(() => { const b = document.querySelector('.gplay [data-act="stSell"]').getBoundingClientRect(), t = document.querySelector('[data-bz=tabbar]');
    return { bottom: Math.round(b.bottom), limit: Math.round(t && getComputedStyle(t).display !== 'none' ? t.getBoundingClientRect().top : innerHeight) }; });
  ok('Market Storm on a phone: SELL is on screen, above the tab bar, the moment the storm starts', reach.bottom <= reach.limit, JSON.stringify(reach));
  await p.evaluate(() => window.BZF.fire('gquit'));
  ok('Play tab: nothing threw', !errors.length, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

/* a run that throws is a failed check with a name, never a bare crash */
const safely = async (label, f) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(label)) return; try { await f(); } catch (e) { ok(`${label}: the run completed`, false, String(e.message || e).split('\n')[0]); } };
await safely('desktop', () => run('desktop', { width: 1280, height: 860 }, false, 'light'));
await safely('phone', () => run('phone', { width: 390, height: 844 }, true, 'light'));
await safely('phone-dark', () => run('phone-dark', { width: 390, height: 844 }, true, 'dark'));
await safely('demo', demo);
await safely('kit', kitChecks);
await safely('deck', deckChecks);
await safely('playtab', playTabChecks);
await safely('games', gameChecks);
await safely('sb-light', () => sbChecks('sb-light', 'light'));
await safely('sb-dark', () => sbChecks('sb-dark', 'dark'));
await safely('a6-desktop', () => a6Checks('a6-desktop', { width: 1280, height: 860 }, false));
await safely('a6-phone', () => a6Checks('a6-phone', { width: 390, height: 844 }, true));
await safely('stall-phone', () => stallChecks('phone', { width: 390, height: 844 }, true, 'light'));
await safely('stall-phone-dark', () => stallChecks('phone-dark', { width: 390, height: 844 }, true, 'dark'));
await safely('stall-desktop', () => stallChecks('desktop', { width: 1280, height: 860 }, false, 'light'));
await safely('stall-desktop-dark', () => stallChecks('desktop-dark', { width: 1280, height: 860 }, false, 'dark'));
await safely('shift-desktop', () => shiftChecks('shift-desktop', { width: 1280, height: 860 }, false, 'light'));
await safely('shift-phone', () => shiftChecks('shift-phone', { width: 390, height: 844 }, true, 'light'));
await safely('shift-phone-dark', () => shiftChecks('shift-phone-dark', { width: 390, height: 844 }, true, 'dark'));
await browser.close(); srv.close();
console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
