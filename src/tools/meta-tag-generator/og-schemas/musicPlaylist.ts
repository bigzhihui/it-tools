import type { OGSchemaType } from '../OGSchemaType.type';

export const musicPlaylist: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.playlistDetails',
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
    { type: 'input', label: 'tools.og-meta-generator.fields.creator', key: 'music:creator', placeholder: 'tools.og-meta-generator.placeholders.playlistCreator' },
  ],
};
