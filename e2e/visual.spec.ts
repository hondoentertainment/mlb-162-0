import { expect, test, type Page } from '@playwright/test';
import { draftOnePick, openApp, spinAndWait } from './helpers';

/**
 * Visual regression baselines for the three screens every player sees.
 *
 * Determinism:
 * - Challenge mode with a fixed code seeds every spin, and picks are scripted,
 *   so Draft and Result render the same roster every run.
 * - All /api calls are stubbed so the shared boards never hit the network.
 * - Reduced motion plus `animations: 'disabled'` freezes reels, reveals and
 *   the grade pop before capture.
 *
 * Baselines are rendered on Linux Chromium (what CI runs). Regenerate with
 * `npm run e2e:update-snapshots` on Linux; other platforms skip these tests
 * unless VISUAL=1 is set, because font rasterisation differs per OS.
 */

// No leading "A": it is the zero digit of the code alphabet and gets normalised away.
const CHALLENGE_CODE = 'BCDEFGH';

const SNAPSHOT_OPTIONS = {
  fullPage: true,
  animations: 'disabled',
  caret: 'hide',
  maxDiffPixelRatio: 0.01,
} as const;

test.use({ reducedMotion: 'reduce' });

test.skip(
  process.platform !== 'linux' && !process.env.VISUAL,
  'Visual baselines are rendered on Linux; set VISUAL=1 to run anyway',
);

async function stubBoards(page: Page) {
  // Routes match newest-first, so the catch-all goes in before the specifics.
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
  await page.route('**/api/daily**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ entries: [] }),
    }),
  );
  await page.route('**/api/challenge-board**', (route) => {
    if (route.request().method() !== 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        entries: [
          {
            id: 'c_1',
            wins: 118,
            losses: 44,
            gradeLabel: 'Dynasty',
            rosterNames: ['Willie Mays', 'Hank Aaron', 'Sandy Koufax', 'Johnny Bench'],
            createdAt: '2026-01-01T00:00:00.000Z',
            displayName: 'Yogi',
          },
          {
            id: 'c_2',
            wins: 97,
            losses: 65,
            gradeLabel: 'Contender',
            rosterNames: ['Cal Ripken Jr.', 'Tony Gwynn', 'Greg Maddux'],
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      }),
    });
  });
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function joinFixedChallenge(page: Page) {
  await page.getByTestId('challenge-input').fill(CHALLENGE_CODE);
  await page.getByTestId('challenge-join').click();
  await expect(page.getByTestId('draft')).toBeVisible();
  await expect(page.getByTestId('challenge-code')).toHaveText(CHALLENGE_CODE);
}

test.describe('visual', () => {
  test.beforeEach(async ({ page }) => {
    await stubBoards(page);
    await openApp(page);
  });

  test('home', async ({ page }) => {
    await settle(page);
    await expect(page).toHaveScreenshot('home.png', SNAPSHOT_OPTIONS);
  });

  test('draft after the first spin', async ({ page }) => {
    await joinFixedChallenge(page);
    await spinAndWait(page);
    await expect(page.getByTestId('player-list')).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('draft.png', SNAPSHOT_OPTIONS);
  });

  test('result with share card and rematch board', async ({ page }) => {
    await joinFixedChallenge(page);
    for (let round = 0; round < 9; round++) {
      await spinAndWait(page);
      await draftOnePick(page);
    }
    await expect(page.getByTestId('result')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('final-grade')).toBeVisible();
    await expect(page.getByTestId('rematch-list')).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('result.png', SNAPSHOT_OPTIONS);
  });
});
