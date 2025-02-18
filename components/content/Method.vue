<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import type { MethodType } from '~/lib/manifest';
import CopyButton from "~/components/content/CopyButton.vue";
const props = defineProps<{
  method: MethodType;
  group: string;
  url: string;
}>()
const root = ref(window.location.origin);
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>
        {{ method.name }}
        <CopyButton :code="`${root}?file=${url}#/${group}/${method.name}`"/>
      </CardTitle>
      <CardDescription>
        {{ method.description }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <code class="bg-secondary p-[5px] whitespace-pre overflow-x-auto max-w-[80%] absolute rounded-md">
        <span>native </span>
        <span class="text-primary">{{ method.retType?.type }}</span>
        <span>&nbsp{{ method.name }}(</span>
        <span v-if="method.paramTypes && method.paramTypes.length > 0">
            <span v-for="(param, index) in method.paramTypes" :key="index">
              <span v-if="param.prototype">
                <a :href="`${method.group}/${param.prototype?.name}`" class="text-primary hover:underline" >
                  {{ param.prototype?.name }}
                </a>
              </span>
              <span v-else-if="param.enum">
                <a :href="`${method.group}/${param.enum?.name}`" class="text-primary hover:underline" >
                  {{ param.enum?.name }}
                </a>
              </span>
              <span v-else class="text-primary">
                {{ param.type }}
              </span>
              <span>&nbsp{{ param.name }}</span>
              <span v-if="method.paramTypes.length - 1 !== index">,&nbsp</span>
            </span>
          </span>
        <span>)</span>
      </code>
      <div class="pt-[3.5rem]">
        <ul v-if="method.paramTypes && method.paramTypes.length > 0">
          <h4 class="text-lg font-semibold leading-none tracking-tight">Parameters</h4>
          <li v-for="(param, index) in method.paramTypes" :key="index">
            <span v-if="param.prototype">
              <a :href="`${method.group}/${param.prototype?.name}`" class="text-primary hover:underline" >
                {{ param.prototype?.name }}
              </a>
            </span>
            <span v-else-if="param.enum">
              <a :href="`${method.group}/${param.enum?.name}`" class="text-primary hover:underline" >
                {{ param.enum?.name }}
              </a>
            </span>
            <span v-else class="text-primary">
              {{ param.type }}
            </span>
            <strong>&nbsp{{ param.name }}</strong>
            <CardContent>
              {{ param.description }}
            </CardContent>
          </li>
        </ul>
        <ul v-if="method.retType && method.retType.type !== 'void'">
          <h4 class="text-lg font-semibold leading-none tracking-tight">Return</h4>
          <li>
            <strong class="mb-4 text-primary">{{ method.retType.type }}</strong> <strong>{{ method.retType.name }}</strong>
            <CardContent>
              {{ method.retType.description }}
            </CardContent>
          </li>
        </ul>
        <ul v-if="method.error">
          <h3 class="text-lg font-semibold leading-none tracking-tight">Error</h3>
          <li>
            <CardContent>
              {{ method.error }}
            </CardContent>
          </li>
        </ul>
      </div>
    </CardContent>
  </Card>
</template>