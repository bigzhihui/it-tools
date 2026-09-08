<script setup lang="ts">
import { useHead } from '@vueuse/head';

useHead({ title: '关于本站 - 十三月工具箱' });
</script>

<template>
  <c-markdown :markdown="$t('about.content')" mx-auto mt-50px max-w-600px px-4 pb-16 />
</template>
