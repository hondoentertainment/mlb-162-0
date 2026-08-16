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
import { DisplayNameField } from './DisplayNameField';
import { InstallTip } from './InstallTip';
import { RematchBoard } from './RematchBoard';
import { DecadeChipGrid, FranchiseChipGrid } from './SetupPickers';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

export function Home() {
  const { startGame, startEraLock, setScreen } = useGame();
  const dailyDone = isDailyCompletedToday();
  const daily = loadDailyRecord();
  const today = utcDateKey();
  const career = loadCareer();
  const streak = displayDailyStreak(career);
  const [challengeCode, setChallengeCode] = useState('');
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [boardCode, setBoardCode] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = parseChallengeFromLocation();
    if (!fromUrl) return;
    setChallengeCode(fromUrl);
    startGame('challenge', undefined, fromUrl);
    history.replaceState(null, '', '/');
  }, [startGame]);

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

  const viewBoard = () => {
    const code = challengeCode.trim().toUpperCase();
    if (decodeChallengeSeed(code) == null) {
      setChallengeError('Enter a valid challenge code (4–10 characters).');
      return;
    }
    setChallengeError(null);
    setBoardCode(code);
  };

  return (
    <section className="hero hero-home" data-testid="home">
      <p className="section-label">Major League Baseball</p>
      <h1 className="brand" data-testid="brand">
        162<span>-</span>0
      </h1>
      <h2 className="headline">Draft legends. Chase a perfect season.</h2>
      <p className="lede">
        Pick a mode, or lock a club or decade — every start is on this screen.
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

      <div className="mode-grid mode-grid-instant">
        <button
          type="button"
          className="mode-card mode-card-lead mode-card-compact"
          data-testid="mode-daily"
          onClick={() => startGame('daily')}
          disabled={dailyDone}
        >
          <h3>Daily Challenge</h3>
          <p>
            {dailyDone && daily?.dateKey === today
              ? `Done today — ${daily.wins}-${daily.losses} · ${daily.gradeLabel}`
              : 'Same spins worldwide. No skips. Global board.'}
          </p>
        </button>
        <button
          type="button"
          className="mode-card mode-card-lead mode-card-compact"
          data-testid="mode-classic"
          onClick={() => startGame('classic')}
        >
          <h3>Classic</h3>
          <p>Full stats. One team skip, one decade skip.</p>
        </button>
        <button
          type="button"
          className="mode-card mode-card-compact"
          data-testid="mode-diamondiq"
          onClick={() => startGame('diamondiq')}
        >
          <h3>Diamond IQ</h3>
          <p>Blind draft — no numbers.</p>
        </button>
        <button
          type="button"
          className="mode-card mode-card-compact"
          data-testid="mode-salary"
          onClick={() => startGame('salary')}
        >
          <h3>Salary Cap</h3>
          <p>Build under a {formatSalary(SALARY_CAP_M)} soft cap.</p>
        </button>
        <button
          type="button"
          className="mode-card mode-card-compact"
          data-testid="mode-ironman"
          onClick={() => startGame('ironman')}
        >
          <h3>Ironman</h3>
          <p>No skips, no redraws, no undo.</p>
        </button>

        <div className="mode-card challenge-card" data-testid="mode-challenge">
          <h3>Challenge a friend</h3>
          <p>Same spins for everyone with the code. Compare records on the rematch board.</p>
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
            <button
              type="button"
              className="btn btn-ghost"
              data-testid="challenge-board"
              onClick={viewBoard}
            >
              Board
            </button>
          </div>
          {challengeError && <p className="field-error">{challengeError}</p>}
        </div>
      </div>

      {boardCode && <RematchBoard code={boardCode} />}

      <section className="setup-panel" id="franchise-setup" data-testid="franchise-select">
        <header className="setup-panel-head">
          <button
            type="button"
            className="setup-heading"
            data-testid="mode-franchise"
            onClick={() => scrollToId('franchise-setup')}
          >
            One Franchise
          </button>
          <p>Lock a club, spin decades only, and build an all-time single-franchise nine.</p>
        </header>
        <FranchiseChipGrid onPick={(id) => startGame('franchise', id)} />
      </section>

      <section className="setup-panel" id="era-setup" data-testid="decade-select">
        <header className="setup-panel-head">
          <button
            type="button"
            className="setup-heading"
            data-testid="mode-eralock"
            onClick={() => scrollToId('era-setup')}
          >
            Era Lock
          </button>
          <p>Pick one decade and stay there. Two team skips, no decade skips.</p>
        </header>
        <DecadeChipGrid onPick={(decade) => startEraLock(decade)} />
      </section>

      <DisplayNameField compact />

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
