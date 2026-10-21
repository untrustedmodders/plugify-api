<script setup lang="ts">
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
    <a :href="`#/${group}/${prototype.name}`" class="text-type underline decoration-dotted underline-offset-4 hover:decoration-solid" >
      {{ prototype.name }}
    </a>
  </span>
  <span v-else-if="enumerator">
    <a :href="`#/${group}/${enumerator.name}`" class="text-type underline decoration-dotted underline-offset-4 hover:decoration-solid" >
      {{ enumerator.name }}
    </a>
  </span>
  <span v-else class="text-type">
    {{ param?.type }}
  </span>
  <span v-if="param?.ref" class="text-type">&amp;</span>
  <span>&nbsp{{ param?.name }}</span>
</template>
