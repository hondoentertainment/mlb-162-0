import { beforeEach, describe, expect, it } from 'vitest';
import { evaluateAchievements, loadAchievements } from './achievements';
import { loadCareer, recordCareerResult } from './career';

const baseResult = {
  wins: 90,
  losses: 72,
  score: 500,
  gradeId: 'playoffs' as const,
  gradeLabel: 'PLAYOFFS',
  strengths: [],
  weaknesses: [],
  bestPickId: null,
  weakestSlot: null,
};

describe('achievements', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('unlocks first season and playoffs', () => {
    const career = recordCareerResult({ mode: 'classic', result: baseResult });
    const newly = evaluateAchievements({
      mode: 'classic',
      result: baseResult,
      rosterPlayers: [],
      career,
    });
    expect(newly).toContain('first_season');
    expect(newly).toContain('playoffs');
    expect(loadAchievements().first_season).toBeTruthy();
  });

  it('unlocks hof_five', () => {
    const career = loadCareer();
    const newly = evaluateAchievements({
      mode: 'classic',
      result: baseResult,
      rosterPlayers: Array.from({ length: 5 }, (_, i) => ({
        id: `p${i}`,
        name: `P${i}`,
        franchiseId: 'nyy',
        decade: '1990s' as const,
        positions: ['C' as const],
        tier: 1 as const,
        hof: true,
      })),
      career,
    });
    expect(newly).toContain('hof_five');
  });
});
