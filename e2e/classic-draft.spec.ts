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

  test('lists every player from the spun franchise-decade', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-classic').click();
    await spinAndWait(page);
    await expect(page.getByTestId('spin-pool-count')).toBeVisible();
    const countText = await page.getByTestId('spin-pool-count').innerText();
    const listed = Number.parseInt(countText, 10);
    expect(listed).toBeGreaterThan(0);
    await expect(page.getByTestId('player-list').locator('[data-testid^="player-"]')).toHaveCount(
      listed,
    );
    await expect(page.getByText(/All players from this franchise and decade/i)).toBeVisible();
    const hofHeading = page.getByTestId('hof-heading');
    if ((await hofHeading.count()) > 0) {
      await expect(hofHeading).toBeVisible();
      await expect(page.locator('[data-testid="player-list"] .player-card').first()).toHaveClass(
        /hof-card/,
      );
    }
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
