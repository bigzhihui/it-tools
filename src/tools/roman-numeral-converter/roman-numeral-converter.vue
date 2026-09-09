<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import {
  MAX_ARABIC_TO_ROMAN,
  MIN_ARABIC_TO_ROMAN,
  arabicToRoman,
  isValidRomanNumber,
  romanToArabic,
} from './roman-numeral-converter.service';
import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';

const { t } = useI18n();

const inputNumeral = ref(42);
const outputRoman = computed(() => arabicToRoman(inputNumeral.value));

const { attrs: validationNumeral } = useValidation({
  source: inputNumeral,
  rules: computed(() => [
    {
      validator: (value: number) => value >= MIN_ARABIC_TO_ROMAN && value <= MAX_ARABIC_TO_ROMAN,
      message: t('tools.roman-numeral-converter.arabicRangeError', [
        MIN_ARABIC_TO_ROMAN.toLocaleString(),
        MAX_ARABIC_TO_ROMAN.toLocaleString(),
      ]),
    },
  ]),
});

const inputRoman = ref('XLII');
const outputNumeral = computed(() => romanToArabic(inputRoman.value));

const validationRoman = useValidation({
  source: inputRoman,
  rules: computed(() => [
    {
      validator: (value: string) => isValidRomanNumber(value),
      message: t('tools.roman-numeral-converter.invalidRomanError'),
    },
  ]),
});

const { copy: copyRoman } = useCopy({
  source: outputRoman,
  text: computed(() => t('tools.roman-numeral-converter.copiedRoman')),
});
const { copy: copyArabic } = useCopy({
  source: () => String(outputNumeral.value),
  text: computed(() => t('tools.roman-numeral-converter.copiedArabic')),
});
</script>

<template>
  <div>
    <c-card :title="$t('tools.roman-numeral-converter.arabicToRomanTitle')">
      <div flex items-center justify-between>
        <n-form-item v-bind="validationNumeral as any">
          <n-input-number v-model:value="inputNumeral" :min="1" style="width: 200px" :show-button="false" />
        </n-form-item>
        <div class="result">
          {{ outputRoman }}
        </div>
        <c-button autofocus :disabled="validationNumeral.validationStatus === 'error'" @click="copyRoman()">
          {{ $t('tools.roman-numeral-converter.copy') }}
        </c-button>
      </div>
    </c-card>
    <c-card :title="$t('tools.roman-numeral-converter.romanToArabicTitle')" mt-5>
      <div flex items-center justify-between>
        <c-input-text v-model:value="inputRoman" style="width: 200px" :validation="validationRoman" />

        <div class="result">
          {{ outputNumeral }}
        </div>
        <c-button :disabled="!validationRoman.isValid" @click="copyArabic()">
          {{ $t('tools.roman-numeral-converter.copy') }}
        </c-button>
      </div>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
.result {
  font-size: 22px;
}
</style>
