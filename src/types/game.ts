import type { Decade, GameMode, GradeId, Position } from '../config/constants';

export interface BattingStats {
  avg: number;
  obp: number;
  slg: number;
}

export interface PitchingStats {
  era: number;
  whip: number;
  k9: number;
}

export interface Player {
  id: string;
  name: string;
  franchiseId: string;
  decade: Decade;
  positions: Position[];
  tier: 1 | 2 | 3 | 4 | 5;
  hof: boolean;
  batting?: BattingStats;
  pitching?: PitchingStats;
}

export interface Franchise {
  id: string;
  name: string;
  shortName: string;
  city: string;
  abbreviation: string;
  primary: string;
  secondary: string;
  decades: Decade[];
}

export interface SpinResult {
  decade: Decade;
  franchiseId: string;
}

export interface RosterSlot {
  position: Position;
  player: Player | null;
}

/** How one roster slot fed the season result. */
export interface SlotContribution {
  position: Position;
  playerName: string | null;
  /** Slot quality, 0–1. */
  rating: number;
  /** Rating relative to the roster average — positive carries, negative drags. */
  delta: number;
}

export interface SeasonResult {
  wins: number;
  losses: number;
  score: number;
  gradeId: GradeId;
  gradeLabel: string;
  strengths: string[];
  weaknesses: string[];
  bestPickId: string | null;
  weakestSlot: Position | null;
  contributions: SlotContribution[];
}

export interface LeaderboardEntry {
  id: string;
  wins: number;
  losses: number;
  gradeLabel: string;
  mode: GameMode;
  rosterNames: string[];
  createdAt: string;
}

export interface DailyRecord {
  dateKey: string;
  completed: boolean;
  wins?: number;
  losses?: number;
  gradeLabel?: string;
  rosterNames?: string[];
}

declare global {
  interface Window {
    __E2E__?: boolean;
  }
}
