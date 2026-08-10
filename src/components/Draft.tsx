import { ROUNDS } from '../config/constants';
import { formatSalary } from '../game/salary';
import { useGame } from '../state/gameStore';
import { PlayerPicker } from './PlayerPicker';
import { RosterBoard } from './RosterBoard';
import { SpinReels } from './SpinReels';

export function Draft() {
  const {
    state,
    spin,
    skipTeam,
    skipDecade,
    respinEmpty,
    pickPlayer,
    availablePlayers,
    franchiseName,
    goHome,
    modeLabel,
    salarySpent,
    salaryRemaining,
  } = useGame();

  return (
    <section>
      <div className="draft-header">
        <div>
          <h2>{modeLabel}</h2>
          <div className="round-meta">
            Round {Math.min(state.round, ROUNDS)} of {ROUNDS}
            {state.salaryCap != null && salaryRemaining != null && (
              <>
                {' '}
                · Cap {formatSalary(salarySpent)} / {formatSalary(state.salaryCap)} (
                {formatSalary(salaryRemaining)} left)
              </>
            )}
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={goHome}>
          Quit
        </button>
      </div>

      <div className="panel">
        <p className="section-label">Spin the park</p>
        <SpinReels spin={state.spin} spinning={state.spinning} />

        {!state.spin && !state.spinning && (
          <button type="button" className="btn btn-primary" onClick={spin}>
            Spin franchise + decade
          </button>
        )}

        {state.spin && !state.spinning && (
          <>
            <p className="lede" style={{ maxWidth: 'none', marginBottom: '0.75rem' }}>
              {state.spin.decade} · {franchiseName}
            </p>
            {(state.teamSkips > 0 || state.decadeSkips > 0) && (
              <div className="skip-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={state.teamSkips <= 0}
                  onClick={skipTeam}
                >
                  Skip team ({state.teamSkips})
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={state.decadeSkips <= 0}
                  onClick={skipDecade}
                >
                  Skip decade ({state.decadeSkips})
                </button>
              </div>
            )}
            <p className="section-label">Select your player</p>
            {!availablePlayers.length && state.mode !== 'daily' && (
              <div className="btn-row" style={{ marginBottom: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={respinEmpty}>
                  No fits — redraw spin
                </button>
              </div>
            )}
            <PlayerPicker
              players={availablePlayers}
              roster={state.roster}
              showStats={state.showStats}
              salaryMode={state.mode === 'salary'}
              salaryRemaining={salaryRemaining}
              onPick={pickPlayer}
            />
          </>
        )}
      </div>

      <p className="section-label" style={{ marginTop: '1.5rem' }}>
        Your roster
      </p>
      <RosterBoard roster={state.roster} />
    </section>
  );
}
