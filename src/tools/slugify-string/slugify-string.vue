<script setup lang="ts">
import slugify from '@sindresorhus/slugify';
import { useI18n } from 'vue-i18n';
import { withDefaultOnError } from '@/utils/defaults';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const input = ref('');
const slug = computed(() => withDefaultOnError(() => slugify(input.value), ''));
const { copy } = useCopy({ source: slug });
</script>

<template>
  <div>
    <c-input-text
      v-model:value="input"
      multiline
      :placeholder="t('tools.slugify-string.inputPlaceholder')"
      :label="t('tools.slugify-string.inputLabel')"
      autofocus
      raw-text
      mb-5
    />

    <c-input-text
      :value="slug"
      multiline
      readonly
      :placeholder="t('tools.slugify-string.slugPlaceholder')"
      :label="t('tools.slugify-string.slugLabel')"
      mb-5
    />

    <div flex justify-center>
      <c-button :disabled="slug.length === 0" @click="copy(undefined, { notificationMessage: t('tools.slugify-string.copied') })">
        {{ t('tools.slugify-string.copySlug') }}
      </c-button>
    </div>
  </div>
</template>
