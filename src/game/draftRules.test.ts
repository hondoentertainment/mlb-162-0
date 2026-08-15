import { describe, expect, it } from 'vitest';
import {
  allowsRedraw,
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

  it('allows undo in the relaxed modes only', () => {
    expect(canUndoLastPick('classic')).toBe(true);
    expect(canUndoLastPick('diamondiq')).toBe(true);
    expect(canUndoLastPick('salary')).toBe(true);
    expect(canUndoLastPick('franchise')).toBe(true);
    expect(canUndoLastPick('eralock')).toBe(true);
    expect(canUndoLastPick('daily')).toBe(false);
    expect(canUndoLastPick('challenge')).toBe(false);
    expect(canUndoLastPick('ironman')).toBe(false);
    expect(canUndoLastPick(null)).toBe(false);
  });

  it('withholds redraws from seeded modes and Ironman', () => {
    expect(allowsRedraw('classic')).toBe(true);
    expect(allowsRedraw('eralock')).toBe(true);
    expect(allowsRedraw('daily')).toBe(false);
    expect(allowsRedraw('challenge')).toBe(false);
    expect(allowsRedraw('ironman')).toBe(false);
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

  it('allows empty-pool redraw only where the mode permits it', () => {
    expect(canRespinEmptyPool('classic', 'no-fits')).toBe(true);
    expect(canRespinEmptyPool('salary', 'over-cap')).toBe(true);
    expect(canRespinEmptyPool('eralock', 'no-fits')).toBe(true);
    expect(canRespinEmptyPool('daily', 'no-fits')).toBe(false);
    expect(canRespinEmptyPool('challenge', 'no-fits')).toBe(false);
    expect(canRespinEmptyPool('ironman', 'no-fits')).toBe(false);
    expect(canRespinEmptyPool('classic', 'none')).toBe(false);
  });

  it('explains empty pools without offering a redraw where there is none', () => {
    expect(emptyPoolCopy('no-fits', false)).toMatch(/no legal picks/i);
    expect(emptyPoolCopy('over-cap', false)).toMatch(/salary cap/i);
    expect(emptyPoolCopy('no-fits', true)).toMatch(/does not allow a redraw/i);
  });
});
