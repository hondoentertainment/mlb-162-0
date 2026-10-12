import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

test.describe('leaderboard states', () => {
  test('shows an offline state with retry when the board API fails', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/daily**', (route) => {
      calls += 1;
      return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
    });
    await openApp(page);
    await page.getByTestId('nav-leaderboard').click();
    const state = page.getByTestId('board-state');
    await expect(state).toHaveAttribute('data-kind', 'offline');
    await expect(state).toContainText(/offline/i);
    await expect(state).toContainText(/saved on this device/i);

    const before = calls;
    await page.getByTestId('board-retry').click();
    await expect.poll(() => calls).toBeGreaterThan(before);
  });

  test('shows an empty state with a Daily call to action', async ({ page }) => {
    await page.route('**/api/daily**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"entries":[]}' }),
    );
    await openApp(page);
    await page.getByTestId('nav-leaderboard').click();
    const state = page.getByTestId('board-state');
    await expect(state).toHaveAttribute('data-kind', 'empty');
    await expect(state).toContainText(/Nobody has posted today/i);
    await page.getByTestId('board-play-daily').click();
    await expect(page.getByTestId('draft')).toBeVisible();
    await expect(page.getByTestId('mode-label')).toHaveText('Daily');
  });

  test('local classic empty state starts a Classic draft', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('nav-leaderboard').click();
    await page.getByRole('button', { name: 'Local Classic' }).click();
    const state = page.getByTestId('board-state');
    await expect(state).toHaveAttribute('data-kind', 'empty');
    await expect(state).toContainText(/No qualifying seasons/i);
    await page.getByTestId('board-play-classic').click();
    await expect(page.getByTestId('draft')).toBeVisible();
    await expect(page.getByTestId('mode-label')).toHaveText('Classic');
  });
});
