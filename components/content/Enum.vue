<script setup lang="ts">import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { EnumType } from '~/lib/manifest';
import CopyButton from "~/components/content/CopyButton.vue";
import BackButton from "~/components/content/BackButton.vue";

const props = defineProps<{
  enumerator: EnumType;
  group: string;
  url: string;
}>()
// useRequestURL works on the server too, unlike window.location
const root = useRequestURL().origin;
</script>

<template>
  <Card>
    <CardHeader class="px-7">
      <CardTitle class="break-all">
        <BackButton :group="group" />
        {{ enumerator.name }}
        <CopyButton :code="`${root}?file=${url}#/${group}/${enumerator.name}`"/>
      </CardTitle>
      <CardDescription>
        {{ enumerator.description }}
      </CardDescription>
    </CardHeader>
    <CardContent v-if="enumerator.values">
      <div class="bg-secondary rounded-md overflow-x-auto">
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
              <TableCell class="text-muted-foreground hover:text-primary align-top whitespace-nowrap md:whitespace-normal">{{ element.name }}</TableCell>
              <TableCell class="align-top font-mono whitespace-nowrap">{{ element.value }}</TableCell>
              <TableCell class="align-top break-words">{{ element.description }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>