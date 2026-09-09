import type { OGSchemaType } from '../OGSchemaType.type';

export const musicSong: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.songDetails',
  elements: [
    { type: 'input', label: 'tools.og-meta-generator.fields.duration', placeholder: 'tools.og-meta-generator.placeholders.songDuration', key: 'music:duration' },
    { type: 'input', label: 'tools.og-meta-generator.fields.album', placeholder: 'tools.og-meta-generator.placeholders.songAlbum', key: 'music:album' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.disc',
      placeholder: 'tools.og-meta-generator.placeholders.songDisc',
      key: 'music:album:disk',
    },
    { type: 'input', label: 'tools.og-meta-generator.fields.track', placeholder: 'tools.og-meta-generator.placeholders.songTrack', key: 'music:album:track' },
    {
      type: 'input-multiple',
      label: 'tools.og-meta-generator.fields.musician',
      placeholder: 'tools.og-meta-generator.placeholders.musician',
      key: 'music:musician',
    },
  ],
};
