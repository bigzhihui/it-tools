<script setup lang="ts">
import { AES, RC4, Rabbit, TripleDES, enc } from 'crypto-js';
import { computedCatch } from '@/composable/computed/catchedComputed';

const { t } = useI18n();

const algos = { AES, TripleDES, Rabbit, RC4 };

const cypherInput = ref('Lorem ipsum dolor sit amet');
const cypherAlgo = ref<keyof typeof algos>('AES');
const cypherSecret = ref('my secret key');
const cypherOutput = computed(() => algos[cypherAlgo.value].encrypt(cypherInput.value, cypherSecret.value).toString());

const decryptInput = ref('U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs');
const decryptAlgo = ref<keyof typeof algos>('AES');
const decryptSecret = ref('my secret key');
const [decryptOutput, decryptError] = computedCatch(() => algos[decryptAlgo.value].decrypt(decryptInput.value, decryptSecret.value).toString(enc.Utf8), {
  defaultValue: '',
  defaultErrorMessage: computed(() => t('tools.encryption.unableToDecrypt')) as any,
});
</script>

<template>
  <c-card :title="t('tools.encryption.encryptTitle')">
    <div flex gap-3>
      <c-input-text
        v-model:value="cypherInput"
        :label="t('tools.encryption.yourText')"
        :placeholder="t('tools.encryption.textPlaceholder')"
        rows="4"
        multiline raw-text monospace autosize flex-1
      />
      <div flex flex-1 flex-col gap-2>
        <c-input-text v-model:value="cypherSecret" :label="t('tools.encryption.secretKey')" clearable raw-text />

        <c-select
          v-model:value="cypherAlgo"
          :label="t('tools.encryption.algorithm')"
          :options="Object.keys(algos).map((label) => ({ label, value: label }))"
        />
      </div>
    </div>
    <c-input-text
      :label="t('tools.encryption.textEncrypted')"
      :value="cypherOutput"
      rows="3"
      :placeholder="t('tools.encryption.encryptedPlaceholder')"
      multiline monospace readonly autosize mt-5
    />
  </c-card>
  <c-card :title="t('tools.encryption.decryptTitle')">
    <div flex gap-3>
      <c-input-text
        v-model:value="decryptInput"
        :label="t('tools.encryption.encryptedText')"
        :placeholder="t('tools.encryption.textPlaceholder')"
        rows="4"
        multiline raw-text monospace autosize flex-1
      />
      <div flex flex-1 flex-col gap-2>
        <c-input-text v-model:value="decryptSecret" :label="t('tools.encryption.secretKey')" clearable raw-text />

        <c-select
          v-model:value="decryptAlgo"
          :label="t('tools.encryption.algorithm')"
          :options="Object.keys(algos).map((label) => ({ label, value: label }))"
        />
      </div>
    </div>
    <c-alert v-if="decryptError" type="error" mt-12 :title="t('tools.encryption.decryptErrorTitle')">
      {{ decryptError }}
    </c-alert>
    <c-input-text
      v-else
      :label="t('tools.encryption.decryptedText')"
      :value="decryptOutput"
      :placeholder="t('tools.encryption.encryptedPlaceholder')"
      rows="3"
      multiline monospace readonly autosize mt-5
    />
  </c-card>
</template>
