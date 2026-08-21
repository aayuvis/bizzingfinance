/* fmt.js — currency is a setting, never an assumption.
   Indian grouping is not a nicety: a child who reads 12,00,000 at home
   must not be taught by this app that it is wrong. */

export const CURRENCIES = {
  INR: { sign: '₹', locale: 'en-IN', name: 'Rupees',   coins: [1, 2, 5, 10, 20], notes: [10, 20, 50, 100, 200, 500] },
  USD: { sign: '$', locale: 'en-US', name: 'Dollars',  coins: [1, 5, 10, 25],    notes: [1, 5, 10, 20, 50, 100] },
  GBP: { sign: '£', locale: 'en-GB', name: 'Pounds',   coins: [1, 2, 5, 10, 20, 50], notes: [5, 10, 20, 50] },
  EUR: { sign: '€', locale: 'de-DE', name: 'Euro',     coins: [1, 2, 5, 10, 20, 50], notes: [5, 10, 20, 50, 100] },
  AED: { sign: 'د.إ', locale: 'en-AE', name: 'Dirham', coins: [25, 50],          notes: [5, 10, 20, 50, 100] },
};

/* Prices are authored as RELATIVE values (a "unit"), so the whole catalogue
   re-prices per currency without a rewrite. 1 unit ≈ one small purchase. */
const RATE = { INR: 10, USD: 0.25, GBP: 0.2, EUR: 0.25, AED: 1 };

let cur = 'INR';
export function setCurrency(c) { if (CURRENCIES[c]) cur = c; }
export function currency() { return cur; }
export function sign() { return CURRENCIES[cur].sign; }

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
export function pct(n) { return Math.round(n * 100) + '%'; }
export const DAY = 86400000;
export function dayIndex(ts) { return Math.floor((ts - new Date(ts).getTimezoneOffset() * 60000) / DAY); }
export function shortDate(ts) {
  return new Date(ts).toLocaleDateString(CURRENCIES[cur].locale, { day: 'numeric', month: 'short' });
}
export function weekday(ts) {
  return new Date(ts).toLocaleDateString(CURRENCIES[cur].locale, { weekday: 'long' });
}
