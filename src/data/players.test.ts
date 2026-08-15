import { describe, expect, it } from 'vitest';
import { DECADES, POSITIONS } from '../config/constants';
import { FRANCHISES } from './franchises';
import { PLAYERS, playersForSpin } from './players';

function uniqueOnSpin(franchiseId: string, decade: string) {
  const best = new Map<string, (typeof PLAYERS)[number]>();
  for (const player of playersForSpin(franchiseId, decade)) {
    const prev = best.get(player.name);
    if (!prev || player.tier > prev.tier) best.set(player.name, player);
  }
  return [...best.values()];
}

/** True when nine distinct players can cover C through SP. */
function canFieldStartingNine(players: ReturnType<typeof uniqueOnSpin>): boolean {
  const match = new Array<number>(POSITIONS.length).fill(-1);
  const search = (u: number, seen: boolean[]): boolean => {
    for (let v = 0; v < POSITIONS.length; v++) {
      if (seen[v] || !players[u].positions.includes(POSITIONS[v])) continue;
      seen[v] = true;
      if (match[v] === -1 || search(match[v], seen)) {
        match[v] = u;
        return true;
      }
    }
    return false;
  };
  for (let u = 0; u < players.length; u++) search(u, POSITIONS.map(() => false));
  return match.every((u) => u !== -1);
}

describe('player pool coverage', () => {
  it('has a deep historical catalog', () => {
    expect(PLAYERS.length).toBeGreaterThanOrEqual(2000);
    expect(new Set(PLAYERS.map((p) => p.name)).size).toBeGreaterThanOrEqual(1500);
  });

  it('gives every franchise-decade a distinct starting nine', () => {
    const thin: string[] = [];
    for (const franchise of FRANCHISES) {
      for (const decade of DECADES) {
        if (!franchise.decades.includes(decade)) continue;
        const players = uniqueOnSpin(franchise.id, decade);
        if (players.length < 9 || !canFieldStartingNine(players)) {
          thin.push(`${franchise.id}|${decade} (${players.length})`);
        }
      }
    }
    expect(thin).toEqual([]);
  });
});
