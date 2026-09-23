import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFObjectCopier,
  PDFPage,
  PDFRawStream,
  PDFString,
  decodePDFRawStream,
} from 'pdf-lib';
import type { PDFContext, PDFObject, PDFPageLeaf } from 'pdf-lib';

export type PdfReadResult =
  | { ok: true; pageCount: number }
  | { ok: false; reason: 'encrypted' | 'invalid' };

// Reads just enough of a file to know whether it can be processed and how many
// pages it has, so problems surface when a file is added, not later on.
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

export function downloadPdf(bytes: Uint8Array, filename: string) {
  // A blob URL rather than a base64 data URL: PDFs can be large, and base64
  // would inflate them by a third and hold two copies in memory.
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  // Revoke on the next tick, once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// Copies the pages at `indices` (0-based, in that order, no repeats) from
// `source` to the end of `target`. It edits `source` in memory, so load a fresh
// copy for each call.
//
// pdf-lib's own copyPages follows every reference it meets. A link to another
// page, a form field grouped with fields on other pages, or a resource
// dictionary shared by all pages each drags the pages behind them into the
// output: invisible in a viewer, but still in the file for anyone who looks.
// It also gives each link a hidden duplicate of the page it points to, so
// links between copied pages stop working.
export function copyPagesInto(target: PDFDocument, source: PDFDocument, indices: number[]) {
  if (new Set(indices).size !== indices.length) {
    throw new Error('A page can only be copied once');
  }

  const sourcePages = source.getPages();
  const copier = PDFObjectCopier.for(source.context, target.context);
  // What the copier has already copied, keyed by source object. Seeding it
  // points every reference to a source page at that page's copy, or at null
  // for pages left behind, so the copier never follows one into another page.
  const copies = (copier as unknown as { traversedObjects: Map<PDFObject, PDFObject> }).traversedObjects;
  const targetRefs = new Map(indices.map(index => [index, target.context.nextRef()]));

  sourcePages.forEach((page, index) => copies.set(page.ref, targetRefs.get(index) ?? PDFNull));

  const leavesPagesBehind = indices.length < sourcePages.length;
  const sharedXObjects = leavesPagesBehind ? findSharedXObjects(sourcePages) : new Set<PDFDict>();
  const destinations = namedDestinations(source);

  for (const [index, ref] of targetRefs) {
    const page = sourcePages[index].node;

    resolveNamedLinks(page, destinations);

    if (leavesPagesBehind) {
      detachFormFields(page);
      pruneSharedXObjects(page, sharedXObjects);
      // Private data of the application that made the page. Illustrator, for
      // one, stores the whole editable document here, every artboard included.
      page.delete(PDFName.of('PieceInfo'));
    }

    const copy = copier.copy(page);
    dropLinksLeadingNowhere(copy);
    target.context.assign(ref, copy);
    target.addPage(PDFPage.of(copy, ref, target));
  }
}

// Links to pages left behind now point at null. Some viewers report an error
// when one is clicked, so they are removed instead.
function dropLinksLeadingNowhere(page: PDFPageLeaf) {
  const { context } = page;
  const annotations = context.lookup(page.get(PDFName.of('Annots')));

  if (!(annotations instanceof PDFArray)) {
    return;
  }

  for (let i = annotations.size() - 1; i >= 0; i--) {
    const link = context.lookup(annotations.get(i));
    const action = link instanceof PDFDict ? lookupDict(context, link.get(PDFName.of('A'))) : undefined;
    const destination = link instanceof PDFDict
      ? context.lookup(link.get(PDFName.of('Dest'))) ?? (action?.lookup(PDFName.of('S')) === PDFName.of('GoTo') ? context.lookup(action.get(PDFName.of('D'))) : undefined)
      : undefined;

    if (destination instanceof PDFArray && destination.get(0) === PDFNull) {
      annotations.remove(i);
    }
  }
}

function lookupDict(context: PDFContext, object: PDFObject | undefined) {
  const value = context.lookup(object);
  return value instanceof PDFDict ? value : undefined;
}

function dictValues(context: PDFContext, dict: PDFDict | undefined) {
  return dict ? dict.entries().map(([, value]) => context.lookup(value)) : [];
}

// A field's widgets can be grouped under parents shared with fields on other
// pages, and the whole group would be copied with its values. The copy has no
// form to belong to, so each widget keeps only its own appearance.
function detachFormFields(page: PDFPageLeaf) {
  for (const annotation of annotationsOf(page)) {
    if (annotation instanceof PDFDict && annotation.lookup(PDFName.of('Subtype')) === PDFName.of('Widget')) {
      annotation.delete(PDFName.of('Parent'));
    }
  }
}

function annotationsOf(page: PDFPageLeaf) {
  const annotations = page.context.lookup(page.get(PDFName.of('Annots')));
  return annotations instanceof PDFArray ? annotations.asArray().map(annotation => page.context.lookup(annotation)) : [];
}

// A destination name as stored, byte for byte. A link can give its target as
// a name or as a string; both are compared by their bytes.
function nameKey(object: PDFObject | undefined) {
  if (object instanceof PDFName) {
    return object.decodeText();
  }

  if (object instanceof PDFString || object instanceof PDFHexString) {
    return String.fromCharCode(...object.asBytes());
  }

  return undefined;
}

// The document's named destinations, each resolved to the page location it
// stands for.
function namedDestinations(document: PDFDocument) {
  const { context, catalog } = document;
  const destinations = new Map<string, PDFObject>();
  const add = (key: PDFObject | undefined, value: PDFObject | undefined) => {
    const name = nameKey(key);
    const destination = context.lookup(value);
    const location = destination instanceof PDFDict ? destination.get(PDFName.of('D')) : destination;

    if (name !== undefined && location !== undefined && !destinations.has(name)) {
      destinations.set(name, location);
    }
  };

  for (const [key, value] of lookupDict(context, catalog.get(PDFName.of('Dests')))?.entries() ?? []) {
    add(key, value);
  }

  // Since PDF 1.2 they can also sit in a name tree, split across kids.
  const names = lookupDict(context, catalog.get(PDFName.of('Names')));
  const pending = [lookupDict(context, names?.get(PDFName.of('Dests')))];
  const visited = new Set<PDFDict>();

  while (pending.length > 0) {
    const node = pending.pop();

    if (!node || visited.has(node)) {
      continue;
    }
    visited.add(node);

    const pairs = context.lookup(node.get(PDFName.of('Names')));
    if (pairs instanceof PDFArray) {
      for (let i = 0; i + 1 < pairs.size(); i += 2) {
        add(context.lookup(pairs.get(i)), pairs.get(i + 1));
      }
    }

    const kids = context.lookup(node.get(PDFName.of('Kids')));
    if (kids instanceof PDFArray) {
      pending.push(...kids.asArray().map(kid => lookupDict(context, kid)));
    }
  }

  return destinations;
}

// Links often name their target, and the names are looked up in the document
// catalog, which is not copied with the pages. Pointing each link at its page
// directly keeps it working, and the copier then treats it like any other
// reference to a page.
function resolveNamedLinks(page: PDFPageLeaf, destinations: Map<string, PDFObject>) {
  const { context } = page;

  for (const annotation of annotationsOf(page)) {
    if (!(annotation instanceof PDFDict)) {
      continue;
    }

    const action = lookupDict(context, annotation.get(PDFName.of('A')));
    const holders: Array<[PDFDict, PDFName]> = [[annotation, PDFName.of('Dest')]];

    if (action && action.lookup(PDFName.of('S')) === PDFName.of('GoTo')) {
      holders.push([action, PDFName.of('D')]);
    }

    for (const [holder, key] of holders) {
      const name = nameKey(context.lookup(holder.get(key)));
      const location = name === undefined ? undefined : destinations.get(name);

      if (location) {
        holder.set(key, location);
      }
    }
  }
}

// Some programs, LibreOffice among them, give every page one resource
// dictionary that lists the images of all pages.
function findSharedXObjects(pages: PDFPage[]) {
  const seen = new Set<PDFDict>();
  const shared = new Set<PDFDict>();

  for (const { node } of pages) {
    const xObjects = xObjectsOf(node);

    if (xObjects && seen.has(xObjects)) {
      shared.add(xObjects);
    }

    if (xObjects) {
      seen.add(xObjects);
    }
  }

  return shared;
}

function resourcesOf(page: PDFPageLeaf) {
  return lookupDict(page.context, page.getInheritableAttribute(PDFName.of('Resources')));
}

function xObjectsOf(page: PDFPageLeaf) {
  const resources = resourcesOf(page);
  return resources && lookupDict(page.context, resources.get(PDFName.of('XObject')));
}

// Gives a page that shares its image list with other pages a list of only the
// images and drawings it uses.
function pruneSharedXObjects(page: PDFPageLeaf, shared: Set<PDFDict>) {
  const resources = resourcesOf(page);
  const xObjects = xObjectsOf(page);

  if (!resources || !xObjects || !shared.has(xObjects)) {
    return;
  }

  const used = xObjectsDrawn(page, resources, xObjects);

  // Keep the full list rather than risk dropping an image the page needs.
  if (!used) {
    return;
  }

  const kept = page.context.obj({});
  for (const [name, value] of xObjects.entries()) {
    if (used.has(name)) {
      kept.set(name, value);
    }
  }

  const ownResources = resources.clone();
  ownResources.set(PDFName.of('XObject'), kept);
  page.set(PDFName.of('Resources'), ownResources);
}

// A name operand followed by the `Do` operator, which draws an XObject.
// Scanning the raw content can also match text inside strings, which only
// keeps an extra image; it never misses a real `Do`.
const DRAW_XOBJECT = /\/([^\t\n\f\r ()<>[\]{}/%]+)(?:[\t\n\f\r ]|%[^\n\r]*)+Do(?![^\t\n\f\r ()<>[\]{}/%])/g;

// The names of the XObjects a page draws, or undefined if some of its content
// cannot be read. Content without resources of its own draws with the page's
// resources, so it counts as well: drawings nested in what the page draws,
// and, erring on the side of keeping too much, glyphs, soft masks, patterns and
// annotation appearances listed alongside.
function xObjectsDrawn(page: PDFPageLeaf, resources: PDFDict, xObjects: PDFDict) {
  const { context } = page;
  const pending: Array<PDFObject | undefined> = [
    ...contentStreamsOf(page),
    ...streamsDrawingWithOuterResources(page, resources),
  ];
  const scanned = new Set<PDFObject | undefined>();
  const used = new Set<PDFName>();

  while (pending.length > 0) {
    const stream = pending.pop();

    if (scanned.has(stream)) {
      continue;
    }
    scanned.add(stream);

    const content = readContent(stream);
    if (content === undefined) {
      return undefined;
    }

    for (const [, rawName] of content.matchAll(DRAW_XOBJECT)) {
      const name = PDFName.of(rawName);
      used.add(name);

      const xObject = context.lookup(xObjects.get(name));
      if (xObject instanceof PDFRawStream && drawsWithOuterResources(xObject)) {
        pending.push(xObject);
      }
    }
  }

  return used;
}

function contentStreamsOf(page: PDFPageLeaf) {
  const contents = page.context.lookup(page.get(PDFName.of('Contents')));

  if (contents === undefined) {
    return [];
  }

  return contents instanceof PDFArray ? contents.asArray().map(part => page.context.lookup(part)) : [contents];
}

function drawsWithOuterResources(stream: PDFRawStream) {
  return !stream.dict.has(PDFName.of('Resources'));
}

function streamsDrawingWithOuterResources(page: PDFPageLeaf, resources: PDFDict) {
  const { context } = page;
  const streams: PDFObject[] = [];
  const addIfDrawingWithOuterResources = (object: PDFObject | undefined) => {
    if (object instanceof PDFRawStream && drawsWithOuterResources(object)) {
      streams.push(object);
    }
  };

  for (const font of dictValues(context, lookupDict(context, resources.get(PDFName.of('Font'))))) {
    if (font instanceof PDFDict && font.lookup(PDFName.of('Subtype')) === PDFName.of('Type3') && !font.has(PDFName.of('Resources'))) {
      for (const glyph of dictValues(context, lookupDict(context, font.get(PDFName.of('CharProcs'))))) {
        if (glyph instanceof PDFRawStream) {
          streams.push(glyph);
        }
      }
    }
  }

  for (const state of dictValues(context, lookupDict(context, resources.get(PDFName.of('ExtGState'))))) {
    const softMask = state instanceof PDFDict ? lookupDict(context, state.get(PDFName.of('SMask'))) : undefined;
    addIfDrawingWithOuterResources(softMask && context.lookup(softMask.get(PDFName.of('G'))));
  }

  for (const pattern of dictValues(context, lookupDict(context, resources.get(PDFName.of('Pattern'))))) {
    addIfDrawingWithOuterResources(pattern);
  }

  for (const annotation of annotationsOf(page)) {
    const appearances = annotation instanceof PDFDict ? lookupDict(context, annotation.get(PDFName.of('AP'))) : undefined;

    for (const appearance of dictValues(context, appearances)) {
      addIfDrawingWithOuterResources(appearance);
      // An appearance with several states, such as a checkbox's on and off.
      for (const state of appearance instanceof PDFDict ? dictValues(context, appearance) : []) {
        addIfDrawingWithOuterResources(state);
      }
    }
  }

  return streams;
}

function readContent(stream: PDFObject | undefined) {
  // pdf-lib's decoder ignores decode parameters such as predictors, so
  // content that uses them cannot be read reliably.
  if (!(stream instanceof PDFRawStream) || stream.dict.has(PDFName.of('DecodeParms'))) {
    return undefined;
  }

  let bytes: Uint8Array;
  try {
    bytes = decodePDFRawStream(stream).decode();
  }
  catch {
    return undefined;
  }

  // Byte for byte, as pdf-lib reads names, with NUL (whitespace in PDF) made a
  // space so the pattern above can stay free of control characters.
  let content = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    content += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return content.split('\0').join(' ');
}
