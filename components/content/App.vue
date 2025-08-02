<script setup lang="ts">
import { RefreshCcw, CircleAlert, CircleCheck, CircleHelp, Plus } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from '#app';
import { useDocStore, formatName } from '~/lib/docStore'

// Import components from the custom library
import {
  Badge
} from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import Spinner from '~/components/layout/Spinner.vue';
import SearchButton from '~/components/layout/SearchButton.vue';
import HashBreadcrumb from '~/components/layout/HashBreadcrumb.vue';
import Intro from '~/components/layout/Intro.vue';
import Footer from '~/components/layout/Footer.vue';
import Logo from '~/components/layout/Logo.vue';
import {HoverCard, HoverCardContent, HoverCardTrigger} from "~/components/ui/hover-card";
import {CardHeader} from "~/components/ui/card";
import {CommandGroup, CommandItem, CommandList} from "~/components/ui/command";
import InputError from "~/components/content/InputError.vue";

const config = useConfig();
const route = useRoute();
const router = useRouter();
const store = useDocStore();

useHead({
  title: () => `Plugify API ${store.selectedGroup ? ` :: ${store.selectedGroup}` : ``} ${store.selectedItem ? ` :: ${store.selectedItem}` : ``}`,
});

onMounted(() => {
  store.initDB(route.query.file);
})

watch(() => store.selectedDocUrl, (newUrl) => {
  if (newUrl) store.loadDoc(newUrl)
})

const countedGroups = computed(() => {
  const group = store.selectedDoc[store.selectedGroup];
  const data: { name: string, count: number }[] = [
    {
      name: "Methods",
      count: Object.values(group.methods).length
    },
    {
      name: "Delegates",
      count: Object.values(group.delegates).length
    },
    {
      name: "Enumerators",
      count: Object.values(group.enumerators).length
    }
  ];
  return data;
});
const filteredGroups = computed(() => store.selectedDoc[store.selectedGroup]);
const isRefreshing = computed(() => store.isRefreshing[store.selectedDocUrl]);

store.onRouteChange(router.currentRoute.value.hash);
watch(() => route.hash, (newHash, oldHash) => {
  store.onRouteChange(newHash);
});

function selectRow(name?: string) {
  router.push(`#/${store.selectedGroup}/${name}`);
}
function selectGroup(name?: string) {
  router.push(`#/${name}`);
}

const inputUrl = ref('')
const errorMessage = ref('');

const open = defineModel<boolean>('open');

function addUrl() {
  const url = inputUrl.value.trim();
  if (store.addDocUrl(url)) {
    closeDialog();
    store.selectDoc(url);
    router.push(`#/`);
  } else {
    errorMessage.value = "Invalid URL.";
  }
}

function closeDialog() {
  inputUrl.value = ''
  open.value = false;
}
</script>

<template>
  <SidebarProvider>
    <Sidebar class="bg-card">
      <SidebarHeader>
        <Logo/>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span v-if="store.selectedDocUrl.length > 0" class="flex items-center justify-center">
              <Button size="icon"
                      variant="ghost"
                      class="text-muted-foreground hover:text-primary rounded-full size-3 content-center mr-1"
                      @click.stop="store.refreshDoc(store.selectedDocUrl)"
              >
                <RefreshCcw v-if="store.isRefreshing[store.selectedDocUrl]" class="animate-spin" />
                <CircleAlert v-else-if="store.isInvalid[store.selectedDocUrl]"  />
                <CircleCheck v-else-if="store.docs[store.selectedDocUrl]" />
                <CircleHelp v-else />
              </Button>
              <HoverCard>
                <HoverCardTrigger as-child>
                  <span>{{ formatName(store.selectedDocUrl) }}</span>
                </HoverCardTrigger>
                <HoverCardContent class="w-80">
                  <div class="flex justify-between space-x-4">
                    <p class="text-sm">
                      {{ store.selectedDocUrl }}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <template v-if="isRefreshing">
              <Spinner />
            </template>
            <SidebarMenu>
              <SidebarMenuItem v-for="(data, group) in store.selectedDoc" :key="group">
                <SidebarMenuButton
                    class="text-muted-foreground hover:text-primary"
                    v-bind:class="{ 'text-primary bg-muted' : group === store.selectedGroup }"
                    v-if="Object.values(data.methods).length > 0"
                    @click="selectGroup(group)"
                >
                  {{ group }}
                  <Badge class="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    {{ Object.values(data.methods).length + Object.values(data.enumerators).length + Object.values(data.delegates).length }}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Dialog>
          <DialogTrigger as-child>
            <Button
                value="add-url"
                @click="open = true"
            >
              <Plus class="mr-2 h-5 w-5" />
              Add Manifest
            </Button>
          </DialogTrigger>
          <DialogContent class="h-full max-w-[100%] md:max-w-[510px] md:max-h-[230px] flex flex-col space-y-2">
            <DialogHeader>
              <DialogTitle>Add new manifest</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click add when you're done.
              </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="grid items-center grid-cols-[auto,1fr] gap-4">
                <Label for="url" class="w-auto">
                  URL
                </Label>
                <InputError
                    id="url"
                    v-model="inputUrl"
                    :error="errorMessage"
                    placeholder="Enter the URL for the document"
                    class="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose as-child>
                <Button @click="addUrl" class="w-full">
                  Add
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <HashBreadcrumb :fragments="store.fragments" class="flex max-md:hidden"/>
        <div class="flex flex-1 justify-end gap-3">
          <SearchButton v-if="!config.search.inAside && config.search.style === 'input'" />
          <div class="flex">
            <SearchButton v-if="!config.search.inAside && config.search.style === 'button'" />
            <ThemePopover v-if="config.theme.customizable" />
            <DarkModeToggle v-if="config.header.darkModeToggle" />
            <NuxtLink
                v-for="(link, i) in config.header.links"
                :key="i"
                :to="link?.to"
                :target="link?.target"
            >
              <Button variant="ghost" size="icon" class="flex gap-2">
                <Icon v-if="link?.icon" :name="link.icon" :size="18" />
              </Button>
            </NuxtLink>
          </div>
        </div>
      </header>
      <div class="flex flex-1 flex-col md:p-4">
        <template v-if="isRefreshing">
          <Spinner />
        </template>
        <template v-else-if="store.foundMethod">
          <Method class="w-full max-w-full overflow-hidden" :method="store.foundMethod" :group="store.selectedGroup" :url="store.selectedDocUrl" />
        </template>
        <template v-else-if="store.foundDelegate">
          <Method class="w-full max-w-full overflow-hidden" :method="store.foundDelegate" :group="store.selectedGroup" :url="store.selectedDocUrl" />
        </template>
        <template v-else-if="store.foundEnum">
          <Enum class="w-full max-w-full overflow-hidden" :enumerator="store.foundEnum" :group="store.selectedGroup" :url="store.selectedDocUrl" />
        </template>
        <template v-else-if="store.selectedDoc && filteredGroups">
          <Tabs default-value="Methods">
            <TabsPanel :tabs="countedGroups" />
            <TabsContent value="Methods">
              <TabCard
                  title="Methods"
                  :elements="Object.values(filteredGroups.methods)"
                  :onclick="selectRow"
                  class="w-full max-w-full overflow-hidden"
              />
            </TabsContent>
            <TabsContent value="Delegates">
              <TabCard
                  title="Delegates"
                  :elements="Object.values(filteredGroups.delegates)"
                  :onclick="selectRow"
                  class="w-full max-w-full overflow-hidden"
              />
            </TabsContent>
            <TabsContent value="Enumerators">
              <TabCard
                  title="Enumerators"
                  :elements="Object.values(filteredGroups.enumerators)"
                  :onclick="selectRow"
                  class="w-full max-w-full overflow-hidden"
              />
            </TabsContent>
          </Tabs>
        </template>
        <template v-else>
          <Intro />
        </template>
      </div>
      <Footer/>
    </SidebarInset>
  </SidebarProvider>
</template>