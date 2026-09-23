<script setup lang="ts">
import { useThemeVars } from 'naive-ui';

const { t, locale } = useI18n();
const themeVars = useThemeVars();

// Offered only to visitors whose browser is not set to Chinese and who are
// still on the Chinese default. Nothing switches automatically: search engines
// keep seeing the Chinese page, and the visitor decides. The hint is always
// rendered in English because the people it targets may not read Chinese.
const dismissed = useStorage('locale-hint-dismissed', false);

const browserLanguage = typeof navigator === 'undefined'
  ? ''
  : (navigator.languages?.[0] ?? navigator.language ?? '');
const browserPrefersChinese = browserLanguage.toLowerCase().startsWith('zh');

const visible = computed(() => !dismissed.value && !browserPrefersChinese && locale.value === 'zh');

function inEnglish(key: string) {
  return t(key, {}, { locale: 'en' });
}

function switchToEnglish() {
  locale.value = 'en';
  dismissed.value = true;
}

function dismiss() {
  dismissed.value = true;
}
</script>

<template>
  <div
    v-if="visible"
    class="locale-hint"
    lang="en"
    role="region"
    :aria-label="inEnglish('localeHint.message')"
    data-test-id="locale-hint"
    :style="{
      backgroundColor: themeVars.cardColor,
      color: themeVars.textColor2,
      borderColor: themeVars.borderColor,
      boxShadow: themeVars.boxShadow2,
    }"
  >
    <span>{{ inEnglish('localeHint.message') }}</span>
    <div class="locale-hint-actions">
      <c-button
        size="small"
        type="primary"
        data-test-id="locale-hint-switch"
        @click="switchToEnglish"
      >
        {{ inEnglish('localeHint.switch') }}
      </c-button>
      <c-button
        size="small"
        variant="text"
        data-test-id="locale-hint-dismiss"
        @click="dismiss"
      >
        {{ inEnglish('localeHint.dismiss') }}
      </c-button>
    </div>
  </div>
</template>

<style scoped lang="less">
// Fixed position so it never pushes page content around after mount, which
// would otherwise count as layout shift in Core Web Vitals.
.locale-hint {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  max-width: calc(100vw - 32px);
  padding: 10px 14px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 13px;
}

.locale-hint-actions {
  display: flex;
  gap: 6px;
}
</style>
