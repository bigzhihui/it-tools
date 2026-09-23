import { zipSync } from 'fflate';

export type ImageFormat = 'jpg' | 'png';

// Browsers refuse to draw canvases much larger than this; iOS Safari stops at
// 16 megapixels.
export const MAX_PIXELS = 4096 * 4096;

// How much to enlarge a page of `width` by `height` points (1/72 inch) to get
// `dpi` pixels per inch, reduced as needed to stay within `maxPixels`.
export function renderScale(width: number, height: number, dpi: number, maxPixels = MAX_PIXELS) {
  const scale = dpi / 72;
  const pixels = width * scale * height * scale;

  return pixels > maxPixels ? scale * Math.sqrt(maxPixels / pixels) : scale;
}

// Page numbers padded to the same width, so the files sort in page order.
export function imageFileName(pdfName: string, page: number, pageCount: number, format: ImageFormat) {
  const base = pdfName.replace(/\.pdf$/i, '');
  return `${base}-${String(page).padStart(String(pageCount).length, '0')}.${format}`;
}

export function zipFileName(pdfName: string) {
  return `${pdfName.replace(/\.pdf$/i, '')}-images.zip`;
}

// Every image in one ZIP, in the order given. They are stored as they are:
// JPEG and PNG are already compressed, so compressing again would only take
// time. Names are marked as UTF-8, which keeps Chinese names intact.
export function zipImages(images: Array<{ name: string; bytes: Uint8Array }>): Uint8Array {
  return zipSync(Object.fromEntries(images.map(({ name, bytes }) => [name, bytes])), { level: 0 });
}
