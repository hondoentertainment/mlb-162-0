import { useEffect, useState } from 'react';
import { LEADERBOARD_MIN_WINS } from '../config/constants';
import { previousUtcDateKey } from '../game/career';
import { utcDateKey } from '../game/daily';
import { fetchDailyBoard, type GlobalDailyEntry } from '../game/dailyBoard';
import { loadLeaderboard } from '../game/leaderboard';

type Tab = 'classic' | 'daily' | 'yesterday';

function DailyList({
  entries,
  loading,
  error,
  empty,
}: {
  entries: GlobalDailyEntry[];
  loading: boolean;
  error: string | null;
  empty: string;
}) {
  if (loading) return <div className="panel empty-pool">Loading global board…</div>;
  if (error) {
    return <div className="panel empty-pool">{error}. Local daily still saves on this device.</div>;
  }
  if (!entries.length) return <div className="panel empty-pool">{empty}</div>;
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
            {e.displayName && (
              <div style={{ fontSize: '0.85rem', marginTop: 2 }}>{e.displayName}</div>
            )}
            <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: 2 }}>
              {e.rosterNames.slice(0, 3).join(', ')}
              {e.rosterNames.length > 3 ? '…' : ''}
            </div>
          </div>
          <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>
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
  const [tab, setTab] = useState<Tab>('daily');
  const local = loadLeaderboard();
  const [dailyEntries, setDailyEntries] = useState<GlobalDailyEntry[]>([]);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const today = utcDateKey();
  const yesterday = previousUtcDateKey(today);
  const dateKey = tab === 'yesterday' ? yesterday : today;

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
  }, [tab, dateKey]);

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
            <div className="panel empty-pool">
              No qualifying runs yet. Hit {LEADERBOARD_MIN_WINS} wins in Classic.
            </div>
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
                    <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: 2 }}>
                      {e.rosterNames.slice(0, 3).join(', ')}
                      {e.rosterNames.length > 3 ? '…' : ''}
                    </div>
                  </div>
                  <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
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
            empty={
              tab === 'yesterday'
                ? 'No global entries from yesterday.'
                : 'No global entries yet today. Be the first.'
            }
          />
        </>
      )}
    </section>
  );
}
