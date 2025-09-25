<template>
  <section class="view">
    <h1>Studio</h1>
    <p>Verwalte Produktionen, Projekte und neue Ideen an einem Ort.</p>
    <FloatingActionButton aria-label="Neues Studio-Projekt hinzufügen" @click="createProject" />
  </section>
</template>

<script setup lang="ts">
import FloatingActionButton from '../components/FloatingActionButton.vue';

const createProject = () => {
  const newProject = {
    id: Date.now(),
    title: 'Neues Projekt',
    createdAt: new Date().toISOString(),
  };

  console.log('Neues Studio-Projekt erstellt:', newProject);
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
