/* shell.js — the family chrome (FAMILY-STANDARD §3, §4, §5, §1.1, C4).

   Bee's top bar, in Bee's order, at 56px:
     [⬡ Hive] [☰] [Pip + Bizzing Finance] ……… [search] [coin chip] [theme] [🔒] [avatar ▾]
   On a phone it keeps ⬡ ☰ logo … coin · avatar; search, theme and 🔒 move into ☰.

   Five tabs — Home · Town · Learn · Money · Play — as Bee's row on a desk and a bottom
   bar on a phone. Everything else lives in the ☰ drawer, in the family's order: My
   page · Shop · Collection · Medals · (four Finance areas) · Settings · Grown-ups ·
   Help · Privacy · Back to the Hive. There is no "More" tab.

   Every control here is an SVG icon, never an emoji (§9; test/browser.mjs counts). */
import { esc } from './ui.js';
import { ico } from './art.js';
import { R } from './runtime.js';
import * as sim from './sim.js';
import { avatarSrc, avatarName } from './avatars.js';
import { balance, ledger } from './family/bizzing-wallet.js';
import { LOOKS, isOpen as lookOpen, openSay } from './looks.js';
import { ctxFor, BY_ID } from './catalogue.js';
import * as audio from './audio.js';
import { pinSet } from './pin.js';

export const HIVE = 'https://aayuvis.github.io/Bizzing_Schedule/';
export const TABS = [
  { k: 'home', n: 'Home', i: 'home' },
  { k: 'town', n: 'Town', i: 'town' },
  { k: 'learn', n: 'Learn', i: 'learn' },
  { k: 'money', n: 'Money', i: 'wallet' },
  { k: 'play', n: 'Play', i: 'arcade' },
];
/* routes that belong to a tab, so the tab stays lit inside it */
const TAB_OF = { arcade: 'play', market40: 'play', worlds: 'town', store: 'town', words: 'learn', mistakes: 'learn' };
export const tabOf = (nav) => TAB_OF[nav] || nav;

export const DRAWER = [
  { k: 'me', n: 'My page', i: 'user' },
  { k: 'shop', n: 'Shop', i: 'cart' },
  { k: 'collection', n: 'Collection', i: 'frame' },
  { k: 'medals', n: 'Medals', i: 'medal' },
  { sep: true },
  { k: 'store', n: "Mags' General Store", i: 'shop', sub: 'Spend your town money' },
  { k: 'words', n: 'Money Words', i: 'lesson', sub: 'Every word, in plain English' },
  { k: 'mistakes', n: 'Ones to try again', i: 'repeat', sub: 'The questions that tripped you, back after a gap' },
  { k: 'market40', n: 'The Market Game', i: 'chartUp', sub: 'Forty companies that do not exist' },
  { sep: true },
  { k: 'settings', n: 'Settings', i: 'gear', act: 'settings' },
  { k: 'parents', n: 'Grown-ups', i: 'lock', lock: true },
  { k: 'help', n: 'Help', i: 'help', act: 'help' },
  { k: 'privacy', n: 'Privacy', i: 'shield', act: 'privacy' },
  { k: 'hive', n: 'Back to the Hive', i: 'hive', href: HIVE },
];

export function kidBadge(k, size, frame) {
  const f = frame || (k.fam && k.fam.frame);
  return `<span class="kbadge${f ? ' fr-' + f : ''}" style="width:${size}px;height:${size}px"><img src="${avatarSrc(k.avatar)}" alt="" width="${size}" height="${size}"></span>`;
}
const coinSvg = (s = 20) => `<svg class="bzcoin" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="#F0B429" stroke="#3A2A5C" stroke-width="1.6"/><circle cx="12" cy="12" r="6.2" fill="none" stroke="#B57E10" stroke-width="1.2"/><path d="M12 8.2 13.2 10.8 16 11.2 14 13.1 14.5 15.9 12 14.6 9.5 15.9 10 13.1 8 11.2 10.8 10.8z" fill="#FFF3C4"/></svg>`;
export { coinSvg };

export function topbar(c) {
  const playing = !!R.game;
  const coins = balance(c.name);
  return `<header class="topbar">
    <div class="topbar-in">
      ${playing ? '' : `<a class="iconbtn hive" href="${HIVE}" aria-label="Back to the Bizzing Hive" title="Back to the Bizzing Hive">${ico('hive', '', 22)}</a>`}
      <button class="iconbtn" data-act="drawer" aria-label="Menu" aria-haspopup="dialog">${ico('menu', '', 22)}</button>
      <button class="brand" data-act="nav" data-arg="home" aria-label="Bizzing Finance — home"><img class="brand-head" src="./mascot/pip-head.webp" alt="" width="28" height="28"><span class="wm"><b class="bz">Bizzing</b> <b class="app">Finance</b></span></button>
      ${R.fromHive ? `<a class="chip hiveback" href="${HIVE}">${ico('back', '', 16)} back to my day</a>` : ''}
      <span class="tb-gap"></span>
      <button class="searchpill desk" data-act="search" aria-label="Search the town">${ico('search', '', 18)}<span>Search lessons, words, games…</span></button>
      <button class="coinchip" data-act="walletSheet" aria-label="${coins} Bizzing coins — your coin history">${coinSvg(20)}<b class="tabnum">${coins}</b></button>
      ${R.s.settings.tester ? '<button class="chip tester desk" data-act="nav" data-arg="parents" title="Tester mode is on — everything is open">TESTER</button>' : ''}
      <button class="iconbtn desk" data-act="mode" data-long="settings:look" aria-label="${R.dark ? 'Switch to light' : 'Switch to dark'} (hold for worlds)">${ico(R.dark ? 'sun' : 'moon', '', 21)}</button>
      <button class="iconbtn desk" data-act="nav" data-arg="parents" aria-label="Grown-ups (PIN)">${ico('lock', '', 21)}</button>
      <button class="kidbtn" data-act="kids" aria-label="${esc(c.name)} — switch child" aria-haspopup="dialog">${kidBadge(c, 34)}<svg class="caret" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
    </div>
    <nav class="tabs" aria-label="Main">
      ${TABS.map((t) => `<button class="tab" role="tab" data-act="nav" data-arg="${t.k}" aria-selected="${tabOf(R.s.ui.nav) === t.k}" aria-current="${tabOf(R.s.ui.nav) === t.k ? 'page' : 'false'}">${ico(t.i, '', 24)}<span>${t.n}</span></button>`).join('')}
    </nav>
  </header>`;
}
export function tabbar() {
  return `<nav class="tabbar" aria-label="Main">
    ${TABS.map((t) => `<button role="tab" data-act="nav" data-arg="${t.k}" aria-selected="${tabOf(R.s.ui.nav) === t.k}" aria-current="${tabOf(R.s.ui.nav) === t.k ? 'page' : 'false'}"><span class="gl">${ico(t.i, '', 24)}</span><span>${t.n}</span></button>`).join('')}
  </nav>`;
}

/* ── ☰ ─────────────────────────────────────────────────────────────────── */
export function drawer(c) {
  const st = audio.state();
  const muted = !R.s.settings.sound && !st.music;
  return `<div class="drawer-scrim" data-act="closeOv"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Menu" data-act="noop">
    <div class="dr-head">
      <span class="row" style="gap:10px">${kidBadge(c, 40)}<span><b>${esc(c.name)}</b><span class="small muted" style="display:block">${esc(avatarName(c.avatar))}</span></span></span>
      <button class="iconbtn" data-act="closeOv" aria-label="Close the menu">${ico('close', '', 20)}</button>
    </div>
    <div class="dr-quick">
      <button class="qk" data-act="search">${ico('search', '', 20)}<span>Search</span></button>
      <button class="qk" data-act="mode">${ico(R.dark ? 'sun' : 'moon', '', 20)}<span>${R.dark ? 'Light' : 'Dark'}</span></button>
      <button class="qk" data-act="muteAll" aria-pressed="${muted}">${ico(muted ? 'soundOff' : 'sound', '', 20)}<span>${muted ? 'Sound off' : 'Mute'}</span></button>
    </div>
    <nav class="dr-list" aria-label="Everything else">
      ${DRAWER.map((d) => d.sep ? '<hr>' : d.href
        ? `<a class="dr-item" href="${d.href}">${ico(d.i, '', 22)}<span class="grow">${d.n}</span></a>`
        : `<button class="dr-item" data-act="${d.act || 'nav'}" data-arg="${d.act ? '' : d.k}">${ico(d.i, '', 22)}<span class="grow">${d.n}${d.sub ? `<span class="small muted">${d.sub}</span>` : ''}</span>${d.lock ? ico('lock', '', 16) : ''}</button>`).join('')}
    </nav>
  </aside></div>`;
}

/* ── the coin chip's sheet: balance, the last 30 lines in words, what coins are for ── */
const APPNAME = { bee: 'Bee', maths: 'Maths', geography: 'Geography', india: 'India', finance: 'Finance' };
const WHY = { answer: 'a right answer', stop: 'a lesson finished', contest: 'a test passed', mastery: 'a chapter mastered', migrated: 'coins brought over' };
export function walletLine(x) {
  let what;
  if (x.why in WHY) what = WHY[x.why];
  else if (/^avatar:/.test(x.why)) what = 'bought ' + avatarName(x.why.slice(7));
  else if (/^world:/.test(x.why)) what = 'opened world ' + x.why.slice(6) + (LOOKS[+x.why.slice(6) - 1] ? ' · ' + LOOKS[+x.why.slice(6) - 1].name : '');
  else if (/^extra:/.test(x.why)) what = 'bought ' + x.why.slice(6).replace(/-/g, ' ');
  else if (/^refund:/.test(x.why)) what = 'refund';
  else what = x.why;
  return `${x.n > 0 ? '+' : '−'}${Math.abs(x.n)} · ${what} · ${APPNAME[x.a] || x.a}`;
}
export function walletSheet(c) {
  const led = ledger(c.name).slice(-30).reverse();
  return `<div class="sheet-h"><span class="eyebrow">Bizzing coins</span><button class="iconbtn" data-act="closeOv" aria-label="Close">${ico('close', '', 20)}</button></div>
    <div class="row" style="gap:12px;margin:6px 0 12px">${coinSvg(40)}<span><b class="big tabnum" style="font-family:var(--mono)">${balance(c.name)}</b><span class="small muted" style="display:block">coins, shared by every Bizzing app</span></span></div>
    <p class="small">Coins come from learning, in any Bizzing app: a right answer, a lesson finished, a test passed, a chapter mastered. They buy faces, worlds and extras in the Shop — never lessons, and never anything in the town. Your town money is separate: it is the money you are learning to run.</p>
    <div class="sect"><b>The last ${led.length || 'few'} lines</b><i></i></div>
    ${led.length ? `<ol class="ledger">${led.map((x) => `<li class="${x.n > 0 ? 'in' : 'out'}"><span class="when small muted">${new Date(x.t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span><span>${esc(walletLine(x))}</span></li>`).join('')}</ol>`
      : `<div class="empty">${pipPose('sleep', 72)}<p class="small">Nothing yet. Your first right answer puts the first coin here.</p></div>`}
    <button class="btn ghost wide" style="margin-top:12px" data-act="nav" data-arg="shop">${ico('cart', '', 18)} Open the Shop</button>`;
}

export function pipPose(pose, size = 96, alt = '') {
  return `<img class="pip pip-${pose}" src="./mascot/pip-${pose}.webp" alt="${esc(alt)}" width="${size}" height="${size}">`;
}

/* ── the child switcher: every child, one tap, and a grown-ups-only + ── */
export function kidsSheet() {
  return `<div class="sheet-h"><span class="eyebrow">Who is playing?</span><button class="iconbtn" data-act="closeOv" aria-label="Close">${ico('close', '', 20)}</button></div>
    <div class="kids">${R.s.kids.map((k, i) => `<button class="kidcard${i === R.s.active ? ' on' : ''}" data-act="switchKid" data-arg="${i}" ${i === R.s.active ? 'aria-current="true"' : ''}>
      ${kidBadge(k, 64)}<b>${esc(k.name)}</b><span class="small muted">${i === R.s.active ? 'Playing now' : 'Tap to switch'}</span></button>`).join('')}
      <button class="kidcard add" data-act="addKidGate">${ico('plus', '', 30)}<b>Add a child</b><span class="small muted">${ico('lock', '', 13)} Grown-ups</span></button>
    </div>`;
}

/* ── Settings: one layout everywhere (§5) ─────────────────────────────── */
const sw = (act, on, label) => `<button class="sw" role="switch" aria-checked="${!!on}" data-act="${act}" aria-label="${esc(label)}"><i></i></button>`;
const seg = (act, opts, cur, label) => `<span class="seg" role="group" aria-label="${esc(label)}">${opts.map(([v, l]) => `<button data-act="${act}" data-arg="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</span>`;
const row = (t, sub, ctl) => `<div class="srow"><span class="grow" style="min-width:0"><b>${t}</b>${sub ? `<span class="small muted">${sub}</span>` : ''}</span>${ctl}</div>`;
export function settingsSheet(c, focus) {
  const st = audio.state(), ctx = ctxFor(R.s, c);
  const look = c.fam && c.fam.look || 'market';
  return `<div class="sheet-h">
      <button class="btn ghost sm" data-act="closeOv">${ico('back', '', 16)} Back</button>
      <h2 class="sh-title">${ico('gear', '', 22)} Settings</h2>
      <button class="iconbtn" data-act="closeOv" aria-label="Close settings">${ico('close', '', 20)}</button></div>
    <section class="scard" aria-labelledby="st-me"><h3 id="st-me">Me</h3>
      ${row('Name', 'The same name in every Bizzing app, so your coins follow you.', `<span class="pill">${esc(c.name)}</span>`)}
      ${row('Avatar', esc(avatarName(c.avatar)), `<button class="btn ghost sm" data-act="nav" data-arg="collection">${kidBadge(c, 28)} Choose</button>`)}
      ${R.s.kids.length > 1 ? row('Switch child', `${R.s.kids.length} children on this device`, '<button class="btn ghost sm" data-act="kids">Switch</button>') : ''}
    </section>
    <section class="scard" aria-labelledby="st-snd"><h3 id="st-snd">Sound &amp; music</h3>
      ${row('Sound effects', 'Right, wrong, coins and the bell.', sw('sound', R.s.settings.sound, 'Sound effects'))}
      ${row('Music', 'A loop for each world, Home and the games. Quiet in lessons.', sw('musicOn', st.music, 'Music'))}
      ${row('Volume', '', `<input class="slider" type="range" min="0" max="100" step="5" value="${Math.round(st.volume * 100)}" data-field="vol" data-live="1" aria-label="Volume">`)}
      ${row('Read aloud', 'The lessons, and the speaker buttons.', sw('readAloud', R.readAloud !== false, 'Read aloud'))}
      ${row('Reading speed', '', seg('rate', [['slow', 'Slower'], ['normal', 'Normal']], R.rate === 'slow' ? 'slow' : 'normal', 'Reading speed'))}
    </section>
    <section class="scard" aria-labelledby="st-look" id="st-look-sec"><h3 id="st-look">Look</h3>
      <div class="worlds">${LOOKS.map((w) => { const open = lookOpen(w, ctx); return `<button class="wthumb${look === w.id ? ' on' : ''}${open ? '' : ' locked'}" data-act="${open ? 'look' : 'nav'}" data-arg="${open ? w.id : 'shop'}" aria-pressed="${look === w.id}">
        <img src="${R.dark ? w.thumbNight : w.thumbDay}" alt="" width="180" height="77" loading="lazy"><b>${esc(w.name)}</b><span class="small muted">${open ? (look === w.id ? 'Wearing it' : esc(w.line)) : esc(openSay(w, ctx))}</span></button>`; }).join('')}</div>
      ${row('Light or dark', '', seg('mode', [['light', 'Light'], ['dark', 'Dark'], ['system', 'Match device']], R.mode || 'system', 'Light or dark'))}
      ${row('Text size', '', seg('text', [['s', 'S'], ['normal', 'M'], ['large', 'L']], R.text === 'large' ? 'large' : R.text === 's' ? 's' : 'normal', 'Text size'))}
    </section>
    <section class="scard" aria-labelledby="st-cf"><h3 id="st-cf">Comfort</h3>
      ${row('Reduce motion', 'No confetti, no bobbing, the town stands still.', sw('motionSw', R.motion === 'reduced', 'Reduce motion'))}
      ${row('Calm mode', 'Music off, softer sounds, no confetti.', sw('calm', !!R.calm, 'Calm mode'))}
    </section>
    <section class="scard" aria-labelledby="st-gu"><h3 id="st-gu">Grown-ups ${ico('lock', '', 16)}</h3>
      ${row('Grown-ups’ area', pinSet(R.s.parent) ? 'Behind the PIN: age band, pay day, currency, the plan, backup and tester mode.' : 'Set a PIN to keep the money settings and tester tools away from an idle thumb.', `<button class="btn ghost sm" data-act="nav" data-arg="parents">${ico('lock', '', 15)} Open</button>`)}
    </section>
    <footer class="sfoot"><button class="small" data-act="privacy">Privacy</button> · <button class="small" data-act="about">About</button> · <span class="small muted">Bizzing Finance · build ${R.version || ''}</span>${R.install ? ` · <button class="small" data-act="install">Install</button>` : ''}</footer>`;
}

/* ── privacy: what is kept, where, and what never leaves ───────────────── */
export function privacySheet() {
  return `<div class="sheet-h"><span class="eyebrow">Privacy</span><button class="iconbtn" data-act="closeOv" aria-label="Close">${ico('close', '', 20)}</button></div>
    <h2 style="margin:2px 0 10px">What Bizzing Finance keeps</h2>
    <ul class="plist">
      <li><b>On this device only:</b> each child's first name, age band and avatar, and the town — the money, the lessons, the medals. Nothing else about a child is ever asked for.</li>
      <li><b>Shared with the other Bizzing apps on this device:</b> the Bizzing coins wallet and the minutes-and-milestones feed the Hive reads (<code>bizzing.wallet</code>, <code>bizzing.activity</code>). They stay in this browser.</li>
      <li><b>Recordings</b> of a grown-up answering the week's question stay in this browser's own storage and are never in a backup or a sync.</li>
      <li><b>Nothing is sent anywhere.</b> No accounts, no analytics, no adverts, no third-party scripts or fonts. The browser check fails the build on any request to another site.</li>
      <li><b>No real money</b>, ever, and no path from a child's screen to a payment form.</li>
      <li>The grown-ups' PIN is stored as a scrambled hash and asked again after every reload. It is a deterrent, not a lock.</li>
    </ul>
    <p class="small muted" style="margin-top:10px">A grown-up can save, restore or erase everything from the grown-ups' area.</p>`;
}
export function helpSheet() {
  return `<div class="sheet-h"><span class="eyebrow">Help</span><button class="iconbtn" data-act="closeOv" aria-label="Close">${ico('close', '', 20)}</button></div>
    <div class="row" style="gap:12px;align-items:center">${pipPose('point', 84)}<h2 style="margin:0">How Bizzington works</h2></div>
    <ul class="plist">
      <li><b>Continue</b> on Home is always the next thing — a lesson, or a question you met a while ago.</li>
      <li><b>Town</b> is the map of the town: travel between places, the street's buildings, and the repairs.</li>
      <li><b>Learn</b> is the Money Atlas. <b>Money</b> is your wallet, jars, bank and the Exchange. <b>Play</b> has the games.</li>
      <li><b>Town money</b> is the money you are learning to run. <b>Bizzing coins</b> come from learning in any Bizzing app and buy faces and worlds in the Shop.</li>
      <li>Nothing is random. Nothing is lost for a day off.</li>
    </ul>
    <button class="btn ghost wide" style="margin-top:12px" data-act="bug">Something not right? Note it</button>`;
}

/* ── search: every lesson, stop, word, game and place (C4) ────────────── */
export function searchSheet(q, results) {
  return `<div class="sheet-h"><span class="eyebrow">Search the town</span><button class="iconbtn" data-act="closeOv" aria-label="Close">${ico('close', '', 20)}</button></div>
    <label class="searchbox">${ico('search', '', 20)}<input id="srch" data-field="sq" data-live="1" value="${esc(q || '')}" placeholder="A lesson, a word, a game, a place…" autocomplete="off" aria-label="Search"></label>
    <div class="sresults" role="list">
      ${q && !results.length ? `<div class="empty">${pipPose('think', 72)}<p class="small">Nothing called “${esc(q)}” yet. Try a shorter word.</p></div>` : ''}
      ${results.map((r) => `<button class="sres" role="listitem" data-act="${r.act}" data-arg="${esc(r.arg)}"><span class="iw">${ico(r.icon, '', 20)}</span><span class="grow"><b>${esc(r.title)}</b><span class="small muted">${esc(r.kind)} · ${esc(r.sub)}</span></span></button>`).join('')}
    </div>`;
}
