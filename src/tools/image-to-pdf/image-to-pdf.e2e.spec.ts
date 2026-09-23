import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

// Real images, drawn by the browser.
async function image(page: Page, type: 'image/jpeg' | 'image/png' | 'image/webp', width: number, height: number) {
  const base64 = await page.evaluate(([type, width, height]) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.fillStyle = '#2080f0';
    context.fillRect(0, 0, width, height);
    return canvas.toDataURL(type).split(',')[1];
  }, [type, width, height] as const);
  return Buffer.from(base64, 'base64');
}

// The same JPEG, marked as taken with the phone turned: stored landscape,
// shown portrait.
function turnedPortrait(jpeg: Buffer) {
  const tiff = [0x49, 0x49, 42, 0, 8, 0, 0, 0, 1, 0, 0x12, 0x01, 3, 0, 1, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0];
  return Buffer.concat([jpeg.subarray(0, 2), Buffer.from([0xFF, 0xE1, 0, 34, 0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff]), jpeg.subarray(2)]);
}

async function pageSizes(bytes: Buffer) {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map(page => [page.getWidth(), page.getHeight()].map(n => Math.round(n * 100) / 100));
}

async function download(page: Page) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('image-to-pdf-button').click();
  const download = await downloadPromise;
  return { filename: download.suggestedFilename(), bytes: await readFile(await download.path() as string) };
}

test.describe('Tool - Image to PDF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-to-pdf');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Image to PDF - Thirteen Months Toolbox');
  });

  test('puts each image on a page of its own size, in list order', async ({ page }) => {
    await page.locator('input[type=file]').setInputFiles([
      { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await image(page, 'image/jpeg', 400, 300) },
      { name: 'chart.png', mimeType: 'image/png', buffer: await image(page, 'image/png', 200, 100) },
      { name: 'banner.webp', mimeType: 'image/webp', buffer: await image(page, 'image/webp', 120, 80) },
    ]);
    await expect(page.getByTestId('image-to-pdf-count')).toHaveText('3 images');

    // Move the PNG to the top.
    await page.getByTestId('image-to-pdf-up').nth(1).click();

    const { filename, bytes } = await download(page);
    expect(filename).toBe('chart.pdf');
    expect(await pageSizes(bytes)).toEqual([[150, 75], [300, 225], [90, 60]]);
  });

  test('turns a phone photo upright', async ({ page }) => {
    await page.locator('input[type=file]').setInputFiles({ name: 'IMG_2031.jpg', mimeType: 'image/jpeg', buffer: turnedPortrait(await image(page, 'image/jpeg', 400, 300)) });
    await expect(page.getByTestId('image-to-pdf-count')).toHaveText('1 image');

    const { bytes } = await download(page);
    expect(await pageSizes(bytes)).toEqual([[225, 300]]);
  });

  test('lays images out on A4', async ({ page }) => {
    await page.locator('input[type=file]').setInputFiles([
      { name: 'wide.png', mimeType: 'image/png', buffer: await image(page, 'image/png', 300, 100) },
      { name: 'tall.png', mimeType: 'image/png', buffer: await image(page, 'image/png', 100, 300) },
    ]);

    await page.getByRole('button', { name: 'A4' }).click();
    await page.getByRole('button', { name: 'Narrow' }).click();

    const { bytes } = await download(page);
    expect(await pageSizes(bytes)).toEqual([[841.89, 595.28], [595.28, 841.89]]);
  });

  test('flags a file that is not an image and leaves it out', async ({ page }) => {
    await page.locator('input[type=file]').setInputFiles([
      { name: 'notes.png', mimeType: 'image/png', buffer: Buffer.from('not an image at all') },
    ]);

    await expect(page.getByText('This image could not be read')).toBeVisible();
    await expect(page.getByTestId('image-to-pdf-count')).toHaveText('0 images');
    await expect(page.getByTestId('image-to-pdf-button')).toHaveAttribute('aria-disabled', 'true');
  });
});
