<script setup lang="ts">
import { createError, useRoute, useSeoMeta } from "#app";
import { computed } from "vue";

import type { BlogType } from "~/types";

defineOptions({
  name: "BlogPostPage",
});

const route = useRoute();
const { getAllPosts, getPost, getSurroundingPosts } = useBlogContent();

useAOS();

type TaxonomyItem = {
  slug?: string;
  name?: string;
  description?: string;
};

type TocLink = {
  id: string;
  depth: number;
  text: string;
  children: TocLink[];
};

type SurroundingPost = Pick<BlogType, "description" | "path" | "title">;

const slugPath = computed(() => {
  const slugParam = route.params.slug;
  return Array.isArray(slugParam) ? slugParam.join("/") : slugParam ?? "";
});

const { data: post, pending, error } = await getPost(slugPath);
const { data: allPosts } = await getAllPosts();

if (!pending.value && !post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Blog post not found",
    fatal: true,
  });
}

function formatTaxonomyItem(item?: string | TaxonomyItem | null) {
  if (!item)
    return null;
  if (typeof item === "string") {
    return {
      slug: item,
      name: item,
      description: undefined,
    };
  }

  return {
    slug: item.slug || item.name,
    name: item.name || item.slug || "",
    description: item.description,
  };
}

function toTaxonomyLink(basePath: string, item?: string | TaxonomyItem | null) {
  const normalized = formatTaxonomyItem(item);
  if (!normalized?.slug)
    return null;

  return {
    ...normalized,
    to: `${basePath}/${normalized.slug}`,
  };
}

const formattedDate = computed(() => {
  if (!post.value?.date)
    return "";
  return new Date(post.value.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const tocLinks = computed<TocLink[]>(() => {
  return (post.value?.body?.toc?.links || []) as TocLink[];
});

const hasToc = computed(() => tocLinks.value.length > 0);

const { data: surroundingPosts } = await getSurroundingPosts(() => post.value?.path || slugPath.value);

const articleCategories = computed(() =>
  (post.value?.categories || [])
    .map(item => toTaxonomyLink("/categories", item))
    .filter((item): item is NonNullable<ReturnType<typeof toTaxonomyLink>> => Boolean(item)),
);

const articleTags = computed(() =>
  (post.value?.tags || [])
    .map(item => toTaxonomyLink("/tags", item))
    .filter((item): item is NonNullable<ReturnType<typeof toTaxonomyLink>> => Boolean(item)),
);

const authorLink = computed(() => {
  const author = post.value?.author;
  if (!author || typeof author === "string")
    return null;
  if (!author.slug)
    return null;

  return {
    name: author.name,
    title: author.title,
    avatar: author.avatar,
    to: `/authors/${author.slug}`,
  };
});

const surrounding = computed(() => {
  const postsList = (surroundingPosts.value || []) as SurroundingPost[];
  const previous = postsList[0] || null;
  const next = postsList[1] || null;

  return { previous, next };
});

const contentSurround = computed(() => {
  return [surrounding.value.previous, surrounding.value.next].filter((item): item is SurroundingPost => Boolean(item));
});

const relatedPosts = computed(() => {
  const current = post.value;
  const postsList = (allPosts.value || []) as BlogType[];
  if (!current)
    return [];

  const currentTags = new Set(
    (current.tags || [])
      .map(item => formatTaxonomyItem(item)?.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );
  const currentCategories = new Set(
    (current.categories || [])
      .map(item => formatTaxonomyItem(item)?.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );
  const currentAuthorSlug = typeof current.author === "string" ? current.author : current.author?.slug;

  return postsList
    .filter(candidate => candidate.path !== current.path)
    .map((candidate) => {
      const candidateTags = (candidate.tags || [])
        .map(item => formatTaxonomyItem(item)?.slug)
        .filter((slug): slug is string => Boolean(slug));
      const candidateCategories = (candidate.categories || [])
        .map(item => formatTaxonomyItem(item)?.slug)
        .filter((slug): slug is string => Boolean(slug));
      const candidateAuthorSlug = typeof candidate.author === "string" ? candidate.author : candidate.author?.slug;

      let score = 0;

      for (const tag of candidateTags) {
        if (currentTags.has(tag))
          score += 3;
      }

      for (const category of candidateCategories) {
        if (currentCategories.has(category))
          score += 2;
      }

      if (currentAuthorSlug && candidateAuthorSlug === currentAuthorSlug) {
        score += 1;
      }

      return { candidate, score };
    })
    .filter(item => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score)
        return right.score - left.score;
      const leftDate = left.candidate.date ? new Date(left.candidate.date).getTime() : 0;
      const rightDate = right.candidate.date ? new Date(right.candidate.date).getTime() : 0;
      return rightDate - leftDate;
    })
    .slice(0, 3)
    .map(item => item.candidate);
});

useSeoMeta({
  title: () => `${post.value?.title || "Loading..."} | Editorial`,
  description: () => post.value?.description,
  ogTitle: () => post.value?.title,
  ogDescription: () => post.value?.description,
  ogImage: () => post.value?.coverImage?.src,
  twitterCard: "summary_large_image",
});
const { scrollProgress } = useReadingProgress();
</script>

<template>
  <UContainer>
    <div
      class="fixed top-0 left-0 h-1 bg-linear-to-r from-primary-500 via-sky-400 to-indigo-600 z-50 transition-all duration-75 ease-out"
      :style="{ width: `${scrollProgress}%` }"
    />

    <UPage>
      <UPageHeader
        v-if="pending || post"
        :headline="articleCategories[0]?.name || 'Blog post'"
        :title="post?.title || 'Loading article'"
        :description="post?.description"
        class="mt-2"
      >
        <template #default>
          <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <NuxtLink
              v-if="authorLink"
              :to="authorLink.to"
              class="group flex items-center gap-3 rounded-2xl border border-transparent px-2 py-1.5 transition-colors hover:border-slate-200/70 hover:bg-slate-50/70 dark:hover:border-slate-800/70 dark:hover:bg-slate-900/40"
            >
              <UAvatar
                v-if="authorLink.avatar"
                :src="authorLink.avatar.src"
                :alt="authorLink.name"
                size="sm"
              />

              <div class="leading-tight">
                <div class="font-semibold text-slate-900 dark:text-white">
                  {{ authorLink.name }}
                </div>
                <div v-if="authorLink.title" class="text-xs">
                  {{ authorLink.title }}
                </div>
              </div>
            </NuxtLink>

            <div v-if="post?.date" class="font-mono text-xs uppercase tracking-[0.2em]">
              {{ formattedDate }}
            </div>

            <!-- reading time -->

            <div v-if="post?.meta?.readingTime" class="font-mono text-xs">
              {{ post.meta.readingTime.text }} min read
            </div>

            <div v-if="articleCategories.length > 0" class="flex flex-wrap items-center gap-2">
              <NuxtLink
                v-for="category in articleCategories"
                :key="category.slug"
                :to="category.to"
                class="inline-flex"
              >
                <UBadge
                  variant="subtle"
                  color="primary"
                  class="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/30"
                >
                  {{ category.name }}
                </UBadge>
              </NuxtLink>
            </div>
          </div>
        </template>
      </UPageHeader>

      <template v-if="hasToc" #right>
        <UContentToc
          :links="tocLinks"
          title="Table of contents"
          highlight
          highlight-color="primary"
          highlight-variant="circuit"
        />
      </template>

      <UPageBody>
        <div v-if="pending" class="space-y-6">
          <USkeleton class="h-6 w-24 rounded-md" />
          <USkeleton class="h-12 w-3/4 rounded-xl" />
          <div class="flex items-center gap-3">
            <USkeleton class="h-10 w-10 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-20" />
            </div>
          </div>
          <USkeleton class="mt-8 h-100 w-full rounded-2xl" />
        </div>

        <div v-else-if="error" class="py-16 text-center">
          <UIcon name="i-lucide-alert-circle" class="mx-auto mb-4 h-12 w-12 text-red-500 opacity-80" />
          <p class="font-mono text-red-500">
            [ERR] Failed to load the article.
          </p>
        </div>

        <article
          v-else-if="post"
          data-aos="fade-up"
          data-aos-duration="600"
          class="space-y-10"
        >
          <div
            v-if="post.coverImage"
            data-aos="zoom-in"
            data-aos-delay="150"
          >
            <img
              :src="post.coverImage.src"
              :alt="post.coverImage.alt || post.title"
              class="aspect-video w-full rounded-3xl border border-slate-200/70 object-cover shadow-sm dark:border-slate-800/70"
            >
            <p v-if="post.coverImage.caption" class="mt-3 text-center text-xs italic text-slate-400 dark:text-slate-500">
              {{ post.coverImage.caption }}
            </p>
          </div>

          <article class="prose prose-slate max-w-none prose-headings:scroll-mt-28 prose-a:text-primary-600 hover:prose-a:text-primary-700 prose-img:rounded-xl dark:prose-invert">
            <ContentRenderer v-if="post.path" :value="post" />
            <div v-else-if="'content' in post" v-html="post.content" />
          </article>

          <section v-if="Array.isArray(post.gallery) && post.gallery.length > 0" class="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 space-y-4">
            <h3 class="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <UIcon name="i-lucide-images" class="text-primary-500 h-4 w-4" />
              Gallery
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="(img, idx) in post.gallery"
                :key="`gallery-node-${idx}`"
                class="overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/50 flex flex-col justify-between"
              >
                <NuxtImg
                  :src="img.src"
                  :alt="img.alt || 'Gallery diagram element description'"
                  class="w-full object-cover aspect-video transition-transform duration-300 hover:scale-[1.02]"
                />
                <div v-if="img.caption" class="p-3 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] font-mono text-slate-400 leading-snug">
                  {{ img.caption }}
                </div>
              </div>
            </div>
          </section>

          <section
            v-if="articleTags.length > 0"
            class="mt-10 rounded-3xl border border-slate-200/70 p-6 dark:border-slate-800/70"
          >
            <div class="mb-4 flex items-center justify-between gap-4">
              <p class="font-mono text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                Tags :: {{ articleTags.length }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <NuxtLink
                v-for="tag in articleTags"
                :key="tag.slug"
                :to="tag.to"
                class="inline-flex"
              >
                <UBadge
                  variant="subtle"
                  color="info"
                  class="rounded-full bg-white px-3 py-1 font-mono text-xs lowercase transition-colors hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-800/60"
                >
                  #{{ tag.name }}
                </UBadge>
              </NuxtLink>
            </div>
          </section>

          <section class="space-y-8 border-t border-slate-200/60 dark:border-slate-800/50 pt-10 mt-10">
            <div v-if="relatedPosts.length > 0" class="space-y-4">
              <div>
                <p class="font-mono text-[10px] font-bold uppercase tracking-widest text-primary-500">
                  More to explore
                </p>
                <h2 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Related posts
                </h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BasePostCard
                  v-for="relatedPost in relatedPosts"
                  :key="relatedPost.path"
                  :post="relatedPost"
                />
              </div>
            </div>

            <section v-if="contentSurround.length > 0" class="space-y-4 border-t border-slate-200/70 pt-8 dark:border-slate-800/70">
              <div>
                <p class="font-mono text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                  Surrounding posts
                </p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                  Continue reading
                </h2>
              </div>

              <USeparator />

              <UContentSurround
                :surround="contentSurround"
                prev-icon="i-line-md-arrow-left"
                next-icon="i-line-md-arrow-right"
              />
            </section>
          </section>
        </article>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
