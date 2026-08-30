# 07 — The Hour: USPs, hooks, and what actually holds a child for a year

The target is **an hour a day, 365 days**. That is **365 hours** — more than almost any
educational app ever gets from a child, and this one has deliberately banned the cheapest ways
to get it (CONCEPT §6.3, and the editorial policy: no loot, no streak pressure, no FOMO, no
notifications to a child, no ads). §7 at the bottom says plainly what I think is realistic.

Everything here follows from one correction:

> **An hour a day is not one hour. It is three visits.**
> Morning: what happened overnight — the market moved, the shop sold, interest landed.
> After school: the work, the build, the lesson.
> Evening: something with someone else in the room.
> Design for **visits**, not sessions. A single sixty-minute block is a thing a child does
> twice and then never again.

---

## 1. There are no USPs yet — there is an asset ledger, and it is empty

The nine "USPs" that stood here were bullshit. Audited honestly, eight of the nine were
**policy choices** a competitor changes in a sprint, and the ninth described something that
does not exist.

| The claim | What it actually is |
|---|---|
| One currency | A policy choice. Reversible in an afternoon. |
| No real money, ever | **Table stakes.** Every kids' finance app is a closed simulator. |
| Scored on the decision | A design opinion. Copyable. |
| Honest about stopping | A policy choice — and a *negative* feature. Nobody buys "we show you less". |
| 500 real companies | **Does not exist.** Claiming a plan as a USP is the tell. |
| Reports learning, not usage | An engineering choice. Anyone can build a mastery record; we did it in a day. |
| A town with her name on it | A feature. Copyable. |
| No ads, minimal data | Table stakes plus a policy. Every kids' app claims it. |
| Family-shaped | A policy choice. |

**A defendable USP is an asset somebody had to produce, license or earn — not a decision
somebody made.** By that test the family divides sharply:

| | Audio | Images | Corpus | Repo |
|---|---|---|---|---|
| **Bizzing India** | **11,506 narration clips** | 952 master photographs · 149 images | 1,008 stories authored | **2.7 GB** |
| **Bizzing Bee** | **743 voice recordings** | ~200 art assets, 17 packs | **61 MB of word data** | ~70 MB |
| **Bizzing Finance** | **0** | **0** | **0** | **7.5 MB** |

Bizzing Finance owns 23 JavaScript files, 12 markdown files and three stylesheets. **It has
produced nothing.** Bee and India are defensible because somebody sat down and *made* 12,249
audio files and 61 MB of compiled word lists. Finance has opinions and a prototype.

### The assets that could actually exist, ranked by defensibility per rupee

| # | Asset | Real? | Honest note |
|---|---|---|---|
| 1 | **Bee and India's installed base and brand** | ✅ **already owned** | The only genuine asset Finance has today, and it was missing from the list of nine entirely. A third app sold to families who already trust two is defensible against any new entrant. |
| 2 | **A narrated Bizzington** | Buildable | The family's proven playbook, twice over. Known cost, known pipeline, and it is the thing that makes Bee feel finished. |
| 3 | **Outcome evidence** | Buildable, slow | A real study showing children improved on an independent measure. **The strongest genuine moat available to any education product, and nobody in kids' fintech has one.** Expensive, slow, and unfakeable — which is the point. |
| 4 | **The company register, verified** | Buildable, eroding | ⚠️ Be honest: a language model writes 500 company blurbs in an afternoon, so *generation is not a moat any more*. The asset is the **verification trail, the house voice, and keeping it current** — not the words. |
| 5 | **Commissioned original art and cast** | Buildable | India commissions named folk artists — ownable and licensable. Finance's art is generated and inlined in a JS file, which is the opposite of an asset. |
| 6 | **Institutional recognition** (NCFE/NFLAT, schools) | Earnable | A distribution moat, not a product one. Slow, and worth more than any feature. |
| 7 | **The longitudinal family record** | Accrues | A child's multi-year mastery and net-worth history. Worthless on day one, a real switching cost in year two. |
| 8 | **Licensed market data** | Rentable | ❌ **Not a moat.** A competitor rents the same feed. It is a cost barrier and nothing more. |

**The honest bottom line: Bizzing Finance's only defendable asset today is that it is the
third app of a family that already has assets and users.** Everything else on this page is a
plan, and plans are not USPs.

## 2. The hooks

Seven engines. Each one is a *reason to come back*, and each is rated by how many minutes it
can honestly hold and how long it lasts before it wears out.

### H1 · The overnight — *"what happened while I was gone"*
The oldest hook in tycoon games, and here it is not a trick because it is **true**: interest
accrued, the shop sold things, the market moved, a letter arrived, the tide came in. The child
returns to *news*, not to a menu.
**Worth:** 5–8 min, first visit of the day. **Lasts:** for ever, if the news is real.
**Status:** partly built (pay day, postbox). The shop and the market do not yet run overnight.

### H2 · Market rhythm — *the world has a clock and it is not mine*
Markets open and close. The board is chalked at a time. Friday is pay day. The report comes
Sunday. A world with its own timetable creates anticipation without a single notification.
**Worth:** the reason the morning visit exists. **Lasts:** for ever.
**Status:** pay day only.

### H3 · The collection — *"84 of 500 met"*
Bizzing Bee's packs, applied to the Register. Finite, countable, canonical, and years long.
Sub-collections keep it from feeling infinite: the sector you have completed, the ten oldest
companies, the ones that make things in your own kitchen.
**Worth:** 10 min a visit, endlessly. **Lasts:** 2–3 years.
**Status:** not built. This is the biggest missing engine.

### H4 · Mastery — *I am better at this than I was*
Personal bests per job. Difficulty that climbs with the ladder. Your own past run as the ghost
you race. **Never another child's score** — the competitor is you last week.
**Worth:** 10–15 min a visit. **Lasts:** as long as the ceiling keeps moving.
**Status:** built for jobs (bests, rising difficulty). No ghosts yet.

### H5 · Ownership and expression — *this is mine and it looks like me*
The engine the app is missing entirely. Children give hours to Minecraft and Roblox because
they **build**. Bizzington has a town the child *repairs* but does not *shape*: no placing, no
naming, no choosing a sign, no laying out a shop floor.
**Worth:** 15–20 min a visit, and the strongest weekend hook there is. **Lasts:** for ever.
**Status:** not built.

### H6 · Consequence with a delay — *the thing I did on Tuesday bit me on Friday*
A decision that resolves later is remembered; one that resolves instantly is a button. The loan
that costs you every pay day. The stock you panicked out of. The buffer that saved you.
**Worth:** it is not minutes — it is the reason the minutes matter. **Lasts:** for ever.
**Status:** the loan and the market do this. Little else does.

### H7 · Someone else in the room
The evening visit needs a second person. Pass-and-play Main Street. A household net-worth
board. A parent who can be beaten. A sibling's town you can visit and admire but not touch.
**Worth:** 15–25 min, and it is the highest-retention block in the day.
**Lasts:** for ever. **Status:** Main Street exists but is single-player against bots.

---

## 3. The features that fill the hour

Budgeted across three visits. **Bold** = not yet built.

### Morning · ~10 minutes
| Feature | Minutes | Hook |
|---|---|---|
| **The overnight card** — what moved, what sold, what landed, in four lines | 3 | H1 |
| **Market open** — the Register's movers, delayed, read-only, unhurried | 4 | H2 H3 |
| The postbox — one letter | 2 | H1 |
| Today's lesson beat — one card or one retrieval | 4 | — |

### After school · ~30 minutes
| Feature | Minutes | Hook |
|---|---|---|
| The day's work — 2–4 job shifts, skill-scaled, personal bests | 10 | H4 |
| **Build mode** — place, name, paint, lay out. Your street, your shop sign | 12 | H5 |
| Put it right — a restoration, and the deed with your name on it | 5 | H5 H6 |
| **A commission** — a townsperson's multi-day request with a deadline | 5 | H6 |
| **Company of the day** — one deep dive, added to the collection | 5 | H3 |

### Evening · ~20 minutes
| Feature | Minutes | Hook |
|---|---|---|
| **Main Street, pass-and-play** — 2–4 humans in the room | 20 | H7 |
| **The household board** — everyone's net worth, no strangers | 2 | H7 |
| **An Almanac episode** — "it is 2008, what do you do?" then the reveal | 10 | H3 H6 |
| Closing time — today's ledger and three named things waiting tomorrow | 3 | H1 |

### The weekend
| Feature | Hook |
|---|---|
| **The season quest** — the twelve-week arc's next beat | H6 |
| **Paper portfolio review** — a week of real index data, scored on the decision | H6 |
| **Build a fund and name it** — pick a mix, write the rule, watch a season run | H5 H6 |
| The parent report, read together, and the conversation card | H7 |

---

## 4. Six new engines worth building, in order of value per week of work

1. **The Register + collection meter** (H3). The corpus. Nothing else compounds like it, and
   step one needs no backend — fifty companies, deep.
2. **Build mode** (H5). The missing engine. Place buildings, name the shop, choose the sign,
   lay out the floor. Kids give hours to building and none to browsing.
3. **The overnight** (H1 H2). Make the shop, the bank and the market actually run while away,
   and open with the news. Cheap to build, immediate effect on the morning visit.
4. **Pass-and-play + the household board** (H7). Main Street already exists; making it seat
   2–4 humans is small work for the highest-retention block in the day.
5. **Commissions** (H6). Multi-day requests with deadlines and named people who remember.
6. **The Almanac** (H3 H6). Forty canonical market episodes, playable.

---

## 5. The shape of a year

| Scale | What it is | Payoff |
|---|---|---|
| **Visit** | Three a day, each with its own job | Something happened; something is next |
| **Day** | Work · build · learn · decide · close | Closing time names three things waiting |
| **Week** | Pay day Friday · market days · one commission · Sunday report | A rhythm a child can predict and a parent can plan around |
| **Season** | Twelve weeks, a district, an instrument, an arc, a finale | The reason there is a month two |
| **Year** | Four seasons and a review | **The Annual Report** |

**The Annual Report is the 365-day payoff.** On the anniversary the app prints the child's
year: what they earned, what they built, the town as it now stands with their name on it, the
companies they met, what they learned and held. It is printable, keepable, and it is the thing
a grandparent gets sent. Nothing else in the design makes a *year* feel like a thing that
happened.

---

## 6. The banned list — and it is the USP

We do not get the hour with any of these, ever:

- **No streak that punishes.** Missing a day costs nothing. A child anxious about a streak is a
  cancelled subscription, and compulsion is not a money skill.
- **No loot boxes, no paid spins, no randomised reward for money spent** (CONCEPT §6.3).
- **No second currency.** One wallet.
- **No notifications to a child.** The parent may opt into a weekly digest. The child is never
  pinged.
- **No global leaderboard, no comparison with other children, no percentile.**
- **No limited-time anything.** Deadlines are good teaching; disappearing rewards are bait.
- **No ads. No behavioural tracking. Ever.**
- **No live twitching ticker that rewards reacting** — the app spends a whole strand teaching
  that urgency is manufactured by sellers (docs/06 §3).

Every one of these is a competitor's cheapest engagement tool. Refusing all eight is precisely
why a parent would pay, and it is the reason the hour has to be *earned* by the world being
worth an hour.

---

## 7. What I actually believe about the hour

**Sixty minutes a day, every day, for 365 days is above what this category achieves**, and I
would not plan the business on it. Here is the honest shape, and it is still a very good
product:

| | Realistic today | Realistic with §4 built |
|---|---|---|
| **Weekday** | 8–12 min, one visit | **25–35 min across two or three visits** |
| **Weekend** | 15 min | **45–70 min** (build mode and the family game are weekend-shaped) |
| **Weekly total** | ~1.5 h | **4–6 h** |
| **Days engaged / year** | ~60 before it thins out | **180–240**, with season finales as the peaks |

**The hour is reachable on the days it matters** — weekends, season finales, the week a child
first opens their shop — and chasing it on a wet Tuesday in February would mean building
exactly the eight things in §6 that we have banned. A child who gives this thirty honest
minutes on a school day and two hours on a Saturday is a child who has learned to run money,
and a parent who renews.

**The one number to hold the design to** is not minutes. It is docs/05's: *objectives retained
per active week.* An hour a day that teaches nothing is a failure with good telemetry.
