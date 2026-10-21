<script setup lang="ts">
import CopyButton from "~/components/content/CopyButton.vue";

// The title block of a method, delegate, enum or class page, styled like plugify.net docs
defineProps<{
  kind: string;
  title?: string;
  description?: string;
  link: string;
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-sm font-medium text-muted-foreground">{{ kind }}</span>
    <h1 class="flex flex-wrap items-center gap-2 scroll-m-20 text-3xl font-bold tracking-tight [overflow-wrap:anywhere] md:text-4xl">
      {{ title }}
      <CopyButton :code="link" />
    </h1>
    <p v-if="description" class="text-lg text-muted-foreground">{{ description }}</p>
  </div>
</template>
