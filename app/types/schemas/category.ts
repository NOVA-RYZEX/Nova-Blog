import z from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Category title classification string cannot be empty"),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens"),
  description: z.string()
    .optional()
    .describe("type: text; Deep structural description outlining the thematic scope of this category module grouping"),
  icon: z.string()
    .default("i-heroicons-folder")
    .describe("Graphic token class for navigating index directories"),
  featured: z.boolean()
    .default(false)
    .describe("Display category card on primary hub navigation dashboards"),
  extension: z.string(),
  stem: z.string(),
  meta: z.record(z.string(), z.any()),
});

export type BlogCategory = z.infer<typeof categorySchema>;

const _exampleCategory = {
  id: "categories/categories/terminal-and-shells.yml",
  description: "Deep dives into shell configurations, command-line utilities, and productivity workflows.",
  extension: "yml",
  featured: false,
  icon: "i-heroicons-folder",
  meta: {},
  name: "Terminal and Shells",
  slug: "terminal-and-shells",
  stem: "categories/terminal-and-shells",
  __hash__: "WbdOyi_nFdzD0_Dsa6eD0zdgCyuat66iCYZyKSSJQ9g",
};
