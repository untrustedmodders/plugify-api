<script setup lang="ts">
import type {ParamType} from '~/lib/manifest';
import Signature from "~/components/content/Signature.vue";
const props = defineProps<{
  group: string | undefined;
  param: ParamType | undefined;
}>()
</script>

<template>
  <div class="flex flex-col gap-1 p-4">
    <div class="flex flex-wrap items-baseline gap-x-2 font-mono text-sm">
      <span v-if="param?.name" class="font-semibold text-foreground">{{ param.name }}</span>
      <Signature :group="group" :param="param ? { ...param, name: undefined } : undefined" />
      <span v-if="param?.alias?.name" class="text-xs text-muted-foreground">alias {{ param.alias.name }}</span>
    </div>
    <p v-if="param?.description" class="text-sm text-muted-foreground">{{ param.description }}</p>
  </div>
</template>
