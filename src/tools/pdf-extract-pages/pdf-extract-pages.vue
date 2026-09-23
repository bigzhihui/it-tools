<script setup lang="ts">
import { extractPages, resultPages } from './pdf-extract-pages.service';
import type { ExtractMode } from './pdf-extract-pages.service';
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
const mode = ref<ExtractMode>('keep');
const pagesInput = ref('');
const working = ref(false);
const failed = ref(false);

const modes = computed(() => [
  { label: t('tools.pdf-extract-pages.keep'), value: 'keep' },
  { label: t('tools.pdf-extract-pages.delete'), value: 'delete' },
]);

const outcome = computed(() => {
  if (!file.value) {
    return null;
  }

  const parsed = parsePageRanges(pagesInput.value, file.value.pageCount);
  if (!parsed.ok) {
    return { pages: [], problem: parsed.error };
  }

  const pages = resultPages(mode.value, parsed.pages, file.value.pageCount);
  return { pages, problem: pages.length === 0 ? 'deletesAll' : null };
});

// Nothing typed yet is not worth an error message.
const problemMessage = computed(() => {
  const problem = outcome.value?.problem;
  return problem && problem !== 'empty' ? t(`tools.pdf-extract-pages.${problem}`, { n: file.value?.pageCount }) : '';
});

const validation = useValidation({
  source: pagesInput,
  rules: computed(() => [{ message: problemMessage.value, validator: () => problemMessage.value === '' }]),
  watch: [problemMessage],
});

const outputPages = computed(() => outcome.value?.problem ? [] : outcome.value?.pages ?? []);
const canRun = computed(() => outputPages.value.length > 0 && !working.value);

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
  if (!file.value) {
    return;
  }

  working.value = true;
  failed.value = false;

  try {
    const output = await extractPages(file.value.bytes, outputPages.value);
    const suffix = mode.value === 'keep' ? 'extracted' : 'edited';
    downloadPdf(output, `${file.value.name.replace(/\.pdf$/i, '')}-${suffix}.pdf`);
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
        :title="t('tools.pdf-extract-pages.uploadHint')"
        @file-upload="loadFile"
      />

      <p class="privacy">
        {{ t('tools.pdf-extract-pages.privacy') }}
      </p>

      <c-alert v-if="fileError" mt-3 type="error">
        {{ t(`tools.pdf-extract-pages.${fileError}`) }}
      </c-alert>
    </c-card>

    <c-card v-if="file" mt-3>
      <div class="file-row">
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-meta" data-test-id="pdf-extract-pages-count">{{ t('tools.pdf-extract-pages.pages', file.pageCount) }} · {{ formatBytes(file.size, 1) }}</span>
        </div>
        <c-button size="small" variant="text" @click="clear">
          {{ t('tools.pdf-extract-pages.clear') }}
        </c-button>
      </div>

      <c-buttons-select v-model:value="mode" :options="modes" :label="t('tools.pdf-extract-pages.mode')" label-position="top" mt-4 />

      <c-input-text
        v-model:value="pagesInput"
        :label="t('tools.pdf-extract-pages.pagesLabel')"
        :placeholder="t('tools.pdf-extract-pages.pagesPlaceholder')"
        :validation="validation"
        test-id="pdf-extract-pages-input"
        raw-text
        mt-4
      />

      <p class="hint">
        {{ t('tools.pdf-extract-pages.pagesHint') }}
      </p>

      <p v-if="outputPages.length > 0" class="summary" data-test-id="pdf-extract-pages-summary">
        {{ t('tools.pdf-extract-pages.summary', outputPages.length) }}
      </p>

      <c-button
        mt-3
        w-full
        type="primary"
        :disabled="!canRun"
        :aria-disabled="!canRun"
        data-test-id="pdf-extract-pages-button"
        @click="run"
      >
        {{ working ? t('tools.pdf-extract-pages.working') : t(`tools.pdf-extract-pages.${mode}Button`) }}
      </c-button>

      <c-alert v-if="failed" mt-3 type="error">
        {{ t('tools.pdf-extract-pages.failed') }}
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
