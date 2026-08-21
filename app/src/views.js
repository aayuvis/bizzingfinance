/* views.js — Home (the town), Learn, Money, Store, Progress, Collection.
   Every view is a pure string; every click is a [data-act]. */

import { esc, on, toast, sfx, confetti, sparkline, clamp } from './ui.js';
import { money, price, sign, CURRENCIES, shortDate, weekday } from './fmt.js';
import { say, face, CAST } from './art.js';
import { townSVG, PLACES, isOpen } from './town.js';
import { CHAPTERS, ALL_CARDS, LETTERS, SHOP, ASSETS, BADGES, rankFor, shuffledDrill } from './content.js';
import * as sim from './sim.js';
import { R } from './runtime.js';

const S = () => R.s;
const go = () => R.render();

/* ══ ONBOARDING ═══════════════════════════════════════════════════════ */
export function viewOnboard(draft) {
  const step = draft.step || 0;
  const shell = (body) => `<div class="stack" style="max-width:520px;margin:6vh auto 0">${body}</div>`;
  if (step === 0) {
    return shell(`
      <div style="text-align:center">
        <div style="width:96px;height:96px;margin:0 auto 12px;border-radius:50%;overflow:hidden;border:1px solid var(--line)">${CAST.pip.svg}</div>
        <h1 style="font-size:32px">Welcome to <em style="font-style:italic">Bizzington</em></h1>
        <p class="muted" style="margin-top:8px">A town where you get a stall, a wallet, and every mistake is made with money that isn't real.</p>
      </div>
      ${say('nana', 'I am shutting up my shop at the end of the road, and the smallest stall on Market Row is going spare. What shall I call you?')}
      <div class="card stack">
        <label class="eyebrow" for="nm">Your name</label>
        <input id="nm" data-field="name" value="${esc(draft.name || '')}" placeholder="Type your name"
          style="padding:13px 14px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-size:16px;font-weight:700;width:100%">
        <button class="btn wide" data-act="obNext">That's me →</button>
      </div>`);
  }
  if (step === 1) {
    return shell(`
      ${say('pip', `Good to meet you, <b>${esc(draft.name)}</b>. How old are you? It changes what the street shows you — no debt and no market before they're taught.`)}
      <div class="card stack">
        <button class="opt" data-act="obBand" data-arg="sprout"><b>8 to 10</b><br><span class="small muted">Sprout — coins, earning, saving. Nothing can go negative.</span></button>
        <button class="opt" data-act="obBand" data-arg="builder"><b>11 and up</b><br><span class="small muted">Builder — budgets, the bank, the Exchange, a shop of your own.</span></button>
      </div>`);
  }
  return shell(`
    ${say('pip', 'Last one. Which money do you count in? You can change it later — the town converts.')}
    <div class="card stack">
      ${Object.keys(CURRENCIES).map((k) => `<button class="opt" data-act="obCur" data-arg="${k}">
        <b style="font-size:18px">${CURRENCIES[k].sign}</b> &nbsp;${CURRENCIES[k].name}
        <span class="small muted"> · ${new Intl.NumberFormat(CURRENCIES[k].locale).format(1200000)}</span></button>`).join('')}
    </div>`);
}

/* ══ HOME — the town ══════════════════════════════════════════════════ */
export function viewHome() {
  const s = S();
  const nw = sim.netWorth(s);
  const due = sim.payDue(s);
  const d = sim.daysToPay(s);
  const g = s.money.goals.find((x) => !x.done);
  const sprout = s.child.band === 'sprout';

  const strip = sprout
    ? `<div class="strip two">
        <div><div class="k">Wallet</div><div class="v">${money(s.money.wallet)}</div></div>
        <div><div class="k">Saved up</div><div class="v">${money(s.money.jars.save + s.money.jars.grow)}</div></div>
       </div>`
    : `<div class="strip">
        <div><div class="k">Wallet</div><div class="v">${money(s.money.wallet)}</div></div>
        <div><div class="k">Jars</div><div class="v">${money(s.money.jars.spend + s.money.jars.save + s.money.jars.grow + s.money.jars.give)}</div></div>
        <div><div class="k">Invested</div><div class="v">${money(s.money.bank.balance + sim.portfolioValue(s))}</div></div>
        <div><div class="k">Net worth</div><div class="v" style="color:var(--action)">${money(nw)}</div></div>
       </div>`;

  const today = nextThing(s);

  return `<div class="stack">
    ${strip}
    <div class="town">
      <div class="town-scroll">${townSVG(s)}</div>
      <div class="town-cap"><span>🔥 ${s.streak.days.length}-day streak</span><span>Level ${s.learn.level} · ${rankFor(s.learn.level)}</span></div>
    </div>

    ${due
      ? `<div class="card" style="border-color:var(--treasure);background:var(--treasure-tint)">
          <div class="row"><div class="grow">
            <div class="eyebrow" style="color:var(--treasure-deep)">The bell is ringing</div>
            <h3 style="margin:2px 0 4px">It's pay day in Bizzington</h3>
            <p class="small" style="color:var(--treasure-deep)">Wages in, bills out, jars filled. The whole street is busy.</p>
          </div></div>
          <button class="btn wide" style="margin-top:12px" data-act="payday">🔔 Ring the bell</button>
        </div>`
      : `<div class="card row">
          <div class="grow"><div class="eyebrow">Pay day</div>
          <p style="font-weight:700">${d === 0 ? 'Later today' : d + ' day' + (d === 1 ? '' : 's') + ' — ' + weekday(s.money.nextPay)}</p>
          <p class="small muted">${money(s.money.wage)} in, ${money(s.money.bills.reduce((t, b) => t + b.amt, 0))} straight back out.</p></div>
          <button class="btn ghost sm" data-act="nav" data-arg="money">Check the jars</button>
        </div>`}

    <div class="grid2">
      <button class="card" data-act="postbox" style="text-align:left;border-color:${s.postbox.answered ? 'var(--line)' : 'var(--spend)'}">
        <div class="row"><span style="font-size:26px">📬</span><div class="grow">
          <div class="eyebrow">The postbox</div>
          <p style="font-weight:800">${s.postbox.answered ? 'Emptied for today' : "There's a letter"}</p>
          <p class="small muted">${s.postbox.answered ? 'Another one tomorrow.' : 'One a day. Thirty seconds.'}</p>
        </div></div>
      </button>
      <button class="card" data-act="${today.act}" data-arg="${today.arg || ''}" style="text-align:left">
        <div class="row"><span style="font-size:26px">${today.em}</span><div class="grow">
          <div class="eyebrow">Today</div>
          <p style="font-weight:800">${esc(today.title)}</p>
          <p class="small muted">${esc(today.sub)}</p>
        </div></div>
      </button>
    </div>

    ${g ? `<div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">In the Build Yard</div>
        <h3 style="margin:2px 0">${esc(g.name)}</h3></div>
        <div style="text-align:right"><div class="big">${money(g.saved)}</div>
        <div class="small muted">of ${money(g.target)}</div></div></div>
      <div class="bar" style="margin-top:10px"><i style="width:${Math.min(100, g.saved / g.target * 100)}%"></i></div>
      <p class="small muted" style="margin-top:7px">${g.saved >= g.target ? 'Finished — the roof is on.' : sim.weeksToGoal(s, g) + ' more pay days at your current Save rate.'}</p>
    </div>` : ''}

    ${say('pip', hometalk(s))}
  </div>`;
}

function hometalk(s) {
  const lv = s.learn.level;
  if (lv < 2) return "Your stall's open. Learn a card or two and I'll show you the shed round the back — four jars, and they change everything.";
  if (lv < 3) return "Shed's yours. Split the money the moment it lands, before it has a chance to become one big pile.";
  if (lv < 4) return 'Build Yard next. Name something you want and it starts going up floor by floor. Fair warning: raid the fund and the scaffolding comes back down.';
  if (lv < 5) return "Bank's open. The clock strikes every pay day and a little interest lands. Boring. Boring is the point.";
  if (lv < 6) return "Exchange is open — Bo and Bea are already arguing. Take money from the Grow jar, not the Spend jar.";
  return "Nana's shutters came off. That's your shop now. Buy low, sell for more than it cost you, and count the difference honestly.";
}

function nextThing(s) {
  const card = ALL_CARDS.find((c) => !s.learn.done[c.id]);
  if (card) return { em: '📗', title: card.title, sub: 'Three minutes with ' + CAST[card.who].name + '.', act: 'card', arg: card.id };
  if (!s.money.goals.length && s.learn.level >= 3) return { em: '🏗️', title: 'Name a goal', sub: 'It becomes a building you can watch go up.', act: 'nav', arg: 'money' };
  return { em: '🎮', title: 'Play a round', sub: 'Wages, straight into the same wallet.', act: 'nav', arg: 'arcade' };
}

/* ══ LEARN ════════════════════════════════════════════════════════════ */
export function viewLearn() {
  const s = S();
  const bar = sim.xpBar(s);
  const openCard = s.learn.openCard && ALL_CARDS.find((c) => c.id === s.learn.openCard);
  if (openCard) return viewCard(openCard);

  return `<div class="stack">
    <div class="card">
      <div class="row"><div class="grow">
        <div class="eyebrow">Level ${s.learn.level} · ${rankFor(s.learn.level)}</div>
        <h2 style="margin:2px 0 0">${s.learn.xp} XP</h2></div>
        <div class="small muted" style="text-align:right">${bar.need} to the<br>next building</div></div>
      <div class="bar" style="margin-top:10px"><i style="width:${bar.pct * 100}%"></i></div>
    </div>
    ${say('pip', 'Every card ends with one question. Get it right and the town grows. Get it wrong and I tell you why — that counts too.')}
    <div class="chapts">
      ${CHAPTERS.map((ch) => {
        const done = ch.cards.filter((c) => s.learn.done[c.id]).length;
        return `<div class="card pad0">
          <div style="padding:14px 16px;display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line-soft)">
            <span style="font-size:24px">${ch.em}</span>
            <div class="grow"><h3 style="font-size:18px">${esc(ch.title)}</h3>
            <p class="small muted">${esc(ch.blurb)}</p></div>
            <span class="pill ${done === ch.cards.length ? 'grow' : ''}">${done}/${ch.cards.length}</span>
          </div>
          ${ch.cards.map((c) => {
            const d = s.learn.done[c.id];
            return `<button data-act="card" data-arg="${c.id}" style="display:flex;gap:11px;align-items:center;width:100%;padding:11px 16px;border-top:1px solid var(--line-soft)">
              <span style="width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;font-size:12px;font-weight:800;background:${d ? 'var(--grow)' : 'var(--tint)'};color:${d ? '#fff' : 'var(--muted)'}">${d ? '✓' : ''}</span>
              <span class="grow" style="font-weight:700;font-size:14.5px">${esc(c.title)}</span>
              <span class="small muted">${CAST[c.who].name}</span></button>`;
          }).join('')}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function viewCard(c) {
  const s = S();
  const st = s.learn.drill;
  return `<div class="stack">
    <button class="small muted" data-act="closeCard">← All chapters</button>
    <div class="card stack">
      <div class="eyebrow">${esc(CHAPTERS.find((x) => x.id === c.ch).title)}</div>
      <h2>${esc(c.title)}</h2>
      ${say(c.who, c.teach)}
      <div style="background:var(--tint);border-radius:var(--r-md);padding:12px 14px;font-size:14px;border-left:3px solid var(--action)">
        <span class="eyebrow">For instance</span><br>${esc(c.eg)}</div>
    </div>
    <div class="card stack">
      <div class="eyebrow">One question</div>
      <h3 style="font-size:18px">${esc(c.drill.q)}</h3>
      <div class="stack" style="gap:8px">
        ${(() => { const d = shuffledDrill(c); return d.opts.map((o, i) => {
          let k = '';
          if (st && st.card === c.id) k = (i === d.answer) ? ' ok' : (i === st.pick ? ' no' : '');
          return `<button class="opt${k}" data-act="answer" data-arg="${i}" ${st && st.card === c.id ? 'disabled' : ''}>
            <span class="k">${'ABCD'[i]}</span>${esc(o)}</button>`;
        }).join(''); })()}
      </div>
      ${st && st.card === c.id ? `<div style="background:${st.right ? 'var(--grow-tint)' : 'var(--spend-tint)'};border-radius:var(--r-md);padding:12px 14px;font-size:14px">
          <b>${st.right ? 'That’s it.' : 'Not quite — and this is the useful bit:'}</b> ${esc(c.drill.why)}</div>
        <button class="btn wide" data-act="cardDone" data-arg="${c.id}">Take it back to town →</button>` : ''}
    </div>
  </div>`;
}

/* ══ MONEY ════════════════════════════════════════════════════════════ */
export function viewMoney() {
  const s = S();
  const lv = s.learn.level;
  const subs = [
    { k: 'wallet', n: 'Wallet', lv: 1 }, { k: 'jars', n: 'Jars', lv: 2 }, { k: 'goals', n: 'Goals', lv: 3 },
    { k: 'bank', n: 'Bank', lv: 4 }, { k: 'portfolio', n: 'Exchange', lv: 5 }, { k: 'business', n: 'Shop', lv: 6 },
  ];
  let sub = s.sub;
  if (!subs.find((x) => x.k === sub && lv >= x.lv)) sub = 'wallet';

  const strip = `<div class="substrip" style="display:flex;gap:7px;flex-wrap:wrap;padding:11px;background:var(--tint);border-radius:var(--r-md);border:1px solid var(--line-soft)">
    ${subs.map((x) => {
      const open = lv >= x.lv;
      return `<button data-act="${open ? 'sub' : 'locked'}" data-arg="${open ? x.k : x.lv}"
        style="padding:7px 12px;border-radius:999px;font-size:13px;font-weight:800;border:1px ${open ? 'solid' : 'dashed'} var(--line);
        background:${sub === x.k ? 'var(--action)' : (open ? 'var(--surface)' : 'transparent')};
        color:${sub === x.k ? 'var(--action-ink)' : (open ? 'var(--ink)' : 'var(--muted)')}">
        ${open ? '' : '🔒 '}${x.n}${open ? '' : ` <span style="font-family:var(--mono);font-size:11px">L${x.lv}</span>`}</button>`;
    }).join('')}</div>`;

  const body = sub === 'jars' ? viewJars() : sub === 'goals' ? viewGoals()
    : sub === 'bank' ? viewBank() : sub === 'portfolio' ? viewExchange()
    : sub === 'business' ? viewBusiness() : viewWallet();

  return `<div class="stack">${strip}${body}</div>`;
}

function viewWallet() {
  const s = S();
  return `<div class="stack">
    <div class="card">
      <div class="eyebrow">In your pocket</div>
      <div class="big" style="font-size:38px;color:var(--treasure-deep)">${money(s.money.wallet)}</div>
      <p class="small muted">${s.child.band === 'sprout' ? 'This can never go below zero — debt comes later, when it’s taught.' : 'Everything below is dated, because a statement you can’t read is a statement you can’t argue with.'}</p>
    </div>
    <div class="card pad0">
      <div style="padding:12px 16px;border-bottom:1px solid var(--line-soft)" class="eyebrow">Every movement</div>
      ${s.money.txns.slice(0, 14).map((t) => `<div style="display:flex;gap:10px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line-soft)">
        <span style="width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:13px;flex:0 0 auto;background:${t.kind === 'in' ? 'var(--grow-tint)' : 'var(--spend-tint)'};color:${t.kind === 'in' ? 'var(--grow)' : 'var(--spend)'}">${t.kind === 'in' ? '↓' : '↑'}</span>
        <span class="grow" style="font-weight:650;font-size:14px">${esc(t.label)}<br><span class="small muted">${shortDate(t.t)}</span></span>
        <span class="tabnum" style="font-weight:800;color:${t.kind === 'in' ? 'var(--grow)' : 'var(--ink)'}">${t.kind === 'in' ? '+' : '−'}${money(t.amt)}</span>
      </div>`).join('')}
    </div>
  </div>`;
}

const JARMETA = { spend: ['Spend', 'var(--spend)', 'for now'], save: ['Save', 'var(--save)', 'for soon'], grow: ['Grow', 'var(--grow)', 'for far away'], give: ['Give', 'var(--give)', 'for someone else'] };
function viewJars() {
  const s = S(), j = s.money.jars, r = s.money.rules;
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
            <button class="btn ghost sm" style="padding:5px 8px" data-act="jarOut" data-arg="${k}" aria-label="Take out of ${JARMETA[k][0]}">−</button>
            <button class="btn sm" style="padding:5px 8px" data-act="jarIn" data-arg="${k}" aria-label="Put into ${JARMETA[k][0]}">+</button>
          </div>
        </div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:12px">Buttons move ${money(price(2))} at a time, out of your wallet (${money(s.money.wallet)}).</p>
    </div>
    <div class="card stack">
      <div class="eyebrow">Pay-day rule — this fires by itself on Friday</div>
      ${Object.keys(JARMETA).map((k) => `<div class="row">
        <span style="width:58px;font-weight:800;font-size:13.5px;color:${JARMETA[k][1]}">${JARMETA[k][0]}</span>
        <div class="grow bar"><i style="width:${r[k]}%;background:${JARMETA[k][1]}"></i></div>
        <div class="stepper"><button data-act="rule" data-arg="${k}:-5">−</button>
        <span class="n">${r[k]}%</span>
        <button data-act="rule" data-arg="${k}:5">+</button></div>
      </div>`).join('')}
      <p class="small ${tot === 100 ? 'muted' : ''}" style="${tot === 100 ? '' : 'color:var(--spend);font-weight:700'}">
        ${tot === 100 ? 'Adds to 100%. Good.' : 'Adds to ' + tot + '%. It has to be 100 — the money has to go somewhere.'}</p>
    </div>
  </div>`;
}

function viewGoals() {
  const s = S();
  return `<div class="stack">
    ${say('pip', 'Name the thing and price it. Dividing turns a wish into a date — and the yard shows the date, not encouragement.')}
    <div class="card stack">
      <div class="eyebrow">Start something</div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <input data-field="goalName" placeholder="What do you want?" value=""
          style="flex:2 1 150px;min-width:0;padding:11px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <input data-field="goalAmt" inputmode="numeric" placeholder="${sign()}" value=""
          style="flex:1 1 90px;min-width:0;padding:11px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <button class="btn" data-act="addGoal">Add</button>
      </div>
    </div>
    ${s.money.goals.length === 0 ? `<div class="card" style="text-align:center;padding:26px">
        <div style="font-size:34px">🏗️</div><p class="muted" style="margin-top:6px">The yard is empty. Nothing is being built.</p></div>` : ''}
    ${s.money.goals.map((g) => {
      const p = Math.min(1, g.saved / g.target);
      return `<div class="card">
        <div class="row"><div class="grow"><h3 style="font-size:18px">${esc(g.name)}${g.done ? ' <span class="pill grow">built</span>' : ''}</h3>
          <p class="small muted">${g.done ? 'Finished.' : sim.weeksToGoal(s, g) + ' pay days at your Save rate'}</p></div>
          <div style="text-align:right"><div class="big" style="font-size:20px">${money(g.saved)}</div>
          <div class="small muted">of ${money(g.target)}</div></div></div>
        <div class="bar" style="margin-top:10px"><i style="width:${p * 100}%;background:var(--save)"></i></div>
        <div class="row" style="margin-top:11px;gap:8px;flex-wrap:wrap">
          <button class="btn sm" data-act="fundGoal" data-arg="${g.id}" ${s.money.jars.save <= 0 ? 'disabled' : ''}>Put in ${money(Math.min(price(5), s.money.jars.save))} from Save</button>
          <button class="btn ghost sm" data-act="raidGoal" data-arg="${g.id}" ${g.saved <= 0 ? 'disabled' : ''}>Take it back</button>
        </div>
        ${g.saved > 0 && !g.done ? '<p class="small muted" style="margin-top:8px">Taking it back is allowed. The scaffolding comes down on the town, though — that part is the lesson.</p>' : ''}
      </div>`;
    }).join('')}
  </div>`;
}

function viewBank() {
  const s = S(), b = s.money.bank;
  const proj = [1, 2, 5, 10].map((y) => ({ y, v: Math.round(Math.max(b.balance, price(50)) * Math.pow(1 + b.rate, y * 52)) }));
  return `<div class="stack">
    ${say('nana', 'Interest is rent on money. Leave it here and the bank pays you rent for using it. Borrow, and you pay. Same idea — the only question is which side you are standing on.')}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">In the vault</div>
        <div class="big" style="font-size:32px;color:var(--save)">${money(b.balance)}</div></div>
        <div style="text-align:right"><div class="eyebrow">Every pay day</div>
        <div class="big" style="font-size:20px">${(b.rate * 100).toFixed(0)}%</div></div></div>
      <p class="small muted" style="margin-top:8px">Next Friday this pays <b>${money(Math.round(b.balance * b.rate))}</b> — that is ${money(b.balance)} × ${(b.rate * 100).toFixed(0)}%, shown rather than hidden.</p>
      <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap">
        <button class="btn sm" data-act="bankIn" ${s.money.jars.save <= 0 ? 'disabled' : ''}>Deposit ${money(Math.min(price(10), s.money.jars.save))} from Save</button>
        <button class="btn ghost sm" data-act="bankOut" ${b.balance <= 0 ? 'disabled' : ''}>Take some out</button>
      </div>
    </div>
    <div class="card">
      <div class="eyebrow">The snowball, on this balance</div>
      <div class="grid3" style="margin-top:8px">
        ${proj.map((p) => `<div style="background:var(--tint);border-radius:var(--r-md);padding:10px 12px">
          <div class="small muted">${p.y} year${p.y > 1 ? 's' : ''}</div>
          <div style="font-weight:800;font-variant-numeric:tabular-nums">${money(p.v)}</div></div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:9px">Bizzington's own made-up rate compounding weekly, not a real bank's and not a forecast. Real rates go in with a source next to them or they don't go in.</p>
    </div>
  </div>`;
}

function viewExchange() {
  const s = S();
  if (!s.market.cup) s.market.cup = { cash: 0, units: {} };
  const c = s.market.cup, step = s.market.step;
  const val = sim.portfolioValue(s);
  const held = ASSETS.filter((a) => (c.units[a.id] || 0) > 0.0001);
  const spread = held.length;
  return `<div class="stack">
    ${say(s.market.lastMove >= 0 ? 'bo' : 'bea', s.market.lastMove >= 0
      ? 'Up on the week! I said it would be. I say that every week.'
      : 'Down on the week. I said so. I also say that every week — one of us is always right and neither of us knows.')}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Your holdings</div>
        <div class="big" style="font-size:30px;color:var(--grow)">${money(val)}</div></div>
        <div style="text-align:right"><div class="eyebrow">Grow jar</div>
        <div class="big" style="font-size:20px">${money(s.money.jars.grow)}</div></div></div>
      <p class="small muted" style="margin-top:6px">${spread === 0 ? 'Nothing owned yet.' : spread === 1 ? 'One thing. Your whole week now depends on somebody else’s Tuesday.' : spread + ' different things. Bad news in one can no longer sink the lot.'}</p>
    </div>
    ${ASSETS.map((a) => {
      const series = s.market.series[a.id];
      const p = series[step], prev = series[Math.max(0, step - 1)];
      const mv = (p - prev) / prev;
      const u = c.units[a.id] || 0;
      return `<div class="card">
        <div class="row"><span style="font-size:22px">${a.em}</span>
          <div class="grow"><b style="font-size:15px">${esc(a.name)}</b>
          <p class="small muted">${esc(a.desc)}</p></div>
          <div style="text-align:right"><div style="font-weight:800;font-variant-numeric:tabular-nums">${money(p)}</div>
          <div class="small" style="color:${mv >= 0 ? 'var(--grow)' : 'var(--spend)'};font-weight:700">${mv >= 0 ? '▲' : '▼'} ${Math.abs(mv * 100).toFixed(1)}%</div></div>
        </div>
        ${sparkline(series.slice(0, step + 1), 300, 40, mv >= 0 ? 'var(--grow)' : 'var(--spend)')}
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:4px">
          <span class="pill">${u > 0 ? 'you hold ' + money(u * p) : 'not held'}</span>
          <span class="grow"></span>
          <button class="btn sm" data-act="buy" data-arg="${a.id}" ${s.money.jars.grow < price(5) ? 'disabled' : ''}>Buy ${money(price(5))}</button>
          <button class="btn ghost sm" data-act="sell" data-arg="${a.id}" ${u <= 0 ? 'disabled' : ''}>Sell all</button>
        </div>
      </div>`;
    }).join('')}
    <div class="card">
      <div class="eyebrow">⏳ The Time Machine</div>
      <p class="small muted" style="margin:4px 0 10px">The only place in Bizzington where the clock is compressed — because compounding cannot be felt at human speed, and a child who never feels it hasn’t learned it.</p>
      <div class="grid3">
        ${[1, 5, 10, 30].map((y) => `<div style="background:var(--tint);border-radius:var(--r-md);padding:10px 12px">
          <div class="small muted">in ${y} year${y > 1 ? 's' : ''}</div>
          <div style="font-weight:800;font-variant-numeric:tabular-nums">${money(Math.round(val * Math.pow(1.07, y)))}</div></div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:9px">Bizzington's own simulated rate. Not advice, not a forecast, and not any real market.</p>
    </div>
  </div>`;
}

function viewBusiness() {
  return `<div class="stack">
    ${say('nana', 'Shutters are off. Buy for less than you sell for, and count the difference honestly — that difference is the only thing a business actually is.')}
    <div class="card" style="text-align:center;padding:28px">
      <div style="font-size:38px">🏪</div>
      <h3 style="margin:8px 0 4px">Bizz &amp; Co opens in the next build</h3>
      <p class="muted small">Stock, price, spoilage, and the week you discover that profit and cash are not the same thing. Spec: docs/01 §4.6.</p>
    </div>
  </div>`;
}

/* ══ STORE ════════════════════════════════════════════════════════════ */
export function viewStore() {
  const s = S();
  return `<div class="stack">
    ${say('mags', 'Everything here is lovely and none of it is necessary. I have written what else the money could have been under each price, which my old boss said was commercial suicide.')}
    ${SHOP.map((it) => {
      const p = price(it.units);
      const owned = s.shop.owned.includes(it.id);
      const weeks = Math.max(1, Math.round(p / Math.max(1, s.money.wage * s.money.rules.spend / 100)));
      const grown = Math.round(p * Math.pow(1.07, 10));
      return `<div class="card">
        <div class="row"><span style="font-size:28px">${it.em}</span>
          <div class="grow"><b style="font-size:15.5px">${esc(it.name)}</b>
            <p class="small muted">${esc(it.desc)}</p></div>
          <div style="text-align:right"><div class="big" style="font-size:19px">${money(p)}</div></div>
        </div>
        <div style="background:var(--treasure-tint);color:var(--treasure-deep);border-radius:var(--r-md);padding:9px 12px;margin-top:10px;font-size:13px;font-weight:650">
          That's <b>${weeks} week${weeks > 1 ? 's' : ''}</b> of your Spend jar — or <b>${money(grown)}</b> in ten years if it went in the Grow jar instead.
        </div>
        <div class="row" style="margin-top:10px">
          <span class="grow"></span>
          ${owned ? '<span class="pill grow">yours</span>'
            : `<button class="btn sm" data-act="buyItem" data-arg="${it.id}" ${s.money.wallet + s.money.jars.spend < p ? 'disabled' : ''}>Buy it anyway</button>`}
        </div>
      </div>`;
    }).join('')}
    <p class="small muted" style="text-align:center">Nothing here costs real money, and there is no path from this screen to a payment form. That is a rule, not an oversight.</p>
  </div>`;
}

/* ══ PROGRESS ═════════════════════════════════════════════════════════ */
export function viewProgress() {
  const s = S();
  const vals = s.history.map((h) => h.v);
  const scams = s.postbox.log.filter((l) => l.scam && l.safe).length;
  const scamsAll = s.postbox.log.filter((l) => l.scam).length;
  return `<div class="stack">
    <div class="card">
      <div class="eyebrow">Net worth, every decision so far</div>
      <div class="big" style="font-size:32px;color:var(--action)">${money(sim.netWorth(s))}</div>
      ${sparkline(vals.length > 1 ? vals : [0, sim.netWorth(s)], 300, 54, 'var(--action)')}
      <p class="small muted">The one chart a card app can't draw: it only has your last statement, and this has every decision since you opened your stall.</p>
    </div>
    <div class="grid2">
      <div class="card"><div class="eyebrow">Streak</div><div class="big">🔥 ${s.streak.days.length}</div><p class="small muted">days in a row</p></div>
      <div class="card"><div class="eyebrow">Letters answered</div><div class="big">${s.postbox.log.length}</div><p class="small muted">${scamsAll ? scams + ' of ' + scamsAll + ' scams spotted' : 'no scams yet'}</p></div>
    </div>
    <div class="card stack">
      <div class="eyebrow">For the grown-up — what they decided</div>
      ${decisions(s).map((d) => `<div class="row" style="align-items:flex-start;gap:9px">
        <span style="font-size:15px">${d.em}</span><p class="small grow">${d.t}</p></div>`).join('')}
      <p class="small muted">Observation, never a grade on the child. The simulator is a window into instincts no quiz gives you.</p>
    </div>
    <div class="card stack">
      <div class="eyebrow">Prototype tools</div>
      <p class="small muted">Pay day is a real week away. In the shipping build the clock is server-authoritative so it can't be advanced by moving the device clock — here, for review, you can push it:</p>
      <button class="btn ghost wide" data-act="skipWeek">⏩ Jump to next pay day</button>
      <button class="btn ghost wide" data-act="wipe">Start the town over</button>
    </div>
  </div>`;
}

function decisions(s) {
  const out = [];
  const spentOnWants = s.money.txns.filter((t) => t.cat === 'shop').length;
  if (spentOnWants) out.push({ em: '🛍️', t: `Bought ${spentOnWants} thing${spentOnWants > 1 ? 's' : ''} from Mags after seeing what else the money could have been.` });
  const raids = s.money.txns.filter((t) => /Took back from/.test(t.label)).length;
  if (raids) out.push({ em: '🏗️', t: `Raided a goal fund ${raids} time${raids > 1 ? 's' : ''} — worth asking what it was for.` });
  const scam = s.postbox.log.filter((l) => l.scam && !l.safe).length;
  if (scam) out.push({ em: '🛡️', t: `Fell for ${scam} scam letter${scam > 1 ? 's' : ''} here, with play money. Cheapest place in the world to learn it.` });
  if (s.money.jars.grow > 0) out.push({ em: '🌱', t: `Has ${money(s.money.jars.grow)} in the Grow jar — money set aside for far away.` });
  if (s.money.rules.save + s.money.rules.grow >= 50) out.push({ em: '📊', t: `Set the pay-day rule to keep ${s.money.rules.save + s.money.rules.grow}% back. That is their choice, not a default.` });
  if (!out.length) out.push({ em: '🌤️', t: 'Nothing yet — a few pay days will fill this in.' });
  return out;
}

/* ══ COLLECTION ═══════════════════════════════════════════════════════ */
export function viewCollection() {
  const s = S();
  return `<div class="stack">
    <div class="card">
      <div class="eyebrow">Badges</div>
      <div class="grid3" style="margin-top:10px">
        ${Object.keys(BADGES).map((k) => {
          const b = BADGES[k], has = s.badges.includes(k);
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
      <p class="small muted" style="margin:4px 0 10px">Real notes and coins, unlocked by play — a quiet way to teach that money is an agreement, not a law of nature.</p>
      <div class="grid3">
        ${Object.keys(CURRENCIES).map((k, i) => {
          const has = i === 0 || s.learn.level > i;
          return `<div style="background:var(--tint);border-radius:var(--r-md);padding:12px;text-align:center;opacity:${has ? 1 : .4}">
            <div style="font-size:22px;font-weight:800">${has ? CURRENCIES[k].sign : '🔒'}</div>
            <div style="font-weight:700;font-size:12.5px">${has ? esc(CURRENCIES[k].name) : 'level ' + (i + 1)}</div></div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}
