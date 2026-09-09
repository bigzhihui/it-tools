<script setup lang="ts">
import cronstrue from 'cronstrue/i18n';
import { isValidCron } from 'cron-validator';
import { useStyleStore } from '@/stores/style.store';

const { t, locale } = useI18n();

function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true });
}

const styleStore = useStyleStore();

const cron = ref('40 * * * *');
const cronstrueConfig = reactive({
  verbose: true,
  dayOfWeekStartIndexZero: true,
  use24HourTimeFormat: true,
  throwExceptionOnParseError: true,
});

const helpers = computed(() => [
  {
    symbol: '*',
    meaning: t('tools.crontab-generator.meanings.anyValue'),
    example: '* * * *',
    equivalent: t('tools.crontab-generator.meanings.everyMinute'),
  },
  {
    symbol: '-',
    meaning: t('tools.crontab-generator.meanings.rangeValues'),
    example: '1-10 * * *',
    equivalent: t('tools.crontab-generator.meanings.minutes1Through10'),
  },
  {
    symbol: ',',
    meaning: t('tools.crontab-generator.meanings.listValues'),
    example: '1,10 * * *',
    equivalent: t('tools.crontab-generator.meanings.minutes1And10'),
  },
  {
    symbol: '/',
    meaning: t('tools.crontab-generator.meanings.stepValues'),
    example: '*/10 * * *',
    equivalent: t('tools.crontab-generator.meanings.every10Minutes'),
  },
  {
    symbol: '@yearly',
    meaning: t('tools.crontab-generator.meanings.yearly'),
    example: '@yearly',
    equivalent: '0 0 1 1 *',
  },
  {
    symbol: '@annually',
    meaning: t('tools.crontab-generator.meanings.sameAsYearly'),
    example: '@annually',
    equivalent: '0 0 1 1 *',
  },
  {
    symbol: '@monthly',
    meaning: t('tools.crontab-generator.meanings.monthly'),
    example: '@monthly',
    equivalent: '0 0 1 * *',
  },
  {
    symbol: '@weekly',
    meaning: t('tools.crontab-generator.meanings.weekly'),
    example: '@weekly',
    equivalent: '0 0 * * 0',
  },
  {
    symbol: '@daily',
    meaning: t('tools.crontab-generator.meanings.daily'),
    example: '@daily',
    equivalent: '0 0 * * *',
  },
  {
    symbol: '@midnight',
    meaning: t('tools.crontab-generator.meanings.sameAsDaily'),
    example: '@midnight',
    equivalent: '0 0 * * *',
  },
  {
    symbol: '@hourly',
    meaning: t('tools.crontab-generator.meanings.hourly'),
    example: '@hourly',
    equivalent: '0 * * * *',
  },
  {
    symbol: '@reboot',
    meaning: t('tools.crontab-generator.meanings.reboot'),
    example: '',
    equivalent: '',
  },
]);

const tableHeaders = computed(() => [
  { key: 'symbol', label: t('tools.crontab-generator.symbol') },
  { key: 'meaning', label: t('tools.crontab-generator.meaning') },
  { key: 'example', label: t('tools.crontab-generator.example') },
  { key: 'equivalent', label: t('tools.crontab-generator.equivalent') },
]);

const cronString = computed(() => {
  if (isCronValid(cron.value)) {
    return cronstrue.toString(cron.value, {
      ...cronstrueConfig,
      locale: locale.value === 'zh' ? 'zh_CN' : 'en',
    });
  }
  return ' ';
});

const cronValidationRules = computed(() => [
  {
    validator: (value: string) => isCronValid(value),
    message: t('tools.crontab-generator.invalid'),
  },
]);
</script>

<template>
  <c-card>
    <div mx-auto max-w-sm>
      <c-input-text
        v-model:value="cron"
        size="large"
        placeholder="* * * * *"
        :validation-rules="cronValidationRules"
        mb-3
      />
    </div>

    <div class="cron-string">
      {{ cronString }}
    </div>

    <n-divider />

    <div flex justify-center>
      <n-form :show-feedback="false" label-width="190" label-placement="left">
        <n-form-item :label="t('tools.crontab-generator.verbose')">
          <n-switch v-model:value="cronstrueConfig.verbose" />
        </n-form-item>
        <n-form-item :label="t('tools.crontab-generator.use24Hour')">
          <n-switch v-model:value="cronstrueConfig.use24HourTimeFormat" />
        </n-form-item>
        <n-form-item :label="t('tools.crontab-generator.daysStartAtZero')">
          <n-switch v-model:value="cronstrueConfig.dayOfWeekStartIndexZero" />
        </n-form-item>
      </n-form>
    </div>
  </c-card>
  <c-card>
    <pre v-if="locale === 'zh'">
┌──────────── [可选] 秒 (0 - 59)
| ┌────────── 分钟 (0 - 59)
| | ┌──────── 小时 (0 - 23)
| | | ┌────── 日期 (1 - 31)
| | | | ┌──── 月份 (1 - 12) 或 jan,feb,mar,apr ...
| | | | | ┌── 星期 (0 - 6，周日=0) 或 sun,mon ...
| | | | | |
* * * * * * 命令</pre>
    <pre v-else>
┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command</pre>

    <div v-if="styleStore.isSmallScreen">
      <c-card v-for="{ symbol, meaning, example, equivalent } in helpers" :key="symbol" mb-3 important:border-none>
        <div>
          {{ t('tools.crontab-generator.symbol') }}: <strong>{{ symbol }}</strong>
        </div>
        <div>
          {{ t('tools.crontab-generator.meaning') }}: <strong>{{ meaning }}</strong>
        </div>
        <div>
          {{ t('tools.crontab-generator.example') }}:
          <strong><code>{{ example }}</code></strong>
        </div>
        <div>
          {{ t('tools.crontab-generator.equivalent') }}: <strong>{{ equivalent }}</strong>
        </div>
      </c-card>
    </div>

    <c-table v-else :data="helpers" :headers="tableHeaders" />
  </c-card>
</template>

<style lang="less" scoped>
::v-deep(input) {
  font-size: 30px;
  font-family: monospace;
  padding: 5px;
  text-align: center;
}

.cron-string {
  text-align: center;
  font-size: 22px;
  opacity: 0.8;
  margin: 5px 0 15px;
}

pre {
  overflow: auto;
  padding: 10px 0;
}
</style>
