<script setup lang="ts">
import { RouterView } from "vue-router";
import SharedHeader from "@/components/SharedHeader.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();


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
            class="reference"
            active-class="activeLink"
          >
            {{ t("header.homeLink") }}
          </v-list-item>
          <v-list-item
            link
            to="/about"
            class="reference"
            active-class="activeLink"
          >
            {{ t("header.aboutLink") }}
          </v-list-item>
        </template>
      </SharedHeader>
      <v-main scrollable>
        <RouterView />
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
