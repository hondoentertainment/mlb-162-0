import { describe, expect, it } from 'vitest';
import { DECADES } from '../config/constants';
import { FRANCHISES } from './franchises';
import { PLAYERS, playersForSpin } from './players';

describe('player pool coverage', () => {
  it('has a deep historical catalog', () => {
    expect(PLAYERS.length).toBeGreaterThanOrEqual(1400);
    expect(new Set(PLAYERS.map((p) => p.name)).size).toBeGreaterThanOrEqual(1000);
  });

  it('gives every franchise-decade at least five unique names', () => {
    const thin: string[] = [];
    for (const franchise of FRANCHISES) {
      for (const decade of DECADES) {
        if (!franchise.decades.includes(decade)) continue;
        const names = new Set(playersForSpin(franchise.id, decade).map((p) => p.name));
        if (names.size < 5) thin.push(`${franchise.id}|${decade} (${names.size})`);
      }
    }
    expect(thin).toEqual([]);
  });
});
