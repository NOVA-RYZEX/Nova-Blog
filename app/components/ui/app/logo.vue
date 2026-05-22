<script setup lang="ts">
import { siteConfig } from "~/app.meta";

const name = siteConfig.name;
const description = siteConfig.tagLine;

const { reducedMotion } = useReducedMotion();
const { activeHoverText, clearDecryption, startDecryption } = useMatrixDecrypt({
  reducedMotion,
  revealStep: 1,
  speed: 50,
});
</script>

<template>
  <NuxtLink
    v-slot="{ navigate }"
    to="/"
    custom
  >
    <div
      role="link"
      tabindex="0"
      class="inline-flex items-center gap-3 cursor-pointer group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg p-1"
      :aria-label="`${name} - ${description}`"
      data-aos="fade-left"
      data-aos-duration="500"
      data-aos-easing="ease-out-quad"
      @click="navigate"
      @keydown.enter.prevent="() => navigate()"
      @keydown.space.prevent="() => navigate()"
    >
      <!-- Logo Icon Wrapper -->
      <div
        class="relative shrink-0 w-9 h-9 flex items-center justify-center transition-all duration-300 transform-gpu group-hover:scale-105"
        data-aos="zoom-in"
        data-aos-delay="50"
      >
        <NuxtImg
          src="/icons/favicon.svg"
          alt=""
          width="32"
          height="32"
          class="w-8 h-8 object-contain z-10"
        />
      </div>

      <!-- Typography Context Stack -->
      <div
        class="flex flex-col font-mono tracking-wide"
        data-aos="fade-left"
        data-aos-delay="100"
      >
        <span
          class="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100 min-h-5 flex items-center whitespace-nowrap tabular-nums"
          aria-hidden="true"
          @mouseenter="startDecryption(name, 'logo')"
          @mouseleave="clearDecryption('logo')"
        >
          {{ activeHoverText.logo || name }}
        </span>

        <span
          class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 min-h-4 flex items-center whitespace-nowrap mt-0.5 group-hover:text-teal-600/80 dark:group-hover:text-teal-400/80 transition-colors duration-300 tabular-nums"
          aria-hidden="true"
          @mouseenter="startDecryption(description, 'logoDescription')"
          @mouseleave="clearDecryption('logoDescription')"
        >
          {{ activeHoverText.logoDescription || description }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
