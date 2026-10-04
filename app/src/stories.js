/* stories.js — a short illustrated story for each of the five places (audit I1,
   owner-approved: "a short illustrated story for each of the five places, using
   the existing cast").

   Every story dramatises the chapters its place teaches, in the words the cards
   use, and ends on one line of what Pip learned. Three rules hold here and
   test/stories.mjs keeps them:

   · The cast is the town's own five. Nobody new walks on.
   · No figure is written into the text. Every amount is a {units} placeholder
     priced by fmt.js at render, so the currency stays a setting and no number
     can claim a real-world provenance (rule 6). Amounts are multiples of twenty
     units, which price whole in every currency, so the sums a page states
     (take this from that) add up in rupees, dollars, pounds, euros and dirhams.
   · Every picture is composed from art the app already has: the place's plate
     (night plate on a dark page), a building sprite, Pip's poses and the cast's
     portraits. No new image, and no lettering in any image — the words are
     HTML, read aloud by the device's own voice.

   Stories are not gated. A locked place's story is a window down the road, not
   its tools: it asks only for adding and taking away, and teaches nothing a
   later lesson does not teach again. */

import { WORLDS } from './content.js';
import { CAST, portrait, ico } from './art.js';
import { BLD, ZONES } from './buildings-gen.js';
import { plateFor } from './looks.js';
import { money, price } from './fmt.js';
import { esc, on, say as speak, hush, canSay } from './ui.js';
import { R } from './runtime.js';

/* A page: text (1–3 sentences, {n} = n units), who (cast ids; Pip may carry a
   pose — wave, think, point, cheer, oops, sleep), an optional building, and pan
   (0–100: which part of the wide plate the page looks at). */
export const STORIES = {
  market: {
    title: 'Pip’s First Wage',
    pages: [
      { text: 'Morning on Market Row, and the grain stall had a mountain of crates and nobody with time to carry them. Pip had plenty of time, and no money at all.', who: ['pip:wave'], bld: 'stall', pan: 20 },
      { text: 'Nana Bizz paid Pip {40} to carry every crate. “You did not sell me crates,” she said. “You sold me your morning.”', who: ['nana', 'pip:point'], bld: 'stall', pan: 40 },
      { text: 'Pip turned the coins over: just metal, really. They would buy bread only because the whole street agreed they would.', who: ['pip:think'], pan: 55 },
      { text: 'One crate was cracked, and Pip said so straight away. Nana smiled. “That is why I will ask you again next week.”', who: ['nana', 'pip:cheer'], pan: 70 },
      { text: 'Mags held up a shiny button. “Only {20}, and today only!” she sang. The price was real, but what it was worth was up to Pip.', who: ['mags', 'pip:think'], pan: 85 },
      { text: 'Grey clouds rolled in over the awnings. Today an umbrella was a need, and the button was a want. Pip bought the umbrella for {20} and kept the rest.', who: ['pip:point'], bld: 'stall', pan: 30 },
      { text: '“One job is one tap,” said Mags. “I sell buttons and mend umbrellas, so a slow day never means nothing comes in.” So Pip asked about sweeping the square as well.', who: ['mags', 'pip:wave'], pan: 60 },
    ],
    learned: 'Money comes from a trade, and a need comes before a want.',
  },
  harbour: {
    title: 'The Boat in the Window',
    pages: [
      { text: 'Down at the Old Harbour, a little wooden boat sat in a window, priced at {160}. Pip wanted it very much, and wanting is allowed.', who: ['pip:think'], pan: 15 },
      { text: 'Nana Bizz lined up four jars on the sill: Spend, Save, Grow and Give. “Split it the moment it lands,” she said. “What sits in one pile gets spent as one pile.”', who: ['nana', 'pip:point'], bld: 'jars', shows: [0.25, 0.1, 0.1, 0.05], pan: 35 },
      { text: 'Every pay day, Pip put {20} in the Save jar. The boat cost {160}, so that was eight pay days. Not “someday”: eight.', who: ['pip:cheer'], bld: 'jars', shows: [0.25, 0.55, 0.15, 0.1], pan: 50 },
      { text: 'On the quay, Mags waved a poster. “A brand-new boat, today only!” she called. “And free sails if you join the Boat Club, just {20} a month.”', who: ['mags', 'pip:think'], pan: 70 },
      { text: 'Pip slowed down. “Today only” was not a fact about the boat, just a hurry. And {20} every month comes to {240} by the end of a year.', who: ['pip:think'], pan: 85 },
      { text: '“You sell beautifully,” Pip told Mags, “but I have a plan.” Mags laughed and tipped her hat, because she likes a customer who has one.', who: ['mags', 'pip:wave'], pan: 60 },
      { text: 'On the eighth pay day Pip’s Save jar was full, and the little boat sailed on the harbour pool. It felt even better for being planned.', who: ['pip:cheer'], bld: 'yard', shows: 1, pan: 25 },
    ],
    learned: 'Split money the moment it lands, and a hurry is a seller’s tool, not a fact.',
  },
  clock: {
    title: 'Rent on Money',
    pages: [
      { text: 'Pip’s Save jar was getting heavy, so Nana Bizz walked Pip to the Bank under the big clock. “The Bank keeps it safe,” she said, “and pays you a little to leave it there.”', who: ['nana', 'pip:think'], bld: 'bank', pan: 45 },
      { text: '“Why would it pay me?” asked Pip. “Because it lends your money to someone else meanwhile,” said Nana, “and they pay for borrowing it.” Interest is rent on money, and it runs both ways.', who: ['pip:think', 'nana'], bld: 'bank', pan: 55 },
      { text: 'Then a note came through the postbox: “You have won a prize! Send your PIN today, and tell no one.” A reward, a hurry and a secret: Pip knew that shape.', who: ['pip:oops'], bld: 'postbox', pan: 20 },
      { text: 'Pip did not reply. Pip showed the note to Nana straight away, because telling someone is always the right move, and a PIN belongs to nobody else.', who: ['nana', 'pip:point'], pan: 30 },
      { text: 'Next week the wheel snapped on Pip’s sweeping barrow, and the sweeping work needed it. The Bank offered to lend {100}, paid back as {120} in all.', who: ['pip:oops'], bld: 'bank', pan: 70 },
      { text: '“Look past the small weekly bit to the total,” said Nana. “Borrow {100}, pay back {120}, and the price of borrowing is {20}.” A wheel that earns its keep is a good reason to pay it.', who: ['nana', 'pip:think'], pan: 80 },
      { text: 'Pip paid every week, on time. The Bank remembered, because a good record is a memory of what happened, never a verdict on who you are.', who: ['pip:cheer'], bld: 'bank', pan: 50 },
    ],
    learned: 'Interest is rent on money, and the price of borrowing is the total you pay back minus what you borrowed.',
  },
  exchange: {
    title: 'The Storm on the Steps',
    pages: [
      { text: 'On the Exchange steps, Bo and Bea were arguing again. “Up!” said Bo. “Down,” said Bea.', who: ['bo', 'bea'], bld: 'exchange', pan: 50 },
      { text: 'Pip knew that a share is a small slice of a company. When the company does well the slice can be worth more, and when it does badly the slice can be worth less.', who: ['pip:point'], bld: 'exchange', pan: 35 },
      { text: '“Put everything in Rocket Rickshaws!” said Bo. “It went up all week!” But Pip remembered that something which might grow a lot can also fall a lot.', who: ['bo', 'pip:think'], pan: 65 },
      { text: 'So Pip bought small slices of many things, not one, like the Whole Market Basket. Then no single piece of bad news could sink the lot.', who: ['pip:cheer'], bld: 'exchange', pan: 20 },
      { text: 'Then came a storm week, and the whole board went red. “Everything is down,” said Bea, “and that tight feeling is the one that makes people sell at the worst moment.”', who: ['bea', 'pip:oops'], bld: 'exchange', shows: 'down', pan: 80 },
      { text: 'Pip did nothing, which was the hardest part. “Nobody can tell when a storm will end,” said Nana, “but money you will not need for years has time to wait.”', who: ['nana', 'pip:think'], pan: 45 },
      { text: 'Weeks later the board was green again. “Obvious!” said Bo, who says that every week. Pip just smiled, because the growth was starting to grow too, like a snowball.', who: ['bo', 'pip:cheer'], bld: 'exchange', pan: 60 },
    ],
    learned: 'Own a slice of many things, and in a storm, doing nothing is usually right.',
  },
  works: {
    title: 'Three Different Words',
    pages: [
      { text: 'Nana Bizz handed Pip the key to the old shop at the Works. “Make chai and sell it,” she said. “Then come and tell me three words: revenue, cost and profit.”', who: ['nana', 'pip:wave'], bld: 'shop', pan: 40 },
      { text: 'On the first day Pip sold cup after cup and took in {200}. That was the revenue: everything that came in.', who: ['pip:cheer'], bld: 'shop', pan: 55 },
      { text: 'But Pip’s tea, milk and cups had cost {120}, and the rent for the day was {60}. Take those away and {20} was left, and that was the profit.', who: ['pip:think'], bld: 'shop', pan: 30 },
      { text: '“Too cheap and you sell out but earn nothing,” said Mags. “Too dear and you carry it home.” Pip tried a little more per cup, and most people still happily paid.', who: ['mags', 'pip:point'], pan: 70 },
      { text: 'On Friday the tea seller’s bill arrived before the customers did. The week had made a profit on paper, but Pip’s cash tin was nearly empty.', who: ['pip:oops'], bld: 'shop', pan: 85 },
      { text: '“Profit is the week on paper, and cash is what is in your hand when the bill is due,” said Nana. “Keep some profit in the shop for weeks like this, the way jars split a wage.”', who: ['nana', 'pip:think'], pan: 20 },
      { text: 'So Pip kept a little back every week and was fair to every customer. The same faces came back again and again, and a customer who comes back is the best kind.', who: ['pip:cheer'], bld: 'shop', pan: 50 },
    ],
    learned: 'Revenue, cost and profit are three different words, and cash is not profit.',
  },
};

export const POSES = ['wave', 'think', 'point', 'cheer', 'oops', 'sleep'];
export const storyFor = (id) => STORIES[id] || null;

/* {n} → n units, priced in the household's currency */
const AMT = /\{(\d+)\}/g;
export const plain = (t) => t.replace(AMT, (_, n) => money(price(+n)));
const rich = (t) => esc(t).replace(AMT, (_, n) => `<b class="st-m">${money(price(+n))}</b>`);

/* ── the reader ─────────────────────────────────────────────────────── */
function state() {
  const id = STORIES[R.storyAt] ? R.storyAt : 'market';
  if (!R.story || R.story.id !== id) {
    /* render() records the screen it drew last AFTER drawing, so here it is still the
       screen the child came from — the one Close goes back to */
    R.story = { id, page: 0, dir: 1, reading: R.story ? R.story.reading : false,
      from: R.lastNav && R.lastNav !== 'story' ? R.lastNav : null };
  }
  return R.story;
}

/* A building, with its blank zone drawn the way the street draws it (town.js): the
   sprites paint those zones blank on purpose, and the story fills them with the
   page's own state — a Save jar filling, a board going red, the Build Yard done. */
const JAR_INK = ['#C4453C', '#2E7FA8', '#178A4C', '#8A5BD6'];
function building(name, shows, side) {
  const b = BLD[name]; if (!b) return '';
  const z = ZONES[name], W = b.w, H = b.h, f = (n) => n.toFixed(1);
  let inner = '';
  if (z && name === 'jars') {
    const fill = Array.isArray(shows) ? shows : [0.5, 0.4, 0.3, 0.2];
    const x = z[0] * W, y = z[1] * H, w = (z[2] - z[0]) * W, h = (z[3] - z[1]) * H;
    const top = y + h * 0.16, bot = y + h * 0.96, gap = w / 4, jw = gap * 0.62;
    fill.forEach((v, i) => {
      const jx = x + gap * i + (gap - jw) / 2, jh = (bot - top - 6) * Math.max(0.08, Math.min(1, v));
      inner += `<rect x="${f(jx)}" y="${f(top)}" width="${f(jw)}" height="${f(bot - top)}" rx="${f(jw / 3.2)}" fill="#F7FBFB" opacity=".9"/>
        <rect x="${f(jx + 4)}" y="${f(bot - 6 - jh)}" width="${f(jw - 8)}" height="${f(jh)}" rx="${f(jw / 4)}" fill="${JAR_INK[i]}"/>
        <rect x="${f(jx - 3)}" y="${f(top - 8)}" width="${f(jw + 6)}" height="10" rx="5" fill="#B9C9CC"/>`;
    });
  } else if (z && name === 'yard') {
    const x = z[0] * W, y = z[1] * H, w = (z[2] - z[0]) * W, h = (z[3] - z[1]) * H, floors = 4;
    const done = Math.floor((typeof shows === 'number' ? shows : 0) * floors + 0.001), fh = h / floors;
    for (let i = 0; i < floors; i++) {
      const fy = y + h - (i + 1) * fh;
      inner += i < done
        ? `<rect x="${f(x + 6)}" y="${f(fy + 4)}" width="${f(w - 12)}" height="${f(fh - 8)}" rx="8" fill="#D9BC8C"/><rect x="${f(x + w * 0.2)}" y="${f(fy + fh * 0.32)}" width="${f(w * 0.16)}" height="${f(fh * 0.36)}" rx="4" fill="#F6E4B5"/><rect x="${f(x + w * 0.62)}" y="${f(fy + fh * 0.32)}" width="${f(w * 0.16)}" height="${f(fh * 0.36)}" rx="4" fill="#F6E4B5" opacity=".7"/>`
        : `<rect x="${f(x + 6)}" y="${f(fy + 4)}" width="${f(w - 12)}" height="${f(fh - 8)}" rx="8" fill="none" stroke="rgba(250,244,226,.6)" stroke-width="3" stroke-dasharray="9 9"/>`;
    }
  } else if (z && name === 'exchange') {
    const up = shows !== 'down', line = up ? '#5BC98C' : '#EC8B81';
    const px = (v) => f((z[0] + (z[2] - z[0]) * v) * W), py = (v) => f((z[1] + (z[3] - z[1]) * v) * H);
    const pts = up ? [[.08, .78], [.26, .5], [.42, .62], [.62, .3], [.78, .42], [.92, .16]] : [[.08, .22], [.26, .5], [.42, .38], [.62, .7], [.78, .58], [.92, .84]];
    inner = `<polyline points="${pts.map(([a, c]) => px(a) + ',' + py(c)).join(' ')}" fill="none" stroke="${line}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${px(pts[5][0])}" cy="${py(pts[5][1])}" r="8" fill="${line}"/>`;
  } else if (z && name === 'bank') {
    const cx = z[0] * W, cy = z[1] * H, r = z[2] * W, ang = ((typeof shows === 'number' ? shows : 10) % 12) * 30;
    inner = `<g stroke="#3A2E1A" stroke-width="4" stroke-linecap="round"><path d="M${f(cx)} ${f(cy)} l0 -${f(r * 0.5)}" transform="rotate(${ang} ${f(cx)} ${f(cy)})"/><path d="M${f(cx)} ${f(cy)} l0 -${f(r * 0.74)}"/></g><circle cx="${f(cx)}" cy="${f(cy)}" r="3.5" fill="#3A2E1A"/>`;
  } else if (z && name === 'shop') {
    /* composited in the app's own face, as the street does: the sprite's signboard is blank for this */
    inner = `<text x="${f((z[0] + z[2]) / 2 * W)}" y="${f((z[1] + (z[3] - z[1]) * 0.72) * H)}" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="800" letter-spacing=".14em" font-size="${f((z[3] - z[1]) * H * 0.52)}" fill="#FBF3E2">BIZZ &amp; CO</text>`;
  }
  return `<svg class="st-bld st-bld-${side}" viewBox="0 0 ${W} ${H}" style="aspect-ratio:${W}/${H}" aria-hidden="true" focusable="false"><image href="${b.src}" width="${W}" height="${H}"/>${inner}</svg>`;
}

function figure(spec, i, n) {
  const [who, pose] = spec.split(':');
  const name = (CAST[who] || CAST.pip).name;
  const side = n === 1 ? 'mid' : i === 0 ? 'a' : 'b';
  if (who === 'pip') {
    return `<figure class="st-fig st-pip st-${side}" style="--i:${i}"><img src="./mascot/pip-${POSES.includes(pose) ? pose : 'wave'}.webp" alt="" width="512" height="512"><figcaption>${esc(name)}</figcaption></figure>`;
  }
  return `<figure class="st-fig st-face st-${side}" style="--i:${i}"><span class="st-ring">${portrait(who)}</span><figcaption>${esc(name)}</figcaption></figure>`;
}

export function viewStory() {
  const st = state(), s = STORIES[st.id], w = WORLDS.find((x) => x.id === st.id);
  const n = s.pages.length, p = Math.min(Math.max(st.page, 0), n - 1), pg = s.pages[p];
  const last = p === n - 1;
  const b = pg.bld && BLD[pg.bld];
  const who = pg.who.map((x, i) => figure(x, i, pg.who.length)).join('');
  const names = pg.who.map((x) => (CAST[x.split(':')[0]] || CAST.pip).name).join(' and ');
  return `<section class="story" data-world="${w.id}" data-dir="${st.dir < 0 ? 'back' : 'on'}" style="--ja:${w.tint}" aria-roledescription="story" aria-label="${esc(s.title)}">
    <div class="st-top">
      <button class="backlink" data-act="storyClose">${ico('back', '←', 16)} Close</button>
      ${canSay() ? `<button class="btn ghost sm st-read" data-act="storyRead" aria-pressed="${st.reading ? 'true' : 'false'}">${ico('sound', '🔊', 16)} ${st.reading ? 'Reading aloud' : 'Read it to me'}</button>` : ''}
    </div>
    <header class="st-head">
      <span class="eyebrow">${esc(w.name)} · a story</span>
      <h1>${esc(s.title)}</h1>
    </header>
    <div class="st-book${last ? ' last' : ''}" data-p="${p}">
      <div class="st-stage" data-act="storyTap" style="--plate:url(${plateFor(w.id, !!R.dark)});--pan:${pg.pan == null ? 50 : pg.pan}%"
        role="img" aria-label="${esc(names)}${b ? ', by the ' + esc(pg.bld.replace(/-\d+$/, '')) : ''}, in ${esc(w.name)}">
        ${b ? building(pg.bld, pg.shows, pg.who.length > 1 || (pg.pan || 50) > 50 ? 'l' : 'r') : ''}
        <div class="st-cast n${pg.who.length}">${who}</div>
        <span class="st-hint st-hint-l" aria-hidden="true">${p > 0 ? ico('back', '‹', 18) : ''}</span>
        <span class="st-hint st-hint-r" aria-hidden="true">${last ? '' : ico('forward', '›', 18)}</span>
      </div>
      <div class="st-text" aria-live="polite">
        <p>${rich(pg.text)}</p>
        ${last ? `<p class="st-learned"><span class="eyebrow">What Pip learned</span>${esc(s.learned)}</p>` : ''}
      </div>
    </div>
    <nav class="st-nav" aria-label="Pages">
      <button class="btn ghost st-prev" data-act="storyGo" data-arg="-1" ${p === 0 ? 'disabled' : ''} aria-label="Previous page">${ico('back', '←', 18)}</button>
      <span class="st-dots" role="status" aria-label="Page ${p + 1} of ${n}">${s.pages.map((_, i) => `<i class="${i === p ? 'on' : i < p ? 'seen' : ''}"></i>`).join('')}<b class="sr">Page ${p + 1} of ${n}</b></span>
      ${last
        ? `<button class="btn st-next" data-act="storyClose">The end ${ico('check', '✓', 18)}</button>`
        : `<button class="btn st-next" data-act="storyGo" data-arg="1" aria-label="Next page">Next ${ico('forward', '→', 18)}</button>`}
    </nav>
    <p class="small muted st-keys">Turn the page with the buttons, the arrow keys, a swipe, or a tap on either side of the picture.</p>
  </section>`;
}

/* ── turning, reading, closing ──────────────────────────────────────── */
function readPage() {
  const st = R.story, s = st && STORIES[st.id]; if (!s) return;
  const pg = s.pages[st.page];
  speak(plain(pg.text) + (st.page === s.pages.length - 1 ? ' What Pip learned: ' + s.learned : ''));
}
function go(d) {
  const st = R.story, s = st && STORIES[st.id]; if (!s) return;
  const to = Math.min(Math.max(st.page + d, 0), s.pages.length - 1);
  if (to === st.page) return;
  const a = document.activeElement, kept = a && a.dataset && a.dataset.act === 'storyGo' ? a.dataset.arg : null;
  st.page = to; st.dir = d < 0 ? -1 : 1;
  R.render();
  /* a page read further down turns to the top of the next one, not the middle of it */
  const bk = document.querySelector('.story .st-book');
  if (bk) { const t = bk.getBoundingClientRect().top; if (t < 0) window.scrollBy(0, t - 72); }
  if (kept) { const el = document.querySelector(`.story [data-act="storyGo"][data-arg="${kept}"]:not([disabled])`) || document.querySelector('.story .st-next'); if (el) el.focus({ preventScroll: true }); }
  if (st.reading) readPage(); else hush();
}
function close() {
  const st = R.story; R.story = null; hush();
  if (st && st.from && typeof history !== 'undefined' && history.length > 1) history.back();
  else location.hash = '#/town';
}
let swiped = 0;
on('storyGo', (a) => go(+a || 1));
on('storyClose', close);
on('storyRead', () => { const st = R.story; if (!st) return; st.reading = !st.reading; R.render(); if (st.reading) readPage(); else hush(); });
on('storyTap', (a, ev) => {
  if (Date.now() - swiped < 450 || !ev) return;
  const el = ev.target.closest('.st-stage'); if (!el) return;
  const r = el.getBoundingClientRect();
  go(ev.clientX - r.left < r.width / 2 ? -1 : 1);
});

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || R.overlay || !document.querySelector('.story')) return;
    const t = e.target && e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  });
  /* a swipe across the picture turns the page; the picture keeps vertical scrolling */
  let x0 = null, y0 = 0;
  document.addEventListener('pointerdown', (e) => { x0 = e.target.closest && e.target.closest('.st-stage') ? e.clientX : null; y0 = e.clientY; }, { passive: true });
  document.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = Date.now(); go(dx < 0 ? 1 : -1); }
  }, { passive: true });
  document.addEventListener('pointercancel', () => { x0 = null; }, { passive: true });
}
