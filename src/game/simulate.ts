import { POSITIONS, SEASON_GAMES, type Position } from '../config/constants';
import type { Player, RosterSlot, SeasonResult, SlotContribution } from '../types/game';
import { gradeForWins, scoreFromWins } from './grades';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function hitterScore(player: Player): number {
  const b = player.batting;
  if (!b) return 0.2;
  // Peak reference roughly Bonds/Trout/Williams territory
  const ops = b.obp + b.slg;
  const opsPart = clamp((ops - 0.62) / (1.12 - 0.62), 0, 1);
  const avgPart = clamp((b.avg - 0.22) / (0.33 - 0.22), 0, 1);
  const tierPart = (player.tier - 1) / 4;
  const hofBonus = player.hof ? 0.06 : 0;
  return clamp(opsPart * 0.5 + avgPart * 0.18 + tierPart * 0.26 + hofBonus, 0, 1);
}

function pitcherScore(player: Player): number {
  const p = player.pitching;
  if (!p) return 0.2;
  const eraPart = clamp((4.8 - p.era) / (4.8 - 1.9), 0, 1);
  const whipPart = clamp((1.45 - p.whip) / (1.45 - 0.9), 0, 1);
  const kPart = clamp((p.k9 - 5) / (12 - 5), 0, 1);
  const tierPart = (player.tier - 1) / 4;
  const hofBonus = player.hof ? 0.06 : 0;
  return clamp(eraPart * 0.38 + whipPart * 0.22 + kPart * 0.14 + tierPart * 0.2 + hofBonus, 0, 1);
}

export function playerRating(player: Player, position: Position): number {
  const fit = player.positions.includes(position) ? 1 : 0.75;
  const base = position === 'SP' ? pitcherScore(player) : hitterScore(player);
  return clamp(base * fit, 0, 1);
}

function winsFromStrength(strength: number, filled: number): number {
  // Incomplete roster hard-caps wins
  if (filled < POSITIONS.length) {
    const penalty = (POSITIONS.length - filled) * 18;
    const raw = 40 + strength * 70;
    return clamp(Math.round(raw - penalty), 0, 120);
  }

  // Non-linear curve: mid ~80-95, elite 130-155, perfection rare but reachable
  const t = clamp(strength, 0, 1);
  let wins: number;
  if (t < 0.45) {
    wins = 45 + (t / 0.45) * 38;
  } else if (t < 0.65) {
    wins = 83 + ((t - 0.45) / 0.2) * 27;
  } else if (t < 0.8) {
    wins = 110 + ((t - 0.65) / 0.15) * 28;
  } else if (t < 0.88) {
    wins = 138 + ((t - 0.8) / 0.08) * 14;
  } else if (t < 0.93) {
    wins = 152 + ((t - 0.88) / 0.05) * 8;
  } else {
    wins = 160 + ((t - 0.93) / 0.07) * 2;
  }

  return clamp(Math.round(wins), 0, SEASON_GAMES);
}

export function simulateSeason(roster: RosterSlot[]): SeasonResult {
  const ratings: { position: Position; player: Player | null; rating: number }[] =
    roster.map((slot) => ({
      position: slot.position,
      player: slot.player,
      rating: slot.player ? playerRating(slot.player, slot.position) : 0,
    }));

  const filled = ratings.filter((r) => r.player).length;
  const mean =
    filled === 0
      ? 0
      : ratings.reduce((sum, r) => sum + r.rating, 0) / POSITIONS.length;

  // Balance: punish variance / weak links
  const filledRatings = ratings.filter((r) => r.player).map((r) => r.rating);
  const min = filledRatings.length ? Math.min(...filledRatings) : 0;
  const max = filledRatings.length ? Math.max(...filledRatings) : 0;
  const balance = filledRatings.length ? 1 - (max - min) * 0.35 : 0;
  const legendCount = ratings.filter(
    (r) => r.player && (r.player.tier >= 5 || r.player.hof),
  ).length;
  const legendBonus = legendCount * 0.014;

  let strength = clamp(mean * 0.8 + min * 0.08 + balance * 0.04 + legendBonus, 0, 1);
  // Historic across-the-board legends can push into perfection territory
  if (filled === POSITIONS.length && mean >= 0.78 && min >= 0.68 && legendCount >= 7) {
    strength = clamp(strength + 0.05, 0, 1);
  }
  const wins = winsFromStrength(strength, filled);
  const losses = SEASON_GAMES - wins;
  const grade = gradeForWins(wins);

  const sorted = [...ratings].filter((r) => r.player).sort((a, b) => b.rating - a.rating);
  const best = sorted[0] ?? null;
  const worst = [...ratings].sort((a, b) => a.rating - b.rating)[0] ?? null;

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (best?.player) {
    strengths.push(`Best pick: ${best.player.name} at ${best.position}`);
  }
  if (mean >= 0.78) strengths.push('Elite overall production');
  if (balance >= 0.9) strengths.push('Balanced across the diamond');
  if (ratings.some((r) => r.position === 'SP' && r.rating >= 0.85)) {
    strengths.push('Ace-level starting pitching');
  }

  if (filled < POSITIONS.length) {
    weaknesses.push(`Incomplete roster (${filled}/${POSITIONS.length})`);
  }
  if (worst && worst.rating < 0.45) {
    weaknesses.push(
      worst.player
        ? `Weak link: ${worst.position} (${worst.player.name})`
        : `Empty ${worst.position}`,
    );
  }
  if (max - min > 0.35 && filled === POSITIONS.length) {
    weaknesses.push('Lopsided talent distribution');
  }
  if (!strengths.length) strengths.push('A few bright spots to build on');
  if (!weaknesses.length) weaknesses.push('No glaring holes — chase perfection');

  const filledMean = filled
    ? filledRatings.reduce((sum, r) => sum + r, 0) / filled
    : 0;
  const contributions: SlotContribution[] = ratings.map((r) => ({
    position: r.position,
    playerName: r.player?.name ?? null,
    rating: r.rating,
    delta: r.player ? r.rating - filledMean : -filledMean,
  }));

  return {
    wins,
    losses,
    score: scoreFromWins(wins),
    gradeId: grade.id,
    gradeLabel: grade.label,
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    bestPickId: best?.player?.id ?? null,
    weakestSlot: worst?.position ?? null,
    contributions,
  };
}
