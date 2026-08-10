import { isDailyCompletedToday, loadDailyRecord, utcDateKey } from '../game/daily';
import { formatSalary, SALARY_CAP_M } from '../game/salary';
import { useGame } from '../state/gameStore';

export function Home() {
  const { startGame, setScreen } = useGame();
  const dailyDone = isDailyCompletedToday();
  const daily = loadDailyRecord();
  const today = utcDateKey();

  return (
    <section className="hero">
      <p className="section-label">Major League Baseball</p>
      <h1 className="brand">
        162<span>-</span>0
      </h1>
      <h2 className="headline">Draft legends. Chase a perfect season.</h2>
      <p className="lede">
        Spin a franchise and decade, fill nine positions, and see if your roster can go undefeated.
      </p>

      <div className="mode-grid">
        <button type="button" className="mode-card" onClick={() => startGame('classic')}>
          <h3>Classic</h3>
          <p>Full stats visible. One team skip, one decade skip. Chase the all-time board.</p>
        </button>
        <button type="button" className="mode-card" onClick={() => startGame('diamondiq')}>
          <h3>Diamond IQ</h3>
          <p>Blind draft — no numbers. Prove you know baseball history.</p>
        </button>
        <button type="button" className="mode-card" onClick={() => startGame('salary')}>
          <h3>Salary Cap</h3>
          <p>
            Build under a {formatSalary(SALARY_CAP_M)} soft cap. Stars cost more — balance the
            diamond.
          </p>
        </button>
        <button
          type="button"
          className="mode-card"
          onClick={() => startGame('daily')}
          disabled={dailyDone}
        >
          <h3>Daily Challenge</h3>
          <p>
            {dailyDone && daily?.dateKey === today
              ? `Done today — ${daily.wins}-${daily.losses} · ${daily.gradeLabel}`
              : 'Same spins worldwide. No skips. Compete on the global board.'}
          </p>
        </button>
      </div>

      <div className="nav-links">
        <button type="button" onClick={() => setScreen('how')}>
          How to play
        </button>
        <button type="button" onClick={() => setScreen('leaderboard')}>
          Leaderboards
        </button>
      </div>

      <p className="disclaimer">
        Fan-made browser game. Not affiliated with, endorsed by, or sponsored by Major League
        Baseball or any MLB clubs.
      </p>
    </section>
  );
}
