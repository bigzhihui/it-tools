import { expect, test } from '@playwright/test';

test.describe('Tool - Token generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/token-generator');
  });

  test('Has title', async ({ page }) => {
    await expect(page).toHaveTitle('Token generator - Thirteen Months Toolbox');
  });

  test('New token on refresh', async ({ page }) => {
    const input = page.locator('[data-test-id="token-input"] textarea');
    const initialToken = await input.inputValue();
    await page.locator('[data-test-id="refresh-button"]').click();
    const newToken = await input.inputValue();

    expect(newToken).not.toEqual(initialToken);
  });
});
