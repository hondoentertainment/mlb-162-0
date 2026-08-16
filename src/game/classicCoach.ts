import { STORAGE_KEYS } from '../config/constants';

export function shouldShowClassicCoach(): boolean {
  if (typeof window !== 'undefined' && window.__E2E__) return false;
  try {
    return localStorage.getItem(STORAGE_KEYS.classicCoach) !== '1';
  } catch {
    return false;
  }
}

export function dismissClassicCoach(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.classicCoach, '1');
  } catch {
    /* ignore */
  }
}
