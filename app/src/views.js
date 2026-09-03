/* views.js — every screen. Pure string in, [data-act] out.
   Nothing here computes money; sim.js owns that and these render it. */

import { esc, sparkline, clamp, nWord } from './ui.js';
import { money, price, sign, CURRENCIES, shortDate, weekday } from './fmt.js';
import { say, face, ico, CAST } from './art.js';
import { townSVG, PLACES } from './town.js';
import { lessonBlock } from './lessonplayer.js';
import { companionCard } from './companionview.js';
import { overnightCard, receiptSlip } from './keepsakes.js';
import * as co from './companion.js';
import { CHAPTERS, ALL_CARDS, SHOP, ASSETS, BADGES, GLOSSARY, STOCK, WEATHER, HOMES,
  WORLDS, QUESTS, FIXES, rankFor, rankObj, RANKS, shuffledDrill, drillCount,
  chapterDone, isOpen as chapterOpen, needFor, worldOpen } from './content.js';
import * as sim from './sim.js';
import * as ledger from './ledger.js';
import * as mastery from './mastery.js';
import * as report from './report.js';
import { OBJECTIVES, objective, teachCard } from './objectives.js';
import { JOB_GAME } from './jobgames.js';
import { CLASSES } from './assetclasses.js';
import { CAL } from './world.js';
import * as biz from './business.js';
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
/* ── the three journeys (docs/09) ─────────────────────────────────────
   The app is a daily life the child runs: a Household (can I cover my life,
   and what's left over?), a Livelihood (what is my time worth, and can I
   make it worth more?) and a Portfolio (where does the left-over live?).
   One wallet fuses them. Home shows each journey as one card: its name, its
   one headline number, and its beats for today — everything these absorb
   used to be six separate cards scattered down the page.

   A row here is a BEAT — something to do or to know today — in the same
   visual language as the quest rows, because to a child they are the same
   kind of thing: the day, in pieces. */
function beat(act, arg, icon, title, sub2, right, hot) {
  return `<button class="jbeat${hot ? ' hot2' : ''}" data-act="${act}" ${arg ? `data-arg="${arg}"` : ''}>
    ${ico(icon, icon, 22)}
    <span class="grow" style="min-width:0;text-align:left">
      <b>${title}</b><span class="small muted" style="display:block">${sub2}</span></span>
    ${right || ''}
  </button>`;
}

function journeys(c) {
  const due = sim.payDue(c, R.s);
  const d = sim.daysToPay(c);
  const g = c.money.goals.find((x) => !x.done);
  const inc = sim.weeklyIncome(c), cost = sim.weeklyCost(c);
  const left = inc - cost;
  const ind = sim.independence(c);

  /* Household — consumer. Postbox, pay day, the goal, and the meter. */
  const hhBeats = [
    co.has(c) ? '' : beat('shelter', '', 'family', 'Five who need homes', 'The shelter behind the Jar Shed.'),
    c.postbox.answered
      ? beat('postbox', '', 'postbox', 'Postbox emptied', 'Another letter tomorrow.')
      : beat('postbox', '', 'postbox', "There's a letter", 'One a day. Thirty seconds.', '<span class="pill spendp">1</span>', true),
    due
      ? beat('payday', '', 'bell', "It's pay day — ring the bell", 'Wages in, bills out, jars filled.', '', true)
      : beat('sub', 'jars', 'jars', d === 0 ? 'Pay day later today' : `Pay day in ${nWord(d)} ${d === 1 ? 'day' : 'days'}`,
          `${money(inc)} in, ${money(cost)} straight back out.`),
    g ? beat('sub', 'goals', 'goal', esc(g.name), `${money(g.saved)} of ${money(g.target)} — ${g.saved >= g.target ? 'the roof is on'
        : (w => w + ' more pay ' + (w === 1 ? 'day' : 'days') + ' at your Save rate')(sim.weeksToGoal(c, g))}`,
        `<span class="small muted tabnum">${Math.round(g.saved / g.target * 100)}%</span>`) : '',
  ].join('');

  const household = `<div class="card jny" style="--ja:var(--save)">
    <div class="row">
      <div class="grow"><div class="eyebrow">The Household</div>
        <p class="cs">Can you cover your life — and what's left over?</p></div>
      <div style="text-align:right"><div class="big" style="color:${left >= 0 ? 'var(--ink)' : 'var(--spend)'}">${money(left)}</div>
        <div class="small muted">left over / week</div></div>
    </div>
    <div class="jstack">${hhBeats}</div>
    <button class="jfoot" data-act="sub" data-arg="place">
      <span class="bar grow" style="height:6px"><i style="width:${Math.min(100, ind * 100)}%;background:${ind >= 1 ? 'var(--grow)' : 'var(--action)'}"></i></span>
      <span class="small muted tabnum">${Math.round(ind * 100)}% of your life pays for itself</span>
    </button>
  </div>`;

  /* Livelihood — producer. Today's shifts, and the shop once it is yours. */
  const jobs = sim.jobsToday(c);
  const jleft = jobs.filter((j) => !j.done).length;
  const bizOpen = chapterOpen(c, 'business') && c.biz;
  const KIND = { stack: 'stacking', trim: 'balancing', sweep: 'clearing', runner: 'running' };
  const lvBeats = [
    ...jobs.slice(0, 3).map((j) => {
      const gm = JOB_GAME[j.id];
      return j.done
        ? beat('sub', 'wallet', j.em, esc(j.name), 'Done — back tomorrow.', '<span class="pill grow">✓</span>')
        : beat('job', j.id, j.em, esc(j.name),
            `${gm ? esc(KIND[gm.kind]) + ' · ' : ''}for ${esc(j.who)}${sim.jobBest(c, j.id) ? ' · best ' + money(sim.jobBest(c, j.id)) : ''}`,
            '<span class="pill">Work</span>', true);
    }),
    bizOpen ? beat('sub', 'business', 'shop', "Your shop", 'Stock, prices, and what the till took.',
      `<span class="small muted tabnum">${money(sim.bizValue(c))}</span>`, true) : '',
  ].join('');

  const livelihood = `<div class="card jny" style="--ja:var(--treasure)">
    <div class="row">
      <div class="grow"><div class="eyebrow">The Livelihood</div>
        <p class="cs">What is your time worth — and can you make it worth more?</p></div>
      <div style="text-align:right"><div class="big">${jobs.length - jleft}/${jobs.length}</div>
        <div class="small muted">shifts today</div></div>
    </div>
    <div class="jstack">${lvBeats || `<p class="small muted">No work posted in ${esc(WORLDS[c.world || 0].name)} today.</p>`}</div>
  </div>`;

  /* Portfolio — allocator. Drawn locked rather than hidden, like the street. */
  const bankOpen = chapterOpen(c, 'bank'), exOpen = chapterOpen(c, 'portfolio');
  let portfolio;
  if (!bankOpen && !exOpen) {
    portfolio = `<div class="card jny" style="--ja:var(--grow)">
      <div class="row">
        <div class="grow"><div class="eyebrow">The Portfolio</div>
          <p class="cs">Where does the left-over live — and what is it doing?</p></div>
        ${ico('lock', '🔒', 22)}
      </div>
      <div class="jstack">${beat('nav', 'learn', 'lesson', 'Opens with ' + esc(needFor('bank') || 'the Banking chapter'),
        'The Bank takes deposits the day you understand what it does with them.')}</div>
    </div>`;
  } else {
    const invested = c.money.bank.balance + sim.holdingsValue(c);
    const up = c.market.lastMove >= 0;
    const pfBeats = [
      bankOpen ? beat('sub', 'bank', 'bank', 'The Bank', `${money(c.money.bank.balance)} on deposit, earning while you sleep.`) : '',
      exOpen ? beat('sub', 'portfolio', 'chartUp', 'The Exchange', `Market day — see what moved. Most days the right move is nothing.`,
        `<span class="pill ${up ? 'grow' : 'spendp'}">${up ? '▲' : '▼'}</span>`, true) : '',
      c.learn.level >= 16 ? beat('nav', 'market40', 'company', 'The Market Game', 'Forty companies, forty years, one decade at a time.') : '',
    ].join('');
    portfolio = `<div class="card jny" style="--ja:var(--grow)">
      <div class="row">
        <div class="grow"><div class="eyebrow">The Portfolio</div>
          <p class="cs">Where does the left-over live — and what is it doing?</p></div>
        <div style="text-align:right"><div class="big">${money(invested)}</div>
          <div class="small muted">invested</div></div>
      </div>
      <div class="jstack">${pfBeats}</div>
    </div>`;
  }

  return `<div class="sect"><b>Your three journeys</b><i></i></div>
    ${household}${livelihood}${portfolio}`;
}

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
    <div class="town hero">
      <div class="town-scroll">${townSVG(c)}</div>
      <div class="town-head">
        <span class="town-chip"><span class="eyebrow" style="color:inherit">You are in</span><b>${esc(world.name)}</b></span>
        <button class="btn ghost sm" data-act="nav" data-arg="worlds">Travel</button>
      </div>
      <div class="town-cap"><span>${ico('streak', '🔥', 14)} ${c.streak.days.length}</span><span>Lv ${c.learn.level} · ${rankFor(c.learn.level)}</span></div>
    </div>

    ${overnightCard(c, R.s)}
    ${companionCard(c)}

    ${strip}

    ${journeys(c)}

    ${lessonBeat(c)}

    <div class="card">
      <div class="row"><div class="grow"><div class="ct">Today's three</div>
        <p class="cs">Wages into the same wallet as everything else.</p></div>
        <span class="pill ${allDone ? 'grow' : ''}">${quests.filter((q) => q.claimed).length}/${quests.length}</span></div>
      <div class="stack" style="gap:8px;margin-top:11px">
        ${quests.map((q) => `<div class="row" style="gap:10px;background:${q.claimed ? 'var(--grow-tint)' : 'var(--surface2)'};
          border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
          <span style="${q.claimed ? 'opacity:.5' : ''}">${ico('quest', q.em, 26)}</span>
          <span class="grow" style="min-width:0">
            <b style="font-size:14px;${q.claimed ? 'opacity:.6' : ''}">${esc(q.t)}</b>
            <div class="small muted">${q.claimed ? 'Claimed.' : esc(q.sub)}</div>
            ${q.claimed ? '' : `<div class="bar" style="height:5px;margin-top:5px"><i style="width:${Math.min(100, q.at / q.n * 100)}%"></i></div>`}
          </span>
          ${q.claimed ? '<span class="pill grow">✓</span>'
            : q.done ? `<button class="btn ghost sm" data-act="claim" data-arg="${q.id}">Take ${money(price(q.pay))}</button>`
            : `<span class="pill">${q.at}/${q.n}</span>`}
        </div>`).join('')}
      </div>
      ${allDone && !c.quests.bonus ? `<button class="btn ghost wide" style="margin-top:11px" data-act="questBonus">All ${nWord(quests.length)} — take ${money(price(12))} more</button>` : ''}
      ${c.quests.bonus ? `<p class="small muted" style="margin-top:9px">All ${nWord(quests.length)} done. Fresh ones tomorrow.</p>` : ''}
    </div>

    ${closingTime(c, quests)}

    <div class="sect"><b>The town</b><i></i></div>

    ${(() => {
      const fx = sim.townFixes(c).filter((f) => !f.locked);
      const tp = sim.townProgress(c);
      if (!fx.length) return '';
      const next = fx.find((f) => !f.done) || fx[0];
      return `<div class="card">
        <div class="row"><div class="grow"><div class="eyebrow">Put it right · ${esc(world.name)}</div>
          <p class="small muted">Money spent on something that produces is not the same as money spent on something that doesn't.</p></div>
          <span class="pill ${tp.done === tp.all ? 'grow' : ''}">${tp.done}/${tp.all} mended</span></div>
        <div class="stack" style="gap:9px;margin-top:11px">
          ${fx.map((f) => `<div style="background:${f.done ? 'var(--grow-tint)' : 'var(--surface2)'};
            border:1px solid var(--line);border-radius:var(--r-md);padding:10px 12px">
            <div class="row" style="gap:10px">
              <span style="${f.done ? '' : 'filter:grayscale(.7) opacity(.75)'}">${ico(f.em, f.em, 21)}</span>
              <span class="grow" style="min-width:0">
                <b style="font-size:14px">${esc(f.name)}</b>
                <div class="small muted">${esc(f.done ? f.fixed : f.broken)}</div></span>
              ${f.done ? '<span class="pill grow">mended</span>'
                : `<span class="small muted tabnum">${money(f.put)} / ${money(f.cost)}</span>`}
            </div>
            ${f.done ? `<p class="small" style="color:var(--grow);font-weight:700;margin-top:6px">✓ ${esc(f.gives)}</p>`
              : `<div class="bar" style="height:6px;margin-top:7px"><i style="width:${f.pct * 100}%;background:var(--treasure)"></i></div>
                 <div class="row" style="margin-top:8px;gap:8px;flex-wrap:wrap">
                   <span class="small muted grow">${esc(f.gives)}</span>
                   <button class="btn ghost sm" data-act="putRight" data-arg="${f.id}" ${c.money.wallet <= 0 ? 'disabled' : ''}>
                     Put in ${money(Math.min(price(10), Math.max(0, c.money.wallet), f.left))}</button>
                 </div>`}
          </div>`).join('')}
        </div>
      </div>`;
    })()}






    ${say('pip', hometalk(c))}
  </div>`;
}

/* Closing time. The one card in the app that is about stopping, and it only
   appears once the day's work is actually finished — a child who has not done
   it does not get told what tomorrow is for. Every line is measured (sim.js
   does the arithmetic, this only writes the sentence), because a number of
   days you can check beats any amount of "come back soon!". */
function closingTime(c, quests) {
  if (!quests.length || !quests.every((q) => q.claimed)) return '';
  const led = sim.dayLedger(c);
  const f = sim.nearestFix(c);
  const nx = sim.nextOpening(c);
  const pay = sim.daysToPay(c);
  const rows = [];
  if (f) rows.push({ em: f.em, t: f.name, sub: f.days
    ? `${money(f.left)} to go — about ${nWord(f.days)} more ${f.days === 1 ? 'day' : 'days'} at what you earned today.`
    : `${money(f.left)} to go, in ${esc(f.where)}.` });
  if (nx) rows.push({ em: nx.em, t: nx.t, sub: nx.chapter
    ? `Opens when you finish ${esc(nx.chapter)} — ${nWord(nx.left)} ${nx.left === 1 ? 'card' : 'cards'} left.`
    : 'Opens next.' });
  if (pay <= 2) rows.push({ em: '🔔', t: pay === 0 ? 'Pay day — the bell is ready now'
      : pay === 1 ? 'Pay day, tomorrow' : 'Pay day, the day after',
    sub: `${money(c.money.wage)} in, the week's bills out, and your jars split what is left.` });
  rows.push({ em: '📮', t: `A new letter, and ${nWord(quests.length)} new jobs`,
    sub: 'The postbox refills overnight and the town asks for different help.' });

  return `<div class="card" style="border-color:var(--gold);background:var(--gold-tint)">
    <div class="row"><div class="grow"><div class="eyebrow">Closing time</div>
      <h3 style="font-size:17px;margin:1px 0">That is today done</h3></div>
      ${ico('closing', '🌙', 32)}</div>
    <div class="row" style="gap:14px;margin-top:10px;flex-wrap:wrap">
      <span><div class="eyebrow">Came in</div><b style="font-size:16px">${money(led.in)}</b></span>
      <span><div class="eyebrow">Went out</div><b style="font-size:16px">${money(led.out)}</b></span>
      <span><div class="eyebrow">Into the town</div><b style="font-size:16px;color:var(--grow)">${money(led.put)}</b></span>
    </div>
    <p class="small muted" style="margin-top:10px">${led.net >= 0
      ? `You kept ${money(led.net)} of it. The rest is either spent or working.`
      : `You spent ${money(-led.net)} more than came in today. That happens — it is what the jars are for.`}</p>
    <div class="eyebrow" style="margin-top:13px">Waiting for you tomorrow</div>
    <div class="stack" style="gap:8px;margin-top:7px">
      ${rows.slice(0, 3).map((r) => `<div class="row" style="gap:10px;background:var(--surface);
        border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
        ${ico(r.em, r.em, 20)}
        <span class="grow" style="min-width:0"><b style="font-size:14px">${esc(r.t)}</b>
          <div class="small muted">${r.sub}</div></span></div>`).join('')}
    </div>
    ${say('pip', 'Stopping when the day is done is a money skill too. The town keeps going without you — the fountain does not un-mend overnight.')}
  </div>`;
}

/* The day's lesson beat (docs/05 §B3). ONE new objective or ONE retrieval —
   never both, and retrieval wins when anything is due, because the thing
   about to be forgotten is worth more than the next new thing. */
function lessonBeat(c) {
  const bt = ledger.beat(c, ALL_CARDS, { mathsMet: ledger.mathsMet(c) });
  if (!bt) {
    return `<div class="card">
      <div class="eyebrow">Today's lesson</div>
      <p class="small muted" style="margin-top:6px">Nothing is due and there is nothing new to
        meet yet — the next rung needs maths you have not got to. That is not a wall; it comes
        on its own.</p></div>`;
  }
  const done = c.learn.beat && c.learn.beat.cardId === bt.card.id && c.learn.beat.answered;
  const retr = bt.shape === 'retrieve';
  return `<div class="card lead">
    <div class="row"><div class="grow">
      <div class="eyebrow">${retr ? 'Still know this?' : "Today's lesson"}</div>
      <div class="ct">${esc(retr ? bt.objective.short : bt.card.title)}</div>
      <p class="cs">${retr
        ? `You met this ${daysAgo(mastery.lastSeen(c, bt.objective.id))}. One question, a different one.`
        : esc(bt.objective.short)}</p></div>
      ${ico(retr ? 'quest' : 'lesson', retr ? '🔁' : '📘', 34)}</div>
    ${done
      ? '<p class="small" style="margin-top:10px;color:var(--grow);font-weight:700">Done for today.</p>'
      : `<button class="btn wide" style="margin-top:11px" data-act="beat">${retr ? 'One question' : 'Read it'}</button>`}
  </div>`;
}
function daysAgo(t) {
  if (!t) return 'a while back';
  const d = Math.round((Date.now() - t) / 86400000);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago';
}

/* The day's work, on Home. It lived two taps deep in Money -> Wallet, which
   is why turning every job into a game changed nothing anyone could see: the
   most repeated action in the app was not on the screen the session starts
   on. Each row now says what kind of work it is and what your best is, so a
   job reads as a thing you play rather than a button that pays. */
function todaysWork(c) {
  const jobs = sim.jobsToday(c);
  if (!jobs.length) return '';
  const left = jobs.filter((j) => !j.done).length;
  const KIND = { stack: 'stacking', trim: 'balancing', sweep: 'clearing', runner: 'running' };
  return `<div class="card">
    <div class="row"><div class="grow"><div class="ct">Today's work</div>
      <p class="cs">${esc(WORLDS[c.world || 0].name)} · each one is a shift you play, and how well you do it is what it pays</p></div>
      <span class="pill ${left ? '' : 'grow'}">${left ? left + ' left' : 'all done'}</span></div>
    <div class="stack" style="gap:8px;margin-top:11px">
      ${jobs.map((j) => {
        const g = JOB_GAME[j.id];
        const best = sim.jobBest(c, j.id);
        return `<div class="row" style="gap:10px;background:${j.done ? 'var(--grow-tint)' : 'var(--surface2)'};
          border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
          <span style="${j.done ? 'opacity:.5' : ''}">${ico(j.em, j.em, 26)}</span>
          <span class="grow" style="min-width:0">
            <b style="font-size:14px;${j.done ? 'opacity:.6' : ''}">${esc(j.name)}</b>
            <div class="small muted">${j.done ? 'Back tomorrow.'
              : `${g ? esc(KIND[g.kind]) + ' · ' : ''}for ${esc(j.who)}${best ? ' · best ' + best : ''}`}</div>
          </span>
          ${j.done ? '<span class="pill grow">✓</span>'
            : `<button class="btn ghost sm" data-act="job" data-arg="${j.id}">${g ? 'Work' : money(j.amt)}</button>`}
        </div>`;
      }).join('')}
    </div>
    <p class="small muted" style="margin-top:10px">A poor shift still pays — you did the work.
      A good one pays roughly double. It never pays more than that.</p>
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
          ${ico(open ? w.em : '🔒', open ? w.em : '🔒', 30)}
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
        <div class="eyebrow">${ico(rank.em, rank.em, 15)} ${rank.name} · level ${c.learn.level} of 30</div>
        <h2 style="margin:2px 0 0">${c.learn.xp} XP</h2>
        <p class="small muted">Learning ${esc(rank.of)}.</p></div>
        <div class="small muted" style="text-align:right">${bar.need} XP to<br>level ${c.learn.level + 1}</div></div>
      <div class="bar" style="margin-top:10px"><i style="width:${bar.pct * 100}%"></i></div>
      <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap">
        ${RANKS.map((r) => `<span class="pill ${c.learn.level >= r.at ? 'gold' : ''}">${ico(r.em, r.em, 14)} ${r.name}<span style="font-family:var(--mono);opacity:.7"> L${r.at}</span></span>`).join('')}
      </div>
    </div>
    <div class="grid2">
      <button class="card" data-act="shelf" data-arg="words" style="text-align:left">
        <div class="row">${ico('lesson', '📖', 24)}<div class="grow">
        <p style="font-weight:800">Money Words</p><p class="small muted">${GLOSSARY.length} terms, in plain English.</p></div></div></button>
      <button class="card" data-act="nav" data-arg="arcade" style="text-align:left">
        <div class="row">${ico('arcade', '🎮', 24)}<div class="grow">
        <p style="font-weight:800">Practise it</p><p class="small muted">Six games. Wages into the same wallet.</p></div></div></button>
    </div>
    ${say('pip', 'Every card ends with one question. Get it right and the town grows. Get it wrong and I tell you why — that counts too.')}
    <div class="chapts">
      ${CHAPTERS.map((ch) => {
        const done = ch.cards.filter((x) => c.learn.done[x.id]).length;
        const locked = c.learn.level < ch.lv;
        return `<div class="card pad0" ${locked ? 'style="opacity:.62"' : ''}>
          <div style="padding:14px 16px;display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line-soft)">
            ${ico(locked ? '🔒' : ch.em, locked ? '🔒' : ch.em, 24)}
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
  return `<div class="stack">
    <button class="small muted" data-act="closeCard">← All chapters</button>
    ${lessonBlock(card.id)}
    <div class="card stack">
      <div class="eyebrow">${esc(CHAPTERS.find((x) => x.id === card.ch).title)}</div>
      <h2>${esc(card.title)}</h2>
      ${say(card.who, card.teach)}
      <div style="background:var(--tint);border-radius:var(--r-md);padding:12px 14px;font-size:14px;border-left:3px solid var(--action)">
        <span class="eyebrow">For instance</span><br>${esc(card.eg)}</div>
    </div>
    ${(() => {
      /* One question at a time, permuted independently, the verdict at the
         end. A stale drill from the one-question era just starts over. */
      const total = drillCount(card);
      const live = st && st.card === card.id && st.picks ? st : null;
      const qi = live ? Math.min(live.qi, total - 1) : 0;
      const dq = shuffledDrill(card, qi);
      const p = live && live.picks[qi];
      const last = qi === total - 1;
      return `<div class="card stack">
      <div class="eyebrow">${total > 1 ? `Question ${qi + 1} of ${total}` : 'One question'}</div>
      <h3 style="font-size:18px">${esc(dq.q)}</h3>
      <div class="stack" style="gap:8px">
        ${dq.opts.map((o, i) => {
          let k = '';
          if (p) k = (i === dq.answer) ? ' ok' : (i === p.pick ? ' no' : '');
          return `<button class="opt${k}" data-act="answer" data-arg="${i}" ${p ? 'disabled' : ''}>
            <span class="k">${'ABCD'[i]}</span>${esc(o)}</button>`;
        }).join('')}
      </div>
      ${p ? `<div style="background:${p.right ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:12px 14px;font-size:14px">
          <b>${p.right ? 'That’s it.' : 'Not quite — and this is the useful bit:'}</b> ${esc(dq.why)}</div>` : ''}
      ${p && !last ? `<button class="btn wide" data-act="nextQ">Next question →</button>` : ''}
      ${p && last ? `<button class="btn wide" data-act="cardDone" data-arg="${card.id}">Take it back to town →</button>` : ''}
    </div>`; })()}
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
        ${open ? '' : ico('lock', '🔒', 14) + ' '}${x.n}</button>`;
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
          ${ico(j.em, j.em, 20)}
          <span class="grow"><b style="font-size:14px">${esc(j.name)}</b><br><span class="small muted">for ${esc(j.who)}</span></span>
          ${j.done ? '<span class="pill grow">done today</span>'
            : `<button class="btn ghost sm" data-act="job" data-arg="${j.id}">${money(j.amt)}</button>`}
        </div>`).join('')}
      </div>
    </div>
    <div class="card pad0">
      <div style="padding:12px 16px;border-bottom:1px solid var(--line-soft);display:flex;align-items:center">
        <span class="eyebrow grow">Every movement</span>
        <button class="small muted" data-act="print">${ico('printer', '🖨', 15)} Statement</button></div>
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
      <div class="row">${ico(h.em, h.em, 34)}<div class="grow">
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
      <div class="row" style="margin-top:4px">${ico(next.em, next.em, 28)}
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

/* The economy, on the screen where it matters. Every price in the Exchange is
   a function of these three numbers (world.js), which is the entire reason a
   child can be told WHY something moved instead of watching noise. */
function worldCard(c) {
  const w = sim.marketWorld(c);
  const locked = CLASSES.filter((a) => !ledger.mathsMet(c)(a.needs));
  const stat = (k, v, tone) => `<span><div class="eyebrow">${k}</div>
    <b style="font-size:17px;font-variant-numeric:tabular-nums;${tone ? 'color:' + tone : ''}">${v}</b></span>`;
  return `<div class="card" style="border-color:var(--action)">
    <div class="row"><div class="grow"><div class="eyebrow">The town this week</div>
      <h3 style="font-size:17px;margin:1px 0">${esc(sim.marketWhy(c))}</h3></div>
      ${ico('market', '📊', 30)}</div>
    <div class="row" style="gap:16px;margin-top:10px;flex-wrap:wrap">
      ${stat('Bank rate', w.rate.toFixed(2) + '%')}
      ${stat('Prices rising', w.inflation.toFixed(1) + '%')}
      ${stat('The town', (w.growth >= 0 ? '+' : '') + w.growth.toFixed(1) + '%',
        w.growth < 0 ? 'var(--spend)' : '')}
    </div>
    <p class="small muted" style="margin-top:10px">Everything below is priced off these three
      numbers — so when something moves there is always a reason, and it is usually the same
      reason for more than one of them. This is Bizzington's own economy, not a forecast of
      anybody's real one.</p>
    ${locked.length ? `<div class="sep" style="margin:12px 0"></div>
      <div class="eyebrow">Not yet — the maths comes first</div>
      <div class="row" style="gap:6px;margin-top:7px;flex-wrap:wrap">
        ${locked.map((a) => `<span class="pill">${ico(a.em, a.em, 14)} ${esc(a.name)} · ${a.needs}</span>`).join('')}
      </div>` : ''}
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
        <div class="big" style="font-size:30px">${money(val)}</div></div>
        <div style="text-align:right"><div class="eyebrow">Grow jar</div>
        <div class="big" style="font-size:20px">${money(c.money.jars.grow)}</div></div></div>
      <p class="small muted" style="margin-top:6px">${sp === 0 ? 'Nothing owned yet. Buy from the Grow jar — that is money you will not need soon.'
        : sp === 1 ? 'One thing. Your whole week now depends on somebody else’s Tuesday.'
        : 'Spread across ' + sp + '. Bad news in one can no longer sink the lot.'}</p>
    </div>
    ${worldCard(c)}
    ${CLASSES.filter((a) => ledger.mathsMet(c)(a.needs)).map((a) => {
      const series = c.market.series[a.id];
      if (!series) return '';
      const p = series[step], prev = series[Math.max(0, step - 1)];
      const mv = (p - prev) / prev;
      const u = c.market.holdings[a.id] || 0;
      return `<div class="card">
        <div class="row">${ico(a.em, a.em, 22)}
          <div class="grow"><b style="font-size:15px">${esc(a.name)}</b>
          <p class="small muted">${esc(a.one)}</p></div>
          <div style="text-align:right"><div style="font-weight:800;font-variant-numeric:tabular-nums">${money(p)}</div>
          <div class="small" style="color:${mv >= 0 ? 'var(--grow)' : 'var(--spend)'};font-weight:700">${mv >= 0 ? '▲' : '▼'} ${Math.abs(mv * 100).toFixed(1)}%</div></div></div>
        ${sparkline(series.slice(0, step + 1), 300, 40, mv >= 0 ? 'var(--grow)' : 'var(--spend)')}
        <p class="small muted" style="margin:2px 0 6px">${esc(a.why)}</p>
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
/* Years 6 and 7 (docs/08) — the shop, properly accounted.

   Four things on one screen, because they are four halves of one truth: the
   price you charge, the number you must sell, what you earned, and what you
   actually have. A child who can hold those together at once is most of the
   way to running something. */
function viewBusiness() {
  const c = K();
  if (!c.venture) {
    return `<div class="stack">
      ${say('nana', 'A stall of your own. You set the price, you carry the cost, and you find out the difference between a good week and a week that only looked good.')}
      <div class="card">
        <div class="eyebrow">Open your own</div>
        <h2 style="margin:3px 0 6px;font-size:22px">Start a stall</h2>
        <p class="small muted">You put in ${money(price(150))} to begin. It buys stock and covers the
          rent while you find your price. Nothing here is real money and none of it ever will be.</p>
        <button class="btn wide" style="margin-top:12px" data-act="openVenture">Open it</button>
      </div></div>`;
  }
  const v = c.venture, w = sim.ventureWorld(c);
  const be = biz.breakEven(v, w);
  const best = biz.bestPrice(v, w);
  const bs = biz.balanceSheet(v, w);
  const pl = biz.profitAndLoss(v, 12);
  const val = biz.valuation(v, w);
  const last = v.weeks[0];
  const cst = biz.costsAt(v, w);
  const row = (k, val2, tone, small) => `<div class="row" style="padding:5px 0${small ? '' : ';border-bottom:1px solid var(--line-soft)'}">
    <span class="grow ${small ? 'small muted' : ''}">${k}</span>
    <b style="font-variant-numeric:tabular-nums;${tone ? 'color:' + tone : ''}">${val2}</b></div>`;

  return `<div class="stack">
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">${esc(v.name)} · week ${v.traded}</div>
        <div class="big" style="font-size:28px">${money(val.yours)}</div>
        <p class="small muted">what your share is worth${v.outsideEquity > 0
          ? ' — you own ' + Math.round((1 - v.outsideEquity) * 100) + '%' : ''}</p></div>
        ${ico('shop','🏪',34)}</div>
    </div>

    <div class="card">
      <div class="eyebrow">The price you charge</div>
      <div class="row" style="gap:10px;margin-top:8px">
        <button class="btn ghost sm" data-act="vPrice" data-arg="-1">−</button>
        <div class="grow" style="text-align:center">
          <div class="big" style="font-size:26px">${money(v.price)}</div>
          <div class="small muted">costs you ${money(cst.unitCost)} to buy</div></div>
        <button class="btn ghost sm" data-act="vPrice" data-arg="1">+</button>
      </div>
      <div class="sep" style="margin:12px 0"></div>
      ${row('Margin on one', money(be.margin), be.margin > 0 ? 'var(--grow)' : 'var(--spend)')}
      ${row('Costs anyway, each week', money(be.fixed + be.interest))}
      ${row('So you must sell', be.units === Infinity ? 'you cannot' : be.units + ' a week', 'var(--action)')}
      <p class="small muted" style="margin-top:9px">At ${money(v.price)} the town wants
        <b>${biz.demandAt(v, w, v.price)}</b> a week. Charge less and more people come; charge more
        and each one is worth more. The best week is rarely at either end
        — right now it is around <b>${money(best.price)}</b>.</p>
    </div>

    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Stock on the shelf</div>
        <b style="font-size:17px">${v.stock} units</b>
        <div class="small muted">bought for ${money(v.stockCost)}</div></div>
        <button class="btn sm" data-act="vBuy" data-arg="25"
          ${v.cash < cst.unitCost * 25 ? 'disabled' : ''}>Buy 25 · ${money(cst.unitCost * 25)}</button></div>
      <button class="btn wide" style="margin-top:11px" data-act="vWeek"
        ${v.stock <= 0 ? 'disabled' : ''}>Open for the week →</button>
      ${v.stock <= 0 ? '<p class="small muted" style="margin-top:7px">Nothing to sell. The rent arrives anyway — that is what fixed costs means.</p>' : ''}
    </div>

    ${last ? `<div class="card">
      <div class="eyebrow">Last week</div>
      ${row('Sold', last.units + ' of ' + last.want + ' wanted')}
      ${row('Money earned (profit)', money(last.net), last.net >= 0 ? 'var(--grow)' : 'var(--spend)')}
      ${row('Money that moved (cash)', money(last.cashDelta), last.cashDelta >= 0 ? 'var(--grow)' : 'var(--spend)')}
      ${Math.abs(last.net - last.cashDelta) > 1 ? `<p class="small" style="margin-top:9px;background:var(--gold-tint);
        color:var(--treasure-deep);padding:10px 12px;border-radius:var(--r-md);font-weight:650">
        Those two numbers are not the same, and neither of them is wrong. You earned
        ${money(last.net)} and ${money(last.cashDelta)} actually moved — because stock is paid for
        when you buy it and customers pay weeks after they walk out. ${money(bs.receivables)} is
        still owed to you.</p>` : ''}
    </div>` : ''}

    <div class="card">
      <div class="eyebrow">Profit and loss · last ${pl.weeks} weeks</div>
      <div style="margin-top:8px">
        ${row('Sales', money(pl.revenue))}
        ${row('What they cost you', '−' + money(pl.cogs))}
        ${row('Gross profit', money(pl.gross), 'var(--grow)')}
        ${row('Rent and wages', '−' + money(pl.fixed))}
        ${row('Interest', '−' + money(pl.interest))}
        ${row('What you actually made', money(pl.net), pl.net >= 0 ? 'var(--grow)' : 'var(--spend)')}
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">What you have · and who it belongs to</div>
      <div style="margin-top:8px">
        ${row('In the till', money(bs.cash))}
        ${row('Stock on the shelf', money(bs.stock))}
        ${row('Owed to you', money(bs.receivables))}
        ${row('Everything you have', money(bs.assets), 'var(--action)')}
        <div style="height:8px"></div>
        ${row('Owed to the bank', money(bs.debt), bs.debt > 0 ? 'var(--spend)' : '')}
        ${row('Yours', money(bs.equity), 'var(--grow)')}
      </div>
      <p class="small muted" style="margin-top:9px">Everything you have, minus everything you owe,
        is yours. It always adds up — that is what a balance sheet is for.</p>
    </div>

    <div class="card">
      <div class="eyebrow">Money to grow with</div>
      <p class="small muted" style="margin:4px 0 10px">Two ways, and they cost different things.
        A loan costs interest until it is repaid. Selling a share costs a slice of every rupee
        you ever make, for good.</p>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <button class="btn ghost sm grow" data-act="vBorrow" data-arg="500">Borrow ${money(500)} at ${cst.loanRate.toFixed(1)}%</button>
        <button class="btn ghost sm grow" data-act="vRaise" data-arg="0.1"
          ${val.equityValue <= 0 || v.outsideEquity >= 0.6 ? 'disabled' : ''}>Sell 10% for ${money(val.equityValue * 0.1)}</button>
      </div>
      ${v.debt > 0 ? `<p class="small" style="margin-top:9px">You owe ${money(v.debt)}, costing
        ${money(v.debt * (cst.loanRate / 100) / 52)} a week.
        <button class="btn ghost sm" data-act="vRepay" style="margin-left:6px">Repay some</button></p>` : ''}
      ${v.outsideEquity > 0 ? `<p class="small muted" style="margin-top:7px">You sold
        ${Math.round(v.outsideEquity * 100)}%. Of ${money(val.annualProfit)} a year,
        ${money(val.annualProfit * v.outsideEquity)} is theirs now.</p>` : ''}
    </div>

    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Take some home</div>
        <p class="small muted">Into your own wallet. It leaves the business.</p></div>
        <button class="btn sm" data-act="vDraw" data-arg="200" ${v.cash < 200 ? 'disabled' : ''}>Draw ${money(200)}</button></div>
    </div>

    ${say('nana', 'The two numbers to keep your eye on are the one you must sell to stand still, and the gap between what you earned and what actually arrived. Everything else is detail.')}
  </div>`;
}

/* ══ STORE ════════════════════════════════════════════════════════════ */
export function viewStore() {
  const c = K();
  const nowT = Date.now();
  return `<div class="stack">
    ${say('mags', 'Some of this earns its keep and some of it is just lovely — and I have written which is which, plus what else the money could have been. My old boss called that commercial suicide.')}
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
        <div class="row">${ico(it.em, it.em, 28)}
          <div class="grow"><b style="font-size:15.5px">${esc(it.name)}</b>
            <p class="small muted">${esc(it.desc)}</p></div>
          <div style="text-align:right"><div class="big" style="font-size:19px">${money(p)}</div></div></div>
        ${it.gives ? `<div style="background:var(--grow-tint);color:var(--grow);border-radius:var(--r-md);padding:9px 12px;margin-top:10px;font-size:13px;font-weight:700">
          ⚙ ${esc(it.gives)}</div>` : ''}
        <div style="background:var(--treasure-tint);color:var(--treasure-deep);border-radius:var(--r-md);padding:9px 12px;margin-top:8px;font-size:13px;font-weight:650">
          That's <b>${weeks} week${weeks > 1 ? 's' : ''}</b> of your Spend jar — or <b>${money(grown)}</b> in ten years if it went in the Grow jar instead.${it.gives ? '' : ' And it does nothing at all, which is allowed.'}</div>
        <div class="row" style="margin-top:10px"><span class="grow"></span>
          ${owned ? '<span class="pill grow">yours</span>'
            : waiting ? `<span class="pill">think it over · ${hrs}h left</span>`
            /* The pause is always on offer. The grown-up's cool-off setting makes it
               COMPULSORY; with it off, waiting is still a thing a child can choose,
               and choosing it is the objective being used rather than recited. */
            : c.family.coolOff
              ? `<button class="btn ghost sm" data-act="cool" data-arg="${it.id}">Think it over →</button>`
              : `<button class="btn ghost sm" data-act="cool" data-arg="${it.id}" style="margin-right:8px">Think it over</button>
                 <button class="btn ghost sm" data-act="buyItem" data-arg="${it.id}" ${afford ? '' : 'disabled'}>${it.gives ? 'Buy it' : 'Buy it anyway'}</button>`}
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
      <div class="card"><div class="eyebrow">Streak</div><div class="big">${ico('streak', '🔥', 22)} ${c.streak.days.length}</div><p class="small muted">days in a row</p></div>
      <div class="card"><div class="eyebrow">Rank</div><div class="big" style="font-size:20px">${ico(rank.em, rank.em, 15)} ${rank.name}</div><p class="small muted">level ${c.learn.level} of 30</p></div>
      <div class="card"><div class="eyebrow">Letters</div><div class="big">${c.postbox.log.length}</div><p class="small muted">${scamsAll ? scams + ' of ' + scamsAll + ' scams spotted' : 'no scams yet'}</p></div>
    </div>
    <div class="card">
      <div class="eyebrow">Chapters</div>
      <div class="stack" style="gap:7px;margin-top:9px">
        ${CHAPTERS.map((ch) => {
          const done = ch.cards.filter((x) => c.learn.done[x.id]).length;
          return `<div class="row" style="font-size:13.5px"><span style="width:22px">${ico(ch.em, ch.em, 17)}</span>
            <span class="grow">${esc(ch.title)}</span>
            <div class="bar" style="width:88px"><i style="width:${done / ch.cards.length * 100}%;background:${done === ch.cards.length ? 'var(--grow)' : 'var(--action)'}"></i></div>
            <span class="muted tabnum" style="width:34px;text-align:right">${done}/${ch.cards.length}</span></div>`;
        }).join('')}
      </div>
    </div>
    <button class="card" data-act="nav" data-arg="parents" style="display:block;width:100%;text-align:left">
      <div class="row">${ico('family', '👪', 24)}<div class="grow">
        <p style="font-weight:800">The grown-up's page</p>
        <p class="small muted">What they learned, what they decided, Family Mode, and a printable week.</p></div>
        <span class="muted">→</span></div>
    </button>
  </div>`;
}

/* ══ PARENTS ══════════════════════════════════════════════════════════ */
/* The adult gate (docs/05 §C4). A four-digit PIN the grown-up sets the first
   time they come here.

   Be honest about what this is: a DETERRENT against an idle nine-year-old,
   not security. It is a number in localStorage on a device the child holds,
   and anyone who opens the console can read it. Real gating needs the server
   that CLAUDE.md already calls a launch blocker. What it does buy today is
   the thing that actually matters — the sim's own clock and ladder stop being
   one tap from any child's thumb, so the economy is no longer decorative. */
export function viewGate() {
  const s = R.s, set = !!(s.parent && s.parent.pin);
  const wrong = R.gateWrong;
  return `<div class="stack">
    <div class="card">
      <div class="eyebrow">For the grown-up</div>
      <h2 style="margin:2px 0 6px">${set ? 'Enter your PIN' : 'Set a PIN'}</h2>
      <p class="small muted">${set
        ? 'This page holds the settings and the tools that move the clock, so it asks first.'
        : 'Four digits, chosen by you. It keeps this page — and the tools that move the pay-day clock — out of reach of an idle thumb.'}</p>
      <input data-field="pin" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off"
        style="margin-top:13px;width:100%;padding:13px 15px;border-radius:10px;border:1.5px solid ${wrong ? 'var(--spend)' : 'var(--line)'};
        background:var(--surface2);font-family:var(--mono);font-size:22px;letter-spacing:.5em;text-align:center"
        value="" aria-label="Four digit PIN">
      ${wrong ? '<p class="small" style="color:var(--spend);font-weight:700;margin-top:8px">Not that one. Try again.</p>' : ''}
      <button class="btn wide" style="margin-top:12px" data-act="gateGo">${set ? 'Open' : 'Set it and open'}</button>
      <p class="small muted" style="margin-top:11px">This is a deterrent, not a lock — it lives on
        this device and a determined child could get past it. It is here so the pay-day clock is
        not one tap away.</p>
    </div>
    ${say('nana', 'There is nothing behind here a child needs. What they need is on the other side of that button — the town, the work, and the deciding.')}
  </div>`;
}

/* The weekly report (docs/05 Part C). Learning, never usage. */
export function viewReport() {
  const c = K();
  const r = report.weekly(c, { money });
  const row = (em, label, body) => `<div class="row" style="gap:11px;align-items:flex-start;
    background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:11px 13px">
    ${ico(em, em, 19)}<span class="grow" style="min-width:0">
    <b style="font-size:14px">${label}</b><div class="small muted">${body}</div></span></div>`;
  return `<div class="stack">
    <button class="btn ghost" style="align-self:flex-start" data-act="nav" data-arg="parents">← Grown-up's page</button>
    <div class="card">
      <div class="eyebrow">This week · ${shortDate(r.from)} – ${shortDate(r.to)}</div>
      <h2 style="margin:3px 0 8px;font-size:22px">${esc(r.child)}</h2>
      <p style="font-size:16px;line-height:1.5">${esc(r.headline)}</p>
    </div>

    <div class="card">
      <div class="eyebrow">What moved</div>
      ${r.moved.length
        ? `<div class="stack" style="gap:8px;margin-top:10px">${r.moved.map((m) => row(
            m.to === 'transferred' ? '🎯' : '✓', esc(m.name), esc(m.detail))).join('')}</div>`
        : '<p class="small muted" style="margin-top:7px">Nothing reached the point of being worth reporting this week. Meeting something is not learning it; this line only moves when it survives a gap.</p>'}
    </div>

    ${r.story ? `<div class="card" style="border-color:var(--gold);background:var(--gold-tint)">
      <div class="eyebrow">One decision</div>
      <p style="margin-top:7px;font-size:15.5px;line-height:1.5">${esc(r.story.text)}</p>
      ${r.story.reversed ? '<p class="small muted" style="margin-top:6px">She changed her mind within a minute or two — worth knowing, and not a bad sign. The pause is the skill.</p>' : ''}
    </div>` : ''}

    <div class="card">
      <div class="eyebrow">What she found hard</div>
      ${r.hard.length
        ? `<div class="stack" style="gap:8px;margin-top:10px">${r.hard.map((h) => row('•', esc(h.name), esc(h.why))).join('')}</div>`
        : '<p class="small muted" style="margin-top:7px">Nothing slipped this week.</p>'}
    </div>

    ${r.conversation ? `<div class="card" style="border-color:var(--action)">
      <div class="eyebrow">Ask at the table this week</div>
      <p style="margin-top:7px;font-size:16px;font-weight:700;line-height:1.45">${esc(r.conversation.ask)}</p>
      <div class="sep" style="margin:12px 0"></div>
      <div class="eyebrow">What she should be able to do</div>
      <p class="small" style="margin-top:5px">${esc(r.conversation.answer)}</p>
      ${r.conversation.why ? `<div class="eyebrow" style="margin-top:11px">Why that is the answer</div>
        <p class="small muted" style="margin-top:5px">${esc(r.conversation.why)}</p>` : ''}
    </div>` : ''}

    <div class="card">
      <div class="eyebrow">One thing to try in real life</div>
      <p style="margin-top:7px">${esc(r.real)}</p>
    </div>

    ${r.next ? `<div class="card">
      <div class="eyebrow">Coming next</div>
      <p style="margin-top:6px;font-weight:700">${esc(r.next.name)}</p>
      <p class="small muted" style="margin-top:3px">${esc(r.next.objective)}</p>
    </div>` : ''}

    <div class="card">
      <div class="eyebrow">The map so far</div>
      <div class="stack" style="gap:9px;margin-top:11px">
        ${r.strands.map((st) => `<div>
          <div class="row"><b class="grow" style="font-size:14px">${st.strand}</b>
            <span class="pill ${st.retained ? 'grow' : ''}">${st.retained}/${st.all} held</span></div>
          <div class="bar" style="height:9px;margin-top:5px;position:relative">
            <i style="width:${st.met / st.all * 100}%;background:var(--action);opacity:.28"></i>
            <i style="width:${st.retained / st.all * 100}%;position:absolute;left:0;top:0"></i>
          </div></div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:11px">The pale bar is what she has met. The solid bar
        is what she still had a week later. Only the second one is learning.</p>
    </div>

    <div class="card">
      <div class="eyebrow">What is not in here, on purpose</div>
      <p class="small muted" style="margin-top:6px">No streak, no leaderboard, no comparison with
        another child, no percentile, and nothing asking either of you to spend longer on this.
        Everything above is what happened in Bizzington — the app never asks about, infers or
        records anything about your family's real money.</p>
    </div>
  </div>`;
}

export function viewParents() {
  const c = K(), s = R.s;
  const w = weekSummary(c);
  return `<div class="stack">
    <div class="card">
      <div class="eyebrow">For the grown-up</div>
      <h2 style="margin:2px 0 4px">${esc(c.name)}'s week</h2>
      <p class="small muted">Observation, never a grade on the child. The simulator is a window into instincts no quiz gives you.</p>
      <div class="row" style="margin-top:13px;gap:8px">
        <button class="btn grow" data-act="nav" data-arg="report">📄 This week's report</button>
        <button class="btn ghost sm" data-act="lock">Lock</button>
      </div>
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
          ${ico(d.em, d.em, 15)}<p class="small grow">${d.t}</p></div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">Talk together</div>
      <div class="stack" style="gap:7px;margin-top:8px">
        ${w.prompts.map((p) => `<p class="small">💬 ${esc(p)}</p>`).join('')}
      </div>
      <button class="btn ghost wide" style="margin-top:12px" data-act="print">${ico('printer', '🖨', 16)} Printable weekly page</button>
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
      <div class="eyebrow">How this was made</div>
      <p class="small muted">The characters and the painted backdrops were drawn with an AI image
        model and then edited by hand. No AI writes to your child, scores them, or sees anything they
        do — every lesson, letter and number in this app was written by a person, and nothing your
        child types or taps leaves this device.</p>
      <p class="small muted">Every figure on screen is Bizzington's own arithmetic. There are no real
        interest rates, no real returns and no real companies anywhere in it.</p>
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
      <div class="eyebrow">Keepsakes</div>
      ${(c.keepsakes || []).length
        ? `<div class="stack" style="gap:10px;margin-top:10px">${c.keepsakes.map((k) => receiptSlip(k)).join('')}</div>`
        : `<p class="small muted" style="margin-top:4px">Your first receipt goes here — the thing you bought, the shifts that paid for it, the weeks it took. Nothing on this shelf is given. It is kept.</p>`}
    </div>
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Badges</div>
        <h2 style="margin:2px 0 0">${have} of ${Object.keys(BADGES).length}</h2></div></div>
      <div class="grid3" style="margin-top:12px">
        ${Object.keys(BADGES).map((k) => {
          const b = BADGES[k], has = c.badges.includes(k);
          return `<div style="background:${has ? 'var(--treasure-tint)' : 'var(--tint)'};border-radius:var(--r-md);padding:12px;text-align:center;opacity:${has ? 1 : .45}">
            <div>${ico(has ? b.em : 'lock', has ? b.em : '🔒', 24)}</div>
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
