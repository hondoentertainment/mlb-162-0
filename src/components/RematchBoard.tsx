import { useEffect, useState } from 'react';
import {
  fetchChallengeBoard,
  type ChallengeBoardEntry,
} from '../game/challengeBoard';

export function RematchBoard({
  code,
  emptyHint = 'No finishes for this code yet. Be the first.',
}: {
  code: string;
  emptyHint?: string;
}) {
  const [entries, setEntries] = useState<ChallengeBoardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchChallengeBoard(code).then((res) => {
      if (cancelled) return;
      setEntries(res.entries);
      setError(res.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div className="panel rematch-board" data-testid="rematch-board">
      <p className="section-label">Rematch board · {code}</p>
      {loading && <p className="empty-pool">Loading friends’ records…</p>}
      {!loading && error && (
        <p className="empty-pool">{error}. Local play still works; the shared board needs Blob.</p>
      )}
      {!loading && !error && !entries.length && <p className="empty-pool">{emptyHint}</p>}
      {!loading && !!entries.length && (
        <ol className="leaderboard-list" data-testid="rematch-list">
          {entries.map((e, i) => (
            <li key={`${e.createdAt}-${e.wins}-${i}`}>
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
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
