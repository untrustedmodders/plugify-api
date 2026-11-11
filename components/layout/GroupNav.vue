<script setup lang="ts">
import { ArrowUpRight, Github, Gitlab } from 'lucide-vue-next'
import { useDocStore, manifestTitle } from '~/lib/docStore'
import { manifestRepository } from '~/lib/manifests'
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

// Official and community APIs link to the repository they come from
const repository = computed(() => manifestRepository(store.selectedDocUrl))
const onGithub = computed(() => !!repository.value?.startsWith('https://github.com/'))
</script>

<template>
  <div v-if="store.selectedDocUrl" class="flex flex-col gap-1">
    <!-- The API itself, set apart from its groups below -->
    <div class="mb-2 flex items-start gap-2 border-b px-2 pb-3">
      <!-- A long name wraps rather than being cut off; the button stays at its first line -->
      <NuxtLink to="/#/" class="min-w-0 flex-1 text-base font-semibold leading-snug [overflow-wrap:anywhere]">
        {{ manifestTitle(store.selectedDocUrl) }}
      </NuxtLink>
      <!-- Spelled out: a bare icon next to the name did not say where it leads -->
      <a
          v-if="repository"
          :href="repository"
          target="_blank"
          rel="noopener"
          class="mt-px flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          :title="`Open the repository on ${onGithub ? 'GitHub' : 'GitLab'}`"
      >
        <Github v-if="onGithub" :size="12" />
        <Gitlab v-else :size="12" />
        {{ onGithub ? 'GitHub' : 'GitLab' }}
        <ArrowUpRight :size="10" />
      </a>
    </div>
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
