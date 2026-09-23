import { PDFArray, PDFDocument, PDFName, decodePDFRawStream } from 'pdf-lib';
import type { PDFRawStream } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { detectFormat, imagesToPdf, jpegOrientation, layoutPage, orientationMatrix } from './image-to-pdf.service';

// A 3 by 2 pixel PNG.
const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAABJJREFUGFdjvGAQ8J8BChiROQBOEgShYZZH3AAAAABJRU5ErkJggg=='), c => c.charCodeAt(0));

const u16 = (value: number) => [value >> 8, value & 0xFF];

// A JPEG with just what pdf-lib reads, its dimensions and colour channels, and
// EXIF orientation when given. The image data itself is left out.
function jpeg({ width, height, orientation, littleEndian = true }: { width: number; height: number; orientation?: number; littleEndian?: boolean }) {
  const exif = orientation === undefined
    ? []
    : [
        0xFF, 0xE1, ...u16(34), 0x45, 0x78, 0x69, 0x66, 0, 0,
        // TIFF header, then one directory holding one entry: orientation, a short.
        ...(littleEndian
          ? [0x49, 0x49, 42, 0, 8, 0, 0, 0, 1, 0, 0x12, 0x01, 3, 0, 1, 0, 0, 0, orientation, 0, 0, 0, 0, 0, 0, 0]
          : [0x4D, 0x4D, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0, 0, 0, 0, 0]),
      ];
  const startOfFrame = [0xFF, 0xC0, ...u16(17), 8, ...u16(height), ...u16(width), 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1];

  return Uint8Array.from([0xFF, 0xD8, ...exif, ...startOfFrame, 0xFF, 0xD9]);
}

async function pagesOf(bytes: Uint8Array) {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map((page) => {
    const streams = page.node.lookup(PDFName.of('Contents'), PDFArray).asArray().map(ref => document.context.lookup(ref) as PDFRawStream);
    const content = streams.map(stream => new TextDecoder().decode(decodePDFRawStream(stream).decode())).join('\n');
    return {
      size: [page.getWidth(), page.getHeight()].map(n => Math.round(n * 100) / 100),
      matrix: content.match(/(\S+ \S+ \S+ \S+ \S+ \S+) cm/)?.[1],
    };
  });
}

describe('image-to-pdf', () => {
  describe('detectFormat', () => {
    it('recognises JPEG and PNG by their first bytes', () => {
      expect(detectFormat(jpeg({ width: 2, height: 1 }))).toBe('jpg');
      expect(detectFormat(PNG)).toBe('png');
    });

    it('leaves other formats to be redrawn', () => {
      expect(detectFormat(new TextEncoder().encode('GIF89a'))).toBe(null);
      expect(detectFormat(new Uint8Array())).toBe(null);
    });
  });

  describe('jpegOrientation', () => {
    it('reads the orientation in either byte order', () => {
      expect(jpegOrientation(jpeg({ width: 2, height: 1, orientation: 6 }))).toBe(6);
      expect(jpegOrientation(jpeg({ width: 2, height: 1, orientation: 8, littleEndian: false }))).toBe(8);
    });

    it('treats missing, invalid or truncated data as upright', () => {
      expect(jpegOrientation(jpeg({ width: 2, height: 1 }))).toBe(1);
      expect(jpegOrientation(jpeg({ width: 2, height: 1, orientation: 9 }))).toBe(1);
      expect(jpegOrientation(jpeg({ width: 2, height: 1, orientation: 6 }).slice(0, 30))).toBe(1);
      expect(jpegOrientation(PNG)).toBe(1);
    });
  });

  describe('layoutPage', () => {
    it('gives each page the size of its image', () => {
      expect(layoutPage(400, 300, 'image', 20)).toEqual({ pageWidth: 300, pageHeight: 225, box: { x: 0, y: 0, width: 300, height: 225 } });
    });

    it('fits the image inside the margins of an A4 page, turned to match it', () => {
      const tall = layoutPage(1000, 2000, 'a4', 0);
      const wide = layoutPage(2000, 1000, 'a4', 10);
      const margin = 10 * 72 / 25.4;

      expect([tall.pageWidth, tall.pageHeight]).toEqual([595.28, 841.89]);
      expect(tall.box.height).toBeCloseTo(841.89);
      expect(tall.box.x).toBeCloseTo((595.28 - tall.box.width) / 2);

      expect([wide.pageWidth, wide.pageHeight]).toEqual([841.89, 595.28]);
      expect(wide.box.width).toBeCloseTo(841.89 - 2 * margin);
      expect(wide.box.y).toBeCloseTo((595.28 - wide.box.height) / 2);
    });
  });

  describe('orientationMatrix', () => {
    it('maps the image onto the box for every orientation, flipping for the mirrored ones', () => {
      const box = { x: 10, y: 20, width: 30, height: 40 };
      const corners = (m: number[]) => [[0, 0], [1, 0], [0, 1], [1, 1]]
        .map(([s, t]) => `${m[0] * s + m[2] * t + m[4]},${m[1] * s + m[3] * t + m[5]}`)
        .sort();

      for (let orientation = 1; orientation <= 8; orientation++) {
        const m = orientationMatrix(orientation, box);
        const mirrored = m[0] * m[3] - m[1] * m[2] < 0;

        expect(corners(m)).toEqual(['10,20', '10,60', '40,20', '40,60']);
        expect(mirrored).toBe([2, 4, 5, 7].includes(orientation));
      }
    });
  });

  describe('imagesToPdf', () => {
    it('makes one page per image, in order', async () => {
      const pdf = await imagesToPdf([
        { bytes: jpeg({ width: 400, height: 300 }), format: 'jpg' },
        { bytes: PNG, format: 'png' },
      ], { pageSize: 'image', marginMm: 0 });

      expect((await pagesOf(pdf)).map(page => page.size)).toEqual([[300, 225], [2.25, 1.5]]);
    });

    it('turns a photo upright as its EXIF data says', async () => {
      // Stored landscape, taken in portrait.
      const pdf = await imagesToPdf([{ bytes: jpeg({ width: 400, height: 300, orientation: 6 }), format: 'jpg' }], { pageSize: 'image', marginMm: 0 });

      expect(await pagesOf(pdf)).toEqual([{ size: [225, 300], matrix: '0 -300 225 0 0 300' }]);
    });

    it('lays images out on A4', async () => {
      const pdf = await imagesToPdf([{ bytes: PNG, format: 'png' }], { pageSize: 'a4', marginMm: 0 });

      expect((await pagesOf(pdf))[0].size).toEqual([841.89, 595.28]);
    });
  });
});
