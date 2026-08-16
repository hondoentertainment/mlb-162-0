import { describe, expect, it } from 'vitest';
import { DECADES, POSITIONS } from '../config/constants';
import { spinForRound } from './draftSequence';
import { getAvailablePlayers, franchisesInDecade, personKey, playableDecades } from './spin';
import type { RosterSlot } from '../types/game';
import { initialState, reducer } from '../state/gameReducer';

describe('Era Lock', () => {
  it('offers only decades that have clubs', () => {
    const decades = playableDecades();
    expect(decades.length).toBeGreaterThan(0);
    expect(decades.every((d) => DECADES.includes(d))).toBe(true);
    expect(decades.every((d) => franchisesInDecade(d) > 0)).toBe(true);
  });

  it('locks the decade in state and drops decade skips for team skips', () => {
    const state = reducer(initialState, { type: 'START', mode: 'eralock', decade: '1990s' });
    expect(state.lockedDecade).toBe('1990s');
    expect(state.decadeSkips).toBe(0);
    expect(state.teamSkips).toBe(2);
    expect(state.showStats).toBe(true);
  });

  it('keeps the locked decade when Play again omits a new decade', () => {
    const first = reducer(initialState, { type: 'START', mode: 'eralock', decade: '1990s' });
    const replay = reducer(first, { type: 'START', mode: 'eralock', decade: first.lockedDecade ?? undefined });
    expect(replay.lockedDecade).toBe('1990s');
    expect(replay.screen).toBe('draft');
  });

  it('does not unlock the decade when START is missing decade', () => {
    const unlocked = reducer(initialState, { type: 'START', mode: 'eralock' });
    expect(unlocked.lockedDecade).toBeNull();
  });

  it('never spins outside the locked decade across a full draft', () => {
    for (const decade of ['1960s', '1990s', '2020s'] as const) {
      const roster: RosterSlot[] = POSITIONS.map((position) => ({ position, player: null }));

      for (let round = 1; round <= POSITIONS.length; round++) {
        const open = roster.filter((s) => !s.player).map((s) => s.position);
        const drafted = new Set(
          roster.filter((s) => s.player).map((s) => personKey(s.player!)),
        );
        const spin = spinForRound({
          mode: 'eralock',
          round,
          randSeed: 1234 + round,
          openPositions: open,
          drafted,
          lockedDecade: decade,
        });
        expect(spin.decade).toBe(decade);

        const available = getAvailablePlayers(spin, open, drafted);
        if (!available.length) continue;
        const player = available[0]!;
        const position = player.positions.find((p) => open.includes(p))!;
        roster.find((s) => s.position === position)!.player = player;
      }
    }
  });
});

describe('Ironman', () => {
  it('starts with no skips', () => {
    const state = reducer(initialState, { type: 'START', mode: 'ironman' });
    expect(state.teamSkips).toBe(0);
    expect(state.decadeSkips).toBe(0);
    expect(state.lockedDecade).toBeNull();
    expect(state.lockedFranchiseId).toBeNull();
  });

  it('refuses a manual redraw', () => {
    const started = reducer(initialState, { type: 'START', mode: 'ironman' });
    const withSpin = reducer(started, {
      type: 'SPIN_DONE',
      spin: { decade: '1950s', franchiseId: 'zzz-empty' },
    });
    expect(reducer(withSpin, { type: 'RESPIN' })).toBe(withSpin);
  });

  it('records no undo snapshot', () => {
    const started = reducer(initialState, { type: 'START', mode: 'ironman' });
    const withSpin = reducer(started, {
      type: 'SPIN_DONE',
      spin: { decade: '1950s', franchiseId: 'nyy' },
    });
    const open = withSpin.roster.filter((s) => !s.player).map((s) => s.position);
    const available = getAvailablePlayers(withSpin.spin!, open, new Set());
    const player = available[0]!;
    const picked = reducer(withSpin, {
      type: 'PICK',
      player,
      position: player.positions.find((p) => open.includes(p))!,
    });
    expect(picked.lastPick).toBeNull();
    expect(reducer(picked, { type: 'UNDO_LAST_PICK' })).toBe(picked);
  });

  it('still draws a playable spin rather than soft-locking', () => {
    const roster: RosterSlot[] = POSITIONS.map((position) => ({ position, player: null }));
    // Only a pitcher slot left, which is the easiest way to hit an empty pool.
    for (const slot of roster) if (slot.position !== 'SP') slot.player = null;

    const spin = spinForRound({
      mode: 'ironman',
      round: 9,
      randSeed: 77,
      openPositions: ['SP'],
      drafted: new Set(),
    });
    expect(getAvailablePlayers(spin, ['SP'], new Set()).length).toBeGreaterThan(0);
  });
});
