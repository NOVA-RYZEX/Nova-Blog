import z from "zod";

export const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
});

export type SocialLink = z.infer<typeof socialLinkSchema>;

const _exampleSocialLink = {
  platform: "GitHub",
  url: "https://github.com/Yebei-Gideon",
};
