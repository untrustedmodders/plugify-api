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
  <Card class="rounded-none md:rounded-md">
    <CardHeader class="p-5 md:p-5">
      <CardTitle>
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent class="p-2 md:p-5">
      <div class="bg-secondary rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[40%]">Name</TableHead>
              <TableHead class="w-[60%]">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody v-for="element in elements" :key="element.name">
            <TableRow
                @click.stop="onclick(element.name)"
                class="cursor-pointer"
            >
              <TableCell class="text-muted-foreground hover:text-primary align-top">{{ element.name }}</TableCell>
              <TableCell class="align-top break-words">{{ element.description }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>