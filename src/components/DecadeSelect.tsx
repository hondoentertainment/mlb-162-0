import { useGame } from '../state/gameStore';
import { DecadeChipGrid } from './SetupPickers';

export function DecadeSelect() {
  const { startEraLock } = useGame();

  return (
    <section data-testid="decade-select">
      <h2 className="headline" style={{ marginTop: 0 }}>
        Lock an era
      </h2>
      <p className="lede">
        Every spin stays inside one decade. Two team skips, no decade skips — build the best nine
        that era ever produced.
      </p>
      <DecadeChipGrid onPick={(decade) => startEraLock(decade)} />
    </section>
  );
}
