<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <main>
    <h1>
      <h1>{{ t("home.title") }}</h1>
    </h1>
    <div style="display: flex; align-items: center;">
      <img src="@/assets/image.png"
        style="max-width: 20rem;">
    </div>
  </main>
</template>

<style scoped>
h1 {
  font-size: xx-large;
}

a {
  color: unset;
}
</style>
