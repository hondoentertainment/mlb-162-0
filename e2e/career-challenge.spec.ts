import { expect, test } from '@playwright/test';
import { openApp, playFullDraft } from './helpers';

test.describe('career & challenge', () => {
  test('career screen opens from home', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('nav-career').click();
    await expect(page.getByTestId('career')).toBeVisible();
    await expect(page.getByTestId('achievement-list')).toBeVisible();
  });

  test('new challenge shows code and completes a season', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('challenge-new').click();
    await expect(page.getByTestId('draft')).toBeVisible();
    await expect(page.getByTestId('challenge-code')).toBeVisible();
    const code = (await page.getByTestId('challenge-code').innerText()).trim();
    expect(code.length).toBeGreaterThanOrEqual(6);

    await playFullDraft(page);
    await expect(page.getByTestId('result-challenge-code')).toContainText(code);
    await expect(page.getByTestId('new-achievements')).toBeVisible();

    await page.getByRole('button', { name: 'Career' }).click();
    await expect(page.getByTestId('career')).toBeVisible();
    await expect(page.getByTestId('ach-first_season')).toHaveClass(/unlocked/);
  });

  test('join challenge with code reaches draft', async ({ page }) => {
    await openApp(page);
    await page.getByTestId('challenge-new').click();
    const code = (await page.getByTestId('challenge-code').innerText()).trim();
    await page.getByTestId('quit').click();
    await expect(page.getByTestId('home')).toBeVisible();

    await page.getByTestId('challenge-input').fill(code);
    await page.getByTestId('challenge-join').click();
    await expect(page.getByTestId('draft')).toBeVisible();
    await expect(page.getByTestId('challenge-code')).toHaveText(code);
  });
});
