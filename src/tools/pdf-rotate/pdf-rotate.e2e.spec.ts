import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

async function pdfWithPages(count: number) {
  const document = await PDFDocument.create();
  for (let i = 0; i < count; i++) {
    document.addPage([100, 200]);
  }
  return Buffer.from(await document.save());
}

async function rotationsOf(bytes: Buffer) {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map(page => page.getRotation().angle);
}

async function upload(page: Page, name: string, buffer: Buffer) {
  await page.locator('input[type=file]').setInputFiles({ name, mimeType: 'application/pdf', buffer });
}

async function download(page: Page) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('pdf-rotate-button').click();
  const download = await downloadPromise;
  return { filename: download.suggestedFilename(), bytes: await readFile(await download.path() as string) };
}

test.describe('Tool - Rotate PDF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf-rotate');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Rotate PDF - Thirteen Months Toolbox');
  });

  test('rotates every page clockwise by default', async ({ page }) => {
    await upload(page, 'scan.pdf', await pdfWithPages(3));
    await expect(page.getByTestId('pdf-rotate-summary')).toHaveText('3 pages will be rotated');

    const { filename, bytes } = await download(page);
    expect(filename).toBe('scan-rotated.pdf');
    expect(await rotationsOf(bytes)).toEqual([90, 90, 90]);
  });

  test('rotates only the selected pages', async ({ page }) => {
    await upload(page, 'scan.pdf', await pdfWithPages(4));

    await page.getByRole('button', { name: '180°' }).click();
    await page.getByRole('button', { name: 'Selected pages' }).click();
    await page.getByTestId('pdf-rotate-input').fill('2, 4');
    await expect(page.getByTestId('pdf-rotate-summary')).toHaveText('2 pages will be rotated');

    const { bytes } = await download(page);
    expect(await rotationsOf(bytes)).toEqual([0, 180, 0, 180]);
  });

  test('explains page numbers it cannot use and keeps the download unavailable', async ({ page }) => {
    await upload(page, 'scan.pdf', await pdfWithPages(3));

    await page.getByRole('button', { name: 'Selected pages' }).click();
    await expect(page.getByTestId('pdf-rotate-button')).toHaveAttribute('aria-disabled', 'true');

    await page.getByTestId('pdf-rotate-input').fill('4');
    await expect(page.getByText('Page numbers must be from 1 to 3')).toBeVisible();
    await expect(page.getByTestId('pdf-rotate-button')).toHaveAttribute('aria-disabled', 'true');
  });
});
