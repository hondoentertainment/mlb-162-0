import { describe, expect, it } from 'vitest';
import {
  canRespinEmptyPool,
  canUndoLastPick,
  emptyPoolCopy,
  emptyPoolKind,
  isFairnessMode,
} from './draftRules';

describe('draft fairness rules', () => {
  it('treats Daily and Challenge as fairness modes', () => {
    expect(isFairnessMode('daily')).toBe(true);
    expect(isFairnessMode('challenge')).toBe(true);
    expect(isFairnessMode('classic')).toBe(false);
    expect(isFairnessMode('diamondiq')).toBe(false);
    expect(isFairnessMode('salary')).toBe(false);
    expect(isFairnessMode('franchise')).toBe(false);
  });

  it('allows undo only in Classic, Diamond IQ, Salary Cap, and One Franchise', () => {
    expect(canUndoLastPick('classic')).toBe(true);
    expect(canUndoLastPick('diamondiq')).toBe(true);
    expect(canUndoLastPick('salary')).toBe(true);
    expect(canUndoLastPick('franchise')).toBe(true);
    expect(canUndoLastPick('daily')).toBe(false);
    expect(canUndoLastPick('challenge')).toBe(false);
    expect(canUndoLastPick(null)).toBe(false);
  });

  it('classifies empty and over-cap pools', () => {
    expect(
      emptyPoolKind({
        mode: 'classic',
        hasSpin: true,
        spinning: false,
        availableCount: 0,
        affordableCount: 0,
      }),
    ).toBe('no-fits');
    expect(
      emptyPoolKind({
        mode: 'salary',
        hasSpin: true,
        spinning: false,
        availableCount: 3,
        affordableCount: 0,
      }),
    ).toBe('over-cap');
    expect(
      emptyPoolKind({
        mode: 'classic',
        hasSpin: true,
        spinning: false,
        availableCount: 2,
        affordableCount: 2,
      }),
    ).toBe('none');
    expect(
      emptyPoolKind({
        mode: 'classic',
        hasSpin: true,
        spinning: true,
        availableCount: 0,
        affordableCount: 0,
      }),
    ).toBe('none');
  });

  it('allows empty-pool redraw outside Daily and Challenge', () => {
    expect(canRespinEmptyPool('classic', 'no-fits')).toBe(true);
    expect(canRespinEmptyPool('salary', 'over-cap')).toBe(true);
    expect(canRespinEmptyPool('daily', 'no-fits')).toBe(false);
    expect(canRespinEmptyPool('challenge', 'no-fits')).toBe(false);
    expect(canRespinEmptyPool('classic', 'none')).toBe(false);
  });

  it('explains empty pools without offering a skip in fairness modes', () => {
    expect(emptyPoolCopy('no-fits', false)).toMatch(/no legal picks/i);
    expect(emptyPoolCopy('over-cap', false)).toMatch(/salary cap/i);
    expect(emptyPoolCopy('no-fits', true)).toMatch(/do not allow a redraw/i);
  });
});
