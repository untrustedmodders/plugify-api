<template>
  <div class="flex justify-center items-center">
    <NuxtLink v-if="logo.light && logo.dark" to="/public" class="flex">
      <NuxtImg :src="logo.light" class="h-10 m-4 dark:hidden" />
      <NuxtImg :src="logo.dark" class="hidden h-10 m-4 dark:block" />
      <span v-if="showTitle && title" class="ml-3 self-center font-bold">
        {{ title }}
      </span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { logo, title, showTitle } = useConfig().value.header;
</script>
