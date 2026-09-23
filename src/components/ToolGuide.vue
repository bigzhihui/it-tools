<script setup lang="ts">
const props = defineProps<{ toolKey: string }>();

const { t, te, locale } = useI18n();

// Guides hold up to this many question and answer pairs, as q1/a1, q2/a2 and
// so on. Flat keys keep them readable through plain t(), with no list handling.
const MAX_QUESTIONS = 5;

const guide = computed(() => {
  const base = `tools.${props.toolKey}.guide`;
  const current = locale.value;

  if (!te(`${base}.intro`, current)) {
    return null;
  }

  const faq: { q: string; a: string }[] = [];
  for (let i = 1; i <= MAX_QUESTIONS; i++) {
    if (te(`${base}.q${i}`, current) && te(`${base}.a${i}`, current)) {
      faq.push({ q: t(`${base}.q${i}`), a: t(`${base}.a${i}`) });
    }
  }

  return {
    intro: t(`${base}.intro`),
    usage: te(`${base}.usage`, current) ? t(`${base}.usage`) : '',
    faq,
  };
});
</script>

<template>
  <section v-if="guide" class="tool-guide" data-test-id="tool-guide">
    <h2>{{ t('toolGuide.about') }}</h2>
    <p>{{ guide.intro }}</p>

    <template v-if="guide.usage">
      <h2>{{ t('toolGuide.usage') }}</h2>
      <p>{{ guide.usage }}</p>
    </template>

    <template v-if="guide.faq.length">
      <h2>{{ t('toolGuide.faq') }}</h2>
      <dl>
        <template v-for="item in guide.faq" :key="item.q">
          <dt>{{ item.q }}</dt>
          <dd>{{ item.a }}</dd>
        </template>
      </dl>
    </template>
  </section>
</template>

<style lang="less" scoped>
.tool-guide {
  max-width: 600px;
  margin: 48px auto 0;
  line-height: 1.75;

  h2 {
    margin: 28px 0 8px;
    font-size: 18px;
    font-weight: 500;
    opacity: 0.9;
  }

  p,
  dd {
    margin: 0;
    opacity: 0.75;
  }

  dl {
    margin: 0;
  }

  dt {
    margin-top: 16px;
    font-weight: 500;
    opacity: 0.9;
  }

  dd {
    margin-top: 4px;
  }
}
</style>
