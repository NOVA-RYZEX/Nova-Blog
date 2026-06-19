<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import { useAnimatedBorder } from "~/composables/use-animated-border";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";
import { useTiltCard } from "~/composables/use-tilt-card";

defineOptions({
  name: "PortalNavigationCard",
});

const props = defineProps<{
  to: string;
  icon: string;
  title: string;
  badge: string;
  text: string;
  id: string;
}>();

const {
  el: cardRef,
  transformStyles,
  handlePointerMove: tiltMove,
  handlePointerEnter: tiltEnter,
  handlePointerLeave: tiltLeave,
} = useTiltCard({
  strengthX: 8,
  strengthY: 10,
  perspective: 800,
});

const { mouseX, mouseY, isHovered } = useAnimatedBorder(cardRef);

const { activeHoverText, startDecryption, clearDecryption } = useMatrixDecrypt({
  speed: 20,
  revealStep: 0.4,
});

const displayTitle = computed(() => {
  return activeHoverText.value[props.id] || props.title;
});

const animatedBadgeCount = ref(0);
const targetBadgeNumber = computed(() => {
  const parsed = Number.parseInt(props.badge, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
});

function animateValue(start: number, end: number, duration: number) {
  if (start === end) {
    animatedBadgeCount.value = end;
    return;
  }
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp)
      startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = progress * (2 - progress);
    animatedBadgeCount.value = Math.floor(easeProgress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

onMounted(() => {
  animateValue(0, targetBadgeNumber.value, 1200);
});

watch(targetBadgeNumber, (newVal, oldVal) => {
  animateValue(oldVal || 0, newVal, 800);
});

function onCardEnter() {
  tiltEnter();
  startDecryption(props.title, props.id);
}

function onCardLeave() {
  tiltLeave();
  clearDecryption(props.id);
}
</script>

<template>
  <div
    ref="cardRef"
    class="group relative rounded-xl transition-all duration-300 bg-neutral-100/80 dark:bg-neutral-900/30 p-px flex flex-col overflow-hidden select-none"
    :style="[
      transformStyles,
      {
        '--mouse-x': `${mouseX}px`,
        '--mouse-y': `${mouseY}px`,
        '--spotlight-opacity': isHovered ? '1' : '0',
      },
    ]"
    @pointermove="tiltMove"
    @pointerenter="onCardEnter"
    @pointerleave="onCardLeave"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
      style="background: radial-gradient(160px circle at var(--mouse-x) var(--mouse-y), rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.08), transparent 70%);"
    />

    <NuxtLink
      :to="to"
      class="relative z-10 w-full h-full rounded-[11px] overflow-hidden bg-white dark:bg-neutral-950 p-3.5 flex flex-col justify-between"
    >
      <div>
        <div class="flex items-center justify-between gap-2">
          <div class="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/40 text-primary-500 transition-colors duration-300 group-hover:text-indigo-500">
            <UIcon :name="icon" class="h-4 w-4 block" />
          </div>

          <span class="font-mono text-[10px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/80 px-2 py-0.5 rounded-md border border-neutral-200/40 dark:border-neutral-800/60 tabular-nums">
            {{ animatedBadgeCount }}
          </span>
        </div>

        <h3 class="mt-3 text-xs font-bold font-mono tracking-tight text-neutral-900 dark:text-white uppercase">
          {{ displayTitle }}
        </h3>

        <p class="mt-1 text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400 line-clamp-2">
          {{ text }}
        </p>
      </div>

      <div class="mt-3 flex items-center justify-end w-full">
        <UIcon
          name="i-lucide-arrow-up-right"
          class="h-3 w-3 text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
        />
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped>
.group::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: radial-gradient(
    140px circle at var(--mouse-x) var(--mouse-y),
    rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.45),
    transparent 80%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: var(--spotlight-opacity, 0);
  transition: opacity 0.3s ease;
  z-index: 2;
}
</style>
