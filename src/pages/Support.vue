<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { NIcon } from 'naive-ui';
import { IconHeart } from '@tabler/icons-vue';

useHead({ title: '支持本站 - 十三月工具箱' });
</script>

<template>
  <div class="mx-auto mt-40px max-w-600px px-4 pb-20 text-center">
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mb-4">
      <NIcon size="32" :component="IconHeart" />
    </div>

    <h1 class="text-2xl font-bold mb-3">
      支持十三月工具箱
    </h1>

    <p class="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-md mx-auto mb-8">
      十三月工具箱永久免费且开源。如果这些在线工具在日常开发中为您节省了时间，欢迎通过以下方式支持我们持续维护与更新！
    </p>

    <!-- 赞助卡片 -->
    <div class="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 shadow-sm max-w-sm mx-auto">
      <div class="text-base font-semibold mb-2 flex items-center justify-center">
        ☕ 支付宝打赏
      </div>
      <p class="text-xs text-neutral-400 mb-4">
        请站长喝杯咖啡，支持服务器与域名运营
      </p>

      <div class="flex justify-center my-2">
        <img
          src="/alipay-sponsor.jpg"
          alt="支付宝赞助码"
          class="w-64 max-w-full rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700"
        />
      </div>

      <div class="text-xs text-neutral-400 mt-3">
        打开手机支付宝 [扫一扫] 支持 (十三月)
      </div>
    </div>
  </div>
</template>
