<script setup lang="ts">
import { computed } from 'vue'

import { useSnackbar } from '../composables/useSnackbar'

const { state, hideSnackbar } = useSnackbar()

const snackbarClasses = computed(() => [
  'snackbar',
  `snackbar--${state.type}`,
])
</script>

<template>
  <transition name="snackbar-slide">
    <div
      v-if="state.isVisible"
      :class="snackbarClasses"
      role="status"
      aria-live="polite"
    >
      <p class="snackbar__message">{{ state.message }}</p>
      <button type="button" class="snackbar__close" @click="hideSnackbar" aria-label="Hinweis schließen">
        ×
      </button>
    </div>
  </transition>
</template>

<style scoped>
.snackbar {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: min(calc(100vw - 2rem), 420px);
  width: 100%;
  padding: 0.85rem 1.25rem;
  border-radius: 999px;
  box-shadow: 0 12px 28px rgba(31, 31, 36, 0.16);
  color: #ffffff;
  background: #2f3542;
  font-weight: 600;
  letter-spacing: 0.01em;
  z-index: 1000;
}

.snackbar__message {
  margin: 0;
  flex: 1;
}

.snackbar__close {
  appearance: none;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: inherit;
  border-radius: 999px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.snackbar__close:hover,
.snackbar__close:focus-visible {
  background: rgba(255, 255, 255, 0.28);
  outline: none;
  transform: scale(1.05);
}

.snackbar--success {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.snackbar--info {
  background: linear-gradient(135deg, #4e9bff, #2563eb);
}

.snackbar--error {
  background: linear-gradient(135deg, #ff5f6d, #d63031);
}

:deep(.snackbar-slide-enter-active),
:deep(.snackbar-slide-leave-active) {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

:deep(.snackbar-slide-enter-from),
:deep(.snackbar-slide-leave-to) {
  opacity: 0;
  transform: translate(-50%, 80%);
}
</style>
