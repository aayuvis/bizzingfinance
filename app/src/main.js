/* main.js — boot, shell, routing, and every action in one table.
   state -> render() -> string -> innerHTML; clicks dispatch by [data-act]. */

import { esc, on, bindRoot, fire, toast, sfx, confetti, setSound } from './ui.js';
import { money, price, setCurrency, CURRENCIES, weekday } from './fmt.js';
import { say, CAST } from './art.js';
import { PLACES } from './town.js';
import { ALL_CARDS, LETTERS, SHOP, ASSETS, CHAPTERS, BADGES, STOCK, HOMES, WORLDS, QUESTS, FIXES,
  rankFor, rankObj, shuffledDrill, chapterDone, isOpen as chapterOpen, needFor } from './content.js';
import * as sim from './sim.js';
import * as ledger from './ledger.js';
import * as mastery from './mastery.js';
import * as decisions from './decisions.js';
import * as reportmod from './report.js';
import { startJobGame, hasJobGame } from './jobgames.js';
import { validate } from './objectives.js';
import { OBJECTIVES, NEW_CARD_LIST, objective, assessCard, teachCard } from './objectives.js';
import { R } from './runtime.js';
import { viewOnboard, viewHome, viewLearn, viewMoney, viewStore, viewProgress,
  viewParents, viewCollection, viewWorlds, viewGate, viewReport } from './views.js';
import { viewArcade, startGame, quitGame, GAME_ACTS, GAMES } from './arcade.js';

const root = document.getElementById('app');
let draft = { step: 0 };
/* The hash we wrote ourselves. `hashchange` fires ASYNCHRONOUSLY, so a flag
   set and cleared inside writeHash() is already false by the time the event
   arrives — the app then reads its own navigation as a back-button press.
   Remembering the value instead survives the gap. This was invisible while
   games could only start from the tab they lived in; the moment a job could
   be started from Home it quit itself before the first frame. */
let selfHash = null;

const TABS = [
  { k: 'home', n: 'Home', g: '🏘️' }, { k: 'learn', n: 'Learn', g: '📗' },
  { k: 'money', n: 'Money', g: '🪙' }, { k: 'arcade', n: 'Arcade', g: '🎮' },
  { k: 'store', n: 'Store', g: '🛒' }, { k: 'progress', n: 'Progress', g: '📈' },
  { k: 'collection', n: 'Collection', g: '🏅' },
];
const EXTRA = [{ k: 'worlds', n: 'Worlds', g: '🗺️' }, { k: 'parents', n: "Grown-up's page", g: '👪' }];
const SPROUT = ['home', 'learn', 'money', 'arcade'];

/* ══ routing ══════════════════════════════════════════════════════════
   The back button is not a nice-to-have on a phone; it is how people leave
   a screen. Nav lives in the hash so it works. */
function writeHash() {
  if (!R.s || !R.s.kids.length) return;
  const u = R.s.ui;
  const h = '#/' + u.nav + (u.nav === 'money' ? '/' + u.sub : '');
  if (location.hash !== h) { selfHash = h; location.hash = h; }
}
function readHash() {
  const m = (location.hash || '').replace(/^#\/?/, '').split('/');
  if (!m[0]) return false;
  const known = TABS.map((t) => t.k).concat(['parents', 'worlds', 'report']);
  if (known.indexOf(m[0]) < 0) return false;
  R.s.ui.nav = m[0];
  if (m[0] === 'money' && m[1]) R.s.ui.sub = m[1];
  return true;
}

/* ══ shell ════════════════════════════════════════════════════════════ */
function render() {
  const s = R.s;
  if (!s || !s.kids.length || R.adding) { root.innerHTML = `<div class="content">${viewOnboard(draft)}</div>`; return; }
  const c = sim.kid(s);
  const sprout = c.band === 'sprout';
  const tabs = sprout ? TABS.filter((t) => SPROUT.includes(t.k)) : TABS;

  const body =
    s.ui.nav === 'learn' ? viewLearn() :
    s.ui.nav === 'money' ? viewMoney() :
    s.ui.nav === 'arcade' ? viewArcade() :
    s.ui.nav === 'store' ? viewStore() :
    s.ui.nav === 'progress' ? viewProgress() :
    s.ui.nav === 'parents' ? (s.parent.gate ? viewParents() : viewGate()) :
    s.ui.nav === 'report' ? (s.parent.gate ? viewReport() : viewGate()) :
    s.ui.nav === 'worlds' ? viewWorlds() :
    s.ui.nav === 'collection' ? viewCollection() : viewHome();

  const bar = sprout ? tabs : TABS.slice(0, 4).concat([{ k: 'more', n: 'More', g: '⋯' }]);

  root.innerHTML = `
    <header class="topbar">
      <div class="topbar-in">
        <button class="brand" data-act="nav" data-arg="home"><em>Bizzing</em> Finance</button>
        <button class="chip money" data-act="nav" data-arg="money"
          title="Your money — this opens the town's ledger, not the shop">${money(c.money.wallet)}</button>
        <span class="chip streak" title="Days in a row">🔥 ${c.streak.days.length}</span>
        <button class="iconbtn" data-act="mode" aria-label="Light or dark">${R.mode === 'dark' ? '☾' : '☀'}</button>
        <button class="iconbtn" data-act="nav" data-arg="parents" aria-label="Grown-up's page">👪</button>
      </div>
      <nav class="nav" aria-label="Sections">
        ${tabs.map((t) => `<button class="navbtn" data-act="nav" data-arg="${t.k}"
          aria-current="${s.ui.nav === t.k ? 'page' : 'false'}">${t.n}</button>`).join('')}
      </nav>
    </header>
    <main class="content">${sim.clockSuspect(s) ? clockWarning() : ''}${body}</main>
    <nav class="tabbar" aria-label="Primary">
      ${bar.map((t) => `<button data-act="${t.k === 'more' ? 'more' : 'nav'}" data-arg="${t.k}"
        aria-current="${s.ui.nav === t.k ? 'page' : 'false'}"><span class="gl">${t.g}</span><span>${t.n}</span></button>`).join('')}
    </nav>
    ${R.overlay ? overlay() : ''}`;
  /* string rendering blows the DOM away every frame, so a game with its own
     loop re-attaches here rather than holding a stale node */
  if (R.game && R.game.mount) R.game.mount();
  writeHash();
  sim.save(s);
}
R.render = render;

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
  const box = (inner, wide) => `<div class="ov" data-act="closeOv"><div class="ovbox${wide ? ' wide' : ''}" data-act="noop" role="dialog" aria-modal="true">${inner}</div></div>`;

  if (o.kind === 'letter') {
    const L = o.letter;
    const from = L.from === 'scam' ? null : CAST[L.from];
    return box(`
      <div class="row" style="gap:11px;margin-bottom:12px">
        <span style="width:46px;height:46px;flex:0 0 auto;border-radius:50%;overflow:hidden;border:1px solid var(--line);display:block;background:var(--surface2)">
          ${from ? from.svg : '<div style="display:grid;place-items:center;height:100%;font-size:22px">✉️</div>'}</span>
        <div class="grow"><div class="eyebrow">${from ? esc(from.name) : 'Sender unknown'}</div>
        <h3 style="font-size:19px">${esc(L.title)}</h3></div></div>
      <p style="font-size:15px;line-height:1.6;background:var(--tint);border-radius:var(--r-md);padding:13px 15px">${esc(L.body)}</p>
      ${o.result
        ? `<div style="margin-top:12px;background:${o.result.good ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:13px 15px;font-size:14px">${esc(o.result.note)}</div>
           <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">
             ${o.result.money ? `<span class="pill gold">${o.result.money > 0 ? '+' : '−'}${money(Math.abs(o.result.money))}</span>` : ''}
             <span class="pill grow">+${o.result.xp} XP</span>
             ${o.result.badge ? `<span class="pill gold">${BADGES[o.result.badge].em} ${esc(BADGES[o.result.badge].name)}</span>` : ''}</div>
           <button class="btn wide" style="margin-top:14px" data-act="closeOv">Back to the street</button>`
        : `<div class="stack" style="gap:8px;margin-top:14px">
            ${L.choices.map((ch, i) => `<button class="opt" data-act="letterPick" data-arg="${i}">${esc(ch.label)}</button>`).join('')}
           </div>`}`);
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

  if (o.kind === 'level') {
    const place = PLACES.find((p) => p.lv > o.from && p.lv <= o.level);
    const rank = rankObj(o.level);
    return box(`
      <div style="text-align:center">
        <div style="width:96px;height:96px;margin:0 auto 8px;border-radius:50%;overflow:hidden">${CAST.pip.svg}</div>
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
      <div style="text-align:center"><div style="font-size:46px">${w.em}</div>
        <div class="eyebrow">${esc(w.rank)}</div>
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

  if (o.kind === 'more') {
    const rest = TABS.filter((t) => !SPROUT.includes(t.k)).concat(EXTRA);
    return box(`<div class="eyebrow" style="margin-bottom:10px">Everything else</div>
      <div class="stack" style="gap:8px">
        ${rest.map((t) => `<button class="opt" data-act="nav" data-arg="${t.k}">${t.g} &nbsp;${t.n}</button>`).join('')}
      </div>`);
  }
  return '';
}

/* ══ actions ══════════════════════════════════════════════════════════ */
const C = () => sim.kid(R.s);

on('noop', () => {});
on('closeOv', () => { R.overlay = null; render(); });
on('more', () => { R.overlay = { kind: 'more' }; render(); });
on('nav', (k) => {
  R.overlay = null; R.shelf = '';
  if (R.game) quitGame();
  R.s.ui.nav = k;
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
on('mode', () => {
  R.mode = R.mode === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-mode', R.mode);
  try { localStorage.setItem('bzf_mode', R.mode); } catch (e) {}
  render();
});
on('sound', () => { R.s.settings.sound = !R.s.settings.sound; setSound(R.s.settings.sound); sfx.click(); render(); });

/* onboarding */
on('obNext', () => {
  const n = (R.fields.name || '').trim();
  if (!n) { toast('Type a name first'); return; }
  draft.name = n; draft.step = 1; sfx.click(); render();
});
on('obBand', (b) => { draft.band = b; draft.step = 2; sfx.click(); render(); });
on('obCancel', () => { draft = { step: 0 }; R.adding = false; render(); });
on('obCur', (cur) => {
  if (!R.s) R.s = sim.newState();
  const child = sim.newChild(draft.name, draft.band, cur);
  R.s.kids.push(child);
  R.s.active = R.s.kids.length - 1;
  R.s.ui = { nav: 'home', sub: 'wallet' };
  setCurrency(cur);
  R.fields = {}; draft = { step: 0 }; R.adding = false;
  sfx.level(); confetti(40); render();
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
  C().learn.openCard = id; C().learn.drill = null;
  sfx.click(); render(); window.scrollTo(0, 0);
});
/* Cards now come from three places: the chapters, the objectives file's own
   teaching cards, and generated retrieval items (id "CHOOSE-4#1"). One
   resolver so every caller stops caring which. */
function cardById(id) {
  if (!id) return null;
  const chapter = ALL_CARDS.find((x) => x.id === id);
  if (chapter) return chapter;
  const extra = NEW_CARD_LIST.find((x) => x.id === id);
  if (extra) return extra;
  const m = /^(.+)#(\d+)$/.exec(id);
  if (m) { const o = objective(m[1]); if (o) return assessCard(o, +m[2]); }
  return null;
}

on('closeCard', () => { C().learn.openCard = null; C().learn.drill = null; render(); });
on('answer', (i) => {
  const c = C(), card = cardById(c.learn.openCard);
  if (!card || (c.learn.drill && c.learn.drill.card === card.id)) return;
  const pick = +i;
  const right = pick === shuffledDrill(card).answer;
  c.learn.drill = { card: card.id, pick, right };
  if (right) sfx.good(); else sfx.bad();
  render();
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
  }

  /* Chapter progress only exists for chapter cards. */
  const ch = card.ch ? CHAPTERS.find((x) => x.id === card.ch) : null;
  c.learn.done[id] = true;
  if (first && ch) sim.questTick(c, 'lesson', 1);
  const res = sim.addXP(c, first ? (right ? 22 : 12) : 2);
  if (ch && ch.cards.every((k) => c.learn.done[k.id])) sim.badge(c, 'chapter-' + ch.id);
  c.learn.openCard = null; c.learn.drill = null;
  if (res.leveled) levelUp(res); else { toast('+' + res.gained + ' XP'); render(); }
});

/* Open the day's beat. */
on('beat', () => {
  const c = C();
  const bt = ledger.beat(c, ALL_CARDS, { mathsMet: ledger.mathsMet(c) });
  if (!bt) { toast('Nothing due today'); return; }
  if (bt.shape === 'teach') ledger.seen(c, bt.objective.id);
  c.learn.beat = { shape: bt.shape, obj: bt.objective.id, cardId: bt.card.id, answered: false };
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
  if (!s.parent.pin) { s.parent.pin = v; s.parent.gate = true; R.gateWrong = false; sim.save(s); toast('PIN set'); render(); return; }
  if (v === s.parent.pin) { s.parent.gate = true; R.gateWrong = false; render(); }
  else { R.gateWrong = true; sfx.bad(); render(); }
});
on('lock', () => { R.s.parent.gate = false; R.s.ui.nav = 'home'; toast('Locked'); render(); });
function levelUp(res) {
  sfx.level(); confetti(50);
  R.overlay = { kind: 'level', level: res.level, from: res.from };
  render();
}

/* postbox */
on('postbox', () => {
  const c = C();
  if (c.postbox.answered) { toast('Emptied — another one tomorrow'); return; }
  R.overlay = { kind: 'letter', letter: LETTERS[c.postbox.idx % LETTERS.length], result: null };
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
  const res = sim.addXP(c, ch.xp || 0);
  if (ch.badge) sim.badge(c, ch.badge);
  c.postbox.answered = true;
  c.postbox.log.push({ id: L.id, scam: !!L.scam, safe: !!ch.safe, t: Date.now() });
  sim.questTick(c, 'letter', 1);
  if (L.scam && ch.safe) sim.questTick(c, 'scam', 1);
  sim.stamp(c);
  R.overlay.result = { note: ch.note, money: delta, xp: ch.xp || 0, badge: ch.badge, good: !(L.scam && !ch.safe) };
  if (delta > 0) sfx.coin(); else if (L.scam && !ch.safe) sfx.bad(); else sfx.good();
  render();
  if (res.leveled) setTimeout(() => levelUp(res), 900);
});

/* the week */
on('payday', () => {
  const c = C();
  if (!sim.payDue(c, R.s)) { toast('Not yet — the bell rings on ' + weekday(c.money.nextPay)); return; }
  R.overlay = { kind: 'payday', res: sim.runPayDay(c, R.s) };
  sfx.bell(); confetti(30); render();
});
on('skipWeek', () => { sim.protoSkipWeek(C(), R.s); toast('Clock pushed to pay day'); fire('nav', 'home'); });
on('grantXP', () => {
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
    const g = startJobGame(id, () => { quitGame(); render(); });
    if (g) {
      if (R.game && R.game.stop) R.game.stop();
      R.game = g; R.s.ui.nav = 'arcade';
      sfx.click(); render(); window.scrollTo(0, 0);
      return;
    }
  }
  const a = sim.doJob(c, id);
  if (a) { sfx.coin(); toast('+' + money(a)); }
  render();
});

/* jars, goals */
on('jarIn', (k) => { sim.toJar(C(), k, price(2)) ? sfx.coin() : toast('Wallet is empty'); render(); });
on('jarOut', (k) => { sim.fromJar(C(), k, price(2)) ? sfx.click() : toast('That jar is empty'); render(); });
on('rule', (arg) => {
  const [k, d] = arg.split(':'), r = C().money.rules;
  r[k] = Math.max(0, Math.min(100, r[k] + +d));
  sfx.click(); render();
});
on('addGoal', () => {
  const n = (R.fields.goalName || '').trim();
  const a = parseInt(String(R.fields.goalAmt || '').replace(/[^0-9]/g, ''), 10);
  if (!n) { toast('Name it first'); return; }
  if (!a || a <= 0) { toast('How much does it cost?'); return; }
  sim.addGoal(C(), n, a);
  R.fields.goalName = ''; R.fields.goalAmt = '';
  sfx.good(); toast('Scaffolding up'); render();
});
on('fundGoal', (id) => {
  if (!sim.fundGoal(C(), id, price(5))) { toast('The Save jar is empty'); return; }
  const g = C().money.goals.find((x) => x.id === id);
  if (g && g.done) { sfx.level(); confetti(40); toast('Built it!'); } else sfx.coin();
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
on('bankIn', () => { sim.bankIn(C(), price(10)) ? sfx.coin() : toast('Nothing in the Save jar'); render(); });
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
on('repay', () => { const a = sim.repayLoan(C(), C().money.wallet); if (a) { sfx.coin(); toast('Repaid ' + money(a)); } render(); });

/* exchange */
on('buy', (id) => {
  if (!sim.buyAsset(C(), id, price(5))) { toast('Fill the Grow jar first'); return; }
  sfx.coin(); render();
});
on('sell', (id) => { sim.sellAsset(C(), id); sfx.click(); render(); });

/* bizz & co */
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
  }
  toast('Come back tomorrow — see if you still want it');
  sfx.click(); render();
});
on('buyItem', (id) => {
  const c = C(), it = SHOP.find((x) => x.id === id), p = price(it.units);
  let short = p - c.money.wallet;
  if (short > 0) {
    const take = Math.min(short, c.money.jars.spend);
    c.money.jars.spend -= take; c.money.wallet += take; short -= take;
  }
  if (short > 0) { toast('Not enough — even after the Spend jar'); sfx.bad(); return; }
  c.money.wallet -= p;
  sim.txn(c, 'out', p, it.name, 'shop');
  c.shop.owned.push(id);
  const goal = (c.money.goals || []).find((g) => !g.done);
  decisions.log(c, { objective: 'CHOOSE-2', surface: 'store', chose: 'buy', label: it.name,
    alternatives: goal ? [{ id: goal.id, cost: p, label: goal.name }] : [] });
  sim.stamp(c);
  sfx.coin(); toast(it.name + ' is yours'); render();
});

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
  startGame(id); render();
});
/* Leaving a game is when a child is most willing to read one card — so the
   lesson is offered here rather than filed in a tab they have to remember. */
on('gquit', () => {
  quitGame();
  const c = C();
  const next = ALL_CARDS.find((x) => !c.learn.done[x.id]
    && C().learn.level >= CHAPTERS.find((ch) => ch.id === x.ch).lv);
  if (next && Math.random() < 0.7) R.overlay = { kind: 'between', card: next };
  render();
});
GAME_ACTS.forEach((a) => { on(a, (arg) => { if (R.game && R.game.act) R.game.act(a, arg); }); });

/* ══ input plumbing ═══════════════════════════════════════════════════ */
bindRoot(document.body);
document.body.addEventListener('input', (e) => {
  const f = e.target.getAttribute && e.target.getAttribute('data-field');
  if (!f) return;
  R.fields[f] = e.target.value;
  if (e.target.getAttribute('data-live')) liveField(f, e.target.value);
});
document.body.addEventListener('change', (e) => {
  const f = e.target.getAttribute && e.target.getAttribute('data-field');
  if (f && e.target.getAttribute('data-live')) liveField(f, e.target.value);
});
function liveField(f, v) {
  if (f === 'query') { R.query = v; render(); requeue('query'); }
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
  if (R.game && R.game.key && !R.overlay) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)
      && document.activeElement && document.activeElement.tagName !== 'INPUT') e.preventDefault();
    R.game.key(e);
    return;
  }
  if (e.key === 'Escape' && R.overlay) { R.overlay = null; render(); }
});
window.addEventListener('hashchange', () => {
  if (!R.s || !R.s.kids.length) return;
  /* Our own write, echoing back — not a person pressing back. */
  if (selfHash !== null && location.hash === selfHash) { selfHash = null; return; }
  selfHash = null;
  if (readHash()) { R.overlay = null; if (R.game) quitGame(); render(); }
});

/* ══ boot ═════════════════════════════════════════════════════════════ */
try { R.mode = localStorage.getItem('bzf_mode') || null; } catch (e) { R.mode = null; }
if (R.mode) document.documentElement.setAttribute('data-mode', R.mode);

R.s = sim.load();
if (R.s && R.s.kids.length) {
  setSound(R.s.settings.sound);
  sim.touchDay(sim.kid(R.s));
  readHash();
}
render();

/* Offline-first is a hard rule, so the shell caches itself when served over
   http. Skipped in the single-file build, which has nothing to fetch. */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.BZF_SINGLE) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

window.BZF = { R, sim, ledger, mastery, decisions, report: reportmod, validate: () => validate(ALL_CARDS), objectives: OBJECTIVES,
  cardById, allCards: ALL_CARDS, fire, key: (id) => shuffledDrill(ALL_CARDS.find((c) => c.id === id)).answer };
