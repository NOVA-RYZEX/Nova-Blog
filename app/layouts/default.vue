<script setup lang="ts">
useAOS();
</script>

<template>
  <UApp>
    <UiAppHeader />

    <UMain>
      <UContainer>
        <slot />
      </UContainer>
    </UMain>

    <UiAppFooter />
  </UApp>
</template>
