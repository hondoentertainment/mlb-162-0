import { useGame } from '../state/gameStore';
import { FranchiseChipGrid } from './SetupPickers';

export function FranchiseSelect() {
  const { startGame } = useGame();

  return (
    <section data-testid="franchise-select">
      <h2 className="headline" style={{ marginTop: 0 }}>
        Pick your franchise
      </h2>
      <p className="lede">
        Lock one club for all nine rounds. Each spin draws a decade from that franchise&apos;s
        history. Yankees, Braves, Dodgers, and Red Sox are the deepest books if you are chasing a
        high win total.
      </p>
      <FranchiseChipGrid onPick={(id) => startGame('franchise', id)} />
    </section>
  );
}
