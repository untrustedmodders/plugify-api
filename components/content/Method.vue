<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import type { MethodType } from '~/lib/manifest';
import CopyButton from "~/components/content/CopyButton.vue";
import Parameter from "~/components/content/Parameter.vue";
import Signature from "~/components/content/Signature.vue";
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
      <div class="mb-4 overflow-x-auto">
        <code class="bg-secondary p-2 md:p-[5px] whitespace-pre block w-full rounded-md text-xs md:text-sm">
          <span>native </span>
          <Signature :group="method.group" :param="method.retType"/>
          <span>{{ method.name }}(</span>
          <span v-if="method.paramTypes && method.paramTypes.length > 0">
            <span v-for="(param, index) in method.paramTypes" :key="index">
              <Signature :group="method.group" :param="param"/>
              <span v-if="method.paramTypes.length - 1 !== index">,&nbsp</span>
            </span>
          </span>
          <span>)</span>
        </code>
      </div>
      <div>
        <ul v-if="method.paramTypes && method.paramTypes.length > 0">
          <h4 class="text-lg font-semibold leading-none tracking-tight pb-3">Parameters</h4>
          <li v-for="(param, index) in method.paramTypes" :key="index">
            <Parameter :group="method.group" :param="param"/>
          </li>
        </ul>
        <ul v-if="method.retType && method.retType.type !== 'void'">
          <h4 class="text-lg font-semibold leading-none tracking-tight pb-3">Return</h4>
          <li>
            <Parameter :group="method.group" :param="method.retType"/>
          </li>
        </ul>
        <ul v-if="method.error">
          <h3 class="text-lg font-semibold leading-none tracking-tight pb-3">Error</h3>
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