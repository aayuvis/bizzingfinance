/* main.js — boot, shell, and every action in one table.
   state -> render() -> string -> innerHTML; clicks dispatch by [data-act]. */

import { esc, on, bindRoot, fire, toast, sfx, confetti, setSound } from './ui.js';
import { money, price, setCurrency, CURRENCIES } from './fmt.js';
import { say, face, CAST } from './art.js';
import { PLACES } from './town.js';
import { ALL_CARDS, LETTERS, SHOP, ASSETS, CHAPTERS, BADGES, rankFor, shuffledDrill } from './content.js';
import * as sim from './sim.js';
import { R } from './runtime.js';
import { viewOnboard, viewHome, viewLearn, viewMoney, viewStore, viewProgress, viewCollection } from './views.js';
import { viewArcade, startGame, quitGame, GAMES } from './arcade.js';

const root = document.getElementById('app');
const fields = {};
let draft = { step: 0 };

/* ══ shell ════════════════════════════════════════════════════════════ */
const TABS = [
  { k: 'home', n: 'Home', g: '🏘️' }, { k: 'learn', n: 'Learn', g: '📗' },
  { k: 'money', n: 'Money', g: '🪙' }, { k: 'arcade', n: 'Arcade', g: '🎮' },
  { k: 'store', n: 'Store', g: '🛒' }, { k: 'progress', n: 'Progress', g: '📈' },
  { k: 'collection', n: 'Collection', g: '🏅' },
];
const SPROUT_TABS = ['home', 'learn', 'money', 'arcade'];

function render() {
  const s = R.s;
  if (!s) { root.innerHTML = `<div class="content">${viewOnboard(draft)}</div>`; return; }

  const tabs = s.child.band === 'sprout' ? TABS.filter((t) => SPROUT_TABS.includes(t.k)) : TABS;
  const body =
    s.nav === 'learn' ? viewLearn() :
    s.nav === 'money' ? viewMoney() :
    s.nav === 'arcade' ? viewArcade() :
    s.nav === 'store' ? viewStore() :
    s.nav === 'progress' ? viewProgress() :
    s.nav === 'collection' ? viewCollection() : viewHome();

  const bar = (s.child.band === 'sprout' ? tabs : TABS.slice(0, 4).concat([{ k: 'more', n: 'More', g: '⋯' }]));

  root.innerHTML = `
    <header class="topbar">
      <div class="topbar-in">
        <span class="brand"><em>Bizzing</em> Finance</span>
        <button class="chip money" data-act="nav" data-arg="money" title="Your money — opens the town's ledger, not the shop">
          ${money(s.money.wallet)}</button>
        <span class="chip streak" title="Days in a row">🔥 ${s.streak.days.length}</span>
        <button class="iconbtn" data-act="mode" aria-label="Light or dark">${R.mode === 'dark' ? '☾' : '☀'}</button>
        <button class="iconbtn" data-act="sound" aria-label="Sound on or off">${s.settings.sound ? '🔊' : '🔇'}</button>
      </div>
      <nav class="nav" aria-label="Sections">
        ${tabs.map((t) => `<button class="navbtn" data-act="nav" data-arg="${t.k}"
          aria-current="${s.nav === t.k ? 'page' : 'false'}">${t.n}</button>`).join('')}
      </nav>
    </header>
    <main class="content">${body}</main>
    <nav class="tabbar" aria-label="Primary">
      ${bar.map((t) => `<button data-act="${t.k === 'more' ? 'more' : 'nav'}" data-arg="${t.k}"
        aria-current="${s.nav === t.k ? 'page' : 'false'}"><span class="gl">${t.g}</span><span>${t.n}</span></button>`).join('')}
    </nav>
    ${R.overlay ? overlay() : ''}`;
  sim.save(s);
}
R.render = render;

/* ══ overlays ═════════════════════════════════════════════════════════ */
function overlay() {
  const o = R.overlay, s = R.s;
  const box = (inner, wide) => `<div class="ov" data-act="closeOv"><div class="ovbox${wide ? ' wide' : ''}" data-act="noop">${inner}</div></div>`;

  if (o.kind === 'letter') {
    const L = o.letter;
    const from = L.from === 'scam' ? null : CAST[L.from];
    return box(`
      <div class="row" style="gap:11px;margin-bottom:12px">
        <span class="who" style="width:46px;height:46px;flex:0 0 auto;border-radius:50%;overflow:hidden;border:1px solid var(--line);display:block;background:var(--surface2)">
          ${from ? from.svg : '<div style="display:grid;place-items:center;height:100%;font-size:22px">✉️</div>'}</span>
        <div class="grow"><div class="eyebrow">${from ? esc(from.name) : 'Sender unknown'}</div>
        <h3 style="font-size:19px">${esc(L.title)}</h3></div>
      </div>
      <p style="font-size:15px;line-height:1.6;background:var(--tint);border-radius:var(--r-md);padding:13px 15px">${esc(L.body)}</p>
      ${o.result
        ? `<div style="margin-top:12px;background:${o.result.good ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:13px 15px;font-size:14px">${esc(o.result.note)}</div>
           <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">
             ${o.result.money ? `<span class="pill gold">${o.result.money > 0 ? '+' : '−'}${money(Math.abs(o.result.money))}</span>` : ''}
             <span class="pill grow">+${o.result.xp} XP</span>
             ${o.result.badge ? `<span class="pill gold">${BADGES[o.result.badge].em} ${esc(BADGES[o.result.badge].name)}</span>` : ''}
           </div>
           <button class="btn wide" style="margin-top:14px" data-act="closeOv">Back to the street</button>`
        : `<div class="stack" style="gap:8px;margin-top:14px">
            ${L.choices.map((c, i) => `<button class="opt" data-act="letterPick" data-arg="${i}">${esc(c.label)}</button>`).join('')}
           </div>
           ${L.scam ? '' : ''}`}`);
  }

  if (o.kind === 'payday') {
    const p = o.res;
    return box(`
      <div style="text-align:center">
        <div style="font-size:44px">🔔</div>
        <div class="eyebrow">The bell rang</div>
        <h2 style="margin:4px 0 10px">Pay day in Bizzington</h2>
      </div>
      <div class="stack" style="gap:7px">
        <div class="row"><span class="grow">Wages</span><b style="color:var(--grow)">+${money(p.wage)}</b></div>
        ${p.bills.map((b) => `<div class="row"><span class="grow muted">${esc(b.name)}</span><b>−${money(b.amt)}</b></div>`).join('')}
        ${p.interest ? `<div class="row"><span class="grow">Bank interest</span><b style="color:var(--grow)">+${money(p.interest)}</b></div>` : ''}
        ${p.split ? `<div class="sep"></div>
          <div class="eyebrow">Your rule split it before you could think about it</div>
          ${Object.keys(p.split).map((k) => `<div class="row"><span class="grow muted">${k[0].toUpperCase() + k.slice(1)} jar</span><b>${money(p.split[k])}</b></div>`).join('')}` : ''}
      </div>
      <div class="sep" style="margin:12px 0"></div>
      <div class="row"><span class="grow" style="font-weight:800">In your pocket now</span><span class="big" style="font-size:22px">${money(R.s.money.wallet)}</span></div>
      ${say('pip', p.split ? 'Split before you could think about it. That is the point of a rule.' : 'Open the Jar Shed and set a rule — then this happens by itself.')}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Out into the market →</button>`);
  }

  if (o.kind === 'level') {
    const place = PLACES.find((p) => p.lv === o.level);
    return box(`
      <div style="text-align:center">
        <div style="width:96px;height:96px;margin:0 auto 8px;border-radius:50%;overflow:hidden">${CAST.pip.svg}</div>
        <div class="eyebrow">Level ${o.level} · ${rankFor(o.level)}</div>
        <h2 style="margin:4px 0 8px;font-size:28px">${place ? esc(place.name) + ' is open' : 'Level up'}</h2>
        <p class="muted">${place ? esc(place.blurb) : 'The street just got longer.'}</p>
        ${place ? `<button class="btn wide" style="margin-top:16px" data-act="goPlace" data-arg="${place.key}">Go and look →</button>` : ''}
        <button class="${place ? 'small muted' : 'btn wide'}" style="margin-top:10px;width:100%;text-align:center" data-act="closeOv">${place ? 'Later' : 'Keep going'}</button>
      </div>`);
  }

  if (o.kind === 'more') {
    const rest = TABS.filter((t) => !SPROUT_TABS.includes(t.k));
    return box(`<div class="eyebrow" style="margin-bottom:10px">Everything else</div>
      <div class="stack" style="gap:8px">
        ${rest.map((t) => `<button class="opt" data-act="nav" data-arg="${t.k}">${t.g} &nbsp;${t.n}</button>`).join('')}
      </div>`);
  }
  return '';
}

/* ══ actions ══════════════════════════════════════════════════════════ */
on('noop', () => {});
on('closeOv', () => { R.overlay = null; render(); });
on('more', () => { R.overlay = { kind: 'more' }; render(); });
on('nav', (k) => {
  R.overlay = null;
  if (R.game) quitGame();
  R.s.nav = k; R.s.learn.openCard = null;
  sfx.click(); render(); window.scrollTo(0, 0);
});
on('sub', (k) => { R.s.sub = k; sfx.click(); render(); });
on('locked', (lv) => toast(`Opens at level ${lv} — keep learning`));
on('mode', () => {
  R.mode = R.mode === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-mode', R.mode);
  try { localStorage.setItem('bzf_mode', R.mode); } catch (e) {}
  render();
});
on('sound', () => { R.s.settings.sound = !R.s.settings.sound; setSound(R.s.settings.sound); sfx.click(); render(); });

/* onboarding */
on('obNext', () => {
  const n = (fields.name || '').trim();
  if (!n) { toast('Type a name first'); return; }
  draft.name = n; draft.step = 1; sfx.click(); render();
});
on('obBand', (b) => { draft.band = b; draft.step = 2; sfx.click(); render(); });
on('obCur', (c) => {
  R.s = sim.newState(draft.name, draft.band, c);
  setCurrency(c);
  sfx.level(); confetti(40);
  render();
});

/* town */
on('town', (key) => {
  const p = PLACES.find((x) => x.key === key);
  if (!p) return;
  if (R.s.learn.level < p.lv) { toast(`${p.name} opens at level ${p.lv}`); sfx.bad(); return; }
  R.s.nav = 'money'; R.s.sub = p.sub; sfx.click(); render(); window.scrollTo(0, 0);
});
on('goPlace', (key) => { R.overlay = null; fire('town', key); });

/* learn */
on('card', (id) => { R.s.nav = 'learn'; R.s.learn.openCard = id; R.s.learn.drill = null; sfx.click(); render(); window.scrollTo(0, 0); });
on('closeCard', () => { R.s.learn.openCard = null; R.s.learn.drill = null; render(); });
on('answer', (i) => {
  const s = R.s, c = ALL_CARDS.find((x) => x.id === s.learn.openCard);
  if (!c || (s.learn.drill && s.learn.drill.card === c.id)) return;
  const pick = +i;
  const right = pick === shuffledDrill(c).answer;
  s.learn.drill = { card: c.id, pick, right };
  if (right) sfx.good(); else sfx.bad();
  render();
});
on('cardDone', (id) => {
  const s = R.s, c = ALL_CARDS.find((x) => x.id === id);
  if (!c) return;
  const right = !!(s.learn.drill && s.learn.drill.right);
  const first = !s.learn.done[id];
  s.learn.done[id] = true;
  const res = sim.addXP(s, first ? (right ? 22 : 12) : 2);
  const ch = CHAPTERS.find((x) => x.id === c.ch);
  if (ch.cards.every((k) => s.learn.done[k.id])) sim.badge(s, 'chapter-' + ch.id.slice(1));
  s.learn.openCard = null; s.learn.drill = null;
  if (res.leveled) { levelUp(res.level); } else { toast('+' + res.gained + ' XP'); render(); }
});
function levelUp(level) {
  sfx.level(); confetti(50);
  R.overlay = { kind: 'level', level };
  render();
}

/* postbox */
on('postbox', () => {
  const s = R.s;
  if (s.postbox.answered) { toast('Emptied — another one tomorrow'); return; }
  const L = LETTERS[s.postbox.idx % LETTERS.length];
  R.overlay = { kind: 'letter', letter: L, result: null };
  sfx.click(); render();
});
on('letterPick', (i) => {
  const s = R.s, L = R.overlay.letter, c = L.choices[+i];
  let delta = 0;
  if (c.wallet) {
    const amt = price(Math.abs(c.wallet));
    if (c.wallet > 0) { sim.earn(s, amt, L.title, 'letter'); delta = amt; }
    else { sim.spend(s, amt, L.title, 'letter'); delta = -amt; }
  }
  const res = sim.addXP(s, c.xp || 0);
  if (c.badge) sim.badge(s, c.badge);
  s.postbox.answered = true;
  s.postbox.log.push({ id: L.id, scam: !!L.scam, safe: !!(L.scam && c.badge) });
  R.overlay.result = { note: c.note, money: delta, xp: c.xp || 0, badge: c.badge, good: !(L.scam && !c.badge) };
  if (delta > 0) sfx.coin(); else if (L.scam && !c.badge) sfx.bad(); else sfx.good();
  render();
  if (res.leveled) setTimeout(() => levelUp(res.level), 900);
});

/* pay day */
on('payday', () => {
  const s = R.s;
  if (!sim.payDue(s)) { toast('Not yet — the bell rings on Friday'); return; }
  const res = sim.runPayDay(s);
  R.overlay = { kind: 'payday', res };
  sfx.bell(); confetti(30); render();
});
on('skipWeek', () => { sim.protoSkipWeek(R.s); toast('Clock pushed to pay day'); R.s.nav = 'home'; render(); });
on('wipe', () => {
  if (!confirm('Start Bizzington over? Everything in this town goes.')) return;
  try { localStorage.removeItem('bzf_v1'); } catch (e) {}
  R.s = null; draft = { step: 0 }; render();
});

/* jars, goals, bank */
on('jarIn', (k) => { const a = sim.toJar(R.s, k, price(2)); a ? sfx.coin() : toast('Wallet is empty'); render(); });
on('jarOut', (k) => { const a = sim.fromJar(R.s, k, price(2)); a ? sfx.click() : toast('That jar is empty'); render(); });
on('rule', (arg) => {
  const [k, d] = arg.split(':');
  const r = R.s.money.rules;
  r[k] = Math.max(0, Math.min(100, r[k] + +d));
  sfx.click(); render();
});
on('addGoal', () => {
  const n = (fields.goalName || '').trim();
  const a = parseInt(String(fields.goalAmt || '').replace(/[^0-9]/g, ''), 10);
  if (!n) { toast('Name it first'); return; }
  if (!a || a <= 0) { toast('How much does it cost?'); return; }
  sim.addGoal(R.s, n, a);
  fields.goalName = ''; fields.goalAmt = '';
  sfx.good(); toast('Scaffolding up'); render();
});
on('fundGoal', (id) => {
  const a = sim.fundGoal(R.s, id, price(5));
  if (!a) { toast('The Save jar is empty'); return; }
  const g = R.s.money.goals.find((x) => x.id === id);
  if (g && g.done) { sfx.level(); confetti(40); toast('Built it!'); } else sfx.coin();
  render();
});
on('raidGoal', (id) => { const a = sim.raidGoal(R.s, id); if (a) { sfx.bad(); toast('Scaffolding came down'); } render(); });
on('bankIn', () => {
  const s = R.s, a = Math.min(price(10), s.money.jars.save);
  if (a <= 0) { toast('Nothing in the Save jar'); return; }
  s.money.jars.save -= a; s.money.bank.balance += a; s.money.bank.opened = true;
  sim.txn(s, 'out', a, 'Into the bank', 'bank'); sfx.coin(); render();
});
on('bankOut', () => {
  const s = R.s, a = Math.min(price(10), s.money.bank.balance);
  if (a <= 0) return;
  s.money.bank.balance -= a; s.money.jars.save += a;
  sim.txn(s, 'in', a, 'Out of the bank', 'bank'); sfx.click(); render();
});

/* exchange */
on('buy', (id) => {
  const s = R.s, spend = price(5);
  if (s.money.jars.grow < spend) { toast('Buy from the Grow jar — it needs filling first'); return; }
  if (!s.market.cup) s.market.cup = { cash: 0, units: {} };
  const p = s.market.series[id][s.market.step];
  s.money.jars.grow -= spend;
  s.market.cup.units[id] = (s.market.cup.units[id] || 0) + spend / p;
  sim.txn(s, 'out', spend, 'Bought ' + ASSETS.find((a) => a.id === id).name, 'invest');
  sfx.coin(); render();
});
on('sell', (id) => {
  const s = R.s, u = (s.market.cup && s.market.cup.units[id]) || 0;
  if (u <= 0) return;
  const v = Math.round(u * s.market.series[id][s.market.step]);
  s.market.cup.units[id] = 0; s.money.jars.grow += v;
  sim.txn(s, 'in', v, 'Sold ' + ASSETS.find((a) => a.id === id).name, 'invest');
  sfx.click(); render();
});

/* store */
on('buyItem', (id) => {
  const s = R.s, it = SHOP.find((x) => x.id === id), p = price(it.units);
  let short = p - s.money.wallet;
  if (short > 0) {
    const take = Math.min(short, s.money.jars.spend);
    s.money.jars.spend -= take; s.money.wallet += take;
    short -= take;
  }
  if (short > 0) { toast('Not enough — even after the Spend jar'); sfx.bad(); return; }
  s.money.wallet -= p;
  sim.txn(s, 'out', p, it.name, 'shop');
  s.shop.owned.push(id);
  sfx.coin(); toast(it.name + ' is yours'); render();
});

/* arcade */
on('game', (id) => { startGame(id); render(); });
on('gquit', () => { quitGame(); render(); });
['nwNeed', 'nwWant', 'bbPay', 'bbSkip', 'mcAdj', 'mcNext', 'mcSel'].forEach((a) => {
  on(a, (arg) => { if (R.game && R.game.act) R.game.act(a, arg); });
});

/* ══ boot ═════════════════════════════════════════════════════════════ */
bindRoot(document.body);
document.body.addEventListener('input', (e) => {
  const f = e.target.getAttribute && e.target.getAttribute('data-field');
  if (f) fields[f] = e.target.value;
});
document.addEventListener('keydown', (e) => {
  if (R.game && R.game.key && !R.overlay) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) e.preventDefault();
    R.game.key(e);
    return;
  }
  if (e.key === 'Escape' && R.overlay) { R.overlay = null; render(); }
});

try { R.mode = localStorage.getItem('bzf_mode') || null; } catch (e) { R.mode = null; }
if (R.mode) document.documentElement.setAttribute('data-mode', R.mode);

R.s = sim.load();
if (R.s) {
  setSound(R.s.settings.sound);
  sim.touchDay(R.s);
}
render();
window.BZF = { R, sim, key: (id) => shuffledDrill(ALL_CARDS.find((c) => c.id === id)).answer };  /* headless verification hook */
