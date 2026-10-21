<script setup lang="ts">
import { ArrowUpRight, Check, FileText, Plus } from 'lucide-vue-next'
import { useDocStore, manifestTitle, manifestDescription } from '~/lib/docStore'
import { defaultManifests, findDefaultManifest } from '~/lib/manifests'
import ManifestManager from '~/components/layout/ManifestManager.vue'

const emit = defineEmits<{ selectGroup: [group: string] }>()
const store = useDocStore()
const { openApi } = useDocNavigation()
const { header } = useConfig().value
const github = header.links.find(link => link.icon.includes('github'))?.to

// The manifests from manifests.json, then any the user added themselves
const manifests = computed(() => [
  ...defaultManifests.map(manifest => manifest.url),
  ...store.docUrls.filter(url => !findDefaultManifest(url)),
].map(url => ({
  url,
  name: manifestTitle(url),
  // A manifest without a description of its own shows where it comes from
  description: manifestDescription(url) || url,
  icon: findDefaultManifest(url)?.icon,
})))

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
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-12 py-6 md:py-12">
    <section class="flex flex-col items-center gap-4 text-center">
      <h1 class="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
        Plugify API Hub
      </h1>
      <p class="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
        Browse the native APIs that plugins export to every language module.
        <span class="font-semibold text-foreground">Methods, delegates, enums and classes</span> — all in one place.
      </p>
      <div class="flex gap-3 pt-2">
        <NuxtLink to="https://plugify.net/" target="_self">
          <Button>Documentation</Button>
        </NuxtLink>
        <NuxtLink v-if="github" :to="github" target="_blank">
          <Button variant="outline" class="gap-2">
            <Icon name="simple-icons:github" :size="16" />
            GitHub
          </Button>
        </NuxtLink>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold tracking-tight md:text-2xl">Choose an API</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <button
            v-for="manifest in manifests"
            :key="manifest.url"
            type="button"
            class="group relative flex flex-col gap-3 rounded-lg border bg-card p-6 text-left text-foreground transition-colors hover:bg-muted/50"
            :class="manifest.url === store.selectedDocUrl && 'border-primary'"
            @click="openApi(manifest.url)"
        >
          <Check v-if="manifest.url === store.selectedDocUrl" :size="16" class="absolute right-4 top-4 text-primary" />
          <ArrowUpRight v-else :size="16" class="absolute right-4 top-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <Icon v-if="manifest.icon" :name="manifest.icon" :size="24" />
          <FileText v-else :size="24" />
          <!-- text-foreground: some themes (Plugify) mute card-foreground like descriptions -->
          <div class="text-lg font-semibold text-foreground">{{ manifest.name }}</div>
          <p class="line-clamp-2 text-sm text-muted-foreground [overflow-wrap:anywhere]">{{ manifest.description }}</p>
          <p v-if="countOf(manifest.url)" class="text-xs text-muted-foreground">
            {{ plural(countOf(manifest.url)!.groups, 'group') }} · {{ plural(countOf(manifest.url)!.methods, 'method') }}
          </p>
        </button>

        <Dialog>
          <DialogTrigger as-child>
            <button
                type="button"
                class="flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <Plus :size="20" />
              Add a manifest
            </button>
          </DialogTrigger>
          <DialogContent class="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Manifests</DialogTitle>
              <DialogDescription>Add, remove, and switch between manifest files</DialogDescription>
            </DialogHeader>
            <ManifestManager />
          </DialogContent>
        </Dialog>
      </div>
    </section>

  </div>
</template>
