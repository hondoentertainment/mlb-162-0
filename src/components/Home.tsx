import { useEffect, useState } from 'react';
import { displayDailyStreak, loadCareer } from '../game/career';
import {
  decodeChallengeSeed,
  parseChallengeFromLocation,
} from '../game/challenge';
import { ensurePool } from '../data/pool';
import { isDailyCompletedToday, loadDailyRecord, utcDateKey } from '../game/daily';
import { formatSalary, SALARY_CAP_M } from '../game/salary';
import { useGame } from '../state/gameStore';
import { DailyHistoryStrip } from './DailyHistory';
import { InstallTip } from './InstallTip';

export function Home() {
  const { startGame, beginFranchiseSelect, beginDecadeSelect, setScreen } = useGame();
  const dailyDone = isDailyCompletedToday();
  const daily = loadDailyRecord();
  const today = utcDateKey();
  const career = loadCareer();
  const streak = displayDailyStreak(career);
  const [challengeCode, setChallengeCode] = useState('');
  const [challengeError, setChallengeError] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = parseChallengeFromLocation();
    if (!fromUrl) return;
    setChallengeCode(fromUrl);
    startGame('challenge', undefined, fromUrl);
    history.replaceState(null, '', '/');
  }, [startGame]);

  // Warm the code-split player table during idle time so the first mode tap
  // does not wait on a network round trip.
  useEffect(() => {
    const warm = () => void ensurePool();
    const idle = window.requestIdleCallback;
    if (idle) {
      const handle = idle(warm, { timeout: 3000 });
      return () => window.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(warm, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const joinChallenge = () => {
    const code = challengeCode.trim().toUpperCase();
    if (decodeChallengeSeed(code) == null) {
      setChallengeError('Enter a valid challenge code (4–10 characters).');
      return;
    }
    setChallengeError(null);
    startGame('challenge', undefined, code);
  };

  return (
    <section className="hero" data-testid="home">
      <p className="section-label">Major League Baseball</p>
      <h1 className="brand" data-testid="brand">
        162<span>-</span>0
      </h1>
      <h2 className="headline">Draft legends. Chase a perfect season.</h2>
      <p className="lede">
        Spin a franchise and decade, fill nine positions, and see if your roster can go undefeated.
      </p>

      {(streak > 0 || career.gamesPlayed > 0) && (
        <p className="career-chip" data-testid="home-career-chip">
          {career.gamesPlayed > 0 && (
            <span>
              {career.gamesPlayed} season{career.gamesPlayed === 1 ? '' : 's'}
              {career.bestWins > 0 ? ` · best ${career.bestWins}` : ''}
            </span>
          )}
          {streak > 0 && (
            <span data-testid="home-streak">
              {career.gamesPlayed > 0 ? ' · ' : ''}
              Daily streak {streak}
            </span>
          )}
        </p>
      )}

      <DailyHistoryStrip compact />
      <InstallTip />

      <div className="mode-grid">
        <button
          type="button"
          className="mode-card"
          data-testid="mode-classic"
          onClick={() => startGame('classic')}
        >
          <h3>Classic</h3>
          <p>Full stats visible. One team skip, one decade skip. Chase the all-time board.</p>
        </button>
        <button
          type="button"
          className="mode-card"
          data-testid="mode-diamondiq"
          onClick={() => startGame('diamondiq')}
        >
          <h3>Diamond IQ</h3>
          <p>Blind draft — no numbers. Prove you know baseball history.</p>
        </button>
        <button
          type="button"
          className="mode-card"
          data-testid="mode-salary"
          onClick={() => startGame('salary')}
        >
          <h3>Salary Cap</h3>
          <p>
            Build under a {formatSalary(SALARY_CAP_M)} soft cap. Stars cost more — balance the
            diamond.
          </p>
        </button>
        <button
          type="button"
          className="mode-card"
          data-testid="mode-franchise"
          onClick={beginFranchiseSelect}
        >
          <h3>One Franchise</h3>
          <p>Lock a club, spin decades only, and build an all-time single-franchise nine.</p>
        </button>
        <button
          type="button"
          className="mode-card"
          data-testid="mode-eralock"
          onClick={beginDecadeSelect}
        >
          <h3>Era Lock</h3>
          <p>Pick one decade and stay there. Two team skips, no decade skips.</p>
        </button>
        <button
          type="button"
          className="mode-card"
          data-testid="mode-ironman"
          onClick={() => startGame('ironman')}
        >
          <h3>Ironman</h3>
          <p>Classic rules with no safety net — no skips, no redraws, no undo.</p>
        </button>
        <button
          type="button"
          className="mode-card"
          data-testid="mode-daily"
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
        <div className="mode-card challenge-card" data-testid="mode-challenge">
          <h3>Challenge a friend</h3>
          <p>Same spins for everyone with the code. No skips — pure comparison.</p>
          <div className="challenge-row">
            <button
              type="button"
              className="btn btn-secondary"
              data-testid="challenge-new"
              onClick={() => startGame('challenge')}
            >
              New challenge
            </button>
            <input
              type="text"
              className="challenge-input"
              placeholder="Enter code"
              aria-label="Challenge code"
              data-testid="challenge-input"
              value={challengeCode}
              onChange={(e) => setChallengeCode(e.target.value.toUpperCase())}
              maxLength={10}
            />
            <button
              type="button"
              className="btn btn-primary"
              data-testid="challenge-join"
              onClick={joinChallenge}
            >
              Join
            </button>
          </div>
          {challengeError && <p className="field-error">{challengeError}</p>}
        </div>
      </div>

      <div className="nav-links">
        <button type="button" data-testid="nav-how" onClick={() => setScreen('how')}>
          How to play
        </button>
        <button
          type="button"
          data-testid="nav-leaderboard"
          onClick={() => setScreen('leaderboard')}
        >
          Leaderboards
        </button>
        <button type="button" data-testid="nav-career" onClick={() => setScreen('career')}>
          Career
        </button>
      </div>

      <p className="disclaimer">
        Fan-made browser game. Not affiliated with, endorsed by, or sponsored by Major League
        Baseball or any MLB clubs.
      </p>
    </section>
  );
}
