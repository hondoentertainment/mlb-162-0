import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

test.describe('install tip', () => {
  test('appears when the browser can install and can be dismissed', async ({ page }) => {
    await openApp(page);
    await expect(page.getByTestId('install-tip')).toHaveCount(0);

    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt', { cancelable: true });
      Object.assign(event, {
        prompt: async () => undefined,
        userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'test' }),
      });
      window.dispatchEvent(event);
    });

    await expect(page.getByTestId('install-tip')).toBeVisible();
    await expect(page.getByTestId('install-accept')).toBeVisible();
    await page.getByTestId('install-dismiss').click();
    await expect(page.getByTestId('install-tip')).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId('home')).toBeVisible();
    await expect(page.getByTestId('install-tip')).toHaveCount(0);
  });
});

test.describe('daily history', () => {
  test('shows the last 14 days on Career, including stored results', async ({ page }) => {
    await page.addInitScript(() => {
      window.__E2E__ = true;
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(`${today}T12:00:00.000Z`);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yKey = yesterday.toISOString().slice(0, 10);
      localStorage.setItem(
        'mlb1620_daily_history',
        JSON.stringify([
          { dateKey: yKey, wins: 112, losses: 50, gradeLabel: 'CONTENDER' },
        ]),
      );
    });
    await page.goto('/');
    await expect(page.getByTestId('home')).toBeVisible();
    await expect(page.getByTestId('daily-history-home')).toBeVisible();

    await page.getByTestId('nav-career').click();
    await expect(page.getByTestId('career')).toBeVisible();
    await expect(page.getByTestId('daily-history')).toBeVisible();
    await expect(page.getByTestId('daily-history-list')).toContainText('112-50');
    await expect(page.getByTestId('daily-history-list')).toContainText('CONTENDER');
  });
});
