<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from '#app';
import { useDocStore } from '~/lib/docStore'

// Import components from the custom library
import {
  Badge
} from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '~/components/ui/sidebar'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui/tabs'
import Spinner from '~/components/layout/Spinner.vue';
import SearchButton from '~/components/layout/SearchButton.vue';
import HashBreadcrumb from '~/components/layout/HashBreadcrumb.vue';
import Intro from '~/components/layout/Intro.vue';
import Footer from '~/components/layout/Footer.vue';
import Logo from '~/components/layout/Logo.vue';

const config = useConfig();
const route = useRoute();
const router = useRouter();
const store = useDocStore();

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
  ];
  return data;
});
const filteredGroups = computed(() => store.selectedDoc[store.selectedGroup]);
const isRefreshing = computed(() => store.isRefreshing[store.selectedDocUrl]);

store.onRouteChange(router.currentRoute.value.hash);
watch(() => route.hash, (newHash, oldHash) => {
  store.onRouteChange(newHash);
});

function handleInput(event: any) {
  router.push(`#/search/${event.target.value}`);
}

function selectRow(link?: string) {
  router.push(`#/${store.selectedGroup}/${link}`);
}
</script>

<template>
  <SidebarProvider>
    <Sidebar class="bg-card">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Logo/>
            <SearchButton/>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div class="flex-1">
          <template v-if="isRefreshing">
            <Spinner />
          </template>
          <nav v-else class="grid items-start px-2 text-sm font-medium lg:px-4">
            <ul v-for="(data, group) in store.selectedDoc" :key="group">
              <a
                  :href="`#/${group}`"
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  v-bind:class="{ 'bg-muted' : group === store.selectedGroup }"
                  v-if="Object.values(data.methods).length > 0"
              >
                {{ group }}
                <Badge class="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {{ Object.values(data.methods).length + Object.values(data.enumerators).length + Object.values(data.delegates).length }}
                </Badge>
              </a>
            </ul>
          </nav>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <HashBreadcrumb :fragments="store.fragments"/>
        <div class="flex flex-1 justify-end gap-2">
          <!--<LayoutSearchButton v-if="!config.search.inAside && config.search.style === 'input'" />-->
          <div class="flex">
            <!--<LayoutSearchButton v-if="!config.search.inAside && config.search.style === 'button'" />-->
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
      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="grid gap-6">
          <form class="relative" @submit.prevent>
            <Input placeholder="Search Query" class="pl-10" @input="handleInput" v-model="store.querySearch" />
            <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
              <Search class="size-6 text-muted-foreground" />
            </span>
          </form>
        </div>
        <template v-if="isRefreshing">
         <Spinner />
        </template>
        <template v-if="store.searchMode">
        </template>
        <template v-else-if="store.foundMode">
          <MethodContent :method="store.foundMethod" />
        </template>
        <template v-else-if="store.selectedDoc && filteredGroups">
          <Tabs default-value="Methods">
            <TabsPanel :tabs="countedGroups"/>
            <TabsContent value="Methods">
              <ReferenceTable title="Methods" :elements="Object.values(filteredGroups.methods)" :onclick="selectRow" />
            </TabsContent>
            <TabsContent value="Delegates">
              <ReferenceTable title="Delegates" :elements="Object.values(filteredGroups.delegates)" :onclick="selectRow" />
            </TabsContent>
            <TabsContent value="Enumerators">
              <ReferenceTable title="Enumerators" :elements="Object.values(filteredGroups.enumerators)" :onclick="selectRow" />
            </TabsContent>
          </Tabs>
        </template>
        <template v-else>
          <Intro/>
        </template>
      </div>
      <Footer/>
    </SidebarInset>
  </SidebarProvider>
</template>