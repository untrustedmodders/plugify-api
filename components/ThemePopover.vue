<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="ghost" size="icon">
        <Paintbrush :size="16" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
        class="w-[23rem]"
        :align="breakpoints.isGreaterOrEqual('md') ? 'end' : 'center'"
    >
      <ThemeCustomizer :allColors="allColors" />
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { Paintbrush } from 'lucide-vue-next'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

const breakpoints = useBreakpoints(breakpointsTailwind);

import type { Color } from "~/types";
import {onMounted} from "vue";
const { themeClass, theme, radius, setTheme, setRadius } = useThemes();

// Create an array of color values
const allColors: Color[] = [
  'plugify',
  'default',
  'zinc',
  'slate',
  'stone',
  'gray',
  'neutral',
  'red',
  'rose',
  'orange',
  'green',
  'blue',
  'yellow',
  'violet',
];

onMounted(() => {
  setClassTheme();
  setStyleRadius();
})

// Whenever the theme value changes, update the document class list
watch(theme, () => {
  setClassTheme();
});

// Whenever the radius value changes, update the document style
watch(radius, () => {
  setStyleRadius();
});

function setClassTheme() {
  document.body.classList.remove(
      ...allColors.map(color => `theme-${color}`),
  );
  document.body.classList.add(themeClass.value);
}

function setStyleRadius() {
  document.body.style.setProperty('--radius', `${radius.value}rem`);
}

</script>
