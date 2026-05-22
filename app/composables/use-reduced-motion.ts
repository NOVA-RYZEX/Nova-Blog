import { usePreferredReducedMotion } from "@vueuse/core";
import { computed } from "vue";

export function useReducedMotion() {
  const motionPreference = usePreferredReducedMotion();

  const reducedMotion = computed<boolean>(
    () => motionPreference.value === "reduce",
  );

  return {
    reducedMotion,
  };
}
