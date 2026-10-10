/* generate.js — retrieval items the town writes itself (docs/05 §B1: "authored content
   is the seed; the simulation generates the volume").

   Each objective has three authored retrieval items, and a child revising an idea for a
   year used to meet those same three forever. An objective listed here can also be asked
   in fresh numbers: drawn from a seed, priced in the child's own currency, and SIZED TO
   THE MATHS THEY HAVE MET (ledger.mathsCeiling — measured by placement.js, guessed until
   then). Same idea, different numbers, so a remembered answer is not a known idea.

   Two shapes: `num`, where the child types the amount (no options to eliminate), and the
   ordinary four-option kind. Every number is hypothetical and says so by being a story
   about Pip or Mags, never a claim about the real world (rule 6). Pure: same seed, same
   currency, same ceiling — same question. */
import { coin, money, currency, setCurrency, CURRENCIES } from './fmt.js';
import { SCENES, NUM_SCENES } from './scenes.js';

/* a seeded generator, so an id like "EARN-2~41" always means the same question */
function rng(seed) {
  let h = (seed >>> 0) || 1;
  return () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

/* One "coin" of the currency in round numbers: ₹10, $1, £1, €1, AED 1. Derived from the
   same table every price uses, so nothing here assumes a currency. */
const step = coin;
const m = (n) => money(n);

/* small numbers until the child has met bigger ones */
const size = (cx) => (cx.ceil >= 9 ? 'big' : 'small');

const WHO = ['Pip', 'Mags', 'Bea', 'Bo', 'Nana Bizz'];
const JOBS = ['stacking crates', 'delivering flyers', 'sweeping Market Row', 'minding the stall', 'washing the bandstand'];
const THINGS = ['a kite', 'a cricket bat', 'a paint set', 'a bicycle bell', 'a board game', 'a lantern'];

/* ── the kit for four-option ones ─────────────────────────────────────────
   A judgement question is built from POOLS of scenario parts, so two seeds give two
   genuinely different situations rather than one sentence with the name swapped. */
const other = (r, w) => pick(r, WHO.filter((x) => x !== w));
function draw(r, arr, k) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a.slice(0, k);
}
/* one right answer among n − 1 plausible wrong ones, at a drawn position (shuffledDrill
   permutes again by card id, so position never carries the answer either way) */
function mc(r, q, right, wrongs, why, n = 4) {
  const opts = draw(r, wrongs.filter((x) => x !== right), n - 1);
  const a = int(r, 0, opts.length);
  opts.splice(a, 0, right);
  return { q, opts, a, why };
}
const bare = (t) => t.replace(/^(a|an|the) /, '');
const SHOPS = ['Market Row', 'Mags’s stall', 'the corner shop', 'the toy stall', 'the big supermarket'];
const WEBSHOPS = ['the Bizzington toy website', 'an online bookshop', 'the arcade app', 'a game shop app'];
const FREEAPPS = ['a free puzzle game', 'a free colouring app', 'a free quiz app', 'a free racing game', 'a free video channel'];
const TEMPTS = ['a new game is on offer', 'Bo shows off new trainers', 'the fair comes to town', 'a shiny kite appears in Mags’s window', 'there is a sale on comics'];
const COMPANIES = ['Sunrise Grains', 'Chai Chain Co', 'Rocket Rickshaws', 'Sabun & Sons'];
const LENDERS = ['the Bizzington bank', 'Nana Bizz', 'the lending desk at the bank', 'Mags'];
const SURPRISES = [
  { t: 'a burst bike tyre', ev: 'a bike tyre bursts' },
  { t: 'a cracked phone screen', ev: 'a phone screen cracks' },
  { t: 'a pair of snapped glasses', ev: 'a pair of glasses snaps' },
  { t: 'a school-trip fee nobody mentioned until today', ev: 'a school-trip fee turns up out of nowhere' },
  { t: 'a lost bus pass', ev: 'the bus pass goes missing' },
];

export const GEN = {
  'EARN-2': (r, cx) => {
    const h = size(cx) === 'big' ? int(r, 3, 12) : int(r, 2, 5), p = step() * (size(cx) === 'big' ? int(r, 4, 15) : int(r, 2, 6));
    const w = pick(r, WHO), j = pick(r, JOBS);
    return { kind: 'num', hint: 'The hours, times what one hour pays.', q: `${w} spends ${h} hours ${j} at ${m(p)} an hour. How much is that?`, value: h * p,
      why: `${h} hours × ${m(p)} — an hour is worth what it pays, so the hours multiply it.` };
  },
  'EARN-4': (r, cx) => {
    const s = step(), h1 = int(r, 2, 4), h2 = h1 + int(r, 1, 3);
    let r1 = int(r, 3, 9), r2 = int(r, 3, 9); if (r1 === r2) r2 += 1;
    const ja = pick(r, JOBS), jb = pick(r, JOBS.filter((x) => x !== ja));
    const pa = h1 * r1 * s, pb = h2 * r2 * s;
    return { q: `Two shifts on the board: ${ja} pays ${m(pa)} for ${h1} hours; ${jb} pays ${m(pb)} for ${h2} hours. Which pays more for each hour?`,
      opts: [cap(ja), cap(jb), 'They pay the same for each hour'], a: r1 > r2 ? 0 : 1,
      why: `Divide by the hours: ${m(pa)} ÷ ${h1} is ${m(r1 * s)} an hour; ${m(pb)} ÷ ${h2} is ${m(r2 * s)}. The bigger total is not always the better rate.` };
  },
  'KEEP-1': (r, cx) => {
    const s = step(), big = size(cx) === 'big';
    const a = s * (big ? int(r, 3, 15) * 10 : int(r, 2, 6)), b = s * (big ? int(r, 2, 12) * 10 : int(r, 1, 5));
    const inn = a + b + s * (big ? int(r, 5, 60) * 10 : int(r, 2, 15));   /* never more out than in */
    return { kind: 'num', hint: 'Start with what came in, then take away each thing that went out.', q: `Pay day brings ${m(inn)}. Out go ${m(a)} for the bus and ${m(b)} for lunch. What is left over?`, value: inn - a - b,
      why: `In, minus everything out: ${m(inn)} − ${m(a)} − ${m(b)}. What is left is the only part you get to choose about.` };
  },
  'KEEP-2': (r, cx) => {
    const s = step(), part = pick(r, [2, 3, 4, 5]), pay = s * 10 * (size(cx) === 'big' ? int(r, 4, 20) : int(r, 1, 5));
    return { kind: 'num', hint: 'Find what one tenth of the pay is first.', q: `${pick(r, WHO)} saves ${part} in every 10 the moment pay lands. Pay day brings ${m(pay)}. How much goes into Save?`, value: pay / 10 * part,
      why: `${m(pay)} is ten lots of ${m(pay / 10)}, and ${part} of those lots go to Save. Split first, spend second.` };
  },
  'KEEP-4': (r, cx) => {
    const s = step(), per = s * int(r, 2, size(cx) === 'big' ? 12 : 6), weeks = int(r, 3, size(cx) === 'big' ? 15 : 8), thing = pick(r, THINGS);
    return { kind: 'num', hint: 'How many weekly amounts fit into the price?', q: `${cap(thing)} costs ${m(per * weeks)}. You put ${m(per)} towards it every week. How many weeks until it is yours?`, value: weeks,
      why: `${m(per * weeks)} ÷ ${m(per)} a week = ${weeks} weeks. A price and a weekly amount turn a wish into a date.` };
  },
  'CHOOSE-4': (r, cx) => {
    const s = step(), n1 = pick(r, [2, 3, 4]), n2 = n1 * pick(r, [2, 3]);
    const u1 = int(r, 3, 9), u2 = u1 + pick(r, [-2, -1, 1, 2]);
    const thing = pick(r, ['pencils', 'mangoes', 'notebooks', 'balloons']);
    return { q: `Mags sells ${thing}: ${n1} for ${m(n1 * u1 * s)}, or ${n2} for ${m(n2 * u2 * s)}. Which is better value for each one?`,
      opts: [`${n1} for ${m(n1 * u1 * s)}`, `${n2} for ${m(n2 * u2 * s)}`, 'They cost the same for each one'], a: u1 < u2 ? 0 : 1,
      why: `Price for one: ${m(u1 * s)} in the small pack, ${m(u2 * s)} in the big one. Bigger is not always cheaper — work it out per one.` };
  },
  'CHOOSE-7': (r, cx) => {
    const s = step(), a = s * int(r, 1, size(cx) === 'big' ? 9 : 4), what = pick(r, ['a juice', 'a comic', 'a snack', 'a game top-up']);
    return { kind: 'num', hint: 'One week’s cost, times the weeks in a year.', q: `${cap(what)} costs ${m(a)}, once a week, every week. How much is that in a year of 52 weeks?`, value: a * 52,
      why: `${m(a)} × 52 weeks. A small amount that repeats is a big amount wearing a disguise.` };
  },
  'GUARD-5': (r, cx) => {
    const s = step(), a = s * int(r, 2, size(cx) === 'big' ? 25 : 8);
    return { kind: 'num', hint: 'One month’s cost, times the months in a year.', q: `An app asks for just ${m(a)} a month. How much is that over 12 months?`, value: a * 12,
      why: `${m(a)} × 12. "Just" a month is the word doing the work — the year is the real price.` };
  },
  'GROW-2': (r, cx) => {
    const s = step(), bal = s * 100 * int(r, 1, size(cx) === 'big' ? 9 : 3), part = pick(r, [5, 10]);
    return { kind: 'num', hint: 'Count the hundreds in the balance; each hundred earns the same.', q: `A bank in a story pays ${part} in every 100 a year. ${pick(r, WHO)} leaves ${m(bal)} in it for a year. How much interest is that?`, value: bal / 100 * part,
      why: `${m(bal)} is ${bal / 100 / s} lots of ${m(100 * s)}, and each lot earns ${m(part * s)}. Interest is rent the bank pays for your money.` };
  },
  'GROW-3': (r, cx) => {
    const s = step(), bal = s * 100 * int(r, 1, 5);
    return { kind: 'num', hint: 'The second year’s tenth is a tenth of the NEW amount.', q: `${m(bal)} grows by a tenth of itself each year. After one year it is ${m(bal * 1.1)}. What is it after the second year?`, value: Math.round(bal * 1.21),
      why: `The second year adds a tenth of ${m(bal * 1.1)}, not of ${m(bal)} — the interest earns interest. That is why the second time is bigger.` };
  },
  'OWE-1': (r, cx) => {
    const s = step(), loan = s * 10 * int(r, 2, 10), fee = s * int(r, 1, 4), w = int(r, 2, 6);
    return { kind: 'num', hint: 'The cost of one week, times the weeks.', q: `Borrowing ${m(loan)} costs ${m(fee)} for every week you keep it. You keep it ${w} weeks. What did borrowing cost?`, value: fee * w,
      why: `${m(fee)} × ${w} weeks. A loan is not free money — the price is the extra you pay back, and it grows with time.` };
  },
  'OWE-2': (r, cx) => {
    const s = step(), w = int(r, 3, 8), pay = s * int(r, 3, 12), loan = pay * w - s * int(r, 2, 3 * w);
    return { kind: 'num', hint: 'Add up every payment, then take away what you borrowed.', q: `You borrow ${m(loan)} and pay it back as ${w} weekly payments of ${m(pay)}. How much more than you borrowed did you pay?`, value: pay * w - loan,
      why: `Everything paid back is ${w} × ${m(pay)} = ${m(pay * w)}; take away the ${m(loan)} borrowed. That difference is the number that matters.` };
  },

  /* ══ CHOOSE ════════════════════════════════════════════════════════════ */
  'CHOOSE-1': (r) => {
    const w = pick(r, WHO), s = pick(r, [
      { t: 'a new raincoat', need: 'walks to school every day in the rainy month, and the old raincoat has torn down the back', want: 'already has a raincoat that keeps the rain out, and the rainy month is over' },
      { t: 'new school shoes', need: 'has one pair of school shoes and the sole has split right through', want: 'has two pairs of school shoes that both still fit' },
      { t: 'a bus fare', need: 'has to cross the whole town to reach a shift on time', want: 'could walk the five minutes to the market on a dry, sunny day' },
      { t: 'a torch', need: 'has a power cut tonight and no other light in the house', want: 'has a working torch in the drawer and the lights are on' },
      { t: 'a new notebook', need: 'has homework due tomorrow and has filled the last page', want: 'has a spare, empty notebook on the shelf' },
      { t: 'a water bottle', need: 'is going on a long, hot walk and the old bottle leaks', want: 'has a bottle that works and just likes the colour of a new one' },
    ]);
    const f = int(r, 0, 2);
    if (f === 0) {
      const isNeed = r() < 0.5;
      return { q: `${w} ${isNeed ? s.need : s.want}. Is ${s.t} a need or a want for ${w} this week?`,
        opts: ['A need — without it, something really goes wrong', 'A want — nothing really goes wrong without it', 'Always a need, for anybody', 'Always a want, for anybody'], a: isNeed ? 0 : 1,
        why: `The test is what happens without it. ${isNeed ? 'Here, going without is a real problem, so this week it is a need.' : 'Here, nothing goes wrong without it, so this week it is a want.'} The same thing can be either — it depends on the person and the week.` };
    }
    if (f === 1) {
      return mc(r, `${w} ${s.need}. ${w} also wants ${pick(r, THINGS)}, and has enough money for only one. What is the useful question?`,
        'What goes wrong if each one is missing?', ['Which one is cheaper?', `Which one does ${w} like more?`, 'Which one would a friend choose?', 'Which one is newer?'],
        `The consequence is the test. Going without ${s.t} and going without a treat are not the same size of problem — that is what makes one a need.`);
    }
    const thing = pick(r, THINGS), where = pick(r, ['in Mags’s window', 'at the market', 'on a poster by the bandstand', 'in a friend’s bag']);
    return mc(r, `${w} sees ${thing} ${where} and says, “I need that!” What does ${w} most likely mean?`,
      `${w} would really like it`, [`${w} cannot get through the week without it`, `${cap(thing)} is a need for everybody`, `${w}’s old one has broken`, `${w} has been told to buy it`],
      'People say need when they mean want, and that is not lying — it is just how we talk. Noticing it is what stops the word deciding for you.');
  },
  'CHOOSE-2': (r, cx) => {
    const s = step(), w = pick(r, WHO), [t1, t2] = draw(r, THINGS, 2), p = s * (size(cx) === 'big' ? int(r, 12, 60) : int(r, 3, 9)), f = int(r, 0, 3);
    if (f === 0) return mc(r, `${w} has ${m(p)}. ${cap(t1)} and ${t2} both cost ${m(p)}, and ${w} likes both. ${w} buys ${t1}. What did the ${bare(t1)} really cost?`,
      `${m(p)}, plus the other one ${w} liked`, [`Just ${m(p)}`, `Nothing — ${w} had the money`, `${m(p)}, but only if ${w} regrets it`],
      'The price is what left the wallet. The cost also includes the thing you can no longer have — and that second half is the part people forget.');
    if (f === 1) {
      const j = pick(r, JOBS), act = pick(r, ['a game of cricket in the park', 'a kite afternoon on the hill', 'a swim in the river', 'a board-game afternoon with Bo', 'a picnic by the bandstand']);
      return mc(r, `${w} spends Saturday ${j} instead of ${act}, and earns ${m(p)}. What did the ${m(p)} cost ${w}?`,
        `The thing ${w} did not do instead`, [`Nothing — ${w} gained money`, 'The work itself', 'Nothing, because time is not money'],
        'It runs both ways. Earning has a cost too, and it is the thing you did not do instead.');
    }
    if (f === 2) return mc(r, `${w} chooses ${t1} over ${t2}, at ${m(p)} each. Which sentence names the choice honestly?`,
      `“I paid ${m(p)} and gave up ${t2}.”`, [`“I paid ${m(p)}, so that is all it cost.”`, '“It cost nothing — I had the money.”', `“I gave up ${m(p)} and ${t1}.”`],
      'Both halves are the cost: the money, and the second-best thing. Saying both out loud is how you find out whether you chose well.');
    return mc(r, `${w} is choosing between ${t1} and ${t2}. Why name the one ${w} does not pick?`,
      'Giving it up is part of the real cost, on top of the money', ['It does not matter once the choice is made', 'It tells you the price', 'So that the choice feels bad'],
      'If both were worth having, giving one up is a real cost. Naming it is how you check you actually chose well.');
  },
  'CHOOSE-3': (r, cx) => {
    const s = step(), w1 = pick(r, WHO), w2 = other(r, w1), [t1, t2] = draw(r, THINGS, 2), f = int(r, 0, 3);
    if (f === 0) {
      const p = s * (size(cx) === 'big' ? int(r, 20, 120) : int(r, 4, 12)), item = pick(r, ['bike', 'cricket bat', 'guitar', 'scooter', 'telescope']);
      return mc(r, `${w1} and ${w2} look at the same second-hand ${item}, priced at ${m(p)}. ${w1} buys it; ${w2} walks away. Why?`,
        `It is worth more than ${m(p)} to ${w1}, and less to ${w2}`, [`${w2} has made a mistake`, `The seller changed the price for ${w2}`, `The ${item} is broken`, `${w1} was tricked`],
        'Value sits in the person, not the object. That is why a trade can leave both sides better off — each wanted what they got more than what they gave.');
    }
    if (f === 1) {
      const a = s * int(r, 3, 9), b = a * 2;
      return mc(r, `Mags puts the price of ${t1} up from ${m(a)} to ${m(b)}. What happened to ${t1}?`,
        'Nothing — only what is being asked for it changed', ['It became better made', 'It became worth more to everyone', 'It became rarer'],
        'Price is a number a seller chose. It is information about the seller, and only sometimes information about the thing.');
    }
    if (f === 2) return mc(r, `${w1} has ${t1} and would rather have ${t2}. ${w2} has ${t2} and would rather have ${t1}. They swap. Who is better off?`,
      'Both of them', [`Only ${w1}`, `Only ${w2}`, 'Nobody — a swap cannot make anyone better off'],
      'Each one gave away a thing they valued less and got a thing they valued more. Same two objects, two different values — so both come out ahead.');
    return mc(r, `${cap(t1)} at ${pick(r, SHOPS)} has a very high price. When does that price tell ${w1} something useful?`,
      'When the reason for it is known, and the reason holds', ['Always — dearer means better', 'Never — prices mean nothing', 'When lots of people are buying it'],
      'A price can carry real information — better materials, more work, harder to get. But only when you know the reason, not just because it is large.');
  },
  'CHOOSE-5': (r) => {
    const w = pick(r, WHO), thing = pick(r, THINGS), shop = pick(r, SHOPS), f = int(r, 0, 3);
    const banner = pick(r, ['“Only 3 left at this price!”', '“Offer ends at midnight!”', '“Today only!”', '“Price goes up in 10 minutes!”', '“5 people are looking at this right now!”']);
    if (f === 0) return mc(r, `A sign on ${thing} at ${shop} says ${banner} What is that sign for?`,
      'To stop shoppers going away and thinking', ['To be helpful about how many are left', 'To warn shoppers honestly', 'To show the shop is busy'],
      'It may even be true. Its job is still to remove the pause, because the pause is where you notice you did not want it.');
    if (f === 1) return mc(r, `${w} sees ${banner} on ${thing} at ${shop}. What is the cheapest thing ${w} can do?`,
      `Wait a day and see if ${w} still wants it`, ['Buy it before it goes', 'Buy two, just in case', 'Ask the shop to hold it for a month'],
      'Waiting a day costs nothing and answers the question. If you still want it tomorrow, it was not the hurry talking.');
    if (f === 2) return mc(r, `The sign on ${thing} at ${shop} says ${banner} What happens to most deals like that a week or two later?`,
      'They very often come back', ['They go up for good', 'The thing disappears for ever', 'The price doubles'],
      'A deal that is urgent this week is usually urgent again next week. Watching one offer for a fortnight teaches this better than being told.');
    return mc(r, `${w} ignored ${banner} on ${thing}, waited a day, and still wanted it. What did waiting cost?`,
      `Almost nothing — and now ${w} knows it was a real want`, [`${w} missed the only chance`, 'Twice the price', 'A whole week of pay'],
      'The day bought certainty. If you still want it tomorrow, you buy it knowing it was you deciding, not the sign.');
  },
  'CHOOSE-6': (r, cx) => {
    const s = step(), w = pick(r, WHO), app = pick(r, FREEAPPS), f = int(r, 0, 3);
    if (f === 0) return mc(r, `${cap(app)} has lots of players and costs nothing to download. How does it make money?`,
      'From ads, things sold inside it, or information about the players', ['It does not — it is a gift', 'From the town hall', 'From the people who make it'],
      'Somebody paid for the people who built it. Working out who is the whole trick, and it usually turns out to be the player, later.');
    if (f === 1) {
      const big = size(cx) === 'big', thr = s * 10 * (big ? int(r, 4, 10) : int(r, 2, 5)), gap = s * int(r, 6, 14), fee = s * int(r, 2, gap / s - 3);
      return mc(r, `${pick(r, WEBSHOPS).replace(/^./, (c) => c.toUpperCase())} gives free delivery on orders over ${m(thr)}. Delivery is ${m(fee)}. ${w}’s basket is ${m(thr - gap)}. What is the shop hoping?`,
        `That ${w} adds ${m(gap)} of things not wanted, to save ${m(fee)}`, [`That ${w} feels looked after`, `That ${w} tells a friend about it`, `That ${w} shops again next week`],
        `Spending ${m(gap)} to save ${m(fee)} is not a saving. The line is placed exactly where it will tempt you to do that.`);
    }
    if (f === 2) return mc(r, `A free trial of the ${app.replace(/^a free /, '')}: “cancel any time”, but ${w} must give a card. What is the seller counting on?`,
      `That ${w} forgets to cancel`, [`That ${w} will love it`, `That ${w} will pay early`, `That ${w} will tell friends`],
      'Cancel-any-time is true and is not the point. Forgetting is the business model — which is why the reminder goes in the diary the day you sign up.');
    return mc(r, `${cap(pick(r, ['a free puzzle game', 'a free racing game', 'a free word game']))} costs nothing, but ${w} has to watch an advert between every level. What is ${w} paying with?`,
      'Attention — minutes of looking at adverts', ['Nothing at all', 'Money, taken later by surprise', 'Points from the game'],
      'If it is not money, it is attention or information. The advertiser pays the app for the minutes you spend looking.');
  },
  'CHOOSE-8': (r, cx) => {
    const s = step(), big = size(cx) === 'big', per = s * (big ? int(r, 10, 25) : int(r, 6, 12)), wk = big ? int(r, 3, 9) : int(r, 2, 5);
    const price = per * (wk - 1) + s * int(r, 1, per / s - 1), thing = pick(r, THINGS);
    return { kind: 'num', hint: 'Count the weeks of saving until it reaches the price — a part-week still needs a whole week.', q: `${cap(thing)} costs ${m(price)}. ${pick(r, WHO)} saves ${m(per)} every week. How many weeks until there is enough?`, value: wk,
      why: `${wk - 1} weeks gives ${m(per * (wk - 1))}, still ${m(price - per * (wk - 1))} short — so it takes ${wk} weeks, with ${m(per * wk - price)} spare. Now the waiting has a number, and you can weigh it against buying now.` };
  },
  'CHOOSE-9': (r) => {
    const w = pick(r, WHO), shop = pick(r, SHOPS), web = pick(r, WEBSHOPS);
    const t = pick(r, [
      { set: `At ${shop}, sweets are stacked right by the till.`, right: 'People wait there with nothing to do and their guard down', wrong: ['Sweets are small and fit there', 'It keeps them cool', 'They do not sell anywhere else'] },
      { set: `On ${web}, a box is already ticked to add gift wrapping to ${w}’s order.`, right: 'Most people never change what is already picked for them', wrong: ['It is a legal rule', 'It is a mistake on the website', 'Everybody wants gift wrapping'] },
      { set: `At ${shop}, the dearest of everything sits at eye level.`, right: 'People take what they see first', wrong: ['Those are the best quality', 'They are the easiest to stack', 'Cheap things are kept for regulars'] },
      { set: `At ${shop}, the bread and milk are right at the very back.`, right: 'Shoppers must walk past everything else to reach them', wrong: ['It is cooler at the back', 'The door is too busy', 'They are delivered at the back'] },
      { set: `On ${web}, the “Buy” button is big and bright, and “No thanks” is small and grey.`, right: 'The choice the seller wants is the easy one to press', wrong: ['Bright colours are easier to read', 'There was no room for a bigger button', 'Grey always means close'] },
      { set: `${cap(web)} keeps ${w}’s card saved, so paying is a single tap.`, right: 'With no pause, there is no moment to change your mind', wrong: ['It keeps the card safer', 'It helps the shop count', 'Every shop must do it'] },
    ]);
    return mc(r, `${t.set} Why was it done on purpose?`, t.right, t.wrong,
      'Shops and screens are designed by people whose job is to make buying easier. Naming the trick once makes it far easier to see the next time.');
  },
  'CHOOSE-10': (r, cx) => {
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO), f = int(r, 0, 2);
    const hint = 'Turn both offers into the same period first, then take the smaller from the bigger.';
    /* worked in coins (d, diff, wk…) and priced once at the end, so no choice made here
       depends on which currency the coins are in */
    if (f === 0) {
      const d = big ? int(r, 3, 12) : int(r, 2, 5); let diff = int(r, 1, big ? 20 : 6); while (diff === d || diff === 30) diff += 1;
      const B = 30 * d + (r() < 0.5 ? diff : -diff);
      return { kind: 'num', hint, q: `Offer A is ${m(s * d)} a day. Offer B is ${m(s * B)} for a 30-day month. Over the month, how much does the cheaper one save?`, value: s * diff,
        why: `${m(s * d)} × 30 = ${m(s * 30 * d)} against ${m(s * B)}, a gap of ${m(s * diff)}. Until both were in months, the two numbers could not be compared at all.` };
    }
    if (f === 1) {
      const wk = big ? int(r, 3, 12) : int(r, 1, 4);
      let mo = Math.round(52 * wk / 12) + pick(r, [-2, -1, 1, 2]);
      while (12 * mo === 52 * wk || [wk, mo, 52, 12].includes(Math.abs(12 * mo - 52 * wk))) mo += 1;
      return { kind: 'num', hint, q: `One club costs ${m(s * wk)} a week. Another costs ${m(s * mo)} a month. Over a year of 52 weeks, or 12 months, how much does the cheaper one save?`, value: s * Math.abs(12 * mo - 52 * wk),
        why: `${m(s * wk)} × 52 = ${m(s * 52 * wk)}; ${m(s * mo)} × 12 = ${m(s * 12 * mo)}. The difference is ${m(s * Math.abs(12 * mo - 52 * wk))} — invisible until both were in years.` };
    }
    const S = 10 * (big ? int(r, 4, 20) : int(r, 2, 8)); let fl = big ? int(r, 3, 25) : int(r, 1, 9);
    while (fl === S / 10 || [fl, S, 1, 10].includes(Math.abs(fl - S / 10))) fl += 1;
    return { kind: 'num', hint, q: `A stall pitch costs a flat ${m(s * fl)} a week, or 1 in every 10 of what you sell. ${w} sells ${m(s * S)} a week. How much does the cheaper deal save each week?`, value: s * Math.abs(fl - S / 10),
      why: `1 in 10 of ${m(s * S)} is ${m(s * S / 10)}, against the flat ${m(s * fl)}. Sell a different amount and the answer can flip — it depends on you, not on the offer.` };
  },
  'CHOOSE-11': (r) => {
    const s = step(), w = pick(r, WHO), tempt = pick(r, TEMPTS), f = int(r, 0, 3);
    const rule = pick(r, ['3 in every 10 of pay goes to Save', `the first ${m(s * int(r, 2, 9))} of pay goes to Save`, `nothing over ${m(s * int(r, 5, 15))} without waiting a day`, 'half of any gift goes to the goal']);
    if (f === 0) return mc(r, `Why did ${w} set the rule “${rule}” on a quiet evening, and not in a shop?`,
      'A quiet evening is calmer than any moment in front of something shiny', ['A rule made in a shop does not count', 'It is faster to decide at home', 'It saves more money by itself'],
      'The rule is not stronger than you. It was just made at a better moment than the one you will be standing in.');
    if (f === 1) return mc(r, `${w}’s rule: “${rule}”. Pay day comes, and ${tempt}. What keeps the rule working?`,
      'Running the rule first, before looking at anything else', ['Deciding all over again with the offer in front of you', 'Waiting to see how the week goes', 'Making the rule smaller just this week'],
      'In the moment you are not deciding at all — you are keeping a promise you already made. That is the whole reason it holds.');
    if (f === 2) return mc(r, `${w} broke the rule “${rule}” once, because ${tempt}. What is the useful response?`,
      'Ask whether the rule is wrong, or whether that was just a hard week', ['Scrap the rule', 'Promise never, ever to break it again', 'Make the rule so easy it never matters'],
      'One break is information, not a verdict. A rule you break every week is set wrong; a rule you broke once is still a rule.');
    return mc(r, `${w} has broken the rule “${rule}” every week for a month. What does that say?`,
      `The rule is probably set wrong for ${w}’s week`, [`${w} is bad with money`, 'Rules never work for anybody', 'Nothing — carry on exactly the same'],
      'A rule that breaks every week is not a rule, it is a wish. Change it to one that fits the real week, then keep that one.');
  },
  'CHOOSE-12': (r) => {
    const w = pick(r, WHO), [t1, t2, t3, t4] = draw(r, THINGS, 4), f = int(r, 0, 3);
    const ctx = pick(r, ['while queuing at the till', 'late at night on a screen', 'because a friend had one', 'in a “today only” sale', 'in a rush before the shop shut']);
    if (f === 0) return mc(r, `${w} looks back at last month. ${cap(t1)} and ${t2} were planned for weeks, and ${w} is still glad. ${cap(t3)} and ${t4} were bought ${ctx}, and ${w} wishes they were not. What is worth noticing?`,
      'How things were bought, not what they were, made the difference', [`${w} should stop buying things`, 'Planned things are the ones to avoid', 'Bad luck, twice over'],
      'One regret is an afternoon. Two with the same shape is a pattern about yourself — and a pattern is something you can catch next time.');
    if (f === 1) return mc(r, `When is the most useful moment for ${w} to judge whether ${t1} was worth it?`,
      'A week later, once the shop’s pull has gone', ['In the shop', 'The moment of paying', 'When a friend first sees it'],
      'In the shop you are being sold to. A week later you are not, and that is the only reading worth having.');
    if (f === 2) return mc(r, `${w} finds ${t1}, bought last month and never used. The money is gone. Why look back at it at all?`,
      'It improves the next decision', ['To feel bad about it', 'To tell other people', 'To get the money back'],
      'The money is gone either way. The only thing a look back can change is what happens the next time it looks like that.');
    return mc(r, `Three of ${w}’s regrets were all bought ${ctx}. What is that?`,
      'A pattern that can catch the next one', ['Bad luck', 'A reason never to buy anything', 'A coincidence'],
      'Three regrets with the same shape is a rule you have discovered about yourself, which is worth far more than the money.');
  },
  /* ══ EARN ══════════════════════════════════════════════════════════════ */
  'EARN-1': (r, cx) => {
    const s = step(), w = pick(r, WHO), w2 = other(r, w), f = int(r, 0, 3);
    const notEarned = [`A birthday gift from ${w2}`, 'Interest from the bank', 'A coin found on the path', 'A raffle prize at the fair', `A surprise present from ${w2}`];
    const why = 'Only money traded for time is a wage. Gifts, finds, prizes and interest arrive without costing an hour — and only the worked-for kind can be earned again on purpose.';
    if (f === 0) return mc(r, `Money reaches ${w}’s wallet four ways this week. Which one did ${w}’s time buy?`,
      `${pick(r, ['An hour', 'Two hours', 'A morning'])} ${pick(r, JOBS)}`, notEarned, why);
    if (f === 1) {
      const js = draw(r, JOBS, 3);
      return mc(r, `Money reaches ${w}’s wallet four ways this week. Which one came WITHOUT ${w} giving up any time for it?`,
        pick(r, notEarned), js.map((j) => `An hour ${j}`), why);
    }
    if (f === 2) return mc(r, `${w2} says, “I got ${m(s * (size(cx) === 'big' ? int(r, 20, 90) : int(r, 3, 9)))} this week.” What is the useful next question?`,
      'Where did it come from?', ['What will you spend it on?', 'Is that a lot?', 'Can I have some?'],
      'Where it came from tells you whether it will come again. A wage repeats; a gift was once.');
    return mc(r, `Why is it worth ${w} knowing which money was worked for?`,
      'It is the only kind that can be got more of on purpose', ['Worked money buys more', 'So the rest can be spent first', 'It is not worth knowing'],
      'You cannot arrange another birthday. You can arrange another hour of work — which is why it is the money you can plan on.');
  },
  'EARN-3': (r, cx) => {
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO), w2 = other(r, w), j = pick(r, JOBS), f = int(r, 0, 3);
    const occ = pick(r, ['a birthday', 'the new year', 'a visit', 'passing a swimming test', 'a good school report']);
    if (f === 0) return mc(r, `${w2} gives ${w} ${m(s * (big ? int(r, 30, 120) : int(r, 8, 20)))} for ${occ}. What should ${w} NOT do with that number?`,
      'Plan every week as if it will arrive again', ['Put some in the Save jar', 'Spend a little of it', 'Put some towards a goal'],
      'A gift is real money, and it is good news. It just came once — a plan built on it as if it repeats will be short every week after.');
    if (f === 1) {
      const [a, b, c, d] = draw(r, [2, 3, 4, 5, 6, 7, 8, 9], 4).map((x) => x * s * (big ? 5 : 1));
      return mc(r, `Which of these is income ${w} can build a week’s plan on?`,
        `${m(a)} every Saturday for ${j}`, [`${m(b)} found in an old coat`, `A ${m(c)} prize at the fair`, `A one-off ${m(d)} gift from ${w2}`],
        'Only the one that repeats can be planned on. The others are welcome, and they are not income — nothing says they will happen again.');
    }
    if (f === 2) {
      const o = s * (big ? int(r, 10, 30) : int(r, 3, 9)), g = 2 * s * (big ? int(r, 10, 40) : int(r, 4, 10));
      return mc(r, `One week ${w}’s wallet got ${m(o + g)}, because of a gift. An ordinary week brings ${m(o)}. What should a careful plan use?`,
        `The ordinary week’s ${m(o)}`, [`The gift week’s ${m(o + g)}`, `Halfway between: ${m(o + g / 2)}`, `The best week ${w} can imagine`],
        'The ordinary week is the one that comes back. Plan on that, and the gift becomes a bonus instead of a hole next week.');
    }
    const e = s * (big ? int(r, 10, 30) : int(r, 3, 8)), g = e * int(r, 3, 6);
    return mc(r, `${w} got ${m(g)} once from ${w2}, and earns ${m(e)} a week for ${j}. Which of these is income?`,
      `The ${m(e)} a week`, [`The ${m(g)} from ${w2}`, `Both, added together every week`, 'Neither of them'],
      'Income is what keeps arriving. The gift was a single good day; the weekly amount is what the plan can count on.');
  },
  'EARN-5': (r, cx) => {
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO), [j1, j2] = draw(r, JOBS, 2), f = int(r, 0, 3);
    if (f === 0) return mc(r, `All of ${w}’s money comes from ${j1}. What is the risk?`,
      'If that one stops, all of it stops at once', [`${w} will get bored`, `${w} will earn too much`, 'There is no risk'],
      'One source is fine until the day it stops. With two, a bad week is a dip instead of a cliff.');
    if (f === 1) {
      const x = s * (big ? int(r, 5, 25) : int(r, 2, 6));
      return mc(r, `${w} could have one job paying ${m(4 * x)} a week, or four small jobs paying ${m(x)} a week each. Which is steadier over a year?`,
        'The four small jobs', ['The one big job', 'Both are exactly as steady'],
        'The money is the same. But if one of four small jobs stops, three are still paying — if the one big job stops, nothing is.', 3);
    }
    if (f === 2) {
      const b = s * (big ? int(r, 5, 20) : int(r, 2, 6)), a = b + s * (big ? int(r, 3, 15) : int(r, 1, 4));
      return mc(r, `${w} earns ${m(a)} a week ${j1} and ${m(b)} a week ${j2}. Losing which one would hurt more?`,
        `${cap(j1)}, because it brings in the most`, [`${cap(j2)}, because it is the smaller one`, 'Neither — two jobs means no risk at all', 'Both would hurt exactly the same'],
        `${m(a)} is more of the week than ${m(b)}. Knowing which tap matters most tells you which one to protect — and why a third would help.`);
    }
    return mc(r, `${w} takes on a second job, ${j2}. What does that buy ${w}, besides money?`,
      'The freedom to say no to the first one', ['Nothing at all', 'A better rate in the first job', 'Fewer hours of work'],
      'With only one source, you cannot turn it down. A second one means the first is a choice, not a must.');
  },
  'EARN-6': (r, cx) => {
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO);
    const t = pick(r, [{ job: 'folding flyers', unit: 'bundle' }, { job: 'washing bikes', unit: 'bike' }, { job: 'packing mango boxes', unit: 'box' }, { job: 'painting fence posts', unit: 'post' }]);
    const p = s * int(r, 8, big ? 15 : 12), n1 = int(r, 2, 4), n2 = n1 + int(r, 2, 3);
    return { kind: 'num', hint: 'Find how many more get done in an hour, then what those extra ones pay.', q: `${w} is paid ${m(p)} for each ${t.unit} when ${t.job}. ${w} used to do ${n1} an hour; with practice it is now ${n2} an hour. How much more is an hour worth now?`, value: (n2 - n1) * p,
      why: `Before: ${n1} × ${m(p)} = ${m(n1 * p)} an hour. Now: ${n2} × ${m(p)} = ${m(n2 * p)}. Same job, same pay per ${t.unit} — getting better is what made the hour worth ${m((n2 - n1) * p)} more.` };
  },
  'EARN-7': (r, cx) => {
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO), f = int(r, 0, 1);
    const a = s * (big ? int(r, 4, 20) * 10 : int(r, 2, 6)), b = s * (big ? int(r, 2, 9) * 10 : int(r, 1, 4));
    const T = a + b + s * (big ? int(r, 5, 40) * 10 : int(r, 2, 12));
    if (f === 0) return { kind: 'num', hint: 'Start from what the stall took, and take away everything it cost to run.', q: `${w}’s stall took ${m(T)} this week. Stock cost ${m(a)} and the pitch cost ${m(b)}. How much of the takings is really ${w}’s?`, value: T - a - b,
      why: `${m(T)} − ${m(a)} − ${m(b)}. The till holds the business’s money; only what is left after running it is yours to pay yourself.` };
    return { kind: 'num', hint: 'Start from what is in the till, then take away what was paid out to the owner.', q: `The till at ${w}’s stall holds ${m(T)}. ${w} takes ${m(a)} out as pay. How much is left for the stall to buy stock with?`, value: T - a,
      why: `${m(T)} − ${m(a)}. Money taken out for yourself is money the stall no longer has — which is why the two are kept apart.` };
  },
  'EARN-8': (r, cx) => {
    const s = step(), big = size(cx) === 'big', A = s * (big ? int(r, 15, 40) : int(r, 5, 9)), K = big ? 12 : 3;
    let d = [1, -1, 2, -2];
    for (let k = 0; k < 20; k++) {
      const t = [0, 0, 0].map(() => (r() < 0.5 ? -1 : 1) * int(r, 1, K)), last = -(t[0] + t[1] + t[2]);
      if (last !== 0 && [...t, last].every((x) => A / s + x > 0)) { d = [...t, last]; break; }
    }
    const wk = d.map((x) => A + x * s);
    return { kind: 'num', hint: 'Add up all the weeks, then share the total equally between them.', q: `${pick(r, WHO)}’s weeks of jobs paid ${m(wk[0])}, ${m(wk[1])}, ${m(wk[2])} and ${m(wk[3])}. What is one week worth on average?`, value: A,
      why: `The total is ${m(4 * A)}, shared over 4 weeks: ${m(A)}. Build the plan at or below that — the bills arrive whatever the week did.` };
  },
  /* ══ KEEP ══════════════════════════════════════════════════════════════ */
  'KEEP-3': (r) => {
    const w = pick(r, WHO), f = int(r, 0, 3);
    const FIX = ['Rent for the stall', 'The weekly fee for the market pitch', 'The monthly phone plan', 'Rent on the garden shed', 'The music club, paid by the month'];
    const VAR = ['A snack after school', 'A trip to the fair', 'A comic', 'An ice gola on a hot day', 'A new kite string', 'A birthday present for a friend'];
    const why = 'Some costs arrive whatever you do — rent, fees, plans. Others follow what you choose. Only the second kind can be switched off in a bad week, which is why it is worth knowing which is which.';
    if (f === 0) return mc(r, `Which of these costs arrives for ${w} whether ${w} does anything or not?`, pick(r, FIX), VAR, why);
    if (f === 1) return mc(r, `Which of these costs only happens if ${w} chooses it?`, pick(r, VAR), FIX, why);
    if (f === 2) return mc(r, `Money is tight for ${w} this week. Which costs can move first?`,
      `The ones that follow what ${w} does`, ['Rent', 'All of them equally', 'None — borrow the difference'], why);
    return mc(r, `Why is a big fixed cost more serious for ${w} than a big one ${w} chooses?`,
      'It cannot be switched off in a bad week', ['It is not more serious', 'It is always the larger one', 'It is paid first'], why);
  },
  'KEEP-5': (r, cx) => {
    const s = step(), w = pick(r, WHO), thing = pick(r, THINGS), f = int(r, 0, 3);
    const tempt = pick(r, ['a new game on offer', 'tickets to the fair', 'a big bag of sweets', 'a comic box set', 'a shiny pair of trainers']);
    if (f === 0) {
      const per = s * int(r, 2, size(cx) === 'big' ? 12 : 6), k = int(r, 2, 5);
      return mc(r, `${w} saves ${m(per)} a week for ${thing}, then takes ${m(per * k)} out of the goal for ${tempt}. What did that cost, besides the money?`,
        `${k} weeks of saving to do again`, [`Nothing — it is ${w}’s money`, `Only the price of ${tempt}`, 'The whole goal'],
        `${m(per * k)} ÷ ${m(per)} a week = ${k} weeks. A raid is not just a price — it is a date moving further away.`);
    }
    if (f === 1) return mc(r, `What makes ${w}’s goal for ${thing} easier to leave alone?`,
      'A name and a date written on it', ['Hiding it and never looking', 'Making it bigger', 'Keeping it in the Spend jar'],
      'Money with a name and a date has a job. Money with no name is just money, and money is easy to spend.');
    if (f === 2) return mc(r, `When is taking money out of ${w}’s goal for ${thing} the right call?`,
      'When something more important has really happened', ['Never, whatever happens', 'When it has been saved for long enough', 'When it is nearly full'],
      'A goal is a plan, not a prison. If something truly bigger happens, using it is a choice — just make it on purpose, not because of a shop window.');
    return mc(r, `${cap(tempt)} tempts ${w}, but the money for ${thing} stays put. What could ${w} do instead of raiding it?`,
      'Start a new, smaller goal for it and wait', ['Raid it and hope to remember', 'Borrow from the goal without writing it down', 'Give up on the first goal'],
      'The want is real; it just gets its own name and its own date. Then both can happen — one after the other.');
  },
  'KEEP-6': (r, cx) => {
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO), f = int(r, 0, 3), u = (lo, hi) => s * (big ? int(r, lo * 3, hi * 3) : int(r, lo, hi));
    if (f === 0) return mc(r, `${w}’s money coming in drops by ${m(u(2, 6))} a week. Where should ${w} look first?`,
      `The costs that follow what ${w} does`, ['Rent', 'The Save jar', 'Borrowing the difference'],
      'The costs you choose can stop this week. Rent arrives anyway, saving is the point of the plan, and borrowing makes the gap cost more.');
    if (f === 1) {
      const [f1, f2] = draw(r, ['Rent', 'Pitch fee', 'Phone plan'], 2), v = pick(r, ['Comics', 'Snacks', 'Fair tickets', 'Game top-ups']);
      return mc(r, `${w}’s week: ${f1} ${m(u(5, 9))}, ${f2} ${m(u(2, 4))}, ${v} ${m(u(2, 5))}, Save jar ${m(u(2, 4))}. Pay falls by ${m(u(1, 2))}. Which line should move first?`,
        v, [f1, f2, 'Save jar'],
        `${v} can stop this week, because it follows what ${w} does. ${f1} and ${f2} arrive anyway, and Save is the point of the whole plan.`);
    }
    if (f === 2) return mc(r, `Pay drops for ${w}. Why not stop saving first?`,
      'Saving is the one line that is the point of the whole plan', ['Saving is compulsory', 'Saving is too small to matter', 'Stopping saving first is right'],
      'Cut saving first and the plan quietly becomes spending. Cut the things you choose first, and the plan survives the bad week.');
    return mc(r, `${w}’s pay drop looks like it is for good, not just one week. What now?`,
      'Look at the fixed costs too, because the situation has changed', ['Cut the same small things harder every week', 'Borrow the difference each week', 'Wait for it to go back up'],
      'For a bad week, trim what you choose. For a new normal, even the costs that arrive anyway need looking at — the old plan was built for a different week.');
  },
  'KEEP-7': (r, cx) => {
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO), what = pick(r, ['snacks', 'comics', 'bus rides', 'game top-ups']);
    const lines = [0, 0, 0, 0].map(() => s * (big ? int(r, 3, 15) : int(r, 1, 5))), sum = lines.reduce((a, b) => a + b, 0), g = sum - s * int(r, 2, 4);
    return { kind: 'num', hint: 'Add up every line in the record, and forget the guess.', q: `${w} thinks about ${m(g)} went on ${what} last week. The record says Monday ${m(lines[0])}, Wednesday ${m(lines[1])}, Friday ${m(lines[2])} and Saturday ${m(lines[3])}. How much was it really?`, value: sum,
      why: `${lines.map(m).join(' + ')} = ${m(sum)}, not the ${m(g)} remembered. Small repeated costs are each too small to remember — the record remembers for you.` };
  },
  'KEEP-8': (r, cx) => {
    const s = step(), w = pick(r, WHO), sp = pick(r, SURPRISES), f = int(r, 0, 2);
    if (f === 0) return mc(r, `${w} keeps ${m(s * (size(cx) === 'big' ? int(r, 20, 80) : int(r, 4, 9)))} set aside with no name on it. Which of these is it for?`,
      `Paying for ${sp.t}`, [`Paying for ${pick(r, THINGS)} ${w} has wanted for weeks`, 'Paying for a holiday next summer', `Paying for ${w}’s birthday party`, 'Paying for a new board game'],
      'A goal is for something you choose. The pile with no name is for the thing you did not choose — the one that happens to you.');
    if (f === 1) return mc(r, `How is ${w}’s surprise pile different from ${w}’s goal for ${pick(r, THINGS)}?`,
      'One is for something chosen; the other is for something that just happens', ['The pile is bigger', 'There is no difference', 'The pile earns more'],
      'Both are saving. A goal ends in a thing you picked; the surprise pile ends in a problem you did not — which is why it has no name.');
    return mc(r, `${w} has nothing set aside, and then ${sp.ev}. What usually comes next?`,
      `${w} borrows, and the surprise ends up costing more`, ['Nothing much', `${w} saves faster without trying`, 'The problem fixes itself'],
      'Surprises arrive anyway. With money set aside, it costs what it costs; without it, it costs that plus the price of borrowing.');
  },
  /* ══ GROW ══════════════════════════════════════════════════════════════ */
  'GROW-1': (r, cx) => {
    const s = step(), w = pick(r, WHO), x = m(s * (size(cx) === 'big' ? int(r, 20, 90) * 10 : int(r, 5, 20))), f = int(r, 0, 3);
    if (f === 0) return mc(r, `${w} leaves ${x} at the Bizzington bank. Where is most of that money now?`,
      'Lent out to somebody else', [`In a drawer with ${w}’s name on it`, 'In a safe under the building, untouched', 'Nowhere — it is only a number'],
      'A bank lends most of what is left with it to people who need to borrow. That is how it can pay you — the borrowers pay it.');
    if (f === 1) return mc(r, `Why does the bank pay ${w} interest on ${x}?`,
      'It can lend that money out and be paid for it', ['To be kind', 'Because it is the law', 'Because it has spare money'],
      'Interest is rent the bank pays for using your money. It lends it on to a borrower, who pays the bank more than the bank pays you.');
    if (f === 2) return mc(r, `${w} keeps ${x} at the bank. What does the bank give ${w}, besides interest?`,
      `A place where the money is not in ${w}’s pocket to spend`, ['Nothing at all', 'Free money every week', 'A promise it will grow fast'],
      'Money at the bank is safe and out of reach of an impulse. That distance is worth having, even before the interest.');
    const b = pick(r, ['a new oven for the bakery', 'a cart for the fruit stall', 'a roof for the bandstand café', 'a bigger tent for the market']);
    return mc(r, `${other(r, w)} borrows from the bank for ${b}. Whose money is being lent, really?`,
      `Savings that people like ${w} left there`, ['Money the town hall gives away', 'The bank manager’s own savings', 'Nobody’s — it is new money'],
      'The bank sits between savers and borrowers. Your savings become somebody else’s oven, and their payments become your interest.');
  },
  'GROW-4': (r, cx) => {
    const s = step(), w = pick(r, WHO), p1 = pick(r, [2, 3, 4]), p2 = pick(r, [12, 15, 18, 20]), f = int(r, 0, 2);
    if (f === 0) return mc(r, `In a story, one choice pays a sure ${p1} in every 100 a year. Another might pay ${p2} in every 100. What comes with the bigger number?`,
      'A real chance of getting less, or losing some', ['Nothing — it is just better', 'Only a longer wait', 'A bigger fee and nothing else'],
      'The extra is not free. It is what you are paid for taking the chance of getting less — the bigger the promise, the bigger the chance.');
    if (f === 1) return mc(r, `“Might pay ${p2} in every 100,” says a poster in a story. What is the word “might” doing?`,
      'It is the whole warning', ['Nothing — it is being polite', `It means at least ${p2}`, `It means about ${p2}`],
      `“Might” means it could be ${p2}, or less, or a loss. One small word carries all of the risk.`);
    const n = int(r, 2, 6);
    return mc(r, `${w} needs ${m(s * (size(cx) === 'big' ? int(r, 20, 90) * 10 : int(r, 5, 20)))} for ${pick(r, THINGS)} in ${n} months. In a story, there is a sure ${p1} in 100, or a might-be ${p2} in 100. Which fits?`,
      'The sure one — the date matters more than the extra', ['The bigger one — more is always better', 'Whichever a friend picked', 'Split it by guessing which will win'],
      `With a date only ${n} months away, a bad stretch could leave ${w} short exactly when the money is needed. Risk is for money that can wait.`);
  },
  'GROW-5': (r, cx) => {
    const s = step(), w = pick(r, WHO), [a, b, c, d] = draw(r, COMPANIES, 4), f = int(r, 0, 3);
    if (f === 0) return mc(r, `In the Exchange game, ${w} puts all ${m(s * (size(cx) === 'big' ? int(r, 20, 90) * 10 : int(r, 5, 20)))} into ${a}. What is the danger?`,
      'One thing going wrong takes everything with it', [`${w} will get bored`, 'There is none', `${w} will earn less for certain`],
      'All in one means one bad year is the whole of your money’s bad year. Spread, a single failure is only a slice.');
    if (f === 1) return mc(r, `${w} spreads money across ${a}, ${b} and ${c}. What does that NOT protect against?`,
      'A bad year for everything at once', [`${a} alone failing`, `A bad guess about ${b}`, `${c} having a poor month`],
      'Spreading protects against one thing going wrong. When everything falls together, it falls too — that is a different risk, and only time helps with it.');
    if (f === 2) return mc(r, `Which of these is ${w}’s money spread out?`,
      `Some in each of ${a}, ${b}, ${c} and ${d}`, [`All of it in ${a}`, `All of it in ${b}`, `All in ${a}, moved to ${b} whenever ${b} rises`],
      'Spread means several holdings at the same time. Moving all of it from one to another is still all in one — just a different one.');
    return mc(r, `Why does ${w}’s boring spread often beat ${other(r, w)}’s all-in-one over many years?`,
      'It never has the one year that wipes it out', ['It earns the most every single year', 'It is cheaper to buy', 'It does not — all-in-one always wins'],
      'The all-in-one has some brilliant years and, one day, a terrible one. The spread is never brilliant and never wiped out — and over years that wins.');
  },
  'GROW-6': (r, cx) => {
    const s = step(), w = pick(r, WHO), co = pick(r, COMPANIES), f = int(r, 0, 3);
    if (f === 0) {
      const x = s * 10 * (size(cx) === 'big' ? int(r, 10, 60) : int(r, 2, 6)), k = int(r, 2, 4);
      return mc(r, `After a bad day on the Exchange, ${w}’s ${m(x)} in ${co} shows as ${m(x - x * k / 10)}, and everyone says sell. What would selling turn that into?`,
        'A real loss, instead of a number on a screen', ['A gain', 'Nothing different', 'A safe, sure thing'],
        `While ${w} holds, the ${m(x * k / 10)} drop is only a price today. Selling makes it real — and takes away the chance of it coming back.`);
    }
    if (f === 1) return mc(r, `Everything falls on the Exchange and ${other(r, w)} is selling fast. Why is doing nothing so hard for ${w}?`,
      'It feels like slacking while everyone else acts', ['It costs money to wait', 'It is against the rules', 'It is easy, really'],
      'Doing nothing looks like not trying. But a decision not to sell is still a decision — usually the one that holds up best.');
    if (f === 2) return mc(r, `${co} falls sharply. When is selling the right call for ${w}?`,
      `When ${w} was going to need that money soon anyway`, ['Whenever it falls by a tenth', 'When the news is bad', 'Never, whatever happens'],
      'A fall matters for money you need soon. For money that can wait years, a bad day is just a bad day.');
    return mc(r, `${w} did nothing on the day ${co} fell, and a month later says, “I decided.” What did ${w} decide?`,
      'That doing nothing was the plan', [`To sell ${co}`, `To buy more ${co}`, 'Nothing — nothing was decided'],
      'Holding on through a fall is a choice, made on purpose. Saying so afterwards is how you know it was a decision and not a freeze.');
  },
  'GROW-7': (r, cx) => {
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO), w2 = other(r, w), D = pick(r, [7, 8, 9, 10]), x = s * (big ? int(r, 3, 20) * 10 : int(r, 2, 6));
    if (r() < 0.5) {
      const N = big ? pick(r, [2, 3]) : 2;
      return { kind: 'num', hint: 'Count the stretches of years, then double once for each stretch.', q: `In a story, money left alone doubles every ${D} years. ${w} leaves ${m(x)} for ${N * D} years. How much is there at the end?`, value: x * 2 ** N,
        why: `${N * D} years is ${N} stretches of ${D}, so ${m(x)} doubles ${N} times: ${m(x * 2 ** N)}. Nothing added — the years did all of it.` };
    }
    const N = big ? 3 : 2, a = x * 2 ** N, b = x * 2 ** (N - 1);
    return { kind: 'num', hint: 'Double each one once for every stretch of years, then take the smaller from the bigger.', q: `In a story, money doubles every ${D} years. ${w} leaves ${m(x)} for ${N * D} years. ${w2} starts later and leaves the same ${m(x)} for ${(N - 1) * D} years. How much more does ${w} end with?`, value: a - b,
      why: `${w} gets ${m(a)}, ${w2} gets ${m(b)}. Same money in, ${m(a - b)} apart — the only difference was starting ${D} years sooner.` };
  },
  'GROW-8': (r, cx) => {
    const s = step(), w = pick(r, WHO), f = int(r, 0, 3);
    const SOON = ['the school trip next month', 'new shoes next week', 'the bus pass due on Monday', 'a friend’s present on Saturday'];
    const FAR = ['a bicycle in five years', 'college one day', `a stall of ${w}’s own, when grown up`];
    if (f === 0) return mc(r, `${w} will need ${m(s * (size(cx) === 'big' ? int(r, 10, 60) : int(r, 3, 9)))} for ${pick(r, SOON)}. Where does it belong?`,
      'Somewhere safe and easy to reach', ['Somewhere it might fall in value', 'Locked away for years', 'Spread across the Exchange'],
      'Money needed soon cannot wait for a bad stretch to pass. It belongs where it will still be all there on the day.');
    if (f === 1) return mc(r, `Which of ${w}’s money could be left alone for years?`,
      `Money for ${pick(r, FAR)}`, SOON.map((x) => `Money for ${x}`),
      'Only money with a far-off date can sit through a bad stretch. Everything needed this month belongs somewhere safe and reachable.');
    if (f === 2) return mc(r, `What lets ${w}’s money be invested, rather than just saved?`,
      'Being able to leave it alone through a bad stretch', ['Having a lot of it', 'A good tip from a friend', 'A high rate in a story'],
      'Investing means it might dip before it grows. That is only safe for money you will not need during the dip.');
    return mc(r, `${w} invested the surprise money, and then ${pick(r, SURPRISES).ev} in a bad month on the Exchange. What happened?`,
      `${w} had to sell at the worst moment`, [`${w} was fine`, `${w} earned more`, 'Nothing changed'],
      'Surprise money is for surprises, which never wait for a good month. Kept somewhere safe, it would have been all there.');
  },
  /* ══ OWE ═══════════════════════════════════════════════════════════════ */
  'OWE-3': (r, cx) => {
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO), f = int(r, 0, 3);
    if (f === 0) return mc(r, `Which is the better reason for ${w} to borrow?`,
      `For ${pick(r, ['a lemonade press that will earn more than the loan costs', 'a second-hand bike for a delivery round that pays more than the loan costs', 'a sewing kit to mend and sell bags, earning more than the loan costs'])}`,
      ['For a treat to have today', 'For a toy because it is on offer', 'For a game because everybody has it', 'For sweets for the weekend'],
      'A loan has a price. Borrowing for something that earns more than that price can pay for itself; borrowing for something that is soon gone cannot.');
    if (f === 1) {
      const n = int(r, 4, 10), t = pick(r, ['a fair ticket', 'a big ice-cream party', 'a day at the water park', 'a pile of party balloons']);
      return mc(r, `${w} borrows for ${t} and pays it back over ${n} weeks. What is the catch?`,
        `${w} is still paying after the fun is over`, ['There is no catch', 'Borrowing is against the rules', `${w} pays back less than was borrowed`],
        `The fun lasts a day; the payments last ${n} weeks. That is worth knowing before, not after — it is a price, not a punishment.`);
    }
    if (f === 2) {
      const t = pick(r, ['new trainers', 'a phone', 'a holiday', 'a games console']), w2 = other(r, w);
      return mc(r, `“Everybody borrows for ${t},” says ${w2}. Is that a reason for ${w} to borrow?`,
        `No — it says nothing about ${w}’s own numbers`, ['Yes, always', 'Only for big things', 'Only for small things'],
        'What other people do tells you nothing about your own week. The only real reasons are in your own numbers.');
    }
    const L = s * 10 * (big ? int(r, 3, 12) : int(r, 1, 4)), fee = s * (big ? int(r, 3, 12) : int(r, 1, 4));
    let e = fee + s * pick(r, [-2, -1, 1, 2, 3]) * (big ? 2 : 1); if (e <= 0) e = fee + s;
    const tool = pick(r, ['a juice press', 'a cart', 'a ladder for window cleaning', 'a sewing kit']), worth = e > fee;
    return mc(r, `${w} could borrow ${m(L)} for ${tool}, paying back ${m(L + fee)}. While the loan runs, ${tool} would earn ${m(e)}. Is that a good reason to borrow?`,
      worth ? `Yes — it earns ${m(e)}, more than the ${m(fee)} it costs` : `No — it earns ${m(e)}, less than the ${m(fee)} it costs`,
      ['Yes — borrowing for work always pays', 'No — borrowing is always a bad idea', `Only if the ${bare(tool)} is brand new`],
      `The loan costs ${m(L + fee)} − ${m(L)} = ${m(fee)}. Set that against the ${m(e)} it earns. Borrowing is a tool with a price — the numbers decide, not a rule.`);
  },
  'OWE-4': (r, cx) => {
    const s = step(), w = pick(r, WHO), lender = pick(r, LENDERS.filter((x) => x !== w)), thing = pick(r, THINGS), p = s * (size(cx) === 'big' ? int(r, 5, 25) : int(r, 2, 6)), f = int(r, 0, 3);
    if (f === 0) {
      const t = s * (size(cx) === 'big' ? int(r, 10, 40) : int(r, 3, 9));
      return mc(r, `A repayment of ${m(p)} to ${lender} is due, and ${w} wants ${thing} for ${m(t)}. What is the honest way to see it?`,
        `Its real cost is ${m(t)} plus a broken promise`, ['The repayment is unfair', `The money is not really ${w}’s`, 'Skip it once; nobody minds'],
        'A repayment is a promise already made. Spending its money means paying for the thing and for breaking the promise.');
    }
    if (f === 1) return mc(r, `What usually happens when ${w} misses a repayment to ${lender}?`,
      'It costs more, and it is remembered', ['Nothing at all', 'The loan disappears', 'It quietly moves to next year'],
      'A missed payment usually adds a charge, and lenders remember. Both make the next loan dearer.');
    if (f === 2) return mc(r, `${w} cannot make this week’s ${m(p)} payment to ${lender}. What is the strong move?`,
      'Speak up before the day it is due', [`Avoid ${lender} until next week`, 'Borrow from somewhere else to cover it', 'Pay half without saying anything'],
      'Telling them early turns a surprise into a plan. Lenders can often change the date — but only if they hear before it is missed.');
    return mc(r, `${w} pays ${lender} the ${m(p)} instead of buying ${thing}. What did ${w} give up?`,
      'Having it this week', ['Nothing — repayments do not count', `${m(p)} for nothing`, 'The loan itself'],
      'Keeping a repayment has a cost too, and naming it is honest. What you get back is a kept promise and a cheaper next loan.');
  },
  'OWE-5': (r) => {
    const w = pick(r, WHO), lender = pick(r, LENDERS.filter((x) => x !== w)), f = int(r, 0, 3);
    if (f === 0) return mc(r, `${w} repaid ${lender} on time every week for ${int(r, 3, 12)} months. What changed for next time?`,
      `${w} can usually borrow more, and for less`, ['Nothing', `${w} owes more`, 'The price of borrowing goes up'],
      'A lender is guessing about the future. A run of kept payments is the best evidence there is, and it makes the guess cheaper.');
    if (f === 1) return mc(r, `${w} missed ${int(r, 2, 4)} payments to ${lender} last spring. Can that record be repaired?`,
      'Yes, by a run of kept payments — slowly', ['Never', 'Yes, at once, by paying it all off', 'Only by moving to another bank'],
      'Trust is a memory, and memories are rebuilt one kept promise at a time. It works in both directions.');
    if (f === 2) return mc(r, `What does ${lender} not know about ${w}, however well they know each other?`,
      `Whether ${w} will pay next time`, [`${w}’s name`, `What ${w} borrowed before`, `What ${w} paid back before`],
      'Everything a lender knows is about the past. What you did last time is the only clue to next time — which is why it matters so much.');
    return mc(r, `${w} missed several payments to ${lender}. What happens the next time ${w} asks to borrow?`,
      `${w} may be offered less, or at a higher price`, ['Exactly the same as before', `${w} is offered more, to help catch up`, 'Borrowing is closed for ever'],
      'Missed payments make lending riskier, so it costs more or comes smaller. Not for ever — kept payments bring it back.');
  },
  'OWE-6': (r, cx) => {
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO), thing = pick(r, THINGS), wk = big ? int(r, 2, 8) : int(r, 2, 5);
    if (r() < 0.5) {
      const per = s * (big ? int(r, 10, 25) : int(r, 6, 12)), h = s * (big ? int(r, 10, 60) : int(r, 6, 15));
      return { kind: 'num', hint: 'Take what is already saved away from the price, then count the weekly amounts in the gap.', q: `${cap(thing)} costs ${m(h + per * wk)}. ${w} has ${m(h)} and saves ${m(per)} a week. How many weeks of waiting is that?`, value: wk,
        why: `${m(h + per * wk)} − ${m(h)} = ${m(per * wk)} still to find, at ${m(per)} a week: ${wk} weeks. That is the cost of waiting — in weeks.` };
    }
    const k = s * (big ? int(r, 9, 20) : int(r, 7, 12)), fee = k * wk;
    return { kind: 'num', hint: 'Share the extra cost equally across the weeks it saves.', q: `Borrowing would get ${w} ${thing} ${wk} weeks sooner, for ${m(fee)} extra. How much is each week of having it sooner costing?`, value: k,
      why: `${m(fee)} ÷ ${wk} weeks = ${m(k)} a week. Now both sides are in the same units — is one week of having it worth ${m(k)} to ${w}?` };
  },
  /* ══ GUARD ═════════════════════════════════════════════════════════════ */
  'GUARD-1': (r) => {
    const w = pick(r, WHO), f = int(r, 0, 2), secret = pick(r, [`${w}’s PIN`, `${w}’s password`, `the code just sent to ${w}’s phone`]);
    if (f === 0) {
      const caller = pick(r, ['Someone saying they are from the Bizzington bank', 'A message that looks like it is from the arcade', `A friendly caller who knows ${w}’s name and street`, 'A text from a new number that says it is Mags', 'A pop-up in a game that says it is the game’s helper']);
      return mc(r, `${caller} asks for ${secret}, “just to check something”. What does ${w} do?`,
        'Give nothing, end it, and tell a grown-up', ['Give it — they sound official', 'Give half of it', 'Ask them to prove who they are, then give it', 'Give it if they already know a lot'],
        'A PIN, a password and a code are never given to anybody who asks — not the bank, not a friend, not a helper. A real one never asks.');
    }
    if (f === 1) return mc(r, `A caller knew ${w}’s name and street, then asked for ${secret}. Why is knowing those not proof?`,
      'Anyone can find those out', ['It is proof — only the bank would know them', 'Because streets change their names', 'Because they said it too quickly'],
      'Names and addresses are easy to find. Knowing them proves nothing — and real banks never ask for the secret anyway.');
    const acct = pick(r, ['game account', 'bank account', 'arcade card', 'library account']);
    return mc(r, `A message says ${w}’s ${acct} will close unless ${w} confirms the password now. What is the tell?`,
      'The rush to act straight away', ['The logo', 'The spelling', 'The name of the account'],
      'Real ones give you time. A message that will not let you stop and check is telling you exactly why it does not want you to.');
  },
  'GUARD-2': (r) => {
    const w = pick(r, WHO), f = int(r, 0, 2);
    if (f === 0) {
      const st = pick(r, [
        `A message tells ${w} a prize is waiting from a draw ${w} never entered — if a small fee is paid in the next hour, and nobody is told.`,
        `Someone ${w} has never met offers game coins at half price, if ${w} pays today and keeps it between the two of them.`,
        `A text says a parcel for ${w} is stuck, and a fee must be paid in ten minutes; it says not to bother the grown-ups.`,
        `A new “friend” online says they are in trouble, needs ${w}’s pocket money right now, and asks ${w} to tell no one.`,
      ]);
      return mc(r, `${st} Which three things give it away?`,
        'A stranger, a hurry, and a secret', ['Bad spelling, a foreign name, and a big amount', 'A logo, a friendly tone, and a picture', 'The time of day, the colours, and the length'],
        'The story changes every time. The shape does not: somebody you do not know, a rush, and a reason not to tell anyone.');
    }
    if (f === 1) return mc(r, `A message to ${w} has a smart logo and perfect spelling. Why is “it looked professional” not reassuring?`,
      'Looking smart is the cheapest part to copy', ['It is reassuring', 'Because professionals are dishonest', 'Because logos are against the rules'],
      'Anyone can copy a logo in a minute. What they cannot hide is the shape — who they are, how fast, what they want.');
    return mc(r, `A brand-new trick arrives that nobody has warned ${w} about. What still works?`,
      'Checking the shape: who, how fast, and what they want', ['Nothing — new ones always work', 'Searching for the story', 'Asking the sender if it is real'],
      'You cannot learn every story. You can learn the shape, and the shape is the same in every one.');
  },
  'GUARD-3': (r) => {
    const w = pick(r, WHO), f = int(r, 0, 2), from = pick(r, ['A pop-up', 'A message', 'A poster', 'A seller at the fair', 'A game screen']);
    const msg = pick(r, ['“Reply in 5 minutes or lose your prize!”', '“Only 2 left — buy now!”', '“Last chance: ends tonight!”', '“Your account locks in one hour unless you act!”', '“Everyone else has joined already — don’t miss out!”']);
    if (f === 0) return mc(r, `${from} tells ${w}: ${msg} What is that for?`,
      `Stopping ${w} from thinking it over`, ['Being helpful', 'Being fair to everyone', 'Keeping count of stock'],
      'Hurry is a tool. Its job is to take away the pause, because the pause is where you notice something is wrong.');
    if (f === 1) return mc(r, `${from} tells ${w}: ${msg} What is the cheapest defence?`,
      'Sleeping on it', ['Acting fast before it goes', 'Asking the sender if it is real', 'Reading what it says about itself'],
      'Waiting a night costs almost nothing. Anything honest will still be there; anything that vanishes was the hurry, not the deal.');
    return mc(r, `${w} wonders whether ${msg} is a real limit. How can ${w} tell?`,
      `Often ${w} cannot — and that is the point`, ['It says so', 'It has a timer', 'It came from a shop'],
      'A real limit and a fake one look the same from outside. So treat them the same: slow down, and let the hurry be their problem.');
  },
  'GUARD-4': (r) => {
    const w = pick(r, WHO), app = pick(r, FREEAPPS), f = int(r, 0, 3);
    if (f === 0) return mc(r, `${cap(app)} costs ${w} nothing. Who is paying for it to exist?`,
      'Somebody — in money, attention or information', ['Nobody', 'The town hall', 'Only the players who lose'],
      'People were paid to build it. If you did not pay with money, someone is paying with your attention or your information.');
    if (f === 1) {
      const [x, y] = draw(r, ['sticker', 'badge', 'pencil', 'bookmark', 'keyring'], 1).concat(pick(r, ['comic', 'notebook', 'juice', 'cricket ball']));
      return mc(r, `“Free ${x} with every ${y}!” says the sign at ${pick(r, SHOPS)}. What is the free ${x}?`,
        `Part of the price of the ${y}`, ['A gift from the shop', 'A mistake by the shop', `A discount on the ${y}`],
        `Nothing is given away. The ${x} was paid for inside the price of the ${y} — the word free just moved it.`);
    }
    if (f === 2) return mc(r, `A free trial of the ${app.replace(/^a free /, '')} needs ${w}’s card. What is really being sold?`,
      'The chance that the cancelling is forgotten', ['The trial', 'Nothing', 'Convenience'],
      'The trial is the bait. The business is the many people who forget, and pay month after month.');
    return mc(r, `${cap(pick(r, ['a free puzzle game', 'a free racing game', 'a free word game']))} shows ${w} an advert between every level. What is ${w} giving instead of money?`,
      'Attention', ['Nothing at all', 'Coins from the wallet', 'Points from the game'],
      'Advertisers pay the app for the minutes you spend looking. Your attention is the thing being sold.');
  },
  'GUARD-6': (r, cx) => {
    const s = step(), w = pick(r, WHO), w2 = other(r, w), x = m(s * (size(cx) === 'big' ? int(r, 10, 60) : int(r, 2, 8))), f = int(r, 0, 3);
    if (f === 0) {
      const sit = pick(r, [`${w} paid ${x} for game coins that never arrived`, `${w} typed a code from a text into a website, then felt uneasy`, `a stranger online keeps asking ${w} for money`, `someone asked ${w} to keep a money deal secret from home`]);
      return mc(r, `Something feels wrong: ${sit}. What is the first move?`,
        'Tell a grown-up straight away', ['Fix it quietly alone', 'Pretend it did not happen', 'Wait to see if it happens again'],
        'Telling is the strong move, not the weak one. Most tricks fall apart the moment one other person hears about them.');
    }
    if (f === 1) return mc(r, `The person tricking ${w} asked ${w} to keep it quiet. Why?`,
      'One other person would end it in a sentence', ['To be polite', 'It is quicker that way', 'For legal reasons'],
      'The secret is the trick’s weak spot. That is exactly why they ask for it — and exactly why telling works.');
    if (f === 2) return mc(r, `${w} was caught by a trick and lost ${x}. Does that mean ${w} was foolish?`,
      'No — tricks are built by people who do it all day', ['Yes', 'Only children get caught', 'Only if it was a big amount'],
      'Clever adults are caught every day. The tricks are made by professionals; being caught says nothing about you, and telling is how it stops.');
    return mc(r, `${w} tells ${w2} about a strange message asking for money. What did telling do?`,
      'Took away the secret the trick needed', ['Made things worse', `Showed ${w} could not cope`, 'Nothing — it was too late'],
      'A trick needs silence to work. Saying it out loud to one person is usually enough to break it.');
  },
};
/* ── the town's situations (scenes.js) ──────────────────────────────────────
   Each objective with a pool of scenes draws one of them, or (OLD_WEIGHT times in every
   pool-plus-OLD_WEIGHT draws) one of its own branches above, so every seed is a situation
   and the pool, not a swapped name, is what makes two seeds two questions. A scene keeps its
   template's shape: a four-option objective draws four-option scenes, a typed one typed. */
export const OLD_WEIGHT = 4;
const fillIn = (t, v) => t.replace(/\{(w2|w|p|P)\}/g, (_, k) => v[k]);
export const SCENE_COUNT = {};
for (const id of new Set([...Object.keys(SCENES), ...Object.keys(NUM_SCENES)])) {
  const base = GEN[id], four = SCENES[id] || [], typed = NUM_SCENES[id] || [], n = four.length + typed.length;
  if (!base) throw new Error('scenes.js names an objective with no template: ' + id);
  SCENE_COUNT[id] = n;
  GEN[id] = (r, cx) => {
    const i = int(r, 0, n + OLD_WEIGHT - 1);
    if (i >= n) return base(r, cx);
    const s = step(), big = size(cx) === 'big', w = pick(r, WHO), w2 = other(r, w);
    if (i < four.length) {
      const [q, right, wrongs, why] = four[i];
      const v = { w, w2, p: m(s * (big ? int(r, 10, 40) : int(r, 2, 9))), P: m(s * 10 * (big ? int(r, 5, 30) : int(r, 2, 9))) };
      return mc(r, fillIn(q, v), fillIn(right, v), wrongs.map((x) => fillIn(x, v)), fillIn(why, v));
    }
    return { kind: 'num', ...typed[i - four.length]({ r, s, big, w, w2, int, pick, m }) };
  };
}
/* the numbers a question prints, commas and currency signs stripped */
export const numbersIn = (t) => (String(t).match(/\d[\d,]*(\.\d+)?/g) || []).map((x) => Number(x.replace(/,/g, '')));
export function leaks(d) { return d.kind === 'num' ? numbersIn(d.q).includes(d.value) : new Set(d.opts.map(String)).size !== d.opts.length; }
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/* The card a generated id names. "EARN-2~41" → seed 41 for EARN-2. `cx.ceil` is the
   child's maths ceiling. Returns the same card shape as objectives.assessCard. */
export function genCard(o, seed, cx) {
  const g = GEN[o.id]; if (!g) return null;
  const C = cx || { ceil: 6 };
  /* The same id is the same question in EVERY currency, only priced differently: what is
     redrawn (a leak) and which sibling is the worked one are decided on all of them at once,
     so a card cut once for every child (My Feed) reads exactly as this draws it for her. */
  const memo = {};
  const drawAt = (cur, s) => { const key = cur + s; if (memo[key]) return memo[key]; const was = currency(); setCurrency(cur); try { return (memo[key] = g(rng(s), C)); } finally { setCurrency(was); } };
  /* (a four-option one's only leak is two equal options, and pricing scales every amount
     alike, so its own currency decides for all of them) */
  const everywhere = (s, test) => { const here = drawAt(currency(), s); return here.kind !== 'num' ? test(here, currency()) : Object.keys(CURRENCIES).every((cur) => test(drawAt(cur, s), cur)); };
  /* a typed answer whose number is printed in its own question is a leak: draw again */
  let at = seed * 2654435761 + o.id.length;
  for (let k = 0; k < 12; k++) { const s = seed * 2654435761 + o.id.length + k * 7919; at = s; if (everywhere(s, (d) => !leaks(d))) break; }
  let d = drawAt(currency(), at);
  /* E3 · a typed amount carries its worked example: the same generator, other numbers —
     a sibling drawn from a different seed whose answer is not this one's. Every number in
     it is the generator's own, so it claims nothing about the real world. */
  if (d.kind === 'num' && !d.worked) {
    for (let k = 1; k < 40; k++) {
      const s2 = (seed + 7 * k) * 2246822519 + o.id.length * 31 + k;
      const fits = everywhere(s2, (w, cur) => { const dd = drawAt(cur, at); return w.kind === 'num' && w.value !== dd.value && w.q !== dd.q && !leaks(w) && !numbersIn(w.q + ' ' + w.why).includes(dd.value); });
      if (fits) { const s = g(rng(s2), C); d = { ...d, worked: { q: s.q, why: s.why, value: s.value } }; break; }
    }
  }
  return { id: `${o.id}~${seed}`, title: o.short, who: 'pip', objective: o.id, assess: true, generated: true, drill: d };
}
export const hasGen = (id) => !!GEN[id];
