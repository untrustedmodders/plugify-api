<script setup lang="ts">
import { docLink } from '~/lib/docStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { EnumType } from '~/lib/manifest';
import DocHeading from "~/components/content/DocHeading.vue";

const props = defineProps<{
  enumerator: EnumType;
  group: string;
  url: string;
}>()
// useRequestURL works on the server too, unlike window.location
const root = useRequestURL().origin;
</script>

<template>
  <article>
    <DocHeading
        kind="Enum"
        :title="enumerator.name"
        :description="enumerator.description"
        :link="docLink(root, url, `${group}/${enumerator.name}`)"
    />
    <section v-if="enumerator.values">
      <h2 class="mb-4 mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight">Values</h2>
      <div class="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="min-w-[120px] md:w-[35%]">Name</TableHead>
              <TableHead class="min-w-[80px] md:w-[15%]">Value</TableHead>
              <TableHead class="min-w-[200px] md:w-[50%]">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="element in enumerator.values" :key="element.name">
              <TableCell class="align-top font-mono font-medium whitespace-nowrap md:whitespace-normal">{{ element.name }}</TableCell>
              <TableCell class="align-top font-mono whitespace-nowrap text-type">{{ element.value }}</TableCell>
              <TableCell class="align-top break-words text-muted-foreground">{{ element.description }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  </article>
</template>
