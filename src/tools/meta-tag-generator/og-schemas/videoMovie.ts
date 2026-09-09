import type { OGSchemaType } from '../OGSchemaType.type';

export const videoMovie: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.movieDetails',
  elements: [
    {
      type: 'input-multiple',
      label: 'tools.og-meta-generator.fields.actor',
      key: 'video:actor',
      placeholder: 'tools.og-meta-generator.placeholders.actor',
    },
    // { type: 'input', label: 'Actor role', key: 'video:actor:role', placeholder: 'The role they played...' },
    {
      type: 'input-multiple',
      label: 'tools.og-meta-generator.fields.director',
      key: 'video:director',
      placeholder: 'tools.og-meta-generator.placeholders.director',
    },
    { type: 'input-multiple', label: 'tools.og-meta-generator.fields.writer', key: 'video:writer', placeholder: 'tools.og-meta-generator.placeholders.writer' },
    { type: 'input', label: 'tools.og-meta-generator.fields.duration', key: 'video:duration', placeholder: 'tools.og-meta-generator.placeholders.movieDuration' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.releaseDate',
      key: 'video:release_date',
      placeholder: 'tools.og-meta-generator.placeholders.movieReleaseDate',
    },
    { type: 'input', label: 'tools.og-meta-generator.fields.tag', key: 'video:tag', placeholder: 'tools.og-meta-generator.placeholders.movieTag' },
  ],
};
