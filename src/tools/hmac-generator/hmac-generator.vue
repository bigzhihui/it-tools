<script setup lang="ts">
import type { lib } from 'crypto-js';
import {
  HmacMD5,
  HmacRIPEMD160,
  HmacSHA1,
  HmacSHA224,
  HmacSHA256,
  HmacSHA3,
  HmacSHA384,
  HmacSHA512,
  enc,
} from 'crypto-js';
import { useI18n } from 'vue-i18n';

import { convertHexToBin } from '../hash-text/hash-text.service';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const algos = {
  MD5: HmacMD5,
  RIPEMD160: HmacRIPEMD160,
  SHA1: HmacSHA1,
  SHA3: HmacSHA3,
  SHA224: HmacSHA224,
  SHA256: HmacSHA256,
  SHA384: HmacSHA384,
  SHA512: HmacSHA512,
} as const;

type Encoding = keyof typeof enc | 'Bin';

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }
  return words.toString(enc[encoding]);
}

const plainText = ref('');
const secret = ref('');
const hashFunction = ref<keyof typeof algos>('SHA256');
const encoding = ref<Encoding>('Hex');
const hmac = computed(() =>
  formatWithEncoding(algos[hashFunction.value](plainText.value, secret.value), encoding.value),
);
const { copy } = useCopy({ source: hmac });

const encodingOptions = computed(() => [
  {
    label: t('tools.hash-text.encoding.bin'),
    value: 'Bin',
  },
  {
    label: t('tools.hash-text.encoding.hex'),
    value: 'Hex',
  },
  {
    label: t('tools.hash-text.encoding.base64'),
    value: 'Base64',
  },
  {
    label: t('tools.hash-text.encoding.base64url'),
    value: 'Base64url',
  },
]);
</script>

<template>
  <div flex flex-col gap-4>
    <c-input-text
      v-model:value="plainText"
      multiline
      raw-text
      :placeholder="t('tools.hmac-generator.plainTextPlaceholder')"
      rows="3"
      autosize
      autofocus
      :label="t('tools.hmac-generator.plainText')"
    />
    <c-input-text
      v-model:value="secret"
      raw-text
      :placeholder="t('tools.hmac-generator.secretKeyPlaceholder')"
      :label="t('tools.hmac-generator.secretKey')"
      clearable
    />

    <div flex gap-2>
      <c-select
        v-model:value="hashFunction"
        :label="t('tools.hmac-generator.hashingFunction')"
        flex-1
        :placeholder="t('tools.hmac-generator.hashingFunctionPlaceholder')"
        :options="Object.keys(algos).map((label) => ({ label, value: label }))"
      />
      <c-select
        v-model:value="encoding"
        :label="t('tools.hmac-generator.outputEncoding')"
        flex-1
        :placeholder="t('tools.hmac-generator.outputEncodingPlaceholder')"
        :options="encodingOptions"
      />
    </div>
    <input-copyable
      v-model:value="hmac"
      type="textarea"
      :placeholder="t('tools.hmac-generator.hmacPlaceholder')"
      :label="t('tools.hmac-generator.hmacLabel')"
    />
    <div flex justify-center>
      <c-button @click="copy(undefined, { notificationMessage: t('common.copied') })">
        {{ t('tools.hmac-generator.copyHmac') }}
      </c-button>
    </div>
  </div>
</template>
