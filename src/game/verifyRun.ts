import { POSITIONS, type Position } from '../config/constants';
import { PLAYERS } from '../data/players';
import { isPoolLoaded, setPool } from '../data/pool';
import { spinForRound } from './draftSequence';
import { simulateSeason } from './simulate';
import { getAvailablePlayers, personKey } from './spin';
import type { Player, RosterSlot, SeasonResult } from '../types/game';

/** One draft pick, in the order it was made. */
export interface SubmittedPick {
  position: Position;
  playerId: string;
}

export type VerifyResult =
  | { ok: true; roster: RosterSlot[]; result: SeasonResult }
  | { ok: false; error: string };

const PLAYER_BY_ID: Map<string, Player> = new Map(PLAYERS.map((p) => [p.id, p]));

const POSITION_SET = new Set<string>(POSITIONS);

function isPosition(value: unknown): value is Position {
  return typeof value === 'string' && POSITION_SET.has(value);
}

export function parsePicks(value: unknown): SubmittedPick[] | null {
  if (!Array.isArray(value) || value.length !== POSITIONS.length) return null;
  const picks: SubmittedPick[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null;
    const { position, playerId } = raw as Record<string, unknown>;
    if (!isPosition(position) || typeof playerId !== 'string') return null;
    picks.push({ position, playerId });
  }
  return picks;
}

/**
 * Replays a Daily run against that date's seed. Every pick must have been
 * legally available on the spin its round actually produced, so a client
 * cannot post a roster it never drafted or a record it never earned.
 */
export function verifyDailyRun(dateKey: string, picks: SubmittedPick[]): VerifyResult {
  // Server-side there is no bundle to protect, so prime the pool directly.
  if (!isPoolLoaded()) setPool(PLAYERS);

  if (picks.length !== POSITIONS.length) {
    return { ok: false, error: `Expected ${POSITIONS.length} picks` };
  }

  const roster: RosterSlot[] = POSITIONS.map((position) => ({ position, player: null }));

  for (let i = 0; i < picks.length; i++) {
    const pick = picks[i]!;
    const round = i + 1;

    const slot = roster.find((s) => s.position === pick.position);
    if (!slot) return { ok: false, error: `Unknown position at round ${round}` };
    if (slot.player) return { ok: false, error: `Position ${pick.position} filled twice` };

    const player = PLAYER_BY_ID.get(pick.playerId);
    if (!player) return { ok: false, error: `Unknown player at round ${round}` };
    if (!player.positions.includes(pick.position)) {
      return { ok: false, error: `${player.name} cannot play ${pick.position}` };
    }

    const open = roster.filter((s) => !s.player).map((s) => s.position);
    const drafted = new Set(
      roster.filter((s) => s.player).map((s) => personKey(s.player!)),
    );
    if (drafted.has(personKey(player))) {
      return { ok: false, error: `${player.name} drafted twice` };
    }

    const spin = spinForRound({
      mode: 'daily',
      round,
      randSeed: 0,
      dateKey,
      openPositions: open,
      drafted,
    });

    const available = getAvailablePlayers(spin, open, drafted);
    if (!available.some((p) => p.id === player.id)) {
      return { ok: false, error: `${player.name} was not available in round ${round}` };
    }

    slot.player = player;
  }

  return { ok: true, roster, result: simulateSeason(roster) };
}
