<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useI18n } from "vue-i18n";
import SharedHeader from "@/components/SharedHeader.vue";
const { t } = useI18n();
</script>

<template>
  <div id="app">
    <SharedHeader id="app">
      <template #right>
        <va-navbar-item id="headerItemsRight">
          <RouterLink to="/"
            class="headerLink"
            active-class="activeLink">
            {{ t("header.homeLink") }}
          </RouterLink>
          <RouterLink to="/profile"
            class="headerLink"
            active-class="activeLink">
            {{ t("header.settingsLink") }}
          </RouterLink>
          <RouterLink to="/about"
            class="headerLink"
            active-class="activeLink">
            {{ t("header.aboutLink") }}
          </RouterLink>
          <form action="/logout"
            method="post">
            <VaButton type="submit">{{ t("header.signOutBtn") }}</VaButton>
          </form>
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

#headerItemsRight {
  display: flex;
  align-items: center;
}

#headerItemsRight>* {
  padding: 0 0.5rem;
}

#main {
  grid-area: "app";
  overflow: scroll;
  padding: 2rem;
}

.headerLink,
.headerLink:visited {
  color: unset;
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
