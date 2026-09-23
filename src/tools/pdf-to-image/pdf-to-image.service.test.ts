import { describe, expect, it } from 'vitest';
import { imageFileName, renderScale } from './pdf-to-image.service';

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
});
