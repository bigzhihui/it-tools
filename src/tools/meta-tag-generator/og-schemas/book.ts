import type { OGSchemaType } from '../OGSchemaType.type';

export const book: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.book',
  elements: [
    { type: 'input', label: 'tools.og-meta-generator.fields.author', key: 'book:author', placeholder: 'tools.og-meta-generator.placeholders.bookAuthor' },
    { type: 'input', label: 'tools.og-meta-generator.fields.isbn', key: 'book:isbn', placeholder: 'tools.og-meta-generator.placeholders.isbn' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.releaseDate',
      key: 'book:release_date',
      placeholder: 'tools.og-meta-generator.placeholders.bookReleaseDate',
    },
    { type: 'input', label: 'tools.og-meta-generator.fields.tag', key: 'book:tag', placeholder: 'tools.og-meta-generator.placeholders.bookTag' },
  ],
};
