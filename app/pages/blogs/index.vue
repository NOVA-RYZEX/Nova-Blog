<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import type { BlogType } from "~/types";

defineOptions({
  name: "BlogArchiveIndexPage",
});

definePageMeta({
  layout: "blogs",
});

// Fetch raw blog items from content layer
const { getAllPosts } = useBlogContent();

const { data: archiveData, pending: isLoading, error: fetchError } = await useAsyncData("blog-archive-v7-data", async () => {
  const postsRes = await getAllPosts();
  return {
    allPosts: postsRes.data.value || [],
  };
});

const allPosts = computed<BlogType[]>(() => Array.isArray(archiveData.value?.allPosts) ? archiveData.value.allPosts : []);

// Standard Pagination Parameters
const currentPage = ref(1);
const itemsPerPage = 12;

const totalPages = computed(() => Math.ceil(allPosts.value.length / itemsPerPage) || 1);
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return allPosts.value.slice(start, start + itemsPerPage);
});

// Counter script to animate visible row parameters smoothly
const smoothCounter = ref(0);
function runCounterAnimationLoop(target: number) {
  let startTimestamp: number | null = null;
  const duration = 400;
  const startValue = smoothCounter.value;

  const animationStep = (timestamp: number) => {
    if (!startTimestamp)
      startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeExponential = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
    smoothCounter.value = Math.floor(easeExponential * (target - startValue) + startValue);
    if (progress < 1)
      window.requestAnimationFrame(animationStep);
    else smoothCounter.value = target;
  };
  window.requestAnimationFrame(animationStep);
}

watch(() => allPosts.value.length, newVal => runCounterAnimationLoop(newVal));
onMounted(() => setTimeout(runCounterAnimationLoop, 100, allPosts.value.length));
</script>

<template>
  <div class="h-screen flex flex-col space-y-4 overflow-hidden">
    <div class="h-auto shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5 px-6 bg-default border border-neutral-200/40 dark:border-neutral-800/60 rounded-xl mx-4 shadow-2xs">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <h1 class="font-display text-base font-black tracking-tight text-neutral-900 dark:text-white">
            The Articles <span class="font-serif italic font-medium text-primary-500">Archive</span>
          </h1>

          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/80 text-neutral-500 dark:text-neutral-400 tabular-nums shadow-2xs animate-fade-in">
            <span class="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_6px_var(--color-emerald-500)] animate-pulse" />
            {{ smoothCounter }} {{ smoothCounter === 1 ? 'Post' : 'Posts' }}
          </span>
        </div>

        <p class="font-sans text-xs font-medium text-neutral-400 dark:text-neutral-500 max-w-xl">
          Deep dive into the collection of articles, tutorials, and insights that have been published over time. Explore the knowledge shared by our community and discover valuable information on various topics.
        </p>
      </div>
    </div>

    <div class="flex-1 min-h-0 px-4 pb-6 overflow-y-auto custom-scrollbar flex flex-col" aria-live="polite">
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
        <USkeleton
          v-for="i in itemsPerPage"
          :key="`card-skeleton-${i}`"
          class="h-64 rounded-2xl bg-neutral-200/60 dark:bg-neutral-900/50 animate-pulse"
        />
      </div>

      <div v-else-if="fetchError" class="rounded-2xl border border-red-500/10 bg-red-500/5 p-8 text-center text-red-500 max-w-md mx-auto my-12">
        <UIcon name="i-lucide-shield-alert" class="size-8 mx-auto mb-2 text-red-400" />
        <p class="font-sans text-xs font-semibold tracking-wide">
          Could not parse content parameters. Please attempt a hard refresh.
        </p>
      </div>

      <div v-else-if="allPosts.length === 0" class="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 py-16 text-center text-neutral-400 dark:text-neutral-500 max-w-xl mx-auto my-12">
        <UIcon name="i-lucide-files" class="size-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
        <p class="font-sans text-sm font-medium">
          No blog publications were found inside the directory collection.
        </p>
      </div>

      <div v-else class="flex-1 flex flex-col">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 items-stretch pb-6">
          <BasePostCard
            v-for="post in paginatedPosts"
            :key="post.path"
            :post="post"
            class="w-full h-full transform hover:scale-[1.001] transition-transform duration-200"
          />
        </div>

        <footer v-if="totalPages > 1" class="mt-auto pt-4 pb-2 sticky bottom-0 bg-background flex items-center justify-between border-t border-neutral-200/40 dark:border-neutral-800/40 font-mono text-xs select-none z-10">
          <UButton
            :disabled="currentPage === 1"
            variant="subtle"
            color="neutral"
            icon="i-lucide-arrow-left"
            class="rounded-lg text-[10px] uppercase font-bold px-3 py-1.5 cursor-pointer"
            label="Previous"
            @click="currentPage--"
          />

          <div class="flex items-center gap-1.5 text-neutral-400 font-medium font-sans text-xs">
            <span>Page</span>
            <span class="font-bold text-neutral-900 dark:text-white px-2 py-0.5 rounded-md bg-default border border-neutral-200/60 dark:border-neutral-800/80 shadow-xs tabular-nums">
              {{ currentPage }}
            </span>
            <span>of</span>
            <span class="font-semibold text-neutral-500">{{ totalPages }}</span>
          </div>

          <UButton
            :disabled="currentPage === totalPages"
            variant="subtle"
            color="neutral"
            trailing-icon="i-lucide-arrow-right"
            class="rounded-lg text-[10px] uppercase font-bold px-3 py-1.5 cursor-pointer"
            label="Next"
            @click="currentPage++"
          />
        </footer>
      </div>
    </div>
  </div>
</template>
