<template>
  <nav class="top-nav">
    <ul>
      <li><RouterLink to="/movies">Filme</RouterLink></li>
      <li><RouterLink to="/bilder">Bilder</RouterLink></li>
      <li><RouterLink to="/studio">Studio</RouterLink></li>
      <li><RouterLink to="/darsteller">Darsteller</RouterLink></li>
    </ul>
  </nav>
</template>

<style scoped>
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

.top-nav a.router-link-active {
  color: #f0b429;
}

.top-nav a:hover,
.top-nav a:focus-visible {
  color: #f0b429;
}
</style>
