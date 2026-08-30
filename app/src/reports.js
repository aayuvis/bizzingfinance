/* reports.js — the annual report and the shareholder letter, generated.

   Forty companies over forty years is 1,600 annual reports. Nobody authors
   that. So the NUMBERS come from the simulation and the WORDS come from the
   numbers: the letter reads differently because the year was different, not
   because somebody wrote sixteen hundred letters.

   The letter is deliberately written the way real ones are — by someone with
   an interest in how it sounds. It is never a lie, but a bad year is "a year
   of investment" and a good one is "a vindication of the strategy". Learning
   to read past that is a GUARD-strand skill, and the annual report sitting
   next to it is how a child checks. */

import { byId as companyById } from '../content/companies.js';
import { SECTORS } from '../content/companies.js';
import { money } from './fmt.js';

const pc = (x) => (x * 100).toFixed(1) + '%';
/* Currency is a setting, never an assumption (CLAUDE.md). The first cut
   hard-coded a rupee sign into every report, which put ₹ in front of a US
   airline's accounts for a child whose app is set to dollars. */
const inr = (x) => money(Math.round(x));

/* ── the annual report: the numbers, plainly ─────────────────────────── */
export function annualReport(sim, id, y) {
  const c = companyById[id], rows = sim.years[id];
  const r = rows[y], p = y > 0 ? rows[y - 1] : null;
  const d = (k) => (p ? (r[k] - p[k]) : 0);
  const dpc = (k) => (p && p[k] ? (r[k] / p[k] - 1) : 0);
  const sector = SECTORS.find((s) => s.id === c.sector);

  return {
    company: c, year: y, sector,
    lines: [
      { k: 'Revenue',            v: inr(r.revenue),  d: p ? pc(dpc('revenue')) : '', up: d('revenue') >= 0 },
      { k: 'Operating profit',   v: inr(r.ebit),     d: p ? pc(dpc('ebit')) : '',    up: d('ebit') >= 0 },
      { k: 'Margin',             v: pc(r.margin),    d: p ? ((r.margin - p.margin) * 100).toFixed(1) + ' pts' : '', up: d('margin') >= 0 },
      { k: 'Interest paid',      v: inr(r.interest), d: p ? pc(dpc('interest')) : '', up: d('interest') <= 0 },
      { k: 'Profit after interest', v: inr(r.net),   d: p ? pc(dpc('net')) : '',     up: d('net') >= 0 },
      { k: 'Dividend paid',      v: inr(r.dividend), d: p ? pc(dpc('dividend')) : '', up: d('dividend') >= 0 },
      { k: 'Borrowings',         v: inr(r.debt),     d: p ? pc(dpc('debt')) : '',    up: d('debt') <= 0 },
    ],
    ratios: [
      { k: 'Profit per rupee of sales', v: pc(r.net / r.revenue),
        note: 'Of every rupee that came in, this much was still there at the end.' },
      { k: 'Interest as a share of profit',
        v: r.ebit > 0 ? pc(r.interest / r.ebit) : 'more than it earned',
        note: r.ebit <= 0 || r.interest > r.ebit
          ? 'It did not earn enough to cover the interest. That is how businesses fail.'
          : r.interest / r.ebit > 0.4
            ? 'A large slice of what it earns goes straight to the lender.'
            : 'Comfortably covered.' },
      { k: 'Borrowings against sales', v: (r.debt / r.revenue).toFixed(2) + 'x',
        note: 'How many years of sales it would take to repay everything.' },
      { k: 'Paid out to owners', v: pc(r.dividend / Math.max(1, r.net)),
        note: 'The rest was kept inside the business.' },
      /* A multiple on a loss is meaningless — there is no "per rupee of
         profit" when there is no profit. Real reports say n/a; printing a
         number here would teach a child to divide by something that is not
         there. */
      { k: 'What people pay per rupee of profit', v: r.net > 0 ? r.mult.toFixed(1) + 'x' : 'n/a',
        note: r.net > 0
          ? 'The multiple. It moves with the bank rate and with the mood.'
          : 'It made a loss, so there is no profit to price. That is the point.' },
    ],
    events: r.events,
    world: { rate: r.rate, inflation: r.inflation, growth: r.growth },
  };
}

/* ── the shareholder letter: the same year, with a spin on it ───────── */
const OPEN_GOOD = [
  'It has been a year of real progress, and I want to begin by thanking every one of our people for it.',
  'I am pleased to report a year in which the strategy we set out has done exactly what we said it would.',
  'This was a strong year, and a satisfying one.',
];
const OPEN_MIXED = [
  'This was a year of two halves, and I will not pretend the second was the easier one.',
  'We made real progress in a market that gave us very little help.',
  'A year of building rather than harvesting.',
];
const OPEN_BAD = [
  'I will not dress this up: it has been a difficult year.',
  'This was a disappointing year, and the board takes responsibility for it.',
  'We entered the year with confidence and we leave it wiser.',
];

export function shareholderLetter(sim, id, y) {
  const c = companyById[id], rows = sim.years[id];
  const r = rows[y], p = y > 0 ? rows[y - 1] : null;
  const revUp = p ? r.revenue / p.revenue - 1 : 0;
  const netUp = p ? r.net / Math.max(1, Math.abs(p.net)) - 1 : 0;
  const marginDown = p ? r.margin < p.margin : false;
  const pick = (a) => a[(y * 7 + c.id.length * 3) % a.length];

  const good = netUp > 0.08 && revUp > 0.04;
  const bad = netUp < -0.1 || r.net < 0;
  const open = good ? pick(OPEN_GOOD) : bad ? pick(OPEN_BAD) : pick(OPEN_MIXED);

  const body = [];
  body.push(revUp >= 0
    ? `Revenue grew ${pc(revUp)} to ${inr(r.revenue)}.`
    : `Revenue fell ${pc(-revUp)} to ${inr(r.revenue)}, which is not where we wanted to be.`);

  /* the spin: a squeezed margin becomes "investment" */
  if (marginDown) {
    body.push(bad
      ? `Margins came under pressure, at ${pc(r.margin)} against ${pc(p.margin)}.`
      : `We chose to invest ahead of demand, and margins reflect that at ${pc(r.margin)}.`);
  } else if (p) {
    body.push(`Margins improved to ${pc(r.margin)}, which reflects discipline on cost.`);
  }

  if (r.interest / Math.max(1, r.ebit) > 0.45) {
    body.push(`Our interest bill of ${inr(r.interest)} remains the single largest call on operating profit, and reducing it is a priority.`);
  }
  if (r.dividend > 0 && p && r.dividend >= p.dividend) {
    body.push(`The board is recommending a dividend of ${inr(r.dividend)}, which we regard as a signal of confidence.`);
  } else if (p && r.dividend < p.dividend * 0.9) {
    body.push(`The board has taken the difficult decision to reduce the dividend to ${inr(r.dividend)} in order to protect the balance sheet.`);
  }

  (r.events || []).slice(0, 2).forEach((e) => {
    body.push(e.scope.kind === 'company'
      ? `You will have seen that ${e.head.toLowerCase()}. We have addressed this directly.`
      : `The wider picture — ${e.head.toLowerCase()} — shaped the year for everyone in ${SECTORS.find((s) => s.id === c.sector).name.toLowerCase()}.`);
  });

  const close = good
    ? 'We enter the coming year with confidence and with the balance sheet to act on it.'
    : bad
      ? 'We have a clear plan, and we expect the coming year to be one of repair.'
      : 'There is work to do, and we know what it is.';

  return {
    company: c, year: y, open, body, close,
    /* what the letter is NOT saying, for the review afterwards */
    omissions: [
      marginDown && !bad ? 'Called a margin squeeze "investment ahead of demand".' : null,
      r.debt / r.revenue > 1.5 ? `Did not mention that borrowings are ${(r.debt / r.revenue).toFixed(1)}x revenue.` : null,
      r.net < 0 ? 'Led with revenue because profit was negative.' : null,
    ].filter(Boolean),
  };
}
