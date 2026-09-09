import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TOOLS_DIR = 'src/tools';
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/support', priority: '0.5', changefreq: 'monthly' },
];

function collectToolPaths() {
  if (!existsSync(TOOLS_DIR)) {
    return [];
  }

  return readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map((entry) => {
      const indexFile = join(TOOLS_DIR, entry.name, 'index.ts');

      if (!existsSync(indexFile)) {
        return null;
      }

      // The route is declared as `path: '/foo'` inside defineTool(). It does not
      // always match the directory name, so it has to be read from the source.
      const match = readFileSync(indexFile, 'utf8').match(/^\s*path:\s*'([^']+)'/m);

      return match ? match[1] : null;
    })
    .filter(Boolean)
    .sort();
}

function buildSitemap({ siteUrl, routes }) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const origin = siteUrl.replace(/\/$/, '');

  const entries = routes
    .map(({ path, priority, changefreq }) => [
      '  <url>',
      `    <loc>${origin}${path}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n'))
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>',
    '',
  ].join('\n');
}

export function sitemap({ siteUrl = 'https://tools.afeiii.com' } = {}) {
  return {
    name: 'it-tools-sitemap',
    apply: 'build',
    generateBundle() {
      const toolRoutes = collectToolPaths().map(path => ({
        path,
        priority: '0.8',
        changefreq: 'monthly',
      }));

      const routes = [...STATIC_ROUTES, ...toolRoutes];

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: buildSitemap({ siteUrl, routes }),
      });

      this.info?.(`sitemap.xml generated with ${routes.length} urls`);
    },
  };
}
