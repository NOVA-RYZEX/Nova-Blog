import z from "zod";

export const seoSchema = z.object({
  title: z.string()
    .max(60, "Keep it under 60 characters")
    .optional(),
  description: z.string()
    .max(160, "Keep it under 160 characters")
    .optional(),
  keywords: z.array(z.string())
    .optional(),
  canonicalUrl: z.string()
    .url()
    .optional(),
  ogTitle: z.string()
    .max(60, "Keep it under 60 characters")
    .optional(),
  ogDescription: z.string()
    .max(160, "Keep it under 160 characters")
    .optional(),
  ogImage: z.string()
    .url()
    .optional(),
});

export type SEO = z.infer<typeof seoSchema>;
