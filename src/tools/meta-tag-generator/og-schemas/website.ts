import type { OGSchemaType } from '../OGSchemaType.type';

const typeOptions = [
  { label: 'tools.og-meta-generator.typeOptions.website', value: 'website' },
  { label: 'tools.og-meta-generator.typeOptions.article', value: 'article' },
  { label: 'tools.og-meta-generator.typeOptions.book', value: 'book' },
  { label: 'tools.og-meta-generator.typeOptions.profile', value: 'profile' },
  {
    type: 'group',
    label: 'tools.og-meta-generator.typeOptions.music',
    key: 'Music',
    children: [
      { label: 'tools.og-meta-generator.typeOptions.song', value: 'music.song' },
      { label: 'tools.og-meta-generator.typeOptions.musicAlbum', value: 'music.album' },
      { label: 'tools.og-meta-generator.typeOptions.playlist', value: 'music.playlist' },
      { label: 'tools.og-meta-generator.typeOptions.radioStation', value: 'music.radio_station' },
    ],
  },
  {
    type: 'group',
    label: 'tools.og-meta-generator.typeOptions.video',
    key: 'Video',
    children: [
      { label: 'tools.og-meta-generator.typeOptions.movie', value: 'video.movie' },
      { label: 'tools.og-meta-generator.typeOptions.episode', value: 'video.episode' },
      { label: 'tools.og-meta-generator.typeOptions.tvShow', value: 'video.tv_show' },
      { label: 'tools.og-meta-generator.typeOptions.otherVideo', value: 'video.other' },
    ],
  },
];

export const website: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.generalInfo',
  elements: [
    {
      type: 'select',
      label: 'tools.og-meta-generator.fields.pageType',
      placeholder: 'tools.og-meta-generator.placeholders.pageType',
      key: 'type',
      options: typeOptions,
    },
    { type: 'input', label: 'tools.og-meta-generator.fields.title', placeholder: 'tools.og-meta-generator.placeholders.title', key: 'title' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.description',
      placeholder: 'tools.og-meta-generator.placeholders.description',
      key: 'description',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.pageUrl',
      placeholder: 'tools.og-meta-generator.placeholders.pageUrl',
      key: 'url',
    },
  ],
};
