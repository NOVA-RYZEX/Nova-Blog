import { z } from "zod";

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string()
    // .max(160, "Keep it under 160 characters")
    .optional(),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens"),
  extension: z.string(),
  stem: z.string(),
  meta: z.record(z.string(), z.any()),
  // __hash__: z.string(),
});

const _exampleTag = {
  id: "tags/tags/devops.yml",
  description: null,
  extension: "yml",
  meta: {},
  name: "DevOps",
  slug: "devops",
  stem: "tags/devops",
  __hash__: "LaEk_6Eq5eXhSjQdz1ZaCSIoIO_tWdyNRWz4IlaX9n4",
};

export type BlogTag = z.infer<typeof tagSchema>;
