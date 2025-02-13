<script setup lang="ts">
import { Check, ChevronsUpDown, Search, Plus, BadgeCheck, X, ListFilter, File } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from "#app";

// Import components from the custom library
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Badge
} from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
} from '@/components/ui/sidebar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import type {
  BaseType,
  EnumType,
  MethodType,
  ParamType,
  ManifestType,
  MethodMap,
  EnumMap
} from '~/lib/manifest';
import { useJsonCache } from '~/lib/useJsonCache';
const config = useConfig();

class GroupData {
  constructor(
      public methods: MethodMap = {},
      public delegates: MethodMap = {},
      public enumerators: EnumMap = {}
  ) {}
}

const database = ref<Record<string, Record<string, GroupData>>>({});
const groups = ref<Record<string, GroupData>>({});

function ProcessItem(
    param: ParamType,
    delgs: MethodMap,
    enums: EnumMap
): void {
  if (param.prototype && param.prototype.name) {
    if (!delgs[param.prototype.name]) {
      delgs[param.prototype.name] = param.prototype;
    }
    ProcessMethod(param.prototype, delgs, enums);
  } else if (param.enum && param.enum.name) {
    if (!enums[param.enum.name] && param.enum.values) {
      enums[param.enum.name] = param.enum;
    }
  }
}

function ProcessMethod(
    method: MethodType,
    delgs: MethodMap,
    enums: EnumMap
): void {
  method.paramTypes?.forEach(param => {
    ProcessItem(param, delgs, enums);
  });
  if (method.retType) {
    ProcessItem(method.retType, delgs, enums);
  }
}

function onDataFetched(key: string, manifest: ManifestType): void {
  if (manifest.exportedMethods === undefined) {
    return
  }

  const methodMap: Record<string, MethodMap> = manifest.exportedMethods.reduce((acc: Record<string, MethodMap>, item: MethodType) => {
    const group = item.group || manifest.friendlyName || "";
    if (!acc[group]) {
      acc[group] = {};
    }
    acc[group][item.name || ""] = item;
    return acc;
  }, {});

  for (const [group, methods] of Object.entries(methodMap)) {
    let delegates: MethodMap = {};
    let enumerators: EnumMap = {};
    for (const method of Object.values(methods)) {
      ProcessMethod(method, delegates, enumerators);
    }
    const data = new GroupData(
        methods,
        delegates,
        enumerators);
    database.value[key] ??= {};
    database.value[key][group] = data;
  }

  if (selectedManifest.value === key) {
    groups.value = database.value[key];
    activeManifest.value = manifest
  }
}

const urls = {
  s2sdk: 'https://raw.githubusercontent.com/untrustedmodders/plugify-source-2/refs/heads/main/s2sdk.pplugin.in',
};

const { data, isUpdating, fetchAndUpdate, addLink } = useJsonCache<ManifestType>(
  urls,
  onDataFetched,
  onDataFetched
);

const route = useRoute();
const router = useRouter();

const querySearch = ref('');
const searchMode = ref(false)
const mounting = ref(true)

onMounted(() => {
  mounting.value = false;
});

const selectedManifest = ref('s2sdk');
const selectedGroup = ref('');
const selectedMethod = ref('');

const foundMethod = ref<MethodType>();
const foundDelegate = ref<MethodType>();
const foundEnum = ref<EnumType>();

const filteredGroups = computed(() => {
  return groups.value[selectedGroup.value];
})

function onRouteChange(hash: string) {
  const fragments = hash.replace(/^#\//, "").split("/");
  switch (fragments.length) {
    case 1:
      selectedGroup.value = fragments[0];
      selectedMethod.value = '';
      break;
    case 2:
      selectedGroup.value = fragments[0];
      selectedMethod.value = fragments[1];
      break;
    default:
      return;
  }

  if (selectedGroup.value === 'search') {
    searchMode.value = true;
  } else {
    searchMode.value = false;
    querySearch.value = '';
  }

  let group = groups.value[selectedGroup.value];
  if (group !== undefined) {
    foundMethod.value = group.methods[selectedMethod.value];
    foundDelegate.value = group.delegates[selectedMethod.value];
    foundEnum.value = group.enumerators[selectedMethod.value];
  }
}

onRouteChange(router.currentRoute.value.hash);
watch(() => route.hash, (newHash, oldHash) => {
  onRouteChange(newHash);
});

const handleInput = (event: any) => {
  router.push(`#/search/${event.target.value}`);
};

const wasClicked = (link?: string) => {
  router.push(`#/${selectedGroup.value}/${link}`);
}

const activeManifest = ref<ManifestType | null>();

const setActiveManifest = (manifest: ManifestType | null) => {
  activeManifest.value = manifest;
}

import { Progress } from '@/components/ui/progress'

const progress = ref(13)

watchEffect((cleanupFn) => {
  const timer = setTimeout(() => progress.value = 66, 500)
  cleanupFn(() => clearTimeout(timer))
})

</script>

<template>
  <SidebarProvider>
    <Sidebar class="bg-card">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                    size="lg"
                    class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <BadgeCheck class="size-4" />
                  </div>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{{ activeManifest?.friendlyName }}</span>
<!--                    <span class="truncate text-xs">{{ activeManifest.plan }}</span>-->
                  </div>
                  <ChevronsUpDown class="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                  class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
                  :side-offset="4"
              >
                <DropdownMenuLabel class="text-xs text-muted-foreground">
                  Manifests
                </DropdownMenuLabel>
                <DropdownMenuItem
                    v-for="(manifest, index) in data"
                    :key="index"
                    class="gap-2 p-2"
                    @click="setActiveManifest(manifest)"
                >
                  <div class="flex size-6 items-center justify-center rounded-sm border">
                    <BadgeCheck class="size-4 shrink-0" />
                  </div>
                  {{ manifest?.friendlyName }}
                  <DropdownMenuShortcut>
                    <Button
                        aria-haspopup="true"
                        size="icon"
                        variant="ghost"
                        class="flex text-muted-foreground hover:text-primary rounded-full size-2 content-center mr-2"

                    >
                      <X class="h-4 w-4" />
                    </Button>
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="gap-2 p-2">
                  <div class="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus class="size-4" />
                  </div>
                  <div class="font-medium text-muted-foreground">
                    Add manifest
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div class="flex-1">
          <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
            <ul v-for="(data, group) in groups" :key="group">
              <a
                  :href="`#/${group}`"
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  v-bind:class="{ 'bg-muted' : group === selectedGroup }"
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
        <Breadcrumb>
          <BreadcrumbList v-if="selectedGroup.length > 0">
            <BreadcrumbItem class="hidden md:block">
              <BreadcrumbLink
                  :href="`#/${selectedGroup}`"
              >
                {{ selectedGroup }}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="selectedMethod.length > 0" class="hidden md:block" />
            <BreadcrumbItem v-if="selectedMethod.length > 0">
              <BreadcrumbPage>
                {{ selectedMethod }}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <form @submit.prevent class="ml-auto flex-1 sm:flex-initial">
        </form>
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
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="grid gap-6">
          <form class="relative" @submit.prevent>
            <Input placeholder="Search Query" class="pl-10" @input="handleInput" v-model="querySearch" />
            <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
              <Search class="size-6 text-muted-foreground" />
            </span>
          </form>
        </div>
        <div v-if="mounting">
          <Card>
            <Progress :model-value="33" />
          </Card>
        </div>
        <div v-else-if="searchMode">
        </div>
        <div v-else-if="foundMethod !== undefined">
          <MethodContent :method="foundMethod" />
        </div>
        <div v-else-if="filteredGroups !== undefined">
          <Tabs default-value="methods">
            <div class="flex items-center">
              <TabsList>
                <TabsTrigger value="methods">
                  <div class="flex justify-between">
                  Methods
                  <Badge class="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full !text-[0.625rem]">
                    {{ Object.values(filteredGroups.methods).length }}
                  </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="delegates">
                  <div class="flex justify-between">
                    Delegates
                    <Badge class="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full !text-[0.625rem]">
                      {{ Object.values(filteredGroups.delegates).length }}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="enumerators">
                  <div class="flex justify-between">
                    Enumerators
                    <Badge class="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full !text-[0.625rem]">
                      {{ Object.values(filteredGroups.enumerators).length }}
                    </Badge>
                  </div>
                </TabsTrigger>
              </TabsList>
<!--              <div class="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="outline" size="sm" class="h-7 gap-1 rounded-md px-3">
                      <ListFilter class="h-3.5 w-3.5" />
                      <span class="sr-only sm:not-sr-only">Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div class="items-top flex space-x-2">
                        <Checkbox id="terms1" />
                        <label
                            for="terms2"
                            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Fulfilled
                        </label>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div class="items-top flex space-x-2">
                        <Checkbox id="terms1" />
                        <label
                            for="terms2"
                            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Declined
                        </label>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div class="items-top flex space-x-2">
                        <Checkbox id="terms1" />
                        <label
                            for="terms2"
                            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Refunded
                        </label>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" class="h-7 gap-1 rounded-md px-3">
                  <File class="h-3.5 w-3.5" />
                  <span class="sr-only sm:not-sr-only">Export</span>
                </Button>
              </div>-->
            </div>
            <TabsContent value="methods">
              <ReferenceTable title="Methods" :elements="Object.values(filteredGroups.methods)" :onclick="wasClicked" />
            </TabsContent>
            <TabsContent value="delegates">
              <ReferenceTable title="Delegates" :elements="Object.values(filteredGroups.delegates)" :onclick="wasClicked" />
            </TabsContent>
            <TabsContent value="enumerators">
              <ReferenceTable title="Enumerators" :elements="Object.values(filteredGroups.enumerators)" :onclick="wasClicked" />
            </TabsContent>
          </Tabs>
        </div>
        <div v-else>
          <Card>
            <CardHeader>
              <CardTitle class="mb-5">Plugify API Generator</CardTitle>
              <CardDescription>
                <p class="mb-5">Search by name, parameter, or return type via the search bar above. Or click on each individual includes to inspect their contents.</p>
                <p class="mb-5">For additional information, visit the Plugify Scripting Wiki.</p>
                <p class="mb-5">For feedbacks regarding this site, visit discord.</p>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
      <Footer/>
    </SidebarInset>
  </SidebarProvider>
</template>