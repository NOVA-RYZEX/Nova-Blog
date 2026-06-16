<script setup lang="ts">
import { computed } from "vue";

import { siteConfig } from "~/app.meta";
import { useBlogContent } from "~/composables/use-blog-content";

import type { BlogType } from "~/types";

defineOptions({
  name: "BlogLandingPage",
});

useAOS();

const { getFeaturedPosts, getAllCategories, getAllAuthors, getAllTags, getAllPosts } = useBlogContent();

const { data: landingData, pending: isLoading, error: fetchError } = await useAsyncData("blog-landing-content", async () => {
  const [featured, categories, authors, tags, allPosts] = await Promise.all([
    getFeaturedPosts(5),
    getAllCategories(),
    getAllAuthors(),
    getAllTags(),
    getAllPosts(),
  ]);

  return {
    featured: featured.data.value,
    categories: categories.data.value,
    authors: authors.data.value,
    tags: tags.data?.value || tags.data?.value || [],
    allPosts: allPosts.data.value,
  };
});

const featuredPosts = computed<BlogType[]>(() => Array.isArray(landingData.value?.featured) ? landingData.value.featured : []);

const heroPost = computed<BlogType | null>(() => featuredPosts.value[0] || null);
const secondaryPost = computed<BlogType | null>(() => featuredPosts.value[1] || null);

const categories = computed(() => Array.isArray(landingData.value?.categories) ? landingData.value.categories : []);
const authors = computed(() => Array.isArray(landingData.value?.authors) ? landingData.value.authors : []);
const tags = computed(() => Array.isArray(landingData.value?.tags) ? landingData.value.tags : []);
const allPosts = computed<BlogType[]>(() => Array.isArray(landingData.value?.allPosts) ? landingData.value.allPosts : []);

useSeoMeta({
  title: `${siteConfig.name} | Insights & Editorial`,
  description: siteConfig.description,
  ogTitle: `${siteConfig.name} | Insights & Editorial`,
  ogDescription: siteConfig.description,
});

const portals = computed(() => [
  { to: "/blog", icon: "i-ph-archive-box-duotone", title: "Archive", badge: `${allPosts.value.length}`, text: "Browse our complete index." },
  { to: "/blog", icon: "i-ph-tag-duotone", title: "Tags", badge: `${tags.value.length}`, text: "Isolate precise technical keywords swiftly." },
  { to: "/categories", icon: "i-ph-squares-four-duotone", title: "Categories", badge: `${categories.value.length}`, text: "Jump into modular architectures." },
  { to: "/authors", icon: "i-ph-users-three-duotone", title: "Authors", badge: `${authors.value.length}`, text: "Meet the engineering minds behind updates." },
]);
</script>

<template>
  <UContainer class="max-w-7xl space-y-8 py-6 transition-all duration-300">
    <!-- hero section -->
    <section
      aria-labelledby="landing-page-hero"
      class="p-6sm:p-8"
    >
      <div class="w-full transition-all duration-300">
        <div class="max-w-3xl space-y-3.5">
          <div class="inline-flex items-center gap-1.5 text-primary-500 dark:text-primary-400">
            <UIcon name="i-ph-sparkle-fill" class="h-3 w-3" />
            <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
              Curated Posts & Insights
            </span>
          </div>

          <div class="space-y-2">
            <h1 id="featured-heading" class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
              Featured <span class="bg-linear-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">Publications</span> & Operational Architecture Insights
            </h1>

            <p class="max-w-2xl text-xs sm:text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Deep-dives into systems engineering, modular front-end architecture performance metrics, and modern technical insights compiled by our core engineering workspace teams.
            </p>
          </div>

          <div class="pt-1 flex flex-wrap items-center gap-3">
            <NuxtLink
              to="/blog"
              class="group inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 px-4 py-2 text-xs font-semibold tracking-wide text-white dark:text-neutral-950 transition-all hover:-translate-y-0.5"
            >
              View All Updates
              <UIcon
                name="i-ph-arrow-right-bold"
                class="h-3 w-3 text-neutral-400 dark:text-neutral-500 group-hover:text-white dark:group-hover:text-neutral-950 group-hover:translate-x-0.5 transition-all"
              />
            </NuxtLink>

            <NuxtLink
              to="#"
              class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200/60 hover:border-neutral-300 dark:border-neutral-800/60 dark:hover:border-neutral-700 bg-white/10 dark:bg-neutral-900/10 px-4 py-2 text-xs font-medium tracking-wide text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all"
            >
              <UIcon name="i-ph-squares-four-duotone" class="h-3.5 w-3.5 text-neutral-400" />
              Explore Categories
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- featured posts -->
    <section aria-labelledby="featured-heading" class="space-y-4 sm:space-y-5">
      <div v-if="isLoading" class="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 sm:gap-5">
        <USkeleton
          v-for="i in 4"
          :key="`skeleton-${i}`"
          class="h-72 rounded-xl bg-neutral-100 dark:bg-neutral-900/50"
        />
      </div>

      <div v-else-if="fetchError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-600 dark:text-red-400">
        <p class="font-mono text-xs tracking-tight">
          Failed to initialize operational content. Please refresh workspace.
        </p>
      </div>

      <div v-else-if="featuredPosts.length > 0" class="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 sm:gap-5 items-stretch">
        <div v-if="heroPost" class="col-span-1 [@media(min-width:580px)]:col-span-2 [@media(min-width:1120px)]:col-span-2 flex">
          <BasePostCard
            :post="heroPost"
            :meta="{
              class: 'hero-grid-layout-variant',
              ui: { title: 'text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-tight' },
            }"
            class="w-full"
          />
        </div>

        <div v-if="secondaryPost" class="col-span-1 flex">
          <BasePostCard
            :post="secondaryPost"
            class="w-full"
          />
        </div>

        <template v-if="featuredPosts.length > 2">
          <div
            v-for="post in featuredPosts.slice(2, 5)"
            :key="post.path"
            class="col-span-1 flex"
          >
            <BasePostCard
              :post="post"
              class="w-full"
            />
          </div>
        </template>
      </div>
    </section>

    <!-- Directory Navigation -->
    <section
      v-if="portals.length > 0"
      class="grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]"
      aria-label="Directory Navigation"
    >
      <BasePortalNavigationCard
        v-for="(portal, idx) in portals"
        :id="`portal-track-${idx}`"
        :key="idx"
        :to="portal.to"
        :icon="portal.icon"
        :title="portal.title"
        :badge="portal.badge"
        :text="portal.text"
      />
    </section>
  </UContainer>
</template>
