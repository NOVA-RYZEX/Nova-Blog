import z from "zod";

import { socialLinkSchema } from "./social-links";

const avatarSchema = z.object({
  src: z.string()
    .url()
    .or(z.string().regex(/^\/.*/, "Avatar src must be a valid URL or a relative path starting with '/'")),
  alt: z.string().optional(),
});

export const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can include hyphens"),
  avatar: avatarSchema
    .optional(),
  description: z.string()
    // .max(160, "Keep it under 160 characters")
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
  extension: z.string(),
  stem: z.string(),
  meta: z.record(z.string(), z.any()),
  // __hash__: z.string(),
});

export type BlogAuthor = z.infer<typeof authorSchema>;

const _exampleAuthor = {
  id: "authors/authors/gideon-yebei.yml",
  title: "Software Engineer",
  avatar: {
    src: "/blogs/authors/gideon-yebei/avatar.jpg",
    alt: "Gideon Yebei's profile picture",
  },
  description: "Gideon is a software engineer with a passion for building scalable web applications. With over 5 years of experience in the industry, he has worked on various projects ranging from startups to large enterprises. Gideon specializes in full-stack development and is proficient in technologies such as JavaScript, React, Node.js, and Python. In his free time, he enjoys contributing to open-source projects and exploring new technologies.",
  email: "yebei@nodewave.net",
  extension: "yml",
  meta: {},
  name: "Gideon Yebei",
  slug: "gideon-yebei",
  socialLinks: [[Object], [Object], [Object]],
  stem: "authors/gideon-yebei",
  website: "https://yebei-gideon.github.io",
  __hash__: "gb7eeTBREBdeqPM6LNshd8OEsWRhnaWh3Dozq-1IpKc",
};
