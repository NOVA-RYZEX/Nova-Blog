<script setup lang="ts">
useAOS();
</script>

<template>
  <UApp>
    <UiAppHeader />

    <UMain>
      <slot />
    </UMain>

    <UiAppFooter />
  </UApp>
</template>
