import { PDFDocument } from 'pdf-lib';
import { copyPagesInto } from '@/utils/pdf';

export type ExtractMode = 'keep' | 'delete';

// The pages of the new file, 1-based. Keeping follows the order written and
// skips repeats; deleting leaves the other pages in their original order.
export function resultPages(mode: ExtractMode, selected: number[], pageCount: number): number[] {
  if (mode === 'keep') {
    return [...new Set(selected)];
  }

  const deleted = new Set(selected);
  return Array.from({ length: pageCount }, (_, index) => index + 1).filter(page => !deleted.has(page));
}

export async function extractPages(bytes: ArrayBuffer | Uint8Array, pages: number[]): Promise<Uint8Array> {
  const output = await PDFDocument.create();
  copyPagesInto(output, await PDFDocument.load(bytes), pages.map(page => page - 1));
  return output.save();
}
