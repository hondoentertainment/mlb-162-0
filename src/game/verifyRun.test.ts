import { describe, expect, it } from 'vitest';
import { POSITIONS } from '../config/constants';
import { PLAYERS } from '../data/players';
import { spinForRound } from './draftSequence';
import { getAvailablePlayers, personKey } from './spin';
import { parsePicks, verifyChallengeRun, verifyDailyRun, type SubmittedPick } from './verifyRun';
import type { RosterSlot } from '../types/game';

/** Play a real Daily draft for `dateKey`, always taking the top available player. */
function playDaily(dateKey: string): SubmittedPick[] {
  const roster: RosterSlot[] = POSITIONS.map((position) => ({ position, player: null }));
  const picks: SubmittedPick[] = [];

  for (let round = 1; round <= POSITIONS.length; round++) {
    const open = roster.filter((s) => !s.player).map((s) => s.position);
    const drafted = new Set(roster.filter((s) => s.player).map((s) => personKey(s.player!)));
    const spin = spinForRound({
      mode: 'daily',
      round,
      randSeed: 0,
      dateKey,
      openPositions: open,
      drafted,
    });
    const available = getAvailablePlayers(spin, open, drafted);
    if (!available.length) throw new Error(`No pick available in round ${round}`);

    const player = available[0]!;
    const position = player.positions.find((p) => open.includes(p))!;
    roster.find((s) => s.position === position)!.player = player;
    picks.push({ position, playerId: player.id });
  }

  return picks;
}

const DATES = ['2026-01-15', '2026-04-02', '2026-08-15', '2026-11-30'];

describe('daily draft invariants', () => {
  it('never offers the same person twice in one run', () => {
    for (const dateKey of DATES) {
      const picks = playDaily(dateKey);
      const names = picks.map((p) => PLAYERS.find((x) => x.id === p.playerId)!.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('fills all nine positions', () => {
    for (const dateKey of DATES) {
      const picks = playDaily(dateKey);
      expect(new Set(picks.map((p) => p.position)).size).toBe(POSITIONS.length);
    }
  });

  it('draws the same spins for the same date', () => {
    expect(playDaily('2026-08-15')).toEqual(playDaily('2026-08-15'));
  });
});

describe('verifyDailyRun', () => {
  it('accepts a genuinely drafted run and recomputes its record', () => {
    const dateKey = '2026-08-15';
    const out = verifyDailyRun(dateKey, playDaily(dateKey));
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.wins + out.result.losses).toBe(162);
    expect(out.roster.every((s) => s.player)).toBe(true);
  });

  it('rejects a roster that was never drawn on that date', () => {
    const dateKey = '2026-08-15';
    const forged: SubmittedPick[] = [
      { position: 'C', playerId: 'yogi-berra-nyy-1950s' },
      { position: '1B', playerId: 'jeff-bagwell-hou-1990s' },
      { position: '2B', playerId: 'rod-carew-min-1970s' },
      { position: '3B', playerId: 'mike-schmidt-phi-1970s' },
      { position: 'SS', playerId: 'cal-ripken-jr-bal-1980s' },
      { position: 'LF', playerId: 'barry-bonds-sf-2000s' },
      { position: 'CF', playerId: 'willie-mays-sf-1950s' },
      { position: 'RF', playerId: 'hank-aaron-atl-1950s' },
      { position: 'SP', playerId: 'pedro-martinez-bos-1990s' },
    ];
    const out = verifyDailyRun(dateKey, forged);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.error).toMatch(/not available/i);
  });

  it('rejects a run that swaps in a different player mid-draft', () => {
    const dateKey = '2026-04-02';
    const picks = playDaily(dateKey);
    const tampered = [...picks];
    tampered[4] = { position: picks[4]!.position, playerId: 'mickey-mantle-nyy-1950s' };
    const out = verifyDailyRun(dateKey, tampered);
    expect(out.ok).toBe(false);
  });

  it('rejects a run replayed against the wrong date', () => {
    const picks = playDaily('2026-01-15');
    expect(verifyDailyRun('2026-08-15', picks).ok).toBe(false);
  });

  it('rejects an incomplete roster', () => {
    const picks = playDaily('2026-08-15').slice(0, 8);
    const out = verifyDailyRun('2026-08-15', picks);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.error).toMatch(/9 picks/);
  });
});

function playChallenge(randSeed: number): SubmittedPick[] {
  const roster: RosterSlot[] = POSITIONS.map((position) => ({ position, player: null }));
  const picks: SubmittedPick[] = [];
  for (let round = 1; round <= POSITIONS.length; round++) {
    const open = roster.filter((s) => !s.player).map((s) => s.position);
    const drafted = new Set(roster.filter((s) => s.player).map((s) => personKey(s.player!)));
    const spin = spinForRound({
      mode: 'challenge',
      round,
      randSeed,
      openPositions: open,
      drafted,
    });
    const available = getAvailablePlayers(spin, open, drafted);
    if (!available.length) throw new Error(`No pick available in round ${round}`);
    const player = available[0]!;
    const position = player.positions.find((p) => open.includes(p))!;
    roster.find((s) => s.position === position)!.player = player;
    picks.push({ position, playerId: player.id });
  }
  return picks;
}

describe('verifyChallengeRun', () => {
  it('accepts a genuine challenge draft', () => {
    const picks = playChallenge(424242);
    const out = verifyChallengeRun(424242, picks);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.roster.every((s) => s.player)).toBe(true);
  });

  it('rejects the same picks against a different seed', () => {
    const picks = playChallenge(424242);
    expect(verifyChallengeRun(999999, picks).ok).toBe(false);
  });
});

describe('parsePicks', () => {
  it('accepts a well-formed payload', () => {
    const picks = playDaily('2026-08-15');
    expect(parsePicks(picks)).toEqual(picks);
  });

  it('rejects malformed payloads', () => {
    expect(parsePicks(null)).toBeNull();
    expect(parsePicks([])).toBeNull();
    expect(parsePicks([{ position: 'DH', playerId: 'x' }])).toBeNull();
    expect(
      parsePicks(POSITIONS.map((position) => ({ position, playerId: 42 }))),
    ).toBeNull();
  });
});
