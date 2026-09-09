<script setup lang="ts">
import { UAParser } from 'ua-parser-js';
import { Adjustments, Browser, Cpu, Devices, Engine } from '@vicons/tabler';
import { useI18n } from 'vue-i18n';
import UserAgentResultCards from './user-agent-result-cards.vue';
import type { UserAgentResultSection } from './user-agent-parser.types';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

const ua = ref(navigator.userAgent as string);

function getUserAgentInfo(userAgent: string) {
  return userAgent.trim().length > 0
    ? UAParser(userAgent.trim())
    : ({ ua: '', browser: {}, cpu: {}, device: {}, engine: {}, os: {} } as UAParser.IResult);
}
const userAgentInfo = computed(() => withDefaultOnError(() => getUserAgentInfo(ua.value), undefined));

const sections = computed<UserAgentResultSection[]>(() => [
  {
    heading: t('tools.user-agent-parser.sections.browser'),
    icon: Browser,
    content: [
      {
        label: t('tools.user-agent-parser.labels.name'),
        getValue: block => block?.browser.name,
        undefinedFallback: t('tools.user-agent-parser.fallbacks.noBrowserName'),
      },
      {
        label: t('tools.user-agent-parser.labels.version'),
        getValue: block => block?.browser.version,
        undefinedFallback: t('tools.user-agent-parser.fallbacks.noBrowserVersion'),
      },
    ],
  },
  {
    heading: t('tools.user-agent-parser.sections.engine'),
    icon: Engine,
    content: [
      {
        label: t('tools.user-agent-parser.labels.name'),
        getValue: block => block?.engine.name,
        undefinedFallback: t('tools.user-agent-parser.fallbacks.noEngineName'),
      },
      {
        label: t('tools.user-agent-parser.labels.version'),
        getValue: block => block?.engine.version,
        undefinedFallback: t('tools.user-agent-parser.fallbacks.noEngineVersion'),
      },
    ],
  },
  {
    heading: t('tools.user-agent-parser.sections.os'),
    icon: Adjustments,
    content: [
      {
        label: t('tools.user-agent-parser.labels.name'),
        getValue: block => block?.os.name,
        undefinedFallback: t('tools.user-agent-parser.fallbacks.noOsName'),
      },
      {
        label: t('tools.user-agent-parser.labels.version'),
        getValue: block => block?.os.version,
        undefinedFallback: t('tools.user-agent-parser.fallbacks.noOsVersion'),
      },
    ],
  },
  {
    heading: t('tools.user-agent-parser.sections.device'),
    icon: Devices,
    content: [
      {
        label: t('tools.user-agent-parser.labels.model'),
        getValue: block => block?.device.model,
        undefinedFallback: t('tools.user-agent-parser.fallbacks.noDeviceModel'),
      },
      {
        label: t('tools.user-agent-parser.labels.type'),
        getValue: block => block?.device.type,
        undefinedFallback: t('tools.user-agent-parser.fallbacks.noDeviceType'),
      },
      {
        label: t('tools.user-agent-parser.labels.vendor'),
        getValue: block => block?.device.vendor,
        undefinedFallback: t('tools.user-agent-parser.fallbacks.noDeviceVendor'),
      },
    ],
  },
  {
    heading: t('tools.user-agent-parser.sections.cpu'),
    icon: Cpu,
    content: [
      {
        label: t('tools.user-agent-parser.labels.architecture'),
        getValue: block => block?.cpu.architecture,
        undefinedFallback: t('tools.user-agent-parser.fallbacks.noCpuArch'),
      },
    ],
  },
]);
</script>

<template>
  <div>
    <c-input-text
      v-model:value="ua"
      :label="t('tools.user-agent-parser.inputLabel')"
      multiline
      :placeholder="t('tools.user-agent-parser.inputPlaceholder')"
      clearable
      raw-text
      rows="2"
      autosize
      monospace
      mb-3
    />

    <UserAgentResultCards :user-agent-info="userAgentInfo" :sections="sections" />
  </div>
</template>
