# 10 — The three motivators

Why a child comes back. Not a feature list: the three reasons anybody does anything, and
where each one lives in Bizzington. Read [09 — the three journeys](09-the-three-journeys.md)
first; that is *what* she does. This is *why she keeps doing it*.

People act for three reasons: to **achieve** something, to **accumulate** something, and to
**grow and take care of** something. A finance app for children has to serve all three
without breaking the money rules in [CONCEPT §6](../CONCEPT.md) — and the third one is the
one that usually breaks them, because the easy way to build a creature is to make it nag.

| motivator | what she feels | where it lives | the rule that keeps it honest |
|---|---|---|---|
| **Achieve** | *I did that* | badges, the ladder, level-ups, the celebration overlays, the mastery record | a badge marks a **decision**, never a balance (`steady-hand`, `cool-head`, `scam-spotter`); the celebration is for the choice |
| **Accumulate** | *this is mine, and I earned it* | the wallet and net worth, the jars, the shop's stock, the town that changes at her level — and now the **Collection**: badges, people met, money of the world, and **keepsakes** | a keepsake is **kept, never given**. The first receipt is the item, the shifts that paid for it and the weeks they took, counted from her own ledger (`sim.buyFromShop`). No loot, no drops, nothing for showing up |
| **Grow & care** | *someone needs me, and I can* | the **companion**: five to choose from, three growth stages, three moods, a wardrobe, and a food bill | wired to **real money on the sim's own clock**. It is poorly only when the food bill went unpaid on pay day, never when she skipped a day. It never dies. Growth needs weeks *and* care. Wants are priced and come out of the same wallet |

## The companion, in one page

`app/src/companion.js` owns the creature; `sim.js` still owns every rupee it touches.

- **Adoption** is a one-off cost and a **weekly bill** — the same `extraBills` primitive the
  rent rise uses. The shelter says what "2 a week" is a year before she says yes. This is
  the first recurring cost a child ever *chooses*, and that is the lesson.
- **Care moves only on pay day.** Fed when the wallet was ≥ 0 after bills; hungry when it
  was not, because the food was one of the last things on the list. Care never decays with
  wall-clock time. The editorial policy bans streak pressure, and a pet that sulks at a
  missed login is streak pressure in a costume.
- **Poorly recovers** the next pay day the bill is met. The miss is remembered on the card
  (`went hungry 1×`), not punished twice. **Nothing ever dies.** Harm stays as elliptical
  as the family's own text.
- **Growth** — baby → young → grown — needs both the weeks (4, 10 pay days) and care ≥ 50
  on the day. Neglect stalls it; it resumes. Growth is the long arc a season is built on.
- **Wardrobe** items are **wants with prices** (c1b). Buying one moves real money and lifts
  the mood, which is exactly what a want is for. Never on credit, whatever the band. One
  per slot; owned things are re-worn free.
- **Play** is free, once a day, and skipping it only fails to help. Attention is a gift,
  not a debt.
- **Illness** arrives by letter (`hh-cough`) and money settles it (`hh-vet`) — a shock with
  a cost, like the tap and the rent.
- **Five kinds × three stages × three moods = 45 sprites**, plus six accessories, all
  generated in the house style and alpha-keyed. Accessory anchors are **measured from each
  sprite's own alpha** (`tools/art/process-companions.py`), so the hat sits on *this* head
  at *this* stage in *this* mood, never on a typed-in average.

## The morning after

`keepsakes.js` also draws the **overnight card** — what is *waiting* when she opens the app
on a new day: a letter, the bell, the companion by the door, the board, the quests. It is
measured from the state on the day it flips (`sim.touchDay`) and dismissed once. It never
says what she lost. Nothing "happens" while the sim is not running: one clock, and it is
hers.

## What this must never become

- A second currency. Care, badges and keepsakes are not spendable and never convert.
- A random reward. No spins, no drops, no surprise boxes for money or for attendance.
- A guilt loop. No notification, no countdown, no "your puppy misses you". The creature
  reacts to money decisions on pay day, and to nothing else.
- Braver than the text. The companion gets poorly; it does not get worse than that.
