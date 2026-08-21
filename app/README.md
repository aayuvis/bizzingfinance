# app/ — Bizzington, the playable prototype

The first working slice of Bizzing Finance: a town, a wallet, four jars, a Build
Yard, a bank, an Exchange, a postbox and three games. All seven tabs from
[docs/01-tabs.md](../docs/01-tabs.md) exist; the depth behind them is the part
still being built.

## Run it

```bash
cd app && python3 -m http.server 8080     # then open http://localhost:8080
```

Native ES modules over http — no bundler needed to develop. (`file://` will not
work: ES modules need a server. Vite goes in when the shape settles; the module
boundaries are already drawn for it.)

## One self-contained file

```bash
npm i esbuild && node build.mjs           # -> dist/bizzington.html
```

Inlines the JS and CSS into a single page that runs anywhere, offline, with only
Google Fonts fetched.

## Layout

| file | what it owns |
|---|---|
| `src/store.js` | **The seam.** All persistence, today `localStorage`, split into sync vs device-local, with `migrate()` in place from commit one. Nothing else in the app touches storage. |
| `src/sim.js` | The one persistent money object: wallet, jars, goals, bank, pay day, XP, badges. Every other module is a view onto this. |
| `src/content.js` | Curriculum, postbox letters, shop, market assets, badges — everything the app teaches, in one file. |
| `src/town.js` | Bizzington. Six buildings, drawn locked or open from `learn.level`. |
| `src/views.js` | Home / Learn / Money / Store / Progress / Collection. |
| `src/arcade.js` | Needs vs Wants · Budget Blitz · The Market Cup. |
| `src/main.js` | Shell, router, and every `data-act` in one table. |
| `src/ui.js` `src/fmt.js` `src/art.js` | Dispatch + sound + confetti · currency and locale · the cast, in SVG. |

`state → render()` returning a string, clicks dispatched by `[data-act]` — the
Bizzing Bee idiom, kept deliberately.

## Known gaps in this build

- **The ladder is compressed to 6 levels** so the whole street can be walked in
  one sitting. The shipping ladder is 30 levels (docs/01 §10).
- **The sim clock is client-side.** Progress → *Prototype tools* can jump to pay
  day. The shipping build takes the clock from the server, because otherwise week
  one teaches a child that the way to get money is to move the device clock.
- **The Shop (Founder) is a placeholder.** Spec is docs/01 §4.6.
- No accounts, no Supabase, no entitlements yet — one child per browser.
- Every number in the app is Bizzington's own arithmetic. Nothing here is a real
  rate, a real return, or a real company, and nothing may become one without a
  source beside it (CONCEPT §6.5).
