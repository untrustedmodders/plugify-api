<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import CopyButton from "~/components/content/CopyButton.vue";
import { useDocStore } from '~/lib/docStore';

const props = defineProps<{
  klass: ClassType;
  group: string;
  url: string;
}>();

const root = ref(window.location.origin);
const store = useDocStore();

// Get methods from the current group to resolve method names
const groupMethods = computed(() => {
  const group = store.selectedDoc[props.group];
  return group?.methods || {};
});
</script>

<template>
  <Card>
    <CardHeader class="px-7">
      <CardTitle>
        {{ klass.name }}
        <CopyButton :code="`${root}?file=${url}#/${group}/${klass.name}`"/>
      </CardTitle>
      <CardDescription>
        {{ klass.description }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Handle Type Information -->
      <div class="mb-6">
        <h4 class="text-lg font-semibold leading-none tracking-tight mb-3">Handle Information</h4>
        <div class="bg-secondary p-4 rounded-md">
          <div class="flex gap-4">
            <div>
              <span class="text-muted-foreground">Handle Type:</span>
              <code class="ml-2 text-primary">{{ klass.handleType }}</code>
            </div>
            <div>
              <span class="text-muted-foreground">Invalid Value:</span>
              <code class="ml-2 text-primary">{{ klass.invalidValue }}</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Constructors -->
      <div v-if="klass.constructors && klass.constructors.length > 0" class="mb-6">
        <h4 class="text-lg font-semibold leading-none tracking-tight mb-3">Constructors</h4>
        <div class="bg-secondary rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[40%]">Method</TableHead>
                <TableHead class="w-[60%]">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="constructor in klass.constructors" :key="constructor">
                <TableCell class="align-top">
                  <a :href="`#/${group}/${constructor}`" class="text-primary hover:underline font-mono">
                    {{ constructor }}
                  </a>
                </TableCell>
                <TableCell class="align-top text-muted-foreground">
                  {{ groupMethods[constructor].description }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Destructor -->
      <div v-if="klass.destructor" class="mb-6">
        <h4 class="text-lg font-semibold leading-none tracking-tight mb-3">Destructor</h4>
        <div class="bg-secondary rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[40%]">Method</TableHead>
                <TableHead class="w-[60%]">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell class="align-top">
                  <a :href="`#/${group}/${klass.destructor}`" class="text-primary hover:underline font-mono">
                    {{ klass.destructor }}
                  </a>
                </TableCell>
                <TableCell class="align-top text-muted-foreground">
                  {{ groupMethods[klass.destructor].description }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Bindings/Methods -->
      <div v-if="klass.bindings && klass.bindings.length > 0" class="mb-6">
        <h4 class="text-lg font-semibold leading-none tracking-tight mb-3">Bindings</h4>
        <div class="bg-secondary rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[30%]">Name</TableHead>
                <TableHead class="w-[30%]">Method</TableHead>
                <TableHead class="w-[40%]">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="binding in klass.bindings" :key="binding.name">
                <TableCell class="text-muted-foreground hover:text-primary align-top font-semibold">
                  {{ binding.name }}
                </TableCell>
                <TableCell class="align-top">
                  <a
                    v-if="binding.method"
                    :href="`#/${group}/${binding.method}`"
                    class="text-primary hover:underline font-mono"
                  >
                    {{ binding.method }}
                  </a>
                  <span v-else class="text-muted-foreground italic">None</span>
                </TableCell>
                <TableCell class="align-top text-muted-foreground">
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
    </CardContent>
  </Card>
</template>
