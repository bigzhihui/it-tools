<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

const encodeInput = ref('Hello world :)');
const encodeOutput = computed(() => withDefaultOnError(() => encodeURIComponent(encodeInput.value), ''));

const encodedValidation = useValidation<string>({
  source: encodeInput,
  rules: computed(() => [
    {
      validator: (value: string) => isNotThrowing(() => encodeURIComponent(value)),
      message: t('tools.url-encoder.parseError'),
    },
  ]),
});

const { copy: copyEncoded } = useCopy({ source: encodeOutput, text: t('tools.url-encoder.copiedEncoded') });

const decodeInput = ref('Hello%20world%20%3A)');
const decodeOutput = computed(() => withDefaultOnError(() => decodeURIComponent(decodeInput.value), ''));

const decodeValidation = useValidation<string>({
  source: decodeInput,
  rules: computed(() => [
    {
      validator: (value: string) => isNotThrowing(() => decodeURIComponent(value)),
      message: t('tools.url-encoder.parseError'),
    },
  ]),
});

const { copy: copyDecoded } = useCopy({ source: decodeOutput, text: t('tools.url-encoder.copiedDecoded') });
</script>

<template>
  <c-card :title="t('common.encode')">
    <c-input-text
      v-model:value="encodeInput"
      :label="t('tools.url-encoder.yourString')"
      :validation="encodedValidation"
      multiline
      autosize
      :placeholder="t('tools.url-encoder.stringToEncodePlaceholder')"
      rows="2"
      mb-3
    />

    <c-input-text
      :label="t('tools.url-encoder.stringEncoded')"
      :value="encodeOutput"
      multiline
      autosize
      readonly
      :placeholder="t('tools.url-encoder.stringEncodedPlaceholder')"
      rows="2"
      mb-3
    />

    <div flex justify-center>
      <c-button @click="copyEncoded(undefined, { notificationMessage: t('tools.url-encoder.copiedEncoded') })">
        {{ t('common.copy') }}
      </c-button>
    </div>
  </c-card>
  <c-card :title="t('common.decode')">
    <c-input-text
      v-model:value="decodeInput"
      :label="t('tools.url-encoder.encodedString')"
      :validation="decodeValidation"
      multiline
      autosize
      :placeholder="t('tools.url-encoder.stringToDecodePlaceholder')"
      rows="2"
      mb-3
    />

    <c-input-text
      :label="t('tools.url-encoder.stringDecoded')"
      :value="decodeOutput"
      multiline
      autosize
      readonly
      :placeholder="t('tools.url-encoder.stringDecodedPlaceholder')"
      rows="2"
      mb-3
    />

    <div flex justify-center>
      <c-button @click="copyDecoded(undefined, { notificationMessage: t('tools.url-encoder.copiedDecoded') })">
        {{ t('common.copy') }}
      </c-button>
    </div>
  </c-card>
</template>
