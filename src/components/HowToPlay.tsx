import { useGame } from '../state/gameStore';

export function HowToPlay() {
  const { setScreen } = useGame();

  return (
    <section className="howto panel">
      <button type="button" className="btn btn-ghost back-link" onClick={() => setScreen('home')}>
        ← Back
      </button>
      <h2 className="headline" style={{ marginTop: 0 }}>
        How to play 162-0
      </h2>
      <p>
        Assemble a nine-player all-time roster across every era of MLB history, then simulate a
        162-game season. Can your dream team go 162-0?
      </p>

      <h3>The nine positions</h3>
      <p>C · 1B · 2B · 3B · SS · LF · CF · RF · SP</p>
      <p>
        Every player is locked to positions they actually played. Multi-position stars can fill any
        open eligible slot.
      </p>

      <h3>The spin</h3>
      <p>
        Each round, a decade and franchise are drawn at random. Pick one available legend from that
        team-era and assign them to an open slot. Nine rounds, nine legends.
      </p>

      <h3>Skips</h3>
      <p>
        Classic and Diamond IQ start with one team skip and one decade skip. Daily Challenge has no
        skips — everyone faces the same draws.
      </p>

      <h3>Modes</h3>
      <ul>
        <li>
          <strong>Classic</strong> — stats visible (AVG/OBP/SLG or ERA/WHIP/K9), tiers, HOF badges.
        </li>
        <li>
          <strong>Diamond IQ</strong> — stats hidden. Draft from memory.
        </li>
        <li>
          <strong>Daily</strong> — seeded by UTC date. One attempt per day.
        </li>
      </ul>

      <h3>Grades</h3>
      <ul>
        <li>PERFECTION — 162-0</li>
        <li>DYNASTY — 140+</li>
        <li>CONTENDER — 100–139</li>
        <li>PLAYOFFS — 85–99</li>
        <li>REBUILDING — under 85</li>
      </ul>
      <p>Balance beats one superstar and empty slots. Incomplete rosters are capped hard.</p>
    </section>
  );
}
