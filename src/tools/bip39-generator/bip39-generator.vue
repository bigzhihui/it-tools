<script setup lang="ts">
import {
  chineseSimplifiedWordList,
  chineseTraditionalWordList,
  czechWordList,
  englishWordList,
  entropyToMnemonic,
  frenchWordList,
  generateEntropy,
  italianWordList,
  japaneseWordList,
  koreanWordList,
  mnemonicToEntropy,
  portugueseWordList,
  spanishWordList,
} from '@it-tools/bip39';
import { Copy, Refresh } from '@vicons/tabler';
import { useI18n } from 'vue-i18n';

import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

const wordLists = {
  english: englishWordList,
  chineseSimplified: chineseSimplifiedWordList,
  chineseTraditional: chineseTraditionalWordList,
  czech: czechWordList,
  french: frenchWordList,
  italian: italianWordList,
  japanese: japaneseWordList,
  korean: koreanWordList,
  portuguese: portugueseWordList,
  spanish: spanishWordList,
};

const languageOptions = computed(() => [
  { label: t('tools.bip39-generator.languages.english'), value: 'english' },
  { label: t('tools.bip39-generator.languages.chineseSimplified'), value: 'chineseSimplified' },
  { label: t('tools.bip39-generator.languages.chineseTraditional'), value: 'chineseTraditional' },
  { label: t('tools.bip39-generator.languages.czech'), value: 'czech' },
  { label: t('tools.bip39-generator.languages.french'), value: 'french' },
  { label: t('tools.bip39-generator.languages.italian'), value: 'italian' },
  { label: t('tools.bip39-generator.languages.japanese'), value: 'japanese' },
  { label: t('tools.bip39-generator.languages.korean'), value: 'korean' },
  { label: t('tools.bip39-generator.languages.portuguese'), value: 'portuguese' },
  { label: t('tools.bip39-generator.languages.spanish'), value: 'spanish' },
]);

const entropy = ref(generateEntropy());
const passphraseInput = ref('');

const language = ref<keyof typeof wordLists>('english');
const passphrase = computed({
  get() {
    return withDefaultOnError(() => entropyToMnemonic(entropy.value, wordLists[language.value]), passphraseInput.value);
  },
  set(value: string) {
    passphraseInput.value = value;
    entropy.value = withDefaultOnError(() => mnemonicToEntropy(value, wordLists[language.value]), '');
  },
});

const entropyValidation = useValidation<string>({
  source: entropy,
  rules: computed(() => [
    {
      validator: (value: string) => value === '' || (value.length <= 32 && value.length >= 16 && value.length % 4 === 0),
      message: t('tools.bip39-generator.entropyLengthError'),
    },
    {
      validator: (value: string) => /^[a-fA-F0-9]*$/.test(value),
      message: t('tools.bip39-generator.entropyHexError'),
    },
  ]),
});

const mnemonicValidation = useValidation<string>({
  source: passphrase,
  rules: computed(() => [
    {
      validator: (value: string) => isNotThrowing(() => mnemonicToEntropy(value, wordLists[language.value])),
      message: t('tools.bip39-generator.invalidMnemonic'),
    },
  ]),
});

function refreshEntropy() {
  entropy.value = generateEntropy();
}

const { copy: copyEntropy } = useCopy({ source: entropy });
const { copy: copyPassphrase } = useCopy({ source: passphrase });
</script>

<template>
  <div>
    <n-grid cols="3" x-gap="12">
      <n-gi span="1">
        <c-select
          v-model:value="language"
          searchable
          :label="t('tools.bip39-generator.language')"
          :options="languageOptions"
        />
      </n-gi>
      <n-gi span="2">
        <n-form-item
          :label="t('tools.bip39-generator.entropySeed')"
          :feedback="entropyValidation.message"
          :validation-status="entropyValidation.status"
        >
          <n-input-group>
            <c-input-text v-model:value="entropy" :placeholder="t('tools.bip39-generator.entropyPlaceholder')" />

            <c-button @click="refreshEntropy()">
              <n-icon size="22">
                <Refresh />
              </n-icon>
            </c-button>
            <c-button @click="copyEntropy(undefined, { notificationMessage: t('tools.bip39-generator.entropyCopied') })">
              <n-icon size="22">
                <Copy />
              </n-icon>
            </c-button>
          </n-input-group>
        </n-form-item>
      </n-gi>
    </n-grid>
    <n-form-item
      :label="t('tools.bip39-generator.passphrase')"
      :feedback="mnemonicValidation.message"
      :validation-status="mnemonicValidation.status"
    >
      <n-input-group>
        <c-input-text v-model:value="passphrase" :placeholder="t('tools.bip39-generator.mnemonicPlaceholder')" raw-text />

        <c-button @click="copyPassphrase(undefined, { notificationMessage: t('tools.bip39-generator.passphraseCopied') })">
          <n-icon size="22" :component="Copy" />
        </c-button>
      </n-input-group>
    </n-form-item>
  </div>
</template>
