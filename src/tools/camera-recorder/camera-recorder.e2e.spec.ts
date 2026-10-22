import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('requests camera permission on demand and handles denial without an unhandled error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route(/cloudflareinsights\.com/, route => route.abort());
  await page.addInitScript(() => {
    (window as any).__cameraRequests = 0;
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: async () => {
        (window as any).__cameraRequests++;
        throw new DOMException('Permission denied', 'NotAllowedError');
      },
    });
  });
  await page.goto('/camera-recorder', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'Grant permission', exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as any).__cameraRequests)).toBe(0);
  await page.getByRole('button', { name: 'Grant permission', exact: true }).click();
  await expect(page.getByText('Your browser has blocked permission request', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => (window as any).__cameraRequests)).toBe(1);
  expect(errors).toEqual([]);
});

test.describe('synthetic camera capture', () => {
  test.use({
    permissions: ['camera', 'microphone'],
  });

  test('captures a picture and records a playable video using a fake camera', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/cloudflareinsights\.com/, route => route.abort());
    await page.addInitScript(() => {
      Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
        value: async () => [{ deviceId: 'qa-camera', kind: 'videoinput', label: 'Synthetic QA camera', groupId: 'qa' }],
      });
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        value: async () => {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const context = canvas.getContext('2d')!;
          setInterval(() => {
            context.fillStyle = '#2080f0';
            context.fillRect(0, 0, 640, 480);
          }, 50);
          return canvas.captureStream(20);
        },
      });
    });
    await page.goto('/camera-recorder', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Grant permission', exact: true }).click();
    await page.getByRole('button', { name: 'Start webcam', exact: true }).click();
    await page.waitForFunction(() => (document.querySelector('video')?.videoWidth ?? 0) > 0);
    await page.getByRole('button', { name: 'Take screenshot', exact: true }).click();
    const image = page.locator('img[alt=screenshot]');
    await expect(image).toBeVisible();
    expect(await image.evaluate((element: HTMLImageElement) => [element.naturalWidth, element.naturalHeight])).toEqual([640, 480]);
    await page.getByRole('button', { name: 'Start recording', exact: true }).click();
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    const resumeAt = await page.locator('video').first().evaluate((element: HTMLVideoElement) => element.currentTime);
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await expect.poll(() => page.locator('video').first().evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(resumeAt + 1);
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    const recording = page.locator('video').nth(1);
    await expect(recording).toBeVisible();
    await expect.poll(() => recording.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThanOrEqual(2);
    const pending = page.waitForEvent('download');
    await recording.locator('..').getByRole('button').first().click();
    const download = await pending;
    expect(await download.failure()).toBeNull();
    const bytes = await readFile(await download.path() as string);
    expect(bytes.subarray(0, 4).toString('hex')).toBe('1a45dfa3');
    expect(errors).toEqual([]);
  });
});
