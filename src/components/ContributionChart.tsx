import { POSITION_LABELS } from '../config/constants';
import type { SlotContribution } from '../types/game';

/**
 * Makes the sim legible: every slot's quality against the roster average, so a
 * player can see which picks carried the season and which dragged it down.
 */
export function ContributionChart({ contributions }: { contributions: SlotContribution[] }) {
  if (!contributions.length) return null;

  const ranked = [...contributions].sort((a, b) => b.rating - a.rating);

  return (
    <div className="panel" data-testid="contributions">
      <p className="section-label">Where the wins came from</p>
      <p className="round-meta" style={{ marginBottom: 'var(--space-4)' }}>
        Each slot scored against your roster average.
      </p>
      <ul className="contrib-list">
        {ranked.map((slot) => {
          const pct = Math.round(slot.rating * 100);
          const carrying = slot.delta >= 0;
          return (
            <li key={slot.position} data-testid={`contrib-${slot.position}`}>
              <span className="contrib-pos" title={POSITION_LABELS[slot.position]}>
                {slot.position}
              </span>
              <span className="contrib-name">{slot.playerName ?? 'Open'}</span>
              <span className="contrib-bar" aria-hidden="true">
                <span
                  className={`contrib-fill ${carrying ? 'up' : 'down'}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </span>
              <span className={`contrib-delta ${carrying ? 'up' : 'down'}`}>
                {slot.playerName
                  ? `${carrying ? '+' : ''}${Math.round(slot.delta * 100)}`
                  : '—'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
