<template>
  <!-- Fixed in the middle of the screen, so it does not move when the sidebar appears -->
  <div class="pointer-events-none fixed inset-0 z-30 flex items-center justify-center gap-2" role="status">
    <span v-for="i in 3" :key="i" class="loader-dot size-2.5 rounded-full bg-foreground" :style="{ animationDelay: `${(i - 1) * 0.16}s` }" />
    <span class="sr-only">Loading</span>
  </div>
</template>

<style scoped>
.loader-dot {
  animation: loader-pulse 1s ease-in-out infinite;
}

@keyframes loader-pulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1.2); opacity: 1; }
}
</style>
