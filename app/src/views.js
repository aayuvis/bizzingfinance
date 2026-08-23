/* views.js — every screen. Pure string in, [data-act] out.
   Nothing here computes money; sim.js owns that and these render it. */

import { esc, sparkline, clamp } from './ui.js';
import { money, price, sign, CURRENCIES, shortDate, weekday } from './fmt.js';
import { say, face, CAST } from './art.js';
import { townSVG, PLACES } from './town.js';
import { CHAPTERS, ALL_CARDS, SHOP, ASSETS, BADGES, GLOSSARY, STOCK, WEATHER, HOMES,
  WORLDS, QUESTS, rankFor, rankObj, RANKS, shuffledDrill,
  chapterDone, isOpen as chapterOpen, needFor, worldOpen } from './content.js';
import * as sim from './sim.js';
import { R } from './runtime.js';

const K = () => sim.kid(R.s);

/* ══ ONBOARDING ═══════════════════════════════════════════════════════ */
export function viewOnboard(draft) {
  const step = draft.step || 0;
  const shell = (body) => `<div class="stack" style="max-width:520px;margin:5vh auto 0">${body}</div>`;
  const first = R.s ? R.s.kids.length === 0 : true;
  if (step === 0) {
    return shell(`
      <div style="text-align:center">
        <div style="width:96px;height:96px;margin:0 auto 12px;border-radius:50%;overflow:hidden;border:1px solid var(--line)">${CAST.pip.svg}</div>
        <h1 style="font-size:32px">${first ? 'Welcome to <em style="font-style:italic">Bizzington</em>' : 'A new stall on Market Row'}</h1>
        <p class="muted" style="margin-top:8px">${first
          ? "A town where you get a stall, a wallet, and every mistake is made with money that isn't real."
          : 'Another child, their own town, their own money. Nothing is shared between them.'}</p>
      </div>
      ${say('nana', first
        ? 'I am shutting up my shop at the end of the road, and the smallest stall on Market Row is going spare. What shall I call you?'
        : 'Another one! There is always a stall going. What is this one called?')}
      <div class="card stack">
        <label class="eyebrow" for="nm">Name</label>
        <input id="nm" data-field="name" value="${esc(draft.name || '')}" placeholder="Type a name" autocomplete="off"
          style="padding:13px 14px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-size:16px;font-weight:700;width:100%">
        <button class="btn wide" data-act="obNext">Next →</button>
        ${first ? '' : '<button class="small muted" style="text-align:center;width:100%" data-act="obCancel">Cancel</button>'}
      </div>`);
  }
  if (step === 1) {
    return shell(`
      ${say('pip', `Good to meet you, <b>${esc(draft.name)}</b>. How old are you? It changes what the street shows — no debt and no market before they are taught.`)}
      <div class="card stack">
        <button class="opt" data-act="obBand" data-arg="sprout"><b>8 to 10</b><br><span class="small muted">Sprout — coins, earning, saving. Nothing can go negative.</span></button>
        <button class="opt" data-act="obBand" data-arg="builder"><b>11 and up</b><br><span class="small muted">Builder — budgets, the bank, the Exchange, a shop of your own.</span></button>
      </div>`);
  }
  return shell(`
    ${say('pip', 'Last one. Which money do you count in? You can change it later and the town converts — it does not start over.')}
    <div class="card stack">
      ${Object.keys(CURRENCIES).map((k) => `<button class="opt" data-act="obCur" data-arg="${k}">
        <b style="font-size:18px">${CURRENCIES[k].sign}</b> &nbsp;${CURRENCIES[k].name}
        <span class="small muted"> · ${new Intl.NumberFormat(CURRENCIES[k].locale).format(1200000)}</span></button>`).join('')}
    </div>`);
}

/* ══ HOME — the town ══════════════════════════════════════════════════ */
export function viewHome() {
  const c = K();
  const due = sim.payDue(c, R.s);
  const d = sim.daysToPay(c);
  const g = c.money.goals.find((x) => !x.done);
  const sprout = c.band === 'sprout';
  const today = nextThing(c);

  const strip = sprout
    ? `<div class="strip two">
        <div><div class="k">Wallet</div><div class="v">${money(c.money.wallet)}</div></div>
        <div><div class="k">Saved up</div><div class="v">${money(c.money.jars.save + c.money.jars.grow)}</div></div></div>`
    : `<div class="strip">
        <div><div class="k">Wallet</div><div class="v">${money(c.money.wallet)}</div></div>
        <div><div class="k">Jars</div><div class="v">${money(sim.jarTotal(c))}</div></div>
        <div><div class="k">Invested</div><div class="v">${money(c.money.bank.balance + sim.holdingsValue(c))}</div></div>
        <div><div class="k">Net worth</div><div class="v" style="color:var(--action)">${money(sim.netWorth(c))}</div></div></div>`;

  const ind = sim.independence(c);
  const cost = sim.weeklyCost(c);
  const passive = sim.passiveWeekly(c);
  const home = sim.homeOf(c);

  const world = WORLDS[c.world || 0];
  const quests = sim.questList(c);
  const allDone = quests.length && quests.every((q) => q.claimed);

  return `<div class="stack">
    ${strip}
    <div class="card" style="padding:0;overflow:hidden">
      <div class="row" style="padding:13px 15px;gap:11px">
        <span style="font-size:26px">${world.em}</span>
        <div class="grow"><div class="eyebrow">You are in · ${esc(world.rank)}</div>
          <h3 style="font-size:17px;margin:1px 0">${esc(world.name)}</h3>
          <p class="small muted">${esc(world.blurb)}</p></div>
        <button class="btn ghost sm" data-act="nav" data-arg="worlds">Travel</button>
      </div>
    </div>

    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Today's three</div>
        <p class="small muted">They pay wages into the same wallet as everything else.</p></div>
        <span class="pill ${allDone ? 'grow' : ''}">${quests.filter((q) => q.claimed).length}/3</span></div>
      <div class="stack" style="gap:8px;margin-top:11px">
        ${quests.map((q) => `<div class="row" style="gap:10px;background:${q.claimed ? 'var(--grow-tint)' : 'var(--surface2)'};
          border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
          <span style="font-size:20px;${q.claimed ? 'opacity:.6' : ''}">${q.em}</span>
          <span class="grow" style="min-width:0">
            <b style="font-size:14px;${q.claimed ? 'opacity:.6' : ''}">${esc(q.t)}</b>
            <div class="small muted">${q.claimed ? 'Claimed.' : esc(q.sub)}</div>
            ${q.claimed ? '' : `<div class="bar" style="height:5px;margin-top:5px"><i style="width:${Math.min(100, q.at / q.n * 100)}%"></i></div>`}
          </span>
          ${q.claimed ? '<span class="pill grow">✓</span>'
            : q.done ? `<button class="btn sm" data-act="claim" data-arg="${q.id}">Take ${money(price(q.pay))}</button>`
            : `<span class="pill">${q.at}/${q.n}</span>`}
        </div>`).join('')}
      </div>
      ${allDone && !c.quests.bonus ? `<button class="btn wide" style="margin-top:11px" data-act="questBonus">All three — take ${money(price(12))} more</button>` : ''}
      ${c.quests.bonus ? '<p class="small muted" style="margin-top:9px">All three done. Fresh ones tomorrow.</p>' : ''}
    </div>

    ${sprout ? '' : `<button class="card" data-act="sub" data-arg="place" style="display:block;width:100%;text-align:left">
      <div class="row"><span style="font-size:24px">${home.em}</span><div class="grow">
        <div class="eyebrow">Independence · what your money earns ÷ what your life costs</div>
        <p style="font-weight:800;font-size:15px">${money(passive)} a week towards ${money(cost)}</p></div>
        <div class="big" style="font-size:24px;color:${ind >= 1 ? 'var(--grow)' : 'var(--action)'}">${Math.round(ind * 100)}%</div></div>
      <div class="bar" style="margin-top:9px;height:11px"><i style="width:${Math.min(100, ind * 100)}%;background:${ind >= 1 ? 'var(--grow)' : 'var(--action)'}"></i></div>
      <p class="small muted" style="margin-top:7px">${ind >= 1
        ? 'Your money pays for your life. You work because you choose to.'
        : ind >= 0.5 ? 'Half your week is paid for without working. Keep going.'
        : ind >= 0.1 ? 'A tenth of your life pays for itself. That first tenth is the slow one.'
        : 'Nothing pays for itself yet. Every subscription you cancel moves this as much as a good year in the market.'}</p>
    </button>`}
    <div class="town">
      <div class="town-scroll">${townSVG(c)}</div>
      <div class="town-cap"><span>🔥 ${c.streak.days.length}</span><span>Lv ${c.learn.level} · ${rankFor(c.learn.level)}</span></div>
    </div>

    ${due
      ? `<div class="card" style="border-color:var(--treasure);background:var(--treasure-tint)">
          <div class="eyebrow" style="color:var(--treasure-deep)">The bell is ringing</div>
          <h3 style="margin:2px 0 4px">It's pay day in Bizzington</h3>
          <p class="small" style="color:var(--treasure-deep)">Wages in, bills out, jars filled. The whole street is busy.</p>
          <button class="btn wide" style="margin-top:12px" data-act="payday">🔔 Ring the bell</button>
        </div>`
      : `<div class="card row">
          <div class="grow"><div class="eyebrow">Pay day</div>
          <p style="font-weight:700">${d === 0 ? 'Later today' : d + ' day' + (d === 1 ? '' : 's') + ' — ' + weekday(c.money.nextPay)}</p>
          <p class="small muted">${money(sim.weeklyIncome(c))} in, ${money(sim.weeklyCost(c))} straight back out.</p></div>
          <button class="btn ghost sm" data-act="sub" data-arg="jars">Check the jars</button>
        </div>`}

    <div class="grid2">
      <button class="card" data-act="postbox" style="text-align:left;border-color:${c.postbox.answered ? 'var(--line)' : 'var(--spend)'}">
        <div class="row"><span style="font-size:26px">📬</span><div class="grow">
          <div class="eyebrow">The postbox</div>
          <p style="font-weight:800">${c.postbox.answered ? 'Emptied for today' : "There's a letter"}</p>
          <p class="small muted">${c.postbox.answered ? 'Another one tomorrow.' : 'One a day. Thirty seconds.'}</p></div></div>
      </button>
      <button class="card" data-act="${today.act}" data-arg="${today.arg || ''}" style="text-align:left">
        <div class="row"><span style="font-size:26px">${today.em}</span><div class="grow">
          <div class="eyebrow">Today</div>
          <p style="font-weight:800">${esc(today.title)}</p>
          <p class="small muted">${esc(today.sub)}</p></div></div>
      </button>
    </div>

    ${g ? `<button class="card" data-act="sub" data-arg="goals" style="display:block;width:100%;text-align:left">
      <div class="row"><div class="grow"><div class="eyebrow">In the Build Yard</div>
        <h3 style="margin:2px 0">${esc(g.name)}</h3></div>
        <div style="text-align:right"><div class="big">${money(g.saved)}</div>
        <div class="small muted">of ${money(g.target)}</div></div></div>
      <div class="bar" style="margin-top:10px"><i style="width:${Math.min(100, g.saved / g.target * 100)}%;background:var(--save)"></i></div>
      <p class="small muted" style="margin-top:7px">${g.saved >= g.target ? 'Finished — the roof is on.' : sim.weeksToGoal(c, g) + ' more pay days at your current Save rate.'}</p>
    </button>` : ''}

    ${say('pip', hometalk(c))}
  </div>`;
}

function hometalk(c) {
  const lv = c.learn.level;
  if (lv < 6) return "Your stall's open. There's work on Market Row most days — and learn a card or two, because the shed round the back has four jars in it and they change everything.";
  if (lv < 8) return 'Shed is yours. Split the money the moment it lands, before it has a chance to become one big pile.';
  if (lv < 11) return 'Build Yard next. Name something you want and it starts going up floor by floor. Fair warning: raid the fund and the scaffolding comes back down.';
  if (lv < 16) return "Bank's open. The clock strikes every pay day and a little interest lands. Boring. Boring is exactly the point.";
  if (lv < 23) return 'Exchange is open — Bo and Bea are already arguing. Buy from the Grow jar, never the Spend jar.';
  return "Nana's shutters came off. That's your shop now. Buy for less than you sell for, and count the difference honestly.";
}

function nextThing(c) {
  const card = ALL_CARDS.find((x) => !c.learn.done[x.id]);
  const jobs = sim.jobsToday(c).filter((j) => !j.done);
  if (card && (c.learn.level < 6 || !jobs.length)) return { em: CHAPTERS.find((x) => x.id === card.ch).em, title: card.title, sub: 'Three minutes with ' + CAST[card.who].name + '.', act: 'card', arg: card.id };
  if (jobs.length) return { em: jobs[0].em, title: jobs[0].name, sub: 'For ' + jobs[0].who + ' — ' + money(jobs[0].amt) + '.', act: 'sub', arg: 'wallet' };
  if (card) return { em: '📗', title: card.title, sub: 'Three minutes with ' + CAST[card.who].name + '.', act: 'card', arg: card.id };
  if (!c.money.goals.length && c.learn.level >= 8) return { em: '🏗️', title: 'Name a goal', sub: 'It becomes a building you can watch go up.', act: 'sub', arg: 'goals' };
  return { em: '🎮', title: 'Play a round', sub: 'Wages, straight into the same wallet.', act: 'nav', arg: 'arcade' };
}

/* ══ WORLDS — the road, and what opens at the end of each one ═════════ */
export function viewWorlds() {
  const c = K();
  return `<div class="stack">
    ${say('pip', 'Five places, and you walk them in order. You move on when you have finished learning where you are — not when you have earned enough. That is the whole rule.')}
    ${WORLDS.map((w, i) => {
      const open = worldOpen(c, i);
      const here = (c.world || 0) === i;
      const left = w.chapters.filter((ch) => !chapterDone(c, ch));
      const done = w.chapters.length - left.length;
      return `<div class="card" style="${here ? 'border-color:var(--action);box-shadow:var(--sh-raised)' : open ? '' : 'opacity:.66'}">
        <div class="row" style="gap:12px">
          <span style="font-size:30px">${open ? w.em : '🔒'}</span>
          <div class="grow">
            <div class="eyebrow">${esc(w.rank)}${here ? ' · you are here' : ''}</div>
            <h3 style="font-size:18px;margin:1px 0 3px">${esc(w.name)}</h3>
            <p class="small muted">${esc(w.blurb)}</p>
          </div>
          ${here ? '<span class="pill gold">here</span>'
            : open ? `<button class="btn sm" data-act="travel" data-arg="${i}">Go →</button>`
            : ''}
        </div>
        <div class="row" style="margin-top:11px;gap:8px;flex-wrap:wrap">
          <span class="pill">opens ${esc(w.opens)}</span>
          <span class="grow"></span>
          <span class="small muted">${done}/${w.chapters.length} chapters</span>
        </div>
        <div class="bar" style="margin-top:6px"><i style="width:${done / w.chapters.length * 100}%;background:${done === w.chapters.length ? 'var(--grow)' : 'var(--action)'}"></i></div>
        ${!open && i > 0 ? `<p class="small muted" style="margin-top:8px">Finish
          ${WORLDS[i - 1].chapters.filter((ch) => !chapterDone(c, ch))
            .map((ch) => '“' + esc(CHAPTERS.find((x) => x.id === ch).title) + '”').join(' and ') || 'the last stretch'}
          in ${esc(WORLDS[i - 1].name)} to walk on.</p>` : ''}
        ${here && left.length ? `<p class="small muted" style="margin-top:8px">Still to learn here:
          ${left.map((ch) => '<b>' + esc(CHAPTERS.find((x) => x.id === ch).title) + '</b>').join(', ')}.</p>` : ''}
        ${here && !left.length && i < WORLDS.length - 1 ? `<p class="small" style="margin-top:8px;color:var(--grow);font-weight:700">
          Everything here is learned. The road is open.</p>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

/* ══ LEARN ════════════════════════════════════════════════════════════ */
export function viewLearn() {
  const c = K();
  if (c.learn.openCard) {
    const card = ALL_CARDS.find((x) => x.id === c.learn.openCard);
    if (card) return viewCard(card);
  }
  if (R.shelf === 'words') return viewGlossary();
  const bar = sim.xpBar(c);
  const rank = rankObj(c.learn.level);

  return `<div class="stack">
    <div class="card">
      <div class="row"><div class="grow">
        <div class="eyebrow">${rank.em} ${rank.name} · level ${c.learn.level} of 30</div>
        <h2 style="margin:2px 0 0">${c.learn.xp} XP</h2>
        <p class="small muted">Learning ${esc(rank.of)}.</p></div>
        <div class="small muted" style="text-align:right">${bar.need} XP to<br>level ${c.learn.level + 1}</div></div>
      <div class="bar" style="margin-top:10px"><i style="width:${bar.pct * 100}%"></i></div>
      <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap">
        ${RANKS.map((r) => `<span class="pill ${c.learn.level >= r.at ? 'gold' : ''}">${r.em} ${r.name}<span style="font-family:var(--mono);opacity:.7"> L${r.at}</span></span>`).join('')}
      </div>
    </div>
    <div class="grid2">
      <button class="card" data-act="shelf" data-arg="words" style="text-align:left">
        <div class="row"><span style="font-size:24px">📖</span><div class="grow">
        <p style="font-weight:800">Money Words</p><p class="small muted">${GLOSSARY.length} terms, in plain English.</p></div></div></button>
      <button class="card" data-act="nav" data-arg="arcade" style="text-align:left">
        <div class="row"><span style="font-size:24px">🎮</span><div class="grow">
        <p style="font-weight:800">Practise it</p><p class="small muted">Six games. Wages into the same wallet.</p></div></div></button>
    </div>
    ${say('pip', 'Every card ends with one question. Get it right and the town grows. Get it wrong and I tell you why — that counts too.')}
    <div class="chapts">
      ${CHAPTERS.map((ch) => {
        const done = ch.cards.filter((x) => c.learn.done[x.id]).length;
        const locked = c.learn.level < ch.lv;
        return `<div class="card pad0" ${locked ? 'style="opacity:.62"' : ''}>
          <div style="padding:14px 16px;display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line-soft)">
            <span style="font-size:24px">${locked ? '🔒' : ch.em}</span>
            <div class="grow"><h3 style="font-size:18px">${esc(ch.title)}</h3>
            <p class="small muted">${locked ? 'Opens at level ' + ch.lv + ' · ' + ch.rank : esc(ch.blurb)}</p>
            ${opensWhat(ch.id) ? `<p class="small" style="color:var(--action);font-weight:700;margin-top:2px">
              ${done === ch.cards.length ? '✓ opened ' : 'Finish this to open '}${esc(opensWhat(ch.id))}</p>` : ''}</div>
            <span class="pill ${done === ch.cards.length ? 'grow' : ''}">${done}/${ch.cards.length}</span>
          </div>
          ${locked ? '' : ch.cards.map((x) => {
            const dn = c.learn.done[x.id];
            return `<button data-act="card" data-arg="${x.id}" style="display:flex;gap:11px;align-items:center;width:100%;padding:11px 16px;border-top:1px solid var(--line-soft)">
              <span style="width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;font-size:12px;font-weight:800;background:${dn ? 'var(--grow)' : 'var(--tint)'};color:${dn ? '#fff' : 'var(--muted)'}">${dn ? '✓' : ''}</span>
              <span class="grow" style="font-weight:700;font-size:14.5px">${esc(x.title)}</span>
              <span class="small muted">${CAST[x.who].name}</span></button>`;
          }).join('')}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

const OPENS = { c3: 'the Jar Shed and the Build Yard', c5: 'the Bank',
  c6: 'borrowing', c7: 'the Exchange', c8: 'Bizz & Co' };
function opensWhat(id) { return OPENS[id]; }

function viewCard(card) {
  const c = K(), st = c.learn.drill;
  const d = shuffledDrill(card);
  return `<div class="stack">
    <button class="small muted" data-act="closeCard">← All chapters</button>
    <div class="card stack">
      <div class="eyebrow">${esc(CHAPTERS.find((x) => x.id === card.ch).title)}</div>
      <h2>${esc(card.title)}</h2>
      ${say(card.who, card.teach)}
      <div style="background:var(--tint);border-radius:var(--r-md);padding:12px 14px;font-size:14px;border-left:3px solid var(--action)">
        <span class="eyebrow">For instance</span><br>${esc(card.eg)}</div>
    </div>
    <div class="card stack">
      <div class="eyebrow">One question</div>
      <h3 style="font-size:18px">${esc(card.drill.q)}</h3>
      <div class="stack" style="gap:8px">
        ${d.opts.map((o, i) => {
          let k = '';
          if (st && st.card === card.id) k = (i === d.answer) ? ' ok' : (i === st.pick ? ' no' : '');
          return `<button class="opt${k}" data-act="answer" data-arg="${i}" ${st && st.card === card.id ? 'disabled' : ''}>
            <span class="k">${'ABCD'[i]}</span>${esc(o)}</button>`;
        }).join('')}
      </div>
      ${st && st.card === card.id ? `<div style="background:${st.right ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:12px 14px;font-size:14px">
          <b>${st.right ? 'That’s it.' : 'Not quite — and this is the useful bit:'}</b> ${esc(card.drill.why)}</div>
        <button class="btn wide" data-act="cardDone" data-arg="${card.id}">Take it back to town →</button>` : ''}
    </div>
  </div>`;
}

function viewGlossary() {
  const q = (R.query || '').toLowerCase();
  const rows = GLOSSARY.filter((g) => !q || g[0].toLowerCase().includes(q) || g[1].toLowerCase().includes(q));
  return `<div class="stack">
    <button class="small muted" data-act="shelf" data-arg="">← Learn</button>
    <div class="card">
      <div class="eyebrow">Money Words</div>
      <input data-field="query" data-live="1" value="${esc(R.query || '')}" placeholder="Search ${GLOSSARY.length} terms"
        style="margin-top:8px;padding:11px 13px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650;width:100%">
    </div>
    ${rows.length === 0 ? '<div class="card"><p class="muted">Nothing by that name yet.</p></div>' : ''}
    <div class="card pad0">
      ${rows.map((g, i) => `<div style="padding:13px 16px;${i ? 'border-top:1px solid var(--line-soft)' : ''}">
        <b style="font-size:15px">${esc(g[0])}</b>
        <p style="font-size:14px;margin-top:2px">${esc(g[1])}</p>
        <p class="small muted" style="margin-top:3px">${esc(g[2])}</p></div>`).join('')}
    </div>
  </div>`;
}

/* ══ MONEY ════════════════════════════════════════════════════════════ */
export function viewMoney() {
  const c = K();
  const NAMES = { place: 'Home', wallet: 'Wallet', jars: 'Jars', goals: 'Goals',
    bank: 'Bank', portfolio: 'Exchange', business: 'Your shop' };
  const subs = PLACES.map((p) => ({ k: p.sub, n: NAMES[p.sub] || p.name }));
  let sub = R.s.ui.sub;
  if (!subs.find((x) => x.k === sub && chapterOpen(c, x.k))) sub = 'wallet';

  const strip = `<div style="display:flex;gap:7px;flex-wrap:wrap;padding:11px;background:var(--tint);border-radius:var(--r-md);border:1px solid var(--line-soft)">
    ${subs.map((x) => {
      const open = chapterOpen(c, x.k);
      return `<button data-act="${open ? 'sub' : 'lockedSub'}" data-arg="${x.k}"
        style="padding:7px 12px;border-radius:999px;font-size:13px;font-weight:800;border:1px ${open ? 'solid' : 'dashed'} var(--line);
        background:${sub === x.k ? 'var(--action)' : (open ? 'var(--surface)' : 'transparent')};
        color:${sub === x.k ? 'var(--action-ink)' : (open ? 'var(--ink)' : 'var(--muted)')}">
        ${open ? '' : '🔒 '}${x.n}</button>`;
    }).join('')}</div>`;

  const body = sub === 'place' ? viewPlace() : sub === 'jars' ? viewJars() : sub === 'goals' ? viewGoals()
    : sub === 'bank' ? viewBank() : sub === 'portfolio' ? viewExchange()
    : sub === 'business' ? viewBusiness() : viewWallet();
  return `<div class="stack">${strip}${body}</div>`;
}

function viewWallet() {
  const c = K();
  const jobs = sim.jobsToday(c);
  return `<div class="stack">
    <div class="card">
      <div class="eyebrow">In your pocket</div>
      <div class="big" style="font-size:38px;color:var(--treasure-deep)">${money(c.money.wallet)}</div>
      <p class="small muted">${c.band === 'sprout'
        ? 'This can never go below zero — debt comes later, when it is taught.'
        : 'Everything below is dated, because a statement you cannot read is a statement you cannot argue with.'}</p>
    </div>
    <div class="card">
      <div class="eyebrow">Work going on Market Row today</div>
      <p class="small muted" style="margin:3px 0 10px">Each job once a day. You are selling an hour, not a thing.</p>
      <div class="stack" style="gap:8px">
        ${jobs.map((j) => `<div class="row" style="gap:10px;background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
          <span style="font-size:20px">${j.em}</span>
          <span class="grow"><b style="font-size:14px">${esc(j.name)}</b><br><span class="small muted">for ${esc(j.who)}</span></span>
          ${j.done ? '<span class="pill grow">done today</span>'
            : `<button class="btn sm" data-act="job" data-arg="${j.id}">${money(j.amt)}</button>`}
        </div>`).join('')}
      </div>
    </div>
    <div class="card pad0">
      <div style="padding:12px 16px;border-bottom:1px solid var(--line-soft);display:flex;align-items:center">
        <span class="eyebrow grow">Every movement</span>
        <button class="small muted" data-act="print">🖨 Statement</button></div>
      ${c.money.txns.slice(0, 18).map((t) => `<div style="display:flex;gap:10px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line-soft)">
        <span style="width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:13px;flex:0 0 auto;background:${t.kind === 'in' ? 'var(--grow-tint)' : 'var(--spend-tint)'};color:${t.kind === 'in' ? 'var(--grow)' : 'var(--spend)'}">${t.kind === 'in' ? '↓' : '↑'}</span>
        <span class="grow" style="font-weight:650;font-size:14px">${esc(t.label)}<br><span class="small muted">${shortDate(t.t)}</span></span>
        <span class="tabnum" style="font-weight:800;color:${t.kind === 'in' ? 'var(--grow)' : 'var(--ink)'}">${t.kind === 'in' ? '+' : '−'}${money(t.amt)}</span>
      </div>`).join('')}
    </div>
  </div>`;
}

function viewPlace() {
  const c = K();
  const h = sim.homeOf(c);
  const bills = sim.refreshBills(c);
  const cost = sim.weeklyCost(c);
  const income = sim.weeklyIncome(c);
  const left = income - cost;
  const next = HOMES[c.home.tier + 1];
  const chk = next ? sim.canMove(c, c.home.tier + 1) : null;
  const M = c.home.mortgage;

  return `<div class="stack">
    <div class="card">
      <div class="row"><span style="font-size:34px">${h.em}</span><div class="grow">
        <div class="eyebrow">You live here</div>
        <h2 style="font-size:21px;margin:2px 0 3px">${esc(h.name)}</h2>
        <p class="small muted">${esc(h.blurb)}</p></div></div>
    </div>

    <div class="card">
      <div class="eyebrow">Every pay day, whether the week went well or not</div>
      <div class="stack" style="gap:6px;margin-top:9px">
        <div class="row"><span class="grow" style="font-weight:800;color:var(--grow)">Money in <span class="small muted" style="font-weight:600">· level ${c.learn.level} wage</span></span>
          <b style="color:var(--grow)">+${money(income)}</b></div>
        ${bills.map((b) => `<div class="row"><span class="grow muted">${esc(b.name)}</span><b>−${money(b.amt)}</b></div>`).join('')}
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">What's left to live on</span>
          <span class="big" style="font-size:22px;color:${left > 0 ? 'var(--ink)' : 'var(--spend)'}">${money(left)}</span></div>
      </div>
      <p class="small muted" style="margin-top:9px">${left > 0
        ? 'That leftover is the only part you get to choose about. Everything above it already has a name.'
        : 'Costs are bigger than income. That gap has to come from somewhere — savings, or somebody else.'}</p>
    </div>

    ${M ? `<div class="card" style="border-color:var(--save)">
      <div class="eyebrow">Your mortgage</div>
      <div class="row" style="margin-top:3px"><div class="grow">
        <div class="big" style="font-size:24px">${money(M.owed)}</div>
        <p class="small muted">left to pay · ${money(M.perWeek)} every pay day</p></div></div>
      <div class="bar" style="margin-top:8px"><i style="width:${Math.round(M.paid / (M.paid + M.owed) * 100)}%;background:var(--save)"></i></div>
      <p class="small muted" style="margin-top:7px">This one ends. Rent never does — that is the whole difference between renting and owning.</p>
    </div>` : ''}

    ${next ? `<div class="card">
      <div class="eyebrow">Next along the street</div>
      <div class="row" style="margin-top:4px"><span style="font-size:28px">${next.em}</span>
        <div class="grow"><b style="font-size:16px">${esc(next.name)}</b>
          <p class="small muted">${esc(next.blurb)}</p></div></div>
      <div class="stack" style="gap:5px;margin-top:11px;font-size:14px">
        <div class="row"><span class="grow muted">Deposit, once</span><b>${money(price(next.deposit))}</b></div>
        <div class="row"><span class="grow muted">Every week after that</span>
          <b>${money(price(next.rent) + next.bills.reduce((t, b) => t + price(b.units), 0) + price(next.food))}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Which would leave you</span>
          <b style="color:${income - (price(next.rent) + next.bills.reduce((t, b) => t + price(b.units), 0) + price(next.food)) > 0 ? 'var(--ink)' : 'var(--spend)'}">
            ${money(income - (price(next.rent) + next.bills.reduce((t, b) => t + price(b.units), 0) + price(next.food)))} a week</b></div>
      </div>
      <button class="btn wide" style="margin-top:12px" data-act="move" data-arg="${c.home.tier + 1}" ${chk.ok ? '' : 'disabled'}>
        ${chk.ok ? 'Take it →' : 'Need ' + money(chk.deposit || 0) + ' for the deposit'}</button>
      <p class="small muted" style="margin-top:8px">Nobody stops you moving somewhere you can barely afford. The number is right there, and the choice is yours.</p>
    </div>` : `<div class="card" style="text-align:center;padding:24px">
      <div style="font-size:34px">🏡</div>
      <h3 style="margin:8px 0 4px">You own where you live</h3>
      <p class="muted small">Top of the street. The only thing left to grow is what your money earns while you sleep.</p></div>`}

    ${say('nana', c.home.tier === 0
      ? 'A room of your own and rent going out on Friday. Everything else in this town is built on that one fact.'
      : 'Notice what changed when you moved — not just the rent. Every room you add adds a bill behind it.')}
  </div>`;
}

const JARMETA = { spend: ['Spend', 'var(--spend)', 'for now'], save: ['Save', 'var(--save)', 'for soon'],
  grow: ['Grow', 'var(--grow)', 'for far away'], give: ['Give', 'var(--give)', 'for someone else'] };
function viewJars() {
  const c = K(), j = c.money.jars, r = c.money.rules;
  const max = Math.max(1, ...Object.values(j));
  const tot = r.spend + r.save + r.grow + r.give;
  return `<div class="stack">
    ${say('nana', 'Split it the moment it lands. What sits in one pile gets spent as one pile — that is the entire trick, and it is sixty years old.')}
    <div class="card">
      <div class="jars">
        ${Object.keys(JARMETA).map((k) => `<div class="jar">
          <div class="jarglass"><div class="jarfill" style="height:${Math.max(4, j[k] / max * 100)}%;background:${JARMETA[k][1]};opacity:.85"></div></div>
          <div class="jarlbl">${JARMETA[k][0]}<br><span class="jaramt">${money(j[k])}</span></div>
          <div class="row" style="gap:4px">
            <button class="btn ghost sm" style="padding:5px 9px" data-act="jarOut" data-arg="${k}" aria-label="Take out of ${JARMETA[k][0]}">−</button>
            <button class="btn sm" style="padding:5px 9px" data-act="jarIn" data-arg="${k}" aria-label="Put into ${JARMETA[k][0]}">+</button>
          </div></div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:12px">Buttons move ${money(price(2))} at a time, out of your wallet (${money(c.money.wallet)}).</p>
    </div>
    ${c.learn.level < 11 ? `<div class="card stack">
      <div class="eyebrow">Pay-day rule — this fires by itself on ${weekday(c.money.nextPay)}</div>
      <p class="small muted">Every twenty coins that arrive, split like this:</p>
      <div class="stack" style="gap:9px">
        ${Object.keys(JARMETA).map((k) => {
          const n = Math.round(r[k] / 5);
          return `<div class="row" style="gap:9px">
            <span style="width:58px;font-weight:800;font-size:13.5px;color:${JARMETA[k][1]}">${JARMETA[k][0]}</span>
            <span class="grow" style="display:flex;gap:3px;flex-wrap:wrap">
              ${Array.from({ length: 20 }, (_, i) => `<i style="width:13px;height:13px;border-radius:50%;display:block;background:${i < n ? JARMETA[k][1] : 'var(--line)'}"></i>`).join('')}
            </span>
            <div class="stepper"><button data-act="rule" data-arg="${k}:-5" aria-label="less ${JARMETA[k][0]}">−</button>
            <span class="n">${n}</span>
            <button data-act="rule" data-arg="${k}:5" aria-label="more ${JARMETA[k][0]}">+</button></div>
          </div>`;
        }).join('')}
      </div>
      <p class="small ${tot === 100 ? 'muted' : ''}" style="${tot === 100 ? '' : 'color:var(--spend);font-weight:700'}">
        ${tot === 100 ? 'Twenty coins, all spoken for. Good.' : 'That is ' + Math.round(tot / 5) + ' coins out of twenty. Every coin has to go somewhere.'}</p>
    </div>` : `<div class="card stack">
      <div class="eyebrow">Pay-day rule — this fires by itself on ${weekday(c.money.nextPay)}</div>
      ${Object.keys(JARMETA).map((k) => `<div class="row">
        <span style="width:58px;font-weight:800;font-size:13.5px;color:${JARMETA[k][1]}">${JARMETA[k][0]}</span>
        <div class="grow bar"><i style="width:${r[k]}%;background:${JARMETA[k][1]}"></i></div>
        <div class="stepper"><button data-act="rule" data-arg="${k}:-5" aria-label="less ${JARMETA[k][0]}">−</button>
        <span class="n">${r[k]}%</span>
        <button data-act="rule" data-arg="${k}:5" aria-label="more ${JARMETA[k][0]}">+</button></div>
      </div>`).join('')}
      <p class="small" style="${tot === 100 ? 'color:var(--muted)' : 'color:var(--spend);font-weight:700'}">
        ${tot === 100 ? 'Adds to 100%. Good.' : 'Adds to ' + tot + '%. It has to be 100 — the money has to go somewhere.'}</p>
    </div>`}
  </div>`;
}

function viewGoals() {
  const c = K();
  return `<div class="stack">
    ${say('pip', 'Name the thing and price it. Dividing turns a wish into a date — and the yard shows the date, not encouragement.')}
    <div class="card stack">
      <div class="eyebrow">Start something</div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <input data-field="goalName" placeholder="What do you want?" value="${esc(R.fields.goalName || '')}"
          style="flex:2 1 150px;min-width:0;padding:11px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <input data-field="goalAmt" inputmode="numeric" placeholder="${sign()}" value="${esc(R.fields.goalAmt || '')}"
          style="flex:1 1 90px;min-width:0;padding:11px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <button class="btn" data-act="addGoal">Add</button>
      </div>
    </div>
    ${c.money.goals.length === 0 ? `<div class="card" style="text-align:center;padding:26px">
        <div style="font-size:34px">🏗️</div><p class="muted" style="margin-top:6px">The yard is empty. Nothing is being built.</p></div>` : ''}
    ${c.money.goals.map((g) => {
      const p = Math.min(1, g.saved / g.target);
      return `<div class="card">
        <div class="row"><div class="grow"><h3 style="font-size:18px">${esc(g.name)}${g.done ? ' <span class="pill grow">built</span>' : ''}</h3>
          <p class="small muted">${g.done ? 'Finished.' : sim.weeksToGoal(c, g) + ' pay days at your Save rate'}</p></div>
          <div style="text-align:right"><div class="big" style="font-size:20px">${money(g.saved)}</div>
          <div class="small muted">of ${money(g.target)}</div></div></div>
        <div class="bar" style="margin-top:10px"><i style="width:${p * 100}%;background:var(--save)"></i></div>
        <div class="row" style="margin-top:11px;gap:8px;flex-wrap:wrap">
          <button class="btn sm" data-act="fundGoal" data-arg="${g.id}" ${c.money.jars.save <= 0 || g.done ? 'disabled' : ''}>Put in ${money(Math.min(price(5), Math.max(0, c.money.jars.save)))} from Save</button>
          <button class="btn ghost sm" data-act="autoGoal" data-arg="${g.id}">${g.auto ? 'Auto ' + money(g.auto) + '/week' : 'Auto-save each week'}</button>
          <span class="grow"></span>
          <button class="btn ghost sm" data-act="raidGoal" data-arg="${g.id}" ${g.saved <= 0 ? 'disabled' : ''}>Take it back</button>
        </div>
        ${g.saved > 0 && !g.done ? '<p class="small muted" style="margin-top:8px">Taking it back is allowed. The scaffolding comes down on the town, though — that part is the lesson.</p>' : ''}
      </div>`;
    }).join('')}
  </div>`;
}

function viewBank() {
  const c = K(), b = c.money.bank;
  const L = b.loan;
  const offer = sim.loanOffer(c, 40, 8);
  const proj = [1, 2, 5, 10].map((y) => ({ y, v: Math.round(Math.max(b.balance, price(50)) * Math.pow(1 + b.rate, y * 52)) }));
  return `<div class="stack">
    ${say('nana', 'Interest is rent on money. Leave it here and the bank pays you rent for using it. Borrow, and you pay. Same idea — the only question is which side you are standing on.')}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">In the vault</div>
        <div class="big" style="font-size:32px;color:var(--save)">${money(b.balance)}</div></div>
        <div style="text-align:right"><div class="eyebrow">Every pay day</div>
        <div class="big" style="font-size:20px">${(b.rate * 100).toFixed(0)}%</div></div></div>
      <p class="small muted" style="margin-top:8px">Next pay day this adds <b>${money(Math.round(b.balance * b.rate))}</b> — that is ${money(b.balance)} × ${(b.rate * 100).toFixed(0)}%, shown rather than hidden.</p>
      <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap">
        <button class="btn sm" data-act="bankIn" ${c.money.jars.save <= 0 ? 'disabled' : ''}>Deposit ${money(Math.min(price(10), Math.max(0, c.money.jars.save)))} from Save</button>
        <button class="btn ghost sm" data-act="bankOut" ${b.balance <= 0 ? 'disabled' : ''}>Take some out</button>
      </div>
    </div>

    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Trust score</div>
        <div class="big" style="font-size:24px">${b.trust}<span class="small muted"> / 100</span></div></div>
        <div style="text-align:right" class="small muted">${b.repaid} loan${b.repaid === 1 ? '' : 's'}<br>repaid in full</div></div>
      <div class="bar" style="margin-top:8px"><i style="width:${b.trust}%;background:${b.trust > 60 ? 'var(--grow)' : b.trust > 30 ? 'var(--treasure)' : 'var(--spend)'}"></i></div>
      <p class="small muted" style="margin-top:7px">A memory of whether past borrowing came back — never a score of what kind of person you are. It goes up every time you repay, and it can always be rebuilt.</p>
    </div>

    ${L ? `<div class="card" style="border-color:var(--spend)">
      <div class="eyebrow" style="color:var(--spend)">You are borrowing</div>
      <div class="row" style="margin-top:4px"><div class="grow">
        <div class="big" style="font-size:26px">${money(L.owed)}</div>
        <p class="small muted">still to repay of ${money(L.amount + L.cost)} · ${money(L.perWeek)} goes out each pay day</p></div></div>
      <div class="bar" style="margin-top:8px"><i style="width:${Math.round(L.paid / (L.amount + L.cost) * 100)}%;background:var(--spend)"></i></div>
      <button class="btn wide" style="margin-top:11px" data-act="repay" ${c.money.wallet <= 0 ? 'disabled' : ''}>Pay off ${money(Math.min(c.money.wallet, L.owed))} now</button>
      <p class="small muted" style="margin-top:8px">Paying early costs you nothing extra here and clears it sooner. Missing a pay day costs trust, not dignity.</p>
    </div>`
    : `<div class="card">
      <div class="eyebrow">Borrowing</div>
      <h3 style="font-size:18px;margin:3px 0 6px">${money(offer.amount)} over ${offer.weeks} pay days</h3>
      <div class="stack" style="gap:5px;font-size:14px">
        <div class="row"><span class="grow muted">You receive</span><b>${money(offer.amount)}</b></div>
        <div class="row"><span class="grow muted">You pay back, each pay day</span><b>${money(offer.perWeek)}</b></div>
        <div class="row"><span class="grow muted">You hand over in total</span><b>${money(offer.total)}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">So borrowing costs</span>
          <span class="big" style="font-size:20px;color:var(--spend)">${money(offer.cost)}</span></div>
      </div>
      <button class="btn wide" style="margin-top:12px" data-act="loan">Take the loan</button>
      <p class="small muted" style="margin-top:8px">The total is shown before you agree, which is the whole of chapter six. A higher trust score makes the same loan cheaper.</p>
    </div>`}

    <div class="card">
      <div class="eyebrow">The snowball, on this balance</div>
      <div class="grid3" style="margin-top:8px">
        ${proj.map((p) => `<div style="background:var(--tint);border-radius:var(--r-md);padding:10px 12px">
          <div class="small muted">${p.y} year${p.y > 1 ? 's' : ''}</div>
          <div style="font-weight:800;font-variant-numeric:tabular-nums">${money(p.v)}</div></div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:9px">Bizzington's own made-up rate compounding weekly — not a real bank's, and not a forecast.</p>
    </div>
  </div>`;
}

function viewExchange() {
  const c = K(), step = c.market.step;
  const val = sim.holdingsValue(c);
  const sp = sim.spread(c);
  return `<div class="stack">
    ${say(c.market.lastMove >= 0 ? 'bo' : 'bea', c.market.lastMove >= 0
      ? 'Up on the week! I said it would be. I say that every week.'
      : 'Down on the week. I said so. I also say that every week — one of us is always right and neither of us knows.')}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Your holdings</div>
        <div class="big" style="font-size:30px;color:var(--grow)">${money(val)}</div></div>
        <div style="text-align:right"><div class="eyebrow">Grow jar</div>
        <div class="big" style="font-size:20px">${money(c.money.jars.grow)}</div></div></div>
      <p class="small muted" style="margin-top:6px">${sp === 0 ? 'Nothing owned yet. Buy from the Grow jar — that is money you will not need soon.'
        : sp === 1 ? 'One thing. Your whole week now depends on somebody else’s Tuesday.'
        : 'Spread across ' + sp + '. Bad news in one can no longer sink the lot.'}</p>
    </div>
    ${ASSETS.map((a) => {
      const series = c.market.series[a.id];
      const p = series[step], prev = series[Math.max(0, step - 1)];
      const mv = (p - prev) / prev;
      const u = c.market.holdings[a.id] || 0;
      return `<div class="card">
        <div class="row"><span style="font-size:22px">${a.em}</span>
          <div class="grow"><b style="font-size:15px">${esc(a.name)}</b>
          <p class="small muted">${esc(a.desc)}</p></div>
          <div style="text-align:right"><div style="font-weight:800;font-variant-numeric:tabular-nums">${money(p)}</div>
          <div class="small" style="color:${mv >= 0 ? 'var(--grow)' : 'var(--spend)'};font-weight:700">${mv >= 0 ? '▲' : '▼'} ${Math.abs(mv * 100).toFixed(1)}%</div></div></div>
        ${sparkline(series.slice(0, step + 1), 300, 40, mv >= 0 ? 'var(--grow)' : 'var(--spend)')}
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:4px">
          <span class="pill">${u > 0 ? 'you hold ' + money(u * p) : 'not held'}</span>
          <span class="grow"></span>
          <button class="btn sm" data-act="buy" data-arg="${a.id}" ${c.money.jars.grow < price(5) ? 'disabled' : ''}>Buy ${money(price(5))}</button>
          <button class="btn ghost sm" data-act="sell" data-arg="${a.id}" ${u <= 0 ? 'disabled' : ''}>Sell all</button>
        </div></div>`;
    }).join('')}
    <div class="card">
      <div class="eyebrow">⏳ The Time Machine</div>
      <p class="small muted" style="margin:4px 0 10px">The only place in Bizzington where the clock is compressed — because compounding cannot be felt at human speed, and a child who never feels it has not learned it.</p>
      <div class="grid3">
        ${[1, 5, 10, 30].map((y) => `<div style="background:var(--tint);border-radius:var(--r-md);padding:10px 12px">
          <div class="small muted">in ${y} year${y > 1 ? 's' : ''}</div>
          <div style="font-weight:800;font-variant-numeric:tabular-nums">${money(Math.round(val * Math.pow(1.07, y)))}</div></div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:9px">Bizzington's own simulated rate. Not advice, not a forecast, and not any real market.</p>
    </div>
  </div>`;
}

/* ══ BIZZ & CO ════════════════════════════════════════════════════════ */
function viewBusiness() {
  const c = K();
  if (!c.biz) {
    return `<div class="stack">
      ${say('nana', 'Shutters are off. I have left you forty in the till and the rent is due whether anybody comes or not. Buy for less than you sell for, and count the difference honestly.')}
      <div class="card" style="text-align:center;padding:26px">
        <div style="font-size:40px">🏪</div>
        <h3 style="margin:8px 0 4px">Bizz &amp; Co</h3>
        <p class="muted small">Stock it, price it, open the doors, and find out what the weather thinks of your plan.</p>
        <button class="btn wide" style="margin-top:14px" data-act="openBiz">Take the keys</button>
      </div></div>`;
  }
  const b = c.biz;
  const last = b.log[0];
  const w = WEATHER.find((x) => x.id === b.weather);
  const stockValue = STOCK.reduce((t, s) => t + (b.stock[s.id] || 0) * price(s.cost), 0);
  return `<div class="stack">
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Day ${b.day} · Bizz &amp; Co</div>
        <div class="big" style="font-size:30px">${money(b.cash)}</div>
        <p class="small muted">in the till · ${money(stockValue)} sitting in stock · rent ${money(b.rent)} a day</p></div></div>
      <div class="row" style="margin-top:11px;gap:8px;flex-wrap:wrap">
        <button class="btn" data-act="bizTrade">Open for the day →</button>
        <button class="btn ghost sm" data-act="bizCashOut" ${b.cash <= price(20) ? 'disabled' : ''}>Take the profit home</button>
      </div>
    </div>
    ${last ? `<div class="card" style="border-color:${last.profit >= 0 ? 'var(--grow)' : 'var(--spend)'}">
      <div class="eyebrow">Yesterday · ${esc(WEATHER.find((x) => x.id === last.weather).name)} ${WEATHER.find((x) => x.id === last.weather).em}</div>
      <div class="stack" style="gap:5px;margin-top:6px;font-size:14px">
        <div class="row"><span class="grow muted">Revenue — everything that came in</span><b>${money(last.revenue)}</b></div>
        <div class="row"><span class="grow muted">Rent — arrives whether you sold anything</span><b>−${money(last.rent)}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Profit</span>
          <span class="big" style="font-size:20px;color:${last.profit >= 0 ? 'var(--grow)' : 'var(--spend)'}">${last.profit >= 0 ? '+' : '−'}${money(Math.abs(last.profit))}</span></div>
      </div>
      ${Object.keys(last.spoiled || {}).length ? `<p class="small" style="color:var(--spend);margin-top:8px;font-weight:650">
        ${Object.keys(last.spoiled).map((k) => last.spoiled[k] + ' ' + STOCK.find((s) => s.id === k).name.toLowerCase() + ' melted').join(', ')} — stock you paid for and cannot sell.</p>` : ''}
    </div>` : say('pip', 'Nothing has happened yet. Buy some stock, set your prices, then open the doors.')}
    <div class="card">
      <div class="eyebrow">Stock and prices</div>
      <p class="small muted" style="margin:3px 0 10px">Buy low, price it yourself. Put the price up and fewer people buy — the question is whether you end the day with more.</p>
      <div class="stack" style="gap:10px">
        ${STOCK.map((s) => {
          const have = b.stock[s.id] || 0, cost = price(s.cost), p = b.prices[s.id];
          const margin = p - cost;
          return `<div style="background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:11px">
            <div class="row"><span style="font-size:20px">${s.em}</span>
              <span class="grow"><b style="font-size:14.5px">${esc(s.name)}</b><br>
                <span class="small muted">${esc(s.desc)}</span></span>
              <span class="pill">${have} in stock</span></div>
            <div class="row" style="margin-top:9px;gap:8px;flex-wrap:wrap">
              <button class="btn ghost sm" data-act="bizBuy" data-arg="${s.id}" ${cost * 5 > b.cash ? 'disabled' : ''}>Buy 5 for ${money(cost * 5)}</button>
              <span class="small muted">${money(cost)} each</span>
              <span class="grow"></span>
              <span class="small muted">sell at</span>
              <div class="stepper">
                <button data-act="bizPrice" data-arg="${s.id}:-1" aria-label="lower the price of ${esc(s.name)}">−</button>
                <span class="n">${money(p)}</span>
                <button data-act="bizPrice" data-arg="${s.id}:1" aria-label="raise the price of ${esc(s.name)}">+</button></div>
            </div>
            <p class="small ${margin > 0 ? 'muted' : ''}" style="margin-top:6px;${margin > 0 ? '' : 'color:var(--spend);font-weight:700'}">
              ${margin > 0 ? 'Margin ' + money(margin) + ' each — before the rent.' : 'You are selling below what it cost you.'}</p>
          </div>`;
        }).join('')}
      </div>
    </div>
    ${b.log.length > 1 ? `<div class="card">
      <div class="eyebrow">The last few days</div>
      <div class="stack" style="gap:5px;margin-top:8px">
        ${b.log.slice(0, 8).map((l) => `<div class="row" style="font-size:13.5px">
          <span style="width:52px" class="muted">Day ${l.day}</span>
          <span style="width:26px">${WEATHER.find((x) => x.id === l.weather).em}</span>
          <span class="grow muted">${money(l.revenue)} in</span>
          <b style="color:${l.profit >= 0 ? 'var(--grow)' : 'var(--spend)'}">${l.profit >= 0 ? '+' : '−'}${money(Math.abs(l.profit))}</b></div>`).join('')}
      </div></div>` : ''}
  </div>`;
}

/* ══ STORE ════════════════════════════════════════════════════════════ */
export function viewStore() {
  const c = K();
  const nowT = Date.now();
  return `<div class="stack">
    ${say('mags', 'Everything here is lovely and none of it is necessary. I have written what else the money could have been under each price, which my old boss said was commercial suicide.')}
    ${SHOP.map((it) => {
      const p = price(it.units);
      const owned = c.shop.owned.includes(it.id);
      const spendRate = Math.max(1, (c.family.allowance != null ? c.family.allowance : c.money.wage) * c.money.rules.spend / 100);
      const weeks = Math.max(1, Math.round(p / spendRate));
      const grown = Math.round(p * Math.pow(1.07, 10));
      const cool = c.shop.cooling[it.id];
      const waiting = cool && nowT < cool;
      const hrs = waiting ? Math.ceil((cool - nowT) / 3600000) : 0;
      const afford = c.money.wallet + c.money.jars.spend >= p;
      return `<div class="card">
        <div class="row"><span style="font-size:28px">${it.em}</span>
          <div class="grow"><b style="font-size:15.5px">${esc(it.name)}</b>
            <p class="small muted">${esc(it.desc)}</p></div>
          <div style="text-align:right"><div class="big" style="font-size:19px">${money(p)}</div></div></div>
        <div style="background:var(--treasure-tint);color:var(--treasure-deep);border-radius:var(--r-md);padding:9px 12px;margin-top:10px;font-size:13px;font-weight:650">
          That's <b>${weeks} week${weeks > 1 ? 's' : ''}</b> of your Spend jar — or <b>${money(grown)}</b> in ten years if it went in the Grow jar instead.</div>
        <div class="row" style="margin-top:10px"><span class="grow"></span>
          ${owned ? '<span class="pill grow">yours</span>'
            : waiting ? `<span class="pill">think it over · ${hrs}h left</span>`
            : c.family.coolOff && !cool ? `<button class="btn ghost sm" data-act="cool" data-arg="${it.id}">Think it over →</button>`
            : `<button class="btn sm" data-act="buyItem" data-arg="${it.id}" ${afford ? '' : 'disabled'}>Buy it anyway</button>`}
        </div></div>`;
    }).join('')}
    <p class="small muted" style="text-align:center">Nothing here costs real money, and there is no path from this screen to a payment form. That is a rule, not an oversight.</p>
  </div>`;
}

/* ══ PROGRESS ═════════════════════════════════════════════════════════ */
export function viewProgress() {
  const c = K();
  const vals = c.history.map((h) => h.v);
  const scams = c.postbox.log.filter((l) => l.scam && l.safe).length;
  const scamsAll = c.postbox.log.filter((l) => l.scam).length;
  const rank = rankObj(c.learn.level);
  return `<div class="stack">
    <div class="card">
      <div class="eyebrow">Net worth, every decision so far</div>
      <div class="big" style="font-size:32px;color:var(--action)">${money(sim.netWorth(c))}</div>
      ${sparkline(vals.length > 1 ? vals : [0, sim.netWorth(c)], 300, 54, 'var(--action)')}
      <p class="small muted">The one chart a card app can't draw: it only has your last statement, and this has every decision since you opened your stall.</p>
    </div>
    <div class="grid3">
      <div class="card"><div class="eyebrow">Streak</div><div class="big">🔥 ${c.streak.days.length}</div><p class="small muted">days in a row</p></div>
      <div class="card"><div class="eyebrow">Rank</div><div class="big" style="font-size:20px">${rank.em} ${rank.name}</div><p class="small muted">level ${c.learn.level} of 30</p></div>
      <div class="card"><div class="eyebrow">Letters</div><div class="big">${c.postbox.log.length}</div><p class="small muted">${scamsAll ? scams + ' of ' + scamsAll + ' scams spotted' : 'no scams yet'}</p></div>
    </div>
    <div class="card">
      <div class="eyebrow">Chapters</div>
      <div class="stack" style="gap:7px;margin-top:9px">
        ${CHAPTERS.map((ch) => {
          const done = ch.cards.filter((x) => c.learn.done[x.id]).length;
          return `<div class="row" style="font-size:13.5px"><span style="width:22px">${ch.em}</span>
            <span class="grow">${esc(ch.title)}</span>
            <div class="bar" style="width:88px"><i style="width:${done / ch.cards.length * 100}%;background:${done === ch.cards.length ? 'var(--grow)' : 'var(--action)'}"></i></div>
            <span class="muted tabnum" style="width:34px;text-align:right">${done}/${ch.cards.length}</span></div>`;
        }).join('')}
      </div>
    </div>
    <button class="card" data-act="nav" data-arg="parents" style="display:block;width:100%;text-align:left">
      <div class="row"><span style="font-size:24px">👪</span><div class="grow">
        <p style="font-weight:800">The grown-up's page</p>
        <p class="small muted">What they learned, what they decided, Family Mode, and a printable week.</p></div>
        <span class="muted">→</span></div>
    </button>
  </div>`;
}

/* ══ PARENTS ══════════════════════════════════════════════════════════ */
export function viewParents() {
  const c = K(), s = R.s;
  const w = weekSummary(c);
  return `<div class="stack">
    <div class="card">
      <div class="eyebrow">For the grown-up</div>
      <h2 style="margin:2px 0 4px">${esc(c.name)}'s week</h2>
      <p class="small muted">Observation, never a grade on the child. The simulator is a window into instincts no quiz gives you.</p>
    </div>

    <div class="card">
      <div class="eyebrow">What they learned</div>
      <div class="stack" style="gap:6px;margin-top:8px">
        ${w.learned.length ? w.learned.map((t) => `<p class="small">📗 ${esc(t)}</p>`).join('')
          : '<p class="small muted">Nothing new this week.</p>'}
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">What they decided</div>
      <div class="stack" style="gap:8px;margin-top:8px">
        ${w.decisions.map((d) => `<div class="row" style="align-items:flex-start;gap:9px">
          <span style="font-size:15px">${d.em}</span><p class="small grow">${d.t}</p></div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">Talk together</div>
      <div class="stack" style="gap:7px;margin-top:8px">
        ${w.prompts.map((p) => `<p class="small">💬 ${esc(p)}</p>`).join('')}
      </div>
      <button class="btn ghost wide" style="margin-top:12px" data-act="print">🖨 Printable weekly page</button>
    </div>

    <div class="card stack">
      <div class="eyebrow">Family Mode — entirely manual, no bank connection</div>
      <p class="small muted">Mirror a real allowance and real jobs into the town, so the wallet tracks their actual life. Nothing here touches real money, and it never can.</p>
      <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">
        <span class="small grow">Weekly allowance</span>
        <div class="stepper">
          <button data-act="allow" data-arg="-1" aria-label="less allowance">−</button>
          <span class="n">${c.family.allowance == null ? 'off' : money(c.family.allowance)}</span>
          <button data-act="allow" data-arg="1" aria-label="more allowance">+</button></div>
      </div>
      <p class="small muted">${c.family.allowance == null
        ? 'Off — the town pays its own wage of ' + money(c.money.wage) + '. Some households have no allowance and the app must never assume one.'
        : 'On — replaces the town wage on pay day.'}</p>
      <div class="sep"></div>
      <div class="row"><span class="small grow">Pay day falls on</span>
        <select data-field="payday" data-live="1" style="padding:8px 10px;border-radius:8px;border:1.5px solid var(--line);background:var(--surface2);font-weight:700">
          ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) =>
            `<option value="${i}" ${c.family.payWeekday === i ? 'selected' : ''}>${d}</option>`).join('')}
        </select></div>
      <div class="row"><span class="small grow">"Think it over" before big buys</span>
        <button class="btn ${c.family.coolOff ? '' : 'ghost'} sm" data-act="coolOff">${c.family.coolOff ? 'On' : 'Off'}</button></div>
    </div>

    <div class="card stack">
      <div class="eyebrow">Jobs at home</div>
      <p class="small muted">Anything here that is ticked pays into the town on pay day. You tick it; the app never checks.</p>
      ${(c.family.chores || []).map((ch, i) => `<div class="row" style="gap:9px">
        <button class="btn ${ch.done ? '' : 'ghost'} sm" data-act="chore" data-arg="${i}">${ch.done ? '✓' : ''}</button>
        <span class="grow" style="font-weight:650">${esc(ch.name)}</span>
        <span class="tabnum muted">${money(ch.amt)}</span>
        <button class="small muted" data-act="choreDel" data-arg="${i}" aria-label="remove">✕</button></div>`).join('')}
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <input data-field="choreName" placeholder="Job" value="${esc(R.fields.choreName || '')}"
          style="flex:2 1 130px;min-width:0;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <input data-field="choreAmt" inputmode="numeric" placeholder="${sign()}" value="${esc(R.fields.choreAmt || '')}"
          style="flex:1 1 80px;min-width:0;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <button class="btn sm" data-act="choreAdd">Add</button>
      </div>
    </div>

    <div class="card stack">
      <div class="eyebrow">Children in this household</div>
      ${s.kids.map((k, i) => `<div class="row" style="gap:9px">
        <span class="grow" style="font-weight:${i === s.active ? 800 : 650}">${esc(k.name)}
          <span class="small muted"> · level ${k.learn.level} · ${k.band === 'sprout' ? 'Sprout' : 'Builder'}</span></span>
        ${i === s.active ? '<span class="pill grow">playing</span>'
          : `<button class="btn ghost sm" data-act="switchKid" data-arg="${i}">Switch to</button>`}
      </div>`).join('')}
      <button class="btn ghost wide" data-act="addKid">+ Add another child</button>
      <p class="small muted">Each child has their own town, their own money and their own ladder. Nothing is shared, and no child can see another's.</p>
    </div>

    <div class="card stack">
      <div class="eyebrow">Settings</div>
      <div class="row"><span class="small grow">Currency</span>
        <select data-field="cur" data-live="1" style="padding:8px 10px;border-radius:8px;border:1.5px solid var(--line);background:var(--surface2);font-weight:700">
          ${Object.keys(CURRENCIES).map((k) => `<option value="${k}" ${c.currency === k ? 'selected' : ''}>${CURRENCIES[k].sign} ${CURRENCIES[k].name}</option>`).join('')}
        </select></div>
      <p class="small muted">Changing it converts the town rather than resetting it.</p>
      <div class="row"><span class="small grow">Mode</span>
        <button class="btn ghost sm" data-act="band">${c.band === 'sprout' ? 'Sprout (8–10)' : 'Builder (11+)'}</button></div>
      <div class="row"><span class="small grow">Sound</span>
        <button class="btn ${s.settings.sound ? '' : 'ghost'} sm" data-act="sound">${s.settings.sound ? 'On' : 'Off'}</button></div>
    </div>

    <div class="card stack">
      <div class="eyebrow">Prototype tools</div>
      <p class="small muted">Pay day is a real week away, and the clock is client-side in this build. The shipping build takes it from the server so it cannot be advanced by winding the device forward.</p>
      <button class="btn ghost wide" data-act="skipWeek">⏩ Jump to the next pay day</button>
      <button class="btn ghost wide" data-act="grantXP">＋ Add 200 XP (to see further up the street)</button>
      <button class="btn ghost wide" style="color:var(--spend)" data-act="wipe">Start this household over</button>
    </div>
  </div>`;
}

function weekSummary(c) {
  const since = Date.now() - 7 * 86400000;
  const learned = ALL_CARDS.filter((x) => c.learn.done[x.id]).slice(-5).map((x) => x.title);
  const txns = c.money.txns.filter((t) => t.t >= since);
  const decisions = [];
  const shop = txns.filter((t) => t.cat === 'shop');
  if (shop.length) decisions.push({ em: '🛍️', t: `Bought ${shop.length} thing${shop.length > 1 ? 's' : ''} from Mags after being shown what else the money could have been.` });
  const raids = txns.filter((t) => /Took back from/.test(t.label));
  if (raids.length) decisions.push({ em: '🏗️', t: `Raided a goal fund ${raids.length} time${raids.length > 1 ? 's' : ''} — worth asking what it was for.` });
  const scam = c.postbox.log.filter((l) => l.scam && !l.safe).length;
  if (scam) decisions.push({ em: '🛡️', t: `Fell for ${scam} scam letter${scam > 1 ? 's' : ''} here, with play money. The cheapest place in the world to learn it.` });
  const jobs = txns.filter((t) => t.cat === 'job');
  if (jobs.length) decisions.push({ em: '🧺', t: `Took ${jobs.length} job${jobs.length > 1 ? 's' : ''} on Market Row rather than waiting for pay day.` });
  if (c.money.jars.grow > 0) decisions.push({ em: '🌱', t: `Has ${money(c.money.jars.grow)} in the Grow jar — money deliberately set aside for far away.` });
  if (c.money.rules.save + c.money.rules.grow >= 50) decisions.push({ em: '📊', t: `Set the pay-day rule to keep ${c.money.rules.save + c.money.rules.grow}% back. Their choice, not a default.` });
  if (c.money.bank.loan) decisions.push({ em: '🤝', t: `Is repaying a loan and can see the total cost of it on screen.` });
  if (!decisions.length) decisions.push({ em: '🌤️', t: 'Nothing yet — a pay day or two will fill this in.' });

  const prompts = [];
  if (shop.length) prompts.push('Ask what they nearly bought and didn\'t.');
  if (c.money.goals.length) prompts.push(`Ask how many weeks are left on "${c.money.goals[0].name}" — they will know.`);
  if (scam) prompts.push('Ask them what the scam letter was trying to make them feel.');
  prompts.push('Ask what the first thing you ever saved up for was. It is one of the app\'s own questions.');
  return { learned, decisions, prompts };
}

/* ══ COLLECTION ═══════════════════════════════════════════════════════ */
export function viewCollection() {
  const c = K();
  const have = Object.keys(BADGES).filter((k) => c.badges.includes(k)).length;
  return `<div class="stack">
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Badges</div>
        <h2 style="margin:2px 0 0">${have} of ${Object.keys(BADGES).length}</h2></div></div>
      <div class="grid3" style="margin-top:12px">
        ${Object.keys(BADGES).map((k) => {
          const b = BADGES[k], has = c.badges.includes(k);
          return `<div style="background:${has ? 'var(--treasure-tint)' : 'var(--tint)'};border-radius:var(--r-md);padding:12px;text-align:center;opacity:${has ? 1 : .45}">
            <div style="font-size:24px">${has ? b.em : '🔒'}</div>
            <div style="font-weight:800;font-size:13px;margin-top:3px">${esc(b.name)}</div>
            <div class="small muted" style="font-size:11.5px;line-height:1.35">${has ? esc(b.desc) : 'not yet'}</div></div>`;
        }).join('')}
      </div>
    </div>
    <div class="card">
      <div class="eyebrow">People you've met</div>
      <div class="grid3" style="margin-top:10px">
        ${Object.keys(CAST).map((k) => `<div style="background:var(--tint);border-radius:var(--r-md);padding:12px;text-align:center">
          <div style="width:54px;height:54px;margin:0 auto;border-radius:50%;overflow:hidden">${CAST[k].svg}</div>
          <div style="font-weight:800;font-size:13.5px;margin-top:5px">${esc(CAST[k].name)}</div>
          <div class="small muted" style="font-size:11.5px;line-height:1.35">${esc(CAST[k].role)}</div></div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="eyebrow">The town museum · money of the world</div>
      <p class="small muted" style="margin:4px 0 10px">Real notes and coins, unlocked as you climb — a quiet way to teach that money is an agreement rather than a law of nature.</p>
      <div class="grid3">
        ${Object.keys(CURRENCIES).map((k, i) => {
          const has = c.currency === k || c.learn.level >= (i + 1) * 4;
          return `<div style="background:var(--tint);border-radius:var(--r-md);padding:12px;text-align:center;opacity:${has ? 1 : .4}">
            <div style="font-size:22px;font-weight:800">${has ? CURRENCIES[k].sign : '🔒'}</div>
            <div style="font-weight:700;font-size:12.5px">${has ? esc(CURRENCIES[k].name) : 'level ' + ((i + 1) * 4)}</div></div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}
