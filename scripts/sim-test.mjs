import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/data/players.ts', import.meta.url), 'utf8');
const PLAYERS = JSON.parse(src.match(/export const PLAYERS: Player\[\] = (\[[\s\S]*?\]);/)[1]);
const POSITIONS = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'SP'];
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function hitterScore(player) {
  const b = player.batting;
  if (!b) return 0.2;
  const ops = b.obp + b.slg;
  const opsPart = clamp((ops - 0.62) / (1.12 - 0.62), 0, 1);
  const avgPart = clamp((b.avg - 0.22) / (0.33 - 0.22), 0, 1);
  const tierPart = (player.tier - 1) / 4;
  return clamp(opsPart * 0.5 + avgPart * 0.18 + tierPart * 0.26 + (player.hof ? 0.06 : 0), 0, 1);
}
function pitcherScore(player) {
  const p = player.pitching;
  if (!p) return 0.2;
  const eraPart = clamp((4.8 - p.era) / (4.8 - 1.9), 0, 1);
  const whipPart = clamp((1.45 - p.whip) / (1.45 - 0.9), 0, 1);
  const kPart = clamp((p.k9 - 5) / (12 - 5), 0, 1);
  const tierPart = (player.tier - 1) / 4;
  return clamp(eraPart * 0.38 + whipPart * 0.22 + kPart * 0.14 + tierPart * 0.2 + (player.hof ? 0.06 : 0), 0, 1);
}
function playerRating(player, position) {
  const fit = player.positions.includes(position) ? 1 : 0.75;
  return clamp((position === 'SP' ? pitcherScore(player) : hitterScore(player)) * fit, 0, 1);
}
function winsFromStrength(strength, filled) {
  if (filled < POSITIONS.length) {
    const penalty = (POSITIONS.length - filled) * 18;
    return clamp(Math.round(40 + strength * 70 - penalty), 0, 120);
  }
  const t = clamp(strength, 0, 1);
  let wins;
  if (t < 0.45) wins = 45 + (t / 0.45) * 38;
  else if (t < 0.65) wins = 83 + ((t - 0.45) / 0.2) * 27;
  else if (t < 0.8) wins = 110 + ((t - 0.65) / 0.15) * 30;
  else if (t < 0.9) wins = 140 + ((t - 0.8) / 0.1) * 14;
  else if (t < 0.96) wins = 154 + ((t - 0.9) / 0.06) * 6;
  else wins = 160 + ((t - 0.96) / 0.04) * 2;
  return clamp(Math.round(wins), 0, 162);
}
function simulate(roster) {
  const ratings = roster.map((slot) => ({
    position: slot.position,
    player: slot.player,
    rating: slot.player ? playerRating(slot.player, slot.position) : 0,
  }));
  const filled = ratings.filter((r) => r.player).length;
  const mean = filled === 0 ? 0 : ratings.reduce((s, r) => s + r.rating, 0) / POSITIONS.length;
  const filledRatings = ratings.filter((r) => r.player).map((r) => r.rating);
  const min = filledRatings.length ? Math.min(...filledRatings) : 0;
  const max = filledRatings.length ? Math.max(...filledRatings) : 0;
  const balance = filledRatings.length ? 1 - (max - min) * 0.35 : 0;
  const legendBonus =
    ratings.filter((r) => r.player && (r.player.tier >= 5 || r.player.hof)).length * 0.012;
  const strength = clamp(mean * 0.78 + min * 0.1 + balance * 0.05 + legendBonus, 0, 1);
  return { wins: winsFromStrength(strength, filled), strength };
}

const samples = [];
for (let i = 0; i < 500; i++) {
  const roster = POSITIONS.map((position) => {
    const pool = PLAYERS.filter((p) => p.positions.includes(position));
    return { position, player: pool[Math.floor(Math.random() * pool.length)] };
  });
  samples.push(simulate(roster).wins);
}
samples.sort((a, b) => a - b);
const dream = POSITIONS.map((position) => {
  const pool = PLAYERS.filter((p) => p.positions.includes(position));
  return {
    position,
    player: pool.sort((a, b) => playerRating(b, position) - playerRating(a, position))[0],
  };
});
const d = simulate(dream);
console.log({
  avg: (samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(1),
  p50: samples[250],
  p90: samples[450],
  p99: samples[495],
  dynasty: samples.filter((w) => w >= 140).length,
  perfect: samples.filter((w) => w >= 162).length,
  min: samples[0],
  max: samples[499],
  dreamWins: d.wins,
  dreamStrength: d.strength.toFixed(3),
});
