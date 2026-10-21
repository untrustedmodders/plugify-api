<script setup lang="ts">
import { useDocStore, manifestTitle } from '~/lib/docStore'
import Spinner from '~/components/layout/Spinner.vue'

const emit = defineEmits<{ select: [group: string] }>()
const store = useDocStore()

// Groups worth listing: the ones with methods or classes, and their entry count
const groups = computed(() => Object.entries(store.selectedDoc || {})
  .filter(([, content]) => Object.keys(content.methods).length + Object.keys(content.classes).length > 0)
  .map(([name, content]) => ({
    name,
    count: Object.keys(content.methods).length + Object.keys(content.delegates).length
      + Object.keys(content.enumerators).length + Object.keys(content.classes).length,
  })))
</script>

<template>
  <div v-if="store.selectedDocUrl" class="flex flex-col gap-1">
    <NuxtLink to="/#/" class="truncate px-2 pb-1 text-sm font-semibold">
      {{ manifestTitle(store.selectedDocUrl) }}
    </NuxtLink>
    <Spinner v-if="store.isRefreshing[store.selectedDocUrl]" />
    <button
        v-for="group in groups"
        :key="group.name"
        type="button"
        class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors"
        :class="group.name === store.selectedGroup
          ? 'bg-muted font-medium text-foreground'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'"
        @click="emit('select', group.name)"
    >
      <span class="truncate">{{ group.name }}</span>
      <span class="ml-auto text-xs tabular-nums text-muted-foreground">{{ group.count }}</span>
    </button>
  </div>
</template>
