import { expect, test } from '@playwright/test';

// The shared config pre-seeds `locale=en`. These tests need the real first-visit
// state instead, where nothing is stored and the app falls back to Chinese.
const firstVisit = { cookies: [], origins: [] };

test.describe('Locale hint - non-Chinese browser', () => {
  test.use({ locale: 'en-GB', storageState: firstVisit });

  test('offers English and switches when accepted', async ({ page }) => {
    await page.goto('/');

    const hint = page.getByTestId('locale-hint');
    await expect(hint).toBeVisible();

    await page.getByTestId('locale-hint-switch').click();

    await expect(hint).toBeHidden();
    await expect(page).toHaveTitle(/Thirteen Months Toolbox/);
    expect(await page.evaluate(() => localStorage.getItem('locale'))).toBe('en');
  });

  test('stays hidden after being dismissed', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('locale-hint-dismiss').click();

    await page.reload();
    // Wait for the app to mount, otherwise "hidden" would pass trivially.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('locale-hint')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('locale'))).toBe('zh');
  });
});

test.describe('Locale hint - Chinese browser', () => {
  test.use({ locale: 'zh-CN', storageState: firstVisit });

  test('is not shown', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('locale-hint')).toHaveCount(0);
  });
});
