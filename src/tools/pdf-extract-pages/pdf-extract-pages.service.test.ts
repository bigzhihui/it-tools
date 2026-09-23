import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { extractPages, resultPages } from './pdf-extract-pages.service';

// Page widths double as a label, so the pages of the result can be read back.
async function pdfWithPageWidths(widths: number[]) {
  const document = await PDFDocument.create();
  for (const width of widths) {
    document.addPage([width, 200]);
  }
  return document.save();
}

async function pageWidths(bytes: Uint8Array) {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map(page => page.getWidth());
}

describe('pdf-extract-pages', () => {
  describe('resultPages', () => {
    it('keeps the pages listed, in the order listed, once each', () => {
      expect(resultPages('keep', [3, 1, 2], 5)).toEqual([3, 1, 2]);
      expect(resultPages('keep', [1, 2, 3, 2], 5)).toEqual([1, 2, 3]);
    });

    it('deletes the pages listed and keeps the rest in their original order', () => {
      expect(resultPages('delete', [4, 2], 5)).toEqual([1, 3, 5]);
      expect(resultPages('delete', [2, 2], 3)).toEqual([1, 3]);
      expect(resultPages('delete', [1, 2, 3], 3)).toEqual([]);
    });
  });

  describe('extractPages', () => {
    it('builds a file from the given pages, in order', async () => {
      const file = await pdfWithPageWidths([100, 200, 300, 400]);

      expect(await pageWidths(await extractPages(file, [4, 1, 2]))).toEqual([400, 100, 200]);
    });
  });
});
