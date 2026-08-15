import { hashString, mulberry32 } from './rng';

/**
 * Pure daily-seed helpers. Kept free of browser storage so server-side
 * verification can replay the exact same draw sequence as the client.
 */

export function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function dailySeed(dateKey: string): number {
  return hashString(`mlb1620-daily-${dateKey}`);
}

export function dailyRng(dateKey = utcDateKey()): () => number {
  return mulberry32(dailySeed(dateKey));
}
