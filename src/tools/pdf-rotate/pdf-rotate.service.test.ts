import { PDFDocument, PDFName, PDFNumber } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { rotatePages } from './pdf-rotate.service';

// Written as raw numbers, since pdf-lib refuses to set angles that are not
// multiples of 90, which files in the wild still contain.
async function pdfWithRotations(rotations: number[]) {
  const document = await PDFDocument.create();
  for (const rotation of rotations) {
    document.addPage([100, 200]).node.set(PDFName.of('Rotate'), PDFNumber.of(rotation));
  }
  return document.save();
}

async function rotationsOf(bytes: Uint8Array) {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map(page => page.getRotation().angle);
}

describe('pdf-rotate', () => {
  describe('rotatePages', () => {
    it('turns every page when no pages are given', async () => {
      const file = await pdfWithRotations([0, 0, 0]);

      expect(await rotationsOf(await rotatePages(file, 90))).toEqual([90, 90, 90]);
    });

    it('turns only the pages given, each once', async () => {
      const file = await pdfWithRotations([0, 0, 0]);

      expect(await rotationsOf(await rotatePages(file, 180, [3, 1, 3]))).toEqual([180, 0, 180]);
    });

    it('adds to the rotation a page already has', async () => {
      const file = await pdfWithRotations([90, 180, 270]);

      expect(await rotationsOf(await rotatePages(file, 270))).toEqual([0, 90, 180]);
    });

    it('treats a rotation that is not a multiple of 90 as upright, as viewers do', async () => {
      const file = await pdfWithRotations([45, -90]);

      expect(await rotationsOf(await rotatePages(file, 90))).toEqual([90, 0]);
    });

    it('leaves the rest of the file alone', async () => {
      const document = await PDFDocument.create();
      document.addPage([100, 200]);
      document.setTitle('Contract');
      document.catalog.set(PDFName.of('Outlines'), document.context.register(document.context.obj({ Type: 'Outlines', Count: 0 })));

      const rotated = await PDFDocument.load(await rotatePages(await document.save(), 90));

      expect(rotated.getTitle()).toBe('Contract');
      expect(rotated.catalog.has(PDFName.of('Outlines'))).toBe(true);
      expect(rotated.getPage(0).getSize()).toEqual({ width: 100, height: 200 });
    });
  });
});
