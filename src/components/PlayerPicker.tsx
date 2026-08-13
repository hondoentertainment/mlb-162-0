import { useMemo } from 'react';
import type { Position } from '../config/constants';
import { formatSalary, playerSalary } from '../game/salary';
import type { Player, RosterSlot } from '../types/game';

function formatBatting(p: Player): string {
  const b = p.batting;
  if (!b) return '';
  return `.${String(Math.round(b.avg * 1000)).padStart(3, '0')} / .${String(Math.round(b.obp * 1000)).padStart(3, '0')} / .${String(Math.round(b.slg * 1000)).padStart(3, '0')}`;
}

function formatPitching(p: Player): string {
  const s = p.pitching;
  if (!s) return '';
  return `${s.era.toFixed(2)} ERA · ${s.whip.toFixed(2)} WHIP · ${s.k9.toFixed(1)} K/9`;
}

function tierDots(tier: number): string {
  return '●'.repeat(tier) + '○'.repeat(5 - tier);
}

export function PlayerPicker({
  players,
  roster,
  showStats,
  salaryMode,
  salaryRemaining,
  onPick,
}: {
  players: Player[];
  roster: RosterSlot[];
  showStats: boolean;
  salaryMode: boolean;
  salaryRemaining: number | null;
  onPick: (player: Player, position: Position) => void;
}) {
  const open = useMemo(
    () => new Set(roster.filter((s) => !s.player).map((s) => s.position)),
    [roster],
  );

  if (!players.length) {
    return (
      <div className="empty-pool" data-testid="empty-pool">
        This franchise and decade have no legal picks for your open positions.
      </div>
    );
  }

  return (
    <div className="player-list" data-testid="player-list">
      {players.map((player) => {
        const eligible = player.positions.filter((p) => open.has(p));
        const salary = playerSalary(player);
        const unaffordable =
          salaryMode && salaryRemaining != null && salary > salaryRemaining;
        return (
          <div
            key={player.id}
            className={`player-card ${unaffordable ? 'unaffordable' : ''}`}
            data-testid={`player-${player.id}`}
          >
            <div className="player-top">
              <div>
                <div className="player-name">{player.name}</div>
                <div className="badges">
                  <span className="tier-dots" aria-label={`Tier ${player.tier}`}>
                    {tierDots(player.tier)}
                  </span>
                  {player.hof && <span className="badge hof">HOF</span>}
                  {salaryMode && (
                    <span className="badge salary">{formatSalary(salary)}</span>
                  )}
                  {eligible.map((p) => (
                    <span key={p} className="badge">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {showStats && (
              <div className="stats">
                {player.pitching ? (
                  <span>{formatPitching(player)}</span>
                ) : (
                  <span>{formatBatting(player)}</span>
                )}
              </div>
            )}

            {unaffordable ? (
              <div className="stats" style={{ opacity: 0.7 }}>
                Over remaining cap
              </div>
            ) : (
              <div className="pos-picks">
                {eligible.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    data-testid={`draft-${player.id}-${pos}`}
                    onClick={() => onPick(player, pos)}
                  >
                    Draft to {pos}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
