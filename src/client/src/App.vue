<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div id="app">
    <header id="header">
      <va-navbar>
        <template #left>
          <va-navbar-item class="logo">
            <img alt="Vue logo" class="logo" src="@/assets/logo.svg" />
          </va-navbar-item>
        </template>
        <template #right>
          <va-navbar-item>
            <RouterLink to="/" active-class="activeLink">Home</RouterLink>
          </va-navbar-item>
          <va-navbar-item>
            <RouterLink to="/about" active-class="activeLink">About</RouterLink>
          </va-navbar-item>
        </template>
      </va-navbar>
    </header>

    <main id="main">
      <RouterView id="mainContent" />
    </main>
  </div>
</template>

<style scoped>
#app {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 5rem auto;
  grid-template-areas:
    "header"
    "app";
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

#header {
  grid-area: "header";
}

#main {
  grid-area: "app";
  overflow: scroll;
  padding: 2rem;
}

.logo {
  width: 1.5rem;
}

.activeLink {
  text-decoration: underline;
}

/* @media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }
} */
</style>
