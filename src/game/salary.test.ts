import { describe, expect, it } from 'vitest';
import type { Player } from '../types/game';
import { formatSalary, playerSalary, rosterSpend, SALARY_CAP_M } from './salary';

function makePlayer(tier: 1 | 2 | 3 | 4 | 5, hof = false): Player {
  return {
    id: `p-${tier}-${hof}`,
    name: 'Test',
    franchiseId: 'nyy',
    decade: '1990s',
    positions: ['CF'],
    tier,
    hof,
    batting: { avg: 0.3, obp: 0.4, slg: 0.5 },
  };
}

describe('salary', () => {
  it('prices tiers and HOF bonus', () => {
    expect(playerSalary(makePlayer(1))).toBe(7);
    expect(playerSalary(makePlayer(5))).toBe(42);
    expect(playerSalary(makePlayer(5, true))).toBe(48);
  });

  it('sums roster spend', () => {
    expect(rosterSpend([makePlayer(5), makePlayer(1), null])).toBe(49);
  });

  it('keeps the soft cap below nine max stars', () => {
    const nineStars = Array.from({ length: 9 }, () => makePlayer(5, true));
    expect(rosterSpend(nineStars)).toBeGreaterThan(SALARY_CAP_M);
  });

  it('allows a balanced mid-tier nine under the cap', () => {
    const mid = Array.from({ length: 9 }, () => makePlayer(3));
    expect(rosterSpend(mid)).toBeLessThanOrEqual(SALARY_CAP_M);
  });

  it('exposes a playable soft cap constant', () => {
    expect(SALARY_CAP_M).toBeGreaterThanOrEqual(200);
  });

  it('formats millions', () => {
    expect(formatSalary(175)).toBe('$175M');
  });
});
