import { defineCollection, defineContentConfig } from "@nuxt/content";

import { authorSchema } from "./app/types/schemas/author";
import { blogSchema } from "./app/types/schemas/blog";
import { categorySchema } from "./app/types/schemas/category";
import { tagSchema } from "./app/types/schemas/tag";

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: "page",
      source: "blogs/**/*.md",
      schema: blogSchema,
      indexes: [
        { columns: ["date"] },
        { columns: ["draft"] },
        { columns: ["published"] },
        { columns: ["featured"] },
        { columns: ["published", "date"] },
        { columns: ["draft", "featured"] },
      ],
    }),
    authors: defineCollection({
      type: "data",
      source: "authors/**/*.yml",
      schema: authorSchema,
    }),
    tags: defineCollection({
      type: "data",
      source: "tags/**/*.yml",
      schema: tagSchema,
    }),
    categories: defineCollection({
      type: "data",
      source: "categories/**/*.yml",
      schema: categorySchema,
    }),
  },
});
