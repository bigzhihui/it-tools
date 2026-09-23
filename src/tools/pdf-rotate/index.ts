import { RotateClockwise } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.pdf-rotate.title'),
  path: '/pdf-rotate',
  description: translate('tools.pdf-rotate.description'),
  keywords: ['pdf', 'rotate', 'turn', 'orientation', 'landscape', 'portrait', 'upside down', '旋转', '方向', '横向', '纵向', '转正', '倒置'],
  component: () => import('./pdf-rotate.vue'),
  icon: RotateClockwise,
  createdAt: new Date('2026-09-23'),
});
