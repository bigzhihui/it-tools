import {
  PDFDocument,
  concatTransformationMatrix,
  drawObject,
  popGraphicsState,
  pushGraphicsState,
} from 'pdf-lib';

export type ImageFormat = 'jpg' | 'png';
export type PageSize = 'image' | 'a4';

export interface EmbeddableImage {
  bytes: Uint8Array
  format: ImageFormat
}

// A4 in points, portrait.
const A4 = { width: 595.28, height: 841.89 };
const POINTS_PER_MM = 72 / 25.4;
// Screen pixels at 96 per inch, as browsers show images at their natural size.
const POINTS_PER_PIXEL = 0.75;

// JPEG and PNG can go into a PDF as they are; anything else has to be redrawn.
export function detectFormat(bytes: Uint8Array): ImageFormat | null {
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'jpg';
  }

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'png';
  }

  return null;
}

// The orientation a camera recorded in a JPEG's EXIF data, from 1 (upright)
// to 8, or 1 when there is none. Phones store portrait photos sideways and set
// this, and a PDF shows the stored pixels unless told otherwise.
export function jpegOrientation(bytes: Uint8Array): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) {
    return 1;
  }

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);

    // A fill byte before the next marker.
    if (marker === 0xFFFF) {
      offset += 1;
      continue;
    }

    // Past the headers: the image data starts, or the file ends.
    if ((marker & 0xFF00) !== 0xFF00 || marker === 0xFFDA || marker === 0xFFD9) {
      return 1;
    }

    const length = view.getUint16(offset + 2);
    const end = Math.min(offset + 2 + length, view.byteLength);

    if (marker === 0xFFE1 && isExifHeader(view, offset + 4, end)) {
      return exifOrientation(view, offset + 10, end);
    }

    offset += 2 + length;
  }

  return 1;
}

function isExifHeader(view: DataView, offset: number, end: number) {
  return offset + 6 <= end && [0x45, 0x78, 0x69, 0x66, 0, 0].every((byte, i) => view.getUint8(offset + i) === byte);
}

function exifOrientation(view: DataView, tiff: number, end: number) {
  if (tiff + 8 > end) {
    return 1;
  }

  const byteOrder = view.getUint16(tiff);
  if (byteOrder !== 0x4949 && byteOrder !== 0x4D4D) {
    return 1;
  }

  const littleEndian = byteOrder === 0x4949;
  const firstDirectory = tiff + view.getUint32(tiff + 4, littleEndian);
  if (view.getUint16(tiff + 2, littleEndian) !== 42 || firstDirectory + 2 > end) {
    return 1;
  }

  const entries = view.getUint16(firstDirectory, littleEndian);
  for (let i = 0; i < entries; i++) {
    const entry = firstDirectory + 2 + i * 12;
    if (entry + 12 > end) {
      return 1;
    }

    if (view.getUint16(entry, littleEndian) === 0x0112) {
      const orientation = view.getUint16(entry + 8, littleEndian);
      return orientation >= 1 && orientation <= 8 ? orientation : 1;
    }
  }

  return 1;
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

// Where the image goes on its page. At image size the page takes the image's
// dimensions; on A4 the image is scaled to fit inside the margins and centred,
// on a landscape page when the image is wider than it is tall.
export function layoutPage(imageWidth: number, imageHeight: number, pageSize: PageSize, marginMm: number) {
  if (pageSize === 'image') {
    const width = imageWidth * POINTS_PER_PIXEL;
    const height = imageHeight * POINTS_PER_PIXEL;
    return { pageWidth: width, pageHeight: height, box: { x: 0, y: 0, width, height } };
  }

  const landscape = imageWidth > imageHeight;
  const pageWidth = landscape ? A4.height : A4.width;
  const pageHeight = landscape ? A4.width : A4.height;
  const margin = marginMm * POINTS_PER_MM;
  const scale = Math.min((pageWidth - 2 * margin) / imageWidth, (pageHeight - 2 * margin) / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return { pageWidth, pageHeight, box: { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height } };
}

// The transformation that draws the stored image upright in `box`. A PDF
// draws an image into a unit square, and each EXIF orientation is a turn or a
// flip of that square; for 5 to 8 the stored image is sideways, so `box` has
// its width and height swapped relative to the stored pixels.
export function orientationMatrix(orientation: number, { x, y, width: w, height: h }: Box): [number, number, number, number, number, number] {
  switch (orientation) {
    case 2: return [-w, 0, 0, h, x + w, y];
    case 3: return [-w, 0, 0, -h, x + w, y + h];
    case 4: return [w, 0, 0, -h, x, y + h];
    case 5: return [0, -h, -w, 0, x + w, y + h];
    case 6: return [0, -h, w, 0, x, y + h];
    case 7: return [0, h, w, 0, x, y];
    case 8: return [0, h, -w, 0, x + w, y];
    default: return [w, 0, 0, h, x, y];
  }
}

// One page per image, in the order given. JPEGs go in as they are, so their
// quality is untouched, and are turned upright as their EXIF data says.
export async function imagesToPdf(images: EmbeddableImage[], { pageSize, marginMm }: { pageSize: PageSize; marginMm: number }): Promise<Uint8Array> {
  const document = await PDFDocument.create();

  for (const { bytes, format } of images) {
    const image = format === 'jpg' ? await document.embedJpg(bytes) : await document.embedPng(bytes);
    const orientation = format === 'jpg' ? jpegOrientation(bytes) : 1;
    const sideways = orientation >= 5;
    const [uprightWidth, uprightHeight] = sideways ? [image.height, image.width] : [image.width, image.height];
    const { pageWidth, pageHeight, box } = layoutPage(uprightWidth, uprightHeight, pageSize, marginMm);

    const page = document.addPage([pageWidth, pageHeight]);
    const name = page.node.newXObject('Image', image.ref);
    page.pushOperators(
      pushGraphicsState(),
      concatTransformationMatrix(...orientationMatrix(orientation, box)),
      drawObject(name),
      popGraphicsState(),
    );
  }

  return document.save();
}
