import { describe, expect, it } from 'vitest';
import { PLAYERS } from '../data/players';
import { getAvailablePlayers } from '../game/spin';
import { draftedKeys, initialState, openPositions, reducer } from './gameReducer';

const yogi = PLAYERS.find((p) => p.id === 'yogi-berra-nyy-1950s');
const mantle = PLAYERS.find((p) => p.id === 'mickey-mantle-nyy-1950s');

if (!yogi || !mantle) {
  throw new Error('Expected Yankees 1950s fixtures in the player pool');
}

const nyy1950s = { decade: '1950s' as const, franchiseId: 'nyy' };

function start(mode: 'classic' | 'daily' | 'challenge' | 'salary' | 'franchise' | 'diamondiq') {
  return reducer(initialState, {
    type: 'START',
    mode,
    franchiseId: mode === 'franchise' ? 'nyy' : undefined,
  });
}

function withSpin(mode: Parameters<typeof start>[0] = 'classic') {
  return reducer(start(mode), { type: 'SPIN_DONE', spin: nyy1950s });
}

describe('undo last pick', () => {
  it('restores the last Classic pick and its spin', () => {
    const picked = reducer(withSpin('classic'), { type: 'PICK', player: yogi, position: 'C' });
    expect(picked.roster.find((s) => s.position === 'C')?.player?.id).toBe(yogi.id);
    expect(picked.spin).toBeNull();
    expect(picked.round).toBe(2);
    expect(picked.lastPick).not.toBeNull();

    const undone = reducer(picked, { type: 'UNDO_LAST_PICK' });
    expect(undone.roster.find((s) => s.position === 'C')?.player).toBeNull();
    expect(undone.spin).toEqual(nyy1950s);
    expect(undone.round).toBe(1);
    expect(undone.screen).toBe('draft');
    expect(undone.lastPick).toBeNull();
  });

  it('is a single step — a second undo is a no-op', () => {
    const picked = reducer(withSpin('classic'), { type: 'PICK', player: yogi, position: 'C' });
    const undone = reducer(picked, { type: 'UNDO_LAST_PICK' });
    expect(reducer(undone, { type: 'UNDO_LAST_PICK' })).toEqual(undone);
  });

  it('lets the player pick someone else after undo', () => {
    const picked = reducer(withSpin('classic'), { type: 'PICK', player: yogi, position: 'C' });
    const undone = reducer(picked, { type: 'UNDO_LAST_PICK' });
    const again = reducer(undone, { type: 'PICK', player: mantle, position: 'CF' });
    expect(again.roster.find((s) => s.position === 'C')?.player).toBeNull();
    expect(again.roster.find((s) => s.position === 'CF')?.player?.id).toBe(mantle.id);
  });

  it('works in Diamond IQ, Salary Cap, and One Franchise', () => {
    for (const mode of ['diamondiq', 'salary', 'franchise'] as const) {
      const picked = reducer(withSpin(mode), { type: 'PICK', player: yogi, position: 'C' });
      const undone = reducer(picked, { type: 'UNDO_LAST_PICK' });
      expect(undone.roster.find((s) => s.position === 'C')?.player).toBeNull();
      expect(undone.spin).toEqual(nyy1950s);
    }
  });

  it('does not grant undo in Daily or Challenge', () => {
    for (const mode of ['daily', 'challenge'] as const) {
      const picked = reducer(withSpin(mode), { type: 'PICK', player: yogi, position: 'C' });
      expect(picked.lastPick).toBeNull();
      const undone = reducer(picked, { type: 'UNDO_LAST_PICK' });
      expect(undone.roster.find((s) => s.position === 'C')?.player?.id).toBe(yogi.id);
      expect(undone).toBe(picked);
    }
  });
});

describe('one person per roster', () => {
  it('rejects a pick for someone already on the roster in another era', () => {
    const seattleARod = PLAYERS.find((p) => p.id === 'alex-rodriguez-sea-1990s')!;
    const yankeeARod = PLAYERS.find((p) => p.id === 'alex-rodriguez-nyy-2000s')!;

    const drafted = reducer(withSpin('classic'), {
      type: 'PICK',
      player: seattleARod,
      position: 'SS',
    });
    expect(drafted.roster.find((s) => s.position === 'SS')?.player?.id).toBe(seattleARod.id);

    const again = reducer(drafted, { type: 'PICK', player: yankeeARod, position: '3B' });
    expect(again).toBe(drafted);
    expect(again.roster.find((s) => s.position === '3B')?.player).toBeNull();
  });

  it('still allows a different player at that slot', () => {
    const seattleARod = PLAYERS.find((p) => p.id === 'alex-rodriguez-sea-1990s')!;
    const drafted = reducer(withSpin('classic'), {
      type: 'PICK',
      player: seattleARod,
      position: 'SS',
    });
    const next = reducer(drafted, { type: 'PICK', player: mantle, position: 'CF' });
    expect(next.roster.find((s) => s.position === 'CF')?.player?.id).toBe(mantle.id);
  });
});

describe('empty-pool respin', () => {
  const emptySpin = { decade: '1950s' as const, franchiseId: 'zzz-empty' };

  it('redraws Classic when the current spin has no legal picks', () => {
    let state = start('classic');
    state = { ...state, spin: emptySpin, randSeed: 1 };
    expect(
      getAvailablePlayers(emptySpin, openPositions(state.roster), draftedKeys(state.roster)),
    ).toHaveLength(0);

    const next = reducer(state, { type: 'RESPIN' });
    expect(next.spin).not.toEqual(emptySpin);
    expect(
      getAvailablePlayers(next.spin!, openPositions(next.roster), draftedKeys(next.roster)).length,
    ).toBeGreaterThan(0);
  });

  it('does not redraw Daily or Challenge empty spins', () => {
    for (const mode of ['daily', 'challenge'] as const) {
      let state = start(mode);
      state = { ...state, spin: emptySpin };
      const next = reducer(state, { type: 'RESPIN' });
      expect(next).toBe(state);
      expect(next.spin).toEqual(emptySpin);
    }
  });
});
