import { property } from "@nuxt/content";
import z from "zod";

export const mediaSchema = z.object({
  src: property(z.string()).editor({ input: "media" }).describe("Target URL or repository path map for public visibility loading routing assets"),
  alt: z.string()
    .default("Article informational descriptive illustration")
    .describe("Accessibility alternative placeholder text representing layout graphic context to screen readers"),
  caption: z.string()
    .optional()
    .describe("Editorial context string printed directly below content display elements"),
});

export type Media = z.infer<typeof mediaSchema>;

const _exampleMedia = {
  src: "/blogs/posts/powershell-bash/cover.png",
  alt: "Stylized terminal window showing predictive text and interactive completion menus",
  caption: "Transform your PowerShell experience with modern shell features.",
};
