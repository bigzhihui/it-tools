import { type MaybeRef, get } from '@vueuse/core';
import Fuse from 'fuse.js';
import { computed, watch } from 'vue';

export { useFuzzySearch };

function useFuzzySearch<Data>({
  search,
  data,
  options = {},
}: {
  search: MaybeRef<string>
  data: MaybeRef<Data[]>
  options?: Fuse.IFuseOptions<Data> & { filterEmpty?: boolean }
}) {
  const fuse = new Fuse(get(data), options);
  const filterEmpty = options.filterEmpty ?? true;

  watch(
    () => get(data),
    (newData) => {
      fuse.setCollection(newData);
    },
  );

  const searchResult = computed<Data[]>(() => {
    const query = get(search);
    const currentData = get(data);

    if (!filterEmpty && query === '') {
      return currentData;
    }

    return fuse.search(query).map(({ item }) => item);
  });

  return { searchResult };
}
