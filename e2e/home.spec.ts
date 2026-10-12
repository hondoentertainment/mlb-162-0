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

    await page.getByTestId('nav-encyclopedia').click();
    await expect(page.getByRole('heading', { name: /Encyclopedia/i })).toBeVisible();
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

  test('lays out six equal mode tiles with the code entry below', async ({ page }) => {
    await openApp(page);
    const tiles = page.locator('[data-testid="home"] .mode-grid-instant > .mode-card');
    await expect(tiles).toHaveCount(6);
    const widths = await tiles.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().width)),
    );
    expect(new Set(widths).size).toBe(1);
    await expect(page.getByTestId('challenge-join-row')).toBeVisible();
    await expect(page.getByLabel('Have a code?')).toBeVisible();
    await expect(page.getByLabel('Board name')).toBeVisible();
    await expect(page.getByTestId('display-name')).toContainText(/global Daily/i);
  });

  test('rejects a bad challenge code on submit', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('challenge-input').fill('!');
    await page.getByTestId('challenge-input').press('Enter');
    await expect(page.getByText(/valid challenge code/i)).toBeVisible();
    await expect(page.getByTestId('home')).toBeVisible();
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
