<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useRouter } from '#app'

const props = defineProps<{
  group: string
}>()

const router = useRouter()

function goBack() {
  router.push(`#/${props.group}`)
}
</script>

<template>
  <div class="flex items-center gap-2 mb-2">
    <Button variant="ghost" size="icon" @click="goBack" class="h-8 w-8">
      <ArrowLeft class="h-4 w-4" />
    </Button>
    <span class="text-sm text-muted-foreground">Back to {{ group }}</span>
  </div>
</template>