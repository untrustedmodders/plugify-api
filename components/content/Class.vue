<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ClassType } from '~/lib/manifest';
import DocHeading from "~/components/content/DocHeading.vue";
import { useDocStore, docLink } from '~/lib/docStore';

const props = defineProps<{
  klass: ClassType;
  group: string;
  url: string;
}>();

// useRequestURL works on the server too, unlike window.location
const root = useRequestURL().origin;
const store = useDocStore();

// Get methods from the current group to resolve method names
const groupMethods = computed(() => {
  const group = store.selectedDoc[props.group];
  return group?.methods || {};
});
</script>

<template>
  <article>
    <DocHeading
        kind="Class"
        :title="klass.name"
        :description="klass.description"
        :link="docLink(root, url, `${group}/${klass.name}`)"
    />
      <!-- Handle Type Information -->
      <div v-if="klass.handleType || klass.invalidValue">
        <h2 class="mb-4 mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight">Handle</h2>
        <dl class="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div v-if="klass.handleType" class="flex gap-2">
            <dt class="text-muted-foreground">Type</dt>
            <dd class="font-mono text-type">{{ klass.handleType }}</dd>
          </div>
          <div v-if="klass.invalidValue" class="flex gap-2">
            <dt class="text-muted-foreground">Invalid value</dt>
            <dd class="font-mono text-type">{{ klass.invalidValue }}</dd>
          </div>
        </dl>
      </div>

      <!-- Constructors -->
      <div v-if="klass.constructors && klass.constructors.length > 0" >
        <h2 class="mb-4 mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight">Constructors</h2>
        <div class="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="min-w-[120px] md:w-[40%]">Method</TableHead>
                <TableHead class="min-w-[200px] md:w-[60%]">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="constructor in klass.constructors" :key="constructor">
                <TableCell class="align-top whitespace-nowrap md:whitespace-normal">
                  <a :href="`#/${group}/${constructor}`" class="font-mono font-medium underline-offset-4 hover:underline">
                    {{ constructor }}
                  </a>
                </TableCell>
                <TableCell class="align-top text-muted-foreground break-words">
                  {{ groupMethods[constructor]?.description }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Destructor -->
      <div v-if="klass.destructor" >
        <h2 class="mb-4 mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight">Destructor</h2>
        <div class="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="min-w-[120px] md:w-[40%]">Method</TableHead>
                <TableHead class="min-w-[200px] md:w-[60%]">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell class="align-top whitespace-nowrap md:whitespace-normal">
                  <a :href="`#/${group}/${klass.destructor}`" class="font-mono font-medium underline-offset-4 hover:underline">
                    {{ klass.destructor }}
                  </a>
                </TableCell>
                <TableCell class="align-top text-muted-foreground break-words">
                  {{ groupMethods[klass.destructor]?.description }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Bindings/Methods -->
      <div v-if="klass.bindings && klass.bindings.length > 0" >
        <h2 class="mb-4 mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight">Bindings</h2>
        <div class="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="min-w-[100px] md:w-[30%]">Name</TableHead>
                <TableHead class="min-w-[120px] md:w-[30%]">Method</TableHead>
                <TableHead class="min-w-[200px] md:w-[40%]">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="binding in klass.bindings" :key="binding.name">
                <TableCell class="align-top font-mono font-medium whitespace-nowrap md:whitespace-normal">
                  {{ binding.name }}
                </TableCell>
                <TableCell class="align-top whitespace-nowrap md:whitespace-normal">
                  <a
                    v-if="binding.method"
                    :href="`#/${group}/${binding.method}`"
                    class="font-mono font-medium underline-offset-4 hover:underline"
                  >
                    {{ binding.method }}
                  </a>
                  <span v-else class="text-muted-foreground italic">None</span>
                </TableCell>
                <TableCell class="align-top text-muted-foreground break-words">
                  <div v-if="binding.description">
                    {{ binding.description }}
                  </div>
                  <div v-else-if="binding.method && groupMethods[binding.method]">
                    {{ groupMethods[binding.method].description }}
                  </div>
                  <div v-else class="italic">
                    No description available
                  </div>
                  <!-- Show ownership info for return alias -->
                  <div v-if="binding.retAlias && binding.retAlias.name" class="mt-1 text-xs">
                    <Badge variant="secondary" class="text-xs">
                      Returns: {{ binding.retAlias.name }}
                      <span v-if="binding.retAlias.owner !== undefined">
                        ({{ binding.retAlias.owner ? 'owned' : 'borrowed' }})
                      </span>
                    </Badge>
                  </div>
                  <!-- Show parameter aliases -->
                  <div v-if="binding.paramAliases && binding.paramAliases.length > 0" class="mt-1 text-xs">
                    <Badge
                      v-for="(param, idx) in binding.paramAliases"
                      :key="idx"
                      variant="secondary"
                      class="text-xs mr-1"
                    >
                      Param: {{ param.name }}
                      <span v-if="param.owner !== undefined">
                        ({{ param.owner ? 'owned' : 'borrowed' }})
                      </span>
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
  </article>
</template>
