# Bizzing Finance — games specification (build-ready)

**For:** the Bizzing Finance chat, working on the live branch `claude/peaceful-mayer-8v29cu` (deployed to Bizzington;
`4b59d89`).
**From:** the games audit (4 Oct 2026, at `0b7a02b`), which played 17 games with keyboard, touch, a random bot and a
perfect bot. Re-checked on 9 Oct against the 31 commits since.

**What has landed since the audit** (credit where due):
- **Easy · Standard · Tricky on every game,** with pay measured against each level's own par, so a harder level is a
  challenge, never a bigger payday (`534de2f`).
- **Three decision-based goals per game,** paying nothing.
- **Compound Climb retuned** so the steady middle wins and full charge can wipe you out (`e234395`).
- **Main Street gets levels.**
- **Games draw their things** instead of showing emoji.
- **Pip's counting check.**

**Still live** (confirmed in today's code; "still live" in this document means this):

| Bug | Where |
|---|---|
| **Stall Rush double-prices its wage** | `arcade.js:1299` `payout(profit/14)` → `price()` again |
| **Main Street pays outside the cap** | `board.js:160` `sim.earn` |
| **The Market Game's first decade crashes** | `explainYear` returns `[]` for year 0 |
| **Fixed seeds:** the same cards and storms every play | Needs vs Wants 7717, Scam Spotter 3391, and others |
| **The Market Cup "best" is the first finish, never updated** | `arcade.js:818` |
| **Today's till cannot be solved in $/£/€** | — |

**Rules that bind everything here:**
- **Finance's CONCEPT §6:**
  - no real money;
  - nothing is advice and no real security is buyable;
  - **no gambling mechanics**;
  - **score the decision, never the returns**;
  - one currency, the town's money, which is the curriculum;
  - never assume a family's money;
  - never teach a number from memory (`sources.js`);
  - credit is a tool with a price, never a moral failing.
- **The town rules:**
  - nothing is taught without a building;
  - every screen declares the arithmetic it needs;
  - percentages are a display format.
- **The family rules:** one in, one out; the level rule; symmetric full-bleed stages; meaty flagships.

---

## 0. Executive summary

**Why the gap is bigger here.** Finance has the most games (17) and the best individual ideas in the family. The Market
Game, Market Storm and the Market Cup are things no other kids' app attempts. But the audit found:

1. **The economy is broken in three places,** two of them still live:
   - **Stall Rush pays about ₹1,900–2,100 a round** (20 jobs' worth) through a double currency conversion;
   - **Main Street pays outside the daily cap**;
   - the old Compound Climb paid on greed (now fixed).
2. **Four games teach the reverse of their lesson:**

   | Game | Lesson | What it actually rewarded |
   |---|---|---|
   | Budget Blitz | paying needs first | **skipping every bill** set the personal best |
   | Market Storm | not panic-selling | **doing nothing auto-sold you** |
   | Stall Rush | busy is not profitable | **every item profits and stock is free**, so mashing scores 92% of perfect |
   | Compound Climb | steadiness | max greed (since fixed) |

3. **The flagship idea is broken on first contact.** The Market Game crashes on its first decade, and its answer key
   sometimes contradicts the sheet the child just read.
4. **Nothing varies between plays.** Fixed seeds mean every replay is memory.
5. **The money skills that matter most have no game:**
   - **comparing prices** (the unit price);
   - **what a loan really costs over time**;
   - **saving towards a goal over weeks.**
6. **Four of the job mechanics are one reflex game** (stack, balance, catch, dodge) in four skins, with no money in
   them.

**What we do:**

| When | What |
|---|---|
| **Week 1** | **Economy hotfix:** one pay path (no double pricing, Main Street through the cap); the Market Game crash; Today's till in every currency; seeds per play everywhere; a wrong answer holds; every game its own "You practised" line |
| Weeks 2–4 | **Make every game teach its own lesson:** Budget Blitz becomes **Month Planner**, with real trade-offs; Market Storm becomes plan-based; Needs vs Wants and Scam Spotter become one **Smart Choices** hub with a new **Better Buy** mode; The Snowball merges into Compound Climb; Times Twelve merges into Month Planner |
| Weeks 3–10 | **Two flagships:** a new ***Stall of My Own*** (an 8-week business season on Market Row: stock, prices, weather, waste, a cart to save for); and the ***Market Game***, fixed and promoted |
| Weeks 5–8 | **A new decision game, *Save or Borrow?*** at the Bank: a goal, a price, a calendar, and the true cost of each path |
| Weeks 6–9 | **One Shift engine** for jobs, with a money decision in each (count, give change, balance the books, price the load) |

**Play tab: 12 cards → 10** (§3).

**Key insight.** Finance's games already *look* like a town. What's missing is that **decisions and money actually
connect**. Every fix here makes a choice cost something, or save something, that the child can see. The two new games
cover the three money skills a child will use for life: comparing prices, borrowing, and saving over time.

---

## 1. Shared foundations (week 1, the hotfix)

### 1.1 One pay path (still live)

**Every** game's wage goes through `payout()` → `sim.gameWage` (the daily cap, levels and par), with **no second
`price()`**.

- **Stall Rush:** `payout()` takes *base units*. Pass the decision score (§2.1), never `profit/14` of an amount already
  in rupees. A round pays in the arcade's normal band (about ₹60–150 at Standard in INR, scaled per currency by
  `price()` once).
- **Main Street:** replace `sim.earn(c, g.won, …)` (`board.js:160`) with `payout()`, so it counts towards the
  three-a-day cap. Its quests tick **on finish**, not when the intro card opens (`main.js on("game")`).
- **Today's till:** one daily wage through the same path. Remove the extra `questTick("earn")`.
- **Wage norm:** a perfect Standard round of any arcade game pays about the same for the same minute. Change Rush
  (₹627) and Needs vs Wants (₹80) are rebalanced to the norm.
- **Test (economy.mjs):** every game's maximum wage per round is within 1.5× of the norm, and Main Street's wage counts
  against the cap.

### 1.2 Seeds per play
- Every game draws its content from a **per-play seed** (Change Rush already does).
- The seed is stored with the round for review and replay. Content variety is simulation, never a reward: **no reward is
  random** (rule 3).
- Card games get **larger pools** (§2.2).

### 1.3 A wrong answer holds
- In Needs vs Wants, Scam Spotter and every sort or quiz step, the wrong card **stays**, with its note naming the item
  and the right side, until **Continue**.
- Today the correction appears under the *next* card ("A new game. That one you would be in trouble without").

### 1.4 Each game's own end card
- **Every game and job** writes its own "You practised…" line and its own capped notice: "Paid plays used for today: this
  one is practice, and it still counts toward your goals".
- Today jobs show the *last arcade game's* lines, and capped plays show "Earned ₹0." with no reason.

### 1.5 Clocks
- Most loops now use `dt` up to 1000 ms with sub-steps (good).
- **Verify with a throttled-CPU test** that every timed game's clock runs at 1.0× wall time at 4 fps:
  - Change Rush's 60 s;
  - Compound Climb's charge;
  - Market Storm's 42 s;
  - the Sweep job's 45 s.
- Re-fix any that drift.
- Every game pauses on `visibilitychange`.

### 1.6 Currency everywhere
- One formatter for sub-units: 25¢, 50 fils, 20p.
- **Change Rush coins and targets** (today a quarter shows as "$25"), **the till's receipts** (built in the display
  currency so they always add up) and every price in every game use it.
- **Test:** for each of ₹, $, £, €, AED, every game's prices add up, and the till is solvable on 365 of 365 days.

### 1.7 The level rule (owner) on top of Easy · Standard · Tricky
- **Today:** a level is chosen and remembered.
- **Add the owner's rule:**
  - after each round, a decision score **≥ 50% of the level's par keeps the level**;
  - **under 50% offers one level down** (never forced);
  - **≥ 1.6× par offers the level above.**
- The three named goals stay as they are, paying nothing.

### 1.8 Small shared fixes
- 44 px targets: Market Cup steppers (32 px today), Main Street tokens (8 px dots become avatars).
- **Dark-mode contrast on end cards:** Budget Blitz's and Market Storm's key sentences are near-invisible today.
- Blurbs must be true: "Sort it before the bell" (there is no bell); "Half of these are perfectly ordinary" (4 of 10 are).
- Use **Finance's own icons**, not 💹 (a yen chart in an INR app).

---

## 2. The games: one lesson each, and the game teaches it

### 2.1 Stall of My Own (new flagship; absorbs Stall Rush)

**The promise:** *busy is not the same as profitable*, and a business is a run of small decisions about stock, price and
waste, adding up over weeks.

**The place:** **Market Row**, Bizzington. It is a real building on the town map, so the town rule is met.

**A season is 8 weeks.** Each week has two parts:

1. **Plan (no clock):**
   - **Buy stock** from the wholesaler. Prices move a little each week, with a **"why"** line ("lemons are dear this
     week: a dry spell up the coast").
   - **Set your prices.** A demand strip shows *about how many customers will pay this much*, drawn from the season's
     simulation, never random per sale.
   - **Read the week ahead.** The weather forecast and the town calendar (a festival, the school holidays, a rainy week).
   - **Put money in the cart jar.** The season goal is **a better cart** (it sells faster) or a **sign** (it brings more
     customers).
2. **Market day:** about 60 seconds of serving the queue, which is Stall Rush's real-time stall, kept because it is fun.
   - A **wrong serve** loses that customer.
   - **Restocking takes real time:** serving stops while you restock (today it doesn't).
   - **Auto-serve** is offered for children who find the reflex part hard. It costs a little goodwill, so decisions stay
     the heart.

**End of the week: the ledger page.** It separates, plainly:
- **Takings** (revenue);
- **What it cost** (stock bought, cart payments);
- **Unsold and spoiled** (perishables go off; dry goods carry over);
- **Profit**;
- **The cart jar**.

The first time takings are high but profit is low, Bea (the stall owner next door) says: *"Busy day. Now look at what
it cost you."*

**Events, one or two a season** (from the season seed):
- rain;
- a rival stall opposite;
- the wholesaler's price rise;
- a festival rush;
- **a cart offer on credit** ("₹200 now, or ₹30 a week for 8 weeks"). The **total cost is shown in coins** ("₹240 in
  all"), with the choice left to the child and never shamed (rule 7).

**What is scored (the decision, never the profit alone):**

| Signal | Why |
|---|---|
| **Margin kept:** profit ÷ takings, shown as "₹ kept from every ₹10" until percentages are met | busy ≠ profitable |
| **Waste kept low:** spoiled ÷ bought | over-stocking costs money |
| **A buffer kept:** never broke on a market morning | survival |
| **Goal reached** (the cart or sign by week 8) | saving over weeks |
| **Fair prices:** not priced so high the queue empties | a price is a trade-off |

- **A random player loses money**, and the season must be able to lose. Today Stall Rush can't.
- A careful player hits the goal with a buffer. A greedy price-gouger sells little; an over-stocker wastes; a mashing
  server loses customers.

**Levels** (Easy · Standard · Tricky):
- **Easy:** 2 products, steady prices, no spoilage.
- **Standard:** 3 products, weather and spoilage.
- **Tricky:** 4 products, a rival and the credit offer.

**Arithmetic gate** (rule: every screen declares its maths): margins and waste are shown in coins until
`ledger.mathsMet('percent')`, then also as %.

**Pay:**
- The **wage per week played** goes through `payout()` against par on the decision score.
- **A season completed with its goal** earns a **keepsake for the Collection shelf**, counted from the ledger (never
  given for showing up).
- Family coins only through Finance's standard events: a chapter's test, not this game.

**Acceptance:**

| # | Check |
|---|---|
| SA1 | A random bot (random stock, prices and serves) ends 8 weeks with less money than it started in ≥ 80% of seasons |
| SA2 | A "price high" bot sells under half of a fair-price bot's volume |
| SA3 | An over-stock bot's waste exceeds 25% |
| SA4 | Restocking blocks serving |
| SA5 | The credit offer shows its total cost in coins, and it is never labelled good or bad |
| SA6 | Seasons differ by seed; the same seed replays exactly |
| SA7 | Wage per week is within the norm (§1.1) |

### 2.2 Smart Choices (Train): one hub, three modes; replaces Needs vs Wants and Scam Spotter, adds Better Buy

Needs vs Wants and Scam Spotter share one binary-sort engine, and a coin flip scores 52–63%. The hub keeps the good
writing and makes each choice *real*.

**Mode 1: Needs and Wants.**
- A **pool of 60 or more** cards, shuffled per play.
- **"Both" becomes a third button.** It must be backed by **a reason chip** ("both: you need shoes; *these* shoes are a
  want"), so "both" stops being a free point.
- The wrong card holds with its note.
- Keep the outro: *"a list somebody else wrote for you."*

**Mode 2: Scam Spotter.**
- Messages are **generated from parts**: hook (a reward or a fright) × hurry × secret × channel (text, email, game chat).
  The **shape decides, not capital letters** (today 4 of 6 scams shout, and "ALL CAPS = scam" scores 8/10).
- Ordinary messages sometimes shout; scams are often polite.
- **A second step:** after "It's a trap", **tap the phrase that gives it away**. That is the skill.
- Keep the notes: "the secrecy is the tell".

**Mode 3: Better Buy (new).** The unit-price skill no game teaches today.
- Two shelf tags: *6 pencils for ₹90* · *10 pencils for ₹140*. **Which is cheaper per pencil?** Type or pick, then see
  it worked out ("₹15 vs ₹14 each").
- The judgement layer at higher levels:
  - "Cheaper each, but do you need 10?" (waste);
  - "the big bottle costs more per litre" (bigger isn't always cheaper);
  - "buy one, get one at half price" (is it, really?).
- The arithmetic gate applies (division needed). Easy uses round numbers.

**Levels** apply per mode. The pay is the arcade wage per round.

**Acceptance:**
- a coin-flip bot scores ≤ 35% in each mode;
- "ALL CAPS = scam" scores no better than chance;
- every Better Buy pair's right answer is proved by the generator.

### 2.3 Month Planner (Train): Budget Blitz rebuilt; Times Twelve merged in

**Today:** the personal best is *money left over*, so skipping every bill wins. The pot never tightens, and the end card
names nothing.

**Rebuild:**
- **A month's pot is sometimes smaller than all the bills.** On Standard, one month in three. On Tricky, two in three.
  The child must choose: pay the needs, push a want, move something to next month.
- **The score is needs paid plus a buffer kept, never the leftover.**
  - An unpaid need **rolls into next month, named**: "Rent moved to next month: next month starts ₹120 shorter".
  - The end card lists each.
- Bills vary by seed, and the labels are realistic for a child: club fees, a bus pass, a phone top-up, a gift, a repair,
  savings. **No assumption about the family's own money:** it is *your stall's* or *your pocket money's* month, never
  the household's (rule 5).
- **The "what does it cost a year?" step** (from Times Twelve): before paying a monthly or weekly bill, the child
  **types** its yearly cost (×12 or ×52) once a round. This removes Times Twelve's "second-largest option" leak by
  typing, not choosing. Distractor slips (×10, ×4) are shown as common mistakes after a miss.

**Acceptance:**
- a skip-all bot scores below a pay-needs bot at every level;
- the yearly step is typed and checked;
- missed needs are named on the end card.

### 2.4 Compound Climb (Train): keep the retune; The Snowball merged in as the estimate step

- **Keep the retune** (`e234395`): the steady 45–65% charge wins, and full charge can wipe you out.
- **Make sure the score is the decision,** not the tower:

  | Score | Why |
  |---|---|
  | survived 15 years | risk control |
  | target reached with the least swing | steadiness |
  | **estimates** close (below) | understanding compounding |

  The wage is flat on that score.
- **The Snowball becomes the estimate step.** Every 5 years, *before* the climb continues, the child **drags a marker**
  to where they think the tower will be in 5 more years at a steady charge. They are scored by closeness, then see the
  bands. This replaces the multiple-choice "second-largest option" leak with an estimate, as the audit asked.
- **Years drawn per play,** so the best holds can't be memorised.
- The charge uses `performance.now()` (verify at 4 fps, §1.5).

### 2.5 Market Storm (Play): the plan is the game

**Today:** doing nothing auto-sells at 17 s, so inaction (the lesson) loses, and any rhythm of the space bar wins.

**Rebuild:**
1. **Before the storm: write your plan.**
   - The child picks **when they would sell**, from three honest options:
     - "only if the company stops making money";
     - "if it falls by half";
     - "never, for this money".
   - And **why they bought**, from the company's card.
2. **During the storm:**
   - Panic rises, the cast shouts, and headlines arrive.
   - **Nothing auto-sells.** **SELL** is the only exit.
   - **Space re-reads your plan**, the help that is available.
3. **The storms vary per play,** including **one in five where the company really does stop making money** (the
   headline says so). There, the plan says *sell*, and keeping to it is right.
4. **What is scored: keeping to your plan, and reading the news.**
   - Selling in a fall when the company is fine scores low.
   - Holding when the plan's sell condition is met also scores low.
   - **The money outcome is shown but never scored** (rule 3).

**Acceptance:**
- a do-nothing bot is never auto-sold;
- a random-press bot scores ≤ 30%;
- in "company stops" storms, a keep-to-plan bot that sells scores highest.

### 2.6 The Market Cup (Play): keep; vary the seasons

- **Seasons drawn per play** from the series, as Bea's own line promises ("run another six weeks and see whether that
  keeps happening: that question is the game").
- **Fix the "best" record:** it should update (`arcade.js:818`), and show the **trend across seasons**.
- **Steppers ≥ 44 px.** Add a practised line.
- **Copying Bella** is a tie, shown as a tie, not a win.

### 2.7 The Market Game (flagship): fix, then promote

**Why flagship:** study before you buy, be judged on *the reason*, and see the money shown as partly the decade you were
handed. It is the deepest idea in the family.

**Fixes (week 1 for the crash):**
- **The crash:** the caller in `marketgame.js:338` must handle year 0 (`explainYear` returns `[]`), or `explainYear`
  returns `{move:0, reasons:[]}`. Add a test that starts every decade.
- **The answer key must agree with the sheet.** Derive each company's correct "what could hurt it" from the **risk the
  sheet itself states**, or accept any reason the sheet supports.
  - Today Great Western Rail's sheet says "volumes follow the economy", yet the key says "rates".
  - "Interest rates" is right for 21 of 40 companies, so always answering it scores 53%.
  - Rebalance so no single answer covers more than 30%.
- **Reset the score per decade.** Event tags render as words, not "N" or "S".
- **The level-13 lock** applies to the ☰ drawer link too.

**Promote:**
- A **how-to card** and a painted **Exchange hall** stage.
- A **reading-first** flow: three company sheets, each with a "what could hurt it" choice, *before* any money moves.
- The **review** keeps "how well you read them" first, and money second.
- **Real names:** only in the read-only, labelled market window, never with a buy button (rule 2). Companies stay
  fictional.

### 2.8 Change Rush (Play): keep; the best arcade game

**Keep:** the arithmetic *is* the mechanic, and a random player scores 3% of a careful one.

**Fix:**
- the clock at low frame rates (§1.5);
- the currency sub-units (§1.6);
- the readable "Over by ₹7" label;
- after an overpay, **show which coin would have made it exact**;
- the wage norm (§1.1).

### 2.9 Main Street (Play): the family board game

- Pay through `payout()` (§1.1); quests tick on finish.
- **Dice seeded per game:** today identical rolls make "always buy" a guaranteed win.
- **Cash-flow pressure,** so over-buying can force a sale at half price. The new "never sold at half price" goal then
  means something.
- **Avatars as tokens** (today 8 px coloured dots, colour only) and a drawn board.
- Keep the definition of rich: *your income covers your expenses*.

### 2.10 Save or Borrow? (new, at the Bank): in for Times Twelve's card

**The promise:** what borrowing really costs, and when it's worth it. Credit is a tool with a price (rule 7).

**The place:** **the Bank** in Bizzington (unlocked at level 11, so it sits where the town says).

**A round is three goals.** Each goal is a thing a child might want, with a price and a weekly income from the town's
jobs:

> *A bicycle: ₹1,200. You earn about ₹150 a week.*

The child is offered **two to four paths**:
- **Save:** about 8 weeks, then buy;
- **Borrow now:** ₹180 a week for 8 weeks;
- **Second-hand:** ₹700 now, but it may need a repair;
- **Wait for the sale:** ₹1,000 in week 6.

**Step 1: predict.** Before choosing, the child **types the total cost of the borrowing path** (₹180 × 8 = ₹1,440).
This is the core skill, checked. A miss holds and shows the sum.

**Step 2: choose.** No path is labelled right.

**Step 3: live it.** A **calendar strip** fast-forwards the weeks for **every** path side by side:
- money in the purse;
- weeks you had the bicycle;
- interest paid;
- whether a surprise (a birthday, a repair) broke the plan.

**Step 4: the comparison card:**

> "Saving cost ₹1,200 and you rode from week 8. Borrowing cost ₹1,440 and you rode from week 1: ₹240 for 7 weeks of
> riding."

**Sometimes borrowing is the better path:**
- **The bicycle lets you take the delivery job**, which pays ₹250 a week, so borrowing to start sooner earns more than
  it costs. This is the investment loan.
- The game shows this honestly. It never preaches "never borrow".

**Levels:**

| Level | Paths and rates |
|---|---|
| Easy | Save vs wait for the sale (no interest) |
| Standard | Adds a simple borrowing path with a flat fee |
| Tricky | Two loans to compare (weekly vs one-off fee) and the investment-loan case. Rates shown as **coins per week**; % only once the maths is met |

**Rates and prices** are **town dials registered in `sources.js`** (rule 6). There is no invented "real" rate.

**What is scored:**
- the predicted total, typed and correct;
- a plan that keeps a buffer through the surprise;
- reading the comparison card's question ("Which path cost more in all?").

**Never scored:** the choice of path itself.

**Acceptance:**

| # | Check |
|---|---|
| SB1 | Every total-cost answer is computed by `sim.js`, never by a view (the money rule) |
| SB2 | No path is ever labelled right or wrong |
| SB3 | Every rate is in `sources.js` |
| SB4 | The investment-loan case appears at Tricky and pays off when taken |
| SB5 | A random bot scores ≤ 20% (the predict step is typed) |

---

## 3. The ledger (one in, one out)

**Play tab today: 12 cards.**
- Change Rush · Needs vs Wants · Scam Spotter · Budget Blitz · Compound Climb · Stall Rush · Market Storm · The Market Cup
  · Main Street · Times Twelve · The Snowball · The Market Game.
- In Town: 4 job mechanics (13 jobs) and Today's till.

| Out (or folded in) | Where it goes | In | Why |
|---|---|---|---|
| Needs vs Wants + Scam Spotter (2 cards) | Two modes of **Smart Choices** | **Smart Choices** (1 card, adds Better Buy) | One binary-sort engine in two cards; coin flips scored 52–63% |
| Stall Rush | Its real-time stall is the market-day half of the flagship | ***Stall of My Own*** | Can't lose money and paid 20× a job; the real lesson needs weeks |
| Budget Blitz | Rebuilt | **Month Planner** | Its best rewarded paying nothing |
| Times Twelve | Its yearly-cost question becomes Month Planner's typed step | ***Save or Borrow?*** | A leaky multiple-choice drill; the free card goes to the loan lesson nobody teaches |
| The Snowball | Becomes Compound Climb's estimate step | — | Duplicated Compound Climb as a leaky quiz |

**After: 10 cards.**

| Group | Cards |
|---|---|
| **Flagships** | Stall of My Own · The Market Game |
| **Train** | Smart Choices · Month Planner · Compound Climb · Save or Borrow? |
| **Play** | Change Rush · Market Storm · The Market Cup · Main Street |

**Test T16:** Play shows 10 cards.

### 3.1 Jobs: one Shift engine with money in it (Town, not Play)

**Today:** four reflex mechanics (Stack, Trim, Sweep, Runner) wear 13 job names. A random player in Trim scores 69% of
perfect. The HUDs freeze, and two never end.

**The Shift engine** has one frame and four money-skill templates. Every shift **has an end**, a **live HUD**, its **own
end card**, and pays through `sim.doJob` by **accuracy**, not reflex:

| Template | Jobs | What the child does |
|---|---|---|
| **Count** | Stack crates · Haul | Count the delivered crates against the order slip and **flag the shortfall** ("ordered 12, came 10") |
| **Change** | Mind the counter · Run orders | Customers pay; **give the change** with the fewest coins (Change Rush's skill at the counter) |
| **Ledger** | **Do Nana's books** · Mend the nets | Each receipt is + or −. **Keep the running balance**, and spot the line that doesn't add up |
| **Route** | Deliver flyers · Run errands · Sweep Market Row | Plan the **cheapest route** on the town map (bus fare vs walking time), then walk it |

- **Shift length:** 12 items or 90 seconds.
- **Quality** = accuracy (clamped as now).
- **Easy · Standard · Tricky** apply.
- **Today's till** stays the household's daily puzzle (fixed by §1.1 and §1.6), with Enter submitting.

---

## 4. Pay (after)

| Where | Pays (town money, through `payout()` / `doJob`) | Never pays for |
|---|---|---|
| Every Play game | the wage against its level's par, on the **decision score**, 3 paid plays a day | outcome money, mashing, time |
| Stall of My Own | the wage per week played (decision score); a keepsake for a season with its goal | profit alone |
| Save or Borrow? | the wage on predicted totals and buffers | the path chosen |
| Jobs | `doJob` by accuracy, once a day per job | reflex alone |
| Today's till | one daily wage | — |
| **Family coins** | only Finance's standard events (answer, lesson, test, chapter), never from a game | — |

**The town's money never buys a face, a world or an extra** (owner rule), and nothing here changes that.

---

## 5. Tests (added to `npm test` / `test/browser.mjs`)

| # | Test |
|---|---|
| T1 | **Economy:** every game's best Standard round pays within 1.5× of the norm; Main Street counts against the cap; no game calls `price()` twice |
| T2 | **The Market Game:** every decade starts and finishes; no single "what could hurt it" answer is right for more than 30% of companies; the score resets per decade |
| T3 | **Currencies:** in ₹, $, £, €, AED every price adds up, and the till is solvable 365/365 |
| T4 | **Seeds:** two plays of any game differ; one seed replays identically |
| T5 | **A wrong answer holds** in every sort and quiz step |
| T6 | **Own end cards:** every game and job shows its own practised line; capped plays explain themselves |
| T7 | **Clocks at 4 fps** run at 1.0× wall (±5%) |
| T8 | **Stall of My Own:** SA1–SA7 |
| T9 | **Smart Choices:** coin-flip ≤ 35%; caps-only ≤ chance; Better Buy answers proved |
| T10 | **Month Planner:** a skip-all bot < a pay-needs bot; the yearly step is typed |
| T11 | **Market Storm:** a do-nothing bot is never auto-sold; keep-to-plan wins in "company stops" storms |
| T12 | **Save or Borrow?:** SB1–SB5 |
| T13 | **Shift engine:** every shift ends; the HUD updates each item; a random player scores ≤ 30% on every template |
| T14 / T15 | **Stage:** symmetric, full-bleed, both sizes, light and dark |
| T16 | **Card count:** 10 |
| T17 | **The level rule:** < 50% of par offers one level down; ≥ 1.6× par offers one up; nothing changes level without the child's choice |

**Prove every new check by breaking it once.**

---

## 6. Timeline and owners

| Week | Work | Owner | Done when |
|---|---|---|---|
| **1** | **Hotfix:** one pay path (Stall Rush, Main Street, till); the Market Game crash; till currencies; seeds per play; a wrong answer holds; own end cards | Finance chat | T1–T6 |
| 2 | Clocks verified at 4 fps; currency formatter in every game; the level rule; 44 px and contrast fixes | Finance chat | T7, T17 |
| 2–3 | **Smart Choices** hub (pools, the "both" reason, generated scams, tap the tell, Better Buy) | Finance chat | T9 |
| 3 | **Month Planner** (with the yearly step); **Compound Climb** estimate step (Snowball retired) | Finance chat | T10 |
| 3–4 | **Market Storm** plan-based; **Market Cup** seasons and best; **Main Street** seeds, cash flow and avatars | Finance chat | T11 |
| 4–5 | **The Market Game:** answer key from the sheets, a how-to, the Exchange hall stage | Finance chat | T2 |
| 5–8 | ***Save or Borrow?*** at the Bank | Finance chat | T12 |
| 6–9 | **Shift engine** (Count, Change, Ledger, Route) replacing the four reflex jobs | Finance chat | T13 |
| 5–10 | ***Stall of My Own*** (season sim, market day from Stall Rush, the ledger page, events, the cart goal; art for Market Row) | Finance chat + art | T8 |

---

## 7. How we'll know it worked

- **Honest pay:** no game pays more than 1.5× the norm, and random play earns little everywhere.
- **Each lesson is taught by its game:**
  - the skip-all, do-nothing and mashing bots now lose;
  - a careful player wins by deciding well, never by the market's luck.
- **The three life skills are measured for the first time:** unit-price comparisons, a loan's total cost predicted
  correctly, and saving to a goal over weeks.
- **Return without streaks:** seasons of the stall completed; varied Market Cup seasons replayed because the question is
  new each time.

*Companion documents:* `finance-fix-brief-v4.md` (non-game fixes), CONCEPT.md §6 (the money rules), `docs/11-made-whole.md`,
the Bee, English, India and Maths game specs (shared stage and level rules), and FAMILY-STANDARD.md.
