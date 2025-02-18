<script setup lang="ts">
//import { File, ListFilter } from "lucide-vue-next";
//import { TabsList, TabsTrigger } from "@/components/ui/tabs";
//import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
//import { Badge } from "@/components/ui/badge";
const props = defineProps<{ tabs: { name: string, count: number }[] }>();
</script>

<template>
  <div class="flex flex-wrap items-center p-0 md:p-0">
    <TabsList class="flex flex-col md:flex-row w-[100%] md:w-auto  rounded-none md:rounded-md">
      <template v-for="(tab, index) in tabs" :key="index">
        <TabsTrigger v-if="tab.count > 0" :value="tab.name" class="w-full md:w-auto">
          <div class="flex justify-between">
            {{ tab.name }}
            <Badge class="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full !text-[0.625rem]">
              {{ tab.count }}
            </Badge>
          </div>
        </TabsTrigger>
      </template>
    </TabsList>
<!--    <div class="ml-auto flex items-center gap-2">
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
</template>