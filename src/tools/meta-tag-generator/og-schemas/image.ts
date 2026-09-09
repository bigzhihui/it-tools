import type { OGSchemaType } from '../OGSchemaType.type';

export const image: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.image',
  elements: [
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.imageUrl',
      placeholder: 'tools.og-meta-generator.placeholders.imageUrl',
      key: 'image',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.imageAlt',
      placeholder: 'tools.og-meta-generator.placeholders.imageAlt',
      key: 'image:alt',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.imageWidth',
      placeholder: 'tools.og-meta-generator.placeholders.imageWidth',
      key: 'image:width',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.imageHeight',
      placeholder: 'tools.og-meta-generator.placeholders.imageHeight',
      key: 'image:height',
    },
  ],
};
