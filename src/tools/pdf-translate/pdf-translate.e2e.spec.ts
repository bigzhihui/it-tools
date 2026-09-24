import { expect, test } from '@playwright/test';

test.describe('Tool - PDF translation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf-translate');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('PDF translation - Thirteen Months Toolbox');
  });

  test('says that files go to the third-party service', async ({ page }) => {
    await expect(page.getByTestId('pdf-translate-notice')).toContainText('files are uploaded to the pdf2zh.com server');
  });

  test('links to the online service and the desktop app in new tabs', async ({ page }) => {
    const links = {
      'pdf-translate-open': 'https://pdf2zh.com',
      'pdf-translate-desktop': 'https://github.com/PDFMathTranslate/PDFMathTranslate/releases',
      'pdf-translate-repo': 'https://github.com/PDFMathTranslate/PDFMathTranslate',
    };

    for (const [testId, href] of Object.entries(links)) {
      const link = page.getByTestId(testId);
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener');
    }
  });
});
