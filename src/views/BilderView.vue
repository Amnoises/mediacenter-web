<template>
  <section class="view">
    <h1>Bilder</h1>
    <p>Organisiere und entdecke Galerien deiner Lieblingsmomente.</p>
    <FloatingActionButton aria-label="Neues Bild hinzufügen" @click="createImage" />
  </section>
</template>

<script setup lang="ts">
import FloatingActionButton from '../components/FloatingActionButton.vue';

const createImage = () => {
  const newImage = {
    id: Date.now(),
    title: 'Neues Bild',
    createdAt: new Date().toISOString(),
  };

  console.log('Neues Bild-Objekt erstellt:', newImage);
};
</script>

<style scoped>
.view {
  display: grid;
  place-items: center;
  padding: 4rem 1.5rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.125rem;
  margin: 0;
}
</style>
