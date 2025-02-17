<script setup lang="ts">
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
import { useMagicKeys } from '@vueuse/core';
import { useRouter } from "#app";
import { useDocStore, getName } from "~/lib/docStore";
import type { Item } from "~/lib/docStore";
import { ref } from "vue";
import InputError from "~/components/content/InputError.vue";

const { darkModeToggle } = useConfig().value.header;

const open = defineModel<boolean>('open');
const subopen = defineModel<boolean>('subopen');
const colorMode = useColorMode();
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
watch(
  input,
  async (v) => {
    activeSelect.value = 0;
    if (!v)
      return;

    searchLoading.value = true;
    searchResult.value = await store.searchContent(v);
    searchLoading.value = false;
  },
);

function getHighlightedContent(text: string) {
  return text.replace(input.value, `<span class="font-semibold underline">${input.value}</span>`);
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

function handleClick(url: string) {
  open.value = false;
  router.push(url);
}

function handleSelect(url: string) {
  open.value = false;
  store.selectDoc(url);
  router.push(`#/`);
}

function handleRemove(url: string) {
  if (store.removeDocUrl(url)) {
    router.push(`#/`);
  }
}

const inputUrl = ref('')
const errorMessage = ref('');

function addUrl() {
  if (store.addDocUrl(inputUrl.value.trim())) {
    closeDialog();
  } else {
    errorMessage.value = "Invalid URL.";
  }
}

function closeDialog() {
  inputUrl.value = ''
  subopen.value = false;
}

</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="p-0">
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
          <div v-if="!input?.length" class="p-1.5">
<!--            <template v-for="item in navigation" :key="item._path">
              <CommandGroup v-if="item.children" :heading="item.title" class="p-1.5">
                <NuxtLink v-for="child in item.children" :key="child.id" :to="child._path">
                  <CommandItem :value="child._path">
                    <SmartIcon v-if="child.icon" :name="child.icon" class="mr-2 size-4" />
                    <div v-else class="mr-2 size-4" />
                    <span>{{ child.title }}</span>
                  </CommandItem>
                </NuxtLink>
              </CommandGroup>
              <CommandSeparator v-if="item.children" />
            </template>
            -->

            <CommandItem
                v-for="(item, i) in store.docUrls"
                :key="i" :value="i"
                @click="handleSelect(item)"
                class="flex rounded-md p-2">
              <Icon v-if="store.isRefreshing[item]" name="lucide:refresh-ccw" class="mr-2 size-4 animate-spin" />
              <Icon v-else-if="store.isInvalid[item]" name="lucide:circle-alert" class="mr-2 size-4" />
              <Icon v-else-if="store.docs[item]" name="lucide:circle-check" class="mr-2 size-4" />
              <Icon v-else name="lucide:circle-help" class="mr-2 size-4" />

              <HoverCard>
                <HoverCardTrigger as-child>
                  <span>{{ getName(item) }}</span>
                </HoverCardTrigger>
                <HoverCardContent class="w-80">
                  <div class="flex justify-between space-x-4">
                    <p class="text-sm">
                      {{ item }}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <Button
                  aria-haspopup="true"
                  size="icon"
                  variant="ghost"
                  class="ml-auto text-muted-foreground hover:text-primary rounded-full size-3 content-center mr-2"
                  @click.stop="handleRemove(item)"
              >
                <Icon name="lucide:x" class="h-4 w-4" />
              </Button>
            </CommandItem>
          </div>

          <div v-else-if="searchResult?.length" class="p-1.5">
            <CommandItem
                v-for="(item, i) in searchResult"
                :value="item"
                :key="i"
                class="flex select-none rounded-md p-2 hover:cursor-pointer hover:bg-muted"
                :class="[i === activeSelect && 'bg-muted']"
                @click="activeSelect = i; handleClick(item.link)"
            >
              <Icon v-if="store.isRefreshing[item.url]" name="lucide:refresh-ccw" class="mr-2 size-4 animate-spin" />
              <Icon v-else-if="store.isInvalid[item.url]" name="lucide:circle-alert" class="mr-2 size-4" />
              <Icon v-else-if="store.docs[item.url]" name="lucide:circle-check" class="mr-2 size-4" />
              <Icon v-else name="lucide:circle-help" class="mr-2 size-4" />

              <span>{{ getName(item.url) }}</span>
              <template v-if="item.name.length > 0">
                <div class="mr-2 size-4 shrink-0" />
                <Icon :name="`lucide:${item.icon}`" class="mr-2 size-4 shrink-0 self-center" />
                  <!--<span v-for="(subtitle, j) in item.titles" :key="`${subtitle}${j}`" class="flex shrink-0 self-center">
                    {{ subtitle }}
                    <Icon name="lucide:chevron-right" class="mx-0.5 self-center text-muted-foreground" />
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
        <div v-if="!input?.length">
          <CommandSeparator />
          <CommandList  @escape-key-down="open = false">
            <CommandGroup>
              <Sheet>
                <SheetTrigger as-child>
                  <CommandItem
                      value="add-url"
                      @click="open = true"
                  >
                    <Icon name="lucide:plus" class="mr-2 h-5 w-5" />
                    Add Manifest
                  </CommandItem>
                </SheetTrigger>
                <SheetContent side="bottom">
                  <SheetHeader>
                    <SheetTitle>Add new manifest</SheetTitle>
                    <SheetDescription>
                      Make changes to your profile here. Click add when you're done.
                    </SheetDescription>
                  </SheetHeader>
                  <div class="grid gap-4 py-4">
                    <div class="grid items-center grid-cols-4 gap-4">
                      <Label for="url" class="text-right">
                        URL
                      </Label>
                      <InputError
                          id="url"
                          v-model="inputUrl"
                          class="col-span-3"
                          :error="errorMessage"
                          placeholder="Enter the URL for the document"
                      />
                    </div>
                  </div>
                  <SheetFooter>
                    <SheetClose as-child>
                      <Button @click="addUrl">
                        Add
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </CommandGroup>
          </CommandList>
        </div>
      </Command>
    </DialogContent>
  </Dialog>
</template>
