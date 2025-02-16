<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription, CardHeader, CardTitle,

} from '~/components/ui/card';
import type { MethodType } from '~/lib/manifest';
const props = defineProps<{
  method: MethodType;
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ method.name }}</CardTitle>
      <CardDescription>
        {{ method.description }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="mb-4">
        <code class="bg-secondary whitespace-nowrap p-[5px]">
          <span>native </span>
          <span class="text-primary">{{ method.retType?.type }}</span>
          <span>&nbsp{{ method.name }}(</span>
          <span v-if="method.paramTypes && method.paramTypes.length > 0">
                        <span v-for="(param, index) in method.paramTypes" :key="index">
                          <span class="text-primary">{{ param.type }}</span>
                          <span>&nbsp{{ param.name }}</span>
                          <span v-if="method.paramTypes.length - 1 !== index">,&nbsp</span>
                        </span>
                      </span>
          <span>)</span>
        </code>
      </div>
      <ul v-if="method.paramTypes && method.paramTypes.length > 0">
        <h4 class="text-lg font-semibold leading-none tracking-tight">Parameters</h4>
        <li v-for="(param, index) in method.paramTypes" :key="index">
          <strong class="text-primary">{{ param.type }}</strong> <strong>{{ param.name }}</strong>
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
    </CardContent>
  </Card>
</template>