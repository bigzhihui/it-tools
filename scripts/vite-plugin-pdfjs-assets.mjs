import { createReadStream, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PDFJS_DIR = 'node_modules/pdfjs-dist';
const PUBLIC_PREFIX = '/pdfjs';
// Character maps, which PDFs with Chinese, Japanese or Korean text that does
// not embed its fonts need, and the standard fonts PDFs may refer to without
// embedding. Each folder carries its own licence files, emitted alongside.
const FOLDERS = ['cmaps', 'standard_fonts'];

function listFiles(folder) {
  const dir = join(PDFJS_DIR, folder);
  return existsSync(dir) ? readdirSync(dir) : [];
}

/**
 * Serves the data files pdf.js loads while rendering from the site's own
 * origin, like its worker, instead of a CDN: emitted into the bundle on build
 * and streamed from node_modules during dev. pdf.js fetches only the files a
 * document needs, and they stay out of the service worker's precache.
 */
export function pdfjsAssets() {
  return {
    name: 'it-tools-pdfjs-assets',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        const [folder, name, ...rest] = url.startsWith(`${PUBLIC_PREFIX}/`) ? url.slice(PUBLIC_PREFIX.length + 1).split('/') : [];

        if (!FOLDERS.includes(folder) || !name || rest.length > 0) {
          next();
          return;
        }

        const file = join(PDFJS_DIR, folder, decodeURIComponent(name));

        // Reject any name that tries to escape the folder.
        if (name.includes('..') || name.includes('\\') || !existsSync(file)) {
          res.statusCode = 404;
          res.end('not found');
          return;
        }

        res.setHeader('content-type', 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },

    generateBundle() {
      let count = 0;

      for (const folder of FOLDERS) {
        for (const name of listFiles(folder)) {
          this.emitFile({
            type: 'asset',
            fileName: `pdfjs/${folder}/${name}`,
            source: readFileSync(join(PDFJS_DIR, folder, name)),
          });
          count++;
        }
      }

      this.info?.(`pdfjs: ${count} files emitted to pdfjs/`);
    },
  };
}
