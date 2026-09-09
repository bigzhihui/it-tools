import { defineStore } from 'pinia';
import _ from 'lodash';
import type { PaletteOption } from './command-palette.types';
import { useToolStore } from '@/tools/tools.store';
import { useFuzzySearch } from '@/composable/fuzzySearch';
import { useStyleStore } from '@/stores/style.store';

import SunIcon from '~icons/mdi/white-balance-sunny';
import GithubIcon from '~icons/mdi/github';
import BugIcon from '~icons/mdi/bug-outline';
import DiceIcon from '~icons/mdi/dice-5';
import InfoIcon from '~icons/mdi/information-outline';

export const useCommandPaletteStore = defineStore('command-palette', () => {
  const toolStore = useToolStore();
  const styleStore = useStyleStore();
  const router = useRouter();
  const { t } = useI18n();
  const searchPrompt = ref('');

  const searchOptions = computed<PaletteOption[]>(() => {
    const toolsOptions = toolStore.tools.map(tool => ({
      ...tool,
      to: tool.path,
      toolCategory: tool.category,
      category: t('commandPalette.categories.tools'),
    }));

    return [
      ...toolsOptions,
      {
        name: t('commandPalette.commands.randomTool.name'),
        description: t('commandPalette.commands.randomTool.description'),
        action: () => {
          const { path } = _.sample(toolStore.tools)!;
          router.push(path);
        },
        icon: DiceIcon,
        category: t('commandPalette.categories.tools'),
        keywords: ['random', 'tool', 'pick', 'choose', 'select', '随机', '工具'],
        closeOnSelect: true,
      },
      {
        name: t('commandPalette.commands.toggleDarkMode.name'),
        description: t('commandPalette.commands.toggleDarkMode.description'),
        action: () => styleStore.toggleDark(),
        icon: SunIcon,
        category: t('commandPalette.categories.actions'),
        keywords: ['dark', 'theme', 'toggle', 'mode', 'light', 'system', '暗色', '深色', '明亮', '模式', '主题'],
      },
      {
        name: t('commandPalette.commands.githubRepo.name'),
        href: 'https://github.com/bigzhihui/it-tools',
        category: t('commandPalette.categories.external'),
        description: t('commandPalette.commands.githubRepo.description'),
        keywords: ['github', 'repo', 'repository', 'source', 'code', '仓库', '源码'],
        icon: GithubIcon,
      },
      {
        name: t('commandPalette.commands.reportBug.name'),
        description: t('commandPalette.commands.reportBug.description'),
        href: 'https://github.com/bigzhihui/it-tools/issues/new/choose',
        category: t('commandPalette.categories.actions'),
        keywords: ['report', 'issue', 'bug', 'problem', 'error', '报告', '问题', '反馈'],
        icon: BugIcon,
      },
      {
        name: t('commandPalette.commands.about.name'),
        description: t('commandPalette.commands.about.description'),
        to: '/about',
        category: t('commandPalette.categories.pages'),
        keywords: ['about', 'learn', 'more', 'info', 'information', '关于'],
        icon: InfoIcon,
      },
    ];
  });

  const { searchResult } = useFuzzySearch({
    search: searchPrompt,
    data: searchOptions,
    options: {
      keys: [{ name: 'name', weight: 2 }, 'description', 'keywords', 'category'],
      threshold: 0.3,
    },
  });

  const filteredSearchResult = computed(() =>
    _.chain(searchResult.value).groupBy('category').mapValues(categoryOptions => _.take(categoryOptions, 5)).value());

  return {
    filteredSearchResult,
    searchPrompt,
  };
});
