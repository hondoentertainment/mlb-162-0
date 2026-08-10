import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { MODE_LABELS, POSITIONS, type GameMode, type Position } from '../config/constants';
import { FRANCHISE_BY_ID } from '../data/franchises';
import { dailyRng, saveDailyRecord, utcDateKey } from '../game/daily';
import { submitDailyBoard } from '../game/dailyBoard';
import { tryAddLeaderboardEntry } from '../game/leaderboard';
import { hashString, mulberry32 } from '../game/rng';
import { playerSalary, rosterSpend, SALARY_CAP_M } from '../game/salary';
import { simulateSeason } from '../game/simulate';
import {
  getAvailablePlayers,
  spinNewFranchise,
  spinWithEligibility,
} from '../game/spin';
import type { Player, RosterSlot, SeasonResult, SpinResult } from '../types/game';

export type Screen =
  | 'home'
  | 'draft'
  | 'reveal'
  | 'result'
  | 'how'
  | 'leaderboard';

interface GameState {
  screen: Screen;
  mode: GameMode | null;
  roster: RosterSlot[];
  round: number;
  spin: SpinResult | null;
  spinning: boolean;
  teamSkips: number;
  decadeSkips: number;
  result: SeasonResult | null;
  showStats: boolean;
  randSeed: number;
  dateKey: string | null;
  madeLeaderboard: boolean;
  dailyRank: number | null;
  salaryCap: number | null;
}

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'START'; mode: GameMode }
  | { type: 'SPIN_START' }
  | { type: 'SPIN_DONE'; spin: SpinResult }
  | { type: 'SKIP_TEAM' }
  | { type: 'SKIP_DECADE' }
  | { type: 'RESPIN' }
  | { type: 'PICK'; player: Player; position: Position }
  | {
      type: 'SET_RESULT';
      result: SeasonResult;
      madeLeaderboard: boolean;
      dailyRank: number | null;
    }
  | { type: 'RESET' };

function emptyRoster(): RosterSlot[] {
  return POSITIONS.map((position) => ({ position, player: null }));
}

function createRng(seed: number): () => number {
  return mulberry32(seed);
}

const initialState: GameState = {
  screen: 'home',
  mode: null,
  roster: emptyRoster(),
  round: 1,
  spin: null,
  spinning: false,
  teamSkips: 1,
  decadeSkips: 1,
  result: null,
  showStats: true,
  randSeed: Date.now(),
  dateKey: null,
  madeLeaderboard: false,
  dailyRank: null,
  salaryCap: null,
};

function openPositions(roster: RosterSlot[]): Position[] {
  return roster.filter((s) => !s.player).map((s) => s.position);
}

function takenIds(roster: RosterSlot[]): Set<string> {
  return new Set(roster.filter((s) => s.player).map((s) => s.player!.id));
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'START': {
      const isDaily = action.mode === 'daily';
      const isSalary = action.mode === 'salary';
      const dateKey = isDaily ? utcDateKey() : null;
      const seed = isDaily
        ? hashString(`mlb1620-daily-${dateKey}`)
        : (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
      return {
        ...initialState,
        screen: 'draft',
        mode: action.mode,
        showStats: action.mode === 'classic' || isSalary,
        teamSkips: isDaily ? 0 : 1,
        decadeSkips: isDaily ? 0 : 1,
        randSeed: seed,
        dateKey,
        roster: emptyRoster(),
        salaryCap: isSalary ? SALARY_CAP_M : null,
      };
    }
    case 'SPIN_START':
      return { ...state, spinning: true };
    case 'SPIN_DONE':
      return { ...state, spinning: false, spin: action.spin };
    case 'SKIP_TEAM': {
      if (!state.spin || state.teamSkips <= 0) return state;
      const rand = createRng(state.randSeed + state.round * 97 + 11);
      const spin = spinNewFranchise(rand, state.spin.decade, state.spin.franchiseId);
      return {
        ...state,
        teamSkips: state.teamSkips - 1,
        spin,
        randSeed: state.randSeed + 13,
      };
    }
    case 'SKIP_DECADE': {
      if (state.decadeSkips <= 0) return state;
      const rand = createRng(state.randSeed + state.round * 91 + 17);
      const spin = spinWithEligibility(
        rand,
        openPositions(state.roster),
        takenIds(state.roster),
      );
      return {
        ...state,
        decadeSkips: state.decadeSkips - 1,
        spin,
        randSeed: state.randSeed + 29,
      };
    }
    case 'RESPIN': {
      if (!state.spin || state.mode === 'daily') return state;
      const rand = createRng(state.randSeed + state.round * 53 + 7);
      const spin = spinWithEligibility(
        rand,
        openPositions(state.roster),
        takenIds(state.roster),
      );
      return { ...state, spin, randSeed: state.randSeed + 41 };
    }
    case 'PICK': {
      if (state.salaryCap != null) {
        const spent = rosterSpend(state.roster.map((s) => s.player));
        if (spent + playerSalary(action.player) > state.salaryCap) return state;
      }
      const roster = state.roster.map((slot) =>
        slot.position === action.position
          ? { ...slot, player: action.player }
          : slot,
      );
      const filled = roster.every((s) => s.player);
      return {
        ...state,
        roster,
        spin: null,
        round: filled ? state.round : state.round + 1,
        screen: filled ? 'reveal' : 'draft',
      };
    }
    case 'SET_RESULT':
      if (state.result) return state;
      return {
        ...state,
        result: action.result,
        madeLeaderboard: action.madeLeaderboard,
        dailyRank: action.dailyRank,
        screen: 'result',
      };
    case 'RESET':
      return { ...initialState, screen: 'home' };
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  startGame: (mode: GameMode) => void;
  spin: () => void;
  skipTeam: () => void;
  skipDecade: () => void;
  respinEmpty: () => void;
  pickPlayer: (player: Player, position: Position) => void;
  finishReveal: () => void;
  goHome: () => void;
  setScreen: (screen: Screen) => void;
  availablePlayers: Player[];
  franchiseName: string;
  salarySpent: number;
  salaryRemaining: number | null;
  modeLabel: string;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startGame = useCallback((mode: GameMode) => {
    dispatch({ type: 'START', mode });
  }, []);

  const spin = useCallback(() => {
    dispatch({ type: 'SPIN_START' });
    let rand: () => number;
    if (state.mode === 'daily') {
      rand = dailyRng(state.dateKey ?? utcDateKey());
      for (let i = 0; i < state.round * 17; i++) rand();
    } else {
      rand = createRng(state.randSeed + state.round * 1009);
    }
    const result = spinWithEligibility(
      rand,
      openPositions(state.roster),
      takenIds(state.roster),
    );
    window.setTimeout(() => dispatch({ type: 'SPIN_DONE', spin: result }), 900);
  }, [state.dateKey, state.mode, state.randSeed, state.roster, state.round]);

  const skipTeam = useCallback(() => dispatch({ type: 'SKIP_TEAM' }), []);
  const skipDecade = useCallback(() => dispatch({ type: 'SKIP_DECADE' }), []);
  const respinEmpty = useCallback(() => dispatch({ type: 'RESPIN' }), []);

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
          wins: result.wins,
          losses: result.losses,
          gradeLabel: result.gradeLabel,
          rosterNames,
        });
        dailyRank = submitted.rank ?? null;
      }

      try {
        localStorage.setItem(
          'mlb1620_last_result',
          JSON.stringify({ result, rosterNames, mode: state.mode }),
        );
      } catch {
        /* ignore */
      }

      dispatch({ type: 'SET_RESULT', result, madeLeaderboard, dailyRank });
    })();
  }, [state.dateKey, state.mode, state.roster]);

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

  const availablePlayers = useMemo(() => {
    if (!state.spin) return [];
    return getAvailablePlayers(
      state.spin,
      openPositions(state.roster),
      takenIds(state.roster),
    );
  }, [state.roster, state.spin]);

  const franchiseName = state.spin
    ? FRANCHISE_BY_ID[state.spin.franchiseId]?.name ?? state.spin.franchiseId
    : '';

  const modeLabel = state.mode ? MODE_LABELS[state.mode] : '';

  const value = useMemo(
    () => ({
      state,
      startGame,
      spin,
      skipTeam,
      skipDecade,
      respinEmpty,
      pickPlayer,
      finishReveal,
      goHome,
      setScreen,
      availablePlayers,
      franchiseName,
      salarySpent,
      salaryRemaining,
      modeLabel,
    }),
    [
      state,
      startGame,
      spin,
      skipTeam,
      skipDecade,
      respinEmpty,
      pickPlayer,
      finishReveal,
      goHome,
      setScreen,
      availablePlayers,
      franchiseName,
      salarySpent,
      salaryRemaining,
      modeLabel,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
