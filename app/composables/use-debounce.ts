import { ref, watch } from "vue";

import type { Ref } from "vue";

export function useDebounce<T>(source: Ref<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref(source.value) as Ref<T>;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  watch(source, (newValue) => {
    if (timeoutId)
      clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return debouncedValue;
}
