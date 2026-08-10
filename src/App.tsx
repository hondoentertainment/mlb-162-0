import { Draft } from './components/Draft';
import { Home } from './components/Home';
import { HowToPlay } from './components/HowToPlay';
import { Leaderboard } from './components/Leaderboard';
import { ResultCard } from './components/ResultCard';
import { SeasonReveal } from './components/SeasonReveal';
import { GameProvider, useGame } from './state/gameStore';

function ScreenRouter() {
  const { state } = useGame();

  switch (state.screen) {
    case 'draft':
      return <Draft />;
    case 'reveal':
      return <SeasonReveal />;
    case 'result':
      return <ResultCard />;
    case 'how':
      return <HowToPlay />;
    case 'leaderboard':
      return <Leaderboard />;
    default:
      return <Home />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <div className="app-shell">
        <div className="ballpark-bg" aria-hidden="true" />
        <main className="app-content">
          <ScreenRouter />
        </main>
      </div>
    </GameProvider>
  );
}
