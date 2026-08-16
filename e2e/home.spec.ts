import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

async function expectHomeFrom(page: Parameters<typeof openApp>[0]) {
  await expect(page.getByTestId('app-header')).toBeVisible();
  await page.getByTestId('nav-home').click();
  await expect(page.getByTestId('home')).toBeVisible();
  await expect(page.getByTestId('app-header')).toHaveCount(0);
}

test.describe('home', () => {
  test('shows brand and mode entry points', async ({ page }) => {
    await openApp(page);
    await expect(page.getByTestId('brand')).toContainText('162');
    await expect(page.getByTestId('mode-classic')).toBeVisible();
    await expect(page.getByTestId('mode-daily')).toBeVisible();
    await expect(page.getByTestId('mode-challenge')).toBeVisible();
    await expect(page.getByTestId('mode-diamondiq')).toBeVisible();
    await expect(page.getByTestId('mode-salary')).toBeVisible();
    await expect(page.getByTestId('mode-ironman')).toBeVisible();
    await expect(page.getByTestId('mode-franchise')).toBeVisible();
    await expect(page.getByTestId('mode-eralock')).toBeVisible();
    await expect(page.getByTestId('franchise-grid')).toBeVisible();
    await expect(page.getByTestId('decade-grid')).toBeVisible();
    await expect(page.getByTestId('app-header')).toHaveCount(0);
  });

  test('opens how to play, leaderboards, and career', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('nav-how').click();
    await expect(page.getByRole('heading', { name: /How to play/i })).toBeVisible();
    await expectHomeFrom(page);

    await page.getByTestId('nav-leaderboard').click();
    await expect(page.getByRole('heading', { name: /Leaderboards/i })).toBeVisible();
    await expectHomeFrom(page);

    await page.getByTestId('nav-career').click();
    await expect(page.getByTestId('career')).toBeVisible();
    await expectHomeFrom(page);
  });

  test('scrolls to top so the home header is visible', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('nav-how').scrollIntoViewIfNeeded();
    await page.getByTestId('nav-how').click();
    await expect(page.getByTestId('app-header')).toBeInViewport();
    await expect(page.getByRole('heading', { name: /How to play/i })).toBeInViewport();
    await expectHomeFrom(page);
  });

  test('keeps franchise setup on home and returns home from draft', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-franchise').click();
    await expect(page.getByTestId('franchise-select')).toBeVisible();
    await expect(page.getByTestId('home')).toBeVisible();
    await expect(page.getByTestId('app-header')).toHaveCount(0);

    await page.getByTestId('mode-classic').click();
    await expect(page.getByTestId('draft')).toBeVisible();
    await page.getByTestId('header-home').click();
    await expect(page.getByTestId('home')).toBeVisible();
    await expect(page.getByTestId('app-header')).toHaveCount(0);
  });
});
