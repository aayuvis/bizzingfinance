# The three journeys — finance is learnt on the job

*Binding once merged, like docs/05 and docs/08. This reframes what the app IS;
docs/05's mastery mechanism and docs/08's maths-gated ladder are unchanged
underneath it.*

## 1. The thesis

Nobody learns money from a curriculum. A child learns money the way an adult
does: by having a household that costs something, work that pays something,
and savings that have to go somewhere — all at once, every week, with the
same wallet. The lessons exist to serve those responsibilities, not the other
way round.

So the app is not a course with games attached. It is **a daily life the
child runs**, made of exactly three ongoing responsibilities:

| journey | the child is | the daily question |
|---|---|---|
| **The Household** | a person with a home | *can I cover my life, and what's left over?* |
| **The Livelihood** | a worker, then an owner | *what is my time worth, and can I make it worth more?* |
| **The Portfolio** | an investor | *where does the left-over live, and what is it doing?* |

Everything in the app belongs to one of the three or it belongs to the
curriculum that feeds them. Anything that belongs to neither is decoration
and should be cut.

## 2. Why three, and why these

They are the three balance-sheet roles a person ever has — consumer,
producer, allocator — and they teach different things that only make sense
together:

- The Household teaches **budgeting** — but budgeting is meaningless without
  an income that arrives from somewhere real, which is the Livelihood.
- The Livelihood teaches **earning and enterprise** — but earnings are
  pointless without somewhere for the surplus to go, which is the Portfolio.
- The Portfolio teaches **allocation and risk** — but risk only means
  anything to someone whose rent is due, which is the Household.

One wallet (CONCEPT §6.4) is what fuses them: the shop's takings, the shift's
wages and the dividend land in the same money the rent leaves from. Cut the
wallet three ways and you have three mini-games; keep it whole and you have
a life.

## 3. Where each journey already lives, and what it still needs

### The Household — Your place · the Jar Shed · the Build Yard · the postbox
**Have:** a home with a weekly cost, pay-day jar splits, goals that build,
one letter a day, the independence meter (earnings ÷ life cost).
**Missing:** *decisions arriving uninvited.* A household is not a static
cost — it is a stream of small shocks and offers: the tap breaks (pay now or
pay more later), the landlord raises the rent (move? negotiate? absorb?), a
festival month doubles the food bill, an insurance letter offers to cap a
risk for a fee. The postbox is the delivery mechanism and it already exists;
the letters need to become **choices with consequences that land on the
wallet**, logged by `decisions.js` like everything else.

### The Livelihood — the stall · Nana's shop · the thirteen jobs
**Have:** shifts that pay by performance, a shop with real accrual
accounting — stock, weighted-average cost, pricing against elastic demand,
P&L, a balance sheet that balances, loans and equity.
**Missing:** *the arc made visible.* Worker → better worker → apprentice →
owner is the oldest story in economics and the app has all the pieces but
tells it as unlock thresholds. The journey needs a face: today's wage per
hour, this month's takings, the moment the shop's profit first beats a
week's wages — that crossover is the single most important chart in the
whole app and it is currently drawn nowhere.

### The Portfolio — the Bank · the Exchange · the Market Game · the Register
**Have:** seven asset classes priced off one world model, a 40-year market
campaign with annual reports and PESTEL events, decision-scored (never
returns-scored, CONCEPT §6.3).
**Missing:** *the daily drip and the paper track.* Two tracks, per the thesis
that play-learning and paper-practice teach differently:

1. **Play-learn** — the Market Game as built: compressed decades, fictional
   companies, consequences in minutes.
2. **Paper** — a slow portfolio at real-world speed. On the fictional
   Exchange this is full paper trading: positions, a thesis written at entry,
   reviewed when closed. For **real** companies the rule is absolute
   (CONCEPT §6.2): a real name may appear only read-only and never as a
   thing to buy — so the real-world track is a **watchlist with a thesis
   journal**: the child picks real companies in the read-only Register,
   writes *why* they think each will do well or badly, and the app replays
   the verdict weeks later. Conviction, patience and being wrong in public —
   everything a paper portfolio teaches — with no position, no real name
   attached to a buy button, and no licence question.

## 4. The daily loop — "your daily life kind of app"

Fifteen minutes, same shape every day, one beat per journey plus the lesson
that feeds them:

1. **Postbox** (Household, ~3 min) — today's letter: a bill, an offer, a
   shock. Decide, log, done.
2. **Work** (Livelihood, ~5 min) — a shift played, or a shop decision:
   restock, re-price, read yesterday's till.
3. **Market day** (Portfolio, ~2 min) — the week ticked: what moved, one
   thing to notice, occasionally one thing to do. Most days the right action
   is nothing, and the app should say so — patience is a taught behaviour.
4. **The lesson beat** (~5 min) — spaced retrieval from `mastery.js`, themed
   to whatever the three journeys surfaced today.

The town is already the map of this: Your place, Jar Shed, Build Yard and
postbox are the Household's buildings; the stall and Nana's shop are the
Livelihood's; the Bank and Exchange are the Portfolio's. Home's street IS the
three-journey dashboard — each building should show at a glance whether its
journey needs the child today (a lit window, a full letterbox, a bell).

## 5. What this changes in practice

- **Home reorganises by journey, not by feature.** Three cards under the
  street — Household / Livelihood / Portfolio — each showing its one daily
  beat and its one headline number (left-over this week · wage this week ·
  portfolio move this week).
- **The parent report gets three columns** with the same names. "Ahana kept
  her household solvent 6 weeks running; her shop's margin went from 12% to
  19%; she held through a 20% drawdown and wrote why." That sentence is the
  product.
- **The mastery record tags every objective** with the journey it serves, so
  the lesson beat can follow the child's actual week.
- **Nothing new is added that doesn't land on one of the three.** The next
  feature question is always: which journey, which daily beat, which number?

## 6. Build order

1. Home's three journey cards (surfacing what exists — no new engine).
2. Postbox letters become decisions with wallet consequences (Household).
3. The crossover chart: wages vs. shop profit over time (Livelihood).
4. Market day drip + the Register thesis journal (Portfolio).
5. Parent report in three columns.
