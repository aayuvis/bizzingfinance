/* gamelist.js — the arcade's catalogue and its action names, without the games.
   Home, search, My Feed and the Play tab's door need to know what games exist; only
   playing one needs arcade.js (and board.js and the canvas kit behind it), so that is
   loaded on demand and the first screen does not carry it. */
/* The Play tab is ten cards in three groups (docs/12 §3, T16): two flagships (Stall of My
   Own here, the Market Game on its own route), four Train games and four Play games. */
export const GROUP = { so: 'flagship', sc: 'train', mp: 'train', cc: 'train', sb: 'train', cr: 'play', st: 'play', mc: 'play', mn: 'play' };
export const GAMES = [
  /* a flagship (docs/12 §2.1): a season of eight weeks, so it gets the big cover at the top */
  { id: 'so', em: '🛒', name: 'Stall of My Own', keys: '1–4 · R · ⏎', kind: 'flagship', needs: 'c3',
    blurb: 'Eight weeks on Market Row: buy the stock, set the prices, save for a better cart — and find out that busy is not the same as profitable.' },
  { id: 'cr', em: '🪙', name: 'Change Rush', keys: '← →', kind: 'action', needs: null,
    blurb: 'Coins are falling and you need exactly the right amount. Catch one too many and you have overpaid.' },
  /* Train (docs/12 §2.2, §2.3): Smart Choices is Needs vs Wants and Scam Spotter as two modes of one
     card, plus Better Buy; the Month Planner is Budget Blitz rebuilt, with Times Twelve's yearly sum in it */
  { id: 'sc', em: '⚖️', name: 'Smart Choices', keys: '1 2 3 · ← ↓ →', kind: 'drill', needs: null,
    blurb: 'Need, want — or both, and why? Real, or a trap? Which tag is cheaper per item?' },
  { id: 'cc', em: '🗼', name: 'Compound Climb', keys: 'hold space · ↑↓ ⏎', kind: 'action', needs: 'c6',
    blurb: 'Hold to grow the tower. Hold longer for more — and past a point it can go backwards, and you can be wiped out.' },
  { id: 'st', em: '⛈️', name: 'Market Storm', keys: '1 2 3 · space', kind: 'action', needs: 'c7',
    blurb: 'Write your plan, then live through the storm: everything red, everyone shouting sell. Keep to your plan, and read the news.' },
  { id: 'mc', em: '🏆', name: 'The Market Cup', keys: '↑↓←→ ⏎', kind: 'action', needs: 'c7',
    blurb: 'Six weeks against Chaser, Panicker and Boring Bella. Bella is annoying.' },
  { id: 'mn', em: '🎲', name: 'Main Street', keys: '⏎ · Y/N', kind: 'board', needs: 'c1',
    blurb: 'The board game. Buy the shops, collect the rent, and win when your street pays for your life — nobody goes bankrupt.' },
  { id: 'mp', em: '🗓️', name: 'Month Planner', keys: '1 2 · 0–9', kind: 'drill', needs: 'c3',
    blurb: 'Three months of bills. Needs first, a little kept back — and what does one cost a year?' },
  { id: 'sb', em: '🏦', name: 'Save or Borrow?', keys: '0–9 · 1–4', kind: 'decision', needs: 'c5',
    blurb: 'Three things you want, a wage, and a few ways to get each. What does borrowing cost in all — and when is it worth it?' },
];

export const GAME_ACTS = ['mcAdj', 'mcNext', 'mcSel',
  'crLane', 'crGo', 'stSell', 'stPlan', 'stGo', 'stRule', 'stWhy',
  'ccHold', 'ccRelease', 'ccEst', 'ccEstStep', 'srServe', 'srStock',
  /* Smart Choices (smartchoices.js) and the Month Planner (monthplanner.js) */
  'scMode', 'scSide', 'scChip', 'scCall', 'scTell', 'scShelf', 'scKey', 'scCheck', 'scNext',
  'mpPay', 'mpSkip', 'mpKey', 'mpCheck', 'mpNext',
  /* Stall of My Own (stall.js) */
  'soGoal', 'soBuy', 'soStep', 'soJar', 'soOffer', 'soOpen', 'soAuto', 'soServe', 'soStock', 'soNext', 'soNew', 'soSel',
  'mnRoll', 'mnBuy', 'mnPass', 'mnCard', 'mnEnd',
  /* the Shift engine (jobgames.js) — a job is a shift of money decisions, not a button */
  'jgPick', 'jgCoin', 'jgUndo', 'jgGive', 'jgDigit', 'jgDel', 'jgEnter', 'jgNext', 'jgTier', 'jgStart', 'jgLevel',
  /* Save or Borrow? (saveborrow.js) */
  'sbKey', 'sbCheck', 'sbPath', 'sbCushion', 'sbSkip', 'sbAns', 'sbNext'];

/* the games that took over an old card wear its painting until they have their own, and an old
   link to a retired card (a bookmark, a feed card) opens the one that absorbed it */
export const COVER_ALIAS = { sc: 'nw', mp: 'bb' };
export const RETIRED = { nw: 'sc', ss: 'sc', bb: 'mp', tt: 'mp', sn: 'cc', sr: 'so' };
