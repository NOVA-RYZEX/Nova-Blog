import z from "zod";

import { authorSchema } from "./author";
import { mediaSchema } from "./media";
import { seoSchema } from "./seo";

const categorySchema = z.object({
  name: z.string(),
  description: z.string()
    .max(160, "Keep it under 160 characters")
    .optional(),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens")
    .optional(),
});

const tagSchema = z.object({
  name: z.string(),
  description: z.string()
    .max(160, "Keep it under 160 characters")
    .optional(),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens")
    .optional(),
});

export const blogSchema = z.object({
  // core fields
  title: z.string(),
  description: z.string()
    .max(160, "Keep it under 160 characters")
    .optional(),
  date: z.date(),
  updatedAt: z.date()
    .optional(),

  // publishing status
  draft: z.boolean()
    .default(true),
  published: z.boolean()
    .default(false),
  publishedAt: z.date()
    .optional(),
  featured: z.boolean()
    .default(false),

  // media fields
  coverImage: mediaSchema
    .optional(),
  gallery: mediaSchema
    .array()
    .optional(),

  // taxonomy fields
  tags: tagSchema
    .array()
    .optional()
    .default([{ name: "General" }]),
  categories: categorySchema
    .array()
    .optional()
    .default([{ name: "General" }]),

  // authorship
  author: authorSchema
    .default({
      name: "Admin",
    })
    .optional(),

  // seo overrides
  seo: seoSchema
    .optional(),
});

export type Blog = z.infer<typeof blogSchema>;
