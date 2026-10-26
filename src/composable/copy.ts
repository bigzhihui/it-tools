import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';

// eslint-disable-next-line no-restricted-imports
import { useClipboard } from '@vueuse/core';
import { useMessage } from 'naive-ui';
import { usageOperation } from '../afeiii-usage';

export function useCopy({ source, text = 'Copied to the clipboard', createToast = true }: { source?: MaybeRefOrGetter<string>; text?: MaybeRefOrGetter<string>; createToast?: boolean } = {}) {
  const { copy, copied, ...rest } = useClipboard({
    source,
    legacy: true,
  });

  const message = useMessage();

  return {
    ...rest,
    isJustCopied: copied,
    async copy(content?: string, { notificationMessage }: { notificationMessage?: string } = {}) {
      const usage = usageOperation();
      try {
        if (source) {
          await copy();
        }
        else {
          await copy(content);
        }
        usage[copied.value ? 'success' : 'failure']();
      }
      catch (error) {
        usage.failure();
        throw error;
      }

      if (createToast) {
        message.success(notificationMessage ?? toValue(text));
      }
    },
  };
}
