import { useGame } from '../state/gameStore';

export function AppHeader() {
  const { state, goHome } = useGame();

  if (state.screen === 'home') return null;

  return (
    <header className="app-header" data-testid="app-header">
      <div className="app-header-inner">
        <button
          type="button"
          className="app-header-brand"
          data-testid="header-home"
          onClick={goHome}
          aria-label="Return to home"
        >
          162<span>-</span>0
        </button>
        <button
          type="button"
          className="btn btn-ghost app-header-home"
          data-testid="nav-home"
          onClick={goHome}
        >
          Home
        </button>
      </div>
    </header>
  );
}
