import { PDFArray, PDFDict, PDFDocument, PDFName } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { mergePdfs } from './pdf-merge.service';

// Page widths double as a label, so the merged order can be read back.
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

    it('keeps links within each file pointing at their pages', async () => {
      const document = await PDFDocument.create();
      const [contents, chapter] = [document.addPage([100, 200]), document.addPage([200, 200])];
      const link = document.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [0, 0, 10, 10], Dest: [chapter.ref, PDFName.of('Fit')] });
      contents.node.set(PDFName.of('Annots'), document.context.obj([document.context.register(link)]));
      const withLink = await document.save();

      const merged = await PDFDocument.load(await mergePdfs([await pdfWithPageWidths([300]), withLink]));
      const annotations = merged.getPage(1).node.lookup(PDFName.of('Annots'), PDFArray);
      const destination = merged.context.lookup(annotations.get(0), PDFDict).lookup(PDFName.of('Dest'), PDFArray);

      expect(destination.get(0)).toBe(merged.getPage(2).ref);
    });
  });
});
