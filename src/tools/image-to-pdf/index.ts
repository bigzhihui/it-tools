import { Photo } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.image-to-pdf.title'),
  path: '/image-to-pdf',
  description: translate('tools.image-to-pdf.description'),
  keywords: ['image', 'picture', 'photo', 'jpg', 'jpeg', 'png', 'webp', 'pdf', 'convert', 'scan', '图片', '照片', '转换', '转PDF', '扫描件', '合成'],
  component: () => import('./image-to-pdf.vue'),
  icon: Photo,
  createdAt: new Date('2026-09-23'),
});
