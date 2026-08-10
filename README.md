# 162-0

Draft MLB legends across random franchises and decades, fill nine positions, and chase a perfect **162-0** season.

**Play:** [162-amber.vercel.app](https://162-amber.vercel.app)  
**Repo:** [github.com/hondoentertainment/mlb-162-0](https://github.com/hondoentertainment/mlb-162-0)

## Modes

- **Classic** — stats on, team/decade skips, local leaderboard (140+ wins)
- **Diamond IQ** — blind draft
- **Salary Cap** — $175M soft cap; tier + HOF set salaries
- **Daily Challenge** — same UTC-seeded spins, no skips, global board via `/api/daily`

## Local

```bash
npm install
npm run dev
```

## Global daily board

Uses [Vercel Blob](https://vercel.com/docs/storage/vercel-blob). Production needs `BLOB_READ_WRITE_TOKEN` (created when you add a Blob store to the project). Without it, Daily still plays locally; the global board returns unavailable.

## Stack

Vite · React · TypeScript · Vercel serverless (`api/daily.ts`) · client-only game logic

Fan-made. Not affiliated with MLB.
