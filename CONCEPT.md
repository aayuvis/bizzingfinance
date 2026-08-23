# Bizzing Finance — Product Concept

> **One line:** A simulation-first web app that teaches kids 8+ how money actually works —
> by giving each child a wallet, a budget, a bank account and a stock portfolio that are
> entirely simulated and entirely theirs, and letting every decision have a consequence.

**Family:** third Bizzing app, after [Bizzing Bee](https://github.com/aayuvis/Bizzing-Bee)
(spelling, 8–15) and [Bizzing India](https://github.com/aayuvis/bizzingindia.com)
(culture & Hindi, 4–12). Same household, same parent account model, same shell idioms.

---

## 1. Why this exists

Every other subject a child is failing at has a tutor, an app and a worried parent. Money
has none of them — schools teach almost nothing, parents feel unqualified, and the only
apps in the category are **debit cards for kids** (GoHenry, Greenlight, Akudo, Fampay).
Those products move real money and teach almost nothing; the "education" is a blog post
bolted to a card.

The gap is the opposite product: **all teaching, no money rails.** That is also, not
coincidentally, the version that is safe to ship to an 8-year-old, cheap to run, legal
everywhere, and needs no banking partner, no KYC and no float.

Three jobs, and every feature should serve at least one:

| # | Job | How the product does it |
|---|---|---|
| 1 | **Teach the thing school doesn't** | A ladder from "what is money" to "rebalance a portfolio", where every rung is practised in a simulator, not read. |
| 2 | **Sell a family subscription** | Parents already pay $5–13/month for a *card*. We charge less for the *teaching*, and we're the only one they can hand to an 8-year-old with nothing at stake. |
| 3 | **Compound the Bizzing family** | Same buyer as Bizzing Bee and Bizzing India — one parent account, three children's apps, one bill. |

The strategic insight: **the competition sells access to money; we sell the ability to
handle it.** They cannot copy us without becoming us, because their whole business is the
interchange fee on the card.

---

## 2. Who it's for

**Kids 8–15.** The buyer is always the parent; the user is always the child. Primary market
US + Indian diaspora (the Bizzing family's existing household), secondary India — which is
why **currency is a first-class setting, never an assumption** (§7).

The 8→15 span is too wide for one interface, so — exactly like Bizzing India's Chhote/Bade
split — there are **two front doors onto one spine**:

- **Sprout mode (8–10)** — coins and notes, earning, needs vs wants, saving for a thing.
  No debt, no negative balances, no market, no percentages before they're taught. Bigger
  type, everything on screen is also spoken.
- **Builder mode (11–15)** — budgets, bank interest, borrowing costs, a portfolio, a
  business, tax and insurance basics. Percentages, charts, statements, seasons.

Same simulator, same money, same characters — different depth and different verbs. Mode is
set at profile creation from age band and can be changed by the parent. A child crossing
into Builder doesn't restart: their wallet, their savings and their history come with them.
**That continuity is the product's moat** — a portfolio a child has held since they were 9
is not something a competitor can hand a new user.

---

## 3. The spine: one simulated money life

It has a body, and the body is a town called **Bizzington** — every abstract idea in the
curriculum is a building you can walk into, and progress is a skyline rather than a number.
That is the whole engagement design and it has its own document:
[docs/02-the-world.md](docs/02-the-world.md). The rule it produces governs everything here:
**no concept ships without a place.**


Everything in the app is a surface onto **one persistent object** — the child's money life.
Lessons deep-link into it, games pay into it, the store spends out of it, the parent
dashboard reads it.

```
        LEARN  ──teaches──▶ ┌──────────────────────┐ ◀──earns──  ARCADE
                            │   THE CHILD'S MONEY  │
    PROGRESS ──reads──────▶ │  wallet · jars · goals│
                            │  bank · portfolio     │
   COLLECTION ◀──earns───── │  business             │ ──spends──▶ STORE
                            └──────────────────────┘
```

### 3.1 One currency, and it is the curriculum

Bizzing Bee has 🪙 coins for the shop and XP for the ladder. **Bizzing Finance must not.**
A soft reward currency stacked on top of simulated money is the one design mistake that
would quietly destroy the whole product: it teaches that there is a magic second money that
arrives for showing up, which is the exact opposite of the lesson.

So: **one currency.** Games and lessons pay *wages* into the wallet. The store spends out
of the same wallet. Buying a hat means not investing that money — and the store says so, in
numbers, before you buy (§`docs/01` Store).

### 3.2 The week is the heartbeat

Real financial life has a clock, and it's weekly: money arrives, obligations land, and what
you didn't spend is still there. So the sim runs on **real weeks**:

- **Pay day** is a fixed weekday. Allowance/wages land, recurring costs come out.
- Between pay days: daily lessons, games, a Money Moment, market drift.
- **Nothing is time-compressed for cash flow.** A week of waiting is the lesson; faking it
  teaches that money problems resolve in a minute.

The one exception, and it's deliberate: **the Time Machine.** Compounding is invisible on a
human timescale, so the Portfolio (and only the Portfolio) can be fast-forwarded 1 / 5 / 10
/ 30 years to show what the same decision becomes. Play money, real math, honest ranges.

### 3.3 Consequences are the teacher

Every screen that takes a decision must show what it cost. Not a scolding — a number, and
later, a fact. Spend the goal fund and the goal thermometer visibly falls back. Panic-sell
in a dip and the Time Machine will, months later, show what holding would have done. Skip
insurance in Bizzopoly and the cracked-screen card is expensive.

---

## 4. The ladder

> The rank table below is the *shape*. The teaching sequence underneath it — which arithmetic
> each rung needs, and what a child does to clear it — is
> [docs/03-the-teaching-ladder.md](docs/03-the-teaching-ladder.md), and that document is the
> one to build from.

Bizzing Bee's ladder is *Word → Set → Level → Champ → Library*. Ours:

```
Lesson card  →  Chapter (~6 cards)  →  Level  →  Rank  →  the open sim
```

Five ranks. **The rank is what unlocks the next surface of the simulator**, which is how a
child "graduates" from basics to a budget to a portfolio — the sub-tabs of the Money tab
appear one at a time, visible-but-locked from day one so they're an aspiration.

| Rank | Levels | What it teaches | Unlocks |
|---|---|---|---|
| **Saver** | 1–5 | What money is · coins & notes & change · where money comes from · earning · needs vs wants · price & value | **Wallet** |
| **Budgeter** | 6–10 | Income vs expenses · the four jars · a weekly plan · tracking · opportunity cost · saving for a goal · pay yourself first | **Jars**, then **Goals** |
| **Banker** | 11–15 | Accounts · interest both ways · compounding · debit vs credit · what borrowing costs · inflation · scams & money safety | **Bank** |
| **Investor** | 16–22 | What a company is · shares · risk & return · diversification · index funds · volatility · time horizon · fees · what a crash is | **Portfolio** |
| **Founder** | 23–30 | Revenue, cost, profit · pricing · inventory · cash flow ≠ profit · loans · tax & insurance basics | **Business** |

**Free stops at Level 5 on the ladder**, the same shape as Bizzing Bee so a returning
household recognises the paywall. Premium continues, and unlocks Portfolio and Bizzopoly
multiplayer. See §8.

Every level is passed the same way: **do it in the simulator, not on a quiz.** You clear
Budgeter 3 by running one week inside your plan, not by picking B.

---

## 5. The cast (provisional)

The Bizzing family gives each app a creature: Bizzy the bee, Gattu the elephant. Here:

| Who | What they are | Why they exist |
|---|---|---|
| **Pip** — a squirrel | The hero and the narrator of every explainer. Stashes, plans, forgets where he put things. | The child's proxy. Pip evolves with rank, exactly as Bizzy does. |
| **Mags** — a magpie | Wants the shiny thing, now. Loud, funny, **never the villain.** | The impulse, externalised. You argue with Mags; you don't defeat her. Making the spender a bad guy would shame half the households using this. |
| **Bo & Bea** — a bull calf and a bear cub | The market's weather. They narrate why prices moved and disagree with each other. | Teaches the vocabulary without a lecture, and models that nobody knows. |
| **Nana Bizz** | The elder who hands over the stand in the Founder arc. | The grown-up who explains without judging, and the "ask your family" bridge. |

Names are placeholders until art exists. `Pip` and `Mags` are currency- and
culture-neutral on purpose — this app ships to Ohio and Pune off one build.

---

## 6. Hard editorial rules (the ones specific to money)

The family rules carry over — keyboard **and** touch on every game, never leak an answer,
no ads, minimal child data, Devanagari set properly where it appears. These are the ones
this app adds, and they are binding:

1. **No real money. Ever.** No card, no bank link, no crypto, no gift cards, no real trades,
   no cash-out, no payout of any kind to a child. The simulator is closed. This is a product
   decision *and* the reason we need no licence in any market.
2. **Nothing in the app is investment advice, and no real security is ever named as a thing
   to buy.** The market simulator replays **real historical price behaviour under fictional
   company names** — so volatility is honest and nobody is nudged. A read-only, clearly
   labelled "real market window" (index level, delayed) is the *only* place a real name may
   appear, and never with a buy button.
3. **No gambling mechanics of any kind.** No loot boxes, no paid spins, no double-or-nothing,
   no randomised reward for money spent. In a finance app for children the line between
   investing and gambling is the single most important thing being taught, and a mechanic
   that blurs it undoes the curriculum. **Corollary that governs game design:** a game that
   scores only on returns has taught gambling. Score the *decision* — diversification,
   rule-keeping, not panic-selling — and let the boring diversified player win the season.
4. **Never assume a family's money.** No assumed allowance, no assumed home, no assumed two
   incomes, no "ask your parents for". Every amount is configurable and the default sim
   income is earned in-app. Some children have $0 of real money and must not be told they
   are behind.
5. **Never teach a number from memory.** Interest rates, historical returns, inflation
   figures, prices-then-vs-now: cite it or cut it, exactly as Bizzing India treats history.
   `sources[]` on every factual card.
6. **Credit is a tool with a price, never a moral failing.** Teach the cost honestly; never
   shame debt. Plenty of these children live in households with debt.
7. **Money safety is curriculum, not a footnote.** Scams, phishing, in-game-currency
   pressure, "free" offers, and friends who ask to borrow — these are the financial events
   an 8-year-old will *actually* meet this year, and they get first-class lessons and a game.
8. **Real money never enters the child's surface.** Premium is bought by the parent in the
   Parents area. The child's Store sells nothing for real currency, ever.

---

## 7. Currency and locale

Not a localisation chore — a design constraint from commit one. The same child may be
counting rupees at their grandmother's and dollars at school.

- Currency is a **profile setting** (₹ · $ · £ · € · AED), changeable, and the sim converts
  its own balances when it changes rather than resetting them.
- **Number formatting follows the locale**, including Indian grouping (lakh/crore) — a child
  who reads `12,00,000` at home should not be taught that it's wrong.
- Counting-money lessons ship **real denominations per currency** — the note and coin set a
  child will actually hold.
- Prices in lessons and the Store are authored as *relative* values, not hard-coded numerals,
  so the whole catalogue re-prices per currency without a rewrite.

---

## 8. Money model (sketch)

Mirrors Bizzing Bee so the household understands it instantly.

- **Free:** Sprout mode in full, the ladder to Level 5, Wallet + Jars, two worlds, the daily
  Money Moment, three arcade games, Bizzopoly single-player.
- **Premium (family subscription):** the full ladder, Bank, **Portfolio**, Business,
  Bizzopoly multiplayer + seasons, Beat the Market seasons, parent reports, all worlds.
- **Family Mode** (premium, parent-controlled and entirely manual — *no bank connection*):
  a parent mirrors a real allowance and real chores into the sim, so the child's in-app
  wallet tracks their actual life. This is the feature that makes the sim feel real, and we
  can ship it without ever touching a money rail.
- Bundle with Bizzing Bee / Bizzing India on one parent account.

---

## 9. Architecture (planned)

Same stack decision as Bizzing India, for the same reasons:

Vanilla ES modules + **Vite** + PWA · **Supabase** (Auth / Postgres / RLS) · Stripe
(+ Razorpay/UPI for India) · content as versioned JSON on a CDN with a bundled offline
fallback · design tokens shared with Bizzing Bee via its `ds-src` package.

Two things to keep from Bizzing Bee: the `state → render()` + `data-act` dispatch idiom, and
offline-first as a hard requirement. Two things to do right from the start: build with Vite
and ES modules from day one, and put **all** storage behind the `Store` seam in the first
commit (Bizzing Bee's "Phase 1 linchpin" — free if done first, expensive later).

One thing neither sibling needs: **the sim clock is server-authoritative.** Pay day,
interest ticks and market days cannot be advanced by moving the device clock forward, or the
first week of play will teach a child that the way to get money is to cheat time.
Entitlements stay server-authoritative too, read via RLS — never a client flag.

---

## 10. Where to start

- [**docs/02-the-world.md**](docs/02-the-world.md) — Bizzington. Read this before the spec,
  because a tab map for a product nobody wants to open is just furniture.
- [**docs/01-tabs.md**](docs/01-tabs.md) — the tab map: seven tabs, what is on each, and
  which rank unlocks it.
- [**app/**](app/) — the playable prototype. All seven tabs exist; the depth behind them is
  what is still being built.
