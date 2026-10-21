<script setup lang="ts">
import { RefreshCcw, CircleAlert, CircleCheck, CircleHelp, Plus, X, Settings2, Pencil } from 'lucide-vue-next'
import { useDocStore, manifestTitle, defaultManifestTitle } from '~/lib/docStore'
import { nextTick, ref } from 'vue'

const store = useDocStore()
const { go } = useDocNavigation()
const newManifestUrl = ref('')
const newManifestName = ref('')
const isAdding = ref(false)

function handleAddManifest() {
  if (newManifestUrl.value.trim()) {
    if (store.addDocUrl(newManifestUrl.value.trim(), newManifestName.value)) {
      handleResetManifest()
    }
  }
}

function handleResetManifest() {
  isAdding.value = false;
  newManifestUrl.value = ''
  newManifestName.value = ''
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

function handleSelectManifest(url: string) {
  store.selectDoc(url)
  go('#/')
}

function handleRefreshManifest(url: string) {
  store.refreshDoc(url)
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
  <div class="flex h-full w-full flex-col overflow-hidden max-w-md mx-auto">
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Manifest Files</h3>
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

      <!-- Add new manifest form -->
      <Card v-if="isAdding" class="p-4">
        <div class="space-y-3">
          <Label for="manifest-url">Manifest URL</Label>
          <Input
            id="manifest-url"
            v-model="newManifestUrl"
            placeholder="GitHub/GitLab URL or direct link to manifest.json"
            @keydown.enter="handleAddManifest"
          />
          <Label for="manifest-name">Name <span class="text-muted-foreground">(optional)</span></Label>
          <Input
            id="manifest-name"
            v-model="newManifestName"
            placeholder="Taken from the manifest if left empty"
            @keydown.enter="handleAddManifest"
          />
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
      <div class="space-y-2">
        <div 
          v-for="url in store.docUrls"
          :key="url"
          class="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          :class="[
            store.selectedDocUrl === url && 'bg-muted border-primary'
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
            @keydown.enter="finishRename"
            @keydown.esc.stop="renamingUrl = ''"
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
          <div class="flex gap-1 flex-shrink-0">
            <Button
              @click.stop="startRename(url)"
              size="icon"
              variant="ghost"
              class="h-8 w-8"
              title="Rename"
            >
              <Pencil class="h-3 w-3" />
            </Button>
            <Button 
              @click.stop="handleRefreshManifest(url)"
              size="icon"
              variant="ghost"
              class="h-8 w-8"
              :disabled="store.isRefreshing[url]"
            >
              <RefreshCcw class="h-3 w-3" />
            </Button>
            <Button 
              @click.stop="handleRemoveManifest(url)"
              size="icon"
              variant="ghost"
              class="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <X class="h-3 w-3" />
            </Button>
          </div>
        </div>

        <!-- Empty state -->
        <div 
          v-if="store.docUrls.length === 0"
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