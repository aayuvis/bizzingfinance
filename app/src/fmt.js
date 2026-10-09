/* fmt.js — currency is a setting, never an assumption.
   Indian grouping is not a nicety: a child who reads 12,00,000 at home
   must not be taught by this app that it is wrong. */

/* `coins` are in the currency's smallest unit — `minor` of them make one of the
   main unit (cents, pence, fils; a rupee coin is a whole rupee, so INR's minor is 1).
   `sub` writes an amount smaller than one main unit the way a shop label does. */
export const CURRENCIES = {
  INR: { sign: '₹', locale: 'en-IN', name: 'Rupees',   coins: [1, 2, 5, 10, 20], notes: [10, 20, 50, 100, 200, 500], minor: 1 },
  USD: { sign: '$', locale: 'en-US', name: 'Dollars',  coins: [1, 5, 10, 25],    notes: [1, 5, 10, 20, 50, 100], minor: 100, sub: (n) => n + '¢' },
  GBP: { sign: '£', locale: 'en-GB', name: 'Pounds',   coins: [1, 2, 5, 10, 20, 50], notes: [5, 10, 20, 50], minor: 100, sub: (n) => n + 'p' },
  EUR: { sign: '€', locale: 'de-DE', name: 'Euro',     coins: [1, 2, 5, 10, 20, 50], notes: [5, 10, 20, 50, 100], minor: 100, sub: (n) => n + ' ct' },
  AED: { sign: 'د.إ', locale: 'en-AE', name: 'Dirham', coins: [25, 50],          notes: [5, 10, 20, 50, 100], minor: 100, sub: (n) => n + ' fils' },
};

/* Prices are authored as RELATIVE values (a "unit"), so the whole catalogue
   re-prices per currency without a rewrite. 1 unit ≈ one small purchase. */
const RATE = { INR: 10, USD: 0.25, GBP: 0.2, EUR: 0.25, AED: 1 };

let cur = 'INR';
export function setCurrency(c) { if (CURRENCIES[c]) cur = c; }
export function currency() { return cur; }
export function sign() { return CURRENCIES[cur].sign; }

/* Same purchasing power, different agreement — used when a child changes the
   currency setting, so the town converts rather than resetting. */
export function convert(n, from, to) {
  if (from === to) return n;
  return n / RATE[from] * RATE[to];
}
export function price(units) {
  const raw = units * RATE[cur];
  return raw >= 100 ? Math.round(raw / 10) * 10 : Math.round(raw);
}
export function money(n, opts) {
  const c = CURRENCIES[cur];
  const v = Math.round(n);
  const s = new Intl.NumberFormat(c.locale, { maximumFractionDigits: 0 }).format(Math.abs(v));
  const body = c.sign + s;
  if (opts && opts.signed && v > 0) return '+' + body;
  return v < 0 ? '−' + body : body;
}
/* §1.6 · ONE formatter for amounts counted in the smallest unit: 25¢, 50 fils,
   20p — and £1.20, not "£120" or "£1". Change Rush's coins and targets and every
   game price that has to ADD UP use it, so a sum on screen is a sum of what is on
   screen. `minorPrice` is the price-unit's worth in that smallest unit, exactly:
   no rounding, so twelve of a monthly price is twelve times what was shown. */
export function minorPrice(units) {
  const c = CURRENCIES[cur];
  return Math.round(units * RATE[cur] * (c.minor || 1));
}
export function minorMoney(n) {
  const c = CURRENCIES[cur], m = c.minor || 1, v = Math.round(n), a = Math.abs(v);
  let body;
  if (m === 1) body = c.sign + new Intl.NumberFormat(c.locale, { maximumFractionDigits: 0 }).format(a);
  else if (a < m && c.sub) body = c.sub(a);
  else {
    const frac = a % m ? 2 : 0;
    body = c.sign + new Intl.NumberFormat(c.locale, { minimumFractionDigits: frac, maximumFractionDigits: frac }).format(a / m);
  }
  return v < 0 ? '−' + body : body;
}
/* Interest arrives in bits smaller than a coin; this is the one place they are shown. */
export function moneyExact(n) {
  const c = CURRENCIES[cur];
  return c.sign + new Intl.NumberFormat(c.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n));
}
/* Stall of My Own keeps its season in rupee-scale whole numbers (one town unit is ten of
   them, always even), so a ledger converts EXACTLY into the child's currency and still adds
   up: ₹40 is $1.00, £0.80, €1.00, 4 dirham. Whole amounts show whole; the rest to the cent. */
export function stallMoney(n) {
  const v = convert(n, 'INR', cur), r = Math.round(v * 100) / 100;
  if (Number.isInteger(r)) return money(r);
  return (r < 0 ? '−' : '') + moneyExact(Math.abs(r));
}
export function pct(n) { return Math.round(n * 100) + '%'; }
export const DAY = 86400000;
export function dayIndex(ts) { return Math.floor((ts - new Date(ts).getTimezoneOffset() * 60000) / DAY); }
export function shortDate(ts) {
  return new Date(ts).toLocaleDateString(CURRENCIES[cur].locale, { day: 'numeric', month: 'short' });
}
export function weekday(ts) {
  return new Date(ts).toLocaleDateString(CURRENCIES[cur].locale, { weekday: 'long' });
}
