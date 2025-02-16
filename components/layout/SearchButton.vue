<script setup lang="ts">
import { useDocStore } from '~/lib/docStore'
const isOpen = ref(false);
const { enable, /*inAside,*/ style, placeholder } = useConfig().value.search;
const store = useDocStore();

function getName(url: string) {
  const parts = url.split('/');
  const filename = parts.pop() || ''; // Ensure it's a string
  return filename.split('.')[0]; // Remove file extension
}
</script>

<template>
  <template v-if="enable">
    <Button
      v-if="style === 'input'"
      variant="outline"
      class="mb-4 h-8 w-full self-center rounded-md pr-1.5 font-normal text-muted-foreground hover:text-accent-foreground"
      @click="isOpen = true"
    >
      <span class="mr-auto overflow-hidden">
        <span v-if="store.selectedDocUrl.length > 0" class="flex items-center justify-center">
          <Icon v-if="store.isRefreshing[store.selectedDocUrl]" name="lucide:refresh-ccw" class="mr-2 size-4 animate-spin" />
          <Icon v-else-if="store.isInvalid[store.selectedDocUrl]" name="lucide:circle-alert" class="mr-2 size-4" />
          <Icon v-else-if="store.docs[store.selectedDocUrl]" name="lucide:circle-check" class="mr-2 size-4" />
          <Icon v-else name="lucide:circle-help" class="mr-2 size-4" />
          {{ getName(store.selectedDocUrl) }}
        </span>
        <span v-else>
          {{ placeholder }}
        </span>
      </span>
      <Kbd class="ml-auto hidden md:block">
        <span class="text-xs">⌘</span>K
      </Kbd>
    </Button>
    <Button
      v-else
      variant="ghost"
      size="icon"
      @click="isOpen = true"
    >
      <Icon name="lucide:search" size="16" />
    </Button>
  </template>

  <LayoutSearchDialog v-model:open="isOpen" />
</template>