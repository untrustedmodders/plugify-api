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
const props = defineProps<{
  enumerator: EnumType;
  group: string;
  url: string;
}>()
const root = ref(window.location.origin);
</script>

<template>
  <Card>
    <CardHeader class="px-7">
      <CardTitle>
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
              <TableHead class="min-w-[120px] md:w-[40%]">Name</TableHead>
              <TableHead class="min-w-[200px] md:w-[60%]">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody v-for="element in enumerator.values" :key="element.name">
            <TableRow>
              <TableCell class="text-muted-foreground hover:text-primary align-top whitespace-nowrap md:whitespace-normal">{{ element.name }}</TableCell>
              <TableCell class="align-top break-words">{{ element.description }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>