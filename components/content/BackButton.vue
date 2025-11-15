<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useRouter } from '#app'
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";

const props = defineProps<{
  group: string
}>()

const router = useRouter()

function back() {
  router.push(`#/${props.group}`)
}
</script>

<template>
  <Tooltip :delay-duration="100">
    <TooltipTrigger as-child>
      <Button
          size="icon"
          variant="ghost"
          class="h-7 w-7 [&_svg]:size-3.5"
          @click="back()"
      >
        <span class="sr-only">Back</span>
        <ArrowLeft />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Back to {{ group }}</TooltipContent>
  </Tooltip>
</template>