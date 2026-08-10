import { LEADERBOARD_MIN_WINS } from '../config/constants';
import { loadLeaderboard } from '../game/leaderboard';
import { useGame } from '../state/gameStore';

export function Leaderboard() {
  const { setScreen } = useGame();
  const entries = loadLeaderboard();

  return (
    <section>
      <button type="button" className="btn btn-ghost back-link" onClick={() => setScreen('home')}>
        ← Back
      </button>
      <h2 className="headline" style={{ marginTop: 0 }}>
        Local all-time board
      </h2>
      <p className="lede">Classic mode only · {LEADERBOARD_MIN_WINS}+ wins · stored on this device</p>

      {!entries.length ? (
        <div className="panel empty-pool">No qualifying runs yet. Hit {LEADERBOARD_MIN_WINS} wins in Classic.</div>
      ) : (
        <ol className="leaderboard-list">
          {entries.map((e, i) => (
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
    </section>
  );
}
