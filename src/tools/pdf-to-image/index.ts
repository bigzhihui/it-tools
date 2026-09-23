import { FileExport } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.pdf-to-image.title'),
  path: '/pdf-to-image',
  description: translate('tools.pdf-to-image.description'),
  keywords: ['pdf', 'image', 'picture', 'jpg', 'jpeg', 'png', 'convert', 'export', 'render', 'page', '图片', '转换', '转图片', '转JPG', '导出', '截图'],
  component: () => import('./pdf-to-image.vue'),
  icon: FileExport,
  createdAt: new Date('2026-09-23'),
});
