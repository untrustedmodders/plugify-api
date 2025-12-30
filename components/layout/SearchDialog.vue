<script setup lang="ts">
import { RefreshCcw, CircleAlert, CircleCheck, CircleHelp, FileText, SquareM, SquareFunction, SquareSigma, SquareCode } from 'lucide-vue-next'
import { VisuallyHidden } from 'radix-vue';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { useMagicKeys, useDebounceFn } from '@vueuse/core';
import { useRouter } from "#app";
import { useDocStore, formatName } from '~/lib/docStore';
import type { Item } from '~/lib/docStore';
import { ref } from "vue";
import InputError from '~/components/content/InputError.vue';

const { darkModeToggle } = useConfig().value.header;

const open = defineModel<boolean>('open');
const { placeholderDetailed } = useConfig().value.search;

const activeSelect = ref(0);

const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey))
      e.preventDefault();
  },
});
watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1])
    open.value = true;
});

const input = ref('');
const searchResult = ref<Item[]>([]);
const searchLoading = ref(false);

const performSearch = useDebounceFn(async (searchTerm: string) => {
  if (!searchTerm) {
    searchResult.value = [];
    searchLoading.value = false;
    return;
  }

  searchLoading.value = true;
  searchResult.value = await store.searchContent(searchTerm);
  searchLoading.value = false;
}, 300);

watch(
  input,
  (v) => {
    activeSelect.value = 0;
    if (!v) {
      searchResult.value = [];
      searchLoading.value = false;
      return;
    }
    searchLoading.value = true;
    performSearch(v);
  },
);

function getHighlightedContent(text: string) {
  if (!input.value) return text;
  const escapedInput = input.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedInput, 'gi');
  return text.replace(regex, (match) => `<span class="font-semibold underline">${match}</span>`);
}

const router = useRouter();
const store = useDocStore();

async function handleEnter() {
  const item = searchResult.value[activeSelect.value];
  if (item) {
    store.selectDoc(item.url);
    open.value = false;
    await router.push(item.link);
  }
}

function handleNavigate(delta: -1 | 1) {
  if (activeSelect.value + delta >= 0 && activeSelect.value + delta < searchResult.value.length)
    activeSelect.value += delta;
}

async function handleClick(item: Item) {
  if (item.url !== store.selectedDocUrl) {
    store.selectDoc(item.url);
  }
  open.value = false;
  await router.push(item.link);
}

</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="p-0" forceMount>
      <VisuallyHidden as-child>
        <DialogTitle />
      </VisuallyHidden>
      <VisuallyHidden as-child>
        <DialogDescription aria-describedby="undefined" />
      </VisuallyHidden>
      <Command v-model:search-term="input" class="h-svh sm:h-[350px]">
        <CommandInput
            :loading="searchLoading"
            :placeholder="placeholderDetailed"
            @keydown.enter="handleEnter"
            @keydown.down="handleNavigate(1)"
            @keydown.up="handleNavigate(-1)"
        />
        <CommandList class="text-sm" @escape-key-down="open = false">
          <div v-if="!input?.length" class="py-6 text-center text-muted-foreground">
            <p class="text-sm">Type to search...</p>
            <p class="text-xs mt-1">Search across methods, delegates, and enumerators</p>
          </div>

          <div v-else-if="searchResult?.length" class="p-1.5">
            <CommandItem
                v-for="(item, i) in searchResult"
                :value="item"
                :key="`${item.url}-${item.name}-${i}`"
                v-memo="[item, i === activeSelect, store.isRefreshing[item.url], store.isInvalid[item.url], store.docs[item.url]]"
                class="flex select-none rounded-md p-2 hover:cursor-pointer hover:bg-muted"
                :class="[i === activeSelect && 'bg-muted']"
                @click="activeSelect = i; handleClick(item)"
            >
              <RefreshCcw v-if="store.isRefreshing[item.url]" class="mr-2 size-4 animate-spin" />
              <CircleAlert v-else-if="store.isInvalid[item.url]" class="mr-2 size-4" />
              <CircleCheck v-else-if="store.docs[item.url]" class="mr-2 size-4" />
              <CircleHelp v-else class="mr-2 size-4" />

              <span>{{ formatName(item.url) }}</span>
              <template v-if="item.name.length > 0">
                <div class="mr-2 size-4 shrink-0" />
                <FileText v-if="item.icon == 1" class="mr-2 size-4 shrink-0 self-center" />
                <SquareM v-else-if="item.icon == 2" class="mr-2 size-4 shrink-0 self-center" />
                <SquareFunction v-else-if="item.icon == 3" class="mr-2 size-4 shrink-0 self-center" />
                <SquareSigma v-else-if="item.icon == 4" class="mr-2 size-4 shrink-0 self-center" />
                <SquareCode v-else-if="item.icon == 5" class="mr-2 size-4 shrink-0 self-center" />
                  <!--<span v-for="(subtitle, j) in item.titles" :key="`${subtitle}${j}`" class="flex shrink-0 self-center">
                    {{ subtitle }}
                    <ChevronRight class="mx-0.5 self-center text-muted-foreground" />
                  </span>-->
                <span class="shrink-0 self-center">
                  {{ item.name }}
                </span>
                <span class="ml-2 self-center truncate text-xs text-muted-foreground" v-html="getHighlightedContent(item.name)" />
              </template>
            </CommandItem>
          </div>

          <div v-else class="pt-4 text-center text-muted-foreground">
            No results found.
          </div>
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>
</template>
