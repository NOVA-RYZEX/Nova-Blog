<script setup lang="ts">
import { siteConfig } from "~/app.meta";
import { useKeyboard } from "~/composables/use-keyboard";
import { useNavigate } from "~/composables/use-navigate";

const { navigate } = useNavigate();

const { addGlobalShortcut } = useKeyboard();

onMounted(() => {
  addGlobalShortcut("meta+g", () => {
    navigate({
      href: siteConfig.social.github,
      external: true,
      rel: "noopener noreferrer",
    });
  });
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
      :popper="{ placement: 'bottom' }"
    >
      <UButton
        color="primary"
        variant="ghost"
        :href="siteConfig.social.github"
        target="_blank"
        rel="noopener noreferrer"
        icon="i-line-md-github-loop"
        class="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        :aria-label="`Open
        ${siteConfig.name}
        on
        GitHub`"
      />
    </UTooltip>
  </div>
</template>
