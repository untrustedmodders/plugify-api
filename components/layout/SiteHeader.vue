<script setup lang="ts">
import { ArrowUpRight, Menu } from 'lucide-vue-next'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { VisuallyHidden } from 'radix-vue'
import ManifestSwitcher from '~/components/layout/ManifestSwitcher.vue'
import SearchButton from '~/components/layout/SearchButton.vue'

const config = useConfig()
const menuOpen = ref(false)

// This site is the "Hub" entry of the plugify.net menu
const isCurrent = (to: string) => to === '/'
const isExternal = (to: string) => /^https?:\/\//.test(to)

// Close the mobile menu once something in it was picked
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-lg">
    <div class="flex h-14 items-center gap-2 px-4 md:px-6">
      <Sheet v-model:open="menuOpen">
        <SheetTrigger as-child>
          <Button variant="ghost" size="icon" class="-ml-2 md:hidden">
            <Menu :size="18" />
            <span class="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="flex w-72 flex-col gap-4 overflow-y-auto p-4">
          <VisuallyHidden as-child>
            <SheetTitle>Menu</SheetTitle>
          </VisuallyHidden>
          <NuxtLink to="/" class="flex items-center">
            <img :src="config.header.logo.light" alt="Plugify" class="h-7 dark:hidden" />
            <img :src="config.header.logo.dark" alt="Plugify" class="hidden h-7 dark:block" />
          </NuxtLink>
          <nav class="flex flex-col">
            <NuxtLink
                v-for="link in config.header.nav"
                :key="link.title"
                :to="link.to"
                :target="link.target"
                class="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm"
                :class="isCurrent(link.to) ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'"
            >
              {{ link.title }}
              <ArrowUpRight v-if="isExternal(link.to)" :size="12" class="text-muted-foreground" />
            </NuxtLink>
          </nav>
          <!-- Extra navigation of the current layout, e.g. the API groups -->
          <slot name="menu" />
        </SheetContent>
      </Sheet>

      <NuxtLink to="/" class="mr-2 flex shrink-0 items-center md:mr-6">
        <img :src="config.header.logo.light" alt="Plugify" class="h-7 dark:hidden" />
        <img :src="config.header.logo.dark" alt="Plugify" class="hidden h-7 dark:block" />
      </NuxtLink>

      <nav class="hidden items-center gap-1 md:flex">
        <NuxtLink
            v-for="link in config.header.nav"
            :key="link.title"
            :to="link.to"
            :target="link.target"
            class="flex items-start gap-0.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="isCurrent(link.to) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
        >
          {{ link.title }}
          <ArrowUpRight v-if="isExternal(link.to)" :size="10" class="mt-0.5" />
        </NuxtLink>
      </nav>

      <div class="flex flex-1 items-center justify-end gap-1 md:gap-2">
        <div class="max-sm:hidden">
          <ManifestSwitcher />
        </div>
        <SearchButton />
        <div class="flex">
          <div v-if="config.theme.customizable" class="max-sm:hidden">
            <ThemePopover />
          </div>
          <DarkModeToggle v-if="config.header.darkModeToggle" />
          <NuxtLink
              v-for="(link, i) in config.header.links"
              :key="i"
              :to="link?.to"
              :target="link?.target"
              class="max-sm:hidden"
          >
            <Button variant="ghost" size="icon">
              <Icon v-if="link?.icon" :name="link.icon" :size="18" />
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>
