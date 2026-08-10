import { useState } from 'react';
import { useGame } from '../state/gameStore';
import { RosterBoard } from './RosterBoard';
import { ShareCard } from './ShareCard';

function buildShareText(
  wins: number,
  losses: number,
  grade: string,
  mode: string,
  names: string[],
): string {
  return [
    `162-0 · ${wins}-${losses} · ${grade}`,
    `Mode: ${mode}`,
    names.join(' · '),
    'Can you go 162-0?',
  ].join('\n');
}

export function ResultCard() {
  const { state, goHome, startGame, modeLabel } = useGame();
  const [copied, setCopied] = useState(false);
  const result = state.result;
  if (!result) return null;

  const names = state.roster.map((s) => s.player?.name ?? '—');
  const share = buildShareText(result.wins, result.losses, result.gradeLabel, modeLabel, names);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(share);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section>
      <div className="panel" style={{ textAlign: 'center' }}>
        <p className="section-label">Final record</p>
        <div className="win-counter">
          {result.wins}-{result.losses}
        </div>
        <div className="grade-tag">{result.gradeLabel}</div>
        <p className="lede" style={{ margin: '0.5rem auto 0', textAlign: 'center' }}>
          Score {result.score}/1000 · {modeLabel}
        </p>
        {state.madeLeaderboard && (
          <p className="toast">You made the local all-time board (140+ Classic wins).</p>
        )}
        {state.dailyRank != null && (
          <p className="toast">Global daily rank: #{state.dailyRank}</p>
        )}
      </div>

      <div className="result-grid">
        <div className="panel">
          <p className="section-label">Strengths</p>
          <ul>
            {result.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <p className="section-label">Weaknesses</p>
          <ul>
            {result.weaknesses.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="section-label">Roster</p>
      <RosterBoard roster={state.roster} />

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <p className="section-label">Share card</p>
        <ShareCard
          wins={result.wins}
          losses={result.losses}
          gradeLabel={result.gradeLabel}
          modeLabel={modeLabel}
          rosterNames={names}
        />
      </div>

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <p className="section-label">Share text</p>
        <div className="share-box">{share}</div>
        <div className="btn-row" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn btn-primary" onClick={copy}>
            Copy result
          </button>
          {state.mode && state.mode !== 'daily' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => startGame(state.mode!)}
            >
              Play again
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={goHome}>
            Home
          </button>
        </div>
        {copied && <p className="toast">Copied to clipboard.</p>}
      </div>
    </section>
  );
}
