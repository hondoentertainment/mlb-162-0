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

  const ordered = useMemo(() => {
    return [...players].sort((a, b) => {
      const aFit = a.positions.some((p) => open.has(p)) ? 0 : 1;
      const bFit = b.positions.some((p) => open.has(p)) ? 0 : 1;
      if (aFit !== bFit) return aFit - bFit;
      return b.tier - a.tier || a.name.localeCompare(b.name);
    });
  }, [open, players]);

  if (!ordered.length) {
    return (
      <div className="empty-pool" data-testid="empty-pool">
        This franchise and decade have no players in the pool.
      </div>
    );
  }

  return (
    <div className="player-list" data-testid="player-list">
      {ordered.map((player) => {
        const eligible = player.positions.filter((p) => open.has(p));
        const salary = playerSalary(player);
        const unaffordable =
          salaryMode && salaryRemaining != null && salary > salaryRemaining;
        const noOpenSlot = eligible.length === 0;
        return (
          <div
            key={player.id}
            className={`player-card${unaffordable ? ' unaffordable' : ''}${noOpenSlot ? ' no-slot' : ''}`}
            data-testid={`player-${player.id}`}
            data-fits={noOpenSlot ? 'false' : 'true'}
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
                  {player.positions.map((p) => (
                    <span
                      key={p}
                      className={`badge${open.has(p) ? ' badge-open' : ''}`}
                    >
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
              <div className="player-note">Over remaining cap</div>
            ) : noOpenSlot ? (
              <div className="player-note" data-testid={`no-slot-${player.id}`}>
                No open slot for this player
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
