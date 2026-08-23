/* art.js — the cast, drawn as SVG so they cost nothing and scale anywhere.
   Warm, round, no teeth on anybody. Mags is drawn friendly on purpose:
   she is the impulse, not the villain (docs/02 §6). */

import { art } from './art-gen.js';

const F = (id, bg, body) =>
  `<svg viewBox="0 0 64 64" role="img" aria-label="${id}"><rect width="64" height="64" fill="${bg}"/>${body}</svg>`;

const eyes = (x1, x2, y, r) => `
  <circle cx="${x1}" cy="${y}" r="${r}" fill="#25201C"/>
  <circle cx="${x2}" cy="${y}" r="${r}" fill="#25201C"/>
  <circle cx="${x1 + r * 0.4}" cy="${y - r * 0.45}" r="${r * 0.36}" fill="#fff"/>
  <circle cx="${x2 + r * 0.4}" cy="${y - r * 0.45}" r="${r * 0.36}" fill="#fff"/>`;

export const CAST = {
  pip: {
    name: 'Pip', role: 'your neighbour on Market Row',
    svg: F('Pip the squirrel', '#FBEBD6', `
      <path d="M50 46c10-4 12-18 5-25-6-6-14-2-13 5 1 6 8 5 8 10 0 4-4 6-8 6z" fill="#C9752F"/>
      <path d="M49 44c7-4 8-14 3-19-4-4-9-1-8 3 1 5 6 5 6 9 0 3-2 5-5 6z" fill="#E29350"/>
      <ellipse cx="30" cy="44" rx="17" ry="16" fill="#D98338"/>
      <ellipse cx="30" cy="49" rx="11" ry="10" fill="#F6DEBE"/>
      <circle cx="30" cy="27" r="15" fill="#E29350"/>
      <path d="M19 17c-3-5 0-9 4-8s5 6 3 9zM41 17c3-5 0-9-4-8s-5 6-3 9z" fill="#E29350"/>
      <path d="M20 16c-1-3 0-4 2-4s3 3 2 5zM40 16c1-3 0-4-2-4s-3 3-2 5z" fill="#F2B183"/>
      <ellipse cx="30" cy="33" rx="9" ry="7" fill="#F6DEBE"/>
      ${eyes(25, 35, 25, 3.2)}
      <path d="M30 31c-1.6 0-2.6-1-2.6-2 0-.9 1-1.6 2.6-1.6s2.6.7 2.6 1.6c0 1-1 2-2.6 2z" fill="#2A2320"/>
      <path d="M26 35q4 3 8 0" stroke="#2A2320" stroke-width="1.4" fill="none" stroke-linecap="round"/>`),
  },
  mags: {
    name: 'Mags', role: "Bizzington's best salesperson",
    svg: F('Mags the magpie', '#E6EAF2', `
      <path d="M44 50c8-6 10-16 6-24l8 22z" fill="#2B3350"/>
      <ellipse cx="30" cy="42" rx="16" ry="17" fill="#2B3350"/>
      <ellipse cx="28" cy="46" rx="9" ry="11" fill="#F2F4F9"/>
      <circle cx="30" cy="24" r="13" fill="#2B3350"/>
      <path d="M22 30q8 6 16 0-2 8-8 8t-8-8z" fill="#3E4A75"/>
      ${eyes(25, 35, 22, 3)}
      <path d="M30 26l10 4-10 4z" fill="#E8B33F"/>
      <circle cx="47" cy="35" r="5" fill="#F0B429"/>
      <circle cx="45.4" cy="33.4" r="1.6" fill="#FFF0C4"/>`),
  },
  bo: {
    name: 'Bo', role: 'thinks it goes up',
    svg: F('Bo the bull calf', '#E7F1E4', `
      <ellipse cx="32" cy="44" rx="18" ry="16" fill="#B58C64"/>
      <circle cx="32" cy="28" r="15" fill="#C99B70"/>
      <path d="M17 20c-6-3-9 2-6 6 2 3 6 3 8 0zM47 20c6-3 9 2 6 6-2 3-6 3-8 0z" fill="#EFE3CE"/>
      <ellipse cx="32" cy="36" rx="10" ry="8" fill="#F1DCC4"/>
      <circle cx="28.5" cy="36" r="1.7" fill="#7A5B3C"/><circle cx="35.5" cy="36" r="1.7" fill="#7A5B3C"/>
      ${eyes(26, 38, 25, 3)}
      <path d="M25 15q7-4 14 0" stroke="#8E6A48" stroke-width="2" fill="none" stroke-linecap="round"/>`),
  },
  bea: {
    name: 'Bea', role: 'thinks it goes down',
    svg: F('Bea the bear cub', '#EFE7E0', `
      <circle cx="18" cy="18" r="7" fill="#6E5445"/><circle cx="46" cy="18" r="7" fill="#6E5445"/>
      <circle cx="18" cy="18" r="3.4" fill="#A98B77"/><circle cx="46" cy="18" r="3.4" fill="#A98B77"/>
      <ellipse cx="32" cy="44" rx="18" ry="16" fill="#7C6152"/>
      <circle cx="32" cy="30" r="16" fill="#8A6B5A"/>
      <ellipse cx="32" cy="38" rx="10" ry="8" fill="#D9C3B2"/>
      <path d="M32 35c-2 0-3.2-1.2-3.2-2.4 0-1.1 1.4-1.9 3.2-1.9s3.2.8 3.2 1.9c0 1.2-1.2 2.4-3.2 2.4z" fill="#3A2C24"/>
      <path d="M28 40q4 3 8 0" stroke="#3A2C24" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      ${eyes(26, 38, 27, 3)}`),
  },
  nana: {
    name: 'Nana Bizz', role: 'retired, from the shuttered shop',
    svg: F('Nana Bizz the tortoise', '#E4EFE8', `
      <ellipse cx="42" cy="46" rx="20" ry="15" fill="#4E7A55"/>
      <ellipse cx="42" cy="46" rx="20" ry="15" fill="none" stroke="#3B5F42" stroke-width="2"/>
      <path d="M30 44h24M42 33v26M34 36l16 18M50 36L34 54" stroke="#3B5F42" stroke-width="1.6" opacity=".5"/>
      <circle cx="26" cy="28" r="14" fill="#7FA86F"/>
      <ellipse cx="26" cy="34" rx="8" ry="6" fill="#A5C795"/>
      ${eyes(20, 32, 25, 3.1)}
      <circle cx="20" cy="25" r="7" fill="none" stroke="#2F3A33" stroke-width="1.3"/>
      <circle cx="32" cy="25" r="7" fill="none" stroke="#2F3A33" stroke-width="1.3"/>
      <path d="M27 25h1" stroke="#2F3A33" stroke-width="1.3"/>
      <path d="M22 34q4 2.5 8 0" stroke="#2F3A33" stroke-width="1.4" fill="none" stroke-linecap="round"/>`),
  },
};

/* The drawn portrait if we have one, the hand-authored SVG if we don't — so
   a missing asset degrades to the old art instead of to a hole. */
export function face(who, size) {
  const c = CAST[who] || CAST.pip;
  const img = art('cast-' + who);
  const inner = img
    ? `<img src="${img}" alt="${c.name}" width="256" height="256" loading="lazy"
        style="width:100%;height:100%;object-fit:cover;display:block">`
    : c.svg;
  return `<span class="who" style="${size ? `width:${size}px;height:${size}px` : ''}">${inner}</span>`;
}
export function portrait(who) {
  const c = CAST[who] || CAST.pip;
  const img = art('cast-' + who);
  return img ? `<img src="${img}" alt="${c.name}" style="width:100%;height:100%;object-fit:cover;display:block">` : c.svg;
}

/* A line of dialogue. Everything the app teaches is said by somebody. */
export function say(who, text) {
  const c = CAST[who] || CAST.pip;
  return `<div class="say">${face(who)}<div class="bub"><span class="nm">${c.name}</span>${text}</div></div>`;
}
