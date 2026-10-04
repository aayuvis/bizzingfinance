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
    await go('#/home');
    worldRes.push({ w, layers: st.layers, world: st.world, plateOk: dark ? night : !night, aa: cr.length + fcr.length, feed: fcr.slice(0, 2) });
    if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/${label}-world-${w}.png` });
  }
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
    const KEY = { cr: 'ArrowLeft', nw: 'ArrowLeft', ss: 'ArrowLeft', bb: '1', cc: ' ', sr: '1', st: ' ', mc: 'ArrowDown', mn: 'Enter', tt: '1', sn: '1' };
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
    ['#/play/nw', 'intro', /Needs vs Wants/], ['#/words/Interest', 'h1', /Money Words/]];
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
    if (k.drill.kind === 'num') { document.getElementById('numAns').value = String(k.drill.value); B.fire('answerNum'); } else B.fire('answer', B.key(first, 0));
    const right = !!document.querySelector('.fb.yes');
    document.querySelector('[data-act="practise"]').click(); await new Promise((r) => setTimeout(r, 50));
    const second = c.learn.openCard;
    B.fire('practiceDone');
    return { btn: true, practice: /Practice/.test(eyebrow), right, fresh: first !== second && /~/.test(first) && /~/.test(second), untouched: JSON.stringify(c.mastery.rec) === rec, done: !!c.learn.done[id] };
  });
  ok('a lesson stop offers practice asked fresh: a new question each time, recorded nowhere but XP', prac.btn && prac.practice && prac.right && prac.fresh && prac.untouched && prac.done, JSON.stringify(prac));
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
  /* the Library (audit v4, H1/H2): tools with pictures; a dragged loan length shows the Bank's own price */
  await page.evaluate(() => { window.BZF.fire('closeOv'); location.hash = '#/library'; }); await page.waitForTimeout(400);
  const lib0 = await page.evaluate(() => ({ tools: document.querySelectorAll('.ltool').length, pics: document.querySelectorAll('.ltool .ltool-art, .ltool img').length }));
  await page.focus('[data-lib="loanW"]'); for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  const lib = await page.evaluate(() => { const { R, sim } = window.BZF, c = R.s.kids[0], o = sim.loanOffer(c, R.lib.loanU, R.lib.loanW);
    return { weeks: R.lib.loanW, shown: document.getElementById('lo-total').textContent, want: o.total, wantText: document.getElementById('lo-total').textContent.replace(/[^0-9]/g, '') === String(o.total) }; });
  ok('the Library: tools with pictures, and a dragged loan length shows the Bank\'s own price', lib0.tools >= 6 && lib0.pics >= 5 && lib.weeks === 12 && lib.wantText, JSON.stringify({ ...lib0, ...lib }));
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

/* a run that throws is a failed check with a name, never a bare crash */
const safely = async (label, f) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(label)) return; try { await f(); } catch (e) { ok(`${label}: the run completed`, false, String(e.message || e).split('\n')[0]); } };
await safely('desktop', () => run('desktop', { width: 1280, height: 860 }, false, 'light'));
await safely('phone', () => run('phone', { width: 390, height: 844 }, true, 'light'));
await safely('phone-dark', () => run('phone-dark', { width: 390, height: 844 }, true, 'dark'));
await safely('demo', demo);
await browser.close(); srv.close();
console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
