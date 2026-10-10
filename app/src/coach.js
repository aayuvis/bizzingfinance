/* coach.js — the Coach page (#/coach), Bizzing Bee's coach desk in Finance's idiom.

   Bee's page, in Bee's order, read from what THIS app records and nothing else:
     1. Pip's one-sentence read on the child, on a band in the colour of the trap it names —
        with today's rings beside it, which open the thirty-day chart on My page
     2. the traps, as a bar chart of the town's cast: tap one to read it
     3. the selected trap as a path: What goes wrong → The trick (and a check to run in your
        head) → Watch it work (the lessons' own examples and written-out sums) → Beat it,
        which starts practice on exactly the stops that trap caught
     4. the ladder: the rank you stand on, and what the next rung opens in the town
     5. one money habit a day, “Another one →”
     6. the numbers: ideas held (mastery.js), to revisit (the deck), good days this week,
        first-try answers (metrics.js) — and the child's own worst misses as chips
   The rulebook (coachrules.js) and this view load lazily, like the stories: nothing here is
   on the first screen. mastery.js stays the only module that says an idea is held — this
   page counts its states and says nothing of its own about learning. */
import { R } from './runtime.js';
import * as sim from './sim.js';
import { esc } from './ui.js';
import { face, ico, CAST } from './art.js';
import { pipPose } from './shell.js';
import { cardById, practiceFor } from './cards.js';
import { RANKS, rankObj, UNLOCKS, isOpen, CHAPTERS } from './content.js';
import * as mastery from './mastery.js';
import * as mistakes from './mistakes.js';
import * as M from './metrics.js';
import { worked } from './worked.js';
import { egFor } from './sprout.js';
import { dayIndex } from './fmt.js';
import { RULES, HABITS, DOORS, read } from './coachrules.js';

const K = () => sim.kid(R.s);
const plain = (s) => String(s || '').replace(/<[^>]+>/g, '');

/* the stops "Beat it" practises: the trap's own missed stops, most-missed first, that the
   town can ask fresh (cards.js practiceFor); a trap whose stops cannot be asked fresh opens
   its most-missed stop instead */
export function beatIds(t) {
  return (t ? t.worst : []).map((w) => w.id).filter((id) => { const k = cardById(id); return k && practiceFor(k); });
}

/* what Beat it does for one trap: the stops to turn over, or the one stop to open */
export function beatPlan(c, k) {
  const t = read(c).traps.find((x) => x.k === k); if (!t || !RULES[k]) return null;
  return { ids: beatIds(t), open: t.worst[0] ? t.worst[0].id : (RULES[k].egs[0] || [])[0], label: RULES[k].label };
}

const CSS = `<style>
.coach{display:flex;flex-direction:column;gap:16px}
.co-hero{position:relative;border-radius:22px;padding:clamp(16px,3vw,22px);color:#fff;
  background:linear-gradient(135deg,var(--tc),#191428 92%);box-shadow:var(--sh-raised)}
.co-hero-in{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:16px;align-items:center}
.co-read{display:flex;gap:clamp(10px,2vw,16px);align-items:center;min-width:0}
.co-read .pip{flex:none;width:clamp(64px,12vw,92px);height:auto}
.co-k{display:block;font:800 11.5px var(--ui,inherit);letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.8);margin:0 0 5px}
.co-line{font-family:var(--bz-display,Georgia,serif);font-weight:700;font-size:clamp(16px,2.4vw,20px);line-height:1.4;margin:0;color:#fff}
.co-line b{color:#fff;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}
.coach .who{display:inline-block;flex:none;border-radius:50%;overflow:hidden;line-height:0}
.coach .who img,.coach .who svg{width:100%;height:100%;display:block;object-fit:cover}
.co-face{flex:none;border-radius:50%;overflow:hidden;line-height:0;box-shadow:0 0 0 3px rgba(255,255,255,.55)}
.co-rings{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);
  border-radius:16px;padding:12px 14px;color:#fff;cursor:pointer;font:inherit}
.co-rings:hover{background:rgba(255,255,255,.18)}
.co-rl{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;line-height:1.35}
.co-rl i{flex:none;width:8px;height:8px;border-radius:3px;background:var(--d)}
.co-rl span{color:rgba(255,255,255,.82)}.co-rl b{margin-left:auto;font-variant-numeric:tabular-nums;white-space:nowrap}
.co-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:16px;align-items:start}
.co-col{display:flex;flex-direction:column;gap:16px;min-width:0}
.co-h{font:800 16px var(--bz-display,Georgia,serif);margin:0 0 10px;color:var(--ink)}
.co-trap{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:8px 10px;border-radius:12px;border:1.5px solid transparent;background:transparent;color:var(--ink);cursor:pointer;font:inherit;min-height:48px}
.co-trap[aria-pressed="true"]{background:var(--surface2);border-color:var(--tc)}
.co-trap .who{flex:none;border-radius:50%;overflow:hidden}
.co-trap .nm{display:block;font-weight:800;font-size:13.5px;margin-bottom:4px}
.co-bar{display:block;height:8px;border-radius:4px;background:var(--surface2);overflow:hidden}
.co-bar i{display:block;height:100%;border-radius:4px;background:var(--tc)}
.co-n{flex:none;font:800 16px var(--mono,monospace);color:var(--ink);min-width:2ch;text-align:right}
.co-dh{display:flex;align-items:center;gap:12px;padding-bottom:12px;flex-wrap:wrap}
.co-dh h2{margin:0;font-size:clamp(18px,3vw,22px);line-height:1.15}
.co-beat{flex:none;margin-left:auto;padding:12px 18px;border-radius:12px;border:0;background:var(--tc);color:#fff;font:800 14px var(--ui,inherit);cursor:pointer;box-shadow:var(--edge);min-height:44px}
.co-step{display:flex;gap:11px;align-items:flex-start;padding:12px 0;border-top:1px solid var(--line)}
.co-step > b{flex:none;width:26px;height:26px;border-radius:50%;background:var(--sc);color:#fff;display:grid;place-items:center;font-size:13px}
.co-step h3{margin:2px 0 4px;font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink)}
.co-step p{margin:0;font-size:14px;line-height:1.55}
.co-check{margin-top:9px;padding:10px 12px;border-radius:11px;background:color-mix(in srgb,var(--tc) 13%,var(--surface));font-size:13.5px;line-height:1.5}
.co-eg{padding:9px 0;border-top:1px dashed var(--line)}.co-eg:first-child{border-top:0}
.co-eg a{font-weight:800;color:var(--ink)}
.co-eg ol{margin:6px 0 0;padding-left:20px;font-size:13px;line-height:1.5;color:var(--ink)}
.co-eg .small{display:block;margin-top:3px}
.co-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.co-stat{padding:12px;border-radius:13px;background:var(--surface2)}
.co-stat b{display:block;font:800 clamp(20px,3.4vw,24px) var(--mono,monospace);line-height:1;color:var(--ink)}
.co-stat span{display:block;font-size:10.5px;font-weight:750;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-top:5px}
.co-chips{display:flex;flex-wrap:wrap;gap:7px}
.co-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--ink);font-weight:750;font-size:13px;text-decoration:none;min-height:40px}
.co-chip i{width:8px;height:8px;border-radius:50%;background:var(--tc);flex:none}
.co-chip em{font-style:normal;color:var(--muted);font-weight:700}
.co-rungs{display:flex;gap:6px;margin:2px 0 12px}
.co-rung{flex:1;text-align:center;padding:8px 2px;border-radius:10px;font-size:11.5px;font-weight:800;color:var(--muted);background:var(--surface2)}
.co-rung.done{color:var(--ink)}.co-rung.on{background:var(--action);color:var(--action-ink)}
.co-next{padding:11px 13px;border-radius:12px;background:var(--treasure-tint,#FFF1CC);color:var(--ink);font-size:13.5px;line-height:1.55;margin-top:10px}
.co-tip{display:flex;gap:12px;align-items:flex-start}
.co-tip .pip{flex:none;width:56px;height:auto}
.co-tipnext{margin-top:12px;display:flex;align-items:center;gap:10px}
@media (max-width:760px){ .co-hero-in,.co-grid{grid-template-columns:1fr} }
</style>`;

function ringPanel(c) {
  const m = M.today(c), done = M.allClosed(m);
  return `<button class="co-rings" data-act="goto" data-arg="#/me/metrics" aria-label="${esc(M.ringLabel(m))} — the last thirty days">
    <span style="flex:none">${M.ringsSVG(72, [m.pApp, m.pPrac, m.pRight])}</span>
    <span style="min-width:0;flex:1;display:flex;flex-direction:column;gap:3px">
      <span class="co-k" style="margin:0 0 2px">Today${done ? ' ✓' : ''}</span>
      ${M.lines(m).map((l) => `<span class="co-rl" data-m="${l.k}"><i style="--d:${l.col}"></i><span>${l.lab}</span><b>${esc(l.v)}<span>/${esc(l.t)}</span></b></span>`).join('')}
      <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,.78);margin-top:3px">the last 30 days →</span>
    </span></button>`;
}

export function viewCoach() {
  const c = K(), rd = read(c), traps = rd.traps.filter((t) => RULES[t.k]);
  const sel = traps.find((t) => t.k === R.coachTrap) || traps[0] || null;
  const top = traps[0] || null, maxN = top ? top.n : 1;
  const tc = top ? RULES[top.k].col : '#00798A';

  /* 1 · Pip's read */
  const hero = `<section class="co-hero" style="--tc:${tc}" aria-labelledby="co-h1">
    <div class="co-hero-in">
      <div class="co-read">
        ${pipPose(top ? 'think' : 'wave', 92, '')}
        <div style="min-width:0;flex:1">
          <h1 class="co-k" id="co-h1">Coach · Pip’s read on ${esc(c.name)}</h1>
          <p class="co-line" data-read="${top ? top.k : ''}">${rd.sentence}</p>
        </div>
        ${top ? `<span class="co-face">${face(RULES[top.k].face, 60)}</span>` : ''}
      </div>
      ${ringPanel(c)}
    </div></section>`;

  /* 2 · the traps, as a bar chart of the cast */
  const chart = traps.length ? `<section class="card" aria-labelledby="co-traps"><h2 class="co-h" id="co-traps">What trips you up</h2>
      <div style="display:flex;flex-direction:column;gap:4px">${traps.slice(0, 7).map((t) => { const r = RULES[t.k], on = sel && sel.k === t.k;
        return `<button class="co-trap" data-act="coachTrap" data-arg="${t.k}" aria-pressed="${!!on}" style="--tc:${r.col}">
          ${face(r.face, 36)}
          <span style="flex:1;min-width:0"><span class="nm">${esc(r.label)}</span><span class="co-bar"><i style="width:${Math.max(12, Math.round(t.n / maxN * 100))}%"></i></span></span>
          <span class="co-n" aria-label="${t.n} ${t.n === 1 ? 'miss' : 'misses'}">${t.n}</span></button>`; }).join('')}</div>
      <p class="small muted" style="margin-top:8px">Counted from the questions you missed first time and haven’t put right yet, and from ideas that slipped when they came back after a gap.</p></section>` : '';

  /* 3 · the selected trap, as a path */
  let detail;
  if (!sel) {
    detail = `<section class="card co-empty" style="text-align:center;padding:26px 18px" aria-labelledby="co-empty-h">
      ${pipPose('sleep', 96, '')}
      <h2 id="co-empty-h" style="margin:8px 0 6px;font-size:19px">Nothing to read yet</h2>
      <p class="small muted" style="max-width:34em;margin:0 auto">Walk a few stops and come back. Every question you get wrong first time tells me something about how you think about money — which is the one time a miss is worth more than a right answer.</p>
      <button class="btn" style="margin-top:14px" data-act="goto" data-arg="#/continue">Go and get some wrong →</button></section>`;
  } else {
    const r = RULES[sel.k], ids = beatIds(sel), own = sel.worst[0] && cardById(sel.worst[0].id);
    const step = (n, title, col, body) => `<div class="co-step" style="--sc:${col}"><b aria-hidden="true">${n}</b><div style="min-width:0;flex:1"><h3>${title}</h3>${body}</div></div>`;
    const egs = r.egs.map(([id, why]) => { const k = cardById(id); if (!k) return ''; const w = worked(id);
      return `<div class="co-eg"><a href="#/atlas/${esc(id)}">${esc(k.title)}</a>
        <span class="small muted">${esc(plain(egFor(k, c)))}</span>
        ${w ? `<ol>${w.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
        <span class="small" style="color:var(--ink)">${esc(why)}</span></div>`; }).join('');
    detail = `<section class="card co-detail" style="--tc:${r.col}" data-trap="${sel.k}" aria-labelledby="co-sel">
      <div class="co-dh">${face(r.face, 56)}
        <div style="min-width:0;flex:1"><h2 id="co-sel">${esc(r.label)}</h2>
          <div class="small muted">caught you <b style="color:var(--ink)">${sel.n}</b> ${sel.n === 1 ? 'time' : 'times'} · ${esc(CAST[r.face] ? CAST[r.face].name : 'Pip')} explains</div></div>
        <button class="co-beat" data-act="coachBeat" data-arg="${sel.k}">Beat it →</button></div>
      ${step(1, 'What goes wrong', '#B23B3B', `<p>${esc(r.mistake)}</p>${own ? `<p class="small muted" style="margin-top:6px">One of yours: <a href="#/atlas/${esc(own.id)}" style="color:var(--ink);font-weight:800">${esc(own.title)}</a> — missed ${sel.worst[0].n === 1 ? 'once' : sel.worst[0].n + ' times'}.</p>` : ''}`)}
      ${step(2, 'The trick', r.col, `<p>${esc(r.rule)}</p><div class="co-check"><b>A check to run in your head:</b> ${esc(r.check)}</div>`)}
      ${step(3, 'Watch it work', '#1E7A4C', `<div>${egs}</div>`)}
      ${ids.length ? '' : `<p class="small muted" style="margin-top:8px">These stops are asked fresh only on the Atlas — Beat it opens the one that caught you most.</p>`}
    </section>`;
  }

  /* 4 · the ladder */
  const lv = c.learn.level, rank = rankObj(lv), ri = RANKS.indexOf(rank), nextRank = RANKS[ri + 1], xb = sim.xpBar(c);
  const door = Object.keys(UNLOCKS).find((k) => UNLOCKS[k] && !isOpen(c, k));
  const doorCh = door && CHAPTERS.find((x) => x.id === UNLOCKS[door]);
  const ladder = `<section class="card" aria-labelledby="co-ladder"><h2 class="co-h" id="co-ladder">Where you stand</h2>
    <div class="co-rungs">${RANKS.map((x, i) => `<span class="co-rung${i === ri ? ' on' : i < ri ? ' done' : ''}" ${i === ri ? 'aria-current="step"' : ''}>${esc(x.name)}</span>`).join('')}</div>
    <p style="margin:0;font-size:14px;line-height:1.55"><b>${esc(rank.name)} · level ${lv}.</b> This rung is ${esc(rank.of)}. ${xb.need} XP to level ${lv + 1}.</p>
    <div class="co-next"><b>Coming next:</b> ${doorCh ? `finishing “${esc(doorCh.title)}” opens ${esc(DOORS[door])}.` : 'every building in the town is open to you.'}
      ${nextRank ? ` At level ${nextRank.at} you become a ${esc(nextRank.name)} — ${esc(nextRank.of)}.` : ' You are on the top rung.'}</div></section>`;

  /* 5 · one habit a day */
  const n = HABITS.length, ti = (((R.coachTip == null ? dayIndex(Date.now()) : R.coachTip) % n) + n) % n, tip = HABITS[ti];
  const habit = `<section class="card" aria-labelledby="co-habit"><h2 class="co-h" id="co-habit">Today’s money habit</h2>
    <div class="co-tip">${pipPose('point', 56, '')}<div style="min-width:0"><b style="display:block;font-size:15px;margin-bottom:4px" data-habit="${ti}">${esc(tip.t)}</b><p class="small" style="margin:0;line-height:1.6">${esc(tip.b)}</p></div></div>
    <div class="co-tipnext"><button class="btn ghost sm" data-act="coachTip">Another one →</button><span class="small muted">${ti + 1} of ${n}</span></div></section>`;

  /* 6 · numbers, and the child's own worst misses */
  const cnt = mastery.counts(c), held = cnt.retained + cnt.transferred, ft = M.firstTry(c);
  const stat = (v, l, k) => `<div class="co-stat" data-stat="${k}"><b>${esc(String(v))}</b><span>${l}</span></div>`;
  const stats = `<section class="card" aria-labelledby="co-num"><h2 class="co-h" id="co-num">Your numbers</h2>
    <div class="co-stats">${stat(held, held === 1 ? 'idea held' : 'ideas held', 'held')}${stat(mistakes.open(c).length, 'to revisit', 'revisit')}
      ${stat(sim.goodDaysThisWeek(c), 'good days this week', 'good')}${stat(ft ? ft.pct + '%' : '—', ft ? `right first try · last 30 days` : 'right first try · too few yet', 'first')}</div>
    <p class="small muted" style="margin-top:8px">An idea is held when you still knew it after a gap of a week, or used it somewhere new without being asked.</p>
    <a class="btn ghost wide" style="margin-top:10px" href="#/mistakes">${ico('repeat', '', 18)} Ones to try again${(() => { const d = mistakes.due(c).length; return d ? ` · ${d} ready now` : ''; })()}</a></section>`;
  const worst = [];
  traps.forEach((t) => t.worst.forEach((w) => worst.push({ ...w, k: t.k })));
  worst.sort((a, b) => b.n - a.n);
  const chips = worst.length ? `<section class="card" aria-labelledby="co-worst"><h2 class="co-h" id="co-worst">Your own worst misses</h2>
    <div class="co-chips">${worst.slice(0, 8).map((w) => { const k = cardById(w.id); return k ? `<a class="co-chip" data-miss="${esc(w.id)}" href="#/atlas/${esc(w.id)}" style="--tc:${RULES[w.k].col}"><i></i>${esc(k.title)} <em>×${w.n}</em></a>` : ''; }).join('')}</div>
    <p class="small muted" style="margin-top:8px">Each one opens its stop. Read it again before Ones to try again brings the question back.</p></section>` : '';

  return `${CSS}<div class="coach" data-mode="${rd.mode}">${hero}
    <div class="co-grid"><div class="co-col">${chart}${detail}</div><div class="co-col">${stats}${chips}${ladder}${habit}</div></div></div>`;
}
