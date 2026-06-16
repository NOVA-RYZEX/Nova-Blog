import { toValue } from "vue";

import type { MaybeRefOrGetter } from "vue";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

const logger = new Logger("use-blog-content composable");

function normalizeItem(item: any): { slug?: string; name?: string } {
  if (!item)
    return { slug: undefined, name: undefined };
  if (typeof item === "string")
    return { slug: item, name: item };
  return { slug: item.slug || item.name, name: item.name || item.slug };
}

function normalizeBlogPath(path: string) {
  const rawPath = path.trim();
  if (!rawPath)
    return "";
  return rawPath.startsWith("/") ? rawPath : `/blog/${rawPath}`;
}

export function useBlogContent() {
  /**
   * Internal mapper to enrich raw blog posts with relational collection data
   */
  const enrichPost = async (post: any): Promise<BlogType> => {
    if (!post)
      return post;

    // Resolve Author Relation
    if (post.author && typeof post.author === "string") {
      const authorData = await queryCollection("authors")
        .where("slug", "=", post.author)
        .first();
      if (authorData) {
        post.author = authorData as unknown as BlogAuthor;
      }
    }

    // Resolve Categories Relations
    if (Array.isArray(post.categories)) {
      post.categories = await Promise.all(
        post.categories.map(async (cat: any) => {
          if (typeof cat === "string") {
            const catData = await queryCollection("categories")
              .where("slug", "=", cat)
              .first();
            return catData || { slug: cat, name: cat };
          }
          return cat;
        }),
      );
    }

    // Resolve Tags Relations
    if (Array.isArray(post.tags)) {
      post.tags = await Promise.all(
        post.tags.map(async (tag: any) => {
          if (typeof tag === "string") {
            const tagData = await queryCollection("tags")
              .where("slug", "=", tag)
              .first();
            return tagData || { slug: tag, name: tag };
          }
          return tag;
        }),
      );
    }

    logger.debug("Enriched blog post:", { post });

    return post as BlogType;
  };

  const getAllPosts = () => {
    return useAsyncData("blog-all", async () => {
      const posts = (await queryCollection("blog")
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all()) as unknown as BlogType[];

      return Promise.all(posts.map(enrichPost));
    });
  };

  const getAllPostsForSitemap = () => {
    return queryCollection("blog").order("date", "DESC").all();
  };

  const getRecentPosts = (limit: MaybeRefOrGetter<number> = 10) => {
    return useAsyncData(
      () => `blog-recent-${toValue(limit)}`,
      async () => {
        const posts = (await queryCollection("blog")
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
        const normalizedPath = rawPath.startsWith("/") ? rawPath : `/blog/${rawPath}`;

        const byPath = await queryCollection("blog").path(normalizedPath).first();
        if (byPath) {
          const casted = byPath as unknown as BlogType;
          return await enrichPost(casted);
        }

        const slug = normalizedPath.split("/").filter(Boolean).at(-1) || rawPath;
        const posts = (await queryCollection("blog")
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
        const posts = (await queryCollection("blog")
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

      return queryCollectionItemSurroundings("blog", normalizedPath, {
        fields: ["title", "description", "path", "stem"],
      });
    });
  };

  const getPostsByCategory = (category: MaybeRefOrGetter<string>) => {
    return useAsyncData(
      () => `blog-category-${toValue(category)}`,
      async () => {
        const categorySlug = toValue(category).trim();
        const posts = (await queryCollection("blog")
          .where("published", "=", true)
          .where("draft", "=", false)
          .order("date", "DESC")
          .all()) as unknown as BlogType[];

        const filtered = posts.filter((post) => {
          return post.categories?.some((item) => {
            const n = normalizeItem(item);
            return n.slug === categorySlug || (n.name || "").toLowerCase() === categorySlug.toLowerCase();
          });
        });

        return Promise.all(filtered.map(enrichPost));
      },
    );
  };

  const getAllCategories = () => {
    return useAsyncData("blog-categories", async () => {
      const categoriesCollection = await (queryCollection as any)("categories").all();

      const posts = (await queryCollection("blog")
        .where("published", "=", true)
        .where("draft", "=", false)
        .select("categories")
        .all()) as unknown as Pick<BlogType, "categories">[];

      const counts = new Map<string, number>();
      for (const post of posts) {
        for (const category of post.categories || []) {
          const slug = typeof category === "string" ? category : category.slug;
          if (!slug)
            continue;
          counts.set(slug, (counts.get(slug) || 0) + 1);
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
          const slug = n.slug || n.name;
          if (!slug)
            continue;
          const current = uniqueCategories.get(slug);
          if (current) {
            uniqueCategories.set(slug, { ...current, count: current.count + 1 });
            continue;
          }
          uniqueCategories.set(slug, {
            name: n.name || slug,
            slug,
            description: typeof category === "object" ? category.description : undefined,
            count: 1,
          } as BlogCategory & { count: number });
        }
      }

      return Array.from(uniqueCategories.values()).sort((l, r) => l.name.localeCompare(r.name));
    });
  };

  const getCategoryDetails = (rawSlug: string) => {
    const cacheKey = rawSlug ? `blog-category-${rawSlug}` : "blog-category-empty";
    return useAsyncData(cacheKey, async () => {
      if (!rawSlug)
        return null;

      const categoryFromCollection = await (queryCollection as any)("categories").where("slug", "=", rawSlug).first();

      const posts = (await queryCollection("blog")
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all()) as unknown as BlogType[];

      const matchingPosts = posts.filter(post =>
        post.categories?.some((category) => {
          const n = normalizeItem(category);
          return n.slug === rawSlug || (n.name || "").toLowerCase() === rawSlug.toLowerCase();
        }),
      );

      if (matchingPosts.length === 0)
        return null;

      if (categoryFromCollection) {
        return { category: categoryFromCollection as BlogCategory, posts: matchingPosts };
      }

      const category = matchingPosts[0]?.categories?.find((item) => {
        const n = normalizeItem(item);
        return n.slug === rawSlug || (n.name || "").toLowerCase() === rawSlug.toLowerCase();
      });

      return { category: (category as any) as BlogCategory, posts: matchingPosts };
    });
  };

  const getPostsByTag = (tag: MaybeRefOrGetter<string>) => {
    return useAsyncData(
      () => `blog-tag-${toValue(tag)}`,
      async () => {
        const tagSlug = toValue(tag).trim();
        const posts = (await queryCollection("blog")
          .where("published", "=", true)
          .where("draft", "=", false)
          .order("date", "DESC")
          .all()) as unknown as BlogType[];

        const filtered = posts.filter(post =>
          post.tags?.some((item) => {
            const n = normalizeItem(item);
            return n.slug === tagSlug || (n.name || "").toLowerCase() === tagSlug.toLowerCase();
          }),
        );

        return Promise.all(filtered.map(enrichPost));
      },
    );
  };

  const getAllTags = () => {
    return useAsyncData("blog-tags", async () => {
      const tagsCollection = await (queryCollection as any)("tags").all();

      const posts = (await queryCollection("blog")
        .where("published", "=", true)
        .where("draft", "=", false)
        .select("tags")
        .all()) as unknown as Pick<BlogType, "tags">[];

      const counts = new Map<string, number>();
      for (const post of posts) {
        for (const tag of post.tags || []) {
          const slug = typeof tag === "string" ? tag : tag.slug;
          if (!slug)
            continue;
          counts.set(slug, (counts.get(slug) || 0) + 1);
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
          const slug = n.slug || n.name;
          if (!slug)
            continue;
          const current = uniqueTags.get(slug);
          if (current) {
            uniqueTags.set(slug, { ...current, count: current.count + 1 });
            continue;
          }
          uniqueTags.set(slug, {
            name: n.name || slug,
            slug,
            description: typeof tag === "object" ? tag.description : undefined,
            count: 1,
          } as BlogTag & { count: number });
        }
      }

      return Array.from(uniqueTags.values()).sort((l, r) => l.name.localeCompare(r.name));
    });
  };

  const getTagDetails = (rawSlug: string) => {
    const cacheKey = rawSlug ? `blog-tag-${rawSlug}` : "blog-tag-empty";
    return useAsyncData(cacheKey, async () => {
      if (!rawSlug)
        return null;
      const tagFromCollection = await (queryCollection as any)("tags").where("slug", "=", rawSlug).first();

      const posts = (await queryCollection("blog")
        .where("published", "=", true)
        .where("draft", "=", false)
        .order("date", "DESC")
        .all()) as unknown as BlogType[];

      const matchingPosts = posts.filter(post =>
        post.tags?.some((tag) => {
          const n = normalizeItem(tag);
          return n.slug === rawSlug || (n.name || "").toLowerCase() === rawSlug.toLowerCase();
        }),
      );

      if (matchingPosts.length === 0)
        return null;

      if (tagFromCollection) {
        return { tag: tagFromCollection as BlogTag, posts: matchingPosts };
      }

      const tag = matchingPosts[0]?.tags?.find((item) => {
        const n = normalizeItem(item);
        return n.slug === rawSlug || (n.name || "").toLowerCase() === rawSlug.toLowerCase();
      });

      return { tag: (tag as any) as BlogTag, posts: matchingPosts };
    });
  };

  const getAllAuthors = () => {
    return useAsyncData("blog-authors", async () => {
      const authorsCollection = await (queryCollection as any)("authors").all();

      const postsRaw = (await queryCollection("blog")
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
    const cacheKey = rawSlug ? `blog-author-${rawSlug}` : "blog-author-empty";
    return useAsyncData(cacheKey, async () => {
      if (!rawSlug)
        return null;
      const authorFromCollection = await (queryCollection as any)("authors").where("slug", "=", rawSlug).first();

      const allPosts = (await queryCollection("blog")
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

      if (authorFromCollection)
        return { author: authorFromCollection as BlogAuthor, posts };

      return { author: posts[0]?.author as BlogAuthor, posts };
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
