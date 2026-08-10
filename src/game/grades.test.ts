import { describe, expect, it } from 'vitest';
import { gradeForWins, scoreFromWins } from './grades';

describe('grades', () => {
  it('maps win totals to bands', () => {
    expect(gradeForWins(162).label).toBe('PERFECTION');
    expect(gradeForWins(140).label).toBe('DYNASTY');
    expect(gradeForWins(100).label).toBe('CONTENDER');
    expect(gradeForWins(85).label).toBe('PLAYOFFS');
    expect(gradeForWins(84).label).toBe('REBUILDING');
  });

  it('scores out of 1000', () => {
    expect(scoreFromWins(162)).toBe(1000);
    expect(scoreFromWins(81)).toBe(500);
  });
});
