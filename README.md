# 162-0

Draft MLB legends across random franchises and decades, fill nine positions, and chase a perfect **162-0** season.

**Play:** [162-amber.vercel.app](https://162-amber.vercel.app)  
**Repo:** [github.com/hondoentertainment/mlb-162-0](https://github.com/hondoentertainment/mlb-162-0)  
**Roadmap:** [ROADMAP.md](./ROADMAP.md)

## Modes

- **Classic** — stats on, team/decade skips, undo last pick, local leaderboard (140+ wins)
- **Diamond IQ** — blind draft, undo last pick
- **Salary Cap** — $240M soft cap; tier + HOF set salaries; undo last pick
- **One Franchise** — lock a club, spin decades only; undo last pick
- **Era Lock** — lock a decade, spin franchises only; two team skips, no decade skips
- **Ironman** — Classic rules with no safety net: no skips, no redraws, no undo
- **Daily Challenge** — same UTC-seeded spins, no skips or undo, global board via `/api/daily`, streak tracking
- **Challenge a friend** — shareable `/c/CODE` links, identical spins, no skips or undo

Each spin lists every player from that franchise and decade — 1,600+ unique names, and every club era can field a full starting nine (C through SP). Fits sit on top; filter by an open position when the list is long. A player can only be drafted once, even if he appears in several team-eras — those names stay visible and marked. Empty legal pools redraw automatically in the relaxed modes (not a skip). Daily, Challenge, and Ironman never grant a redraw.

Challenge codes have a rematch board. Daily and Challenge boards take an optional display name (this device only). Every finished season is stored in a local season log. Share cards show the starting nine and, for Challenge, the code.

Every finished season breaks down where the wins came from, scoring each roster slot against your roster average.

## Career

Local career stats, a season log, a 14-day Daily history, daily streaks, and unlockable achievements live on the Career screen (this device only). Dynasty and Perfection celebrate on the result screen. Browsers that can install the PWA get an Add to Home Screen tip.

## Local

```bash
npm install
npm run dev
```

```bash
npm test          # Vitest unit tests
npm run lint      # oxlint
npm run test:e2e  # Playwright (builds + preview)
npm run test:all  # unit + e2e
```

PRs and pushes to `main` run lint, unit tests, and Chromium e2e via GitHub Actions.

## Global daily board

Uses [Vercel Blob](https://vercel.com/docs/storage/vercel-blob). Production needs `BLOB_READ_WRITE_TOKEN` (created when you add a Blob store to the project). Without it, Daily still plays locally; the global board returns unavailable.

Clients submit their **draft order**, not a score. `/api/daily` replays those picks against the day's seed, rejects any pick that was not legally available in the round it was taken, and computes the record itself. Each entry is its own blob so concurrent submissions cannot overwrite one another.

## Link previews

`/api/og` renders the Open Graph image with [`@vercel/og`](https://vercel.com/docs/og-image-generation). Challenge links point at `/c/CODE`, which serves a preview containing the code before redirecting into the app.

## Stack

Vite · React · TypeScript · Vercel serverless (`api/daily.ts`) · PWA · client-only game logic

Fan-made. Not affiliated with MLB.
