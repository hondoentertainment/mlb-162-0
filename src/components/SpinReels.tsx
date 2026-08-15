import { useEffect, useState } from 'react';
import { FRANCHISE_BY_ID } from '../data/franchises';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { SpinResult } from '../types/game';

const FAKE_DECADES = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
const FAKE_TEAMS = [
  'Yankees',
  'Dodgers',
  'Cardinals',
  'Braves',
  'Cubs',
  'Red Sox',
  'Giants',
  'Astros',
];

export function SpinReels({
  spin,
  spinning,
}: {
  spin: SpinResult | null;
  spinning: boolean;
}) {
  const [tick, setTick] = useState(0);
  const reducedMotion = useReducedMotion();
  const franchise = spin ? FRANCHISE_BY_ID[spin.franchiseId] : null;
  const animating = spinning && !reducedMotion;

  useEffect(() => {
    if (!animating) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 70);
    return () => window.clearInterval(id);
  }, [animating]);

  const decadeDisplay = spinning
    ? animating
      ? FAKE_DECADES[tick % FAKE_DECADES.length]
      : 'Drawing…'
    : (spin?.decade ?? '—');
  const teamDisplay = spinning
    ? animating
      ? FAKE_TEAMS[tick % FAKE_TEAMS.length]
      : 'Drawing…'
    : (franchise?.shortName ?? '—');

  return (
    <div className="reels" aria-live="polite" aria-busy={spinning}>
      <div className={`reel ${animating ? 'spinning' : ''}`}>
        <div className="reel-label">Decade</div>
        <div className="reel-value">{decadeDisplay}</div>
      </div>
      <div className={`reel ${animating ? 'spinning' : ''}`}>
        <div className="reel-label">Franchise</div>
        <div className="reel-value">{teamDisplay}</div>
      </div>
    </div>
  );
}
