# 05 — Making it a product

Requirements for the three things that stand between the prototype and something a parent
would pay for, and would keep paying for:

1. **A curriculum** — a real one, with objectives, prerequisites and assessment, that a
   parent or a school can recognise, and that the game *complements* rather than replaces.
2. **A year of content** — thirty minutes a day that stays worth thirty minutes on day 200.
3. **Parent reporting** — because the parent is the payer and currently gets nothing
   between one session and the next.

This document assumes [docs/03](03-the-teaching-ladder.md) and does not repeat it. The M/C/D
rule and the seventeen-skill number spine are the parts of a curriculum that already exist and
are good. What follows is what sits on top of them.

**The central claim of this document:** these are not three projects. One mechanism — a
per-objective mastery record fed by spaced, transferred retrieval — is simultaneously the
curriculum's assessment, the engine that generates a year of legitimate daily content, and the
only honest source of anything a parent report could say. Build it once, and all three problems
move. Build three separate things and none of them will be true.

---

## Part A — The curriculum

### A1. What is actually missing

docs/03 gives a scope and a sequence. A curriculum is four things, and three are absent:

| | Status |
|---|---|
| **Scope & sequence** — what is taught, in what order | ✅ docs/03 §3–§4 |
| **Objectives** — each stated as a behaviour you could observe | ❌ nothing |
| **A prerequisite graph** — what must be true before this can be taught | ⚠️ M-spine only; concepts have no ids |
| **Assessment** — evidence, separated from teaching | ❌ the drill *is* the lesson |

The fourth is the one that matters commercially. Today a card teaches a thing and then
immediately asks about the thing. A child who answers correctly has demonstrated that they
were awake ninety seconds ago. That is not evidence, it cannot be reported, and it is the
reason there is nothing honest to tell a parent.

### A2. Six strands, and what a rung must be

docs/03's three strands (M/C/D) describe the *anatomy of a rung*. They are not the curriculum's
subject divisions. Those are:

| Strand | What it covers | Why it is separate |
|---|---|---|
| **EARN** | Where money comes from; work, value, time-for-money, the skill premium, income that isn't wages | The only strand a child can act on from day one |
| **CHOOSE** | Scarcity, trade-off, opportunity cost, want vs need, unit price, advertising and dark patterns | The strand that transfers fastest to real life |
| **KEEP** | Saving, allocation, goals, the buffer, why a buffer exists before it is needed | Where habit beats knowledge |
| **GROW** | Interest, compounding, risk, diversification, time horizon, fees | Needs the most maths; arrives latest |
| **OWE** | Credit as a priced tool, the cost of borrowing, repayment, arrears without shame | Must be taught before it is met, not after |
| **GUARD** | Scams, phishing, purchase manipulation, gambling mechanics, privacy, "if it's free, you're the product" | The strand with the shortest path to real harm |

Six strands × twelve rungs = **72 objectives in year one**, roughly one and a half a week. The
rest of the year is retrieval, doing, and consequence — see Part B.

### A3. The objective record

Every objective is a data object, not a paragraph. This schema is the deliverable; without it
there is nothing to assess against and nothing to report.

```jsonc
{
  "id": "CHOOSE-4",
  "strand": "CHOOSE",
  "rung": 4,
  "objective": "Given two sizes of the same thing at different prices, works out which is
                cheaper per unit and can say why the bigger box is not always better value.",
  "observable": true,          // stated as a thing you could watch a child do
  "needs_maths": ["M5", "M8"], // prerequisite rungs of the number spine
  "needs": ["CHOOSE-2"],       // prerequisite objectives
  "surface": "shop",           // where in the town it is PRACTISED (docs/02 §1)
  "teach": "c4b",              // the authored card that introduces it
  "assess": ["a-CHOOSE-4-a", "a-CHOOSE-4-b", "a-CHOOSE-4-c"],
  "transfer": ["market-stall", "exchange-fee", "subscription"],
  "parent_line": "Ask her which is better value at the shop this week — and let her be
                  wrong once, because the wrong one is where it sticks.",
  "sources": []                // required and non-empty for any real-world claim
}
```

Two rules that follow, and both are load-bearing:

- **An objective is written as a behaviour or it is not written.** "Understands opportunity
  cost" is not an objective; you cannot see it, so you cannot assess it and you must not
  report it. "Names what she gave up when she chose the kite over the kit" is one.
- **`surface` is mandatory.** This is CLAUDE.md's existing rule — nothing gets taught without
  a place in the town — promoted from a convention to a schema constraint that fails a build.

### A4. Assessment, separated from teaching

Three kinds. Only the last two are evidence.

| | When | Counts as |
|---|---|---|
| **Check** | Immediately after the card, as today | Attention. Never reported, never scored. |
| **Retrieval** | 1, 3, 7, 21, 60 days later — a different question, same objective | Retention |
| **Transfer** | The objective applied on a surface it was not taught on, unprompted | Understanding |

Transfer is the expensive one and the one worth the most. It comes free from a simulation and
from nothing else: a child who was taught unit price at the shop and then, unprompted, compares
two brokerage fees at the Exchange has told you something no quiz can. **Instrument the surfaces
to record it.** That is the highest-value engineering task in this document.

The spacing intervals above are a design assumption to be tuned against this app's own
retention data, not a cited finding. They ship as a config, not a constant.

### A5. Mastery states

Per child, per objective:

```
unmet → introduced → practised → retained → transferred
                          ↑            ↓
                          └──── lapsed ┘
```

- **introduced** — met the card
- **practised** — cleared the immediate check
- **retained** — cleared a retrieval item at ≥ 7 days
- **transferred** — applied correctly on a surface it wasn't taught on
- **lapsed** — failed a retrieval item after reaching retained; re-enters the schedule, and is
  reported honestly

**Lapsed must be reportable and must not be hidden.** A parent report that only ever goes up is
a marketing document, and parents can smell one.

### A6. Mapping to something a parent or school recognises

A curriculum nobody recognises is a private hobby. Candidate frameworks to map objectives onto,
in rough order of value to this audience:

| Framework | Why it matters here |
|---|---|
| **NCFE / NFLAT** (India) | RBI-backed, school-facing; the single most valuable mapping for the primary and diaspora market |
| **CFPB "building blocks" youth model** (US) | Developmental rather than topical — its claim that executive function and habits matter more than knowledge at these ages is the intellectual basis for this whole app |
| **Jump$tart K–12 national standards** (US) | What US schools and parents recognise |
| **OECD/INFE core competencies · PISA financial literacy** | International credibility; useful for any schools conversation |
| **MaPS financial education framework** (UK) | The UK diaspora market |

> **Every one of these must be read and verified before a single objective claims to map to it,
> and before any of it appears in a marketing claim.** CONCEPT §6.6 — never teach a number from
> memory — applies to a standards citation exactly as it applies to an interest rate. The list
> above is a research task, not a completed mapping.

### A7. Placement, not a test

Onboarding must find the child's starting rung without it feeling like an exam. Requirements:

- Framed as *"let's find out where to start"*, never as a score.
- Adaptive: about eight items, stopping as soon as a level is bracketed.
- Assesses the **number spine only** — the maths gate is the thing that genuinely blocks a
  surface (docs/03 §1). Concepts start at rung one for everyone; nobody is told they are behind
  on money at eight years old.
- Re-run silently every season, so a child who has grown at school isn't held down by a
  placement taken a year ago.
- Its output is a starting rung and a set of open surfaces. It is never shown as a number and
  never appears in the parent report as a score.

---

## Part B — A year of content

### B1. The honest arithmetic

Thirty minutes × 365 days is **182 hours**. Nobody authors 182 hours of children's content, and
any plan that implies it is a plan to fail in month three.

So the requirement is not "write more cards". It is: **authored content is the seed; the
simulation generates the volume.** The authored corpus for year one is finite and costable:

| Item | Count | Kind |
|---|---|---|
| Teaching cards (one per objective) | 72 | authored |
| Assessment items (3 contexts × objective) | 216 | authored |
| Townsfolk request templates | 40 | authored, parameterised |
| Season arc beats (4 seasons × ~10) | 40 | authored |
| Family conversation cards (one a week) | 52 | authored |
| World events (weather, tide, shock, festival) | 60 | authored, parameterised |
| **Total authored, year one** | **≈ 480 items** | **a real but finite job** |

Everything else — market days, job rolls, quest instances, request parameters, price shocks,
game difficulty variants — is **generated from the child's own economy**, which is why it never
runs out and why it is always the right size for them.

### B2. The five engines that make the volume

1. **The market.** Deterministic replay of real historical *behaviour* under fictional names
   (CONCEPT §6.2), seeded per child. 365 market days a year, never identical, never invented.
2. **Townsfolk requests.** Templates whose numbers are drawn from the child's own wage and
   costs, so "forty flyers by Friday" is always a meaningful ask and never a trivial one.
3. **The Ledger** (Part A4). Every objective re-asked in a new context on the retrieval
   schedule. Volume = objectives × contexts × the year. This is the largest single source of
   legitimate daily content and it is *also* the assessment. Build it once.
4. **The world state machine.** Weather, tide, season, festival, a strike at the harbour, a
   price rise. Events that change the *arithmetic of a familiar surface*, so a place the child
   knows poses a problem they don't.
5. **Difficulty tied to the number spine.** Change Rush at M3 and Change Rush at M11 are
   different games. Every game declares the M-rungs it can be played at, and rises with the
   child rather than being replaced.

### B3. The shape of thirty minutes

A session budget, because "30 minutes" is otherwise a wish:

| | Minutes | What |
|---|---|---|
| **Arrival** | 4 | What changed overnight; today's three |
| **Lesson beat** | 6 | One new objective, *or* a retrieval beat — never both |
| **Doing** | 12 | Jobs, a game, the market, the shop, a restoration |
| **A decision with consequence** | 5 | The part that is actually remembered |
| **Closing time** | 3 | Today's ledger, and three named things waiting tomorrow |

Closing time is already built. The rest of this shape is the requirement.

### B4. The year above the day

Thirty minutes of the same five things dies in week three. The year needs structure at three
scales, and only the smallest exists today.

**The season — twelve weeks, four a year.** A named arc with a beginning, a complication and an
end. Each season delivers: a district that opens or visibly changes, one new instrument, a
season-long goal the child sets in week one, and a finale that resolves it. *This is what
"month two" is made of.* Year one:

| Season | Weeks | District | Strand focus | The arc |
|---|---|---|---|---|
| **1 · Getting started** | 1–12 | Market Row | EARN, CHOOSE | Arrive with nothing; earn, count, choose; the first jar; the first goal reached |
| **2 · The lean weeks** | 13–24 | The Old Harbour | KEEP, GUARD | Work that varies with the tide; a bill nobody planned for; the buffer that saves you; the first scam attempt |
| **3 · Borrowed** | 25–36 | Mint Square | OWE, KEEP | Something worth having costs more than you hold; credit priced honestly; a repayment kept; arrears met without shame |
| **4 · The long game** | 37–48 | The Exchange | GROW | Risk, spread, time; a bad month survived; the boring diversified player finishes ahead |
| **Review** | 49–52 | Whole town | all | The shop; the independence ratio; a season report worth keeping |

Years two and three re-run the same six strands at higher rungs of the number spine, on the
same map, with the child's own town as it now stands. **The map is the constant; the maths is
what rises.**

**The week.** A rhythm a child can predict and a parent can plan around: pay day Friday, market
day, one townsfolk request with a real deadline, one family conversation card, and the parent
report on Sunday.

**The day.** B3.

### B5. Design constraints that keep it alive

These are testable rules, not aspirations. Each one should fail a build.

- **No two consecutive sessions present the same *shape* of decision.** Not the same content —
  the same shape. Two "pick the cheaper one" days in a row is the boredom failure.
- **Every session contains at least one thing never seen before**, even if small.
- **Every session contains at least one thing exactly as it was left.** Continuity is comfort;
  a world that is entirely new every day is not a world.
- **Nothing is available only today.** Deadlines are allowed and are good teaching. Disappearing
  rewards are engagement bait and are banned (CONCEPT §6.3 and the editorial policy).
- **Missing a day costs nothing.** No streak loss, no decay, no catch-up penalty. A child
  anxious about a streak is a cancelled subscription, and compulsion is not a money skill.
- **The curriculum advances on sessions; the world advances on the calendar.** A child who plays
  three days a week gets the whole curriculum, just over more weeks. Nothing is missed by not
  playing daily — only the town moves on without them, which is true and is the lesson.
- **Thirty minutes is a natural ceiling, not a floor to farm.** After roughly thirty-five
  minutes the day's paying work is genuinely done and the app says so kindly. A children's money
  app that is honest about stopping is the one a parent trusts — and it is a differentiator that
  the ad-funded competition structurally cannot copy.

---

## Part C — Parent reporting

### C1. The principle

**Report learning, not usage.** "Ahana played 40 minutes, 5-day streak" is worthless and faintly
insulting; it tells a parent what they could see from the sofa. This is worth money:

> *Ahana can now work out which of two sizes is better value. She chose correctly seven times
> out of eight this week — including twice when the bigger box was the worse deal, which is the
> one that catches most adults.*

The first is a usage metric. The second is a claim about a child, it is defensible from the
mastery record, and it is the reason someone renews.

### C2. The weekly report — the renewal engine

Sunday. Seven items, in this order, and the order matters:

1. **One sentence at the top.** What changed this week, in human words. If nothing changed,
   it says so.
2. **What moved.** Objectives that reached *retained* or *transferred*, named in plain English —
   never codes, never percentages of a syllabus.
3. **One decision, told as a story.** The moment worth knowing about, with the road not taken:
   *"On Tuesday she was offered a loan for a bicycle. She worked out it would cost ₹340 more
   and waited three weeks instead."* This is the single most-read item in the report and it is
   only possible if decisions are logged with their alternatives — see C5.
4. **What she found hard.** Honestly, including anything that lapsed. A report that only goes up
   is not believed.
5. **The conversation card.** One question to ask at the table this week, the answer the app
   would accept, and *why it is the answer*. This is the highest-value item in the product: it
   makes the parent a teacher rather than an audience, and it is what makes the app complement
   what they are already teaching instead of competing with it.
6. **One thing to do in real life.** *"Let her pay at the shop and count the change back."*
7. **What's next.** The coming week's objective, so a parent is never surprised by what their
   child was taught.

**Never in the report:** a streak, a leaderboard, a comparison with other children, a percentile,
a nudge to increase screen time, or any offer.

### C3. Cadence

| | When | Purpose |
|---|---|---|
| **Weekly digest** | Sunday | The habit. The renewal leading indicator. |
| **Monthly summary** | Month end | Progress across the mastery map |
| **Season report** | Every 12 weeks | The milestone. Printable, keepable, sendable to a grandparent — and the strongest referral surface in the product. |

### C4. The in-app parent surface

The existing Parents page becomes the live view of the same data: the mastery map (six strands
× rungs, coloured by state), the decision log, the conversation history with which cards were
actually used, chores, and settings.

Two hard requirements it fails today:

- **An adult gate.** There is none. Any child can open the Parents page and press *Jump to the
  next pay day* and *Add 200 XP*. Those are honestly-labelled prototype tools, but as long as
  they are reachable the economy is decorative and the app teaches that the way to get money is
  to cheat time — which is the exact failure CLAUDE.md names.
- **A read-only child view of their own record.** A child should be able to see what they have
  learned. They should not be able to change it.

### C5. What must be logged for any of this to be writable

The report cannot be written from the data the app keeps today. Every consequential choice needs
a record with **the alternative not taken**, because that is what makes a sentence worth reading:

```jsonc
{
  "t": 1756339200000,
  "objective": "OWE-3",
  "surface": "bank",
  "chose": "wait",
  "alternatives": [{ "id": "borrow", "cost": 340, "label": "Loan for the bicycle" }],
  "reversed": false,          // did they change their mind, and how fast
  "outcome_at": 1757548800000 // when the consequence actually landed
}
```

### C6. Evidence, and staying honest about it

If the product is going to claim a child learned something, the claim has to survive a sceptical
parent:

- A **baseline** at onboarding (A7) and a re-measure each season, so movement is measurable.
- Assessment **separate from teaching** (A4), or the movement means nothing.
- A **season checkpoint** that produces one defensible statement per strand.
- **Never** a claim of the form "children using this improve X%" until there is a study that
  says so. Nothing in this app's marketing may assert an outcome the mastery record cannot
  demonstrate for that individual child.

### C7. Data rules, unchanged

The report is generated from the child's own simulation state. It contains what happened *in
Bizzington* and nothing else. It never contains, infers or asks about the family's real money;
no behavioural profile is built; the existing minimal-data rule (first name and an age band) is
untouched by everything above. This is a selling point, not just compliance — say it plainly on
the parents page.

---

## Part D — What this means for the build

New modules, roughly in dependency order:

| Module | Owns |
|---|---|
| `content/objectives.json` | The 72-objective graph — ids, prerequisites, surfaces, parent lines. **Nothing else can be built first.** |
| `content/assess/*.json` | Retrieval and transfer items, keyed to objectives |
| `src/mastery.js` | Per-objective state machine (A5). The single source of truth for anything reported |
| `src/ledger.js` | The spaced-retrieval scheduler; decides what today's lesson beat is |
| `src/decisions.js` | The consequential-choice log (C5) |
| `src/season.js` | The twelve-week arc state machine, world events, the weekly rhythm |
| `src/report.js` | Generates weekly / monthly / season reports from mastery + decisions |
| `src/placement.js` | Adaptive placement on the number spine (A7) |
| — | An adult gate on the Parents page, and the server clock. Small, and blocking. |

Existing modules change as follows: every card in `content.js` gains an `objective`; every game
declares the M-rungs it plays at; every surface that can demonstrate an objective calls into
`mastery.js` when it does; `sim.js` keeps owning the money and gains nothing here.

### What to measure

| Metric | Why |
|---|---|
| Objectives **retained** per active week | The only real product metric. Everything else is a proxy. |
| D30 / D90 retention of *sessions containing a lesson beat* | Opens are not sessions |
| Parent report open rate | The leading indicator of renewal, by a distance |
| Conversation-card use (one-tap self-report) | Whether the app is complementing the parent or replacing them |
| Transfer events per child per month | Whether any of it is actually understood |
| **Share of sessions over 45 minutes** | A **warning** metric, not a win. If this rises, something in here has become compulsive and needs removing. |

### Order of work

1. `objectives.json` for **one strand** (CHOOSE, twelve rungs) end to end — objective, teaching
   card, three assessment contexts, transfer surfaces, parent line.
2. `mastery.js` + `ledger.js`, and instrument the shop and the market for transfer.
3. `report.js` — the weekly digest, generated for that one strand.
4. Read it as a parent. **If the report is not worth reading for one strand, six strands will
   not fix it** — the shape is wrong and must be fixed before any content volume is authored.
5. Only then author the other five strands and the season arcs.

Steps 1–4 are perhaps a fifth of the work and settle whether the product is real. Nothing about
payments, accounts or acquisition should be touched until a parent has read that one report and
wanted the next one.
