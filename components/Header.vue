<template>
  <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
    <SidebarTrigger class="-ml-1" />
    <Separator orientation="vertical" class="mr-2 h-4" />
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem class="hidden md:block">
          <BreadcrumbLink href="#">
            Building Your Application
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator class="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>Data Fetching</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <form class="ml-auto flex-1 sm:flex-initial">
      <div class="relative">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
            type="search"
            placeholder="Search products..."
            class="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
        />
      </div>
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
</template>

<script setup lang="ts">
const config = useConfig();
</script>
