import { expect, test } from '@playwright/test';

test.describe('Tool guide', () => {
  test('is shown below a covered tool, with its questions', async ({ page }) => {
    await page.goto('/jwt-parser');

    const guide = page.getByTestId('tool-guide');
    await expect(guide).toBeVisible();
    await expect(guide.getByRole('heading', { level: 2 })).toHaveText(['About this tool', 'How to use', 'FAQ']);
    await expect(guide.locator('dt')).toHaveCount(3);
    await expect(guide.locator('dt').first()).toHaveText('Does this tool verify the signature?');
  });

  test('is absent on a tool without a guide', async ({ page }) => {
    await page.goto('/lorem-ipsum-generator');

    // Wait for the tool to mount so the absence check is meaningful.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('tool-guide')).toHaveCount(0);
  });

  test.describe('in Chinese', () => {
    test.use({ locale: 'zh-CN', storageState: { cookies: [], origins: [] } });

    test('renders the Chinese text', async ({ page }) => {
      await page.goto('/jwt-parser');

      const guide = page.getByTestId('tool-guide');
      await expect(guide.getByRole('heading', { level: 2 })).toHaveText(['工具介绍', '使用方法', '常见问题']);
      await expect(guide.locator('dt').first()).toHaveText('这个工具会验证 JWT 的签名吗？');
    });
  });
});
