/* tryit.js — "try it" before the questions (D1, FAMILY-STANDARD §6).

   A lesson that is about a sum gets a small machine to play with between the
   reading and the drill: change a number with − and +, watch the working
   change. The why, by doing, before the practice. Pure: a widget is its
   numbers and a compute(); the view draws it and the shell steps it.

   Every number here is the child's to choose — nothing is a claim about the
   real world, so nothing needs a source beyond the arithmetic shown. */
const W = {
  c3b: { title: 'Split a pay day', vars: { pay: [100, 20, 400, 20, 'Pay'], save: [30, 0, 100, 10, 'Save %'] },
    compute: ({ pay, save }) => {
      const s = Math.round(pay * save / 100), rest = pay - s;
      return { rows: [['Into Save', s], ['Left for everything else', rest]], says: `${save} in every 100 goes to Save: ${pay} × ${save} ÷ 100 = ${s}.` };
    } },
  c3d: { title: 'How many weeks?', vars: { price: [600, 100, 2000, 100, 'Price'], weekly: [50, 10, 300, 10, 'Saved a week'] },
    compute: ({ price, weekly }) => { const w = Math.ceil(price / weekly); return { rows: [['Weeks', w]], says: `${price} ÷ ${weekly} = ${(price / weekly).toFixed(1).replace(/\.0$/, '')}, so ${w} pay days.` }; } },
  c4c: { title: 'The small monthly one', vars: { monthly: [30, 5, 200, 5, 'A month'] },
    compute: ({ monthly }) => ({ rows: [['A year', monthly * 12]], says: `${monthly} × 12 = ${monthly * 12}. Would you pay that in one go?` }) },
  c6b: { title: 'What a loan really costs', vars: { borrow: [500, 100, 2000, 100, 'Borrowed'], pay: [60, 10, 300, 10, 'Paid a month'], months: [10, 2, 24, 1, 'Months'] },
    compute: ({ borrow, pay, months }) => { const t = pay * months, c = t - borrow;
      return { rows: [['Handed over', t], ['It cost', c]], says: `${pay} × ${months} = ${t}, minus the ${borrow} borrowed = ${c}.${c < 0 ? ' (That is less than you borrowed — not a real loan!)' : ''}` }; } },
  c7a: { title: 'Watch it snowball', vars: { start: [100, 50, 1000, 50, 'Start'], grow: [10, 1, 20, 1, 'Grows, per 100 a year'], years: [3, 1, 10, 1, 'Years'] },
    compute: ({ start, grow, years }) => { let v = start; const steps = [];
      for (let y = 1; y <= years; y++) { v = v * (1 + grow / 100); steps.push(Math.round(v)); }
      return { rows: [['After ' + years + (years === 1 ? ' year' : ' years'), Math.round(v)], ['Added without you doing anything', Math.round(v) - start]], says: `Year by year: ${steps.join(', ')}. Each step is bigger than the last.` }; } },
  c7f: { title: 'The doubling trick', vars: { grow: [6, 1, 24, 1, 'Grows, per 100 a year'] },
    compute: ({ grow }) => ({ rows: [['About this many years to double', Math.round(72 / grow * 10) / 10]], says: `72 ÷ ${grow} ≈ ${Math.round(72 / grow * 10) / 10}. A rough guide, never a promise.` }) },
  c8a: { title: 'Revenue, cost, profit', vars: { sold: [40, 0, 120, 5, 'Sold'], price: [20, 5, 60, 1, 'Price each'], cost: [8, 1, 40, 1, 'Cost each'] },
    compute: ({ sold, price, cost }) => { const r = sold * price, k = sold * cost;
      return { rows: [['Revenue', r], ['Cost', k], ['Profit', r - k]], says: `${sold} × ${price} = ${r} in, ${sold} × ${cost} = ${k} out, ${r - k} left.` }; } },
  c8e: { title: 'Find the break-even', vars: { rent: [240, 60, 600, 20, 'Rent'], price: [20, 5, 60, 1, 'Price each'], cost: [8, 1, 40, 1, 'Cost each'] },
    compute: ({ rent, price, cost }) => { const each = price - cost;
      if (each <= 0) return { rows: [['Sales to break even', '—']], says: `Each sale loses ${cost - price}. No number of sales covers the rent.` };
      const n = Math.ceil(rent / each); return { rows: [['Each sale leaves', each], ['Sales to break even', n]], says: `${rent} ÷ ${each} = ${(rent / each).toFixed(1).replace(/\.0$/, '')}, so ${n} sales. Sale ${n + 1} is profit.` }; } },
};

export const WIDGETS = W;
export function has(id) { return !!W[id]; }
export function values(id, state) {
  const w = W[id], st = (state && state[id]) || {};
  return Object.fromEntries(Object.entries(w.vars).map(([k, [v0]]) => [k, st[k] != null ? st[k] : v0]));
}
export function step(state, id, key, dir) {
  const w = W[id]; if (!w || !w.vars[key]) return state;
  const [, min, max, inc] = w.vars[key], v = values(id, state);
  const next = Math.max(min, Math.min(max, v[key] + (dir > 0 ? inc : -inc)));
  return { ...state, [id]: { ...(state && state[id]), [key]: next } };
}
export function run(id, state) { return W[id].compute(values(id, state)); }
