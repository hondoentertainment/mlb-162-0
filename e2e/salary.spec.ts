import { expect, test } from '@playwright/test';
import { openApp, playFullDraft } from './helpers';

test.describe('salary cap', () => {
  test('shows cap budget and finishes a run', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-salary').click();
    await expect(page.getByTestId('mode-label')).toHaveText('Salary Cap');
    await expect(page.getByTestId('round-meta')).toContainText('$');
    await playFullDraft(page);
    await expect(page.getByTestId('result')).toBeVisible();
  });
});
