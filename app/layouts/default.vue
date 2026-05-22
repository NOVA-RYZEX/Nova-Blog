<script setup lang="ts"></script>

<template>
  <UApp>
    <UiAppHeader />
    <UMain>
      <slot />
    </UMain>
    <UFooter>
      <div class="text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} Nova Blog. All rights reserved.
      </div>
    </UFooter>
  </UApp>
</template>
