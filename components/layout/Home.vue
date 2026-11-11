<script setup lang="ts">
import { Plus, Users } from 'lucide-vue-next'
import { useDocStore, manifestTitle, manifestDescription } from '~/lib/docStore'
import { communityManifests, defaultManifests, findDefaultManifest } from '~/lib/manifests'
import ManifestManager from '~/components/layout/ManifestManager.vue'
import ApiCard from '~/components/layout/ApiCard.vue'

const emit = defineEmits<{ selectGroup: [group: string] }>()
const store = useDocStore()
const { header } = useConfig().value
const github = header.links.find(link => link.icon.includes('github'))?.to

function card(url: string) {
  return {
    url,
    name: manifestTitle(url),
    // A manifest without a description of its own shows where it comes from
    description: manifestDescription(url) || url,
    icon: findDefaultManifest(url)?.icon,
    author: findDefaultManifest(url)?.author,
  }
}

// The manifests from manifests.json, then any the user added themselves
const manifests = computed(() => [
  ...defaultManifests.map(manifest => manifest.url),
  ...store.docUrls.filter(url => !findDefaultManifest(url)),
].map(card))

// Made by the community, from manifests.community.json
const community = computed(() => communityManifests.map(manifest => card(manifest.url)))
// GitHub's editor for the list: for someone without write access, saving makes a fork
// and offers to open a pull request
const communityList = github ? `${github.replace(/\/$/, '')}/plugify-api/edit/main/manifests.community.json` : undefined
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-10 py-6 md:py-10">
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
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ApiCard v-for="manifest in manifests" :key="manifest.url" :manifest="manifest" />

        <Dialog>
          <DialogTrigger as-child>
            <button
                type="button"
                class="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-card p-4 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
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

    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-xl font-semibold tracking-tight md:text-2xl">Community</h2>
        <p class="text-sm text-muted-foreground">APIs of plugins made by the community.</p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ApiCard v-for="manifest in community" :key="manifest.url" :manifest="manifest" />
        <component
            :is="communityList ? 'a' : 'div'"
            :href="communityList"
            target="_blank"
            class="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-card p-4 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <Users :size="20" />
          <span v-if="community.length === 0">No community APIs yet.</span>
          <span>Made a plugin? Add its manifest to manifests.community.json in a pull request.</span>
        </component>
      </div>
    </section>

  </div>
</template>
