<script setup lang="ts">
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";

// Bind the parent state
const open = defineModel<boolean>("open", { default: true });

const { activeHoverText, startDecryption, clearDecryption } = useMatrixDecrypt({
  speed: 15,
  revealStep: 0.5,
});
</script>

<template>
  <USidebar
    v-model:open="open"
    variant="floating"
    collapsible="icon"
    side="left"
    class="border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-xl"
    :ui="{ container: 'h-full p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar' }"
  >
    <template #header>
      <div class="flex items-center gap-2.5 overflow-hidden w-full">
        <div class="p-1.5 rounded-lg bg-primary-500/10 text-primary-500 shrink-0">
          <UIcon name="i-ph-sliders-horizontal-duotone" class="size-5" />
        </div>
        <div class="flex flex-col truncate group-data-[collapsible=icon]:hidden">
          <span
            class="font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-400"
            @mouseenter="startDecryption('Filter System', 'sb-head')"
            @mouseleave="clearDecryption('sb-head')"
          >
            {{ activeHoverText['sb-head'] || 'Filter System' }}
          </span>
          <span class="text-xs font-bold text-neutral-900 dark:text-white">Workspace Controls</span>
        </div>
      </div>
    </template>

    <div class="flex-1 flex flex-col items-center justify-center p-4 text-center group-data-[collapsible=icon]:hidden border border-dashed border-neutral-200 dark:border-neutral-800/80 rounded-2xl bg-default/50">
      <div class="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-3 animate-pulse">
        <UIcon name="i-ph-hourglass-high-light" class="size-5" />
      </div>
      <h3 class="font-sans text-xs font-semibold text-neutral-800 dark:text-neutral-200">
        Filtering coming soon
      </h3>
      <p class="font-sans text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-40 leading-relaxed">
        We are upgrading our workspace sorting and deep search engines.
      </p>
    </div>

    <template #footer="slotProps">
      <slot name="footer" v-bind="slotProps" />
    </template>
  </USidebar>
</template>
