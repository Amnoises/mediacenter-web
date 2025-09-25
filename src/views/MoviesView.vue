<template>
  <section class="view">
    <h1>Filme</h1>
    <p>Hier könnten Highlights und Empfehlungen aus der Mediathek stehen.</p>
    <FloatingActionButton aria-label="Neuen Film hinzufügen" @click="createMovie" />
  </section>
</template>

<script setup lang="ts">
import FloatingActionButton from '../components/FloatingActionButton.vue'
import { useRouter } from '../router'

const router = useRouter()

const createMovie = () => {
  router.push('/movies/new')
}
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
