<script setup lang="ts">
import { RefreshCcw, CircleAlert, CircleCheck, CircleHelp, Plus, X, Settings2 } from 'lucide-vue-next'
import { useDocStore, formatName } from '~/lib/docStore'
import { ref } from 'vue'

const store = useDocStore()
const newManifestUrl = ref('')
const isAdding = ref(false)

function handleAddManifest() {
  if (newManifestUrl.value.trim()) {
    if (store.addDocUrl(newManifestUrl.value.trim())) {
      newManifestUrl.value = ''
      isAdding.value = false
    }
  }
}

function handleSelectManifest(url: string) {
  store.selectDoc(url)
  navigateTo('#/')
}

function handleRefreshManifest(url: string) {
  store.refreshDoc(url)
}

function handleRemoveManifest(url: string) {
  if (store.removeDocUrl(url)) {
    navigateTo('#/')
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
          <div class="flex gap-2 justify-end">
            <Button 
              @click="isAdding = false; newManifestUrl = ''"
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
          <div class="flex-1 min-w-0 cursor-pointer" @click="handleSelectManifest(url)">
            <div class="font-medium text-sm truncate">
              {{ formatName(url) }}
            </div>
            <div class="text-xs text-muted-foreground truncate">
              {{ url }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-1 flex-shrink-0">
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