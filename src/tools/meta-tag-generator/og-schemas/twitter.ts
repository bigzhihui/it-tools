import type { OGSchemaType } from '../OGSchemaType.type';

export const twitter: OGSchemaType = {
  name: 'tools.og-meta-generator.sections.twitter',
  elements: [
    {
      type: 'select',
      options: [
        { label: 'tools.og-meta-generator.twitterCardOptions.summary', value: 'summary' },
        { label: 'tools.og-meta-generator.twitterCardOptions.summaryLargeImage', value: 'summary_large_image' },
        { label: 'tools.og-meta-generator.twitterCardOptions.app', value: 'app' },
        { label: 'tools.og-meta-generator.twitterCardOptions.player', value: 'player' },
      ],
      label: 'tools.og-meta-generator.fields.cardType',
      placeholder: 'tools.og-meta-generator.placeholders.cardType',
      key: 'twitter:card',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.siteAccount',
      placeholder: 'tools.og-meta-generator.placeholders.siteAccount',
      key: 'twitter:site',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.fields.creatorAccount',
      placeholder: 'tools.og-meta-generator.placeholders.creatorAccount',
      key: 'twitter:creator',
    },
  ],
};
