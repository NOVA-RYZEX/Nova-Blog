<script lang="ts" setup>
import type { BlogType } from "~/types";

const { data: blog } = await useAsyncData("blog", () => {
  return queryCollection("blog")
    .where("published", "=", true)
    .where("draft", "=", false)
    .all();
});

const allBlogs = blog.value as unknown as BlogType[];

const logger = new Logger("HomePage");
logger.log("Fetched blog:", { blogMetaReadingTime: allBlogs?.[0]?.meta.readingTime });

definePageMeta({
  title: "Home",
  description: "Welcome to the home page of your Nuxt 3 application.",
});
</script>

<template>
  <UContainer>
    <h1 class="text-4xl font-bold mb-4">
      Welcome to Nuxt 3!
    </h1>
    <p class="text-lg text-gray-700">
      This is the home page of your Nuxt 3 application.
    </p>
  </UContainer>
</template>
