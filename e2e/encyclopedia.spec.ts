import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

test.describe('encyclopedia', () => {
  test('searches the pool and can hide stats', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('nav-encyclopedia').click();
    await expect(page.getByTestId('encyclopedia')).toBeVisible();
    await page.getByTestId('pedia-search').fill('Mantle');
    await expect(page.getByTestId('pedia-list')).toContainText('Mickey Mantle');
    await expect(page.getByTestId('pedia-list')).toContainText('/');
    await page.getByTestId('pedia-blind').click();
    await expect(page.getByTestId('pedia-list')).not.toContainText('/');
  });
});
