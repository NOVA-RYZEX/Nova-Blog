import z from "zod";

export const tagSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Tag display label name string cannot be left blank"),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens"),
  description: z.string()
    .optional()
    .describe("type: text; Strategic contextual scope of what content files fall under this tag parameter mapping"),
  color: z.string()
    .regex(/^#(?:[0-9a-f]{3}){1,2}$/i, "Provide valid hex color parameters (e.g., #3b82f6)")
    .default("#64748b")
    .describe("Theme accent context hex mapping to stylize contextual tags inside frontend badge listings"),
  extension: z.string(),
  stem: z.string(),
  meta: z.record(z.string(), z.any()),
});

export type BlogTag = z.infer<typeof tagSchema>;

const _exampleTag = {
  id: "tags/tags/devops.yml",
  color: "#64748b",
  description: "DevOps practices, tools, and methodologies for software development and operations.",
  extension: "yml",
  meta: {},
  name: "DevOps",
  slug: "devops",
  stem: "tags/devops",
  __hash__: "1-Da4WdSwDQ_NYSx338cokaBVrLXmjnafRhC9i-MYsw",
};
