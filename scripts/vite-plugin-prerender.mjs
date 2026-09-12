import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

const TOOLS_DIR = 'src/tools';
const LOCALE_FILE = 'locales/zh.yml';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function collectRoutes() {
  const locale = parseYaml(readFileSync(LOCALE_FILE, 'utf8'));
  const brand = locale?.brand?.name ?? '';
  const tools = readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map((entry) => {
      const indexFile = join(TOOLS_DIR, entry.name, 'index.ts');

      if (!existsSync(indexFile)) {
        return null;
      }

      const match = readFileSync(indexFile, 'utf8').match(/^\s*path:\s*'([^']+)'/m);

      if (!match) {
        return null;
      }

      const path = match[1];
      // The tool layout resolves its i18n key from the route path, so the
      // prerendered copy has to use the same key to stay consistent.
      const entryLocale = locale?.tools?.[path.replace(/^\//, '')];

      if (!entryLocale?.title || !entryLocale?.description) {
        return null;
      }

      return { path, title: entryLocale.title, description: entryLocale.description };
    })
    .filter(Boolean)
    .sort((a, b) => a.path.localeCompare(b.path, 'en'));

  const pages = [
    { path: '/', title: brand, description: locale?.home?.subtitle ?? locale?.subtitle ?? '', isHome: true },
    { path: '/about', title: locale?.footer?.about ?? '关于本站', description: brand },
    { path: '/support', title: locale?.supportPage?.title ?? '支持本站', description: brand },
    ...tools,
  ];

  return { brand, tools, pages };
}

/**
 * Bakes a crawlable copy of every route into the build.
 *
 * The app is client rendered, so the shipped index.html carries no headings,
 * no descriptions and — critically — no links at all. Crawlers that do not run
 * JavaScript therefore see 89 identical empty pages and have no path from one
 * route to another. Each route gets its own HTML file with a real title,
 * description, heading and a full link list. Vue replaces that markup when it
 * mounts, so visitors still get the interactive app.
 */
export function prerender({ siteUrl = 'https://tools.afeiii.com' } = {}) {
  const origin = siteUrl.replace(/\/$/, '');

  return {
    name: 'it-tools-prerender',
    apply: 'build',
    enforce: 'post',

    generateBundle(_options, bundle) {
      const indexAsset = Object.values(bundle).find(
        asset => asset.type === 'asset' && asset.fileName === 'index.html',
      );

      if (!indexAsset) {
        this.warn('index.html not found in bundle; prerendering skipped');
        return;
      }

      const template = String(indexAsset.source);
      const { brand, tools, pages } = collectRoutes();

      const navLinks = tools
        .map(t => `<li><a href="${t.path}">${escapeHtml(t.title)}</a></li>`)
        .join('');

      let emitted = 0;

      for (const page of pages) {
        const fullTitle = page.isHome
          ? `${brand} - ${page.description}`
          : `${page.title} - ${brand}`;
        const canonical = `${origin}${page.path}`;

        const body = [
          `<h1>${escapeHtml(page.isHome ? brand : page.title)}</h1>`,
          `<p>${escapeHtml(page.description)}</p>`,
          `<nav aria-label="${escapeHtml(brand)}"><ul>${navLinks}</ul></nav>`,
        ].join('');

        const html = template
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)
          .replace(
            /(<meta\s+name="description"\s+content=")[\s\S]*?(")/,
            `$1${escapeHtml(page.description)}$2`,
          )
          .replace(
            /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
            `$1${canonical}$2`,
          )
          .replace(
            /(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/,
            `$1${escapeHtml(fullTitle)}$2`,
          )
          .replace(
            /(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/,
            `$1${escapeHtml(page.description)}$2`,
          )
          .replace(
            /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
            `$1${canonical}$2`,
          )
          .replace('<div id="app"></div>', `<div id="app">${body}</div>`);

        if (page.isHome) {
          // The root index.html is emitted by Vite itself; replace it in place.
          indexAsset.source = html;
        }
        else {
          this.emitFile({
            type: 'asset',
            fileName: `${page.path.replace(/^\//, '')}/index.html`,
            source: html,
          });
        }

        emitted++;
      }

      this.info?.(`prerender: ${emitted} routes written`);
    },
  };
}
