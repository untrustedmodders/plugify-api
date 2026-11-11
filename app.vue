<template>
  <App />
</template>

<script setup lang="ts">
import { findManifestBySlug, slugFromPath } from '~/lib/manifests';

const config = useConfig();
const { themeClass, radius } = useThemes();

// Link previews (Discord, Telegram, X) are built from the static HTML: the crawler
// runs no script and never sees the #/ hash, and ?file= gets the same file as /.
// The image must be an absolute URL.
const siteUrl = 'https://api.plugify.net';
// A listed manifest has an address of its own (/s2sdk), prerendered as a page, so a link
// to it gets the manifest's name and description
const manifest = findManifestBySlug(slugFromPath(useRoute().path));
const title = manifest?.name ? `Plugify API :: ${manifest.name}` : 'Plugify API';
// The preview reads better with the plugin first
const previewTitle = manifest?.name ? `${manifest.name} · Plugify API` : 'Plugify API';
const description = manifest?.description
  || 'API reference for Plugify plugins: the methods, delegates, enums and classes exported by Source 2 SDK, PolyHook, DynCall, Configs, Permissions and Translations.';
const pageUrl = manifest ? `${siteUrl}/${manifest.slug}` : siteUrl;
const image = `${siteUrl}${config.value.site.ogImage}`;

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogSiteName: 'Plugify',
  ogUrl: pageUrl,
  ogTitle: previewTitle,
  ogDescription: description,
  ogImage: image,
  ogImageWidth: 1920,
  ogImageHeight: 1080,
  ogImageAlt: 'Plugify',
  twitterCard: 'summary_large_image',
  twitterTitle: previewTitle,
  twitterDescription: description,
  twitterImage: image,
});

useServerHead({
  bodyAttrs: {
    class: themeClass.value,
    style: `--radius: ${radius.value}rem;`,
  },
});
</script>