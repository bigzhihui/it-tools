import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

// Page widths double as a label, so the pages of the result can be read back.
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

async function upload(page: Page, name: string, buffer: Buffer) {
  await page.locator('input[type=file]').setInputFiles({ name, mimeType: 'application/pdf', buffer });
}

async function download(page: Page) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('pdf-extract-pages-button').click();
  const download = await downloadPromise;
  return { filename: download.suggestedFilename(), bytes: await readFile(await download.path() as string) };
}

test.describe('Tool - Extract or delete PDF pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf-extract-pages');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Extract or delete PDF pages - Thirteen Months Toolbox');
  });

  test('keeps the listed pages, in the order typed', async ({ page }) => {
    await upload(page, 'report.pdf', await pdfWithPageWidths([100, 200, 300, 400, 500]));
    await expect(page.getByTestId('pdf-extract-pages-count')).toContainText('5 pages');

    await page.getByTestId('pdf-extract-pages-input').fill('5, 2-3');
    await expect(page.getByTestId('pdf-extract-pages-summary')).toHaveText('3 pages in the new file');

    const { filename, bytes } = await download(page);
    expect(filename).toBe('report-extracted.pdf');
    expect(await pageWidths(bytes)).toEqual([500, 200, 300]);
  });

  test('deletes the listed pages and keeps the rest', async ({ page }) => {
    await upload(page, 'scan.pdf', await pdfWithPageWidths([100, 200, 300, 400, 500]));

    await page.getByRole('button', { name: 'Delete these pages' }).click();
    await page.getByTestId('pdf-extract-pages-input').fill('1，3');
    await expect(page.getByTestId('pdf-extract-pages-summary')).toHaveText('3 pages in the new file');

    const { filename, bytes } = await download(page);
    expect(filename).toBe('scan-edited.pdf');
    expect(await pageWidths(bytes)).toEqual([200, 400, 500]);
  });

  test('explains page numbers it cannot use and keeps the download unavailable', async ({ page }) => {
    await upload(page, 'report.pdf', await pdfWithPageWidths([100, 200, 300]));
    const button = page.getByTestId('pdf-extract-pages-button');

    await page.getByTestId('pdf-extract-pages-input').fill('2-9');
    await expect(page.getByText('Page numbers must be from 1 to 3')).toBeVisible();
    await expect(button).toHaveAttribute('aria-disabled', 'true');

    await page.getByRole('button', { name: 'Delete these pages' }).click();
    await page.getByTestId('pdf-extract-pages-input').fill('1-3');
    await expect(page.getByText('You cannot delete every page. Keep at least one.')).toBeVisible();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  test('flags a file that is not a PDF', async ({ page }) => {
    await upload(page, 'notes.pdf', Buffer.from('not a pdf at all'));

    await expect(page.getByText('This file could not be read and may not be a valid PDF')).toBeVisible();
    await expect(page.getByTestId('pdf-extract-pages-input')).toHaveCount(0);
  });
});
