/* items.js — "Your turn": lesson items that are not multiple choice (E4).

   Three shapes, each something a child DOES with the idea rather than picks from four:
     sort    put each thing in one of two bins (tap a thing, tap a bin — or keys 1 and 2)
     order   put the steps in the order they happen (tap them in order)
     amount  work out a number and type it (the keypad or the keyboard)

   Every item has exactly one right result, and test/items.mjs proves it: a sort lists
   every thing once with a bin that exists, an order is a permutation of its steps, and
   an amount's answer is computed here from the numbers in its own question (`calc`), so
   the stated sum and the expected answer cannot disagree. Every number is Bizzington's
   own; nothing is a real price, rate or company.

   A wrong first try holds with a hint about the idea — never the answer — and the
   second go settles it, exactly like the questions underneath (drill.js).

   Every stop on the Atlas has one (all 56), and every amount carries `how` (E6): a worked
   method with different numbers, which the child may open before the first try. It shows
   the way to the answer, never this item's answer — test/items.mjs checks both. */
export const ITEMS = {
  c1b: { kind: 'sort', title: 'Need or want, today?', bins: ['Need', 'Want'],
    things: [['Rice for the week', 0], ['A comic', 1], ['Bus fare to school', 0], ['A second hoodie', 1], ['Medicine you were prescribed', 0], ['Stickers', 1]],
    hint: 'Ask of each one: would I be in trouble this week without it?' },
  c1c: { kind: 'order', title: 'How Pip got paid', steps: ['The grain seller has crates and no time', 'Pip offers an hour of carrying', 'Pip carries the crates', 'The seller pays Pip for the hour'],
    hint: 'A trade starts with someone who needs something, and pay comes after the work.' },
  c2a: { kind: 'amount', title: 'An hour, four times', q: 'Pip carries crates for 4 hours at 6 an hour. How much is that?', calc: () => 4 * 6,
    hint: 'Pay for one hour, then the same again for each hour after it.',
    how: ['Say a job pays 5 an hour for 3 hours.', 'One hour is 5. Three hours is 5 three times: 5 + 5 + 5.', 'That is 3 × 5 = 15. Now try it with Pip’s numbers.'] },
  c2c: { kind: 'sort', title: 'Comes again, or comes once?', bins: ['Comes again', 'Comes once'],
    things: [['Weekly wage from the stall', 0], ['A birthday gift', 1], ['Pay for a Saturday job', 0], ['Money found in a coat', 1], ['Pocket money every Friday', 0]],
    hint: 'Could you plan next month around it? That is the question.' },
  c3a: { kind: 'amount', title: 'What is left?', q: 'In: 200 on pay day. Out: 60 for a phone and 40 for the bus. What is left?', calc: () => 200 - 60 - 40,
    hint: 'Add up everything going out first, then take that from what came in.',
    how: ['Say 50 comes in, and 10 and 15 go out.', 'Everything out: 10 + 15 = 25.', 'What is left: 50 − 25 = 25. Now do the same with pay day.'] },
  c3c: { kind: 'sort', title: 'The price, and the other price', bins: ['What you pay', 'What you give up'],
    things: [['The money at the till', 0], ['The kite you could have had instead', 1], ['The coins in your hand', 0], ['A week closer to your goal', 1]],
    hint: 'Every yes is also a no. One bin is the money; the other is the thing you did not get.' },
  c4a: { kind: 'sort', title: 'A fact, or a hurry?', bins: ['A fact about it', 'A hurry'],
    things: [['It is waterproof', 0], ['Today only!', 1], ['It weighs 200 grams', 0], ['Last one left!', 1], ['Ends in 10 minutes!', 1]],
    hint: 'A fact would still be true tomorrow. A hurry is there to stop you thinking.' },
  c4c: { kind: 'amount', title: 'The small monthly one', q: 'A game costs 30 a month. How much is that in a year of 12 months?', calc: () => 30 * 12,
    hint: 'A year is twelve months. The small number happens twelve times.',
    how: ['Say a club costs 5 a month.', 'A year is 12 months, so the 5 happens twelve times.', '12 × 5 = 60 in a year. Now try the game.'] },
  c5a: { kind: 'order', title: 'Where your money goes in a bank', steps: ['You put money in the bank', 'The bank lends it to someone else', 'They pay the bank for borrowing it', 'The bank pays you a little for leaving it there'],
    hint: 'The bank can only pay you because someone else is paying it.' },
  c5b: { kind: 'sort', title: 'Keep it, or fine to share?', bins: ['Never share', 'Fine to share'],
    things: [['Your PIN', 0], ['Your first name', 1], ['A one-time code', 0], ['Your password', 0], ['Your favourite colour', 1]],
    hint: 'Nobody real ever needs the secrets that open your money.' },
  c6a: { kind: 'sort', title: 'Who pays the rent on money?', bins: ['The bank pays you', 'You pay the bank'],
    things: [['You save 100 in the bank', 0], ['You borrow 100 for a bike', 1], ['Your savings sit there a year', 0], ['You pay back a loan late', 1]],
    hint: 'Interest is rent on money. Whoever is using someone else’s money pays it.' },
  c6c: { kind: 'sort', title: 'Earns or lasts — or gone by Friday?', bins: ['Earns or lasts', 'Gone by Friday'],
    things: [['A tool for a job that pays', 0], ['Sweets for the weekend', 1], ['A roof that keeps out the rain', 0], ['A ticket to a show', 1]],
    hint: 'Ask: will this still be paying me back, or still standing, after the loan is paid?' },
  c7a: { kind: 'amount', title: 'The snowball, one more step', q: '100 grows by a tenth of itself each year: 110, then 121. One more year — 121 grows by a tenth of itself. What does it become, to the nearest whole coin?', calc: () => Math.round(121 * 1.1),
    hint: 'A tenth of a number is that number split into ten equal parts. Add one part on.',
    how: ['Take 50. Split it into ten equal parts: each part is 5. That is a tenth.', 'Grow by a tenth: add one part on. 50 + 5 = 55.', 'When a tenth is not a whole coin, work it out, add it on, then round to the nearest whole coin.'] },
  c7c: { kind: 'sort', title: 'One basket, or many?', bins: ['Many things', 'One thing'],
    things: [['A slice of every shop on Market Row', 0], ['All of it in Mags’ stall', 1], ['A little in each world’s businesses', 0], ['Everything in one boat', 1]],
    hint: 'If one thing has a bad week, which basket still has the rest?' },
  c8a: { kind: 'amount', title: 'Revenue, cost, profit', q: 'You sell 40 umbrellas at 20 each. Each one cost you 8. What is the profit?', calc: () => 40 * 20 - 40 * 8,
    hint: 'Profit is what came in, take away what it cost to make it happen.',
    how: ['Say you sell 10 cups at 6 each, and each cup cost you 2.', 'In: 10 × 6 = 60. Cost: 10 × 2 = 20.', 'Profit: 60 − 20 = 40. Now the umbrellas.'] },
  c8c: { kind: 'order', title: 'A shop’s month', steps: ['Buy the stock', 'Pay the stock bill', 'Sell to customers', 'Count what is left as profit'],
    hint: 'The bills often come before the sales do. That is why cash is not profit.' },

  /* the other 24 stops: each built only from its own card's lesson and example */
  c1a: { kind: 'sort', title: 'Cross a border', bins: ['Changes', 'Stays the same'],
    things: [['Which notes the shops take', 0], ['The cake', 1], ['The number on the price tag', 0], ['The paper the note is printed on', 1], ['What people agree counts as money', 0], ['The bread', 1]],
    hint: 'The things are the same things. Only what people agree on moves.' },
  c1d: { kind: 'sort', title: 'Price or value?', bins: ['Price', 'Value'],
    things: [['What the seller asks', 0], ['What it is worth to you', 1], ['The 12 Mags asks for the button', 0], ['The 5 you would happily pay', 1], ['The number on the tag', 0]],
    hint: 'One is set by the seller. The other only you can judge.' },
  c2b: { kind: 'sort', title: 'What gets you asked back?', bins: ['Gets you asked back', 'Matters less'],
    things: [['Turning up', 0], ['Being the fastest', 1], ['Finishing the job', 0], ['Saying when a crate is cracked', 0], ['Charging the least', 1], ['Knowing the owner', 1]],
    hint: 'Think of the boy Nana rehired for eleven years. He was not the quickest.' },
  c2d: { kind: 'sort', title: 'Is it a tap?', bins: ['An extra tap', 'Not a tap'],
    things: [['Selling a bike you outgrew', 0], ['Wishing for a bigger wage', 1], ['Mending umbrellas on the side', 0], ['Spending a little less', 1], ['A second small job', 0], ['Keeping money in a safer tin', 1]],
    hint: 'A tap is money coming IN. Spending less helps, but nothing new arrives.' },
  c3b: { kind: 'amount', title: 'Into the Save jar', q: 'Pay day brings 200. Nana’s split puts 30 of every 100 in the Save jar. How much goes in Save?', calc: () => (200 / 100) * 30,
    hint: 'Count how many hundreds came in. The jar gets its share once for each hundred.',
    how: ['Say 500 comes in, and a jar takes 10 of every 100.', '500 is five hundreds, so the jar gets 10 five times.', '5 × 10 = 50 in that jar. Now try Nana’s Save jar.'] },
  c3d: { kind: 'amount', title: 'A wish into a date', q: 'A kite board costs 720. You save 40 a week. How many weeks until you can buy it?', calc: () => 720 / 40,
    hint: 'Price ÷ what you save each week = weeks.',
    how: ['Say a drum costs 500 and you save 50 a week.', 'How many 50s fit in 500? That is 500 ÷ 50.', '500 ÷ 50 = 10, so ten weeks. A date you can circle.'] },
  c4b: { kind: 'sort', title: 'What are you paying with?', bins: ['Money', 'Something else'],
    things: [['Buying a comic at the till', 0], ['Watching adverts to play a free game', 1], ['Typing your details in for a free gift', 1], ['Coins handed over for a ticket', 0], ['Hours in a free game built to keep you playing', 1]],
    hint: 'If money is not leaving you, ask what is: your attention, your details or your time.' },
  c4d: { kind: 'sort', title: 'The machine, or your defence?', bins: ['The shop’s machine', 'Your defence'],
    things: [['Sweets by the till', 0], ['A list written before you go in', 1], ['Milk at the very back', 0], ['Eleven things on the way to the bread', 0], ['Noticing why the milk is at the back', 1]],
    hint: 'The shop placed some of these. You bring the others in with you.' },
  c5c: { kind: 'sort', title: 'Spot the shape', bins: ['Part of the scam shape', 'Not the shape'],
    things: [['A prize you never entered for', 0], ['Reply within 2 hours!', 0], ['Don’t tell anyone', 0], ['A spelling mistake', 1], ['A good deal in a busy shop', 1], ['Your account is at risk!', 0]],
    hint: 'The shape is a reward or a fright, a hurry, and a secret. Everything else is just the story.' },
  c5d: { kind: 'order', title: 'When a message feels wrong', steps: ['A message asks for money and says keep it secret', 'You stop before sending anything', 'You tell a grown-up', 'Together you check whether it is real'],
    hint: 'Real trouble can wait sixty seconds. Stop first, then tell someone.' },
  c6b: { kind: 'amount', title: 'What the loan really cost', q: 'Bea borrows 600. She repays 60 a month for 12 months. What did borrowing cost her?', calc: () => 60 * 12 - 600,
    hint: 'Add up everything handed back, then take away what was borrowed.',
    how: ['Say you borrow 300 and repay 40 a month for 9 months.', 'Everything handed back: 40 × 9 = 360.', 'Take away the 300 borrowed: 360 − 300. That gap is what the loan cost.'] },
  c6d: { kind: 'sort', title: 'What a trust score remembers', bins: ['It records this', 'It never says this'],
    things: [['You repaid a loan', 0], ['You paid back late', 0], ['What kind of person you are', 1], ['Whether you deserve help', 1], ['You repaid the next one on time', 0], ['How hard you work', 1]],
    hint: 'It is a memory of what happened with loans — never a judgement of who you are.' },
  c7b: { kind: 'sort', title: 'Makes sense, or broken?', bins: ['Makes sense', 'Confused or lying'],
    things: [['Safe, and grows slowly', 0], ['Might grow a lot, might fall a lot', 0], ['Guaranteed to double in a month', 1], ['Big returns and no risk at all', 1], ['Small growth, small risk', 0], ['Can only win, never lose', 1]],
    hint: 'A big possible up comes with a big possible down. Anything promising one without the other is broken.' },
  c7d: { kind: 'sort', title: 'When will you need it?', bins: ['Keep it safe', 'Has time to ride it out'],
    things: [['Bus fare for next week', 0], ['Money for a gift in three weeks', 0], ['A fund you won’t touch for ten years', 1], ['Next month’s club fee', 0], ['Money for when you are grown up', 1]],
    hint: 'Ask when you will need it before you ask what grows fastest.' },
  c7e: { kind: 'order', title: 'How a small fee grows', steps: ['A small fee is taken from the basket this year', 'That money is no longer in the basket', 'Next year it cannot grow', 'Years later the basket is behind by more than all the fees added up'],
    hint: 'Each fee also takes the growth it would have earned, year after year.' },
  c7f: { kind: 'amount', title: 'The doubling trick', q: 'Money grows 9 in every 100 each year. Using the doubling trick, about how many years until it doubles?', calc: () => 72 / 9,
    hint: 'Divide 72 by the yearly growth. It is a rough guide, not a promise.',
    how: ['Say money grows 4 in every 100 each year.', 'Divide 72 by the growth: 72 ÷ 4 = 18.', 'About eighteen years to double. Now try 9 in every 100.'] },
  c7g: { kind: 'sort', title: 'Staying in, or guessing?', bins: ['Staying in', 'Guessing'],
    things: [['Leave it where it is', 0], ['Sell now, buy back when it feels safe', 1], ['Sell on every red day', 1], ['Spread it out and wait', 0], ['Sell half, then decide each morning', 1]],
    hint: 'Guessing means being right twice: when to leave and when to come back.' },
  c7h: { kind: 'sort', title: 'What creeps, and what sits still?', bins: ['Changes over the years', 'Stays the same'],
    things: [['The price of a snack', 0], ['The 10 written on the note in your tin', 1], ['What your tin can buy', 0], ['How many coins are in the tin', 1]],
    hint: 'Money in a tin keeps its number. The prices around it move.' },
  c8b: { kind: 'amount', title: 'Fewer sold, more taken', q: 'Mags sells 10 buttons at 8 each. Next week she charges 12 and sells 8. How much more does she take?', calc: () => 8 * 12 - 10 * 8,
    hint: 'Work out each week’s takings — how many sold times the price — then find the gap.',
    how: ['Say you sell 20 kites at 5, then 15 kites at 7.', 'Takings each week: 20 × 5 = 100, and 15 × 7 = 105.', 'The gap: 105 − 100 = 5 more. Fewer sold, more taken.'] },
  c8d: { kind: 'sort', title: 'Arrives anyway, or only with a sale?', bins: ['Fixed — arrives anyway', 'Variable — only when you sell'],
    things: [['Rent for the stall', 0], ['The stock you sell', 1], ['Wrapping paper for each sale', 1], ['200 a month, sell or not', 0]],
    hint: 'Ask: in a week where nothing sells, does this still arrive?' },
  c8e: { kind: 'amount', title: 'Find the line', q: 'Rent is 270 a month. Each umbrella sells for 15 and costs you 6. How many umbrellas to break even?', calc: () => 270 / (15 - 6),
    hint: 'First find what one sale leaves after its own cost. Then see how many of those cover the rent.',
    how: ['Say rent is 100, and each kite sells for 9 and costs 4.', 'Each kite leaves 9 − 4 = 5.', '100 ÷ 5 = 20 kites to break even. Every kite after that is profit.'] },
  c8f: { kind: 'sort', title: 'Brings them back, or loses them?', bins: ['Brings them back', 'Loses the customer'],
    things: [['Fair prices', 0], ['A LAST DAY sign every day', 1], ['Honest service', 0], ['Raising prices on regulars', 1], ['Tricking someone into a dear buy', 1]],
    hint: 'Tricks win one sale and lose the customer. What kept Nana’s regulars for twenty years?' },
  c8g: { kind: 'sort', title: 'Can it pay the rent?', bins: ['Can pay the rent', 'Stuck on a shelf'],
    things: [['Coins in the shop tin', 0], ['Fifty umbrellas in a dry month', 1], ['Takings from today’s sales', 0], ['Stock nobody has bought', 1], ['Bread that may go stale before it sells', 1]],
    hint: 'Stock is money in a different shape. Until it sells, it cannot pay anything.' },
  c8h: { kind: 'amount', title: 'Half stays in the shop', q: 'Your stall made 180 profit this week. Like Nana, you keep half in the shop tin. How much do you take home?', calc: () => 180 / 2,
    hint: 'Half means two equal piles: one for the tin, one for home.',
    how: ['Say the profit was 60 and you keep half.', 'Split 60 into two equal piles: 30 and 30.', 'One pile stays in the tin, one goes home. Now split your stall’s profit.'] },

  /* the sixteen stops added two a chapter (audit D7/E1), each with its own thing to do */
  c1e: { kind: 'sort', title: 'Good as money?', bins: ['Works well as money', 'Works badly as money'],
    things: [['Coins that last for years', 0], ['A basket of ripe mangoes', 1], ['Notes that come in small amounts', 0], ['A cow you cannot split in half', 1], ['Something everyone in town accepts', 0], ['Pebbles anyone can pick up on the beach', 1]],
    hint: 'Good money keeps, splits into small amounts, and everybody takes it.' },
  c1f: { kind: 'amount', title: 'Change from a 50', q: 'A notebook costs 32. You pay with a 50 note. How much change should you get back?', calc: () => 50 - 32,
    hint: 'Take the price away from what you handed over — or count up from the price.',
    how: ['Say a cup costs 27 and you pay with 40.', 'Count up from 27: 3 makes 30, then 10 more makes 40.', '3 + 10 = 13 change. Now try the notebook.'] },
  c2e: { kind: 'amount', title: 'An hour that grew', q: 'Pip is paid 4 for each umbrella he mends. He used to mend 3 in an hour. With practice he now mends 5. How much more does an hour earn him now?', calc: () => 5 * 4 - 3 * 4,
    hint: 'Work out what an hour earned before and what it earns now, then find the gap.',
    how: ['Say each bowl pays 3, and you went from 2 bowls an hour to 4.', 'Before: 2 × 3 = 6 an hour. Now: 4 × 3 = 12 an hour.', 'The gap: 12 − 6 = 6 more an hour. Now try Pip’s umbrellas.'] },
  c2f: { kind: 'amount', title: 'A good week, planned low', q: 'Pip earned 36, 22, 48 and 30 in four weeks. He plans every week on his slowest one. In a week he earns 48, how much is left over beyond his plan?', calc: () => 48 - Math.min(36, 22, 48, 30),
    hint: 'Find the slowest week first: that is the plan. Whatever comes in above it is extra.',
    how: ['Say four weeks paid 15, 10, 20 and 12.', 'The slowest is 10, so the plan is 10 a week.', 'A 20 week leaves 20 − 10 = 10 over the plan. Now try Pip’s weeks.'] },
  c3e: { kind: 'sort', title: 'Stays, or moves?', bins: ['Arrives every week anyway', 'Follows what you choose'],
    things: [['The bus pass to work', 0], ['Snacks after school', 1], ['The club fee you signed up for', 0], ['A new comic', 1], ['Rent for your room', 0], ['A film with friends', 1]],
    hint: 'Ask of each one: if I chose to spend nothing extra this week, would it still arrive?' },
  c3f: { kind: 'amount', title: 'What the notebook says', q: 'Pip’s notebook for snacks this week says: Monday 5, Wednesday 8, Friday 6, Saturday 11. How much did snacks cost him in all?', calc: () => 5 + 8 + 6 + 11,
    hint: 'Add every line in the list, one at a time.',
    how: ['Say the list says 3, 4 and 7.', 'Add them one at a time: 3 + 4 = 7, then 7 + 7 = 14.', 'So that list adds up to 14. Now add up Pip’s.'] },
  c4e: { kind: 'sort', title: 'Worth comparing?', bins: ['Compare with it', 'Ignore it'],
    things: [['The price at the next stall', 0], ['The crossed-out “was” price', 1], ['What it is worth to you', 0], ['How big the SALE sign is', 1], ['What you planned to spend', 0], ['How many people are queuing', 1]],
    hint: 'The useful ones come from outside the seller’s sign: other shops, your plan, your own judgement.' },
  c4f: { kind: 'amount', title: 'The deal you did not need', q: 'Pens cost 4 each, or 3 for 10. You only need one pen, but you take the deal. How much more did you spend than you needed to?', calc: () => 10 - 4,
    hint: 'Compare what you handed over with what one pen on its own would have cost.',
    how: ['Say a cake is 7, or 4 for 20, and you need one.', 'With the deal you pay 20. On its own, one cake is 7.', '20 − 7 = 13 more than you needed. Now try the pens.'] },
  c5e: { kind: 'sort', title: 'Surprise tin, or goal?', bins: ['The surprise tin', 'Saving for a goal'],
    things: [['The bike chain snaps', 0], ['A new bike you have wanted for months', 1], ['You lose your bus pass', 0], ['A present for a birthday in March', 1], ['Your shoes split in the rain', 0], ['A trip with the club next term', 1]],
    hint: 'Could you have written it on a calendar in advance? If not, it is what the tin is for.' },
  c5f: { kind: 'amount', title: 'The line that does not fit', q: 'Your list started the week at 120. You know you paid 15 for the bus and 30 for the club. The week ends at 66. How much went out that you cannot explain?', calc: () => 120 - 15 - 30 - 66,
    hint: 'Take what you know you paid away from the start. Whatever still does not match the end is the mystery.',
    how: ['Say the list starts at 50, you paid 10 you know of, and it ends at 35.', 'Start, take away what you know: 50 − 10 = 40.', '40 should be left but it says 35, so 5 is unexplained. Now try your list.'] },
  c6e: { kind: 'amount', title: 'What is left after the payment', q: 'Each week Bea has 55 coming in and 31 of costs. A loan payment would be 14 a week. If she takes the loan, how much is left each week for her to choose about?', calc: () => 55 - 31 - 14,
    hint: 'Take the costs away first, then the payment. What remains is the part she chooses about.',
    how: ['Say 30 comes in, costs are 18, and a payment would be 5.', 'After costs: 30 − 18 = 12.', 'After the payment: 12 − 5 = 7 left to choose about. Now try Bea’s week.'] },
  c6f: { kind: 'order', title: 'Lending it the friendly way', steps: ['Decide how much you could manage without', 'Agree out loud when it comes back', 'Write it down where you both can see', 'Remind them kindly if the day passes'],
    hint: 'Work out what you can spare before anything changes hands. The reminder comes last.' },
  c7i: { kind: 'amount', title: 'Your slice of the profit', q: 'A bakery is split into 100 equal shares. This year it makes 400 profit and pays all of it out to its owners. You own 6 shares. How much is yours?', calc: () => (400 / 100) * 6,
    hint: 'Find what one share gets first, then count your shares.',
    how: ['Say a stall is split into 10 shares and pays out 50.', 'One share gets 50 ÷ 10 = 5.', 'Own 3 shares and you get 3 × 5 = 15. Now try the bakery.'] },
  c7j: { kind: 'amount', title: 'Starting sooner', q: 'Asha puts away 15 a month for 12 months. Ravi puts away 15 a month too, but starts 4 months later, so he pays in for 8. Before any growth, how much more has Asha put in?', calc: () => 15 * 12 - 15 * 8,
    hint: 'Work out what each one put in — months times the amount — then find the gap.',
    how: ['Say Mo puts away 5 a month for 10 months, and Lu for 6.', 'Mo: 10 × 5 = 50. Lu: 6 × 5 = 30.', 'The gap: 50 − 30 = 20. Now try Asha and Ravi.'] },
  c8i: { kind: 'amount', title: 'What each hour earned', q: 'You sell 18 bracelets at 7 each. The beads cost 3 a bracelet. Making and selling them took 8 hours. How much did each hour earn?', calc: () => (18 * 7 - 18 * 3) / 8,
    hint: 'Find the profit first — what came in, take away the beads — then share it across the hours.',
    how: ['Say you sell 8 cards at 5 each, the paper costs 2 a card, and it took 4 hours.', 'In: 8 × 5 = 40. Paper: 8 × 2 = 16. Profit: 40 − 16 = 24.', 'For each hour: 24 ÷ 4 = 6. Now try the bracelets.'] },
  c8j: { kind: 'order', title: 'Testing an idea', steps: ['Make a few', 'Sell them and watch what happens', 'Change what did not work', 'Make a bigger batch'],
    hint: 'Small and cheap comes before big. Learn before you grow.' },
};
export const hasItem = (id) => !!ITEMS[id];

/* The order is shown shuffled from the card id (never by chance), the same way
   questions are permuted, so the steps are never already in order on screen. */
export function shown(id) {
  const it = ITEMS[id]; if (!it) return null;
  if (it.kind === 'sort') return it.things.map((t, i) => ({ i, t: t[0] }));
  if (it.kind !== 'order') return null;
  let h = 2166136261; for (const ch of id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const idx = it.steps.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  if (idx.every((v, i) => v === i)) idx.push(idx.shift());       /* never pre-solved */
  return idx.map((i) => ({ i, t: it.steps[i] }));
}
export const answerOf = (id) => { const it = ITEMS[id]; return it.kind === 'amount' ? it.calc() : it.kind === 'order' ? it.steps.map((_, i) => i) : it.things.map((t) => t[1]); };

/* a child's attempt: sort → bins[] by thing; order → step indices in the order tapped;
   amount → a number */
export function check(id, attempt) {
  const it = ITEMS[id], a = answerOf(id);
  if (it.kind === 'amount') return Number(String(attempt).replace(/[^\d.-]/g, '')) === a;
  return Array.isArray(attempt) && attempt.length === a.length && attempt.every((v, i) => v === a[i]);
}
