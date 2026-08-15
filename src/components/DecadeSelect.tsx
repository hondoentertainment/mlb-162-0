import { franchisesInDecade, playableDecades } from '../game/spin';
import { useGame } from '../state/gameStore';

export function DecadeSelect() {
  const { startEraLock } = useGame();
  const decades = playableDecades();

  return (
    <section data-testid="decade-select">
      <h2 className="headline" style={{ marginTop: 0 }}>
        Lock an era
      </h2>
      <p className="lede">
        Every spin stays inside one decade. Two team skips, no decade skips — build the best nine
        that era ever produced.
      </p>
      <div className="franchise-grid" data-testid="decade-grid">
        {decades.map((decade) => (
          <button
            key={decade}
            type="button"
            className="mode-card"
            data-testid={`decade-${decade}`}
            onClick={() => startEraLock(decade)}
          >
            <h3>{decade}</h3>
            <p>{franchisesInDecade(decade)} clubs</p>
          </button>
        ))}
      </div>
    </section>
  );
}
