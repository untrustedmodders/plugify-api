<script setup lang="ts">
import { RefreshCcw, CircleAlert, CircleCheck, CircleHelp, Plus, X, Settings2, Pencil, Github, Gitlab } from 'lucide-vue-next'
import { useDocStore, manifestTitle, defaultManifestTitle } from '~/lib/docStore'
import { communityManifests, defaultManifests, findDefaultManifest, findListedManifest, manifestRepository, normalizeDocUrl, sameManifestUrl } from '~/lib/manifests'
import { computed, nextTick, ref } from 'vue'

const store = useDocStore()
const { go } = useDocNavigation()
const newManifestUrl = ref('')
const newManifestName = ref('')
const isAdding = ref(false)
// Why the last URL was not added, shown under the form
const addError = ref('')
const list = ref<HTMLElement | null>(null)

// Same sections as the API picker: official ones, the user's own, then the community ones,
// which are shown before they were ever opened (opening one adds it to the user's list)
const sections = computed(() => [
  { label: 'Official', urls: defaultManifests.map(manifest => manifest.url) },
  { label: 'Yours', urls: store.docUrls.filter(url => !findDefaultManifest(url)) },
  { label: 'Community', urls: communityManifests.map(manifest => manifest.url) },
].filter(section => section.urls.length > 0))

const allUrls = computed(() => sections.value.flatMap(section => section.urls))

function handleAddManifest() {
  const url = normalizeDocUrl(newManifestUrl.value.trim())
  if (!url) {
    addError.value = 'Not a valid http(s) link.'
    return
  }
  // Official and community manifests are on the site already, under their own names
  const listed = findListedManifest(url)
  if (listed) {
    addError.value = `Already on the site as "${listed.name ?? manifestTitle(listed.url)}"${listed.community ? ', under Community' : ''}.`
    return
  }
  const existing = store.docUrls.find(other => sameManifestUrl(other, url))
  if (existing) {
    addError.value = `Already on the list as "${manifestTitle(existing)}".`
    showRow(existing)
    return
  }
  store.addDocUrl(url, newManifestName.value)
  // Load it now, so its name and status show at once instead of on first open
  store.loadDoc(url)
  handleResetManifest()
  showRow(url)
}

// The list shows five rows; bring a new or existing row into view
function showRow(url: string) {
  nextTick(() => {
    const row = list.value?.querySelector(`[data-url="${CSS.escape(url)}"]`)
    row?.scrollIntoView({ block: 'nearest' })
  })
}

function handleResetManifest() {
  isAdding.value = false;
  newManifestUrl.value = ''
  newManifestName.value = ''
  addError.value = ''
}

// Renaming a listed manifest; an empty name goes back to the default one
const renamingUrl = ref('')
const renameValue = ref('')

function startRename(url: string) {
  renamingUrl.value = url
  renameValue.value = store.customNames[url] ?? ''
  // autofocus does not apply to an input added after the page loaded; select the
  // current name so typing replaces it
  nextTick(() => (document.getElementById('manifest-rename') as HTMLInputElement | null)?.select())
}

function finishRename() {
  if (renamingUrl.value) store.renameDoc(renamingUrl.value, renameValue.value)
  renamingUrl.value = ''
}

// Enter and Esc remove the focused input; without this the focus would fall back to the
// dialog itself, which then shows its focus ring around everything. The Enter must not
// reach the button it moves to, or it would press it and start renaming again
function endRenameFromKeyboard(save: boolean) {
  const url = renamingUrl.value
  if (save) {
    finishRename()
  } else {
    renamingUrl.value = ''
  }
  nextTick(() => list.value?.querySelector<HTMLElement>(`[data-url="${CSS.escape(url)}"] button[title="Rename"]`)?.focus())
}

function handleSelectManifest(url: string) {
  store.addDocUrl(url)
  store.selectDoc(url)
  go('#/')
}

// A downloaded manifest is kept only for those on the user's list, so a community one
// joins the list when reloaded, as when it is opened
function handleRefreshManifest(url: string) {
  store.addDocUrl(url)
  store.refreshDoc(url)
}

function handleRefreshAll() {
  for (const url of allUrls.value) handleRefreshManifest(url)
}

function handleRemoveManifest(url: string) {
  if (store.removeDocUrl(url)) {
    go('#/')
  }
}

function getStatusIcon(url: string) {
  if (store.isRefreshing[url]) return 'refreshing'
  if (store.isInvalid[url]) return 'error'
  if (store.docs[url]) return 'valid'
  return 'unknown'
}
</script>

<template>
  <!-- Full width of the dialog, so the list lines up with its title -->
  <div class="flex h-full w-full flex-col overflow-hidden">
    <div class="space-y-3">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-muted-foreground">{{ allUrls.length }} {{ allUrls.length === 1 ? 'manifest' : 'manifests' }}</h3>
        <div class="flex gap-2">
          <Button
            @click="handleRefreshAll"
            size="sm"
            variant="outline"
            class="gap-2"
            :disabled="allUrls.every(url => store.isRefreshing[url])"
          >
            <RefreshCcw class="h-4 w-4" :class="allUrls.some(url => store.isRefreshing[url]) && 'animate-spin'" />
            Reload all
          </Button>
          <Button 
            v-if="!isAdding"
            @click="isAdding = true"
            size="sm"
            variant="outline"
            class="gap-2"
          >
            <Plus class="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <!-- Add new manifest form -->
      <Card v-if="isAdding" class="bg-background p-4">
        <div class="space-y-3">
          <Label for="manifest-url">Manifest URL</Label>
          <Input
            id="manifest-url"
            v-model="newManifestUrl"
            placeholder="GitHub/GitLab URL or direct link to manifest.json"
            @input="addError = ''"
            @keydown.enter="handleAddManifest"
          />
          <Label for="manifest-name">Name <span class="text-muted-foreground">(optional)</span></Label>
          <Input
            id="manifest-name"
            v-model="newManifestName"
            placeholder="Taken from the manifest if left empty"
            @keydown.enter="handleAddManifest"
          />
          <!-- Styled like the danger alerts: the theme's dark red text is hard to read on a dark card -->
          <div v-if="addError" class="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-foreground">
            <CircleAlert class="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <span>{{ addError }}</span>
          </div>
          <div class="flex gap-2 justify-end">
            <Button 
              @click="handleResetManifest"
              size="sm"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button 
              @click="handleAddManifest"
              size="sm"
              :disabled="!newManifestUrl.trim()"
            >
              Add Manifest
            </Button>
          </div>
        </div>
      </Card>

      <!-- Manifest list -->
      <!-- About five rows (58px each, 8px apart), then the list scrolls -->
      <div ref="list" class="-mr-2 max-h-[322px] space-y-2 overflow-y-auto pr-2">
        <template v-for="section in sections" :key="section.label">
          <div class="pt-1 text-xs text-muted-foreground">{{ section.label }}</div>
          <div 
            v-for="url in section.urls"
            :key="url"
            :data-url="url"
            class="flex items-center gap-3 rounded-lg border bg-background py-2.5 pl-3 pr-2 transition-colors hover:border-muted-foreground/40"
            :class="[
              // The rows sit on the dialog's own colour in some themes (Plugify): a background
              // of the page colour and a clear border keep them apart
              store.selectedDocUrl === url && 'border-primary bg-primary/5 hover:border-primary'
            ]"
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
            <Input
              v-if="renamingUrl === url"
              id="manifest-rename"
              v-model="renameValue"
              class="h-8 flex-1"
              :placeholder="`Default: ${defaultManifestTitle(url)}`"
              @keydown.enter.prevent="endRenameFromKeyboard(true)"
              @keydown.esc.stop="endRenameFromKeyboard(false)"
              @blur="finishRename"
            />
            <div v-else class="flex-1 min-w-0 cursor-pointer" @click="handleSelectManifest(url)">
              <div class="font-medium text-sm truncate">
                {{ manifestTitle(url) }}
              </div>
              <div class="text-xs text-muted-foreground truncate">
                {{ url }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-shrink-0 gap-0.5">
              <!-- Official and community manifests come from the site's lists: they can be
                   reloaded, not renamed or removed -->
              <Button
                v-if="!findDefaultManifest(url)"
                @click.stop="startRename(url)"
                size="icon"
                variant="ghost"
                class="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Rename"
              >
                <Pencil class="h-3.5 w-3.5" />
              </Button>
              <!-- Official and community manifests link to the repository they come from -->
              <Button
                v-if="manifestRepository(url)"
                as="a"
                :href="manifestRepository(url)"
                target="_blank"
                rel="noopener"
                size="icon"
                variant="ghost"
                class="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Repository"
                @click.stop
              >
                <Github v-if="manifestRepository(url)!.startsWith('https://github.com/')" class="h-3.5 w-3.5" />
                <Gitlab v-else class="h-3.5 w-3.5" />
              </Button>
              <Button 
                @click.stop="handleRefreshManifest(url)"
                size="icon"
                variant="ghost"
                class="h-8 w-8 text-muted-foreground hover:text-foreground"
                :disabled="store.isRefreshing[url]"
                title="Reload"
              >
                <RefreshCcw class="h-3.5 w-3.5" />
              </Button>
              <Button 
                v-if="!findDefaultManifest(url)"
                @click.stop="handleRemoveManifest(url)"
                size="icon"
                variant="ghost"
                class="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Remove"
              >
                <X class="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

        </template>

        <!-- Empty state -->
        <div 
          v-if="allUrls.length === 0"
          class="text-center py-8 text-muted-foreground"
        >
          <Settings2 class="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm">No manifest files added yet</p>
          <p class="text-xs">Click "Add" to get started</p>
        </div>
      </div>
    </div>
  </div>
</template>