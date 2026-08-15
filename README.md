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
- **Daily Challenge** — same UTC-seeded spins, no skips or undo, global board via `/api/daily`, streak tracking
- **Challenge a friend** — shareable codes / `#c=` links, identical spins, no skips or undo

Each spin lists every player from that franchise and decade. Only open eligible slots can be drafted; everyone else stays visible. Empty legal pools redraw automatically in Classic, Diamond IQ, Salary Cap, and One Franchise (not a skip). Daily and Challenge never grant a redraw.

## Career

Local career stats, a log of every finished season (record, mode, roster), daily streaks, and unlockable achievements live on the Career screen (this device only).

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

## Stack

Vite · React · TypeScript · Vercel serverless (`api/daily.ts`) · PWA · client-only game logic

Fan-made. Not affiliated with MLB.
