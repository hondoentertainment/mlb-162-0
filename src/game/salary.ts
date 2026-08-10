import type { Player } from '../types/game';

/** Soft cap in millions — forces stars vs depth tradeoffs across 9 slots */
export const SALARY_CAP_M = 175;

const TIER_SALARY: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 7,
  2: 12,
  3: 20,
  4: 30,
  5: 42,
};

export function playerSalary(player: Player): number {
  return TIER_SALARY[player.tier] + (player.hof ? 6 : 0);
}

export function rosterSpend(players: (Player | null | undefined)[]): number {
  return players.reduce((sum, p) => sum + (p ? playerSalary(p) : 0), 0);
}

export function formatSalary(millions: number): string {
  return `$${millions}M`;
}
