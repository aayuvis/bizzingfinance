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
      fill="#EAE2CE">🔒 learn first</text>
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

function dwelling(x, tier) {
  /* The child's home, and the one building that visibly improves: each tier
     adds storeys, windows, a chimney, a garden — bought in the app, standing
     in the street. */
  const walls = ['#D9C49A', '#E0CBA0', '#E7D2A6', '#EDD8AC', '#F2DDB2'][tier] || '#D9C49A';
  const wallSh = '#C2AB7E';
  const roof = ['#8F6A4C', '#967152', '#9E7857', '#A87F5C', '#B45A40'][tier] || '#8F6A4C';
  const roofDk = '#6E4E36';
  const storeys = tier >= 2 ? 2 : 1;
  const h = storeys === 2 ? 118 : 82;
  let win = '';
  const rows = storeys === 2 ? [G - 104, G - 60] : [G - 62];
  rows.forEach((wy, r) => {
    const n = tier >= 2 ? 3 : tier >= 1 ? 2 : 1;
    const ground = r === rows.length - 1;
    /* the door owns the middle of the ground floor, so a lone ground-floor
       window stands beside it, not behind it */
    if (n === 1 && ground) { win += winlet(x + 24, wy, 22, 26, roofDk); return; }
    const first = x + 65 - (n * 30 - 8) / 2;
    for (let i = 0; i < n; i++) {
      if (ground && n % 2 === 1 && i === (n - 1) / 2) continue;   /* the door is there */
      win += winlet(first + i * 30, wy, 22, 26, roofDk);
    }
  });
  return `<g>${shadow(x + 65, 74)}
    <rect x="${x + 10}" y="${G - h}" width="110" height="${h}" fill="${walls}" rx="3"/>
    <rect x="${x + 10}" y="${G - h}" width="110" height="${h}" fill="url(#wallShade)" rx="3"/>
    <rect x="${x + 10}" y="${G - 7}" width="110" height="7" fill="${wallSh}" rx="2"/>
    ${gable(x, 130, G - h, 36, roof, roofDk)}
    ${win}
    ${doorway(x + 51, G, 28, 38, roofDk, '#F0B429')}
    ${tier >= 3 ? `<rect x="${x + 94}" y="${G - h - 30}" width="13" height="30" fill="${roofDk}" rx="2"/>
      <rect x="${x + 91}" y="${G - h - 34}" width="19" height="6" fill="${roof}" rx="2"/>
      <ellipse cx="${x + 100}" cy="${G - h - 44}" rx="8" ry="5" fill="rgba(255,255,255,.55)"/>
      <ellipse cx="${x + 106}" cy="${G - h - 52}" rx="5" ry="3.4" fill="rgba(255,255,255,.4)"/>` : ''}
    ${tier >= 4 ? `<rect x="${x + 4}" y="${G - 13}" width="122" height="13" rx="5" fill="#7FA86F"/>
      <circle cx="${x + 18}" cy="${G - 15}" r="6" fill="#5F8A52"/><circle cx="${x + 40}" cy="${G - 13}" r="4.6" fill="#6B9A5E"/>
      <circle cx="${x + 96}" cy="${G - 13}" r="4.6" fill="#6B9A5E"/><circle cx="${x + 114}" cy="${G - 15}" r="6" fill="#5F8A52"/>` : ''}
  </g>`;
}

/* ── shared building parts ──────────────────────────────────────────────
   One street, one hand. Every building takes its shadow, roof, windows and
   door from here so the seven of them read as one place — the same reason
   the icon set shares a grid. */
function shadow(cx, rx) {
  return `<ellipse cx="${cx}" cy="${G + 3}" rx="${rx}" ry="6.5" fill="rgba(58,40,20,.18)"/>`;
}
function gable(x, w, baseY, peak, face, dark) {
  /* overhang + a darker fascia under the eaves: the roof sits ON the walls
     instead of being a triangle glued behind them */
  return `<path d="M${x - 2} ${baseY + 2} L${x + w / 2} ${baseY - peak} L${x + w + 2} ${baseY + 2} Z" fill="${dark}"/>
    <path d="M${x + 3} ${baseY} L${x + w / 2} ${baseY - peak + 4} L${x + w - 3} ${baseY} Z" fill="${face}"/>
    <rect x="${x - 2}" y="${baseY}" width="${w + 4}" height="4.5" fill="${dark}" rx="2"/>`;
}
function winlet(wx, wy, w, h, frame) {
  return `<rect x="${wx - 2}" y="${wy - 2}" width="${w + 4}" height="${h + 4}" rx="4" fill="${frame}"/>
    <rect x="${wx}" y="${wy}" width="${w}" height="${h}" rx="2.5" fill="#FBEECB"/>
    <rect x="${wx}" y="${wy}" width="${w}" height="${h / 2.4}" rx="2.5" fill="#FFF7E0"/>
    <path d="M${wx + w / 2} ${wy} v${h} M${wx} ${wy + h / 2} h${w}" stroke="${frame}" stroke-width="1.6"/>`;
}
function doorway(dx, ground, w, h, wood, knob) {
  return `<rect x="${dx - 3}" y="${ground - h - 4}" width="${w + 6}" height="${h + 4}" rx="4" fill="rgba(58,40,20,.28)"/>
    <path d="M${dx} ${ground} v-${h - w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V${ground} Z" fill="${wood}"/>
    <path d="M${dx + w / 2} ${ground} V${ground - h + 2}" stroke="rgba(0,0,0,.22)" stroke-width="1.4"/>
    <circle cx="${dx + w - 7}" cy="${ground - h / 2.4}" r="2.2" fill="${knob}"/>`;
}

function stall(x, on) {
  /* Market Row's stall: striped awning over a counter, produce out front —
     a market stall, not a shed with a red lid. */
  const wood = on ? '#B07A45' : '#6E6A5E', woodDk = on ? '#8C5F36' : '#57544B';
  const awnA = on ? '#C8524A' : '#5E5A52', awnB = on ? '#F2E3C2' : '#66625A';
  const scallops = [0, 1, 2, 3, 4].map((i) =>
    `<path d="M${x + 4 + i * 24.4} ${G - 78} a12.2 9 0 0 0 24.4 0 z" fill="${i % 2 ? awnB : awnA}"/>`).join('');
  return `<g>${shadow(x + 65, 72)}
    <rect x="${x + 14}" y="${G - 56}" width="102" height="56" fill="${wood}" rx="3"/>
    <rect x="${x + 14}" y="${G - 56}" width="102" height="56" fill="url(#wallShade)" rx="3"/>
    <path d="M${x + 10} ${G} h4 v-56 h-4 z M${x + 116} ${G} h4 v-56 h-4 z" fill="${woodDk}"/>
    <rect x="${x + 8}" y="${G - 62}" width="114" height="9" fill="${woodDk}" rx="3"/>
    <path d="M${x + 2} ${G - 78} l6 -26 h114 l6 26 z" fill="${awnA}"/>
    ${[1, 3].map((i) => `<path d="M${x + 2 + i * 24.4} ${G - 78} l1.2 -26 h22 l1.2 26 z" fill="${awnB}"/>`).join('')}
    <path d="M${x + 2} ${G - 78} l6 -26 h114 l6 26" fill="none" stroke="${on ? '#8C4038' : '#4E4B44'}" stroke-width="2.5" stroke-linejoin="round"/>
    ${scallops}
    <path d="M${x + 10} ${G - 74} v-26 M${x + 120} ${G - 74} v-26" stroke="${woodDk}" stroke-width="3" stroke-linecap="round"/>
    ${on ? `<rect x="${x + 22}" y="${G - 50}" width="58" height="14" rx="3" fill="#8C5F36"/>
      <circle cx="${x + 32}" cy="${G - 52}" r="6.5" fill="#E0603C"/><circle cx="${x + 46}" cy="${G - 54}" r="6.5" fill="#F0B429"/>
      <circle cx="${x + 60}" cy="${G - 52}" r="6.5" fill="#7CA84F"/><circle cx="${x + 39}" cy="${G - 47}" r="6" fill="#C8524A"/>
      <circle cx="${x + 53}" cy="${G - 47}" r="6" fill="#E8A33C"/>` : ''}
    ${doorway(x + 90, G, 22, 46, on ? '#7A5230' : '#4E4B44', '#F6E9C8')}
  </g>`;
}

function shed(x, on, jars) {
  /* The Jar Shed shows its jars through one broad window: the split IS the
     building's face, filled to the child's real ratios. */
  const wall = on ? '#E3CD9F' : '#6E6A5E';
  let inner = '';
  if (on) {
    const cols = ['#C4453C', '#2E7FA8', '#178A4C', '#8A5BD6'];
    jars.forEach((f, i) => {
      const jx = x + 20 + i * 24, jh = 34 * Math.max(0.08, Math.min(1, f));
      inner += `<rect x="${jx}" y="${G - 76}" width="19" height="40" rx="5.5" fill="#F7FBFB" opacity=".94"/>
        <rect x="${jx + 2}" y="${G - 38 - jh}" width="15" height="${jh}" rx="3.5" fill="${cols[i]}"/>
        <rect x="${jx + 2}" y="${G - 38 - jh}" width="15" height="${Math.min(5, jh)}" rx="2.5" fill="rgba(255,255,255,.35)"/>
        <rect x="${jx - 1}" y="${G - 79}" width="21" height="6" rx="3" fill="#B9C9CC"/>`;
    });
  }
  return `<g>${shadow(x + 65, 70)}
    <rect x="${x + 8}" y="${G - 90}" width="114" height="90" fill="${wall}" rx="3"/>
    <rect x="${x + 8}" y="${G - 90}" width="114" height="90" fill="url(#wallShade)" rx="3"/>
    ${gable(x, 130, G - 90, 30, on ? '#7E9C6A' : '#5E5A52', on ? '#5C7A4C' : '#4E4B44')}
    <rect x="${x + 15}" y="${G - 81}" width="100" height="50" rx="6" fill="${on ? '#54452F' : '#4E4B44'}" opacity=".85"/>
    <rect x="${x + 18}" y="${G - 78}" width="94" height="44" rx="4" fill="${on ? '#FDF9EE' : '#5E5A52'}" opacity=".3"/>
    ${inner}
    ${doorway(x + 52, G, 26, 36, on ? '#8E6238' : '#4E4B44', '#F0B429')}
  </g>`;
}

function yard(x, on, prog) {
  /* The Build Yard: a goal going up floor by floor inside real scaffolding,
     with a crane that leans over whatever floor is next. */
  const floors = 4, done = Math.floor(prog * floors + 0.001);
  const beam = on ? '#8A6A3E' : '#57544B';
  let f = '';
  for (let i = 0; i < floors; i++) {
    const y = G - 28 - (i + 1) * 25;
    const built = i < done;
    f += built
      ? `<rect x="${x + 24}" y="${y}" width="82" height="23" rx="2.5" fill="${on ? '#CDA97A' : '#6E6A5E'}"/>
         <rect x="${x + 24}" y="${y}" width="82" height="23" rx="2.5" fill="url(#wallShade)"/>
         <rect x="${x + 33}" y="${y + 5.5}" width="13" height="12" rx="2" fill="#F6E4B5"/>
         <rect x="${x + 59}" y="${y + 5.5}" width="13" height="12" rx="2" fill="#F6E4B5" opacity=".7"/>
         <rect x="${x + 84}" y="${y + 5.5}" width="13" height="12" rx="2" fill="#F6E4B5" opacity=".45"/>`
      : `<rect x="${x + 24}" y="${y}" width="82" height="23" rx="2.5" fill="none"
           stroke="rgba(250,244,226,.6)" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  }
  const craneY = G - 28 - Math.min(done + 1, floors) * 25 - 12;
  return `<g>${shadow(x + 65, 68)}
    <rect x="${x + 12}" y="${G - 28}" width="106" height="28" fill="${on ? '#AE9166' : '#6E6A5E'}" rx="3"/>
    <rect x="${x + 12}" y="${G - 28}" width="106" height="28" fill="url(#wallShade)" rx="3"/>
    ${f}
    <path d="M${x + 16} ${G} V${G - 128} M${x + 114} ${G} V${G - 128} M${x + 16} ${G - 128} H${x + 114}
      M${x + 16} ${G - 62} H${x + 114}" stroke="${beam}" stroke-width="4" stroke-linecap="round"/>
    <path d="M${x + 16} ${G - 62} l24 -30 M${x + 114} ${G - 62} l-24 -30" stroke="${beam}" stroke-width="2.4" stroke-linecap="round"/>
    ${on && done < floors ? `<path d="M${x + 118} ${G - 140} h-34 v6" stroke="#C05A43" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M${x + 84} ${G - 134} V${craneY}" stroke="#C05A43" stroke-width="2" stroke-dasharray="3 3"/>
      <rect x="${x + 78}" y="${craneY}" width="12" height="8" rx="2" fill="#F0B429"/>` : ''}
    ${on && done >= floors ? `<rect x="${x + 62}" y="${G - 150}" width="3" height="24" fill="${beam}"/>
      <path d="M${x + 65} ${G - 150} l20 -7 v13 z" fill="#C8524A"/>` : ''}
  </g>`;
}

function bank(x, on, hour) {
  /* The Bank: portico, pediment, and the clock that strikes interest in
     public. The colonnade gets real depth — shadowed flutes, capitals. */
  const stone = on ? '#E6DCC6' : '#6E6A5E', stoneDk = on ? '#C9BCA0' : '#5E5A52';
  const ang = (hour % 12) * 30 + 90;
  return `<g>${shadow(x + 65, 74)}
    <rect x="${x + 10}" y="${G - 84}" width="110" height="84" fill="${stone}" rx="2"/>
    <rect x="${x + 10}" y="${G - 84}" width="110" height="84" fill="url(#wallShade)" rx="2"/>
    ${[0, 1, 2, 3].map((i) => { const cx2 = x + 21 + i * 26; return `
      <rect x="${cx2}" y="${G - 80}" width="13" height="80" fill="${on ? '#F4EDDB' : '#7A7669'}" rx="2"/>
      <rect x="${cx2 + 9}" y="${G - 80}" width="4" height="80" fill="${stoneDk}" opacity=".55" rx="2"/>
      <rect x="${cx2 - 2}" y="${G - 84}" width="17" height="6" fill="${stoneDk}" rx="2"/>
      <rect x="${cx2 - 2}" y="${G - 8}" width="17" height="8" fill="${stoneDk}" rx="2"/>`; }).join('')}
    <rect x="${x + 2}" y="${G - 96}" width="126" height="13" fill="${on ? '#D5C9AE' : '#5E5A52'}" rx="2.5"/>
    <path d="M${x + 6} ${G - 96} L${x + 65} ${G - 124} L${x + 124} ${G - 96} Z" fill="${on ? '#CEC1A4' : '#57544B'}"/>
    <path d="M${x + 16} ${G - 98} L${x + 65} ${G - 120} L${x + 114} ${G - 98} Z" fill="${on ? '#EFE7D3' : '#66625A'}"/>
    <circle cx="${x + 65}" cy="${G - 106}" r="12.5" fill="${on ? '#FBF7EC' : '#8A8678'}" stroke="${on ? '#8A5B00' : '#57544B'}" stroke-width="2.5"/>
    ${on ? `<g stroke="#3A2E1A" stroke-width="2" stroke-linecap="round">
        <path d="M${x + 65} ${G - 106} l0 -8" transform="rotate(${ang} ${x + 65} ${G - 106})"/>
        <path d="M${x + 65} ${G - 106} l5.5 3"/></g>
      <circle cx="${x + 65}" cy="${G - 106}" r="1.6" fill="#3A2E1A"/>` : ''}
    ${doorway(x + 53, G, 24, 40, on ? '#6E5233' : '#4E4B44', '#F0B429')}
  </g>`;
}

function exch(x, on, up) {
  /* The Exchange: the board IS the facade, and it shows the market's real
     last move. Glass-and-teal against everyone else's timber. */
  const wall = on ? '#CFDCDE' : '#6E6A5E';
  const line = up ? '#5BC98C' : '#EC8B81';
  return `<g>${shadow(x + 65, 72)}
    <rect x="${x + 8}" y="${G - 102}" width="114" height="102" fill="${wall}" rx="4"/>
    <rect x="${x + 8}" y="${G - 102}" width="114" height="102" fill="url(#wallShade)" rx="4"/>
    <rect x="${x + 8}" y="${G - 102}" width="114" height="8" fill="${on ? '#3E6E77' : '#5E5A52'}" rx="3"/>
    <rect x="${x + 16}" y="${G - 90}" width="98" height="50" rx="5" fill="${on ? '#1D3236' : '#4E4B44'}"/>
    <rect x="${x + 16}" y="${G - 90}" width="98" height="50" rx="5" fill="none" stroke="${on ? '#3E6E77' : '#57544B'}" stroke-width="2"/>
    ${on ? `<path d="M${x + 22} ${G - 55} h86 M${x + 22} ${G - 68} h86 M${x + 22} ${G - 81} h86" stroke="rgba(255,255,255,.07)" stroke-width="1"/>
      <polyline points="${x + 22},${G - 54} ${x + 38},${G - 64} ${x + 54},${G - 58} ${x + 72},${G - 76} ${x + 88},${G - 70} ${x + 108},${G - 84}"
        fill="none" stroke="${line}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${x + 108}" cy="${G - 84}" r="3.4" fill="${line}"/>
` : ''}
    ${winlet(x + 22, G - 32, 18, 20, on ? '#3E6E77' : '#57544B')}
    ${winlet(x + 90, G - 32, 18, 20, on ? '#3E6E77' : '#57544B')}
    ${doorway(x + 53, G, 24, 36, on ? '#2E565E' : '#4E4B44', '#F6E9C8')}
  </g>`;
}

function shopN(x, on) {
  /* Nana Bizz's shop, shuttered until the child earns the keys. */
  const wall = on ? '#EFD9AF' : '#6E6A5E';
  return `<g>${shadow(x + 65, 72)}
    <rect x="${x + 8}" y="${G - 96}" width="114" height="96" fill="${wall}" rx="3"/>
    <rect x="${x + 8}" y="${G - 96}" width="114" height="96" fill="url(#wallShade)" rx="3"/>
    ${gable(x, 130, G - 96, 32, on ? '#B8563F' : '#5E5A52', on ? '#8F4132' : '#4E4B44')}
    ${on
      ? `<rect x="${x + 16}" y="${G - 84}" width="98" height="13" rx="3" fill="#C8524A"/>
         <text x="${x + 65}" y="${G - 74}" text-anchor="middle" font-size="9.5" font-weight="800"
           fill="#FBF3E2" font-family="Georgia,serif" letter-spacing=".08em">BIZZ &amp; CO</text>
         <rect x="${x + 18}" y="${G - 66}" width="60" height="34" rx="4" fill="#FBF3E2"/>
         <path d="M${x + 48} ${G - 66} v34 M${x + 18} ${G - 49} h60" stroke="#C8A96E" stroke-width="2"/>
         <circle cx="${x + 33}" cy="${G - 57}" r="5" fill="#E0603C"/><circle cx="${x + 62}" cy="${G - 57}" r="5" fill="#7CA84F"/>
         <rect x="${x + 28}" y="${G - 44}" width="12" height="9" rx="2" fill="#F0B429"/><rect x="${x + 55}" y="${G - 43}" width="14" height="8" rx="2" fill="#8A5BD6" opacity=".8"/>
         ${doorway(x + 88, G, 24, 38, '#7A5230', '#F0B429')}`
      : `<rect x="${x + 18}" y="${G - 76}" width="94" height="58" rx="4" fill="#4E4B44"/>
         ${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 21}" y="${G - 73 + i * 11.4}" width="88" height="8" rx="2.5" fill="#66625A"/>`).join('')}
         <rect x="${x + 40}" y="${G - 52}" width="50" height="12" rx="3" fill="#8A6A3E" transform="rotate(-8 ${x + 65} ${G - 46})"/>
         <text x="${x + 65}" y="${G - 43}" text-anchor="middle" font-size="8" font-weight="800" fill="#F6E9C8"
           transform="rotate(-8 ${x + 65} ${G - 46})">CLOSED</text>`}
  </g>`;
}

function lantern(x, lit) {
  /* Street lamps, one per streak day: a real lamppost head, not a lollipop. */
  return `<g>
    <path d="M${x} 14 v10" stroke="${lit ? '#5E5142' : 'rgba(94,81,66,.55)'}" stroke-width="3" stroke-linecap="round"/>
    <path d="M${x - 8} 26 h16 l-2.5 14 h-11 z" fill="${lit ? '#F5C544' : 'rgba(240,235,220,.55)'}"
      stroke="${lit ? '#5E5142' : 'rgba(94,81,66,.55)'}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M${x - 4} 42 h8" stroke="${lit ? '#5E5142' : 'rgba(94,81,66,.55)'}" stroke-width="2.6" stroke-linecap="round"/>
    ${lit ? `<circle cx="${x}" cy="33" r="15" fill="#F0B429" opacity=".18"/>
      <circle cx="${x}" cy="33" r="8" fill="#FFDF8E" opacity=".5"/>` : ''}
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
    else if (p.key === 'wallet') art = stall(p.x, on);
    else if (p.key === 'jars') art = shed(p.x, on, jars);
    else if (p.key === 'goals') art = yard(p.x, on, prog);
    else if (p.key === 'bank') art = bank(p.x, on, hour);
    else if (p.key === 'exchange') art = exch(p.x, on, up);
    else art = shopN(p.x, on);
    return `<g class="hot" data-act="town" data-arg="${p.key}" role="button" tabindex="0"
        aria-label="${esc(p.name)}${on ? '' : ' — opens when you finish ' + (needFor(p.sub) || 'the chapter')}">
      <rect class="bldg-glow" x="${p.x - 4}" y="${G - 190}" width="138" height="196" rx="10" fill="#F0B429" opacity="0"/>
      <g opacity="${on ? 1 : 0.42}">${art}</g>
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
