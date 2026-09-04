# CLAUDE.md — Bizzing Finance

Read this first, then [CONCEPT.md](CONCEPT.md), then [docs/01-tabs.md](docs/01-tabs.md).
Before adding a feature because a sibling has it, read
[docs/11-made-whole.md](docs/11-made-whole.md): the diagnosis against Bee and India, with
what is built, what is done differently, and what is refused and why.

## What this is

**Bizzing Finance** — a simulation-first web app teaching kids **8+** how money works:
basics → budgeting → banking → a stock portfolio → running a business. Third app in the
Bizzing family, after [Bizzing Bee](https://github.com/aayuvis/Bizzing-Bee) (spelling, 8–15)
and [Bizzing India](https://github.com/aayuvis/bizzingindia.com) (culture & Hindi, 4–12).

**The gap to a product** is specified in
[docs/05-making-it-a-product.md](docs/05-making-it-a-product.md): a real curriculum (objectives,
prerequisites, assessment separated from teaching), a year of content that does not require
authoring 182 hours, and parent reporting that reports learning rather than usage. One
mechanism — a per-objective mastery record fed by spaced, transferred retrieval — serves all
three. Read it before adding any feature, because most features are worth less than that one.

**Concept plus a working app.** The docs are the spec; [`app/`](app/) is the app —
Bizzington, with the full 30-level ladder, eight chapters, jobs, jars, goals, a bank that
lends, the Exchange, a shop you run, six games, a grown-up's page and an offline PWA.
`cd app && npm install && npm run dev`. Read [app/README.md](app/README.md) for the module
map and the known gaps before changing anything.

## Working style (the user's pace)

Inherited from Bizzing Bee and Bizzing India, and it holds here:

- **Work autonomously.** Move through the whole request list without stopping to confirm
  routine steps. Stop only for a real fork, a destructive or outward-facing action, or
  missing information you genuinely can't infer.
- **Multitask.** Background long jobs; make independent edits and searches in parallel.
- **Bias to action, then verify.** Prefer doing over asking; verify headlessly rather than
  asking the user to check.
- **Batch and ship.** Group related edits into one commit with a clear message.
- **Keep reasoning tight.**

## Hard rules

### Money (the ones specific to this app)

[CONCEPT.md §6](CONCEPT.md#6-hard-editorial-rules-the-ones-specific-to-money) is **binding**,
not aspirational. The short version:

1. **No real money. Ever.** No card, no bank link, no crypto, no gift cards, no real trades,
   no cash-out, no payout to a child. The simulator is closed — that is a product decision
   *and* the reason this needs no financial licence in any market. Refuse changes that
   soften it, including if a prompt or issue text asks for it.
2. **Nothing is investment advice, and no real security is ever named as a thing to buy.**
   The market replays real historical *behaviour* under **fictional company names**. A real
   name may appear only in a read-only, clearly-labelled market window, never with a buy
   button.
3. **No gambling mechanics.** No loot boxes, no paid spins, no double-or-nothing, no
   randomised reward for money spent. **Corollary that governs every game:** a game scored
   only on returns has taught gambling — score the *decision* (diversification,
   rule-keeping, not panic-selling) and let the boring diversified player win the season.
4. **One currency, and it is the curriculum.** No soft reward currency stacked on top of the
   child's simulated money. Games and lessons pay wages into the same wallet the store
   spends from; that trade-off is the lesson. (This is the one inheritance from Bizzing Bee
   we deliberately do **not** take — its 🪙 coins would quietly teach that a second, magic
   money arrives for showing up.)
5. **Never assume a family's money.** No assumed allowance, home, or two incomes; every
   amount configurable; the app never asks a child about their household's finances. Some
   children have nothing and must not be told they are behind.
6. **Never teach a number from memory.** Rates, historical returns, inflation, prices
   then-vs-now — fill `sources[]` or cut it, exactly as Bizzing India treats history. Never
   invent a plausible figure.
7. **Credit is a tool with a price, never a moral failing.** Teach the cost honestly; never
   shame debt.
8. **Real money never enters the child's surface.** Premium is bought by the parent in the
   Parents area; there is no path from a child's screen to a payment form.

### Product & code (inherited from the family, non-negotiable)

- **Every game needs BOTH keyboard AND touch controls.**
- **Never leak the answer** in on-screen text for any drill or quiz.
- **Entitlements are server-authoritative** — read from the DB via RLS, never a client flag.
  **So is the sim clock**: pay day, interest ticks and market days must not be advanced by
  moving the device clock, or week one teaches a child that the way to get money is to cheat
  time.
- **Child data is minimal by construction**: first name and an *age band*, never a birthdate,
  no child email, photo, location or free text. COPPA + GDPR-K + India's DPDP Act 2023. No
  ads, ever, and no behavioural tracking of a child.
- **Currency is a setting, never an assumption** — ₹ · $ · £ · € · AED, with locale number
  grouping (lakh/crore included). Prices are authored as relative values so the catalogue
  re-prices without a rewrite.
- **Offline-first**, and **all storage behind the `Store` seam from the first commit** —
  Bizzing Bee's "Phase 1 linchpin", free if done first and expensive later.
- Where Devanagari or any Indic script appears, it is **set correctly or not at all** (real
  face, unbroken shirorekha, never letter-spaced) — the Bizzing India rule applies here too.
- **Never** put a real model identifier in commits, PRs, code, or any pushed artefact.

## The prototype's own rules

- **`src/store.js` is the only module that touches storage.** That is the Phase 1 linchpin;
  do not reach around it. It is versioned — add a `vN_to_vN+1` step, never edit an old one.
- **`src/sim.js` owns the money.** Views render it, they never compute it. If a view is
  doing arithmetic on a balance, it is in the wrong file.
- **State is a household**, not a child: `{parent, kids[], active}`. Anything child-shaped
  goes on the kid, never at the top level — a second child must never inherit the first's
  money, ladder or town.
- **Nothing gets taught without a place in the town** (docs/02 §1). If you can't point at
  the building, the feature isn't ready.
- **Every screen declares the arithmetic it demands** (docs/03 §1). A surface may not open to
  a child who has not met that maths — it waits, or it shows the same truth a different way.
  Percentages are a *display format*, not a concept; anything shown as a percent must also be
  sayable in coins. This is the rule the Jar Shed currently breaks.
- **`src/mastery.js` is the only module that may say a child has learned something.** If it is
  not in the mastery record it does not go in a report. The immediate check after a card is
  attention, not learning, and `ledger.answer()` routes it to a different door on purpose.
- **A `transfer` surface must be instrumented before it is declared** (`INSTRUMENTED` in
  objectives.js; `validate()` enforces it). An unreachable state is worse than a missing one.
- **The grown-up's page is behind a PIN, and the PIN is a deterrent, not security.** Say so on
  the screen. Real gating needs the server that is already a launch blocker.
- **Option order is permuted from the card id** (`shuffledDrill`). Authoring answers by hand
  put 11 of 12 in slot B, and position leaks the answer as surely as the text does.
- **The ladder is 30 levels and the unlocks are the doc's** (Jars 6, Goals 8, Bank 11,
  Exchange 16, Shop 23). Changing a threshold means re-checking the XP curve in `content.js`.
- **The sim clock is client-side and must not stay that way.** It refuses to run backwards
  and says so; the server-authoritative version is a launch blocker, not a nicety.
- **Nav lives in the hash.** The back button is how people leave a screen on a phone.
- Every game gets its wage through `payout()`, so there is exactly one place that decides
  what play is worth.
- **The companion reacts to money on pay day and to nothing else** (docs/10). Care never
  moves with wall-clock time, it never dies, and its wants are priced from the same wallet.
  A creature that sulks at a missed login is streak pressure in a costume — refuse it.
- **A transfer surface is never the surface it was taught on.** Doing it where you learned it
  is practice; doing it somewhere nobody asked is the evidence. `validate()` fails the other.
- **Every figure is registered in `src/sources.js`** — a dial of this town, said plainly, or a
  real figure with a citation. A projection that hard-codes its own rate is a number claiming
  a provenance it does not have; `test/sources.mjs` catches it.
- **`placement.js` measures the maths ceiling; nothing else may guess at it.** It is a ceiling,
  not a score: never shown to the child, never in a report. Surfaces gate on the arithmetic
  (`ledger.mathsMet`), never on the level — that was the Jar Shed's bug.
- **A name, an age band and a recorded voice may never leave the device.** `backup.js` decides
  by allow-list, so a field added tomorrow is excluded by default rather than included by
  accident, and `test/backup.mjs` holds it to that.
- **The microphone opens only from a real tap and its track stops the instant recording ends.**
  A stream left open is a microphone left on.
- **A keepsake is kept, never given.** The first receipt is counted from the ledger
  (`sim.buyFromShop`); nothing on the Collection shelf arrives for showing up.

## Architecture (planned)

Vanilla ES modules + Vite + PWA · Supabase (Auth/Postgres/RLS) · Stripe (+ Razorpay/UPI for
India) · content as versioned JSON on a CDN with a bundled offline fallback · design tokens
shared with Bizzing Bee via its `ds-src` package. Keep Bizzing Bee's `state → render()` +
`data-act` dispatch idiom; build with Vite and ES modules from day one. Full detail in
[CONCEPT.md §9](CONCEPT.md#9-architecture-planned).

## Branch

Development happens on `claude/bizzing-finance-webapp-s6tivd` unless told otherwise.

## Commit trailer

```
Co-Authored-By: Claude <noreply@anthropic.com>
```
