/* icons.js — the icon system, hand-authored as SVG.

   What was here before was a generated raster set, and it was wrong three
   ways. It was muddy at 24-30px, which is the only size the app ever draws it
   at. It was baked light-mode, so in dark mode the icons kept their cream
   ground and sat on the page like stickers. And because the drawings were
   asked for rather than constructed, three different arcade games ended up
   with the same beige blob — an icon that does not distinguish is worse than
   the emoji it replaced, because emoji at least differ from each other.

   So: drawn here, in geometry, on one grid.

   THE GRID. 24x24, content inside 2..22. Strokes 1.7 at that scale, round cap
   and join, and every coordinate on a half-pixel so nothing blurs at 1x.

   THE STYLE is duotone: one soft body shape in an accent colour carrying the
   silhouette, crisp linework in currentColor on top of it. The body is what
   you recognise across the room; the linework is what makes it legible at
   20px. Both come from CSS — currentColor from the text colour it sits with,
   the accent from a token — so an icon is correct in both themes without a
   second drawing, which is the thing raster could never do.

   ONE ACCENT PER ICON, and it means something: treasure for money, grow for
   what increases, spend for what leaves, save for what is put by, give for
   people, action for everything structural. An icon whose accent is chosen
   for prettiness is a lie about the palette.

   Adding one: keep to the grid, give it a real silhouette at 20px, and check
   it against its neighbours in the same row rather than on its own. */

const A = { action: 'var(--action)', treasure: 'var(--treasure)', grow: 'var(--grow)',
            spend: 'var(--spend)', save: 'var(--save)', give: 'var(--give)' };

/* b = body (accent fill), l = linework (currentColor stroke), k = accent keynote */
const I = (accent, body, line, key) => ({ a: A[accent] || A.action, b: body || '', l: line || '', k: key || '' });

export const ICONS = {
  /* ── nav & chrome ───────────────────────────────────────────────────── */
  home: I('treasure',
    '<path d="M3.5 10.8 12 4.2l8.5 6.6V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/>',
    '<path d="M3.5 10.8 12 4.2l8.5 6.6"/><path d="M5.5 10.2V20h13v-9.8"/><path d="M9.5 21v-5.5h5V21"/>'),
  learn: I('save',
    '<path d="M4 4.5h6a2.5 2.5 0 0 1 2 2.4V20a2.2 2.2 0 0 0-2-1.4H4z"/>',
    '<path d="M12 6.9A2.5 2.5 0 0 1 14.5 4.5H20v14.1h-6a2.2 2.2 0 0 0-2 1.4 2.2 2.2 0 0 0-2-1.4H4V4.5h5.5A2.5 2.5 0 0 1 12 6.9z"/><path d="M12 6.9V20"/>'),
  money: I('treasure',
    '<circle cx="12" cy="12" r="8"/>',
    '<circle cx="12" cy="12" r="8"/><path d="M12 7.4v9.2"/><path d="M14.6 9.4a3 3 0 0 0-2.6-1.2c-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2.1 2.7 1 2.7 2.1-1.1 2-2.7 2a3 3 0 0 1-2.7-1.3"/>'),
  arcade: I('give',
    '<path d="M8 8h8a5 5 0 0 1 5 5v1.5a3 3 0 0 1-5.4 1.8l-.6-.8H9l-.6.8A3 3 0 0 1 3 14.5V13a5 5 0 0 1 5-5z"/>',
    '<path d="M8 8h8a5 5 0 0 1 5 5v1.5a3 3 0 0 1-5.4 1.8l-.6-.8H9l-.6.8A3 3 0 0 1 3 14.5V13a5 5 0 0 1 5-5z"/><path d="M7.4 11v2.4M6.2 12.2h2.4"/>',
    '<circle cx="16" cy="11.7" r="1"/><circle cx="18" cy="13.7" r="1"/>'),
  more: I('action', '', '', '<circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/>'),

  streak: I('spend',
    '<path d="M12 3.2c3.4 3 5 5.5 5 8a5 5 0 0 1-10 0c0-1.3.5-2.6 1.6-4 .3 1.2.9 2 1.8 2.3.1-2.3.6-4.4 1.6-6.3z"/>',
    '<path d="M12 3.2c3.4 3 5 5.5 5 8a5 5 0 0 1-10 0c0-1.3.5-2.6 1.6-4 .3 1.2.9 2 1.8 2.3.1-2.3.6-4.4 1.6-6.3z"/><path d="M12 20.8a3 3 0 0 0 3-3c0-1.2-1-2.3-3-3.4-2 1.1-3 2.2-3 3.4a3 3 0 0 0 3 3z"/>'),
  sun: I('treasure', '<circle cx="12" cy="12" r="4.2"/>',
    '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M4.4 12H2.2M21.8 12h-2.2M6.6 6.6 5.1 5.1M18.9 18.9l-1.5-1.5M6.6 17.4l-1.5 1.5M18.9 5.1l-1.5 1.5"/>'),
  moon: I('save', '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',
    '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>'),
  family: I('give',
    '<circle cx="8.5" cy="8" r="3"/><circle cx="16.5" cy="9.5" r="2.4"/>',
    '<circle cx="8.5" cy="8" r="3"/><path d="M3 20v-1.4A5.5 5.5 0 0 1 8.5 13a5.5 5.5 0 0 1 5.5 5.6V20"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M15.6 13.1a4.6 4.6 0 0 1 5.4 4.5V19"/>'),
  lock: I('action',
    '<rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2"/>',
    '<rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/><path d="M12 14.2v2.4"/>'),
  check: I('grow', '<circle cx="12" cy="12" r="8.6"/>',
    '<circle cx="12" cy="12" r="8.6"/><path d="m8.2 12.3 2.6 2.6 5-5.4"/>'),
  close: I('spend', '', '<path d="m6.8 6.8 10.4 10.4M17.2 6.8 6.8 17.2"/>'),
  gear: I('action', '<circle cx="12" cy="12" r="3.2"/>',
    '<circle cx="12" cy="12" r="3.2"/><path d="M19.2 14.6a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.84 2.84l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.7 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.84-2.84l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H2.6a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.3 8.7a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.84-2.84l.06.06a1.7 1.7 0 0 0 1.87.34H8.7a1.7 1.7 0 0 0 1.03-1.56V2.6a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.84 2.84l-.06.06a1.7 1.7 0 0 0-.34 1.87v.07a1.7 1.7 0 0 0 1.56 1.03h.17a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.56 1.03z"/>'),
  bell: I('treasure',
    '<path d="M6.2 16.4V11a5.8 5.8 0 0 1 11.6 0v5.4z"/>',
    '<path d="M6.2 16.4V11a5.8 5.8 0 0 1 11.6 0v5.4l1.6 2.1H4.6z"/><path d="M10 19.5a2 2 0 0 0 4 0"/>'),

  /* ── money & finance ────────────────────────────────────────────────── */
  coin: I('treasure', '<ellipse cx="12" cy="12" rx="8" ry="8"/>',
    '<circle cx="12" cy="12" r="8"/><path d="M12 7.6v8.8M14.3 9.6a2.7 2.7 0 0 0-2.3-1c-1.4 0-2.4.7-2.4 1.8s.9 1.5 2.4 1.9 2.4.9 2.4 1.9-1 1.8-2.4 1.8a2.7 2.7 0 0 1-2.4-1.1"/>'),
  wallet: I('treasure',
    '<path d="M3.5 8.2h14a2.5 2.5 0 0 1 2.5 2.5v6.8a2.5 2.5 0 0 1-2.5 2.5h-14z"/>',
    '<path d="M3.5 8.2V6.6a1.6 1.6 0 0 1 1.6-1.6h10.2a1.6 1.6 0 0 1 1.6 1.6v1.6"/><rect x="3.5" y="8.2" width="17" height="11.8" rx="2.4"/><path d="M20.5 12.4h-3.4a1.9 1.9 0 0 0 0 3.8h3.4"/>'),
  jars: I('save',
    '<path d="M6.6 10h4.2v9.4a1.4 1.4 0 0 1-1.4 1.4H8a1.4 1.4 0 0 1-1.4-1.4z"/><path d="M13.4 12.4h4.2v7a1.4 1.4 0 0 1-1.4 1.4h-1.4a1.4 1.4 0 0 1-1.4-1.4z"/>',
    '<path d="M6.6 8.4h4.2v11a1.4 1.4 0 0 1-1.4 1.4H8a1.4 1.4 0 0 1-1.4-1.4z"/><path d="M6 8.4h5.4M7.4 8.4V6.2h2.6v2.2"/><path d="M13.4 11.2h4.2v8.2a1.4 1.4 0 0 1-1.4 1.4h-1.4a1.4 1.4 0 0 1-1.4-1.4z"/><path d="M12.8 11.2h5.4M14.2 11.2V9.4h2.6v1.8"/>'),
  bank: I('action',
    '<path d="M4 10.4h16V18H4z"/>',
    '<path d="M2.8 9.6 12 4.4l9.2 5.2"/><path d="M4.8 10.4V18M9.6 10.4V18M14.4 10.4V18M19.2 10.4V18"/><path d="M3 20.4h18"/>'),
  chartUp: I('grow',
    '<path d="M4 20V4.5h16V20z"/>',
    '<path d="M4 4.5v15.5h16"/><path d="m7.2 15.6 3.4-3.9 2.7 2.4 4.5-5.3"/><path d="M17.8 8.8h-3M17.8 8.8v3"/>'),
  chartDown: I('spend',
    '<path d="M4 20V4.5h16V20z"/>',
    '<path d="M4 4.5v15.5h16"/><path d="m7.2 9.4 3.4 3.9 2.7-2.4 4.5 5.3"/><path d="M17.8 16.2h-3M17.8 16.2v-3"/>'),
  receipt: I('save',
    '<path d="M5.5 3.6h13v17l-2.2-1.4-2.2 1.4-2.1-1.4-2.2 1.4-2.1-1.4-2.2 1.4z"/>',
    '<path d="M5.5 3.6h13v17l-2.2-1.4-2.2 1.4-2.1-1.4-2.2 1.4-2.1-1.4-2.2 1.4z"/><path d="M8.6 8.2h6.8M8.6 12h6.8"/>'),
  shop: I('spend',
    '<path d="M4.5 10.6h15V20h-15z"/>',
    '<path d="M3.4 10.2 5 4.6h14l1.6 5.6a2.6 2.6 0 0 1-5 1 2.6 2.6 0 0 1-5.2 0 2.6 2.6 0 0 1-5-1z"/><path d="M5.2 11.6V20h13.6v-8.4"/><path d="M9.8 20v-5h4.4v5"/>'),
  cart: I('treasure',
    '<path d="M6.4 6.6h14l-1.7 7.6H8.1z"/>',
    '<path d="M2.8 4h2.3l2.9 11.6h10.4"/><path d="M5.9 6.6h15l-1.9 7.4H7.8"/><circle cx="9.4" cy="19.2" r="1.5"/><circle cx="17.4" cy="19.2" r="1.5"/>'),
  goal: I('grow',
    '<circle cx="12" cy="12" r="8"/>',
    '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.6"/>',
    '<circle cx="12" cy="12" r="1.7"/>'),
  shield: I('save',
    '<path d="M12 3.2 19.4 6v6c0 4.2-3 7.4-7.4 8.8C7.6 19.4 4.6 16.2 4.6 12V6z"/>',
    '<path d="M12 3.2 19.4 6v6c0 4.2-3 7.4-7.4 8.8C7.6 19.4 4.6 16.2 4.6 12V6z"/><path d="m9.2 12.2 2 2 3.6-4"/>'),
  handshake: I('give',
    '<path d="M3 9.6 7 6.4h4.4L14 8.6l3.4-1.6L21 9.9v5.4l-3 2-3.6-3-1.6 1.2-3-2.2-2.6 1.6L3 13.6z"/>',
    '<path d="M3 9.6 7 6.4h4.4L14 8.6l3.4-1.6L21 9.9"/><path d="M21 9.9v5.4l-3 2-4-3.3"/><path d="m3 9.6 1.2 4 2.6-1.6 3 2.2L11.4 13"/>'),
  factory: I('action',
    '<path d="M3.5 20V11l5.2 3.2V11l5.2 3.2V11l6.6 3.6V20z"/>',
    '<path d="M3.5 20V10.6l5.2 3.2v-3.2l5.2 3.2v-3.2l6.6 3.6V20z"/><path d="M17 10.6V4.4h2.8v6.9"/><path d="M3.5 20.4h17"/>'),
  house: I('grow',
    '<path d="M4.4 11.2 12 5.2l7.6 6v8.4H4.4z"/>',
    '<path d="M3 12.2 12 5l9 7.2"/><path d="M5.4 11.2v8.4h13.2v-8.4"/><path d="M9.6 19.6v-4.4h4.8v4.4"/>'),
  seed: I('grow',
    '<path d="M12 20c0-4.4 2.6-7.6 7-8.2-.4 4.4-3 7.4-7 8.2zM12 20c0-3.6-2-6.2-5.6-6.8.4 3.6 2.4 6.2 5.6 6.8z"/>',
    '<path d="M12 20.4v-5.6"/><path d="M12 15c0-4 2.6-7 7-7.6-.4 4.4-3 7.2-7 7.6z"/><path d="M12 17.4c0-3.2-1.8-5.6-5-6.2.4 3.4 2.2 5.6 5 6.2z"/>'),

  /* ── learning ───────────────────────────────────────────────────────── */
  lesson: I('save',
    '<path d="M5 4.6h5.2A2.6 2.6 0 0 1 12 6.6v12a2.4 2.4 0 0 0-1.8-1H5z"/>',
    '<path d="M12 6.6a2.6 2.6 0 0 1 1.8-2H19v13H13.8a2.4 2.4 0 0 0-1.8 1 2.4 2.4 0 0 0-1.8-1H5v-13h5.2A2.6 2.6 0 0 1 12 6.6z"/><path d="M12 6.6v12"/>'),
  quest: I('treasure',
    '<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    '<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'),
  repeat: I('save', '',
    '<path d="M4 11.2A6.2 6.2 0 0 1 10.2 5H19"/><path d="m16.2 2.2 3 2.8-3 2.8"/><path d="M20 12.8A6.2 6.2 0 0 1 13.8 19H5"/><path d="m7.8 21.8-3-2.8 3-2.8"/>'),
  medal: I('treasure',
    '<circle cx="12" cy="14.6" r="5.4"/>',
    '<circle cx="12" cy="14.6" r="5.4"/><path d="M8.6 9.6 6 3.4h4l2 4.6M15.4 9.6 18 3.4h-4l-1 2.3"/>'),
  trophy: I('treasure',
    '<path d="M7 3.8h10v5.6a5 5 0 0 1-10 0z"/>',
    '<path d="M7 3.8h10v5.6a5 5 0 0 1-10 0z"/><path d="M7 5.4H4.4v1.4a3.2 3.2 0 0 0 3 3.2M17 5.4h2.6v1.4a3.2 3.2 0 0 1-3 3.2"/><path d="M12 14.4v3.4M8.4 20.4h7.2"/>'),
  calendar: I('save',
    '<rect x="3.6" y="5.6" width="16.8" height="15" rx="2.2"/>',
    '<rect x="3.6" y="5.6" width="16.8" height="15" rx="2.2"/><path d="M3.6 10.2h16.8M8.4 3.4v4M15.6 3.4v4"/>'),
  dice: I('give',
    '<rect x="4" y="4" width="16" height="16" rx="3.4"/>',
    '<rect x="4" y="4" width="16" height="16" rx="3.4"/>',
    '<circle cx="8.6" cy="8.6" r="1.3"/><circle cx="15.4" cy="15.4" r="1.3"/><circle cx="12" cy="12" r="1.3"/>'),

  /* ── town & places ──────────────────────────────────────────────────── */
  town: I('treasure',
    '<path d="M3 20v-7.4l4.6-3.2 4.4 3v-4l5-3.4 4 2.8V20z"/>',
    '<path d="M3 20v-7.6l4.8-3.3 4.2 2.9"/><path d="M12 20V7.8l4.8-3.4L21 7.3V20"/><path d="M2.4 20.4h19.2"/><path d="M15.4 20v-3.4h2.8V20"/><path d="M6.4 20v-3h2.6v3"/>'),
  basket: I('treasure',
    '<path d="M3.6 10.4h16.8l-1.6 8.4a2 2 0 0 1-2 1.6H7.2a2 2 0 0 1-2-1.6z"/>',
    '<path d="M3.6 10.4h16.8l-1.6 8.4a2 2 0 0 1-2 1.6H7.2a2 2 0 0 1-2-1.6z"/><path d="M8 10.4a4 4 0 0 1 8 0"/><path d="M9.4 13.6v4M14.6 13.6v4"/>'),
  door: I('action',
    '<path d="M5.6 3.6h12.8V20H5.6z"/>',
    '<path d="M5.6 3.6h12.8v16.8H5.6z"/><circle cx="15" cy="12.4" r="1.1"/>'),
  postbox: I('spend',
    '<path d="M5 8.6h14V19a1.4 1.4 0 0 1-1.4 1.4H6.4A1.4 1.4 0 0 1 5 19z"/>',
    '<path d="M5 8.6a3.4 3.4 0 0 1 3.4-3.4h7.2A3.4 3.4 0 0 1 19 8.6V19a1.4 1.4 0 0 1-1.4 1.4H6.4A1.4 1.4 0 0 1 5 19z"/><path d="M8.4 11.6h7.2"/><path d="M12 5.2V2.6"/>'),
  envelope: I('save',
    '<rect x="3" y="5.6" width="18" height="12.8" rx="2.2"/>',
    '<rect x="3" y="5.6" width="18" height="12.8" rx="2.2"/><path d="m3.6 7 7.3 5.4a1.9 1.9 0 0 0 2.2 0L20.4 7"/>'),
  fountain: I('save',
    '<path d="M4 14.4h16v3.2a2.8 2.8 0 0 1-2.8 2.8H6.8A2.8 2.8 0 0 1 4 17.6z"/>',
    '<path d="M4 14.4h16v3.2a2.8 2.8 0 0 1-2.8 2.8H6.8A2.8 2.8 0 0 1 4 17.6z"/><path d="M12 14.4V7.6"/><path d="M12 7.6a3 3 0 0 1 3 3M12 7.6a3 3 0 0 0-3 3"/>'),

  flower: I('give',
    '<circle cx="12" cy="9.6" r="2.6"/>',
    '<circle cx="12" cy="9.6" r="2.6"/><path d="M12 7c0-2.2-.9-3.4-2.6-3.4S6.8 4.8 6.8 6.6 8 9.6 12 9.6"/><path d="M12 7c0-2.2.9-3.4 2.6-3.4s2.6 1.2 2.6 3c0 1.8-1.2 3-5.2 3"/><path d="M12 12.2c0 2.2-.9 3.4-2.6 3.4S6.8 14.4 6.8 12.6 8 9.6 12 9.6"/><path d="M12 12.2c0 2.2.9 3.4 2.6 3.4s2.6-1.2 2.6-3c0-1.8-1.2-3-5.2-3"/><path d="M12 12.2v8.2"/>'),
  parasol: I('spend',
    '<path d="M2.8 11.6a9.2 9.2 0 0 1 18.4 0z"/>',
    '<path d="M2.8 11.6a9.2 9.2 0 0 1 18.4 0z"/><path d="M12 2.4v9.2"/><path d="M12 11.6v7.2a2.2 2.2 0 0 0 4.4 0"/>'),

  /* ── work ───────────────────────────────────────────────────────────── */
  work: I('action',
    '<path d="M3 9h18v9.4a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 18.4z"/>',
    '<rect x="3" y="8.4" width="18" height="11.6" rx="2"/><path d="M8.6 8.4V6.2a1.8 1.8 0 0 1 1.8-1.8h3.2a1.8 1.8 0 0 1 1.8 1.8v2.2"/><path d="M3 13.4h18"/>'),
  box: I('treasure',
    '<path d="M3.4 8 12 4.4 20.6 8v8L12 19.6 3.4 16z"/>',
    '<path d="M3.4 8 12 11.6 20.6 8"/><path d="M12 11.6v8"/><path d="M3.4 8 12 4.4 20.6 8v8L12 19.6 3.4 16z"/>'),
  page: I('save',
    '<path d="M5.6 3.6h8.2l4.6 4.6V20.4H5.6z"/>',
    '<path d="M13.8 3.6H5.6v16.8h12.8V8.2z"/><path d="M13.6 3.8v4.4h4.6"/><path d="M8.6 13h6.8M8.6 16.4h4.6"/>'),
  broom: I('treasure',
    '<path d="M9.4 13.4h5.2l2.4 7H7z"/>',
    '<path d="M9.4 13.4h5.2l2.4 7H7z"/><path d="M12 13.4 18.6 4"/><path d="M10.6 17h2.8"/>'),
  run: I('grow',
    '<circle cx="14.6" cy="5.2" r="2.2"/>',
    '<circle cx="14.6" cy="5.2" r="2.2"/><path d="m6.6 20.4 2.8-4.6-2.6-2.8 1.6-4.4 3.8-1 2.8 2.8 3 .8"/><path d="m11 15.4 2.8 1.8 1.2 3.2"/>'),
  printer: I('action',
    '<path d="M4 9.6h16v6.2H4z"/>',
    '<path d="M7 9.6V4h10v5.6"/><path d="M4 9.6h16v6.2h-3v-2.6H7v2.6H4z"/><path d="M7 13.2h10v7H7z"/>'),
};

/* Emoji the icon set does not draw stay emoji on purpose: the store catalogue,
   the weather, the board's forty squares. Those are content, not chrome — a
   bespoke drawing per grocery item is a different and much larger job, and a
   half-drawn catalogue reads worse than an honest emoji one. This map is only
   for the icons that carry the app's structure. */
export const EMOJI_MAP = {
  '🏠': 'home', '🏡': 'house', '🏘': 'town', '🗺': 'town', '📗': 'learn', '📘': 'lesson',
  '📖': 'lesson', '📚': 'lesson', '🪙': 'coin', '💵': 'wallet', '🫙': 'jars', '🏛': 'bank',
  '📈': 'chartUp', '📉': 'chartDown', '💹': 'chartUp', '📊': 'chartUp', '🏪': 'shop',
  '🛒': 'cart', '🛍': 'cart', '🎮': 'arcade', '🎯': 'goal', '🛡': 'shield', '🤝': 'handshake',
  '🏭': 'factory', '🌱': 'seed', '🌿': 'seed', '🔒': 'lock', '🔥': 'streak', '☀': 'sun',
  '🌙': 'moon', '☾': 'moon', '👪': 'family', '⚙': 'gear', '🔔': 'bell', '✓': 'check',
  '✕': 'close', '🔁': 'repeat', '🏅': 'medal', '🏆': 'trophy', '🗓': 'calendar', '🎲': 'dice',
  '🧺': 'basket', '🌼': 'flower', '🌸': 'flower', '⛱': 'parasol', '☂': 'parasol', '🚪': 'door', '📬': 'postbox', '📮': 'postbox', '✉': 'envelope',
  '📨': 'envelope', '⛲': 'fountain', '📦': 'box', '📄': 'page', '📋': 'page', '🧾': 'receipt',
  '📒': 'receipt', '🧹': 'broom', '🏃': 'run', '🖨': 'printer', '⭐': 'quest', '🏗': 'work',
};
