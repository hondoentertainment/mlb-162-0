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

  test('renders a share card whose grade pill stays inside its bounds', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('mode-classic').click();
    await playFullDraft(page);

    const canvas = page.locator('#share-card-preview canvas');
    await expect(canvas).toBeVisible();
    await expect
      .poll(async () =>
        canvas.evaluate((el) => {
          const ctx = (el as HTMLCanvasElement).getContext('2d')!;
          const px = (x: number, y: number) => Array.from(ctx.getImageData(x, y, 1, 1).data);
          const dark = (c: number[]) => c[0]! < 60 && c[1]! < 80 && c[2]! < 60;
          const bright = (c: number[]) => c[0]! + c[1]! + c[2]! > 250;
          return {
            // Inside the border, well away from any shape: must be the dark backdrop.
            corner: dark(px(70, 70)),
            // Between the record and the roster grid on the right: backdrop too.
            open: dark(px(1800, 500)),
            // Centre of the grade pill: must be the accent colour.
            pill: bright(px(300, 619)),
          };
        }),
      )
      .toEqual({ corner: true, open: true, pill: true });
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
