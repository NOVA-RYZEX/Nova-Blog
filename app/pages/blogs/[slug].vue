<script lang="ts" setup>
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

defineOptions({
  name: "BlogDetailPage",
});

definePageMeta({
  layout: "reading",
});

const route = useRoute();
const router = useRouter();
const { scrollProgress } = useReadingProgress();
const logger = new Logger("BlogSlugDetailPage component");
const { getPost, getSurroundingPosts } = useBlogContent();

const path = computed(() => toValue(route.fullPath));
logger.debug("Current route path:", { path });

// Fetch the blog post data based on the current route path
const { data: postData, pending: isLoading, error: postError } = await getPost(path);
const currentPost = computed(() => postData.value as BlogType);

logger.debug("Fetched blog post data:", {
  data: toValue(currentPost),
  pending: toValue(isLoading),
  error: toValue(postError),
});

// Extract Taxonomies & Meta safely
const postAuthor = computed(() => currentPost.value?.author as BlogAuthor);
const postTags = computed(() => currentPost.value?.tags as BlogTag[] || []);
const postCategories = computed(() => currentPost.value?.categories as BlogCategory[] || []);

// Fetch surrounding posts for navigation
const { data: surroundData, pending: isSurroundingLoading, error: surroundError } = await getSurroundingPosts(path);
const surroundingPosts = computed(() => surroundData.value || []);

logger.debug("Fetched surrounding posts data:", {
  data: toValue(surroundingPosts),
  pending: toValue(isSurroundingLoading),
  error: toValue(surroundError),
});

// Handle error redirect safely on the client-side
watch(postError, (newError) => {
  if (newError) {
    logger.error("Error fetching blog post data:", { error: newError });
    router.push({ name: "blogs" });
  }
}, { immediate: true });
</script>

<template>
  <UContainer>
    <div
      v-if="scrollProgress > 0"
      class="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary-500 via-sky-400 to-indigo-600 z-50 transition-all duration-75 ease-out"
      :style="{ width: `${scrollProgress}%` }"
    />

    <div v-if="postError" class="flex flex-col items-center justify-center py-12 gap-4">
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Error loading blog post. Redirecting you back...
      </p>
      <UButton
        label="Go back manually"
        to="/blogs"
        color="neutral"
        variant="subtle"
      />
    </div>

    <div v-else-if="isLoading" class="space-y-6 py-6">
      <USkeleton class="h-6 w-24 rounded-md" />
      <USkeleton class="h-12 w-3/4 rounded-xl" />
      <div class="flex items-center gap-3">
        <USkeleton class="h-10 w-10 rounded-full" />
        <div class="space-y-2">
          <USkeleton class="h-4 w-32" />
          <USkeleton class="h-3 w-20" />
        </div>
      </div>
      <USkeleton class="mt-8 h-96 w-full rounded-2xl" />
    </div>

    <UPage v-else-if="currentPost">
      <UPageHeader
        :title="currentPost.title"
        :description="currentPost.description"
        class="pb-6 mb-6 border-b border-neutral-200/40 dark:border-neutral-800/60"
      >
        <template #headline>
          <div class="flex flex-col gap-3 mb-2">
            <!-- Back navigation and meta stats bar -->
            <div class="flex items-center gap-2 text-xs font-mono text-neutral-400 select-none">
              <UButton
                icon="i-ph-arrow-left-light"
                color="neutral"
                variant="ghost"
                label="Back to workspace"
                class="p-0 text-xs font-mono tracking-wide text-neutral-400 hover:text-primary-500 cursor-pointer"
                to="/blogs"
              />
              <USeparator orientation="vertical" class="h-3 border-neutral-200/40 dark:border-neutral-800/60" />

              <UIcon name="i-lucide-calendar" class="size-3 text-neutral-400 dark:text-neutral-500" />
              <time v-if="currentPost.date" :datetime="String(currentPost.date)">
                {{ useDateFormat(currentPost.date, 'MMMM DD, YYYY').value }}
              </time>

              <template v-if="currentPost.meta?.readingTime">
                <USeparator orientation="vertical" class="h-3 border-neutral-200/40 dark:border-neutral-800/60" />
                <span class="font-mono text-xs text-neutral-400 select-none flex items-center gap-1">
                  <UIcon name="i-lucide-clock" class="size-3 text-neutral-400 dark:text-neutral-500" />
                  {{ currentPost.meta.readingTime.text }}
                </span>
              </template>
            </div>
          </div>
        </template>

        <div v-if="postAuthor" class="flex items-center gap-2 mt-2">
          <UAvatar
            :src="postAuthor.avatar?.src"
            :alt="postAuthor.avatar?.alt || postAuthor.name"
            size="sm"
            class="rounded-full border border-neutral-200/40 dark:border-neutral-800/60"
          />
          <span class="text-xs font-mono text-neutral-400 select-none">
            By
            <NuxtLink :to="postAuthor.stem" class="text-primary-500 hover:underline font-medium">
              {{ postAuthor.name }}
            </NuxtLink>
            <span v-if="postAuthor.title" class="text-neutral-400 dark:text-neutral-500"> — {{ postAuthor.title }} </span>
          </span>
        </div>
      </UPageHeader>

      <template v-if="currentPost.body?.toc?.links?.length">
        <UContentToc
          :links="currentPost.body.toc.links"
          title="Table of contents"
          highlight
          highlight-color="primary"
          highlight-variant="circuit"
        />
      </template>

      <UPageBody>
        <article class="prose dark:prose-invert max-w-none">
          <ContentRenderer :value="currentPost" />
        </article>
      </UPageBody>

      <div class="mt-10 pt-6 border-t border-neutral-200/40 dark:border-neutral-800/60 flex flex-col sm:flex-row gap-8 sm:gap-16">
        <!-- Category Block -->
        <div v-if="postCategories.length > 0" class="flex flex-col gap-2 min-w-[120px]">
          <div class="flex items-center gap-2 text-xs font-mono text-neutral-400 select-none">
            <UIcon name="i-lucide-folder" class="size-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>Categories</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="category in postCategories"
              :key="category.stem"
              :label="category.name"
              color="neutral"
              variant="subtle"
              size="xs"
              class="font-mono text-xs rounded-md"
              :to="category.stem"
            />
          </div>
        </div>

        <!-- Tags Block -->
        <div v-if="postTags.length > 0" class="flex flex-col gap-2">
          <div class="flex items-center gap-2 text-xs font-mono text-neutral-400 select-none">
            <UIcon name="i-lucide-tag" class="size-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>Tags</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="tag in postTags"
              :key="tag.stem"
              :label="`#${tag.name}`"
              color="neutral"
              variant="subtle"
              size="xs"
              class="font-mono text-xs rounded-md"
              :to="tag.stem"
            />
          </div>
        </div>
      </div>

      <template v-if="currentPost.anchors || surroundingPosts.length > 0">
        <USeparator class="my-8 border-neutral-200/40 dark:border-neutral-800/60" />

        <UPageAnchors
          v-if="currentPost.anchors"
          :links="currentPost.anchors"
        />

        <div v-if="isSurroundingLoading" class="mt-6 space-y-2">
          <USkeleton class="h-6 w-24 rounded-md" />
          <USkeleton class="h-12 w-full rounded-xl" />
        </div>
        <UContentSurround
          v-else-if="surroundingPosts.length > 0"
          :surround="surroundingPosts"
          class="mt-6"
        />
      </template>
    </UPage>
  </UContainer>
</template>
