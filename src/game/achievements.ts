import { STORAGE_KEYS, type GameMode, type GradeId } from '../config/constants';
import type { Player, SeasonResult } from '../types/game';
import type { CareerStats } from './career';

export type AchievementId =
  | 'first_season'
  | 'playoffs'
  | 'contender'
  | 'dynasty'
  | 'perfection'
  | 'first_daily'
  | 'daily_streak_3'
  | 'daily_streak_7'
  | 'salary_debut'
  | 'franchise_debut'
  | 'diamond_debut'
  | 'challenge_debut'
  | 'eralock_debut'
  | 'ironman_debut'
  | 'hof_five'
  | 'centurion';

export interface AchievementDef {
  id: AchievementId;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_season',
    title: 'Opening Day',
    description: 'Finish your first simulated season.',
  },
  {
    id: 'playoffs',
    title: 'Wild Card',
    description: 'Reach the PLAYOFFS grade (85+ wins).',
  },
  {
    id: 'contender',
    title: 'Pennant Race',
    description: 'Reach CONTENDER (100+ wins).',
  },
  {
    id: 'dynasty',
    title: 'Dynasty Maker',
    description: 'Reach DYNASTY (140+ wins).',
  },
  {
    id: 'perfection',
    title: '162-0',
    description: 'Complete a perfect season.',
  },
  {
    id: 'first_daily',
    title: 'Daily Grind',
    description: 'Complete a Daily Challenge.',
  },
  {
    id: 'daily_streak_3',
    title: 'Hot Streak',
    description: 'Hit a 3-day Daily streak.',
  },
  {
    id: 'daily_streak_7',
    title: 'Iron Calendar',
    description: 'Hit a 7-day Daily streak.',
  },
  {
    id: 'salary_debut',
    title: 'Payroll Boss',
    description: 'Finish a Salary Cap season.',
  },
  {
    id: 'franchise_debut',
    title: 'Franchise Forever',
    description: 'Finish a One Franchise season.',
  },
  {
    id: 'diamond_debut',
    title: 'Blind Trust',
    description: 'Finish a Diamond IQ season.',
  },
  {
    id: 'challenge_debut',
    title: 'Duel Ready',
    description: 'Finish a shared Challenge.',
  },
  {
    id: 'eralock_debut',
    title: 'Time Capsule',
    description: 'Finish an Era Lock season.',
  },
  {
    id: 'ironman_debut',
    title: 'No Safety Net',
    description: 'Finish an Ironman season.',
  },
  {
    id: 'hof_five',
    title: 'Cooperstown Nine',
    description: 'Field five or more Hall of Famers.',
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Play 100 seasons on this device.',
  },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
) as Record<AchievementId, AchievementDef>;

export type UnlockedMap = Partial<Record<AchievementId, string>>;

export function loadAchievements(): UnlockedMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.achievements);
    if (!raw) return {};
    return JSON.parse(raw) as UnlockedMap;
  } catch {
    return {};
  }
}

export function saveAchievements(map: UnlockedMap): void {
  localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(map));
}

const GRADE_RANK: Record<GradeId, number> = {
  rebuilding: 0,
  playoffs: 1,
  contender: 2,
  dynasty: 3,
  perfection: 4,
};

export interface EvaluateAchievementsInput {
  mode: GameMode;
  result: SeasonResult;
  rosterPlayers: (Player | null)[];
  career: CareerStats;
}

export function evaluateAchievements(input: EvaluateAchievementsInput): AchievementId[] {
  const unlocked = loadAchievements();
  const now = new Date().toISOString();
  const newly: AchievementId[] = [];

  const unlock = (id: AchievementId) => {
    if (unlocked[id]) return;
    unlocked[id] = now;
    newly.push(id);
  };

  unlock('first_season');

  if (GRADE_RANK[input.result.gradeId] >= GRADE_RANK.playoffs) unlock('playoffs');
  if (GRADE_RANK[input.result.gradeId] >= GRADE_RANK.contender) unlock('contender');
  if (GRADE_RANK[input.result.gradeId] >= GRADE_RANK.dynasty) unlock('dynasty');
  if (input.result.gradeId === 'perfection') unlock('perfection');

  if (input.mode === 'daily') unlock('first_daily');
  if (input.career.dailyStreak >= 3) unlock('daily_streak_3');
  if (input.career.dailyStreak >= 7) unlock('daily_streak_7');

  if (input.mode === 'salary') unlock('salary_debut');
  if (input.mode === 'franchise') unlock('franchise_debut');
  if (input.mode === 'diamondiq') unlock('diamond_debut');
  if (input.mode === 'challenge') unlock('challenge_debut');
  if (input.mode === 'eralock') unlock('eralock_debut');
  if (input.mode === 'ironman') unlock('ironman_debut');

  const hofCount = input.rosterPlayers.filter((p) => p?.hof).length;
  if (hofCount >= 5) unlock('hof_five');

  if (input.career.gamesPlayed >= 100) unlock('centurion');

  if (newly.length) saveAchievements(unlocked);
  return newly;
}

export function unlockedCount(map = loadAchievements()): number {
  return Object.keys(map).length;
}
