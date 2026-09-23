<script setup lang="ts">
import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { openPdf, renderPage } from './pdf-to-image.pdfjs';
import { imageFileName } from './pdf-to-image.service';
import type { ImageFormat } from './pdf-to-image.service';
import { useValidation } from '@/composable/validation';
import { formatBytes } from '@/utils/convert';
import { parsePageRanges } from '@/utils/page-ranges';

const { t } = useI18n();

interface LoadedPdf {
  name: string
  size: number
  pageCount: number
}

interface Result {
  page: number
  name: string
  url: string
  size: number
}

// Kept out of Vue's reactivity: pdf.js objects use private fields, which a
// reactive proxy would break.
let pdf: PDFDocumentProxy | null = null;
let stopRequested = false;

const file = ref<LoadedPdf | null>(null);
const fileError = ref<'password' | 'invalid' | null>(null);
const opening = ref(false);
const format = ref<ImageFormat>('jpg');
const dpi = ref(150);
const scope = ref<'all' | 'some'>('all');
const pagesInput = ref('');
const results = ref<Result[]>([]);
const progress = ref<{ done: number; total: number } | null>(null);
const failed = ref(false);

const formats = computed(() => [
  { label: t('tools.pdf-to-image.formatJpg'), value: 'jpg' },
  { label: t('tools.pdf-to-image.formatPng'), value: 'png' },
]);

const resolutions = computed(() => [72, 150, 300].map(value => ({ label: t(`tools.pdf-to-image.dpi${value}`), value })));

const scopes = computed(() => [
  { label: t('tools.pdf-to-image.allPages'), value: 'all' },
  { label: t('tools.pdf-to-image.somePages'), value: 'some' },
]);

const selection = computed(() => {
  if (!file.value) {
    return null;
  }

  if (scope.value === 'all') {
    return { pages: Array.from({ length: file.value.pageCount }, (_, index) => index + 1), problem: null };
  }

  const parsed = parsePageRanges(pagesInput.value, file.value.pageCount);
  return parsed.ok ? { pages: [...new Set(parsed.pages)], problem: null } : { pages: [], problem: parsed.error };
});

// Nothing typed yet is not worth an error message.
const problemMessage = computed(() => {
  const problem = selection.value?.problem;
  return problem && problem !== 'empty' ? t(`tools.pdf-to-image.${problem}`, { n: file.value?.pageCount }) : '';
});

const validation = useValidation({
  source: pagesInput,
  rules: computed(() => [{ message: problemMessage.value, validator: () => problemMessage.value === '' }]),
  watch: [problemMessage],
});

const working = computed(() => progress.value !== null);
const canConvert = computed(() => (selection.value?.pages.length ?? 0) > 0 && !working.value);

function clearResults() {
  results.value.forEach(result => URL.revokeObjectURL(result.url));
  results.value = [];
}

async function closePdf() {
  const current = pdf;
  pdf = null;
  await current?.destroy();
}

async function loadFile(selected: File) {
  stopRequested = true;
  failed.value = false;
  fileError.value = null;
  file.value = null;
  clearResults();
  await closePdf();

  opening.value = true;
  const result = await openPdf(new Uint8Array(await selected.arrayBuffer()));
  opening.value = false;

  if (!result.ok) {
    fileError.value = result.reason;
    return;
  }

  pdf = result.pdf;
  file.value = { name: selected.name, size: selected.size, pageCount: result.pdf.numPages };
}

async function clear() {
  stopRequested = true;
  file.value = null;
  fileError.value = null;
  failed.value = false;
  clearResults();
  await closePdf();
}

onBeforeUnmount(clear);

async function convert() {
  const current = pdf;
  if (!current || !file.value || !selection.value) {
    return;
  }

  const { name, pageCount } = file.value;
  const pages = selection.value.pages;

  clearResults();
  failed.value = false;
  stopRequested = false;
  progress.value = { done: 0, total: pages.length };

  try {
    for (const [index, page] of pages.entries()) {
      // Stopped, or another file was chosen meanwhile.
      if (stopRequested || current !== pdf) {
        break;
      }

      const blob = await renderPage(current, page, { dpi: dpi.value, format: format.value });
      if (current !== pdf) {
        break;
      }

      results.value.push({ page, name: imageFileName(name, page, pageCount, format.value), url: URL.createObjectURL(blob), size: blob.size });
      progress.value = { done: index + 1, total: pages.length };
    }
  }
  catch {
    // A file closed mid-way is not a failure worth reporting.
    failed.value = current === pdf;
  }
  finally {
    progress.value = null;
  }
}

async function downloadAll() {
  for (const result of results.value) {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.name;
    link.click();
    // Browsers drop downloads that start in the same instant.
    await new Promise(resolve => setTimeout(resolve, 250));
  }
}
</script>

<template>
  <div>
    <c-card>
      <c-file-upload
        accept="application/pdf,.pdf"
        :title="t('tools.pdf-to-image.uploadHint')"
        @file-upload="loadFile"
      />

      <p class="privacy">
        {{ opening ? t('tools.pdf-to-image.opening') : t('tools.pdf-to-image.privacy') }}
      </p>

      <c-alert v-if="fileError" mt-3 type="error">
        {{ t(`tools.pdf-to-image.${fileError}`) }}
      </c-alert>
    </c-card>

    <c-card v-if="file" mt-3>
      <div class="file-row">
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-meta" data-test-id="pdf-to-image-count">{{ t('tools.pdf-to-image.pages', file.pageCount) }} · {{ formatBytes(file.size, 1) }}</span>
        </div>
        <c-button size="small" variant="text" @click="clear">
          {{ t('tools.pdf-to-image.clear') }}
        </c-button>
      </div>

      <c-buttons-select v-model:value="format" :options="formats" :label="t('tools.pdf-to-image.format')" label-position="top" mt-4 />
      <p class="hint">
        {{ t('tools.pdf-to-image.formatHint') }}
      </p>

      <c-buttons-select v-model:value="dpi" :options="resolutions" :label="t('tools.pdf-to-image.resolution')" label-position="top" mt-4 />
      <p class="hint">
        {{ t('tools.pdf-to-image.resolutionHint') }}
      </p>

      <c-buttons-select v-model:value="scope" :options="scopes" :label="t('tools.pdf-to-image.scope')" label-position="top" mt-4 />

      <template v-if="scope === 'some'">
        <c-input-text
          v-model:value="pagesInput"
          :label="t('tools.pdf-to-image.pagesLabel')"
          :placeholder="t('tools.pdf-to-image.pagesPlaceholder')"
          :validation="validation"
          test-id="pdf-to-image-input"
          raw-text
          mt-4
        />

        <p class="hint">
          {{ t('tools.pdf-to-image.pagesHint') }}
        </p>
      </template>

      <p v-if="canConvert" class="summary" data-test-id="pdf-to-image-summary">
        {{ t('tools.pdf-to-image.summary', selection?.pages.length ?? 0) }}
      </p>

      <div mt-3 flex gap-2>
        <c-button
          flex-1
          type="primary"
          :disabled="!canConvert"
          :aria-disabled="!canConvert"
          data-test-id="pdf-to-image-button"
          @click="convert"
        >
          {{ progress ? t('tools.pdf-to-image.converting', progress) : t('tools.pdf-to-image.convert') }}
        </c-button>
        <c-button v-if="working" data-test-id="pdf-to-image-stop" @click="stopRequested = true">
          {{ t('tools.pdf-to-image.stop') }}
        </c-button>
      </div>

      <c-alert v-if="failed" mt-3 type="error">
        {{ t('tools.pdf-to-image.failed') }}
      </c-alert>
    </c-card>

    <c-card v-if="results.length > 0" mt-3>
      <div mb-3 flex items-center justify-between gap-3>
        <span>{{ t('tools.pdf-to-image.results') }}</span>
        <c-button size="small" data-test-id="pdf-to-image-download-all" @click="downloadAll">
          {{ t('tools.pdf-to-image.downloadAll') }}
        </c-button>
      </div>

      <p v-if="results.length > 1" class="hint" mb-3>
        {{ t('tools.pdf-to-image.downloadAllHint') }}
      </p>

      <ul class="results">
        <li v-for="result in results" :key="result.url" data-test-id="pdf-to-image-result">
          <img class="preview" :src="result.url" :alt="t('tools.pdf-to-image.pageLabel', { n: result.page })">
          <div class="result-info">
            <span>{{ t('tools.pdf-to-image.pageLabel', { n: result.page }) }}</span>
            <span class="file-meta">{{ formatBytes(result.size, 1) }}</span>
          </div>
          <a class="download" :href="result.url" :download="result.name" data-test-id="pdf-to-image-download">
            {{ t('tools.pdf-to-image.download') }}
          </a>
        </li>
      </ul>
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

.results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.results li {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.preview {
  width: 100%;
  height: 160px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 4px;
  object-fit: contain;
  background: rgba(128, 128, 128, 0.08);
}

.result-info {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  font-size: 13px;
}

.download {
  color: #18a058;
  font-size: 13px;
  text-decoration: none;
}

.download:hover {
  text-decoration: underline;
}
</style>
