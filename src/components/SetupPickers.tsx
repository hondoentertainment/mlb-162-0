import { FRANCHISES } from '../data/franchises';
import { decadesForFranchise, franchisesInDecade, playableDecades } from '../game/spin';
import type { Decade } from '../config/constants';

export function FranchiseChipGrid({ onPick }: { onPick: (franchiseId: string) => void }) {
  const options = FRANCHISES.filter((f) => decadesForFranchise(f.id).length > 0);

  return (
    <div className="setup-chip-grid" data-testid="franchise-grid">
      {options.map((f) => (
        <button
          key={f.id}
          type="button"
          className="setup-chip"
          data-testid={`franchise-${f.id}`}
          aria-label={`${f.name}, ${decadesForFranchise(f.id).length} eras`}
          title={`${f.name} · ${decadesForFranchise(f.id).length} eras`}
          onClick={() => onPick(f.id)}
        >
          <span className="setup-chip-abbr">{f.abbreviation}</span>
          <span className="setup-chip-name">{f.shortName}</span>
        </button>
      ))}
    </div>
  );
}

export function DecadeChipGrid({ onPick }: { onPick: (decade: Decade) => void }) {
  const decades = playableDecades();

  return (
    <div className="setup-chip-grid setup-chip-grid-decades" data-testid="decade-grid">
      {decades.map((decade) => (
        <button
          key={decade}
          type="button"
          className="setup-chip"
          data-testid={`decade-${decade}`}
          aria-label={`${decade}, ${franchisesInDecade(decade)} clubs`}
          title={`${decade} · ${franchisesInDecade(decade)} clubs`}
          onClick={() => onPick(decade)}
        >
          <span className="setup-chip-abbr">{decade}</span>
          <span className="setup-chip-name">{franchisesInDecade(decade)} clubs</span>
        </button>
      ))}
    </div>
  );
}
