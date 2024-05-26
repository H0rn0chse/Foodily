<script setup lang="ts">
import { RouterView } from "vue-router";
import { useI18n } from "vue-i18n";
import SharedHeader from "@/components/SharedHeader.vue";
const { t } = useI18n();

function logout() {
  fetch("/logout", {
    method: "POST"
  });
}

</script>

<template>
  <v-app id="app"
    full-height
    theme="dark">
    <v-layout>
      <SharedHeader>
        <template #navigationList>
          <v-list-item link
            to="/"
            class="headerLink"
            active-class="activeLink">
            {{ t("home.linkTitle") }}
          </v-list-item>
          <v-list-item link
            to="/dinner"
            class="headerLink"
            active-class="activeLink">
            {{ t("dinner.linkTitle") }}
          </v-list-item>
          <v-list-item link
            to="/profile"
            class="headerLink"
            active-class="activeLink">
            {{ t("settings.linkTitle") }}
          </v-list-item>
          <v-list-item link
            to="/about"
            class="headerLink"
            active-class="activeLink">
            {{ t("about.linkTitle") }}
          </v-list-item>
          <v-list-item link>
            <v-btn type="submit"
              color="primary"
              @click="logout">
              {{ t("header.signOutBtn") }}
            </v-btn>
          </v-list-item>
        </template>
      </SharedHeader>
      <v-main scrollable>
        <RouterView :key="$route.path" />
      </v-main>
    </v-layout>
  </v-app>
</template>

<style scoped>
.reference {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-decoration: none;
}

.reference,
.reference:visited {
  color: unset;
}

.activeLink {
  font-weight: bold;
}
</style>
<style>
h1 {
  font-size: xx-large;
}

h2 {
  font-size: x-large;
}

a {
  color: unset;
}

.icon {
  width: 20pt;
  height: 20pt;
  margin: 0.2rem;
}

.gridTable {
  width: 30rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  justify-items: center;
  align-items: center;

  font-size: medium;
}

.gridTable h1 {
  font-size: small;
  font-weight: bold;
  text-transform: uppercase;
}

.gridTable .separator {
  grid-column: 1 / span 3;
  grid-row: 2;
  border-bottom: solid black 2px;
  margin-bottom: 0.1rem;
  margin-top: 0.1rem;
  width: 90%;
}

.gridTable .cell {
  margin: 0.1rem;
}
</style>
