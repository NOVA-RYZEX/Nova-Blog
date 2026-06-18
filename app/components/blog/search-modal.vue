<script setup lang="ts">
defineOptions({
  name: "BlogSearchModal",
});

const logger = new Logger("BlogSearchModal component");

const links = [
  {
    label: "Authors",
    icon: "i-line-md-person",
    to: "/authors",
  },
  {
    label: "Tags",
    icon: "i-lucide-tag",
    to: "/tags",
  },
  {
    label: "Categories",
    icon: "i-line-md-folder",
    to: "/categories",
  },
];

const { data: navigation } = await useAsyncData("blog-search-navigation", () =>
  queryCollectionNavigation("blogs"));

logger.debug("Loaded blog search navigation:", { navigation: toValue(navigation) });

const { data: files } = useLazyAsyncData("search", () =>
  queryCollectionSearchSections("blogs", {
    ignoredTags: [
      "style",
      "code",
      "pre",
    ],
  }), {
  server: false,
});

watch(files, (newFiles) => {
  if (newFiles) {
    logger.debug("Loaded blog search sections for Fuse.js:", { newFiles });
  }
}, { immediate: true });

const { open } = useContentSearch();
</script>

<template>
  <ClientOnly>
    <UContentSearch
      v-model="open"
      :links="links"
      :navigation="navigation"
      :files="files"
      :fuse="{ resultLimit: 20, fuseOptions: { threshold: 0.2 } }"
      :color-mode="false"
      shortcut="meta_k"
      placeholder="Search articles, authors, tags, categories..."
    />
  </ClientOnly>
</template>
