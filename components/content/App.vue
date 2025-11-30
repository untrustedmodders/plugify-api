<script setup lang="ts">
import { RefreshCcw, CircleAlert, CircleCheck, CircleHelp } from 'lucide-vue-next'
import { onMounted, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from '#app';
import { useDocStore, formatName } from '~/lib/docStore'
import { useWindowSize } from '@vueuse/core'

// Scroll position tracking for hash-based routing
const scrollPositions = new Map<string, number>()

// Active tab tracking per group
const activeTabPerGroup = new Map<string, string>()
const currentTab = ref('Methods')

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
import ManifestSwitcher from '~/components/layout/ManifestSwitcher.vue';

const config = useConfig();
const route = useRoute();
const router = useRouter();
const store = useDocStore();

const { width } = useWindowSize()
const isSmall = computed(() => width.value < 640)

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
    },
    {
      name: "Classes",
      count: Object.values(group.classes).length
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

// Watch for navigation back to group view and restore scroll
watch(() => store.selectedItem, (newItem, oldItem) => {
  // If navigating from detail view (oldItem exists) to group view (newItem is null)
  if (oldItem && !newItem && store.selectedGroup) {
    restoreScrollPosition()
  }
});

// Watch for group changes and restore the active tab
watch(() => store.selectedGroup, (newGroup) => {
  if (newGroup) {
    const savedTab = activeTabPerGroup.get(newGroup)
    currentTab.value = savedTab || 'Methods'
  }
});

// Save active tab when it changes
watch(currentTab, (newTab) => {
  if (store.selectedGroup && newTab) {
    activeTabPerGroup.set(store.selectedGroup, newTab)
  }
});

function saveScrollPosition() {
  if (store.selectedGroup) {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    scrollPositions.set(store.selectedGroup, scrollTop)
  }
}

function restoreScrollPosition() {
  if (store.selectedGroup) {
    const savedPosition = scrollPositions.get(store.selectedGroup)
    if (savedPosition !== undefined) {
      nextTick(() => {
        window.scrollTo({
          top: savedPosition,
          behavior: 'instant'
        })
      })
    }
  }
}

function selectRow(name?: string) {
  // Save scroll position before navigating to detail view
  saveScrollPosition()
  router.push(`#/${store.selectedGroup}/${name}`);
}
function selectGroup(name?: string) {
  // Save scroll position before navigating to another group
  saveScrollPosition()
  router.push(`#/${name}`);
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
          <SidebarGroupLabel v-if="store.selectedDocUrl.length > 0">
            API Groups
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
                    {{ Object.values(data.methods).length + Object.values(data.enumerators).length + Object.values(data.delegates).length + Object.values(data.classes).length }}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <!-- Footer content can be added here if needed -->
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset class="w-full overflow-x-hidden">
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-2 md:px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4 max-md:hidden" />
        <HashBreadcrumb :fragments="store.fragments" class="flex max-md:hidden"/>
        <div class="flex flex-1 justify-end gap-1 md:gap-3">
          <ManifestSwitcher />
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
                v-if="!isSmall || i < 2"
            >
              <Button variant="ghost" size="icon" class="flex gap-2">
                <Icon v-if="link?.icon" :name="link.icon" :size="18" />
              </Button>
            </NuxtLink>
          </div>
        </div>
      </header>
      <div class="flex flex-1 flex-col p-2 md:p-4 overflow-x-hidden w-full">
        <template v-if="isRefreshing">
          <Spinner />
        </template>
        <template v-else-if="store.foundMethod">
          <Method class="w-full max-w-full" :method="store.foundMethod" :group="store.selectedGroup" :url="store.selectedDocUrl" />
        </template>
        <template v-else-if="store.foundDelegate">
          <Method class="w-full max-w-full" :method="store.foundDelegate" :group="store.selectedGroup" :url="store.selectedDocUrl" />
        </template>
        <template v-else-if="store.foundEnum">
          <Enum class="w-full max-w-full" :enumerator="store.foundEnum" :group="store.selectedGroup" :url="store.selectedDocUrl" />
        </template>
        <template v-else-if="store.foundClass">
          <Class class="w-full max-w-full" :klass="store.foundClass" :group="store.selectedGroup" :url="store.selectedDocUrl" />
        </template>
        <template v-else-if="store.selectedDoc && filteredGroups">
          <Tabs v-model="currentTab" :key="store.selectedGroup">
            <TabsPanel :tabs="countedGroups" />
            <TabsContent value="Methods">
              <TabCard
                  title="Methods"
                  :elements="Object.values(filteredGroups.methods)"
                  :onclick="selectRow"
                  class="w-full max-w-full"
              />
            </TabsContent>
            <TabsContent value="Delegates">
              <TabCard
                  title="Delegates"
                  :elements="Object.values(filteredGroups.delegates)"
                  :onclick="selectRow"
                  class="w-full max-w-full"
              />
            </TabsContent>
            <TabsContent value="Enumerators">
              <TabCard
                  title="Enumerators"
                  :elements="Object.values(filteredGroups.enumerators)"
                  :onclick="selectRow"
                  class="w-full max-w-full"
              />
            </TabsContent>
            <TabsContent value="Classes">
              <TabCard
                  title="Classes"
                  :elements="Object.values(filteredGroups.classes)"
                  :onclick="selectRow"
                  class="w-full max-w-full"
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