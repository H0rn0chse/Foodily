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
  <v-app
    id="app"
    full-height
    theme="dark"
  >
    <v-layout>
      <SharedHeader>
        <template #navigationList>
          <v-list-item
            link
            to="/"
            class="headerLink"
            active-class="activeLink"
          >
            {{ t("home.linkTitle") }}
          </v-list-item>
          <v-list-item
            link
            to="/dinner"
            class="headerLink"
            active-class="activeLink"
          >
            {{ t("dinner.linkTitle") }}
          </v-list-item>
          <v-list-item
            link
            to="/profile"
            class="headerLink"
            active-class="activeLink"
          >
            {{ t("settings.linkTitle") }}
          </v-list-item>
          <v-list-item
            link
            to="/about"
            class="headerLink"
            active-class="activeLink"
          >
            {{ t("about.linkTitle") }}
          </v-list-item>
          <v-list-item link>
            <v-btn
              type="submit"
              color="primary"
              @click="logout"
            >
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

/* ========= Flex Helper ========= */
.flexRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.flexColumn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.flexColumn.center,
.flexRow.center {
  justify-content: center;
}
</style>
