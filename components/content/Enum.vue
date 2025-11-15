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
      <div class="bg-secondary rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[40%]">Name</TableHead>
              <TableHead class="w-[60%]">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody v-for="element in enumerator.values" :key="element.name">
            <TableRow>
              <TableCell class="text-muted-foreground hover:text-primary align-top">{{ element.name }}</TableCell>
              <TableCell class="align-top">{{ element.description }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>