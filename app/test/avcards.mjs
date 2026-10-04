/* avcards.mjs — the avatar cards the hello card opens (after Bizzing Bee's deck).

   Every one of the 96 has a card; the ranking is a true ranking (each place 1–96 used
   once, best overall first, the same on every run); the stats stay in range and are
   play, not money; the history is figure-free (rule 6) and every pack has its story;
   and the deck is what the child owns, always including the face they are wearing.
   Each check was watched failing first (a duplicate rank, a "1840", a pack without lore,
   a worn face missing from the deck). */
globalThis.window = globalThis.window || globalThis;
import { CATALOGUE } from '../src/catalogue.js';
import { cardOf, cardHTML, RANKING, FACTS, deckIds, STATS } from '../src/avcards.js';

let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log(`${c ? '  ok  ' : '  FAIL'} ${label}${detail ? '   ' + detail : ''}`); };

const cards = CATALOGUE.map((a) => cardOf(a.id));
ok(cards.every(Boolean) && CATALOGUE.every((a) => cardHTML(a.id).includes(a.name)), 'every one of the 96 has a card with its name on it', String(cards.length));
const ranks = cards.map((d) => d.rank).sort((a, b) => a - b);
ok(ranks.every((r, i) => r === i + 1), 'the ranking uses each place from 1 to 96 exactly once', ranks.slice(0, 6).join(','));
const byRank = [...cards].sort((a, b) => a.rank - b.rank);
ok(byRank.every((d, i) => !i || byRank[i - 1].overall >= d.overall), 'a better overall never ranks below a worse one');
ok(JSON.stringify(cards.map((d) => [d.rank, d.overall, d.fact])) === JSON.stringify(CATALOGUE.map((a) => cardOf(a.id)).map((d) => [d.rank, d.overall, d.fact])) && RANKING().length === 96, 'cards are the same every time — nothing on a card is random');
ok(cards.every((d) => STATS.every(([k]) => d.stats[k] >= 28 && d.stats[k] <= 99)), 'every stat is between 28 and 99');
const mean = (t) => { const xs = cards.filter((d) => d.tier === t).map((d) => d.overall); return xs.reduce((a, b) => a + b, 0) / xs.length; };
ok(mean('common') < mean('rare') && mean('rare') < mean('epic') && mean('epic') < mean('legendary'), 'rarer cards are stronger on average', ['common', 'rare', 'epic', 'legendary'].map((t) => t + ' ' + mean(t).toFixed(0)).join(' · '));
ok(!FACTS.some((f) => /\d/.test(f)) && cards.every((d) => !/\d/.test(d.lore + d.fact + d.power + d.powerLine)), 'the history of money carries no figure (rule 6), and nor does any story');
ok(cards.every((d) => d.lore && !d.lore.includes('{n}') && d.lore.includes(d.name)), 'every card has its own line of story, naming it');
ok(new Set(cards.map((d) => d.fact)).size >= 15, 'the history is spread across the deck, not one fact repeated', `${new Set(cards.map((d) => d.fact)).size} different facts`);
const s = { settings: {} }, kid = (avatar, owned = []) => ({ name: 'Asha', avatar, fam: { owned, worlds: [] }, learn: { done: {} } });
const commons = CATALOGUE.filter((a) => a.tier === 'common').map((a) => a.id);
ok(JSON.stringify(deckIds(s, kid('froggy'))) === JSON.stringify(commons), 'a new child’s deck is the 24 free faces', String(deckIds(s, kid('froggy')).length));
ok(deckIds(s, kid('froggy', ['corg'])).includes('corg') && !deckIds(s, kid('froggy')).includes('corg'), 'a face bought is in the deck; one not bought is not');
ok(deckIds(s, kid('melody')).includes('melody'), 'the face being worn is always in the deck, however it came');

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
