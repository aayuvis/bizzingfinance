# 06 — The Corpus: what Bizzing Finance's 128,040 is

Bizzing India asks the right question in [its own docs/10](https://github.com/aayuvis/bizzingindia.com/blob/main/docs/10-the-corpus.md),
and it applies here with more force:

> The corpus is the moat. Anyone can build a spelling game; nobody else hands you the whole
> championship word list with a ladder through it. **So the question is not "what features?"
> It is: what is our 128,040?**

| | Corpus | Atom |
|---|---|---|
| **Bizzing Bee** | 128,040 words | one word: say it, spell it, know its origin |
| **Bizzing India** | 1,008 stories · 2,500 verses · 36 states | one story, one verse, one place |
| **Bizzing Finance** | **32 cards and 11 games** | — |

That is the whole diagnosis. Bizzing Bee is not engaging because spelling is fun; it is
engaging because a child who loves words is handed the *real* championship list, with
etymology, with a voice that pronounces it properly, and a promise that nothing is skipped.
Bizzing Finance has games bolted to a syllabus. **It has never had a corpus, and a corpus is
the only thing here that compounds.**

---

## 1. The answer: 500 companies

The atom is **one real company**: what it makes, who pays it, how it earns, what could hurt it.

It qualifies on every test the family already uses — finite, countable, canonical (an index
defines the set), ownable, endlessly deep, and *already loved*: children ask who makes things.
Every object in a child's house was made by a company, and almost none of them can name one.

**The headline: *500 companies. 12 asset classes. 100 years of markets. One town.***

| Corpus | Count | Atom | Why it works |
|---|---|---|---|
| **The Register** — real companies | **500** | one company | The moat. Canonical (index-defined), deep, and every one connects to something a child already owns |
| **Asset classes** | 12 | one class | What it is, what it pays, what it does in a bad year — the thing that actually decides outcomes |
| **The Almanac** — market history | ~40 | one episode | 1929 · 1987 · 2000 · 2008 · 2020 · India's 1991 reforms · 1992. Finite, canonical, dramatic |
| **Money Words** | 500 | one term | Already started (44) |
| **Business models** | 24 | one pattern | Subscription, marketplace, razor-and-blade, franchise, toll booth |
| **Currencies** | 180 | one currency | Already a setting; barely a corpus yet |

Start **deep, not wide**: 50 companies fully built beats 500 stubs, exactly as docs/10 §6 says.

---

## 2. The wall — and it is not negotiable without a decision from the owner

[CONCEPT §6.2](../CONCEPT.md) is binding: *nothing is investment advice, and no real security is
ever named as a thing to buy. A real name may appear only in a read-only, clearly-labelled
market window, never with a buy button.*

So the architecture is **two markets with a hard wall between them**, enforced in code rather
than by convention:

| | **The Register** | **The Exchange** |
|---|---|---|
| Names | **Real** | **Fictional** |
| Prices | Real, delayed or end-of-day | Real historical *behaviour*, replayed |
| You can | Follow, study, form a view, complete the collection | Buy, hold, panic, compound, lose |
| You cannot | **Buy. There is no buy path on a `real: true` record, and a test asserts it.** | Mistake it for the real world — it says so |

**Paper trading belongs at asset-class and index level, on real data — not individual named
securities.** That is inside the rule, and it is also better teaching: a child should learn
diversification, not stock-picking. CONCEPT §6.3's own corollary already says the boring
diversified player should win the season.

> **The decision only the owner can make.** Paper trading individual real names would need
> §6.2 changed. It is the single feature that turns "educational simulator" into something an
> app-store reviewer or a regulator reads as a brokerage demo, and for an 8–12 audience it
> teaches the one behaviour the rest of the app argues against. Recommendation: don't — but it
> is a product call, not mine.

---

## 3. Real data, honestly

Three constraints that shape the build, none of them optional:

1. **Real-time exchange data is licensed.** Redistributing live NSE/BSE/NYSE/Nasdaq prices
   needs agreements and real money. **15-minute delayed and end-of-day are the affordable,
   redistributable tiers** — and for this app they are also the *right* tiers. Verify the
   specific vendor terms before shipping any of it; nothing in this document is a citation.
2. **No API key may ever reach the client.** The key lives in a service — the backend already
   named as a launch blocker. This is what finally forces it.
3. **Offline-first is a hard rule.** Everything caches and degrades to *"as of Tuesday"*,
   never to a spinner.

> **One disagreement, stated once.** A *flowing live ticker* fights this curriculum. The app
> spends a whole strand (GUARD, and CHOOSE-5 "hurry is a tool") teaching a child that urgency
> is something sellers manufacture — and then puts a number on screen that twitches for
> attention. Build the Market Window as a place you **study**, on delayed data, that never
> rewards reacting. It can still flow and still be beautiful. It must not be a slot machine.

---

## 4. The re-architecture, in layers

| Layer | What it is | Notes |
|---|---|---|
| **L0 · The data spine** | `content/register/*.json` — companies, sectors, asset classes, episodes. Versioned, CDN-served, bundled offline fallback | **This is the moat, and it is authoring, not engineering.** Nothing above it matters until it exists |
| **L1 · The feed** | A thin service holding the vendor key: fetch, normalise, cache, serve a small payload | Never the client. Forces the backend |
| **L2 · Two markets** | Register (real, read-only) ‖ Exchange (fictional, tradeable) | The wall is a code invariant with a test, not a convention |
| **L3 · Paper portfolios** | Asset-class allocation on real index data, seasons, scored on the **decision** | Diversification, rule-keeping, not panic-selling — never return alone |
| **L4 · The ladder** | Company → Sector → Index → Asset class → Portfolio | Gated by the maths spine (docs/03 §3) and driven by `mastery.js` |
| **L5 · Surfaces** | A new district — **The Trading Floor** — plus the Register as a browsable collection with a completion meter | "84 of 500 met" is the multi-year long game |

**The memory engine already exists.** `mastery.js` + `ledger.js` (docs/05) are this app's
equivalent of Bizzing Bee's spaced repetition, and a company is an objective like any other:
met, retained, transferred. The corpus plugs straight into it.

---

## 5. The tools that come out of it

1. **The Register** — 500 company cards; browse, search, filter by sector or by what they make. Completion meter.
2. **Deep dive** — what it makes · who pays · how it earns · what could hurt it · who competes · a ten-year chart · six numbers in plain English.
3. **The Market Window** — delayed tickers, sector heatmap, movers. Read-only, labelled, unhurried.
4. **Paper portfolios** — across asset classes, real index data, seasons, scored on decisions.
5. **The Almanac** — ~40 playable episodes. *"It is 2008. Here is what you know. What do you do?"* Then the reveal.
6. **Guess the business** — products and a revenue split; name the company. Bizzing Bee's pack mechanic, applied to the Register.
7. **Teardown** — 24 business models; work out which one a company runs on.
8. **The FX desk** · **Rates & bonds** · **The annual-report reader** — one real filing, reduced to six numbers.

---

## 6. Banding, because 8 and 13 are not the same child

| Band | Sees |
|---|---|
| **Sprout 8–10** | The town, jobs, jars, goals. **No tickers, no real companies.** |
| **Builder 11–12** | The Register and deep dives. The Exchange (fictional). No live prices. |
| **Floor 13+** *(new)* | The Market Window, paper portfolios, the Almanac, the FX desk |

The job mini-games and the town stay — they are the earning loop, and they are what makes the
younger band work. The Register is what makes the older one worth a subscription.

---

## 7. Order of work

1. **50 companies, fully built.** Deep, not wide. Prove the atom is worth a child's time.
2. **Deep dive + collection meter**, offline, no feed at all.
3. **The feed service** — end-of-day first, delayed later.
4. **The Market Window.**
5. **Paper portfolios.**
6. **The Almanac.**

Step 1 needs no backend, no keys and no licence, and it is the step that decides whether any of
the rest is worth building. **If fifty company cards are not something a child will read, five
hundred will not save it** — the same test docs/05 applies to the parent report.
