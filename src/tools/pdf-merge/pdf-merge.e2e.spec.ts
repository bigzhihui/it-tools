import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

// Page widths double as a label, so the merged order can be read back.
async function pdfWithPageWidths(widths: number[]) {
  const document = await PDFDocument.create();
  for (const width of widths) {
    document.addPage([width, 200]);
  }
  return Buffer.from(await document.save());
}

async function pageWidths(bytes: Buffer) {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map(page => page.getWidth());
}

test.describe('Tool - Merge PDF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf-merge');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Merge PDF - Thirteen Months Toolbox');
  });

  test('merges files in list order and downloads the result', async ({ page }) => {
    await page.locator('input[type=file]').setInputFiles([
      { name: 'a.pdf', mimeType: 'application/pdf', buffer: await pdfWithPageWidths([100]) },
      { name: 'b.pdf', mimeType: 'application/pdf', buffer: await pdfWithPageWidths([200, 300]) },
    ]);

    await expect(page.getByTestId('pdf-merge-item')).toHaveCount(2);
    await expect(page.getByTestId('pdf-merge-total')).toHaveText('3 pages in total');

    // Move b.pdf above a.pdf before merging.
    await page.getByTestId('pdf-merge-up').nth(1).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('pdf-merge-button').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('merged.pdf');
    const merged = await readFile(await download.path() as string);
    expect(await pageWidths(merged)).toEqual([200, 300, 100]);
  });

  test('flags a file that is not a PDF and keeps merging unavailable', async ({ page }) => {
    await page.locator('input[type=file]').setInputFiles([
      { name: 'a.pdf', mimeType: 'application/pdf', buffer: await pdfWithPageWidths([100]) },
      { name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf at all') },
    ]);

    await expect(page.getByTestId('pdf-merge-item')).toHaveCount(2);
    await expect(page.getByText('This file could not be read and may not be a valid PDF')).toBeVisible();

    const button = page.getByTestId('pdf-merge-button');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
