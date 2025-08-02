<script setup lang="ts">
import type {ParamType} from '~/lib/manifest';
const props = defineProps<{
  group: string | undefined;
  param: ParamType | undefined;
}>()
</script>

<template>
  <span v-if="param?.prototype">
    <a :href="`#/${group}/${param.prototype?.name}`" class="text-primary hover:underline" >
      {{ param.prototype?.name }}
    </a>
  </span>
  <span v-else-if="param?.enum">
    <a :href="`#/${group}/${param.enum?.name}`" class="text-primary hover:underline" >
      {{ param.enum?.name }}
    </a>
  </span>
  <span v-else class="text-primary">
    {{ param?.type }}
  </span>
  <span>&nbsp{{ param?.name }}</span>
</template>
