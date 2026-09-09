import type { OGSchemaType } from '../OGSchemaType.type';
import { videoMovie } from './videoMovie';

export const videoEpisode: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.videoEpisodeDetails',
  elements: [
    ...videoMovie.elements,
    { type: 'input', label: 'tools.og-meta-generator.fields.series', key: 'video:series', placeholder: 'tools.og-meta-generator.placeholders.series' },
  ],
};
