<template>
  <App />
</template>

<script setup lang="ts">
const config = useConfig();
const { themeClass, radius } = useThemes();

useSeoMeta({
  title: `${config.value.site.name} - Plugin Documentation`,
  ogTitle: 'Explore Plugins & Documentation',
  description: 'Browse and explore plugin manifests with detailed documentation.',
  ogDescription: 'Find plugin details, versions, and usage instructions.',
  ogImage: config.value.site.ogImage,
  twitterCard: 'summary_large_image',
});

useServerHead({
  bodyAttrs: {
    class: themeClass.value,
    style: `--radius: ${radius.value}rem;`,
  },
});
</script>