import type { OGSchemaType } from '../OGSchemaType.type';

export const musicRadioStation: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.radioStationDetails',
  elements: [
    { type: 'input', label: 'tools.og-meta-generator.fields.creator', key: 'music:creator', placeholder: 'tools.og-meta-generator.placeholders.radioStationCreator' },
  ],
};
