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
    teach: 'A note is just paper. It buys bread because <b>everyone agrees it does</b>. In another country, people agree on different money.',
    eg: 'Cake costs a different number in each country. But the cake is the same.',
  },
  c1b: {
    teach: 'A <b>need</b> is something you can\'t do without. A <b>want</b> just makes life nicer. Both are OK. Know which one it is <i>before</i> you pay.',
    eg: 'Rain is coming. Today an umbrella is a need. In May it is a want.',
  },
  c1c: {
    teach: 'Money comes from a trade. <b>You give something, and you get something.</b> Most of the time you give your time and skill, and get pay. Nobody gets money for nothing.',
    eg: 'The grain seller has money but no time. Pip has time. Pip carries the crates. Both of them win.',
  },
  c1d: {
    teach: 'The <b>price</b> is what the seller asks. The <b>value</b> is how much you want it. That is up <i>to you</i>. They are not often the same.',
    eg: 'Mags wants a week\'s pay for a shiny button. The price is real. Is it worth that to you? You decide.',
  },
  c1e: {
    teach: 'Before money, people <b>swapped</b>, like fish for bread. But a swap only works if you <i>each</i> want what the other has. Money fixes that. Everyone takes it. It keeps. And it comes in small bits.',
    eg: 'Pip has fish and wants shoes. The shoemaker wants rice, not fish. So no swap. With money, Pip sells his fish to anyone. Then he pays for the shoes.',
  },
  c1f: {
    teach: 'If you pay more than the price, the seller gives some back. That is your <b>change</b>. It is what you gave, take away the price. Count it before you go. Anyone can make a mistake.',
    eg: 'A pencil costs 35. You give 50. Count up from 35. 5 more makes 40. 10 more makes 50. 5 + 10 = 15 change.',
  },

  /* c2 · Earning it */
  c2a: {
    teach: 'Most jobs are a trade. Someone has money but no <b>time</b>. You have time but no money. Your pay is what your hour is worth <i>to them</i>.',
    eg: 'Two hours of carrying crates pays the same. It does not matter if it felt long or short.',
  },
  c2b: {
    teach: 'Your first job is luck. Your next job comes from how well you did the first one. Turn up. Finish the work. Own your mistakes. That beats being the fastest.',
    eg: 'Nana kept hiring the same boy for eleven years. He was not the fastest. He was honest. He told her when a crate was cracked.',
  },
  c2c: {
    teach: 'Money you were <b>given</b> and money you <b>earned</b> spend the same. A gift comes once. A wage comes again. And again.',
    eg: 'Getting 500 on your birthday is lovely. But it is not an income. Don\'t count on it every month, or your plan falls over.',
  },
  c2d: {
    teach: 'With just one way to get money, one bad week can leave you with none. A second small job helps. So does selling old things. Each one is an extra tap.',
    eg: 'Mags sells buttons. She mends umbrellas. She finds lost things. Most months, two of these go badly. She is still never broke.',
  },
  c2e: {
    teach: 'When you get <b>better at a job</b>, you get more done each hour. So each hour is worth more to the person paying you. Practice makes your hour grow.',
    eg: 'Pip mended 2 umbrellas an hour. He got 5 for each, so 10 an hour. He practised for a month. Now he mends 3. 3 × 5 = 15 an hour.',
  },
  c2f: {
    teach: 'Some work pays a different amount each week. Plan your spending on your <b>slowest</b> week, not your best. Then a good week is a bonus. It is not a hole you fall into later.',
    eg: 'Pip earned 30, 45, 25 and 40. He plans on 25. In the week he got 45, the extra 20 went into Save.',
  },

  /* c3 · Making a plan */
  c3a: {
    teach: 'A budget has two lists. One is money <b>in</b>. One is money <b>out</b>. What is left is yours to choose about. Is more going out than coming in? Then the gap must come from somewhere.',
    eg: 'In: 200 on pay day. Out: 60 phone, 40 bus. Left: 100. Watch that 100.',
  },
  c3b: {
    teach: 'Split your money the moment it arrives. <b>Spend</b> is for now. <b>Save</b> is for soon. <b>Grow</b> is for far away. <b>Give</b> is for others. Money kept in one pile gets spent as one pile.',
    eg: 'Nana has split her money 40 / 30 / 20 / 10 for sixty years. She never needed a spreadsheet.',
  },
  c3c: {
    teach: 'Every yes is also a no. Say yes to the shiny thing. Then you say no to <b>the thing you can\'t have now</b>. Grown-ups call that <i>opportunity cost</i>.',
    eg: 'Mags never tells you the second half of the price. That is not lying. It is selling.',
  },
  c3d: {
    teach: 'To make a goal a plan, divide. <b>price ÷ what you save each week = weeks.</b> Too long? Save more. Pick something cheaper. Or wait.',
    eg: 'A skateboard costs 900. You save 60 a week. That is 15 weeks. Not "someday". Fifteen.',
  },
  c3e: {
    teach: 'Some costs come <b>every week, whatever you do</b>. A bus pass is one. A club fee is another. Other costs <b>follow what you choose</b>, like snacks and comics. Less money coming in? Cut the ones you choose first.',
    eg: 'Pip earned less this week. His bus pass still cost 20. His snacks went down from 15 to 5. Snacks were the part he could change.',
  },
  c3f: {
    teach: 'Your memory is bad at keeping track of money. It forgets small spends. It remembers big ones. So <b>write each spend down</b>, or read your wallet’s list. Then you see where the money really went.',
    eg: 'Pip thought snacks cost him about 20 a week. His notebook said 6, 9, 7 and 12. That is 34.',
  },

  /* c4 · Sellers and their tricks */
  c4a: {
    teach: '"Today only." "Last one." These are not facts. They are <b>tools to stop you thinking</b>.',
    eg: 'Mags calls the same tray of buttons "the last one". She has said it for six years.',
  },
  c4b: {
    teach: 'If you are not paying money, you are paying with something else. It might be your attention, your details or your time. Or it might be a bigger bill later.',
    eg: 'Some free trials ask for a card. They are hoping you forget to stop it. Then you pay.',
  },
  c4c: {
    teach: 'A subscription is a choice you make <b>once</b> and pay for <b>forever</b>. 30 a month does not feel like 360 a year. But it is.',
    eg: 'Think of four small monthly things nobody remembers starting. Together, in a year, they can cost most of a week\'s pay.',
  },
  c4d: {
    teach: 'Sweets by the till. Milk at the back. None of it is an accident. A shop is <b>set up to make buying easy</b>.',
    eg: 'You walked past eleven things. Then you got the bread. That was the plan.',
  },
  c4e: {
    teach: 'A crossed-out “was” price is <b>the seller’s own number</b>. It tells you nothing about other shops. So check the “now” price against other shops. And ask what it is worth to you.',
    eg: 'Was 90, now 65! That looks like 25 off. The stall next door sells the same kite for 55 every day.',
  },
  c4f: {
    teach: '“3 for 12” sounds cheaper than 5 each. And <b>per pen</b>, it is. But if you only needed one, you paid 12, not 5. A multi-buy only saves money on things you would use anyway.',
    eg: 'Pens are 5 each, or 3 for 12. Need three? 12 instead of 15 saves 3. Need one? 12 instead of 5 costs 7 more.',
  },

  /* c5 · Keeping it safe */
  c5a: {
    teach: 'A bank keeps your money safe. It lets you pay without notes. And it <b>pays you a little to leave your money there</b>. Why? Because it lends that money out in the meantime.',
    eg: 'Your money is not in a drawer with your name on it. It is out working. The bank owes it back to you.',
  },
  c5b: {
    teach: 'A PIN, a password and a one-time code are <b>yours alone</b>. Nobody real ever needs them. Someone who asks is a scammer.',
    eg: 'Your real bank already knows your account. It never needs to ask.',
  },
  c5c: {
    teach: 'Every scam has the same shape: <b>a reward or a fright, a hurry, and a secret</b>. Learn the shape. Then the story does not matter.',
    eg: 'A prize, a scare, or a friend in trouble. Always in a hurry. Always "just between us".',
  },
  c5d: {
    teach: 'Scams work because people feel <b>embarrassed</b>. "Don\'t tell anyone" keeps the scammer safe, not you. So tell someone. That is the right thing to do.',
    eg: 'A friend who really needs help can wait sixty seconds. Use that time to ask an adult.',
  },
  c5e: {
    teach: 'Some money is for a thing you have picked. Some is for <b>things nobody can plan</b>, like a snapped bike chain or a lost bus pass. Keep a small surprise tin. Then a surprise is just a nuisance, not a disaster.',
    eg: 'Pip puts 5 a week in his surprise tin. When his chain snapped, 30 was already in it. No loan. No panic.',
  },
  c5f: {
    teach: 'Your bank keeps a <b>list of every payment</b>. Read it now and then. You should know every line on it. If you see one you don\'t know, tell a grown-up and the bank, fast.',
    eg: 'Pip’s list said: bus 12, club 25, and 7 to a name he had never seen. He showed Nana that evening. The bank looked into it.',
  },

  /* c6 · Borrowing */
  c6a: {
    teach: 'Interest is <b>rent on money</b>. Save, and the bank pays you. Borrow, and you pay the bank. Which side are you on? That is what matters.',
    eg: 'Borrowing is nothing to feel bad about. It is a tool with a price. Find the price first.',
  },
  c6b: {
    teach: 'Sellers show you the small <b>monthly payment</b>. That is not the real cost. Add up <b>everything you pay back</b>. Then take away what you borrowed. That is the real cost.',
    eg: 'Borrow 1,000. Pay back 110 a month for a year. That is 1,320 in all. The loan cost 320.',
  },
  c6c: {
    teach: 'Borrowing can make sense for something that <b>earns or lasts</b>. A tool or a roof are like that. But borrowing for a treat that is gone by Friday? That is paying rent on a memory.',
    eg: 'Nana borrowed to buy umbrellas to sell. That loan made money. Her festival loan did not. She would still do it again.',
  },
  c6d: {
    teach: 'Lenders remember who paid them back. A good record makes borrowing cheaper. It is a <b>memory of what happened</b>, not who you are. And you can build it up again.',
    eg: 'Here it is the trust score. Pay back, and it goes up.',
  },
  c6e: {
    teach: 'Before you borrow, ask a question. Not “will they lend to me?” Ask <b>“will the payment fit in what is left each week?”</b> Check a slow week too. A payment you promised comes before a want.',
    eg: 'Bea gets 50 each week. Her costs are 30, so 20 is left. A payment of 12 fits, with 8 to spare. A payment of 25 does not fit.',
  },
  c6f: {
    teach: 'Lending to a friend is kind. It goes best with <b>three plain steps</b>. Only lend what you could manage without. Agree out loud when it comes back. Write it down where you can both see it.',
    eg: 'Chhoti borrowed 20 from Pip for a book. They wrote “20, back by Friday” in his notebook. On Friday, the 20 came back.',
  },

  /* c7 · Money that grows */
  c7a: {
    teach: 'Interest is added to your money. Next time, interest is added to <b>your money plus the interest</b>. That is called compounding. It is slow for a year, then it isn\'t.',
    eg: '100 grows by 10% each year. It goes 110, then 121, then 133. The jumps get bigger all by themselves.',
  },
  c7b: {
    teach: 'Things that <i>might</i> grow a lot can also fall a lot. That is one and the same idea. Safe things grow slowly. Big gains with no risk? Then someone is confused, or lying.',
    eg: 'Bo says up. Bea says down. Neither knows. Both are sure.',
  },
  c7i: {
    teach: 'A business can be cut into many equal pieces called <b>shares</b>. Own one share and you own a small slice of it. You get a slice of its profits. You also get a slice of its bad years. Its price goes up and down with what people think it will earn.',
    eg: 'A bakery is split into 100 shares. It makes 300 profit and pays it all out. Each share gets 300 ÷ 100 = 3.',
  },
  c7c: {
    teach: 'Own a slice of <b>many</b> things. Then one piece of bad news can\'t wreck you. Own just one thing, and your week depends on someone else\'s bad day.',
    eg: 'A basket with the whole market in it is boring. But boring wins more often than exciting.',
  },
  c7d: {
    teach: 'Money you need <b>next month</b> must be safe. It is fine if it hardly grows. Money you won\'t touch for <b>ten years</b> is different. It has time to get through bad times.',
    eg: 'Bus money and money for far away are different. They belong in different places.',
  },
  c7j: {
    teach: 'Put a small amount away <b>every week</b>. With time, it turns into a big amount. And starting early beats putting in more later. The first coins have the longest time to grow.',
    eg: 'Asha saves 20 a month, starting in January. Ravi starts in July. By December, before any growth, Asha has put in 240. Ravi has put in 120.',
  },
  c7e: {
    teach: 'A small fee taken <b>every year</b> costs more than the fee. It also costs what the fee would have grown into. Fees grow, just as money does.',
    eg: 'Two baskets grow the same amount. One takes a small fee every year. Years later, it is behind. It is behind by more than all the fees added up.',
  },
  c7f: {
    teach: 'Here is a quick way to guess how long money takes to <b>double</b>. Divide 72 by how much it grows each year. It is only a rough guess, not a promise. But it helps you picture slow growth.',
    eg: 'Say money grows by 6 each year for every 100. 72 ÷ 6 = 12. So it takes about twelve years to double.',
  },
  c7g: {
    teach: 'Some people jump out when prices fall, and jump back in when prices rise. It sounds clever. But nobody can do it well every time. <b>Staying in</b> through the bad weeks usually works better than guessing.',
    eg: 'Bo sold on a bad day. The week after, prices bounced back, and he missed it. Bea did nothing. She was fine.',
  },
  c7h: {
    teach: 'Most years, prices <b>creep up</b> a little. Money in a tin keeps its number. But it buys a bit less. To really grow, money must grow faster than prices.',
    eg: 'A snack costs 10 now. In a few years it might cost 11. The 10 in your tin is still 10. But it buys less.',
  },

  /* c8 · Running something */
  c8a: {
    teach: '<b>Revenue</b> is what came in. <b>Cost</b> is what you paid out. <b>Profit</b> is what is left. A busy shop with no profit is a tiring hobby.',
    eg: 'Sell 40 umbrellas at 20. That is 800 in. They cost 8 each. That is 320 out. Profit: 480.',
  },
  c8b: {
    teach: 'Too cheap, and you sell out but earn nothing. Too pricey, and you carry it all home. The right price is <b>the most people will happily pay</b>. You find it by trying.',
    eg: 'Mags put her buttons up from 8 to 12. She sold two fewer. But she made more money, and went home early.',
  },
  c8j: {
    teach: 'Before you make a hundred of something, <b>make a few</b>. Sell them. See what happens. Fix what did not work. Then make more. A small test costs a little. A big mistake costs a lot.',
    eg: 'Mags made 5 painted umbrellas, not 50. The blue ones sold in a day. The yellow ones did not sell. So next time, she made mostly blue.',
  },
  c8c: {
    teach: 'You can make a profit and <b>still run out of cash</b>. Profit is a month on paper. Cash is what is in your hand. And the stock bill needs cash.',
    eg: 'Nana\'s best month nearly closed her shop. The bill for new stock came before the money from sales did.',
  },
  c8d: {
    teach: 'Rent comes whether you sell or not. That is a <b>fixed</b> cost. Stock costs only come when you sell. That is a <b>variable</b> cost. Quiet weeks hurt, because fixed costs don\'t care.',
    eg: '200 rent a month is about seven a day. You pay it before you sell a thing.',
  },
  c8i: {
    teach: 'Profit after paying for materials is not the whole story. <b>Your own hours</b> went in too. Split the profit across your hours. Then you see what each hour really earned. Compare that with a job.',
    eg: 'Pip sold 10 bracelets at 9 each. The beads cost 3 each. Profit: 60. He worked 5 hours. 60 ÷ 5 = 12 an hour.',
  },
  c8e: {
    teach: 'First, a shop has to pay its fixed costs. Only then can it make a profit. The number of sales that covers those costs is called <b>break-even</b>. Every sale after that is profit.',
    eg: 'Rent is 240 a month. Each umbrella sells for 20 and costs 8. So each one leaves 12. 240 ÷ 12 = 20 umbrellas to break even.',
  },
  c8f: {
    teach: 'Finding a new customer takes work, every time. A customer who <b>comes back</b> costs almost nothing. Fair prices and honesty help a small shop grow.',
    eg: 'Nana\'s best customers have shopped with her for twenty years. She never tricked them.',
  },
  c8g: {
    teach: 'Stock you have not sold is <b>money stuck on a shelf</b>. It can\'t pay the rent. Some of it goes stale. Buy things that sell, and keep an eye on what does not.',
    eg: 'Mags bought fifty umbrellas when it was dry. Her money sat in a cupboard until it rained.',
  },
  c8h: {
    teach: 'Not all profit is yours to spend. Some must <b>stay in the shop</b>. It pays for next week\'s stock and gets you through quiet weeks. Owners split profit, just like jars split your pay.',
    eg: 'Nana keeps half her profit in the shop tin. She takes the other half home. The shop never runs out.',
  },

  /* the objectives' own stops (objectives.js NEW_CARDS) */
  'x-ch4': {
    teach: 'Two bags of the same rice. The big bag costs more, but that is not the real question. The real question is <b>what does one scoop cost</b> in each bag. Divide the price by how much is in the bag. Now you can compare them fairly.',
    eg: '600g costs ₹90. That is ₹15 for each 100g. 400g costs ₹56. That is ₹14 for each 100g. So the small bag is cheaper per scoop. The big bag hopes you won\'t check.',
  },
  'x-ch8': {
    teach: 'Buying now and saving up are both fine answers. To choose well, write down <b>both</b> sides. What extra do you pay if you buy now? What do you miss out on if you wait? Then pick. You will know why you chose.',
    eg: 'The kit costs ₹800. You have ₹500. If you wait three weeks, it costs ₹800. If you borrow, it costs ₹880. But you have it three weeks sooner. So eighty rupees is the price of three weeks. Sometimes that is worth it. Sometimes it is not.',
  },
  'x-ch10': {
    teach: 'Two offers hardly ever come in the same shape. One takes a set fee. One takes a slice. One is for a month. One is for a year. <b>To compare them, first change them into the same shape</b>: the same time, the same amount, the same units. Most bad deals last because nobody does this.',
    eg: 'Stall A takes ₹20 a week. Stall B takes 5% of what you sell. Sell ₹300 a week? Then B costs ₹15. B is cheaper. Sell ₹500? Then B costs ₹25. A is cheaper. The answer depends on you, not on the offer.',
  },
  'x-ch11': {
    teach: 'The worst time to decide about money is when something shiny is right in front of you. So don\'t decide then. Decide <b>before</b>. Make a rule when nothing is tempting you. Then in the shop, you are not deciding. You are just keeping a promise you already made.',
    eg: 'Your jar rule says three in ten goes to Save. On pay day, the rule runs. It is done before you have looked at anything. That is why it works.',
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
