import { useEffect, useState } from 'react';
import { LEADERBOARD_MIN_WINS } from '../config/constants';
import { previousUtcDateKey } from '../game/career';
import { isDailyCompletedToday, utcDateKey } from '../game/daily';
import { fetchDailyBoard, type GlobalDailyEntry } from '../game/dailyBoard';
import { loadLeaderboard } from '../game/leaderboard';
import { useGame } from '../state/gameStore';
import { BoardState } from './BoardState';

type Tab = 'classic' | 'daily' | 'yesterday';

function DailyList({
  entries,
  loading,
  error,
  tab,
  onRetry,
  onPlayDaily,
}: {
  entries: GlobalDailyEntry[];
  loading: boolean;
  error: string | null;
  tab: Exclude<Tab, 'classic'>;
  onRetry: () => void;
  onPlayDaily: (() => void) | null;
}) {
  if (loading) {
    return (
      <BoardState kind="loading" title="Loading the global board" body="Fetching today’s records…" />
    );
  }
  if (error) {
    return (
      <BoardState
        kind="offline"
        title="Global board is offline"
        body="We couldn’t reach the shared board. Your Daily result is still saved on this device and will appear here once the board is back."
      >
        <button type="button" className="btn btn-secondary" data-testid="board-retry" onClick={onRetry}>
          Try again
        </button>
      </BoardState>
    );
  }
  if (!entries.length) {
    return tab === 'yesterday' ? (
      <BoardState
        kind="empty"
        title="Nobody posted yesterday"
        body="The archive keeps the top ten from each day. Yesterday’s board stayed empty."
      />
    ) : (
      <BoardState
        kind="empty"
        title="Nobody has posted today"
        body="Finish today’s Daily to put the first record on the board. Same spins for everyone."
      >
        {onPlayDaily && (
          <button type="button" className="btn btn-primary" data-testid="board-play-daily" onClick={onPlayDaily}>
            Play today’s Daily
          </button>
        )}
      </BoardState>
    );
  }
  return (
    <ol className="leaderboard-list">
      {entries.map((e, i) => (
        <li key={e.id}>
          <span>{i + 1}</span>
          <div>
            <strong>
              {e.wins}-{e.losses}
            </strong>{' '}
            · {e.gradeLabel}
            {e.displayName && <div className="board-name">{e.displayName}</div>}
            <div className="board-meta">
              {e.rosterNames.slice(0, 3).join(', ')}
              {e.rosterNames.length > 3 ? '…' : ''}
            </div>
          </div>
          <span className="board-time">
            {new Date(e.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Leaderboard() {
  const { startGame } = useGame();
  const [tab, setTab] = useState<Tab>('daily');
  const local = loadLeaderboard();
  const [dailyEntries, setDailyEntries] = useState<GlobalDailyEntry[]>([]);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const today = utcDateKey();
  const yesterday = previousUtcDateKey(today);
  const dateKey = tab === 'yesterday' ? yesterday : today;
  const dailyDone = isDailyCompletedToday();

  useEffect(() => {
    if (tab === 'classic') return;
    let cancelled = false;
    setLoading(true);
    void fetchDailyBoard(dateKey).then((res) => {
      if (cancelled) return;
      setDailyEntries(res.entries);
      setDailyError(res.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [tab, dateKey, attempt]);

  return (
    <section data-testid="leaderboard">
      <h2 className="headline" style={{ marginTop: 0 }}>
        Leaderboards
      </h2>

      <div className="btn-row" style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`btn ${tab === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('daily')}
        >
          Daily global
        </button>
        <button
          type="button"
          className={`btn ${tab === 'yesterday' ? 'btn-primary' : 'btn-secondary'}`}
          data-testid="yesterday-board"
          onClick={() => setTab('yesterday')}
        >
          Yesterday
        </button>
        <button
          type="button"
          className={`btn ${tab === 'classic' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('classic')}
        >
          Local Classic
        </button>
      </div>

      {tab === 'classic' ? (
        <>
          <p className="lede">
            Classic only · {LEADERBOARD_MIN_WINS}+ wins · stored on this device
          </p>
          {!local.length ? (
            <BoardState
              kind="empty"
              title="No qualifying seasons yet"
              body={`Win ${LEADERBOARD_MIN_WINS} or more games in Classic and the season lands here.`}
            >
              <button
                type="button"
                className="btn btn-primary"
                data-testid="board-play-classic"
                onClick={() => startGame('classic')}
              >
                Play Classic
              </button>
            </BoardState>
          ) : (
            <ol className="leaderboard-list">
              {local.map((e, i) => (
                <li key={e.id}>
                  <span>{i + 1}</span>
                  <div>
                    <strong>
                      {e.wins}-{e.losses}
                    </strong>{' '}
                    · {e.gradeLabel}
                    <div className="board-meta">
                      {e.rosterNames.slice(0, 3).join(', ')}
                      {e.rosterNames.length > 3 ? '…' : ''}
                    </div>
                  </div>
                  <span className="board-time">{new Date(e.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      ) : (
        <>
          <p className="lede">
            UTC {dateKey} · same spins for everyone
            {tab === 'yesterday' ? ' · yesterday’s top 10' : ''}
          </p>
          <DailyList
            entries={tab === 'yesterday' ? dailyEntries.slice(0, 10) : dailyEntries}
            loading={loading}
            error={dailyError}
            tab={tab}
            onRetry={() => setAttempt((a) => a + 1)}
            onPlayDaily={dailyDone ? null : () => startGame('daily')}
          />
        </>
      )}
    </section>
  );
}
