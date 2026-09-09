<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { convertAsciiBinaryToText, convertTextToAsciiBinary } from './text-to-binary.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useCopy } from '@/composable/copy';
import { isNotThrowing } from '@/utils/boolean';

const { t } = useI18n();

const inputText = ref('');
const binaryFromText = computed(() => convertTextToAsciiBinary(inputText.value));
const { copy: copyBinary } = useCopy({ source: binaryFromText });

const inputBinary = ref('');
const textFromBinary = computed(() => withDefaultOnError(() => convertAsciiBinaryToText(inputBinary.value), ''));
const inputBinaryValidationRules = computed(() => [
  {
    validator: (value: string) => isNotThrowing(() => convertAsciiBinaryToText(value)),
    message: t('tools.text-to-binary.binaryValidationMessage'),
  },
]);
const { copy: copyText } = useCopy({ source: textFromBinary });
</script>

<template>
  <c-card :title="$t('tools.text-to-binary.textToBinaryTitle')">
    <c-input-text
      v-model:value="inputText"
      multiline
      :placeholder="$t('tools.text-to-binary.textToBinaryInputPlaceholder')"
      :label="$t('tools.text-to-binary.textToBinaryInputLabel')"
      autosize
      autofocus
      raw-text
      test-id="text-to-binary-input"
    />
    <c-input-text
      v-model:value="binaryFromText"
      :label="$t('tools.text-to-binary.textToBinaryOutputLabel')"
      multiline
      raw-text
      readonly
      mt-2
      :placeholder="$t('tools.text-to-binary.textToBinaryOutputPlaceholder')"
      test-id="text-to-binary-output"
    />
    <div mt-2 flex justify-center>
      <c-button :disabled="!binaryFromText" @click="copyBinary()">
        {{ $t('tools.text-to-binary.copyBinary') }}
      </c-button>
    </div>
  </c-card>

  <c-card :title="$t('tools.text-to-binary.binaryToTextTitle')">
    <c-input-text
      v-model:value="inputBinary"
      multiline
      :placeholder="$t('tools.text-to-binary.binaryToTextInputPlaceholder')"
      :label="$t('tools.text-to-binary.binaryToTextInputLabel')"
      autosize
      raw-text
      :validation-rules="inputBinaryValidationRules"
      test-id="binary-to-text-input"
    />
    <c-input-text
      v-model:value="textFromBinary"
      :label="$t('tools.text-to-binary.binaryToTextOutputLabel')"
      multiline
      raw-text
      readonly
      mt-2
      :placeholder="$t('tools.text-to-binary.binaryToTextOutputPlaceholder')"
      test-id="binary-to-text-output"
    />
    <div mt-2 flex justify-center>
      <c-button :disabled="!textFromBinary" @click="copyText()">
        {{ $t('tools.text-to-binary.copyText') }}
      </c-button>
    </div>
  </c-card>
</template>
