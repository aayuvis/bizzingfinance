/* views.js — every screen. Pure string in, [data-act] out.
   Nothing here computes money; sim.js owns that and these render it. */

import { esc, sparkline, clamp, nWord } from './ui.js';
import { cardById as resolveCard } from './cards.js';
import { PLAN, priceFor as planPrice, contents as planContents } from './plan.js';
import { money, moneyExact, price, sign, CURRENCIES, shortDate, weekday } from './fmt.js';
import { say, face, ico, CAST, mark } from './art.js';
import { townSVG, PLACES } from './town.js';
import { townGrowth, GROW_LABEL } from './world.js';
import { BLD } from './buildings-gen.js';
import { ART } from './art-gen.js';
import { hero } from './hero.js';
import { viewAtlas, viewAct, viewRevise } from './atlas.js';
import * as daily from './daily.js';
import * as puz from './dailypuzzle.js';
import * as placement from './placement.js';
import * as answers from './answers.js';
import * as backup from './backup.js';
import { GAMES } from './arcade.js';
import { canSay } from './ui.js';
import { COVERS } from './covers-gen.js';
import { lessonBlock } from './lessonplayer.js';
import { companionCard, companionFigure } from './companionview.js';
import { overnightCard, receiptSlip } from './keepsakes.js';
import * as co from './companion.js';
import { chapterLocked, levelAtLeast, tester, CHAPTERS, ALL_CARDS, SHOP, ASSETS, BADGES, GLOSSARY, STOCK, WEATHER, HOMES,
  WORLDS, QUESTS, FIXES, rankFor, rankObj, RANKS, shuffledDrill, drillCount, hintFor,
  chapterDone, isOpen as chapterOpen, needFor, worldOpen } from './content.js';
import * as sim from './sim.js';
import * as ledger from './ledger.js';
import { STRANDS } from './objectives.js';
import * as mastery from './mastery.js';
import * as report from './report.js';
import { OBJECTIVES, objective, teachCard } from './objectives.js';
import { JOB_GAME } from './jobgames.js';
import { CLASSES } from './assetclasses.js';
import { CAL } from './world.js';
import * as biz from './business.js';
import { R } from './runtime.js';
import { nextStep, progress } from './next.js';
import * as RC from './reportcard.js';
import * as family from './family.js';
import * as TRY from './tryit.js';
import { Store } from './store.js';
import { pinSet } from './pin.js';
import { plateFor } from './looks.js';
import { home as bzHome } from './family/bizzing-shell.js';
const dayIndexOf = (t) => Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 864e5);
import { pipPose, kidBadge, coinSvg } from './shell.js';
import * as ITEMS from './items.js';
import * as CERT from './cert.js';
import { AVATARS, AVATAR_IDS, DEFAULT_AVATAR, guessCurrency } from './avatars.js';
import * as drill from './drill.js';

const K = () => sim.kid(R.s);

/* ══ ONBOARDING ═══════════════════════════════════════════════════════ */
export function viewOnboard(draft) {
  const step = draft.step || 0;
  const shell = (body) => `<div class="stack" style="max-width:520px;margin:5vh auto 0">${body}</div>`;
  const first = R.s ? R.s.kids.length === 0 : true;
  if (step === 0 && first && !draft.go) return landing();
  if (step === 0) {
    return shell(`
      <div style="text-align:center">
        <div style="margin:0 auto 6px;width:112px">${pipPose('wave', 112, 'Pip waves hello')}</div>
        ${first ? '<div class="eyebrow">Bizzing Finance</div>' : ''}
        <h1 style="font-size:32px">${first ? 'Welcome to <em style="font-style:italic">Bizzington</em>' : 'A new stall on Market Row'}</h1>
        <p class="muted" style="margin-top:8px">${first
          ? "Get a stall, a wallet and four jars — and learn money by running them."
          : 'Another child, their own town, their own money. Nothing is shared between them.'}</p>
      </div>
      ${say('pip', first
        ? 'Hello! I am Pip. The smallest stall on Market Row is going spare, and it\'s yours. What shall I call you?'
        : 'Another one! There is always a stall going. What is this one called?')}
      <div class="card stack">
        <label class="eyebrow" for="nm">First name</label>
        <input id="nm" data-field="name" value="${esc((R.fields && R.fields.name) || draft.name || '')}" placeholder="Type a first name" autocomplete="off"
          style="padding:13px 14px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-size:16px;font-weight:700;width:100%">
        <div class="eyebrow" id="av-h" style="margin-top:4px">Pick a face</div>
        <div class="avpick" role="radiogroup" aria-labelledby="av-h">
          ${AVATAR_IDS.map((id) => `<button class="avopt" role="radio" aria-checked="${(draft.avatar || DEFAULT_AVATAR) === id}" aria-label="${esc(AVATARS[id].name)}" data-act="obAvatar" data-arg="${id}"><img src="${AVATARS[id].src}" alt="" width="56" height="56"></button>`).join('')}
        </div>
        <p class="small muted">A first name and a face. Never a surname, birthday, photo or email.</p>
        <button class="btn wide" data-act="obNext">Next →</button>
        ${first ? '' : '<button class="small muted" style="text-align:center;width:100%" data-act="obCancel">Cancel</button>'}
      </div>`);
  }
  if (step === 1) {
    return shell(`
      ${say('pip', `Good to meet you, <b>${esc(draft.name)}</b>. How old are you? It changes what the street shows — no debt and no market before they are taught.`)}
      <p class="small muted" style="text-align:center">Tap one and you're in. Money is counted in ${esc(CURRENCIES[guessCurrency()].name.toLowerCase())} — a grown-up can change that in settings.</p>
      <div class="card stack">
        <button class="opt" data-act="obBand" data-arg="sprout"><b>8 to 10</b><br><span class="small muted">Sprout — coins, earning, saving. Nothing can go negative.</span></button>
        <button class="opt" data-act="obBand" data-arg="builder"><b>11 and up</b><br><span class="small muted">Builder — budgets, the bank, the Exchange, a shop of your own.</span></button>
      </div>`);
  }
  return '';
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
    <span class="iw">${ico(icon, icon, 20)}</span>
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

  const household = jcard({ accent: 'var(--save)', sprite: 'home-' + Math.min(4, (c.home && c.home.tier) || 0), act: 'sub', arg: 'place',
    eyebrow: 'The Household', question: 'Can you pay for your life?',
    big: money(left), bigStyle: left >= 0 ? '' : 'color:var(--spend)', sub: 'left over / week', rows: hhBeats,
    foot: `<button class="jfoot" data-act="sub" data-arg="place">
      <span class="bar grow" style="height:6px"><i style="width:${Math.min(100, ind * 100)}%;background:${ind >= 1 ? 'var(--grow)' : 'var(--action)'}"></i></span>
      <span class="small muted tabnum">${Math.round(ind * 100)}% of your life pays for itself</span>
    </button>` });

  /* Livelihood — producer. Today's shifts, and the shop once it is yours. */
  const jobs = sim.jobsToday(c);
  const jleft = jobs.filter((j) => !j.done).length;
  const bizOpen = chapterOpen(c, 'business') && c.biz;
  const KIND = { stack: 'stacking', trim: 'balancing', sweep: 'clearing', runner: 'running' };
  const lvBeats = [
    ...jobs.slice(0, 3).map((j) => {
      const gm = JOB_GAME[j.id];
      return j.done
        ? beat('sub', 'wallet', j.em, esc(j.name), 'Done — back tomorrow.', '<span class="pill grow">done</span>')
        : beat('job', j.id, j.em, esc(j.name),
            `${gm ? esc(KIND[gm.kind]) + ' · ' : ''}for ${esc(j.who)}${sim.jobBest(c, j.id) ? ' · best ' + money(sim.jobBest(c, j.id)) : ''}`,
            '<span class="pill">Work</span>', true);
    }),
    bizOpen ? beat('sub', 'business', 'shop', "Your shop", 'Stock, prices, and what the till took.',
      `<span class="small muted tabnum">${money(sim.bizValue(c))}</span>`, true) : '',
  ].join('');

  const livelihood = jcard({ accent: 'var(--treasure)', sprite: bizOpen ? 'shop' : 'stall', act: 'sub', arg: bizOpen ? 'business' : 'wallet',
    eyebrow: 'The Livelihood', question: 'What is your time worth?',
    big: `${jobs.length - jleft}/${jobs.length}`, sub: 'shifts today',
    rows: lvBeats || `<p class="small muted" style="padding:12px 16px">No work posted in ${esc(WORLDS[c.world || 0].name)} today.</p>` });

  /* Portfolio — allocator. Drawn locked rather than hidden, like the street. */
  const bankOpen = chapterOpen(c, 'bank'), exOpen = chapterOpen(c, 'portfolio');
  let portfolio;
  if (!bankOpen && !exOpen) {
    portfolio = jcard({ accent: 'var(--grow)', sprite: 'bank', locked: true, act: 'nav', arg: 'learn',
      eyebrow: 'The Portfolio', question: 'Where does spare money go?',
      big: ico('lock', '🔒', 26), sub: 'not yet open',
      rows: beat('nav', 'learn', 'lesson', 'Opens with ' + esc(needFor('bank') || 'the Banking chapter'),
        'Learn what a bank does, and it opens.') });
  } else {
    const invested = c.money.bank.balance + sim.holdingsValue(c);
    const up = c.market.lastMove >= 0;
    const pfBeats = [
      bankOpen ? beat('sub', 'bank', 'bank', 'The Bank', `${money(c.money.bank.balance)} on deposit, earning while you sleep.`) : '',
      exOpen ? beat('sub', 'portfolio', 'chartUp', 'The Exchange', `See what moved. Most days, do nothing.`,
        `<span class="pill ${up ? 'grow' : 'spendp'}">${up ? '▲' : '▼'}</span>`, true) : '',
      levelAtLeast(c, 16) ? beat('nav', 'market40', 'company', 'The Market Game', 'Forty companies, forty years, one decade at a time.') : '',
    ].join('');
    portfolio = jcard({ accent: 'var(--grow)', sprite: exOpen ? 'exchange' : 'bank', act: 'sub', arg: exOpen ? 'portfolio' : 'bank',
      eyebrow: 'The Portfolio', question: 'Where does spare money go?',
      big: money(invested), sub: 'invested', rows: pfBeats });
  }

  return `<div class="sect"><b>Your three journeys</b><i></i></div>
    ${household}${livelihood}${portfolio}`;
}

/* A journey card is a DOOR — the building itself, painted, on the journey's
   own tint — with the day's beats as plain rows beneath it. One box per
   journey; nothing boxed inside it. The rows separate with hairlines, and
   the one hot beat is the only row that carries a fill. */
function jcard(o) {
  const b = BLD[o.sprite];
  return `<div class="card pad0 jny" style="--ja:${o.accent}">
    <button class="door${o.locked ? ' locked' : ''}" data-act="${o.act}" data-arg="${o.arg}">
      ${b ? `<img src="${b.src}" alt="" width="${b.w}" height="${b.h}">` : ''}
      <span class="db">
        <span class="eyebrow">${o.eyebrow}</span>
        <b class="dq">${o.question}</b>
        <span class="dn"><span class="big"${o.bigStyle ? ` style="${o.bigStyle}"` : ''}>${o.big}</span><span class="small muted">${o.sub}</span></span>
      </span>
    </button>
    <div class="jrows">${o.rows}</div>
    ${o.foot || ''}
  </div>`;
}

/* ── the greeting: a face, a line, and what is waiting ─────────────────
   The companion if there is one (docs/10), Pip if not. The overnight lines
   (keepsakes.js) become chips here instead of a card of their own, and the
   companion's care and controls fold in beneath — one panel where there were
   three. */
function greeting(c) {
  const o = c.overnight, fresh = !!(o && !o.seen);
  const has = co.has(c), p = co.get(c);
  const h = new Date().getHours();
  const hello = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const line = has ? esc(co.line(c)) : hometalk(c);
  const chips = [];
  if (fresh) {
    if (o.fuse) chips.push(['postbox', '', 'A letter you were expecting', true]);
    else if (!c.postbox.answered) chips.push(['postbox', '', 'A letter came']);
    if (sim.payDue(c, R.s)) chips.push(['payday', '', 'Ring the bell', true]);
    if (has && co.canPlay(c)) chips.push(['play', '', `${esc(p.name)} waited by the door`]);
    const jobs = sim.jobsToday(c).length;
    if (jobs) chips.push(['sub', 'wallet', `${nWord(jobs)} ${jobs === 1 ? 'shift' : 'shifts'} on the board`]);
  }
  const can = has && co.canPlay(c);
  return `<div class="card greet">
    <div class="gfig">${has ? companionFigure(c, 112, { bob: p.mood === 'happy' }) : pipPose('wave', 108, 'Pip waves hello')}</div>
    <div class="gbody">
      ${fresh ? `<span class="eyebrow">${o.nights === 1 ? 'Overnight' : `${nWord(o.nights)} nights away`}</span>` : `<span class="eyebrow">${hello}</span>`}
      <h2 class="gname">${kidBadge(c, 34)}<span>${fresh ? 'Welcome back, ' : ''}${esc(c.name)}</span></h2>
      <div class="bub">${line}</div>
      ${chips.length ? `<div class="waiting">${chips.map(([act, arg, t, hot]) => `<button class="wchip${hot ? ' hot' : ''}" data-act="${act}" ${arg ? `data-arg="${arg}"` : ''}>${t}</button>`).join('')}
        <button class="wchip quiet" data-act="ovSeen" aria-label="Got it">Got it</button></div>` : ''}
      ${has ? `<div class="gco">
          <span class="small muted">${esc(p.name)} · ${co.STAGES[p.stage]} ${esc(co.KINDS[p.kind].name).toLowerCase()} · ${p.paydays} pay ${p.paydays === 1 ? 'day' : 'days'} with you${p.everMissed ? ` · went hungry ${p.everMissed}×` : ''}</span>
          <div class="care ${p.mood}"><i style="width:${p.care}%"></i></div>
          <div class="row" style="gap:6px;margin-top:9px;flex-wrap:wrap">
            <button class="btn ghost sm" data-act="play">${can ? 'Play' : 'Played today'}</button>
            <button class="btn ghost sm" data-act="wardrobe">Wardrobe${p.wardrobe.length ? ' · ' + p.wardrobe.length : ''}</button>
          </div></div>`
        : ''}
    </div>
    ${dayStrip(c)}
  </div>`;
}

/* Beside the greeting: the day's ring (today's three, never a run of days)
   and the money word of the day. Both are small; neither is a button. */
function dayStrip(c) {
  const q = sim.questList(c), n = q.length || 1, d = q.filter((x) => x.claimed).length;
  const R0 = 19, C = 2 * Math.PI * R0, w = daily.wordOfDay();
  return `<div class="daystrip">
    <div class="dring" role="img" aria-label="Today's three: ${d} of ${q.length} done">
      <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><circle cx="24" cy="24" r="${R0}" fill="none" stroke="var(--line)" stroke-width="5"/>
        <circle cx="24" cy="24" r="${R0}" fill="none" stroke="var(--action)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(C * d / n).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 24 24)"/></svg>
      <b>${d}/${q.length}</b></div>
    <div class="dword"><span class="eyebrow">Word of the day</span><b>${esc(w.term)}</b><span class="small muted">${esc(w.meaning)}</span></div>
  </div>`;
}

/* Home used to be a 4,000-pixel column of cards, so nothing on it read as the
   thing to do next. The daily extras fold away now; which ones a child left
   open survives the re-render (string rendering replaces the DOM each time). */
const FOLDS = new Set();
if (typeof document !== 'undefined') document.addEventListener('toggle', (e) => {
  const d = e.target;
  if (d && d.matches && d.matches('details.fold')) { if (d.open) FOLDS.add(d.dataset.fold); else FOLDS.delete(d.dataset.fold); }
}, true);
function fold(id, title, sub, icon, body) {
  return `<details class="fold" data-fold="${id}"${FOLDS.has(id) ? ' open' : ''}>
    <summary><span class="iw">${ico(icon, '', 20)}</span><span class="grow" style="min-width:0">${esc(title)}<div class="fsub">${sub}</div></span></summary>
    ${body}</details>`;
}

/* ══ HOME — Bee's three rows (FAMILY-STANDARD §6, integration/bizzing-shell.js) ══
   Row 1: Pip's greeting · today's ring (with "Your level") · the money word of the hour.
   Row 2: next on your journey (the ONE filled Continue) · your street.
   Row 3: a tip from a card already read · a line from the town's cast. The street,
   today's three and the rest of the day live on the Town tab. */
const CAST_LINES = [
  ['Nana Bizz', 'Split it the moment it lands. What sits in one pile gets spent as one pile.'],
  ['Pip', 'Wages from in here land in the same wallet as everything else. There is no second, magic money.'],
  ['Mags', 'Some of this earns its keep and some of it is just lovely — and I have written which is which.'],
  ['Bea', 'Down on the week. Sell? No. I only say that so you notice the feeling.'],
  ['Bo', 'Up on the week! I said it would be. I say that every week.'],
];
export function viewHome() {
  const c = K();
  const n = nextStep(c), pr = progress(c), rank = rankObj(c.learn.level);
  /* the ring counts what was MET, not what was claimed elsewhere: a met quest is
     done on Home and can be taken from Home (it once sat at 0/1 until the Town tab) */
  const quests = sim.questList(c), qd = quests.filter((q) => q.done).length;
  const h = new Date().getHours();
  const hello = h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,';
  const line = String(hometalk(c)).replace(/<[^>]+>/g, '');
  const w = daily.wordOfDay(), tip = daily.tipOfDay(c);
  const R0 = 44, C0 = 2 * Math.PI * R0, frac = quests.length ? qd / quests.length : 0;
  const ring = `<div class="fring"><svg width="110" height="110" viewBox="0 0 110 110" role="img" aria-label="Today's three: ${qd} of ${quests.length} done">
      <circle cx="55" cy="55" r="${R0}" fill="none" stroke="var(--bz-line)" stroke-width="14"/>
      <circle cx="55" cy="55" r="${R0}" fill="none" stroke="var(--bz-accent)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${(C0 * frac).toFixed(1)} ${C0.toFixed(1)}" transform="rotate(-90 55 55)"/>
      <text x="55" y="61" text-anchor="middle" font-family="Sono, monospace" font-weight="700" font-size="20" fill="currentColor">${qd}/${quests.length}</text></svg>
    <div><b class="fring-h">Today's three</b>${quests.map((q, i) => `<p class="fring-q${q.done ? ' done' : ''}"><i style="--d:${['#E0457B', '#16956B', '#3D7DF0', '#E8962C'][i % 4]}"></i><span>${esc(q.t)}</span>${q.done && !q.claimed ? `<button class="fring-take" data-act="claim" data-arg="${q.id}">Take ${money(price(q.pay))}</button>` : `<b>${q.done ? '1/1' : '0/1'}</b>`}</p>`).join('')}</div></div>`;
  const world = n.world || WORLDS[0], here = WORLDS[c.world || 0];
  const jobs = sim.jobsToday(c), jdone = jobs.filter((j) => j.done).length;
  const cast = CAST_LINES[new Date().getHours() % CAST_LINES.length];
  const body = bzHome({
    greet: { mascot: './mascot/pip-wave.webp', hello, name: c.name, line },
    ring: { html: ring, foot: { kicker: 'Your level', title: `${rank.name} · level ${c.learn.level}`, href: '#/me/rank' } },
    hour: { kicker: 'Money word of the hour', title: w.term, sub: w.meaning, href: '#/words/' + encodeURIComponent(w.term), icon: 'book' },
    next: { plate: plateFor(world.id, R.dark), chip: `Stop ${Math.min(pr.done + 1, pr.total)} of ${pr.total}`, kicker: n.kind === 'revise' ? 'Keep it yours' : 'Next on your journey',
      title: n.title, sub: n.sub, href: '#/continue', cta: n.button || 'Continue', progress: { pct: Math.round(pr.worldDone / Math.max(1, pr.worldTotal) * 100), label: `${pr.world.name} · ${pr.worldDone} of ${pr.worldTotal} stops` } },
    /* two cards, two pictures: when the journey and the street are the same place,
       the street card shows it at the other end of the day */
    second: { plate: plateFor(here.id, here.id === world.id ? !R.dark : R.dark), chip: `${jdone} of ${jobs.length} shifts`, kicker: 'Your street', title: here.name, sub: 'Jobs, the postbox, the jars and today’s three', href: '#/town', cta: 'Open', ctaIcon: 'town',
      progress: { pct: Math.round(frac * 100) } },
    /* every tile goes to its own thing (owner, 3 Oct): the word, the card, the person quoted */
    tip: tip ? { kicker: 'Tip from a card you read', text: tip.text, href: '#/atlas/' + tip.card.id } : { kicker: 'Tip', text: 'Split money the moment it lands — a pile gets spent as a pile.', href: '#/atlas/c3b' },
    quote: { kicker: 'Overheard in Bizzington', text: cast[1], who: cast[0], href: '#/cast/' + ({ 'Nana Bizz': 'nana', Pip: 'pip', Mags: 'mags', Bea: 'bea', Bo: 'bo' }[cast[0]] || 'pip') },
    foot: '<a href="#/privacy">Privacy</a> · Bizzing Finance — no real money, ever',
  });
  return `<h1 class="sr">Home — ${esc(c.name)}</h1>${body}`;
}

/* What used to fill Home — the street's day — lives on the Town tab now. */
export function townDay() {
  const c = K(), quests = sim.questList(c);
  return `${greeting(c)}
    ${todaysThree(c, quests)}
    ${fold('more', 'More today', 'The till puzzle, a real-world deed and the end of the day.', 'more', `<div class="stack">
      ${closingTime(c, quests)}
      ${tillCard(c)}
      ${todayCard(c)}
    </div>`)}`;
}

/* Town (FAMILY-STANDARD §4): the money map — the street where you stand, the five
   places to travel between, the three journeys and the repairs. */
export function townParts() {
  const c = K();
  const world = WORLDS[c.world || 0];
  const fx = sim.townFixes(c).filter((f) => !f.locked);
  const tp = sim.townProgress(c);
  const repairs = !fx.length ? '' : `<div class="sect" data-focus="repairs"><b>Put the town right · ${tp.done}/${tp.all} mended</b><i></i></div><div class="card">
        <div class="row"><div class="grow"><div class="eyebrow">Put it right · ${esc(world.name)}</div>
          <p class="small muted">Money spent on something useful keeps paying you back.</p></div>
          <span class="pill ${tp.done === tp.all ? 'grow' : ''}">${tp.done}/${tp.all} mended</span></div>
        <div class="rows" style="margin-top:6px">
          ${fx.map((f) => `<div class="qrow block${f.done ? ' done' : ''}" data-focus="fix:${f.id}">
            <div class="row" style="gap:10px">
              <span class="iw" style="${f.done ? '' : 'filter:grayscale(.7) opacity(.75)'}">${ico(f.em, f.em, 20)}</span>
              <span class="grow" style="min-width:0">
                <b style="font-size:14px">${esc(f.name)}</b>
                <div class="small muted">${esc(f.done ? f.fixed : f.broken)}</div></span>
              ${f.done ? '<span class="pill grow">mended</span>'
                : `<span class="small muted tabnum">${money(f.put)} / ${money(f.cost)}</span>`}
            </div>
            ${f.done ? `<p class="small" style="color:var(--grow);font-weight:700;margin-top:6px">${ico('check', '', 14)} ${esc(f.gives)}</p>`
              : `<div class="bar" style="height:6px;margin-top:7px"><i style="width:${f.pct * 100}%;background:var(--treasure)"></i></div>
                 <div class="row" style="margin-top:8px;gap:8px;flex-wrap:wrap">
                   <span class="small muted grow">${esc(f.gives)}</span>
                   <button class="btn ghost sm" data-act="putRight" data-arg="${f.id}" ${c.money.wallet <= 0 ? 'disabled' : ''}>
                     Put in ${money(Math.min(price(10), Math.max(0, c.money.wallet), f.left))}</button>
                 </div>`}
          </div>`).join('')}
        </div></div>`;
  const posters = viewWorlds().replace(/^<div class="stack">\s*<header class="shero[\s\S]*?<\/header>/, '<div class="stack">');
  return {
    street: `<div class="town hero${R.dark ? ' night' : ''}"><div class="town-scroll">${townSVG(c)}</div>
      <div class="town-head"><span class="town-chip"><span class="eyebrow" style="color:inherit">You are in</span><b>${esc(world.name)}</b></span></div></div>`,
    worlds: posters, journeys: journeys(c), repairs, today: townDay(),
  };
}

/* ONE Continue (FAMILY-STANDARD §2.3, B2). The step comes from next.js, the
   same function Learn asks, and this is the only filled button on Home —
   test/home.mjs counts them. Progress sits beside it (B3): where you are on
   the path and in this world, and the rank. */
function continueCard(c) {
  const n = nextStep(c), pr = progress(c);
  const plate = plateFor((n.world || WORLDS[0]).id, R.dark);
  const rank = rankObj(c.learn.level);
  const pct = Math.round(pr.done / pr.total * 100);
  return `<section class="continue${R.dark ? ' night' : ''}" style="--plate:url(${plate})" aria-labelledby="cont-h">
    <span class="cveil"></span>
    <div class="cbody">
      <span class="eyebrow">${n.kind === 'revise' ? 'Keep it yours' : 'Next on your journey'} · ${esc((n.world || WORLDS[0]).name)}</span>
      <h2 id="cont-h">${esc(n.title)}</h2>
      <p class="csub">${esc(n.sub)}</p>
      <div class="cprog" aria-label="Stop ${Math.min(pr.done + 1, pr.total)} of ${pr.total}, and ${pr.worldDone} of ${pr.worldTotal} in ${esc(pr.world.name)}">
        <div class="bar"><i style="width:${pct}%"></i></div>
        <span>Stop ${Math.min(pr.done + 1, pr.total)} of ${pr.total} · ${esc(pr.world.name)} ${pr.worldDone}/${pr.worldTotal} · ${esc(rank.name)} L${c.learn.level}</span>
      </div>
      <button class="btn wide cgo" data-act="${n.act}" ${n.arg ? `data-arg="${n.arg}"` : ''}>${esc(n.button)} →</button>
    </div>
  </section>`;
}

/* Today's three, as small cards. Nothing is lost for skipping one, and
   nothing here is a filled button — Continue is the only one. */
function todaysThree(c, quests) {
  const allDone = quests.length && quests.every((q) => q.claimed);
  return `<section aria-labelledby="t3-h">
    <div class="sect"><b id="t3-h">Today's three</b><i></i><span class="small muted tabnum">${quests.filter((q) => q.claimed).length}/${quests.length}</span></div>
    <div class="t3">
      ${quests.map((q) => `<div class="t3card${q.claimed ? ' done' : ''}">
        <span class="iw">${ico(q.claimed ? 'check' : 'quest', q.em, 20)}</span>
        <b>${esc(q.t)}</b>
        <span class="small muted">${q.claimed ? 'Done.' : esc(q.sub)}</span>
        ${q.claimed ? '' : q.done ? `<button class="btn ghost sm" data-act="claim" data-arg="${q.id}">Take ${money(price(q.pay))}</button>`
          : `<div class="bar" style="height:5px;margin-top:auto"><i style="width:${Math.min(100, q.at / q.n * 100)}%"></i></div>`}
      </div>`).join('')}
    </div>
    ${allDone ? '' : `<button class="btn ghost wide" style="margin-top:10px" data-act="sessionStart">${ico('run', '▶', 16)} Do today's three in one go — about seven minutes</button>`}
    ${allDone && !c.quests.bonus ? `<button class="btn ghost wide" style="margin-top:10px" data-act="questBonus">All ${nWord(quests.length)} — take ${money(price(12))} more</button>` : ''}
  </section>`;
}

/* Ways in: at most six tiles to the app's main areas. */
function waysIn(c) {
  const tiles = [
    ['learn', 'nav', 'learn', 'The Money Atlas', `${progress(c).done} of ${progress(c).total} stops`],
    ['wallet', 'nav', 'money', 'Money', `${money(c.money.wallet)} in your wallet`],
    ['arcade', 'nav', 'arcade', 'Arcade', 'Games that pay wages'],
    ['cart', 'nav', 'store', 'Store', 'Things that earn their keep'],
    ['medal', 'nav', 'collection', 'Collection', `${c.badges.length} badges`],
    ['town', 'nav', 'worlds', 'Five places', 'Travel the town'],
  ];
  return `<nav class="ways" aria-label="Ways in">${tiles.map(([ic, act, arg, t, sub]) =>
    `<button class="way" data-act="${act}" data-arg="${arg}"><span class="iw">${ico(ic, '', 22)}</span><b>${t}</b><span class="small muted">${sub}</span></button>`).join('')}</nav>`;
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
    <div class="rows" style="margin-top:4px">
      ${rows.slice(0, 3).map((r) => `<div class="qrow">
        <span class="iw">${ico(r.em, r.em, 20)}</span>
        <span class="grow" style="min-width:0"><b style="font-size:14px">${esc(r.t)}</b>
          <div class="small muted">${r.sub}</div></span></div>`).join('')}
    </div>
    ${say('pip', 'Knowing when to stop is a money skill too. The town will be here tomorrow.')}
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
    <div class="rows" style="margin-top:6px">
      ${jobs.map((j) => {
        const g = JOB_GAME[j.id];
        const best = sim.jobBest(c, j.id);
        return `<div class="qrow${j.done ? ' done' : ''}">
          <span class="iw" style="${j.done ? 'opacity:.5' : ''}">${ico(j.em, j.em, 20)}</span>
          <span class="grow" style="min-width:0">
            <b style="font-size:14px;${j.done ? 'opacity:.6' : ''}">${esc(j.name)}</b>
            <div class="small muted">${j.done ? 'Back tomorrow.'
              : `${g ? esc(KIND[g.kind]) + ' · ' : ''}for ${esc(j.who)}${best ? ' · best ' + best : ''}`}</div>
          </span>
          ${j.done ? '<span class="pill grow">done</span>'
            : `<button class="btn ghost sm" data-act="job" data-arg="${j.id}">${g ? 'Work' : money(j.amt)}</button>`}
        </div>`;
      }).join('')}
    </div>
    <p class="small muted" style="margin-top:10px">A poor shift still pays — you did the work.
      A good one pays roughly double. It never pays more than that.</p>
  </div>`;
}

function hometalk(c) {
  /* B5/B10: say what happened last time, and what is next — specific, never generic */
  const L = c.lastDone, n = nextStep(c);
  if (L && L.title) {
    const when = dayIndexOf(L.t) === dayIndexOf(Date.now()) ? 'Earlier today' : 'Last time';
    return `${when} you finished <b>${esc(L.title)}</b>${L.right ? ', every question right first go' : ''}. ${n && n.title && n.title !== L.title ? `Next up: <b>${esc(n.title)}</b>.` : ''}`;
  }
  const lv = c.learn.level;
  if (lv < 6) return "Your stall's open! Do a job, learn a card — there are four jars waiting in the shed out back.";
  if (lv < 8) return 'The shed is yours. Split your money the moment it lands.';
  if (lv < 11) return 'The Build Yard is open. Name something you want and watch it go up. Raid it, and it comes down.';
  if (lv < 16) return "The bank is open. A little interest lands every pay day. Boring is the point.";
  if (lv < 23) return 'The Exchange is open. Buy from the Grow jar, never the Spend jar.';
  return "Nana's shop is yours now. Buy for less than you sell for.";
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
  const PLATE = { market: 'world-market', harbour: 'world-harbour', clock: 'world-clock', exchange: 'world-exchange', works: 'world-works' };
  const title = (id) => { const ch = CHAPTERS.find((x) => x.id === id); return ch ? ch.title : id; };
  return `<div class="stack">
    ${hero({ eyebrow: 'Travel', title: 'Five places', who: 'pip',
      line: 'Five places, walked in order. You move on by learning, not by earning.' })}
    ${WORLDS.map((w, i) => {
      const open = worldOpen(c, i);
      const here = (c.world || 0) === i;
      const left = w.chapters.filter((ch) => !chapterDone(c, ch));
      const done = w.chapters.length - left.length;
      const plate = ART[PLATE[w.id] || ('world-' + w.id)];
      const note = !open && i > 0
        ? `Finish ${WORLDS[i - 1].chapters.filter((ch) => !chapterDone(c, ch)).map((ch) => '“' + esc(title(ch)) + '”').join(' and ') || 'the last stretch'} in ${esc(WORLDS[i - 1].name)} to walk on.`
        : here && left.length ? `Still to learn here: ${left.map((ch) => '<b>' + esc(title(ch)) + '</b>').join(', ')}.`
        : here && !left.length && i < WORLDS.length - 1 ? 'Everything here is learned. The road is open.' : '';
      return `<button data-focus="world:${w.id}" class="poster${here ? ' here' : ''}${open ? '' : ' locked'}" data-act="${open && !here ? 'travel' : 'noop'}" data-arg="${i}"
        style="--ja:${w.tint};${plate ? `--plate:url(${plate})` : ''}">
        <span class="pv"></span>
        <span class="pb">
          <span class="eyebrow">${esc(w.rank)}${here ? ' · you are here' : open ? '' : ' · not yet'}</span>
          <b>${esc(w.name)}</b>
          <span class="small">${esc(w.blurb)}</span>
          ${w.opens ? `<span class="small" style="opacity:.85">${esc(w.opens)}</span>` : ''}
          ${note ? `<span class="small" style="opacity:.9">${note}</span>` : ''}
          <span class="row" style="gap:8px;margin-top:8px">
            <span class="bar grow"><i style="width:${done / w.chapters.length * 100}%"></i></span>
            <span class="small tabnum">${done}/${w.chapters.length} chapters</span>
            ${here ? '<span class="pill gold">here</span>' : open ? '<span class="pill">Go →</span>' : `<span class="pill">${ico('lock', '🔒', 12)}</span>`}
          </span>
        </span>
      </button>`;
    }).join('')}
  </div>`;
}

/* ══ LEARN ════════════════════════════════════════════════════════════ */
export function viewLearn() {
  const c = K();
  if (c.learn.openCard) {
    const card = resolveCard(c.learn.openCard, c);
    if (card) return viewCard(card);
  }
  if (R.shelf === 'words') return viewGlossary();
  /* Learn is the Money Atlas (atlas.js): one map, five regions, a rail of stops */
  if (R.shelf === 'revise') return viewRevise(c);
  if (R.shelf && R.shelf.startsWith('act:')) return viewAct(c, +R.shelf.slice(4) || 0);
  return viewAtlas(c);
}
function viewLearnOld() {
  const c = K();
  const bar = sim.xpBar(c);
  const rank = rankObj(c.learn.level);

  return `<div class="stack">
    ${hero({ eyebrow: `${ico(rank.em, rank.em, 14)} ${rank.name} · level ${c.learn.level} of 30`, title: 'Atlas',
      big: `${c.learn.xp} XP`, sub: `${bar.need} XP to level ${c.learn.level + 1}`, figure: face('nana', 118),
      who: 'pip', line: 'Every card ends with one question. Get it right and the town grows. Get it wrong and I tell you why — that counts too.' })}
    <div class="ladder">
      <div class="bar"><i style="width:${bar.pct * 100}%"></i></div>
      <div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap">
        ${RANKS.map((r) => `<span class="pill ${c.learn.level >= r.at ? 'gold' : ''}">${ico(r.em, r.em, 14)} ${r.name}<span style="font-family:var(--mono);opacity:.7"> L${r.at}</span></span>`).join('')}
      </div>
      <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap">
        <button class="wchip" data-act="shelf" data-arg="words">${ico('lesson', '📖', 16)} Money Words · ${GLOSSARY.length}</button>
        <button class="wchip" data-act="nav" data-arg="arcade">${ico('arcade', '🎮', 16)} Practise it</button>
      </div>
    </div>
    <div class="chapts">
      ${CHAPTERS.map((ch) => {
        const done = ch.cards.filter((x) => c.learn.done[x.id]).length;
        const locked = chapterLocked(c, ch);
        return `<div class="card pad0" ${locked ? 'style="opacity:.62"' : ''}>
          <div style="padding:14px 16px;display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line-soft)">
            ${ico(locked ? '🔒' : ch.em, locked ? '🔒' : ch.em, 24)}
            <div class="grow"><h3 style="font-size:18px">${esc(ch.title)}</h3>
            <p class="small muted">${locked ? 'Opens at level ' + ch.lv + ' · ' + ch.rank : esc(ch.blurb)}</p>
            ${opensWhat(ch.id) ? `<p class="small" style="color:var(--action);font-weight:700;margin-top:2px">
              ${done === ch.cards.length ? 'Opened ' : 'Finish this to open '}${esc(opensWhat(ch.id))}</p>` : ''}</div>
            <span class="pill ${done === ch.cards.length ? 'grow' : ''}">${done}/${ch.cards.length}</span>
          </div>
          ${locked ? '' : ch.cards.map((x) => {
            const dn = c.learn.done[x.id];
            return `<button data-act="card" data-arg="${x.id}" style="display:flex;gap:11px;align-items:center;width:100%;padding:11px 16px;border-top:1px solid var(--line-soft)">
              <span style="width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;font-size:12px;font-weight:800;background:${dn ? 'var(--grow)' : 'var(--tint)'};color:${dn ? '#fff' : 'var(--muted)'}">${dn ? ico('check', '', 14) : ''}</span>
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
  const who = CAST[card.who] || CAST.pip;
  return `<div class="stack">
    <button class="backlink" data-act="closeCard">${ico('back', '←', 16)} ${card.assess ? 'Not now' : 'All chapters'}</button>
    ${card.assess ? hero({ eyebrow: card.generated ? 'Still know this? · in new numbers' : 'Still know this?', title: esc(card.title) })
      : hero({ eyebrow: esc((CHAPTERS.find((x) => x.id === card.ch) || { title: 'A stop off the road' }).title), title: esc(card.title) })}
    ${card.assess ? `<p class="small muted">You met this a while ago. One question — ${card.generated ? 'numbers the town has not asked you before' : 'a different one from last time'}. Getting it right after a gap is how the town knows it is yours.</p>` : `
    ${lessonBlock(card.id)}
    <div class="card reading">
      <p class="sh-line" style="margin-top:0"><span>${face(card.who, 34)}</span><span><span class="nm">${esc(who.name)}</span>${card.teach}</span></p>
      <div class="aside"><span class="eyebrow">For instance</span>${esc(card.eg)}</div>
      ${canSay() ? `<div class="row" style="margin-top:10px"><button class="btn ghost sm" data-act="say" data-arg="card:${card.id}">${ico('sound', '🔊', 15)} Read it to me</button></div>` : ''}
    </div>
    ${tryBlock(card)}
    ${itemBlock(card)}`}
    ${(() => {
      /* One question at a time, permuted independently, the verdict at the
         end. A stale drill from the one-question era just starts over. */
      const total = drillCount(card);
      const live = st && st.card === card.id && st.picks ? st : null;
      const qi = live ? Math.min(live.qi, total - 1) : 0;
      const dq = shuffledDrill(card, qi);
      const p = live && live.picks[qi];
      const hold = drill.holding(p), done = drill.settled(p);
      const last = qi === total - 1;
      return `<div class="card stack">
      <div class="eyebrow">${total > 1 ? `Question ${qi + 1} of ${total}` : 'One question'}</div>
      <div class="row" style="align-items:flex-start;gap:8px"><h3 class="grow" style="font-size:18px">${esc(dq.q)}</h3>
        <button class="btn ghost sm sayq" data-act="say" data-arg="q:${card.id}#${qi}" aria-label="Read the question and the answers to me">${ico('sound', '', 18)}</button></div>
      ${dq.num ? `<div class="numrow">
        <label class="yamt"><span class="sr">Your answer</span><input id="numAns" inputmode="numeric" pattern="[0-9]*" autocomplete="off" enterkeyhint="done" data-enter="answerNum"
          value="${done ? dq.value : hold ? esc(String(p.typed)) : ''}" ${done ? 'disabled' : ''} aria-label="Your answer — type the amount"></label>
        ${done ? '' : '<button class="btn" data-act="answerNum">Check</button>'}</div>` : ''}
      <div class="stack" style="gap:8px">
        ${dq.opts.map((o, i) => {
          let k = '';
          if (done) k = (i === dq.answer) ? ' ok' : (i === p.pick || i === p.wrong ? ' no' : '');
          else if (hold && i === p.wrong) k = ' no';
          return `<button class="opt${k}" data-act="answer" data-arg="${i}" ${done || (hold && i === p.wrong) ? 'disabled' : ''}>
            <span class="k">${'ABCD'[i]}</span>${esc(o)}</button>`;
        }).join('')}
      </div>
      ${hold ? `<div class="fb hold" role="status"><b>Not this time.</b> ${esc(hintFor(card, qi))}
          <div style="margin-top:6px;font-weight:700">Have another go. One more try.</div><button class="sayit" data-act="sayEl" aria-label="Read it to me">${ico('sound', '', 16)}</button></div>` : ''}
      ${done ? `<div class="fb ${p.right ? 'yes' : 'no'}" role="status">
          <b>${p.right ? (p.first === false ? 'Got it on the second go.' : 'That’s it.') : dq.num ? 'It is ' + esc(String(dq.value)) + '.' : 'That one is ' + esc(dq.opts[dq.answer]) + '.'}</b> ${esc(dq.why)}</div>` : ''}
      ${done && !last ? `<button class="btn wide" data-act="nextQ">Next question →</button>` : ''}
      ${done && last ? `<button class="btn wide" data-act="cardDone" data-arg="${card.id}">Take it back to town →</button>` : ''}
    </div>`; })()}
  </div>`;
}

/* E4 · Your turn: sort, order or work out an amount (items.js). A wrong first try
   holds with a hint about the idea and never the answer; the second go settles it. */
function itemBlock(card) {
  const it = ITEMS.ITEMS[card.id]; if (!it) return '';
  const t = (R.item && R.item.id === card.id) ? R.item : (R.item = { id: card.id });
  const held = t.tries === 1 && !t.right, done = !!t.settled;
  const ans = ITEMS.answerOf(card.id);
  let body = '';
  if (it.kind === 'sort') {
    const shown = ITEMS.shown(card.id), bins = t.bins || {};
    const chip = (x) => `<button class="ychip${t.sel === x.i ? ' sel' : ''}${done ? (bins[x.i] === it.things[x.i][1] ? ' ok' : ' no') : ''}" data-act="itSel" data-arg="${x.i}" aria-pressed="${t.sel === x.i}" ${done ? 'disabled' : ''}>${esc(x.t)}</button>`;
    body = `<p class="small muted">Tap a thing, then tap the bin it belongs in.</p>
      <div class="ytray">${shown.filter((x) => bins[x.i] == null).map(chip).join('') || '<span class="small muted">All sorted.</span>'}</div>
      <div class="ybins">${it.bins.map((b, bi) => `<div class="ybin"><button class="ybin-h" data-act="itBin" data-arg="${bi}" ${t.sel == null || done ? 'disabled' : ''} aria-label="Put it in ${esc(b)}">${esc(b)} <span class="small">${bi + 1}</span></button>
        <div class="ybin-b">${shown.filter((x) => bins[x.i] === bi).map(chip).join('')}</div></div>`).join('')}</div>`;
  } else if (it.kind === 'order') {
    const shown = ITEMS.shown(card.id), seq = t.seq || [];
    body = `<p class="small muted">Tap the steps in the order they happen.</p>
      <ol class="yseq">${seq.map((i, k) => `<li class="${done ? (i === ans[k] ? 'ok' : 'no') : ''}">${esc(it.steps[i])}</li>`).join('')}</ol>
      <div class="ytray">${shown.filter((x) => !seq.includes(x.i)).map((x) => `<button class="ychip" data-act="itStep" data-arg="${x.i}" ${done ? 'disabled' : ''}>${esc(x.t)}</button>`).join('')}</div>
      ${seq.length && !done ? '<button class="btn ghost sm" data-act="itUndo">Take the last one back</button>' : ''}`;
  } else {
    body = `<p style="font-weight:650">${esc(it.q)}</p>
      <label class="yamt"><span class="sr">Your answer</span><input id="itAmt" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${esc(t.last != null && !done ? t.last : done ? ans : '')}" ${done ? 'disabled' : ''} aria-label="Your answer"></label>`;
  }
  const ready = it.kind === 'sort' ? it.things.every((_, i) => (t.bins || {})[i] != null) : it.kind === 'order' ? (t.seq || []).length === it.steps.length : true;
  return `<section class="card yourturn" aria-labelledby="yt-${card.id}">
    <div class="eyebrow">Your turn</div>
    <h3 id="yt-${card.id}" style="font-size:18px;margin:2px 0 8px">${esc(it.title)}</h3>
    ${body}
    ${held ? `<div class="fb hold" role="status"><b>Not this time.</b> ${esc(it.hint)}<div style="margin-top:6px;font-weight:700">One more go.</div></div>` : ''}
    ${done ? `<div class="fb ${t.right ? 'yes' : 'no'}" role="status"><b>${t.right ? (t.tries === 1 ? 'That’s it.' : 'Got it on the second go.') : 'Here is how it goes.'}</b> ${t.right ? '' : it.kind === 'amount' ? 'It is ' + ans + '.' : it.kind === 'order' ? it.steps.join(' → ') : ''}</div>` : ''}
    ${done ? '' : `<button class="btn ghost wide" data-act="itCheck" data-arg="${card.id}" ${ready ? '' : 'disabled'}>Check it</button>`}
  </section>`;
}

/* D1 · try it: change the numbers, watch the working (tryit.js) */
function tryBlock(card) {
  if (!TRY.has(card.id)) return '';
  const w = TRY.WIDGETS[card.id], v = TRY.values(card.id, R.tryit), r = TRY.run(card.id, R.tryit);
  return `<section class="card tryit" aria-labelledby="try-${card.id}">
    <div class="eyebrow">Try it before the questions</div>
    <h3 id="try-${card.id}" style="font-size:18px;margin:2px 0 8px">${esc(w.title)}</h3>
    <div class="tvars">${Object.entries(w.vars).map(([k, d]) => `<div class="tvar"><span class="small muted">${esc(d[4])}</span>
      <div class="row" style="gap:6px"><button class="btn ghost sm" data-act="tryStep" data-arg="${card.id}:${k}:-1" aria-label="Less ${esc(d[4])}">−</button>
        <b class="tabnum" aria-live="polite">${v[k]}</b>
        <button class="btn ghost sm" data-act="tryStep" data-arg="${card.id}:${k}:1" aria-label="More ${esc(d[4])}">+</button></div></div>`).join('')}</div>
    <div class="tout">${r.rows.map(([k, n]) => `<div><span class="small muted">${esc(k)}</span><b class="tabnum">${esc(String(n))}</b></div>`).join('')}</div>
    <p class="small" style="margin-top:8px" aria-live="polite">${esc(r.says)}</p>
  </section>`;
}

export function viewGlossaryPage() { return viewGlossary(); }
function viewGlossary() {
  const q = (R.query || '').toLowerCase();
  const rows = GLOSSARY.filter((g) => !q || g[0].toLowerCase().includes(q) || g[1].toLowerCase().includes(q));
  return `<div class="stack">
    ${hero({ eyebrow: 'Every word, in plain English', title: 'Money Words', who: 'nana', line: 'If a grown-up uses a money word you do not know, it is probably here.' })}
    <div class="card">
      <div class="eyebrow">Money Words</div>
      <input data-field="query" data-live="1" value="${esc(R.query || '')}" placeholder="Search ${GLOSSARY.length} terms"
        style="margin-top:8px;padding:11px 13px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650;width:100%">
    </div>
    ${rows.length === 0 ? '<div class="card"><p class="muted">Nothing by that name yet.</p></div>' : ''}
    <div class="card pad0">
      ${rows.map((g, i) => `<div style="padding:13px 16px;${i ? 'border-top:1px solid var(--line-soft)' : ''}">
        <div class="row"><b style="font-size:15px;flex:1">${esc(g[0])}</b>${canSay() ? `<button class="btn ghost sm" data-act="say" data-arg="gloss:${esc(g[0])}" aria-label="Read it to me">${ico('sound', '🔊', 14)}</button>` : ''}</div>
        <p style="font-size:14px;margin-top:2px">${esc(g[1])}</p>
        <p class="small muted" style="margin-top:3px">${esc(g[2])}</p></div>`).join('')}
    </div>
  </div>`;
}

/* The family plan, for a grown-up: its price (cited), what it opens (computed), and the
   plain fact that it is not on sale yet. Only ever behind the PIN (rule 8). */
function planCard(c) {
  const k = planContents();
  return `<section class="card stack" aria-labelledby="plan-h" data-focus="plan">
    <div class="eyebrow">The family plan</div>
    <h2 id="plan-h" style="font-size:20px">${esc(PLAN.name)} · ${esc(planPrice(c.currency))}</h2>
    <p class="small">One pass for the household across the Bizzing apps. In Finance it opens <b>worlds ${k.worlds.map((w) => w.n).join(', ')}</b> — ${k.worlds.map((w) => esc(w.name)).join(', ')} — and their <b>${k.packs.length} packs, ${k.faces} faces</b>.</p>
    <p class="small muted">Free for every child today: worlds ${k.free.map((w) => esc(w.name)).join(' and ')}, every lesson, every game, the Bank, the Exchange and the shop. A child can also open any one world with ${k.eachWorld} coins earned by learning — never with money.</p>
    <p class="small"><b>Not on sale yet.</b> When it is, it is bought here, behind the PIN, and opens on every device in the family — that needs the family server, which is not built. Until then nothing in this app takes money.</p>
    <p class="small muted">Price from ${esc(PLAN.source)}.</p>
  </section>`;
}

/* ══ MONEY ════════════════════════════════════════════════════════════ */
export function viewMoney() {
  const c = K();
  /* "Your place", never "Home": Home is a tab. Only the places that are open, and the
     one that opens next — a row of padlocks is a list of things you cannot do. */
  const NAMES = { place: 'Your place', wallet: 'Wallet', jars: 'Jars', goals: 'Goals',
    bank: 'Bank', portfolio: 'Exchange', business: 'Your shop' };
  const all = PLACES.map((p) => ({ k: p.sub, n: NAMES[p.sub] || p.name }));
  const firstShut = all.findIndex((x) => !chapterOpen(c, x.k));
  const subs = all.filter((x, i) => chapterOpen(c, x.k) || i === firstShut);
  let sub = R.s.ui.sub;
  if (!subs.find((x) => x.k === sub && chapterOpen(c, x.k))) sub = 'wallet';

  const strip = `<div class="mnav">
    ${subs.map((x) => {
      const open = chapterOpen(c, x.k);
      return `<button class="mtab${open ? '' : ' shut'}" data-act="${open ? 'sub' : 'lockedSub'}" data-arg="${x.k}"
        aria-current="${sub === x.k ? 'page' : 'false'}">
        ${open ? '' : ico('lock', '🔒', 14) + ' '}${x.n}</button>`;
    }).join('')}</div>`;

  const body = sub === 'place' ? viewPlace() : sub === 'jars' ? viewJars() : sub === 'goals' ? viewGoals()
    : sub === 'bank' ? viewBank() : sub === 'portfolio' ? viewExchange()
    : sub === 'business' ? viewBusiness() : viewWallet();
  return `<div class="stack">${strip}${body}</div>`;
}

/* Bizzing coins (option (a), FAMILY-STANDARD §1): the family wallet is shown
   as income from the family's apps, read-only, and kept apart from the town's
   money — the town's money is the curriculum, the coins are the family's
   reward for learning, and nothing converts one into the other. */
const APP_NAMES = { bee: 'Bizzing Bee', maths: 'Bizzing Maths', geography: 'Bizzing Geography', india: 'Bizzing India', finance: 'Bizzing Finance' };
function familyCoinsCard(c) {
  if (R.demo) return '';
  const f = family.familyCoins(c.name);
  return `<section class="card fcoins" aria-labelledby="fc-h">
    <div class="row"><div class="grow"><div class="eyebrow">Your Bizzing coins</div>
      <h2 id="fc-h" style="font-size:22px;margin-top:2px;display:flex;align-items:center;gap:6px">${coinSvg(24)} ${f.balance} <span class="small muted" style="font-family:var(--ui);font-weight:600">in the family wallet</span></h2></div></div>
    ${f.week.length ? `<div class="rows" style="margin-top:6px">${f.week.map(([a, n]) => `<div class="qrow"><span class="grow small"><b>${esc(APP_NAMES[a] || a)}</b></span><span class="small tabnum">+${n} this week</span></div>`).join('')}</div>`
      : '<p class="small muted" style="margin-top:6px">Coins arrive for learning in any Bizzing app — a right answer, a lesson, a chapter. None yet this week.</p>'}
    <p class="small muted" style="margin-top:8px">Coins are not the town's money: they never turn into ${esc(CURRENCIES[c.currency].name.toLowerCase())} here, and the town's money never turns into coins.</p>
    <button class="btn ghost sm" style="margin-top:8px" data-act="nav" data-arg="shop">Spend coins in the Shop</button>
  </section>`;
}

function viewWallet() {
  const c = K();
  const jobs = sim.jobsToday(c);
  return `<div class="stack">
    ${hero({ eyebrow: 'In your pocket', title: 'Your wallet', big: money(c.money.wallet), bigStyle: 'color:var(--treasure-deep)', sub: 'right now', art: 'stall',
      line: c.band === 'sprout'
        ? 'This can never go below zero — debt comes later, when it is taught.'
        : 'Every coin in and out, with its date.' })}
    ${familyCoinsCard(c)}
    <div class="card">
      <div class="eyebrow">Work going on Market Row today</div>
      <p class="small muted" style="margin:3px 0 10px">One of each a day. You're selling your time.</p>
      <div class="rows">
        ${jobs.map((j) => `<div class="qrow${j.done ? ' done' : ''}">
          <span class="iw">${ico(j.em, j.em, 20)}</span>
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
    ${hero({ eyebrow: 'You live here', title: esc(h.name), line: esc(h.blurb), art: 'home-' + Math.min(4, c.home.tier || 0),
      big: money(left), bigStyle: left >= 0 ? '' : 'color:var(--spend)', sub: 'left over a week' })}

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
        ? 'The leftover is the part you get to choose.'
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
      <p class="small muted" style="margin-top:8px">The number is right there. The choice is yours.</p>
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
    ${hero({ eyebrow: 'The Jar Shed', title: 'Four jars', big: money(sim.jarTotal(c)), sub: 'in the jars', art: 'jars', who: 'nana',
      line: 'Split it the moment it lands. One pile gets spent as one pile.' })}
    <div class="card">
      <div class="jars">
        ${Object.keys(JARMETA).map((k) => `<div class="jar" style="--jc:${JARMETA[k][1]}">
          <div class="jarglass"><div class="jarfill" style="height:${Math.max(4, j[k] / max * 100)}%;background:${JARMETA[k][1]};opacity:.85"></div></div>
          <div class="jarlbl">${JARMETA[k][0]}<br><span class="jaramt">${money(j[k])}</span></div>
          <div class="row" style="gap:4px">
            <button class="btn ghost sm" style="padding:5px 9px" data-act="jarOut" data-arg="${k}" aria-label="Take out of ${JARMETA[k][0]}">−</button>
            <button class="btn sm" style="padding:5px 9px" data-act="jarIn" data-arg="${k}" aria-label="Put into ${JARMETA[k][0]}">+</button>
          </div></div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:12px">Buttons move ${money(price(2))} at a time, out of your wallet (${money(c.money.wallet)}).</p>
    </div>
    ${!ledger.mathsMet(c)('M10') ? `<div class="card stack">
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
      <p class="small muted">${esc(String(Math.round(r.save / 5)))} coins in every twenty go to Save, and so on — percent is just another way to write it.${ledger.mathsMeasured(c) ? '' : ' (Until a grown-up runs the maths check, the town is guessing what maths you know.)'}</p>
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
    ${hero({ eyebrow: 'The Build Yard', title: 'Goals', art: 'yard', who: 'pip',
      line: 'Name it and price it. Dividing turns a wish into a date.' })}
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

/* Tools that rewrite the child's record exist only in tester mode, where the
   record is already marked as not the child's own. test/trust.mjs holds every
   grantXP button to living inside this function. */
function testerTools() {
  if (!R.s.settings.tester) return '';
  return `<button class="btn ghost wide" data-act="grantXP">＋ Add 200 XP (tester)</button>`;
}

function viewBank() {
  const c = K(), b = c.money.bank;
  const L = b.loan;
  const offer = sim.loanOffer(c, 40, 8);
  const ra = sim.bankRateAnnual(c), wk = sim.bankInterestWeekly(c);
  const proj = [1, 2, 5, 10].map((y) => ({ y, v: Math.round(sim.bankProjection(c, y)) }));
  return `<div class="stack">
    ${hero({ eyebrow: 'Clocktower Square', title: 'The Bank', big: money(b.balance), bigStyle: 'color:var(--save)', sub: 'in the vault', art: 'bank', who: 'nana',
      line: 'Interest is rent on money. Save, and the bank pays you. Borrow, and you pay.' })}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Every pay day</div>
        <div class="big" style="font-size:24px">${ra.toFixed(2)}% <span class="small muted" style="font-family:var(--ui);font-weight:600">a year — the town's rate</span></div></div></div>
      <p class="small muted" style="margin-top:8px">${b.balance > 0 ? `Each pay day the bank pays a fifty-second of that: ${money(b.balance)} × ${ra.toFixed(2)}% ÷ 52 = <b>${moneyExact(wk)}</b>. Bits smaller than a coin wait in the vault until they make a whole one.` : `Each pay day the bank pays a fifty-second of that on whatever is in the vault. The vault is empty, so this week that is nothing — put some in and the sum appears here.`}</p>
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
      <p class="small muted" style="margin-top:7px">It goes up every time you pay back. It's about the loans, not about you — and it can always be rebuilt.</p>
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
      <p class="small muted" style="margin-top:8px">You see the full cost before you agree. Better trust makes the same loan cheaper.</p>
    </div>`}

    <div class="card">
      <div class="eyebrow">The snowball, on this balance</div>
      ${b.balance > 0 ? `<div class="grid3" style="margin-top:8px">
        ${proj.map((p) => `<div style="background:var(--tint);border-radius:var(--r-md);padding:10px 12px">
          <div class="small muted">${p.y} year${p.y > 1 ? 's' : ''}</div>
          <div style="font-weight:800;font-variant-numeric:tabular-nums">${money(p.v)}</div></div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:9px">Your ${money(b.balance)}, left alone at today's ${ra.toFixed(2)}% a year. The town's own rate — it moves, and this is not a forecast.</p>`
      : `<p class="small muted" style="margin-top:6px">The vault is empty, and nothing grows on nothing. Put some of your Save jar in and this shows what it becomes.</p>`}
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
    <p class="small muted" style="margin-top:10px">Everything below moves with these three numbers. It's the town's
      own economy, not a forecast of a real one.</p>
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
    ${hero({ eyebrow: 'The Exchange Quarter', title: 'The Exchange', big: money(val), sub: 'your holdings', art: 'exchange', who: c.market.lastMove >= 0 ? 'bo' : 'bea',
      line: c.market.lastMove >= 0 ? 'Up on the week! I said it would be. I say that every week.' : 'Down on the week. I said so. I also say that every week — one of us is always right and neither of us knows.' })}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Grow jar — what you can buy with</div>
        <div class="big" style="font-size:24px">${money(c.money.jars.grow)}</div></div></div>
      <p class="small muted" style="margin-top:6px">${sp === 0 ? 'Nothing owned yet. Buy from the Grow jar — money you won\'t need soon.'
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
      <p class="small muted" style="margin:4px 0 10px">Jump ahead in time and watch money grow on money.</p>
      <div class="grid3">
        ${[1, 5, 10, 30].map((y) => `<div style="background:var(--tint);border-radius:var(--r-md);padding:10px 12px">
          <div class="small muted">in ${y} year${y > 1 ? 's' : ''}</div>
          <div style="font-weight:800;font-variant-numeric:tabular-nums">${money(Math.round(val * townGrowth(y)))}</div></div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:9px">${esc(GROW_LABEL)}. Not advice, not a forecast, and not any real market. <button class="small" style="color:var(--action);font-weight:800" data-act="sources" data-arg="grow">Where this number comes from →</button></p>
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
      ${hero({ eyebrow: "Nana's shutters", title: 'A stall of your own', art: 'shop', who: 'nana',
        line: 'Your own shop. You set the price, you carry the cost, you keep what\'s left.' })}
      <div class="card">
        <div class="eyebrow">Open your own</div>
        <h2 style="margin:3px 0 6px;font-size:22px">Start a stall</h2>
        <p class="small muted">Put in ${money(price(150))} to start. It buys stock and pays the rent
          while you find your price.</p>
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
    ${hero({ eyebrow: `Week ${v.traded}`, title: esc(v.name), art: 'shop' })}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">What your share is worth</div>
        ${val.equityValue > 0 ? `<div class="big" style="font-size:28px">${money(val.yours)}</div>
        <p class="small muted">what your share is worth${v.outsideEquity > 0
          ? ' — you own ' + Math.round((1 - v.outsideEquity) * 100) + '%' : ''}</p>` : `<div class="big" style="font-size:22px">Not priced yet</div>
        <p class="small muted">A shop is priced on the profit it makes. Trade a few weeks at a profit and it will have a price. Until then, what is on the books is ${money(bs.equity)} — the money in it, not what someone would pay.</p>`}</div>
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
          ${val.equityValue <= 0 || v.outsideEquity >= 0.6 ? 'disabled' : ''}>${val.equityValue > 0 ? `Sell 10% for ${money(val.equityValue * 0.1)}` : 'Sell 10% · needs a profit first'}</button>
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
    ${hero({ eyebrow: 'Market Row', title: 'The General Store', art: 'shop', who: 'mags',
      line: 'Some things here earn their keep, some are just lovely. Each tag says which.' })}
    <div class="card pad0"><div class="rows" style="margin:0">
    ${SHOP.map((it) => {
      const p = price(it.units);
      const owned = c.shop.owned.includes(it.id);
      const spendRate = Math.max(1, (c.family.allowance != null ? c.family.allowance : c.money.wage) * c.money.rules.spend / 100);
      const weeks = Math.max(1, Math.round(p / spendRate));
      const grown = Math.round(p * townGrowth(10));
      const cool = c.shop.cooling[it.id];
      const waiting = cool && nowT < cool;
      const hrs = waiting ? Math.ceil((cool - nowT) / 3600000) : 0;
      const afford = c.money.wallet + c.money.jars.spend >= p;
      return `<div class="qrow block">
        <div class="row" style="align-items:flex-start;gap:12px"><span class="iw">${ico(it.em, it.em, 22)}</span>
          <div class="grow" style="min-width:0"><b style="font-size:15.5px">${esc(it.name)}</b>
            <p class="small muted">${esc(it.desc)}</p></div>
          <div style="text-align:right"><div class="big" style="font-size:19px">${money(p)}</div></div></div>
        ${it.gives ? `<p class="small" style="color:var(--grow);font-weight:700;margin-top:9px">${ico('gear', '⚙', 15)} ${esc(it.gives)}</p>` : ''}
        <p class="small muted" style="margin-top:6px"><b>${weeks} week${weeks > 1 ? 's' : ''}</b> of your Spend jar — or <b>${money(grown)}</b> in ten years at <button class="small" style="color:var(--action);font-weight:700" data-act="sources" data-arg="grow">the town's rate</button>.${it.gives ? '' : ' It does nothing at all — and that\'s allowed.'}</p>
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
    </div></div>
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
    ${hero({ eyebrow: 'Every decision so far', title: 'Progress', big: money(sim.netWorth(c)), bigStyle: 'color:var(--action)', sub: 'net worth' })}
    <div class="sparkwrap">${sparkline(vals.length > 1 ? vals : [0, sim.netWorth(c)], 300, 54, 'var(--action)')}
      <p class="small muted">What you're worth, after every decision since you opened your stall.</p></div>
    <div class="moneyline stats">
      <div><div class="k">Good days</div><div class="v">${ico('sun', '☀️', 18)} ${sim.goodDaysThisWeek(c)} <span class="small muted" style="font-family:var(--ui);font-weight:600">this week</span></div></div>
      <div><div class="k">Rank</div><div class="v">${ico(rank.em, rank.em, 16)} ${rank.name} <span class="small muted" style="font-family:var(--ui);font-weight:600">L${c.learn.level}</span></div></div>
      <div><div class="k">Letters</div><div class="v">${c.postbox.log.length} <span class="small muted" style="font-family:var(--ui);font-weight:600">${scamsAll ? scams + '/' + scamsAll + ' scams spotted' : ''}</span></div></div>
    </div>
    <div class="card">
      <div class="eyebrow">The six strands</div>
      <p class="small muted" style="margin:3px 0 10px">A strand fills when you learn something, still know it days later, and use it somewhere new.</p>
      <div class="rows" style="margin:0 -18px">
        ${STRANDS.map((st) => {
          const p = ledger.strandProgress(c, st);
          const NAME = { EARN: 'Earning it', CHOOSE: 'Choosing', KEEP: 'Keeping it', GROW: 'Growing it', OWE: 'Borrowing', GUARD: 'Guarding it' };
          const pct = p.all ? p.met / p.all * 100 : 0, hard = p.all ? p.retained / p.all * 100 : 0;
          return `<div class="qrow block">
            <div class="row"><b class="grow" style="font-size:14px">${esc(NAME[st] || st)}</b>
              <span class="small muted tabnum">${p.retained} held · ${p.met} of ${p.all}</span></div>
            <div class="bar" style="height:8px;margin-top:6px;position:relative">
              <i style="width:${pct}%;background:var(--action-tint)"></i>
              <i style="width:${hard}%;background:var(--grow);position:absolute;left:0;top:0"></i>
            </div>
            ${p.transferred ? `<div class="small" style="color:var(--grow);font-weight:700;margin-top:4px">${p.transferred} done unprompted, out in the town</div>` : ''}
            ${p.lapsed ? `<div class="small" style="color:var(--spend);margin-top:4px">${p.lapsed} slipped — they are in Revise</div>` : ''}
          </div>`;
        }).join('')}
      </div>
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
  const s = R.s, set = pinSet(s.parent);
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
  const r = report.weekly(c, { money, activity: ((Store.readFamily('bizzing.activity') || {}).s) || [] });
  const row = (em, label, body) => `<div class="qrow" style="align-items:flex-start">
    <span class="iw">${ico(em, em, 19)}</span><span class="grow" style="min-width:0">
    <b style="font-size:14px">${label}</b><div class="small muted">${body}</div></span></div>`;
  return `<div class="stack">
    <button class="btn ghost" style="align-self:flex-start" data-act="nav" data-arg="parents">← Grown-ups</button>
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
      ${r.story.reversed ? `<p class="small muted" style="margin-top:6px">${esc(r.child)} changed their mind within a minute or two — worth knowing, and not a bad sign. The pause is the skill.</p>` : ''}
    </div>` : ''}

    <div class="card">
      <div class="eyebrow">What ${esc(r.child)} found hard</div>
      ${r.hard.length
        ? `<div class="stack" style="gap:8px;margin-top:10px">${r.hard.map((h) => row('•', esc(h.name), esc(h.why))).join('')}</div>`
        : '<p class="small muted" style="margin-top:7px">Nothing slipped this week.</p>'}
    </div>

    ${r.conversation ? `<div class="card" style="border-color:var(--action)">
      <div class="eyebrow">Ask at the table this week</div>
      <p style="margin-top:7px;font-size:16px;font-weight:700;line-height:1.45">${esc(r.conversation.ask)}</p>
      <div class="sep" style="margin:12px 0"></div>
      <div class="eyebrow">What ${esc(r.child)} should be able to do</div>
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
      <p class="small muted" style="margin-top:11px">The pale bar is what ${esc(r.child)} has met. The solid bar
        is what was still there a week later. Only the second one is learning.</p>
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

/* The one-glance card (M1): Time · Progress · Mastery, the family's three
   measures, then the week's decisions from the log (M2). reportcard.js does
   the counting; this only draws it. */
function reportCard(c) {
  const r = RC.card(c, Store.readFamily('bizzing.activity'));
  const tile = (k, v, sub) => `<div class="rc-t"><span class="eyebrow">${k}</span><b>${v}</b><span class="small muted">${sub}</span></div>`;
  return `<section class="card rc" aria-labelledby="rc-h">
    <h2 id="rc-h" style="font-size:19px">${esc(c.name)} this week, at a glance</h2>
    <div class="rc-row">
      ${tile('Time', r.time.minutes ? `${r.time.minutes} min` : '—', r.time.minutes ? 'active minutes, from the family feed' : 'no active minutes logged yet')}
      ${tile('Progress', `${r.progress.stops} / ${r.progress.of}`, `stops · ${esc(r.progress.world)} ${r.progress.worldDone}/${r.progress.worldOf} · ${esc(r.progress.rank)} L${r.progress.level}`)}
      ${tile('Mastery', `${r.mastery.held.length} / ${r.mastery.of}`, `skills shown again after a gap · ${r.mastery.practising} being practised`)}
    </div>
    ${r.mastery.held.length ? `<p class="small" style="margin-top:10px"><b>Can now do:</b> ${r.mastery.held.slice(0, 4).map(esc).join(' · ')}</p>` : '<p class="small muted" style="margin-top:10px">Nothing is counted as learned until it is shown again after a gap of a week. The first ones arrive in week two.</p>'}
    ${r.mastery.lapsed.length ? `<p class="small" style="margin-top:6px"><b>Slipped since it was solid — worth a chat:</b> ${r.mastery.lapsed.slice(0, 3).map(esc).join(' · ')}</p>` : ''}
    ${r.decisions.length ? `<p class="small" style="margin-top:6px"><b>Decided:</b> ${r.decisions.slice(0, 3).map((d) => `${esc(d.label)} — ${esc(d.chose)}`).join(' · ')}</p>` : ''}
  </section>`;
}

export function viewParents() {
  const c = K(), s = R.s;
  const w = weekSummary(c);
  return `<div class="stack">
    ${hero({ eyebrow: 'For the grown-up', title: `${esc(c.name)}'s week`, figure: face('nana', 96),
      line: 'Observation, never a grade on the child. The simulator is a window into instincts no quiz gives you.' })}
    ${reportCard(c)}
    <div class="card">
      <div class="row" style="gap:8px">
        <button class="btn grow" data-act="nav" data-arg="report">${ico('page', '', 18)} This week's report</button>
        <button class="btn ghost sm" data-act="lock">${ico('lock', '', 16)} Lock</button>
      </div>
      <a class="small" style="display:block;margin-top:10px;color:var(--action);font-weight:700" href="https://aayuvis.github.io/Bizzing_Schedule/">The whole family's week, across every Bizzing app → the Hive</a>
    </div>

    <div class="card">
      <div class="eyebrow">Certificates</div>
      ${(() => { const e = CERT.earned(c); return e.length
        ? `<p class="small muted" style="margin:4px 0 8px">Made on this device as a picture, for you to save and share as you choose. Nothing is uploaded.</p>
           <div class="row" style="gap:8px;flex-wrap:wrap">${e.map((x) => `<button class="btn ghost sm" data-act="cert" data-arg="${x.id}">${ico('medal', '', 16)} ${esc(x.name)}</button>`).join('')}</div>`
        : `<p class="small muted" style="margin-top:4px">When ${esc(c.name)} finishes every stop in a place — Market Row first — a certificate with their name, their avatar and the chapters they finished can be made here.</p>`; })()}
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
      <p class="small" style="margin-top:6px">💬 <b>This week's question, from ${esc(c.name)} to you:</b> “${esc(daily.askOfWeek())}” — it is on their Home too. About your own story, never about the family's money.</p>
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
        <button class="btn ${ch.done ? '' : 'ghost'} sm" data-act="chore" data-arg="${i}" aria-label="${esc(ch.name || 'Chore')} — ${ch.done ? 'done' : 'not done'}">${ch.done ? ico('check', '', 16) : ''}</button>
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
        <button class="btn ${s.settings.sound ? '' : 'ghost'} sm" data-act="sound">${s.settings.sound ? 'On' : 'Off'}</button></div>      <div class="row"><span class="small grow">My Feed <span class="muted">— about twenty cards from across the town, and then it ends. Off removes the tab and the ☰ row.</span></span>
        <button class="btn ${s.settings.feedOff ? 'ghost' : ''} sm" role="switch" aria-checked="${!s.settings.feedOff}" data-act="feedToggle">${s.settings.feedOff ? 'Off' : 'On'}</button></div>
    </div>

    ${planCard(c)}
    ${placementCard(c)}
    ${answersCard(c)}
    ${backupCard(s)}

    <div class="card stack" style="${s.settings.tester ? 'box-shadow:0 0 0 2px var(--spend),0 14px 34px rgb(12 30 34 / .08)' : ''}">
      <div class="eyebrow" style="color:var(--spend)">Tester mode</div>
      <p class="small muted">For trying the app, not for a child. With it on, every gate opens — all eight chapters, the five worlds, the Jar Shed, the Build Yard, the Bank, the Exchange, the shop and every game — while ${esc(c.name)}'s learning record stays exactly what it is. A red TESTER pill sits in the bar the whole time it is on.</p>
      <div class="row"><span class="small grow">Unlock everything</span>
        <button class="btn ${s.settings.tester ? '' : 'ghost'} sm" data-act="tester">${s.settings.tester ? 'On' : 'Off'}</button></div>
      ${s.settings.tester ? `
      <div class="row"><span class="small grow">Preview the family plan <span class="muted">— on this device, while tester mode is on. It is not the plan: nothing is bought and it ends with tester mode.</span></span>
        <button class="btn ghost sm" data-act="planToggle" aria-pressed="${s.settings.plan === 'family'}">${s.settings.plan === 'family' ? 'On' : 'Off'}</button></div>
      <div class="rows" style="margin-top:4px">
        <div class="qrow"><span class="grow"><b style="font-size:14px">Jump the ladder</b><div class="small muted">Sets the level; XP follows. Level ${c.learn.level} now.</div></span>
          <span class="row" style="gap:6px"><button class="btn ghost sm" data-act="tJump" data-arg="1">1</button><button class="btn ghost sm" data-act="tJump" data-arg="12">12</button><button class="btn ghost sm" data-act="tJump" data-arg="30">30</button></span></div>
        <div class="qrow"><span class="grow"><b style="font-size:14px">Top up the wallet</b><div class="small muted">Labelled "Tester top-up" in the ledger.</div></span>
          <button class="btn ghost sm" data-act="tMoney">+ ${money(price(100))}</button></div>
        <div class="qrow"><span class="grow"><b style="font-size:14px">Bring pay day forward</b><div class="small muted">The bell is ready to ring on Home straight away.</div></span>
          <button class="btn ghost sm" data-act="tBell">Ring now</button></div>
        <div class="qrow"><span class="grow"><b style="font-size:14px">Mark every card done</b><div class="small muted">Fills the learn record with tester marks (no stars). This one does change the record.</div></span>
          <button class="btn ghost sm" data-act="tDone">Mark all</button></div>
      </div>` : ''}
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
      ${testerTools()}
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
  const ruleD = (c.decisions || []).find((d) => d.surface === 'rules' && d.t >= since);
  if (ruleD && sim.rulesChosen(c)) decisions.push({ em: '📊', t: `Changed the pay-day split to ${esc(ruleD.chose)}. Their choice — it is in the decision log.` });
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
    ${hero({ eyebrow: 'Kept, never given', title: 'Medals', figure: co.has(c) ? companionFigure(c, 110) : pipPose('cheer', 110),
      line: 'Medals are for good decisions. Keepsakes are for things you did. Nothing here is for just showing up.' })}
    <div class="card">
      <div class="eyebrow">Things you did</div>
      ${(c.deeds || []).length ? `
        <div class="beads" aria-hidden="true">${(c.deeds || []).slice(-30).map(() => '<i></i>').join('')}</div>
        <p class="small muted" style="margin-top:6px">${daily.deedCount(c)} ${daily.deedCount(c) === 1 ? 'thing' : 'things'} done out in the real world. Never full, never checked, never goes down.</p>
        <div class="rows" style="margin-top:6px">${(c.deeds || []).slice(-5).reverse().map((d) => `<div class="qrow"><span class="iw">${ico('check', '✅', 18)}</span><span class="grow small">${esc(d.text)}</span><span class="small muted">${shortDate(d.t)}</span></div>`).join('')}</div>`
        : `<p class="small muted" style="margin-top:4px">Every "Do one" from Home that you do in real life adds a bead here.</p>`}
    </div>
    <div class="card">
      <div class="eyebrow">Keepsakes</div>
      ${(c.keepsakes || []).length
        ? `<div class="stack" style="gap:10px;margin-top:10px">${c.keepsakes.map((k) => receiptSlip(k)).join('')}</div>`
        : `<p class="small muted" style="margin-top:4px">Your first purchase goes here, with the shifts that paid for it. Nothing here is given — it's earned.</p>`}
    </div>
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Medals</div>
        <h2 style="margin:2px 0 0">${have} of ${Object.keys(BADGES).length}</h2></div></div>
      ${(() => {
        /* Fifty padlocks was most of this screen for a new child. What she has
           comes first, the next six are shown in full with what earns them, and
           the rest wait in a fold. */
        const keys = Object.keys(BADGES);
        const got = keys.filter((k) => c.badges.includes(k)), ahead = keys.filter((k) => !c.badges.includes(k));
        const tile = (k, hint) => { const b = BADGES[k], has = c.badges.includes(k);
          return `<div data-focus="badge:${k}" class="badge${has ? ' got' : ''}">
            <div class="bic">${ico(has ? b.em : 'lock', has ? b.em : '🔒', 24)}</div>
            <div class="bnm">${esc(b.name)}</div>
            <div class="small muted bds">${has || hint ? esc(b.desc) : 'Not yet'}</div></div>`; };
        return `${got.length ? `<div class="grid3" style="margin-top:12px">${got.map(tile).join('')}</div>` : ''}
          ${ahead.length ? `<div class="eyebrow" style="margin-top:14px">Next to earn</div>
            <div class="grid3" style="margin-top:8px">${ahead.slice(0, 6).map((k) => tile(k, true)).join('')}</div>` : ''}
          ${ahead.length > 6 ? `<div style="margin-top:12px">${fold('badges', `${ahead.length - 6} more to find`, 'Every one marks a decision, not a visit.', 'medal',
            `<div class="grid3">${ahead.slice(6).map(tile).join('')}</div>`)}</div>` : ''}`;
      })()}
    </div>
    <div class="card">
      <div class="eyebrow">People you've met</div>
      <div class="grid3" style="margin-top:10px">
        ${Object.keys(CAST).map((k) => `<button data-act="castCard" data-arg="${k}" style="background:var(--tint);border-radius:var(--r-md);padding:12px;text-align:center;font:inherit;color:inherit">
          <div style="width:54px;height:54px;margin:0 auto;border-radius:50%;overflow:hidden">${face(k, 54)}</div>
          <div style="font-weight:800;font-size:13.5px;margin-top:5px">${esc(CAST[k].name)}</div>
          <div class="small muted" style="font-size:11.5px;line-height:1.35">${esc(CAST[k].role)}</div></button>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="eyebrow">The town museum · money of the world</div>
      <p class="small muted" style="margin:4px 0 10px">Real money from around the world, unlocked as you climb.</p>
      <div class="grid3">
        ${Object.keys(CURRENCIES).map((k, i) => {
          const has = c.currency === k || levelAtLeast(c, (i + 1) * 4);
          return `<div style="background:var(--tint);border-radius:var(--r-md);padding:12px;text-align:center;opacity:${has ? 1 : .4}">
            <div style="font-size:22px;font-weight:800">${has ? CURRENCIES[k].sign : '🔒'}</div>
            <div style="font-weight:700;font-size:12.5px">${has ? esc(CURRENCIES[k].name) : 'level ' + ((i + 1) * 4)}</div></div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}


/* ══ SETTINGS — one sheet, from the gear in the bar ══════════════════════
   Bee keeps a sliders button in its bar and India a row of chips; both put
   every preference within one tap of any screen. Device preferences (look,
   text, motion) are this browser's; the household's (currency, pay day,
   mode, children) are the household's; tester mode is loud on purpose. */
export function settingsSheet(R) {
  const s = R.s, c = K();
  const seg = (act, opts, cur) => `<span class="seg">${opts.map(([v, l]) => `<button data-act="${act}" data-arg="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</span>`;
  const row = (t, sub, ctl) => `<div class="qrow"><span class="grow" style="min-width:0"><b style="font-size:14px">${t}</b>${sub ? `<div class="small muted">${sub}</div>` : ''}</span>${ctl}</div>`;
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `
    <div class="eyebrow">Settings</div>
    <h2 style="margin:4px 0 2px">How Bizzington looks and sounds</h2>
    <div class="sect"><b>Look</b><i></i></div>
    <div class="rows" style="margin:0 -22px">
      ${row('Appearance', 'Follows the device unless you choose.', seg('mode', [['light', 'Light'], ['dark', 'Dark'], ['system', 'System']], R.mode || 'system'))}
      ${row('Text size', 'Larger type on every screen.', seg('text', [['normal', 'Normal'], ['large', 'Large']], R.text || 'normal'))}
      ${row('Motion', 'Reduced turns off the confetti and the bobbing.', seg('motion', [['full', 'Full'], ['reduced', 'Reduced']], R.motion || 'full'))}
      ${row('Sound', 'Clicks, coins and the bell.', seg('sound', [['on', 'On'], ['off', 'Off']], s.settings.sound ? 'on' : 'off'))}
      ${row('Narration speed', 'Nana in the lessons, and "Read it to me".', seg('rate', [['slow', 'Slower'], ['normal', 'Normal']], R.rate === 'slow' ? 'slow' : 'normal'))}
    </div>
    ${pinSet(s.parent) && !R.gate ? `<div class="sect"><b>Grown-ups only</b><i></i></div>
    <div class="rows" style="margin:0 -22px">
      ${row('Money, children and tester mode', 'Behind the PIN. Unlock on the grown-up\'s page and come back.', '<button class="btn ghost sm" data-act="nav" data-arg="parents">Unlock</button>')}
    </div>` : `<div class="sect"><b>Money</b><i></i></div>
    <div class="rows" style="margin:0 -22px">
      ${row('Currency', 'Changing it converts the town rather than resetting it.', `<select class="field sm" data-field="cur" data-live="1">${Object.keys(CURRENCIES).map((k) => `<option value="${k}" ${c.currency === k ? 'selected' : ''}>${CURRENCIES[k].sign} ${CURRENCIES[k].name}</option>`).join('')}</select>`)}
      ${row('Pay day', 'The bell rings once a week, on this day.', `<select class="field sm" data-field="payday" data-live="1">${DAYS.map((d, i) => `<option value="${i}" ${(c.family.payWeekday == null ? 5 : c.family.payWeekday) === i ? 'selected' : ''}>${d}</option>`).join('')}</select>`)}
      ${row('Mode', c.band === 'sprout' ? 'Sprout: no debt, no market, nothing below zero.' : 'Builder: the whole town, including borrowing.', `<button class="btn ghost sm" data-act="band">${c.band === 'sprout' ? 'Sprout (8–10)' : 'Builder (11+)'}</button>`)}
    </div>
    <div class="sect"><b>Children</b><i></i></div>
    <div class="rows" style="margin:0 -22px">
      ${s.kids.map((k, i) => row(esc(k.name), `Level ${k.learn.level} · ${k.band === 'sprout' ? 'Sprout' : 'Builder'}`, i === s.active ? '<span class="pill gold">playing</span>' : `<button class="btn ghost sm" data-act="switchKid" data-arg="${i}">Switch</button>`)).join('')}
      ${row('Another child', 'Their own town, their own money.', '<button class="btn ghost sm" data-act="addKid">Add</button>')}
    </div>
    <div class="sect"><b>For testers</b><i></i></div>
    <div class="rows" style="margin:0 -22px">
      ${row('Tester mode', s.settings.tester ? 'On — every gate is open; the record is untouched. Tools are on the grown-up\'s page.' : 'Opens every chapter, world, building and game without changing what ' + esc(c.name) + ' has learned.', seg('tester', [['on', 'On'], ['off', 'Off']], s.settings.tester ? 'on' : 'off'))}
    </div>`}
    <div class="sect"><b>Help</b><i></i></div>
    <div class="rows" style="margin:0 -22px">
      ${row('Something not right?', 'Note it here. It stays on this device until you copy it out.', '<button class="btn ghost sm" data-act="bug">Report</button>')}
    </div>
    ${R.install ? `<div class="sect"><b>This device</b><i></i></div>
    <div class="rows" style="margin:0 -22px">
      ${row('Install Bizzing Finance', 'Its own icon, full screen, works offline.', '<button class="btn sm" data-act="install">Install</button>')}
    </div>` : ''}
    <div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap">
      <button class="btn ghost sm" data-act="nav" data-arg="parents">${ico('family', '', 15)} Grown-ups</button>
      <button class="btn ghost sm" data-act="about">${ico('lesson', '📖', 15)} About</button>
      <button class="btn ghost sm" data-act="nav" data-arg="collection">${ico('quest', '🏅', 15)} Collection</button>
      <span class="grow"></span>
      <button class="btn sm" data-act="closeOv">Done</button>
    </div>`;
}


/* ══ ABOUT — what this is, how it was made, and who is credited ══════════
   India credits every art tradition and Bee its typefaces; this app owes
   the same honesty about the image model, the synthesised narration and the
   three open fonts it ships. */
export const VERSION = '2026-09-30';
export function aboutSheet() {
  return `
    <div class="row" style="gap:12px;align-items:center">${mark(44)}<div><div class="eyebrow">About</div><h2 style="margin:2px 0 0">Bizzing Finance</h2>
      <div class="small muted">Set in Bizzington · build ${VERSION}</div></div></div>
    <p class="small" style="margin-top:12px">A town where a child gets a stall, a wallet and four jars, and learns money by running their own — with money that isn't real. For children of eight and up, and the grown-ups who ask them what they did with it.</p>
    <div class="sect"><b>How it was made</b><i></i></div>
    <p class="small muted">The characters, the buildings, the map, the five worlds and the arcade covers were drawn with an AI image model from written briefs, then chosen, keyed and edited by hand. The lesson narration was recorded with a synthetic voice from scripts a person wrote. No AI runs while the app runs: nothing your child types, taps or earns leaves this device, and no model writes to them, scores them or sees them.</p>
    <p class="small muted" style="margin-top:8px">Every number is Bizzington's own arithmetic. There are no real interest rates, no real returns and no real companies in it, and no path from any screen to a payment form. <button class="small" style="color:var(--action);font-weight:800" data-act="sources">Where every number comes from →</button></p>
    <div class="sect"><b>Type</b><i></i></div>
    <p class="small muted"><b>Fraunces</b> by Undercase Type, <b>Hanken Grotesk</b> by Hanken Design Co., and <b>Sono</b> by Tyler Finck — all under the SIL Open Font License, bundled so the app works with no network at all.</p>
    <div class="sect"><b>The family</b><i></i></div>
    <p class="small muted">Third of three: <b>Bizzing Bee</b> teaches spelling, <b>Bizzing India</b> teaches the India a child has not lived in, and this one teaches money. Same rules in all three: no ads, no tracking, nothing sold to a child.</p>
    <div class="row" style="margin-top:14px"><span class="grow"></span><button class="btn sm" data-act="closeOv">Done</button></div>`;
}


/* ── Today: do one, carry one, ask at home, a tip (daily.js) ─────────────
   India's Home carries a deed, a word and a question for the family; this
   is the same three, in money. One card, three hairline rows, no boxes. */
function todayCard(c) {
  const deed = daily.deedOfDay(), done = daily.deedDoneToday(c);
  const w = daily.wordOfDay(), ask = daily.askOfWeek(), tip = daily.tipOfDay(c);
  const sayBtn = (key) => canSay() ? `<button class="btn ghost sm" data-act="say" data-arg="${key}" aria-label="Read it to me">${ico('sound', '🔊', 15)}</button>` : '';
  return `<div class="card pad0 today">
    <div class="rows" style="margin:0">
      <div class="qrow block${done ? ' done' : ''}">
        <div class="row" style="gap:11px;align-items:flex-start">
          <span class="iw">${ico(done ? 'check' : 'quest', done ? '✅' : '⭐', 20)}</span>
          <span class="grow" style="min-width:0"><span class="eyebrow">Do one</span>
            <p style="font-size:14.5px;margin-top:2px">${esc(deed.text)}</p>
            <div class="small muted" style="margin-top:3px">${done ? 'Done, and kept on your shelf.' : 'Out in the real world. Nothing to type — just say when it is done.'}</div></span>
          ${done ? '<span class="pill grow">done</span>' : '<button class="btn sm" data-act="deed">I did it</button>'}
        </div>
      </div>
      <div class="qrow block">
        <div class="row" style="gap:11px;align-items:flex-start">
          <span class="iw">${ico('lesson', '📖', 20)}</span>
          <span class="grow" style="min-width:0"><span class="eyebrow">Carry one</span>
            <p style="margin-top:2px"><b style="font-family:var(--display);font-size:20px">${esc(w.term)}</b> <span class="small muted">· ${esc(w.meaning)}</span></p>
            <div class="small muted" style="margin-top:3px">${esc(w.eg)}</div></span>
          ${sayBtn('word')}
        </div>
      </div>
      <div class="qrow block">
        <div class="row" style="gap:11px;align-items:flex-start">
          <span class="iw">${ico('family', '💬', 20)}</span>
          <span class="grow" style="min-width:0"><span class="eyebrow">Ask at home this week</span>
            <p style="font-size:14.5px;margin-top:2px">“${esc(ask)}”</p>
            <div class="small muted" style="margin-top:3px">About their own story, never about the family's money.</div></span>
          ${sayBtn('ask')}
        </div>
      </div>
      ${tip ? `<div class="qrow block">
        <div class="row" style="gap:11px;align-items:flex-start">
          <span class="iw">${ico('receipt', '💡', 20)}</span>
          <span class="grow" style="min-width:0"><span class="eyebrow">Remember this one</span>
            <p class="small" style="margin-top:2px">${esc(tip.text)}</p>
            <div class="small muted" style="margin-top:3px">From <button class="small" style="font-weight:800;color:var(--action)" data-act="card" data-arg="${tip.card.id}">${esc(tip.title)}</button></div></span>
        </div>
      </div>` : ''}
    </div>
  </div>`;
}


/* ── the landing: what a grown-up meets first ────────────────────────────
   Bee and India both open on a page that says what this is, counts what is
   in it FROM THE DATA (never a typed number), states the promises, and
   offers one button. */
function landing() {
  const counts = [[ALL_CARDS.length, 'lessons, every one read aloud'], [GAMES.length, 'games, keyboard and touch'], [WORLDS.length, 'places to walk'], [Object.keys(BADGES).length, 'medals for decisions']];
  return `<div class="stack" style="max-width:560px;margin:3vh auto 0">
    <div style="text-align:center">${pipPose('wave', 128, 'Pip the squirrel waves hello')}
      <div class="eyebrow" style="margin-top:6px">Bizzing Finance</div>
      <h1 style="font-size:clamp(30px,8vw,40px);line-height:1.05;margin-top:4px">Earn it, keep it, grow it — in a town of your own.</h1>
      <p class="muted" style="margin-top:10px;font-size:16px">For children of eight and up: a stall, a wallet, four jars, a bank that lends, an exchange, a shop of their own — and a grown-up's page that reports what they learned, not how long they stayed.</p>
    </div>
    <button class="btn wide" style="font-size:16px;min-height:52px" data-act="obStart">Start free →</button>
    <a class="btn ghost wide" href="?demo" style="text-decoration:none">Peek inside a sample town first</a>
    <div class="moneyline stats" style="justify-content:space-between">
      ${counts.map(([n, l]) => `<div><div class="v" style="font-size:24px">${n}</div><div class="k">${l}</div></div>`).join('')}
    </div>
    <div class="card pad0"><div class="rows" style="margin:0">
      ${[['lock', 'No real money, ever', 'No card, no bank link, no cash-out. The simulator is closed, and that is the point.'],
         ['family', 'Nothing leaves this device', 'A first name and an age band. No email, no photo, no tracking, no ads.'],
         ['receipt', 'Every number is Bizzington\'s own', 'No real interest rates, no real returns, no real companies — and nothing is investment advice.']]
        .map(([ic, t, sub]) => `<div class="qrow"><span class="iw">${ico(ic, '✓', 20)}</span><span class="grow"><b style="font-size:14.5px">${t}</b><div class="small muted">${sub}</div></span></div>`).join('')}
    </div></div>
    <p class="small muted" style="text-align:center">Third of the Bizzing family, after <b>Bizzing Bee</b> and <b>Bizzing India</b>. <button class="small" style="color:var(--action);font-weight:800" data-act="about">How it was made →</button></p>
  </div>`;
}


/* ── today's till (dailypuzzle.js) ───────────────────────────────────────
   One a day, the same one in every house, no timer and no streak. */
function tillCard(c) {
  const p = puz.puzzle(), st = puz.stateOf(c, p.day);
  const money2 = (n) => money(price(n));
  const line = (l, i) => `<div class="tline">
    <span class="grow">${ico(l.em, l.em, 16)} ${esc(l.name)}${l.qty > 1 ? ` <span class="small muted">× ${l.qty}</span>` : ''}</span>
    <i></i><b class="tabnum">${i === p.hidden ? (st.done ? money2(l.each) + (l.qty > 1 ? ' each' : '') : '<span class="tq">?</span>') : money2(l.each) + (l.qty > 1 ? ' each' : '')}</b>
  </div>`;
  const marks = st.tries.map((t) => t === p.answer ? '<span class="tm ok">right</span>' : `<span class="tm">${t > p.answer ? '▼ too high' : '▲ too low'}</span>`).join('');
  return `<div class="card till">
    <div class="row"><div class="grow"><div class="eyebrow">Today's till · everyone gets the same one</div>
      <h3 style="margin:2px 0 0">What did one cost?</h3></div>
      <span class="small muted tabnum">#${p.day}</span></div>
    <div class="slip" style="margin-top:10px;max-width:none">
      <div class="slip-head"><span>Bizzington General Store</span><span>no. ${p.day}</span></div>
      ${p.lines.map(line).join('')}
      <div class="slip-line total"><span>Total</span><i></i><b class="tabnum">${money2(p.total)}</b></div>
    </div>
    ${st.done
      ? `<p class="small" style="margin-top:10px">${st.won
          ? `<b style="color:var(--grow)">${st.tries.length === 1 ? 'First look.' : 'Got it.'}</b> ${esc(p.lines[p.hidden].name)} was ${money2(p.answer)}${p.lines[p.hidden].qty > 1 ? ' each' : ''}.`
          : `<b>It was ${money2(p.answer)}${p.lines[p.hidden].qty > 1 ? ' each' : ''}.</b> ${p.kind === 'divide'
              ? `Take the other lines off the total, then share what is left between the ${p.lines[p.hidden].qty}.`
              : 'Take the other lines off the total, and what is left is the missing one.'}`}</p>
         <div class="row" style="gap:8px;margin-top:10px">${marks}<span class="grow"></span>
           <button class="btn ghost sm" data-act="tillShare">Copy the shape</button></div>`
      : `<div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">
           <input class="field" data-field="till" inputmode="numeric" placeholder="What did one cost?" value="${esc(R.fields.till || '')}"
             style="flex:1;min-width:150px;padding:11px 13px;border-radius:999px;border:1.5px solid var(--line);background:var(--surface);font:inherit;font-weight:700">
           <button class="btn sm" data-act="till">Check</button></div>
         <div class="row" style="gap:8px;margin-top:8px">${marks}<span class="grow"></span>
           <span class="small muted">${puz.TRIES - st.tries.length} ${puz.TRIES - st.tries.length === 1 ? 'try' : 'tries'} left · no timer, and missing a day costs nothing</span></div>`}
  </div>`;
}

/* ── the maths check (placement.js), on the grown-up's page ───────────── */
export function placementCard(c) {
  const m = placement.measured(c);
  return `<div class="card stack">
    <div class="eyebrow">The maths check</div>
    <p class="small muted">${m
      ? `Measured on ${shortDate(c.maths.at)}: ${esc(c.name)} reached <b>${(placement.RUNGS[c.maths.reached - 1] || {}).can ? esc(placement.RUNGS[c.maths.reached - 1].can.toLowerCase()) : 'the first rung'}</b>. The town uses that to decide what it may put on screen — a screen that needs arithmetic not met yet waits, or shows the same truth another way.`
      : `Twelve questions, stopped the moment two in a row go wrong, about three minutes. It sets a ceiling, not a score: it is never shown to ${esc(c.name)} as a mark and never goes in a report. Until it is sat, the app is guessing from the age band.`}</p>
    <div class="row" style="gap:8px"><span class="grow"></span>
      <button class="btn ${m ? 'ghost' : ''} sm" data-act="placement">${m ? 'Sit it again' : 'Start the check'}</button></div>
  </div>`;
}

/* ── backup, and the consent gate for a server that does not exist yet ── */
export function backupCard(s) {
  const con = backup.consented(s);
  return `<div class="card stack">
    <div class="eyebrow">Backup</div>
    <p class="small muted">Everything lives on this device and nowhere else. Save a copy and you can move the household to another phone, or bring it back if this one is wiped.</p>
    <div class="row" style="gap:8px;flex-wrap:wrap">
      <button class="btn sm" data-act="bkSave">Save a copy</button>
      <button class="btn ghost sm" data-act="bkLoad">Restore from a file</button>
    </div>
    <div class="sect" style="margin-top:6px"><b>If there is ever a server</b><i></i></div>
    <p class="small muted">There is no account and no server today, so nothing has ever been uploaded. When there is one, this switch is what it waits on — and even with it on, ${esc(s.kids.map((k) => k.name).join(' and ') || 'your child')}'s name, age band and any recorded voice are <b>not on the list of things that may leave</b>. That is built into the code, not into a policy.</p>
    <div class="row"><span class="small grow">Allow a backup to the cloud, when one exists</span>
      <button class="btn ${con ? '' : 'ghost'} sm" data-act="consent">${con ? 'Allowed' : 'Not allowed'}</button></div>
    ${con ? '<p class="small muted">Turning this off again deletes whatever was uploaded, rather than just stopping.</p>' : ''}
  </div>`;
}

/* ── the week's answer, in the voice that gave it (answers.js) ───────── */
export function answersCard(c) {
  const list = answers.list(c);
  if (!answers.supported()) return `<div class="card stack"><div class="eyebrow">The week's answer</div>
    <p class="small muted">This device cannot record audio, so the question stays a question. Everything else works.</p></div>`;
  const rec = R.rec;
  return `<div class="card stack">
    <div class="eyebrow">The week's answer</div>
    <p class="small">“${esc(daily.askOfWeek())}”</p>
    <p class="small muted">Ask it, and keep the answer in the voice that gave it. It stays on this phone: it is not in the backup, and there is nowhere for it to go even when there is a server.</p>
    ${rec ? `<div class="row" style="gap:8px;align-items:center">
        <span class="reclive"></span><span class="small grow tabnum">${Math.floor(rec.secs)}s</span>
        <button class="btn sm" data-act="recStop">Stop and keep</button>
        <button class="btn ghost sm" data-act="recCancel">Throw away</button></div>`
      : `<div class="row" style="gap:8px;flex-wrap:wrap">
          <input class="field" data-field="recwho" placeholder="Who is answering? (Nani, Dad…)" value="${esc(R.fields.recwho || '')}"
            style="flex:1;min-width:160px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface);font:inherit;font-weight:650;font-size:13.5px">
          <button class="btn sm" data-act="recStart">${ico('sound', '🎙', 15)} Record</button></div>`}
    ${list.length ? `<div class="rows" style="margin:6px -18px 0">
      ${list.map((a) => `<div class="qrow"><span class="iw">${ico('sound', '🎙', 18)}</span>
        <span class="grow" style="min-width:0"><b style="font-size:14px">${esc(a.who || 'Someone at home')}</b>
          <div class="small muted">“${esc(a.q)}” · ${shortDate(a.t)}${a.plays ? ` · played ${a.plays}×` : ''}</div></span>
        <button class="btn ghost sm" data-act="recPlay" data-arg="${a.id}">Play</button>
        <button class="btn ghost sm" data-act="recDel" data-arg="${a.id}" aria-label="Delete">×</button></div>`).join('')}
    </div>` : ''}
  </div>`;
}
