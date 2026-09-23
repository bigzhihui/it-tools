import { PDFDocument } from 'pdf-lib';
import { copyPagesInto } from '@/utils/pdf';

// Copies every page of each source, in the order given, into a new document.
// Pages are copied as is: text and images keep their original quality because
// nothing is re-encoded, and links within each file keep working.
export async function mergePdfs(sources: Array<ArrayBuffer | Uint8Array>): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (const bytes of sources) {
    const source = await PDFDocument.load(bytes);
    copyPagesInto(merged, source, source.getPageIndices());
  }

  return merged.save();
}
