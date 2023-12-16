<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <main>
    <VaButton>
      <a href="/">{{ t("notFound.back") }}</a>
    </VaButton>
    <div class="messageContainer">
      <img src="@/assets/notFound.png"
        style="max-width: 20rem;">
      <h1>{{ t("notFound.message") }}</h1>
    </div>
  </main>
</template>

<style scoped>
h1 {
  font-size: xx-large;
  padding-left: 2rem;
}

.messageContainer {
  display: flex;
  align-items: center;
  padding-top: 2rem;
}

a {
  color: unset;
}
</style>
