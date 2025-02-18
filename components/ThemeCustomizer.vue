<template>
  <div class="grid gap-6">
    <div class="grid space-y-1">
      <h1 class="text-lg font-semibold text-foreground">
        Customize
      </h1>
      <p class="text-sm text-muted-foreground">
        Pick a style and color for the docs.
      </p>
    </div>
    <div class="space-y-1.5">
      <Label>Color</Label>
      <div class="grid grid-cols-3 gap-2">
        <template v-for="color in allColors" :key="color">
          <Button
              class="justify-start gap-2"
              variant="outline"
              :class="{ 'border-2 border-primary': theme === color }"
              @click="setTheme(color)"
          >
            <span class="flex size-5 items-center justify-center rounded-full" :style="{ backgroundColor: backgroundColor(color) }">
              <Check v-if="theme === color" :size="16" class="text-white" />
            </span>
            <span class="text-xs capitalize">{{ color }}</span>
          </Button>
        </template>
      </div>
    </div>
    <div class="space-y-1.5">
      <Label>Radius</Label>
      <div class="grid grid-cols-5 gap-2">
        <template v-for="r in RADII" :key="r">
          <Button
              class="justify-center gap-2"
              variant="outline"
              :class="{ 'border-2 border-primary': radius === r }"
              @click="setRadius(r)"
          >
            <span class="text-xs capitalize">{{ r }}</span>
          </Button>
        </template>
      </div>
    </div>
    <div v-if="darkModeToggle" class="space-y-1.5">
      <Label>Theme</Label>
      <div class="grid grid-cols-3 gap-2">
        <Button
            class="justify-center gap-2"
            variant="outline"
            :class="{ 'border-2 border-primary': colorMode.preference === 'light' }"
            @click="colorMode.preference = 'light'"
        >
          <Sun :size="16" />
          <span class="text-xs capitalize">Light</span>
        </Button>
        <Button
            class="justify-center gap-2"
            variant="outline"
            :class="{ 'border-2 border-primary': colorMode.preference === 'dark' }"
            @click="colorMode.preference = 'dark'"
        >
          <Moon :size="16" />
          <span class="text-xs capitalize">Dark</span>
        </Button>
        <Button
            class="justify-center gap-2"
            variant="outline"
            :class="{ 'border-2 border-primary': colorMode.preference === 'system' }"
            @click="colorMode.preference = 'system'"
        >
          <Monitor :size="16" />
          <span class="text-xs capitalize">System</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon, Check, Monitor } from 'lucide-vue-next'
import { themes } from '@/lib/registry/themes';
import type { Color } from "~/types";

const { themeClass, theme, radius, setTheme, setRadius } = useThemes();
const { darkModeToggle } = useConfig().value.header;

const props = defineProps<{
  allColors: Color[]
}>()

const RADII = [0, 0.25, 0.5, 0.75, 1];

function backgroundColor(color: Color) {
  const bg = themes.find(theme => theme.name === color);
  return `hsl(${bg?.activeColor.light})`;
}

const colorMode = useColorMode();
</script>
