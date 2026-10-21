<script lang="ts">
// How many rows each table has expanded to, kept across remounts so that coming
// back from a detail page can restore a scroll position past the first page
const shownRows = new Map<string, number>();
</script>

<script setup lang="ts">
import { docLink } from '~/lib/docStore';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge';
import type { BaseType } from '~/lib/manifest';
const props = defineProps<{
  title: string;
  elements: (BaseType & { deprecated?: string })[];
  onclick: (name?: string) => void;
  group: string;
  url: string;
}>()
// useRequestURL works on the server too, unlike window.location
const root = useRequestURL().origin;

// Rows are rendered in pages: a group with thousands of entries would otherwise
// block the page for seconds, like the search dialog did
const PAGE_SIZE = 50;
const tableKey = computed(() => `${props.url}|${props.group}|${props.title}`);
const limit = ref(shownRows.get(tableKey.value) ?? PAGE_SIZE);
watch(tableKey, (key) => {
  limit.value = shownRows.get(key) ?? PAGE_SIZE;
});
const visibleElements = computed(() => props.elements.slice(0, limit.value));
const remaining = computed(() => props.elements.length - visibleElements.value.length);

// A plain click opens the row in place (App saves the scroll position first);
// modified clicks fall through to the link so Ctrl/Shift+click open a new tab
function onRowClick(event: MouseEvent, name?: string) {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  props.onclick(name);
}

function showMore() {
  limit.value += PAGE_SIZE;
  shownRows.set(tableKey.value, limit.value);
}
</script>

<template>
  <div>
    <div class="overflow-x-auto rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="min-w-[120px] md:w-[40%]">Name</TableHead>
            <TableHead class="min-w-[200px] md:w-[60%]">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
              v-for="element in visibleElements"
              :key="element.name"
              @click="onRowClick($event, element.name)"
              class="cursor-pointer"
          >
            <TableCell class="align-top font-mono font-medium whitespace-nowrap md:whitespace-normal">
              <a :href="docLink(root, url, `${group}/${element.name}`)" class="underline-offset-4 hover:underline">
                {{ element.name }}
              </a>
              <Badge v-if="element.deprecated" variant="destructive" class="ml-2 font-sans text-[0.625rem]">deprecated</Badge>
            </TableCell>
            <TableCell class="align-top break-words text-muted-foreground">{{ element.description }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <div v-if="remaining > 0" class="flex justify-center pt-3">
      <Button variant="outline" size="sm" @click="showMore">
        Show more ({{ remaining }} remaining)
      </Button>
    </div>
  </div>
</template>
