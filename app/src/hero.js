/* hero.js — the screen header.

   Every screen opens the way the siblings' do: where you are, set in type,
   with the place itself painted beside it and the one number that matters.
   The cast still speak — as the header's line, with a small face — instead
   of a grey box parked at the top of every screen. A screen that opens with
   a card is a dashboard; a screen that opens with a name and a building is a
   place. */
import { BLD } from './buildings-gen.js';
import { face } from './art.js';

export function hero(o) {
  const b = o.art && BLD[o.art];
  return `<header class="shero${b || o.figure ? '' : ' noart'}"${o.tint ? ` style="--ja:${o.tint}"` : ''}>
    <div class="sh-text">
      ${o.eyebrow ? `<span class="eyebrow">${o.eyebrow}</span>` : ''}
      <h1>${o.title}</h1>
      ${o.big != null ? `<div class="sh-num"><span class="big"${o.bigStyle ? ` style="${o.bigStyle}"` : ''}>${o.big}</span>${o.sub ? `<span class="small muted">${o.sub}</span>` : ''}</div>` : ''}
      ${o.line ? `<p class="sh-line">${o.who ? face(o.who, 30) : ''}<span>${o.line}</span></p>` : ''}
      ${o.extra || ''}
    </div>
    ${b ? `<img class="sh-art" src="${b.src}" alt="" width="${b.w}" height="${b.h}">` : o.figure ? `<div class="sh-art fig">${o.figure}</div>` : ''}
  </header>`;
}
