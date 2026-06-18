/* eslint-disable node/no-process-env */
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/content",
    "@nuxtjs/seo",
    "@comark/nuxt",
    "@nuxt/image",
    "@nuxt/scripts",
    "nuxt-aos",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxt/a11y",
    "@nuxtjs/device",
    "nuxt-ai-ready",
  ],

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      titleTemplate: "%s | NovaRyzex's Blog",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#2563eb" },
        { name: "msapplication-TileColor", content: "#2563eb" },
        {
          name: "msapplication-TileImage",
          content: "/web-app-manifest-192x192.png",
        },
        { name: "application-name", content: "NovaRyzex" },
        { name: "apple-mobile-web-app-title", content: "NovaRyzex" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/icon-16x16.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/icon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "96x96",
          href: "/favicon-96x96.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "192x192",
          href: "/icon-192x192.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "512x512",
          href: "/icon-512x512.png",
        },
        { rel: "manifest", href: "/manifest.json" },
      ],
    },
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
    layoutTransition: {
      name: "layout",
      mode: "out-in",
    },
  },

  css: ["~/assets/css/main.css"],

  router: {
    options: {
      scrollBehaviorType: "smooth",
    },
  },

  content: {
    database: {
      type: "postgres",
      url: import.meta.env.DATABASE_URL,
    },
    // database: {
    //   type: "sqlite",
    //   filename: "./contents.sqlite",
    // },
    experimental: {
      sqliteConnector: "native",
    },
    build: {
      markdown: {
        highlight: {
          theme: {
            default: "material-theme-darker",
            dark: "material-theme-lighter",
          },
          langs: [
            "c",
            "cpp",
            "java",
          ],
        },
        toc: {
          depth: 5,
          searchDepth: 5,
        },
        remarkPlugins: {
          "remark-reading-time": {},
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      // Defaults to 'log' if no env var is set
      logLevel: process.env.NUXT_LOG_LEVEL || "log",
    },
  },

  routeRules: {
    "/": { prerender: true },
  },

  compatibilityDate: "2025-01-15",

  // linkChecker: {
  //   enabled: true,
  //   failOnError: true,
  //   fetchRemoteUrls: true,
  //   strictNuxtContentPaths: true,
  //   showLiveInspections: true,
  //   debug: true,
  //   runOnBuild: true,
  //   fetchTimeout: 10000,
  //   report: {
  //     publish: true,
  //     html: true,
  //   },
  // },

  aiReady: {
    database: {
      type: "neon",
      url: process.env.DATABASE_URL,
    },
    autoI18n: true,
    cron: true,
    indexNow: true,
    runtimeSync: {
      ttl: 3600,
      batchSize: 20,
      pruneTtl: 0,
    },
  },

  aos: {
    disable: false,
    startEvent: "DOMContentLoaded",
    initClassName: "aos-init",
    animatedClassName: "aos-animate",
    useClassNames: false,
    disableMutationObserver: false,
    debounceDelay: 50,
    throttleDelay: 99,
    offset: 120,
    delay: 0,
    duration: 450,
    easing: "ease-out-cubic",
    once: false,
    mirror: false,
    anchorPlacement: "top-bottom",
  },

  eslint: {
    config: {
      standalone: false,
      stylistic: {
        semi: true,
        quotes: "double",
        indent: "tab",
        commaDangle: "always-multiline",
        braceStyle: "1tbs",
      },
    },
  },

  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
      subsets: ["latin"],
    },

    families: [
      { name: "Plus Jakarta Sans", weights: [400, 500, 600, 700] },
      { name: "Inter", weights: [400, 500, 600, 700] },

      { name: "Newsreader", weights: [400, 600, 700], styles: ["normal", "italic"] },
      { name: "Playfair Display", weights: [400, 700] },

      { name: "Lora", weights: [400, 500, 600] },
      { name: "EB Garamond", weights: [400, 500, 700] },

      { name: "JetBrains Mono", weights: [400, 500, 700] },
      { name: "IBM Plex Mono", weights: [400, 500] },
    ],

    processCSSVariables: true,
  },

  icon: {
    size: "1.2em",
    class: "icon",
    serverBundle: "local",
    fetchTimeout: 4000,
    clientBundle: {
      scan: true,
    },
  },

  image: {
    quality: 80,
    format: ["webp", "avif"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  ogImage: {
    enabled: true,
    componentDirs: ["components/OgImage"],
    security: {
      secret: process.env.NUXT_OG_IMAGE_SECRET,
    },
  },

  robots: {
    enabled: true,
    groups: [
      {
        userAgent: "*",
        allow: "/",
        contentUsage: {
          "bots": "y",
          "train-ai": "y",
          "ai-output": "y",
          "search": "y",
        },
        contentSignal: {
          "search": "yes",
          "ai-input": "yes",
          "ai-train": "yes",
        },
      },
    ],
  },

  sitemap: {
    autoI18n: true,
    zeroRuntime: true,
    discoverImages: true,
  },
});
