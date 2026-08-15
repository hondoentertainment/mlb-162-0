import { describe, expect, it } from 'vitest';
import { accentFor, ellipsize, wrapLines } from './shareCard';

/** Stand-in for canvas text metrics: every glyph is 10 units wide. */
const measure = (text: string) => text.length * 10;

describe('accentFor', () => {
  it('uses a distinct accent per grade', () => {
    const perfection = accentFor({ gradeId: 'perfection', gradeLabel: 'PERFECTION' });
    const rebuilding = accentFor({ gradeId: 'rebuilding', gradeLabel: 'REBUILDING' });
    expect(perfection.base).not.toBe(rebuilding.base);
  });

  it('falls back to the label when no grade id is given', () => {
    expect(accentFor({ gradeLabel: 'DYNASTY' })).toEqual(
      accentFor({ gradeId: 'dynasty', gradeLabel: 'DYNASTY' }),
    );
  });

  it('defaults to rebuilding for an unknown label', () => {
    expect(accentFor({ gradeLabel: 'MYSTERY' })).toEqual(
      accentFor({ gradeId: 'rebuilding', gradeLabel: 'REBUILDING' }),
    );
  });
});

describe('ellipsize', () => {
  it('leaves text that already fits', () => {
    expect(ellipsize('Yogi Berra', 200, measure)).toBe('Yogi Berra');
  });

  it('truncates overlong text within the budget', () => {
    const out = ellipsize('Bartolomeo Colonnade', 100, measure);
    expect(out.endsWith('…')).toBe(true);
    expect(measure(out)).toBeLessThanOrEqual(100);
  });
});

describe('wrapLines', () => {
  it('keeps a short name on one line', () => {
    expect(wrapLines('Ozzie Smith', 200, measure, 2)).toEqual(['Ozzie Smith']);
  });

  it('wraps a long name across the allowed lines', () => {
    const lines = wrapLines('Ronald Acuna Jr.', 100, measure, 2);
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines.every((l) => measure(l) <= 100)).toBe(true);
    expect(lines.join(' ')).toContain('Ronald');
  });

  it('never exceeds the line budget', () => {
    const lines = wrapLines('One Two Three Four Five Six Seven', 60, measure, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1]!.endsWith('…')).toBe(true);
  });
});
