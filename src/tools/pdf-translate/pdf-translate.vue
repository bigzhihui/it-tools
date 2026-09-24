<script setup lang="ts">
// Translation itself is done by PDFMathTranslate's own online service. This
// page introduces it and says plainly that files go to that third party,
// unlike the site's other PDF tools, which never upload anything.
const { t } = useI18n();

const onlineUrl = 'https://pdf2zh.com';
const repoUrl = 'https://github.com/PDFMathTranslate/PDFMathTranslate';
const releasesUrl = `${repoUrl}/releases`;
</script>

<template>
  <div>
    <c-card>
      <p class="about">
        {{ t('tools.pdf-translate.about') }}
      </p>

      <c-alert mt-4 data-test-id="pdf-translate-notice">
        {{ t('tools.pdf-translate.thirdParty') }}
      </c-alert>

      <h3 class="section-title">
        {{ t('tools.pdf-translate.limitsTitle') }}
      </h3>
      <ul class="limits">
        <li>{{ t('tools.pdf-translate.limitSize') }}</li>
        <li>{{ t('tools.pdf-translate.limitPages') }}</li>
        <li>{{ t('tools.pdf-translate.limitEngine') }}</li>
      </ul>

      <c-button
        mt-4
        w-full
        type="primary"
        :href="onlineUrl"
        target="_blank"
        rel="noopener"
        data-test-id="pdf-translate-open"
      >
        {{ t('tools.pdf-translate.open') }}
      </c-button>
    </c-card>

    <c-card mt-3>
      <h3 class="section-title first">
        {{ t('tools.pdf-translate.offlineTitle') }}
      </h3>
      <p class="about">
        {{ t('tools.pdf-translate.offline') }}
      </p>

      <div mt-3 flex flex-wrap gap-2>
        <c-button :href="releasesUrl" target="_blank" rel="noopener" data-test-id="pdf-translate-desktop">
          {{ t('tools.pdf-translate.desktop') }}
        </c-button>
        <c-button :href="repoUrl" target="_blank" rel="noopener" data-test-id="pdf-translate-repo">
          {{ t('tools.pdf-translate.repo') }}
        </c-button>
      </div>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
.about {
  margin: 0;
  line-height: 1.7;
}

.section-title {
  margin: 20px 0 8px;
  font-size: 15px;
  font-weight: 600;
}

.section-title.first {
  margin-top: 0;
}

.limits {
  margin: 0;
  padding-left: 20px;
  line-height: 1.9;
}
</style>
