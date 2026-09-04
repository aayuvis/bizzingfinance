# 11 — Made whole: what Bee and India have, and what Finance does about it

A feature-by-feature diagnosis of Bizzing Finance against its two siblings, read from their
code — Bizzing Bee's live build (`gh-pages`) and Bizzing India's `app/` — not from memory or
from the docs, which in both cases describe things that were never built. Every row is one
of four dispositions:

- **Have** — Finance already had it, or has it now.
- **Built** — added in the parity pass, September 2026.
- **Own way** — Finance does the same job differently, on purpose, and the reason is given.
- **Refused** — the sibling has it and Finance must not, because a money app's own rules
  ([CONCEPT §6](../CONCEPT.md), the editorial policy) forbid it.

## Shell and navigation

| Feature | Bee | India | Finance |
|---|---|---|---|
| Mascot + wordmark as the way home | ✓ | ✓ | **Have** — the mark and *Bizzing* Finance, folding only under 360px |
| Money / coins chip in the bar | coins | sikke | **Have** — the wallet, which is the curriculum; one currency, never a second |
| Streak in the bar | ✓ | diya footnote | **Have** — a count, never a target (editorial policy) |
| Settings button in the bar | sliders | avatar chip → You | **Built** — the gear opens one sheet: look, text, motion, sound, narration speed, money, children, tester, help |
| Five tabs + More | ✓ | seven tabs | **Have** |
| One back control | ✓ | ✓ | **Have** — `backlink` on every sub-view; Escape closes a sheet, then a card, then a shelf (**Built**) |
| New-version bar | — | ✓ | **Built** — waits on the service worker, one tap swaps |
| Install / PWA | — | — | **Built** — the browser's offer, kept and put in Settings |
| Bug report, on-device | ✓ | — | **Built** — Settings → Help → Report; saved to the device bucket, copy out, clear |
| Header search | ✓ | — | **Own way** — Money Words has its own search; the glossary is 44 terms, not 129,000 |
| Splash, lazy loader | ✓ | — | **Own way** — per-lesson chunks load lazily; no splash |

## Settings

| Setting | Bee | India | Finance |
|---|---|---|---|
| Appearance | Light/White/Dusk | night toggle | **Built** — Light / Dark / System |
| Text size | ✓ | — | **Built** |
| Reduce motion, calm | ✓ | kill switch, unset | **Built** — turns off confetti and the bobbing too |
| Sound | ✓ | ✓ | **Have** |
| Voice speed | ✓ | reading speed | **Built** — Nana and read-to-me both |
| Voice picker | ✓ | m/f if recorded | **Own way** — Indian English chosen first, automatically |
| Currency, pay day, mode | — | tongue/script | **Have** — moved into the sheet |
| Children | parent zone | — | **Have** — switch and add from the sheet |
| Parent PIN gating settings | ✓ | — | **Built** — money, children and tester sit behind the PIN when one is set |
| Developer / tester unlock | ✓ | ✓ | **Built** — every gate opens, the record is untouched; a red TESTER pill in the bar |
| Daily time targets | ✓ | — | **Refused** — time-on-app targets are engagement pressure on a child |
| Plan / subscription | ✓ | — | **Own way** — premium is the grown-up's, on their page, later |
| Sign-out / accounts | ✓ | — | **Own way** — no accounts yet; the store seam is where they go |

## Onboarding

| Feature | Bee | India | Finance |
|---|---|---|---|
| Landing page with counted claims | ✓ | ✓ | **Built** — lessons, games, worlds, badges counted from the data; three promises |
| Name, age band | ✓ | ✓ | **Have** |
| Companion pick at start | buddy | avatar | **Own way** — the companion is adopted later, for money, because that is the lesson |
| Placement test | ✓ | placement questions | **Own way** — test out of any level-locked chapter (**Built**) |
| Privacy notice near the name field | ✓ (4 places) | ✓ | **Built** — the landing links How it was made; About states it |

## Home

| Feature | Bee | India | Finance |
|---|---|---|---|
| Greeting with the mascot speaking | ✓ | ✓ | **Have** — the companion or Pip |
| Daily rings / plan | rings | — | **Own way** — Today's three quests, no time targets |
| Do one (a real-world deed, kept) | — | ✓ | **Built** — never about the household's money; beads on the Collection shelf |
| Carry one (word of the day) | word of the hour | ✓ | **Built** |
| Ask at home (weekly question) | — | Ask Nani | **Built** — about a grown-up's own past, shared with the grown-up's page |
| Tip of the day | bee tip | subhashita | **Built** — a "for instance" from a card already read |
| Next on your journey | ✓ | — | **Have** — the greeting's chips and the journey doors |
| Overnight / what is waiting | — | — | **Have** |

## Learning

| Feature | Bee | India | Finance |
|---|---|---|---|
| Map of the course | Word Atlas | — | **Have** — the Money Atlas |
| Rail of stops, current expanded | ✓ | pack path | **Have** |
| Checkpoints | every 4th unit | — | **Built** — a mixed-quiz stop after every finished chapter, score on the rail |
| Test-out of a locked stage | — | ✓ | **Built** — all but one right opens the chapter; its cards stay unread |
| Stars per stop | ✓ | — | **Have** |
| Narrated explainers with the mascot | ✓ | Mithu | **Have** — 32 narrated lessons, an Indian narrator |
| Read-aloud everywhere | words | everything | **Built** — read-to-me on the reading, the letters, the glossary and the dailies |
| Revise pile / missed | ✓ | missed more than once | **Built** — due and missed objectives, read from the mastery record |
| My traps (weak patterns) | ✓ | — | **Own way** — one strand has objectives today; strand bars when the rest exist |
| Spaced repetition | ✓ | Leitner | **Have** — the mastery record and the daily beat |
| Dictionary / word cards | Finder | Shabdkosh | **Have** — Money Words |
| Library of books | 23 spines | — | **Own way** — no books yet; the Bee books live in their own repo |
| Tiers (same route, harder) | ✓ | — | **Own way** — the three journeys get harder as the town grows |

## Games and motivators

| Feature | Bee | India | Finance |
|---|---|---|---|
| Painted covers on the arcade | screenshots | game art | **Have** |
| Keyboard and touch on every game | ✓ | ✓ | **Have** |
| Badges | ~80 | mala | **Have** — 47, each for a decision; plus the deeds shelf (**Built**) |
| Avatar / trading cards | 217, packs | pitara | **Own way** — the cast as cards with lore (**Built**); no packs |
| Coins, packs, gacha | ✓ | sikke, pitara | **Refused** — no second currency, no randomised reward for money (§6.3, §6.4) |
| Streak rewards, freezes | ✓ | — | **Refused** — streak pressure |
| Worlds to buy | ✓ | ✓ | **Own way** — five worlds, walked in order by learning |
| Celebrations | ✓ | toast only | **Have** |
| Companion that grows | forms | collection | **Have** — five kinds, three stages, three moods, wired to pay day |

## Grown-ups

| Feature | Bee | India | Finance |
|---|---|---|---|
| Report of learning, not usage | progress | how it is going | **Have** — objectives moved, decisions, missed more than once |
| Printable | ✓ | — | **Have** |
| Multiple children | ✓ | — | **Have** |
| Family Mode | — | — | **Have** |
| Milestone countdown | ✓ | — | n/a |
| Notifications | none | none | none, on purpose |

## Accessibility and honesty

| Feature | Bee | India | Finance |
|---|---|---|---|
| Offline | ✓ | ✓ | **Have** — fonts, art and narration bundled |
| Reduced motion | ✓ | ✓ | **Have** (and a setting, **Built**) |
| ARIA on toggles and tabs | ✓ | ✓ | **Have** |
| Credits (art, fonts, method) | trademark line | folk-art credit | **Built** — About names the image model, the synthetic voice and the three open fonts |
| Counted, never typed numbers | — | ✓ | **Built** on the landing |
| Named gaps, not fakes | — | ✓ | **Have** — the clock notice, the shelter's yearly cost, the test-out's "cards stay unread" |

## Still open

- A per-strand weak-pattern view once the other five strands carry objectives.
- Bee's per-region painted walk for the Atlas, if the five paintings are wanted.
- Accounts and the server clock: the launch blockers that no sibling solves here either.
