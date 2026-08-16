import { useEffect, useMemo, useRef, useState } from 'react';
import { ROUNDS } from '../config/constants';
import { dismissClassicCoach, shouldShowClassicCoach } from '../game/classicCoach';
import {
  allowsRedraw,
  canRespinEmptyPool,
  canUndoLastPick,
  emptyPoolCopy,
  emptyPoolKind,
} from '../game/draftRules';
import { formatSalary, playerSalary } from '../game/salary';
import { personKey } from '../game/spin';
import { draftedKeys } from '../state/gameReducer';
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
    undoLastPick,
    availablePlayers,
    spinPlayers,
    franchiseName,
    goHome,
    modeLabel,
    salarySpent,
    salaryRemaining,
    canUndo,
  } = useGame();

  const spinLabel = state.lockedFranchiseId
    ? 'Spin decade'
    : state.lockedDecade
      ? 'Spin franchise'
      : 'Spin franchise + decade';

  const affordableCount = useMemo(() => {
    if (state.mode !== 'salary' || salaryRemaining == null) return availablePlayers.length;
    return availablePlayers.filter((p) => playerSalary(p) <= salaryRemaining).length;
  }, [availablePlayers, salaryRemaining, state.mode]);

  const [coach, setCoach] = useState(() => shouldShowClassicCoach());
  const poolKind = emptyPoolKind({
    mode: state.mode,
    hasSpin: !!state.spin,
    spinning: state.spinning,
    availableCount: availablePlayers.length,
    affordableCount,
  });
  const needsRedraw = canRespinEmptyPool(state.mode, poolKind);
  const showUndo = canUndoLastPick(state.mode);
  const fairEmpty = !allowsRedraw(state.mode) && poolKind !== 'none';
  const alreadyOnRoster = useMemo(() => {
    if (!state.spin) return 0;
    const taken = draftedKeys(state.roster);
    return spinPlayers.filter((p) => taken.has(personKey(p))).length;
  }, [spinPlayers, state.roster, state.spin]);

  const autoRespinKey = state.spin
    ? `${state.round}|${state.spin.franchiseId}|${state.spin.decade}|${poolKind}`
    : null;
  const lastAutoKey = useRef<string | null>(null);

  useEffect(() => {
    if (!needsRedraw || !autoRespinKey) return;
    if (lastAutoKey.current === autoRespinKey) return;
    lastAutoKey.current = autoRespinKey;
    const delay = typeof window !== 'undefined' && window.__E2E__ ? 40 : 700;
    const id = window.setTimeout(() => respinEmpty(), delay);
    return () => window.clearTimeout(id);
  }, [autoRespinKey, needsRedraw, respinEmpty]);

  return (
    <section data-testid="draft">
      <div className="draft-header">
        <div>
          <h2 data-testid="mode-label">{modeLabel}</h2>
          <div className="round-meta" data-testid="round-meta">
            Round {Math.min(state.round, ROUNDS)} of {ROUNDS}
            {state.lockedFranchiseId && <> · {franchiseName}</>}
            {state.lockedDecade && (
              <>
                {' '}
                · <span data-testid="locked-decade">{state.lockedDecade}</span>
              </>
            )}
            {state.challengeCode && (
              <>
                {' '}
                · Code <span data-testid="challenge-code">{state.challengeCode}</span>
              </>
            )}
            {state.salaryCap != null && salaryRemaining != null && (
              <>
                {' '}
                · Cap {formatSalary(salarySpent)} / {formatSalary(state.salaryCap)} (
                {formatSalary(salaryRemaining)} left)
              </>
            )}
          </div>
        </div>
        <div className="draft-actions">
          {showUndo && (
            <button
              type="button"
              className="btn btn-ghost"
              data-testid="undo-pick"
              disabled={!canUndo}
              onClick={undoLastPick}
            >
              Undo last pick
            </button>
          )}
          <button type="button" className="btn btn-ghost" data-testid="quit" onClick={goHome}>
            Quit
          </button>
        </div>
      </div>

      {coach && state.mode === 'classic' && (
        <div className="panel coach" data-testid="classic-coach">
          <p className="section-label">First Classic</p>
          <ol className="coach-steps">
            <li>Spin a franchise and decade.</li>
            <li>Tap one name into an open slot. Nine rounds, nine legends.</li>
          </ol>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              dismissClassicCoach();
              setCoach(false);
            }}
          >
            Got it
          </button>
        </div>
      )}

      <div className="panel">
        <p className="section-label">Spin the park</p>
        <SpinReels spin={state.spin} spinning={state.spinning} />

        {!state.spin && !state.spinning && (
          <button
            type="button"
            className="btn btn-primary"
            data-testid="spin-button"
            onClick={spin}
          >
            {spinLabel}
          </button>
        )}

        {state.spin && !state.spinning && (
          <>
            <p
              className="lede"
              style={{ maxWidth: 'none', marginBottom: '0.75rem' }}
              data-testid="spin-result"
            >
              {state.spin.decade} · {franchiseName}
            </p>
            {(state.teamSkips > 0 || state.decadeSkips > 0) && (
              <div className="skip-row">
                {state.teamSkips > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-testid="skip-team"
                    disabled={state.teamSkips <= 0}
                    onClick={skipTeam}
                  >
                    Skip team ({state.teamSkips})
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-testid="skip-decade"
                  disabled={state.decadeSkips <= 0}
                  onClick={skipDecade}
                >
                  Skip decade ({state.decadeSkips})
                </button>
              </div>
            )}
            <p className="section-label">
              All players from this {state.lockedFranchiseId ? 'decade' : 'franchise and decade'}
            </p>
            {spinPlayers.length > 0 && (
              <p className="round-meta" data-testid="spin-pool-count" style={{ marginBottom: '0.75rem' }}>
                {spinPlayers.length} player{spinPlayers.length === 1 ? '' : 's'}
                {availablePlayers.length !== spinPlayers.length && (
                  <> · {availablePlayers.length} fit an open slot</>
                )}
              </p>
            )}
            {(needsRedraw || fairEmpty) && (
              <div className="empty-pool empty-pool-banner" data-testid="empty-pool">
                <p data-testid="empty-pool-copy">
                  {emptyPoolCopy(poolKind, !allowsRedraw(state.mode), alreadyOnRoster)}
                </p>
                {needsRedraw && (
                  <>
                    <p className="empty-pool-hint">Redrawing a new spin — this is not a skip.</p>
                    <div className="btn-row">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-testid="respin"
                        onClick={respinEmpty}
                      >
                        Redraw now
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <PlayerPicker
              players={spinPlayers}
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
