import { property } from "@nuxt/content";
import z from "zod";

export const mediaSchema = z.object({
  src: property(z.string()).editor({ input: "media" }),
  alt: z.string().default("Article cover image"),
  caption: z.string().optional(),
});

export type Media = z.infer<typeof mediaSchema>;
