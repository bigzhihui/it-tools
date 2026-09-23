<script setup lang="ts">
import { ArrowDown, ArrowUp, Trash } from '@vicons/tabler';
import { downloadPdf, inspectPdf, mergePdfs } from './pdf-merge.service';

const { t } = useI18n();

interface Entry {
  id: number
  name: string
  size: number
  bytes: ArrayBuffer
  pageCount: number
  error: 'encrypted' | 'invalid' | null
}

const entries = ref<Entry[]>([]);
const merging = ref(false);
const mergeFailed = ref(false);
let nextId = 0;

const validEntries = computed(() => entries.value.filter(entry => entry.error === null));
const totalPages = computed(() => validEntries.value.reduce((sum, entry) => sum + entry.pageCount, 0));
const canMerge = computed(() => validEntries.value.length >= 2 && !merging.value);

async function addFiles(files: File[]) {
  mergeFailed.value = false;

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const result = await inspectPdf(bytes);

    entries.value.push({
      id: nextId++,
      name: file.name,
      size: file.size,
      bytes,
      pageCount: result.ok ? result.pageCount : 0,
      error: result.ok ? null : result.reason,
    });
  }
}

function move(index: number, offset: -1 | 1) {
  const target = index + offset;

  if (target < 0 || target >= entries.value.length) {
    return;
  }

  const reordered = [...entries.value];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  entries.value = reordered;
}

function remove(index: number) {
  entries.value = entries.value.filter((_, i) => i !== index);
}

function clear() {
  entries.value = [];
  mergeFailed.value = false;
}

async function merge() {
  merging.value = true;
  mergeFailed.value = false;

  try {
    const merged = await mergePdfs(validEntries.value.map(entry => entry.bytes));
    downloadPdf(merged, 'merged.pdf');
  }
  catch {
    mergeFailed.value = true;
  }
  finally {
    merging.value = false;
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
</script>

<template>
  <div>
    <c-card>
      <c-file-upload
        multiple
        accept="application/pdf,.pdf"
        :title="t('tools.pdf-merge.uploadHint')"
        @files-upload="addFiles"
      />

      <p class="privacy">
        {{ t('tools.pdf-merge.privacy') }}
      </p>
    </c-card>

    <c-card v-if="entries.length > 0" mt-3>
      <div mb-2 flex items-center justify-between>
        <span data-test-id="pdf-merge-total">{{ t('tools.pdf-merge.totalPages', totalPages) }}</span>
        <c-button size="small" variant="text" @click="clear">
          {{ t('tools.pdf-merge.clear') }}
        </c-button>
      </div>

      <ol class="file-list">
        <li v-for="(entry, index) in entries" :key="entry.id" data-test-id="pdf-merge-item">
          <div class="file-info">
            <span class="file-name">{{ entry.name }}</span>
            <span v-if="entry.error" class="file-error">{{ t(`tools.pdf-merge.${entry.error}`) }}</span>
            <span v-else class="file-meta">{{ t('tools.pdf-merge.pages', entry.pageCount) }} · {{ formatSize(entry.size) }}</span>
          </div>

          <div class="file-actions">
            <c-button
              circle
              variant="text"
              size="small"
              :disabled="index === 0"
              :aria-disabled="index === 0"
              :title="t('tools.pdf-merge.moveUp')"
              :aria-label="t('tools.pdf-merge.moveUp')"
              data-test-id="pdf-merge-up"
              @click="move(index, -1)"
            >
              <n-icon :component="ArrowUp" />
            </c-button>
            <c-button
              circle
              variant="text"
              size="small"
              :disabled="index === entries.length - 1"
              :aria-disabled="index === entries.length - 1"
              :title="t('tools.pdf-merge.moveDown')"
              :aria-label="t('tools.pdf-merge.moveDown')"
              data-test-id="pdf-merge-down"
              @click="move(index, 1)"
            >
              <n-icon :component="ArrowDown" />
            </c-button>
            <c-button
              circle
              variant="text"
              size="small"
              :title="t('tools.pdf-merge.remove')"
              :aria-label="t('tools.pdf-merge.remove')"
              data-test-id="pdf-merge-remove"
              @click="remove(index)"
            >
              <n-icon :component="Trash" />
            </c-button>
          </div>
        </li>
      </ol>

      <c-button
        mt-3
        w-full
        type="primary"
        :disabled="!canMerge"
        :aria-disabled="!canMerge"
        data-test-id="pdf-merge-button"
        @click="merge"
      >
        {{ merging ? t('tools.pdf-merge.merging') : t('tools.pdf-merge.merge') }}
      </c-button>

      <p v-if="validEntries.length < 2" class="hint">
        {{ t('tools.pdf-merge.needTwo') }}
      </p>

      <c-alert v-if="mergeFailed" mt-3 type="error">
        {{ t('tools.pdf-merge.mergeFailed') }}
      </c-alert>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
.privacy,
.hint {
  margin: 12px 0 0;
  font-size: 13px;
  opacity: 0.7;
  text-align: center;
}

.file-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.file-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
}

.file-list li:last-child {
  border-bottom: none;
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

.file-error {
  font-size: 12px;
  color: #d03050;
}

.file-actions {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
}
</style>
