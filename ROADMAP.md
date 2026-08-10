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
| Deeper player pool | Done | Thin positions padded |
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

### v1.3 — Polish & fairness (near-term)

| # | Feature | Priority | Complexity | Why |
|---|---------|----------|------------|-----|
| N1 | Draft undo (last pick) | High | Low | Forgives mis-taps; disabled in Daily/Challenge |
| N2 | Empty-pool auto-respin UX | High | Low | Clearer when a spin has no legal picks |
| N3 | Result confetti / grade motion | Medium | Low | Celebrate Dynasty+ |
| N4 | Install / “Add to Home Screen” tip | Medium | Low | Convert PWA browsers |
| N5 | Accessibility pass | Medium | Medium | Focus order, contrast, reduced motion |
| N6 | CI workflow (lint + unit + e2e) | High | Low | Protect main |

### v1.4 — Deeper daily / social

| # | Feature | Priority | Complexity | Why |
|---|---------|----------|------------|-----|
| S1 | Daily history (last 14 days local) | High | Low | Streak context + pride |
| S2 | Challenge rematch board (same code) | Medium | Medium | Compare friends’ records by code |
| S3 | Anonymous display names on global daily | Medium | Medium | Identity without full accounts |
| S4 | “Yesterday’s top 10” archive | Low | Medium | Blob retention / new keys |
| S5 | Share card with challenge code badge | Medium | Low | Stronger viral loop |

### v1.5 — New modes & content

| # | Feature | Priority | Complexity | Why |
|---|---------|----------|------------|-----|
| M1 | Era Lock (single decade) | High | Medium | Fresh constraint, easy to teach |
| M2 | Ironman (no skips, Classic rules) | Medium | Low | Hardcore leaderboard |
| M3 | Expansion: DH or RP slot | Medium | High | Changes sim + pool |
| M4 | Player encyclopedia / search | Low | Medium | Education + Diamond IQ practice |
| M5 | Pool metadata pass (more HOF flags) | Medium | Medium | Fairness + achievements |

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

## Suggested build order (after v1.2)

1. CI + draft undo + empty-pool UX  
2. Daily history + challenge rematch board  
3. Era Lock mode  
4. A11y + install tip  
5. Reassess accounts only if sync requests spike  

---

## Metrics to watch (manual / analytics later)

- Daily completion rate  
- Challenge link opens → finishes  
- Career return visits (streak > 1)  
- Share card downloads / copies  
- PWA install acceptance (when tip ships)
