<script setup lang="ts">
import { ArrowUpRight, Check, FileText } from 'lucide-vue-next'
import { useDocStore } from '~/lib/docStore'

// One API card on the home page: official, the user's own or community
defineProps<{
  manifest: { url: string; name: string; description: string; icon?: string; author?: string };
}>()

const store = useDocStore()
const { openApi } = useDocNavigation()

function countOf(url: string) {
  const doc = store.docs[url]
  if (!doc) return undefined
  const contents = Object.values(doc)
    .filter(content => Object.keys(content.methods).length + Object.keys(content.classes).length > 0)
  return {
    groups: contents.length,
    methods: contents.reduce((sum, content) => sum + Object.keys(content.methods).length, 0),
  }
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`
</script>

<template>
  <button
      type="button"
      class="group relative flex flex-col gap-2 rounded-lg border bg-card p-4 text-left text-foreground transition-colors hover:bg-muted/50"
      :class="manifest.url === store.selectedDocUrl && 'border-primary'"
      @click="openApi(manifest.url)"
  >
    <Check v-if="manifest.url === store.selectedDocUrl" :size="14" class="absolute right-3 top-3 text-primary" />
    <ArrowUpRight v-else :size="14" class="absolute right-3 top-3 text-muted-foreground transition-colors group-hover:text-foreground" />
    <div class="flex items-center gap-2 pr-5">
      <Icon v-if="manifest.icon" :name="manifest.icon" :size="18" class="shrink-0" />
      <FileText v-else :size="18" class="shrink-0" />
      <!-- text-foreground: some themes (Plugify) mute card-foreground like descriptions -->
      <div class="truncate font-semibold text-foreground">{{ manifest.name }}</div>
    </div>
    <p v-if="manifest.author" class="-mt-1 text-xs text-muted-foreground">by {{ manifest.author }}</p>
    <p class="line-clamp-2 text-[13px] leading-snug text-muted-foreground [overflow-wrap:anywhere]">{{ manifest.description }}</p>
    <!-- Kept while the manifest is not loaded, empty, so every card has the same height -->
    <p class="mt-auto pt-2 text-xs text-muted-foreground">
      <template v-if="countOf(manifest.url)">
        {{ plural(countOf(manifest.url)!.groups, 'group') }} · {{ plural(countOf(manifest.url)!.methods, 'method') }}
      </template>
      <template v-else>&nbsp;</template>
    </p>
  </button>
</template>
