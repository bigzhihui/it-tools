import { Scissors } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.pdf-extract-pages.title'),
  path: '/pdf-extract-pages',
  description: translate('tools.pdf-extract-pages.description'),
  keywords: ['pdf', 'extract', 'delete', 'remove', 'split', 'pages', 'select', '提取', '删除', '拆分', '分割', '页面'],
  component: () => import('./pdf-extract-pages.vue'),
  icon: Scissors,
  createdAt: new Date('2026-09-23'),
});
