import { expect, test } from '@playwright/test';

test.describe('Tool - More PDF tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/more-pdf-tools');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('More PDF tools - Thirteen Months Toolbox');
  });

  test('says that files are not uploaded', async ({ page }) => {
    await expect(page.getByTestId('more-pdf-tools-privacy')).toContainText('never uploaded to any server');
  });

  test('links to the PDF site and its source code in new tabs', async ({ page }) => {
    const links = {
      'more-pdf-tools-open': 'https://pdf.afeiii.com',
      'more-pdf-tools-repo': 'https://github.com/bigzhihui/bentopdf',
    };

    for (const [testId, href] of Object.entries(links)) {
      const link = page.getByTestId(testId);
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener');
    }
  });
});
