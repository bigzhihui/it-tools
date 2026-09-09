<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useCopy } from '@/composable/copy';
import { textToBase64 } from '@/utils/base64';

const { t } = useI18n();

const username = ref('');
const password = ref('');
const header = computed(() => `Authorization: Basic ${textToBase64(`${username.value}:${password.value}`)}`);

const { copy } = useCopy({ source: header });
</script>

<template>
  <div>
    <c-input-text
      v-model:value="username"
      :label="t('tools.basic-auth-generator.username')"
      :placeholder="t('tools.basic-auth-generator.usernamePlaceholder')"
      clearable
      raw-text
      mb-5
    />
    <c-input-text
      v-model:value="password"
      :label="t('tools.basic-auth-generator.password')"
      :placeholder="t('tools.basic-auth-generator.passwordPlaceholder')"
      clearable
      raw-text
      mb-2
      type="password"
    />

    <c-card>
      <n-statistic :label="t('tools.basic-auth-generator.authHeader')" class="header">
        <n-scrollbar x-scrollable style="max-width: 550px; margin-bottom: -10px; padding-bottom: 10px" trigger="none">
          {{ header }}
        </n-scrollbar>
      </n-statistic>
    </c-card>
    <div mt-5 flex justify-center>
      <c-button @click="copy(undefined, { notificationMessage: t('tools.basic-auth-generator.copied') })">
        {{ t('tools.basic-auth-generator.copyHeader') }}
      </c-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
::v-deep(.n-statistic-value__content) {
  font-family: monospace;
  font-size: 17px !important;
  white-space: nowrap;
}
</style>
