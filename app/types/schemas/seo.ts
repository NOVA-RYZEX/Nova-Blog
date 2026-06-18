import z from "zod";

const urlOrPathSchema = z.string().refine(
  value => /^https?:\/\//.test(value) || value.startsWith("/"),
  {
    message: "Use an absolute URL or a site-relative path",
  },
);

export const seoSchema = z.object({
  title: z.string()
    // .max(60, "Keep it under 60 characters")
    .optional(),
  description: z.string()
    // .max(160, "Keep it under 160 characters")
    .optional(),
  keywords: z.array(z.string())
    .optional(),
  canonicalUrl: urlOrPathSchema
    .optional(),
  ogTitle: z.string()
    // .max(60, "Keep it under 60 characters")
    .optional(),
  ogDescription: z.string()
    // .max(160, "Keep it under 160 characters")
    .optional(),
  ogImage: urlOrPathSchema
    .optional(),
});

export type SEO = z.infer<typeof seoSchema>;
