<script setup lang="ts">
import { watch } from "vue";

defineOptions({
  name: "BlogSearchModal",
});

const { data: navigation } = await useAsyncData("blog-search-navigation", () =>
  queryCollectionNavigation("blog"));

const { search, status, init } = useSearchCollection("blog", {
  immediate: false,
  ignoredTags: ["style", "code"],
});

const { open } = useContentSearch();

watch(open, (isOpenNow) => {
  if (isOpenNow && status.value === "idle") {
    init();
  }
});
</script>

<template>
  <ClientOnly>
    <UContentSearch
      v-model="open"
      :navigation="navigation || []"
      :search="search"
      :search-status="status"
      :color-mode="false"
      shortcut="meta_k"
      placeholder="Search workspace articles, tags, or authors..."
    />
  </ClientOnly>
</template>
