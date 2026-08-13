import type { GameMode } from '../config/constants';

/** Daily and Challenge: same spins, no skips, no extra chances. */
export function isFairnessMode(mode: GameMode | null): boolean {
  return mode === 'daily' || mode === 'challenge';
}

/** Undo last pick in Classic, Diamond IQ, Salary Cap, and One Franchise. */
export function canUndoLastPick(mode: GameMode | null): boolean {
  return mode === 'classic' || mode === 'diamondiq' || mode === 'salary' || mode === 'franchise';
}

export type EmptyPoolKind = 'none' | 'no-fits' | 'over-cap';

export function emptyPoolKind(input: {
  mode: GameMode | null;
  hasSpin: boolean;
  spinning: boolean;
  availableCount: number;
  affordableCount: number;
}): EmptyPoolKind {
  if (!input.hasSpin || input.spinning) return 'none';
  if (input.availableCount === 0) return 'no-fits';
  if (input.mode === 'salary' && input.affordableCount === 0) return 'over-cap';
  return 'none';
}

/** Empty / unaffordable spins may redraw only outside Daily and Challenge. */
export function canRespinEmptyPool(mode: GameMode | null, kind: EmptyPoolKind): boolean {
  return kind !== 'none' && !isFairnessMode(mode);
}

export function emptyPoolCopy(kind: EmptyPoolKind, fairMode: boolean): string {
  if (kind === 'over-cap') {
    return 'Nobody on this spin fits the remaining salary cap.';
  }
  if (fairMode) {
    return 'This franchise and decade have no legal picks for your open positions. Daily and Challenge do not allow a redraw — everyone faces the same draws.';
  }
  return 'This franchise and decade have no legal picks for your open positions.';
}
