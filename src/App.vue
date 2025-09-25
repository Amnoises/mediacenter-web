<template>
  <div class="app">
    <nav class="top-nav">
      <ul>
        <li><a href="#movies">Movie</a></li>
        <li><a href="#bilder">Bilder</a></li>
        <li><a href="#studio">Studio</a></li>
        <li><a href="#darsteller">Darsteller</a></li>
      </ul>
    </nav>

    <main class="content">
      <section>
        <h1 id="movies">Mediacenter Web</h1>
        <p>Leere Vue-Anwendung bereit zur Entwicklung.</p>
      </section>
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

.top-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #1f1f24;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.top-nav ul {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin: 0;
  padding: 1rem 2rem;
  list-style: none;
}

.top-nav a {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: color 0.2s ease;
}

.top-nav a:hover,
.top-nav a:focus-visible {
  color: #f0b429;
}

.content {
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
