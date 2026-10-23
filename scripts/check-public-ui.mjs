import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    let file = resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) file += '/index.html';
    }
    catch { file += '.html'; }
    const content = await readFile(file);
    response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
    response.end(content);
  }
  catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const results = [];
try {
  for (const width of [1440, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, locale: 'zh-CN', serviceWorkers: 'block' });
    try {
      for (const route of ['/', '/json-prettify']) {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await page.locator('button[aria-pressed]').first().waitFor();
        const session = await context.newCDPSession(page);
        const { nodes } = await session.send('Accessibility.getFullAXTree');
        const unnamed = nodes.filter(node => !node.ignored && ['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio', 'slider'].includes(node.role?.value) && !node.name?.value?.trim());
        assert.equal(unnamed.length, 0, `${route} at ${width}px has unnamed controls`);
        assert.equal(await page.locator('main').count(), 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        if (route === '/') {
          await page.locator('button[aria-pressed=false]').first().click();
          assert.ok(await page.locator('button[aria-pressed=true]').count());
        }
        else {
          await page.locator('textarea').fill('{"z":2,"a":1}');
          await page.waitForFunction(() => document.querySelector('[data-test-id="area-content"]')?.textContent?.includes('2'));
          const content = await page.locator('[data-test-id="area-content"]').textContent();
          assert.deepEqual(JSON.parse(content), { a: 1, z: 2 });
        }
        assert.deepEqual(errors, []);
        results.push({ width, route, unnamedControls: 0, main: 1, pageErrors: 0 });
        await session.detach();
        await page.close();
      }
    }
    finally { await context.close(); }
  }
  console.log(JSON.stringify(results));
}
finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
