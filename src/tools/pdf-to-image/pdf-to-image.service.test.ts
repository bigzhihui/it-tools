import { unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { imageFileName, renderScale, zipFileName, zipImages } from './pdf-to-image.service';

describe('pdf-to-image', () => {
  describe('renderScale', () => {
    it('turns points into pixels at the chosen resolution', () => {
      expect(renderScale(595, 842, 72)).toBe(1);
      expect(renderScale(595, 842, 300)).toBeCloseTo(300 / 72);
    });

    it('scales down pages too large for a canvas', () => {
      const scale = renderScale(2384, 3370, 300, 1000 * 1000);

      expect(2384 * scale * 3370 * scale).toBeCloseTo(1000 * 1000);
      expect(scale).toBeLessThan(300 / 72);
    });
  });

  describe('imageFileName', () => {
    it('names each image after the file and its page, padded to sort in order', () => {
      expect(imageFileName('合同.pdf', 3, 12, 'jpg')).toBe('合同-03.jpg');
      expect(imageFileName('report.PDF', 7, 9, 'png')).toBe('report-7.png');
      expect(imageFileName('scan', 1, 100, 'png')).toBe('scan-001.png');
    });
  });

  describe('zipImages', () => {
    const first = Uint8Array.from([1, 2, 3]);
    const second = Uint8Array.from([4, 5]);

    it('puts every image in one archive, in order, unchanged', () => {
      const entries = unzipSync(zipImages([{ name: '合同-03.jpg', bytes: first }, { name: '合同-01.jpg', bytes: second }]));

      expect(Object.keys(entries)).toEqual(['合同-03.jpg', '合同-01.jpg']);
      expect(entries['合同-03.jpg']).toEqual(first);
      expect(entries['合同-01.jpg']).toEqual(second);
    });

    it('stores the images uncompressed, with names marked as UTF-8', () => {
      const zip = zipImages([{ name: '合同-1.png', bytes: first }]);
      const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);

      // The first local file header: general purpose flags, then the method.
      expect(view.getUint32(0, true)).toBe(0x04034B50);
      expect(view.getUint16(6, true) & 0x0800).toBe(0x0800);
      expect(view.getUint16(8, true)).toBe(0);
    });

    it('names the archive after the PDF', () => {
      expect(zipFileName('合同.pdf')).toBe('合同-images.zip');
    });
  });
});
