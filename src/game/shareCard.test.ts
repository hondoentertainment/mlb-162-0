import { describe, expect, it } from 'vitest';
import {
  clampRadius,
  gradeAccent,
  rosterSlots,
  roundRect,
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
} from './shareCard';

function recordingContext() {
  const arcs: number[] = [];
  const ctx = {
    beginPath() {},
    moveTo() {},
    closePath() {},
    arcTo(_x1: number, _y1: number, _x2: number, _y2: number, r: number) {
      arcs.push(r);
    },
  };
  return { ctx, arcs };
}

describe('rounded rectangles', () => {
  it('never asks arcTo for a radius larger than half the shortest side', () => {
    expect(clampRadius(360, 78, 999)).toBe(39);
    expect(clampRadius(78, 360, 999)).toBe(39);
    expect(clampRadius(200, 100, 16)).toBe(16);
    expect(clampRadius(200, 100, -4)).toBe(0);
  });

  it('draws a 360x78 pill with four 39px corners', () => {
    const { ctx, arcs } = recordingContext();
    roundRect(ctx, 120, 580, 360, 78, 999);
    expect(arcs).toEqual([39, 39, 39, 39]);
  });

  it('keeps small radii as given', () => {
    const { ctx, arcs } = recordingContext();
    roundRect(ctx, 0, 0, 240, 220, 16);
    expect(arcs).toEqual([16, 16, 16, 16]);
  });
});

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
