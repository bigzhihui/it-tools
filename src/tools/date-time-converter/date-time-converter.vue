<script setup lang="ts">
import {
  formatISO,
  formatISO9075,
  formatRFC3339,
  formatRFC7231,
  fromUnixTime,
  getTime,
  getUnixTime,
  isDate,
  isValid,
  parseISO,
  parseJSON,
} from 'date-fns';
import type { DateFormat, ToDateMapper } from './date-time-converter.types';
import {
  dateToExcelFormat,
  excelFormatToDate,
  isExcelFormat,
  isISO8601DateTimeString,
  isISO9075DateString,
  isMongoObjectId,
  isRFC3339DateString,
  isRFC7231DateString,
  isTimestamp,
  isUTCDateString,
  isUnixTimestamp,
} from './date-time-converter.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';

const inputDate = ref('');

const toDate: ToDateMapper = date => new Date(date);

const formats: DateFormat[] = [
  {
    name: 'JS locale date string',
    fromDate: date => date.toString(),
    toDate,
    formatMatcher: () => false,
  },
  {
    name: 'ISO 8601',
    fromDate: formatISO,
    toDate: parseISO,
    formatMatcher: date => isISO8601DateTimeString(date),
  },
  {
    name: 'ISO 9075',
    fromDate: formatISO9075,
    toDate: parseISO,
    formatMatcher: date => isISO9075DateString(date),
  },
  {
    name: 'RFC 3339',
    fromDate: formatRFC3339,
    toDate,
    formatMatcher: date => isRFC3339DateString(date),
  },
  {
    name: 'RFC 7231',
    fromDate: formatRFC7231,
    toDate,
    formatMatcher: date => isRFC7231DateString(date),
  },
  {
    name: 'Unix timestamp',
    fromDate: date => String(getUnixTime(date)),
    toDate: sec => fromUnixTime(+sec),
    formatMatcher: date => isUnixTimestamp(date),
  },
  {
    name: 'Timestamp',
    fromDate: date => String(getTime(date)),
    toDate: ms => parseJSON(+ms),
    formatMatcher: date => isTimestamp(date),
  },
  {
    name: 'UTC format',
    fromDate: date => date.toUTCString(),
    toDate,
    formatMatcher: date => isUTCDateString(date),
  },
  {
    name: 'Mongo ObjectID',
    fromDate: date => `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`,
    toDate: objectId => new Date(Number.parseInt(objectId.substring(0, 8), 16) * 1000),
    formatMatcher: date => isMongoObjectId(date),
  },
  {
    name: 'Excel date/time',
    fromDate: date => dateToExcelFormat(date),
    toDate: excelFormatToDate,
    formatMatcher: isExcelFormat,
  },
];

const formatIndex = ref(6);
const now = useNow();

const { t } = useI18n();

const formatLabels: Record<string, string> = {
  'JS locale date string': 'tools.date-converter.formats.jsLocale',
  'ISO 8601': 'tools.date-converter.formats.iso8601',
  'ISO 9075': 'tools.date-converter.formats.iso9075',
  'RFC 3339': 'tools.date-converter.formats.rfc3339',
  'RFC 7231': 'tools.date-converter.formats.rfc7231',
  'Unix timestamp': 'tools.date-converter.formats.unixTimestamp',
  'Timestamp': 'tools.date-converter.formats.timestamp',
  'UTC format': 'tools.date-converter.formats.utcFormat',
  'Mongo ObjectID': 'tools.date-converter.formats.mongoObjectId',
  'Excel date/time': 'tools.date-converter.formats.excelDateTime',
};

const getFormatLabel = (name: string) => formatLabels[name] ? t(formatLabels[name]) : name;

const normalizedDate = computed(() => {
  if (!inputDate.value) {
    return now.value;
  }

  const { toDate } = formats[formatIndex.value];

  try {
    return toDate(inputDate.value);
  }
  catch (_ignored) {
    return undefined;
  }
});

function onDateInputChanged(value: string) {
  const matchingIndex = formats.findIndex(({ formatMatcher }) => formatMatcher(value));
  if (matchingIndex !== -1) {
    formatIndex.value = matchingIndex;
  }
}

const validation = useValidation<string>({
  source: inputDate,
  watch: [formatIndex],
  rules: computed(() => [
    {
      message: t('tools.date-converter.invalidForFormat'),
      validator: (value: string) =>
        withDefaultOnError(() => {
          if (value === '') {
            return true;
          }

          const maybeDate = formats[formatIndex.value].toDate(value);
          return isDate(maybeDate) && isValid(maybeDate);
        }, false),
    },
  ]),
});

function formatDateUsingFormatter(formatter: (date: Date) => string, date?: Date) {
  if (!date || !validation.isValid) {
    return '';
  }

  return withDefaultOnError(() => formatter(date), '');
}
</script>

<template>
  <div>
    <div flex gap-2>
      <c-input-text
        v-model:value="inputDate"
        autofocus
        :placeholder="t('tools.date-converter.inputPlaceholder')"
        clearable
        test-id="date-time-converter-input"
        :validation="validation"
        @update:value="onDateInputChanged"
      />

      <c-select
        v-model:value="formatIndex"
        style="flex: 0 0 200px"
        :options="formats.map(({ name }, i) => ({ label: getFormatLabel(name), value: i }))"
        data-test-id="date-time-converter-format-select"
      />
    </div>

    <n-divider />

    <input-copyable
      v-for="{ name, fromDate } in formats"
      :key="name"
      :label="getFormatLabel(name)"
      label-width="170px"
      label-position="left"
      label-align="right"
      :value="formatDateUsingFormatter(fromDate, normalizedDate)"
      :placeholder="t('tools.date-converter.invalidDate')"
      :test-id="name"
      readonly
      mt-2
    />
  </div>
</template>
