import { GRADE_BANDS, type GradeId } from '../config/constants';

export function gradeForWins(wins: number): { id: GradeId; label: string } {
  for (const band of GRADE_BANDS) {
    if (wins >= band.minWins) {
      return { id: band.id, label: band.label };
    }
  }
  return { id: 'rebuilding', label: 'REBUILDING' };
}

export function scoreFromWins(wins: number): number {
  return Math.round((wins / 162) * 1000);
}
