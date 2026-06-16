<script setup lang="ts">
import { siteConfig } from "~/app.meta";
import { navLinks, socialLinks } from "~/constants";

const currentYear = computed(() => new Date().getFullYear());

const { activeHoverText, clearDecryption, startDecryption } = useMatrixDecrypt();
</script>

<template>
  <footer
    class="relative w-full border-t border-neutral-200/50 dark:border-neutral-800/30 backdrop-blur-xl mt-24 overflow-hidden"
    aria-label="Global Application Footer"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-200/40 dark:border-neutral-800/20">
        <div class="md:col-span-5 flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <UiAppLogo />
          </div>
          <p
            class="font-sans text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Explore topics of interest by categories, tags, and authors. Stay updated with the latest posts and insights from our community.
          </p>
        </div>

        <div class="md:col-span-3 md:col-start-7 flex flex-col gap-3">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            Quick Links
          </p>
          <ul class="space-y-2">
            <li
              v-for="link in navLinks"
              :key="link.label"
              data-aos="fade-up"
              :data-aos-delay="150 + (navLinks.indexOf(link) * 50)"
            >
              <NuxtLink
                :to="link.to"
                class="group text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1.5"
                @mouseenter="startDecryption(`${link.label}`, `footer-${link.label}`)"
                @mouseleave="clearDecryption(`footer-${link.label}`)"
              >
                <span class="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-primary-500 transition-colors" />
                {{ activeHoverText[`footer-${link.label}`] || link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="md:col-span-3 flex flex-col gap-3">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            Connect With Us
          </p>
          <div
            v-for="link in socialLinks"
            :key="link.label"
            class="flex flex-wrap gap-2"
            data-aos="fade-up"
            :data-aos-delay="200 + (socialLinks.indexOf(link) * 50)"
          >
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              :href="link.to"
              target="_blank"
              :icon="link.icon"
              class="rounded-xl font-bold uppercase tracking-wider text-[10px]"
              :label="link.label"
            />
          </div>
        </div>
      </div>

      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
        <div class="flex items-center gap-2 order-2 sm:order-1">
          <span>&copy; {{ currentYear }} {{ siteConfig.name }}. All rights reserved.</span>
        </div>
      </div>
    </div>
  </footer>
</template>
