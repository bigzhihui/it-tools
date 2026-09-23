<script setup lang="ts">
import { ArrowDown, ArrowUp, Trash } from '@vicons/tabler';
import { detectFormat, imagesToPdf } from './image-to-pdf.service';
import type { EmbeddableImage, PageSize } from './image-to-pdf.service';
import { formatBytes } from '@/utils/convert';
import { downloadPdf } from '@/utils/pdf';

const { t } = useI18n();

interface Entry {
  id: number
  name: string
  size: number
  preview: string
  image: EmbeddableImage | null
}

const entries = ref<Entry[]>([]);
const pageSize = ref<PageSize>('image');
const marginMm = ref(0);
const working = ref(false);
const failed = ref(false);
let nextId = 0;

const pageSizes = computed(() => [
  { label: t('tools.image-to-pdf.sizeImage'), value: 'image' },
  { label: t('tools.image-to-pdf.sizeA4'), value: 'a4' },
]);

const margins = computed(() => [
  { label: t('tools.image-to-pdf.marginNone'), value: 0 },
  { label: t('tools.image-to-pdf.marginNarrow'), value: 10 },
  { label: t('tools.image-to-pdf.marginWide'), value: 20 },
]);

const validEntries = computed(() => entries.value.filter(entry => entry.image !== null));
const canConvert = computed(() => validEntries.value.length > 0 && !working.value);

// JPEG and PNG are kept as they are. Other formats the browser can open, such
// as WebP, GIF and BMP, are redrawn as PNG, which keeps every pixel.
async function readImage(file: File): Promise<EmbeddableImage | null> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = detectFormat(bytes);

  try {
    // Decoding also proves the file is an image the browser can read.
    const bitmap = await createImageBitmap(file);

    if (format) {
      bitmap.close();
      return { bytes, format };
    }

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
    bitmap.close();

    const png = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    return png ? { bytes: new Uint8Array(await png.arrayBuffer()), format: 'png' } : null;
  }
  catch {
    return null;
  }
}

async function addFiles(files: File[]) {
  failed.value = false;

  for (const file of files) {
    entries.value.push({
      id: nextId++,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      image: await readImage(file),
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
  URL.revokeObjectURL(entries.value[index].preview);
  entries.value = entries.value.filter((_, i) => i !== index);
}

function clear() {
  entries.value.forEach(entry => URL.revokeObjectURL(entry.preview));
  entries.value = [];
  failed.value = false;
}

onBeforeUnmount(clear);

async function convert() {
  working.value = true;
  failed.value = false;

  try {
    const images = validEntries.value.map(entry => entry.image as EmbeddableImage);
    const pdf = await imagesToPdf(images, { pageSize: pageSize.value, marginMm: pageSize.value === 'a4' ? marginMm.value : 0 });
    downloadPdf(pdf, `${validEntries.value[0].name.replace(/\.[^.]+$/, '')}.pdf`);
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
        multiple
        accept="image/*"
        :title="t('tools.image-to-pdf.uploadHint')"
        @files-upload="addFiles"
      />

      <p class="privacy">
        {{ t('tools.image-to-pdf.privacy') }}
      </p>
    </c-card>

    <c-card v-if="entries.length > 0" mt-3>
      <div mb-2 flex items-center justify-between>
        <span data-test-id="image-to-pdf-count">{{ t('tools.image-to-pdf.count', validEntries.length) }}</span>
        <c-button size="small" variant="text" @click="clear">
          {{ t('tools.image-to-pdf.clear') }}
        </c-button>
      </div>

      <ol class="file-list">
        <li v-for="(entry, index) in entries" :key="entry.id" data-test-id="image-to-pdf-item">
          <img v-if="entry.image" class="thumbnail" :src="entry.preview" alt="">
          <span v-else class="thumbnail" />

          <div class="file-info">
            <span class="file-name">{{ entry.name }}</span>
            <span v-if="!entry.image" class="file-error">{{ t('tools.image-to-pdf.unreadable') }}</span>
            <span v-else class="file-meta">{{ formatBytes(entry.size, 1) }}</span>
          </div>

          <div class="file-actions">
            <c-button
              circle
              variant="text"
              size="small"
              :disabled="index === 0"
              :aria-disabled="index === 0"
              :title="t('tools.image-to-pdf.moveUp')"
              :aria-label="t('tools.image-to-pdf.moveUp')"
              data-test-id="image-to-pdf-up"
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
              :title="t('tools.image-to-pdf.moveDown')"
              :aria-label="t('tools.image-to-pdf.moveDown')"
              data-test-id="image-to-pdf-down"
              @click="move(index, 1)"
            >
              <n-icon :component="ArrowDown" />
            </c-button>
            <c-button
              circle
              variant="text"
              size="small"
              :title="t('tools.image-to-pdf.remove')"
              :aria-label="t('tools.image-to-pdf.remove')"
              data-test-id="image-to-pdf-remove"
              @click="remove(index)"
            >
              <n-icon :component="Trash" />
            </c-button>
          </div>
        </li>
      </ol>

      <c-buttons-select v-model:value="pageSize" :options="pageSizes" :label="t('tools.image-to-pdf.pageSize')" label-position="top" mt-4 />

      <template v-if="pageSize === 'a4'">
        <c-buttons-select v-model:value="marginMm" :options="margins" :label="t('tools.image-to-pdf.margin')" label-position="top" mt-4 />

        <p class="hint">
          {{ t('tools.image-to-pdf.a4Hint') }}
        </p>
      </template>

      <c-button
        mt-4
        w-full
        type="primary"
        :disabled="!canConvert"
        :aria-disabled="!canConvert"
        data-test-id="image-to-pdf-button"
        @click="convert"
      >
        {{ working ? t('tools.image-to-pdf.working') : t('tools.image-to-pdf.convert') }}
      </c-button>

      <c-alert v-if="failed" mt-3 type="error">
        {{ t('tools.image-to-pdf.failed') }}
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

.file-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.file-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
}

.file-list li:last-child {
  border-bottom: none;
}

.thumbnail {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 4px;
  object-fit: cover;
  background: rgba(128, 128, 128, 0.12);
}

.file-info {
  display: flex;
  flex: 1;
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
