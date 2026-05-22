import { useColorMode, usePreferredReducedMotion } from "@vueuse/core";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";

export function useTheme() {
  const { $refreshHardAos } = useNuxtApp();

  const motionPreference = usePreferredReducedMotion();

  const colorMode = useColorMode({
    attribute: "class",
    storageKey: "vueuse-color-scheme",
    initialValue: "auto",
  });

  const lastMousePos = ref({
    x: 0,
    y: 0,
  });

  type ThemeEvent = MouseEvent | TouchEvent | KeyboardEvent;

  const newTheme = computed(() =>
    colorMode.value === "dark" ? "light" : "dark",
  );

  const currentIcon = computed(() =>
    colorMode.value === "dark"
      ? "i-line-md-sunny-filled-loop"
      : "i-line-md-moon-filled-loop",
  );

  const toggleTheme = () => {
    colorMode.value = newTheme.value;
  };

  const refreshAos = () => {
    nextTick(() => {
      if (typeof $refreshHardAos === "function") {
        $refreshHardAos();
      }
    });
  };

  const updatePointer = (e: MouseEvent) => {
    lastMousePos.value = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  onMounted(() => {
    lastMousePos.value = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    window.addEventListener("mousemove", updatePointer, {
      passive: true,
    });
  });

  onUnmounted(() => {
    window.removeEventListener("mousemove", updatePointer);
  });

  const startViewTransition = async (event?: ThemeEvent) => {
    // Reduced motion / unsupported browsers fallback
    if (!document.startViewTransition || motionPreference.value === "reduce") {
      toggleTheme();
      refreshAos();
      return;
    }

    const x
      = event instanceof MouseEvent
        ? event.clientX
        : event instanceof TouchEvent
          ? (event.touches?.[0]?.clientX ?? lastMousePos.value.x)
          : lastMousePos.value.x;

    const y
      = event instanceof MouseEvent
        ? event.clientY
        : event instanceof TouchEvent
          ? (event.touches?.[0]?.clientY ?? lastMousePos.value.y)
          : lastMousePos.value.y;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const changingToDark = newTheme.value === "dark";

    try {
      const transition = document.startViewTransition(async () => {
        toggleTheme();

        // Ensure DOM/theme fully updates before animation starts
        await nextTick();
      });

      await transition.ready;

      // Slower cinematic timing
      const duration = 1050;

      const clipPathFrames = changingToDark
        ? [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius * 0.35}px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ]
        : [
            `circle(${endRadius}px at ${x}px ${y}px)`,
            `circle(${endRadius * 0.45}px at ${x}px ${y}px)`,
            `circle(0px at ${x}px ${y}px)`,
          ];

      const targetPseudoElement = changingToDark
        ? "::view-transition-new(root)"
        : "::view-transition-old(root)";

      // Main reveal animation
      document.documentElement.animate(
        {
          clipPath: clipPathFrames,
          filter: ["blur(6px)", "blur(2px)", "blur(0px)"],
          opacity: [0.7, 0.9, 1],
        },
        {
          duration,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
          pseudoElement: targetPseudoElement,
        },
      );

      // Subtle root fade stabilization
      document.documentElement.animate(
        {
          opacity: [0.96, 1],
        },
        {
          duration: duration * 0.7,
          easing: "ease-out",
        },
      );

      transition.finished.finally(() => {
        refreshAos();
      });
    }
    catch (err) {
      console.warn("View Transition skipped or aborted:", err);

      toggleTheme();
      refreshAos();
    }
  };

  return {
    newTheme,
    currentIcon,
    toggleTheme,
    startViewTransition,
  };
}
