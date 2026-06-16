import { computed, ref } from "vue";

type TiltOptions = {
  strengthX?: number;
  strengthY?: number;
  resetX?: number;
  resetY?: number;
  perspective?: number;
};

export function useTiltCard(options?: TiltOptions) {
  const {
    strengthX = 20,
    strengthY = 24,
    resetX = 0,
    resetY = 0,
    perspective = 1000,
  } = options || {};

  const { isMotionReduced } = useReduceMotion();

  const el = ref<HTMLElement | null>(null);
  const rotateX = ref(resetX);
  const rotateY = ref(resetY);
  const isTracking = ref(false);

  const handlePointerMove = (e: PointerEvent) => {
    // Drop execution immediately if motion constraints are active
    if (isMotionReduced.value || !el.value)
      return;

    const rect = el.value.getBoundingClientRect();

    // Normalize coordinates around center (yields ranges from -1 to 1)
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    // Bound values strictly within safe parameters
    rotateX.value = -dy * strengthX;
    rotateY.value = dx * strengthY;
  };

  const handlePointerEnter = () => {
    if (isMotionReduced.value)
      return;
    isTracking.value = true;
  };

  const handlePointerLeave = () => {
    isTracking.value = false;
    rotateX.value = resetX;
    rotateY.value = resetY;
  };

  const transformStyles = computed(() => {
    if (isMotionReduced.value)
      return {};

    return {
      transform: `perspective(${perspective}px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`,
      transition: isTracking.value
        ? "none"
        : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
      willChange: isTracking.value ? "transform" : "auto",
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
