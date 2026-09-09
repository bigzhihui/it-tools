<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { codesByCategories } from './http-status-codes.constants';
import { zhStatusCodes } from './http-status-codes.zh';
import { useFuzzySearch } from '@/composable/fuzzySearch';

const { t, locale } = useI18n();

const search = ref('');

const localizedCodesByCategories = computed(() => {
  const isZh = locale.value.startsWith('zh');
  return codesByCategories.map(cat => ({
    category: cat.category,
    codes: cat.codes.map((c) => {
      const zh = isZh ? zhStatusCodes[c.code] : null;
      return {
        ...c,
        name: zh ? zh.name : c.name,
        description: zh ? zh.description : c.description,
      };
    }),
  }));
});

const flatCodes = computed(() =>
  localizedCodesByCategories.value.flatMap(({ codes, category }) =>
    codes.map(code => ({ ...code, category })),
  ),
);

const { searchResult } = useFuzzySearch({
  search,
  data: flatCodes,
  options: {
    keys: [{ name: 'code', weight: 3 }, { name: 'name', weight: 2 }, 'description', 'category'],
  },
});

const codesByCategoryFiltered = computed(() => {
  if (!search.value) {
    return localizedCodesByCategories.value;
  }

  return [{ category: 'Search results', codes: searchResult.value }];
});

function getCategoryLabel(category: string) {
  if (category === 'Search results') {
    return t('tools.http-status-codes.searchResults');
  }
  if (category.startsWith('1xx')) {
    return t('tools.http-status-codes.categories.c1xx');
  }
  if (category.startsWith('2xx')) {
    return t('tools.http-status-codes.categories.c2xx');
  }
  if (category.startsWith('3xx')) {
    return t('tools.http-status-codes.categories.c3xx');
  }
  if (category.startsWith('4xx')) {
    return t('tools.http-status-codes.categories.c4xx');
  }
  if (category.startsWith('5xx')) {
    return t('tools.http-status-codes.categories.c5xx');
  }
  return category;
}
</script>

<template>
  <div>
    <c-input-text
      v-model:value="search"
      :placeholder="t('tools.http-status-codes.searchPlaceholder')"
      autofocus
      raw-text
      mb-10
    />

    <div v-for="{ codes, category } of codesByCategoryFiltered" :key="category" mb-8>
      <div mb-2 text-xl>
        {{ getCategoryLabel(category) }}
      </div>

      <c-card v-for="{ code, description, name, type } of codes" :key="code" mb-2>
        <div text-lg font-bold>
          {{ code }} {{ name }}
        </div>
        <div op-70>
          {{ description }} {{ type !== 'HTTP' ? t('tools.http-status-codes.forType', { type }) : '' }}
        </div>
      </c-card>
    </div>
  </div>
</template>
