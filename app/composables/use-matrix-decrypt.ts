import { onUnmounted, ref } from "vue";

import type { ComputedRef, Ref } from "vue";

export type MatrixDecryptOptions = {
  /** Optional reactive reference indicating if motion should be skipped entirely. */
  reducedMotion?: ComputedRef<boolean> | Ref<boolean>;
  /** The interval refresh rate in milliseconds. Lower is faster. Defaults to 25. */
  speed?: number;
  /** The number of characters decoded per tick frame. Higher reveals the text quicker. Defaults to 0.34. */
  revealStep?: number;
};

export function useMatrixDecrypt(options: MatrixDecryptOptions = {}) {
  // Config fallbacks
  const speed = options.speed ?? 25;
  const revealStep = options.revealStep ?? 0.34;
  const reducedMotion = options.reducedMotion ?? ref(false);

  const matrixChars = "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ".split("");
  const activeHoverText = ref<Record<string, string>>({});

  let activeIntervals: Record<string, ReturnType<typeof setInterval>> = {};

  // High-performance state cleanup utility
  const omitKey = <T>(record: Record<string, T>, key: string): Record<string, T> => {
    const { [key]: _omitted, ...rest } = record;
    return rest;
  };

  const startDecryption = (label: string, id: string): void => {
    if (reducedMotion.value)
      return;

    // Clear any lingering thread running on this specific ID layer
    if (activeIntervals[id]) {
      clearInterval(activeIntervals[id]);
    }

    let iterations = 0;
    const originalText = label;

    activeIntervals[id] = setInterval(() => {
      activeHoverText.value[id] = originalText
        .split("")
        .map((char, index) => {
          if (char === " ")
            return " ";
          if (index < iterations)
            return originalText[index];
          return matrixChars[Math.floor(Math.random() * matrixChars.length)] ?? "";
        })
        .join("");

      // Clean termination boundary check once all characters lock in
      if (iterations >= originalText.length) {
        clearInterval(activeIntervals[id]);
        activeIntervals = omitKey(activeIntervals, id);
        activeHoverText.value = omitKey(activeHoverText.value, id);
      }

      iterations += revealStep;
    }, speed);
  };

  const clearDecryption = (id: string): void => {
    if (activeIntervals[id]) {
      clearInterval(activeIntervals[id]);
      activeIntervals = omitKey(activeIntervals, id);
    }
    activeHoverText.value = omitKey(activeHoverText.value, id);
  };

  // Automated absolute safety memory dump on page navigation/unmounting
  onUnmounted(() => {
    Object.values(activeIntervals).forEach(clearInterval);
    activeIntervals = {};
    activeHoverText.value = {};
  });

  return {
    activeHoverText,
    startDecryption,
    clearDecryption,
  };
}
