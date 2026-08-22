import { describe, expect, it } from 'vitest';
import {
  battingLine,
  careerOverlapsDecade,
  decadeYearRange,
  FRANCH_TO_OURS,
  normalizeName,
  parsePersonName,
  pitchingLine,
} from './lahman.mjs';

describe('lahman helpers', () => {
  it('normalizes accented names', () => {
    expect(normalizeName('José Ramírez')).toBe('joseramirez');
    expect(parsePersonName('Ken Griffey Jr.')).toEqual({ first: 'ken', last: 'griffey' });
  });

  it('maps every current club', () => {
    expect(new Set(Object.values(FRANCH_TO_OURS)).size).toBe(30);
    expect(FRANCH_TO_OURS.NYY).toBe('nyy');
    expect(FRANCH_TO_OURS.WSN).toBe('wsh');
  });

  it('aggregates batting from season rows', () => {
    const line = battingLine([
      { AB: '400', H: '120', '2B': '20', '3B': '2', HR: '18', BB: '60', HBP: '4', SF: '4' },
      { AB: '200', H: '60', '2B': '10', '3B': '0', HR: '8', BB: '20', HBP: '0', SF: '2' },
    ]);
    expect(line?.avg).toBe(0.3);
    expect(line?.obp).toBeCloseTo(0.382, 3);
    expect(line?.slg).toBeCloseTo(0.487, 3);
  });

  it('aggregates pitching from outs', () => {
    const line = pitchingLine([{ IPouts: '600', ER: '60', H: '180', BB: '50', SO: '200' }]);
    expect(line?.era).toBe(2.7);
    expect(line?.whip).toBe(1.15);
    expect(line?.k9).toBe(9);
  });

  it('rejects tiny samples', () => {
    expect(battingLine([{ AB: '10', H: '4', '2B': '0', '3B': '0', HR: '0', BB: '0', HBP: '0', SF: '0' }])).toBeNull();
    expect(pitchingLine([{ IPouts: '12', ER: '1', H: '4', BB: '1', SO: '2' }])).toBeNull();
  });

  it('checks career overlap with a decade', () => {
    expect(decadeYearRange('1990s')).toEqual({ start: 1990, end: 1999 });
    expect(
      careerOverlapsDecade({ debut: '1995-04-01', finalGame: '2014-09-28' }, '1990s'),
    ).toBe(true);
    expect(
      careerOverlapsDecade({ debut: '2001-04-01', finalGame: '2014-09-28' }, '1990s'),
    ).toBe(false);
  });
});
