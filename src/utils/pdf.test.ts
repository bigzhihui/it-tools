import { PDFArray, PDFDict, PDFDocument, PDFName, PDFString } from 'pdf-lib';
import type { PDFPage, PDFRef } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { copyPagesInto, inspectPdf } from './pdf';

async function pdfWithPages(count: number) {
  const document = await PDFDocument.create();
  for (let i = 0; i < count; i++) {
    document.addPage([100, 100]);
  }
  return document.save();
}

async function encryptedPdf() {
  const document = await PDFDocument.create();
  document.addPage([100, 100]);
  // pdf-lib cannot encrypt, but a trailer that points at an /Encrypt
  // dictionary is exactly what readers use to decide a file is encrypted.
  document.context.trailerInfo.Encrypt = document.context.register(document.context.obj({ Filter: 'Standard' }));
  return document.save({ useObjectStreams: false });
}

// Pages 100, 200, 300... points wide, each drawing a marker such as
// PAGE-2-SECRET, so a page that should have been left out shows up in the
// output. `build` adds whatever links, fields or shared resources a test needs.
async function markedPdf(pageCount: number, build: (document: PDFDocument, pages: PDFPage[]) => void = () => {}) {
  const document = await PDFDocument.create();
  const pages = Array.from({ length: pageCount }, (_, i) => {
    const page = document.addPage([100 * (i + 1), 100]);
    page.node.set(PDFName.of('Contents'), document.context.register(document.context.stream(`% PAGE-${i + 1}-SECRET\n`)));
    return page;
  });

  build(document, pages);
  return document.save();
}

async function copy(bytes: Uint8Array, indices: number[]) {
  const target = await PDFDocument.create();
  copyPagesInto(target, await PDFDocument.load(bytes), indices);
  return PDFDocument.load(await target.save());
}

// Every object in the file as text, including stream contents and objects
// that no page refers to.
function everythingIn(document: PDFDocument) {
  return document.context.enumerateIndirectObjects().map(([, object]) => object.toString()).join('\n');
}

function linkAnnotation(document: PDFDocument, target: PDFPage) {
  return document.context.register(document.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [0, 0, 10, 10],
    Dest: [target.ref, PDFName.of('Fit')],
  }));
}

// The page each link on the document's pages goes to, whether the link holds
// its destination itself or in a go-to action.
function linkTargets(document: PDFDocument) {
  return document.getPages().flatMap((page) => {
    const annotations = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray)?.asArray() ?? [];
    return annotations.map((annotation) => {
      const link = document.context.lookup(annotation, PDFDict);
      const destination = link.lookupMaybe(PDFName.of('Dest'), PDFArray) ?? link.lookup(PDFName.of('A'), PDFDict).lookup(PDFName.of('D'), PDFArray);
      return destination.get(0);
    });
  });
}

describe('pdf utils', () => {
  describe('inspectPdf', () => {
    it('reports the page count of a valid file', async () => {
      expect(await inspectPdf(await pdfWithPages(3))).toEqual({ ok: true, pageCount: 3 });
    });

    it('flags a file that is not a PDF', async () => {
      const notAPdf = new TextEncoder().encode('just some text, not a pdf');

      expect(await inspectPdf(notAPdf)).toEqual({ ok: false, reason: 'invalid' });
    });

    it('flags an encrypted file separately', async () => {
      expect(await inspectPdf(await encryptedPdf())).toEqual({ ok: false, reason: 'encrypted' });
    });
  });

  describe('copyPagesInto', () => {
    it('copies the given pages in the given order', async () => {
      const output = await copy(await markedPdf(3), [2, 0]);

      expect(output.getPages().map(page => page.getWidth())).toEqual([300, 100]);
    });

    it('refuses to copy a page twice', async () => {
      const target = await PDFDocument.create();
      const source = await PDFDocument.load(await markedPdf(2));

      expect(() => copyPagesInto(target, source, [0, 0])).toThrow();
    });

    it('does not carry pages left behind through links to them', async () => {
      const bytes = await markedPdf(3, (document, pages) => {
        pages[0].node.set(PDFName.of('Annots'), document.context.obj([linkAnnotation(document, pages[1]), linkAnnotation(document, pages[2])]));
      });

      const output = await copy(bytes, [0, 1]);
      const pagesInFile = output.context.enumerateIndirectObjects().filter(([, object]) => object instanceof PDFDict && object.get(PDFName.of('Type')) === PDFName.of('Page'));

      expect(everythingIn(output)).not.toContain('PAGE-3-SECRET');
      expect(pagesInFile).toHaveLength(2);
      // The link to page 3 would lead nowhere, so it is gone.
      expect(linkTargets(output)).toEqual([output.getPage(1).ref]);
    });

    it('keeps links between copied pages working, whatever their new order', async () => {
      const bytes = await markedPdf(3, (document, pages) => {
        pages[0].node.set(PDFName.of('Annots'), document.context.obj([linkAnnotation(document, pages[2])]));
      });

      const output = await copy(bytes, [2, 0]);

      expect(linkTargets(output)).toEqual([output.getPage(0).ref]);
    });

    it('keeps links that name their target working, since the names are not copied', async () => {
      const bytes = await markedPdf(3, (document, pages) => {
        const { catalog, context } = document;
        const link = (target: object) => context.register(context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [0, 0, 10, 10], ...target }));

        // Older files list names in a dictionary, newer ones in a name tree.
        catalog.set(PDFName.of('Dests'), context.obj({ second: [pages[1].ref, PDFName.of('Fit')] }));
        catalog.set(PDFName.of('Names'), context.obj({
          Dests: { Kids: [context.register(context.obj({ Names: [PDFString.of('third'), context.obj({ D: [pages[2].ref, PDFName.of('Fit')] })] }))] },
        }));
        pages[0].node.set(PDFName.of('Annots'), context.obj([
          link({ Dest: PDFName.of('second') }),
          link({ A: { S: 'GoTo', D: PDFString.of('third') } }),
        ]));
      });

      const output = await copy(bytes, [0, 2]);

      expect(linkTargets(output)).toEqual([output.getPage(1).ref]);
    });

    it('does not carry pages left behind through form fields grouped with theirs', async () => {
      const bytes = await markedPdf(2, (document, pages) => {
        const { context } = document;
        const form = context.nextRef();
        const widget = (page: PDFPage, parent: PDFRef, appearance: string) => context.register(context.obj({
          Type: 'Annot',
          Subtype: 'Widget',
          Rect: [0, 0, 10, 10],
          P: page.ref,
          Parent: parent,
          AP: { N: context.register(context.stream(appearance, { Type: 'XObject', Subtype: 'Form', BBox: [0, 0, 10, 10], Resources: {} })) },
        }));
        const firstField = context.nextRef();
        const secondField = context.nextRef();
        const firstWidget = widget(pages[0], firstField, '% FIELD-1-APPEARANCE\n');
        const secondWidget = widget(pages[1], secondField, '% PAGE-2-SECRET-APPEARANCE\n');

        context.assign(form, context.obj({ T: PDFString.of('form'), Kids: [firstField, secondField] }));
        context.assign(firstField, context.obj({ T: PDFString.of('name'), FT: 'Tx', Parent: form, Kids: [firstWidget] }));
        context.assign(secondField, context.obj({ T: PDFString.of('id'), FT: 'Tx', Parent: form, V: PDFString.of('PAGE-2-SECRET-VALUE'), Kids: [secondWidget] }));
        pages[0].node.set(PDFName.of('Annots'), context.obj([firstWidget]));
        pages[1].node.set(PDFName.of('Annots'), context.obj([secondWidget]));
      });

      const everything = everythingIn(await copy(bytes, [0]));

      expect(everything).toContain('FIELD-1-APPEARANCE');
      expect(everything).not.toContain('PAGE-2-SECRET');
    });

    // The pattern LibreOffice produces: one resource dictionary for all pages.
    describe('with resources shared by every page', () => {
      function shareResources(document: PDFDocument, pages: PDFPage[], contentOf: (page: number) => { content: string; decodeParms?: { Predictor: number } }) {
        const { context } = document;
        const xObjects = context.obj({});

        pages.forEach((_, i) => {
          // A drawing with no resources of its own, which draws with the page's.
          xObjects.set(PDFName.of(`Fm${i + 1}`), context.register(context.stream(`% PAGE-${i + 1}-SECRET-DRAWING\n/Im${i + 1} Do\n`, {
            Type: 'XObject',
            Subtype: 'Form',
            BBox: [0, 0, 10, 10],
          })));
          xObjects.set(PDFName.of(`Im${i + 1}`), context.register(context.stream(`PAGE-${i + 1}-SECRET-IMAGE`, {
            Type: 'XObject',
            Subtype: 'Image',
            Width: 1,
            Height: 1,
            ColorSpace: 'DeviceGray',
            BitsPerComponent: 8,
          })));
        });

        const resources = context.register(context.obj({ XObject: xObjects }));
        pages.forEach((page, i) => {
          const { content, decodeParms } = contentOf(i + 1);
          page.node.set(PDFName.of('Resources'), resources);
          page.node.set(PDFName.of('Contents'), context.register(context.stream(content, decodeParms ? { DecodeParms: decodeParms } : {})));
        });
      }

      it('keeps only what the copied pages draw, nested drawings included', async () => {
        const bytes = await markedPdf(3, (document, pages) => shareResources(document, pages, page => ({ content: `q /Fm${page} Do Q` })));

        const output = await copy(bytes, [0]);
        const everything = everythingIn(output);
        const xObjects = output.getPage(0).node.Resources()?.lookup(PDFName.of('XObject'), PDFDict);

        expect(everything).toContain('PAGE-1-SECRET-DRAWING');
        expect(everything).toContain('PAGE-1-SECRET-IMAGE');
        expect(everything).not.toContain('PAGE-2-SECRET');
        expect(everything).not.toContain('PAGE-3-SECRET');
        expect(xObjects?.keys()).toEqual([PDFName.of('Fm1'), PDFName.of('Im1')]);
      });

      it('keeps everything when it cannot read what a page draws', async () => {
        const bytes = await markedPdf(2, (document, pages) => shareResources(document, pages, page => ({
          content: `q /Fm${page} Do Q`,
          decodeParms: { Predictor: 12 },
        })));

        const everything = everythingIn(await copy(bytes, [0]));

        expect(everything).toContain('PAGE-1-SECRET-IMAGE');
        expect(everything).toContain('PAGE-2-SECRET-IMAGE');
      });
    });
  });
});
