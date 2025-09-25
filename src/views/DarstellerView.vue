<template>
  <section class="view">
    <h1>Darsteller</h1>
    <p>Behalte Schauspielerinnen und Schauspieler sowie ihre Rollen im Blick.</p>
    <FloatingActionButton aria-label="Neuen Darsteller hinzufügen" @click="createActor" />
  </section>
</template>

<script setup lang="ts">
import FloatingActionButton from '../components/FloatingActionButton.vue';

const createActor = () => {
  const newActor = {
    id: Date.now(),
    name: 'Neue Darstellerin',
    createdAt: new Date().toISOString(),
  };

  console.log('Neues Darsteller-Objekt erstellt:', newActor);
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
