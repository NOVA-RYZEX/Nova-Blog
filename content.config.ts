import { defineCollection, defineContentConfig } from "@nuxt/content";

import { blogSchema } from "./app/types/schemas/blog";

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: "page",
      source: "blog/**/*.md",
      schema: blogSchema,
      // Define database indexes for query performance optimization
      indexes: [
        // Useful for sorting posts from newest to oldest
        { columns: ["date"] },

        // Useful for filtering out drafts globally
        { columns: ["draft"] },

        // Useful for filtering explicitly published posts
        { columns: ["published"] },

        // Useful for querying posts to show on the hero/home page
        { columns: ["featured"] },

        // Composite index: Optimized for the most common query
        // (fetching published posts ordered by date)
        { columns: ["published", "date"] },
      ],
    }),
  },
});
