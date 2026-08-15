# 162-0 — Product Roadmap

Fan-made MLB draft-and-sim browser game. Draft nine legends across franchises and decades, simulate a 162-game season, chase perfection.

**Live:** [162-amber.vercel.app](https://162-amber.vercel.app)  
**Repo:** [github.com/hondoentertainment/mlb-162-0](https://github.com/hondoentertainment/mlb-162-0)

---

## Vision

A sticky, shareable baseball IQ game: fast rounds, strong identity, daily ritual, and friend challenges — without accounts unless a feature truly needs them.

---

## Shipped

### v1.0 — Core loop

| Feature | Status | Notes |
|---------|--------|-------|
| Classic draft (spin → pick → sim) | Done | Stats, tiers, HOF badges |
| Diamond IQ (blind draft) | Done | Stats hidden |
| Daily Challenge (UTC seed) | Done | One attempt / day, local save |
| Local Classic leaderboard (140+) | Done | `localStorage` |
| Season reveal + result card | Done | Grades, strengths/weaknesses |
| Share text | Done | Clipboard |
| How to play | Done | In-app |
| Player pool + franchises/decades | Done | Large historical set |

### v1.1 — Viral & modes

| Feature | Status | Notes |
|---------|--------|-------|
| PNG share card | Done | Share / download |
| Deeper player pool | Done | 1,600+ unique names; every franchise-decade fields a starting nine |
| Global Daily board | Done | `/api/daily` + Vercel Blob |
| Salary Cap mode | Done | $175M soft cap |
| One Franchise mode | Done | Lock club, decade spins |
| PWA install | Done | `vite-plugin-pwa` |
| Unit tests (Vitest) | Done | Sim, grades, salary, career |
| Playwright E2E | Done | Desktop + mobile projects |

### v1.2 — Retention (this release)

| Feature | Status | Notes |
|---------|--------|-------|
| Career stats | Done | Seasons, best/avg wins, by mode |
| Daily streak | Done | Consecutive UTC days |
| Achievements / badges | Done | 14 unlocks, result + Career screen |
| Challenge a friend | Done | Shareable codes / `#c=` links |
| Career screen | Done | Stats + achievement gallery |

---

## Next up

### v1.3 — Polish & fairness (this slice)

| # | Feature | Priority | Complexity | Why |
|---|---------|----------|------------|-----|
| N1 | Draft undo (last pick) | High | Low | Done — relaxed modes only; off in Daily/Challenge/Ironman |
| N2 | Empty-pool auto-respin UX | High | Low | Done — clear copy + auto-respin (not a skip); no-redraw modes never offer one |
| N3 | Result confetti / grade motion | Medium | Low | Done — Dynasty+ burst + grade pop; honors reduced motion |
| N4 | Install / “Add to Home Screen” tip | Medium | Low | Done — native prompt + iOS Share copy; dismiss persists |
| N5 | Accessibility pass | Medium | Medium | Done — reduced motion, focus-visible, skip link |
| N6 | CI workflow (lint + unit + e2e) | High | Low | Done — oxlint, Vitest, desktop + mobile e2e |
| N7 | Competitive integrity | High | Medium | Done — one player per roster; daily runs verified server-side |
| N8 | Link previews + analytics | High | Medium | Done — `/api/og`, `/c/CODE` share route, Vercel Analytics |
| N9 | Ship less JS up front | Medium | Medium | Done — player table code-split; initial JS 121 kB → 79 kB gzip |

### v1.4 — Deeper daily / social

| # | Feature | Priority | Complexity | Why |
|---|---------|----------|------------|-----|
| S1 | Daily history (last 14 days local) | High | Low | Done — 14-day strip on Home + Career |
| S2 | Challenge rematch board (same code) | Medium | Medium | Compare friends’ records by code |
| S3 | Anonymous display names on global daily | Medium | Medium | Identity without full accounts |
| S4 | “Yesterday’s top 10” archive | Low | Medium | Blob retention / new keys |
| S5 | Share card with challenge code badge | Medium | Low | Stronger viral loop |

### v1.5 — New modes & content

| # | Feature | Priority | Complexity | Why |
|---|---------|----------|------------|-----|
| M1 | Era Lock (single decade) | High | Medium | Done — lock a decade, spin franchises only |
| M2 | Ironman (no skips, Classic rules) | Medium | Low | Done — no skips, redraws, or undo |
| M3 | Expansion: DH or RP slot | Medium | High | Changes sim + pool |
| M4 | Player encyclopedia / search | Low | Medium | Education + Diamond IQ practice |
| M5 | Pool metadata pass (more HOF flags) | Medium | Medium | Fairness + achievements |
| M6 | Source stats from a real dataset | High | Medium | Stat lines are hand-entered approximations |

### v2.0 — Platform (later)

| # | Feature | Priority | Complexity | Why |
|---|---------|----------|------------|-----|
| P1 | Optional accounts (sync career) | Medium | High | Cross-device streaks |
| P2 | Native wrappers / store listing | Low | High | Distribution |
| P3 | Live events / seasonal themes | Low | Medium | Retention campaigns |
| P4 | Advanced sim (park factors, era adjust) | Low | High | Depth for hardcore fans |

---

## Principles

1. **No account until sync hurts** — local-first; Blob only for global daily.
2. **Same spins = fair fight** — Daily and Challenge never grant skips.
3. **Share is the growth loop** — text + PNG + challenge links.
4. **Modes remix the same diamond** — don’t invent parallel games.
5. **Legal clarity** — fan-made disclaimer stays visible.

---

## Suggested build order (after N3 / N4 / S1)

1. Challenge rematch board + share-card challenge badge (S2, S5)  
2. Anonymous display names on the global daily (S3)  
3. Pool metadata / real stat lines (M5, M6)  
4. Reassess accounts only if sync requests spike  

---

## Metrics to watch (manual / analytics later)

- Daily completion rate  
- Challenge link opens → finishes  
- Career return visits (streak > 1)  
- Share card downloads / copies  
- PWA install acceptance
