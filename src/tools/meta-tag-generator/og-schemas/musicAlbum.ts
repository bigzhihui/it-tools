import type { OGSchemaType } from '../OGSchemaType.type';

export const musicAlbum: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.albumDetails',
  elements: [
    { type: 'input', label: 'tools.og-meta-generator.fields.song', key: 'music:song', placeholder: 'tools.og-meta-generator.placeholders.albumSong' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.disc',
      key: 'music:song:disc',
      placeholder: 'tools.og-meta-generator.placeholders.disc',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.track',
      key: 'music:song:track',
      placeholder: 'tools.og-meta-generator.placeholders.track',
    },
    { type: 'input', label: 'tools.og-meta-generator.fields.musician', key: 'music:musician', placeholder: 'tools.og-meta-generator.placeholders.musician' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.releaseDate',
      key: 'music:release_date',
      placeholder: 'tools.og-meta-generator.placeholders.albumReleaseDate',
    },
  ],
};
