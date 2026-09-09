<script setup lang="ts">
import { parse as parseToml } from 'iarna-toml-esm';
import { useI18n } from 'vue-i18n';
import { withDefaultOnError } from '../../utils/defaults';
import { isValidToml } from './toml.services';
import type { UseValidationRule } from '@/composable/validation';

const { t } = useI18n();

const transformer = (value: string) => value === '' ? '' : withDefaultOnError(() => JSON.stringify(parseToml(value), null, 3), '');

const rules = computed<UseValidationRule<string>[]>(() => [
  {
    validator: isValidToml,
    message: t('tools.toml-to-json.invalidToml'),
  },
]);
</script>

<template>
  <format-transformer
    :input-label="$t('tools.toml-to-json.inputLabel')"
    :input-placeholder="$t('tools.toml-to-json.inputPlaceholder')"
    :output-label="$t('tools.toml-to-json.outputLabel')"
    output-language="json"
    :input-validation-rules="rules"
    :transformer="transformer"
  />
</template>
