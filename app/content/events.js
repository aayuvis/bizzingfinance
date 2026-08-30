/* events.js — what happens, and why the price moved.

   PESTEL at four levels. An event is a TEMPLATE: it carries the shape of a
   thing that happens and the size of its effect, and gets instantiated
   against a real company, sector and year. Authoring every event over forty
   years would be ~2,300 items; as templates it is a few dozen, and the
   leverage is what makes a forty-year game buildable at all (docs/05 §B).

   Effects are deliberately separated, because they teach different things:

     rev      changes how much the company sells        (the business)
     margin   changes how much of it it keeps           (the squeeze)
     mult     changes what people will PAY per rupee    (the mood)
     shock    a one-off hit to the price, then it heals (the panic)

   A child who reads an event and predicts which of those four moves has
   understood something real. That is the quiz. */

export const PESTEL = {
  P: 'Political', E: 'Economic', S: 'Social',
  T: 'Technological', N: 'Environmental', L: 'Legal',
};

/* `when` filters where a template can fire. `w` is its relative weight.
   Effects are in fractions: rev 0.08 = +8% revenue, margin 0.02 = +2 points. */
const E = (id, level, tag, head, body, eff, opt = {}) =>
  ({ id, level, tag, head, body, eff, years: opt.years || 1, w: opt.w || 1, when: opt.when || null });

/* ── MACRO · the whole economy ──────────────────────────────────────── */
export const MACRO = [
  E('m-hike', 'macro', 'E', 'The bank raises rates again',
    'Borrowing costs more everywhere. Anything bought with debt is worth less today.',
    { mult: -0.09 }, { w: 3 }),
  E('m-cut', 'macro', 'E', 'The bank cuts rates',
    'Money is cheaper. Distant profits are suddenly worth more in today’s terms.',
    { mult: 0.08 }, { w: 2 }),
  E('m-infl', 'macro', 'E', 'Prices climb faster than wages',
    'Everything costs more to make. Who keeps their margin depends entirely on who can raise prices.',
    { margin: -0.012 }, { years: 2, w: 3 }),
  E('m-recession', 'macro', 'E', 'The economy contracts for two quarters',
    'Orders are cancelled, hiring stops, and the cyclical businesses feel it first.',
    { rev: -0.07, mult: -0.12 }, { years: 2, w: 2 }),
  E('m-boom', 'macro', 'E', 'A broad recovery takes hold',
    'Everyone is ordering again, and the businesses with spare capacity fill it fastest.',
    { rev: 0.08, mult: 0.07 }, { years: 2, w: 2 }),
  E('m-credit', 'macro', 'E', 'Lenders stop lending',
    'It is not that borrowing is dear. It is that nobody will lend at any price.',
    { mult: -0.16, shock: -0.08 }, { w: 1 }),
  E('m-currency', 'macro', 'E', 'The rupee falls against the dollar',
    'Exporters cheer. Anyone buying from abroad has just had a pay cut.',
    { margin: -0.008 }, { w: 2 }),
  E('m-oil', 'macro', 'N', 'The oil price doubles in a year',
    'Every lorry, every furnace, every plastic thing. It reaches almost everything.',
    { margin: -0.015 }, { years: 2, w: 2 }),
  E('m-oilfall', 'macro', 'N', 'The oil price collapses',
    'A pay rise for everyone who burns it and a crisis for everyone who sells it.',
    { margin: 0.012 }, { w: 2 }),
  E('m-panic', 'macro', 'S', 'A market panic with no obvious cause',
    'Nothing changed about the companies. Everything changed about what people would pay.',
    { shock: -0.14, mult: -0.06 }, { w: 1 }),
  E('m-bubble', 'macro', 'S', 'Everyone is suddenly an investor',
    'Prices are running well ahead of profits, and the reasons are getting creative.',
    { mult: 0.22 }, { years: 2, w: 1 }),
  E('m-tax', 'macro', 'L', 'Corporation tax is cut',
    'The same business, the same customers, and more of the profit stays inside it.',
    { margin: 0.014 }, { w: 1 }),
];

/* ── COUNTRY · politics, law, society ───────────────────────────────── */
export const COUNTRY = [
  E('c-election', 'country', 'P', 'An election is called',
    'Nobody signs anything large until they know who won. Decisions simply stop for a quarter.',
    { rev: -0.02, mult: -0.04 }, { w: 3 }),
  E('c-infra', 'country', 'P', 'A national building programme is announced',
    'Roads, ports and power. Anyone who supplies a construction site has a decade of orders.',
    { rev: 0.05 }, { years: 3, w: 2 }),
  E('c-tariff', 'country', 'L', 'Import tariffs are raised',
    'Local makers are protected. Anyone who imports their materials just got more expensive.',
    { margin: -0.01 }, { years: 3, w: 2 }),
  E('c-subsidy', 'country', 'P', 'Subsidies are withdrawn',
    'A cheque that arrived every year has stopped, and the business model assumed it.',
    { margin: -0.02 }, { years: 2, w: 2 }),
  E('c-labour', 'country', 'S', 'Wage floors rise sharply',
    'Good news for the people who work. A problem for anyone whose main cost is people.',
    { margin: -0.011 }, { years: 2, w: 2 }),
  E('c-privacy', 'country', 'L', 'A strict data law passes',
    'Anyone holding information about customers has a compliance bill and a smaller toolbox.',
    { margin: -0.008 }, { years: 2, w: 2 }),
  E('c-monsoon', 'country', 'N', 'The monsoon fails',
    'Rural incomes fall, crops fail, and it reaches the shops within two quarters.',
    { rev: -0.05 }, { years: 2, w: 2 }),
  E('c-strike', 'country', 'S', 'A transport strike halts the country for weeks',
    'Nothing moves. Nothing is delivered. Everyone with a warehouse discovers what it is for.',
    { rev: -0.03, shock: -0.04 }, { w: 1 }),
  E('c-fdi', 'country', 'P', 'Foreign investment rules are relaxed',
    'Global money arrives looking for somewhere to go, and it bids prices up.',
    { mult: 0.10 }, { years: 2, w: 2 }),
  E('c-scandal', 'country', 'L', 'A corporate governance scandal breaks',
    'One company cheated. Every company now trades a little cheaper because of it.',
    { mult: -0.07 }, { w: 1 }),
];

/* ── SECTOR · things that hit a whole industry ──────────────────────── */
export const SECTOR = [
  E('s-price-war', 'sector', 'E', 'A price war breaks out',
    'A rival decides to buy market share. Everybody’s margin pays for it.',
    { margin: -0.025, rev: 0.03 }, { years: 2, w: 2 }),
  E('s-consolidate', 'sector', 'E', 'Two of the big players merge',
    'One fewer competitor. Prices firm up for everybody left.',
    { margin: 0.015, mult: 0.05 }, { years: 2, w: 2 }),
  E('s-regulator', 'sector', 'L', 'The regulator caps what can be charged',
    'The service is unchanged. The amount that can be earned from it is not.',
    { margin: -0.03, mult: -0.10 }, { years: 4, w: 2 }),
  E('s-demand', 'sector', 'S', 'The sector falls out of fashion',
    'Nothing is wrong with the businesses. People have simply stopped being interested.',
    { rev: -0.06, mult: -0.12 }, { years: 3, w: 2 }),
  E('s-boomlet', 'sector', 'S', 'Everybody wants what this sector sells',
    'Demand runs ahead of what anyone can supply, and prices go with it.',
    { rev: 0.12, margin: 0.02, mult: 0.14 }, { years: 2, w: 2 }),
  E('s-input', 'sector', 'N', 'The main raw material triples in price',
    'Whoever can pass it on keeps their margin. Whoever cannot, eats it.',
    { margin: -0.035 }, { years: 2, w: 2 }),
  E('s-tech', 'sector', 'T', 'A new technology arrives in the sector',
    'It is cheaper and it is coming. The incumbents have about five years.',
    { mult: -0.09 }, { years: 4, w: 2 }),
  E('s-standard', 'sector', 'T', 'A common standard is agreed',
    'Everything now works with everything else, and the market grows for everyone.',
    { rev: 0.06, mult: 0.06 }, { years: 3, w: 1 }),
  E('s-safety', 'sector', 'L', 'New safety rules are imposed after an accident',
    'Compliance costs money and the smallest players cannot afford it.',
    { margin: -0.018 }, { years: 3, w: 1 }),
  E('s-entrant', 'sector', 'E', 'A well-funded newcomer enters',
    'It is losing money on purpose to take customers, and it can do it for years.',
    { rev: -0.04, margin: -0.015 }, { years: 3, w: 2 }),
  E('s-export', 'sector', 'P', 'An export market opens up',
    'The same product, a much larger set of customers.',
    { rev: 0.09 }, { years: 3, w: 1 }),
  E('s-green', 'sector', 'N', 'Emissions rules tighten',
    'Clean operators gain. Dirty ones have a bill and a deadline.',
    { margin: -0.02 }, { years: 4, w: 2 }),
];

/* ── COMPANY · the individual firm ──────────────────────────────────── */
export const COMPANY = [
  E('x-beat', 'company', 'E', 'Results beat what anyone expected',
    'It sold more, at a better margin, than the market had assumed.',
    { rev: 0.05, margin: 0.012, mult: 0.07 }, { w: 4 }),
  E('x-miss', 'company', 'E', 'Results disappoint',
    'Slower than promised, and the market had already paid for the promise.',
    { rev: -0.05, margin: -0.012, mult: -0.09 }, { w: 4 }),
  E('x-newceo', 'company', 'S', 'A new chief executive arrives',
    'A plan, a reorganisation, and two years before anyone can tell whether it worked.',
    { mult: 0.05 }, { years: 2, w: 2 }),
  E('x-scandal', 'company', 'L', 'An accounting problem is discovered',
    'The numbers were not what they seemed. Trust takes far longer to rebuild than to lose.',
    { mult: -0.28, shock: -0.15 }, { years: 3, w: 1 }),
  E('x-recall', 'company', 'L', 'A product is recalled',
    'Every unit back, at its own cost, and the brand carries the story for years.',
    { rev: -0.06, margin: -0.02, shock: -0.08 }, { years: 2, w: 1 }),
  E('x-expand', 'company', 'E', 'It opens in three new regions',
    'More customers, and the cost of reaching them arrives before the revenue does.',
    { rev: 0.10, margin: -0.01 }, { years: 3, w: 2 }),
  E('x-acquire', 'company', 'E', 'It buys a competitor',
    'Bigger overnight, and paid for with debt that is now on the balance sheet.',
    { rev: 0.14, margin: -0.008, mult: -0.04 }, { years: 3, w: 2 }),
  E('x-divest', 'company', 'E', 'It sells the division that never worked',
    'Smaller, simpler, and a good deal more profitable.',
    { rev: -0.09, margin: 0.02, mult: 0.06 }, { w: 1 }),
  E('x-patent', 'company', 'T', 'A patent is granted',
    'For a while, nobody else is allowed to do this.',
    { margin: 0.025, mult: 0.09 }, { years: 4, w: 2 }),
  E('x-patentloss', 'company', 'T', 'Its main patent expires',
    'Everyone can copy it now, and the price falls to what it costs to make.',
    { margin: -0.04, mult: -0.10 }, { years: 3, w: 1 }),
  E('x-plant', 'company', 'E', 'A new plant comes on line',
    'Capacity it has been paying for since before it could use it.',
    { rev: 0.08, margin: 0.01 }, { years: 2, w: 2 }),
  E('x-fire', 'company', 'N', 'A fire destroys its largest facility',
    'Insurance covers the building. It does not cover the customers who went elsewhere.',
    { rev: -0.12, shock: -0.11 }, { years: 2, w: 1 }),
  E('x-contract', 'company', 'P', 'It wins a government contract',
    'Years of guaranteed revenue, at a margin the government negotiated hard.',
    { rev: 0.11, margin: -0.005 }, { years: 4, w: 2 }),
  E('x-losescontract', 'company', 'P', 'It loses its largest customer',
    'One name was a fifth of the revenue, and nobody outside the company knew.',
    { rev: -0.14, mult: -0.11 }, { years: 2, w: 1 }),
  E('x-dividend', 'company', 'E', 'The dividend is raised',
    'A quiet signal that the people running it expect the cash to keep coming.',
    { mult: 0.05 }, { w: 2 }),
  E('x-cut-div', 'company', 'E', 'The dividend is cut',
    'The loudest thing a board can say without saying anything.',
    { mult: -0.15, shock: -0.07 }, { w: 1 }),
  E('x-strike', 'company', 'S', 'Its workforce goes on strike',
    'Six weeks of no output, and a wage settlement at the end of it.',
    { rev: -0.05, margin: -0.012 }, { w: 1 }),
  E('x-automate', 'company', 'T', 'It automates a large part of its operation',
    'Fewer people, lower cost, and a difficult year of doing it.',
    { margin: 0.022 }, { years: 3, w: 2 }),
  E('x-debt', 'company', 'E', 'It refinances at a much better rate',
    'The business did not change. The interest bill fell by a third.',
    { margin: 0.015, mult: 0.05 }, { w: 2 }),
  E('x-overreach', 'company', 'E', 'An expansion turns out to be too ambitious',
    'It borrowed to grow into a market that was not there.',
    { rev: -0.07, margin: -0.025, mult: -0.14 }, { years: 3, w: 1 }),
];

export const ALL = [...MACRO, ...COUNTRY, ...SECTOR, ...COMPANY];
export const byLevel = { macro: MACRO, country: COUNTRY, sector: SECTOR, company: COMPANY };

export function validate() {
  const errs = [];
  const ids = new Set();
  ALL.forEach((e) => {
    if (ids.has(e.id)) errs.push(`${e.id}: duplicate`); ids.add(e.id);
    if (!PESTEL[e.tag]) errs.push(`${e.id}: unknown PESTEL tag ${e.tag}`);
    if (!e.head || !e.body || e.body.length < 30) errs.push(`${e.id}: body too thin to reason about`);
    const keys = Object.keys(e.eff);
    if (!keys.length) errs.push(`${e.id}: no effect — an event that changes nothing teaches nothing`);
    keys.forEach((k) => {
      if (!['rev', 'margin', 'mult', 'shock'].includes(k)) errs.push(`${e.id}: unknown effect ${k}`);
      if (Math.abs(e.eff[k]) > 0.5) errs.push(`${e.id}: effect ${k} is implausibly large`);
    });
  });
  /* every PESTEL letter must be reachable, or the frame is decoration */
  Object.keys(PESTEL).forEach((t) => {
    if (!ALL.some((e) => e.tag === t)) errs.push(`no event ever tagged ${t} (${PESTEL[t]})`);
  });
  return errs;
}
