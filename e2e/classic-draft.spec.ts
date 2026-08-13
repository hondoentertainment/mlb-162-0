import { expect, test } from '@playwright/test';
import { draftOnePick, openApp, playFullDraft, spinAndWait } from './helpers';

test.describe('classic draft', () => {
  test('completes nine rounds and shows a result', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-classic').click();
    await expect(page.getByTestId('draft')).toBeVisible();
    await expect(page.getByTestId('mode-label')).toHaveText('Classic');
    await playFullDraft(page);
    await expect(page.getByTestId('final-record')).toHaveText(/\d+-\d+/);
  });

  test('undoes the last pick and restores that spin', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-classic').click();
    await expect(page.getByTestId('undo-pick')).toBeVisible();
    await expect(page.getByTestId('undo-pick')).toBeDisabled();

    await spinAndWait(page);
    await draftOnePick(page);

    const filled = page.locator('[data-testid^="slot-"][data-filled="true"]');
    await expect(filled).toHaveCount(1);
    const slotTestId = await filled.getAttribute('data-testid');
    expect(slotTestId).toBeTruthy();

    await expect(page.getByTestId('undo-pick')).toBeEnabled();
    await page.getByTestId('undo-pick').click();

    await expect(page.getByTestId(slotTestId!)).toHaveAttribute('data-filled', 'false');
    await expect(page.getByTestId('spin-result')).toBeVisible();
    await expect(page.getByTestId('undo-pick')).toBeDisabled();

    await draftOnePick(page);
    await expect(filled).toHaveCount(1);
  });

  test('does not offer undo in Daily Challenge', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-daily').click();
    await expect(page.getByTestId('draft')).toBeVisible();
    await expect(page.getByTestId('mode-label')).toHaveText('Daily');
    await expect(page.getByTestId('undo-pick')).toHaveCount(0);

    await spinAndWait(page);
    await draftOnePick(page);
    await expect(page.getByTestId('undo-pick')).toHaveCount(0);
  });
});
