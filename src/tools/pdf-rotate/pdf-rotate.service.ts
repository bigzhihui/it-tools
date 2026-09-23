import { PDFDocument, degrees } from 'pdf-lib';

export type Rotation = 90 | 180 | 270;

// Turns pages clockwise by `rotation` degrees, on top of any rotation they
// already have. Only each page's display angle changes, so everything else in
// the file, bookmarks, links and forms included, stays as it was.
export async function rotatePages(bytes: ArrayBuffer | Uint8Array, rotation: Rotation, pages?: number[]): Promise<Uint8Array> {
  const document = await PDFDocument.load(bytes);
  const targets = pages ? [...new Set(pages)].map(page => document.getPage(page - 1)) : document.getPages();

  for (const page of targets) {
    const current = page.getRotation().angle;
    // Angles must be multiples of 90; viewers treat anything else as upright.
    const upright = current % 90 === 0 ? current : 0;
    page.setRotation(degrees((((upright + rotation) % 360) + 360) % 360));
  }

  return document.save();
}
