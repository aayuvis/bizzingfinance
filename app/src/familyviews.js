/* familyviews.js — the family's pages in Finance: Shop, Collection, My page, Town and
   "Ones to try again" (FAMILY-STANDARD §1, §8, §12; J1/J4–J7, K4/K5, C4, F3).

   The Shop sells for Bizzing coins only — faces, worlds and extras, every price fixed
   and printed — and never anything a lesson needs. The town's money buys none of it:
   it is the curriculum (CLAUDE.md rule 4), and Mags' General Store is where it is spent. */
import { esc, nWord } from './ui.js';
import { ico, face, say, CAST } from './art.js';
import { R } from './runtime.js';
import * as sim from './sim.js';
import { hero } from './hero.js';
import { money, shortDate } from './fmt.js';
import { contents as planContents } from './plan.js';
import { CATALOGUE, PACKS, BY_ID, stateOf, ctxFor, TIERS, MILESTONES, milestonesOf, worldOf } from './catalogue.js';
import { LOOKS, isOpen as lookOpen, openSay, WORLD_PRICE, plateFor } from './looks.js';
import { coinBalance as balance, coinLedger as ledger } from './family.js';
import { walletLine, coinSvg, kidBadge, pipPose } from './shell.js';
import { avatarSrc, avatarName } from './avatars.js';
import { BADGES, CHAPTERS, ALL_CARDS, WORLDS, rankObj, drillAt, shuffledDrill, hintFor, chapterDone, worldOpen as journeyOpen } from './content.js';
import * as M from './mistakes.js';
import { ART } from './art-gen.js';

const K = () => sim.kid(R.s);

/* ── extras: fixed prices, each with an effect a child can see ────────── */
export const EXTRAS = [
  { id: 'frame-brass', kind: 'frame', name: 'Brass frame', line: 'A polished brass ring round your face, everywhere it shows.', price: 60 },
  { id: 'frame-rope', kind: 'frame', name: 'Harbour rope frame', line: 'A sailor’s rope ring round your face.', price: 60 },
  { id: 'frame-lantern', kind: 'frame', name: 'Lantern frame', line: 'A warm lantern glow round your face.', price: 90 },
  { id: 'frame-ribbon', kind: 'frame', name: 'Festival ribbon frame', line: 'Striped festival ribbon round your face.', price: 90 },
  { id: 'board-harbour', kind: 'board', name: 'Harbour board', line: 'Main Street’s middle, painted as the Old Harbour.', price: 80, look: 'harbour' },
  { id: 'board-clock', kind: 'board', name: 'Clocktower board', line: 'Main Street’s middle, painted as Clocktower Square.', price: 80, look: 'clock' },
  { id: 'board-festival', kind: 'board', name: 'Festival board', line: 'Main Street’s middle, painted as Festival Night.', price: 80, look: 'festival' },
  { id: 'lanterns-rose', kind: 'lanterns', name: 'Rose street lanterns', line: 'Your street’s lanterns glow rose on good days.', price: 40, glow: '#F07FA0' },
  { id: 'lanterns-sea', kind: 'lanterns', name: 'Sea-glass street lanterns', line: 'Your street’s lanterns glow sea-green on good days.', price: 40, glow: '#5FD0C0' },
  { id: 'lanterns-violet', kind: 'lanterns', name: 'Violet street lanterns', line: 'Your street’s lanterns glow violet on good days.', price: 40, glow: '#A98BF0' },
];
export const EXTRA_BY = Object.fromEntries(EXTRAS.map((x) => [x.id, x]));
export const lanternGlow = (c) => { const id = c && c.fam && c.fam.lanterns; return (EXTRA_BY[id] && EXTRA_BY[id].glow) || '#F0B429'; };

function avCard(a, c, ctx, { big, act } = {}) {
  const s = stateOf(a, ctx), wearing = c.avatar === a.id;
  const action = s.state === 'owned' ? (wearing ? '' : 'wear') : s.state === 'buy' && !s.short ? 'buyAv' : '';
  return `<button class="bz-av${big ? ' big' : ''}${wearing ? ' wearing' : ''}" data-tier="${a.tier}" data-state="${s.state}" data-act="${act || (action || 'avInfo')}" data-arg="${a.id}"
      aria-label="${esc(a.name)} — ${TIERS[a.tier].label}. ${esc(s.say)}${wearing ? '. Wearing it.' : ''}">
    <img src="${a.thumb}" alt="" width="96" height="96" loading="lazy">
    <figcaption>${esc(a.name)} <b>${TIERS[a.tier].label}</b></figcaption>
    <span class="avsay small">${wearing ? 'Wearing it' : esc(s.say)}</span>
  </button>`;
}

/* the six worlds, opened or priced — the Shop's Worlds tab and the Collection's */
export function worldsBody(c, ctx, coins) {
  return `<p class="small muted">Worlds 1 and 2 are open to everyone. Worlds 3 to 6 open with the family plan, or one at a time for ${WORLD_PRICE} coins — something worth saving for. Each world brings two packs of faces.</p>
      <p class="small muted">The family plan is something a grown-up decides about: it opens all four at once, with their ${planContents().faces} faces. Ask a grown-up — they can see it behind the ${ico('lock', '🔒', 13)}.</p>
      <div class="wshop">${LOOKS.map((w) => { const open = lookOpen(w, ctx), short = Math.max(0, WORLD_PRICE - coins);
        return `<div class="wcard${open ? '' : ' locked'}">
          <img src="${R.dark ? w.thumbNight : w.thumbDay}" alt="" width="360" height="154" loading="lazy">
          <div class="wbody"><span class="eyebrow">World ${w.n}</span><b>${esc(w.name)}</b><span class="small muted">${esc(w.line)}</span>
            <span class="small">Packs: ${PACKS.filter((p) => Math.ceil(p.n / 2) === w.n).map((p) => esc(p.name)).join(' · ')}</span>
            ${open ? `<button class="btn ghost sm" data-act="look" data-arg="${w.id}">${(c.fam && c.fam.look) === w.id ? 'Wearing it' : 'Wear this world'}</button>`
              : `<button class="btn ghost sm" data-act="buyWorld" data-arg="${w.n}" ${short ? 'disabled' : ''}>${short ? `${WORLD_PRICE} coins · ${short} more to go` : `Open for ${WORLD_PRICE} coins`}</button>`}
          </div></div>`; }).join('')}</div>`;
}

/* ── Shop: Avatars · Worlds · Extras, then the wallet history (§1, §1.1) ── */
export function viewShop() {
  const c = K(), ctx = ctxFor(R.s, c), tab = R.shopTab || 'avatars';
  const tabs = [['avatars', 'Avatars', 'user'], ['worlds', 'Worlds', 'palette'], ['extras', 'Extras', 'sparkle']];
  const coins = balance(c.name);
  let body = '';
  if (tab === 'avatars') {
    /* "ready" means the coins are there; the rest are priced and waiting, said as such */
    const forSale = CATALOGUE.filter((a) => stateOf(a, ctx).state === 'buy');
    const buyable = forSale.filter((a) => !stateOf(a, ctx).short), saving = forSale.filter((a) => stateOf(a, ctx).short);
    const soon = CATALOGUE.filter((a) => ['world', 'milestone'].includes(stateOf(a, ctx).state)).slice(0, 8);
    body = `<p class="small muted">Rare 120 · Epic 250 · Legendary 500 coins. Commons are free to everyone. Nothing is drawn blind: what you see is what you get, and every price is printed.</p>
      <div class="sect"><b>Ready to buy · ${buyable.length}</b><i></i></div>
      ${buyable.length ? `<div class="avgrid">${buyable.map((a) => avCard(a, c, ctx)).join('')}</div>` : `<div class="empty">${pipPose('think', 72)}<p class="small">${saving.length ? `You have ${coins} coins. The cheapest face here is ${Math.min(...saving.map((a) => TIERS[a.tier].price || 0)) || 120} — lessons and answers earn them.` : 'Open a world to see more faces here.'}</p></div>`}
      ${saving.length ? `<div class="sect"><b>Saving for · ${saving.length}</b><i></i></div><div class="avgrid">${saving.slice(0, 8).map((a) => avCard(a, c, ctx)).join('')}</div>` : ''}
      <div class="sect"><b>Coming up</b><i></i></div>
      <div class="avgrid">${soon.map((a) => avCard(a, c, ctx)).join('')}</div>
      <button class="btn ghost wide" data-act="nav" data-arg="collection">${ico('frame', '', 18)} See all 96 in the Collection</button>`;
  } else if (tab === 'worlds') {
    body = worldsBody(c, ctx, coins);
  } else {
    const own = (c.fam && c.fam.extras) || [];
    const kinds = [['frame', 'Avatar frames'], ['board', 'Main Street boards'], ['lanterns', 'Street lanterns']];
    body = kinds.map(([k, title]) => `<div class="sect"><b>${title}</b><i></i></div>
      <div class="xgrid">${EXTRAS.filter((x) => x.kind === k).map((x) => { const has = own.includes(x.id), on = c.fam && (c.fam[x.kind] === x.id);
        return `<div class="xcard">
          ${x.kind === 'frame' ? `<span class="xprev">${kidBadge(c, 58, x.id)}</span>` : x.kind === 'board' ? `<span class="xprev board" style="background-image:url(${plateFor(x.look, R.dark)})"></span>` : `<span class="xprev lant" style="--g:${x.glow}"><i></i><i></i><i></i></span>`}
          <b>${esc(x.name)}</b><span class="small muted">${esc(x.line)}</span>
          ${has ? `<button class="btn ghost sm" data-act="useExtra" data-arg="${x.id}" aria-pressed="${on}">${on ? 'On — tap to take off' : 'Use it'}</button>`
            : `<button class="btn ghost sm" data-act="buyExtra" data-arg="${x.id}" ${coins < x.price ? 'disabled' : ''}>${coinSvg(16)} ${x.price} coins${coins < x.price ? ` · ${x.price - coins} more to go` : ''}</button>`}
        </div>`; }).join('')}</div>`).join('');
  }
  const led = ledger(c.name).slice(-30).reverse();
  return `<div class="stack">
    ${hero({ eyebrow: 'Bizzing coins', title: 'The Shop', big: `${coins}`, sub: 'coins to spend', figure: pipPose('point', 110),
      line: 'Coins come from learning in any Bizzing app. Your town money stays in the town.' })}
    <div class="seg wide" role="tablist" aria-label="Shop">${tabs.map(([k, n, i]) => `<button role="tab" data-act="shopTab" data-arg="${k}" aria-selected="${tab === k}" aria-pressed="${tab === k}">${ico(i, '', 18)} ${n}</button>`).join('')}</div>
    <div class="card">${body}</div>
    <div class="card">
      <div class="eyebrow">Your coin history</div>
      ${led.length ? `<ol class="ledger">${led.map((x) => `<li class="${x.n > 0 ? 'in' : 'out'}"><span class="when small muted">${shortDate(x.t)}</span><span>${esc(walletLine(x))}</span></li>`).join('')}</ol>`
        : `<div class="empty">${pipPose('sleep', 72)}<p class="small">No coins yet. A right answer in any lesson is the first.</p></div>`}
      <p class="small muted" style="margin-top:8px">Coins never come from time, logins, dice or luck, and they are never sold for real money.</p>
    </div>
  </div>`;
}

/* ── Collection: all 96, by pack, owned and locked, with the path to each ── */
/* The Collection is Bizzing Bee's page (owner, 5 Oct 2026): one page, three tabs —
   Medals · Avatars · Worlds — with Home a tap back, the coin purse in the corner, and on
   the Avatars tab "Print my cards". Each pack is its own card, its faces in tier order, and
   every face says how it is had and offers the one thing that can be done with it: Wear,
   the printed price, or nothing yet (a world to open, a milestone to learn). A tap on a
   face opens its trading card (avcards.js). */
const TAB_IC = { medals: 'medal', avatars: 'sparkle', worlds: 'palette' };
function tile(a, c, ctx) {
  const s = stateOf(a, ctx), wearing = c.avatar === a.id, T = TIERS[a.tier];
  const action = wearing ? `<span class="ctile-worn">${ico('check', '', 15)} Wearing</span>`
    : s.state === 'owned' ? `<button class="ctile-btn" data-act="wear" data-arg="${a.id}" aria-label="Wear ${esc(a.name)}">Wear</button>`
    : s.state === 'buy' ? `<button class="ctile-btn coin" data-act="buyAv" data-arg="${a.id}" ${s.short ? 'disabled' : ''} aria-label="Buy ${esc(a.name)} for ${T.price} coins${s.short ? ` — ${s.short} more to go` : ''}">${coinSvg(15)} ${T.price}</button>` : '';
  return `<div class="ctile${wearing ? ' wearing' : ''}" data-tier="${a.tier}" data-state="${s.state}" style="--tc:${T.colour}">
    <button class="ctile-art" data-act="avCard" data-arg="${a.id}" aria-label="${esc(a.name)} — see the card"><img src="${a.thumb}" alt="" width="96" height="96" loading="lazy"></button>
    <b class="ctile-nm">${esc(a.name)}</b><span class="ctile-tier">${T.label}</span>
    <span class="ctile-say">${esc(wearing && s.state !== 'owned' ? 'Yours to wear' : s.say)}</span>
    <span class="ctile-act">${action}</span></div>`;
}
export function viewCollection(tab = R.colTab || 'avatars', medals = () => '') {
  const c = K(), ctx = ctxFor(R.s, c), coins = balance(c.name);
  const owned = CATALOGUE.filter((a) => stateOf(a, ctx).state === 'owned').length;
  const medalN = (c.badges || []).filter((k) => BADGES[k]).length, worldN = LOOKS.filter((w) => lookOpen(w, ctx)).length;
  const tabs = [['medals', `Medals · ${medalN}/${Object.keys(BADGES).length}`], ['avatars', `Avatars · ${owned}/${CATALOGUE.length}`], ['worlds', `Worlds · ${worldN}/${LOOKS.length}`]];
  const ORD = { common: 0, rare: 1, epic: 2, legendary: 3 };
  let body;
  if (tab === 'medals') body = medals();
  else if (tab === 'worlds') body = `<section class="card">${worldsBody(c, ctx, coins)}</section>`;
  else body = `<p class="col-intro small">Commons are free for everyone. Rares are ${TIERS.rare.price} Bizzing coins and Epics ${TIERS.epic.price} once their world is open; a Legendary is ${TIERS.legendary.price} after its learning milestone. Every price is fixed, and nothing here is left to chance. <a href="#/shop">Open the Shop</a></p>
    ${PACKS.map((p) => { const faces = CATALOGUE.filter((a) => a.pack === p.n).sort((x, y) => ORD[x.tier] - ORD[y.tier]), w = LOOKS[Math.ceil(p.n / 2) - 1];
      const n = faces.filter((a) => stateOf(a, ctx).state === 'owned').length;
      return `<section class="card cpack" aria-labelledby="pk-${p.n}" style="--pc:${w.accent[0]};--pc2:${w.accent[1]}">
        <div class="cpack-h"><span class="cpack-dot" aria-hidden="true"></span><h2 id="pk-${p.n}">${esc(p.name)}</h2><span class="cpack-n">${n}/${faces.length}</span>
          <span class="cpack-src">${ico(p.from ? 'hive' : 'town', '', 15)} ${esc(p.from ? 'Bizzing Bee' : w.name)}${lookOpen(w, ctx) ? '' : ' · opens with its world'}</span></div>
        <div class="cpack-bar" aria-hidden="true"><i style="width:${Math.round(n / faces.length * 100)}%"></i></div>
        <div class="ctiles">${faces.map((a) => tile(a, c, ctx)).join('')}</div></section>`; }).join('')}`;
  return `<div class="stack colpage">
    <div class="col-head">
      <button class="pillbtn" data-act="nav" data-arg="home">${ico('back', '‹', 16)} Home</button>
      <h1>Collection</h1>
      <span class="col-right">${tab === 'avatars' ? `<button class="pillbtn" data-act="printCards">${ico('printer', '', 16)} Print my cards</button>` : ''}<span class="col-coins" aria-label="${coins} Bizzing coins">${coinSvg(16)} ${coins}</span></span>
    </div>
    <div class="col-tabs" role="tablist" aria-label="Collection">${tabs.map(([k, label]) => `<button role="tab" data-act="colTab" data-arg="${k}" aria-selected="${tab === k}">${ico(TAB_IC[k], '', 17)} ${esc(label)}</button>`).join('')}</div>
    ${body}
  </div>`;
}

/* ── My page: a showcase card a child is proud of, printable from the grown-ups ── */
export function profileCard(c) {
  const ctx = ctxFor(R.s, c), rank = rankObj(c.learn.level);
  const owned = CATALOGUE.filter((a) => stateOf(a, ctx).state === 'owned');
  const best = owned.slice().sort((a, b) => ['common', 'rare', 'epic', 'legendary'].indexOf(b.tier) - ['common', 'rare', 'epic', 'legendary'].indexOf(a.tier)).slice(0, 3);
  const medals = (c.badges || []).slice(-3).map((k) => BADGES[k]).filter(Boolean);
  const stops = ALL_CARDS.filter((k) => c.learn.done[k.id]).length;
  return `<section class="pcard" aria-label="${esc(c.name)}'s card">
    <div class="pc-av">${kidBadge(c, 120)}</div>
    <div class="pc-body"><span class="eyebrow">Bizzington · ${esc(rank.name)} · level ${c.learn.level}</span>
      <h2>${esc(c.name)}</h2>
      <p class="small">${stops} of ${ALL_CARDS.length} stops walked · ${owned.length} of 96 faces · ${(c.badges || []).length} medals</p>
      <div class="pc-medals">${medals.length ? medals.map((b) => `<span class="pc-medal">${ico(b.em, '', 20)}<b>${esc(b.name)}</b></span>`).join('') : '<span class="small muted">Your first medal will sit here.</span>'}</div>
      ${best.length ? `<div class="pc-faces">${best.map((a) => `<span class="bz-av mini" data-tier="${a.tier}" data-state="owned"><img src="${a.thumb}" alt="${esc(a.name)}" width="44" height="44"></span>`).join('')}</div>` : ''}
    </div>
    <img class="pc-pip" src="./mascot/sm/pip-cheer.webp" alt="" width="84" height="84">
  </section>`;
}

/* ── Town: the money map — travel, the street's buildings, the repairs ── */
export function viewTown(parts) {
  /* Town is the Money tab too: the street, the money drawn, the seven places to walk
     into, the day's three, the road to the next place, and what is left to mend */
  return `<div class="stack townpage">
    <h1 class="sr">Town — Bizzington and your money</h1>
    ${parts.street}
    ${parts.money}
    ${parts.places}
    ${parts.today}
    <div class="sect"><b>The road</b><i></i><span class="small muted">five places, walked in order</span></div>
    <div class="travel">${parts.worlds}</div>
    ${parts.repairs}
  </div>`;
}

/* ── Ones to try again (F3) ────────────────────────────────────────────── */
export function viewMistakes() {
  const c = K(), now = Date.now(), due = M.due(c, now), wait = M.waiting(c, now), done = M.cleared(c);
  const cur = R.mk && due.find((m) => m.k === R.mk.k) ? R.mk : (due[0] ? { k: due[0].k, pick: null, tries: 0 } : null);
  R.mk = cur;
  const m = cur && due.find((x) => x.k === cur.k);
  const card = m && (ALL_CARDS.find((x) => x.id === m.card));
  let q = '';
  if (m && card) {
    const d = shuffledDrill(card, m.qi), held = cur.pick != null && cur.pick !== d.answer && cur.tries === 1, settled = cur.pick === d.answer || cur.tries >= 2;
    q = `<div class="card stack">
      <div class="eyebrow">From “${esc(card.title)}” · missed ${m.misses === 1 ? 'once' : nWord(m.misses) + ' times'}</div>
      <h3 style="font-size:18px">${esc(d.q)}</h3>
      <div class="stack" style="gap:8px">${d.opts.map((o, i) => { let k = ''; if (settled) k = i === d.answer ? ' ok' : i === cur.pick ? ' no' : ''; else if (held && i === cur.pick) k = ' no';
        return `<button class="opt${k}" data-act="mkPick" data-arg="${i}" ${settled || (held && i === cur.pick) ? 'disabled' : ''}><span class="k">${'ABCD'[i]}</span>${esc(o)}</button>`; }).join('')}</div>
      ${held ? `<div class="fb hold" role="status"><b>Not this time.</b> ${esc(hintFor(card, m.qi, c.band))}<div style="margin-top:6px;font-weight:700">One more try.</div></div>` : ''}
      ${settled ? `<div class="fb ${cur.pick === d.answer && cur.tries === 1 ? 'yes' : 'no'}" role="status"><b>${cur.pick === d.answer && cur.tries === 1 ? 'Yours again.' : 'That one is ' + esc(d.opts[d.answer]) + '.'}</b> ${esc(d.why)}</div>
        <button class="btn wide" data-act="mkNext">Next one →</button>` : ''}
    </div>`;
  }
  return `<div class="stack">
    ${hero({ eyebrow: 'Ones to try again', title: 'Back after a gap', figure: due.length ? pipPose('think', 104) : '',
      line: 'Questions you missed the first time come back a day later, then three, then a week. Right twice after the wait, and they are yours.' })}
    ${q || `<div class="card empty">${pipPose('sleep', 84)}<p>${wait.length ? `Nothing due right now. The next one comes back ${shortDate(wait[0].due)}.` : 'Nothing to try again. Miss a question in a lesson and it will wait here for you.'}</p>
      <button class="btn ghost" data-act="nav" data-arg="learn">Back to the Atlas</button></div>`}
    ${wait.length ? `<div class="card"><div class="eyebrow">Waiting for their gap · ${wait.length}</div>
      <div class="rows" style="margin-top:6px">${wait.slice(0, 8).map((w) => { const k = ALL_CARDS.find((x) => x.id === w.card); return `<div class="qrow"><span class="iw">${ico('repeat', '', 18)}</span><span class="grow small">${esc(k ? k.title : w.card)}</span><span class="small muted">back ${shortDate(w.due)}</span></div>`; }).join('')}</div></div>` : ''}
    ${done.length ? `<p class="small muted" style="padding:0 6px">${done.length} ${done.length === 1 ? 'question is' : 'questions are'} yours again, after being missed.</p>` : ''}
  </div>`;
}
