import { describe, expect, it } from 'vitest';
import { POSITIONS } from '../config/constants';
import { getAvailablePlayers, playersOnSpin } from './spin';

const nyy1950s = { decade: '1950s' as const, franchiseId: 'nyy' };

describe('empty pool detection', () => {
  it('returns no players for an unknown franchise-decade', () => {
    const pool = getAvailablePlayers(
      { decade: '1950s', franchiseId: 'zzz-empty' },
      [...POSITIONS],
      new Set(),
    );
    expect(pool).toEqual([]);
  });

  it('returns no players when every matching id is already taken', () => {
    const open = ['C'];
    const available = getAvailablePlayers(nyy1950s, open, new Set());
    expect(available.length).toBeGreaterThan(0);
    const taken = new Set(available.map((p) => p.id));
    expect(getAvailablePlayers(nyy1950s, open, taken)).toEqual([]);
  });
});

describe('full era roster', () => {
  it('lists every unique player on a franchise-decade, not only open-slot fits', () => {
    const all = playersOnSpin(nyy1950s);
    const catchers = getAvailablePlayers(nyy1950s, ['C'], new Set());
    expect(all.map((p) => p.name)).toEqual(
      expect.arrayContaining(['Mickey Mantle', 'Yogi Berra', 'Whitey Ford']),
    );
    expect(all.length).toBeGreaterThan(catchers.length);
    expect(catchers.every((p) => p.positions.includes('C'))).toBe(true);
    expect(all.some((p) => !p.positions.includes('C'))).toBe(true);
  });

  it('dedupes the same name on one franchise-decade', () => {
    const names = playersOnSpin(nyy1950s).map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
