import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { unzipSync } from 'fflate';
import type { Download, Page } from '@playwright/test';
import { PDFDocument, rgb } from 'pdf-lib';

// Pages of known sizes in points, each with something drawn on it.
async function pdfWithPages(sizes: Array<[number, number]>) {
  const document = await PDFDocument.create();
  for (const [width, height] of sizes) {
    document.addPage([width, height]).drawRectangle({ x: 10, y: 10, width: width / 2, height: height / 2, color: rgb(0.1, 0.5, 0.9) });
  }
  return Buffer.from(await document.save());
}

// Pixel dimensions from a PNG's header or a JPEG's frame header.
function imageSize(bytes: Buffer) {
  if (bytes.readUInt32BE(0) === 0x89504E47) {
    return { format: 'png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }

  for (let offset = 2; offset < bytes.length;) {
    const marker = bytes.readUInt16BE(offset);
    if (marker === 0xFFC0 || marker === 0xFFC2) {
      return { format: 'jpg', width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }

  throw new Error('not a PNG or JPEG');
}

async function saved(download: Download) {
  return { filename: download.suggestedFilename(), ...imageSize(await readFile(await download.path() as string)) };
}

async function upload(page: Page, name: string, buffer: Buffer) {
  await page.locator('input[type=file]').setInputFiles({ name, mimeType: 'application/pdf', buffer });
}

test.describe('Tool - PDF to image', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf-to-image');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('PDF to image - Thirteen Months Toolbox');
  });

  test('renders every page at the chosen resolution and format', async ({ page }) => {
    await upload(page, 'sample.pdf', await pdfWithPages([[200, 100], [100, 200]]));
    await expect(page.getByTestId('pdf-to-image-count')).toContainText('2 pages');

    await page.getByRole('button', { name: 'PNG' }).click();
    await page.getByRole('button', { name: '72 DPI' }).click();
    await page.getByTestId('pdf-to-image-button').click();
    await expect(page.getByTestId('pdf-to-image-result')).toHaveCount(2);

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('pdf-to-image-download').nth(1).click();

    expect(await saved(await downloadPromise)).toEqual({ filename: 'sample-2.png', format: 'png', width: 100, height: 200 });
  });

  test('converts only the selected pages and downloads them in one ZIP', async ({ page }) => {
    await upload(page, 'report.pdf', await pdfWithPages([[200, 100], [100, 200], [300, 150]]));

    await page.getByRole('button', { name: 'Selected pages' }).click();
    await page.getByTestId('pdf-to-image-input').fill('3, 1');
    await expect(page.getByTestId('pdf-to-image-summary')).toHaveText('2 pages will be converted');

    await page.getByTestId('pdf-to-image-button').click();
    await expect(page.getByTestId('pdf-to-image-result')).toHaveCount(2);

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('pdf-to-image-download-zip').click();
    const download = await downloadPromise;
    const entries = unzipSync(await readFile(await download.path() as string));

    expect(download.suggestedFilename()).toBe('report-images.zip');
    // JPEG at 150 DPI by default: 300 by 150 points is 625 by 312 pixels.
    expect(Object.entries(entries).map(([name, bytes]) => ({ name, ...imageSize(Buffer.from(bytes)) }))).toEqual([
      { name: 'report-3.jpg', format: 'jpg', width: 625, height: 312 },
      { name: 'report-1.jpg', format: 'jpg', width: 416, height: 208 },
    ]);
  });

  test('flags a file that is not a PDF', async ({ page }) => {
    await upload(page, 'notes.pdf', Buffer.from('not a pdf at all'));

    await expect(page.getByText('This file could not be read and may not be a valid PDF')).toBeVisible();
    await expect(page.getByTestId('pdf-to-image-button')).toHaveCount(0);
  });
});
