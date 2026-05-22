import z from "zod";

import { socialLinkSchema } from "./social-links";

export const authorSchema = z.object({
  name: z.string(),
  avatar: z.string()
    .optional(),
  description: z.string()
    .max(160, "Keep it under 160 characters")
    .optional()
    .describe("A short bio of the author"),
  title: z.string()
    .optional(),
  email: z.string()
    .email()
    .optional(),
  website: z.string()
    .url()
    .optional(),
  socialLinks: z.array(socialLinkSchema)
    .optional(),

});

export type Author = z.infer<typeof authorSchema>;
