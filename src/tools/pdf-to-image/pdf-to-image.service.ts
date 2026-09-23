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
