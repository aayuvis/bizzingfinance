# 01 — The Tabs

The first build spec. Seven tabs, one drawer, one persistent simulator underneath all of
them. Read [CONCEPT.md](../CONCEPT.md) first — especially §3 (one currency, the weekly
clock) and §6 (the money-specific hard rules), because several tabs below only make sense
as consequences of those.

---

## 0. Inheritance — what we take from Bizzing Bee

Bizzing Bee's shell is proven on a real 9-year-old across a real year, so we take its
shape and change the content spine. Its top nav is
`Home · Practice · Explore · Arcade · Store · Progress · Collection`, with a 5-slot mobile
bar and a drawer for everything else.

| Bizzing Bee | Bizzing Finance | What changed and why |
|---|---|---|
| **Home** — streak, Champion's Quest, jump back in | **Home** — same, plus the money strip and Pay Day | Home gains a permanent net-worth line; the app's core fact must be visible on open. |
| **Practice** — Word Coach, lists, Level ladder | **Learn** — lesson cards, chapters, the rank ladder | Same ladder machine. Drills are decisions rather than spellings. |
| **Explore** — Concepts, Journeys, Themes shelves | folded into **Learn** as shelves | We don't have three parallel content pillars; one ladder plus reference shelves is honest. The freed tab slot goes to Money. |
| — | **Money** — the simulator | **The new tab, and the whole product.** Nothing in Bizzing Bee corresponds; the nearest relative is Bizzing India's Living Map: the home object that is simultaneously the content, the progress bar and the reward. |
| **Arcade** — 6 games + Boss Battle | **Arcade** — 8 games + Bizzopoly + Beat the Market | Same role. Two of ours are long-form (a season, a board game), which Bizzing Bee has no analogue for. |
| **Store** — cosmetics for 🪙 coins | **Store** — cosmetics for **the child's own money** | Same screen, inverted meaning. In Bizzing Bee the store is the reward; here it is the temptation, and it is curriculum. |
| **Progress** — child progress + parent dashboard | **Progress** — same + net worth over time + Family Mode | Adds the one chart no other kids' app can draw: a real balance history. |
| **Collection** — badges, avatar evolution | **Collection** — badges, Pip's evolution, company cards, world money | Same. |
| Drawer — tools, family corner, settings | Drawer — glossary, Parents, Settings, Saga | Same. |

Two rules inherited verbatim and non-negotiable: **every game needs both keyboard and touch
controls**, and **never leak the answer in on-screen text**.

---

## 1. The shell

```
Topbar   [☰]  Bizzing Finance   ·  Wallet ₹840  ·  🔥 12  ·  [🔍]  [☀/☾]  [⚙]
Top nav  Home · Learn · Money · Arcade · Store · Progress · Collection
Drawer   Glossary · Money Safety · Saga · Parents · Settings · Help
```

- **The money strip in the topbar is not a coin balance.** Tapping it opens Money, not the
  Store — the number is the child's life, not their spending power. (Bizzing Bee's coin chip
  opens the shop; ours must not, or we've built a shop-first app.)
- **Mobile bar (5 slots):** `Home · Learn · Money · Arcade · More`. Store, Progress and
  Collection live behind More. Money keeps a bar slot at every rank because it is the one
  surface a child opens without being sent there.
- **Sprout mode collapses the nav to four:** `Home · Learn · Money · Play`. No Store tab
  (the store lives inside Money, one screen, three items), no Progress tab (it's the
  parent's, and it's in the drawer). Everything on screen is also spoken.

---

## 2. Home — the street

**Home is Bizzington itself**, drawn side-on like a picture-book street and growing as you
climb — see [docs/02](02-the-world.md). Every building is a surface of the Money tab, and
locked ones are *drawn, not hidden*, with their rank on the door. Under the street sits the
daily hub: what should I do right now, and how am I doing, in one line.

| Block | What it is |
|---|---|
| **Money strip** | `Wallet · Saved · Invested · Net worth`, four numbers, always the top of the screen. In Sprout mode: `Wallet · Saved` only. |
| **Pay Day counter** | "Pay day in 3 days — ₹200 due out for the phone plan." The weekly clock made visible; this is what creates the habit of *planning*, which no quiz can teach. |
| **Today** | One 3-minute task chosen by the engine: the next lesson, a drill on a weak skill, a decision waiting in the sim, or a portfolio check-in. One card, one button. |
| **The postbox** | One letter a day, from somebody in town: a job, a bill, a dilemma, a pitch from Mags — and roughly one in seven is a **scam that looks exactly like the others**, because that is the lesson. Thirty seconds, and it always lands somewhere in the sim. |
| **Money Moment** | The daily dilemma, delivered as that letter. *"You have ₹200. The bus is ₹40 each way and your friends want to split a ₹300 pizza. What do you do?"* Two to four answers, none of them wrong-and-punished, each with a consequence shown after. This is the Daily Buzz analogue and the single most shareable object in the app. |
| **Streak** | 🔥 calendar, inherited from Bizzing Bee including the 3/7/14/30-day milestones — but milestones pay a **bonus wage**, not a special currency (CONCEPT §3.1). |
| **Jump back in** | Last lesson, last game, unfinished Bizzopoly. |
| **Alerts** | A bill is due · a goal is reached · the market moved more than X% · **a scam has arrived in your inbox** · Mags wants something. |

---

## 3. Learn

The ladder plus the reference shelves. This is Bizzing Bee's Practice + Explore in one tab.

### 3.1 The ladder (the main column)

Five ranks → ~30 levels → ~180 lesson cards in ~30 chapters (see CONCEPT §4). Each chapter:

1. **Card 1 is an animated explainer narrated by Pip** — the exact pattern Bizzing Bee
   proved: audio pre-recorded and bundled so it plays instantly, fully offline, never the
   robotic browser voice, with every scene's animation timed to its narration.
2. Then worked examples and cards, with the vocabulary introduced in place.
3. Then a **drill** — keyboard and touch, and it is a *decision*, not a definition.
4. Then **"Try it for real →"**, which deep-links into the Money tab with a task attached
   ("set your jars for this week", "buy one fund", "cancel a subscription you don't use").
   **A level is cleared in the simulator, never on the quiz.**

### 3.2 Shelves (below the ladder)

| Shelf | What's on it |
|---|---|
| **Money Words** | The glossary — searchable, spoken, ~300 terms from *change* to *expense ratio*. Bizzing Bee's Word Finder, re-pointed. Every term a lesson uses is here, and every term here has a one-line kid definition and a grown-up one. |
| **How Things Work** | Illustrated explainers of the machinery: a bank · a debit card · a stock exchange · an index fund · a payslip · a tax · an insurance policy · a loan · a subscription. |
| **Money Safety** | Scams, phishing, "free" in-game currency, pressure from friends, what to do when something feels wrong, and who to tell. First-class, not a footnote — these are the financial events a 10-year-old will actually meet this year. |
| **True Stories** | Sourced, always (CONCEPT §6.5): what compounding did over 40 years · the tulip bubble · why prices go up · what happened in 2008, told for a 12-year-old. `sources[]` on every card, no exceptions. |
| **Ask a Grown-Up** | Talk-together prompts, borrowed from Bizzing India's *"ask your family"* idiom: "Ask someone at home about the first thing they ever saved up for." Nothing is recorded; the app never asks the child about their family's finances. |

---

## 4. Money — the simulator

**The signature tab.** One persistent object, revealed one sub-tab at a time. Every locked
sub-tab is **visible from day one, greyed, with its unlock rank on it** — the aspiration is
half the motivation, and it is how the child sees the road from "counting change" to
"managing a portfolio" on their first afternoon.

```
Money    [ Wallet ] [ Jars ] [ Goals ] [ Bank 🔒 L11 ] [ Portfolio 🔒 L16 ] [ Business 🔒 L23 ]
```

### 4.1 Wallet — *Saver, Level 1*
Cash in hand, and a real transaction list. Earn (jobs, chores, game wages, pay day), spend,
and every line is dated and categorised. Sprout mode draws it as actual coins and notes in
the child's own currency. **No negative balance in Sprout mode** — there is no debt before
it is taught.

### 4.2 Jars — *Budgeter, Level 6*
Four jars: **Spend · Save · Grow · Give**. Drag to allocate on pay day, or set percentage
rules and let it happen automatically ("pay yourself first" as a mechanic, not a slogan).
A live **plan vs actual** bar for the week. Overspending a jar isn't blocked — it's shown,
and it borrows visibly from another jar, which is the lesson.

*Give* is a jar because generosity is a financial skill and every household that will use
this app believes so, whatever else they disagree about. What it funds is a list of
fictional in-world causes; **no real charity, no real payment.**

### 4.3 Goals — *Budgeter, Level 8*
Name a thing, price it, and the app computes **weeks-to-goal from the child's actual saving
rate** — the most motivating number in the whole product, and it moves every time they
decide something. Thermometer, auto-transfer on pay day, and a "what if I saved ₹20 more a
week" slider. Spending the goal fund is allowed, and the thermometer visibly falls back.

### 4.4 Bank — *Banker, Level 11*
A savings account that **ticks interest every sim week**, with the arithmetic shown, not
hidden. A debit card for in-sim purchases. Monthly **statements** — real ones, printable,
because reading a statement is a life skill and nobody teaches it. An optional small loan
with the total cost of borrowing displayed **before** you take it and a repayment schedule
after. A "trust score" that rises with repayment — the credit-score analogue, explained as a
memory, never as a judgement of the person.

### 4.5 Portfolio — *Investor, Level 16*
The tab the whole ladder is climbing toward, and the one governed hardest by CONCEPT §6.2.

- **Fictional companies, real behaviour.** Holdings are invented companies and funds whose
  price series replay real historical market behaviour. Volatility is honest; no child and
  no parent is ever nudged toward a real security.
- **Research card per company** — what it sells, how it makes money, what could go wrong,
  its risk band. Collectible (they land in Collection), so the research *is* the reward.
- Buy / sell, holdings table, an **allocation donut**, return vs a benchmark, dividends, and
  a **fees line that is always visible** — fees are invisible in real life, which is exactly
  why they belong on screen here.
- **"Why did it move?"** — Bo and Bea explain, and disagree, on every notable move.
- **The Time Machine** — fast-forward this portfolio 1 / 5 / 10 / 30 years. The only place
  the clock is compressed, and the only way compounding can be felt rather than asserted.
- **Sprout mode never sees this tab.** Locked and unmentioned below age band.

### 4.6 Business — *Founder, Level 23*
Nana Bizz's stand, handed over. Set a price, buy inventory, watch demand respond, discover
that **profit and cash are not the same thing** the first time a restock is due before the
sales land. Grows into a second stall, a hire, a small loan, a tax bill and an insurance
decision. This is where Bizzopoly's lessons become a system the child runs themselves.

### 4.7 Statements & history (always available)
Every transaction, searchable and filterable, with a monthly statement view that prints.
Also the child's **net worth chart** — the artefact that makes a two-year subscription feel
like an inheritance rather than a bill.

---

## 5. Arcade

Short games pay a **wage** into the wallet (CONCEPT §3.1) — never a special currency, and
never enough to make grinding beat the ladder.

### 5.1 The two big ones

**Beat the Market** — the marquee, and the one the whole design of §6.3 exists to protect.
An 8-week season. You allocate a fixed starting stake across funds and companies, then live
through the season with weekly events.

Scored on **three** axes, deliberately:
1. return against the index,
2. **diversification**,
3. **rule-keeping** — did you panic-sell, chase a spike, or skip your rebalance.

You compete against Bo, Bea and three bots: **Chaser** (buys whatever went up),
**Panicker** (sells on red), and **Boring Bella** (buys the index and does nothing).
Boring Bella usually wins, and the leaderboard teaches that with no lecture attached. A
game that scored only on returns would have taught a child to gamble.

**Bizzopoly** (working title — *Main Street*) — the board game, 2–4 players, pass-and-play
plus AI, ~25 minutes, family mode on a tablet.

The rewrite that matters: **you do not win by bankrupting everyone.** You win by being first
to the point where **your assets cover your expenses** — passive income beats the wage. That
change alone makes the game shorter, kinder, and about the thing we're actually teaching.
Chance cards are real money events, not whimsy: a cracked screen (insurance covers it *if*
you bought it), a friend asking for a loan, a sale on the thing you wanted, a bonus, a rent
rise. Every card is a lesson the child will meet again in Learn.

### 5.2 The short games

| Game | Teaches | Mode |
|---|---|---|
| **Change Maker** | Counting money, making change, denominations of the chosen currency | Sprout |
| **Needs vs Wants** | Sorting under a timer — with genuinely ambiguous cards that open a conversation instead of scoring | Both |
| **Budget Blitz** | 60 seconds to allocate a month's money as bills fly at you | Both |
| **Scam Spotter** | Spot the phishing text, the fake giveaway, the "free" offer, the friend-in-trouble message | Both |
| **Compound Climb** | A climber whose platforms grow at the interest rate you pick — exponential growth as a physical feeling | Builder |
| **Price Check** | Guess the price; then/now pairs teach inflation and value | Both |
| **Trade-Off** | Two options, pick one, see the 1-year and 10-year consequence | Builder |
| **Market Storm** | Survive a crash. **The win condition is not panic-selling** — the Boss Battle analogue, and the hardest lesson in the app | Builder |

No game in this app may use a randomised paid reward, a spin, a loot box, or a
double-or-nothing (CONCEPT §6.3). If a game idea needs one to be fun, it is the wrong game
for this product.

---

## 6. Store

The same screen as Bizzing Bee's shop, with the meaning inverted. Here the store is **the
temptation engine, and it is curriculum.**

- Avatar and den cosmetics, worlds/themes, extra lesson packs. Priced in **the child's own
  simulated money** — the same money the goal needs and the portfolio wants.
- **Every item shows its opportunity cost, before the buy button:**
  > *Golden helmet — ₹600*
  > *That's 3 weeks of your allowance · or ₹1,940 in 10 years if you invested it instead.*
  Not a warning, not a guilt trip. A number. Then the child decides, and gets the helmet if
  they want it — a store you can never buy from teaches nothing.
- **Think-it-over** — an optional 24-hour cooling-off on purchases over a threshold, which a
  parent can enable in Family Mode. Impulse control delivered as a mechanic rather than a
  lecture.
- **Nothing here costs real money, ever.** Premium is bought by the parent in the Parents
  area. There is no path from a child's screen to a payment form (CONCEPT §6.8).

---

## 7. Progress

### 7.1 Child view
Rank and level per pillar, streak, a skills heatmap (which concepts are shaky), badges, and
the **net worth chart over time** — the one chart no card app can draw, because they only
have the last statement and we have every decision since the child was nine.

### 7.2 Parent dashboard
The buyer's screen, and the reason the subscription renews:

- **What they learned this week** — chapters cleared, in plain English.
- **What they struggled with** — the skills heatmap read as sentences.
- **What they decided** — the sim is a window into a child's instincts that no quiz gives
  you: they spent the goal fund twice this month; they sold everything in the dip; they've
  been saving 40% for six weeks. Reported as observation, never as a grade on the child.
- **Talk-together prompts** generated from those decisions.
- **Printable weekly report**, matching Bizzing Bee's 🖨 one-pager.
- **Family Mode settings** — allowance amount and pay day, the chore list, currency,
  cooling-off threshold, whether Bank/Portfolio are unlocked early. All manual; **no bank
  connection, no real money** (CONCEPT §8).

---

## 8. Collection

| Shelf | What |
|---|---|
| **Badges** | Milestones, inherited from Bizzing Bee including the celebration card that a child screenshots. |
| **Pip's evolution** | The avatar evolves with rank, exactly as Bizzy does across 20 levels. |
| **Company cards** | The research cards from Portfolio, collected. The collectible *is* the homework. |
| **World money** | Real notes and coins of the world, unlocked by play — the cultural tie-in with Bizzing India, and a quiet way to teach that money is an agreement rather than a law of nature. |
| **Trophies** | Bizzopoly seasons, Beat the Market finishes, streak milestones. |

---

## 9. Drawer

Glossary (Money Words) · Money Safety · **Saga** (see below) · Parents · Settings · Help ·
Search. The top nav answers *where am I*; the drawer answers *what else can I do from here*
— the distinction Bizzing Bee's drawer comment makes explicitly, and it's a good one.

**The Saga** — every Bizzing app has a story mode (*Bizzy & the Great Unspelling*, *Gattu &
the Great Forgetting*). Ours is **Phase 3, not launch**, and it should be the Founder arc
told as a story: Nana Bizz's shuttered stand, a town that stopped trading, and Pip walking
it back to life one decision at a time — with Mags as the pull toward the fast, shiny,
expensive answer at every act break. It reuses the saga machine from Bizzing Bee (`ACTS` →
chapters → playable engines → dialogue scripts), which makes the engine work portable.

---

## 10. What unlocks when — the whole map on one page

| Rank | Level | Tab / surface unlocked |
|---|---|---|
| — | start | Home · Learn · **Money → Wallet** · Arcade (3 games) · Collection |
| Saver | 1–5 | Change Maker, Needs vs Wants, Money Moment streak, Store |
| Budgeter | 6 | **Money → Jars** · Budget Blitz |
| Budgeter | 8 | **Money → Goals** · Trade-Off |
| Budgeter | 10 | Bizzopoly single-player · Scam Spotter |
| Banker | 11 | **Money → Bank** · statements · Compound Climb |
| Banker | 15 | Bizzopoly multiplayer *(premium)* |
| Investor | 16 | **Money → Portfolio** *(premium)* · the Time Machine · company cards |
| Investor | 19 | **Beat the Market** seasons · Market Storm |
| Founder | 23 | **Money → Business** |
| Founder | 30 | The open sim — no more locks, and the net worth chart is years long |

---

## 11. What is built

Everything in this document exists in [`app/`](../app/) except where noted, at the depth a
first release needs rather than the depth a third one will:

| Built | Not yet |
|---|---|
| The town, all six buildings, on the shipping unlock ladder | Audio narration — the cast speaks in text |
| 8 chapters · 32 cards · 30 levels · 5 ranks | The remaining chapters that fill levels 24–30 |
| Jobs, jars with a pay-day rule, goals with auto-save | — |
| The bank: interest, a loan whose total cost shows first, a trust score | Insurance, tax |
| The Exchange, research nudges, the Time Machine | Company research cards as a collectible |
| Bizz & Co: stock, pricing with real demand response, weather, spoilage, rent | Hiring, a second stall |
| Eleven games: the board game, eight action games, two drills — keyboard and touch throughout | Pass-and-play for 2–4 humans on the board |
| The postbox: 22 letters, roughly one in six a scam | — |
| The grown-up's page: what they decided, Family Mode, several children, a printable week | Server-side entitlements; a parent gate |
| Offline PWA, hash routing, currency conversion | Accounts, sync, and a server-authoritative clock |

## 12. Open questions for the product owner

1. **Default currency** — ship US-first ($) with ₹ a setting, or detect and offer both on
   first run? Affects which denomination art gets drawn first.
2. **Age band split** — is 8–10 / 11–15 the right cut for Sprout/Builder, or 8–11 / 12–15?
3. **Real market window** — do we ever show a real index level (delayed, read-only, no
   names, no buy), or stay entirely fictional? Recommendation: fictional at launch, revisit
   for 14+ only.
4. **Family Mode at launch or Phase 2** — it is the strongest parent hook and the largest
   support surface.
5. **Bizzopoly's name.** *Main Street* is safe; anything ending in *-opoly* is not.
