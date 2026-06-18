import { toValue } from "vue";

import type { MaybeRefOrGetter } from "vue";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

const logger = new Logger("use-blog-content composable");

function normalizeItem(item: any): { slug: string; name: string } {
  if (!item)
    return { slug: "", name: "" };
  if (typeof item === "string")
    return { slug: item, name: item };
  return { slug: item.slug || item.name || "", name: item.name || item.slug || "" };
}

function normalizeBlogPath(path: string) {
  const rawPath = path.trim();
  if (!rawPath)
    return "";
  return rawPath.startsWith("/") ? rawPath : `/blogs/${rawPath}`;
}

export function useBlogContent() {
  /**
   * Internal mapper to enrich raw blog posts with relational collection data
   */
  const enrichPost = async (post: any): Promise<BlogType> => {
    if (!post)
      return post;

    const tasks: Promise<void>[] = [];

    // Resolve Author Relation
    if (post.author && typeof post.author === "string") {
      tasks.push(
        queryCollection("authors")
          .where("slug", "=", post.author)
          .first()
          .then((authorData) => {
            if (authorData)
              post.author = authorData as unknown as BlogAuthor;
          }),
      );
    }

    // Resolve Categories Relations
    if (Array.isArray(post.categories)) {
      post.categories = await Promise.all(
        post.categories.map(async (cat: any) => {
          // Extract the slug whether 'cat' is a string or a partial object
          const slug = typeof cat === "string" ? cat : cat?.slug;

          if (slug) {
            const catData = await queryCollection("categories")
              .where("slug", "=", slug)
              .first();

            logger.log("Enriched category", { slug, catData });

            // If full collection item is found, return it
            if (catData)
              return catData;
          }

          // Fallback if not found in DB or slug is missing
          return typeof cat === "string" ? { slug: cat, name: cat } : cat;
        }),
      );
    }

    // Resolve Tags Relations (Apply same safety net to tags)
    if (Array.isArray(post.tags)) {
      post.tags = await Promise.all(
        post.tags.map(async (tag: any) => {
          const slug = typeof tag === "string" ? tag : tag?.slug;

          if (slug) {
            const tagData = await queryCollection("tags")
              .where("slug", "=", slug)
              .first();

            logger.log("Enriched tag", { slug, tagData });

            if (tagData)
              return tagData;
          }

          return typeof tag === "string" ? { slug: tag, name: tag } : tag;
        }),
      );
    }

    // Run lookups concurrently per-post
    await Promise.all(tasks);
    logger.debug("Enriched blog post:", { post: post.id });
    return post as BlogType;
  };

  const getAllPosts = () => {
    return useAsyncData("blog-all", async () => {
      const posts = (await queryCollection("blogs" as any)
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all()) as unknown as BlogType[];

      return Promise.all(posts.map(enrichPost));
    });
  };

  const getAllPostsForSitemap = () => {
    return queryCollection("blogs").order("date", "DESC").all();
  };

  const getRecentPosts = (limit: MaybeRefOrGetter<number> = 10) => {
    return useAsyncData(
      () => `blog-recent-${toValue(limit)}`,
      async () => {
        const posts = (await queryCollection("blogs")
          .where("published", "=", true)
          .order("date", "DESC")
          .limit(toValue(limit))
          .all()) as unknown as BlogType[];

        return Promise.all(posts.map(enrichPost));
      },
    );
  };

  const getPost = (path: MaybeRefOrGetter<string>) => {
    return useAsyncData(
      () => `blog-post-${toValue(path)}`,
      async () => {
        const rawPath = toValue(path).trim();
        const normalizedPath = rawPath.startsWith("/") ? rawPath : `/blogs/${rawPath}`;

        const byPath = await queryCollection("blogs").path(normalizedPath).first();
        if (byPath) {
          return await enrichPost(byPath as unknown as BlogType);
        }

        const slug = normalizedPath.split("/").filter(Boolean).at(-1) || rawPath;
        const posts = (await queryCollection("blogs")
          .where("published", "=", true)
          .where("draft", "=", false)
          .order("date", "DESC")
          .all()) as unknown as BlogType[];

        const found = posts.find(post => post.slug === slug || post.stem === slug || post.path.endsWith(`/${slug}`));
        if (!found)
          return null;
        return await enrichPost(found as BlogType);
      },
    );
  };

  const getFeaturedPosts = (limit: MaybeRefOrGetter<number> = 3) => {
    return useAsyncData(
      () => `blog-featured-${toValue(limit)}`,
      async () => {
        const posts = (await queryCollection("blogs")
          .where("published", "=", true)
          .where("featured", "=", true)
          .order("date", "DESC")
          .limit(toValue(limit))
          .all()) as unknown as BlogType[];

        return Promise.all(posts.map(enrichPost));
      },
    );
  };

  const getSurroundingPosts = (path: MaybeRefOrGetter<string>) => {
    return useAsyncData(() => `blog-surround-${toValue(path)}`, () => {
      const normalizedPath = normalizeBlogPath(toValue(path));
      if (!normalizedPath)
        return Promise.resolve([]);

      return queryCollectionItemSurroundings("blogs", normalizedPath, {
        fields: ["title", "description", "path", "stem"],
      });
    });
  };

  const getPostsByCategory = (category: MaybeRefOrGetter<string>) => {
    return useAsyncData(
      () => `blog-category-${toValue(category)}`,
      async () => {
        const categorySlug = toValue(category).trim();
        const posts = (await queryCollection("blogs")
          .where("published", "=", true)
          .where("draft", "=", false)
          .order("date", "DESC")
          .all()) as unknown as BlogType[];

        const filtered = posts.filter((post) => {
          return post.categories?.some((item) => {
            const n = normalizeItem(item);
            return n.slug === categorySlug || n.name.toLowerCase() === categorySlug.toLowerCase();
          });
        });

        return Promise.all(filtered.map(enrichPost));
      },
    );
  };

  const getAllCategories = () => {
    return useAsyncData("blog-categories", async () => {
      const categoriesCollection = await queryCollection("categories" as any).all();
      const posts = (await queryCollection("blogs")
        .where("published", "=", true)
        .where("draft", "=", false)
        .select("categories")
        .all()) as unknown as Pick<BlogType, "categories">[];

      const counts = new Map<string, number>();
      for (const post of posts) {
        for (const category of post.categories || []) {
          const n = normalizeItem(category);
          if (!n.slug)
            continue;
          counts.set(n.slug, (counts.get(n.slug) || 0) + 1);
        }
      }

      if (categoriesCollection && categoriesCollection.length > 0) {
        return (categoriesCollection as any[])
          .map(c => ({ ...c, count: counts.get(c.slug) || 0 }))
          .sort((a, b) => a.name.localeCompare(b.name));
      }

      const uniqueCategories = new Map<string, BlogCategory & { count: number }>();
      for (const post of posts) {
        for (const category of post.categories || []) {
          const n = normalizeItem(category);
          if (!n.slug)
            continue;
          const current = uniqueCategories.get(n.slug);
          if (current) {
            uniqueCategories.set(n.slug, { ...current, count: current.count + 1 });
            continue;
          }
          uniqueCategories.set(n.slug, {
            name: n.name,
            slug: n.slug,
            description: typeof category === "object" ? category.description : undefined,
            count: 1,
          } as BlogCategory & { count: number });
        }
      }

      return Array.from(uniqueCategories.values()).sort((l, r) => l.name.localeCompare(r.name));
    });
  };

  const getCategoryDetails = (rawSlug: string) => {
    const cacheKey = rawSlug ? `blog-category-detail-${rawSlug}` : "blog-category-empty";
    return useAsyncData(cacheKey, async () => {
      if (!rawSlug)
        return null;

      const categoryFromCollection = await queryCollection("categories" as any).where("slug", "=", rawSlug).first();
      const posts = (await queryCollection("blogs" as any)
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all()) as unknown as BlogType[];

      const matchingPosts = posts.filter(post =>
        post.categories?.some((category) => {
          const n = normalizeItem(category);
          return n.slug === rawSlug || n.name.toLowerCase() === rawSlug.toLowerCase();
        }),
      );

      if (matchingPosts.length === 0)
        return null;

      // FIX: Enriched the nested posts before returning them!
      const enrichedPosts = await Promise.all(matchingPosts.map(enrichPost));

      if (categoryFromCollection) {
        return { category: categoryFromCollection as BlogCategory, posts: enrichedPosts };
      }

      const fallbackCategory = normalizeItem(
        matchingPosts[0]?.categories?.find(item => normalizeItem(item).slug === rawSlug),
      );

      logger.debug("Category details - no direct collection match, using fallback from post data", { rawSlug, fallbackCategory });

      return {
        category: { slug: fallbackCategory.slug, name: fallbackCategory.name } as BlogCategory,
        posts: enrichedPosts,
      };
    });
  };

  const getPostsByTag = (tag: MaybeRefOrGetter<string>) => {
    return useAsyncData(
      () => `blog-tag-${toValue(tag)}`,
      async () => {
        const tagSlug = toValue(tag).trim();
        const posts = (await queryCollection("blogs")
          .where("published", "=", true)
          .where("draft", "=", false)
          .order("date", "DESC")
          .all()) as unknown as BlogType[];

        const filtered = posts.filter(post =>
          post.tags?.some((item) => {
            const n = normalizeItem(item);
            return n.slug === tagSlug || n.name.toLowerCase() === tagSlug.toLowerCase();
          }),
        );

        return Promise.all(filtered.map(enrichPost));
      },
    );
  };

  const getAllTags = () => {
    return useAsyncData("blog-tags", async () => {
      const tagsCollection = await queryCollection("tags").all();
      const posts = (await queryCollection("blogs")
        .where("published", "=", true)
        .where("draft", "=", false)
        .select("tags")
        .all()) as unknown as Pick<BlogType, "tags">[];

      const counts = new Map<string, number>();
      for (const post of posts) {
        for (const tag of post.tags || []) {
          const n = normalizeItem(tag);
          if (!n.slug)
            continue;
          counts.set(n.slug, (counts.get(n.slug) || 0) + 1);
        }
      }

      if (tagsCollection && tagsCollection.length > 0) {
        return (tagsCollection as any[])
          .map(t => ({ ...t, count: counts.get(t.slug) || 0 }))
          .sort((a, b) => a.name.localeCompare(b.name));
      }

      const uniqueTags = new Map<string, BlogTag & { count: number }>();
      for (const post of posts) {
        for (const tag of post.tags || []) {
          const n = normalizeItem(tag);
          if (!n.slug)
            continue;
          const current = uniqueTags.get(n.slug);
          if (current) {
            uniqueTags.set(n.slug, { ...current, count: current.count + 1 });
            continue;
          }
          uniqueTags.set(n.slug, {
            name: n.name,
            slug: n.slug,
            description: typeof tag === "object" ? tag.description : undefined,
            count: 1,
          } as BlogTag & { count: number });
        }
      }

      return Array.from(uniqueTags.values()).sort((l, r) => l.name.localeCompare(r.name));
    });
  };

  const getTagDetails = (rawSlug: string) => {
    const cacheKey = rawSlug ? `blog-tag-detail-${rawSlug}` : "blog-tag-empty";
    return useAsyncData(cacheKey, async () => {
      if (!rawSlug)
        return null;
      const tagFromCollection = await queryCollection("tags").where("slug", "=", rawSlug).first();

      const posts = (await queryCollection("blogs")
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all()) as unknown as BlogType[];

      const matchingPosts = posts.filter(post =>
        post.tags?.some((tag) => {
          const n = normalizeItem(tag);
          return n.slug === rawSlug || n.name.toLowerCase() === rawSlug.toLowerCase();
        }),
      );

      if (matchingPosts.length === 0)
        return null;

      // FIX: Enriched nested posts here too!
      const enrichedPosts = await Promise.all(matchingPosts.map(enrichPost));

      if (tagFromCollection) {
        return { tag: tagFromCollection as BlogTag, posts: enrichedPosts };
      }

      const fallbackTag = normalizeItem(
        matchingPosts[0]?.tags?.find(item => normalizeItem(item).slug === rawSlug),
      );

      logger.debug("Tag details - no direct collection match, using fallback from post data", { rawSlug, fallbackTag });

      return {
        tag: { slug: fallbackTag.slug, name: fallbackTag.name } as BlogTag,
        posts: enrichedPosts,
      };
    });
  };

  const getAllAuthors = () => {
    return useAsyncData("blog-authors", async () => {
      const authorsCollection = await queryCollection("authors").all();
      const postsRaw = (await queryCollection("blogs")
        .where("published", "=", true)
        .where("draft", "=", false)
        .select("author")
        .all()) as unknown as Pick<BlogType, "author">[];

      const counts = new Map<string, number>();
      for (const post of postsRaw) {
        if (!post.author)
          continue;
        const slug = typeof post.author === "string" ? post.author : post.author.slug;
        if (!slug)
          continue;
        counts.set(slug, (counts.get(slug) || 0) + 1);
      }

      if (authorsCollection && authorsCollection.length > 0) {
        return (authorsCollection as any[])
          .map(a => ({ ...a, count: counts.get(a.slug) || 0 }))
          .sort((x, y) => (x.name || "").localeCompare(y.name || ""));
      }

      const uniqueAuthorsMap = new Map<string, BlogAuthor>();
      for (const post of postsRaw) {
        if (post.author && typeof post.author !== "string" && post.author.slug) {
          uniqueAuthorsMap.set(post.author.slug, post.author as BlogAuthor);
        }
      }

      return Array.from(uniqueAuthorsMap.values());
    });
  };

  const getAuthorDetails = (rawSlug: string) => {
    const cacheKey = rawSlug ? `blog-author-detail-${rawSlug}` : "blog-author-empty";
    return useAsyncData(cacheKey, async () => {
      if (!rawSlug)
        return null;
      const authorFromCollection = await queryCollection("authors").where("slug", "=", rawSlug).first();

      const allPosts = (await queryCollection("blogs")
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all()) as unknown as BlogType[];

      const posts = allPosts.filter((p) => {
        if (!p.author)
          return false;
        if (typeof p.author === "string")
          return p.author === rawSlug;
        return p.author.slug === rawSlug;
      });

      if (posts.length === 0)
        return null;

      // FIX: Enriched matching posts before returning
      const enrichedPosts = await Promise.all(posts.map(enrichPost));

      if (authorFromCollection)
        return { author: authorFromCollection as BlogAuthor, posts: enrichedPosts };

      return { author: enrichedPosts[0]?.author as BlogAuthor, posts: enrichedPosts };
    });
  };

  return {
    getAllPosts,
    getAllPostsForSitemap,
    getRecentPosts,
    getPost,
    getFeaturedPosts,
    getSurroundingPosts,
    getPostsByCategory,
    getAllCategories,
    getCategoryDetails,
    getPostsByTag,
    getAllTags,
    getTagDetails,
    getAllAuthors,
    getAuthorDetails,
  };
}
