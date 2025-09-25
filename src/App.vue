<script setup lang="ts">
import { RouterView } from './router'

import TopNavigation from './components/TopNavigation.vue'
</script>

<template>
  <div class="app">
    <TopNavigation />

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f6f7fb;
  color: #1f1f24;
}

.content {
  min-height: calc(100vh - 72px);
}
</style>
