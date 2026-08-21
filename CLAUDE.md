# CLAUDE.md — Bizzing Finance

Read this first, then [CONCEPT.md](CONCEPT.md), then [docs/01-tabs.md](docs/01-tabs.md).

## What this is

**Bizzing Finance** — a simulation-first web app teaching kids **8+** how money works:
basics → budgeting → banking → a stock portfolio → running a business. Third app in the
Bizzing family, after [Bizzing Bee](https://github.com/aayuvis/Bizzing-Bee) (spelling, 8–15)
and [Bizzing India](https://github.com/aayuvis/bizzingindia.com) (culture & Hindi, 4–12).

**Currently concept-stage.** Docs only, no application code yet.

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
