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
  await page.click('[data-act="obAvatar"][data-arg="mango"]');
  await page.click('[data-act="obNext"]');
  const bands = page.locator('[data-act="obBand"]'); await bands.last().click();
  await page.waitForSelector('.continue');
  ok(`${label}: setup is a name, a face and a band — and the face is in the top bar`, await page.locator('.kidbtn img[src*="mango"]').count() === 1);
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
  await page.goto(URL0 + '#/home'); await page.waitForSelector('.continue');
  await page.click('[data-act="sessionStart"]'); await page.waitForTimeout(400);
  ok(`${label}: starting today's session shows where you are in it`, /Today's session · \d of \d/.test(await page.textContent('.sessbar').catch(() => '')));
  await page.evaluate(() => { const o = document.querySelector('.ov [data-act="closeOv"]'); if (o) o.click(); });
  await page.click('[data-act="sessionStop"]').catch(() => {}); await page.waitForTimeout(200);

  /* A8 · a new child reaches a right answer and a celebration inside two minutes */
  {
    const t0 = Date.now();
    await page.goto(URL0 + '#/home'); await page.waitForSelector('.continue');
    await page.click('.continue .cgo'); await page.waitForTimeout(300);
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
  await page.goto(URL0 + '#/home'); await page.waitForSelector('.town svg');
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
    const b = document.querySelector('.continue .cgo').getBoundingClientRect();
    let hits = 0;
    for (let k = 0; k < 14; k++) {
      await new Promise((r) => setTimeout(r, 250));
      document.querySelectorAll('.conf i').forEach((i) => { const r = i.getBoundingClientRect(); const o = +getComputedStyle(i).opacity; if (o > 0.05 && r.bottom > b.top && r.top < b.bottom && r.right > b.left && r.left < b.right) hits++; });
    }
    return hits;
  });
  ok(`${label}: confetti never lands on the Continue button`, conf === 0, conf + ' overlaps');

  await familyChecks(page, label, vp, isMobile, scheme, errors, shot);

  ok(`${label}: no errors and no third-party requests`, errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ══ FAMILY-STANDARD §22 — the checks every Bizzing app keeps ══════════════
   Each was watched failing first (see the commit that added it). */
const EMOJI = /\p{Extended_Pictographic}/u;
async function familyChecks(page, label, vp, isMobile, scheme, errors, shot) {
  const go = async (h) => { await page.evaluate((x) => { location.hash = x; }, h); await page.waitForTimeout(500); };
  await page.goto(URL0 + '#/home'); await page.waitForSelector('.continue');

  /* C5 · every main screen has one heading and a way back (the tabs, or ☰) */
  const dead = [];
  for (const r of ['#/town', '#/learn', '#/money', '#/play', '#/shop', '#/collection', '#/medals', '#/me', '#/mistakes', '#/words', '#/store', '#/market40']) {
    await go(r);
    const v = await page.evaluate(() => ({ h1: document.querySelectorAll('main h1').length, back: !!document.querySelector('[data-act="drawer"]') && [...document.querySelectorAll('[role=tab][data-arg="home"]')].some((t) => t.offsetParent) }));
    if (v.h1 !== 1 || !v.back) dead.push(r + ' ' + JSON.stringify(v));
  }
  ok(`${label}: every screen has one heading and a way back`, !dead.length, dead.slice(0, 3).join(' | '));
  await go('#/home');
  /* C3 · the avatar ▾ lists every child, with a grown-ups-only + */
  await page.evaluate(() => window.BZF.fire('kids')); await page.waitForTimeout(150);
  const kids = await page.evaluate(() => ({ n: document.querySelectorAll('.kidcard:not(.add)').length, add: !!document.querySelector('.kidcard.add') && /Grown-ups/.test(document.querySelector('.kidcard.add').textContent) }));
  ok(`${label}: the switcher lists every child and a PIN-guarded “Add a child”`, kids.n === 1 && kids.add, JSON.stringify(kids));
  await page.evaluate(() => window.BZF.fire('closeOv'));

  /* §4 tabs: five, Home first, the map second, no More */
  const tabs = await page.evaluate((m) => [...document.querySelectorAll(m ? '.tabbar [role=tab]' : '.tabs [role=tab]')].filter((t) => t.offsetParent).map((t) => t.textContent.trim()), isMobile);
  ok(`${label}: five tabs — Home · Town · Learn · Money · Play — and no More`, tabs.join(',') === 'Home,Town,Learn,Money,Play', tabs.join(','));
  /* §3 the top bar, in the family's order, 56px */
  const bar = await page.evaluate(() => { const b = document.querySelector('.topbar-in'); const r = b.getBoundingClientRect(); return { h: Math.round(r.height), order: [...b.children].filter((x) => x.offsetParent).map((x) => x.className.split(' ')[0] + (x.dataset.act ? ':' + x.dataset.act : '')) }; });
  const want = isMobile ? ['iconbtn', 'iconbtn:drawer', 'brand:nav', 'tb-gap', 'coinchip:walletSheet', 'kidbtn:kids'] : ['iconbtn', 'iconbtn:drawer', 'brand:nav', 'tb-gap', 'searchpill:search', 'coinchip:walletSheet', 'iconbtn:mode', 'iconbtn:nav', 'kidbtn:kids'];
  ok(`${label}: the top bar is the family's, in its order, 56px`, JSON.stringify(bar.order.filter((x) => !/chip/.test(x) || /coinchip/.test(x))) === JSON.stringify(want) && bar.h >= 54 && bar.h <= 60, JSON.stringify(bar));
  /* §3 ☰ opens and closes by keyboard, and hands focus back */
  await page.focus('[data-act="drawer"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(250);
  const opened = await page.evaluate(() => { const d = document.querySelector('.drawer'); return d ? { n: [...d.querySelectorAll('.dr-item')].map((x) => x.textContent.trim().split('\n')[0].trim()), focus: d.contains(document.activeElement) } : null; });
  ok(`${label}: ☰ opens by keyboard with focus inside`, opened && opened.focus, JSON.stringify(opened && opened.focus));
  ok(`${label}: ☰ lists the family's order`, opened && /^My page,Shop,Collection,Medals,/.test(opened.n.join(',')) && /Settings,Grown-ups,Help,Privacy,Back to the Hive$/.test(opened.n.join(',')), opened && opened.n.join(','));
  await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
  ok(`${label}: focus stays inside the open ☰`, await page.evaluate(() => !!document.querySelector('.drawer') && document.querySelector('.drawer').contains(document.activeElement)));
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  ok(`${label}: Esc closes ☰ and returns focus to it`, await page.evaluate(() => !document.querySelector('.drawer') && document.activeElement && document.activeElement.dataset.act === 'drawer'));
  /* §5 Settings: Me · Sound & music · Look · Comfort · Grown-ups */
  await page.evaluate(() => window.BZF.fire('settings')); await page.waitForTimeout(250);
  const secs = await page.evaluate(() => [...document.querySelectorAll('.ovbox .scard h3')].map((h) => h.textContent.trim()));
  ok(`${label}: Settings sections in the family order`, secs.join('|') === 'Me|Sound & music|Look|Comfort|Grown-ups', secs.join('|'));
  ok(`${label}: Settings has effects, music and one volume slider`, await page.evaluate(() => !!document.querySelector('[data-act="sound"][role=switch]') && !!document.querySelector('[data-act="musicOn"][role=switch]') && document.querySelectorAll('input[type=range][data-field="vol"]').length === 1));
  await shot('5-settings');
  await page.evaluate(() => window.BZF.fire('closeOv'));
  /* §11 mute in one tap from ☰ */
  await page.evaluate(() => window.BZF.fire('drawer')); await page.waitForTimeout(150);
  await page.click('.drawer [data-act="muteAll"]'); await page.waitForTimeout(150);
  const muted = await page.evaluate(() => ({ sfx: window.BZF.R.s.settings.sound, music: window.BZF.audio.state().music }));
  ok(`${label}: one tap in ☰ mutes effects and music`, muted.sfx === false && muted.music === false, JSON.stringify(muted));
  await page.evaluate(() => window.BZF.fire('muteAll')); await page.evaluate(() => window.BZF.fire('closeOv'));

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
  for (const [what, act, arg] of [['a lesson', 'card', 'c1b'], ['Settings', 'settings', ''], ['the ☰ drawer', 'drawer', ''], ['the coin sheet', 'walletSheet', ''], ['the child switcher', 'kids', '']]) {
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
  const small = await page.evaluate(() => [...document.querySelectorAll('.topbar button, .topbar a, .tabbar button, .tabs button, .continue button, .t3card button, .wchip')].filter((b) => b.offsetParent).filter((b) => { const r = b.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).map((b) => (b.getAttribute('aria-label') || b.textContent).trim().slice(0, 16) + ' ' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height)));
  ok(`${label}: every chrome and Home target is at least 44px`, !small.length, small.slice(0, 4).join(' | '));

  /* §8 the 96, through the engine */
  ok(`${label}: validate(avatars) returns []`, (await page.evaluate(() => window.BZF.validateAvatars())).length === 0);
  await go('#/collection');
  const coll = await page.evaluate(() => ({ cards: document.querySelectorAll('.pack .bz-av').length, packs: document.querySelectorAll('.pack').length, says: [...document.querySelectorAll('.pack .bz-av .avsay')].every((x) => x.textContent.trim().length > 3) }));
  ok(`${label}: the Collection shows all 96 by pack, each with its path`, coll.cards === 96 && coll.packs === 12 && coll.says, JSON.stringify(coll));

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
  await page.evaluate(() => { window.BZF.R.s.settings.plan = 'family'; });
  const worldRes = [];
  for (const w of await page.evaluate(() => window.BZF.looks.map((x) => x.id))) {
    await page.evaluate((id) => window.BZF.fire('look', id), w); await page.waitForTimeout(250);
    await go('#/home'); await page.waitForTimeout(250);
    const st = await page.evaluate(() => ({ ...window.BZF.ambient.state(), plate: (document.querySelector('.fz-plate') || {}).style && document.querySelector('.fz-plate').style.backgroundImage }));
    const night = /-night\.webp/.test(st.plate || ''), dark = scheme === 'dark';
    const cr = await page.evaluate(CONTRAST);
    worldRes.push({ w, layers: st.layers, world: st.world, plateOk: dark ? night : !night, aa: cr.length });
    if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/${label}-world-${w}.png` });
  }
  ok(`${label}: six worlds, each with three layers of life`, worldRes.length === 6 && worldRes.every((x) => x.layers >= 3), JSON.stringify(worldRes.map((x) => x.w + ':' + x.layers)));
  ok(`${label}: every world wears its ${scheme === 'dark' ? 'night' : 'day'} painting`, worldRes.every((x) => x.plateOk), JSON.stringify(worldRes.filter((x) => !x.plateOk)));
  ok(`${label}: text meets AA in every world (${scheme})`, worldRes.every((x) => x.aa === 0), JSON.stringify(worldRes.filter((x) => x.aa)));
  await page.evaluate(() => window.BZF.fire('look', 'market'));
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
  /* B10 · reload mid-journey: Continue points at the exact stop */
  await go('#/home');
  const before = (await page.textContent('.continue h2')).trim();
  await page.click('.continue .cgo'); await page.waitForTimeout(250);
  await page.goto(URL0 + '#/home'); await page.waitForSelector('.continue');
  const after = (await page.textContent('.continue h2')).trim();
  ok(`${label}: a lesson opened and left, then a reload — Continue points at the same stop`, before === after, `${before} / ${after}`);
  /* Q1 · the PIN is asked again after a reload */
  await go('#/parents');
  ok(`${label}: the grown-ups area asks for the PIN again after a reload`, await page.locator('[data-field="pin"]').count() === 1);
  await go('#/home');
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
