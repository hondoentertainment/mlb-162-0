import { describe, expect, it } from 'vitest';
import { POSITIONS } from '../config/constants';
import { getAvailablePlayers } from './spin';

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
    const spin = { decade: '1950s' as const, franchiseId: 'nyy' };
    const open = ['C'];
    const available = getAvailablePlayers(spin, open, new Set());
    expect(available.length).toBeGreaterThan(0);
    const taken = new Set(available.map((p) => p.id));
    expect(getAvailablePlayers(spin, open, taken)).toEqual([]);
  });
});
