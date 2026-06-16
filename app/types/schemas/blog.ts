import z from "zod";

import { authorSchema } from "./author";
import { categorySchema } from "./category";
import { mediaSchema } from "./media";
import { seoSchema } from "./seo";
import { tagSchema } from "./tag";

const slugValidator = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens");

export const blogSchema = z.object({
  // core fields
  title: z.string(),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens")
    .optional(),
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
  // Accept either embedded objects (legacy) or string slugs (preferred).
  tags: z.array(z.union([tagSchema, slugValidator]))
    .optional()
    .default(["general"]),
  categories: z.array(z.union([categorySchema, slugValidator]))
    .optional()
    .default(["general"]),

  // authorship
  // Allow either an embedded author object or an author slug string.
  author: z.union([authorSchema, slugValidator])
    .optional()
    .default("unknown-author"),

  // seo overrides
  seo: seoSchema
    .optional(),
});

export type Blog = z.infer<typeof blogSchema>;
