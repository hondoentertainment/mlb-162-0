import { useMemo, useState } from 'react';
import type { Position } from '../config/constants';
import { formatSalary, playerSalary } from '../game/salary';
import { personKey } from '../game/spin';
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
  const drafted = useMemo(
    () => new Set(roster.filter((s) => s.player).map((s) => personKey(s.player!))),
    [roster],
  );
  const [filter, setFilter] = useState<Position | 'all'>('all');
  const [showRest, setShowRest] = useState(false);

  const groups = useMemo(() => {
    const available: Player[] = [];
    const already: Player[] = [];
    const rest: Player[] = [];
    for (const player of players) {
      if (drafted.has(personKey(player))) {
        already.push(player);
        continue;
      }
      const eligible = player.positions.filter((p) => open.has(p));
      if (eligible.length) available.push(player);
      else rest.push(player);
    }
    const byTier = (a: Player, b: Player) => b.tier - a.tier || a.name.localeCompare(b.name);
    return {
      available: available.sort(byTier),
      already: already.sort(byTier),
      rest: rest.sort(byTier),
    };
  }, [drafted, open, players]);

  const filteredAvailable =
    filter === 'all'
      ? groups.available
      : groups.available.filter((p) => p.positions.includes(filter));

  if (!players.length) {
    return (
      <div className="empty-pool" data-testid="empty-pool">
        This franchise and decade have no players in the pool.
      </div>
    );
  }

  const renderCard = (player: Player, kind: 'available' | 'already' | 'rest') => {
    const eligible = player.positions.filter((p) => open.has(p));
    const salary = playerSalary(player);
    const unaffordable = salaryMode && salaryRemaining != null && salary > salaryRemaining;
    const already = kind === 'already';
    const noOpenSlot = kind === 'rest';
    return (
      <div
        key={player.id}
        className={`player-card${unaffordable ? ' unaffordable' : ''}${noOpenSlot || already ? ' no-slot' : ''}`}
        data-testid={`player-${player.id}`}
        data-fits={kind === 'available' && !unaffordable ? 'true' : 'false'}
        data-already={already ? 'true' : 'false'}
      >
        <div className="player-top">
          <div>
            <div className="player-name">{player.name}</div>
            <div className="badges">
              <span className="tier-dots" aria-label={`Tier ${player.tier}`}>
                {tierDots(player.tier)}
              </span>
              {player.hof && <span className="badge hof">HOF</span>}
              {salaryMode && <span className="badge salary">{formatSalary(salary)}</span>}
              {player.positions.map((p) => (
                <span key={p} className={`badge${open.has(p) ? ' badge-open' : ''}`}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {showStats && (
          <div className="stats">
            <span>{player.pitching ? formatPitching(player) : formatBatting(player)}</span>
            <span className="stats-approx">approx</span>
          </div>
        )}

        {already ? (
          <div className="player-note" data-testid={`already-${player.id}`}>
            Already on your roster
          </div>
        ) : unaffordable ? (
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
  };

  const openList = [...open];

  return (
    <div className="player-list" data-testid="player-list">
      {openList.length > 1 && groups.available.length > 0 && (
        <div className="pos-filter" data-testid="pos-filter">
          <button
            type="button"
            className={`chip${filter === 'all' ? ' chip-on' : ''}`}
            onClick={() => setFilter('all')}
          >
            All fits
          </button>
          {openList.map((pos) => (
            <button
              key={pos}
              type="button"
              className={`chip${filter === pos ? ' chip-on' : ''}`}
              onClick={() => setFilter(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
      )}

      {filteredAvailable.map((p) => renderCard(p, 'available'))}
      {groups.already.map((p) => renderCard(p, 'already'))}

      {groups.rest.length > 0 && (
        <div className="player-rest">
          <button
            type="button"
            className="btn btn-ghost"
            data-testid="toggle-rest"
            onClick={() => setShowRest((v) => !v)}
          >
            {showRest ? 'Hide' : 'Show'} {groups.rest.length} who do not fit an open slot
          </button>
          {showRest && groups.rest.map((p) => renderCard(p, 'rest'))}
        </div>
      )}
    </div>
  );
}
