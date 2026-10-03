/* plan.js — the family plan, said plainly (owner's audit, 3 Oct 2026: "worlds sell a plan
   nobody can see the price or contents of").

   The price is the family's, not Finance's: the Bizzing Family Pass in Bizzing India's
   docs/06-commerce-and-books.md §2 ($99 a year; India ₹2,999), the same figure as Bizzing
   Bee's family tier. Other currencies are not priced in any family document, so none is
   shown — a dollar figure is better than an invented pound one.

   The contents are computed from the catalogue, so this page cannot promise a world or a
   face the code does not open. It is NOT on sale: an entitlement must come from the server
   (CLAUDE.md), and there is no server yet. Nothing here takes money, and nothing a child
   sees links to it (rule 8). */
import { LOOKS, WORLD_PRICE } from './looks.js';
import { PACKS, CATALOGUE } from './catalogue.js';

export const PLAN = {
  name: 'Bizzing Family Pass',
  price: { USD: '$99 a year', INR: '₹2,999 a year' },
  source: "Bizzing India · docs/06 Commerce §2, the Family Pass (matches Bizzing Bee's family tier)",
  onSale: false,
};

export function priceFor(currency) {
  return PLAN.price[currency] || PLAN.price.USD + ' (priced in dollars — a local price is not set yet)';
}

/* what the plan opens in Finance, from the same tables the Shop sells from */
export function contents() {
  const worlds = LOOKS.filter((w) => w.n > 2);
  const packs = PACKS.filter((p) => worlds.some((w) => Math.ceil(p.n / 2) === w.n));
  const faces = CATALOGUE.filter((a) => packs.some((p) => p.n === a.pack)).length;
  const free = LOOKS.filter((w) => w.n <= 2);
  return { worlds, packs, faces, free, eachWorld: WORLD_PRICE };
}
