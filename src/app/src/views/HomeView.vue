<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <main>
    <h1>
      <h1>{{ t("home.header") }}</h1>
    </h1>
    <div style="display: flex; align-items: center;">
      <img src="@/assets/image.png"
        style="max-width: 20rem;">
      <!-- <VaImage src=" /src/public/assets/image.png"></VaImage> -->
      <!-- <VaForm>

      </VaForm> -->
      <!-- <form action="/logout" method="post">
        <VaButton type="submit">Sign Out</VaButton> -->
      <!-- <button class="logout" type="submit">Sign out</button> -->
      <!-- <input type="hidden" name="_csrf" value="<%= csrfToken %>"> -->
      <!-- </form> -->
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
