/* objectives.js — the curriculum graph (docs/05 Part A).

   An objective is a DATA OBJECT, not a paragraph, and it is written as a
   behaviour you could watch a child do. "Understands opportunity cost" is not
   an objective — you cannot see it, so you cannot assess it and you must not
   report it. "Names what she gave up when she chose the kite over the kit" is.

   Three rules hold for every record here:

   1. `surface` is mandatory. Nothing is taught without a place in the town
      (CLAUDE.md); here that convention is a schema constraint, and validate()
      fails the build without it.
   2. `assess` items are RETRIEVAL, not the immediate check. They are asked
      days later in a different context. The card's own drill measures
      attention ninety seconds old and is never reported.
   3. `transfer` names surfaces where the objective can be demonstrated by
      DOING, unprompted. That evidence comes free from a simulation and from
      nothing else — but only if the surface is instrumented, so a surface
      listed here without a mastery.transfer() call is a lie and validate()
      does not catch it. Grep before you add one.

   This file is one strand. CHOOSE ships first because it transfers to real
   life fastest and because the town already has surfaces that can show it
   (docs/05 Part D, order of work).                                          */

import { MORE_OBJECTIVES } from './objectives-more.js';

/* Cards the chapters do not already carry. Same shape as content.js cards, so
   the same renderer and the same shuffledDrill answer-permutation apply. */
const NEW_CARDS = [
  {
    id: 'x-ch4', title: 'Which box is cheaper', who: 'mags',
    teach: 'Two bags of the same rice. The big one costs more — but that is not the question. The question is <b>what does one scoop cost</b> in each. Divide the price by how much is in it, and then the two bags are finally talking about the same thing.',
    eg: '600g for ₹90 is ₹15 per 100g. 400g for ₹56 is ₹14 per 100g. The small bag is cheaper per scoop, and the big one is hoping you will not check.',
    drill: { q: 'A 500g jar costs ₹60. A 250g jar costs ₹27. Which is better value?',
      opts: ['The 500g jar, because bigger is cheaper', 'The 250g jar — ₹10.80 per 100g against ₹12', 'They are the same', 'You cannot tell without knowing the brand'], a: 1,
      why: '500g at ₹60 is ₹12 per 100g. 250g at ₹27 is ₹10.80 per 100g. The bigger box is not always the better deal — which is the one that catches most adults.' },
  },
  {
    id: 'x-ch8', title: 'What waiting costs, and what it saves', who: 'nana',
    teach: 'Buying now and saving up are both real answers. The honest way to choose is to write down <b>both</b> columns: what you pay extra by buying now, and what you give up by waiting. Then pick — and you will actually know why.',
    eg: 'The kit is ₹800. You have ₹500. Wait three weeks and it costs ₹800. Borrow and it costs ₹880 — and you had it for three weeks. Eighty rupees is the price of three weeks. Sometimes that is worth it. Sometimes it is not.',
    drill: { q: 'When is waiting the better choice?',
      opts: ['Always — waiting is the careful answer', 'When three weeks of having it matters less to you than ₹80', 'When three weeks of having it matters more to you than ₹80', 'Never, if you can afford the payments'], a: 1,
      why: 'There is no rule that says wait. There is a comparison — the extra you pay against the time you gain — and either answer can be right once you have actually made it.' },
  },
  {
    id: 'x-ch10', title: 'Putting two offers on the same footing', who: 'bo',
    teach: 'Two offers almost never arrive in the same shape. One charges a flat fee, one charges a slice. One is per month, one is per year. <b>Before you can compare them you have to convert them</b> — to the same period, the same amount, the same units. Most bad deals survive because nobody did the converting.',
    eg: 'Stall A takes ₹20 a week. Stall B takes 5% of what you sell. If you sell ₹300 a week, B costs ₹15 and is cheaper. If you sell ₹500, B costs ₹25 and A is cheaper. The answer depends on you, not on the offer.',
    drill: { q: 'One board charges ₹40 a month. Another charges ₹9 a week. Which costs more over a year?',
      opts: ['The monthly board', 'The weekly board', 'They come to the same', 'It cannot be compared'], a: 0,
      why: '₹40 × 12 = ₹480. ₹9 × 52 = ₹468. The monthly board costs ₹12 more a year — and you could not see that until both were in the same units.' },
  },
  {
    id: 'x-ch11', title: 'Decide it once, in advance', who: 'pip',
    teach: 'The worst time to decide what to do with money is the moment something shiny is in front of you. So you do not. You decide <b>before</b> — a rule, made when nothing is tempting you — and then in the shop you are not deciding at all, you are just keeping a promise you already made.',
    eg: 'Your jar rule says three in ten goes to Save. Pay day comes, the rule runs, and it is done before you have looked at anything. That is why it works.',
    drill: { q: 'Why is a rule set in advance better than deciding each time?',
      opts: ['Rules are more fun', 'Because you are not being tempted at the moment you make it', 'Because rules cannot be broken', 'Because it saves more money automatically'], a: 1,
      why: 'A rule is not stronger than you. It is made at a calmer moment than the one you will be in, which is a completely different thing — and it is the whole reason it holds.' },
  },
  {
    id: 'x-ch12', title: 'A week later, were you still glad?', who: 'mags',
    teach: 'The only honest test of a purchase is not how it felt in the shop. It is how you feel about it <b>a week later</b>. Ask that about your own last few, and a pattern shows up fast — and the pattern is more useful than any advice anybody can give you.',
    eg: 'Two things you bought last month. One you still use. One you had to go and look for to remember you owned. That second one is the lesson, and it cost you money to learn it — so at least learn it.',
    drill: { q: 'What is the most useful thing to notice about a purchase you regret?',
      opts: ['That you wasted money', 'What kind of thing it was, so you spot the next one', 'That you should never buy anything', 'That the shop tricked you'], a: 1,
      why: 'One regret is a bad afternoon. A pattern across three of them is a skill — the point is to spot the next one coming, not to feel bad about the last one.' },
  },
];

/* ── the strand ───────────────────────────────────────────────────────────
   Twelve rungs. `needs_maths` are rungs of the number spine (docs/03 §3);
   `needs` are prerequisite objectives. Both gate the ledger. */
export const OBJECTIVES = [
  {
    id: 'CHOOSE-1', strand: 'CHOOSE', rung: 1,
    objective: 'Sorts a thing they want into need or want, and can say which one it is for them rather than in general.',
    needs_maths: ['M1'], needs: [], surface: 'place', teach: 'c1b',
    short: 'Telling a need from a want',
    parent_line: 'Ask her which three things in the trolley are needs. The argument you get is the lesson — there is no single right answer and she should notice that.',
    transfer: [], sources: [],
    assess: [
      { q: 'Someone says "I need those shoes." What are they most likely to mean?', opts: ['They cannot leave the house without them', 'They want them a lot', 'Their old shoes are broken', 'Shoes are always a need'], a: 1,
        why: 'People say need when they mean want, and that is not lying — it is just how we talk. Noticing it is what stops it deciding for you.' },
      { q: 'Which of these changes whether something is a need?', opts: ['The price', 'Who you are and what your week looks like', 'How new it is', 'Nothing — needs are fixed'], a: 1,
        why: 'A raincoat is a need in a wet month and a want in a dry one. The thing did not change; the situation did.' },
      { q: 'Your friend needs a bus fare and wants a comic. She has enough for one. What is the useful question?', opts: ['Which is cheaper', 'What happens if she does not have each one', 'Which she wants more', 'Which one her parents would pick'], a: 1,
        why: 'The consequence is the test. Missing the bus and missing the comic are not the same size of problem, and that is what makes one a need.' },
    ],
  },
  {
    id: 'CHOOSE-2', strand: 'CHOOSE', rung: 2,
    objective: 'When they buy one of two things they could afford, names the other one as the thing they gave up.',
    needs_maths: ['M2'], needs: ['CHOOSE-1'], surface: 'wallet', teach: 'c3c',
    short: 'Naming what you gave up',
    parent_line: 'Next time she picks one thing, ask what she is NOT getting now. Not as a telling-off — just so the second thing gets said out loud.',
    transfer: ['store', 'goals'], sources: [],
    assess: [
      { q: 'You had ₹200 and spent it on a kite. What did the kite actually cost you?', opts: ['₹200', '₹200 and the puzzle you were also looking at', 'Nothing, you had the money', 'It depends on the kite'], a: 1,
        why: 'The price is what left your hand. The cost includes the thing you can no longer have — and that second half is the part people forget.' },
      { q: 'Why does the second-best thing matter when you choose?', opts: ['It does not', 'It is what you are really paying, on top of the money', 'It tells you the price', 'To make you feel bad'], a: 1,
        why: 'If both were worth having, giving one up is a real cost. Naming it is how you find out whether you actually chose well.' },
      { q: 'You choose an afternoon of jobs over an afternoon of games. What did the money cost you?', opts: ['Nothing — you gained money', 'The afternoon of games', 'The jobs', 'You cannot compare time to money'], a: 1,
        why: 'It runs both ways. Earning has a cost too, and it is the thing you did not do instead.' },
    ],
  },
  {
    id: 'CHOOSE-3', strand: 'CHOOSE', rung: 3,
    objective: 'Explains that the same object can be worth different amounts to two people, and that price is only what someone is asking.',
    needs_maths: ['M1'], needs: ['CHOOSE-1'], surface: 'store', teach: 'c1d',
    short: 'Price is not value',
    parent_line: 'Ask what something in the house would be worth to someone who did not already own one. Then ask what it is worth to her.',
    transfer: [], sources: [],
    assess: [
      { q: 'Two people look at the same second-hand bike at ₹1,200. Why might one buy and one walk away?', opts: ['One of them is wrong', 'It is worth more than ₹1,200 to one of them and less to the other', 'One of them has more money', 'The seller changed the price'], a: 1,
        why: 'Value sits in the person, not the object. That is why a trade can leave both sides better off — each one wanted what they got more than what they gave.' },
      { q: 'A shop doubles the price of a lamp. What happened to the lamp?', opts: ['It became worth more', 'Nothing — only what is being asked changed', 'It became better made', 'It became rarer'], a: 1,
        why: 'Price is a number a seller chose. It is information about the seller, and only sometimes information about the thing.' },
      { q: 'When is a high price actually useful information?', opts: ['Always — expensive means good', 'Never', 'When you know why it is high, and the reason holds', 'When lots of people are buying'], a: 2,
        why: 'A price can carry real information — better materials, more work, harder to get. But it carries it only when you know the reason, not by being large.' },
    ],
  },
  {
    id: 'CHOOSE-4', strand: 'CHOOSE', rung: 4,
    objective: 'Given two sizes of the same thing at different prices, works out which is cheaper per unit and can say why the bigger box is not always better value.',
    needs_maths: ['M5', 'M8'], needs: ['CHOOSE-3'], surface: 'store', teach: 'x-ch4',
    short: 'Working out better value per unit',
    parent_line: 'Ask her which is better value at the shop this week — and let her be wrong once, because that is where it sticks.',
    transfer: [], sources: [],
    assess: [
      { q: 'Four pens for ₹48, or seven pens for ₹77. Which is cheaper per pen?', opts: ['The pack of four', 'The pack of seven', 'They cost the same per pen', 'You need to know the brand'], a: 1,
        why: '48 ÷ 4 = ₹12 a pen. 77 ÷ 7 = ₹11 a pen. Here the bigger pack IS better — the point is not that big packs are a trick, it is that you have to check.' },
      { q: 'A 900g box is ₹108. A 300g box is ₹33. Which is better value per gram?', opts: ['The 900g box', 'The 300g box', 'They are the same per gram', 'The 900g, because you get more'], a: 1,
        why: '108 ÷ 9 = ₹12 per 100g. 33 ÷ 3 = ₹11 per 100g. The small box wins — exactly the case most people never check.' },
      { q: 'You only need 200g. The 900g box is cheaper per gram. Should you buy it?', opts: ['Yes, it is cheaper per gram', 'Not necessarily — you would be paying for 700g you do not need', 'Yes, always buy the best value', 'No, big boxes are a trick'], a: 1,
        why: 'Better value per unit is only better if you use the units. Cheap-per-gram on 700g you throw away is the most expensive option on the shelf.' },
    ],
  },
  {
    id: 'CHOOSE-5', strand: 'CHOOSE', rung: 5,
    objective: 'Recognises manufactured urgency in an offer and can say what waiting would actually cost them.',
    needs_maths: ['M2'], needs: ['CHOOSE-3'], surface: 'store', teach: 'c4a',
    short: 'Spotting manufactured hurry',
    parent_line: 'Point at a countdown timer on a website together and ask what it is for. She will get there before you finish the question.',
    transfer: [], sources: [],
    assess: [
      { q: 'A banner says "3 left at this price!" What is that sentence for?', opts: ['To be helpful about stock', 'To stop you going away and thinking', 'To warn you honestly', 'To show the shop is busy'], a: 1,
        why: 'It may even be true. Its job is still to remove the pause, because the pause is where you notice you did not want it.' },
      { q: 'What actually happens to most "today only" prices tomorrow?', opts: ['They go up for good', 'They very often come back', 'The item disappears', 'They double'], a: 1,
        why: 'A price that is urgent this week is usually urgent again next week. Watching one offer for a fortnight teaches this better than being told.' },
      { q: 'What is the cheapest thing you can do when an offer is rushing you?', opts: ['Buy it before it goes', 'Wait a day and see if you still want it', 'Ask the shop to hold it', 'Buy two in case'], a: 1,
        why: 'Waiting a day costs nothing and answers the question. If you still want it tomorrow, it was not the hurry talking.' },
    ],
  },
  {
    id: 'CHOOSE-6', strand: 'CHOOSE', rung: 6,
    objective: 'Names what is actually being paid with when something is offered free — money later, attention, or information.',
    needs_maths: ['M1'], needs: ['CHOOSE-5'], surface: 'store', teach: 'c4b',
    short: 'Working out what "free" costs',
    parent_line: 'Ask how a free game makes money. Let her work it out — it takes about a minute and she will never quite un-see it.',
    transfer: [], sources: [],
    assess: [
      { q: 'A free game makes money. From what?', opts: ['It does not, it is a gift', 'From ads, from things sold inside it, or from information about you', 'From the app shop', 'From people who play the most'], a: 1,
        why: 'Somebody paid for the people who built it. Working out who is the whole trick, and it usually turns out to be the player, later.' },
      { q: 'Free delivery over ₹500, and your basket is ₹430. What is the shop hoping?', opts: ['That you feel looked after', 'That you add ₹70 you did not want to save ₹40', 'That you shop again', 'That you tell a friend'], a: 1,
        why: 'Spending 70 to save 40 is not a saving. The threshold is placed exactly where it will make you do that.' },
      { q: '"Free trial, cancel any time." What is actually being counted on?', opts: ['That you will love it', 'That you will forget to cancel', 'That you will tell people', 'That you will pay early'], a: 1,
        why: 'Cancel-any-time is true and is not the point. Forgetting is the business model — which is why the diary entry goes in the day you sign up.' },
    ],
  },
  {
    id: 'CHOOSE-7', strand: 'CHOOSE', rung: 7,
    objective: 'Converts a small repeating price into what it comes to over a year, and compares that with the one-off alternative.',
    needs_maths: ['M7'], needs: ['CHOOSE-6'], surface: 'place', teach: 'c4c',
    short: 'Turning a small repeat into a year',
    parent_line: 'Pick one subscription in the house and work out the year together. Do not cancel anything — just look at the number once.',
    transfer: [], sources: [],
    assess: [
      { q: '₹30 a month, for a year, is:', opts: ['₹300', '₹360', '₹390', '₹330'], a: 1,
        why: '30 × 12 = 360. Small numbers that repeat are the ones that get past everybody, precisely because each one looks harmless.' },
      { q: '₹15 a week or ₹700 once. Over a year, which is cheaper, and by how much?', opts: ['The weekly one, by ₹80', 'The one-off, by ₹80', 'The one-off, by ₹20', 'They are the same'], a: 1,
        why: '15 × 52 = ₹780 against ₹700. The one-off saves ₹80 a year — and the weekly one never once felt expensive.' },
      { q: 'Why do sellers prefer to quote a price per week?', opts: ['It is more accurate', 'Because a small number is easier to say yes to', 'Because weeks are simpler', 'To help you budget'], a: 1,
        why: 'The same money, sliced small, meets far less resistance. Converting it back to a year is how you undo the slicing.' },
    ],
  },
  {
    id: 'CHOOSE-8', strand: 'CHOOSE', rung: 8,
    objective: 'Compares buying now against saving up by writing both columns — the extra paid now, and the time given up by waiting — and can defend either answer.',
    needs_maths: ['M6'], needs: ['CHOOSE-2', 'CHOOSE-7'], surface: 'goals', teach: 'x-ch8',
    short: 'Weighing waiting against buying now',
    parent_line: 'When she next wants something she cannot afford yet, ask how many weeks it would take. The number does more work than any answer you could give.',
    transfer: ['loans'], sources: [],
    assess: [
      { q: 'You save ₹120 a week and the thing is ₹500. How many weeks?', opts: ['Four', 'Five, with ₹100 spare', 'Four, with ₹20 short', 'Six'], a: 1,
        why: '120 × 4 = 480, which is 20 short — so five weeks, and you are ₹100 over. Division with a remainder is exactly what saving up is.' },
      { q: 'What makes buying now the better answer sometimes?', opts: ['Never — always wait', 'When having it sooner is worth more to you than the extra it costs', 'When you can afford the payments', 'When it is on offer'], a: 1,
        why: 'Waiting is not a virtue and buying now is not a failure. It is a comparison, and the honest answer needs both columns written down.' },
      { q: 'The thing costs ₹800 now or ₹800 in three weeks, and borrowing adds ₹80. What are you buying for ₹80?', opts: ['A better version', 'Three weeks of having it', 'Nothing', 'The shop’s trust'], a: 1,
        why: 'Naming what the ₹80 buys turns a vague feeling into a straight question: are three weeks worth ₹80 to me, right now?' },
    ],
  },
  {
    id: 'CHOOSE-9', strand: 'CHOOSE', rung: 9,
    objective: 'Names one thing a shop or a screen did on purpose to make buying easier, after they have been in it.',
    needs_maths: ['M1'], needs: ['CHOOSE-5'], surface: 'store', teach: 'c4d',
    short: 'Spotting the shop’s design',
    parent_line: 'On the way out of a shop, ask what was at eye level and what was by the till. She will start doing it unprompted.',
    transfer: [], sources: [],
    assess: [
      { q: 'Sweets by the till are there because:', opts: ['They are small', 'You are queuing with nothing to do and your guard is down', 'They sell fast', 'They need to be kept cool'], a: 1,
        why: 'The queue is the point. It is the one moment you are standing still with money already in your hand.' },
      { q: 'A checkbox is already ticked to add ₹49 of cover. What is that called doing?', opts: ['Being helpful', 'Making the thing you did not choose the default', 'A mistake', 'A legal requirement'], a: 1,
        why: 'Most people never change a default. Setting it in their own favour is the cheapest trick a seller has.' },
      { q: 'Which is the hardest of these to notice while it is happening?', opts: ['A loud sale sign', 'The order the options were put in', 'A countdown timer', 'A queue'], a: 1,
        why: 'Order works without ever announcing itself. The first option gets picked far more than the last, and nobody feels ordered around.' },
    ],
  },
  {
    id: 'CHOOSE-10', strand: 'CHOOSE', rung: 10,
    objective: 'Converts two differently-shaped offers to the same units before choosing, and shows the working.',
    needs_maths: ['M8', 'M13'], needs: ['CHOOSE-4', 'CHOOSE-7'], surface: 'exchange', teach: 'x-ch10',
    short: 'Comparing two unlike offers',
    parent_line: 'Two phone plans, two shop offers, anything. Ask her to get them into the same shape before either of you has an opinion.',
    transfer: [], sources: [],
    assess: [
      { q: 'A flat ₹20 a week, or 5% of sales. You sell ₹300 a week. Which is cheaper?', opts: ['The flat fee, at ₹20', 'The 5%, at ₹15', 'The same', 'It cannot be worked out'], a: 1,
        why: '5% of 300 is 15, against 20. But sell ₹500 and the 5% becomes ₹25 — so the right answer depends on you, not on the offer.' },
      { q: 'What must you do first with two offers in different shapes?', opts: ['Pick the smaller number', 'Get them into the same units', 'Ask which is more popular', 'Read the reviews'], a: 1,
        why: 'Until they are in the same units the two numbers are not comparable at all. Most bad deals survive because nobody converted.' },
      { q: 'Offer A is ₹5 a day. Offer B is ₹140 a month. Over a 30-day month, which is cheaper?', opts: ['Offer A', 'Offer B', 'They come to the same', 'It depends on what you buy'], a: 1,
        why: '5 × 30 = ₹150 against ₹140, so B wins by ₹10 — and in a 28-day February A would win instead. The period you convert to changes the answer.' },
    ],
  },
  {
    id: 'CHOOSE-11', strand: 'CHOOSE', rung: 11,
    objective: 'Sets a spending rule in advance and keeps it through a pay day, rather than deciding again in the moment.',
    needs_maths: ['M10'], needs: ['CHOOSE-8'], surface: 'jars', teach: 'x-ch11',
    short: 'Deciding once, in advance',
    parent_line: 'Ask what her rule is. If she can say it without looking, it is a rule. If she has to think, it is a wish.',
    transfer: [], sources: [],
    assess: [
      { q: 'Why set the jar rule before pay day rather than after?', opts: ['It is faster', 'Because you are calmer before the money is in your hand', 'Because the app makes you', 'It saves more'], a: 1,
        why: 'The rule is not stronger than you. It was just made at a better moment than the one you will be standing in.' },
      { q: 'Your rule sends 3 in every 10 to Save. Pay day is ₹240. How much goes to Save?', opts: ['₹24', '₹72', '₹80', '₹36'], a: 1,
        why: '3 in 10 is 30%, and 30% of 240 is 72 — which you can also get as 240 ÷ 10 × 3, in coins, without a percent anywhere.' },
      { q: 'You break your rule once for something you really wanted. What is the useful response?', opts: ['Scrap the rule', 'Notice whether the rule is wrong, or whether that was just a hard week', 'Never break it again', 'Lower the rule so it is easy'], a: 1,
        why: 'One break is information, not a verdict. A rule you break every week is set wrong; a rule you broke once is a rule.' },
    ],
  },
  {
    id: 'CHOOSE-12', strand: 'CHOOSE', rung: 12,
    objective: 'Looks back at their own past purchases, sorts them into still-glad and not, and names the pattern.',
    needs_maths: ['M2'], needs: ['CHOOSE-11', 'CHOOSE-9'], surface: 'wallet', teach: 'x-ch12',
    short: 'Reading your own spending back',
    parent_line: 'Ask which of last month’s things she is still glad about. Do not comment on the answer — just ask it again next month.',
    transfer: [], sources: [],
    assess: [
      { q: 'What is the most useful moment to judge a purchase?', opts: ['In the shop', 'A week later', 'The moment you pay', 'When a friend sees it'], a: 1,
        why: 'In the shop you are being sold to. A week later you are not, and that is the only reading worth having.' },
      { q: 'Three of your regrets were all bought in a hurry. That is:', opts: ['Bad luck', 'A pattern you can use to catch the next one', 'A reason to stop buying things', 'A coincidence'], a: 1,
        why: 'One regret is an afternoon. Three with the same shape is a rule you have discovered about yourself, which is worth far more than the money.' },
      { q: 'Why look back at spending you cannot change?', opts: ['To feel bad', 'Because the next decision is the one it improves', 'To tell other people', 'To work out totals'], a: 1,
        why: 'The money is gone either way. The only thing the review can change is what happens the next time it looks like that.' },
    ],
  },
];

/* The other five strands live in their own file because this one is long
   enough; they are the same schema and validate() sees them too. */
OBJECTIVES.push(...MORE_OBJECTIVES);

/* ── lookups ─────────────────────────────────────────────────────────────── */
export const NEW_CARD_LIST = NEW_CARDS;
const BY_ID = Object.fromEntries(OBJECTIVES.map((o) => [o.id, o]));
export function objective(id) { return BY_ID[id]; }
export function objectivesIn(strand) { return OBJECTIVES.filter((o) => o.strand === strand); }
export const STRANDS = ['EARN', 'CHOOSE', 'KEEP', 'GROW', 'OWE', 'GUARD'];

/* Surfaces that actually call mastery.transfer(). A surface named in an
   objective's `transfer` list but missing from here is a promise the app can
   never keep — the state would be unreachable and the parent report would be
   quietly poorer than it claims. validate() fails on it, so the list and the
   code cannot drift apart. Add a surface here only when you have written the
   call, not when you intend to. */
export const INSTRUMENTED = ['store', 'goals', 'loans', 'letter', 'wallet', 'jars', 'bank', 'portfolio', 'business'];

/* The teaching card for an objective, whether it lives in a chapter or here. */
export function teachCard(o, allCards) {
  return NEW_CARDS.find((c) => c.id === o.teach) || allCards.find((c) => c.id === o.teach) || null;
}

/* One assessment item, as a card-shaped object so the ordinary drill renderer
   and shuffledDrill's answer permutation both work on it unchanged. The id is
   stable and unique per item, which is what makes the permutation stable. */
export function assessCard(o, i) {
  const d = o.assess[i];
  return { id: `${o.id}#${i}`, title: o.short, who: 'pip', objective: o.id, assess: true, drill: d };
}

/* Schema constraints, run in dev and by the test driver. A rule that only
   lives in a document is a rule that has already been broken somewhere. */
export function validate(allCards) {
  const errs = [];
  const seen = new Set();
  OBJECTIVES.forEach((o) => {
    if (seen.has(o.id)) errs.push(`${o.id}: duplicate id`);
    seen.add(o.id);
    if (!o.surface) errs.push(`${o.id}: no surface — nothing is taught without a place in the town`);
    if (!o.objective || o.objective.length < 30) errs.push(`${o.id}: objective is not a written behaviour`);
    if (!o.parent_line) errs.push(`${o.id}: no parent_line, so it can never appear in a report`);
    if (!teachCard(o, allCards)) errs.push(`${o.id}: teach card "${o.teach}" does not exist`);
    if (!o.assess || o.assess.length < 3) errs.push(`${o.id}: needs three retrieval items, has ${(o.assess || []).length}`);
    (o.assess || []).forEach((d, i) => {
      if (!d.opts || d.opts.length < 3) errs.push(`${o.id}#${i}: fewer than three options`);
      if (typeof d.a !== 'number' || !d.opts[d.a]) errs.push(`${o.id}#${i}: answer index is not an option`);
      if (!d.why) errs.push(`${o.id}#${i}: no why — a wrong answer must teach`);
      const uniq = new Set(d.opts.map((x) => String(x).trim().toLowerCase()));
      if (uniq.size !== d.opts.length) errs.push(`${o.id}#${i}: duplicate options`);
    });
    (o.needs || []).forEach((n) => { if (!BY_ID[n]) errs.push(`${o.id}: needs unknown objective ${n}`); });
    (o.transfer || []).forEach((t) => {
      if (t === o.surface) errs.push(`${o.id}: "${t}" is its own teaching surface — that is practice, not transfer`);
      if (!INSTRUMENTED.includes(t)) errs.push(`${o.id}: transfer surface "${t}" is never recorded, so the state is unreachable`);
    });
  });
  return errs;
}
