/* sprout.js — the Sprout reading of every lesson stop (audit E2).

   Two age bands read the Atlas: a Sprout (8–10) and a Builder (11+), `c.band`. The
   builder text lives on the card in content.js / objectives.js and is the lesson as it
   was written; this file is the same lesson read aloud to a younger child — shorter
   sentences, everyday words, THE SAME IDEA AND THE SAME FACTS.

   Rules this file keeps, and test/sprout.mjs holds it to:
   · every stop on the Atlas (the 56 chapter cards and the objectives' own) has a
     `teach` here; an `eg` is written for every stop too;
   · a sprout sentence is never longer, on average, than the builder's it stands for;
   · NO NEW NUMBER. Every figure a sprout reading states is already in the builder text
     of the same field (rule 6: a figure is the town's own arithmetic, registered in
     src/sources.js, never invented — so a reading may drop a number, never add one);
   · the same <b>/<i> markup in `teach`; `eg` is plain text, as the card's own is.

   Kept apart from content.js so the curriculum file stays readable, and keyed by card id
   so a stop and its reading cannot drift apart unnoticed: a stop with no entry fails the
   test. Imports nothing, so content.js can read it without a cycle. */

export const SPROUT = {
  /* c1 · What money even is */
  c1a: {
    teach: 'Picture a bus ticket. It is only card. Yet the driver lets you on, because <b>everybody trusts it</b>. Money works like that. Each country trusts its own kind.',
    eg: 'Carry one cake on a long trip. Every place writes its own number on the tag. Not a crumb of the cake changes.',
  },
  c1b: {
    teach: 'Think of a <b>need</b> as a seatbelt: without it, things go wrong. A <b>want</b> is a sticker on the window. Stickers are fine! Just spot which is which <i>before</i> paying.',
    eg: 'Dark clouds? The umbrella is a must. Sunny May? It is just nice to have.',
  },
  c1c: {
    teach: 'Money comes from a trade. <b>You give something, and you get something.</b> Most of the time you give your time and skill, and get pay. Nobody gets money for nothing.',
    eg: 'Picture a busy seller with heavy crates and no spare hands. Pip has spare hands. He lifts. She pays. Everyone goes home happy.',
  },
  c1d: {
    teach: 'The <b>price</b> is what the seller asks. The <b>value</b> is how much you want it. That is up <i>to you</i>. They are not often the same.',
    eg: 'Mags wants a week\'s pay for a shiny button. The price is real. Is it worth that to you? You decide.',
  },
  c1e: {
    teach: 'Imagine a market with no coins. You bring fish. The baker wants eggs. Stuck! <b>Swapping</b> needs <i>both</i> sides to want the trade. Money is the thing everybody will take. It does not rot. You can break it into little bits.',
    eg: 'Pip\'s fish and the shoemaker\'s shoes cannot meet, because shoes need rice. So Pip sells his catch for coins. Coins buy shoes from anybody.',
  },
  c1f: {
    teach: 'If you pay more than the price, the seller gives some back. That is your <b>change</b>. It is what you gave, take away the price. Count it before you go. Anyone can make a mistake.',
    eg: 'Play shopkeeper. The pencil is 35 and the coin is 50. Hop up to 40: that is 5. Hop on to 50: that is 10. Your hops add to 15.',
  },

  /* c2 · Earning it */
  c2a: {
    teach: 'Imagine a busy baker who cannot be everywhere at once. You have a free afternoon. She buys your afternoon. That is a job: <b>your time</b>, priced by what it is worth <i>to her</i>.',
    eg: 'A slow hour and a quick hour of crates look different inside your head. On the pay slip, they look exactly alike.',
  },
  c2b: {
    teach: 'Your first job is luck. Your next job comes from how well you did the first one. Turn up. Finish the work. Own your mistakes. That beats being the fastest.',
    eg: 'Nana kept hiring the same boy for eleven years. He was not the fastest. He was honest. He told her when a crate was cracked.',
  },
  c2c: {
    teach: 'A gift is like rain on a dry day. Lovely! But you cannot book it. A wage is like a tap. Both fill the same cup. Only the <b>tap</b> runs again.',
    eg: 'Getting 500 on your birthday is lovely. But it is not an income. Don\'t count on it every month, or your plan falls over.',
  },
  c2d: {
    teach: 'Think of water pipes. One pipe gets blocked, and the house goes dry. Add a second pipe, or a third. Now one blockage is just a drip. More <b>taps</b> mean a safer week.',
    eg: 'Mags has buttons. She mends umbrellas. She finds lost things. Some months, just one is busy. It still feeds her.',
  },
  c2e: {
    teach: 'When you get <b>better at a job</b>, you get more done each hour. So each hour is worth more to the person paying you. Practice makes your hour grow.',
    eg: 'Pip mended 2 umbrellas an hour. He got 5 for each, so 10 an hour. He practised for a month. Now he mends 3. 3 × 5 = 15 an hour.',
  },
  c2f: {
    teach: 'Weeks of work are like weather. Some are sunny, some are grey. Build your plan for the <b>greyest</b> one. Then the sunny weeks are a treat, not a trap.',
    eg: 'Pip lines up his weeks: 30, 45, 25, 40. He plans on the smallest, 25. The 45 week had 20 spare. Save got it.',
  },

  /* c3 · Making a plan */
  c3a: {
    teach: 'A budget has two lists. One is money <b>in</b>. One is money <b>out</b>. What is left is yours to choose about. Is more going out than coming in? Then the gap must come from somewhere.',
    eg: '200 comes in. 60 goes on the phone. 40 goes on the bus. 100 stays. Watch the part that stays.',
  },
  c3b: {
    teach: 'Picture jars on a shelf, each with a job. <b>Spend</b> is for today. <b>Save</b> is for soon. <b>Grow</b> is for one day, far off. <b>Give</b> is for other people. Fill them on pay day. A single heap just melts away.',
    eg: 'For sixty years, Nana has poured 40, 30, 20 and 10 into her jars. Pencil, paper, jars. Nothing fancy.',
  },
  c3c: {
    teach: 'Picture a fork in a path. Walk left, and you cannot also walk right. Buying works like that. The path you skip is part of the price. Its grown-up name is <i>opportunity cost</i>, or <b>what you gave up</b>.',
    eg: 'Mags never tells you the second half of the price. That is not lying. It is selling.',
  },
  c3d: {
    teach: 'Think of stepping stones across a river. The price is the far bank. Each week of saving is one stone. <b>Count the stones</b>, and you know the date. Too many stones? Bigger steps, a nearer bank, or patience.',
    eg: 'The far bank: a 900 skateboard. Each stone: 60 saved. Fifteen stones. Across!',
  },
  c3e: {
    teach: 'Some bills are like a train timetable: they come <b>no matter what</b>. A bus pass. A club. Others are like snacks from a cart: they come <b>only if you wave</b>. In a thin week, stop waving first.',
    eg: 'A thin week for Pip. The bus pass still wanted its 20. But snacks? He waved less, so 15 shrank to 5.',
  },
  c3f: {
    teach: 'Your memory is bad at keeping track of money. It forgets small spends. It remembers big ones. So <b>write each spend down</b>, or read your wallet’s list. Then you see where the money really went.',
    eg: 'Pip\'s memory said snacks were about 20. His notebook disagreed: 6, 9, 7, 12. Added up, 34. The notebook wins.',
  },

  /* c4 · Sellers and their tricks */
  c4a: {
    teach: '"Today only." "Last one." These are not facts. They are <b>tools to stop you thinking</b>.',
    eg: 'Mags\'s "last tray" of buttons is the most famous tray on the Row. It has been the last for six years.',
  },
  c4b: {
    teach: 'Picture a free ride at the fair. While you sit, a big screen shows adverts. You did not pay coins. You paid with <b>your eyes</b>, your name, or your minutes. Sometimes the bill just comes later.',
    eg: 'Some free trials ask for a card. They are hoping you forget to stop it. Then you pay.',
  },
  c4c: {
    teach: 'A <b>subscription</b> is a tiny drip from a leaky tap. Drip, drip, every month. One drip is 30. A year of drips fills a bucket of 360. You said yes <b>once</b>. The tap keeps going.',
    eg: 'Think of four small monthly things nobody remembers starting. Together, in a year, they can cost most of a week\'s pay.',
  },
  c4d: {
    teach: 'Think of a shop like a maze built by the seller. Treats wait by the exit. Milk hides at the far end. Every turn shows you something. The maze is <b>built to make you buy</b>.',
    eg: 'Count the shiny things on the way to the bread. Eleven waved at you. The shop put them there.',
  },
  c4e: {
    teach: 'A crossed-out price is like a story the seller tells about <b>their own shop</b>. Other shops do not appear in it. So look around. What does it cost next door? And what is it worth to you?',
    eg: 'The tag says 90, crossed out. Now 65. Feels like 25 saved! Next door, the same kite is 55 all year.',
  },
  c4f: {
    teach: 'Picture a deal: 3 pens for 12, or one pen for 5. Need all three? <b>Each pen</b> is cheaper in the deal. Need just one? You carry home pens you never wanted. Deals only help with things you will use.',
    eg: 'Need three pens? The deal is 12. Singles are 15. You keep 3. Need one pen? The deal is 12. A single is 5. That is 7 for pens you did not want.',
  },

  /* c5 · Keeping it safe */
  c5a: {
    teach: 'Think of a bank as a busy library for money. You lend your coins. Other people borrow them for a while. The bank keeps track, keeps it <b>safe</b>, and <b>pays you a little thank-you</b> for the loan.',
    eg: 'Your coins are not sitting in a box with your name. They are out helping somebody. The bank promises to bring them home.',
  },
  c5b: {
    teach: 'Your PIN, password and code are like your house key. You never hand a key to a stranger. <b>No real helper</b> asks for it. Someone asking wants to get in.',
    eg: 'Your bank knows you already. A call asking for secrets is not your bank.',
  },
  c5c: {
    teach: 'Tricks wear different costumes. Underneath, the same skeleton: <b>a treat or a scare, a rush, and a hush</b>. Learn the skeleton. Then every costume looks the same.',
    eg: 'Free prize? Scary message? Friend in a jam? Listen for a rush and a hush. They always come along.',
  },
  c5d: {
    teach: 'A trick is like mould. It grows in the dark. "Keep it secret" keeps it dark. Telling a grown-up opens the curtains. <b>Light</b> stops it.',
    eg: 'Real friends in real trouble do not mind waiting. Sixty seconds is plenty to fetch an adult first.',
  },
  c5e: {
    teach: 'A goal jar is for something you picked. A <b>surprise tin</b> is for things that pick you: a broken chain, a lost pass. With a tin, a surprise is a bump in the road. Without one, it is a pothole.',
    eg: 'Each week, 5 drops into Pip\'s tin. Then his chain snapped. The tin held 30. He paid, and rode on.',
  },
  c5f: {
    teach: 'Your bank keeps a <b>list of every payment</b>. Read it now and then. You should know every line on it. If you see one you don\'t know, tell a grown-up and the bank, fast.',
    eg: 'Pip read his list like a detective. Bus 12. Club 25. Then 7 to a stranger\'s name. He told Nana that night. The bank took it from there.',
  },

  /* c6 · Borrowing */
  c6a: {
    teach: 'Interest is <b>rent on money</b>. Lend the bank coins, and it pays you rent. Borrow, and you pay it. Same idea. Other side of the counter.',
    eg: 'Borrowing is nothing to feel bad about. It is a tool with a price. Find the price first.',
  },
  c6b: {
    teach: 'Sellers show you the small <b>monthly payment</b>. That is not the real cost. Add up <b>everything you pay back</b>. Then take away what you borrowed. That is the real cost.',
    eg: 'Borrow 1,000. Pay back 110 a month for a year. That is 1,320 in all. The loan cost 320.',
  },
  c6c: {
    teach: 'A loan for a ladder that helps you earn is like planting a seed. A loan for a treat that is gone by Friday is like paying rent for a <b>memory</b>. Borrow for what <b>earns or lasts</b>.',
    eg: 'Nana borrowed to buy umbrellas to sell. That loan made money. Her festival loan did not. She would still do it again.',
  },
  c6d: {
    teach: 'A lender keeps a diary of kept promises. Pay on time, and the diary is kind, and loans cost less. It is about <b>what you did</b>, not who you are. New pages can mend old ones.',
    eg: 'Here it is the trust score. Pay back, and it goes up.',
  },
  c6e: {
    teach: 'Before a loan, look at your week like a lunchbox. What is left after the usual things? <b>Will the payment fit in that space</b>, even on a skinny week? A promised payment goes in before any treats.',
    eg: 'Bea\'s lunchbox: 50 in, 30 out, 20 of room. A payment of 12 slips in, with 8 to spare. A payment of 25 will not close the lid.',
  },
  c6f: {
    teach: 'Lending to a friend works best with <b>three plain steps</b>. First, only lend what you can do without. Next, say out loud when it comes back. Last, write it where both of you can see.',
    eg: 'Chhoti wanted a book. Pip lent the 20. A note in ink said when it would return: Friday. It did.',
  },

  /* c7 · Money that grows */
  c7a: {
    teach: 'Interest is added to your money. Next time, interest is added to <b>your money plus the interest</b>. That is called compounding. It is slow for a year, then it isn\'t.',
    eg: '100 grows by 10% each year. It goes 110, then 121, then 133. The jumps get bigger all by themselves.',
  },
  c7b: {
    teach: 'A swing that goes high swings low too. Money that <i>might</i> jump up might drop. A gentle swing stays near the middle. A high swing with no drop? Someone is mixed up, or fibbing.',
    eg: 'Bo shouts up. Bea shouts down. Nobody can see tomorrow. Both shout anyway.',
  },
  c7i: {
    teach: 'Picture a giant pizza that is a business, cut into equal slices called <b>shares</b>. Hold a slice, and you get a slice of the good days and the bad. Its price wobbles with what people expect the pizza to earn.',
    eg: 'Cut the bakery into 100 slices. It earns 300 and gives it all away. Every slice gets 300 ÷ 100 = 3.',
  },
  c7c: {
    teach: 'Put your eggs in <b>many</b> baskets. Drop one basket, and you still have eggs. Keep them all in one, and a single trip on the stairs ruins breakfast.',
    eg: 'A basket with the whole market in it is boring. But boring wins more often than exciting.',
  },
  c7d: {
    teach: 'Money for <b>next month</b> is like an umbrella by the door: it must be ready. Money for <b>ten years</b> away is like a tree you planted. It can sit through storms and keep growing.',
    eg: 'Bus money and money for far away are different. They belong in different places.',
  },
  c7j: {
    teach: 'Think of a snowball rolling down a long hill. Start it near the top, and it grows huge. Start halfway, and it stays small. Pushing a little <b>every week</b> helps. Starting <b>early</b> helps most.',
    eg: 'Asha starts in January, 20 a month. Ravi waits for July. Come December, before any growth, her jar has 240. His has 120.',
  },
  c7e: {
    teach: 'A small fee taken <b>every year</b> costs more than the fee. It also costs what the fee would have grown into. Fees grow, just as money does.',
    eg: 'Picture two baskets growing side by side. One pays a little fee each year. Much later, the gap is bigger than every fee put together.',
  },
  c7f: {
    teach: 'Here is a pocket trick for <b>doubling</b>. Take 72. Share it out by the growth each year. The answer is roughly how many years until your pile is twice as big. Only roughly! Think of it as a guess you can picture.',
    eg: 'Say money grows by 6 each year for every 100. 72 ÷ 6 = 12. So it takes about twelve years to double.',
  },
  c7g: {
    teach: 'Hopping off a train when it slows, then back on, sounds smart. Most people miss the train. <b>Staying on</b> through the bumps usually beats guessing.',
    eg: 'On a red day, Bo jumped off. A week later, prices bounced, and he was not there for it. Bea sat still. Bea was fine.',
  },
  c7h: {
    teach: 'Prices are like a slow tide that <b>creeps up</b> the beach. A coin in a tin stays the same coin. But the tide takes a little of what it buys. Grow faster than the tide, or slowly lose ground.',
    eg: 'Your 10 coin buys a snack today. In a few years, that snack might cost 11. The coin is the same. The snack moved.',
  },

  /* c8 · Running something */
  c8a: {
    teach: 'Think of a lemonade stand. <b>Revenue</b> is every coin in the jar. <b>Cost</b> is lemons, sugar and cups. <b>Profit</b> is what stays. Busy with no profit is just hard work.',
    eg: 'Picture the till. Forty sales of 20 put 800 inside. The maker took 8 a piece. So 320 left again. What stays: 480.',
  },
  c8b: {
    teach: 'Setting a price is like tuning a guitar string. Too loose, and you sell everything but earn nothing. Too tight, and it all goes home with you. Twist and listen until you find <b>the most people will happily pay</b>.',
    eg: 'Mags nudged buttons from 8 up to 12. Two fewer buyers. Yet more coins in the tin, and an early night.',
  },
  c8j: {
    teach: 'Like testing the water with a toe before jumping in: <b>make a few</b> first. Sell them. Watch. Change what flopped. Then make more. A toe in cold water costs little. A big jump costs a lot.',
    eg: 'Mags painted 5 umbrellas, not 50. Blue flew off the stall in a day. Yellow stayed put. Guess what colour came next.',
  },
  c8c: {
    teach: 'You can make a profit and <b>still run out of cash</b>. Profit is a month on paper. Cash is what is in your hand. And the stock bill needs cash.',
    eg: 'In Nana\'s busiest month, the stock bill knocked before the customers\' coins arrived. A great month nearly shut the door.',
  },
  c8d: {
    teach: 'Some costs are like a pet: they need feeding <b>every day</b>, busy or not. That is a <b>fixed</b> cost. Others are like guests: they only come when you sell. That is <b>variable</b>. Quiet weeks hurt because the pet still eats.',
    eg: 'Rent of 200 a month quietly eats about seven every day. It eats before a single sale.',
  },
  c8i: {
    teach: 'Making things takes stuff and <b>hours</b>. Take away the stuff, and the rest is profit. Now share that profit among your hours. That shows what <b>each hour</b> earned. Is it better than a job?',
    eg: 'Ten bracelets sold at 9. Beads at 3 each. That leaves 60. Pip spent 5 hours. 60 ÷ 5 = 12 for every hour.',
  },
  c8e: {
    teach: 'Picture climbing out of a hole. The fixed costs are the hole. Each sale is a step up. The step where your head pops out is <b>break-even</b>. Every step after that is profit.',
    eg: 'The hole is 240 of rent. Each umbrella: sells at 20, costs 8, leaves 12. 240 ÷ 12 = 20 steps up to break even.',
  },
  c8f: {
    teach: 'A new customer is like a new friend: it takes effort. A customer who <b>comes back</b> is an old friend, easy to keep. Fairness and honesty keep friends.',
    eg: 'Some of Nana\'s customers have come for twenty years. Not one trick, ever.',
  },
  c8g: {
    teach: 'Unsold stock is like coins glued to a shelf: it is <b>money that cannot move</b>. It will not pay the rent. Some goes stale. Buy what people take, and watch what gathers dust.',
    eg: 'Mags bought fifty umbrellas when it was dry. Her money sat in a cupboard until it rained.',
  },
  c8h: {
    teach: 'A shop needs feeding too. Leave some profit <b>in the shop</b> for next week\'s stock and slow weeks. Take the rest home. It is jars again, for a business.',
    eg: 'Nana splits her profit in half. Half goes in the shop tin. Half goes home. The tin is never empty.',
  },

  /* the objectives' own stops (objectives.js NEW_CARDS) */
  'x-ch4': {
    teach: 'Two bags of the same rice. The big bag costs more, but that is not the real question. The real question is <b>what does one scoop cost</b> in each bag. Divide the price by how much is in the bag. Now you can compare them fairly.',
    eg: '600g costs ₹90. That is ₹15 for each 100g. 400g costs ₹56. That is ₹14 for each 100g. So the small bag is cheaper per scoop. The big bag hopes you won\'t check.',
  },
  'x-ch8': {
    teach: 'Buying now and saving up are both fine answers. To choose well, write down <b>both</b> sides. What extra do you pay if you buy now? What do you miss out on if you wait? Then pick. You will know why you chose.',
    eg: 'The kit is ₹800. The jar holds ₹500. Wait three weeks: still ₹800. Borrow today: ₹880, but it is yours three weeks early. So eighty buys three weeks. Worth it? That is up to you.',
  },
  'x-ch10': {
    teach: 'Two offers hardly ever come in the same shape. One takes a set fee. One takes a slice. One is for a month. One is for a year. <b>To compare them, first change them into the same shape</b>: the same time, the same amount, the same units. Most bad deals last because nobody does this.',
    eg: 'Stall A wants ₹20 a week, flat. Stall B wants 5% of your sales. At ₹300 of sales, B asks ₹15, so B wins. At ₹500, B asks ₹25, so A wins. Your sales decide.',
  },
  'x-ch11': {
    teach: 'A shiny thing in front of you is a bad judge. So pick your rule <b>before</b>, on a calm day at home. In the shop, you do not choose again. You just keep a promise to yourself.',
    eg: 'Three in ten to Save: that is the rule. Pay day arrives. The rule is done before your eyes meet any shop.',
  },
  'x-ch12': {
    teach: 'Here is the best test of something you bought. Not how it felt in the shop. How you feel about it <b>a week later</b>. Ask that about the last few things you bought. You will soon see a pattern. That pattern will help you more than anyone\'s advice.',
    eg: 'Think of two things you bought last month. You still use one. You forgot you even had the other. That second one is the lesson. It cost you money, so make sure you learn from it.',
  },
};

/* The reading a child gets: the Sprout one when she is a Sprout and it exists, else the
   card's own. `who` is the child, or her band as a string. Every surface that shows or
   reads aloud a stop's teaching goes through these two. */
const bandOf = (who) => (typeof who === 'string' ? who : who && who.band);
export function teachFor(card, who) {
  const s = card && bandOf(who) === 'sprout' && SPROUT[card.id];
  return (s && s.teach) || (card && card.teach) || '';
}
export function egFor(card, who) {
  const s = card && bandOf(who) === 'sprout' && SPROUT[card.id];
  return (s && s.eg) || (card && card.eg) || '';
}
