# app/ — Bizzington

The Bizzing Finance web app. **You live in Bizzington.** You have a room of your own, rent
that goes out on Friday whether the week went well or not, and a wage that grows as you
learn. From there: budget it, save, bank it, borrow, invest, run a shop — and climb until
your money pays for your life without you working.

All of it simulated, all of it yours. The house is fictional, which is exactly what lets the
app teach a household budget without ever asking a child about *their* household.

## Run it

```bash
cd app
npm install
npm run dev            # Vite dev server on :8080
```

No build step is required to develop — it is native ES modules — so a plain static server
works too:

```bash
python3 -m http.server 8080
```

(`file://` will not work: ES modules need an origin.)

```bash
npm run build          # -> build/    a static site for any host
npm run single         # -> dist/bizzington.html   one self-contained file
npm run deploy         # build + publish to the gh-pages branch
```

**Live:** <https://aayuvis.github.io/bizzingfinance/> — served from the root of the
`gh-pages` branch, the same way [bizzingindia.com](https://aayuvis.github.io/bizzingindia.com/)
is. `deploy.sh` replaces that branch's contents wholesale each time, so stale hashed assets
don't pile up, and drops a `.nojekyll` so GitHub serves `assets/` untouched. The one-file
build rides along at `/bizzington.html`.

## What's in it

| Surface | State |
|---|---|
| **Five worlds** | Market Row → the Old Harbour → Clocktower Square → the Exchange Quarter → the Works. Each has its own light, its own jobs going, its own games and one new money tool. You travel on when you have **finished the chapters where you are** — not when you have earned enough. |
| **The street** | Your own front door plus the buildings of the world you're standing in, drawn locked or open. Panning street on phones. |
| **Today's three** | Three daily quests rolled from the date, so every child in the house gets the same three. They pay wages into the same wallet — never a second currency. Clear all three for a bonus. |
| **Put it right** | The town is run down. Seventeen broken things across the five worlds, each paid for a bit at a time out of the same wallet, each permanently changing what you can do: a mended fountain buys the town a fourth daily quest, a lit pier creates night work, Nana's shutters create a job that pays every day forever. |
| **A store that sells capability** | A handcart is another job a day. A lockbox pays the Save jar before the bank exists. A coat makes bad weather pay. Two purely lovely useless things stay on purpose, priced beside them. |
| **Drawn artwork** | Five character portraits and five painted world backdrops, generated and embedded as WebP data URIs — 96 kB for the lot. `tools/art/` regenerates them. |
| **Your place** | The housing ladder: room → room with a window → flat → flat with a kitchen → a house you buy. Rent, bills and food derive from where you live; moving shows the new weekly total *before* you commit. A kitchen costs more rent and less overall, because it halves the food line. |
| **Independence** | "Rich" as a ratio, not a number: what your money earns each week ÷ what your life costs. At 100% you work because you choose to. Milestones at 10/25/50/100. |
| **Learn** | 8 chapters · 32 cards · 30 levels · 5 ranks. Every card is a lesson, an example and one drill. |
| **Money Words** | A searchable 44-term glossary in plain English. |
| **Wallet** | Jobs on Market Row (one a day each), every movement dated, printable statement. |
| **Jars** | Spend / Save / Grow / Give, with a pay-day rule that fires by itself. |
| **Build Yard** | Goals as buildings, weeks-to-goal from the real saving rate, optional auto-save. |
| **Bank** | Weekly interest with the arithmetic shown, a loan whose **total cost appears before you agree**, weekly repayment, and a trust score. |
| **Exchange** | Four fictional companies replaying real market behaviour, an always-visible spread nudge, and the Time Machine. |
| **Bizz & Co** | Stock, pricing with real demand elasticity, weather, spoilage, rent, and a daily profit statement. |
| **Store** | Priced in the child's own money, every item showing its opportunity cost, optional 24-hour cooling-off. |
| **Arcade** | Eleven games in three shelves. **Main Street** (the board game) · eight action games — Change Rush, Needs vs Wants, Scam Spotter, Budget Blitz, **Compound Climb** (hold to grow, and you can be wiped out), **Stall Rush** (sixty seconds of customers), **Market Storm** (a game whose winning move is inaction), The Market Cup · two quick drills. Keyboard **and** touch on every one. |
| **The postbox** | 22 letters; roughly one in six is a scam that looks exactly like the rest. |
| **Grown-up's page** | What they learned, what they *decided*, talk-together prompts, a printable week, Family Mode, multiple children, currency, mode, sound. |
| **PWA** | Manifest, icon, and a service worker that caches the shell. Installable, works offline. |

## Layout

| file | what it owns |
|---|---|
| `src/store.js` | **The seam.** All persistence. Two buckets — household (syncs one day) and device (never does) — plus a versioned `migrate()`. Nothing else touches storage. |
| `src/sim.js` | The money. Wallet, jars, goals, bank, loans, the Exchange, Bizz & Co, XP, badges, pay day, currency conversion, and the clock guard. |
| `src/content.js` | Curriculum, letters, jobs, glossary, shop, market, stock, badges — everything the app teaches. |
| `src/town.js` | Bizzington, drawn from the child's level. |
| `src/views.js` | Home · Learn · Money · Store · Progress · Parents · Collection. |
| `src/arcade.js` | The hub and ten games. `twoChoice` and `quizGame` are shared shapes; Change Rush, Compound Climb, Stall Rush, Market Storm and the Market Cup each own their loop. Games with a loop implement `mount()` / `stop()` — string rendering replaces the DOM every frame, so a live game re-attaches after each render rather than holding a stale node. |
| `src/board.js` | **Main Street** — the board game. Twenty squares, three players, chance cards that are real money events, and a win condition that is the Independence meter on a board: your shops pay for your life. Nobody goes bankrupt. |
| `src/main.js` | Shell, hash routing, overlays, and every `data-act` in one table. |
| `src/ui.js` `src/fmt.js` `src/art.js` | Dispatch, sound, confetti · currency and locale · the cast, drawn art with the hand-authored SVG as fallback. |
| `src/art-gen.js` | Generated. Portraits and plates as data URIs. Rebuild with `tools/art/process.py`, never hand-edit. |

`state → render()` returning a string, clicks dispatched by `[data-act]` — the Bizzing Bee
idiom, kept deliberately. Views never compute money; `sim.js` does.

## Rules this code keeps

- **No real money anywhere.** No card, no bank link, no payment form on a child's screen.
- **No real security is named as a thing to buy.** Fictional companies, real behaviour.
- **No gambling mechanics.** No loot box, no paid spin, no randomised reward. The Market Cup
  ranks on *cup score* — return **plus** diversification **plus** steadiness — because a
  leaderboard sorted by return alone tells a child the luckiest bet was the best decision.
- **One currency.** Games pay wages into the same wallet the store spends from.
- **Both keyboard and touch** on every game.
- **Nothing is gated on an XP number.** Every surface and every game names the chapter that
  opens it (`UNLOCKS` in `content.js`), and the locked state says which one. Education first,
  then the tool — the Exchange cannot open before a child knows what a share is.
- **Quests advance from exactly one call site per kind** (`questTick`), so a quest can never
  be advanced twice by the same action.
- **A perk names the job it creates.** `adds:` on a fix or a shop item, never "add the jobs
  this world already has" — that made the handcart a no-op the first time round.
- **Backdrops are plates, buildings are SVG.** The buildings carry live state — jar levels,
  goal progress, the bank clock — so they cannot be painted.
- **The art tooling never sees a committed key.** `GKEY` is an env var; `tools/art/*.png` and
  every key pattern are gitignored.
- **Bills are derived from where you live**, never invented. `refreshBills()` is the only thing that writes them.
- **Percentages are a display format.** The Jar Shed shows "1 coin in every 4" below level 11 and "25%" above it — same jar, same lesson, two ages (docs/03 §5).
- **Option order is permuted from the card id** (`shuffledDrill`) — position leaks an answer
  as surely as text does.
- **No number without a source.** Everything on screen is Bizzington's own arithmetic; no
  real rate, return or company appears anywhere.

## Known gaps

- **The sim clock is client-side.** It refuses to run backwards (winding the device clock
  back holds the date and shows a notice), but it must move to the server before launch —
  otherwise week one teaches a child that the way to get money is to cheat time.
- **No accounts.** One household per browser, `localStorage` only. Supabase + RLS is the
  next structural piece, and `store.js` is the seam it goes behind.
- **Entitlements do not exist yet** — everything is unlocked by level, nothing by payment.
- No audio narration; the cast speaks in text. Bizzing Bee's bundled-clip pattern is the model.
- Sprout mode hides the market and debt and cannot go negative, but the *reading level* is
  not yet differentiated.
- The Market Cup replays one authored season. A shipping build wants many.
- Main Street is you plus two bots. Pass-and-play for two to four humans is the
  obvious next step and the rules already allow it.
- **Only the Jar Shed switches representation so far.** The bank rate, the store's ten-year
  line and the Exchange's percentage moves still assume percent — docs/03 §1 says every one of
  them must be sayable in coins.
- The portfolio is still a Buy button, not the five-question builder in docs/03 §6.
