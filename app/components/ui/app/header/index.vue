<script setup lang="ts">
import { siteConfig } from "~/app.meta";

const { headerClass, containerClass } = useFloatingHeader();
const { $refreshAos } = useNuxtApp();

onMounted(async () => {
  await nextTick();
  $refreshAos();
});
</script>

<template>
  <UHeader
    mode="slideover"
    :class="headerClass"
    :ui="{
      root: 'sticky top-0 z-50 border-0 bg-transparent ring-0 transition-colors duration-300',
      container: containerClass,
      left: 'flex items-center gap-1.5',
      center: 'hidden lg:flex flex-1 items-center justify-center',
      right: 'flex items-center gap-2',
      body: 'border-0 bg-transparent p-6 backdrop-blur-md',
    }"
  >
    <!-- Logo -->
    <template #title>
      <NuxtLink
        to="/"
        class="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        :aria-label="siteConfig.name"
        data-aos="fade-left"
        data-aos-duration="400"
        data-aos-easing="ease-out-quad"
        data-aos-anchor="body"
      >
        <UiAppLogo />
      </NuxtLink>
    </template>

    <!-- Desktop Navigation -->
    <template #default>
      <UiAppHeaderDesktop />
    </template>

    <!-- Header Actions -->
    <template #right>
      <UiAppHeaderActions />
    </template>

    <!-- Mobile Navigation -->
    <template #body>
      <UiAppHeaderMobile />
    </template>
  </UHeader>
</template>
