import { SALARY_CAP_M, formatSalary } from '../game/salary';

export function HowToPlay() {
  return (
    <section className="howto panel" data-testid="how">
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
        Each round, a decade and franchise are drawn at random. You see every player from that
        team-era — a starting nine plus bench at every club era. Names that fit an open slot sit on top,
        with Hall of Famers first; filter by remaining position if the list is long. Someone already
        on your roster stays
        visible and marked, so a dead Daily or Ironman spin is obvious. Draft one legend into an
        open eligible position. Nine rounds, nine legends.
      </p>

      <h3>Skips, redraws, and undo</h3>
      <p>
        Classic, Diamond IQ, and Salary Cap start with one team skip and one decade skip. If a spin
        has no legal picks for your open slots, those modes redraw automatically (or tap Redraw now).
        You can also undo the last pick and choose again from that same spin.
      </p>
      <p>
        Daily Challenge, Challenge a friend, and Ironman have no skips, no redraws, and no undo.
        In the two seeded modes that keeps everyone on the same draws; in Ironman it is the whole
        point.
      </p>

      <h3>Reading the result</h3>
      <p>
        Every finished season breaks down where the wins came from: each slot is scored against
        your roster average, so you can see which picks carried the year and which dragged it
        down.
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
          <strong>Salary Cap</strong> — {formatSalary(SALARY_CAP_M)} budget. Tier and HOF drive
          salary; you cannot draft above the remaining cap.
        </li>
        <li>
          <strong>One Franchise</strong> — lock a club, spin decades only, two decade skips.
          Yankees, Braves, Dodgers, and Red Sox are the deepest books; Orioles, Cardinals,
          Giants, and Reds are right behind.
        </li>
        <li>
          <strong>Era Lock</strong> — lock a decade, spin franchises only. Two team skips, no
          decade skips.
        </li>
        <li>
          <strong>Ironman</strong> — Classic rules with nothing to fall back on: no skips, no
          redraws, no undo.
        </li>
        <li>
          <strong>Daily</strong> — seeded by UTC date. One attempt per day. Results post to the
          global daily board when available. The last 14 days stay on this device so you can see
          the streak. Keep it going by playing consecutive UTC days.
        </li>
        <li>
          <strong>Challenge</strong> — share a code so friends face the same spins. No skips.
          Finishes land on a rematch board for that code.
        </li>
      </ul>

      <h3>Career & achievements</h3>
      <p>
        Every finished season updates local career stats, a season log (record, mode, roster),
        daily streak, and badges. Optional board names appear on Daily and Challenge boards —
        no account. Dynasty and Perfection get a celebration on the result screen. Progress stays
        on this device. Add 162-0 to your Home Screen when the tip appears.
      </p>

      <h3>Choosing a franchise</h3>
      <p>
        One Franchise is the only mode where you pick the club. The Yankees, Braves, Dodgers, and
        Red Sox have the most Hall of Famers and star decades. Mariners 1990s, Dodgers 1950s, and
        Braves 1990s are the single spins you most want to see in Classic or Era Lock. Expansion
        clubs (Marlins, Rays, Diamondbacks, Rockies) field a full nine every era but have thinner
        Hall of Fame lists.
      </p>

      <h3>Grades</h3>
      <ul>
        <li>PERFECTION — 162-0</li>
        <li>DYNASTY — 140+</li>
        <li>CONTENDER — 100–139</li>
        <li>PLAYOFFS — 85–99</li>
        <li>REBUILDING — under 85</li>
      </ul>
      <p>Balance beats one superstar and empty slots. Incomplete rosters are capped hard.</p>
      <p>
        Batting and pitching lines are era approximations, marked “approx” in the draft. Hall of
        Fame badges are for actual HOFers. A real stat dataset is still on the roadmap.
      </p>
    </section>
  );
}
