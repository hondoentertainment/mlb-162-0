import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  MODE_LABELS,
  spinDurationMs,
  type Decade,
  type GameMode,
  type Position,
} from '../config/constants';
import { FRANCHISE_BY_ID } from '../data/franchises';
import { ensurePool } from '../data/pool';
import { evaluateAchievements } from '../game/achievements';
import { recordCareerResult } from '../game/career';
import { saveDailyRecord } from '../game/daily';
import { submitDailyBoard } from '../game/dailyBoard';
import { spinForRound } from '../game/draftSequence';
import { canUndoLastPick } from '../game/draftRules';
import { tryAddLeaderboardEntry } from '../game/leaderboard';
import { rosterSpend } from '../game/salary';
import { simulateSeason } from '../game/simulate';
import { getAvailablePlayers, playersOnSpin } from '../game/spin';
import type { Player } from '../types/game';
import {
  draftedKeys,
  initialState,
  openPositions,
  reducer,
  type GameState,
  type Screen,
} from './gameReducer';

export type { Screen } from './gameReducer';

interface GameContextValue {
  state: GameState;
  startGame: (mode: GameMode, franchiseId?: string, challengeCode?: string) => void;
  startEraLock: (decade: Decade) => void;
  beginFranchiseSelect: () => void;
  beginDecadeSelect: () => void;
  spin: () => void;
  skipTeam: () => void;
  skipDecade: () => void;
  respinEmpty: () => void;
  pickPlayer: (player: Player, position: Position) => void;
  undoLastPick: () => void;
  finishReveal: () => void;
  goHome: () => void;
  setScreen: (screen: Screen) => void;
  availablePlayers: Player[];
  spinPlayers: Player[];
  franchiseName: string;
  salarySpent: number;
  salaryRemaining: number | null;
  modeLabel: string;
  canUndo: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startGame = useCallback(
    (mode: GameMode, franchiseId?: string, challengeCode?: string) => {
      // The player table is code-split, so make sure it is in memory before the
      // draft screen tries to spin.
      void ensurePool().then(() =>
        dispatch({ type: 'START', mode, franchiseId, challengeCode }),
      );
    },
    [],
  );

  const startEraLock = useCallback((decade: Decade) => {
    void ensurePool().then(() => dispatch({ type: 'START', mode: 'eralock', decade }));
  }, []);

  const beginFranchiseSelect = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'franchise-select' });
  }, []);

  const beginDecadeSelect = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'decade-select' });
  }, []);

  const spin = useCallback(() => {
    dispatch({ type: 'SPIN_START' });
    const result = spinForRound({
      mode: state.mode,
      round: state.round,
      randSeed: state.randSeed,
      dateKey: state.dateKey,
      openPositions: openPositions(state.roster),
      drafted: draftedKeys(state.roster),
      lockedFranchiseId: state.lockedFranchiseId,
      lockedDecade: state.lockedDecade,
    });
    window.setTimeout(
      () => dispatch({ type: 'SPIN_DONE', spin: result }),
      spinDurationMs(),
    );
  }, [
    state.dateKey,
    state.lockedDecade,
    state.lockedFranchiseId,
    state.mode,
    state.randSeed,
    state.roster,
    state.round,
  ]);

  const skipTeam = useCallback(() => dispatch({ type: 'SKIP_TEAM' }), []);
  const skipDecade = useCallback(() => dispatch({ type: 'SKIP_DECADE' }), []);
  const respinEmpty = useCallback(() => dispatch({ type: 'RESPIN' }), []);
  const undoLastPick = useCallback(() => dispatch({ type: 'UNDO_LAST_PICK' }), []);

  const pickPlayer = useCallback((player: Player, position: Position) => {
    dispatch({ type: 'PICK', player, position });
  }, []);

  const finishReveal = useCallback(() => {
    void (async () => {
      const result = simulateSeason(state.roster);
      const rosterNames = state.roster.map((s) => s.player?.name ?? '—');
      let madeLeaderboard = false;
      let dailyRank: number | null = null;

      if (state.mode === 'classic') {
        madeLeaderboard = tryAddLeaderboardEntry({
          id: `${Date.now()}-${result.wins}`,
          wins: result.wins,
          losses: result.losses,
          gradeLabel: result.gradeLabel,
          mode: 'classic',
          rosterNames,
          createdAt: new Date().toISOString(),
        });
      }

      if (state.mode === 'daily' && state.dateKey) {
        saveDailyRecord({
          dateKey: state.dateKey,
          completed: true,
          wins: result.wins,
          losses: result.losses,
          gradeLabel: result.gradeLabel,
          rosterNames,
        });
        const submitted = await submitDailyBoard({
          dateKey: state.dateKey,
          picks: state.picks,
        });
        dailyRank = submitted.rank ?? null;
      }

      const career = state.mode
        ? recordCareerResult({
            mode: state.mode,
            result,
            dateKey: state.dateKey,
          })
        : null;

      const newAchievements =
        state.mode && career
          ? evaluateAchievements({
              mode: state.mode,
              result,
              rosterPlayers: state.roster.map((s) => s.player),
              career,
            })
          : [];

      try {
        localStorage.setItem(
          'mlb1620_last_result',
          JSON.stringify({ result, rosterNames, mode: state.mode }),
        );
      } catch {
        /* ignore */
      }

      dispatch({
        type: 'SET_RESULT',
        result,
        madeLeaderboard,
        dailyRank,
        newAchievements,
      });
    })();
  }, [state.dateKey, state.mode, state.picks, state.roster]);

  const goHome = useCallback(() => dispatch({ type: 'RESET' }), []);
  const setScreen = useCallback(
    (screen: Screen) => dispatch({ type: 'SET_SCREEN', screen }),
    [],
  );

  const salarySpent = useMemo(
    () => rosterSpend(state.roster.map((s) => s.player)),
    [state.roster],
  );
  const salaryRemaining =
    state.salaryCap != null ? state.salaryCap - salarySpent : null;

  const spinPlayers = useMemo(() => {
    if (!state.spin) return [];
    return playersOnSpin(state.spin, draftedKeys(state.roster));
  }, [state.roster, state.spin]);

  const availablePlayers = useMemo(() => {
    if (!state.spin) return [];
    return getAvailablePlayers(
      state.spin,
      openPositions(state.roster),
      draftedKeys(state.roster),
    );
  }, [state.roster, state.spin]);

  const franchiseName = state.spin
    ? FRANCHISE_BY_ID[state.spin.franchiseId]?.name ?? state.spin.franchiseId
    : state.lockedFranchiseId
      ? FRANCHISE_BY_ID[state.lockedFranchiseId]?.name ?? state.lockedFranchiseId
      : '';

  const modeLabel = state.mode ? MODE_LABELS[state.mode] : '';
  const canUndo = canUndoLastPick(state.mode) && state.lastPick != null;

  const value = useMemo(
    () => ({
      state,
      startGame,
      startEraLock,
      beginFranchiseSelect,
      beginDecadeSelect,
      spin,
      skipTeam,
      skipDecade,
      respinEmpty,
      pickPlayer,
      undoLastPick,
      finishReveal,
      goHome,
      setScreen,
      availablePlayers,
      spinPlayers,
      franchiseName,
      salarySpent,
      salaryRemaining,
      modeLabel,
      canUndo,
    }),
    [
      state,
      startGame,
      startEraLock,
      beginFranchiseSelect,
      beginDecadeSelect,
      spin,
      skipTeam,
      skipDecade,
      respinEmpty,
      pickPlayer,
      undoLastPick,
      finishReveal,
      goHome,
      setScreen,
      availablePlayers,
      spinPlayers,
      franchiseName,
      salarySpent,
      salaryRemaining,
      modeLabel,
      canUndo,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
