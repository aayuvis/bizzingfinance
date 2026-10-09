/* gamelist.js — the arcade's catalogue and its action names, without the games.
   Home, search, My Feed and the Play tab's door need to know what games exist; only
   playing one needs arcade.js (and board.js and the canvas kit behind it), so that is
   loaded on demand and the first screen does not carry it. */
export const GAMES = [
  /* a flagship (docs/12 §2.1): a season of eight weeks, so it gets the big cover at the top */
  { id: 'so', em: '🛒', name: 'Stall of My Own', keys: '1–4 · R · ⏎', kind: 'flagship', needs: 'c3',
    blurb: 'Eight weeks on Market Row: buy the stock, set the prices, save for a better cart — and find out that busy is not the same as profitable.' },
  { id: 'cr', em: '🪙', name: 'Change Rush', keys: '← →', kind: 'action', needs: null,
    blurb: 'Coins are falling and you need exactly the right amount. Catch one too many and you have overpaid.' },
  { id: 'nw', em: '⚖️', name: 'Needs vs Wants', keys: '← →', kind: 'action', needs: null,
    blurb: 'Need or want? Sort each one, and see why. Some are both, and those are the good ones.' },
  { id: 'ss', em: '🛡️', name: 'Scam Spotter', keys: '← →', kind: 'action', needs: null,
    blurb: 'Real message or trap? They are designed to look identical.' },
  { id: 'bb', em: '💸', name: 'Budget Blitz', keys: '1 2', kind: 'action', needs: 'c3',
    blurb: 'A month of money, and the bills arrive one at a time.' },
  { id: 'cc', em: '🗼', name: 'Compound Climb', keys: 'hold space', kind: 'action', needs: 'c6',
    blurb: 'Hold to grow the tower. Hold longer for more — and past a point it can go backwards, and you can be wiped out.' },
  { id: 'sr', em: '🫖', name: 'Stall Rush', keys: '1–4 · R', kind: 'action', needs: 'c3',
    blurb: 'Sixty seconds of customers. Serve them, restock, and find out whether busy and profitable are the same thing.' },
  { id: 'st', em: '⛈️', name: 'Market Storm', keys: 'space', kind: 'action', needs: 'c7',
    blurb: 'Everything is red and everyone is shouting sell. The winning move is to do nothing, and it is much harder than it sounds.' },
  { id: 'mc', em: '🏆', name: 'The Market Cup', keys: '↑↓←→ ⏎', kind: 'action', needs: 'c7',
    blurb: 'Six weeks against Chaser, Panicker and Boring Bella. Bella is annoying.' },
  { id: 'mn', em: '🎲', name: 'Main Street', keys: '⏎ · Y/N', kind: 'board', needs: 'c1',
    blurb: 'The board game. Buy the shops, collect the rent, and win when your street pays for your life — nobody goes bankrupt.' },
  { id: 'tt', em: '🗓️', name: 'Times Twelve', keys: '1–4', kind: 'drill', needs: 'c4',
    blurb: 'Small monthly numbers, turned into the number that is actually true.' },
  { id: 'sn', em: '❄️', name: 'The Snowball', keys: '1–4', kind: 'drill', needs: 'c6',
    blurb: 'Guess where compounding lands. Nobody guesses high enough.' },
];

export const GAME_ACTS = ['nwNeed', 'nwWant', 'ssSafe', 'ssScam', 'tcNext', 'bbPay', 'bbSkip',
  'ttPick', 'ttNext', 'snPick', 'snNext', 'mcAdj', 'mcNext', 'mcSel',
  'crLane', 'crGo', 'stSell', 'stPlan', 'stGo',
  'ccHold', 'ccRelease', 'srServe', 'srStock',
  /* Stall of My Own (stall.js) */
  'soGoal', 'soBuy', 'soStep', 'soJar', 'soOffer', 'soOpen', 'soAuto', 'soServe', 'soStock', 'soNext', 'soNew', 'soSel',
  'mnRoll', 'mnBuy', 'mnPass', 'mnCard', 'mnEnd',
  /* the job games (jobgames.js) — a job is a game now, not a button */
  'jgDrop', 'jgPort', 'jgStar', 'jgLeft', 'jgRight', 'jgLane', 'jgTier', 'jgStart', 'jgLevel'];
