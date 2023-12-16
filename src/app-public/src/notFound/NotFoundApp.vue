<script setup lang="ts">
import NotFoundView from "./views/NotFoundView.vue";
import SharedHeader from "@/components/SharedHeader.vue";
import { inject } from "vue";

inject<Function>("registerVuesticConfigToLocale", () => { })();

</script>

<template>
  <div id="app">
    <SharedHeader id="header" />

    <main id="main">
      <NotFoundView />
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
</style>
