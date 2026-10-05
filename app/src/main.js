/* main.js — boot, shell, routing, and every action in one table.
   state -> render() -> string -> innerHTML; clicks dispatch by [data-act]. */

import { esc, on, bindRoot, fire, toast, sfx, confetti, setSound, say as speak, setSayRate, canSay, nWord } from './ui.js';
import { money, price, setCurrency, CURRENCIES, weekday } from './fmt.js';
import { say, CAST, ico, mark, face } from './art.js';
import { mountLesson } from './lessonplayer.js';
import * as co from './companion.js';
import { companionFigure, shelterView, wardrobeView } from './companionview.js';
import { receiptSlip } from './keepsakes.js';
import * as daily from './daily.js';
import * as quiz from './quiz.js';
import * as srcs from './sources.js';
import * as puz from './dailypuzzle.js';
import * as placement from './placement.js';
import * as answers from './answers.js';
import * as backup from './backup.js';
import { setRate } from './lessonplayer.js';
import { PLACES } from './town.js';
import { ALL_CARDS, LETTERS, SHOP, ASSETS, CHAPTERS, BADGES, STOCK, HOMES, WORLDS, QUESTS, FIXES,
  rankFor, rankObj, shuffledDrill, drillCount, chapterDone, gameOpen, isOpen as chapterOpen, needFor, setTester, GLOSSARY, LORE, chapterLocked as chapterLockedFor } from './content.js';
import * as sim from './sim.js';
import { Store } from './store.js';
import { hashPin, checkPin, pinSet } from './pin.js';
import * as ledger from './ledger.js';
import * as mastery from './mastery.js';
import * as decisions from './decisions.js';
import * as reportmod from './report.js';
import * as reportcard from './reportcard.js';
import { hasJobGame } from './jobtable.js';   /* the games themselves load when a shift starts */
/* the Market Game and its register (forty companies, their years) load when it is opened,
   not on the first screen — the same way the stories do */
let MG = null, MG_COMPANIES = [], MG_EVENTS = [], mgLoading = null;
const mgReady = () => mgLoading || (mgLoading = Promise.all([import('./marketgame.js'), import('../content/companies.js'), import('../content/events.js')])
  .then(([m, co, ev]) => { MG = m; MG_COMPANIES = co.COMPANIES; MG_EVENTS = ev.ALL; render(); return m; }));
const mgView = () => MG ? MG.viewMarketGame() : (mgReady(), '<h1>The Market Game</h1><div class="card"><p class="small muted">Opening the Market Game…</p></div>');
const mg = (fn) => (...a) => { if (MG) fn(...a); else mgReady(); };
import { validate } from './objectives.js';
import { OBJECTIVES, NEW_CARD_LIST, objective, assessCard, teachCard } from './objectives.js';
import { cardById as resolveCard, isLesson, practiceCard, practiceTeach, genReady, whenGenReady } from './cards.js';
import { teachFor, egFor } from './sprout.js';
import { R } from './runtime.js';
import { nextStep, nextStop, path as roadPath } from './next.js';
import { demoState } from './demo.js';
import * as SESSION from './session.js';
import * as family from './family.js';
import * as TRY from './tryit.js';
import * as drill from './drill.js';
import { AVATARS, AVATAR_IDS, guessCurrency } from './avatars.js';
import { viewOnboard, viewHome, viewLearn, viewMoney, viewStore, viewProgress,
  viewParents, viewCollection as viewMedals, viewWorlds, viewGate, viewReport, aboutSheet, VERSION, viewGlossaryPage, townParts } from './views.js';
import { GAME_ACTS, GAMES } from './gamelist.js';
/* the arcade (with Main Street and the canvas kit) loads when Play first needs it */
let ARC = null;
const arcadeMod = () => (ARC ? Promise.resolve(ARC) : import('./arcade.js').then((m) => (ARC = m)));
const viewArcade = () => ARC ? ARC.viewArcade() : (arcadeMod().then(() => render()), '<div class="card"><p class="small muted">Opening the arcade…</p></div>');
const quitGame = () => { if (ARC) ARC.quitGame(); else { if (R.game && R.game.stop) R.game.stop(); R.game = null; } };
import { verdict } from './gamefx.js';
import * as shell from './shell.js';
import { BLD } from './buildings-gen.js';
import { shell as bzShell, bindShell } from './family/bizzing-shell.js';
import { avatarSrc } from './avatars.js';
import { deckView, deckIds, cardHTML } from './avcards.js';
import { viewShop, viewCollection as viewFaces, viewMistakes, viewTown, profileCard, EXTRA_BY } from './familyviews.js';
import { LOOKS, lookById, applyLook, isOpen as lookOpen } from './looks.js';
import * as ambient from './ambient.js';
import * as audio from './audio.js';
import { CATALOGUE, BY_ID, ctxFor, stateOf, validate as validateAvatars } from './catalogue.js';
import { buy as buyAvatar, buyWorld } from './family/bizzing-avatars.js';
import { spend as spendCoins } from './family/bizzing-wallet.js';
const coinBalance = (who) => family.coinBalance(who);
import * as mistakes from './mistakes.js';
/* the place stories load when one is opened, not on the first screen */
import { viewLibrary } from './library.js';
let viewStory = null, viewSprint = null;
const sprintView = () => viewSprint ? viewSprint() : (import('./sprint.js').then((m) => { viewSprint = m.viewSprint; render(); }), '<div class="card"><p class="small muted">Setting the clock…</p></div>');
const storyView = () => viewStory ? viewStory() : (import('./stories.js').then((m) => { viewStory = m.viewStory; render(); }), '<div class="card"><p class="small muted">Opening the story…</p></div>');
import * as items from './items.js';
import * as CERT from './cert.js';
import { search as searchTown } from './search.js';
import * as FEED from './feed.js';
import { bindFeedKeys } from './family/bizzing-feed.js';

const root = document.getElementById('app');
let draft = { step: 0 };
/* The hash we wrote ourselves. `hashchange` fires ASYNCHRONOUSLY, so a flag
   set and cleared inside writeHash() is already false by the time the event
   arrives — the app then reads its own navigation as a back-button press.
   Remembering the value instead survives the gap. This was invisible while
   games could only start from the tab they lived in; the moment a job could
   be started from Home it quit itself before the first frame. */
let selfHash = null;

/* The family (FAMILY-STANDARD §3, §4, §13): the Hive is one tap away, a
   child sent here by the Hive gets a way back to their day, and #/continue
   opens the one next step directly. */
const HIVE = 'https://aayuvis.github.io/Bizzing_Schedule/';
R.fromHive = /[?&]from=hive\b/.test(location.search);
function goContinue() {
  const n = nextStep(C());
  R.s.ui.nav = n.act === 'shelf' ? 'learn' : R.s.ui.nav;
  writeHash();
  fire(n.act, n.arg || undefined);
}
const kidBadge = shell.kidBadge;

/* old names, still accepted in a link or a bookmark */
const ALIAS = { arcade: 'play', worlds: 'town', progress: 'me', atlas: 'learn' };

/* ══ routing ══════════════════════════════════════════════════════════
   The back button is not a nice-to-have on a phone; it is how people leave
   a screen. Nav lives in the hash so it works. */
/* ── deep links to one thing (owner, 3 Oct 2026: "the navigation is to that
   specific topic, not the generic tool or collection"). A route names a
   screen and, after it, the one thing on it; focusFor() turns that into the
   selectors to look for, best first, and focusNow() — run after every render —
   opens any fold around it, scrolls it to the middle and pulses it. A thing not
   on screen (a repair in another world) falls back to its section. */
function focusFor(m) {
  const [a, b, c2] = m, q = (v) => CSS.escape(decodeURIComponent(v || ''));
  if (!b) return null;
  if (a === 'play' && GAMES.some((g) => g.id === b)) {
    if (gameOpen(C(), GAMES.find((g) => g.id === b))) R.gameIntro = b;
    return [`.cover[data-arg="${q(b)}"]`];
  }
  if (a === 'medals') return [`[data-focus="badge:${q(b)}"]`];
  if (a === 'store') return [`[data-arg="${q(b)}"]`];
  if (a === 'library') return [`[data-focus="tool:${q(b)}"]`];
  if (a === 'town') {
    if (b === 'fix') return [`[data-focus="fix:${q(c2)}"]`, '[data-focus="repairs"]'];
    if (b === 'job') return [`[data-act="job"][data-arg="${q(c2)}"]`, '[data-act="job"]'];
    if (b === 'deed') return ['[data-act="deed"]', '.today'];
    if (b === 'ask') return ['[data-arg="ask"]', '.today'];
    if (b === 'today') return ['.today', '.t3'];
    return [`[data-focus="world:${q(b)}"]`];
  }
  if (a === 'money' && c2) return [`[data-arg="${q(c2)}"]`, `[data-focus="${q(b)}:${q(c2)}"]`];
  if ((a === 'learn' || a === 'atlas') && b === 'chapter') {
    const ch = CHAPTERS.find((x) => x.id === c2);
    if (ch) { const wi = WORLDS.findIndex((w) => w.chapters.includes(ch.id)); if (wi >= 0) R.shelf = 'act:' + wi; return [`.stop[data-arg="${q(ch.cards[0].id)}"]`, `#act-${wi}`]; }
  }
  if (a === 'me' && b === 'rank') return ['.pcard'];
  if (a === 'market40' && b === 'era') return [`[data-act="mgAct"][data-arg="${q(c2)}"]`];
  return null;
}
function focusNow() {
  if (!R.focus) return;
  const el = R.focus.map((sel) => { try { return document.querySelector(sel); } catch (e) { return null; } }).find(Boolean);
  R.focusTries = (R.focusTries || 0) + 1;
  if (!el) { if (R.focusTries > 3) { R.focus = null; R.focusTries = 0; } return; }
  for (let p = el; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
  /* an element that names itself (data-focus) is the thing; otherwise its row or card */
  const box = el.matches('[data-focus]') ? el : (el.closest('.qrow, .poster, .cover, .stop, .acc, .jbeat, .t3card, .pcard, .card, section') || el);
  box.classList.add('focus-pulse');
  /* a short way glides; a long way jumps (a second of scrolling past the town is not a link) */
  requestAnimationFrame(() => { const far = Math.abs(box.getBoundingClientRect().top) > innerHeight * 1.5;
    box.scrollIntoView({ block: 'center', behavior: far || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  R.focus = null; R.focusTries = 0;
}

function writeHash() {
  if (!R.s || !R.s.kids.length) return;
  const u = R.s.ui;
  /* the Learn screen is called the Atlas, and so is its address */
  /* an open lesson stop is in the address too (#/atlas/c1b), so back closes it and a link
     reopens it (audit v4, C2); questions asked again later are not stops and stay off it */
  const open = u.nav === 'learn' && C().learn.openCard, oc = open && cardById(open);
  const h = '#/' + (u.nav === 'learn' ? 'atlas' : u.nav) + (u.nav === 'money' ? '/' + u.sub : '') + (oc && isLesson(oc) ? '/' + oc.id : '')
    + (u.nav === 'story' ? '/' + (R.storyAt || 'market') : '')
    + (u.nav === 'collection' && R.colTab && R.colTab !== 'avatars' ? '/' + R.colTab : '');
  if (location.hash !== h) { selfHash = h; location.hash = h; }
}
function readHash() {
  const m = (location.hash || '').replace(/^#\/?/, '').split('/');
  if (!m[0]) return false;
  if (m[0] === 'continue') { R.continueNow = true; return false; }
  /* the ☰ drawer's Settings, Help and Privacy are sheets over the current screen */
  if (['settings', 'help', 'privacy'].includes(m[0])) { R.sheetNow = m[0]; return false; }
  /* a sheet that names its subject: a figure's "How we know" (My Feed's figure cards), a cast card */
  /* a letter, read again; a Market Game company or event, read (never bought) */
  if (m[0] === 'letter' && m[1]) { R.sheetNow = 'letterRead'; R.sheetArg = decodeURIComponent(m[1]); return false; }
  if (m[0] === 'market40' && ['company', 'event'].includes(m[1]) && m[2]) { R.sheetNow = 'mgRead'; R.sheetArg = m[1] + ':' + decodeURIComponent(m[2]); return false; }
  /* the shelter with one kind picked; the wardrobe at one thing */
  /* the word of the hour, as a 10-second check */
  if (m[0] === 'wordcheck' && m[1]) { R.sheetNow = 'wordCheck'; R.sheetArg = decodeURIComponent(m[1]); return false; }
  /* day one (A6): a whole place answered cold, and the counting game */
  if (m[0] === 'coldplace') { R.sheetNow = 'coldPlace'; R.sheetArg = m[1] || '0'; return false; }
  if (m[0] === 'pipcount') { R.sheetNow = 'placement'; R.sheetArg = ''; return false; }
  if (m[0] === 'shelter') { R.sheetNow = 'shelterAt'; R.sheetArg = m[1] || ''; return false; }
  if (m[0] === 'wardrobe') { R.sheetNow = 'wardrobeAt'; R.sheetArg = m[1] || ''; return false; }
  if (['sources', 'cast'].includes(m[0])) { R.sheetNow = m[0] === 'cast' ? 'castCard' : 'sources'; R.sheetArg = decodeURIComponent(m[1] || ''); return false; }
  /* a place's story (stories.js): #/story/<world> */
  if (m[0] === 'story') { R.s.ui.nav = 'story'; R.storyAt = decodeURIComponent(m[1] || 'market'); R.focus = null; return true; }
  const known = ['home', 'town', 'learn', 'atlas', 'money', 'play', 'arcade', 'store', 'progress', 'me', 'collection', 'medals', 'shop', 'words', 'mistakes', 'parents', 'worlds', 'report', 'market40', 'feed', 'library', 'sprint'];
  if (known.indexOf(m[0]) < 0) return false;
  R.s.ui.nav = ALIAS[m[0]] || m[0];
  if (m[0] === 'money' && m[1]) R.s.ui.sub = m[1];
  /* deep links (My Feed's cards): #/atlas/<card> (or the older #/learn/<card>) opens the lesson when its chapter is open;
     #/words/<term> opens Money Words on that word */
  /* back from #/atlas/c1b to #/atlas closes the stop */
  if ((m[0] === 'learn' || m[0] === 'atlas') && !m[1] && R.s.kids.length) { const oc = cardById(C().learn.openCard); if (oc && isLesson(oc)) { C().learn.openCard = null; C().learn.drill = null; } }
  if ((m[0] === 'learn' || m[0] === 'atlas') && m[1] && R.s.kids.length) {
    const k = cardById(m[1]), ch = k && k.ch && CHAPTERS.find((x) => x.id === k.ch);
    if (k && !(ch && chapterLockedFor(C(), ch))) { C().learn.openCard = k.id; C().learn.drill = null; R.shelf = ''; }
  }
  if (m[0] === 'words') R.query = m[1] ? decodeURIComponent(m[1]) : '';
  /* the Collection's tab is in the address: #/collection, #/collection/medals, #/collection/worlds */
  if (m[0] === 'collection') R.colTab = ['medals', 'worlds'].includes(m[1]) ? m[1] : 'avatars';
  if (m[0] === 'medals') R.colTab = 'medals';
  R.focus = focusFor(m);
  return true;
}

/* ══ shell ════════════════════════════════════════════════════════════ */
/* The world the child wears (looks.js): the accent, the painted frieze with its
   ambient life, and the music. Home has its own loop, the games theirs; a lesson is
   quiet by default (M4). */
function dressWorld(c) {
  const w = lookById((c && c.fam && c.fam.look) || 'market');
  applyLook(w, !!R.dark);
  ambient.setWorld(w, !!R.dark);
  const nav = c ? R.s.ui.nav : 'home';
  const inLesson = !!(c && nav === 'learn' && c.learn.openCard);
  audio.set({ lesson: inLesson && !R.lessonMusic });
  audio.music(!c ? 'home' : (nav === 'play' || R.game) ? 'games' : nav === 'home' ? 'home' : w.music);
}

function render() {
  const s = R.s;
  if (!s || !s.kids.length || R.adding) { root.innerHTML = `<div class="content">${viewOnboard(draft)}</div>`; dressWorld(null); return; }
  const c = sim.kid(s);
  if (ALIAS[s.ui.nav]) s.ui.nav = ALIAS[s.ui.nav];
  const nav = s.ui.nav;

  const body =
    nav === 'town' ? viewTown(townParts()) :
    nav === 'learn' ? viewLearn() :
    nav === 'money' ? viewMoney() :
    nav === 'play' ? viewArcade() :
    nav === 'store' ? viewStore() :
    nav === 'me' ? `${profileCard(c)}${viewProgress()}` :
    nav === 'shop' ? viewShop() :
    nav === 'collection' ? viewFaces(R.colTab || 'avatars', () => viewMedals({ bare: true })) :
    nav === 'medals' ? viewFaces('medals', () => viewMedals({ bare: true })) :
    nav === 'words' ? viewGlossaryPage() :
    nav === 'mistakes' ? viewMistakes() :
    nav === 'parents' ? (R.gate ? viewParents() : viewGate()) :
    nav === 'report' ? (R.gate ? viewReport() : viewGate()) :
    nav === 'market40' ? mgView() :
    nav === 'story' ? storyView() :
    nav === 'library' ? viewLibrary() :
    nav === 'sprint' ? sprintView() :
    nav === 'feed' ? FEED.view(c, s) : viewHome();
  if (nav === 'feed' && R.lastNav !== 'feed') FEED.resetVisit();
  const moved = R.lastNav !== undefined && R.lastNav !== nav;   /* a new screen, not a redraw */
  R.lastNav = nav;

  dressWorld(c);
  /* The family chrome is Bee's, measured (integration/bizzing-shell.js): one top bar,
     one tab row, one phone tab bar and one ☰ drawer, identical in every Bizzing app.
     Finance brings its words, Pip, the child's face, its six tabs (My Feed last) and its routes. */
  const tabOf = shell.tabOf(nav);
  root.innerHTML = bzShell({
    app: 'finance', name: 'Finance', mascot: './mascot/sm/pip-wave.webp', coins: coinBalance(c.name), dark: !!R.dark,
    kid: { name: c.name, avatar: avatarSrc(c.avatar) }, search: 'Search lessons, words, games…', query: R.sq || '',
    inRun: !!R.game,
    tabs: [{ id: 'home', label: 'Home', icon: 'home', href: '#/home' }, { id: 'town', label: 'Town', icon: 'town', href: '#/town' },
      { id: 'learn', label: 'Atlas', icon: 'learn', href: '#/atlas' },
      { id: 'play', label: 'Play', icon: 'play', href: '#/play' },
      /* My Feed is the LAST tab (owner, 2 Oct 2026); a grown-up can switch it off behind the PIN */
      ...(FEED.on(s) ? [{ id: 'feed', label: 'My Feed', icon: 'feed', href: '#/feed' }] : [])],
    active: tabOf,
    drawer: { sub: `${rankObj(c.learn.level).name} · level ${c.learn.level}`,
      routes: { me: '#/me', shop: '#/shop', collection: '#/collection', medals: '#/medals', settings: '#/settings', grownups: '#/parents', help: '#/help', privacy: '#/privacy' },
      app: [{ icon: 'bag', label: "Mags' General Store", sub: 'spend your town money', href: '#/store' },
        { icon: 'book', label: 'The Library', sub: 'tools to try things on, and every Money Word', href: '#/library' },
        { icon: 'path', label: 'Ones to try again', sub: 'questions that tripped you, back after a gap', href: '#/mistakes' },
        { icon: 'compass', label: 'The Market Game', sub: 'forty companies that do not exist', href: '#/market40' }] },
    content: `${R.session && nav !== 'parents' ? sessionBar() : ''}
      ${R.demo ? `<div class="demobar" role="status"><b>Sample</b> — Riya's town, three weeks in. Nothing here is saved. <a href="./">Leave the sample</a></div>` : ''}
      ${sim.clockSuspect(s) ? clockWarning() : ''}${body}`,
  }) + `
    ${R.update ? '<button class="updatebar" data-act="update">A newer Bizzing Finance is ready · Reload</button>' : ''}
    ${R.overlay ? overlay() : ''}`;
  /* string rendering blows the DOM away every frame, so a game with its own
     loop re-attaches here rather than holding a stale node */
  if (R.game && R.game.mount) R.game.mount();
  /* a card is dealt once: the same card re-rendered (an answer held, a timer) stays put */
  const gc = root.querySelector('.gplay .gcard');
  if (gc) { const k = gc.textContent; if (k === R.lastCard) gc.classList.add('still'); R.lastCard = k; } else R.lastCard = null;
  /* Two things the old bar carried that the family drop-in has no slot for (and must stay
     byte-identical): a child sent here from the Hive gets the way back to their day, and
     tester mode says so on every screen, because a tester-opened town is not a child's town. */
  const brand = root.querySelector('.bz-brand');
  if (brand) brand.insertAdjacentHTML('afterend',
    (R.fromHive && !R.game ? `<a class="bz-hiveback" data-bz="hiveback" href="${shell.HIVE}">${ico('back', '', 15)}<span>back to my day</span></a>` : '') +
    (s.settings.tester ? '<button class="bz-tester" data-bz="tester" data-act="nav" data-arg="parents" title="Tester mode is on — everything is open">TESTER</button>' : ''));
  /* the avatar menu hangs from the avatar itself, wherever the bar puts it */
  const km = document.querySelector('.kidmenu'), kb = document.querySelector('.bz-kid');
  if (km && kb) { const r = kb.getBoundingClientRect(); km.style.top = Math.round(r.bottom + 8) + 'px'; km.style.right = Math.max(10, Math.round(innerWidth - r.right)) + 'px'; }
  focusNow();
  /* a new screen arrives with a short fade and rise (audit v4, N10); a redraw does not */
  if (moved) { const mc = root.querySelector('#main'); if (mc) mc.classList.add('route-in'); }
  /* a sprint keeps its answer box under the fingers between questions */
  const spa = root.querySelector('#spAns'); if (spa && document.activeElement !== spa) spa.focus({ preventScroll: true });
  /* a freshly opened dialog takes focus on its first control */
  if (R.overlay && R.focusedOv !== R.overlay) { R.focusedOv = R.overlay; const f = root.querySelector('.drawer .dr-item, .drawer button, .ovbox input, .ovbox button'); if (f && !/search/.test(R.overlay.kind)) f.focus({ preventScroll: true }); }
  if (!R.overlay) R.focusedOv = null;
  mountLesson();   /* narrated lessons re-attach the same way the games do */
  /* the walk scrolls itself to where she is standing, once, after paint */
  document.querySelectorAll('.walk-scroll[data-cur]').forEach((el) => {
    const i = +el.getAttribute('data-cur'); if (i < 0 || el.dataset.done) return;
    el.dataset.done = '1';
    const stop = el.querySelectorAll('.wstop')[i];
    if (stop) el.scrollLeft = Math.max(0, stop.offsetLeft - el.clientWidth / 2);
  });
  /* The street is wider than a phone on purpose (a street you can read beats
     one you can see all of). Open it on the middle, where the buildings are,
     not on the empty left verge — and if the child panned, put the street
     back where they left it rather than yanking it home every render. */
  const ts = root.querySelector('.town-scroll');
  if (ts && ts.scrollWidth > ts.clientWidth) {
    /* ...but never past the postbox: it opened 91px left of it on a phone (audit v4, C5) */
    let open = (ts.scrollWidth - ts.clientWidth) / 2;
    const pb = ts.querySelector('[data-act="postbox"]');
    if (pb) open = Math.min(open, Math.max(0, pb.getBoundingClientRect().left - ts.getBoundingClientRect().left + ts.scrollLeft - 12));
    ts.scrollLeft = R.townPan != null ? R.townPan : open;
    /* an edge arrow while there is more street to the right */
    const cue = () => { const t = ts.closest('.town'); if (t) t.classList.toggle('more-right', ts.scrollLeft < ts.scrollWidth - ts.clientWidth - 8); };
    ts.onscroll = () => { R.townPan = ts.scrollLeft; cue(); };
    cue();
  }
  writeHash();
  sim.save(s);
}
/* §16 · an error state is Pip's "oops", plain words and a way back — never a stack
   trace or a blank page */
const renderSafe = render;
render = function () {
  try { renderSafe(); }
  catch (e) {
    console.warn(e);
    root.innerHTML = `<main class="content"><div class="card empty" role="alert" style="max-width:520px;margin:8vh auto">
      ${shell.pipPose('oops', 120, 'Pip, oops')}<h1 style="font-size:24px">Oops — that screen tripped over</h1>
      <p>Nothing you have done is lost. Try again, or go back to Home.</p>
      <div class="row" style="gap:8px;justify-content:center"><button class="btn" data-act="retry">Try again</button><button class="btn ghost" data-act="nav" data-arg="home">Home</button></div></div></main>`;
  }
};
on('retry', () => { R.overlay = null; render(); });
R.render = render;
bindShell({
  onTheme: () => fire('mode'),
  onLock: () => fire('nav', 'parents'),
  onKid: () => fire('kids'),
  onCoins: () => fire('walletSheet'),
  onSearch: (q) => { R.sq = q; fire('search'); },
  onSound: () => fire('muteAll'),
});

function clockWarning() {
  return `<div class="card" style="border-color:var(--treasure);background:var(--treasure-tint);margin-bottom:14px">
    <div class="eyebrow" style="color:var(--treasure-deep)">The town clock</div>
    <p class="small" style="color:var(--treasure-deep)">This device's clock has gone backwards, so Bizzington is holding
      the date it last saw. Pay day cannot be replayed by winding a clock back — in the shipping build the time comes
      from the server and this cannot happen at all.</p></div>`;
}

/* ══ overlays ═════════════════════════════════════════════════════════ */
function overlay() {
  const o = R.overlay, c = sim.kid(R.s);
  /* C5 · every overlay has a visible way out, not only Escape or the backdrop */
  const box = (inner, wide) => `<div class="ov${wide === 'sheet' ? ' ov-sheet' : ''}" data-act="closeOv"><div class="ovbox${wide ? ' wide' : ''}${wide === 'sheet' ? ' sheet' : ''}" data-act="noop" role="dialog" aria-modal="true" aria-label="${esc(o.kind)}">${/sheet-h/.test(inner) ? '' : `<button class="ovx" data-act="closeOv" aria-label="Close">${ico('close', '', 18)}</button>`}${inner}</div></div>`;

  if (o.kind === 'letter') {
    const L = o.letter;
    const from = L.from === 'scam' ? null : CAST[L.from];
    /* A letter that looks like one: it slides out of its envelope onto ruled paper, stamped
       and postmarked. Every letter wears the SAME envelope, stamp and postmark — a scam looks
       exactly like the rest, which is the lesson (docs/02 §3). */
    const pm = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    return box(`
      <div class="letter${o.result ? ' answered' : ''}">
        <div class="envelope" aria-hidden="true"><i class="flap"></i></div>
        <article class="paper">
          <span class="stamp" aria-hidden="true">${BLD.postbox ? `<img src="${BLD.postbox.src}" alt="">` : ''}</span>
          <span class="postmark" aria-hidden="true">BIZZINGTON<br><b>${esc(pm)}</b></span>
          <div class="row" style="gap:11px;margin-bottom:10px">
            <span class="sender">${from ? from.svg : '<span class="sender-q">?</span>'}</span>
            <div class="grow"><div class="eyebrow">${from ? esc(from.name) : 'Sender unknown'}</div>
            <h3 style="font-size:19px">${esc(L.title)}</h3></div></div>
          <p class="lines">${esc(L.body)}</p>
          ${o.result ? '<span class="answered-stamp" aria-hidden="true">ANSWERED</span>' : ''}
        </article></div>
      ${canSay() ? `<div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="say" data-arg="letter:${L.id}">${ico('sound', '🔊', 14)} Read it to me</button></div>` : ''}
      ${o.result
        ? `<div style="margin-top:12px;background:${o.result.good ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:13px 15px;font-size:14px">${esc(o.result.note)}</div>
           <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">
             ${o.result.money ? `<span class="pill gold">${o.result.money > 0 ? '+' : '−'}${money(Math.abs(o.result.money))}</span>` : ''}
             ${o.result.xp ? `<span class="pill grow">+${o.result.xp} XP</span>` : ''}
             ${o.result.badge ? `<span class="pill gold">${BADGES[o.result.badge].em} ${esc(BADGES[o.result.badge].name)}</span>` : ''}</div>
           ${o.result.lasting ? `<p class="small" style="margin-top:9px;color:var(--muted)">${esc(o.result.lasting)}</p>` : ''}
           <button class="btn wide" style="margin-top:14px" data-act="closeOv">Back to the street</button>`
        : `<div class="stack" style="gap:8px;margin-top:14px">
            ${L.choices.map((ch, i) => `<button class="opt" data-act="letterPick" data-arg="${i}">${esc(ch.label)}</button>`).join('')}
           </div>`}`);
  }

  if (o.kind === 'wordCheck') {
    const q = o.q, done = o.pick != null, right = done && o.pick === q.answer;
    return box(`<div class="eyebrow">Money word of the hour · ten seconds</div>
      <h3 style="font-size:24px;margin:2px 0 10px">${esc(q.term)}</h3>
      <p class="small muted" style="margin-bottom:8px">Which one does it mean?</p>
      <div class="stack" style="gap:8px">${q.opts.map((t, i) => `<button class="opt${done ? (i === q.answer ? ' ok' : i === o.pick ? ' no' : '') : ''}" data-act="wcPick" data-arg="${i}" ${done ? 'disabled' : ''}><span class="k">${'ABC'[i]}</span>${esc(t)}</button>`).join('')}</div>
      ${done ? `<div class="fb ${right ? 'yes' : 'no'}" role="status" style="margin-top:10px"><b>${right ? 'That’s it.' : 'It means: ' + esc(q.opts[q.answer])}</b> ${esc(q.eg)}</div>
        <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn" data-act="closeOv">Done</button><button class="btn ghost" data-act="goto" data-arg="#/words/${encodeURIComponent(q.term)}">Every Money Word</button></div>` : ''}`);
  }
  /* a medal to hold up and show (audit v4, L7): drawn on screen, never saved, sent or uploaded */
  if (o.kind === 'showMedal') {
    const b = BADGES[o.id];
    return `<div class="ov showcard-ov" data-act="closeOv"><div class="showcard" data-act="noop" role="dialog" aria-modal="true" aria-label="${esc(b.name)}">
      <button class="ovx" data-act="closeOv" aria-label="Close">${ico('close', '', 18)}</button>
      <span class="ray"></span>
      <div class="sc-medal">${ico(b.em, b.em, 72)}</div>
      <div class="eyebrow">${esc(c.name)} earned a medal in Bizzington</div>
      <h2>${esc(b.name)}</h2><p>${esc(b.desc)}</p>
      <div class="sc-foot">${kidBadge(c, 44)}<span class="small">Bizzing Finance · no real money, ever</span></div>
    </div></div>`;
  }
  if (o.kind === 'drawer') return shell.drawer(c);
  if (o.kind === 'settings') return box(shell.settingsSheet(c, o.focus), 'sheet');
  if (o.kind === 'walletSheet') return box(shell.walletSheet(c), true);
  if (o.kind === 'search') return box(shell.searchSheet(R.sq || '', searchTown(R.sq || '')), true);
  if (o.kind === 'privacy') return box(shell.privacySheet(), true);
  if (o.kind === 'help') return box(shell.helpSheet(), true);
  if (o.kind === 'avDeck') return box(deckView(R.s, c, o.i), true);
  if (o.kind === 'avInfo') {
    const a = BY_ID[o.id], st = stateOf(a, ctxFor(R.s, c)), wearing = c.avatar === a.id;
    const act = wearing ? '<span class="avd-worn">Wearing</span>'
      : st.state === 'owned' ? `<button class="btn" data-act="avdWear" data-arg="${a.id}">Wear this one</button>`
      : st.state === 'buy' ? `<button class="btn" data-act="buyAv" data-arg="${a.id}" ${st.short ? 'disabled' : ''}>${st.short ? esc(st.say) : `Buy for ${st.price} coins`}</button>` : '';
    return box(`<div class="avdeck"><div class="sheet-h"><span class="eyebrow">${esc(a.name)} · ${esc(st.label)}</span><button class="iconbtn" data-act="closeOv" aria-label="Close">${ico('close', '', 20)}</button></div>
      <div class="avd-stage${st.state === 'owned' || wearing ? '' : ' notyet'}">${cardHTML(a.id, { wearing, owned: st.state === 'owned' })}</div>
      <div class="avd-bar"><span class="small" style="font-weight:700">${esc(wearing ? 'Wearing it' : st.say)}</span>${act}</div>
      ${st.state === 'world' ? `<p class="small muted">${esc(LOOKS[Math.ceil(a.pack / 2) - 1].name)} opens with the family plan, or for 240 coins in the Shop.</p>` : ''}
      ${st.state === 'milestone' ? '<p class="small muted">It is earned by learning — then it can be bought.</p>' : ''}
      ${st.state === 'buy' && st.short ? `<p class="small muted">Coins come from right answers and finished lessons in any Bizzing app.</p>` : ''}</div>`, true);
  }
  if (o.kind === 'printCards') {
    const ids = deckIds(R.s, c);
    return box(`<div class="sheet-h"><span class="eyebrow">Print my cards · ${ids.length}</span><button class="iconbtn" data-act="closeOv" aria-label="Close">${ico('close', '', 20)}</button></div>
      <p class="small muted">Every card you hold, laid out to cut out and keep. Print it, or save it as a PDF.</p>
      <button class="btn wide" data-act="doPrint">${ico('printer', '', 18)} Print</button>
      <div class="printsheet">${ids.map((id) => cardHTML(id, { wearing: c.avatar === id })).join('')}</div>`, true);
  }
  if (o.kind === 'quiz') return box(quizView(o), true);
  if (o.kind === 'cast') return box(castCard(o.who), true);
  if (o.kind === 'bug') return box(bugSheet(), true);
  if (o.kind === 'about') return box(aboutSheet(), true);
  if (o.kind === 'sources') return box(sourcesSheet(o.key), true);
  if (o.kind === 'placement') return box(placementView(o), true);
  /* a letter, read again from a feed card: its words, and — only once it has
     reached the postbox and been answered — every choice with what it meant */
  if (o.kind === 'letterRead') {
    const L = LETTERS.find((x) => x.id === o.id); if (!L) return '';
    const answered = ((c.postbox && c.postbox.log) || []).some((x) => x.id === L.id);
    const from = L.from === 'scam' ? 'Sender unknown' : (CAST[L.from] ? CAST[L.from].name : 'The postbox');
    return box(`<div class="eyebrow">${esc(from)} · ${answered ? 'a letter you answered' : 'from the postbox'}</div>
      <h2 style="margin:2px 0 10px">${esc(L.title)}</h2>
      <p style="font-size:15px;line-height:1.6;background:var(--tint);border-radius:var(--r-md);padding:13px 15px">${esc(L.body)}</p>
      ${answered ? `<div class="sect"><b>What each choice meant</b><i></i></div>
        <div class="stack" style="gap:8px">${L.choices.map((ch) => `<div class="card" style="padding:12px 14px"><b>${esc(ch.label)}</b><p class="small" style="margin-top:4px">${esc(ch.note || '')}</p></div>`).join('')}</div>`
        : `<p class="small muted" style="margin-top:10px">This one arrives in your postbox one day. When it does, the choice is yours — what each answer means comes back here after.</p>`}
      <a class="btn ghost wide" style="margin-top:12px" href="#/town/today">The postbox and today's three</a>`);
  }
  /* a Market Game company or event, read — the register's own words, labelled
     fictional, and nothing on it can be bought */
  if (o.kind === 'mgRead') {
    if (!MG) { mgReady(); return box('<p class="small muted">Opening the register…</p>'); }
    const it = o.what === 'company' ? MG_COMPANIES.find((x) => x.id === o.id) : MG_EVENTS.find((x) => x.id === o.id);
    if (!it) return '';
    const p = (t, h) => t ? `<div class="sect"><b>${h}</b><i></i></div><p class="small">${esc(t)}</p>` : '';
    return box(`<div class="row" style="gap:8px"><span class="eyebrow grow">The Market Game · ${o.what === 'company' ? 'the register' : 'what happened'}</span><span class="pill">Fictional</span></div>
      <h2 style="margin:2px 0 6px">${esc(o.what === 'company' ? it.name : it.head)}</h2>
      ${o.what === 'company' ? `${p(it.what, 'What it does')}${p(it.how, 'How it makes money')}${p(it.who, 'Who it sells to')}${p(it.model, 'What it depends on')}${p(it.risk, 'What could hurt it')}` : `<p>${esc(it.body)}</p>`}
      <p class="small muted" style="margin-top:12px">No company here is real, and nothing on this page can be bought. In the Market Game you study one, say what would hurt it, then decide.</p>
      <a class="btn ghost wide" style="margin-top:10px" href="#/market40">Play the Market Game</a>`);
  }
  if (o.kind === 'shelter') return box(shelterView(o));
  if (o.kind === 'wardrobe') return box(wardrobeView(C()));
  if (o.kind === 'receipt') return box(`
    <div class="eyebrow">Keep this one</div>
    <h2 style="margin:4px 0 6px">Your first receipt</h2>
    <p class="small muted">The thing you bought, the shifts that paid for it, the weeks it took. It goes in the Collection, with your name on it.</p>
    ${receiptSlip(o.k, true)}
    <button class="btn wide" style="margin-top:14px" data-act="closeOv">Into the Collection</button>`);
  if (o.kind === 'adopted') {
    const p = co.get(C());
    return box(`
      <div style="text-align:center">${companionFigure(C(), 150)}
        <div class="eyebrow" style="margin-top:8px">Welcome home</div>
        <h2 style="margin:4px 0 8px">${esc(p.name)}</h2>
        <p class="small muted">${esc(co.KINDS[p.kind].line)}</p>
        <p class="small" style="margin-top:10px">Food is <b>${money(co.weeklyCost(C()))} a week</b>, from your wallet, on pay day. That is ${money(co.yearlyCost(C()))} a year — you said it out loud, so you know.</p>
        <button class="btn wide" style="margin-top:14px" data-act="closeOv">Back to the street</button></div>`);
  }
  if (o.kind === 'payday') {
    const p = o.res;
    return box(`
      <div style="text-align:center"><div style="font-size:44px">🔔</div>
        <div class="eyebrow">The bell rang</div>
        <h2 style="margin:4px 0 10px">Pay day in Bizzington</h2></div>
      <div class="stack" style="gap:7px">
        <div class="row"><span class="grow">Wages</span><b style="color:var(--grow)">+${money(p.wage)}</b></div>
        ${p.chores.map((ch) => `<div class="row"><span class="grow muted">${esc(ch.name)}</span><b style="color:var(--grow)">+${money(ch.amt)}</b></div>`).join('')}
        ${p.bills.map((b) => `<div class="row"><span class="grow muted">${esc(b.name)}</span><b>−${money(b.amt)}</b></div>`).join('')}
        ${p.companion ? `<div class="row" style="margin-top:4px"><span class="grow small" style="color:${p.companion.fed ? 'var(--grow)' : 'var(--spend)'}">${p.companion.fed ? co.get(C()).name + ' ate well.' : co.get(C()).name + ' went hungry — the wallet ran out before the food.'}</span></div>` : ''}
        ${p.interest ? `<div class="row"><span class="grow">Bank interest</span><b style="color:var(--grow)">+${money(p.interest)}</b></div>` : ''}
        ${p.loan ? `<div class="row"><span class="grow muted">Loan repayment</span><b>−${money(p.loan)}</b></div>` : ''}
        ${p.split ? `<div class="sep"></div><div class="eyebrow">Your rule split it before you could think about it</div>
          ${Object.keys(p.split).map((k) => `<div class="row"><span class="grow muted">${k[0].toUpperCase() + k.slice(1)} jar</span><b>${money(p.split[k])}</b></div>`).join('')}` : ''}
      </div>
      <div class="sep" style="margin:12px 0"></div>
      <div class="row"><span class="grow" style="font-weight:800">In your pocket now</span><span class="big" style="font-size:22px">${money(c.money.wallet)}</span></div>
      ${p.loanCleared ? '<div style="margin-top:10px;background:var(--grow-tint);border-radius:var(--r-md);padding:11px 13px;font-size:14px"><b>Loan cleared.</b> Your trust score went up, and the next one will be cheaper.</div>' : ''}
      ${p.mortgageCleared ? '<div style="margin-top:10px;background:var(--grow-tint);border-radius:var(--r-md);padding:11px 13px;font-size:14px"><b>Mortgage cleared.</b> You own where you live outright. Rent would still be going out today.</div>' : ''}
      ${(p.independence || []).map((id) => `<div style="margin-top:10px;background:var(--treasure-tint);border-radius:var(--r-md);padding:11px 13px;font-size:14px">
        <b>${BADGES[id].em} ${esc(BADGES[id].name)}</b> — ${esc(BADGES[id].desc)}</div>`).join('')}
      ${say('pip', p.split ? 'Split before you could think about it. That is the point of a rule.' : 'Open the Jar Shed and set a rule — then this happens by itself.')}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Out into the market →</button>`);
  }

  if (o.kind === 'stopDone') {
    const n = nextStep(c), k = cardById(o.id), drillN = k ? drillCount(k) : 1;
    return box(`<div class="celebrate stopdone" style="text-align:center">
      <div class="endfig">${shell.pipPose('cheer', 110)}<span class="endav">${kidBadge(c, 56)}</span></div>
      ${o.firstEver ? `<div class="coinjar" aria-hidden="true"><i class="dropcoin"></i><span class="jarb"></span></div>` : ''}
      <div class="eyebrow">${o.firstEver ? 'Your first stop on the Money Atlas' : 'Stop walked'}</div>
      <h2 style="margin:4px 0 8px;font-size:26px">${esc(o.title)}</h2>
      <ul class="cl">
        <li>${ico('check', '', 16)} ${o.right ? `All ${nWord(drillN)} ${drillN === 1 ? 'question' : 'questions'} right first go` : 'Worked through every question — the second goes count as learning'}</li>
        ${o.first ? `<li>${ico('coin', '', 16)} +5 Bizzing coins for finishing it${o.xp ? ` · +${o.xp} XP` : ''}</li>` : ''}
        ${o.firstEver ? `<li>${ico('jars', '', 16)} Your first Bizzing coins — spend them in the Shop on a new face</li>` : ''}
      </ul>
      ${o.first ? (() => { const xb = sim.xpBar(c); return `<div class="lvlbump" role="img" aria-label="Level ${c.learn.level}, ${xb.need} XP to the next">
        <span class="lv">Level ${c.learn.level}</span><span class="lvbar"><i style="--to:${Math.round(xb.pct * 100)}%"></i></span><span class="small">${xb.need} XP to level ${c.learn.level + 1}</span></div>`; })() : ''}
      ${n && n.title ? `<p style="margin-top:10px">Next: <b>${esc(n.title)}</b></p>` : ''}
      <button class="btn wide" style="margin-top:14px" data-act="stopNext">${n && n.button ? esc(n.button) : 'Continue'} →</button>
      ${R.coldPlace && coldPlaceAfterId(o.id) ? `<button class="btn ghost wide" style="margin-top:8px" data-act="coldPlaceNext">${ico('forward', '', 16)} Carry on answering ${esc(WORLDS[R.coldPlace.wi].name)} cold</button>` : ''}
      <button class="btn ghost wide" style="margin-top:8px" data-act="closeOv">Back to the Atlas</button></div>`);
  }
  if (o.kind === 'coldPlaceDone') {
    const w = WORLDS[o.wi] || WORLDS[0], wait = o.waiting.map((id) => cardById(id)).filter(Boolean);
    return box(`<div class="celebrate stopdone" style="text-align:center">
      <div class="endfig">${shell.pipPose(o.yours ? 'cheer' : 'wave', 104)}<span class="endav">${kidBadge(c, 52)}</span></div>
      <div class="eyebrow">${esc(w.name)} · answered cold</div>
      <h2 style="margin:4px 0 8px;font-size:26px">${o.yours ? (o.yours === 1 ? 'One stop was yours already' : `${nWord(o.yours)[0].toUpperCase() + nWord(o.yours).slice(1)} stops were yours already`) : 'Every stop here has something new'}</h2>
      <p class="muted">${o.yours ? 'Walked without the lesson — the Atlas says so, and so does the grown-ups’ card. ' : ''}${wait.length ? `${wait.length === 1 ? 'One stop waits' : nWord(wait.length)[0].toUpperCase() + nWord(wait.length).slice(1) + ' stops wait'} on the road with its lesson open. Nothing was lost by missing it.` : 'Nothing is waiting.'}</p>
      ${o.level ? `<p class="small muted" style="margin-top:4px">And you reached level ${o.level}.</p>` : ''}
      ${wait.length ? `<ul class="cl">${wait.map((k) => `<li>${ico('lesson', '', 16)} ${esc(k.title)}</li>`).join('')}</ul>
        <button class="btn wide" style="margin-top:14px" data-act="betweenGo" data-arg="${wait[0].id}">Read “${esc(wait[0].title)}” →</button>` : ''}
      <button class="btn ${wait.length ? 'ghost ' : ''}wide" style="margin-top:8px" data-act="closeOv">Back to the Atlas</button></div>`);
  }
  if (o.kind === 'sessionDone') {
    const s = o.sum;
    return box(`<div class="celebrate" style="text-align:center">
      <div class="endfig">${shell.pipPose('cheer', 104)}<span class="endav">${kidBadge(c, 52)}</span></div>
      <div class="eyebrow">Today's session, done</div>
      <h2 style="margin:4px 0 8px;font-size:26px">That's the day's three</h2>
      <p class="muted">What you practised:</p>
      <ul class="cl">${s.practised.map((t) => `<li>${ico('check', '✓', 16)} ${esc(t)}</li>`).join('')}</ul>
      <p style="margin-top:10px;font-weight:700">${s.paid ? money(s.paid) + ' into your wallet' : 'All claimed already'} · about ${nWord(s.minutes)} ${s.minutes === 1 ? 'minute' : 'minutes'}</p>
      <p class="small muted" style="margin-top:4px">Stopping when the day is done is a money skill too. Fresh ones tomorrow — nothing is lost for a day off.</p>
      <button class="btn wide" style="margin-top:16px" data-act="closeOv">Back to the street</button></div>`);
  }
  if (o.kind === 'chapter') {
    const ch = CHAPTERS.find((x) => x.id === o.ch);
    const opens = { c3: 'the Jar Shed and the Build Yard', c5: 'the Bank', c6: 'borrowing', c7: 'the Exchange', c8: 'Bizz & Co' }[ch.id];
    return box(`<div class="celebrate" style="text-align:center">
      <div class="endfig">${shell.pipPose('cheer', 110)}<span class="endav">${kidBadge(c, 56)}</span></div>
      <div class="medal" aria-hidden="true">${ico(ch.em, ch.em, 36)}</div>
      <div class="eyebrow">Chapter finished · +20 Bizzing coins</div>
      <h2 style="margin:4px 0 8px;font-size:28px">${esc(ch.title)}</h2>
      <p class="muted">You worked through all ${nWord(ch.cards.length)}:</p>
      <ul class="cl">${ch.cards.map((k) => `<li>${ico('check', '✓', 16)} ${esc(k.title)}</li>`).join('')}</ul>
      ${opens ? `<p style="margin-top:10px;font-weight:700">That opens ${esc(opens)}.</p>` : ''}
      ${o.level ? `<p class="small muted" style="margin-top:4px">And you reached level ${o.level}.</p>` : ''}
      <button class="btn wide" style="margin-top:16px" data-act="closeOv">Keep going</button></div>`);
  }
  if (o.kind === 'goalBuilt') {
    const g = C().money.goals.find((x) => x.id === o.id); if (!g) return '';
    const weeks = Math.max(1, Math.round((Date.now() - (g.t || Date.now())) / (7 * 864e5)));
    return box(`<div class="celebrate" style="text-align:center">
      <div class="medal" aria-hidden="true">${ico('goal', '🏗️', 44)}</div>
      <div class="eyebrow">${o.first ? 'Your first goal, built' : 'Goal built'}</div>
      <h2 style="margin:4px 0 8px;font-size:28px">${esc(g.name)}</h2>
      <p class="muted">${money(g.target)}, saved a piece at a time over ${nWord(weeks)} ${weeks === 1 ? 'week' : 'weeks'}. That is exactly how it is done.</p>
      <button class="btn wide" style="margin-top:16px" data-act="closeOv">Keep going</button></div>`);
  }
  if (o.kind === 'level') {
    const place = PLACES.find((p) => p.lv > o.from && p.lv <= o.level);
    const rank = rankObj(o.level);
    return box(`
      <div style="text-align:center">
        ${(() => { /* the ceremony (audit v4, L4): the place the level opens, unveiled behind
             parting curtains; otherwise the rank's medal stamps in */
          const ART_OF = { place: 'home-0', wallet: 'stall', jars: 'jars', goals: 'yard', bank: 'bank', exchange: 'exchange', shop: 'shop' };
          const b = place && BLD[ART_OF[place.key]];
          return b ? `<div class="unveil" aria-hidden="true"><span class="ray"></span><img src="${b.src}" alt=""><i class="curtain l"></i><i class="curtain r"></i></div>`
            : `<div class="rankstamp" aria-hidden="true"><span class="ray"></span><span class="rs-medal">${ico(rank.em, rank.em, 54)}</span><span class="endav">${kidBadge(c, 44)}</span></div>`; })()}
        <div class="eyebrow">Level ${o.level} · ${rank.em} ${rank.name}</div>
        <h2 style="margin:4px 0 8px;font-size:28px">${place ? esc(place.name) + ' is open' : 'Level ' + o.level}</h2>
        <p class="muted">${place ? esc(place.blurb) : 'Learning ' + esc(rank.of) + '.'}</p>
        ${place ? `<button class="btn wide" style="margin-top:16px" data-act="goPlace" data-arg="${place.key}">Go and look →</button>` : ''}
        <button class="${place ? 'small muted' : 'btn wide'}" style="margin-top:10px;width:100%;text-align:center" data-act="closeOv">${place ? 'Later' : 'Keep going'}</button>
      </div>`);
  }

  if (o.kind === 'biz') {
    const d = o.day, w = d.weather;
    return box(`
      <div style="text-align:center"><div style="font-size:42px">${w.em}</div>
        <div class="eyebrow">${esc(w.name)}</div>
        <h2 style="margin:4px 0 10px">Day's trading</h2></div>
      <div class="stack" style="gap:6px">
        ${STOCK.filter((s) => d.sold[s.id]).map((s) => `<div class="row"><span class="grow muted">${s.em} ${d.sold[s.id]} × ${esc(s.name)}</span><b style="color:var(--grow)">+${money(d.sold[s.id] * sim.kid(R.s).biz.prices[s.id])}</b></div>`).join('')
          || '<p class="small muted">Nothing sold. It happens — the rent still arrived.</p>'}
        <div class="sep"></div>
        <div class="row"><span class="grow">Revenue</span><b>${money(d.revenue)}</b></div>
        <div class="row"><span class="grow muted">Rent</span><b>−${money(d.rent)}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Profit</span>
          <span class="big" style="font-size:22px;color:${d.profit >= 0 ? 'var(--grow)' : 'var(--spend)'}">${d.profit >= 0 ? '+' : '−'}${money(Math.abs(d.profit))}</span></div>
      </div>
      ${Object.keys(d.spoiled || {}).length ? `<div style="margin-top:11px;background:var(--spend-tint);border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">
        ${Object.keys(d.spoiled).map((k) => d.spoiled[k] + ' ' + STOCK.find((s) => s.id === k).name.toLowerCase()).join(', ')} melted overnight — stock you had already paid for.</div>` : ''}
      ${say('nana', d.profit >= 0
        ? 'Revenue is the number people brag about. That one at the bottom is the one that decides whether you are open next year.'
        : 'A loss is information, not a verdict. Look at what the weather wanted and what you had on the counter.')}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Close up →</button>`);
  }

  if (o.kind === 'moved') {
    const h = o.home;
    const left = sim.weeklyIncome(c) - sim.weeklyCost(c);
    return box(`
      <div style="text-align:center"><div style="font-size:46px">${h.em}</div>
        <div class="eyebrow">Keys</div>
        <h2 style="margin:4px 0 8px;font-size:26px">${esc(h.name)}</h2>
        <p class="muted">${esc(h.blurb)}</p></div>
      <div class="stack" style="gap:6px;margin-top:14px">
        ${c.money.bills.map((b) => `<div class="row"><span class="grow muted">${esc(b.name)}</span><b>−${money(b.amt)}</b></div>`).join('')}
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Left each week</span>
          <span class="big" style="font-size:21px;color:${left > 0 ? 'var(--grow)' : 'var(--spend)'}">${money(left)}</span></div>
      </div>
      ${say('nana', left > 0
        ? 'Every room you add adds a bill behind it. That is not a warning — it is just the arithmetic, and now you have seen it.'
        : 'That is more going out than coming in. It is survivable for a while and it is not survivable forever. Worth knowing now.')}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Settle in →</button>`);
  }

  if (o.kind === 'randry') {
    const r = o.row;
    return box(`
      <div style="text-align:center"><div style="font-size:44px">🫙</div>
        <div class="eyebrow">The till is empty</div>
        <h2 style="margin:4px 0 8px;font-size:24px">And you were making money</h2></div>
      <div style="margin-top:12px;background:var(--gold-tint);color:var(--treasure-deep);
        border-radius:var(--r-md);padding:13px 15px;font-weight:650">
        You earned <b>${money(r.net)}</b> this week. <b>${money(r.receivables)}</b> of your sales
        has not been paid for yet, and the rent went out anyway.</div>
      ${say('nana', 'This is the one that closes more shops than a bad idea ever did. Profit is what you earned. Cash is what turned up. You can be right about the first and still be shut on Friday because of the second — so from now on, watch the till, not the takings.')}
      <div class="row" style="gap:8px;margin-top:14px">
        <button class="btn ghost grow" data-act="closeOv">I see it</button>
        <button class="btn grow" data-act="vBorrow" data-arg="500">Borrow ${money(500)}</button>
      </div>`);
  }
  if (o.kind === 'raised') {
    const d = o.deal;
    return box(`
      <div style="text-align:center"><div style="font-size:44px">🤝</div>
        <div class="eyebrow">Sold a share</div>
        <h2 style="margin:4px 0 8px;font-size:24px">${money(d.cash)} in the till</h2></div>
      <div style="margin-top:12px;background:var(--spend-tint);color:var(--spend);border-radius:var(--r-md);padding:12px 14px;font-weight:700">
        And ${money(d.costPerYear)} a year of profit is theirs now. For good.</div>
      ${say('nana', 'That money did not come from nowhere. You did not borrow it, so there is nothing to repay — you sold a piece of every rupee this shop will ever make. Sometimes that is exactly right. Just never let anyone tell you it was free.')}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">I understand</button>`);
  }
  if (o.kind === 'mended') {
    const f = o.fix;
    return box(`
      <div style="text-align:center"><div style="font-size:48px">${f.em}</div>
        <div class="eyebrow">Mended</div>
        <h2 style="margin:4px 0 8px;font-size:26px">${esc(f.name)}</h2>
        <p class="muted">${esc(f.fixed)}</p></div>
      <div style="margin-top:14px;background:var(--grow-tint);color:var(--grow);border-radius:var(--r-md);padding:12px 14px;font-weight:700">
        ⚙ ${esc(f.gives)}</div>
      <div style="margin-top:10px;text-align:center"><div style="font-size:13px;font-weight:800;letter-spacing:.02em;
        display:inline-block;background:#C9A227;color:#3A2C0A;border-radius:7px;padding:7px 15px">${esc(C().name || 'You')}</div>
        <p class="small muted" style="margin-top:6px">Your name goes on it, out in the street, for good.</p></div>
      ${say('pip', 'That is yours now, and it stays. Every day from here it pays you back a little — which is the whole difference between spending on a thing and spending on a thing that <b>does</b> something.')}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Go and look →</button>`);
  }

  if (o.kind === 'world') {
    const w = o.world;
    return box(`
      <div style="text-align:center"><div style="margin:0 auto;width:120px">${shell.pipPose('point', 120, 'Pip points the way')}</div>
        <div class="eyebrow">${esc(w.rank)} · world ${WORLDS.indexOf(w) + 1}</div>
        <h2 style="margin:4px 0 8px;font-size:27px">${esc(w.name)}</h2>
        <p class="muted">${esc(w.blurb)}</p></div>
      <div style="margin-top:14px;background:var(--action-tint);border-radius:var(--r-md);padding:12px 14px;font-size:14px">
        <b>Opens here:</b> ${esc(w.opens)}</div>
      ${say('pip', 'New street, new work going, new things to learn. You got here by finishing the last lot — that is the only way anybody gets anywhere in this town.')}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Look around →</button>`);
  }

  if (o.kind === 'between') {
    const card = o.card;
    return box(`
      <div class="eyebrow">While you're here</div>
      <h3 style="font-size:19px;margin:4px 0 8px">${esc(card.title)}</h3>
      ${say(card.who, 'One card. Three minutes. Then back to it.')}
      <div class="row" style="gap:8px;margin-top:14px">
        <button class="btn grow" data-act="betweenGo" data-arg="${card.id}">Read it</button>
        <button class="btn ghost" data-act="closeOv">Not now</button>
      </div>`);
  }

  if (o.kind === 'kids') return shell.kidMenu();
  return '';
}

/* ══ actions ══════════════════════════════════════════════════════════ */
const C = () => sim.kid(R.s);

on('noop', () => {});
on('shelter', () => { R.overlay = { kind: 'shelter', pick: null, name: '' }; sfx.click(); render(); });
on('shelterPick', (kind) => { R.overlay.pick = kind; render(); });
on('adopt', () => {
  const c = C(), o = R.overlay;
  const r = co.adopt(c, o.pick, o.name);
  if (!r.ok) { toast(r.why); sfx.bad(); return; }
  sim.stamp(c);
  decisions.log(c, { surface: 'letter', chose: 'adopt ' + o.pick, label: 'The shelter',
    alternatives: ['not yet'] });
  R.overlay = { kind: 'adopted' };
  sfx.level(); confetti(40); render();
});
on('play', () => {
  const c = C();
  if (!co.play(c)) { toast(co.has(c) ? 'Already played today — tomorrow is another day' : 'Nobody at home yet'); return; }
  sim.stamp(c); sfx.good(); toast(co.get(c).name + ' loved that'); render();
});
on('wardrobe', () => { R.overlay = { kind: 'wardrobe' }; sfx.click(); render(); });
on('buyAcc', (id) => {
  const c = C(), r = co.buy(c, id);
  if (!r.ok) { toast(r.why); sfx.bad(); return; }
  sim.stamp(c);
  if (r.cost) { decisions.log(c, { objective: 'CHOOSE-2', surface: 'store', chose: 'buy', label: id, alternatives: [] }); sfx.coin(); }
  else sfx.click();
  render();
});
on('cert', async (id) => {
  if (!R.gate) return;
  try {
    const cv = await CERT.draw(C(), id); if (!cv) { toast('Not finished yet'); return; }
    const a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = `${C().name}-${id}-certificate.png`;
    document.body.appendChild(a); a.click(); a.remove(); toast('Certificate saved'); sfx.medal();
  } catch (e) { toast('This device could not draw the certificate'); }
});
on('planToggle', () => { if (!R.gate || !R.s.settings.tester) return; R.s.settings.plan = R.s.settings.plan === 'family' ? 'free' : 'family'; sim.save(R.s); toast(R.s.settings.plan === 'family' ? 'Previewing the family plan — tester mode only' : 'Preview off'); render(); });
on('stopNext', () => { R.overlay = null; goContinue(); });
on('closeOv', () => {
  /* the adoption letter's "meet them" closes into the shelter, not to Home */
  if (R.overlay && R.overlay.then === 'shelter') { R.overlay = { kind: 'shelter', pick: null, name: '' }; render(); return; }
  R.overlay = null; render();
});
/* ── the family shell (shell.js) ───────────────────────────────────────── */
on('drawer', () => { R.overlay = { kind: 'drawer' }; sfx.click(); render(); });
on('walletSheet', () => { R.overlay = { kind: 'walletSheet' }; sfx.click(); render(); });
on('search', () => { R.overlay = { kind: 'search' }; render(); setTimeout(() => { const el = document.getElementById('srch'); if (el) el.focus(); }, 30); });
on('privacy', () => { R.overlay = { kind: 'privacy' }; render(); });
on('help', () => { R.overlay = { kind: 'help' }; render(); });
on('word', (t) => { R.overlay = null; R.query = t || ''; R.s.ui.nav = 'words'; render(); window.scrollTo(0, 0); });
on('muteAll', () => {
  const st = audio.state(), muted = !R.s.settings.sound && !st.music;
  R.s.settings.sound = muted; setSound(muted); audio.set({ music: muted }); Store.saveDevice('music', muted);
  toast(muted ? 'Sound on' : 'Sound off'); render();
});
on('musicOn', () => { const v = !audio.state().music; audio.set({ music: v }); Store.saveDevice('music', v); render(); });
on('readAloud', () => { R.readAloud = R.readAloud === false; Store.saveDevice('readAloud', R.readAloud); render(); });
on('motionSw', () => fire('motion', R.motion === 'reduced' ? 'full' : 'reduced'));
on('calm', () => { R.calm = !R.calm; Store.saveDevice('calm', R.calm); applyDevice(); render(); });
on('letterRead', (id) => { R.overlay = { kind: 'letterRead', id }; render(); });
on('mgRead', (arg) => { const [what, id] = String(arg).split(':'); R.overlay = { kind: 'mgRead', what, id }; render(); });
on('shelterAt', (kind) => { R.overlay = { kind: 'shelter', pick: co.KINDS[kind] ? kind : null, name: '' }; render(); });
on('wardrobeAt', (id) => { R.overlay = { kind: 'wardrobe' }; R.focus = id ? [`[data-arg="${CSS.escape(id)}"]`] : null; render(); });
/* a route as an action: search results and anything else that opens one thing */
on('goto', (h) => { R.overlay = null; if (location.hash === h) { if (readHash()) render(); else { const k = R.sheetNow, a = R.sheetArg; R.sheetNow = null; if (k) fire(k, a); } } else location.hash = h; });
on('kids', () => { R.overlay = { kind: 'kids' }; sfx.click(); render(); });
on('addKidGate', () => { R.overlay = null; if (R.gate) fire('addKid'); else { R.afterGate = 'addKid'; R.s.ui.nav = 'parents'; render(); } });
/* worlds and faces: Bizzing coins only, through the family engine */
const fam = () => { const c = C(); if (!c.fam) c.fam = { owned: [], worlds: [], extras: [], frame: null, board: null, look: 'market' }; return c.fam; };
on('look', (id) => {
  const w = lookById(id), c = C();
  if (!lookOpen(w, ctxFor(R.s, c))) { toast(`${w.name} opens with the family plan, or 240 coins`); return; }
  fam().look = w.id; sfx.unlock(); sim.save(R.s); toast(`Wearing ${w.name}`); render();
});
on('buyWorld', (n) => {
  if (R.demo) { toast('A sample — nothing is bought or saved here'); return; }
  const c = C(), ctx = ctxFor(R.s, c);
  if (!buyWorld(family.APP, c.name, +n, ctx)) { toast('Not enough coins yet'); sfx.bad(); return; }
  fam().worlds.push(+n); fam().look = LOOKS[+n - 1].id; sim.save(R.s);
  sfx.unlock(); confetti(40); toast(`${LOOKS[+n - 1].name} is yours`); render();
});
on('wear', (id) => { if (!BY_ID[id]) return; C().avatar = id; sim.save(R.s); sfx.click(); toast('Wearing ' + BY_ID[id].name); render(); });
/* the hello card's face opens the deck: every card the child owns, flipped by button,
   ←/→ or a swipe, worn straight from the card (Bizzing Bee's openAvDeck) */
on('avDeck', () => { const c = C(), ids = deckIds(R.s, c); R.overlay = { kind: 'avDeck', i: Math.max(0, ids.indexOf(c.avatar)) }; sfx.click(); render();
  const f = document.querySelector('.avd-nav.next, .avdeck [data-act="closeOv"]'); if (f) f.focus(); });
on('avdGo', (d) => { if (!R.overlay || R.overlay.kind !== 'avDeck') return; R.overlay.i += +d || 0; sfx.click(); render();
  const f = document.querySelector(+d < 0 ? '.avd-nav.prev' : '.avd-nav.next'); if (f) f.focus(); });
on('avdWear', (id) => { if (!BY_ID[id]) return; C().avatar = id; sim.save(R.s); sfx.good(); confetti(30);
  /* the deck can change under a wear (a face that was only in it because it was worn
     leaves), so stay on the card just put on */
  if (R.overlay && R.overlay.kind === 'avDeck') R.overlay.i = Math.max(0, deckIds(R.s, C()).indexOf(id));
  render(); });
on('avInfo', (id) => { if (BY_ID[id]) { R.overlay = { kind: 'avInfo', id }; render(); } });
on('buyAv', (id) => {
  if (R.demo) { toast('A sample — nothing is bought or saved here'); return; }
  const c = C(), a = BY_ID[id]; if (!a) return;
  if (!buyAvatar(family.APP, c.name, a, ctxFor(R.s, c))) { R.overlay = { kind: 'avInfo', id }; render(); return; }
  fam().owned.push(id); c.avatar = id; sim.save(R.s);
  sfx.unlock(); confetti(40); toast(`${a.name} is yours — and you are wearing it`); render();
});
on('shopTab', (t) => { R.shopTab = t; render(); });
on('colTab', (t) => { R.colTab = t; R.s.ui.nav = 'collection'; sfx.click(); render(); const b = document.querySelector(`.col-tabs [data-arg="${t}"]`); if (b) b.focus(); });
/* a face in the Collection opens its trading card */
on('avCard', (id) => { if (BY_ID[id]) { R.overlay = { kind: 'avInfo', id }; sfx.click(); render(); } });
/* Print my cards: every card the child holds, laid out to cut out (print.css rules in tasks.css) */
on('printCards', () => { R.overlay = { kind: 'printCards' }; render(); });
on('doPrint', () => { try { window.print(); } catch (e) { /* no printer here */ } });
on('buyExtra', (id) => {
  if (R.demo) { toast('A sample — nothing is bought or saved here'); return; }
  const c = C(), x = EXTRA_BY[id]; if (!x) return;
  if (fam().extras.includes(id)) return;
  if (!spendCoins(family.APP, c.name, x.price, 'extra:' + id)) { toast('Not enough coins yet'); sfx.bad(); return; }
  fam().extras.push(id); fam()[x.kind] = id; sim.save(R.s); sfx.unlock(); toast(x.name + ' — yours'); render();
});
on('useExtra', (id) => { const x = EXTRA_BY[id]; if (!x || !fam().extras.includes(id)) return; fam()[x.kind] = fam()[x.kind] === id ? null : id; sim.save(R.s); sfx.click(); render(); });
/* the mistakes deck */
on('mkPick', (i) => {
  const c = C(), m = mistakes.due(c).find((x) => R.mk && x.k === R.mk.k); if (!m) return;
  const card = cardById(m.card), d = shuffledDrill(card, m.qi), cur = R.mk;
  if (cur.pick === d.answer || cur.tries >= 2) return;
  cur.pick = +i; cur.tries++;
  const right = +i === d.answer;
  if (right || cur.tries >= 2) {
    const r = mistakes.answer(c, m.k, right && cur.tries === 1);
    if (right && cur.tries === 1) { sfx.good(); family.coins(c.name, 'answer'); if (r && r.moved === 'cleared') { sfx.medal(); toast('That one is yours again'); } } else sfx.bad();
    sim.save(R.s);
  } else sfx.bad();
  render();
});
on('mkNext', () => { R.mk = null; render(); });
/* "Your turn" items (items.js): sort, order, amount */
on('itSel', (i) => { const t = R.item || (R.item = {}); t.sel = +i; render(); });
on('itBin', (b) => { const t = R.item || (R.item = {}); if (t.sel == null) return; (t.bins || (t.bins = {}))[t.sel] = +b; t.sel = null; sfx.click(); render(); });
on('itStep', (i) => { const t = R.item || (R.item = {}); const seq = t.seq || (t.seq = []); if (!seq.includes(+i)) seq.push(+i); sfx.click(); render(); });
on('itUndo', () => { const t = R.item || {}; if (t.seq) t.seq.pop(); render(); });
/* E6 · show me how: open the worked method (other numbers) before the first try */
on('genHow', (id) => { const c = C(); if (c.learn.openCard !== id) return; R.genHow = id; sfx.click(); render(); const el = document.getElementById('gh-' + id); if (el) el.focus(); });
on('itHow', () => { const t = R.item || {}; if (t.tries || t.settled) return; t.how = true; sfx.click(); render();
  const el = t.id && document.getElementById('yh-' + t.id); if (el) el.focus({ preventScroll: true }); });
on('itCheck', (id) => {
  id = id || (R.item || {}).id;      /* Enter in the amount box fires it without an arg */
  const it = items.ITEMS[id], t = R.item || (R.item = {}); if (!it || t.settled) return;
  const attempt = it.kind === 'amount' ? (document.getElementById('itAmt') || {}).value
    : it.kind === 'order' ? (t.seq || []) : it.things.map((_, i) => (t.bins || {})[i]);
  const right = items.check(id, attempt);
  t.tries = (t.tries || 0) + 1; t.right = right; t.last = attempt;
  if (right) { sfx.good(); t.settled = true; if (t.tries === 1) family.coins(C().name, 'answer'); }
  else if (t.tries >= 2) { sfx.bad(); t.settled = true; }
  else sfx.bad();
  render();
});
on('itReset', () => { const t = R.item || {}; R.item = { id: t.id }; render(); });
/* ── today's session (E1, session.js) ─────────────────────────────────── */
function sessionBar() {
  const c = C(), st = SESSION.status(c, sim), n = SESSION.next(c, sim);
  return `<div class="sessbar" role="status"><span class="dots" aria-hidden="true">${Array.from({ length: st.of }, (_, i) => `<i class="${i < st.done ? 'on' : ''}"></i>`).join('')}</span>
    <span class="grow"><b>Today's session · ${st.done} of ${st.of}</b>${n ? ` <span class="small">next: ${esc(n.quest.t)}</span>` : ''}</span>
    ${st.finished ? '<button class="btn ghost sm" data-act="sessionEnd">Finish</button>' : n ? '<button class="btn ghost sm" data-act="sessionGo">Go →</button>' : ''}
    <button class="iconbtn" data-act="sessionStop" aria-label="Stop the session — nothing is lost">${ico('close', '✕', 15)}</button></div>`;
}
on('sessionStart', () => { R.session = { t: Date.now() }; sfx.click(); fire('sessionGo'); });
on('sessionGo', () => {
  const n = SESSION.next(C(), sim);
  if (!n) { fire('sessionEnd'); return; }
  R.overlay = null;
  if (n.act === 'continue') goContinue(); else fire(n.act, n.arg);
});
on('sessionStop', () => { R.session = null; render(); });
on('sessionEnd', () => {
  const c = C(), sum = SESSION.finish(c, sim, (R.session && R.session.t) || Date.now());
  R.session = null; sim.save(R.s);
  sfx.level(); confetti(50);
  R.overlay = { kind: 'sessionDone', sum }; R.s.ui.nav = 'home'; writeHash(); render();
});

on('nav', (k) => {
  R.overlay = null; R.shelf = '';
  R.gameIntro = null;
  if (R.game) quitGame();
  R.s.ui.nav = ALIAS[k] || k;
  if (R.s.kids.length) C().learn.openCard = null;
  sfx.click(); render(); window.scrollTo(0, 0);
});
on('sub', (k) => { R.overlay = null; R.s.ui.nav = 'money'; R.s.ui.sub = k; sfx.click(); render(); window.scrollTo(0, 0); });
on('shelf', (k) => { R.shelf = k || ''; R.query = ''; render(); window.scrollTo(0, 0); });
on('locked', (lv) => { toast(`Opens at level ${lv} — keep learning`); sfx.bad(); });
on('lockedSub', (k) => { toast('Finish “' + (needFor(k) || 'the chapter') + '” first'); sfx.bad(); fire('nav', 'learn'); });
on('lockedGame', (id) => {
  const g = GAMES.find((x) => x.id === id);
  const ch = g && CHAPTERS.find((x) => x.id === g.needs);
  toast('Finish “' + (ch ? ch.title : 'the chapter') + '” to open ' + (g ? g.name : 'this'));
  sfx.bad(); fire('nav', 'learn');
});
on('travel', (i) => {
  const c = C(), chk = sim.canTravel(c, +i);
  if (!chk.ok) { toast(chk.why); sfx.bad(); return; }
  sim.travel(c, +i);
  const w = WORLDS[+i];
  family.milestone(c.name, 'world', w.name);
  sfx.level(); confetti(35);
  R.overlay = { kind: 'world', world: w };
  R.s.ui.nav = 'home'; render();
});
on('putRight', (id) => {
  const c = C();
  const a = sim.putRight(c, id, price(10));
  if (!a) { toast('Nothing in the wallet for it'); sfx.bad(); return; }
  const f = FIXES.find((x) => x.id === id);
  if (c.fix.done.includes(id)) {
    sfx.level(); confetti(45);
    R.overlay = { kind: 'mended', fix: f };
  } else { sfx.coin(); toast('+' + money(a) + ' towards ' + f.name); }
  render();
});
on('claim', (id) => {
  const a = sim.claimQuest(C(), id);
  if (a) { sfx.coin(); toast('+' + money(a)); } else toast('Not finished yet');
  render();
});
on('questBonus', () => {
  const a = sim.questBonus(C());
  if (a) { sfx.level(); confetti(40); toast('All three — ' + money(a)); }
  render();
});
/* ── device preferences: this browser's business, never the household's ──
   Appearance, text size and motion live in the device bucket (store.js) and
   are stamped on <html> so CSS can read them without a re-render. */
function applyDevice() {
  const h = document.documentElement;
  if (R.mode) h.setAttribute('data-mode', R.mode); else h.removeAttribute('data-mode');
  if (R.text === 'large') h.setAttribute('data-text', 'large'); else h.removeAttribute('data-text');
  if (R.motion === 'reduced') h.setAttribute('data-motion', 'reduced'); else h.removeAttribute('data-motion');
  /* FAMILY-STANDARD §8: the family avatar glow and every night plate read this */
  if (R.text === 's') h.setAttribute('data-text', 's');
  if (R.calm) h.setAttribute('data-calm', ''); else h.removeAttribute('data-calm');
  audio.set({ calm: !!R.calm });
  R.dark = isDark();
  if (R.dark) h.setAttribute('data-bz-dark', ''); else h.removeAttribute('data-bz-dark');
}
function isDark() {
  if (R.mode === 'dark') return true;
  if (R.mode === 'light') return false;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
}
if (typeof matchMedia !== 'undefined') matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { applyDevice(); if (R.s) render(); });
on('mode', (m) => {
  R.mode = m === 'system' ? null : m || (R.mode === 'dark' ? 'light' : 'dark');
  Store.saveDevice('mode', R.mode); applyDevice(); render();
});
on('text', (v) => { R.text = v === 'large' ? 'large' : v === 's' ? 's' : null; Store.saveDevice('text', R.text); applyDevice(); render(); });
on('motion', (v) => { R.motion = v === 'reduced' ? 'reduced' : null; Store.saveDevice('motion', R.motion); applyDevice(); render(); });
on('settings', (focus) => {
  R.overlay = { kind: 'settings', focus }; sfx.click(); render();
  if (focus === 'look') setTimeout(() => { const el = document.getElementById('st-look-sec'); if (el) el.scrollIntoView({ block: 'start' }); }, 30);
});
/* hold a control for its second action (the theme button opens the worlds) */
let longT = null, longFired = false;
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest && e.target.closest('[data-long]'); longFired = false;
  if (!el) return;
  clearTimeout(longT);
  longT = setTimeout(() => { longFired = true; const [a, arg] = el.getAttribute('data-long').split(':'); fire(a, arg); }, 550);
});
['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => document.addEventListener(ev, () => clearTimeout(longT)));
document.addEventListener('click', (e) => { if (longFired && e.target.closest && e.target.closest('[data-long]')) { e.stopPropagation(); e.preventDefault(); longFired = false; } }, true);
on('rate', (v) => { R.rate = v === 'slow' ? 'slow' : null; Store.saveDevice('rate', R.rate); applyRate(); render(); });
function applyRate() { const r = R.rate === 'slow' ? 0.82 : 1; setRate(r); setSayRate(r); }
/* read it to me: the device's own voice, since these have no recorded clip */
/* K1 · read aloud with the device's voice: any speech bubble, any question
   with its options, any explanation. Nothing here is a recorded file. */
on('tryStep', (arg) => { const [id, k, d] = String(arg).split(':'); R.tryit = TRY.step(R.tryit || {}, id, k, +d); sfx.click(); render(); });
on('sayEl', (_, ev) => {
  const b = ev && ev.target && ev.target.closest('.bub, .fb, .t3card, .shero');
  const t = b ? b.innerText.replace(/🔊/g, '').trim() : '';
  if (!speak(t)) toast('This device has no reading voice');
});
on('say', (key) => {
  const c = C(); let text = '';
  if (key.startsWith('q:')) {
    const k = key.slice(2), cut = k.lastIndexOf('#'), id = k.slice(0, cut), qi = k.slice(cut + 1), card = cardById(id);   /* EARN-1#0#0: the last # is the question */
    if (card && !card.pending) { const d = shuffledDrill(card, +qi || 0); text = d.num ? `${d.q} Type the amount.` : `${d.q} ${d.opts.map((o, i) => `${'ABCD'[i]}: ${o}.`).join(' ')}`; }
  }
  if (key === 'word') { const w = daily.wordOfHour(); text = `${w.term}. ${w.meaning} ${w.eg}`; }
  else if (key === 'ask') text = daily.askOfWeek();
  /* the reading she sees is the reading she hears: a Sprout's own (sprout.js), and the Atlas's own stops too */
  else if (key.startsWith('card:')) { const id = key.slice(5), k = ALL_CARDS.find((x) => x.id === id) || NEW_CARD_LIST.find((x) => x.id === id); if (k) text = `${k.title}. ${String(teachFor(k, c)).replace(/<[^>]+>/g, '')} For instance: ${egFor(k, c)}`; }
  else if (key.startsWith('gloss:')) { const g = GLOSSARY.find((x) => x[0] === key.slice(6)); if (g) text = `${g[0]}. ${g[1]} ${g[2]}`; }
  else if (key.startsWith('letter:') && R.overlay && R.overlay.letter) { const L = R.overlay.letter; text = `${L.title}. ${L.body}`; }
  if (!speak(text)) toast('This device has no reading voice');
});
on('deed', () => { const c = C(); if (daily.didDeed(c)) { sim.save(R.s); sfx.good(); confetti(20); toast('Kept. That is one more thing you actually did.'); } render(); });
on('sound', (v) => { R.s.settings.sound = v ? v === 'on' : !R.s.settings.sound; setSound(R.s.settings.sound); sfx.click(); render(); });
/* tester mode: every gate opens; the child's record is untouched (content.js) */
on('tester', (v) => {
  R.s.settings.tester = v ? v === 'on' : !R.s.settings.tester; setTester(R.s.settings.tester); sim.save(R.s);
  toast(R.s.settings.tester ? 'Tester mode on — everything is open' : 'Tester mode off'); sfx.click(); render();
});
on('tJump', (lv) => { if (!R.s.settings.tester) return; const l = sim.jumpLevel(C(), +lv); sim.save(R.s); toast('Level ' + l); sfx.level(); render(); });
on('tMoney', () => { if (!R.s.settings.tester) return; sim.testerTopUp(C(), 100); sim.save(R.s); sfx.coin(); toast('Topped up'); render(); });
on('tBell', () => { if (!R.s.settings.tester) return; sim.protoSkipWeek(C(), R.s); sim.save(R.s); toast('The bell is ready — ring it on Home'); render(); });
on('tDone', () => { if (!R.s.settings.tester) return; const c = C(); ALL_CARDS.forEach((k) => { if (!c.learn.done[k.id]) c.learn.done[k.id] = { t: Date.now(), right: 0, tester: true }; }); sim.save(R.s); toast('Every card marked done (tester)'); render(); });

/* onboarding */
on('obNext', () => {
  const n = (R.fields.name || '').trim();
  if (!n) { toast('Type a name first'); return; }
  draft.name = n; draft.step = 1; sfx.click(); render();
});
on('obAvatar', (id) => { if (AVATARS[id]) { draft.avatar = id; sfx.click(); render(); const el = document.getElementById('nm'); if (el && !draft.name) el.focus(); } });
/* The band is the last question: tapping it makes the child. Setup asks a
   first name, an avatar and an age band — nothing else, ever (A4). */
on('obBand', (b) => { draft.band = b; fire('obCur', R.s && R.s.kids.length ? C().currency : guessCurrency()); });
on('obCancel', () => { draft = { step: 0 }; R.adding = false; render(); });
on('obCur', (cur) => {
  if (!R.s) R.s = sim.newState();
  const firstChild = !R.s.kids.length;
  const child = sim.newChild(draft.name, draft.band, cur, draft.avatar);
  R.s.kids.push(child);
  R.s.active = R.s.kids.length - 1;
  R.s.ui = { nav: 'home', sub: 'wallet' };
  setCurrency(cur);
  R.fields = {}; draft = { step: 0 }; R.adding = false;
  sfx.level(); confetti(40); render();
  /* A3 · time to first learning: the household's first child goes from the band tap
     straight into their first stop — the same one Continue would open (nextStep), with
     Home one tap away. A second child added later lands on Home as before. */
  if (firstChild) goContinue();
});

/* town */
on('town', (key) => {
  const p = PLACES.find((x) => x.key === key);
  if (!p) return;
  if (!chapterOpen(C(), p.sub)) { fire('lockedSub', p.sub); return; }
  fire('sub', p.sub);
});
on('goPlace', (key) => { R.overlay = null; fire('town', key); });
on('betweenGo', (id) => { R.overlay = null; fire('card', id); });

/* learn */
on('card', (id) => {
  R.s.ui.nav = 'learn'; R.shelf = '';
  C().learn.openCard = id; C().learn.drill = null; R.item = { id };
  sfx.click(); render(); window.scrollTo(0, 0);
});
/* Cards now come from three places: the chapters, the objectives file's own
   teaching cards, and generated retrieval items (id "CHOOSE-4#1"). One
   resolver so every caller stops caring which. */
const cardById = (id) => resolveCard(id, C());

on('closeCard', () => { R.practice = null; R.cold = null; R.coldPlace = null; C().learn.openCard = null; C().learn.drill = null; render(); });
on('answer', (i) => {
  const c = C(), card = cardById(c.learn.openCard);
  if (!card || card.pending) return;
  let st = c.learn.drill;
  if (!st || st.card !== card.id || !st.picks) st = c.learn.drill = { card: card.id, qi: 0, picks: [] };
  if (drill.settled(st.picks[st.qi])) return;        /* this question is answered */
  const p = drill.pick(st, st.qi, +i, shuffledDrill(card, st.qi).answer);
  /* the card counts as RIGHT only when every question was right first try —
     a second-go answer is learning, not evidence of having known (drill.js) */
  const t = drill.tally(st, drillCount(card));
  st.done = t.done; st.right = t.right;
  if (p.right) { sfx.good(); if (p.first) family.coins(c.name, 'answer'); }
  else { sfx.bad(); if (p.tries === 1 && isLesson(card)) mistakes.record(c, card.id, st.qi); }
  if (!p.right && R.cold === card.id) { R.cold = null; coldPlaceMiss(card.id); toast('Here is the lesson — then have another go'); }   /* the deck holds lesson stops; a generated item is asked again by the ledger instead */   /* F3: a wrong FIRST answer goes in the deck */
  render();
  /* G2 · the kit's feedback, from the option the child chose and only after the verdict is
     drawn: coins out of a right one, a small shake of a wrong one. It touches nothing the
     drill records, and it never marks an option the child did not pick. */
  verdict(document.querySelector(`.opt[data-act="answer"][data-arg="${+i}"]`), p.right);
});
/* A typed amount (generate.js). It goes through the same hold-then-retry rules as a tap:
   right is pick 0; a wrong first try holds (pick 1) and the second go settles (pick 2). */
on('answerNum', () => {
  const c = C(), card = cardById(c.learn.openCard);
  if (!card || card.pending) return;
  const el = document.getElementById('numAns'), raw = el ? el.value : '';
  const n = Number(String(raw).replace(/[^\d.-]/g, ''));
  if (!String(raw).trim() || !Number.isFinite(n)) { toast('Type the amount first'); return; }
  let st = c.learn.drill;
  if (!st || st.card !== card.id || !st.picks) st = c.learn.drill = { card: card.id, qi: 0, picks: [] };
  const cur = st.picks[st.qi];
  if (drill.settled(cur)) return;
  const dq = shuffledDrill(card, st.qi), right = n === dq.value;
  const p = drill.pick(st, st.qi, right ? 0 : (cur ? 2 : 1), 0);
  p.typed = n;
  const t = drill.tally(st, drillCount(card));
  st.done = t.done; st.right = t.right;
  if (p.right) { sfx.good(); if (p.first) family.coins(c.name, 'answer'); } else sfx.bad();
  render();
  verdict(document.querySelector('.numrow'), p.right);
});
/* Practice on a stop, in fresh numbers (owner, 3 Oct 2026: "finish A3 ... the lesson
   stops"). Finishing the stop is recorded first, exactly as "Take it back to town" would;
   practice itself is never evidence — mastery hears nothing, a right answer earns its XP. */
on('practise', (fromId) => {
  const c = C(), from = cardById(fromId); if (!from) return;
  if (!R.practice && c.learn.openCard === fromId && c.learn.drill && c.learn.drill.done) { fire('cardDone', fromId); }
  if (R.practice && R.practice.from === fromId && c.learn.drill && c.learn.drill.right) sim.addXP(c, sim.cardXP(false, true));
  const n = R.practice && R.practice.from === fromId ? R.practice.n + 1 : 0;
  const k = practiceCard(from, n, c); if (!k) return;
  R.practice = { from: fromId, n, id: k.id };
  R.s.ui.nav = 'learn'; c.learn.openCard = k.id; c.learn.drill = null;
  sfx.click(); render(); window.scrollTo(0, 0);
});
/* the miss is recorded first (it is evidence), then one more on the same idea, asked fresh */
on('moreLike', (id) => {
  const k = practiceTeach(cardById(id)); if (!k) return;
  fire('cardDone', id); R.overlay = null; fire('practise', k.id);
});
on('practiceDone', () => {
  const c = C(), right = !!(c.learn.drill && c.learn.drill.right);
  if (right) sim.addXP(c, sim.cardXP(false, true));
  R.practice = null; c.learn.openCard = null; c.learn.drill = null; R.s.ui.nav = 'learn';
  sim.save(R.s); render(); window.scrollTo(0, 0);
});
/* Answering a stop cold (owner, 3 Oct 2026: "add per-stop skipping"). Runtime only until
   it succeeds; what is kept is c.learn.cold[id], so a report can say "answered cold". */
on('coldStart', (id) => { const c = C(); if (c.learn.done[id]) return; R.cold = id; c.learn.drill = null; sfx.click(); render(); window.scrollTo(0, 0); });
on('coldStop', () => { if (R.cold) coldPlaceMiss(R.cold); R.cold = null; render(); });

/* A6 · a whole place answered cold (audit A6). The place's open, unwalked stops run back to
   back, each through the per-stop path above — R.cold, then cardDone writes c.learn.cold[id]
   exactly as it does for one stop. Nothing new marks learning: a stop answered right cold is
   walked the same way, and a miss opens that stop's lesson where the child is, with the
   choice to read it or carry on cold. Runtime only; closing the card ends the run. */
function coldPlaceAfterId(id) { const r = R.coldPlace; if (!r) return null; const c = C(), at = r.ids.indexOf(id); return r.ids.slice(at + 1).find((x) => !c.learn.done[x] && !r.waiting.includes(x)) || null; }
function coldPlaceIds(c, wi) { return roadPath(c).filter((s) => s.wi === wi && !s.done && !s.locked).map((s) => s.card.id); }
function coldPlaceMiss(id) { const r = R.coldPlace; if (r && r.ids.includes(id) && !r.waiting.includes(id)) r.waiting.push(id); }
/* the next stop in the run after the one open now, still unwalked */
function coldPlaceAfter(c) {
  const r = R.coldPlace; if (!r) return null;
  const at = r.ids.indexOf(c.learn.openCard);
  return r.ids.slice(at + 1).find((id) => !c.learn.done[id] && !r.waiting.includes(id)) || null;
}
function coldPlaceGo(id) { fire('card', id); R.cold = id; C().learn.drill = null; render(); }
function coldPlaceEnd(level) {
  const r = R.coldPlace; R.coldPlace = null; R.cold = null;
  const c = C(); c.learn.openCard = null; c.learn.drill = null;
  /* a level reached on the last stop is said here, rather than replacing this moment */
  if (level) { sfx.level(); confetti(50); }
  R.overlay = { kind: 'coldPlaceDone', wi: r.wi, yours: r.yours, waiting: r.waiting.filter((id) => !c.learn.done[id]), level: level || null };
  sim.save(R.s); render(); window.scrollTo(0, 0);
}
on('coldPlace', (wi) => {
  const c = C(); wi = +wi || 0;
  const ids = coldPlaceIds(c, wi);
  if (!ids.length) { toast('Nothing left to answer here'); return; }
  R.overlay = null;
  R.coldPlace = { wi, ids, yours: 0, waiting: [] };
  sfx.click(); coldPlaceGo(ids[0]); window.scrollTo(0, 0);
});
on('coldPlaceNext', () => {
  const c = C(); R.overlay = null; if (!R.coldPlace) return;
  const nx = coldPlaceAfter(c);
  if (nx) { coldPlaceGo(nx); window.scrollTo(0, 0); } else coldPlaceEnd();
});
on('coldPlaceEnd', () => { if (R.coldPlace) coldPlaceEnd(); });
/* the word of the hour, checked in ten seconds: one go, the meaning shown either way, nothing paid */
on('wordCheck', (term) => { const q = daily.wordCheck(term); if (!q) return; R.overlay = { kind: 'wordCheck', q, pick: null }; render(); });
on('wcPick', (i) => { const o = R.overlay; if (!o || o.kind !== 'wordCheck' || o.pick != null) return; o.pick = +i; if (o.pick === o.q.answer) sfx.good(); else sfx.bad(); render(); });
on('showMedal', (k) => { if (!BADGES[k] || !C().badges.includes(k)) return; R.overlay = { kind: 'showMedal', id: k }; sfx.medal(); render(); });
on('nextQ', () => {
  const c = C(), st = c.learn.drill;
  if (!st || !st.picks || !drill.settled(st.picks[st.qi])) return;   /* a held question waits for its second go */
  st.qi += 1; sfx.click(); render();
});
on('cardDone', (id) => {
  const c = C(), card = cardById(id);
  if (!card) return;
  const right = !!(c.learn.drill && c.learn.drill.right);
  const first = !c.learn.done[id];

  /* If this card WAS the day's beat, it goes into the mastery record — and
     which door it goes through matters. A teaching card's question is the
     immediate check and is attention; a retrieval item, days later in a
     different context, is evidence. Collapsing the two is the exact mistake
     the whole ledger exists to stop, so ledger.answer() keeps them apart. */
  const bt = c.learn.beat;
  if (bt && bt.cardId === id && !bt.answered) {
    ledger.answer(c, { shape: bt.shape, objective: objective(bt.obj), card }, right);
    bt.answered = true;
    if (bt.shape === 'retrieve') sim.questTick(c, 'lesson', 1);
  } else if (first) {
    /* Read from the map rather than from Continue: it is still the immediate
       check on that objective, so the record hears about it — otherwise the
       ledger keeps offering a lesson the child has finished. */
    const ob = OBJECTIVES.find((o) => o.teach === id && !mastery.lastSeen(c, o.id));
    if (ob) { ledger.seen(c, ob.id); ledger.answer(c, { shape: 'teach', objective: ob, card }, right); }
  }

  /* Chapter progress only exists for chapter cards. */
  const ch = card.ch ? CHAPTERS.find((x) => x.id === card.ch) : null;
  /* a question asked again later is not a stop on the road: no stop, no stop coins */
  if (!isLesson(card)) {
    sim.addXP(c, sim.cardXP(false, right));
    if (bt && bt.shape === 'retrieve' && bt.cardId === id && mastery.stateOf(c, bt.obj) === 'retained') family.milestone(c.name, 'mastery', objective(bt.obj).short);
    c.learn.openCard = null; c.learn.drill = null;
    c.lastDone = { id, title: card.title, right, t: Date.now() };
    sfx[right ? 'good' : 'click'](); toast(right ? 'Still yours.' : 'It will come back, in a few days.');
    R.s.ui.nav = 'home'; sim.save(R.s); render(); window.scrollTo(0, 0);
    return;
  }
  const cold = R.cold === id && right; R.cold = null;
  if (cold) { c.learn.cold = c.learn.cold || {}; c.learn.cold[id] = true; }
  const run = R.coldPlace && R.coldPlace.ids.includes(id) ? R.coldPlace : null;
  if (run && cold) run.yours += 1;
  const runNext = run ? coldPlaceAfter(c) : null;
  c.learn.done[id] = true;
  if (first && ch) sim.questTick(c, 'lesson', 1);
  const res = sim.addXP(c, sim.cardXP(first, right));
  const finished = ch && ch.cards.every((k) => c.learn.done[k.id]) && sim.badge(c, 'chapter-' + ch.id);
  /* the family (O3): a lesson finished is a stop; a chapter finished is a
     mastery milestone; a skill shown again after a gap is one too */
  if (first) { family.coins(c.name, 'stop'); family.milestone(c.name, 'stop', card.title); }
  /* finishing a chapter is completion, not mastery: the 20 coins wait for the evidence (mastery.listen) */
  if (finished) family.milestone(c.name, 'stop', 'Chapter: ' + ch.title);
  if (bt && bt.shape === 'retrieve' && bt.cardId === id && mastery.stateOf(c, bt.obj) === 'retained') family.milestone(c.name, 'mastery', objective(bt.obj).short);
  c.learn.openCard = null; c.learn.drill = null;
  c.lastDone = { id, title: card.title, right, t: Date.now() };
  /* J1: finishing a chapter is a moment, and it names what was done — the
     four lessons, what it opens — never how anyone else did. */
  /* answered cold: straight on to the next stop on the road (next.js), no finish card;
     a level gained on the way still gets its moment, over the next stop */
  /* a whole place answered cold (A6): straight on to the place's next stop, cold again; the
     chapter's moment, if one was finished on the way, sits over it */
  if (run && cold) {
    if (runNext) {
      sfx.good(); toast('“' + card.title + '” — yours already');
      coldPlaceGo(runNext);
      if (finished) { R.overlay = { kind: 'chapter', ch: ch.id, level: res.leveled ? res.level : null }; confetti(50); render(); }
      else if (res.leveled) levelUp(res);
      window.scrollTo(0, 0);
      return;
    }
    coldPlaceEnd(res.leveled ? res.level : null);
    return;
  }
  const onward = cold && !finished ? nextStop(c) : null;
  if (onward) { sfx.good(); toast('“' + card.title + '” — yours already'); fire('card', onward.id); if (res.leveled) levelUp(res); }
  else if (finished) { sfx.level(); confetti(70); R.overlay = { kind: 'chapter', ch: ch.id, level: res.leveled ? res.level : null }; render(); }
  else if (res.leveled) levelUp(res);
  else {
    /* F4 · every stop ends on a finish card: what was learned, what was earned, what
       is next. The very first stop is a moment of its own (A8): a coin drops into the
       Save jar on the street. */
    /* answered cold: straight on to whatever is next (nextStep decides), no finish card */
    const allStops = ALL_CARDS.filter((k) => c.learn.done[k.id]).length;
    R.overlay = { kind: 'stopDone', id, title: card.title, right, firstEver: first && allStops === 1, first, xp: res.gained };
    if (first) { sfx.level(); confetti(allStops === 1 ? 60 : 24); } else sfx.good();
    render();
  }
});

/* Open the day's beat. */
on('beat', () => {
  const c = C();
  const bt = ledger.beat(c, ALL_CARDS, { mathsMet: ledger.mathsMet(c) });
  if (!bt) { toast('Nothing due today'); return; }
  /* Opening is not reading: nothing is marked until the card is answered, so a
     lesson closed half-way is still the next step (FIX B10). */
  c.learn.beat = { shape: bt.shape, obj: bt.objective.id, cardId: bt.card.id, answered: false };
  /* The card lives on Learn. Without this, Continue on Home set the card and
     re-drew Home — a button that did nothing a child could see. */
  R.s.ui.nav = 'learn'; R.shelf = '';
  c.learn.openCard = bt.card.id;
  c.learn.drill = null;
  sfx.click(); render(); window.scrollTo(0, 0);
});

/* The adult gate. A deterrent on a device the child holds, not security —
   see views.js. The PIN is set on first entry and checked here. */
on('gateGo', () => {
  const s = R.s;
  const el = document.querySelector('[data-field="pin"]');
  const v = (el && el.value || '').trim();
  if (!/^\d{4}$/.test(v)) { R.gateWrong = true; toast('Four digits'); render(); return; }
  /* stored as a salted hash; "unlocked" is memory only, so a reload asks again */
  if (!pinSet(s.parent)) { s.parent.pin = hashPin(v); R.gate = true; R.gateWrong = false; sim.save(s); toast('PIN set'); render(); return; }
  if (checkPin(v, s.parent.pin)) { R.gate = true; R.gateWrong = false; if (R.afterGate) { const a = R.afterGate; R.afterGate = null; fire(a); return; } render(); }
  else { R.gateWrong = true; sfx.bad(); render(); }
});
on('lock', () => { R.gate = false; R.s.ui.nav = 'home'; toast('Locked'); render(); });
function levelUp(res) {
  if (rankObj(res.level).name !== rankObj(res.from).name) family.milestone(C().name, 'band', rankObj(res.level).name);
  sfx.level(); confetti(50);
  R.overlay = { kind: 'level', level: res.level, from: res.from };
  render();
}

/* postbox */
on('postbox', () => {
  const c = C();
  if (c.postbox.answered) { toast('Emptied — another one tomorrow'); return; }
  /* a consequence that has come due jumps the queue: the flood does not wait
     politely behind the tune club */
  const fuse = sim.dueFuse(c);
  const rotation = LETTERS.filter((l) => !l.fuseOnly
    && !(l.needsCompanion && !co.has(c)) && !(l.id === 'hh-adopt' && co.has(c)));
  const letter = fuse ? LETTERS.find((l) => l.id === fuse.id) : rotation[c.postbox.idx % rotation.length];
  R.overlay = { kind: 'letter', letter, fuse: fuse ? fuse.id : null, result: null };
  sfx.click(); render();
});
on('letterPick', (i) => {
  const c = C(), L = R.overlay.letter, ch = L.choices[+i];
  let delta = 0;
  if (ch.wallet) {
    const amt = price(Math.abs(ch.wallet));
    if (ch.wallet > 0) { sim.earn(c, amt, L.title, 'letter'); delta = amt; }
    else { sim.spend(c, amt, L.title, 'letter'); delta = -amt; }
  }
  /* lasting consequences (docs/09): bills that recur, fuses that land later */
  let lasting = '';
  if (ch.bill) {
    sim.addBill(c, ch.bill);
    lasting = `${ch.bill.name}: ${money(price(ch.bill.units))} a week${ch.bill.weeks ? ` for ${ch.bill.weeks} weeks` : ''} — it's in your bills now.`;
  }
  if (ch.unbill) sim.removeBill(c, ch.unbill);
  if (ch.fuse) sim.addFuse(c, ch.fuse);
  if (ch.defuse) sim.defuse(c, ch.defuse);
  if (ch.pet === 'ill') co.setIll(c, true);
  if (ch.pet === 'well') co.setIll(c, false);
  if (ch.open) R.overlay.then = ch.open;
  if (R.overlay.fuse) sim.defuse(c, R.overlay.fuse);
  decisions.log(c, {
    surface: 'letter', chose: ch.label, label: L.title,
    alternatives: L.choices.filter((x) => x !== ch).map((x) => x.label),
  });
  const res = sim.addXP(c, sim.letterXP(ch));
  if (ch.badge) sim.badge(c, ch.badge);
  c.postbox.answered = true;
  c.postbox.log.push({ id: L.id, scam: !!L.scam, safe: !!ch.safe, t: Date.now() });
  sim.questTick(c, 'letter', 1);
  if (L.scam && ch.safe) {
    sim.questTick(c, 'scam', 1);
    /* she saw the shape and did not hand anything over — the only place in the
       app where GUARD can be demonstrated rather than answered */
    mastery.transfer(c, 'GUARD-2', 'letter', 'saw through "' + L.title + '" and gave nothing away');
    mastery.transfer(c, 'GUARD-1', 'letter', 'kept the secrets when "' + L.title + '" asked for them');
    mastery.transfer(c, 'GUARD-6', 'letter', 'answered a scam letter safely instead of quietly');
  }
  sim.stamp(c);
  R.overlay.result = { note: ch.note, money: delta, xp: sim.letterXP(ch), badge: ch.badge, lasting, good: !(L.scam && !ch.safe) };
  if (delta > 0) sfx.coin(); else if (L.scam && !ch.safe) sfx.bad(); else sfx.good();
  render();
  if (res.leveled) setTimeout(() => levelUp(res), 900);
});

/* the week */
on('payday', () => {
  const c = C();
  if (!sim.payDue(c, R.s)) { toast('Not yet — the bell rings on ' + weekday(c.money.nextPay)); return; }
  const res = sim.runPayDay(c, R.s);
  res.companion = co.onPayDay(c, res.walletAfterBills);
  R.overlay = { kind: 'payday', res };
  sfx.bell(); confetti(30); render();
});
on('skipWeek', () => { sim.protoSkipWeek(C(), R.s); toast('Clock pushed to pay day'); fire('nav', 'home'); });
on('grantXP', () => {
  /* Rewrites the child's level, so it is a tester tool and nothing else. */
  if (!R.s.settings.tester) return;
  const res = sim.addXP(C(), 200);
  if (res.leveled) levelUp(res); else { toast('+200 XP'); render(); }
});
on('wipe', () => {
  if (!confirm('Start this household over? Every town in it goes.')) return;
  try { localStorage.removeItem('bzf_profile'); localStorage.removeItem('bzf_v1'); } catch (e) {}
  R.s = null; draft = { step: 0 }; location.hash = ''; render();
});

/* market row */
/* A job is a game now, not a button. The pay comes out of how it went, and
   sim.doJob does the earning at the end of it — so there is still exactly one
   place that credits a day's work. A job with no game built yet falls back to
   the old behaviour rather than being unavailable. */
on('job', (id) => {
  const c = C();
  const row = sim.jobsToday(c).find((x) => x.id === id);
  if (!row || row.done) { toast('Done that one today'); return; }
  if (hasJobGame(id)) {
    sfx.click();
    /* a shift returns to wherever it was opened — the Town, the Wallet — not to Play (audit v4) */
    const from = { nav: R.s.ui.nav, sub: R.s.ui.sub };
    R.jobFrom = from;
    import('./jobgames.js').then(({ startJobGame }) => {
      const g = startJobGame(id, () => { quitGame(); R.s.ui.nav = from.nav; R.s.ui.sub = from.sub; R.jobFrom = null; render(); window.scrollTo(0, 0); });
      if (!g) return;
      if (R.game && R.game.stop) R.game.stop();
      R.game = g; R.s.ui.nav = 'arcade';
      render(); window.scrollTo(0, 0);
    });
    return;
  }
  const a = sim.doJob(c, id);
  if (a) {
    sfx.coin(); toast('+' + money(a));
    /* transfer evidence, unprompted: she chose work and it paid. The rate one
       only counts when a better-paying job was on the board and she took it. */
    mastery.transfer(c, 'EARN-1', 'wallet', 'worked ' + row.name + ' for ' + money(a));
    const best = sim.jobsToday(c).filter((j) => !j.done).reduce((m, j) => Math.max(m, j.amt || 0), 0);
    if (a >= best) mastery.transfer(c, 'EARN-4', 'wallet', 'took the best-paying shift on the board');
  }
  render();
});

/* jars, goals */
/* E9 · evidence is a DECISION WITH AN ALTERNATIVE: a tap only counts as using what
   was learned when something else was genuinely on offer — here, a thing in Mags'
   store the wallet could have bought outright. A tap with nothing tempting is a tap. */
function tempting(c, money0) {
  return SHOP.find((it) => !(c.shop.owned || []).includes(it.id) && price(it.units) <= money0) || null;
}
on('jarIn', (k) => {
  const c = C(), before = c.money.wallet, alt = tempting(c, before);
  if (sim.toJar(c, k, price(2))) {
    sfx.coin();
    if (alt && k !== 'spend') {
      mastery.transfer(c, 'KEEP-2', 'jars', `put money in the ${k} jar with ${alt.name.toLowerCase()} affordable in Mags' store`);
      decisions.log(c, { objective: 'KEEP-2', surface: 'jars', chose: 'jar', label: 'The ' + k + ' jar', alternatives: [{ label: alt.name, cost: price(alt.units) }] });
    }
  }
  else toast('Wallet is empty');
  render();
});
on('jarOut', (k) => { sim.fromJar(C(), k, price(2)) ? sfx.click() : toast('That jar is empty'); render(); });
on('rule', (arg) => {
  const c = C(), [k, d] = arg.split(':'), r = c.money.rules;
  r[k] = Math.max(0, Math.min(100, r[k] + +d));
  /* The report reads choices from this log, never from state (M2): a run of
     taps in one sitting is one decision, so the latest entry is updated. */
  const top = (c.decisions || [])[0];
  const said = `Spend ${r.spend} · Save ${r.save} · Grow ${r.grow} · Give ${r.give}`;
  if (top && top.surface === 'rules' && Date.now() - top.t < 10 * 60000) { top.chose = said; top.t = Date.now(); }
  else decisions.log(c, { surface: 'rules', label: 'Changed the pay-day split', chose: said, alternatives: ['Keep it as it was'] });
  /* a rule set on an ORDINARY day is the objective; one set with pay day
     already due is deciding in the shop, and does not count */
  if (!sim.payDue(c, R.s)) mastery.transfer(c, 'KEEP-2', 'jars', 'set the pay-day rule to ' + r[k] + ' for ' + k + ', on a day nothing was tempting');
  sfx.click(); render();
});
on('addGoal', () => {
  const n = (R.fields.goalName || '').trim();
  const a = parseInt(String(R.fields.goalAmt || '').replace(/[^0-9]/g, ''), 10);
  if (!n) { toast('Name it first'); return; }
  if (!a || a <= 0) { toast('How much does it cost?'); return; }
  sim.addGoal(C(), n, a);
  mastery.transfer(C(), 'KEEP-4', 'goals', 'named "' + n + '" and priced it at ' + money(a));
  R.fields.goalName = ''; R.fields.goalAmt = '';
  sfx.good(); toast('Scaffolding up'); render();
});
on('fundGoal', (id) => {
  if (!sim.fundGoal(C(), id, price(5))) { toast('The Save jar is empty'); return; }
  const g = C().money.goals.find((x) => x.id === id);
  if (g && g.done && !g.celebrated) {
    g.celebrated = true;
    const first = C().money.goals.filter((x) => x.done).length === 1;
    sfx.level(); confetti(first ? 80 : 45);
    R.overlay = { kind: 'goalBuilt', id: g.id, first };
  } else sfx.coin();
  render();
});
on('autoGoal', (id) => {
  const g = C().money.goals.find((x) => x.id === id); if (!g) return;
  g.auto = g.auto ? 0 : price(5);
  toast(g.auto ? 'Will move ' + money(g.auto) + ' every pay day' : 'Auto-save off');
  sfx.click(); render();
});
on('raidGoal', (id) => { if (sim.raidGoal(C(), id)) { sfx.bad(); toast('Scaffolding came down'); } render(); });

/* bank */
on('bankIn', () => {
  const c = C();
  const alt = tempting(c, c.money.wallet + c.money.jars.save);
  if (sim.bankIn(c, price(10))) {
    sfx.coin();
    if (alt) {
      mastery.transfer(c, 'GROW-1', 'bank', `banked savings that could have bought ${alt.name.toLowerCase()}`);
      decisions.log(c, { objective: 'GROW-1', surface: 'bank', chose: 'bank', label: 'The Bank', alternatives: [{ label: alt.name, cost: price(alt.units) }] });
    }
  }
  else toast('Nothing in the Save jar');
  render();
});
on('bankOut', () => { sim.bankOut(C(), price(10)); sfx.click(); render(); });
on('loan', () => {
  const c = C();
  const offer = sim.loanOffer(c, 40, 8);
  const took = confirm(`Borrow ${money(offer.amount)}?\n\nYou pay back ${money(offer.perWeek)} every pay day for ${offer.weeks} pay days.\nYou hand over ${money(offer.total)} in total.\nSo it costs ${money(offer.cost)}.`);

  /* Both answers are logged, and neither is scored. Credit is a tool with a
     price, never a moral failing (CONCEPT §6.7) — the report tells the story
     and lets the grown-up read it. */
  decisions.log(c, {
    objective: 'CHOOSE-8', surface: 'loans',
    chose: took ? 'borrow' : 'wait',
    label: took ? 'borrowing ' + money(offer.amount) : 'waiting and saving up',
    alternatives: [took
      ? { id: 'wait', cost: offer.cost, label: 'waiting and saving up' }
      : { id: 'borrow', cost: offer.cost, label: 'a loan of ' + money(offer.amount) }],
  });

  if (!took) {
    /* Declining AFTER the cost was shown is the objective being used, on a
       surface it was not taught on. That is transfer, and it is the only kind
       of evidence a quiz cannot produce. */
    mastery.transfer(c, 'CHOOSE-8', 'loans', 'turned down a loan after working out it cost ' + money(offer.cost));
    sim.stamp(c); render(); return;
  }
  sim.takeLoan(c, offer); sfx.coin(); toast('Borrowed — and you knew the cost first'); render();
});
on('repay', () => {
  const c = C(), had = c.money.wallet;
  const a = sim.repayLoan(c, had);
  if (a) {
    sfx.coin(); toast('Repaid ' + money(a));
    /* the objective is paying when the money had somewhere else to be — so
       it counts only when the wallet had something to lose */
    if (had > a) mastery.transfer(c, 'OWE-4', 'loans', 'repaid ' + money(a) + ' with ' + money(had) + ' in the wallet');
  }
  render();
});

/* exchange */
on('buy', (id) => {
  const c = C();
  if (!sim.buyAsset(c, id, price(5))) { toast('Fill the Grow jar first'); return; }
  sfx.coin();
  /* a spread is only a spread once there are two of them */
  const held = Object.keys(c.market.holdings || {}).filter((k) => c.market.holdings[k] > 0);
  if (held.length >= 2) mastery.transfer(c, 'GROW-5', 'portfolio', 'held ' + held.length + ' different things rather than one');
  render();
});
on('sell', (id) => { sim.sellAsset(C(), id); sfx.click(); render(); });

/* bizz & co */
/* the Market Game (marketgame.js) */
const G = () => { const c = C(); if (!c.game) c.game = MG.newGame((c.market && c.market.seed) || 1); return c.game; };
on('mgAct', mg((a) => { MG.startAct(G(), +a); sfx.level(); render(); window.scrollTo(0, 0); }));
on('mgOpen', mg((id) => { const g = G(); MG.study(g, id); g.opened = { co: id }; sfx.click(); render(); window.scrollTo(0, 0); }));
on('mgClose', mg(() => { G().opened = {}; render(); window.scrollTo(0, 0); }));
on('mgAssess', mg((arg) => {
  const [id, pick] = arg.split(':');
  const r = MG.assess(G(), id, pick);
  if (r.right) sfx.good(); else sfx.bad();
  render();
}));
on('mgToInvest', mg(() => { const g = G(); g.phase = 'invest'; g.opened = {}; sfx.click(); render(); window.scrollTo(0, 0); }));
on('mgBuy', mg((arg) => { const [id, amt] = arg.split(':'); const a = MG.buy(G(), id, +amt); if (a) sfx.coin(); render(); }));
on('mgSell', mg((id) => { const v = MG.sell(G(), id); if (v) { sfx.coin(); toast('Sold for ' + money(v)); } render(); }));
on('mgPlay', mg(() => { G().phase = 'play'; sfx.level(); render(); window.scrollTo(0, 0); }));
on('mgNext', mg(() => {
  const r = MG.advance(G());
  if (!r) { sfx.level(); confetti(40); } else if (r.after >= r.before) sfx.coin(); else sfx.bad();
  render(); window.scrollTo(0, 0);
}));
on('mgPick', mg(() => { const g = G(); g.phase = 'pick'; g.act = null; g.opened = {}; render(); window.scrollTo(0, 0); }));

/* years 6 and 7 — the venture (business.js via sim) */
on('openVenture', () => { sim.openVenture(C(), "Your stall"); sfx.level(); confetti(30); render(); });
on('vPrice', (d) => { const c = C(); sim.venturePrice(c, c.venture.price + (+d)); sfx.click(); render(); });
on('vBuy', (u) => {
  const a = sim.ventureBuy(C(), +u);
  if (a) { sfx.coin(); toast('Stocked up — ' + money(a) + ' out of the till'); }
  else toast('Not enough in the till');
  render();
});
on('vWeek', () => {
  const row = sim.ventureWeek(C());
  if (row.brokeAt) {
    sfx.bad();
    R.overlay = { kind: 'randry', row };
    render();
    return;
  }
  if (row.net >= 0) sfx.coin(); else sfx.bad();
  toast(row.net >= 0 ? 'Made ' + money(row.net) : 'Lost ' + money(-row.net));
  render();
});
on('vBorrow', (amt) => {
  const c = C();
  const d = sim.ventureLib.borrow(c.venture, +amt, sim.ventureWorld(c));
  sim.stamp(c); sfx.coin();
  toast('Borrowed ' + money(d.amount) + ' · ' + money(d.weeklyInterest) + ' a week');
  render();
});
on('vRepay', () => {
  const c = C();
  const a = sim.ventureLib.repay(c.venture, Math.min(c.venture.cash, c.venture.debt));
  sim.stamp(c); if (a) { sfx.coin(); toast('Repaid ' + money(a)); }
  render();
});
on('vRaise', (share) => {
  const c = C();
  const d = sim.ventureLib.raiseEquity(c.venture, +share, sim.ventureWorld(c));
  if (!d) { toast('Not worth anything yet — trade a few weeks first'); return; }
  sim.stamp(c); sfx.coin();
  R.overlay = { kind: 'raised', deal: d };
  render();
});
on('vDraw', (amt) => {
  const a = sim.ventureDraw(C(), +amt);
  if (a) { sfx.coin(); toast('Took ' + money(a) + ' home'); }
  render();
});

on('openBiz', () => { sim.openBiz(C()); sfx.level(); confetti(30); render(); });
on('bizBuy', (id) => { sim.bizBuy(C(), id, 5) ? sfx.coin() : toast('Not enough in the till'); render(); });
on('bizPrice', (arg) => { const [id, d] = arg.split(':'); sim.bizPrice(C(), id, price(1) * +d); sfx.click(); render(); });
on('bizTrade', () => {
  const c = C();
  const any = STOCK.some((s) => (c.biz.stock[s.id] || 0) > 0);
  if (!any) { toast('Buy something to sell first'); sfx.bad(); return; }
  const day = sim.bizTrade(c);
  R.overlay = { kind: 'biz', day };
  if (day.profit >= 0) sfx.coin(); else sfx.bad();
  render();
});
on('bizCashOut', () => { const a = sim.bizCashOut(C()); if (a) { sfx.coin(); toast('Drew ' + money(a) + ' from the till'); } render(); });

/* store */
on('cool', (id) => {
  const c = C(), it = SHOP.find((x) => x.id === id);
  c.shop.cooling[id] = Date.now() + 24 * 3600000;
  if (it) {
    decisions.log(c, { objective: 'CHOOSE-2', surface: 'store', chose: 'wait',
      label: 'sleeping on it', alternatives: [{ id: it.id, cost: price(it.units), label: it.name }] });
    mastery.transfer(c, 'CHOOSE-2', 'store', 'walked away from ' + it.name + ' to think about it');
    mastery.transfer(c, 'GUARD-3', 'store', 'slept on ' + it.name + ' instead of buying it now');
  }
  toast('Come back tomorrow — see if you still want it');
  sfx.click(); render();
});
on('buyItem', (id) => {
  const c = C(), it = SHOP.find((x) => x.id === id);
  const r = sim.buyFromShop(c, it);
  if (!r.ok) { toast(r.why); sfx.bad(); return; }
  const goal = (c.money.goals || []).find((g) => !g.done);
  decisions.log(c, { objective: 'CHOOSE-2', surface: 'store', chose: 'buy', label: it.name,
    alternatives: goal ? [{ id: goal.id, cost: price(it.units), label: goal.name }] : [] });
  /* the first thing she ever buys is a keepsake — a receipt with her name on */
  if (r.receipt) { R.overlay = { kind: 'receipt', k: r.receipt }; sfx.level(); confetti(40); render(); return; }
  sfx.coin(); toast(it.name + ' is yours'); render();
});
on('ovSeen', () => { const c = C(); if (c.overnight) c.overnight.seen = true; sim.save(R.s); render(); });

/* your place */
on('move', (t) => {
  const c = C(), tier = +t, h = HOMES[tier];
  const chk = sim.canMove(c, tier);
  if (!chk.ok) { toast(chk.why); sfx.bad(); return; }
  if (!sim.moveHome(c, tier)) { toast('Could not move'); return; }
  sfx.level(); confetti(45);
  R.overlay = { kind: 'moved', home: h };
  render();
});

/* the grown-up's page */
on('allow', (d) => {
  const c = C(), step = price(5);
  if (c.family.allowance == null) c.family.allowance = +d > 0 ? step : null;
  else {
    const v = c.family.allowance + step * +d;
    c.family.allowance = v < step ? null : v;
  }
  sfx.click(); render();
});
on('coolOff', () => { C().family.coolOff = !C().family.coolOff; sfx.click(); render(); });
on('chore', (i) => { const ch = C().family.chores[i]; ch.done = !ch.done; sfx.click(); render(); });
on('choreAdd', () => {
  const n = (R.fields.choreName || '').trim();
  const a = parseInt(String(R.fields.choreAmt || '').replace(/[^0-9]/g, ''), 10);
  if (!n || !a) { toast('A job and an amount'); return; }
  C().family.chores.push({ name: n, amt: a, done: false });
  R.fields.choreName = ''; R.fields.choreAmt = '';
  sfx.good(); render();
});
on('choreDel', (i) => { C().family.chores.splice(+i, 1); render(); });
on('switchKid', (i) => {
  R.s.active = +i;
  setCurrency(C().currency);
  sim.touchDay(C());
  R.s.ui = { nav: 'home', sub: 'wallet' };
  sfx.click(); toast('Now playing as ' + C().name); render();
});
on('addKid', () => { R.adding = true; draft = { step: 0 }; R.fields = {}; render(); });
on('band', () => {
  const c = C();
  c.band = c.band === 'sprout' ? 'builder' : 'sprout';
  sfx.click(); render();
});
on('print', () => {
  document.body.classList.add('printing');
  const c = C();
  const w = document.createElement('div');
  w.id = 'printsheet';
  w.innerHTML = `<h1>${esc(c.name)} · Bizzington</h1>
    <p>Week to ${new Date().toLocaleDateString()} · level ${c.learn.level} · ${rankFor(c.learn.level)}</p>
    <h2>Money</h2>
    <p>Wallet ${money(c.money.wallet)} · jars ${money(sim.jarTotal(c))} · bank ${money(c.money.bank.balance)} ·
       invested ${money(sim.holdingsValue(c))} · <b>net worth ${money(sim.netWorth(c))}</b></p>
    <h2>Chapters</h2>
    <ul>${CHAPTERS.map((ch) => `<li>${esc(ch.title)} — ${ch.cards.filter((x) => c.learn.done[x.id]).length}/${ch.cards.length}</li>`).join('')}</ul>
    <h2>Recent movements</h2>
    <ul>${c.money.txns.slice(0, 20).map((t) => `<li>${new Date(t.t).toLocaleDateString()} — ${esc(t.label)} — ${t.kind === 'in' ? '+' : '−'}${money(t.amt)}</li>`).join('')}</ul>
    <p style="margin-top:18px;font-size:11px">Simulated money only. Bizzing Finance never touches real money.</p>`;
  document.body.appendChild(w);
  setTimeout(() => {
    try { window.print(); } catch (e) { toast('Printing is not available here'); }
    setTimeout(() => { w.remove(); document.body.classList.remove('printing'); }, 400);
  }, 60);
});

/* arcade */
on('game', (id) => {
  const c = C();
  sim.questTick(c, 'game', 1);
  if (id === 'mn') sim.questTick(c, 'board', 1);
  /* the title card first (F3); Start begins the game */
  R.gameIntro = id; R.s.ui.nav = 'arcade'; sfx.click(); render(); window.scrollTo(0, 0);
});
on('gbegin', (id) => { R.gameIntro = null; arcadeMod().then((m) => { m.startGame(id); render(); }); });
on('gback', () => { R.gameIntro = null; render(); });
/* Leaving a game is when a child is most willing to read one card — so the
   lesson is offered here rather than filed in a tab they have to remember. */
on('gquit', () => {
  const wasJob = R.game && /^job:/.test(R.game.id || '') && R.jobFrom;
  quitGame();
  if (wasJob) { R.s.ui.nav = wasJob.nav; R.s.ui.sub = wasJob.sub; R.jobFrom = null; render(); window.scrollTo(0, 0); return; }
  const c = C();
  const next = ALL_CARDS.find((x) => !c.learn.done[x.id]
    && C().learn.level >= CHAPTERS.find((ch) => ch.id === x.ch).lv);
  /* offered once per card, never by chance — nothing in this app is random */
  if (next && R.betweenFor !== next.id) { R.betweenFor = next.id; R.overlay = { kind: 'between', card: next }; }
  render();
});
GAME_ACTS.forEach((a) => { on(a, (arg) => { if (R.game && R.game.act) R.game.act(a, arg); }); });

/* ══ input plumbing ═══════════════════════════════════════════════════ */
bindRoot(document.body);
document.body.addEventListener('input', (e) => {
  const f = e.target.getAttribute && e.target.getAttribute('data-field');
  if (!f) return;
  R.fields[f] = e.target.value;
  if (f === 'petname' && R.overlay && R.overlay.kind === 'shelter') {
    R.overlay.name = e.target.value;
    const b = document.querySelector('[data-act="adopt"]');
    if (b) b.textContent = `Take ${(e.target.value.trim() || 'them').slice(0, 16)} home · ${money(price(co.C.adopt))}`;
  }
  if (e.target.getAttribute('data-live')) liveField(f, e.target.value);
});
document.body.addEventListener('change', (e) => {
  const f = e.target.getAttribute && e.target.getAttribute('data-field');
  if (f && e.target.getAttribute('data-live')) liveField(f, e.target.value);
});
function liveField(f, v) {
  if (f === 'query') { R.query = v; render(); requeue('query'); }
  else if (f === 'sq') { R.sq = v; render(); requeue('sq'); }
  else if (f === 'vol') { const n = Math.max(0, Math.min(100, +v)) / 100; audio.set({ volume: n }); Store.saveDevice('volume', n); }
  else if (f === 'cur') { sim.changeCurrency(C(), v); toast('Converted to ' + CURRENCIES[v].name); render(); }
  else if (f === 'payday') {
    sim.setPayWeekday(C(), +v);
    toast('Pay day moves to ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][+v]);
    render();
  }
}
/* Re-rendering blows away focus; put the caret back where the child left it. */
function requeue(field) {
  const el = document.querySelector(`[data-field="${field}"]`);
  if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
}

document.addEventListener('keyup', (e) => {
  if (R.game && R.game.keyup && !R.overlay) R.game.keyup(e);
});
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented) return;          /* the family ☰ drawer handled it (Esc, Tab) */
  /* a typed answer submits on Enter, the same as its Check button (keyboard and touch) */
  if (e.key === 'Enter' && e.target && e.target.dataset && e.target.dataset.enter) { e.preventDefault(); fire(e.target.dataset.enter); return; }
  if (R.game && R.game.key && !R.overlay) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)
      && document.activeElement && document.activeElement.tagName !== 'INPUT') e.preventDefault();
    R.game.key(e);
    return;
  }
  /* the counting game (placement): A–D or 1–4 picks, Enter goes on — touch taps the same buttons */
  if (R.overlay && R.overlay.kind === 'placement' && !R.overlay.done && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const k = e.key.toLowerCase(), i = 'abcd'.indexOf(k) >= 0 ? 'abcd'.indexOf(k) : '1234'.indexOf(k);
    if (i >= 0 && k.length === 1 && R.overlay.pick == null) { e.preventDefault(); fire('plPick', i); return; }
    if ((e.key === 'Enter' || e.key === 'ArrowRight') && R.overlay.pick != null && !(document.activeElement && document.activeElement.matches('button'))) { e.preventDefault(); fire('plNext'); return; }
  }
  /* a dialog keeps focus inside it (FAMILY-STANDARD §3: the ☰ drawer traps focus) */
  if (e.key === 'Tab' && R.overlay) {
    const box = document.querySelector('.drawer, .ovbox');
    if (box) {
      const f = [...box.querySelectorAll('button:not([disabled]), a[href], input, select, [tabindex="0"]')].filter((x) => x.offsetParent !== null);
      if (f.length) {
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
      }
    }
  }
  if (R.overlay && R.overlay.kind === 'avDeck' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); fire('avdGo', e.key === 'ArrowLeft' ? -1 : 1); return; }
  if (e.key === 'Escape') {
    if (R.overlay) { const k = R.overlay.kind; R.overlay = null; render(); if (k === 'drawer') { const b = document.querySelector('[data-act="drawer"]'); if (b) b.focus(); } }
    else if (C() && C().learn.openCard) fire('closeCard');
    else if (R.shelf) fire('shelf', '');
  }
});
/* a swipe flips the avatar deck */
{ let sx = null;
  document.addEventListener('touchstart', (e) => { sx = e.target.closest && e.target.closest('.avdeck') ? e.touches[0].clientX : null; }, { passive: true });
  document.addEventListener('touchend', (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 45 && R.overlay && R.overlay.kind === 'avDeck') fire('avdGo', dx < 0 ? 1 : -1); }, { passive: true }); }
window.addEventListener('hashchange', () => {
  if (!R.s || !R.s.kids.length) return;
  /* Our own write, echoing back — not a person pressing back. */
  if (selfHash !== null && location.hash === selfHash) { selfHash = null; return; }
  selfHash = null;
  /* a tab or link opens its screen at the top (Home once opened 131px down, under the bar);
     a deep link that names one thing scrolls to that thing instead (focusNow) */
  if (readHash()) { R.overlay = null; if (R.game) quitGame(); const aimed = !!R.focus; render(); if (!aimed) window.scrollTo(0, 0); }
  else if (R.continueNow) { R.continueNow = false; R.overlay = null; if (R.game) quitGame(); R.s.ui.nav = 'home'; goContinue(); }
  else if (R.sheetNow) { const k = R.sheetNow, a = R.sheetArg; R.sheetNow = null; R.sheetArg = undefined; fire(k, a); }
});

/* ══ boot ═════════════════════════════════════════════════════════════ */
R.mode = Store.loadDevice('mode', null); R.text = Store.loadDevice('text', null); R.motion = Store.loadDevice('motion', null); R.rate = Store.loadDevice('rate', null);
R.calm = !!Store.loadDevice('calm', false); R.readAloud = Store.loadDevice('readAloud', true); R.version = VERSION;
audio.set({ volume: Store.loadDevice('volume', 0.4), music: Store.loadDevice('music', true) });
applyDevice(); applyRate();

/* ?demo: a sample household, labelled, never saved (demo.js, store.js). */
R.demo = /[?&]demo\b/.test(location.search);
R.s = R.demo ? demoState() : sim.load();
family.setDemo(R.demo, R.demo && R.s && R.s.demoCoins);
/* a generated question opened before generate.js arrived re-draws when it does */
whenGenReady(() => { if (R.s && R.s.kids.length) render(); });
/* the family's 20-coin "mastery" is paid only when mastery.js has the evidence:
   an idea kept after a gap, or used somewhere nobody asked (once each, per idea) */
mastery.listen((c, id, how) => { if (family.coins(c.name, 'mastery')) toast(how === 'retained' ? '+20 coins — you kept that one after a gap' : '+20 coins — you used it without being asked'); });
/* active minutes for the Hive (O3): the drop-in counts only a visible tab
   that was touched in the last two minutes, and never in the sample */
family.startActivity(() => (R.s && R.s.kids.length ? C().name : null));
if (R.s && R.s.kids.length) {
  setSound(R.s.settings.sound);
  setTester(!!R.s.settings.tester);
  sim.touchDay(sim.kid(R.s));
  readHash();
}
render();
if (R.continueNow && R.s && R.s.kids.length) { R.continueNow = false; R.s.ui.nav = 'home'; goContinue(); }
if (R.sheetNow && R.s && R.s.kids.length) { const k = R.sheetNow, x = R.sheetArg; R.sheetNow = null; R.sheetArg = undefined; fire(k, x); }

/* ══ My Feed (feed.js) ════════════════════════════════════════════════
   The family card's controls carry data-bzf, not data-act: an answer, and Continue after a
   wrong one. Buttons, so Enter and Space work as well as a tap; j/k and the arrows step card
   to card (bindFeedKeys). Nothing here plays a sound before a tap. */
bindFeedKeys();
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-bzf]'); if (!b || !R.s || !R.s.kids.length) return;
  e.preventDefault();
  const id = b.getAttribute('data-id');
  if (b.getAttribute('data-bzf') === 'ans') {
    const r = FEED.answer(C(), id, +b.getAttribute('data-o'));
    if (r === 'right') sfx.good(); else if (r === 'wrong') sfx.bad();
  } else FEED.cont(id);
  sim.save(R.s); render();
  const card = document.querySelector(`.bzf-card[data-id="${CSS.escape(id)}"]`);
  const f = card && (card.querySelector('[data-bzf="cont"]') || card);
  if (f) f.focus({ preventScroll: true });
});
on('feedToggle', () => {
  if (!R.gate) return;
  R.s.settings.feedOff = !R.s.settings.feedOff; sim.save(R.s);
  toast(R.s.settings.feedOff ? 'My Feed is off — the tab and the ☰ row are gone' : 'My Feed is on'); render();
});

/* Offline-first is a hard rule, so the shell caches itself when served over
   http. Skipped in the single-file build, which has nothing to fetch. */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.BZF_SINGLE) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      /* a newer build is installed behind the running one: say so once, with
         one tap to swap — Bee and India both carry this bar */
      const watch = (w) => { if (!w) return; w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) { R.update = w; render(); } }); };
      if (reg.waiting && navigator.serviceWorker.controller) { R.update = reg.waiting; render(); }
      reg.addEventListener('updatefound', () => watch(reg.installing));
    }).catch(() => {});
    /* reload only when a NEWER build replaces one already running: on a first visit the
       worker taking control fires this too, and the page used to reload itself under a
       child a moment after opening (audit v4's "execution context destroyed") */
    let swapped = false;
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (swapped || !hadController) return; swapped = true; location.reload(); });
  });
}
on('update', () => { if (R.update) { R.update.postMessage({ type: 'SKIP_WAITING' }); R.update = null; toast('Swapping to the new build…'); render(); } });
/* the browser offers to install; we keep the offer and put it in Settings */
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); R.install = e; if (R.overlay && R.overlay.kind === 'settings') render(); });
on('install', async () => { const e = R.install; if (!e) return; R.install = null; try { await e.prompt(); } catch (x) {} render(); });
on('about', () => { R.overlay = { kind: 'about' }; sfx.click(); render(); });
window.addEventListener('appinstalled', () => { R.install = null; toast('Installed'); });

window.BZF = { R, sim, quitGame, arcadeReady: arcadeMod, startJobGame: (id, q) => import('./jobgames.js').then((m) => m.startJobGame(id, q)), feed: FEED, ledger, mastery, decisions, letters: LETTERS, report: reportmod, reportcard, validate: () => validate(ALL_CARDS), objectives: OBJECTIVES,
  ambient, audio, looks: LOOKS, setTester, games: GAMES, catalogue: CATALOGUE, validateAvatars: () => validateAvatars(CATALOGUE), search: searchTown, mistakes,
  placement, cardById, genReady, genValue: (id) => { const k = cardById(id); return k && k.drill && k.drill.value; }, allCards: ALL_CARDS, fire, confetti, key: (id, qi) => shuffledDrill(cardById(id), qi || 0).answer };


/* ── six questions, one chapter (quiz.js) ─────────────────────────────── */
function quizView(o) {
  const ch = quiz.chapter(o.ch), c = C();
  const head = `<div class="eyebrow">${o.mode === 'testout' ? 'Test out' : 'Checkpoint'} · ${esc(ch.title)}</div>`;
  if (o.done) {
    const r = quiz.finish(c, o) || { pass: o.right >= quiz.passMark(o.items.length), pct: Math.round(o.right / o.items.length * 100) };
    return `${head}<h2 style="margin:4px 0 8px">${o.right} of ${o.items.length}</h2>
      <p class="small">${o.mode === 'testout'
        ? (r.pass ? `That is enough. <b>${esc(ch.title)}</b> is open — its cards are still there to read, and none of them are marked done, because you have not read them.` : `Not this time, and it cost nothing. Read one of its cards when the level arrives, or try again tomorrow — the questions will be different.`)
        : (r.pass ? `Checkpoint passed. The whole chapter, mixed up, and it held.` : `Not yet. The rail shows where to look — the cards you got wrong are worth a second read.`)}</p>
      <div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn sm" data-act="closeOv">${r.pass && o.mode === 'testout' ? 'Walk in →' : 'Back to the map'}</button></div>`;
  }
  const { dq } = quiz.current(o); const p = o.pick;
  return `${head}
    <div class="row" style="margin-top:4px"><span class="small muted grow">Question ${o.i + 1} of ${o.items.length}</span><span class="small muted tabnum">${o.right} right</span></div>
    <h3 style="font-size:18px;margin:8px 0 10px">${esc(dq.q)}</h3>
    <div class="stack" style="gap:8px">
      ${dq.opts.map((opt, i) => { let k = ''; if (p) k = i === dq.answer ? ' ok' : (i === p.i ? ' no' : '');
        return `<button class="opt${k}" data-act="quizPick" data-arg="${i}" ${p ? 'disabled' : ''}><span class="k">${'ABCD'[i]}</span>${esc(opt)}</button>`; }).join('')}
    </div>
    ${p ? `<div style="background:${p.ok ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:12px 14px;font-size:14px;margin-top:10px"><b>${p.ok ? 'That\'s it.' : 'Not quite —'}</b> ${esc(p.why)}</div>
      <button class="btn wide" style="margin-top:12px" data-act="quizNext">${o.i + 1 >= o.items.length ? 'See how it went →' : 'Next question →'}</button>` : ''}`;
}
on('testout', (chId) => { const o = quiz.start(chId, 'testout'); if (!o || !o.items.length) return; R.overlay = o; sfx.click(); render(); });
on('checkpoint', (chId) => { const o = quiz.start(chId, 'checkpoint'); if (!o || !o.items.length) return; R.overlay = o; sfx.click(); render(); });
on('quizPick', (i) => { const o = R.overlay; if (!o || o.kind !== 'quiz') return; quiz.answer(o, i); if (o.pick.ok) sfx.good(); else sfx.bad(); render(); });
on('quizNext', () => { const o = R.overlay; if (!o || o.kind !== 'quiz') return; quiz.next(o); if (o.done) { const r = quiz.finish(C(), o); sim.save(R.s); if (r && r.pass) { sfx.level(); confetti(40); } } render(); });

/* ── the cast, as cards (India's avatar cards, Bee's trading cards) ──── */
/* LORE lives in content.js now, so My Feed's build can cut the cast's lines from it */
function castCard(who) {
  const p = CAST[who] || CAST.pip, l = LORE[who] || LORE.pip;
  return `<div style="text-align:center">${face(who, 120)}</div>
    <div class="eyebrow" style="text-align:center;margin-top:10px">Someone you've met</div>
    <h2 style="text-align:center;margin:2px 0 2px">${esc(p.name)}</h2>
    <p class="small muted" style="text-align:center">${esc(p.role)}</p>
    <p class="small" style="margin-top:12px">${esc(l.line)}</p>
    <div class="aside" style="margin-top:10px"><span class="eyebrow">In their words</span>“${esc(l.quote)}” <span class="small muted">— ${esc(p.name)}</span></div>
    <p class="small muted" style="margin-top:10px">${esc(l.why)}</p>
    <div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn sm" data-act="closeOv">Back</button></div>`;
}
on('castCard', (who) => { R.overlay = { kind: 'cast', who }; sfx.click(); render(); });
on('obStart', () => { draft.go = true; render(); window.scrollTo(0, 0); });

/* ── report a problem: on this device, until it is copied out (Bee's bug tab) ── */
const BUG_CATS = ['Something broke', 'Looks wrong', 'A number or a word', 'An idea'];
function bugSheet() {
  const list = Store.loadDevice('bugs', []);
  const cat = R.bugCat || BUG_CATS[0];
  return `<div class="eyebrow">Something not right?</div><h2 style="margin:4px 0 6px">Note it here</h2>
    <p class="small muted">Saved on this device only. Copy them out to send them on — nothing is sent by the app.</p>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:10px">${BUG_CATS.map((k) => `<button class="wchip${cat === k ? ' hot' : ''}" data-act="bugCat" data-arg="${k}">${k}</button>`).join('')}</div>
    <textarea class="field" data-field="bugtext" rows="3" placeholder="What happened, and where?" style="width:100%;margin-top:10px;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface);font:inherit;font-size:14px">${esc(R.fields.bugtext || '')}</textarea>
    <div class="row" style="gap:8px;margin-top:10px"><span class="grow"></span><button class="btn sm" data-act="bugSave">Save note</button></div>
    ${list.length ? `<div class="sect"><b>${list.length} saved</b><i></i></div>
      <div class="rows" style="margin:0 -22px">${list.slice(-8).reverse().map((b) => `<div class="qrow"><span class="grow"><b style="font-size:13.5px">${esc(b.cat)}</b> <span class="small muted">· ${esc(b.where)} · ${new Date(b.t).toLocaleDateString()}</span><div class="small">${esc(b.text)}</div></span></div>`).join('')}</div>
      <div class="row" style="gap:8px;margin-top:10px"><button class="btn ghost sm" data-act="bugCopy">Copy all</button><button class="btn ghost sm" data-act="bugClear">Clear</button><span class="grow"></span><button class="btn ghost sm" data-act="closeOv">Done</button></div>`
    : `<div class="row" style="margin-top:12px"><span class="grow"></span><button class="btn ghost sm" data-act="closeOv">Done</button></div>`}`;
}
on('bug', () => { R.overlay = { kind: 'bug' }; sfx.click(); render(); });
on('bugCat', (k) => { R.bugCat = k; render(); });
on('bugSave', () => {
  const text = (R.fields.bugtext || '').trim(); if (!text) { toast('Write a line first'); return; }
  const list = Store.loadDevice('bugs', []);
  list.push({ t: Date.now(), cat: R.bugCat || BUG_CATS[0], text, where: location.hash || '#/', build: VERSION, size: innerWidth + '×' + innerHeight });
  Store.saveDevice('bugs', list.slice(-60)); R.fields.bugtext = ''; toast('Saved on this device'); sfx.good(); render();
});
on('bugCopy', async () => {
  const list = Store.loadDevice('bugs', []);
  const txt = list.map((b) => `[${new Date(b.t).toISOString()}] ${b.cat} · ${b.where} · build ${b.build} · ${b.size}\n${b.text}`).join('\n\n');
  try { await navigator.clipboard.writeText(txt); toast('Copied'); } catch (e) { toast('Could not copy on this device'); }
});
on('bugClear', () => { Store.saveDevice('bugs', []); render(); });


/* ── where a number comes from (sources.js) ───────────────────────────── */
function sourcesSheet(key) {
  const one = srcs.source(key);
  const row = (k, v) => `<div class="qrow block">
    <div class="row"><b class="grow" style="font-size:14.5px">${esc(v.what)}</b>
      <span class="pill ${v.kind === 'own' ? '' : 'gold'}">${v.kind === 'own' ? "the town's own" : 'cited'}</span></div>
    <div class="small" style="margin-top:2px"><b>${esc(v.value())}</b></div>
    <p class="small muted" style="margin-top:4px">${esc(v.says)}</p>
    <div class="small muted" style="margin-top:4px;font-family:var(--mono);font-size:11px">${esc(v.where)}</div>
  </div>`;
  return `<div class="eyebrow">Where this comes from</div>
    <h2 style="margin:4px 0 6px">${one ? esc(one.what) : 'Every number in Bizzington'}</h2>
    <p class="small muted">Rule six of this app: never teach a number from memory. Every figure below is either a dial of this town, said plainly, or a real figure with a real citation.</p>
    <div class="rows" style="margin:10px -22px 0">
      ${(one ? [[key, one]] : srcs.ownNumbers()).map(([k, v]) => row(k, v)).join('')}
    </div>
    ${one ? `<div class="row" style="margin-top:12px"><button class="btn ghost sm" data-act="sources">See all of them</button><span class="grow"></span><button class="btn sm" data-act="closeOv">Done</button></div>`
      : `<p class="small muted" style="margin-top:12px">${srcs.cited().length ? '' : 'Nothing in the app currently states a real-world figure. When one does, its citation appears here before the number appears on screen.'}</p>
         <div class="row" style="margin-top:12px"><span class="grow"></span><button class="btn sm" data-act="closeOv">Done</button></div>`}`;
}
on('sources', (key) => { R.overlay = { kind: 'sources', key: key || '' }; sfx.click(); render(); });


/* ══ today's till ═════════════════════════════════════════════════════ */
on('till', () => {
  const c = C(), v = (R.fields.till || '').replace(/[^0-9]/g, '');
  if (!v) { toast('Type what one cost'); return; }
  /* the field is in the child's own currency; the puzzle is in price units */
  const r = puz.guess(c, Math.round(Number(v) / (price(1) || 1)));
  if (r.bad) { toast('A number, in ' + CURRENCIES[c.currency].sign); return; }
  R.fields.till = '';
  if (r.won) { sfx.level(); confetti(40); toast(r.paid ? 'Right — and ' + money(r.paid) + ' for the working' : 'Right'); }
  else if (r.done) { sfx.bad(); toast('That was the last try — here is how it works out'); }
  else { sfx.click(); toast(r.near ? 'Close' : 'Not that one'); }
  sim.save(R.s); render();
});
on('tillShare', async () => {
  const t = puz.share(C(), null); if (!t) return;
  try { await navigator.clipboard.writeText(t); toast('Copied — it gives nothing away'); }
  catch (e) { toast('Could not copy on this device'); }
});

/* ══ the maths check, as a game: help Pip count the stall's takings (audit A6) ══
   placement.js still asks the same twelve questions in the same order and stops at two
   wrong in a row — it measures exactly what it measured. Only the dress is new: Pip, the
   stall, a drawn icon for each sum, a trail of stepping stones instead of "question 4 of
   12", and an ending with no score at all. The trail never marks right or wrong, and the
   end never says how far anyone got: it is a ceiling, never a mark (CLAUDE.md). What the
   town now fits to is on the grown-ups' page, and nowhere a child reads it. */
const PL_FRAME = {
  M1: ['abacus', 'Three tins of coins sit on the counter.'],
  M2: ['receipt', 'Two customers have paid at the stall.'],
  M3: ['wallet', 'Pip takes some coins to market for the stall.'],
  M4: ['handshake', 'Pip and Mags are sharing the morning’s takings.'],
  M5: ['basket', 'A customer’s basket comes to the till.'],
  M6: ['cart', 'Someone wants more than one of the same thing.'],
  M7: ['jars', 'Pip puts part of the takings in his jars.'],
  M8: ['family', 'Four friends ran the stall together today.'],
  M9: ['calendar', 'Pip is saving for a new awning for the stall.'],
  M10: ['bank', 'The stall’s savings sit in the Bizzington bank.'],
  M11: ['seed', 'Pip leaves the stall’s savings to grow.'],
  M12: ['tree', 'Last one — a long, slow grow.'],
};
function plTrail(o) {
  /* stepping stones, lit as they are walked — never coloured by right or wrong */
  return `<ol class="pltrail" aria-label="The road to the end of the count">${placement.RUNGS.map((_, i) =>
    `<li class="${i < o.i ? 'walked' : i === o.i ? 'here' : ''}">${i === o.i ? shell.pipPose('head', 26) : ''}</li>`).join('')}</ol>`;
}
function placementView(o) {
  const c = C();
  if (o.done) {
    placement.finish(c, o);
    return `<div class="plgame plend" style="text-align:center">
      <div class="endfig">${shell.pipPose('cheer', 120, 'Pip, cheering')}</div>
      <div class="eyebrow">The stall is counted</div>
      <h2 style="margin:4px 0 8px;font-size:26px">Thank you, ${esc(c.name)}!</h2>
      <p>Pip has the takings counted, and now he knows how to set the town up to fit you.</p>
      <p class="small muted" style="margin-top:8px">No score — it was never a test. Grown-ups can see what it changed on their page.</p>
      <button class="btn wide" style="margin-top:14px" data-act="closeOv">Off you go →</button></div>`;
  }
  const q = placement.current(o), p = o.pick, fr = PL_FRAME[q.m] || ['coin', ''];
  return `<div class="plgame">
    <div class="plhead">${shell.pipPose(p ? (p.ok ? 'cheer' : 'think') : o.i ? 'point' : 'wave', 72, 'Pip')}
      <div><div class="eyebrow">Help Pip count the stall’s takings</div>
      <p class="small muted" style="margin-top:2px">${o.i ? 'Take your time — there is no clock.' : 'Pip is counting up after market. Help him with a few sums — there is no clock, and it ends by itself.'}</p></div></div>
    ${plTrail(o)}
    <div class="plscene"><span class="plico">${ico(fr[0], '', 34)}</span><span>${esc(fr[1])}</span></div>
    <h3 style="font-size:19px;margin:10px 0 10px">${esc(q.q)}</h3>
    <div class="stack" style="gap:8px">
      ${q.opts.map((opt, i) => { let k = ''; if (p) k = i === q.a ? ' ok' : (i === p.i ? ' no' : '');
        return `<button class="opt${k}" data-act="plPick" data-arg="${i}" ${p ? 'disabled' : ''}><span class="k">${'ABCD'[i]}</span>${esc(opt)}</button>`; }).join('')}
    </div>
    ${p ? `<div class="fb ${p.ok ? 'yes' : 'hold'}" role="status"><b>${p.ok ? 'That’s it!' : 'Good try.'}</b> ${esc(p.why)}</div>
      <button class="btn wide" style="margin-top:12px" data-act="plNext">On we go →</button>` : ''}
  </div>`;
}
on('placement', () => { R.overlay = placement.start(); sfx.click(); render(); });
on('plPick', (i) => { const o = R.overlay; if (!o || o.kind !== 'placement') return; placement.answer(o, i); if (o.pick.ok) sfx.good(); else sfx.click(); render(); });
on('plNext', () => {
  const o = R.overlay; if (!o || o.kind !== 'placement') return;
  placement.next(o);
  if (o.done) { const c = C(); placement.finish(c, o); sim.badge(c, 'placed'); sim.save(R.s); sfx.level(); }
  render();
});

/* ══ backup, and consent for a server that does not exist yet ═════════ */
on('bkSave', () => {
  const text = backup.toFile(R.s), name = backup.fileName(R.s);
  try {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('Saved as ' + name);
  } catch (e) { toast('This device would not save the file'); }
});
on('bkLoad', () => {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
  inp.onchange = () => {
    const f = inp.files && inp.files[0]; if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      const r = backup.fromFile(String(fr.result));
      if (!r.ok) { toast(r.why); sfx.bad(); return; }
      if (!confirm(`Restore ${r.kids} ${r.kids === 1 ? 'child' : 'children'} from this backup? Everything on this device is replaced.`)) return;
      R.s = r.state; sim.save(R.s); setCurrency(C().currency); setTester(!!R.s.settings.tester);
      R.s.ui = { nav: 'home', sub: 'wallet' }; sfx.level(); toast('Restored'); render();
    };
    fr.readAsText(f);
  };
  inp.click();
});
on('consent', () => {
  const on2 = !backup.consented(R.s);
  if (!on2 && !confirm('Turn cloud backup off? When a server exists, this deletes whatever was uploaded rather than just stopping.')) return;
  backup.consent(R.s, on2); sim.save(R.s);
  toast(on2 ? 'Allowed — nothing is uploaded today, because there is nowhere to upload to' : 'Not allowed');
  sfx.click(); render();
});

/* ══ the week's answer, recorded ══════════════════════════════════════ */
let recTick = null;
on('recStart', async () => {
  try {
    await answers.begin();
    R.rec = { secs: 0 };
    clearInterval(recTick);
    recTick = setInterval(() => {
      if (!R.rec) return clearInterval(recTick);
      R.rec.secs = answers.elapsed();
      const el = document.querySelector('.reclive + .small'); if (el) el.textContent = Math.floor(R.rec.secs) + 's';
      if (R.rec.secs >= answers.MAX_SECONDS) fire('recStop');
    }, 250);
    render();
  } catch (e) {
    const why = /NotAllowed|Permission/i.test(String(e && e.name) + String(e && e.message)) ? 'The microphone was not allowed'
      : /NotFound|Devices/i.test(String(e && e.name)) ? 'No microphone on this device'
      : 'The microphone would not start';
    toast(why); sfx.bad();
  }
});
on('recStop', async () => {
  clearInterval(recTick); const blob = await answers.stop(); R.rec = null;
  if (!blob || !blob.size) { toast('Nothing was recorded'); render(); return; }
  const rec = await answers.keep(C(), blob, R.fields.recwho);
  if (rec) { R.fields.recwho = ''; sim.save(R.s); sfx.good(); toast('Kept on this device'); }
  render();
});
on('recCancel', () => { clearInterval(recTick); answers.cancel(); R.rec = null; toast('Thrown away'); render(); });
on('recPlay', async (id) => {
  const url = await answers.url(id);
  if (!url) { toast('That recording is gone'); return; }
  const a = new Audio(url); a.play().catch(() => toast('This device would not play it'));
  a.onended = () => URL.revokeObjectURL(url);
  answers.played(C(), id); sim.save(R.s); render();
});
on('recDel', async (id) => {
  if (!confirm('Delete this recording? It cannot be brought back.')) return;
  await answers.remove(C(), id); sim.save(R.s); toast('Deleted'); render();
});
