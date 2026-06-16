<script setup lang="ts">
import { findPageBreadcrumb } from "@nuxt/content/utils";
import { mapContentNavigation } from "@nuxt/ui/utils/content";

const route = useRoute();

const { data: page } = await useAsyncData("page", () =>
  queryCollection("blog")
    .where("path", "=", route.path)
    .first());

const { data: navigation } = await useAsyncData("navigation", () =>
  queryCollectionNavigation("blog"));

console.warn("page", page.value);
console.warn("navigation", navigation.value);

const breadcrumb = computed(() => {
  if (!navigation.value || !page.value)
    return [];

  return mapContentNavigation(
    findPageBreadcrumb(
      navigation.value,
      page.value.path,
      { indexAsChild: true },
    ),
  ).map(({ icon, ...link }) => link);
});

console.warn("breadcrumb", breadcrumb.value);
</script>

<template>
  <UPage>
    <UPageHeader v-bind="page">
      <template #headline>
        <UBreadcrumb :items="breadcrumb" />
      </template>
    </UPageHeader>
  </UPage>
</template>
