import type { OGSchemaType } from '../OGSchemaType.type';

export const article: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.article',
  elements: [
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.publishingDate',
      key: 'article:published_time',
      placeholder: 'tools.og-meta-generator.placeholders.publishingDate',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.modificationDate',
      key: 'article:modified_time',
      placeholder: 'tools.og-meta-generator.placeholders.modificationDate',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.expirationDate',
      key: 'article:expiration_time',
      placeholder: 'tools.og-meta-generator.placeholders.expirationDate',
    },
    { type: 'input', label: 'tools.og-meta-generator.fields.author', key: 'article:author', placeholder: 'tools.og-meta-generator.placeholders.author' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.section',
      key: 'article:section',
      placeholder: 'tools.og-meta-generator.placeholders.section',
    },
    { type: 'input', label: 'tools.og-meta-generator.fields.tag', key: 'article:tag', placeholder: 'tools.og-meta-generator.placeholders.tag' },
  ],
};
