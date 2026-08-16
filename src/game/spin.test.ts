import { describe, expect, it } from 'vitest';
import { POSITIONS } from '../config/constants';
import { PLAYERS } from '../data/players';
import { getAvailablePlayers, personKey, playersOnSpin } from './spin';

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

  it('returns no players when every matching player is already drafted', () => {
    const open = ['C'];
    const available = getAvailablePlayers(nyy1950s, open, new Set());
    expect(available.length).toBeGreaterThan(0);
    const taken = new Set(available.map(personKey));
    expect(getAvailablePlayers(nyy1950s, open, taken)).toEqual([]);
  });
});

describe('one person per roster', () => {
  it('hides a drafted player when he reappears in another team-era', () => {
    // Alex Rodriguez exists as a Mariners SS and a Yankees 3B/SS
    const seattle = PLAYERS.find((p) => p.id === 'alex-rodriguez-sea-1990s');
    const yankees = PLAYERS.find((p) => p.id === 'alex-rodriguez-nyy-2000s');
    expect(seattle).toBeDefined();
    expect(yankees).toBeDefined();
    expect(seattle!.id).not.toBe(yankees!.id);

    const nyy2000s = { decade: '2000s' as const, franchiseId: 'nyy' };
    const before = getAvailablePlayers(nyy2000s, ['3B'], new Set());
    expect(before.some((p) => p.name === 'Alex Rodriguez')).toBe(true);

    const drafted = new Set([personKey(seattle!)]);
    const after = getAvailablePlayers(nyy2000s, ['3B'], drafted);
    expect(after.some((p) => p.name === 'Alex Rodriguez')).toBe(false);
  });

  it('keys drafted players by person, not by era-specific id', () => {
    const eras = PLAYERS.filter((p) => p.name === 'Mookie Betts');
    expect(new Set(eras.map((p) => p.id)).size).toBeGreaterThan(1);
    expect(new Set(eras.map(personKey)).size).toBe(1);
  });

  it('does not treat namesake pitcher and hitter as the same person', () => {
    const pitcher = PLAYERS.find((p) => p.name === 'Luis Castillo' && p.pitching);
    const hitter = PLAYERS.find((p) => p.name === 'Luis Castillo' && p.batting);
    expect(pitcher).toBeDefined();
    expect(hitter).toBeDefined();
    expect(personKey(pitcher!)).not.toBe(personKey(hitter!));
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

  it('still lists a person who is already on the roster', () => {
    const yogi = PLAYERS.find((p) => p.id === 'yogi-berra-nyy-1950s');
    expect(yogi).toBeDefined();
    const listed = playersOnSpin(nyy1950s);
    expect(listed.some((p) => p.name === 'Yogi Berra')).toBe(true);
    expect(
      getAvailablePlayers(nyy1950s, ['C'], new Set([personKey(yogi!)])).some(
        (p) => p.name === 'Yogi Berra',
      ),
    ).toBe(false);
  });
});
