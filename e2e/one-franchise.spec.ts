import { expect, test } from '@playwright/test';
import { openApp, openMoreModes, playFullDraft } from './helpers';

test.describe('one franchise', () => {
  test('locks a franchise and completes a draft', async ({ page }) => {
    await openApp(page);
    await openMoreModes(page);
    await page.getByTestId('mode-franchise').click();
    await expect(page.getByTestId('franchise-grid')).toBeVisible();
    await page.getByTestId('franchise-nyy').click();
    await expect(page.getByTestId('draft')).toBeVisible();
    await expect(page.getByTestId('mode-label')).toHaveText('One Franchise');
    await expect(page.getByTestId('round-meta')).toContainText('Yankees');
    await expect(page.getByTestId('spin-button')).toHaveText('Spin decade');
    await playFullDraft(page);
    await expect(page.getByTestId('result')).toBeVisible();
  });
});
