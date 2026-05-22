import { computed, inject, ref } from "vue";

import type { ComputedRef } from "vue";

export function useTiltCard(options?: {
  strengthX?: number;
  strengthY?: number;
  resetX?: number;
  resetY?: number;
}) {
  const {
    strengthX = 20,
    strengthY = 24,
    resetX = 0,
    resetY = 0,
  } = options || {};

  const injectedReducedMotion = inject<ComputedRef<boolean> | null>(
    "reducedMotion",
    null,
  );

  const reducedMotion = computed(() => injectedReducedMotion?.value ?? false);

  const el = ref<HTMLElement | null>(null);

  const rotateX = ref(resetX);
  const rotateY = ref(resetY);
  const isTracking = ref(false);

  const handlePointerMove = (e: PointerEvent) => {
    if (reducedMotion.value || !el.value)
      return;

    const rect = el.value.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    rotateX.value = -dy * strengthX;
    rotateY.value = dx * strengthY;
  };

  const handlePointerEnter = () => (isTracking.value = true);

  const handlePointerLeave = () => {
    isTracking.value = false;
    rotateX.value = resetX;
    rotateY.value = resetY;
  };

  const transformStyles = computed(() => {
    if (reducedMotion.value)
      return {};

    return {
      transform: `rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`,
      transition: isTracking.value
        ? "none"
        : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
    };
  });

  return {
    el,
    transformStyles,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
    isTracking,
  };
}
