import { Apps } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.more-pdf-tools.title'),
  path: '/more-pdf-tools',
  description: translate('tools.more-pdf-tools.description'),
  keywords: ['pdf', 'bentopdf', 'word', 'excel', 'ocr', 'compress', 'edit', 'sign', 'watermark', 'convert', '转换', '转 Word', '转 Excel', '文字识别', '压缩', '编辑', '签名', '水印', '加密'],
  component: () => import('./more-pdf-tools.vue'),
  icon: Apps,
  createdAt: new Date('2026-09-24'),
});
