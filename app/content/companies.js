/* companies.js — the Register: 40 fictional companies for the Market Game.

   CONCEPT §6.2 governs this file: fictional names, real BEHAVIOUR. Every
   company here is a COMPOSITE of two or three real US archetypes — a type
   anybody recognises on sight, never a company you could name. The Seattle
   everything-store, the Bentonville big-box, the Cupertino device maker: the
   SHAPE is instantly familiar and the firm does not exist. That is the difference between
   teaching how a business works and publishing a view on somebody's shares,
   and it is not a style preference: a fictional firm that maps one-to-one
   onto a real one becomes commentary on that real one.

   `dna` is what makes each one behave differently in the same economy. It is
   the whole point: two companies in the same sector, one with pricing power
   and one without, come apart the moment inflation arrives — and the child
   can read WHY off the numbers rather than being told.

   All figures are Bizzington's own and describe nobody's real accounts.  */

/* growth      secular trend, % a year, before the cycle
   cyc         how hard earnings swing with the economy (1 = with it)
   rateSens    how much a rate rise hurts (debt + long-dated growth)
   pricing     ability to pass inflation on. 1 = fully, 0 = eats it
   disrupt     exposure to being replaced by something new
   debt        borrowings as a multiple of revenue
   payout      share of earnings paid out as dividends              */

export const SECTORS = [
  { id: 'staples',  name: 'Everyday things',  em: '🧺', cyc: 0.4, note: 'People buy these in good years and bad.' },
  { id: 'energy',   name: 'Energy',           em: '⚡', cyc: 1.2, note: 'Follows the price of the thing it sells.' },
  { id: 'finance',  name: 'Banks and money',  em: '🏛️', cyc: 1.4, note: 'Earns on the gap between what it pays and what it charges.' },
  { id: 'tech',     name: 'Technology',       em: '💻', cyc: 1.1, note: 'Cheap to copy, expensive to be second.' },
  { id: 'health',   name: 'Health',           em: '💊', cyc: 0.3, note: 'Demand barely notices a recession.' },
  { id: 'industry', name: 'Making and moving',em: '🏗️', cyc: 1.5, note: 'First to feel a slowdown, first to feel a recovery.' },
  { id: 'consumer', name: 'Things you want',  em: '🛍️', cyc: 1.3, note: 'The first spending anyone cuts.' },
  { id: 'infra',    name: 'Pipes and wires',  em: '🛤️', cyc: 0.3, note: 'Dull, regulated, and paid whatever happens.' },
];

const C = (id, name, ticker, sector, what, how, who, risk, model, dna) =>
  ({ id, name, ticker, sector, what, how, who, risk, model, dna });

export const COMPANIES = [
  /* ── Everyday things ─────────────────────────────────────────────── */
  C('bigbox', 'Prairie Mart', 'PRM', 'staples',
    'Four thousand enormous stores selling everything, cheaply.',
    'Buys in quantities nobody can match and passes on just enough of it.',
    'Half the country, most weeks.',
    'Wafer-thin margins. A one-point cost rise erases a third of the profit.',
    'Big-box retail — scale is the entire advantage',
    { rev0: 48000, margin: 0.028, growth: 5, cyc: 0.3, rateSens: 0.5, pricing: 0.7, disrupt: 0.4, debt: 0.35, payout: 0.4 }),
  C('clubco', 'Northgate Club', 'NGC', 'staples',
    'Warehouse membership stores. Enormous packs, tiny mark-ups.',
    'Sells goods at nearly cost and makes its profit on the membership fee.',
    'Families who buy in bulk, and small businesses.',
    'If members stop renewing there is no profit left underneath.',
    'Membership model — the fee IS the earnings',
    { rev0: 22000, margin: 0.026, growth: 8, cyc: 0.25, rateSens: 0.4, pricing: 0.65, disrupt: 0.25, debt: 0.2, payout: 0.3 }),
  C('cereal', 'Kellwood Foods', 'KWF', 'staples',
    'Cereal, snacks and soup, in packets your grandparents also bought.',
    'A century of advertising means shops cannot afford not to stock it.',
    'Every household, on autopilot.',
    'Store-brand copies that taste the same and cost forty percent less.',
    'Legacy food brand — the brand is old and so are the buyers',
    { rev0: 14000, margin: 0.11, growth: 2, cyc: 0.2, rateSens: 0.5, pricing: 0.8, disrupt: 0.35, debt: 0.7, payout: 0.6 }),
  C('fizz', 'Cardinal Beverages', 'CRB', 'staples',
    'Fizzy drinks, water and sports drinks, in every cooler on earth.',
    'Sells concentrate to bottlers for pennies and charges for the name.',
    'Literally everybody.',
    'Sugar taxes, health fashion, and a rival with an identical product.',
    'Concentrate model — asset-light, brand-heavy',
    { rev0: 26000, margin: 0.23, growth: 5, cyc: 0.2, rateSens: 0.5, pricing: 0.9, disrupt: 0.2, debt: 0.6, payout: 0.7 }),
  C('household', 'Glover & Pike', 'GPK', 'staples',
    'Detergent, razors, nappies and toothpaste. Twenty brands, one company.',
    'Outspends every rival on advertising until shelf space is automatic.',
    'Every home in the country.',
    'When money is tight, people discover the shop’s own brand works fine.',
    'Consumer packaged goods — advertising as a moat',
    { rev0: 31000, margin: 0.18, growth: 4, cyc: 0.2, rateSens: 0.4, pricing: 0.85, disrupt: 0.25, debt: 0.5, payout: 0.65 }),

  /* ── Energy ──────────────────────────────────────────────────────── */
  C('bigoil', 'Meridian Petroleum', 'MPT', 'energy',
    'Finds oil, refines it, and sells it at the pump. All three.',
    'Costs are largely fixed. Revenue is whatever the barrel is worth today.',
    'Everyone with a car, indirectly.',
    'A price it does not set, and a world trying to stop needing it.',
    'Integrated oil major — a price taker at scale',
    { rev0: 92000, margin: 0.09, growth: 1, cyc: 1.9, rateSens: 0.6, pricing: 0.2, disrupt: 0.6, debt: 0.5, payout: 0.6 }),
  C('shale', 'Permian Ridge', 'PMR', 'energy',
    'Drills shale wells fast, and they run dry fast too.',
    'Each well pays back in two years or not at all.',
    'Refiners, and the traders who move it to them.',
    'Has to keep drilling just to stand still, and drilling is borrowed money.',
    'Shale — a treadmill funded by debt',
    { rev0: 11000, margin: 0.14, growth: 6, cyc: 2.3, rateSens: 1.7, pricing: 0.15, disrupt: 0.6, debt: 1.4, payout: 0.25 }),
  C('solar', 'Helios Power', 'HLP', 'energy',
    'Utility-scale solar farms on twenty-year supply contracts.',
    'Sunlight is free. The debt that bought the panels is not.',
    'State utilities, on contracts signed years ahead.',
    'It is a bond wearing a power station. Rates hurt it more than clouds.',
    'Contracted renewables — a bond in disguise',
    { rev0: 3400, margin: 0.24, growth: 16, cyc: 0.2, rateSens: 2.5, pricing: 0.15, disrupt: 0.15, debt: 2.7, payout: 0.35 }),
  C('pipeline', 'Continental Pipeline', 'CPL', 'energy',
    'Six thousand miles of pipe, and a fee for everything that goes through.',
    'Paid by volume on long contracts, whatever the oil price does.',
    'Producers who have no other way to move it.',
    'Enormous debt, and a permit process that can stop a project dead.',
    'Midstream toll road — volume, not price',
    { rev0: 8600, margin: 0.31, growth: 4, cyc: 0.5, rateSens: 2.3, pricing: 0.4, disrupt: 0.35, debt: 2.9, payout: 0.75 }),
  C('nukegen', 'Atlas Generation', 'ATG', 'energy',
    'Nuclear and gas power stations selling into the wholesale market.',
    'Runs flat out and sells at whatever the grid is paying that hour.',
    'The grid, and through it everyone.',
    'A single outage costs a quarter’s profit, and the plants are old.',
    'Merchant power — huge assets, volatile prices',
    { rev0: 7200, margin: 0.13, growth: 3, cyc: 1.0, rateSens: 1.9, pricing: 0.35, disrupt: 0.3, debt: 2.1, payout: 0.45 }),

  /* ── Banks and money ─────────────────────────────────────────────── */
  C('megabank', 'Hudson First', 'HDF', 'finance',
    'A national bank: branches, mortgages, credit cards, trading floor.',
    'Pays depositors little, lends at more, keeps the difference.',
    'Households, businesses, and other banks.',
    'The loans made in the good years turn bad in the bad ones, all at once.',
    'Universal bank — earns the spread, wears the cycle',
    { rev0: 52000, margin: 0.24, growth: 5, cyc: 1.7, rateSens: -1.0, pricing: 0.5, disrupt: 0.35, debt: 0, payout: 0.4 }),
  C('cardnet', 'Vantage Network', 'VNT', 'finance',
    'The rails a card payment runs on. It touches the money and never holds it.',
    'A few basis points on trillions, and almost no cost per extra transaction.',
    'Banks and merchants, on every swipe.',
    'Regulators capping the fee, and rivals building rails around it.',
    'Payment network — a toll on commerce itself',
    { rev0: 18000, margin: 0.51, growth: 11, cyc: 0.8, rateSens: 0.9, pricing: 0.8, disrupt: 0.4, debt: 0.3, payout: 0.25 }),
  C('insurer', 'Great Lakes Mutual', 'GLM', 'finance',
    'Home, motor and life insurance across forty states.',
    'Takes premiums now, pays claims later, invests the float meanwhile.',
    'Anyone with something to lose.',
    'One bad hurricane season costs more than a decade of careful underwriting.',
    'Insurance — paid upfront, liable for years',
    { rev0: 24000, margin: 0.10, growth: 6, cyc: 0.6, rateSens: -0.7, pricing: 0.6, disrupt: 0.3, debt: 0.2, payout: 0.5 }),
  C('assetmgr', 'Bellwether Asset', 'BWA', 'finance',
    'Index funds. Trillions of other people’s money, for a very small fee.',
    'Charges a fraction of a percent on assets, and assets grow by themselves.',
    'Pension funds and anyone with a retirement account.',
    'The fee only ever goes down, because that is the whole competition.',
    'Asset management — scale against a falling fee',
    { rev0: 7400, margin: 0.38, growth: 9, cyc: 1.2, rateSens: 0.8, pricing: 0.3, disrupt: 0.45, debt: 0.2, payout: 0.6 }),
  C('exchange', 'Liberty Exchange', 'LBX', 'finance',
    'Runs the market everything else on this list trades on.',
    'A fee on every trade, whichever way the price went.',
    'Brokers, funds, and anyone buying a share.',
    'A calm decade with no trading is a calm decade of revenue.',
    'Exchange — paid on activity, not direction',
    { rev0: 5200, margin: 0.46, growth: 8, cyc: 1.1, rateSens: 0.4, pricing: 0.8, disrupt: 0.25, debt: 0.4, payout: 0.55 }),

  /* ── Technology ──────────────────────────────────────────────────── */
  C('devices', 'Summit Devices', 'SMD', 'tech',
    'Phones, laptops and watches, and the services people buy on them.',
    'Sells hardware at a margin nobody else in hardware gets, then sells services on top.',
    'A billion people who replace the phone every few years.',
    'One boring product cycle and the whole thesis is questioned.',
    'Premium hardware plus a services annuity',
    { rev0: 120000, margin: 0.25, growth: 8, cyc: 1.0, rateSens: 1.0, pricing: 0.9, disrupt: 0.4, debt: 0.4, payout: 0.3 }),
  C('everything', 'Cascade Commerce', 'CSC', 'tech',
    'An everything-store, plus the warehouses, plus a cloud business paying for it all.',
    'Retail barely breaks even. The cloud division is where the profit lives.',
    'Almost everybody, plus every company renting servers.',
    'Two very different businesses in one, and only one of them earns.',
    'Retail at scale funding an infrastructure annuity',
    { rev0: 140000, margin: 0.07, growth: 14, cyc: 1.0, rateSens: 1.5, pricing: 0.55, disrupt: 0.35, debt: 0.6, payout: 0 }),
  C('search', 'Beacon Media', 'BCN', 'tech',
    'Search, maps, video and the advertising that pays for all of it.',
    'Gives the product away and sells the attention.',
    'Advertisers. The users are not the customers.',
    'Antitrust, and the possibility that people stop searching the old way.',
    'Advertising platform — free product, sold audience',
    { rev0: 88000, margin: 0.28, growth: 12, cyc: 1.3, rateSens: 1.3, pricing: 0.75, disrupt: 0.5, debt: 0.1, payout: 0 }),
  C('chips', 'Redstone Semiconductor', 'RDS', 'tech',
    'Designs the chips everything else needs and cannot make itself.',
    'Designs once at enormous cost, then licenses and sells at enormous margin.',
    'Every device maker on earth.',
    'Brutally cyclical. When customers stop ordering they stop completely.',
    'Fabless semiconductor — vast margin, vast cycle',
    { rev0: 21000, margin: 0.34, growth: 17, cyc: 2.2, rateSens: 1.6, pricing: 0.8, disrupt: 0.5, debt: 0.2, payout: 0.2 }),
  C('stream', 'Nightfall Studios', 'NFS', 'tech',
    'Films and series on a monthly subscription, in ninety countries.',
    'Spends billions making things, then charges a little to hundreds of millions.',
    'Households who forget they are subscribed.',
    'Every rival is spending the same billions for the same evening.',
    'Subscription content — enormous fixed cost',
    { rev0: 32000, margin: 0.11, growth: 15, cyc: 0.8, rateSens: 1.8, pricing: 0.6, disrupt: 0.5, debt: 1.0, payout: 0 }),

  /* ── Health ──────────────────────────────────────────────────────── */
  C('pharma', 'Ashford Pharmaceutical', 'AFP', 'health',
    'Invents medicines. Most attempts fail; the successes pay for everything.',
    'A decade and billions, then a patent and five very profitable years.',
    'Health systems and insurers, once it works.',
    'One failed trial erases a decade in an afternoon. And patents expire.',
    'Research pharma — binary outcomes on a clock',
    { rev0: 46000, margin: 0.26, growth: 6, cyc: 0.15, rateSens: 1.4, pricing: 0.9, disrupt: 0.45, debt: 0.7, payout: 0.55 }),
  C('generic', 'Fairview Generics', 'FVG', 'health',
    'Copies medicines whose patents have expired, and makes them for pennies.',
    'No research bill, tiny margin, enormous volume.',
    'Pharmacies and government buyers purchasing by the tonne.',
    'Anyone can do this, so the price only ever falls.',
    'Generic manufacture — cost is the only edge',
    { rev0: 12000, margin: 0.07, growth: 5, cyc: 0.2, rateSens: 0.9, pricing: 0.3, disrupt: 0.3, debt: 1.1, payout: 0.3 }),
  C('hospitals', 'Sentinel Health', 'SNH', 'health',
    'A hundred and eighty hospitals, and the beds are mostly full.',
    'Charges per procedure and per night, and argues with insurers about both.',
    'Patients, insurers, and the government.',
    'Its costs are wages, and wages only go one way.',
    'Hospital operator — wage inflation is the enemy',
    { rev0: 38000, margin: 0.08, growth: 7, cyc: 0.25, rateSens: 1.5, pricing: 0.6, disrupt: 0.2, debt: 1.6, payout: 0.15 }),
  C('healthins', 'Cornerstone Health Plans', 'CHP', 'health',
    'Health insurance for employers, and the pharmacy benefits alongside it.',
    'Collects premiums, pays claims, and keeps the gap.',
    'Employers, and eighty million members.',
    'A single policy change in Washington can rewrite the whole business.',
    'Managed care — regulated margin, enormous scale',
    { rev0: 96000, margin: 0.04, growth: 9, cyc: 0.2, rateSens: 0.7, pricing: 0.5, disrupt: 0.35, debt: 0.4, payout: 0.3 }),
  C('devicesmed', 'Kingsley Medical', 'KGM', 'health',
    'Stents, pumps, joints and the robots surgeons operate with.',
    'Sells to hospitals that will not change supplier without a very good reason.',
    'Surgeons, who choose; hospitals, who pay.',
    'A regulator can withdraw approval and take a product line with it.',
    'Medical devices — approval is both moat and risk',
    { rev0: 19000, margin: 0.21, growth: 8, cyc: 0.2, rateSens: 1.0, pricing: 0.85, disrupt: 0.3, debt: 0.6, payout: 0.4 }),

  /* ── Making and moving ───────────────────────────────────────────── */
  C('aero', 'Wingate Aerospace', 'WNG', 'industry',
    'Airliners and defence contracts, on order books stretching a decade.',
    'Takes deposits years ahead, then spends a fortune building.',
    'Airlines and governments.',
    'One safety failure grounds a fleet and costs years.',
    'Aerospace — a duopoly with catastrophic tail risk',
    { rev0: 68000, margin: 0.08, growth: 4, cyc: 1.6, rateSens: 1.4, pricing: 0.7, disrupt: 0.2, debt: 1.3, payout: 0.35 }),
  C('rail', 'Great Western Rail', 'GWR', 'industry',
    'Freight railroads. Nobody is building a competing one.',
    'Charges by the car-mile on track it owns outright.',
    'Coal, grain, chemicals, containers.',
    'Volumes follow the economy exactly, with no lag to hide behind.',
    'Railroad — a genuine geographic monopoly',
    { rev0: 24000, margin: 0.29, growth: 4, cyc: 1.5, rateSens: 1.3, pricing: 0.75, disrupt: 0.2, debt: 1.2, payout: 0.5 }),
  C('machines', 'Ironside Equipment', 'IRN', 'industry',
    'Excavators, tractors and the machines that build everything else.',
    'Sells a machine once and services it for twenty years.',
    'Construction firms, farms, mines.',
    'Orders vanish the moment anybody gets nervous about next year.',
    'Capital goods — the sharpest cycle in the market',
    { rev0: 42000, margin: 0.13, growth: 4, cyc: 2.3, rateSens: 1.6, pricing: 0.65, disrupt: 0.3, debt: 1.0, payout: 0.4 }),
  C('autos', 'Lakeshore Motors', 'LKM', 'industry',
    'Trucks and cars, and now electric versions of both.',
    'Thin margins on the vehicle, real money on financing and parts.',
    'Households and fleets.',
    'Betting the company on which way the engine goes, with a union to consult.',
    'Automaker — manufacturing plus a captive finance arm',
    { rev0: 78000, margin: 0.05, growth: 3, cyc: 2.0, rateSens: 1.8, pricing: 0.45, disrupt: 0.7, debt: 1.9, payout: 0.35 }),
  C('chem', 'Delaware Chemical', 'DLC', 'industry',
    'Plastics, coatings and industrial gases. In almost everything.',
    'Turns oil and gas into materials, at a spread it does not control.',
    'Every manufacturer there is.',
    'Both its input cost and its selling price are set by other people.',
    'Commodity chemicals — squeezed from both ends',
    { rev0: 34000, margin: 0.10, growth: 3, cyc: 1.9, rateSens: 1.2, pricing: 0.35, disrupt: 0.25, debt: 1.3, payout: 0.45 }),

  /* ── Things you want ─────────────────────────────────────────────── */
  C('coffee', 'Harbor Roasters', 'HRB', 'consumer',
    'Thirty-two thousand coffee shops, and an app most customers pay through.',
    'Sells a cheap commodity at a very high price, in a comfortable room.',
    'Commuters, every single morning.',
    'A recession turns a daily habit into a weekly treat.',
    'Premium retail habit — the brand justifies the price',
    { rev0: 32000, margin: 0.14, growth: 8, cyc: 1.4, rateSens: 1.0, pricing: 0.85, disrupt: 0.3, debt: 1.1, payout: 0.45 }),
  C('burgers', 'Copper Kettle', 'CKT', 'consumer',
    'Forty thousand restaurants, and it owns barely any of them.',
    'Franchisees run the shops and pay a royalty plus rent on the land.',
    'Everybody, cheaply, quickly.',
    'Fashion and health, and franchisees who can revolt over fees.',
    'Franchise plus property — asset-light royalties',
    { rev0: 25000, margin: 0.31, growth: 6, cyc: 0.9, rateSens: 1.2, pricing: 0.8, disrupt: 0.3, debt: 1.8, payout: 0.6 }),
  C('sportswear', 'Ridgeline Athletic', 'RGA', 'consumer',
    'Trainers and kit, designed in Oregon and made by somebody else entirely.',
    'A brand children ask for by name, on a shoe that costs very little to make.',
    'Teenagers, and their parents.',
    'One bad sponsorship or one shift in taste and the brand is a punchline.',
    'Athletic brand — outsourced manufacture, owned demand',
    { rev0: 30000, margin: 0.12, growth: 8, cyc: 1.5, rateSens: 0.9, pricing: 0.75, disrupt: 0.4, debt: 0.4, payout: 0.35 }),
  C('airline', 'Blue Ridge Air', 'BRA', 'consumer',
    'Flies people between a hundred and forty airports.',
    'Fills seats. An empty seat is worth nothing the second the door shuts.',
    'Travellers, and more profitably the companies that send them.',
    'Fuel, wages and leases are fixed. The fare is not.',
    'Airline — high fixed cost, perishable product',
    { rev0: 26000, margin: 0.05, growth: 6, cyc: 2.4, rateSens: 1.9, pricing: 0.35, disrupt: 0.25, debt: 2.3, payout: 0.1 }),
  C('hotels', 'Camden Hotels', 'CMD', 'consumer',
    'Hotels in six hundred cities, most of them owned by somebody else.',
    'Runs them for a fee and a share, and owns the loyalty programme.',
    'Business travellers, and everyone else at weekends.',
    'The first thing companies cut, and the first thing families cut.',
    'Asset-light hospitality — fees, not buildings',
    { rev0: 14000, margin: 0.17, growth: 8, cyc: 2.0, rateSens: 1.5, pricing: 0.7, disrupt: 0.35, debt: 1.5, payout: 0.4 }),

  /* ── Pipes and wires ─────────────────────────────────────────────── */
  C('telecom', 'Northstar Communications', 'NSC', 'infra',
    'Mobile and broadband. Towers, fibre, and a bill every month.',
    'Enormous fixed cost, then almost nothing per additional customer.',
    'Nearly everybody, monthly, for ever.',
    'Spectrum auctions cost tens of billions and arrive on somebody else’s schedule.',
    'Network — fixed cost then pure margin',
    { rev0: 74000, margin: 0.15, growth: 2, cyc: 0.3, rateSens: 2.2, pricing: 0.6, disrupt: 0.3, debt: 2.5, payout: 0.7 }),
  C('utility', 'Allegheny Electric', 'ALE', 'infra',
    'The electricity utility for four states, on a regulated return.',
    'A commission decides what it may earn. It earns exactly that.',
    'Every home and business connected.',
    'A commission in a bad mood, and wildfires it may be liable for.',
    'Regulated utility — safe, capped, and rate-sensitive',
    { rev0: 21000, margin: 0.16, growth: 3, cyc: 0.1, rateSens: 2.4, pricing: 0.45, disrupt: 0.1, debt: 2.6, payout: 0.7 }),
  C('datacenter', 'Foundry Data Centers', 'FDC', 'infra',
    'Buildings full of servers, let to cloud companies on long leases.',
    'Collects rent on a property nobody can move out of quickly.',
    'The cloud businesses that would rather not own buildings.',
    'It is property with a technology story, and property answers to rates.',
    'Digital property — a leveraged rent stream',
    { rev0: 6800, margin: 0.33, growth: 14, cyc: 0.5, rateSens: 2.8, pricing: 0.6, disrupt: 0.2, debt: 2.7, payout: 0.65 }),
  C('waste', 'Sterling Waste', 'STW', 'infra',
    'Bins, lorries and landfill, on municipal contracts.',
    'Charges to take rubbish away, on contracts that renew almost automatically.',
    'Cities, businesses and households.',
    'Landfill permits are almost impossible to get — which is also the moat.',
    'Waste — dull, regulated, and paid whatever happens',
    { rev0: 9200, margin: 0.17, growth: 5, cyc: 0.3, rateSens: 1.4, pricing: 0.8, disrupt: 0.15, debt: 1.5, payout: 0.5 }),
  C('towers', 'Summit Tower', 'SMT', 'infra',
    'Forty thousand mobile masts, rented to the networks.',
    'One mast, three tenants, and each extra tenant is nearly pure profit.',
    'Every mobile network, on twenty-year leases.',
    'Its customers keep merging, and each merger removes a tenant.',
    'Tower REIT — operating leverage and consolidation risk',
    { rev0: 7600, margin: 0.36, growth: 7, cyc: 0.2, rateSens: 2.9, pricing: 0.65, disrupt: 0.25, debt: 3.0, payout: 0.75 }),
];

export const bySector = (id) => COMPANIES.filter((c) => c.sector === id);
export const byId = Object.fromEntries(COMPANIES.map((c) => [c.id, c]));

export function validate() {
  const errs = [];
  const ids = new Set(), tickers = new Set();
  const sectorIds = new Set(SECTORS.map((s) => s.id));
  COMPANIES.forEach((c) => {
    if (ids.has(c.id)) errs.push(`${c.id}: duplicate id`);
    if (tickers.has(c.ticker)) errs.push(`${c.id}: duplicate ticker ${c.ticker}`);
    ids.add(c.id); tickers.add(c.ticker);
    if (!sectorIds.has(c.sector)) errs.push(`${c.id}: unknown sector ${c.sector}`);
    ['what', 'how', 'who', 'risk', 'model'].forEach((k) => {
      if (!c[k] || c[k].length < 12) errs.push(`${c.id}: ${k} is too thin to study`);
    });
    const d = c.dna;
    ['rev0', 'margin', 'growth', 'cyc', 'rateSens', 'pricing', 'disrupt', 'debt', 'payout']
      .forEach((k) => { if (typeof d[k] !== 'number') errs.push(`${c.id}: dna.${k} missing`); });
    if (d.margin <= 0 || d.margin > 0.6) errs.push(`${c.id}: margin ${d.margin} is not plausible`);
    if (d.pricing < 0 || d.pricing > 1) errs.push(`${c.id}: pricing must be 0..1`);
    if (d.payout < 0 || d.payout > 1) errs.push(`${c.id}: payout must be 0..1`);
  });
  SECTORS.forEach((s) => {
    const n = bySector(s.id).length;
    if (n < 4) errs.push(`sector ${s.id} has only ${n} companies — too thin to compare within`);
  });
  return errs;
}
