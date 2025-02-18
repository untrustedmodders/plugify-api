<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { BaseType } from '~/lib/manifest';
const props = defineProps<{
  title: string;
  elements: BaseType[];
  onclick: (name?: string) => void;
}>()
</script>

<template>
  <Card>
    <CardHeader class="px-7">
      <CardTitle>
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[30%]">Name</TableHead>
            <TableHead class="w-[60%]">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody v-for="element in elements" :key="element.name">
          <TableRow
              @click.stop="onclick(element.name)"
              class="cursor-pointer"
          >
            <TableCell class="text-primary align-top">{{ element.name }}</TableCell>
            <TableCell class="align-top">{{ element.description }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>