<script setup lang="ts">
import { format } from 'prettier';
import htmlParser from 'prettier/plugins/html';
import { useStorage } from '@vueuse/core';
import Editor from './editor/editor.vue';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const { locale } = useI18n();

const defaultContent = locale.value.startsWith('zh')
  ? '<h1>你好！</h1><p>欢迎使用此 HTML 所见即所得编辑器</p>'
  : '<h1>Hey!</h1><p>Welcome to this html wysiwyg editor</p>';

const html = useStorage('html-wysiwyg-editor--html', defaultContent);

const formattedHtml = asyncComputed(() => format(html.value, { parser: 'html', plugins: [htmlParser] }), '');
</script>

<template>
  <Editor v-model:html="html" />
  <TextareaCopyable :value="formattedHtml" language="html" />
</template>
