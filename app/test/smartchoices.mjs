/* smartchoices.mjs — Smart Choices (docs/12 §2.2), T9, and what a child would complain about:
   · a game a coin flip can pass (the old Needs vs Wants and Scam Spotter scored 52–63% by chance);
   · "both" as a free point;
   · capitals as the tell ("ALL CAPS = scam" scored 8 of 10 on the old cards);
   · a shelf whose right answer is wrong, or a price of one that is not whole coins;
   · a sum on the screen the screen worked out for itself;
   · division asked of a child who has not met it.
   Every check here was watched failing once (the commit message says how each was broken).
   Run: node test/smartchoices.mjs */
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
globalThis.Image = class {};
import { readFileSync } from 'node:fs';
const { R } = await import('../src/runtime.js');
const sim = await import('../src/sim.js');
const AR = await import('../src/arcade.js');
const F = await import('../src/fmt.js');
const S = await import('../src/smartsim.js');
const { SOURCES } = await import('../src/sources.js');
const { play, typed } = await import('./_bots.mjs');

let pass = 0, fail = 0;
const ok = (label, cond, detail = '') => { const c = !!cond; if (c) pass++; else fail++; console.log((c ? '  ok  ' : '  FAIL ') + label + (detail ? '   ' + detail : '')); };
R.render = () => {};
const fresh = (cur = 'INR', ceiling = null) => { F.setCurrency(cur); R.s = sim.newState(); R.s.kids.push(sim.newChild('Asha', 'builder', cur)); const c = R.s.kids[0]; c.learn.level = ceiling ? 1 : 30; if (ceiling) c.maths = { ceiling }; return c; };
const LV = ['easy', 'standard', 'tricky'];
const plain = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');
/* a seeded coin, so a "random" round replays */
const coin = (seed) => { let x = seed >>> 0 || 1; return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; }; };

console.log('\nSmart Choices · T9\n' + '─'.repeat(56));

/* ── the card: one hub, three tables, the two old cards gone ── */
{
  const ids = AR.GAMES.map((g) => g.id);
  ok('Smart Choices is one card; Needs vs Wants and Scam Spotter are no longer cards of their own', ids.includes('sc') && !ids.includes('nw') && !ids.includes('ss'), ids.join(','));
  fresh(); AR.startGame('sc', 1, 'standard'); const v = R.game.view();
  ok('it opens on the three tables — Needs and Wants, Scam Spotter, Better Buy — keys 1 2 3 or a tap', ['nw', 'ss', 'bb'].every((m) => v.includes(`data-act="scMode" data-arg="${m}"`)) && /Needs and Wants/.test(v) && /Scam Spotter/.test(v) && /Better Buy/.test(v));
  R.game.key({ key: '3' }); ok('a key picks the table', R.game.st.mode === 'bb' && R.game.st.step === 'shelf');
  AR.quitGame();
}

/* ── Needs and Wants: a pool of 60+, shuffled per play; "both" needs its reason ── */
{
  ok('a pool of 60 or more cards, with both sides and the "both" kind all in it', S.NEEDS.length >= 60 && ['need', 'want', 'both'].every((a) => S.NEEDS.filter((x) => x.a === a).length >= 10), `${S.NEEDS.length}: ${['need', 'want', 'both'].map((a) => S.NEEDS.filter((x) => x.a === a).length).join(' / ')}`);
  ok('every "both" card has its right reason and two that sound fine and are not — all different', S.NEEDS.filter((x) => x.a === 'both').every((x) => Array.isArray(x.why) && x.why.length === 3 && new Set(x.why).size === 3));
  ok('no card is in the pool twice', new Set(S.NEEDS.map((x) => x.t)).size === S.NEEDS.length);
  const a = S.needsDeck(11).map((x) => x.t).join('|'), b = S.needsDeck(11).map((x) => x.t).join('|'), c = S.needsDeck(12).map((x) => x.t).join('|');
  ok('the deck is shuffled per play: the same seed deals the same cards, another seed others', a === b && a !== c);
  let seen = new Set(); for (let s = 1; s <= 40; s++) S.needsDeck(s).forEach((x) => seen.add(x.t));
  ok('forty plays reach most of the pool, so a replay is practice and not memory', seen.size >= S.NEEDS.length * 0.9, `${seen.size} of ${S.NEEDS.length}`);
  /* "both" is never a free point: an always-Both player, and one who says Both and then guesses the reason */
  for (const lv of LV) {
    let pts = 0, max = 0;
    for (let s = 1; s <= 200; s++) S.needsDeck(s, lv).forEach((c2) => { max++; if (S.nwRight(c2, 'both', 0)) pts++; });
    ok(`${lv}: an always-"Both" player scores ${(100 * pts / max).toFixed(0)}% — "both" is not a free point`, pts / max <= 0.2);
  }
  const both = S.needsDeck(3).find((x) => x.a === 'both');
  ok('a "both" card counts only with Both AND its right reason — a side alone, or the wrong reason, is wrong',
    S.nwRight(both, 'both', both.reason) && !S.nwRight(both, 'need', null) && !S.nwRight(both, 'want', null) && both.chips.every((_, k) => k === both.reason || !S.nwRight(both, 'both', k)));
  fresh(); const g = play('sc', 5, 'standard', 'best', { mode: 'nw' }); const v = g.view();
  ok('the outro is kept: "a list somebody else wrote for you"', /a list somebody else wrote for you/.test(v));
  AR.quitGame();
}

/* ── Scam Spotter: generated from parts; the shape decides, not capitals ── */
{
  let traps = 0, loudT = 0, reals = 0, loudR = 0, shapeBad = [], caseOnly = 0;
  for (const lv of LV) for (let s = 1; s <= 300; s++) {
    const d = S.scamDeck(s, lv);
    if (d.filter((m) => m.a === 'scam').length * 2 !== d.length) shapeBad.push(`${lv}/${s}: not half traps`);
    d.forEach((m) => {
      const roles = m.ph.map((p) => p.role);
      if (m.a === 'scam') { traps++; if (m.loud) loudT++; if (!roles.includes('secret') || !roles.includes('hook') || !m.tells.length) shapeBad.push(`${lv}/${s}: a trap without its shape`); }
      else { reals++; if (m.loud) loudR++; if (roles.includes('secret') || roles.includes('hurry') || m.tells.length) shapeBad.push(`${lv}/${s}: a real message with a tell`); }
      if (!['text', 'email', 'chat'].includes(m.ch)) shapeBad.push('channel ' + m.ch);
      if (m.t !== m.t.toLowerCase() && m.ph.some((p) => p.t === p.t.toUpperCase() && /[A-Z]{3}/.test(p.t)) !== m.loud) caseOnly++;
    });
  }
  ok('every trap is a hook, a secret (and often a hurry) on a channel; no real message has a secret or a hurry; half of every round is real', !shapeBad.length, shapeBad.slice(0, 3).join(' | ') || `${traps} traps, ${reals} real`);
  ok('ordinary messages sometimes shout, and traps are often polite', loudR / reals > 0.25 && (traps - loudT) / traps > 0.5, `real shouting ${(100 * loudR / reals).toFixed(0)}% · traps polite ${(100 * (traps - loudT) / traps).toFixed(0)}%`);
  ok('a message shouts exactly when it was drawn loud — capitals come from the draw, never from being a trap', caseOnly === 0, `${caseOnly} odd`);
  /* "ALL CAPS = scam": exactly as many traps as real ones shout, so it is chance every round */
  const capsAcc = [];
  for (const lv of LV) for (let s = 1; s <= 300; s++) { const d = S.scamDeck(s, lv); capsAcc.push(d.filter((m) => (S.shouts(m) ? 'scam' : 'safe') === m.a).length / d.length); }
  ok('"ALL CAPS = scam" calls no better than chance — on every one of 900 rounds', capsAcc.every((x) => x <= 0.5), `max ${Math.max(...capsAcc).toFixed(2)}`);
  /* played: the caps player through the game, scored like anyone else */
  for (const lv of LV) {
    let pts = 0, max = 0, calls = 0, n = 0;
    for (let s = 1; s <= 120; s++) { fresh(); const g = play('sc', s, lv, 'caps', { mode: 'ss', rnd: coin(s) }); pts += g.st.run.points; max += g.st.run.max; calls += g.st.run.right; n += g.st.run.n; AR.quitGame(); }
    ok(`${lv}: "ALL CAPS = scam", played, calls ${(100 * calls / n).toFixed(0)}% right and scores ${(100 * pts / max).toFixed(0)}% — no better than a coin`, calls / n <= 0.5 && pts / max <= 0.35);
  }
  const m = S.scamDeck(4).find((x) => x.a === 'scam');
  ok('the notes are kept: "the secrecy is the tell" is how a secret is named', S.scamDeck(4).concat(S.scamDeck(5), S.scamDeck(6)).some((x) => /The secrecy is the tell/.test(x.note)) && /secret/.test(m.note));
  ok('My Feed\'s ten scam cards come from the same generator, real and trap alike', S.SS_EXAMPLES.length === 10 && AR.SS === S.SS_EXAMPLES && S.SS_EXAMPLES.some((x) => x.a === 'safe') && S.SS_EXAMPLES.every((x) => x.t && x.note));
}

/* ── T9 · a coin flip scores 35% or less in every table, at every level, through the game ── */
for (const mode of ['nw', 'ss', 'bb']) {
  const rows = [];
  for (const lv of LV) {
    let pts = 0, max = 0;
    for (let s = 1; s <= 150; s++) { fresh(); const g = play('sc', s, lv, 'random', { mode, rnd: coin(s * 7 + 1) }); pts += g.st.run.points; max += g.st.run.max; AR.quitGame(); }
    rows.push([lv, pts / max]);
  }
  ok(`T9 · ${S.SC_MODE_NAME[mode]}: a coin-flip player scores ≤ 35% on every level`, rows.every(([, x]) => x <= 0.35), rows.map(([l, x]) => `${l} ${(100 * x).toFixed(1)}%`).join(' · '));
}
{
  fresh(); const g = play('sc', 9, 'standard', 'best', { mode: 'ss' });
  ok('a careful player scores every point in every table', ['nw', 'ss', 'bb'].every((mode) => { fresh(); const h = play('sc', 9, 'standard', 'best', { mode }); return h.st.run.points === h.st.run.max; }) && g.st.run.tellRight === g.st.run.scamN);
  AR.quitGame();
}

/* ── Better Buy: every pair's right answer proved by the generator, and again from the tags ── */
{
  const bad = []; let n = 0;
  for (const cur of ['INR', 'USD', 'GBP', 'EUR', 'AED']) {
    F.setCurrency(cur);
    for (const lv of LV) for (const div of [true, false]) for (let s = 1; s <= 200; s++) for (const sh of S.buyDeck(s, lv, { div })) {
      n++;
      const p = S.shelfProof(sh); if (!p.ok) bad.push(`${cur}/${lv}/${div}/${s}: ${p.why}`);
    }
  }
  F.setCurrency('INR');
  ok(`T9 · every Better Buy shelf's answer is proved from its own tags: whole prices of one, never equal, the answer the cheaper (${n} shelves, 5 currencies)`, !bad.length, bad.slice(0, 3).join(' | '));
  /* the proof itself catches a wrong shelf */
  const sh = S.buyDeck(1, 'standard')[0], broken = Object.assign({}, sh, { answer: 1 - sh.answer });
  const odd = Object.assign({}, sh, { tags: [Object.assign({}, sh.tags[0], { price: sh.tags[0].price + 1 }), sh.tags[1]] });
  ok('…and the proof fails a shelf whose answer is flipped, or whose price of one is not whole', !S.shelfProof(broken).ok && !S.shelfProof(odd).ok);
  /* re-proved from the screen: read each tag's count and price as drawn, and the answer follows */
  const shown = [];
  for (const cur of ['INR', 'USD', 'GBP', 'EUR', 'AED']) for (const lv of LV) for (let s = 1; s <= 12; s++) {
    fresh(cur); AR.startGame('sc', s, lv); const g = R.game; g.act('scMode', 'bb');
    while (!g.st.done) {
      const sh2 = g.st.deck[g.st.i], v = g.view();
      const labels = [...v.matchAll(/<span class="sclabel">([^<]+)<\/span>/g)].map((m) => m[1]);
      if (labels.length !== 2 || sh2.tags.some((t, i) => t.kind !== 'bogof' && !labels[i].startsWith(String(t.count) + ' '))) shown.push(`${cur}/${lv}/${s}: labels ${labels.join(' / ')}`);
      g.act('scShelf', sh2.answer); for (const ch of typed(sh2.asks[sh2.answer])) g.act('scKey', ch); g.act('scCheck');
      if (!(g.st.held && g.st.held.pickOk && g.st.held.typedOk)) shown.push(`${cur}/${lv}/${s}: the right pick and price were not taken`);
      const w = plain(g.view());
      if (sh2.kind !== 'waste' && sh2.div !== false && !sh2.tags.every((t, i) => w.includes(F.minorMoney(sh2.each[i]) + ' each'))) shown.push(`${cur}/${lv}/${s}: the working does not say both prices of one`);
      g.act('scNext');
    }
    AR.quitGame();
  }
  ok('on screen: every tag says its count, the right pick and its price typed as a child would type it are taken, and the working says both prices of one', !shown.length, shown.slice(0, 3).join(' | '));
  F.setCurrency('INR');
  /* the judgement layer at Tricky: waste where cheaper-each is NOT cheaper for you, the bigger pack dearer, half-price offers both ways */
  const T = []; for (let s = 1; s <= 200; s++) T.push(...S.buyDeck(s, 'tricky'));
  const waste = T.filter((x) => x.kind === 'waste'), bogof = T.filter((x) => x.kind === 'bogof'), bigdear = T.concat(...Array.from({ length: 50 }, (_, s) => S.buyDeck(s + 1, 'standard'))).filter((x) => x.kind === 'bigdear');
  ok('Tricky: waste shelves where the cheaper-each pack is not the better buy for what you need — and some where it is', waste.some((x) => x.cheaperEach !== x.answer) && waste.some((x) => x.cheaperEach === x.answer), `${waste.filter((x) => x.cheaperEach !== x.answer).length} of ${waste.length} turn on waste`);
  ok('"the big bottle costs more per litre": on a bigger-is-dearer shelf, the bigger pack is never the answer', bigdear.length > 50 && bigdear.every((x) => { const big = x.tags[0].count > x.tags[1].count ? 0 : 1; return x.answer !== big; }));
  ok('"buy one, get one half price" is sometimes the better price and sometimes not', bogof.some((x) => x.tags[x.answer].kind === 'bogof') && bogof.some((x) => x.tags[x.answer].kind !== 'bogof'));
  const easy = []; for (let s = 1; s <= 100; s++) easy.push(...S.buyDeck(s, 'easy'));
  ok('Easy uses round numbers: every price of one a whole number of the bigger coin', easy.every((x) => x.each.every((e) => e % S.shelfStep('easy') === 0)), `step ${S.shelfStep('easy')}`);
}

/* ── a price typed the way a child writes it, in every currency ── */
{
  const T = (cur, str, want) => { F.setCurrency(cur); const r = S.checkTyped(str, want); F.setCurrency('INR'); return r.ok; };
  ok('a price of one is read as written: "35" or "0.35" for 35¢, "1.25" for $1.25, "15" for ₹15 — and "125" for $1.25 is not taken',
    T('USD', '35', 35) && T('USD', '0.35', 35) && T('USD', '1.25', 125) && T('GBP', '80', 80) && T('AED', '0.75', 75) && T('INR', '15', 15) && !T('USD', '125', 125) && !T('USD', '36', 35) && !T('INR', '1.5', 15));
}

/* ── the arithmetic gate: division (M5) before the price of one ── */
{
  fresh('INR', 3); AR.startGame('sc', 4, 'standard'); let g = R.game; const v0 = g.view(); g.act('scMode', 'bb');
  const noDiv = g.st.deck.every((x) => x.div === false && x.tags[0].count !== x.tags[1].count && Math.max(...x.tags.map((t) => t.count)) % Math.min(...x.tags.map((t) => t.count)) === 0);
  const asks = /cost, bought in/.test(g.view().replace(/<[^>]+>/g, '')) || (g.act('scShelf', 0), /cost, bought in/.test(plain(g.view())));
  ok('before division (M5): Better Buy compares the same amount — the big pack against enough small ones — and asks a multiplication, and the table says so', noDiv && asks && /Same-amount shelves/.test(v0));
  AR.quitGame();
  fresh('INR', 12); AR.startGame('sc', 4, 'standard'); g = R.game; g.act('scMode', 'bb'); g.act('scShelf', 0);
  ok('with division met, it asks the price of one', g.st.deck.every((x) => x.div !== false) && /How much is one/.test(plain(g.view())));
  AR.quitGame();
}

/* ── the money rule: every sum is smartsim's; the view only says them ── */
{
  const src = readFileSync(new URL('../src/smartchoices.js', import.meta.url), 'utf8');
  const Fd = '(price|each|asks|costs|sameCost|single|half|by|count|need|spare|packsFor|times|step)';
  const sums = [...src.matchAll(new RegExp(`\\.${Fd}\\b(?:\\[[^\\]]+\\])?\\s*[-+*/%](?![=>])|[-+*/%]\\s*[A-Za-z_]\\w*(?:\\.\\w+)*\\.${Fd}\\b`, 'g'))].map((m) => m[0]);
  ok('smartchoices.js does no arithmetic on a price, a count or a cost — it says smartsim.js\'s numbers', !sums.length, sums.slice(0, 4).join(' | '));
  ok('smartchoices.js never prices anything itself (no price() or minorPrice())', !/\b(minor)?[pP]rice\(/.test(src));
  const said = SOURCES.shelf && SOURCES.shelf.value();
  ok('every shelf price is a registered town dial (sources.js "shelf"), and the register counts the goods on the shelves', SOURCES.shelf.kind === 'own' && S.GOODS === S.SHELF.goods && /smartsim\.js · SHELF/.test(SOURCES.shelf.where) && said.startsWith(['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][S.GOODS.length] + ' goods'), said);
}

/* ── keys alone, and taps alone, play a whole round of every table ── */
{
  const rows = [];
  for (const mode of ['nw', 'ss', 'bb']) {
    fresh(); AR.startGame('sc', 21, 'standard'); const g = R.game, st = g.st;
    g.key({ key: String(['nw', 'ss', 'bb'].indexOf(mode) + 1) });
    for (let guard = 0; guard < 500 && !st.done; guard++) {
      const c = st.deck[st.i];
      if (st.held) { g.key({ key: 'Enter' }); continue; }
      if (st.step === 'side') g.key({ key: { need: 'ArrowLeft', both: 'ArrowDown', want: 'ArrowRight' }[c.a] });
      else if (st.step === 'reason') g.key({ key: String(c.reason + 1) });
      else if (st.step === 'call') g.key({ key: c.a === 'scam' ? 'ArrowRight' : 'ArrowLeft' });
      else if (st.step === 'tell') g.key({ key: String(c.tells[0] + 1) });
      else if (st.step === 'shelf') g.key({ key: String(c.answer + 1) });
      else if (st.step === 'type') { for (const ch of typed(c.asks[st.choice])) g.key({ key: ch }); g.key({ key: 'Enter' }); }
    }
    rows.push([mode, st.done && st.run.points === st.run.max]);
    AR.quitGame();
  }
  ok('the keyboard alone plays a perfect round of every table', rows.every(([, x]) => x), JSON.stringify(rows));
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
