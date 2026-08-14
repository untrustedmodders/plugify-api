<script setup lang="ts">
import {CardContent} from '@/components/ui/card';
import type {ParamType} from '~/lib/manifest';
import {definitionOf} from '~/lib/manifest';
const props = defineProps<{
  group: string | undefined;
  param: ParamType | undefined;
}>()
// A prototype/enum may be written as a name; resolveManifest has replaced those
// with the definition, so anything still a string names nothing and is skipped.
const prototype = computed(() => definitionOf(props.param?.prototype));
const enumerator = computed(() => definitionOf(props.param?.enum));
</script>

<template>
  <span v-if="prototype">
    <a :href="`#/${group}/${prototype.name}`" class="text-primary hover:underline" >
      {{ prototype.name }}
    </a>
  </span>
  <span v-else-if="enumerator">
    <a :href="`#/${group}/${enumerator.name}`" class="text-primary hover:underline" >
      {{ enumerator.name }}
    </a>
  </span>
  <span v-else class="text-primary">
    {{ param?.type }}
  </span>
  <strong>&nbsp{{ param?.name }}</strong>
  <CardContent>
    {{ param?.description }}
  </CardContent>
</template>
