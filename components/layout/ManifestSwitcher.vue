<script setup lang="ts">
import { RefreshCcw, CircleAlert, CircleCheck, CircleHelp, ChevronDown, Settings2, FileText } from 'lucide-vue-next'
import { useDocStore, manifestTitle } from '~/lib/docStore'
import { communityManifests, defaultManifests, findDefaultManifest } from '~/lib/manifests'
import { ref } from 'vue'
import ManifestManager from '~/components/layout/ManifestManager.vue'

const store = useDocStore()
const { openApi } = useDocNavigation()
const open = ref(false)

function handleSelectManifest(url: string) {
  open.value = false
  openApi(url)
}

function getStatusIcon(url: string) {
  if (store.isRefreshing[url]) return 'refreshing'
  if (store.isInvalid[url]) return 'error'
  if (store.docs[url]) return 'valid'
  return 'unknown'
}

// Official ones, the user's own, then the community ones: listed manifests show up even
// before they were ever opened (opening one adds it to the user's list)
const sections = computed(() => [
  { label: 'Official', urls: defaultManifests.map(manifest => manifest.url) },
  { label: 'Yours', urls: store.docUrls.filter(url => !findDefaultManifest(url)) },
  { label: 'Community', urls: communityManifests.map(manifest => manifest.url) },
].filter(section => section.urls.length > 0))

const currentManifestName = computed(() => {
  return store.selectedDocUrl ? manifestTitle(store.selectedDocUrl) : 'No manifest selected'
})
</script>

<template>
  <DropdownMenu v-model:open="open">
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        class="gap-2 min-w-40 max-w-64"
        :class="[!store.selectedDocUrl && 'text-muted-foreground']"
      >
        <!-- Current manifest status -->
        <RefreshCcw
          v-if="store.selectedDocUrl && getStatusIcon(store.selectedDocUrl) === 'refreshing'"
          class="h-4 w-4 animate-spin flex-shrink-0"
        />
        <CircleAlert
          v-else-if="store.selectedDocUrl && getStatusIcon(store.selectedDocUrl) === 'error'"
          class="h-4 w-4 text-destructive flex-shrink-0"
        />
        <CircleCheck
          v-else-if="store.selectedDocUrl && getStatusIcon(store.selectedDocUrl) === 'valid'"
          class="h-4 w-4 text-green-600 flex-shrink-0"
        />
        <FileText
          v-else
          class="h-4 w-4 flex-shrink-0"
        />

        <span class="truncate">{{ currentManifestName }}</span>
        <ChevronDown class="h-4 w-4 flex-shrink-0" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-80">
      <DropdownMenuLabel>Select Manifest</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <!-- Manifest list -->
      <div v-if="sections.length > 0" class="max-h-96 overflow-y-auto overflow-x-hidden">
        <template v-for="(section, index) in sections" :key="section.label">
          <DropdownMenuSeparator v-if="index > 0" />
          <DropdownMenuLabel class="py-1 text-xs font-normal text-muted-foreground">{{ section.label }}</DropdownMenuLabel>
          <DropdownMenuItem
            v-for="url in section.urls"
            :key="url"
            @click="handleSelectManifest(url)"
            class="flex items-center gap-3 p-2"
            :class="[store.selectedDocUrl === url && 'bg-primary/10']"
          >
            <!-- Status indicator -->
            <div class="flex-shrink-0">
              <RefreshCcw
                v-if="getStatusIcon(url) === 'refreshing'"
                class="h-4 w-4 animate-spin text-muted-foreground"
              />
              <CircleAlert
                v-else-if="getStatusIcon(url) === 'error'"
                class="h-4 w-4 text-destructive"
              />
              <CircleCheck
                v-else-if="getStatusIcon(url) === 'valid'"
                class="h-4 w-4 text-green-600"
              />
              <CircleHelp
                v-else
                class="h-4 w-4 text-muted-foreground"
              />
            </div>

            <!-- Manifest info -->
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm truncate">
                {{ manifestTitle(url) }}
              </div>
              <div class="text-xs text-muted-foreground truncate">
                {{ url }}
              </div>
            </div>

            <!-- Current indicator -->
            <div v-if="store.selectedDocUrl === url" class="text-xs text-primary">
              Current
            </div>
          </DropdownMenuItem>
        </template>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center py-6 text-muted-foreground"
      >
        <Settings2 class="h-6 w-6 mb-2 opacity-50" />
        <p class="text-sm">No manifests available</p>
      </div>

      <DropdownMenuSeparator />
      <DropdownMenuItem as-child>
        <Dialog>
          <DialogTrigger class="w-full flex items-center px-2 py-1.5 text-sm">
            <Settings2 class="h-4 w-4 mr-2" />
            Manage Manifests
          </DialogTrigger>
          <DialogContent class="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Manifests</DialogTitle>
              <DialogDescription>
                Add, remove, and switch between manifest files
              </DialogDescription>
            </DialogHeader>
            <ManifestManager />
          </DialogContent>
        </Dialog>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>