<script setup lang="ts">
import { escape, unescape } from 'lodash';
import { useI18n } from 'vue-i18n';

import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const escapeInput = ref('<title>IT Tool</title>');
const escapeOutput = computed(() => escape(escapeInput.value));
const { copy: copyEscaped } = useCopy({ source: escapeOutput });

const unescapeInput = ref('&lt;title&gt;IT Tool&lt;/title&gt;');
const unescapeOutput = computed(() => unescape(unescapeInput.value));
const { copy: copyUnescaped } = useCopy({ source: unescapeOutput });
</script>

<template>
  <c-card :title="t('tools.html-entities.escapeCardTitle')">
    <n-form-item :label="t('tools.html-entities.yourString')">
      <c-input-text
        v-model:value="escapeInput"
        multiline
        :placeholder="t('tools.html-entities.stringToEscapePlaceholder')"
        rows="3"
        autosize
        raw-text
      />
    </n-form-item>

    <n-form-item :label="t('tools.html-entities.yourStringEscaped')">
      <c-input-text
        multiline
        readonly
        :placeholder="t('tools.html-entities.stringEscapedPlaceholder')"
        :value="escapeOutput"
        rows="3"
        autosize
      />
    </n-form-item>

    <div flex justify-center>
      <c-button @click="copyEscaped(undefined, { notificationMessage: t('tools.html-entities.copied') })">
        {{ t('common.copy') }}
      </c-button>
    </div>
  </c-card>
  <c-card :title="t('tools.html-entities.unescapeCardTitle')">
    <n-form-item :label="t('tools.html-entities.yourEscapedString')">
      <c-input-text
        v-model:value="unescapeInput"
        multiline
        :placeholder="t('tools.html-entities.stringToUnescapePlaceholder')"
        rows="3"
        autosize
        raw-text
      />
    </n-form-item>

    <n-form-item :label="t('tools.html-entities.yourStringUnescaped')">
      <c-input-text
        :value="unescapeOutput"
        multiline
        readonly
        :placeholder="t('tools.html-entities.stringUnescapedPlaceholder')"
        rows="3"
        autosize
      />
    </n-form-item>

    <div flex justify-center>
      <c-button @click="copyUnescaped(undefined, { notificationMessage: t('tools.html-entities.copied') })">
        {{ t('common.copy') }}
      </c-button>
    </div>
  </c-card>
</template>
