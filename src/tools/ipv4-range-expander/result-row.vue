<script setup lang="ts">
import _ from 'lodash';
import SpanCopyable from '@/components/SpanCopyable.vue';

const props = withDefaults(defineProps<{ label: string; testId?: string; oldValue?: string; newValue?: string }>(), {
  label: '',
  testId: '',
  oldValue: '',
  newValue: '',
});
const { label, oldValue, newValue } = toRefs(props);

const rowTestId = computed(() => props.testId || _.kebabCase(label.value));
</script>

<template>
  <tr>
    <td font-bold>
      {{ label }}
    </td>
    <td :data-test-id="`${rowTestId}.old`">
      <SpanCopyable :value="oldValue" class="monospace" />
    </td>
    <td :data-test-id="`${rowTestId}.new`">
      <SpanCopyable :value="newValue" />
    </td>
  </tr>
</template>
