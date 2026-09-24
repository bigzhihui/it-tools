import { Language } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.pdf-translate.title'),
  path: '/pdf-translate',
  description: translate('tools.pdf-translate.description'),
  keywords: ['pdf', 'translate', 'translation', 'paper', 'bilingual', 'pdf2zh', 'PDFMathTranslate', '翻译', '论文', '文献', '双语', '对照'],
  component: () => import('./pdf-translate.vue'),
  icon: Language,
  createdAt: new Date('2026-09-24'),
});
