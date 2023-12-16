<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>


<template>
  <main>
    <h1>{{ t("home.header") }}</h1>
    <div style="display: flex; align-items: center;">
      <img src="@/assets/home.png"
        style="max-width: 20rem;">
      <!-- <VaImage src=" /src/public/assets/image.png"></VaImage> -->
      <VaButton href="/login">
        <a href=""></a>
        {{ t("home.signIn") }}
      </VaButton>
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
