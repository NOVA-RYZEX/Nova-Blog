<script setup lang="ts">
import { siteConfig } from "~/app.meta";

const name = siteConfig.name;
const description = siteConfig.tagLine;

const { activeHoverText, clearDecryption, startDecryption } = useMatrixDecrypt({
  revealStep: 1,
  speed: 50,
});

function handleMouseEnter() {
  startDecryption(name, "logo");
  startDecryption(description, "logoDescription");
}

function handleMouseLeave() {
  clearDecryption("logo");
  clearDecryption("logoDescription");
}
</script>

<template>
  <NuxtLink
    to="/"
    class="group inline-flex select-none items-center gap-3 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    :aria-label="`${name} — ${description}`"
    data-aos="fade-left"
    data-aos-duration="500"
    data-aos-easing="ease-out-quad"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Logo Icon Wrapper -->
    <div class="relative flex h-9 w-9 shrink-0 items-center justify-center transition-transform duration-300 transform-gpu group-hover:scale-105">
      <NuxtImg
        src="/favicon.svg"
        alt=""
        width="32"
        height="32"
        class="z-10 h-8 w-8 object-contain"
      />
    </div>

    <div class="flex flex-col font-mono tracking-wide">
      <span
        class="flex min-h-5 items-center whitespace-nowrap text-sm font-bold tracking-tight text-current tabular-nums"
        aria-hidden="true"
      >
        {{ activeHoverText.logo || name }}
      </span>

      <span
        class="mt-0.5 flex min-h-4 items-center whitespace-nowrap text-[11px] font-semibold text-current opacity-60 transition-opacity duration-300 tabular-nums group-hover:opacity-80"
        aria-hidden="true"
      >
        {{ activeHoverText.logoDescription || description }}
      </span>
    </div>
  </NuxtLink>
</template>
