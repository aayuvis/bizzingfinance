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
| **The postbox** | 25 letters; roughly one in six is a scam that looks exactly like the rest. Some have a fuse: a choice on Tuesday lands on Saturday. |
| **The companion** | Five who need homes — puppy, kitten, parrot, bunny, duckling — three growth stages, three moods, a wardrobe of priced wants. Adoption costs once and food is a weekly bill from the same wallet. Poorly only when that bill went unpaid on pay day; never for a missed day; never dies. [docs/10](../docs/10-the-three-motivators.md). |
| **Keepsakes & the morning after** | The first thing she buys is kept as a receipt in the Collection — the item, the shifts that paid for it, the weeks it took, counted from her ledger. On a new day Home opens with what is *waiting*: a letter, the bell, the companion by the door, the board. Never what she lost. |
| **Grown-up's page** | What they learned, what they *decided*, talk-together prompts, a printable week, Family Mode, multiple children, currency, mode, sound. |
| **PWA** | Manifest, icon, and a service worker that caches the shell. Installable, works offline. |

## Layout

| file | what it owns |
|---|---|
| `src/store.js` | **The seam.** All persistence. Two buckets — household (syncs one day) and device (never does) — plus a versioned `migrate()`. Nothing else touches storage. |
| `src/sim.js` | The money. Wallet, jars, goals, bank, loans, the Exchange, Bizz & Co, XP, badges, pay day, currency conversion, and the clock guard. |
| `src/content.js` | Curriculum, letters, jobs, glossary, shop, market, stock, badges — everything the app teaches. |
| `src/town.js` | Bizzington, drawn from the child's level; the companion walks the street at its current stage and mood. |
| `src/companion.js` | The creature. Adoption, the food bill, care that moves only on pay day, growth, the wardrobe, play. Every rupee goes through `sim.js`. |
| `src/companionview.js` `src/companions-gen.js` | The figure with what it wears (accessories at anchors **measured from the sprite's alpha**), the shelter, the wardrobe, the Home card · generated sprites, 45 + 6, rebuilt by `tools/art/process-companions.py`. |
| `src/keepsakes.js` | The receipt slip and the overnight card. |
| `src/views.js` | Home · Learn · Money · Store · Progress · Parents · Collection. |
| `src/arcade.js` | The hub and ten games. `twoChoice` and `quizGame` are shared shapes; Change Rush, Compound Climb, Stall Rush, Market Storm and the Market Cup each own their loop. Games with a loop implement `mount()` / `stop()` — string rendering replaces the DOM every frame, so a live game re-attaches after each render rather than holding a stale node. |
| `src/board.js` | **Main Street** — the board game. Twenty squares, three players, chance cards that are real money events, and a win condition that is the Independence meter on a board: your shops pay for your life. Nobody goes bankrupt. |
| `src/main.js` | Shell, hash routing, overlays, and every `data-act` in one table. |
| `src/ui.js` `src/fmt.js` `src/art.js` | Dispatch, sound, confetti · currency and locale · the cast, drawn art with the hand-authored SVG as fallback. |
| `src/art-gen.js` | Generated. Portraits and plates as data URIs. Rebuild with `tools/art/process.py`, never hand-edit. |
| `src/hero.js` | The screen header: where you are, in type, with the place painted beside it and the one number that matters. Every top-level screen opens with one. |
| `src/companion.js` `src/companionview.js` `src/keepsakes.js` | The creature she raises (docs/10), how it is drawn and dressed, and the things she keeps — the first receipt, the morning after. |
| `src/buildings-gen.js` `src/companions-gen.js` `src/covers-gen.js` | Generated. Painted building sprites with measured zones, 45 companion sprites with measured accessory anchors, and a painted cover per Arcade game. `tools/art/` regenerates each; never hand-edit. |

`state → render()` returning a string, clicks dispatched by `[data-act]` — the Bizzing Bee
idiom, kept deliberately. Views never compute money; `sim.js` does.

## Rules this code keeps

- **Paper on a ground, and rows inside it — never a box inside a box.** The page is the
  world's tint with the family's dot motif; a card is a sheet lifted off it, without a
  border. Inside a card the day is ROWS (`.qrow`, `.jbeat`) separated by hairlines, an icon
  in a tinted well, and at most one filled row: the thing to do now. A journey is a DOOR —
  the building itself, painted, on the journey's tint — with its rows beneath. Bee and
  India set this language; a grid of bordered tiles is a dashboard, and Home is a street.

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
- **The curriculum lives in `objectives.js`, and it is data.** An objective is written as a
  behaviour you could watch. `surface` is mandatory and `validate()` fails the build without it.
- **A check is not evidence.** The question straight after a teaching card measures attention
  ninety seconds old and is never reported. Only retrieval at a gap of a week or more, and
  transfer on a surface it was not taught on, count as learning — `ledger.answer()` keeps the
  two doors apart and that separation is the point of the module.
- **A declared `transfer` surface that nothing records is a lie.** `INSTRUMENTED` lists the
  surfaces that actually call `mastery.transfer()`, and `validate()` fails on any objective
  naming one that is not in it — so the data and the code cannot drift.
- **Lapses are reported.** A parent report that only ever goes up is a marketing document.
- **The parent report never contains a streak, a leaderboard, a percentile, a comparison with
  another child, or anything asking for more screen time.**
- **A day has an end, and it is measured.** Closing time only appears once the day's
  quests are claimed, and every line on it is arithmetic off today's ledger. If a number of
  days cannot be measured, print the amount instead — never invent the days.
- **A mended thing stands in the street with the child's name on it.** The deed verge is the
  only permanent mark anyone leaves on the town; adding it makes the town taller, never
  smaller.
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
- Only the **first receipt** is a keepsake so far. The first pay slip, the first statement and the season finales in docs/08 are the same shape and not yet objects.
- Sprout mode hides the market and debt and cannot go negative, but the *reading level* is
  not yet differentiated.
- The Market Cup replays one authored season. A shipping build wants many.
- Main Street is you plus two bots. Pass-and-play for two to four humans is the
  obvious next step and the rules already allow it.
- **Only the Jar Shed switches representation so far.** The bank rate, the store's ten-year
  line and the Exchange's percentage moves still assume percent — docs/03 §1 says every one of
  them must be sayable in coins.
- The portfolio is still a Buy button, not the five-question builder in docs/03 §6.
