import type { Player } from '../types/game';

/**
 * The player table is by far the largest module in the app and is only needed
 * once a draft starts, so it is loaded on demand rather than at first paint.
 * Draft logic is synchronous, so callers must `ensurePool()` before starting a
 * game; everything after that reads from the primed index.
 */

let players: Player[] | null = null;
let byFranchiseDecade: Map<string, Player[]> | null = null;
let loading: Promise<void> | null = null;

function notLoaded(): never {
  throw new Error('Player pool not loaded — await ensurePool() first');
}

export function setPool(next: Player[]): void {
  players = next;
  const index = new Map<string, Player[]>();
  for (const player of next) {
    const key = `${player.franchiseId}|${player.decade}`;
    const bucket = index.get(key);
    if (bucket) bucket.push(player);
    else index.set(key, [player]);
  }
  byFranchiseDecade = index;
}

export function isPoolLoaded(): boolean {
  return players !== null;
}

export async function ensurePool(): Promise<void> {
  if (players) return;
  loading ??= import('./players').then((mod) => setPool(mod.PLAYERS));
  await loading;
}

export function allPlayers(): Player[] {
  return players ?? notLoaded();
}

/** Indexed lookup — the draft calls this dozens of times per spin. */
export function playersForSpin(franchiseId: string, decade: string): Player[] {
  if (!byFranchiseDecade) notLoaded();
  return byFranchiseDecade.get(`${franchiseId}|${decade}`) ?? [];
}
