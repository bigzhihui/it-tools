import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { inspectPdf, mergePdfs } from './pdf-merge.service';

// Page widths double as a label, so the merged order can be read back.
async function pdfWithPageWidths(widths: number[]) {
  const document = await PDFDocument.create();
  for (const width of widths) {
    document.addPage([width, 200]);
  }
  return document.save();
}

async function encryptedPdf() {
  const document = await PDFDocument.create();
  document.addPage([100, 100]);
  // pdf-lib cannot encrypt, but a trailer that points at an /Encrypt
  // dictionary is exactly what readers use to decide a file is encrypted.
  document.context.trailerInfo.Encrypt = document.context.register(document.context.obj({ Filter: 'Standard' }));
  return document.save({ useObjectStreams: false });
}

async function pageWidths(bytes: Uint8Array) {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map(page => page.getWidth());
}

describe('pdf-merge', () => {
  describe('mergePdfs', () => {
    it('keeps every page, in the order the files were given', async () => {
      const first = await pdfWithPageWidths([100]);
      const second = await pdfWithPageWidths([200, 300]);

      const merged = await mergePdfs([first, second]);

      expect(await pageWidths(merged)).toEqual([100, 200, 300]);
    });

    it('follows a changed file order', async () => {
      const first = await pdfWithPageWidths([100]);
      const second = await pdfWithPageWidths([200, 300]);

      const merged = await mergePdfs([second, first]);

      expect(await pageWidths(merged)).toEqual([200, 300, 100]);
    });

    it('can merge the same file twice', async () => {
      const file = await pdfWithPageWidths([150]);

      const merged = await mergePdfs([file, file]);

      expect(await pageWidths(merged)).toEqual([150, 150]);
    });
  });

  describe('inspectPdf', () => {
    it('reports the page count of a valid file', async () => {
      expect(await inspectPdf(await pdfWithPageWidths([100, 100, 100]))).toEqual({ ok: true, pageCount: 3 });
    });

    it('flags a file that is not a PDF', async () => {
      const notAPdf = new TextEncoder().encode('just some text, not a pdf');

      expect(await inspectPdf(notAPdf)).toEqual({ ok: false, reason: 'invalid' });
    });

    it('flags an encrypted file separately', async () => {
      expect(await inspectPdf(await encryptedPdf())).toEqual({ ok: false, reason: 'encrypted' });
    });
  });
});
