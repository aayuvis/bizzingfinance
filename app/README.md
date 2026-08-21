# app/ — Bizzington

The Bizzing Finance web app. A town where a child earns, budgets, saves toward a building
they can watch go up, banks, borrows, invests and runs a shop — all with money that is
entirely simulated and entirely theirs.

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
```

## What's in it

| Surface | State |
|---|---|
| **The town** | Six buildings, drawn locked or open from the child's level. Panning street on phones. |
| **Learn** | 8 chapters · 32 cards · 30 levels · 5 ranks. Every card is a lesson, an example and one drill. |
| **Money Words** | A searchable 44-term glossary in plain English. |
| **Wallet** | Jobs on Market Row (one a day each), every movement dated, printable statement. |
| **Jars** | Spend / Save / Grow / Give, with a pay-day rule that fires by itself. |
| **Build Yard** | Goals as buildings, weeks-to-goal from the real saving rate, optional auto-save. |
| **Bank** | Weekly interest with the arithmetic shown, a loan whose **total cost appears before you agree**, weekly repayment, and a trust score. |
| **Exchange** | Four fictional companies replaying real market behaviour, an always-visible spread nudge, and the Time Machine. |
| **Bizz & Co** | Stock, pricing with real demand elasticity, weather, spoilage, rent, and a daily profit statement. |
| **Store** | Priced in the child's own money, every item showing its opportunity cost, optional 24-hour cooling-off. |
| **Arcade** | Needs vs Wants · Scam Spotter · Budget Blitz · Times Twelve · The Snowball · The Market Cup. Keyboard **and** touch on all six. |
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
| `src/arcade.js` | Six games. `twoChoice` and `quizGame` are shared shapes; the Market Cup is its own thing. |
| `src/main.js` | Shell, hash routing, overlays, and every `data-act` in one table. |
| `src/ui.js` `src/fmt.js` `src/art.js` | Dispatch, sound, confetti · currency and locale · the cast in SVG. |

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
