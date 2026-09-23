<script setup lang="ts">
import { rotatePages } from './pdf-rotate.service';
import type { Rotation } from './pdf-rotate.service';
import { useValidation } from '@/composable/validation';
import { formatBytes } from '@/utils/convert';
import { parsePageRanges } from '@/utils/page-ranges';
import { downloadPdf, inspectPdf } from '@/utils/pdf';

const { t } = useI18n();

interface LoadedPdf {
  name: string
  size: number
  bytes: ArrayBuffer
  pageCount: number
}

const file = ref<LoadedPdf | null>(null);
const fileError = ref<'encrypted' | 'invalid' | null>(null);
const rotation = ref<Rotation>(90);
const scope = ref<'all' | 'some'>('all');
const pagesInput = ref('');
const working = ref(false);
const failed = ref(false);

const rotations = computed(() => [
  { label: t('tools.pdf-rotate.clockwise'), value: 90 },
  { label: t('tools.pdf-rotate.halfTurn'), value: 180 },
  { label: t('tools.pdf-rotate.counterClockwise'), value: 270 },
]);

const scopes = computed(() => [
  { label: t('tools.pdf-rotate.allPages'), value: 'all' },
  { label: t('tools.pdf-rotate.somePages'), value: 'some' },
]);

const selection = computed(() => {
  if (!file.value) {
    return null;
  }

  if (scope.value === 'all') {
    return { pages: undefined, count: file.value.pageCount, problem: null };
  }

  const parsed = parsePageRanges(pagesInput.value, file.value.pageCount);
  if (!parsed.ok) {
    return { pages: [], count: 0, problem: parsed.error };
  }

  return { pages: parsed.pages, count: new Set(parsed.pages).size, problem: null };
});

// Nothing typed yet is not worth an error message.
const problemMessage = computed(() => {
  const problem = selection.value?.problem;
  return problem && problem !== 'empty' ? t(`tools.pdf-rotate.${problem}`, { n: file.value?.pageCount }) : '';
});

const validation = useValidation({
  source: pagesInput,
  rules: computed(() => [{ message: problemMessage.value, validator: () => problemMessage.value === '' }]),
  watch: [problemMessage],
});

const canRun = computed(() => (selection.value?.count ?? 0) > 0 && !working.value);

async function loadFile(selected: File) {
  failed.value = false;

  const bytes = await selected.arrayBuffer();
  const result = await inspectPdf(bytes);

  if (!result.ok) {
    file.value = null;
    fileError.value = result.reason;
    return;
  }

  fileError.value = null;
  file.value = { name: selected.name, size: selected.size, bytes, pageCount: result.pageCount };
}

function clear() {
  file.value = null;
  fileError.value = null;
  failed.value = false;
}

async function run() {
  if (!file.value || !selection.value) {
    return;
  }

  working.value = true;
  failed.value = false;

  try {
    const output = await rotatePages(file.value.bytes, rotation.value, selection.value.pages);
    downloadPdf(output, `${file.value.name.replace(/\.pdf$/i, '')}-rotated.pdf`);
  }
  catch {
    failed.value = true;
  }
  finally {
    working.value = false;
  }
}
</script>

<template>
  <div>
    <c-card>
      <c-file-upload
        accept="application/pdf,.pdf"
        :title="t('tools.pdf-rotate.uploadHint')"
        @file-upload="loadFile"
      />

      <p class="privacy">
        {{ t('tools.pdf-rotate.privacy') }}
      </p>

      <c-alert v-if="fileError" mt-3 type="error">
        {{ t(`tools.pdf-rotate.${fileError}`) }}
      </c-alert>
    </c-card>

    <c-card v-if="file" mt-3>
      <div class="file-row">
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-meta" data-test-id="pdf-rotate-count">{{ t('tools.pdf-rotate.pages', file.pageCount) }} · {{ formatBytes(file.size, 1) }}</span>
        </div>
        <c-button size="small" variant="text" @click="clear">
          {{ t('tools.pdf-rotate.clear') }}
        </c-button>
      </div>

      <c-buttons-select v-model:value="rotation" :options="rotations" :label="t('tools.pdf-rotate.direction')" label-position="top" mt-4 />

      <c-buttons-select v-model:value="scope" :options="scopes" :label="t('tools.pdf-rotate.scope')" label-position="top" mt-4 />

      <template v-if="scope === 'some'">
        <c-input-text
          v-model:value="pagesInput"
          :label="t('tools.pdf-rotate.pagesLabel')"
          :placeholder="t('tools.pdf-rotate.pagesPlaceholder')"
          :validation="validation"
          test-id="pdf-rotate-input"
          raw-text
          mt-4
        />

        <p class="hint">
          {{ t('tools.pdf-rotate.pagesHint') }}
        </p>
      </template>

      <p v-if="canRun || working" class="summary" data-test-id="pdf-rotate-summary">
        {{ t('tools.pdf-rotate.summary', selection?.count ?? 0) }}
      </p>

      <c-button
        mt-3
        w-full
        type="primary"
        :disabled="!canRun"
        :aria-disabled="!canRun"
        data-test-id="pdf-rotate-button"
        @click="run"
      >
        {{ working ? t('tools.pdf-rotate.working') : t('tools.pdf-rotate.rotate') }}
      </c-button>

      <c-alert v-if="failed" mt-3 type="error">
        {{ t('tools.pdf-rotate.failed') }}
      </c-alert>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
.privacy {
  margin: 12px 0 0;
  font-size: 13px;
  opacity: 0.7;
  text-align: center;
}

.hint {
  margin: 6px 0 0;
  font-size: 12px;
  opacity: 0.65;
}

.summary {
  margin: 12px 0 0;
}

.file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.file-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 12px;
  opacity: 0.65;
}
</style>
