<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import SharedHeader from "@/components/SharedHeader.vue";
import { inject } from "vue";

inject<Function>("registerVuesticConfigToLocale", () => { })();

</script>

<template>
  <div id="app">
    <SharedHeader id="header">
      <template #right>
        <va-navbar-item>
          <RouterLink to="/"
            class="reference"
            active-class="activeLink">Home</RouterLink>
        </va-navbar-item>
        <va-navbar-item>
          <RouterLink to="/about"
            class="reference"
            active-class="activeLink">About</RouterLink>
        </va-navbar-item>
      </template>
    </SharedHeader>
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

.reference {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.reference,
.reference:visited {
  color: unset;
}

.activeLink {
  text-decoration: underline;
}
</style>
