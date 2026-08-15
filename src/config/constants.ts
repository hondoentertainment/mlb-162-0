export const SEASON_GAMES = 162;

export const POSITIONS = [
  'C',
  '1B',
  '2B',
  '3B',
  'SS',
  'LF',
  'CF',
  'RF',
  'SP',
] as const;

export type Position = (typeof POSITIONS)[number];

export const POSITION_LABELS: Record<Position, string> = {
  C: 'Catcher',
  '1B': 'First Base',
  '2B': 'Second Base',
  '3B': 'Third Base',
  SS: 'Shortstop',
  LF: 'Left Field',
  CF: 'Center Field',
  RF: 'Right Field',
  SP: 'Starting Pitcher',
};

export const DECADES = [
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s',
] as const;

export type Decade = (typeof DECADES)[number];

export const ROUNDS = POSITIONS.length;

export type GameMode =
  | 'classic'
  | 'diamondiq'
  | 'daily'
  | 'salary'
  | 'franchise'
  | 'challenge'
  | 'eralock'
  | 'ironman';

export const MODE_LABELS: Record<GameMode, string> = {
  classic: 'Classic',
  diamondiq: 'Diamond IQ',
  daily: 'Daily',
  salary: 'Salary Cap',
  franchise: 'One Franchise',
  challenge: 'Challenge',
  eralock: 'Era Lock',
  ironman: 'Ironman',
};

/** Spin animation duration; shortened for E2E and for reduced-motion users */
export function spinDurationMs(): number {
  if (typeof window === 'undefined') return 900;
  if ((window as Window & { __E2E__?: boolean }).__E2E__) return 40;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 200;
  return 900;
}

export type GradeId =
  | 'perfection'
  | 'dynasty'
  | 'contender'
  | 'playoffs'
  | 'rebuilding';

export interface GradeBand {
  id: GradeId;
  label: string;
  minWins: number;
}

export const GRADE_BANDS: GradeBand[] = [
  { id: 'perfection', label: 'PERFECTION', minWins: 162 },
  { id: 'dynasty', label: 'DYNASTY', minWins: 140 },
  { id: 'contender', label: 'CONTENDER', minWins: 100 },
  { id: 'playoffs', label: 'PLAYOFFS', minWins: 85 },
  { id: 'rebuilding', label: 'REBUILDING', minWins: 0 },
];

export const LEADERBOARD_MIN_WINS = 140;
export const LEADERBOARD_MAX = 50;
export const STORAGE_KEYS = {
  leaderboard: 'mlb1620_leaderboard',
  daily: 'mlb1620_daily',
  lastResult: 'mlb1620_last_result',
  career: 'mlb1620_career',
  achievements: 'mlb1620_achievements',
} as const;
