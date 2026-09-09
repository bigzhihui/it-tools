<script setup lang="ts">
import { IconHeart } from '@tabler/icons-vue';
import { useHead } from '@vueuse/head';
import { NIcon } from 'naive-ui';

const { t } = useI18n();

useHead(computed(() => ({
  title: `${t('supportPage.title')} - ${t('brand.name')}`,
})));
</script>

<template>
  <div class="mx-auto mt-40px max-w-600px px-4 pb-20 text-center">
    <div class="mb-4 h-16 w-16 inline-flex items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/30">
      <NIcon size="32" :component="IconHeart" />
    </div>

    <h1 class="mb-3 text-2xl font-bold">
      {{ $t('supportPage.mainTitle') }}
    </h1>

    <p class="mx-auto mb-8 max-w-md text-sm text-neutral-500 leading-relaxed dark:text-neutral-400">
      {{ $t('supportPage.description') }}
    </p>

    <!-- 赞助卡片 -->
    <div class="mx-auto max-w-sm border border-neutral-200 rounded-2xl bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
      <div class="mb-2 flex items-center justify-center text-base font-semibold">
        {{ $t('supportPage.alipayTitle') }}
      </div>
      <p class="mb-4 text-xs text-neutral-400">
        {{ $t('supportPage.alipaySubtitle') }}
      </p>

      <div class="my-2 flex justify-center">
        <img
          src="/alipay-sponsor.jpg"
          :alt="$t('supportPage.alipayTitle')"
          class="max-w-full w-64 border border-neutral-200 rounded-xl shadow-md dark:border-neutral-700"
        >
      </div>

      <div class="mt-3 text-xs text-neutral-400">
        {{ $t('supportPage.alipayScan') }}
      </div>
    </div>
  </div>
</template>
