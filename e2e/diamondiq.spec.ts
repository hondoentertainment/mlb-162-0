import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

test.describe('diamond iq', () => {
  test('hides batting/pitching lines while drafting', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-diamondiq').click();
    await page.getByTestId('spin-button').click();
    await expect(page.getByTestId('player-list')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.stats')).toHaveCount(0);
    await expect(page.getByTestId('mode-label')).toHaveText('Diamond IQ');
  });
});
