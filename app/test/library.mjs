/* library.mjs — the Library's tools say their sentences from data (library.js LIB_TOOLS and
   LIB_SAYS, over the figures sim.js works out), so the page and My Feed say the same words:
   every tool's title and line, the loan, the snowball, the budget sandbox and the unit price
   checker read on the page exactly as the module says them, in rupees and dollars, and what
   they say is true (the week adds up; the cheaper pack is the cheaper one).
   Run: node test/library.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
globalThis.window = globalThis; globalThis.addEventListener = () => {};
const { R } = await import('../src/runtime.js');
const sim = await import('../src/sim.js');
const F = await import('../src/fmt.js');
const L = await import('../src/library.js');

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
const plain = (h) => String(h).replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
console.log('\nThe Library · its words are data, and true\n' + '─'.repeat(56));

const miss = [], wrong = [];
for (const cur of ['INR', 'USD', 'GBP']) {
  F.setCurrency(cur);
  for (const preset of [{}, { inU: 12, rentU: 6, foodU: 5, funU: 3, saveU: 4 }, { n1: 3, p1U: 9, n2: 6, p2U: 18 }, { n1: 12, p1U: 30, n2: 5, p2U: 14, loanU: 140, loanW: 12 }]) {
    R.s = sim.newState(); const c = sim.newChild('Asha', 'builder', cur); c.learn.level = 30; R.s.kids.push(c);
    R.lib = { ...L.LIB_START, ...preset };
    const page = plain(L.viewLibrary()), f = L.figures(c, R.lib), said = L.libSaid(f);
    const want = [...Object.values(L.LIB_TOOLS).flatMap((t) => [t.title, t.line]), L.LIB_SAYS.loan(said.loan), L.LIB_SAYS.grow(), L.LIB_SAYS.week(said.week), L.LIB_SAYS.weekBig(said.week), L.LIB_SAYS.unit(said.unit)].map(plain);
    want.filter((t) => !page.includes(t)).forEach((t) => miss.push(`${cur} ${JSON.stringify(preset)}: “${t.slice(0, 40)}”`));
    if (f.week.inn - f.week.out !== f.week.left || !L.LIB_SAYS.week(said.week).includes(F.money(Math.abs(f.week.left)))) wrong.push(`${cur} week`);
    const u = f.unit, cheaper = u.p1 / u.n1 < u.p2 / u.n2 ? 'A' : u.p1 / u.n1 > u.p2 / u.n2 ? 'B' : null;
    if (cheaper ? !L.LIB_SAYS.unit(said.unit).startsWith(`Pack ${cheaper} is cheaper`) : !/^Both cost/.test(L.LIB_SAYS.unit(said.unit))) wrong.push(`${cur} unit ${JSON.stringify(preset)}`);
  }
}
F.setCurrency('INR');
ok(!miss.length, 'every tool\'s title, line and sentence on the page is the module\'s own (LIB_TOOLS, LIB_SAYS) — rupees, dollars, pounds, four settings', miss.slice(0, 3).join(' | '));
ok(!wrong.length, 'what they say is true: the week adds up, and the cheaper pack is named', wrong.slice(0, 3).join(' | '));
ok(!L.figures(null, L.LIB_START).loan && L.figures(null, L.LIB_START).week && L.figures(null, L.LIB_START).unit, 'with no child, only the tools that read nothing of hers are worked out (My Feed cuts those, never a child\'s rate, trust or rule)');

console.log('─'.repeat(56) + `\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
