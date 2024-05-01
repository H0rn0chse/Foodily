<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <div id="homeContent">
    <h1>{{ t("home.title") }}</h1>
    <img src="@/assets/home.png"
      style="max-width: 20rem;">
    <v-btn color="primary" href="/login">
      {{ t("home.signIn") }}
    </v-btn>
  </div>
</template>

<style scoped>
#homeContent {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 2rem;
}

#homeContent > h1 {
  align-self: flex-start;
}
</style>
