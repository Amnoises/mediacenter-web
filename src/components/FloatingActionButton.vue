<template>
  <button
    class="floating-action-button"
    type="button"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <span aria-hidden="true">+</span>
  </button>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';

const props = withDefaults(defineProps<{ ariaLabel?: string }>(), {
  ariaLabel: 'Neues Element hinzufügen',
});

const emit = defineEmits<{ (event: 'click'): void }>();

const onClick = () => emit('click');

const { ariaLabel } = toRefs(props);
</script>

<style scoped>
.floating-action-button {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  width: 25px;
  height: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ff7a59, #ff3d81);
  color: #ffffff;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 0.5rem 1.5rem rgba(255, 61, 129, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.floating-action-button:hover,
.floating-action-button:focus-visible {
  transform: scale(1.05);
  box-shadow: 0 0.75rem 2rem rgba(255, 61, 129, 0.45);
}

.floating-action-button:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 3px;
}

.floating-action-button span {
  pointer-events: none;
  margin-top: -2px;
}
</style>
