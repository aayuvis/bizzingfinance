/* content.js — everything the app teaches, in one place.
   Rules that bind this file:
   · No real company is ever named as a thing to buy (CONCEPT §6.2).
   · No factual number without a source (CONCEPT §6.5) — so every figure here
     is Bizzington's own arithmetic, never a real rate or a real return.
   · No drill leaks its answer in on-screen text, and option order is permuted
     from the card id (`shuffledDrill`) so position can't leak it either. */

import { rng } from './ui.js';
import { EXTRA_QS } from './content-extra.js';

/* ── the ladder ──────────────────────────────────────────────────────────
   Thirty levels, five ranks. The rank is what opens the next building. */
export const LEVELS = (() => {
  const t = [];
  for (let n = 1; n <= 30; n++) t.push(Math.round(24 * (n - 1) + 1.3 * (n - 1) * (n - 1)));
  return t;
})();
export const RANKS = [
  { at: 1,  name: 'Saver',    em: '🪙', of: 'what money is, and how it arrives' },
  { at: 6,  name: 'Budgeter', em: '🫙', of: 'a plan, and the sellers who test it' },
  { at: 11, name: 'Banker',   em: '🏛️', of: 'interest, safety, and what borrowing costs' },
  { at: 16, name: 'Investor', em: '📈', of: 'risk, time, and never owning one thing' },
  { at: 23, name: 'Founder',  em: '🏪', of: 'revenue, cost, and the difference between them' },
];
export function levelFor(xp) {
  let l = 1;
  for (let i = 1; i < LEVELS.length; i++) if (xp >= LEVELS[i]) l = i + 1;
  return Math.min(l, LEVELS.length);
}
export function rankFor(level) {
  let r = RANKS[0];
  RANKS.forEach((x) => { if (level >= x.at) r = x; });
  return r.name;
}
export function rankObj(level) {
  let r = RANKS[0];
  RANKS.forEach((x) => { if (level >= x.at) r = x; });
  return r;
}

/* ── chapters ────────────────────────────────────────────────────────── */
export const CHAPTERS = [
  {
    id: 'c1', title: 'What money even is', rank: 'Saver', em: '🪙', lv: 1,
    blurb: 'Where money comes from, and why anyone accepts a piece of paper for a mango.',
    cards: [
      {
        id: 'c1a', title: 'Money is an agreement', who: 'nana',
        teach: 'A note is a piece of paper. It buys bread because <b>everyone agrees it does</b> — not because the paper is worth anything. Different places agree on different money, which is why the notes change when you cross a border.',
        eg: 'The same slice of cake costs a different number in every country. The cake did not change.',
        drill: { q: 'Why will the shopkeeper hand over a mango for a note?', opts: ['The paper is worth a mango', 'Everyone has agreed the note can be swapped for things', 'The government sends her a mango later', 'The note is made of gold'], a: 1,
          why: 'Money works because of shared agreement. That is also why a note from another country is no use at your corner shop.' },
      },
      {
        id: 'c1b', title: 'Needs and wants', who: 'pip',
        teach: 'A <b>need</b> is something you would be in trouble without. A <b>want</b> is something that makes life nicer. Both are allowed! The trick is knowing which one you are looking at <i>before</i> you pay.',
        eg: 'Rain is coming. An umbrella is a need today and a want in May.',
        drill: { q: 'Which of these changes from a want to a need depending on the day?', opts: ['A birthday cake', 'An umbrella', 'A gold chain', 'A video game'], a: 1,
          why: 'Lots of things move between the two columns. That is why "needs vs wants" is a question, not a list.' },
      },
      {
        id: 'c1c', title: 'Where money comes from', who: 'pip',
        teach: 'Money arrives because somebody <b>traded something they had for something they wanted</b>. Usually that is time and skill: you do work, someone pays. Nobody is given money for nothing — and if a message says they will, read chapter five twice.',
        eg: 'Pip carries crates for the grain seller. The grain seller has money and no time. Both end up better off.',
        drill: { q: 'Mrs Rao pays you to deliver flyers. What did you actually sell her?', opts: ['Paper', 'Your time and effort', 'Nothing — it was a gift', 'Her own flyers'], a: 1,
          why: 'Wages are a trade. Knowing that is what stops "free money" offers from ever sounding normal.' },
      },
      {
        id: 'c1d', title: 'Price is not value', who: 'mags',
        teach: 'The <b>price</b> is what the seller asks. The <b>value</b> is what it is worth <i>to you</i>. They are almost never the same number, and the gap between them is where every good and bad decision lives.',
        eg: 'Mags will sell you a shiny button for a whole week of wages. The price is real. The value is up to you.',
        drill: { q: 'Two shops sell the same water bottle at very different prices. What must be true?', opts: ['The dearer one is always better made', 'Price does not only depend on the thing itself', 'The cheaper one is broken', 'One of them is breaking the law'], a: 1,
          why: 'Location, timing, and who is buying all move a price. The bottle is the same bottle.' },
      },
    ],
  },
  {
    id: 'c2', title: 'Earning it', rank: 'Saver', em: '🧺', lv: 3,
    blurb: 'What you are really selling when somebody pays you, and how to be worth asking twice.',
    cards: [
      {
        id: 'c2a', title: 'You are selling time', who: 'pip',
        teach: 'Nearly every job is the same trade underneath: somebody has money and not enough <b>time</b>, and you have time and not enough money. The price is what your hour is worth to <i>them</i>, not what it feels like to you.',
        eg: 'Two hours stacking crates pays the same whether it felt long or short. The clock is the product.',
        drill: { q: 'Why does the grain seller pay for an hour of crate-stacking?', opts: ['She enjoys company', 'Her own hour is worth more spent elsewhere', 'Crates cannot be moved by owners', 'It is the law'], a: 1,
          why: 'People buy time when their own is worth more doing something else. That idea comes back in every job you will ever have.' },
      },
      {
        id: 'c2b', title: 'Being worth asking twice', who: 'nana',
        teach: 'The first job comes from luck. The second comes from how you did the first. Turning up, finishing, and saying what went wrong are worth more over a year than being the fastest.',
        eg: 'Nana rehired the same boy for eleven years. He was never the quickest. He always said when a crate was cracked.',
        drill: { q: 'What most affects whether you get asked back?', opts: ['Being the fastest', 'Being reliable and honest about problems', 'Charging the least', 'Knowing the owner'], a: 1,
          why: 'Reputation is the thing that compounds fastest in a working life, and it is the only one you build for free.' },
      },
      {
        id: 'c2c', title: 'Gifts are not wages', who: 'pip',
        teach: 'Money you were <b>given</b> and money you <b>earned</b> spend exactly the same — but they are not the same to plan with. A gift arrives once. A wage arrives again if you keep doing the thing.',
        eg: 'A birthday 500 is lovely. It is not an income, and a plan built on it falls over next month.',
        drill: { q: 'Why is it risky to plan a monthly budget around gift money?', opts: ['Gifts are taxed', 'It arrives once and may not come again', 'Gifts are worth less', 'You must give it back'], a: 1,
          why: 'A budget is built on what repeats. One-off money is best pointed at one-off things — a goal, not a habit.' },
      },
      {
        id: 'c2d', title: 'More than one tap', who: 'mags',
        teach: 'People who only have one way of getting money are one bad week away from having none. Selling something you no longer use, doing a second small job, or being paid for a thing you would do anyway — these are extra taps.',
        eg: 'Mags sells buttons, mends umbrellas, and finds things. Two of those go badly most months. She is never broke.',
        drill: { q: 'Why does having more than one source of income help?', opts: ['It earns more in total', 'One of them stopping no longer means nothing arrives', 'It is easier work', 'It avoids tax'], a: 1,
          why: 'This is diversification, three chapters early and applied to earning instead of investing. It is the same idea both times.' },
      },
    ],
  },
  {
    id: 'c3', title: 'Making a plan', rank: 'Budgeter', em: '🫙', lv: 6,
    blurb: 'Income, outgo, and the four jars that stop the month being a surprise.',
    cards: [
      {
        id: 'c3a', title: 'In, out, and what is left', who: 'pip',
        teach: 'A budget is only two columns: money <b>in</b> and money <b>out</b>. What is left over is the only part you get to choose about. If out is bigger than in, the difference has to come from somewhere — savings, or someone else.',
        eg: 'In: 200 on pay day. Out: 60 phone, 40 bus. Left: 100. That 100 is the interesting number.',
        drill: { q: 'Money in is 200. Money out is 240. What has to be true?', opts: ['Nothing, it balances', 'The gap comes out of savings or a loan', 'The bank fixes it', 'You earned 240'], a: 1,
          why: 'A shortfall never vanishes. It moves — usually onto next month.' },
      },
      {
        id: 'c3b', title: 'The four jars', who: 'nana',
        teach: 'Split what comes in, the moment it arrives: <b>Spend</b> for now, <b>Save</b> for something soon, <b>Grow</b> for far away, <b>Give</b> for someone else. Splitting first is the whole trick — anything left in one pile gets spent as one pile.',
        eg: 'Nana has done 40 / 30 / 20 / 10 for sixty years and has never once made a spreadsheet.',
        drill: { q: 'Why split the money the moment it arrives, instead of at the end of the week?', opts: ['It earns more that way', 'Because what sits in one pile gets spent as one pile', 'The bank requires it', 'It makes the total bigger'], a: 1,
          why: 'This is "pay yourself first". It works because it removes the decision, not because it changes the maths.' },
      },
      {
        id: 'c3c', title: 'What it really cost', who: 'mags',
        teach: 'Every yes is also a no. Buying the shiny thing is not just "minus 600" — it is <b>also</b> the trip you now cannot take, or the goal that just moved three weeks further away. Grown-ups call that <i>opportunity cost</i>.',
        eg: 'Mags never mentions the second half of the price. That is not lying — it is just selling.',
        drill: { q: 'You spend your whole Save jar on a game. What did it cost?', opts: ['The price of the game', 'The price, plus whatever the Save jar was for', 'Nothing, it was your money', 'Only the tax'], a: 1,
          why: 'Opportunity cost is the part of the price that is not on the label.' },
      },
      {
        id: 'c3d', title: 'How many weeks?', who: 'pip',
        teach: 'A goal turns into a plan the moment you divide. <b>Price ÷ what you save each week = weeks.</b> If the answer is horrifying, you have three honest choices: save more each week, want something cheaper, or wait longer.',
        eg: 'A 900 skateboard, saving 60 a week, is 15 weeks. Not "someday". Fifteen.',
        drill: { q: 'It costs 800. You put away 50 a week. Roughly how long?', opts: ['4 weeks', '8 weeks', '16 weeks', '40 weeks'], a: 2,
          why: '800 ÷ 50 = 16. Dividing turns a wish into a date, which is why the Build Yard shows weeks, not encouragement.' },
      },
    ],
  },
  {
    id: 'c4', title: 'Sellers and their tricks', rank: 'Budgeter', em: '🪧', lv: 8,
    blurb: 'Urgency, "free", the small monthly one, and why the shop is arranged like that.',
    cards: [
      {
        id: 'c4a', title: 'Hurry is a tool', who: 'mags',
        teach: '"Today only." "Last one." "Ends at midnight." These are not facts about the thing — they are <b>tools that stop you thinking</b>, and they work because a decision made fast feels like a decision made bravely.',
        eg: 'Mags has said "the last one" about the same tray of buttons for six years.',
        drill: { q: 'A shop says the offer ends in one hour. What is the safest first move?', opts: ['Buy immediately', 'Notice the hurry is part of the sale, then decide', 'Argue about the price', 'Assume it is a scam'], a: 1,
          why: 'Urgency is not proof of a bargain, and it is not proof of a scam either. It is a technique — and naming it gives you your thinking back.' },
      },
      {
        id: 'c4b', title: 'Free is never free', who: 'nana',
        teach: 'If you are not paying money, something else is being paid: your attention, your details, your time, or a much bigger payment later. Free samples, free games, free trials — all real, all paid for somehow.',
        eg: 'The free trial that needs a card is not selling you a trial. It is selling you the forgetting.',
        drill: { q: 'A game is free to play but sells extras. Who is it built to please?', opts: ['Everybody equally', 'The players most likely to spend', 'The players who never spend', 'Nobody in particular'], a: 1,
          why: 'Knowing who a thing is designed for tells you what it will try to make you do.' },
      },
      {
        id: 'c4c', title: 'The small monthly one', who: 'pip',
        teach: 'A subscription is a decision you make <b>once</b> and pay for <b>forever</b>. Small numbers are the point: 30 a month does not feel like 360 a year, but that is exactly what it is.',
        eg: 'Four small monthly things nobody remembers signing up for is most of a week of wages, every year.',
        drill: { q: 'Something costs 25 a month. What is the honest way to see it?', opts: ['25', '300 a year, until you cancel', 'Free after the first month', 'A one-off 25'], a: 1,
          why: 'Multiply every subscription by twelve before you agree to it. Then cancel the ones you would not buy at that price.' },
      },
      {
        id: 'c4d', title: 'The shop is a machine', who: 'mags',
        teach: 'Sweets at the till, milk at the back, the dearest thing at eye height — none of that is an accident. A shop is <b>arranged to make buying easy</b>, which is fine, so long as you know that is what it is.',
        eg: 'You walked past eleven things to reach the bread. That was the plan.',
        drill: { q: 'Why is milk usually at the back of the shop?', opts: ['It stays cooler there', 'So you walk past everything else', 'It is heavy', 'Nobody buys it'], a: 1,
          why: 'A shop is designed, and so is a website. Noticing the design is most of the defence.' },
      },
    ],
  },
  {
    id: 'c5', title: 'Keeping it safe', rank: 'Banker', em: '🛡️', lv: 11,
    blurb: 'Banks, secrets, and the messages that will actually reach you this year.',
    cards: [
      {
        id: 'c5a', title: 'What a bank is for', who: 'nana',
        teach: 'A bank keeps money safer than a tin under a bed, lets you pay without carrying notes, and <b>pays you a little for leaving it there</b> — because while it sits, the bank lends it to somebody else.',
        eg: 'Your money does not sit in a drawer with your name on it. It is out working, and the bank owes you it back.',
        drill: { q: 'How does a bank afford to pay you interest?', opts: ['The government pays it', 'It lends your money to others for more than it pays you', 'It sells shares', 'It charges the shops'], a: 1,
          why: 'A bank sits between savers and borrowers and keeps the gap. Knowing that makes both sides of interest obvious.' },
      },
      {
        id: 'c5b', title: 'The three secrets', who: 'pip',
        teach: 'A PIN, a password, and a one-time code are <b>yours alone</b>. Nobody real ever needs them — not the bank, not the police, not a helpful stranger, not a friend. Anybody asking is telling you what they are.',
        eg: 'The real bank already knows your account. That is how it is your bank.',
        drill: { q: 'Someone says they are from your bank and asks for the code they just texted you. What is true?', opts: ['Give it if the number matches', 'A real bank never needs that code from you', 'Give half of it', 'Ask them to text again'], a: 1,
          why: 'The one-time code exists to prove it is you. Handing it over is handing over the proof.' },
      },
      {
        id: 'c5c', title: 'The shape of a scam', who: 'nana',
        teach: 'Scams differ in story and are identical in shape: <b>a reward or a fright, a hurry, and a secret</b>. You have won. Your account is at risk. Do not tell anyone. When you see the shape, the story stops mattering.',
        eg: 'Prize, panic, or a friend in trouble — always in a rush, always just between us.',
        drill: { q: 'Which combination should always stop you?', opts: ['A good deal in a busy shop', 'Urgency plus secrecy plus money', 'A message with spelling mistakes', 'An offer from someone new'], a: 1,
          why: 'Bad spelling is a weak clue and honest strangers exist. Hurry plus secrecy plus money is the reliable one.' },
      },
      {
        id: 'c5d', title: 'Telling someone is the answer', who: 'pip',
        teach: 'The reason scams work on grown-ups too is <b>embarrassment</b>. The instruction "don\'t tell anyone" is not protecting you, it is protecting them. Telling somebody is not the thing you do after failing — it is the move itself.',
        eg: 'A friend who really needs help can wait sixty seconds while you check with an adult. Someone who cannot, is not your friend.',
        drill: { q: 'You already sent money and feel silly. What is the best next step?', opts: ['Say nothing and hope', 'Tell a grown-up straight away', 'Send more to fix it', 'Block and forget it'], a: 1,
          why: 'Fast telling is what limits the damage — and being able to say it out loud is the skill worth more than the money.' },
      },
    ],
  },
  {
    id: 'c6', title: 'Borrowing', rank: 'Banker', em: '🤝', lv: 13,
    blurb: 'What credit costs, why it exists, and why it is never a verdict on a person.',
    cards: [
      {
        id: 'c6a', title: 'Interest, both ways', who: 'nana',
        teach: 'Interest is <b>rent on money</b>. Leave money with a bank and they pay you rent for using it. Borrow money and you pay rent for using theirs. Same idea, and which side you are on makes all the difference.',
        eg: 'Borrowing is not shameful — it is a tool with a price on it. Always find the price before you agree.',
        drill: { q: 'What is the honest way to describe interest on a loan?', opts: ['A punishment for being bad with money', 'The rent you pay for using somebody else’s money', 'A tax', 'A fee the shop keeps'], a: 1,
          why: 'Credit is a tool with a price, never a moral failing. Knowing the price is the skill.' },
      },
      {
        id: 'c6b', title: 'The number that matters', who: 'pip',
        teach: 'Sellers quote the <b>monthly payment</b> because it is small. The number that tells you the truth is <b>everything you will hand over in total</b>, minus what you borrowed. That gap is what it cost.',
        eg: 'Borrow 1,000, pay back 110 a month for a year: you handed over 1,320. It cost 320.',
        drill: { q: 'You borrow 500 and repay 60 a month for ten months. What did borrowing cost?', opts: ['60', '100', '500', 'Nothing'], a: 1,
          why: '60 × 10 = 600, less the 500 you borrowed = 100. Always do that multiplication before you sign anything.' },
      },
      {
        id: 'c6c', title: 'Good reasons and bad ones', who: 'nana',
        teach: 'Borrowing for a thing that <b>earns or lasts</b> — a tool, a course, a roof — can be sensible even with the rent on top. Borrowing for a thing that is gone by Friday means paying rent on a memory.',
        eg: 'A loan for the umbrella stock made Nana money. A loan for the festival did not, and she would do it again anyway.',
        drill: { q: 'Which is the more defensible reason to borrow?', opts: ['A weekend away', 'A tool that lets you take on paid work', 'A better phone than your friend’s', 'Because the offer was there'], a: 1,
          why: 'Not a rule about fun — a question. Will this still be worth something when the repayments are still arriving?' },
      },
      {
        id: 'c6d', title: 'Trust is a memory', who: 'pip',
        teach: 'Lenders keep a record of whether people paid them back. A good record makes borrowing cheaper later; a bad one makes it dearer. It is a <b>memory of what happened</b>, not a score of what kind of person you are — and it can be rebuilt.',
        eg: 'Bizzington calls it a trust score. It goes up every time you repay and never says anything about you.',
        drill: { q: 'What does a lender’s record of you actually describe?', opts: ['How much money you have', 'Whether past borrowing was repaid', 'How hard you work', 'Whether you deserve help'], a: 1,
          why: 'Plenty of good people have bad records after a bad year. It measures history, and history can be added to.' },
      },
    ],
  },
  {
    id: 'c7', title: 'Money that grows', rank: 'Investor', em: '📈', lv: 16,
    blurb: 'Compounding, risk, and why nobody sensible owns just one thing.',
    cards: [
      {
        id: 'c7a', title: 'The snowball', who: 'pip',
        teach: 'Interest lands on your money — and then next time, it lands on <b>your money plus the interest</b>. That is compounding. It is boring for a year and then it is not boring at all.',
        eg: '100 growing 10% a year: 110, then 121, then 133. The steps get bigger while you do nothing.',
        drill: { q: 'Why does the second year add more than the first?', opts: ['The rate went up', 'There is more money for the rate to land on', 'The bank felt generous', 'Prices rose'], a: 1,
          why: 'Growth stacking on growth is the whole idea. Time does the heavy lifting, which is why starting early beats starting big.' },
      },
      {
        id: 'c7b', title: 'Risk and return', who: 'bo',
        teach: 'Things that <i>might</i> grow a lot can also fall a lot — those are the same sentence, not two different ones. Safe things grow slowly. Anybody promising big returns with no risk is either confused or lying.',
        eg: 'Bo says it will go up. Bea says it will go down. Neither of them knows, and both of them are certain.',
        drill: { q: 'Somebody offers a "guaranteed" way to double your money in a month. What is the safe read?', opts: ['Take it quickly before it goes', 'Guaranteed and doubling do not belong in the same sentence', 'Ask them to do it twice', 'Only put in half'], a: 1,
          why: 'High return with no risk is the oldest shape a scam takes.' },
      },
      {
        id: 'c7c', title: 'Never just one', who: 'bea',
        teach: 'Owning a slice of <b>many</b> things means no single piece of bad news can wreck you. Owning one thing means your whole week depends on somebody else’s Tuesday. Spreading out is the only free thing in this entire subject.',
        eg: 'A basket of the whole market is dull, and dull wins more often than exciting does.',
        drill: { q: 'Why spread money across many things instead of the one you like best?', opts: ['It grows faster', 'One piece of bad news can no longer sink everything', 'It costs less', 'The best one is hard to find'], a: 1,
          why: 'Diversification does not raise your top score. It raises your worst one — and the worst one is what ends games.' },
      },
      {
        id: 'c7d', title: 'Time is the ingredient', who: 'nana',
        teach: 'Money you need <b>next month</b> must be somewhere safe, even if it grows by almost nothing. Money you will not touch for <b>ten years</b> can sit through bad weather, because it has time to come back.',
        eg: 'The bus fare and the retirement fund are not the same money and must not live in the same place.',
        drill: { q: 'You need the money in three weeks. Where does it belong?', opts: ['Whatever grew most last year', 'Somewhere safe and boring', 'Split across four companies', 'The one your friend likes'], a: 1,
          why: 'How soon you need it decides where it goes — before any question about what might grow fastest.' },
      },
    ],
  },
  {
    id: 'c8', title: 'Running something', rank: 'Founder', em: '🏪', lv: 23,
    blurb: 'Revenue, cost, profit — and the week you learn those are three different words.',
    cards: [
      {
        id: 'c8a', title: 'Three different words', who: 'nana',
        teach: '<b>Revenue</b> is everything that came in. <b>Cost</b> is what you paid to make it happen. <b>Profit</b> is what is left. A busy shop with no profit is a very tiring hobby.',
        eg: 'Sold 40 umbrellas at 20 = 800 in. They cost 8 each = 320 out. Profit 480.',
        drill: { q: 'A stall takes 1,000 and spent 900 on stock. What is the profit?', opts: ['1,000', '100', '900', '1,900'], a: 1,
          why: 'Revenue is the number people brag about. Profit is the number that decides whether you are still open next year.' },
      },
      {
        id: 'c8b', title: 'Setting a price', who: 'mags',
        teach: 'Price too low and you sell out and earn nothing. Price too high and you carry the stock home. The right price is not "cost plus a bit" — it is <b>the most people will happily pay</b>, which you only find by trying.',
        eg: 'Mags raised buttons from 8 to 12 and sold two fewer. She made more money and went home earlier.',
        drill: { q: 'You raise the price and sell a few less, but take more money overall. What should you do?', opts: ['Go back to the old price', 'Keep the new price', 'Halve the price', 'Stop selling them'], a: 1,
          why: 'What matters is total profit, not how many you shifted. Selling more is not the goal; keeping more is.' },
      },
      {
        id: 'c8c', title: 'Cash is not profit', who: 'pip',
        teach: 'You can be <b>profitable and broke at the same time</b>. Profit is on paper over a month; cash is what is in your hand on Tuesday when the stock must be paid for and the customers have not come yet.',
        eg: 'Nana\'s best-ever month nearly closed the shop: the restock was due before the sales landed.',
        drill: { q: 'Your shop is profitable but you cannot pay for stock this week. What is the problem?', opts: ['You are not profitable really', 'Money comes in later than it goes out', 'The price is wrong', 'You sold too much'], a: 1,
          why: 'Timing kills more small businesses than pricing does. Profit is an opinion about a month; cash is a fact about today.' },
      },
      {
        id: 'c8d', title: 'The stuff that arrives anyway', who: 'nana',
        teach: 'Rent and licences arrive whether you sold anything or not — those are <b>fixed</b>. Stock costs only arrive when you sell — those are <b>variable</b>. A quiet week hurts because the fixed ones do not care.',
        eg: 'Two hundred rent a month is seven a day, before you have sold a single thing.',
        drill: { q: 'Which cost still arrives in a week you sell nothing?', opts: ['Stock', 'Rent', 'Wrapping paper', 'Nothing does'], a: 1,
          why: 'Knowing your fixed costs tells you the smallest week you can survive — the single most useful number a small business owner has.' },
      },
    ],
  },
];
export const ALL_CARDS = CHAPTERS.flatMap((c) => c.cards.map((k) => ({ ...k, ch: c.id })));

/* The second and third questions live in content-extra.js — merged here so
   every consumer keeps a single ALL_CARDS and drillCount() is the only
   arbiter of how many questions a card carries. */
ALL_CARDS.forEach((c) => { if (EXTRA_QS[c.id]) c.qs = EXTRA_QS[c.id]; });

/* Position must never leak the answer. Options are permuted deterministically
   from the card id, so the order is stable for a given card but is not the
   order they were authored in — otherwise "always pick B" beats the drill. */
export function drillCount(card) { return 1 + ((card.qs && card.qs.length) || 0); }
export function drillAt(card, qi) { return qi ? card.qs[qi - 1] : card.drill; }
export function shuffledDrill(card, qi = 0) {
  const d = drillAt(card, qi);
  const seed = card.id + '#' + qi;   /* each question permutes independently */
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const idx = d.opts.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507); h >>>= 0;
    const j = h % (i + 1);
    const t = idx[i]; idx[i] = idx[j]; idx[j] = t;
  }
  return { order: idx, opts: idx.map((i) => d.opts[i]), answer: idx.indexOf(d.a), q: d.q, why: d.why };
}

/* ── the worlds ──────────────────────────────────────────────────────────
   The game is a journey between places, not one street. Each world carries
   its own chapters, its own work, its own games and exactly one new money
   tool — and you cannot travel on until you have finished learning where you
   are. That is "education first, then investment" as a rule the code keeps,
   rather than a promise in a doc. */
export const WORLDS = [
  {
    id: 'market', tint: '#E0A85C', name: 'Market Row', em: '🧺', rank: 'Saver',
    blurb: 'Stalls, crates and your first room. Where money arrives because you went and got it.',
    chapters: ['c1', 'c2'],
    places: ['place', 'wallet'],
    jobs: ['crates', 'flyers', 'sweep'],
    sky: ['#CFE9EE', '#F6EFDC'], ground: '#DCCFA8', road: '#C9BE9C',
    opens: 'Your stall, and a room above it.',
  },
  {
    id: 'harbour', tint: '#3E86A8', name: 'The Old Harbour', em: '⚓', rank: 'Budgeter',
    blurb: 'Cargo, tides and weather. Nothing here rewards a plan made on the day.',
    chapters: ['c3', 'c4'],
    places: ['jars', 'goals'],
    jobs: ['nets', 'cargo', 'mend'],
    sky: ['#BFDDE8', '#E9EEDF'], ground: '#B9C3A8', road: '#9FAE93',
    opens: 'The Jar Shed and the Build Yard.',
  },
  {
    id: 'clock', tint: '#6E6AA8', name: 'Clocktower Square', em: '🕰️', rank: 'Banker',
    blurb: 'Stone, ledgers and a clock that strikes interest in public.',
    chapters: ['c5', 'c6'],
    places: ['bank'],
    jobs: ['books', 'errands'],
    sky: ['#D6DCE9', '#F1EEE4'], ground: '#C6BEB0', road: '#ADA595',
    opens: 'The Bank — and, once you have read chapter six, borrowing.',
  },
  {
    id: 'exchange', tint: '#2F9E8F', name: 'The Exchange Quarter', em: '📈', rank: 'Investor',
    blurb: 'Chalkboards, arguments, and two animals who are each certain and often wrong.',
    chapters: ['c7'],
    places: ['exchange'],
    jobs: ['runner', 'board'],
    sky: ['#C9E0E4', '#EDE6DC'], ground: '#AFC0BE', road: '#96A8A6',
    opens: 'The Exchange. Not before you have learned what a share is.',
  },
  {
    id: 'works', tint: '#B4682F', name: 'The Works', em: '🏭', rank: 'Founder',
    blurb: 'Where things get made, priced, and sold for more than they cost. Or not.',
    chapters: ['c8'],
    places: ['shop'],
    jobs: ['crates', 'books'],
    sky: ['#E4D9CD', '#F4EBDC'], ground: '#C3AE93', road: '#A8957D',
    opens: 'Bizz & Co, and the shutters come off for good.',
  },
];
export function worldOf(id) { return WORLDS.find((w) => w.id === id) || WORLDS[0]; }

/* Every surface and every game names the chapter that opens it. Nothing is
   gated on a raw XP number any more: you learn the thing, then you get the
   tool that needs it. */
export const UNLOCKS = {
  place: null, wallet: null,
  jars: 'c3', goals: 'c3',
  bank: 'c5', loans: 'c6',
  portfolio: 'c7',
  business: 'c8',
};
export function chapterDone(c, id) {
  const ch = CHAPTERS.find((x) => x.id === id);
  return !!ch && ch.cards.every((k) => c.learn.done[k.id]);
}
/* ── tester mode ──────────────────────────────────────────────────────────
   For trying the app, not for a child: every GATE passes — chapters, worlds,
   the Bank, the Exchange, the shop, every game — while the child's learn
   record stays exactly what it is. A gate is a function here so that the
   tester flag is one line in one place; a view that compares levels by hand
   is a gate that tester mode cannot open. Set from the household's settings
   (main.js) the way the currency is. */
let TESTER = false;
export function setTester(on) { TESTER = !!on; }
export function tester() { return TESTER; }
export function chapterLocked(c, ch) { return !TESTER && c.learn.level < ch.lv; }
export function levelAtLeast(c, lv) { return TESTER || c.learn.level >= lv; }
export function gameOpen(c, g) { return TESTER || !g.needs || chapterDone(c, g.needs); }

export function isOpen(c, key) {
  if (TESTER) return true;
  const need = UNLOCKS[key];
  return !need || chapterDone(c, need);
}
export function needFor(key) {
  const id = UNLOCKS[key];
  const ch = id && CHAPTERS.find((x) => x.id === id);
  return ch ? ch.title : null;
}
export function worldOpen(c, i) {
  if (TESTER || i <= 0) return true;
  return WORLDS.slice(0, i).every((w) => w.chapters.every((ch) => chapterDone(c, ch)));
}

/* ── daily quests ────────────────────────────────────────────────────────
   Three a day, drawn deterministically from the date so every child in the
   house gets the same three and can compare. They pay a WAGE into the same
   wallet as everything else — there is no second currency here and there
   never will be (CONCEPT §3.1). */
export const QUESTS = [
  { id: 'q-card',   em: '📗', kind: 'lesson', n: 1, pay: 5,  t: 'Learn one card',            sub: 'Any chapter that is open to you.' },
  { id: 'q-card2',  em: '📘', kind: 'lesson', n: 2, pay: 9,  t: 'Learn two cards',           sub: 'Back to back. It is ten minutes.' },
  { id: 'q-letter', em: '✉️', kind: 'letter', n: 1, pay: 4,  t: 'Empty the postbox',         sub: 'One letter. Thirty seconds.' },
  { id: 'q-job',    em: '🧺', kind: 'job',    n: 2, pay: 6,  t: 'Take two jobs',             sub: 'Whatever is going on the Row.' },
  { id: 'q-play',   em: '🎮', kind: 'game',   n: 2, pay: 7,  t: 'Play two games',            sub: 'Any two in the arcade.' },
  { id: 'q-earn',   em: '🪙', kind: 'earn',   n: 40, pay: 6, t: 'Earn 40 today',             sub: 'Jobs, games, letters — it all counts.' },
  { id: 'q-jar',    em: '🫙', kind: 'jar',    n: 20, pay: 7, t: 'Put 20 away',               sub: 'Into any jar that is not Spend.', needs: 'c3' },
  { id: 'q-goal',   em: '🏗️', kind: 'goal',   n: 1, pay: 8,  t: 'Feed the Build Yard',       sub: 'Any goal, any amount.', needs: 'c3' },
  { id: 'q-scam',   em: '🛡️', kind: 'scam',   n: 1, pay: 9,  t: 'Spot a scam',               sub: 'In the postbox or in Scam Spotter.' },
  { id: 'q-board',  em: '🎲', kind: 'board',  n: 1, pay: 12, t: 'Finish a game of Main Street', sub: 'About ten minutes.', needs: 'c1' },
  { id: 'q-invest', em: '📈', kind: 'invest', n: 1, pay: 10, t: 'Add to your holdings',      sub: 'From the Grow jar, as always.', needs: 'c7' },
  { id: 'q-town',   em: '🔧', kind: 'town',   n: 40, pay: 8,  t: 'Put 40 towards the town', sub: 'Whatever is broken where you are.' },
  { id: 'q-shop',   em: '🏪', kind: 'trade',  n: 1, pay: 10, t: 'Trade a day at Bizz & Co',  sub: 'Open the doors and count it honestly.', needs: 'c8' },
];

/* ── the postbox ─────────────────────────────────────────────────────────
   One letter a day. Roughly one in six is a scam, and it looks exactly like
   the rest — that IS the lesson (docs/02 §3). Amounts are in units; the sim
   converts to the child's currency. */
export const LETTERS = [
  { id: 'l1', from: 'pip', title: 'Crates need carrying',
    body: 'The grain seller has forty crates and no time. It is an hour of work. Want it?',
    choices: [
      { label: 'Take the job', wallet: 6, xp: 8, note: 'An hour of your time, traded.' },
      { label: 'Not today', xp: 3, note: 'Turning down work is a real choice, and sometimes the right one.' }] },

  { id: 'l2', from: 'mags', title: 'Shiny! Today only!',
    body: 'A genuine brass button, previously owned by somebody important, probably. Half a week of your wages. The LAST one.',
    choices: [
      { label: 'Buy the button', wallet: -10, xp: 4, note: 'You bought it. That is allowed — but "last one, today only" is a pressure tool, and now you have met one.' },
      { label: 'Walk away', xp: 10, badge: 'cool-head', note: 'Urgency is a sales technique. You noticed, which is most of the defence.' }] },

  { id: 'l3', from: 'scam', title: 'YOU HAVE WON 5,000!', scam: true,
    body: 'Congratulations!! You are our lucky winner!! To release your prize just send a small handling fee of 200 to the address below. Reply within 2 hours.',
    choices: [
      { label: 'Pay the fee', wallet: -20, xp: 6, note: 'The prize never arrives. Nobody who is giving you money needs money from you first. That cost 20 — cheap, here.' },
      { label: 'Bin it and tell a grown-up', xp: 14, badge: 'scam-spotter', safe: true, note: 'Right on both counts: a prize you did not enter is not a prize, and telling someone is part of the answer.' }] },

  /* ── household shocks (docs/09 §3) — the letters with consequences ────
     Two primitives: a bill that recurs, a fuse that lands later. Every fuse
     is deterministic — a random flood behind a paid choice would be a slot
     machine; a certain one is a consequence on a delay. */
  { id: 'hh-tap', from: 'nana', title: 'The tap is dripping',
    body: 'Your tap has started to drip. Mistri-ji can fix it today for 8. Or you can put the bucket under it and hope.',
    choices: [
      { label: 'Fix it now', wallet: -8, xp: 12, defuse: 'hh-flood',
        note: 'Fixed. Small costs now are how big costs get cancelled — that is most of what insurance is, too.' },
      { label: 'The bucket will do', xp: 4, fuse: { id: 'hh-flood', days: 4 },
        note: 'Noted. Drips do not fix themselves, and this one is now on a timer.' }] },
  { id: 'hh-flood', from: 'nana', fuseOnly: true, title: 'The drip found the flour sack',
    body: 'The tap you left dripping soaked the shelf below it overnight. The flour, the lentils, and the shelf itself: 30 to put right.',
    choices: [
      { label: 'Pay for the mess', wallet: -30, xp: 8,
        note: 'The 8 you did not spend became 30. That trade has a name — deferred maintenance — and it almost always loses.' }] },
  { id: 'hh-cough', from: 'nana', needsCompanion: true, title: 'A cough at the door',
    body: "Your companion has been off their food and coughing at night. The vet can see them today for 8. Or you can wait and see — sometimes it passes, and sometimes it does not.",
    choices: [
      { label: 'The vet, today', wallet: -8, xp: 12, pet: 'well', defuse: 'hh-vet',
        note: 'Seen, sorted, sleeping it off. Small costs now are how big costs get cancelled — for tap washers and for anyone you love.' },
      { label: 'Wait and see', xp: 4, pet: 'ill', fuse: { id: 'hh-vet', days: 3 },
        note: 'Noted. They are poorly until it is dealt with, and it is now on a timer.' }] },
  { id: 'hh-vet', from: 'nana', fuseOnly: true, title: 'It did not pass',
    body: 'The cough got worse and the vet came out at night, which costs more than a morning visit. 20, and a very sorry-looking companion who is going to be fine.',
    choices: [
      { label: 'Pay the night call', wallet: -20, xp: 8, pet: 'well',
        note: 'The 8 became 20. That trade has a name — deferred maintenance — and it loses with pets exactly as it loses with taps.' }] },
  { id: 'hh-rent', from: 'mags', title: "The landlord's note",
    body: 'Rents on Market Row are going up. Yours rises by 2 a week — unless you write back promising to stay the whole year, which softens it to 1.',
    choices: [
      { label: 'Promise the year, pay +1', bill: { id: 'hh-rent', name: 'Rent rise', units: 1, weeks: null }, xp: 12,
        note: 'A commitment traded for a discount. Landlords pay for certainty; you just sold them some.' },
      { label: 'Stay flexible, pay +2', bill: { id: 'hh-rent', name: 'Rent rise', units: 2, weeks: null }, xp: 10,
        note: 'Costlier, but you kept your freedom to move. Flexibility is worth money too — you just bought some.' }] },
  { id: 'hh-festival', from: 'pip', title: 'Festival week!',
    body: 'Lights are going up across the square. Feasting properly costs about 3 extra a week for the two festival weeks. Cooking simple at home is a one-off 6 for sweets and oil.',
    choices: [
      { label: 'Celebrate properly', bill: { id: 'hh-festival', name: 'Festival food', units: 3, weeks: 2 }, xp: 10,
        note: 'A season is allowed to cost more — the skill is knowing it will, before it does.' },
      { label: 'Keep it simple', wallet: -6, xp: 10,
        note: 'One planned cost instead of a bigger recurring one. Both fine; yours was cheaper and you knew it going in.' }] },
  { id: 'hh-club', from: 'mags', title: 'First week FREE!',
    body: "Mags's Tune Club: songs delivered to your door! First week free, then just 2 a week. Cancel any time, she says, waving vaguely.",
    choices: [
      { label: 'Join the club', bill: { id: 'hh-club', name: 'Tune Club', units: 2, weeks: 4 }, xp: 6,
        note: 'Joined. It sits in your bills now — look at Money → Home and you will see it taking its 2 every pay day. "Free first week" is how subscriptions get in the door.' },
      { label: 'No thanks', xp: 12,
        note: 'The trick in "cancel any time" is that cancelling takes remembering. You skipped the whole trap.' }] },
  { id: 'hh-umbrella', from: 'nana', title: 'The umbrella fund',
    body: 'Monsoon reaches Market Row in about three weeks — it always does. The street umbrella fund is 1 a week for four weeks, and it covers your stall when the rain comes. Roofs that are not covered cost about 24 to dry out.',
    choices: [
      { label: 'Join the fund', bill: { id: 'hh-umbrella', name: 'Umbrella fund', units: 1, weeks: 4 }, defuse: 'hh-monsoon', xp: 14,
        note: 'You paid 4 to cap a 24. That is insurance, whole and entire: many people each pay a little so no one pays a lot.' },
      { label: 'Chance it', fuse: { id: 'hh-monsoon', days: 21 }, xp: 6,
        note: 'The monsoon is not a maybe. Three weeks.' }] },
  { id: 'hh-monsoon', from: 'nana', fuseOnly: true, title: 'The monsoon came',
    body: 'It always does. Your stall took the rain uncovered, and drying out the boards and the baskets comes to 24.',
    choices: [
      { label: 'Pay to dry out', wallet: -24, xp: 8,
        note: 'The fund would have been 4. Insurance looks like a waste right up until the sky opens.' }] },

  { id: 'hh-adopt', from: 'nana', title: 'Five who need homes',
    body: 'The shelter behind the Jar Shed has five who need somewhere to live. Taking one home is 12, once. Feeding one is 2 a week — and 2 a week is 104 a year, so say it to yourself before you say yes. Want to meet them?',
    choices: [
      { label: 'Meet them', open: 'shelter', xp: 6, note: 'Go and look. Nobody has to come home today.' },
      { label: 'Not yet', xp: 4, note: 'A recurring cost is a promise. Not making one you cannot keep is the grown-up answer too.' }] },
  { id: 'l4', from: 'nana', title: 'A question, not a task',
    body: 'Ask someone at home tonight: what is the first thing they ever saved up for, and how long did it take? Then come back and tell me.',
    choices: [
      { label: 'I asked them', xp: 16, badge: 'asked-home', note: 'Good. Every family does money differently, and yours is the one you live in.' },
      { label: 'Later', xp: 2, note: 'It will keep.' }] },

  { id: 'l5', from: 'pip', title: 'The pizza problem',
    body: 'Chhoti wants to split a big pizza — that is 15 each. The bus home is 4 each way. You have 22.',
    choices: [
      { label: 'Split it, walk home', wallet: -15, xp: 12, note: 'You made the trade knowingly. That is the whole skill.' },
      { label: 'Skip the pizza', xp: 10, note: 'Also right. There is no wrong answer here — only an unplanned one.' },
      { label: 'Split it and worry later', wallet: -15, xp: 5, note: 'You got home, but the walk was not a decision — it was a surprise. Surprises are what a budget removes.' }] },

  { id: 'l6', from: 'scam', title: 'is this you?? 😭', scam: true,
    body: 'hey its me i lost my phone im on my cousins account. im stuck and i need 300 rly quick, ill pay you back tomorrow promise. dont tell anyone its embarrassing',
    choices: [
      { label: 'Send it — they sound desperate', wallet: -30, xp: 6, note: 'This is the most common scam that reaches children. "Do not tell anyone" is the tell. A real friend can wait sixty seconds while you check.' },
      { label: 'Check with them another way first', xp: 15, badge: 'scam-spotter', safe: true, note: 'Exactly. Call the number you already have. Secrecy plus urgency plus money is always the same shape.' }] },

  { id: 'l7', from: 'pip', title: 'Bulk deal at the grain stall',
    body: 'Six weeks of chalk for the price of four — but you have to buy all six now. You have the money, just.',
    choices: [
      { label: 'Buy the six', wallet: -12, xp: 12, note: 'Cheaper per week. It also empties your pocket today, which is the part the deal does not mention.' },
      { label: 'Buy one week', wallet: -3, xp: 8, note: 'Dearer per week, but you kept your options. Both answers are defensible.' }] },

  { id: 'l8', from: 'bea', title: 'Everything is red today',
    body: 'The board is down. Every single line. Bo says buy, I say run. What are you going to do?',
    choices: [
      { label: 'Sell everything', xp: 6, note: 'You turned a paper fall into a real one. Everyone does this once — the point is to have done it here, with play money.' },
      { label: 'Do nothing', xp: 15, badge: 'steady-hand', note: 'Sitting still is a decision, and on a red day it is usually the hard one.' }] },

  { id: 'l9', from: 'scam', title: 'FREE 10,000 COINS — 1 STEP', scam: true,
    body: 'GENERATOR WORKING 2026!! Just enter your account name and password on the site below and get UNLIMITED coins instantly. 100% safe no ban.',
    choices: [
      { label: 'Try it', wallet: -25, xp: 6, note: 'There is no generator. What there is, is a page collecting passwords — and the account it takes is yours.' },
      { label: 'Close it', xp: 14, badge: 'scam-spotter', safe: true, note: 'Free things that need your password are not free and are not things.' }] },

  { id: 'l10', from: 'nana', title: 'The shop needs a decision',
    body: 'Rain is forecast on market day. Umbrellas cost me 8 each and sell for 20 — but only if it rains. If it stays dry I am stuck with them.',
    choices: [
      { label: 'Buy ten umbrellas', xp: 12, note: 'A bet on the weather with real cost attached. Businesses make it every week.' },
      { label: 'Buy three', xp: 14, note: 'Smaller bet, smaller loss, smaller win. You just discovered position sizing without anyone using the words.' }] },

  { id: 'l11', from: 'mags', title: 'I could take that off your hands',
    body: 'That old thing you never use? I will give you 5 for it. Right now. Cash.',
    choices: [
      { label: 'Sell it', wallet: 5, xp: 10, note: 'Selling what you do not use is income. Most people never think of it as income.' },
      { label: 'Keep it', xp: 5, note: 'Fine — but notice you just valued it above 5.' }] },

  { id: 'l12', from: 'pip', title: 'Pay day is Friday',
    body: 'Reminder: wages land Friday, and the phone plan goes out the same morning. Do you know what will be left?',
    choices: [
      { label: 'Yes — I checked', xp: 12, note: 'Knowing the number before it happens is the entire difference between a budget and a hope.' },
      { label: 'No idea', xp: 4, note: 'Open the Jar Shed before Friday, then.' }] },

  { id: 'l13', from: 'mags', title: 'Only 30 a month!',
    body: 'The Bizzington Button Club. New button every month, cancel any time*, just 30 a month. (*by letter, in person, on a Tuesday.)',
    choices: [
      { label: 'Join — it is only 30', wallet: -30, xp: 8, note: '30 a month is 360 a year. Small monthly numbers are the whole technique; multiply by twelve before you agree.' },
      { label: 'Work out the year first', xp: 15, badge: 'times-twelve', note: '360 a year, and cancelling needs a Tuesday. You read the small print, which almost nobody does.' }] },

  { id: 'l14', from: 'pip', title: 'Chhoti wants to borrow',
    body: 'She is 40 short for the trip and says she will pay you back on Friday. She has paid you back before. You have it, but it is your Save jar.',
    choices: [
      { label: 'Lend it', wallet: -40, xp: 13, note: 'Lending to friends is fine and it is a real risk. Ask yourself first: if it never comes back, is the friendship still fine?' },
      { label: 'Explain why not', xp: 13, note: 'Saying no honestly is a skill, and it protects the friendship better than a grudge does.' },
      { label: 'Lend half', wallet: -20, xp: 15, note: 'Smaller stake, same kindness. Most good money answers are a size, not a yes or a no.' }] },

  { id: 'l15', from: 'scam', title: 'EARN 2,000/WEEK FROM HOME', scam: true,
    body: 'Simple work, no experience, start today! Small one-time registration fee of 150 to receive your starter kit. Limited places for your area.',
    choices: [
      { label: 'Register', wallet: -15, xp: 6, note: 'A job that charges you to start is not a job. Real work pays you; it does not invoice you.' },
      { label: 'Delete it', xp: 14, badge: 'scam-spotter', safe: true, note: 'Money should flow towards the worker. Any offer reversing that arrow is the scam.' }] },

  { id: 'l16', from: 'nana', title: 'The roof, and the rainy-day tin',
    body: 'My roof went last winter. It did not care that I had plans. I keep a tin with one month of costs in it and I have refilled it nine times in sixty years.',
    choices: [
      { label: 'Start a rainy-day tin', xp: 16, badge: 'rainy-day', note: 'An emergency fund is the least exciting and most protective thing in this whole app. Boring is the point.' },
      { label: 'Nothing will go wrong', xp: 4, note: 'It might not. The tin costs nothing while you are right, and everything while you are not.' }] },

  { id: 'l17', from: 'bo', title: 'A tip, just for you',
    body: 'My cousin knows a man whose brother says Rocket Rickshaws are about to TRIPLE. Everyone is in. You should put the lot in. Can\'t lose!',
    choices: [
      { label: 'Put it all in', xp: 6, note: '"Everyone is in" and "can\'t lose" are the two most expensive sentences in money. Bo means well. Bo is also always certain.' },
      { label: 'Put in a little, spread the rest', xp: 15, badge: 'diversified', note: 'You can take a small swing without betting the week on somebody\'s cousin\'s brother.' },
      { label: 'Ignore it', xp: 13, note: 'A tip that reaches you has reached everybody. That is what makes it not a tip.' }] },

  { id: 'l18', from: 'pip', title: 'The price went up',
    body: 'The chalk that was 10 last year is 12 now. Same chalk, same stall, same seller.',
    choices: [
      { label: 'That is inflation', xp: 14, badge: 'noticed-inflation', note: 'Prices drifting up over time is normal. It is also why money left in a tin quietly buys less each year.' },
      { label: 'He is cheating me', xp: 6, note: 'Sometimes! But usually his costs rose too. Prices carry information about the whole chain behind them.' }] },

  { id: 'l19', from: 'mags', title: 'It broke. Obviously.',
    body: 'Your umbrella has turned inside out and died. A new one is 25. Also, I *did* offer you the cover for 3 a month.',
    choices: [
      { label: 'Buy a new one', wallet: -25, xp: 10, note: 'Sometimes paying for the loss is cheaper than paying for cover. That is a calculation, not a mistake.' },
      { label: 'Ask what cover would have cost', xp: 14, note: '3 a month is 36 a year to protect a 25 umbrella. Insurance is worth it for things you could not replace — not for things you could.' }] },

  { id: 'l20', from: 'nana', title: 'Where the Give jar went',
    body: 'The school down the road lost its roof too. I put a little in every month for years without noticing, and this month it mattered.',
    choices: [
      { label: 'Give from the Give jar', xp: 15, badge: 'gave', note: 'Generosity works the same way saving does: small, regular, and invisible until the week it is not.' },
      { label: 'Keep it for now', xp: 6, note: 'A fair answer. The jar is yours and it will still be there.' }] },

  { id: 'l21', from: 'scam', title: 'Your account will be CLOSED', scam: true,
    body: 'URGENT: unusual activity detected. Your account is suspended. Confirm your PIN and the code we just sent to restore access within 30 minutes or funds will be frozen.',
    choices: [
      { label: 'Confirm the details', wallet: -35, xp: 6, note: 'A real bank never asks for your PIN or a one-time code. The code exists to prove it is you — giving it away hands over the proof.' },
      { label: 'Ring the bank on the number you already have', xp: 16, badge: 'scam-spotter', safe: true, note: 'Perfect. Fright plus a countdown plus a secret is the shape. Always go back through a number you found yourself.' }] },

  { id: 'l22', from: 'pip', title: 'You got paid for the flyers',
    body: 'Mrs Rao says you did it properly and she has two more streets next week if you want them.',
    choices: [
      { label: 'Take next week too', wallet: 8, xp: 14, badge: 'asked-back', note: 'Being asked back is worth more than the fee. Reputation is the fastest-compounding thing you own.' },
      { label: 'Just take the pay', wallet: 8, xp: 8, note: 'Fair enough. The money is the same; the second street was the interesting part.' }] },
];

/* ── jobs on Market Row — the way money arrives between pay days ───────── */
/* Work belongs to a place. Each world lists the jobs going there, so
   travelling somewhere new changes what you can earn as well as what you
   can learn. */
export const JOBS = [
  { id: 'crates',  em: '📦', name: 'Stack crates',      units: 6,  who: 'the grain seller' },
  { id: 'flyers',  em: '📄', name: 'Deliver flyers',    units: 5,  who: 'Mrs Rao' },
  { id: 'sweep',   em: '🧹', name: 'Sweep Market Row',  units: 3,  who: 'the market office' },
  { id: 'nets',    em: '🕸️', name: 'Mend the nets',     units: 7,  who: 'the harbour master' },
  { id: 'cargo',   em: '⚓', name: 'Unload the cargo',  units: 9,  who: 'a skipper in a hurry' },
  { id: 'mend',    em: '🧵', name: 'Mend umbrellas',    units: 8,  who: 'Mags' },
  { id: 'errands', em: '🏃', name: 'Run the errands',   units: 8,  who: 'the clerk at the bank' },
  { id: 'books',   em: '📒', name: "Do Nana's books",   units: 12, who: 'Nana Bizz' },
  { id: 'runner',  em: '📨', name: 'Run the orders',    units: 11, who: 'the floor manager' },
  { id: 'board',   em: '🖍️', name: 'Chalk up the board', units: 13, who: 'Bo and Bea, arguing' },
  /* These belong to nobody's world — they exist because you bought or mended
     the thing that creates them. */
  { id: 'haul',      em: '🛒', name: 'Haul for the Row',  units: 7,  who: 'anyone with too much to carry', perk: true },
  { id: 'lamplight', em: '🏮', name: 'Work after dark',   units: 9,  who: 'the late boats', perk: true },
  { id: 'counter',   em: '🏪', name: "Mind Nana's counter", units: 10, who: 'Nana Bizz', perk: true },
];

/* ── the housing ladder — where you live IS your level ───────────────────
   The fictional house is what makes CONCEPT §6.4 keepable: a child manages
   *a* household and is never once asked about *their* household. */
export const HOMES = [
  { id: 'room',   em: '🚪', name: 'A room above the stall', rent: 4,
    bills: [], food: 10, deposit: 0,
    blurb: 'Dry, small, and yours. Nothing to manage yet.' },
  { id: 'window', em: '🪟', name: 'A room with a window', rent: 7,
    bills: [{ name: 'Phone', units: 2 }], food: 10, deposit: 14,
    blurb: 'Your first real bill — and it arrives whether or not you worked.' },
  { id: 'flat',   em: '🏢', name: 'A small flat', rent: 12,
    bills: [{ name: 'Phone', units: 2 }, { name: 'Power', units: 3 }, { name: 'Water', units: 1 }],
    food: 10, deposit: 24,
    blurb: 'Enough bills that a plan beats remembering.' },
  /* Higher rent, four more bills — and CHEAPER overall, because the kitchen
     halves the food line. Spending money to lower a cost is a new idea and it
     only lands if the arithmetic actually rewards it. */
  { id: 'kitchen', em: '🍳', name: 'A flat with a kitchen', rent: 15,
    bills: [{ name: 'Phone', units: 2 }, { name: 'Power', units: 4 }, { name: 'Water', units: 2 }],
    food: 4, deposit: 36, perk: 'kitchen',
    blurb: 'Dearer rent, more bills — and it costs you less, because you can cook.' },
  /* No rent at all. The mortgage is bigger than any single bill and it ends,
     which is the whole difference between renting and owning. */
  { id: 'house',  em: '🏡', name: 'A little house, bought', rent: 0,
    bills: [{ name: 'Phone', units: 2 }, { name: 'Power', units: 5 }, { name: 'Water', units: 2 }, { name: 'Internet', units: 3 }, { name: 'Upkeep', units: 3 }],
    food: 4, deposit: 120, perk: 'kitchen', owned: true, mortgage: { units: 320, weeks: 40 },
    blurb: 'Rent is forever. A mortgage ends. The first thing you own instead of rent.' },
];

/* ── restorations — the town is run down, and you put it right ───────────
   The engine the app was missing. Every one of these costs real money out of
   the same wallet the Store spends from, permanently changes the world, and
   pays you back in capability rather than in a number. That is also the
   sharpest money lesson in the product: spending on something that produces
   is not the same as spending on something that doesn't — and a child learns
   it by watching one choice pay them every day afterwards and the other not. */
export const FIXES = [
  // Market Row
  { id: 'fountain', world: 'market', em: '⛲', name: 'The dry fountain', units: 120,
    broken: 'Bone dry since before you got here. Nobody meets by it any more.',
    fixed: 'Running again, and the Row has somewhere to gather.',
    perk: 'quest', gives: 'The town can carry a fourth quest each day.' },
  { id: 'boxes', world: 'market', em: '🌼', name: 'The flower boxes', units: 60,
    broken: 'Empty, cracked, full of last year’s soil.',
    fixed: 'Planted up. It is only flowers. It changes the whole street.',
    perk: 'streak', gives: 'Your streak pays a little more every day.' },
  { id: 'awnings', world: 'market', em: '⛱️', name: 'The stall awnings', units: 80,
    broken: 'Torn down in a storm and never replaced. Rain stops trade.',
    fixed: 'Striped canvas the length of the Row.',
    perk: 'rain', gives: 'Work pays more on wet days.' },
  { id: 'shutters', world: 'market', em: '🏪', name: "Nana's shutters", units: 200, needs: 'c2',
    broken: 'Closed since she retired. Everyone still calls it Nana’s.',
    fixed: 'Open, swept, and somebody is behind the counter.',
    perk: 'job', adds: 'counter', gives: 'A new job on the Row, every day, for good.' },
  // The Old Harbour
  { id: 'crane', world: 'harbour', em: '🏗️', name: 'The seized crane', units: 180,
    broken: 'Rusted solid. Cargo comes off by hand, slowly.',
    fixed: 'Turning again, and a boat empties in an hour.',
    perk: 'cargo', gives: 'Cargo work pays half as much again.' },
  { id: 'tideboard', world: 'harbour', em: '🌊', name: 'The tide board', units: 120,
    broken: 'Blank. Nobody knows when the boats land, so nobody is ready.',
    fixed: 'Chalked up daily. You can see what is coming.',
    perk: 'tide', gives: 'You can see when the boats land — and being ready pays double.' },
  { id: 'loft', world: 'harbour', em: '🕸️', name: 'The net loft', units: 90,
    broken: 'Roof gone. The nets rot faster than anyone can mend them.',
    fixed: 'Dry, and full of work.',
    perk: 'netpay', gives: 'Net work pays half as much again.' },
  { id: 'pierlamp', world: 'harbour', em: '🏮', name: 'The lamp on the pier', units: 60,
    broken: 'Dark by four in winter. Nothing happens after that.',
    fixed: 'Lit. The quay keeps working after dark.',
    perk: 'night', adds: 'lamplight', gives: 'A job that only exists after dark.' },
  // Clocktower Square
  { id: 'clock', world: 'clock', em: '🕰️', name: 'The stopped clock', units: 250,
    broken: 'Stopped at ten past four. Nobody knows when anything falls due — and late costs more.',
    fixed: 'Striking the hour again, and the whole square can see the date.',
    perk: 'bills', gives: 'You can see every bill before it lands.' },
  { id: 'steps', world: 'clock', em: '🏛️', name: 'The bank steps', units: 100,
    broken: 'Cracked and roped off. You go in by the side door, apologetically.',
    fixed: 'Swept stone and a front door you can walk through.',
    perk: 'rate', gives: 'Borrowing costs you less.' },
  { id: 'notices', world: 'clock', em: '📋', name: 'The notice board', units: 80,
    broken: 'Bare. Anyone wanting help has no way to ask.',
    fixed: 'Papered with jobs and requests.',
    perk: 'requests', gives: 'Townspeople can ask you for things.' },
  // The Exchange Quarter
  { id: 'ticker', world: 'exchange', em: '📟', name: 'The ticker', units: 300,
    broken: 'Silent. Prices reach the floor an hour late, which is worse than not at all.',
    fixed: 'Chattering away. Everyone sees the same number at the same time.',
    perk: 'prices', gives: 'Live prices instead of yesterday’s.' },
  { id: 'reading', world: 'exchange', em: '📚', name: 'The reading room', units: 200,
    broken: 'Locked. People buy things they have never read a word about.',
    fixed: 'Open, quiet, and full of what companies actually do.',
    perk: 'research', gives: 'A research card for everything on the board.' },
  { id: 'bench', world: 'exchange', em: '🪑', name: "Bella's bench", units: 150,
    broken: 'Broken. She has nowhere to sit, so she goes straight home.',
    fixed: 'Mended. She stays, and she will talk to you.',
    perk: 'bella', gives: 'Boring Bella will actually teach you.' },
  // The Works
  { id: 'kiln', world: 'works', em: '🔥', name: 'The cold kiln', units: 400,
    broken: 'Out. Everything has to be bought in, at somebody else’s price.',
    fixed: 'Lit. You can make instead of buy.',
    perk: 'make', gives: 'Stock costs you less to make than to buy.' },
  { id: 'sign', world: 'works', em: '🪧', name: 'The shop sign', units: 150,
    broken: 'Fallen. People walk past because they do not know you are there.',
    fixed: 'Up, painted, and visible from the corner.',
    perk: 'trade', gives: 'More customers every trading day.' },
  { id: 'cart', world: 'works', em: '🛒', name: 'The delivery cart', units: 250,
    broken: 'A wheel off. Everything is carried.',
    fixed: 'Rolling. You can sell further than you can walk.',
    perk: 'trade', gives: 'More customers again.' },
];
export function fixesIn(world) { return FIXES.filter((f) => f.world === world); }

/* ── the store — capability, not hats ────────────────────────────────────
   Every item does something, because a reward that does nothing terminates
   the loop in an abstraction and an eight-year-old correctly concludes that
   nothing they did mattered. Two lovely useless things stay on purpose,
   priced beside the useful ones with the opportunity cost under both — the
   choice between useful and lovely is real and the app shouldn't pretend
   otherwise. */
export const SHOP = [
  { id: 'handcart', em: '🛒', name: 'A handcart',      units: 26, perk: 'jobs', adds: 'haul',
    desc: 'Carry more, in one trip.', gives: 'One extra job every day.' },
  { id: 'lockbox',  em: '🔒', name: 'A lockbox',       units: 34, perk: 'lockbox',
    desc: 'Heavy, dull, and it has a key.', gives: 'Your Save jar earns a little every pay day, bank or no bank.' },
  { id: 'coat',     em: '🧥', name: 'A good coat',     units: 22, perk: 'coat',
    desc: 'Nobody works well when they are cold.', gives: 'Work pays more when the weather is against you.' },
  { id: 'ledger',   em: '📒', name: 'A ledger',        units: 30, perk: 'ledger',
    desc: 'Ruled columns and a pencil on a string.', gives: 'See next week’s bills before pay day lands.' },
  { id: 'bicycle',  em: '🚲', name: 'A bicycle',       units: 52, perk: 'bicycle',
    desc: 'Gets you further than your legs do.', gives: 'Work the next world along, a world early.' },
  { id: 'cat',      em: '🐈', name: 'A shop cat',      units: 44, perk: 'cat',
    desc: 'Arrived on her own. Stayed.', gives: 'Turns up a little money some mornings.' },
  { id: 'kite',     em: '🪁', name: 'A very good kite', units: 20,
    desc: 'No financial merit whatsoever.', gives: null },
  { id: 'brass',    em: '🔆', name: "Mags's brass button", units: 60,
    desc: 'Previously owned by somebody important, probably.', gives: null },
];

/* ── the market — fictional companies, honest volatility ─────────────────
   Real historical BEHAVIOUR (drift + volatility), invented names. No real
   security is ever named as a thing to buy (CONCEPT §6.2). */
export const ASSETS = [
  { id: 'basket', name: 'Whole Market Basket', kind: 'fund',   em: '🧺', vol: 0.030, drift: 0.0075, desc: 'A slice of every shop in town. Dull by design.' },
  { id: 'grain',  name: 'Sunrise Grains',      kind: 'steady', em: '🌾', vol: 0.016, drift: 0.0040, desc: 'People eat in good years and bad. Rarely exciting.' },
  { id: 'chai',   name: 'Chai Chain Co',       kind: 'growth', em: '🫖', vol: 0.052, drift: 0.0090, desc: 'Opening shops fast. Fast can go both ways.' },
  { id: 'rocket', name: 'Rocket Rickshaws',    kind: 'wild',   em: '🛺', vol: 0.105, drift: 0.0125, desc: 'Might be the future. Might be a rickshaw.' },
];

/* Deterministic: the same market for every player, every reload. */
export function makeSeries(steps) {
  const out = {};
  ASSETS.forEach((a, ai) => {
    const r = rng(9301 + ai * 7919);
    let p = 100;
    const arr = [p];
    for (let i = 0; i < steps; i++) {
      const shock = (r() + r() + r() - 1.5) * 2 * a.vol;
      const crash = (i === Math.floor(steps * 0.55)) ? -a.vol * 3.1 : 0;
      p = Math.max(6, p * (1 + a.drift + shock + crash));
      arr.push(p);
    }
    out[a.id] = arr;
  });
  return out;
}

/* ── the shop you run (Founder) ──────────────────────────────────────── */
export const STOCK = [
  { id: 'chai',      em: '🫖', name: 'Chai',        cost: 2,  sells: 5,  best: 'cold',  desc: 'Sells all year. Sells twice as well when it is cold.' },
  { id: 'umbrella',  em: '☂️', name: 'Umbrellas',   cost: 8,  sells: 20, best: 'rain',  desc: 'Enormous margin, and only if it rains.' },
  { id: 'ice',       em: '🍧', name: 'Ice golas',   cost: 3,  sells: 9,  best: 'hot',   desc: 'Melts. Literally a deadline.' },
  { id: 'rope',      em: '🪢', name: 'Rope & twine', cost: 4, sells: 8,  best: 'any',   desc: 'Nobody is excited. Somebody always needs it.' },
];
export const WEATHER = [
  { id: 'rain', em: '🌧️', name: 'Rain all day',  mult: { umbrella: 2.6, chai: 1.4, ice: 0.2, rope: 1 } },
  { id: 'hot',  em: '☀️', name: 'Blazing hot',   mult: { umbrella: 0.15, chai: 0.7, ice: 2.8, rope: 1 } },
  { id: 'cold', em: '🌬️', name: 'Cold wind',     mult: { umbrella: 0.6, chai: 2.2, ice: 0.3, rope: 1.1 } },
  { id: 'fair', em: '⛅', name: 'Fair and mild', mult: { umbrella: 0.5, chai: 1, ice: 1.2, rope: 1.1 } },
];

/* ── money words ─────────────────────────────────────────────────────── */
export const GLOSSARY = [
  ['Budget', 'A plan for money before you spend it.', 'Two columns — in and out — and whatever is left is the part you choose about.'],
  ['Income', 'Money coming in.', 'Wages, a gift, interest, or something you sold. A budget is built on the parts that repeat.'],
  ['Expense', 'Money going out.', 'Fixed ones arrive whether you like it or not; variable ones follow what you do.'],
  ['Opportunity cost', 'The thing you could have had instead.', 'The half of the price that is never on the label.'],
  ['Interest', 'Rent on money.', 'You are paid it for lending; you pay it for borrowing. Same idea, opposite sides.'],
  ['Compounding', 'Growth landing on earlier growth.', 'Boring for a year, then not boring at all. Time does the work.'],
  ['Principal', 'The amount you started with.', 'The sum you borrowed or invested, before any interest.'],
  ['Inflation', 'Prices drifting up over time.', 'Which is why money in a tin quietly buys less each year.'],
  ['Saving', 'Keeping money for something soon.', 'Safe, boring, and reachable when you need it.'],
  ['Investing', 'Putting money somewhere it might grow.', 'Might. Things that can rise a lot can fall a lot — same sentence.'],
  ['Risk', 'How wrong this could go.', 'Not a reason to avoid something. A reason to size it properly.'],
  ['Return', 'What you got back, over what you put in.', 'Usually a percentage, usually quoted by someone who wants something.'],
  ['Diversification', 'Not owning just one thing.', 'It does not raise your best outcome. It raises your worst, and the worst is what ends games.'],
  ['Share', 'A small piece of a company.', 'Own one and you own a sliver of everything that company does.'],
  ['Fund', 'A basket holding many things at once.', 'One purchase, lots of eggs, lots of baskets.'],
  ['Index fund', 'A fund holding a whole market.', 'Deliberately unexciting. Very hard to beat over a long time.'],
  ['Dividend', 'A share of profits paid to owners.', 'Some companies pay them, some reinvest instead. Neither is automatically better.'],
  ['Fee', 'What it costs to use a service.', 'Invisible in real life, which is exactly why this app puts it on screen.'],
  ['Volatility', 'How much something jumps about.', 'High volatility is not the same as high risk of loss, but they travel together.'],
  ['Bear market', 'A long stretch of falling prices.', 'Bea is right roughly as often as Bo is.'],
  ['Bull market', 'A long stretch of rising prices.', 'Everyone feels clever. That is the dangerous part.'],
  ['Credit', 'Borrowed money.', 'A tool with a price on it, never a verdict on a person.'],
  ['Debt', 'Money you owe.', 'Ordinary, common, and worth understanding rather than being ashamed of.'],
  ['Loan term', 'How long you have to repay.', 'A longer term means smaller payments and more total cost. Both, always.'],
  ['Trust score', 'A record of whether past borrowing was repaid.', 'A memory of what happened, not a score of what kind of person you are.'],
  ['Emergency fund', 'Money kept for the thing you did not plan.', 'Costs nothing while you are lucky and everything while you are not.'],
  ['Insurance', 'Paying a little so a disaster costs less.', 'Worth it for what you could not replace. Rarely worth it for what you could.'],
  ['Premium', 'What insurance costs you.', 'Multiply the monthly one by twelve before deciding.'],
  ['Tax', 'Money collected to pay for shared things.', 'Roads, schools, hospitals. It comes out before you ever see it.'],
  ['Revenue', 'Everything a business takes in.', 'The number people brag about.'],
  ['Cost', 'What a business paid to make it happen.', 'Fixed costs arrive anyway; variable ones follow the sales.'],
  ['Profit', 'Revenue minus cost.', 'The number that decides whether you are still open next year.'],
  ['Margin', 'Profit as a share of the price.', 'A big margin on nothing sold is still nothing.'],
  ['Cash flow', 'Money actually moving, and when.', 'You can be profitable and broke at the same time. Timing is its own subject.'],
  ['Inventory', 'The stock you are holding.', 'Money you have already spent, sitting in a box, hoping.'],
  ['Subscription', 'A payment that repeats until stopped.', 'A decision made once and paid for forever. Always times twelve.'],
  ['Wage', 'Money paid for work done.', 'You are usually selling time — and, over years, reputation.'],
  ['Value', 'What a thing is worth to you.', 'Different from price, and the gap is where every decision lives.'],
  ['Scam', 'A lie designed to take your money.', 'Reward or fright, plus a hurry, plus a secret. Always the same shape.'],
  ['Phishing', 'A fake message fishing for your details.', 'Real organisations already know who you are. That is what makes them real.'],
  ['One-time code', 'A number texted to prove it is you.', 'Nobody legitimate ever needs it from you. It is the proof, not a password.'],
  ['Net worth', 'Everything you have, added up.', 'Wallet plus jars plus bank plus investments. The number this whole town is drawing.'],
  ['Currency', 'The money a place has agreed on.', '₹, $, £, €, د.إ — different agreements, same idea.'],
  ['Exchange rate', 'What one currency is worth in another.', 'It moves. That is why the same holiday costs differently in different years.'],
];

export const BADGES = {
  'first-coin':        { em: '🪙', name: 'First earnings',    desc: 'Money you traded your time for.' },
  'scam-spotter':      { em: '🛡️', name: 'Scam spotter',      desc: 'You saw the shape, not the story.' },
  'cool-head':         { em: '🧊', name: 'Cool head',         desc: 'Said no to a "today only".' },
  'asked-home':        { em: '🏡', name: 'Asked at home',     desc: 'Every family does money differently.' },
  'steady-hand':       { em: '🪨', name: 'Steady hand',       desc: 'Did nothing on a red day. Hardest move there is.' },
  'adopted':           { em: '🐾', name: 'Took someone home',  desc: 'A one-off cost, and a weekly one for keeps.' },
  'first-receipt':     { em: '🧾', name: 'The first receipt',  desc: 'Bought with shifts you worked. Kept for good.' },
  'dressed-up':        { em: '🎀', name: 'Dressed up',         desc: 'Bought a want, on purpose, with a full bowl already paid for.' },
  'well-fed':          { em: '🥣', name: 'Ten full bowls',     desc: 'Ten pay days running, the food bill was met.' },
  'all-grown':         { em: '🌟', name: 'All grown',          desc: 'Raised from tiny to grown. Steady feeding did that.' },
  'jars-set':          { em: '🫙', name: 'Split it first',    desc: 'Paid yourself before you paid anyone else.' },
  'goal-built':        { em: '🏗️', name: 'Built it',          desc: 'Finished a goal in the Build Yard.' },
  'rainy-day':         { em: '☔', name: 'Rainy-day tin',     desc: 'Money set aside for the thing you did not plan.' },
  'times-twelve':      { em: '🗓️', name: 'Times twelve',      desc: 'Worked out what a monthly thing costs in a year.' },
  'noticed-inflation': { em: '📈', name: 'Noticed the drift', desc: 'Same chalk, bigger number.' },
  'gave':              { em: '🤲', name: 'Gave some',         desc: 'The Give jar did its job.' },
  'asked-back':        { em: '🔁', name: 'Asked back',        desc: 'Worth hiring twice. Worth more than the fee.' },
  'borrowed-well':     { em: '🤝', name: 'Repaid in full',    desc: 'Took a loan, knew the cost, cleared it.' },
  'diversified':       { em: '🧺', name: 'Never just one',    desc: 'Kept a Market Cup season spread out.' },
  'shopkeeper':        { em: '🏪', name: 'Open for business', desc: 'Traded a day at Bizz & Co and counted it honestly.' },
  'profit-day':        { em: '💹', name: 'In the black',      desc: 'A trading day that made more than it cost.' },
  'chapter-c1':        { em: '📗', name: 'What money is',     desc: 'Chapter one, done.' },
  'chapter-c2':        { em: '📗', name: 'Earning it',        desc: 'Chapter two, done.' },
  'chapter-c3':        { em: '📘', name: 'Making a plan',     desc: 'Chapter three, done.' },
  'chapter-c4':        { em: '📘', name: "Sellers' tricks",   desc: 'Chapter four, done.' },
  'chapter-c5':        { em: '📙', name: 'Keeping it safe',   desc: 'Chapter five, done.' },
  'chapter-c6':        { em: '📙', name: 'Borrowing',         desc: 'Chapter six, done.' },
  'chapter-c7':        { em: '📕', name: 'Money that grows',  desc: 'Chapter seven, done.' },
  'chapter-c8':        { em: '📕', name: 'Running something', desc: 'Chapter eight, done.' },
  'moved-in':          { em: '🔑', name: 'Keys of your own',  desc: 'Moved somewhere better and could still afford Friday.' },
  'homeowner':         { em: '🏡', name: 'Bought it',         desc: 'Stopped renting. A mortgage ends; rent does not.' },
  'indep-10':          { em: '🌱', name: 'One tenth',         desc: 'A tenth of your life is paid for by your money.' },
  'indep-25':          { em: '🌿', name: 'A quarter',         desc: 'Your money covers a quarter of your week.' },
  'indep-50':          { em: '🌳', name: 'Halfway',           desc: 'Half your life, paid for without working.' },
  'indep-100':         { em: '🏛️', name: 'Independent',       desc: 'Your money pays for your life. You work because you choose to.' },
  'held-the-storm':    { em: '⛈️', name: 'Held through it',   desc: 'Sat still while everything was red.' },
  'exact-change':      { em: '🪙', name: 'Exact change',      desc: 'Counted it right, at speed.' },
  'climbed':           { em: '🗼', name: 'Over the line',      desc: 'Fifteen years of compounding, and still standing.' },
  'main-street':       { em: '🎲', name: 'Main Street',        desc: 'Your shops paid for your life. Nobody went bankrupt.' },
  'three-of-three':    { em: '⭐', name: 'All three',           desc: 'Cleared a whole day of quests.' },
  'traveller':         { em: '🗺️', name: 'On the road',         desc: 'Left Market Row for somewhere new.' },
  'put-right':         { em: '🔧', name: 'Put something right',  desc: 'Paid to fix a broken thing, and it stayed fixed.' },
  'rebuilder':         { em: '🏘️', name: 'Rebuilder',            desc: 'Four things in this town work again because of you.' },
};
