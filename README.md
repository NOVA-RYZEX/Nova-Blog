# Novaryzex

Novaryzex is the collaborative, Git-native blogging platform for the Novaryzex community.

It is designed so that blog posts are written as files, reviewed through pull requests, and published through the Git workflow. The repository is the source of truth, which means every article, author profile, guide, and reusable content block can be tracked, reviewed, and improved like code.

## Repository identity

- **Organization:** `novaryzex`
- **Repository name:** `Nova-Blog`
- **Primary description:** Git-native collaborative blogging platform built with Nuxt 4 and Nuxt Content.

## Goals

Novaryzex is built to:

- teach contributors how to collaborate with Git and pull requests
- keep content structured, consistent, and reviewable
- support Markdown and interactive content through Nuxt Content MDC
- provide a clean SEO-friendly public site
- maintain a modular codebase with clear separation of concerns
- make contribution easy for writers, developers, and editors

## Core principles

- **Git is the backend.** Content lives in the repository.
- **PRs are the publishing gate.** Nothing ships without review.
- **Content is structured.** Frontmatter and schemas are enforced.
- **Modularity first.** Blog content, UI, docs, and validation stay separate.
- **Accessibility and SEO matter.** Semantic markup, metadata, and readable content are required.
- **Docs are part of the product.** Contributors should be able to self-serve.

## Tech stack

- **Framework:** Nuxt 4
- **Content system:** Nuxt Content
- **Schema validation:** Zod
- **Deployment:** Vercel
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Testing:** Vitest, Playwright
- **Package manager:** Bun

## Content model

Blog content is stored as files inside the repository.

Typical content types:

- blog posts
- author profiles
- series pages
- static pages
- reusable content snippets

Typical formats:

- Markdown for articles and pages
- YAML for author metadata
- optional MDC components for interactive content blocks

## Writing workflow

1. Fork or branch from the repository.
2. Create or edit a content file.
3. Follow the writing and folder structure guides in `docs/`.
4. Open a pull request.
5. CI validates structure, formatting, and build integrity.
6. A maintainer reviews the content.
7. Merge to `main` to publish.

## Suggested folder layout

```txt
Nova-Blog/
├─ app/
├─ content/
├─ docs/
├─ layers/
├─ public/
├─ scripts/
├─ server/
├─ tests/
└─ .github/
```

## Documentation

- `CONTRIBUTING.md` — how to contribute
- `docs/writing-guide.md` — how to write posts
- `docs/folder-structure.md` — where files belong
- `docs/review-process.md` — how PR review works
- `docs/seo-guidelines.md` — content and metadata rules
- `docs/component-library.md` — approved components and usage

## Contributing

Read `CONTRIBUTING.md` before opening a pull request.

## License

Read [LICENCE](./LICENCE)
