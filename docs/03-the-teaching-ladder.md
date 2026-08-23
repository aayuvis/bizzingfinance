# 03 — The Teaching Ladder

How an 8-year-old gets from counting coins to holding a portfolio through a red week,
without ever being asked to do maths they haven't met.

Read [docs/02](02-the-world.md) first for the town, and [docs/01](01-tabs.md) for the tabs.
This document is the **scope and sequence** those two hang on, and it supersedes the ladder
sketch in docs/01 §10.

---

## 1. The problem, with evidence

The curriculum we shipped is sequenced by **concept difficulty**. It should be sequenced by
**maths difficulty**, because that is the thing that actually stops a child.

Running the maths demands of every card against the level it unlocks at:

| Card | Level | Needs |
|---|---|---|
| How many weeks? | 6 | 800 ÷ 50 — multi-digit division |
| What it really cost | 6 | division, 3-digit |
| The small monthly one | 8 | × 12 |
| The number that matters | 13 | × 10, subtraction across 3 digits |
| The snowball | 16 | percent of an amount, three times over |

And the thing the audit does **not** show, which is worse:

> **The Jar Shed opens at level 6 and runs on percentages.** `40 / 30 / 20 / 10`, four
> steppers, a bar each. The *card* that teaches the four jars needs no arithmetic at all —
> so the lesson is pitched at a nine-year-old and the tool they are handed is pitched at an
> eleven-year-old. Nobody declared that, because the maths gate is in the **interface**, not
> in the content, and interfaces don't have prerequisites written on them.

Same fault, three more places: the Bank states its rate as a percent, the Store prices
opportunity cost by compounding ten years, and the Exchange reports every move as a
percentage change. All of it is reachable before percent has been taught anywhere.

**The rule that fixes it, and it is a hard one:**

> Every screen declares the arithmetic it demands. A surface may not open to a child who has
> not met that arithmetic — it must either wait, or **show the same truth a different way.**

The second half of that sentence is the interesting one, and it is §5.

---

## 2. Three strands, not one ladder

A rung is not a lesson. A rung is three things that arrive together:

| Strand | What it is | Fails like this if missing |
|---|---|---|
| **M — Number** | The arithmetic, always taught inside money | The child guesses, gets it right, learns nothing |
| **C — Concept** | The idea: trade, cost, risk, time | The child can compute and cannot decide |
| **D — Doing** | The thing they actually do in the town | The child can explain compounding and has never waited for anything |

**No rung ships without all three.** A concept with no D is a worksheet. A D with no M is a
button. An M with no C is homework.

---

## 3. The number spine

Seventeen skills, each taught in a money context, each a prerequisite for something.

| # | Skill | Typical age¹ | First needed by |
|---|---|---|---|
| M1 | Recognise coins and notes; compare amounts | 7–8 | Wallet |
| M2 | Add and subtract within 100 | 7–8 | Buying one thing, change |
| M3 | Skip-count; repeated addition | 8 | "Four weeks of pocket money" |
| M4 | Halves and quarters of a set | 8–9 | Jars **by coins** |
| M5 | Multiply and divide, whole answers | 9 | Price × quantity |
| M6 | Division with a remainder | 9–10 | "How many weeks, and a bit" |
| M7 | × 12 and × 52 | 9–10 | Subscriptions, weekly → yearly |
| M8 | Decimals to two places | 10 | Real prices, unit price |
| M9 | Percent as "per hundred"; ½ = 50% | 10–11 | Reading a rate at all |
| M10 | Percent **of** an amount | 11 | Jars by rule, interest, margin |
| M11 | Repeated percent — growth on growth | 11–12 | Compounding, the Time Machine |
| M12 | Percent change, up and down | 12 | The Exchange, price rises |
| M13 | Ratio and proportion | 12 | A mix; "twice as much in X as Y" |
| M14 | Average, and spread around it | 12 | Good year, bad year, typical year |
| M15 | Reading a line chart | 11–12 | Every price series in the app |
| M16 | Weighted average | 12–13 | What a whole portfolio returned |
| M17 | Division back to a threshold | 12–13 | Break-even |

¹ **These ages are design assumptions, not cited facts.** They need checking against the
actual curricula of the markets we ship to before any of this appears in a marketing claim
— CONCEPT §6.5 applies to a child's schooling as much as to an interest rate.

---

## 4. The seven stages

Each stage is gated on demonstrated skill, never on birthday. A capstone is a **thing done
in the simulator**, never a quiz.

### Stage 0 · Counting money — *age ~8*
**M1 M2** · **C** money is an agreement · needs and wants · earning is a trade ·
price is what they ask, value is what it's worth to you
**D** Wallet. Jobs on Market Row. Buy one thing and take the change.
**Capstone** → *Buy something and catch the shopkeeper's change being wrong.*

### Stage 1 · Saving for one thing — *age ~8–9*
**M3 M4** · **C** saving is not-spending-yet · a goal has a price · waiting costs something
and pays something
**D** One goal in the Build Yard. Weeks-to-goal shown as **a row of coins you count**, not a
division. Auto-save as "one coin off every pay day".
**Capstone** → *Finish a goal without raiding it once.*

### Stage 2 · Splitting it up — *age ~9–10*
**M5 M6** · **C** split before you spend · opportunity cost as "the other thing" ·
income and outgo are two lists
**D** Jars, allocated by **dragging coins**. The rule is worded **"1 coin in every 4"**, never
"25%". Weekly plan versus what actually happened.
**Capstone** → *Run one whole week inside a plan you set yourself.*

### Stage 3 · Percent, and a real budget — *age ~10–11*
**M7 M8 M9 M10** · **C** fixed versus variable · a bill is a promise you already made ·
inflation is the same thing with a bigger number · subscriptions are a decision made once
and paid forever
**D** Jars **switch representation** to a percentage rule (§5). Bills arrive. **Nana's kitchen
table** opens (§7).
**Capstone** → *Balance a month at Nana's table — and then balance the month that doesn't
balance.*

### Stage 4 · Interest and borrowing — *age ~11–12*
**M10 M11 M15** · **C** interest is rent on money, both directions · the cost of credit ·
trust is a memory, not a verdict · an emergency fund · insurance is pooled risk
**D** The Bank. A loan with the total cost shown before agreeing. The rainy-day tin.
**Capstone** → *Work out a loan's total cost on paper, then take it and see if you were right.*

### Stage 5 · Risk, time, and a portfolio — *age ~12+*
**M12 M13 M14 M15 M16** · **C** risk and return are one sentence · time horizon decides
everything · diversification raises your **worst** outcome · fees are invisible and constant ·
a fall is not a loss until you sell
**D** The Exchange, entered through the **portfolio builder** (§6), not a buy button.
**Capstone** → *Write a one-sentence plan, then hold it through a red week.*

### Stage 6 · Running something — *age ~12+*
**M5 M10 M17** · **C** revenue, cost and profit are three different words · pricing is a
question you answer by trying · cash and profit are not the same thing · fixed costs don't
care how your week went
**D** Bizz & Co.
**Capstone** → *Find your break-even day, then beat it.*

---

## 5. The same truth, drawn three ways

This is the mechanism that lets one app serve 8 and 12 without two products, and it is more
than hiding features. **The concept never changes. The representation does.**

Take one fact — *keep a quarter of what you get*:

| Band | How the Jar Shed says it | The maths it needs |
|---|---|---|
| **Sprout** (Stage 1–2) | Twelve coins on the counter; drag three into Save. The rule reads **"1 coin in every 4."** | M4 — quarters of a set |
| **Builder** (Stage 3–4) | A slider per jar reading **25%**, with the amount beside it. | M10 — percent of an amount |
| **Builder+** (Stage 5+) | The same sliders, plus what 25% has actually averaged over the last twelve pay days. | M14 — average and spread |

Same jar. Same lesson. Three different children can use it on the same afternoon.

The rule generalises: **percentages are a display format, not a concept.** Anywhere the app
currently shows a percent — the bank rate, a price move, a margin, the store's ten-year
line — it must be able to say the same thing in coins, in "1 in 4", or in "for every 100 you
put in, 3 more turn up". The concept was never the percent sign.

---

## 6. How a child builds a portfolio

Today the Exchange has a **Buy ₹50** button. Tapping a button is not building a portfolio,
and a child who taps it has learned to tap.

Replace it with **five questions**, asked once, in this order. The order is the teaching.

### Q1 · When will you want this money back?
`Within a year` · `One to three years` · `Longer than that` · `I don't know`

If they answer *within a year*, **the app refuses.** It says so plainly — *"Then this isn't
the place for it. Money you need soon goes in the bank, even though the bank is boring"* —
and routes them to the Bank.

This is the most important screen in the entire product. It is the moment the app declines
to sell a child the exciting thing, and everything it says afterwards is more believable for
it. *I don't know* gets the same answer as *within a year*.

### Q2 · How much, and where from?
Only from the **Grow jar** — never Spend, never Save, never a goal fund. The screen shows all
four jars while they choose, so the trade-off is visible rather than described.

### Q3 · The bad week
Not a word — a picture, with **their own number** in it:

> *"Some weeks it falls. If your ₹800 was ₹400 on Friday, what would you do?"*
> `I'd sell` · `I'd hate it but hold` · `I'd buy more`

Their answer suggests the mix — and, more importantly, it is **quoted back to them on the
next red day** in their own words. Nothing in the app teaches temperament better than a child
meeting their own prediction.

### Q4 · Pick a mix
Three prebuilt mixes, each showing what it holds, its best stretch, **its worst stretch**, and
how long the worst one took to come back. Worst first, in the same size type as best. Default
is the middle one; they can adjust after.

| Mix | Holds | Feels like |
|---|---|---|
| **Steady** | mostly the basket and grains | dull, and it sleeps well |
| **Balanced** | basket, grains, some chai | the default, and usually right |
| **Spicy** | a slice of Rocket Rickshaws | exciting in both directions |

### Q5 · Write the rule
A sentence with blanks, which they fill and the app keeps:

> *"I'm putting **₹___** of my Grow jar in for **___ years**. I'll add **₹___** every pay day.
> I won't sell before **___** unless **___________**."*

That last blank does the work. The child defines their own escape condition — and by writing
it they discover that *"the price went down"* is not one, because they wouldn't have written it.

### Then: three things keep it alive
1. **The plan card** sits at the top of the Exchange, quoting their sentence back, always.
2. **Selling early** doesn't get blocked. It gets one question: *"Has the reason changed, or
   just the price?"* Then it lets them.
3. **Rebalancing** is a taught event, every fourth pay day: *"Rocket grew, so it's 40% of your
   mix instead of 20%. Sell some of what went up and buy what didn't?"* Selling a winner to buy
   a loser is the least intuitive habit in investing and the most valuable one to build young.

**Scored on the plan, not the return.** Did you keep the horizon, stay spread, rebalance, and
leave it alone? A child whose Spicy mix fell 30% while they kept every rule gets a better
score than one who doubled a lucky single bet — and is told exactly why.

---

## 7. How a child runs a household budget

A different, bigger thing than their own jars — and it comes with a hard constraint:

> **Never the child's own household.** No assumed income, no assumed rent, no questions about
> what happens at home (CONCEPT §6.4). Some children are living the hard version of this and
> must not be handed a worksheet about it.

So the child does it for somebody else. **Nana's kitchen table**, a new place in town, opening
at Stage 3.

**The table.** Nana's income for the month, and eight envelopes:

`Home` · `Food` · `Getting about` · `Phone` · `School things` · `Health` · `Fun` · `Put by`

Fixed envelopes are drawn with a padlock and cannot be moved. Variable ones have a slider.
Learning which is which *by looking at the table* is half of Stage 3.

**Run the month** and four weeks of events land — the electricity bill is higher than last
year, the bus fare goes up, a school trip appears, a tooth needs fixing, a small bonus.

**Three months, not three levels.** Difficulty comes from the income, not from more envelopes,
because that is where it comes from in life:

1. **A comfortable month.** Everything fits. The lesson is *Put by* — the envelope you can
   only fill in a good month, which is exactly when nobody wants to.
2. **A tight month.** It fits only if something gives. The app never says which. It shows the
   trade-off and lets the child choose, then shows what that choice did in week four.
3. **The month that doesn't add up.** Income is genuinely short of the fixed costs.

The third month is the one that matters, and it must be handled with real care:

- There is **no arrangement of the sliders that balances it.** A child who keeps trying is
  right to keep trying, and the app tells them so.
- What it teaches instead is **triage and voice**: which things must be paid first, which can
  be talked about, and that *asking early* — the school about the trip, the provider about a
  payment plan — is a financial skill and not an embarrassment.
- It says plainly that a month that will not balance is **common, and happens to careful
  people, and is not an arithmetic failure.** A finance app for children that never says this
  is quietly telling every child in a stretched household that their family is bad at sums.

Nana narrates it, because she is the one character who can say *"this happened to me"*
without it being a lesson about the child.

**Capstone:** the child writes Nana's month as three sentences — what came in, what had to go
out, and what they'd change. It prints, and it goes in the grown-up's weekly page.

---

## 8. Gating without walls

A prerequisite must never become a locked door a curious child cannot open.

- Before a stage opens, a **warm-up**: three questions in the money context, no timer, no
  score shown, framed as *"quick — before Pip hands you the shed keys"*.
- Get them right, walk through.
- Get them wrong, and the app **teaches the maths right there** — a 60-second cut-down of the
  skill, in coins — then asks again with different numbers.
- Fail twice and it opens anyway, in the **lower representation** (§5). Nobody is stopped;
  they are met further down.
- The grown-up's page shows which number skills are shaky, phrased as *"worth a hand with"*,
  never as a grade.

**A child is never told they are too young.** They are shown the same thing in a way that fits.

---

## 9. What this changes in the app

Ordered by how much of the above it unblocks.

| # | Change | Why it's first |
|---|---|---|
| 1 | **Jars get a coin representation**, and the pay-day rule reads "1 in every 4" below Stage 3 | Closes the live gap: a nine-year-old is currently handed a percentage tool |
| 2 | **Every card and surface declares `needs: [M…]`**, and `content.js` carries the number spine | Nothing else here can be enforced until the prerequisites are data |
| 3 | **Warm-ups + the fallback representation** (§8) | Turns the declarations into behaviour without building a wall |
| 4 | **The portfolio builder** replaces the buy button (§6) | The single biggest gap between what we claim and what we teach |
| 5 | **Nana's kitchen table** (§7) | The other named endpoint, and the strongest thing in this document |
| 6 | Re-sequence the eight chapters onto the seven stages; write the missing Stage 0–1 cards | Current chapter 3 is doing two stages' work at once |
| 7 | Rebalancing prompts, the plan card, the red-day quote-back | Makes the portfolio a habit rather than a purchase |

Items 1 and 2 are small and unblock everything. Item 4 is the one a parent would notice.
