import { useGame } from '../state/gameStore';

export function AppHeader() {
  const { state, goHome } = useGame();

  if (state.screen === 'home') return null;

  // Leaving during reveal unmounts SeasonReveal and cancels finishReveal, so a
  // Daily attempt would never be recorded. Keep Home unavailable until the
  // result is committed.
  const lockHome = state.screen === 'reveal';

  return (
    <header className="app-header" data-testid="app-header">
      <div className="app-header-inner">
        {lockHome ? (
          <span className="app-header-brand" data-testid="header-brand">
            162<span>-</span>0
          </span>
        ) : (
          <button
            type="button"
            className="app-header-brand"
            data-testid="header-home"
            onClick={goHome}
            aria-label="Return to home"
          >
            162<span>-</span>0
          </button>
        )}
        {!lockHome && (
          <button
            type="button"
            className="btn btn-ghost app-header-home"
            data-testid="nav-home"
            onClick={goHome}
          >
            Home
          </button>
        )}
      </div>
    </header>
  );
}
