import { expect, test } from '@playwright/test';
import { draftOnePick, openApp, playFullDraft, spinAndWait } from './helpers';

test.describe('era lock', () => {
  test('locks one decade for the whole draft', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-eralock').click();
    await expect(page.getByTestId('decade-grid')).toBeVisible();
    await page.getByTestId('decade-1990s').click();

    await expect(page.getByTestId('draft')).toBeVisible();
    await expect(page.getByTestId('mode-label')).toHaveText('Era Lock');
    await expect(page.getByTestId('locked-decade')).toHaveText('1990s');
    await expect(page.getByTestId('spin-button')).toHaveText('Spin franchise');

    for (let i = 0; i < 3; i++) {
      await spinAndWait(page);
      await expect(page.getByTestId('spin-result')).toContainText('1990s');
      await page.getByTestId('undo-pick').waitFor();
      const draftable = page
        .locator('[data-testid="player-list"] .player-card [data-testid^="draft-"]')
        .last();
      await draftable.click();
      await expect(page.getByTestId('spin-result')).toBeHidden();
    }
  });
});

test.describe('ironman', () => {
  test('offers no skips, no undo, and completes a season', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-ironman').click();
    await expect(page.getByTestId('draft')).toBeVisible();
    await expect(page.getByTestId('mode-label')).toHaveText('Ironman');

    await expect(page.getByTestId('undo-pick')).toHaveCount(0);
    await spinAndWait(page);
    await expect(page.getByTestId('skip-team')).toHaveCount(0);
    await expect(page.getByTestId('skip-decade')).toHaveCount(0);
    await expect(page.getByTestId('respin')).toHaveCount(0);
    await draftOnePick(page);

    // Eight rounds remain after the pick above
    for (let round = 0; round < 8; round++) {
      await spinAndWait(page);
      await draftOnePick(page);
    }

    await expect(page.getByTestId('result')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('final-record')).toHaveText(/\d+-\d+/);
  });
});

test.describe('result breakdown', () => {
  test('shows how each slot scored against the roster average', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-classic').click();
    await playFullDraft(page);

    const chart = page.getByTestId('contributions');
    await chart.scrollIntoViewIfNeeded();
    await expect(chart).toBeVisible();
    await expect(chart.locator('li')).toHaveCount(9);
    for (const position of ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'SP']) {
      await expect(page.getByTestId(`contrib-${position}`)).toBeVisible();
    }
  });
});
