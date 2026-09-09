import type { OGSchemaType } from '../OGSchemaType.type';

export const profile: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.profile',
  elements: [
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.firstName',
      placeholder: 'tools.og-meta-generator.placeholders.firstName',
      key: 'profile:first_name',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.lastName',
      placeholder: 'tools.og-meta-generator.placeholders.lastName',
      key: 'profile:last_name',
    },
    { type: 'input', label: 'tools.og-meta-generator.fields.username', placeholder: 'tools.og-meta-generator.placeholders.username', key: 'profile:username' },
    { type: 'input', label: 'tools.og-meta-generator.fields.gender', placeholder: 'tools.og-meta-generator.placeholders.gender', key: 'profile:gender' },
  ],
};
