<script setup lang="ts">
import { useDocStore } from '~/lib/docStore'
import SiteHeader from '~/components/layout/SiteHeader.vue'
import GroupNav from '~/components/layout/GroupNav.vue'
import Footer from '~/components/layout/Footer.vue'

// Like plugify.net docs: a top bar, a docs sidebar and the page next to it
const emit = defineEmits<{ selectGroup: [group: string] }>()
const store = useDocStore()
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <SiteHeader>
      <template #menu>
        <GroupNav @select="emit('selectGroup', $event)" />
      </template>
    </SiteHeader>
    <div class="flex flex-1">
      <!-- The home page is a full-width landing, like the plugify.net front page -->
      <aside
          v-if="store.selectedGroup"
          class="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r px-3 py-6 md:block"
      >
        <GroupNav @select="emit('selectGroup', $event)" />
      </aside>
      <main class="min-w-0 flex-1 px-4 py-6 md:px-8">
        <slot />
      </main>
    </div>
    <Footer class="border-t bg-card" />
  </div>
</template>
