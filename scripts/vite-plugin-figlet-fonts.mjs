import { createReadStream, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const FONTS_DIR = 'node_modules/figlet/fonts';
const PUBLIC_PREFIX = '/figlet-fonts';

function listFontFiles() {
  if (!existsSync(FONTS_DIR)) {
    return [];
  }

  return readdirSync(FONTS_DIR).filter(name => name.endsWith('.flf'));
}

/**
 * Serves figlet's .flf fonts from the site's own origin.
 *
 * Upstream pointed figlet at unpkg.com, which breaks the tool whenever that CDN
 * is unreachable or omits CORS headers. The fonts already ship inside the figlet
 * package, so they are served locally instead: emitted into the bundle on build
 * and streamed from node_modules during dev. They stay lazily fetched, so a
 * visitor only downloads the one font they picked.
 */
export function figletFonts() {
  return {
    name: 'it-tools-figlet-fonts',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';

        if (!url.startsWith(`${PUBLIC_PREFIX}/`) || !url.endsWith('.flf')) {
          next();
          return;
        }

        const name = decodeURIComponent(url.slice(PUBLIC_PREFIX.length + 1));

        // Reject any path that tries to escape the fonts directory.
        if (name.includes('/') || name.includes('\\') || name.includes('..')) {
          res.statusCode = 400;
          res.end('bad font name');
          return;
        }

        const file = join(FONTS_DIR, name);

        if (!existsSync(file)) {
          res.statusCode = 404;
          res.end('font not found');
          return;
        }

        res.setHeader('content-type', 'text/plain; charset=utf-8');
        createReadStream(file).pipe(res);
      });
    },

    generateBundle() {
      const files = listFontFiles();

      for (const name of files) {
        this.emitFile({
          type: 'asset',
          fileName: `figlet-fonts/${name}`,
          source: readFileSync(join(FONTS_DIR, name)),
        });
      }

      this.info?.(`figlet: ${files.length} fonts emitted to figlet-fonts/`);
    },
  };
}
