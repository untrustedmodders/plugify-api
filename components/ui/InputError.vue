<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  modelValue: String,
  type: {
    type: String,
    default: 'text'
  },
  error: String,
  className: String
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex flex-col gap-1">
    <input
        :type="props.type"
        :value="props.modelValue"
        @input="emit('update:modelValue', $event.target.value)"
        :class="cn(
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.className
      )"
    />
    <p v-if="props.error" class="text-red-700 text-sm">{{ props.error }}</p>
  </div>
</template>
