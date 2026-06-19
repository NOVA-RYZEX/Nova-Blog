import z from "zod";

const urlOrPathSchema = z.string().refine(
  value => /^https?:\/\//.test(value) || value.startsWith("/"),
  {
    message: "Must explicitly provide an absolute remote URL or a site-relative route string starting with '/'",
  },
);

export const seoSchema = z.object({
  title: z.string()
    .max(60, "Search Engines truncate header titles exceeding 60 characters")
    .optional(),
  description: z.string()
    .max(160, "Meta snippets must sit under 160 characters to optimize visual display consistency")
    .optional(),
  keywords: z.array(z.string())
    .optional()
    .default([]),
  canonicalUrl: urlOrPathSchema
    .optional()
    .describe("Definitive primary source URL mapping to combat duplicate page authority penalties"),
  ogTitle: z.string()
    .max(60, "Social networks cap structural headline displays around 60 characters")
    .optional(),
  ogDescription: z.string()
    .max(160, "Social post descriptions look best when kept under 160 characters")
    .optional(),
  ogImage: urlOrPathSchema
    .optional()
    .describe("Social banner image asset path matching a 1200x630 aspect ratio card layout"),
  noIndex: z.boolean()
    .default(false)
    .describe("Instruct crawl bots to skip indexing this route within search result indexing grids"),
});

export type SEO = z.infer<typeof seoSchema>;

const _exampleSEO = {
  title: "How to Make PowerShell Behave Like Bash/Zsh (2026 Guide)",
  description: "Step-by-step tutorial to configure pwsh with emacs keybindings, fish-style autocomplete, carapace subcommand popups, and fzf fuzzy history search.",
  keywords: [Array],
  canonicalUrl: "/blogs/powershell-bash",
};
