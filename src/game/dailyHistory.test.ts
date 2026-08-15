import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../config/constants';
import {
  DAILY_HISTORY_DAYS,
  dailyHistoryGrid,
  loadDailyHistory,
  recordDailyHistory,
  utcDateKeysBack,
} from './dailyHistory';

describe('dailyHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('lists the last 14 UTC days oldest-first', () => {
    const keys = utcDateKeysBack(14, '2026-08-15');
    expect(keys).toHaveLength(14);
    expect(keys[0]).toBe('2026-08-02');
    expect(keys[13]).toBe('2026-08-15');
  });

  it('upserts one entry per date and drops days outside the window', () => {
    recordDailyHistory(
      { dateKey: '2026-08-15', wins: 110, losses: 52, gradeLabel: 'CONTENDER' },
      '2026-08-15',
    );
    recordDailyHistory(
      { dateKey: '2026-08-15', wins: 120, losses: 42, gradeLabel: 'CONTENDER' },
      '2026-08-15',
    );
    recordDailyHistory(
      { dateKey: '2026-07-01', wins: 90, losses: 72, gradeLabel: 'PLAYOFFS' },
      '2026-08-15',
    );

    const history = loadDailyHistory('2026-08-15');
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ dateKey: '2026-08-15', wins: 120 });
  });

  it('migrates the current daily record into the log', () => {
    localStorage.setItem(
      STORAGE_KEYS.daily,
      JSON.stringify({
        dateKey: '2026-08-14',
        completed: true,
        wins: 101,
        losses: 61,
        gradeLabel: 'CONTENDER',
        rosterNames: ['A'],
      }),
    );
    const history = loadDailyHistory('2026-08-15');
    expect(history).toEqual([
      {
        dateKey: '2026-08-14',
        wins: 101,
        losses: 61,
        gradeLabel: 'CONTENDER',
        rosterNames: ['A'],
      },
    ]);
  });

  it('builds a 14-day grid with today marked', () => {
    recordDailyHistory(
      { dateKey: '2026-08-14', wins: 88, losses: 74, gradeLabel: 'PLAYOFFS' },
      '2026-08-15',
    );
    const grid = dailyHistoryGrid('2026-08-15');
    expect(grid).toHaveLength(DAILY_HISTORY_DAYS);
    expect(grid[13]).toMatchObject({ dateKey: '2026-08-15', isToday: true, entry: null });
    expect(grid[12]?.entry?.wins).toBe(88);
  });
});
