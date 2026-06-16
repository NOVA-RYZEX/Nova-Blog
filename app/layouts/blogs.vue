<script setup lang="ts">
import { provide, ref } from "vue";

useAOS();

const sidebarOpen = ref(true);

provide("blogSidebarOpen", sidebarOpen);

const { open: openSearchPalette } = useContentSearch();
</script>

<template>
  <UApp>
    <UiAppHeader />

    <UMain>
      <div class="flex flex-1 min-h-screen relative w-full">
        <BlogFilterSidebar v-model:open="sidebarOpen">
          <template #footer>
            <div class="p-2 border-t border-neutral-200/40 dark:border-neutral-800/40 group-data-[collapsible=icon]:hidden w-full">
              <UButton
                icon="i-lucide-search"
                color="neutral"
                variant="subtle"
                block
                class="justify-between rounded-xl font-sans text-xs tracking-wide cursor-pointer text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                @click="openSearchPalette = true"
              >
                <span>Search Articles...</span>
                <UKbd
                  value="meta_k"
                  size="sm"
                  class="font-mono text-[9px] font-bold"
                />
              </UButton>
            </div>
          </template>
        </BlogFilterSidebar>

        <div class="flex-1 flex flex-col overflow-hidden lg:peer-data-[variant=floating]:my-4 peer-data-[variant=inset]:m-4 lg:peer-data-[variant=inset]:not-peer-data-[collapsible=offcanvas]:ms-0 peer-data-[variant=inset]:rounded-xl bg-transparent">
          <slot />
        </div>
      </div>
    </UMain>

    <!-- <UiAppFooter /> -->

    <BlogSearchModal />
  </UApp>
</template>
