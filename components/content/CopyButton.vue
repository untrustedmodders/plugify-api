<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useClipboard } from '@vueuse/core'
import { toRefs } from 'vue'

const props = withDefaults(defineProps<{
  code?: string
}>(), {
  code: '',
})
const { code } = toRefs(props)

const { copy, copied } = useClipboard({ source: code })
</script>

<template>
  <Tooltip :delay-duration="100">
    <TooltipTrigger as-child>
      <Button
          size="icon"
          variant="outline"
          class="h-7 w-7 [&_svg]:size-3.5"
          @click="copy()"
      >
        <span class="sr-only">Copy</span>
        <Icon name="lucide:check" v-if="copied" />
        <Icon name="lucide:link" v-else />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Copy url</TooltipContent>
  </Tooltip>
</template>