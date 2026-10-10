/* smartchoices.js — Smart Choices (docs/12 §2.2): one card, three modes, every choice real.

   It replaces Needs vs Wants and Scam Spotter, whose one binary-sort engine let a coin flip
   score 52–63%, and adds Better Buy — the price-of-one skill no game taught.

   · Needs and Wants: Need · Both · Want. "Both" only counts with the right reason chip.
   · Scam Spotter: Looks fine · It's a trap — and after a trap, tap the phrase that gives it
     away. The messages are assembled from parts (smartsim.js), so the shape decides.
   · Better Buy: two shelf tags; pick the cheaper per item, then TYPE the price of one, then
     see it worked out. Waste, the bigger pack that costs more, and buy-one-get-one-half-price
     arrive on Tricky; without division yet (M5) the same truth is shown as the same amount.

   A wrong answer HOLDS, with its note naming the thing and the right side, until Continue
   (§1.3). The round ends through the arcade's one door (kit.finish → roundEnd): the decision
   score against par, the level offer, the one pay path, the goals. The content and every sum
   come from smartsim.js; this module draws and listens, and does no money arithmetic.

   It rides in the arcade's chunk; the arcade hands it a kit rather than being imported back. */
import { esc, sfx } from './ui.js';
import { minorMoney } from './fmt.js';
import { ico } from './art.js';
import { R } from './runtime.js';
import { verdict } from './gamefx.js';
import { mathsMet } from './ledger.js';
import * as S from './smartsim.js';
import { padHtml, padKey, keyOf } from './typepad.js';
import { trainStyle } from './trainstyle.js';

/* G8 · one level for the card; each mode turns its own knobs at it (smartsim.js SC_KNOBS).
   Every mode is scored as a share of its round's own points, so par is that set. */
export const SC_TIERS = {
  easy:     { par: 1, says: 'Shorter rounds — eight cards, six messages, five shelves — and shelf prices in round numbers.' },
  standard: { par: 1, says: 'Twelve cards with three that are both, ten messages, six shelves with the big pack sometimes dearer.' },
  tricky:   { par: 1, says: 'A clock on each card and message, quieter traps, and shelves where you must think about waste and half-price offers.' },
};
/* three goals, one per mode, each a decision you can make; they pay nothing */
export const SC_GOALS = [
  { id: 'reason', name: 'Needs and Wants: every “both” backed by the right reason', check: (r) => r.mode === 'nw' && r.bothN > 0 && r.bothRight === r.bothN },
  { id: 'tell', name: 'Scam Spotter: every trap caught, and its tell found', check: (r) => r.mode === 'ss' && r.scamN > 0 && r.tellRight === r.scamN },
  { id: 'shelf', name: 'Better Buy: every shelf picked right, with its price typed', check: (r) => r.mode === 'bb' && r.n > 0 && r.pickRight === r.n && r.typedRight === r.n },
];
export const SC_PRACTISED = {
  nw: 'telling needs from wants — and saying why, when a thing is both',
  ss: 'spotting the shape of a scam, and the phrase that gives it away',
  bb: 'comparing prices by the price of one, and buying for what you need',
};
const OUTRO = {
  nw: 'The ones that were <b>both</b> are the point. A list of needs that never changes is a list somebody else wrote for you.',
  ss: 'Look for the <b>shape</b>, not the story: a reward or a fright, a hurry, and a secret. Capitals tell you nothing either way.',
  bb: 'The big pack is not always the cheap one, and the cheap one is not always the better buy for you. <b>The price of one</b> first, then what you need.',
};
const MODE_ICON = { nw: 'scales', ss: 'shield', bb: 'marginTag' };
const MODE_LINE = {
  nw: 'Need, want — or both, and why.',
  ss: 'Real message or trap? Then find the giveaway.',
  bb: 'Two shelf tags. Which is cheaper per item?',
};
const opening = (t, n = 6) => { const w = String(t).split(/\s+/); return w.length > n ? w.slice(0, n).join(' ') + '…' : t; };
const SIDE = { need: 'a need', want: 'a want', both: 'both' };

export function smartChoices(kit, seed = (Date.now() % 100000) | 0) {
  trainStyle();
  const level = kit.tier, K = S.SC_KNOBS[level] || S.SC_KNOBS.standard;
  const div = mathsMet(kit.K())('M5');
  const st = { seed, level, mode: null, deck: null, i: 0, step: 'pick', held: null, note: null, points: 0, max: 0,
    log: [], typed: '', choice: null, nudge: false, done: false, won: 0, run: null, div, left: 0 };
  let timer = 0, shownAt = 0;
  const card = () => st.deck[st.i];
  const clockMs = () => (st.mode === 'nw' ? K.nw.clock : st.mode === 'ss' ? K.ss.clock : 0);
  const stopClock = () => { if (timer) { clearTimeout(timer); st.left = Math.max(0, st.left - (Date.now() - shownAt)); } timer = 0; };
  const arm = (ms) => {
    if (timer) clearTimeout(timer); timer = 0;
    const c = clockMs(); if (!c || st.done || st.held) return;
    if (!((st.mode === 'nw' && st.step === 'side') || (st.mode === 'ss' && st.step === 'call'))) return;
    shownAt = Date.now(); st.left = ms != null ? ms : c;
    timer = setTimeout(() => { timer = 0; timeUp(); }, st.left);
  };

  /* ── choosing a mode ── */
  const chooseMode = (m) => {
    if (st.step !== 'pick' || !S.SC_MODES.includes(m)) return;
    st.mode = m; st.deck = S.scDeck(m, seed, level, { div }); st.max = S.scMax(m, st.deck);
    st.step = m === 'nw' ? 'side' : m === 'ss' ? 'call' : 'shelf';
    sfx.click(); arm(); R.render();
  };
  /* ── moving on ── */
  const advance = () => {
    st.i++; st.held = null; st.choice = null; st.typed = ''; st.nudge = false;
    if (st.i >= st.deck.length) { finish(); return; }
    st.step = st.mode === 'nw' ? 'side' : st.mode === 'ss' ? 'call' : 'shelf';
    arm();
  };
  const next = () => {
    if (!st.held || st.done) return;
    st.note = null; sfx.click(); advance(); R.render();
  };
  const timeUp = () => {
    if (st.done || st.held) return;
    const c = card();
    if (st.mode === 'nw') { st.log.push({ a: c.a, ok: false }); st.held = { ok: false, text: `The clock ran out. ${nwNamed(c)}${c.note ? ' ' + c.note : ''}` }; }
    else { st.log.push({ a: c.a, call: false, tell: false }); st.held = { ok: false, text: `The clock ran out. ${ssNamed(c)} ${c.note}`, tells: c.a === 'scam' }; }
    sfx.bad(); R.render();
  };

  /* ── Needs and Wants ── */
  const nwNamed = (c) => (c.a === 'both' ? `“${c.t}” is both — the reason: ${c.why[0].charAt(0).toLowerCase() + c.why[0].slice(1)}.` : `“${c.t}” is ${SIDE[c.a]}.`);
  const nwSide = (side) => {
    if (st.mode !== 'nw' || st.step !== 'side' || st.held || !SIDE[side]) return;
    const c = card();
    if (side === 'both' && c.a === 'both') { stopClock(); st.choice = 'both'; st.step = 'reason'; sfx.click(); R.render(); return; }
    stopClock();
    const ok = S.nwRight(c, side, null);
    settleNw(c, ok, side);
  };
  const nwChip = (k) => {
    if (st.mode !== 'nw' || st.step !== 'reason' || st.held) return;
    const c = card(); k = +k; if (!(k >= 0 && k < c.chips.length)) return;
    st.choice = k;
    settleNw(c, S.nwRight(c, 'both', k), 'both', k);
  };
  function settleNw(c, ok, side, chip = null) {
    st.log.push({ a: c.a, ok, side, chip });
    if (ok) {
      st.points += 1; sfx.good();
      st.note = { ok: true, text: `${nwNamed(c)}${c.note ? ' ' + c.note : ''}` };
      advance(); R.render();
      verdict(`.gplay [data-act="${c.a === 'both' ? 'scChip' : 'scSide'}"][data-arg="${c.a === 'both' ? chip : side}"]`, true);
      return;
    }
    sfx.bad();
    const lead = c.a === 'both' && side === 'both' ? 'Both is right — but not that reason.' : side === 'both' ? 'Not both, this time.' : 'Not this time.';
    const why = c.a === 'need' ? 'You would be in trouble without it.' : c.a === 'want' ? 'Lovely, and you would get through the week without it.' : '';
    st.held = { ok: false, side, chip, text: [lead, nwNamed(c), why, c.note || ''].filter(Boolean).join(' ') };
    st.step = c.a === 'both' && side === 'both' ? 'reason' : 'side';
    R.render();
    verdict(`.gplay [data-act="${chip != null ? 'scChip' : 'scSide'}"][data-arg="${chip != null ? chip : side}"]`, false);
  }

  /* ── Scam Spotter ── */
  const ssNamed = (m) => `“${opening(m.t)}” is ${m.a === 'scam' ? 'a trap' : 'real'}.`;
  const ssCall = (call) => {
    if (st.mode !== 'ss' || st.step !== 'call' || st.held || (call !== 'scam' && call !== 'safe')) return;
    stopClock();
    const m = card(), ok = call === m.a;
    if (ok && m.a === 'scam') { st.points += S.SS_POINTS.call; st.step = 'tell'; st.callOk = true; sfx.good(); R.render(); return; }
    st.log.push({ a: m.a, call: ok, tell: false });
    if (ok) {
      st.points += S.SS_POINTS.call; sfx.good();
      st.note = { ok: true, text: `${ssNamed(m)} ${m.note}` };
      advance(); R.render(); verdict('.gplay [data-act="scCall"][data-arg="safe"]', true); return;
    }
    sfx.bad();
    st.held = { ok: false, call, tells: m.a === 'scam',
      text: ['Not this time.', ssNamed(m), m.a === 'safe' ? 'Suspecting everything is its own kind of expensive.' : '', m.note].filter(Boolean).join(' ') };
    R.render(); verdict(`.gplay [data-act="scCall"][data-arg="${call}"]`, false);
  };
  const ssTell = (k) => {
    if (st.mode !== 'ss' || st.step !== 'tell' || st.held) return;
    const m = card(); k = +k; if (!(k >= 0 && k < m.ph.length)) return;
    const ok = m.tells.includes(k);
    st.log.push({ a: 'scam', call: true, tell: ok, tap: k });
    st.choice = k;
    const tells = m.tells.map((i) => `“${m.ph[i].t}”`).join(' and ');
    if (ok) {
      st.points += S.SS_POINTS.tell; sfx.good();
      st.note = { ok: true, text: `Found it: “${m.ph[k].t}” ${m.ph[k].role === 'secret' ? 'asks for a secret.' : 'is the hurry.'} ${m.note}` };
      advance(); R.render(); verdict(`.gplay [data-act="scTell"][data-arg="${k}"]`, true); return;
    }
    sfx.bad();
    const role = m.ph[k].role;
    const why = role === 'hook' ? 'Good news or bad news on its own is not the tell — real messages bring both.'
      : role === 'from' ? 'Who it says it is from proves nothing: anyone can type a name.' : 'That part is ordinary.';
    st.held = { ok: false, tap: k, tells: true, text: `A trap, rightly — but not that phrase. ${why} The giveaway: ${tells}. ${m.note}` };
    R.render(); verdict(`.gplay [data-act="scTell"][data-arg="${k}"]`, false);
  };

  /* ── Better Buy ── */
  const bbPick = (k) => {
    if (st.mode !== 'bb' || st.step !== 'shelf' || st.held) return;
    k = +k; if (k !== 0 && k !== 1) return;
    st.choice = k; st.step = 'type'; st.typed = ''; sfx.click(); R.render();
  };
  const bbKey = (k) => { if (st.mode !== 'bb' || st.step !== 'type' || st.held) return; st.nudge = false; st.typed = padKey(st.typed, String(k)); R.render(); };
  const bbCheck = () => {
    if (st.mode !== 'bb' || st.step !== 'type') return;
    if (st.held) { next(); return; }
    if (!st.typed || !/\d/.test(st.typed)) { st.nudge = true; R.render(); return; }
    const sh = card(), pickOk = st.choice === sh.answer, res = S.checkTyped(st.typed, sh.asks[st.choice]);
    st.points += (pickOk ? S.BB_POINTS.pick : 0) + (res.ok ? S.BB_POINTS.typed : 0);
    st.log.push({ pick: pickOk, typed: res.ok });
    st.held = { ok: pickOk && res.ok, pickOk, typedOk: res.ok, typed: res.typed };
    if (st.held.ok) sfx.good(); else sfx.bad();
    R.render(); verdict('.gplay .sctype .sbtype', res.ok);
  };

  /* ── the end ── */
  const tally = () => {
    const L = st.log, base = { mode: st.mode, points: st.points, max: st.max, n: st.deck.length };
    if (st.mode === 'nw') return Object.assign(base, { right: L.filter((x) => x.ok).length, bothN: L.filter((x) => x.a === 'both').length,
      bothRight: L.filter((x) => x.a === 'both' && x.ok).length, needWrong: L.filter((x) => x.a === 'need' && !x.ok).length, wantWrong: L.filter((x) => x.a === 'want' && !x.ok).length });
    if (st.mode === 'ss') return Object.assign(base, { right: L.filter((x) => x.call).length, scamN: L.filter((x) => x.a === 'scam').length,
      tellRight: L.filter((x) => x.tell).length, scamWrong: L.filter((x) => x.a === 'scam' && !x.call).length, safeWrong: L.filter((x) => x.a === 'safe' && !x.call).length });
    return Object.assign(base, { right: L.filter((x) => x.pick && x.typed).length, pickRight: L.filter((x) => x.pick).length, typedRight: L.filter((x) => x.typed).length });
  };
  function finish() {
    stopClock();
    st.done = true; st.step = 'done'; st.run = tally();
    kit.practised(SC_PRACTISED[st.mode]);
    st.won = kit.finish(st.run);
  }

  /* ── drawing ── */
  const noteHtml = () => (st.note ? `<div class="tcnote ok" role="status">${esc(st.note.text)}</div>` : '');
  const holdHtml = () => (st.held && st.mode !== 'bb' ? `<div class="sbhold no" role="status">${esc(st.held.text)}</div>
    <button class="btn wide" data-act="scNext">Continue · Enter</button>` : '');
  const pickView = () => `<div class="gcard scpick"><span class="eyebrow">Smart Choices · pick a table</span>
      <p class="sbq">Three ways to choose well. Each round is one of them.</p></div>
    <div class="sbpaths">${S.SC_MODES.map((m, i) => `<button class="opt scmode" data-act="scMode" data-arg="${m}"><span class="k">${i + 1}</span>
      <span class="sbpi">${ico(MODE_ICON[m], '', 22)}</span><span class="sbpt"><b>${esc(S.SC_MODE_NAME[m])}</b><span class="small">${esc(MODE_LINE[m])}${m === 'bb' && !div ? ' Same-amount shelves, until you have met dividing.' : ''}</span></span></button>`).join('')}</div>
    <p class="hint">Press 1, 2 or 3 — or tap one.</p>`;

  const nwView = () => {
    const c = card(), h = st.held, reason = st.step === 'reason';
    const clock = clockMs() && !h && !reason ? `<div class="tclock" aria-hidden="true"><i style="animation-duration:${clockMs()}ms;animation-delay:-${Math.max(0, clockMs() - st.left + (Date.now() - shownAt))}ms"></i></div>` : '';
    const sideBtn = (side, label, cls) => {
      const mark = h && !reason ? (side === c.a ? ' tcright' : side === h.side ? ' tcwrong' : '') : '';
      return `<button class="btn ${cls}${mark}" data-act="scSide" data-arg="${side}"${h || reason ? ' disabled' : ''}>${label}</button>`;
    };
    return `${clock}<div class="gcard"><span class="em">${ico(c.em, '', 44)}</span><span class="nm">${esc(c.t)}</span></div>
      ${h || reason ? '' : noteHtml()}
      ${reason ? `<div class="gcard sbask"><p class="sbq"><b>Both — but why?</b> Pick the reason.</p></div>
        <div class="sbpaths">${c.chips.map((w, k) => {
          const mark = h ? (k === c.reason ? ' ok' : k === h.chip ? ' no' : '') : '';
          return `<button class="opt scchip${mark}" data-act="scChip" data-arg="${k}"${h ? ' disabled' : ''}><span class="k">${k + 1}</span>${esc(w)}</button>`;
        }).join('')}</div>`
      : `<div class="grow"></div><div class="choices sc3">${sideBtn('need', '← Need', 'scneed')}${sideBtn('both', '↓ Both', 'scboth')}${sideBtn('want', 'Want →', 'scwant')}</div>`}
      ${holdHtml()}
      <p class="hint">${h ? 'Read why, then Continue: Enter, or tap.' : reason ? 'Number keys, or tap a reason.' : '← Need · ↓ Both · Want → (or 1 2 3), or tap. Both needs a reason.'}</p>`;
  };

  const ssView = () => {
    const m = card(), h = st.held, ch = S.SS_CHANNELS[m.ch], tell = st.step === 'tell';
    const clock = clockMs() && !h && !tell ? `<div class="tclock" aria-hidden="true"><i style="animation-duration:${clockMs()}ms;animation-delay:-${Math.max(0, clockMs() - st.left + (Date.now() - shownAt))}ms"></i></div>` : '';
    const body = tell
      ? `<div class="sctells">${m.ph.map((p, k) => {
          const mark = h ? (m.tells.includes(k) ? ' ok' : k === h.tap ? ' no' : '') : '';
          return `<button class="opt sctell${mark}" data-act="scTell" data-arg="${k}"${h ? ' disabled' : ''}><span class="k">${k + 1}</span><span>${esc(p.t)}</span></button>`;
        }).join('')}</div>`
      : `<p class="scbody">${m.ph.map((p, k) => `<span class="scph${h && h.tells && m.tells.includes(k) ? ' tell' : ''}">${esc(p.t)}</span>`).join(' ')}</p>`;
    const callBtn = (call, label, color) => {
      const mark = h && !tell ? (call === m.a ? ' tcright' : call === h.call ? ' tcwrong' : '') : '';
      return `<button class="btn${mark}" style="background:${color}" data-act="scCall" data-arg="${call}"${h || tell ? ' disabled' : ''}>${label}</button>`;
    };
    const n = st.deck.filter((x) => x.a === 'safe').length;
    return `${clock}<div class="gcard scmsg"><div class="scch">${ico(ch.icon, '', 20)}<span>${esc(ch.name)}</span></div>
        ${tell ? `<p class="sbq"><b>A trap, yes.</b> Now tap the phrase that gives it away.</p>` : ''}${body}</div>
      ${h || tell ? '' : noteHtml()}
      ${tell ? '' : `<div class="grow"></div><div class="choices">${callBtn('safe', '← Looks fine', 'var(--grow)')}${callBtn('scam', 'It\'s a trap →', 'var(--spend)')}</div>`}
      ${holdHtml()}
      <p class="hint">${h ? 'Read why, then Continue: Enter, or tap.' : tell ? 'Number keys, or tap the phrase.' : `← → (or 1 2), or tap. ${n} of these ${st.deck.length} ${n === 1 ? 'is' : 'are'} perfectly ordinary.`}</p>`;
  };

  /* Better Buy's words: every sentence and number comes from the shelf (smartsim.js) */
  const label = S.shelfLabel, question = S.shelfQuestion, working = S.shelfWorking;
  const typeQ = (sh) => S.shelfTypeQ(sh, st.choice);
  const tagHtml = (sh, i) => {
    const g = sh.good, t = sh.tags[i], h = st.held, chosen = st.choice === i;
    const mark = h ? (i === sh.answer ? ' ok' : chosen ? ' no' : '') : chosen ? ' sel' : '';
    const n = Math.min(12, t.count), icons = Array.from({ length: n }, () => ico(g.icon, '', n > 6 ? 16 : 22)).join('');
    return `<button class="sctag${mark}" data-act="scShelf" data-arg="${i}"${st.step !== 'shelf' ? ' disabled' : ''} aria-pressed="${chosen}">
      <span class="k">${i + 1}</span><span class="scicons" aria-hidden="true">${icons}</span>
      <span class="sclabel">${esc(label(g, t))}</span><b class="scprice tabnum">${S.shelfPrice(t)}</b></button>`;
  };
  const bbView = () => {
    const sh = card(), h = st.held;
    const w = h ? working(sh) : null;
    return `<div class="gcard sbask"><span class="eyebrow">Shelf ${st.i + 1} of ${st.deck.length} · Mags' General Store</span>
        <p class="sbq">${esc(question(sh))}</p></div>
      <div class="scshelf">${tagHtml(sh, 0)}${tagHtml(sh, 1)}</div>
      ${st.step === 'type' ? `<div class="gcard sbask sctype"><span class="eyebrow">Now prove it</span><p class="sbq">${esc(typeQ(sh))}</p>
        ${padHtml({ typed: st.typed, held: h ? { ok: h.typedOk } : null, act: 'scKey', check: 'scCheck', nudge: st.nudge })}
        ${h ? `<div class="sbhold ${h.ok ? 'ok' : 'no'}" role="status"><b>${h.pickOk ? 'The right pick.' : 'Not that one.'} ${h.typedOk ? 'And the right price.' : `You typed ${esc(st.typed)}; it is ${minorMoney(sh.asks[st.choice])}.`}</b>
          <ul class="scwork">${w.lines.map((l) => `<li>${l}</li>`).join('')}</ul><p>${w.end}</p></div>
          <button class="btn wide" data-act="scNext">${st.i + 1 < st.deck.length ? 'Next shelf' : 'How it went'} · Enter</button>` : ''}</div>` : ''}
      <p class="hint">${st.step === 'shelf' ? '1 or 2 (or ← →), or tap a tag.' : h ? 'Enter for the next one.' : 'Type it — the keys or the pad — then Enter.'}</p>`;
  };

  return {
    id: 'sc', st, stop: stopClock,
    /* back from a hidden tab: the card's clock carries on from where it stopped */
    resume() { if (!st.done && !st.held && clockMs() && !timer) arm(st.left); },
    /* for the tests: the round's content, for every mode, from this play's seed */
    deck: (m) => S.scDeck(m, seed, level, { div }),
    act(n, arg) {
      if (n === 'scMode') chooseMode(String(arg));
      else if (n === 'scSide') nwSide(String(arg));
      else if (n === 'scChip') nwChip(arg);
      else if (n === 'scCall') ssCall(String(arg));
      else if (n === 'scTell') ssTell(arg);
      else if (n === 'scShelf') bbPick(arg);
      else if (n === 'scKey') bbKey(String(arg));
      else if (n === 'scCheck') bbCheck();
      else if (n === 'scNext') next();
    },
    key(e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '')) return;
      if (st.done) { kit.endKey(e); return; }
      const k = e.key, num = parseInt(k, 10);
      if (st.held) { if (k === 'Enter' || k === ' ') { if (e.preventDefault) e.preventDefault(); next(); } return; }
      if (st.step === 'pick') { if (num >= 1 && num <= 3) chooseMode(S.SC_MODES[num - 1]); return; }
      if (st.step === 'side') {
        if (k === 'ArrowLeft' || k === '1') nwSide('need');
        else if (k === 'ArrowDown' || k === '2' || k === 'b' || k === 'B') { if (e.preventDefault) e.preventDefault(); nwSide('both'); }
        else if (k === 'ArrowRight' || k === '3') nwSide('want');
      } else if (st.step === 'reason') { if (num >= 1 && num <= card().chips.length) nwChip(num - 1); }
      else if (st.step === 'call') { if (k === 'ArrowLeft' || k === '1') ssCall('safe'); else if (k === 'ArrowRight' || k === '2') ssCall('scam'); }
      else if (st.step === 'tell') { if (num >= 1 && num <= card().ph.length) ssTell(num - 1); }
      else if (st.step === 'shelf') { if (k === '1' || k === 'ArrowLeft') bbPick(0); else if (k === '2' || k === 'ArrowRight') bbPick(1); }
      else if (st.step === 'type') { const p = keyOf(e); if (p) bbKey(p); else if (k === 'Enter') bbCheck(); }
    },
    view() {
      if (st.done) {
        const r = st.run;
        const sub = r.mode === 'nw' ? `Right: ${r.right} of ${r.n} · “both” with the right reason: ${r.bothRight} of ${r.bothN}`
          : r.mode === 'ss' ? `Calls right: ${r.right} of ${r.n} · tells found: ${r.tellRight} of ${r.scamN}`
            : `Shelves picked right: ${r.pickRight} of ${r.n} · prices typed right: ${r.typedRight} of ${r.n}`;
        return `<div class="stack">${kit.hud(['Done', kit.tierChip()])}
          ${kit.endCard(r.points >= r.max - 1 ? '🏅' : 'think', `${r.points} of ${r.max}`, `<span class="sbendsub">${esc(S.SC_MODE_NAME[r.mode])} · ${esc(sub)}</span>`,
            st.won, OUTRO[r.mode], r.mode === 'ss' ? 'nana' : r.mode === 'bb' ? 'mags' : 'pip')}</div>`;
      }
      const body = st.step === 'pick' ? pickView() : st.mode === 'nw' ? nwView() : st.mode === 'ss' ? ssView() : bbView();
      const chips = st.step === 'pick' ? [kit.tierChip(), 'Smart Choices'] : [kit.tierChip(), S.SC_MODE_NAME[st.mode], `${st.i + 1} / ${st.deck.length}`, `points ${st.points}`];
      return `<div class="stack">${kit.hud(chips)}
        <div class="stage scstage" data-mode="${st.mode || 'pick'}" data-step="${st.step}">${body}</div></div>`;
    },
  };
}
