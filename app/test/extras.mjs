/* extras.mjs — every Shop extra has an effect a child can see (K4). A field the
   renderer ignores is worse than no field: it gets bought and changes nothing.
   Run: node test/extras.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) {} };
globalThis.document = undefined;
const sim = await import('../src/sim.js');
const { R } = await import('../src/runtime.js');
const { EXTRAS } = await import('../src/familyviews.js');
const { kidBadge } = await import('../src/shell.js');
const { townSVG } = await import('../src/town.js');
const { readFileSync } = await import('node:fs');
let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
console.log('\nExtras · each one changes something on screen\n' + '─'.repeat(56));
const s = sim.newState(); const c = sim.newChild('Ira', 'builder', 'INR'); s.kids.push(c); R.s = s;
ok(new Set(EXTRAS.map((x) => x.kind)).size >= 3, 'three kinds of thing to buy besides faces and worlds', [...new Set(EXTRAS.map((x) => x.kind))].join(', '));
ok(EXTRAS.every((x) => Number.isInteger(x.price) && x.price > 0), 'every extra has a fixed, printed price in coins');
const frames = EXTRAS.filter((x) => x.kind === 'frame');
ok(frames.every((x) => kidBadge({ ...c, fam: { frame: x.id } }, 40).includes('fr-' + x.id)), 'a frame changes the face wherever it shows');
const css = readFileSync(new URL('../styles/family.css', import.meta.url), 'utf8');
ok(frames.every((x) => css.includes('.kbadge.fr-' + x.id)), 'every frame has a drawing in the stylesheet');
const plain = townSVG(c);
const lit = EXTRAS.filter((x) => x.kind === 'lanterns').every((x) => { c.fam.lanterns = x.id; c.goodDays = [Math.floor(Date.now() / 864e5) - 0]; const t = townSVG(c); return t !== plain && t.includes(x.glow); });
ok(lit, 'street lanterns glow their colour on a good day');
const board = readFileSync(new URL('../src/board.js', import.meta.url), 'utf8');
ok(EXTRAS.filter((x) => x.kind === 'board').every((x) => board.includes(`'${x.id}'`)), 'every board skin is read by Main Street');
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
