/* town.js — Bizzington.
   Home is not a dashboard, it is a street (docs/02 §2). Every abstract idea
   in the curriculum has a building, and locked buildings are DRAWN, not
   hidden — a child should see the whole road on their first afternoon. */

import { esc } from './ui.js';
import { WORLDS, FIXES, isOpen as chapterOpen, needFor } from './content.js';
import { art } from './art-gen.js';

export const PLACES = [
  { key: 'place',    x: 20,  sub: 'place',     name: 'Your place',       lv: 1,  blurb: 'where you live, and what it costs you every single week' },
  { key: 'wallet',   x: 175, sub: 'wallet',    name: 'Your stall',       lv: 1,  blurb: 'Market Row — where the money you earn actually sits' },
  { key: 'jars',     x: 330, sub: 'jars',      name: 'The Jar Shed',     lv: 6,  blurb: 'four jars, and a rule that splits your pay day by itself' },
  { key: 'goals',    x: 485, sub: 'goals',     name: 'The Build Yard',   lv: 8,  blurb: 'name a thing and watch it go up floor by floor' },
  { key: 'bank',     x: 640, sub: 'bank',      name: 'The Bank',         lv: 11, blurb: 'the clock strikes interest, in public, every pay day' },
  { key: 'exchange', x: 795, sub: 'portfolio', name: 'The Exchange',     lv: 16, blurb: 'Bo and Bea keep the board and neither of them knows' },
  { key: 'shop',     x: 950, sub: 'business',  name: "Nana Bizz's shop", lv: 23, blurb: 'shuttered since she retired. Yours when you are ready' },
];

const H = 348, G = 250;
const DEED_H = 84;   /* the verge the deeds stand on, added only when there are any */

function plaque(x, w) {
  return `<g>
    <rect x="${x + w / 2 - 44}" y="${G - 54}" width="88" height="24" rx="12" fill="#1C2A2E" opacity=".82"/>
    <text x="${x + w / 2}" y="${G - 37}" text-anchor="middle" font-size="11.5" font-weight="700"
      fill="#EAE2CE">learn first</text>
  </g>`;
}
/* A deed. When a restoration is finished it stops being a line in a list and
   becomes a thing standing in the street with the child's name on it — the
   only permanent mark anyone leaves on Bizzington. It is drawn on the verge,
   in front of the buildings, because it is the part of the town that is
   theirs and not the curriculum's. */
function deed(x, em, who) {
  const w = Math.max(58, Math.min(112, 24 + who.length * 8.5));
  const y = H + 20;                    /* the verge, below the street proper */
  return `<g aria-hidden="true">
    <ellipse cx="${x}" cy="${y + 40}" rx="${w / 2 + 5}" ry="5" fill="rgba(0,0,0,.14)"/>
    <rect x="${x - w / 2}" y="${y + 12}" width="${w}" height="26" rx="6" fill="#8A6A3E"/>
    <rect x="${x - w / 2 + 2}" y="${y + 14}" width="${w - 4}" height="22" rx="5" fill="#C9A227"/>
    <text x="${x}" y="${y + 30}" text-anchor="middle" font-size="11.5" font-weight="800"
      fill="#3A2C0A">${esc(who)}</text>
    <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="21">${em}</text>
  </g>`;
}
function label(x, w, text, on) {
  /* var(--ink) flips with the theme exactly as the ground under it does; a
     hard-coded ink is readable on the tan ground and invisible on the dark. */
  return `<text x="${x + w / 2}" y="${G + 22}" text-anchor="middle" font-size="12.5" font-weight="800"
    fill="var(--ink)" opacity="${on ? '.85' : '.5'}">${esc(text)}</text>`;
}

/* ── the painted street ─────────────────────────────────────────────────
   The buildings are generated sprites in the same style bible as the world
   plates (tools/art/buildings.py), composited here. Hand-drawn vector
   geometry standing in a gouache world was visible from across the room; the
   family's production brief already said how this should go — image models
   draw sprites and plates, the app composites them locally, and every
   structural fact lives in the rig.

   The DYNAMIC zones are painted blank in the sprites and filled here from
   the child's real state: jars at their true ratios, the bank telling the
   actual hour, the exchange drawing the market's real last move, the goal
   going up floor by floor. Zone coordinates are FRACTIONS measured from the
   sprite's own pixels (tools/art/measure-zones.py) — measured from the
   drawing, never typed by hand, so a regenerated sprite moves its own
   anchors instead of putting the jars across the roof. */
import { BLD, ZONES } from './buildings-gen.js';
import { CO } from './companions-gen.js';
import * as co from './companion.js';

/* The companion stands beside her house — the one thing on the street that
   is hers before anything is bought. Drawn from the same sprite the Home card
   uses, so the mood on the street is the mood in the card. */
function companionOnStreet(c, here, xOf) {
  if (!co.has(c)) return '';
  const i = here.findIndex((p) => p.key === 'place');
  if (i < 0) return '';
  const key = co.spriteKey(c);
  const sp = CO[key]; if (!sp) return '';
  const w = 44, h = w * sp.h / sp.w, x = xOf(i) + 150;
  return `<g aria-hidden="true" data-co="${key}" class="${co.get(c).mood === 'happy' ? 'bob' : ''}">
    <image href="${sp.src}" x="${x}" y="${(G - h).toFixed(1)}" width="${w}" height="${h.toFixed(1)}"/></g>`;
}

function spr(name, cx, ground, w) {
  const b = BLD[name]; if (!b) return '';
  const h = w * b.h / b.w;
  return `<image href="${b.src}" x="${(cx - w / 2).toFixed(1)}" y="${(ground - h).toFixed(1)}" width="${w}" height="${h.toFixed(1)}"/>`;
}
/* A sprite's measured zone, mapped into scene coordinates. */
function zoneOf(name, cx, ground, w) {
  const b = BLD[name], z = ZONES[name];
  const h = w * b.h / b.w, x0 = cx - w / 2, y0 = ground - h;
  if (z.length === 3) return { cx: x0 + z[0] * w, cy: y0 + z[1] * h, r: z[2] * w };
  return { x: x0 + z[0] * w, y: y0 + z[1] * h, w: (z[2] - z[0]) * w, h: (z[3] - z[1]) * h };
}

function dwelling(x, tier) {
  /* the one building that visibly improves: each tier is its own painting */
  const t = Math.max(0, Math.min(4, tier));
  return spr('home-' + t, x + 65, G, [118, 132, 128, 146, 152][t]);
}

function stall(x) { return spr('stall', x + 65, G, 152); }

function shed(x, on, jars) {
  const cx = x + 65, w = 148;
  let inner = '';
  if (on) {
    const z = zoneOf('jars', cx, G, w);
    const cols = ['#C4453C', '#2E7FA8', '#178A4C', '#8A5BD6'];
    /* inset from the measured window so the lids never ride up into the
       timber above it — the zone is the opening, not the display area */
    const top = z.y + z.h * 0.16, bot = z.y + z.h * 0.96;
    const gap = z.w / 4, jw = gap * 0.62;
    jars.forEach((f, i) => {
      const jx = z.x + gap * i + (gap - jw) / 2;
      const jh = (bot - top - 6) * Math.max(0.08, Math.min(1, f));
      inner += `<rect x="${jx.toFixed(1)}" y="${top.toFixed(1)}" width="${jw.toFixed(1)}" height="${(bot - top).toFixed(1)}" rx="${(jw / 3.2).toFixed(1)}" fill="#F7FBFB" opacity=".9"/>
        <rect x="${(jx + 1.5).toFixed(1)}" y="${(bot - 3 - jh).toFixed(1)}" width="${(jw - 3).toFixed(1)}" height="${jh.toFixed(1)}" rx="${(jw / 4).toFixed(1)}" fill="${cols[i]}"/>
        <rect x="${(jx - 1).toFixed(1)}" y="${(top - 3).toFixed(1)}" width="${(jw + 2).toFixed(1)}" height="4" rx="2" fill="#B9C9CC"/>`;
    });
  }
  return spr('jars', cx, G, w) + inner;
}

function yard(x, on, prog) {
  const cx = x + 65, w = 118;
  const out = [spr('yard', cx, G, w)];
  if (on) {
    const z = zoneOf('yard', cx, G, w);
    const floors = 4, done = Math.floor(prog * floors + 0.001);
    const fh = z.h / floors;
    for (let i = 0; i < floors; i++) {
      const fy = z.y + z.h - (i + 1) * fh;
      out.push(i < done
        ? `<rect x="${(z.x + 3).toFixed(1)}" y="${(fy + 2).toFixed(1)}" width="${(z.w - 6).toFixed(1)}" height="${(fh - 4).toFixed(1)}" rx="3.5" fill="#D9BC8C"/>
           <rect x="${(z.x + 3).toFixed(1)}" y="${(fy + 2).toFixed(1)}" width="${(z.w - 6).toFixed(1)}" height="${((fh - 4) / 3).toFixed(1)}" rx="3.5" fill="rgba(255,255,255,.28)"/>
           <rect x="${(z.x + z.w * 0.18).toFixed(1)}" y="${(fy + fh * 0.32).toFixed(1)}" width="${(z.w * 0.14).toFixed(1)}" height="${(fh * 0.36).toFixed(1)}" rx="2" fill="#F6E4B5"/>
           <rect x="${(z.x + z.w * 0.44).toFixed(1)}" y="${(fy + fh * 0.32).toFixed(1)}" width="${(z.w * 0.14).toFixed(1)}" height="${(fh * 0.36).toFixed(1)}" rx="2" fill="#F6E4B5" opacity=".7"/>
           <rect x="${(z.x + z.w * 0.70).toFixed(1)}" y="${(fy + fh * 0.32).toFixed(1)}" width="${(z.w * 0.14).toFixed(1)}" height="${(fh * 0.36).toFixed(1)}" rx="2" fill="#F6E4B5" opacity=".45"/>`
        : `<rect x="${(z.x + 3).toFixed(1)}" y="${(fy + 2).toFixed(1)}" width="${(z.w - 6).toFixed(1)}" height="${(fh - 4).toFixed(1)}" rx="3.5" fill="none"
             stroke="rgba(250,244,226,.55)" stroke-width="1.4" stroke-dasharray="4 4"/>`);
    }
  }
  return out.join('');
}

function bank(x, on, hour) {
  const cx = x + 65, w = 160;
  let hands = '';
  if (on) {
    const z = zoneOf('bank', cx, G, w);
    const ang = (hour % 12) * 30 + 90;
    hands = `<g stroke="#3A2E1A" stroke-width="1.8" stroke-linecap="round">
      <path d="M${z.cx.toFixed(1)} ${z.cy.toFixed(1)} l0 -${(z.r * 0.72).toFixed(1)}" transform="rotate(${ang} ${z.cx.toFixed(1)} ${z.cy.toFixed(1)})"/>
      <path d="M${z.cx.toFixed(1)} ${z.cy.toFixed(1)} l${(z.r * 0.5).toFixed(1)} ${(z.r * 0.3).toFixed(1)}"/></g>
      <circle cx="${z.cx.toFixed(1)}" cy="${z.cy.toFixed(1)}" r="1.5" fill="#3A2E1A"/>`;
  }
  return spr('bank', cx, G, w) + hands;
}

function exch(x, on, up) {
  const cx = x + 65, w = 138;
  let board = '';
  if (on) {
    const z = zoneOf('exchange', cx, G, w);
    const line = up ? '#5BC98C' : '#EC8B81';
    const px = (f) => (z.x + z.w * f).toFixed(1), py = (f) => (z.y + z.h * f).toFixed(1);
    const pts = up ? [[.08,.78],[.26,.5],[.42,.62],[.62,.3],[.78,.42],[.92,.16]]
                   : [[.08,.22],[.26,.5],[.42,.38],[.62,.7],[.78,.58],[.92,.84]];
    board = `<polyline points="${pts.map(([fx, fy]) => px(fx) + ',' + py(fy)).join(' ')}"
        fill="none" stroke="${line}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${px(pts[5][0])}" cy="${py(pts[5][1])}" r="2.8" fill="${line}"/>`;
  }
  return spr('exchange', cx, G, w) + board;
}

function shopN(x, on) {
  const cx = x + 65, w = 152;
  let sign = '';
  if (on) {
    /* composited in the app's own face — generated lettering is banned, and
       this is exactly what the blank signboard in the sprite is FOR */
    const z = zoneOf('shop', cx, G, w);
    sign = `<text x="${(z.x + z.w / 2).toFixed(1)}" y="${(z.y + z.h * 0.72).toFixed(1)}" text-anchor="middle"
      font-family="var(--display)" font-weight="800" letter-spacing=".14em"
      font-size="${(z.h * 0.52).toFixed(1)}" fill="#FBF3E2">BIZZ &amp; CO</text>`;
  }
  return spr('shop', cx, G, w) + sign;
}

function lantern(x, lit) {
  const w = 24, h = w * BLD.lantern.h / BLD.lantern.w;
  return `<g${lit ? '' : ' style="filter:grayscale(.9);opacity:.4"'}>
    <path d="M${x} 6 v6" stroke="#5E5142" stroke-width="2.6" stroke-linecap="round"/>
    ${lit ? `<circle cx="${x}" cy="${12 + h / 2}" r="${(h * 0.62).toFixed(1)}" fill="#F0B429" opacity=".16"/>` : ''}
    <image href="${BLD.lantern.src}" x="${x - w / 2}" y="12" width="${w}" height="${h.toFixed(1)}"/>
  </g>`;
}

/* level -> which places are open. The prototype ladder is compressed so the
   whole street can be seen in one sitting; the shipping ladder is docs/01 §10. */
export function isOpen(place, level) { return level >= place.lv; }

export function townSVG(c) {
  const s = c;
  const lv = c.learn.level;
  const jars = ['spend', 'save', 'grow', 'give'].map((k) => {
    const tot = s.money.jars.spend + s.money.jars.save + s.money.jars.grow + s.money.jars.give;
    return tot > 0 ? s.money.jars[k] / Math.max(tot, 1) * 2 : 0;
  });
  const g = s.money.goals.find((x) => !x.done);
  const prog = g ? Math.min(1, g.saved / g.target) : 0;
  const up = s.market.lastMove >= 0;
  const streak = s.streak.days.length;
  const hour = new Date().getHours();

  const world = WORLDS[c.world || 0] || WORLDS[0];
  const here = PLACES.filter((p) => world.places.includes(p.key));
  /* Lay the world's own buildings out evenly instead of on fixed marks, so a
     two-building world is a street rather than a corner of an empty one. */
  const SPAN = 155, PAD = 130;      /* the postbox stands in the left margin */
  const W = Math.max(640, PAD * 2 + here.length * SPAN);
  const startX = Math.max(PAD, (W - here.length * SPAN) / 2);
  const xOf = (i) => startX + i * SPAN;

  const plate = art('world-' + world.id);
  const lanterns = Array.from({ length: 7 }, (_, i) =>
    lantern(70 + i * ((W - 140) / 6), i < Math.min(7, streak))).join('');

  const build = (p, idx) => {
    p = { ...p, x: xOf(idx) };
    const on = chapterOpen(c, p.sub);
    let art = '';
    if (p.key === 'place') art = dwelling(p.x, (c.home && c.home.tier) || 0);
    else if (p.key === 'wallet') art = stall(p.x);
    else if (p.key === 'jars') art = shed(p.x, on, jars);
    else if (p.key === 'goals') art = yard(p.x, on, prog);
    else if (p.key === 'bank') art = bank(p.x, on, hour);
    else if (p.key === 'exchange') art = exch(p.x, on, up);
    else art = shopN(p.x, on);
    return `<g class="hot" data-act="town" data-arg="${p.key}" role="button" tabindex="0"
        aria-label="${esc(p.name)}${on ? '' : ' — opens when you finish ' + (needFor(p.sub) || 'the chapter')}">
      <rect class="bldg-glow" x="${p.x - 4}" y="${G - 190}" width="138" height="196" rx="10" fill="#F0B429" opacity="0"/>
      <g style="${on ? '' : 'filter:grayscale(.82) opacity(.52)'}">${art}</g>
      ${on ? '' : plaque(p.x, 130)}
      ${label(p.x, 130, p.name, on)}
    </g>`;
  };

  /* Only this world's mended things, and only ever the child's own name. */
  const mine = FIXES.filter((f) => f.world === world.id && c.fix && c.fix.done.includes(f.id));
  const VH = H + (mine.length ? DEED_H : 0);
  /* Packed from the left, not spread across the scroll — on a phone the first
     thing you ever mended must be visible without anyone panning to find it. */
  const deeds = mine.map((f, i) => deed(96 + i * 132, f.em, c.name || 'You')).join('');

  return `<svg viewBox="0 0 ${W} ${VH}" preserveAspectRatio="xMidYMax meet" aria-label="Bizzington">
    <defs>
      <linearGradient id="wallShade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity="0"/>
        <stop offset=".78" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#3A2814" stop-opacity=".16"/>
      </linearGradient>
    </defs>
    <style>
      .bob{animation:bzf-bob 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
      .glow{animation:bzf-glow 4.2s ease-in-out infinite}
      .ping{animation:bzf-ping 1.9s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
      @keyframes bzf-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
      @keyframes bzf-glow{0%,100%{opacity:.2}50%{opacity:.42}}
      @keyframes bzf-ping{0%,100%{transform:scale(1)}50%{transform:scale(1.16)}}
      @media (prefers-reduced-motion:reduce){.bob,.glow,.ping{animation:none}}
    </style>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${VH}" fill="url(#sky)"/>
    ${plate ? `<image href="${plate}" x="0" y="0" width="${W}" height="${H}"
      preserveAspectRatio="xMidYMid slice" opacity=".96"/>` : ''}
    ${plate ? '' : `<rect width="${W}" height="${G}" fill="${world.tint}" opacity=".22"/>`}
    ${plate ? '' : `<circle cx="852" cy="62" r="26" fill="#F0B429" opacity=".55"/>
    <g fill="rgba(255,255,255,.6)">
      <ellipse cx="150" cy="70" rx="34" ry="15"/><ellipse cx="178" cy="62" rx="24" ry="17"/>
      <ellipse cx="520" cy="52" rx="28" ry="13"/><ellipse cx="546" cy="46" rx="20" ry="14"/>
    </g>
    <g stroke="rgba(40,60,64,.35)" stroke-width="1.6" fill="none" stroke-linecap="round">
      <path d="M300 82 q7-6 14 0 q7-6 14 0"/><path d="M352 62 q6-5 12 0 q6-5 12 0"/>
    </g>
    <path d="M0 210 q90-46 190-10 t180-4 q100-40 200 2 t210-6 v140 H0z" fill="rgba(80,110,100,.18)"/>`}
    ${lanterns}
    ${plate ? '' : `<rect x="0" y="${G}" width="${W}" height="${VH - G}" fill="var(--ground)"/>
    <rect x="0" y="${G}" width="${W}" height="${VH - G}" fill="${world.tint}" opacity=".3"/>`}
    ${mine.length ? `<rect x="0" y="${H - 8}" width="${W}" height="${VH - H + 8}" fill="var(--ground)"/>
    <rect x="0" y="${H - 8}" width="${W}" height="${VH - H + 8}" fill="${world.tint}" opacity=".26"/>
    <text x="14" y="${H + 8}" font-size="11" font-weight="800" fill="var(--ink)" opacity=".5">Mended by ${esc(c.name || 'you')}</text>` : ''}
    <rect x="0" y="${G + 28}" width="${W}" height="6" fill="var(--road)" opacity=".7"/>
    ${here.map(build).join('')}
    ${deeds}
    ${companionOnStreet(c, here, xOf)}
    ${here.some((p) => p.key === 'wallet') ? `<g aria-hidden="true" transform="translate(${xOf(here.findIndex((p) => p.key === 'wallet')) + 145},204) scale(.72)"><g class="bob">
      <ellipse cx="16" cy="62" rx="16" ry="4" fill="rgba(0,0,0,.14)"/>
      <path d="M30 44c8-3 10-14 4-19-5-5-11-2-10 4 1 5 6 4 6 8 0 3-3 5-6 5z" fill="#C9752F"/>
      <ellipse cx="16" cy="44" rx="12" ry="14" fill="#D98338"/>
      <ellipse cx="16" cy="48" rx="7" ry="8" fill="#F6DEBE"/>
      <circle cx="16" cy="22" r="11" fill="#E29350"/>
      <path d="M8 14c-2-4 0-7 3-6s4 5 2 7zM24 14c2-4 0-7-3-6s-4 5-2 7z" fill="#E29350"/>
      <ellipse cx="16" cy="26" rx="7" ry="5" fill="#F6DEBE"/>
      <circle cx="12" cy="20" r="2.2" fill="#25201C"/><circle cx="20" cy="20" r="2.2" fill="#25201C"/>
      <path d="M16 25c-1.2 0-2-.8-2-1.5s.8-1.2 2-1.2 2 .5 2 1.2-.8 1.5-2 1.5z" fill="#2A2320"/>
    </g></g>` : ''}
    <g class="hot" data-act="postbox" role="button" tabindex="0" aria-label="Open the postbox">
      <g style="${s.postbox.answered ? 'filter:saturate(.5);opacity:.8' : ''}">${spr('postbox', 52, 322, 58)}</g>
      ${s.postbox.answered ? '' : `<g class="ping"><circle cx="85" cy="216" r="11" fill="#F0B429"/>
        <text x="85" y="221" text-anchor="middle" font-size="14" font-weight="800" fill="#5A3D00">1</text></g>`}
      <text x="52" y="338" text-anchor="middle" font-size="12" font-weight="800" fill="var(--ink)" opacity=".7">Postbox</text>
    </g>
  </svg>`;
}
