/* setup.mjs — the first ten minutes and the grown-ups' card (A4, A5, M1, M2,
   E1, J1). Every check was watched failing first.

   Run: node test/setup.mjs */
const mem = {};
globalThis.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
const sim = await import('../src/sim.js');
const { demoState } = await import('../src/demo.js');
const { Store } = await import('../src/store.js');
const RC = await import('../src/reportcard.js');
const SESSION = await import('../src/session.js');
const { guessCurrency, AVATARS } = await import('../src/avatars.js');
const { readFileSync } = await import('node:fs');

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
console.log('\nSetup, demo, the grown-ups\' card, the session\n' + '─'.repeat(56));

/* A4 · a first name, an age band and an avatar — nothing else about the child */
{
  const c = sim.newChild('Ahana', 'builder', 'INR', 'koi');
  ok(c.avatar === 'koi' && AVATARS[c.avatar], 'a child is made with their chosen avatar from the family set');
  ok(sim.newChild('A', 'builder', 'INR').avatar === 'bizzy', 'a child who skips the picker gets the family default');
  const personal = Object.keys(c).filter((k) => /birth|dob|surname|lastname|email|photo|school|locat|address|phone|^age$/i.test(k));
  ok(personal.length === 0, 'the child record holds no other personal field', personal.join(','));
  const v = strip(readFileSync(new URL('../src/views.js', import.meta.url), 'utf8'));
  const ob = (v.match(/export function viewOnboard\(draft\) \{[\s\S]*?\n\}/) || [''])[0];
  const fields = [...ob.matchAll(/data-field="([^"]+)"/g)].map((m) => m[1]);
  ok(fields.length === 1 && fields[0] === 'name', 'setup has exactly one text field, and it is the first name', fields.join(','));
  ok(/data-act="obAvatar"/.test(ob) && /data-act="obBand"/.test(ob) && !/data-act="obCur"/.test(ob), 'setup asks a face and a band, and no longer asks for a currency');
  ok(guessCurrency('en-IN', 'Asia/Kolkata') === 'INR' && guessCurrency('en-US', 'America/Los_Angeles') === 'USD' && guessCurrency('en-GB', 'Europe/London') === 'GBP'
    && guessCurrency('de-DE', 'Europe/Berlin') === 'EUR' && guessCurrency('ar-AE', 'Asia/Dubai') === 'AED', 'the currency comes from the device, not a question');
}

/* A5 · ?demo is a labelled sample that never touches the real household */
{
  const s = demoState();
  ok(s.demo === true && s.kids.length === 1 && s.kids[0].learn.level > 1 && Object.keys(s.kids[0].learn.done).length >= 5, 'the sample has weeks of believable progress', `level ${s.kids[0].learn.level}`);
  const before = JSON.stringify(mem);
  Store.saveNow(s); Store.saveProfile(s); sim.save(s);
  await new Promise((r) => setTimeout(r, 250));
  ok(JSON.stringify(mem) === before, 'saving the sample writes nothing at all');
  const real = sim.newState(); real.kids.push(sim.newChild('Real', 'builder', 'INR'));
  Store.saveNow(real);
  ok(Object.keys(mem).length > 0, 'a real household still saves');
}

/* M1, M2 · the card's three measures, and decisions only from the log */
{
  const s = sim.newState(); const c = sim.newChild('Kabir', 'builder', 'INR'); s.kids.push(c);
  const r = RC.card(c, null);
  ok(r.time && r.progress && r.mastery && r.progress.of === 40, 'the card carries Time, Progress and Mastery', JSON.stringify({ t: r.time.minutes, p: r.progress.stops }));
  ok(r.decisions.length === 0, "a new child's card claims no decision — Nana's default is not theirs");
  const feed = { s: [{ a: 'finance', d: new Date().toISOString().slice(0, 10), m: 12, who: 'Kabir' }, { a: 'bee', d: new Date().toISOString().slice(0, 10), m: 30, who: 'Kabir' }, { a: 'finance', d: new Date().toISOString().slice(0, 10), m: 9, who: 'Riya' }] };
  ok(RC.card(c, feed).time.minutes === 12, "Time counts this app's minutes for this child only", String(RC.card(c, feed).time.minutes));
  ok(RC.card(demoState().kids[0], null).decisions.some((d) => /pay-day split/.test(d.label)), 'a split the child changed shows, read from the decision log');
  ok(RC.card(demoState().kids[0], null).mastery.held.length >= 1, 'mastery counts only what was shown again after a gap');
}

/* E1 · the session walks the three and ends with a summary */
{
  const s = sim.newState(); const c = sim.newChild('Mia', 'builder', 'INR'); s.kids.push(c);
  const n = SESSION.next(c, sim);
  ok(n && n.quest && n.act, 'a session knows where to go first', n && `${n.quest.t} → ${n.act}`);
  sim.questList(c).forEach((q) => sim.questTick(c, q.kind, q.n));
  ok(SESSION.status(c, sim).finished && !SESSION.next(c, sim), 'when the three are done there is nowhere left to go');
  const w0 = c.money.wallet;
  const sum = SESSION.finish(c, sim, Date.now() - 6 * 60000);
  ok(sum.practised.length === sim.questList(c).length && sum.paid > 0 && c.money.wallet - w0 === sum.paid && sum.minutes === 6, 'finishing pays what was earned and says what was practised', JSON.stringify(sum));
  ok(SESSION.finish(c, sim, Date.now()).paid === 0, 'finishing twice pays nothing twice');
}

/* J1 · a chapter is celebrated once */
{
  const c = sim.newChild('Zoe', 'builder', 'INR');
  ok(sim.badge(c, 'chapter-c1') === true && sim.badge(c, 'chapter-c1') === false, 'the chapter moment fires once, the first time it is earned');
  const m = strip(readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'));
  ok(/kind: 'chapter'/.test(m) && /kind: 'goalBuilt'/.test(m), 'finishing a chapter and building a goal each have their own moment');
}

console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exit(1);
