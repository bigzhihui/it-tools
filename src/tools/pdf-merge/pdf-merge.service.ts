import { PDFDocument } from 'pdf-lib';

export type PdfReadResult =
  | { ok: true; pageCount: number }
  | { ok: false; reason: 'encrypted' | 'invalid' };

// Reads just enough of a file to know whether it can be merged and how many
// pages it has, so problems surface when the file is added, not at merge time.
export async function inspectPdf(bytes: ArrayBuffer | Uint8Array): Promise<PdfReadResult> {
  let document: PDFDocument;

  try {
    // Load with encryption ignored and ask the document directly. pdf-lib is
    // compiled to ES5, where its EncryptedPDFError subclass loses its
    // prototype, so `instanceof` on the thrown error is always false.
    document = await PDFDocument.load(bytes, { ignoreEncryption: true });
  }
  catch {
    return { ok: false, reason: 'invalid' };
  }

  if (document.isEncrypted) {
    return { ok: false, reason: 'encrypted' };
  }

  return { ok: true, pageCount: document.getPageCount() };
}

// Copies every page of each source, in the order given, into a new document.
// Pages are copied as is: text and images keep their original quality because
// nothing is re-encoded.
export async function mergePdfs(sources: Array<ArrayBuffer | Uint8Array>): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (const bytes of sources) {
    const source = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(source, source.getPageIndices());

    for (const page of pages) {
      merged.addPage(page);
    }
  }

  return merged.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  // A blob URL rather than a base64 data URL: merged documents can be large,
  // and base64 would inflate them by a third and hold two copies in memory.
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  // Revoke on the next tick, once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
