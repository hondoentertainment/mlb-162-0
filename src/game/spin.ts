import { DECADES, type Decade } from '../config/constants';
import { FRANCHISES, franchisesForDecade } from '../data/franchises';
import { playersForSpin } from '../data/pool';
import { POPULATED_KEYS as POPULATED_KEY_LIST } from '../data/poolIndex';
import type { Player, SpinResult } from '../types/game';
import { pickRandom } from './rng';

const POPULATED_KEYS = new Set(POPULATED_KEY_LIST);

function populatedFranchises(decade: Decade) {
  return franchisesForDecade(decade).filter((f) => POPULATED_KEYS.has(`${f.id}|${decade}`));
}

export function spinDraw(rand: () => number, opts?: { decade?: Decade }): SpinResult {
  const decadeCandidates = DECADES.filter((d) => populatedFranchises(d).length > 0);
  const decade = opts?.decade ?? pickRandom(decadeCandidates.length ? decadeCandidates : DECADES, rand);
  const pool = populatedFranchises(decade);
  const franchise = pickRandom(pool.length ? pool : FRANCHISES, rand);
  return { decade, franchiseId: franchise.id };
}

export function spinNewFranchise(
  rand: () => number,
  decade: Decade,
  excludeFranchiseId: string,
): SpinResult {
  const pool = populatedFranchises(decade).filter((f) => f.id !== excludeFranchiseId);
  if (!pool.length) {
    // Fall back to any other populated decade+franchise
    return spinDraw(rand);
  }
  const franchise = pickRandom(pool, rand);
  return { decade, franchiseId: franchise.id };
}

function uniqueByEraName(players: Player[]): Player[] {
  const best = new Map<string, Player>();
  for (const player of players) {
    const key = `${player.name}|${player.franchiseId}|${player.decade}`;
    const prev = best.get(key);
    if (!prev || player.tier > prev.tier) best.set(key, player);
  }
  return [...best.values()];
}

function sortByTierName(a: Player, b: Player): number {
  return b.tier - a.tier || a.name.localeCompare(b.name);
}

/**
 * One human, regardless of era. Ids embed franchise and decade, so a player who
 * appears in several team-eras has several ids — keying "already drafted" off the
 * id would let the same person fill two slots.
 */
export function personKey(player: Player): string {
  return player.name.trim().toLowerCase();
}

/** Every unique player on this franchise-decade, including those who do not fit an open slot. */
export function playersOnSpin(
  spin: SpinResult,
  drafted: Set<string> = new Set(),
): Player[] {
  return uniqueByEraName(
    playersForSpin(spin.franchiseId, spin.decade).filter((p) => !drafted.has(personKey(p))),
  ).sort(sortByTierName);
}

export function getAvailablePlayers(
  spin: SpinResult,
  openPositions: string[],
  drafted: Set<string>,
): Player[] {
  return playersOnSpin(spin, drafted)
    .filter((p) => p.positions.some((pos) => openPositions.includes(pos)))
    .sort(sortByTierName);
}

export function decadesForFranchise(franchiseId: string): Decade[] {
  return DECADES.filter((d) => POPULATED_KEYS.has(`${franchiseId}|${d}`));
}

export function spinDecadeForFranchise(
  rand: () => number,
  franchiseId: string,
  excludeDecade?: Decade,
): SpinResult {
  let decades = decadesForFranchise(franchiseId);
  if (excludeDecade) {
    const filtered = decades.filter((d) => d !== excludeDecade);
    if (filtered.length) decades = filtered;
  }
  const decade = pickRandom(decades.length ? decades : DECADES, rand);
  return { decade, franchiseId };
}

/** Prefer spins that have at least one eligible player for open slots */
export function spinWithEligibility(
  rand: () => number,
  openPositions: string[],
  drafted: Set<string>,
  attempts = 40,
  lockedFranchiseId?: string | null,
  lockedDecade?: Decade | null,
): SpinResult {
  const draw = (): SpinResult =>
    lockedFranchiseId
      ? spinDecadeForFranchise(rand, lockedFranchiseId)
      : spinDraw(rand, lockedDecade ? { decade: lockedDecade } : undefined);

  let best: SpinResult | null = null;
  let bestCount = -1;
  for (let i = 0; i < attempts; i++) {
    const spin = draw();
    const count = getAvailablePlayers(spin, openPositions, drafted).length;
    if (count > bestCount) {
      best = spin;
      bestCount = count;
    }
    if (count > 0 && rand() < 0.65) return spin;
  }
  return best ?? draw();
}

/** Decades that have at least one populated franchise — the Era Lock menu. */
export function playableDecades(): Decade[] {
  return DECADES.filter((decade) =>
    FRANCHISES.some((f) => POPULATED_KEYS.has(`${f.id}|${decade}`)),
  );
}

export function franchisesInDecade(decade: Decade): number {
  return FRANCHISES.filter((f) => POPULATED_KEYS.has(`${f.id}|${decade}`)).length;
}
