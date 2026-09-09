<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { useI18n } from 'vue-i18n';
import { useStyleStore } from '@/stores/style.store';

const props = withDefaults(
  defineProps<{
    options?: monaco.editor.IDiffEditorOptions
    originalText?: string
    modifiedText?: string
  }>(),
  {
    options: () => ({}),
    originalText: undefined,
    modifiedText: undefined,
  },
);

const { t } = useI18n();
const { options } = toRefs(props);

const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneDiffEditor | null = null;

monaco.editor.defineTheme('it-tools-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
});

monaco.editor.defineTheme('it-tools-light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
});

const styleStore = useStyleStore();

watch(
  () => styleStore.isDarkTheme,
  isDarkTheme => monaco.editor.setTheme(isDarkTheme ? 'it-tools-dark' : 'it-tools-light'),
  { immediate: true },
);

watch(
  () => options.value,
  options => editor?.updateOptions(options),
  { immediate: true, deep: true },
);

useResizeObserver(editorContainer, () => {
  editor?.layout();
});

onMounted(() => {
  if (!editorContainer.value) {
    return;
  }

  editor = monaco.editor.createDiffEditor(editorContainer.value, {
    originalEditable: true,
    minimap: {
      enabled: false,
    },
  });

  const orig = props.originalText ?? t('tools.text-diff.originalTextPlaceholder');
  const mod = props.modifiedText ?? t('tools.text-diff.modifiedTextPlaceholder');

  editor.setModel({
    original: monaco.editor.createModel(orig, 'txt'),
    modified: monaco.editor.createModel(mod, 'txt'),
  });
});
</script>

<template>
  <div ref="editorContainer" h-600px />
</template>
