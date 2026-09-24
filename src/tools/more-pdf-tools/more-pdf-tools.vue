<script setup lang="ts">
// The larger PDF toolkit is a sister site, pdf.afeiii.com, which runs the
// open-source BentoPDF. This page introduces it and links there.
const { t } = useI18n();

const siteUrl = 'https://pdf.afeiii.com';
const sourceUrl = 'https://github.com/bigzhihui/bentopdf';
</script>

<template>
  <div>
    <c-card>
      <p class="about">
        {{ t('tools.more-pdf-tools.about') }}
      </p>

      <h3 class="section-title">
        {{ t('tools.more-pdf-tools.notesTitle') }}
      </h3>
      <ul class="notes">
        <li data-test-id="more-pdf-tools-privacy">
          {{ t('tools.more-pdf-tools.privacy') }}
        </li>
        <li>{{ t('tools.more-pdf-tools.browser') }}</li>
        <li>{{ t('tools.more-pdf-tools.firstLoad') }}</li>
        <li>{{ t('tools.more-pdf-tools.ocr') }}</li>
        <li>{{ t('tools.more-pdf-tools.office') }}</li>
      </ul>

      <c-button
        mt-4
        w-full
        type="primary"
        :href="siteUrl"
        target="_blank"
        rel="noopener"
        data-test-id="more-pdf-tools-open"
      >
        {{ t('tools.more-pdf-tools.open') }}
      </c-button>
    </c-card>

    <c-card mt-3>
      <h3 class="section-title first">
        {{ t('tools.more-pdf-tools.sourceTitle') }}
      </h3>
      <p class="about">
        {{ t('tools.more-pdf-tools.source') }}
      </p>

      <c-button mt-3 :href="sourceUrl" target="_blank" rel="noopener" data-test-id="more-pdf-tools-repo">
        {{ t('tools.more-pdf-tools.repo') }}
      </c-button>
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

.notes {
  margin: 0;
  padding-left: 20px;
  line-height: 1.9;
}
</style>
