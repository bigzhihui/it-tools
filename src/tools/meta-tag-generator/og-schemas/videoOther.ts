import type { OGSchemaType } from '../OGSchemaType.type';
import { videoMovie } from './videoMovie';

export const videoOther: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.videoOtherDetails',
  elements: [...videoMovie.elements],
};
