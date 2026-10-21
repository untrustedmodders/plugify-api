// https://nuxt.com/docs/api/configuration/nuxt-config
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import defaultManifests from "./manifests.json";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/icon',
    'shadcn-nuxt',
    '@pinia/nuxt',
    'nuxt-og-image',
    ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  components: {
    dirs: [
      {
        path: './components',
        ignore: ['**/*.ts'],
      },
    ],
  },
  colorMode: {
    classSuffix: '',
    disableTransition: true,
  },
  css: [
    join(currentDir, './assets/css/themes.css'),
  ],
  nitro: {
    static: true,
  },
  icon: {
    clientBundle: {
      scan: true,
      // The API cards take their icons from manifests.json, which the scan cannot see;
      // GitHub Pages has no server to fetch missing icons from, so bundle them
      icons: [
        ...defaultManifests.map(manifest => manifest.icon).filter((icon): icon is string => !!icon),
        // Header and footer links name their icons in app.config.ts, which the scan skips too
        'simple-icons:discord',
        'simple-icons:github',
      ],
      sizeLimitKb: 512,
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        baseUrl: '.',
      },
    },
  },
  app: {
    baseURL: '/',
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' }
      ]
    }
  }
})