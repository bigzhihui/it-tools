import { Files } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.pdf-merge.title'),
  path: '/pdf-merge',
  description: translate('tools.pdf-merge.description'),
  keywords: ['pdf', 'merge', 'combine', 'join', 'concat', 'append', '合并', '拼接', '组合'],
  component: () => import('./pdf-merge.vue'),
  icon: Files,
  createdAt: new Date('2026-09-23'),
});
