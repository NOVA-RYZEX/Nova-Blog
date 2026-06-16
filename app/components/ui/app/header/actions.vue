<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import { siteConfig } from "~/app.meta";
import { useKeyboard } from "~/composables/use-keyboard";
import { useNavigate } from "~/composables/use-navigate";

const { navigate } = useNavigate();
const { addGlobalShortcut, removeGlobalShortcut } = useKeyboard();

const githubAriaLabel = `Open ${siteConfig.name} on GitHub`;

onMounted(() => {
  addGlobalShortcut("meta+g", () => {
    navigate({
      href: siteConfig.social.github,
      external: true,
      rel: "noopener noreferrer",
    });
  });
});

onUnmounted(() => {
  if (typeof removeGlobalShortcut === "function") {
    removeGlobalShortcut("meta+g");
  }
});
</script>

<template>
  <div
    class="flex items-center gap-1.5"
    data-aos="fade-left"
    data-aos-duration="400"
    data-aos-easing="ease-out-quad"
    data-aos-anchor="body"
  >
    <UiAppThemeToggle />

    <UTooltip
      text="Open on GitHub"
      :kbds="['meta', 'G']"
      :popper="{ placement: 'bottom', strategy: 'fixed' }"
    >
      <UButton
        color="primary"
        variant="ghost"
        :href="siteConfig.social.github"
        target="_blank"
        rel="noopener noreferrer"
        icon="i-line-md-github-loop"
        class="rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.96]"
        :aria-label="githubAriaLabel"
      />
    </UTooltip>
  </div>
</template>
