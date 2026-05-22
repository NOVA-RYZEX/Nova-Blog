<script lang="ts" setup>
import { Logger } from "./utils";

const route = useRoute();
const logger = new Logger("App.vue");

logger.log(`Navigated to ${route.path}`);
</script>

<template>
  <NuxtLayout name="default">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>
