import messages from '@intlify/unplugin-vue-i18n/messages';
import { get } from '@vueuse/core';
import type { Plugin } from 'vue';
import { createI18n } from 'vue-i18n';

// 默认首选简体中文 (zh)，若用户未手动设定则始终为中文
function getInitialLocale() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('locale');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'string') {
          return parsed;
        }
      }
      catch {
        const clean = saved.replace(/^"|"$/g, '');
        if (clean) {
          return clean;
        }
      }
    }
  }
  return 'zh';
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages,
});

export const i18nPlugin: Plugin = {
  install: (app) => {
    app.use(i18n);
  },
};

export const translate = function (localeKey: string) {
  const hasKey = i18n.global.te(localeKey, get(i18n.global.locale));
  return hasKey ? i18n.global.t(localeKey) : localeKey;
};
