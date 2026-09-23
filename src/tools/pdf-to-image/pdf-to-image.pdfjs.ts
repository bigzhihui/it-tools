// pdf.js 4.10, legacy build: newer releases need Chrome 119 or later even in
// their legacy build, while many browsers in use in China, and Chrome on
// Windows 7, are older.
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { renderScale } from './pdf-to-image.service';
import type { ImageFormat } from './pdf-to-image.service';

// The worker and the data files below are served by this site, not a CDN.
GlobalWorkerOptions.workerSrc = workerUrl;
const assets = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/pdfjs`;

export type OpenResult =
  | { ok: true; pdf: PDFDocumentProxy }
  | { ok: false; reason: 'password' | 'invalid' };

export async function openPdf(bytes: Uint8Array): Promise<OpenResult> {
  try {
    const pdf = await getDocument({
      data: bytes,
      cMapUrl: `${assets}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${assets}/standard_fonts/`,
      // Never compile code from a file's fonts; the file may not be trustworthy.
      isEvalSupported: false,
    }).promise;

    return { ok: true, pdf };
  }
  catch (error) {
    return { ok: false, reason: (error as Error)?.name === 'PasswordException' ? 'password' : 'invalid' };
  }
}

export async function renderPage(pdf: PDFDocumentProxy, pageNumber: number, { dpi, format }: { dpi: number; format: ImageFormat }): Promise<Blob> {
  const page = await pdf.getPage(pageNumber);
  const natural = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: renderScale(natural.width, natural.height, dpi) });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  try {
    // pdf.js paints a white background first, so JPEG output is not black
    // where the page is transparent.
    await page.render({ canvasContext: canvas.getContext('2d') as CanvasRenderingContext2D, viewport }).promise;

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, format === 'jpg' ? 'image/jpeg' : 'image/png', 0.92));
    if (!blob) {
      throw new Error(`Could not encode page ${pageNumber}`);
    }
    return blob;
  }
  finally {
    page.cleanup();
    // Release the canvas memory now rather than whenever it is collected.
    canvas.width = 0;
    canvas.height = 0;
  }
}
