export default defineAppConfig({
  ui: {
    colors: {
      primary: "teal",
      secondary: "blue",
      success: "green",
      info: "sky",
      warning: "amber",
      error: "red",
      neutral: "zinc",
    },
    strategy: "override",

    button: {
      defaultVariants: {
        size: "md",
        color: "primary",
        variant: "solid",
      },
      slots: {
        base: "rounded-xl font-medium tracking-wide cursor-pointer active:scale-[0.98] inline-flex items-center justify-center",
      },
    },

    badge: {
      defaultVariants: {
        variant: "subtle",
        size: "md",
      },
      slots: {
        base: "font-mono rounded-md px-2 py-0.5 text-[10px]",
      },
    },

    input: {
      defaultVariants: {
        size: "md",
      },
      slots: {
        root: "transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500/50",
      },
    },

    avatar: {
      defaultVariants: {
        size: "md",
      },
      slots: {
        root: "rounded-xl ring-1 ring-neutral-200/60 dark:ring-neutral-800/60 object-cover",
      },
    },

    tooltip: {
      slots: {
        content: "delay-150 font-sans text-[11px] bg-neutral-900 dark:bg-neutral-800 shadow-md",
      },
    },

    navigationMenu: {
      slots: {
        root: "transition-all text-sm",
      },
    },

    card: {
      slots: {
        root: "rounded-2xl border border-neutral-200/50 dark:border-neutral-800/40 backdrop-blur-md shadow-xs hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 overflow-hidden",
        body: "p-5 sm:p-6 lg:p-8",
      },
    },

    formField: {
      slots: {
        container: "flex flex-col gap-1.5",
        help: "m-0 text-xs font-normal",
        label: "text-xs uppercase text-neutral-700 font-sans",
      },
    },

    link: {
      variants: {
        active: {
          false: "text-neutral-500 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200",
        },
      },
    },

    toaster: {
      slots: {
        viewport: "z-50 p-4 gap-3",
      },
    },

    icons: {
      loading: "i-lucide-loader-circle",
      search: "i-lucide-search",
      menu: "i-lucide-menu",
    },

    experimental: {
      componentDetection: true,
    },

    header: {
      slots: {
        root: "border-b border-neutral-200/40 dark:border-neutral-800/40 h-(--ui-header-height) sticky top-0 z-50 transition-all duration-300",
        container: "flex items-center justify-between gap-4 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        left: "lg:flex-1 flex items-center gap-3",
        center: "hidden lg:flex items-center gap-6 font-sans font-medium text-sm",
        right: "flex items-center justify-end lg:flex-1 gap-3.5",
        title: "shrink-0 font-display font-bold text-lg sm:text-xl text-neutral-900 dark:text-white flex items-center gap-2 tracking-tight transition-colors",
        toggle: "lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900",
        content: "lg:hidden",
        overlay: "lg:hidden bg-neutral-950/40 backdrop-blur-sm transition-all duration-300",
        header: "px-4 sm:px-6 h-(--ui-header-height) shrink-0 flex items-center justify-between gap-3 border-b border-neutral-200/40 dark:border-neutral-800/40",
        body: "p-6 overflow-y-auto space-y-6",
      },
      variants: {
        toggleSide: {
          left: { toggle: "-ms-1.5" },
          right: { toggle: "-me-1.5" },
        },
      },
    },
  },
});
