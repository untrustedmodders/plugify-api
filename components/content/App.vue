<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from '#app';
import { useDocStore, manifestTitle } from '~/lib/docStore'

// Scroll position tracking for hash-based routing
const scrollPositions = new Map<string, number>()

// Active tab tracking per group
const activeTabPerGroup = new Map<string, string>()
const currentTab = ref('Methods')

import {
  Tabs,
  TabsContent,
} from '@/components/ui/tabs'
import { TooltipProvider } from 'radix-vue'

import Spinner from '~/components/layout/Spinner.vue';
import HashBreadcrumb from '~/components/layout/HashBreadcrumb.vue';
import Home from '~/components/layout/Home.vue';
import DocsLayout from '~/components/layout/DocsLayout.vue';

const route = useRoute();
const router = useRouter();
const store = useDocStore();

useHead({
  title: () => `Plugify API ${store.selectedGroup ? ` :: ${store.selectedGroup}` : ``} ${store.selectedItem ? ` :: ${store.selectedItem}` : ``}`,
});

onMounted(() => {
  // The hash never reaches the server, so it is read only after hydration;
  // reading it during setup made the client render differ from the server's
  store.onRouteChange(router.currentRoute.value.hash);
  store.initDB(route.query.file);
})

const countedGroups = computed(() => {
  const group = store.selectedDoc?.[store.selectedGroup];
  if (!group) return [];
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
const singular: Record<string, string> = { Methods: 'method', Delegates: 'delegate', Enumerators: 'enumerator', Classes: 'class' };
// The store's field for each tab
const tabKeys = { Methods: 'methods', Delegates: 'delegates', Enumerators: 'enumerators', Classes: 'classes' } as const;
const filteredGroups = computed(() => store.selectedDoc?.[store.selectedGroup]);
const isRefreshing = computed(() => store.isRefreshing[store.selectedDocUrl]);

// A link to a group the selected manifest does not have (or any group, when nothing is
// selected yet, e.g. on a first visit) is looked up in the other manifests
watch(() => [store.ready, store.selectedGroup, store.selectedDocUrl, store.docs[store.selectedDocUrl]] as const,
  async ([ready, group, url, doc]) => {
    if (!ready || !group || store.resolvingGroup) return
    if (url && !doc && !store.isInvalid[url]) return // the selected manifest is still loading
    if (doc?.[group]) return
    const found = await store.findManifestWithGroup(group)
    if (found && store.selectedGroup === group) store.openDoc(found)
  })

// Navigation keeps ?file= (see useDocNavigation); this updates it when the manifest changes
const { go, queryFor } = useDocNavigation()
watch(() => [store.ready, store.selectedDocUrl] as const, ([ready]) => {
  if (!ready) return
  const current = router.currentRoute.value
  const query = queryFor()
  if (current.query.file !== query.file) router.replace({ query, hash: current.hash })
})

// router.currentRoute rather than useRoute(): Nuxt's route lags behind hash navigation
watch(() => router.currentRoute.value.hash, (newHash) => {
  store.onRouteChange(newHash);
});

// Coming back from a detail page to its group restores the list's scroll position;
// any other move (home to a group, group to group, list to a detail page) starts at the top
watch(() => [store.selectedGroup, store.selectedItem] as const, ([group, item], [oldGroup, oldItem]) => {
  if (oldItem && !item && group && group === oldGroup) {
    restoreScrollPosition()
  } else {
    nextTick(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  }
});

const TAB_NAMES = ['Methods', 'Delegates', 'Enumerators', 'Classes']

// The tab named in the URL (#/group?tab=classes), so a link can open a group on a given tab
function tabFromUrl() {
  const value = store.selectedTab.toLowerCase()
  return TAB_NAMES.find(name => name.toLowerCase() === value)
}

// Picks the tab from the URL, else the one saved for the group, falling back to
// the first non-empty tab (a group may hold only classes, so 'Methods' can be empty)
function pickTab(group: string) {
  const wanted = [tabFromUrl(), activeTabPerGroup.get(group), 'Methods']
  const content = store.selectedDoc?.[group]
  if (!content) return wanted.find(Boolean) as string
  const counts: Record<string, number> = {
    Methods: Object.keys(content.methods).length,
    Delegates: Object.keys(content.delegates).length,
    Enumerators: Object.keys(content.enumerators).length,
    Classes: Object.keys(content.classes).length,
  }
  return wanted.find(name => name && counts[name] > 0)
    || TAB_NAMES.find(name => counts[name] > 0)
    || 'Methods'
}

// Watch for group changes, the doc arriving or a ?tab= change, and pick the active tab
watch(() => [store.selectedGroup, store.selectedDoc, tabFromUrl()] as const, ([newGroup]) => {
  if (newGroup) {
    currentTab.value = pickTab(newGroup)
  }
});

// Save active tab when it changes
watch(currentTab, (newTab) => {
  if (store.selectedGroup && newTab) {
    activeTabPerGroup.set(store.selectedGroup, newTab)
  }
});

// Mirror the active tab of the group view into the hash (#/group?tab=classes) so its
// URL can be shared; links to a group carry no tab, so this also runs on group changes
watch(() => [currentTab.value, store.selectedGroup, store.selectedItem, store.selectedTab] as const, ([tab, group, item, urlTab]) => {
  if (!group || item) return
  const value = tab.toLowerCase()
  if (urlTab !== value) {
    router.replace({ query: queryFor(), hash: `#/${group}?tab=${value}` })
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
  go(`#/${store.selectedGroup}/${name}`);
}
function selectGroup(name?: string) {
  // Save scroll position before navigating to another group
  saveScrollPosition()
  go(`#/${name}`);
}

</script>

<template>
  <!-- Tooltips (e.g. copy buttons) need a provider in every layout, not only the sidebar one -->
  <TooltipProvider :delay-duration="0">
  <DocsLayout @select-group="selectGroup">
    <!-- Until the saved state and the linked manifest are in, show a spinner rather than
         flashing the home page before the linked API -->
    <template v-if="!store.ready || store.openingApi || (store.selectedGroup && (isRefreshing || store.resolvingGroup
        || (store.selectedDocUrl && !store.docs[store.selectedDocUrl] && !store.isInvalid[store.selectedDocUrl])))">
      <Spinner />
    </template>
    <template v-else-if="store.foundMethod || store.foundDelegate || store.foundEnum || store.foundClass">
      <HashBreadcrumb :fragments="store.fragments" :root="manifestTitle(store.selectedDocUrl)" class="mb-4" />
      <!-- Kinds share one namespace per group, so show every definition with this name -->
      <div class="flex flex-col gap-12">
        <Method v-if="store.foundMethod" :method="store.foundMethod" :group="store.selectedGroup" :url="store.selectedDocUrl" />
        <Method v-if="store.foundDelegate" kind="Delegate" :method="store.foundDelegate" :group="store.selectedGroup" :url="store.selectedDocUrl" />
        <Enum v-if="store.foundEnum" :enumerator="store.foundEnum" :group="store.selectedGroup" :url="store.selectedDocUrl" />
        <Class v-if="store.foundClass" :klass="store.foundClass" :group="store.selectedGroup" :url="store.selectedDocUrl" />
      </div>
    </template>
    <template v-else-if="store.selectedGroup && filteredGroups">
      <HashBreadcrumb :fragments="store.fragments" :root="manifestTitle(store.selectedDocUrl)" class="mb-4" />
      <h1 class="scroll-m-20 text-3xl font-bold tracking-tight md:text-4xl">{{ store.selectedGroup }}</h1>
      <p class="mb-6 mt-2 text-lg text-muted-foreground">
        {{ countedGroups.filter(tab => tab.count > 0).map(tab => `${tab.count} ${tab.count === 1 ? singular[tab.name] : tab.name.toLowerCase()}`).join(' · ') }}
      </p>
      <Tabs v-model="currentTab" :key="store.selectedGroup">
        <TabsPanel :tabs="countedGroups" />
        <TabsContent v-for="tab in countedGroups" :key="tab.name" :value="tab.name">
          <TabCard
              :title="tab.name"
              :elements="Object.values(filteredGroups[tabKeys[tab.name]])"
              :onclick="selectRow"
              :group="store.selectedGroup"
              :url="store.selectedDocUrl"
          />
        </TabsContent>
      </Tabs>
    </template>
    <template v-else>
      <Home @select-group="selectGroup" />
    </template>
  </DocsLayout>
  </TooltipProvider>
</template>
