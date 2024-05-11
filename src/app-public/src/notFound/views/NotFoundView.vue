<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <div id="notFoundContent">
    <v-btn href="/"
      color="primary">
      {{ t("notFound.back") }}
    </v-btn>
    <div class="messageContainer">
      <img src="@/assets/notFound.png"
        style="max-width: 20rem;">
      <h1>{{ t("notFound.message") }}</h1>
    </div>
  </div>
</template>

<style scoped>
#notFoundContent {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 2rem;
}

.messageContainer {
  width: 100%;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 2rem;

  padding-top: 2rem;
}

.messageContainer>* {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: min-content;
}
</style>
