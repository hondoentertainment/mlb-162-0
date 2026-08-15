import {
  POSITIONS,
  type Decade,
  type GameMode,
  type Position,
} from '../config/constants';
import { allowsRedraw, canUndoLastPick } from '../game/draftRules';
import { decodeChallengeSeed, encodeChallengeSeed, newChallengeSeed } from '../game/challenge';
import { dailySeed, utcDateKey } from '../game/dailySeed';
import { mulberry32 } from '../game/rng';
import { playerSalary, rosterSpend, SALARY_CAP_M } from '../game/salary';
import {
  getAvailablePlayers,
  personKey,
  spinDecadeForFranchise,
  spinNewFranchise,
  spinWithEligibility,
} from '../game/spin';
import type { Player, RosterSlot, SeasonResult, SpinResult } from '../types/game';
import type { AchievementId } from '../game/achievements';
import type { SubmittedPick } from '../game/verifyRun';

export type Screen =
  | 'home'
  | 'franchise-select'
  | 'decade-select'
  | 'draft'
  | 'reveal'
  | 'result'
  | 'how'
  | 'leaderboard'
  | 'career';

/** One-step snapshot so a mis-tap can restore the last pick's spin. */
export interface LastPickSnapshot {
  roster: RosterSlot[];
  spin: SpinResult;
  round: number;
  teamSkips: number;
  decadeSkips: number;
  randSeed: number;
  picks: SubmittedPick[];
}

export interface GameState {
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
  lockedFranchiseId: string | null;
  lockedDecade: Decade | null;
  challengeCode: string | null;
  newAchievements: AchievementId[];
  lastPick: LastPickSnapshot | null;
  /** Draft order, so a finished run can be verified server-side. */
  picks: SubmittedPick[];
}

export type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | {
      type: 'START';
      mode: GameMode;
      franchiseId?: string;
      challengeCode?: string;
      decade?: Decade;
    }
  | { type: 'SPIN_START' }
  | { type: 'SPIN_DONE'; spin: SpinResult }
  | { type: 'SKIP_TEAM' }
  | { type: 'SKIP_DECADE' }
  | { type: 'RESPIN' }
  | { type: 'PICK'; player: Player; position: Position }
  | { type: 'UNDO_LAST_PICK' }
  | {
      type: 'SET_RESULT';
      result: SeasonResult;
      madeLeaderboard: boolean;
      dailyRank: number | null;
      newAchievements: AchievementId[];
    }
  | { type: 'RESET' };

export function emptyRoster(): RosterSlot[] {
  return POSITIONS.map((position) => ({ position, player: null }));
}

export function createRng(seed: number): () => number {
  return mulberry32(seed);
}

export function openPositions(roster: RosterSlot[]): Position[] {
  return roster.filter((s) => !s.player).map((s) => s.position);
}

/** Keyed by person so a player cannot be drafted again from a different team-era. */
export function draftedKeys(roster: RosterSlot[]): Set<string> {
  return new Set(roster.filter((s) => s.player).map((s) => personKey(s.player!)));
}

export const initialState: GameState = {
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
  lockedFranchiseId: null,
  lockedDecade: null,
  challengeCode: null,
  newAchievements: [],
  lastPick: null,
  picks: [],
};

function snapshotLastPick(state: GameState): LastPickSnapshot | null {
  if (!canUndoLastPick(state.mode) || !state.spin) return null;
  return {
    roster: state.roster,
    spin: state.spin,
    round: state.round,
    teamSkips: state.teamSkips,
    decadeSkips: state.decadeSkips,
    randSeed: state.randSeed,
    picks: state.picks,
  };
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'START': {
      const isDaily = action.mode === 'daily';
      const isSalary = action.mode === 'salary';
      const isFranchise = action.mode === 'franchise';
      const isChallenge = action.mode === 'challenge';
      const isEraLock = action.mode === 'eralock';
      const isIronman = action.mode === 'ironman';
      const dateKey = isDaily ? utcDateKey() : null;
      let seed: number;
      let challengeCode: string | null = null;
      if (isDaily) {
        seed = dailySeed(dateKey!);
      } else if (isChallenge) {
        const fromCode = action.challengeCode
          ? decodeChallengeSeed(action.challengeCode)
          : null;
        seed = fromCode ?? newChallengeSeed();
        challengeCode = encodeChallengeSeed(seed);
      } else {
        seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
      }
      return {
        ...initialState,
        screen: 'draft',
        mode: action.mode,
        showStats: action.mode !== 'diamondiq' && !isDaily,
        // Era Lock swaps decade skips for a second team skip; Ironman gets none.
        teamSkips: isIronman || isDaily || isFranchise || isChallenge ? 0 : isEraLock ? 2 : 1,
        decadeSkips:
          isIronman || isDaily || isChallenge || isEraLock ? 0 : isFranchise ? 2 : 1,
        randSeed: seed,
        dateKey,
        roster: emptyRoster(),
        salaryCap: isSalary ? SALARY_CAP_M : null,
        lockedFranchiseId: isFranchise ? (action.franchiseId ?? null) : null,
        lockedDecade: isEraLock ? (action.decade ?? null) : null,
        challengeCode,
        lastPick: null,
        picks: [],
      };
    }
    case 'SPIN_START':
      return { ...state, spinning: true };
    case 'SPIN_DONE':
      return { ...state, spinning: false, spin: action.spin };
    case 'SKIP_TEAM': {
      if (!state.spin || state.teamSkips <= 0 || state.lockedFranchiseId) return state;
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
      const spin = state.lockedFranchiseId
        ? spinDecadeForFranchise(rand, state.lockedFranchiseId, state.spin?.decade)
        : spinWithEligibility(
            rand,
            openPositions(state.roster),
            draftedKeys(state.roster),
            40,
            null,
            state.lockedDecade,
          );
      return {
        ...state,
        decadeSkips: state.decadeSkips - 1,
        spin,
        randSeed: state.randSeed + 29,
      };
    }
    case 'RESPIN': {
      if (!state.spin || !allowsRedraw(state.mode)) return state;
      const open = openPositions(state.roster);
      const taken = draftedKeys(state.roster);
      let nextSeed = state.randSeed + 41;
      let spin = state.spin;
      for (let i = 0; i < 24; i++) {
        const rand = createRng(nextSeed + state.round * 53 + 7 + i * 17);
        spin = spinWithEligibility(
          rand,
          open,
          taken,
          40,
          state.lockedFranchiseId,
          state.lockedDecade,
        );
        const pool = getAvailablePlayers(spin, open, taken);
        if (!pool.length) {
          nextSeed += 3;
          continue;
        }
        if (state.salaryCap == null) break;
        const spent = rosterSpend(state.roster.map((s) => s.player));
        const remaining = state.salaryCap - spent;
        if (pool.some((p) => playerSalary(p) <= remaining)) break;
        nextSeed += 3;
      }
      return { ...state, spin, randSeed: nextSeed };
    }
    case 'PICK': {
      if (draftedKeys(state.roster).has(personKey(action.player))) return state;
      if (state.salaryCap != null) {
        const spent = rosterSpend(state.roster.map((s) => s.player));
        if (spent + playerSalary(action.player) > state.salaryCap) return state;
      }
      const lastPick = snapshotLastPick(state);
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
        lastPick,
        picks: [...state.picks, { position: action.position, playerId: action.player.id }],
      };
    }
    case 'UNDO_LAST_PICK': {
      if (!canUndoLastPick(state.mode) || !state.lastPick) return state;
      if (state.screen !== 'draft' && state.screen !== 'reveal') return state;
      const snap = state.lastPick;
      return {
        ...state,
        roster: snap.roster,
        spin: snap.spin,
        round: snap.round,
        teamSkips: snap.teamSkips,
        decadeSkips: snap.decadeSkips,
        randSeed: snap.randSeed,
        picks: snap.picks,
        spinning: false,
        screen: 'draft',
        lastPick: null,
      };
    }
    case 'SET_RESULT':
      if (state.result) return state;
      return {
        ...state,
        result: action.result,
        madeLeaderboard: action.madeLeaderboard,
        dailyRank: action.dailyRank,
        newAchievements: action.newAchievements,
        screen: 'result',
        lastPick: null,
      };
    case 'RESET':
      return { ...initialState, screen: 'home' };
    default:
      return state;
  }
}
