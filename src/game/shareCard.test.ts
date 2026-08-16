import { describe, expect, it } from 'vitest';
import { gradeAccent, rosterSlots, SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from './shareCard';

describe('share card helpers', () => {
  it('uses a distinct accent per grade', () => {
    expect(gradeAccent('PERFECTION')).not.toBe(gradeAccent('REBUILDING'));
    expect(gradeAccent('DYNASTY')).toMatch(/^#/);
  });

  it('maps nine roster names onto the starting nine', () => {
    const slots = rosterSlots(['Berra', 'Gehrig']);
    expect(slots).toHaveLength(9);
    expect(slots[0]).toEqual({ position: 'C', name: 'Berra' });
    expect(slots[1]).toEqual({ position: '1B', name: 'Gehrig' });
    expect(slots[8]?.name).toBe('Open');
  });

  it('exports at 2x', () => {
    expect(SHARE_CARD_WIDTH).toBe(2400);
    expect(SHARE_CARD_HEIGHT).toBe(1260);
  });
});
