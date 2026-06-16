// composables/useElementTilt.ts
import { ref } from "vue";

export type TiltOptions = {
  maxRotation?: number; // Maximum degrees to rotate (Default: 10)
  scale?: number; // Scale element on hover (Default: 1.02)
};

export function useElementTilt(options: TiltOptions = {}) {
  const maxRotation = options.maxRotation ?? 10;
  const scale = options.scale ?? 1.02;

  const tiltStyle = ref<string>("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const isHovered = ref<boolean>(false);

  const handleMouseMove = (event: MouseEvent) => {
    const element = event.currentTarget as HTMLElement;
    if (!element)
      return;

    const rect = element.getBoundingClientRect();

    // Calculate mouse position relative to element center (-1 to 1)
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const normalizeX = (x - 0.5) * 2;
    const normalizeY = (y - 0.5) * 2;

    // Calculate rotation angles (invert X axis for natural behavior)
    const rotateX = (-normalizeY * maxRotation).toFixed(2);
    const rotateY = (normalizeX * maxRotation).toFixed(2);

    tiltStyle.value = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  };

  const handleMouseLeave = () => {
    isHovered.value = false;
    // Smoothly reset transformations back to initial baseline
    tiltStyle.value = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  const handleMouseEnter = () => {
    isHovered.value = true;
  };

  return {
    tiltStyle,
    isHovered,
    tiltEvents: {
      mousemove: handleMouseMove,
      mouseleave: handleMouseLeave,
      mouseenter: handleMouseEnter,
    },
  };
}
