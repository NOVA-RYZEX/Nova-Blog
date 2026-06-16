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
const itemsPerPage = 6;

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
  <div class="space-y-4">
    <div class="h-(--ui-header-height) shrink-0 flex items-center justify-between px-6 bg-default border border-neutral-200/40 dark:border-neutral-800/60 rounded-xl mx-4 shadow-2xs">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 font-sans text-xs text-neutral-400">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Total Articles: <strong class="text-neutral-900 dark:text-white tabular-nums font-bold">{{ smoothCounter }}</strong></span>
        </div>
      </div>

      <h1 class="font-display text-sm font-extrabold tracking-tight text-neutral-900 dark:text-white">
        The Articles <span class="font-serif italic font-medium text-primary-500">
          Archive
        </span>
      </h1>
    </div>

    <div class="px-4 pb-6 overflow-y-auto custom-scrollbar" aria-live="polite">
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <USkeleton
          v-for="i in itemsPerPage"
          :key="`card-skeleton-${i}`"
          class="h-64 rounded-2xl bg-neutral-200/60 dark:bg-neutral-900/50 animate-pulse"
        />
      </div>

      <div v-else-if="fetchError" class="rounded-2xl border border-red-500/10 bg-red-500/5 p-8 text-center text-red-500 max-w-md mx-auto my-12">
        <UIcon name="i-ph-shield-alert-duotone" class="size-8 mx-auto mb-2 text-red-400" />
        <p class="font-sans text-xs font-semibold tracking-wide">
          Could not parse content parameters. Please attempt a hard refresh.
        </p>
      </div>

      <div v-else-if="allPosts.length === 0" class="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 py-16 text-center text-neutral-400 dark:text-neutral-500 max-w-xl mx-auto my-12">
        <UIcon name="i-ph-files-light" class="size-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
        <p class="font-sans text-sm font-medium">
          No blog publications were found inside the directory collection.
        </p>
      </div>

      <div v-else class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          <BasePostCard
            v-for="post in paginatedPosts"
            :key="post.path"
            :post="post"
            class="w-full h-full transform hover:scale-[1.001] transition-transform duration-200"
          />
        </div>

        <footer v-if="totalPages > 1" class="pt-6 flex items-center justify-between border-t border-neutral-200/40 dark:border-neutral-800/40 font-mono text-xs select-none">
          <UButton
            :disabled="currentPage === 1"
            variant="subtle"
            color="neutral"
            icon="i-ph-arrow-left-light"
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
            trailing-icon="i-ph-arrow-right-light"
            class="rounded-lg text-[10px] uppercase font-bold px-3 py-1.5 cursor-pointer"
            label="Next"
            @click="currentPage++"
          />
        </footer>
      </div>
    </div>
  </div>
</template>
