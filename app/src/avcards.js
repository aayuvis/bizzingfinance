/* avcards.js — every avatar as a collectible card, and the deck the hello card opens
   (Bizzing Bee's openAvDeck, owner 4 Oct 2026: "clicking the avatar in the hello card
   opens all your avatar cards with their history and their ranking").

   Each of the 96 gets, derived from its id and tier alone — stable on every device, never
   random, nothing to author per face:
     · four stats (Patience · Smarts · Hustle · Heart, 28–99) and an overall;
     · its RANK among all 96 by that overall — the ranking;
     · a title, a line of story about who it is in Bizzington, and a power;
     · one real fact from the history of money — the history. Every fact here is a
       well-documented one and carries no figure (CLAUDE.md rule 6: a number is never
       taught from memory).
   The stats are play, not learning: nothing here pays, ranks the child, or reads c.money. */
import { CATALOGUE, BY_ID, PACK_OF, TIERS, stateOf, ctxFor } from './catalogue.js';
import { esc } from './ui.js';
import { ico } from './art.js';

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const pick = (arr, key) => arr[hash(key) % arr.length];

const TIER_STAT = { common: [52, 16], rare: [62, 18], epic: [72, 18], legendary: [84, 14] };
export const STATS = [['patience', 'clock', 'Patience'], ['smarts', 'learn', 'Smarts'], ['hustle', 'run', 'Hustle'], ['heart', 'heart', 'Heart']];
function statsFor(id, tier) {
  const [base, spread] = TIER_STAT[tier] || TIER_STAT.common, out = {};
  STATS.forEach(([k], i) => { const u = (hash(id + ':' + k + i) % 10007) / 10006; out[k] = Math.max(28, Math.min(99, base + Math.round((u * 2 - 1) * spread))); });
  return out;
}
const RANKWORD = { common: 'Rookie', rare: 'Trusty', epic: 'Star', legendary: 'Legend' };
const PACK_TITLE = { 1: 'of the Critter Crew', 2: 'of Market Row', 3: 'of the Old Harbour', 4: 'with the Vibe', 5: 'of Clocktower Square', 6: 'of the Post Office',
  7: 'of the Savings Shelf', 8: 'of the Exchange', 9: 'of the Builders’ Yard', 10: 'of the Makers’ Lane', 11: 'of the Bandstand', 12: 'of Festival Night' };
const LORE = {
  1: ['{n} hops in from Bizzing Bee’s meadow and keeps a jar of shiny buttons “for later”.', '{n} came over from the Bee’s meadow and still counts change out loud.'],
  2: ['{n} is up before the first awning on Market Row, chalking the day’s prices.', '{n} knows which stall on Market Row sells the fairest bunch, and why.'],
  3: ['{n} watches the boats come in at the Old Harbour and knows every cargo.', '{n} keeps a weather eye on the harbour — a calm sea is never promised.'],
  4: ['{n} brought the Vibe over from Bizzing Bee and never rushes a decision.', '{n} has opinions about everything, and checks the price first anyway.'],
  5: ['{n} winds the square’s clock that tells Bizzington when pay day comes.', '{n} believes the best money trick of all is waiting.'],
  6: ['{n} sorts the town’s letters and can spot a scam envelope at a glance.', '{n} delivers the postbox’s letters and reads the small print first.'],
  7: ['{n} keeps the Savings Shelf tidy: a jar for each thing worth waiting for.', '{n} has never once spent the Save jar on a whim, and is a little proud of it.'],
  8: ['{n} watches the Exchange board go up and down and does not panic.', '{n} likes boring, steady and spread-out — and is usually right.'],
  9: ['{n} helps build the town’s new homes, one brick and one budget at a time.', '{n} measures twice, buys once, and keeps every receipt.'],
  10: ['{n} makes things to sell in the Makers’ Lane and works out the cost of each.', '{n} can tell you exactly what one jug costs to make — clay, time and all.'],
  11: ['{n} plays the bandstand on Saturdays and splits the tips four ways.', '{n} puts on a show and still sets the ticket price with a pencil.'],
  12: ['{n} lights the lanterns on Festival Night and gives a share to the lake fund.', '{n} saved all year for Festival Night, and it shows.'],
};
const POWERS = {
  patience: [['Slow Burn', 'waits for the price to come down'], ['Long Game', 'lets savings snowball'], ['Steady Hand', 'never sells in a storm']],
  smarts: [['Small Print', 'reads the bit nobody reads'], ['Unit Sense', 'finds the cheaper pack every time'], ['Sum Sight', 'sees the whole sum at once']],
  hustle: [['Early Bird', 'first to the stall with the best stock'], ['Quick Count', 'gives the right change in a blink'], ['Second Shift', 'turns spare time into pay']],
  heart: [['Fair Share', 'splits it so nobody minds'], ['Give Jar', 'keeps a little for someone else'], ['Good Word', 'pays back exactly when promised']],
};
/* the history: real, well-documented, and figure-free (rule 6) */
export const FACTS = [
  'The first coins we know of were made in Lydia, in what is now Turkey.',
  'China was the first place to use paper money.',
  'Cowrie shells were used as money across parts of Africa and Asia long before coins reached them.',
  'The word “bank” comes from the Italian “banca” — the bench money-changers worked at.',
  '“Budget” comes from an old French word for a small leather bag.',
  'The rupee’s name comes from the Sanskrit “rūpya”, meaning shaped silver.',
  'The dollar is named after the thaler, a silver coin first struck in Bohemia.',
  'The Penny Black, from Britain, was the first stamp with glue on the back.',
  'Lloyd’s of London began as a coffee house where ship owners met to share the risk of a voyage.',
  'Coins got ridged edges so anyone could see if silver had been shaved off them.',
  'On the island of Yap, huge stone discs were money — and one could change owner without moving.',
  'Rules about lending at interest were carved into Babylon’s Code of Hammurabi.',
  'Writing every amount twice, once in and once out, was set down by Luca Pacioli in Renaissance Italy.',
  '“Exchequer” comes from the chequered cloth English officials counted money on.',
  '“Money” and “mint” both come from Moneta, a title of the Roman goddess whose temple held Rome’s mint.',
  'Swapping things only works when each person wants what the other has — that is the problem money solved.',
  'Banknotes carry watermarks and threads you can see against the light, so they are hard to copy.',
  '“Receipt” comes from the Latin for “received”.',
  'The Dutch East India Company sold shares that people could trade, and Amsterdam grew the first stock exchange around them.',
  'Fireworks were first made in China.',
  '“Salary” and “salt” share an old Latin root.',
  'Many old towns grew up around a weekly market day.',
];

export function cardOf(id) {
  const a = BY_ID[id]; if (!a) return null;
  const stats = statsFor(id, a.tier), overall = Math.round(STATS.reduce((t, [k]) => t + stats[k], 0) / STATS.length);
  const top = STATS.map(([k]) => k).reduce((b, k) => (stats[k] > stats[b] ? k : b), 'patience');
  const [pw, pwLine] = pick(POWERS[top], id + 'pw');
  return { id, name: a.name, tier: a.tier, tierLabel: TIERS[a.tier].label, colour: TIERS[a.tier].colour, pack: PACK_OF(a.pack), art: a.art,
    stats, overall, rank: RANKING().indexOf(id) + 1, title: `${RANKWORD[a.tier]} ${PACK_TITLE[a.pack] || ''}`.trim(),
    lore: pick(LORE[a.pack] || LORE[1], id + 'lore').replace('{n}', a.name), power: pw, powerLine: pwLine, fact: pick(FACTS, id + 'fact') };
}
/* all 96 by overall (ties broken by tier, then name), so a rank never moves */
const TORD = { legendary: 0, epic: 1, rare: 2, common: 3 };
let rankCache = null;
export function RANKING() {
  if (!rankCache) {
    const ov = (a) => { const s = statsFor(a.id, a.tier); return STATS.reduce((t, [k]) => t + s[k], 0) / STATS.length; };
    rankCache = [...CATALOGUE].sort((x, y) => ov(y) - ov(x) || TORD[x.tier] - TORD[y.tier] || x.name.localeCompare(y.name)).map((a) => a.id);
  }
  return rankCache;
}

/* the deck: every face this child owns, in catalogue order (the commons are everyone's) */
export function deckIds(s, c) {
  const ctx = ctxFor(s, c);
  /* the face they are wearing is always in their deck, even one that came another way
     (a sample household's, or a face from before the catalogue) */
  return CATALOGUE.filter((a) => a.id === c.avatar || stateOf(a, ctx).state === 'owned').map((a) => a.id);
}

export function cardHTML(id, { wearing = false, owned = true } = {}) {
  const d = cardOf(id); if (!d) return '';
  const bars = STATS.map(([k, icon, label]) => { const v = d.stats[k];
    const col = v >= 85 ? 'var(--grow)' : v >= 68 ? 'var(--save)' : v >= 50 ? 'var(--give)' : 'var(--muted)';
    return `<div class="avc-stat"><span>${ico(icon, '', 14)} ${label}</span><span class="avc-bar"><i style="width:${Math.round(v / 99 * 100)}%;background:${col}"></i></span><b>${v}</b></div>`; }).join('');
  return `<article class="avc avc-${d.tier}" style="--tc:${d.colour}" aria-label="${esc(d.name)}, ${esc(d.tierLabel)}, overall ${d.overall}, ranked ${d.rank} of ${CATALOGUE.length}">
    <div class="avc-top"><span class="avc-ovr"><b>${d.overall}</b><i>OVR</i></span>
      <span class="avc-rank" title="Ranked by overall among all ${CATALOGUE.length}">#${d.rank} <small>of ${CATALOGUE.length}</small></span>
      <span class="avc-tier">${esc(d.tierLabel)}</span></div>
    <div class="avc-art"><img src="${d.art}" alt="" width="150" height="150"></div>
    <h3 class="avc-name">${esc(d.name)}</h3>
    <p class="avc-title">${esc(d.title)}</p>
    <p class="avc-lore">${esc(d.lore)}</p>
    <div class="avc-stats">${bars}</div>
    <p class="avc-power"><b>${ico('sparkle', '', 13)} ${esc(d.power)}</b> — ${esc(d.powerLine)}</p>
    <div class="avc-fact"><span class="eyebrow">From the history of money</span>${esc(d.fact)}</div>
    <p class="avc-foot"><span>${esc(d.pack ? d.pack.name : '')}</span><span>${wearing ? 'Wearing' : owned ? (d.tier === 'common' ? 'Free for everyone' : 'Yours') : ''}</span></p>
  </article>`;
}

export function deckView(s, c, i) {
  const ids = deckIds(s, c); if (!ids.length) return '';
  const k = ((i % ids.length) + ids.length) % ids.length, id = ids[k], wearing = c.avatar === id, multi = ids.length > 1;
  return `<div class="avdeck" data-avdeck="${k}">
    <div class="sheet-h"><span class="eyebrow">Your avatar cards</span><button class="iconbtn" data-act="closeOv" aria-label="Close">${ico('close', '', 20)}</button></div>
    <div class="avd-stage">
      ${multi ? '<span class="avd-ghost g2" aria-hidden="true"></span><span class="avd-ghost g1" aria-hidden="true"></span>' : ''}
      ${cardHTML(id, { wearing })}
      ${multi ? `<button class="avd-nav prev" data-act="avdGo" data-arg="-1" aria-label="Previous card">${ico('back', '‹', 22)}</button>
      <button class="avd-nav next" data-act="avdGo" data-arg="1" aria-label="Next card">${ico('forward', '›', 22)}</button>` : ''}
    </div>
    <div class="avd-bar"><span class="avd-count" role="status">${k + 1} of ${ids.length} yours</span>
      ${wearing ? '<span class="avd-worn">Wearing</span>' : `<button class="btn" data-act="avdWear" data-arg="${id}">Wear this one</button>`}</div>
    <p class="small muted" style="text-align:center;margin:8px 0 0">← → or swipe to flip · <a href="#/collection" data-act="closeOv">See all ${CATALOGUE.length} in the Collection</a></p>
  </div>`;
}
