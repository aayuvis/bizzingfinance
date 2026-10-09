/* market40.mjs — the Market Game, asserted.
   Run: node test/market40.mjs */
import { COMPANIES, SECTORS, validate as vCompanies } from '../content/companies.js';
import { validate as vEvents, ALL as EVENTS } from '../content/events.js';
import { simulate, priceSeries, totalReturnSeries, explainYear, GAME_YEARS } from '../src/gamemarket.js';
import { annualReport, shareholderLetter } from '../src/reports.js';

let fails = 0, n = 0;
const ok = (t, p, d) => { n++; if (!p) fails++; console.log(`${p ? '  ok  ' : 'FAIL  '}${t}${d ? '   ' + d : ''}`); };
const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
const cagr = (e, y) => (Math.pow(e / 100, 1 / y) - 1) * 100;

console.log(`\nThe Market Game · ${COMPANIES.length} companies × ${GAME_YEARS} years\n${'─'.repeat(60)}`);

ok('the register validates', vCompanies().length === 0, vCompanies().join('; '));
ok('the events validate', vEvents().length === 0, vEvents().join('; '));
ok('every sector has enough to compare within', SECTORS.every((s) =>
  COMPANIES.filter((c) => c.sector === s.id).length >= 4));

const SEEDS = [20260830, 7, 4242, 999, 31337, 8080, 121, 55555];
const sims = SEEDS.map((s) => ({ s, sim: simulate(s, GAME_YEARS) }));

/* ── outcomes must be plausible, not lottery tickets ── */
{
  const bests = [], meds = [], worsts = [];
  sims.forEach(({ sim }) => {
    const tr = COMPANIES.map((c) => cagr(totalReturnSeries(sim, c.id).at(-1), GAME_YEARS)).sort((a, b) => a - b);
    worsts.push(tr[0]); meds.push(tr[20]); bests.push(tr[tr.length - 1]);
  });
  ok('the best company over 40 years is good, not absurd',
     med(bests) > 10 && med(bests) < 25, `median best ${med(bests).toFixed(1)}%/yr`);
  ok('the median company beats nothing much', med(meds) > 3 && med(meds) < 14,
     `median median ${med(meds).toFixed(1)}%/yr`);
  ok('and some companies genuinely lose money for forty years', med(worsts) < 2,
     `median worst ${med(worsts).toFixed(1)}%/yr`);
}

/* ── the whole point: one world, so things move for reasons ──
   Held across all eight worlds against the same 85% bar (it once sampled the first world only,
   and when the generator's seeding was fixed that one world became a tail case at 82%, while
   60 worlds pooled sit at 95%). */
{
  const rateSensitive = 'towers', rateProof = 'household';   /* 2.9 vs 0.4 rate sensitivity */
  let hitYears = 0, sensFell = 0, worlds = 0;
  for (const { sim } of sims) {
    const rows = sim.years[rateSensitive], safe = sim.years[rateProof];
    let h = 0;
    for (let y = 1; y < GAME_YEARS; y++) {
      if (rows[y].rate - rows[y - 1].rate > 0.5) {
        h++;
        const a = rows[y].mult / rows[y - 1].mult - 1;
        const b = safe[y].mult / safe[y - 1].mult - 1;
        if (a < b) sensFell++;
      }
    }
    hitYears += h; if (h > 2) worlds++;
  }
  ok('when rates rise, the indebted one is marked down harder than the safe one',
     worlds === sims.length && sensFell / hitYears > 0.85,
     `${sensFell}/${hitYears} rate rises across ${sims.length} worlds`);
}

/* ── pricing power decides who survives inflation ── */
{
  /* Compare how much of its OWN base margin each kept, averaged over all
     forty years. The first version compared year 40 against year 0, which
     measures one year's inflation and a decade of event noise rather than the
     squeeze — and correctly failed. */
  const keep = (rows, base) => rows.reduce((t, r) => t + r.margin / base, 0) / rows.length;
  const gaps = sims.map(({ sim }) => {
    const strong = keep(sim.years['household'], 0.18);    /* pricing 0.85 */
    const weak = keep(sim.years['chem'], 0.10);           /* pricing 0.35 */
    return strong - weak;
  });
  ok('a company that can raise prices keeps more of its margin than one that cannot',
     med(gaps) > 0.03, `kept ${(med(gaps) * 100).toFixed(0)}% more of base margin, averaged over 40 years`);
}

/* ── dividends are a real part of the answer ── */
{
  const { sim } = sims[0];
  const gaps = COMPANIES.map((c) => cagr(totalReturnSeries(sim, c.id).at(-1), GAME_YEARS)
                                  - cagr(priceSeries(sim, c.id).at(-1), GAME_YEARS));
  ok('dividends add return, and more for the payers', Math.max(...gaps) > 2 && Math.min(...gaps) >= -0.01,
     `${Math.min(...gaps).toFixed(1)} to ${Math.max(...gaps).toFixed(1)} points a year`);
  const payers = COMPANIES.filter((c) => c.dna.payout > 0.5).map((c, i) => gaps[COMPANIES.indexOf(c)]);
  const hoarders = COMPANIES.filter((c) => c.dna.payout === 0).map((c) => gaps[COMPANIES.indexOf(c)]);
  ok('and the ones that pay nothing add nothing', med(payers) > med(hoarders),
     `payers +${med(payers).toFixed(1)} vs non-payers +${med(hoarders).toFixed(1)}`);
}

/* ── events happen, land, and can be explained ── */
{
  const { sim } = sims[0];
  const total = sim.calendar.flat().length;
  ok('events are generated across all forty years', total > 600 && total < 2500,
     `${total} events, ${(total / GAME_YEARS).toFixed(1)} a year`);
  const levels = new Set(sim.calendar.flat().map((e) => e.scope.kind));
  ok('at all four levels', levels.size === 4, [...levels].join(', '));
  let explained = 0;
  COMPANIES.forEach((c) => {
    for (let y = 1; y < GAME_YEARS; y++) {
      const x = explainYear(sim, c.id, y);
      if (Math.abs(x.move) > 0.1 && x.reasons.length === 0) explained--;
      else explained++;
    }
  });
  ok('every meaningful move has a stated reason', explained === COMPANIES.length * (GAME_YEARS - 1),
     `${explained} of ${COMPANIES.length * (GAME_YEARS - 1)}`);
}

/* ── the reports are readable and never nonsense ── */
{
  const { sim } = sims[0];
  let badPE = 0, letters = 0, omissions = 0;
  COMPANIES.forEach((c) => {
    for (let y = 0; y < GAME_YEARS; y += 7) {
      const R = annualReport(sim, c.id, y);
      const pe = R.ratios.find((x) => x.k.startsWith('What people pay'));
      if (sim.years[c.id][y].net <= 0 && pe.v !== 'n/a') badPE++;
      const L = shareholderLetter(sim, c.id, y);
      if (L.open && L.body.length >= 2 && L.close) letters++;
      omissions += L.omissions.length;
    }
  });
  ok('no multiple is printed on a loss', badPE === 0, `${badPE} bad`);
  ok('every letter is complete', letters === COMPANIES.length * Math.ceil(GAME_YEARS / 7),
     `${letters} letters generated`);
  ok('and the spin is caught and listed', omissions > 40, `${omissions} omissions flagged`);
}

/* ── determinism ── */
{
  const a = simulate(4242, GAME_YEARS).years['bigbox'].at(-1).value;
  const b = simulate(4242, GAME_YEARS).years['bigbox'].at(-1).value;
  const c = simulate(4243, GAME_YEARS).years['bigbox'].at(-1).value;
  ok('a campaign replays exactly', a === b);
  ok('a different seed is a different forty years', a !== c);
}

/* S4 · clearly fictional: no description carries a real-world count or scale that
   would let a reader name the real firm behind it */
{
  const tells = COMPANIES.filter((c) => /thousand|million|billion|trillion|\b\d{3,}\b|Seattle|Cupertino|Bentonville/i.test([c.what, c.how, c.who, c.risk, c.model].join(' ')));
  ok('no company description carries a real-world count, scale or home town', tells.length === 0, tells.map((c) => c.name).join(', '));
  const tick = COMPANIES.map((c) => c.ticker);
  ok('every ticker is unique and none is a legal form', new Set(tick).size === tick.length && !tick.some((t) => /^(LLC|INC|PLC|LTD)$/.test(t)));
}

/* ── docs/12 §2.7 (T2): the flagship, played — every decade, the key, the score ── */
{
  globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
  globalThis.Image = class {};
  const { R } = await import('../src/runtime.js');
  const S = await import('../src/sim.js');
  const MG = await import('../src/marketgame.js');
  const { PESTEL } = await import('../content/events.js');
  R.s = S.newState(); R.s.kids.push(S.newChild('Asha', 'builder', 'INR')); R.render = () => {};
  const c = R.s.kids[0];

  /* the year-0 crash: the first year of the first decade has no year before it */
  const x0 = explainYear(sims[0].sim, COMPANIES[0].id, 0);
  ok('explainYear on year 0 is "no move, no reasons" — the same shape as any year, never []', x0 && x0.move === 0 && Array.isArray(x0.reasons) && !Array.isArray(x0), JSON.stringify(x0).slice(0, 60));

  /* every decade starts, plays every year on screen, and finishes */
  /* one game played decade after decade, as a child plays it: the score must start again each time */
  const decades = [], tagsBad = [], g = MG.newGame(4242); c.game = g;
  for (const act of MG.ACTS) {
    let err = null, years = 0, html = '';
    try {
      MG.startAct(g, act.id);
      const cast = MG.castFor(g.seed, g.act);
      cast.slice(0, 3).forEach((co) => { MG.study(g, co.id); MG.assess(g, co.id, MG.assessOptions(co).answer); });
      html = MG.viewMarketGame();
      g.phase = 'invest'; html = MG.viewMarketGame();
      g.studied.forEach((id) => MG.buy(g, id, 2500));
      g.phase = 'play';
      for (let i = 0; i < 20 && g.phase === 'play'; i++) {
        html = MG.viewMarketGame(); years++;
        for (const m of html.matchAll(/<span class="pill"[^>]*>([^<]*)<\/span>/g)) if (/^[A-Z]$/.test(m[1].trim()) || /^(macro|country|sector|company)$/.test(m[1].trim())) tagsBad.push(m[1]);
        MG.advance(g);
      }
      html = MG.viewMarketGame();
    } catch (e) { err = e.message; }
    decades.push({ act: act.id, err, years, review: g.phase === 'review' && /How well you read them/.test(html), score: g.score.asked });
  }
  ok('every decade starts on its first year, plays every year on screen, and reaches its review', decades.every((d) => !d.err && d.years === 10 && d.review),
     decades.map((d) => `${d.act}:${d.err || d.years + 'y' + (d.review ? ' ✓' : ' ✗')}`).join(' '));
  ok('"how well you read them" is per decade: it starts again with each one', decades.every((d) => d.score === 3), decades.map((d) => d.score).join(','));
  ok('an event\'s tags are words ("Economic", "This company"), never a letter or a code', tagsBad.length === 0 && Object.values(PESTEL).every((w) => w.length > 2), tagsBad.slice(0, 4).join(','));

  /* the answer key comes from the sheet, and no one answer covers more than 3 in 10 */
  const keys = COMPANIES.map((co) => MG.assessOptions(co));
  const count = {}; keys.forEach((k) => { count[k.answer] = (count[k.answer] || 0) + 1; });
  const most = Math.max(...Object.values(count));
  ok('no single "what could hurt it" answer is right for more than 30% of companies', most <= COMPANIES.length * 0.3, JSON.stringify(count));
  ok('every company has an answer, it is one of the offered options, and its reason quotes its own sheet',
    keys.every((k, i) => k.options.some((o) => o.id === k.answer) && k.why.includes(COMPANIES[i].risk)));
  const rail = COMPANIES.find((co) => co.id === 'rail');
  ok('the key agrees with the sheet: Great Western Rail, whose sheet says "volumes follow the economy", is a recession risk', MG.assessOptions(rail).answer === 'slump', rail.risk);
  /* always giving one answer: what a lazy player scores in every decade's cast */
  const lazy = Object.keys(count).map((a) => [a, COMPANIES.filter((co) => MG.assessOptions(co).answer === a).length / COMPANIES.length]);
  ok('always answering the same thing scores 30% or less, whichever thing it is', lazy.every(([, s]) => s <= 0.3), lazy.map(([a, s]) => `${a} ${Math.round(s * 100)}%`).join(' · '));
}

console.log('─'.repeat(60));
console.log(`${n - fails}/${n} passed`);
process.exit(fails ? 1 : 0);
