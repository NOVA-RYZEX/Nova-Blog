import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string()
    .max(160, "Keep it under 160 characters")
    .optional(),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens"),
  extension: z.string(),
  stem: z.string(),
  meta: z.record(z.string(), z.any()),
  // __hash__: z.string(),
});

export type BlogCategory = z.infer<typeof categorySchema>;

const _exampleCategory = {
  id: "categories/categories/terminal-and-shells.yml",
  description: "Deep dives into shell configurations, command-line utilities, and productivity workflows.",
  extension: "yml",
  meta: {},
  name: "Terminal & Shells",
  slug: "terminal-and-shells",
  stem: "categories/terminal-and-shells",
  __hash__: "Z1jdE3p2FNdt9MmMMUX1uEj_VfFra5jqJFDeXnC22hQ",
};
