/* town.js — Bizzington.
   Home is not a dashboard, it is a street (docs/02 §2). Every abstract idea
   in the curriculum has a building, and locked buildings are DRAWN, not
   hidden — a child should see the whole road on their first afternoon. */

import { esc } from './ui.js';

export const PLACES = [
  { key: 'wallet',   x: 20,  sub: 'wallet',    name: 'Your stall',       lv: 1,  blurb: 'Market Row — where the money you earn actually sits' },
  { key: 'jars',     x: 175, sub: 'jars',      name: 'The Jar Shed',     lv: 6,  blurb: 'four jars, and a rule that splits your pay day by itself' },
  { key: 'goals',    x: 330, sub: 'goals',     name: 'The Build Yard',   lv: 8,  blurb: 'name a thing and watch it go up floor by floor' },
  { key: 'bank',     x: 485, sub: 'bank',      name: 'The Bank',         lv: 11, blurb: 'the clock strikes interest, in public, every pay day' },
  { key: 'exchange', x: 640, sub: 'portfolio', name: 'The Exchange',     lv: 16, blurb: 'Bo and Bea keep the board and neither of them knows' },
  { key: 'shop',     x: 795, sub: 'business',  name: "Nana Bizz's shop", lv: 23, blurb: 'shuttered since she retired. Yours when you are ready' },
];

const W = 960, H = 348, G = 250;

function plaque(x, w, lv) {
  return `<g>
    <rect x="${x + w / 2 - 30}" y="${G - 54}" width="60" height="24" rx="12" fill="#1C2A2E" opacity=".82"/>
    <text x="${x + w / 2}" y="${G - 37}" text-anchor="middle" font-size="12.5" font-weight="700"
      fill="#EAE2CE" font-family="ui-monospace,monospace">🔒 Lv ${lv}</text>
  </g>`;
}
function label(x, w, text, on) {
  /* var(--ink) flips with the theme exactly as the ground under it does; a
     hard-coded ink is readable on the tan ground and invisible on the dark. */
  return `<text x="${x + w / 2}" y="${G + 22}" text-anchor="middle" font-size="12.5" font-weight="800"
    fill="var(--ink)" opacity="${on ? '.85' : '.5'}">${esc(text)}</text>`;
}

function stall(x, on) {
  const wood = on ? '#B07A45' : '#6E6A5E', roof = on ? '#C8524A' : '#5E5A52';
  return `<g>
    <rect x="${x + 8}" y="${G - 62}" width="114" height="62" fill="${wood}" rx="3"/>
    <rect x="${x + 8}" y="${G - 72}" width="114" height="12" fill="${on ? '#8E5F35' : '#57544B'}" rx="2"/>
    <path d="M${x} ${G - 72} L${x + 65} ${G - 112} L${x + 130} ${G - 72} Z" fill="${roof}"/>
    <path d="M${x + 12} ${G - 74} l14-24 14 24z" fill="${on ? '#E8D9B8' : '#6E6A5E'}"/>
    ${on ? `<circle cx="${x + 34}" cy="${G - 46}" r="7" fill="#E0603C"/><circle cx="${x + 52}" cy="${G - 46}" r="7" fill="#F0B429"/><circle cx="${x + 70}" cy="${G - 46}" r="7" fill="#7CA84F"/>` : ''}
    <rect x="${x + 88}" y="${G - 52}" width="26" height="52" fill="${on ? '#7A5230' : '#4E4B44'}" rx="2"/>
  </g>`;
}

function shed(x, on, jars) {
  const wall = on ? '#D8C79E' : '#6E6A5E';
  let inner = '';
  if (on) {
    const cols = ['#C4453C', '#2E7FA8', '#178A4C', '#8A5BD6'];
    jars.forEach((f, i) => {
      const jx = x + 17 + i * 25, jh = 38 * Math.max(0.08, Math.min(1, f));
      inner += `<rect x="${jx}" y="${G - 80}" width="21" height="42" rx="5" fill="#F4F9FA" opacity=".92"/>
        <rect x="${jx + 2}" y="${G - 38 - jh}" width="17" height="${jh}" rx="4" fill="${cols[i]}"/>
        <rect x="${jx}" y="${G - 80}" width="21" height="6" rx="3" fill="#CFDDDF"/>`;
    });
  }
  return `<g>
    <rect x="${x + 6}" y="${G - 92}" width="118" height="92" fill="${wall}" rx="3"/>
    <path d="M${x} ${G - 92} L${x + 65} ${G - 124} L${x + 130} ${G - 92} Z" fill="${on ? '#7E9C6A' : '#5E5A52'}"/>
    <rect x="${x + 14}" y="${G - 80}" width="102" height="46" rx="4" fill="${on ? '#3E3226' : '#4E4B44'}" opacity=".25"/>
    ${inner}
    <rect x="${x + 52}" y="${G - 34}" width="26" height="34" fill="${on ? '#8E6238' : '#4E4B44'}" rx="2"/>
  </g>`;
}

function yard(x, on, prog) {
  const floors = 4, done = Math.floor(prog * floors + 0.001);
  let f = '';
  for (let i = 0; i < floors; i++) {
    const y = G - 26 - (i + 1) * 26;
    const built = i < done;
    f += `<rect x="${x + 22}" y="${y}" width="86" height="24" rx="2"
      fill="${built ? (on ? '#C9A87A' : '#6E6A5E') : 'none'}"
      stroke="${on ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.25)'}" stroke-width="1.4" stroke-dasharray="${built ? '0' : '4 4'}"/>`;
    if (built && on) f += `<rect x="${x + 32}" y="${y + 6}" width="14" height="12" fill="#F0B429" opacity=".9"/>
      <rect x="${x + 58}" y="${y + 6}" width="14" height="12" fill="#F0B429" opacity=".55"/>`;
  }
  return `<g>
    <rect x="${x + 10}" y="${G - 26}" width="110" height="26" fill="${on ? '#A98C63' : '#6E6A5E'}" rx="2"/>
    ${f}
    <path d="M${x + 14} ${G} L${x + 14} ${G - 118} M${x + 116} ${G} L${x + 116} ${G - 118} M${x + 14} ${G - 58} L${x + 116} ${G - 58}"
      stroke="${on ? '#8A6A3E' : '#57544B'}" stroke-width="4" stroke-linecap="round"/>
    ${on && done >= floors ? `<path d="M${x + 46} ${G - 132} l18-8 v10 z" fill="#C8524A"/><rect x="${x + 44}" y="${G - 134}" width="3" height="22" fill="#8A6A3E"/>` : ''}
  </g>`;
}

function bank(x, on, hour) {
  const stone = on ? '#DCD3C0' : '#6E6A5E';
  const ang = (hour % 12) * 30;
  return `<g>
    <rect x="${x + 8}" y="${G - 86}" width="114" height="86" fill="${stone}" rx="2"/>
    <rect x="${x}" y="${G - 96}" width="130" height="12" fill="${on ? '#C6BBA4' : '#5E5A52'}" rx="2"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${x + 18 + i * 26}" y="${G - 84}" width="12" height="84" fill="${on ? '#EFE9DA' : '#7A7669'}"/>`).join('')}
    <rect x="${x + 44}" y="${G - 156}" width="42" height="62" fill="${on ? '#CFC5AE' : '#5E5A52'}" rx="2"/>
    <path d="M${x + 40} ${G - 156} L${x + 65} ${G - 176} L${x + 90} ${G - 156} Z" fill="${on ? '#3E6E77' : '#4E4B44'}"/>
    <circle cx="${x + 65}" cy="${G - 132}" r="15" fill="${on ? '#FBF7EC' : '#8A8678'}" stroke="${on ? '#8A5B00' : '#57544B'}" stroke-width="2"/>
    ${on ? `<path d="M${x + 65} ${G - 132} v-9" stroke="#3A2E1A" stroke-width="2" stroke-linecap="round"
        transform="rotate(${ang} ${x + 65} ${G - 132})"/>
      <path d="M${x + 65} ${G - 132} l7 4" stroke="#3A2E1A" stroke-width="2" stroke-linecap="round"/>` : ''}
    <rect x="${x + 54}" y="${G - 42}" width="22" height="42" rx="10" fill="${on ? '#6E5233' : '#4E4B44'}"/>
  </g>`;
}

function exch(x, on, up) {
  const wall = on ? '#C8D8DA' : '#6E6A5E';
  return `<g>
    <rect x="${x + 6}" y="${G - 104}" width="118" height="104" fill="${wall}" rx="3"/>
    <rect x="${x + 16}" y="${G - 94}" width="98" height="52" rx="3" fill="${on ? '#22383C' : '#4E4B44'}"/>
    ${on ? `<polyline points="${x + 22},${G - 56} ${x + 40},${G - 68} ${x + 56},${G - 60} ${x + 74},${G - 80} ${x + 108},${G - 86}"
      fill="none" stroke="${up ? '#5BC98C' : '#EC8B81'}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    <path d="M${x} ${G - 104} L${x + 65} ${G - 130} L${x + 130} ${G - 104} Z" fill="${on ? '#3E6E77' : '#5E5A52'}"/>
    <rect x="${x + 52}" y="${G - 36}" width="26" height="36" fill="${on ? '#7A5230' : '#4E4B44'}" rx="2"/>

  </g>`;
}

function shopN(x, on) {
  const wall = on ? '#E8CFA8' : '#6E6A5E';
  return `<g>
    <rect x="${x + 6}" y="${G - 98}" width="118" height="98" fill="${wall}" rx="3"/>
    <path d="M${x} ${G - 98} L${x + 65} ${G - 128} L${x + 130} ${G - 98} Z" fill="${on ? '#B8563F' : '#5E5A52'}"/>
    ${on
      ? `<rect x="${x + 18}" y="${G - 78}" width="94" height="44" rx="3" fill="#FBF3E2"/>
         <rect x="${x + 18}" y="${G - 86}" width="94" height="10" fill="#C8524A"/>
         <text x="${x + 65}" y="${G - 50}" text-anchor="middle" font-size="13" font-weight="800" fill="#8A5B00" font-family="Georgia,serif">BIZZ &amp; CO</text>
         <rect x="${x + 52}" y="${G - 32}" width="26" height="32" fill="#7A5230" rx="2"/>`
      : `<rect x="${x + 18}" y="${G - 78}" width="94" height="60" rx="3" fill="#4E4B44"/>
         ${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 20}" y="${G - 76 + i * 12}" width="90" height="9" fill="#6E6A5E"/>`).join('')}`}
  </g>`;
}

function lantern(x, lit) {
  return `<g><rect x="${x - 1.5}" y="18" width="3" height="14" fill="#7A6A50"/>
    <circle cx="${x}" cy="38" r="7.5" fill="${lit ? '#F0B429' : 'rgba(140,140,130,.5)'}"/>
    ${lit ? `<circle cx="${x}" cy="38" r="13" fill="#F0B429" opacity=".2"/>` : ''}</g>`;
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

  const lanterns = [0, 1, 2, 3, 4, 5, 6].map((i) => lantern(120 + i * 118, i < Math.min(7, streak))).join('');

  const build = (p) => {
    const on = isOpen(p, lv);
    let art = '';
    if (p.key === 'wallet') art = stall(p.x, on);
    else if (p.key === 'jars') art = shed(p.x, on, jars);
    else if (p.key === 'goals') art = yard(p.x, on, prog);
    else if (p.key === 'bank') art = bank(p.x, on, hour);
    else if (p.key === 'exchange') art = exch(p.x, on, up);
    else art = shopN(p.x, on);
    return `<g class="hot" data-act="town" data-arg="${p.key}" role="button" tabindex="0"
        aria-label="${esc(p.name)}${on ? '' : ' — locked until level ' + p.lv}">
      <rect class="bldg-glow" x="${p.x - 4}" y="${G - 190}" width="138" height="196" rx="10" fill="#F0B429" opacity="0"/>
      <g opacity="${on ? 1 : 0.42}">${art}</g>
      ${on ? '' : plaque(p.x, 130, p.lv)}
      ${label(p.x, 130, p.name, on)}
    </g>`;
  };

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" aria-label="Bizzington">
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
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="852" cy="62" r="26" fill="#F0B429" opacity=".55"/>
    <g fill="rgba(255,255,255,.6)">
      <ellipse cx="150" cy="70" rx="34" ry="15"/><ellipse cx="178" cy="62" rx="24" ry="17"/>
      <ellipse cx="520" cy="52" rx="28" ry="13"/><ellipse cx="546" cy="46" rx="20" ry="14"/>
    </g>
    <g stroke="rgba(40,60,64,.35)" stroke-width="1.6" fill="none" stroke-linecap="round">
      <path d="M300 82 q7-6 14 0 q7-6 14 0"/><path d="M352 62 q6-5 12 0 q6-5 12 0"/>
    </g>
    <path d="M0 210 q90-46 190-10 t180-4 q100-40 200 2 t210-6 v140 H0z" fill="rgba(80,110,100,.18)"/>
    ${lanterns}
    <rect x="0" y="${G}" width="${W}" height="${H - G}" fill="var(--ground)"/>
    <rect x="0" y="${G + 28}" width="${W}" height="6" fill="var(--road)" opacity=".7"/>
    ${PLACES.map(build).join('')}
    <g aria-hidden="true" transform="translate(146,204) scale(.72)"><g class="bob">
      <ellipse cx="16" cy="62" rx="16" ry="4" fill="rgba(0,0,0,.14)"/>
      <path d="M30 44c8-3 10-14 4-19-5-5-11-2-10 4 1 5 6 4 6 8 0 3-3 5-6 5z" fill="#C9752F"/>
      <ellipse cx="16" cy="44" rx="12" ry="14" fill="#D98338"/>
      <ellipse cx="16" cy="48" rx="7" ry="8" fill="#F6DEBE"/>
      <circle cx="16" cy="22" r="11" fill="#E29350"/>
      <path d="M8 14c-2-4 0-7 3-6s4 5 2 7zM24 14c2-4 0-7-3-6s-4 5-2 7z" fill="#E29350"/>
      <ellipse cx="16" cy="26" rx="7" ry="5" fill="#F6DEBE"/>
      <circle cx="12" cy="20" r="2.2" fill="#25201C"/><circle cx="20" cy="20" r="2.2" fill="#25201C"/>
      <path d="M16 25c-1.2 0-2-.8-2-1.5s.8-1.2 2-1.2 2 .5 2 1.2-.8 1.5-2 1.5z" fill="#2A2320"/>
    </g></g>
    <g class="hot" data-act="postbox" role="button" tabindex="0" aria-label="Open the postbox">
      <ellipse cx="52" cy="322" rx="28" ry="6" fill="rgba(0,0,0,.13)"/>
      <rect x="48" y="288" width="7" height="34" rx="2" fill="#6B5B44"/>
      <rect x="26" y="272" width="54" height="36" rx="10" fill="${s.postbox.answered ? '#9C978A' : '#C4453C'}"/>
      <rect x="26" y="272" width="54" height="11" rx="5" fill="rgba(255,255,255,.2)"/>
      <rect x="36" y="288" width="34" height="5" rx="2.5" fill="rgba(0,0,0,.42)"/>
      ${s.postbox.answered ? '' : `<g class="ping"><circle cx="83" cy="272" r="11" fill="#F0B429"/>
        <text x="83" y="277" text-anchor="middle" font-size="14" font-weight="800" fill="#5A3D00">1</text></g>`}
      <text x="52" y="338" text-anchor="middle" font-size="12" font-weight="800" fill="var(--ink)" opacity=".7">Postbox</text>
    </g>
  </svg>`;
}
